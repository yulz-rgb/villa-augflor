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

# Homepage pricing cards section (removed May 2026)
check_absent "Homepage duplicate rates section" 'id="rates"|Simple,\s*<em>transparent rates</em>'

# Broken legacy image paths
if echo "$HTML" | grep -qE 'href="\./images/|data-bg="\./images/'; then
  echo "FAIL: Homepage still references missing ./images/ paths"
  FAIL=1
else
  echo "OK:   No ./images/ references on homepage"
fi

if [[ "$PATH_TO_CHECK" == "/" ]]; then
  check_present "Homepage book-direct-safely link" "book-direct-safely.html"
  check_present "Homepage ideal 4 guests" "ideal 4"
  check_present "Homepage live calendar" "data-calendar"
  check_present "Homepage area guide link" "area.html"
  check_present "Homepage availability anchor" "id=\"availability\""
  check_present "Homepage hero headline" "Private pool villa in the South of France, near Nice Airport"
  check_absent "Homepage save 20% footer" "save 20%"

  echo "==> Fetching ${SITE%/}/contact.html"
  CONTACT_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/contact.html")
  check_present_file "Contact enquiry form" "data-enquiry-form" "$CONTACT_HTML"

  echo "==> Fetching ${SITE%/}/family-villa.html"
  FV_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/family-villa.html")
  check_present_file "Family villa page" "ground-floor" "$FV_HTML"
  check_absent "Family villa redirect stub" "location.replace" "$FV_HTML"

  echo "==> Fetching ${SITE%/}/area.html"
  AREA_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/area.html")
  check_present_file "Area guide ag-grid" 'id="ag-grid"' "$AREA_HTML"

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
  check_present_file "Gallery pool section" "Pool &amp; garden" "$GALLERY_HTML"
  check_present_file "Gallery loft caption" "steep staircase" "$GALLERY_HTML"
  check_absent "Gallery redirect stub" 'url=/#gallery' "$GALLERY_HTML"

  CERT_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Cache-Control: no-cache" "$SITE/assets/documents/gites-de-france-4-star-classification.jpg")
  if [[ "$CERT_CODE" == "200" ]]; then
    echo "OK:   Gîtes de France certificate returns 200"
  else
    echo "FAIL: Certificate image returned HTTP ${CERT_CODE}"
    FAIL=1
  fi

  echo "==> Legacy WordPress redirects"
  check_redirect() {
    local path="$1"
    local expect_fragment="$2"
    LOC=$(curl -sI -H "Cache-Control: no-cache" "${SITE}${path}" | grep -i '^location:' | tr -d '\r' | awk '{print $2}')
    if [[ -n "$LOC" ]] && [[ "$LOC" == *"$expect_fragment"* ]]; then
      echo "OK:   ${path} redirects to ${LOC}"
    else
      echo "FAIL: ${path} expected redirect containing ${expect_fragment} (got: ${LOC:-none})"
      FAIL=1
    fi
  }
  check_redirect "/about/" "rates.html"
  check_redirect "/contact/" "contact.html"
  check_redirect "/check-availability/" "gallery.html"

  echo "==> SEO landing pages"
  SEO_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/villa-near-nice-airport.html")
  check_present_file "Nice Airport SEO page" "South of France" "$SEO_HTML"
  check_present_file "Nice Airport SEO H1" "near Nice Airport" "$SEO_HTML"

  LLMS=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/llms.txt")
  check_present_file "llms.txt for AI crawlers" "Villa Augflor" "$LLMS"
  check_present_file "llms.txt Nice Airport query" "villa-near-nice-airport.html" "$LLMS"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo ""
  echo "Production verification FAILED. Do not tell the user the change is live."
  echo "Fix: run scripts/deploy-production.sh or re-alias in Vercel dashboard."
  exit 1
fi

echo ""
echo "Production verification PASSED for ${URL}"
