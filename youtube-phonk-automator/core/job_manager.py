"""Orchestrates the render pipeline: Markdown -> jobs -> sequential FFmpeg renders.

Exactly one job renders at a time (see CLAUDE.md's 4 GB RAM rules); the
queue is a plain "next pending job" pull, never concurrent.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Mapping

from core.ffmpeg_processor import RenderPlan, build_render_command, run_ffmpeg_render
from core.markdown_parser import parse_markdown_file
from core.music_manager import MusicInfo, get_music_info, select_music
from core.settings_manager import SettingsManager
from core.video_manager import VideoInfo, check_duration_fit, get_video_info
from database.database import Database
from utils.filenames import unique_output_path
from utils.validators import ValidationError


class ShortVideoError(ValidationError):
    """Source video is shorter than the target duration; the caller must
    get explicit user confirmation before retrying with loop_confirmed=True."""


@dataclass
class ProcessResult:
    job_id: int
    success: bool
    output_path: str | None
    error_message: str | None
    fallback_warning: str | None


def render_plan_from_job(
    job_row: Mapping,
    video_info: VideoInfo,
    music_info: MusicInfo | None,
    loop_source: bool,
    output_path: str,
) -> RenderPlan:
    """Pure translation from a jobs-table row + already-probed media info
    into a RenderPlan - no FFprobe/FFmpeg calls happen here, which is what
    makes it unit testable without either binary."""
    add_music = bool(job_row["add_music"]) and music_info is not None
    return RenderPlan(
        source_video_path=video_info.path,
        source_duration=video_info.duration_seconds,
        target_duration=job_row["length_seconds"],
        loop_source=loop_source,
        remove_original_audio=bool(job_row["remove_audio"]),
        add_music=add_music,
        music_path=music_info.path if add_music else None,
        music_duration=music_info.duration_seconds if add_music else None,
        music_volume=job_row["music_volume"],
        fade_in=job_row["fade_in"],
        fade_out=job_row["fade_out"],
        add_cuts=bool(job_row["add_cuts"]),
        cut_interval=job_row["cut_interval"],
        randomize_cuts=bool(job_row["randomize_cuts"]),
        cut_seed=job_row["cut_seed"],
        add_transitions=bool(job_row["add_transitions"]),
        transition_type=job_row["transition_type"],
        transition_duration=job_row["transition_duration"],
        quality_preset=job_row["quality_preset"],
        output_path=output_path,
    )


class JobManager:
    def __init__(self, db: Database, settings: SettingsManager):
        self.db = db
        self.settings = settings

    # -- markdown -> jobs --------------------------------------------------
    def create_jobs_from_markdown(self, md_path: Path) -> list[int]:
        defaults = self.settings.get()
        job_data_list = parse_markdown_file(md_path)
        job_ids = []
        for index, job_data in enumerate(job_data_list):
            is_random_music = (job_data.music or "").strip().lower() == "random"
            row = {
                "md_source_path": str(md_path),
                "job_index": index,
                "title": job_data.title,
                "description": job_data.description,
                "tags": ", ".join(job_data.tags),
                "hashtags": " ".join(job_data.hashtags),
                "category": job_data.category or defaults.default_category,
                "visibility": job_data.visibility or defaults.default_visibility,
                "audience": job_data.audience or defaults.default_audience,
                "playlist": job_data.playlist or defaults.default_playlist,
                "language": job_data.language,
                "music_mode": "random" if is_random_music else ("manual" if job_data.music else "manual"),
                "music_path": None if is_random_music else job_data.music,
                "length_seconds": job_data.length_seconds or defaults.default_duration_seconds,
                "music_volume": job_data.music_volume if job_data.music_volume is not None else defaults.default_music_volume,
                "fade_in": job_data.fade_in if job_data.fade_in is not None else defaults.default_fade_in,
                "fade_out": job_data.fade_out if job_data.fade_out is not None else defaults.default_fade_out,
                "quality_preset": defaults.quality_preset,
                "status": "pending",
            }
            job_ids.append(self.db.create_job(row))
        return job_ids

    # -- per-job overrides ---------------------------------------------------
    def set_job_video(self, job_id: int, video_path: Path) -> None:
        self.db.update_job(job_id, video_path=str(video_path))

    def set_job_music(self, job_id: int, mode: str, manual_path: Path | None = None) -> None:
        self.db.update_job(job_id, music_mode=mode, music_path=str(manual_path) if manual_path else None)

    def next_pending_job(self):
        pending = self.db.list_jobs(status="pending")
        return pending[0] if pending else None

    # -- music resolution --------------------------------------------------
    def resolve_music_for_job(self, job_row: Mapping, ffprobe_path: str) -> MusicInfo | None:
        if not job_row["add_music"]:
            return None
        mode = job_row["music_mode"] or "manual"
        folder = Path(self.settings.get().default_music_folder or ".")
        manual_path = Path(job_row["music_path"]) if job_row["music_path"] else None
        chosen_path = select_music(mode, folder, self.db, manual_path=manual_path)
        return get_music_info(ffprobe_path, chosen_path)

    # -- sequential processing ----------------------------------------------
    def process_next_job(
        self,
        ffmpeg_path: str,
        ffprobe_path: str,
        loop_confirmed: bool = False,
        on_progress: Callable[[float], None] | None = None,
    ) -> ProcessResult:
        job_row = self.next_pending_job()
        if job_row is None:
            raise ValidationError("No pending jobs.")
        return self.process_job(job_row["id"], ffmpeg_path, ffprobe_path, loop_confirmed, on_progress)

    def process_job(
        self,
        job_id: int,
        ffmpeg_path: str,
        ffprobe_path: str,
        loop_confirmed: bool = False,
        on_progress: Callable[[float], None] | None = None,
    ) -> ProcessResult:
        """Render one specific job regardless of queue order - used by the
        Dashboard to render whichever job is currently selected. Only one
        FFmpeg process ever runs (the caller is expected not to call this
        again until it returns)."""
        job_row = self.db.get_job(job_id)
        if job_row is None:
            raise ValidationError("Job not found.")
        if not job_row["video_path"]:
            raise ValidationError("Please select a video.")

        self.db.update_job(job_row["id"], status="processing")
        try:
            video_info = get_video_info(ffprobe_path, Path(job_row["video_path"]))
            fit = check_duration_fit(video_info, job_row["length_seconds"])

            if fit == "short" and not loop_confirmed:
                self.db.update_job(job_row["id"], status="pending")
                raise ShortVideoError(
                    "The selected video is shorter than the requested duration."
                )

            music_info = self.resolve_music_for_job(job_row, ffprobe_path)
            output_dir = Path(self.settings.get().output_folder or ".")
            output_path = unique_output_path(output_dir, job_row["title"])

            plan = render_plan_from_job(
                job_row, video_info, music_info, loop_source=(fit == "short"),
                output_path=str(output_path),
            )
            command, fallback_warning = build_render_command(ffmpeg_path, plan)
            result = run_ffmpeg_render(command, plan.target_duration, on_progress)

            if not result.success:
                self.db.update_job(job_row["id"], status="error", error_message=result.stderr_tail)
                return ProcessResult(job_row["id"], False, None, result.stderr_tail, fallback_warning)

            self.db.update_job(job_row["id"], status="done", output_path=str(output_path))
            if music_info:
                self.db.mark_music_used(music_info.path)
            return ProcessResult(job_row["id"], True, str(output_path), None, fallback_warning)
        except ShortVideoError:
            raise
        except ValidationError as exc:
            self.db.update_job(job_row["id"], status="error", error_message=str(exc))
            raise
        except Exception as exc:  # pragma: no cover - unexpected/environmental failures
            self.db.update_job(job_row["id"], status="error", error_message=str(exc))
            raise

    # -- crash recovery -------------------------------------------------------
    def find_unfinished_jobs(self):
        return self.db.find_unfinished_jobs()

    def resume_job(self, job_id: int) -> None:
        self.db.update_job(job_id, status="pending")

    def restart_job(self, job_id: int) -> None:
        job = self.db.get_job(job_id)
        if job and job["output_path"]:
            Path(job["output_path"]).unlink(missing_ok=True)
        self.db.update_job(job_id, status="pending", output_path=None, error_message=None)

    def cancel_job(self, job_id: int) -> None:
        self.db.update_job(job_id, status="cancelled")
