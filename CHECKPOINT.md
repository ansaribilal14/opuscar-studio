# LIVE CHECKPOINT — studio state

> **AUTO-RESTART PROTOCOL**: read this file, read `worklog.md` (tail), verify
> "Verified state" below, resume at "NEXT ACTION". Disk is disposable; git is the
> brain; per-asset push is mandatory. FOREGROUND ONLY; keep bash < 9 min.
> Never print the git token (lives in origin remote URL; programmatic use only).

**Updated**: 2026-10-25 · **Phase**: SHOOTOUT v2.0.0 DELIVERED (PAPER & SKY rebuild)

## Current task state (branch feat/render-engine-shootout)
- Operator rejected all three v1 shootout films → QA triage (docs/QA-V1-REJECTION.md)
  → "PAPER & SKY" v2 brief → all three engines rebuilt + re-rendered → RELEASED
  render-engine-shootout-v2.0.0 (10/10 assets remote-verified).
- Gates: §11 matrix 13/13 x3; v2 coverage 0.75-0.79, 0 void frames, type >=34 px.
- Issue #21 reopened with the v2 delivery comment; owner review pending.

## Verified state
- Release: https://github.com/ansaribilal14/opuscar-studio/releases/tag/render-engine-shootout-v2.0.0
- Branch head: see `git log -1` on feat/render-engine-shootout (worklog 12-b final).
- Masters also on disk: work/render-engine-shootout/wow-signal/engines/{opuscar,hyperframes,hypit}/out/.

## Environment facts (relearned, do not relearn the hard way)
- Sandbox kills detached background processes between bash calls; foreground only,
  bash <= ~9.5 min. hyperframes: run TWO renders in parallel (1 worker each) per call.
- hypit: build via daemon parts (survives CLI detach; poll `hypit status <id>`).
- hyperframes tween tuples: NEVER flat(2) (dissolves tuples) — shape-aware flatten.
- hypit SVML: Frame left/top/right/bottom are EDGE coords; one unique window per clip;
  captions fit=contain; export target must not pre-exist (`rm` before `hypit get`).
- hyperframes: pin 0.8.171; GSAP inline; composition paths relative to project root.

## NEXT ACTION
- Owner reviews the three films and picks the engine (directive: no auto-pick).
- video-001 still unassigned. Zodiac full film not started (v3.0.0 trailer only).
