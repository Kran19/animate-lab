import sys
import json
import os

# Add motion_lab parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from motion_lab.easing.curve_fitter import EasingCurveFitter
from motion_lab.frame_diff.frame_comparator import FrameComparator
from motion_lab.storytelling.narrative_sequencer import NarrativeSequencer
from motion_lab.optical_flow.motion_tracker import MotionTracker
from motion_lab.perceptual.ssim_comparator import SSIMComparator
from motion_lab.trajectory.trajectory_reconstructor import TrajectoryReconstructor
from motion_lab.segmentation.perceptual_segmenter import PerceptualSegmenter
from motion_lab.fingerprint.motion_fingerprint import MotionFingerprintEngine
from motion_lab.localization.error_localizer import ErrorLocalizer

def main():
    if len(sys.argv) < 2:
        # Read from stdin
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"error": "No command or input payload provided"}))
            sys.exit(1)
        data = json.loads(raw_input)
        command = data.get("command")
        payload = data.get("payload", {})
    else:
        command = sys.argv[1]
        if len(sys.argv) > 2:
            payload = json.loads(sys.argv[2])
        else:
            raw_input = sys.stdin.read()
            payload = json.loads(raw_input) if raw_input.strip() else {}

    result = {}
    if command == "fit-easing":
        samples = payload.get("samples", [])
        result = EasingCurveFitter.fit(samples)
    elif command == "compare-frames":
        source = payload.get("sourcePixels", [])
        candidate = payload.get("candidatePixels", [])
        w = payload.get("width", 100)
        h = payload.get("height", 100)
        thresh = payload.get("threshold", 15)
        result = FrameComparator.compare_pixel_arrays(source, candidate, w, h, thresh)
    elif command == "optical-flow":
        source = payload.get("frameAPixels", [])
        candidate = payload.get("frameBPixels", [])
        w = payload.get("width", 100)
        h = payload.get("height", 100)
        grid = payload.get("gridSize", 10)
        result = MotionTracker.calculate_optical_flow(source, candidate, w, h, grid)
    elif command == "perceptual-ssim":
        source = payload.get("sourcePixels", [])
        candidate = payload.get("candidatePixels", [])
        w = payload.get("width", 100)
        h = payload.get("height", 100)
        result = SSIMComparator.calculate_ssim(source, candidate, w, h)
    elif command == "reconstruct-trajectory":
        samples = payload.get("samples", [])
        domain_type = payload.get("domainType", "TIME_DOMAIN")
        result = TrajectoryReconstructor.reconstruct_trajectory(samples, domain_type)
    elif command == "perceptual-segmentation":
        elements = payload.get("elements", [])
        vw = payload.get("viewportWidth", 1440)
        vh = payload.get("viewportHeight", 900)
        result = PerceptualSegmenter.segment_frame(elements, vw, vh)
    elif command == "motion-fingerprint":
        element_id = payload.get("elementId", "el_01")
        samples = payload.get("samples", [])
        duration_ms = payload.get("durationMs", 1000.0)
        result = MotionFingerprintEngine.generate_fingerprint(element_id, samples, duration_ms)
    elif command == "localize-error":
        section_id = payload.get("sectionId", "sec_01")
        source_data = payload.get("sourceData", {})
        candidate_data = payload.get("candidateData", {})
        result = ErrorLocalizer.localize_error(section_id, source_data, candidate_data)
    elif command == "storytelling-graph":
        sections = payload.get("sections", [])
        result = NarrativeSequencer.build_narrative_graph(sections)
    else:
        result = {"error": f"Unknown command '{command}'"}

    print(json.dumps(result))

if __name__ == "__main__":
    main()
