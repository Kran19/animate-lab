import { SectionFIR } from '../../domain/fir/sectionFIR';
import {
  SynthesisPlan,
  PlannedAssetImport,
  PlannedMotionHook,
  PlannedInteractionHook,
  DOMSynthesisStrategy,
  CSSSynthesisStrategy,
  MotionSynthesisStrategy,
  InteractionSynthesisStrategy,
  CanvasSynthesisStrategy,
  DependencySynthesisStrategy,
} from './synthesisPlan';
import { CapabilityResolver } from './capabilityResolver';

export class PlanBuilder {
  /**
   * Builds an explicit SynthesisPlan from a validated SectionFIR.
   */
  public static buildPlan(fir: SectionFIR, preferredComponentName?: string): SynthesisPlan {
    const resolution = CapabilityResolver.resolve(fir);
    const componentName = preferredComponentName || this.sanitizeComponentName(fir.identity.title);

    // 1. Asset Imports Planning
    const assetImports: PlannedAssetImport[] = [];
    if (fir.assets && Array.isArray(fir.assets.assets)) {
      fir.assets.assets.forEach((asset, idx) => {
        const cleanName = `asset_${asset.type}_${idx}`;
        const relativePath = `./assets/${asset.exportPath.replace(/^assets\//, '')}`;
        assetImports.push({
          assetId: asset.assetId,
          variableName: cleanName,
          relativePath,
          isInlineSvg: asset.discoveredBy === 'svg_inline',
        });
      });
    }

    // 2. Motion Strategy Planning
    let motionStrategy: MotionSynthesisStrategy = 'NONE';
    const motionPlan: PlannedMotionHook = {
      hookName: 'none',
      librariesRequired: [],
      timelineCount: 0,
      hasScrollTrigger: false,
    };

    if (resolution.hasRecordedGSAP) {
      motionStrategy = 'GSAP_USE_HOOK';
      motionPlan.hookName = 'useGSAP';
      motionPlan.librariesRequired = ['gsap', '@gsap/react'];
      motionPlan.timelineCount = fir.motion.traces.filter((t) => t.kind === 'gsap_timeline').length;
      motionPlan.hasScrollTrigger = fir.motion.traces.some((t) => t.kind === 'scroll_trigger');
    } else if (resolution.hasCSSKeyframes) {
      motionStrategy = 'CSS_KEYFRAMES';
      motionPlan.hookName = 'none';
    }

    // 3. Interaction Strategy Planning
    let interactionStrategy: InteractionSynthesisStrategy = 'PASSIVE';
    const interactionPlan: PlannedInteractionHook = {
      hookName: 'none',
      stateVariables: [],
      eventListeners: [],
    };

    if (resolution.hasInteractions) {
      interactionStrategy = 'STATEFUL_HOOK';
      interactionPlan.hookName = 'useState';
      fir.interactions.interactions.forEach((inter, idx) => {
        const handlerName = `handle_${inter.triggerType}_${idx}`;
        interactionPlan.stateVariables.push(`is_${inter.triggerType}_active_${idx}`);
        interactionPlan.eventListeners.push({
          targetSelector: inter.targetSelector,
          eventType: inter.triggerType,
          handlerName,
        });
      });
    }

    // 4. Canvas Strategy Planning
    let canvasStrategy: CanvasSynthesisStrategy = 'NONE';
    if (resolution.hasCanvasOrWebGL) {
      canvasStrategy = 'STATIC_IMAGE_FALLBACK';
    }

    // 5. External Dependencies
    const declaredNpmDependencies: Record<string, string> = {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
    };
    if (resolution.hasRecordedGSAP) {
      declaredNpmDependencies['gsap'] = '^3.12.5';
      declaredNpmDependencies['@gsap/react'] = '^2.1.1';
    }

    return {
      planId: `plan-${fir.identity.sectionId}`,
      sectionId: fir.identity.sectionId,
      componentName,
      capabilityTier: resolution.tier,
      reconstructabilityScore: resolution.reconstructabilityScore,
      domStrategy: 'JSX_CLEAN',
      cssStrategy: 'CSS_MODULE',
      motionStrategy,
      interactionStrategy,
      canvasStrategy,
      dependencyStrategy: 'BUNDLE_LOCAL',
      assetImports,
      motionPlan,
      interactionPlan,
      declaredNpmDependencies,
      knownLimitations: resolution.knownLimitations,
      createdAt: new Date().toISOString(),
    };
  }

  private static sanitizeComponentName(rawTitle: string): string {
    const cleaned = rawTitle.replace(/[^a-zA-Z0-9]/g, ' ').trim();
    if (!cleaned) return 'SectionComponent';
    return cleaned
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}
