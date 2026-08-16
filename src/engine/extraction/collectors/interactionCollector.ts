import { FIRInteractions, FIRInteractionEvidence } from '../../domain/fir/sectionFIR';

export interface RawInteractionObservation {
  interactions?: Array<{
    id: string;
    triggerType: 'click' | 'hover' | 'pointermove' | 'focus' | 'drag' | 'scroll';
    targetSelector: string;
    stimulusData?: Record<string, any>;
    styleDeltas?: Array<{
      selector: string;
      property: string;
      beforeValue: string;
      afterValue: string;
    }>;
    domMutationsObserved?: number;
    settleDurationMs?: number;
  }>;
}

export class InteractionEvidenceCollector {
  /**
   * Collects isolated, immutable Interaction evidence from browser runtime probes.
   */
  public static collect(input: RawInteractionObservation): FIRInteractions {
    const rawList = input.interactions || [];
    const hasInteractions = rawList.length > 0;

    const interactions: FIRInteractionEvidence[] = rawList.map((item, idx) => ({
      interactionId: item.id || `interaction-${idx}`,
      triggerType: item.triggerType,
      targetSelector: item.targetSelector,
      stimulusData: item.stimulusData,
      observedResponseDelta: {
        affectedSelectors: [item.targetSelector],
        styleDeltas: item.styleDeltas || [],
        domMutationsObserved: item.domMutationsObserved || 0,
        settleDurationMs: item.settleDurationMs || 250,
      },
    }));

    return {
      hasInteractions,
      interactions,
    };
  }
}
