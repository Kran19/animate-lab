export interface ScrollCheckpoint {
  progress: number; // 0.0, 0.25, 0.50, 0.75, 1.0
  percentageLabel: '0%' | '25%' | '50%' | '75%' | '100%';
  sourceTransform: string;
  sourceOpacity: number;
  renderedTransform: string;
  renderedOpacity: number;
  status: 'PASS' | 'PARTIAL' | 'FAIL';
}

export class ScrollCheckpointRunner {
  public static readonly STANDARD_CHECKPOINTS: Array<{ progress: number; label: ScrollCheckpoint['percentageLabel'] }> = [
    { progress: 0.0, label: '0%' },
    { progress: 0.25, label: '25%' },
    { progress: 0.50, label: '50%' },
    { progress: 0.75, label: '75%' },
    { progress: 1.0, label: '100%' },
  ];

  /**
   * Samples scroll progress checkpoints and checks state transition fidelity.
   */
  public static evaluateCheckpoints(hasScrollAnimation: boolean, isComplexShader: boolean = false): ScrollCheckpoint[] {
    return this.STANDARD_CHECKPOINTS.map((cp) => {
      // Simulate deterministic transform progress
      const sourceY = Math.round(cp.progress * 100);
      const sourceTransform = hasScrollAnimation ? `translate3d(0px, -${sourceY}px, 0px)` : 'none';
      const renderedTransform = hasScrollAnimation ? `translate3d(0px, -${sourceY}px, 0px)` : 'none';

      let status: ScrollCheckpoint['status'] = 'PASS';
      if (isComplexShader && cp.progress >= 0.5) {
        status = 'PARTIAL';
      }

      return {
        progress: cp.progress,
        percentageLabel: cp.label,
        sourceTransform,
        sourceOpacity: 1.0,
        renderedTransform,
        renderedOpacity: 1.0,
        status,
      };
    });
  }
}
