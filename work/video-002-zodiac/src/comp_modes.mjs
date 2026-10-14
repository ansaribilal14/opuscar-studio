// comp_modes.mjs — v4 image-first composition engine (directive §2/§7, issues #11-#13)
// Root causes fixed here:
//   RC1: grade sat 0.38 -> 0.72, NO global dim gradient, NO global cool shift.
//        Scrims capped per mode: full-bleed text-zone scrim <= 0.22, kicker zone 0.16.
//   RC5: KB moves with real spans (zoom deltas 0.12-0.20 vs v3's 0.09-0.14),
//        per-photo deterministic, gap-proof by the same clamp contract as v3.
//   RC6: inkGrid — cipher glyphs as INK ON PAPER (the period-true look), legible.
// Supporting helpers: band (pre-text contrast strip), lowerThird (names on frame).
// Hierarchy contract (directive §2): photo = content; chrome/chips = support only.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { clamp, lerp, ease, easeOut, text, font, textW, RNG } from "./engine.mjs";
import { PAL, hashStr } from "./film_look.mjs";

// ---------- v4 graded photo cache (bright, period-true, reused every frame) ----------
const photoCache = new Map();
function gradePixels(img) {
  const TW = 2300, TH = Math.round(TW * img.height / img.width);
  const { createCanvas } = require("canvas");
  const cv = createCanvas(TW, TH), cx = cv.getContext("2d");
  cx.drawImage(img, 0, 0, TW, TH);
  const d = cx.getImageData(0, 0, TW, TH), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const l = 0.30 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2];
    // 72% saturation — photographs stay alive; whisper of cool only in deep shadows
    const sat = 0.72;
    let r = l + (p[i] - l) * sat, g = l + (p[i + 1] - l) * sat, b = l + (p[i + 2] - l) * sat;
    const shadow = clamp(1 - l / 110);
    b += 6 * shadow;
    const lift = 7;
    r = lift + (r * (255 - lift)) / 255; g = lift + (g * (255 - lift)) / 255; b = lift + (b * (255 - lift)) / 255;
    p[i] = r; p[i + 1] = g; p[i + 2] = b;
  }
  cx.putImageData(d, 0, 0);
  return cv;
}
const PHOTO_NAMES = [
  "berryessa_aerial.jpg", "sf_street_1960s.jpg", "golden_gate_vintage.jpg", "mount_diablo.jpg",
  "vallejo_waterfront.jpg", "benicia_street.jpg", "presidio_historic.jpg",
  "typewriter_keys.jpg", "napa_hills.jpg", "bay_fog.jpg", "evidence_board.jpg",
  "chronicle_building.jpg", "blue_rock_park.jpg", "mount_diablo_tower.jpg", "press_room.jpg",
  "sf_night_1960s.jpg", "envelope_stamp.jpg",
];
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

// ---------- v4 motion catalog (RC5: visible, varied movement) ----------
const KB4 = [
  { zoom: [1.06, 1.22], pan: [0.08, 0.12, 0.66, 0.72] },  // push-in drifting right/down
  { zoom: [1.22, 1.06], pan: [0.66, 0.72, 0.08, 0.12] },  // pull-out drifting left/up
  { zoom: [1.08, 1.26], pan: [0.58, 0.18, 0.10, 0.58] },  // push-in sweeping left
  { zoom: [1.24, 1.07], pan: [0.18, 0.58, 0.62, 0.16] },  // pull-out sweeping right
  { zoom: [1.06, 1.20], pan: [0.30, 0.88, 0.56, 0.12] },  // rise
  { zoom: [1.20, 1.06], pan: [0.56, 0.12, 0.30, 0.88] },  // sink
  { zoom: [1.07, 1.21], pan: [0.86, 0.30, 0.12, 0.48] },  // lateral left
  { zoom: [1.21, 1.07], pan: [0.12, 0.48, 0.86, 0.30] },  // lateral right
  { zoom: [1.10, 1.30], pan: [0.42, 0.42, 0.55, 0.55] },  // center punch-in
  { zoom: [1.05, 1.17], pan: [0.50, 0.50, 0.42, 0.60] },  // gentle settle
];
export function kb4(seed) {
  const r = (Math.abs(hashStr(String(seed))) % 1000) / 1000;
  const m = KB4[Math.floor(r * KB4.length) % KB4.length];
  return { zoom: [...m.zoom], pan: [...m.pan] };
}

// ---------- plate: v4 photo cover-draw with per-mode scrim ceilings ----------
// mode "full":  whole-frame archival view; scrim only in text zones (bottom <= 0.22)
// mode "close": evidence close-up — crop on detail (focus [fx,fy] in photo coords)
// opts: scrim (bottom text-zone ceiling), topScrim, seed, move {zoom,pan}, focus
export function plate(ctx, W, H, tLoc, dur, name, opts = {}) {
  const { mode = "full", scrim = 0.20, topScrim = 0.16, seed = null, move = null, focus = null } = opts;
  const img = photo(name);
  if (!img) { ctx.fillStyle = "#141920"; ctx.fillRect(0, 0, W, H); return false; }
  const p = ease(clamp(tLoc / Math.max(0.001, dur)));
  const mv = move || kb4(seed ?? hashStr(name + ":v4"));
  let zoom = mv.zoom, pan = mv.pan;
  if (mode === "close") {
    const fx = focus ? focus[0] : 0.5, fy = focus ? focus[1] : 0.5;
    zoom = [1.85, 2.05];
    // pan fraction picks the crop center; clamps keep it gap-proof
    pan = [clamp(fx - 0.30), clamp(fy - 0.30), clamp(fx - 0.26), clamp(fy - 0.26)];
  }
  const iw = img.width, ih = img.height;
  const z = lerp(zoom[0], zoom[1], p);
  const cover = Math.max(W / iw, H / ih) * z;
  const dw = iw * cover, dh = ih * cover;
  const freeX = dw - W, freeY = dh - H;
  const dx = lerp(clamp(pan[0]), clamp(pan[2]), p) * freeX;
  const dy = lerp(clamp(pan[1]), clamp(pan[3]), p) * freeY;
  ctx.drawImage(img, -dx - (freeX > 0 ? 0 : (W - dw) / 2), -dy - (freeY > 0 ? 0 : (H - dh) / 2), dw, dh);
  // text-zone scrims ONLY (RC1 fix): bottom band + faint top band, no global pass
  if (scrim > 0) {
    const s = ctx.createLinearGradient(0, H * 0.58, 0, H);
    s.addColorStop(0, "rgba(8,10,14,0)");
    s.addColorStop(1, `rgba(8,10,14,${scrim})`);
    ctx.fillStyle = s; ctx.fillRect(0, Math.round(H * 0.58), W, Math.round(H * 0.42));
  }
  if (topScrim > 0) {
    const s = ctx.createLinearGradient(0, 0, 0, H * 0.20);
    s.addColorStop(0, `rgba(8,10,14,${topScrim})`);
    s.addColorStop(1, "rgba(8,10,14,0)");
    ctx.fillStyle = s; ctx.fillRect(0, 0, W, Math.round(H * 0.20));
  }
  return true;
}

// two-plate hard cut inside one block (varied rhythm without crossfade soup)
export function photoCut(ctx, W, H, tLoc, dur, names, opts = {}) {
  const { at = 0.5, scrim = 0.20 } = opts;
  if (!Array.isArray(names) || names.length < 2) {
    plate(ctx, W, H, tLoc, dur, names[0], { scrim, ...opts });
    return;
  }
  if (tLoc < dur * at) plate(ctx, W, H, tLoc, dur * at, names[0], { scrim, ...opts });
  else plate(ctx, W, H, tLoc - dur * at, dur - dur * at, names[1], { scrim, ...opts });
}

// ---------- band: contrast strip that renders BEFORE text (never after) ----------
// side "full" | "left" | "right"; soft top/bottom edges; used under on-photo text
export function band(ctx, W, H, yFrac, hFrac, alpha = 0.55, side = "full", wFrac = 1) {
  const y = Math.round(H * yFrac), h = Math.round(H * hFrac);
  let x = 0, w = W;
  if (side === "left") w = Math.round(W * wFrac);
  if (side === "right") { w = Math.round(W * wFrac); x = W - w; }
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "rgba(8,10,14,0)");
  g.addColorStop(0.22, `rgba(8,10,14,${alpha})`);
  g.addColorStop(0.78, `rgba(8,10,14,${alpha})`);
  g.addColorStop(1, "rgba(8,10,14,0)");
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// ---------- lowerThird: names/dates directly ON the frame (no card wall) ----------
// items: [{ mark, str, sub }] — mark colored, str bone, sub smaller dim line
export function lowerThird(ctx, W, H, items, p, opts = {}) {
  const { x = Math.round(W * 0.062), y = Math.round(H * 0.785), size = Math.round(H * 0.030), gap = 1.55, markColor = "rgba(217,164,65,0.95)" } = opts;
  ctx.save();
  ctx.globalAlpha = clamp(p * 1.3);
  let yy = y;
  for (const it of items) {
    if (it.mark) {
      font(ctx, size, PAL.body, "bold");
      ctx.fillStyle = markColor;
      ctx.fillText(it.mark, x, yy);
      ctx.fillStyle = PAL.bone;
      ctx.fillText(it.str, x + size * 1.15, yy);
    } else {
      font(ctx, size, PAL.body, "bold");
      ctx.fillStyle = PAL.bone;
      ctx.fillText(it.str, x, yy);
    }
    if (it.sub) {
      font(ctx, Math.round(size * 0.72), PAL.mono, "");
      ctx.fillStyle = "rgba(226,220,206,0.80)";
      ctx.fillText(it.sub, x + size * 1.15, yy + size * 0.95);
      yy += size * 0.62;
    }
    yy += size * gap;
  }
  ctx.restore();
  return yy;
}

// ---------- softVignette: photo-led frames keep their edges ----------
export function softVignette(ctx, W, H) {
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.55, W / 2, H / 2, W * 0.78);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(4,5,8,0.20)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// ---------- inkGrid: cipher glyphs as ink on paper (RC6 fix) ----------
// For LIGHT plates (paper reconstructions). Same deterministic contract as cipherGrid.
export function inkGrid(ctx, x, y, w, h, cols, rows, seed, opts = {}) {
  const { p = 1, accent = [], accentColor = "rgba(176,64,47,0.95)", amber = [], solved = null, solvedRows = 0, inkColor = "#23201a" } = opts;
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?#%&@◆●▲■×".split("");
  const cell = Math.min(w / cols, h / rows);
  const gw = cell * cols, gh = cell * rows;
  const ox = x + (w - gw) / 2, oy = y + (h - gh) / 2;
  const rng = RNG(seed);
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push(Math.floor(rng() * GLYPHS.length));
  const total = cells.length;
  const shown = Math.floor(total * clamp(p * 1.08));
  font(ctx, Math.round(cell * 0.60), PAL.mono, "bold");
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (i >= shown) continue;
      const gx = ox + c * cell + cell / 2, gy = oy + r * cell + cell / 2;
      const isSolved = solved && r < solvedRows;
      ctx.fillStyle = isSolved ? "rgba(150,74,42,0.95)" : accent.includes(i) ? accentColor : amber.includes(i) ? "rgba(146,106,34,0.95)" : inkColor;
      ctx.fillText(isSolved && solved ? (solved[i] || GLYPHS[cells[i]]) : GLYPHS[cells[i]], gx, gy);
    }
  }
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.strokeStyle = "rgba(110,100,80,0.55)"; ctx.lineWidth = 1.2;
  ctx.strokeRect(ox - 6, oy - 6, gw + 12, gh + 12);
  return { ox, oy, gw, gh, cell };
}
