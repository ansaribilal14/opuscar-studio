// scenes_z1v4.mjs — v4: rebuilt hook + title + attacks (directive §3/§2, RC4/RC1/RC3)
// Scene fns: (ctx, W, H, tLoc, dur, b) — CONTENT only; dispatcher adds chrome.
// v4 rules: photos get the full frame with capped scrims; names are lower-thirds,
// not cards; cipher grids are ink-on-paper reconstructions (legible, period-true).
import {
  PAL as S, kicker, display as _display, rule, paper, stamp2,
} from "./film_look.mjs";
import { clamp, lerp, ease, easeOut, text, font, textW, RNG } from "./engine.mjs";
import { plate, photoCut, band, lowerThird, inkGrid } from "./comp_modes.mjs";
import { bayAreaMap } from "./map_z.mjs";

let FW = 1920;
function display(ctx, str, cx, y, size, p, opts = {}) {
  return _display(ctx, str, cx, y, size, p, { maxW: FW * 0.92, ...opts });
}
// re-export shared support layer so z2/z3 v4 files import from here (same API)
export { base, header, creditBR, chip, quoteBar, cipherGrid, crosshair, listRow, stamp } from "./scenes_z1.mjs";
import { header, creditBR, chip, quoteBar, cipherGrid, crosshair, base, stamp } from "./scenes_z1.mjs";

// ---------- HOOK b0a: the July 31 letters, evidence-first ----------
// Opens on the documented fact: one large envelope reconstruction with a LEGIBLE
// ink 408 grid as the opening image; demand as display type; papers as a strip.
export function cold_open_paper(ctx, W, H, tLoc, dur, b) {
  plate(ctx, W, H, tLoc, dur, "press_room.jpg", { scrim: 0.24, topScrim: 0.22 });
  header(ctx, W, H, tLoc, "COLD OPEN \u00B7 JULY 31, 1969", "Three newspapers open their mail");
  // the envelope reconstruction (large, left-of-center)
  const p = ease(clamp(tLoc / 1.1));
  const ew = Math.round(W * 0.40), eh = Math.round(H * 0.56);
  const ex = Math.round(W * 0.075), ey = Math.round(H * 0.285 + (1 - p) * 36);
  ctx.save(); ctx.globalAlpha = p;
  paper(ctx, ex, ey, ew, eh, { alpha: p, rot: -0.012 });
  chip(ctx, "SAN FRANCISCO CHRONICLE \u00B7 PART 1 OF 3", ex + Math.round(ew * 0.5), ey + Math.round(eh * 0.115), Math.round(H * 0.017), { align: "center", color: S.amber, border: "rgba(217,164,65,0.55)" });
  // the 408 window — ink on paper, LEGIBLE (RC6)
  inkGrid(ctx, ex + Math.round(ew * 0.10), ey + Math.round(eh * 0.20), Math.round(ew * 0.80), Math.round(eh * 0.56), 13, 8, 408, { p: ease(clamp((tLoc - 0.8) / 2.2)) });
  text(ctx, "408 SYMBOLS IN ALL \u00B7 ONE CIPHER IN THREE PARTS", ex + Math.round(ew * 0.5), ey + Math.round(eh * 0.90), Math.round(H * 0.0175), { family: S.mono, color: S.ink, align: "center", alpha: p });
  ctx.restore();
  // the demand — display type, right side
  const pd = ease(clamp((tLoc - 1.4) / 1.3));
  display(ctx, "PRINT THIS,", Math.round(W * 0.735), Math.round(H * 0.44), Math.round(H * 0.062), pd, { color: S.bone, weight: "bold", align: "center" });
  display(ctx, "OR MORE PEOPLE DIE.", Math.round(W * 0.735), Math.round(H * 0.53), Math.round(H * 0.062), ease(clamp((tLoc - 2.1) / 1.3)), { color: "rgba(224,150,90,0.98)", weight: "bold", align: "center" });
  // the three-paper strip — on a contrast band (full-size review fix)
  band(ctx, W, H, 0.60, 0.24, 0.40, "right", 0.52);
  const papers = ["SAN FRANCISCO CHRONICLE", "SAN FRANCISCO EXAMINER", "VALLEJO TIMES-HERALD"];
  papers.forEach((nm, i) => {
    const pp = ease(clamp((tLoc - 3.0 - i * 0.45) / 0.7));
    if (pp <= 0) return;
    ctx.save(); ctx.globalAlpha = pp;
    text(ctx, `\u2713  ${nm}`, Math.round(W * 0.545), Math.round(H * (0.645 + i * 0.058)), Math.round(H * 0.021), { family: S.mono, color: S.bone, alpha: pp });
    ctx.restore();
  });
  creditBR(ctx, W, H, "ENVELOPE: STYLIZED RECONSTRUCTION \u00B7 NEWSROOM PHOTO (CREDITED)");
}

// ---------- HOOK b0b: 51 YEARS — the first hard cut ----------
export function cold_open_years(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  // right: the 340 grid, light glyphs on dark
  cipherGrid(ctx, Math.round(W * 0.565), Math.round(H * 0.24), Math.round(W * 0.36), Math.round(H * 0.56), 17, 20, 340, { p: ease(clamp((tLoc - 0.6) / 2.6)) });
  text(ctx, "THE 340 \u00B7 MAILED 1969-11-08", Math.round(W * 0.745), Math.round(H * 0.855), Math.round(H * 0.0165), { family: S.mono, color: S.boneFaint, align: "center" });
  // left: the number
  const p2 = ease(clamp(tLoc / 0.9));
  font(ctx, Math.round(H * 0.205), S.serif, "bold");
  ctx.fillStyle = S.bone; ctx.textAlign = "left";
  ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 22;
  ctx.fillText("51", Math.round(W * 0.085), Math.round(H * 0.44 + (1 - p2) * 34));
  ctx.fillText("YEARS", Math.round(W * 0.085), Math.round(H * 0.635 + (1 - p2) * 34));
  ctx.shadowBlur = 0;
  display(ctx, "for the second cipher to speak", Math.round(W * 0.092), Math.round(H * 0.715), Math.round(H * 0.034), ease(clamp((tLoc - 1.2) / 1.2)), { color: S.amber, align: "left" });
  chip(ctx, "THE 408: BROKEN IN DAYS  \u00B7  1969-08-04 \u2192 2020-12-05", Math.round(W * 0.092), Math.round(H * 0.795), Math.round(H * 0.019), { color: S.boneDim, alpha: ease(clamp((tLoc - 1.9) / 1.0)) });
  creditBR(ctx, W, H, "GRID: STYLIZED RECONSTRUCTION");
}

// ---------- b0c: method — demoted, restrained ----------
export function cold_open_rules(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE METHOD", "What the record does and does not say");
  const rows = [
    ["EVIDENCE", S.bone, "attacks \u00B7 letters \u00B7 two solved ciphers \u00B7 prints \u00B7 DNA profile"],
    ["THEORY", S.amber, "every named suspect \u2014 labelled, never asserted"],
    ["DISPUTED", "rgba(224,120,96,0.98)", "claims the record does not support"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.1 - i * 0.6) / 0.8));
    if (p <= 0) return;
    const y = Math.round(H * (0.415 + i * 0.105));
    ctx.save(); ctx.globalAlpha = p;
    ctx.fillStyle = r[1];
    ctx.fillRect(Math.round(W * 0.16), y - Math.round(H * 0.024), Math.round(H * 0.008), Math.round(H * 0.042));
    font(ctx, Math.round(H * 0.026), S.mono, "bold");
    ctx.fillStyle = r[1];
    ctx.fillText(r[0], Math.round(W * 0.19), y + Math.round(H * 0.008));
    font(ctx, Math.round(H * 0.026), S.body, "");
    ctx.fillStyle = S.bone;
    ctx.fillText(r[2], Math.round(W * 0.34), y + Math.round(H * 0.008));
    ctx.restore();
  });
  chip(ctx, "THE 408 AND THE 340 ARE SOLVED \u00B7 THE Z13 AND Z32 ARE NOT", W / 2, Math.round(H * 0.80), Math.round(H * 0.018), { align: "center", color: S.amber, alpha: ease(clamp((tLoc - 3.2) / 1.0)) });
}

// ---------- b0d: title over the real Chronicle building ----------
export function title_card(ctx, W, H, tLoc, dur, b) {
  plate(ctx, W, H, tLoc, dur, "chronicle_building.jpg", { scrim: 0.30, topScrim: 0.20 });
  band(ctx, W, H, 0.30, 0.42, 0.30);
  const p = ease(clamp(tLoc / 1.3));
  crosshair(ctx, W / 2, Math.round(H * 0.315), Math.round(H * 0.082), tLoc, { p });
  display(ctx, "THE ZODIAC KILLER", W / 2, Math.round(H * 0.485), Math.round(H * 0.080), ease(clamp((tLoc - 0.5) / 1.3)), { color: S.bone, weight: "bold" });
  display(ctx, "The Ciphers, the Letters, and the Killer Nobody Could Identify", W / 2, Math.round(H * 0.575), Math.round(H * 0.030), ease(clamp((tLoc - 1.2) / 1.3)), { color: S.amber });
  rule(ctx, W / 2, Math.round(H * 0.628), Math.round(W * 0.42), ease(clamp((tLoc - 1.6) / 1.2)));
  chip(ctx, "AN EVIDENCE-FIRST INVESTIGATIVE DOCUMENTARY", W / 2, Math.round(H * 0.695), Math.round(H * 0.017), { align: "center", color: S.boneDim, alpha: ease(clamp((tLoc - 2.0) / 1.0)) });
  creditBR(ctx, W, H, "RECONSTRUCTIONS LABELLED \u00B7 SOURCES IN DESCRIPTION \u00B7 GOLDEN GATE OVERLOOK, SAN FRANCISCO (CREDITED)");
}

// ---------- attacks: photo-first, lower-thirds, small map inset ----------
function attackScene(photoNames, cityKey, dateChip, deaths, survivors) {
  const twoUp = Array.isArray(photoNames) && photoNames.length > 1;
  return function (ctx, W, H, tLoc, dur, b) {
    if (twoUp) photoCut(ctx, W, H, tLoc, dur, photoNames, { at: 0.52, scrim: 0.24 });
    else plate(ctx, W, H, tLoc, dur, photoNames[0], { scrim: 0.24 });
    header(ctx, W, H, tLoc, "THE ATTACKS", dateChip);
    // map inset — smaller, top-right, kept as genuinely useful context
    const mw = Math.round(W * 0.24), mh = Math.round(mw * 0.82);
    const mx = W - mw - Math.round(W * 0.035), my = Math.round(H * 0.26);
    const mp = ease(clamp((tLoc - 0.9) / 1.3));
    if (mp > 0) {
      ctx.save(); ctx.globalAlpha = 0.94 * mp;
      paper(ctx, mx - 8, my - 8, mw + 16, mh + 16, { alpha: 0.94 * mp });
      bayAreaMap(ctx, mx, my, mw, mh, tLoc, { p: mp, pins: ["sf", "benicia", "vallejo", "napa", "berryessa"], hit: cityKey, labels: [cityKey, "sf", "vallejo"] });
      ctx.restore();
    }
    // names directly on the frame (RC3 fix: no card wall)
    const items = [
      ...deaths.map((nm) => ({ mark: "\u2020", str: nm })),
      ...survivors.map((nm) => ({ mark: "\u2014", str: `${nm}  \u00B7 SURVIVED` })),
    ];
    band(ctx, W, H, 0.655, 0.28, 0.42, "full");
    lowerThird(ctx, W, H, items, ease(clamp((tLoc - 1.7) / 1.1)), { x: Math.round(W * 0.062), y: Math.round(H * 0.775) });
    stamp(ctx, "CONFIRMED", W - Math.round(W * 0.075), Math.round(H * 0.905), Math.round(H * 0.024), "rgba(217,164,65,0.85)", -0.05, ease(clamp((tLoc - 2.5) / 0.8)));
    creditBR(ctx, W, H, `LOCATION CONTEXT \u00B7 ${photoNames[0].replace(".jpg", "").replace(/_/g, " ").toUpperCase()} (CREDITED)`);
  };
}
export const attack_benicia = attackScene(["benicia_street.jpg"], "benicia", "1968-12-20 \u00B7 LAKE HERMAN ROAD, BENICIA", ["DAVID FARADAY, 17", "BETTY LOU JENSEN, 17"], []);
export const attack_vallejo = attackScene(["vallejo_waterfront.jpg", "blue_rock_park.jpg"], "vallejo", "1969-07-04 \u00B7 BLUE ROCK SPRINGS, VALLEJO", ["DARLENE FERRIN, 22"], ["MICHAEL MAGEAU, 19"]);
export const attack_berryessa = attackScene(["berryessa_aerial.jpg"], "berryessa", "1969-09-27 \u00B7 LAKE BERRYESSA", ["CECELIA SHEPARD, 22 \u00B7 DIED SEPT 29"], ["BRYAN HARTNELL, 20"]);
export const attack_presidio = attackScene(["presidio_historic.jpg"], "presidio", "1969-10-11 \u00B7 PRESIDIO HEIGHTS, SAN FRANCISCO", ["PAUL STINE, 29"], []);

export function fear_grid(ctx, W, H, tLoc, dur, b) {
  plate(ctx, W, H, tLoc, dur, "sf_street_1960s.jpg", { scrim: 0.26, move: { zoom: [1.20, 1.06], pan: [0.56, 0.12, 0.30, 0.88] } });
  header(ctx, W, H, tLoc, "THE ATTACKS \u00B7 THE FEAR", "Four attacks. Five dead. One region afraid.");
  const mw = Math.round(W * 0.24), mh = Math.round(mw * 0.82);
  const mx = W - mw - Math.round(W * 0.035), my = Math.round(H * 0.26);
  const mp = ease(clamp((tLoc - 0.6) / 1.3));
  if (mp > 0) {
    ctx.save(); ctx.globalAlpha = 0.94 * mp;
    paper(ctx, mx - 8, my - 8, mw + 16, mh + 16, { alpha: 0.94 * mp });
    bayAreaMap(ctx, mx, my, mw, mh, tLoc, { p: mp, pins: ["sf", "benicia", "vallejo", "napa", "berryessa"] });
    ctx.restore();
  }
  const items = [
    "POLICE ESCORTS ON SCHOOL BUSES",
    "GUN SALES UP ACROSS THE BAY AREA",
    "FOUR JURISDICTIONS \u00B7 ONE MANHUNT",
  ];
  band(ctx, W, H, 0.645, 0.30, 0.40, "full");
  items.forEach((s, i) => {
    const p = ease(clamp((tLoc - 1.5 - i * 0.5) / 0.75));
    if (p <= 0) return;
    chip(ctx, s, Math.round(W * 0.062), Math.round(H * (0.70 + i * 0.062)), Math.round(H * 0.018), { color: S.bone, alpha: p });
  });
  creditBR(ctx, W, H, "PERIOD STREET SCENE (CREDITED)");
}
