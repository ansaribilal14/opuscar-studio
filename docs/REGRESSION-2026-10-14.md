# REGRESSION-2026-10-14 — Zodiac v2.0.0 visual quality: root-cause report

> Directive §1 deliverable. Evidence: 90 deterministic QC frames re-rendered from
> the exact released sources (`build/qc_baseline/`, `src/qc_stills.mjs`), full read
> of `src/film_look.mjs`, `src/scenes_z1/z2/z3.mjs`, `src/timeline.js`,
> `src/narration.json`, and frame-by-frame inspection of the 6 baseline contact
> sheets. The renderer is deterministic — source frames ≡ release frames modulo
> encode.

## Verdict

The film reads as **a beige-card slideshow over crushed photographs**. The image
pipeline (v2/v3) fixed the v1 voids but introduced two systemic regressions of its
own: (A) photographs are dimmed, desaturated and scrimmed until they read as murky
texture, and (B) two-thirds of scenes are beige `paper()` list-cards in the same
layout. The viewer rarely sees a photograph; the viewer reads lists.

## Root causes (source-level)

### RC1 — The photo darkening stack (why images are "dead meat")

`photoPlate()` (film_look.mjs:67-99) stacks on EVERY full-frame photo:

1. global linear gradient `rgba(16,22,32,0.30→0.62)` over the whole frame (l.90);
2. bottom scrim at **0.78 opacity** across the bottom two-thirds (l.92-96,
   default `scrim=0.42`);
3. `gradePixels()` (l.21-40) desaturates every photo to **38% saturation** with a
   cool shadow shift BEFORE any of the above;
4. then the global `vignette()` (l.229) adds another edge-darkening pass, and
   `grain()` (l.208) runs on top.

Net effect measured on the attack scenes (sheet_01): a sunlit Vallejo waterfront
becomes a gray murk where the subject is barely identifiable. The photograph is
treated as a hazard to text legibility instead of as the content.

Additional defect: several scenes call
`photoPlate(..., { dim: 0.62, kb: 0.075 })` (scenes_z1.mjs:162,218,244,253,308)
— **`dim` and `kb` are not recognized options** (the signature accepts
`scrim/dark/kbSeed/zoom/pan`). The intended per-scene dimming silently never
applied; every scene got the default heavy stack. Scene code and engine drifted
apart during v3.

### RC2 — Ghost backdrops make photos invisible under vector scenes (why 20 scenes lost their photos)

`BACKS` (scenes_z3.mjs:378-399) puts photo-cut backdrops under 20 vector scenes,
but `base()` ghost mode (scenes_z1.mjs:142-158) then paints the scene gradient at
**0.45 opacity** over the photo, plus 40 random "lift" circles, before the beige
cards go on top. After vignette+grain, the photo contributes ~nothing (sheets
03-04: "No name", "Not a name", "Arrived 1969-11-08" — backdrop barely
perceptible). Cost: full rendering of two photo layers per frame; benefit: ≈0.
This is the "vector artwork occupying screen space" case in the directive.

### RC3 — Beige-card template dominance (why editing is "stale")

24 of 35 scenes compose the same furniture: `header()` kicker+serif title, N
beige `paper()` cards in rows, `chip()` mono labels, a `stamp()` at a corner
(scenes_z2/z3 especially: cold_open_rules, letters_evidence, c408_hardens,
c408_verdict, c340_team, z13_z32, underdetermined, physical_trail, allen_file,
allen_excluded, poste_rejected, bias_cycle, era_1969, dna_2002, record_recap,
verdict_proves, verdict_open…). Card size, position and reveal timing
(`ease(clamp((tLoc-1.2-i*0.7)/0.9))`) are near-identical everywhere. The last
third of the film (sheets 04-05) is an unbroken run of beige rows. Typography is
also small: body text ≈ `H*0.016-0.03` (17-32 px @1080p) — fine for labels, but
these cards carry the entire scene.

### RC4 — The hook wastes its strongest material (why the opening is dull)

0-15 s ground truth (sheet_00):

- **t≈0-8 s** `cold_open_paper`: backdrop is `news_press.jpg` — a **modern
  AUSTRALIAN Telegraph front page** ("LET'S BACK AUSTRALIA / THE NATION THAT
  MAKES THINGS IMPOSSIBLE"). Wrong continent, wrong decade, wrong story; under
  RC1 treatment it reads as gray noise. The three envelopes are beige cards
  whose cipher grids render as near-black boxes (grid bg `rgba(15,18,26,0.92)`
  inside dim beige) — the film's central prop is illegible in shot 1.
- **t≈8-11 s** `cold_open_years`: "51 YEARS" is the best hook fact — but it
  renders as mid-gray serif on a dark gradient with a barely-visible grid.
- **t≈11-14 s** `cold_open_rules`: an exposition card (EVIDENCE/THEORY/
  DISPUTED) *before* the title — method footnotes before curiosity is earned.
- **t≈14-19.5 s** `title_card`: dark card + small serif line; the brand moment
  is weaker than the material it interrupts.

Narration-wise the hook is actually decent ("Print this, or more people die" is
in b0a); the visuals give it nothing. First 15 s contain no legible evidence, no
real 1969 artifact, no face, no place you can name.

### RC5 — Ken Burns imperceptible + uniform rhythm (why movement feels dead)

`KB_MOVES` (film_look.mjs:104-115): zoom spans 1.04→1.18 over block durations of
13-20 s — sub-1%/s scale drift, effectively static after the RC1 scrims. Moves
are seeded per-photo, so repeats of the same photo reuse the same move. All
blocks transition via the same 0.9 s crossfade (scenes_z3.mjs:400), plus the
same mid-block `photoCut` on BACKS scenes — the edit grammar never varies, so
nothing distinguishes an evidence reveal from a breath.

### RC6 — The cipher grids — the signature visual — are the dimmest element

`cipherGrid` glyphs render at `rgba(216,222,232,0.78)` in `cell*0.62` mono
(scenes_z1.mjs:72-102); inside beige cards the grid bg is `rgba(15,18,26,0.92)`
(near-black on beige). On sheets 00/02/03 the 408/340 grids — the story's
protagonist — are the least legible object in frame.

## Sound: verified adequate, minor notes

The v2 act-cue score + SFX + 3-bus mix already answers the earlier "too soft"
rejection (13 cues, dawn lifts at both solves, narration-ducked). ASR and
loudness gates passed. Remaining (minor): SFX layer uses the same whoosh/impact
palette on every section boundary (sfx_zodiac.py preset reuse) — acceptable, will
be thinned where the new edit adds purposeful cuts, per directive §8.

## What must be preserved (works today)

- Deterministic `render(t)` contract; timeline/durations/pauses; SRT pipeline.
- Andrew −3% house voice; 35 narration blocks + WordBoundary data.
- Act-cue score, SFX layer, 3-bus mix at −16 LUFS.
- The case-file identity: mono chips, stamps, crosshair motif, beat file-tabs,
  progress hairline, source credits — as *supporting* layer (hierarchy 3-4).
- 18 credited photographs + CREDITS ledger; compliance labelling
  (RECONSTRUCTION/UNSOLVED/THEORY) and the research trio.
- build/render/mux/release tooling and QA gates (luma, ASR, loudness).

## Fix plan (maps to directive §2-§7, tracked as issues #11-#16)

1. **composition modes** (new `src/comp_modes.mjs`): full-bleed archival,
   evidence close-up (crop-on-detail), photo collage/duo, map-with-photo,
   restrained graphic, atmospheric — selected per scene brief; photoPlate
   rewritten with per-mode scrim ceilings (full-bleed scrim ≤0.22, text-zone-only
   scrims elsewhere); grade saturation 0.38→0.72, no global cool shift.
2. **hook rebuild**: b0a opens on the documented July 31 1969 fact with the
   Chronicle/envelope evidence treatment (vector reconstruction labelled, since
   no PD photo of the letters exists), the 408 grid legible as the OPENING
   image; 51 YEARS promoted to the first hard cut; rules card demoted into b1
   area; title arrives ~19 s with impact beat.
3. **scene briefs**: all 35 blocks re-briefed (narration ↔ visual contract)
   in `src/scene_briefs.json`; BACKS ghost mode retired (photos either shown or
   not — no 45%-opacity limbo).
4. **rhythm**: per-scene movement plans (static holds for evidence dwell, push-in
   for reveals, lateral for travel), varied transition grammar (cut on new
   fact / dissolve within beat / hold across breath).
5. **QC**: qc_stills.mjs (already built) + editorial 10-question checklist in the
   review report; render baseline vs Candidate A/B proof videos before full
   rebuild.

Baseline preserved: `video-002-zodiac-v2.0.0` release stays untouched; all v3
sources remain in git history and rollback via `git revert` of the v4 commit
range.
