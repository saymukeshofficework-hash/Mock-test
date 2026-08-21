from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import FileResponse

import config
import store
from audio_engine import io_utils

router = APIRouter(prefix="/api/upload", tags=["upload"])

MIME_BY_EXT = {
    ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4",
    ".aac": "audio/aac", ".flac": "audio/flac", ".ogg": "audio/ogg",
}


@router.post("")
async def upload_song(file: UploadFile):
    if not file.filename:
        raise HTTPException(400, "No file provided.")

    ext = Path(file.filename).suffix.lower()
    contents = await file.read()

    try:
        io_utils.validate_upload(file.filename, len(contents))
    except io_utils.AudioProcessingError as exc:
        raise HTTPException(400, str(exc)) from exc

    file_id = uuid.uuid4().hex
    dest = config.UPLOAD_DIR / f"{file_id}{ext}"
    dest.write_bytes(contents)

    try:
        duration = io_utils.probe_duration(dest)
    except io_utils.AudioProcessingError as exc:
        dest.unlink(missing_ok=True)
        raise HTTPException(400, str(exc)) from exc

    if duration <= 0:
        dest.unlink(missing_ok=True)
        raise HTTPException(400, "This file could not be read — it may be corrupt.")
    if duration > config.MAX_DURATION_SEC:
        dest.unlink(missing_ok=True)
        raise HTTPException(
            400,
            f"Song is {duration/60:.1f} min long — max supported is {config.MAX_DURATION_SEC/60:.0f} min.",
        )

    record = {"path": dest, "filename": file.filename, "duration": duration, "size": len(contents)}
    store.put(store.FILES, file_id, record)

    return {"file_id": file_id, "filename": file.filename, "duration": round(duration, 2), "size": len(contents)}


@router.get("/{file_id}/audio")
def get_uploaded_audio(file_id: str):
    record = store.get(store.FILES, file_id)
    if not record:
        raise HTTPException(404, "Unknown file_id.")
    path: Path = record["path"]
    if not path.exists():
        raise HTTPException(404, "This file has expired from the server and was cleaned up. Please re-upload.")
    media_type = MIME_BY_EXT.get(path.suffix.lower(), "application/octet-stream")
    return FileResponse(path, media_type=media_type, filename=record["filename"])
