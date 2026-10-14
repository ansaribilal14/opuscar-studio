# Renderer Repository Audit — Task 2-a

**Purpose:** evaluate 5 video-rendering repos as potential integrations for the opuscar-studio documentary engine.
**Host context (from worklog.md, Tasks 1–4):** deterministic per-frame `render(t)` scene engine in JS, rendered via node-canvas (~67 ms/frame) or Playwright, frames streamed JPEG→ffmpeg stdin (no PNG intermediates — disk-safe), own scene/timeline JSON+JS format, edge-tts narration, ffmpeg loudnorm mix, segmented 2-parallel renders, burn-in SRT. Sandbox: Linux x64, **nproc=2 observed** (task brief says 4), **3 GB RAM total** (`free -g`), **7.4 GB disk free** at audit time, node v24.21.0, npm 11.19.0, ffmpeg 7.1.5. No GPU. Must keep existing renderer as fallback; no paid services; minimal new deps.

**Method:** read-only audit of local shallow clones (`git log` = 1 commit each — full history, contributor counts and tags beyond HEAD were not available). Nothing was installed, built, or executed. All claims below cite files in the clones.

**Repo sizes on disk:** geneva 50M · openfilm 24M · hyperframes 417M (incl. LFS golden baselines + docs) · revideo 15M · motion-canvas 9.4M.

---

## 1. geneva — `/home/z/my-project/refs/geneva`

### What it is
A **command-line video editor written in Rust**. "Edits are JSON documents; titles and graphics are HTML and CSS, drawn without a browser" (README.md:3). One static binary per platform (Linux x64/arm64, macOS, Windows); codecs come from FFmpeg libraries linked into the binary. Mechanism is a **Rust frame compositor**: JSON → parsed Timeline → validated Composition → per-frame `Renderer::render_into(&Composition, Ratio, &mut Frame)` → encoder (docs/architecture.md). NOT a browser screenshotter — HTML/CSS is parsed and painted by its own engine (`geneva-html` crate: taffy flexbox/block layout, cosmic-text+swash text shaping, docs/architecture.md "Crates" table).

### Determinism & rendering
- "Each frame is computed from its timestamp, so it comes out the same on every render" (README.md:99).
- CPU renderer is the reference; **GPU (wgpu/Vulkan/Metal/DX12) optional and falls back to CPU** — "The GPU is used when there is one, the CPU otherwise" (README.md:99); `--renderer auto` falls back to CPU with a note (architecture.md). Golden tests hold GPU output to CPU within tolerances (architecture.md).
- Smart cut / stream copy: untouched H.264 frames are copied from source rather than re-encoded (README.md:101) — big speed win for overlay-only edits.
- Frames can be output as an **image sequence** (`encode.container: "image-sequence"`, PNG/JPEG per frame, docs/timeline.md:179) — could slot into the host's existing mux pipeline if ever needed.

### Scene/timeline representation (config-first)
- JSON document: `output` (w/h/fps), `assets` map (kinds: `video`, `image`, `audio`, `font`, `subtitle`, `captions`, `html` — docs/timeline.md:240), `layers[]` with `clips[]` (start/duration/fit/transform), `audio[]` tracks, keyframes, masks, blend modes, transitions, HDR→SDR tone-mapping (README.md:99).
- Titles/graphics are **HTML+CSS subset** files (examples/card.html): `@keyframes` played as written; **no JavaScript**; no CSS grid, floats, transitions, static `transform`; `<iframe>`, `<svg>`, `<canvas>`, `<video>` are **not drawn** in markup; markup must be local (no network fetch) (docs/timeline.md:719; README.md:117–119).
- Image assets: **jpg/jpeg/png only** (docs/timeline.md:219). No SVG/webp/gif asset decoding (the `image` crate is pulled with only `png,jpeg` features — Cargo.toml:42).
- Published JSON schema (schema/geneva-timeline-1.0.schema.json, -1.1).

### Input support
Video (mp4/mov/mkv/webm/mxf), images (jpg/png), audio (wav/m4a/mp3/flac/ogg), fonts as assets, **subtitles: `.srt`, `.vtt`, and Whisper-format word JSON** with word-by-word caption rendering (docs/timeline.md:426–445; examples/lower-third.json). Audio mix with **BS.1770-4 loudness target (`audio.loudness.target_lufs`, e.g. −14/−16) and true-peak limiting built in** (docs/timeline.md:176–177) — overlaps the host's separate loudnorm step.

### Headless CLI (exact commands, docs/cli.md)
```sh
geneva validate <timeline> [--probe]
geneva frame <timeline> -o still.png --at 1.5s
geneva render <timeline> -o out.mp4 [--frames START..END] [--audio-only] [--rendition NAME]
geneva join           # stitch parts without re-encode
geneva farm / geneva worker   # distributed render over SSH/containers/Lambda
geneva trim|concat|convert|subtitles --burn talk.srt|probe <media>   # verbs
```
Automation contract (docs/agents.md): `--format json` everywhere (one JSON report on stdout), JSON progress lines on stderr, `geneva guide` prints the manual from the binary, `geneva explain E302` explains diagnostics, exit codes 0/1/2/3, "Deterministic. The same timeline, assets and version produce the same frames, so results can be cached by input hash." `--threads N`, `--memory-budget SIZE` give resource control. `render --frames START..END` + `geneva join` exactly mirrors the host's segmented render+concat approach (CHANGELOG 1.5.0).

### License
**MIT** (LICENSE: "Copyright (c) 2026 Francesco Benetti"). Bundled OpenH264; x264 NOT bundled because GPL (README.md:25) — optional system lib. THIRD-PARTY-NOTICES.md lists bundled libs. Commercial use: no restrictions.

### Maintenance
- Version **1.5.0**, dated **2026-10-13** (CHANGELOG.md:9; git HEAD `40848a1` "Version 1.5.0", tag v1.5.0).
- Changelog cadence extremely fast: 0.3.2 (2026-09-12) → 1.0.0 (2026-09-25) → 1.5.0 (2026-10-13); ~20 releases in a month. **Young project (~1 month of public releases), single named author**, and self-declared: "The code, tests and docs were written almost entirely by AI models (Fable and Opus)" (README.md:180). Shallow clone — commit history/contributors not verifiable.

### Dependency footprint
Rust workspace, 11 crates (Cargo.toml:6–17); key deps: cosmic-text, swash, taffy, kurbo, wgpu (optional GPU), `ffmpeg-next` (static FFmpeg libs), `image` (png/jpeg) — Cargo.toml:41–61. `unsafe_code = "forbid"`. **For us: zero npm deps, zero browser.** Building from source needs the full Rust toolchain + cmake/nasm (scripts/build-media-libs.sh, Dockerfile) — heavy, but **the intended install is a prebuilt release binary** via install.sh (downloads from GitHub releases; glibc 2.35 floor, Dockerfile:4–5). Binary size unknown from repo. vendor/ is only a patched harfrust (1.7M).

### Sandbox fit
Excellent on paper: no browser, no GPU required (CPU renderer is the reference path), `--memory-budget` for a 3 GB box, self-declared benchmark "1920×1080, 30 fps, 14 s → about 40 s to render on **4 vCPUs with no GPU**" (README.md:109) and a full benchmark table where geneva beats Playwright+ffmpeg 2–4× and Remotion 2–5× on a 4-vCPU no-GPU machine (README.md:123–134). Needs network once to fetch the release binary (or a vendored copy). Not verified by running it.

### Integration path for the host engine
- **(a) Subprocess CLI renderer: YES — cleanest of the five.** Download binary, emit geneva JSON from the host's timeline, `geneva render --format json` with progress parsing, or `--frames`/`join` for segmented renders. Keep node-canvas as fallback.
- **(b) npm adapter: NO** — it's a Rust binary, no npm package.
- **(c) Fork: NO** — Rust codebase, wrong toolchain for this team/sandbox.
- **Translation cost — the real catch:** the host's scenes are **procedural JS** (`render(t)` drawing arcs, hatch lines, fur plumes, grain — worklog Task 1/3-b). Geneva markup has **no JavaScript**; such art cannot be ported 1:1. What ports well: photo plates + Ken Burns keyframes, text/chrome/captions/transitions, audio placement + loudness. What doesn't: bespoke procedural engraving/grain engines (would need re-expression as pre-rendered PNG frames-as-assets, or abandonment). Geneva is a *different authoring model* (config-first JSON+HTML), not a drop-in execution engine for existing scene JS. Risk: new-format QA surface + one-month-old AI-written codebase.

---

## 2. openfilm — `/home/z/my-project/refs/openfilm`

### What it is
"The open source **AI video agent**" (README.md:7): a pnpm monorepo (`packages/openfilm` = format + CLI + Studio editor, `apps/desktop` = Electron app, `packages/shared`). Rendering mechanism: **headless Chromium screenshots via playwright-core + system ffmpeg** — one browser per ~2 cores (max 8), frames captured JPEG q95 (PNG for alpha) into ffmpeg `image2pipe`, motion blur by multi-sample `tmix`, concat + mux, audio mixed from the film's clips (packages/openfilm/src/render.mjs:158–190, 33–37). First run downloads **chromium-headless-shell ~100 MB** (bin/openfilm.mjs:222–229).

### Scene/timeline representation (hybrid: config-first edit + code-first shots)
- A film is a folder with **`film.html`**: each `<section>` is a track (first on top), clips are plain elements — `<iframe>` (a page), `<video>`, `<img>`, `<audio>` — positioned by inline `style` px + `at` start seconds + media fragments `#t=in,out`, `speed`, `volume` (README.md:87–108; MANUAL.md).
- **Each shot is a web page exposing `window.film = { frame(t), duration, ready, width, height }`** — "The one rule: the same `t` always draws the same picture" (README.md:112–124). Frames are requested out of order, in parallel. This is **exactly the host engine's own deterministic `render(t)` contract**, transplanted into a browser page. Protocol formalized in SPEC.md ("OpenFilm Protocol 0.1 (draft)", RFC-2119 MUSTs) with `overrides` JSON for editor-made changes.
- Pages may use "anything a browser can draw: three.js, WebGL, canvas, SVG, CSS, GSAP, video" (README.md:23).

### Input support
HTML/CSS/JS pages, WebGL/three.js/canvas/SVG, video footage, stills, audio beds/SFX per clip, **word-timed WebVTT subtitles** (`vo/1.wav` → `vo/1.vtt`, Studio makes burned subtitles — "never draw subtitles in a page", MANUAL.md). Fonts via `ready` promise. External generation (voice/music/images) is via `openfilm get` **through user-connected paid services (ElevenLabs/OpenAI/fal…)** — optional; "Making, editing and rendering films needs no account" (README.md:50–51).

### Headless CLI (exact commands, README.md:63–69, MANUAL.md "Tools")
```sh
npx -y openfilm@latest open [folder|url]   # Studio in browser (editor; not required to render)
openfilm look   [what] [t | a-b]           # contact sheet + DETERMINISM CHECK (every frame drawn twice, shuffled)
openfilm render [a-b]                      # the MP4; --fps, --4k, --blur (motion blur), --alpha (.webm/.mov)
openfilm get    [what]                     # optional paid-service generation
```
`render` works standalone (launches its own local static server + browsers; src/render.mjs uses `probe`/`launch` from host.mjs — Studio not required). Non-TTY progress lines every 10% (render.mjs:87–99). `look` is a built-in frame-identical/determinism QA gate (README.md:127–129) — conceptually matches the host's contact-sheet QA habit.

### License
**MIT** (LICENSE: "Copyright (c) 2026 OpenFilm contributors"; package.json `"license": "MIT"`). Name/logo are trademarks (TRADEMARK.md). Commercial use: fine.

### Maintenance
- `openfilm` npm package **v0.1.6** (packages/openfilm/package.json:4). Changesets active; changelog entries reference PRs #24/#26/#32 with contributor @PazChen (packages/openfilm/CHANGELOG.md). Git HEAD **2026-10-13** (`d7dd930`). Shallow clone — history depth unknown. **Very early (0.x) but actively developed**; desktop-app churn dominates recent changelog.
- Requires **Node ≥22.2** (package.json engines) — sandbox has v24.21.0, OK. Requires ffmpeg on PATH — present.

### Dependency footprint
Runtime deps of the core package: **`playwright-core` 1.61.1 only** (package.json dependencies). Studio UI (React/Vite/Tailwind) is dev-time. Browser download ~100 MB once. RAM estimate in code: "a page with its media takes **1.5 GB or more**", worker budget 3 GB/browser, `defaultWorkers = min(8, cores/2, mem/3GB)` (render.mjs:139–143) — **on our 3 GB sandbox that math yields 1 worker**, and Chromium itself will be tight.

### Sandbox fit
Workable but RAM-constrained. Headless-shell "starts inside agents' OS sandboxes where the full Chromium cannot" (host.mjs:210–211). Launch flags `--ignore-gpu-blocklist --enable-gpu-rasterization` (host.mjs:218) — without a GPU, Chromium falls back to SwiftShader software GL for WebGL (slower, CPU-bound; not documented in-repo). WebGL is achievable CPU-side (SPEC requires `preserveDrawingBuffer: true`). No npm-install surprise beyond the browser fetch.

### Integration path for the host engine
- **(a) Subprocess CLI: possible** (`npx openfilm render` on a film folder) but it's project-oriented, not a single-shot compositor; audio/subtitle handling assumes the film.html + VTT layout.
- **(b) npm adapter: YES — the best npm story of the five.** Exports `./render`, `./host`, `./look`, `./film-doc` (package.json exports); ~190-line render module we could call directly with `opts.workers=1`, or reimplement against `./host` (426 lines). MIT, tiny dep surface.
- **(c) Fork: very cheap if ever needed** — the whole core is a few thousand lines of plain ESM.
- **Translation cost: the lowest conceptual gap.** Host scenes are `render(t)` JS; OpenFilm pages are `frame(t)` JS. Porting = wrapping host scene modules to run in a browser canvas context (node-canvas API ≈ OffscreenCanvas, mostly compatible; preload via `ready`), emitting film.html tracks for the timeline, per-block VTTs for subtitles. Risks: 0.x protocol churn ("draft"), 3 GB RAM ceiling, node-canvas→browser-canvas port of 40 scenes is real work, and JPEG-capture fidelity vs the host's q93 stream is equivalent.

---

## 3. hyperframes — `/home/z/my-project/refs/hyperframes`

### What it is
HeyGen's open-source framework: "**Write HTML. Render video. Built for agents**" (README.md:17). Bun-based monorepo (17 packages; runtime ships as normal npm packages). Mechanism: **headless Chrome (chrome-headless-shell via `@puppeteer/browsers`/puppeteer-core) frame-seeking capture + FFmpeg encode + audio mix** — `@hyperframes/engine` "Seekable web page to video rendering engine (Puppeteer + FFmpeg)" (packages/engine/package.json description), `@hyperframes/producer` "Full rendering pipeline for capture, encode, and audio mix" (README.md:321–322). "The renderer seeks each frame in headless Chrome and encodes the result with FFmpeg, so the same input produces the same video" (README.md:250). Used in production at HeyGen; adopters include tldraw, TanStack (README.md:330, ADOPTERS.md).

### Scene/timeline representation (config-first HTML, code via script)
- Composition = plain HTML with `data-*` timing attributes: `data-composition-id`, `data-start`, `data-duration`, `data-track-index`, `data-width/height`, `class="clip"`, `<audio data-volume>` (README.md:219–247). "No React requirement, no proprietary timeline format… no build step: an `index.html` composition plays as-is" (README.md:281–284).
- Animation via **seekable adapters**: GSAP timelines registered as `window.__timelines.<compId>`, CSS, Lottie, Three.js, Anime.js, WAAPI, or a custom frame adapter; frame-clock integer math `t = floor(frame)/fps`, "no wall clock" determinism rules documented (README.md:240–246; docs/concepts/determinism.mdx:20–33). Catalog of installable blocks/components (transitions, overlays, captions, charts — `npx hyperframes add data-chart`).

### Input support
HTML/CSS/JS, GSAP/Lottie/Three.js/Anime.js/WAAPI, video/audio/still media, shader (WebGL) transitions, captions ("embedded-captions" workflow for talking-head recuts), audio FX chain (EQ/compressor/limiter, voiceover ducking, automation envelopes — skills table README.md:123), Figma import. Vast — the widest of the five.

### Headless CLI (exact commands)
```sh
npx hyperframes init my-video && cd my-video
npx hyperframes preview          # browser live-reload
npx hyperframes lint             # structure rules (codes, --json)
npx hyperframes check            # runtime/layout/motion/media/contrast audits
npx hyperframes render --output final.mp4 [--format webm|mov|gif|png-sequence|hls] [--fps N]
npx hyperframes doctor / snapshot / catalog / add / publish
npx hyperframes cloud render     # HeyGen-HOSTED (external service; avoid per house rules)
npx hyperframes lambda deploy / render / progress   # AWS Lambda distributed render
```
(docs/guides/rendering.mdx:23–67; skills table README.md:122; docs/deploy/*.) Local render needs only Node 22+ and FFmpeg (README.md:138) and "local rendering does not use HeyGen credits" (docs/quickstart.mdx:22). `@hyperframes/producer` also exposes an npm API: `createRenderJob({fps, quality, format})` + `executeRenderJob(job, projectDir, outPath, onProgress)` (docs/packages/producer.mdx:20–44).

### License
**Apache License 2.0**, full text in LICENSE (10.7 KB); "Apache 2.0 license, with no per-render fees or commercial-use thresholds" (README.md:286). Commercial use: fine, with patent grant + NOTICE requirements.

### Maintenance
- `@hyperframes/cli` / `core` / `engine` / `producer` all **v0.8.155**; **315 release-note files** in `releases/` (v0.8.95…v0.8.155+); git HEAD **2026-10-13 23:37** (`3de4763`) — same-day as geneva/openfilm snapshots. Corporate backing (HeyGen), heavy CI discipline (hundreds of guard scripts), Git LFS golden PSNR baselines (~240 MB) for render regression (README.md:340). Most mature process of the five, but 0.x versioning and very fast patch churn.

### Dependency footprint — heaviest of the five
CLI runtime deps: puppeteer-core, `@puppeteer/browsers` (downloads Chrome for Testing), **sharp** (native image lib), fontkit, css-tree, postcss, hono, esbuild, adm-zip, yauzl… (packages/cli/package.json:34–53). Producer adds puppeteer + linkedom + postcss (packages/producer/package.json:77–89). Browser download on top. Engine contains WSL/GPU/SwiftShader-specific handling (engine/src/services/frameCapture.ts:2768 mentions chrome-headless-shell + SwiftShader stall workarounds) — evidence they fight the no-GPU edge cases continuously. Monorepo 417 MB but that's LFS baselines/docs; the npm-published CLI is the real footprint.

### Sandbox fit
Should work (chrome-headless-shell linux-x64 listed in browserManager.ts:186, plus memory services `systemMemory`, `chromeHostCeiling`), but on **3 GB RAM** expect 1 worker and possible memory-pressure tuning; WebGL shader transitions would run on SwiftShader (slow) or should be avoided. `hyperframes check` opens a browser — extra RAM during QA. `doctor` exists for environment validation. Not verified by running.

### Integration path for the host engine
- **(a) Subprocess CLI: YES** — richest CLI (lint→check→render, JSON lint output, png-sequence output that could even feed the host's muxer).
- **(b) npm adapter: YES** — `@hyperframes/producer` `createRenderJob/executeRenderJob` (but drags puppeteer+sharp into node_modules; disk ~300–400 MB with Chrome).
- **(c) Fork: NO** — 17-package monorepo, far too large to carry.
- **Translation cost: moderate-to-high.** Authoring is HTML+data-*+seekable-library timelines — NOT the host's `render(t)` JS. A host scene could be exposed as a custom frame adapter (supported: README.md:216 "or your own frame adapter"), but the natural port is rewriting scenes as HTML+GSAP timelines, losing the host's procedural canvas art. Big upside if adopted wholesale: skills (21 agent skills incl. `/faceless-explainer`, `/embedded-captions` — README.md:100–108) map directly onto the studio's documentary pipeline; big downside: dep weight, RAM, and an agent-skill ecosystem that assumes Claude Code-style workflows rather than embedding in our own engine.

---

## 4. revideo — `/home/z/my-project/refs/revideo`

### What it is
"A **rendering engine for creating videos in code**. You describe a scene in TypeScript… headless render API… React player for previewing" (README.md:16–19). Lerna monorepo, 16 packages. It is a **fork of Motion Canvas** (LICENSE: "Copyright (c) 2022 motion-canvas"; same Discord badge; core/2d/ui/vite-plugin structure mirrors motion-canvas) retooled for programmatic headless rendering. "Engine behind Midrender" (README.md:25). Mechanism: **puppeteer headless Chrome + vite dev server** hosting the Motion Canvas runtime; frames rendered in-browser, encoded by a bundled ffmpeg (`@ffmpeg-installer/ffmpeg` + fluent-ffmpeg) (packages/renderer/package.json:41–46; packages/renderer/server/render-video.ts:21,33).

### Scene/timeline representation (code-first, generator API)
```tsx
export default makeScene2D('scramble', function* (view) {
  view.fill('#0d0d12');
  yield* waitFor(0.5);
  yield* cube().scramble(18);
});
```
(README.md:46–54.) Scenes are **TypeScript generator functions** over a 2D node tree (`@revideo/2d`), not imperative canvas. `renderVideo({projectFile, settings})` programmatic API (packages/template/src/render.ts). Project rendered via vite (`@revideo/vite-plugin` — the forked Motion Canvas plugin).

### Input support
2D shapes/text/media nodes, `<Video/>`/`<Audio/>` "with audio export and frame-accurate synchronization" (README.md:82–83), images, fonts; JSX/TS. Multi-worker parallel render (`workers` setting, README.md:76–77, PR #74). Output mp4/webm/mov (render-video.ts:32). No built-in subtitle/caption pipeline in-repo (unlike geneva/hyperframes/openfilm).

### Headless CLI
- `@revideo/cli` bin `revideo` — **only command is `serve`**: "Exposes a render endpoint to render videos from a project file" on a port (packages/cli/src/index.ts:20–39). It's an HTTP render server, not a one-shot renderer.
- Programmatic: `renderVideo()` from `@revideo/renderer` (the documented path; README.md:71: "render a project to a file with `renderVideo()`").
- The wasm exporter exists (`exporter: {name: '@revideo/core/wasm'}`, packages/template/src/render.ts:9–11) — in-browser mp4-wasm encoding; system ffmpeg otherwise via the bundled installer.

### License
**MIT** (LICENSE; README badge). Copyright header retains "motion-canvas 2022" (fork lineage). Commercial use: fine.

### Maintenance — weakest signal of the five
- Version **0.11.0** across packages (lerna.json "version": "0.11.0"; packages/*/package.json). **No CHANGELOG in the repo.** Shallow clone HEAD **2026-07-15** ("docs: add RELEASING.md (#397)") — the snapshot is ~3 months older than the other four clones; activity since then unverifiable.
- **Telemetry on by default**: "Revideo anonymously counts how many videos are rendered, via PostHog… Disable it with `DISABLE_TELEMETRY=true`" (README.md:89–98; packages/telemetry) — must be disabled for a no-surprises sandbox.

### Dependency footprint
Core is genuinely lean ("in its core, zero dep" — README.md:23; deps: culori + mp4-wasm). But the render path pulls **puppeteer 25 + vite 8 + @ffmpeg-installer/ffmpeg (its own static ffmpeg, ~70 MB, separate from our system ffmpeg 7.1.5) + fluent-ffmpeg + uuid** (packages/renderer, packages/ffmpeg package.json). Chrome download on top. Total new-disk ≈ Chrome + vite + a second ffmpeg.

### Sandbox fit
Plausible (headless chrome + node, no GPU needed — Canvas 2D rendering in-browser; no WebGL dependency), RAM similar to other browser engines (~1 worker at 3 GB). Slightly worse fit than openfilm/hyperframes because of the second ffmpeg binary and vite server per worker (ports 9000+ per worker, render-video.ts:55–62).

### Integration path for the host engine
- **(a) Subprocess CLI: partial** — `revideo serve` HTTP endpoint or a small node wrapper script calling `renderVideo()` (the template pattern: `tsc && node dist/render.js`).
- **(b) npm adapter: YES** — `@revideo/renderer` is exactly that; accept vite+puppeteer+installer deps and the telemetry opt-out.
- **(c) Fork: it already is one** (of Motion Canvas); forking it further is possible (MIT) but you inherit the whole MC runtime.
- **Translation cost: HIGH.** The host's imperative `render(t)` canvas scenes do not map to Motion Canvas's generator + node-tree model. A custom `<Node>` with a per-frame `draw()` is possible (their RubiksCube template does exactly this — "orthographically projected in a custom `draw()`", README.md:57–60) but that's a rewrite of every scene into a framework idiom. Weakest input fit for our existing 40-scene library.

---

## 5. motion-canvas — `/home/z/my-project/refs/motion-canvas`

### What it is
"**Motion Canvas is two things: a TypeScript library that uses generators to program animations; an editor providing a real-time preview**" (README.md:20–23). "Specialized tool designed to create informative vector animations and synchronize them with voice-overs" (README.md:25). Lerna monorepo (12 packages, README.md:37–51). This is the **upstream** that revideo forked.

### Rendering mechanism
Browser-first: the vite plugin serves the project; the **editor UI** (packages/ui) drives `core`'s `Renderer`/`Exporter` (packages/core/src/app/Renderer.ts, Exporter.ts); the **FFmpeg exporter streams frames from the browser canvas over a websocket to a node-side bridge** (packages/ffmpeg/client/FFmpegExporterClient.ts → server/FFmpegBridge.ts, using `ffmpeg-ffprobe-static` + fluent-ffmpeg, packages/ffmpeg/server/FFmpegExporterServer.ts:5–17). **No headless CLI renderer, no `bin` render command anywhere** (only `packages/create` has a bin — project bootstrapper). Rendering is initiated from the editor's Render button; no docs mention headless or a command-line render (repo-wide search found none).

### Representation/inputs
Same generator API as revideo (`makeScene2D`, `yield*`), 2D vector nodes, LaTeX (via the 2d package), shaders, voice-over sync focus. Real-time editor + player custom element.

### License
**MIT** (LICENSE, "Copyright (c) 2022 motion-canvas").

### Maintenance — stale
- Last release **3.17.2 (2024-12-14)** per CHANGELOG.md:8; lerna.json version 3.17.2. Clone HEAD **2026-07-02** — i.e. **~1.5 years after the last release**, with a few 2026 commits but no release cut. Compare: revideo (the fork) exists precisely to add headless programmatic rendering.
- No `ffmpeg`/`renderer` CLI: adopting it for automated rendering would mean **building our own harness** (vite plugin + browser + exporter bridge) — i.e., redoing what revideo already did.

### Integration path
- **(a) subprocess CLI: NO** (none exists). **(b) npm adapter: NO headless API** (`@motion-canvas/core` runtime assumes editor/browser host; the exporter client is editor-driven). **(c) wholesale fork: the only path — and pointless, because revideo IS that fork, maintained.**
- Verdict: **not adoptable** for our automation use case; interesting only as historical upstream.

---

## Comparison table

| Repo | Mechanism | License | Headless CLI | Deps weight | Sandbox fit (2 cores obs., 3 GB RAM, no GPU, 7.4 GB disk) | Integration path for host engine | Risk |
|---|---|---|---|---|---|---|---|
| **geneva** v1.5.0 (2026-10-13) | Rust frame compositor; JSON timeline + HTML/CSS-subset painted in-process; FFmpeg libs linked; CPU renderer reference, GPU optional | MIT | **Best-in-class**: `geneva render --frames A..B` / `join` / `subtitles --burn` / `frame` / `validate` / `farm`; `--format json`, progress JSON, `--memory-budget` | Zero npm deps; one prebuilt binary (~size unverified); no browser, no GPU | **Excellent** (claims 4-vCPU no-GPU realtime-ish renders; memory budget flag) | **(a) subprocess CLI** — emit JSON docs from our timeline; keep node-canvas fallback. No npm/fork path | **Authoring-model mismatch**: NO JavaScript in markup; procedural canvas art unportable; images jpg/png only; 1-month-old, AI-written, single author |
| **openfilm** v0.1.6 (HEAD 2026-10-13) | Headless Chromium (playwright-core, ~100 MB download) screenshot-per-frame → ffmpeg image2pipe + tmix motion blur; audio mixed from film clips | MIT | `openfilm render [a-b]` (--fps/--4k/--blur/--alpha), `look` (determinism check), project-folder oriented | **Leanest npm**: playwright-core only at runtime; Chromium RAM ~1.5 GB/page, 3 GB/browser budget | OK but **RAM-tight: 3 GB total ⇒ 1 worker**; WebGL via SwiftShader | **(b) npm adapter** (`./render`, `./host`) or tiny fork; **(a)** possible; frame(t) = our render(t) contract | 0.x "draft" protocol churn; node-canvas→browser-canvas port of 40 scenes; Studio not needed for render |
| **hyperframes** v0.8.155 (HEAD 2026-10-13) | Headless chrome-headless-shell (Puppeteer) seek-based capture → FFmpeg encode + audio mix; HTML data-* compositions; seekable adapters (GSAP/Lottie/Three/WAAPI/custom) | Apache-2.0 | **Richest**: init/lint/check/snapshot/render (--format webm/mov/gif/png-seq/hls)/doctor/catalog; plus cloud render (HeyGen-hosted, avoid) & Lambda | **Heaviest**: puppeteer(+core), sharp, fontkit, postcss, hono, esbuild… + Chrome download; 417 MB repo (LFS/docs) | Workable; 1 worker at 3 GB; WebGL transitions slow on SwiftShader; `doctor` helps | **(a)** CLI or **(b)** `@hyperframes/producer` `createRenderJob/executeRenderJob` | Dep weight + fast 0.x churn; authoring = HTML+GSAP, not our render(t); 21 agent skills assume agent-driven authoring; fork = no |
| **revideo** v0.11.0 (HEAD 2026-07-15) | Puppeteer + vite serving Motion Canvas runtime in browser; bundled @ffmpeg-installer + fluent-ffmpeg; generator scenes (makeScene2D) | MIT (fork of motion-canvas) | `revideo serve` HTTP render endpoint; programmatic `renderVideo()` | Medium: core lean, but renderer pulls puppeteer+vite+**second ffmpeg binary** | Plausible; RAM ~1 browser; extra vite server/ports; **telemetry ON by default** (DISABLE_TELEMETRY=true) | **(b)** npm adapter (`@revideo/renderer`); **(a)** via small wrapper; it's already a fork (c) | **Stale snapshot (~3 mo)**, no changelog, 0.x; **HIGH translation cost**: imperative canvas → generator/node-tree rewrite; no caption pipeline |
| **motion-canvas** v3.17.2 (rel. 2024-12-14; HEAD 2026-07-02) | Browser editor-driven: vite + editor UI + websocket FFmpeg exporter bridge; generator animations | MIT | **NONE** — no headless CLI/render bin; render triggered from editor UI | Low-medium (npm workspace, ffmpeg-ffprobe-static) | N/A for automation | **None viable** — (c) fork would replicate revideo | **Abandoned cadence**: 1.5 yr without a release; revideo is the maintained derivative |

---

## Bottom line

- **geneva** is the strongest *infrastructure* candidate: a no-browser, no-GPU, memory-capped, JSON-schema'd, agent-documented CLI whose segmented-render + join model mirrors our build_seg.sh pipeline and whose native loudness/subtitle-burn replaces two of our bespoke steps. Its sole structural problem is that our procedural scene JS cannot run inside it — it would become the renderer for a **new HTML+JSON authoring layer**, not for the existing 40-scene JS library.
- **openfilm** is the strongest *conceptual* candidate: its `window.film.frame(t)` protocol is verbatim our engine's contract, its core is tiny, MIT, npm-embeddable, and its `look` determinism gate matches our QA habit — but it is 0.1.x and our 3 GB RAM sandbox limits it to a single browser worker.
- **hyperframes** is the most complete product (CLI QA loop, skills, corporate adoption, Apache-2.0) but the heaviest and most opinionated; the render path is a browser we'd host anyway, plus ~300–400 MB of deps.
- **revideo** and **motion-canvas** are the same family; only revideo is headless-capable, and its Motion Canvas generator idiom is the farthest from our existing scene code. motion-canvas alone is a non-starter.

**Suggested PoC (Task 3 candidate):** benchmark **geneva first** (subprocess path; re-express ONE representative Isdal scene — photo plate + Ken Burns + captions + chrome — as geneva JSON+HTML, measure render time/memory vs node-canvas baseline, judge fidelity), then **openfilm** (port the same scene to `frame(t)` in chromium-headless-shell at 1 worker). Skip hyperframes PoC unless geneva's markup subset proves too restrictive and openfilm's 0.x churn worries us; skip revideo/motion-canvas entirely.
