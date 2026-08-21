from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

import config
import jobs
import store
from audio_engine import io_utils, vocal_separation

router = APIRouter(prefix="/api/stems", tags=["stems"])

STEM_NAMES = ("vocals", "instrumental", "drums", "bass", "other")


@router.post("/{file_id}")
def start_stem_separation(file_id: str):
    record = store.get(store.FILES, file_id)
    if not record:
        raise HTTPException(404, "Unknown file_id. Upload a song first.")

    job = jobs.create_job("stems")

    def task(progress_cb):
        progress_cb("ANALYZING")
        y_stereo, sr = io_utils.load_audio(record["path"], mono=False)
        progress_cb("VOCAL_PROCESSING")

        if config.ENABLE_DEMUCS and vocal_separation.demucs_available():
            stems = vocal_separation.demucs_separate(str(record["path"]), sr)
        else:
            stems = vocal_separation.center_channel_isolate(y_stereo, sr)

        saved = {}
        for name in STEM_NAMES:
            audio = stems.get(name)
            if audio is None:
                continue
            path = config.EXPORT_DIR / f"{job.id}_{name}.wav"
            io_utils.save_wav(path, audio, sr, bit_depth=16)
            saved[name] = f"/api/stems/download/{job.id}/{name}"

        progress_cb("READY")
        result = {"stems": saved, "method": stems["method"], "quality": stems["quality"], "note": stems["note"]}
        store.put(store.STEMS_CACHE, file_id, result)
        return result

    jobs.run_in_background(job, task)
    return {"job_id": job.id}


@router.get("/download/{result_id}/{stem}")
def download_stem(result_id: str, stem: str):
    if stem not in STEM_NAMES:
        raise HTTPException(400, f"Unknown stem '{stem}'.")
    path = config.EXPORT_DIR / f"{result_id}_{stem}.wav"
    if not path.exists():
        raise HTTPException(404, "Stem not found or expired.")
    return FileResponse(path, media_type="audio/wav", filename=f"{stem}.wav")


@router.get("/status")
def demucs_status():
    return {
        "demucs_enabled": config.ENABLE_DEMUCS,
        "demucs_installed": vocal_separation.demucs_available(),
        "active_method": "demucs" if (config.ENABLE_DEMUCS and vocal_separation.demucs_available()) else "center_channel_heuristic",
    }
