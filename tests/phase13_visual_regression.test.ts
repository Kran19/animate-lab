import { describe, it, expect } from 'vitest';
import { VisualRegressionEngine, ElementGeometryBox } from '../src/engine/benchmark/visualRegressionEngine';
import { ViewportValidator, STANDARD_VIEWPORTS } from '../src/engine/benchmark/viewportValidator';
import { ScrollCheckpointRunner } from '../src/engine/benchmark/scrollCheckpointRunner';

describe('Phase 13 — Visual Regression, Multi-Viewport & Scroll Checkpoints Suite (18 Tests)', () => {
  // ==========================================
  // Visual Regression & Geometry Comparisons
  // ==========================================
  it('1. Matches exact element bounding boxes with 100% similarity score', () => {
    const boxes: ElementGeometryBox[] = [
      { selector: '.hero', tagName: 'SECTION', x: 0, y: 0, width: 1440, height: 800 },
      { selector: '.title', tagName: 'H1', x: 200, y: 100, width: 1040, height: 80 },
    ];

    const result = VisualRegressionEngine.compareGeometry({
      sourceElements: boxes,
      renderedElements: boxes,
    });

    expect(result.similarityScore).toBe(100);
    expect(result.isVisualMatch).toBe(true);
    expect(result.unmatchedCount).toBe(0);
  });

  it('2. Tolerates subtle sub-pixel layout shifts within 12px threshold', () => {
    const source: ElementGeometryBox[] = [
      { selector: '.card', tagName: 'DIV', x: 100, y: 100, width: 400, height: 300 },
    ];
    const rendered: ElementGeometryBox[] = [
      { selector: '.card', tagName: 'DIV', x: 102, y: 101, width: 400, height: 298 },
    ];

    const result = VisualRegressionEngine.compareGeometry({
      sourceElements: source,
      renderedElements: rendered,
      tolerancePx: 12,
    });

    expect(result.similarityScore).toBe(100);
    expect(result.isVisualMatch).toBe(true);
  });

  it('3. Flags significant geometry misalignment (> 50px delta)', () => {
    const source: ElementGeometryBox[] = [
      { selector: '.card', tagName: 'DIV', x: 100, y: 100, width: 400, height: 300 },
    ];
    const rendered: ElementGeometryBox[] = [
      { selector: '.card', tagName: 'DIV', x: 300, y: 250, width: 200, height: 150 },
    ];

    const result = VisualRegressionEngine.compareGeometry({
      sourceElements: source,
      renderedElements: rendered,
      tolerancePx: 10,
    });

    expect(result.similarityScore).toBe(0);
    expect(result.isVisualMatch).toBe(false);
    expect(result.geometryDiscrepancies.length).toBe(1);
  });

  it('4. Detects missing rendered DOM elements compared to source', () => {
    const source: ElementGeometryBox[] = [
      { selector: '.btn-1', tagName: 'BUTTON', x: 100, y: 100, width: 120, height: 40 },
      { selector: '.btn-2', tagName: 'BUTTON', x: 240, y: 100, width: 120, height: 40 },
    ];
    const rendered: ElementGeometryBox[] = [
      { selector: '.btn-1', tagName: 'BUTTON', x: 100, y: 100, width: 120, height: 40 },
    ];

    const result = VisualRegressionEngine.compareGeometry({
      sourceElements: source,
      renderedElements: rendered,
    });

    expect(result.similarityScore).toBe(50);
    expect(result.unmatchedCount).toBe(1);
  });

  it('5. Computes accurate aggregate similarity across 10-node complex section', () => {
    const source: ElementGeometryBox[] = Array.from({ length: 10 }, (_, i) => ({
      selector: `.node-${i}`,
      tagName: 'DIV',
      x: i * 100,
      y: 50,
      width: 80,
      height: 80,
    }));
    // 8 match, 2 shift wildly
    const rendered: ElementGeometryBox[] = source.map((box, i) =>
      i < 8 ? { ...box } : { ...box, x: box.x + 200, y: box.y + 200 }
    );

    const result = VisualRegressionEngine.compareGeometry({
      sourceElements: source,
      renderedElements: rendered,
    });

    expect(result.similarityScore).toBe(80);
    expect(result.isVisualMatch).toBe(true);
  });

  // ==========================================
  // Multi-Viewport Responsive Validation
  // ==========================================
  it('6. Tests across all 4 standard responsive viewports (1440, 1024, 768, 375px)', () => {
    expect(STANDARD_VIEWPORTS.length).toBe(4);
    const widths = STANDARD_VIEWPORTS.map((v) => v.width);
    expect(widths).toContain(1440);
    expect(widths).toContain(1024);
    expect(widths).toContain(768);
    expect(widths).toContain(375);
  });

  it('7. Passes responsive validation when fluid component reflows properly', () => {
    const results = ViewportValidator.validateViewports(360, 600, false);
    for (const res of results) {
      expect(res.status).toBe('PASS');
      expect(res.hasHorizontalOverflow).toBe(false);
    }
  });

  it('8. Detects horizontal overflow when fixed width exceeds viewport', () => {
    // 800px fixed width overflows 375px mobile viewport
    const results = ViewportValidator.validateViewports(800, 600, false);
    const mobile = results.find((r) => r.viewport.name === 'Mobile');
    expect(mobile?.status).toBe('FAIL');
    expect(mobile?.hasHorizontalOverflow).toBe(true);
  });

  it('9. Gracefully marks desktop-only experimental WebGL canvas as PARTIAL on mobile', () => {
    const results = ViewportValidator.validateViewports(1400, 800, true);
    const mobile = results.find((r) => r.viewport.name === 'Mobile');
    expect(mobile?.status).toBe('PARTIAL');
  });

  it('10. Confirms 1440px desktop viewport displays full layout bounds', () => {
    const results = ViewportValidator.validateViewports(1200, 700, false);
    const desktop = results.find((r) => r.viewport.name === 'Desktop');
    expect(desktop?.status).toBe('PASS');
  });

  it('11. Confirms 1024px laptop viewport layout stability', () => {
    const results = ViewportValidator.validateViewports(960, 700, false);
    const laptop = results.find((r) => r.viewport.name === 'Laptop');
    expect(laptop?.status).toBe('PASS');
  });

  it('12. Confirms 768px tablet viewport layout stability', () => {
    const results = ViewportValidator.validateViewports(720, 700, false);
    const tablet = results.find((r) => r.viewport.name === 'Tablet');
    expect(tablet?.status).toBe('PASS');
  });

  // ==========================================
  // Scroll Checkpoints (0%, 25%, 50%, 75%, 100%)
  // ==========================================
  it('13. Samples exactly 5 canonical scroll checkpoints (0, 25, 50, 75, 100%)', () => {
    const cps = ScrollCheckpointRunner.STANDARD_CHECKPOINTS;
    expect(cps.length).toBe(5);
    const labels = cps.map((c) => c.label);
    expect(labels).toEqual(['0%', '25%', '50%', '75%', '100%']);
  });

  it('14. Validates scroll-driven transforms across all 5 checkpoints', () => {
    const checkpoints = ScrollCheckpointRunner.evaluateCheckpoints(true, false);
    expect(checkpoints.length).toBe(5);
    for (const cp of checkpoints) {
      expect(cp.status).toBe('PASS');
      expect(cp.sourceTransform).toContain('translate3d');
    }
  });

  it('15. Checkpoint 0% evaluates initial load transform state', () => {
    const checkpoints = ScrollCheckpointRunner.evaluateCheckpoints(true, false);
    const cp0 = checkpoints[0];
    expect(cp0.progress).toBe(0.0);
    expect(cp0.sourceTransform).toBe('translate3d(0px, -0px, 0px)');
  });

  it('16. Checkpoint 50% evaluates mid-scroll parallax state', () => {
    const checkpoints = ScrollCheckpointRunner.evaluateCheckpoints(true, false);
    const cp50 = checkpoints[2];
    expect(cp50.progress).toBe(0.5);
    expect(cp50.sourceTransform).toBe('translate3d(0px, -50px, 0px)');
  });

  it('17. Checkpoint 100% evaluates terminal scroll completion state', () => {
    const checkpoints = ScrollCheckpointRunner.evaluateCheckpoints(true, false);
    const cp100 = checkpoints[4];
    expect(cp100.progress).toBe(1.0);
    expect(cp100.sourceTransform).toBe('translate3d(0px, -100px, 0px)');
  });

  it('18. Classifies advanced dynamic shader checkpoints as PARTIAL beyond 50% scroll', () => {
    const checkpoints = ScrollCheckpointRunner.evaluateCheckpoints(true, true);
    const cp75 = checkpoints[3];
    expect(cp75.status).toBe('PARTIAL');
  });
});
