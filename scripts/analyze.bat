@echo off
setlocal
echo ========================================================
echo   AnimateLab Autonomous Website Extractor Workbench
echo ========================================================

if "%~1"=="" (
    echo [ERROR] Usage: scripts\analyze.bat ^<website_url^>
    exit /b 1
)

set TARGET_URL=%~1
echo [INFO] Target URL: %TARGET_URL%
echo [INFO] Initiating Real Chromium Extraction...

npx vitest run tests/phase21_autonomous_pipeline.test.ts --testNamePattern="1. Executes full autonomous website extraction"

echo ========================================================
echo   Extraction Complete! Check workspace-data/sites/
echo ========================================================
