#!/usr/bin/env python3
"""Generate scripts/area-image-qc.js — per-card image quality control metadata."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "scripts" / "area-guide.js"
CREDITS = ROOT / "assets" / "photos" / "area" / "CREDITS.json"
OUT = ROOT / "scripts" / "area-image-qc.js"

# place_id -> image asset id (when different)
IMAGE_MAP = {
    "marineland-note": "musee-oceano-family",
}

# Per-place QC overrides (audit findings + approved alt text)
OVERRIDES = {
    "antibes": {
        "imageAlt": "Antibes château and Picasso Museum above the old town",
        "imageStatus": "approved",
        "notes": "Antibes château photo until dedicated old-town ramparts shot is sourced.",
    },
    "cros-de-cagnes": {
        "imageAlt": "Cros-de-Cagnes beach promenade and waterfront, nearest beach to Villa Augflor",
        "imageStatus": "approved",
        "notes": "Villa Augflor photo — beach, promenade and harbour.",
    },
    "polygone": {
        "imageAlt": "Polygone Riviera shopping promenade and Le Guetteur sculpture, Cagnes-sur-Mer",
        "imageStatus": "approved",
        "notes": "Villa Augflor photo — Shopping Promenade entrance.",
    },
    "speed-park": {
        "imageAlt": "Speed Park bowling alleys with neon lanes near Cagnes-sur-Mer",
        "imageStatus": "approved",
        "notes": "Villa Augflor photo — bowling at Speed Park.",
    },
    "juan-les-pins": {
        "imageAlt": "Plage les Pirates sandy beach at Juan-les-Pins, Antibes",
        "imageStatus": "approved",
        "notes": "Juan-les-Pins beach on Boulevard Édouard Baudoin.",
    },
    "diving": {
        "imageAlt": "Scuba diver in clear Mediterranean water off the French Riviera",
        "imageStatus": "approved",
        "notes": "Scuba diving in Port-Cros national park waters.",
    },
    "sailing-school": {
        "imageAlt": "Catamaran sailing on the Mediterranean off the French Riviera",
        "imageStatus": "approved",
        "notes": "Catamaran day-sail setting near Antibes.",
    },
    "valbonne": {
        "imageStatus": "approved",
        "imageAlt": "Charming Valbonne old village street with yellow buildings, fountain and festive garlands",
        "notes": "User-provided photo — old village street with fountain and garlands.",
    },
    "vence": {
        "imageStatus": "approved",
        "imageAlt": "Chapelle du Rosaire (Matisse Chapel) in Vence",
        "notes": "Matisse Chapel exterior — Vence art highlight.",
    },
    "rose-estates": {
        "imageAlt": "Bellet vineyard terraces above Nice — typical rosé country",
        "imageStatus": "approved",
        "notes": "Vineyard photo represents Provence rosé estate days.",
    },
    "organic-wine": {
        "imageAlt": "Château de Bellet vineyard above the Var valley",
        "imageStatus": "approved",
        "notes": "Replaced US soil-conservation PDF with Bellet vineyard photo.",
    },
    "mirazur": {
        "imageAlt": "Menton old town and harbour on the Italian border",
        "imageStatus": "approved",
        "caption": "Menton coast — Mirazur's home town",
        "notes": "Replaced Victorian book PDF; shows Mirazur's Menton setting.",
    },
    "louis-xv": {
        "imageAlt": "Casino de Monte-Carlo and Hôtel de Paris district, Monaco",
        "imageStatus": "approved",
        "notes": "Replaced floor-plan archive with Monaco luxury dining district.",
    },
    "colombe-dor": {
        "imageAlt": "Saint-Paul-de-Vence ramparts near La Colombe d'Or",
        "imageStatus": "approved",
        "notes": "Village setting of the legendary auberge.",
    },
    "la-pesquiere": {
        "imageAlt": "Provençal market at Antibes — typical of local seafood dining",
        "imageStatus": "approved",
        "caption": "Local market — Cros-de-Cagnes seafront",
        "notes": "Market photo until dedicated Cros-de-Cagnes port restaurant shot is sourced.",
    },
    "eze-sunset-dining": {
        "imageAlt": "Èze village perched above the Mediterranean",
        "imageStatus": "approved",
        "notes": "Èze village photo for sunset dining setting.",
    },
    "cannes-beach-clubs": {
        "imageAlt": "La Croisette beach and promenade, Cannes",
        "imageStatus": "approved",
        "notes": "Replaced 19th-century book PDF with Croisette beach.",
    },
    "juan-nightlife": {
        "imageAlt": "Cap d'Antibes coast near Juan-les-Pins — summer nightlife strip",
        "imageStatus": "approved",
        "caption": "Juan-les-Pins resort coast",
        "notes": "Replaced 1922 magazine PDF; coastal resort setting for nightlife.",
    },
    "mont-boron": {
        "imageAlt": "Sentier du Littoral coastal walk — typical of Mont Boron and Cap de Nice hikes",
        "imageStatus": "approved",
        "caption": "Coastal path — Mont Boron area",
        "notes": "Coastal walk photo until Mont Boron summit panorama is sourced.",
    },
    "grasse": {
        "imageStatus": "remove",
        "imageAlt": "Grasse old town, perfume capital of the French Riviera",
        "notes": "Gradient tile until Grasse-specific photo is sourced.",
    },
    "nice-rooftops": {
        "imageAlt": "Villefranche bay at golden hour — the kind of view Nice rooftop bars overlook",
        "imageStatus": "approved",
        "notes": "Bay sunset photo; no longer duplicates generic Nice card.",
    },
    "fenocchio": {
        "imageStatus": "remove",
        "imageAlt": "Fenocchio gelato display in Vieux-Nice",
        "notes": "Gradient tile until Fenocchio-specific photo is sourced.",
    },
    "bakery-local": {
        "imageAlt": "Fresh butter croissants at a French patisserie",
        "imageStatus": "approved",
        "notes": "Croissants photo from Wikimedia Commons.",
    },
    "pizza-nice": {
        "imageStatus": "remove",
        "imageAlt": "Wood-fired pizza from a Niçoise pizzeria",
        "notes": "Gradient tile — was incorrectly showing socca.",
    },
    "paddleboard": {
        "imageAlt": "Stand-up paddleboarding on the Mediterranean near Cagnes-sur-Mer",
        "imageStatus": "approved",
        "notes": "Villa Augflor photo — SUP and kayak hire near the villa.",
    },
    "jet-ski": {
        "imageAlt": "Jet ski on the Mediterranean off the French Riviera",
        "imageStatus": "approved",
        "notes": "Jet-ski action on the Riviera coast.",
    },
    "azur-park": {
        "imageAlt": "Indoor karting track — family activities near the coast",
        "imageStatus": "approved",
        "caption": "Family activities — Villeneuve-Loubet area",
        "notes": "Family fun photo until Azur Park funfair shot is sourced.",
    },
    "monaco-luxury": {
        "imageAlt": "Larvotto Beach promenade and shopping, Monaco",
        "imageStatus": "approved",
        "notes": "Monaco seafront setting for luxury shopping district.",
    },
    "cap3000": {
        "imageAlt": "Open-air shopping centre architecture — similar Riviera mall style to CAP3000",
        "imageStatus": "approved",
        "caption": "Riviera shopping centre",
        "notes": "Regional mall photo until CAP3000-specific shot is sourced.",
    },
    "gorges-loup-canyon": {
        "imageAlt": "Canyoning in the Gorges du Loup",
        "imageStatus": "approved",
    },
    "nice": {
        "imageAlt": "Cours Saleya market and old town lanes in Vieux-Nice",
        "imageStatus": "approved",
    },
    "le-caruso": {
        "imageAlt": "Provençal burrata and heirloom tomato salad — Saint-Paul-de-Vence dining",
        "imageStatus": "approved",
        "notes": "Temporarily closed — representative Saint-Paul food photo.",
    },
    "les-remparts": {
        "imageAlt": "Les Remparts candlelit terrace with valley views at sunset, Saint-Paul-de-Vence",
        "imageStatus": "approved",
    },
    "sabai-sabai": {
        "imageAlt": "Sabaï-sabaï Thai restaurant terrace on Place de la Mairie, Saint-Paul-de-Vence",
        "imageStatus": "approved",
    },
    "st-paul-de-vence": {
        "imageAlt": "Saint-Paul-de-Vence walled hill village and ramparts near Villa Augflor",
        "imageStatus": "approved",
    },
    "haut-de-cagnes": {
        "imageAlt": "Haut-de-Cagnes hilltop village and Château Grimaldi above Cagnes-sur-Mer",
        "imageStatus": "approved",
        "notes": "Villa Augflor photo — hilltop village and castle view.",
    },
    "aquasplash": {
        "imageAlt": "Aquasplash Side Winder water slide, Antibes",
        "imageStatus": "approved",
    },
    "socca-nice": {"imageAlt": "Socca — traditional Niçoise chickpea flatbread", "imageStatus": "approved"},
    "marineland-note": {
        "image": "musee-oceano-family",
        "imageAlt": "Oceanographic Museum Monaco — recommended alternative to closed Marineland",
        "imageStatus": "approved",
        "notes": "Intentional alias to Monaco oceanographic museum.",
    },
    "ino-plage": {
        "imageAlt": "Ino Plage savoury pie and fresh salad at the Cros seafront, Promenade de la Plage",
        "imageStatus": "approved",
    },
    "fondation-maeght": {
        "imageAlt": "Fondation Maeght museum courtyard and sculpture garden, Saint-Paul-de-Vence",
        "imageStatus": "approved",
    },
}

REJECT_PATTERNS = (
    ".pdf", ".djvu", " ia_", "monet", "signac", "vallotton", "guizot",
    "krafft", "billboard", "plan du",
)


def parse_places() -> list[dict]:
    text = GUIDE.read_text(encoding="utf-8")
    blocks = re.findall(
        r'\{\s*id:\s*"([^"]+)"\s*,\s*name:\s*"([^"]+)"\s*,\s*cat:\s*"([^"]+)"',
        text,
    )
    return [{"id": b[0], "name": b[1], "cat": b[2]} for b in blocks]


def is_bad_credit(credit: dict | None) -> bool:
    if not credit:
        return False
    title = (credit.get("wikimediaTitle") or "").lower()
    return any(p in title for p in REJECT_PATTERNS)


def has_webp(image_id: str) -> bool:
    area = ROOT / "assets" / "photos" / "area"
    return any(area.glob(f"{image_id}*.webp"))


def main() -> None:
    credits = json.loads(CREDITS.read_text(encoding="utf-8")) if CREDITS.exists() else {}
    entries = {}
    missing_files = []
    for place in parse_places():
        pid = place["id"]
        image_id = IMAGE_MAP.get(pid, pid)
        ov = OVERRIDES.get(pid, {})
        cr = credits.get(image_id, {})
        status = ov.get("imageStatus")
        file_ok = has_webp(image_id)
        if not file_ok and status != "remove":
            missing_files.append(image_id)
        if status == "remove":
            pass  # intentional gradient tile
        elif not status:
            if not file_ok:
                status = "remove"
                ov.setdefault("notes", "No WebP on disk — category fallback tile.")
            elif is_bad_credit(cr):
                status = "needsReplacement"
            else:
                status = "approved"
        elif status == "approved" and not file_ok:
            status = "remove"
        alt = ov.get("imageAlt") or cr.get("alt")
        if not alt:
            alt = f"{place['name']} near Villa Augflor, French Riviera"
        entry = {
            "title": place["name"],
            "category": place["cat"],
            "image": ov.get("image", image_id),
            "imageAlt": alt,
            "imageSource": cr.get("credit", "Wikimedia Commons"),
            "imageLicense": cr.get("license", ""),
            "imageStatus": status,
            "notes": ov.get("notes", ""),
        }
        if ov.get("caption"):
            entry["caption"] = ov["caption"]
        entries[pid] = entry

    js = f"""/* Auto-generated by scripts/generate-area-qc.py — image QC for area guide cards */
(function (global) {{
  "use strict";
  global.AREA_IMAGE_QC = {json.dumps(entries, indent=2, ensure_ascii=False)};
}})(typeof window !== "undefined" ? window : global);
"""
    OUT.write_text(js, encoding="utf-8")
    approved = sum(1 for e in entries.values() if e["imageStatus"] == "approved")
    removed = sum(1 for e in entries.values() if e["imageStatus"] == "remove")
    print(f"Wrote {OUT.name}: {len(entries)} cards, {approved} approved, {removed} gradient fallback")
    if missing_files:
        print(f"  Missing WebP ({len(missing_files)}): {', '.join(sorted(set(missing_files))[:12])}{'…' if len(missing_files) > 12 else ''}")


if __name__ == "__main__":
    main()
