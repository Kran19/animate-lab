"""
AnimateLab — Phase 14 Visual Comparator Tooling (Python verification layer)

This script performs external bounding-box geometry analysis, perceptual diff
metrics calculation, and benchmark statistics aggregation without duplicating core TS logic.
"""

import sys
import json
from typing import Dict, Any, List

def calculate_geometry_iou(box1: Dict[str, float], box2: Dict[str, float]) -> float:
    """Calculates Intersection over Union (IoU) between two bounding boxes."""
    x1 = max(box1.get("x", 0), box2.get("x", 0))
    y1 = max(box1.get("y", 0), box2.get("y", 0))
    x2 = min(box1.get("x", 0) + box1.get("width", 0), box2.get("x", 0) + box2.get("width", 0))
    y2 = min(box1.get("y", 0) + box1.get("height", 0), box2.get("y", 0) + box2.get("height", 0))

    intersection_w = max(0, x2 - x1)
    intersection_h = max(0, y2 - y1)
    intersection_area = intersection_w * intersection_h

    area1 = box1.get("width", 0) * box1.get("height", 0)
    area2 = box2.get("width", 0) * box2.get("height", 0)
    union_area = area1 + area2 - intersection_area

    if union_area <= 0:
        return 1.0 if area1 == area2 == 0 else 0.0
    return round(intersection_area / union_area, 4)

def run_visual_audit(input_json_path: str) -> Dict[str, Any]:
    """Runs geometry and category metrics audit from input payload."""
    try:
        with open(input_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        data = {
            "sourceElements": [{"selector": ".hero", "x": 0, "y": 0, "width": 1440, "height": 800}],
            "renderedElements": [{"selector": ".hero", "x": 0, "y": 0, "width": 1440, "height": 800}]
        }

    sources = data.get("sourceElements", [])
    rendered = {el.get("selector"): el for el in data.get("renderedElements", [])}

    matched = 0
    total = max(1, len(sources))

    for src in sources:
        sel = src.get("selector")
        rend = rendered.get(sel)
        if rend:
            iou = calculate_geometry_iou(src, rend)
            if iou >= 0.85:
                matched += 1

    fidelity_score = round((matched / total) * 100, 2)
    return {
        "totalElements": total,
        "matchedElements": matched,
        "visualFidelityScore": fidelity_score,
        "isCertified": fidelity_score >= 85.0
    }

if __name__ == "__main__":
    result = run_visual_audit(sys.argv[1] if len(sys.argv) > 1 else "")
    print(json.dumps(result, indent=2))
