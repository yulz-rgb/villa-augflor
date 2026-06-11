#!/usr/bin/env bash
# Download CC-licensed Wikimedia Commons photos for the area guide (900px wide).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="assets/photos/area"
mkdir -p "$OUT"

fetch() {
  local id="$1" file="$2"
  local enc
  enc=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${file//\'/\\\'}', safe=''))")
  local url
  url=$(curl -s "https://commons.wikimedia.org/w/api.php?action=query&titles=File:${enc}&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json" \
    | python3 -c "import sys,json;d=json.load(sys.stdin);p=list(d['query']['pages'].values())[0];ii=p.get('imageinfo');print(ii[0]['thumburl'] if ii else '')")
  if [[ -z "$url" ]]; then
    echo "SKIP $id (no image for $file)" >&2
    return 1
  fi
  curl -sL "$url" -o "$OUT/${id}.jpg"
  echo "OK $id"
}

# id|Wikimedia filename
while IFS='|' read -r id file; do
  [[ -z "$id" || "$id" =~ ^# ]] && continue
  fetch "$id" "$file" || true
  sleep 0.3
done <<'EOF'
nice|Promenade des Anglais (Nice).jpg
antibes|Port Vauban Antibes.jpg
cannes|Cannes - Croisette.jpg
monaco|Monte Carlo Casino.jpg
eze-town|Èze Village.jpg
menton|Menton old town.jpg
villefranche|Villefranche-sur-Mer harbour.jpg
grasse|Grasse panorama.jpg
haut-de-cagnes|Haut-de-Cagnes.jpg
st-paul-de-vence|Saint-Paul de Vence.jpg
vence|Vence Alpes-Maritimes.jpg
mougins|Mougins village.jpg
biot|Biot village.jpg
gourdon|Gourdon Alpes-Maritimes.jpg
cros-de-cagnes|Cros-de-Cagnes beach.jpg
la-garoupe|Cap d'Antibes Garoupe beach.jpg
juan-les-pins|Juan-les-Pins beach.jpg
fondation-maeght|Fondation Maeght.jpg
musee-picasso|Château Grimaldi Antibes.jpg
musee-matisse|Matisse Museum Nice.jpg
musee-chagall|Marc Chagall National Museum Nice.jpg
villa-ephrussi|Villa Ephrussi de Rothschild.jpg
musee-oceano-family|Oceanographic Museum Monaco.jpg
musee-renoir|Musée Renoir Cagnes-sur-Mer.jpg
sentier-cap-antibes|Cap d'Antibes coastal path.jpg
gorges-du-loup|Gorges du Loup.jpg
verdon|Gorges du Verdon.jpg
lerins|Île Sainte-Marguerite.jpg
polygone|Polygone Riviera.jpg
cours-saleya|Cours Saleya Nice.jpg
casino-monte-carlo|Monte Carlo Casino.jpg
mirazur|Mirazur Menton.jpg
colombe-dor|La Colombe d'Or Saint-Paul.jpg
plage-mala|Plage Mala Cap d'Ail.jpg
esterel|Massif de l'Esterel.jpg
saint-tropez|Saint-Tropez harbour.jpg
EOF

echo "Done. $(ls -1 "$OUT"/*.jpg 2>/dev/null | wc -l | tr -d ' ') images in $OUT"
