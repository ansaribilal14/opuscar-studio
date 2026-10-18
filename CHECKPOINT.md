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

---

## ACTIVE TASK — RENDER-ENGINE SHOOTOUT (2026-10-18, parent issue #21)

**Branch**: `feat/render-engine-shootout` · **Base**: main @ e1f8145
**Project dir**: `work/render-engine-shootout/wow-signal/` (BRIEF.md committed)
**Issues**: #21 parent · #22 audit · #23 research · #24 script/storyboard · #25 assets
· #26 narration/audio · #27 Opuscar · #28 HyperFrames · #29 Hypit · #30 validation
· #31 comparison · #32 release
**Target**: three independent ~10-min renders of THE WOW! SIGNAL doc + release
`render-engine-shootout-v1.0.0` (draft until final).
**Spec**: 10:00 (9:59–10:01) · 1920×1080 · 30 fps · H.264 yuv420p · AAC stereo · shared
narration (edge-tts Andrew −3%) + identical SRT + shared assets.
**Guardrails**: production renderer/defaults untouched; PR #20 (code-title-cards) left
for operator; no engine cross-crediting; honest failure reporting.

### SESSION-RECOVERY UPDATE (2026-10-18, shootout session)
- INCIDENT: the known worktree-flipper checked out main between command blocks; two
  shootout scaffold commits (70b28b8, 1318a02) landed on main and were pushed.
  REPAIR: commits preserved on feat/render-engine-shootout (ff-pushed), origin/main
  force-restored to exact pre-accident e1f8145 with --force-with-lease. No other work
  existed on either commit. Incident + repair recorded here and in worklog.
- NEW WORKING CONVENTION (directive §1.1.4 "isolated worktree or clone"): all shootout
  work happens in `/home/z/my-project/shootout-clone` (shared-object clone, checkout
  pinned to feat/render-engine-shootout, verified flip-immune across command blocks).
  The main working tree at /home/z/my-project stays on main and is left alone.
- Background installs done this session: edge-tts (venv pip), lemo-opuscar
  node_modules (playwright-core+three). Chromium 1200 cache present.
- Engine audit clones go to /home/z/my-project/refs-shootout/ (outside both trees).

### SHOOTOUT STATE (updated 2026-10-18 late session — READ THIS FIRST)
**Issues closed with evidence:** #22 (audit), #23 (research), #24 (script/storyboard/timeline),
#25 (assets), #26 (narration/audio), #27 (Opuscar DONE), #28 (HyperFrames DONE).
**Remaining:** #29 Hypit implementation (STARTED — smoke passed earlier; full film next),
#30 validation matrix, #31 comparison report, #32 release. Plus directive §16 recovery drill.
**Deliverables on disk (local clone /home/z/my-project/shootout-clone, branch
feat/render-engine-shootout):**
- engines/opuscar/out/wow-signal-opuscar.mp4 (600.000s, 18000f, gates green, −16.0 LUFS)
- engines/hyperframes/out/wow-signal-hyperframes.mp4 (600.03s, 18000f, gates green)
- engines/hypit/ — smoke project proven at /home/z/my-project/smoke/hypit-smoke (MP4 OK);
  full film NOT yet authored. Component SDK (@hypit/composition 0.1.0 etc.) IS on npm.
**Engine renders use per-segment foreground commands (sandbox kills bg jobs at command
end; renders 60–95s per segment fit the 9-min bash limit; do NOT nohup).**
**Key facts:** narration master = shared/audio/narration_program.wav (600.0s, −16 LUFS);
frozen spec = TIMELINE.json/RENDER_SPEC.json; SRT 149 cues; 2 PD printout scans staged
(assets/printout_close.jpg, printout_page.jpg). Renders dir per engine = build/ + out/
(OUT OF GIT, too big — release assets only). Hypit runtime browser cached at
~/.cache/hypit/html-rasterizer; HF chrome at ~/.cache/puppeteer.

### SHOOTOUT FINAL STATE (2026-10-18 ~21:00) — ALL CHILD ISSUES CLOSED
- **RELEASE PUBLISHED + VERIFIED**: https://github.com/ansaribilal14/opuscar-studio/releases/tag/render-engine-shootout-v1.0.0
  tag → d36774b · 10 assets (3 mp4 + 3 posters + contact sheet + report + results + checksums) verified via API.
- Issues #22-#32 all CLOSED with evidence comments. Parent #21 ready to close (acceptance criteria met).
- Masters (local only, in shootout-clone): engines/{opuscar,hyperframes,hypit}/out/wow-signal-<engine>.mp4 — all 13/13 gates, byte-identical determinism measured.
- Hypit full build id: bld_20261018T185843073Z_86A50CAE4C (result repo in engines/hypit/.hypit/, local).
- Recovery: fresh clone of feat/render-engine-shootout contains all editorial+engine sources; masters re-obtainable from the Release; Hypit re-render = `cd engines/hypit && cp ../../shared/audio/narration_program.wav ../../shared/assets/*.jpg assets/ && cp ../../shared/audio/blocks assets/blocks/ -r && hypit runtime use ./hypit.runtime.json && hypit build runs/final.svrun --follow` (runtime profile has 90-min timeout).
- NEXT ACTION: none mandatory. Optional follow-ups: Hypit component-package upgrade (code-drawn scenes); PR feat/render-engine-shootout → main is the OPERATOR's call (per directive §17: do not merge to production automatically).
