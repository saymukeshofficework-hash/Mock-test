"""SQLite access layer.

One connection, guarded by a lock, shared across the (single) background
worker thread and the Tk main thread. No passwords/cookies/tokens are ever
stored here — see CLAUDE.md.
"""
from __future__ import annotations

import json
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any, Iterable

SCHEMA = """
CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    filename TEXT NOT NULL,
    duration_seconds REAL,
    width INTEGER,
    height INTEGER,
    fps REAL,
    codec TEXT,
    has_audio INTEGER,
    added_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS music (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    filename TEXT NOT NULL,
    duration_seconds REAL,
    format TEXT,
    added_at TEXT NOT NULL,
    used_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    md_source_path TEXT,
    job_index INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT,
    hashtags TEXT,
    category TEXT,
    visibility TEXT,
    audience TEXT,
    playlist TEXT,
    language TEXT,
    video_path TEXT,
    music_path TEXT,
    music_mode TEXT NOT NULL DEFAULT 'manual',
    length_seconds REAL,
    remove_audio INTEGER NOT NULL DEFAULT 1,
    add_music INTEGER NOT NULL DEFAULT 1,
    music_volume REAL NOT NULL DEFAULT 0.65,
    fade_in REAL NOT NULL DEFAULT 2,
    fade_out REAL NOT NULL DEFAULT 3,
    add_cuts INTEGER NOT NULL DEFAULT 0,
    cut_interval REAL NOT NULL DEFAULT 20,
    randomize_cuts INTEGER NOT NULL DEFAULT 0,
    cut_seed INTEGER,
    add_transitions INTEGER NOT NULL DEFAULT 0,
    transition_type TEXT NOT NULL DEFAULT 'crossfade',
    transition_duration REAL NOT NULL DEFAULT 0.5,
    quality_preset TEXT NOT NULL DEFAULT 'balanced',
    output_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    youtube_url TEXT,
    status TEXT NOT NULL DEFAULT 'not_started',
    published_at TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS browser_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    browser_type TEXT NOT NULL,
    executable_path TEXT,
    profile_dir TEXT,
    created_at TEXT NOT NULL
);
"""


def _now() -> str:
    return time.strftime("%Y-%m-%d %H:%M:%S")


class Database:
    def __init__(self, db_path: Path):
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA foreign_keys = ON")
        with self._lock:
            self._conn.executescript(SCHEMA)
            self._conn.commit()

    def close(self) -> None:
        with self._lock:
            self._conn.close()

    # -- generic helpers -------------------------------------------------
    def _execute(self, query: str, params: Iterable[Any] = ()) -> sqlite3.Cursor:
        with self._lock:
            cursor = self._conn.execute(query, tuple(params))
            self._conn.commit()
            return cursor

    def _query(self, query: str, params: Iterable[Any] = ()) -> list[sqlite3.Row]:
        with self._lock:
            return list(self._conn.execute(query, tuple(params)))

    # -- videos ------------------------------------------------------------
    def upsert_video(self, info: dict) -> int:
        self._execute(
            """INSERT INTO videos (path, filename, duration_seconds, width, height,
                                    fps, codec, has_audio, added_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(path) DO UPDATE SET
                    filename=excluded.filename, duration_seconds=excluded.duration_seconds,
                    width=excluded.width, height=excluded.height, fps=excluded.fps,
                    codec=excluded.codec, has_audio=excluded.has_audio""",
            (
                info["path"], info["filename"], info.get("duration_seconds"),
                info.get("width"), info.get("height"), info.get("fps"),
                info.get("codec"), int(info.get("has_audio", False)), _now(),
            ),
        )
        row = self._query("SELECT id FROM videos WHERE path = ?", (info["path"],))
        return row[0]["id"]

    # -- music ---------------------------------------------------------------
    def upsert_music(self, info: dict) -> int:
        self._execute(
            """INSERT INTO music (path, filename, duration_seconds, format, added_at)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(path) DO UPDATE SET
                    filename=excluded.filename, duration_seconds=excluded.duration_seconds,
                    format=excluded.format""",
            (info["path"], info["filename"], info.get("duration_seconds"), info.get("format"), _now()),
        )
        row = self._query("SELECT id FROM music WHERE path = ?", (info["path"],))
        return row[0]["id"]

    def mark_music_used(self, music_path: str) -> None:
        self._execute(
            "UPDATE music SET used_count = used_count + 1, last_used_at = ? WHERE path = ?",
            (_now(), music_path),
        )

    def get_music_usage(self, folder: str) -> dict[str, int]:
        rows = self._query(
            "SELECT path, used_count FROM music WHERE path LIKE ?", (f"{folder}%",)
        )
        return {row["path"]: row["used_count"] for row in rows}

    # -- jobs ------------------------------------------------------------
    _JOB_COLUMNS = (
        "md_source_path", "job_index", "title", "description", "tags", "hashtags",
        "category", "visibility", "audience", "playlist", "language", "video_path",
        "music_path", "music_mode", "length_seconds", "remove_audio", "add_music",
        "music_volume", "fade_in", "fade_out", "add_cuts", "cut_interval",
        "randomize_cuts", "cut_seed", "add_transitions", "transition_type",
        "transition_duration", "quality_preset", "output_path", "status",
    )

    def create_job(self, job: dict) -> int:
        """Insert a job. Only keys present in ``job`` are set; the rest fall
        back to the table's own DEFAULTs (see SCHEMA) instead of NULL."""
        now = _now()
        columns = [c for c in self._JOB_COLUMNS if c in job]
        if "title" not in columns or "description" not in columns:
            raise ValueError("Job requires at least 'title' and 'description'.")
        values = [job[c] for c in columns]
        placeholders = ", ".join("?" for _ in columns)
        cursor = self._execute(
            f"INSERT INTO jobs ({', '.join(columns)}, created_at, updated_at) "
            f"VALUES ({placeholders}, ?, ?)",
            (*values, now, now),
        )
        return cursor.lastrowid

    def update_job(self, job_id: int, **fields: Any) -> None:
        if not fields:
            return
        set_clause = ", ".join(f"{key} = ?" for key in fields)
        self._execute(
            f"UPDATE jobs SET {set_clause}, updated_at = ? WHERE id = ?",
            (*fields.values(), _now(), job_id),
        )

    def get_job(self, job_id: int) -> sqlite3.Row | None:
        rows = self._query("SELECT * FROM jobs WHERE id = ?", (job_id,))
        return rows[0] if rows else None

    def list_jobs(self, status: str | None = None) -> list[sqlite3.Row]:
        if status:
            return self._query("SELECT * FROM jobs WHERE status = ? ORDER BY id", (status,))
        return self._query("SELECT * FROM jobs ORDER BY id")

    def find_unfinished_jobs(self) -> list[sqlite3.Row]:
        return self._query(
            "SELECT * FROM jobs WHERE status IN ('processing', 'uploading') ORDER BY id"
        )

    # -- uploads ---------------------------------------------------------
    def create_upload(self, job_id: int) -> int:
        now = _now()
        cursor = self._execute(
            "INSERT INTO uploads (job_id, status, created_at, updated_at) VALUES (?, 'not_started', ?, ?)",
            (job_id, now, now),
        )
        return cursor.lastrowid

    def update_upload(self, upload_id: int, **fields: Any) -> None:
        if not fields:
            return
        set_clause = ", ".join(f"{key} = ?" for key in fields)
        self._execute(
            f"UPDATE uploads SET {set_clause}, updated_at = ? WHERE id = ?",
            (*fields.values(), _now(), upload_id),
        )

    def list_history(self) -> list[sqlite3.Row]:
        return self._query(
            """SELECT jobs.id AS job_id, jobs.title, jobs.video_path, jobs.music_path,
                      jobs.length_seconds, jobs.status, jobs.output_path, jobs.created_at,
                      uploads.youtube_url, uploads.status AS upload_status
               FROM jobs
               LEFT JOIN uploads ON uploads.job_id = jobs.id
               ORDER BY jobs.id DESC"""
        )

    # -- settings (simple JSON-valued KV store) ---------------------------
    def get_setting(self, key: str, default: Any = None) -> Any:
        rows = self._query("SELECT value FROM settings WHERE key = ?", (key,))
        if not rows:
            return default
        return json.loads(rows[0]["value"])

    def set_setting(self, key: str, value: Any) -> None:
        self._execute(
            """INSERT INTO settings (key, value) VALUES (?, ?)
               ON CONFLICT(key) DO UPDATE SET value = excluded.value""",
            (key, json.dumps(value)),
        )

    def all_settings(self) -> dict[str, Any]:
        rows = self._query("SELECT key, value FROM settings")
        return {row["key"]: json.loads(row["value"]) for row in rows}

    # -- browser profiles --------------------------------------------------
    def save_browser_profile(self, name: str, browser_type: str, executable_path: str, profile_dir: str) -> int:
        cursor = self._execute(
            """INSERT INTO browser_profiles (name, browser_type, executable_path, profile_dir, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (name, browser_type, executable_path, profile_dir, _now()),
        )
        return cursor.lastrowid

    def list_browser_profiles(self) -> list[sqlite3.Row]:
        return self._query("SELECT * FROM browser_profiles ORDER BY id")
