#!/usr/bin/env python3
"""v1.1.0 luma gate: sample frames across the master, flag near-black voids."""
import subprocess, sys
from PIL import Image
import io

MASTER = "/home/z/my-project/work/video-004-dyatlov-pass/build/dyatlov-pass-004.mp4"
DUR = 909.65
STEP = 5.0
flags = []
n = 0
t = 0.5
while t < DUR - 1:
    p = subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "error", "-ss", str(t), "-i", MASTER,
         "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
        capture_output=True)
    img = Image.open(io.BytesIO(p.stdout)).convert("L").resize((160, 90))
    px = list(img.getdata())
    mean = sum(px) / len(px)
    if mean < 10.0:
        flags.append((round(t, 1), round(mean, 1)))
    n += 1
    t += STEP
print(f"sampled {n} frames @ {STEP}s step")
print(f"near-black flags: {len(flags)}")
for f in flags[:20]:
    print("  FLAG", f)
sys.exit(1 if len(flags) > 6 else 0)  # small number of intentional dip-frames allowed
