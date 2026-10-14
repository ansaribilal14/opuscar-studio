#!/usr/bin/env python3
"""gen_tts_andrew.py — voice the narration with the operator-mandated house voice.

ISSUE #5 (task-main.md): "choose the voiceover which is chosen by
ansaribilal14/last-stop-yt-engine v1.0-blackpink"  →  VERIFIED in that repo:
  edge-tts, en-US-AndrewMultilingualNeural, rate "-3%"
  (projects/ahyeon/config.json "voice" + pipeline/tts_all.py VOICE/RATE)

Differences vs the old gen_tts_edge.py (Guy @ -18%):
  * free-run synthesis — no duration fitting (script was tightened; the
    timeline is rebuilt around the new durations)
  * captures WordBoundary events per block -> audio/words/<id>.words.json
    (used for SRT cue timing + SFX alignment, same contract as last-stop)

Output:
  audio/blocks/<id>.wav            pcm_s16le 24k mono (same as before)
  audio/words/<id>.words.json      [{"t":..,"d":..,"w":".."}]  (seconds)
  audio/timing.json                {id: {"dur": s, "text": ...}}

Resumable: skips blocks whose wav + words already exist (use --force to redo).
"""
import asyncio, json, os, shutil, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLK = os.path.join(ROOT, "audio/blocks")
WRD = os.path.join(ROOT, "audio/words")
TMP = os.path.join(ROOT, "audio/edge_tmp")
BAK = os.path.join(ROOT, "audio/blocks_guy")   # one-time backup of previous voice
VOICE = "en-US-AndrewMultilingualNeural"   # operator directive (issue #5)
RATE = "-3%"                               # last-stop-yt-engine house rate
SYNTH_TIMEOUT = 75                          # seconds — edge-tts can hang mid-stream

os.makedirs(BLK, exist_ok=True)
os.makedirs(WRD, exist_ok=True)
os.makedirs(TMP, exist_ok=True)

def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    return float(r.stdout.strip())

def trim_tail(path, pad=0.25):
    """strip trailing silence, keep pad — 24k mono pcm_s16le like the old blocks."""
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

def main():
    force = "--force" in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    narr = json.load(open(os.path.join(ROOT, "src/narration.json")))
    blocks = [b for b in narr["blocks"] if b["text"].strip()]
    if only:
        blocks = [b for b in blocks if b["id"] in only]
    timing_path = os.path.join(ROOT, "audio/timing.json")
    timing = json.load(open(timing_path)) if os.path.exists(timing_path) else {}
    fails = []
    for i, b in enumerate(blocks):
        wav = os.path.join(BLK, f"{b['id']}.wav")
        wj = os.path.join(WRD, f"{b['id']}.words.json")
        if (os.path.exists(wav) and os.path.exists(wj) and b["id"] in timing
                and not force and not only):
            continue
        mp3 = os.path.join(TMP, f"{b['id']}.tmp.mp3")
        os.makedirs(BAK, exist_ok=True)
        for f in os.listdir(BLK):
            if f.endswith(".wav") and not os.path.exists(os.path.join(BAK, f)):
                shutil.copy2(os.path.join(BLK, f), os.path.join(BAK, f))
        ok = False
        for attempt in range(4):
            try:
                if os.path.exists(mp3):
                    os.remove(mp3)
                words = asyncio.run(asyncio.wait_for(synth(b["text"], mp3), timeout=SYNTH_TIMEOUT))
                if os.path.exists(mp3) and os.path.getsize(mp3) > 1000:
                    out = trim_tail(mp3)
                    dur = probe(out)
                    shutil.copy2(out, wav)          # THE FIX: land it in audio/blocks/
                    os.remove(out)
                    json.dump(words, open(wj, "w"))
                    timing[b["id"]] = {"dur": round(dur, 3), "text": b["text"]}
                    print(f"[{i+1}/{len(blocks)}] {b['id']} {dur:.1f}s {len(words)}w", flush=True)
                    json.dump(timing, open(timing_path, "w"), indent=1)
                    ok = True
                    break
            except Exception as e:
                print(f"  {b['id']} attempt {attempt}: {e}", flush=True)
                time.sleep(2 * (attempt + 1))
        if not ok:
            fails.append(b["id"])
        if os.path.exists(mp3):
            os.remove(mp3)
        time.sleep(0.35)
    total = sum(v["dur"] for v in timing.values())
    print(f"DONE: {len(timing)} blocks, speech total {total:.1f}s, fails={fails}", flush=True)

if __name__ == "__main__":
    main()
