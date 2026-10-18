# STORYBOARD — visual system (engine-neutral)

> One visual system, implemented faithfully by all three engines (directive §7).
> Every scene is code-generated unless an archival asset is staged; every
> reconstruction is LABELLED on screen (BRAIN.md Step 6 absolute rule).
> Shared palette, type and scene grammar are defined here; TIMELINE.json gives
> the exact per-scene windows; each engine maps scenes onto its own primitives.

## Design system (shared)

| Token | Value | Use |
|---|---|---|
| `bg` | `#070b16` deep navy-black | page background, all scenes |
| `panel` | `#0d1424` | cards, printout paper, panels |
| `ink` | `#f4f2ec` archival white | primary text |
| `dim` | `#8fa0b8` | secondary text, axes |
| `signal` | `#4be1a0` restrained green | the Wow! signal, active data |
| `cyan` | `#58c7f0` | secondary data accent, coordinates |
| `crimson` | `#c0392b` | The Unclosed File identity, red circle/pen |
| `beige` | `#e8dfc8` | archival paper tint |
| `warn` | `#e0b34c` | "proposed / not proven" labels |

Type: titles **DejaVu Sans** bold; data/mono **DejaVu Sans Mono**; body **Carlito**.
All three faces are sandbox-local; no webfonts, no CDN (identical in every engine).

Motion grammar (identical intent in all engines): slow 8–12 s Ken Burns pushes on
stills (max 6% scale), data draws on over 1.2–2 s, cards fade+rise 0.6 s, cuts on
narration block boundaries, no bounce easing, no loops, no flashing.

Reconstruction label: small caps `RECONSTRUCTION` in `dim`, bottom-left, whenever a
scene recreates archival material (printout, telescope, documents).

## Scene list (windows in TIMELINE.json)

| Scene | Blocks | Visual |
|---|---|---|
| **SC01 cold-open pulse** | b01 | Slow starfield drift (code: 140 stars, 2 layers); a green pulse trace rises mid-frame — 72-s beam-transit arch drawn once; caption line "August 15, 1977 · 11:16 p.m. EDT". |
| **SC02 printout tease** | b02 | Dark frame; six mono characters `6EQUJ5` type on one by one in `signal`; a crimson circle draws around them (2 s); script-font "Wow!" writes in margin. |
| **SC03 title** | b03 | Title card: "THE WOW! SIGNAL" / "72 Seconds from Deep Space" / THE UNCLOSED FILE mark (crimson rule). Subtle grain. |
| **SC04 telescope diagram** | b04 | Code-drawn Big Ear elevation diagram (flat reflector, paraboloid, ground plane, beam path) — labelled parts type on; slow push. `RECONSTRUCTION` label. |
| **SC05 earth-rotation sweep** | b05 | Top-down sky swath; beam rectangle scans left→right over 72-s clock; a sky point crosses and exits. |
| **SC06 survey numbers** | b06 | Counter cards: `~20,000 SOURCES` · `2 RECORD QUASARS` · `1972 FUNDING CUT`; archival-paper panel. |
| **SC07 narrowband machine** | b07 | IBM-1130-era console + line printer schematic (code-drawn); 50 channel cells; one character per row printing. `RECONSTRUCTION`. |
| **SC08 printout columns** | b08 | Full printout page recreation: 120-col mono grid, header fields (RA/DEC/2ND LO/…), two horns alternating row tints. `RECONSTRUCTION`. |
| **SC09 the six rows** | b09 | Zoom to channel 2: rows 6·E·Q·U·J·5 highlight as the ladder builds; SNR bar under each char. |
| **SC10 intensity scale** | b10 | Vertical scale 0–35 with letter zone marked (A–Z = 10–35); U ring at 30; noise floor labelled "receiver + sky". |
| **SC11 beam-transit arch** | b11 | The fitted arch (Kraus curve): rise 36 s → peak → fall; half-power width annotated 37 s vs full window 72 s (myth-bust chips). |
| **SC12 two horns** | b12 | Two beam silhouettes; horn A lights with signal; clock +5 min; horn B sweeps same patch: empty. "ONE HORN ONLY" chip. |
| **SC13 ehman context** | b13 | Typographic card (no portrait claimed): "JERRY R. EHMAN — Radio astronomer, Ohio State"; printout stack motif; review-routine row highlight animation. |
| **SC14 the circle** | b14 | Printout close-up; red pen circle draws; "Wow!" margin note writes on; date chip "Aug 19, 1977". |
| **SC15 name sticks** | b15 | The annotation holds; margin note duplicates across later rows = none (empty rows scroll). |
| **SC16 sky coordinates** | b16 | Coordinate card: RA 19h22m25s · Dec −27°03′ (1950.0) → position marker on Sagittarius star map (code-drawn). |
| **SC17 watering hole** | b17 | 1959 card: Morrison & Cocconi; hydrogen atom 21-cm diagram; "1420 MHz" in `signal`; "THE WATERING HOLE". |
| **SC18 frequency offset** | b18 | Spectrum bar: hydrogen line at 1420.4058, Wow! marker at 1420.4556 (+50 kHz); blueshift arrow "≈10 km/s toward Earth". |
| **SC19 paperwork story** | b19 | LO typo card: ordered 1450.4056 / delivered 1450.5056; two frequency values in literature reconcile. |
| **SC20 narrow vs wide** | b20 | Comparison bars: broadband natural sources vs one 10-kHz channel; "narrowness is what technology does" chip. |
| **SC21 look again** | b21 | Empty sweep cards; "NOT REPOINTABLE" chip; sky swath returning empty. |
| **SC22 decades of silence** | b22 | Search timeline 1987→1999: META 87/89 · Green Bank 95 · VLA 95/96 · Tasmania 99 — each stamps `NULL`. |
| **SC23 modern searches** | b23 | 2022 Breakthrough Listen (GBT+ATA) · 2025 SETI Institute coordinated — stamps `NULL`; counter "0 REPEATS IN 49 YEARS". |
| **SC24 ruled out** | b24 | Five ruled-out chips (planets/asteroids/satellites/aircraft/spacecraft) strike through; debris-reflection mini-diagram → "improbable". |
| **SC25 propagation ideas** | b25 | Lensing diagram (mass bending beacon path) + scintillation flicker diagram; both tagged `possible · should repeat · didn't`. |
| **SC26 comet hypothesis** | b26 | Comet card (Paris 2017) with three dismissal strikes (beam timing / emission / one horn). |
| **SC27 hydrogen maser** | b27 | 2024 Arecibo-Wow! card: hydrogen cloud + magnetar flare arrow → maser burst; `warn` label "PROPOSED — NOT PROVEN"; "model events ~100× weaker". |
| **SC28 evidence ledger** | b28 | THE LEDGER: left column "ESTABLISHED" (4 facts from C03/C04/C05/C11) on `panel`. |
| **SC29 not established** | b29 | Right column "NOT ESTABLISHED" (source, message, any proven explanation); "replication is the currency" chip. |
| **SC30 ehman quotes** | b30 | Quote card: "The origin of the Wow! signal is still an open question for me." / "…half-vast data." — J. R. Ehman (bigear.org). |
| **SC31 telescope gone** | b31 | 1998 card: land sold; silhouette of Big Ear fading to outline; "golf course + 400 houses". What survives: the page. |
| **SC32 searches go on** | b32 | Star map with modern survey cones; "LISTENING FOR ANOTHER WOW!" chip. |
| **SC33 final question** | b33 | Slow push on starfield toward Sagittarius; final question line fades in: "If it was a beacon, it spoke once. If it was nature, we have not caught it again." |
| **SC34 closing card** | b34 | THE UNCLOSED FILE closing card: channel mark, film title, credits block (sources: bigear.org · SETI Institute · published literature; narration: synthetic voice; visuals: code-generated + PD archival where credited). "SOME FILES NEVER CLOSE." Holds to program end. |

## Engine mapping summary
- **Opuscar**: each scene = a `render(t)` scene module in the film workspace timeline (v4
  image-first conventions; burned captions via TEXTS contract).
- **HyperFrames**: one composition, scenes as timed `.clip` divs with GSAP timelines
  (seeked per frame), captions as timed text elements, narration/music as `<audio>`.
- **Hypit**: scenes as `hypit.html-visual@1` components (`render(localFrame)`) or
  image+motion clips; narration via `audio:Track` at absolute Windows; captions via
  `caption-fine` cues (or burned text components).
