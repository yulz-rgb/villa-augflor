#!/usr/bin/env python3
"""Download, credit, and optimize area guide images (Wikimedia Commons → WebP/AVIF)."""
from __future__ import annotations

import json
import os
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit("Pillow required: pip install Pillow") from exc

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "photos" / "area"
META_JS = ROOT / "scripts" / "area-image-meta.js"
CREDITS_JSON = OUT / "CREDITS.json"
UA = "VillaAugflorAreaGuide/2.0 (https://villa-augflor.com; villa.augflor@gmail.com)"

MAX_WIDTH = 1280
WEBP_QUALITY = 82
AVIF_QUALITY = 55
SIZES = (480, 960, 1280)

# id -> Wikimedia search query
SEARCH = {
    "nice": "Promenade des Anglais Nice aerial",
    "antibes": "Antibes ramparts old town France",
    "cannes": "La Croisette Cannes beach",
    "monaco": "Monaco harbour Monte Carlo panorama",
    "eze-town": "Èze village France medieval",
    "menton": "Menton old town harbour France",
    "villefranche": "Villefranche-sur-Mer bay France",
    "grasse": "Grasse old town France",
    "saint-tropez": "Saint-Tropez harbour yachts",
    "haut-de-cagnes": "Haut-de-Cagnes medieval village",
    "st-paul-de-vence": "Saint-Paul-de-Vence ramparts",
    "vence": "Vence France old town",
    "mougins": "Mougins village France",
    "biot": "Biot village France",
    "tourrettes-sur-loup": "Tourrettes-sur-Loup village",
    "gourdon": "Gourdon village Alpes-Maritimes",
    "valbonne": "Valbonne village square France",
    "coaraze": "Coaraze village sundial France",
    "peillon": "Peillon perched village France",
    "cros-de-cagnes": "Cros-de-Cagnes beach Cagnes-sur-Mer",
    "la-garoupe": "Plage de la Garoupe Cap d'Antibes",
    "plage-passable": "Plage Passable Saint-Jean-Cap-Ferrat",
    "paloma": "Paloma Beach Cap Ferrat",
    "plage-mala": "Plage Mala Cap d'Ail",
    "juan-les-pins": "Juan-les-Pins beach Antibes",
    "larvotto": "Larvotto beach Monaco",
    "aquasplash": "Aquasplash Antibes water park",
    "parc-phoenix": "Parc Phoenix Nice greenhouse",
    "musee-oceano-family": "Musée océanographique Monaco",
    "azur-park": "Funfair Mediterranean evening",
    "speed-park": "Indoor karting track",
    "gorges-loup-canyon": "Canyoning Gorges du Loup",
    "train-pignes": "Train des Pignes Nice Digne",
    "boat-charter": "Port Vauban Antibes yachts",
    "jet-ski": "Jet ski Mediterranean French Riviera",
    "paddleboard": "Stand up paddleboard Mediterranean beach",
    "diving": "Scuba diving Mediterranean reef",
    "sailing-school": "Catamaran sailing French Riviera",
    "musee-renoir": "Musée Renoir Cagnes-sur-Mer",
    "fondation-maeght": "Fondation Maeght sculpture garden",
    "musee-picasso": "Musée Picasso Antibes château",
    "musee-matisse": "Musée Matisse Nice Cimiez",
    "musee-chagall": "Musée Marc Chagall Nice",
    "villa-ephrussi": "Villa Ephrussi de Rothschild gardens",
    "musee-leger": "Musée Fernand Léger Biot",
    "mamac": "MAMAC Nice museum",
    "domaine-toasc": "Bellet vineyard Nice France",
    "chateau-bellet": "Château de Bellet Nice vineyard",
    "rose-estates": "Provence rosé vineyard terrace",
    "organic-wine": "Organic vineyard Provence hills",
    "mirazur": "Menton coast terraced gardens",
    "louis-xv": "Hôtel de Paris Monaco dining",
    "colombe-dor": "La Colombe d'Or Saint-Paul-de-Vence",
    "le-caruso": "Saint-Paul-de-Vence old town restaurant",
    "les-remparts": "Saint-Paul-de-Vence ramparts valley view",
    "sabai-sabai": "Saint-Paul-de-Vence village square",
    "la-pesquiere": "Cros-de-Cagnes port restaurant",
    "socca-nice": "Socca Nice street food",
    "fenocchio": "Fenocchio ice cream Nice",
    "bakery-local": "French bakery croissants patisserie",
    "pizza-nice": "Pizza socca Nice old town",
    "eze-sunset-dining": "Èze village sunset Mediterranean",
    "sentier-cap-antibes": "Sentier du Littoral Cap d'Antibes",
    "cap-ferrat-walk": "Saint-Jean-Cap-Ferrat coastal path",
    "gorges-du-loup": "Gorges du Loup waterfall France",
    "esterel": "Massif de l'Estérel red rocks coast",
    "mercantour": "Mercantour national park lake",
    "mont-boron": "Mont Boron Nice panorama",
    "italy-trip": "Ventimiglia market Italy",
    "lerins": "Île Sainte-Marguerite Cannes",
    "verdon": "Gorges du Verdon lake turquoise",
    "porquerolles": "Porquerolles island beach France",
    "polygone": "Polygone Riviera Cagnes-sur-Mer",
    "cap3000": "CAP3000 shopping centre Nice",
    "cours-saleya": "Cours Saleya market Nice flowers",
    "antibes-market": "Marché provençal Antibes",
    "monaco-luxury": "Monaco luxury boutiques Place du Casino",
    "casino-monte-carlo": "Casino de Monte-Carlo night",
    "cannes-beach-clubs": "Cannes beach club Croisette",
    "juan-nightlife": "Juan-les-Pins jazz festival night",
    "nice-rooftops": "Nice Baie des Anges sunset rooftop",
}

# Re-download these even when a .jpg already exists (bad search hits, PDFs, paintings, aliases).
FORCE = {
    "antibes", "cros-de-cagnes", "juan-les-pins", "diving", "sailing-school",
    "vence", "rose-estates", "organic-wine", "mirazur", "louis-xv",
    "colombe-dor", "eze-sunset-dining", "cannes-beach-clubs",
    "juan-nightlife", "mont-boron", "grasse", "nice-rooftops",
    "jet-ski", "fenocchio", "pizza-nice", "azur-park",
    "monaco-luxury", "paddleboard", "gorges-du-loup",
    "haut-de-cagnes", "monaco", "cap-ferrat-walk", "paloma",
    "le-caruso", "les-remparts", "sabai-sabai", "nice", "st-paul-de-vence",
    "aquasplash", "musee-chagall", "socca-nice",
}

# Exact Wikimedia File: titles — avoids bad search hits (PDFs, scans, wrong locations)
CURATED = {
    "haut-de-cagnes": "File:Haut-de-Cagnes (vue depuis le chateau).jpg",
    "monaco": "File:Monaco Monte Carlo 1.jpg",
    "antibes": "File:Antibes BW 2011-06-07 16-07-49.jpg",
    "cap-ferrat-walk": "File:20211209 122308 Le sentier du littoral à Saint-Jean-Cap-Ferrat.jpg",
    "paloma": "File:Paloma beach sunset.jpg",
    "domaine-toasc": "File:Vignoble de Nice.jpg",
    "paddleboard": "File:Stand up paddle au Cap d'Agde.jpg",
    "musee-chagall": "File:Musée national Marc Chagall 1.jpg",
    "peillon": "File:Peillon village perche sur la montagne.jpg",
    "azur-park": "File:Grande roue à Antibes.jpg",
    "speed-park": "File:Indoor karting.jpg",
    "jet-ski": "File:Nice Jet Ski under power - geograph.org.uk - 1873272.jpg",
    "sailing-school": "File:Täispurjes katamaraan - A catamaran in full sail (9025066124).jpg",
    "chateau-bellet": "File:Chateau-bellet-nice (2).jpg",
    "rose-estates": "File:Vignoble de Provence rosé.jpg",
    "organic-wine": "File:Vineyard in Provence.jpg",
    "fenocchio": "File:Glaces Fenocchio à Nice.jpg",
    "pizza-nice": "File:Pizza au feu de bois.jpg",
    "monaco-luxury": "File:Monte Carlo Casino square.jpg",
    "aquasplash": "File:Aquasplash SIDE WINDER - panoramio.jpg",
    "cros-de-cagnes": "File:Aerial photograph of Cros-de-Cagnes.jpg",
    "nice-rooftops": "File:Promenade des Anglais Nice sunset.jpg",
    "coaraze": "File:Coaraze village.jpg",
    "gorges-du-loup": "File:Cascade du Saut du Loup.jpg",
    "esterel": "File:Massif de l'Estérel.jpg",
    "juan-les-pins": "File:Juan-Les-Pins - Boulevard Édouard Baudoin - View West on Plage les Pirates.jpg",
    "diving": "File:Plongée sur la Gabinière.jpg",
    "valbonne": "File:0 Valbonne - Place des arcades.JPG",
    "vence": "File:Chapelle du Rosaire de Vence (4426949800).jpg",
    "le-caruso": "File:Saint-Paul-de-Vence BW 2011-06-09 12-19-00.JPG",
    "les-remparts": "File:France-002658 - Great View (15932145372).jpg",
    "sabai-sabai": "File:Saint-Paul-De-Vence and La Colle-sur-Loup 01.jpg",
    "nice": "File:Nice (06) Cours Saleya 802.jpg",
    "st-paul-de-vence": "File:Saint-Paul-de-Vence BW 2011-06-09 11-37-54.JPG",
    "mirazur": "File:Menton Old Town and Harbour.jpg",
    "louis-xv": "File:Monte-Carlo Hôtel de Paris.jpg",
    "colombe-dor": "File:Saint-Paul-de-Vence seen from La Colombe d'Or.jpg",
    "eze-sunset-dining": "File:Èze - General View from Grand-Corniche - 01.jpg",
    "cannes-beach-clubs": "File:06400 Cannes beach Croisette.jpg",
    "juan-nightlife": "File:Scène de Jazz à Juan-Les-Pins.jpg",
    "mont-boron": "File:Cap de Nice et Baie des Anges.jpg",
    "grasse": "File:06130 Grasse, France - panoramio.jpg",
}

REJECT_TITLE = (
    ".pdf", ".djvu", ".svg", "diagram", "map of", "logo", " ia_", "(ia ",
    "monet", "signac", "vallotton", "guizot", "krafft", "plan du", "billboard",
    "painting", "illustration", "scan", " engraving", "postcard", "stamp",
)

# Per-image object-position for 4:3 crop (meaningful area visible)
POSITION = {
    "antibes": "center 35%",
    "antibes-market": "center 40%",
    "paloma": "center 55%",
    "la-garoupe": "center 45%",
    "parc-phoenix": "center 35%",
    "grasse": "center 35%",
    "fondation-maeght": "center 40%",
    "gorges-du-loup": "center 55%",
    "train-pignes": "center 45%",
    "coaraze": "center 40%",
    "cannes-beach-clubs": "center 50%",
    "diving": "center 45%",
    "mont-boron": "center 55%",
    "sentier-cap-antibes": "center 60%",
    "nice": "center 55%",
    "monaco": "center 45%",
    "haut-de-cagnes": "center 40%",
    "eze-town": "center 45%",
    "st-paul-de-vence": "center 40%",
    "les-remparts": "center 45%",
    "vence": "center 40%",
    "nice": "center 45%",
    "cros-de-cagnes": "center 55%",
    "plage-mala": "center 50%",
    "villefranche": "center 55%",
    "menton": "center 50%",
    "mirazur": "center 45%",
}

CATEGORY_FALLBACK = {
    "destinations": "nice",
    "villages": "st-paul-de-vence",
    "beaches": "cros-de-cagnes",
    "family": "aquasplash",
    "watersports": "boat-charter",
    "museums": "fondation-maeght",
    "wine": "domaine-toasc",
    "food": "colombe-dor",
    "nature": "sentier-cap-antibes",
    "daytrips": "lerins",
    "shopping": "cours-saleya",
    "nightlife": "casino-monte-carlo",
}

ALT_OVERRIDES = {
    "haut-de-cagnes": "Haut-de-Cagnes medieval village near Villa Augflor",
    "cros-de-cagnes": "Cros-de-Cagnes beach, the nearest beach to Villa Augflor",
    "st-paul-de-vence": "Saint-Paul-de-Vence walled hill village and ramparts near Villa Augflor",
    "fondation-maeght": "Fondation Maeght museum courtyard and sculpture garden, Saint-Paul-de-Vence",
    "nice": "Cours Saleya market and Vieux-Nice old town near Villa Augflor",
    "la-garoupe": "Plage de la Garoupe sandy beach on Cap d'Antibes",
    "monaco": "Monaco harbour and Monte-Carlo viewed from the French Riviera",
    "plage-mala": "Plage Mala turquoise cove below Cap d'Ail",
    "polygone": "Polygone Riviera shopping centre in Cagnes-sur-Mer",
    "musee-renoir": "Musée Renoir villa and garden, Chemin des Collettes, Cagnes-sur-Mer",
    "marineland-note": "Oceanographic Museum Monaco — alternative to closed Marineland",
    "cros-de-cagnes": "Cros-de-Cagnes beach promenade, the nearest beach to Villa Augflor",
    "juan-les-pins": "Juan-les-Pins sandy beach and pines near Antibes",
    "diving": "Scuba diver in clear Mediterranean water",
    "sailing-school": "Catamaran sailing on the Mediterranean",
    "valbonne": "Charming Valbonne old village street with yellow buildings, fountain and festive garlands",
    "vence": "Vence old town square in the Alpes-Maritimes",
    "rose-estates": "Provence rosé vineyard terraces",
    "organic-wine": "Organic vineyard hills in Provence",
    "mirazur": "Menton old town and harbour on the Italian border",
    "louis-xv": "Hôtel de Paris Monte-Carlo, home of Le Louis XV",
    "la-pesquiere": "Seafood dish at Le Bistrot de la Marine, Cros-de-Cagnes seafront",
    "eze-sunset-dining": "Èze village and Mediterranean coast at sunset",
    "cannes-beach-clubs": "Cannes Croisette beach and seafront",
    "juan-nightlife": "Jazz at Juan-les-Pins — Riviera summer nightlife",
    "mont-boron": "Cap de Nice and Baie des Anges from Mont Boron",
    "grasse": "Grasse old town, perfume capital of the Riviera",
    "nice-rooftops": "Baie des Anges sunset — the view from Nice rooftop bars",
    "fenocchio": "Fenocchio gelato display in Vieux-Nice",
    "bakery-local": "Pastry display at Bour Pastry Bread Catering, Cagnes-sur-Mer",
    "pizza-nice": "Wood-fired pizza from a Niçoise pizzeria",
    "paddleboard": "Stand-up paddleboarding on calm Mediterranean water",
    "jet-ski": "Jet ski on the Mediterranean off the French Riviera",
    "azur-park": "Ferris wheel at Azur Park funfair near Villeneuve-Loubet",
    "aquasplash": "Aquasplash Side Winder water slide, Antibes",
    "monaco-luxury": "Monte-Carlo Casino square and luxury boutiques",
    "cap3000": "CAP 3000 shopping centre entrance, Saint-Laurent-du-Var",
    "colombe-dor": "Saint-Paul-de-Vence viewed from La Colombe d'Or",
    "le-caruso": "Provençal burrata and heirloom tomato salad — Saint-Paul-de-Vence dining",
    "les-remparts": "Les Remparts candlelit terrace with valley views at sunset, Saint-Paul-de-Vence",
    "sabai-sabai": "Sabaï-sabaï Thai restaurant terrace on Place de la Mairie, Saint-Paul-de-Vence",
    "vence": "Chapelle du Rosaire (Matisse Chapel) in Vence",
    "fleur-de-sel": "cozy Michelin-listed dining room, Haut-de-Cagnes",
    "cafe-timothe": "Café Timothé organic restaurant interior with dried flowers, Saint-Paul-de-Vence",
    "table-de-kamiya": "La Table de KAMIYA seafront dining room, Promenade de la Plage, Cros-de-Cagnes",
    "l-agape": "L'Agapè refined seafront dining, Promenade de la Plage, Cros-de-Cagnes",
    "ino-plage": "Ino Plage savoury pie and fresh salad at the Cros seafront, Promenade de la Plage",
    "table-de-pierre": "La Table de Pierre glass dining room, Domaine du Mas de Pierre, Saint-Paul-de-Vence",
}


def api(params: dict) -> dict:
    q = urllib.parse.urlencode({**params, "format": "json"})
    req = urllib.request.Request(
        f"https://commons.wikimedia.org/w/api.php?{q}",
        headers={"User-Agent": UA},
    )
    with urllib.request.urlopen(req, timeout=45) as resp:
        return json.load(resp)


def search_title(query: str) -> str | None:
    data = api({
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srnamespace": 6,
        "srlimit": 8,
    })
    skip = ("logo", "icon", "map", "svg", "diagram", "coat of arms", "stamp", "poster")
    for hit in data.get("query", {}).get("search", []):
        title = hit.get("title", "")
        low = title.lower()
        if title.startswith("File:") and not any(x in low for x in skip + REJECT_TITLE):
            return title
    return None


def fetch_image_info(title: str) -> dict | None:
    data = api({
        "action": "query",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size",
        "iiurlwidth": str(MAX_WIDTH),
    })
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        ii = page.get("imageinfo")
        if ii:
            return ii[0]
    return None


def clean_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text or "")
    return text.replace("&nbsp;", " ").strip()


def parse_credit(ext: dict) -> dict:
    artist = clean_html(ext.get("Artist", {}).get("value", ""))
    license_short = clean_html(ext.get("LicenseShortName", {}).get("value", ""))
    credit = clean_html(ext.get("Credit", {}).get("value", ""))
    attribution = artist
    if license_short:
        attribution = f"{artist} / Wikimedia Commons / {license_short}" if artist else f"Wikimedia Commons / {license_short}"
    return {
        "author": artist or "Unknown",
        "license": license_short or "See Wikimedia Commons",
        "credit": attribution,
        "creditHtml": credit,
    }


def download(url: str, dest: Path) -> int:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = resp.read()
    dest.write_bytes(data)
    return len(data)


def save_variants(src_jpg: Path, pid: str) -> dict:
    img = Image.open(src_jpg)
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    w, h = img.size
    variant_map = {}
    for target in SIZES:
        if w < 400 and target > w:
            continue
        tw = min(w, target)
        if tw in variant_map:
            continue
        ratio = tw / w
        scaled = img if tw == w else img.resize((tw, max(1, int(h * ratio))), Image.Resampling.LANCZOS)
        webp = OUT / f"{pid}-{tw}w.webp"
        scaled.save(webp, "WEBP", quality=WEBP_QUALITY, method=6)
        variant_map[tw] = f"{pid}-{tw}w.webp"
        try:
            avif = OUT / f"{pid}-{tw}w.avif"
            scaled.save(avif, "AVIF", quality=AVIF_QUALITY)
        except Exception:
            pass
    return {"width": w, "height": h, "variants": variant_map}


def default_alt(pid: str) -> str:
    if pid in ALT_OVERRIDES:
        return ALT_OVERRIDES[pid]
    name = pid.replace("-", " ").title()
    return f"{name} near Villa Augflor, French Riviera"


def download_one(pid: str, query: str, credits: dict, optimize_only: bool = False) -> bool:
    dest = OUT / f"{pid}.jpg"
    if optimize_only:
        return dest.exists()

    curated = CURATED.get(pid)
    must_fetch = pid in FORCE

    if dest.exists() and not must_fetch:
        if pid not in credits:
            print(f"  credit-only {pid}")
        else:
            print(f"  skip {pid}")
        return True
    try:
        title = curated or search_title(query)
        if not title:
            print(f"  FAIL {pid}: no search hit")
            return dest.exists()
        low = title.lower()
        if any(x in low for x in REJECT_TITLE):
            print(f"  FAIL {pid}: rejected non-photo {title}")
            return dest.exists() if not curated else False
        info = fetch_image_info(title)
        if not info:
            print(f"  FAIL {pid}: no imageinfo")
            return dest.exists()
        ow, oh = info.get("width", 0), info.get("height", 0)
        if ow < 640 or oh < 400:
            print(f"  FAIL {pid}: too small {ow}x{oh}")
            return dest.exists() if not curated else False
        if ow / max(oh, 1) > 3.5 or oh / max(ow, 1) > 2.5:
            print(f"  FAIL {pid}: extreme aspect {ow}x{oh}")
            return dest.exists() if not curated else False
        url = info.get("thumburl") or info.get("url")
        if not url:
            return dest.exists()
        size = download(url, dest)
        if size < 5000:
            print(f"  FAIL {pid}: too small ({size} B)")
            return dest.exists()
        ext = info.get("extmetadata", {})
        cr = parse_credit(ext)
        page_url = f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"
        credits[pid] = {
            "destinationId": pid,
            "wikimediaTitle": title,
            "sourceUrl": page_url,
            "author": cr["author"],
            "license": cr["license"],
            "credit": cr["credit"],
            "imageFile": f"assets/photos/area/{pid}.jpg",
        }
        print(f"  OK {pid} <- {title} ({size // 1024} KB, {info.get('width')}x{info.get('height')})")
        time.sleep(1.0 if pid in FORCE else 0.4)
        return True
    except Exception as exc:
        print(f"  ERR {pid}: {exc}")
        return dest.exists()


def build_meta_js(credits: dict, dimensions: dict) -> None:
    entries = {}
    for pid in sorted(set(list(SEARCH.keys()) + list(credits.keys()))):
        jpg = OUT / f"{pid}.jpg"
        if not jpg.exists():
            continue
        dim = dimensions.get(pid, {})
        pos = POSITION.get(pid, "center center")
        cr = credits.get(pid, {})
        entries[pid] = {
            "alt": default_alt(pid),
            "position": pos,
            "credit": cr.get("credit", "Wikimedia Commons"),
            "source": cr.get("sourceUrl", ""),
            "license": cr.get("license", ""),
            "author": cr.get("author", ""),
            "width": dim.get("width"),
            "height": dim.get("height"),
            "variants": dim.get("variants", {}),
        }
    js = f"""/* Auto-generated by scripts/area-images-pipeline.py — do not edit by hand */
(function (global) {{
  "use strict";
  global.AREA_IMAGE_META = {json.dumps(entries, indent=2, ensure_ascii=False)};
  global.AREA_CATEGORY_FALLBACK = {json.dumps(CATEGORY_FALLBACK, indent=2)};
}})(typeof window !== "undefined" ? window : global);
"""
    META_JS.write_text(js, encoding="utf-8")


def write_credits_txt(credits: dict) -> None:
    lines = [
        "Villa Augflor Area Guide — Image Credits",
        "=========================================",
        "Photos sourced from Wikimedia Commons unless noted.",
        "Full metadata: CREDITS.json",
        "",
    ]
    for pid in sorted(credits.keys()):
        c = credits[pid]
        lines.append(f"{pid}")
        lines.append(f"  Credit: {c.get('credit', '')}")
        lines.append(f"  Source: {c.get('sourceUrl', '')}")
        lines.append(f"  License: {c.get('license', '')}")
        lines.append("")
    (OUT / "CREDITS.txt").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    import sys
    optimize_only = "--optimize-only" in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    credits: dict = {}
    if CREDITS_JSON.exists():
        credits = json.loads(CREDITS_JSON.read_text(encoding="utf-8"))

    if not optimize_only:
        print("=== Download ===")
        for pid, query in SEARCH.items():
            download_one(pid, query, credits, optimize_only=False)
        print("=== Curated fetch ===")
        for pid, title in CURATED.items():
            if pid not in SEARCH and not (OUT / f"{pid}.jpg").exists():
                download_one(pid, SEARCH.get(pid, pid), credits, optimize_only=False)
            elif pid in CURATED:
                # force curated title for listed keys
                old = CURATED.get(pid)
                CURATED[pid] = old
                dest = OUT / f"{pid}.jpg"
                try:
                    info = fetch_image_info(CURATED[pid])
                    if info:
                        url = info.get("thumburl") or info.get("url")
                        ow, oh = info.get("width", 0), info.get("height", 0)
                        if url and ow >= 640 and oh >= 400:
                            need = pid in FORCE or not dest.exists() or ow > 800
                            if pid == "haut-de-cagnes" or pid == "antibes" or pid == "paloma":
                                need = True
                            if need:
                                download(url, dest)
                                ext = info.get("extmetadata", {})
                                cr = parse_credit(ext)
                                page_url = f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(CURATED[pid].replace(' ', '_'))}"
                                credits[pid] = {
                                    "destinationId": pid,
                                    "wikimediaTitle": CURATED[pid],
                                    "sourceUrl": page_url,
                                    "author": cr["author"],
                                    "license": cr["license"],
                                    "credit": cr["credit"],
                                    "imageFile": f"assets/photos/area/{pid}.jpg",
                                }
                                print(f"  CURATED OK {pid} ({ow}x{oh})")
                                time.sleep(1.2)
                except Exception as exc:
                    print(f"  CURATED ERR {pid}: {exc}")
                    time.sleep(2)
    else:
        print("=== Optimize only (skip download) ===")

    print("\n=== Optimize ===")
    dimensions = {}
    for jpg in sorted(OUT.glob("*.jpg")):
        pid = jpg.stem
        try:
            dimensions[pid] = save_variants(jpg, pid)
            print(f"  webp {pid} {dimensions[pid]['width']}x{dimensions[pid]['height']}")
        except Exception as exc:
            print(f"  ERR optimize {pid}: {exc}")

    CREDITS_JSON.write_text(json.dumps(credits, indent=2, ensure_ascii=False), encoding="utf-8")
    write_credits_txt(credits)
    build_meta_js(credits, dimensions)
    import subprocess
    subprocess.run(["python3", str(ROOT / "scripts" / "generate-area-qc.py")], check=False)
    print(f"\nDone: {len(credits)} credits, meta → {META_JS.name}")


if __name__ == "__main__":
    main()
