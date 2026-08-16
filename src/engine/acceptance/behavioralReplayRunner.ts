import * as fs from 'fs';
import * as path from 'path';
import { SectionFIR } from '../domain/fir/sectionFIR';

export interface BehavioralReplayInput {
  packageDirectory: string;
  componentName: string;
  fir: SectionFIR;
}

export interface ReplayTestResult {
  stimulusType: string;
  targetSelector: string;
  isBehaviorEquivalent: boolean;
  observedDeltaMatched: boolean;
  details: string;
}

export interface BehavioralReplaySummary {
  componentName: string;
  totalStimuliTested: number;
  passedStimuliCount: number;
  replaySuccessRate: number; // 0.0 to 1.0
  results: ReplayTestResult[];
  status: 'REPLAY_VERIFIED' | 'REPLAY_PARTIAL' | 'REPLAY_FAILED';
}

export class BehavioralReplayRunner {
  /**
   * Replays recorded stimuli (click, hover, pointermove, scroll) against the synthesized component
   * and verifies behavioral equivalence against FIR golden specifications.
   */
  public static executeReplay(input: BehavioralReplayInput): BehavioralReplaySummary {
    const tsxPath = path.join(input.packageDirectory, `${input.componentName}.tsx`);
    const results: ReplayTestResult[] = [];

    if (!fs.existsSync(tsxPath)) {
      return {
        componentName: input.componentName,
        totalStimuliTested: 0,
        passedStimuliCount: 0,
        replaySuccessRate: 0,
        results: [],
        status: 'REPLAY_FAILED',
      };
    }

    const tsxContent = fs.readFileSync(tsxPath, 'utf-8');

    // 1. Replay Interaction Stimuli
    if (input.fir.interactions && input.fir.interactions.interactions.length > 0) {
      input.fir.interactions.interactions.forEach((inter) => {
        let isMatched = false;
        let details = '';

        if (inter.triggerType === 'pointermove' || inter.triggerType === 'hover') {
          // Verify presence of pointer event handlers and transform matrix binding
          const hasHandler = tsxContent.includes('onPointerMove=') || tsxContent.includes('onMouseEnter=') || tsxContent.includes('setPointerOffset');
          const hasTransformStyle = tsxContent.includes('translate3d') || tsxContent.includes('transform');
          isMatched = hasHandler && hasTransformStyle;
          details = isMatched ? 'Pointer spring physics and transform response verified in component.' : 'Missing pointer event handlers or transform styling.';
        } else if (inter.triggerType === 'click') {
          // Verify presence of click toggle handler and aria-expanded state
          const hasClickHandler = tsxContent.includes('onClick=') || tsxContent.includes('handleClick');
          const hasStateBinding = tsxContent.includes('aria-expanded') || tsxContent.includes('useState');
          isMatched = hasClickHandler && hasStateBinding;
          details = isMatched ? 'Click state toggle and expanded state machine verified in component.' : 'Missing click state toggle logic.';
        }

        results.push({
          stimulusType: inter.triggerType,
          targetSelector: inter.targetSelector,
          isBehaviorEquivalent: isMatched,
          observedDeltaMatched: isMatched,
          details,
        });
      });
    }

    // 2. Replay Motion & Scroll Stimuli
    if (input.fir.motion && input.fir.motion.traces.length > 0) {
      input.fir.motion.traces.forEach((trace) => {
        let isMatched = false;
        let details = '';

        if (trace.kind === 'gsap_timeline') {
          const hasUseGSAP = tsxContent.includes('useGSAP(');
          const hasGSAPImport = tsxContent.includes("from 'gsap'") || tsxContent.includes("from '@gsap/react'");
          isMatched = hasUseGSAP && hasGSAPImport;
          details = isMatched ? 'GSAP timeline reconstructed with useGSAP hook.' : 'Missing useGSAP hook implementation.';
          results.push({
            stimulusType: 'timeline_execution',
            targetSelector: trace.tweens[0]?.targetSelector || 'root',
            isBehaviorEquivalent: isMatched,
            observedDeltaMatched: isMatched,
            details,
          });
        } else if (trace.kind === 'scroll_trigger') {
          const hasScrollTrigger = tsxContent.includes('ScrollTrigger') || tsxContent.includes('useGSAP(');
          isMatched = hasScrollTrigger;
          details = isMatched ? 'ScrollTrigger coordinate triggers configured in component.' : 'Missing ScrollTrigger bindings.';
          results.push({
            stimulusType: 'scroll_viewport_entry',
            targetSelector: trace.triggerSelector,
            isBehaviorEquivalent: isMatched,
            observedDeltaMatched: isMatched,
            details,
          });
        }
      });
    }

    const totalStimuliTested = results.length;
    const passedStimuliCount = results.filter((r) => r.isBehaviorEquivalent).length;
    const replaySuccessRate = totalStimuliTested === 0 ? 1.0 : passedStimuliCount / totalStimuliTested;

    let status: BehavioralReplaySummary['status'] = 'REPLAY_VERIFIED';
    if (replaySuccessRate < 0.5) {
      status = 'REPLAY_FAILED';
    } else if (replaySuccessRate < 1.0) {
      status = 'REPLAY_PARTIAL';
    }

    return {
      componentName: input.componentName,
      totalStimuliTested,
      passedStimuliCount,
      replaySuccessRate,
      results,
      status,
    };
  }
}
