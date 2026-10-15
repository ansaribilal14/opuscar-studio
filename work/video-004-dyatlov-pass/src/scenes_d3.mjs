// scenes_d3.mjs — v4: science + conclusion + DISPATCHER (video-004)
// Brief-driven transitions (cut/dissolve per scene_briefs.json), per-brief vignette,
// Dyatlov beat tabs. Scene fns: (ctx, W, H, tLoc, dur, b) — CONTENT only.
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import {
  PAL as S, kicker, rule, paper, grain, basePlate, vignette, chrome2,
} from "./film_look.mjs";
import { clamp, lerp, ease, easeOut, text, font, textW, RNG } from "./engine.mjs";
import { plate, band, softVignette } from "./comp_modes.mjs";
import { header, creditBR, chip, stamp, base, dline, quoteBar, setW, crosshair } from "./support.mjs";
import { terrainPlate, mapBox, geoInBox, mark, mlabel, snow, CREDIT_TERRAIN } from "./terrain_d.mjs";
import { slopeProfile, ev_search_tent } from "./scenes_d2.mjs";
import { inkTent } from "./scenes_d1.mjs";

// ================= SCIENCE =================
export function sc_cut(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE MODEL \u00B7 STEP ONE", "The campers changed the slope themselves");
  const p = ease(clamp((tLoc - 0.7) / 1.6));
  const cut = ease(clamp((tLoc - 1.6) / 1.6));
  slopeProfile(ctx, Math.round(W * 0.08), Math.round(H * 0.28), Math.round(W * 0.84), Math.round(H * 0.56), { p, cut, labels: true });
  creditBR(ctx, W, H, "CROSS-SECTION: STYLIZED FROM THE 2021 MODEL \u00B7 SLOPE GEOMETRY FROM THE DEM");
}

export function sc_wind_load(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE MODEL \u00B7 STEP TWO", "Wind loads the shoulder above the tent");
  const p = ease(clamp((tLoc - 0.6) / 1.2));
  const wind = ease(clamp((tLoc - 1.2) / 1.8));
  const deposit = ease(clamp((tLoc - 2.2) / (dur - 3.4)));
  slopeProfile(ctx, Math.round(W * 0.08), Math.round(H * 0.28), Math.round(W * 0.84), Math.round(H * 0.56), { p, wind, deposit, labels: true });
  chip(ctx, "ARCTIC COLD FRONT \u00B7 KATABATIC WINDS \u00B7 HOUR BY HOUR", W / 2, Math.round(H * 0.895), Math.round(H * 0.019), { align: "center", color: S.boneDim, alpha: ease(clamp((tLoc - 2.6) / 0.9)) });
  creditBR(ctx, W, H, "MECHANISM PER GAUME & PUZRIN 2021 \u00B7 STYLIZED");
}

export function sc_release(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE MODEL \u00B7 THE RELEASE", "Pressure, not impact");
  const p = ease(clamp((tLoc - 0.6) / 1.0));
  const slab = ease(clamp((tLoc - 2.6) / 2.8));
  slopeProfile(ctx, Math.round(W * 0.08), Math.round(H * 0.28), Math.round(W * 0.84), Math.round(H * 0.56), { p, cut: 1, slab, labels: true });
  band(ctx, W, H, 0.80, 0.14, 0.46, "full");
  chip(ctx, "RELEASE WINDOW: 9.5\u201313 HOURS AFTER THE CUT (FORENSIC RANGE)", W / 2, Math.round(H * 0.875), Math.round(H * 0.019), { align: "center", color: S.amber, alpha: ease(clamp((tLoc - 1.4) / 0.9)) });
  chip(ctx, "SNOW BLOCKS UP TO 0.5 m\u00B3 \u00B7 AT WALKING PACE", W / 2, Math.round(H * 0.925), Math.round(H * 0.017), { align: "center", color: S.boneDim, alpha: ease(clamp((tLoc - 2.2) / 0.9)) });
  creditBR(ctx, W, H, "PARAMETERS PER THE 2021 PAPER \u00B7 STYLIZED");
}

export function sc_escape(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE EXIT \u00B7 READABLE ON THE MODEL", "Cut out in seconds, carried below");
  const p = ease(clamp((tLoc - 0.6) / 1.0));
  const ep = ease(clamp((tLoc - 1.8) / 2.4));
  slopeProfile(ctx, Math.round(W * 0.08), Math.round(H * 0.28), Math.round(W * 0.84), Math.round(H * 0.52), { p, cut: 1, labels: true });
  // descent path from the tent down the slope
  if (ep > 0) {
    const x0 = W * 0.08 + W * 0.84 * 0.24, y0 = H * 0.28 + H * 0.52 * 0.42;
    ctx.save();
    ctx.strokeStyle = "rgba(208,90,60,0.95)"; ctx.lineWidth = 4;
    ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.moveTo(x0, y0);
    const q = ease(ep);
    ctx.quadraticCurveTo(x0 + W * 0.16, y0 + H * 0.14, x0 + W * 0.34 * q, y0 + H * 0.20 * q);
    ctx.stroke(); ctx.setLineDash([]);
    // arrowhead
    const ax = x0 + W * 0.34 * q, ay = y0 + H * 0.20 * q;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax - 16, ay - 12); ctx.moveTo(ax, ay); ctx.lineTo(ax - 6, ay - 19); ctx.stroke();
    ctx.restore();
  }
  chip(ctx, "THE EXIT: CUT FROM WITHIN \u00B7 SECONDS", Math.round(W * 0.08), Math.round(H * 0.845), Math.round(H * 0.019), { color: S.bone, alpha: ease(clamp((tLoc - 2.2) / 0.9)) });
  chip(ctx, "INJURED \u00B7 FREEZING \u00B7 ALIVE \u2014 FOR NOW", Math.round(W * 0.08), Math.round(H * 0.90), Math.round(H * 0.020), { color: "rgba(224,120,96,0.98)", alpha: ease(clamp((tLoc - 3.0) / 0.9)) });
  creditBR(ctx, W, H, "MODEL-BASED RECONSTRUCTION \u00B7 LABELLED");
}

export function sc_injuries(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "FORCES VS. THE AUTOPSIES", "Checked against the injury scale");
  // AIS gauge
  const gp = ease(clamp((tLoc - 0.9) / 1.8));
  const gx = Math.round(W * 0.14), gy = Math.round(H * 0.52), gw = Math.round(W * 0.42), gh = Math.round(H * 0.045);
  ctx.save();
  ctx.fillStyle = "rgba(234,227,212,0.10)"; ctx.fillRect(gx, gy, gw, gh);
  const grad = ctx.createLinearGradient(gx, 0, gx + gw, 0);
  grad.addColorStop(0, "rgba(154,178,205,0.8)"); grad.addColorStop(0.6, "rgba(210,168,94,0.85)"); grad.addColorStop(1, "rgba(208,90,60,0.9)");
  ctx.fillStyle = grad; ctx.fillRect(gx, gy, gw * gp, gh);
  text(ctx, "MODERATE", gx, gy + gh + Math.round(H * 0.045), Math.round(H * 0.018), { family: S.mono, color: S.boneDim });
  text(ctx, "SEVERE", gx + gw - textW(ctx, "SEVERE", Math.round(H * 0.018), S.mono), gy + gh + Math.round(H * 0.045), Math.round(H * 0.018), { family: S.mono, color: S.boneDim });
  text(ctx, "THORAX & SKULL COMPRESSION \u00B7 NON-FATAL", gx + gw * 0.5 - textW(ctx, "THORAX & SKULL COMPRESSION \u00B7 NON-FATAL", Math.round(H * 0.022), S.mono) / 2, gy - Math.round(H * 0.03), Math.round(H * 0.022), { family: S.mono, color: S.bone, spacing: 1.5 });
  ctx.restore();
  const rows = ["EVERYONE COULD STILL WALK OUT", "NO ONE WAS BURIED", "THE PATTERN MATCHES THE AUTOPSIES"];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 2.4 - i * 0.7) / 0.7));
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p;
    ctx.strokeStyle = "rgba(210,168,94,0.95)"; ctx.lineWidth = 3.4;
    const x = W * 0.62, y = H * (0.46 + i * 0.09);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + H * 0.018, y + H * 0.018); ctx.lineTo(x + H * 0.055, y - H * 0.026); ctx.stroke();
    font(ctx, Math.round(H * 0.026), S.body, "");
    ctx.fillStyle = S.bone;
    ctx.fillText(r, x + H * 0.085, y + H * 0.008);
    ctx.restore();
  });
  creditBR(ctx, W, H, "INJURY MAPPING PER THE 2021 PAPER (AIS) \u00B7 NO GRAPHIC IMAGERY");
}

export function sc_objections(ctx, W, H, tLoc, dur, b) {
  terrainPlate(ctx, W, H, tLoc, dur, "slope", { seed: "b5e-obj", scrim: 0.30, move: { zoom: [1.06, 1.16], pan: [0.4, 0.45, 0.6, 0.55] } });
  header(ctx, W, H, tLoc, "THE OBJECTIONS, ANSWERED", "Each doubt, tested");
  const rows = [
    ["SLOPE TOO SHALLOW?", "WIND LOAD ALLOWS RELEASE AT ~23\u00B0"],
    ["NO TRACES?", "ERASED BY WEEKS OF SNOWFALL"],
    ["THE 2022 EXPEDITIONS", "THREE \u00B7 AVALANCHES \u2018NOT EXCEPTIONAL\u2019"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.0 - i * 1.1) / 0.8));
    if (p <= 0) return;
    const y = Math.round(H * (0.40 + i * 0.125));
    ctx.save(); ctx.globalAlpha = p;
    ctx.fillStyle = "rgba(10,13,19,0.55)";
    ctx.fillRect(Math.round(W * 0.14), y - Math.round(H * 0.040), Math.round(W * 0.60), Math.round(H * 0.092));
    font(ctx, Math.round(H * 0.024), S.mono, "bold");
    ctx.fillStyle = "rgba(224,120,96,0.98)";
    ctx.fillText(r[0], Math.round(W * 0.165), y - Math.round(H * 0.006));
    font(ctx, Math.round(H * 0.026), S.body, "");
    ctx.fillStyle = S.bone;
    ctx.fillText(r[1], Math.round(W * 0.165), y + Math.round(H * 0.032));
    ctx.restore();
  });
  creditBR(ctx, W, H, "FINDINGS PER THE 2021 PAPER AND 2022 FOLLOW-UP");
}

export function sc_limits(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "WHAT THE SCIENCE DOES NOT DO", "The honest boundary");
  const rows = ["WHY NO ONE CLIMBED BACK TO THE TENT", "WHY THE GROUP SPLIT", "WHERE THE CONTAMINATION CAME FROM"];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.0 - i * 0.9) / 0.8));
    if (p <= 0) return;
    const y = Math.round(H * (0.42 + i * 0.10));
    ctx.save(); ctx.globalAlpha = p;
    ctx.strokeStyle = "rgba(208,90,60,0.9)"; ctx.lineWidth = 2.4;
    ctx.strokeRect(W * 0.28, y - H * 0.034, H * 0.068, H * 0.068);
    font(ctx, Math.round(H * 0.030), S.mono, "bold");
    ctx.fillStyle = "rgba(224,120,96,0.98)";
    ctx.fillText("?", W * 0.28 + H * 0.024, y + H * 0.012);
    font(ctx, Math.round(H * 0.027), S.body, "");
    ctx.fillStyle = S.bone;
    ctx.fillText(r, W * 0.28 + H * 0.105, y + H * 0.010);
    ctx.restore();
  });
  chip(ctx, "IT SHRINKS THE MYSTERY TO HUMAN-SIZED QUESTIONS", W / 2, Math.round(H * 0.80), Math.round(H * 0.019), { align: "center", color: S.amber, alpha: ease(clamp((tLoc - 3.6) / 0.9)) });
  creditBR(ctx, W, H, "SCIENCE AS TESTABLE EXPLANATION \u2014 NOT PROOF OF EVERY DETAIL");
}

// ================= CONCLUSION =================
export function co_chain(ctx, W, H, tLoc, dur, b) {
  terrainPlate(ctx, W, H, tLoc, dur, "camp", { seed: "b6a-chain", night: 0.5, scrim: 0.22, move: { zoom: [1.08, 1.18], pan: [0.5, 0.55, 0.5, 0.4] } });
  snow(ctx, W, H, tLoc, 61, 70, 26);
  header(ctx, W, H, tLoc, "ONE DEFENSIBLE CHAIN", "What the evidence holds");
  const links = ["STORM", "LOAD", "SLAB", "EXIT", "COLD"];
  links.forEach((s, i) => {
    const p = ease(clamp((tLoc - 1.0 - i * 0.85) / 0.7));
    if (p <= 0) return;
    const x = Math.round(W * (0.14 + i * 0.17));
    const y = Math.round(H * 0.62);
    ctx.save(); ctx.globalAlpha = p;
    chip(ctx, s, x, y, Math.round(H * 0.026), { align: "center", color: i === 4 ? "rgba(224,120,96,0.98)" : S.bone, border: "rgba(210,168,94,0.5)" });
    if (i < 4) text(ctx, "\u2192", x + Math.round(W * 0.115), y + Math.round(H * 0.010), Math.round(H * 0.028), { family: S.mono, color: S.amber, alpha: p });
    ctx.restore();
  });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

export function co_2020(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "2020 \u00B7 THE RE-EXAMINATION", "The state's answer, 61 years late");
  const pA = ease(clamp((tLoc - 0.9) / 0.9));
  paper(ctx, Math.round(W * 0.20), Math.round(H * 0.40), Math.round(W * 0.60), Math.round(H * 0.30), { alpha: pA });
  if (pA > 0) {
    const rows = [
      ["THE TRIGGER", "AN AVALANCHE"],
      ["THE DEATHS", "HYPOTHERMIA"],
      ["THE CRIME", "NONE \u2014 \u2018FORCE MAJEURE\u2019"],
    ];
    rows.forEach((r, i) => {
      const p = ease(clamp((tLoc - 1.3 - i * 0.75) / 0.7));
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = p;
      font(ctx, Math.round(H * 0.022), S.mono, "bold");
      ctx.fillStyle = "#8f2f22";
      ctx.fillText(r[0], Math.round(W * 0.245), Math.round(H * (0.465 + i * 0.075)));
      font(ctx, Math.round(H * 0.028), S.body, "bold");
      ctx.fillStyle = "#23201a";
      ctx.fillText(r[1], Math.round(W * 0.42), Math.round(H * (0.465 + i * 0.075)));
      ctx.restore();
    });
    stamp(ctx, "REQUESTED BY THE FAMILIES", Math.round(W * 0.56), Math.round(H * 0.66), Math.round(H * 0.015), "rgba(143,47,34,0.7)", -0.05, ease(clamp((tLoc - 3.4) / 0.8)));
  }
  creditBR(ctx, W, H, "PROSECUTORS' 2019\u20132020 RE-EXAMINATION (PUBLIC STATEMENTS)");
}

export function co_words(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  const p = ease(clamp((tLoc - 0.6) / 1.2));
  quoteBar(ctx, W, H, "a compelling natural force", "THE 1959 CLOSURE ORDER \u00B7 THE FILE'S OWN WORDS", ease(clamp(tLoc / 1.0)), 0.44);
  dline(ctx, "Science spent sixty years", W / 2, Math.round(H * 0.60), Math.round(H * 0.036), p, { color: S.bone, align: "center" });
  dline(ctx, "learning how to name it.", W / 2, Math.round(H * 0.66), Math.round(H * 0.036), ease(clamp((tLoc - 1.4) / 1.0)), { color: S.amber, align: "center" });
  creditBR(ctx, W, H, "QUOTED FROM THE CLOSURE DECISION");
}

export function co_open(ctx, W, H, tLoc, dur, b) {
  terrainPlate(ctx, W, H, tLoc, dur, "camp", { seed: "b6c-open", night: 0.58, scrim: 0.18, move: { zoom: [1.04, 1.12], pan: [0.48, 0.5, 0.55, 0.45] } });
  snow(ctx, W, H, tLoc, 67, 60, 22);
  dline(ctx, "THE CHOICES IN THE DARK", W / 2, Math.round(H * 0.44), Math.round(H * 0.048), ease(clamp((tLoc - 0.8) / 1.0)), { color: S.bone, weight: "bold", align: "center" });
  dline(ctx, "The evidence shows how they moved. It will never show what they said.", W / 2, Math.round(H * 0.53), Math.round(H * 0.026), ease(clamp((tLoc - 1.8) / 1.1)), { color: S.boneDim, align: "center" });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

const NINE = [
  ["IGOR DYATLOV", "23"], ["ZINAIDA KOLMOGOROVA", "20"], ["RUSTEM SLOBODIN", "23"],
  ["YURI DOROSHENKO", "21"], ["YURI KRIVONISHENKO", "23"], ["NIKOLAI THIBEAUX-BRIGNOLLE", "24"],
  ["LYUDMILA DUBININA", "20"], ["ALEXANDER KOLEVATOV", "25"], ["SEMYON ZOLOTARYOV", "38"],
];
export function co_names(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  // small cedar silhouette, bottom-left
  ctx.save(); ctx.globalAlpha = 0.5;
  const rng = RNG(113);
  ctx.strokeStyle = "#0c0f14";
  ctx.fillStyle = "#0c0f14";
  const cx = W * 0.10, by = H * 0.94;
  ctx.fillRect(cx - 3, by - H * 0.10, 6, H * 0.10);
  for (let i = 0; i < 8; i++) {
    const y = by - H * (0.02 + i * 0.012);
    const sp = W * (0.05 - i * 0.005);
    ctx.beginPath(); ctx.moveTo(cx - sp, y); ctx.lineTo(cx, y - H * 0.02); ctx.lineTo(cx + sp, y); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  const step = Math.max(2.0, (dur - 3.0) / NINE.length);
  NINE.forEach((n, i) => {
    const p = ease(clamp((tLoc - 1.0 - i * step) / 0.75));
    if (p <= 0) return;
    const y = Math.round(H * (0.24 + (i % 5) * 0.115));
    const x = i < 5 ? Math.round(W * 0.30) : Math.round(W * 0.56);
    ctx.save(); ctx.globalAlpha = p;
    font(ctx, Math.round(H * 0.031), S.serif, "bold");
    ctx.fillStyle = S.bone;
    ctx.fillText(n[0], x, y);
    font(ctx, Math.round(H * 0.021), S.mono, "bold");
    ctx.fillStyle = S.amber;
    ctx.fillText(n[1], x + textW(ctx, n[0], Math.round(H * 0.031), S.serif, "bold") + 14, y);
    ctx.restore();
  });
  dline(ctx, "THE NINE", W / 2, Math.round(H * 0.15), Math.round(H * 0.022), ease(clamp((tLoc - 0.4) / 0.8)), { color: S.boneDim, align: "center" });
  creditBR(ctx, W, H, "NAMES AND AGES AS RECORDED IN THE CASE FILE");
}

export function co_close(ctx, W, H, tLoc, dur, b) {
  terrainPlate(ctx, W, H, tLoc, dur, "camp", { seed: "b6e-dawn", night: Math.max(0, 0.5 - (tLoc / dur) * 0.62), scrim: 0.16, warm: true, move: { zoom: [1.10, 1.04], pan: [0.46, 0.52, 0.54, 0.48] } });
  if (tLoc < dur * 0.5) snow(ctx, W, H, tLoc, 71, 40, 18);
  dline(ctx, "THE PASS CARRIES THEIR NAME", W / 2, Math.round(H * 0.40), Math.round(H * 0.044), ease(clamp((tLoc - 0.8) / 1.0)), { color: S.bone, weight: "bold", align: "center" });
  dline(ctx, "The file remains open where the record ends \u2014 with nine names, one mountain,", W / 2, Math.round(H * 0.49), Math.round(H * 0.024), ease(clamp((tLoc - 1.8) / 1.1)), { color: S.boneDim, align: "center" });
  dline(ctx, "and the honest limits of what science has proven.", W / 2, Math.round(H * 0.535), Math.round(H * 0.024), ease(clamp((tLoc - 2.4) / 1.1)), { color: S.boneDim, align: "center" });
  rule(ctx, W / 2, Math.round(H * 0.60), Math.round(W * 0.26), ease(clamp((tLoc - 3.0) / 1.0)));
  chip(ctx, "DYATLOV PASS \u00B7 NAMED 1963", W / 2, Math.round(H * 0.66), Math.round(H * 0.017), { align: "center", color: S.boneFaint, alpha: ease(clamp((tLoc - 3.4) / 0.9)) });
  creditBR(ctx, W, H, CREDIT_TERRAIN);
}

export function card_end(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  const p = ease(clamp(tLoc / 1.0));
  crosshair(ctx, W / 2, Math.round(H * 0.38), Math.round(H * 0.058), tLoc, { p });
  dline(ctx, "THE UNCLOSED FILE", W / 2, Math.round(H * 0.52), Math.round(H * 0.052), ease(clamp((tLoc - 0.5) / 1.0)), { color: S.bone, weight: "bold", align: "center" });
  dline(ctx, "DYATLOV PASS \u00B7 1959", W / 2, Math.round(H * 0.59), Math.round(H * 0.024), ease(clamp((tLoc - 1.1) / 1.0)), { color: S.amber, align: "center" });
  chip(ctx, "SOURCES: CASE-FILE ARCHIVE \u00B7 AUTOPSY RECORDS \u00B7 GAUME & PUZRIN 2021 / 2022", W / 2, Math.round(H * 0.70), Math.round(H * 0.015), { align: "center", color: S.boneFaint, alpha: ease(clamp((tLoc - 1.8) / 1.0)) });
}

// ================= DISPATCHER =================
const BRIEFS = JSON.parse(fs.readFileSync(new URL("./scene_briefs.json", import.meta.url), "utf8")).briefs;

const SCENES = {
  hook_tent_find, hook_footprints, hook_no_plan, hook_cold_night, hook_question, card_title,
  ctx_start, ctx_group, ctx_route_map, ctx_labaz, ctx_climb, ctx_camp, ctx_silence,
  ev_search_tent, ev_cuts_prints, ev_cedar, ev_cedar_climb, ev_line_back, ev_ravine_four,
  ev_autopsy_split, ev_injuries, ev_details, ev_closure,
  th_frame, th_people, th_abandon, th_sky, th_infrasound, th_avalanche, th_turn,
  sc_cut, sc_wind_load, sc_release, sc_escape, sc_injuries, sc_objections, sc_limits,
  co_chain, co_2020, co_words, co_open, co_names, co_close, card_end,
};
import {
  hook_tent_find, hook_footprints, hook_no_plan, hook_cold_night, hook_question, card_title,
  ctx_start, ctx_group, ctx_route_map, ctx_labaz, ctx_climb, ctx_camp, ctx_silence,
} from "./scenes_d1.mjs";
import {
  ev_cuts_prints, ev_cedar, ev_cedar_climb, ev_line_back, ev_ravine_four,
  ev_autopsy_split, ev_injuries, ev_details, ev_closure,
  th_frame, th_people, th_abandon, th_sky, th_infrasound, th_avalanche, th_turn,
} from "./scenes_d2.mjs";

function beatTab(ctx, W, H, t, block) {
  const names = {
    0: ["FILE 1 / 6", "THE HOOK"], 1: ["FILE 2 / 6", "THE EXPEDITION"], 2: ["FILE 3 / 6", "THE EVIDENCE"],
    3: ["FILE 4 / 6", "THE THEORIES"], 4: ["FILE 5 / 6", "THE SCIENCE"], 5: ["FILE 6 / 6", "THE VERDICT"],
  };
  const n = names[block.beat];
  if (!n) return;
  text(ctx, n[0], Math.round(W * 0.024), Math.round(H * 0.038), Math.round(H * 0.0145), { family: S.mono, color: S.amber, alpha: 0.5, spacing: 2 });
  const lw = textW(ctx, n[1], Math.round(H * 0.0135), S.mono);
  text(ctx, n[1], W - Math.round(W * 0.024) - lw, Math.round(H * 0.026), Math.round(H * 0.0135), { family: S.mono, color: S.boneFaint, alpha: 0.5, spacing: 2 });
}

let _xf = null;
function xfadeBuffers(W, H) {
  if (!_xf || _xf.W !== W || _xf.H !== H) {
    const { createCanvas } = require("canvas");
    _xf = { W, H, a: createCanvas(W, H), b: createCanvas(W, H) };
  }
  return _xf;
}
function drawScene(c2d, W, H, b, tLoc) {
  const fn = SCENES[b.visual];
  if (!fn) throw new Error(`no scene for visual ${b.visual}`);
  fn(c2d, W, H, tLoc, b.dur, b);
}

const TRANS = 0.9;
const NO_TAB = new Set(["card_title", "card_end", "co_names"]);

export function renderFrame(ctx, W, H, tl, t) {
  setW(W);
  const blocks = tl.blocks;
  let idx = 0;
  for (let i = 0; i < blocks.length; i++) { if (t >= blocks[i].start) idx = i; else break; }
  const b = blocks[idx];
  const tLoc = t - b.start;
  const prev = idx > 0 ? blocks[idx - 1] : null;
  const br = BRIEFS[b.id] || {};

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);

  basePlate(ctx, W, H, t);
  const inTrans = prev && tLoc < TRANS && (br.in || "dissolve") === "dissolve";
  if (inTrans) {
    const { a, b: cvsB } = xfadeBuffers(W, H);
    const ca = a.getContext("2d"), cb = cvsB.getContext("2d");
    ca.setTransform(1, 0, 0, 1, 0, 0); ca.clearRect(0, 0, W, H);
    cb.setTransform(1, 0, 0, 1, 0, 0); cb.clearRect(0, 0, W, H);
    basePlate(ca, W, H, t);
    basePlate(cb, W, H, t);
    drawScene(ca, W, H, prev, t - prev.start);
    drawScene(cb, W, H, b, tLoc);
    const mix = ease(clamp(tLoc / TRANS));
    ctx.drawImage(a, 0, 0);
    ctx.save(); ctx.globalAlpha = mix; ctx.drawImage(cvsB, 0, 0); ctx.restore();
  } else {
    drawScene(ctx, W, H, b, tLoc);
  }

  if ((br.vig || "std") === "soft") softVignette(ctx, W, H);
  else vignette(ctx, W, H);
  grain(ctx, W, H, t);
  chrome2(ctx, W, H, t, tl.total);
  if (!NO_TAB.has(b.visual)) beatTab(ctx, W, H, t, b);
}
