import { PrismaClient } from '@prisma/client';
import { TechnologyDetector, DetectedTechnology, TechnologyDetectionInput } from './technologyDetector';
import { AnimationAnalyzer, DiscoveredAnimation, AnimationAnalysisInput } from './animationAnalyzer';
import { ThreeDAnalyzer, DiscoveredThreeDExperience, ThreeDAnalysisInput } from './threeDAnalyzer';

export interface AnalysisPipelineConfig {
  preset: 'quick' | 'standard' | '3d-heavy' | 'custom';
  analyzerTimeoutMs: number;
  maxObservations: number;
  samplingIntervalMs: number;
}

export const PRESET_CONFIGS: Record<AnalysisPipelineConfig['preset'], AnalysisPipelineConfig> = {
  quick: {
    preset: 'quick',
    analyzerTimeoutMs: 5000,
    maxObservations: 100,
    samplingIntervalMs: 100,
  },
  standard: {
    preset: 'standard',
    analyzerTimeoutMs: 15000,
    maxObservations: 500,
    samplingIntervalMs: 50,
  },
  '3d-heavy': {
    preset: '3d-heavy',
    analyzerTimeoutMs: 30000,
    maxObservations: 2000,
    samplingIntervalMs: 16,
  },
  custom: {
    preset: 'custom',
    analyzerTimeoutMs: 15000,
    maxObservations: 500,
    samplingIntervalMs: 50,
  },
};

export interface PageAnalysisInput {
  websiteId: string;
  pageId: string;
  url: string;
  htmlContent: string;
  scriptUrls: string[];
  networkUrls: string[];
  windowGlobals: string[];
  cssRules?: AnimationAnalysisInput['cssRules'];
  waapiAnimations?: AnimationAnalysisInput['waapiAnimations'];
  gsapState?: AnimationAnalysisInput['gsapState'];
  interactionsObserved?: AnimationAnalysisInput['interactionsObserved'];
  continuousLoopsObserved?: AnimationAnalysisInput['continuousLoopsObserved'];
  canvases?: ThreeDAnalysisInput['canvases'];
  threeState?: ThreeDAnalysisInput['threeState'];
  babylonState?: ThreeDAnalysisInput['babylonState'];
  phase6Resources?: ThreeDAnalysisInput['phase6Resources'];
}

export interface AnalysisPipelineResult {
  websiteId: string;
  pageId: string;
  status: 'completed' | 'partial' | 'failed' | 'unsupported';
  technologies: DetectedTechnology[];
  animations: DiscoveredAnimation[];
  threeDExperience: DiscoveredThreeDExperience | null;
  errorMessage?: string;
}

export class AnalysisPipeline {
  private prisma: PrismaClient;
  private techDetector: TechnologyDetector;
  private animAnalyzer: AnimationAnalyzer;
  private threeDAnalyzer: ThreeDAnalyzer;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.techDetector = new TechnologyDetector();
    this.animAnalyzer = new AnimationAnalyzer();
    this.threeDAnalyzer = new ThreeDAnalyzer();
  }

  public async runAnalysis(
    input: PageAnalysisInput,
    config: AnalysisPipelineConfig = PRESET_CONFIGS.standard
  ): Promise<AnalysisPipelineResult> {
    let status: 'completed' | 'partial' | 'failed' | 'unsupported' = 'completed';
    let errorMessage: string | undefined;

    let technologies: DetectedTechnology[] = [];
    let animations: DiscoveredAnimation[] = [];
    let threeDExperience: DiscoveredThreeDExperience | null = null;

    try {
      // 1. Technology Detection
      const techInput: TechnologyDetectionInput = {
        htmlContent: input.htmlContent,
        scriptUrls: input.scriptUrls,
        networkUrls: input.networkUrls,
        windowGlobals: input.windowGlobals,
        domAttributes: {},
      };
      technologies = this.techDetector.detectTechnologies(techInput);
    } catch (err: any) {
      status = 'partial';
      errorMessage = `Technology detection error: ${err.message}`;
    }

    try {
      // 2. Animation Analysis
      const animInput: AnimationAnalysisInput = {
        cssRules: input.cssRules || [],
        waapiAnimations: input.waapiAnimations || [],
        gsapState: input.gsapState,
        interactionsObserved: input.interactionsObserved || [],
        continuousLoopsObserved: input.continuousLoopsObserved || [],
      };
      animations = this.animAnalyzer.analyzeAnimations(animInput);
    } catch (err: any) {
      status = 'partial';
      errorMessage = errorMessage ? `${errorMessage}; Animation analysis error: ${err.message}` : `Animation analysis error: ${err.message}`;
    }

    try {
      // 3. WebGL / 3D Analysis
      const threeDInput: ThreeDAnalysisInput = {
        canvases: input.canvases || [],
        threeState: input.threeState,
        babylonState: input.babylonState,
        phase6Resources: input.phase6Resources || [],
      };
      threeDExperience = this.threeDAnalyzer.analyzeThreeD(threeDInput);
    } catch (err: any) {
      status = 'partial';
      errorMessage = errorMessage ? `${errorMessage}; 3D analysis error: ${err.message}` : `3D analysis error: ${err.message}`;
    }

    // 4. Atomic Prisma Transaction Commit
    try {
      await this.prisma.$transaction(async (tx) => {
        // Save Technology & Evidence
        for (const tech of technologies) {
          const dbTech = await tx.technology.upsert({
            where: { name: tech.name },
            create: {
              name: tech.name,
              category: tech.category,
              version: tech.version || null,
              iconName: tech.iconName,
              description: tech.description,
              websiteCount: 1,
            },
            update: {
              version: tech.version || undefined,
            },
          });

          for (const ev of tech.evidence) {
            await tx.technologyEvidence.create({
              data: {
                technologyId: dbTech.id,
                websiteId: input.websiteId,
                pageId: input.pageId,
                source: ev.source,
                evidenceType: ev.evidenceType,
                evidenceValue: ev.evidenceValue,
                confidence: ev.confidence,
              },
            });
          }
        }

        // Save Animations & Evidence
        for (const anim of animations) {
          const dbAnim = await tx.animation.create({
            data: {
              websiteId: input.websiteId,
              pageId: input.pageId,
              name: anim.name,
              type: anim.type,
              library: anim.library,
              affectedElements: JSON.stringify(anim.affectedElements),
              durationMs: anim.durationMs,
              delayMs: anim.delayMs,
              easing: anim.easing,
              trigger: anim.trigger,
              animatedProperties: JSON.stringify(anim.animatedProperties),
              codeSnippet: anim.codeSnippet || '',
            },
          });

          await tx.animationEvidence.create({
            data: {
              animationId: dbAnim.id,
              runtimeEvidence: anim.evidence.runtimeEvidence,
              domEvidence: anim.evidence.domEvidence,
              scriptEvidence: anim.evidence.scriptEvidence,
              networkEvidence: anim.evidence.networkEvidence || null,
              confidence: anim.evidence.confidence,
            },
          });
        }

        // Save ThreeDExperience
        if (threeDExperience) {
          await tx.threeDExperience.create({
            data: {
              websiteId: input.websiteId,
              pageId: input.pageId,
              title: threeDExperience.title,
              type: threeDExperience.type,
              canvasCount: threeDExperience.canvasCount,
              webGlContextType: threeDExperience.webGlContextType,
              fpsEstimate: threeDExperience.fpsEstimate,
              shaderCount: threeDExperience.shaderCount,
              modelCount: threeDExperience.modelCount,
              textureCount: threeDExperience.textureCount,
              modelsJson: threeDExperience.modelsJson,
              texturesJson: threeDExperience.texturesJson,
              shaderSnippetsJson: threeDExperience.shaderSnippetsJson,
              status: threeDExperience.status,
              statusNotes: threeDExperience.statusNotes,
              previewImage: threeDExperience.previewImage || null,
            },
          });
        }

        // Update Website & Page counts
        await tx.page.update({
          where: { id: input.pageId },
          data: {
            status,
            animationCount: animations.length,
            threeDCount: threeDExperience ? 1 : 0,
            lastAnalyzedAt: new Date(),
          },
        });

        await tx.website.update({
          where: { id: input.websiteId },
          data: {
            totalAnimations: { increment: animations.length },
            total3D: { increment: threeDExperience ? 1 : 0 },
            lastAnalyzedAt: new Date(),
          },
        });
      });
    } catch (txErr: any) {
      status = 'failed';
      errorMessage = `Database transaction commit error: ${txErr.message}`;
    }

    return {
      websiteId: input.websiteId,
      pageId: input.pageId,
      status,
      technologies,
      animations,
      threeDExperience,
      errorMessage,
    };
  }
}
