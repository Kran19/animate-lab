from typing import List, Dict, Any

class ErrorLocalizer:
    """
    Localizes visual and behavioral discrepancies between source observation and synthesized reproduction.
    Categorizes errors into layout, motion, typography, and asset discrepancies.
    """

    @classmethod
    def localize_error(
        cls,
        section_id: str,
        source_data: Dict[str, Any],
        candidate_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculates error components and determines the dominant error mode.
        """
        geometry_err = 0.0
        motion_err = 0.0
        typo_err = 0.0
        regions: List[Dict[str, Any]] = []

        # 1. Geometry Check
        src_bounds = source_data.get("bounds", {})
        cand_bounds = candidate_data.get("bounds", {})
        dw = abs(float(src_bounds.get("width", 1440)) - float(cand_bounds.get("width", 1440)))
        dh = abs(float(src_bounds.get("height", 800)) - float(cand_bounds.get("height", 800)))
        if dw > 10.0 or dh > 10.0:
            geometry_err = min(1.0, (dw + dh) / 200.0)
            regions.append({
                "selector": source_data.get("selector", "root"),
                "errorType": "LAYOUT_GEOMETRY",
                "discrepancyPx": round(dw + dh, 1),
                "proposedAdjustment": {"paddingAdjustment": -round((dw + dh) * 0.1) if dw + dh > 20 else 0}
            })

        # 2. Motion Check
        src_motion = source_data.get("motion", {})
        cand_motion = candidate_data.get("motion", {})
        src_dur = float(src_motion.get("durationMs", 1000))
        cand_dur = float(cand_motion.get("durationMs", 1000))
        if abs(src_dur - cand_dur) > 50:
            motion_err = min(1.0, abs(src_dur - cand_dur) / 500.0)
            regions.append({
                "selector": src_motion.get("targetSelector", ".animated-el"),
                "errorType": "MOTION_TRAJECTORY",
                "discrepancyMs": abs(src_dur - cand_dur),
                "proposedAdjustment": {"durationDeltaMs": src_dur - cand_dur}
            })

        # 3. Typography Check
        src_font = float(source_data.get("fontSizePx", 18))
        cand_font = float(candidate_data.get("fontSizePx", 18))
        if abs(src_font - cand_font) > 1.0:
            typo_err = min(1.0, abs(src_font - cand_font) / 20.0)
            regions.append({
                "selector": "h1, h2, p",
                "errorType": "TYPOGRAPHY_METRIC",
                "discrepancyPx": abs(src_font - cand_font),
                "proposedAdjustment": {"fontSizeDeltaPx": src_font - cand_font}
            })

        dominant = "NONE"
        max_err = max(geometry_err, motion_err, typo_err)
        if max_err > 0.05:
            if max_err == motion_err:
                dominant = "MOTION_TRAJECTORY"
            elif max_err == geometry_err:
                dominant = "LAYOUT_GEOMETRY"
            else:
                dominant = "TYPOGRAPHY_METRIC"

        ssim_score = max(0.0, min(1.0, 1.0 - (max_err * 0.2)))

        return {
            "sectionId": section_id,
            "ssim": round(ssim_score, 4),
            "geometryError": round(geometry_err, 4),
            "motionError": round(motion_err, 4),
            "typographyError": round(typo_err, 4),
            "dominantError": dominant,
            "errorRegions": regions,
            "requiresCorrection": max_err > 0.05,
        }
