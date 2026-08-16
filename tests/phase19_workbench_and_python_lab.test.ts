import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  PythonMotionBridge,
  FrameCaptureEngine,
  StorytellingEngine,
} from '../src/engine/motionLab';
import {
  LibraryIndexer,
  SectionReporter,
  BatchLabRunner,
} from '../src/engine/workbench';
import { FIRAssembler } from '../src/engine/extraction/firAssembler';

describe('Phase 19 — Python Motion Intelligence & Automated Extraction Workbench', () => {
  const testWorkspaceDir = path.join(process.cwd(), 'workspaces', 'test_phase19_workbench');

  beforeEach(() => {
    if (fs.existsSync(testWorkspaceDir)) {
      fs.rmSync(testWorkspaceDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testWorkspaceDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testWorkspaceDir)) {
      fs.rmSync(testWorkspaceDir, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // 1. Python Motion Bridge & Easing Curve Fitting
  // -------------------------------------------------------------------------
  describe('1. Python Motion Bridge & Easing Curve Fitting', () => {
    it('1. Fits linear motion sequence with minimal MSE error', () => {
      const samples: [number, number][] = [
        [0.0, 0.0],
        [0.25, 0.25],
        [0.5, 0.5],
        [0.75, 0.75],
        [1.0, 1.0],
      ];
      const res = PythonMotionBridge.fitEasing(samples);

      expect(res.bestFit).toBe('linear');
      expect(res.mse).toBeLessThan(0.001);
      expect(res.confidence).toBeGreaterThan(0.98);
      expect(res.isReconstructed).toBe(true);
    });

    it('2. Fits power3.out ease curve with high confidence', () => {
      // Power3.out: 1 - (1 - t)^4
      const samples: [number, number][] = Array.from({ length: 11 }, (_, i) => {
        const t = i / 10.0;
        return [t, 1.0 - Math.pow(1.0 - t, 4)];
      });
      const res = PythonMotionBridge.fitEasing(samples);

      expect(res.bestFit).toBe('power3.out');
      expect(res.mse).toBeLessThan(0.01);
      expect(res.confidence).toBeGreaterThan(0.95);
    });

    it('3. Compares frame pixel arrays and computes perceptual similarity score', () => {
      const source = Array.from({ length: 100 }, () => [255, 255, 255]);
      const candidate = Array.from({ length: 100 }, () => [255, 255, 255]);

      const res = PythonMotionBridge.compareFrames(source, candidate, 10, 10);
      expect(res.similarityScore).toBe(1.0);
      expect(res.diffPixelCount).toBe(0);
      expect(res.isVisualMatch).toBe(true);
    });

    it('4. Detects error bounding box when frames diverge', () => {
      const source = Array.from({ length: 100 }, () => [255, 255, 255]);
      const candidate = Array.from({ length: 100 }, (_, idx) => (idx === 45 ? [0, 0, 0] : [255, 255, 255]));

      const res = PythonMotionBridge.compareFrames(source, candidate, 10, 10);
      expect(res.diffPixelCount).toBe(1);
      expect(res.largestErrorRegion).not.toBeNull();
      expect(res.largestErrorRegion?.x).toBe(5);
      expect(res.largestErrorRegion?.y).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Deep Storytelling Narrative Engine
  // -------------------------------------------------------------------------
  describe('2. Deep Storytelling Narrative Engine', () => {
    it('5. Builds narrative graph connecting sections into a storytelling journey', () => {
      const sections = [
        { sectionId: 'sec-hero', category: 'HERO', title: 'Vision Hero', hasMotion: true },
        { sectionId: 'sec-story', category: 'STORY', title: 'Philosophy', hasScrollTrigger: true, hasPin: true },
        { sectionId: 'sec-grid', category: 'CARD_GRID', title: 'Services' },
        { sectionId: 'sec-cta', category: 'CTA', title: 'Get In Touch' },
      ];

      const graph = StorytellingEngine.buildGraph(sections);
      expect(graph.totalSectionsInStory).toBe(4);
      expect(graph.narrativeNodes[0].narrativeRole).toContain('Primary Hook');
      expect(graph.narrativeNodes[1].entryBehavior).toContain('ScrollTrigger Pin');
      expect(graph.narrativeNodes[1].previousSectionId).toBe('sec-hero');
      expect(graph.narrativeNodes[1].nextSectionId).toBe('sec-grid');
      expect(graph.narrativeNodes[3].exitBehavior).toBe('Terminal Page Boundary');
    });
  });

  // -------------------------------------------------------------------------
  // 3. Frame Sequence Capture Engine
  // -------------------------------------------------------------------------
  describe('3. Frame Sequence Capture Engine', () => {
    it('6. Creates timestamped frame capture session and writes sequence manifest', () => {
      const manifest = FrameCaptureEngine.createCaptureSession(
        testWorkspaceDir,
        'cap-test-01',
        'https://example.com',
        'sec-01',
        15,
        60
      );

      expect(manifest.totalFrames).toBe(15);
      expect(manifest.fps).toBe(60);
      expect(manifest.frames.length).toBe(15);
      expect(fs.existsSync(path.join(manifest.storagePath, 'sequence.json'))).toBe(true);
      expect(fs.existsSync(path.join(manifest.storagePath, 'frame_000001.png'))).toBe(true);
      expect(fs.existsSync(path.join(manifest.storagePath, 'frame_000015.png'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Deep Section Reporter
  // -------------------------------------------------------------------------
  describe('4. Deep Section Reporter', () => {
    it('7. Generates comprehensive 6-pillar deep section report', () => {
      const fir = FIRAssembler.assemble({
        sectionId: 'sec-deep-report',
        websiteId: 'web-deep',
        pageId: 'page-deep',
        title: 'Deep Inspected Section',
        category: 'Hero',
        sourceUrl: 'https://example.com',
        pagePath: '/',
        domSelector: '#deep-sec',
        domTagName: 'SECTION',
        bounds: { x: 0, y: 0, width: 1440, height: 900, viewportRatio: 1 },
        rawHtml: '<section id="deep-sec"><h1>Heading 1</h1><h2>Subtitle</h2><svg></svg></section>',
        assets: [
          { id: 'a-1', type: 'image', sourceUrl: 'https://example.com/img.png', localPath: 'img.png' },
          { id: 'a-2', type: 'font', sourceUrl: 'https://example.com/font.woff2', localPath: 'font.woff2' },
        ],
      });

      const report = SectionReporter.generateReport(fir);
      expect(report.identity.sectionId).toBe('sec-deep-report');
      expect(report.typography.headingsCount).toBe(2);
      expect(report.assets.imagesCount).toBe(1);
      expect(report.assets.fontsCount).toBe(1);
      expect(report.responsive.testedViewportsCount).toBe(4);
      expect(report.synthesis.disposition).toBe('CERTIFIED');
    });
  });

  // -------------------------------------------------------------------------
  // 5. Component Library Indexer
  // -------------------------------------------------------------------------
  describe('5. Component Library Indexer', () => {
    it('8. Indexes components into searchable catalog and retrieves queries', () => {
      const entry = {
        componentId: 'trionn_hero_01',
        componentName: 'TrionnHero',
        sourceUrl: 'https://trionn.com',
        websiteDomain: 'trionn_com',
        category: 'Hero',
        technologies: ['gsap', '@gsap/react'],
        animationType: 'GSAP_USE_HOOK',
        scrollDependency: 'NONE',
        isResponsive: true,
        reconstructabilityScore: 0.96,
        visualSimilarityScore: 0.97,
        behavioralFidelityScore: 0.95,
        disposition: 'COPY_USE_CERTIFIED' as const,
        packagePath: path.join(testWorkspaceDir, 'TrionnHero'),
        indexedAt: new Date().toISOString(),
      };

      const catalog = LibraryIndexer.indexComponent(entry, testWorkspaceDir);
      expect(catalog.totalComponents).toBe(1);
      expect(catalog.certifiedCount).toBe(1);

      // Query by Category
      const heroMatches = LibraryIndexer.searchCatalog({ category: 'Hero' }, testWorkspaceDir);
      expect(heroMatches.length).toBe(1);
      expect(heroMatches[0].componentName).toBe('TrionnHero');

      // Query by Tech
      const gsapMatches = LibraryIndexer.searchCatalog({ tech: 'gsap' }, testWorkspaceDir);
      expect(gsapMatches.length).toBe(1);

      // Query non-matching
      const emptyMatches = LibraryIndexer.searchCatalog({ category: 'Footer' }, testWorkspaceDir);
      expect(emptyMatches.length).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Automated Batch Website Laboratory
  // -------------------------------------------------------------------------
  describe('6. Automated Batch Website Laboratory', () => {
    it('9. Executes multi-website batch job and generates complete directory structure', () => {
      const batchJobs = [
        {
          url: 'https://site-alpha.com',
          observedSections: [
            {
              sectionId: 'alpha-sec-1',
              websiteId: 'web-alpha',
              pageId: 'page-alpha',
              title: 'Alpha Hero',
              category: 'Hero',
              sourceUrl: 'https://site-alpha.com',
              pagePath: '/',
              domSelector: '#alpha-hero',
              domTagName: 'SECTION',
              bounds: { x: 0, y: 0, width: 1440, height: 800, viewportRatio: 1 },
              rawHtml: '<section id="alpha-hero"><h1>Alpha Title</h1></section>',
            },
            {
              sectionId: 'alpha-sec-2',
              websiteId: 'web-alpha',
              pageId: 'page-alpha',
              title: 'Alpha Story',
              category: 'Story',
              sourceUrl: 'https://site-alpha.com',
              pagePath: '/',
              domSelector: '#alpha-story',
              domTagName: 'SECTION',
              bounds: { x: 0, y: 800, width: 1440, height: 800, viewportRatio: 1 },
              rawHtml: '<section id="alpha-story"><p>Our Story</p></section>',
            },
          ],
        },
        {
          url: 'https://site-beta.com',
          observedSections: [
            {
              sectionId: 'beta-sec-1',
              websiteId: 'web-beta',
              pageId: 'page-beta',
              title: 'Beta Grid',
              category: 'Card_Grid',
              sourceUrl: 'https://site-beta.com',
              pagePath: '/',
              domSelector: '#beta-grid',
              domTagName: 'SECTION',
              bounds: { x: 0, y: 0, width: 1440, height: 900, viewportRatio: 1 },
              rawHtml: '<section id="beta-grid"><div>Card 1</div></section>',
            },
          ],
        },
      ];

      const batchResult = BatchLabRunner.runBatch(batchJobs, testWorkspaceDir);

      expect(batchResult.totalWebsites).toBe(2);
      expect(batchResult.successfulWebsites).toBe(2);
      expect(batchResult.totalSectionsExtracted).toBe(3);
      expect(batchResult.totalComponentsIndexed).toBe(3);
      expect(batchResult.websiteSummaries[0].status).toBe('SUCCESS');
      expect(batchResult.websiteSummaries[1].status).toBe('SUCCESS');

      // Verify site directory structure
      const alphaDir = batchResult.websiteSummaries[0].siteDir;
      expect(fs.existsSync(path.join(alphaDir, 'manifest.json'))).toBe(true);
      expect(fs.existsSync(path.join(alphaDir, 'analysis', 'storytelling_graph.json'))).toBe(true);
      expect(fs.existsSync(path.join(alphaDir, 'reports', 'section-reports.json'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Antigravity Briefing & Automation Scripts
  // -------------------------------------------------------------------------
  describe('7. Antigravity Briefing & Automation Scripts', () => {
    it('10. Confirms presence and validity of ANTIGRAVITY_BRIEFING.md', () => {
      const briefingPath = path.join(process.cwd(), 'docs', 'ANTIGRAVITY_BRIEFING.md');
      expect(fs.existsSync(briefingPath)).toBe(true);

      const content = fs.readFileSync(briefingPath, 'utf-8');
      expect(content).toContain('Forensic Intermediate Representation');
      expect(content).toContain('OBSERVATION_FAILURE');
      expect(content).toContain('Never bypass FIR');
    });

    it('11. Confirms presence of cross-platform automation scripts in scripts/', () => {
      const scriptsDir = path.join(process.cwd(), 'scripts');
      const requiredScripts = [
        'doctor.bat',
        'doctor.sh',
        'setup.bat',
        'setup.sh',
        'benchmark.bat',
        'benchmark.sh',
        'verify.bat',
        'verify.sh',
        'clean.bat',
        'clean.sh',
      ];

      requiredScripts.forEach((s) => {
        expect(fs.existsSync(path.join(scriptsDir, s))).toBe(true);
      });
    });
  });
});
