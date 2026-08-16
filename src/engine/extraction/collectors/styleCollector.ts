import { FIRStyles, FIRNodeStyleDeclaration, FIRStylePropertyEvidence } from '../../domain/fir/sectionFIR';

export interface RawStyleObservation {
  scopedCss?: string;
  cssVariables?: Record<string, string>;
  fontFamilies?: string[];
  mediaQueries?: Array<{ query: string; rules: string }>;
  computedStyles?: Record<string, Record<string, string>>;
}

export class StyleEvidenceCollector {
  /**
   * Collects isolated, immutable Style evidence with deterministic sorting and variable resolution.
   */
  public static collect(input: RawStyleObservation): FIRStyles {
    const scopedCssSnippet = input.scopedCss || '';
    const cssVariableDeclarations: Record<string, string> = {};
    if (input.cssVariables) {
      Object.keys(input.cssVariables)
        .sort()
        .forEach((k) => {
          cssVariableDeclarations[k] = input.cssVariables![k];
        });
    }

    const fontFamilyDeclarations = Array.from(new Set(input.fontFamilies || [])).sort();

    const mediaQueryRules = (input.mediaQueries || []).map((mq) => ({
      query: mq.query,
      rules: mq.rules,
    }));

    const nodeStyles: Record<string, FIRNodeStyleDeclaration> = {};
    if (input.computedStyles) {
      Object.keys(input.computedStyles)
        .sort()
        .forEach((selector) => {
          const rawProps = input.computedStyles![selector];
          const properties: Record<string, FIRStylePropertyEvidence> = {};

          Object.keys(rawProps)
            .sort()
            .forEach((propKey) => {
              properties[propKey] = {
                property: propKey,
                value: rawProps[propKey],
                source: 'computed',
                confidence: 1.0,
              };
            });

          nodeStyles[selector] = {
            selector,
            tagName: selector.split(/[\s.#[]/)[0] || 'DIV',
            properties,
            customProperties: {},
          };
        });
    }

    return {
      scopedCssSnippet,
      cssVariableDeclarations,
      fontFamilyDeclarations,
      mediaQueryRules,
      nodeStyles,
    };
  }
}
