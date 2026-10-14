# VIDEO_ENGINE_AUDIT.md — five rendering repositories (Phase 2)

> Audited 2026-10-14 from shallow clones in `refs/` (HEAD of each default branch at
> audit time). Facts below are verified from source/README/LICENSE/CHANGELOG files in
> the clones; anything that could not be verified is explicitly marked. Learning-repo
> findings (last-stop-yt-engine, MoneyPrinterTurbo, brag, reelmimic, open-generative-ai)
> live in `refs/audit-learning-repos.md`; this file covers the five rendering engines
> named in the master directive (`task-main.md`).

## 1. Geneva — geneva-render/geneva (v1.5.0)

- **What it is**: a Rust command-line video compositor. Edits are JSON documents
  (`geneva schema` prints the full JSON Schema); titles/graphics are an HTML/CSS
  subset painted **in-process** (taffy layout, cosmic-text) — no browser. Codecs come
  from FFmpeg libraries (or system x264 if present).
- **Verified by execution in our sandbox** (v1.5.0 x86_64-linux binary, 16.6 MB):
  - `validate` reports every problem with file/line + suggested fix (excellent
    agent-facing ergonomics — we exercised it 7 times while authoring the PoC).
  - `render` produced a valid 1920×1080/30 fps H.264 + AAC + mov_text-subs MP4 from a
    12 s documentary PoC scene (see VIDEO_ENGINE_BENCHMARK.md).
  - Subcommands: render, plan (parallel segments), join, farm/worker (distributed),
    frame, probe, convert, resize, trim, concat, overlay, audio, subtitles.
- **Limits (verified)**: no JavaScript inside HTML assets (static markup + CSS only —
  our procedural per-frame canvas scene code cannot run in it); images jpg/png/webp.
- **License**: MIT (LICENSE in repo and in the release tarball). No restrictions on
  commercial use. Self-described AI-authored project, first release ~2026-09 —
  maintenance risk noted.
- **Integration path**: subprocess CLI (binary + JSON timeline). No npm install, no
  browser, no GPU. CPU-only reference renderer.

## 2. OpenFilm — openfilm/openfilm (v0.1.6)

- **What it is**: "the open source AI video agent" — pnpm monorepo (`openfilm`
  package = format + CLI + Studio, plus a desktop app). Rendering mechanism
  (verified from source): headless Chromium via `playwright-core`, screenshot per
  frame, piped to ffmpeg image2pipe with tmix motion blur.
- **Key finding**: its `window.film = { frame(t) }` host protocol (SPEC.md) is
  **exactly our engine's deterministic `render(t)` contract** — conceptually zero
  translation gap. Has a built-in `look` determinism QA gate.
- **Limits**: 0.x draft protocol; own RAM math (3 GB per browser) implies 1 worker on
  our 3 GB sandbox; browser download needed (chromium-headless-shell ~100 MB).
- **License**: MIT (package.json + LICENSE).
- **Integration path**: npm package adapter (`./render`, `./host` exports), or
  subprocess. Not PoC'd end-to-end (browser download budget; see benchmark doc).

## 3. HyperFrames — heygen-com/hyperframes (v0.8.155)

- **What it is**: HeyGen's HTML-native rendering engine. Bun monorepo; chrome-headless-
  shell (Puppeteer) seek-based capture → FFmpeg encode + audio mix. Richest CLI of the
  five (lint/check/snapshot/render with webm/mov/gif/png-seq/hls + `doctor`), plus a
  `@hyperframes/producer` npm API. Determinism contract formally documented; used in
  corporate production (HeyGen, tldraw per ADOPTERS.md).
- **Limits**: heaviest dependency set of the five (puppeteer + sharp + … + Chrome
  download); authoring is HTML+GSAP timelines ≠ our render(t); its `cloud render` is a
  hosted service (excluded by our no-paid-services rule — local render is free).
- **License**: Apache-2.0 (LICENSE).
- **Integration path**: subprocess CLI. Held in reserve (per Phase 4 "smallest
  combination" principle) — revisit only if both PoC candidates disappoint.

## 4. Revideo — redotvideo/revideo (v0.11.0)

- **What it is**: MIT fork of Motion Canvas for programmatic headless rendering:
  puppeteer + vite hosting the MC runtime, bundles a second ffmpeg (@ffmpeg-installer).
  `renderVideo()` API or `revideo serve` HTTP endpoint.
- **Limits (verified from source)**: scenes are **generator functions over a node
  tree** — the farthest idiom from our imperative canvas `render(t)` scenes; adopting
  it means rewriting all scene code. PostHog telemetry ON by default (a disable flag
  exists). No CHANGELOG; snapshot ~3 months old at audit time.
- **License**: MIT.
- **Integration path**: skip — idiom mismatch + rewrite cost (Phase 4 principle:
  "do not migrate the entire project to a new framework merely because it is
  architecturally attractive").

## 5. Motion Canvas — motion-canvas/motion-canvas (v3.17.2)

- **What it is**: the upstream project revideo forked. Generator animations + a
  real-time editor.
- **Verified limit**: **rendering is driven from the editor UI over a websocket→ffmpeg
  bridge — there is no headless CLI or render binary anywhere in the repo.** Not
  usable for unattended agent-driven rendering.
- **License**: MIT. Last release 2024-12-14 (~10 months before audit).
- **Integration path**: skip — no headless path. revideo already exists as its
  maintained headless derivative.

## Comparison table

| Repo | Mechanism | License | Headless CLI | Deps weight | Sandbox fit | Integration path | Verdict |
|---|---|---|---|---|---|---|---|
| geneva | Rust in-process compositor (JSON + HTML/CSS subset) | MIT | ✓ verified | 16 MB binary, zero runtime deps | ✓ verified | subprocess + JSON adapter | **PoC'd — optional provider** |
| openfilm | headless Chromium screenshot → ffmpeg | MIT | code path yes, unproven | playwright-core + browser | risky (3 GB RAM) | npm adapter (frame(t) = our contract) | validated conceptually, not PoC'd |
| hyperframes | Puppeteer seek-capture → FFmpeg | Apache-2.0 | ✓ documented | heaviest | risky | subprocess | hold |
| revideo | puppeteer+vite hosting MC generator scenes | MIT | ✓ documented | puppeteer + 2nd ffmpeg | ok | would need scene rewrites | skip |
| motion-canvas | editor-UI websocket render | MIT | **none** | editor stack | no | none | skip |

## Honest verification limits

- Nothing was executed for openfilm/hyperframes/revideo/motion-canvas (no install, no
  render) — their mechanism descriptions come from reading source, not from running them.
- All clones are depth-1: full commit history, issue trackers, npm registry state were
  not checked; maintenance judgments rest on CHANGELOG/release files and HEAD dates.
- geneva is a ~1-month-old self-declared AI-written project: long-term maintenance is
  the main risk; we adopt it as an **optional, removable provider**, never a dependency
  of the default path.
