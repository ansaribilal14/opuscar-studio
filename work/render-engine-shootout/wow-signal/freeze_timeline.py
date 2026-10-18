#!/usr/bin/env python3
"""freeze_timeline.py — build canonical TIMELINE.json + AUDIO_MANIFEST.json + SRT.

Gaps: 0.4 s intra-segment, 0.8 s at segment boundaries. Program length is exactly
600.0 s: the final scene holds to 600.0 (closing card + music tail).
Outputs (committed):
  TIMELINE.json          — scenes + narration blocks + caption refs (canonical)
  shared/audio/AUDIO_MANIFEST.json — per-block files, sha256, placements
  shared/subtitles/wow-signal.srt  — word-timed SRT from WordBoundary events
"""
import hashlib, json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
AUD = os.path.join(ROOT, "shared/audio")
SUB = os.path.join(ROOT, "shared/subtitles")
os.makedirs(SUB, exist_ok=True)

FPS = 30
PROGRAM = 600.0
SEGMENTS = {
    "b01": "S1","b02": "S1","b03": "S1",
    "b04": "S2","b05": "S2","b06": "S2","b07": "S2",
    "b08": "S3","b09": "S3","b10": "S3","b11": "S3","b12": "S3",
    "b13": "S4","b14": "S4","b15": "S4","b16": "S4",
    "b17": "S5","b18": "S5","b19": "S5","b20": "S5",
    "b21": "S6","b22": "S6","b23": "S6",
    "b24": "S7","b25": "S7","b26": "S7","b27": "S7",
    "b28": "S8","b29": "S8","b30": "S8",
    "b31": "S9","b32": "S9",
    "b33": "S10","b34": "S10",
}
SCENE_OF = {
    "b01":"SC01","b02":"SC02","b03":"SC03","b04":"SC04","b05":"SC05","b06":"SC06",
    "b07":"SC07","b08":"SC08","b09":"SC09","b10":"SC10","b11":"SC11","b12":"SC12",
    "b13":"SC13","b14":"SC14","b15":"SC15","b16":"SC16","b17":"SC17","b18":"SC18",
    "b19":"SC19","b20":"SC20","b21":"SC21","b22":"SC22","b23":"SC23","b24":"SC24",
    "b25":"SC25","b26":"SC26","b27":"SC27","b28":"SC28","b29":"SC29","b30":"SC30",
    "b31":"SC31","b32":"SC32","b33":"SC33","b34":"SC34",
}

def sha256(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for c in iter(lambda: f.read(1 << 16), b""):
            h.update(c)
    return h.hexdigest()

timing = json.load(open(os.path.join(AUD, "timing.json")))
blocks = json.load(open(os.path.join(AUD, "blocks.json")))

# --- narration placement -----------------------------------------------------
GAP_INTRA, GAP_SEG = 0.35, 0.7
placement, t = {}, 0.0
order = sorted(blocks)
prev_seg = None
for bid in order:
    seg = SEGMENTS[bid]
    if prev_seg is not None:
        t += GAP_SEG if seg != prev_seg else GAP_INTRA
    placement[bid] = {"start": round(t, 3), "dur": round(timing[bid]["dur"], 3)}
    placement[bid]["end"] = round(placement[bid]["start"] + placement[bid]["dur"], 3)
    t = placement[bid]["end"]
    prev_seg = seg
narr_end = t
print(f"narration ends at {narr_end:.2f}s; program {PROGRAM:.1f}s "
      f"(closing hold {PROGRAM-narr_end:.2f}s)")

# scene windows = min(start of first block of scene) .. max(end of last block) + small pad
scene_windows = {}
for bid in order:
    sc = SCENE_OF[bid]
    s, e = placement[bid]["start"], placement[bid]["end"]
    if sc in scene_windows:
        scene_windows[sc][0] = min(scene_windows[sc][0], s)
        scene_windows[sc][1] = max(scene_windows[sc][1], e)
    else:
        scene_windows[sc] = [s, e]
# smooth: extend each scene to the start of the next scene (continuous coverage)
scs = sorted(scene_windows)
for i, sc in enumerate(scs):
    scene_windows[sc][0] = 0.0 if i == 0 else round(scene_windows[scs[i-1]][1], 3)
    if i == len(scs) - 1:
        scene_windows[sc][1] = PROGRAM
# quantize to frames
for sc in scs:
    scene_windows[sc] = [round(scene_windows[sc][0] * FPS) / FPS,
                         round(scene_windows[sc][1] * FPS) / FPS]

timeline = {
    "id": "wow-signal",
    "title": "THE WOW! SIGNAL — 72 Seconds from Deep Space",
    "channel": "The Unclosed File",
    "version": "1.0.0-frozen",
    "render_spec": {
        "duration": PROGRAM, "fps": FPS, "width": 1920, "height": 1080,
        "container": "mp4", "video_codec": "h264", "pixel_format": "yuv420p",
        "audio_codec": "aac", "audio_channels": 2, "audio_sample_rate": 48000,
        "loudness_target_lufs": -16,
    },
    "narration_gaps": {"intra_segment": GAP_INTRA, "segment": GAP_SEG},
    "narration_end": round(narr_end, 3),
    "blocks": {bid: {**placement[bid],
                     "segment": SEGMENTS[bid], "scene": SCENE_OF[bid],
                     "text": blocks[bid]} for bid in order},
    "scenes": {sc: {"start": scene_windows[sc][0], "end": scene_windows[sc][1],
                    "storyboard": sc}
               for sc in scs},
    "assets": "ASSET_MANIFEST.json",
    "audio": "shared/audio/AUDIO_MANIFEST.json",
    "subtitles": "shared/subtitles/wow-signal.srt",
}
json.dump(timeline, open(os.path.join(ROOT, "TIMELINE.json"), "w"), indent=1)

# --- audio manifest -----------------------------------------------------------
manifest = {"voice": "en-US-AndrewMultilingualNeural", "rate": "-3%",
            "engine": "edge-tts", "format": "wav pcm_s16le 24k mono",
            "note": "per-block files; program mix resampled to 48k stereo at mux",
            "blocks": {}}
for bid in order:
    wav = os.path.join(AUD, "blocks", f"{bid}.wav")
    manifest["blocks"][bid] = {**placement[bid],
                               "file": f"shared/audio/blocks/{bid}.wav",
                               "sha256": sha256(wav)}
manifest["narration_total_seconds"] = round(sum(timing[b]["dur"] for b in order), 3)
json.dump(manifest, open(os.path.join(AUD, "AUDIO_MANIFEST.json"), "w"), indent=1)

# --- SRT (word-timed, cue per narration line of <= 42 chars, 2 lines max) -----
def fmt(t):
    ms = int(round(t * 1000))
    return f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}"

cues, idx = [], 1
for bid in order:
    words = json.load(open(os.path.join(AUD, "words", f"{bid}.words.json")))
    base = placement[bid]["start"]
    buf, start_t, end_t = [], None, None
    def flush():
        global idx
        if not buf:
            return
        text = " ".join(buf)
        if len(text) > 42:  # split into two balanced rows
            ws = text.split()
            best = 1
            for i in range(1, len(ws)):
                if len(" ".join(ws[:i])) <= len(text) / 2:
                    best = i
            text = " ".join(ws[:best]) + "\n" + " ".join(ws[best:])
        cues.append(f"{idx}\n{fmt(start_t)} --> {fmt(end_t)}\n{text}\n")
        idx += 1
    for w in words:
        ws, we = base + w["t"], base + w["t"] + w["d"]
        if buf and (len(buf) >= 11 or (end_t is not None and ws - end_t > 0.6)
                    or we - start_t > 4.8):
            flush()
            buf = []
        if not buf:
            start_t = ws
        buf.append(w["w"])
        end_t = we
    flush()
open(os.path.join(SUB, "wow-signal.srt"), "w").write("\n".join(cues))
print(f"SRT cues: {idx-1}")
print("TIMELINE.json + AUDIO_MANIFEST.json + SRT written")
