import { DiscoveredSectionCandidate, SectionCategory } from './sectionDetector';

export interface ComponentCandidateInput {
  sectionCandidate: DiscoveredSectionCandidate;
  websiteId: string;
  pageId: string;
  sectionId?: string;
  originalHtml?: string;
  originalCss?: string;
  originalJs?: string;
  animations?: Array<{
    id: string;
    name: string;
    type: string;
    affectedElements: string;
  }>;
  resources?: Array<{
    id: string;
    originalUrl: string;
    mimeType: string;
    resourceType: string;
  }>;
  technologies?: Array<{
    id: string;
    name: string;
    category: string;
  }>;
}

export interface ClassifiedComponentCandidate {
  websiteId: string;
  pageId: string;
  sectionId?: string;
  title: string;
  category: SectionCategory;
  description: string;
  status: 'candidate';
  extractionStage: 'IDENTIFIED';
  previewUrl?: string;
  originalHtml?: string;
  originalCss?: string;
  originalJs?: string;
  associatedAnimationIds: string[];
  associatedResourceIds: string[];
  associatedTechnologyIds: string[];
  evidence: {
    domStructureScore: number;
    animationCount: number;
    interactiveBehaviors: string;
    associatedAssetsCount: number;
    detectedTechnologies: string;
    visualCharacteristics: string;
    confidenceScore: number;
  };
}

export class ComponentCandidateClassifier {
  /**
   * Classifies a discovered section candidate into a full ComponentCandidate at stage IDENTIFIED.
   */
  public classifyCandidate(input: ComponentCandidateInput): ClassifiedComponentCandidate {
    const sec = input.sectionCandidate;

    // 1. Structural Analysis -> domStructureScore (0.0 to 10.0)
    const domStructureScore = this.calculateDOMStructureScore(sec);

    // 2. Animation Behavior Mapping
    const matchedAnimations = (input.animations || []).filter((anim) => {
      const targets = anim.affectedElements.toLowerCase();
      return targets.includes(sec.domSelector.toLowerCase()) || targets.includes(sec.domTagName.toLowerCase()) || targets.includes('body');
    });

    // 3. Asset & Resource Mapping
    const matchedResources = input.resources || [];

    // 4. Technology Mapping
    const matchedTechnologies = input.technologies || [];

    // 5. Confidence Score Calculation (0.0 to 1.0)
    const confidenceScore = this.calculateCandidateConfidence(sec, domStructureScore, matchedAnimations.length, matchedResources.length, matchedTechnologies.length);

    const description = `Identified ${sec.primaryCategory} component candidate located at ${sec.domSelector} (${sec.boundsWidth}x${sec.boundsHeight}px, viewport ratio: ${sec.boundsViewportRatio}).`;

    const interactiveBehaviors = matchedAnimations.map((a) => `${a.name} (${a.type})`).join(', ') || 'Static / CSS layout';
    const detectedTechnologiesStr = matchedTechnologies.map((t) => t.name).join(', ') || 'Native HTML/CSS';
    const visualCharacteristics = `Primary: ${sec.primaryCategory}${sec.secondaryCategories.length > 0 ? '; Secondary: ' + sec.secondaryCategories.join(', ') : ''}; Bounds: ${sec.boundsWidth}x${sec.boundsHeight}px`;

    return {
      websiteId: input.websiteId,
      pageId: input.pageId,
      sectionId: input.sectionId,
      title: sec.title,
      category: sec.primaryCategory,
      description,
      status: 'candidate',
      extractionStage: 'IDENTIFIED',
      previewUrl: sec.previewScreenshot,
      originalHtml: input.originalHtml || `<${sec.domTagName.toLowerCase()} class="${sec.domSelector}">${sec.title}</${sec.domTagName.toLowerCase()}>`,
      originalCss: input.originalCss || '',
      originalJs: input.originalJs || '',
      associatedAnimationIds: matchedAnimations.map((a) => a.id),
      associatedResourceIds: matchedResources.map((r) => r.id),
      associatedTechnologyIds: matchedTechnologies.map((t) => t.id),
      evidence: {
        domStructureScore,
        animationCount: matchedAnimations.length,
        interactiveBehaviors,
        associatedAssetsCount: matchedResources.length,
        detectedTechnologies: detectedTechnologiesStr,
        visualCharacteristics,
        confidenceScore,
      },
    };
  }

  private calculateDOMStructureScore(sec: DiscoveredSectionCandidate): number {
    let score = 5.0;

    // Node depth contribution
    if (sec.domDepth >= 2 && sec.domDepth <= 8) score += 1.5;
    // Child count contribution
    if (sec.childCount >= 3 && sec.childCount <= 50) score += 2.0;
    // Bounds ratio contribution
    if (sec.boundsViewportRatio >= 0.2 && sec.boundsViewportRatio <= 1.0) score += 1.5;

    return Math.min(Number(score.toFixed(1)), 10.0);
  }

  private calculateCandidateConfidence(
    sec: DiscoveredSectionCandidate,
    domScore: number,
    animCount: number,
    resourceCount: number,
    techCount: number
  ): number {
    let conf = sec.confidence;

    if (domScore >= 7.0) conf += 0.05;
    if (animCount > 0) conf += 0.05;
    if (resourceCount > 0) conf += 0.05;
    if (techCount > 0) conf += 0.05;

    return Math.min(Number(conf.toFixed(2)), 0.98);
  }
}
