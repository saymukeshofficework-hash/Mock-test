import tempfile
import unittest
from pathlib import Path

from utils.filenames import sanitize_filename, unique_output_path


class TestSanitizeFilename(unittest.TestCase):
    def test_basic_title(self):
        self.assertEqual(sanitize_filename("Dark Phonk Night Drive"), "Dark_Phonk_Night_Drive")

    def test_invalid_windows_chars_stripped(self):
        self.assertEqual(sanitize_filename('Bad: Name? / <Title>*|"'), "Bad_Name_Title")

    def test_reserved_name(self):
        self.assertEqual(sanitize_filename("CON"), "_CON")

    def test_empty_falls_back(self):
        self.assertEqual(sanitize_filename(""), "video")

    def test_only_invalid_chars_falls_back(self):
        self.assertEqual(sanitize_filename("???"), "video")

    def test_long_title_truncated(self):
        result = sanitize_filename("A" * 300)
        self.assertLessEqual(len(result), 150)


class TestUniqueOutputPath(unittest.TestCase):
    def test_no_collision(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = unique_output_path(Path(tmp), "My Video")
            self.assertEqual(path.name, "My_Video.mp4")

    def test_collision_increments(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            (directory / "My_Video.mp4").touch()
            path = unique_output_path(directory, "My Video")
            self.assertEqual(path.name, "My_Video_001.mp4")

    def test_multiple_collisions(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            (directory / "My_Video.mp4").touch()
            (directory / "My_Video_001.mp4").touch()
            path = unique_output_path(directory, "My Video")
            self.assertEqual(path.name, "My_Video_002.mp4")


if __name__ == "__main__":
    unittest.main()
