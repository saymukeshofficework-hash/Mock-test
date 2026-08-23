import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from core.ffmpeg_processor import RenderResult
from core.job_manager import JobManager, ShortVideoError, render_plan_from_job
from core.music_manager import MusicInfo
from core.settings_manager import SettingsManager
from core.video_manager import VideoInfo
from database.database import Database
from utils.validators import ValidationError

MULTI_RECORD_MD = """# VIDEO 1
## TITLE
Dark Phonk Night
## DESCRIPTION
Description one.
## MUSIC
song1.mp3
## LENGTH
03:30
# VIDEO 2
## TITLE
Night Drive Phonk
## DESCRIPTION
Description two.
## MUSIC
random
## LENGTH
04:00
"""


class TestRenderPlanFromJob(unittest.TestCase):
    def test_translates_job_row_and_media_info(self):
        job_row = {
            "add_music": 1, "remove_audio": 1, "length_seconds": 90.0,
            "music_volume": 0.65, "fade_in": 2.0, "fade_out": 3.0,
            "add_cuts": 0, "cut_interval": 20.0, "randomize_cuts": 0, "cut_seed": None,
            "add_transitions": 0, "transition_type": "crossfade", "transition_duration": 0.5,
            "quality_preset": "balanced",
        }
        video_info = VideoInfo("C:/v.mp4", "v.mp4", 522.0, 1920, 1080, 30.0, "h264", True)
        music_info = MusicInfo("C:/m.mp3", "m.mp3", 180.0, "mp3")

        plan = render_plan_from_job(job_row, video_info, music_info, loop_source=False, output_path="C:/out.mp4")

        self.assertEqual(plan.source_video_path, "C:/v.mp4")
        self.assertTrue(plan.add_music)
        self.assertEqual(plan.music_path, "C:/m.mp3")
        self.assertEqual(plan.target_duration, 90.0)
        self.assertFalse(plan.loop_source)

    def test_add_music_false_when_no_music_info(self):
        job_row = {
            "add_music": 1, "remove_audio": 1, "length_seconds": 90.0,
            "music_volume": 0.65, "fade_in": 2.0, "fade_out": 3.0,
            "add_cuts": 0, "cut_interval": 20.0, "randomize_cuts": 0, "cut_seed": None,
            "add_transitions": 0, "transition_type": "crossfade", "transition_duration": 0.5,
            "quality_preset": "balanced",
        }
        video_info = VideoInfo("C:/v.mp4", "v.mp4", 522.0, 1920, 1080, 30.0, "h264", True)
        plan = render_plan_from_job(job_row, video_info, None, loop_source=False, output_path="C:/out.mp4")
        self.assertFalse(plan.add_music)
        self.assertIsNone(plan.music_path)


class TestJobManager(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.base = Path(self._tmp.name)
        self.db = Database(self.base / "test.db")
        self.settings = SettingsManager(self.db)
        self.settings.update(output_folder=str(self.base / "output"))
        self.jm = JobManager(self.db, self.settings)

    def tearDown(self):
        self.db.close()
        self._tmp.cleanup()

    def _write_md(self, text: str) -> Path:
        path = self.base / "job.md"
        path.write_text(text, encoding="utf-8")
        return path

    def test_create_jobs_from_markdown_multi_record(self):
        md_path = self._write_md(MULTI_RECORD_MD)
        job_ids = self.jm.create_jobs_from_markdown(md_path)
        self.assertEqual(len(job_ids), 2)

        job1 = self.db.get_job(job_ids[0])
        self.assertEqual(job1["title"], "Dark Phonk Night")
        self.assertEqual(job1["music_mode"], "manual")
        self.assertEqual(job1["music_path"], "song1.mp3")
        self.assertAlmostEqual(job1["length_seconds"], 210.0)

        job2 = self.db.get_job(job_ids[1])
        self.assertEqual(job2["music_mode"], "random")
        self.assertIsNone(job2["music_path"])
        self.assertAlmostEqual(job2["length_seconds"], 240.0)

    def test_jobs_get_independent_video_selection(self):
        md_path = self._write_md(MULTI_RECORD_MD)
        job_ids = self.jm.create_jobs_from_markdown(md_path)
        self.jm.set_job_video(job_ids[0], Path("C:/videos/a.mp4"))
        self.jm.set_job_video(job_ids[1], Path("C:/videos/b.mp4"))
        self.assertEqual(self.db.get_job(job_ids[0])["video_path"], "C:/videos/a.mp4")
        self.assertEqual(self.db.get_job(job_ids[1])["video_path"], "C:/videos/b.mp4")

    def test_process_next_job_no_video_selected_raises(self):
        job_id = self.db.create_job({"title": "T", "description": "D", "status": "pending", "add_music": 0})
        with self.assertRaises(ValidationError):
            self.jm.process_next_job("ffmpeg", "ffprobe")

    @patch("core.job_manager.run_ffmpeg_render")
    @patch("core.job_manager.build_render_command")
    @patch("core.job_manager.get_video_info")
    def test_process_next_job_success(self, mock_get_video_info, mock_build_command, mock_run):
        job_id = self.db.create_job({
            "title": "Dark Phonk", "description": "D", "status": "pending",
            "video_path": "C:/v.mp4", "add_music": 0, "remove_audio": 1,
            "length_seconds": 90.0,
        })
        mock_get_video_info.return_value = VideoInfo("C:/v.mp4", "v.mp4", 200.0, 1920, 1080, 30.0, "h264", True)
        mock_build_command.return_value = (["ffmpeg", "..."], None)
        mock_run.return_value = RenderResult(success=True, return_code=0, stderr_tail="")

        result = self.jm.process_next_job("ffmpeg", "ffprobe")

        self.assertTrue(result.success)
        self.assertEqual(self.db.get_job(job_id)["status"], "done")
        self.assertIsNotNone(self.db.get_job(job_id)["output_path"])

    @patch("core.job_manager.run_ffmpeg_render")
    @patch("core.job_manager.build_render_command")
    @patch("core.job_manager.get_video_info")
    def test_process_next_job_ffmpeg_failure_marks_error(self, mock_get_video_info, mock_build_command, mock_run):
        job_id = self.db.create_job({
            "title": "T", "description": "D", "status": "pending",
            "video_path": "C:/v.mp4", "add_music": 0, "remove_audio": 1, "length_seconds": 90.0,
        })
        mock_get_video_info.return_value = VideoInfo("C:/v.mp4", "v.mp4", 200.0, 1920, 1080, 30.0, "h264", True)
        mock_build_command.return_value = (["ffmpeg", "..."], None)
        mock_run.return_value = RenderResult(success=False, return_code=1, stderr_tail="boom")

        result = self.jm.process_next_job("ffmpeg", "ffprobe")

        self.assertFalse(result.success)
        self.assertEqual(self.db.get_job(job_id)["status"], "error")

    @patch("core.job_manager.get_video_info")
    def test_process_next_job_short_video_requires_confirmation(self, mock_get_video_info):
        job_id = self.db.create_job({
            "title": "T", "description": "D", "status": "pending",
            "video_path": "C:/v.mp4", "add_music": 0, "remove_audio": 1, "length_seconds": 300.0,
        })
        mock_get_video_info.return_value = VideoInfo("C:/v.mp4", "v.mp4", 60.0, 1920, 1080, 30.0, "h264", True)

        with self.assertRaises(ShortVideoError):
            self.jm.process_next_job("ffmpeg", "ffprobe")

        self.assertEqual(self.db.get_job(job_id)["status"], "pending")

    @patch("core.job_manager.run_ffmpeg_render")
    @patch("core.job_manager.build_render_command")
    @patch("core.job_manager.get_video_info")
    def test_process_next_job_short_video_loops_when_confirmed(self, mock_get_video_info, mock_build_command, mock_run):
        job_id = self.db.create_job({
            "title": "T", "description": "D", "status": "pending",
            "video_path": "C:/v.mp4", "add_music": 0, "remove_audio": 1, "length_seconds": 300.0,
        })
        mock_get_video_info.return_value = VideoInfo("C:/v.mp4", "v.mp4", 60.0, 1920, 1080, 30.0, "h264", True)
        mock_build_command.return_value = (["ffmpeg", "..."], None)
        mock_run.return_value = RenderResult(success=True, return_code=0, stderr_tail="")

        result = self.jm.process_next_job("ffmpeg", "ffprobe", loop_confirmed=True)
        self.assertTrue(result.success)
        plan_arg = mock_build_command.call_args[0][1]
        self.assertTrue(plan_arg.loop_source)

    @patch("core.job_manager.run_ffmpeg_render")
    @patch("core.job_manager.build_render_command")
    @patch("core.job_manager.get_video_info")
    def test_process_job_targets_specific_job_not_queue_order(self, mock_get_video_info, mock_build_command, mock_run):
        older_job_id = self.db.create_job({
            "title": "Older", "description": "D", "status": "pending",
            "video_path": "C:/older.mp4", "add_music": 0, "remove_audio": 1, "length_seconds": 90.0,
        })
        target_job_id = self.db.create_job({
            "title": "Target", "description": "D", "status": "pending",
            "video_path": "C:/target.mp4", "add_music": 0, "remove_audio": 1, "length_seconds": 90.0,
        })
        mock_get_video_info.return_value = VideoInfo("C:/target.mp4", "target.mp4", 200.0, 1920, 1080, 30.0, "h264", True)
        mock_build_command.return_value = (["ffmpeg", "..."], None)
        mock_run.return_value = RenderResult(success=True, return_code=0, stderr_tail="")

        result = self.jm.process_job(target_job_id, "ffmpeg", "ffprobe")

        self.assertEqual(result.job_id, target_job_id)
        self.assertEqual(self.db.get_job(target_job_id)["status"], "done")
        self.assertEqual(self.db.get_job(older_job_id)["status"], "pending")

    def test_crash_recovery_detects_unfinished_jobs(self):
        job_id = self.db.create_job({"title": "T", "description": "D", "status": "processing", "add_music": 0})
        unfinished = self.jm.find_unfinished_jobs()
        self.assertEqual([j["id"] for j in unfinished], [job_id])

    def test_resume_job_sets_pending(self):
        job_id = self.db.create_job({"title": "T", "description": "D", "status": "processing", "add_music": 0})
        self.jm.resume_job(job_id)
        self.assertEqual(self.db.get_job(job_id)["status"], "pending")

    def test_cancel_job_sets_cancelled(self):
        job_id = self.db.create_job({"title": "T", "description": "D", "status": "processing", "add_music": 0})
        self.jm.cancel_job(job_id)
        self.assertEqual(self.db.get_job(job_id)["status"], "cancelled")

    def test_restart_job_clears_output_path(self):
        job_id = self.db.create_job({
            "title": "T", "description": "D", "status": "error", "add_music": 0,
            "output_path": str(self.base / "nonexistent_output.mp4"),
        })
        self.jm.restart_job(job_id)
        job = self.db.get_job(job_id)
        self.assertEqual(job["status"], "pending")
        self.assertIsNone(job["output_path"])


if __name__ == "__main__":
    unittest.main()
