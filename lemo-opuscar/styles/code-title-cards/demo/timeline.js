// timeline.js — the single testable source of truth for Code Title Cards.
// Pure module: no DOM, no canvas, no clocks. The page (main.js), the tests and any
// preview tooling read the same numbers from here. Everything a frame renders is a
// pure function of (t, config, content) — see renderFrame contract in main.js.
//
// Card timing (STYLE.md §5):
//   fade-in 0.5 s (text rises 40 px up while fading in) → hold → fade-out 0.25 s.
//   hold = max(minimumHold, holdIntercept + wordCount / wordsPerSecond).
// Duration fitting (STYLE.md §5): if the baseline total is below the target, the extra
// hold is distributed evenly across the cards (frame remainders to the earliest cards).
// Cards are quantized to whole frames; no card is ever shorter than its prescribed
// minimum; cards never overlap; nothing is truncated. If the target cannot be reached,
// buildTimeline throws with the minimum valid duration.

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

// ---------- helpers (pure) ----------
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
// 0→1 progress of t between a and b, clamped
export const seg = (t, a, b) => (b > a ? clamp((t - a) / (b - a), 0, 1) : t >= b ? 1 : 0);
// deterministic easing: ease-out cubic for entries, ease-in cubic for exits
export const eo = p => 1 - Math.pow(1 - p, 3);
export const ei = p => p * p * p;

// ---------- tokenization ----------
// A line splits into word and space runs, preserving repeated inner whitespace.
// Outer whitespace is trimmed (documented in DEMO.md); punctuation stays attached
// to its word so spacing and order are always the author's.
export function tokenize(text) {
  const inner = String(text).replace(/^\s+|\s+$/g, '');
  if (!inner) return [];
  return inner.match(/\s+|[^\s]+/g).map(tok => (/^\s+$/.test(tok) ? { type: 'space', text: tok } : { type: 'word', text: tok }));
}

const wordPart = tok => tok.text.replace(/^[^\p{L}\p{N}]+/u, '').replace(/[^\p{L}\p{N}]+$/u, '');

// ---------- accent resolution ----------
// Exactly one word per card is accented. Resolution (documented in DEMO.md):
//  - `accentWord` matches a whole whitespace-delimited token; comparison is done on the
//    token's word part (token minus leading/trailing punctuation).
//  - If the token is exactly the accent word, the whole token (punctuation included,
//    when the author wrote it) is accented. Otherwise only the word part is accented
//    and the surrounding punctuation keeps the ink colour.
//  - Repeated occurrences: `accentOccurrence` (1-based, default 1) selects which one.
//  - A line without `accentWord` falls back to its FIRST word (documented fallback).
//  - A specified accentWord that matches no token is a validation error, never silence
//    and never randomness. Result: per token, an accent span [from, to) or null.
export function resolveAccent(tokens, line, lineNo) {
  const words = tokens.filter(t => t.type === 'word');
  if (!words.length) throw new Error(`lines[${lineNo}]: text has no words`);
  const hasExplicit = line.accentWord !== undefined && line.accentWord !== null;
  const wanted = hasExplicit ? String(line.accentWord) : '';
  if (hasExplicit && wanted.trim() === '') throw new Error(`lines[${lineNo}].accentWord must name one word of the line (got ${JSON.stringify(line.accentWord)})`);
  const occurrence = line.accentOccurrence === undefined ? 1 : line.accentOccurrence;
  if (!Number.isInteger(occurrence) || occurrence < 1) throw new Error(`lines[${lineNo}].accentOccurrence must be an integer >= 1 (got ${JSON.stringify(line.accentOccurrence)})`);
  const parts = words.map(w => wordPart(w));
  let target;
  if (!hasExplicit) target = 0;                                   // documented fallback: the first word
  else {
    const idxs = parts.reduce((a, p, i) => (p === wanted || words[i].text === wanted ? (a.push(i), a) : a), []);
    if (!idxs.length) {
      const list = words.map(w => JSON.stringify(w.text)).join(', ');
      throw new Error(`lines[${lineNo}].accentWord ${JSON.stringify(wanted)} does not match any word in the line (words: ${list})`);
    }
    if (occurrence > idxs.length) throw new Error(`lines[${lineNo}].accentOccurrence is ${occurrence} but ${JSON.stringify(wanted)} occurs ${idxs.length} time(s) in the line`);
    target = idxs[occurrence - 1];
  }
  let out = null, k = 0;
  for (const tok of tokens) {
    if (tok.type !== 'word') continue;
    if (k === target) {
      if (tok.text === wanted) out = { from: 0, to: tok.text.length };   // author wrote the punctuation too: it is accented
      else {
        const start = tok.text.indexOf(parts[target]);                    // accent the word part only; surrounding punctuation stays ink
        out = { from: start, to: start + parts[target].length };
      }
      break;
    }
    k++;
  }
  return out ? { wordIndex: target, from: out.from, to: out.to } : out;   // always set here: words.length was checked and target indexes a word
}

// ---------- validation ----------
// Collects every problem, then reports them together — actionable, never silent.
export function validateConfig(raw) {
  const errors = [];
  const num = (v, name, { min = 0, max = Infinity, integer = false } = {}) => {
    if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max || (integer && !Number.isInteger(v))) errors.push(`${name} must be a finite number${integer ? ' (integer)' : ''} in [${min}, ${max}] (got ${JSON.stringify(v)})`);
    return v;
  };
  const hex = (v, name) => { if (typeof v !== 'string' || !HEX.test(v)) errors.push(`${name} must be a hex colour like "#c8ff3d" (got ${JSON.stringify(v)})`); return v; };
  const c = {};
  if (typeof raw !== 'object' || raw === null) throw new Error('content.json must be an object');
  c.targetDuration = num(raw.targetDuration, 'targetDuration', { min: 0.1, max: 3600 });
  c.fps = num(raw.fps, 'fps', { min: 1, max: 120, integer: true });
  c.safeMargin = num(raw.safeMargin, 'safeMargin', { min: 0, max: 4096 });
  c.fadeIn = num(raw.fadeIn, 'fadeIn', { min: 0, max: 60 });
  c.fadeOut = num(raw.fadeOut, 'fadeOut', { min: 0, max: 60 });
  c.riseDistance = num(raw.riseDistance, 'riseDistance', { min: 0, max: 4096 });
  c.minimumHold = num(raw.minimumHold, 'minimumHold', { min: 0, max: 3600 });
  c.holdIntercept = num(raw.holdIntercept, 'holdIntercept', { min: 0, max: 3600 });
  c.wordsPerSecond = num(raw.wordsPerSecond, 'wordsPerSecond', { min: 0.1, max: 100 });
  if (typeof raw.palette !== 'object' || raw.palette === null) errors.push('palette must be an object');
  else c.palette = { background: hex(raw.palette.background, 'palette.background'), ink: hex(raw.palette.ink, 'palette.ink'), accent: hex(raw.palette.accent, 'palette.accent') };
  if (typeof raw.font !== 'object' || raw.font === null) errors.push('font must be an object');
  else {
    if (typeof raw.font.family !== 'string' || !raw.font.family.trim()) errors.push(`font.family must be a non-empty string (got ${JSON.stringify(raw.font.family)})`);
    c.font = { family: raw.font.family, weight: num(raw.font.weight, 'font.weight', { min: 1, max: 1000 }), size: num(raw.font.size, 'font.size', { min: 4, max: 4096 }), minSize: num(raw.font.minSize, 'font.minSize', { min: 4, max: 4096 }) };
    if (Number.isFinite(c.font.size) && Number.isFinite(c.font.minSize) && c.font.size < c.font.minSize) errors.push(`font.size (${c.font.size}) must be >= font.minSize (${c.font.minSize})`);
  }
  if (!Array.isArray(raw.lines) || !raw.lines.length) errors.push('lines must be a non-empty array');
  else {
    c.lines = raw.lines.map((l, i) => {
      if (typeof l !== 'object' || l === null || typeof l.text !== 'string' || !l.text.trim()) { errors.push(`lines[${i}].text must be a non-empty string`); return { text: '' }; }
      const tokens = tokenize(l.text);
      try { resolveAccent(tokens, l, i); } catch (e) { errors.push(e.message); }
      return { text: l.text, accentWord: l.accentWord, accentOccurrence: l.accentOccurrence };
    });
  }
  if (errors.length) throw new Error('content.json is invalid:\n  - ' + errors.join('\n  - '));
  return c;
}

// ---------- timeline ----------
// hold seconds for one card, from the prescribed formula
export const holdFor = (cfg, wordCount) => Math.max(cfg.minimumHold, cfg.holdIntercept + wordCount / cfg.wordsPerSecond);

export function buildTimeline(cfg) {
  const fps = cfg.fps, n = cfg.lines.length;
  const cards = cfg.lines.map((l, i) => {
    const tokens = tokenize(l.text);
    const accent = resolveAccent(tokens, l, i);
    const wordCount = tokens.filter(t => t.type === 'word').length;
    const hold = holdFor(cfg, wordCount);
    const baseFrames = Math.ceil((cfg.fadeIn + hold + cfg.fadeOut) * fps - 1e-9);   // >= prescribed minimum after quantization
    return { index: i, id: `line-${i}`, text: l.text.replace(/^\s+|\s+$/g, ''), tokens, accent, wordCount, hold, baseFrames };
  });
  const totalBase = cards.reduce((s, c) => s + c.baseFrames, 0);
  const targetFrames = Math.round(cfg.targetDuration * fps);
  if (totalBase > targetFrames) {
    throw new Error(`targetDuration ${cfg.targetDuration}s (${targetFrames} frames @ ${fps} fps) cannot be reached: the ${n} card(s) need at least ${totalBase} frames = ${(totalBase / fps).toFixed(3)}s. Raise targetDuration to >= ${(totalBase / fps).toFixed(3)}s, shorten the lines, or lower the fades/minimumHold.`);
  }
  const extra = targetFrames - totalBase, add = Math.floor(extra / n), rem = extra - add * n;
  let cursor = 0;
  for (const c of cards) {
    c.frames = c.baseFrames + add + (c.index < rem ? 1 : 0);
    c.start = cursor / fps;
    cursor += c.frames;
    c.end = cursor / fps;
    c.holdSeconds = c.hold + (c.frames / fps - (cfg.fadeIn + c.hold + cfg.fadeOut));  // displayed hold after fitting
  }
  return { cards, fps, totalFrames: cursor, DUR: cursor / fps, targetFrames };
}

// active card at t (cards are sequential, non-overlapping; null in the never-occurring gaps at exact boundaries' end)
export function cardAt(tl, t) {
  for (const c of tl.cards) if (t >= c.start && t < c.end) return c;
  return null;
}

// ---------- font-size fitting ----------
// Deterministic shrink: start at font.size, estimate the needed scale from measured
// metrics, floor to whole px, never go below minSize. `measure(size)` must return one
// { totalWidth, ascent, descent } per card (canvas-measured in the page; faked in
// tests). Throws with an actionable message if even minSize overflows the safe area —
// text is never silently cropped.
export function fitFontSize({ measure, maxW, maxH, startSize, minSize }) {
  const fits = s => measure(s).every(m => m.totalWidth <= maxW && (m.ascent + m.descent) <= maxH);
  let size = startSize;
  for (let i = 0; i < 32 && size > minSize && !fits(size); i++) {
    const ms = measure(size);
    // the binding constraint decides: shrinking by the LARGER ratio makes BOTH dimensions fit
    const scale = Math.max(1.0001,
      Math.max(...ms.map(m => m.totalWidth / maxW)),
      Math.max(...ms.map(m => (m.ascent + m.descent) / maxH)));
    size = Math.max(minSize, Math.floor(size / scale * 0.98));
  }
  if (!fits(size)) {
    const worst = measure(minSize).reduce((a, b) => (b.totalWidth > a ? b.totalWidth : a), 0);
    throw new Error(`text exceeds the safe area even at the minimum font size ${minSize}px (safe area ${maxW}x${maxH}px; widest line needs ${Math.round(worst)}px). Shorten a line, lower safeMargin, or raise font.minSize — text is never cropped.`);
  }
  return size;
}

// opacity + rise offset for a card at absolute time t (pure; the only motion model)
export function cardState(card, t, cfg) {
  const lt = t - card.start;
  const pIn = seg(lt, 0, cfg.fadeIn);
  const aIn = eo(pIn);
  let alpha = aIn;
  if (cfg.fadeOut > 0 && t > card.end - cfg.fadeOut) alpha *= 1 - ei(seg(t, card.end - cfg.fadeOut, card.end));
  const offsetY = cfg.riseDistance * (1 - aIn);
  return { alpha, offsetY, pIn };
}
