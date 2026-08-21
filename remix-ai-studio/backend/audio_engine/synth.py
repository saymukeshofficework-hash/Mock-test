"""Procedural drum/bass/FX synthesis (numpy + scipy only).

Every sound here is generated from scratch — oscillators, noise and
envelopes — so remix presets never sample, loop, or reproduce audio from
any existing recording or artist. This keeps the "Indian commercial DJ /
Bollywood-inspired" presets legally original while still giving the
arrangement engine drums, bass and transition FX that suit the genre.
"""
from __future__ import annotations

import numpy as np
from scipy.signal import butter, sosfiltfilt


def _t(sr: int, duration: float) -> np.ndarray:
    return np.linspace(0, duration, max(1, int(sr * duration)), endpoint=False)


def _exp_env(t: np.ndarray, decay: float) -> np.ndarray:
    return np.exp(-decay * t)


def _white_noise(n: int, seed: int | None = None) -> np.ndarray:
    rng = np.random.default_rng(seed)
    return rng.uniform(-1, 1, n).astype(np.float32)


def _bandpass(x: np.ndarray, sr: int, low: float, high: float, order: int = 4) -> np.ndarray:
    nyq = sr / 2
    low = max(1.0, min(low, nyq - 10))
    high = max(low + 1, min(high, nyq - 1))
    sos = butter(order, [low, high], btype="bandpass", fs=sr, output="sos")
    return sosfiltfilt(sos, x)


def _highpass(x: np.ndarray, sr: int, cutoff: float, order: int = 2) -> np.ndarray:
    sos = butter(order, min(cutoff, sr / 2 - 10), btype="highpass", fs=sr, output="sos")
    return sosfiltfilt(sos, x)


def _lowpass(x: np.ndarray, sr: int, cutoff: float, order: int = 2) -> np.ndarray:
    sos = butter(order, max(20, min(cutoff, sr / 2 - 10)), btype="lowpass", fs=sr, output="sos")
    return sosfiltfilt(sos, x)


def _norm(x: np.ndarray, peak: float = 0.92) -> np.ndarray:
    m = np.max(np.abs(x)) + 1e-9
    return (x / m * peak).astype(np.float32)


def synth_kick(sr: int, duration: float = 0.4, f_start: float = 150, f_end: float = 45, amp: float = 0.95) -> np.ndarray:
    t = _t(sr, duration)
    freq = np.exp(np.linspace(np.log(f_start), np.log(f_end), len(t)))
    phase = 2 * np.pi * np.cumsum(freq) / sr
    click = _white_noise(len(t)) * _exp_env(t, 700) * 0.15
    return _norm((np.sin(phase) * _exp_env(t, 11) + click) * amp)


def synth_snare(sr: int, duration: float = 0.22, amp: float = 0.85) -> np.ndarray:
    t = _t(sr, duration)
    noise = _bandpass(_white_noise(len(t)), sr, 1200, 9000) * _exp_env(t, 22)
    tone = np.sin(2 * np.pi * 190 * t) * _exp_env(t, 30)
    return _norm((noise * 0.75 + tone * 0.5) * amp)


def synth_hat(sr: int, open_hat: bool = False, amp: float = 0.5) -> np.ndarray:
    duration = 0.32 if open_hat else 0.07
    t = _t(sr, duration)
    noise = _highpass(_white_noise(len(t)), sr, 7500)
    decay = 7 if open_hat else 35
    return _norm(noise * _exp_env(t, decay) * amp)


def synth_clap(sr: int, amp: float = 0.75) -> np.ndarray:
    duration = 0.2
    n = int(sr * duration)
    out = np.zeros(n, dtype=np.float32)
    for i, off in enumerate((0.0, 0.011, 0.023)):
        start = int(sr * off)
        t = _t(sr, duration - off)
        burst = _bandpass(_white_noise(len(t)), sr, 1000, 3500) * _exp_env(t, 26)
        burst *= 1.0 if i == 2 else 0.55
        out[start:start + len(burst)] += burst
    return _norm(out * amp)


def synth_tom(sr: int, f_start: float = 220, f_end: float = 90, duration: float = 0.3, amp: float = 0.75) -> np.ndarray:
    t = _t(sr, duration)
    freq = np.exp(np.linspace(np.log(f_start), np.log(f_end), len(t)))
    phase = 2 * np.pi * np.cumsum(freq) / sr
    return _norm(np.sin(phase) * _exp_env(t, 9) * amp)


def synth_rim(sr: int, amp: float = 0.4) -> np.ndarray:
    duration = 0.06
    t = _t(sr, duration)
    tone = np.sign(np.sin(2 * np.pi * 800 * t)) * _exp_env(t, 90)
    return _norm(tone * amp)


def synth_perc(sr: int, amp: float = 0.4) -> np.ndarray:
    duration = 0.09
    t = _t(sr, duration)
    noise = _bandpass(_white_noise(len(t)), sr, 3000, 6000) * _exp_env(t, 45)
    return _norm(noise * amp)


def synth_dhol(sr: int, amp: float = 0.9) -> np.ndarray:
    """Original low resonant hand-drum hit (not sampled) evoking dhol/dholak feel."""
    duration = 0.4
    t = _t(sr, duration)
    freq = np.exp(np.linspace(np.log(130), np.log(55), len(t)))
    phase = 2 * np.pi * np.cumsum(freq) / sr
    body = np.sin(phase) * _exp_env(t, 8)
    ring = np.sin(2 * np.pi * 110 * t) * _exp_env(t, 5) * 0.3
    return _norm((body + ring) * amp)


def synth_tabla(sr: int, amp: float = 0.65) -> np.ndarray:
    """Original resonant high-hand-drum hit evoking tabla feel."""
    duration = 0.22
    t = _t(sr, duration)
    freq = np.exp(np.linspace(np.log(320), np.log(190), len(t)))
    phase = 2 * np.pi * np.cumsum(freq) / sr
    body = np.sin(phase) * _exp_env(t, 18)
    click = _bandpass(_white_noise(len(t)), sr, 2000, 6000) * _exp_env(t, 60) * 0.25
    return _norm((body + click) * amp)


def synth_bass_note(sr: int, freq: float, duration: float, amp: float = 0.8, brightness: float = 0.4) -> np.ndarray:
    t = _t(sr, duration)
    sine = np.sin(2 * np.pi * freq * t)
    saw = 2 * (t * freq - np.floor(0.5 + t * freq))
    mixed = sine * (1 - brightness) + saw * brightness
    env = np.clip(1 - (t / duration) ** 1.5, 0, 1) * np.minimum(1, t / 0.005 + 0.001)
    cutoff = 90 + freq * 3 + brightness * 800
    filtered = _lowpass(mixed, sr, cutoff)
    return _norm(filtered * env * amp, peak=0.85)


def synth_riser(sr: int, duration: float, amp: float = 0.8) -> np.ndarray:
    t = _t(sr, duration)
    noise = _white_noise(len(t))
    sweep_center = np.exp(np.linspace(np.log(250), np.log(9000), len(t)))
    # time-varying bandpass approximated with short overlapping chunks
    chunk = max(1024, sr // 20)
    out = np.zeros_like(noise)
    for start in range(0, len(t), chunk):
        end = min(len(t), start + chunk)
        c = sweep_center[(start + end) // 2]
        out[start:end] = _bandpass(noise[start:end], sr, c * 0.7, c * 1.3)
    tone = np.sin(2 * np.pi * np.cumsum(sweep_center) / sr) * 0.3
    env = (t / duration) ** 1.2
    return _norm((out * 0.8 + tone) * env * amp)


def synth_impact(sr: int, amp: float = 0.9) -> np.ndarray:
    duration = 1.1
    t = _t(sr, duration)
    sub = np.sin(2 * np.pi * 48 * t) * _exp_env(t, 3.2)
    crash = _bandpass(_white_noise(len(t)), sr, 900, 8000) * _exp_env(t, 2.5)
    click = _white_noise(int(sr * 0.01)) * 0.6
    out = sub * 0.8 + crash * 0.6
    out[: len(click)] += click
    return _norm(out * amp)


def synth_pad(sr: int, freq: float, duration: float, amp: float = 0.35, brightness: float = 0.25) -> np.ndarray:
    """Atmospheric sustained pad: detuned sine stack through a slow attack/release envelope."""
    t = _t(sr, duration)
    detunes = (1.0, 1.003, 0.997, 2.0)
    weights = (0.5, 0.28, 0.28, 0.18 * brightness)
    wave = np.zeros_like(t)
    for d, w in zip(detunes, weights):
        wave += np.sin(2 * np.pi * freq * d * t) * w
    attack = np.clip(t / max(0.4, duration * 0.3), 0, 1)
    release = np.clip((duration - t) / max(0.4, duration * 0.3), 0, 1)
    env = np.minimum(attack, release)
    filtered = _lowpass(wave, sr, 400 + brightness * 2000)
    return _norm(filtered * env * amp, peak=0.7)


DRUM_SYNTHS = {
    "kick": lambda sr, vel=1.0: synth_kick(sr, amp=0.95 * vel),
    "snare": lambda sr, vel=1.0: synth_snare(sr, amp=0.85 * vel),
    "clap": lambda sr, vel=1.0: synth_clap(sr, amp=0.75 * vel),
    "chh": lambda sr, vel=1.0: synth_hat(sr, open_hat=False, amp=0.5 * vel),
    "ohh": lambda sr, vel=1.0: synth_hat(sr, open_hat=True, amp=0.5 * vel),
    "tom": lambda sr, vel=1.0: synth_tom(sr, amp=0.75 * vel),
    "rim": lambda sr, vel=1.0: synth_rim(sr, amp=0.4 * vel),
    "perc": lambda sr, vel=1.0: synth_perc(sr, amp=0.4 * vel),
    "dhol": lambda sr, vel=1.0: synth_dhol(sr, amp=0.9 * vel),
    "tabla": lambda sr, vel=1.0: synth_tabla(sr, amp=0.65 * vel),
}
