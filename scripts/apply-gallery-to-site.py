#!/usr/bin/env python3
"""Merge curated 2026 photos + legacy _images into gallery-data and key pages."""
from __future__ import annotations

import argparse
import hashlib
import html as html_module
import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps, ImageStat, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "_images"
OUT = ROOT / "assets/photos/optimized"
CURATION = ROOT / "scripts" / "gallery-curation.json"
GALLERY_JS = ROOT / "scripts" / "gallery-data.js"
INDEX = ROOT / "index.html"
GALLERY_HTML = ROOT / "gallery.html"
MAX_EDGE = 1600
JPEG_Q = 82
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".avif", ".webp"}
EXT_PRIO = {".jpg": 0, ".jpeg": 0, ".png": 1, ".avif": 2, ".webp": 3}
FOLDER_MAP: list[tuple[str, str, str]] = [
    ("Exterior - Pool Area", "exterior", "pool"),
    ("Exterior", "exterior", "auto"),
    ("Ground Floor - Living Room", "living", "living"),
    ("Ground Floor - Garden Room", "garden-room", "garden-room"),
    ("Kitchen", "kitchen", "kitchen"),
    ("Ground Floor Bedroom - Provencal", "provance", "provance"),
    ("Ground Floor Bathroom", "bathrooms", "bathrooms-ground"),
    ("Upstairs Bedroom - Barcelona", "barcelona", "barcelona"),
    ("Upstairs Bedroom - Asian", "asian", "asian"),
    ("Upstairs Bathroom", "bathrooms", "bathrooms-upstairs"),
    ("Indoor Staircase", "stairs", "stairs"),
]
GALLERY_SECTIONS: list[tuple[str, str, str]] = [
    ("pool", "Pool &amp; garden", "Private pool for your group only — not fenced or alarmed; children must be supervised."),
    ("dining", "Outdoor dining", "Pergola table and terrace seating — relaxed Riviera evenings."),
    ("grounds", "Villa exterior", "Quiet residential hillside — parking for two cars (car recommended)."),
    ("living", "Living Room", "Open-plan living · A/C."),
    ("kitchen", "Kitchen", "Ground-floor kitchen."),
    ("garden-room", "Garden Room", "Garden room · pool access · A/C."),
    ("provance", "Ground Floor Bedroom — Provence", "Ground-floor bedroom — best for guests avoiding stairs."),
    ("barcelona", "Master Bedroom — &ldquo;Barcelona&rdquo;", "Loft master — steep staircase; lower ceilings."),
    ("asian", "Upstairs Double Bedroom — &ldquo;Asian&rdquo;", "Loft double — steep staircase."),
    ("bathrooms-ground", "Ground Floor Bathroom", "Ground-floor bathroom."),
    ("bathrooms-upstairs", "Upstairs Bathroom", "Upstairs bathroom (loft)."),
    ("stairs", "Parking &amp; stairs", "Two-car parking. Steep staircase to loft — plan for mobility needs."),
]
EXTRA_GALLERY_PHOTOS: list[tuple[str, str, str, str, str]] = [
    ("assets/photos/optimized/photo-stone-house-blue-gate-number-26.jpg", "grounds", "exterior", "Villa Augflor exterior, Cagnes-sur-Mer", "Facade"),
    ("assets/photos/optimized/entrance-gate-cypress.jpg", "grounds", "exterior", "Wrought iron entrance gate, Villa Augflor", "Entrance gate"),
    ("assets/photos/optimized/terrace-hillside-view-sunset.jpg", "grounds", "exterior", "Terrace hillside view at sunset, Villa Augflor", "Terrace view"),
    ("assets/photos/optimized/garden-dining-patio.jpg", "dining", "exterior", "Outdoor dining at Villa Augflor", "Pergola dining"),
    ("assets/photos/optimized/exterior-terrace-lounge-roses.jpg", "dining", "exterior", "Terrace lounge at Villa Augflor", "Terrace lounge"),
]
DINING_HINTS = ("dining", "patio", "coffee", "table", "pergola", "outdooe")
# Best pool shots for gallery (wide hero, night, low-angle terrace)
POOL_GALLERY_PICKS = [
    ("photo-villa-augflor-cagnes-sur-mer-0122.jpg", "Pool & garden wide view", "Exterior · signature shot"),
    ("pool-area-4.jpg", "Pool at night", "Exterior · evening lights"),
    ("photo-villa-augflor-cagnes-sur-mer-0098.jpg", "Pool terrace & loungers", "Exterior · daytime"),
]

# Correct room tags for auto-curated files (misclassified by hash)
ROOM_FIX = {
    "exterior-villa-augflor-2026-04.jpg": ("barcelona", "Barcelona suite bedding", "Upstairs · Barcelona · 2026"),
    "exterior-villa-augflor-2026-05.jpg": ("provance", "Provence canopy bed", "Ground floor · Provence · 2026"),
    "exterior-villa-augflor-2026-07.jpg": ("barcelona", "Barcelona marble feature wall", "Upstairs · Barcelona · 2026"),
    "exterior-villa-augflor-2026-08.jpg": ("barcelona", "Master suite styling", "Upstairs · Barcelona · 2026"),
    "exterior-villa-augflor-2026-13.jpg": ("exterior", "Private pool and garden", "Exterior · May 2026 · signature"),
    "living-villa-augflor-2026-09.jpg": ("bathrooms", "Upstairs stone bathroom", "Upstairs · spa bathroom · 2026"),
    "living-villa-augflor-2026-10.jpg": ("exterior", "Pergola outdoor dining", "Exterior · al fresco · 2026"),
    "living-villa-augflor-2026-11.jpg": ("living", "Living room seating", "Ground floor · living · 2026"),
    "living-villa-augflor-2026-12.jpg": ("garden-room", "Garden room interior", "Garden room · 2026"),
    "living-villa-augflor-2026-14.jpg": ("provance", "Provence bedroom detail", "Ground floor · Provence · 2026"),
}

LEGACY_IMPORT = [
    ("Ground Floor - Living Room/Living Room.jpg", "living", "living-room-main-2026.jpg", "Living room with rustic beams", "Main lounge", "Ground floor · 2026"),
    ("Ground Floor - Living Room/Living Room 3.jpg", "living", "living-room-sofa-wide-2026.jpg", "Living room L-shaped seating", "Lounge wide view", "Ground floor · 2026"),
    ("Kitchen/Kitchen.jpg", "kitchen", "kitchen-equipped-2026.jpg", "Fully equipped kitchen", "Kitchen", "Ground floor · 2026"),
    ("Upstairs Bedroom - Barcelona/Upstairs Master Bedroom - Barcelona.jpg", "barcelona", "barcelona-master-suite-2026.jpg", "Barcelona master bedroom", "Master suite", "Upstairs · Barcelona · 2026"),
    ("Upstairs Bedroom - Asian/Upstairs Asian Bedroom.jpg", "asian", "asian-double-bedroom-2026.jpg", "Asian double bedroom", "Asian room", "Upstairs · 2026"),
    ("Upstairs Bathroom/Upstairs Bathroom.jpg", "bathrooms", "upstairs-bathroom-stone-2026.jpg", "Upstairs spa bathroom", "Upstairs bathroom", "Loft · stone wall · 2026"),
    ("Ground Floor Bedroom - Provencal/Ground Floor Bedroom.jpg", "provance", "provence-bedroom-ground-2026.jpg", "Provence ground-floor bedroom", "Provence bedroom", "Ground floor · 2026"),
    ("Ground Floor - Living Room/Garden Room.jpg", "garden-room", "garden-room-pool-access-2026.jpg", "Garden room with pool access", "Garden room", "Ground floor · 2026"),
]


def enhance_if_needed(img: Image.Image) -> Image.Image:
    gray = img.convert("L")
    mean = ImageStat.Stat(gray).mean[0]
    edges = ImageStat.Stat(gray.filter(ImageFilter.FIND_EDGES)).mean[0]
    if mean < 90 or mean > 200 or edges < 8:
        img = ImageOps.autocontrast(img, cutoff=1)
        img = ImageEnhance.Brightness(img).enhance(1.05 if mean < 90 else 0.98)
        img = ImageEnhance.Contrast(img).enhance(1.08)
        img = ImageEnhance.Color(img).enhance(1.08)
        img = ImageEnhance.Sharpness(img).enhance(1.15)
    return img


def save_web(img: Image.Image, dest: Path) -> None:
    img = ImageOps.exif_transpose(img).convert("RGB")
    img = enhance_if_needed(img)
    if max(img.size) > MAX_EDGE:
        r = MAX_EDGE / max(img.size)
        img = img.resize((int(img.width * r), int(img.height * r)), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "JPEG", quality=JPEG_Q, optimize=True, progressive=True)


def load_src(path: Path) -> Image.Image:
    if path.suffix.lower() == ".avif":
        tmp = path.with_suffix(".tmp.jpg")
        subprocess.run(["sips", "-s", "format", "jpeg", str(path), "--out", str(tmp)], check=True, capture_output=True)
        img = Image.open(tmp)
        tmp.unlink(missing_ok=True)
        return img
    return Image.open(path)


def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:72]


def human_title(stem: str, zone: str = "grounds") -> str:
    if zone == "pool":
        return "Pool & garden"
    if zone == "dining":
        return "Outdoor dining"
    if zone == "parking":
        return "Parking"
    return "Villa exterior"


def exterior_zone_for(stem: str, folder_zone: str) -> str:
    if folder_zone == "pool":
        return "pool"
    low = stem.lower()
    if any(h in low for h in DINING_HINTS):
        return "dining"
    if "parking" in low:
        return "parking"
    return "grounds"


def pick_exterior_sources(folder: Path) -> list[Path]:
    by_stem: dict[str, Path] = {}
    for p in sorted(folder.iterdir()):
        if not p.is_file() or p.suffix.lower() not in IMAGE_EXTS:
            continue
        stem = p.stem.lower()
        cur = by_stem.get(stem)
        if cur is None or EXT_PRIO[p.suffix.lower()] < EXT_PRIO[cur.suffix.lower()]:
            by_stem[stem] = p
    return sorted(by_stem.values(), key=lambda p: p.name.lower())


def out_name_for(src: Path) -> str:
    if src.stem.startswith("photo-villa-augflor-cagnes-sur-mer-"):
        return f"{src.stem}.jpg"
    return f"{slugify(src.stem)}.jpg"


def curate_pool_picks(all_pool: list[dict]) -> list[dict]:
    by_name = {Path(e["src"]).name: e for e in all_pool}
    picks: list[dict] = []
    for fname, title, meta in POOL_GALLERY_PICKS:
        if fname in by_name:
            item = dict(by_name[fname])
        elif (OUT / fname).exists():
            item = {
                "room": "exterior",
                "exterior_zone": "pool",
                "src": f"assets/photos/optimized/{fname}",
                "alt": alt_for_room("exterior", title),
            }
        else:
            print(f"  warn: pool pick missing: {fname}")
            continue
        item["title"] = title
        item["meta"] = meta
        item["exterior_zone"] = "pool"
        item["room"] = "exterior"
        picks.append(item)
    return picks


def gallery_section_for(room: str, section_hint: str, stem: str) -> tuple[str, str | None]:
    if section_hint == "auto":
        zone = exterior_zone_for(slugify(stem), "grounds")
        section = {"pool": "pool", "dining": "dining", "parking": "stairs", "grounds": "grounds"}[zone]
        return section, zone
    if section_hint in ("pool", "dining"):
        return section_hint, section_hint
    return section_hint, None


def import_all_folders() -> list[dict]:
    items: list[dict] = []
    for folder_name, room, section_hint in FOLDER_MAP:
        folder = SRC / folder_name
        if not folder.is_dir():
            print(f"  skip missing folder: {folder_name}")
            continue
        for src in pick_exterior_sources(folder):
            out_name = out_name_for(src)
            dest = OUT / out_name
            save_web(load_src(src), dest)
            gal_section, exterior_zone = gallery_section_for(room, section_hint, src.stem)
            title = human_title(slugify(src.stem), exterior_zone or gal_section)
            meta_map = {
                "pool": "Pool & garden · exterior",
                "dining": "Outdoor dining · exterior",
                "stairs": "Parking & stairs",
                "grounds": "Garden & terraces · exterior",
                "living": "Ground floor · living",
                "kitchen": "Ground floor · kitchen",
                "garden-room": "Garden room",
                "provance": "Ground floor · Provence",
                "barcelona": "Upstairs · Barcelona",
                "asian": "Upstairs · Asian",
                "bathrooms-ground": "Ground floor · bathroom",
                "bathrooms-upstairs": "Upstairs · bathroom",
            }
            entry: dict = {
                "room": room,
                "gallery_section": gal_section,
                "src": f"assets/photos/optimized/{out_name}",
                "alt": alt_for_room(room, title),
                "title": title,
                "meta": meta_map.get(gal_section, f"{folder_name}"),
            }
            if exterior_zone:
                entry["exterior_zone"] = exterior_zone
            items.append(entry)
            print(f"  {folder_name} → {out_name} ({gal_section})")
    return items


def import_legacy() -> list[dict]:
    items = []
    for src_name, room, out_name, alt, title, meta in LEGACY_IMPORT:
        src = SRC / src_name
        if not src.exists():
            continue
        dest = OUT / out_name
        save_web(load_src(src), dest)
        items.append(
            {
                "room": room,
                "src": f"assets/photos/optimized/{out_name}",
                "alt": alt,
                "title": title,
                "meta": meta,
            }
        )
        print(f"  legacy → {out_name}")
    return items


def alt_for_room(room: str, title: str) -> str:
    base = {
        "exterior": "Villa Augflor private pool and garden, Cagnes-sur-Mer",
        "living": "Living room at Villa Augflor, French Riviera",
        "barcelona": "Barcelona master bedroom at Villa Augflor",
        "asian": "Asian double bedroom at Villa Augflor",
        "provance": "Provence ground-floor bedroom at Villa Augflor",
        "garden-room": "Garden room at Villa Augflor with pool access",
        "bathrooms": "Bathroom at Villa Augflor",
        "kitchen": "Kitchen at Villa Augflor",
    }
    return base.get(room, "Villa Augflor — " + title)


def load_curation_sources() -> dict[str, str]:
    """Map curated export filename -> original source filename."""
    data = json.loads(CURATION.read_text(encoding="utf-8"))
    return {e["file"]: e["source"] for e in data["exports"] if e.get("source")}


HASH_SIZE = 12
HASH_DEDUPE_THRESH = 10
HIST_COSINE_THRESH = 0.94


def _avg_hash(path: Path) -> int:
    img = ImageOps.exif_transpose(Image.open(path)).convert("L").resize(
        (HASH_SIZE, HASH_SIZE), Image.Resampling.LANCZOS
    )
    px = list(img.getdata())
    mean = sum(px) / len(px)
    bits = "".join("1" if p > mean else "0" for p in px)
    return int(bits, 2)


def _hash_hamming(a: int, b: int) -> int:
    return bin(a ^ b).count("1")


def _color_hist(path: Path, bins: int = 8) -> list[float]:
    img = ImageOps.exif_transpose(Image.open(path)).convert("RGB").resize(
        (128, 128), Image.Resampling.LANCZOS
    )
    hist = [0.0] * (bins**3)
    for r, g, b in img.getdata():
        ri, gi, bi = r * bins // 256, g * bins // 256, b * bins // 256
        hist[ri * bins * bins + gi * bins + bi] += 1
    total = sum(hist)
    return [x / total for x in hist] if total else hist


def _hist_cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(y * y for y in b) ** 0.5
    return dot / (na * nb) if na * nb else 0.0


def _visual_fingerprint(path: Path) -> tuple[int, list[float]] | None:
    try:
        return _avg_hash(path), _color_hist(path)
    except OSError:
        return None


def _looks_almost_identical(
    a: tuple[int, list[float]],
    b: tuple[int, list[float]],
) -> tuple[bool, str]:
    h_dist = _hash_hamming(a[0], b[0])
    if h_dist < HASH_DEDUPE_THRESH:
        return True, f"hash={h_dist}"
    cos = _hist_cosine(a[1], b[1])
    if cos >= HIST_COSINE_THRESH:
        return True, f"hist={cos:.3f}"
    return False, ""


def drop_visual_duplicates(entries: list[dict]) -> list[dict]:
    """Drop near-identical photos within the same gallery section."""
    fingerprints: dict[str, tuple[int, list[float]]] = {}
    kept: list[dict] = []
    for e in entries:
        path = ROOT / e["src"]
        if not path.is_file():
            kept.append(e)
            continue
        fp = _visual_fingerprint(path)
        if fp is None:
            kept.append(e)
            continue
        fingerprints[e["src"]] = fp
        section = e.get("gallery_section") or e.get("room") or ""
        is_dup = False
        for prior in kept:
            if (prior.get("gallery_section") or prior.get("room") or "") != section:
                continue
            prior_fp = fingerprints.get(prior["src"])
            if prior_fp is None:
                continue
            similar, reason = _looks_almost_identical(fp, prior_fp)
            if similar:
                print(
                    f"  visual dedup: drop {path.name} "
                    f"(similar to {Path(prior['src']).name}, {reason})"
                )
                is_dup = True
                break
        if not is_dup:
            kept.append(e)
    return kept


def drop_duplicate_entries(entries: list[dict]) -> list[dict]:
    """Remove curated re-exports, byte-identical photos, and near-identical shots."""
    curated_sources = load_curation_sources()
    basenames = {Path(e["src"]).name for e in entries}
    filtered: list[dict] = []
    for e in entries:
        name = Path(e["src"]).name
        source = curated_sources.get(name)
        if source and source in basenames:
            print(f"  dedup: drop {name} (duplicate of {source})")
            continue
        filtered.append(e)

    seen_hash: dict[str, str] = {}
    deduped: list[dict] = []
    for e in filtered:
        path = ROOT / e["src"]
        if not path.is_file():
            deduped.append(e)
            continue
        digest = hashlib.md5(path.read_bytes()).hexdigest()
        if digest in seen_hash:
            print(f"  dedup: drop {path.name} (same image as {seen_hash[digest]})")
            continue
        seen_hash[digest] = path.name
        deduped.append(e)
    return deduped


def parse_gallery_html_entries() -> list[dict]:
    """Rebuild entry list from gallery.html sections (for --dedup-only)."""
    html = GALLERY_HTML.read_text(encoding="utf-8")
    heading_to_key = {
        html_module.unescape(heading): key for key, heading, _ in GALLERY_SECTIONS
    }
    entries: list[dict] = []
    section_re = re.compile(r'<section class="section">[\s\S]*?</section>', re.MULTILINE)
    img_re = re.compile(r'<img src="([^"]+)" alt="([^"]*)"')
    for block in section_re.findall(html):
        h2 = re.search(r"<h2>([^<]+)</h2>", block)
        if not h2:
            continue
        heading = html_module.unescape(h2.group(1).strip())
        section = heading_to_key.get(heading, "grounds")
        room = section if section not in ("pool", "dining", "grounds", "stairs") else "exterior"
        for src, alt in img_re.findall(block):
            entries.append(
                {
                    "src": src,
                    "alt": alt,
                    "title": alt,
                    "room": room,
                    "gallery_section": section,
                    "section": heading,
                    "meta": "",
                }
            )
    return entries


def curated_items() -> list[dict]:
    data = json.loads(CURATION.read_text(encoding="utf-8"))
    items = []
    for e in data["exports"]:
        fname = e["file"]
        room, title, meta = ROOM_FIX.get(
            fname, (e["room"], e["title"], e["meta"])
        )
        alt = alt_for_room(room, title)
        items.append(
            {
                "room": room,
                "src": e["src"],
                "alt": alt,
                "title": title,
                "meta": meta,
            }
        )
    return items


def build_gallery_js(entries: list[dict]) -> str:
    lines = ['/** Villa Augflor — room-organised gallery (updated May 2026) */', "window.VILLA_GALLERY = ["]
    for e in entries:
        lines.append(
            f'  {{ room: "{e["room"]}", src: "{e["src"]}", alt: "{e["alt"]}", title: "{e["title"]}", meta: "{e["meta"]}" }},'
        )
    lines.append("];")
    lines.append("")
    lines.append("window.GALLERY_ROOMS = [")
    lines.append('  { id: "all", label: "All photos" },')
    lines.append('  { id: "exterior", label: "Pool & garden" },')
    lines.append('  { id: "barcelona", label: "Barcelona suite" },')
    lines.append('  { id: "asian", label: "Asian room" },')
    lines.append('  { id: "provance", label: "Provence bedroom" },')
    lines.append('  { id: "living", label: "Living room" },')
    lines.append('  { id: "garden-room", label: "Garden room" },')
    lines.append('  { id: "bathrooms", label: "Bathrooms" },')
    lines.append('  { id: "kitchen", label: "Kitchen" },')
    lines.append("];")
    return "\n".join(lines) + "\n"


def pick_hero_and_grid(entries: list[dict]) -> tuple[list[str], list[dict]]:
    """Hero backgrounds + 14-tile homepage grid."""
    by_room: dict[str, list[dict]] = {}
    for e in entries:
        by_room.setdefault(e["room"], []).append(e)

    def first(room: str, fallback: str) -> str:
        return by_room[room][0]["src"] if by_room.get(room) else fallback

    heroes = [
        first("exterior", "assets/photos/optimized/pool-area.jpg"),
        first("living", "assets/photos/optimized/living-room-main-2026.jpg"),
        first("barcelona", "assets/photos/optimized/barcelona-master-suite-2026.jpg"),
        next((e["src"] for e in entries if e.get("exterior_zone") == "pool"), "assets/photos/optimized/pool-area.jpg"),
        next((e["src"] for e in entries if "sunset" in e["src"].lower() or "night" in e["title"].lower()), "assets/photos/optimized/sunset-by-the-pool.jpg"),
    ]

    grid_slots = [
        ("exterior", "Private pool and garden terrace"),
        ("living", "Living room with L-shaped sofa"),
        ("provance", "Provence ground-floor bedroom"),
        ("exterior", "Entrance and pool terrace"),
        ("exterior", "Pool patio with loungers"),
        ("exterior", "Outdoor dining pergola"),
        ("barcelona", "Barcelona master bedroom"),
        ("kitchen", "Kitchen with modern appliances"),
        ("exterior", "Garden path and planting"),
        ("bathrooms", "Upstairs spa bathroom"),
        ("garden-room", "Garden room overlooking pool"),
        ("bathrooms", "Ground floor bathroom"),
        ("exterior", "Parking and arrival path"),
        ("exterior", "Pool at night"),
    ]

    grid = []
    used = set()
    for room, alt_hint in grid_slots:
        for e in by_room.get(room, []):
            if e["src"] not in used:
                grid.append({**e, "alt": e.get("alt", alt_hint)})
                used.add(e["src"])
                break
        else:
            pass

    while len(grid) < 14:
        for e in entries:
            if e["src"] not in used:
                grid.append(e)
                used.add(e["src"])
                if len(grid) >= 14:
                    break
        else:
            break

    return heroes, grid[:14]


def patch_index(heroes: list[str], grid: list[dict]) -> None:
    html = INDEX.read_text(encoding="utf-8")
    hero_paths = [
        "assets/photos/optimized/interior-lounge-2.jpg",
        "assets/photos/optimized/upstairs-master-bedroom-3.jpg",
        "assets/photos/optimized/swimming-pool.jpg",
        "assets/photos/optimized/garden-dining-patio.jpg",
    ]
    for i, h in enumerate(heroes[:5]):
        cls = f"hi{i + 1}" if i else "hi1 active"
        old_pat = rf'<div class="hero-img {cls.replace("hi1 active", "hi1 active")}[^"]*" data-bg="[^"]+"'
        # simpler: replace each hi slot
    # hi1 may be absent (col-left layout); patch hi2–hi5 and optional hi1
    hi_slots = ["hi2", "hi3", "hi4", "hi5"]
    for cls, src in zip(hi_slots, heroes[1:5]):
        html = re.sub(
            rf'(<div class="hero-img {cls} lazy-bg" data-bg=")[^"]+(")',
            rf"\1{src}\2",
            html,
            count=1,
        )
    if 'class="hero-img hi1 active"' in html:
        html = re.sub(
            r'(<div class="hero-img hi1 active" data-bg=")[^"]+(")',
            rf"\1{heroes[0]}\2",
            html,
            count=1,
        )

    preload_imgs = heroes[:4]
    for i, src in enumerate(preload_imgs):
        html = re.sub(
            rf'(<link rel="preload" as="image" href=")[^"]+(" fetchpriority="high">)',
            rf"\1{src}\2",
            html,
            count=1 if i == 0 else 1,
        )

    og_img = heroes[0] if heroes else "assets/photos/optimized/exterior-villa-augflor-2026-13.jpg"
    html = re.sub(
        r'(<meta property="og:image" content=")[^"]+(")',
        rf"\1{og_img}\2",
        html,
        count=1,
    )
    html = re.sub(
        r'(<meta name="twitter:image" content=")[^"]+(")',
        rf"\1{og_img}\2",
        html,
        count=1,
    )

    grid_html = []
    classes = ["g1 tall", "g2", "g3", "g10", "g4", "g5 tall", "g11", "g12", "g6", "g13", "g7", "g8 tall", "g9", "g14"]
    for i, (cls, item) in enumerate(zip(classes, grid)):
        loading = "eager" if i == 0 else "lazy"
        fp = ' fetchpriority="high"' if i == 0 else ""
        grid_html.append(
            f'    <div class="g-img {cls}" onclick="openLightbox({i})"><img src="{item["src"]}" alt="{item["alt"]}" loading="{loading}" decoding="async"{fp}></div>'
        )
    block = "\n".join(grid_html)
    html = re.sub(
        r'<div class="gallery-grid reveal">.*?</div>\s*<p class="reveal" style="text-align:center;margin-top:1\.5rem">',
        f'<div class="gallery-grid reveal">\n{block}\n  </div>\n  <p class="reveal" style="text-align:center;margin-top:1.5rem">',
        html,
        count=1,
        flags=re.DOTALL,
    )

    lb = ",\n  ".join(f"'{g['src']}'" for g in grid)
    html = re.sub(
        r"const galleryImages = \[[\s\S]*?\];",
        f"const galleryImages = [\n  {lb}\n];",
        html,
        count=1,
    )

    INDEX.write_text(html, encoding="utf-8")
    print("  updated index.html")


def entry_gallery_section(e: dict) -> str:
    if e.get("gallery_section"):
        return e["gallery_section"]
    zone = e.get("exterior_zone")
    if zone == "pool":
        return "pool"
    if zone == "dining":
        return "dining"
    if zone == "parking":
        return "stairs"
    if zone == "grounds" or e.get("room") == "exterior":
        return "grounds"
    room = e.get("room", "")
    if room == "bathrooms":
        meta = e.get("meta", "").lower()
        if "upstairs" in meta or "loft" in meta or "spa" in meta:
            return "bathrooms-upstairs"
        return "bathrooms-ground"
    if room == "stairs":
        return "stairs"
    if room in ("living", "kitchen", "garden-room", "provance", "barcelona", "asian"):
        return room
    return "grounds"


def patch_gallery_html(entries: list[dict]) -> None:
    """Rebuild gallery.html with all photos and an in-page lightbox."""
    html = GALLERY_HTML.read_text(encoding="utf-8")
    by_section: dict[str, list[dict]] = {key: [] for key, _, _ in GALLERY_SECTIONS}
    seen_src: set[str] = set()

    for src, section, room, alt, title in EXTRA_GALLERY_PHOTOS:
        if (OUT / Path(src).name).exists() and src not in seen_src:
            by_section.setdefault(section, []).append(
                {"src": src, "alt": alt, "title": title, "room": room, "gallery_section": section}
            )
            seen_src.add(src)

    for e in entries:
        src = e["src"]
        if src in seen_src:
            continue
        section = entry_gallery_section(e)
        if section not in by_section:
            section = "grounds"
        by_section[section].append(e)
        seen_src.add(src)

    flat: list[dict] = []
    sections_html: list[str] = []
    for key, heading, default_note in GALLERY_SECTIONS:
        photos = by_section.get(key, [])
        if not photos:
            continue
        start = len(flat)
        grid_items = []
        for i, p in enumerate(photos):
            idx = start + i
            flat.append(p)
            grid_items.append(
                f'<figure class="gallery-item" data-idx="{idx}" onclick="openLightbox({idx})" '
                f'role="button" tabindex="0" aria-label="View full size: {p["alt"]}">'
                f'<div class="img-link"><img src="{p["src"]}" alt="{p["alt"]}" loading="lazy"></div></figure>'
            )
        note = default_note
        if len(photos) > 1:
            note = f"{default_note} ({len(photos)} photos)"
        grid_inner = "\n          ".join(grid_items)
        sections_html.append(
            f'<section class="section">\n'
            f'      <div class="wrap">\n'
            f'        <h2>{heading}</h2>\n'
            f'        <p class="section-note">{note}</p>\n'
            f'        <div class="grid">\n          {grid_inner}\n'
            f'        </div>\n'
            f'      </div>\n'
            f'    </section>'
        )
        print(f"  gallery.html section: {heading} ({len(photos)} photos)")

    main_block = "\n".join(sections_html) + '\n<section class="footer-cta wrap">\n      <a class="btn btn-primary" href="https://wa.me/33623777333">Enquire About Available Dates</a>\n    </section>'
    html = re.sub(
        r'<section class="section">[\s\S]*?<section class="footer-cta wrap">[\s\S]*?</section>',
        main_block,
        html,
        count=1,
    )

    lightbox_css = """
.lightbox-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 1000; align-items: center; justify-content: center; }
.lightbox-overlay.active { display: flex; }
.lightbox-img { max-width: 90vw; max-height: 88vh; object-fit: contain; border-radius: 2px; user-select: none; }
.lightbox-close { position: absolute; top: 1.5rem; right: 2rem; color: white; font-size: 32px; cursor: pointer; background: none; border: none; line-height: 1; opacity: .7; transition: opacity .2s; }
.lightbox-close:hover { opacity: 1; }
.lightbox-prev, .lightbox-next { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; font-size: 24px; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s; }
.lightbox-prev:hover, .lightbox-next:hover { background: rgba(255,255,255,0.2); }
.lightbox-prev { left: 1.5rem; }
.lightbox-next { right: 1.5rem; }
.lightbox-counter { position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.5); font-size: 13px; letter-spacing: .1em; }
.lightbox-caption { position: absolute; bottom: 3.25rem; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.75); font-size: 14px; max-width: 80vw; text-align: center; }
figure.gallery-item { cursor: pointer; transition: transform .2s; }
figure.gallery-item:hover { transform: translateY(-2px); }
figure.gallery-item:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
"""
    if ".lightbox-overlay" not in html:
        html = html.replace("</style>", lightbox_css + "</style>", 1)

    lb_srcs = ",\n  ".join(f"'{p['src']}'" for p in flat)
    lb_alts = ",\n  ".join(json.dumps(p["alt"]) for p in flat)
    lightbox_html = f"""
<div class="lightbox-overlay" id="lightbox" onclick="closeLightboxOnBg(event)">
  <button class="lightbox-close" type="button" onclick="closeLightbox()" aria-label="Close gallery">×</button>
  <button class="lightbox-prev" type="button" onclick="lightboxNav(-1)" aria-label="Previous photo">‹</button>
  <img class="lightbox-img" id="lightboxImg" src="" alt="">
  <button class="lightbox-next" type="button" onclick="lightboxNav(1)" aria-label="Next photo">›</button>
  <div class="lightbox-caption" id="lightboxCaption"></div>
  <div class="lightbox-counter" id="lightboxCounter"></div>
</div>
<script>
const galleryImages = [
  {lb_srcs}
];
const galleryAlts = [
  {lb_alts}
];
let currentImg = 0;
function openLightbox(idx) {{
  currentImg = idx;
  document.getElementById('lightboxImg').src = galleryImages[idx];
  document.getElementById('lightboxImg').alt = galleryAlts[idx];
  document.getElementById('lightboxCaption').textContent = galleryAlts[idx];
  document.getElementById('lightboxCounter').textContent = (idx + 1) + ' / ' + galleryImages.length;
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}}
function closeLightbox() {{
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}}
function closeLightboxOnBg(e) {{
  if (e.target === document.getElementById('lightbox')) closeLightbox();
}}
function lightboxNav(dir) {{
  currentImg = (currentImg + dir + galleryImages.length) % galleryImages.length;
  document.getElementById('lightboxImg').src = galleryImages[currentImg];
  document.getElementById('lightboxImg').alt = galleryAlts[currentImg];
  document.getElementById('lightboxCaption').textContent = galleryAlts[currentImg];
  document.getElementById('lightboxCounter').textContent = (currentImg + 1) + ' / ' + galleryImages.length;
}}
document.addEventListener('keydown', e => {{
  if (!document.getElementById('lightbox').classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') lightboxNav(1);
  if (e.key === 'ArrowLeft') lightboxNav(-1);
}});
document.querySelectorAll('.gallery-item').forEach(el => {{
  el.addEventListener('keydown', e => {{
    if (e.key === 'Enter' || e.key === ' ') {{
      e.preventDefault();
      openLightbox(parseInt(el.dataset.idx, 10));
    }}
  }});
}});
</script>"""
    if 'id="lightbox"' not in html:
        html = html.replace("</body>", lightbox_html + "\n</body>", 1)
    else:
        html = re.sub(
            r'<div class="lightbox-overlay"[\s\S]*?</script>',
            lambda _m: lightbox_html.strip(),
            html,
            count=1,
        )

    html = re.sub(
        r'"dateModified": "[^"]+"',
        '"dateModified": "2026-05-31"',
        html,
        count=1,
    )
    GALLERY_HTML.write_text(html, encoding="utf-8")


# Legacy re-exports and near-identical shots (same scene, different filename).
GALLERY_VISUAL_DUPES: set[str] = {
    "outdooe-dining-area-3.jpg",
    "photo-villa-augflor-cagnes-sur-mer-0011.jpg",
    "photo-villa-augflor-cagnes-sur-mer-0002.jpg",
    "photo-villa-augflor-cagnes-sur-mer-0020.jpg",
    "photo-villa-augflor-cagnes-sur-mer-0026.jpg",
    "groundfloor-beedroom-le-provance.jpg",
    "photo-villa-augflor-cagnes-sur-mer-0042.jpg",
    "upsatairs-master-bedroom-barcelona.jpg",
    "photo-villa-augflor-cagnes-sur-mer-0031.jpg",
}


def drop_known_visual_dupes(entries: list[dict]) -> list[dict]:
    out: list[dict] = []
    for e in entries:
        name = Path(e["src"]).name
        if name in GALLERY_VISUAL_DUPES:
            print(f"  known dupe: drop {name}")
            continue
        out.append(e)
    return out


def dedup_gallery_page() -> None:
    """Remove duplicate photos from gallery.html without re-importing _images."""
    entries = parse_gallery_html_entries()
    print(f"  gallery.html: {len(entries)} photos before dedup")
    entries = drop_known_visual_dupes(entries)
    entries = drop_duplicate_entries(entries)
    entries = drop_visual_duplicates(entries)
    print(f"  gallery.html: {len(entries)} photos after dedup")
    patch_gallery_html(entries)
    GALLERY_JS.write_text(build_gallery_js(entries), encoding="utf-8")
    print(f"  gallery-data.js: {len(entries)} photos")


def main() -> None:
    print("Importing all _images folders…")
    folder_imports = import_all_folders()
    print("Loading curated 2026 photos…")
    curated = curated_items()
    seen_src = set()
    merged: list[dict] = []
    for e in folder_imports + curated:
        if e["src"] in seen_src:
            continue
        seen_src.add(e["src"])
        merged.append(e)

    # Keep a few proven older shots for variety
    keep_old = [
        ("all", "assets/photos/optimized/entrance-gate-cypress.jpg", "Wrought iron entrance gate", "Entrance gate", "Exterior · arrival"),
        ("kitchen", "assets/photos/optimized/photo-kitchen-light-blue-cabinets-wood-countertop.jpg", "Kitchen marble backsplash", "Counter detail", "Ground floor · marble"),
        ("bathrooms", "assets/photos/optimized/photo-bathroom-interior-shower-led-niches.jpg", "LED shower niches", "LED shower", "Ground floor · rainfall"),
        ("garden-room", "assets/photos/optimized/garden-room-piano-pool-view.jpg", "Garden room piano pool view", "Piano & pool view", "Garden room · pool access"),
    ]
    for room, src, alt, title, meta in keep_old:
        if src not in seen_src and (OUT / Path(src).name).exists():
            merged.append({"room": room, "src": src, "alt": alt, "title": title, "meta": meta})
            seen_src.add(src)

    pool_all = [e for e in merged if e.get("exterior_zone") == "pool"]
    pool_picks = curate_pool_picks(pool_all)
    pool_first = pool_picks[0] if pool_picks else next((e for e in pool_all), None)
    if not pool_first:
        pool_first = next((e for e in merged if e["room"] == "exterior"), merged[0])
    rest = [e for e in merged if e["src"] != pool_first["src"]]
    all_entry = {k: v for k, v in pool_first.items() if k != "room"}
    all_entry["room"] = "all"
    merged = [all_entry] + rest
    merged = drop_known_visual_dupes(merged)
    merged = drop_duplicate_entries(merged)
    merged = drop_visual_duplicates(merged)

    GALLERY_JS.write_text(build_gallery_js(merged), encoding="utf-8")
    print(f"  gallery-data.js: {len(merged)} photos")

    heroes, grid = pick_hero_and_grid(merged)
    patch_index(heroes, grid)
    patch_gallery_html(merged)
    print("Done.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build or deduplicate Villa Augflor gallery")
    parser.add_argument(
        "--dedup-only",
        action="store_true",
        help="Remove duplicate photos from gallery.html (no _images re-import)",
    )
    args = parser.parse_args()
    if args.dedup_only:
        dedup_gallery_page()
    else:
        main()
