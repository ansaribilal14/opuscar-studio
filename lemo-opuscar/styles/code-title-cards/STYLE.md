# Code Title Cards — Style Prompt

> Silent, deterministic title cards: one centered statement per card on a flat dark
> ground, set in one bold grotesque, with exactly one accented word per card. Nothing
> is filmed — every frame is drawn by code from the time `t` alone.
> References (grammar only): Swiss title typography and minimal keynote statements —
> learn the discipline of one line, one accent, generous margins. Never copy a real
> deck, brand typeface or film's titles, and never name them.

## 1. Essence, and what it is not

Three to five defining traits: (1) **one line, one card** — a statement appears whole,
holds, and leaves; (2) **typography is the only image** — flat colour field, measured
text, no ornaments, no texture, no gradients; (3) **exactly one accent-coloured word**
per card is the sole emphasis device; (4) **machine-quiet motion** — a short fade-in
with a small vertical rise, a still hold, a short fade-out, nothing else. Not a keynote
(no layouts, bullets, charts), not a lower-third system, not kinetic typography (words
never animate individually), never a slideshow with images.

## 2. Materials & rendering

Canvas2D, painted from scratch every frame: `fillRect` the background over the full
canvas, then draw the composed line once. No persistence between frames, no post
passes, no filters, no shadows. The line is **measured, never guessed**: the widths of
individual words and whitespace runs come from `measureText()` at render time, the
segments are drawn left-to-right at those measured positions, and the whole
composition is centred as one unit. Vertical placement centres the **ink box**
(`actualBoundingBoxAscent/Descent`), not the em box. The palette is three flat
colours: ground, ink, accent. If a line would leave the safe area, the font size
shrinks deterministically down to a documented minimum — text is never cropped,
squeezed, or wrapped.

## 3. Colour logic

Three colours exactly: a near-black ground, a warm off-white ink, one saturated acid
accent. The accent is **reserved for the single keyword** of each statement — never
for punctuation, never for two words, never for a rule or block of colour. Example
palette (the demo's): ground `#0b0b0f`, ink `#f4f2ec`, accent `#c8ff3d`. Value order
is fixed: darkest ground, lightest ink, accent mid-bright and highly saturated. If a
second emphasis is needed, the statement is rewritten, not the palette extended.

## 4. Type & subtitles

One family, one weight (bold 700), self-hosted OFL; the demo uses **Space Grotesk
Bold** (WOFF2, local file, licence preserved). Title size starts large relative to the
frame (the demo: 168 px at 1920×1080) and must respect a safe margin on all sides (the
demo: 144 px), shrinking only as far as the documented minimum (the demo: 72 px).
There are no subtitles: the statement **is** the text layer, and it is reported to the
engine's readability checker (`window.TEXTS(t)`) with its true pixel box from the
first visible frame. Reading-time rule: hold ≥ max(1.2 s, 0.35 + words ÷ 3.2).

## 5. Motion quality

Per card, in seconds: **fade-in 0.5** while the line **rises 40 px** to its resting
position (ease-out cubic, opacity 0 → 1), a **hold** of `max(1.2, 0.35 + words/3.2)`
(or longer if a target duration requires distributing extra hold), and a **fade-out
0.25** with ease-in cubic and **no positional move**. Easing is deterministic and
pure; `render(t)` depends only on `t` and immutable inputs, so any frame renders in
any order with identical pixels. Cards are sequential — never overlapping, never
cutting directly against each other; durations are quantized to whole frames. What
never moves: the ground, the resting position, the letterforms themselves (no
tracking, scaling or per-word animation).

## 6. Camera grammar

There is no camera: a locked, full-frame stage. The only framing rule is the safe
area — the composition (including its fade-in rise) stays inside the margins at every
frame. The vocabulary is editorial, not spatial:

| Move | What it expresses | Can serve |
|---|---|---|
| appear and hold | one complete thought given room | a thesis; a title; a verdict |
| accent word | the one idea that matters in the line | a keyword; a name; a number |
| sequence of cards | a chain of statements building an argument | a manifesto; rules; steps |
| longer hold (fitted) | weight, deliberation, reading time | a closing line; a definition |

Transitions are pure cross-fades through the ground colour — no wipes, slides between
cards, or cross-dissolves of two lines.

## 7. Sound palette

**Silent by design.** The style's native state is no audio track at all — no music,
no foley, no voice; `window.EV` stays empty and the rendered MP4 has no audio stream.
If a film built *from* these cards needs sound, that belongs to the surrounding film's
mix, not to the cards.

## 8. Native moves

- **The statement card.** One sentence, one accent word, hold while read. *Fits
  content like:* a thesis line; a definition; a rule being stated.
- **The counting pair.** Two cards with parallel grammar ("Same input" / "Same
  pixels") sharing length and accent position. *Fits content like:* a comparison; a
  before/after; an equation in words.
- **The long close.** The final card receives the longest fitted hold and the plainest
  line. *Fits content like:* a sign-off; a takeaway; a call to action.
- **The reveal by subtraction.** A card whose accent word is the only change from the
  previous line's wording. *Fits content like:* a correction; a turn; a contrast.

## 9. Pitfalls of the medium

- **Guessed positions**: hand-centring words or splitting the line into separately
  centred segments — always compose from measured widths, centred as one unit.
- **Second accent**: colouring punctuation, a hyphenated half-word, or an adjacent
  word — the accent span is resolved on whole tokens, punctuation keeps the ink.
- **Clip-by-confidence**: assuming 168 px "looks fine" — measure against the safe
  area, shrink deterministically, and fail loudly rather than crop.
- **Stateful frames**: leaving residue from the previous card (halved opacities,
  ghost text) — every frame repaints the ground fully.
- **Wall-clock leakage**: `Date.now()`/rAF-driven animation breaks determinism and
  the renderer's random-order workers — drive everything from `t`.
- **Silent film with an audio stream**: muxing a silent track "for safety" — the MP4
  must have no audio stream at all, and `mux.sh` is not part of this style.

## 10. Engine

`demo/timeline.js` is the single source of truth: config validation, tokenization,
accent resolution, card timing, frame-aligned duration fitting, and the pure motion
model (`cardAt`, `cardState`, `seg`, `eo`, `ei`). `demo/main.js` measures and draws:
`measureLine()` (Canvas2D `measureText` composition), `fitFontSize()` (deterministic
shrink to `font.minSize`), `render(t)` (clear + repaint), `texts(t)` (readability
boxes). A minimal use that is not the demo:

```js
import { validateConfig, buildTimeline, cardAt, cardState } from './timeline.js';
const cfg = validateConfig({ ...content, lines: [{ text: "One line, one accent", accentWord: "accent" }] });
const tl = buildTimeline(cfg);          // tl.DUR, tl.cards[i].start/.end
const c = cardAt(tl, 1.2);              // active card, or null
const s = cardState(c, 1.2, cfg);       // { alpha, offsetY, pIn }
```

## 11. Variation space

Per film you choose: the statements and their order; which word each line acccents;
palette within the three-colour logic; family (OFL grotesque), weight, sizes;
safe margins; fades, rise, hold formula parameters; target duration and fps.
Then, all far from the demo — **three structures**: a five-line manifesto; a
two-card thesis pair; a three-chapter marker set. **Three openings**: the boldest
claim first; the question, then the answer card; the smallest number first.
**Three endings**: the long close on one word; a repeat of the opening line, now
accented differently; the final card held at the minimum size, small and quiet.

---

How our demo was made (story, shots, build, content.json fields): [DEMO.md](DEMO.md). Read it after your treatment exists.
