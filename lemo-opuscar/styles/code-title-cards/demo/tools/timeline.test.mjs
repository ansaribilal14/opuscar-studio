// timeline.test.mjs — pure unit tests for Code Title Cards (task spec §13 A–F).
// Run from the library root: node --test styles/code-title-cards/demo/tools/timeline.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { validateConfig, buildTimeline, cardAt, cardState, tokenize, resolveAccent, fitFontSize, holdFor, seg, eo, ei } from '../timeline.js';

const here = dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(readFileSync(join(here, '..', 'content.json'), 'utf8'));
const cfg = validateConfig(raw);
const tl = buildTimeline(cfg);

// ---------- A. configuration validation ----------
test('A: default content.json validates', () => {
  assert.equal(cfg.lines.length, 5);
  assert.equal(cfg.fps, 30);
  assert.equal(cfg.palette.background, '#0b0b0f');
});
test('A: invalid configs are rejected with actionable, collected errors', () => {
  const bad = { ...raw, fps: 0, palette: { ...raw.palette, accent: 'green' }, safeMargin: -4, lines: [{ text: 'x', accentWord: 'y' }] };
  try { validateConfig(bad); assert.fail('should have thrown'); }
  catch (e) {
    const m = String(e.message);
    assert.match(m, /fps/);
    assert.match(m, /palette\.accent/);
    assert.match(m, /safeMargin/);
    assert.match(m, /accentWord/);
    assert.equal(m.split('\n  - ').length >= 4, true, 'collects multiple problems');
  }
});
test('A: empty/whitespace text and missing lines are rejected', () => {
  assert.throws(() => validateConfig({ ...raw, lines: [{ text: '   ' }] }), /lines\[0\]\.text|no words|non-empty/);
  assert.throws(() => validateConfig({ ...raw, lines: [] }), /non-empty array/);
});

// ---------- B. card starts, durations, boundaries ----------
test('B: cards are sequential, frame-aligned, non-overlapping', () => {
  let cursor = 0;
  for (const c of tl.cards) {
    assert.equal(c.start, cursor / cfg.fps, `card ${c.index} starts exactly where the previous ended`);
    assert.ok(Number.isInteger(c.start * cfg.fps) && Number.isInteger(c.end * cfg.fps), `card ${c.index} boundaries on the frame grid`);
    assert.ok(c.end > c.start);
    cursor += c.frames;
  }
  assert.equal(cursor, tl.totalFrames);
  assert.ok(cardAt(tl, tl.DUR - 1e-9) === tl.cards[4], 'last card is active on the final frame');
  assert.equal(cardAt(tl, tl.DUR), null, 'no card at/after the end');
});
test('B: cardAt boundaries land on card starts', () => {
  for (const c of tl.cards) assert.equal(cardAt(tl, c.start), c, `t=${c.start} activates card ${c.index}`);
});

// ---------- C. minimum hold durations ----------
test('C: no card is shorter than its prescribed minimum after quantization', () => {
  for (const c of tl.cards) {
    const minDur = cfg.fadeIn + holdFor(cfg, c.wordCount) + cfg.fadeOut;
    assert.ok(c.frames / cfg.fps >= minDur - 1e-9, `card ${c.index}: ${c.frames} frames >= ${minDur.toFixed(3)}s`);
  }
});
test('C: hold formula matches the spec (max(1.2, 0.35 + words/3.2))', () => {
  assert.equal(holdFor(cfg, 4), Math.max(1.2, 0.35 + 4 / 3.2));
  assert.equal(holdFor(cfg, 2), Math.max(1.2, 0.35 + 2 / 3.2));   // 1.2 floor active
  assert.ok(holdFor(cfg, 2) === 1.2);
});

// ---------- D. 15–20 s duration fitting ----------
test('D: default config fills the 18 s target exactly (frame-aligned)', () => {
  assert.equal(tl.targetFrames, 540);
  assert.equal(tl.totalFrames, 540);
  assert.equal(tl.DUR, 18.0);
});
test('D: extra hold is distributed evenly, remainders to the earliest cards', () => {
  const base = tl.cards.map(c => Math.ceil((cfg.fadeIn + c.hold + cfg.fadeOut) * cfg.fps - 1e-9));
  const extra = 540 - base.reduce((a, b) => a + b, 0);
  const add = Math.floor(extra / 5), rem = extra - add * 5;
  tl.cards.forEach((c, i) => assert.equal(c.frames, base[i] + add + (i < rem ? 1 : 0), `card ${i} gets its share`));
});
test('D: a shorter target still fits by distributing hold', () => {
  const c2 = validateConfig({ ...raw, targetDuration: 12.5 });
  const t2 = buildTimeline(c2);
  assert.equal(t2.DUR, 12.5);
  for (const card of t2.cards) assert.ok(card.frames / c2.fps >= c2.fadeIn + holdFor(c2, card.wordCount) + c2.fadeOut - 1e-9);
});
test('D: an unreachable target fails with the minimum valid duration', () => {
  try { buildTimeline(validateConfig({ ...raw, targetDuration: 1.0 })); assert.fail('should have thrown'); }
  catch (e) {
    const base = tl.cards.reduce((s, c) => s + Math.ceil((cfg.fadeIn + c.hold + cfg.fadeOut) * cfg.fps - 1e-9), 0);
    assert.match(String(e.message), new RegExp(`${(base / 30).toFixed(3)}`));
  }
});

// ---------- E. exactly one accent word per line ----------
test('E: every default line resolves exactly one accent span, on the right word', () => {
  const expected = ['code', 'filmed', 'input', 'pixels', 'free'];
  tl.cards.forEach((c, i) => {
    assert.ok(c.accent, `card ${i} has an accent`);
    const tok = c.tokens.filter(t => t.type === 'word')[c.accent.wordIndex];
    assert.equal(tok.text.slice(c.accent.from, c.accent.to), expected[i]);
  });
});
test('E: accent never colours punctuation; whole-token match colours it when authored', () => {
  const t1 = tokenize('Stop, look: "go."');
  const a1 = resolveAccent(t1, { text: 'x', accentWord: 'go' }, 0);
  const wordTok = t1.filter(t => t.type === 'word')[2];
  assert.equal(wordTok.text, '"go."');
  assert.equal(wordTok.text.slice(a1.from, a1.to), 'go');
  const a2 = resolveAccent(t1, { text: 'x', accentWord: '"go."' }, 0);
  assert.deepEqual([a2.from, a2.to], [0, wordTok.text.length]);
});
test('E: repeated occurrences resolve deterministically via accentOccurrence', () => {
  const toks = tokenize('same code, same code');
  const first = resolveAccent(toks, { text: 'x', accentWord: 'code' }, 0);
  const second = resolveAccent(toks, { text: 'x', accentWord: 'code', accentOccurrence: 2 }, 0);
  assert.equal(first.wordIndex, 1);
  assert.equal(second.wordIndex, 3);
  assert.throws(() => resolveAccent(toks, { text: 'x', accentWord: 'code', accentOccurrence: 3 }, 0), /occurs 2/);
});
test('E: missing accentWord falls back to the first word; unknown word errors', () => {
  const toks = tokenize('one two three');
  const a = resolveAccent(toks, { text: 'x' }, 0);
  assert.deepEqual([a.wordIndex, a.from, a.to], [0, 0, 3]);
  assert.throws(() => resolveAccent(toks, { text: 'x', accentWord: 'four' }, 0), /does not match any word/);
});

// ---------- F. safe-margin / font-size behaviour (pure half; pixel half is in pixel.test) ----------
const fakeMeasure = charW => size => tl.cards.map(c => ({ totalWidth: c.text.length * charW * size, ascent: size * 0.75, descent: size * 0.25 }));
test('F: a wide line shrinks deterministically to fit the safe area', () => {
  const size = fitFontSize({ measure: fakeMeasure(0.9), maxW: 1632, maxH: 792, startSize: 168, minSize: 72 });
  assert.ok(size < 168 && size >= 72);
  assert.deepEqual(size, fitFontSize({ measure: fakeMeasure(0.9), maxW: 1632, maxH: 792, startSize: 168, minSize: 72 }), 'same inputs, same size');
});
test('F: an impossible line throws instead of cropping', () => {
  assert.throws(() => fitFontSize({ measure: fakeMeasure(6), maxW: 1632, maxH: 792, startSize: 168, minSize: 72 }), /exceeds the safe area|never cropped/);
});
test('F: a comfortable line keeps the starting size', () => {
  assert.equal(fitFontSize({ measure: fakeMeasure(0.15), maxW: 1632, maxH: 792, startSize: 168, minSize: 72 }), 168);
});

// ---------- motion model sanity ----------
test('motion: fade-in rises to rest, fade-out holds position, pure easing', () => {
  const c = tl.cards[0];
  const atStart = cardState(c, c.start, cfg), atRest = cardState(c, c.start + cfg.fadeIn, cfg), nearEnd = cardState(c, c.end - 1e-9, cfg);
  assert.equal(atStart.alpha, 0);
  assert.ok(atStart.offsetY === cfg.riseDistance && atRest.offsetY === 0, 'rises exactly riseDistance px');
  assert.equal(atRest.alpha, 1);
  assert.ok(nearEnd.alpha < 1e-6, 'fades (numerically) fully out at the boundary');
  assert.equal(nearEnd.offsetY, 0, 'no positional move during fade-out');
  assert.deepEqual([seg(0.25, 0, 0.5), eo(0), eo(1), ei(0), ei(1)], [0.5, 0, 1, 0, 1]);
  // determinism of the pure model: same t, same numbers
  assert.deepEqual(cardState(c, 2.0, cfg), cardState(c, 2.0, cfg));
});
