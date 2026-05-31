#!/usr/bin/env python3
"""
Convert HEIC → JPEG, remove duplicates, SEO-rename for villa-augflor.com uploads.
Target folder: _images/ (or pass path as argv[1])
"""
from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

MAX_WIDTH = 2000
JPEG_QUALITY = 82
SEO_PREFIX = "photo-villa-augflor-cagnes-sur-mer"
IMAGE_EXTS = {".heic", ".jpg", ".jpeg", ".png", ".avif", ".webp"}
SKIP_EXTS = {".mov", ".mp4", ".m4v"}


def file_hash(path: Path, chunk: int = 1 << 20) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        while True:
            block = f.read(chunk)
            if not block:
                break
            h.update(block)
    return h.hexdigest()


def base_stem(path: Path) -> str:
    """IMG_1719 2.HEIC → img_1719"""
    stem = path.stem
    stem = re.sub(r"\s+2$", "", stem, flags=re.IGNORECASE)
    return stem.lower()


def sips_creation(path: Path) -> str:
    try:
        out = subprocess.check_output(
            ["sips", "-g", "creation", str(path)],
            stderr=subprocess.DEVNULL,
            text=True,
        )
        for line in out.splitlines():
            if "creation:" in line:
                return line.split("creation:", 1)[1].strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    return ""


def parse_creation(s: str) -> datetime:
    if not s:
        return datetime.fromtimestamp(0)
    try:
        return datetime.strptime(s, "%Y:%m:%d %H:%M:%S")
    except ValueError:
        return datetime.fromtimestamp(0)


def convert_heic_to_jpeg(heic: Path, jpeg: Path) -> bool:
    tmp = jpeg.with_suffix(".tmp.jpg")
    try:
        subprocess.run(
            ["sips", "-s", "format", "jpeg", "-s", "formatOptions", str(JPEG_QUALITY), str(heic), "--out", str(tmp)],
            check=True,
            capture_output=True,
        )
        subprocess.run(
            ["sips", "-Z", str(MAX_WIDTH), str(tmp), "--out", str(tmp)],
            check=True,
            capture_output=True,
        )
        tmp.replace(jpeg)
        return True
    except subprocess.CalledProcessError as e:
        print(f"  FAIL convert {heic.name}: {e}", file=sys.stderr)
        if tmp.exists():
            tmp.unlink()
        return False


def seo_name(seq: int) -> str:
    return f"{SEO_PREFIX}-{seq:04d}.jpg"


def main() -> int:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "_images"
    if not root.is_dir():
        print(f"Not a directory: {root}", file=sys.stderr)
        return 1

    manifest: list[dict] = []
    removed: list[str] = []

    # --- Phase 1: exact duplicate removal (by hash) ---
    by_hash: dict[str, list[Path]] = {}
    for p in sorted(root.iterdir()):
        if not p.is_file():
            continue
        ext = p.suffix.lower()
        if ext in SKIP_EXTS:
            continue
        if ext not in IMAGE_EXTS:
            continue
        by_hash.setdefault(file_hash(p), []).append(p)

    for digest, paths in by_hash.items():
        if len(paths) < 2:
            continue
        paths_sorted = sorted(
            paths,
            key=lambda p: (
                " 2" in p.stem.lower() or p.stem.endswith(" 2"),
                len(p.name),
                p.name.lower(),
            ),
        )
        keep = paths_sorted[0]
        for dup in paths_sorted[1:]:
            dup.unlink()
            removed.append(dup.name)
            manifest.append(
                {"action": "removed_duplicate", "file": dup.name, "kept": keep.name, "sha256": digest[:12]}
            )

    # --- Phase 2: same stem — keep best single raster per IMG_* base ---
    by_stem: dict[str, list[Path]] = {}
    for p in sorted(root.iterdir()):
        if not p.is_file():
            continue
        ext = p.suffix.lower()
        if ext not in IMAGE_EXTS:
            continue
        stem = base_stem(p)
        if not re.match(r"^img_\d+", stem):
            continue
        by_stem.setdefault(stem, []).append(p)

    for stem, paths in by_stem.items():
        if len(paths) < 2:
            continue
        # Prefer existing jpg over heic; among same type prefer larger (more detail)
        def rank(p: Path) -> tuple:
            ext = p.suffix.lower()
            is_heic = ext == ".heic"
            is_dup_name = " 2" in p.stem
            return (is_dup_name, is_heic, -p.stat().st_size)

        paths_sorted = sorted(paths, key=rank)
        keep = paths_sorted[0]
        for dup in paths_sorted[1:]:
            if dup == keep:
                continue
            dup.unlink()
            removed.append(dup.name)
            manifest.append({"action": "removed_stem_duplicate", "file": dup.name, "kept": keep.name, "stem": stem})

    # --- Phase 3: convert remaining HEIC ---
    converted: list[Path] = []
    for heic in sorted(root.glob("*")):
        if not heic.is_file() or heic.suffix.lower() != ".heic":
            continue
        jpeg = heic.with_suffix(".jpg")
        if jpeg.exists():
            heic.unlink()
            manifest.append({"action": "dropped_heic_had_jpg", "file": heic.name, "kept": jpeg.name})
            continue
        if convert_heic_to_jpeg(heic, jpeg):
            heic.unlink()
            converted.append(jpeg)
            manifest.append({"action": "converted", "from": heic.name, "to": jpeg.name})
        else:
            manifest.append({"action": "convert_failed", "file": heic.name})

    # --- Phase 4: SEO rename IMG_*.jpg (and fresh conversions) ---
    to_rename: list[Path] = []
    for p in sorted(root.iterdir()):
        if not p.is_file() or p.suffix.lower() not in {".jpg", ".jpeg"}:
            continue
        if re.match(r"^IMG_\d+", p.stem, re.IGNORECASE) or " 2" in p.stem:
            to_rename.append(p)

    to_rename.sort(
        key=lambda p: (
            parse_creation(sips_creation(p)),
            p.stat().st_mtime,
            p.name.lower(),
        )
    )

    used_names: set[str] = set()
    seq = 1
    for p in to_rename:
        while True:
            target = root / seo_name(seq)
            seq += 1
            if target.name not in used_names and not target.exists():
                break
        used_names.add(target.name)
        old = p.name
        p.rename(target)
        manifest.append({"action": "seo_rename", "from": old, "to": target.name})

    # --- Summary ---
    summary_path = root / "IMAGE-PROCESSING-MANIFEST.json"
    summary = {
        "folder": str(root),
        "removed_duplicates": len(removed),
        "seo_prefix": SEO_PREFIX,
        "max_width_px": MAX_WIDTH,
        "jpeg_quality": JPEG_QUALITY,
        "entries": manifest,
    }
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    remaining_heic = list(root.glob("*.heic")) + list(root.glob("*.HEIC"))
    print(f"Done: {root}")
    print(f"  Removed duplicates: {len(removed)}")
    print(f"  Converted HEIC: {len(converted)}")
    print(f"  SEO-renamed: {sum(1 for e in manifest if e.get('action') == 'seo_rename')}")
    print(f"  Remaining HEIC: {len(remaining_heic)}")
    print(f"  Manifest: {summary_path}")
    return 0 if not remaining_heic else 1


if __name__ == "__main__":
    raise SystemExit(main())
