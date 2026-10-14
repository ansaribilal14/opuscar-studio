# BENCHMARK-2026-10-14 — Zodiac proof benchmark verdict (directive §10)

> Controlled comparison, 75 s window (t=0–75: full hook b0a–b0d + first attack b1a).
> Identical narration/audio timeline in all four candidates (`build/proof/narration_75s.wav`,
> cut from the regenerated deterministic 3-bus mix). Same encoder settings (H.264
> 1920×1080 24 fps, CRF 19, faststart). All candidates integrity-gated: 75.000 s,
> AAC, zero decode errors. Review performed on contact sheets built from the
> **encoded outputs** (`build/proof/sheet_{base,A,B,C}.jpg`), 12 timestamps each,
> hook-dense sampling per directive §9.

## Candidates

| Candidate | Hook (b0a–b0d) | Composition (attacks) | Machinery |
|---|---|---|---|
| BASE | v3 (Australian Telegraph backdrop, 3 beige cipher cards, dim grids) | v3 (crushed photo, beige name card) | exact v3 dispatcher (`scenes_z3.mjs`: uniform crossfade, BACKS ghost) |
| A | **v4** (newsroom photo, ink-grid envelope reconstruction, "PRINT THIS, OR MORE PEOPLE DIE.", 51 YEARS hard cut) | v3 | v4 dispatcher + v3 attack fns |
| B | v3 | **v4** (full-bleed bright plate, lower-thirds, small map inset) | v4 dispatcher + v3 hook fns |
| C | **v4** | **v4** | v4 dispatcher (production) |

## Frame evidence (what the sheets show)

- **BASE t=0.5–23 s**: the modern Australian Telegraph front page ("LET'S BACK
  AUSTRALIA / RETURN TO A NATION THAT MAKES THINGS / READERS EAGER TO PUT AUSSIES
  FIR…") dominates every frame of the opening; the three cipher cards are small
  beige boxes with near-black grids. The film's central artifact is illegible in
  shot 1. Confirms RC4/RC6 exactly as reported in REGRESSION-2026-10-14.md.
- **BASE t=33/45/58**: "51 YEARS" present but reads as a caption, not an event;
  the method card is three thin beige strips.
- **BASE t=71**: Benicia photo dim under the v3 scrim stack; name card beige.
- **A t=0.5–23**: photograph alive from frame one (hands on a period wire
  machine); envelope reconstruction large; 408 window legible as INK on paper;
  the demand as display type. t=33 "51 YEARS" promoted to a typographic event.
  t=71 still v3 (weaker than its hook) — isolates the hook contribution.
- **B t=0.5–23**: still the broken v3 hook — isolates the composition
  contribution. **B t=71**: bright full-frame Benicia waterfront, names directly
  on the frame, small useful map inset — unmistakably stronger than BASE t=71.
- **C**: best of both at every sampled timestamp. No regression observed at any
  sampled point (hook, cipher legibility, attack composition, typography).

## Verdict

**Candidate C is selected as production behavior.** Both interventions independently
outperform the baseline on their isolated dimension; combined they win at every
sampled timestamp; nothing regressed. This matches the directive's success test:
the opening earns attention with real, legible material, and the composition keeps
photographs as the content.

**C is already the committed dispatcher** (`scenes_zodiac.mjs` → `scenes_z3v4.mjs`).
Rollback path per directive §11: `git revert` the v4 commit range restores v3.

## Sourcing note

The BASE candidate is rendered from the exact v3 sources in git (the same
deterministic pipeline that produced the released v2.0.0 encode; the regression
report documents source-frame ≡ release-frame modulo encode). Re-downloading the
494 MB release master was skipped deliberately: the container was reset this
session and the deterministic re-render is the same pixels; verdict conclusions do
not depend on the encoder.

## Full-film go/no-go

GO for the full 16:45 re-render on candidate C, with the standing QC gates:
per-segment integrity (build_seg.sh), final decode/loudness/ASR gates, editorial
contact-sheet review of the encoded master (10-question checklist) before release.
