// scenes_z3v4.mjs — v4: unsolved ciphers, suspects, investigation, verdict + DISPATCHER
// Dispatcher changes vs v3 (issues #12-#15):
//   - BACKS ghost backdrops RETIRED (RC2): photos are either shown or not.
//   - Transition grammar from scene_briefs.json: "cut" on new facts/beat changes,
//     0.9s dissolve within beats. No more uniform crossfade everywhere (RC5).
//   - Vignette per brief: soft for photo-led frames, std for vector scenes.
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import {
  PAL as S, kicker, display as _display, rule, paper, stamp2,
  grain, basePlate, vignette, chrome2,
} from "./film_look.mjs";
import { clamp, ease, easeOut, text, font, textW, RNG } from "./engine.mjs";
import { plate, band, inkGrid, softVignette } from "./comp_modes.mjs";
import { bayAreaMap } from "./map_z.mjs";
import { header, creditBR, chip, quoteBar, cipherGrid, crosshair, listRow, base, stamp } from "./scenes_z1.mjs";
import {
  cold_open_paper, cold_open_years, cold_open_rules, title_card,
  attack_benicia, attack_vallejo, attack_berryessa, attack_presidio, fear_grid,
} from "./scenes_z1v4.mjs";
import {
  letters_three, letters_name, letters_symbol, letters_evidence,
  c408_build, c408_hardens, c408_message, c408_noname, c408_verdict,
  c340_grid, c340_transpose, c340_team, c340_message, c340_compare,
} from "./scenes_z2v4.mjs";

let FW = 1920;
function display(ctx, str, cx, y, size, p, opts = {}) {
  return _display(ctx, str, cx, y, size, p, { maxW: FW * 0.92, ...opts });
}

// ---------- unsolved short ciphers ----------
export function z13_z32(ctx, W, H, tLoc, dur, b) {
  plate(ctx, W, H, tLoc, dur, "mount_diablo_tower.jpg", { scrim: 0.24, topScrim: 0.22 });
  header(ctx, W, H, tLoc, "WHAT REMAINS UNSOLVED", "Two ciphers that may never speak");
  const cards = [
    { x: 0.075, tag: "Z13 \u00B7 1970-04-20", line: "\u201Cmy name is \u2014\u201D", cols: 13, rows: 1, seed: 13, rot: -0.01 },
    { x: 0.535, tag: "Z32 \u00B7 1970-06-26", line: "map + bomb code claim", cols: 16, rows: 2, seed: 32, rot: 0.01 },
  ];
  cards.forEach((c, i) => {
    const p = ease(clamp((tLoc - 0.9 - i * 0.8) / 0.9));
    if (p <= 0) return;
    const w = Math.round(W * 0.39), h = Math.round(H * 0.34);
    const x = Math.round(W * c.x), y = Math.round(H * 0.42 + (1 - p) * 26);
    ctx.save(); ctx.globalAlpha = p;
    paper(ctx, x, y, w, h, { alpha: p, rot: c.rot });
    chip(ctx, c.tag, x + w / 2, y + Math.round(h * 0.17), Math.round(H * 0.0165), { align: "center", color: "rgba(150,110,40,0.95)", border: "rgba(150,110,40,0.5)" });
    text(ctx, c.line, x + w / 2, y + Math.round(h * 0.36), Math.round(H * 0.030), { family: S.serif, color: S.ink, align: "center", weight: "bold" });
    inkGrid(ctx, x + Math.round(w * 0.10), y + Math.round(h * 0.48), Math.round(w * 0.80), Math.round(h * 0.30), c.cols, c.rows, c.seed, { p: clamp((tLoc - 1.5 - i * 0.8) / 1.0) });
    stamp(ctx, "UNSOLVED", x + w - Math.round(w * 0.16), y + Math.round(h * 1.06), Math.round(H * 0.024), "rgba(176,64,47,0.9)", i ? 0.06 : -0.07, p);
    ctx.restore();
  });
  chip(ctx, "13 AND 32 SYMBOLS \u2014 TOO FEW FOR A UNIQUE READING", W / 2, Math.round(H * 0.905), Math.round(H * 0.019), { align: "center", color: S.bone, alpha: ease(clamp((tLoc - 3.2) / 1.0)) });
  creditBR(ctx, W, H, "MOUNT DIABLO TOWER (CREDITED) \u00B7 CARDS: STYLIZED RECONSTRUCTION");
}

export function underdetermined(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE LIMIT", "Short strings, too many answers");
  cipherGrid(ctx, Math.round(W * 0.085), Math.round(H * 0.36), Math.round(W * 0.34), Math.round(H * 0.16), 13, 1, 13, { p: ease(clamp(tLoc / 1.4)) });
  text(ctx, "Z13 \u00B7 13 SYMBOLS \u00B7 NO VERIFIABLE READING", Math.round(W * 0.255), Math.round(H * 0.585), Math.round(H * 0.0165), { family: S.mono, color: S.boneFaint, align: "center" });
  const readings = ["ALFRED E NEUMAN", "KAYE", "ZODIAC", "???????"];
  readings.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.7 - i * 0.65) / 0.8));
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p;
    ctx.strokeStyle = "rgba(217,164,65,0.65)"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(Math.round(W * 0.45), Math.round(H * 0.44)); ctx.lineTo(Math.round(W * 0.545), Math.round(H * (0.345 + i * 0.115))); ctx.stroke();
    text(ctx, `READING ${i + 1}:  ${r}`, Math.round(W * 0.565), Math.round(H * (0.345 + i * 0.115)) + Math.round(H * 0.007), Math.round(H * 0.024), { family: S.mono, color: i === 3 ? "rgba(224,120,96,0.98)" : S.bone });
    ctx.restore();
  });
  chip(ctx, "WHICH IS REAL? THE RECORD CANNOT SAY \u2014 AND MAY NEVER SAY", W / 2, Math.round(H * 0.80), Math.round(H * 0.018), { align: "center", color: S.amber, alpha: ease(clamp((tLoc - 4.3) / 1.0)) });
}

export function physical_trail(ctx, W, H, tLoc, dur, b) {
  plate(ctx, W, H, tLoc, dur, "evidence_board.jpg", { scrim: 0.22, topScrim: 0.22, move: { zoom: [1.21, 1.07], pan: [0.12, 0.48, 0.86, 0.30] } });
  header(ctx, W, H, tLoc, "THE IDENTITY EVIDENCE", "Never the ciphers \u2014 the physical trail");
  band(ctx, W, H, 0.50, 0.40, 0.46, "full");
  const rows = [
    ["HANDWRITING", "\u224820 letters \u00B7 block letters \u00B7 comparable, never matched"],
    ["PARTIAL PRINT", "Stine cab door \u00B7 partial \u00B7 no database match then or since"],
    ["SALIVA \u2192 DNA", "stamps & flaps preserved from 1969 onward"],
    ["WOUND RECORDS", "Berryessa \u00B7 medical documentation retained"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.2 - i * 0.65) / 0.8));
    if (p <= 0) return;
    const y = Math.round(H * (0.60 + i * 0.078));
    ctx.save(); ctx.globalAlpha = p;
    text(ctx, r[0], Math.round(W * 0.062), y, Math.round(H * 0.024), { family: S.mono, color: S.amber, weight: "bold" });
    text(ctx, r[1], Math.round(W * 0.062), y + Math.round(H * 0.036), Math.round(H * 0.0215), { family: S.body, color: S.bone });
    ctx.restore();
  });
  creditBR(ctx, W, H, "CASE BOARD (CREDITED)");
}

// ---------- suspects ----------
export function allen_file(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE SUSPECTS \u00B7 THE FILE", "Arthur Leigh Allen \u2014 most investigated");
  const p = ease(clamp((tLoc - 0.9) / 1.1));
  ctx.save(); ctx.globalAlpha = p;
  paper(ctx, Math.round(W * 0.11), Math.round(H * 0.26), Math.round(W * 0.78), Math.round(H * 0.42), { alpha: p, rot: -0.005 });
  ctx.fillStyle = "rgba(217,164,65,0.14)";
  ctx.fillRect(Math.round(W * 0.13), Math.round(H * 0.245), Math.round(W * 0.22), Math.round(H * 0.045));
  text(ctx, "SUSPECT FILE \u2014 ALLEN, A.L.", Math.round(W * 0.14), Math.round(H * 0.276), Math.round(H * 0.0165), { family: S.mono, color: "rgba(150,110,40,0.95)" });
  const rows = [
    "vallejo resident \u00B7 convicted child molester",
    "told acquaintances \u2014 before some murders \u2014 he would call himself Zodiac",
    "owned a Zodiac-brand wristwatch",
    "1991: home searched \u00B7 evidence seized",
    "never charged \u00B7 died of a heart attack, August 1992",
  ];
  rows.forEach((r, i) => {
    const p2 = clamp((tLoc - 1.6 - i * 0.45) / 0.65);
    ctx.save(); ctx.globalAlpha = ease(p2);
    text(ctx, `\u00B7  ${r}`, Math.round(W * 0.145), Math.round(H * (0.335 + i * 0.062)), Math.round(H * 0.026), { family: S.body, color: S.ink });
    ctx.restore();
  });
  stamp(ctx, "THEORY \u2014 NEVER PROVEN", Math.round(W * 0.67), Math.round(H * 0.625), Math.round(H * 0.025), "rgba(176,64,47,0.9)", -0.06, ease(clamp((tLoc - 4.0) / 0.8)));
  ctx.restore();
}

export function allen_excluded(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE SUSPECTS \u00B7 THE EXCLUSIONS", "The best suspect \u2014 and the evidence that said no");
  const rows = [
    ["FINGERPRINTS / PALM PRINTS", "did not match Stine cab prints"],
    ["HANDWRITING", "comparison ruled him out of the letters"],
    ["DNA (REPORTED)", "letter DNA did not indicate Allen"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.2 - i * 0.8) / 0.85));
    if (p <= 0) return;
    const y = Math.round(H * (0.37 + i * 0.135));
    ctx.save(); ctx.globalAlpha = p;
    ctx.strokeStyle = "rgba(234,227,212,0.14)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(Math.round(W * 0.15), y - Math.round(H * 0.052)); ctx.lineTo(Math.round(W * 0.85), y - Math.round(H * 0.052)); ctx.stroke();
    text(ctx, r[0], Math.round(W * 0.15), y, Math.round(H * 0.027), { family: S.mono, color: S.bone, weight: "bold" });
    text(ctx, r[1], Math.round(W * 0.15), y + Math.round(H * 0.042), Math.round(H * 0.022), { family: S.body, color: S.boneDim });
    stamp(ctx, "NO MATCH", Math.round(W * 0.75), y + Math.round(H * 0.004), Math.round(H * 0.023), "rgba(224,120,96,0.95)", -0.05, p);
    ctx.restore();
  });
  chip(ctx, "EXCLUDED ON THE CASE\u2019S OWN EVIDENCE \u2014 NEVER DISPROVEN AS A PERSON OF INTEREST", W / 2, Math.round(H * 0.82), Math.round(H * 0.0165), { align: "center", alpha: ease(clamp((tLoc - 4.1) / 1.0)) });
}

export function poste_rejected(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE SUSPECTS \u00B7 OCTOBER 2021", "A viral \u201Csolution\u201D \u2014 tested and rejected");
  const p = ease(clamp((tLoc - 0.9) / 1.2));
  ctx.save(); ctx.globalAlpha = p;
  paper(ctx, Math.round(W * 0.13), Math.round(H * 0.27), Math.round(W * 0.74), Math.round(H * 0.34), { alpha: p });
  text(ctx, "CLAIM \u00B7 THE CASE BREAKERS (2021-10):", Math.round(W * 0.165), Math.round(H * 0.335), Math.round(H * 0.021), { family: S.mono, color: "rgba(150,110,40,0.95)" });
  text(ctx, "\u201Cthe killer was Gary Francis Poste\u201D \u2014 scar pattern, re-read evidence,", Math.round(W * 0.165), Math.round(H * 0.395), Math.round(H * 0.025), { family: S.body, color: S.ink });
  text(ctx, "Cheri Jo Bates named as a sixth victim (itself a disputed link).", Math.round(W * 0.165), Math.round(H * 0.44), Math.round(H * 0.025), { family: S.body, color: S.ink });
  text(ctx, "RESPONSE \u00B7 LAW ENFORCEMENT:", Math.round(W * 0.165), Math.round(H * 0.505), Math.round(H * 0.021), { family: S.mono, color: "rgba(150,110,40,0.95)" });
  text(ctx, "FBI denied the case was solved \u00B7 investigators stated the claim was", Math.round(W * 0.165), Math.round(H * 0.555), Math.round(H * 0.025), { family: S.body, color: S.ink });
  text(ctx, "unsupported \u00B7 SFPD/SDPD re-stated: the case remains open and active.", Math.round(W * 0.165), Math.round(H * 0.595), Math.round(H * 0.025), { family: S.body, color: S.ink });
  ctx.restore();
  stamp(ctx, "CLAIM REJECTED", Math.round(W * 0.69), Math.round(H * 0.68), Math.round(H * 0.028), "rgba(176,64,47,0.95)", -0.05, ease(clamp((tLoc - 2.6) / 0.9)));
  chip(ctx, "PATTERN OF 50+ YEARS: EVERY CONFIDENT ID COLLAPSES ON THE PHYSICAL EVIDENCE", W / 2, Math.round(H * 0.80), Math.round(H * 0.0165), { align: "center", alpha: ease(clamp((tLoc - 3.4) / 1.0)) });
}

export function bias_cycle(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE LESSON", "Confirmation bias vs. evidence");
  const nodes = [
    ["A NAME SURFACES", "book \u00B7 documentary \u00B7 internet group"],
    ["PATTERN-MATCHING", "scar \u00B7 timing \u00B7 rumour \u2014 a story that fits"],
    ["THE EVIDENCE CHECK", "prints \u00B7 handwriting \u00B7 DNA"],
    ["IT COLLAPSES", "no match \u2014 and the file stays open"],
  ];
  nodes.forEach((n, i) => {
    const p = ease(clamp((tLoc - 1.1 - i * 0.8) / 0.85));
    if (p <= 0) return;
    const w = Math.round(W * 0.215), h = Math.round(H * 0.215);
    const x = Math.round(W * (0.06 + i * 0.235));
    const y = Math.round(H * 0.35 + (1 - p) * 30);
    ctx.save(); ctx.globalAlpha = p;
    paper(ctx, x, y, w, h, { alpha: p, rot: (i % 2 ? 0.008 : -0.008) });
    chip(ctx, `${i + 1}`, x + w / 2, y + Math.round(h * 0.22), Math.round(H * 0.017), { align: "center", color: i === 3 ? "rgba(176,64,47,0.95)" : "rgba(150,110,40,0.95)", border: "rgba(150,110,40,0.5)" });
    text(ctx, n[0], x + w / 2, y + Math.round(h * 0.50), Math.round(H * 0.021), { family: S.mono, color: S.ink, align: "center", weight: "bold" });
    text(ctx, n[1], x + w / 2, y + Math.round(h * 0.72), Math.round(H * 0.0155), { family: S.body, color: S.ink, alpha: 0.7, align: "center", maxWidth: w * 0.88 });
    ctx.restore();
    if (i < 3) {
      const p2 = ease(clamp((tLoc - 1.9 - i * 0.8) / 0.55));
      ctx.save(); ctx.globalAlpha = p2;
      ctx.strokeStyle = "rgba(217,164,65,0.8)"; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(x + w + 6, y + h / 2); ctx.lineTo(x + w + W * 0.016, y + h / 2); ctx.stroke();
      ctx.fillStyle = "rgba(217,164,65,0.8)";
      ctx.beginPath(); ctx.moveTo(x + w + W * 0.016, y + h / 2 - 5); ctx.lineTo(x + w + W * 0.016 + 9, y + h / 2); ctx.lineTo(x + w + W * 0.016, y + h / 2 + 5); ctx.fill();
      ctx.restore();
    }
  });
  text(ctx, "confirmation bias finds patterns \u2014 evidence decides", W / 2, Math.round(H * 0.73), Math.round(H * 0.030), { family: S.serif, color: S.amber, align: "center", weight: "bold", alpha: ease(clamp((tLoc - 4.4) / 1.1)) });
}

// ---------- investigation ----------
export function era_1969(ctx, W, H, tLoc, dur, b) {
  plate(ctx, W, H, tLoc, dur, "sf_street_1960s.jpg", { scrim: 0.24, topScrim: 0.22, move: { zoom: [1.08, 1.24], pan: [0.55, 0.18, 0.10, 0.55] } });
  header(ctx, W, H, tLoc, "THE INVESTIGATION \u00B7 1969", "Why the biggest case of its era stalled");
  const mw = Math.round(W * 0.24), mh = Math.round(mw * 0.82);
  const mx = W - mw - Math.round(W * 0.035), my = Math.round(H * 0.24);
  const mp = ease(clamp((tLoc - 0.6) / 1.3));
  if (mp > 0) {
    ctx.save(); ctx.globalAlpha = 0.94 * mp;
    paper(ctx, mx - 8, my - 8, mw + 16, mh + 16, { alpha: 0.94 * mp });
    bayAreaMap(ctx, mx, my, mw, mh, tLoc, { p: mp, pins: ["sf", "benicia", "vallejo", "napa", "berryessa"] });
    ctx.restore();
  }
  band(ctx, W, H, 0.52, 0.38, 0.46, "full");
  const rows = [
    ["FOUR JURISDICTIONS", "separate files, separate radios, separate records"],
    ["PRE-MODERN FORENSICS", "no DNA testing \u00B7 evidence handling decades old"],
    ["A MOBILE UNKNOWN", "attacked in one county, mailed from another"],
    ["EVIDENCE LOST TO TIME", "consumed, degraded, or misplaced"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.4 - i * 0.65) / 0.8));
    if (p <= 0) return;
    const y = Math.round(H * (0.615 + i * 0.076));
    ctx.save(); ctx.globalAlpha = p;
    text(ctx, r[0], Math.round(W * 0.062), y, Math.round(H * 0.0235), { family: S.mono, color: S.amber, weight: "bold" });
    text(ctx, r[1], Math.round(W * 0.062), y + Math.round(H * 0.035), Math.round(H * 0.021), { family: S.body, color: S.bone });
    ctx.restore();
  });
  creditBR(ctx, W, H, "PERIOD STREET SCENE (CREDITED)");
}

export function dna_2002(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE INVESTIGATION \u00B7 2002", "One partial profile \u2014 and its hard limit");
  const p = ease(clamp((tLoc - 0.9) / 1.2));
  ctx.save(); ctx.globalAlpha = p;
  text(ctx, "SALIVA ON THE BACK OF A LETTER STAMP \u00B7 SFPD LAB, 2002", Math.round(W * 0.135), Math.round(H * 0.32), Math.round(H * 0.020), { family: S.mono, color: S.boneDim, spacing: 1 });
  const rng = RNG(2002);
  for (let i = 0; i < 20; i++) {
    const bx = Math.round(W * 0.135 + i * (W * 0.0355));
    const filled = rng() < 0.45;
    const bh = Math.round(H * (0.06 + rng() * 0.085));
    ctx.fillStyle = filled ? "rgba(217,164,65,0.92)" : "rgba(139,160,180,0.30)";
    ctx.fillRect(bx, Math.round(H * 0.52) - bh, Math.round(W * 0.021), bh);
  }
  text(ctx, "genetic markers recovered (illustrative)", Math.round(W * 0.135), Math.round(H * 0.565), Math.round(H * 0.015), { family: S.mono, color: S.boneFaint, alpha: 0.8 });
  ctx.restore();
  stamp(ctx, "PARTIAL \u2014 NOT FOR DEFINITIVE MATCH", Math.round(W * 0.545), Math.round(H * 0.645), Math.round(H * 0.023), "rgba(224,120,96,0.95)", -0.04, ease(clamp((tLoc - 2.4) / 0.9)));
  const rows = [
    "still useful to EXCLUDE a named person",
    "too few markers to name anyone by itself",
    "genetic genealogy reported as an ongoing avenue \u2014 limits remain",
  ];
  rows.forEach((r, i) => {
    const p2 = ease(clamp((tLoc - 3.1 - i * 0.6) / 0.8));
    if (p2 <= 0) return;
    text(ctx, `\u00B7  ${r}`, Math.round(W * 0.135), Math.round(H * (0.74 + i * 0.055)), Math.round(H * 0.0225), { family: S.body, color: S.bone, alpha: p2 });
  });
}

export function record_recap(ctx, W, H, tLoc, dur, b) {
  plate(ctx, W, H, tLoc, dur, "golden_gate_vintage.jpg", { scrim: 0.20, topScrim: 0.22, move: { zoom: [1.06, 1.20], pan: [0.30, 0.88, 0.56, 0.12] } });
  header(ctx, W, H, tLoc, "THE FULL RECORD", "What fifty years of evidence gives us");
  band(ctx, W, H, 0.26, 0.62, 0.50, "left", 0.46);
  const rows = [
    ["5", "confirmed murders \u00B7 2 survivors \u00B7 1968\u20131969"],
    ["2", "ciphers solved in full \u2014 FBI-confirmed"],
    ["2", "ciphers unsolved \u2014 possibly unsolvable"],
    ["0", "full matches: prints \u00B7 handwriting \u00B7 DNA"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.3 - i * 0.65) / 0.8));
    if (p <= 0) return;
    const y = Math.round(H * (0.385 + i * 0.125));
    ctx.save(); ctx.globalAlpha = p;
    font(ctx, Math.round(H * 0.075), S.serif, "bold");
    ctx.fillStyle = S.amber;
    ctx.fillText(r[0], Math.round(W * 0.085), y + Math.round(H * 0.028));
    font(ctx, Math.round(H * 0.024), S.body, "");
    ctx.fillStyle = S.bone;
    ctx.fillText(r[1], Math.round(W * 0.165), y);
    ctx.restore();
  });
  creditBR(ctx, W, H, "GOLDEN GATE BRIDGE, PERIOD VIEW (CREDITED)");
}

// ---------- verdict ----------
export function verdict_proves(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE VERDICT", "What the evidence proves");
  const rows = [
    "the attacks are documented \u2014 the Zodiac Killer was real",
    "the letters are authentic \u2014 written by the killer",
    "the 408 and the 340 are solved beyond doubt",
    "the ciphers reveal how he thought \u2014 vanity, threat, control",
    "what he withheld: any fact that names a man",
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.2 - i * 0.58) / 0.8));
    if (p <= 0) return;
    listRow(ctx, W, W / 2, Math.round(H * (0.35 + i * 0.092)), Math.round(H * 0.027), "\u2713", "rgba(217,164,65,0.95)", r, p);
  });
  creditBR(ctx, W, H, "EVIDENCE-FIRST \u00B7 NO FINAL REVELATION INVENTED");
}

export function verdict_open(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE VERDICT", "The questions that stay open");
  const rows = [
    ["WHO WROTE THE LETTERS", "no answer, fifty-plus years on"],
    ["THE FINAL 18 CHARACTERS", "meaning, or noise? the record refuses"],
    ["Z13 / Z32", "puzzle, or misdirection? unverifiable"],
    ["RIVERSIDE, 1966", "in the file or not \u2014 disputed"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.2 - i * 0.72) / 0.8));
    if (p <= 0) return;
    const y = Math.round(H * (0.365 + i * 0.115));
    ctx.save(); ctx.globalAlpha = p;
    ctx.strokeStyle = "rgba(234,227,212,0.14)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(Math.round(W * 0.15), y - Math.round(H * 0.042)); ctx.lineTo(Math.round(W * 0.85), y - Math.round(H * 0.042)); ctx.stroke();
    text(ctx, r[0], Math.round(W * 0.16), y, Math.round(H * 0.0255), { family: S.mono, color: S.bone, weight: "bold" });
    text(ctx, r[1], Math.round(W * 0.16), y + Math.round(H * 0.040), Math.round(H * 0.0205), { family: S.body, color: S.boneDim });
    text(ctx, "?", Math.round(W * 0.80), y + Math.round(H * 0.014), Math.round(H * 0.045), { family: S.serif, color: "rgba(224,120,96,0.95)", weight: "bold" });
    ctx.restore();
  });
}

export function closing_fog(ctx, W, H, tLoc, dur, b) {
  plate(ctx, W, H, tLoc, dur, "bay_fog.jpg", { scrim: 0.16, topScrim: 0.10, move: { zoom: [1.20, 1.06], pan: [0.56, 0.12, 0.30, 0.88] } });
  display(ctx, "A killer documented by his own hand.", W / 2, Math.round(H * 0.43), Math.round(H * 0.042), ease(clamp((tLoc - 0.9) / 1.3)), { color: S.bone, weight: "bold" });
  display(ctx, "Twenty letters. Two broken ciphers. A partial print.", W / 2, Math.round(H * 0.52), Math.round(H * 0.027), ease(clamp((tLoc - 1.6) / 1.2)), { color: S.boneDim });
  const p = ease(clamp((tLoc - 1.4) / 1.6));
  display(ctx, "And still, after all this time \u2014 a man with no name.", W / 2, Math.round(H * 0.60), Math.round(H * 0.031), p, { color: S.amber });
  rule(ctx, W / 2, Math.round(H * 0.67), Math.round(W * 0.30), p);
  creditBR(ctx, W, H, "SAN FRANCISCO BAY (CREDITED)");
}

export function end_card(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  crosshair(ctx, W / 2, Math.round(H * 0.30), Math.round(H * 0.062), tLoc, { p: ease(clamp(tLoc / 1.2)), color: "rgba(208,90,60,0.8)" });
  display(ctx, "THE CASE REMAINS OPEN", W / 2, Math.round(H * 0.46), Math.round(H * 0.058), ease(clamp((tLoc - 0.6) / 1.2)), { color: S.bone, weight: "bold" });
  display(ctx, "San Francisco \u00B7 Vallejo \u00B7 Napa County \u00B7 Benicia", W / 2, Math.round(H * 0.545), Math.round(H * 0.024), ease(clamp((tLoc - 1.3) / 1.1)), { color: S.boneDim });
  display(ctx, "Sources in the description \u00B7 Every theory labelled \u00B7 Nothing invented", W / 2, Math.round(H * 0.615), Math.round(H * 0.021), ease(clamp((tLoc - 2.0) / 1.1)), { color: S.boneFaint });
}

// ================= v4 DISPATCHER =================
const SCENES = {
  cold_open_paper, cold_open_years, cold_open_rules, title_card,
  attack_benicia, attack_vallejo, attack_berryessa, attack_presidio, fear_grid,
  letters_three, letters_name, letters_symbol, letters_evidence,
  c408_build, c408_hardens, c408_message, c408_noname, c408_verdict,
  c340_grid, c340_transpose, c340_team, c340_message, c340_compare,
  z13_z32, underdetermined, physical_trail,
  allen_file, allen_excluded, poste_rejected, bias_cycle,
  era_1969, dna_2002, record_recap,
  verdict_proves, verdict_open, closing_fog, end_card,
};

// briefs = the narration-attentive contract (directive §4); drives transitions + vignette
const BRIEFS = JSON.parse(fs.readFileSync(new URL("./scene_briefs.json", import.meta.url), "utf8")).briefs;

function beatTab(ctx, W, H, t, block) {
  const names = {
    1: ["FILE 1 / 8", "THE ATTACKS"], 2: ["FILE 2 / 8", "THE LETTERS"], 3: ["FILE 3 / 8", "THE 408"],
    4: ["FILE 4 / 8", "THE 340"], 5: ["FILE 5 / 8", "WHAT REMAINS UNSOLVED"], 6: ["FILE 6 / 8", "THE SUSPECTS"],
    7: ["FILE 7 / 8", "THE INVESTIGATION"], 8: ["FILE 8 / 8", "THE VERDICT"],
  };
  const n = names[block.beat];
  if (!n) return;
  text(ctx, n[0], Math.round(W * 0.024), Math.round(H * 0.048), Math.round(H * 0.0145), { family: S.mono, color: S.amber, alpha: 0.5, spacing: 2 });
  const lw = textW(ctx, n[1], Math.round(H * 0.0135), S.mono);
  text(ctx, n[1], W - Math.round(W * 0.024) - lw, Math.round(H * 0.048), Math.round(H * 0.0135), { family: S.mono, color: S.boneFaint, alpha: 0.5, spacing: 2 });
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
  const fn = SCENES[b.visual] || cold_open_paper;
  fn(c2d, W, H, tLoc, b.dur, b);
}

const TRANS = 0.9;
export function renderFrame(ctx, W, H, tl, t) {
  FW = W;
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
  if (b.beat > 0 && b.visual !== "end_card") beatTab(ctx, W, H, t, b);
}
