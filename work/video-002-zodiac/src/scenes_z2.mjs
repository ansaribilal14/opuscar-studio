// scenes_z2.mjs — letters + 408 + 340 (video-002)
import {
  PAL as S, photoCard, photoPlate, kicker, display as _display, rule, paper, stamp2,
} from "./film_look.mjs";
import { clamp, ease, easeOut, text, font, textW, RNG } from "./engine.mjs";
import { header, creditBR, chip, quoteBar, cipherGrid, crosshair, listRow, base, stamp } from "./scenes_z1.mjs";

let FW = 1920;
function display(ctx, str, cx, y, size, p, opts = {}) {
  return _display(ctx, str, cx, y, size, p, { maxW: FW * 0.92, ...opts });
}

// ---------- letters ----------
export function letters_three(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE LETTERS", "Three envelopes, three newspapers");
  const specs = [
    ["SF CHRONICLE", "PART 1", "printed 1969-08-01"],
    ["SF EXAMINER", "PART 2", "printed 1969-08-02"],
    ["VALLEJO TIMES-HERALD", "PART 3", "printed 1969-08-02"],
  ];
  specs.forEach((sp, i) => {
    const p = ease(clamp((tLoc - 1.2 - i * 0.6) / 0.9));
    if (p <= 0) return;
    const w = Math.round(W * 0.26), h = Math.round(H * 0.42);
    const x = Math.round(W * 0.085 + i * (w + W * 0.032));
    const y = Math.round(H * 0.27 + (1 - p) * 36);
    // envelope
    ctx.save(); ctx.globalAlpha = p;
    paper(ctx, x, y, w, h, { alpha: p, rot: (i - 1) * 0.012 });
    ctx.strokeStyle = "rgba(234,227,212,0.25)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w / 2, y + h * 0.42); ctx.lineTo(x + w, y); ctx.stroke();
    stamp2(ctx, "CIPHER ENCLOSED", x + w * 0.62, y + h * 0.72, Math.round(H * 0.021), { color: "rgba(208,90,60,0.85)" });
    chip(ctx, sp[0], x + w / 2, y + Math.round(h * 0.16), Math.round(H * 0.0155), { align: "center", color: S.amber, border: "rgba(217,164,65,0.5)" });
    text(ctx, sp[1], x + w / 2, y + Math.round(h * 0.34), Math.round(H * 0.020), { family: S.mono, color: S.ink, align: "center" });
    text(ctx, sp[2], x + w / 2, y + Math.round(h * 0.90), Math.round(H * 0.0145), { family: S.mono, color: S.ink, align: "center", alpha: 0.65 });
    ctx.restore();
  });
  const p = ease(clamp((tLoc - 3.4) / 1.0));
  chip(ctx, "\u201CPRINT THE CIPHER \u2014 OR MORE PEOPLE DIE\u201D (PARAPHRASED DEMAND)", W / 2, Math.round(H * 0.80), Math.round(H * 0.017), { align: "center", color: S.bone, alpha: p });
}

export function letters_name(ctx, W, H, tLoc, dur, b) {
  photoPlate(ctx, W, H, tLoc, dur, "typewriter_keys.jpg", { dim: 0.66, kb: 0.07 });
  const p = ease(clamp((tLoc - 0.7) / 1.1));
  kicker(ctx, "1969-08-04 \u00B7 \u201CDEBUT OF ZODIAC\u201D LETTER", Math.round(W * 0.062), Math.round(H * 0.185), Math.round(H * 0.021));
  const size = Math.round(H * 0.062);
  font(ctx, size, S.mono, "bold");
  const full = "THIS IS THE ZODIAC SPEAKING";
  const n = Math.floor(clamp((tLoc - 1.1) / 1.6) * full.length);
  ctx.fillStyle = S.bone;
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 12;
  const tw = textW(ctx, full, size, S.mono, "bold");
  let cx = W / 2 - tw / 2;
  for (const ch of full.slice(0, n)) { ctx.fillText(ch, cx, Math.round(H * 0.46)); cx += ctx.measureText(ch).width; }
  ctx.shadowBlur = 0;
  rule(ctx, W / 2, Math.round(H * 0.52), Math.round(W * 0.5), ease(clamp((tLoc - 2.4) / 1.0)));
  display(ctx, "The name the killer chose for himself \u2014 on every front page within weeks.", W / 2, Math.round(H * 0.60), Math.round(H * 0.028), ease(clamp((tLoc - 2.9) / 1.1)), { color: S.boneDim });
  creditBR(ctx, W, H, "TYPEWRITER CONTEXT PHOTO \u00B7 LETTER QUOTE DOCUMENTED");
}

export function letters_symbol(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE LETTERS \u00B7 THE SYMBOL", "A gun sight as a signature");
  crosshair(ctx, Math.round(W * 0.30), Math.round(H * 0.48), Math.round(H * 0.14), tLoc, { p: ease(clamp(tLoc / 1.4)) });
  const rows = [
    ["\u224820 LETTERS & CARDS", "1969\u20131974 (CONFIRMED)"],
    ["CLAIMED VICTIMS: 37", "CONFIRMED BY POLICE: 5"],
    ["THREATS \u00B7 TAUNTS \u00B7 CIPHERS", "THEATRE \u2014 CALCULATED"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.7 - i * 0.7) / 0.9));
    if (p <= 0) return;
    const y = Math.round(H * (0.385 + i * 0.13));
    ctx.save(); ctx.globalAlpha = p;
    paper(ctx, Math.round(W * 0.47), y - Math.round(H * 0.05), Math.round(W * 0.44), Math.round(H * 0.105), { alpha: p });
    text(ctx, r[0], Math.round(W * 0.50), y + Math.round(H * 0.006), Math.round(H * 0.027), { family: S.mono, color: i === 1 ? S.red : S.ink, weight: "bold" });
    text(ctx, r[1], Math.round(W * 0.50), y + Math.round(H * 0.043), Math.round(H * 0.018), { family: S.mono, color: S.ink, alpha: 0.72 });
    ctx.restore();
  });
  stamp(ctx, "CLAIM \u2260 CONFIRMED", W - Math.round(W * 0.12), Math.round(H * 0.79), Math.round(H * 0.026), S.red, 0.07, ease(clamp((tLoc - 4.2) / 0.9)));
}

export function letters_evidence(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE LETTERS \u00B7 THE TRAIL", "What twenty envelopes carried");
  const cards = [
    ["HANDWRITING", "block-letter script \u2014 unlike natural writing", "kept for comparison"],
    ["PARTIAL PRINT", "Stine cab door \u2014 partial, searchable", "no match, then or since"],
    ["SALIVA", "stamps & envelope flaps", "awaited DNA technology"],
  ];
  cards.forEach((c, i) => {
    const p = ease(clamp((tLoc - 1.2 - i * 0.8) / 0.9));
    if (p <= 0) return;
    const w = Math.round(W * 0.27), h = Math.round(H * 0.40);
    const x = Math.round(W * 0.085 + i * (w + W * 0.032));
    const y = Math.round(H * 0.30 + (1 - p) * 34);
    ctx.save(); ctx.globalAlpha = p;
    paper(ctx, x, y, w, h, { alpha: p, rot: (i - 1) * 0.012 });
    chip(ctx, c[0], x + w / 2, y + Math.round(h * 0.17), Math.round(H * 0.019), { align: "center", color: S.amber, border: "rgba(217,164,65,0.5)" });
    // simple icon
    const cy = y + Math.round(h * 0.42);
    if (i === 0) { for (let k = 0; k < 5; k++) { const rng = RNG(3 + k); ctx.strokeStyle = "rgba(35,38,46,0.6)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x + w * 0.2, cy - 18 + k * 9); ctx.bezierCurveTo(x + w * 0.38, cy - 26 + k * 9 + rng() * 6, x + w * 0.62, cy - 10 + k * 9, x + w * 0.8, cy - 18 + k * 9); ctx.stroke(); } }
    if (i === 1) { for (let k = 0; k < 7; k++) { ctx.strokeStyle = "rgba(35,38,46,0.55)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x + w / 2, cy, 10 + k * 7, 16 + k * 10, 0, 0, 7); ctx.stroke(); } }
    if (i === 2) { ctx.strokeStyle = "rgba(35,38,46,0.6)"; ctx.lineWidth = 1.4; ctx.strokeRect(x + w * 0.24, cy - 22, w * 0.52, 44); ctx.beginPath(); ctx.moveTo(x + w * 0.24, cy - 22); ctx.lineTo(x + w / 2, cy); ctx.lineTo(x + w * 0.76, cy - 22); ctx.stroke(); }
    text(ctx, c[1], x + w / 2, y + Math.round(h * 0.72), Math.round(H * 0.018), { family: S.body, color: S.ink, align: "center", maxWidth: w * 0.86 });
    text(ctx, c[2], x + w / 2, y + Math.round(h * 0.88), Math.round(H * 0.0155), { family: S.mono, color: S.ink, align: "center", alpha: 0.7 });
    ctx.restore();
  });
}

// ---------- 408 ----------
export function c408_build(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER I \u00B7 THE 408", "A homophonic substitution puzzle");
  cipherGrid(ctx, Math.round(W * 0.07), Math.round(H * 0.30), Math.round(W * 0.50), Math.round(H * 0.50), 24, 10, 408, { p: ease(clamp(tLoc / 2.4)) });
  const rows = [
    ["EVERY LETTER \u2192 1+ SYMBOLS", "frequency patterns flattened"],
    ["MULTIPLE SYMBOLS \u2192 SAME LETTER", "e.g. E gets 5 alternates"],
    ["BUT WORD STRUCTURE SURVIVES", "the crack was always possible"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.9 - i * 0.75) / 0.9));
    if (p <= 0) return;
    chip(ctx, r[0], Math.round(W * 0.635), Math.round(H * (0.345 + i * 0.135)), Math.round(H * 0.018), { color: S.bone, alpha: p });
    text(ctx, r[1], Math.round(W * 0.638), Math.round(H * (0.345 + i * 0.135) + H * 0.042), Math.round(H * 0.0165), { family: S.body, color: S.boneDim, alpha: p });
  });
  chip(ctx, "408 SYMBOLS \u00B7 3 PARTS \u00B7 SENT 1969-07-31", W / 2, Math.round(H * 0.845), Math.round(H * 0.017), { align: "center", alpha: ease(clamp((tLoc - 4.0) / 1.0)) });
  creditBR(ctx, W, H, "GRID: STYLIZED RECONSTRUCTION \u2014 NOT AUTHENTIC GLYPHS");
}

export function c408_hardens(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER I \u00B7 SOLVED IN DAYS", "Donald & Bettye Harden \u00B7 Salinas, CA");
  const p = ease(clamp((tLoc - 0.8) / 1.2));
  ctx.save(); ctx.globalAlpha = p;
  paper(ctx, Math.round(W * 0.14), Math.round(H * 0.28), Math.round(W * 0.72), Math.round(H * 0.36), { alpha: p, rot: -0.006 });
  text(ctx, "A HIGH-SCHOOL SOCIAL SCIENCES TEACHER AND HIS WIFE", Math.round(W * 0.18), Math.round(H * 0.35), Math.round(H * 0.021), { family: S.mono, color: S.amber, spacing: 1.5 });
  text(ctx, "pencil \u00B7 paper \u00B7 one weekend \u00B7 a guess about the killer's words", Math.round(W * 0.18), Math.round(H * 0.425), Math.round(H * 0.030), { family: S.body, color: S.ink });
  text(ctx, "solution published 1969-08-04/05 \u00B7 independently verified by the FBI", Math.round(W * 0.18), Math.round(H * 0.50), Math.round(H * 0.024), { family: S.body, color: S.ink, alpha: 0.72 });
  stamp(ctx, "FBI-CORROBORATED", Math.round(W * 0.70), Math.round(H * 0.575), Math.round(H * 0.026), "rgba(217,164,65,0.9)", -0.05, p);
  ctx.restore();
  const p2 = ease(clamp((tLoc - 2.6) / 1.2));
  chip(ctx, "THE FIRST CIPHER FELL IN 96 HOURS", W / 2, Math.round(H * 0.76), Math.round(H * 0.020), { align: "center", color: S.bone, alpha: p2 });
}

export function c408_message(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  const rng = RNG(9);
  for (let i = 0; i < 26; i++) {
    const x = rng() * W, y = rng() * H, r = 60 + rng() * 160;
    ctx.fillStyle = S.lift; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  header(ctx, W, H, tLoc, "CIPHER I \u00B7 THE MESSAGE", "What the solution actually said");
  const lines = [
    "I LIKE KILLING BECAUSE IT IS SO MUCH FUN.",
    "IT IS MORE FUN THAN KILLING WILD GAME",
    "IN THE FORREST BECAUSE MAN IS THE",
    "MOST DANGEROUE ANIMAL OF ALL.",
  ];
  lines.forEach((ln, i) => {
    const p = clamp((tLoc - 1.5 - i * 0.55) / 0.8);
    ctx.save(); ctx.globalAlpha = ease(p);
    font(ctx, Math.round(H * 0.045), S.mono, "bold");
    ctx.fillStyle = S.bone;
    ctx.fillText(ln, Math.round(W * 0.14), Math.round(H * (0.36 + i * 0.082)));
    ctx.restore();
  });
  quoteBar(ctx, W, H, "The most dangerous animal of all \u2014 the killer's own cipher text, as solved and verified.", "ZODIAC 408 CIPHER \u00B7 SOLUTION CORROBORATED BY FBI", clamp((tLoc - 4.2) / 1.2), 0.87);
}

export function c408_noname(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER I \u00B7 THE WITHHOLDING", "No name \u2014 by the killer's own statement");
  const p = ease(clamp((tLoc - 1.0) / 1.2));
  ctx.save(); ctx.globalAlpha = p;
  paper(ctx, Math.round(W * 0.12), Math.round(H * 0.27), Math.round(W * 0.76), Math.round(H * 0.26), { alpha: p });
  text(ctx, "\u201CI will not give you my name because you will try to", Math.round(W * 0.155), Math.round(H * 0.355), Math.round(H * 0.040), { family: S.serif, color: S.ink, weight: "bold" });
  text(ctx, "slow down or stop my collecting of slaves for my afterlife.\u201D", Math.round(W * 0.155), Math.round(H * 0.43), Math.round(H * 0.040), { family: S.serif, color: S.ink, weight: "bold" });
  text(ctx, "\u2014 ZODIAC 408 CIPHER, PLAINTEXT AS VERIFIED", Math.round(W * 0.155), Math.round(H * 0.495), Math.round(H * 0.0165), { family: S.mono, color: S.ink, alpha: 0.65 });
  ctx.restore();
  // the unresolved 18
  const p2 = clamp((tLoc - 2.7) / 1.3);
  const seq = "EBEORIETEMETHHPITI".split("");
  const size = Math.round(H * 0.052);
  font(ctx, size, S.mono, "bold");
  const gw = seq.length * size * 0.72;
  let x = W / 2 - gw / 2;
  seq.forEach((ch, i) => {
    const a = clamp(p2 * 1.4 - i * 0.055);
    if (a <= 0) { x += size * 0.72; return; }
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(216,222,232,0.85)";
    ctx.strokeStyle = "rgba(234,227,212,0.25)"; ctx.lineWidth = 1.2;
    ctx.strokeRect(x - size * 0.30, Math.round(H * 0.62) - size * 0.52, size * 0.62, size * 0.86);
    ctx.fillText(ch, x, Math.round(H * 0.62) + size * 0.18);
    ctx.restore();
    x += size * 0.72;
  });
  chip(ctx, "FINAL 18 CHARACTERS \u00B7 NEVER RESOLVED \u00B7 MEANING UNKNOWN", W / 2, Math.round(H * 0.775), Math.round(H * 0.017), { align: "center", color: S.amber, alpha: ease(clamp((tLoc - 4.3) / 1.0)) });
}

export function c408_verdict(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER I \u00B7 WHAT IT PROVED", "Not a name \u2014 a behaviour");
  const rows = [
    ["HE WANTED THE STAGE", "publication demanded, front pages got"],
    ["HE WANTED THE GAME", "a solvable cipher \u2014 the taunt had to land"],
    ["HE KEPT THE NAME", "identity withheld by design"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.3 - i * 0.8) / 0.9));
    if (p <= 0) return;
    const y = Math.round(H * (0.38 + i * 0.125));
    ctx.save(); ctx.globalAlpha = p;
    paper(ctx, Math.round(W * 0.16), y - Math.round(H * 0.045), Math.round(W * 0.68), Math.round(H * 0.095), { alpha: p });
    text(ctx, r[0], Math.round(W * 0.19), y + Math.round(H * 0.002), Math.round(H * 0.028), { family: S.mono, color: S.amber, weight: "bold" });
    text(ctx, r[1], Math.round(W * 0.19), y + Math.round(H * 0.042), Math.round(H * 0.021), { family: S.body, color: S.bone });
    ctx.restore();
  });
}

// ---------- 340 ----------
export function c340_grid(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER II \u00B7 THE 340", "Arrived 1969-11-08 \u00B7 San Francisco Chronicle");
  cipherGrid(ctx, Math.round(W * 0.09), Math.round(H * 0.28), Math.round(W * 0.46), Math.round(H * 0.56), 17, 20, 340, { p: ease(clamp(tLoc / 2.8)) });
  const rows = [
    ["NO DIVISIONS \u00B7 NO PARTS", "unlike the 408"],
    ["NO KNOWN OPENING WORDS", "no anchor for a guess"],
    ["51 YEARS UNSOLVED", "1969 \u2192 2020"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.7 - i * 0.8) / 0.9));
    if (p <= 0) return;
    chip(ctx, r[0], Math.round(W * 0.635), Math.round(H * (0.335 + i * 0.135)), Math.round(H * 0.018), { color: i === 2 ? S.amber : S.bone, alpha: p });
    text(ctx, r[1], Math.round(W * 0.638), Math.round(H * (0.335 + i * 0.135) + H * 0.042), Math.round(H * 0.0165), { family: S.body, color: S.boneDim, alpha: p });
  });
  creditBR(ctx, W, H, "GRID: STYLIZED RECONSTRUCTION");
}

export function c340_transpose(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER II \u00B7 WHY IT HELD", "Written, encrypted \u2014 then reordered");
  const p1 = ease(clamp(tLoc / 1.6));
  const g1 = cipherGrid(ctx, Math.round(W * 0.075), Math.round(H * 0.32), Math.round(W * 0.36), Math.round(H * 0.44), 12, 12, 341, { p: p1 });
  text(ctx, "1 \u00B7 WRITTEN GRID", g1.ox + g1.gw / 2, Math.round(H * 0.825), Math.round(H * 0.017), { family: S.mono, color: S.boneDim, align: "center" });
  // diagonal arrows
  const p2 = clamp((tLoc - 1.8) / 1.4);
  if (p2 > 0) {
    ctx.save(); ctx.globalAlpha = ease(p2);
    ctx.strokeStyle = "rgba(217,164,65,0.8)"; ctx.lineWidth = 2.4;
    for (let k = 0; k < 6; k++) {
      const yy = Math.round(H * (0.38 + k * 0.055));
      ctx.beginPath(); ctx.moveTo(Math.round(W * 0.46), yy); ctx.lineTo(Math.round(W * 0.54), yy - 14); ctx.stroke();
      ctx.fillStyle = "rgba(217,164,65,0.8)";
      ctx.beginPath(); ctx.moveTo(Math.round(W * 0.54), yy - 20); ctx.lineTo(Math.round(W * 0.54) + 9, yy - 14); ctx.lineTo(Math.round(W * 0.54), yy - 8); ctx.fill();
    }
    text(ctx, "symbols reordered along diagonals \u00B7 period 19 \u00B7 then flipped 180\u00B0", W / 2, Math.round(H * 0.30), Math.round(H * 0.022), { family: S.body, color: S.amber, align: "center" });
    ctx.restore();
  }
  const p3 = clamp((tLoc - 3.0) / 1.4);
  const g2 = cipherGrid(ctx, Math.round(W * 0.565), Math.round(H * 0.32), Math.round(W * 0.36), Math.round(H * 0.44), 12, 12, 342, { p: p3 });
  text(ctx, "2 \u00B7 WHAT ARRIVED AT THE CHRONICLE", g2.ox + g2.gw / 2, Math.round(H * 0.825), Math.round(H * 0.017), { family: S.mono, color: S.boneDim, align: "center" });
  chip(ctx, "READING ROW BY ROW = NOISE", W / 2, Math.round(H * 0.885), Math.round(H * 0.0165), { align: "center", alpha: ease(clamp((tLoc - 4.4) / 1.0)) });
}

export function c340_team(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER II \u00B7 DECEMBER 2020", "Fifty-one years, three people, one weekend");
  const team = [
    ["DAVID ORANCHAK", "software developer", "studied the ciphers for years"],
    ["SAM BLAKE", "mathematician", "mapped the reordering space"],
    ["JARL VAN EYCKE", "solver builder", "AZdecrypt \u2014 the tool that found it"],
  ];
  team.forEach((tm, i) => {
    const p = ease(clamp((tLoc - 1.2 - i * 0.75) / 0.9));
    if (p <= 0) return;
    const w = Math.round(W * 0.27), h = Math.round(H * 0.34);
    const x = Math.round(W * 0.085 + i * (w + W * 0.032));
    const y = Math.round(H * 0.30 + (1 - p) * 34);
    ctx.save(); ctx.globalAlpha = p;
    paper(ctx, x, y, w, h, { alpha: p, rot: (i - 1) * 0.012 });
    chip(ctx, tm[0], x + w / 2, y + Math.round(h * 0.20), Math.round(H * 0.018), { align: "center", color: S.bone });
    text(ctx, tm[1], x + w / 2, y + Math.round(h * 0.42), Math.round(H * 0.019), { family: S.body, color: S.ink, alpha: 0.85, align: "center" });
    text(ctx, tm[2], x + w / 2, y + Math.round(h * 0.60), Math.round(H * 0.017), { family: S.body, color: S.ink, alpha: 0.72, align: "center", maxWidth: w * 0.84 });
    ctx.restore();
  });
  const p2 = ease(clamp((tLoc - 3.8) / 1.0));
  chip(ctx, "SOLUTION SUBMITTED TO THE FBI \u2014 CONFIRMED", W / 2, Math.round(H * 0.75), Math.round(H * 0.019), { align: "center", color: S.amber, alpha: p2 });
  text(ctx, "solved 2020-12-05 \u00B7 announced publicly within days", W / 2, Math.round(H * 0.80), Math.round(H * 0.0155), { family: S.mono, color: S.boneFaint, align: "center", alpha: p2 });
}

export function c340_message(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  const rng = RNG(11);
  for (let i = 0; i < 30; i++) {
    const x = rng() * W, y = rng() * H, r = 50 + rng() * 150;
    ctx.fillStyle = S.lift; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  header(ctx, W, H, tLoc, "CIPHER II \u00B7 WHAT IT SAID", "The same voice. Still no name.");
  const lines = [
    "I HOPE YOU ARE HAVING LOTS OF FUN",
    "IN TRYING TO CATCH ME ...",
    "I AM NOT AFRAID OF THE GAS CHAMBER",
    "BECAUSE IT WILL SEND ME TO PARADICE",
    "ALL THE SOONER.",
  ];
  lines.forEach((ln, i) => {
    const p = clamp((tLoc - 1.4 - i * 0.5) / 0.8);
    ctx.save(); ctx.globalAlpha = ease(p);
    font(ctx, Math.round(H * 0.042), S.mono, "bold");
    ctx.fillStyle = i === 3 ? S.amber : S.bone;
    ctx.fillText(ln, Math.round(W * 0.155), Math.round(H * (0.34 + i * 0.078)));
    ctx.restore();
  });
  chip(ctx, "MISSPELLED AS THE KILLER HABITUALLY MISSPELLED: P-A-R-A-D-I-C-E", W / 2, Math.round(H * 0.79), Math.round(H * 0.0165), { align: "center", alpha: ease(clamp((tLoc - 4.2) / 1.0)) });
}

export function c340_compare(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE TWO CIPHERS \u00B7 SIDE BY SIDE", "Competent amateur \u2014 not a genius");
  const p1 = ease(clamp(tLoc / 1.5));
  const p2 = clamp((tLoc - 1.2) / 1.5);
  cipherGrid(ctx, Math.round(W * 0.09), Math.round(H * 0.30), Math.round(W * 0.36), Math.round(H * 0.40), 17, 9, 43, { p: p1 });
  cipherGrid(ctx, Math.round(W * 0.55), Math.round(H * 0.30), Math.round(W * 0.36), Math.round(H * 0.40), 17, 20, 44, { p: p2 });
  text(ctx, "408 \u00B7 SOLVED 1969 \u00B7 3 PARTS", Math.round(W * 0.27), Math.round(H * 0.745), Math.round(H * 0.018), { family: S.mono, color: "rgba(217,164,65,0.95)", align: "center", alpha: p1 });
  text(ctx, "340 \u00B7 SOLVED 2020 \u00B7 TRANSPOSED", Math.round(W * 0.73), Math.round(H * 0.745), Math.round(H * 0.018), { family: S.mono, color: "rgba(217,164,65,0.95)", align: "center", alpha: p2 });
  const rows = [
    ["SAME SUBSTITUTION IDEA", "flattened frequencies in both"],
    ["ONE EXTRA TRICK", "diagonal reordering stalled 51 years"],
    ["BOTH CARRIED NO NAME", "identity was never in the ciphers"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 2.6 - i * 0.7) / 0.9));
    if (p <= 0) return;
    chip(ctx, r[0], W / 2 - Math.round(W * 0.005), Math.round(H * (0.80 + i * 0.062)), Math.round(H * 0.0165), { align: "center", color: S.bone, alpha: p });
    text(ctx, r[1], W / 2 + Math.round(W * 0.14), Math.round(H * (0.80 + i * 0.062)), Math.round(H * 0.0155), { family: S.body, color: S.boneDim, align: "left", alpha: p });
  });
}
