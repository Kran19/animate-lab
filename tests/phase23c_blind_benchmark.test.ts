import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { BlindTargetRegistry } from '../src/engine/benchmark/blindTargetRegistry';
import { BlindOracle } from '../src/engine/benchmark/blindOracle';
import { BlindBenchmarkEvaluator } from '../src/engine/benchmark/blindBenchmarkEvaluator';
import { BlindReportGenerator } from '../src/engine/benchmark/blindReportGenerator';

describe('Phase 23C — Blind Production Generalization & Independent Challenge Set Suite', () => {
  const testWorkspaceDir = path.join(process.cwd(), 'workspaces', 'test_phase23c_blind');

  beforeAll(() => {
    if (fs.existsSync(testWorkspaceDir)) {
      fs.rmSync(testWorkspaceDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testWorkspaceDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(testWorkspaceDir)) {
      fs.rmSync(testWorkspaceDir, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // 1. Anti-Leakage & Oracle Isolation Verification
  // -------------------------------------------------------------------------
  describe('1. Anti-Leakage & Oracle Isolation Verification', () => {
    it('1. Verifies zero oracle leakage into extraction, FIR, synthesis, and classification engines', () => {
      const check = BlindBenchmarkEvaluator.verifyAntiLeakage();
      expect(check.leakFree).toBe(true);
      expect(check.details).toContain('0 oracle references');
    });

    it('2. Asserts BlindTargetRegistry contains 20 blind targets with zero disposition labels', () => {
      const targets = BlindTargetRegistry.BLIND_TARGETS;
      expect(targets.length).toBe(20);

      for (const t of targets) {
        expect((t as any).expectedDisposition).toBeUndefined();
        expect((t as any).oracleDisposition).toBeUndefined();
      }
    });

    it('3. Asserts BlindOracle contains 20 ground truth specifications across >= 12 architectural families', () => {
      const oracleTargets = BlindOracle.ORACLE_TARGETS;
      expect(oracleTargets.length).toBe(20);

      const families = new Set(oracleTargets.map((o) => o.architecturalFamily));
      expect(families.size).toBeGreaterThanOrEqual(12);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Blind Evaluation Execution & False Certification Audit
  // -------------------------------------------------------------------------
  describe('2. Blind Evaluation Execution & False Certification Audit', () => {
    it('4. Executes blind benchmark with 100% oracle agreement and 0 false certifications', () => {
      const summary = BlindBenchmarkEvaluator.runBlindBenchmark(testWorkspaceDir);

      expect(summary.totalBlindTargets).toBe(20);
      expect(summary.oracleAgreementPercentage).toBe(100.0);
      expect(summary.oracleAgreementCount).toBe(20);
      expect(summary.falseCertificationCount).toBe(0);
      expect(summary.falseCertificationPercentage).toBe(0.0);
      expect(summary.falseFailureCount).toBe(0);
      expect(summary.provenanceViolations).toBe(0);
      expect(summary.firMutations).toBe(0);
      expect(summary.antiLeakageVerified).toBe(true);
    });

    it('5. Strictly rejects opaque DRM media streams without false certification', () => {
      const summary = BlindBenchmarkEvaluator.runBlindBenchmark(testWorkspaceDir);
      const drmResult = summary.results.find((r) => r.target.targetId === 'blind_17_opaque_drm_media')!;

      expect(drmResult.prediction.disposition).toBe('COPY_USE_FAILED');
      expect(drmResult.prediction.hardGateTriggered).toBe('OPAQUE_DRM_MEDIA_GATE');
      expect(drmResult.isFalseCertification).toBe(false);
    });

    it('6. Strictly rejects non-deterministic generative motion without false certification', () => {
      const summary = BlindBenchmarkEvaluator.runBlindBenchmark(testWorkspaceDir);
      const randomResult = summary.results.find((r) => r.target.targetId === 'blind_12_generative_drift')!;

      expect(randomResult.prediction.disposition).toBe('COPY_USE_FAILED');
      expect(randomResult.prediction.hardGateTriggered).toBe('NON_DETERMINISTIC_RUNTIME_GATE');
      expect(randomResult.determinismPasses.classification).toBe('NON_DETERMINISTIC');
      expect(randomResult.isFalseCertification).toBe(false);
    });

    it('7. Emits COPY_USE_UNKNOWN with missing evidence for ambiguous/interrupted stream', () => {
      const summary = BlindBenchmarkEvaluator.runBlindBenchmark(testWorkspaceDir);
      const unknownResult = summary.results.find((r) => r.target.targetId === 'blind_20_ambiguous_stream')!;

      expect(unknownResult.prediction.disposition).toBe('COPY_USE_UNKNOWN');
      expect(unknownResult.prediction.hardGateTriggered).toBe('INSUFFICIENT_EVIDENCE_GATE');
      expect(unknownResult.prediction.missingEvidence).toBeDefined();
      expect(unknownResult.prediction.missingEvidence?.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Reports Generation & Final Verdict
  // -------------------------------------------------------------------------
  describe('3. 10 Canonical Phase 23C Reports', () => {
    it('8. Emits all 10 Phase 23C canonical markdown reports', () => {
      const summary = BlindBenchmarkEvaluator.runBlindBenchmark(testWorkspaceDir);
      const reports = BlindReportGenerator.generateAllReports(testWorkspaceDir, summary);

      expect(Object.keys(reports).length).toBe(10);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'BLIND_BENCHMARK.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'BLIND_CORPUS_MANIFEST.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'CLASSIFICATION_ACCURACY.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'FALSE_CERTIFICATION_AUDIT.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'DETERMINISM_AUDIT.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'PROVENANCE_AUDIT.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'ORACLE_INDEPENDENCE.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'UNKNOWN_BOUNDARY_REPORT.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'GENERALIZATION_BOUNDARY.md'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspaceDir, 'reports', 'PHASE23C_FINAL_VERDICT.md'))).toBe(true);

      expect(reports['PHASE23C_FINAL_VERDICT.md']).toContain('# **`VERIFIED`**');
    });
  });
});
