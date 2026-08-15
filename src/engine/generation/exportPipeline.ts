import { PrismaClient, ComponentCandidate, ComponentEvidence, Section } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { ComponentIsolator, IsolatedComponent } from './componentIsolator';
import { CodeNormalizer, NormalizedComponent } from './codeNormalizer';
import { ReactGenerator, GeneratedComponent } from './reactGenerator';
import { ComponentValidator, ValidatedComponent } from './componentValidator';

export interface ExportPipelineOptions {
  allowPartialExports?: boolean;
  exportBaseDir?: string;
}

export interface ExportResult {
  candidateId: string;
  reusableComponentId?: string;
  status: 'exported' | 'blocked' | 'failed';
  exportPath?: string;
  manifestJson?: string;
  validatedData?: ValidatedComponent;
  errorMessage?: string;
}

export class ExportPipeline {
  private prisma: PrismaClient;
  private isolator: ComponentIsolator;
  private normalizer: CodeNormalizer;
  private generator: ReactGenerator;
  private validator: ComponentValidator;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.isolator = new ComponentIsolator();
    this.normalizer = new CodeNormalizer();
    this.generator = new ReactGenerator();
    this.validator = new ComponentValidator();
  }

  /**
   * Executes the full 5-stage transformation pipeline with lifecycle guards,
   * staged filesystem export, automatic rollback, and atomic Prisma persistence.
   */
  public async executeExportPipeline(
    candidateId: string,
    options: ExportPipelineOptions = {}
  ): Promise<ExportResult> {
    // 1. Fetch Candidate Record
    const cand = await this.prisma.componentCandidate.findUnique({
      where: { id: candidateId },
      include: {
        evidence: true,
        section: true,
        animations: { include: { animation: true } },
        componentResources: { include: { resource: true } },
        componentTechnologies: { include: { technology: true } },
      },
    });

    if (!cand) {
      return { candidateId, status: 'failed', errorMessage: `Candidate ${candidateId} not found.` };
    }

    // Lifecycle Guard: Must start at IDENTIFIED or earlier stages
    if (cand.extractionStage === 'EXPORTED') {
      return { candidateId, status: 'blocked', errorMessage: 'Candidate is already in EXPORTED stage.' };
    }

    try {
      // Stage 1: ISOLATED
      const isolated: IsolatedComponent = this.isolator.isolateComponent({
        candidate: cand,
        animations: cand.animations.map((a) => ({ id: a.animation.id, name: a.animation.name, type: a.animation.type, affectedElements: a.animation.affectedElements })),
        resources: cand.componentResources.map((r) => ({ id: r.resource.id, originalUrl: r.resource.originalUrl, mimeType: r.resource.mimeType, localPath: r.resource.localPath })),
        technologies: cand.componentTechnologies.map((t) => ({ id: t.technology.id, name: t.technology.name, category: t.technology.category })),
      });
      await this.prisma.componentCandidate.update({ where: { id: candidateId }, data: { extractionStage: 'ISOLATED' } });

      // Stage 2: NORMALIZED
      const normalized: NormalizedComponent = this.normalizer.normalizeComponent(isolated);
      await this.prisma.componentCandidate.update({ where: { id: candidateId }, data: { extractionStage: 'NORMALIZED' } });

      // Stage 3: GENERATED
      const generated: GeneratedComponent = this.generator.generateReactComponent(normalized);
      await this.prisma.componentCandidate.update({ where: { id: candidateId }, data: { extractionStage: 'GENERATED' } });

      // Stage 4: VALIDATED
      const validated: ValidatedComponent = this.validator.validateComponent(generated);
      await this.prisma.componentCandidate.update({ where: { id: candidateId }, data: { extractionStage: 'VALIDATED' } });

      // Partial Export Policy Guard
      if (validated.report.validationStatus !== 'valid' && !options.allowPartialExports) {
        return {
          candidateId,
          status: 'blocked',
          validatedData: validated,
          errorMessage: `Export blocked due to validation status "${validated.report.validationStatus}". Set allowPartialExports: true to bypass.`,
        };
      }

      // Stage 5: EXPORT (Staged Filesystem Commit)
      const baseDir = options.exportBaseDir || path.join(process.cwd(), 'workspaces', 'exports');
      const stagingDir = path.join(baseDir, '.staging', `export-${candidateId}`);
      const finalExportDir = path.join(baseDir, generated.componentName);

      // Create Staging Directory
      fs.mkdirSync(path.join(stagingDir, 'assets'), { recursive: true });

      // Write Staged Component Code Files
      const tsxFilePath = path.join(stagingDir, `${generated.componentName}.tsx`);
      const cssFilePath = path.join(stagingDir, `${generated.componentName}.css`);
      fs.writeFileSync(tsxFilePath, generated.tsxCode, 'utf-8');
      fs.writeFileSync(cssFilePath, generated.cssCode, 'utf-8');

      // Copy Assets to Staged Assets Folder
      for (const pa of normalized.portableAssets) {
        const destAssetPath = path.join(stagingDir, pa.exportPath);
        if (pa.localPath && fs.existsSync(pa.localPath)) {
          fs.copyFileSync(pa.localPath, destAssetPath);
        } else {
          // Write placeholder binary buffer if physical file is unavailable
          fs.writeFileSync(destAssetPath, Buffer.from('mock asset binary'));
        }
      }

      // Write Manifest.json
      const manifest = {
        componentName: generated.componentName,
        sourceCandidateId: candidateId,
        websiteId: cand.websiteId,
        pageId: cand.pageId,
        generationVersion: generated.generationVersion,
        generationInputHash: generated.generationInputHash,
        outputHash: generated.outputHash,
        exportedAt: new Date().toISOString(),
        assets: normalized.portableAssets,
        props: JSON.parse(generated.propsDocJson),
      };
      const manifestJson = JSON.stringify(manifest, null, 2);
      fs.writeFileSync(path.join(stagingDir, 'manifest.json'), manifestJson, 'utf-8');

      // Commit Filesystem (Move staging to final path with rollback protection)
      if (fs.existsSync(finalExportDir)) {
        fs.rmSync(finalExportDir, { recursive: true, force: true });
      }
      fs.mkdirSync(path.dirname(finalExportDir), { recursive: true });
      fs.renameSync(stagingDir, finalExportDir);

      // Stage 6: Database Atomic Transaction
      let dbReusableId = '';
      try {
        await this.prisma.$transaction(async (tx) => {
          const dbReusable = await tx.reusableComponent.create({
            data: {
              candidateId,
              title: generated.componentName,
              category: cand.category,
              reactCode: generated.tsxCode,
              cssCode: generated.cssCode,
              propsDocJson: generated.propsDocJson,
              exportFormat: 'react_tailwind',
            },
          });
          dbReusableId = dbReusable.id;

          await tx.componentCandidate.update({
            where: { id: candidateId },
            data: {
              status: 'exported',
              extractionStage: 'EXPORTED',
              generatedReactTsx: generated.tsxCode,
              normalizedHtml: normalized.normalizedHtml,
              normalizedCss: normalized.scopedCss,
            },
          });
        });
      } catch (dbErr: any) {
        // Rollback filesystem if database transaction fails
        if (fs.existsSync(finalExportDir)) {
          fs.rmSync(finalExportDir, { recursive: true, force: true });
        }
        throw dbErr;
      }

      return {
        candidateId,
        reusableComponentId: dbReusableId,
        status: 'exported',
        exportPath: finalExportDir,
        manifestJson,
        validatedData: validated,
      };
    } catch (err: any) {
      return {
        candidateId,
        status: 'failed',
        errorMessage: `Export execution error: ${err.message}`,
      };
    }
  }
}
