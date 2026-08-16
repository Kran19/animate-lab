export interface DimensionScore {
  name: string;
  score: number; // 0.0 to 1.0 (0% to 100%)
  weight: number; // 0.0 to 1.0 (sums to 1.0)
  weightedContribution: number;
}

export interface PerceptualScorecardInput {
  domLayoutScore: number;
  typographyScore: number;
  assetScore: number;
  animationFidelityScore: number;
  interactionScore: number;
  visualSimilarityScore: number;
  dependencyScore: number;
}

export interface PerceptualScorecardResult {
  compositeScore: number; // 0.0 to 100.0%
  grade: 'A+' | 'A' | 'B' | 'C' | 'PARTIAL' | 'FAILED';
  disposition: 'COPY_USE_CERTIFIED' | 'COPY_USE_PARTIAL' | 'COPY_USE_FAILED';
  dimensions: DimensionScore[];
  summary: string;
}

export class PerceptualScorecardEngine {
  public static readonly WEIGHTS = {
    DOM_LAYOUT: 0.15,
    TYPOGRAPHY: 0.10,
    ASSETS: 0.10,
    ANIMATION: 0.25,
    INTERACTION: 0.15,
    VISUAL_SIMILARITY: 0.20,
    DEPENDENCIES: 0.05,
  };

  /**
   * Calculates a perceptually-weighted certification scorecard across the 7 core dimensions.
   */
  public static calculate(input: PerceptualScorecardInput): PerceptualScorecardResult {
    const dims: DimensionScore[] = [
      {
        name: 'DOM & Semantic Layout',
        score: input.domLayoutScore,
        weight: this.WEIGHTS.DOM_LAYOUT,
        weightedContribution: input.domLayoutScore * this.WEIGHTS.DOM_LAYOUT,
      },
      {
        name: 'Typography & Kerning',
        score: input.typographyScore,
        weight: this.WEIGHTS.TYPOGRAPHY,
        weightedContribution: input.typographyScore * this.WEIGHTS.TYPOGRAPHY,
      },
      {
        name: 'Asset Completeness & Hashes',
        score: input.assetScore,
        weight: this.WEIGHTS.ASSETS,
        weightedContribution: input.assetScore * this.WEIGHTS.ASSETS,
      },
      {
        name: 'Animation & Motion Graph Fidelity',
        score: input.animationFidelityScore,
        weight: this.WEIGHTS.ANIMATION,
        weightedContribution: input.animationFidelityScore * this.WEIGHTS.ANIMATION,
      },
      {
        name: 'Interaction State Machine Recovery',
        score: input.interactionScore,
        weight: this.WEIGHTS.INTERACTION,
        weightedContribution: input.interactionScore * this.WEIGHTS.INTERACTION,
      },
      {
        name: 'Visual Similarity & Layout Containment',
        score: input.visualSimilarityScore,
        weight: this.WEIGHTS.VISUAL_SIMILARITY,
        weightedContribution: input.visualSimilarityScore * this.WEIGHTS.VISUAL_SIMILARITY,
      },
      {
        name: 'Runtime Dependencies & Zero-Leak Scoping',
        score: input.dependencyScore,
        weight: this.WEIGHTS.DEPENDENCIES,
        weightedContribution: input.dependencyScore * this.WEIGHTS.DEPENDENCIES,
      },
    ];

    const rawComposite = dims.reduce((acc, curr) => acc + curr.weightedContribution, 0);
    const compositeScore = Number((rawComposite * 100).toFixed(1));

    let grade: PerceptualScorecardResult['grade'] = 'A+';
    let disposition: PerceptualScorecardResult['disposition'] = 'COPY_USE_CERTIFIED';

    if (compositeScore >= 95.0) {
      grade = 'A+';
      disposition = 'COPY_USE_CERTIFIED';
    } else if (compositeScore >= 90.0) {
      grade = 'A';
      disposition = 'COPY_USE_CERTIFIED';
    } else if (compositeScore >= 80.0) {
      grade = 'B';
      disposition = 'COPY_USE_CERTIFIED';
    } else if (compositeScore >= 50.0) {
      grade = 'PARTIAL';
      disposition = 'COPY_USE_PARTIAL';
    } else {
      grade = 'FAILED';
      disposition = 'COPY_USE_FAILED';
    }

    const summary = `Composite Perceptual Score: ${compositeScore}% (Grade: ${grade}, Disposition: ${disposition})`;

    return {
      compositeScore,
      grade,
      disposition,
      dimensions: dims,
      summary,
    };
  }
}
