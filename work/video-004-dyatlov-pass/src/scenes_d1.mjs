// scenes_d1.mjs — v4: rebuilt hook + context (video-004)
// Scene fns: (ctx, W, H, tLoc, dur, b) — CONTENT only; dispatcher adds chrome.
// Image-first: real terrain plates (SRTM) + labelled ink reconstructions; photo
// slots activate automatically when a licence-verified asset lands in images/cache.
import { PAL as S, kicker, rule, paper, glow } from "./film_look.mjs";
import { clamp, lerp, ease, easeOut, text, font, textW, RNG } from "./engine.mjs";
import { plate, band, softVignette } from "./comp_modes.mjs";
import { photo } from "./comp_modes.mjs";
import { header, creditBR, chip, crosshair, base, dline } from "./support.mjs";
import { terrainPlate, mapBox, geoInBox, mark, mlabel, poly, snow, TERR, CREDIT_TERRAIN } from "./terrain_d.mjs";

// ---------- shared ink reconstructions ----------
// A-frame canvas tent, ink-on-dark; cut ticks in crimson. Labelled.
export function inkTent(ctx, cx, cy, w, h, opts = {}) {
  const { p = 1, cuts = 0, night = false, alpha = 1 } = opts;
  ctx.save(); ctx.globalAlpha *= alpha * clamp(p * 1.2);
  ctx.translate(cx, cy);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, night ? "rgba(46,52,66,0.95)" : "rgba(66,74,92,0.95)");
  g.addColorStop(1, night ? "rgba(24,28,38,0.95)" : "rgba(36,42,56,0.95)");
  // A-frame body
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.55);
  ctx.lineTo(-w * 0.46, h * 0.30);
  ctx.lineTo(-w * 0.46, h * 0.42);
  ctx.lineTo(w * 0.46, h * 0.42);
  ctx.lineTo(w * 0.46, h * 0.30);
  ctx.closePath();
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = "rgba(234,227,212,0.60)"; ctx.lineWidth = 2.2; ctx.stroke();
  // ridge + guy lines
  ctx.beginPath(); ctx.moveTo(-w * 0.56, -h * 0.40); ctx.lineTo(0, -h * 0.55); ctx.lineTo(w * 0.56, -h * 0.40); ctx.stroke();
  ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(234,227,212,0.30)";
  ctx.beginPath(); ctx.moveTo(-w * 0.46, h * 0.10); ctx.lineTo(-w * 0.62, h * 0.46); ctx.moveTo(w * 0.46, h * 0.10); ctx.lineTo(w * 0.62, h * 0.46); ctx.stroke();
  // snow lip on the ridge line
  ctx.strokeStyle = "rgba(232,236,242,0.55)"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-w * 0.30, -h * 0.50); ctx.lineTo(w * 0.30, -h * 0.50); ctx.stroke();
  // cut slashes (crimson) with tick numbers
  const cutPos = [[0.10, -0.18, 0.5], [0.26, 0.02, 0.62], [-0.12, 0.10, 0.44]];
  for (let i = 0; i < Math.min(cuts, cutPos.length); i++) {
    const [fx, fy, fl] = cutPos[i];
    const x0 = fx * w, y0 = fy * h;
    ctx.save();
    ctx.strokeStyle = "rgba(208,90,60,0.98)"; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + fl * w * 0.16, y0 + h * 0.16); ctx.stroke();
    font(ctx, Math.round(h * 0.12), S.mono, "bold");
    ctx.fillStyle = "rgba(208,90,60,0.98)";
    ctx.fillText(String(i + 1), x0 + fl * w * 0.16 + 8, y0 + h * 0.05);
    ctx.restore();
  }
  ctx.restore();
}

function snowGround(ctx, W, H, horizon = 0.62, dark = 0.0) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0b0f16"); g.addColorStop(horizon * 0.7, "#141b26"); g.addColorStop(1, "#1d2634");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // ground plane
  const gg = ctx.createLinearGradient(0, H * horizon, 0, H);
  gg.addColorStop(0, "#2a3648"); gg.addColorStop(1, "#38455c");
  ctx.fillStyle = gg; ctx.fillRect(0, H * horizon, W, H * (1 - horizon));
  if (dark > 0) { ctx.fillStyle = `rgba(7,10,18,${dark})`; ctx.fillRect(0, 0, W, H); }
}

function treeline(ctx, W, H, yFrac, alpha = 0.8) {
  const rng = RNG(29);
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.fillStyle = "#0a0d12";
  const base = H * yFrac;
  for (let x = -20; x < W + 40; ) {
    const w = 26 + rng() * 46, h = 60 + rng() * 130;
    ctx.beginPath();
    ctx.moveTo(x, base + 40);
    ctx.lineTo(x + w / 2, base + 40 - h);
    ctx.lineTo(x + w, base + 40);
    ctx.closePath(); ctx.fill();
    x += w * 0.62;
  }
  ctx.fillRect(0, base + 36, W, H - base);
  ctx.restore();
}

// ---------- b1a: HOOK — the tent find ----------
export function hook_tent_find(ctx, W, H, tLoc, dur, b) {
  const img = photo("tent_1959.jpg");
  if (img) {
    plate(ctx, W, H, tLoc, dur, "tent_1959.jpg", { scrim: 0.24, topScrim: 0.24 });
    creditBR(ctx, W, H, "PHOTOGRAPH: 1959 (CREDITED IN DESCRIPTION)");
  } else {
    snowGround(ctx, W, H, 0.60, 0.10);
    // slow push-in on the tableau (long holds must still move)
    const cam = 1 + 0.055 * ease(clamp(tLoc / Math.max(0.001, dur)));
    ctx.save();
    ctx.translate(W / 2, H * 0.52); ctx.scale(cam, cam); ctx.translate(-W / 2, -H * 0.52);
    const p = ease(clamp(tLoc / 1.2));
    inkTent(ctx, W * 0.42, H * 0.52, W * 0.40, H * 0.34, { p, cuts: ease(clamp((tLoc - 1.6) / 1.4)) > 0.5 ? 3 : 0, night: true, alpha: 1 });
    ctx.restore();
    snow(ctx, W, H, tLoc, 11, 70, 22);
    creditBR(ctx, W, H, "TENT: STYLIZED RECONSTRUCTION \u00B7 NOT A 1959 PHOTOGRAPH");
  }
  header(ctx, W, H, tLoc, "COLD OPEN \u00B7 FEBRUARY 26, 1959", "The tent is still standing");
  band(ctx, W, H, 0.66, 0.26, 0.42, "full");
  const chips = [
    ["CANVAS SLIT OPEN FROM THE INSIDE", S.bone],
    ["BOOTS \u00B7 COATS \u00B7 DIARIES \u2014 STILL INSIDE", S.bone],
    ["THE NINE OWNERS: GONE", "rgba(224,120,96,0.98)"],
  ];
  chips.forEach((c, i) => {
    const p = ease(clamp((tLoc - 1.1 - i * 0.85) / 0.8));
    if (p <= 0) return;
    chip(ctx, c[0], Math.round(W * 0.062), Math.round(H * (0.72 + i * 0.068)), Math.round(H * 0.021), { color: c[1], alpha: p });
  });
}

// ---------- b1b: HOOK — the footprints ----------
export function hook_footprints(ctx, W, H, tLoc, dur, b) {
  snowGround(ctx, W, H, 0.30, 0.04);
  treeline(ctx, W, H, 0.78, 0.9);
  // tent ghost top-right, forest bottom (the descent)
  const p = ease(clamp(tLoc / 1.0));
  inkTent(ctx, W * 0.80, H * 0.20, W * 0.13, H * 0.12, { p, night: true, alpha: 0.85 });
  // two interleaved print trails walking down-left
  const rng = RNG(59);
  const show = clamp((tLoc - 0.7) / 2.6);
  for (let row = 0; row < 2; row++) {
    ctx.save();
    ctx.strokeStyle = row === 0 ? "rgba(232,236,242,0.85)" : "rgba(210,168,94,0.75)";
    ctx.lineWidth = Math.max(2, H * 0.004);
    const N = 16, pts = [];
    for (let i = 0; i <= N; i++) {
      const q = i / N;
      const x = W * (0.86 - 0.66 * q) + (row ? 14 : -14) + Math.sin(q * 5 + row) * W * 0.012;
      const y = H * (0.24 + 0.56 * q) + (row ? 10 : -10);
      pts.push([x, y]);
    }
    const n = Math.floor(N * show);
    for (let i = 0; i < n; i++) {
      const [x, y] = pts[i];
      ctx.beginPath(); ctx.moveTo(x - 7, y - 4); ctx.lineTo(x + 7, y + 4); ctx.stroke();
    }
    ctx.restore();
  }
  snow(ctx, W, H, tLoc, 13, 46, 20);
  header(ctx, W, H, tLoc, "COLD OPEN \u00B7 THE DESCENT", "Footprints, walking \u2014 not running");
  band(ctx, W, H, 0.68, 0.24, 0.44, "left", 0.56);
  chip(ctx, "8\u20139 TRAILS \u00B7 SIDE BY SIDE", Math.round(W * 0.062), Math.round(H * 0.75), Math.round(H * 0.021), { color: S.bone, alpha: ease(clamp((tLoc - 1.2) / 0.8)) });
  chip(ctx, "SOME IN SOCKS \u00B7 SOME IN SINGLE BOOTS", Math.round(W * 0.062), Math.round(H * 0.82), Math.round(H * 0.021), { color: S.bone, alpha: ease(clamp((tLoc - 2.0) / 0.8)) });
  chip(ctx, "THE PRINTS STOP AT THE TREELINE", Math.round(W * 0.062), Math.round(H * 0.89), Math.round(H * 0.021), { color: "rgba(224,120,96,0.98)", alpha: ease(clamp((tLoc - 2.8) / 0.8)) });
  creditBR(ctx, W, H, "RECONSTRUCTION FROM THE 28.II.59 SURVEY PROTOCOL");
}

// ---------- b1b2: HOOK — nothing planned ----------
export function hook_no_plan(ctx, W, H, tLoc, dur, b) {
  snowGround(ctx, W, H, 0.62, 0.30);
  inkTent(ctx, W * 0.5, H * 0.46, W * 0.30, H * 0.24, { p: 1, cuts: 3, night: true, alpha: 0.9 });
  snow(ctx, W, H, tLoc, 17, 60, 24);
  header(ctx, W, H, tLoc, "COLD OPEN \u00B7 WHAT IS MISSING", "Nothing about this exit looks planned");
  const items = ["NO SUPPLIES CARRIED OUT", "NO NOTE", "NO TRAIL PREPARED IN ADVANCE"];
  items.forEach((s, i) => {
    const p = ease(clamp((tLoc - 1.0 - i * 0.8) / 0.75));
    if (p <= 0) return;
    const y = Math.round(H * (0.62 + i * 0.085));
    ctx.save(); ctx.globalAlpha = p;
    font(ctx, Math.round(H * 0.030), S.mono, "bold");
    ctx.fillStyle = "rgba(224,120,96,0.95)";
    ctx.fillText("\u00D7", Math.round(W * 0.30) - Math.round(H * 0.045), y);
    ctx.fillStyle = S.bone;
    ctx.fillText(s, Math.round(W * 0.30), y);
    ctx.restore();
  });
  creditBR(ctx, W, H, "RECONSTRUCTION \u00B7 SEARCHERS' INVENTORY, CASE FILE");
}

// ---------- b1c: HOOK — the cold night ----------
export function hook_cold_night(ctx, W, H, tLoc, dur, b) {
  terrainPlate(ctx, W, H, tLoc, dur, "camp", { seed: "b1c-camp-night", night: 0.52, scrim: 0.22, move: { zoom: [1.08, 1.22], pan: [0.42, 0.55, 0.55, 0.30] } });
  snow(ctx, W, H, tLoc, 23, 110, 34);
  header(ctx, W, H, tLoc, "THE NIGHT OF FEBRUARY 1\u20132", "Far below minus thirty, with wind");
  band(ctx, W, H, 0.70, 0.20, 0.44, "full");
  chip(ctx, "TEMPERATURES PER SEARCHER RECORDS \u00B7 REGION METEO DATA IN FILE", W / 2, Math.round(H * 0.80), Math.round(H * 0.020), { align: "center", color: S.bone, alpha: ease(clamp((tLoc - 1.2) / 0.9)) });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

// ---------- b1d: the question ----------
export function hook_question(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  const p = ease(clamp(tLoc / 0.55));
  dline(ctx, "WHY DID", W / 2, Math.round(H * 0.42), Math.round(H * 0.105), p, { color: S.bone, weight: "bold", align: "center" });
  dline(ctx, "THEY LEAVE?", W / 2, Math.round(H * 0.56), Math.round(H * 0.105), ease(clamp((tLoc - 0.5) / 0.6)), { color: "rgba(224,120,96,0.98)", weight: "bold", align: "center" });
  rule(ctx, W / 2, Math.round(H * 0.64), Math.round(W * 0.36), ease(clamp((tLoc - 1.2) / 1.0)));
  chip(ctx, "SIXTY-THREE YEARS OF ARGUMENT \u00B7 ONE OPEN QUESTION", W / 2, Math.round(H * 0.72), Math.round(H * 0.019), { align: "center", color: S.boneDim, alpha: ease(clamp((tLoc - 1.7) / 0.9)) });
  creditBR(ctx, W, H, "THE UNCLOSED FILE");
}

// ---------- b1e: title card (silent) ----------
export function card_title(ctx, W, H, tLoc, dur, b) {
  terrainPlate(ctx, W, H, tLoc, dur, "camp", { seed: "b1e-title", night: 0.34, scrim: 0.18, move: { zoom: [1.16, 1.05], pan: [0.5, 0.4, 0.5, 0.55] } });
  snow(ctx, W, H, tLoc, 31, 40, 14);
  band(ctx, W, H, 0.30, 0.44, 0.34);
  const p = ease(clamp(tLoc / 1.2));
  crosshair(ctx, W / 2, Math.round(H * 0.34), Math.round(H * 0.075), tLoc, { p });
  dline(ctx, "DYATLOV PASS", W / 2, Math.round(H * 0.50), Math.round(H * 0.088), ease(clamp((tLoc - 0.4) / 1.1)), { color: S.bone, weight: "bold", align: "center" });
  dline(ctx, "What Really Happened to the Nine Hikers?", W / 2, Math.round(H * 0.585), Math.round(H * 0.030), ease(clamp((tLoc - 1.0) / 1.2)), { color: S.amber, align: "center" });
  rule(ctx, W / 2, Math.round(H * 0.635), Math.round(W * 0.40), ease(clamp((tLoc - 1.5) / 1.1)));
  chip(ctx, "THE UNCLOSED FILE \u00B7 AN EVIDENCE-FIRST DOCUMENTARY", W / 2, Math.round(H * 0.70), Math.round(H * 0.017), { align: "center", color: S.boneDim, alpha: ease(clamp((tLoc - 1.9) / 1.0)) });
  creditBR(ctx, W, H, "RECONSTRUCTIONS LABELLED \u00B7 SOURCES IN DESCRIPTION");
}

// ---------- b2a: context — Sverdlovsk / the plan ----------
export function ctx_start(ctx, W, H, tLoc, dur, b) {
  terrainPlate(ctx, W, H, tLoc, dur, "route", { seed: "b2a-route", scrim: 0.24, move: { zoom: [1.05, 1.18], pan: [0.5, 0.78, 0.5, 0.30] } });
  header(ctx, W, H, tLoc, "THE EXPEDITION \u00B7 JANUARY 1959", "Category III \u2014 the hardest regular grade");
  band(ctx, W, H, 0.66, 0.26, 0.44, "left", 0.60);
  const rows = ["SVERDLOVSK \u00B7 URAL POLYTECHNIC INSTITUTE", "ROUTE COMMISSION APPROVAL \u00B7 8.I.59", "16 DAYS ON SKIS \u00B7 NORTH TO OTORTEN", "TEN SET OUT"];
  rows.forEach((s, i) => {
    const p = ease(clamp((tLoc - 0.9 - i * 0.55) / 0.7));
    if (p <= 0) return;
    chip(ctx, s, Math.round(W * 0.062), Math.round(H * (0.72 + i * 0.058)), Math.round(H * 0.020), { color: i === 3 ? S.amber : S.bone, alpha: p });
  });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

// ---------- b2b: the ten (roster; photo slot) ----------
export function ctx_group(ctx, W, H, tLoc, dur, b) {
  const img = photo("group_1959.jpg");
  if (img) {
    plate(ctx, W, H, tLoc, dur, "group_1959.jpg", { scrim: 0.24, topScrim: 0.22 });
    creditBR(ctx, W, H, "PHOTOGRAPH: THE GROUP, 1959 (CREDITED)");
  } else {
    base(ctx, W, H, tLoc);
    creditBR(ctx, W, H, "ROSTER FROM THE ROUTE COMMISSION PROTOCOL");
  }
  header(ctx, W, H, tLoc, "THE GROUP", "Friends first, expedition second");
  const left = [
    "IGOR DYATLOV \u00B7 23 \u00B7 LEADER",
    "ZINAIDA KOLMOGOROVA \u00B7 20",
    "RUSTEM SLOBODIN \u00B7 23",
    "YURI DOROSHENKO \u00B7 21",
    "YURI KRIVONISHENKO \u00B7 23",
  ];
  const right = [
    "NIKOLAI THIBEAUX-BRIGNOLLE \u00B7 24",
    "LYUDMILA DUBININA \u00B7 20",
    "ALEXANDER KOLEVATOV \u00B7 25",
    "SEMYON ZOLOTARYOV \u00B7 38",
    "YURI YUDIN \u00B7 21",
  ];
  band(ctx, W, H, 0.38, 0.52, img ? 0.55 : 0.0, img ? "full" : "full");
  const draw = (arr, x0) => arr.forEach((s, i) => {
    const p = ease(clamp((tLoc - 1.0 - i * 0.32) / 0.6));
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p;
    font(ctx, Math.round(H * 0.024), S.mono, "bold");
    ctx.fillStyle = i === 0 && x0 < W / 2 ? S.amber : S.bone;
    ctx.fillText(s, x0, Math.round(H * (0.47 + i * 0.062)));
    ctx.restore();
  });
  if (img) {
    band(ctx, W, H, 0.40, 0.50, 0.62, "full");
    draw(left, Math.round(W * 0.062)); draw(right, Math.round(W * 0.53));
  } else {
    ctx.save();
    paper(ctx, Math.round(W * 0.14), Math.round(H * 0.38), Math.round(W * 0.72), Math.round(H * 0.44), { alpha: 0.96 });
    ctx.restore();
    const ink = (arr, x0) => arr.forEach((s, i) => {
      const p = ease(clamp((tLoc - 1.0 - i * 0.32) / 0.6));
      if (p <= 0) return;
      font(ctx, Math.round(H * 0.026), S.mono, "bold");
      ctx.fillStyle = "#23201a";
      ctx.fillText(s, x0, Math.round(H * (0.47 + i * 0.062)));
    });
    ink(left, Math.round(W * 0.19)); ink(right, Math.round(W * 0.53));
    chip(ctx, "AGES AS RECORDED IN THE CASE FILE", Math.round(W * 0.19), Math.round(H * 0.865), Math.round(H * 0.016), { color: "#4a463e", alpha: 0.9, fill: "rgba(210,200,170,0.6)", border: "rgba(120,110,88,0.5)" });
  }
}

// ---------- b2c: the route (anchor map) ----------
const ROUTE_WIN = [61.96, 60.80, 59.14, 60.06]; // latN latS lonW lonE
export function ctx_route_map(ctx, W, H, tLoc, dur, b) {
  terrainPlate(ctx, W, H, tLoc, dur, "route", { seed: "b2c-static", scrim: 0.20, move: { zoom: [1.02, 1.02], pan: [0.5, 0.5, 0.5, 0.5] } });
  band(ctx, W, H, 0.09, 0.20, 0.42, "full");
  // full-bleed map: project directly with the route plate fractions
  const pl = TERR.route;
  const P = (lat, lon) => geoInBox([pl.lat1, pl.lat0, pl.lon0, pl.lon1], 0, 0, W, H, lat, lon);
  const wp = [[60.8167, 59.6333], [61.20, 59.58], [61.45, 59.52], [61.60, 59.62], [61.66, 59.60], [61.72, 59.47], [61.760, 59.480], [61.806, 59.527]];
  const p = ease(clamp((tLoc - 0.6) / 5.4));
  poly(ctx, [pl.lat1, pl.lat0, pl.lon0, pl.lon1], 0, 0, W, H, wp, p, { width: Math.max(3, H * 0.004) });
  // labels (explicit offsets keep edge points on-frame)
  const [vx, vy] = P(60.8167, 59.6333);
  if (p > 0.02) mlabel(ctx, "VIZHAY \u00B7 LAST SETTLEMENT", vx + W * 0.05, Math.max(H * 0.86, vy - H * 0.03), Math.round(H * 0.017), { align: "right" });
  const [sxx, sxy] = P(61.20, 59.58);
  if (p > 0.2) mlabel(ctx, "LOZVA RIVER", sxx, sxy, Math.round(H * 0.017), { align: "right", dim: true });
  const [lx, ly] = P(61.66, 59.60);
  if (p > 0.55) mlabel(ctx, "LABAZ (CACHE)", lx, ly, Math.round(H * 0.017), { align: "left", dim: true });
  const [ox, oy] = P(61.806, 59.527);
  if (p > 0.9) mlabel(ctx, "OTORTEN", ox, oy, Math.round(H * 0.017), { align: "left" });
  header(ctx, W, H, tLoc, "THE ROUTE \u00B7 NORTH", "Rail, truck, sledge, ski");
  chip(ctx, "JAN 28 \u00B7 YUDIN TURNS BACK, ILL \u2014 THE LAST PICTURE OF ALL TEN", Math.round(W * 0.062), Math.round(H * 0.855), Math.round(H * 0.019), { color: "rgba(224,120,96,0.98)", alpha: ease(clamp((tLoc - 3.4) / 0.9)) });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

// ---------- b2d: the labaz ----------
export function ctx_labaz(ctx, W, H, tLoc, dur, b) {
  const win = [61.78, 61.52, 59.34, 59.90];
  const mb = mapBox(ctx, TERR.route, 0, 0, W, H, win, {});
  const [lx, ly] = geoInBox(win, 0, 0, W, H, 61.66, 59.60);
  const p = ease(clamp((tLoc - 0.8) / 1.0));
  if (p > 0) { mark(ctx, lx, ly, { size: 9 }); mlabel(ctx, "LABAZ \u00B7 SUPPLY CACHE \u00B7 31 JAN", lx, ly, Math.round(H * 0.019), { align: "right" }); }
  snow(ctx, W, H, tLoc, 41, 70, 26);
  header(ctx, W, H, tLoc, "JANUARY 31 \u00B7 THE AUSPIYA VALLEY", "A cache buried for the return");
  band(ctx, W, H, 0.70, 0.20, 0.44, "full");
  chip(ctx, "DIARIES: HARD FROST \u00B7 WIND \u2014 ENTRY AFTER ENTRY", W / 2, Math.round(H * 0.80), Math.round(H * 0.020), { align: "center", color: S.bone, alpha: ease(clamp((tLoc - 1.6) / 0.9)) });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

// ---------- b2e: the climb & the deviation ----------
export function ctx_climb(ctx, W, H, tLoc, dur, b) {
  const win = [61.83, 61.66, 59.30, 59.66];
  mapBox(ctx, TERR.camp, 0, 0, W, H, win, {});
  const P = (lat, lon) => geoInBox(win, 0, 0, W, H, lat, lon);
  const pp = ease(clamp((tLoc - 0.8) / 2.2));
  // planned: climb -> pass -> toward Otorten (dashed bone)
  poly(ctx, win, 0, 0, W, H, [[61.72, 59.47], [61.760, 59.480], [61.806, 59.527]], pp, { color: "rgba(234,227,212,0.75)", width: Math.max(2.5, H * 0.003), dash: [12, 10], glow: false });
  // actual: climb -> tent on the shoulder (solid crimson)
  poly(ctx, win, 0, 0, W, H, [[61.72, 59.47], [61.7533, 59.4483]], clamp(pp * 1.4), { color: "rgba(208,90,60,0.95)", width: Math.max(3, H * 0.0042) });
  const [tx, ty] = P(61.7533, 59.4483);
  if (pp > 0.7) { mark(ctx, tx, ty, { size: 9 }); }
  const [px2, py2] = P(61.760, 59.480);
  mlabel(ctx, "PASS 1,079 \u00B7 PLANNED", px2, py2, Math.round(H * 0.017), { align: "left", dim: true });
  mlabel(ctx, "CAMP \u00B7 OPEN SLOPE", tx, ty, Math.round(H * 0.019), { align: "left" });
  header(ctx, W, H, tLoc, "FEBRUARY 1 \u00B7 THE DEVIATION", "About a kilometre west of the plan");
  chip(ctx, "TRACK RECONSTRUCTION \u00B7 POSITIONS APPROXIMATE", Math.round(W * 0.062), Math.round(H * 0.885), Math.round(H * 0.016), { color: S.boneFaint, alpha: ease(clamp((tLoc - 2.6) / 0.8)) });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

// ---------- b2f: the camp decision ----------
export function ctx_camp(ctx, W, H, tLoc, dur, b) {
  const win = [61.785, 61.715, 59.38, 59.56];
  mapBox(ctx, TERR.camp, 0, 0, W, H, win, {});
  const P = (lat, lon) => geoInBox(win, 0, 0, W, H, lat, lon);
  const [tx, ty] = P(61.7533, 59.4483);
  const [cx2, cy2] = P(61.7517, 59.4233);
  const p = ease(clamp((tLoc - 0.7) / 1.0));
  if (p > 0) { mark(ctx, tx, ty, { size: 9 }); mlabel(ctx, "TENT \u00B7 ~1,050 m", tx, ty, Math.round(H * 0.019), { align: "left" }); }
  if (p > 0.5) { mark(ctx, cx2, cy2, { color: "rgba(234,227,212,0.8)", size: 7 }); mlabel(ctx, "FOREST EDGE \u00B7 1.5 KM", cx2, cy2 + Math.round(H * 0.045), Math.round(H * 0.017), { align: "right", dim: true }); }
  chip(ctx, "SLOPE \u2248 23\u00B0 \u00B7 WIND-SCOURCED \u00B7 NO SHELTER", Math.round(W * 0.062), Math.round(H * 0.865), Math.round(H * 0.020), { color: S.amber, alpha: ease(clamp((tLoc - 1.8) / 0.9)) });
  header(ctx, W, H, tLoc, "THE CAMP \u00B7 LATE AFTERNOON", "Above the forest, in the open");
  chip(ctx, "THE LAST PHOTOGRAPH: THE TENT GOING UP", Math.round(W * 0.062), Math.round(H * 0.925), Math.round(H * 0.016), { color: S.boneFaint, alpha: ease(clamp((tLoc - 2.6) / 0.8)) });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

// ---------- b2g: silence ----------
export function ctx_silence(ctx, W, H, tLoc, dur, b) {
  terrainPlate(ctx, W, H, tLoc, dur, "camp", { seed: "b2g-night", night: 0.62, scrim: 0.16, move: { zoom: [1.05, 1.14], pan: [0.45, 0.6, 0.58, 0.38] } });
  snow(ctx, W, H, tLoc, 47, 80, 30);
  const items = ["THE DIARIES STOP.", "THE PHOTOGRAPHS STOP.", "THE NIGHT HAS NO WITNESS WHO SURVIVED IT."];
  items.forEach((s, i) => {
    const p = ease(clamp((tLoc - 0.9 - i * 1.5) / 0.9));
    if (p <= 0) return;
    dline(ctx, s, W / 2, Math.round(H * (0.44 + i * 0.09)), Math.round(i === 2 ? H * 0.036 : H * 0.050), p, { color: i === 2 ? "rgba(224,120,96,0.98)" : S.bone, weight: "bold", align: "center" });
  });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}
