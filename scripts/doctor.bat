@echo off
echo ============================================================
echo AnimateLab Environment Doctor (Phase 19)
echo ============================================================

echo [1/5] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    exit /b 1
)

echo [2/5] Checking npm...
call npm --version
if %errorlevel% neq 0 (
    echo [ERROR] npm is not available.
    exit /b 1
)

echo [3/5] Checking Python (py / python)...
py --version >nul 2>&1
if %errorlevel% equ 0 (
    py --version
) else (
    python --version
)

echo [4/5] Checking TypeScript Typecheck...
call npm run typecheck
if %errorlevel% neq 0 (
    echo [ERROR] TypeScript compilation errors detected.
    exit /b 1
)

echo [5/5] Checking Vitest Suite...
call npx vitest run tests/phase19_workbench_and_python_lab.test.ts
if %errorlevel% neq 0 (
    echo [ERROR] Tests failed.
    exit /b 1
)

echo ============================================================
echo [SUCCESS] AnimateLab Environment is healthy and ready!
echo ============================================================
