"""Exact + perceptual deduplication.

- SHA-256: byte-exact duplicates
- dHash (64-bit, grayscale 9x8): visually similar images; Hamming distance <= 8 = similar
"""

import os

from PIL import Image


def dhash_hex(im: Image.Image) -> str:
    im = im.convert("L").resize((9, 8), Image.LANCZOS)
    px = list(im.getdata())
    bits = 0
    for row in range(8):
        for col in range(8):
            left = px[row * 9 + col]
            right = px[row * 9 + col + 1]
            bits = (bits << 1) | (1 if left > right else 0)
    return f"{bits:016x}"


def dhash_path(path: str) -> str:
    with Image.open(path) as im:
        return dhash_hex(im)


def hamming(h1: str, h2: str) -> int:
    return bin(int(h1, 16) ^ int(h2, 16)).count("1")


def find_duplicates(entries: list, threshold: int = 8) -> dict:
    """Return {asset_id: duplicate_of_asset_id} using sha256 first, then dHash."""
    dups = {}
    by_sha = {}
    hashed = [e for e in entries if e.get("sha256")]
    for e in hashed:
        if e["sha256"] in by_sha:
            dups[e["asset_id"]] = by_sha[e["sha256"]]
        else:
            by_sha[e["sha256"]] = e["asset_id"]
    vis = [e for e in hashed if e.get("phash") and e["asset_id"] not in dups]
    for i, a in enumerate(vis):
        if a["asset_id"] in dups:
            continue
        for b in vis[i + 1:]:
            if b["asset_id"] in dups:
                continue
            if hamming(a["phash"], b["phash"]) <= threshold:
                dups[b["asset_id"]] = a["asset_id"]
    return dups
