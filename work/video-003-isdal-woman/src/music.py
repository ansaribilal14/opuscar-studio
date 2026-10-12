#!/usr/bin/env python3
"""music.py — procedural score for video-003 (D minor, 60 BPM feel).
Generates build/music.wav (44.1k stereo float16) with envelope shaped by narration windows."""
import json, numpy as np, wave, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
tl = json.loads(json.dumps({}))  # placeholder
sys.path.insert(0, os.path.join(ROOT, "src"))

# read timeline via node subprocess (timeline.js is ESM)
import subprocess
NODE_SCRIPT = """
import { buildTimeline } from '/home/z/my-project/work/video-003-isdal-woman/src/timeline.js';
const tl = buildTimeline();
console.log(JSON.stringify(tl));
"""
out = subprocess.run(["node", "--input-type=module", "-e", NODE_SCRIPT],
                     cwd=ROOT, capture_output=True, text=True, timeout=60)
if not out.stdout.strip():
    raise RuntimeError('timeline node failed: ' + out.stderr[-400:])
TL = json.loads(out.stdout)
TOTAL = TL["total"] + 0.5
N = int(TOTAL * SR)
print(f"music: total {TOTAL:.1f}s")

t = np.arange(N, dtype=np.float32) / np.float32(SR)
rng = np.random.default_rng(42)

# ---------- fundamentals ----------
def note(f, dur, amp=1.0, attack=0.4, release=1.2):
    n = int(dur * SR)
    tt = (np.arange(n, dtype=np.float32) / np.float32(SR))
    env = np.minimum(1, tt / attack) * np.minimum(1, np.maximum(0, (dur - tt)) / release)
    # felt-piano-ish: sine + soft harmonics with independent decay
    sig = (np.sin(2 * np.pi * f * tt) * 1.0 +
           np.sin(2 * np.pi * f * 2 * tt) * 0.28 * np.exp(-tt * 1.6) +
           np.sin(2 * np.pi * f * 3.01 * tt) * 0.10 * np.exp(-tt * 2.4))
    return sig * env * amp

DT = np.float32
mixL = np.zeros(N, dtype=DT); mixR = np.zeros(N, dtype=DT)

def add(sig, start, pan=0.0):
    i0 = int(start * SR)
    i1 = min(N, i0 + len(sig))
    if i1 <= i0: return
    seg = sig[:i1 - i0]
    gl = np.sqrt(0.5 * (1 - pan)); gr = np.sqrt(0.5 * (1 + pan))
    mixL[i0:i1] += seg * gl
    mixR[i0:i1] += seg * gr

# ---------- drone: D2/A2/D3 with slow beating ----------
for f, amp, pan in [(73.42, 0.20, -0.2), (110.0, 0.14, 0.15), (146.83, 0.10, 0.0)]:
    det = f * 1.003
    tt = t
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * 0.05 * tt + f)
    add(np.sin(2 * np.pi * f * tt) * amp * lfo, 0, pan)
    add(np.sin(2 * np.pi * det * tt) * amp * 0.6 * lfo, 0, pan)

# ---------- D minor scale plucks, sparse, deterministic ----------
D3, F3, G3, A3, C4, D4, F4, A4 = 146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23, 440.0
scale = [D3, F3, G3, A3, C4, D4, F4, A4]
events = []
tt = 6.0
step = 0
while tt < TOTAL - 8:
    # density: more active in intro/theory, sparser mid
    beat = next((b for b in TL["blocks"] if b["start"] <= tt < b["end"]), None)
    dens = 7.0 if (beat and beat["beat"] in (0, 6, 8)) else 10.5
    step += 1
    idx = int(rng.integers(0, len(scale)))
    f = scale[idx]
    amp = 0.10 + 0.06 * float(rng.random())
    pan = float(rng.random()) * 1.2 - 0.6
    dur = 5.0
    add(note(f, dur, amp), tt, pan)
    if rng.random() < 0.22:  # occasional fifth
        add(note(f * 1.5, dur * 0.8, amp * 0.5), tt + 0.35, pan * 0.5)
    tt += dens * (0.6 + 0.8 * float(rng.random()))

# ---------- low pulse in theory beat (6) & verdict (5) ----------
for beat in TL["blocks"]:
    if beat["beat"] in (5, 6) and beat.get("text"):
        pass  # subtle: skip explicit pulses; drone LFO carries tension

# ---------- tape hiss bed ----------
hiss = (rng.normal(0, 1, N).astype(np.float32)) * np.float32(0.006)
# lowpass hiss a bit
hiss = np.convolve(hiss, np.ones(6) / 6, mode="same")
mixL += hiss; mixR += np.roll(hiss, 997)

# ---------- ducking envelope from narration windows ----------
duck = np.ones(N, dtype=np.float32)
for b in TL["blocks"]:
    if not b.get("text"): continue
    i0, i1 = int(b["start"] * SR), int((b["end"] + 0.3) * SR)
    duck[i0:i1] = np.minimum(duck[i0:i1], 0.52)
# smooth duck envelope (250 ms) — O(N) box filter via cumsum
k = int(0.25 * SR)
cs = np.cumsum(np.pad(duck, (1, k), mode="edge"), dtype=np.float64)
duck = ((cs[k:] - cs[:-k]) / k).astype(np.float32)[:N]
duck = np.clip(duck, 0, 1)
# global fade in/out
fade_in = int(3.0 * SR); fade_out = int(4.0 * SR)
duck[:fade_in] *= np.linspace(0, 1, fade_in)
duck[-fade_out:] *= np.linspace(1, 0, fade_out)

stereo = np.stack([mixL * duck, mixR * duck], axis=1)
print("assembling…", flush=True)
# gentle master shaping
stereo = stereo / (np.max(np.abs(stereo)) + 1e-9) * 0.72
pcm = (np.clip(stereo, -1, 1) * 32767).astype(np.int16)

os.makedirs(os.path.join(ROOT, "build"), exist_ok=True)
with wave.open(os.path.join(ROOT, "build/music.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"music.wav written: {TOTAL:.1f}s, {os.path.getsize(os.path.join(ROOT,'build/music.wav'))//1024} KB")
