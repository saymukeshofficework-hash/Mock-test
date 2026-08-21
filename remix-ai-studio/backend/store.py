"""Process-memory registries linking file/analysis/result ids to their
data. Fine for a single-process demo deployment; a multi-worker
production deployment would move these into Redis/Postgres + object
storage (see backend/README.md)."""
from __future__ import annotations

import threading

FILES: dict[str, dict] = {}
ANALYSIS_CACHE: dict[str, dict] = {}
RESULT_CACHE: dict[str, dict] = {}
STEMS_CACHE: dict[str, dict] = {}

_lock = threading.Lock()


def put(store: dict, key: str, value: dict) -> None:
    with _lock:
        store[key] = value


def get(store: dict, key: str):
    return store.get(key)
