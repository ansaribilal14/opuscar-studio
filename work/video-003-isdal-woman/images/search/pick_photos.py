#!/usr/bin/env python3
"""pick_photos.py — download the clean, non-watermarked picks from search results."""
import json, os, urllib.request, sys

S = "/home/z/my-project/work/video-003-isdal-woman/images/search"
CACHE = "/home/z/my-project/work/video-003-isdal-woman/images/cache"

PICKS = [
    # (out_name, search_file, index, source_name)
    ("moody_peak.jpg",     "q_valley.json",    2, "Unsplash"),
    ("misty_fjord.jpg",    "q_road.json",      3, "The Photo Hikes"),
    ("hairpin_road.jpg",   "q_road.json",      0, "Loudavym krokiem"),
    ("rorbu_coast.jpg",    "q_bergen.json",    3, "Chasing Hippoz Travel"),
    ("archive_folders.jpg","q_archive.json",   4, "The New York Times"),
    ("stavanger_street.jpg","q_stavanger.json",2, "Stavanger Shore Excursions"),
    ("train_winter.jpg",   "q_train.json",     3, "Trip.com"),
    ("knit_texture.jpg",   "q_knit.json",      3, "Unsplash"),
]

ok = True
for name, sf, idx, src in PICKS:
    d = json.load(open(os.path.join(S, sf)))
    try:
        url = d["results"][idx]["original_url"]
    except Exception as e:
        print(f"MISS {name}: {e}"); ok = False; continue
    out = os.path.join(CACHE, name)
    if os.path.exists(out) and os.path.getsize(out) > 30000:
        print(f"keep {name} (exists)"); continue
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as r, open(out, "wb") as f:
            f.write(r.read())
        print(f"OK   {name} <- {src}")
    except Exception as e:
        print(f"FAIL {name}: {e}"); ok = False
sys.exit(0 if ok else 1)
