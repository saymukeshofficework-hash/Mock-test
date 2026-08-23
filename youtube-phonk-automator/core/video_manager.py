"""Free video selection: any file, any folder. Metadata comes from FFprobe only."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from core.ffprobe_manager import probe_media
from utils.validators import ValidationError

SUPPORTED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v"}


class VideoSelectionError(ValidationError):
    pass


@dataclass
class VideoInfo:
    path: str
    filename: str
    duration_seconds: float
    width: int | None
    height: int | None
    fps: float | None
    codec: str | None
    has_audio: bool

    def as_db_dict(self) -> dict:
        return {
            "path": self.path, "filename": self.filename,
            "duration_seconds": self.duration_seconds, "width": self.width,
            "height": self.height, "fps": self.fps, "codec": self.codec,
            "has_audio": self.has_audio,
        }


def is_supported_video(path: Path) -> bool:
    return path.suffix.lower() in SUPPORTED_VIDEO_EXTENSIONS


def list_videos_in_folder(folder: Path) -> list[Path]:
    folder = Path(folder)
    if not folder.is_dir():
        raise VideoSelectionError(f"Folder not found: {folder}")
    return sorted(
        (p for p in folder.iterdir() if p.is_file() and is_supported_video(p)),
        key=lambda p: p.name.lower(),
    )


def get_video_info(ffprobe_path: str, video_path: Path) -> VideoInfo:
    video_path = Path(video_path)
    if not video_path.exists():
        raise VideoSelectionError("Please select a video.")
    if not is_supported_video(video_path):
        raise VideoSelectionError(
            f"Unsupported video format: {video_path.suffix}. "
            f"Supported: {', '.join(sorted(SUPPORTED_VIDEO_EXTENSIONS))}"
        )

    probed = probe_media(ffprobe_path, video_path)
    return VideoInfo(
        path=str(video_path),
        filename=video_path.name,
        duration_seconds=probed.duration_seconds,
        width=probed.width,
        height=probed.height,
        fps=probed.fps,
        codec=probed.video_codec,
        has_audio=probed.has_audio,
    )


def check_duration_fit(source: VideoInfo, target_seconds: float) -> str:
    """Returns 'exact', 'trim' (source longer) or 'short' (source shorter)."""
    if source.duration_seconds < target_seconds:
        return "short"
    if source.duration_seconds > target_seconds:
        return "trim"
    return "exact"
