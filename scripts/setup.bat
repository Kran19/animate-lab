@echo off
echo ============================================================
echo AnimateLab Automated Setup (Phase 19)
echo ============================================================

echo [1/3] Installing Node.js dependencies...
call npm install

echo [2/3] Generating Prisma Client...
call npx prisma generate

echo [3/3] Setting up Python dependencies...
py -m pip install -r python/requirements.txt 2>nul || pip install -r python/requirements.txt 2>nul

echo ============================================================
echo [SUCCESS] AnimateLab setup complete! Run scripts\doctor.bat to verify.
echo ============================================================
