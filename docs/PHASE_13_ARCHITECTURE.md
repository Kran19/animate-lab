# AnimateLab — Phase 13 Architecture & Technical Reference

## 1. Architectural Overview

Phase 13 introduces the **Section Ownership & Standalone Packaging Pipeline**, transforming raw whole-page captures into independent, reproducible component packages.

```text
Source Webpage
      │
      ▼
SectionDetector (Semantic + Visual + Runtime + Interaction Signals)
      │
      ▼
SectionOwnershipGraph (Page → Sections → DOM / CSS / Asset / Animation Ownership)
      │
      ├── SectionIsolationValidator (Zero global leakage proof check)
      ├── AnimationOwnershipAnalyzer (GSAP, WAAPI, Keyframes, WebGL mapping)
      ├── AssetOwnershipAnalyzer (Deduplication: GLOBAL / SHARED / LOCAL)
      └── DependencyManifestGenerator (Machine-readable dependencies.json)
      │
      ▼
ComponentPackageBuilder (Atomic disk creation of 8-item package directory)
      │
      ├── Component.tsx (React functional component)
      ├── Component.css (Scoped CSS Module)
      ├── assets/* (Portable local assets)
      ├── manifest.json (Specification & hashes)
      ├── dependencies.json (npm & runtime requirements)
      ├── props.json (Evidence-derived props)
      ├── provenance.json (Lineage & detection metadata)
      ├── validation.json (10-layer safety report)
      └── README.md (Self-contained reproduction manual)
```

---

## 2. Core Modules

### `src/engine/extraction/sectionOwnershipGraph.ts`
- Tracks explicit parent-child ownership.
- Classifies asset scopes (`GLOBAL`, `PAGE_SHARED`, `SECTION_SHARED`, `SECTION_LOCAL`) to eliminate asset duplication.

### `src/engine/extraction/sectionIsolationValidator.ts`
- Automated checks verifying no global `body`/`html` leakage, no local `localhost`/filesystem paths, and no fabricated props.

### `src/engine/extraction/animationOwnershipAnalyzer.ts`
- Maps detected animations, trigger types (`scroll`, `hover`, `load`, `pointermove`), durations, and easing curves to owning sections.

### `src/engine/package/componentPackageBuilder.ts`
- Assembles and stages the standalone component package atomically with rollback protection.

### `src/engine/benchmark/sectionCompleteness.ts`
- Computes the primary KPI:
  $$\text{SECTION\_COMPLETENESS} = \frac{\text{Isolated} + 0.5 \times \text{Partial}}{\text{Total Discovered}} \times 100\%$$

### `src/engine/workflow/workflowAdapter.ts`
- Provides clean pluggable automation interface (`LocalWorkflowAdapter`, `N8nWebhookAdapter`) for batch benchmark pipelines without making external services mandatory.
