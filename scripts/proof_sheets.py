#!/usr/bin/env python3
"""proof_sheets.py — contact sheets from the ENCODED proof candidates (directive §9/§10).
One sheet per candidate: 12 sampled timestamps (hook-dense + scene boundary + mid)."""
import os, subprocess, sys
from PIL import Image, ImageDraw

ROOT = "/home/z/my-project/work/video-002-zodiac"
OUT = f"{ROOT}/build/proof"
TIMES = [0.5, 2.5, 5.0, 8.0, 11.0, 14.0, 18.0, 23.0, 33.0, 45.0, 58.0, 71.0]
COLS, ROWS = 4, 3
TW, TH = 480, 270  # tile size

def frames(mp4, tag):
    os.makedirs(f"{OUT}/frames_{tag}", exist_ok=True)
    for t in TIMES:
        f = f"{OUT}/frames_{tag}/t{t:05.1f}.jpg"
        subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-ss", str(t),
                        "-i", mp4, "-frames:v", "1", "-q:v", "3", f], check=True)

for tag in ["base", "A", "B", "C"]:
    frames(f"{OUT}/proof_{tag}.mp4", tag)
    sheet = Image.new("RGB", (COLS * TW, ROWS * (TH + 22)), "#000")
    d = ImageDraw.Draw(sheet)
    for i, t in enumerate(TIMES):
        img = Image.open(f"{OUT}/frames_{tag}/t{t:05.1f}.jpg").resize((TW, TH))
        cx, cy = (i % COLS) * TW, (i // COLS) * (TH + 22)
        sheet.paste(img, (cx, cy))
        d.text((cx + 6, cy + TH + 4), f"t={t:.1f}s", fill="#0f0")
    sheet.save(f"{OUT}/sheet_{tag}.jpg", quality=88)
    print(f"sheet_{tag}.jpg written ({len(TIMES)} frames)")
print("ALL SHEETS DONE")
