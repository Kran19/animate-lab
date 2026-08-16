# AnimateLab — Phase 14 Architecture & Technical Reference

## 1. Acceptance Architecture

```text
Source Webpage
      │
      ▼
SectionDetector (Semantic + Visual Boundaries)
      │
      ▼
SectionOwnershipGraph (DOM, CSS, Asset, Animation Ownership)
      │
      ▼
ComponentPackageBuilder (Atomic 10-File Standalone Package Assembly)
      │
      ▼
CleanRoomRunner (External Workspace Scaffolding & Black-Box Execution)
      │
      ├── TypeScript Syntax & Compilation Verification
      ├── Path Leakage Audit (Zero internal AnimateLab imports)
      ├── Asset Portability & Local Path Verification
      └── Consumer App.tsx Harness Scaffolding
      │
      ▼
AcceptanceGate (Multi-Criteria Gate Evaluator)
      │
      ├── COPY_USE_CERTIFIED (100% standalone pass)
      ├── COPY_USE_PARTIAL (Specialized runtimes documented with clean fallback)
      └── COPY_USE_FAILED (Hard failure on leakage or syntax error)
```

---

## 2. Core Modules

- **`src/engine/acceptance/cleanRoomRunner.ts`**: Implements physical clean-room reproduction testing.
- **`src/engine/acceptance/acceptanceGate.ts`**: Multi-criteria gate evaluation engine.
- **`src/engine/acceptance/packageVerifier.ts`**: Validates the complete 10-file standalone contract.
- **`src/engine/benchmark/assetCompletenessValidator.ts`**: Anomaly detection and deduplication.
- **`src/engine/benchmark/typographyValidator.ts`**: Typography and font-stack reproduction.
- **`src/engine/benchmark/animationFidelityValidator.ts`**: 5-point scroll checkpoint auditing.
- **`src/engine/benchmark/interactionValidator.ts`**: Interaction auditing with zero fabricated callbacks.
- **`src/engine/benchmark/screenshotComparator.ts`**: Category-level visual regression analysis.
- **`tools/benchmark/visual_comparator.py`**: Python verification layer for geometry and pixel diffing.
