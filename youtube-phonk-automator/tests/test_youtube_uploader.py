import unittest

from core.youtube_uploader import build_metadata_mapping


class TestBuildMetadataMapping(unittest.TestCase):
    def _job_row(self, **overrides):
        row = {
            "title": "Dark Phonk Night Drive",
            "description": "Welcome to another dark phonk music video.",
            "tags": "phonk, dark phonk, night drive",
            "hashtags": "#phonk #darkphonk",
            "category": "Music",
            "playlist": "Phonk Music",
            "audience": "Not made for kids",
            "visibility": "Public",
            "language": "English",
            "output_path": "C:/output/video.mp4",
            "music_path": "C:/music/song.mp3",
            "length_seconds": 210.0,
        }
        row.update(overrides)
        return row

    def test_basic_mapping(self):
        mapping = build_metadata_mapping(self._job_row())
        self.assertEqual(mapping["title"], "Dark Phonk Night Drive")
        self.assertEqual(mapping["tags"], ["phonk", "dark phonk", "night drive"])
        self.assertEqual(mapping["category"], "Music")
        self.assertEqual(mapping["playlist"], "Phonk Music")
        self.assertEqual(mapping["audience"], "Not made for kids")
        self.assertEqual(mapping["visibility"], "Public")

    def test_hashtags_appended_to_description(self):
        mapping = build_metadata_mapping(self._job_row())
        self.assertIn("#phonk #darkphonk", mapping["description"])
        self.assertTrue(mapping["description"].startswith("Welcome to another dark phonk music video."))

    def test_empty_hashtags_do_not_add_trailing_whitespace(self):
        mapping = build_metadata_mapping(self._job_row(hashtags=""))
        self.assertEqual(mapping["description"], "Welcome to another dark phonk music video.")

    def test_empty_tags_field_gives_empty_list(self):
        mapping = build_metadata_mapping(self._job_row(tags=""))
        self.assertEqual(mapping["tags"], [])

    def test_optional_fields_default_to_none(self):
        mapping = build_metadata_mapping(self._job_row(category=None, playlist=None, audience=None, visibility=None, language=None))
        self.assertIsNone(mapping["category"])
        self.assertIsNone(mapping["playlist"])
        self.assertIsNone(mapping["audience"])


if __name__ == "__main__":
    unittest.main()
