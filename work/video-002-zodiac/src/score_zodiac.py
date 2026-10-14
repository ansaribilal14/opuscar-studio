#!/usr/bin/env python3
"""score_zodiac.py — composed, act-cue documentary score for video-002 (ISSUE #7).

Operator complaint: "the music and tone used is too soft — prefer more dramatic
volumetric background sound and effects which still compliments the voiceover."

System ported from ansaribilal14/last-stop-yt-engine (pipeline/music/score_build.py)
onto the lemo-opuscar CC sampler (core/audio/sampler.py — MIT, CC0/CC-BY samples):
  * per-act cues {t0,t1,preset,intensity,root,minor} written from the BLOCK TIMELINE
    (not a fixed grid) — the score follows the story section by section
  * presets: dark / tension / overture / dawn / resolve (+ transients)
  * real sampled instruments: VSCO2-CE strings/horn/timpani (CC-BY), VCSL idiophones
    (CC0), Salamander piano (CC-BY 3.0) — credits emitted via sampler registry
  * volumetric chain: convolution room reverb (size per preset), narration-aware
    ducking envelope (speech dips the bed, swells breathe in the gaps), soft-knee
    lookahead limiter, HPF 32Hz — rendered 48k stereo float32 -> build/music.wav

Inputs : build/timeline.json (written by build_assets.sh / timeline export)
Output : build/music.wav, build/score_credits.txt
"""
import json, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, "/home/z/my-project/lemo-opuscar/core/audio")
sys.path.insert(0, HERE)
import sampler as S
from sfx import SR, limit, hp, norm

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")
os.makedirs(BUILD, exist_ok=True)

XFADE = 2.0   # cue crossfade seconds
TAIL = 4.0    # instrument release room

# ---- preset progressions (roman numerals: semitone offset, quality) ----
PROGS = {
    "overture": [(0, "m"), (8, "M"), (3, "M"), (10, "M")],
    "tension":  [(0, "m"), (0, "m"), (8, "M"), (7, "m")],
    "dark":     [(0, "m"), (7, "m"), (8, "M"), (5, "m")],
    "dawn":     [(0, "M"), (9, "m"), (5, "M"), (7, "M")],
    "resolve":  [(0, "M"), (5, "M"), (0, "M"), (7, "M")],
}

def chord_notes(root_midi, semi, quality):
    third = 4 if quality == "M" else 3
    return [root_midi + semi, root_midi + semi + third, root_midi + semi + 7]

def events_for_cue(cue, t_off, dur):
    """Event list for one cue. Bars of ~8s; voices per preset; intensity scales density/velocity."""
    p = cue["preset"]; inten = float(cue.get("intensity", 0.5))
    minor = bool(cue.get("minor", p in ("overture", "tension", "dark")))
    root = S.midi(cue.get("root", "D2" if minor else "C3"))
    prog = PROGS.get(p, PROGS["tension"] if minor else PROGS["resolve"])
    ev, t, bar = [], 0.0, 8.0
    ci = 0
    while t < dur:
        d = min(bar, dur - t)
        semi, q = prog[ci % len(prog)]
        tri = chord_notes(root, semi, q)
        pad = [tri[0] - 12, tri[0], tri[1], tri[2]]
        rnd = np.random.default_rng(int((t_off + t) * 7 + ci * 13 + len(p)))
        # --- string pad (always) — split by register across the stereo field ---
        for j, n in enumerate(pad):
            ev.append(dict(t=t_off + t, inst="violins" if n >= root + 7 else ("violas" if n >= root else "cellos"),
                           pitch=float(n), dur=d + 1.5, vel=0.26 + 0.20 * inten,
                           pan=(-.4 + .8 * j / max(1, len(pad) - 1)),
                           attack=(1.0 - 0.45 * inten) + 0.3 * rnd.random()))
        # --- low strings / bass ---
        ev.append(dict(t=t_off + t, inst="contrabass",
                       pitch=float(tri[0] - 24 if tri[0] - 24 >= 26 else tri[0] - 12),
                       dur=d + 1.0, vel=0.30 + 0.22 * inten, pan=0.0,
                       attack=0.5 + 0.5 * rnd.random()))
        # --- tension/dark: breathing low cello + timpani heartbeat + occasional boom ---
        if p in ("tension", "dark"):
            ev.append(dict(t=t_off + t, inst="cellos", pitch=float(tri[0] - 12), dur=d * 0.9,
                           vel=0.34 + 0.22 * inten, pan=-.15, attack=d * 0.45))
            if p == "tension" and ci % 2 == 0:
                ev.append(dict(t=t_off + t + d * 0.5, inst="timpani",
                               pitch="D2" if ci % 4 == 0 else "G2",
                               vel=0.34 + 0.30 * inten, dur=2.0))
            if p == "dark" and ci % 3 == 0:
                ev.append(dict(t=t_off + t + d * 0.5, inst="gran_cassa", pitch=None,
                               vel=0.30 + 0.25 * inten, dur=2.0))
        # --- piano motif (dawn/resolve/overture and high-intensity dark) ---
        if p in ("overture", "dawn", "resolve") or (p == "dark" and inten > 0.52):
            mel = [tri[2] + 12, tri[1] + 12, tri[0] + 12, tri[1] + 12]
            for k, n in enumerate(mel[:3 if p != "resolve" else 2]):
                if rnd.random() < 0.82:
                    ev.append(dict(t=t_off + t + k * (d / 6.0), inst="piano", pitch=float(n),
                                   dur=1.2, vel=0.26 + 0.26 * inten, pan=0.18 * (1 if k % 2 else -1)))
        # --- mallet sparkle (dawn: glock, overture: vibes) ---
        if p in ("dawn", "overture") and ci % 2 == 1:
            inst = "glockenspiel" if p == "dawn" else "vibraphone"
            ev.append(dict(t=t_off + t + d * 0.5, inst=inst, pitch=float(tri[2] + 12),
                           dur=1.5, vel=0.18 + 0.14 * inten, pan=0.3))
        # --- horn swell at high intensity (climax pressure) ---
        if p in ("tension", "overture") and inten > 0.62 and ci % 4 == 3:
            ev.append(dict(t=t_off + t, inst="horn", pitch=float(tri[0] + 12),
                           dur=min(d, 6.0), vel=0.20 + 0.16 * inten, pan=0.0, attack=1.6))
        t += d; ci += 1
    return ev

def duck_envelope(tl_total, blocks, sr=SR):
    """Speech-aware bed envelope: -7.5 dB under narration, swells breathe in gaps."""
    n = int(round(tl_total * sr))
    env = np.ones(n, dtype=np.float32)
    for b in blocks:
        if not b.get("text"): continue
        i0 = int(max(0, (b["start"] - 0.30) * sr))
        i1 = int(min(n, (b["end"] + 0.35) * sr))
        if i1 > i0: env[i0:i1] = 10 ** (-7.5 / 20)
    # smooth ~350ms (250ms up, 450ms down approximated symmetric)
    k = int(0.35 * sr) | 1
    kern = np.hanning(k).astype(np.float32); kern /= kern.sum()
    env = np.convolve(env, kern, mode="same").astype(np.float32)
    # gap swells: +1.5 dB in section breaks (>=2.2s free) for that breathing lift
    free = env > 0.97
    env[free] *= 10 ** (1.5 / 20)
    env = np.convolve(env, kern, mode="same").astype(np.float32)
    return np.minimum(env, 1.2)

def main():
    tl = json.load(open(os.path.join(BUILD, "timeline.json")))
    total = tl["total"]; blocks = tl["blocks"]
    print(f"score: total {total:.1f}s, {len(blocks)} blocks")

    # ---- cue map: one cue per section (beat groups) + cold-open/outro ----
    sections = {}   # beat -> [start, end]
    for b in blocks:
        if b.get("text") or b["id"] in ("b0d", "b8d"):
            try: key = int(b["id"][1])
            except Exception: key = 0
            s0 = sections.get(key)
            if s0 is None: sections[key] = [b["start"], b["end"]]
            else:
                s0[0] = min(s0[0], b["start"]); s0[1] = max(s0[1], b["end"])
    keys = sorted(sections)
    # dramatic arc per beat (0..8) — dark open, tension attacks/letters, dawn at solves,
    # dark for the unsolved/limits, resolve close
    ARC = {
        0: ("dark", 0.56, "D2", True),
        1: ("tension", 0.70, "D2", True),   # attacks — driving, urgent
        2: ("tension", 0.62, "A1", True),   # letters/press
        3: ("dark", 0.50, "E2", True),      # 408 analysis; dawn hit inside is a block-level SFX
        4: ("tension", 0.60, "C2", True),   # 340 — 51 years
        5: ("dark", 0.52, "D2", True),      # unsolved limits
        6: ("tension", 0.58, "F2", True),   # suspects
        7: ("dark", 0.50, "A1", True),      # investigation limits
        8: ("resolve", 0.55, "C3", False),  # close — cadence
    }
    cues = []
    lead_end = blocks[0]["start"] if blocks else 3.2
    cues.append(dict(t0=0.0, t1=lead_end, preset="overture", intensity=0.42, root="D2", minor=True))
    for i, k in enumerate(keys):
        t0 = sections[k][0]; t1 = sections[k][1]
        preset, inten, root, minor = ARC.get(k, ("dark", 0.5, "D2", True))
        # dawn lift inside the two solve sections (b3b Harden / b4c 2020) via sub-cues
        if k == 3:
            hb = next((b for b in blocks if b["id"] == "b3b"), None)
            if hb: cues.append(dict(t0=t0, t1=hb["start"], preset="dark", intensity=0.50, root="E2", minor=True))
            if hb: cues.append(dict(t0=hb["start"], t1=t1, preset="dawn", intensity=0.56, root="G2", minor=False)); t0 = None
        if k == 4:
            sb = next((b for b in blocks if b["id"] == "b4c"), None)
            if sb: cues.append(dict(t0=t0, t1=sb["start"], preset="tension", intensity=0.62, root="C2", minor=True))
            if sb: cues.append(dict(t0=sb["start"], t1=t1, preset="dawn", intensity=0.60, root="A2", minor=False)); t0 = None
        if t0 is not None:
            cues.append(dict(t0=t0, t1=t1, preset=preset, intensity=inten, root=root, minor=minor))
    out_end = total
    cues.append(dict(t0=max(cues[-1]["t1"], lead_end), t1=out_end,
                     preset="resolve", intensity=0.5, root="C3", minor=False))

    # ---- render cues into one event stream ----
    events = []
    for c in cues:
        dur = c["t1"] - c["t0"]
        if dur <= 0.5: continue
        ev = events_for_cue(c, c["t0"], dur)
        events.extend(ev)
        print(f"  cue {c['t0']:7.1f}->{c['t1']:7.1f} {c['preset']:8s} I={c['intensity']:.2f} root={c['root']} ({len(ev)} ev)")

    print("rendering", len(events), "instrument events ...")
    S.seed(77)
    mix = S.render(events, dur=total + TAIL)          # (N,2) float32, auto-limited
    # volumetric: convolution room (bigger for dark/tension cues is approximated globally)
    mix = S.room(mix, size=0.5, mix=0.16)

    # ---- narration-aware ducking + swells ----
    n = int(round((total + TAIL) * SR))
    if mix.shape[0] < n:
        mix = np.pad(mix, ((0, n - mix.shape[0]), (0, 0)))
    mix = mix[:n]
    env = duck_envelope(n / SR, blocks)
    mix *= env[:mix.shape[0], None]

    # ---- master: HPF 32Hz, gentle glue, peak --- (bed sits ~-20 dB under VO in mix.py)
    mix = hp(mix.T, 32).T.astype(np.float32)
    mix = limit(mix, 0.88)
    mix *= 0.72
    out = os.path.join(BUILD, "music.wav")
    import soundfile as sf
    sf.write(out, mix, SR, subtype="FLOAT")
    print(f"build/music.wav written ({total:.1f}s + tail)")
    # credits
    try:
        cred = S.credits(["violins", "violas", "cellos", "contrabass", "horn", "timpani", "glockenspiel", "vibraphone", "tubular_bells", "gran_cassa", "piano"]) if hasattr(S, "credits") else ""
        open(os.path.join(BUILD, "score_credits.txt"), "w").write(str(cred))
    except Exception as e:
        print("credits skip:", e)

if __name__ == "__main__":
    main()
