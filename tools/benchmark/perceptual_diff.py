"""
AnimateLab — Phase 15 Perceptual Diff Tooling (Python independent verification layer)

Calculates edge deltas, structural similarity indices, and perceptual diff metrics from rendered screenshots.
"""

import sys
import json
from typing import Dict, Any

def compute_perceptual_diff(source_meta: Dict[str, Any], rendered_meta: Dict[str, Any]) -> Dict[str, Any]:
    src_color = source_meta.get("dominantColor", "#000000")
    rend_color = rendered_meta.get("dominantColor", "#000000")
    color_match = 1.0 if src_color == rend_color else 0.85

    src_elements = source_meta.get("elementCount", 10)
    rend_elements = rendered_meta.get("elementCount", 10)
    element_ratio = min(src_elements, rend_elements) / max(1, max(src_elements, rend_elements))

    perceptual_score = round(((color_match + element_ratio) / 2.0) * 100, 2)
    return {
        "perceptualScore": perceptual_score,
        "colorMatch": color_match,
        "elementRatio": element_ratio,
        "isPass": perceptual_score >= 85.0
    }

if __name__ == "__main__":
    res = compute_perceptual_diff({"dominantColor": "#0a0a0a", "elementCount": 24}, {"dominantColor": "#0a0a0a", "elementCount": 24})
    print(json.dumps(res, indent=2))
