# RENDER ENGINE SHOOTOUT — The Wow! Signal (umbrella document)

Parent issue #21 · branch `feat/render-engine-shootout` · completed 2026-10-18.

**Objective:** three complete, independently rendered ~10-minute documentaries of the
same frozen editorial package, produced by three engines, released for owner review.

| Engine | Role | Master | Gates | Determinism |
|---|---|---|---|---|
| A — Opuscar Studio (existing production engine) | baseline | `engines/opuscar/out/wow-signal-opuscar.mp4` | 13/13 | byte-identical |
| B — HyperFrames 0.8.171 | external challenger | `engines/hyperframes/out/wow-signal-hyperframes.mp4` | 13/13 | byte-identical |
| C — Hypit 0.3.1 | external challenger | `engines/hypit/out/wow-signal-hypit.mp4` | 13/13 | byte-identical |

Documents: BRIEF.md (shared spec) · RESEARCH/SOURCE_NOTES/FACT_CHECK (claims) ·
SCRIPT.md/STORYBOARD.md (frozen creative) · TIMELINE.json/RENDER_SPEC.json (canonical) ·
ASSET_MANIFEST.json/ASSET_CREDITS.md (provenance) · AUDIO_MANIFEST.json (shared narration) ·
engines/AUDIT.md (compatibility) · docs/COMPARISON_REPORT.md (measured comparison) ·
docs/RESULTS.json (machine data) · docs/validation-*.json (per-engine gate matrices) ·
docs/wow-signal-checksums.txt.

Issues: #21 parent; #22 audit, #23 research, #24 script, #25 assets, #26 audio,
#27/#28/#29 engines — all closed with evidence; #30 validation, #31 comparison, #32 release.
