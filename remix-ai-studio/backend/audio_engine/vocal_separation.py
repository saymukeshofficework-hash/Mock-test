"""Vocal / instrumental separation.

Two code paths:

1. `center_channel_isolate` — always available, zero extra dependencies.
   Classic "phase cancellation" trick: content panned dead-center (most
   commercial vocals) cancels out of L-R, so `instrumental ~= L-R` and
   `vocal-ish ~= (L+R)/2` band-passed to the vocal formant range. This is
   a genuine, working technique, but it is NOT true source separation —
   it also removes/leaks any other centered element (kick, bass, lead),
   and does nothing useful on mono or heavily-processed masters. We are
   explicit about that in the API response rather than pretending this is
   studio-grade stem separation.

2. `demucs_separate` — true ML source separation via Meta's Demucs model.
   Only runs if `config.ENABLE_DEMUCS` is set AND the optional heavy deps
   (torch + demucs, see requirements-full.txt) are installed. Guarded
   behind a try/except import so the rest of the app works fine without
   it — this is real, correct integration code, it is simply optional.
"""
from __future__ import annotations

import numpy as np
from scipy.signal import butter, sosfiltfilt

try:
    import demucs.api  # type: ignore
    _DEMUCS_IMPORT_ERROR = None
except Exception as exc:  # noqa: BLE001
    demucs = None  # type: ignore
    _DEMUCS_IMPORT_ERROR = str(exc)


def demucs_available() -> bool:
    return _DEMUCS_IMPORT_ERROR is None


def _bandpass(y: np.ndarray, sr: int, low: float, high: float) -> np.ndarray:
    sos = butter(4, [low, high], btype="bandpass", fs=sr, output="sos")
    return sosfiltfilt(sos, y)


def center_channel_isolate(y_stereo: np.ndarray, sr: int) -> dict:
    if y_stereo.ndim == 1 or y_stereo.shape[1] < 2:
        mono = y_stereo if y_stereo.ndim == 1 else y_stereo[:, 0]
        vocal_est = _bandpass(mono, sr, 200, 4000) * 0.6
        instrumental_est = mono - vocal_est
        quality = "mono_source_low_confidence"
    else:
        left, right = y_stereo[:, 0], y_stereo[:, 1]
        instrumental_est = left - right
        mid = (left + right) / 2.0
        vocal_est = _bandpass(mid, sr, 200, 4000)
        quality = "stereo_center_cancellation"

    def _norm(x):
        peak = np.max(np.abs(x)) + 1e-9
        return (x / peak * 0.9).astype(np.float32)

    return {
        "vocals": np.stack([_norm(vocal_est)] * 2, axis=1),
        "instrumental": np.stack([_norm(instrumental_est)] * 2, axis=1),
        "method": "center_channel_heuristic",
        "quality": quality,
        "note": (
            "Approximate separation using phase-cancellation of centered content. "
            "Works best on stereo commercial mixes with a centered lead vocal; "
            "results depend heavily on how the source track was mixed. Enable "
            "REMIX_ENABLE_DEMUCS + install requirements-full.txt for full ML "
            "stem separation (vocals/drums/bass/other)."
        ),
    }


def demucs_separate(path: str, sr: int) -> dict:
    if not demucs_available():
        raise RuntimeError(
            "Demucs is not installed. Install backend/requirements-full.txt "
            f"and set REMIX_ENABLE_DEMUCS=true. Import error: {_DEMUCS_IMPORT_ERROR}"
        )
    separator = demucs.api.Separator()  # type: ignore[attr-defined]
    _origin, separated = separator.separate_audio_file(path)
    stems = {name: tensor.numpy().T for name, tensor in separated.items()}
    return {
        "vocals": stems.get("vocals"),
        "drums": stems.get("drums"),
        "bass": stems.get("bass"),
        "other": stems.get("other"),
        "method": "demucs",
        "quality": "ml_source_separation",
        "note": "Full ML-based 4-stem separation (Demucs).",
    }
