#!/usr/bin/env python3
"""gen_subs.py — build .srt from narration.json + durations.json (timeline-aligned)."""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NODE_SCRIPT = """
import { buildTimeline } from '/home/z/my-project/work/video-002-zodiac/src/timeline.js';
const tl = buildTimeline();
console.log(JSON.stringify(tl.blocks.map(b => ({ id: b.id, start: b.start, dur: b.dur, text: b.text }))));
"""
out = subprocess.run(["node", "--input-type=module", "-e", NODE_SCRIPT],
                     cwd=ROOT, capture_output=True, text=True, timeout=60)
blocks = json.loads(out.stdout)

def ts(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def split_cue(text, max_chars=84):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        if len(cur) + len(w) + 1 > max_chars and cur:
            lines.append(cur); cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur: lines.append(cur)
    return lines

out_srt = []
idx = 1
for b in blocks:
    if not b["text"]:
        continue
    lines = split_cue(b["text"])
    n = len(lines)
    dur = b["dur"] - 0.25  # keep inside block
    for i, ln in enumerate(lines):
        s = b["start"] + dur * i / n
        e = b["start"] + dur * (i + 1) / n - 0.08
        out_srt.append(f"{idx}\n{ts(s)} --> {ts(e)}\n{ln}\n")
        idx += 1

path = os.path.join(ROOT, "build", "isdal-woman-003.srt")
os.makedirs(os.path.dirname(path), exist_ok=True)
open(path, "w").write("\n".join(out_srt))
print(f"{path}: {idx-1} cues")
