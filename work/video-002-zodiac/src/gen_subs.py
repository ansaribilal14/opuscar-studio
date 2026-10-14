#!/usr/bin/env python3
"""gen_subs.py v2 — word-timed .srt for video-002 (ISSUE #5 adoption).

Uses edge-tts WordBoundary data (audio/words/<id>.words.json, captured by
gen_tts_andrew.py — same contract as last-stop-yt-engine) so every cue starts
and ends exactly on the spoken words, then packs words into <=84-char cues
breaking on sentence punctuation. Falls back to block-level estimates only if
word data is missing.
"""
import json, os, re, subprocess

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
    t = max(0.0, t)
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def restore_punct(words, text):
    """edge-tts WordBoundary tokens carry no punctuation. Re-attach it by
    aligning the token sequence to the source narration text (case/punct-insensitive
    walk); unmatched tokens pass through as-is."""
    src = text.split()  # raw tokens WITH punctuation — that's what we restore
    norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
    out = []
    si = 0
    for wd in words:
        tok = wd["w"]
        nt = norm(tok)
        if si < len(src) and norm(src[si]) == nt:
            out.append({**wd, "w": src[si]})
            si += 1
        else:
            out.append(wd)
            # resync: consume source tokens until the next match
            while si < len(src) and norm(src[si]) != nt:
                si += 1
            if si < len(src):
                si += 1
    return out

def pack_cues(words, max_chars=84):
    """words: [{t,d,w}] absolute block-relative seconds -> cues [(t0,t1,text)].
    Pack words until char budget or sentence end (., !, ?, —)."""
    cues = []
    cur, cur_t0 = [], None
    def flush(i_end):
        nonlocal cur, cur_t0
        if not cur: return
        t1 = cur[-1]["t"] + max(cur[-1].get("d", 0.3), 0.3)
        cues.append((cur_t0, t1, " ".join(w["w"] for w in cur)))
        cur = []
    for w in words:
        if cur_t0 is None:
            cur_t0 = w["t"]
        cur.append(w)
        txt = " ".join(x["w"] for x in cur)
        endp = w["w"].rstrip().endswith((".", "!", "?", "—"))
        if len(txt) + 12 > max_chars or endp:
            flush(w)
            cur_t0 = None
    flush(None)
    return cues

out_srt = []
idx = 1
for b in blocks:
    if not b["text"] or not b["text"].strip():
        continue
    wj = os.path.join(ROOT, "audio/words", f"{b['id']}.words.json")
    cues = []
    if os.path.exists(wj):
        words = json.load(open(wj))
        if words:
            words = restore_punct(words, b["text"])
            cues = pack_cues(words)
    if not cues:
        # fallback: even split of block text
        est = b["dur"] - 0.55
        ws = b["text"].split()
        per = est / len(ws)
        cues = [(0.0, est, b["text"])]
    for (t0, t1, text) in cues:
        out_srt.append(f"{idx}\n{ts(b['start'] + t0)} --> {ts(b['start'] + t1 + 0.12)}\n{text}\n")
        idx += 1

open(os.path.join(ROOT, "build/zodiac-killer-002.srt"), "w").write("\n".join(out_srt))
print(f"build/zodiac-killer-002.srt written: {idx-1} word-timed cues")
