#!/usr/bin/env bash
set -e

echo "============================================================"
echo "Running AnimateLab Golden Corpus Benchmark (Phase 17-19)"
echo "============================================================"
npx vitest run tests/phase17_evidence_hardening.test.ts tests/phase18_behavioral_reconstruction.test.ts
