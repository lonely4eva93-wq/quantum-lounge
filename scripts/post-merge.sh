#!/bin/bash
set -e

pnpm install --frozen-lockfile
pnpm --filter db push

# Reinstall git hooks so they persist after each task merge
bash "$(git rev-parse --show-toplevel)/scripts/install-git-hooks.sh"

# Sync to GitHub (Replit is the source of truth; this mirrors every merge)
bash "$(git rev-parse --show-toplevel)/scripts/github-sync.sh"
