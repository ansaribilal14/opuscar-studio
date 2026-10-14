#!/usr/bin/env python3
"""sfx_zodiac.py — procedural sound-effects layer for video-002 (ISSUE #7).

"more dramatic volumetric background sound and effects which still compliments
the voiceover" — SFX are aligned to BLOCK STARTS from build/timeline.json and
kept 14-20 dB under the narration bus (taste: texture, not fireworks).

Layer plan (all pure numpy via lemo-opuscar core/audio/sfx.py @48k):
  * section-cut whooshes  -> first block of each section (beat>0)
  * attack impacts        -> b1a..b1d (thump+rumble, sub-heavy, sober)
  * typewriter ticks      -> letter blocks b2a/b2b (clack/click clusters)
  * radio blip            -> b2b at "This is the Zodiac speaking" (~+6s)
  * reveal ding           -> the two cipher SOLVES (b3b, b4c)
  * heartbeat dread       -> b5a/b5b (the limits of the evidence)
  * riser rumble          -> into the b0d title card and the b8d end card

Output: build/sfx.wav (stereo float32 @48k, same length as film).
"""
import json, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, "/home/z/my-project/lemo-opuscar/core/audio")
from sfx import SR, add, limit, radio as fx_radio, compress

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")

def _stereo(d):
    return np.zeros((int(round(d * SR)), 2), dtype=np.float32)

def tick_cluster(buf, t0, n=4, base_gain=0.16):
    for k in range(n):
        g = base_gain * (1.0 - 0.13 * k)
        import sfx as X
        add(buf, X.click(0.9 + 0.18 * ((k * 37) % 5), 1.0), t0 + k * 0.21 + 0.02 * ((k * 13) % 3), g, (-0.25 if k % 2 else 0.25))

def main():
    tl = json.load(open(os.path.join(BUILD, "timeline.json")))
    total = tl["total"]; blocks = {b["id"]: b for b in tl["blocks"]}
    order = [b["id"] for b in tl["blocks"]]
    buf = _stereo(total + 1.0)

    def blk(bid):
        return blocks.get(bid)

    # ---- section-cut whooshes ----
    section_heads = ["b1a", "b2a", "b3a", "b4a", "b5a", "b6a", "b7a", "b8a"]
    for i, bid in enumerate(section_heads):
        b = blk(bid)
        if not b: continue
        import sfx as X
        w = X.whoosh(0.5 + 0.04 * (i % 3), 1.0)
        add(buf, w, b["start"] - 0.45, 0.30, -0.35 if i % 2 else 0.35)

    # ---- attack beats: sober sub impacts ----
    for k, bid in enumerate(["b1a", "b1b", "b1c", "b1d"]):
        b = blk(bid)
        if not b: continue
        import sfx as X
        add(buf, X.thump(1.0, 64 + 6 * (k % 3)), b["start"] + 0.05, 0.42, 0.0)
        add(buf, X.rumble(2.2, 1.0), b["start"] + 0.05, 0.10, -0.2 + 0.4 * (k % 2))

    # ---- letters: typewriter mechanics ----
    for bid in ["b2a", "b2b"]:
        b = blk(bid)
        if not b: continue
        tick_cluster(buf, b["start"] + 0.15, n=5, base_gain=0.13)

    # ---- b2b "This is the Zodiac speaking" — short radio blip at ~+6s ----
    b = blk("b2b")
    if b:
        import sfx as X
        burst = np.random.default_rng(7).standard_normal(int(0.5 * SR)).astype(np.float32)
        burst = fx_radio(burst.astype(np.float64)).astype(np.float32)
        burst = compress(burst, thr=.2, ratio=4.0)
        add(buf, burst, b["start"] + 5.8, 0.14, 0.0)

    # ---- cipher solves: quiet reveal ding ----
    for bid, g in [("b3b", 0.20), ("b4c", 0.22)]:
        b = blk(bid)
        if not b: continue
        import sfx as X
        add(buf, X.ding(1.0), b["start"] + 0.12, g, 0.15)

    # ---- limits of evidence: heartbeat dread ----
    for bid in ["b5a", "b5b"]:
        b = blk(bid)
        if not b: continue
        import sfx as X
        hb = X.heartbeat(1.0)
        for k in range(5):
            add(buf, hb, b["start"] + 1.0 + k * 1.05, 0.15, 0.0)

    # ---- risers into the two silent cards ----
    for bid, d, g in [("b0c", 2.2, 0.24), ("b8c", 2.6, 0.26)]:
        b = blk(bid)
        if not b: continue
        import sfx as X
        r = X.rumble(d, 1.0)
        # simple linear rise (mono — add() places it in the stereo field)
        r = r * np.linspace(0.25, 1.0, len(r), dtype=np.float32)
        add(buf, r, b["end"] - d + 0.4, g, 0.0)

    # ---- master: gentle glue, keep SFX far under VO ----
    buf = limit(buf, 0.5)
    buf *= 0.9
    out = os.path.join(BUILD, "sfx.wav")
    import soundfile as sf
    sf.write(out, buf[:int(total * SR)], SR, subtype="FLOAT")
    print(f"build/sfx.wav written ({total:.1f}s)")

if __name__ == "__main__":
    main()
