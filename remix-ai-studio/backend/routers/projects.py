"""Lightweight project persistence: one JSON file per project under
backend/projects/. Good enough for a single-user demo; a multi-user
deployment should replace this with a real database (see README)."""
from __future__ import annotations

import json
import time
import uuid
from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

import config

router = APIRouter(prefix="/api/projects", tags=["projects"])


class ProjectPayload(BaseModel):
    name: str
    file_id: Optional[str] = None
    filename: Optional[str] = None
    analysis: Optional[dict] = None
    settings: dict = Field(default_factory=dict)
    result_id: Optional[str] = None
    arrangement: Optional[list] = None
    metrics: Optional[dict] = None


def _path(project_id: str):
    return config.PROJECT_DIR / f"{project_id}.json"


@router.get("")
def list_projects():
    out = []
    for f in sorted(config.PROJECT_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
        try:
            data = json.loads(f.read_text())
        except (json.JSONDecodeError, OSError):
            continue
        out.append({
            "id": data.get("id"), "name": data.get("name"),
            "created_at": data.get("created_at"), "updated_at": data.get("updated_at"),
            "bpm": (data.get("analysis") or {}).get("bpm"),
            "key": ((data.get("analysis") or {}).get("key") or {}).get("label"),
            "style_id": (data.get("settings") or {}).get("style_id"),
            "filename": data.get("filename"),
        })
    return out


@router.post("")
def create_project(body: ProjectPayload):
    project_id = uuid.uuid4().hex
    now = time.time()
    data: dict[str, Any] = {"id": project_id, "created_at": now, "updated_at": now, **body.model_dump()}
    _path(project_id).write_text(json.dumps(data, indent=2))
    return data


@router.get("/{project_id}")
def get_project(project_id: str):
    path = _path(project_id)
    if not path.exists():
        raise HTTPException(404, "Project not found.")
    return json.loads(path.read_text())


@router.put("/{project_id}")
def update_project(project_id: str, body: ProjectPayload):
    path = _path(project_id)
    if not path.exists():
        raise HTTPException(404, "Project not found.")
    existing = json.loads(path.read_text())
    data = {**existing, **body.model_dump(), "id": project_id, "updated_at": time.time()}
    path.write_text(json.dumps(data, indent=2))
    return data


@router.delete("/{project_id}")
def delete_project(project_id: str):
    path = _path(project_id)
    if not path.exists():
        raise HTTPException(404, "Project not found.")
    path.unlink()
    return {"deleted": True}
