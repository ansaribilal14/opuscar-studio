// scenes_z2v4.mjs — v4: letters + 408 + 340 (directive §2/§7, RC3/RC6)
// Editorial rule: artifacts (envelopes, quote cards, grids) may be paper — but ONE
// composition per scene, bigger type, no card rows. Cipher grids: ink on paper or
// bright glyphs on dark, always legible.
import {
  PAL as S, kicker, display as _display, rule, paper, stamp2,
} from "./film_look.mjs";
import { clamp, ease, easeOut, text, font, textW, RNG } from "./engine.mjs";
import { plate, band, inkGrid } from "./comp_modes.mjs";
import { header, creditBR, chip, quoteBar, cipherGrid, crosshair, base, stamp } from "./scenes_z1.mjs";

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
    const p = ease(clamp((tLoc - 1.1 - i * 0.55) / 0.85));
    if (p <= 0) return;
    const w = Math.round(W * 0.275), h = Math.round(H * 0.44);
    const x = Math.round(W * 0.062 + i * (w + W * 0.028));
    const y = Math.round(H * 0.265 + (1 - p) * 36 + (i === 1 ? -H * 0.018 : 0));
    ctx.save(); ctx.globalAlpha = p;
    paper(ctx, x, y, w, h, { alpha: p, rot: (i - 1) * 0.018 });
    ctx.strokeStyle = "rgba(234,227,212,0.25)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w / 2, y + h * 0.40); ctx.lineTo(x + w, y); ctx.stroke();
    stamp2(ctx, "CIPHER ENCLOSED", x + w * 0.62, y + h * 0.70, Math.round(H * 0.021), { color: "rgba(208,90,60,0.85)" });
    chip(ctx, sp[0], x + w / 2, y + Math.round(h * 0.16), Math.round(H * 0.0155), { align: "center", color: S.amber, border: "rgba(217,164,65,0.5)" });
    text(ctx, sp[1], x + w / 2, y + Math.round(h * 0.33), Math.round(H * 0.022), { family: S.mono, color: S.ink, align: "center" });
    text(ctx, sp[2], x + w / 2, y + Math.round(h * 0.90), Math.round(H * 0.0155), { family: S.mono, color: S.ink, align: "center", alpha: 0.65 });
    ctx.restore();
  });
  quoteBar(ctx, W, H, "Print it on your front page, or more people die.", "DEMAND PARAPHRASED FROM THE JULY 31 LETTERS \u00B7 E3", ease(clamp((tLoc - 3.2) / 1.0)), 0.84);
}

export function letters_name(ctx, W, H, tLoc, dur, b) {
  // v4 frame-review fix #2: typewriter_keys.jpg is a WATERMARKED stock preview
  // (Unsplash+ tiles visible at full size) — rejected per directive §6. Replaced
  // with a close crop of the credited period newsroom photo (b0a used the wide view).
  plate(ctx, W, H, tLoc, dur, "press_room.jpg", { mode: "close", focus: [0.38, 0.62], scrim: 0.26, topScrim: 0.22 });
  kicker(ctx, "1969-08-04 \u00B7 \u201CDEBUT OF ZODIAC\u201D LETTER", Math.round(W * 0.062), Math.round(H * 0.185), Math.round(H * 0.021));
  // contrast band BEFORE the typed line (frame-review fix)
  band(ctx, W, H, 0.355, 0.20, 0.34);
  const p = ease(clamp((tLoc - 0.7) / 1.1));
  const size = Math.round(H * 0.064);
  font(ctx, size, S.mono, "bold");
  const full = "THIS IS THE ZODIAC SPEAKING";
  const n = Math.floor(clamp((tLoc - 1.1) / 1.6) * full.length);
  ctx.fillStyle = S.bone;
  ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 12;
  const tw = textW(ctx, full, size, S.mono, "bold");
  let cx = W / 2 - tw / 2;
  for (const ch of full.slice(0, n)) { ctx.fillText(ch, cx, Math.round(H * 0.475)); cx += ctx.measureText(ch).width; }
  ctx.shadowBlur = 0;
  rule(ctx, W / 2, Math.round(H * 0.53), Math.round(W * 0.5), ease(clamp((tLoc - 2.4) / 1.0)));
  display(ctx, "The name the killer chose for himself \u2014 on every front page within weeks.", W / 2, Math.round(H * 0.615), Math.round(H * 0.028), ease(clamp((tLoc - 2.9) / 1.1)), { color: S.bone });
  creditBR(ctx, W, H, "PERIOD NEWSROOM PHOTO (CREDITED) \u00B7 LETTER QUOTE DOCUMENTED");
}

export function letters_symbol(ctx, W, H, tLoc, dur, b) {
  plate(ctx, W, H, tLoc, dur, "sf_night_1960s.jpg", { scrim: 0.26, topScrim: 0.22 });
  header(ctx, W, H, tLoc, "THE LETTERS \u00B7 THE SYMBOL", "A gun sight as a signature");
  crosshair(ctx, Math.round(W * 0.26), Math.round(H * 0.50), Math.round(H * 0.145), tLoc, { p: ease(clamp(tLoc / 1.4)) });
  band(ctx, W, H, 0.56, 0.30, 0.44, "right", 0.56);
  const rows = [
    ["\u224820 LETTERS & CARDS", "1969\u20131974 (CONFIRMED)"],
    ["CLAIMED VICTIMS: 37", "CONFIRMED BY POLICE: 5"],
    ["THREATS \u00B7 TAUNTS \u00B7 CIPHERS", "THEATRE \u2014 CALCULATED"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.7 - i * 0.65) / 0.8));
    if (p <= 0) return;
    const y = Math.round(H * (0.635 + i * 0.085));
    ctx.save(); ctx.globalAlpha = p;
    text(ctx, r[0], Math.round(W * 0.50), y, Math.round(H * 0.027), { family: S.mono, color: i === 1 ? "rgba(228,132,104,0.98)" : S.bone, weight: "bold" });
    text(ctx, r[1], Math.round(W * 0.50), y + Math.round(H * 0.038), Math.round(H * 0.019), { family: S.mono, color: "rgba(226,220,206,0.85)" });
    ctx.restore();
  });
  stamp(ctx, "CLAIM \u2260 CONFIRMED", W - Math.round(W * 0.115), Math.round(H * 0.30), Math.round(H * 0.026), "rgba(224,120,96,0.95)", 0.06, ease(clamp((tLoc - 4.0) / 0.9)));
  creditBR(ctx, W, H, "PERIOD NIGHT STREET (CREDITED)");
}

export function letters_evidence(ctx, W, H, tLoc, dur, b) {
  plate(ctx, W, H, tLoc, dur, "envelope_stamp.jpg", { mode: "close", focus: [0.5, 0.48], scrim: 0.20, topScrim: 0.20 });
  header(ctx, W, H, tLoc, "THE LETTERS \u00B7 THE TRAIL", "What twenty envelopes carried");
  band(ctx, W, H, 0.66, 0.26, 0.48);
  const cards = ["HANDWRITING \u00B7 block capitals", "PARTIAL PRINT \u00B7 Stine cab door", "SALIVA \u00B7 stamps & flaps"];
  cards.forEach((c, i) => {
    const p = ease(clamp((tLoc - 1.2 - i * 0.7) / 0.8));
    if (p <= 0) return;
    const x = Math.round(W * (0.062 + i * 0.30));
    ctx.save(); ctx.globalAlpha = p;
    text(ctx, c, x, Math.round(H * 0.775), Math.round(H * 0.024), { family: S.mono, color: S.amber, weight: "bold" });
    const subs = ["kept for comparison", "searchable, never matched", "awaited DNA technology"];
    text(ctx, subs[i], x, Math.round(H * 0.825), Math.round(H * 0.020), { family: S.body, color: S.bone });
    ctx.restore();
  });
  creditBR(ctx, W, H, "STAMP MACRO (CREDITED) \u2014 SALIVA PRESERVED FROM 1969");
}

// ---------- 408 ----------
export function c408_build(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER I \u00B7 THE 408", "A homophonic substitution puzzle");
  // the 408 as a physical artifact: large paper plate, ink grid (RC6)
  const p = ease(clamp(tLoc / 1.0));
  const px = Math.round(W * 0.062), py = Math.round(H * 0.245 + (1 - p) * 30);
  const pw = Math.round(W * 0.52), ph = Math.round(H * 0.60);
  paper(ctx, px, py, pw, ph, { alpha: p, rot: -0.006 });
  inkGrid(ctx, px + Math.round(pw * 0.07), py + Math.round(ph * 0.09), Math.round(pw * 0.86), Math.round(ph * 0.74), 24, 10, 408, { p: ease(clamp((tLoc - 0.7) / 2.8)) });
  text(ctx, "STYLIZED RECONSTRUCTION \u2014 NOT AUTHENTIC GLYPHS", px + pw / 2, py + ph - Math.round(H * 0.018), Math.round(H * 0.014), { family: S.mono, color: S.ink, align: "center", alpha: 0.75 });
  const rows = [
    ["EVERY LETTER \u2192 1+ SYMBOLS", "frequency patterns flattened"],
    ["MULTIPLE SYMBOLS \u2192 SAME LETTER", "e.g. E gets 5 alternates"],
    ["BUT WORD STRUCTURE SURVIVES", "the crack was always possible"],
  ];
  rows.forEach((r, i) => {
    const pp = ease(clamp((tLoc - 1.9 - i * 0.7) / 0.8));
    if (pp <= 0) return;
    text(ctx, r[0], Math.round(W * 0.645), Math.round(H * (0.335 + i * 0.125)), Math.round(H * 0.024), { family: S.mono, color: S.bone, weight: "bold", alpha: pp });
    text(ctx, r[1], Math.round(W * 0.645), Math.round(H * (0.335 + i * 0.125) + H * 0.040), Math.round(H * 0.020), { family: S.body, color: S.boneDim, alpha: pp });
  });
  chip(ctx, "408 SYMBOLS \u00B7 3 PARTS \u00B7 SENT 1969-07-31", W / 2, Math.round(H * 0.905), Math.round(H * 0.017), { align: "center", alpha: ease(clamp((tLoc - 4.0) / 1.0)) });
}

export function c408_hardens(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER I \u00B7 SOLVED IN DAYS", "Donald & Bettye Harden \u00B7 Salinas, CA");
  const p = ease(clamp((tLoc - 0.8) / 1.2));
  ctx.save(); ctx.globalAlpha = p;
  paper(ctx, Math.round(W * 0.14), Math.round(H * 0.27), Math.round(W * 0.72), Math.round(H * 0.38), { alpha: p, rot: -0.006 });
  text(ctx, "A HIGH-SCHOOL SOCIAL SCIENCES TEACHER AND HIS WIFE", Math.round(W * 0.18), Math.round(H * 0.345), Math.round(H * 0.022), { family: S.mono, color: "rgba(150,110,40,0.95)", spacing: 1.5 });
  text(ctx, "pencil \u00B7 paper \u00B7 one weekend \u00B7 a guess about the killer's words", Math.round(W * 0.18), Math.round(H * 0.435), Math.round(H * 0.032), { family: S.body, color: S.ink });
  text(ctx, "solution published 1969-08-04/05 \u00B7 independently verified by the FBI", Math.round(W * 0.18), Math.round(H * 0.515), Math.round(H * 0.025), { family: S.body, color: S.ink, alpha: 0.72 });
  stamp(ctx, "FBI-CORROBORATED", Math.round(W * 0.70), Math.round(H * 0.585), Math.round(H * 0.026), "rgba(170,120,40,0.9)", -0.05, p);
  ctx.restore();
  const p2 = ease(clamp((tLoc - 2.6) / 1.2));
  chip(ctx, "THE FIRST CIPHER FELL IN 96 HOURS", W / 2, Math.round(H * 0.775), Math.round(H * 0.020), { align: "center", color: S.bone, alpha: p2 });
}

export function c408_message(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER I \u00B7 THE MESSAGE", "What the solution actually said");
  const lines = [
    "I LIKE KILLING BECAUSE IT IS SO MUCH FUN.",
    "IT IS MORE FUN THAN KILLING WILD GAME",
    "IN THE FORREST BECAUSE MAN IS THE",
    "MOST DANGEROUE ANIMAL OF ALL.",
  ];
  lines.forEach((ln, i) => {
    const p = clamp((tLoc - 1.4 - i * 0.5) / 0.8);
    ctx.save(); ctx.globalAlpha = ease(p);
    font(ctx, Math.round(H * 0.047), S.mono, "bold");
    ctx.fillStyle = S.bone;
    ctx.fillText(ln, Math.round(W * 0.13), Math.round(H * (0.355 + i * 0.085)));
    ctx.restore();
  });
  quoteBar(ctx, W, H, "The most dangerous animal of all \u2014 the killer's own cipher text, as solved and verified.", "ZODIAC 408 CIPHER \u00B7 SOLUTION CORROBORATED BY FBI", clamp((tLoc - 3.9) / 1.2), 0.87);
}

export function c408_noname(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER I \u00B7 THE WITHHOLDING", "No name \u2014 by the killer's own statement");
  const p = ease(clamp((tLoc - 1.0) / 1.2));
  ctx.save(); ctx.globalAlpha = p;
  paper(ctx, Math.round(W * 0.12), Math.round(H * 0.255), Math.round(W * 0.76), Math.round(H * 0.26), { alpha: p });
  text(ctx, "\u201CI will not give you my name because you will try to", Math.round(W * 0.155), Math.round(H * 0.345), Math.round(H * 0.042), { family: S.serif, color: S.ink, weight: "bold" });
  text(ctx, "slow down or stop my collecting of slaves for my afterlife.\u201D", Math.round(W * 0.155), Math.round(H * 0.425), Math.round(H * 0.042), { family: S.serif, color: S.ink, weight: "bold" });
  text(ctx, "\u2014 ZODIAC 408 CIPHER, PLAINTEXT AS VERIFIED", Math.round(W * 0.155), Math.round(H * 0.485), Math.round(H * 0.017), { family: S.mono, color: S.ink, alpha: 0.65 });
  ctx.restore();
  // the unresolved 18 — ink boxes on a paper strip (legible this time)
  const p2 = clamp((tLoc - 2.7) / 1.3);
  if (p2 > 0) {
    const seq = "EBEORIETEMETHHPITI".split("");
    const size = Math.round(H * 0.055);
    const gw = seq.length * size * 0.74;
    const sx = W / 2 - gw / 2, sy = Math.round(H * 0.60);
    ctx.save(); ctx.globalAlpha = clamp(p2 * 1.2);
    paper(ctx, sx - Math.round(size * 0.5), sy - Math.round(size * 0.75), gw + size, size * 1.6, { alpha: clamp(p2 * 1.2) });
    ctx.restore();
    font(ctx, size, S.mono, "bold");
    let x = sx;
    seq.forEach((ch, i) => {
      const a = clamp(p2 * 1.4 - i * 0.055);
      if (a <= 0) { x += size * 0.74; return; }
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(35,32,26,0.95)";
      ctx.strokeStyle = "rgba(110,100,80,0.6)"; ctx.lineWidth = 1.2;
      ctx.strokeRect(x - size * 0.28, sy - size * 0.48, size * 0.58, size * 0.84);
      ctx.fillText(ch, x, sy + size * 0.20);
      ctx.restore();
      x += size * 0.74;
    });
  }
  chip(ctx, "FINAL 18 CHARACTERS \u00B7 NEVER RESOLVED \u00B7 MEANING UNKNOWN", W / 2, Math.round(H * 0.79), Math.round(H * 0.017), { align: "center", color: S.amber, alpha: ease(clamp((tLoc - 4.3) / 1.0)) });
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
    const p = ease(clamp((tLoc - 1.2 - i * 0.75) / 0.8));
    if (p <= 0) return;
    const y = Math.round(H * (0.39 + i * 0.125));
    ctx.save(); ctx.globalAlpha = p;
    ctx.fillStyle = S.amber;
    ctx.fillRect(Math.round(W * 0.17), y - Math.round(H * 0.022), Math.round(H * 0.008), Math.round(H * 0.046));
    text(ctx, r[0], Math.round(W * 0.20), y, Math.round(H * 0.030), { family: S.mono, color: S.amber, weight: "bold" });
    text(ctx, r[1], Math.round(W * 0.20), y + Math.round(H * 0.045), Math.round(H * 0.023), { family: S.body, color: S.bone });
    ctx.restore();
  });
}

// ---------- 340 ----------
export function c340_grid(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER II \u00B7 THE 340", "Arrived 1969-11-08 \u00B7 San Francisco Chronicle");
  cipherGrid(ctx, Math.round(W * 0.065), Math.round(H * 0.24), Math.round(W * 0.50), Math.round(H * 0.62), 17, 20, 340, { p: ease(clamp(tLoc / 2.8)) });
  const rows = [
    ["NO DIVISIONS \u00B7 NO PARTS", "unlike the 408"],
    ["NO KNOWN OPENING WORDS", "no anchor for a guess"],
    ["51 YEARS UNSOLVED", "1969 \u2192 2020"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 1.7 - i * 0.75) / 0.8));
    if (p <= 0) return;
    text(ctx, r[0], Math.round(W * 0.635), Math.round(H * (0.335 + i * 0.125)), Math.round(H * 0.024), { family: S.mono, color: i === 2 ? S.amber : S.bone, weight: "bold", alpha: p });
    text(ctx, r[1], Math.round(W * 0.635), Math.round(H * (0.335 + i * 0.125) + H * 0.040), Math.round(H * 0.020), { family: S.body, color: S.boneDim, alpha: p });
  });
  creditBR(ctx, W, H, "GRID: STYLIZED RECONSTRUCTION");
}

export function c340_transpose(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "CIPHER II \u00B7 WHY IT HELD", "Written, encrypted \u2014 then reordered");
  const p1 = ease(clamp(tLoc / 1.6));
  const g1 = cipherGrid(ctx, Math.round(W * 0.075), Math.round(H * 0.32), Math.round(W * 0.36), Math.round(H * 0.44), 12, 12, 341, { p: p1 });
  text(ctx, "1 \u00B7 WRITTEN GRID", g1.ox + g1.gw / 2, Math.round(H * 0.825), Math.round(H * 0.017), { family: S.mono, color: S.boneDim, align: "center" });
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
  header(ctx, W, H, tLoc, "CIPHER II \u00B7 DECEMBER 2020", "Fifty-one years, three people, one team");
  // one shared baseline rule — no three-paper-cards template (RC3)
  rule(ctx, W / 2, Math.round(H * 0.475), Math.round(W * 0.80), ease(clamp((tLoc - 0.9) / 1.0)), { thick: 2 });
  const team = [
    ["DAVID ORANCHAK", "studied the ciphers for years"],
    ["SAM BLAKE", "mathematician \u00B7 mapped the reordering space"],
    ["JARL VAN EYCKE", "built AZdecrypt \u2014 the solver that found it"],
  ];
  team.forEach((tm, i) => {
    const p = ease(clamp((tLoc - 1.2 - i * 0.7) / 0.85));
    if (p <= 0) return;
    const cx = Math.round(W * (0.235 + i * 0.265));
    ctx.save(); ctx.globalAlpha = p;
    font(ctx, Math.round(H * 0.036), S.mono, "bold");
    ctx.fillStyle = S.bone; ctx.textAlign = "center";
    ctx.fillText(tm[0], cx, Math.round(H * 0.40));
    ctx.textAlign = "left";
    text(ctx, tm[1], cx - Math.round(W * 0.115), Math.round(H * 0.545), Math.round(H * 0.021), { family: S.body, color: S.boneDim, align: "center", maxWidth: Math.round(W * 0.23) });
    ctx.restore();
  });
  const p2 = ease(clamp((tLoc - 3.6) / 1.0));
  chip(ctx, "SOLUTION CONFIRMED BY THE FBI \u00B7 SOLVED 2020-12-05", W / 2, Math.round(H * 0.72), Math.round(H * 0.019), { align: "center", color: S.amber, alpha: p2 });
  stamp(ctx, "FBI-CONFIRMED", W - Math.round(W * 0.12), Math.round(H * 0.855), Math.round(H * 0.024), "rgba(217,164,65,0.9)", -0.05, p2);
}

export function c340_message(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
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
    font(ctx, Math.round(H * 0.043), S.mono, "bold");
    ctx.fillStyle = i === 3 ? S.amber : S.bone;
    ctx.fillText(ln, Math.round(W * 0.145), Math.round(H * (0.335 + i * 0.082)));
    ctx.restore();
  });
  chip(ctx, "MISSPELLED AS THE KILLER HABITUALLY MISSPELLED: P-A-R-A-D-I-C-E", W / 2, Math.round(H * 0.795), Math.round(H * 0.0165), { align: "center", alpha: ease(clamp((tLoc - 4.2) / 1.0)) });
}

export function c340_compare(ctx, W, H, tLoc, dur, b) {
  base(ctx, W, H, tLoc);
  header(ctx, W, H, tLoc, "THE TWO CIPHERS \u00B7 SIDE BY SIDE", "Competent amateur \u2014 not a genius");
  const p1 = ease(clamp(tLoc / 1.5));
  const p2 = clamp((tLoc - 1.2) / 1.5);
  cipherGrid(ctx, Math.round(W * 0.085), Math.round(H * 0.285), Math.round(W * 0.37), Math.round(H * 0.42), 17, 9, 43, { p: p1 });
  cipherGrid(ctx, Math.round(W * 0.545), Math.round(H * 0.285), Math.round(W * 0.37), Math.round(H * 0.42), 17, 20, 44, { p: p2 });
  text(ctx, "408 \u00B7 SOLVED 1969 \u00B7 3 PARTS", Math.round(W * 0.27), Math.round(H * 0.755), Math.round(H * 0.018), { family: S.mono, color: "rgba(217,164,65,0.95)", align: "center", alpha: p1 });
  text(ctx, "340 \u00B7 SOLVED 2020 \u00B7 TRANSPOSED", Math.round(W * 0.73), Math.round(H * 0.755), Math.round(H * 0.018), { family: S.mono, color: "rgba(217,164,65,0.95)", align: "center", alpha: p2 });
  const rows = [
    ["SAME SUBSTITUTION IDEA", "flattened frequencies in both"],
    ["ONE EXTRA TRICK", "diagonal reordering stalled 51 years"],
    ["BOTH CARRIED NO NAME", "identity was never in the ciphers"],
  ];
  rows.forEach((r, i) => {
    const p = ease(clamp((tLoc - 2.6 - i * 0.65) / 0.8));
    if (p <= 0) return;
    text(ctx, `${r[0]}  \u2014  ${r[1]}`, W / 2, Math.round(H * (0.815 + i * 0.055)), Math.round(H * 0.0195), { family: S.body, color: S.boneDim, align: "center", alpha: p });
  });
}
