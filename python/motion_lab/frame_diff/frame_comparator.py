import math
from typing import Dict, Any, List

class FrameComparator:
    """
    Performs deterministic perceptual and pixel difference comparisons between
    source recorded frames and synthesized component replay frames.
    """

    @classmethod
    def compare_pixel_arrays(
        cls,
        source_pixels: List[List[int]],
        candidate_pixels: List[List[int]],
        width: int,
        height: int,
        threshold: int = 15
    ) -> Dict[str, Any]:
        """
        Compares RGB pixel buffers where each pixel is [r, g, b].
        Returns similarity score (0.0 to 1.0), pixel difference ratio, and bounding error regions.
        """
        total_pixels = width * height
        if total_pixels == 0 or len(source_pixels) == 0 or len(candidate_pixels) == 0:
            return {
                "similarityScore": 1.0,
                "diffPixelCount": 0,
                "diffRatio": 0.0,
                "largestErrorRegion": None,
                "isVisualMatch": True,
            }

        diff_count = 0
        min_x, min_y = width, height
        max_x, max_y = 0, 0
        total_delta = 0.0

        limit = min(len(source_pixels), len(candidate_pixels), total_pixels)

        for i in range(limit):
            sp = source_pixels[i]
            cp = candidate_pixels[i]

            dr = abs(sp[0] - cp[0])
            dg = abs(sp[1] - cp[1])
            db = abs(sp[2] - cp[2])
            delta = (dr + dg + db) / 3.0
            total_delta += delta

            if delta > threshold:
                diff_count += 1
                x = i % width
                y = i // width
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y

        diff_ratio = diff_count / total_pixels
        avg_delta = total_delta / (total_pixels * 255.0)
        similarity = max(0.0, min(1.0, 1.0 - (diff_ratio * 0.7 + avg_delta * 0.3)))

        largest_region = None
        if diff_count > 0:
            largest_region = {
                "x": min_x,
                "y": min_y,
                "width": max(1, max_x - min_x + 1),
                "height": max(1, max_y - min_y + 1),
                "errorDensity": round(diff_count / max(1, (max_x - min_x + 1) * (max_y - min_y + 1)), 4)
            }

        return {
            "similarityScore": round(similarity, 4),
            "diffPixelCount": diff_count,
            "diffRatio": round(diff_ratio, 6),
            "largestErrorRegion": largest_region,
            "isVisualMatch": similarity >= 0.90,
        }
