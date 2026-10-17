#!/usr/bin/env python3.13
"""conv_ostrich.py — mp3 -> 48k mono wav + dur.json for the engraving mix pipeline."""
import json, os, subprocess, wave
import numpy as np, soundfile as sf
import soxr

WORK = "/home/z/my-project/work/ostrich-plate"
OUT = os.path.join(WORK, "voices")
SR = 48000
C = json.load(open(os.path.join(WORK, "content.json")))
durs = {}
for l in C["voice"]["lines"]:
    mp3 = os.path.join(OUT, f"_{l['id']}.mp3")
    wav = os.path.join(OUT, f"{l['id']}.wav")
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-i", mp3,
                    "-ar", str(SR), "-ac", "1", wav],
                   check=True, stdin=subprocess.DEVNULL)
    y, sr = sf.read(wav)
    if sr != SR:
        y = soxr.resample(y, sr, SR)
        sf.write(wav, y, SR, subtype="FLOAT")
    durs[l["id"]] = round(len(y) / SR, 3)
    print(l["id"], durs[l["id"]], "s")
json.dump(durs, open(os.path.join(OUT, "dur.json"), "w"), indent=1)
print("dur.json written")
