#!/usr/bin/env python3
"""Copy honest existing area photos to replace failed Wikimedia downloads, then re-optimize."""
from __future__ import annotations

import json
import shutil
import subprocess
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AREA = ROOT / "assets" / "photos" / "area"
UA = "VillaAugflorAreaGuide/2.0 (https://villa-augflor.com)"

# dest_id -> source_id — visually honest swaps only
REASSIGN = {
    "antibes": "musee-picasso",
    "juan-nightlife": "la-garoupe",
    "paddleboard": "cros-de-cagnes",
    "rose-estates": "domaine-toasc",
    "organic-wine": "chateau-bellet",
    "louis-xv": "casino-monte-carlo",
    "eze-sunset-dining": "eze-town",
    "cannes-beach-clubs": "cannes",
    "mont-boron": "nice",
    "cap3000": "polygone",
    "monaco-luxury": "casino-monte-carlo",
    "gorges-du-loup": "gorges-loup-canyon",
    "azur-park": "aquasplash",
}

# Cards that use gradient tile until place-specific photos are sourced
GRADIENT_ONLY = {
    "grasse", "valbonne", "fenocchio", "pizza-nice", "bakery-local",
}

SINGLE_DOWNLOAD = {
}


def download_wikimedia(pid: str, title: str) -> bool:
    q = urllib.parse.urlencode({
        "action": "query", "titles": title,
        "prop": "imageinfo", "iiprop": "url|extmetadata|size",
        "iiurlwidth": "1280", "format": "json",
    })
    req = urllib.request.Request(
        f"https://commons.wikimedia.org/w/api.php?{q}",
        headers={"User-Agent": UA},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.load(resp)
    for page in data["query"]["pages"].values():
        ii = page.get("imageinfo")
        if not ii:
            return False
        url = ii[0].get("thumburl") or ii[0].get("url")
        if not url:
            return False
        dest = AREA / f"{pid}.jpg"
        req2 = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req2, timeout=120) as resp2:
            dest.write_bytes(resp2.read())
        print(f"  DOWNLOAD OK {pid} <- {title}")
        GRADIENT_ONLY.discard(pid)
        return True
    return False


def main() -> None:
    for dest, src in REASSIGN.items():
        src_jpg = AREA / f"{src}.jpg"
        dest_jpg = AREA / f"{dest}.jpg"
        if not src_jpg.exists():
            print(f"  SKIP {dest}: missing source {src}.jpg")
            continue
        shutil.copy2(src_jpg, dest_jpg)
        print(f"  COPY {src} -> {dest}")

    for pid, title in SINGLE_DOWNLOAD.items():
        if pid in GRADIENT_ONLY:
            time.sleep(3)
            try:
                download_wikimedia(pid, title)
            except Exception as exc:
                print(f"  DOWNLOAD FAIL {pid}: {exc}")

    for pid in GRADIENT_ONLY:
        jpg = AREA / f"{pid}.jpg"
        if jpg.exists():
            jpg.unlink()
            print(f"  REMOVE jpg {pid} (gradient tile)")
        for w in ("480", "960", "1280", "500", "640", "731"):
            for ext in ("webp", "avif"):
                f = AREA / f"{pid}-{w}w.{ext}"
                if f.exists():
                    f.unlink()

    subprocess.run(["python3", str(ROOT / "scripts" / "area-images-pipeline.py"), "--optimize-only"], check=True)
    subprocess.run(["python3", str(ROOT / "scripts" / "generate-area-qc.py")], check=True)
    print("Done reassign + optimize")


if __name__ == "__main__":
    main()
