import unittest

from utils.validators import ValidationError, format_duration, parse_duration


class TestParseDuration(unittest.TestCase):
    def test_mm_ss(self):
        self.assertEqual(parse_duration("03:30"), 210.0)

    def test_hh_mm_ss(self):
        self.assertEqual(parse_duration("01:30:00"), 5400.0)

    def test_zero_rejected(self):
        with self.assertRaises(ValidationError):
            parse_duration("00:00")

    def test_negative_like_garbage_rejected(self):
        with self.assertRaises(ValidationError):
            parse_duration("-01:00")

    def test_invalid_format_rejected(self):
        with self.assertRaises(ValidationError):
            parse_duration("not a duration")

    def test_empty_rejected(self):
        with self.assertRaises(ValidationError):
            parse_duration("")

    def test_seconds_overflow_rejected(self):
        with self.assertRaises(ValidationError):
            parse_duration("03:99")

    def test_minutes_overflow_in_hms_rejected(self):
        with self.assertRaises(ValidationError):
            parse_duration("01:75:00")


class TestFormatDuration(unittest.TestCase):
    def test_under_hour(self):
        self.assertEqual(format_duration(210), "03:30")

    def test_over_hour(self):
        self.assertEqual(format_duration(5400), "01:30:00")

    def test_roundtrip(self):
        self.assertEqual(format_duration(parse_duration("08:42")), "08:42")


if __name__ == "__main__":
    unittest.main()
