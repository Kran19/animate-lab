import {
  SectionFIR,
  FIRIdentity,
  FIRCaptureContext,
  FIRGeometry,
  FIRDependencies,
  FIRCheckpoints,
  FIRDiagnostics,
} from '../domain/fir/sectionFIR';
import { CURRENT_FIR_SCHEMA_URL, CURRENT_FIR_VERSION } from '../domain/fir/firVersion';
import { FIRValidator } from '../domain/fir/firValidation';
import { DOMEvidenceCollector, RawDOMNodeObservation } from './collectors/domCollector';
import { StyleEvidenceCollector, RawStyleObservation } from './collectors/styleCollector';
import { AssetEvidenceCollector, RawAssetObservation } from './collectors/assetCollector';
import { MotionEvidenceCollector, RawMotionObservation } from './collectors/motionCollector';
import { InteractionEvidenceCollector, RawInteractionObservation } from './collectors/interactionCollector';
import { CanvasEvidenceCollector, RawCanvasObservation } from './collectors/canvasCollector';

export interface RawObservedSectionData {
  sectionId: string;
  websiteId: string;
  pageId: string;
  title: string;
  category: string;
  sourceUrl: string;
  pagePath: string;
  domSelector: string;
  domTagName: string;
  bounds: { x: number; y: number; width: number; height: number; viewportRatio: number; zIndex?: number };
  rawHtml: string;
  rootNode?: RawDOMNodeObservation;
  computedStyles?: Record<string, Record<string, string>>;
  scopedCss?: string;
  cssVariables?: Record<string, string>;
  fontFamilies?: string[];
  mediaQueries?: Array<{ query: string; rules: string }>;
  assets?: RawAssetObservation[];
  animations?: RawMotionObservation['traces'];
  interactions?: RawInteractionObservation['interactions'];
  canvasEvidence?: RawCanvasObservation['canvasEvidence'];
  dependencies?: Array<{ name: string; category: string; version?: string; confidence: number }>;
  checkpoints?: Array<{ name: string; scrollPercent: number; screenshotAssetId: string }>;
  captureContext?: Partial<FIRCaptureContext>;
}

export class FIRAssembler {
  /**
   * Assembles an authoritative, immutable SectionFIR from independent evidence collectors.
   * Performs deduplication, referential integrity checks, and canonical integrity hashing.
   */
  public static assemble(observed: RawObservedSectionData): SectionFIR {
    const now = new Date().toISOString();

    // 1. Identity
    const identity: FIRIdentity = {
      sectionId: observed.sectionId,
      websiteId: observed.websiteId,
      pageId: observed.pageId,
      title: observed.title,
      category: observed.category || 'GeneralSection',
      sourceUrl: observed.sourceUrl,
      pagePath: observed.pagePath || '/',
      domSelector: observed.domSelector,
      domTagName: observed.domTagName || 'SECTION',
      discoveredAt: now,
    };

    // 2. Capture Context
    const capture: FIRCaptureContext = {
      browserEngine: observed.captureContext?.browserEngine || 'Chromium/Playwright',
      userAgent: observed.captureContext?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      viewportWidth: observed.captureContext?.viewportWidth || 1440,
      viewportHeight: observed.captureContext?.viewportHeight || 900,
      devicePixelRatio: observed.captureContext?.devicePixelRatio || 1,
      captureDurationMs: observed.captureContext?.captureDurationMs || 350,
      scrollDepthPx: observed.captureContext?.scrollDepthPx || observed.bounds.y,
    };

    // 3. Geometry
    const geometry: FIRGeometry = {
      x: observed.bounds.x,
      y: observed.bounds.y,
      width: observed.bounds.width,
      height: observed.bounds.height,
      viewportRatio: observed.bounds.viewportRatio || 1.0,
      zIndex: observed.bounds.zIndex || 0,
      layoutMode: 'block',
      isFixedOrSticky: false,
    };

    // 4. Collect DOM Evidence via Isolated Collector
    const dom = DOMEvidenceCollector.collect({
      sectionId: observed.sectionId,
      domSelector: observed.domSelector,
      domTagName: observed.domTagName,
      rawHtml: observed.rawHtml,
      rootNode: observed.rootNode,
    });

    // 5. Collect Style Evidence via Isolated Collector
    const styles = StyleEvidenceCollector.collect({
      scopedCss: observed.scopedCss,
      cssVariables: observed.cssVariables,
      fontFamilies: observed.fontFamilies,
      mediaQueries: observed.mediaQueries,
      computedStyles: observed.computedStyles,
    });

    // 6. Collect Asset Evidence via Isolated Collector
    const assets = AssetEvidenceCollector.collect(observed.assets || []);

    // 7. Collect Motion Evidence via Isolated Collector
    const motion = MotionEvidenceCollector.collect({
      traces: observed.animations,
    });

    // 8. Collect Interaction Evidence via Isolated Collector
    const interactions = InteractionEvidenceCollector.collect({
      interactions: observed.interactions,
    });

    // 9. Collect Canvas Evidence via Isolated Collector
    const canvas = CanvasEvidenceCollector.collect({
      canvasEvidence: observed.canvasEvidence,
    });

    // 10. Dependencies
    const dependencies: FIRDependencies = {
      dependencies: (observed.dependencies || [])
        .map((d) => ({
          name: d.name,
          category: (d.category as any) || 'ui_util',
          version: d.version,
          confidence: d.confidence,
          evidenceSource: 'global_object' as const,
          isLocalizable: true,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };

    // 11. Checkpoints
    const checkpoints: FIRCheckpoints = {
      checkpoints: (observed.checkpoints || [])
        .map((cp) => ({
          checkpointName: (cp.name as any) || 'viewport-0',
          scrollPercent: cp.scrollPercent,
          viewportWidth: 1440,
          viewportHeight: 900,
          screenshotAssetId: cp.screenshotAssetId,
          activeElementSelectors: [],
        }))
        .sort((a, b) => a.scrollPercent - b.scrollPercent),
    };

    // 12. Referential Integrity Check
    const warnings: string[] = [];
    if (dom.rawHtmlSnapshot.includes('src=') && assets.totalAssetsCount === 0) {
      warnings.push('DOM snapshot contains "src=" attributes but zero localized assets were recorded in asset graph.');
    }

    // Diagnostics & Canonical Integrity Hash
    const draftFIR: Omit<SectionFIR, 'diagnostics'> = {
      schema: CURRENT_FIR_SCHEMA_URL,
      firVersion: CURRENT_FIR_VERSION,
      identity,
      capture,
      geometry,
      dom,
      styles,
      assets,
      motion,
      interactions,
      canvas,
      dependencies,
      checkpoints,
    };

    const integrityHash = FIRValidator.computeIntegrityHash(draftFIR);

    const diagnostics: FIRDiagnostics = {
      warnings,
      unsupportedFeatures: [],
      extractionDurationMs: capture.captureDurationMs,
      integrityHash,
    };

    const assembledFIR: SectionFIR = {
      ...draftFIR,
      diagnostics,
    };

    // Strict Validation Guard
    const validation = FIRValidator.validate(assembledFIR);
    if (!validation.isValid) {
      throw new Error(`FIR Assembly failed validation: ${validation.errors.join('; ')}`);
    }

    return assembledFIR;
  }
}
