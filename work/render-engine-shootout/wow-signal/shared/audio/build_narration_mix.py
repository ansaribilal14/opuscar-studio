#!/usr/bin/env python3
"""build_narration_mix.py — rebuild the frozen narration program deterministically.

The frozen AUDIO_MANIFEST.json gives each block's exact start/dur; blocks are
placed at their absolute offsets on a 600.000 s stereo 48 kHz canvas. No music,
no ducking: the v1 master that passed the audio gates was narration-only, and
the v2 brief freezes all audio ("audio stays frozen").

Output: shared/audio/narration_program.wav (pcm_s16le 48k stereo, exactly 600 s).
"""
import json
import subprocess
import sys
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.abspath(os.path.join(HERE, "..", ".."))   # film root (manifest paths are relative to it)
MAN = os.path.join(HERE, "AUDIO_MANIFEST.json")
OUT = os.path.join(HERE, "narration_program.wav")
DUR = 600.0


def main():
    man = json.load(open(MAN))
    blocks = man["blocks"]
    inputs, filters = [], []
    n = 0
    for bid in sorted(blocks):
        b = blocks[bid]
        inputs += ["-i", os.path.join(FILM, b["file"])]
        # resample 24k mono -> 48k stereo, pad/trim to exact frozen dur
        filters.append(
            f"[{n}:a]aresample=48000,pan=stereo|c0=c0|c1=c0,"
            f"apad=whole_dur={b['dur']:.3f},atrim=0:{b['dur']:.3f},"
            f"adelay={int(round(b['start']*1000))}|{int(round(b['start']*1000))}[s{n}]"
        )
        n += 1
    mix = "".join(f"[s{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0,"
    # one total-length lock + gain trim to the frozen -16.0 LUFS delivery target + peak safety
    filters.append(mix + f"volume=2.1dB,apad=whole_dur={DUR},atrim=0:{DUR:.3f},alimiter=limit=0.7:level=disabled:asc=1[aout]")
    cmd = ["ffmpeg", "-nostdin", "-y", *inputs,
           "-filter_complex", ";".join(filters), "-map", "[aout]",
           "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2", OUT]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-3000:]); sys.exit(1)
    # verify duration
    p = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", OUT], capture_output=True, text=True)
    dur = float(p.stdout.strip())
    print(f"narration_program.wav rebuilt: {dur:.3f}s (target {DUR})")
    assert abs(dur - DUR) < 0.05, "duration gate FAILED"


if __name__ == "__main__":
    main()
