// engine.mjs — visual primitives for video-003 "The Isdal Woman"
// Deterministic case-file aesthetic: ink desk, bone paper cards, amber accents.
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require("fs");

// ---------- deterministic RNG ----------
export function RNG(seed = 1) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + (t >>> 7); return ((t ^ (t >>> 16)) >>> 0) / 4294967296; };
}
export const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // inOutQuad
export const easeOut = t => 1 - Math.pow(1 - t, 3);
// progress of local time window [a,b] seconds -> clamped eased 0..1
export const win = (t, a, b) => ease(clamp((t - a) / Math.max(0.0001, b - a)));

// ---------- palette ----------
export const C = {
  bg: "#121417", bgDeep: "#0c0e10",
  paper: "#e9e2d3", paperDim: "#cfc7b4", paperEdge: "#a89f8a",
  ink: "#1c1a16", inkSoft: "#4a463e",
  amber: "#c9a35c", red: "#a33c2f", slate: "#5d7285",
  mono: "DejaVu Sans Mono", serif: "DejaVu Serif", body: "Carlito",
};

// ---------- fonts ----------
export function font(ctx, size, family = C.body, weight = "") {
  ctx.font = `${weight ? weight + " " : ""}${size}px "${family}"`;
}

// ---------- text helpers ----------
export function text(ctx, str, x, y, size, opts = {}) {
  const { family = C.body, color = C.ink, align = "left", weight = "", spacing = 0, alpha = 1, maxWidth = 0, lineHeight = 1.32 } = opts;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  font(ctx, size, family, weight);
  if (spacing) { // manual letter spacing (canvas lacks letterSpacing in node)
    ctx.textAlign = align;
    if (align === "center") { ctx.textAlign = "left"; x -= measureSpaced(ctx, str, spacing) / 2; }
    else if (align === "right") { ctx.textAlign = "left"; x -= measureSpaced(ctx, str, spacing); }
    let cx = x;
    for (const ch of str) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + spacing; }
  } else {
    ctx.textAlign = align;
    if (maxWidth && family === C.body) {
      wrapText(ctx, str, x, y, maxWidth, size * lineHeight, opts);
    } else {
      ctx.fillText(str, x, y);
    }
  }
  ctx.restore();
  return y;
}
function measureSpaced(ctx, str, spacing) {
  let w = 0; for (const ch of str) w += ctx.measureText(ch).width + spacing; return Math.max(0, w - spacing);
}
export function wrapText(ctx, str, x, y, maxW, lineH, opts = {}) {
  const words = str.split(/\s+/);
  let line = "", yy = y;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy); line = w; yy += lineH;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
  return yy;
}
export function textW(ctx, str, size, family = C.body, weight = "") {
  font(ctx, size, family, weight); return ctx.measureText(str).width;
}

// ---------- paper card ----------
export function paperCard(ctx, x, y, w, h, opts = {}) {
  const { alpha = 1, tilt = 0, shadow = 26 } = opts;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (tilt) { ctx.translate(x + w / 2, y + h / 2); ctx.rotate(tilt); ctx.translate(-(x + w / 2), -(y + h / 2)); }
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.filter = "blur(1px)";
  ctx.fillRect(x + 3, y + 4, w, h);
  ctx.filter = "none";
  ctx.fillStyle = C.paper;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = C.paperEdge; ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  // subtle top light
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "rgba(255,255,255,0.10)"); g.addColorStop(0.25, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(60,50,30,0.06)");
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// tape strip on a card
export function tape(ctx, cx, y, w, alpha = 0.55) {
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.fillStyle = "rgba(200,190,150,0.5)";
  ctx.translate(cx, y); ctx.rotate(-0.03);
  ctx.fillRect(-w / 2, -8, w, 16);
  ctx.fillStyle = "rgba(120,110,80,0.35)";
  ctx.fillRect(-w / 2, -8, w, 3); ctx.fillRect(-w / 2, 5, w, 3);
  ctx.restore();
}

// ---------- stamps ----------
export function stamp(ctx, label, x, y, size, color = C.red, alpha = 1, angle = -0.06) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y); ctx.rotate(angle);
  font(ctx, size, C.mono, "bold");
  const w = ctx.measureText(label).width;
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.5, size * 0.09);
  ctx.strokeRect(-w / 2 - 10, -size * 0.85, w + 20, size * 1.7);
  ctx.fillStyle = color; ctx.textAlign = "center";
  ctx.fillText(label, 0, size * 0.35);
  ctx.restore();
  return w + 20;
}

// ---------- chrome (every frame) ----------
export function chrome(ctx, W, H, t, globalT, opts = {}) {
  const { showCase = true, grainSeed = 7 } = opts;
  // base
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  // vignette
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, "rgba(30,34,40,0.18)"); g.addColorStop(1, "rgba(5,6,8,0.55)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // static grain (deterministic, no flicker)
  const rnd = RNG(grainSeed);
  ctx.save(); ctx.globalAlpha = 0.05;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 90; i++) ctx.fillRect(rnd() * W, rnd() * H, 1.2, 1.2);
  ctx.restore();
  // case stamp
  if (showCase) {
    text(ctx, "CASE FILE 9-6-69", 26, H - 22, 13, { family: C.mono, color: C.amber, alpha: 0.55, spacing: 2 });
    text(ctx, "SAN FRANCISCO BAY AREA — 1969", 26, H - 22, 13, { family: C.mono, color: "#8a8577", alpha: 0.0, spacing: 2 });
    const label = "THE ZODIAC KILLER";
    const w = textW(ctx, label, 11, C.mono);
    text(ctx, label, W - 26 - w, H - 22, 11, { family: C.mono, color: "#8a8577", alpha: 0.55, spacing: 2 });
  }
}

// film fade in/out at edges of a scene
export function edgeFade(ctx, W, H, tLocal, dur, fadeIn = 0.45, fadeOut = 0.45) {
  let a = 0;
  if (tLocal < fadeIn) a = 1 - tLocal / fadeIn;
  else if (tLocal > dur - fadeOut) a = clamp((tLocal - (dur - fadeOut)) / fadeOut);
  if (a > 0.001) {
    ctx.fillStyle = `rgba(10,11,13,${clamp(a)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

// camera push helper: returns [ctx] transformed
export function camera(ctx, W, H, p, zoom = 0.035, driftX = 6, driftY = 4) {
  const s = 1 + zoom * p;
  ctx.translate(W / 2 + driftX * p, H / 2 + driftY * p);
  ctx.scale(s, s);
  ctx.translate(-W / 2, -H / 2);
}

// fog banks (drifting ellipses), deterministic
export function fog(ctx, W, H, t, seed = 3, alpha = 0.05) {
  const rnd = RNG(seed);
  ctx.save();
  for (let i = 0; i < 7; i++) {
    const bx = rnd() * W, by = H * (0.35 + rnd() * 0.5), w = W * (0.3 + rnd() * 0.4), h = H * (0.06 + rnd() * 0.1);
    const sp = 8 + rnd() * 14;
    const x = ((bx + t * sp) % (W + w)) - w / 2;
    const gr = ctx.createRadialGradient(x, by, 0, x, by, w / 2);
    gr.addColorStop(0, `rgba(160,170,180,${alpha})`); gr.addColorStop(1, "rgba(160,170,180,0)");
    ctx.fillStyle = gr;
    ctx.save(); ctx.translate(x, by); ctx.scale(1, h / (w / 2)); ctx.translate(-x, -by);
    ctx.beginPath(); ctx.arc(x, by, w / 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// image loader with cache (for real photos)
const imgCache = new Map();
export function loadImageSafe(p) {
  if (imgCache.has(p)) return imgCache.get(p);
  const { loadImage } = require("canvas");
  if (!fs.existsSync(p)) { imgCache.set(p, null); return null; }
  try { const im = loadImage(p); imgCache.set(p, im); return im; }
  catch { imgCache.set(p, null); return null; }
}
// draw an image "cover" inside a frame with white archive border + caption
export function archivePhoto(ctx, img, x, y, w, h, caption, credit, reveal = 1, gradeTop = 0.18, gradeBottom = 0.42) {
  if (!img) return false;
  const iw = img.width, ih = img.height;
  const s = Math.max(w / iw, h / ih);
  ctx.save();
  ctx.globalAlpha *= reveal;
  // photo
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.drawImage(img, x + (w - iw * s) / 2, y + (h - ih * s) / 2, iw * s, ih * s);
  // grade: desaturate-ish dark overlay for cohesion
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, `rgba(18,20,23,${gradeTop})`); g.addColorStop(1, `rgba(18,20,23,${gradeBottom})`);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.restore();
  // caption strip
  ctx.save(); ctx.globalAlpha *= reveal;
  ctx.fillStyle = "rgba(10,11,13,0.72)";
  ctx.fillRect(x, y + h - 26, w, 26);
  text(ctx, caption, x + 10, y + h - 9, 11, { family: C.mono, color: "#d8d2c4" });
  if (credit) {
    const cw = textW(ctx, credit, 9, C.mono);
    text(ctx, credit, x + w - 10 - cw, y + h - 9, 9, { family: C.mono, color: C.amber });
  }
  ctx.strokeStyle = "rgba(233,226,211,0.25)"; ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.restore();
  return true;
}

// horizontal timeline strip 1970..2026
export function timelineStrip(ctx, x, y, w, p, marks) {
  const years = [1970, 1980, 1990, 2000, 2010, 2020];
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.4);
  ctx.strokeStyle = "#3a3f47"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * clamp(p * 1.2), y); ctx.stroke();
  for (const yr of years) {
    const px = x + w * ((yr - 1970) / 56);
    text(ctx, String(yr), px, y + 20, 10, { family: C.mono, color: "#6f6a5e", align: "center" });
    ctx.fillStyle = "#6f6a5e"; ctx.fillRect(px - 0.5, y - 3, 1, 6);
  }
  for (const m of marks) {
    if (m.year > 1970 + 56 * p) continue;
    const px = x + w * ((m.year - 1970) / 56);
    ctx.fillStyle = m.color || C.amber;
    ctx.beginPath(); ctx.arc(px, y, 3.5, 0, Math.PI * 2); ctx.fill();
    if (m.label) text(ctx, m.label, px, y - 14, 10, { family: C.mono, color: "#a49e8f", align: "center" });
  }
  ctx.restore();
}

// bullet list reveal on paper card
export function bullets(ctx, items, x, y, size, maxW, p, opts = {}) {
  const { color = C.ink, family = C.body, gap = size * 1.62, marker = "—", markerColor = C.amber } = opts;
  let yy = y;
  const n = items.length;
  items.forEach((it, i) => {
    const ip = clamp(p * n - i, 0, 1);
    if (ip <= 0) { yy += gap; return; }
    const a = easeOut(ip);
    text(ctx, marker, x, yy, size * 0.8, { family: C.mono, color: markerColor, alpha: a });
    text(ctx, it, x + size * 1.1, yy, size, { family, color, alpha: a, maxWidth: maxW });
    yy += gap;
  });
  return yy;
}
