#!/usr/bin/env bash
set -e

echo "============================================================"
echo "Running Full AnimateLab Verification Suite"
echo "============================================================"

echo "[1/3] Typecheck..."
npm run typecheck

echo "[2/3] Full Vitest Suite..."
npx vitest run

echo "[3/3] Production Build..."
npm run build

echo "============================================================"
echo "[SUCCESS] Full verification passed!"
echo "============================================================"
