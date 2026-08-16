export interface ViewportDefinition {
  name: 'Desktop' | 'Laptop' | 'Tablet' | 'Mobile' | 'UltraWide';
  width: number;
  height: number;
}

export const STANDARD_VIEWPORTS: ViewportDefinition[] = [
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Laptop', width: 1024, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 812 },
];

export interface ViewportValidationResult {
  viewport: ViewportDefinition;
  hasHorizontalOverflow: boolean;
  hasClippedContent: boolean;
  contentHeightPx: number;
  status: 'PASS' | 'PARTIAL' | 'FAIL';
  diagnostics?: string;
}

export class ViewportValidator {
  /**
   * Validates section layout stability across standard responsive viewports.
   */
  public static validateViewports(
    sectionWidthPx: number,
    sectionHeightPx: number,
    isDesktopOnly: boolean = false
  ): ViewportValidationResult[] {
    return STANDARD_VIEWPORTS.map((vp) => {
      // Check if section exceeds viewport width (horizontal overflow)
      const hasHorizontalOverflow = sectionWidthPx > vp.width + 10 && !isDesktopOnly;
      const isMobileFailing = vp.name === 'Mobile' && isDesktopOnly;

      let status: ViewportValidationResult['status'] = 'PASS';
      if (isMobileFailing) {
        status = 'PARTIAL';
      } else if (hasHorizontalOverflow) {
        status = 'FAIL';
      }

      return {
        viewport: vp,
        hasHorizontalOverflow,
        hasClippedContent: false,
        contentHeightPx: sectionHeightPx,
        status,
        diagnostics: status !== 'PASS' ? `Layout constrained at ${vp.width}px.` : undefined,
      };
    });
  }
}
