import { describe, it, expect } from 'vitest';
import { AssetCompletenessValidator } from '../src/engine/benchmark/assetCompletenessValidator';
import { TypographyValidator } from '../src/engine/benchmark/typographyValidator';
import { AnimationFidelityValidator } from '../src/engine/benchmark/animationFidelityValidator';
import { InteractionValidator } from '../src/engine/benchmark/interactionValidator';
import { ScreenshotComparator } from '../src/engine/benchmark/screenshotComparator';

describe('Phase 14 — Fidelity Hardening, Typography, Animation & Visual Diff Suite (32 Tests)', () => {
  // ==========================================
  // Asset Completeness & Anomaly Detection
  // ==========================================
  it('1. Passes validation for valid portable asset item', () => {
    const res = AssetCompletenessValidator.validateAsset({
      assetId: 'hero-bg',
      originalUrl: 'https://site.com/hero.webp',
      exportPath: 'assets/hero.webp',
      mimeType: 'image/webp',
      sizeBytes: 85000,
      contentHash: 'sha256-hero123',
      isReferencedInCode: true,
      fileExistsOnDisk: true,
    });

    expect(res.isValid).toBe(true);
    expect(res.anomalies.length).toBe(0);
  });

  it('2. Flags EXTERNAL_ASSET when export path is not local to assets/ directory', () => {
    const res = AssetCompletenessValidator.validateAsset({
      assetId: 'external-img',
      originalUrl: 'https://cdn.remote.com/img.png',
      exportPath: 'https://cdn.remote.com/img.png',
      mimeType: 'image/png',
      sizeBytes: 24000,
      contentHash: 'sha256-ext123',
      isReferencedInCode: true,
    });

    expect(res.isValid).toBe(false);
    expect(res.anomalies).toContain('EXTERNAL_ASSET');
  });

  it('3. Flags UNREFERENCED_ASSET when asset is bundled but unused in markup/styles', () => {
    const res = AssetCompletenessValidator.validateAsset({
      assetId: 'unused-icon',
      originalUrl: 'https://site.com/unused.svg',
      exportPath: 'assets/unused.svg',
      mimeType: 'image/svg+xml',
      sizeBytes: 1200,
      contentHash: 'sha256-unused',
      isReferencedInCode: false,
    });

    expect(res.isValid).toBe(false);
    expect(res.anomalies).toContain('UNREFERENCED_ASSET');
  });

  it('4. Flags CORRUPTED_ASSET when asset byte size is 0', () => {
    const res = AssetCompletenessValidator.validateAsset({
      assetId: 'empty-file',
      originalUrl: 'https://site.com/empty.png',
      exportPath: 'assets/empty.png',
      mimeType: 'image/png',
      sizeBytes: 0,
      contentHash: 'sha256-empty',
      isReferencedInCode: true,
    });

    expect(res.isValid).toBe(false);
    expect(res.anomalies).toContain('CORRUPTED_ASSET');
  });

  it('5. Flags MISSING_ASSET when physical asset is missing on disk', () => {
    const res = AssetCompletenessValidator.validateAsset({
      assetId: 'missing-file',
      originalUrl: 'https://site.com/missing.png',
      exportPath: 'assets/missing.png',
      mimeType: 'image/png',
      sizeBytes: 5000,
      contentHash: 'sha256-miss',
      isReferencedInCode: true,
      fileExistsOnDisk: false,
    });

    expect(res.isValid).toBe(false);
    expect(res.anomalies).toContain('MISSING_ASSET');
  });

  it('6. Audits complete asset bundle and detects duplicate content hashes', () => {
    const audit = AssetCompletenessValidator.auditAssetBundle([
      { assetId: 'a1', originalUrl: 'https://site.com/a1.png', exportPath: 'assets/a1.png', mimeType: 'image/png', sizeBytes: 1000, contentHash: 'sha256-dup', isReferencedInCode: true },
      { assetId: 'a2', originalUrl: 'https://site.com/a2.png', exportPath: 'assets/a2.png', mimeType: 'image/png', sizeBytes: 1000, contentHash: 'sha256-dup', isReferencedInCode: true },
    ]);

    expect(audit.totalAssets).toBe(2);
    expect(audit.duplicateCount).toBe(1);
  });

  // ==========================================
  // Typography & Font Stack Certification
  // ==========================================
  it('7. Passes typography audit when font family and fallback stack are specified', () => {
    const res = TypographyValidator.validateTypography([
      {
        fontFamily: 'Inter',
        fontWeight: 400,
        fallbackStack: ['sans-serif', 'system-ui'],
        isCustomWebFont: false,
      },
    ]);

    expect(res.compliantCount).toBe(1);
    expect(res.results[0].isCompliant).toBe(true);
    expect(res.results[0].hasFallbackStack).toBe(true);
  });

  it('8. Validates custom web font with bundled WOFF2 font file', () => {
    const res = TypographyValidator.validateTypography([
      {
        fontFamily: 'ClashDisplay-Variable',
        fontWeight: '100 900',
        fallbackStack: ['sans-serif'],
        isCustomWebFont: true,
        fontFileAvailable: true,
      },
    ]);

    expect(res.compliantCount).toBe(1);
    expect(res.customFontCount).toBe(1);
    expect(res.results[0].isCustomFontPreserved).toBe(true);
  });

  it('9. Flags missing fallback font stack as diagnostic warning', () => {
    const res = TypographyValidator.validateTypography([
      {
        fontFamily: 'CustomBrutalist',
        fontWeight: 800,
        fallbackStack: [],
        isCustomWebFont: true,
        fontFileAvailable: false,
      },
    ]);

    expect(res.compliantCount).toBe(0);
    expect(res.results[0].diagnostics.length).toBeGreaterThan(0);
  });

  it('10. Audits multi-font typography specification across heading and body styles', () => {
    const res = TypographyValidator.validateTypography([
      { fontFamily: 'MonumentExtended', fontWeight: 900, fallbackStack: ['sans-serif'], isCustomWebFont: true, fontFileAvailable: true },
      { fontFamily: 'SpaceMono', fontWeight: 400, fallbackStack: ['monospace'], isCustomWebFont: false },
    ]);

    expect(res.totalEvaluated).toBe(2);
    expect(res.compliantCount).toBe(2);
  });

  // ==========================================
  // Animation Fidelity & Checkpoint Auditing
  // ==========================================
  it('11. Classifies standard GSAP timeline animation as REPRODUCED', () => {
    const audit = AnimationFidelityValidator.auditAnimation({
      name: 'heroTextReveal',
      technology: 'GSAP',
      trigger: 'load',
      durationMs: 1200,
    });

    expect(audit.classification).toBe('REPRODUCED');
    expect(audit.checkpointStatus['0%']).toBe('PASS');
    expect(audit.checkpointStatus['100%']).toBe('PASS');
  });

  it('12. Classifies specialized WebGL/Three.js render loop as PARTIAL with diagnostic note', () => {
    const audit = AnimationFidelityValidator.auditAnimation({
      name: 'threeGlobeLoop',
      technology: 'Three.js',
      trigger: 'continuous',
      durationMs: 16,
      isSpecializedRuntime: true,
    });

    expect(audit.classification).toBe('PARTIAL');
    expect(audit.checkpointStatus['50%']).toBe('PARTIAL');
    expect(audit.diagnostics).toContain('Specialized render loop');
  });

  it('13. Classifies zero-duration missing keyframe sequence as NOT_DETECTED', () => {
    const audit = AnimationFidelityValidator.auditAnimation({
      name: 'emptyAnim',
      technology: 'CSS_KEYFRAMES',
      trigger: 'load',
      durationMs: 0,
    });

    expect(audit.classification).toBe('NOT_DETECTED');
  });

  it('14. Validates 5-point scroll checkpoint transitions (0%, 25%, 50%, 75%, 100%)', () => {
    const audit = AnimationFidelityValidator.auditAnimation({
      name: 'scrollParallax',
      technology: 'ScrollTrigger',
      trigger: 'scroll',
      durationMs: 1000,
      hasScrollCheckpoints: true,
    });

    const checkpoints = Object.keys(audit.checkpointStatus);
    expect(checkpoints).toEqual(['0%', '25%', '50%', '75%', '100%']);
    for (const cp of checkpoints) {
      expect(audit.checkpointStatus[cp]).toBe('PASS');
    }
  });

  // ==========================================
  // Interaction Fidelity & Evidence Verification
  // ==========================================
  it('15. Verifies click interaction backed by observable DOM button element', () => {
    const res = InteractionValidator.auditInteractions([
      {
        event: 'click',
        targetSelector: '.cta-btn',
        observedStateChange: 'Modal drawer opens',
        hasDomEvidence: true,
        hasSyntheticCallback: false,
      },
    ]);

    expect(res.validInteractions).toBe(1);
    expect(res.fabricatedCount).toBe(0);
    expect(res.interactions[0].status).toBe('VERIFIED');
    expect(res.interactions[0].reproductionStatus).toBe('REPRODUCED');
  });

  it('16. Rejects fabricated synthetic callback without DOM evidence as FABRICATED', () => {
    const res = InteractionValidator.auditInteractions([
      {
        event: 'click',
        targetSelector: '.phantom-btn',
        observedStateChange: 'Synthetic onClick handler',
        hasDomEvidence: false,
        hasSyntheticCallback: true,
      },
    ]);

    expect(res.fabricatedCount).toBe(1);
    expect(res.interactions[0].status).toBe('FABRICATED');
    expect(res.interactions[0].reproductionStatus).toBe('UNSUPPORTED');
  });

  it('17. Verifies hover interaction trigger with CSS transition state', () => {
    const res = InteractionValidator.auditInteractions([
      {
        event: 'hover',
        targetSelector: '.card-image',
        observedStateChange: 'Transform scale(1.05)',
        hasDomEvidence: true,
        hasSyntheticCallback: false,
      },
    ]);

    expect(res.interactions[0].status).toBe('VERIFIED');
  });

  it('18. Verifies tab switching interaction evidence', () => {
    const res = InteractionValidator.auditInteractions([
      {
        event: 'tab',
        targetSelector: '.tab-btn',
        observedStateChange: 'Active tab index switch',
        hasDomEvidence: true,
        hasSyntheticCallback: false,
      },
    ]);

    expect(res.interactions[0].status).toBe('VERIFIED');
  });

  it('19. Verifies accordion toggle interaction evidence', () => {
    const res = InteractionValidator.auditInteractions([
      {
        event: 'accordion',
        targetSelector: '.faq-trigger',
        observedStateChange: 'Height 0 to auto',
        hasDomEvidence: true,
        hasSyntheticCallback: false,
      },
    ]);

    expect(res.interactions[0].status).toBe('VERIFIED');
  });

  it('20. Classifies physics-based draggable interaction as PARTIAL', () => {
    const res = InteractionValidator.auditInteractions([
      {
        event: 'drag',
        targetSelector: '.physics-card',
        observedStateChange: 'Physics impulse',
        hasDomEvidence: true,
        hasSyntheticCallback: false,
        dependency: 'Matter.js',
      },
    ]);

    expect(res.interactions[0].reproductionStatus).toBe('PARTIAL');
  });

  // ==========================================
  // Category-Level Visual Diff Auditing
  // ==========================================
  it('21. Calculates aggregate visual score across all 9 structured categories', () => {
    const report = ScreenshotComparator.evaluateCategoryVisualFidelity({
      STRUCTURE: 96,
      TYPOGRAPHY: 92,
      SPACING: 94,
      COLOR: 98,
      ASSET: 95,
      GEOMETRY: 92,
      ANIMATION: 90,
      RESPONSIVE: 94,
      INTERACTION: 92,
    });

    expect(report.overallVisualScore).toBeGreaterThanOrEqual(90);
    expect(report.isCertifiedVisualMatch).toBe(true);
    expect(report.categories.length).toBe(9);
  });

  it('22. Structure category weight correctly influences overall visual score', () => {
    const report = ScreenshotComparator.evaluateCategoryVisualFidelity({
      STRUCTURE: 100,
    });
    expect(report.categories.find((c) => c.category === 'STRUCTURE')?.weight).toBe(0.15);
  });

  it('23. Typography category weight is 15% of visual score', () => {
    const report = ScreenshotComparator.evaluateCategoryVisualFidelity({});
    expect(report.categories.find((c) => c.category === 'TYPOGRAPHY')?.weight).toBe(0.15);
  });

  it('24. Color category weight is 10% of visual score', () => {
    const report = ScreenshotComparator.evaluateCategoryVisualFidelity({});
    expect(report.categories.find((c) => c.category === 'COLOR')?.weight).toBe(0.10);
  });

  it('25. Spacing category weight is 10% of visual score', () => {
    const report = ScreenshotComparator.evaluateCategoryVisualFidelity({});
    expect(report.categories.find((c) => c.category === 'SPACING')?.weight).toBe(0.10);
  });

  it('26. Asset category weight is 10% of visual score', () => {
    const report = ScreenshotComparator.evaluateCategoryVisualFidelity({});
    expect(report.categories.find((c) => c.category === 'ASSET')?.weight).toBe(0.10);
  });

  it('27. Geometry category weight is 15% of visual score', () => {
    const report = ScreenshotComparator.evaluateCategoryVisualFidelity({});
    expect(report.categories.find((c) => c.category === 'GEOMETRY')?.weight).toBe(0.15);
  });

  it('28. Animation category weight is 10% of visual score', () => {
    const report = ScreenshotComparator.evaluateCategoryVisualFidelity({});
    expect(report.categories.find((c) => c.category === 'ANIMATION')?.weight).toBe(0.10);
  });

  it('29. Responsive category weight is 10% of visual score', () => {
    const report = ScreenshotComparator.evaluateCategoryVisualFidelity({});
    expect(report.categories.find((c) => c.category === 'RESPONSIVE')?.weight).toBe(0.10);
  });

  it('30. Interaction category weight is 5% of visual score', () => {
    const report = ScreenshotComparator.evaluateCategoryVisualFidelity({});
    expect(report.categories.find((c) => c.category === 'INTERACTION')?.weight).toBe(0.05);
  });

  it('31. Fails certification when visual score falls below 85 threshold', () => {
    const report = ScreenshotComparator.evaluateCategoryVisualFidelity({
      STRUCTURE: 50,
      GEOMETRY: 50,
      TYPOGRAPHY: 60,
      SPACING: 50,
      COLOR: 60,
      ASSET: 50,
      ANIMATION: 50,
      RESPONSIVE: 50,
      INTERACTION: 50,
    });

    expect(report.overallVisualScore).toBeLessThan(85);
    expect(report.isCertifiedVisualMatch).toBe(false);
    expect(report.summary).toContain('below certification threshold');
  });

  it('32. Produces diagnostic explanation for visual comparison summary', () => {
    const report = ScreenshotComparator.evaluateCategoryVisualFidelity({});
    expect(report.summary.length).toBeGreaterThan(10);
  });
});
