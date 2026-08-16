@echo off
echo ============================================================
echo Cleaning temporary runs and cache...
echo ============================================================

if exist "workspaces\test_*" rmdir /s /q "workspaces\test_*"
if exist "workspaces\golden_corpus_runs" rmdir /s /q "workspaces\golden_corpus_runs"
if exist "workspaces\batch_lab_runs" rmdir /s /q "workspaces\batch_lab_runs"

echo Clean complete.
