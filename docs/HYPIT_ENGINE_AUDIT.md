# HYPIT_ENGINE_AUDIT.md — pre-implementation gate for Code Title Cards

Issue: #18 (audit) · feeds #19 (`code-title-cards`). Date: 2026-10-18 (UTC+8 session).
Method: shallow clone of `hypit-ai/hypit` @ HEAD (v0.3.1, cloned 2026-10-18), direct source
inspection. No credentials sent, no paid services, no Hypit toolchain installed.

## 1. What Hypit actually is (from source)

- **Agent skill + TypeScript pnpm monorepo** (`packageManager: pnpm@10.33.0`, `engines.node >=22.15.0`, `.node-version` 24.14.1): **86 packages** under `packages/` — `compiler`, `composition`, `executor`, `runtime-local`, `browser-capture`, `html-video`, `caption`, `caption-fine`, `fontsource`, `generation`, plus connectors (`gpt-image`, `grok-imagine`, `elevenlabs-speech`, `fishaudio-speech`, …).
- **SVML markup**: videos are authored as SVML documents, compiled and executed by its runtime; timing is anchored to **words** (WhisperX alignment), not seconds.
- **Rendering**: headless-browser capture (`packages/browser-capture/src/index.ts` wraps a Playwright `Page.screenshot` behind `ScreenshotCaptureOptions`); FFmpeg-based media ops (`media-operations`, `runtime-local`); its showcase renders run "in 64 headless Chromium processes".
- **Purpose-built for viral-video cloning/variants**: swap host/topic/language, 100 variants per run, AI footage/image/voice generation connectors (HypiHub hosted service or own keys).

## 2. Relevant capabilities vs the actual Opuscar engine

| Capability | Hypit (source) | Opuscar today (vendored `lemo-opuscar/`) | Materially better? |
|---|---|---|---|
| Code-rendered motion graphics, no paid generation | SVML → compiler → browser capture | `styles/*/demo` pages, `window.render(t)` Canvas2D/WebGL | No — different authoring language, same browser primitives |
| Deterministic frame rendering | Compile-level property mapping is deterministic ("deterministically to no decoration or motion", tracks.md); **no per-frame pure `render(t)` pixel contract**; generation is explicitly non-deterministic (Candidate caching, run.md) | **Contract**: `render(t)` depends only on `t` + immutable inputs; any frame in any order by any worker (TECHNIQUE.md §2) | No — Opuscar's contract is stronger and required by this task |
| Still-frame preview + final-video inspection | screenshots via browser-capture; run reports | `core/render/still.mjs`, `sheet.py` contact sheets, ffprobe/full-decode gates | No |
| Typography measurement / text boxes | `caption-fine` (spacing, schedule, fragments) — karaoke captions inside its runtime | Canvas2D `measureText` in-page; `window.TEXTS(t)` + `core/render/readcheck.mjs` reading-time check | No — readcheck is exactly what the task mandates |
| Word-aligned captions + A/V sync | WhisperX word anchoring (needs model/service) | edge-tts WordBoundary events + word-timed SRT (production since video-002) | No; and silent style needs neither |
| Reusable components/templates/config | SVML + component packages + variants | `styles/<slug>/` + `style.json` catalog + `content.json` scene styles | No |
| Build reproducibility/caching/validation | Runtime Profiles, result repository | Deterministic re-render proven on three released films; per-segment integrity gates | No |
| Browser stack | Puppeteer-oriented (`.puppeteerrc.cjs`), own capture pkg | Playwright (`core/render/page.mjs`), pinned cached Chromium | Duplicate — would be a second browser harness |
| FFmpeg orchestration | `media-operations` + `runtime-local` | `core/render/video.mjs` streaming JPEG→x264 + concat; `mux.sh` | Duplicate — forbidden by task |
| Runtime | Node >=22.15.0 (works on this container's Node v24.21.0; studio **benchmark documents Node 20**) | Node >=20 | Gate passes locally but adds a version floor above the documented benchmark |

## 3. License and deployment implications (LICENSE @ v0.3.1)

Modified Apache-2.0 with additional conditions:
1. **No multi-tenant service** without written authorization (one tenant = one workspace).
2. **No commercial redistribution** without authorization: may not "sell, license for a fee, or otherwise supply for commercial gain Hypit or any derivative work … as a component of, or bundled with, any product" — forking/publishing allowed only under the same license and not for gain.
3. **Logo/copyright preservation** in the CLI, generated run reports/manifests, and "any user-facing surface derived from them".
4. Output ownership is unambiguous (ours) — that part is clean.

Implications for Opuscar Studio: the repo is MIT, public, and releases watermark-free films; condition 3 directly conflicts with the studio's "no watermark on any film" convention if Hypit produced user-facing output; condition 2 makes future bundling/re-distribution constrained. None of this blocks *running* Hypit for our own work — but every point cuts against integrating it into a MIT style library.

## 4. Options comparison

| Option | Verdict |
|---|---|
| **A. Reuse existing engine** | Everything the title-card task needs already exists and is release-proven: page contract, deterministic renderer, stills, readcheck, catalog, FFmpeg streaming. Zero new dependencies. |
| B. Optional isolated integration (adapter) | Would import an 86-package pnpm monorepo + Puppeteer config + its own FFmpeg layer to do what `core/render/` already does; adds a second browser stack (explicitly forbidden by the task), a Node ≥22.15 floor, and license conditions incompatible with the no-watermark, MIT-repo model. |
| C. Defer | Subsumed by A for this task: no capability gap was found to defer. |

## 5. Prototype?

Not warranted: a meaningful prototype requires installing the Hypit toolchain (pnpm workspace, 86 packages, its own browser download) — an unnecessary service install explicitly excluded by the gate — to compare against an engine that already satisfies every requirement of the task with released evidence (video-002 v3.0.0, video-003 v2.2.0, video-004 v1.1.0, ostrich-plate v1.0.0).

## 6. Decision

**A — REUSE THE EXISTING ENGINE.** Hypit offers no material advantage for deterministic, silent, typography-only title cards; its strengths (video cloning, AI generation connectors, word-anchored karaoke captions, variant farming) target a different problem, at the cost of a duplicated rendering stack and restrictive license conditions. The existing shared engine remains authoritative. Revisit only if the studio ever needs word-anchored AI-UGC variant production; that would be a separately-versioned, isolated adapter (option B) with operator sign-off on the license conditions.
