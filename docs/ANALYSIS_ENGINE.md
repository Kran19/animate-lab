# Analysis Engine Specification — AnimateLab (Final Phase 2 Amendments)

## 1. Extended 6-Stage Component Extraction Lifecycle

A detected DOM section is NOT automatically a reusable React component. It progresses through a 6-stage extraction pipeline:

```
IDENTIFIED  ──►  ISOLATED  ──►  NORMALIZED  ──►  GENERATED  ──►  VALIDATED  ──►  EXPORTED
```

### Stage Definitions & Responsibilities

1. **`IDENTIFIED`**: DOM Section Detector flags a visual/interactive region based on layout score, viewport ratio, and animation density.
2. **`ISOLATED`**: DOM subtree, associated computed CSS rules, keyframe animations, and asset URLs are extracted into a self-contained DOM sandbox bundle.
3. **`NORMALIZED`**: Ad-hoc CSS class names are cleaned, vendor prefixes stripped, and scoping wrappers generated.
4. **`GENERATED`**: Code emitter compiles the normalized DOM structure into clean React TSX code with typed props.
5. **`VALIDATED`**: Built-in JSX compiler and headless preview renderer verify zero syntax or runtime execution errors.
6. **`EXPORTED`**: Verified component is added to the user's personal component library or exported to disk.

---

## 2. Multi-Tiered Technology Evidence Hierarchy

A technology declaration stores evidence type, raw value, and confidence score:

1. **Global Variables** (`window.gsap`, `window.ScrollTrigger`, `window.lenis`, `window.ThreeJS`) — Confidence 1.0
2. **Script URLs** (`/gsap\.min\.js/`, `/three\.r168\.js/`) — Confidence 0.95
3. **Bundle Signatures** (Webpack / Vite module registries) — Confidence 0.90
4. **Runtime Behavior** (`requestAnimationFrame` loops, Lenis data attributes) — Confidence 0.88
5. **Network Evidence** (Headers `x-powered-by`, static CDN asset origins) — Confidence 0.85
6. **DOM Evidence** (`__reactFiber$`, `__vue$`) — Confidence 0.80
7. **Library-Specific Evidence** (GLSL uniform structures `uTime`) — Confidence 0.75

---

## 3. Observational Non-Destructive Instrumentation

Runtime inspection is **100% observational by default**.
- Uses read-only proxy wrappers (`Object.defineProperty` getter traps).
- Does NOT alter GSAP durations, easing curves, Three.js render loop timing, or DOM event propagation unless explicitly feature-flagged.
- Temporary API wrapping (e.g. `requestAnimationFrame` hooks) is executed inside `try / finally` blocks and restored immediately.
