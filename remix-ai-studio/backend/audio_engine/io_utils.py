"""Audio loading, validation and conversion helpers.

Every uploaded file is normalized through ffmpeg into a WAV file first.
This gives us one consistent, reliable decode path for MP3/WAV/M4A/AAC/
FLAC/OGG (and lets a corrupt/unsupported file fail loudly and early with
a clear error instead of a confusing exception three steps later).
"""
from __future__ import annotations

import shutil
import subprocess
import uuid
from pathlib import Path

import numpy as np
import soundfile as sf

import config


class AudioProcessingError(Exception):
    """Raised for any user-facing audio problem (bad file, too long, corrupt, etc)."""


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def validate_upload(filename: str, size_bytes: int) -> None:
    ext = Path(filename).suffix.lower()
    if ext not in config.ALLOWED_EXTENSIONS:
        raise AudioProcessingError(
            f"Unsupported file type '{ext or 'unknown'}'. "
            f"Supported formats: {', '.join(sorted(config.ALLOWED_EXTENSIONS))}."
        )
    max_bytes = config.MAX_UPLOAD_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise AudioProcessingError(
            f"File is too large ({size_bytes / 1024 / 1024:.1f} MB). "
            f"Max allowed is {config.MAX_UPLOAD_MB:.0f} MB."
        )
    if size_bytes <= 44:
        raise AudioProcessingError("File is empty or corrupt.")


def probe_duration(path: Path) -> float:
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
            capture_output=True, text=True, timeout=30,
        )
        val = out.stdout.strip()
        return float(val) if val else 0.0
    except Exception as exc:  # noqa: BLE001
        raise AudioProcessingError("Could not read this audio file — it may be corrupt.") from exc


def normalize_to_wav(src_path: Path, dst_path: Path, sr: int = config.WORKING_SAMPLE_RATE) -> None:
    """Decode any supported format into a clean stereo PCM WAV via ffmpeg."""
    if not ffmpeg_available():
        raise AudioProcessingError("ffmpeg is not installed on the server. See backend/README for setup.")
    cmd = [
        "ffmpeg", "-y", "-v", "error", "-i", str(src_path),
        "-ac", "2", "-ar", str(sr), "-sample_fmt", "s16", str(dst_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode != 0 or not dst_path.exists():
        raise AudioProcessingError(
            "This file could not be decoded — it may be corrupt or use an unsupported codec."
        )


def load_audio(path: Path, mono: bool = False, sr: int = config.WORKING_SAMPLE_RATE):
    """Return (y, sr). y is shape (n,) if mono else (n, 2)."""
    tmp_wav = config.TMP_DIR / f"{uuid.uuid4().hex}.wav"
    try:
        normalize_to_wav(path, tmp_wav, sr=sr)
        y, file_sr = sf.read(str(tmp_wav), dtype="float32", always_2d=True)
        if mono:
            y = y.mean(axis=1)
        return y, file_sr
    finally:
        tmp_wav.unlink(missing_ok=True)


def to_mono(y: np.ndarray) -> np.ndarray:
    if y.ndim == 1:
        return y
    return y.mean(axis=1)


def to_stereo(y: np.ndarray) -> np.ndarray:
    if y.ndim == 2 and y.shape[1] == 2:
        return y
    y = to_mono(y)
    return np.stack([y, y], axis=1)


def save_wav(path: Path, y: np.ndarray, sr: int, bit_depth: int = 16) -> None:
    subtype = {16: "PCM_16", 24: "PCM_24", 32: "PCM_32"}.get(bit_depth, "PCM_16")
    y = np.clip(y, -1.0, 1.0)
    sf.write(str(path), y, sr, subtype=subtype)


def export_mp3(wav_path: Path, mp3_path: Path, bitrate_kbps: int = 256) -> None:
    if not ffmpeg_available():
        raise AudioProcessingError("ffmpeg is not installed on the server. See backend/README for setup.")
    cmd = [
        "ffmpeg", "-y", "-v", "error", "-i", str(wav_path),
        "-codec:a", "libmp3lame", "-b:a", f"{bitrate_kbps}k", str(mp3_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode != 0 or not mp3_path.exists():
        raise AudioProcessingError("MP3 encoding failed on the server.")


def compute_waveform_peaks(y: np.ndarray, num_peaks: int = 1200) -> list:
    """Return [[min, max], ...] downsampled envelope for canvas rendering."""
    mono = to_mono(y)
    n = len(mono)
    if n == 0:
        return []
    bucket = max(1, n // num_peaks)
    trimmed = mono[: bucket * (n // bucket)] if bucket > 1 else mono
    if len(trimmed) == 0:
        trimmed = mono
        bucket = max(1, len(mono))
    reshaped = trimmed.reshape(-1, bucket) if bucket > 1 else trimmed.reshape(-1, 1)
    mins = reshaped.min(axis=1)
    maxs = reshaped.max(axis=1)
    return [[float(mn), float(mx)] for mn, mx in zip(mins, maxs)]
