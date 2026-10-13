#!/usr/bin/env python3
"""revoice_edge.py — re-voice all narration blocks with edge-tts (house voice:
en-US-GuyNeural, pitch -1Hz), duration-fitted to the OLD durations.json targets
so timeline.js / mix.py placement / SRT stay byte-valid.

Per block:
  1. synth edge-tts at house rate (-8%), measure, refine rate up to 3x
  2. strip trailing silence (keep 0.25s pad)
  3. atempo residual (target <= +/-1%), then apad/atrim to EXACT old duration

Output: audio/blocks/<id>.wav (pcm_s16le 24k mono — same as originals).
Originals preserved in audio/blocks_tongtong/ (one-time backup).
Skips blocks already fitted (safe to re-run)."""
import asyncio, json, os, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLK = os.path.join(ROOT, "audio/blocks")
BAK = os.path.join(ROOT, "audio/blocks_tongtong")
TMP = os.path.join(ROOT, "audio/edge_tmp")
VOICE = "en-US-GuyNeural"
PITCH = "-1Hz"
HOUSE_RATE = -18
RATE_MIN, RATE_MAX = -35, 10
TOL = 0.10  # seconds — accept before residual atempo

os.makedirs(BAK, exist_ok=True)
os.makedirs(TMP, exist_ok=True)

narr = json.load(open(os.path.join(ROOT, "src/narration.json")))
try:
    durs = json.load(open(os.path.join(ROOT, "audio/durations.json")))
except Exception:
    durs = {}
spoken = [b for b in narr["blocks"] if b.get("text", "").strip()]

def probe(f):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", f], capture_output=True, text=True).stdout.strip()
    return float(out)

def ffmpeg(args):
    r = subprocess.run(["ffmpeg", "-nostdin", "-y"] + args, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError("ffmpeg: " + r.stderr[-400:])

async def synth(text, rate, out_mp3):
    import edge_tts
    for attempt in range(6):
        try:
            await edge_tts.Communicate(text=text, voice=VOICE, rate=f"{rate:+d}%",
                                       pitch=PITCH).save(out_mp3)
            if os.path.getsize(out_mp3) > 2000:
                return
        except Exception as e:
            if attempt == 5:
                raise
            await asyncio.sleep(3 + 3 * attempt)

async def one_block(b):
    bid = b["id"]
    free = bid not in durs  # new block: no target -> natural duration (house rate)
    target = durs[bid] if not free else None
    out_wav = os.path.join(BLK, f"{bid}.wav")
    if not free and os.path.exists(out_wav) and abs(probe(out_wav) - target) < 0.02:
        return (bid, target, probe(out_wav), None, None, "cached")
    text = b["text"]
    tmp_mp3 = os.path.join(TMP, f"{bid}.mp3")
    tmp_wav = os.path.join(TMP, f"{bid}.wav")
    rate = HOUSE_RATE
    d = None
    for attempt in range(4 if not free else 1):
        await synth(text, rate, tmp_mp3)
        # trailing-silence strip (keep 0.25s pad), downmix to 24k mono
        ffmpeg(["-i", tmp_mp3, "-af",
                "silenceremove=stop_periods=-1:stop_duration=0.25:stop_threshold=-45dB",
                "-ar", "24000", "-ac", "1", "-c:a", "pcm_s16le", tmp_wav])
        d = probe(tmp_wav)
        if free or abs(d - target) <= TOL:
            break
        rate += round((d / target - 1) * 100)
        rate = max(RATE_MIN, min(RATE_MAX, rate))
    if free:
        ffmpeg(["-i", tmp_wav, "-c:a", "pcm_s16le", out_wav])
        durs[bid] = d
        json.dump(durs, open(os.path.join(ROOT, "audio/durations.json"), "w"), indent=2)
        return (bid, d, d, rate, 1.0, "free-run (durations.json updated)")
    atempo = d / target
    warn = None
    if not (0.9 <= atempo <= 1.1):
        warn = f"atempo {atempo:.3f} outside 0.9-1.1"
    atempo = max(0.85, min(1.15, atempo))
    # residual atempo (skip if ~1.0) then exact pad/trim to target
    if abs(atempo - 1.0) > 0.002:
        mid = os.path.join(TMP, f"{bid}_t.wav")
        ffmpeg(["-i", tmp_wav, "-af", f"atempo={atempo:.5f}", "-c:a", "pcm_s16le", mid])
        tmp_wav = mid
    ffmpeg(["-i", tmp_wav, "-af", f"apad", "-t", f"{target:.6f}",
            "-ar", "24000", "-ac", "1", "-c:a", "pcm_s16le", out_wav])
    final = probe(out_wav)
    if abs(final - target) > 0.02:
        warn = (warn + "; " if warn else "") + f"FINAL OFF {final - target:+.3f}s"
    return (bid, target, final, rate, atempo, warn or "ok")

async def main():
    only = sys.argv[1:] if len(sys.argv) > 1 else None
    blocks = [b for b in spoken if not only or b["id"] in only]
    print(f"re-voicing {len(blocks)} blocks -> {VOICE} pitch {PITCH}, house rate {HOUSE_RATE:+d}%")
    results = []
    t0 = time.time()
    for b in blocks:  # sequential — edge-tts tolerates it, simplest failure model
        try:
            r = await one_block(b)
        except Exception as e:
            r = (b["id"], durs.get(b["id"], 0), None, None, None, f"ERROR {str(e)[:200]}")
        results.append(r)
        tgt, fin = r[1], r[2]
        delta = f"{fin - tgt:+.3f}s" if fin is not None else "n/a"
        print(f"  {r[0]:6s} target {tgt:7.3f}s  got {fin if fin else 0:7.3f}s  Δ {delta:8s} "
              f"rate {r[3]!s:>5} atempo {r[4] if r[4] is not None else '-'} -> {r[5]}", flush=True)
    bad = [r for r in results if r[2] is None or abs(r[2] - r[1]) > 0.02 or (r[5] and r[5].startswith("ERROR"))]
    print(f"\ndone in {time.time() - t0:.0f}s | {len(results) - len(bad)} fitted, {len(bad)} need attention")
    for r in bad:
        print("  ATTENTION:", r[0], r[5])
    return 1 if bad else 0

# one-time backup of tongtong originals (before any overwrite)
moved = 0
for b in spoken:
    src, dst = os.path.join(BLK, f"{b['id']}.wav"), os.path.join(BAK, f"{b['id']}.wav")
    if os.path.exists(src) and not os.path.exists(dst):
        os.rename(src, dst); moved += 1
print(f"backed up {moved} tongtong originals -> audio/blocks_tongtong/")

sys.exit(asyncio.run(main()))
