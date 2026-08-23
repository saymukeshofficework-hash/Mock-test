import unittest
from pathlib import Path

from core.markdown_parser import MarkdownParseError, parse_markdown_file, parse_markdown_text

SAMPLE_PATH = Path(__file__).resolve().parent.parent / "data" / "sample_upload.md"

MULTI_RECORD = """# VIDEO 1
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


class TestMarkdownParser(unittest.TestCase):
    def test_sample_file_parses(self):
        jobs = parse_markdown_file(SAMPLE_PATH)
        self.assertEqual(len(jobs), 1)
        job = jobs[0]
        self.assertEqual(job.title, "Dark Phonk Night Drive")
        self.assertIn("Enjoy the music.", job.description)
        self.assertEqual(job.tags, ["phonk", "dark phonk", "night drive", "drift phonk"])
        self.assertEqual(job.hashtags, ["#phonk", "#darkphonk", "#nightdrive"])
        self.assertEqual(job.category, "Music")
        self.assertEqual(job.visibility, "Public")
        self.assertEqual(job.music, "random")
        self.assertAlmostEqual(job.music_volume, 0.65)
        self.assertAlmostEqual(job.fade_in, 2.0)
        self.assertAlmostEqual(job.fade_out, 3.0)
        self.assertAlmostEqual(job.length_seconds, 210.0)

    def test_missing_file_raises(self):
        with self.assertRaises(MarkdownParseError):
            parse_markdown_file(Path("/nonexistent/path.md"))

    def test_multiple_records(self):
        jobs = parse_markdown_text(MULTI_RECORD)
        self.assertEqual(len(jobs), 2)
        self.assertEqual(jobs[0].title, "Dark Phonk Night")
        self.assertEqual(jobs[0].music, "song1.mp3")
        self.assertEqual(jobs[1].title, "Night Drive Phonk")
        self.assertEqual(jobs[1].music, "random")
        self.assertAlmostEqual(jobs[1].length_seconds, 240.0)

    def test_missing_required_field_raises(self):
        text = "# V\n## TITLE\nOnly a title\n"
        with self.assertRaises(MarkdownParseError):
            parse_markdown_text(text)

    def test_missing_title_raises(self):
        text = "# V\n## DESCRIPTION\nOnly a description\n"
        with self.assertRaises(MarkdownParseError):
            parse_markdown_text(text)

    def test_implicit_single_record_without_h1(self):
        text = "## TITLE\nNo Wrapper Header\n## DESCRIPTION\nStill works.\n"
        jobs = parse_markdown_text(text)
        self.assertEqual(len(jobs), 1)
        self.assertEqual(jobs[0].title, "No Wrapper Header")

    def test_crlf_line_endings(self):
        text = "# V\r\n## TITLE\r\nCRLF Title\r\n## DESCRIPTION\r\nCRLF Desc\r\n"
        jobs = parse_markdown_text(text)
        self.assertEqual(jobs[0].title, "CRLF Title")
        self.assertEqual(jobs[0].description, "CRLF Desc")

    def test_unicode_hindi_content(self):
        text = "# V\n## TITLE\nनमस्ते Phonk\n## DESCRIPTION\nयह एक विवरण है\n"
        jobs = parse_markdown_text(text)
        self.assertEqual(jobs[0].title, "नमस्ते Phonk")
        self.assertEqual(jobs[0].description, "यह एक विवरण है")

    def test_extra_blank_lines_and_spacing_tolerated(self):
        text = "#   V  \n\n\n##   TITLE   \n\n  Padded Title  \n\n## DESCRIPTION\nDesc\n"
        jobs = parse_markdown_text(text)
        self.assertEqual(jobs[0].title, "Padded Title")

    def test_invalid_music_volume_raises(self):
        text = "# V\n## TITLE\nT\n## DESCRIPTION\nD\n## MUSIC_VOLUME\nnot-a-number\n"
        with self.assertRaises(MarkdownParseError):
            parse_markdown_text(text)

    def test_optional_fields_default_to_none(self):
        text = "# V\n## TITLE\nT\n## DESCRIPTION\nD\n"
        jobs = parse_markdown_text(text)
        job = jobs[0]
        self.assertIsNone(job.category)
        self.assertIsNone(job.music)
        self.assertEqual(job.tags, [])

    def test_does_not_modify_source_file(self):
        original = SAMPLE_PATH.read_bytes()
        parse_markdown_file(SAMPLE_PATH)
        self.assertEqual(SAMPLE_PATH.read_bytes(), original)


if __name__ == "__main__":
    unittest.main()
