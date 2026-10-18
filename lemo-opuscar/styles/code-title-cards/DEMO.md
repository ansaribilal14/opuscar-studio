# Code Title Cards — our demo

One example among many. Don't reuse its story, arc, shots, props or timings.

Demo: *Render It Free* (18 s, silent) · `code-title-cards.mp4` · source in [`demo/`](demo/)

## Story & structure

The demo is the style turned on itself: five statements about code-rendered video,
spoken by no one, filmed by no camera. Each line is one card, and each card's accent
word carries the argument — **code** (what frames are), **filmed** (what never
happens), **input** and **pixels** (the determinism pair), **free** (what rendering
costs). The five cards run sequentially at a fixed rhythm and end on the shortest,
loudest line. The film has no arc beyond the statements themselves; that is the point
of a title-card piece.

## Shots

| # | Time | Card | Accent | Note |
|---|---|---|---|---|
| 1 | 0.00–3.90 | Every frame is code | code | opening; rises 40 px during the fade-in |
| 2 | 3.90–7.60 | Nothing is filmed | filmed | negation card |
| 3 | 7.60–11.07 | Same input | input | first half of the determinism pair |
| 4 | 11.07–14.54 | Same pixels | pixels | second half, parallel grammar |
| 5 | 14.54–18.00 | Render it free | free | the long close |

(Exact boundaries are frame-aligned by `timeline.js`; the table is rounded.)

## Score structure

None. The demo is **silent by design**: no music, no foley, no voice, no TTS, no mix,
no `mux.sh`. `window.EV` is an empty array and the rendered MP4 contains no audio
stream. Reproductions may add sound only outside the style (in the surrounding film).

## Palette & props

Ground `#0b0b0f`, ink `#f4f2ec`, accent `#c8ff3d` (the example palette of STYLE.md
§3). The only "prop" is the type: Space Grotesk Bold, 168 px starting size at
1920×1080, one shared fitted size across all cards, 144 px safe margins. Cards enter
from 40 px below their resting position and leave without moving.

## End card

The demo's last card *is* the end card: "Render it free" with **free** in accent. No
sign-off card, no logo, no watermark — a user's film carries none either.

## Build notes

File map: `demo/timeline.js` (validation, tokenizing, accent resolution, timing,
frame-aligned duration fitting, font-size fitting and the motion model — pure,
unit-tested), `demo/main.js` (page contract: `window.DUR/FPS/render/READY/TEXTS/EV`,
Canvas2D `measureText` composition and drawing), `demo/content.json` (the one local
config), `demo/fonts/` (Space Grotesk WOFF2 + OFL text), `demo/tools/card_times.mjs`
(preview timestamps from the same timeline), `demo/tools/refont.sh` (reproduces the
font + verifies sha256), `demo/tools/` tests (`node --test`).

Commands, from the library root:

```sh
node core/render/still.mjs styles/code-title-cards/demo 2.0 6.5        # review stills
node core/render/video.mjs styles/code-title-cards/demo --fps 30 --workers 2 \
     --out styles/code-title-cards/demo/out/title-cards.mp4            # full render
node core/render/readcheck.mjs styles/code-title-cards/demo            # readability gate
sh styles/code-title-cards/demo/build.sh                               # all of the above
node --test styles/code-title-cards/demo/tools/*.test.mjs              # unit + pixel tests
```

Determinism rules the demo honours: `render(t)` reads only `t` + immutable state;
every frame repaints the ground; the same `t` twice yields identical pixels; frames
may be rendered in any order (the shared video renderer's workers rely on this).
Diagnostics: `--q 'content=<file>.json'` swaps the config; `--q fontfile=<path>`
overrides the font file (used by the font-failure test). Rendering a second version
requires its own `--out`. Font provenance: `tools/refont.sh` re-downloads the OFL
source and verifies the checksum; never link a CDN at render time.

## content.json fields

| Field | Type | Allowed | If out of range |
|---|---|---|---|
| `targetDuration` | number (s) | > 0, ≥ minimum card time | validation error |
| `fps` | integer | 1–120 | validation error |
| `palette.background` / `.ink` / `.accent` | hex string | `#rgb` / `#rrggbb` | validation error |
| `font.family` | string | non-empty; must be loaded locally | readiness failure with message |
| `font.weight` | number | 1–1000 | validation error |
| `font.size` / `font.minSize` | number (px) | 4–4096; `size ≥ minSize` | validation error |
| `safeMargin` | number (px) | ≥ 0 | validation error |
| `fadeIn` / `fadeOut` | number (s) | ≥ 0 | validation error |
| `riseDistance` | number (px) | ≥ 0 | validation error |
| `minimumHold` / `holdIntercept` | number (s) | ≥ 0 | validation error |
| `wordsPerSecond` | number | > 0 | validation error |
| `lines[].text` | string | ≥ 1 word (outer whitespace trimmed, inner runs preserved) | validation error |
| `lines[].accentWord` | string | must match one whitespace-delimited word (punctuation stripped for matching) | validation error; absent → documented fallback: first word |
| `lines[].accentOccurrence` | integer | 1-based; ≤ occurrences of `accentWord` | validation error |

Duration fitting: cards get `ceil((fadeIn + hold + fadeOut) × fps)` frames (never
below the prescribed minimum); if the baseline total is below `targetDuration`, the
extra frames are distributed evenly, remainders to the earliest cards; if the target
is below the baseline, validation fails with the minimum valid duration. Cards never
overlap and lines are never truncated. The accent word is exactly one per card —
repeated occurrences resolve via `accentOccurrence` (default: first); punctuation
keeps the ink colour unless the author wrote it inside `accentWord` itself.
