#!/usr/bin/env python3
"""release_ostrich.py — create GitHub Release ostrich-plate-v1.0.0 + upload assets."""
import json, os, subprocess, sys, urllib.request, time

REPO = "ansaribilal14/opuscar-studio"
_remote = subprocess.run(["git", "-C", "/home/z/my-project", "remote", "get-url", "origin"],
                         capture_output=True, text=True).stdout.strip()
TOKEN = _remote.split("https://ansaribilal14:")[1].split("@")[0]  # never printed
ROOT = "/home/z/my-project/work/ostrich-plate"
TAG = "ostrich-plate-v1.0.0"

BODY = """# The Ostrich, Plate XII — **ostrich-plate v1.0.0**
**Opuscar Studio · The Documentary Engine — copperplate engraving**

The studio's first film, restored. The original 58-second copperplate short was lost in the
2026-10-13 account migration; this rebuild re-authors it from the preserved method (worklog
Task 1 + the vendored engraving engine): a museum science-card film in which an ostrich is
engraved as a living plate — the burin cuts the first line on raw copper, the proof is pulled,
three hatch passes build the tone, four magnified roundels carry the facts, the washes hand-
colour the print, and the finished plate signs itself.

## The plate's facts (all established, nothing invented)
- **The eye** — the largest of any land animal, fringed with double lashes.
- **The brain**, drawn beside the eye that dwarfs it: the brain is smaller than either eye.
- **The foot** — two toes only, where every other living bird has three or four.
- **The egg** — some fifteen centimetres long; the largest egg laid by any living bird.
- A grown cock stands 2.7 m tall; a stride covers up to three metres at a walk.
- The cock digs the nest scrape; the hen incubates by day, the cock by night.

## Assets
| File | What |
|---|---|
| `ostrich-plate.mp4` | 62.7 s · 1920×1080 · 24 fps · −13.8 LUFS · grain 4 |
| `ostrich-plate.srt` | 6 word-timed cues (matching the burned deckled-script slips) |
| `poster.jpg` | The finished plate |

## Credits
- Narration · Microsoft edge-tts, en-US-GuyNeural (MIT) — the studio's house voice
- Type · Bodoni Moda, Pinyon Script (SIL OFL)
- Score & sound · written in code (music/score_ostrich.py) — 88 BPM, D minor → D major at the
  hand-colouring; harpsichord + pizzicato strings, first bowed notes with the amber wash;
  sampled instruments from Versilian Studios VSCO 2 CE (CC0) and VCSL (CC0-ish, per-lib licenses)
- Engine & style · lemo-opuscar Copperplate Engraving (burin/plate/wash/copper)

## QC gates (measured on this build)
1505 frames, 0 decode errors · loudness −13.8 LUFS / TP −1.1 dB · score cue timing all within
±1 frame of picture (timing_report) · cuecheck 0 mismatches · ASR word coverage 0.83–1.00
across all six lines · subtitles burned + shipped.

---

*Opuscar Studio — The Documentary Engine. Truth over drama: every fact on the plate is
established; the plate signs itself.*
"""

def api(method, path, data=None):
    url = f"https://api.github.com/repos/{REPO}/{path}"
    req = urllib.request.Request(url, method=method,
        headers={"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github+json"},
        data=json.dumps(data).encode() if data else None)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req) as r:
                return json.loads(r.read().decode())
        except Exception as e:
            print("  api retry", attempt, e); time.sleep(5)
    raise SystemExit("api failed")

rel = api("POST", "releases", {
    "tag_name": TAG, "target_commitish": "main",
    "name": "The Ostrich, Plate XII — ostrich-plate v1.0.0",
    "body": BODY, "draft": False, "prerelease": False,
})
rid = rel["id"]
print("release id", rid, rel["html_url"], flush=True)

up = f"https://uploads.github.com/repos/{REPO}/releases/{rid}/assets?name="
for fname, ctype, path in [
    ("ostrich-plate.mp4", "video/mp4", os.path.join(ROOT, "ostrich-plate.mp4")),
    ("ostrich-plate.srt", "application/x-subrip", os.path.join(ROOT, "ostrich-plate.srt")),
    ("poster.jpg", "image/jpeg", os.path.join(ROOT, "poster.jpg")),
]:
    size = os.path.getsize(path)
    print(f"uploading {fname} ({size/1e6:.1f} MB) ...", flush=True)
    req = urllib.request.Request(up + fname, method="POST",
        headers={"Authorization": f"token {TOKEN}", "Content-Type": ctype, "Content-Length": str(size)},
        data=open(path, "rb"))
    with urllib.request.urlopen(req, timeout=3600) as r:
        j = json.loads(r.read().decode())
        print("  ->", j["browser_download_url"], flush=True)
print("RELEASE COMPLETE", TAG)
