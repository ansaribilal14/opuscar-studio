// support2.mjs — "PAPER & SKY" visual system for the Wow! film v2.
// Answers the v1 rejection (docs/QA-V1-REJECTION.md): full-frame environments,
// hero elements >=55% coverage, type >=34px everywhere, every scene moves,
// luminance light-leak transitions, act contrast (sky <-> paper worlds).
// Deterministic: every function is a pure function of (ctx, t, params, seeded PRNG).
import { prng, easeOut, clamp01, lerp } from "./support.mjs";

export const PAL = {
  // SKY world
  skyTop: "#13203f", skyMid: "#0a1226", skyLow: "#04070f",
  haze: "#0e2740", star: "#ffffff", starWarm: "#ffe9c9",
  // PAPER world
  roomEdge: "#170f08", roomMid: "#241a10", paper: "#ece3cd", paperShade: "#cfc3a4",
  inkPrint: "#2e2a22", penRed: "#c0392b",
  // shared accents
  signal: "#4be1a0", cyan: "#58c7f0", crimson: "#c0392b",
  ink: "#f4f2ec", dim: "#9db0c8", warn: "#e0b34c", beige: "#e8dfc8",
};
export const FONT = {
  title: "bold %Spx 'DejaVu Sans'",
  body: "%Spx 'Carlito'",
  mono: "%Spx 'DejaVu Sans Mono'",
};
export function fnt(kind, size) { return FONT[kind].replace("%S", size); }

// ---------- type scale (v2 gates: nothing below 34px at 1080p) ----------
export const TS = { display: 148, display2: 132, section: 72, sub: 56, label: 38, caption: 44, numeral: 116, monoData: 64 };

// ---------- deterministic hand-wobble stroke ----------
export function handStroke(ctx, pts, wobble = 3, seed = 5, progress = 1) {
  const rnd = prng(seed);
  ctx.beginPath();
  let first = true;
  const n = pts.length;
  const upto = Math.max(2, Math.round(n * clamp01(progress)));
  for (let i = 0; i < upto; i++) {
    const [x, y] = pts[i];
    const jx = x + (rnd() - 0.5) * wobble * 2, jy = y + (rnd() - 0.5) * wobble * 2;
    first ? (ctx.moveTo(jx, jy), (first = false)) : ctx.lineTo(jx, jy);
  }
  ctx.stroke();
}
export function handEllipse(ctx, cx, cy, rx, ry, seed = 5, progress = 1, rot = -0.06) {
  const pts = [];
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx * Math.cos(rot) - Math.sin(a) * ry * Math.sin(rot),
              cy + Math.cos(a) * rx * Math.sin(rot) + Math.sin(a) * ry * Math.cos(rot)]);
  }
  handStroke(ctx, pts, 2.5, seed, progress);
}

// ---------- SKY world ----------
// Deep-night vertical gradient + milky way band + 3-layer parallax starfield
// + horizon haze + optional nebula accents. `emptier` trims star density for
// the "decades of silence" act (QA C4: one background for every scene -> acts differ).
export function skyBase(ctx, W, H, t, opts = {}) {
  const { emptier = 0, horizon = 0.82, bigEar = false, nebula = true } = opts;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, PAL.skyTop); g.addColorStop(0.45, PAL.skyMid); g.addColorStop(1, PAL.skyLow);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // milky way band (diagonal, soft)
  const rnd = prng(101);
  ctx.save();
  ctx.translate(W * 0.5, H * 0.52); ctx.rotate(-0.5);
  const mg = ctx.createLinearGradient(-W * 0.9, 0, W * 0.9, 0);
  mg.addColorStop(0, "rgba(88,199,240,0)"); mg.addColorStop(0.5, "rgba(88,199,240,0.055)");
  mg.addColorStop(1, "rgba(88,199,240,0)");
  ctx.fillStyle = mg; ctx.fillRect(-W, -H * 0.13, W * 2, H * 0.26);
  // dense faint stars along the band
  const bandN = Math.round(240 * (1 - emptier * 0.55));
  for (let i = 0; i < bandN; i++) {
    const bx = (rnd() - 0.5) * W * 1.8, by = (rnd() - 0.5) * H * 0.24;
    ctx.globalAlpha = 0.25 + rnd() * 0.5;
    ctx.fillStyle = "#dbe9ff";
    ctx.fillRect(bx, by, 2, 2);
  }
  ctx.restore(); ctx.globalAlpha = 1;
  // nebula accents
  if (nebula) {
    for (const [nx, ny, nr, col] of [[0.22, 0.3, 0.34, "rgba(40,90,150,0.10)"], [0.78, 0.24, 0.28, "rgba(75,225,160,0.05)"], [0.6, 0.66, 0.4, "rgba(30,60,120,0.08)"]]) {
      const ng = ctx.createRadialGradient(W * nx, H * ny, 0, W * nx, H * ny, W * nr);
      ng.addColorStop(0, col); ng.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H);
    }
  }
  // 3-layer parallax starfield
  const layers = [[Math.round(150 * (1 - emptier * 0.5)), 1.5, 0.45, 3, 0.55],
                  [Math.round(70 * (1 - emptier * 0.5)), 2.4, 0.7, 7, 0.8],
                  [Math.round(26 * (1 - emptier * 0.4)), 3.4, 0.95, 13, 1.0]];
  for (const [n, size, alpha, drift, twk] of layers) {
    const r2 = prng(7 + size * 100);
    for (let i = 0; i < n; i++) {
      const x0 = r2() * W, y0 = r2() * H * horizon;
      const tw = (0.6 + 0.4 * Math.sin(t * twk * 0.9 + i * 2.399)) * alpha;
      const x = (x0 + t * drift) % W;
      ctx.globalAlpha = tw;
      ctx.fillStyle = i % 9 === 0 ? PAL.cyan : (i % 13 === 0 ? PAL.starWarm : PAL.star);
      if (size > 3) { // glow on near layer
        const gg = ctx.createRadialGradient(x, y0, 0, x, y0, size * 3);
        gg.addColorStop(0, "rgba(255,255,255,0.5)"); gg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y0, size * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = PAL.star;
      }
      ctx.beginPath(); ctx.arc(x, y0, size * 0.62, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  // horizon haze
  const hz = ctx.createLinearGradient(0, H * horizon, 0, H);
  hz.addColorStop(0, "rgba(14,39,64,0)"); hz.addColorStop(1, "rgba(16,44,72,0.5)");
  ctx.fillStyle = hz; ctx.fillRect(0, H * horizon, W, H * (1 - horizon));
  ctx.strokeStyle = "rgba(88,199,240,0.16)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, H * horizon); ctx.lineTo(W, H * horizon); ctx.stroke();
  if (bigEar) bigEarPanorama(ctx, W, H * horizon - 4, W * 0.42, 1);
}

// Big Ear panorama silhouette (flat reflector + fixed paraboloid + feed structure)
export function bigEarPanorama(ctx, x, y, w, alpha = 1) {
  const h = w * 0.30;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = "#02040a";
  ctx.beginPath();
  // ground
  ctx.moveTo(x - w * 0.08, y + h * 0.16);
  ctx.lineTo(x + w * 1.08, y + h * 0.16);
  ctx.lineTo(x + w * 1.08, y + h * 0.30); ctx.lineTo(x - w * 0.08, y + h * 0.30);
  ctx.closePath(); ctx.fill();
  // flat reflector (long low ramp)
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.16);
  ctx.lineTo(x + w * 0.06, y);
  ctx.lineTo(x + w * 0.94, y);
  ctx.lineTo(x + w, y + h * 0.16);
  ctx.closePath(); ctx.fill();
  // fixed paraboloid (taller arc, right-of-center)
  ctx.beginPath();
  ctx.moveTo(x + w * 0.56, y + h * 0.16);
  ctx.quadraticCurveTo(x + w * 0.66, y - h * 0.62, x + w * 0.78, y + h * 0.16);
  ctx.closePath(); ctx.fill();
  // feed arms
  ctx.strokeStyle = "#02040a"; ctx.lineWidth = Math.max(3, w * 0.008);
  ctx.beginPath(); ctx.moveTo(x + w * 0.63, y - h * 0.34); ctx.lineTo(x + w * 0.63, y - h * 0.52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + w * 0.71, y - h * 0.30); ctx.lineTo(x + w * 0.71, y - h * 0.46); ctx.stroke();
  ctx.restore();
}

// ---------- PAPER world ----------
// Warm dark room + full-bleed cream sheet + typewriter print + red margin marks.
export function paperBase(ctx, W, H, t, opts = {}) {
  const { tilt = -0.012, printRows = 26, seed = 31 } = opts;
  // room
  const g = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.1, W / 2, H * 0.5, W * 0.75);
  g.addColorStop(0, PAL.roomMid); g.addColorStop(1, PAL.roomEdge);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // full-bleed sheet (slightly larger than frame, tilted)
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.rotate(tilt);
  const sw = W * 1.06, sh = H * 1.12;
  ctx.fillStyle = PAL.paper; ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
  // paper gradient shading (light-table center glow)
  const pg = ctx.createRadialGradient(0, -sh * 0.05, sh * 0.1, 0, 0, sw * 0.62);
  pg.addColorStop(0, "rgba(255,250,230,0.16)"); pg.addColorStop(1, "rgba(120,100,60,0.20)");
  ctx.fillStyle = pg; ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
  // tractor-feed perforation strips (left/right)
  ctx.fillStyle = "rgba(90,80,55,0.18)";
  ctx.fillRect(-sw / 2, -sh / 2, sw * 0.035, sh);
  ctx.fillRect(sw / 2 - sw * 0.035, -sh / 2, sw * 0.035, sh);
  for (let i = 0; i < 30; i++) {
    const yy = -sh / 2 + (i + 0.5) * (sh / 30);
    ctx.fillStyle = "rgba(40,34,20,0.28)";
    ctx.beginPath(); ctx.arc(-sw / 2 + sw * 0.0175, yy, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sw / 2 - sw * 0.0175, yy, 9, 0, Math.PI * 2); ctx.fill();
  }
  // horizontal rule lines
  ctx.strokeStyle = "rgba(90,84,62,0.30)"; ctx.lineWidth = 2;
  for (let i = 0; i < 34; i++) {
    const yy = -sh / 2 + 40 + i * (sh / 34);
    ctx.beginPath(); ctx.moveTo(-sw / 2, yy); ctx.lineTo(sw / 2, yy); ctx.stroke();
  }
  // typewriter print rows (deterministic)
  const rnd = prng(seed);
  ctx.font = fnt("mono", 26); ctx.fillStyle = PAL.inkPrint; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  const glyph = "0123456789 0123456789 0123456789 .+ ";
  for (let r = 0; r < printRows; r++) {
    const yy = -sh / 2 + 26 + r * (sh / (printRows + 2));
    let xx = -sw / 2 + sw * 0.06;
    const cols = 8 + Math.floor(rnd() * 10);
    for (let c = 0; c < cols; c++) {
      const run = 1 + Math.floor(rnd() * 3);
      let s = "";
      for (let k = 0; k < run; k++) s += glyph[Math.floor(rnd() * glyph.length)];
      ctx.globalAlpha = 0.5 + rnd() * 0.4;
      ctx.fillText(s, xx, yy);
      xx += 150 + rnd() * 90;
      if (xx > sw / 2 - 60) break;
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ---------- graded full-bleed archival treatment ----------
// Draws an image full-bleed (cover fit) with the film's cool grade + subtle scanline.
export function gradeArchival(ctx, img, W, H, t, opts = {}) {
  if (!img) return;
  const { zoom = 0.05, panX = 0, panY = 0, dim = 0 } = opts;
  const p = easeOut(clamp01(t / Math.max(0.001, 10)));
  const scale = 1 + zoom * p;
  const iw = img.width, ih = img.height;
  const cover = Math.max(W / iw, H / ih) * scale;
  const dw = iw * cover, dh = ih * cover;
  const dx = (W - dw) / 2 + panX * p * (dw - W) * 0.3;
  const dy = (H - dh) / 2 + panY * p * (dh - H) * 0.3;
  ctx.drawImage(img, dx, dy, dw, dh);
  // cool grade: desaturate slightly + teal shadow tint via two overlay passes
  ctx.save();
  ctx.globalCompositeOperation = "saturation";
  ctx.fillStyle = "hsl(0,12%,50%)"; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "multiply";
  const gg = ctx.createLinearGradient(0, 0, 0, H);
  gg.addColorStop(0, "rgba(190,215,240,0.30)"); gg.addColorStop(1, "rgba(60,90,130,0.30)");
  ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  if (dim > 0) { ctx.fillStyle = `rgba(4,8,18,${dim})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- light-leak wipe (scene transition; never a hard cut) ----------
export function lightLeak(ctx, W, H, a, dir = 1) {
  if (a <= 0) return;
  const x = dir > 0 ? W * (1 - a) : W * a;
  const g = ctx.createLinearGradient(x - W * 0.5 * dir, 0, x + W * 0.28 * dir, 0);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.75, `rgba(150,210,255,${0.24 * a})`);
  g.addColorStop(0.92, `rgba(235,248,255,${0.85 * a})`);
  g.addColorStop(1, `rgba(255,255,255,${a})`);
  ctx.fillStyle = g;
  if (dir > 0) ctx.fillRect(0, 0, x + W * 0.28, H); else ctx.fillRect(x - W * 0.28, 0, W, H);
  const core = ctx.createLinearGradient(x - 40 * dir, 0, x + 40 * dir, 0);
  core.addColorStop(0, "rgba(255,255,255,0)");
  core.addColorStop(0.5, `rgba(255,255,255,${0.9 * a})`);
  core.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = core; ctx.fillRect(x - 60, 0, 120, H);
}

// ---------- global slow push (every scene moves; QA C1/C3) ----------
export function withPush(ctx, W, H, prog, fn) {
  const s = 1 + 0.05 * clamp01(prog);
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
  fn(s);
  ctx.restore();
}

// staggered build-in: returns alpha/offset for element i
export function buildIn(t, t0, i, stagger = 0.14, dur = 0.55) {
  const p = clamp01((t - t0 - i * stagger) / dur);
  return { a: easeOut(p), dy: (1 - easeOut(p)) * 46 };
}

// ---------- large text helpers ----------
export function displayBig(ctx, cx, cy, text, size, color, tracking = 10, font = "title") {
  ctx.font = fnt(font, size);
  let total = 0;
  for (const ch of text) total += ctx.measureText(ch).width + tracking;
  total -= tracking;
  let x = cx - total / 2;
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  for (const ch of text) { ctx.fillText(ch, x, cy); x += ctx.measureText(ch).width + tracking; }
}

export function sectionTitle(ctx, x, y, text, size = TS.section, color = PAL.ink, align = "left") {
  ctx.font = fnt("title", size); ctx.fillStyle = color;
  ctx.textAlign = align; ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
}

export function label(ctx, x, y, text, size = TS.label, color = PAL.dim, align = "left", font = "body") {
  ctx.font = fnt(font, size); ctx.fillStyle = color;
  ctx.textAlign = align; ctx.textBaseline = "alphabetic";
  ctx.fillText(text.toUpperCase(), x, y);
}

export function numeral(ctx, cx, cy, text, size = TS.numeral, color = PAL.ink, font = "title") {
  ctx.font = fnt(font, size); ctx.fillStyle = color;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy);
}

// large chip (>=38px text)
export function chipBig(ctx, x, y, text, color = PAL.dim, size = TS.label, filled = false) {
  ctx.font = fnt("body", size);
  const tw = ctx.measureText(text.toUpperCase()).width;
  const w = tw + 56, h = size + 34;
  if (filled) { ctx.fillStyle = color; ctx.globalAlpha = 0.16; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; }
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = color; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), x + 28, y + h / 2 + 1);
  return w;
}

// burned caption at 44px (v2 gate), panel backdrop
export function caption2(ctx, W, H, text) {
  if (!text) return;
  const lines = text.split("\n");
  const size = TS.caption, lh = size * 1.32;
  ctx.font = fnt("body", size);
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const boxW = Math.min(W * 0.92, widest + 96), boxH = lines.length * lh + 52;
  const bx = (W - boxW) / 2, by = H - boxH - 46;
  ctx.fillStyle = "rgba(4,7,15,0.74)";
  ctx.fillRect(bx, by, boxW, boxH);
  ctx.strokeStyle = "rgba(88,199,240,0.20)"; ctx.lineWidth = 2;
  ctx.strokeRect(bx + 1, by + 1, boxW - 2, boxH - 2);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = PAL.ink;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, by + 26 + lh * (i + 0.5)));
}

// ---------- motifs ----------
// The 72-second signal bar: a horizontal bar that fills over the transit and decays.
export function signalBar(ctx, x, y, w, h, prog, color = PAL.signal, label = "72 s") {
  ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fillRect(x, y, w, h);
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, "rgba(75,225,160,0.25)"); g.addColorStop(0.5, color); g.addColorStop(1, "rgba(75,225,160,0.25)");
  ctx.fillStyle = g;
  const fw = w * clamp01(prog);
  ctx.fillRect(x + (w - fw) / 2, y, fw, h);
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
  if (label) {
    ctx.font = fnt("body", 38); ctx.fillStyle = PAL.dim; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(label, x + w / 2, y + h + 34);
  }
}

// coordinate chip (RA/DEC) used across scenes
export function coordChip(ctx, x, y, lines, size = 40) {
  ctx.font = fnt("mono", size);
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 64;
  const h = lines.length * size * 1.35 + 44;
  ctx.fillStyle = "rgba(5,10,22,0.66)"; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(88,199,240,0.4)"; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = PAL.cyan; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  lines.forEach((l, i) => ctx.fillText(l, x + 32, y + 22 + size * 1.35 * (i + 0.5)));
  return { w, h };
}

// finer animated grain (quantized to 12Hz steps, deterministic)
export function grain2(ctx, W, H, t, seed = 99, amount = 0.045) {
  const q = Math.floor(t * 12);
  const rnd = prng(seed + q * 7919);
  ctx.globalAlpha = amount; ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 900; i++) ctx.fillRect(rnd() * W, rnd() * H, 2, 2);
  ctx.globalAlpha = 1;
}

// stronger, color-aware vignette
export function vignette2(ctx, W, H, strength = 0.5) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.30, W / 2, H / 2, W * 0.72);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(1,3,8,${strength})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// reconstruction label (top-right — keeps the bottom caption band clear)
export function recon2(ctx, W, H, text = "RECONSTRUCTION") {
  ctx.font = fnt("body", 34);
  ctx.fillStyle = "rgba(157,176,200,0.72)";
  ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
  ctx.fillText(text, W - 48, 84);
}

// THE UNCLOSED FILE channel mark (top-left, consistent identity)
export function channelMark(ctx, W, t, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.strokeStyle = PAL.crimson; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(48, 54); ctx.lineTo(48, 96); ctx.stroke();
  ctx.font = fnt("body", 36); ctx.fillStyle = PAL.ink;
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText("THE UNCLOSED FILE", 72, 76);
  ctx.restore();
}

// scene progress helper
export function sprog(t, win) { return clamp01((t - win.start) / Math.max(0.001, win.end - win.start)); }
