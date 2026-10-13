#!/usr/bin/env python3
"""mix_shorts.py — audio for each short: narration blocks + score bed, -14 LUFS (shorts).
usage: python3 mix_shorts.py A|B|C|D"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = sys.argv[1] if len(sys.argv) > 1 else "A"

NODE_SCRIPT = f"""
import {{ shortTimeline }} from '/home/z/my-project/work/video-003-isdal-woman/src/shorts.mjs';
console.log(JSON.stringify(shortTimeline('{KEY}')));
"""
out = subprocess.run(["node", "--input-type=module", "-e", NODE_SCRIPT],
                     cwd=ROOT, capture_output=True, text=True, timeout=60)
if not out.stdout.strip():
    raise RuntimeError("short timeline failed: " + out.stderr[-300:])
TL = json.loads(out.stdout)
TOTAL = TL["total"]

cmd = ["ffmpeg", "-nostdin", "-y", "-f", "lavfi",
       "-i", f"anullsrc=r=48000:cl=stereo:d={TOTAL:.3f}"]
for b in TL["blocks"]:
    cmd += ["-i", os.path.join(ROOT, "audio/blocks", f"{b['id']}.wav")]

fc = []
mixins = []
for i, b in enumerate(TL["blocks"], start=1):
    ms = int(round(b["start"] * 1000))
    fc.append(f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms}[n{i}]")
    mixins.append(f"[n{i}]")
# score bed: reuse film music segment starting at beat6-ish for tension, low level
music = os.path.join(ROOT, "build/music.wav")
# place music bed from 120s into the score (ambient region), level -23 dB
fc.append("[1:a]" if False else "")
# use last input as base? We appended anullsrc as input 0. Use it as base and mix narration + music:
# add music as an extra input at the end
cmd += ["-i", music]
mi = len(TL["blocks"]) + 1
fc.append(f"[{mi}:a]atrim=118:{118 + TOTAL:.3f},afade=t=in:d=2,afade=t=out:st={TOTAL - 3:.3f}:d=3,volume=0.10[bed]")
fc.append("[0:a][bed]amix=inputs=2:duration=first:normalize=0[base]")
fc.append("".join(mixins) + f"amix=inputs={len(TL['blocks'])}:normalize=0:dropout_transition=0[nar]")
fc.append("[base][nar]amix=inputs=2:duration=first:normalize=0[pre]")
fc.append("[pre]loudnorm=I=-14:TP=-1.5:LRA=13[out]")

outpath = os.path.join(ROOT, "build", f"short_{KEY}.wav")
cmd += ["-filter_complex", ";".join(fc).replace(";;", ";"), "-map", "[out]",
        "-t", f"{TOTAL:.3f}", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", outpath]
r = subprocess.run(cmd, capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr[-2000:]); sys.exit(1)
print(f"build/short_{KEY}.wav written ({TOTAL:.1f}s)")
