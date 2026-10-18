// support.mjs — shared drawing helpers for the Wow! film (deterministic).
// Palette/type per STORYBOARD.md; every helper is a pure function of (ctx, t, params).
export const PAL = {
  bg: "#070b16", panel: "#0d1424", ink: "#f4f2ec", dim: "#8fa0b8",
  signal: "#4be1a0", cyan: "#58c7f0", crimson: "#c0392b",
  beige: "#e8dfc8", warn: "#e0b34c",
};
export const FONT = {
  title: "bold %Spx 'DejaVu Sans'",
  body: "%Spx 'Carlito'",
  mono: "%Spx 'DejaVu Sans Mono'",
};
export function fnt(kind, size) { return FONT[kind].replace("%S", size); }

// mulberry32 — seeded PRNG (deterministic across runs/frames)
export function prng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const easeOut = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const lerp = (a, b, x) => a + (b - a) * x;

export function bg(ctx, W, H) {
  ctx.fillStyle = PAL.bg; ctx.fillRect(0, 0, W, H);
}

// vignette for depth (static, deterministic)
export function vignette(ctx, W, H, strength = 0.42) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// deterministic two-layer starfield, slow drift over t
export function starfield(ctx, W, H, t, seed = 7, drift = 6) {
  const rnd = prng(seed);
  for (const [n, size, alpha] of [[130, 1.6, 0.75], [50, 2.6, 0.95]]) {
    for (let i = 0; i < n; i++) {
      const x0 = rnd() * W, y0 = rnd() * H;
      const tw = 0.55 + 0.45 * Math.sin(t * 0.7 + i * 2.399);
      const x = (x0 + t * drift * (size > 2 ? 1 : 0.45)) % W;
      ctx.globalAlpha = alpha * tw;
      ctx.fillStyle = i % 7 === 0 ? PAL.cyan : "#ffffff";
      ctx.beginPath(); ctx.arc(x, y0, size * 0.7, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// grain (deterministic hash pattern, quantized time so it doesn't shimmer per frame)
export function grain(ctx, W, H, t, seed = 99, amount = 0.05) {
  const q = Math.floor(t * 12); // 12Hz grain step
  const rnd = prng(seed + q * 7919);
  ctx.globalAlpha = amount;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 420; i++) {
    ctx.fillRect(rnd() * W, rnd() * H, 2, 2);
  }
  ctx.globalAlpha = 1;
}

// reconstruction label (bottom-left)
export function reconLabel(ctx, W, H, text = "RECONSTRUCTION") {
  ctx.font = fnt("body", 26);
  ctx.fillStyle = "rgba(143,160,184,0.85)";
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillText(text, 44, H - 40);
}

// kicker chip (top-left)
export function chip(ctx, x, y, text, color = PAL.dim, size = 30) {
  ctx.font = fnt("body", size);
  const w = ctx.measureText(text.toUpperCase()).width + 36;
  ctx.strokeStyle = color; ctx.globalAlpha = 0.85;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, size + 22);
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), x + 18, y + (size + 22) / 2 + 1);
  return w;
}

// center-aligned display text with tracking
export function displayText(ctx, cx, cy, text, size, color = PAL.ink, tracking = 6, font = "title") {
  ctx.font = fnt(font, size);
  let total = 0;
  for (const ch of text) total += ctx.measureText(ch).width + tracking;
  total -= tracking;
  let x = cx - total / 2;
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  for (const ch of text) {
    ctx.fillText(ch, x, cy);
    x += ctx.measureText(ch).width + tracking;
  }
}

// multi-line paragraph, left or centered
export function paragraph(ctx, x, y, w, lines, size, color = PAL.ink, lh = 1.42, align = "left", font = "body") {
  ctx.font = fnt(font, size);
  ctx.fillStyle = color;
  ctx.textAlign = align; ctx.textBaseline = "alphabetic";
  let yy = y;
  for (const ln of lines) { ctx.fillText(ln, x, yy); yy += size * lh; }
  return yy;
}

// word-wrap helper
export function wrap(ctx, text, maxWidth, size, font = "body") {
  ctx.font = fnt(font, size);
  const words = text.split(/\s+/); const lines = []; let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// burned caption (2 lines, bottom center, panel backdrop for readability)
export function caption(ctx, W, H, text) {
  if (!text) return;
  const lines = text.split("\n");
  const size = 40, lh = size * 1.3;
  ctx.font = fnt("body", size);
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const boxW = widest + 72, boxH = lines.length * lh + 40;
  const bx = (W - boxW) / 2, by = H - 178 - boxH / 2 + boxH / 2;
  ctx.fillStyle = "rgba(5,8,16,0.72)";
  ctx.fillRect(bx, H - 196, boxW, boxH);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = PAL.ink;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, H - 196 + 20 + lh * (i + 0.5)));
}

// Ken Burns on a loaded image (cover fit, deterministic push)
export function kenBurns(ctx, img, W, H, t, t0, t1, zoom = 0.06, panX = 0, panY = -0.4) {
  if (!img) return;
  const p = easeOut((t - t0) / Math.max(0.001, t1 - t0));
  const scale = 1 + zoom * p;
  const iw = img.width, ih = img.height;
  const cover = Math.max(W / iw, H / ih) * scale;
  const dw = iw * cover, dh = ih * cover;
  const dx = (W - dw) / 2 + panX * p * (dw - W) * 0.3;
  const dy = (H - dh) / 2 + panY * p * (dh - H) * 0.3;
  ctx.drawImage(img, dx, dy, dw, dh);
}

// fade helpers (deterministic)
export function fadeIn(ctx, W, H, t, t0, dur = 0.6) {
  const a = clamp01((t - t0) / dur);
  if (a < 1) { ctx.fillStyle = PAL.bg; ctx.globalAlpha = 1 - a; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
export function fadeOut(ctx, W, H, t, t1, dur = 0.6) {
  const a = clamp01((t1 - t) / dur);
  if (a < 1) { ctx.fillStyle = PAL.bg; ctx.globalAlpha = 1 - a; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

// the beam-transit arch (Kraus curve) — used by SC01/SC11
export function transitArch(ctx, x, y, w, h, p, color = PAL.signal) {
  // p in [0,1] draws the curve progressively; height follows Gaussian-ish shape
  ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.beginPath();
  const N = 90;
  for (let i = 0; i <= N * p; i++) {
    const x01 = i / N;
    const yv = Math.exp(-Math.pow((x01 - 0.5) / 0.24, 2) / 2) * h;
    const px = x + x01 * w, py = y - yv;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
}
