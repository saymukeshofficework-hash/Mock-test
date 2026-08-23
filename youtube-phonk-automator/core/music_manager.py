"""Music folder scanning and selection (manual / random / sequential / unused-random)."""
from __future__ import annotations

import random
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

from core.ffprobe_manager import probe_media
from database.database import Database
from utils.validators import ValidationError

SUPPORTED_MUSIC_EXTENSIONS = {".mp3", ".wav", ".m4a", ".aac", ".flac"}

SELECTION_MODES = ("manual", "random", "sequential", "unused_random")


class MusicSelectionError(ValidationError):
    pass


@dataclass
class MusicInfo:
    path: str
    filename: str
    duration_seconds: float
    format: str | None

    def as_db_dict(self) -> dict:
        return {
            "path": self.path, "filename": self.filename,
            "duration_seconds": self.duration_seconds, "format": self.format,
        }


def is_supported_music(path: Path) -> bool:
    return path.suffix.lower() in SUPPORTED_MUSIC_EXTENSIONS


def scan_music_folder(folder: Path) -> list[Path]:
    folder = Path(folder)
    if not folder.is_dir():
        raise MusicSelectionError(f"Music folder not found: {folder}")
    return sorted(
        (p for p in folder.iterdir() if p.is_file() and is_supported_music(p)),
        key=lambda p: p.name.lower(),
    )


def get_music_info(ffprobe_path: str, music_path: Path) -> MusicInfo:
    music_path = Path(music_path)
    if not music_path.exists():
        raise MusicSelectionError("Please select music.")
    if not is_supported_music(music_path):
        raise MusicSelectionError(
            f"Unsupported music format: {music_path.suffix}. "
            f"Supported: {', '.join(sorted(SUPPORTED_MUSIC_EXTENSIONS))}"
        )
    probed = probe_media(ffprobe_path, music_path)
    return MusicInfo(
        path=str(music_path),
        filename=music_path.name,
        duration_seconds=probed.duration_seconds,
        format=music_path.suffix.lstrip("."),
    )


def _sequential_key(folder: str) -> str:
    return f"sequential_index::{folder}"


def select_music(
    mode: str,
    folder: Path,
    db: Database,
    manual_path: Path | None = None,
    candidates: Sequence[Path] | None = None,
    rng: random.Random | None = None,
) -> Path:
    """Pick one music file per the requested mode. Never picks silently
    across an empty folder - raises MusicSelectionError instead."""
    if mode not in SELECTION_MODES:
        raise MusicSelectionError(f"Unknown music selection mode: {mode}")

    if mode == "manual":
        if manual_path is None:
            raise MusicSelectionError("Please select music.")
        manual_path = Path(manual_path)
        if not manual_path.exists() or not is_supported_music(manual_path):
            raise MusicSelectionError("Please select music.")
        return manual_path

    pool = list(candidates) if candidates is not None else scan_music_folder(folder)
    if not pool:
        raise MusicSelectionError("No music files found in the selected folder.")

    rng = rng or random

    if mode == "random":
        return rng.choice(pool)

    if mode == "sequential":
        folder_key = str(folder)
        index = db.get_setting(_sequential_key(folder_key), 0) % len(pool)
        chosen = pool[index]
        db.set_setting(_sequential_key(folder_key), (index + 1) % len(pool))
        return chosen

    # unused_random
    usage = db.get_music_usage(str(folder))
    unused = [p for p in pool if usage.get(str(p), 0) == 0]
    return rng.choice(unused if unused else pool)
