#!/usr/bin/env bash
set -e

echo "============================================================"
echo "AnimateLab Environment Doctor (Phase 19)"
echo "============================================================"

echo "[1/5] Checking Node.js..."
node --version

echo "[2/5] Checking npm..."
npm --version

echo "[3/5] Checking Python..."
python3 --version || python --version

echo "[4/5] Checking TypeScript Typecheck..."
npm run typecheck

echo "[5/5] Checking Vitest Suite..."
npx vitest run tests/phase19_workbench_and_python_lab.test.ts

echo "============================================================"
echo "[SUCCESS] AnimateLab Environment is healthy and ready!"
echo "============================================================"
