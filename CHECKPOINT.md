# LIVE CHECKPOINT — studio state

> **AUTO-RESTART PROTOCOL**: read this file, read `worklog.md` (tail), verify
> "Verified state" below, resume at "NEXT ACTION". Disk is disposable; git is the
> brain; per-asset push is mandatory. FOREGROUND ONLY; keep bash < 9 min.
> Never print the git token (lives in origin remote URL; programmatic use only).

**Updated**: 2026-10-17 · **Phase**: SLATE COMPLETE — all four films released

## Studio slate (all on main, all released)
| Film | Latest release | State |
|---|---|---|
| video-002 Zodiac | video-002-zodiac-v3.0.0 | released |
| video-003 Isdal Woman | video-003-isdal-woman-v2.2.0 | released |
| video-004 Dyatlov Pass | video-004-dyatlov-pass-v1.1.0 (period-photo edition) | released |
| ostrich-plate | **ostrich-plate-v1.0.0** (2026-10-17 rebuild) | released |

## What this session delivered (2026-10-17, "build the final videos")
1. **video-004 v1.1.0** — the paused period-photo pass resumed and harvested:
   - Root cause of the long-standing Wikimedia 429: the edge serves 200 to a neutral
     descriptive UA while 429-ing the old self-described bot-phrased UA same-second.
     `scripts/imgacq/common.py` UA -> ImgAcq/1.1 with contact line (49/49 tests green).
   - 11 authentic PD assets acquired + human-verified (tent photograph + 8 case-volume
     scans incl. the 16.III.59 "tent may have been cut open" resolution); tent photo
     STAGED into the declared renderer slot (scene b1a, zero renderer changes).
   - Full deterministic re-render (16/16 segments, 0 decode errors), gates green
     (−16.0 LUFS, ASR 0.97 ×3, luma 0 flags, SRT byte-identical), released.
2. **ostrich-plate v1.0.0** — the lost first film rebuilt from its preserved method:
   - Subject authored on the burin engine; 4 magnified roundels; 88 BPM score in code
     (Dm -> D major at the wash; all cues verified ±1 frame); house edge-tts narration;
     3-layer mix; 1505-frame render; master 62.7s @ −13.8 LUFS, 0 decode errors.
   - ASR gate PASS (0.83–1.00 ×6); cuecheck 0 mismatches; poster from the finished plate.

## Environment facts (relearned this session, do not relearn the hard way)
- Sample libraries are NOT in git: `sh tools/fetch.sh instruments vsco2ce|vcsl|salamander`
  from the lemo-opuscar root (395/285/218 MB) before any core.audio score.
- playwright-core pins a chromium build newer than the cache: launch with
  `PLAYWRIGHT_CHROME=/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome`.
- Out-of-library film workspaces (work/<film>/) are served at /@film/ and may import
  /core/... from the library root.
- Wikimedia media host: neutral descriptive UA + contact works; the old UA string is
  blocked. imgacq 1.1 handles it.

## NEXT ACTION — no open production task
The slate is complete. Candidate next moves (operator's call):
- video-001 remains unassigned (ID reserved).
- v1.1.x content options for video-004: stage the 8 verified case-document scans
  (would need small scene-module additions — data alone cannot display them).
- ostrich-plate verticals (4 shorts from the plate's beats) if a platform push is wanted.
