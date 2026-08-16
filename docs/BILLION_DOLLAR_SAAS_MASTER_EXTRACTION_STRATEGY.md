# ANIMATELAB — THE AUTHORITATIVE SAAS EXTRACTION ARCHITECTURE
**Document ID**: `ANIMATELAB-SAAS-MASTER-STRATEGY-2026-V2`  
**Core Product Invariant**: Evidence-Driven High-Fidelity Reproduction & Honest Diagnostics  
**Status**: Authoritative Architectural Specification  

---

## 1. The Core Product Guarantee

> **"AnimateLab produces the highest-fidelity, self-contained reproduction supported by browser-captured runtime evidence, and explicitly reports anything that cannot be reproduced."**

### Real-World Boundaries:
Modern web applications have non-deterministic elements (server APIs, WebSockets, authenticated sessions, local storage, GPU/shader state, service workers). Rather than falsely promising universal "magic 1:1" recreation, AnimateLab operates on an **evidence-based contract**:
* **Observe & Mirror**: Capture the live runtime state (DOM, cascade, fonts, assets, GSAP/CSS animations) in the browser.
* **Isolate & Normalize**: Extract section subtrees into portable React components with zero global CSS leaks.
* **Verify & Certify**: Mount the component in an independent clean-room browser, measure visual/structural fidelity across 8 dimensions, and provide honest diagnostics for partial features.

---

## 2. Integrated Phase 6 $\to$ Phase 9 Architecture Flow

The **Resource Harvester** acts as an **upstream fidelity layer** that directly feeds the Phase 8 component extraction and Phase 9 React generation engines:

```text
LIVE PAGE (Browser Execution)
   │
   ├── Network / Response Capture
   ├── DOM Snapshot
   ├── CSS Cascade
   ├── Fonts & @font-face
   ├── Assets (Images, SVGs, Media)
   ├── Runtime Animation Evidence
   ├── Interaction Evidence
   └── WebGL / 3D Context Evidence
             │
             ▼
      RESOURCE MIRROR (Phase 6 Content-Addressed Immutable Storage)
             │
             ▼
       SECTION CARVER (Phase 8 Multi-Signal Discovery & Boundary Isolation)
             │
             ▼
      COMPONENT CANDIDATE IDENTIFIED
             │
             ▼
          ISOLATION (Scoped CSS Tree-Shaking & Variable Resolution)
             │
             ▼
        NORMALIZATION (JSX Cleanup, Attribute Mapping & Security Sanitization)
             │
             ▼
       REACT GENERATION (Phase 9 Component.tsx + Component.module.css + Local Assets)
             │
             ▼
          VALIDATION (Clean-Room Mounting & TypeScript / Build Check)
             │
        ┌────┴─────┐
        │          │
      VALID     PARTIAL (WebGL / Specialized Runtime Diagnostics)
        │          │
        ▼          ▼
      EXPORT   DIAGNOSTICS
```

---

## 3. Immutable Capture vs. Derived Portable Bundles

To preserve total data integrity and zero data corruption:

```text
Captured Resource (Binary / Text via CDP)
      ↓
Content-Addressed Immutable Storage (SHA-256 in Phase 6 Database)
      ↓
Section Dependency Mapping (Ownership Graph: Local / Shared / Global)
      ↓
Portable Exported Asset (Copied into package `assets/` and `fonts/`)
      ↓
Relative TSX / CSS Import (`import styles from './Component.module.css'`)
```

* **Original Capture**: Kept completely untouched and immutable as forensic evidence.
* **Export Package**: Self-contained, portable, zero-leakage React package that any external developer can `npm install` and run without AnimateLab internals.

---

## 4. The 8-Dimensional Fidelity Scorecard

AnimateLab replaces vague claims with an authoritative, evidence-backed 8-dimensional fidelity model:

| Dimension | Measurement Method | Target Standard |
| :--- | :--- | :---: |
| **1. DOM Fidelity** | Tree structure, semantic tags, and node hierarchy comparison | 100% |
| **2. CSS Fidelity** | Scoped CSS rule matching, layout (`grid`/`flex`), padding, shadows, colors | 100% |
| **3. Asset Fidelity** | Image/SVG resolution, localized file integrity, SHA-256 verification | 100% |
| **4. Font Fidelity** | Captured `@font-face` WOFF2/TTF binaries & computed font metrics | 100% |
| **5. Animation Fidelity** | Observable keyframe offsets, easing curves, GSAP timeline triggers | 90%–100% |
| **6. Interaction Fidelity** | BEFORE $\to$ ACTION $\to$ AFTER state transitions and cursor responses | 95%–100% |
| **7. Runtime Dependency Fidelity** | Zero leakage of private localhost, file://, or internal paths | 100% |
| **8. 3D / WebGL Fidelity** | Level A visual frame preservation vs Level B shader scene export | Honest Partial |

---

## 5. 4-Tier Certification Protocol

Every section receives exactly one honest disposition:

* 🟢 **`COPY_USE_CERTIFIED`**: Clean-room compilation, browser render, responsive states, assets, and animations fully verified.
* 🟡 **`COPY_USE_PARTIAL`**: Substantially reproduced with explicit, bounded runtime limitations (e.g. Three.js GPU shaders, dynamic WebSockets).
* 🔴 **`COPY_USE_FAILED`**: Compilation failure, broken package, runtime exception, or severe visual mismatch.
* ⚪ **`COPY_USE_BLOCKED`**: Forensic evidence insufficient to substantiate a trustworthy extraction.

---

## 6. The SaaS Market Differentiator

Most AI website clippers generate fake approximations or broken static HTML that destroys the user's codebase.

**AnimateLab's Unfair Advantage**:
1. **Proven Evidence**: Every exported component is backed by raw browser evidence (`evidence/dom.html`, `evidence/computed-styles.json`, `evidence/screenshots/`).
2. **True Component Isolation**: Scoped CSS modules ensure zero style conflicts with existing Next.js / Tailwind projects.
3. **Honest Engineering**: Exact fidelity scores show developers what is 100% ready to use and what requires specialized runtime setup.
