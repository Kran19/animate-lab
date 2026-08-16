import { Page } from 'playwright';

export interface GsapTimelineEvidence {
  status: 'GSAP_DETECTED' | 'GSAP_NOT_DETECTED' | 'GSAP_RUNTIME_UNOBSERVABLE';
  timelinesCount: number;
  scrollTriggersCount: number;
  observedDetails: Array<{
    targetCount: number;
    hasScrollTrigger: boolean;
    duration?: number;
    ease?: string;
    pin?: boolean;
    scrub?: boolean | number;
  }>;
}

export class GsapRuntimeForensics {
  public static async inspectRuntime(page: Page): Promise<GsapTimelineEvidence> {
    return page.evaluate(() => {
      try {
        const win = window as any;
        const hasGsap = typeof win.gsap !== 'undefined';
        const hasScrollTrigger = typeof win.ScrollTrigger !== 'undefined';

        if (!hasGsap) {
          return {
            status: 'GSAP_NOT_DETECTED',
            timelinesCount: 0,
            scrollTriggersCount: 0,
            observedDetails: [],
          };
        }

        const details: any[] = [];
        let scrollTriggersCount = 0;

        if (hasScrollTrigger && typeof win.ScrollTrigger.getAll === 'function') {
          const allTriggers = win.ScrollTrigger.getAll();
          scrollTriggersCount = allTriggers.length;
          allTriggers.forEach((st: any) => {
            details.push({
              targetCount: st.trigger ? 1 : 0,
              hasScrollTrigger: true,
              pin: !!st.pin,
              scrub: st.vars ? st.vars.scrub : false,
            });
          });
        }

        return {
          status: 'GSAP_DETECTED',
          timelinesCount: details.length,
          scrollTriggersCount,
          observedDetails: details,
        };
      } catch {
        return {
          status: 'GSAP_RUNTIME_UNOBSERVABLE',
          timelinesCount: 0,
          scrollTriggersCount: 0,
          observedDetails: [],
        };
      }
    });
  }
}
