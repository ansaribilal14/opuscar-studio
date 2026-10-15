#!/usr/bin/env python3
"""mix_v3.py — 3-bus mix: score bed + SFX layer + narration -> -16 LUFS master. (ISSUE #7)

Places narration blocks at timeline starts (same contract as mix.py), adds the
procedural SFX layer as its own bus, masters the composite to house loudness.
Output: build/mix.wav (48k stereo). Old path (mix.py, 2-bus) remains as fallback.
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NODE_SCRIPT = """
import { buildTimeline } from '/home/z/my-project/work/video-004-dyatlov-pass/src/timeline.js';
console.log(JSON.stringify(buildTimeline()));
"""
out = subprocess.run(["node", "--input-type=module", "-e", NODE_SCRIPT],
                     cwd=ROOT, capture_output=True, text=True, timeout=60)
if not out.stdout.strip():
    raise RuntimeError("timeline failed: " + out.stderr[-300:])
TL = json.loads(out.stdout)
TOTAL = TL["total"]

blocks = [b for b in TL["blocks"] if b.get("text")]
music = os.path.join(ROOT, "build/music.wav")
sfx = os.path.join(ROOT, "build/sfx.wav")
for p in (music, sfx):
    if not os.path.exists(p):
        raise SystemExit(f"{p} missing — run score_zodiac.py / sfx_zodiac.py first")

cmd = ["ffmpeg", "-nostdin", "-y", "-i", music, "-i", sfx]
for b in blocks:
    cmd += ["-i", os.path.join(ROOT, "audio/blocks", f"{b['id']}.wav")]

fc = []
mixins = []
# music bus: trim, sit under VO (score already narration-ducked at render; extra -1.5 glue)
fc.append(f"[0:a]atrim=0:{TOTAL:.3f},volume=0.85[mus]")
# sfx bus
fc.append(f"[1:a]atrim=0:{TOTAL:.3f},volume=0.95[sfx]")
# narration bus
for i, b in enumerate(blocks, start=2):
    ms = int(round(b["start"] * 1000))
    fc.append(f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=1.0,adelay={ms}|{ms}[n{i}]")
    mixins.append(f"[n{i}]")
fc.append("".join(mixins) + f"amix=inputs={len(blocks)}:normalize=0:dropout_transition=0[nar]")
fc.append("[mus][sfx]amix=inputs=2:duration=first:normalize=0[amb]")
fc.append("[amb][nar]amix=inputs=2:duration=first:normalize=0[pre]")
fc.append("[pre]loudnorm=I=-16:TP=-1.5:LRA=13:print_format=summary[out]")

cmd += ["-filter_complex", ";".join(fc), "-map", "[out]",
        "-t", f"{TOTAL:.3f}", "-ar", "48000", "-ac", "2",
        "-c:a", "pcm_s16le", os.path.join(ROOT, "build/mix.wav")]
print("mix_v3:", len(blocks), "blocks + score + sfx, total", f"{TOTAL:.1f}s")
r = subprocess.run(cmd, capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr[-2500:]); sys.exit(1)
for line in r.stderr.splitlines():
    if "Input Integrated" in line or "input_i" in line:
        print(line.strip())
print("build/mix.wav written (3-bus)")
