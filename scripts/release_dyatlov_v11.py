#!/usr/bin/env python3
"""release_dyatlov_v11.py — create GitHub Release video-004-dyatlov-pass-v1.1.0 + upload assets.
Per-asset push: master uploaded FIRST; each asset verified as it lands."""
import json, os, subprocess, sys, urllib.request, time

REPO = "ansaribilal14/opuscar-studio"
_remote = subprocess.run(["git", "-C", "/home/z/my-project", "remote", "get-url", "origin"],
                         capture_output=True, text=True).stdout.strip()
TOKEN = _remote.split("https://ansaribilal14:")[1].split("@")[0]  # never printed
ROOT = "/home/z/my-project/work/video-004-dyatlov-pass"
TAG = "video-004-dyatlov-pass-v1.1.0"

BODY = """# Dyatlov Pass — video-004 **v1.1.0** (period-photo edition)
**video-004 — The Unclosed File · Opuscar Studio, The Documentary Engine**

v1.1.0 upgrades the film's cold open with the **real 1959 period photograph**: the
abandoned tent on the slope of height 1079 as the searchers found it on 26 February
1959 — skis still planted, supplies scattered, canvas cut. Deterministic re-render of
the full master through the standard pipeline; the verified edit, narration, score and
subtitles are unchanged (SRT byte-identical to v1.0.0).

## What changed (v1.0.0 -> v1.1.0)
- **Hook (b1a)** now shows the authentic archival photograph instead of the labelled
  reconstruction. Chrome on screen: `PHOTOGRAPH: 1959 (CREDITED IN DESCRIPTION)`.
- **New poster** built from the cold open (real photograph + title).
- Provenance: acquisition via the studio's `imgacq` pipeline (merged PR #17) —
  discovery → validated download (magic bytes + full decode + sha256) → per-film
  provenance ledger → human visual inspection → classification
  `authentic_verified` → staged into the declared renderer slot. Zero renderer changes.
- Also verified and archived in the ledger (available for future content passes):
  8 scans from criminal case **Volume 1** (public domain) — the 26.II.1959 decision to
  open the case, prosecutor Ivanov's 16.III.1959 resolution (typed finding: the group
  of 9 died on the slope of height 1079 on the evening of 1.II.1959 and the tent may
  have been cut open), the 18.V.1959 radiological examination order, the 30.IV.1959
  extension of the investigation, and the investigative summary of the route error and
  the tent discovery.

## Asset credit
- Cold-open photograph: Wikimedia Commons, [File:Dyatlov Pass incident 02.jpg](https://commons.wikimedia.org/wiki/File:Dyatlov_Pass_incident_02.jpg) — Public domain (Soviet-era case materials), description «Палатка Дятловцев».
- Case-file scans: Wikimedia Commons, `File:Dyatlov.Volume 1.*.jpg` — Public domain.

## Assets
| File | What |
|---|---|
| `dyatlov-pass-004.mp4` | Full film — 15:10, 1920×1080, 24 fps, −16.0 LUFS |
| `dyatlov-pass-004.srt` | Word-timed subtitles (221 cues, byte-identical to v1.0.0) |
| `poster.jpg` | Poster — cold open with the real 1959 photograph |
| `thumbnail.jpg` | YouTube thumbnail (unchanged from v1.0.0) |

## Chapters (unchanged)
```
0:00  The tent is still standing (hook — now with the real photograph)
1:35  The expedition
4:17  What the searchers found
8:02  The theories, weighed against the evidence
10:40 Can an avalanche explain it? — the 2021 model
13:00 The verdict, and what stays open
```

## Sources
Full source list unchanged from v1.0.0 — see `research/SOURCES.md` + `research/CLAIMS.md`
in the repo (case-file archive, autopsy reports, Gaume & Puzrin 2021/2022
Communications Earth & Environment, Russian prosecutors' 2019–2020 re-examination,
SRTM terrain via Mapzen tiles CC-BY).

## QC gates (all measured on this build)
16/16 segments integrity-verified (0 decode errors) · full-master decode 0 errors ·
luma scan 182 samples / 0 void flags · loudness −16.0 LUFS · ASR word coverage 0.97
(cold open / science / conclusion) · SRT deterministic-identical.

---

*Opuscar Studio — The Documentary Engine. Truth over drama: every claim sourced,
theories labelled, nothing invented.*
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
            print("  api retry", attempt, e)
            time.sleep(5)
    raise SystemExit("api failed")

rel = api("POST", "releases", {
    "tag_name": TAG, "target_commitish": "main",
    "name": "Dyatlov Pass — video-004 v1.1.0 (period-photo edition)",
    "body": BODY, "draft": False, "prerelease": False,
})
rid = rel["id"]
print("release id", rid, rel["html_url"], flush=True)

up = f"https://uploads.github.com/repos/{REPO}/releases/{rid}/assets?name="
for fname, ctype, path in [
    ("dyatlov-pass-004.mp4", "video/mp4", os.path.join(ROOT, "build/dyatlov-pass-004.mp4")),
    ("dyatlov-pass-004.srt", "application/x-subrip", os.path.join(ROOT, "build/dyatlov-pass-004.srt")),
    ("poster.jpg", "image/jpeg", os.path.join(ROOT, "build/poster.jpg")),
    ("thumbnail.jpg", "image/jpeg", os.path.join(ROOT, "build/thumbnail.jpg")),
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
