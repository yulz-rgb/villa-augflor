#!/usr/bin/env python3
"""Generate scripts/area-combine-with.js — pairing hints for every area guide card."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "scripts" / "area-guide.js"
OUT = ROOT / "scripts" / "area-combine-with.js"

# Authoritative pairings (override rules)
EXPLICIT = {
    "nice": "Cours Saleya market + socca at Chez Pipo",
    "antibes": "Marché Provençal + Picasso Museum + Juan-les-Pins beach",
    "cannes": "Îles de Lérins ferry + Croisette stroll",
    "monaco": "Oceanographic Museum + Larvotto Beach",
    "eze-town": "Fragonard perfume factory (Èze-sur-Mer) + sunset dinner",
    "menton": "Old town + lemon gardens; Mirazur by reservation",
    "villefranche": "Villefranche swim + Nice old town (train day)",
    "grasse": "Perfume workshop + Gorges du Loup drive",
    "saint-tropez": "Early start; Pampelonne lunch — full day",
    "haut-de-cagnes": "Musée Renoir (7 min) or Cros-de-Cagnes beach",
    "st-paul-de-vence": "Fondation Maeght (12 min)",
    "vence": "Saint-Paul-de-Vence village (11 min)",
    "mougins": "Picasso Museum Antibes or Cannes afternoon",
    "biot": "Musée Fernand Léger (14 min)",
    "tourrettes-sur-loup": "Gorges du Loup scenic drive",
    "gourdon": "Gorges du Loup waterfalls",
    "valbonne": "Antibes market morning (20 min)",
    "coaraze": "Peillon medieval village (51 min)",
    "peillon": "Coaraze sundials village (45 min)",
    "cros-de-cagnes": "Haut-de-Cagnes dinner (6 min)",
    "la-garoupe": "Sentier du Littoral coastal walk",
    "plage-passable": "Villa Ephrussi gardens (33 min)",
    "paloma": "Cap-Ferrat coastal path",
    "plage-mala": "Monaco afternoon by train",
    "juan-les-pins": "Antibes old town + market",
    "larvotto": "Monaco palace & old town",
    "aquasplash": "Antibes ramparts walk",
    "parc-phoenix": "Nice Promenade des Anglais",
    "marineland-note": "Oceanographic Museum Monaco or Aquasplash",
    "musee-oceano-family": "Monaco old town & Larvotto",
    "azur-park": "Cros-de-Cagnes beach evening",
    "speed-park": "Polygone cinema or beach",
    "gorges-loup-canyon": "Tourrettes-sur-Loup village",
    "train-pignes": "Nice old town before/after",
    "boat-charter": "Swim stop at Lérins or Cap d'Antibes",
    "jet-ski": "Juan-les-Pins lunch on the beach",
    "paddleboard": "Haut-de-Cagnes terrace lunch",
    "diving": "Cap d'Antibes coastal path",
    "sailing-school": "Antibes port dinner",
    "musee-renoir": "Haut-de-Cagnes or Cros beach",
    "fondation-maeght": "Saint-Paul-de-Vence village",
    "musee-picasso": "Antibes market + ramparts",
    "musee-matisse": "Cimiez gardens + Chagall Museum",
    "musee-chagall": "Nice old town walk",
    "villa-ephrussi": "Saint-Jean-Cap-Ferrat walk",
    "musee-leger": "Biot glass-blowing village",
    "mamac": "Cours Saleya & old Nice",
    "domaine-toasc": "Nice Bellet hillside views",
    "chateau-bellet": "Renoir Museum or Nice",
    "rose-estates": "Picnic at Cros-de-Cagnes",
    "organic-wine": "Gorges du Loup cool drive",
    "mirazur": "Menton old town morning",
    "louis-xv": "Casino terrace & Monaco walk",
    "colombe-dor": "Fondation Maeght morning",
    "le-caruso": "Fondation Maeght morning",
    "table-de-pierre": "Saint-Paul-de-Vence village before dinner",
    "cafe-timothe": "Saint-Paul-de-Vence village walk first",
    "sabai-sabai": "Saint-Paul-de-Vence village walk first",
    "les-remparts": "Saint-Paul-de-Vence village before dinner",
    "la-pesquiere": "Morning swim at Cros beach first",
    "table-de-kamiya": "Morning swim at Cros beach first",
    "l-agape": "Morning swim at Cros beach first",
    "ino-plage": "Morning swim at Cros beach first",
    "fleur-de-sel": "Haut-de-Cagnes village stroll before dinner",
    "socca-nice": "Cours Saleya market",
    "fenocchio": "Vieux-Nice & Cours Saleya",
    "bakery-local": "Pool breakfast at the villa",
    "pizza-nice": "Promenade sunset walk",
    "eze-sunset-dining": "Èze village before dinner",
    "sentier-cap-antibes": "La Garoupe swim + Antibes lunch",
    "cap-ferrat-walk": "Paloma Beach or Passable",
    "gorges-du-loup": "Gourdon clifftop village",
    "esterel": "Cannes or Saint-Raphaël lunch",
    "mercantour": "Full mountain day — villa rest next day",
    "mont-boron": "Villefranche swim or Nice dinner",
    "italy-trip": "Dolceacqua bridge village",
    "lerins": "Cannes morning before ferry",
    "verdon": "Valensole lavender (Jun–Jul) if timing fits",
    "porquerolles": "Overnight or very early ferry from Hyères",
    "polygone": "Renoir Museum or rainy cinema",
    "cap3000": "Cros-de-Cagnes seafront dinner",
    "cours-saleya": "Vieux-Nice & Fenocchio gelato",
    "antibes-market": "Picasso Museum + old town",
    "monaco-luxury": "Casino & palace district",
    "casino-monte-carlo": "Louis XV dinner (book ahead)",
    "cannes-beach-clubs": "La Croisette afternoon",
    "juan-nightlife": "Antibes old town dinner first",
    "nice-rooftops": "Old-town wine bars after sunset",
}

CAT_FALLBACK = {
    "destinations": "Pool & garden evening at Villa Augflor",
    "villages": "Local lunch, then pool or beach (6 min)",
    "beaches": "Haut-de-Cagnes dinner or villa terrace",
    "family": "Polygone Riviera (2 min) if weather turns",
    "watersports": "Antibes or Juan seafront lunch",
    "museums": "Village walk or market nearby",
    "wine": "Villa terrace tasting at sunset",
    "food": "Pool evening — walk off lunch",
    "nature": "Cros-de-Cagnes swim to cool down",
    "daytrips": "Early start; quiet villa evening",
    "shopping": "Cros-de-Cagnes or Haut-de-Cagnes dinner",
    "nightlife": "Train or taxi back to Cagnes-sur-Mer",
}


def parse_places() -> list[dict]:
    text = GUIDE.read_text(encoding="utf-8")
    chunks = re.split(r'\{\s*id:\s*"', text)[1:]
    out = []
    for chunk in chunks:
        m_id = re.match(r'([^"]+)"', chunk)
        if not m_id:
            continue
        pid = m_id.group(1)
        def grab(key: str, default: str = "") -> str:
            m = re.search(rf'{key}:\s*"([^"]*)"', chunk)
            return m.group(1) if m else default

        m_drive = re.search(r"drive:\s*(\d+)", chunk)
        m_cat = re.search(r'cat:\s*"([^"]+)"', chunk)
        m_why = re.search(r'why:\s*"([^"]*)"', chunk)
        out.append({
            "id": pid,
            "name": grab("name"),
            "cat": m_cat.group(1) if m_cat else "",
            "drive": int(m_drive.group(1)) if m_drive else 99,
            "why": m_why.group(1) if m_why else "",
        })
    return out


def why_hint(why: str) -> str | None:
    low = why.lower()
    for pat in (
        r"pair (?:it )?with ([^.—]+)",
        r"combine with ([^.—]+)",
        r"start at ([^,]+),",
        r"best as ([^.—]+)",
    ):
        m = re.search(pat, low)
        if m:
            return m.group(1).strip().capitalize()
    return None


def nearest_peer(place: dict, places: list[dict]) -> str | None:
    same = [
        p for p in places
        if p["id"] != place["id"] and p["cat"] == place["cat"]
        and p["drive"] <= place["drive"] + 18
    ]
    if not same:
        return None
    peer = min(same, key=lambda p: abs(p["drive"] - place["drive"]))
    if peer["drive"] == place["drive"]:
        return None
    return f"{peer['name']} ({peer['drive']} min)"


def combine_for(place: dict, places: list[dict]) -> str:
    if place["id"] in EXPLICIT:
        return EXPLICIT[place["id"]]
    hint = why_hint(place["why"])
    if hint:
        return hint[:80]
    peer = nearest_peer(place, places)
    if peer:
        return peer
    return CAT_FALLBACK.get(place["cat"], "Pool afternoon at Villa Augflor")


def main() -> None:
    places = parse_places()
    mapping = {p["id"]: combine_for(p, places) for p in places}
    js = f"""/* Auto-generated by scripts/generate-combine-with.py */
(function (global) {{
  "use strict";
  global.AREA_COMBINE_WITH = {json.dumps(mapping, indent=2, ensure_ascii=False)};
}})(typeof window !== "undefined" ? window : global);
"""
    OUT.write_text(js, encoding="utf-8")
    print(f"Wrote {OUT.name}: {len(mapping)} combine hints")


if __name__ == "__main__":
    main()
