"""Parses the YouTube-metadata Markdown format described in the README.

Format (one or more records per file)::

    # VIDEO 1
    ## TITLE
    Dark Phonk Night
    ## DESCRIPTION
    Description one.
    ## MUSIC
    random
    ## LENGTH
    03:30
    # VIDEO 2
    ## TITLE
    ...

A level-1 heading (``# ...``) starts a new record; a level-2 heading
(``## FIELD``) starts a field within the current record, and every
following line (until the next heading) is that field's value. The file is
only ever read, never modified.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

from utils.validators import ValidationError, parse_duration

_HEADER_RE = re.compile(r"^(#{1,2})[ \t]+(.*\S)[ \t]*$")

REQUIRED_FIELDS = ("TITLE", "DESCRIPTION")
_FLOAT_FIELDS = ("MUSIC_VOLUME", "FADE_IN", "FADE_OUT")


class MarkdownParseError(ValidationError):
    """Raised for malformed or incomplete Markdown metadata."""


@dataclass
class YoutubeJobData:
    title: str
    description: str
    tags: list[str] = field(default_factory=list)
    hashtags: list[str] = field(default_factory=list)
    category: str | None = None
    visibility: str | None = None
    audience: str | None = None
    playlist: str | None = None
    language: str | None = None
    music: str | None = None
    music_volume: float | None = None
    fade_in: float | None = None
    fade_out: float | None = None
    length_seconds: float | None = None
    length_raw: str | None = None
    record_label: str | None = None
    record_index: int = 0
    source_path: str = ""


def _split_into_raw_records(text: str) -> list[tuple[str | None, dict[str, str]]]:
    """Return [(h1_label, {FIELD: raw_value})] preserving encounter order."""
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")

    records: list[tuple[str | None, dict[str, str]]] = []
    current_label: str | None = None
    current_fields: dict[str, str] = {}
    current_field_name: str | None = None
    current_field_lines: list[str] = []

    def flush_field() -> None:
        nonlocal current_field_name, current_field_lines
        if current_field_name is not None:
            value = "\n".join(current_field_lines).strip("\n")
            current_fields[current_field_name] = value.strip()
        current_field_name = None
        current_field_lines = []

    def flush_record() -> None:
        flush_field()
        nonlocal current_label, current_fields
        if current_fields:
            records.append((current_label, current_fields))
        current_label = None
        current_fields = {}

    for raw_line in lines:
        match = _HEADER_RE.match(raw_line)
        if match:
            level, text_part = len(match.group(1)), match.group(2)
            if level == 1:
                flush_record()
                current_label = text_part
                continue
            if level == 2:
                flush_field()
                current_field_name = text_part.strip().upper().replace(" ", "_")
                continue
        if current_field_name is not None:
            current_field_lines.append(raw_line)
        # lines before the first "## FIELD" (e.g. blank lines, or text right
        # after an "# H1" label) are intentionally discarded

    flush_record()
    return records


def _normalize_tags(raw: str) -> list[str]:
    return [tag.strip() for tag in raw.split(",") if tag.strip()]


def _normalize_hashtags(raw: str) -> list[str]:
    return [tag for tag in raw.split() if tag]


def _build_job(label: str | None, raw_fields: dict[str, str], index: int, source_path: str) -> YoutubeJobData:
    missing = [name for name in REQUIRED_FIELDS if not raw_fields.get(name, "").strip()]
    if missing:
        where = f"record {index + 1}" + (f" ('{label}')" if label else "")
        raise MarkdownParseError(
            f"Markdown {where} is missing required field(s): {', '.join(missing)}."
        )

    floats: dict[str, float] = {}
    for name in _FLOAT_FIELDS:
        raw_value = raw_fields.get(name, "").strip()
        if not raw_value:
            continue
        try:
            floats[name] = float(raw_value)
        except ValueError as exc:
            where = f"record {index + 1}" + (f" ('{label}')" if label else "")
            raise MarkdownParseError(f"Markdown {where} field {name} must be a number.") from exc

    length_raw = raw_fields.get("LENGTH", "").strip() or None
    length_seconds = None
    if length_raw:
        try:
            length_seconds = parse_duration(length_raw)
        except ValidationError as exc:
            where = f"record {index + 1}" + (f" ('{label}')" if label else "")
            raise MarkdownParseError(f"Markdown {where} field LENGTH is invalid: {exc}") from exc

    return YoutubeJobData(
        title=raw_fields["TITLE"].strip(),
        description=raw_fields["DESCRIPTION"].strip(),
        tags=_normalize_tags(raw_fields.get("TAGS", "")),
        hashtags=_normalize_hashtags(raw_fields.get("HASHTAGS", "")),
        category=raw_fields.get("CATEGORY", "").strip() or None,
        visibility=raw_fields.get("VISIBILITY", "").strip() or None,
        audience=raw_fields.get("AUDIENCE", "").strip() or None,
        playlist=raw_fields.get("PLAYLIST", "").strip() or None,
        language=raw_fields.get("LANGUAGE", "").strip() or None,
        music=raw_fields.get("MUSIC", "").strip() or None,
        music_volume=floats.get("MUSIC_VOLUME"),
        fade_in=floats.get("FADE_IN"),
        fade_out=floats.get("FADE_OUT"),
        length_seconds=length_seconds,
        length_raw=length_raw,
        record_label=label,
        record_index=index,
        source_path=source_path,
    )


def parse_markdown_text(text: str, source_path: str = "") -> list[YoutubeJobData]:
    raw_records = _split_into_raw_records(text)
    if not raw_records:
        raise MarkdownParseError("Markdown file has no YouTube metadata records.")
    return [
        _build_job(label, raw_fields, index, source_path)
        for index, (label, raw_fields) in enumerate(raw_records)
    ]


def parse_markdown_file(path: Path) -> list[YoutubeJobData]:
    path = Path(path)
    if not path.exists():
        raise MarkdownParseError(f"Markdown file not found: {path}")
    text = path.read_text(encoding="utf-8")
    return parse_markdown_text(text, source_path=str(path))
