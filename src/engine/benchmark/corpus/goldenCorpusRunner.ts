import * as path from 'path';
import * as fs from 'fs';
import { GoldenCorpusFixture } from './goldenCorpusManifest';
import { FIRAssembler } from '../../extraction/firAssembler';
import { SectionFIR } from '../../domain/fir/sectionFIR';
import { FIRValidator } from '../../domain/fir/firValidation';
import { PlanBuilder, SynthesisPlan } from '../../generation/synthesisPlan';
import { ReactGenerator, GeneratedComponent } from '../../generation/reactGenerator';
import { ComponentPackageBuilder } from '../../package/componentPackageBuilder';
import { CleanRoomRunner, CleanRoomExecutionResult } from '../../acceptance/cleanRoomRunner';
import { EvidenceAssertionEngine, EvidenceAssertionResult } from './evidenceAssertionEngine';

export type PipelineFailureStage =
  | 'NONE'
  | 'OBSERVATION_FAILURE'
  | 'FIR_FAILURE'
  | 'SYNTHESIS_FAILURE'
  | 'REPLAY_FAILURE';

export interface GoldenCorpusRunResult {
  fixtureId: string;
  fixtureClass: string;
  status: 'CERTIFIED' | 'PARTIAL' | 'FAILED';
  failureStage: PipelineFailureStage;
  fir: SectionFIR | null;
  plan: SynthesisPlan | null;
  generated: GeneratedComponent | null;
  cleanRoomResult: CleanRoomExecutionResult | null;
  evidenceAssertion: EvidenceAssertionResult;
  reconstructabilityScore: number;
  diagnostics: string[];
}

export class GoldenCorpusRunner {
  /**
   * Executes a single GoldenCorpus fixture through the complete 4-stage pipeline with failure isolation.
   */
  public static runFixture(
    fixture: GoldenCorpusFixture,
    workspaceBaseDir: string = path.join(process.cwd(), 'workspaces', 'golden_corpus_runs')
  ): GoldenCorpusRunResult {
    const fixtureDir = path.join(workspaceBaseDir, fixture.fixtureId);
    if (!fs.existsSync(fixtureDir)) {
      fs.mkdirSync(fixtureDir, { recursive: true });
    }

    const diagnostics: string[] = [];
    let fir: SectionFIR | null = null;
    let plan: SynthesisPlan | null = null;
    let generated: GeneratedComponent | null = null;
    let cleanRoomResult: CleanRoomExecutionResult | null = null;

    // -----------------------------------------------------------------------
    // STAGE 1 & 2: FIR Assembly & Schema Validation
    // -----------------------------------------------------------------------
    try {
      fir = FIRAssembler.assemble(fixture.observedData);
    } catch (err: any) {
      diagnostics.push(`FIR Assembly failed: ${err.message}`);
      return {
        fixtureId: fixture.fixtureId,
        fixtureClass: fixture.fixtureClass,
        status: 'FAILED',
        failureStage: 'FIR_FAILURE',
        fir: null,
        plan: null,
        generated: null,
        cleanRoomResult: null,
        evidenceAssertion: { isObservationFIRMatch: false, mismatches: [err.message], evidenceFidelityScore: 0 },
        reconstructabilityScore: 0,
        diagnostics,
      };
    }

    const validation = FIRValidator.validate(fir);
    if (!validation.isValid) {
      diagnostics.push(`FIR Schema validation errors: ${validation.errors.join('; ')}`);
      return {
        fixtureId: fixture.fixtureId,
        fixtureClass: fixture.fixtureClass,
        status: 'FAILED',
        failureStage: 'FIR_FAILURE',
        fir,
        plan: null,
        generated: null,
        cleanRoomResult: null,
        evidenceAssertion: { isObservationFIRMatch: false, mismatches: validation.errors, evidenceFidelityScore: 0 },
        reconstructabilityScore: 0,
        diagnostics,
      };
    }

    // -----------------------------------------------------------------------
    // STAGE 2b: Assert Browser Observation == FIR Representation
    // -----------------------------------------------------------------------
    const evidenceAssertion = EvidenceAssertionEngine.assertObservationToFIR(fixture.observedData, fir);
    if (!evidenceAssertion.isObservationFIRMatch) {
      diagnostics.push(`Observation-to-FIR mismatches: ${evidenceAssertion.mismatches.join('; ')}`);
      return {
        fixtureId: fixture.fixtureId,
        fixtureClass: fixture.fixtureClass,
        status: 'FAILED',
        failureStage: 'OBSERVATION_FAILURE',
        fir,
        plan: null,
        generated: null,
        cleanRoomResult: null,
        evidenceAssertion,
        reconstructabilityScore: 0,
        diagnostics,
      };
    }

    // Write fir.json to disk
    fs.writeFileSync(path.join(fixtureDir, 'fir.json'), JSON.stringify(fir, null, 2), 'utf-8');

    // -----------------------------------------------------------------------
    // STAGE 3: Plan Builder & React Synthesis
    // -----------------------------------------------------------------------
    try {
      plan = PlanBuilder.buildPlan(fir);
      const generator = new ReactGenerator();
      generated = generator.generateFromFIR(fir, plan);
    } catch (err: any) {
      diagnostics.push(`Synthesis failed: ${err.message}`);
      return {
        fixtureId: fixture.fixtureId,
        fixtureClass: fixture.fixtureClass,
        status: 'FAILED',
        failureStage: 'SYNTHESIS_FAILURE',
        fir,
        plan,
        generated: null,
        cleanRoomResult: null,
        evidenceAssertion,
        reconstructabilityScore: 0,
        diagnostics,
      };
    }

    // Build Package Directory
    const pkgResult = ComponentPackageBuilder.buildPackage({
      componentName: generated.componentName,
      category: fir.identity.category,
      sourceCandidateId: fir.identity.sectionId,
      websiteId: fir.identity.websiteId,
      pageId: fir.identity.pageId,
      sourceWebsiteUrl: fir.identity.sourceUrl,
      sourcePagePath: fir.identity.pagePath,
      tsxCode: generated.tsxCode,
      cssCode: generated.cssCode,
      assets: fir.assets.assets.map((a) => ({
        originalUrl: a.sourceUrl,
        exportPath: a.exportPath,
        localPath: a.localPath,
        mimeType: a.mimeType,
        sizeBytes: a.byteLength,
        contentHash: a.sha256,
        ownershipScope: 'EXCLUSIVE_SECTION' as const,
      })),
      propsDocJson: generated.propsDocJson,
      technologies: Object.keys(plan.declaredNpmDependencies),
      animations: [],
      isolationStatus: 'ISOLATED',
      validationReport: { isValid: true, layersPassed: ['all'], layersFailed: [], errors: [], warnings: [] },
      fir,
      outputDirectory: fixtureDir,
    });

    if (pkgResult.status === 'failed') {
      diagnostics.push(`Package builder failed: ${pkgResult.error}`);
      return {
        fixtureId: fixture.fixtureId,
        fixtureClass: fixture.fixtureClass,
        status: 'FAILED',
        failureStage: 'SYNTHESIS_FAILURE',
        fir,
        plan,
        generated,
        cleanRoomResult: null,
        evidenceAssertion,
        reconstructabilityScore: 0,
        diagnostics,
      };
    }

    // -----------------------------------------------------------------------
    // STAGE 4: Clean-Room Verification
    // -----------------------------------------------------------------------
    cleanRoomResult = CleanRoomRunner.executeCleanRoomVerification({
      runId: `run-${fixture.fixtureId}`,
      sectionId: fir.identity.sectionId,
      componentName: generated.componentName,
      packageDirectory: pkgResult.packagePath,
      targetBaseDirectory: path.join(fixtureDir, 'clean_room'),
    });

    if (cleanRoomResult.status === 'FAIL') {
      diagnostics.push(`Clean-room verification failed: ${cleanRoomResult.errorMessage || cleanRoomResult.detectedLeakages.join(', ')}`);
      return {
        fixtureId: fixture.fixtureId,
        fixtureClass: fixture.fixtureClass,
        status: 'FAILED',
        failureStage: 'REPLAY_FAILURE',
        fir,
        plan,
        generated,
        cleanRoomResult,
        evidenceAssertion,
        reconstructabilityScore: 0,
        diagnostics,
      };
    }

    // Determine Final Disposition
    const finalStatus: GoldenCorpusRunResult['status'] =
      plan.capabilityTier === 'TIER_1_DETERMINISTIC'
        ? 'CERTIFIED'
        : plan.capabilityTier === 'TIER_4_CANVAS_FALLBACK'
        ? 'PARTIAL'
        : 'CERTIFIED';

    return {
      fixtureId: fixture.fixtureId,
      fixtureClass: fixture.fixtureClass,
      status: finalStatus,
      failureStage: 'NONE',
      fir,
      plan,
      generated,
      cleanRoomResult,
      evidenceAssertion,
      reconstructabilityScore: plan.reconstructabilityScore,
      diagnostics,
    };
  }
}
