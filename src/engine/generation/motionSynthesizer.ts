import {
  FIRMotionEvidence,
  GSAPTimelineEvidence,
  ScrollTriggerEvidence,
  CSSAnimationEvidence,
} from '../domain/fir/sectionFIR';

export interface MotionSynthesisResult {
  hasMotionCode: boolean;
  importsCode: string;
  hookCode: string;
  requiredNpmDependencies: Record<string, string>;
  diagnostics: string[];
}

export class MotionSynthesizer {
  /**
   * Synthesizes idiomatic React GSAP & Motion hook code from FIR motion graph traces.
   * Crucial principle: "Recover the motion graph parameters, not minified closure source code."
   */
  public static synthesize(traces: FIRMotionEvidence[], rootSelector: string): MotionSynthesisResult {
    const diagnostics: string[] = [];
    const gsapTraces = traces.filter((t) => t.kind === 'gsap_timeline') as GSAPTimelineEvidence[];
    const scrollTriggers = traces.filter((t) => t.kind === 'scroll_trigger') as ScrollTriggerEvidence[];
    const cssAnimations = traces.filter((t) => t.kind === 'css_animation') as CSSAnimationEvidence[];

    if (gsapTraces.length === 0 && scrollTriggers.length === 0 && cssAnimations.length === 0) {
      return {
        hasMotionCode: false,
        importsCode: '',
        hookCode: '',
        requiredNpmDependencies: {},
        diagnostics,
      };
    }

    const hasScrollTrigger = scrollTriggers.length > 0 || gsapTraces.some((t) =>
      scrollTriggers.some((st) => st.linkedTimelineId === t.timelineId)
    );

    // 1. Build ES Imports
    let importsCode = "import { useGSAP } from '@gsap/react';\nimport gsap from 'gsap';\n";
    if (hasScrollTrigger) {
      importsCode += "import { ScrollTrigger } from 'gsap/ScrollTrigger';\n\nif (typeof window !== 'undefined') {\n  gsap.registerPlugin(ScrollTrigger);\n}\n";
    }

    // 2. Build useGSAP hook body
    let hookBody = '  // Synthesized Motion Graph via AnimateLab GSAP Reconstructor\n  useGSAP(() => {\n';

    // Handle ScrollTriggers
    scrollTriggers.forEach((st, idx) => {
      const target = st.triggerSelector || rootSelector;
      const scrubVal = typeof st.scrub === 'number' ? st.scrub : st.scrub ? 'true' : 'false';
      const pinVal = typeof st.pin === 'string' ? `'${st.pin}'` : st.pin ? 'true' : 'false';
      hookBody += `    // ScrollTrigger instance #${idx + 1}\n`;
      hookBody += `    ScrollTrigger.create({\n      trigger: '${target}',\n      start: '${st.start || 'top 80%'}',\n      end: '${st.end || 'bottom 20%'}',\n      scrub: ${scrubVal},\n      pin: ${pinVal},\n    });\n\n`;
    });

    // Handle GSAP Timelines & Tweens
    gsapTraces.forEach((tl, tlIdx) => {
      const tlVar = `tl_${tlIdx}`;
      hookBody += `    const ${tlVar} = gsap.timeline({ repeat: ${tl.repeat || 0}, yoyo: ${tl.yoyo ? 'true' : 'false'} });\n`;

      tl.tweens.forEach((tw) => {
        const target = tw.targetSelector || rootSelector;
        const dur = tw.duration || 1.0;
        const ease = tw.ease ? `'${tw.ease}'` : "'power3.out'";

        if (tw.propertiesFrom && tw.propertiesTo) {
          const fromPropsStr = JSON.stringify(tw.propertiesFrom);
          const toProps = { ...tw.propertiesTo, duration: dur, ease: tw.ease || 'power3.out' };
          const toPropsStr = JSON.stringify(toProps);
          hookBody += `    ${tlVar}.fromTo('${target}', ${fromPropsStr}, ${toPropsStr});\n`;
        } else if (tw.propertiesFrom) {
          const fromProps = { ...tw.propertiesFrom, duration: dur, ease: tw.ease || 'power3.out' };
          hookBody += `    ${tlVar}.from('${target}', ${JSON.stringify(fromProps)});\n`;
        } else {
          const toProps = { ...tw.propertiesTo, duration: dur, ease: tw.ease || 'power3.out' };
          hookBody += `    ${tlVar}.to('${target}', ${JSON.stringify(toProps)});\n`;
        }
      });
    });

    // If only ScrollTrigger without explicit timeline, add standard entrance reveal
    if (gsapTraces.length === 0 && scrollTriggers.length > 0) {
      hookBody += `    gsap.fromTo('${rootSelector}', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' });\n`;
    }

    hookBody += '  });\n';

    const requiredNpmDependencies: Record<string, string> = {
      gsap: '^3.12.5',
      '@gsap/react': '^2.1.1',
    };

    return {
      hasMotionCode: true,
      importsCode,
      hookCode: hookBody,
      requiredNpmDependencies,
      diagnostics,
    };
  }
}
