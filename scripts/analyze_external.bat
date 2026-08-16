@echo off
setlocal
echo ======================================================================
echo   AnimateLab External Production-Site Generalization Workbench (Phase 23)
echo ======================================================================

set TARGET_URL=%~1
if "%TARGET_URL%"=="" (
    set TARGET_URL=https://www.dzinr.in/
)

echo [INFO] Target URL: %TARGET_URL%
echo [INFO] Launching Real Chromium Forensics...

npm run analyze:external

echo ======================================================================
echo   Extraction Complete! Check workspace-data/external-corpus/
echo ======================================================================
