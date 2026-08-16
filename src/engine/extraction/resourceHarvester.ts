import { Page } from 'playwright';
import fs from 'fs';
import path from 'path';

export interface HarvestedSectionResult {
  sectionId: string;
  name: string;
  category: string;
  outerHtml: string;
  innerHtml: string;
  scopedCss: string;
  stylesheetHrefs: string[];
  inlineStyles: string[];
  fontsCss: string;
  assets: string[];
}

export class ResourceHarvester {
  public static async harvestLivePageStylesAndDOM(page: Page, sectionSelector: string): Promise<HarvestedSectionResult | null> {
    return page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;

      // 1. Harvest all external stylesheets
      const stylesheets: string[] = [];
      document.querySelectorAll('link[rel="stylesheet"]').forEach((link: any) => {
        if (link.href) stylesheets.push(link.href);
      });

      // 2. Harvest all inline styles
      const inlineStyles: string[] = [];
      document.querySelectorAll('style').forEach((style: any) => {
        if (style.innerHTML && style.innerHTML.trim().length > 0) {
          inlineStyles.push(style.innerHTML);
        }
      });

      // 3. Harvest CSS rules matching elements inside this section
      let sectionSpecificCss = '';
      try {
        Array.from(document.styleSheets).forEach((sheet) => {
          try {
            const rules = Array.from(sheet.cssRules || []);
            rules.forEach((rule) => {
              if (rule instanceof CSSStyleRule) {
                // Check if rule applies to something in the section
                try {
                  if (el.querySelector(rule.selectorText) || el.matches(rule.selectorText)) {
                    sectionSpecificCss += rule.cssText + '\n';
                  }
                } catch {}
              } else if (rule instanceof CSSKeyframesRule || rule instanceof CSSFontFaceRule) {
                sectionSpecificCss += rule.cssText + '\n';
              }
            });
          } catch {}
        });
      } catch {}

      // 4. Harvest assets inside section
      const assets: string[] = [];
      el.querySelectorAll('img, source, video, svg image').forEach((node: any) => {
        if (node.src) assets.push(node.src);
        if (node.currentSrc) assets.push(node.currentSrc);
      });

      return {
        sectionId: el.id || 'sec-carved',
        name: el.className ? el.className.toString().split(' ')[0] : el.tagName.toLowerCase(),
        category: el.tagName.toLowerCase(),
        outerHtml: el.outerHTML,
        innerHtml: el.innerHTML,
        scopedCss: sectionSpecificCss,
        stylesheetHrefs: stylesheets,
        inlineStyles,
        fontsCss: '',
        assets,
      };
    }, sectionSelector);
  }
}
