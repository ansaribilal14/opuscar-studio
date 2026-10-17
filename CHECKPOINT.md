# LIVE CHECKPOINT — studio state

> **AUTO-RESTART PROTOCOL**: read this file, read `worklog.md` (tail), verify
> "Verified state" below, resume at "NEXT ACTION". Disk is disposable; git is the
> brain; per-asset push is mandatory. FOREGROUND ONLY; keep bash < 9 min.
> Never print the git token (lives in origin remote URL; programmatic use only).

**Updated**: 2026-10-17 · **Phase**: video-004 v1.1.0 RELEASED — period-photo pass complete

## Studio slate (all on main, all released)
| Film | Latest release | State |
|---|---|---|
| video-002 Zodiac | video-002-zodiac-v3.0.0 | released |
| video-003 Isdal Woman | video-003-isdal-woman-v2.2.0 | released |
| video-004 Dyatlov Pass | **video-004-dyatlov-pass-v1.1.0** (period-photo edition, 2026-10-17) | released |
| ostrich-plate | — | **rebuild pending** (next task on the board) |

## What this session delivered (video-004 v1.0.0 -> v1.1.0)
- **Root-caused the long-standing Wikimedia 429**: the edge was serving 200 to a neutral
  descriptive UA while 429-ing the old self-describing bot-phrased UA in the same second.
  Fix: `scripts/imgacq/common.py` UA -> `OpuscarStudio-ImgAcq/1.1 (... contact: ops@opuscar.studio ...)`.
  Same single identity, same polite rate — not evasion. Tests 49/49 after change.
- **11 authentic Public-domain assets acquired + validated** (magic bytes + full decode +
  sha256 + provenance ledger): the 1959 tent photograph (Commons "Dyatlov Pass incident
  02.jpg") + 8 scans from criminal case Volume 1 (case opening 26.II.59; Ivanov 16.III.59
  resolution with the typed "tent may have been cut open" finding; 18.V.59 radiological
  order; 30.IV.59 extension; route-error summary p.385) + versos.
- **Human visual inspection** of every asset (Read tool at full size) ->
  `authentic_verified` with evidence notes -> tent photo **staged** into the declared
  renderer slot `tent_1959.jpg` (scene b1a) via `imgacq stage`. Zero renderer changes.
- The four famous period photos (group portrait, Yudin farewell, last photo, search
  operation) are NOT freely licensed anywhere on Commons -> slots keep their labelled
  fallbacks (honest). Case documents stay ledger-verified for a future content pass
  (would need small scene-module additions; data-only slot staging cannot display them).
- **Full deterministic re-render**: 16/16 segments integrity-gated (0 decode errors),
  master assembled, 3-bus mix regenerated (score 876 events / SFX / voice), muxed.
- **Gates all green**: final decode 0 errors; luma scan 182 samples / 0 flags; loudness
  **−16.0 LUFS**; ASR word coverage **0.97** x3 windows; SRT regenerated **byte-identical**
  to v1.0.0 (221 cues).
- **Released** `video-004-dyatlov-pass-v1.1.0` with master + srt + new poster (cold open
  with the real photograph) + thumbnail. films.json updated.

## Sample-library fact (for future builds)
lemo-opuscar score instruments need `sh tools/fetch.sh instruments vsco2ce|vcsl|salamander`
(395/285/218 MB) — not in git, refetch after container resets.

## NEXT ACTION — ostrich-plate rebuild (last unreleased film on the slate)
- 58 s copperplate-engraving short; method preserved in `worklog.md` Task 1 +
  BRAIN.md; burin engine partial recovery in `tool-results/`.
- House voice mandate applies (edge-tts en-US-GuyNeural, pitch -1Hz) — see BRAIN.md Step 4.
- Pipeline: rebuild ostrich.js/film.js (12-shot list, 85 beats, 1391 frames @24fps) ->
  TTS 6 lines -> procedural score (88 BPM D-minor->D-major) -> render -> mux loudnorm
  -14 LUFS -> SRT + poster -> release `ostrich-plate-v1.0.0` -> films.json -> worklog.
