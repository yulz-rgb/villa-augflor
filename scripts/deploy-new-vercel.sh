#!/usr/bin/env bash
# Deploy this rebuild as a NEW Vercel project (separate from github.com/yulz-rgb/villa-augflor).
# Run from your Mac Terminal (not in a restricted agent). Requires: Node/npm, network, Vercel account.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f package.json ]]; then
  echo "Run this from the villa-augflor repo root (scripts/ is one level down)." >&2
  exit 1
fi

echo "==> Deploying to Vercel (production)…"
echo "    If this is the first time: log in when prompted, then choose CREATE NEW PROJECT"
echo "    and name it e.g. villa-augflor-rebuild (avoid reusing the existing villa-augflor project)."
echo ""

exec npx --yes vercel@latest deploy --prod
