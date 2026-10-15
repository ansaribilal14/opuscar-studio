#!/usr/bin/env python3
"""release_dyatlov.py — create GitHub Release video-004-dyatlov-pass-v1.0.0 + upload assets."""
import json, os, subprocess, sys, urllib.request

REPO = "ansaribilal14/opuscar-studio"
_remote = subprocess.run(["git", "-C", "/home/z/my-project", "remote", "get-url", "origin"],
                         capture_output=True, text=True).stdout.strip()
TOKEN = _remote.split("https://ansaribilal14:")[1].split("@")[0]  # never printed
ROOT = "/home/z/my-project/work/video-004-dyatlov-pass"
TAG = "video-004-dyatlov-pass-v1.0.0"

BODY = """# Dyatlov Pass: What Really Happened to the Nine Hikers?
**video-004 — The Unclosed File · Opuscar Studio, The Documentary Engine**

February 1959. Nine experienced winter hikers died on a slope in the northern Urals
after cutting their way out of their own tent in the night. The case was closed with a
phrase — *a compelling natural force* — and the arguments have never stopped. This film
tests every theory against the documented evidence, then follows the 2021 ETH Zurich
slab-avalanche model and its 2022 follow-up expeditions to the most defensible answer
science has offered — and is honest about what remains open.

Evidence-first: every claim sourced, theories labelled, nothing invented. All imagery
is either real licensed data (SRTM terrain via Mapzen, CC-BY) or on-screen-labelled
stylized reconstructions. No graphic imagery. No generated image is presented as an
authentic 1959 photograph.

## Assets
| File | What |
|---|---|
| `dyatlov-pass-004.mp4` | Full film — 15:10, 1920×1080, 24 fps, −16.1 LUFS |
| `dyatlov-pass-004.srt` | Word-timed subtitles (221 cues) |
| `poster.jpg` | Poster frame (title card) |
| `thumbnail.jpg` | YouTube thumbnail (operator brief: tent focal / WHY DID THEY LEAVE?) |

## Chapters
```
0:00  The tent is still standing (hook)
1:35  The expedition
4:17  What the searchers found
8:02  The theories, weighed against the evidence
10:40 Can an avalanche explain it? — the 2021 model
13:00 The verdict, and what stays open
```

## Sources
- Case-file archive (dyatlovpass.com/case-files): 26.II.59 decision to open the case;
  28.II.59 discovery protocol of the camp site (Tempalov, Brusnitsyn, Sharavin, Kurikov,
  Maslennikov); scene survey report; group diary copies 23–31.I.59; labaz inspection 2.III.59;
  radiograms 23.II–9.III.59 — private research repository hosting scans; translations checked in context
- Autopsy reports on the same archive (docs 95–134: Slobodin 8.III.59; Doroshenko,
  Krivonischenko, Dyatlov, Kolmogorova 4.III.59; forensic experts Vozrozhdenniy, Laptev, Klinov);
  ravine-four reports and May radiograms (case files vol. II)
- Witness testimony collection (incl. Atmanaki 7–8.IV.59) — cited as testimony, not as established sky events
- Gaume, J. & Puzrin, A.M. "Mechanisms of slab avalanche release and impact in the Dyatlov Pass
  incident in 1959." Communications Earth & Environment 2, 10 (2021). DOI 10.1038/s43247-020-00081-8 (open access)
- Gaume & Puzrin, "Post-publication careers: follow-up expeditions reveal avalanches at Dyatlov Pass,"
  Communications Earth & Environment (2022). DOI 10.1038/s43247-022-00393-x
- Russian prosecutors' 2019–2020 re-examination (public statements: avalanche as trigger,
  deaths by hypothermia, no crime)
- Terrain plates: SRTM via Mapzen Terrain Tiles (AWS Open Data), CC-BY — marker positions approximate

## Open claims (transparency)
- Origin of the beta contamination on some garments — documented, never established
- Why no one returned to the tent; why the group split — open
- Exact sequence of the ravine four's deaths — open
- The 1959 closure phrase translation — standard rendering of the documented Russian text
Full ledger: `research/CLAIMS.md` in the repo.

*The 2021/2022 science is a testable, peer-reviewed mechanism — not proof of every detail. The film says so on screen.*

---

*Opuscar Studio — The Documentary Engine. Deterministic render; QC gates: 0 decode
errors, −16.1 LUFS, ASR word coverage 0.97, 10-question editorial review.*
"""

def api(method, path, data=None):
    url = f"https://api.github.com/repos/{REPO}/{path}"
    req = urllib.request.Request(url, method=method,
        headers={"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github+json"},
        data=json.dumps(data).encode() if data else None)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())

# create release
rel = api("POST", "releases", {
    "tag_name": TAG, "target_commitish": "main",
    "name": "Dyatlov Pass — video-004 v1.0.0",
    "body": BODY, "draft": False, "prerelease": False,
})
rid = rel["id"]
print("release id", rid, rel["html_url"])

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
        print("  ->", j["browser_download_url"])
print("RELEASE COMPLETE", TAG)
