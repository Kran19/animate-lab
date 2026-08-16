# AnimateLab — Phase 15 Architecture & Technical Reference

## 1. System Pipeline Architecture

```text
Live Website
     │
     ▼
RealBrowserCapture (Playwright / Chromium Sandbox)
     │
     ├── 4 Standard Viewports (1440x900, 1024x768, 768x1024, 375x812)
     ├── DOM Trees, Computed Styles, Bounding Geometries
     ├── Network Requests, Media Assets (Fonts, Video, SVG, Canvas, Lottie)
     └── Runtime Telemetry & Console Logs (STRICT: Zero untrusted JS evaluated in Node)
     │
     ▼
MultiSignalSectionDetector
     │
     ├── visualBoundaryScore (Aspect ratio, full-width, background transitions)
     ├── semanticBoundaryScore (HTML5 landmarks: header, section, footer, main)
     ├── layoutBoundaryScore (Grid/flex containers, sticky/pinned bounds)
     ├── animationBoundaryScore (GSAP triggers, ScrollTrigger ranges, keyframes)
     └── interactionBoundaryScore (Interactive button/hover/tab clusters)
     │
     ▼
Forensic Analysis Engines
     │
     ├── AnimationForensics (5 Checkpoint State Transitions: 0%, 25%, 50%, 75%, 100%)
     ├── InteractionForensics (BEFORE -> ACTION -> AFTER Observable State Transitions)
     ├── TypographyForensics (Font families, variable axes, fallback stacks)
     └── AssetDependencyGraph (Scope classification: LOCAL, SHARED, GLOBAL)
     │
     ▼
ComponentPackageBuilder & EvidenceBundleBuilder
     │
     ├── Component.tsx & Component.module.css (0 Global CSS Leakage)
     ├── 10 Contract JSON & Documentation Files
     └── evidence/ Bundle (DOM, Styles, Geometry, Typography, Animations, Screenshots)
     │
     ▼
RealBrowserReproductionRunner (Clean-Room External Workspace)
     │
     ├── External App.tsx Harness Scaffolding
     ├── Compilation & Portability Check (0 AnimateLab Internal Path Leaks)
     └── Real Browser Multi-Viewport Mounting & Verification
     │
     ▼
Independent Python Verification Suite (tools/benchmark/)
     │
     ├── visual_comparator.py (Bounding-box IoU & geometry score)
     ├── geometry_analyzer.py (Layout alignment & structural matching)
     ├── perceptual_diff.py (Perceptual delta & edge similarity)
     ├── typography_diff.py (Text-region font metric alignment)
     └── asset_diff.py (Content-addressed checksums & byte size verification)
     │
     ▼
AcceptanceGate (4-Tier Disposition Engine)
     │
     ├── COPY_USE_CERTIFIED (100% verified standalone pass)
     ├── COPY_USE_PARTIAL (Documented specialized runtime with clean fallback)
     ├── COPY_USE_FAILED (Hard failure on syntax, CSS leakage, or broken assets)
     └── COPY_USE_BLOCKED (Insufficient evidence for trustworthy reproduction)
```
