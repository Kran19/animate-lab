@echo off
echo ============================================================
echo Running AnimateLab Golden Corpus Benchmark (Phase 17-19)
echo ============================================================
call npx vitest run tests/phase17_evidence_hardening.test.ts tests/phase18_behavioral_reconstruction.test.ts
