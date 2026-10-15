// terrain_d.mjs — real-data terrain plates for video-004 (SRTM via Mapzen, CC-BY)
// Provides graded cover-draws of the two DEM hillshade plates plus geo-anchored
// markers/routes. Marker positions are documented approximations — the plate
// itself is real elevation data; captions say so.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { clamp, lerp, ease, RNG } from "./engine.mjs";
import { PAL as S } from "./film_look.mjs";
import { kb4 } from "./comp_modes.mjs";
import { text, textW } from "./engine.mjs";

export const CREDIT_TERRAIN = "TERRAIN: SRTM VIA MAPZEN TILES (CC-BY) \u00B7 MARKERS APPROXIMATE";

// plate bounds (match src/terrain.py mosaics; row 0 = north = lat1)
export const TERR = {
  route: { img: "route_relief.png", lat0: 60.82, lat1: 61.96, lon0: 59.15, lon1: 60.05 },
  camp:  { img: "campsite_relief.png", lat0: 61.70, lat1: 61.79, lon0: 59.36, lon1: 59.55 },
  slope: { img: "campsite_slope.png", lat0: 61.70, lat1: 61.79, lon0: 59.36, lon1: 59.55 },
};
// documented-approximate geography
export const GEO = {
  vizhay:  [60.8167, 59.6333, "VIZHAY"],
  lozva1:  [61.20, 59.58], lozva2: [61.45, 59.52],
  auspiya: [61.60, 59.62, "AUSPIYA VALLEY"],
  labaz:   [61.66, 59.60, "LABAZ"],
  climb:   [61.72, 59.47],
  kholat:  [61.7583, 59.4433, "KHOLAT SYAKHL \u00B7 1,079 m"],
  pass1079:[61.760, 59.480, "PASS 1,079"],
  otorten: [61.806, 59.527, "OTORTEN"],
  tent:    [61.7533, 59.4483, "TENT \u00B7 26 FEB"],
  cedar:   [61.7517, 59.4233, "CEDAR"],
  ravine:  [61.7505, 59.4265, "THE RAVINE"],
};

const rawCache = new Map();
{
  // loadImage returns a PROMISE in canvas 3.x — resolve all plates once at init
  const { loadImage } = require("canvas");
  for (const key of Object.keys(TERR)) {
    const p = process.cwd() + `/images/cache/${TERR[key].img}`;
    try { rawCache.set(TERR[key].img, await loadImage(p)); }
    catch (e) { console.error("terrain fail", TERR[key].img, e.message); rawCache.set(TERR[key].img, null); }
  }
}
const gradeCache = new Map();
function gradedTerrain(name, tint) {
  const key = name + ":" + (tint === "warm" ? "w" : "c");
  if (gradeCache.has(key)) return gradeCache.get(key);
  const img = rawCache.get(name);
  let out = null;
  if (img) {
    const TW = 2048, TH = Math.round(TW * img.height / img.width);
    const { createCanvas } = require("canvas");
    const cv = createCanvas(TW, TH), cx = cv.getContext("2d");
    cx.drawImage(img, 0, 0, TW, TH);
    const d = cx.getImageData(0, 0, TW, TH), q = d.data;
    for (let i = 0; i < q.length; i += 4) {
      // hillshade is grayscale -> steel-slate tint, opened shadows, gentle contrast
      const l = q[i];
      const lift = 18, gain = 1.02;
      let v = lift + (l * (255 - lift) / 255) * gain;
      v = 255 * Math.pow(clamp(v / 255, 0, 1), 0.88); // open shadows, keep highlight headroom
      const r = v * (tint === "warm" ? 1.045 : 0.93);
      const g = v * 0.99;
      const b = v * (tint === "warm" ? 0.94 : 1.10);
      q[i] = r; q[i + 1] = g; q[i + 2] = b;
    }
    cx.putImageData(d, 0, 0);
    out = { cv, w: TW, h: TH };
  }
  gradeCache.set(key, out);
  return out;
}

// cover-draw a terrain plate with KB motion + zone scrims (v4 ceilings)
export function terrainPlate(ctx, W, H, tLoc, dur, key, opts = {}) {
  const pl = TERR[key], { scrim = 0.22, topScrim = 0.18, seed = key, move = null, night = 0, warm = false } = opts;
  const gt = gradedTerrain(pl.img, warm ? "warm" : "cool");
  if (!gt) { ctx.fillStyle = "#10151b"; ctx.fillRect(0, 0, W, H); return false; }
  const p = ease(clamp(tLoc / Math.max(0.001, dur)));
  const mv = move || kb4(seed);
  const z = lerp(mv.zoom[0], mv.zoom[1], p);
  const iw = gt.w, ih = gt.h;
  const cover = Math.max(W / iw, H / ih) * z;
  const dw = iw * cover, dh = ih * cover;
  const freeX = Math.max(0, dw - W), freeY = Math.max(0, dh - H);
  const dx = lerp(clamp(mv.pan[0]), clamp(mv.pan[2]), p) * freeX;
  const dy = lerp(clamp(mv.pan[1]), clamp(mv.pan[3]), p) * freeY;
  ctx.drawImage(gt.cv, -dx - (freeX > 0 ? 0 : (W - dw) / 2), -dy - (freeY > 0 ? 0 : (H - dh) / 2), dw, dh);
  if (night > 0) { ctx.fillStyle = `rgba(7,10,18,${night})`; ctx.fillRect(0, 0, W, H); }
  if (scrim > 0) {
    const s = ctx.createLinearGradient(0, H * 0.58, 0, H);
    s.addColorStop(0, "rgba(8,10,14,0)"); s.addColorStop(1, `rgba(8,10,14,${scrim})`);
    ctx.fillStyle = s; ctx.fillRect(0, Math.round(H * 0.58), W, Math.round(H * 0.42));
  }
  if (topScrim > 0) {
    const s = ctx.createLinearGradient(0, 0, 0, H * 0.20);
    s.addColorStop(0, `rgba(8,10,14,${topScrim})`); s.addColorStop(1, "rgba(8,10,14,0)");
    ctx.fillStyle = s; ctx.fillRect(0, 0, W, Math.round(H * 0.20));
  }
  return true;
}

// geo -> px inside the drawn plate area. Because terrainPlate covers the whole
// frame, we project onto the CURRENT cover transform: for simplicity scenes use
// a static "mapBox" (a drawn sub-rect of the plate), so this maps into that box.
export function geoPx(pl, lat, lon, bx, by, bw, bh) {
  const fx = (lon - pl.lon0) / (pl.lon1 - pl.lon0);
  const fy = (pl.lat1 - lat) / (pl.lat1 - pl.lat0);
  return [bx + fx * bw, by + fy * bh];
}

// map-in-box: draws the plate cropped around a geo window into a box (inset maps)
export function mapBox(ctx, pl, bx, by, bw, bh, win, opts = {}) {
  // win: [latN, latS, lonW, lonE] drawn to fill the box (cover)
  const gt = gradedTerrain(pl.img, opts.warm ? "warm" : "cool");
  if (!gt) { ctx.fillStyle = "#10151b"; ctx.fillRect(bx, by, bw, bh); return; }
  const iw = gt.w, ih = gt.h;
  // geo window in plate fractions
  const fx0 = (win[2] - pl.lon0) / (pl.lon1 - pl.lon0), fx1 = (win[3] - pl.lon0) / (pl.lon1 - pl.lon0);
  const fy0 = (pl.lat1 - win[0]) / (pl.lat1 - pl.lat0), fy1 = (pl.lat1 - win[1]) / (pl.lat1 - pl.lat0);
  // crop rect in source px
  let sx = fx0 * iw, sy = fy0 * ih, sw = (fx1 - fx0) * iw, sh = (fy1 - fy0) * ih;
  // cover the box
  const s = Math.max(bw / sw, bh / sh);
  const cw = sw * s, ch = sh * s;
  const ox = bx + (bw - cw) / 2, oy = by + (bh - ch) / 2;
  ctx.save();
  ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
  ctx.drawImage(gt.cv, sx, sy, sw, sh, ox, oy, cw, ch);
  if (opts.night > 0) { ctx.fillStyle = `rgba(7,10,18,${opts.night})`; ctx.fillRect(bx, by, bw, bh); }
  ctx.restore();
  // expose transform for geo markers drawn over the box
  return { ox, oy, s, sx, sy, sw, sh };
}

// Simpler and reliable: geo -> BOX-relative point given the same win used by mapBox
export function geoInBox(win, bx, by, bw, bh, lat, lon) {
  const fx = (lon - win[2]) / (win[3] - win[2]);
  const fy = (win[0] - lat) / (win[0] - win[1]);
  return [bx + fx * bw, by + fy * bh];
}
export function mark(ctx, x, y, opts = {}) {
  const { color = "rgba(208,90,60,0.98)", size = 8, ring = true, glowA = 0.9 } = opts;
  ctx.save();
  if (ring) {
    const gr = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
    gr.addColorStop(0, `rgba(208,90,60,${0.35 * glowA})`); gr.addColorStop(1, "rgba(208,90,60,0)");
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, size * 3, 0, 7); ctx.fill();
  }
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, size * 0.30);
  ctx.beginPath();
  ctx.moveTo(x - size, y - size); ctx.lineTo(x + size, y + size);
  ctx.moveTo(x + size, y - size); ctx.lineTo(x - size, y + size);
  ctx.stroke();
  ctx.restore();
}
export function mlabel(ctx, str, x, y, size, opts = {}) {
  const { color = S.bone, align = "left", dim = false } = opts;
  const w = textW(ctx, str, size, S.mono);
  let xx = x + size * 0.9;
  if (align === "right") xx = x - size * 0.9 - w;
  ctx.save();
  ctx.fillStyle = "rgba(8,10,14,0.55)";
  ctx.fillRect(xx - 4, y - size * 0.85, w + 8, size * 1.25);
  text(ctx, str, xx, y, size, { family: S.mono, color: dim ? S.boneDim : color, spacing: 1.2 });
  ctx.restore();
}
// progressive polyline through geo points in a box
export function poly(ctx, win, bx, by, bw, bh, pts, p, opts = {}) {
  const { color = "rgba(210,168,94,0.95)", width = 3.5, dash = null, glow = true } = opts;
  const P = pts.map(q => geoInBox(win, bx, by, bw, bh, q[0], q[1]));
  const total = P.length - 1;
  const drawn = clamp(p) * total;
  ctx.save();
  if (glow) {
    ctx.shadowColor = color; ctx.shadowBlur = 10;
  }
  ctx.strokeStyle = color; ctx.lineWidth = width;
  if (dash) { ctx.setLineDash(dash); }
  ctx.beginPath();
  ctx.moveTo(P[0][0], P[0][1]);
  const full = Math.floor(drawn);
  for (let i = 0; i < Math.min(full, total); i++) ctx.lineTo(P[i + 1][0], P[i + 1][1]);
  if (full < total) {
    const sp = clamp(drawn - full, 0, 1);
    const A = P[full], B = P[full + 1];
    ctx.lineTo(A[0] + (B[0] - A[0]) * sp, A[1] + (B[1] - A[1]) * sp);
  }
  ctx.stroke(); ctx.setLineDash([]);
  if (glow && p < 1) {
    const i = Math.min(Math.floor(drawn), total - 1);
    const sp = clamp(drawn - i, 0, 1);
    const A = P[i], B = P[i + 1];
    const hx = A[0] + (B[0] - A[0]) * sp, hy = A[1] + (B[1] - A[1]) * sp;
    const gr = ctx.createRadialGradient(hx, hy, 0, hx, hy, 16);
    gr.addColorStop(0, "rgba(234,227,212,0.95)"); gr.addColorStop(1, "rgba(234,227,212,0)");
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(hx, hy, 16, 0, 7); ctx.fill();
  }
  ctx.restore();
}
// deterministic falling snow overlay
export function snow(ctx, W, H, t, seed = 11, density = 90, speed = 26) {
  const rng = RNG(seed);
  ctx.save();
  for (let i = 0; i < density; i++) {
    const bx = rng() * W, by0 = rng() * H, r = 0.7 + rng() * 1.9;
    const drift = 14 + rng() * 30;
    const y = (by0 + t * speed * (0.5 + rng())) % (H + 20) - 10;
    const x = (bx + Math.sin(t * 0.7 + i) * drift) % W;
    ctx.globalAlpha = 0.30 + 0.4 * rng();
    ctx.fillStyle = "#e8ecf2";
    ctx.beginPath(); ctx.arc((x + W) % W, y, r, 0, 7); ctx.fill();
  }
  ctx.restore();
}
