#!/usr/bin/env bash
# Notify IndexNow (Bing, Yandex, Seznam, Naver — Bing also feeds DuckDuckGo/ChatGPT search)
# that key URLs changed. Run after each production deploy. Google does not use
# IndexNow — keep the sitemap fresh and use Search Console for Google.
set -euo pipefail

HOST="villa-augflor.com"
KEY="8dcf446cf15dd66ea7f5e5d8946fb007"

URLS=(
  "https://villa-augflor.com/"
  "https://villa-augflor.com/last-minute-villa.html"
  "https://villa-augflor.com/rates.html"
  "https://villa-augflor.com/villa-near-nice-airport.html"
  "https://villa-augflor.com/september-villa-cote-azur.html"
  "https://villa-augflor.com/gallery.html"
  "https://villa-augflor.com/area.html"
  "https://villa-augflor.com/book-direct-safely.html"
)

URL_LIST=$(printf '"%s",' "${URLS[@]}")
URL_LIST="[${URL_LIST%,}]"

BODY=$(cat <<JSON
{
  "host": "${HOST}",
  "key": "${KEY}",
  "keyLocation": "https://${HOST}/${KEY}.txt",
  "urlList": ${URL_LIST}
}
JSON
)

echo "==> Submitting ${#URLS[@]} URLs to IndexNow"
STATUS=$(curl -s -o /tmp/indexnow-resp.txt -w "%{http_code}" \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$BODY")

if [[ "$STATUS" == "200" || "$STATUS" == "202" ]]; then
  echo "OK: IndexNow accepted (HTTP ${STATUS})"
else
  echo "WARN: IndexNow returned HTTP ${STATUS} (non-fatal)"
  cat /tmp/indexnow-resp.txt 2>/dev/null || true
fi
