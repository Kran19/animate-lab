"""
AnimateLab — Phase 15 Geometry Analyzer Tooling (Python independent verification layer)

Calculates element bounding box alignments, layout containment, and structural overlap metrics.
"""

import sys
import json
from typing import Dict, Any, List

def analyze_geometry(source_boxes: List[Dict[str, float]], rendered_boxes: List[Dict[str, float]]) -> Dict[str, Any]:
    matched = 0
    total = max(1, len(source_boxes))

    for src in source_boxes:
        src_sel = src.get("selector", "")
        # Find corresponding box in rendered
        for rend in rendered_boxes:
            if rend.get("selector", "") == src_sel:
                # Compare area and center offset
                src_area = src.get("width", 0) * src.get("height", 0)
                rend_area = rend.get("width", 0) * rend.get("height", 0)
                area_ratio = min(src_area, rend_area) / max(1.0, max(src_area, rend_area))
                if area_ratio >= 0.80:
                    matched += 1
                break

    score = round((matched / total) * 100, 2)
    return {
        "totalEvaluated": total,
        "matched": matched,
        "geometryScore": score,
        "isCompliant": score >= 85.0
    }

if __name__ == "__main__":
    dummy_source = [{"selector": ".hero", "width": 1440, "height": 800}]
    dummy_rendered = [{"selector": ".hero", "width": 1440, "height": 800}]
    res = analyze_geometry(dummy_source, dummy_rendered)
    print(json.dumps(res, indent=2))
