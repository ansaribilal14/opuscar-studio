#!/usr/bin/env python3
"""release.py — create GitHub Release video-003-isdal-woman-v1.0.0 and upload assets."""
import json, os, subprocess, sys, urllib.request

REPO = "ansaribilal14/opuscar-studio"
TOKEN = open(os.path.expanduser("~/.git-credentials")).read().split("https://ansaribilal14:")[1].split("@")[0]
ROOT = "/home/z/my-project/work/video-003-isdal-woman"
TAG = "video-003-isdal-woman-v1.0.0"

BODY = """# The Isdal Woman: The Woman Who Erased Her Own Identity
**video-003 — full documentary + 4 vertical shorts · Opuscar Studio, The Documentary Engine**

In November 1970, a burned body was found in Norway's Isdalen valley. Her labels were
cut off, her names were false, and fifty-five years later the world still cannot say
who she was. Evidence-first: every claim sourced, theories labelled, nothing invented.

## Assets
| File | What |
|---|---|
| `isdal-woman-003.mp4` | Full film — 16:28, 1280×720, 24 fps, −16 LUFS |
| `isdal-short-A.mp4` | Short: The Strange Suitcases (vertical) |
| `isdal-short-B.mp4` | Short: The Notebook and the Travel Trail (vertical) |
| `isdal-short-C.mp4` | Short: Was She a Spy? (vertical) |
| `isdal-short-D.mp4` | Short: The Identity That Remains Unknown (vertical) |
| `poster.jpg` | Poster frame |
| `isdal-woman-003.srt` | Subtitles (148 cues) |

## Sources
- BBC News — "Isdal Woman: The mystery death haunting Norway for 46 years" (H. Cheung, 13 May 2017)
- Wikipedia — "Isdal Woman" (police records, NRK, Bergens Tidende/BA, A-magasinet aggregated)
- NRK + BBC World Service — "Death in Ice Valley" (2018)
- Aske (2018), *Kvinnen i Isdalen*; Le Républicain Lorrain (2019); NZZ (2023) — single-source claims labelled unverified in the film

## Open claims (transparency)
500 DM≈US$137 conversion · Room 407 (single source) · glasses-fingerprint exhibit identity ·
image rights re-clearance before commercial use. Full ledger: `research/CLAIMS.md` in the repo.

*The 1970 suicide verdict is contested; espionage and murder remain unproven theories. Nothing here is invented — the evidence does not settle it, and the film says so.*

---
Opuscar Studio — git-as-main-brain: https://github.com/ansaribilal14/opuscar-studio
"""

def req(url, data=None, method=None, headers=None, raw=False):
    r = urllib.request.Request(url, method=method)
    r.add_header("Authorization", f"token {TOKEN}")
    r.add_header("Accept", "application/vnd.github+json")
    if headers:
        for k, v in headers.items(): r.add_header(k, v)
    body = json.dumps(data).encode() if (data is not None and not raw) else data
    with urllib.request.urlopen(r, body) as resp:
        txt = resp.read()
        return json.loads(txt) if txt and not raw else (txt, resp.status)

# 1) create release
rel = req(f"https://api.github.com/repos/{REPO}/releases", data={
    "tag_name": TAG, "target_commitish": "main",
    "name": "The Isdal Woman — video-003 v1.0.0",
    "body": BODY, "draft": False, "prerelease": False,
})
print("release:", rel["html_url"])

# 2) upload assets
assets = [
    ("build/isdal-woman-003.mp4", "isdal-woman-003.mp4", "video/mp4"),
    ("build/isdal-short-A.mp4", "isdal-short-A.mp4", "video/mp4"),
    ("build/isdal-short-B.mp4", "isdal-short-B.mp4", "video/mp4"),
    ("build/isdal-short-C.mp4", "isdal-short-C.mp4", "video/mp4"),
    ("build/isdal-short-D.mp4", "isdal-short-D.mp4", "video/mp4"),
    ("build/poster.jpg", "poster.jpg", "image/jpeg"),
    ("build/isdal-woman-003.srt", "isdal-woman-003.srt", "application/x-subrip"),
]
upurl = rel["upload_url"].split("{")[0]
for path, name, ctype in assets:
    full = os.path.join(ROOT, path)
    size = os.path.getsize(full)
    data = open(full, "rb").read()
    _, status = req(f"{upurl}?name={name}", data=data, method="POST",
                    headers={"Content-Type": ctype, "Content-Length": str(size)}, raw=True)
    print(f"  {name}: {size//1024} KB -> HTTP {status}")
print("DONE")
