import * as path from 'path';
import { BlindBenchmarkEvaluator } from '../engine/benchmark/blindBenchmarkEvaluator';
import { BlindReportGenerator } from '../engine/benchmark/blindReportGenerator';

function main() {
  const targetDir = path.join(process.cwd(), 'workspace-data', 'external-corpus', 'phase23c');
  console.log(`[Phase 23C] Running Blind Production Benchmark across 20 Targets...`);

  const summary = BlindBenchmarkEvaluator.runBlindBenchmark(targetDir);
  const reports = BlindReportGenerator.generateAllReports(targetDir, summary);

  console.log(`\n======================================================`);
  console.log(`[Phase 23C] Blind Production Benchmark Complete`);
  console.log(`Total Blind Targets:   ${summary.totalBlindTargets}`);
  console.log(`Architectural Families:${summary.distinctArchitecturalFamilies}`);
  console.log(`Predicted Certified:   ${summary.predictedCertifiedCount}`);
  console.log(`Predicted Partial:     ${summary.predictedPartialCount}`);
  console.log(`Predicted Failed:      ${summary.predictedFailedCount}`);
  console.log(`Predicted Unknown:     ${summary.predictedUnknownCount}`);
  console.log(`Oracle Agreement:      ${summary.oracleAgreementPercentage}% (${summary.oracleAgreementCount}/${summary.totalBlindTargets})`);
  console.log(`False Certifications:  ${summary.falseCertificationCount} (${summary.falseCertificationPercentage}%)`);
  console.log(`Anti-Leakage Status:   ${summary.antiLeakageVerified ? 'LEAK-FREE' : 'LEAK DETECTED'}`);
  console.log(`Provenance Violations: ${summary.provenanceViolations}`);
  console.log(`FIR Mutations:         ${summary.firMutations}`);
  console.log(`Reports Generated:     ${Object.keys(reports).join(', ')}`);
  console.log(`======================================================\n`);
}

main();
