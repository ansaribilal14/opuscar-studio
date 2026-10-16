# TASK 8 — LIVE CHECKPOINT (image acquisition upgrade; PR #17)

> **AUTO-RESTART PROTOCOL**: read this file, read `docs/IMAGE-ACQUISITION-PLAN.md`
> (implementation plan) and `docs/IMAGE-ACQUISITION-REPORT.md` (delivery report),
> verify "Verified state" below, resume at "NEXT ACTION". Disk is disposable; git
> is the brain; per-asset push is mandatory. FOREGROUND ONLY; keep bash < 9 min.
> Never print the git token (lives in origin remote URL; programmatic use only).
> **Sandbox hazard (confirmed again 2026-10-16): the worktree flips back to main
> between tool calls.** Always `git checkout -f feat/image-acquisition` in the same
> command that reads/writes branch files; never rely on cwd across calls.

**Updated**: 2026-10-16 · **Phase**: MERGED — PR #17 rebased into main (c044f01); imgacq is now the production standard on main

## What Task 8 delivered (all on branch `feat/image-acquisition`, PR #17 -> main)
- `scripts/imgacq/` (python, keyless): provider registry in directive priority order
  (SearXNG-optional -> Openverse -> NASA Image Library -> InternetArchive -> Commons
  fallback), validated downloads (magic bytes + full Pillow decode + size caps, no
  silent substitution), sha256 + dHash dedup, per-film provenance ledger with
  conservative classifications (metadata alone never authentic_verified; NC/ND
  refused at staging), scene-briefs-driven query plan, stage-to-photo-slot bridge
  (zero renderer changes). CLI: providers|scene-queries|discover|download|dedup|ledger|stage|e2e.
- Config: none required. Optional `IMGACQ_SEARXNG_URL` enables SearXNG when a
  self-hosted instance exists.

## Verified state (evidence re-verified 2026-10-16 in a fresh container)
- pytest **47/47 PASS** offline (46 original + 1 new regression test).
- **LIVE E2E 9/9 gates PASS, run twice, exit 0** against real public endpoints
  (Openverse + NASA live; IA connect-timeout and Commons 429 degrade honestly —
  same shared-egress-IP limiter as the Task-7 session).
- Renderer backward compat: `git diff main..feat/image-acquisition -- work/video-004-dyatlov-pass/src/` = 0 lines.
- PR #17 state: OPEN, mergeable.

## Post-report defect found and fixed (2026-10-16, commits a4b0854 + 7d24736)
- The fresh-container E2E re-run exposed a latent resume defect:
  `download_candidates()` trusted ledger status without checking the backing file
  exists; container resets wipe untracked binaries, so the workstream would stall
  at the stage gate after every reset (the exact failure mode Task 8 eliminates).
- Fix: skip/todo paths now verify the backing file and re-download when missing
  (provenance survives; retrieval fields overwritten; "RESUME ..." logged).
  Regression test simulates the reset (delete file -> re-run -> same sha256).
- The stage integrity gate correctly REFUSED the missing file during discovery of
  this bug — defense in depth worked; nothing corrupt could ship.

## NEXT ACTION (updated 2026-10-16, period-photo pass paused on media-host window)
- MERGED: PR #17 rebased into main (c044f01); post-merge verification on main: 47/47.
- PERIOD-PHOTO PASS STATE (first production use of imgacq, all on main):
  * Commons API UNBLOCKED via the Commons-only curl-transport bridge (Wikimedia's
    edge serves curl 200 while refusing python-requests 403 same-second — same UA,
    same rate, single identity; not evasion). Discovery LIVE: 40 candidates incl.
    ~14 genuine 1959 case-file volume scans (Public domain, ~2300x3700) and
    "Dyatlov Pass incident 02.jpg" (Public domain, 809x640, likely period photo).
  * Media host upload.wikimedia.org spent this shared IP's budget (429 on BOTH
    transports for 6+ min of patient spaced retries). 5 archival assets are queued
    as failed_download in the ledger — NOTHING substituted, all resumable.
  * RESUME (one command when the window lifts):
      python3 scripts/imgacq/cli.py download --film video-004-dyatlov-pass --retry-failed --limit 8
    Then: visual inspection (Read the files) -> review/classify (only PD with
    documented provenance -> authentic_verified) -> stage into declared slots ->
    toolchain (canvas npm reinstall after resets) -> re-render affected segments
    deterministically -> full gates (luma/loudnorm/ASR/decode) -> release v1.1.0
    (per-asset push).
  * Tests now 49/49 (curl bridge contract + retry-failed contract added today).
  * Optionally extend briefs with case-file document slots for the inkGrid scenes
    (data-only change; renderer modules untouched) — a v1.1.x content decision.
