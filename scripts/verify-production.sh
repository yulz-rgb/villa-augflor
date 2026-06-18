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
  # Use here-string, not a pipe — pipefail + SIGPIPE from grep -q breaks the if-test.
  if grep -qiE -- "$pattern" <<< "$content"; then
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
  if grep -Fq -- "$pattern" <<< "$content"; then
    echo "OK:   ${label} present"
  else
    echo "FAIL: ${label} missing (expected: ${pattern})"
    FAIL=1
  fi
}

check_present_path() {
  local label="$1"
  local pattern="$2"
  local file="$3"
  if grep -Fq "$pattern" "$file"; then
    echo "OK:   ${label} present"
  else
    echo "FAIL: ${label} missing (expected: ${pattern})"
    FAIL=1
  fi
}

check_absent_path() {
  local label="$1"
  local pattern="$2"
  local file="$3"
  if grep -qiE "$pattern" "$file"; then
    echo "FAIL: ${label} still present on live site (matched: ${pattern})"
    FAIL=1
  else
    echo "OK:   ${label} absent"
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
  check_present "Homepage primary WhatsApp CTA" "Check availability on WhatsApp"
  check_present "Homepage hero headline" "Private Pool Villa near Nice — Your Riviera Base for Summer 2026"
  check_absent "Homepage Le Provance typo" "Le Provance"
  check_absent "Homepage inline guidebook tabs" "guidebook-tabs"
  check_absent "Homepage save 20% footer" "save 20%"
  check_present "Homepage trust FAQ pool private" "Is the pool private?"
  check_absent "Homepage inline full terms tabs" "Guest Responsibility"

  echo "==> Fetching ${SITE%/}/terms.html"
  TERMS_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/terms.html")
  check_present_file "Terms page cancellation policy" "Cancellation Policy" "$TERMS_HTML"
  check_present_file "Terms page security deposit" "€500 security deposit" "$TERMS_HTML"

  echo "==> Fetching ${SITE%/}/de/"
  DE_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/de/")
  check_present_file "German landing 4-star tax" "€2,53" "$DE_HTML"
  check_present_file "German landing WhatsApp CTA" "Verfügbarkeit auf WhatsApp" "$DE_HTML"

  echo "==> Fetching ${SITE%/}/nl/"
  NL_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/nl/")
  check_present_file "Dutch landing peak example" "€3.551" "$NL_HTML"
  check_present_file "Dutch landing WhatsApp CTA" "Beschikbaarheid op WhatsApp" "$NL_HTML"

  echo "==> Fetching ${SITE%/}/contact.html"
  CONTACT_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/contact.html")
  check_present_file "Contact enquiry form" "data-enquiry-form" "$CONTACT_HTML"

  echo "==> Fetching ${SITE%/}/area.html"
  AREA_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/area.html")
  check_present_file "Area guide ag-grid" 'id="ag-grid"' "$AREA_HTML"

  PHOTO_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Cache-Control: no-cache" "$SITE/assets/photos/area/nice-960w.webp")
  if [[ "$PHOTO_CODE" == "200" ]]; then
    echo "OK:   Area guide sample photo (nice-960w.webp) returns 200"
  else
    echo "FAIL: Area guide photo nice-960w.webp returned HTTP ${PHOTO_CODE}"
    FAIL=1
  fi

  echo "==> Fetching ${SITE%/}/scripts/area-guide.js"
  AREA_JS_TMP=$(mktemp)
  curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "${SITE%/}/scripts/area-guide.js?verify=$(date +%s)" -o "$AREA_JS_TMP"
  check_absent_path "Area guide La Pesquière Cagnes mislink" 'Restaurant La Pesquière, Cagnes' "$AREA_JS_TMP"
  check_absent_path "Area guide Speed Park Villeneuve mislink" 'Speed Park, Villeneuve-Loubet' "$AREA_JS_TMP"
  check_present_path "Area guide Cros seafood picks" "Bistrot de la Marine" "$AREA_JS_TMP"
  check_present_path "Area guide Cafe Timothe Saint-Paul" "cafe-timothe" "$AREA_JS_TMP"
  check_present_path "Area guide Le Caruso temporarily closed" "temporarily closed" "$AREA_JS_TMP"
  check_present_path "Area guide Le Caruso id retained" "le-caruso" "$AREA_JS_TMP"
  check_present_path "Area guide La Table de KAMIYA Cros" "table-de-kamiya" "$AREA_JS_TMP"
  check_present_path "Area guide L'Agape Cros seafront" "l-agape" "$AREA_JS_TMP"
  check_present_path "Area guide Ino Plage Cros beachfront" "ino-plage" "$AREA_JS_TMP"
  check_present_path "Area guide Fleur de Sel Michelin walkable" "fleur-de-sel" "$AREA_JS_TMP"
  check_present_path "Area guide La Table de Pierre luxury" "table-de-pierre" "$AREA_JS_TMP"
  check_present_path "Area guide Casa Leya Nice pizza" "pizza-nice" "$AREA_JS_TMP"
  check_absent_path "Area guide sub-4.5 Colombe d'Or food card" 'id: "colombe-dor".*cat: "food"' "$AREA_JS_TMP"
  check_absent_path "Area guide sub-4.5 Pizza Cresci" "Pizza Cresci" "$AREA_JS_TMP"
  check_present_path "Area guide Speed Park Cagnes address" "137 Avenue des Alpes" "$AREA_JS_TMP"
  rm -f "$AREA_JS_TMP"

  echo "==> Fetching ${SITE%/}/rates.html"
  RATES_HTML=$(curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "$SITE/rates.html")
  check_present_file "Rates page €420 shoulder" "From €420 / night" "$RATES_HTML"
  check_present_file "Rates page €480 peak" "€480<small>/ night</small>" "$RATES_HTML"
  check_present_file "Rates 4-star taxe rate" "€2.53" "$RATES_HTML"
  check_present_file "Rates peak example total" "€3,551" "$RATES_HTML"
  check_absent "Rates page old €450 pricing" 'From €450 / night' "$RATES_HTML"
  check_present_file "Rates page calendar" "data-calendar" "$RATES_HTML"
  check_present_file "Rates page open dates summary" "data-open-windows" "$RATES_HTML"

  echo "==> Fetching ${SITE%/}/book-direct-safely.html"
  BDS_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/book-direct-safely.html")
  check_present_file "Book direct safely page" "Book direct" "$BDS_HTML"
  check_present_file "30% deposit on book-direct page" "30% deposit" "$BDS_HTML"

  echo "==> Fetching ${SITE%/}/gallery.html"
  GALLERY_TMP=$(mktemp)
  curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "${SITE%/}/gallery.html" -o "$GALLERY_TMP"
  if grep -Fq '<h2>Pool &amp; garden</h2>' "$GALLERY_TMP"; then
    echo "OK:   Gallery pool section present"
  else
    echo "FAIL: Gallery pool section missing (expected: <h2>Pool &amp; garden</h2>)"
    FAIL=1
  fi
  if grep -Fq 'id="lightbox"' "$GALLERY_TMP"; then
    echo "OK:   Gallery lightbox present"
  else
    echo "FAIL: Gallery lightbox missing"
    FAIL=1
  fi
  if grep -Fq 'steep staircase' "$GALLERY_TMP"; then
    echo "OK:   Gallery loft caption present"
  else
    echo "FAIL: Gallery loft caption missing"
    FAIL=1
  fi
  if grep -Fq 'url=/#gallery' "$GALLERY_TMP"; then
    echo "FAIL: Gallery redirect stub still present on live site"
    FAIL=1
  else
    echo "OK:   Gallery redirect stub absent"
  fi
  rm -f "$GALLERY_TMP"

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
  check_redirect "/terms-conditions/" "terms.html"

  echo "==> SEO landing pages"
  SEO_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/villa-near-nice-airport.html")
  check_present_file "Nice Airport SEO page" "South of France" "$SEO_HTML"
  check_present_file "Nice Airport SEO H1" "near Nice Airport" "$SEO_HTML"

  LLMS=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/llms.txt")
  check_present_file "llms.txt for AI crawlers" "Villa Augflor" "$LLMS"
  check_present_file "llms.txt Nice Airport query" "villa-near-nice-airport.html" "$LLMS"
  check_present_file "llms.txt current availability section" "Current availability" "$LLMS"

  echo "==> Static open-weeks availability (June 2026 SEO refresh)"
  check_absent "Homepage static open weeks block" "data-open-weeks-static"
  check_present "Homepage absolute og:image" 'property="og:image" content="https://villa-augflor.com/'
  check_present_file "Rates static open weeks block" "data-open-weeks-static" "$RATES_HTML"

  echo "==> Fetching ${SITE%/}/last-minute-villa.html"
  LM_HTML=$(curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "$SITE/last-minute-villa.html")
  check_present_file "Last-minute page H1" "these weeks are still open" "$LM_HTML"
  check_present_file "Last-minute page open weeks block" "data-open-weeks-static" "$LM_HTML"
  check_present_file "Last-minute page offers schema" "availabilityStarts" "$LM_HTML"
  if grep -Fq 'url=/' <<< "$LM_HTML" && grep -Fq 'http-equiv="refresh"' <<< "$LM_HTML"; then
    echo "FAIL: last-minute-villa.html still serving redirect stub"
    FAIL=1
  else
    echo "OK:   last-minute-villa.html serves real page"
  fi

  SITEMAP=$(curl -fsSL -H "Cache-Control: no-cache" "$SITE/sitemap.xml")
  check_present_file "Sitemap last-minute page" "last-minute-villa.html" "$SITEMAP"

  INDEXNOW_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/8dcf446cf15dd66ea7f5e5d8946fb007.txt")
  if [[ "$INDEXNOW_CODE" == "200" ]]; then
    echo "OK:   IndexNow key file returns 200"
  else
    echo "FAIL: IndexNow key file returned HTTP ${INDEXNOW_CODE}"
    FAIL=1
  fi

  echo "==> Stale-date guard (availability copy must not reference past months as open)"
  STALE_PATTERN='Open to enquire:</strong> [^<]*\b(Jan|Feb|Mar|Apr|May)\b'
  check_absent "Homepage stale pre-summer open months" "$STALE_PATTERN"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo ""
  echo "Production verification FAILED. Do not tell the user the change is live."
  echo "Fix: run scripts/deploy-production.sh or re-alias in Vercel dashboard."
  exit 1
fi

echo ""
echo "Production verification PASSED for ${URL}"
