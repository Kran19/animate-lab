# AnimateLab — Phase 14 Clean-Room Reproduction Specification

## 1. Objective

The **Clean-Room Specification** defines the black-box validation protocol used to certify that an exported component package is 100% portable and runnable in an external consumer React environment with zero AnimateLab runtime dependencies.

---

## 2. Directory Scaffolding

```text
workspaces/clean_room/<run-id>/<section-id>/
├── package.json              # Consumer React 18+ application manifest
├── tsconfig.json             # Standard ES2020 React JSX TypeScript configuration
├── App.tsx                   # Consumer component mounting harness
└── copied-component/         # The isolated standalone component package
    ├── Component.tsx
    ├── Component.css
    ├── manifest.json
    ├── dependencies.json
    ├── props.json
    ├── animation.json
    ├── interaction.json
    ├── provenance.json
    ├── validation.json
    ├── README.md
    └── assets/
```

---

## 3. Mandatory Clean-Room Validation Checks

1. **Compilation Check**: `Component.tsx` must parse and typecheck without syntax errors.
2. **Path Leakage Check**: Zero occurrences of `localhost`, `127.0.0.1`, `file://`, `workspaces/`, `src/engine/`, `src/bridge/`, or `@prisma/client`.
3. **Asset Resolution Check**: All bundled assets in `assets/` must be referenced using portable relative paths (`./assets/...`).
4. **Dependency Compliance Check**: Required npm packages (e.g. `gsap`, `lottie-web`, `three`) must match declarations in `dependencies.json`.
5. **Multi-Viewport Stability**: Renders cleanly across 1440px, 1024px, 768px, and 375px viewports.
