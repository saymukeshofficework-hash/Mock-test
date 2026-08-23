import random
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from core.ffprobe_manager import FFprobeError, build_probe_command, parse_probe_json, probe_media
from core.music_manager import MusicSelectionError, scan_music_folder, select_music
from core.video_manager import (
    VideoInfo,
    VideoSelectionError,
    check_duration_fit,
    get_video_info,
    is_supported_video,
    list_videos_in_folder,
)
from database.database import Database

SAMPLE_PROBE_JSON = {
    "format": {"duration": "522.5", "format_name": "mov,mp4,m4a,3gp,3g2,mj2"},
    "streams": [
        {"codec_type": "video", "codec_name": "h264", "width": 1920, "height": 1080,
         "r_frame_rate": "30000/1001"},
        {"codec_type": "audio", "codec_name": "aac"},
    ],
}

SAMPLE_PROBE_JSON_NO_AUDIO = {
    "format": {"duration": "60.0"},
    "streams": [
        {"codec_type": "video", "codec_name": "vp9", "width": 1280, "height": 720,
         "r_frame_rate": "30/1"},
    ],
}


class FakeCompletedProcess:
    def __init__(self, stdout: str, returncode: int = 0):
        self.stdout = stdout
        self.returncode = returncode
        self.stderr = ""


class TestFFprobeParsing(unittest.TestCase):
    def test_parse_probe_json_with_audio(self):
        info = parse_probe_json(SAMPLE_PROBE_JSON)
        self.assertAlmostEqual(info.duration_seconds, 522.5)
        self.assertEqual(info.width, 1920)
        self.assertEqual(info.height, 1080)
        self.assertAlmostEqual(info.fps, 29.97)
        self.assertEqual(info.video_codec, "h264")
        self.assertTrue(info.has_audio)

    def test_parse_probe_json_without_audio(self):
        info = parse_probe_json(SAMPLE_PROBE_JSON_NO_AUDIO)
        self.assertFalse(info.has_audio)
        self.assertAlmostEqual(info.fps, 30.0)

    def test_build_probe_command(self):
        command = build_probe_command("ffprobe.exe", Path("video.mp4"))
        self.assertEqual(command[0], "ffprobe.exe")
        self.assertIn("-show_streams", command)
        self.assertEqual(command[-1], "video.mp4")

    def test_probe_media_missing_ffprobe_path(self):
        with self.assertRaises(FFprobeError):
            probe_media("", Path("video.mp4"))

    @patch("core.ffprobe_manager.subprocess.run")
    def test_probe_media_success(self, mock_run):
        import json
        with tempfile.NamedTemporaryFile(suffix=".mp4") as tmp:
            mock_run.return_value = FakeCompletedProcess(json.dumps(SAMPLE_PROBE_JSON))
            info = probe_media("ffprobe", Path(tmp.name))
            self.assertAlmostEqual(info.duration_seconds, 522.5)

    @patch("core.ffprobe_manager.subprocess.run")
    def test_probe_media_nonzero_exit(self, mock_run):
        with tempfile.NamedTemporaryFile(suffix=".mp4") as tmp:
            mock_run.return_value = FakeCompletedProcess("", returncode=1)
            with self.assertRaises(FFprobeError):
                probe_media("ffprobe", Path(tmp.name))

    @patch("core.ffprobe_manager.subprocess.run", side_effect=FileNotFoundError)
    def test_probe_media_executable_missing(self, mock_run):
        with tempfile.NamedTemporaryFile(suffix=".mp4") as tmp:
            with self.assertRaises(FFprobeError):
                probe_media("missing_ffprobe", Path(tmp.name))


class TestVideoManager(unittest.TestCase):
    def test_supported_extensions(self):
        for ext in (".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v"):
            self.assertTrue(is_supported_video(Path(f"video{ext}")))
        self.assertFalse(is_supported_video(Path("document.txt")))

    def test_list_videos_in_folder(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            (directory / "b.mp4").touch()
            (directory / "a.mov").touch()
            (directory / "notes.txt").touch()
            videos = list_videos_in_folder(directory)
            self.assertEqual([p.name for p in videos], ["a.mov", "b.mp4"])

    def test_list_videos_missing_folder_raises(self):
        with self.assertRaises(VideoSelectionError):
            list_videos_in_folder(Path("/no/such/folder"))

    def test_get_video_info_missing_file_raises(self):
        with self.assertRaises(VideoSelectionError):
            get_video_info("ffprobe", Path("/no/such/video.mp4"))

    def test_get_video_info_unsupported_extension_raises(self):
        with tempfile.NamedTemporaryFile(suffix=".txt") as tmp:
            with self.assertRaises(VideoSelectionError):
                get_video_info("ffprobe", Path(tmp.name))

    def test_check_duration_fit(self):
        info = VideoInfo("p", "f", duration_seconds=100, width=None, height=None,
                          fps=None, codec=None, has_audio=False)
        self.assertEqual(check_duration_fit(info, 210), "short")
        self.assertEqual(check_duration_fit(info, 50), "trim")
        self.assertEqual(check_duration_fit(info, 100), "exact")


class TestMusicManager(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.folder = Path(self._tmp.name)
        for name in ("a.mp3", "b.wav", "c.flac"):
            (self.folder / name).touch()
        (self.folder / "notes.txt").touch()

        self._db_tmp = tempfile.TemporaryDirectory()
        self.db = Database(Path(self._db_tmp.name) / "test.db")

    def tearDown(self):
        self.db.close()
        self._tmp.cleanup()
        self._db_tmp.cleanup()

    def test_scan_music_folder_filters_unsupported(self):
        files = scan_music_folder(self.folder)
        self.assertEqual([p.name for p in files], ["a.mp3", "b.wav", "c.flac"])

    def test_scan_missing_folder_raises(self):
        with self.assertRaises(MusicSelectionError):
            scan_music_folder(Path("/no/such/folder"))

    def test_manual_selection(self):
        chosen = select_music("manual", self.folder, self.db, manual_path=self.folder / "b.wav")
        self.assertEqual(chosen.name, "b.wav")

    def test_manual_selection_missing_raises(self):
        with self.assertRaises(MusicSelectionError):
            select_music("manual", self.folder, self.db, manual_path=None)

    def test_random_selection_picks_from_pool(self):
        chosen = select_music("random", self.folder, self.db, rng=random.Random(1))
        self.assertIn(chosen.name, ["a.mp3", "b.wav", "c.flac"])

    def test_sequential_selection_cycles(self):
        picks = [select_music("sequential", self.folder, self.db).name for _ in range(4)]
        self.assertEqual(picks, ["a.mp3", "b.wav", "c.flac", "a.mp3"])

    def test_unused_random_prefers_never_used(self):
        self.db.upsert_music({"path": str(self.folder / "a.mp3"), "filename": "a.mp3",
                               "duration_seconds": 100, "format": "mp3"})
        self.db.mark_music_used(str(self.folder / "a.mp3"))
        self.db.upsert_music({"path": str(self.folder / "b.wav"), "filename": "b.wav",
                               "duration_seconds": 100, "format": "wav"})
        self.db.mark_music_used(str(self.folder / "b.wav"))

        chosen = select_music("unused_random", self.folder, self.db, rng=random.Random(1))
        self.assertEqual(chosen.name, "c.flac")

    def test_unused_random_falls_back_when_all_used(self):
        for name in ("a.mp3", "b.wav", "c.flac"):
            path = self.folder / name
            self.db.upsert_music({"path": str(path), "filename": name, "duration_seconds": 100, "format": name.split(".")[-1]})
            self.db.mark_music_used(str(path))

        chosen = select_music("unused_random", self.folder, self.db, rng=random.Random(1))
        self.assertIn(chosen.name, ["a.mp3", "b.wav", "c.flac"])

    def test_empty_folder_raises(self):
        with tempfile.TemporaryDirectory() as empty_dir:
            with self.assertRaises(MusicSelectionError):
                select_music("random", Path(empty_dir), self.db)


if __name__ == "__main__":
    unittest.main()
