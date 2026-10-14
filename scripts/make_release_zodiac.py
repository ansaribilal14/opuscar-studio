#!/usr/bin/env python3
"""make_release_zodiac.py — create release video-002-zodiac-v3.0.0 and upload assets.
Token is read from the repo remote URL (never printed). Per-asset upload; safe to
re-run (existing assets with the same name are replaced)."""
import json, os, re, subprocess, sys, urllib.request

REPO = "ansaribilal14/opuscar-studio"
TAG = "video-002-zodiac-v3.0.0"
TITLE = "video-002 Zodiac v3.0.0 — image-first visual recovery (engine v4)"
ASSETS = [
    ("/home/z/my-project/work/video-002-zodiac/build/zodiac-killer-002.mp4",
     "application/octet-stream"),
    ("/home/z/my-project/work/video-002-zodiac/build/zodiac-killer-002.srt",
     "application/x-subrip"),
    ("/home/z/my-project/work/video-002-zodiac/build/poster.jpg", "image/jpeg"),
]
BODY = """The Zodiac Killer — full documentary, rebuilt on the v4 image-first composition engine (visual quality recovery per the operator master directive of 2026-10-14).

## What changed vs v2.0.0
- **The hook**: opens on a credited period newsroom photograph with the 408 cipher as a legible ink-on-paper reconstruction and the demand as display type; "51 YEARS" is the first hard cut; the title lands over a credited Golden Gate overlook photo. The mislabeled modern Australian front page is gone.
- **Photographs lead**: grade saturation 0.38 → 0.72, global dimming/scrim stacks removed, full-bleed archival frames for the attacks with names as lower-thirds (no card walls).
- **Ciphers legible**: 408/340/Z13/Z32 rendered as bright grids or ink-on-paper; the final 18 characters are readable for the first time.
- **Editing grammar**: hard cuts on new facts, dissolves within beats, a mid-block photo cut, stronger Ken Burns moves; ghost backdrops retired.
- **Asset hygiene**: typewriter_keys.jpg rejected (watermarked stock preview); chronicle_building.jpg re-identified (Golden Gate overlook) and honestly credited; every remaining photo credited on screen and in CREDITS.md.

## Verification (directive §9/§10)
- Controlled proof benchmark (base/A/B/C, identical narration) — candidate C selected; report in `docs/BENCHMARK-2026-10-14.md`.
- Regression root-cause report: `docs/REGRESSION-2026-10-14.md`.
- Gates: per-segment decode integrity, final full decode 0 errors, −16.1 LUFS integrated, ASR spot-check word coverage 0.91/0.93, luma void scan clean, 90-frame encoded-output editorial review.

Reconstructions are labelled on screen; theories are labelled as theories; nothing is invented. Sources in the description of the film.
"""

def token():
    url = subprocess.run(["git", "-C", "/home/z/my-project", "config", "--get", "remote.origin.url"],
                         capture_output=True, text=True).stdout.strip()
    m = re.search(r"://([^:]+):([^@]+)@", url)
    if not m: sys.exit("no token in remote")
    return m.group(2)

T = token()
def api(url, data=None, headers=None, method=None):
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in (headers or {}).items(): req.add_header(k, v)
    req.add_header("Authorization", f"token {T}")
    req.add_header("User-Agent", "opuscar-studio-task6")
    return urllib.request.urlopen(req, timeout=120)

# 1) create release (or fetch existing)
try:
    r = api(f"https://api.github.com/repos/{REPO}/releases",
            json.dumps({"tag_name": TAG, "target_commitish": "main", "name": TITLE,
                        "body": BODY, "draft": False, "prerelease": False}).encode(),
            {"Content-Type": "application/json"}).read()
    rel = json.loads(r)
    print("release created:", rel["id"])
except Exception as e:
    err = e.read().decode() if hasattr(e, "read") else str(e)
    if "already_exists" in err:
        rel = json.loads(api(f"https://api.github.com/repos/{REPO}/releases/tags/{TAG}").read())
        print("release exists:", rel["id"])
    else:
        raise

up = rel["upload_url"].split("{")[0]
existing = {a["name"] for a in json.loads(api(f"https://api.github.com/repos/{REPO}/releases/{rel['id']}/assets").read())}

# 2) upload assets (replace same-name)
for path, ctype in ASSETS:
    name = os.path.basename(path)
    if name in existing:
        aid = [a["id"] for a in json.loads(api(f"https://api.github.com/repos/{REPO}/releases/{rel['id']}/assets").read()) if a["name"] == name][0]
        api(f"https://api.github.com/repos/{REPO}/releases/assets/{aid}", method="DELETE")
        print("deleted old", name)
    size = os.path.getsize(path)
    print(f"uploading {name} ({size//1024//1024} MB) ...", flush=True)
    with open(path, "rb") as f:
        try:
            api(f"{up}?name={name}", f.read(), {"Content-Type": ctype}).read()
            print("  OK", name, flush=True)
        except Exception as e:
            print("  FAIL", name, str(e)[:200], flush=True)
            sys.exit(2)
print("RELEASE COMPLETE:", rel.get("html_url", ""))
