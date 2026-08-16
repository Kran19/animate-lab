import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from motion_lab.easing.curve_fitter import EasingCurveFitter
from motion_lab.frame_diff.frame_comparator import FrameComparator
from motion_lab.storytelling.narrative_sequencer import NarrativeSequencer
from motion_lab.optical_flow.motion_tracker import MotionTracker
from motion_lab.perceptual.ssim_comparator import SSIMComparator
from motion_lab.trajectory.trajectory_reconstructor import TrajectoryReconstructor
from motion_lab.segmentation.perceptual_segmenter import PerceptualSegmenter
from motion_lab.fingerprint.motion_fingerprint import MotionFingerprintEngine
from motion_lab.localization.error_localizer import ErrorLocalizer

class TestMotionLab(unittest.TestCase):
    def test_linear_curve_fitting(self):
        samples = [(0.0, 0.0), (0.25, 0.25), (0.5, 0.5), (0.75, 0.75), (1.0, 1.0)]
        result = EasingCurveFitter.fit(samples)
        self.assertEqual(result["bestFit"], "linear")
        self.assertAlmostEqual(result["mse"], 0.0, places=4)
        self.assertTrue(result["isReconstructed"])

    def test_power3_out_curve_fitting(self):
        # Power3.out: 1 - (1 - t)^4
        samples = [(t / 10.0, 1.0 - (1.0 - t / 10.0) ** 4) for t in range(11)]
        result = EasingCurveFitter.fit(samples)
        self.assertEqual(result["bestFit"], "power3.out")
        self.assertAlmostEqual(result["mse"], 0.0, places=4)
        self.assertTrue(result["confidence"] > 0.95)

    def test_frame_comparator_identical_pixels(self):
        pixels = [[255, 255, 255] for _ in range(100)]
        result = FrameComparator.compare_pixel_arrays(pixels, pixels, 10, 10)
        self.assertEqual(result["similarityScore"], 1.0)
        self.assertEqual(result["diffPixelCount"], 0)
        self.assertTrue(result["isVisualMatch"])

    def test_optical_flow_tracking(self):
        frame_a = [[255, 255, 255] for _ in range(100)]
        frame_b = [[0, 0, 0] if i % 10 > 5 else [255, 255, 255] for i in range(100)]
        result = MotionTracker.calculate_optical_flow(frame_a, frame_b, 10, 10, 5)
        self.assertIn("averageVelocity", result)
        self.assertIn("motionEnergy", result)

    def test_ssim_identical_frames(self):
        pixels = [[200, 200, 200] for _ in range(100)]
        result = SSIMComparator.calculate_ssim(pixels, pixels, 10, 10)
        self.assertEqual(result["ssimScore"], 1.0)
        self.assertTrue(result["isPerceptuallyIdentical"])

    def test_trajectory_reconstruction(self):
        samples = [
            {"timestampMs": 0, "x": 0, "y": 50, "scale": 0.95, "opacity": 0},
            {"timestampMs": 500, "x": 0, "y": 15, "scale": 0.98, "opacity": 0.7},
            {"timestampMs": 1000, "x": 0, "y": 0, "scale": 1.0, "opacity": 1.0},
        ]
        result = TrajectoryReconstructor.reconstruct_trajectory(samples, "TIME_DOMAIN")
        self.assertEqual(result["totalSamples"], 3)
        self.assertEqual(result["durationMs"], 1000)
        self.assertEqual(result["trajectoryCurve"][2]["y"], 0)

    def test_perceptual_segmentation(self):
        elements = [
            {"tagName": "H1", "selector": "#title", "width": 800, "height": 100, "x": 50, "y": 50},
            {"tagName": "DIV", "selector": ".service-card", "width": 300, "height": 200, "x": 50, "y": 200},
            {"tagName": "DIV", "selector": ".service-card", "width": 300, "height": 200, "x": 380, "y": 200},
            {"tagName": "DIV", "selector": ".service-card", "width": 300, "height": 200, "x": 710, "y": 200},
            {"tagName": "BUTTON", "selector": ".btn-cta", "width": 180, "height": 50, "x": 50, "y": 450},
        ]
        result = PerceptualSegmenter.segment_frame(elements, 1440, 900)
        self.assertEqual(result["dominantLayout"], "GRID")
        self.assertTrue(result["hasCardGrid"])
        self.assertTrue(result["hasActionTrigger"])

    def test_motion_fingerprint(self):
        samples = [
            {"timestampMs": 0, "x": 0, "y": 100, "scale": 0.9, "opacity": 0},
            {"timestampMs": 500, "x": 0, "y": 20, "scale": 0.98, "opacity": 0.8},
            {"timestampMs": 1000, "x": 0, "y": 0, "scale": 1.0, "opacity": 1.0},
        ]
        fp = MotionFingerprintEngine.generate_fingerprint("hero_title", samples, 1000.0)
        self.assertEqual(fp["totalCheckpoints"], 3)
        self.assertEqual(fp["elementId"], "hero_title")

        # Compare with identical
        comp = MotionFingerprintEngine.compare_fingerprints(fp["fingerprintVector"], fp["fingerprintVector"])
        self.assertEqual(comp["similarity"], 1.0)
        self.assertTrue(comp["isTrajectoryEquivalent"])

    def test_error_localization(self):
        src = {"selector": "#hero", "bounds": {"width": 1440, "height": 800}, "motion": {"durationMs": 1200}, "fontSizePx": 72}
        cand = {"selector": "#hero", "bounds": {"width": 1440, "height": 800}, "motion": {"durationMs": 800}, "fontSizePx": 72}
        loc = ErrorLocalizer.localize_error("hero_sec", src, cand)
        self.assertEqual(loc["dominantError"], "MOTION_TRAJECTORY")
        self.assertTrue(loc["requiresCorrection"])
        self.assertEqual(len(loc["errorRegions"]), 1)

    def test_storytelling_sequencer(self):
        sections = [
            {"sectionId": "sec-1", "category": "HERO", "title": "Hero", "hasMotion": True},
            {"sectionId": "sec-2", "category": "STORY", "title": "Story", "hasScrollTrigger": True, "hasPin": True},
            {"sectionId": "sec-3", "category": "FOOTER", "title": "Footer"},
        ]
        graph = NarrativeSequencer.build_narrative_graph(sections)
        self.assertEqual(graph["totalSectionsInStory"], 3)
        self.assertEqual(graph["narrativeNodes"][0]["category"], "HERO")
        self.assertIn("ScrollTrigger Pin", graph["narrativeNodes"][1]["entryBehavior"])
        self.assertEqual(graph["narrativeNodes"][2]["exitBehavior"], "Terminal Page Boundary")

if __name__ == "__main__":
    unittest.main()
