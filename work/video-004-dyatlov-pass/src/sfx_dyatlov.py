#!/usr/bin/env python3
"""sfx_dyatlov.py — procedural SFX layer for video-004 (blizzard-forward, sober).

Aligned to BLOCK STARTS from build/timeline.json; kept well under the narration bus.
Layer plan (numpy via lemo-opuscar core/audio/sfx.py + custom cold-weather textures):
  * section-cut whooshes     -> b2a/b3a/b4a/b5a/b6a heads
  * cold-open sub impacts    -> b1a..b1d (thump+rumble, sober)
  * blizzard wind bed        -> swells under b1c, b2g, b3c, b4d, b6c (outdoor cold)
  * canvas-cut rips          -> b3b (the nine slashes, synced to tick rhythm)
  * slab "whumpf"            -> b5c (the release) — deep soft compression boom
  * heartbeat dread          -> b3g (force without a wound), b5c (release window)
  * radio static breath      -> b4d (testimony / search-radio era texture)
  * reveal ding              -> b5d (model matches the autopsies)
  * risers                   -> into b1e title card and b6f end card
Output: build/sfx.wav (stereo float32 @48k, film length).
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

def wind(d, seed=5, lo=140.0, hi=1100.0, lfo=0.13, gust=0.5):
    """Cold blizzard bed: band-filtered noise w/ slow gust LFO, decorrelated stereo."""
    n = int(round(d * SR))
    rng = np.random.default_rng(seed)
    x = rng.standard_normal((n, 2)).astype(np.float32)
    # FFT band-pass per channel
    freqs = np.fft.rfftfreq(n, 1 / SR)
    mask = ((freqs >= lo) & (freqs <= hi)).astype(np.float32)
    mask = np.convolve(mask, np.hanning(65) / np.hanning(65).sum(), mode="same")
    for c in range(2):
        X = np.fft.rfft(x[:, c])
        X *= mask
        x[:, c] = np.fft.irfft(X, n).astype(np.float32)
    # slow gust envelope (different phase per channel)
    t = np.arange(n) / SR
    for c in range(2):
        l = 0.55 + 0.45 * np.sin(2 * np.pi * lfo * t + c * 1.7 + seed) * np.sin(2 * np.pi * (lfo * 0.37) * t + c)
        x[:, c] *= (0.35 + 0.65 * l).astype(np.float32)
    x = x.astype(np.float32)  # gust LFO shapes dynamics; no per-sample compress (stereo)
    mono = x.mean(axis=1).astype(np.float32)
    m = np.max(np.abs(mono)) + 1e-9
    return mono / m * gust

def rip(d=0.30, seed=1):
    """Canvas tear: burst of crackly noise with fast decay."""
    n = int(round(d * SR))
    rng = np.random.default_rng(seed)
    x = rng.standard_normal(n).astype(np.float32)
    env = np.exp(-np.linspace(0, 7.5, n)).astype(np.float32)
    crackle = (rng.random(n) < 0.02).astype(np.float32)
    x = x * 0.4 + crackle * rng.standard_normal(n).astype(np.float32) * 1.6
    x *= env
    # tame highs
    k = 9
    kern = np.ones(k, dtype=np.float32) / k
    x = np.convolve(x, kern, mode="same").astype(np.float32)
    m = np.max(np.abs(x)) + 1e-9
    return x / m

def whumpf(d=1.6):
    """Slab settlement: deep soft boom, slow attack — pressure, not impact."""
    n = int(round(d * SR))
    t = np.arange(n) / SR
    f = 52 * np.exp(-t * 1.1) + 26
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) * np.exp(-t * 2.2)).astype(np.float32)
    noise = np.random.default_rng(9).standard_normal(n).astype(np.float32)
    k = 65; kern = np.ones(k, dtype=np.float32) / k
    noise = np.convolve(noise, kern, mode="same") * np.exp(-t * 3.0)
    x = x * 0.85 + noise.astype(np.float32) * 0.5
    x[: int(0.06 * SR)] *= np.linspace(0, 1, int(0.06 * SR), dtype=np.float32)
    m = np.max(np.abs(x)) + 1e-9
    return x / m

def main():
    tl = json.load(open(os.path.join(BUILD, "timeline.json")))
    total = tl["total"]; blocks = {b["id"]: b for b in tl["blocks"]}
    buf = _stereo(total + 1.0)

    def blk(bid):
        return blocks.get(bid)

    # ---- section-cut whooshes ----
    section_heads = ["b2a", "b3a", "b4a", "b5a", "b6a"]
    for i, bid in enumerate(section_heads):
        b = blk(bid)
        if not b: continue
        import sfx as X
        w = X.whoosh(0.5 + 0.04 * (i % 3), 1.0)
        add(buf, w, b["start"] - 0.45, 0.28, -0.35 if i % 2 else 0.35)

    # ---- cold-open sub impacts ----
    for k, bid in enumerate(["b1a", "b1b", "b1c", "b1d"]):
        b = blk(bid)
        if not b: continue
        import sfx as X
        add(buf, X.thump(1.0, 60 + 6 * (k % 3)), b["start"] + 0.05, 0.40, 0.0)
        add(buf, X.rumble(2.2, 1.0), b["start"] + 0.05, 0.09, -0.2 + 0.4 * (k % 2))

    # ---- blizzard wind swells (outdoor cold scenes) ----
    for k, (bid, d, g) in enumerate([("b1c", 12.0, 0.30), ("b2g", 10.0, 0.30), ("b3c", 11.0, 0.24),
                                     ("b4d", 12.0, 0.22), ("b6c", 12.0, 0.26)]):
        b = blk(bid)
        if not b: continue
        w = wind(min(d, b["dur"] + 3), seed=11 + k * 7, gust=g)
        add(buf, w, b["start"] - 1.0, 1.0, 0.0)

    # ---- canvas-cut rips synced to b3b's nine slashes ----
    b = blk("b3b")
    if b:
        for i in range(9):
            add(buf, rip(0.26 + 0.04 * (i % 3), seed=21 + i), b["start"] + 0.95 + i * 0.22, 0.16, (-0.2 if i % 2 else 0.2))

    # ---- slab whumpf + heartbeat dread ----
    b = blk("b5c")
    if b:
        add(buf, whumpf(2.0), b["start"] + 2.7, 0.34, 0.0)
        import sfx as X
        hb = X.heartbeat(1.0)
        for k in range(4):
            add(buf, hb, b["start"] + 4.4 + k * 1.15, 0.13, 0.0)
    b = blk("b3g")
    if b:
        import sfx as X
        hb = X.heartbeat(1.0)
        for k in range(5):
            add(buf, hb, b["start"] + 1.2 + k * 1.05, 0.14, 0.0)

    # ---- radio static breath on b4d (+6s) ----
    b = blk("b4d")
    if b:
        burst = np.random.default_rng(7).standard_normal(int(0.45 * SR)).astype(np.float32)
        burst = fx_radio(burst.astype(np.float64)).astype(np.float32)
        burst = compress(burst, thr=.2, ratio=4.0)
        add(buf, burst, b["start"] + 6.0, 0.10, 0.0)

    # ---- reveal ding: the match (b5d) ----
    b = blk("b5d")
    if b:
        import sfx as X
        add(buf, X.ding(1.0), b["start"] + 0.30, 0.18, 0.15)

    # ---- risers into the two silent cards ----
    for bid, d, g in [("b1d", 2.0, 0.22), ("b6e", 2.6, 0.24)]:
        b = blk(bid)
        if not b: continue
        import sfx as X
        r = X.rumble(d, 1.0)
        r = r * np.linspace(0.25, 1.0, len(r), dtype=np.float32)
        add(buf, r, b["end"] - d + 0.4, g, 0.0)

    buf = limit(buf, 0.5)
    buf *= 0.9
    out = os.path.join(BUILD, "sfx.wav")
    import soundfile as sf
    sf.write(out, buf[:int(total * SR)], SR, subtype="FLOAT")
    print(f"build/sfx.wav written ({total:.1f}s)")

if __name__ == "__main__":
    main()
