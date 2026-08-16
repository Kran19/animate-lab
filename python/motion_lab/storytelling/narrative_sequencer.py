from typing import List, Dict, Any

class NarrativeSequencer:
    """
    Builds the storytelling and narrative continuity graph across partitioned website sections.
    Preserves page sequencing and narrative flow instead of isolating sections into disconnected rectangles.
    """

    NARRATIVE_ROLE_MAP = {
        "HEADER": "Global Identity & Navigation Context",
        "HERO": "Primary Hook, Brand Vision & Value Proposition",
        "INTRO": "Contextual Orientation & Problem Framing",
        "STORY": "Core Narrative, Heritage & Philosophy",
        "EDITORIAL": "Curated Narrative & In-depth Storytelling",
        "MARQUEE": "Dynamic Brand Rhythm & Social Proof Highlights",
        "TEXT_REVEAL": "High-Impact Conceptual Statement Reveal",
        "PRODUCT_SHOWCASE": "Hero Product Immersion & Feature Highlight",
        "CARD_GRID": "Structured Capabilities & Service Matrix",
        "GALLERY": "Visual Immersion & Portfolio Showcase",
        "STATISTICS": "Quantitative Validation & Metrics",
        "TESTIMONIALS": "Peer Validation & Social Endorsement",
        "INTERACTIVE_DEMO": "Direct Engagement & Experiential Proof",
        "CANVAS": "Interactive Visual Artwork & Generative Experience",
        "WEBGL": "High-Fidelity 3D Visual Experience",
        "CTA": "Conversion Gateway & Call to Action",
        "FOOTER": "Secondary Navigation, Legal & Closure",
        "UNKNOWN": "Supporting Visual/Functional Section",
    }

    @classmethod
    def build_narrative_graph(cls, sections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Takes an ordered list of section metadata dictionaries and builds a coherent storytelling sequence.
        """
        nodes: List[Dict[str, Any]] = []
        total_sections = len(sections)

        for idx, sec in enumerate(sections):
            cat = (sec.get("category") or "UNKNOWN").upper()
            sec_id = sec.get("sectionId") or f"section_{idx + 1}"
            title = sec.get("title") or f"Section {idx + 1}"

            # Infer narrative role
            role = cls.NARRATIVE_ROLE_MAP.get(cat, f"Supporting {cat.title()} Narrative Section")

            # Infer entry and exit behaviors based on motion & scroll triggers
            has_motion = sec.get("hasMotion", False)
            has_scroll_trigger = sec.get("hasScrollTrigger", False)
            has_pin = sec.get("hasPin", False)

            if idx == 0:
                entry = "Immediate Viewport Entrance"
            elif has_scroll_trigger and has_pin:
                entry = "ScrollTrigger Pin & Horizontal Slide Entrance"
            elif has_motion:
                entry = "Staggered Kinetic Typography Reveal"
            else:
                entry = "Natural Document Flow Reveal"

            if idx == total_sections - 1:
                exit_b = "Terminal Page Boundary"
            elif has_pin:
                exit_b = "Pin Viewport while content cascades"
            elif has_scroll_trigger:
                exit_b = "Continuous Parallax Transition"
            else:
                exit_b = "Standard Viewport Exit"

            prev_id = sections[idx - 1].get("sectionId") if idx > 0 else None
            next_id = sections[idx + 1].get("sectionId") if idx < total_sections - 1 else None

            continuity = "Smooth Vertical Scroll Continuity"
            if idx > 0:
                prev_cat = (sections[idx - 1].get("category") or "UNKNOWN").upper()
                continuity = f"Connects {prev_cat.title()} -> {cat.title()} with visual rhythm"

            nodes.append({
                "sequenceIndex": idx,
                "sectionId": sec_id,
                "title": title,
                "category": cat,
                "narrativeRole": role,
                "entryBehavior": entry,
                "exitBehavior": exit_b,
                "previousSectionId": prev_id,
                "nextSectionId": next_id,
                "narrativeContinuity": continuity,
            })

        return {
            "totalSectionsInStory": total_sections,
            "narrativeNodes": nodes,
            "overallNarrativeArc": f"A cohesive {total_sections}-stage visual journey from {nodes[0]['category'] if nodes else 'Start'} to {nodes[-1]['category'] if nodes else 'End'}.",
        }
