export interface ElementGeometryBox {
  selector: string;
  tagName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  textSnippet?: string;
  backgroundColor?: string;
}

export interface VisualComparisonInput {
  sourceElements: ElementGeometryBox[];
  renderedElements: ElementGeometryBox[];
  tolerancePx?: number;
}

export interface VisualComparisonResult {
  similarityScore: number; // 0-100
  matchedCount: number;
  unmatchedCount: number;
  geometryDiscrepancies: Array<{
    selector: string;
    sourceBox: { x: number; y: number; width: number; height: number };
    renderedBox?: { x: number; y: number; width: number; height: number };
    diffPx: number;
  }>;
  isVisualMatch: boolean;
}

export class VisualRegressionEngine {
  /**
   * Performs deterministic geometry and layout alignment comparison between source captured DOM and rendered extracted React component.
   */
  public static compareGeometry(input: VisualComparisonInput): VisualComparisonResult {
    const tolerance = input.tolerancePx || 12; // 12px layout tolerance
    let matchedCount = 0;
    const discrepancies: VisualComparisonResult['geometryDiscrepancies'] = [];

    const sourceMap = new Map<string, ElementGeometryBox>();
    for (const el of input.sourceElements) {
      sourceMap.set(el.selector, el);
    }

    const renderedMap = new Map<string, ElementGeometryBox>();
    for (const el of input.renderedElements) {
      renderedMap.set(el.selector, el);
    }

    for (const [sel, srcBox] of sourceMap.entries()) {
      const rendBox = renderedMap.get(sel);
      if (!rendBox) {
        discrepancies.push({
          selector: sel,
          sourceBox: { x: srcBox.x, y: srcBox.y, width: srcBox.width, height: srcBox.height },
          diffPx: srcBox.width + srcBox.height,
        });
        continue;
      }

      // Compute bounding box delta
      const deltaX = Math.abs(srcBox.x - rendBox.x);
      const deltaY = Math.abs(srcBox.y - rendBox.y);
      const deltaW = Math.abs(srcBox.width - rendBox.width);
      const deltaH = Math.abs(srcBox.height - rendBox.height);
      const totalDelta = deltaX + deltaY + deltaW + deltaH;

      if (totalDelta <= tolerance * 4) {
        matchedCount++;
      } else {
        discrepancies.push({
          selector: sel,
          sourceBox: { x: srcBox.x, y: srcBox.y, width: srcBox.width, height: srcBox.height },
          renderedBox: { x: rendBox.x, y: rendBox.y, width: rendBox.width, height: rendBox.height },
          diffPx: totalDelta,
        });
      }
    }

    const totalElements = Math.max(1, input.sourceElements.length);
    const similarityScore = Math.min(100, Math.round((matchedCount / totalElements) * 100));

    return {
      similarityScore,
      matchedCount,
      unmatchedCount: discrepancies.length,
      geometryDiscrepancies: discrepancies,
      isVisualMatch: similarityScore >= 80,
    };
  }
}
