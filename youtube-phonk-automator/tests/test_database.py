import tempfile
import unittest
from pathlib import Path

from database.database import Database


class TestDatabase(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.db = Database(Path(self._tmp.name) / "test.db")

    def tearDown(self):
        self.db.close()
        self._tmp.cleanup()

    def test_settings_roundtrip(self):
        self.db.set_setting("ffmpeg_path", "C:/ffmpeg/ffmpeg.exe")
        self.assertEqual(self.db.get_setting("ffmpeg_path"), "C:/ffmpeg/ffmpeg.exe")

    def test_setting_default_when_missing(self):
        self.assertEqual(self.db.get_setting("nope", "fallback"), "fallback")

    def test_job_create_and_fetch(self):
        job_id = self.db.create_job({
            "title": "Dark Phonk Night", "description": "desc", "status": "pending",
        })
        job = self.db.get_job(job_id)
        self.assertEqual(job["title"], "Dark Phonk Night")
        self.assertEqual(job["status"], "pending")

    def test_job_update(self):
        job_id = self.db.create_job({"title": "T", "description": "D", "status": "pending"})
        self.db.update_job(job_id, status="processing")
        job = self.db.get_job(job_id)
        self.assertEqual(job["status"], "processing")

    def test_unfinished_job_detection(self):
        job_id = self.db.create_job({"title": "T", "description": "D", "status": "processing"})
        unfinished = self.db.find_unfinished_jobs()
        self.assertEqual([row["id"] for row in unfinished], [job_id])

    def test_music_usage_tracking(self):
        self.db.upsert_music({"path": "/music/a.mp3", "filename": "a.mp3", "duration_seconds": 180, "format": "mp3"})
        self.db.mark_music_used("/music/a.mp3")
        usage = self.db.get_music_usage("/music")
        self.assertEqual(usage["/music/a.mp3"], 1)

    def test_upload_and_history(self):
        job_id = self.db.create_job({"title": "T", "description": "D", "status": "done"})
        upload_id = self.db.create_upload(job_id)
        self.db.update_upload(upload_id, status="published", youtube_url="https://youtu.be/xyz")
        history = self.db.list_history()
        self.assertEqual(history[0]["youtube_url"], "https://youtu.be/xyz")


if __name__ == "__main__":
    unittest.main()
