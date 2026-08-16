#!/usr/bin/env bash
set -e

echo "Cleaning temporary runs and cache..."
rm -rf workspaces/test_* workspaces/golden_corpus_runs workspaces/batch_lab_runs
echo "Clean complete."
