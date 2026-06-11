#!/usr/bin/env python3
"""Curate _images → assets/photos/optimized; dedupe, enhance, room-tag."""
from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "_images"
OUT = ROOT / "assets/photos/optimized"
MANIFEST = ROOT / "scripts" / "gallery-curation.json"
GALLERY_JS = ROOT / "scripts" / "gallery-data.js"
MAX_EDGE = 1600
JPEG_Q = 82
HASH_SIZE = 12
DEDUPE_THRESH = 10
DIVERSITY_THRESH = 11
TARGET_COUNT = 42

ROOM_REFS: dict[str, str] = {
    "exterior": "swimming-pool.jpg",
    "barcelona": "upstairs-master-bedroom-3.jpg",
    "asian": "upstairs-double-bedroom.jpg",
    "provance": "ground-floor-bedroom-3.jpg",
    "living": "interior-lounge-2.jpg",
    "garden-room": "garden-room-lounge.jpg",
    "bathrooms": "upstairs-bathroom.jpg",
    "kitchen": "kitchen-corner-wide.jpg",
}


def avg_hash(img: Image.Image, size: int = HASH_SIZE) -> int:
    g = img.convert("L").resize((size, size), Image.Resampling.LANCZOS)
    px = list(g.getdata())
    m = sum(px) / len(px)
    bits = "".join("1" if p > m else "0" for p in px)
    return int(bits, 2)


def hamming(a: int, b: int) -> int:
    return bin(a ^ b).count("1")


def load_image(path: Path) -> Image.Image | None:
    try:
        if path.suffix.lower() == ".avif":
            tmp = path.with_suffix(".tmp.jpg")
            subprocess.run(
                ["sips", "-s", "format", "jpeg", str(path), "--out", str(tmp)],
                check=True,
                capture_output=True,
            )
            img = Image.open(tmp)
            tmp.unlink(missing_ok=True)
        else:
            img = Image.open(path)
        return ImageOps.exif_transpose(img).convert("RGB")
    except Exception as e:
        print(f"  skip {path.name}: {e}")
        return None


def quality_score(img: Image.Image) -> float:
    w, h = img.size
    if w < 800 or h < 600:
        return 0.0
    gray = img.convert("L")
    edges = gray.filter(ImageFilter.FIND_EDGES)
    sharp = ImageStat.Stat(edges).mean[0]
    mean = ImageStat.Stat(gray).mean[0]
    exposure = 1.0 - min(abs(mean - 118) / 118, 1.0)
    res = min(w, h) / 1600.0
    return sharp * 0.55 + exposure * 80 + res * 40


def needs_enhance(score: float, threshold: float) -> bool:
    return score < threshold


def enhance(img: Image.Image) -> Image.Image:
    img = ImageOps.autocontrast(img, cutoff=1)
    img = ImageEnhance.Color(img).enhance(1.1)
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Brightness(img).enhance(1.03)
    img = ImageEnhance.Sharpness(img).enhance(1.2)
    return img


def save_web(img: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if max(img.size) > MAX_EDGE:
        ratio = MAX_EDGE / max(img.size)
        img = img.resize((int(img.width * ratio), int(img.height * ratio)), Image.Resampling.LANCZOS)
    img.save(dest, "JPEG", quality=JPEG_Q, optimize=True, progressive=True)


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:60]


def collect_sources() -> list[Path]:
    paths: list[Path] = []
    paths.extend(sorted(SRC.glob("photo-villa-augflor-*.jpg")))
    for pat in ("*.jpg", "*.jpeg", "*.JPG", "*.avif"):
        for p in SRC.glob(pat):
            if p.name.startswith("photo-villa-augflor"):
                continue
            paths.append(p)
    return paths


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ref_hashes: dict[str, tuple[int, str]] = {}
    for room, fname in ROOM_REFS.items():
        p = OUT / fname
        if p.exists():
            im = load_image(p)
            if im:
                ref_hashes[room] = (avg_hash(im), room)

    existing_hashes: list[tuple[int, float, str]] = []
    for p in OUT.glob("*.jpg"):
        im = load_image(p)
        if im:
            existing_hashes.append((avg_hash(im), quality_score(im), p.name))

    candidates: list[dict] = []
    seen_groups: list[int] = []

    for path in collect_sources():
        img = load_image(path)
        if not img:
            continue
        h = avg_hash(img)
        score = quality_score(img)
        if score < 25:
            continue

        dup = False
        for gh in seen_groups:
            if hamming(h, gh) < DEDUPE_THRESH:
                dup = True
                break
        if dup:
            continue

        for eh, es, _ in existing_hashes:
            if hamming(h, eh) < 8 and score <= es + 5:
                dup = True
                break
        if dup:
            continue

        seen_groups.append(h)

        room = "exterior"
        best_d = 999
        for r, (rh, _) in ref_hashes.items():
            d = hamming(h, rh)
            if d < best_d:
                best_d = d
                room = r
        if best_d > 18:
            stat = ImageStat.Stat(img.convert("L"))
            room = "exterior" if stat.mean[0] > 125 else "living"

        candidates.append(
            {
                "path": str(path),
                "hash": h,
                "score": round(score, 2),
                "room": room,
                "w": img.width,
                "h": img.height,
                "img": img,
                "source": path.name,
            }
        )

    candidates.sort(key=lambda c: c["score"], reverse=True)
    enhance_threshold = (
        candidates[len(candidates) // 3]["score"] if len(candidates) > 6 else 40
    )

    selected: list[dict] = []
    sel_hashes: list[int] = []
    room_counts: dict[str, int] = {r: 0 for r in ROOM_REFS}
    max_per_room = 7

    for c in candidates:
        if len(selected) >= TARGET_COUNT:
            break
        if room_counts[c["room"]] >= max_per_room:
            continue
        if any(hamming(c["hash"], sh) < DIVERSITY_THRESH for sh in sel_hashes):
            continue
        selected.append(c)
        sel_hashes.append(c["hash"])
        room_counts[c["room"]] += 1

    exports: list[dict] = []
    used_names: set[str] = set()
    for i, c in enumerate(selected, 1):
        img: Image.Image = c["img"]
        if needs_enhance(c["score"], enhance_threshold):
            img = enhance(img)
            c["enhanced"] = True
        else:
            c["enhanced"] = False

        base = f"{c['room']}-villa-augflor-2026-{i:02d}"
        name = base + ".jpg"
        n = 1
        while name in used_names or (OUT / name).exists():
            name = f"{base}-{n}.jpg"
            n += 1
        used_names.add(name)
        dest = OUT / name
        save_web(img, dest)
        exports.append(
            {
                "file": name,
                "src": f"assets/photos/optimized/{name}",
                "room": c["room"],
                "score": c["score"],
                "enhanced": c["enhanced"],
                "source": c["source"],
                "alt": alt_for_room(c["room"], i),
                "title": title_for_room(c["room"], i),
                "meta": meta_for_room(c["room"]),
            }
        )
        print(f"  {name} ← {c['source']} (score={c['score']}, room={c['room']})")

    MANIFEST.write_text(json.dumps({"exports": exports, "count": len(exports)}, indent=2), encoding="utf-8")
    print(f"\nExported {len(exports)} photos → {OUT}")
    print(f"Manifest: {MANIFEST}")


def alt_for_room(room: str, i: int) -> str:
    alts = {
        "exterior": "Villa Augflor pool and garden, Cagnes-sur-Mer",
        "barcelona": "Barcelona master bedroom at Villa Augflor",
        "asian": "Asian double bedroom at Villa Augflor",
        "provance": "Provence ground-floor bedroom at Villa Augflor",
        "living": "Living room at Villa Augflor, French Riviera",
        "garden-room": "Garden room overlooking the pool at Villa Augflor",
        "bathrooms": "Bathroom at Villa Augflor",
        "kitchen": "Kitchen at Villa Augflor",
    }
    return alts.get(room, "Villa Augflor interior and exterior")


def title_for_room(room: str, i: int) -> str:
    titles = {
        "exterior": "Pool & garden",
        "barcelona": "Master suite",
        "asian": "Asian room",
        "provance": "Provence bedroom",
        "living": "Living space",
        "garden-room": "Garden room",
        "bathrooms": "Bathroom",
        "kitchen": "Kitchen",
    }
    return titles.get(room, "Villa Augflor")


def meta_for_room(room: str) -> str:
    metas = {
        "exterior": "Exterior · May 2026",
        "barcelona": "Upstairs · Barcelona · 2026",
        "asian": "Upstairs · Asian · 2026",
        "provance": "Ground floor · Provence · 2026",
        "living": "Ground floor · 2026",
        "garden-room": "Garden room · 2026",
        "bathrooms": "Bathroom · 2026",
        "kitchen": "Kitchen · 2026",
    }
    return metas.get(room, "Villa Augflor · 2026")


if __name__ == "__main__":
    main()
