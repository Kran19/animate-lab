export interface TypographySpecification {
  fontFamily: string;
  fontWeight: string | number;
  fontStyle?: string;
  fontSize?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  fallbackStack: string[];
  isCustomWebFont: boolean;
  fontFileAvailable?: boolean;
}

export interface TypographyValidationResult {
  isCompliant: boolean;
  isCustomFontPreserved: boolean;
  hasFallbackStack: boolean;
  fontFamily: string;
  diagnostics: string[];
}

export class TypographyValidator {
  /**
   * Evaluates typography extraction fidelity and verifies that custom web fonts and fallback stacks are declared.
   */
  public static validateTypography(specs: TypographySpecification[]): {
    totalEvaluated: number;
    compliantCount: number;
    customFontCount: number;
    results: TypographyValidationResult[];
  } {
    let compliantCount = 0;
    let customFontCount = 0;
    const results: TypographyValidationResult[] = [];

    for (const spec of specs) {
      const diagnostics: string[] = [];
      const hasFallback = spec.fallbackStack.length > 0;
      const isCustom = spec.isCustomWebFont;

      if (isCustom) {
        customFontCount++;
        if (!spec.fontFileAvailable) {
          diagnostics.push(`Custom web font "${spec.fontFamily}" has no local font file bundled; requires fallback stack.`);
        }
      }

      if (!hasFallback) {
        diagnostics.push(`Missing fallback font stack for "${spec.fontFamily}".`);
      }

      const isCompliant = hasFallback && (!isCustom || spec.fontFileAvailable !== false);
      if (isCompliant) compliantCount++;

      results.push({
        isCompliant,
        isCustomFontPreserved: isCustom && spec.fontFileAvailable !== false,
        hasFallbackStack: hasFallback,
        fontFamily: spec.fontFamily,
        diagnostics,
      });
    }

    return {
      totalEvaluated: specs.length,
      compliantCount,
      customFontCount,
      results,
    };
  }
}
