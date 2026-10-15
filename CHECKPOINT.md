# TASK 7 — LIVE CHECKPOINT (video-004: Dyatlov Pass, The Unclosed File)

> **AUTO-RESTART PROTOCOL**: This file is the durable brain. It is updated and PUSHED
> after every completed step. Any new session: (1) read this file, (2) read
> `work/video-004-dyatlov-pass/task-7-main.md` (operator directive, verbatim), (3)
> verify "Verified state" below, (4) resume at "NEXT ACTION". Disk is disposable;
> git is the brain; per-asset push is mandatory.

**Updated**: 2026-10-15 · **Phase**: KICKOFF (post-Zodiac v3.0.0)

## Environment rules (learned the hard way — obey)
- Container resets wipe untracked files + node_modules + big builds. Push after EVERY step.
- Background/detached jobs get killed by the sandbox and can damage files. FOREGROUND ONLY.
- Keep every bash command < 9 min (tool cap 10 min). Chunk renders per segment.
- Use absolute paths; never rely on shell cwd (persistent-shell cwd quirk burned us once).
- Never print the git token (it lives in origin remote URL; use programmatically only).
- Renderer is DETERMINISTIC: same sources → same frames. Re-rendering after a reset is safe.
- Success = frames actually VIEWED (Read tool on stills/sheets), never "render exited 0".

## Film spec (from directive, verbatim in task-7-main.md)
- **Film ID**: `video-004-dyatlov-pass` · Release tag: `video-004-dyatlov-pass-v1.0.0`
- **Title**: "Dyatlov Pass: What Really Happened to the Nine Hikers?" (recommended;
  alternatives in directive §1 for release-notes A/B testing)
- **Channel**: The Unclosed File — black / archival beige / crimson identity (unchanged)
- **Length**: 15–18 min full film, English, 1080p24 · **Shorts: NOT requested — full film only**
- **Narrative spine**: 0:00 hook (abandoned tent) / 2:00 context (nine hikers) /
  5:00 evidence (search + autopsies) / 8:00 theories vs evidence / 12:00 science
  (2021 model + 2022 follow-up) / 15:00 honest conclusion
- **Thumbnail**: tent focal, mountain behind, crimson evidence marker, text
  "WHY DID THEY LEAVE?", no graphic imagery, no invented-reconstruction-as-1959-photo
- **Asset law**: every download gets URL + creator + date + source page + licence +
  intended scene in the manifest; unclear licence ⇒ do not use (use labelled
  reconstructions / animated maps instead); never present generated imagery as archival
- **Science framing**: 2021/2022 Gaume–Puzrin papers are a testable explanation, not
  proof; no invented quotes/documents/weather/forensics

## Engine rules (carried from Zodiac v3.0.0 — production behavior now)
- v4 image-first composition: full-bleed photo anchors, sat lift, capped scrims,
  inkGrid for documents, contrast bands before text, creditBR with dark chip
- scene_briefs JSON = narration-visual contract for EVERY block; cut/dissolve grammar
- Every image visually inspected before use (watermark/license/mislabel checks caught 2 in v3)
- Gates: luma (no voids), loudnorm −16 LUFS, ASR word-coverage ≥0.85, 0 decode errors,
  6×15-frame encoded-output contact sheets, 10-question editorial review ALL PASS
- House voice: edge-tts `en-US-AndrewMultilingualNeural` rate −3% (BRAIN.md §4),
  WordBoundary events per block → word-timed SRT
- ffmpeg always `-nostdin`, stdin `< /dev/null`; fonts: DejaVu Serif/Carlito/DejaVuSansMono

## Verified state (checked 2026-10-15)
- Repo at /home/z/my-project, HEAD = origin/main = `04d85f7` (task 6 complete state).
- Zodiac v4 sources recovered in work/video-002-zodiac/ (engine template for this film).
- Toolchain: node v24, ffmpeg 7.1.5, python3.12, scipy/soundfile OK. **canvas NOT yet
  installed** (reset) — install into work/video-004-dyatlov-pass. edge-tts NOT yet installed.
- Disk 9.9G total, 8.5G free — sufficient for ~16 min master + segments.

## Pipeline (mirrors BRAIN.md §2 + Zodiac task-6 flow)
- [x] 7-a Setup: directive archived (task-7-main.md), checkpoint live
- [x] 7-b Toolchain: canvas, edge-tts Andrew voice, VSCO2/VCSL/Salamander re-fetched
- [x] 7-c Research: SOURCES.md + CLAIMS.md + TIMELINE.md; 2021/2022 DOIs Crossref-locked
- [x] 7-d Assets: SRTM terrain plates (Mapzen/AWS, CC-BY) — route z10 + campsite z13 +
      slope map; Commons THROTTLED at gateway (retry periodically); film built
      reconstruction-first with photo slots that auto-activate if assets land
- [x] 7-e Narration: 42 voice blocks + 2 cards, edge-tts Andrew −3%, 798.4s, WordBoundary
- [x] 7-f Timeline 909.7s = 15:10 (21,833 frames) + scene_briefs.json (44 briefs)
- [x] 7-g Scenes d1/d2/d3 v4 + support.mjs + terrain_d.mjs + dispatcher; 104-frame QC
      sheet review + editorial fixes (memorial column, dawn floor, push-in, collisions)
- [x] 7-h Audio: score (10-cue arc) + SFX (blizzard/rips/whumpf) + 3-bus mix
- [x] 7-i Render: 16 segments all VERIFIED (0 decode errors); master assembled
      build/dyatlov-pass-004.mp4 — 909.65s, 275MB, faststart, AAC 192k, 0 decode errors
- [x] 7-j QC gates: loudness −16.1 LUFS / TP −1.5 PASS; ASR 0.97/0.97/0.97 PASS;
      luma flags = intentional dark editorial scenes (verified by eye, not voids)
- [ ] 7-j2 Deliver: encoded-output sheets + 10-question review; SRT; thumbnail;
      description + chapters; films.json; release video-004-dyatlov-pass-v1.0.0;
      worklog; checkpoint close

## NEXT ACTION
7-j2 — encoded-output editorial review, SRT, thumbnail, release upload (master verified on disk).

## Gotchas (inherited + new)
- build_seg.sh in Zodiac had corrected ../.. guard paths — verify after copying.
- node_modules lives per-project (work/<film>/package.json) — reinstall after every reset.
- Commons API + image services rate-limit → serial fetch with retries, never parallel bursts.
- Sample libraries (VSCO2/VCSL/Salamander/gran_cassa) live OUTSIDE the repo — re-fetch
  via lemo-opuscar/tools fetch mechanism after resets.
- Dyatlov-specific: NO graphic imagery (directive); autopsy findings stated factually,
  not visually; radiation claims stay within the documented radiologist appendix scope.
