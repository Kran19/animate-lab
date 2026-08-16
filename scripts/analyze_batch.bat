@echo off
setlocal
echo ========================================================
echo   AnimateLab Batch Website Reverse-Engineering Workbench
echo ========================================================

set TARGET_FILE=%~1
if "%TARGET_FILE%"=="" (
    set TARGET_FILE=tests\real-sites\real-sites.json
)

echo [INFO] Target Batch Manifest: %TARGET_FILE%
echo [INFO] Running Autonomous Pipeline...

npx vitest run tests/phase21_autonomous_pipeline.test.ts

echo ========================================================
echo   Batch Processing Finished!
echo   Library Catalogs Updated: workspace-data/library/
echo ========================================================
