#!/usr/bin/env python3
"""gen_tts.py — wow-signal narration, house voice (BRAIN.md Step 4).

Adapted from work/video-004-dyatlov-pass/src/gen_tts_andrew.py (same contract):
  voice en-US-AndrewMultilingualNeural, rate -3%
  per-block wav (24k mono pcm_s16le, trimmed+pad) + WordBoundary words json.
Resumable: skips blocks whose wav+words exist and whose text hash matches.
"""
import asyncio, hashlib, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE = "en-US-AndrewMultilingualNeural"
RATE = "-3%"
SYNTH_TIMEOUT = 75

BLK = os.path.join(ROOT, "blocks")
WRD = os.path.join(ROOT, "words")
TMP = os.path.join(ROOT, "edge_tmp")
for d in (BLK, WRD, TMP):
    os.makedirs(d, exist_ok=True)

def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    return float(r.stdout.strip())

def trim_tail(path, pad=0.25):
    out = path.replace(".tmp.mp3", ".wav")
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-i", path, "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB,"
                    f"areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                    f"apad=pad_dur={pad}",
                    "-ac", "1", "-ar", "24000", "-c:a", "pcm_s16le", out],
                   capture_output=True)
    return out

async def synth(text, mp3):
    import edge_tts
    words = []
    cm = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
    with open(mp3, "wb") as f:
        async for chunk in cm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({"t": chunk["offset"] / 1e7,
                              "d": chunk["duration"] / 1e7,
                              "w": chunk["text"]})
    return words

async def main(force=False):
    blocks = json.load(open(os.path.join(ROOT, "blocks.json")))
    timing = {}
    redo = []
    for bid, text in blocks.items():
        wav = os.path.join(BLK, f"{bid}.wav")
        wj = os.path.join(WRD, f"{bid}.words.json")
        h = hashlib.sha1(f"{VOICE}|{RATE}|{text}".encode()).hexdigest()[:10]
        hp = os.path.join(WRD, f"{bid}.hash")
        if (not force and os.path.exists(wav) and os.path.exists(wj)
                and os.path.exists(hp) and open(hp).read() == h):
            timing[bid] = {"dur": probe(wav), "text": text, "cached": True}
            continue
        redo.append((bid, text, wav, wj, h))
    print(f"{len(blocks)-len(redo)}/{len(blocks)} cached, {len(redo)} to synth")
    for i, (bid, text, wav, wj, h) in enumerate(redo):
        tmp = os.path.join(TMP, f"{bid}.tmp.mp3")
        try:
            words = await asyncio.wait_for(synth(text, tmp), SYNTH_TIMEOUT)
        except Exception as e:
            print(f"{bid}: SYNTH FAILED {type(e).__name__}: {e}", file=sys.stderr)
            continue
        trim_tail(tmp)
        os.replace(tmp + ".wav", wav) if os.path.exists(tmp + ".wav") else None
        # trim_tail writes to tmp path with .wav extension
        wav_tmp = tmp.replace(".tmp.mp3", ".wav")
        if os.path.exists(wav_tmp):
            os.replace(wav_tmp, wav)
        json.dump(words, open(wj, "w"))
        open(hp, "w").write(h)
        timing[bid] = {"dur": probe(wav), "text": text}
        print(f"{bid}: {timing[bid]['dur']:.2f}s ({len(text.split())} w)")
    json.dump(timing, open(os.path.join(ROOT, "timing.json"), "w"), indent=1)
    total = sum(v["dur"] for v in timing.values())
    words = sum(len(v["text"].split()) for v in timing.values())
    print(f"TOTAL: {total:.1f}s over {len(timing)} blocks, {words} words "
          f"-> {words/(total/60):.1f} wpm effective")

if __name__ == "__main__":
    asyncio.run(main(force="--force" in sys.argv))
