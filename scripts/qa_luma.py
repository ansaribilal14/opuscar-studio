#!/usr/bin/env python3
"""qa_luma.py — void detection for the rendered master.
Flags any 2s-sampled frame whose mean luma or highlight floor is too low
(the v1 failure mode). Also prints distribution stats."""
import subprocess, sys, os
from PIL import Image
import io

VID = sys.argv[1] if len(sys.argv) > 1 else "/home/z/my-project/work/video-003-isdal-woman/build/isdal-woman-003.mp4"
STEP = 2.0

# duration
dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",VID],
                           capture_output=True, text=True).stdout.strip())
t = 0.0
worst = []
n = 0
flags = 0
while t < dur - 0.5:
    r = subprocess.run(["ffmpeg","-nostdin","-ss",f"{t:.2f}","-i",VID,"-frames:v","1","-f","image2pipe","-vcodec","png","-"],
                       capture_output=True)
    im = Image.open(io.BytesIO(r.stdout)).convert("L")
    px = list(im.getdata())
    mean = sum(px)/len(px)
    p95 = sorted(px)[int(len(px)*0.95)]
    n += 1
    if mean < 16 or p95 < 40:
        flags += 1
        worst.append((t, mean, p95))
        print(f"VOID RISK t={t:7.1f}s mean={mean:5.1f} p95={p95:4d}")
    t += STEP
print(f"\nsampled {n} frames, {flags} flagged")
if worst:
    worst.sort(key=lambda x: x[1])
    print("worst 5:", [(round(w[0],1), round(w[1],1), w[2]) for w in worst[:5]])
sys.exit(1 if flags > 0 else 0)
