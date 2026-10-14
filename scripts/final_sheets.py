#!/usr/bin/env python3
"""final_sheets.py — editorial contact sheets from the ENCODED v4 master (directive §9).
Same sampling plan as qc_stills.mjs (hook dense / block in+mid / final minute),
but extracted from the encoded master so encoder output is what gets reviewed."""
import json, os, subprocess
from PIL import Image, ImageDraw

ROOT = "/home/z/my-project/work/video-002-zodiac"
OUT = f"{ROOT}/build/qc_final"
tl = json.load(open(f"{ROOT}/build/timeline.json"))
T = tl["total"]

shots = []
t = 0.0
while t <= 15:
    shots.append(round(t, 1)); t += 1.5
for b in tl["blocks"]:
    shots.append(round(b["start"] + 0.35, 2))
    shots.append(round(b["start"] + min(b["dur"] * 0.62, b["dur"] - 0.2), 2))
t = T - 60
while t < T - 1:
    shots.append(round(t, 1)); t += 12
shots = sorted(set(shots))

os.makedirs(f"{OUT}/frames", exist_ok=True)
files = []
for ts in shots:
    name = f"{int(ts * 10):06d}.jpg"
    p = f"{OUT}/frames/{name}"
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-ss", str(ts),
                    "-i", f"{ROOT}/build/zodiac-killer-002.mp4",
                    "-frames:v", "1", "-q:v", "3", p], check=True)
    files.append(name)

COLS, ROWS, TW, TH = 5, 3, 480, 270
per = COLS * ROWS
for s in range(0, len(files), per):
    chunk = files[s:s + per]
    sheet = Image.new("RGB", (COLS * TW, ROWS * (TH + 20)), "#000")
    d = ImageDraw.Draw(sheet)
    for i, name in enumerate(chunk):
        img = Image.open(f"{OUT}/frames/{name}").resize((TW, TH))
        cx, cy = (i % COLS) * TW, (i // COLS) * (TH + 20)
        sheet.paste(img, (cx, cy))
        d.text((cx + 6, cy + TH + 3), name.replace(".jpg", "") + "s", fill="#0f0")
    sheet.save(f"{OUT}/esheet_{s // per:02d}.jpg", quality=88)
print(f"{len(files)} frames -> {len(range(0, len(files), per))} editorial sheets")
