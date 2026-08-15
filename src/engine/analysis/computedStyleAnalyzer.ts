export interface TargetedComputedStyle {
  transform?: string;
  opacity?: string;
  filter?: string;
  clipPath?: string;
  width?: string;
  height?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  color?: string;
  background?: string;
  border?: string;
  letterSpacing?: string;
  fontSize?: string;
  scale?: string;
  rotate?: string;
}

export const TARGET_ANIMATABLE_PROPERTIES = [
  'transform',
  'opacity',
  'filter',
  'clip-path',
  'width',
  'height',
  'top',
  'left',
  'right',
  'bottom',
  'color',
  'background',
  'border',
  'letter-spacing',
  'font-size',
  'scale',
  'rotate',
];

export class ComputedStyleAnalyzer {
  /**
   * Returns a lightweight JS object containing only the targeted animatable computed styles.
   */
  public static extractTargetedStyles(styleDeclaration: Record<string, string>): TargetedComputedStyle {
    const result: TargetedComputedStyle = {};

    if (styleDeclaration.transform && styleDeclaration.transform !== 'none') {
      result.transform = styleDeclaration.transform;
    }
    if (styleDeclaration.opacity && styleDeclaration.opacity !== '1') {
      result.opacity = styleDeclaration.opacity;
    }
    if (styleDeclaration.filter && styleDeclaration.filter !== 'none') {
      result.filter = styleDeclaration.filter;
    }
    if (styleDeclaration['clip-path'] && styleDeclaration['clip-path'] !== 'none') {
      result.clipPath = styleDeclaration['clip-path'];
    }
    if (styleDeclaration.width) {
      result.width = styleDeclaration.width;
    }
    if (styleDeclaration.height) {
      result.height = styleDeclaration.height;
    }
    if (styleDeclaration.top && styleDeclaration.top !== 'auto') {
      result.top = styleDeclaration.top;
    }
    if (styleDeclaration.left && styleDeclaration.left !== 'auto') {
      result.left = styleDeclaration.left;
    }
    if (styleDeclaration.right && styleDeclaration.right !== 'auto') {
      result.right = styleDeclaration.right;
    }
    if (styleDeclaration.bottom && styleDeclaration.bottom !== 'auto') {
      result.bottom = styleDeclaration.bottom;
    }
    if (styleDeclaration.color) {
      result.color = styleDeclaration.color;
    }
    if (styleDeclaration.background) {
      result.background = styleDeclaration.background;
    }
    if (styleDeclaration.border) {
      result.border = styleDeclaration.border;
    }
    if (styleDeclaration['letter-spacing'] && styleDeclaration['letter-spacing'] !== 'normal') {
      result.letterSpacing = styleDeclaration['letter-spacing'];
    }
    if (styleDeclaration['font-size']) {
      result.fontSize = styleDeclaration['font-size'];
    }
    if (styleDeclaration.scale && styleDeclaration.scale !== 'none') {
      result.scale = styleDeclaration.scale;
    }
    if (styleDeclaration.rotate && styleDeclaration.rotate !== 'none') {
      result.rotate = styleDeclaration.rotate;
    }

    return result;
  }
}
