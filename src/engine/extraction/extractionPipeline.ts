import { PrismaClient } from '@prisma/client';
import { SectionDetector, DOMNodeInfo, DiscoveredSectionCandidate } from './sectionDetector';
import { ComponentCandidateClassifier, ClassifiedComponentCandidate } from './componentCandidateClassifier';

export interface ExtractionPipelineInput {
  websiteId: string;
  pageId: string;
  domNodes: DOMNodeInfo[];
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

export interface ExtractionPipelineResult {
  websiteId: string;
  pageId: string;
  status: 'completed' | 'failed';
  sectionsCreatedCount: number;
  candidatesCreatedCount: number;
  sections: DiscoveredSectionCandidate[];
  candidates: ClassifiedComponentCandidate[];
  errorMessage?: string;
}

export class ExtractionPipeline {
  private prisma: PrismaClient;
  private sectionDetector: SectionDetector;
  private classifier: ComponentCandidateClassifier;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.sectionDetector = new SectionDetector();
    this.classifier = new ComponentCandidateClassifier();
  }

  public async runExtraction(input: ExtractionPipelineInput): Promise<ExtractionPipelineResult> {
    let status: 'completed' | 'failed' = 'completed';
    let errorMessage: string | undefined;

    const sections = this.sectionDetector.detectSections(input.domNodes);
    const candidates: ClassifiedComponentCandidate[] = [];

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const sec of sections) {
          // 1. Save Section record
          const dbSection = await tx.section.create({
            data: {
              websiteId: input.websiteId,
              pageId: input.pageId,
              title: sec.title,
              category: sec.primaryCategory,
              domSelector: sec.domSelector,
              domTagName: sec.domTagName,
              boundsX: sec.boundsX,
              boundsY: sec.boundsY,
              boundsWidth: sec.boundsWidth,
              boundsHeight: sec.boundsHeight,
              boundsViewportRatio: sec.boundsViewportRatio,
              previewScreenshot: sec.previewScreenshot || null,
              isComponentCandidate: sec.isComponentCandidate,
            },
          });

          // 2. Classify ComponentCandidate
          const classified = this.classifier.classifyCandidate({
            sectionCandidate: sec,
            websiteId: input.websiteId,
            pageId: input.pageId,
            sectionId: dbSection.id,
            animations: input.animations,
            resources: input.resources,
            technologies: input.technologies,
          });

          candidates.push(classified);

          // 3. Save ComponentCandidate record (IDENTIFIED stage)
          const dbCandidate = await tx.componentCandidate.create({
            data: {
              websiteId: input.websiteId,
              pageId: input.pageId,
              sectionId: dbSection.id,
              title: classified.title,
              category: classified.category,
              description: classified.description,
              status: 'candidate',
              extractionStage: 'IDENTIFIED',
              previewUrl: classified.previewUrl || null,
              originalHtml: classified.originalHtml || null,
              originalCss: classified.originalCss || null,
              originalJs: classified.originalJs || null,
            },
          });

          // 4. Save ComponentEvidence
          await tx.componentEvidence.create({
            data: {
              componentCandidateId: dbCandidate.id,
              domStructureScore: classified.evidence.domStructureScore,
              animationCount: classified.evidence.animationCount,
              interactiveBehaviors: classified.evidence.interactiveBehaviors,
              associatedAssetsCount: classified.evidence.associatedAssetsCount,
              detectedTechnologies: classified.evidence.detectedTechnologies,
              visualCharacteristics: classified.evidence.visualCharacteristics,
              confidenceScore: classified.evidence.confidenceScore,
            },
          });

          // 5. Relational links: ComponentAnimation
          for (const animId of classified.associatedAnimationIds) {
            await tx.componentAnimation.create({
              data: {
                componentId: dbCandidate.id,
                animationId: animId,
              },
            });
          }

          // 6. Relational links: ComponentResource
          for (const resId of classified.associatedResourceIds) {
            await tx.componentResource.create({
              data: {
                componentId: dbCandidate.id,
                resourceId: resId,
              },
            });
          }

          // 7. Relational links: ComponentTechnology
          for (const techId of classified.associatedTechnologyIds) {
            await tx.componentTechnology.create({
              data: {
                componentId: dbCandidate.id,
                technologyId: techId,
              },
            });
          }
        }

        // Update Page & Website counters
        await tx.page.update({
          where: { id: input.pageId },
          data: {
            sectionCount: { increment: sections.length },
            componentCount: { increment: candidates.length },
          },
        });

        await tx.website.update({
          where: { id: input.websiteId },
          data: {
            totalSections: { increment: sections.length },
            totalComponents: { increment: candidates.length },
          },
        });
      });
    } catch (err: any) {
      status = 'failed';
      errorMessage = `Extraction transaction error: ${err.message}`;
    }

    return {
      websiteId: input.websiteId,
      pageId: input.pageId,
      status,
      sectionsCreatedCount: sections.length,
      candidatesCreatedCount: candidates.length,
      sections,
      candidates,
      errorMessage,
    };
  }
}
