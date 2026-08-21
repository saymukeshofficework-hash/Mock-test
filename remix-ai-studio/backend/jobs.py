"""Minimal in-memory background job queue.

This is intentionally simple (a daemon thread per job, a dict for
status) so the demo runs with zero extra infrastructure. A production
deployment handling real concurrent load should swap this for a real
queue (Celery + Redis/RabbitMQ, or an async task runner) — the job
interface (`create_job` / `run_in_background` / `get_job`) is written so
that swap only touches this one file.
"""
from __future__ import annotations

import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Optional

STAGE_ORDER = ["ANALYZING", "BEAT_MATCHING", "VOCAL_PROCESSING", "BUILDING_DROP", "MIXING", "MASTERING", "READY"]


class JobCancelled(Exception):
    pass


@dataclass
class Job:
    id: str
    kind: str
    stage: str = "PENDING"
    progress: float = 0.0
    result: Optional[dict] = None
    error: Optional[str] = None
    done: bool = False
    cancelled: bool = False
    created_at: float = field(default_factory=time.time)


_JOBS: dict[str, Job] = {}
_LOCK = threading.Lock()


def create_job(kind: str) -> Job:
    job = Job(id=uuid.uuid4().hex, kind=kind)
    with _LOCK:
        _JOBS[job.id] = job
    return job


def get_job(job_id: str) -> Optional[Job]:
    return _JOBS.get(job_id)


def cancel_job(job_id: str) -> bool:
    job = _JOBS.get(job_id)
    if not job or job.done:
        return False
    job.cancelled = True
    return True


def run_in_background(job: Job, fn: Callable, *args, **kwargs) -> None:
    def progress_cb(stage: str) -> None:
        if job.cancelled:
            raise JobCancelled()
        job.stage = stage
        try:
            job.progress = round((STAGE_ORDER.index(stage) + 1) / len(STAGE_ORDER), 2)
        except ValueError:
            pass

    def target() -> None:
        try:
            result = fn(*args, progress_cb=progress_cb, **kwargs)
            job.result = result
            job.stage = "READY"
            job.progress = 1.0
            job.done = True
        except JobCancelled:
            job.stage = "CANCELLED"
            job.error = "Cancelled by user."
            job.done = True
        except Exception as exc:  # noqa: BLE001
            job.stage = "ERROR"
            job.error = str(exc)
            job.done = True

    thread = threading.Thread(target=target, daemon=True)
    thread.start()
