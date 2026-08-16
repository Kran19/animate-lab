@echo off
echo ============================================================
echo Running Full AnimateLab Verification Suite
echo ============================================================

echo [1/3] Typecheck...
call npm run typecheck
if %errorlevel% neq 0 exit /b 1

echo [2/3] Full Vitest Suite...
call npx vitest run
if %errorlevel% neq 0 exit /b 1

echo [3/3] Production Build...
call npm run build
if %errorlevel% neq 0 exit /b 1

echo ============================================================
echo [SUCCESS] Full verification passed!
echo ============================================================
