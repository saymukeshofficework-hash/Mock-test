"""Real signal-processing analysis: tempo, key, structure, vocal presence.

Everything here is computed from the actual uploaded audio with librosa/
numpy/scipy — there is no lookup table or fake data. Structure labeling
(intro/verse/chorus/...) is a heuristic built on top of genuine novelty-
based segmentation, and is honestly imperfect on unusual song structures;
it is good enough to drive an arrangement that reacts to the real song
instead of applying one fixed timeline to every upload.
"""
from __future__ import annotations

import numpy as np
import librosa

NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

# Krumhansl-Schmuckler key profiles
_MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
_MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def detect_bpm(y_mono: np.ndarray, sr: int) -> float:
    tempo, _ = librosa.beat.beat_track(y=y_mono, sr=sr, trim=False)
    bpm = float(np.atleast_1d(tempo)[0])
    # librosa can octave-error on very sparse or very dense material; fold into a
    # sensible DJ range (same trick used by the tap-tempo UI on the frontend).
    while bpm < 60:
        bpm *= 2
    while bpm > 200:
        bpm /= 2
    return round(bpm, 1)


def detect_beat_grid(y_mono: np.ndarray, sr: int):
    tempo, beat_frames = librosa.beat.beat_track(y=y_mono, sr=sr, trim=False)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    onset_env = librosa.onset.onset_strength(y=y_mono, sr=sr)
    # crude downbeat guess: within every group of 4 beats, pick the one whose
    # onset strength is (on average) strongest as beat 1.
    downbeats = []
    if len(beat_frames) >= 4:
        strengths = onset_env[np.clip(beat_frames, 0, len(onset_env) - 1)]
        best_phase = int(np.argmax([strengths[p::4].mean() if len(strengths[p::4]) else 0 for p in range(4)]))
        downbeats = beat_times[best_phase::4].tolist()
    return beat_times.tolist(), downbeats


def detect_key(y_mono: np.ndarray, sr: int) -> dict:
    harmonic = librosa.effects.harmonic(y_mono, margin=8)
    chroma = librosa.feature.chroma_cqt(y=harmonic, sr=sr)
    chroma_mean = chroma.mean(axis=1)
    if chroma_mean.sum() > 0:
        chroma_mean = chroma_mean / chroma_mean.sum()

    best = {"score": -np.inf}
    for mode, profile in (("major", _MAJOR_PROFILE), ("minor", _MINOR_PROFILE)):
        for root in range(12):
            rotated = np.roll(profile, root)
            score = float(np.corrcoef(rotated, chroma_mean)[0, 1])
            if score > best["score"]:
                best = {"score": score, "root": root, "mode": mode}

    tonic = NOTE_NAMES[best["root"]]
    label = f"{tonic} {'Major' if best['mode'] == 'major' else 'Minor'}"
    return {
        "tonic": tonic,
        "mode": best["mode"],
        "label": label,
        "confidence": round(max(0.0, min(1.0, (best["score"] + 1) / 2)), 2),
    }


def _label_sections(bounds_time: list[float], energies: list[float], duration: float) -> list[dict]:
    n = len(bounds_time) - 1
    if n <= 0:
        return [{"start": 0.0, "end": duration, "label": "verse", "energy": 0.5}]

    order = np.argsort(energies)  # low -> high energy
    rank = np.empty(n, dtype=int)
    rank[order] = np.arange(n)
    norm_rank = rank / max(1, n - 1)

    sections = []
    for i in range(n):
        start, end = bounds_time[i], bounds_time[i + 1]
        if i == 0:
            label = "intro"
        elif i == n - 1:
            label = "outro"
        elif norm_rank[i] > 0.75:
            label = "drop" if energies[i] > np.mean(energies) * 1.15 else "chorus"
        elif norm_rank[i] < 0.3:
            label = "breakdown" if i > n / 2 else "verse"
        else:
            label = "bridge" if 0.4 < norm_rank[i] < 0.6 and 0 < i < n - 1 else "verse"
        sections.append({"start": float(start), "end": float(end), "label": label, "energy": float(energies[i])})
    return sections


def detect_structure(y_mono: np.ndarray, sr: int, duration: float) -> list[dict]:
    if duration < 12:
        return [{"start": 0.0, "end": duration, "label": "verse", "energy": 1.0}]

    target_sections = int(np.clip(round(duration / 22), 4, 10))
    hop_length = 1024
    mfcc = librosa.feature.mfcc(y=y_mono, sr=sr, n_mfcc=13, hop_length=hop_length)
    chroma = librosa.feature.chroma_cqt(y=y_mono, sr=sr, hop_length=hop_length)
    features = np.vstack([mfcc, chroma])

    try:
        bounds = librosa.segment.agglomerative(features, target_sections)
    except Exception:  # noqa: BLE001 - fall back to even slices on odd/short input
        bounds = np.linspace(0, features.shape[1], target_sections + 1, dtype=int)

    bounds = sorted(set([0, *bounds.tolist(), features.shape[1]]))
    bounds_time = librosa.frames_to_time(bounds, sr=sr, hop_length=hop_length).tolist()
    bounds_time[-1] = duration

    rms = librosa.feature.rms(y=y_mono, hop_length=hop_length)[0]
    rms_times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)
    energies = []
    for i in range(len(bounds_time) - 1):
        mask = (rms_times >= bounds_time[i]) & (rms_times < bounds_time[i + 1])
        energies.append(float(rms[mask].mean()) if mask.any() else 0.0)

    return _label_sections(bounds_time, energies, duration)


def detect_vocal_presence(y_mono: np.ndarray, sr: int) -> dict:
    """Heuristic vocal-likelihood: energy ratio in the vocal formant band
    (~200Hz-4kHz) on the harmonic component vs. the full signal, using
    harmonic/percussive source separation (a genuine, if imperfect, DSP
    technique — not a trained classifier)."""
    harmonic, percussive = librosa.effects.hpss(y_mono)
    S = np.abs(librosa.stft(harmonic))
    freqs = librosa.fft_frequencies(sr=sr)
    band = (freqs >= 200) & (freqs <= 4000)
    band_energy = float(S[band, :].mean())
    total_energy = float(np.abs(librosa.stft(y_mono)).mean()) + 1e-9
    ratio = band_energy / total_energy
    confidence = float(np.clip((ratio - 0.15) / 0.6, 0, 1))
    return {
        "likely_vocals": confidence > 0.35,
        "confidence": round(confidence, 2),
    }
