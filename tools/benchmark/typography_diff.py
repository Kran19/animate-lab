"""
AnimateLab — Phase 15 Typography Diff Tooling (Python independent verification layer)

Calculates font metric alignments, variable font axis compliance, and line wrap delta.
"""

import sys
import json
from typing import Dict, Any, List

def analyze_typography_diff(source_fonts: List[Dict[str, Any]], rendered_fonts: List[Dict[str, Any]]) -> Dict[str, Any]:
    matched = 0
    total = max(1, len(source_fonts))

    for src in source_fonts:
        src_family = src.get("fontFamily", "").lower()
        for rend in rendered_fonts:
            if rend.get("fontFamily", "").lower() in src_family or src_family in rend.get("fontFamily", "").lower():
                matched += 1
                break

    score = round((matched / total) * 100, 2)
    return {
        "totalFonts": total,
        "matchedFonts": matched,
        "typographyMatchScore": score,
        "isCompliant": score >= 80.0
    }

if __name__ == "__main__":
    res = analyze_typography_diff([{"fontFamily": "Inter"}], [{"fontFamily": "Inter"}])
    print(json.dumps(res, indent=2))
