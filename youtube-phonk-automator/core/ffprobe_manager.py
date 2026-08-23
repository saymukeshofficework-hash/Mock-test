"""FFprobe wrapper: reads container metadata only, never decodes frames."""
from __future__ import annotations

import json
import subprocess
from dataclasses import dataclass
from pathlib import Path

from utils.logger import get_logger
from utils.validators import ValidationError

_logger = get_logger("ffprobe")


class FFprobeError(ValidationError):
    """Friendly, user-facing FFprobe failure."""


@dataclass
class ProbedMediaInfo:
    duration_seconds: float | None
    width: int | None
    height: int | None
    fps: float | None
    video_codec: str | None
    audio_codec: str | None
    has_audio: bool
    format_name: str | None


def _parse_frame_rate(raw: str | None) -> float | None:
    if not raw or "/" not in raw:
        return None
    num_str, _, den_str = raw.partition("/")
    try:
        num, den = float(num_str), float(den_str)
    except ValueError:
        return None
    if den == 0:
        return None
    return round(num / den, 3)


def parse_probe_json(data: dict) -> ProbedMediaInfo:
    """Pure function: turn ffprobe's -show_format -show_streams JSON into ProbedMediaInfo.

    Kept separate from subprocess invocation so it can be unit tested without
    an ffprobe binary.
    """
    fmt = data.get("format", {})
    streams = data.get("streams", [])

    video_stream = next((s for s in streams if s.get("codec_type") == "video"), None)
    audio_streams = [s for s in streams if s.get("codec_type") == "audio"]

    duration_raw = fmt.get("duration") or (video_stream or {}).get("duration")
    try:
        duration = float(duration_raw) if duration_raw is not None else None
    except (TypeError, ValueError):
        duration = None

    width = height = fps = None
    video_codec = None
    if video_stream:
        width = video_stream.get("width")
        height = video_stream.get("height")
        video_codec = video_stream.get("codec_name")
        fps = _parse_frame_rate(video_stream.get("r_frame_rate")) or _parse_frame_rate(
            video_stream.get("avg_frame_rate")
        )

    return ProbedMediaInfo(
        duration_seconds=duration,
        width=width,
        height=height,
        fps=fps,
        video_codec=video_codec,
        audio_codec=audio_streams[0].get("codec_name") if audio_streams else None,
        has_audio=bool(audio_streams),
        format_name=fmt.get("format_name"),
    )


def build_probe_command(ffprobe_path: str, file_path: Path) -> list[str]:
    return [
        ffprobe_path,
        "-v", "error",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        str(file_path),
    ]


def probe_media(ffprobe_path: str, file_path: Path) -> ProbedMediaInfo:
    if not ffprobe_path:
        raise FFprobeError("FFprobe was not found. Please configure it in Settings.")

    file_path = Path(file_path)
    if not file_path.exists():
        raise FFprobeError(f"File not found: {file_path}")

    command = build_probe_command(ffprobe_path, file_path)
    try:
        result = subprocess.run(
            command, capture_output=True, text=True, encoding="utf-8", errors="replace"
        )
    except FileNotFoundError as exc:
        raise FFprobeError("FFprobe was not found. Please configure it in Settings.") from exc
    except OSError as exc:
        raise FFprobeError(f"Could not run FFprobe: {exc}") from exc

    if result.returncode != 0:
        stderr_text = (result.stderr or "").strip()
        _logger.error("FFprobe failed on %s (exit %s): %s", file_path, result.returncode, stderr_text)
        raise FFprobeError(f"Could not read media file: {file_path.name}") from RuntimeError(
            stderr_text or f"ffprobe exited with code {result.returncode} and no error output"
        )

    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        _logger.error("FFprobe returned invalid JSON for %s: %s", file_path, result.stdout[:500])
        raise FFprobeError(f"Could not read media file: {file_path.name}") from exc

    info = parse_probe_json(data)
    if info.duration_seconds is None:
        _logger.error("FFprobe found no duration for %s. Raw output: %s", file_path, result.stdout[:1000])
        raise FFprobeError(f"Could not read media file: {file_path.name}") from RuntimeError(
            "FFprobe ran successfully but reported no duration for this file. "
            "It may be corrupted, still syncing from cloud storage (OneDrive/Google "
            f"Photos), or use a container FFprobe couldn't parse.\n\nRaw ffprobe output:\n{result.stdout[:1000]}"
        )
    return info
