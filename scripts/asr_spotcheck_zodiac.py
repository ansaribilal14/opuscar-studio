#!/usr/bin/env python3
"""asr_spotcheck_zodiac.py — faster-whisper QC on the v4 master (task 6, directive §9).
Transcribes two windows (cold open + mid-film), fuzzy-matches against the
canonical narration.json block texts. PASS >= 0.75 ratio (base.en model)."""
import json, os, subprocess, sys, tempfile
from difflib import SequenceMatcher

ROOT = "/home/z/my-project/work/video-002-zodiac"
MASTER = os.path.join(ROOT, "build/zodiac-killer-002.mp4")
narr = json.load(open(os.path.join(ROOT, "src/narration.json")))
tl = json.load(open(os.path.join(ROOT, "build/timeline.json")))
WINS = None  # aligned to block boundaries below
_b = {x["id"]: x for x in tl["blocks"]}
WINS = [(round(_b["b0a"]["start"] + 0.4, 2), round(_b["b0c"]["end"] - 0.3, 2)),
        (round(_b["b3b"]["start"] + 0.4, 2), round(_b["b3d"]["end"] - 0.3, 2))]
blocks = {b["id"]: b for b in tl["blocks"]}

def blocks_in(a, b):
    return [blk for blk in narr["blocks"] if blk.get("text", "").strip()
            and blocks[blk["id"]]["end"] > a and blocks[blk["id"]]["start"] < b]

def norm(s):
    return "".join(c for c in s.lower() if c.isalnum() or c.isspace())

from faster_whisper import WhisperModel
import numpy as np, soundfile as sf
model = WhisperModel("base.en", device="cpu", compute_type="int8")
overall = []
for (a, b) in WINS:
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
        tmp = tf.name
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-ss", str(a), "-to", str(b),
                    "-i", MASTER, "-vn", "-ac", "1", "-ar", "16000", tmp], check=True)
    audio, _ = sf.read(tmp, dtype="float32")
    os.unlink(tmp)
    segs, _ = model.transcribe(audio, language="en", beam_size=1)
    hyp = norm(" ".join(s.text for s in segs))
    expect = norm(" ".join(x["text"] for x in blocks_in(a, b)))
    # coverage: fraction of expected words found in the transcript (fuzzy via ratio)
    r = SequenceMatcher(None, expect, hyp).ratio()
    wr = len(set(hyp.split()) & set(expect.split())) / max(1, len(set(expect.split())))
    overall.append(wr)  # house gate metric (as in task 3-e): fuzzy WORD coverage
    print(f"window {a}-{b}s: seq_ratio={r:.2f} word_coverage={wr:.2f} expected_words={len(expect.split())}")
verdict = "PASS" if min(overall) >= 0.75 else "FAIL"
print("ASR SPOTCHECK:", verdict)
sys.exit(0 if verdict == "PASS" else 1)
