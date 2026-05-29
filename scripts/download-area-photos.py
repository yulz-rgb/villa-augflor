#!/usr/bin/env python3
"""Download Wikimedia Commons images for the area guide (CC-licensed)."""
import json
import os
import time
import urllib.parse
import urllib.request

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "photos", "area")
UA = "VillaAugflorAreaGuide/1.0 (https://villa-augflor.com; villa.augflor@gmail.com)"

# id -> Wikimedia search query (picks first reasonable landscape result)
SEARCH = {
    "nice": "Promenade des Anglais Nice",
    "antibes": "Antibes old town France",
    "cannes": "Croisette Cannes",
    "monaco": "Monte Carlo Monaco",
    "eze-town": "Èze village France",
    "menton": "Menton France old town",
    "villefranche": "Villefranche-sur-Mer bay",
    "grasse": "Grasse France perfume",
    "haut-de-cagnes": "Haut-de-Cagnes",
    "st-paul-de-vence": "Saint-Paul-de-Vence village",
    "vence": "Vence France chapel",
    "mougins": "Mougins village France",
    "biot": "Biot village Alpes-Maritimes",
    "gourdon": "Gourdon Alpes-Maritimes village",
    "tourrettes-sur-loup": "Tourrettes-sur-Loup",
    "valbonne": "Valbonne village",
    "cros-de-cagnes": "Cros-de-Cagnes beach",
    "la-garoupe": "Plage Garoupe Cap d'Antibes",
    "juan-les-pins": "Juan-les-Pins beach",
    "plage-mala": "Plage Mala Cap d'Ail",
    "plage-passable": "Plage Passable Cap Ferrat",
    "paloma": "Paloma beach Cap Ferrat",
    "larvotto": "Larvotto Monaco beach",
    "fondation-maeght": "Fondation Maeght",
    "musee-picasso": "Musée Picasso Antibes château",
    "musee-matisse": "Musée Matisse Nice",
    "musee-chagall": "Musée Marc Chagall Nice",
    "villa-ephrussi": "Villa Ephrussi Rothschild",
    "musee-oceano-family": "Musée océanographique Monaco",
    "musee-renoir": "Musée Renoir Cagnes",
    "musee-leger": "Musée Fernand Léger Biot",
    "mamac": "MAMAC Nice",
    "sentier-cap-antibes": "Cap d'Antibes coastal path",
    "cap-ferrat-walk": "Saint-Jean-Cap-Ferrat",
    "gorges-du-loup": "Gorges du Loup waterfall",
    "verdon": "Gorges du Verdon lake",
    "esterel": "Massif Esterel coast",
    "mercantour": "Mercantour national park",
    "mont-boron": "Mont Boron Nice view",
    "lerins": "Île Sainte-Marguerite Cannes",
    "italy-trip": "Ventimiglia Italy market",
    "porquerolles": "Porquerolles island beach",
    "polygone": "Polygone Riviera Cagnes",
    "cours-saleya": "Cours Saleya Nice market",
    "antibes-market": "Marché provençal Antibes",
    "casino-monte-carlo": "Casino Monte Carlo",
    "mirazur": "Menton coast France",
    "colombe-dor": "Saint-Paul-de-Vence",
    "la-pesquiere": "Cros-de-Cagnes port",
    "socca-nice": "Socca Nice",
    "fenocchio": "Fenocchio Nice ice cream",
    "eze-sunset-dining": "Èze village view sea",
    "aquasplash": "Aquasplash Antibes",
    "parc-phoenix": "Parc Phoenix Nice",
    "train-pignes": "Chemins de fer de Provence train",
    "saint-tropez": "Saint-Tropez harbour",
    "cap3000": "CAP 3000 Saint-Laurent",
    "domaine-toasc": "Bellet wine Nice",
    "boat-charter": "Port Vauban Antibes yachts",
    "paddleboard": "Stand up paddle Mediterranean",
    "diving": "Scuba diving French Riviera",
    "louis-xv": "Hôtel de Paris Monaco",
    "juan-nightlife": "Juan-les-Pins night",
    "cannes-beach-clubs": "Cannes beach club",
    "nice-rooftops": "Promenade des Anglais sunset",
}

def api(params):
    q = urllib.parse.urlencode({**params, "format": "json"})
    req = urllib.request.Request(
        f"https://commons.wikimedia.org/w/api.php?{q}",
        headers={"User-Agent": UA},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)

def search_title(query):
    data = api({
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srnamespace": 6,
        "srlimit": 5,
    })
    hits = data.get("query", {}).get("search", [])
    for hit in hits:
        title = hit.get("title", "")
        if title.startswith("File:") and not any(
            x in title.lower() for x in ("logo", "icon", "map", "svg", "diagram", "coat of arms")
        ):
            return title
    return None

def thumb_for_title(title):
    data = api({
        "action": "query",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url",
        "iiurlwidth": "960",
    })
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        ii = page.get("imageinfo")
        if ii:
            return ii[0].get("thumburl") or ii[0].get("url")
    return None

def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=90) as resp:
        data = resp.read()
    with open(dest, "wb") as f:
        f.write(data)
    return len(data)

def main():
    os.makedirs(OUT, exist_ok=True)
    ok = []
    for pid, query in SEARCH.items():
        dest = os.path.join(OUT, f"{pid}.jpg")
        if os.path.exists(dest) and os.path.getsize(dest) > 5000:
            print(f"HAVE {pid}")
            ok.append(pid)
            continue
        try:
            title = search_title(query)
            if not title:
                print(f"SKIP {pid}: no search hit for {query!r}")
                continue
            url = thumb_for_title(title)
            if not url:
                print(f"SKIP {pid}: no thumb for {title}")
                continue
            size = download(url, dest)
            if size < 3000:
                os.remove(dest)
                print(f"SKIP {pid}: file too small")
                continue
            print(f"OK {pid} <- {title} ({size//1024} KB)")
            ok.append(pid)
            time.sleep(0.5)
        except Exception as e:
            print(f"ERR {pid}: {e}")
    print(f"\nTotal images: {len(ok)}")
    print("var IMAGES = {")
    for pid in sorted(ok):
        print(f'  "{pid}": "assets/photos/area/{pid}.jpg",')
    print("};")

if __name__ == "__main__":
    main()
