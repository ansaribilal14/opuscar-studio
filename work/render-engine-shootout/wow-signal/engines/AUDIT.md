# ENGINE AUDIT — shootout update (2026-10-18)

Extends `docs/HYPIT_ENGINE_AUDIT.md` (2026-10-18, issue #18) which scoped Hypit for a
*style-integration decision*; this audit covers the *shootout requirement*: genuine
authoring + rendering of a full 10-minute documentary per engine, on THIS container.
Method: shallow clones of both engines @ HEAD (same day), source + docs inspection,
npm-registry version checks, and **both engines actually installed and rendering a
smoke composition locally** (evidence below).

## Container gates (verified)

| Gate | Value | HyperFrames req | Hypit req | Verdict |
|---|---|---|---|---|
| Node | v24.21.0 | >=22 | >=22.15.0 | PASS both |
| FFmpeg | 7.1.5 | any (system) | media.local uses system ffmpeg | PASS |
| Chrome | downloaded per-engine | chrome-headless-shell via `@puppeteer/browsers` (601 MB cache incl. chrome) | chrome-headless-shell 152.0.7928.2 at `~/.cache/hypit/html-rasterizer/` (auto-installed by `hypit runtime up`) | PASS both |
| Disk | ~7 GB free | fine | fine | PASS |
| CPU/RAM | 2 CPU / 3 GB | renders slow but proven (smoke fast) | same | PASS, budgeted |
| Credentials | none available | local render needs none | local profile needs none | PASS — zero-cost local path confirmed for both |

## Engine B — HyperFrames

- **Version**: npm `hyperframes` / `@hyperframes/{cli,core,engine,producer}` **0.8.171**
  (repo HEAD `dc0e80e`, cloned 2026-10-18). Audit snapshot 2026-10-13 saw 0.8.155 —
  16 patch releases in 5 days; pin exact version in the implementation.
- **License**: Apache-2.0 (repo LICENSE; npm). No restrictions relevant to our use.
- **Authoring model**: plain HTML composition, `data-composition-id/-start/-duration/
  -width/-height/-fps`, `.clip` elements with `data-track-index`, `<audio data-volume src>`;
  animation via seekable adapters (GSAP timelines `window.__timelines`, CSS, WAAPI);
  catalog blocks installable via `hyperframes add`.
- **Determinism** (docs/concepts/determinism.mdx): frame-seek model, `t = floor(frame)/fps`
  integer math, no wall clock, no unseeded randomness, no mid-render fetch, fixed size,
  finite length — the same contract class as Opuscar's `render(t)`.
- **Render path**: `hyperframes lint` → `check` → `render --output final.mp4`
  (MP4/WebM/MOV/PNG-seq/HLS). Producer = "HTML-to-video rendering engine using Chrome's
  BeginFrame API". Local render uses no HeyGen credits/cloud.
- **Captions/audio**: burned caption text is ordinary timed HTML text (full CSS control);
  embedded-captions workflow exists for recuts; audio mixing with ducking/EQ/limiter in
  the composition (`/hyperframes-audio` skill docs); `hyperframes audio` measures onsets.
- **Smoke result (PASSED)**: hand-authored 1920×1080 30 fps 3 s composition (two timed
  clips), `hyperframes render` → H.264 yuv420p 3.000 s, full decode 0 errors.
  Note: `hyperframes init` (blank example) hung >180 s in this sandbox — bypassed by
  authoring `index.html` + `package.json` manually; render path unaffected.
- **Feasibility for the 10-min film: FULL.** All required capabilities (timed stills w/
  Ken Burns via GSAP or data-motion, burned captions, narration + music tracks, closing
  card, 1080p30 H.264) are native. Risks: 0.x churn (pin 0.8.171); per-frame seek render
  speed on 2 CPUs (measure on the film); init/interactive commands avoided in scripts.

## Engine C — Hypit

- **Version**: npm `@hypit/hypit` **0.3.1** (repo HEAD `dc2b7a8`, cloned 2026-10-18;
  same release the issue-#18 audit inspected). pnpm@10.33.0 monorepo in-repo, but the
  **npm-distributed CLI works without building the monorepo** (verified).
- **License**: modified Apache-2.0 with additional conditions (no multi-tenant hosting
  without authorization; no commercial redistribution as a component; logo/copyright
  preservation in CLI/report-derived user-facing surfaces; output ownership is ours).
  Running it locally to produce our own film is permitted; we must not ship its CLI
  output surfaces as if they were ours or redistribute the tool. Consistent with the
  issue-#18 analysis; no change at v0.3.1.
- **Authoring model**: SVML documents — Author (`.svml`), recipe sheets (`.svs`),
  Run (`.svrun` → `<author source> + <target output>`). Values flow as a compile graph:
  `media:Image/Audio` (local files → Blob under bare id) → `space:Canvas/Extent/Frame`
  → `time:Clock/Timeline/Window` (absolute program time; `end="8s"` for pure animation)
  → `visual:Track/Clip` (image=, extent=, during=, frame=, z=, fit=, motion poses)
  → `audio:Track/Clip` → `film:Film` (+ appearance recipe) → `html:Video` → `final.video`.
- **Local-only render path (verified — no AI connectors)**: runtime profile
  `hypit.runtime-local@1` binds `@hypit/html-program#rasterize-visual` →
  `@hypit/provider-html-local` (own chrome-headless-shell 152, auto-installed) and
  media ops → `@hypit/media-local` (ffmpeg). `hypit plan` reports every step
  "local, no Provider charge". Word-anchored timing via WhisperX is OPTIONAL — a pure
  animation needs only `Timeline`; our edge-tts WordBoundary timings can drive absolute
  Windows directly, no ASR service required.
- **Frame ABI**: compiled programs expose
  `window.__hypitFrameProgram.applyFrame(frame: int)` — frame-addressed like Opuscar's
  contract; component escape hatch `hypit.html-visual@1` gives `render(localFrame)` for
  authored scene code.
- **Captions**: `caption-fine` style family with authored Cues; karaoke-style word
  highlighting available; fonts via `@hypit/fontsource` (npm font packages).
- **Smoke result (PASSED)**: hand-authored 640×360 30 fps 3 s project (local PNG clip,
  Film→html:Video): `hypit check` valid → `plan` 3 local steps → `build --follow`
  **complete in ~7 s** → `get … --to hypit-smoke.mp4` → H.264 yuv420p 3.000 s, decode
  0 errors. Two authoring lessons: every source file needs the `<?svml using=…?>`
  header; `visual:Clip.image` takes the Blob under the bare id (not `.image`).
- **Feasibility for the 10-min film: FULL (local path).** 10 minutes = 18,000 frames —
  far beyond the 137-s shipped example, so render wall-clock and memory are the real
  test (mitigation: measure early with a 60-s pilot before committing to the full
  render). Risks: SVML authoring granularity for scene-level motion is component-owned
  (use `hypit.html-visual@1` for our scene code); license conditions noted above;
  unclear behavior at 18k-frame scale (result repository size) — monitor.

## Decision

Proceed with all three engines as planned. Both external engines have verified local,
credential-free, deterministic-class render paths on this container and pass smoke
renders. No blocker for issues #27–#29. Comparative behavior (speed, memory, failures)
will be measured on the actual film per issue #31.
