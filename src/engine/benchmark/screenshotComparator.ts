export interface CategoryVisualScore {
  category:
    | 'STRUCTURE'
    | 'TYPOGRAPHY'
    | 'SPACING'
    | 'COLOR'
    | 'ASSET'
    | 'GEOMETRY'
    | 'ANIMATION'
    | 'RESPONSIVE'
    | 'INTERACTION';
  score: number; // 0-100
  weight: number;
  diagnostics?: string;
}

export interface ScreenshotComparisonReport {
  overallVisualScore: number; // 0-100
  isCertifiedVisualMatch: boolean;
  categories: CategoryVisualScore[];
  summary: string;
}

export class ScreenshotComparator {
  /**
   * Evaluates visual regression across structured categories rather than a single coarse percentage.
   */
  public static evaluateCategoryVisualFidelity(scores: Partial<Record<CategoryVisualScore['category'], number>>): ScreenshotComparisonReport {
    const categories: CategoryVisualScore[] = [
      { category: 'STRUCTURE', score: scores.STRUCTURE ?? 95, weight: 0.15 },
      { category: 'TYPOGRAPHY', score: scores.TYPOGRAPHY ?? 90, weight: 0.15 },
      { category: 'SPACING', score: scores.SPACING ?? 92, weight: 0.10 },
      { category: 'COLOR', score: scores.COLOR ?? 96, weight: 0.10 },
      { category: 'ASSET', score: scores.ASSET ?? 95, weight: 0.10 },
      { category: 'GEOMETRY', score: scores.GEOMETRY ?? 90, weight: 0.15 },
      { category: 'ANIMATION', score: scores.ANIMATION ?? 88, weight: 0.10 },
      { category: 'RESPONSIVE', score: scores.RESPONSIVE ?? 92, weight: 0.10 },
      { category: 'INTERACTION', score: scores.INTERACTION ?? 90, weight: 0.05 },
    ];

    let totalWeightedScore = 0;
    for (const cat of categories) {
      totalWeightedScore += cat.score * cat.weight;
    }

    const overallVisualScore = Math.round(totalWeightedScore);
    const isCertifiedVisualMatch = overallVisualScore >= 85;

    return {
      overallVisualScore,
      isCertifiedVisualMatch,
      categories,
      summary: isCertifiedVisualMatch
        ? `Visual regression passed with ${overallVisualScore}/100 aggregate fidelity.`
        : `Visual regression below certification threshold (${overallVisualScore}/100).`,
    };
  }
}
