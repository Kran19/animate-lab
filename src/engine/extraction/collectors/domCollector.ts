import { FIRDOM, FIRDOMNode } from '../../domain/fir/sectionFIR';

export interface RawDOMNodeObservation {
  tagName: string;
  id?: string;
  classList?: string[];
  attributes?: Record<string, string>;
  textContent?: string;
  computedSelector: string;
  isSelfClosing?: boolean;
  children?: RawDOMNodeObservation[];
}

export interface DOMCollectionInput {
  sectionId: string;
  domSelector: string;
  domTagName: string;
  rawHtml: string;
  rootNode?: RawDOMNodeObservation;
}

export class DOMEvidenceCollector {
  /**
   * Collects isolated, immutable DOM evidence without mutating any shared state.
   */
  public static collect(input: DOMCollectionInput): FIRDOM {
    const rawHtmlSnapshot = input.rawHtml || `<section id="${input.sectionId}"><div>Default Section Content</div></section>`;
    const sanitizedHtmlSnapshot = this.sanitizeHtml(rawHtmlSnapshot);
    const nodeCount = Math.max(1, (sanitizedHtmlSnapshot.match(/<[a-zA-Z0-9]+/g) || []).length);

    const rootNode: FIRDOMNode = input.rootNode
      ? this.mapRawNodeToFIR(input.rootNode, `${input.sectionId}-root`)
      : {
          nodeId: `${input.sectionId}-root`,
          tagName: input.domTagName || 'SECTION',
          attributes: {},
          classList: [],
          id: input.sectionId,
          isSelfClosing: false,
          children: [],
          computedSelector: input.domSelector,
        };

    return {
      rawHtmlSnapshot,
      sanitizedHtmlSnapshot,
      nodeCount,
      rootNode,
    };
  }

  private static mapRawNodeToFIR(node: RawDOMNodeObservation, idPrefix: string): FIRDOMNode {
    return {
      nodeId: idPrefix,
      tagName: node.tagName.toUpperCase(),
      attributes: node.attributes || {},
      classList: node.classList || [],
      id: node.id,
      textContent: node.textContent,
      isSelfClosing: !!node.isSelfClosing,
      children: (node.children || []).map((c, idx) => this.mapRawNodeToFIR(c, `${idPrefix}-${idx}`)),
      computedSelector: node.computedSelector,
    };
  }

  private static sanitizeHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/data-reactroot=""?/gi, '')
      .replace(/data-hydrate=""?/gi, '')
      .trim();
  }
}
