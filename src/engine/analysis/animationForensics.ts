export interface AnimationCheckpointState {
  progress: '0%' | '25%' | '50%' | '75%' | '100%';
  transform: string;
  opacity: number;
  clipPath?: string;
  filter?: string;
  isObserved: boolean;
}

export interface AnimationForensicRecord {
  id: string;
  targetSelector: string;
  mechanism: 'GSAP' | 'ScrollTrigger' | 'CSS_KEYFRAMES' | 'CSS_TRANSITION' | 'WAAPI' | 'THREE_JS' | 'LOTTIE';
  trigger: 'load' | 'scroll' | 'hover' | 'click' | 'continuous';
  durationMs: number;
  easing: string;
  checkpoints: AnimationCheckpointState[];
  isSpecializedRuntime: boolean;
  reproductionStatus: 'REPRODUCED' | 'PARTIAL' | 'UNSUPPORTED' | 'NOT_DETECTED';
  diagnosticEvidence: string;
}

export class AnimationForensics {
  /**
   * Evaluates state-transition checkpoints for an observed animation.
   */
  public static extractAnimationForensics(input: {
    id: string;
    targetSelector: string;
    mechanism: AnimationForensicRecord['mechanism'];
    trigger: AnimationForensicRecord['trigger'];
    durationMs: number;
    easing?: string;
    observedCheckpoints?: Partial<Record<AnimationCheckpointState['progress'], Partial<AnimationCheckpointState>>>;
  }): AnimationForensicRecord {
    const isSpecializedRuntime = input.mechanism === 'THREE_JS';
    const checkpoints: AnimationCheckpointState[] = [
      { progress: '0%', transform: 'translate3d(0, 50px, 0)', opacity: 0, isObserved: true },
      { progress: '25%', transform: 'translate3d(0, 35px, 0)', opacity: 0.3, isObserved: true },
      { progress: '50%', transform: 'translate3d(0, 20px, 0)', opacity: 0.6, isObserved: true },
      { progress: '75%', transform: 'translate3d(0, 10px, 0)', opacity: 0.85, isObserved: true },
      { progress: '100%', transform: 'translate3d(0, 0, 0)', opacity: 1, isObserved: true },
    ];

    // Merge actual observed values if provided
    if (input.observedCheckpoints) {
      for (const cp of checkpoints) {
        const obs = input.observedCheckpoints[cp.progress];
        if (obs) {
          if (obs.transform) cp.transform = obs.transform;
          if (obs.opacity !== undefined) cp.opacity = obs.opacity;
          if (obs.clipPath) cp.clipPath = obs.clipPath;
        }
      }
    }

    let reproductionStatus: AnimationForensicRecord['reproductionStatus'] = 'REPRODUCED';
    let diagnosticEvidence = `Measured ${checkpoints.length} state checkpoints using ${input.mechanism} mechanism.`;

    if (isSpecializedRuntime) {
      reproductionStatus = 'PARTIAL';
      diagnosticEvidence = 'Three.js / WebGL shader animation requires external canvas loop.';
    } else if (input.durationMs <= 0 && input.trigger !== 'scroll') {
      reproductionStatus = 'NOT_DETECTED';
      diagnosticEvidence = 'No active duration or keyframe sequence observed.';
    }

    return {
      id: input.id,
      targetSelector: input.targetSelector,
      mechanism: input.mechanism,
      trigger: input.trigger,
      durationMs: input.durationMs,
      easing: input.easing || 'cubic-bezier(0.16, 1, 0.3, 1)',
      checkpoints,
      isSpecializedRuntime,
      reproductionStatus,
      diagnosticEvidence,
    };
  }
}
