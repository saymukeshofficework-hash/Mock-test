from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import cleanup
import config
from routers import analyze, export, projects, remix, stems, upload

app = FastAPI(title="REMiX AI backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(remix.router)
app.include_router(stems.router)
app.include_router(export.router)
app.include_router(projects.router)


@app.on_event("startup")
def on_startup() -> None:
    cleanup.sweep_once()
    cleanup.start_background_sweeper()


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "ffmpeg_available": __import__("shutil").which("ffmpeg") is not None,
        "demucs_enabled": config.ENABLE_DEMUCS,
    }
