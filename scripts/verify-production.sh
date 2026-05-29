#!/usr/bin/env bash
# Verify villa-augflor.com serves expected content. Exit 1 on failure.
set -euo pipefail

SITE="${VERIFY_SITE:-https://villa-augflor.com}"
PATH_TO_CHECK="${VERIFY_PATH:-/}"
URL="${SITE%/}${PATH_TO_CHECK}"

echo "==> Fetching ${URL}"
HTML=$(curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "$URL")

FAIL=0

check_absent() {
  local label="$1"
  local pattern="$2"
  if echo "$HTML" | grep -qiE "$pattern"; then
    echo "FAIL: ${label} still present on live site (matched: ${pattern})"
    FAIL=1
  else
    echo "OK:   ${label} absent"
  fi
}

# Homepage pricing cards section (removed May 2026)
check_absent "Homepage rates section" 'id="rates"|Simple,\s*<em>transparent rates</em>|transparent rates'

# Broken legacy image paths (./images/ removed from repo)
if echo "$HTML" | grep -qE 'href="\./images/|data-bg="\./images/'; then
  echo "FAIL: Homepage still references missing ./images/ paths"
  FAIL=1
else
  echo "OK:   No ./images/ references on homepage"
fi

# Area guide (May 2026 redesign)
if [[ "$PATH_TO_CHECK" == "/" ]]; then
  echo "==> Fetching ${SITE%/}/area.html"
  AREA_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/area.html")
  if echo "$AREA_HTML" | grep -q 'id="ag-grid"'; then
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

  echo "==> Fetching ${SITE%/}/rates.html"
  RATES_HTML=$(curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "$SITE/rates.html")
  if echo "$RATES_HTML" | grep -q 'From €420 / night' && echo "$RATES_HTML" | grep -q '€480<small>/ night</small>'; then
    echo "OK:   Rates page shows €420 shoulder / €480 peak direct"
  else
    echo "FAIL: Rates page missing canonical €420 / €480 pricing"
    FAIL=1
  fi
  if echo "$RATES_HTML" | grep -q 'From €450 / night'; then
    echo "FAIL: Rates page still shows old €450 shoulder pricing"
    FAIL=1
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
