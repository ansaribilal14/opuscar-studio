#!/usr/bin/env python3
"""mix.py — place narration blocks on the timeline over the score, master to -16 LUFS.
Output: build/mix.wav (48k stereo)."""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 1) timeline (source of truth for narration placement — MUST match render)
NODE_SCRIPT = """
import { buildTimeline } from '/home/z/my-project/work/video-002-zodiac/src/timeline.js';
console.log(JSON.stringify(buildTimeline()));
"""
out = subprocess.run(["node", "--input-type=module", "-e", NODE_SCRIPT],
                     cwd=ROOT, capture_output=True, text=True, timeout=60)
if not out.stdout.strip():
    raise RuntimeError("timeline failed: " + out.stderr[-300:])
TL = json.loads(out.stdout)
TOTAL = TL["total"]

# 2) build ffmpeg command: input0 music, inputs 1..N narration wavs delayed into place
blocks = [b for b in TL["blocks"] if b.get("text")]
music = os.path.join(ROOT, "build/music.wav")
if not os.path.exists(music):
    raise SystemExit("build/music.wav missing — run music.py first")

cmd = ["ffmpeg", "-nostdin", "-y", "-i", music]
for b in blocks:
    cmd += ["-i", os.path.join(ROOT, "audio/blocks", f"{b['id']}.wav")]

fc = []
# music bus: trim to TOTAL, level -20 dB under VO (score already ducked; extra -3 for glue)
fc.append(f"[0:a]atrim=0:{TOTAL:.3f},volume=0.85[mus]")
# narration bus
mixins = []
for i, b in enumerate(blocks, start=1):
    ms = int(round(b["start"] * 1000))
    fc.append(f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=1.0,adelay={ms}|{ms}[n{i}]")
    mixins.append(f"[n{i}]")
fc.append("".join(mixins) + f"amix=inputs={len(blocks)}:normalize=0:dropout_transition=0[nar]")
fc.append("[mus][nar]amix=inputs=2:duration=first:normalize=0[pre]")
fc.append("[pre]loudnorm=I=-16:TP=-1.5:LRA=13:print_format=summary[out]")

cmd += ["-filter_complex", ";".join(fc), "-map", "[out]",
        "-t", f"{TOTAL:.3f}", "-ar", "48000", "-ac", "2",
        "-c:a", "pcm_s16le", os.path.join(ROOT, "build/mix.wav")]
print("mixing", len(blocks), "narration blocks over score, total", f"{TOTAL:.1f}s")
r = subprocess.run(cmd, capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr[-2500:]); sys.exit(1)
# loudnorm second pass values could be parsed; single pass is acceptable here
for line in r.stderr.splitlines():
    if "Input Integrated" in line or "input_i" in line:
        print(line.strip())
print("build/mix.wav written")
