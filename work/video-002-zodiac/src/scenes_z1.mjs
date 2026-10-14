// scenes_z1.mjs — composites + cold open + attacks (video-002)
// Scene fns: (ctx, W, H, tLoc, dur, b) — CONTENT only; renderFrame adds chrome.
import {
  PAL as S, photoPlate, photoCard, kicker, display as _display,
  rule, paper, stamp2, glow,
} from "./film_look.mjs";
import { clamp, lerp, ease, easeOut, text, font, textW, RNG } from "./engine.mjs";
import { bayAreaMap } from "./map_z.mjs";

let FW = 1920;
function display(ctx, str, cx, y, size, p, opts = {}) {
  return _display(ctx, str, cx, y, size, p, { maxW: FW * 0.92, ...opts });
}

// ---------- shared composites ----------
export function header(ctx, W, H, tLoc, label, title) {
  const p = ease(clamp(tLoc / 1.1));
  const rise = (1 - easeOut(p)) * 26;
  ctx.save(); ctx.globalAlpha *= p;
  kicker(ctx, label, Math.round(W * 0.062), Math.round(H * 0.155 + rise), Math.round(H * 0.021));
  font(ctx, Math.round(H * 0.052), S.serif, "bold");
  ctx.fillStyle = S.bone;
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14;
  ctx.fillText(title, Math.round(W * 0.062), Math.round(H * 0.155 + H * 0.058 + rise));
  ctx.restore();
}
export function creditBR(ctx, W, H, str) {
  // v4 fix: measured width must include the 1.5px letter-spacing actually rendered,
  // otherwise long credits overflow the right edge (seen at full size in b0a/b1a).
  const size = Math.round(H * 0.014);
  const w = textW(ctx, str, size, S.mono) + 1.5 * (str.length - 1);
  text(ctx, str, W - Math.round(W * 0.03) - w, Math.round(H * 0.055), size, { family: S.mono, color: S.boneFaint, alpha: 0.85, spacing: 1.5 });
}
export function chip(ctx, str, x, y, size, opts = {}) {
  const { color = S.boneDim, border = "rgba(234,227,212,0.35)", fill = "rgba(12,15,20,0.55)", align = "left", alpha = 1 } = opts;
  font(ctx, size, S.mono, "bold");
  const padX = size * 0.8, padY = size * 0.55;
  const w = ctx.measureText(str).width + padX * 2, h = size + padY * 2;
  let xx = x;
  if (align === "center") xx = x - w / 2;
  if (align === "right") xx = x - w;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.fillStyle = fill; ctx.fillRect(xx, y - padY, w, h);
  ctx.strokeStyle = border; ctx.lineWidth = 1.4; ctx.strokeRect(xx + 0.5, y - padY + 0.5, w - 1, h - 1);
  ctx.fillStyle = color; ctx.textAlign = "left";
  ctx.fillText(str, xx + padX, y + size * 0.36);
  ctx.restore();
  return w;
}
export function stamp(ctx, label, x, y, size, color = S.red, rot = -0.08, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  stamp2(ctx, label, 0, 0, size, { color, alpha });
  ctx.restore();
}
export function quoteBar(ctx, W, H, quote, who, p, yFrac = 0.86) {
  const y = Math.round(H * yFrac);
  ctx.save();
  const a = clamp(p * 1.6);
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(9,11,15,0.72)";
  ctx.fillRect(0, y - Math.round(H * 0.045), W, Math.round(H * 0.082));
  ctx.fillStyle = S.amber; ctx.fillRect(0, y - Math.round(H * 0.045), Math.round(W * 0.006 * clamp(p * 2)), Math.round(H * 0.082));
  const size = Math.round(H * 0.031);
  font(ctx, size, S.serif, "bold");
  ctx.fillStyle = S.bone;
  const q = quote.length > 128 ? quote.slice(0, 128) : quote;
  ctx.fillText(`\u201C${q}\u201D`, Math.round(W * 0.03), y + size * 0.32);
  font(ctx, Math.round(H * 0.017), S.mono, "bold");
  ctx.fillStyle = S.boneDim;
  ctx.fillText(who, Math.round(W * 0.032), y + Math.round(H * 0.082) - Math.round(H * 0.008));
  ctx.restore();
}
// cipher-style glyph grid; deterministic per seed
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?#%&@◆●▲■×".split("");
export function cipherGrid(ctx, x, y, w, h, cols, rows, seed, opts = {}) {
  const { p = 1, accent = [], accentColor = "rgba(192,57,43,0.92)", solved = null, solvedRows = 0, bg = null } = opts;
  const cell = Math.min(w / cols, h / rows);
  const gw = cell * cols, gh = cell * rows;
  const ox = x + (w - gw) / 2, oy = y + (h - gh) / 2;
  const rng = RNG(seed);
  // pre-generate row-major glyph indices (deterministic)
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(ox - 4, oy - 4, cell * cols + 8, cell * rows + 8); }
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push(Math.floor(rng() * GLYPHS.length));
  const total = cells.length;
  const shown = Math.floor(total * clamp(p * 1.08));
  font(ctx, Math.round(cell * 0.62), S.mono, "");
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (i >= shown) continue;
      const gx = ox + c * cell + cell / 2, gy = oy + r * cell + cell / 2;
      const solvedRow = solved && r < solvedRows;
      const isAcc = accent.includes(i);
      ctx.fillStyle = solvedRow ? "rgba(217,164,65,0.95)" : isAcc ? accentColor : "rgba(216,222,232,0.78)";
      const g = solvedRow && solved ? solved[i] || GLYPHS[cells[i]] : GLYPHS[cells[i]];
      ctx.fillText(g, gx, gy);
    }
  }
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.strokeStyle = "rgba(234,227,212,0.22)"; ctx.lineWidth = 1.2;
  ctx.strokeRect(ox - 6, oy - 6, gw + 12, gh + 12);
  return { ox, oy, gw, gh, cell };
}
export function crosshair(ctx, x, y, r, t, opts = {}) {
  const { color = "rgba(208,90,60,0.95)", p = 1 } = opts;
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, r * 0.055);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.42, 0, 7); ctx.stroke();
  ctx.lineWidth = Math.max(1.6, r * 0.05);
  const rr = r * 0.9;
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42);
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    ctx.stroke();
  }
  ctx.restore();
}
export function listRow(ctx, W, cx, y, size, mark, markColor, str, p) {
  ctx.save(); ctx.globalAlpha = clamp(p * 1.4);
  font(ctx, size, S.mono, "bold");
  ctx.fillStyle = markColor;
  ctx.fillText(mark, cx - Math.round(W * 0.325), y);
  font(ctx, size, S.body, "");
  ctx.fillStyle = S.bone;
  ctx.fillText(str, cx - Math.round(W * 0.325) + size * 2.1, y);
  ctx.restore();
}

// ---------- title / cold open ----------
export function title_card(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  const p = ease(clamp(tLoc / 1.4));
  crosshair(ctx, W / 2, Math.round(H * 0.30), Math.round(H * 0.085), tLoc, { p });
  display(ctx, "THE ZODIAC KILLER", W / 2, Math.round(H * 0.47), Math.round(H * 0.078), ease(clamp((tLoc - 0.5) / 1.3)), { color: S.bone, weight: "bold" });
  display(ctx, "The Ciphers, the Letters, and the Killer Nobody Could Identify", W / 2, Math.round(H * 0.565), Math.round(H * 0.030), ease(clamp((tLoc - 1.2) / 1.3)), { color: S.amber });
  rule(ctx, W / 2, Math.round(H * 0.62), Math.round(W * 0.42), ease(clamp((tLoc - 1.6) / 1.2)));
  chip(ctx, "AN EVIDENCE-FIRST INVESTIGATIVE DOCUMENTARY", W / 2, Math.round(H * 0.685), Math.round(H * 0.017), { align: "center", color: S.boneDim, alpha: ease(clamp((tLoc - 2.0) / 1.0)) });
  creditBR(ctx, W, H, "RECONSTRUCTIONS LABELLED \u00B7 SOURCES IN DESCRIPTION");
}
export function base(ctx, W, H, t) {
  // v3 ghost mode: when a photo backdrop was injected underneath (BACKS map in
  // scenes_z3), the scene's own background becomes translucent so the graded
  // photo texture reads through instead of being covered (issue #8).
  const ghost = globalThis.__Z_GHOST__ || 0;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, S.bgTop); g.addColorStop(0.55, S.bgMid); g.addColorStop(1, S.bgBot);
  ctx.save();
  if (ghost > 0) ctx.globalAlpha = 1 - ghost * 0.55;   // 0.45..1.0 opacity over photo
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const rng = RNG(7);
  for (let i = 0; i < 40; i++) {
    const x = rng() * W, y = rng() * H, r = 30 + rng() * 130;
    ctx.fillStyle = S.lift;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
}

export function cold_open_paper(ctx, W, H, tLoc, dur, b) {
  photoPlate(ctx, W, H, tLoc, dur, "news_press.jpg", { dim: 0.62, kb: 0.09 });
  header(ctx, W, H, tLoc, "COLD OPEN \u00B7 JULY 31, 1969", "Three newspapers open their mail");
  const y = Math.round(H * 0.42);
  const papers = ["SAN FRANCISCO CHRONICLE", "SAN FRANCISCO EXAMINER", "VALLEJO TIMES-HERALD"];
  papers.forEach((nm, i) => {
    const p = ease(clamp((tLoc - 1.6 - i * 0.5) / 0.9));
    if (p <= 0) return;
    const w = Math.round(W * 0.26), h = Math.round(H * 0.30);
    const x = Math.round(W * 0.085 + i * (w + W * 0.032));
    const yy = y + Math.round((1 - p) * 40);
    paper(ctx, x, yy, w, h, { alpha: p, rot: (i - 1) * 0.015 });
    chip(ctx, nm, x + Math.round(w * 0.5), yy + Math.round(h * 0.16), Math.round(H * 0.0155), { align: "center", color: S.amber, border: "rgba(217,164,65,0.5)" });
    cipherGrid(ctx, x + Math.round(w * 0.12), yy + Math.round(h * 0.26), Math.round(w * 0.76), Math.round(h * 0.52), 9, 7, 31 + i, { p: p, bg: "rgba(15,18,26,0.92)" });
    text(ctx, `PART ${i + 1} OF 3`, x + Math.round(w * 0.5), yy + h - Math.round(H * 0.022), Math.round(H * 0.0155), { family: S.mono, color: S.ink, align: "center", alpha: p });
  });
  chip(ctx, "408 SYMBOLS \u00B7 THREE PARTS \u00B7 PUBLICATION DEMANDED", W / 2, Math.round(H * 0.82), Math.round(H * 0.017), { align: "center", color: S.bone, alpha: ease(clamp((tLoc - 3.4) / 1.0)) });
  creditBR(ctx, W, H, "NEWSPAPER FORMAT: STYLIZED RECONSTRUCTION \u2014 NOT AN ACTUAL FRONT PAGE");
}

export function cold_open_years(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  cipherGrid(ctx, Math.round(W * 0.09), Math.round(H * 0.30), Math.round(W * 0.44), Math.round(H * 0.44), 17, 9, 77, { p: ease(clamp(tLoc / 2.2)) });
  const p2 = ease(clamp((tLoc - 1.4) / 1.4));
  font(ctx, Math.round(H * 0.135), S.serif, "bold");
  ctx.fillStyle = S.bone; ctx.textAlign = "left";
  ctx.fillText("51 YEARS", Math.round(W * 0.545), Math.round(H * 0.47 + (1 - p2) * 30));
  display(ctx, "for the second cipher to speak", Math.round(W * 0.585), Math.round(H * 0.555), Math.round(H * 0.030), ease(clamp((tLoc - 2.2) / 1.2)), { color: S.amber });
  chip(ctx, "1969-08-04  \u2192  2020-12-05", Math.round(W * 0.585), Math.round(H * 0.635), Math.round(H * 0.018), { color: S.boneDim, alpha: ease(clamp((tLoc - 2.8) / 1.0)) });
  header(ctx, W, H, tLoc, "COLD OPEN", "Two ciphers, one unnamed sender");
  creditBR(ctx, W, H, "CIPHER GRID: STYLIZED RECONSTRUCTION");
}

export function cold_open_rules(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE METHOD", "What the record does and does not say");
  const rows = [
    ["EVIDENCE", "S.bone", "attacks \u00B7 letters \u00B7 two solved ciphers \u00B7 prints \u00B7 DNA profile"],
    ["THEORY", S.amber, "every named suspect \u2014 labelled, never asserted"],
    ["DISPUTED", S.red, "claims the record does not support"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.3 - i * 0.65) / 0.9));
    if (p <= 0) return;
    const y = Math.round(H * (0.40 + i * 0.115));
    ctx.save(); ctx.globalAlpha = p;
    paper(ctx, Math.round(W * 0.14), y - Math.round(H * 0.045), Math.round(W * 0.72), Math.round(H * 0.09), { alpha: p });
    chip(ctx, r[0], Math.round(W * 0.17), y + Math.round(H * 0.008), Math.round(H * 0.020), { color: r[1], border: r[1].replace(")", ",0.55)").replace("#b0402f", "#b0402f") });
    text(ctx, r[2], Math.round(W * 0.285), y + Math.round(H * 0.012), Math.round(H * 0.026), { family: S.body, color: S.bone });
    ctx.restore();
  });
  chip(ctx, "THE 408 AND THE 340 ARE SOLVED \u00B7 THE Z13 AND Z32 ARE NOT", W / 2, Math.round(H * 0.79), Math.round(H * 0.018), { align: "center", color: S.amber, alpha: ease(clamp((tLoc - 3.6) / 1.0)) });
}

// ---------- attacks (photo + map + name card factory) ----------
function attackScene(photoName, cityKey, dateChip, deaths, survivors) {
  return function (ctx, W, H, tLoc, dur, b) {
    photoPlate(ctx, W, H, tLoc, dur, photoName, { dim: 0.55, kb: 0.075 });
    header(ctx, W, H, tLoc, "THE ATTACKS", dateChip);
    // map card right
    const mw = Math.round(W * 0.30), mh = Math.round(mw * 0.78);
    const mx = W - mw - Math.round(W * 0.04), my = Math.round(H * 0.30);
    const mp = ease(clamp((tLoc - 0.9) / 1.4));
    paper(ctx, mx - 10, my - 10, mw + 20, mh + 20, { alpha: 0.92 * mp });
    bayAreaMap(ctx, mx, my, mw, mh, tLoc, { p: mp, pins: ["sf", "benicia", "vallejo", "napa", "berryessa"], hit: cityKey, labels: [cityKey, "sf", "vallejo"] });
    // names card bottom-left
    const p = ease(clamp((tLoc - 1.8) / 1.2));
    const y = Math.round(H * 0.70);
    if (p > 0) {
      ctx.save(); ctx.globalAlpha = p;
      paper(ctx, Math.round(W * 0.062), y - Math.round(H * 0.062), Math.round(W * 0.46), Math.round(H * 0.155), { alpha: p });
      let yy = y - Math.round(H * 0.018);
      deaths.forEach((nm) => {
        text(ctx, `\u2020  ${nm}`, Math.round(W * 0.09), yy, Math.round(H * 0.030), { family: S.body, color: S.ink, weight: "bold" });
        yy += Math.round(H * 0.048);
      });
      survivors.forEach((nm) => {
        text(ctx, `\u2014  ${nm}  (survived)`, Math.round(W * 0.09), yy, Math.round(H * 0.026), { family: S.body, color: S.ink, alpha: 0.75 });
        yy += Math.round(H * 0.042);
      });
      ctx.restore();
    }
    stamp(ctx, "CONFIRMED", W - Math.round(W * 0.085), Math.round(H * 0.86), Math.round(H * 0.032), "rgba(217,164,65,0.9)", -0.06, ease(clamp((tLoc - 2.6) / 0.8)));
    creditBR(ctx, W, H, `LOCATION CONTEXT \u00B7 ${photoName.replace(".jpg", "").replace(/_/g, " ").toUpperCase()} (CREDITED)`);
  };
}
export const attack_benicia = attackScene("benicia_street.jpg", "benicia", "1968-12-20 \u00B7 LAKE HERMAN ROAD, BENICIA", ["DAVID FARADAY, 17", "BETTY LOU JENSEN, 17"], []);
export const attack_vallejo = attackScene("vallejo_waterfront.jpg", "vallejo", "1969-07-04 \u00B7 BLUE ROCK SPRINGS, VALLEJO", ["DARLENE FERRIN, 22"], ["MICHAEL MAGEAU, 19"]);
export const attack_berryessa = attackScene("berryessa_aerial.jpg", "berryessa", "1969-09-27 \u00B7 LAKE BERRYESSA", ["CECELIA SHEPARD, 22 \u2020 SEPT 29"], ["BRYAN HARTNELL, 20"]);
export const attack_presidio = attackScene("presidio_historic.jpg", "presidio", "1969-10-11 \u00B7 PRESIDIO HEIGHTS, SAN FRANCISCO", ["PAUL STINE, 29"], []);

export function fear_grid(ctx, W, H, tLoc, dur, b) {
  photoPlate(ctx, W, H, tLoc, dur, "sf_street_1960s.jpg", { dim: 0.6, kb: 0.085 });
  header(ctx, W, H, tLoc, "THE ATTACKS \u00B7 THE FEAR", "Four attacks. Five dead. One region afraid.");
  bayAreaMap(ctx, Math.round(W * 0.062), Math.round(H * 0.33), Math.round(W * 0.40), Math.round(W * 0.31), tLoc, { p: ease(clamp((tLoc - 0.6) / 1.6)), pins: ["sf", "benicia", "vallejo", "napa", "berryessa"] });
  const items = ["POLICE ESCORTS ON SCHOOL BUSES", "GUN SALES UP ACROSS THE BAY AREA", "FOUR JURISDICTIONS \u00B7 ONE MANHUNT", "BENICIA \u00B7 VALLEJO \u00B7 NAPA \u00B7 SAN FRANCISCO"];
  items.forEach((s, i) => {
    const p = ease(clamp((tLoc - 1.6 - i * 0.55) / 0.8));
    if (p <= 0) return;
    chip(ctx, s, Math.round(W * 0.53), Math.round(H * (0.375 + i * 0.105)), Math.round(H * 0.019), { color: i === 3 ? S.amber : S.bone, alpha: p });
  });
  creditBR(ctx, W, H, "CONTEXT PHOTOGRAPH \u00B7 PERIOD STREET SCENE (CREDITED)");
}
