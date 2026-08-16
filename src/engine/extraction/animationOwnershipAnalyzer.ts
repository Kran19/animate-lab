export interface SectionAnimationDef {
  animationId: string;
  name: string;
  technology: 'GSAP' | 'ScrollTrigger' | 'CSS_KEYFRAMES' | 'CSS_TRANSITION' | 'WAAPI' | 'LOTTIE' | 'SVG' | 'THREE_JS' | 'WEBGL_SHADER' | 'CUSTOM_RAF';
  ownerSectionId: string;
  targetSelector: string;
  trigger: 'scroll' | 'hover' | 'load' | 'click' | 'pointermove' | 'drag' | 'continuous' | 'manual';
  durationMs: number;
  easing?: string;
  scrollTriggerParams?: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
    pin?: boolean;
  };
  dependencies: string[];
  status: 'SUPPORTED' | 'PARTIAL' | 'UNSUPPORTED';
  notes?: string;
}

export class AnimationOwnershipAnalyzer {
  /**
   * Maps page animations to owning sections based on DOM target selectors and bounding boxes.
   */
  public static mapAnimationsToSections(
    animations: Array<{
      id: string;
      name: string;
      type: string;
      affectedElements: string;
      durationMs?: number;
      easing?: string;
      trigger?: string;
    }>,
    sections: Array<{
      sectionId: string;
      domSelector: string;
      domNodeSelectors: string[];
    }>
  ): SectionAnimationDef[] {
    const mapped: SectionAnimationDef[] = [];

    for (const anim of animations) {
      // Find owning section whose selectors match the affected element
      let ownerSection = sections.find((sec) =>
        sec.domNodeSelectors.some((sel) => anim.affectedElements.includes(sel)) ||
        anim.affectedElements.includes(sec.domSelector)
      );

      // Fallback: assign to first section if unmatched but present
      if (!ownerSection && sections.length > 0) {
        ownerSection = sections[0];
      }

      const ownerSectionId = ownerSection ? ownerSection.sectionId : 'global';
      const tech = this.normalizeAnimationTechnology(anim.type);
      const isAdvanced = tech === 'THREE_JS' || tech === 'WEBGL_SHADER' || anim.type.includes('Physics');

      mapped.push({
        animationId: anim.id,
        name: anim.name,
        technology: tech,
        ownerSectionId,
        targetSelector: anim.affectedElements,
        trigger: (anim.trigger as any) || (anim.type.includes('Scroll') ? 'scroll' : 'load'),
        durationMs: anim.durationMs || 800,
        easing: anim.easing || 'ease',
        dependencies: this.inferDependenciesForTech(tech),
        status: isAdvanced ? 'PARTIAL' : 'SUPPORTED',
        notes: isAdvanced ? 'Advanced rendering runtime requires partial degradation.' : undefined,
      });
    }

    return mapped;
  }

  private static normalizeAnimationTechnology(rawType: string): SectionAnimationDef['technology'] {
    const lower = rawType.toLowerCase();
    if (lower.includes('scrolltrigger')) return 'ScrollTrigger';
    if (lower.includes('gsap')) return 'GSAP';
    if (lower.includes('keyframe')) return 'CSS_KEYFRAMES';
    if (lower.includes('transition')) return 'CSS_TRANSITION';
    if (lower.includes('lottie')) return 'LOTTIE';
    if (lower.includes('svg')) return 'SVG';
    if (lower.includes('three') || lower.includes('3d')) return 'THREE_JS';
    if (lower.includes('shader') || lower.includes('webgl')) return 'WEBGL_SHADER';
    if (lower.includes('waapi')) return 'WAAPI';
    return 'CSS_KEYFRAMES';
  }

  private static inferDependenciesForTech(tech: SectionAnimationDef['technology']): string[] {
    switch (tech) {
      case 'GSAP':
        return ['gsap'];
      case 'ScrollTrigger':
        return ['gsap', 'gsap/ScrollTrigger'];
      case 'LOTTIE':
        return ['lottie-web'];
      case 'THREE_JS':
        return ['three', '@types/three'];
      default:
        return [];
    }
  }
}
