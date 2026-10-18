# COMPARISON REPORT — Three-Engine Documentary Shootout

**Film:** *THE WOW! SIGNAL — 72 Seconds from Deep Space* (The Unclosed File)
**Date:** 2026-10-18 · **Repo:** ansaribilal14/opuscar-studio · **Branch:** `feat/render-engine-shootout`
**Method note:** every number below is measured on this container (2 CPU / 3 GB RAM / Node 24.21.0 / ffmpeg 7.1.5). Objective measurements and subjective observations are separated. Asset research/preparation time (shared, ≈3 h) is excluded from engine times. **The owner decides the winner; this report does not.**

## 1. What each engine actually did

| | **A — Opuscar Studio** | **B — HyperFrames** | **C — Hypit** |
|---|---|---|---|
| Version | studio canvas provider (node-canvas 3, ffmpeg 7.1.5) — the repo's documented film path | **hyperframes 0.8.171** (npm, Apache-2.0) | **@hypit/hypit 0.3.1** (npm, mod. Apache-2.0) |
| Authoring | 34 `renderFrame(ctx,W,H,tl,t)` scene modules; timeline.js reads the frozen TIMELINE.json | generated HTML composition (data-* timing) + GSAP timelines seeked per frame | generated SVML (scene windows, `visual:Motion`, normalized audio clips) → Film → html:Video |
| Render mechanism | node-canvas frames → JPEG streamed to x264 | headless-Chrome frame capture → x264 + audio mix | chrome rasterize per frame → mux (media-local) |
| Input parity | frozen TIMELINE.json + shared SRT + shared narration + 2 PD scans | identical | identical |
| External services / cost | none / $0 | none / $0 (local render; no credits) | none / $0 (all steps "local, no Provider charge") |

## 2. Measured delivery (all three pass the frozen spec)

| Metric | Opuscar | HyperFrames | Hypit |
|---|---|---|---|
| Duration | 600.000 s | 600.033 s | 600.000 s |
| Frames | 18000/18000 | 18000/18000 | 18000/18000 |
| Video | H.264 1920×1080 30 fps yuv420p tv | same | same |
| Audio | AAC 48 kHz stereo | same | same |
| Full decode | 0 errors | 0 errors | 0 errors |
| Loudness | −16.0 LUFS | −16.0 LUFS | −16.0 LUFS (delivery-normalized; engine mux is −21.3) |
| A/V delta | 0.000 s | 0.000 s | 0.000 s |
| Gate matrix | **13/13** | **13/13** | **13/13** |
| File size | 81.3 MB | 45.7 MB | 224.0 MB |
| Determinism | **byte-identical** (300-frame ×2) | **byte-identical** (60 s ×2) | **byte-identical** (60 s build+export ×2) |

## 3. Measured production times (minutes, this container)

| Phase | Opuscar | HyperFrames | Hypit |
|---|---|---|---|
| Setup/install | 5 | 20 (npm CLI + Chrome download 601 MB + build_system) | 25 (npm CLI + own Chrome + runtime up) |
| Creative implementation (scenes/captions/audio wiring) | ~150 | ~150 (same shared spec; HTML/GSAP authoring generator) | ~150 (SVML authoring generator; the shortest authoring surface once the model is learned) |
| Render wall-clock | **~16** (10×95 s, ~20 fps) | **~14** (10×60 s segments, 60–89 s each) | **~45** (~9.4 fps rasterize + mux; one 30-min provider timeout found & fixed) |
| Debug/interventions | 2 scene fixes pre-render; TDZ + close-race fixes | audio-id lint error; tween-literal parse; premium-plugin replaced; disk-capture fallback noted | 5 SVML contract lessons (frame-extent quantization, declaration order, `.media` port); timeout knob |

## 4. Visual observations (subjective — owner's judgment)

- **Opuscar**: the richest visual execution — archival scans with Ken Burns, code-drawn diagrams (beam-transit arch, ladder, spectrum, ledgers, coordinates), reconstruction labels, film grain. Readable burned captions. Closing card + credits clean.
- **HyperFrames**: visually close to Opuscar for card/diagram scenes (HTML/CSS is a natural fit); archival pans via GSAP; caption styling comfortable. Slightly flatter motion range than A in practice; the software-GL fallback adds no visible artifacts.
- **Hypit**: honest, clean, archival-motif treatment — the printout scans with slow pushes, scene fades; **no code-drawn diagrams in this delivery** (built-in primitives only; the component-package upgrade path is documented). Subtitles are packaged (SRT) rather than burned in this delivery. The film is complete and parity-faithful in story/narration/timing; visual richness is the delta.

## 5. Reliability & recovery characteristics

- **Opuscar**: per-segment integrity gates (frame count + full decode + git-HEAD guard) make any failure locally re-runnable in ~95 s. Deterministic re-render proven (byte-identical).
- **HyperFrames**: no range/resume flags → segment compositions used (each an independent render); lint/validate tooling caught real authoring errors pre-render; byte-identical.
- **Hypit**: result repository + local runtime daemon kept the build alive across CLI detaches (recoverable polling); one provider timeout knob; build retry after fix reused cached steps; byte-identical.

## 6. Editability & reuse

- **Opuscar**: scenes are plain JS modules over one timeline — direct and diffable; new films copy the workspace pattern (house-standard).
- **HyperFrames**: HTML/CSS compositions are highly editable (any web tooling); generator keeps timing in the frozen package; strong ecosystem (catalog blocks, lint/check/inspect tooling).
- **Hypit**: SVML is compact and the compile-graph model makes timing edits surgical; code-drawn visuals require author-packages (SDK on npm; examples excellent but contract-heavy for newcomers).

## 7. Costs & dependencies

Zero-cost, credential-free for all three on this container. Dependency footprints: Opuscar = node-canvas + ffmpeg (present); HyperFrames = npm CLI + Chrome-for-Testing (~600 MB cache); Hypit = npm CLI + chrome-headless-shell (~350 MB) + pnpm-free local runtime. Hypit's license adds conditions (no multi-tenant hosting; no commercial redistribution as a component; logo/copyright preservation in CLI-derived surfaces) — none implicated by this run; outputs are ours.

## 8. Failures & honesty ledger

- Opuscar: two pre-render visual fixes (SC04 geometry, SC34 spacing) — caught by the 16-still probe.
- HyperFrames: `init` hangs in sandbox (manual authoring); screenshot-capture fallback (BeginFrame) documented by the engine itself; disk-capture failure on the LAST determinism run → freed intermediates, switched to streaming workers=1.
- Hypit: 30-min `processTimeoutMs` defect (found on the 18k-frame build; raised to 90 min — a config knob); SVML lessons (quantize to frames; declare values before references; consume `.media` port) recorded.
- No engine failed finally; no substitution between engines occurred at any point.
