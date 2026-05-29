#!/usr/bin/env bash
# Verify villa-augflor.com serves expected content. Exit 1 on failure.
set -euo pipefail

SITE="${VERIFY_SITE:-https://villa-augflor.com}"
PATH_TO_CHECK="${VERIFY_PATH:-/}"
URL="${SITE%/}${PATH_TO_CHECK}"
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

echo "==> Fetching ${URL}"
curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "$URL" -o "$TMP"

FAIL=0

check_absent() {
  local label="$1"
  local pattern="$2"
  if grep -qiE "$pattern" "$TMP"; then
    echo "FAIL: ${label} still present on live site (matched: ${pattern})"
    FAIL=1
  else
    echo "OK:   ${label} absent"
  fi
}

check_present() {
  local label="$1"
  local pattern="$2"
  if grep -qiE "$pattern" "$TMP"; then
    echo "OK:   ${label} present"
  else
    echo "FAIL: ${label} missing on live site (expected: ${pattern})"
    FAIL=1
  fi
}

check_present_f() {
  local label="$1"
  local fixed="$2"
  if grep -qF "$fixed" "$TMP"; then
    echo "OK:   ${label} present"
  else
    echo "FAIL: ${label} missing on live site (expected: ${fixed})"
    FAIL=1
  fi
}

# Old standalone pricing cards section (removed — rates now at #rates with merged content)
check_absent "Legacy homepage rates block" 'Simple,\s*<em>transparent rates</em>|transparent rates'

# Broken legacy image paths (./images/ removed from repo)
if grep -qE 'href="\./images/|data-bg="\./images/' "$TMP"; then
  echo "FAIL: Homepage still references missing ./images/ paths"
  FAIL=1
else
  echo "OK:   No ./images/ references on homepage"
fi

if [[ "$PATH_TO_CHECK" == "/" ]]; then
  check_present "Homepage rates section" 'id="rates"'
  check_present_f "Homepage €420 shoulder pricing" 'From €420 / night'
  check_present_f "Homepage €480 peak pricing" 'From €480 / night'
  check_present_f "Area guide link" 'area.html'
  check_present "Interactive gallery grid" 'id="galleryRoomGrid"'
  check_absent "Legacy gallery.html link in nav" 'href="gallery\.html"'

  echo "==> Fetching ${SITE%/}/area.html"
  curl -fsSL -H "Cache-Control: no-cache" "$SITE/area.html" -o "$TMP"
  if grep -q 'id="ag-grid"' "$TMP"; then
    echo "OK:   Area guide ag-grid present"
  else
    echo "FAIL: Area guide missing ag-grid on /area.html"
    FAIL=1
  fi
  PHOTO_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Cache-Control: no-cache" "$SITE/assets/photos/area/nice.jpg")
  if [[ "$PHOTO_CODE" == "200" ]]; then
    echo "OK:   Area guide sample photo (nice.jpg) returns 200"
  else
    echo "FAIL: Area guide photo nice.jpg returned HTTP ${PHOTO_CODE}"
    FAIL=1
  fi

  echo "==> Checking rates.html redirect"
  RATES_LOC=$(curl -sI -H "Cache-Control: no-cache" "$SITE/rates.html" | tr -d '\r' | grep -i '^location:' | head -1 || true)
  if echo "$RATES_LOC" | grep -qiE '#rates|/$'; then
    echo "OK:   rates.html redirects to homepage"
  else
    echo "WARN: rates.html redirect not confirmed (${RATES_LOC:-no Location header}) — may still serve old page until deploy"
  fi
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo ""
  echo "Production verification FAILED. Do not tell the user the change is live."
  echo "Fix: run scripts/deploy-production.sh or re-alias in Vercel dashboard."
  exit 1
fi

echo ""
echo "Production verification PASSED for ${URL}"
