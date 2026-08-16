@echo off
setlocal
echo ======================================================================
echo   AnimateLab Determinism & Reproducibility Auditor (Phase 23)
echo ======================================================================

npm run verify:determinism

echo ======================================================================
echo   Determinism Audit Complete!
echo ======================================================================
