# VIDEO_ENGINE_INTEGRATION.md — what changed, how to use it, rollback (Phases 5–7)

## 1. What was implemented (and why — mapped to the operator's 5 complaints)

| Operator complaint | Fix | Files |
|---|---|---|
| "voiceover chosen is not good — use last-stop-yt-engine v1.0-blackpink" | House voice switched to **edge-tts `en-US-AndrewMultilingualNeural` @ rate −3 %** (verified in that repo: `projects/ahyeon/config.json`, `pipeline/tts_all.py`) + **WordBoundary capture** | `work/video-002-zodiac/src/gen_tts_andrew.py` (new), BRAIN.md Step 4 |
| "voiceover too detailed … watcher bored out" | Script tightened 2138 → **1706 words** (avg sentence 10.5), all E-claims preserved; delivery ~136 wpm effective; film 15:52 → **13:25** | `work/video-002-zodiac/src/narration.json` (v2) |
| "music too soft — dramatic volumetric sound + effects" | **Act-cue composed score** (13 cues following the 9-section arc; dark/tension/dawn/resolve presets; VSCO2-CE strings+timpani, VCSL idiophones, Salamander piano; convolution room; narration-ducked envelope with gap swells) + **procedural SFX layer** (section whooshes, attack impacts, typewriter ticks, radio blip, solve dings, heartbeat dread, risers) + 3-bus mixer | `src/score_zodiac.py`, `src/sfx_zodiac.py` (new), `src/mix_v3.py` (new), lemo-opuscar `core/audio/sampler.py`+`sfx.py` (MIT, CC0/CC-BY samples) |
| "backgrounds keep getting out of frame" | **Root cause fixed**: `photoPlate` pan fractions now HARD-CLAMPED to [0,1] (negative pans used to push the plate past the frame edge leaving background gaps). Gap impossible by construction | `src/film_look.mjs` (photoPlate) |
| "images too less; editing per scene too stale" | Photo pool 12 → **18** (all ledgered in `images/CREDITS.md`); **every photo gets a different seeded Ken Burns move** (10-move catalog, hashed per photo); **20 vector scenes now sit on photo-cut backdrops** (hard cut mid-block = 2 visuals per block) via ghost compositing; `photoCut`/`photoDuo` primitives | `src/film_look.mjs`, `src/scenes_z1.mjs` (base() ghost), `src/scenes_z3.mjs` (BACKS map), `images/` |

Plus the master-directive engineering items: **geneva provider PoC'd and documented**
(optional provider), **regression battery run**, **word-timed SRT** (179 cues, cues
start/end on spoken words — last-stop technique).

## 2. Configuration / installation

- **No new runtime dependencies in the production path.** Instrument sample packs
  (VCSL/VSCO2-CE/Salamander) download into `lemo-opuscar/core/audio/instruments/`
  via `sh tools/fetch.sh instruments <lib>` (one-time, ~890 MB, licenses bundled).
- Optional geneva provider: single binary in `refs/geneva-v1.5.0-x86_64-unknown-linux-gnu/`
  (MIT) — not imported anywhere; used only through the manual adapter procedure in
  VIDEO_ENGINE_ARCHITECTURE.md.
- edge-tts python package (already used since v2.2.0 of video-003): `pip3 install
  --break-system-packages edge-tts`.

## 3. How to run the upgraded pipeline (video-002 example)

```bash
cd work/video-002-zodiac
python3 src/gen_tts_andrew.py          # voice: Andrew −3 % + word boundaries (resumable)
node --input-type=module -e "import {buildTimeline} from './src/timeline.js'; …"   # export build/timeline.json
python3 src/score_zodiac.py            # act-cue score → build/music.wav
python3 src/sfx_zodiac.py              # SFX layer  → build/sfx.wav
python3 src/mix_v3.py                  # 3-bus mix  → build/mix.wav (−16 LUFS)
bash build_seg.sh $K 12                # segment K of 12 (integrity-gated) — repeat 2-parallel
bash build_finish.sh                   # concat → mux (temp-file) → verify → poster
python3 src/gen_subs.py                # word-timed SRT
```

**Switch back to the previous renderer/mixer** (full rollback):
- Old audio: `python3 src/music.py && python3 src/mix.py` (2-bus, verified working —
  regression run on 2026-10-14; restore `src/narration.json` from git history for the
  old script).
- Old voice: `audio/blocks_guy/` backup + `src/gen_tts_edge.py` (unchanged in git).
- Renderer: nothing to switch — engine v3 is an extension of engine v2 (`photoPlate`
  signature compatible; old opts still accepted).
- geneva: `rm -rf refs/geneva-poc refs/geneva-v1.5.0-*` (no other trace).

## 4. Tests and renders actually completed (Phase 6)

| Check | Result |
|---|---|
| Baseline smoke render (pre-change engine) | ✅ 37 frames, all scenes |
| Legacy mix.py path after changes | ✅ ran clean (fallback usable) |
| Andrew voice synth | ✅ 35/35 blocks, 0 fails, word boundaries captured |
| 12 production segments (2-parallel, crf20, 1080p24) | ✅ 12/12 VERIFIED (full-decode 0 errors, frame counts gated) |
| Final master | ✅ 805.22 s (13:25), 1920×1080p24, H.264+AAC 192k, faststart, **0 decode errors**, 494 MB |
| Loudness (final AAC) | ✅ −16.0 LUFS integrated |
| Luma void scan (403 samples) | ✅ 0 flags (min YAVG 30.1 vs v1's void signature ~5) |
| ASR spot-check (small.en, block-aligned windows) | ✅ PASS — seq ratio 0.97 both windows |
| Word-timed SRT | ✅ 179 cues; punctuation restored from script; spot-checked |
| geneva PoC export (directive scene, 1080p30) | ✅ 12 s, decodes clean, 43.6 s / 686 MB |
| Our-engine PoC export (same scene spec) | ✅ 12 s, 42.0 s / 581 MB |
| Frame QC stills from encoded master | ✅ 8 sampled across all 9 sections |

## 5. Resource requirements & limitations

- Render: ~42 s per 12 s-scene segment on 2 vCPU (no GPU); peak RSS 581 MB/worker.
- Sample packs: ~890 MB disk (instruments), one-time.
- geneva binary: 16.6 MB; RSS 686 MB on the PoC.
- Limitations: geneva cannot execute JS scene code (static HTML/CSS only); openfilm/
  hyperframes untested in this 3 GB-RAM sandbox; ASR windowing must stay block-aligned
  (window-edge artifact documented in Task 3-e and re-confirmed).

## 6. Blockers requiring operator decision

- None blocking production. For a future decision: adopting geneva/openfilm for
  *whole-film* rendering would require re-expressing ~30 procedural scenes as
  declarative timelines — recommended only if we move to GPU/cloud runners where
  browser-based providers become cheap.
