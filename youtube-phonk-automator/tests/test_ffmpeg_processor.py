import unittest

from core.ffmpeg_processor import (
    FFmpegPlanError,
    RenderPlan,
    Segment,
    build_render_command,
    build_video_graph,
    check_transition_feasibility,
    compute_xfade_offsets,
    get_quality_args,
    plan_segments,
    total_output_duration,
)


class TestQualityPresets(unittest.TestCase):
    def test_all_presets_return_args(self):
        for preset in ("fast", "balanced", "high"):
            args = get_quality_args(preset)
            self.assertIn("-crf", args)
            self.assertIn("libx264", args)

    def test_unknown_preset_raises(self):
        with self.assertRaises(FFmpegPlanError):
            get_quality_args("ultra")


class TestPlanSegments(unittest.TestCase):
    def test_cuts_off_single_segment(self):
        segments = plan_segments(90.0, add_cuts=False)
        self.assertEqual(segments, [Segment(0.0, 90.0)])

    def test_cuts_on_even_division(self):
        segments = plan_segments(60.0, add_cuts=True, cut_interval=20.0)
        self.assertEqual(len(segments), 3)
        self.assertAlmostEqual(sum(s.duration for s in segments), 60.0, places=2)
        for s in segments:
            self.assertAlmostEqual(s.duration, 20.0, places=2)

    def test_segments_are_contiguous_and_in_order(self):
        segments = plan_segments(75.0, add_cuts=True, cut_interval=20.0)
        for i in range(len(segments) - 1):
            self.assertEqual(segments[i].end, segments[i + 1].start)
        self.assertEqual(segments[0].start, 0.0)
        self.assertAlmostEqual(segments[-1].end, 75.0, places=2)

    def test_all_segments_meet_minimum(self):
        segments = plan_segments(75.0, add_cuts=True, cut_interval=20.0)
        for s in segments:
            self.assertGreaterEqual(s.duration, 5.0)

    def test_too_short_for_two_segments_collapses(self):
        segments = plan_segments(8.0, add_cuts=True, cut_interval=20.0)
        self.assertEqual(segments, [Segment(0.0, 8.0)])

    def test_interval_below_minimum_raises(self):
        with self.assertRaises(FFmpegPlanError):
            plan_segments(60.0, add_cuts=True, cut_interval=2.0)

    def test_randomize_is_reproducible_with_seed(self):
        a = plan_segments(90.0, add_cuts=True, cut_interval=20.0, randomize=True, seed=42)
        b = plan_segments(90.0, add_cuts=True, cut_interval=20.0, randomize=True, seed=42)
        self.assertEqual(a, b)

    def test_randomize_differs_across_seeds_usually(self):
        a = plan_segments(120.0, add_cuts=True, cut_interval=20.0, randomize=True, seed=1)
        b = plan_segments(120.0, add_cuts=True, cut_interval=20.0, randomize=True, seed=2)
        self.assertNotEqual(a, b)

    def test_zero_or_negative_duration_raises(self):
        with self.assertRaises(FFmpegPlanError):
            plan_segments(0.0, add_cuts=False)


class TestXfadeOffsets(unittest.TestCase):
    def test_two_segments(self):
        offsets = compute_xfade_offsets([20.0, 20.0], 0.5)
        self.assertEqual(offsets, [19.5])

    def test_three_segments_chain(self):
        offsets = compute_xfade_offsets([20.0, 20.0, 20.0], 0.5)
        # after first xfade running = 20+20-0.5 = 39.5, second offset = 39.5-0.5=39.0
        self.assertEqual(offsets, [19.5, 39.0])

    def test_single_segment_raises(self):
        with self.assertRaises(FFmpegPlanError):
            compute_xfade_offsets([20.0], 0.5)


class TestTransitionFeasibility(unittest.TestCase):
    def test_single_segment_infeasible(self):
        feasible, reason = check_transition_feasibility([Segment(0, 20)], 0.5)
        self.assertFalse(feasible)
        self.assertIsNotNone(reason)

    def test_segment_shorter_than_transition_infeasible(self):
        feasible, reason = check_transition_feasibility([Segment(0, 5), Segment(5, 10)], 6.0)
        self.assertFalse(feasible)

    def test_normal_case_feasible(self):
        feasible, reason = check_transition_feasibility([Segment(0, 20), Segment(20, 40)], 0.5)
        self.assertTrue(feasible)
        self.assertIsNone(reason)


class TestTotalOutputDuration(unittest.TestCase):
    def test_no_transitions_sums_plainly(self):
        self.assertEqual(total_output_duration([20, 20, 20], False, 0.5), 60)

    def test_transitions_subtract_overlap(self):
        self.assertEqual(total_output_duration([20, 20, 20], True, 0.5), 59.0)


class TestBuildVideoGraph(unittest.TestCase):
    def test_single_segment_no_transition_machinery(self):
        lines, v_label, a_label, fallback = build_video_graph(
            [Segment(0, 90)], "hard_cut", 0.5, include_audio=False
        )
        self.assertEqual(v_label, "v0")
        self.assertIsNone(a_label)
        self.assertIsNone(fallback)
        self.assertTrue(any("trim=start=0:end=90" in l for l in lines))

    def test_hard_cut_multi_segment_uses_concat(self):
        segments = plan_segments(60.0, add_cuts=True, cut_interval=20.0)
        lines, v_label, a_label, fallback = build_video_graph(segments, "hard_cut", 0.5, include_audio=False)
        self.assertEqual(v_label, "vout")
        self.assertTrue(any("concat=n=3:v=1:a=0" in l for l in lines))

    def test_crossfade_multi_segment_uses_xfade_chain(self):
        segments = plan_segments(60.0, add_cuts=True, cut_interval=20.0)
        lines, v_label, a_label, fallback = build_video_graph(segments, "crossfade", 0.5, include_audio=False)
        self.assertEqual(v_label, "vout")
        self.assertIsNone(fallback)
        self.assertTrue(any("xfade=transition=fade" in l for l in lines))

    def test_crossfade_falls_back_to_hard_cut_when_infeasible(self):
        # single segment cannot ever transition -> fallback engaged
        lines, v_label, a_label, fallback = build_video_graph([Segment(0, 90)], "crossfade", 0.5, include_audio=False)
        self.assertIsNone(fallback)  # n==1 shortcut path returns before transition logic
        self.assertEqual(v_label, "v0")

    def test_crossfade_falls_back_when_segment_too_short(self):
        segments = [Segment(0, 0.3), Segment(0.3, 90)]
        lines, v_label, a_label, fallback = build_video_graph(segments, "crossfade", 0.5, include_audio=False)
        self.assertIsNotNone(fallback)
        self.assertTrue(any("concat=n=2:v=1:a=0" in l for l in lines))
        self.assertFalse(any("xfade" in l for l in lines))

    def test_dip_to_black_uses_fade_filters_and_concat(self):
        segments = plan_segments(60.0, add_cuts=True, cut_interval=20.0)
        lines, v_label, a_label, fallback = build_video_graph(segments, "dip_to_black", 0.5, include_audio=False)
        self.assertTrue(any("fade=t=out" in l for l in lines))
        self.assertTrue(any("fade=t=in" in l for l in lines))
        self.assertTrue(any("concat=n=3:v=1:a=0" in l for l in lines))


class TestBuildRenderCommand(unittest.TestCase):
    def _base_plan(self, **overrides) -> RenderPlan:
        defaults = dict(
            source_video_path="C:/videos/night_drive.mp4",
            source_duration=522.0,
            target_duration=90.0,
            loop_source=False,
            remove_original_audio=True,
            add_music=True,
            music_path="C:/music/song17.mp3",
            music_duration=180.0,
            music_volume=0.65,
            fade_in=2.0,
            fade_out=3.0,
            add_cuts=False,
            cut_interval=20.0,
            randomize_cuts=False,
            cut_seed=None,
            add_transitions=False,
            transition_type="crossfade",
            transition_duration=0.5,
            quality_preset="balanced",
            output_path="C:/output/Dark_Phonk_Night_Drive.mp4",
        )
        defaults.update(overrides)
        return RenderPlan(**defaults)

    def test_missing_ffmpeg_path_raises(self):
        with self.assertRaises(FFmpegPlanError):
            build_render_command("", self._base_plan())

    def test_simple_trim_with_music_command_shape(self):
        command, fallback = build_render_command("ffmpeg", self._base_plan())
        self.assertIsNone(fallback)
        self.assertEqual(command[0], "ffmpeg")
        self.assertIn("-i", command)
        self.assertIn("C:/videos/night_drive.mp4", command)
        self.assertIn("C:/music/song17.mp3", command)
        self.assertIn("-filter_complex", command)
        self.assertIn("-map", command)
        self.assertTrue(any("[v0]" in part or "v0" in part for part in command))
        self.assertIn(self._base_plan().output_path, command)
        self.assertNotIn("-an", command)

    def test_music_shorter_than_target_loops(self):
        command, _ = build_render_command("ffmpeg", self._base_plan(music_duration=30.0, target_duration=90.0))
        # -stream_loop -1 should appear once for the music input
        self.assertEqual(command.count("-stream_loop"), 1)

    def test_no_music_and_removed_audio_uses_an(self):
        command, _ = build_render_command(
            "ffmpeg", self._base_plan(add_music=False, remove_original_audio=True)
        )
        self.assertIn("-an", command)

    def test_cuts_and_transitions_produce_fallback_warning_when_infeasible(self):
        plan = self._base_plan(target_duration=6.0, add_cuts=True, cut_interval=20.0,
                                add_transitions=True, transition_type="crossfade")
        command, fallback = build_render_command("ffmpeg", plan)
        # target too short for 2 min-segments -> single segment -> no transition possible
        self.assertIsNone(fallback)

    def test_quality_preset_flows_through(self):
        command, _ = build_render_command("ffmpeg", self._base_plan(quality_preset="high"))
        self.assertIn("-crf", command)
        self.assertIn("19", command)

    def test_never_uses_shell_string(self):
        command, _ = build_render_command("ffmpeg", self._base_plan())
        self.assertIsInstance(command, list)
        for part in command:
            self.assertIsInstance(part, str)


if __name__ == "__main__":
    unittest.main()
