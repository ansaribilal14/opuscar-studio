# QA VERDICT — shootout v1 (operator rejection 2026-10-19) → v2 rebuild brief

**Trigger:** operator rejection — *"All three videos are tooooo bad and shit, the worst
thing I saw in my life."* This file is the evidence-based triage and the v2 design brief.
All three v1 masters remain on `render-engine-shootout-v1.0.0` (untouched) for reference.

## 1. Evidence (measured on the released v1.0.0 masters)

Method: 30 frames per film sampled at 20 s intervals (full-res 1920×1080), contact
sheets + zoom crops; ffprobe; loudness scan. QA artifacts: `work/wow-shootout/qa/`
(session-local), key frames copied to `docs/qa-v1/`.

### Common failures (all three films — root cause is the SHARED creative spec)

| # | Failure | Evidence |
|---|---------|----------|
| C1 | **Slide deck, not cinema.** 34 scenes ≈ one static layout each: kicker + small diagram + caption. No camera language, no depth, no build tension. 600 s plays like a 100-slide deck. | contact sheets: 30/30 frames are the same "title + small object on void" pattern |
| C2 | **Tiny unreadable text.** Body/label text 26–30 px at 1080p (≈1.4 % of frame height). TV/phone unreadable. | zoom crops `opuscar_t25`, `hf_245` |
| C3 | **Vast empty voids.** Compositions occupy ≤35 % of frame; the rest is flat #070b16. | `hf_245`: two mono lines + tiny constellation on a black ocean |
| C4 | **One background for every scene.** Same navy void for cold open, data, hypotheses, credits → zero rhythm/contrast; the story's acts look identical. | all sheets |
| C5 | **Emotional flatness.** The story's three peaks (72-second window; the handwritten "Wow!"; five decades of silence) get the same visual weight as data tables. | sheets vs SCRIPT.md beat sheet |
| C6 | **Only 2 archival images**, reused as small floating rectangles instead of full-bleed evidence treatment. | sheets |

### Per-engine failures

| Engine | Verdict | Specific defects |
|--------|---------|------------------|
| A — Opuscar | Rejected (sterile "engineering deck") | hairline strokes + 26 px labels; debug-HUD look; no environment art beyond starfield dots |
| B — HyperFrames | Rejected (A's problems + render bugs) | caption clips truncate mid-sentence (`hf_245` "right ascension nineteen …"); overlapping text at scene seams; flatter motion than A |
| C — Hypit | **Unshippable as delivered** | entire 600 s = two printout scans drifting on black; NO titles, NO diagrams, NO captions, NO end card; 224 MB of mostly-black high-bitrate noise |

### Audio (shared) — PASS, not the rejection driver
edge-tts narration (en-US-AndrewMultilingualNeural), −16 LUFS, ASR 0.91–0.94, A/V 0.000 s.
Narration timing + SRT stay FROZEN for v2.

## 2. Root cause

All three engines implemented the same frozen scene spec faithfully — and the spec itself
was a *technical briefing* (dark void, hairline diagrams, small labels). No engine can
render cinema out of a slide deck. **The redesign must happen at the shared-spec level,
then propagate to every engine.**

## 3. v2 design brief — "PAPER & SKY"

Two visual worlds in dialogue (the film's actual theme: a human mark on paper vs the sky
that never answered):

- **SKY world** — deep night gradient (not flat black): layered parallax starfields, a
  milky-way band, horizon haze, Big Ear silhouette panorama. Cold blues; the beam glow.
- **PAPER world** — light-table evidence: warm dark room, full-bleed paper sheets, typewriter
  print, red pen marks drawn on with hand-wobble strokes. Warm cream vs the night.

Shared grammar (all engines, same rules):
1. **Type scale ≥ 2.5× v1**: display 132–150 px, section 64–76 px, labels 34–40 px,
   captions 44 px, data numerals 96–120 px.
2. **Full-frame compositions** — hero element ≥ 55 % of frame; no floating boxes on void.
3. **Every scene moves**: global slow push (1.00→1.05), choreographed staggered build-ins,
   ambient life (twinkle, drift, glow pulse, shimmer).
4. **World-aware transitions**: luminance light-leak wipes (never hard cuts to black).
5. **Recurring motifs**: 72-second signal bar (fills/decays), coordinate chips, red-pen
   marks, constellation lines, Big Ear panorama.
6. **Act contrast**: cold open (sky) → observatory (sky) → signal+paper (paper) → decades
   (sky, emptier) → hypotheses (paper evidence board) → verdict+close (sky, single question).

Scope: same 34 scene windows, same narration/SRT/audio, same engine boundaries.
Engine A (Opuscar) = flagship implementation; Engine B (HyperFrames) = same spec via the
generator (fix caption truncation/seam overlaps); Engine C (Hypit) = maximum upgrade
inside its primitive set (titles, captions, graded full-bleed archival, motion variety).

## 4. v2 acceptance gates (per engine, in addition to the 13-gate matrix)

- V1-type-size gate: no rendered text below 34 px at 1080p.
- Coverage gate: mean composition coverage ≥ 55 % (non-background pixels) — measured on
  12 probe stills.
- Environment gate: every scene renders a full-frame environment (gradient/paper), none
  renders flat #070b16 alone.
- Caption gate: no truncated caption lines; no overlapping text at seams (12 stills).
- Motif gate: signal bar present in all signal scenes; world gradient per act mapping.
