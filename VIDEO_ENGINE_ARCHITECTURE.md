# VIDEO_ENGINE_ARCHITECTURE.md — provider interface, adapters, fallback (Phase 4)

## Principle

The scene planner (research → script → narration.json → timeline.js) is and stays
**engine-agnostic**. Rendering is a provider behind a stable interface. FFmpeg remains
the encode/mix substrate everywhere.

## Provider interface (informal contract)

```
provider.render(frames [first..last], sceneSpec, assets, out.mp4) -> verified segment
```

Any provider must: (1) be deterministic for a given frame index, (2) produce an
H.264 segment whose frame count and duration match the timeline slice, (3) pass the
integrity gate (full-decode, 0 errors), (4) be optional — removing it changes nothing
upstream.

## Providers

### 1. `canvas` (DEFAULT — engine v3, production path)
- `src/render_encode.mjs`: node-canvas, deterministic `renderFrame(ctx, W, H, tl, t)`
  (scenes_z*.mjs), frames streamed JPEG q93 into ffmpeg stdin → H.264. No PNG
  intermediates (disk-safe). Integrity-gated per segment (`build_seg.sh`).
- Used by every delivered film (ostrich, isdal, zodiac v1/v2).

### 2. `geneva` (OPTIONAL — verified PoC)
- Adapter: **geneva provider** = timeline.json → geneva JSON edit
  (`refs/geneva-poc/timeline.json` is the worked example: layers = background plates
  with cover fit + hard cut/fade, HTML title/graphics, audio clip, SRT asset).
- Binary: single MIT-licensed 16.6 MB executable, zero runtime dependencies
  (`refs/geneva-v1.5.0-x86_64-unknown-linux-gnu/geneva`). Pre-flight:
  `geneva validate` (exact field-level errors). Segments: `geneva plan` + `render
  --frames` + `join` mirror our own segmented pipeline.
- Limits: no JS in HTML (static markup + CSS subset) → adapters must express motion
  as clip `animation`/`transform`/keyframes, or pre-render procedural art to images.
  Registered per-photo Ken Burns moves are therefore flattened to `animation` zoom/pan
  in the adapter.

### 3. `openfilm` (RESERVED — not installed)
- Same `frame(t)` contract as provider 1; adapter would be a thin browser host.
  Blocked in-sandbox by RAM (3 GB) + browser download. Documented in AUDIT/BENCHMARK.

## Data flow (production)

```
research/ → narration.json (script, beat, claims, visual)
        → gen_tts_andrew.py (edge-tts en-US-AndrewMultilingualNeural −3 %, WordBoundary)
             → audio/blocks/*.wav + audio/words/*.words.json + timing.json
        → timeline.js (deterministic block windows; durations.json)
        → score_zodiac.py (act cues → CC0/CC-BY sampled score, ducked)  → build/music.wav
        → sfx_zodiac.py  (procedural SFX aligned to block starts)       → build/sfx.wav
        → mix_v3.py      (score + sfx + narration → −16 LUFS)           → build/mix.wav
        → build_seg.sh × N (canvas provider, 2-parallel, integrity-gated)
        → build_finish.sh (concat → mux temp-file → verify → poster)
        → gen_subs.py v2 (word-timed SRT from words.json)
        → release (per-asset push policy)
```

## Fallback behavior

- If a non-default provider fails validation/render, the pipeline falls back to
  `canvas` for that segment (same frame range, same gate). No scene work is lost —
  the scene spec is provider-independent.
- The legacy 2-bus audio path (`music.py` + `mix.py`) is retained and regression-tested;
  `mix_v3.py` (3-bus: score + SFX + narration) is the new default mixer.

## Isolation & rollback

- geneva lives in `refs/` + one optional adapter; nothing in `src/` imports it.
- Rollback = delete the adapter + binary. The production path never depended on it.
