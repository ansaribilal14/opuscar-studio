#!/usr/bin/env python3
"""asr_dyatlov.py — faster-whisper QC on the video-004 master.
Windows aligned to exact block boundaries from the timeline; word-coverage metric
(house metric — ASR renders numbers as digits, so char ratio is misleading).
PASS at word coverage >= 0.85."""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf
from difflib import SequenceMatcher

ROOT = "/home/z/my-project/work/video-004-dyatlov-pass"
MASTER = os.path.join(ROOT, "build/dyatlov-pass-004.mp4")

TL = json.loads(subprocess.run(["node", "--input-type=module", "-e",
    "import { buildTimeline } from '/home/z/my-project/work/video-004-dyatlov-pass/src/timeline.js';"
    "console.log(JSON.stringify(buildTimeline()));"],
    capture_output=True, text=True).stdout)
blocks = {b["id"]: b for b in TL["blocks"]}
narr = json.load(open(os.path.join(ROOT, "src/narration.json")))
texts = {b["id"]: b["text"] for b in narr["blocks"] if b.get("text", "").strip()}

def words(s):
    return [w.strip(".,;:!?\u2014\u2013-\"'()").lower() for w in s.split() if w.strip(".,;:!?\u2014\u2013-\"'()")]

WINDOWS = [
    ("cold_open", blocks["b1a"]["start"], blocks["b1d"]["end"]),
    ("science", blocks["b5c"]["start"], blocks["b5f"]["end"]),
    ("conclusion", blocks["b6a"]["start"], blocks["b6c"]["end"]),
]

def pull_window(t0, t1, name):
    out = f"/tmp/asr_win_{name}.wav"
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-ss", f"{t0:.2f}", "-to", f"{t1:.2f}",
                    "-i", MASTER, "-ac", "1", "-ar", "16000", "-vn", out],
                   capture_output=True, check=True)
    return out

from faster_whisper import WhisperModel
model = WhisperModel("base.en", device="cpu", compute_type="int8")

ok_all = True
for name, t0, t1 in WINDOWS:
    wav = pull_window(t0, t1, name)
    ids = [bid for bid in ["b1a","b1b","b1b2","b1c","b1d","b5c","b5c2","b5d","b5e","b5f","b6a","b6b","b6b2","b6c"]
           if bid in blocks and blocks[bid]["start"] >= t0 - 0.5 and blocks[bid]["end"] <= t1 + 0.5]
    expect = " ".join(texts[bid] for bid in ids)
    ew = words(expect)
    segs, _ = model.transcribe(sf.read(wav, dtype="float32")[0], language="en", beam_size=1)
    trans = " ".join(s.text for s in segs)
    tw = set(words(trans))
    hit = sum(1 for w in ew if w in tw)
    cov = hit / max(1, len(ew))
    print(f"{name}: blocks={ids[0]}..{ids[-1]} expect {len(ew)}w -> coverage {cov:.2f}")
    if cov < 0.85: ok_all = False; print("  TRANSCRIPT:", trans[:300])
print("ASR GATE:", "PASS" if ok_all else "FAIL")
sys.exit(0 if ok_all else 1)
