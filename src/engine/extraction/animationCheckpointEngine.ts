export interface AnimationStateCheckpoint {
  checkpointId: string;
  stateName: 'INITIAL' | '25%' | '50%' | '75%' | 'FINAL' | 'BEFORE' | 'POINTER_ENTER' | 'MID' | 'POINTER_LEAVE' | 'TRIGGER' | 'AFTER' | 'RECOVERY';
  progressRatio: number; // 0.0 to 1.0
  timestampMs: number;
  properties: {
    opacity?: number;
    transform?: string;
    translateX?: number;
    translateY?: number;
    scale?: number;
    rotateDeg?: number;
    height?: number;
  };
}

export interface AnimationSequenceCheckpointReport {
  animationId: string;
  sectionId: string;
  animationType: 'TIMELINE' | 'SCROLL' | 'HOVER' | 'CLICK';
  durationMs: number;
  totalCheckpoints: number;
  checkpoints: AnimationStateCheckpoint[];
}

export class AnimationCheckpointEngine {
  /**
   * Generates or captures multi-state discrete animation checkpoints for motion curve fitting and replay.
   */
  public static createTimelineCheckpoints(
    animationId: string,
    sectionId: string,
    durationMs: number = 1000,
    fromProps: { opacity?: number; y?: number; scale?: number } = { opacity: 0, y: 50, scale: 0.95 },
    toProps: { opacity?: number; y?: number; scale?: number } = { opacity: 1, y: 0, scale: 1.0 }
  ): AnimationSequenceCheckpointReport {
    const states: Array<{ name: AnimationStateCheckpoint['stateName']; ratio: number }> = [
      { name: 'INITIAL', ratio: 0.0 },
      { name: '25%', ratio: 0.25 },
      { name: '50%', ratio: 0.5 },
      { name: '75%', ratio: 0.75 },
      { name: 'FINAL', ratio: 1.0 },
    ];

    const checkpoints: AnimationStateCheckpoint[] = states.map((st, idx) => {
      // Interpolate with easeOut cubic curve
      const easeT = 1 - Math.pow(1 - st.ratio, 3);
      const opacity = (fromProps.opacity ?? 0) + ((toProps.opacity ?? 1) - (fromProps.opacity ?? 0)) * easeT;
      const y = (fromProps.y ?? 0) + ((toProps.y ?? 0) - (fromProps.y ?? 0)) * easeT;
      const scale = (fromProps.scale ?? 1) + ((toProps.scale ?? 1) - (fromProps.scale ?? 1)) * easeT;

      return {
        checkpointId: `chk_${animationId}_${idx}`,
        stateName: st.name,
        progressRatio: st.ratio,
        timestampMs: Math.round(st.ratio * durationMs),
        properties: {
          opacity: Math.round(opacity * 100) / 100,
          translateY: Math.round(y * 10) / 10,
          scale: Math.round(scale * 1000) / 1000,
          transform: `translate3d(0px, ${Math.round(y * 10) / 10}px, 0px) scale(${Math.round(scale * 1000) / 1000})`,
        },
      };
    });

    return {
      animationId,
      sectionId,
      animationType: 'TIMELINE',
      durationMs,
      totalCheckpoints: checkpoints.length,
      checkpoints,
    };
  }

  public static createInteractionCheckpoints(
    interactionId: string,
    sectionId: string,
    type: 'HOVER' | 'CLICK'
  ): AnimationSequenceCheckpointReport {
    if (type === 'HOVER') {
      const states: Array<{ name: AnimationStateCheckpoint['stateName']; ratio: number; x: number; y: number }> = [
        { name: 'BEFORE', ratio: 0.0, x: 0, y: 0 },
        { name: 'POINTER_ENTER', ratio: 0.3, x: 5, y: -4 },
        { name: 'MID', ratio: 0.6, x: 12, y: -8 },
        { name: 'POINTER_LEAVE', ratio: 0.9, x: 3, y: -2 },
        { name: 'RECOVERY', ratio: 1.0, x: 0, y: 0 },
      ];

      const checkpoints: AnimationStateCheckpoint[] = states.map((st, idx) => ({
        checkpointId: `chk_hov_${interactionId}_${idx}`,
        stateName: st.name,
        progressRatio: st.ratio,
        timestampMs: idx * 50,
        properties: {
          translateX: st.x,
          translateY: st.y,
          transform: `translate3d(${st.x}px, ${st.y}px, 0px)`,
        },
      }));

      return {
        animationId: interactionId,
        sectionId,
        animationType: 'HOVER',
        durationMs: 250,
        totalCheckpoints: checkpoints.length,
        checkpoints,
      };
    } else {
      // CLICK
      const states: Array<{ name: AnimationStateCheckpoint['stateName']; ratio: number; h: number }> = [
        { name: 'BEFORE', ratio: 0.0, h: 0 },
        { name: 'TRIGGER', ratio: 0.2, h: 20 },
        { name: 'AFTER', ratio: 0.8, h: 120 },
        { name: 'RECOVERY', ratio: 1.0, h: 120 },
      ];

      const checkpoints: AnimationStateCheckpoint[] = states.map((st, idx) => ({
        checkpointId: `chk_clk_${interactionId}_${idx}`,
        stateName: st.name,
        progressRatio: st.ratio,
        timestampMs: idx * 80,
        properties: {
          height: st.h,
          transform: `none`,
        },
      }));

      return {
        animationId: interactionId,
        sectionId,
        animationType: 'CLICK',
        durationMs: 300,
        totalCheckpoints: checkpoints.length,
        checkpoints,
      };
    }
  }
}
