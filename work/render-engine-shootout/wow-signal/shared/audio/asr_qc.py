#!/usr/bin/env python3
"""asr_qc.py — independent transcript spot-check of the wow-signal narration.

House standard (BRAIN.md Step 8 / directive §9): fuzzy-match ASR transcript of
selected narration audio against canonical block text. PASS >= 0.75 (base.en).
Spot blocks: b01 (cold open), b09 (data-dense), b22 (names/dates), b30 (quotes).
"""
import json, os, re, sys
from difflib import SequenceMatcher

AUD = "/home/z/my-project/shootout-clone/work/render-engine-shootout/wow-signal/shared/audio"
SPOT = ["b01", "b09", "b22", "b30"]

NUMWORDS = {"0":"zero","1":"one","2":"two","3":"three","4":"four","5":"five",
            "6":"six","7":"seven","8":"eight","9":"nine","1420":"fourteen twenty",
            "1977":"nineteen seventy seven","2022":"twenty twenty two",
            "2025":"twenty twenty five","2024":"twenty twenty four",
            "1995":"nineteen ninety five","1996":"nineteen ninety six",
            "1999":"nineteen ninety nine","1987":"nineteen eighty seven",
            "1989":"nineteen eighty nine","50":"fifty","10":"ten","30":"thirty"}

def norm(text):
    t = text.lower()
    t = re.sub(r"[-—–_/]", " ", t)
    t = t.replace("!", "").replace(".", "").replace(",", "").replace("?", "")
    t = t.replace(":", "").replace(";", "").replace("(", " ").replace(")", " ")
    t = t.replace("'", "")
    toks = []
    for w in t.split():
        if w in NUMWORDS:
            toks.extend(NUMWORDS[w].split())
        elif w.isdigit():
            toks.extend(NUMWORDS.get(ch, ch) for ch in w)
        else:
            toks.append(w)
    return toks

def coverage(ref_toks, asr_toks):
    """Multiset word coverage: fraction of ref words heard (order-free)."""
    from collections import Counter
    a, b = Counter(asr_toks), Counter(ref_toks)
    hit = sum(min(a[k], b[k]) for k in b)
    return hit / max(1, sum(b.values()))

def pcm16k(path):
    """Decode any audio to 16 kHz mono float32 via ffmpeg (bypasses PyAV)."""
    import numpy as np, subprocess
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", path,
                          "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

def main():
    from faster_whisper import WhisperModel
    blocks = json.load(open(os.path.join(AUD, "blocks.json")))
    model = WhisperModel("base.en", device="cpu", compute_type="int8")
    worst_cov = 1.0
    for bid in SPOT:
        segs, _ = model.transcribe(pcm16k(os.path.join(AUD, "blocks", f"{bid}.wav")),
                                   language="en", beam_size=1)
        text = " ".join(s.text for s in segs).strip()
        ref = blocks[bid]
        rt, at = norm(ref), norm(text)
        cov = coverage(rt, at)
        ratio = SequenceMatcher(None, " ".join(rt), " ".join(at)).ratio()
        worst_cov = min(worst_cov, cov)
        print(f"{bid}: coverage={cov:.2f} (norm-seq={ratio:.2f})")
        print(f"  ASR: {text[:110]}")
        if cov < 0.75:
            print(f"  FAIL (<0.75 coverage)")
    print("ASR QC:", "PASS" if worst_cov >= 0.75 else "FAIL",
          f"(worst coverage {worst_cov:.2f})")
    sys.exit(0 if worst_cov >= 0.75 else 1)

if __name__ == "__main__":
    main()
