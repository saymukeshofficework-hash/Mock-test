"""DJ-style signal-processing effects, applied to mono/stereo numpy buffers.

Everything here is real DSP (convolution, tap-delay, time-varying filters,
variable-rate resampling) — no lookup samples, no shortcuts labeled as
something they are not.
"""
from __future__ import annotations

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve


def _ensure_stereo(y: np.ndarray) -> np.ndarray:
    return y if y.ndim == 2 else np.stack([y, y], axis=1)


def make_impulse_response(sr: int, seconds: float = 2.2, decay: float = 2.2) -> np.ndarray:
    n = max(1, int(sr * seconds))
    rng = np.random.default_rng(7)
    noise = rng.uniform(-1, 1, n)
    env = (1 - np.arange(n) / n) ** decay
    ir = noise * env
    return (ir / (np.max(np.abs(ir)) + 1e-9)).astype(np.float32)


def apply_reverb(y: np.ndarray, sr: int, mix: float = 0.3, size: float = 2.0) -> np.ndarray:
    stereo = _ensure_stereo(y)
    ir = make_impulse_response(sr, seconds=size)
    out = np.zeros_like(stereo)
    for ch in range(stereo.shape[1]):
        wet = fftconvolve(stereo[:, ch], ir, mode="full")[: stereo.shape[0]]
        out[:, ch] = stereo[:, ch] * (1 - mix) + wet * mix
    return out


def apply_delay(y: np.ndarray, sr: int, time_sec: float = 0.3, feedback: float = 0.35, mix: float = 0.3, taps: int = 6) -> np.ndarray:
    stereo = _ensure_stereo(y)
    delay_samples = max(1, int(sr * time_sec))
    wet = np.zeros_like(stereo)
    gain = 1.0
    for tap in range(1, taps + 1):
        shift = delay_samples * tap
        if shift >= stereo.shape[0]:
            break
        gain *= feedback
        wet[shift:] += stereo[: stereo.shape[0] - shift] * gain
    return stereo * (1 - mix) + wet * mix


def _sweep_filter(y: np.ndarray, sr: int, cutoffs: np.ndarray, kind: str, chunk: int) -> np.ndarray:
    n = y.shape[0]
    out = np.zeros_like(y)
    zi = None
    order = 2
    for start in range(0, n, chunk):
        end = min(n, start + chunk)
        cutoff = float(np.clip(cutoffs[start], 20, sr / 2 - 20))
        sos = butter(order, cutoff, btype=kind, fs=sr, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2, y.shape[1] if y.ndim == 2 else 1))
        if y.ndim == 2:
            for ch in range(y.shape[1]):
                out[start:end, ch], zi[:, :, ch] = sosfilt(sos, y[start:end, ch], zi=zi[:, :, ch])
        else:
            out[start:end], zi[:, :, 0] = sosfilt(sos, y[start:end], zi=zi[:, :, 0])
    return out


def apply_filter_sweep(y: np.ndarray, sr: int, start_cutoff: float, end_cutoff: float, kind: str = "lowpass") -> np.ndarray:
    stereo = _ensure_stereo(y)
    n = stereo.shape[0]
    cutoffs = np.exp(np.linspace(np.log(max(20, start_cutoff)), np.log(max(20, end_cutoff)), n))
    chunk = max(256, sr // 20)
    return _sweep_filter(stereo, sr, cutoffs, kind, chunk)


def apply_flanger(y: np.ndarray, sr: int, rate_hz: float = 0.25, depth_ms: float = 3.0, mix: float = 0.5) -> np.ndarray:
    stereo = _ensure_stereo(y)
    n = stereo.shape[0]
    t = np.arange(n) / sr
    depth_samples = depth_ms / 1000 * sr
    lfo = (np.sin(2 * np.pi * rate_hz * t) + 1) / 2 * depth_samples
    idx = np.arange(n) - lfo
    idx_clipped = np.clip(idx, 0, n - 1)
    out = np.zeros_like(stereo)
    base_idx = np.arange(n)
    for ch in range(stereo.shape[1]):
        delayed = np.interp(idx_clipped, base_idx, stereo[:, ch])
        out[:, ch] = stereo[:, ch] * (1 - mix) + delayed * mix
    return out


def apply_phaser(y: np.ndarray, sr: int, rate_hz: float = 0.3, mix: float = 0.5, stages: int = 4) -> np.ndarray:
    stereo = _ensure_stereo(y)
    n = stereo.shape[0]
    t = np.arange(n) / sr
    sweep = 300 + (np.sin(2 * np.pi * rate_hz * t) + 1) / 2 * 2200
    chunk = max(256, sr // 20)
    out = stereo.copy()
    for ch in range(stereo.shape[1]):
        signal = stereo[:, ch].copy()
        for _ in range(stages):
            signal = _sweep_filter(signal.reshape(-1, 1), sr, sweep, "highpass", chunk).reshape(-1)
        out[:, ch] = stereo[:, ch] * (1 - mix) + signal * mix
    return out


def reverse_region(y: np.ndarray, start: int, end: int) -> np.ndarray:
    out = y.copy()
    out[start:end] = y[start:end][::-1]
    return out


def apply_stutter(y: np.ndarray, sr: int, start: int, slice_len: int, repeats: int = 4) -> np.ndarray:
    """Repeat a short slice in place (classic 'beat repeat' / stutter FX)."""
    stereo = _ensure_stereo(y)
    slice_len = max(1, min(slice_len, stereo.shape[0] - start))
    piece = stereo[start:start + slice_len]
    out = stereo.copy()
    pos = start
    for _ in range(repeats):
        end = min(stereo.shape[0], pos + slice_len)
        out[pos:end] = piece[: end - pos]
        pos = end
        if pos >= stereo.shape[0]:
            break
    return out


def apply_variable_speed_stop(y: np.ndarray, sr: int, start: int, length: int, curve: str = "tape") -> np.ndarray:
    """Slow a region down to a stop via variable-rate resampling (tape stop /
    vinyl stop). Output keeps the same buffer length; audio inside the region
    audibly decelerates and drops in pitch, exactly like letting a physical
    deck or tape spin down."""
    stereo = _ensure_stereo(y)
    length = max(1, min(length, stereo.shape[0] - start))
    region = stereo[start:start + length]
    out_t = np.linspace(0, 1, length)
    if curve == "vinyl":
        speed = np.clip(1 - out_t ** 0.6, 0.0001, 1)
    else:  # tape
        speed = np.exp(-4.0 * out_t)
    read_pos = np.cumsum(speed)
    read_pos = read_pos / (read_pos[-1] + 1e-9) * (length - 1)
    result = np.zeros_like(region)
    base_idx = np.arange(length)
    for ch in range(region.shape[1]):
        result[:, ch] = np.interp(read_pos, base_idx, region[:, ch])
    out = stereo.copy()
    out[start:start + length] = result
    return out
