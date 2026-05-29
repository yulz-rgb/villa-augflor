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
  local content="${3:-$HTML}"
  if printf '%s' "$content" | grep -qiE "$pattern"; then
    echo "FAIL: ${label} still present on live site (matched: ${pattern})"
    FAIL=1
  else
    echo "OK:   ${label} absent"
  fi
}

check_present() {
  local label="$1"
  local pattern="$2"
  if [[ "$HTML" == *"$pattern"* ]]; then
    echo "OK:   ${label} present"
  else
    echo "FAIL: ${label} missing (expected: ${pattern})"
    FAIL=1
  fi
}

check_present_file() {
  local label="$1"
  local pattern="$2"
  local content="$3"
  if printf '%s' "$content" | grep -Fq "$pattern"; then
    echo "OK:   ${label} present"
  else
    echo "FAIL: ${label} missing (expected: ${pattern})"
    FAIL=1
  fi
}

# Homepage CRO pricing section (Phase A May 2026)
check_present "Homepage pricing section" 'id="rates"'
check_present "Homepage WhatsApp CTA" "Check dates on WhatsApp"
check_present "Homepage book-direct strip" "Why book direct"
check_absent "Homepage inline guidebook tabs" 'id="guidebook"'
check_present "Homepage area guide CTA" "70+ curated places"

# Broken legacy image paths
if echo "$HTML" | grep -qE 'href="\./images/|data-bg="\./images/'; then
  echo "FAIL: Homepage still references missing ./images/ paths"
  FAIL=1
else
  echo "OK:   No ./images/ references on homepage"
fi

if [[ "$PATH_TO_CHECK" == "/" ]]; then
  check_present "Homepage book-direct-safely link" "book-direct-safely.html"
  check_present "Homepage ideal 4 guests" "Ideal 4"
  check_present "Homepage live calendar" "data-calendar"
  check_present "Homepage area guide link" "area.html"
  check_present "Homepage availability anchor" "id=\"availability\""

  echo "==> Fetching ${SITE%/}/area.html"
  AREA_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/area.html")
  check_present_file "Area guide tag filters" 'data-tag="free"' "$AREA_HTML"
  check_present_file "Area guide itineraries" 'id="itineraries"' "$AREA_HTML"

  PHOTO_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Cache-Control: no-cache" "$SITE/assets/photos/area/nice.jpg")
  if [[ "$PHOTO_CODE" == "200" ]]; then
    echo "OK:   Area guide sample photo (nice.jpg) returns 200"
  else
    echo "FAIL: Area guide photo nice.jpg returned HTTP ${PHOTO_CODE}"
    FAIL=1
  fi

  echo "==> Fetching ${SITE%/}/rates.html"
  RATES_HTML=$(curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "$SITE/rates.html")
  check_present_file "Rates page €420 shoulder" "From €420 / night" "$RATES_HTML"
  check_present_file "Rates page €480 peak" "€480<small>/ night</small>" "$RATES_HTML"
  check_absent "Rates page old €450 pricing" 'From €450 / night' "$RATES_HTML"
  check_present_file "Rates page calendar" "data-calendar" "$RATES_HTML"
  check_present_file "Rates page open dates summary" "data-open-windows" "$RATES_HTML"

  echo "==> Fetching ${SITE%/}/book-direct-safely.html"
  BDS_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/book-direct-safely.html")
  check_present_file "Book direct safely page" "Book direct" "$BDS_HTML"
  check_present_file "30% deposit on book-direct page" "30% deposit" "$BDS_HTML"

  echo "==> Fetching ${SITE%/}/gallery.html"
  GALLERY_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/gallery.html")
  check_present_file "Gallery page room sections" 'Barcelona' "$GALLERY_HTML"
  check_absent "Gallery redirect stub" 'url=/#gallery' "$GALLERY_HTML"

  CERT_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Cache-Control: no-cache" "$SITE/assets/documents/gites-de-france-4-star-classification.jpg")
  if [[ "$CERT_CODE" == "200" ]]; then
    echo "OK:   Gîtes de France certificate returns 200"
  else
    echo "FAIL: Certificate image returned HTTP ${CERT_CODE}"
    FAIL=1
  fi

  echo "==> Legacy WordPress redirects"
  for legacy in "/about/" "/contact/" "/check-availability/"; do
    LOC=$(curl -sI -H "Cache-Control: no-cache" "${SITE}${legacy}" | grep -i '^location:' | tr -d '\r' | awk '{print $2}')
    if [[ -n "$LOC" ]] && [[ "$LOC" != *"/about/"* ]] && [[ "$LOC" != *"/contact/"* ]]; then
      echo "OK:   ${legacy} redirects to ${LOC}"
    else
      echo "FAIL: ${legacy} not redirecting (location: ${LOC:-none})"
      FAIL=1
    fi
  done
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo ""
  echo "Production verification FAILED. Do not tell the user the change is live."
  echo "Fix: run scripts/deploy-production.sh or re-alias in Vercel dashboard."
  exit 1
fi

echo ""
echo "Production verification PASSED for ${URL}"
