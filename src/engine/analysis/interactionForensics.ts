export interface InteractionTransitionEvidence {
  interactionId: string;
  triggerType: 'hover' | 'click' | 'drag' | 'scroll' | 'tab' | 'accordion' | 'modal';
  targetSelector: string;
  beforeState: {
    transform: string;
    opacity: number;
    visibility: string;
    dimensions: { width: number; height: number };
  };
  afterState: {
    transform: string;
    opacity: number;
    visibility: string;
    dimensions: { width: number; height: number };
  };
  hasMeasurableDelta: boolean;
  isObserved: boolean;
  reproductionPath: string;
}

export class InteractionForensics {
  /**
   * Audits interaction BEFORE -> ACTION -> AFTER transitions to verify observable behavioral changes.
   */
  public static evaluateInteractionTransition(input: {
    interactionId: string;
    triggerType: InteractionTransitionEvidence['triggerType'];
    targetSelector: string;
    beforeState: InteractionTransitionEvidence['beforeState'];
    afterState: InteractionTransitionEvidence['afterState'];
    isObservedOnPage: boolean;
  }): InteractionTransitionEvidence {
    const transformDelta = input.beforeState.transform !== input.afterState.transform;
    const opacityDelta = input.beforeState.opacity !== input.afterState.opacity;
    const dimDelta = input.beforeState.dimensions.width !== input.afterState.dimensions.width ||
                     input.beforeState.dimensions.height !== input.afterState.dimensions.height;
    const visDelta = input.beforeState.visibility !== input.afterState.visibility;

    const hasMeasurableDelta = transformDelta || opacityDelta || dimDelta || visDelta;

    let reproductionPath = 'Standard React event handler state toggle.';
    if (input.triggerType === 'hover') {
      reproductionPath = 'CSS :hover transition / GSAP quickTo listener.';
    } else if (input.triggerType === 'modal') {
      reproductionPath = 'Portal drawer with backdrop filter.';
    }

    return {
      interactionId: input.interactionId,
      triggerType: input.triggerType,
      targetSelector: input.targetSelector,
      beforeState: input.beforeState,
      afterState: input.afterState,
      hasMeasurableDelta,
      isObserved: input.isObservedOnPage && hasMeasurableDelta,
      reproductionPath,
    };
  }
}
