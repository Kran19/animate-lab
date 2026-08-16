import { Page } from 'playwright';

export interface ExtractedAnimationInfo {
  targetSelector: string;
  animationName?: string;
  durationMs: number;
  delayMs: number;
  easing: string;
  iterations: string | number;
  playState: string;
  keyframes: Array<{ offset: number | null; computedProps: Record<string, string> }>;
}

export class CSSAnimationForensics {
  public static async captureLiveAnimations(page: Page, rootSelector: string): Promise<ExtractedAnimationInfo[]> {
    return page.evaluate((rootSel) => {
      const root = document.querySelector(rootSel);
      if (!root) return [];

      const results: any[] = [];
      const elements = [root, ...Array.from(root.querySelectorAll('*'))];

      elements.forEach((el) => {
        if (typeof el.getAnimations === 'function') {
          const anims = el.getAnimations();
          anims.forEach((anim: any) => {
            const effect = anim.effect;
            const timing = effect ? effect.getComputedTiming() : {};
            const keyframes = effect && typeof effect.getKeyframes === 'function' ? effect.getKeyframes() : [];

            results.push({
              targetSelector: el.id ? `#${el.id}` : el.className ? `.${el.className.toString().split(' ')[0]}` : el.tagName.toLowerCase(),
              animationName: anim.animationName || anim.id || 'web-animation',
              durationMs: timing.duration || 0,
              delayMs: timing.delay || 0,
              easing: timing.easing || 'linear',
              iterations: timing.iterations || 1,
              playState: anim.playState || 'running',
              keyframes: keyframes.map((kf: any) => ({
                offset: kf.offset,
                computedProps: {
                  transform: kf.transform || '',
                  opacity: kf.opacity !== undefined ? kf.opacity : '',
                },
              })),
            });
          });
        }
      });

      return results;
    }, rootSelector);
  }
}
