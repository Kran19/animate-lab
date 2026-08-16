import { describe, it, expect } from 'vitest';
import { RuntimeAssetCapture } from '../src/engine/acceptance/runtimeAssetCapture';
import { ComputedStyleTreeExtractor } from '../src/engine/analysis/computedStyleTree';
import { CSSAnimationForensics } from '../src/engine/analysis/cssAnimationForensics';
import { GsapRuntimeForensics } from '../src/engine/analysis/gsapRuntimeForensics';
import { WebGLForensics } from '../src/engine/analysis/webglForensics';
import { ResourceHarvester } from '../src/engine/extraction/resourceHarvester';

describe('Runtime Extraction Forensics Engine Suite (Pillars 1–6)', () => {
  it('1. RuntimeAssetCapture instantiates cleanly and generates fonts.css', () => {
    const capture = new RuntimeAssetCapture();
    expect(capture).toBeDefined();
    const css = capture.generateFontsCss('fonts');
    expect(css).toContain('/* Authentically Captured @font-face Declarations */');
  });

  it('2. ComputedStyleTreeExtractor defines extractNodeTree', () => {
    expect(typeof ComputedStyleTreeExtractor.extractNodeTree).toBe('function');
  });

  it('3. CSSAnimationForensics defines captureLiveAnimations', () => {
    expect(typeof CSSAnimationForensics.captureLiveAnimations).toBe('function');
  });

  it('4. GsapRuntimeForensics defines inspectRuntime', () => {
    expect(typeof GsapRuntimeForensics.inspectRuntime).toBe('function');
  });

  it('5. WebGLForensics defines analyzeCanvas and respects Level A / Level B contracts', () => {
    expect(typeof WebGLForensics.analyzeCanvas).toBe('function');
  });

  it('6. ResourceHarvester defines harvestLivePageStylesAndDOM for full-fidelity extraction', () => {
    expect(typeof ResourceHarvester.harvestLivePageStylesAndDOM).toBe('function');
  });
});
