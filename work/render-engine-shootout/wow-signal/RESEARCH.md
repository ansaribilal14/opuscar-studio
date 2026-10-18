# RESEARCH — The Wow! Signal (The Unclosed File)

Access date for all web sources: **2026-10-18**. Claim ledger lives in `FACT_CHECK.md`.
Sources are listed with full provenance in `SOURCE_NOTES.md`.

## 1. What happened (dated timeline)

| Date | Event | Source |
|---|---|---|
| 1959 | Cocconi & Morrison (Cornell) propose that any civilization trying to communicate by radio would likely choose 1420 MHz — the 21-cm spectral line of neutral hydrogen, the universe's most common element | Wikipedia (§Background); the paper: *Nature* 159, 844 (1959) — "Searching for Interstellar Communications" |
| 1963 | "Big Ear" radio telescope of the Ohio State University Radio Observatory (OSURO), Delaware, Ohio, begins operation. Designer/builder/director: Dr. John D. Kraus. Flat tiltable reflector + fixed paraboloidal reflector + ground plane; fixed azimuth — the sky is scanned by Earth's rotation alone | bigear.org 30th report (Ehman) |
| 1965?–1972 | Ohio Sky Survey: nearly 20,000 wideband radio sources catalogued (about half never measured before); two were then the most distant known quasars. NSF funding cut in 1972 ends the survey team (Ehman among those laid off) | bigear.org 30th report |
| 1973 | Bob Dixon (assistant director) convinces Kraus to convert Big Ear to a narrowband (10 kHz channels) sky survey — the kind of emission almost always produced by transmitters. Software N50CH on an IBM 1130; 50 channels × 10 kHz; one printout row per ~12 s of sidereal time (10 s integration + ~2 s processing); each channel's intensity printed as ONE character (0–9, then A–Z for SNR 10–35) | bigear.org 30th report |
| **Aug 15, 1977, ~11:16 p.m. EDT** | Signal received at Big Ear (two feed horns: "positive" and "negative" row alternation). Sequence spans the full 72-second window Big Ear had on any sky point (6 rows × 12 s). Characters in channel 2: **6 E Q U J 5** | bigear.org 30th report |
| Aug 19, 1977 (a few days later) | Jerry R. Ehman, reviewing the multi-day printout at home, sees "6EQUJ5", circles it in red pen, writes "Wow!" in the margin. He then checks whether the signal returned on later pages — it did not. Notifies Kraus and Dixon; Kraus names it "the Wow! source" | bigear.org 30th report |
| 1977+ | Ehman's recurrence searches at Big Ear: null | Wikipedia §follow-ups |
| 1987 & 1989 | Robert H. Gray re-observes with META array, Oak Ridge Observatory: null | Wikipedia §follow-ups |
| Jul 1995 | H. Paul Shuch (SETI League) drift-scan, 12-m dish at NRAO Green Bank: null | Wikipedia §follow-ups |
| 1995 & 1996 | Gray re-observes with the Very Large Array (far more sensitive than Big Ear): null | Wikipedia §follow-ups |
| 1998 | Big Ear destroyed by land developers (land bought from Ohio Wesleyan University; 9-hole golf course expanded to 18 holes + ~400 houses built) | bigear.org 30th report |
| 1999 | Gray & Simon Ellingsen, 26-m Mount Pleasant Radio Observatory (Univ. of Tasmania): six 14-hour observations: null | Wikipedia §follow-ups |
| 2016–2018 | Antonio Paris proposes hydrogen clouds around comets 266P/Christensen and P/2008 Y2 (later also 335P/Gibbs); 2018 paper in J. Washington Academy of Sciences. Dismissed by astronomers incl. Big Ear veterans: comets not in the beam at the right time, don't emit strongly there, and can't explain the one-horn problem | Wikipedia §comets |
| 2022-05-21 | Breakthrough Listen: first targeted search with Green Bank Telescope + Allen Telescope Array (1 h GBT, 35 min ATA, 9 min 40 s simultaneous): no technosignature candidates | Wikipedia §follow-ups |
| 2024-08 | Méndez, Ortiz Ceballos & Zuluaga, "Arecibo Wow! I" (arXiv:2408.08513): archived Arecibo drift scans (Feb–May 2020) show narrowband ~10 kHz hydrogen-line events from cold interstellar HI clouds, but ~100× weaker; hypothesis: transient excitation (e.g. magnetar flare / soft gamma repeater) brightening a hydrogen cloud via maser-like superradiance | arXiv abstract |
| 2025-09-09 | SETI Institute reports first coordinated GBT/ATA observation of the Wow! position ("possible source") | seti.org news listing |

## 2. Measured properties of the signal (established)

- **Intensity ladder "6EQUJ5"** = SNR per 12-s row, truncated integers: 6 → [6,7); E=14 → [14,15); Q=26 → [26,27); U=30 → [30,31); J=19 → [19,20); 5 → [5,6). Peak "U" = **30.5 ± 0.5 × background noise** (most of the noise is the receiver itself). bigear.org 30th report.
- **Duration 72 s** — the full beam-exposure window; NOT 37 s (that figure is the half-power beam width of Kraus's fitted curve — a common misconception to explicitly correct in the film). bigear.org 30th report.
- **Expected shape for a continuous narrowband point source** swept by the beam: gradual rise ~36 s → peak → gradual fall. All present. bigear.org/Wikipedia.
- **Frequency**: Ehman's published value **1420.4556 ± 0.005 MHz**, i.e. **50 ± 5 kHz above** the neutral hydrogen line 1420.4058 MHz (Kraus's 1994 value 1420.3556 MHz for Sagan traced to a local-oscillator typo — ordered 1450.4056, delivered 1450.5056; Ehman's calculation accounted for it). If interpreted as a Doppler blueshift: source moving ~10 km/s toward Earth. Wikipedia §frequency (Ehman 1998); bigear.org.
- **Direction (epoch 1950)**: positive horn R.A. 19h22m25s ±10s, Dec −27°03′ ±20′; negative horn R.A. 19h25m17s ±10s. Constellation Sagittarius, near the chi Sagittarii region, close to the galactic plane. bigear.org 30th report.
- **One horn only**: the second horn swept the same patch ~5 minutes later (Wikipedia/arXiv) — the signal did not appear there. Any explanation must survive this. arXiv:2408.08513 §discussion; bigear.org.
- **Bandwidth**: consistent with ≤10 kHz channels; narrowband. Channels were 10 kHz wide (bigear.org).
- **Never recurred** in any search since (all above).

## 3. Interpretations and hypotheses (labelled as such — never as fact)

Per Ehman's own assessment (bigear.org 30th report):
- **Ruled out**: planets; asteroids; satellites (none in beam; band protected); aircraft (move too fast; no transmitters in protected band); spacecraft.
- **Improbable**: ground-based transmitter reflected off non-tumbling space debris (needs an illegal protected-band transmitter + unlikely reflection geometry; no Doppler signature observed).
- **Possible but unlikely**: gravitational lensing (would likely remain visible longer / recur); interstellar scintillation (possible — would imply a far, faint source made briefly visible; but should show in both horns).
- **Hypotheses in later literature**:
  - Comet hydrogen clouds (Paris 2017/2018) — dismissed (position/timing, emission strength, one-horn problem).
  - Hydrogen-cloud maser/superradiance brightening triggered by transient radiation (Arecibo Wow! I, 2024) — proposes a natural astrophysical explanation; model signals ~100× weaker than Wow!; authors present it as a new class of technosignature false positive, not a proven cause.
  - ETI transmission — cannot be ruled out; its single occurrence and non-replication limit confidence (Wikipedia; Ehman: "might have sent").
- **Ehman's own position**: "The origin of the Wow! signal is still an open question for me… I choose not to 'draw vast conclusions from half-vast' data." All terrestrial possibilities "ruled out or seem improbable"; an ETI "**might**" have sent it; he awaits additional signals.

## 4. Context worth using in the film

- Big Ear's narrowband survey was a record-setter (longest continuously running narrowband survey — Guinness). bigear.org.
- The IBM 1130 + line printer mechanics: one row = ~12 s of sky; "ka-chunk"; printouts delivered to Ehman's home by technician Gene Mikesell. bigear.org.
- The 1959 Cocconi–Morrison logic: hydrogen = the universe's common element = the "watering hole" where any communicator might listen. Wikipedia §background.
- Big Ear could see declinations ≈ −36° to +64°; fixed telescope, Earth as the clock. bigear.org.
- The printout's other columns: RT ASCEN (1950.0), DECLIN (1950.0), 2ND LO FREQ, galactic lat/long, EST — the film can visualize a faithful reconstruction (labelled).
- No movable feed horns in 1977 → impossible to repoint or quickly re-observe anything. bigear.org.

## 5. Explicitly NOT claimed (editorial red lines)

- No claim that the signal was of extraterrestrial origin, or that any hypothesis is proven.
- No invented dialogue/quotes: only documented Ehman quotes from bigear.org (verbatim, cited).
- The 2010 Ehman web account and the 30th-anniversary report are personal accounts — presented as the discoverer's recollection and assessment, which they are.
- The 2024 Arecibo Wow! hypothesis is presented as a *proposed* natural explanation with stated limitations (model events ~100× weaker).
