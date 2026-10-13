// film_look.mjs — v2 cinematic layer for video-003 (photo-first, 1080p)
// Design: Nordic-noir case file. Every frame carries a luminance floor, animated
// grain, gentle vignette and halation. Real photos get Ken Burns + cold grade.
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require("fs");
import { RNG, clamp, lerp, ease, easeOut, text, font, textW, C } from "./engine.mjs";

export const PAL = {
  bgTop: "#1b2027", bgMid: "#141920", bgBot: "#0f1218",
  lift: "rgba(62,74,90,0.22)",
  bone: "#eae3d4", boneDim: "#b9b1a0", boneFaint: "#8d8677",
  amber: "#d2a85e", amberDim: "rgba(210,168,94,0.55)",
  red: "#b0402f", slate: "#8ba0b4", ink: "#17181a",
  mono: "DejaVu Sans Mono", serif: "DejaVu Serif", body: "Carlito",
};

// ---------- graded photo cache (desaturate + cool once, reuse every frame) ----------
const photoCache = new Map();
function gradePixels(img) {
  const TW = 2300, TH = Math.round(TW * img.height / img.width);
  const { createCanvas } = require("canvas");
  const cv = createCanvas(TW, TH), cx = cv.getContext("2d");
  cx.drawImage(img, 0, 0, TW, TH);
  const d = cx.getImageData(0, 0, TW, TH), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const l = 0.30 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2];
    // desaturate to 38%, cool the shadows, lift blacks slightly
    const sat = 0.38;
    let r = l + (p[i] - l) * sat, g = l + (p[i + 1] - l) * sat, b = l + (p[i + 2] - l) * sat;
    const shadow = clamp(1 - l / 128);
    b += 14 * shadow; g += 6 * shadow;
    const lift = 10;
    r = lift + (r * (255 - lift)) / 255; g = lift + (g * (255 - lift)) / 255; b = lift + (b * (255 - lift)) / 255;
    p[i] = r; p[i + 1] = g; p[i + 2] = b;
  }
  cx.putImageData(d, 0, 0);
  return cv;
}
const PHOTO_NAMES = [
  "isdalen_valley.jpg", "misty_fjord.jpg", "moody_peak.jpg", "archive_folders.jpg",
  "bergen_station.jpg", "bergen_1970s.jpg", "police_sketch.jpg", "stavanger_street.jpg",
  "train_winter.jpg", "rorbu_coast.jpg", "hairpin_road.jpg",
];
// preload all photos once at module init (top-level await — deterministic for every frame)
{
  const { loadImage } = require("canvas");
  for (const n of PHOTO_NAMES) {
    const p = process.cwd() + `/images/cache/${n}`;
    try { photoCache.set(n, gradePixels(await loadImage(p))); }
    catch (e) { console.error("photo fail", n, e.message); photoCache.set(n, null); }
  }
}
export function photo(name) {
  if (!photoCache.has(name)) photoCache.set(name, null);
  return photoCache.get(name);
}

// ---------- Ken Burns cover draw ----------
// opts: zoom [from,to], pan [x0,y0,x1,y1] (fractions of overshoot), scrim (0..0.6)
export function photoPlate(ctx, W, H, tLocal, dur, name, opts = {}) {
  const img = photo(name);
  const { zoom = [1.04, 1.13], pan = [0, 0, -0.35, -0.2], scrim = 0.42, dark = 0 } = opts;
  const p = ease(clamp(tLocal / Math.max(0.001, dur)));
  if (!img) { // fallback plate if photo missing
    ctx.fillStyle = "#141920"; ctx.fillRect(0, 0, W, H); return false;
  }
  const iw = img.width, ih = img.height;
  const z = lerp(zoom[0], zoom[1], p);
  const cover = Math.max(W / iw, H / ih) * z;
  const dw = iw * cover, dh = ih * cover;
  const freeX = dw - W, freeY = dh - H;
  const dx = lerp(pan[0], pan[2], p) * freeX;
  const dy = lerp(pan[1], pan[3], p) * freeY;
  ctx.drawImage(img, -dx - (freeX > 0 ? 0 : (W - dw) / 2), -dy - (freeY > 0 ? 0 : (H - dh) / 2), dw, dh);
  // cold unify + bottom scrim for text
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(16,22,32,0.30)"); g.addColorStop(0.55, "rgba(14,18,26,0.18)"); g.addColorStop(1, "rgba(8,10,14,0.62)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (scrim > 0) {
    const s = ctx.createLinearGradient(0, H * (1 - scrim * 1.6), 0, H);
    s.addColorStop(0, "rgba(10,12,16,0)"); s.addColorStop(1, `rgba(9,11,15,${0.78 * (scrim / 0.42)})`);
    ctx.fillStyle = s; ctx.fillRect(0, 0, W, H);
  }
  if (dark > 0) { ctx.fillStyle = `rgba(8,10,14,${dark})`; ctx.fillRect(0, 0, W, H); }
  return true;
}

// photo in a bordered frame with caption strip (archive look)
export function photoCard(ctx, name, x, y, w, h, caption, credit, reveal = 1, tLocal = 0, zoom = 0.06) {
  const img = photo(name);
  ctx.save();
  const sh = 30;
  ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.filter = "blur(2px)";
  ctx.fillRect(x + 4, y + sh * 0.4, w, h); ctx.filter = "none";
  if (img) {
    const p = clamp(tLocal / 4) * zoom;
    const iw = img.width, ih = img.height;
    const s = Math.max(w / iw, h / ih) * (1 + p);
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.drawImage(img, x + (w - iw * s) / 2, y + (h - ih * s) / 2, iw * s, ih * s);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "rgba(16,22,32,0.18)"); g.addColorStop(1, "rgba(10,13,18,0.42)");
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  } else { ctx.fillStyle = "#20242c"; ctx.fillRect(x, y, w, h); }
  ctx.restore();
  if (reveal > 0.01) {
    ctx.save(); ctx.globalAlpha *= reveal;
    ctx.strokeStyle = "rgba(234,227,212,0.30)"; ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    if (caption) {
      const ch = Math.max(24, h * 0.075);
      ctx.fillStyle = "rgba(10,12,16,0.78)"; ctx.fillRect(x, y + h - ch, w, ch);
      text(ctx, caption, x + 12, y + h - ch * 0.32, Math.max(12, w * 0.011), { family: PAL.mono, color: PAL.boneDim });
      if (credit) {
        const cw = textW(ctx, credit, Math.max(11, w * 0.0095), PAL.mono);
        text(ctx, credit, x + w - 12 - cw, y + h - ch * 0.32, Math.max(11, w * 0.0095), { family: PAL.mono, color: PAL.amber });
      }
    }
    ctx.restore();
  }
}

// ---------- grain (pre-rendered tiles, cycled per frame -> animated) ----------
const GRAIN_N = 6, GRAIN_S = 384;
let grainTiles = null;
function buildGrain() {
  const { createCanvas } = require("canvas");
  grainTiles = [];
  for (let k = 0; k < GRAIN_N; k++) {
    const cv = createCanvas(GRAIN_S, GRAIN_S), cx = cv.getContext("2d");
    const im = cx.createImageData(GRAIN_S, GRAIN_S), p = im.data;
    const rnd = RNG(1000 + k * 77);
    for (let i = 0; i < p.length; i += 4) {
      const v = rnd() < 0.5 ? 0 : 255;
      const a = rnd() * 46;
      p[i] = v; p[i + 1] = v; p[i + 2] = v; p[i + 3] = a;
    }
    cx.putImageData(im, 0, 0);
    grainTiles.push(cv);
  }
}
export function grain(ctx, W, H, t) {
  if (!grainTiles) buildGrain();
  const k = Math.abs(Math.round(t * 24)) % GRAIN_N;
  const tile = grainTiles[k];
  ctx.save(); ctx.globalAlpha = 0.5;
  const ox = (Math.abs(Math.round(t * 24 * 13)) % GRAIN_S);
  for (let y = -ox; y < H; y += GRAIN_S) for (let x = -ox; x < W; x += GRAIN_S) ctx.drawImage(tile, x, y);
  ctx.restore();
}

// ---------- base plate: gradient floor + halation + vignette (never pure black) ----------
export function basePlate(ctx, W, H, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, PAL.bgTop); g.addColorStop(0.5, PAL.bgMid); g.addColorStop(1, PAL.bgBot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // breathing center lift (halation)
  const br = 0.16 + 0.05 * Math.sin(t * 0.21);
  const r = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.62);
  r.addColorStop(0, `rgba(74,88,106,${br})`); r.addColorStop(1, "rgba(74,88,106,0)");
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
}
export function vignette(ctx, W, H) {
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(4,5,8,0.42)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// ---------- chrome: case tag + progress hairline ----------
export function chrome2(ctx, W, H, t, total) {
  const a = 0.62;
  text(ctx, "CASE 134/70 · BERGEN", Math.round(W * 0.024), H - Math.round(H * 0.028), Math.round(H * 0.0155), { family: PAL.mono, color: PAL.amber, alpha: a, spacing: 2.2 });
  const lbl = "THE ISDAL WOMAN";
  const lw = textW(ctx, lbl, Math.round(H * 0.0135), PAL.mono);
  text(ctx, lbl, W - Math.round(W * 0.024) - lw, H - Math.round(H * 0.028), Math.round(H * 0.0135), { family: PAL.mono, color: PAL.boneFaint, alpha: a, spacing: 2.2 });
  if (total) {
    const y = H - 3;
    ctx.fillStyle = "rgba(234,227,212,0.10)"; ctx.fillRect(0, y, W, 2);
    ctx.fillStyle = "rgba(210,168,94,0.55)"; ctx.fillRect(0, y, W * clamp(t / total), 2);
  }
}

// ---------- typography ----------
export function kicker(ctx, str, x, y, size, opts = {}) {
  const { color = PAL.amber, alpha = 1, align = "left", tick = true, spacing = 3.2 } = opts;
  const s = spacing * (size / 18);
  const w = textW(ctx, str, size, PAL.mono) + s * (str.length - 1);
  let xx = x;
  if (align === "center") xx = x - w / 2;
  if (align === "right") xx = x - w;
  if (tick && align === "left") { ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.fillRect(xx - size * 1.1, y - size * 0.72, size * 0.28, size * 0.86); ctx.restore(); }
  text(ctx, str, xx, y, size, { family: PAL.mono, color, alpha, spacing: s });
  return w;
}

// big display line with word-by-word rise+fade reveal
export function display(ctx, str, cx, y, size, p, opts = {}) {
  const { color = PAL.bone, weight = "bold", family = PAL.serif, tracking = 0, align = "center", shadow = true, maxW = 0 } = opts;
  font(ctx, size, family, weight);
  const words = str.split(" ");
  const spaceW = ctx.measureText(" ").width + tracking;
  const ws = words.map(w => ctx.measureText(w).width);
  const total = ws.reduce((a, b) => a + b, 0) + spaceW * (words.length - 1);
  let x = align === "center" ? cx - total / 2 : cx;
  const n = words.length;
  ctx.save();
  if (shadow) { ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = size * 0.12; ctx.shadowOffsetY = size * 0.03; }
  words.forEach((w, i) => {
    const wp = clamp(p * (n + 1.6) - i * 0.9, 0, 1);
    if (wp <= 0) { x += ws[i] + spaceW; return; }
    const a = easeOut(wp), rise = (1 - a) * size * 0.34;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = color;
    ctx.fillText(w, x, y + rise);
    ctx.restore();
    x += ws[i] + spaceW;
  });
  ctx.restore();
  return total;
}

// drawing rule line
export function rule(ctx, cx, y, w, p, opts = {}) {
  const { color = PAL.amber, alpha = 1, thick = 3 } = opts;
  const e = easeOut(clamp(p));
  const wCur = w * e;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.fillRect(cx - wCur / 2, y, wCur, thick);
  ctx.restore();
}

// ---------- paper (bigger, warmer, with edge shadow stack) ----------
export function paper(ctx, x, y, w, h, opts = {}) {
  const { alpha = 1, tilt = 0 } = opts;
  ctx.save(); ctx.globalAlpha *= alpha;
  if (tilt) { ctx.translate(x + w / 2, y + h / 2); ctx.rotate(tilt); ctx.translate(-(x + w / 2), -(y + h / 2)); }
  ctx.fillStyle = "rgba(0,0,0,0.42)"; ctx.filter = "blur(3px)";
  ctx.fillRect(x + 6, y + 10, w, h); ctx.filter = "none";
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "#efe8d8"); g.addColorStop(1, "#ddd4bf");
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(120,110,88,0.5)"; ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  // aged corners
  ctx.strokeStyle = "rgba(120,100,60,0.16)";
  ctx.strokeRect(x + 5.5, y + 5.5, w - 11, h - 11);
  ctx.restore();
}

// stamp (big, inked)
export function stamp2(ctx, label, x, y, size, opts = {}) {
  const { color = PAL.red, alpha = 1, angle = -0.055, family = PAL.mono } = opts;
  ctx.save(); ctx.globalAlpha *= alpha * 0.92;
  ctx.translate(x, y); ctx.rotate(angle);
  font(ctx, size, family, "bold");
  const w = ctx.measureText(label).width;
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, size * 0.085);
  ctx.strokeRect(-w / 2 - size * 0.55, -size * 0.92, w + size * 1.1, size * 1.84);
  ctx.fillStyle = color; ctx.textAlign = "center";
  ctx.fillText(label, 0, size * 0.36);
  ctx.restore();
  return w + size * 1.1;
}

// ---------- fog (two drifting layers, richer) ----------
export function fog2(ctx, W, H, t, seed = 5, alpha = 0.07, speed = 1) {
  const rnd = RNG(seed);
  ctx.save();
  for (let i = 0; i < 9; i++) {
    const bx = rnd() * W, by = H * (0.25 + rnd() * 0.6);
    const w = W * (0.25 + rnd() * 0.45), h = H * (0.05 + rnd() * 0.12);
    const sp = (6 + rnd() * 16) * speed;
    const x = ((bx + t * sp) % (W + w * 2)) - w;
    const gr = ctx.createRadialGradient(x, by, 0, x, by, w / 2);
    gr.addColorStop(0, `rgba(150,165,182,${alpha})`); gr.addColorStop(1, "rgba(150,165,182,0)");
    ctx.save(); ctx.translate(x, by); ctx.scale(1, h / (w / 2)); ctx.translate(-x, -by);
    ctx.beginPath(); ctx.arc(x, by, w / 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ---------- stylized dot-grid Norway map ----------
// returns helpers; polygon in normalized map-box coords
const NORWAY = [
  [0.52,0.00],[0.62,0.03],[0.58,0.08],[0.66,0.06],[0.74,0.10],[0.70,0.16],[0.80,0.20],[0.76,0.27],
  [0.84,0.32],[0.78,0.40],[0.84,0.46],[0.76,0.52],[0.80,0.58],[0.72,0.60],[0.68,0.68],[0.72,0.74],
  [0.64,0.78],[0.56,0.76],[0.50,0.82],[0.42,0.80],[0.36,0.86],[0.28,0.84],[0.22,0.88],[0.16,0.84],
  [0.18,0.78],[0.12,0.74],[0.16,0.68],[0.10,0.64],[0.14,0.58],[0.08,0.54],[0.14,0.48],[0.08,0.44],
  [0.14,0.38],[0.08,0.34],[0.16,0.30],[0.12,0.24],[0.20,0.22],[0.16,0.16],[0.24,0.14],[0.22,0.08],
  [0.30,0.10],[0.34,0.04],[0.42,0.06],[0.46,0.00]
];
const CITIES = {
  bergen:    { x: 0.147, y: 0.587, label: "BERGEN" },
  stavanger: { x: 0.192, y: 0.790, label: "STAVANGER" },
  oslo:      { x: 0.750, y: 0.656, label: "OSLO" },
  trondheim: { x: 0.711, y: 0.153, label: "TRONDHEIM" },
  notodden:  { x: 0.540, y: 0.700, label: "NOTODDEN" },
  isdalen:   { x: 0.175, y: 0.640, label: "ISDALEN" },
};
function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
// opts: step (grid density), p (0..1 reveal), routes: [{path:["oslo","bergen",...], p:1, color}], highlight city keys
export function norwayMap(ctx, x, y, w, h, t, opts = {}) {
  const { p = 1, routes = [], highlight = [], marks = [] } = opts;
  const step = Math.max(9, Math.round(w / 62));
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const n = Math.ceil((NORWAY.length) * clamp(p * 1.15));
  const revealSet = new Set();
  for (let i = 0; i < n; i++) revealSet.add(NORWAY[i]);
  // dot grid masked by polygon, revealing along polygon order
  for (let gy = y + step / 2; gy < y + h; gy += step) {
    for (let gx = x + step / 2; gx < x + w; gx += step) {
      const nx = (gx - x) / w, ny = (gy - y) / h;
      if (!pointInPoly(nx, ny, NORWAY)) continue;
      // reveal: dots appear if their angle-order index is passed (approx by ny threshold)
      const ord = (1 - ny) * 0.7 + nx * 0.3;
      if (ord > clamp(p * 1.3)) continue;
      const near = highlight.length && highlight.some(k => { const c = CITIES[k]; return c && Math.hypot(nx - c.x, ny - c.y) < 0.07; });
      const base = near ? "rgba(210,168,94,0.85)" : "rgba(139,160,180,0.42)";
      ctx.fillStyle = base;
      const r = near ? step * 0.21 : step * 0.16;
      ctx.beginPath(); ctx.arc(gx, gy, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  // routes
  for (const rt of routes) {
    const pts = rt.path.map(k => CITIES[k]).filter(Boolean);
    if (pts.length < 2) continue;
    const total = pts.length - 1;
    const rp = clamp(rt.p);
    const drawn = rp * total;
    ctx.strokeStyle = rt.color || PAL.amber; ctx.lineWidth = Math.max(2, w * 0.004);
    ctx.setLineDash([w * 0.012, w * 0.008]); ctx.lineDashOffset = -t * w * 0.01;
    ctx.beginPath();
    const full = Math.floor(drawn);
    for (let i = 0; i <= Math.min(full, total - 1); i++) {
      const A = pts[i], B2 = pts[i + 1];
      const segp = clamp(drawn - i, 0, 1);
      const ex = x + lerp(A.x, B2.x, segp) * w, ey = y + lerp(A.y, B2.y, segp) * h;
      if (i === 0) ctx.moveTo(x + A.x * w, y + A.y * h);
      ctx.lineTo(ex, ey);
    }
    ctx.stroke(); ctx.setLineDash([]);
    // moving pulse at route head
    if (rp < 1 && full < total - 0.001) {
      const i = Math.min(Math.floor(drawn), total - 1);
      const segp = clamp(drawn - i, 0, 1);
      const hx = x + lerp(pts[i].x, pts[i + 1].x, segp) * w, hy = y + lerp(pts[i].y, pts[i + 1].y, segp) * h;
      const gr = ctx.createRadialGradient(hx, hy, 0, hx, hy, w * 0.02);
      gr.addColorStop(0, "rgba(210,168,94,0.9)"); gr.addColorStop(1, "rgba(210,168,94,0)");
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(hx, hy, w * 0.02, 0, Math.PI * 2); ctx.fill();
    }
  }
  // city dots + labels
  for (const [key, c] of Object.entries(CITIES)) {
    const cp = clamp(p * 2 - 0.3);
    if (cp <= 0) continue;
    const isHi = highlight.includes(key);
    const px = x + c.x * w, py = y + c.y * h;
    ctx.save(); ctx.globalAlpha *= cp;
    if (key === "isdalen") {
      ctx.strokeStyle = PAL.red; ctx.lineWidth = 2.4;
      const s = w * 0.008;
      ctx.beginPath(); ctx.moveTo(px - s, py - s); ctx.lineTo(px + s, py + s); ctx.moveTo(px + s, py - s); ctx.lineTo(px - s, py + s); ctx.stroke();
      text(ctx, c.label, px + s * 2.2, py + 4, Math.max(11, w * 0.014), { family: PAL.mono, color: PAL.red });
    } else {
      const gr = ctx.createRadialGradient(px, py, 0, px, py, w * (isHi ? 0.016 : 0.008));
      gr.addColorStop(0, isHi ? "rgba(210,168,94,0.95)" : "rgba(234,227,212,0.8)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(px, py, w * (isHi ? 0.016 : 0.008), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PAL.bone; ctx.beginPath(); ctx.arc(px, py, Math.max(2.5, w * 0.0035), 0, Math.PI * 2); ctx.fill();
      text(ctx, c.label, px + w * 0.012, py + w * 0.005, Math.max(11, w * 0.0155), { family: PAL.mono, color: isHi ? PAL.amber : PAL.boneDim });
    }
    ctx.restore();
  }
  for (const m of marks) {
    if (m.at > p) continue;
    text(ctx, m.label, x + m.x * w, y + m.y * h, Math.max(11, w * 0.014), { family: PAL.mono, color: PAL.slate, align: "center" });
  }
  ctx.restore();
  // attribution
  text(ctx, "STYLIZED MAP — RECONSTRUCTION, NOT TO SCALE", x + w, y + h + Math.round(h * 0.045), Math.max(10, w * 0.012), { family: PAL.mono, color: PAL.boneFaint, alpha: 0.7, align: "right" });
}

// soft glow dot (for beats/pulses)
export function glow(ctx, x, y, r, color = PAL.amber, a = 0.8) {
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, color); gr.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
