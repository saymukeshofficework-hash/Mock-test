"""Builds and runs FFmpeg render commands.

Every command is assembled as an argv list (never ``shell=True``) and every
piece of graph/segment math lives in small pure functions so it can be unit
tested without an FFmpeg binary. Exactly one FFmpeg subprocess runs at a
time; progress is read line-by-line from ``-progress pipe:1`` (never the
whole file at once) to stay within the 4 GB RAM budget.
"""
from __future__ import annotations

import random
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from utils.validators import ValidationError

QUALITY_PRESETS = ("fast", "balanced", "high")
TRANSITION_TYPES = ("hard_cut", "crossfade", "fade", "dip_to_black")
ALLOWED_TRANSITION_DURATIONS = (0.25, 0.5, 1.0)
ALLOWED_CUT_INTERVALS = (10, 15, 20, 30, 60)
MIN_SEGMENT_SECONDS = 5.0


class FFmpegPlanError(ValidationError):
    pass


class FFmpegRenderError(ValidationError):
    pass


@dataclass(frozen=True)
class Segment:
    start: float
    end: float

    @property
    def duration(self) -> float:
        return round(self.end - self.start, 3)


# ---------------------------------------------------------------------------
# Quality presets
# ---------------------------------------------------------------------------

def get_quality_args(preset: str) -> list[str]:
    """x264 args per preset. Deliberately avoids 'medium'/'slow'/'veryslow'
    x264 presets - they trade RAM/CPU for compression the target 4 GB laptop
    can't spare."""
    presets = {
        "fast": ["-preset", "veryfast", "-crf", "25"],
        "balanced": ["-preset", "faster", "-crf", "22"],
        "high": ["-preset", "fast", "-crf", "19"],
    }
    if preset not in presets:
        raise FFmpegPlanError(f"Unknown quality preset: {preset}")
    return ["-c:v", "libx264", *presets[preset], "-pix_fmt", "yuv420p"]


# ---------------------------------------------------------------------------
# Segment planning (cuts)
# ---------------------------------------------------------------------------

def plan_segments(
    target_duration: float,
    add_cuts: bool,
    cut_interval: float = 20.0,
    randomize: bool = False,
    seed: int | None = None,
    min_segment: float = MIN_SEGMENT_SECONDS,
) -> list[Segment]:
    """Split [0, target_duration] into contiguous, in-order segments.

    Cuts never skip source content - they only add hard-cut/transition
    boundaries within the already-trimmed footage. With cuts off, or when
    the target is too short to hold two minimum-length segments, this
    returns a single segment (equivalent to a plain trim).
    """
    if target_duration <= 0:
        raise FFmpegPlanError("Target duration must be positive.")
    if not add_cuts or target_duration < 2 * min_segment:
        return [Segment(0.0, round(target_duration, 3))]
    if cut_interval < min_segment:
        raise FFmpegPlanError(f"Cut interval must be at least {min_segment} seconds.")

    num_segments = max(1, round(target_duration / cut_interval))
    nominal = target_duration / num_segments
    if nominal < min_segment:
        num_segments = max(1, int(target_duration // min_segment))
        nominal = target_duration / num_segments

    rng = random.Random(seed) if randomize else None
    boundaries = [0.0]
    remaining = target_duration
    for i in range(num_segments - 1):
        length = nominal
        if rng is not None:
            length = nominal * rng.uniform(0.7, 1.3)
        segments_left_after = num_segments - i - 1
        max_allowed = remaining - min_segment * segments_left_after
        length = max(min_segment, min(length, max_allowed))
        boundaries.append(round(boundaries[-1] + length, 3))
        remaining = round(remaining - length, 3)
    boundaries.append(round(target_duration, 3))

    return [Segment(boundaries[i], boundaries[i + 1]) for i in range(len(boundaries) - 1)]


def check_transition_feasibility(segments: list[Segment], transition_duration: float) -> tuple[bool, str | None]:
    """Never silently produce different output than planned - callers must
    surface the reason and fall back to a hard cut when this is False."""
    if len(segments) < 2:
        return False, "Only one segment was produced; there is nothing to transition between."
    too_short = [s for s in segments if s.duration <= transition_duration]
    if too_short:
        return False, (
            f"A segment is shorter than the {transition_duration}s transition; "
            "falling back to a hard cut."
        )
    return True, None


def compute_xfade_offsets(durations: list[float], transition_duration: float) -> list[float]:
    """Offset (in the running concatenated timeline) at which each
    successive xfade/acrossfade begins, following ffmpeg's documented
    chaining pattern for >2 inputs."""
    if len(durations) < 2:
        raise FFmpegPlanError("Need at least two segments to compute transition offsets.")
    offsets = []
    running = durations[0]
    for d in durations[1:]:
        offsets.append(round(running - transition_duration, 3))
        running = running + d - transition_duration
    return offsets


def total_output_duration(durations: list[float], apply_transitions: bool, transition_duration: float) -> float:
    if not apply_transitions or len(durations) < 2:
        return round(sum(durations), 3)
    return round(sum(durations) - (len(durations) - 1) * transition_duration, 3)


# ---------------------------------------------------------------------------
# Filter graph construction
# ---------------------------------------------------------------------------

def _trim_video_label(index: int, segment: Segment) -> str:
    return f"[0:v]trim=start={segment.start}:end={segment.end},setpts=PTS-STARTPTS[v{index}]"


def _trim_audio_label(index: int, segment: Segment) -> str:
    return f"[0:a]atrim=start={segment.start}:end={segment.end},asetpts=PTS-STARTPTS[a{index}]"


def build_video_graph(
    segments: list[Segment],
    transition_type: str,
    transition_duration: float,
    include_audio: bool,
) -> tuple[list[str], str, str | None, str | None]:
    """Returns (filter_lines, video_out_label, audio_out_label_or_None, fallback_reason_or_None).

    ``include_audio`` mirrors the *original* video's audio through the same
    cut/transition plan - used only when original audio is kept and no
    music track replaces it.
    """
    if transition_type not in TRANSITION_TYPES:
        raise FFmpegPlanError(f"Unknown transition type: {transition_type}")

    lines: list[str] = []
    n = len(segments)

    for i, seg in enumerate(segments):
        lines.append(_trim_video_label(i, seg))
        if include_audio:
            lines.append(_trim_audio_label(i, seg))

    if n == 1:
        return lines, "v0", ("a0" if include_audio else None), None

    fallback_reason: str | None = None
    effective_type = transition_type
    if transition_type in ("crossfade",):
        feasible, reason = check_transition_feasibility(segments, transition_duration)
        if not feasible:
            fallback_reason = reason
            effective_type = "hard_cut"

    if effective_type == "hard_cut":
        v_inputs = "".join(f"[v{i}]" for i in range(n))
        lines.append(f"{v_inputs}concat=n={n}:v=1:a=0[vout]")
        if include_audio:
            a_inputs = "".join(f"[a{i}]" for i in range(n))
            lines.append(f"{a_inputs}concat=n={n}:v=0:a=1[aout]")
        return lines, "vout", ("aout" if include_audio else None), fallback_reason

    if effective_type in ("fade", "dip_to_black"):
        for i, seg in enumerate(segments):
            fade_parts = []
            if i > 0:
                fade_parts.append(f"fade=t=in:st=0:d={transition_duration}")
            if i < n - 1:
                fade_parts.append(f"fade=t=out:st={round(seg.duration - transition_duration, 3)}:d={transition_duration}")
            if fade_parts:
                lines.append(f"[v{i}]{','.join(fade_parts)}[vf{i}]")
            else:
                lines.append(f"[v{i}]null[vf{i}]")
        v_inputs = "".join(f"[vf{i}]" for i in range(n))
        lines.append(f"{v_inputs}concat=n={n}:v=1:a=0[vout]")
        if include_audio:
            a_inputs = "".join(f"[a{i}]" for i in range(n))
            lines.append(f"{a_inputs}concat=n={n}:v=0:a=1[aout]")
        return lines, "vout", ("aout" if include_audio else None), fallback_reason

    # crossfade
    durations = [seg.duration for seg in segments]
    offsets = compute_xfade_offsets(durations, transition_duration)
    prev_label = "v0"
    for i in range(1, n):
        out_label = "vout" if i == n - 1 else f"vx{i}"
        lines.append(
            f"[{prev_label}][v{i}]xfade=transition=fade:duration={transition_duration}:"
            f"offset={offsets[i - 1]}[{out_label}]"
        )
        prev_label = out_label

    audio_out_label = None
    if include_audio:
        prev_a = "a0"
        for i in range(1, n):
            out_label = "aout" if i == n - 1 else f"ax{i}"
            lines.append(f"[{prev_a}][a{i}]acrossfade=d={transition_duration}[{out_label}]")
            prev_a = out_label
        audio_out_label = "aout"

    return lines, "vout", audio_out_label, fallback_reason


def build_music_graph(
    music_needs_loop: bool,
    target_duration: float,
    volume: float,
    fade_in: float,
    fade_out: float,
    music_input_index: int = 1,
) -> tuple[list[str], str]:
    fade_out_start = max(0.0, round(target_duration - fade_out, 3))
    filters = [f"atrim=0:{target_duration}", "asetpts=PTS-STARTPTS", f"volume={volume}"]
    if fade_in > 0:
        filters.append(f"afade=t=in:st=0:d={fade_in}")
    if fade_out > 0:
        filters.append(f"afade=t=out:st={fade_out_start}:d={fade_out}")
    graph = f"[{music_input_index}:a]{','.join(filters)}[aout]"
    return [graph], "aout"


# ---------------------------------------------------------------------------
# Render plan / full command assembly
# ---------------------------------------------------------------------------

@dataclass
class RenderPlan:
    source_video_path: str
    source_duration: float
    target_duration: float
    loop_source: bool
    remove_original_audio: bool
    add_music: bool
    music_path: str | None
    music_duration: float | None
    music_volume: float
    fade_in: float
    fade_out: float
    add_cuts: bool
    cut_interval: float
    randomize_cuts: bool
    cut_seed: int | None
    add_transitions: bool
    transition_type: str
    transition_duration: float
    quality_preset: str
    output_path: str

    def segments(self) -> list[Segment]:
        return plan_segments(
            self.target_duration, self.add_cuts, self.cut_interval,
            self.randomize_cuts, self.cut_seed,
        )


def build_render_command(ffmpeg_path: str, plan: RenderPlan) -> tuple[list[str], str | None]:
    """Returns (argv, fallback_warning_or_None)."""
    if not ffmpeg_path:
        raise FFmpegPlanError("FFmpeg was not found. Please configure it in Settings.")

    segments = plan.segments()
    include_original_audio = (not plan.remove_original_audio) and (not plan.add_music)

    video_lines, v_label, a_label, fallback_reason = build_video_graph(
        segments,
        plan.transition_type if plan.add_transitions else "hard_cut",
        plan.transition_duration,
        include_original_audio,
    )

    filter_lines = list(video_lines)
    final_audio_label: str | None = a_label

    command = [ffmpeg_path, "-y"]

    if plan.loop_source:
        command += ["-stream_loop", "-1"]
    command += ["-i", plan.source_video_path]

    if plan.add_music:
        music_needs_loop = bool(plan.music_duration and plan.music_duration < plan.target_duration)
        if music_needs_loop:
            command += ["-stream_loop", "-1"]
        command += ["-i", plan.music_path]
        music_lines, final_audio_label = build_music_graph(
            music_needs_loop, plan.target_duration, plan.music_volume,
            plan.fade_in, plan.fade_out, music_input_index=1,
        )
        filter_lines += music_lines

    command += ["-filter_complex", ";".join(filter_lines)]
    command += ["-map", f"[{v_label}]"]
    if final_audio_label:
        command += ["-map", f"[{final_audio_label}]"]
    else:
        command += ["-an"]

    command += get_quality_args(plan.quality_preset)
    if final_audio_label:
        command += ["-c:a", "aac", "-b:a", "192k"]
    command += ["-movflags", "+faststart", plan.output_path]

    return command, fallback_reason


# ---------------------------------------------------------------------------
# Execution (never test-covered here - no ffmpeg binary in CI/dev container)
# ---------------------------------------------------------------------------

@dataclass
class RenderResult:
    success: bool
    return_code: int
    stderr_tail: str


def run_ffmpeg_render(
    command: list[str],
    expected_duration: float,
    on_progress: Callable[[float], None] | None = None,
) -> RenderResult:
    """Runs a single FFmpeg process, streaming stderr line-by-line (never
    buffering the whole output) to report fractional progress."""
    full_command = list(command)
    if "-progress" not in full_command:
        insert_at = full_command.index("-y") + 1 if "-y" in full_command else 1
        full_command[insert_at:insert_at] = ["-progress", "pipe:1", "-nostats"]

    try:
        process = subprocess.Popen(
            full_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
        )
    except FileNotFoundError as exc:
        raise FFmpegRenderError("FFmpeg was not found. Please configure it in Settings.") from exc

    stderr_lines: list[str] = []
    assert process.stdout is not None and process.stderr is not None
    for line in process.stdout:
        line = line.strip()
        if line.startswith("out_time_ms=") and on_progress and expected_duration > 0:
            try:
                out_ms = int(line.split("=", 1)[1])
                fraction = min(1.0, max(0.0, (out_ms / 1_000_000) / expected_duration))
                on_progress(fraction)
            except ValueError:
                pass

    for line in process.stderr:
        stderr_lines.append(line)
        if len(stderr_lines) > 200:
            stderr_lines.pop(0)

    process.wait()
    return RenderResult(
        success=process.returncode == 0,
        return_code=process.returncode,
        stderr_tail="".join(stderr_lines[-50:]),
    )
