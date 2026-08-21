"""Orchestrates the full "AI Remix" pipeline described in the product
spec: analyze -> beat-match -> vocal-process -> build arrangement ->
generate rhythm/bass -> mix -> master -> ready. Every stage below does
real work; `progress_cb(stage)` is called so the API/job layer can
stream live progress to the UI.
"""
from __future__ import annotations

from pathlib import Path
from typing import Callable, Optional

import numpy as np

from . import io_utils, analysis, arrangement as arrangement_mod, mixer, mastering

STAGES = ["ANALYZING", "BEAT_MATCHING", "VOCAL_PROCESSING", "BUILDING_DROP", "MIXING", "MASTERING", "READY"]


def analyze_song(path: Path, progress_cb: Optional[Callable[[str], None]] = None) -> dict:
    cb = progress_cb or (lambda *_: None)
    cb("ANALYZING")
    y_stereo, sr = io_utils.load_audio(path, mono=False)
    y_mono = io_utils.to_mono(y_stereo)
    duration = len(y_mono) / sr

    bpm = analysis.detect_bpm(y_mono, sr)
    beat_times, downbeats = analysis.detect_beat_grid(y_mono, sr)
    key_info = analysis.detect_key(y_mono, sr)
    sections = analysis.detect_structure(y_mono, sr, duration)
    vocal_info = analysis.detect_vocal_presence(y_mono, sr)
    peaks = io_utils.compute_waveform_peaks(y_stereo, num_peaks=1400)

    return {
        "duration": round(duration, 2),
        "sample_rate": sr,
        "bpm": bpm,
        "beat_count": len(beat_times),
        "downbeat_count": len(downbeats),
        "key": key_info,
        "sections": sections,
        "vocal": vocal_info,
        "waveform_peaks": peaks,
    }


def generate_remix(path: Path, analysis_result: dict, params: dict,
                    progress_cb: Optional[Callable[[str], None]] = None) -> dict:
    cb = progress_cb or (lambda *_: None)

    cb("ANALYZING")
    y_song, sr = io_utils.load_audio(path, mono=False)
    bpm_original = analysis_result["bpm"]
    key_info = analysis_result["key"]
    sections = analysis_result["sections"]

    cb("BEAT_MATCHING")
    target_bpm = mixer.compute_target_bpm(bpm_original, params.get("tempo_mode", "original"), params.get("custom_bpm"))
    target_bpm = float(np.clip(target_bpm, 40, 200))
    rate = target_bpm / bpm_original if bpm_original > 0 else 1.0
    stretched = mixer.time_stretch_stereo(y_song, rate)
    new_duration = stretched.shape[0] / sr
    scaled_sections = [
        {**s, "start": s["start"] / rate, "end": min(new_duration, s["end"] / rate)}
        for s in sections
    ]
    if scaled_sections:
        scaled_sections[-1]["end"] = new_duration
    timeline = arrangement_mod.build_arrangement(
        new_duration, params["style_id"], params.get("energy_level", "MEDIUM"), scaled_sections
    )

    cb("VOCAL_PROCESSING")
    vocal_treatment = params.get("vocal_treatment", "original")
    song_processed = mixer.apply_vocal_treatment(stretched, sr, vocal_treatment)

    cb("BUILDING_DROP")
    beat_layer = mixer.generate_beat_bass_pad(
        sr, new_duration, target_bpm, params["style_id"], timeline, key_info,
        params.get("bass_intensity", "normal"), params.get("drum_intensity", "standard"),
    )

    cb("MIXING")
    master_buf = mixer.mix(song_processed, beat_layer, timeline, sr)
    fx_scale = 1.0
    from .presets import ENERGY_LEVELS
    fx_scale = ENERGY_LEVELS.get(params.get("energy_level", "MEDIUM"), ENERGY_LEVELS["MEDIUM"])["fx"]
    master_buf = mixer.apply_block_fx(
        master_buf, sr, timeline, params["style_id"], params.get("extra_effects", []), fx_scale
    )

    cb("MASTERING")
    mastered, metrics = mastering.master(master_buf, sr, target_lufs=params.get("target_lufs", -14.0))

    cb("READY")
    return {
        "audio": mastered,
        "sample_rate": sr,
        "target_bpm": target_bpm,
        "duration": round(mastered.shape[0] / sr, 2),
        "arrangement": timeline,
        "metrics": metrics,
        "vocal_treatment": vocal_treatment,
    }
