# Audit: 5 Reference Repos → Adoptable Techniques for Our AI Documentary Engine

**Task 2-b · research only · nothing modified, nothing installed.**
Context: true-crime style docs, 1080p, edge-tts narration, numpy/ffmpeg audio, node-canvas/Playwright rendering.
Host context (worklog.md, tasks 3-d/3-e/4): house narrator is edge-tts **en-US-GuyNeural, pitch −1Hz**, rate free-run (−18%…−29% auto-refit), loudnorm −16 LUFS, per-asset release push, git-HEAD render guard. Note: last-stop-yt-engine (same lineage) uses a different voice — see §1.1.

---

## 1. last-stop-yt-engine — DEEP DIVE

A complete agent-operated documentary pipeline (R1–R8 hardened rules): RESEARCH → SCRIPT → SOURCE (video-only) → CLIP HARVEST → EDITORIAL TIMELINE → TTS/MUSIC/RENDER/QC. Its own `docs/RESEARCH/notes_2b_ecosystem.md` already catalogs the broader ecosystem (edge-tts, faster-whisper, Openverse/Commons/Pexels API limits).

### 1.1 Voice handling (exact config)
- `pipeline/tts_all.py` (current engine):
  ```python
  VOICE = "en-US-AndrewMultilingualNeural"; RATE = "-3%"
  cm = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
  # stream chunks: type=="audio" → <beat>.mp3 ; type=="WordBoundary" →
  words.append({"t": chunk["offset"]/1e7, "d": chunk["duration"]/1e7, "w": chunk["text"]})
  ```
  Outputs per beat: `narration/<id>.mp3` + `<id>.words.json` + `timing.json` (`{id: {dur, text}}`), resumable (skips existing).
- Lexicon trick for name pronunciation — `pipeline/inherited/tts.py`:
  ```python
  LEX = s["lexicon"]
  def ttsify(text):
      for k, v in LEX.items():
          text = re.sub(rf"\b{re.escape(k)}\b", v, text)   # phonetic respelling, whole word only
  ```
  (e.g. Korean names → phonetic spellings; edge-tts CLI with `--write-subtitles` for native SRT.)
- `HARDENED_RULES.md` R3: voice/rate/lexicon fixed per project; native edge-tts SRT timestamps drive caption timing.
- WordBoundary data is used downstream for **word-timed ASS captions** (`assemble.py:beat_caption_events`).

### 1.2 Narration pacing
- `pipeline/script_beats.py`: the film is a `BEATS` list; **one text block = one narration paragraph = one TTS run = one beat**. Beat kinds: `clips` (montage pool) | `card` (typographic overlay). Act headers carry explicit budgets:
  `ACT 0 COLD OPEN ~95s/~230w · ACT 1 ~260s/~630w · ACT 2 ~270s/~655w · ACT 3 ~330s/~740w · ACT 4 ~300s/~700w · ACT 5 ~300s/~700w · ACT 6 ~330s/~760w · ACT 7 ~260s/~620w · ACT 8 CLOSE ~95s/~215w` → all ≈ **143–147 wpm**, target 34:00 = 2040 s exact.
- Runtime math — `pipeline/inherited/expand_script2.py:41`: `Est ≈ words/150 + nbeats*0.65/60 + 0.5` min **at 150 wpm + 0.65 s pause per beat + 0.5 s lead-in**.
- Expand scripts insert beats with `"pause_after": 0.6–0.8` (`inherited/expand_script.py`).
- Rhetorical devices throughout: cold open of hard facts, "Hold on to that number." callback lines, 2-word chapter-card narration ("Act One. The vacuum."), cliff-hanger beat endings.
- WPM numbers found in the whole audit: **145 (script_beats act budgets), 150 (planning estimate), 162 (MPT words/2.7 estimate)**, host worklog 150 wpm implied.

### 1.3 Timeline / clip cutting to beats (`pipeline/assemble.py`)
- `stage_plan()`: per beat `slot = voice_dur + 0.8` s (voice starts 0.8 s into segment → `voice_at = start+0.8`). Cards: `+target{"title":18,"chapter":16,"stat":12,"close":20}`, credits +50 s; empty-text interludes 30 s; clips beats +7 s breathing tail.
- **Clip cut length: `n = ceil(slot / 9.5)`** → ≈9.5 s per clip; pool from beat `vids` → widen to `tags` if <3 → primary_tag fallback; `random.Random(seed)` deterministic shuffle; no clip reused until pool exhausted.
- Frame-exact total: distribute remainder, `frames[-1] += FPS*round(TOTAL) - sum(frames)`.
- Transitions inventory: hard concat cuts between clips (30fps, `setsar=1`, lanczos scale, `trim` per-clip equal share); fade-in 1.2 s on film start, fade-out 2.0 s at end; cards fade 0.8/0.9 s; **Ken Burns** (`inherited/render.py:kb_filter`): 4 rotating modes `in/out/left/right` — zoompan z 1→1.10 (10%), lateral pan ±60 % of width, `eq=contrast=1.03:saturation=1.05`, fade-in 0.28 s, fade-out 2.6 s; mode assigned round-robin (`kb_i % 4`).
- Encode: libx264 veryfast CRF16 yuv420p + AAC 192k 48k stereo +faststart (R4: CRF ≤18, −14 LUFS).

### 1.4 Music system (`pipeline/music/`)
- **Contract** `render/cues.json`: `{"total":1800,"cues":[{"t0":0,"t1":95,"preset":"overture","intensity":0.55,"root":"D3","minor":true}, …]}` — one cue per act, built automatically from `config.json.acts` (`assemble.py:build_cues`, boundaries at beat starts; first cue from 0, last to TOTAL).
- **8 presets** (`score_build.py`): overture, trainee, tension, dark, dawn, triumph, warm, resolve. Each = a 4-chord roman-numeral loop (`PROGS`, semitone offsets+quality), 8 s bars, deterministic rng (`S.seed(1000+int(t0))`).
- **Voicing recipe**: string pad always (violins/violas/cellos split by register, pan −.35…+.35, slow attack 0.5–1.15 s scaled by intensity); contrabass root −12/−24; tension/dark add breathing cello swell + **timpani heartbeat every 2 bars** (D3/G3 alternate) + gran_cassa roll on bar 4; piano motif on even bars (85 % probability, vel .30+.30·inten); glockenspiel/vibraphone sparkle odd bars; triumph adds horn + tubular bells.
- **Loudness/mix chain**: per-cue `S.render(...)` → synthetic convolution reverb (`room`, size dark .62 / tension .55 / triumph .5 / else .45, mix .14) → equal-power 2.5 s crossfades at cue edges → full-film master: chunked **HP 32 Hz + lookahead limiter to 0.88** (30 s chunks, 1 s overlap, "3GB-RAM safe") → peak-scaled to **0.72** → `bed.wav` PCM16 48k stereo. `S.credits(...)` auto-writes `music_credits.txt` (CC-BY lines required, CC0 as thanks).
- **Sampler** (`sampler.py`, 671 lines, vendored from lemo-opuscar MIT): ~90-instrument registry over **6 sample libraries**; kinds `sus` (loop-extendable sustain) / `dec` (natural decay) / `hit` (unpitched, variants like snare on/off/roll, timpani 5 drums, sus_cymbal roll/cresc/bow); pitch parsed from filenames or measured with librosa yin and auto-retuned to equal temperament (±80 cents, confidence >.6); velocity layers + round-robin; soxr-HQ transposition with LRU caches; sustains extended by **phase-aligned grain crossfade loop** (`_extend`, per-grain RMS match 0.75–1.33); single-layer instruments darkened at low velocity (LP fc=18000·(vel/.8)^2.2); `chord(strum=)`, `render(events)` event lists `(t, inst, pitch, dur, vel, pan[, gain])`; `room()` decaying-noise IR reverb.
- **Sample sources + licenses** (`sampler.py` LIC table):
  | lib | source | license |
  |---|---|---|
  | vsco2ce | Versilian Studios VSCO Community Edition | **CC0 1.0** |
  | vcsl | Versilian Community Sample Library | **CC0 1.0** |
  | freepats | FreePats project (freepats.zenvoid.org) | **CC0 1.0** |
  | karoryfer | Karoryfer Samples / sfzinstruments | **CC0 1.0** |
  | salamander | Salamander Grand Piano V3 (Alexander Holm) | **CC BY 3.0 — attribution REQUIRED**, auto-emitted |
  | muldjord | MuldjordKit drums (Lars Muldjord, drumgizmo/FreePats) | **CC BY 4.0 — attribution REQUIRED** |
  Verified emitted example `projects/_musictest/render/music_credits.txt`.
- `pluck.py`: extended Karplus-Strong waveguide synth (guqin/pipa/shamisen/kalimba/music-box, bends/vibrato/sawari) — **needs numba**, skip for us.

### 1.5 SFX (`pipeline/music/sfx.py`) — inventory
All pure numpy/scipy, mono float32 @48k, seedable:
`click` (plastic block snap), `clack` (block on table), `crash` (18 staggered clacks + low noise), `whoosh` (swept band-pass noise), `creak` (AM saw), `thump` (pitch-dropping sine, f=70 default), `step`, `ding` (5-partial bell), `pop`, `quindar` (2525 Hz Beeps tone), `rumble` (brown noise LP), `ignite` (sub 45 Hz + burst), `roar` (filtered brown + crackle), `heartbeat` (thump 55 Hz + delayed thump 50 Hz +0.22 s). Processors: `radio()` (bp 380–2800 + tanh sat), `compress()` (envelope follower comp), `limit()` (5 ms lookahead), `add()` (equal-power pan into stereo buffer).
**Triggering:** SFX are NOT yet wired to narration in this repo — the score only uses sampler instruments (timpani/gran_cassa inside cues). The alignment mechanism that exists: cue/event lists with absolute times + `words.json` word timestamps (exact narration word times) — the natural hook for narration-aligned hits.

### 1.6 Act structure presets (`projects/ahyeon/config.json`)
`total 1800s, fps 30, voice {edge-tts, en-US-AndrewMultilingualNeural, -3%}`, acts 0–8:
`0 overture .55 D3 min · 1 trainee .42 C3 maj · 2 dawn .50 G3 maj · 3 tension .68 D3 min · 4 dawn .62 A3 maj · 5 triumph .80 C3 maj · 6 warm .75 F3 maj · 7 trainee .45 D3 maj · 8 resolve .60 C3 maj`
→ intensity curve **.55→.42→.50→.68→.62→.80→.75→.45→.60** (cold-open spike, quiet bio, rise, triumph, warm denouement, settle, resolve). blackpink project (34:00) uses same engine per `BRIEF.md`.

### 1.7 Audio mixing chain (ducking + loudnorm)
- Current engine (`assemble.py:stage_audio`): narration per beat → 48k mono wav → **HPF 85 Hz** (butter2) → peak-normalize **0.82** → placed at `voice_at`. Duck: `vad=|voice|>0.02` → **dilate 160 ms** (`maximum_filter1d`) → **smooth 250 ms** (`uniform_filter1d`) → `duck = 1 − 0.65·env` (**−9.1 dB**; "opuscar convention"). Mix `voice·0.92 + bed·(duck·0.5)`; chunked **lookahead limiter to 0.97** with 1 s context.
- Final: **two-pass LINEAR loudnorm I=−14, TP=−1.5, LRA=11** (measure → `loudnorm.json` → linear apply; explicitly "no dynamic pumping → no distortion").
- Legacy (`inherited/audio_assemble.py`): envelope = abs(voice) conv 250 ms; `bed_gain = 0.32·(1−0.78·env)` (**duck to ~22 %** under voice); bed tiled, fades 2.5 s/4 s.
- `inherited/normalize_audio.py`: fast numpy LUFS proxy (gated RMS −0.691), target −14 LUFS, ceiling −1.5 dBTP, tanh soft-knee.

### 1.8 QC asserts (`inherited/qc.py`, `qc_fast.py`)
Hard checks, exit 2 on FAIL, `qc_report.json`: duration ±45 s vs target · 1920×1080 · fps 30±0.1 · h264 · aac · size 100 MB–3 GB · loudness −14 LUFS (full ffmpeg loudnorm accept −18…−11; **fast path = 4×60 s windows at 8/35/62/90 % positions, sampled avg −18…−10**) · subject-clip policy flag ("REVIEW BEFORE MONETIZED PUBLISH"). R4 additionally asserts faststart atom.

### 1.9 Per-asset ledger patterns
- `inherited/source_media.py` → `media_manifest.json`: per asset `{asset_id, kind, query, source, title, origin_url, local_path, license, artist, credit, w, h}`; Wikimedia Commons `extmetadata.LicenseShortName`, **skips "fair use"**, min 900×600, cap 3/query; Openverse `license_type=commercial`; CC0 music from Openverse audio.
- `build_timeline.py`: **reuse any image ≤2×** (`used.get(key,0)<2`), falls back spare pool → all images; `metadata.json` description carries per-asset attribution lines + chapters.
- `mpt_bridge.py`: Pexels/Pixabay video (HD width nearest 1920, mp4), normalize crop 1920×1080 CRF20, ≤12 s, ≤2/query; records artist+origin even for no-attribution licenses; env-gated.
- `resolve_sources.py`: `ytsearch1:` with sanity gate → `subject_sources.json` (video_id/title/channel/duration per key) + R2 subject-sync assert (narration tags ∩ segment tags per second).

---

## 2. MoneyPrinterTurbo (MIT)

Short-form video factory: subject → LLM script → LLM search terms → stock/AI material → TTS → subtitles → ffmpeg composite.

- **Material pipeline** (`app/services/material.py`, 3043 lines): providers Pexels/Pixabay/Coverr + paid AI-gen (WaveSpeed, Volcengine Seedance, OFox, MuAPI, Metaso-MiniMax, OpenAI image) — paid sources switch to **on-demand per-segment generation so they stop when narration duration is covered**. `minimum_duration=max_clip_duration` on search; 24 h search cache; 512 MB download cap; aspect filter.
- **Ranking / ordering**: `_download_videos_by_script_order` — round-robin per search-term group ("round 1 takes candidate 1 of every keyword, round 2 candidate 2…") so early keywords don't hog the timeline; `_select_materials_until_duration` accumulates `min(max_clip_duration, dur)` until `> audio_duration`; URL dedupe.
- **Per-asset source ledger**: `_material_source_record` whitelist → `{provider, local_file, duration, search_term, asset_id, source_page, creator{name,profile_page}, rendition{w,h}}` persisted atomically into task `script_data.material_sources` (`_persist_material_sources`); strips query params/credentials from source URLs.
- **Pacing logic**: `video_clip_duration` default **5 s** (1–15); concat mode random/sequential; transition enum **none/fade_in/fade_out/slide_in/slide_out/zoom_in/zoom_out**; clip_speed. Duration estimator (`voice.py:580`): `words/2.7` (≈**162 wpm**) + CJK/4.2 + **0.35 s per sentence** (min 3 s). Script LLM prompt: "get straight to the point, don't start with 'welcome to this video'"; terms 1–3 words, 5 (or 8 when script-ordered), English only.
- **Pause tags**: `[pause: 2s]` parsed from scripts (`utils.parse_script_with_pauses`), clamped to 10 s, rendered as inserted silence between TTS segments, subtitle durations patched — i18n tag spellings supported.
- **Subtitles**: edge-tts timestamps or faster-whisper `large-v3` `word_level=True`; `split_string_by_punctuations` line grouping.
- Licenses: code MIT; Pexels/Pixabay/Coverr content licenses = commercial OK, attribution not required (recorded anyway).

---

## 3. open-generative-ai (MIT)

**What it is:** a Next.js + Electron **front-end studio** for MuAPI's *paid* generative-media APIs (600+ models: image/video/lip-sync), heavy affiliate/white-label marketing README; submodules are the author's other repos (Vibe-Workflow, Open-Poe-AI, Open-AI-Design-Agent). `project_knowledge.md` describes only the ImageStudio → muapi.js submit/poll flow. **No local pipeline: no ffmpeg/numpy/TTS code found** — everything calls the remote gateway.
**Adoptable:** effectively nothing for our engine (wrong layer entirely: API-gateway UI, not a doc pipeline). Only curiosity: `models_dump.json` as a model-capability registry pattern.

---

## 4. brag (code MIT © 2026; bundled SFX CC0; music license UNDOCUMENTED)

**What it is:** an agent **skill** (`skills/brag/SKILL.md` + references + assets + 1 script) that turns a project into a 15–25 s launch video via HeyGen Hyperframes; `/brag-slim` is the lean variant (this workspace's Skill list carries both). Not a doc pipeline, but the **best craft documentation** in the audit for pacing + SFX:

- **Creative laws:** hook decides in 2 s; 15–25 s total; "readable" = short label ~**0.8 s settled**, sentence ~**0.3 s per word (min 1.2 s)**; **"fast-in, then hold"** (never fast-in-then-gone); pattern `Hook 2-3s → Reveal 2-4s → 2-3 highlights 5-12s → punchline/outro 2-4s`; at least one scene shows the real product; hook planned first.
- **Tone presets with pacing specs** (7): default 4–5 scenes ×3–5 s; polished 3–4 ×4–6 s, crossfade 0.6–0.8 s; chaotic 6–8 scenes, some <2 s, never >4 s, hard/flash/zoom cuts; deadpan 3–4 ×4–7 s, crossfade 0.8–1.0 s; cinematic 4–5 ×3–5 s "short declarative sentences, each lands before the next"; scene-duration sums are *counted* (18–22 s sweet spot).
- **Sequential-text rule:** beat-grid reveals ≤0.5 s apart are fine for accents but too fast for readable lines — snap to every other beat, or reveal fast and hold the full set.
- **SFX library:** **~200 CC0 files (Kenney.nl)**: `interface/` (clicks, drops, bong, glitch, error, switches), `impact/` (soft/heavy thuds, **bells for cinematic reveals**, punches, wood, plate, metal, glass, mining), `casino/` (cards, chips, dice), `ui/` (clicks, 38 switches, rollovers), `keyboard/` (32 keypresses for per-character typing, randomized). `sfx-analysis.{md,json}` pre-flags high-frequency-risk picks.
- **Moment→sound heuristics** (table): reveal = impactSoft_medium / impactBell; success = bell or chips-collide; typed copy = randomized keypresses; interaction = click/switch; chaotic = punches+glitch+dice. **Tone→SFX energy**: polished 2–3 subtle; chaotic dense; cinematic 2–3 big bells; deadpan 1–2 dry.
- **Timing rules:** SFX at **start** of animation; entry pop **0.0–0.1 s before** first visible frame; transition sound at transition start; success ding when the stat is fully visible; staggered elements accent first/last/rhythmic only. Composition notation example: `"Tagline fades up at 0.8s → (no SFX, let the reveal carry)"`.
- **Music:** 5 bundled tracks (ende.app) **license not documented — do not redistribute**; precomputed per-track **cue presets** (`music-cues.json/md`); `analyze_music_cues.py` (librosa tempo + beat grid + **strong cues incl. 30–180 Hz bass energy**) works on any track; volume floors: music 0.30–0.40 (0.12–0.22 restrained), **never >0.5**; SFX 0.55–0.85. "One tasteful music bed + a few well-timed SFX beats silence."
- **Voice** (opt-in `--voice`): Kokoro; narration must complement visuals, not read on-screen text, and match scene pacing.
- Deliverables: mp4 + **best-frame poster picked (not arbitrary) and baked as frame 0** + `share-copy.txt`.

---

## 5. reelmimic (MIT)

**What it is:** local web app (Node 22 + React, port 4318) that orchestrates Claude Code/Codex agents to **clone the style of a reference video** into a new 2D-animated short (30–60 s; 7 engines incl. Hyperframes vector + painted watercolor). **Skill-locked**: `CLAUDE.md` mandates loading `/video-clone` SKILL.md first; a file-contract (`CONTRACT.md`) is the only agent↔app interface.

- **Measured reference breakdown** (`video-clone/scripts/analyze.py`): yt-dlp fetch → UI-crop/black-bar trim → **shot cut detection, average shot length in seconds AND beats** → **BPM + beat grid** (librosa beat_track + onset_strength), phase-inversion check, loudness normalization, densest-30 s windows → **per-shot camera motion via optical flow (push/pull/pan/tilt/rotate/static + fast/slow)** and per-shot look (brightness, contrast, dark-ratio, colourfulness, dominant colours) → `sheet_1fps.jpg`/`sheet_scenes.jpg` contact sheets that the agent must actually *Read* → `STYLE.md` + `peaks.json`.
- **Peak (goosebump) engineering:** find the 1–2 moments that make the reference work; design `build-up → held breath → hit ON the beat → freeze`; hero shots get special poses/impact frames/smear/particles/camera shake; 12 fps clip strips compared side-by-side vs reference; "if our peak loses to theirs, don't ship."
- **Editing-dynamism rules:** **"same scene + same camera position ≤ 40 % of runtime; change scene or angle between peaks; build-up segments must introduce something new every 1–1.5 s — never one composition sitting waiting for the hit; no dead static shots if the reference moves; emotion arc (want → obstacle → payoff)."** Clone targets quantified: card ratio, dark ratio, avg shot length within **±30 %** of reference; transitions inventory matched.
- **Motion doctrine** (`skills/motion-doctrine/SKILL.md`, vendored from hyperframes): **Vector law** — how A exits determines how B enters (same axis/direction/matched speed, cut mid-motion both sides; Z sign rule); one house "current" direction, other vectors reserved for meaning; **no idle wobble** (breathe/float loops banned — assign staged reveals / camera-with-intent / sequenced UI life / cursor-led action); **stillness-before-climax 0.3–0.75 s**; single entry ≤800 ms; exit ≈75 % of entry; stagger ≤500 ms; banned eases bounce/elastic; **transition budget: 2–3 inter-scene transitions per film, repeated**; machine-checked Seam Gate verifier (`seam-gate.mjs`).
- **Review-gate agent pattern:** per-stage **fresh reviewer agents** ("nobody grades their own work"), max 3 repair rounds, **fixes must attach before/after full-res crops** (`fixes.json`), `motion_check.py` gate (black frames, hard-cut-to-black ending, unintended stillness, missing audio), final "peak duel" scoring ≥4/5 using the reference as the ruler, explicit human-eye checklist per gate.
- **Per-asset ledger:** `fetch_assets.py` from Openverse (CC0/CC-BY), Pixabay, Freesound; **every asset logged in `assets/ASSETS.md` (source, author, license); unknown → flagged "license unconfirmed" to the user**.
- **Beat-based storyboards:** shots written in **beats** (`start_beat/end_beat`) + seconds; music section cut on bar lines with `loudnorm=I=-14:TP=-1.5, afade in 0.08 s / out 2 s`, `offset=0` → **swapping music only changes BPM/offset**.
- **Lyrics/VO alignment:** `align_lyrics.py` uses faster-whisper word timing **only as a measuring stick**; user text is authoritative; per-line match score with interpolation for poor matches.
- **Supply-chain pinning:** `skills-lock.json` — per-skill `{source repo, path, SHA-256}`.

---

## ADOPT FOR OUR ENGINE

Ranked, with integration notes (port = adapt code; vendor = copy assets/data; skip).

1. **Act-cue composed score (port `music/score_build.py` + `sampler.py`)** — the biggest single upgrade. Keep the exact contracts: `cues.json` per act `{t0,t1,preset,intensity,root,minor}`; 8 presets + PROGS; intensity→velocity/attack mapping; chunked HP32+lookahead-limiter master; peak 0.72; auto `music_credits.txt`. Vendor the **CC0 VSCO2-CE/VCSL/FreePats instrument sets** we need (violins/violas/cellos/contrabass/timpani/glock/vibes/tubular-bells/horn) and the CC-BY Salamander piano (attribution line auto-emitted — matches our CREDITS.md policy). Sampler is numpy/soxr/scipy only (librosa yin only for index build — precompute `index.json` once). Map true-crime acts: cold-open=`overture`, case=`tension`, evidence=`dark`, breakthrough=`dawn`, resolution=`resolve` — add a low-intensity `tension/dark` default.
2. **Ducking + loudness chain numbers (port `assemble.py:stage_audio` mechanics)** — HPF 85 Hz on voice, peak 0.82, dilate 160 ms / smooth 250 ms / −9.1 dB duck envelope (numpy max/uniform filters — trivially portable), bed ×0.5 under duck, lookahead limiter 0.97 with 1 s chunk overlap; final **two-pass LINEAR loudnorm** (keep our house −16 LUFS target, steal TP −1.5 / LRA 11 / `linear=true` to avoid pumping).
3. **WordBoundary capture + lexicon + word-timed captions (port `tts_all.py` + `beat_caption_events`)** — capture `{t,d,w}` per word alongside mp3 (offset/1e7 s); feed our scene scheduler so every visual/SFX can align to exact words; port the caption line-packer (≤38 chars, break on ≥0.55 s gaps, max 2 lines, ≤6 s, +0.12 s tail); add a project `lexicon` map with `\b`-safe respelling for tricky names (true-crime: victim/suspect/place names).
4. **Script pacing contract (adopt as authoring rules)** — acts budgeted in (~seconds, ~words) at **145–150 wpm**; one paragraph = one TTS run = one beat; `pause_after` 0.6–0.8 s; runtime estimator `words/150 + beats·0.65/60`; rhetorical devices: cold-open fact block, "Hold on to that number." callbacks, 2-word chapter cards. For shorts adopt brag's floors: hook 2–3 s, **0.3 s/word + 0.8 s settled minimum** on-screen text.
5. **SFX layer (port `sfx.py` wholesale + brag's alignment rules)** — all 14 generators + `radio/compress/limit/add` are dependency-free numpy; wire narration-aligned hits via words.json (e.g. `thump`/`heartbeat` under a body discovery, `quindar`/`click` for date/title cards, `whoosh` on transitions, `ding` when a stat card lands). Adopt brag timing: hit at cut start, entry pop 0.0–0.1 s early, ding at full visibility, "3–5 SFX per film, one coherent palette." Optionally vendor Kenney CC0 impact/interface pack for higher production value.
6. **QC battery (port `qc_fast.py` checks)** — duration/res/fps/codec/size asserts + **4×60 s sampled loudness windows** (cheap, no full decode) + license-policy check + exit-code discipline; add our existing full-decode/luma gates alongside.
7. **Per-asset image ledger (merge patterns)** — schema = last-stop `media_manifest.json` fields (+ MPT's whitelisted `source_page/creator` record) on our existing CREDITS.md flow: `asset_id, query, source, title, origin_url, local_path, license, artist, w, h`; **reuse cap ≤2×** per asset; skip fair-use; min-resolution filter; emission into end-card + description.
8. **Editing dynamism doctrine (adopt reelmimic motion-doctrine + video-clone rules into our scene engine)** — motion variety floor (same composition/camera ≤40 % of runtime; new information every 1–1.5 s), **stillness-before-climax 0.3–0.75 s**, cut-on-motion (exit/entry velocity match), ≤2–3 transition types per film repeated, entry ≤0.8 s, no idle wobble loops, hero-scene design for the 1–2 emotional peaks. Translate Ken Burns 4-mode rotation (last-stop) + brag tone-based scene counts into our Playwright/canvas motion presets.
9. **Beat-grid / music-cue analysis (vendor `brag/scripts/analyze_music_cues.py`)** — librosa tempo + beat grid + strong cues; lets us place act boundaries, title cards, and SFX on musical beats of our composed bed (we control the bed, so we can also emit cue times directly from score_build — prefer that; use the analyzer only for external tracks).
10. **Review-gate pattern (adopt reelmimic's process, not code)** — fresh-reviewer per stage, max 3 repair rounds, evidence (before/after stills) required for every "fixed", final peak-duel vs a quality ruler, `skills-lock.json`-style hash pinning for our vendored skill/asset packs.

**Skip:** open-generative-ai (API-gateway UI, nothing local); MPT paid AI-gen sources and its MoviePy path (we're ffmpeg-native); pluck.py (numba; ethnic instruments); MPT stock providers (Commons-only policy — but keep MPT's script-order round-robin + duration-covering selection in mind if stock video is ever allowed); brag bundled music (license undocumented).

**License ledger for everything we would vendor:**
VSCO2-CE / VCSL / FreePats / Karoryfer = CC0 1.0 · Salamander Grand Piano V3 = CC BY 3.0 (attribution) · MuldjordKit = CC BY 4.0 (attribution) · Kenney.nl SFX (brag) = CC0 · brag music = NO license documented (do not use) · last-stop-yt-engine / MoneyPrinterTurbo / brag / reelmimic / open-generative-ai code = MIT · reelmimic skills vendored from heygen-com/hyperframes (check per-skill LICENSE before copying motion-doctrine text).
