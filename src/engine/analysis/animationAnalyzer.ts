export interface DiscoveredAnimation {
  name: string;
  type: 'css_animation' | 'css_transition' | 'waapi' | 'gsap' | 'scroll_driven' | 'interaction' | 'continuous' | 'other';
  library: string;
  affectedElements: string[];
  durationMs: number;
  delayMs: number;
  easing: string;
  trigger: 'scroll' | 'hover' | 'click' | 'pointer' | 'focus' | 'load' | 'continuous' | 'unknown';
  animatedProperties: string[];
  codeSnippet?: string;
  evidence: {
    runtimeEvidence: string;
    domEvidence: string;
    scriptEvidence: string;
    networkEvidence?: string;
    confidence: number;
  };
}

export interface AnimationAnalysisInput {
  cssRules: Array<{
    selector: string;
    animationName?: string;
    animationDuration?: string;
    animationDelay?: string;
    animationIterationCount?: string;
    animationDirection?: string;
    animationTimingFunction?: string;
    transitionProperty?: string;
    transitionDuration?: string;
    transitionDelay?: string;
    transitionTimingFunction?: string;
  }>;
  waapiAnimations?: Array<{
    targetSelector: string;
    animationName?: string;
    durationMs: number;
    delayMs: number;
    easing: string;
    playState: string;
    keyframesJson?: string;
  }>;
  gsapState?: {
    isLoaded: boolean;
    isActive: boolean;
    tweens?: Array<{
      targetSelector: string;
      durationMs: number;
      delayMs: number;
      easing: string;
      varsJson?: string;
      progress?: number;
    }>;
    scrollTriggers?: Array<{
      triggerSelector: string;
      targetSelector: string;
      startBound?: string;
      endBound?: string;
      scrub?: boolean | number;
    }>;
  };
  observedMutations?: Array<{
    selector: string;
    propertyName: string;
    oldValue: string;
    newValue: string;
    timestamp: number;
    triggerHint?: string;
  }>;
  interactionsObserved?: Array<{
    type: 'hover' | 'click' | 'pointer' | 'focus' | 'drag' | 'keyboard';
    selector: string;
    propertiesChanged: string[];
  }>;
  continuousLoopsObserved?: Array<{
    targetSelector: string;
    fpsEstimate?: number;
    hasTimeUniform?: boolean;
  }>;
}

export class AnimationAnalyzer {
  public analyzeAnimations(input: AnimationAnalysisInput): DiscoveredAnimation[] {
    const results: DiscoveredAnimation[] = [];

    // 1. CSS Animations
    if (input.cssRules) {
      for (const rule of input.cssRules) {
        if (rule.animationName && rule.animationName !== 'none') {
          const durationMs = this.parseDurationMs(rule.animationDuration);
          const delayMs = this.parseDurationMs(rule.animationDelay);
          const easing = rule.animationTimingFunction || 'ease';
          const trigger = rule.animationName.toLowerCase().includes('scroll') ? 'scroll' : 'load';

          results.push({
            name: `CSS @keyframes: ${rule.animationName}`,
            type: 'css_animation',
            library: 'CSS Animations',
            affectedElements: [rule.selector],
            durationMs,
            delayMs,
            easing,
            trigger,
            animatedProperties: ['transform', 'opacity'],
            codeSnippet: `animation: ${rule.animationName} ${rule.animationDuration || '1s'} ${easing};`,
            evidence: {
              runtimeEvidence: `Keyframe rule detected for selector ${rule.selector}`,
              domEvidence: `Target element selector: ${rule.selector}`,
              scriptEvidence: `@keyframes ${rule.animationName} stylesheet definition`,
              confidence: 0.85,
            },
          });
        }

        // 2. CSS Transitions
        if (rule.transitionProperty && rule.transitionProperty !== 'none' && rule.transitionDuration && rule.transitionDuration !== '0s') {
          const durationMs = this.parseDurationMs(rule.transitionDuration);
          const delayMs = this.parseDurationMs(rule.transitionDelay);
          const easing = rule.transitionTimingFunction || 'ease';
          const props = rule.transitionProperty.split(',').map((p) => p.trim());

          results.push({
            name: `CSS Transition: ${rule.transitionProperty}`,
            type: 'css_transition',
            library: 'CSS Transitions',
            affectedElements: [rule.selector],
            durationMs,
            delayMs,
            easing,
            trigger: rule.selector.includes(':hover') ? 'hover' : 'hover',
            animatedProperties: props,
            codeSnippet: `transition: ${rule.transitionProperty} ${rule.transitionDuration} ${easing};`,
            evidence: {
              runtimeEvidence: `Transition declaration on ${rule.selector}`,
              domEvidence: `Target selector: ${rule.selector}`,
              scriptEvidence: `CSS rule declaration`,
              confidence: 0.75,
            },
          });
        }
      }
    }

    // 3. Web Animations API (WAAPI)
    if (input.waapiAnimations) {
      for (const waapi of input.waapiAnimations) {
        results.push({
          name: `WAAPI: ${waapi.animationName || 'Element.animate'}`,
          type: 'waapi',
          library: 'Web Animations API',
          affectedElements: [waapi.targetSelector],
          durationMs: waapi.durationMs || 1000,
          delayMs: waapi.delayMs || 0,
          easing: waapi.easing || 'linear',
          trigger: 'load',
          animatedProperties: ['transform', 'opacity'],
          codeSnippet: waapi.keyframesJson ? `element.animate(${waapi.keyframesJson})` : `element.animate(...)`,
          evidence: {
            runtimeEvidence: `Active WAAPI Animation object with playState=${waapi.playState}`,
            domEvidence: `Target element: ${waapi.targetSelector}`,
            scriptEvidence: `document.getAnimations() runtime call`,
            confidence: 0.9,
          },
        });
      }
    }

    // 4. GSAP & ScrollTrigger
    if (input.gsapState?.isLoaded) {
      if (input.gsapState.tweens && input.gsapState.tweens.length > 0) {
        for (const tween of input.gsapState.tweens) {
          const isScroll = input.gsapState.scrollTriggers?.some((st) => st.targetSelector === tween.targetSelector);
          results.push({
            name: `GSAP Tween -> ${tween.targetSelector}`,
            type: isScroll ? 'scroll_driven' : 'gsap',
            library: isScroll ? 'GSAP ScrollTrigger' : 'GSAP',
            affectedElements: [tween.targetSelector],
            durationMs: tween.durationMs || 1000,
            delayMs: tween.delayMs || 0,
            easing: tween.easing || 'power1.out',
            trigger: isScroll ? 'scroll' : 'load',
            animatedProperties: ['transform', 'opacity'],
            codeSnippet: tween.varsJson ? `gsap.to("${tween.targetSelector}", ${tween.varsJson})` : `gsap.to("${tween.targetSelector}", {...})`,
            evidence: {
              runtimeEvidence: `GSAP timeline/tween active instance observed for ${tween.targetSelector}`,
              domEvidence: `Target element: ${tween.targetSelector}`,
              scriptEvidence: `gsap.globalTimeline inspection`,
              confidence: 0.95,
            },
          });
        }
      } else if (input.gsapState.isActive) {
        results.push({
          name: `GSAP Active Animation`,
          type: 'gsap',
          library: 'GSAP',
          affectedElements: ['body'],
          durationMs: 1000,
          delayMs: 0,
          easing: 'power1.out',
          trigger: 'load',
          animatedProperties: ['transform'],
          evidence: {
            runtimeEvidence: `window.gsap exists and is actively running tweens`,
            domEvidence: `DOM elements targeted by GSAP`,
            scriptEvidence: `window.gsap runtime object`,
            confidence: 0.8,
          },
        });
      }
    }

    // 5. Interaction-driven Animations
    if (input.interactionsObserved) {
      for (const inter of input.interactionsObserved) {
        results.push({
          name: `Interaction (${inter.type}) -> ${inter.selector}`,
          type: 'interaction',
          library: 'DOM Interaction',
          affectedElements: [inter.selector],
          durationMs: 300,
          delayMs: 0,
          easing: 'ease-out',
          trigger: inter.type as any,
          animatedProperties: inter.propertiesChanged,
          evidence: {
            runtimeEvidence: `Observed ${inter.type} event triggering property mutations: ${inter.propertiesChanged.join(', ')}`,
            domEvidence: `Target element: ${inter.selector}`,
            scriptEvidence: `EventListener observation`,
            confidence: 0.85,
          },
        });
      }
    }

    // 6. Continuous Animations (rAF / Canvas / Shaders)
    if (input.continuousLoopsObserved) {
      for (const loop of input.continuousLoopsObserved) {
        results.push({
          name: `Continuous Loop -> ${loop.targetSelector}`,
          type: 'continuous',
          library: loop.hasTimeUniform ? 'GLSL Shader Loop' : 'requestAnimationFrame',
          affectedElements: [loop.targetSelector],
          durationMs: 0, // Continuous
          delayMs: 0,
          easing: 'linear',
          trigger: 'continuous',
          animatedProperties: ['canvas_context', 'uTime'],
          evidence: {
            runtimeEvidence: `Continuous render loop running at ~${loop.fpsEstimate || 60} FPS on ${loop.targetSelector}`,
            domEvidence: `Canvas / Element: ${loop.targetSelector}`,
            scriptEvidence: `requestAnimationFrame listener`,
            confidence: 0.9,
          },
        });
      }
    }

    return results;
  }

  private parseDurationMs(durationStr?: string): number {
    if (!durationStr) return 0;
    const clean = durationStr.trim().toLowerCase();
    if (clean.endsWith('ms')) {
      return parseFloat(clean.replace('ms', '')) || 0;
    }
    if (clean.endsWith('s')) {
      return (parseFloat(clean.replace('s', '')) || 0) * 1000;
    }
    return parseFloat(clean) || 0;
  }
}
