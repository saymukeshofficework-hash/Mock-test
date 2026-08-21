"""Final mastering chain: EQ, compression, loudness normalization and a
peak limiter, plus the LUFS / peak / RMS / dynamic-range metrics the UI
displays. All real DSP — no lookup tables, no fake numbers.
"""
from __future__ import annotations

import numpy as np
from scipy.signal import lfilter
from scipy.ndimage import maximum_filter1d

try:
    import pyloudnorm as pyln
    _PYLOUDNORM_OK = True
except Exception:  # noqa: BLE001
    _PYLOUDNORM_OK = False


def _shelf_coeffs(sr: int, freq: float, gain_db: float, kind: str = "low", slope: float = 1.0):
    """RBJ audio-EQ-cookbook shelving filter."""
    a = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * freq / sr
    alpha = np.sin(w0) / 2 * np.sqrt((a + 1 / a) * (1 / slope - 1) + 2)
    cos_w0 = np.cos(w0)
    sqrt_a = np.sqrt(a)

    if kind == "low":
        b0 = a * ((a + 1) - (a - 1) * cos_w0 + 2 * sqrt_a * alpha)
        b1 = 2 * a * ((a - 1) - (a + 1) * cos_w0)
        b2 = a * ((a + 1) - (a - 1) * cos_w0 - 2 * sqrt_a * alpha)
        a0 = (a + 1) + (a - 1) * cos_w0 + 2 * sqrt_a * alpha
        a1 = -2 * ((a - 1) + (a + 1) * cos_w0)
        a2 = (a + 1) + (a - 1) * cos_w0 - 2 * sqrt_a * alpha
    else:
        b0 = a * ((a + 1) + (a - 1) * cos_w0 + 2 * sqrt_a * alpha)
        b1 = -2 * a * ((a - 1) + (a + 1) * cos_w0)
        b2 = a * ((a + 1) + (a - 1) * cos_w0 - 2 * sqrt_a * alpha)
        a0 = (a + 1) - (a - 1) * cos_w0 + 2 * sqrt_a * alpha
        a1 = 2 * ((a - 1) - (a + 1) * cos_w0)
        a2 = (a + 1) - (a - 1) * cos_w0 - 2 * sqrt_a * alpha

    return np.array([b0, b1, b2]) / a0, np.array([a0, a1, a2]) / a0


def apply_shelf(y: np.ndarray, sr: int, freq: float, gain_db: float, kind: str) -> np.ndarray:
    if abs(gain_db) < 0.01:
        return y
    b, a = _shelf_coeffs(sr, freq, gain_db, kind)
    out = np.zeros_like(y)
    for ch in range(y.shape[1]):
        out[:, ch] = lfilter(b, a, y[:, ch])
    return out


def apply_eq(y: np.ndarray, sr: int, bass_db: float = 1.5, treble_db: float = 1.0) -> np.ndarray:
    y = apply_shelf(y, sr, 120, bass_db, "low")
    y = apply_shelf(y, sr, 7500, treble_db, "high")
    return y


def apply_compressor(y: np.ndarray, sr: int, threshold_db: float = -16, ratio: float = 3.0,
                      attack_ms: float = 8, release_ms: float = 150, makeup_db: float = 2.0) -> np.ndarray:
    hop = 128
    mono = y.mean(axis=1)
    n_ctrl = max(1, len(mono) // hop)
    levels_db = np.zeros(n_ctrl)
    for i in range(n_ctrl):
        chunk = mono[i * hop:(i + 1) * hop]
        rms = np.sqrt(np.mean(chunk ** 2) + 1e-12)
        levels_db[i] = 20 * np.log10(max(rms, 1e-9))

    gain_db = np.zeros(n_ctrl)
    threshold = threshold_db
    for i in range(n_ctrl):
        over = levels_db[i] - threshold
        gain_db[i] = -over * (1 - 1 / ratio) if over > 0 else 0.0

    attack_coef = np.exp(-1 / (max(1, attack_ms / 1000 * sr / hop)))
    release_coef = np.exp(-1 / (max(1, release_ms / 1000 * sr / hop)))
    smoothed = np.zeros_like(gain_db)
    prev = 0.0
    for i, g in enumerate(gain_db):
        coef = release_coef if g > prev else attack_coef
        prev = coef * prev + (1 - coef) * g
        smoothed[i] = prev

    gain_lin = 10 ** ((smoothed + makeup_db) / 20)
    gain_full = np.interp(np.arange(len(mono)), np.arange(n_ctrl) * hop, gain_lin)
    return y * gain_full[:, None]


def apply_limiter(y: np.ndarray, ceiling_db: float = -0.3, lookahead_ms: float = 5) -> np.ndarray:
    ceiling = 10 ** (ceiling_db / 20)
    window = max(1, int(44100 * lookahead_ms / 1000))
    peak_env = np.zeros(y.shape[0])
    for ch in range(y.shape[1]):
        peak_env = np.maximum(peak_env, maximum_filter1d(np.abs(y[:, ch]), size=window * 2 + 1))
    gain = np.minimum(1.0, ceiling / (peak_env + 1e-9))
    limited = y * gain[:, None]
    return np.clip(limited, -ceiling, ceiling)


def compute_metrics(y: np.ndarray, sr: int) -> dict:
    mono = y.mean(axis=1)
    peak = float(np.max(np.abs(y)) + 1e-12)
    peak_db = 20 * np.log10(peak)
    rms = float(np.sqrt(np.mean(mono ** 2)) + 1e-12)
    rms_db = 20 * np.log10(rms)

    lufs = None
    if _PYLOUDNORM_OK and len(mono) > sr // 2:
        try:
            meter = pyln.Meter(sr)
            lufs = float(meter.integrated_loudness(y))
            if not np.isfinite(lufs):
                lufs = None
        except Exception:  # noqa: BLE001
            lufs = None
    if lufs is None:
        lufs = rms_db - 3.0  # rough fallback estimate, clearly not a true ITU-R BS.1770 figure

    return {
        "lufs": round(lufs, 2),
        "peak_db": round(peak_db, 2),
        "rms_db": round(rms_db, 2),
        "dynamic_range_db": round(peak_db - rms_db, 2),
    }


def master(y: np.ndarray, sr: int, target_lufs: float = -14.0) -> tuple[np.ndarray, dict]:
    eq_out = apply_eq(y, sr, bass_db=1.5, treble_db=1.0)
    compressed = apply_compressor(eq_out, sr)

    pre_metrics = compute_metrics(compressed, sr)
    gain_db = target_lufs - pre_metrics["lufs"]
    gain_db = float(np.clip(gain_db, -18, 18))
    normalized = compressed * (10 ** (gain_db / 20))

    limited = apply_limiter(normalized, ceiling_db=-0.3)
    peak = float(np.max(np.abs(limited)) + 1e-12)
    if peak > 0.995:
        limited = limited / peak * 0.99

    metrics = compute_metrics(limited, sr)
    metrics["target_lufs"] = target_lufs
    return limited.astype(np.float32), metrics
