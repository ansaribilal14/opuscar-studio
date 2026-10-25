# COMPARISON REPORT — Three-Engine Shootout v2 (PAPER & SKY)

**Film:** The Wow! Signal — 72 Seconds from Deep Space (The Unclosed File)
**Release:** `render-engine-shootout-v2.0.0` · **Supersedes:** v1.0.0 (rejected by the owner 2026-10-19; evidence in `docs/QA-V1-REJECTION.md`)
**Verdict policy:** the owner watches and decides; this report records measurements, not a winner.

## Why v2 exists

The owner rejected all three v1 films ("All three videos are tooooo bad and shit"). The
measured root cause was the SHARED creative spec, not the engines: 34 static slide-like
layouts, 26–30 px text, compositions occupying ≤35 % of frame, one flat background for
every act, and (Engine C) 600 s of two drifting scans with no titles, captions or end
card. v2 therefore redesigned the shared spec first — "PAPER & SKY": two visual worlds
(night sky / light-table paper), type ≥34 px, hero compositions ≥55 %, per-scene motion,
act contrast, recurring motifs — then re-implemented all three engines against it with
the SAME frozen narration, timeline, SRT and archival assets. Audio was frozen: identical
narration program (edge-tts en-US-AndrewMultilingualNeural) in all three films.

## Objective measurements (identical hardware, container with 2 vCPU / 4 GB cgroup)

| Metric | A — Opuscar (studio v4) | B — HyperFrames 0.8.171 | C — Hypit 0.3.1 |
|---|---|---|---|
| Master | wow-signal-opuscar.mp4 (184 MB) | wow-signal-hyperframes.mp4 (121 MB) | wow-signal-hypit.mp4 (132 MB) |
| Duration | 600.000 s | 600.037 s | 600.076 s |
| Frames | 18 000 @ 30 fps | 18 000 @ 30 fps | 18 000 @ 30 fps |
| Video | H.264 yuv420p tv, 1080p | H.264 yuv420p tv, 1080p | H.264 yuv420p tv, 1080p |
| Audio | AAC 48 kHz stereo, −16.1 LUFS | AAC 48 kHz stereo, −16.1 LUFS | AAC 48 kHz stereo, −16.0 LUFS |
| Full decode | 0 errors | 0 errors | 0 errors |
| Directive §11 matrix | 13/13 PASS | 13/13 PASS | 13/13 PASS |
| v2 coverage (mean active grid, 12 probes) | 0.75 | 0.77 | 0.79 |
| v2 void frames (flat background) | 0 | 0 | 0 |
| v2 type minimum | 34 px (source-credit) | 34 px (source-credit) | 34 px (source-credit) |
| External services / cost | none / $0 | none / $0 | none / $0 |

Render strategy (all foreground, sandbox-capped): A — 10 × 60 s segments, node-canvas
frame stream to x264, ~4.7 min/segment; B — 20 × 30 s segment compositions rendered by
`hyperframes render` (2 workers), ~8.5 min/segment pair; C — 5 daemon builds (124.1 /
117.7 / 123.9 / 108.8 / 125.5 s) exported and concat'd, then a loudnorm delivery pass.

## Editorial equality (verified)

Same 34-scene windows (TIMELINE.json), same narration program, same burned subtitle
wording/timing (149 cues), same archival printout scans with on-screen credits, same
closing card text and credits. Differences are rendering execution only.

## Per-engine character (subjective, for the owner's viewing)

- **A — Opuscar (flagship):** every element is drawn per-frame in code — hand-wobble red
  pen, progressive arch draws, staggered build-ins, animated grain. Richest motion of
  the three; the studio's own engine contract (`render(t)`).
- **B — HyperFrames:** the same design system authored as HTML/CSS + GSAP timelines.
  Cleanest typography rendering (browser text stack); determinism via frame-seek.
- **C — Hypit:** the same design system rendered as deterministic plates, composited by
  Hypit's SVML runtime with parallax motion poses and caption clips. Most conservative
  motion; strongest archival presentation (full-bleed graded scans).

## Known limitations (recorded honestly)

- C's Hypit primitive set has no text component — plates carry the typography
  (deterministic Pillow assets, committed source). Motion is clip-level (Ken Burns),
  not per-element animation.
- B renders via screenshot capture (SwiftShader) — the slowest path per frame of the
  three; pinned 0.8.171 (0.x churn).
- Loudness normalization for C is a delivery pass over the concat (the Hypit mux did
  not hit −16 LUFS natively).
- v1.0.0 masters remain on the old tag for reference; v1 is NOT withdrawable (immutable
  release), superseded by this one.
