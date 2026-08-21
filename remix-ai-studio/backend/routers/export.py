from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

import config
import jobs
import store
from audio_engine import io_utils

router = APIRouter(prefix="/api/export", tags=["export"])

VALID_BITRATES = (128, 192, 256, 320)
VALID_BIT_DEPTHS = (16, 24)


class ExportRequest(BaseModel):
    format: str  # "wav" | "mp3"
    bit_depth: Optional[int] = 16
    bitrate_kbps: Optional[int] = 256


@router.post("/{result_id}")
def start_export(result_id: str, body: ExportRequest):
    cached = store.get(store.RESULT_CACHE, result_id)
    if not cached:
        raise HTTPException(404, "Unknown or expired result_id. Generate a remix first.")
    if body.format not in ("wav", "mp3"):
        raise HTTPException(400, "format must be 'wav' or 'mp3'.")
    if body.format == "wav" and body.bit_depth not in VALID_BIT_DEPTHS:
        raise HTTPException(400, f"bit_depth must be one of {VALID_BIT_DEPTHS}.")
    if body.format == "mp3" and body.bitrate_kbps not in VALID_BITRATES:
        raise HTTPException(400, f"bitrate_kbps must be one of {VALID_BITRATES}.")

    job = jobs.create_job("export")

    def task(progress_cb):
        progress_cb("MASTERING")
        wav_path = config.EXPORT_DIR / f"{job.id}.wav"
        io_utils.save_wav(wav_path, cached["audio"], cached["sample_rate"], bit_depth=body.bit_depth or 16)

        if body.format == "mp3":
            mp3_path = config.EXPORT_DIR / f"{job.id}.mp3"
            io_utils.export_mp3(wav_path, mp3_path, bitrate_kbps=body.bitrate_kbps or 256)
            final_name = f"{job.id}.mp3"
        else:
            final_name = f"{job.id}.wav"

        progress_cb("READY")
        return {
            "download_url": f"/api/export/download/{final_name}",
            "format": body.format,
            "bit_depth": body.bit_depth if body.format == "wav" else None,
            "bitrate_kbps": body.bitrate_kbps if body.format == "mp3" else None,
        }

    jobs.run_in_background(job, task)
    return {"job_id": job.id}


@router.get("/download/{filename}")
def download_export(filename: str):
    if "/" in filename or "\\" in filename or not (filename.endswith(".wav") or filename.endswith(".mp3")):
        raise HTTPException(400, "Invalid filename.")
    path = config.EXPORT_DIR / filename
    if not path.exists():
        raise HTTPException(404, "Export not found or expired.")
    media_type = "audio/mpeg" if filename.endswith(".mp3") else "audio/wav"
    return FileResponse(path, media_type=media_type, filename=filename)
