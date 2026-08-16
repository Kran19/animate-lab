# AnimateLab Antigravity Autonomous Agent Briefing

This briefing provides the authoritative architectural contract, invariant rules, and operational guidelines for Google Antigravity autonomous agents working on **AnimateLab**.

---

## 1. Core Architectural Contract: Forensic Intermediate Representation (FIR)

The pipeline is strictly one-directional and decoupled:

```text
REAL CHROMIUM BROWSER
        │
   [Independent Append-Only Collectors]
   (DOM, Style, Asset, Motion, Interaction, Canvas)
        │
        ▼
   FIR ASSEMBLER
   (Normalize, Deduplicate, Validate, SHA-256 Hash)
        │
        ▼
   SectionFIR (fir.json) ── Frozen Contract v0.1.0
        │
        ▼
   Python Motion Intelligence / Synthesis Planning Layer
   (CapabilityResolver, MotionSynthesizer, InteractionSynthesizer)
        │
        ▼
   React Component Generator (generateFromFIR)
        │
        ▼
   Clean-Room Behavioral Replay & Perceptual Verification
        │
        ▼
   Searchable Component Library Catalog (workspace-data/library/)
```

---

## 2. Invariant Rules (Strict Enforcement)

1. **Never bypass FIR**: No code generator is permitted to query Playwright or live browser DOM/state. If information is needed for synthesis, it must be recorded in `SectionFIR`.
2. **Never invent evidence**: Missing animations, interactions, or canvas scenes must be reported truthfully as `MISSING` or `PARTIAL`.
3. **Never claim unsupported fidelity**: A false 95% is a failure. An honest 75% PARTIAL is a success.
4. **Zero Shared-State Observer Mutations**: No evidence collector receives or mutates `SectionFIR`.
5. **Deterministic Mathematics Before ML**: Python motion analysis uses curve fitting (MSE minimization) and SSIM before introducing neural heuristics.
6. **WebGL Hierarchy**: Canvas/WebGL without shader decomposition is classified as `STATIC_IMAGE_FALLBACK` / `PARTIAL`, never full scene reconstruction.

---

## 3. Six-Stage Failure Taxonomy

Diagnostics are isolated into 6 distinct failure stages:
1. `OBSERVATION_FAILURE`: Live browser failed to capture runtime state or emitted inconsistent observations.
2. `FIR_FAILURE`: Schema validation error, missing identity/geometry, or referential integrity breach.
3. `SYNTHESIS_FAILURE`: Code normalizer, TypeScript syntax error, or JSX generation failure.
4. `REPLAY_FAILURE`: Standalone clean-room execution failed or stimulus-response delta differed.
5. `VISUAL_FIDELITY_FAILURE`: Frame-by-frame perceptual SSIM or pixel difference exceeded tolerance.
6. `MOTION_FIDELITY_FAILURE`: Motion curve fitting MSE exceeded tolerance or timeline sequence diverged.

---

## 4. Directory Structure

```text
animate-lab/
├── docs/                        # Specifications, acceptance manuals, briefings
├── python/                      # Python Motion Intelligence Lab
│   └── motion_lab/              # Easing, frame diff, storytelling, CLI
├── scripts/                     # Cross-platform CLI automation (.bat and .sh)
├── src/
│   └── engine/
│       ├── domain/fir/          # Authoritative SectionFIR types & validation
│       ├── extraction/          # Independent collectors & FIRAssembler
│       ├── generation/          # React generator, motion & interaction synthesizers
│       ├── acceptance/          # Clean-room runner & behavioral replay
│       ├── motionLab/           # TypeScript-Python bridge & frame capture
│       ├── workbench/           # Batch laboratory & library indexer
│       └── benchmark/           # Golden Corpus manifest & perceptual scorecard
├── tests/                       # Vitest test suites (Phases 3-19)
└── workspace-data/library/      # Searchable personal component catalog
```
