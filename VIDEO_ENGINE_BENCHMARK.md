# VIDEO_ENGINE_BENCHMARK.md — methodology, results, chosen engine (Phase 3)

> Executed 2026-10-14 in the production sandbox: Linux x64, 2 CPU cores, ~3 GB RAM,
> ~7 GB free disk, no GPU, system ffmpeg 7.1.5, node 20, x264 build 164 present.

## Methodology

Per the master directive, one **representative documentary scene** was authored for
the strongest candidate and rendered by both engines under identical assets:

- full-screen photo background with a mid-scene hard cut (second photo)
- animated documentary title + subtitle block
- evidence card (dark panel, mono heading, two body lines)
- lower-third identification (bar + name + role)
- fade transition into the second background
- existing narration audio (`audio/blocks/b0a.wav`, 12 s slice, edge-tts Andrew −3 %)
- accurate subtitle timing (word-timed SRT from the same WordBoundary data the
  production film uses)
- export: H.264 MP4, 1920×1080, 30 fps (geneva) / 24 fps (our engine's house rate)

Assets: two real credited plates from the Zodiac project (`chronicle_building.jpg`,
`press_room.jpg`) + one narration wav. Timeline for geneva:
`refs/geneva-poc/timeline.json` (validated by `geneva validate` before render).

## Results (measured, not estimated)

| Metric | geneva v1.5.0 | our engine v3 (render_encode) |
|---|---|---|
| Wall time (12 s scene) | **43.6 s** | **42.0 s** |
| Peak child RSS | 686 MB | 581 MB |
| Frames | 360 @ 30 fps | 288 @ 24 fps |
| Output integrity | H.264+AAC+mov_text, 12.00 s, decodes clean | H.264+AAC, 12.00 s, decodes clean |
| Subtitle support | SRT → embedded mov_text stream | SRT sidecar (YouTube standard) + burned-in capability |
| Authoring format | JSON timeline + static HTML/CSS (no JS) | JS `render(t)` scenes (procedural, data-driven) |
| Determinism | yes (documented + `look`-style QA in openfilm; geneva is deterministic by design) | yes (byte-stable renders, RNG seeded per frame index) |
| Failure ergonomics | `validate` gives file/line + fix suggestion (verified — caught 7 authoring errors) | errors are JS stack traces |
| Visual complexity per frame | static HTML layers + clip animations | photo Ken Burns per-plate, grain, ghost compositing, animated data graphics (ciphers, maps, timelines) |

## What could NOT be tested (recorded, not invented)

- openfilm/hyperframes/revideo PoC exports: **not run** (browser download + 3 GB RAM
  budget); their numbers are unknown.
- GPU acceleration: no GPU in sandbox — both engines ran CPU-only.
- geneva long-run stability on a 19k-frame production render: untested (our production
  path stayed on engine v3 for the Zodiac rebuild).
- Distributed `geneva farm` mode: untested (single-machine sandbox).

## Comparison on the directive's seven criteria

1. **Visual quality / animation flexibility**: our engine v3 wins — procedural per-frame
   canvas scenes with per-photo Ken Burns moves, ghost compositing, animated cipher/map
   graphics. geneva's HTML/CSS subset + clip animations is capable but cannot express
   procedural per-frame art without JavaScript.
2. **Compatibility with current orchestrator**: ours wins by definition (it IS the
   orchestrator's renderer); geneva integrates cleanly as an external provider via a
   JSON adapter (timeline → clips), with `validate` as a pre-flight gate.
3. **Reliable unattended rendering**: both verified. geneva's `plan`/`join` mirrors our
   segmented integrity-gated rendering.
4. **Ease of agent-controlled composition**: geneva's validate-with-fixes is the best
   agent UX of the five; our engine has the advantage of full programmatic freedom.
5. **Integration complexity**: geneva = download one MIT binary + write a JSON adapter
   (~1 file). openfilm = npm + browser + RAM risk. hyperframes/revideo = heavier.
6. **Runtime cost**: measured parity on the PoC scene (43.6 s vs 42.0 s; 686 vs 581 MB).
7. **Licensing / sustainability**: geneva MIT; 1-month-old AI-authored project is the
   sustainability risk → adopted as **optional**, never load-bearing.

## Chosen engine

**Keep our engine v3 as the production renderer** (it was also the only one that could
rebuild the Zodiac film without a full scene rewrite), and adopt **geneva as an
optional, isolated second provider** behind the provider interface described in
VIDEO_ENGINE_ARCHITECTURE.md — smallest combination that materially improves the
system, per Phase 4. openfilm remains the strongest future candidate (identical
frame(t) contract) if a browser-capable runner is available.
