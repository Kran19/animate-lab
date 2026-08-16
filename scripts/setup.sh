#!/usr/bin/env bash
set -e

echo "============================================================"
echo "AnimateLab Automated Setup (Phase 19)"
echo "============================================================"

echo "[1/3] Installing Node.js dependencies..."
npm install

echo "[2/3] Generating Prisma Client..."
npx prisma generate

echo "[3/3] Setting up Python dependencies..."
python3 -m pip install -r python/requirements.txt || pip install -r python/requirements.txt || true

echo "============================================================"
echo "[SUCCESS] AnimateLab setup complete! Run scripts/doctor.sh to verify."
echo "============================================================"
