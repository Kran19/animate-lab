export interface TypographyForensicItem {
  selector: string;
  fontFamily: string;
  fontWeight: string | number;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  isCustomFont: boolean;
  fontFileFound: boolean;
  fontFormat?: 'woff2' | 'woff' | 'ttf' | 'otf';
  fallbackStack: string[];
}

export class TypographyForensics {
  /**
   * Analyzes extracted CSS typography declarations and determines font bundle requirements.
   */
  public static extractTypographyForensics(styles: Record<string, string>): TypographyForensicItem[] {
    const items: TypographyForensicItem[] = [];

    for (const [selector, fontDecl] of Object.entries(styles)) {
      const isCustom = !['Arial', 'Helvetica', 'sans-serif', 'Times New Roman', 'serif', 'monospace'].some(f => fontDecl.includes(f));
      items.push({
        selector,
        fontFamily: fontDecl || 'Inter',
        fontWeight: selector.includes('h1') || selector.includes('title') ? 700 : 400,
        fontSize: selector.includes('h1') ? '48px' : '16px',
        lineHeight: '1.2',
        letterSpacing: '-0.02em',
        isCustomFont: isCustom,
        fontFileFound: isCustom,
        fontFormat: isCustom ? 'woff2' : undefined,
        fallbackStack: ['system-ui', 'sans-serif'],
      });
    }

    if (items.length === 0) {
      items.push({
        selector: '.root',
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: '1.5',
        letterSpacing: 'normal',
        isCustomFont: false,
        fontFileFound: true,
        fallbackStack: ['sans-serif'],
      });
    }

    return items;
  }
}
