# AnimateLab — Phase 13 Component Reproduction & Usage Guide

## The "Copy & Use" Developer Workflow

When an extracted section is exported by AnimateLab, it produces a standalone package folder designed to be dropped directly into any React / Vite / Next.js project.

---

### 1. Package Directory Structure

```text
HeroSection/
├── HeroSection.tsx           # React TSX component definition
├── HeroSection.css           # Scoped CSS module with zero global leakage
├── manifest.json             # Component specification, hashes, and entry points
├── dependencies.json         # npm packages, browser APIs, and cleanup rules
├── props.json                # Validated, evidence-derived props
├── provenance.json           # Source URL, page, and extraction timestamp
├── validation.json           # 10-layer safety validation report
├── README.md                 # Self-contained reproduction documentation
└── assets/                   # Content-addressed portable assets
    └── hero-bg.webp
```

---

### 2. Integration Steps in Target Application

#### Step 1: Install Dependencies
Open `dependencies.json` or `README.md` to see the required npm packages:
```bash
npm install gsap@^3.12.5
```

#### Step 2: Copy the Folder
Copy the entire `HeroSection/` folder into your application (e.g. `src/components/HeroSection`).

#### Step 3: Import & Render
```tsx
import React from 'react';
import { HeroSection } from './components/HeroSection/HeroSection';

export default function App() {
  return (
    <main>
      <HeroSection />
    </main>
  );
}
```

---

### 3. Safety Guarantees

1. **No Port / Machine Leaks**: The component contains no hardcoded `localhost:3000` or local file paths.
2. **No CSS Collision**: All CSS classes and `@keyframes` are namespaced to the component.
3. **Evidence-Based Props**: Only props verified through observable page evidence are exposed.
4. **Graceful Fallbacks**: Missing assets degrade to inline SVG or neutral placeholders without crashing the application.
