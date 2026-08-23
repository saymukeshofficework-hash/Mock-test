"""Small, dependency-free validation helpers shared by core/ and ui/."""
from __future__ import annotations

import re

_DURATION_RE = re.compile(r"^(?:(\d+):)?(\d{1,2}):(\d{2})$")


class ValidationError(ValueError):
    """User-facing validation failure. str(err) is safe to show directly."""


def parse_duration(text: str) -> float:
    """Parse 'MM:SS' or 'HH:MM:SS' into seconds. Raises ValidationError."""
    if not text or not text.strip():
        raise ValidationError("Target duration is invalid.")

    match = _DURATION_RE.match(text.strip())
    if not match:
        raise ValidationError("Target duration is invalid.")

    hours_str, minutes_str, seconds_str = match.groups()
    hours = int(hours_str) if hours_str else 0
    minutes = int(minutes_str)
    seconds = int(seconds_str)

    if minutes >= 60 or seconds >= 60:
        raise ValidationError("Target duration is invalid.")

    total = hours * 3600 + minutes * 60 + seconds
    if total <= 0:
        raise ValidationError("Target duration is invalid.")

    return float(total)


def format_duration(total_seconds: float) -> str:
    """Format seconds as HH:MM:SS (or MM:SS when under an hour)."""
    total = int(round(total_seconds))
    hours, remainder = divmod(total, 3600)
    minutes, seconds = divmod(remainder, 60)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    return f"{minutes:02d}:{seconds:02d}"


def validate_volume(value: float) -> float:
    if not (0.0 <= value <= 2.0):
        raise ValidationError("Music volume must be between 0.0 and 2.0.")
    return value


def validate_positive_number(value: float, field_name: str) -> float:
    if value < 0:
        raise ValidationError(f"{field_name} cannot be negative.")
    return value
