# BRIEF — THE WOW! SIGNAL: 72 SECONDS FROM DEEP SPACE

> Shared creative specification for the three-engine render shootout (parent issue #21).
> All three engines consume THIS brief, the frozen TIMELINE.json, the shared narration,
> subtitles and assets. Differences in rendering execution are allowed; differences in
> story content and source material are not (directive §6, §7).

## Identity
- Channel: **The Unclosed File**
- Language: English · Genre: scientific mystery / space documentary · Format: full-length narrated documentary
- Target duration: 10:00 (accept 9:59–10:01) · 1920×1080 · 30 fps · H.264 yuv420p · stereo AAC

## Editorial objective
A polished, suspenseful, evidence-led documentary about the 15 August 1977 Wow! Signal:
what was detected, why it attracted attention, what the famous annotation meant, what
follow-up observations established, and why the origin remains unresolved.

**Editorial safety (hard rules)**
- Never imply extraterrestrial intelligence caused the signal, that aliens were detected,
  or that any hypothesis is proven.
- Label every reconstruction as a reconstruction. No AI imagery presented as archival.
- Established observations ≠ interpretations ≠ proposed explanations — visually and
  verbally distinct.

## Structure (directive §6 starting frame; refined timing after narration measure)
| Time | Segment | Editorial objective |
|---|---|---|
| 00:00–00:40 | Cold open | Introduce the unexplained signal, establish intrigue |
| 00:40–01:40 | The observatory | Big Ear telescope, Ohio State, the 1977 context |
| 01:40–02:50 | The signal | The observation and the famous printout |
| 02:50–04:00 | The annotation | Jerry Ehman and the handwritten "Wow!" |
| 04:00–05:20 | Why it stood out | Unusual characteristics and what could be inferred |
| 05:20–06:40 | Follow-up observations | What later searches established |
| 06:40–08:00 | Proposed explanations | Hypotheses weighed, with their limitations |
| 08:00–09:10 | Evidence vs speculation | Separate findings from conclusions |
| 09:10–09:40 | The unresolved question | What remains unknown |
| 09:40–10:00 | Closing + credits | A memorable final question; channel identity |

## Visual direction
- Deep navy/black backgrounds; restrained green/cyan signal accents (house palette of
  The Unclosed File: black / archival beige / crimson, blended toward the directive's
  navy+green spec for this film).
- Scientific data visualizations (waterfall/spectrum strip, sky coordinates), star maps,
  radio telescope imagery where lawfully licensed, controlled Ken Burns movement on
  stills, labelled reconstructions, readable typography, consistent closing card.
- Code-generated graphics preferred for original diagrams (source committed to repo).
- Forbidden: repetitive animation loops, excessive zooming, generic AI imagery,
  unreadable type, prolonged static slides.

## Audio
- One shared narration recording: edge-tts `en-US-AndrewMultilingualNeural`, rate −3%
  (house voice, BRAIN.md Step 4). Measured duration is the final authority for 10:00.
- One shared subtitle file (word-timed SRT from WordBoundary events).
- Music bed only if it survives the "must not obscure narration" rule; identical for
  all engines; loudnorm −16 LUFS full-film standard.

## Delivery (per engine)
`wow-signal-<engine>.mp4` + `wow-signal-<engine>-poster.jpg`; identical closing card
and credits. Validation per directive §11; comparison per §12; release per §14–15.
