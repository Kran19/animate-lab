import { Page } from 'playwright';

export interface ComputedStyleNode {
  tag: string;
  id?: string;
  className?: string;
  rect: { x: number; y: number; width: number; height: number };
  styles: Record<string, string>;
  pseudoBefore?: Record<string, string>;
  pseudoAfter?: Record<string, string>;
  children?: ComputedStyleNode[];
}

export class ComputedStyleTreeExtractor {
  public static async extractNodeTree(page: Page, selector: string): Promise<ComputedStyleNode | null> {
    return page.evaluate((sel) => {
      const root = document.querySelector(sel);
      if (!root) return null;

      const meaningfulProps = [
        'display',
        'position',
        'top',
        'left',
        'right',
        'bottom',
        'width',
        'height',
        'min-width',
        'min-height',
        'max-width',
        'max-height',
        'margin',
        'padding',
        'box-sizing',
        'background-color',
        'background-image',
        'background-size',
        'background-position',
        'color',
        'font-family',
        'font-size',
        'font-weight',
        'line-height',
        'letter-spacing',
        'text-align',
        'text-transform',
        'border',
        'border-radius',
        'box-shadow',
        'transform',
        'opacity',
        'filter',
        'backdrop-filter',
        'clip-path',
        'z-index',
        'overflow',
        'flex-direction',
        'justify-content',
        'align-items',
        'grid-template-columns',
        'grid-gap',
        'gap',
      ];

      function extractElement(el: Element, depth = 0): ComputedStyleNode | null {
        if (depth > 8) return null; // bounded depth
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        const styles: Record<string, string> = {};
        meaningfulProps.forEach((prop) => {
          const val = style.getPropertyValue(prop);
          if (val && val !== 'none' && val !== 'auto' && val !== 'normal' && val !== 'rgba(0, 0, 0, 0)') {
            styles[prop] = val;
          }
        });

        // Pseudo elements
        let pseudoBefore: Record<string, string> | undefined;
        const beforeStyle = window.getComputedStyle(el, '::before');
        const beforeContent = beforeStyle.getPropertyValue('content');
        if (beforeContent && beforeContent !== 'none' && beforeContent !== '""') {
          pseudoBefore = {
            content: beforeContent,
            display: beforeStyle.getPropertyValue('display'),
            position: beforeStyle.getPropertyValue('position'),
            background: beforeStyle.getPropertyValue('background-color'),
          };
        }

        let pseudoAfter: Record<string, string> | undefined;
        const afterStyle = window.getComputedStyle(el, '::after');
        const afterContent = afterStyle.getPropertyValue('content');
        if (afterContent && afterContent !== 'none' && afterContent !== '""') {
          pseudoAfter = {
            content: afterContent,
            display: afterStyle.getPropertyValue('display'),
            position: afterStyle.getPropertyValue('position'),
            background: afterStyle.getPropertyValue('background-color'),
          };
        }

        const children: ComputedStyleNode[] = [];
        Array.from(el.children).forEach((child) => {
          const node = extractElement(child, depth + 1);
          if (node) children.push(node);
        });

        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || undefined,
          className: el.className ? el.className.toString() : undefined,
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y + window.scrollY),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          styles,
          pseudoBefore,
          pseudoAfter,
          children: children.length > 0 ? children : undefined,
        };
      }

      return extractElement(root);
    }, selector);
  }
}
