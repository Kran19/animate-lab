import * as path from 'path';
import { AdversarialBenchmarkHarness } from '../engine/benchmark/adversarialBenchmarkHarness';
import { BenchmarkReportGenerator } from '../engine/benchmark/benchmarkReportGenerator';

function main() {
  const targetDir = path.join(process.cwd(), 'workspace-data', 'external-corpus', 'phase23b');
  console.log(`[Phase 23B] Running Adversarial Corpus Benchmark across 12 Archetypes...`);

  const summary = AdversarialBenchmarkHarness.runBenchmark(targetDir);
  const reports = BenchmarkReportGenerator.generateAllReports(targetDir, summary);

  console.log(`\n======================================================`);
  console.log(`[Phase 23B] Adversarial Benchmark Complete`);
  console.log(`Total Archetypes:      ${summary.totalArchetypesTested}`);
  console.log(`Fully Certified:       ${summary.totalCertified}`);
  console.log(`Bounded Partial:       ${summary.totalPartial}`);
  console.log(`Truthfully Rejected:   ${summary.totalFailed}`);
  console.log(`Accuracy:              ${summary.accuracyPercentage}% (${summary.correctlyClassifiedCount}/${summary.totalArchetypesTested})`);
  console.log(`False Positives:       ${summary.falsePositiveCertifications}`);
  console.log(`Provenance Violations: ${summary.provenanceViolations}`);
  console.log(`FIR Mutations:         ${summary.firMutations}`);
  console.log(`Reports Generated:     ${Object.keys(reports).join(', ')}`);
  console.log(`======================================================\n`);
}

main();
