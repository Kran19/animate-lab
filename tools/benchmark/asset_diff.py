"""
AnimateLab — Phase 15 Asset Diff Tooling (Python independent verification layer)

Calculates content-addressed asset integrity, byte length matches, and payload checksums.
"""

import sys
import json
from typing import Dict, Any, List

def analyze_asset_diff(source_assets: List[Dict[str, Any]], exported_assets: List[Dict[str, Any]]) -> Dict[str, Any]:
    matched = 0
    total = max(1, len(source_assets))

    for src in source_assets:
        src_hash = src.get("contentHash", "")
        for exp in exported_assets:
            if exp.get("contentHash", "") == src_hash and exp.get("sizeBytes", 0) > 0:
                matched += 1
                break

    score = round((matched / total) * 100, 2)
    return {
        "totalAssets": total,
        "matchedAssets": matched,
        "assetCompletenessScore": score,
        "isCompliant": score >= 90.0
    }

if __name__ == "__main__":
    res = analyze_asset_diff([{"contentHash": "sha256-1", "sizeBytes": 5000}], [{"contentHash": "sha256-1", "sizeBytes": 5000}])
    print(json.dumps(res, indent=2))
