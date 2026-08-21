from __future__ import annotations

from fastapi import APIRouter, HTTPException

import jobs
import store
from audio_engine import remix_engine

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post("/analyze/{file_id}")
def start_analysis(file_id: str):
    record = store.get(store.FILES, file_id)
    if not record:
        raise HTTPException(404, "Unknown file_id. Upload a song first.")

    job = jobs.create_job("analyze")

    def task(progress_cb):
        result = remix_engine.analyze_song(record["path"], progress_cb=progress_cb)
        store.put(store.ANALYSIS_CACHE, file_id, result)
        return {**result, "file_id": file_id}

    jobs.run_in_background(job, task)
    return {"job_id": job.id}


@router.get("/analyze/{file_id}/cached")
def get_cached_analysis(file_id: str):
    result = store.get(store.ANALYSIS_CACHE, file_id)
    if not result:
        raise HTTPException(404, "No analysis cached for this file yet — run /api/analyze/{file_id} first.")
    return result


@router.get("/status/{job_id}")
def get_status(job_id: str):
    job = jobs.get_job(job_id)
    if not job:
        raise HTTPException(404, "Unknown job_id.")
    return {
        "job_id": job.id, "kind": job.kind, "stage": job.stage,
        "progress": job.progress, "done": job.done, "error": job.error,
        "result": job.result if job.done and not job.error else None,
    }


@router.post("/cancel/{job_id}")
def cancel(job_id: str):
    ok = jobs.cancel_job(job_id)
    if not ok:
        raise HTTPException(404, "Unknown or already-finished job_id.")
    return {"cancelled": True}
