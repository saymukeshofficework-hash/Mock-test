from __future__ import annotations

from pathlib import Path
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

import config
import jobs
import store
from audio_engine import io_utils, remix_engine
from audio_engine.presets import PRESETS, ENERGY_LEVELS, VOCAL_TREATMENTS, BASS_INTENSITIES, DRUM_INTENSITIES, TEMPO_MODES

router = APIRouter(prefix="/api", tags=["remix"])

EFFECT_CHOICES = [
    "reverb", "delay", "echo", "filter", "sweep", "flanger", "phaser",
    "stutter", "beat_repeat", "reverse", "tape_stop", "vinyl_stop", "riser", "impact",
]


class RemixRequest(BaseModel):
    style_id: str
    energy_level: str = "MEDIUM"
    tempo_mode: str = "original"
    custom_bpm: Optional[float] = None
    vocal_treatment: str = "original"
    bass_intensity: str = "normal"
    drum_intensity: str = "standard"
    extra_effects: list[str] = Field(default_factory=list)
    target_lufs: float = -14.0

    def validate_choices(self) -> None:
        if self.style_id not in PRESETS:
            raise ValueError(f"Unknown style_id. Options: {', '.join(PRESETS)}")
        if self.energy_level not in ENERGY_LEVELS:
            raise ValueError(f"Unknown energy_level. Options: {', '.join(ENERGY_LEVELS)}")
        if self.tempo_mode not in (*TEMPO_MODES, "custom"):
            raise ValueError(f"Unknown tempo_mode. Options: {', '.join(TEMPO_MODES)}, custom")
        if self.vocal_treatment not in VOCAL_TREATMENTS:
            raise ValueError(f"Unknown vocal_treatment. Options: {', '.join(VOCAL_TREATMENTS)}")
        if self.bass_intensity not in BASS_INTENSITIES:
            raise ValueError(f"Unknown bass_intensity. Options: {', '.join(BASS_INTENSITIES)}")
        if self.drum_intensity not in DRUM_INTENSITIES:
            raise ValueError(f"Unknown drum_intensity. Options: {', '.join(DRUM_INTENSITIES)}")
        bad = [e for e in self.extra_effects if e not in EFFECT_CHOICES]
        if bad:
            raise ValueError(f"Unknown effect(s): {', '.join(bad)}. Options: {', '.join(EFFECT_CHOICES)}")


@router.post("/remix/{file_id}")
def start_remix(file_id: str, body: RemixRequest):
    record = store.get(store.FILES, file_id)
    if not record:
        raise HTTPException(404, "Unknown file_id. Upload a song first.")
    analysis_result = store.get(store.ANALYSIS_CACHE, file_id)
    if not analysis_result:
        raise HTTPException(400, "Run /api/analyze/{file_id} before requesting a remix.")
    try:
        body.validate_choices()
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc

    job = jobs.create_job("remix")
    params = body.model_dump()

    def task(progress_cb):
        result = remix_engine.generate_remix(record["path"], analysis_result, params, progress_cb=progress_cb)
        audio, sr = result.pop("audio"), result["sample_rate"]
        preview_path = config.EXPORT_DIR / f"{job.id}_preview.wav"
        io_utils.save_wav(preview_path, audio, sr, bit_depth=16)
        store.put(store.RESULT_CACHE, job.id, {
            "audio": audio, "sample_rate": sr, "file_id": file_id, "params": params, "meta": result,
        })
        result["result_id"] = job.id
        result["preview_url"] = f"/api/remix/preview/{job.id}"
        return result

    jobs.run_in_background(job, task)
    return {"job_id": job.id}


@router.get("/remix/preview/{result_id}")
def get_preview(result_id: str):
    path = config.EXPORT_DIR / f"{result_id}_preview.wav"
    if not path.exists():
        raise HTTPException(404, "Preview not found or expired.")
    return FileResponse(path, media_type="audio/wav", filename="remix-preview.wav")


@router.get("/options")
def get_options():
    return {
        "styles": [
            {"id": key, "label": v["label"], "description": v["description"],
             "bpm_default": v["bpm_default"], "bpm_range": v["bpm_range"]}
            for key, v in PRESETS.items()
        ],
        "energy_levels": list(ENERGY_LEVELS),
        "tempo_modes": list(TEMPO_MODES) + ["custom"],
        "vocal_treatments": VOCAL_TREATMENTS,
        "bass_intensities": list(BASS_INTENSITIES),
        "drum_intensities": list(DRUM_INTENSITIES),
        "effects": EFFECT_CHOICES,
    }
