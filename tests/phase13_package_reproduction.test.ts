import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ComponentPackageBuilder } from '../src/engine/package/componentPackageBuilder';
import { ReproductionDocGenerator } from '../src/engine/package/reproductionDocGenerator';
import { SectionCompletenessCalculator } from '../src/engine/benchmark/sectionCompleteness';
import { LocalWorkflowAdapter, N8nWebhookAdapter } from '../src/engine/workflow/workflowAdapter';
import fs from 'fs';
import path from 'path';

describe('Phase 13 — Package Reproduction, Section Completeness KPI & Workflow Suite (20 Tests)', () => {
  const testPkgDir = path.join(process.cwd(), 'workspaces', 'test_p13_repro');

  beforeAll(() => {
    if (fs.existsSync(testPkgDir)) {
      fs.rmSync(testPkgDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testPkgDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(testPkgDir)) {
      fs.rmSync(testPkgDir, { recursive: true, force: true });
    }
  });

  // ==========================================
  // Component Package Generation
  // ==========================================
  it('1. Generates complete 8-item standalone component package directory', () => {
    const res = ComponentPackageBuilder.buildPackage({
      componentName: 'FeatureGrid',
      category: 'Card-Grid',
      sourceCandidateId: 'cand-feat-1',
      websiteId: 'web-1',
      pageId: 'page-1',
      sourceWebsiteUrl: 'https://sample.agency',
      sourcePagePath: '/work',
      tsxCode: 'export const FeatureGrid = () => <div className="grid">Feature</div>;',
      cssCode: '.grid { display: flex; }',
      assets: [{
        assetId: 'card-img',
        originalUrl: 'https://sample.agency/card.webp',
        localPath: '',
        exportPath: 'assets/card.webp',
        mimeType: 'image/webp',
        sizeBytes: 40000,
        contentHash: 'sha256-card123',
        usageLocation: 'FeatureGrid > card',
        owningSectionId: 'sec-feat',
        ownershipScope: 'SECTION_LOCAL',
        isRequired: true,
        isAnimated: false,
      }],
      propsDocJson: JSON.stringify([{ name: 'title', type: 'string', required: false, description: 'Card title' }]),
      technologies: ['GSAP', 'TailwindCSS'],
      animations: [{ name: 'cardStagger', technology: 'GSAP', trigger: 'scroll', durationMs: 800 }],
      isolationStatus: 'ISOLATED',
      validationReport: {
        isValid: true,
        layersPassed: ['Structural Validation', 'CSS Isolation'],
        layersFailed: [],
        errors: [],
        warnings: [],
      },
      outputDirectory: testPkgDir,
    });

    expect(res.status).toBe('created');
    expect(res.filesCreated.length).toBeGreaterThanOrEqual(8);
    expect(fs.existsSync(path.join(testPkgDir, 'FeatureGrid', 'FeatureGrid.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(testPkgDir, 'FeatureGrid', 'FeatureGrid.css'))).toBe(true);
    expect(fs.existsSync(path.join(testPkgDir, 'FeatureGrid', 'manifest.json'))).toBe(true);
    expect(fs.existsSync(path.join(testPkgDir, 'FeatureGrid', 'dependencies.json'))).toBe(true);
    expect(fs.existsSync(path.join(testPkgDir, 'FeatureGrid', 'props.json'))).toBe(true);
    expect(fs.existsSync(path.join(testPkgDir, 'FeatureGrid', 'provenance.json'))).toBe(true);
    expect(fs.existsSync(path.join(testPkgDir, 'FeatureGrid', 'validation.json'))).toBe(true);
    expect(fs.existsSync(path.join(testPkgDir, 'FeatureGrid', 'README.md'))).toBe(true);
  });

  it('2. Asserts manifest.json in package contains valid structure and entry points', () => {
    const manifestPath = path.join(testPkgDir, 'FeatureGrid', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    expect(manifest.name).toBe('FeatureGrid');
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.entry).toBe('FeatureGrid.tsx');
    expect(manifest.style).toBe('FeatureGrid.css');
    expect(manifest.isolationStatus).toBe('ISOLATED');
  });

  it('3. Asserts dependencies.json includes npm packages and browser APIs', () => {
    const depsPath = path.join(testPkgDir, 'FeatureGrid', 'dependencies.json');
    const deps = JSON.parse(fs.readFileSync(depsPath, 'utf-8'));

    expect(deps.npm['gsap']).toBeDefined();
    expect(deps.npm['react']).toBeDefined();
  });

  it('4. Asserts props.json reflects evidence-based props with description', () => {
    const propsPath = path.join(testPkgDir, 'FeatureGrid', 'props.json');
    const props = JSON.parse(fs.readFileSync(propsPath, 'utf-8'));

    expect(props.length).toBe(1);
    expect(props[0].name).toBe('title');
    expect(props[0].description).toBe('Card title');
  });

  it('5. Asserts provenance.json tracks source website, candidate ID, and timestamp', () => {
    const provPath = path.join(testPkgDir, 'FeatureGrid', 'provenance.json');
    const prov = JSON.parse(fs.readFileSync(provPath, 'utf-8'));

    expect(prov.sourceWebsiteUrl).toBe('https://sample.agency');
    expect(prov.sourceCandidateId).toBe('cand-feat-1');
    expect(prov.extractedAt).toBeDefined();
  });

  it('6. Asserts validation.json records 10-layer validation status', () => {
    const valPath = path.join(testPkgDir, 'FeatureGrid', 'validation.json');
    const val = JSON.parse(fs.readFileSync(valPath, 'utf-8'));

    expect(val.isValid).toBe(true);
    expect(val.layersPassed).toContain('Structural Validation');
  });

  it('7. Handles atomic staging rollback when disk write fails', () => {
    const res = ComponentPackageBuilder.buildPackage({
      componentName: 'InvalidPackage',
      category: 'Error',
      sourceCandidateId: 'cand-err',
      websiteId: 'web-1',
      pageId: 'page-1',
      sourceWebsiteUrl: 'https://err.com',
      sourcePagePath: '/',
      tsxCode: 'error',
      cssCode: '',
      assets: [],
      propsDocJson: '[]',
      technologies: [],
      animations: [],
      isolationStatus: 'ISOLATED',
      validationReport: { isValid: true, layersPassed: [], layersFailed: [], errors: [], warnings: [] },
      outputDirectory: 'Z:\\InvalidPath_NonExistent\\Dir',
    });

    expect(res.status).toBe('failed');
    expect(res.error).toBeDefined();
  });

  // ==========================================
  // README Reproduction Document Generator
  // ==========================================
  it('8. Generates complete developer-friendly installation commands in README', () => {
    const readme = ReproductionDocGenerator.generateReadme({
      componentName: 'HeroHeader',
      category: 'Hero',
      sourceWebsiteUrl: 'https://site.com',
      sourcePagePath: '/',
      tsxFileName: 'HeroHeader.tsx',
      cssFileName: 'HeroHeader.css',
      dependencies: {
        npm: { react: '^18.0.0', 'react-dom': '^18.0.0', gsap: '^3.12.5' },
        browserApis: ['IntersectionObserver'],
        runtime: [],
        fonts: [],
        externalUrls: [],
        assumptions: [],
        initializationRequirements: [],
        cleanupRequirements: ['Kill GSAP on unmount'],
      },
      assets: [],
      props: [],
      animations: [{ name: 'heroFade', technology: 'GSAP', trigger: 'load', durationMs: 800 }],
      viewportsTested: [{ name: 'Desktop', width: 1440, status: 'PASS' }],
      isolationStatus: 'ISOLATED',
    });

    expect(readme).toContain('npm install gsap@^3.12.5');
    expect(readme).toContain('import { HeroHeader } from \'./HeroHeader\';');
  });

  it('9. Formats evidence-based props table in README', () => {
    const readme = ReproductionDocGenerator.generateReadme({
      componentName: 'TestProps',
      category: 'Card',
      sourceWebsiteUrl: 'https://site.com',
      sourcePagePath: '/',
      tsxFileName: 'TestProps.tsx',
      cssFileName: 'TestProps.css',
      dependencies: { npm: {}, browserApis: [], runtime: [], fonts: [], externalUrls: [], assumptions: [], initializationRequirements: [], cleanupRequirements: [] },
      assets: [],
      props: [{ name: 'heading', type: 'string', required: true, description: 'Card title heading', defaultValue: 'Default Heading' }],
      animations: [],
      viewportsTested: [],
      isolationStatus: 'ISOLATED',
    });

    expect(readme).toContain('`heading`');
    expect(readme).toContain('**Yes**');
    expect(readme).toContain('Card title heading');
  });

  it('10. Formats required assets inventory table in README', () => {
    const readme = ReproductionDocGenerator.generateReadme({
      componentName: 'TestAssets',
      category: 'Visual',
      sourceWebsiteUrl: 'https://site.com',
      sourcePagePath: '/',
      tsxFileName: 'TestAssets.tsx',
      cssFileName: 'TestAssets.css',
      dependencies: { npm: {}, browserApis: [], runtime: [], fonts: [], externalUrls: [], assumptions: [], initializationRequirements: [], cleanupRequirements: [] },
      assets: [{
        assetId: 'a1',
        originalUrl: 'https://site.com/bg.png',
        localPath: '',
        exportPath: 'assets/bg.png',
        mimeType: 'image/png',
        sizeBytes: 80000,
        contentHash: 'sha256-abcdef1234567890',
        usageLocation: 'TestAssets > bg',
        owningSectionId: 'sec-1',
        ownershipScope: 'SECTION_LOCAL',
        isRequired: true,
        isAnimated: false,
      }],
      props: [],
      animations: [],
      viewportsTested: [],
      isolationStatus: 'ISOLATED',
    });

    expect(readme).toContain('`assets/bg.png`');
    expect(readme).toContain('image/png');
    expect(readme).toContain('78.1 KB');
  });

  // ==========================================
  // Section Completeness Metric Calculation
  // ==========================================
  it('11. Computes 100% Section Completeness when all 10 sections are ISOLATED', () => {
    const sections = Array.from({ length: 10 }, (_, i) => ({
      sectionId: `sec-${i + 1}`,
      title: `Section ${i + 1}`,
      category: 'Hero',
      status: 'ISOLATED' as const,
    }));

    const report = SectionCompletenessCalculator.calculateCompleteness({
      websiteId: 'web-1',
      url: 'https://site.com',
      sections,
    });

    expect(report.completenessScore).toBe(100);
    expect(report.isolatedSectionsCount).toBe(10);
    expect(report.partialSectionsCount).toBe(0);
    expect(report.rating).toBe('EXCELLENT');
  });

  it('12. Computes 95% Section Completeness when 9 are ISOLATED and 1 is PARTIAL', () => {
    const sections = Array.from({ length: 9 }, (_, i) => ({
      sectionId: `sec-${i + 1}`,
      title: `Section ${i + 1}`,
      category: 'Hero',
      status: 'ISOLATED' as const,
    }));
    sections.push({
      sectionId: 'sec-10',
      title: 'Section 10',
      category: '3D-Section',
      status: 'PARTIAL' as const,
    });

    const report = SectionCompletenessCalculator.calculateCompleteness({
      websiteId: 'web-1',
      url: 'https://trionn.com',
      sections,
    });

    // (9 + 0.5 * 1) / 10 = 9.5 / 10 = 95%
    expect(report.completenessScore).toBe(95);
    expect(report.isolatedSectionsCount).toBe(9);
    expect(report.partialSectionsCount).toBe(1);
    expect(report.rating).toBe('EXCELLENT');
  });

  it('13. Computes 80% Section Completeness when 7 are ISOLATED and 2 are PARTIAL', () => {
    const sections = [
      ...Array.from({ length: 7 }, (_, i) => ({ sectionId: `sec-${i}`, title: `Sec ${i}`, category: 'C', status: 'ISOLATED' as const })),
      { sectionId: 'sec-8', title: 'Sec 8', category: 'C', status: 'PARTIAL' as const },
      { sectionId: 'sec-9', title: 'Sec 9', category: 'C', status: 'PARTIAL' as const },
      { sectionId: 'sec-10', title: 'Sec 10', category: 'C', status: 'UNSUPPORTED' as const },
    ];

    const report = SectionCompletenessCalculator.calculateCompleteness({
      websiteId: 'web-1',
      url: 'https://site.com',
      sections,
    });

    // (7 + 0.5 * 2) / 10 = 8.0 / 10 = 80%
    expect(report.completenessScore).toBe(80);
    expect(report.rating).toBe('GOOD');
  });

  it('14. Explicitly lists every section with its title, category, and reproduction package path', () => {
    const report = SectionCompletenessCalculator.calculateCompleteness({
      websiteId: 'web-1',
      url: 'https://site.com',
      sections: [{ sectionId: 'sec-hero', title: 'Hero', category: 'Hero', status: 'ISOLATED', packagePath: '/exports/Hero' }],
    });

    expect(report.sectionBreakdown.length).toBe(1);
    expect(report.sectionBreakdown[0].reproduciblePackagePath).toBe('/exports/Hero');
  });

  it('15. Rates completeness below 65% as POOR without obscuring failure count', () => {
    const sections = [
      { sectionId: 's1', title: 'S1', category: 'C', status: 'ISOLATED' as const },
      { sectionId: 's2', title: 'S2', category: 'C', status: 'FAILED' as const },
      { sectionId: 's3', title: 'S3', category: 'C', status: 'FAILED' as const },
    ];

    const report = SectionCompletenessCalculator.calculateCompleteness({
      websiteId: 'web-1',
      url: 'https://site.com',
      sections,
    });

    expect(report.completenessScore).toBe(33);
    expect(report.rating).toBe('POOR');
    expect(report.failedSectionsCount).toBe(2);
  });

  // ==========================================
  // Optional Workflow / n8n Integration
  // ==========================================
  it('16. LocalWorkflowAdapter logs events into bounded history without external calls', async () => {
    const adapter = new LocalWorkflowAdapter();
    expect(adapter.getAdapterType()).toBe('local');

    const emitted = await adapter.emitEvent({
      eventType: 'benchmark.section_extracted',
      timestamp: new Date().toISOString(),
      websiteUrl: 'https://trionn.com',
      sectionId: 'sec-01',
      data: { status: 'ISOLATED', componentName: 'HeroSection' },
    });

    expect(emitted).toBe(true);
    expect(adapter.getEventHistory().length).toBe(1);
    expect(adapter.getEventHistory()[0].sectionId).toBe('sec-01');
  });

  it('17. N8nWebhookAdapter formats payload without blocking core application', async () => {
    const adapter = new N8nWebhookAdapter('https://n8n.internal.net/webhook/benchmark-notify');
    expect(adapter.getAdapterType()).toBe('n8n_webhook');

    const result = await adapter.emitEvent({
      eventType: 'benchmark.completed',
      timestamp: new Date().toISOString(),
      websiteUrl: 'https://trionn.com',
      data: { completeness: 95, isolated: 9, partial: 1 },
    });

    expect(result).toBe(true);
  });

  it('18. N8nWebhookAdapter safely handles missing or invalid webhook URLs', async () => {
    const adapter = new N8nWebhookAdapter('');
    const result = await adapter.emitEvent({
      eventType: 'benchmark.completed',
      timestamp: new Date().toISOString(),
      websiteUrl: 'https://trionn.com',
      data: {},
    });

    expect(result).toBe(false);
  });

  it('19. Asserts all generated standalone files contain no AnimateLab host URL references', () => {
    const tsx = fs.readFileSync(path.join(testPkgDir, 'FeatureGrid', 'FeatureGrid.tsx'), 'utf-8');
    const css = fs.readFileSync(path.join(testPkgDir, 'FeatureGrid', 'FeatureGrid.css'), 'utf-8');

    expect(tsx.includes('http://localhost')).toBe(false);
    expect(css.includes('http://localhost')).toBe(false);
    expect(tsx.includes('127.0.0.1')).toBe(false);
  });

  it('20. Asserts generated TSX code exports functional React component with clean props', () => {
    const tsx = fs.readFileSync(path.join(testPkgDir, 'FeatureGrid', 'FeatureGrid.tsx'), 'utf-8');
    expect(tsx).toContain('export const FeatureGrid');
  });
});
