"""Turns (song audio + arrangement timeline + preset) into the final,
un-mastered remix mix: beat-matched tempo, generated drums/bass/pads,
vocal treatment, and transition FX all synchronized to the beat grid.
"""
from __future__ import annotations

import bisect

import numpy as np
import librosa

from . import synth, effects
from .presets import get_preset, ENERGY_LEVELS, BASS_INTENSITIES, DRUM_INTENSITIES, TEMPO_MODES

STEPS = 16
NOTE_TO_SEMITONE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def note_to_freq(note_name: str, octave: int = 2) -> float:
    semitone = NOTE_TO_SEMITONE.get(note_name, 0)
    midi = (octave + 1) * 12 + semitone
    return 440.0 * (2 ** ((midi - 69) / 12))


def compute_target_bpm(bpm_original: float, tempo_mode: str, custom_bpm: float | None) -> float:
    if tempo_mode == "custom" and custom_bpm:
        return float(custom_bpm)
    factor = TEMPO_MODES.get(tempo_mode, 1.0)
    return round(bpm_original * factor, 1)


def time_stretch_stereo(y: np.ndarray, rate: float) -> np.ndarray:
    if abs(rate - 1.0) < 0.005:
        return y
    channels = [librosa.effects.time_stretch(np.ascontiguousarray(y[:, ch]), rate=rate) for ch in range(y.shape[1])]
    n = min(len(c) for c in channels)
    return np.stack([c[:n] for c in channels], axis=1)


def _thin_or_boost(pattern: list[int], density: float, seed: int, protect_first: bool = True) -> list[int]:
    rng = np.random.default_rng(seed)
    out = list(pattern)
    if density < 1.0:
        for i, v in enumerate(out):
            if v and not (protect_first and i == 0) and rng.random() > density:
                out[i] = 0
    elif density > 1.0:
        extra_chance = min(0.5, density - 1.0)
        for i, v in enumerate(out):
            if not v and rng.random() < extra_chance:
                out[i] = 1
    return out


def _block_for_time(arrangement: list[dict], t: float) -> dict:
    for block in arrangement:
        if block["start"] <= t < block["end"]:
            return block
    return arrangement[-1] if arrangement else {"drum_intensity": 0.5, "bass_intensity": 0.5, "filter": None, "type": "verse"}


def generate_beat_bass_pad(sr: int, duration: float, bpm: float, style_id: str, arrangement: list[dict],
                            key_info: dict, bass_intensity: str, drum_intensity: str) -> np.ndarray:
    preset = get_preset(style_id)
    n_samples = max(1, int(duration * sr))
    layer = np.zeros((n_samples, 2), dtype=np.float32)

    seconds_per_step = 60.0 / bpm / 4
    swing = preset.get("swing", 0) / 100.0
    bass_gain_mult = BASS_INTENSITIES.get(bass_intensity, 0.85)
    drum_gain_mult = DRUM_INTENSITIES.get(drum_intensity, 0.85)
    root_freq = note_to_freq(key_info.get("tonic", "C"), octave=2)
    brightness = preset.get("bass_brightness", 0.4)

    block_starts = [b["start"] for b in arrangement]

    total_steps = int(duration / seconds_per_step) + 1
    for global_step in range(total_steps):
        step_in_bar = global_step % STEPS
        t = global_step * seconds_per_step
        if step_in_bar % 2 == 1:
            t += swing * seconds_per_step * 0.5
        if t >= duration:
            break
        idx = bisect.bisect_right(block_starts, t) - 1
        block = arrangement[max(0, idx)] if arrangement else {"drum_intensity": 0.6, "bass_intensity": 0.5}

        drum_density = np.clip(block.get("drum_intensity", 0.6), 0, 1.5)
        rng_seed = global_step * 7919 + hash(style_id) % 1000
        for name, pattern in preset["pattern"].items():
            hits = _thin_or_boost(pattern, drum_density, rng_seed + hash(name) % 997)
            if hits[step_in_bar]:
                vel = (0.85 + (rng_seed % 23) / 100) * drum_gain_mult * (0.6 + drum_density * 0.5)
                sound = synth.DRUM_SYNTHS[name](sr, vel=min(1.6, vel))
                start_sample = int(t * sr)
                end_sample = min(n_samples, start_sample + len(sound))
                length = end_sample - start_sample
                if length > 0:
                    layer[start_sample:end_sample, 0] += sound[:length]
                    layer[start_sample:end_sample, 1] += sound[:length]

        bass_step = preset.get("bass_pattern", {}).get(step_in_bar)
        if bass_step is not None:
            bass_intensity_val = np.clip(block.get("bass_intensity", 0.6), 0, 1.5) * bass_gain_mult
            note_dur = seconds_per_step * 4
            freq = root_freq * (2 ** (bass_step / 12))
            note = synth.synth_bass_note(sr, freq, note_dur, amp=0.55 * bass_intensity_val, brightness=brightness)
            start_sample = int(t * sr)
            end_sample = min(n_samples, start_sample + len(note))
            length = end_sample - start_sample
            if length > 0:
                layer[start_sample:end_sample, 0] += note[:length]
                layer[start_sample:end_sample, 1] += note[:length]

    if preset.get("pad"):
        for block in arrangement:
            if block["type"] in ("breakdown", "intro", "outro", "verse"):
                start_sample = int(block["start"] * sr)
                seg_dur = block["end"] - block["start"]
                if seg_dur < 0.5:
                    continue
                pad = synth.synth_pad(sr, root_freq * 2, seg_dur, amp=0.3, brightness=brightness)
                end_sample = min(n_samples, start_sample + len(pad))
                length = end_sample - start_sample
                if length > 0:
                    layer[start_sample:end_sample, 0] += pad[:length]
                    layer[start_sample:end_sample, 1] += pad[:length]

    return layer


def _apply_snare_roll(master: np.ndarray, sr: int, end_sample: int, amp_scale: float) -> None:
    total = 1.2
    times, pos, cur = [], 0.0, total
    while pos < total:
        times.append(pos)
        cur *= 0.72
        pos += max(cur, 0.03)
    for rel in times:
        sample_pos = end_sample - int((total - rel) * sr)
        if sample_pos < 0:
            continue
        hit = synth.synth_snare(sr, amp=0.55 * amp_scale)
        end = min(master.shape[0], sample_pos + len(hit))
        length = end - sample_pos
        if length > 0:
            master[sample_pos:end, 0] += hit[:length]
            master[sample_pos:end, 1] += hit[:length]


def apply_block_fx(master: np.ndarray, sr: int, arrangement: list[dict], style_id: str,
                    extra_effects: list[str], fx_scale: float) -> np.ndarray:
    preset_fx = set(get_preset(style_id)["default_effects"]) | set(extra_effects or [])
    n = master.shape[0]

    for block in arrangement:
        start_s = max(0, min(n, int(block["start"] * sr)))
        end_s = max(0, min(n, int(block["end"] * sr)))
        if end_s <= start_s:
            continue
        fx_names = set(block.get("fx_at_start", [])) | set(block.get("fx_at_end", []))

        if block["filter"]:
            seg = master[start_s:end_s]
            if len(seg) > 64:
                master[start_s:end_s] = effects.apply_filter_sweep(
                    seg, sr, block["filter"]["start"], block["filter"]["end"], block["filter"]["kind"]
                )

        if block["type"] in ("drop", "chorus") and "flanger" in preset_fx:
            seg = master[start_s:end_s]
            if len(seg) > 64:
                master[start_s:end_s] = effects.apply_flanger(seg, sr, mix=0.2 * fx_scale)

        if "reverb_wash" in fx_names:
            seg = master[start_s:end_s]
            if len(seg) > 64:
                master[start_s:end_s] = effects.apply_reverb(seg, sr, mix=min(0.6, 0.35 * fx_scale), size=2.5)

        if "riser" in fx_names:
            riser_len = min(end_s - start_s, int(sr * 3.0))
            if riser_len > 256:
                riser = synth.synth_riser(sr, riser_len / sr, amp=min(0.9, 0.5 * fx_scale))
                seg_start = end_s - len(riser)
                master[seg_start:end_s, 0] += riser
                master[seg_start:end_s, 1] += riser

        if "impact" in fx_names:
            impact = synth.synth_impact(sr, amp=min(1.0, 0.6 * fx_scale))
            length = min(len(impact), n - start_s)
            if length > 0:
                master[start_s:start_s + length, 0] += impact[:length]
                master[start_s:start_s + length, 1] += impact[:length]

        if "snare_roll" in fx_names:
            _apply_snare_roll(master, sr, end_s, fx_scale)

        if "tape_stop" in fx_names:
            length = min(end_s - start_s, int(sr * 2.5))
            seg_start = end_s - length
            if length > 256:
                master = effects.apply_variable_speed_stop(master, sr, seg_start, length, curve="tape")

        if "beat_repeat" in fx_names or "stutter" in preset_fx:
            slice_len = max(64, int(sr * 0.12))
            seg_start = max(start_s, end_s - slice_len * 4)
            if end_s - seg_start > 64 and block["type"] == "buildup":
                master = effects.apply_stutter(master, sr, seg_start, slice_len, repeats=3)

        # user-toggled "continuous" effects, applied at the arrangement point
        # where a DJ would actually reach for them, rather than at an
        # arbitrary fixed spot in the track.
        if block["type"] in ("drop", "chorus"):
            if "phaser" in preset_fx:
                seg = master[start_s:end_s]
                if len(seg) > 64:
                    master[start_s:end_s] = effects.apply_phaser(seg, sr, mix=0.2 * fx_scale)
            if "reverse" in preset_fx and end_s - start_s > int(sr * 0.2):
                rev_len = min(int(sr * 0.2), end_s - start_s)
                master = effects.reverse_region(master, start_s - rev_len, start_s) if start_s - rev_len >= 0 else master
            if "sweep" in preset_fx:
                seg = master[start_s:min(end_s, start_s + int(sr * 1.5))]
                if len(seg) > 64:
                    master[start_s:start_s + len(seg)] = effects.apply_filter_sweep(seg, sr, 300, 14000, "lowpass")
        if block["type"] in ("breakdown", "outro"):
            if "delay" in preset_fx or "echo" in preset_fx:
                seg = master[start_s:end_s]
                if len(seg) > 64:
                    master[start_s:end_s] = effects.apply_delay(seg, sr, time_sec=0.3, feedback=0.35, mix=0.25 * fx_scale)
            if "reverb" in preset_fx:
                seg = master[start_s:end_s]
                if len(seg) > 64:
                    master[start_s:end_s] = effects.apply_reverb(seg, sr, mix=0.3 * fx_scale, size=2.2)
            if "vinyl_stop" in preset_fx and block["type"] == "outro":
                length = min(end_s - start_s, int(sr * 2.2))
                seg_start = end_s - length
                if length > 256:
                    master = effects.apply_variable_speed_stop(master, sr, seg_start, length, curve="vinyl")

    return master


def apply_vocal_treatment(y_song: np.ndarray, sr: int, treatment: str) -> np.ndarray:
    from . import vocal_separation

    if treatment == "original":
        return y_song

    stems = vocal_separation.center_channel_isolate(y_song, sr)
    vocal_est = stems["vocals"]
    out = y_song.copy()

    if treatment == "enhanced":
        boosted = effects.apply_filter_sweep(vocal_est, sr, 2500, 2500, "highpass") * 0.35
        out = out + boosted
    elif treatment == "echo":
        echoed = effects.apply_delay(vocal_est, sr, time_sec=0.22, feedback=0.4, mix=0.35)
        out = out + (echoed - vocal_est) * 0.6
    elif treatment == "reverb":
        reverbed = effects.apply_reverb(vocal_est, sr, mix=0.45, size=2.8)
        out = out + (reverbed - vocal_est) * 0.6
    elif treatment == "chop":
        chopped = vocal_est.copy()
        chunk = max(1, int(sr * 0.18))
        for i in range(0, len(chopped) - chunk, chunk * 2):
            chopped = effects.apply_stutter(chopped, sr, i, chunk // 2, repeats=2)
        out = out + (chopped - vocal_est) * 0.5
    elif treatment == "delay":
        delayed = effects.apply_delay(vocal_est, sr, time_sec=0.4, feedback=0.3, mix=0.4)
        out = out + (delayed - vocal_est) * 0.6

    peak = np.max(np.abs(out)) + 1e-9
    if peak > 0.98:
        out = out / peak * 0.98
    return out


def mix(y_song: np.ndarray, beat_bass_pad: np.ndarray, arrangement: list[dict], sr: int) -> np.ndarray:
    """Sum the (tempo/vocal-treated) song with the generated beat/bass/pad
    layer, applying each block's vocal_gain as a gentle envelope on the
    original song track (turning the source recording up/down to make
    room for the generated drums, rather than truly isolating vocals)."""
    n = max(y_song.shape[0], beat_bass_pad.shape[0])
    song = np.zeros((n, 2), dtype=np.float32)
    song[: y_song.shape[0]] = y_song
    beats = np.zeros((n, 2), dtype=np.float32)
    beats[: beat_bass_pad.shape[0]] = beat_bass_pad

    vocal_env = np.ones(n, dtype=np.float32)
    for block in arrangement:
        start_s = max(0, min(n, int(block["start"] * sr)))
        end_s = max(0, min(n, int(block["end"] * sr)))
        if end_s > start_s:
            vocal_env[start_s:end_s] = np.clip(block.get("vocal_gain", 1.0), 0.2, 1.3)

    song *= vocal_env[:, None]
    return song + beats
