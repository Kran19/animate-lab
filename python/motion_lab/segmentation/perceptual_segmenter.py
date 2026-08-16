from typing import List, Dict, Any

class PerceptualSegmenter:
    """
    Performs perceptual spatial clustering on rendered frames to classify semantic visual zones.
    """

    @classmethod
    def segment_frame(
        cls,
        elements: List[Dict[str, Any]],
        viewport_width: int = 1440,
        viewport_height: int = 900
    ) -> Dict[str, Any]:
        """
        Segments elements into visual groups: headings, cards, media, buttons, and layout grids.
        """
        if not elements:
            return {
                "totalRegions": 0,
                "regions": [],
                "dominantLayout": "BLOCK",
                "visualDensity": 0.0,
            }

        regions: List[Dict[str, Any]] = []
        headings = []
        cards = []
        buttons = []
        media = []

        for el in elements:
            tag = el.get("tagName", "").upper()
            w = float(el.get("width", 0))
            h = float(el.get("height", 0))
            x = float(el.get("x", 0))
            y = float(el.get("y", 0))
            sel = el.get("selector", "").lower()

            if tag in ["H1", "H2", "H3", "H4"] or "heading" in sel or "title" in sel:
                headings.append({"selector": sel, "bounds": {"x": x, "y": y, "width": w, "height": h}})
            elif "card" in sel or "item" in sel or "service" in sel or (w > 200 and h > 150 and w < viewport_width * 0.5):
                cards.append({"selector": sel, "bounds": {"x": x, "y": y, "width": w, "height": h}})
            elif tag in ["BUTTON", "A"] or "btn" in sel or "cta" in sel:
                buttons.append({"selector": sel, "bounds": {"x": x, "y": y, "width": w, "height": h}})
            elif tag in ["IMG", "SVG", "CANVAS", "VIDEO"] or "media" in sel or "image" in sel:
                media.append({"selector": sel, "bounds": {"x": x, "y": y, "width": w, "height": h}})

        if headings:
            regions.append({"type": "HEADING_ZONE", "count": len(headings), "elements": headings})
        if cards:
            regions.append({"type": "CARD_CLUSTER", "count": len(cards), "elements": cards})
        if buttons:
            regions.append({"type": "ACTION_BAR", "count": len(buttons), "elements": buttons})
        if media:
            regions.append({"type": "MEDIA_CONTAINER", "count": len(media), "elements": media})

        # Layout detection
        dominant_layout = "GRID" if len(cards) >= 3 else "FLEX" if (len(buttons) > 1 or (headings and media)) else "BLOCK"
        total_area = sum(float(e.get("width", 0)) * float(e.get("height", 0)) for e in elements)
        viewport_area = max(1.0, float(viewport_width * viewport_height))
        density = min(1.0, round(total_area / viewport_area, 3))

        return {
            "totalRegions": len(regions),
            "regions": regions,
            "dominantLayout": dominant_layout,
            "visualDensity": density,
            "hasActionTrigger": len(buttons) > 0,
            "hasCardGrid": len(cards) >= 3,
        }
