# TASK 6 — LIVE CHECKPOINT (Zodiac visual quality recovery → v3.0.0)

> **AUTO-RESTART PROTOCOL**: This file is the durable brain. It is updated and PUSHED
> after every completed step. Any new session: (1) read this file, (2) read
> `docs/REGRESSION-2026-10-14.md`, (3) verify "Verified state" below, (4) resume at
> "NEXT ACTION". Disk is disposable; git is the brain; per-asset push is mandatory.

**Updated**: 2026-10-14 ~14:30 UTC · **Phase**: RECOVERY COMPLETE → ENGINE REBUILD

## Environment rules (learned the hard way — obey)
- Container resets wipe untracked files + node_modules + big builds. Push after EVERY step.
- Background/detached jobs get killed by the sandbox and can damage files. FOREGROUND ONLY.
- Keep every bash command < 9 min (tool cap 10 min). Chunk renders per segment.
- Use absolute paths; never rely on shell cwd (persistent-shell cwd quirk burned us once).
- Never print the git token (it lives in origin remote URL; use programmatically only).
- Renderer is DETERMINISTIC: same sources → same frames. Re-rendering after a reset is safe.
- Success = frames actually VIEWED (Read tool on stills/sheets), never "render exited 0".

## Verified state (checked 2026-10-14)
- Repo checkout at /home/z/my-project, HEAD = origin/main = `96ede7d` (task 6 kickoff).
- Token auth live (in remote URL). `git push` tested this session.
- Toolchain: node v24 + canvas OK, ffmpeg 7.1, python3.12 + PIL + numpy OK.
- Zodiac project intact: work/video-002-zodiac/{src,audio(80M),images(9.6M)}.
- Issues #11–#16 open on GitHub (regression tracking).

## Lost in container reset (must rebuild)
- v4 composition engine + scene briefs + v4 scene modules + v4 dispatcher (were local-only)
- Proof renders (proof_base_actual/A/B/C), master download (494MB), v4 contact sheets
→ All rebuildable deterministically from git sources. Do NOT shortcut QA to save time.

## Pipeline (directive §1–§12, from task-6-main.md)
- [x] Phase 1: regression report (6 root causes) + directive archived + qc_stills.mjs
- [x] Phase 1.5: container-reset recovery, toolchain, checkpoint system (this file)
- [x] Phase 2: v4 engine REBUILT (comp_modes.mjs, scene_briefs.json, scenes_z1/z2/z3v4.mjs,
      dispatcher flipped, smoke 37/37) — commit b004710
- [x] Phase 3: v4 QC sheets reviewed at sheet + full size; fixes applied (creditBR overflow,
      b0a band, typewriter_keys REJECTED watermarked → press_room close, b8c atmospheric) — 2368b0d
- [x] Phase 4: proof benchmark base/A/B/C rendered+reviewed from ENCODED output; C SELECTED;
      verdict archived (docs/BENCHMARK-2026-10-14.md + docs/proof/) — 50d6b47
- [x] Phase 4.5: audio chain regenerated (score/sfx/mix deterministic) for mux + proof audio
- [ ] Phase 5: luma gate on v4 stills; then FULL RE-RENDER 12 segments (build_seg.sh, src==HEAD guard)
- [ ] Phase 6: assemble master (build_finish.sh), poster
- [ ] Phase 7: QC (ffprobe/loudnorm/ASR spot/luma + contact sheets VIEWED + 10-point review)
- [ ] Phase 8: release v3.0.0 (master+srt+poster), films.json, worklog, final push

## NEXT ACTION
Phase 5: run luma gate (scan build/qc_v4 frames for voids), then render segments:
`cd work/video-002-zodiac && bash build_seg.sh 0 12` … `bash build_seg.sh 11 12`
(one segment per bash call, foreground, ~4 min each; src must equal git HEAD).

## Gotchas
- build_seg.sh had a stale absolute path (repo moved one level deeper) — fix before full render.
- `news_press.jpg` (Australian Telegraph) must NOT appear in the opening (wrong continent/decade).
-Cipher cards must be legible (v2 failure: beige boxes at low contrast).
- v2 b5c amber-on-white and b2b sub-line contrast fixes: band helper renders BEFORE text.
