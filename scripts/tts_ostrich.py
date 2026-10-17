#!/usr/bin/env python3.13
"""tts_ostrich.py — house narrator (edge-tts en-US-GuyNeural, pitch -1Hz) for the ostrich plate.
Generates voices/<id>.wav + voices/dur.json from content.json (BRAIN.md Step 4 mandate)."""
import asyncio, json, os, sys
import edge_tts

WORK = "/home/z/my-project/work/ostrich-plate"
C = json.load(open(os.path.join(WORK, "content.json")))
OUT = os.path.join(WORK, "voices")
os.makedirs(OUT, exist_ok=True)
RATE = "-8%"

async def one(line):
    mp3 = os.path.join(OUT, f"_{line['id']}.mp3")
    tts = edge_tts.Communicate(line["text"], "en-US-GuyNeural", rate=RATE, pitch="-1Hz")
    await tts.save(mp3)
    return mp3

async def main():
    liness = C["voice"]["lines"]
    for l in liness:
        mp3 = await one(l)
        print("synth", l["id"], os.path.getsize(mp3))

asyncio.run(main())
