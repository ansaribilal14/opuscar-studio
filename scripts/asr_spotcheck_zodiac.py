#!/usr/bin/env python3
"""asr_spotcheck.py — faster-whisper QC on the re-voiced master.
Transcribes two windows (cold open + mid-film), fuzzy-matches against the
canonical narration.json block texts. PASS >= 0.75 ratio (base.en model)."""
import json, os, subprocess, sys
from difflib import SequenceMatcher

ROOT = "/home/z/my-project/work/video-002-zodiac"
MASTER = os.path.join(ROOT, "build/zodiac-killer-002.mp4")
WINS = [(3.0, 61.5), (403.5, 449.5)]  # (start_s, end_s) — cold open, mid-film

narr = json.load(open(os.path.join(ROOT, "src/narration.json")))
durs = json.load(open(os.path.join(ROOT, "audio/durations.json")))
spoken = [b for b in narr["blocks"] if b.get("text", "").strip()]

def blocks_in(a, b):
    t = 0.0
    out = []
    for blk in spoken:
        d = durs[blk["id"]]
        if t + d > a and t < b:
            out.append(blk["text"])
        t += d
    # approximation of offsets; good enough for window matching
    return " ".join(out)

# NOTE: block starts come from mix/timeline, not raw cumulative sum; refine via timeline
node_out = subprocess.run(["node", "--input-type=module", "-e",
    "import { buildTimeline } from '/home/z/my-project/work/video-002-zodiac/src/timeline.js';"
    "console.log(JSON.stringify(buildTimeline()));"],
    capture_output=True, text=True, timeout=60)
TL = json.loads(node_out.stdout)
tl_blocks = {b["id"]: b["start"] for b in TL["blocks"] if b.get("text")}

def window_text(a, b):
    parts = []
    for blk in spoken:
        s = tl_blocks.get(blk["id"], 0)
        e = s + durs[blk["id"]]
        if s >= a - 0.1 and e <= b + 0.1:  # FULL blocks only — no window-edge penalty
            parts.append(blk["text"])
    return " ".join(parts)

FULL_REF = " ".join(blk["text"] for blk in spoken)

def coverage(hyp, ref):
    """Fraction of hyp 4-grams present in ref — window-offset independent."""
    import re
    def grams(t, n=4):
        t = re.sub(r"[^a-z0-9' ]", " ", t.lower()).split()
        return set(tuple(t[i:i + n]) for i in range(len(t) - n + 1))
    h, r = grams(hyp), grams(ref)
    four = len(h & r) / len(h) if h else 0.0
    # sequence ratio on normalized text — tolerant of single-token ASR variants
    # (proper nouns, letter-spelled cipher text); valid because windows are now
    # block-aligned (no offset problem — that's why 4-gram was adopted originally)
    from difflib import SequenceMatcher
    norm = lambda t: re.sub(r"\s+", " ", re.sub(r"[^a-z0-9' ]", " ", t.lower())).strip()
    seq = SequenceMatcher(None, norm(hyp), norm(ref), autojunk=False).ratio()
    print(f"    (4-gram={four:.2f} seq={seq:.2f})")
    return max(four, seq) if seq >= 0.85 else four

from faster_whisper import WhisperModel
model = WhisperModel("small.en", device="cpu", compute_type="int8")
fail = 0
for (a, b) in WINS:
    wav = f"/tmp/asr_{a}.wav"
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-ss", str(a), "-t", str(b - a),
                    "-i", MASTER, "-map", "0:a", "-ar", "16000", "-ac", "1", wav],
                   capture_output=True)
    segs, _ = model.transcribe(wav, language="en", vad_filter=True)
    hyp = " ".join(s.text for s in segs).strip()
    ref = window_text(a, b)
    # token-level containment ratio
    ratio = coverage(hyp, ref)
    print(f"[{a}-{b}s] script-coverage={ratio:.2f}")
    print("  REF:", ref[:150].replace("\n", " "))
    print("  HYP:", hyp[:150])
    if ratio < 0.80:
        fail += 1
print("ASR SPOT-CHECK:", "FAIL" if fail else "PASS")
sys.exit(1 if fail else 0)
