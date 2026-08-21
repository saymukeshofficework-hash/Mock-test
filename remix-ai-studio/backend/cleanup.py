"""Periodic sweep that deletes old uploads/exports/tmp files so a demo
server doesn't slowly fill its disk. Runs once at startup and then every
hour on a daemon thread."""
from __future__ import annotations

import threading
import time
from pathlib import Path

import config

SWEEP_INTERVAL_SEC = 3600


def sweep_once() -> int:
    cutoff = time.time() - config.FILE_RETENTION_HOURS * 3600
    removed = 0
    for directory in (config.UPLOAD_DIR, config.EXPORT_DIR, config.TMP_DIR):
        for path in Path(directory).glob("*"):
            try:
                if path.is_file() and path.stat().st_mtime < cutoff:
                    path.unlink(missing_ok=True)
                    removed += 1
            except OSError:
                continue
    return removed


def start_background_sweeper() -> None:
    def loop():
        while True:
            try:
                sweep_once()
            except Exception:  # noqa: BLE001
                pass
            time.sleep(SWEEP_INTERVAL_SEC)

    threading.Thread(target=loop, daemon=True).start()
