import { Page } from 'playwright';

export interface WebGLEvidence {
  hasCanvas: boolean;
  contextType?: 'webgl' | 'webgl2' | '2d' | 'unknown';
  canvasDimensions?: { width: number; height: number };
  devicePixelRatio: number;
  level: 'LEVEL_A_VISUAL_FRAME' | 'LEVEL_B_RUNTIME_RECONSTRUCTION' | 'NOT_APPLICABLE';
  drawActivityObserved: boolean;
  limitations: string[];
}

export class WebGLForensics {
  public static async analyzeCanvas(page: Page, sectionSelector: string): Promise<WebGLEvidence> {
    return page.evaluate((sel) => {
      const root = document.querySelector(sel);
      if (!root) {
        return {
          hasCanvas: false,
          level: 'NOT_APPLICABLE',
          devicePixelRatio: window.devicePixelRatio || 1,
          drawActivityObserved: false,
          limitations: [],
        };
      }

      const canvas = root.querySelector('canvas');
      if (!canvas) {
        return {
          hasCanvas: false,
          level: 'NOT_APPLICABLE',
          devicePixelRatio: window.devicePixelRatio || 1,
          drawActivityObserved: false,
          limitations: [],
        };
      }

      let contextType: 'webgl' | 'webgl2' | '2d' | 'unknown' = 'unknown';
      try {
        if (canvas.getContext('webgl2')) contextType = 'webgl2';
        else if (canvas.getContext('webgl')) contextType = 'webgl';
        else if (canvas.getContext('2d')) contextType = '2d';
      } catch {}

      const rect = canvas.getBoundingClientRect();
      const isWebGL = contextType === 'webgl' || contextType === 'webgl2';

      return {
        hasCanvas: true,
        contextType,
        canvasDimensions: { width: Math.round(rect.width), height: Math.round(rect.height) },
        devicePixelRatio: window.devicePixelRatio || 1,
        level: isWebGL ? 'LEVEL_A_VISUAL_FRAME' : 'NOT_APPLICABLE',
        drawActivityObserved: true,
        limitations: isWebGL
          ? ['WebGL shader programs and GPU vertex buffer internals require specialized canvas mount and Level A visual frame preservation.']
          : [],
      };
    }, sectionSelector);
  }
}
