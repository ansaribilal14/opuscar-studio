// scenes_d2.mjs — v4: evidence + theories (video-004)
// Scene fns: (ctx, W, H, tLoc, dur, b) — CONTENT only; dispatcher adds chrome.
import { PAL as S, kicker, rule, paper, glow } from "./film_look.mjs";
import { clamp, lerp, ease, easeOut, text, font, textW, RNG } from "./engine.mjs";
import { plate, band } from "./comp_modes.mjs";
import { photo } from "./comp_modes.mjs";
import { header, creditBR, chip, stamp, base, dline, quoteBar } from "./support.mjs";
import { terrainPlate, mapBox, geoInBox, mark, mlabel, poly, snow, TERR, CREDIT_TERRAIN } from "./terrain_d.mjs";
import { inkTent } from "./scenes_d1.mjs";

// ---------- slope cross-section (the science chapter's workhorse) ----------
// Slope descends left(upslope) -> right(down to forest). Documented geometry:
// ~23 degree surface, tent platform cut, weak layer, wind-deposited slab above.
export function slopeProfile(ctx, x, y, w, h, opts = {}) {
  const { p = 1, cut = 0, deposit = 0, slab = 0, wind = 0, weak = true, labels = true, tent = true } = opts;
  const ang = 23 * Math.PI / 180;
  const surfY = (fx) => y + h * 0.42 + Math.tan(ang) * (fx - 0.18) * w * 0.42;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  // sky
  const sg = ctx.createLinearGradient(0, y, 0, y + h);
  sg.addColorStop(0, "#0c1119"); sg.addColorStop(1, "#131a26");
  ctx.fillStyle = sg; ctx.fillRect(x, y, w, h);
  // snowpack body under the surface line
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  for (let i = 0; i <= 40; i++) {
    const fx = i / 40;
    ctx.lineTo(x + fx * w, surfY(fx) - deposit * Math.max(0, 0.30 - Math.abs(fx - 0.24)) * h * 0.55);
  }
  ctx.lineTo(x + w, y + h); ctx.closePath();
  const gg = ctx.createLinearGradient(0, y, 0, y + h);
  gg.addColorStop(0, "#31405a"); gg.addColorStop(1, "#1b2333");
  ctx.fillStyle = gg; ctx.fill();
  ctx.strokeStyle = "rgba(232,236,242,0.75)"; ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const fx = i / 40;
    const py = surfY(fx) - deposit * Math.max(0, 0.30 - Math.abs(fx - 0.24)) * h * 0.55;
    i === 0 ? ctx.moveTo(x + fx * w, py) : ctx.lineTo(x + fx * w, py);
  }
  ctx.stroke();
  // strata
  ctx.strokeStyle = "rgba(210,220,235,0.16)"; ctx.lineWidth = 1.2;
  for (let k = 1; k <= 3; k++) {
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const fx = i / 40;
      const py = surfY(fx) + k * h * 0.09;
      i === 0 ? ctx.moveTo(x + fx * w, py) : ctx.lineTo(x + fx * w, py);
    }
    ctx.stroke();
  }
  // weak layer (dashed crimson)
  if (weak) {
    ctx.strokeStyle = "rgba(208,90,60,0.9)"; ctx.lineWidth = 2; ctx.setLineDash([9, 7]);
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const fx = i / 40;
      const py = surfY(fx) + h * 0.135;
      i === 0 ? ctx.moveTo(x + fx * w, py) : ctx.lineTo(x + fx * w, py);
    }
    ctx.stroke(); ctx.setLineDash([]);
    if (labels && p > 0.8) text(ctx, "WEAK LAYER", x + w * 0.05, y + h * 0.80, Math.max(10, h * 0.045), { family: S.mono, color: "rgba(224,140,110,0.95)", spacing: 1.5 });
  }
  // platform cut (trench) + tent
  const cutFx = 0.24;
  if (cut > 0) {
    const cx0 = x + cutFx * w, cy0 = surfY(cutFx);
    ctx.fillStyle = "#101722";
    ctx.beginPath();
    ctx.moveTo(cx0 - w * 0.035, cy0 - 2);
    ctx.lineTo(cx0 + w * 0.035, cy0 + Math.tan(ang) * w * 0.035 - 2);
    ctx.lineTo(cx0 + w * 0.035, cy0 + h * 0.075);
    ctx.lineTo(cx0 - w * 0.035, cy0 + h * 0.075);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(210,168,94,0.85)"; ctx.lineWidth = 1.6; ctx.stroke();
    if (labels && cut > 0.6) text(ctx, "PLATFORM CUT", cx0 - w * 0.05, cy0 + h * 0.175, Math.max(10, h * 0.042), { family: S.mono, color: "rgba(210,168,94,0.95)", spacing: 1.5 });
  }
  if (tent) {
    const tFx = cutFx + slab * 0.012;
    const txp = x + tFx * w, typ = surfY(tFx);
    ctx.save(); ctx.translate(txp - w * 0.022, typ - h * 0.012);
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.085); ctx.lineTo(-w * 0.026, 0); ctx.lineTo(w * 0.026, 0); ctx.closePath();
    ctx.fillStyle = "rgba(234,227,212,0.92)"; ctx.fill();
    ctx.strokeStyle = "#0b0f16"; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.restore();
    if (labels && p > 0.5) text(ctx, "TENT", txp - w * 0.028, typ - h * 0.115, Math.max(10, h * 0.042), { family: S.mono, color: S.bone, spacing: 1.5 });
  }
  // slab block sliding (release)
  if (slab > 0) {
    const sFx = 0.06 + slab * 0.14;
    const sx0 = x + sFx * w, sy0 = surfY(sFx);
    ctx.save();
    ctx.translate(sx0, sy0 - h * 0.055);
    ctx.rotate(ang * 0.85);
    ctx.fillStyle = "rgba(154,178,205,0.85)";
    ctx.fillRect(-w * 0.055, -h * 0.045, w * 0.11, h * 0.05);
    ctx.strokeStyle = "rgba(232,236,242,0.9)"; ctx.lineWidth = 1.6;
    ctx.strokeRect(-w * 0.055, -h * 0.045, w * 0.11, h * 0.05);
    ctx.restore();
    // crown fracture
    ctx.strokeStyle = "rgba(208,90,60,0.95)"; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(sx0, sy0 - h * 0.005); ctx.lineTo(sx0, sy0 + h * 0.13); ctx.stroke();
  }
  // wind arrows + deposition
  if (wind > 0) {
    const rng = RNG(71);
    ctx.strokeStyle = `rgba(210,220,235,${0.55 * wind})`; ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const ay = y + h * (0.08 + rng() * 0.22);
      const ax = x + ((rng() * w + t_ws(wind, i)) % (w * 0.9));
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + w * 0.045, ay - h * 0.012); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax + w * 0.045, ay - h * 0.012); ctx.lineTo(ax + w * 0.032, ay - h * 0.022); ctx.stroke();
    }
    if (labels && wind > 0.5) text(ctx, "KATABATIC WIND \u00B7 SNOW TRANSPORT", x + w * 0.52, y + h * 0.09, Math.max(10, h * 0.042), { family: S.mono, color: "rgba(200,214,232,0.85)", spacing: 1.5 });
  }
  // forest at the bottom right
  const rng2 = RNG(83);
  ctx.fillStyle = "#0a0d12";
  for (let i = 0; i < 12; i++) {
    const fx = 0.72 + i * 0.026;
    const bx = x + fx * w, by = surfY(Math.min(1, fx + 0.06)) + h * 0.10;
    const th = h * (0.10 + rng2() * 0.10), tw2 = h * 0.07;
    ctx.beginPath();
    ctx.moveTo(bx - tw2, by + h); ctx.lineTo(bx, by + h - th); ctx.lineTo(bx + tw2, by + h);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function t_ws(wind, i) { return (Date.now() % 1e9) * 0; } // deterministic: no wall-clock in frames
// (wind arrows shift deterministically via wind param itself)

// ---------- b3a: the search ----------
export function ev_search_tent(ctx, W, H, tLoc, dur, b) {
  const img = photo("search_photos.jpg");
  terrainPlate(ctx, W, H, tLoc, dur, "camp", { seed: "b3a-search", scrim: 0.24, move: { zoom: [1.06, 1.18], pan: [0.35, 0.55, 0.60, 0.35] } });
  // search grid sweep
  const gp = ease(clamp((tLoc - 0.7) / 2.4));
  ctx.save(); ctx.globalAlpha = 0.30 * gp;
  ctx.strokeStyle = "rgba(210,168,94,0.8)"; ctx.lineWidth = 1;
  const N = 12;
  for (let i = 0; i <= N * gp; i++) {
    const fx = i / N;
    ctx.beginPath(); ctx.moveTo(fx * W, 0); ctx.lineTo(fx * W, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, fx * H); ctx.lineTo(W, fx * H); ctx.stroke();
  }
  ctx.restore();
  header(ctx, W, H, tLoc, "THE SEARCH \u00B7 FEBRUARY 20\u201326", "Volunteers, students, aircraft");
  band(ctx, W, H, 0.68, 0.24, 0.44, "full");
  chip(ctx, "FEB 26 \u00B7 THE TENT FOUND BY A STUDENT PARTY", W / 2, Math.round(H * 0.775), Math.round(H * 0.021), { align: "center", color: S.bone, alpha: ease(clamp((tLoc - 2.6) / 0.9)) });
  chip(ctx, "INSIDE: MONEY \u00B7 DOCUMENTS \u00B7 FOOD \u2014 NO ONE", W / 2, Math.round(H * 0.845), Math.round(H * 0.021), { align: "center", color: "rgba(224,120,96,0.98)", alpha: ease(clamp((tLoc - 3.4) / 0.9)) });
  if (img) creditBR(ctx, W, H, "SEARCH PHOTOGRAPHY (CREDITED)"); else creditBR(ctx, W, H, CREDIT_TERRAIN);
}

// ---------- b3b: cuts + prints ----------
export function ev_cuts_prints(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE TENT \u00B7 CLOSE UP", "Cut from the inside");
  // large tent wall with 9 numbered slashes
  const wx = Math.round(W * 0.30), wy = Math.round(H * 0.60), ww = Math.round(W * 0.34), wh = Math.round(H * 0.42);
  ctx.save();
  const g = ctx.createLinearGradient(wx, wy - wh / 2, wx, wy + wh / 2);
  g.addColorStop(0, "#3a4356"); g.addColorStop(1, "#242c3c");
  ctx.translate(wx, wy); ctx.rotate(-0.035); ctx.translate(-wx, -wy);
  ctx.beginPath();
  ctx.moveTo(wx - ww / 2, wy - wh * 0.22); ctx.lineTo(wx + ww / 2, wy - wh * 0.34);
  ctx.lineTo(wx + ww / 2, wy + wh * 0.30); ctx.lineTo(wx - ww / 2, wy + wh * 0.36); ctx.closePath();
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = "rgba(234,227,212,0.55)"; ctx.lineWidth = 2; ctx.stroke();
  // slashes appear 1..9
  const rng = RNG(97);
  for (let i = 0; i < 9; i++) {
    const p = ease(clamp((tLoc - 0.9 - i * 0.22) / 0.4));
    if (p <= 0) break;
    const fx = -0.40 + (i % 5) * 0.19 + (Math.floor(i / 5) * 0.05);
    const fy = -0.16 + Math.floor(i / 5) * 0.22 + (rng() - 0.5) * 0.05;
    const x0 = wx + fx * ww, y0 = wy + fy * wh;
    ctx.save(); ctx.globalAlpha = p;
    ctx.strokeStyle = "rgba(208,90,60,0.98)"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + ww * 0.05, y0 + wh * 0.16); ctx.stroke();
    font(ctx, Math.round(H * 0.020), S.mono, "bold");
    ctx.fillStyle = "rgba(234,227,212,0.9)";
    ctx.fillText(String(i + 1), x0 + ww * 0.055, y0 + wh * 0.17);
    ctx.restore();
  }
  ctx.restore();
  // annotations right
  band(ctx, W, H, 0.42, 0.42, 0.40, "right", 0.40);
  const rows = [["SOME REACHABLE", "ONLY FROM WITHIN"], ["COUNTED:", "8\u20139 SLASHES"], ["OUTSIDE:", "8\u20139 WALKING TRAILS"]];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.4 - i * 0.9) / 0.7));
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p;
    text(ctx, r[0], Math.round(W * 0.645), Math.round(H * (0.50 + i * 0.10)), Math.round(H * 0.026), { family: S.mono, color: S.bone, spacing: 1.5 });
    text(ctx, r[1], Math.round(W * 0.645), Math.round(H * (0.50 + i * 0.10) + H * 0.034), Math.round(H * 0.026), { family: S.mono, color: S.amber, spacing: 1.5 });
    ctx.restore();
  });
  stamp(ctx, "FROM WITHIN", W - Math.round(W * 0.10), Math.round(H * 0.24), Math.round(H * 0.030), "rgba(208,90,60,0.9)", -0.07, ease(clamp((tLoc - 3.6) / 0.7)));
  creditBR(ctx, W, H, "TENT WALL: STYLIZED RECONSTRUCTION \u00B7 COUNTS PER PROTOCOL");
}

// ---------- b3c: the cedar ----------
function cedar(ctx, cx, baseY, w, h, opts = {}) {
  const { p = 1, breaks = 0, fire = 0 } = opts;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 1.3);
  // trunk
  ctx.strokeStyle = "#0c0f14"; ctx.lineWidth = Math.max(6, w * 0.10);
  ctx.beginPath(); ctx.moveTo(cx, baseY); ctx.lineTo(cx, baseY - h); ctx.stroke();
  // branch layers (dense bottom, sparse top) — drawn as strokes
  const rng = RNG(113);
  for (let i = 0; i < 14; i++) {
    const fy = i / 14;
    const y = baseY - h * (0.18 + fy * 0.82);
    const spread = w * (0.85 - fy * 0.62);
    ctx.lineWidth = Math.max(1.6, w * 0.028);
    ctx.strokeStyle = "#0e1218";
    ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx - spread, y - h * 0.05); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx + spread, y - h * 0.05); ctx.stroke();
  }
  // fire glow at base
  if (fire > 0) {
    const gr = ctx.createRadialGradient(cx, baseY - 6, 0, cx, baseY - 6, w * 0.9);
    gr.addColorStop(0, `rgba(224,140,60,${0.5 * fire})`); gr.addColorStop(0.5, `rgba(200,100,40,${0.22 * fire})`); gr.addColorStop(1, "rgba(200,100,40,0)");
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, baseY - 6, w * 0.9, 0, 7); ctx.fill();
    // small flame tongues
    ctx.fillStyle = `rgba(234,170,80,${0.85 * fire})`;
    for (let i = 0; i < 5; i++) {
      const fx = cx + (i - 2) * w * 0.10;
      const fh = (0.25 + 0.5 * Math.abs(Math.sin(i * 2.1 + fire * 5))) * h * 0.07 * fire;
      ctx.beginPath(); ctx.moveTo(fx - w * 0.03, baseY); ctx.quadraticCurveTo(fx, baseY - fh * 2, fx + w * 0.03, baseY); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
}
export function ev_cedar(ctx, W, H, tLoc, dur, b) {
  snowGround(ctx, W, H, 0.66, 0.12);
  treelineD(ctx, W, H, 0.80, 0.85);
  cedar(ctx, W * 0.34, H * 0.80, W * 0.14, H * 0.52, { p: ease(clamp(tLoc / 1.0)), fire: ease(clamp((tLoc - 1.2) / 1.2)) });
  // two memorial crosses at the base
  const p2 = ease(clamp((tLoc - 2.2) / 0.9));
  if (p2 > 0) {
    ctx.save(); ctx.globalAlpha = p2; ctx.strokeStyle = "rgba(234,227,212,0.9)"; ctx.lineWidth = 3;
    for (const dx of [-W * 0.055, W * 0.05]) {
      const x = W * 0.34 + dx, y = H * 0.845;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - H * 0.045); ctx.moveTo(x - H * 0.014, y - H * 0.032); ctx.lineTo(x + H * 0.014, y - H * 0.032); ctx.stroke();
    }
    ctx.restore();
  }
  snow(ctx, W, H, tLoc, 53, 60, 24);
  header(ctx, W, H, tLoc, "THE FOREST EDGE \u00B7 1.5 KM DOWN", "A fire under the cedar");
  band(ctx, W, H, 0.68, 0.26, 0.46, "right", 0.46);
  const rows = [["DOROSHENKO \u00B7 21", "EXPOSURE"], ["KRIVONISHENKO \u00B7 23", "EXPOSURE"], ["THE AUTOPSY:", "BURNS ON THEIR HANDS"]];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 2.4 - i * 0.7) / 0.7));
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p;
    text(ctx, r[0], Math.round(W * 0.60), Math.round(H * (0.74 + i * 0.062)), Math.round(H * 0.022), { family: S.mono, color: i < 2 ? S.bone : "rgba(224,120,96,0.98)", spacing: 1.5 });
    if (i === 2) text(ctx, r[1], Math.round(W * 0.60), Math.round(H * (0.74 + i * 0.062) + H * 0.030), Math.round(H * 0.019), { family: S.mono, color: S.boneDim, spacing: 1.5 });
    ctx.restore();
  });
  creditBR(ctx, W, H, "CEDAR SITE: STYLIZED RECONSTRUCTION \u00B7 MEMORIAL MARKERS");
}
function snowGround(ctx, W, H, horizon, dark) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0b0f16"); g.addColorStop(horizon * 0.7, "#141b26"); g.addColorStop(1, "#1d2634");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const gg = ctx.createLinearGradient(0, H * horizon, 0, H);
  gg.addColorStop(0, "#2a3648"); gg.addColorStop(1, "#38455c");
  ctx.fillStyle = gg; ctx.fillRect(0, H * horizon, W, H * (1 - horizon));
  if (dark > 0) { ctx.fillStyle = `rgba(7,10,18,${dark})`; ctx.fillRect(0, 0, W, H); }
}
function treelineD(ctx, W, H, yFrac, alpha) {
  const rng = RNG(29);
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.fillStyle = "#0a0d12";
  const base = H * yFrac;
  for (let x = -20; x < W + 40;) {
    const w = 26 + rng() * 46, h = 60 + rng() * 130;
    ctx.beginPath(); ctx.moveTo(x, base + 40); ctx.lineTo(x + w / 2, base + 40 - h); ctx.lineTo(x + w, base + 40); ctx.closePath(); ctx.fill();
    x += w * 0.62;
  }
  ctx.fillRect(0, base + 36, W, H - base);
  ctx.restore();
}

// ---------- b3c2: the cedar climb ----------
export function ev_cedar_climb(ctx, W, H, tLoc, dur, b) {
  snowGround(ctx, W, H, 0.72, 0.16);
  // trunk close-up
  const tx = Math.round(W * 0.38);
  ctx.save();
  ctx.strokeStyle = "#0c0f14"; ctx.lineWidth = Math.max(20, H * 0.045);
  ctx.beginPath(); ctx.moveTo(tx, H); ctx.lineTo(tx + W * 0.015, 0); ctx.stroke();
  ctx.restore();
  // branch-break ticks + height scale to 5 m
  const p = ease(clamp((tLoc - 0.8) / 2.2));
  const y0 = H * 0.86, y1 = H * 0.30; // 0 m .. 5 m
  ctx.save();
  ctx.strokeStyle = "rgba(210,168,94,0.85)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W * 0.56, y0); ctx.lineTo(W * 0.56, y0 - (y0 - y1) * p); ctx.stroke();
  for (let m2 = 0; m2 <= 5; m2++) {
    const yy = y0 - (y0 - y1) * (m2 / 5) * p;
    ctx.beginPath(); ctx.moveTo(W * 0.56 - 8, yy); ctx.lineTo(W * 0.56 + 8, yy); ctx.stroke();
    text(ctx, `${m2} m`, W * 0.575, yy + 5, Math.round(H * 0.018), { family: S.mono, color: S.boneDim });
  }
  ctx.restore();
  const rng = RNG(131);
  for (let i = 0; i < 7; i++) {
    const fp = 0.30 + rng() * 0.62;
    if (p < fp) continue;
    const yy = y0 - (y0 - y1) * fp;
    ctx.save();
    ctx.strokeStyle = "rgba(208,90,60,0.95)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(tx - 16, yy); ctx.lineTo(tx - 52 - rng() * 20, yy - 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx + 16, yy - 14); ctx.lineTo(tx + 48 + rng() * 22, yy - 26); ctx.stroke();
    ctx.restore();
  }
  header(ctx, W, H, tLoc, "THE CEDAR ITSELF", "Branches broken five metres up");
  band(ctx, W, H, 0.72, 0.18, 0.46, "full");
  chip(ctx, "CLIMBED FOR \u2014 IN THE DARK, IN LETHAL COLD, BY BARE HANDS", W / 2, Math.round(H * 0.805), Math.round(H * 0.020), { align: "center", color: S.bone, alpha: ease(clamp((tLoc - 2.8) / 0.9)) });
  chip(ctx, "SEARCHERS' NOTE: UNEXPLAINED", W / 2, Math.round(H * 0.875), Math.round(H * 0.019), { align: "center", color: "rgba(224,120,96,0.98)", alpha: ease(clamp((tLoc - 3.6) / 0.8)) });
  creditBR(ctx, W, H, "RECONSTRUCTION FROM SEARCH PROTOCOLS");
}

// ---------- b3d: the line back ----------
export function ev_line_back(ctx, W, H, tLoc, dur, b) {
  const win = [61.775, 61.725, 59.405, 59.475];
  mapBox(ctx, TERR.camp, 0, 0, W, H, win, { night: 0.30 });
  const P = (lat, lon) => geoInBox(win, 0, 0, W, H, lat, lon);
  const pts = [[61.7517, 59.4233], [61.7505, 59.4265], [61.7520, 59.4330], [61.7533, 59.4483]];
  const p = ease(clamp((tLoc - 0.8) / 2.6));
  poly(ctx, win, 0, 0, W, H, pts, p, { color: "rgba(208,90,60,0.9)", width: Math.max(3, H * 0.004) });
  const mk = (lat, lon, label, when, pp) => {
    if (pp <= 0) return;
    const [x, y] = P(lat, lon);
    mark(ctx, x, y, { size: 7, color: "rgba(234,227,212,0.9)" });
    mlabel(ctx, label, x, y, Math.round(H * 0.016), { align: "left", dim: true });
    if (when) text(ctx, when, x + H * 0.012, y + H * 0.030, Math.round(H * 0.015), { family: S.mono, color: S.boneFaint });
  };
  mk(61.7517, 59.4233, "CEDAR", "FEB 26\u201327", 1);
  mk(61.7520, 59.4330, "DYATLOV", "FEB 28", ease(clamp((tLoc - 1.6) / 0.7)));
  mk(61.7527, 59.4395, "SLOBODIN \u00B7 KOLMOGOROVA", "MAR 5", ease(clamp((tLoc - 2.4) / 0.7)));
  mk(61.7533, 59.4483, "TENT", "", 1);
  header(ctx, W, H, tLoc, "BETWEEN CEDAR AND TENT", "A line of attempts, facing upslope");
  chip(ctx, "SPACED ALONG THE FOOTPRINT LINE \u00B7 MEMORIAL MARKERS, POSITIONS APPROXIMATE", Math.round(W * 0.062), Math.round(H * 0.90), Math.round(H * 0.015), { color: S.boneFaint, alpha: ease(clamp((tLoc - 3.2) / 0.8)) });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

// ---------- b3e: the ravine four ----------
export function ev_ravine_four(ctx, W, H, tLoc, dur, b) {
  const win = [61.762, 61.738, 59.412, 59.452];
  mapBox(ctx, TERR.camp, 0, 0, W, H, win, { night: 0.26 });
  const [rx, ry] = geoInBox(win, 0, 0, W, H, 61.7505, 59.4265);
  const p = ease(clamp((tLoc - 0.9) / 1.0));
  if (p > 0) { mark(ctx, rx, ry, { size: 8 }); mlabel(ctx, "THE RAVINE \u00B7 THE DEN", rx, ry, Math.round(H * 0.018), { align: "left" }); }
  // snow-depth gauge
  const gp = ease(clamp((tLoc - 1.8) / 1.6));
  const gx = Math.round(W * 0.72), gy0 = Math.round(H * 0.74), gh = Math.round(H * 0.16);
  ctx.save();
  ctx.fillStyle = "rgba(12,16,24,0.65)"; ctx.fillRect(gx, gy0 - gh, Math.round(W * 0.016), gh);
  ctx.fillStyle = "rgba(154,178,205,0.9)";
  ctx.fillRect(gx, gy0 - gh * gp, Math.round(W * 0.016), gh * gp);
  ctx.strokeStyle = "rgba(234,227,212,0.5)"; ctx.strokeRect(gx + 0.5, gy0 - gh + 0.5, W * 0.016, gh);
  text(ctx, `~4 m OF SNOW`, gx + W * 0.026, gy0 - gh * gp + 6, Math.round(H * 0.020), { family: S.mono, color: S.bone });
  ctx.restore();
  header(ctx, W, H, tLoc, "EARLY MAY \u00B7 THE SPRING MELT", "The last four, 75 metres from the cedar");
  band(ctx, W, H, 0.60, 0.14, 0.42, "left", 0.52);
  const names = "ZOLOTARYOV \u00B7 THIBEAUX-BRIGNOLLE \u00B7 DUBININA \u00B7 KOLEVATOV";
  text(ctx, names, Math.round(W * 0.062), Math.round(H * 0.70), Math.round(H * 0.019), { family: S.mono, color: S.bone, alpha: ease(clamp((tLoc - 2.8) / 0.9)), spacing: 1.2 });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

// ---------- b3f: autopsies split ----------
export function ev_autopsy_split(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE AUTOPSIES \u00B7 MARCH AND MAY 1959", "The nine divide in two");
  const colW = Math.round(W * 0.36);
  const cA = Math.round(W * 0.10), cB = Math.round(W * 0.54);
  const y0 = Math.round(H * 0.42);
  const pA = ease(clamp((tLoc - 0.9) / 0.9)), pB = ease(clamp((tLoc - 1.8) / 0.9));
  paper(ctx, cA, y0, colW, Math.round(H * 0.30), { alpha: pA });
  paper(ctx, cB, y0, colW, Math.round(H * 0.30), { alpha: pB });
  if (pA > 0) {
    font(ctx, Math.round(H * 0.034), S.mono, "bold"); ctx.fillStyle = "#23201a";
    ctx.fillText("FIVE", cA + Math.round(colW * 0.06), y0 + Math.round(H * 0.075));
    text(ctx, "DEATHS FROM EXPOSURE \u2014 THE COLD ALONE, IN EVERY CASE", cA + Math.round(colW * 0.06), y0 + Math.round(H * 0.125), Math.round(H * 0.020), { family: S.mono, color: "#4a463e", maxWidth: colW * 0.88 });
  }
  if (pB > 0) {
    font(ctx, Math.round(H * 0.034), S.mono, "bold"); ctx.fillStyle = "#8f2f22";
    ctx.fillText("FOUR", cB + Math.round(colW * 0.06), y0 + Math.round(H * 0.075));
    text(ctx, "FATAL INTERNAL INJURIES \u2014 WITH NO EXTERNAL WOUND", cB + Math.round(colW * 0.06), y0 + Math.round(H * 0.125), Math.round(H * 0.020), { family: S.mono, color: "#4a463e", maxWidth: colW * 0.88 });
  }
  chip(ctx, "SLOBODIN: SKULL FRACTURE \u2014 RULED NON-FATAL \u00B7 'NOT WHAT STOPPED HIM'", W / 2, Math.round(H * 0.84), Math.round(H * 0.019), { align: "center", color: S.boneDim, alpha: ease(clamp((tLoc - 3.0) / 0.9)) });
  creditBR(ctx, W, H, "FINDINGS PER AUTOPSY REPORTS \u00B7 DOCS 95\u2013134, CASE FILE");
}

// ---------- b3g: the injuries (restrained) ----------
export function ev_injuries(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE RAVINE FOUR", "The force that left no mark");
  const cards = [
    ["SKULL", "ONE CRUSHED \u2014 MAJOR FRACTURE"],
    ["CHEST", "TWO BROKEN IN MULTIPLE PLACES"],
    ["SKIN", "UNBROKEN \u2014 NO WOUND, ANYWHERE"],
  ];
  cards.forEach((c, i) => {
    const p = ease(clamp((tLoc - 0.9 - i * 0.85) / 0.8));
    if (p <= 0) return;
    const y = Math.round(H * (0.40 + i * 0.115));
    const x = Math.round(W * 0.30);
    ctx.save(); ctx.globalAlpha = p;
    ctx.fillStyle = i === 2 ? "rgba(208,90,60,0.14)" : "rgba(234,227,212,0.06)";
    ctx.fillRect(x - 14, y - H * 0.035, W * 0.40, H * 0.072);
    font(ctx, Math.round(H * 0.030), S.mono, "bold");
    ctx.fillStyle = i === 2 ? "rgba(224,120,96,0.98)" : S.bone;
    ctx.fillText(c[0], x, y);
    font(ctx, Math.round(H * 0.026), S.body, "");
    ctx.fillStyle = S.boneDim;
    ctx.fillText(c[1], x + Math.round(W * 0.115), y);
    ctx.restore();
  });
  chip(ctx, "THE KIND OF FORCE A CAR CRASH PRODUCES \u00B7 'FORCE WITHOUT A WOUND'", W / 2, Math.round(H * 0.82), Math.round(H * 0.019), { align: "center", color: S.amber, alpha: ease(clamp((tLoc - 3.4) / 0.9)) });
  creditBR(ctx, W, H, "NO GRAPHIC IMAGERY \u00B7 FINDINGS STATED FROM THE RECORD");
}

// ---------- b3h: the two details ----------
export function ev_details(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "FROM THE FILE", "Two facts that feed the legend");
  const y0 = Math.round(H * 0.42), colW = Math.round(W * 0.37);
  const pA = ease(clamp((tLoc - 0.9) / 0.9)), pB = ease(clamp((tLoc - 2.0) / 0.9));
  paper(ctx, Math.round(W * 0.09), y0, colW, Math.round(H * 0.26), { alpha: pA });
  if (pA > 0) {
    text(ctx, "PARTLY UNDRESSED", Math.round(W * 0.09) + 30, y0 + Math.round(H * 0.06), Math.round(H * 0.026), { family: S.mono, color: "#23201a", weight: "" });
    text(ctx, "A DOCUMENTED BEHAVIOUR OF TERMINAL HYPOTHERMIA", Math.round(W * 0.09) + 30, y0 + Math.round(H * 0.11), Math.round(H * 0.019), { family: S.mono, color: "#4a463e", maxWidth: colW - 60 });
    stamp(ctx, "DOCUMENTED", Math.round(W * 0.09) + colW - 90, y0 + Math.round(H * 0.20), Math.round(H * 0.017), "rgba(143,47,34,0.75)", -0.06, pA);
  }
  paper(ctx, Math.round(W * 0.54), y0, colW, Math.round(H * 0.26), { alpha: pB });
  if (pB > 0) {
    text(ctx, "BETA CONTAMINATION", Math.round(W * 0.54) + 30, y0 + Math.round(H * 0.06), Math.round(H * 0.026), { family: S.mono, color: "#23201a" });
    text(ctx, "ON SOME GARMENTS OF THE RAVINE FOUR \u00B7 FAR FROM LETHAL", Math.round(W * 0.54) + 30, y0 + Math.round(H * 0.11), Math.round(H * 0.019), { family: S.mono, color: "#4a463e", maxWidth: colW - 60 });
    stamp(ctx, "ORIGIN UNKNOWN", Math.round(W * 0.54) + colW - 110, y0 + Math.round(H * 0.20), Math.round(H * 0.017), "rgba(143,47,34,0.75)", 0.05, pB);
  }
  creditBR(ctx, W, H, "CONTENT PER RADIOLOGICAL APPENDIX \u00B7 AUTOPSY RECORDS");
}

// ---------- b3i: closure ----------
export function ev_closure(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  const p = ease(clamp(tLoc / 1.0));
  kicker(ctx, "MAY 28, 1959 \u00B7 THE CASE IS CLOSED", Math.round(W * 0.30), Math.round(H * 0.30), Math.round(H * 0.020), { alpha: p });
  const q = "\u201Ca compelling natural force which they were unable to overcome\u201D";
  const yq = Math.round(H * 0.46);
  ctx.save(); ctx.globalAlpha = ease(clamp((tLoc - 0.8) / 1.4));
  font(ctx, Math.round(H * 0.043), S.serif, "bold");
  ctx.fillStyle = S.bone;
  wrapSpaced(ctx, q, Math.round(W * 0.14), yq, W * 0.72, Math.round(H * 0.062));
  ctx.restore();
  rule(ctx, W / 2, Math.round(H * 0.62), Math.round(W * 0.30), ease(clamp((tLoc - 2.2) / 0.9)));
  chip(ctx, "PROSECUTOR LEV IVANOV \u00B7 NO FORCE NAMED \u00B7 FILE SEALED", W / 2, Math.round(H * 0.70), Math.round(H * 0.019), { align: "center", color: S.boneDim, alpha: ease(clamp((tLoc - 2.6) / 0.9)) });
  stamp(ctx, "CASE CLOSED", W - Math.round(W * 0.14), Math.round(H * 0.82), Math.round(H * 0.026), "rgba(208,90,60,0.9)", -0.06, ease(clamp((tLoc - 3.2) / 0.7)));
  creditBR(ctx, W, H, "QUOTED FROM THE CLOSURE DECISION \u00B7 TYPOGRAPHIC REPRODUCTION");
}
function wrapSpaced(ctx, str, x, y, maxW, lineH) {
  const words = str.split(" ");
  let line = "", yy = y;
  for (const w of words) {
    const t2 = line ? line + " " + w : w;
    if (ctx.measureText(t2).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lineH; }
    else line = t2;
  }
  if (line) ctx.fillText(line, x, yy);
}

// ---------- b4a: theory frame ----------
export function th_frame(ctx, W, H, tLoc, dur, b) {
  terrainPlate(ctx, W, H, tLoc, dur, "camp", { seed: "b4a-frame", night: 0.5, scrim: 0.2 });
  dline(ctx, "EVERY THEORY MUST", W / 2, Math.round(H * 0.44), Math.round(H * 0.056), ease(clamp((tLoc - 0.5) / 0.9)), { color: S.bone, weight: "bold", align: "center" });
  dline(ctx, "SURVIVE THE EVIDENCE", W / 2, Math.round(H * 0.55), Math.round(H * 0.056), ease(clamp((tLoc - 1.2) / 0.9)), { color: S.amber, weight: "bold", align: "center" });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

// ruled-out card helper
function ruledOut(ctx, W, H, tLoc, dur, b, title, rows, stampTxt) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "WEIGHED AGAINST THE EVIDENCE", title);
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.0 - i * 0.65) / 0.7));
    if (p <= 0) return;
    const y = Math.round(H * (0.44 + i * 0.085));
    ctx.save(); ctx.globalAlpha = p;
    ctx.strokeStyle = "rgba(208,90,60,0.95)"; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(W * 0.30, y - H * 0.012); ctx.lineTo(W * 0.30 + H * 0.024, y + H * 0.012); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.30 + H * 0.024, y - H * 0.012); ctx.lineTo(W * 0.30, y + H * 0.012); ctx.stroke();
    font(ctx, Math.round(H * 0.026), S.body, "");
    ctx.fillStyle = S.bone;
    ctx.fillText(r, W * 0.30 + H * 0.055, y + H * 0.008);
    ctx.restore();
  });
  stamp(ctx, stampTxt, W - Math.round(W * 0.16), Math.round(H * 0.82), Math.round(H * 0.028), "rgba(208,90,60,0.92)", -0.05, ease(clamp((tLoc - 1.0 + rows.length * 0.65) / 0.7)));
  creditBR(ctx, W, H, "ASSESSMENT PER FORENSIC RECORD");
}
export function th_people(ctx, W, H, tLoc, dur, b) {
  ruledOut(ctx, W, H, tLoc, dur, b, "An attack by people", [
    "NO STRUGGLE \u00B7 NO DEFENSIVE WOUNDS",
    "NO THIRD-PARTY TRACKS ANYWHERE",
    "NOTHING STOLEN \u2014 EVEN THE MONEY",
    "THE MANSI: COOPERATIVE FROM THE START",
  ], "RULED OUT");
}
export function th_abandon(ctx, W, H, tLoc, dur, b) {
  ruledOut(ctx, W, H, tLoc, dur, b, "Deliberate abandonment", [
    "BOOTS \u00B7 COATS \u00B7 FOOD LEFT BEHIND",
    "MINUS THIRTY \u2014 NO DESTINATION CHOSEN",
    "BODIES FOUND ALONG THE RETURN LINE",
    "THE GROUP KEPT TRYING TO LIVE",
  ], "CONTRADICTED");
}

// ---------- b4d: the sky (testimony) ----------
export function th_sky(ctx, W, H, tLoc, dur, b) {
  terrainPlate(ctx, W, H, tLoc, dur, "route", { seed: "b4d-sky", night: 0.55, scrim: 0.2, move: { zoom: [1.05, 1.16], pan: [0.5, 0.62, 0.5, 0.30] } });
  // subtle warm glow arc in the sky zone
  const gp = ease(clamp((tLoc - 1.2) / 1.6));
  if (gp > 0) {
    ctx.save(); ctx.globalAlpha = 0.5 * gp;
    const gx = W * (0.30 + 0.4 * ease(clamp((tLoc - 1.2) / 4.5)));
    const gr = ctx.createRadialGradient(gx, H * 0.22, 0, gx, H * 0.22, W * 0.05);
    gr.addColorStop(0, "rgba(240,160,80,0.55)"); gr.addColorStop(1, "rgba(240,160,80,0)");
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(gx, H * 0.22, W * 0.05, 0, 7); ctx.fill();
    ctx.restore();
  }
  header(ctx, W, H, tLoc, "TESTIMONY ON FILE", "Glowing objects in the night sky");
  band(ctx, W, H, 0.66, 0.26, 0.46, "full");
  const rows = [
    ["WITNESS STATEMENTS, SPRING 1959 \u00B7 REGION-WIDE", S.bone],
    ["THE ERA: EARLY SOVIET ROCKET TESTS", S.boneDim],
    ["NOTHING PLACES ANY EVENT OVER THE SLOPE THAT NIGHT", "rgba(224,120,96,0.98)"],
    ["CONTAMINATION: REAL \u00B7 UNEXPLAINED", S.amber],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.4 - i * 0.75) / 0.75));
    if (p <= 0) return;
    chip(ctx, r[0], W / 2, Math.round(H * (0.74 + i * 0.055)), Math.round(H * 0.017), { align: "center", color: r[1], alpha: p });
  });
  creditBR(ctx, W, H, "TESTIMONY \u2260 EVENT \u00B7 ATMANAKI 7\u20138.IV.59 ON FILE");
}

// ---------- b4d2: infrasound ----------
export function th_infrasound(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE HONEST HYPOTHESIS", "Infrasound \u2014 wind at the edge of hearing");
  // ridge profile
  const p = ease(clamp(tLoc / 1.2));
  ctx.save(); ctx.globalAlpha = p;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.78);
  ctx.quadraticCurveTo(W * 0.28, H * 0.42, W * 0.46, H * 0.60);
  ctx.quadraticCurveTo(W * 0.62, H * 0.74, W, H * 0.66);
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  const g = ctx.createLinearGradient(0, H * 0.4, 0, H);
  g.addColorStop(0, "#2c3a50"); g.addColorStop(1, "#1a2230");
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = "rgba(232,236,242,0.6)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  // wind flow arrows along the ridge + long-wave rings
  const wp = ease(clamp((tLoc - 1.0) / 1.4));
  if (wp > 0) {
    for (let i = 0; i < 6; i++) {
      const q = clamp((wp * 1.6 - i * 0.12) % 1.2, 0, 1);
      const x = W * (0.05 + q * 0.9), y = H * (0.40 + Math.sin(x / W * 3) * 0.05);
      ctx.save(); ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "rgba(210,220,235,0.8)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 44, y - 8); ctx.stroke();
      ctx.restore();
    }
    const cx2 = W * 0.46, cy2 = H * 0.56;
    for (let i = 0; i < 4; i++) {
      const rp = clamp(wp * 2 - i * 0.25, 0, 1);
      if (rp <= 0) continue;
      ctx.save(); ctx.globalAlpha = (1 - rp) * 0.5 * wp;
      ctx.strokeStyle = "rgba(210,168,94,0.9)"; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(cx2, cy2, rp * W * 0.13, 0, 7); ctx.stroke();
      ctx.restore();
    }
  }
  band(ctx, W, H, 0.78, 0.16, 0.46, "full");
  const rows = ["FITS THE FEAR", "NOT THE INJURIES \u00B7 NOT THE CUTS \u00B7 NOT THE TRACKS", "UNTESTABLE HERE \u2014 REMAINS A HYPOTHESIS"];
  rows.forEach((r, i) => {
    const p2 = ease(clamp((tLoc - 1.8 - i * 0.8) / 0.7));
    if (p2 <= 0) return;
    chip(ctx, r, W / 2, Math.round(H * (0.845 + i * 0.05)), Math.round(H * 0.017), { align: "center", color: i === 0 ? S.bone : i === 2 ? "rgba(224,120,96,0.98)" : S.boneDim, alpha: p2 });
  });
  creditBR(ctx, W, H, "DIAGRAM: STYLIZED \u00B7 MECHANISM PER PUBLISHED STUDIES");
}

// ---------- b4e: the avalanche stalemate ----------
export function th_avalanche(ctx, W, H, tLoc, dur, b) {
  terrainPlate(ctx, W, H, tLoc, dur, "slope", { seed: "b4e-slope", scrim: 0.26, move: { zoom: [1.05, 1.16], pan: [0.42, 0.5, 0.58, 0.4] } });
  // profile inset with the 23-degree marker
  const iw = Math.round(W * 0.52), ih = Math.round(H * 0.34);
  const ix = Math.round(W * 0.062), iy = Math.round(H * 0.60);
  const pp = ease(clamp((tLoc - 0.8) / 1.4));
  if (pp > 0) {
    ctx.save(); ctx.globalAlpha = pp;
    slopeProfile(ctx, ix, iy, iw, ih, { p: pp, labels: false, tent: false, weak: false });
    ctx.restore();
    const ang = 23 * Math.PI / 180;
    ctx.save();
    ctx.strokeStyle = "rgba(210,168,94,0.95)"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ix + iw * 0.18, iy + ih * 0.46);
    ctx.lineTo(ix + iw * 0.18 + iw * 0.52, iy + ih * 0.46 + Math.tan(ang) * iw * 0.52 * 0.42);
    ctx.stroke();
    ctx.restore();
    chip(ctx, "CAMP SITE SLOPE \u2248 23\u00B0 \u00B1 2\u00B0", ix + Math.round(iw * 0.18), Math.round(iy + ih * 0.30), Math.round(H * 0.019), { color: S.amber, alpha: pp });
    text(ctx, "CROSS-SECTION: FROM THE ACTUAL DEM \u00B7 STYLIZED", ix + 10, iy + 22, Math.round(H * 0.014), { family: S.mono, color: S.boneFaint });
  }
  header(ctx, W, H, tLoc, "THE AVALANCHE \u00B7 THE OBJECTIONS", "The strongest fit \u2014 the loudest doubts");
  const rows = ["NO CROWN LINE", "NO DEBRIS FIELD", "NO ONE BURIED", "THE SLOPE LOOKED CLEAN AT DAY 26"];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.6 - i * 0.6) / 0.6));
    if (p <= 0) return;
    chip(ctx, r, W - Math.round(W * 0.06), Math.round(H * (0.26 + i * 0.055)), Math.round(H * 0.018), { align: "right", color: "rgba(224,120,96,0.98)", alpha: p });
  });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

// ---------- b4f: the turn ----------
export function th_turn(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  const p = ease(clamp(tLoc / 0.8));
  dline(ctx, "JANUARY 2021", W / 2, Math.round(H * 0.38), Math.round(H * 0.070), p, { color: S.bone, weight: "bold", align: "center" });
  dline(ctx, "ETH ZURICH \u00B7 GAUME & PUZRIN", W / 2, Math.round(H * 0.50), Math.round(H * 0.040), ease(clamp((tLoc - 0.7) / 0.9)), { color: S.amber, align: "center" });
  rule(ctx, W / 2, Math.round(H * 0.57), Math.round(W * 0.30), ease(clamp((tLoc - 1.4) / 0.9)));
  chip(ctx, "\u201CMECHANISMS OF SLAB AVALANCHE RELEASE AND IMPACT IN THE DYATLOV PASS INCIDENT IN 1959\u201D", W / 2, Math.round(H * 0.645), Math.round(H * 0.017), { align: "center", color: S.boneDim, alpha: ease(clamp((tLoc - 1.8) / 0.9)) });
  chip(ctx, "COMMUNICATIONS EARTH & ENVIRONMENT \u00B7 OPEN ACCESS \u00B7 PEER-REVIEWED", W / 2, Math.round(H * 0.71), Math.round(H * 0.016), { align: "center", color: S.boneFaint, alpha: ease(clamp((tLoc - 2.4) / 0.9)) });
  creditBR(ctx, W, H, "DOI 10.1038/S43247-020-00081-8");
}
