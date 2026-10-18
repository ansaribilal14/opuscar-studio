# LIVE CHECKPOINT — studio state

> **AUTO-RESTART PROTOCOL**: read this file, read `worklog.md` (tail), verify
> "Verified state" below, resume at "NEXT ACTION". Disk is disposable; git is the
> brain; per-asset push is mandatory. FOREGROUND ONLY; keep bash < 9 min.
> Never print the git token (lives in origin remote URL; programmatic use only).

**Updated**: 2026-10-18 · **Phase**: code-title-cards style shipped (PR #20 open); slate complete

## Verified state (all pushed)
- main = origin/main = e1f8145 (ostrich-plate v1.0.0; all four films released).
- feat/code-title-cards @ 65af61d+ : style #55 code-title-cards complete — 32/32 tests,
  film released (code-title-cards-v1.0.0), catalog regenerated, issues #18+#19 closed.
- PR #20 OPEN (merge = operator's call). PR #17 confirmed closed/merged (rebase).
- Deliverables also at download/code-title-cards/ (mp4 + poster + contact sheet).

## Environment facts (do not relearn the hard way)
- PLAYWRIGHT_CHROME=/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome (playwright-core pins newer).
- **Worktree flipper is ACTIVE**: HEAD resets to main between/within commands; checkout -f
  discards modified TRACKED files (untracked survive). Generation + add + commit must be
  ONE atomic command. Verify `git branch --show-current` before every commit.
- gitignore: demo font binaries (ttf/otf/woff/woff2) and demo jpg/pngs are NOT tracked;
  only stills named styleframe.jpg / frame_* / modelsheet* / alt_* / engine* are tracked.
- Existing styles' demos need their (gitignored) fonts fetched once before they render;
  dark-keynote fonts restored 2026-10-18 (Inter/InterTight/JBMono from google/fonts).
- node_modules reinstalled this session (playwright-core@1.64.1 + three). ffmpeg -nostdin + </dev/null always.

## NEXT ACTION — operator's call
- Review + merge PR #20 (feat/code-title-cards → main). Then optionally: video-001
  assignment, v1.1.x case-document pass for video-004, ostrich-plate verticals.
