// Code Title Cards — demo page. Contract: window.DUR, window.FPS, window.render(t),
// window.READY, window.TEXTS(t), window.EV (empty: the demo is silent by design).
// render(t) is a pure function of (t, config, content, loaded font): it clears and
// redraws the whole frame, uses no clocks, no randomness, no timers, no CSS animation
// and carries no state between frames. All positions/opacity come from timeline.js.
import { validateConfig, buildTimeline, cardAt, cardState, fitFontSize } from './timeline.js';

const cv = document.getElementById('c');
const g = cv.getContext('2d');
const Q = new URLSearchParams(location.search);

function fail(msg) {
  // Explicit, actionable readiness failure: the engine's page driver reports the
  // pageerror and exits non-zero; window.READY is never set on a failed init.
  console.error('[code-title-cards] ' + msg);
  setTimeout(() => { throw new Error(msg); }, 0);
}

let cfg, tl, layouts = [], fontPx = 0;

function fontSpec(px) { return `${cfg.font.weight} ${px}px "${cfg.font.family}"`; }

// Measured composition of one card at one size: ink runs (word parts, accent split)
// plus whitespace advances. The whole line is centered as ONE composition.
function measureLine(size, card) {
  g.font = fontSpec(size);
  const runs = []; let totalWidth = 0, wi = 0;
  for (const tok of card.tokens) {
    if (tok.type === 'space') { const w = g.measureText(tok.text).width; runs.push({ text: '', advance: w, accent: false }); totalWidth += w; continue; }
    const acc = card.accent && wi === card.accent.wordIndex ? card.accent : null;
    const pieces = acc
      ? [[tok.text.slice(0, acc.from), false], [tok.text.slice(acc.from, acc.to), true], [tok.text.slice(acc.to), false]]
      : [[tok.text, false]];
    for (const [text, isAccent] of pieces) {
      const w = g.measureText(text).width;
      runs.push({ text, advance: w, accent: isAccent });
      totalWidth += w;
    }
    wi++;
  }
  const m = g.measureText(card.text);
  return { runs, totalWidth, ascent: m.actualBoundingBoxAscent, descent: m.actualBoundingBoxDescent };
}

// One shared size for all cards (a title deck must not change size between lines):
// deterministic shrink via timeline.js fitFontSize, floored at font.minSize.
function relayout() {
  const W = innerWidth, H = innerHeight;
  cv.width = W; cv.height = H;
  fontPx = fitFontSize({
    measure: s => tl.cards.map(c => measureLine(s, c)),
    maxW: Math.max(1, W - 2 * cfg.safeMargin),
    maxH: Math.max(1, H - 2 * cfg.safeMargin),
    startSize: cfg.font.size,
    minSize: cfg.font.minSize,
  });
  layouts = tl.cards.map(c => measureLine(fontPx, c));
}

function render(t) {
  const W = cv.width, H = cv.height;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.fillStyle = cfg.palette.background;
  g.fillRect(0, 0, W, H);
  const card = cardAt(tl, t);
  if (!card) return;
  const { alpha, offsetY } = cardState(card, t, cfg);
  const L = layouts[card.index];
  const baselineY = H / 2 + (L.ascent - L.descent) / 2 + offsetY;
  let x = (W - L.totalWidth) / 2;
  g.font = fontSpec(fontPx);
  g.textBaseline = 'alphabetic';
  g.textAlign = 'left';
  for (const run of L.runs) {
    if (run.text) {
      g.globalAlpha = alpha;
      g.fillStyle = run.accent ? cfg.palette.accent : cfg.palette.ink;
      g.fillText(run.text, x, baselineY);
    }
    x += run.advance;
  }
  g.globalAlpha = 1;
}

// Full visible statement + actual pixel box, for the engine's readability checker.
function texts(t) {
  const card = cardAt(tl, t);
  if (!card) return [];
  const L = layouts[card.index];
  const { offsetY } = cardState(card, t, cfg);
  const W = cv.width, H = cv.height;
  const baselineY = H / 2 + (L.ascent - L.descent) / 2 + offsetY;
  const x0 = (W - L.totalWidth) / 2;
  return [{ id: card.id, text: card.text, x0, y0: baselineY - L.ascent, x1: x0 + L.totalWidth, y1: baselineY + L.descent }];
}

async function main() {
  // 1. content (required): validate before any render; actionable errors on failure.
  const contentURL = Q.get('content') || 'content.json';
  const res = await fetch(contentURL);
  if (!res.ok) throw new Error(`cannot load the content config "${contentURL}" (HTTP ${res.status}); pass --q 'content=<file>.json' with a file inside the demo folder`);
  cfg = validateConfig(await res.json());

  // 2. local font (required; never a remote CDN). The stylesheet registers
  //    fonts/SpaceGrotesk-700.woff2; --q fontfile=<path> overrides it for diagnostics.
  const family = cfg.font.family;
  const override = Q.get('fontfile');
  if (override) {
    const face = new FontFace(family, `url(${override})`, { weight: String(cfg.font.weight) });
    try { await face.load(); }
    catch (e) {
      throw new Error(`font "${family}" failed to load from ${override} (${e && e.message || e}); the file must exist inside the demo folder and be a valid font file`);
    }
    document.fonts.add(face);
  }
  await document.fonts.load(`${cfg.font.weight} 100px "${family}"`, 'Every frame is code 0');
  await document.fonts.ready;
  if (!document.fonts.check(`${cfg.font.weight} 40px "${family}"`)) {
    throw new Error(`font "${family}" (weight ${cfg.font.weight}) did not load from fonts/SpaceGrotesk-700.woff2 — check that the file exists next to fonts/fonts.css and is a valid WOFF2`);
  }

  // 3. timeline: the single source of truth (frame-aligned, duration-fitted).
  tl = buildTimeline(cfg);

  // 4. canvas from the actual viewport (default 1920x1080; --size WxH supported).
  relayout();
  addEventListener('resize', () => { try { relayout(); } catch (e) { fail(e.message); } });

  // 5. publish the page contract.
  window.DUR = tl.DUR;
  window.FPS = tl.fps;
  window.EV = [];                    // silent demo: no sound events, by design
  window.render = render;
  window.TEXTS = texts;
  window.READY = true;               // only after content+font+canvas+layout are done
}

main().catch(e => fail(String(e && e.message || e)));
