import { ComponentCandidate, ComponentEvidence, Section } from '@prisma/client';

export interface JSExecutionDependency {
  type: 'SELF_CONTAINED' | 'LOCAL_RUNTIME_DEPENDENCY' | 'EXTERNAL_NPM_DEPENDENCY' | 'UNSUPPORTED_RUNTIME_DEPENDENCY';
  name: string;
  sourceUrl?: string;
  isSafeToBundle: boolean;
}

export interface IsolatedComponent {
  sourceCandidateId: string;
  websiteId: string;
  pageId: string;
  title: string;
  category: string;
  html: string;
  cssRules: string[];
  keyframes: Array<{ name: string; ruleCss: string }>;
  fonts: Array<{ family: string; srcUrl: string }>;
  assets: Array<{ id: string; originalUrl: string; mimeType: string; localPath: string }>;
  animations: Array<{ id: string; name: string; type: string; affectedElements: string }>;
  technologies: Array<{ id: string; name: string; category: string }>;
  jsDependencies: JSExecutionDependency[];
  selectors: string[];
  diagnostics: string[];
  stage: 'ISOLATED';
}

export interface IsolationInput {
  candidate: ComponentCandidate & {
    evidence?: ComponentEvidence | null;
    section?: Section | null;
  };
  originalHtml?: string;
  originalCss?: string;
  originalJs?: string;
  animations?: Array<{ id: string; name: string; type: string; affectedElements: string }>;
  resources?: Array<{ id: string; originalUrl: string; mimeType: string; localPath: string }>;
  technologies?: Array<{ id: string; name: string; category: string }>;
}

export class ComponentIsolator {
  /**
   * Isolates the DOM subtree, CSS dependencies, fonts, assets, and JS dependency classifications
   * without executing captured website JavaScript.
   */
  public isolateComponent(input: IsolationInput): IsolatedComponent {
    const cand = input.candidate;
    const diagnostics: string[] = [];

    // 1. Extract DOM subtree HTML
    let rawHtml = input.originalHtml || cand.originalHtml || `<div class="component-root">${cand.title}</div>`;
    // Clean global website wrapper tags (body, html, main wrapper)
    rawHtml = rawHtml.replace(/<\/?(html|head|body)[^>]*>/gi, '').trim();

    // 2. Extract CSS rules and keyframes
    const rawCss = input.originalCss || cand.originalCss || '';
    const cssRules: string[] = [];
    const keyframes: Array<{ name: string; ruleCss: string }> = [];

    if (rawCss) {
      const keyframeRegex = /@keyframes\s+([a-zA-Z0-9_-]+)\s*\{[\s\S]*?\}/gi;
      let match: RegExpExecArray | null;
      while ((match = keyframeRegex.exec(rawCss)) !== null) {
        keyframes.push({
          name: match[1],
          ruleCss: match[0],
        });
      }
      // Prune @keyframes from raw CSS rule set
      const cleanedCss = rawCss.replace(keyframeRegex, '').trim();
      if (cleanedCss) {
        cssRules.push(cleanedCss);
      }
    }

    // 3. Extract Font dependencies
    const fonts: Array<{ family: string; srcUrl: string }> = [];
    const fontFaceRegex = /@font-face\s*\{[\s\S]*?font-family:\s*['"]?([^;'"]+)['"]?[\s\S]*?src:\s*url\(([^)]+)\)[\s\S]*?\}/gi;
    let fontMatch: RegExpExecArray | null;
    while ((fontMatch = fontFaceRegex.exec(rawCss)) !== null) {
      fonts.push({
        family: fontMatch[1].trim(),
        srcUrl: fontMatch[2].replace(/['"]/g, '').trim(),
      });
    }

    // 4. Classify JS Dependencies safely (AST/Metadata analysis ONLY, NO EVAL)
    const jsDependencies: JSExecutionDependency[] = [];
    const rawJs = input.originalJs || cand.originalJs || '';

    if (rawJs.includes('gsap') || (input.technologies || []).some((t) => t.name === 'GSAP')) {
      jsDependencies.push({
        type: 'EXTERNAL_NPM_DEPENDENCY',
        name: 'gsap',
        isSafeToBundle: true,
      });
    }
    if (rawJs.includes('ScrollTrigger') || (input.technologies || []).some((t) => t.name === 'ScrollTrigger')) {
      jsDependencies.push({
        type: 'EXTERNAL_NPM_DEPENDENCY',
        name: 'gsap/ScrollTrigger',
        isSafeToBundle: true,
      });
    }
    if (rawJs.includes('THREE') || (input.technologies || []).some((t) => t.name === 'Three.js')) {
      jsDependencies.push({
        type: 'EXTERNAL_NPM_DEPENDENCY',
        name: 'three',
        isSafeToBundle: true,
      });
    }

    // Detect untrusted/unhandled script logic
    if (rawJs && !jsDependencies.some((d) => d.name === 'gsap' || d.name === 'three')) {
      if (rawJs.length > 50) {
        jsDependencies.push({
          type: 'UNSUPPORTED_RUNTIME_DEPENDENCY',
          name: 'unhandled_inline_script',
          isSafeToBundle: false,
        });
        diagnostics.push('Unhandled inline script detected in candidate. Marked as UNSUPPORTED_RUNTIME_DEPENDENCY.');
      } else {
        jsDependencies.push({
          type: 'SELF_CONTAINED',
          name: 'inline_utility',
          isSafeToBundle: true,
        });
      }
    }

    // 5. Extract Selectors present in HTML/CSS
    const selectorRegex = /\.([a-zA-Z0-9_-]+)/g;
    const selectorsSet = new Set<string>();
    let selMatch: RegExpExecArray | null;
    while ((selMatch = selectorRegex.exec(rawHtml + ' ' + rawCss)) !== null) {
      selectorsSet.add(selMatch[1]);
    }

    return {
      sourceCandidateId: cand.id,
      websiteId: cand.websiteId,
      pageId: cand.pageId,
      title: cand.title,
      category: cand.category,
      html: rawHtml,
      cssRules,
      keyframes,
      fonts,
      assets: input.resources || [],
      animations: input.animations || [],
      technologies: input.technologies || [],
      jsDependencies,
      selectors: Array.from(selectorsSet),
      diagnostics,
      stage: 'ISOLATED',
    };
  }
}
