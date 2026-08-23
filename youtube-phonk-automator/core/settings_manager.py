"""Typed access to app settings, persisted in the settings table."""
from __future__ import annotations

from dataclasses import asdict, dataclass, field, fields
from pathlib import Path
from typing import Any

from database.database import Database

DEFAULT_MUSIC_VOLUME = 0.65
DEFAULT_FADE_IN = 2.0
DEFAULT_FADE_OUT = 3.0
DEFAULT_DURATION_SECONDS = 210.0  # 03:30


@dataclass
class AppSettings:
    ffmpeg_path: str = ""
    ffprobe_path: str = ""
    output_folder: str = ""
    default_music_folder: str = ""
    default_duration_seconds: float = DEFAULT_DURATION_SECONDS
    default_music_volume: float = DEFAULT_MUSIC_VOLUME
    default_fade_in: float = DEFAULT_FADE_IN
    default_fade_out: float = DEFAULT_FADE_OUT
    default_transition: str = "crossfade"
    default_transition_duration: float = 0.5
    default_category: str = "Music"
    default_playlist: str = ""
    default_audience: str = "Not made for kids"
    default_visibility: str = "Public"
    browser: str = "Chrome"
    browser_executable: str = ""
    browser_profile: str = ""
    preview_before_publish: bool = True
    auto_publish: bool = False
    quality_preset: str = "balanced"
    first_run_complete: bool = False

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class SettingsManager:
    """Loads AppSettings from the database on start, saves on change."""

    def __init__(self, db: Database):
        self._db = db
        self.settings = self._load()

    def _load(self) -> AppSettings:
        stored = self._db.all_settings()
        valid_keys = {f.name for f in fields(AppSettings)}
        filtered = {key: value for key, value in stored.items() if key in valid_keys}
        return AppSettings(**filtered)

    def get(self) -> AppSettings:
        return self.settings

    def update(self, **changes: Any) -> AppSettings:
        valid_keys = {f.name for f in fields(AppSettings)}
        for key, value in changes.items():
            if key not in valid_keys:
                raise KeyError(f"Unknown setting: {key}")
            setattr(self.settings, key, value)
            self._db.set_setting(key, value)
        return self.settings

    def save_all(self) -> None:
        for key, value in self.settings.to_dict().items():
            self._db.set_setting(key, value)

    def ffmpeg_configured(self) -> bool:
        return bool(self.settings.ffmpeg_path) and Path(self.settings.ffmpeg_path).exists()

    def ffprobe_configured(self) -> bool:
        return bool(self.settings.ffprobe_path) and Path(self.settings.ffprobe_path).exists()
