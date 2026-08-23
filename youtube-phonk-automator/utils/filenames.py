"""Windows-safe filename generation from YouTube titles."""
from __future__ import annotations

import re
from pathlib import Path

_INVALID_WINDOWS_CHARS = re.compile(r'[<>:"/\\|?*\x00-\x1f]')
_RESERVED_NAMES = {
    "CON", "PRN", "AUX", "NUL",
    *(f"COM{i}" for i in range(1, 10)),
    *(f"LPT{i}" for i in range(1, 10)),
}
_MAX_STEM_LENGTH = 150


def sanitize_filename(title: str, fallback: str = "video") -> str:
    """Convert an arbitrary title into a safe Windows filename stem (no extension)."""
    if not title or not title.strip():
        title = fallback

    stem = _INVALID_WINDOWS_CHARS.sub("", title)
    stem = re.sub(r"\s+", "_", stem.strip())
    stem = stem.strip("._ ")

    if not stem:
        stem = fallback

    if stem.upper() in _RESERVED_NAMES:
        stem = f"_{stem}"

    if len(stem) > _MAX_STEM_LENGTH:
        stem = stem[:_MAX_STEM_LENGTH].rstrip("._ ") or fallback

    return stem


def unique_output_path(directory: Path, title: str, extension: str = ".mp4") -> Path:
    """Return a non-colliding output path, appending _001, _002, ... as needed."""
    directory.mkdir(parents=True, exist_ok=True)
    stem = sanitize_filename(title)
    if not extension.startswith("."):
        extension = f".{extension}"

    candidate = directory / f"{stem}{extension}"
    if not candidate.exists():
        return candidate

    counter = 1
    while True:
        candidate = directory / f"{stem}_{counter:03d}{extension}"
        if not candidate.exists():
            return candidate
        counter += 1
