#!/usr/bin/env bash
# Build, deploy to villa-augflor-static-live, and verify live site.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .vercel/project.json ]]; then
  echo "Error: run from repo root with .vercel linked to villa-augflor-static-live." >&2
  exit 1
fi

echo "==> Production build"
npx --yes vercel@latest build --prod

echo "==> Deploy prebuilt to production"
npx --yes vercel@latest deploy --prebuilt --prod

echo "==> Waiting for CDN (15s)"
sleep 15

echo "==> Verify live site"
bash scripts/verify-production.sh
