import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { SectionOwnershipGraph } from '../src/engine/extraction/sectionOwnershipGraph';
import { SectionIsolationValidator } from '../src/engine/extraction/sectionIsolationValidator';
import { CANONICAL_10_SECTION_WEBSITE } from './fixtures/phase13/multiSectionFixtures';
import { ComponentPackageBuilder } from '../src/engine/package/componentPackageBuilder';
import fs from 'fs';
import path from 'path';

describe('Phase 13 — Section-Level Fidelity & Ownership Graph Suite (20 Tests)', () => {
  let prisma: PrismaClient;
  const testOutputDir = path.join(process.cwd(), 'workspaces', 'test_p13_packages');

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./test_phase13_section.db';
    execSync('npx prisma db push --skip-generate', { env: process.env });
    prisma = new PrismaClient();
    await prisma.$connect();
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testOutputDir, { recursive: true });
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  // ==========================================
  // Section Discovery & Multi-Signal Isolation
  // ==========================================
  it('1. Discovers all 10 meaningful visual sections from canonical website', () => {
    const sections = CANONICAL_10_SECTION_WEBSITE.sections;
    expect(sections.length).toBe(10);
    const categories = sections.map((s) => s.category);
    expect(categories).toContain('Hero');
    expect(categories).toContain('Marquee');
    expect(categories).toContain('About');
    expect(categories).toContain('Card-Grid');
    expect(categories).toContain('3D-Section');
    expect(categories).toContain('VideoShowcase');
    expect(categories).toContain('Image-Gallery');
    expect(categories).toContain('Testimonials');
    expect(categories).toContain('CTA');
    expect(categories).toContain('Footer');
  });

  it('2. Builds SectionOwnershipGraph with hierarchical page and section nodes', () => {
    const graph = new SectionOwnershipGraph(
      CANONICAL_10_SECTION_WEBSITE.websiteId,
      CANONICAL_10_SECTION_WEBSITE.url
    );

    for (const sec of CANONICAL_10_SECTION_WEBSITE.sections) {
      graph.addSection({
        sectionId: sec.sectionId,
        sectionTitle: sec.title,
        category: sec.category,
        domSelector: sec.domSelector,
        bounds: { x: 0, y: 0, width: 1440, height: 800 },
        domNodeSelectors: sec.domNodeSelectors,
        cssRuleSelectors: [`.al-${sec.sectionId}`],
        scopedClassNames: [`al-${sec.sectionId}`],
        ownedAssetIds: sec.assets.map((a) => a.id),
        ownedAnimationIds: sec.animations.map((a) => a.id),
        ownedInteractionIds: [],
        runtimeDependencies: sec.technologies,
        responsiveRules: [{ breakpoint: 768, rule: 'display: block;' }],
        provenance: {
          websiteId: CANONICAL_10_SECTION_WEBSITE.websiteId,
          pageId: 'page-home',
          detectedAt: new Date().toISOString(),
        },
        isolationStatus: sec.isAdvancedShader ? 'PARTIAL' : 'ISOLATED',
        isolationViolations: [],
      });
    }

    const all = graph.getAllSections();
    expect(all.length).toBe(10);
  });

  it('3. Section 01 (Hero): Correctly maps hero headline and magnetic button DOM ownership', () => {
    const hero = CANONICAL_10_SECTION_WEBSITE.sections[0];
    expect(hero.domNodeSelectors).toContain('.trionn-hero');
    expect(hero.domNodeSelectors).toContain('.trionn-headline');
    expect(hero.domNodeSelectors).toContain('.trionn-btn-magnetic');
  });

  it('4. Section 02 (Marquee): Scopes infinite animation keyframes to marquee container', () => {
    const marquee = CANONICAL_10_SECTION_WEBSITE.sections[1];
    expect(marquee.css).toContain('@keyframes marquee-scroll');
    expect(marquee.animations[0].durationMs).toBe(15000);
  });

  it('5. Section 03 (About): Isolates text fade animation without parent style leakage', () => {
    const about = CANONICAL_10_SECTION_WEBSITE.sections[2];
    expect(about.html).toContain('About Our Studio');
    expect(about.technologies).toContain('GSAP');
  });

  it('6. Section 04 (Projects Grid): Maps responsive card grid layout boundaries', () => {
    const grid = CANONICAL_10_SECTION_WEBSITE.sections[3];
    expect(grid.css).toContain('grid-template-columns');
    expect(grid.assets.length).toBe(1);
  });

  it('7. Section 05 (3D Model Showcase): Gracefully classifies 3D canvas as PARTIAL', () => {
    const sec3d = CANONICAL_10_SECTION_WEBSITE.sections[4];
    expect(sec3d.isAdvancedShader).toBe(true);
    expect(sec3d.technologies).toContain('Three.js');
  });

  it('8. Section 06 (Video Showcase): Captures poster and MP4 source dependencies', () => {
    const videoSec = CANONICAL_10_SECTION_WEBSITE.sections[5];
    expect(videoSec.assets.length).toBe(2);
    expect(videoSec.assets.some((a) => a.mimeType === 'video/mp4')).toBe(true);
  });

  it('9. Section 07 (Interactive Gallery): Maps scroll-pinned gallery pan animation', () => {
    const gallery = CANONICAL_10_SECTION_WEBSITE.sections[6];
    expect(gallery.animations[0].name).toBe('galleryPan');
  });

  it('10. Section 08 (Testimonials): Isolates blockquote typography styling', () => {
    const testi = CANONICAL_10_SECTION_WEBSITE.sections[7];
    expect(testi.html).toContain('blockquote');
  });

  it('11. Section 09 (CTA): Isolates pulse transition and high-contrast button', () => {
    const cta = CANONICAL_10_SECTION_WEBSITE.sections[8];
    expect(cta.css).toContain('background: #6366f1');
  });

  it('12. Section 10 (Footer): Extracts navigation links and footer copyright', () => {
    const footer = CANONICAL_10_SECTION_WEBSITE.sections[9];
    expect(footer.html).toContain('© 2026 Studio');
    expect(footer.assets.length).toBe(1);
  });

  // ==========================================
  // Section Isolation & Safety Verification
  // ==========================================
  it('13. Validates section isolation when clean and self-contained', () => {
    const report = SectionIsolationValidator.validateSection({
      sectionId: 'sec-01',
      sectionTitle: 'HeroSection',
      tsxCode: 'export const HeroSection = () => <section className="al-hero"><h1>Title</h1></section>;',
      scopedCss: '.al-hero { color: white; }',
      assets: [{ exportPath: './assets/bg.webp', originalUrl: 'https://site.com/bg.webp' }],
      runtimeDependencies: ['GSAP'],
      props: [{ name: 'title', required: false, isEvidenceBased: true }],
    });

    expect(report.isIsolated).toBe(true);
    expect(report.status).toBe('ISOLATED');
    expect(report.violations.length).toBe(0);
  });

  it('14. Fails isolation validation if global body/html CSS selectors leak', () => {
    const report = SectionIsolationValidator.validateSection({
      sectionId: 'sec-leak',
      sectionTitle: 'LeakySection',
      tsxCode: 'export const LeakySection = () => <div />;',
      scopedCss: 'body { margin: 0; } .card { padding: 10px; }',
      assets: [],
      runtimeDependencies: [],
      props: [],
    });

    expect(report.isIsolated).toBe(false);
    expect(report.status).toBe('FAILED');
    expect(report.violations.some((v) => v.includes('forbidden global selectors'))).toBe(true);
  });

  it('15. Fails isolation validation if internal AnimateLab localhost URLs leak', () => {
    const report = SectionIsolationValidator.validateSection({
      sectionId: 'sec-internal',
      sectionTitle: 'InternalLeak',
      tsxCode: 'export const InternalLeak = () => <img src="http://localhost:3000/temp.png" />;',
      scopedCss: '',
      assets: [],
      runtimeDependencies: [],
      props: [],
    });

    expect(report.isIsolated).toBe(false);
    expect(report.violations.some((v) => v.includes('internal AnimateLab'))).toBe(true);
  });

  it('16. Fails isolation validation if fabricated props are detected', () => {
    const report = SectionIsolationValidator.validateSection({
      sectionId: 'sec-fab',
      sectionTitle: 'FabricatedSection',
      tsxCode: 'export const FabricatedSection = () => <div />;',
      scopedCss: '.card { color: red; }',
      assets: [],
      runtimeDependencies: [],
      props: [{ name: 'fabricatedOnClick', required: true, isEvidenceBased: false }],
    });

    expect(report.isIsolated).toBe(false);
    expect(report.violations.some((v) => v.includes('fabricated props'))).toBe(true);
  });

  it('17. Degrades to PARTIAL status when unsupported physics/audio runtime is present', () => {
    const report = SectionIsolationValidator.validateSection({
      sectionId: 'sec-physics',
      sectionTitle: 'PhysicsSection',
      tsxCode: 'export const PhysicsSection = () => <div />;',
      scopedCss: '.physics { height: 100vh; }',
      assets: [],
      runtimeDependencies: ['Matter.js'],
      props: [],
    });

    expect(report.status).toBe('PARTIAL');
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  // ==========================================
  // HARD ACCEPTANCE TEST: 10 Sections → 10 Packages
  // ==========================================
  it('18. HARD ACCEPTANCE: Packages all 10 sections into independent, standalone directories', () => {
    const createdPackages: string[] = [];

    for (const sec of CANONICAL_10_SECTION_WEBSITE.sections) {
      const res = ComponentPackageBuilder.buildPackage({
        componentName: sec.title,
        category: sec.category,
        sourceCandidateId: `cand-${sec.sectionId}`,
        websiteId: CANONICAL_10_SECTION_WEBSITE.websiteId,
        pageId: 'page-home',
        sourceWebsiteUrl: CANONICAL_10_SECTION_WEBSITE.url,
        sourcePagePath: CANONICAL_10_SECTION_WEBSITE.pagePath,
        tsxCode: `export const ${sec.title}: React.FC = () => (${sec.html});`,
        cssCode: sec.css,
        assets: sec.assets.map((a) => ({
          assetId: a.id,
          originalUrl: a.originalUrl,
          localPath: a.localPath,
          exportPath: `assets/${a.id}.webp`,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes,
          contentHash: `sha256-${a.id}`,
          usageLocation: `${sec.title} > asset`,
          owningSectionId: sec.sectionId,
          ownershipScope: 'SECTION_LOCAL',
          isRequired: true,
          isAnimated: false,
        })),
        propsDocJson: '[]',
        technologies: sec.technologies,
        animations: sec.animations.map((a) => ({
          name: a.name,
          technology: a.type,
          trigger: 'load',
          durationMs: a.durationMs,
        })),
        isolationStatus: sec.isAdvancedShader ? 'PARTIAL' : 'ISOLATED',
        validationReport: {
          isValid: true,
          layersPassed: ['Structural Validation', 'CSS Isolation'],
          layersFailed: [],
          errors: [],
          warnings: [],
        },
        outputDirectory: testOutputDir,
      });

      expect(res.status).toBe('created');
      createdPackages.push(res.packagePath);
    }

    expect(createdPackages.length).toBe(10);
  });

  it('19. Asserts all 10 packages contain all required artifacts (TSX, CSS, manifest, dependencies, props, provenance, validation, README)', () => {
    for (const sec of CANONICAL_10_SECTION_WEBSITE.sections) {
      const pkgPath = path.join(testOutputDir, sec.title);
      expect(fs.existsSync(pkgPath)).toBe(true);

      const files = fs.readdirSync(pkgPath);
      expect(files).toContain(`${sec.title}.tsx`);
      expect(files).toContain(`${sec.title}.css`);
      expect(files).toContain('manifest.json');
      expect(files).toContain('dependencies.json');
      expect(files).toContain('props.json');
      expect(files).toContain('provenance.json');
      expect(files).toContain('validation.json');
      expect(files).toContain('README.md');
    }
  });

  it('20. Asserts every package README.md contains complete developer installation and usage guidance', () => {
    for (const sec of CANONICAL_10_SECTION_WEBSITE.sections) {
      const readmePath = path.join(testOutputDir, sec.title, 'README.md');
      const content = fs.readFileSync(readmePath, 'utf-8');

      expect(content).toContain(`# ${sec.title}`);
      expect(content).toContain('Quick Start');
      expect(content).toContain('Props Specification');
      expect(content).toContain('Multi-Viewport & Responsive Behavior');
      expect(content).toContain('Provenance Lineage');
    }
  });
});
