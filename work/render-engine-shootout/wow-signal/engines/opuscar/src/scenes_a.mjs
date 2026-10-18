// scenes_a.mjs — SC01..SC12 (cold open → two horns). All times are absolute program time.
import { PAL, fnt, prng, easeOut, clamp01, lerp, bg, vignette, starfield, grain,
         reconLabel, chip, displayText, paragraph, wrap, kenBurns, fadeIn, fadeOut,
         transitArch } from "./support.mjs";

const P = { ...PAL };

// SC01 cold-open pulse (b01): starfield + beam-transit arch + date line
export function SC01(ctx, W, H, t, win) {
  bg(ctx, W, H); starfield(ctx, W, H, t, 7, 5);
  const p = easeOut(clamp01((t - win.start - 3) / 12));
  transitArch(ctx, W * 0.16, H * 0.62, W * 0.68, H * 0.30, p);
  displayText(ctx, W / 2, H * 0.20, "AUGUST 15, 1977", 44, PAL.dim, 8, "body");
  displayText(ctx, W / 2, H * 0.27, "11:16 P.M. EDT", 34, "rgba(143,160,184,0.7)", 8, "body");
  chip(ctx, 60, 60, "THE UNCLOSED FILE", PAL.crimson);
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC02 printout tease (b02): six characters type on, red circle draws
export function SC02(ctx, W, H, t, win) {
  bg(ctx, W, H);
  const chars = ["6", "E", "Q", "U", "J", "5"];
  const size = 190;
  const startX = W / 2 - (chars.length * 150) / 2 + 40;
  ctx.font = fnt("mono", size); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  chars.forEach((c, i) => {
    const a = easeOut(clamp01((t - win.start - 0.5 - i * 0.55) / 0.4));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    ctx.fillStyle = i === 3 ? PAL.signal : PAL.ink;
    ctx.fillText(c, startX + i * 150, H * 0.44);
    ctx.globalAlpha = 1;
  });
  const cp = easeOut(clamp01((t - win.start - 3.6) / 2.0));
  if (cp > 0) {
    ctx.strokeStyle = PAL.crimson; ctx.lineWidth = 9; ctx.globalAlpha = 0.92;
    ctx.beginPath();
    const ex = 2.6 * Math.PI * cp;
    for (let a = 0; a <= ex; a += 0.05) {
      const rx = 420 + 24 * Math.sin(a * 2.1), ry = 150 + 18 * Math.cos(a * 1.7);
      const x = W / 2 - 12 + Math.cos(a) * rx;
      const y = H * 0.44 + Math.sin(a) * ry;
      a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.globalAlpha = 1;
  }
  const wp = easeOut(clamp01((t - win.start - 5.2) / 1.4));
  if (wp > 0) {
    ctx.font = "italic 150px 'DejaVu Sans'"; ctx.fillStyle = PAL.crimson;
    ctx.textAlign = "left";
    const n = Math.max(1, Math.round(wp * 4));
    ctx.fillText("Wow!".slice(0, n), W * 0.155, H * 0.47);
  }
  reconLabel(ctx, W, H, "PRINTOUT SCAN — WIKIMEDIA COMMONS");
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC03 title card (b03)
export function SC03(ctx, W, H, t, win) {
  bg(ctx, W, H); starfield(ctx, W, H, t * 0.4, 21, 2);
  const a = easeOut(clamp01((t - win.start) / 1.2));
  ctx.globalAlpha = a;
  displayText(ctx, W / 2, H * 0.40, "THE WOW! SIGNAL", 128, PAL.ink, 10);
  ctx.fillStyle = PAL.crimson; ctx.fillRect(W * 0.30, H * 0.47, W * 0.40, 5);
  displayText(ctx, W / 2, H * 0.545, "72 SECONDS FROM DEEP SPACE", 52, PAL.dim, 8, "body");
  displayText(ctx, W / 2, H * 0.70, "THE UNCLOSED FILE", 36, PAL.crimson, 12, "body");
  ctx.globalAlpha = 1;
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC04 telescope diagram (b04) — labelled elevation schematic
export function SC04(ctx, W, H, t, win) {
  bg(ctx, W, H);
  const cx = W / 2, gy = H * 0.78;
  const reveal = easeOut(clamp01((t - win.start - 0.8) / 5));
  ctx.strokeStyle = PAL.dim; ctx.lineWidth = 3;
  // ground plane
  ctx.globalAlpha = easeOut(clamp01((t - win.start - 0.5) / 1));
  ctx.strokeRect(cx - 420, gy - 6, 840, 10);
  // flat reflector (tilted, left) + paraboloid (right) + beam path
  const fa = lerp(0.55, 0.40, reveal);
  ctx.save(); ctx.translate(cx - 300, gy - 230); ctx.rotate(fa);
  ctx.fillStyle = "#141d33"; ctx.strokeStyle = PAL.ink;
  ctx.fillRect(-190, -9, 380, 18); ctx.strokeRect(-190, -9, 380, 18);
  ctx.restore();
  ctx.beginPath(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5;
  ctx.arc(cx + 240, gy + 40, 300, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke();
  // signal path: sky -> flat -> paraboloid -> feed
  if (reveal > 0.4) {
    ctx.strokeStyle = PAL.signal; ctx.setLineDash([12, 10]); ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 300, gy - 480);
    ctx.lineTo(cx - 300, gy - 230);
    ctx.lineTo(cx + 240, gy - 200);
    ctx.lineTo(cx + 240, gy - 130);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  const lbl = (x, y, s, al = "left") => {
    ctx.font = fnt("body", 30); ctx.fillStyle = PAL.dim; ctx.textAlign = al;
    ctx.fillText(s, x, y);
  };
  if (reveal > 0.55) lbl(cx - 300, gy - 260, "TILTABLE FLAT REFLECTOR", "center");
  if (reveal > 0.7) lbl(cx + 330, gy - 390, "FIXED PARABOLOIDAL REFLECTOR", "center");
  if (reveal > 0.85) lbl(cx - 420, gy + 60, "STEEL GROUND PLANE");
  displayText(ctx, W / 2, H * 0.16, "BIG EAR — OHIO STATE UNIVERSITY RADIO OBSERVATORY", 40, PAL.ink, 4, "body");
  reconLabel(ctx, W, H); vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC05 earth-rotation sweep (b05)
export function SC05(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.16, "THE SKY SWEEPS — THE TELESCOPE NEVER MOVES", 40, PAL.ink, 4, "body");
  const x0 = W * 0.12, x1 = W * 0.88, y0 = H * 0.42, y1 = H * 0.72;
  ctx.strokeStyle = PAL.dim; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  const p = clamp01((t - win.start - 1) / (win.end - win.start - 3));
  const bx = lerp(x0, x1 - 160, p);
  ctx.fillStyle = "rgba(88,199,240,0.14)"; ctx.fillRect(bx, y0, 160, y1 - y0);
  ctx.strokeStyle = PAL.cyan; ctx.strokeRect(bx, y0, 160, y1 - y0);
  ctx.font = fnt("body", 30); ctx.fillStyle = PAL.dim; ctx.textAlign = "center";
  ctx.fillText("BEAM · 72 s PER SKY POINT", bx + 80, y1 + 46);
  // clock
  ctx.font = fnt("mono", 64); ctx.fillStyle = PAL.signal; ctx.textAlign = "center";
  ctx.fillText(`T+${String(Math.floor(p * 72)).padStart(2, "0")}s`, W / 2, H * 0.88);
  const rnd = prng(41);
  for (let i = 0; i < 40; i++) {
    const sx = x0 + rnd() * (x1 - x0), sy = y0 + 20 + rnd() * (y1 - y0 - 40);
    const lit = sx > bx && sx < bx + 160;
    ctx.fillStyle = lit ? PAL.signal : "rgba(244,242,236,0.35)";
    ctx.beginPath(); ctx.arc(sx, sy, lit ? 4 : 2.2, 0, Math.PI * 2); ctx.fill();
  }
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC06 survey numbers (b06)
export function SC06(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.18, "THE OHIO SKY SURVEY", 56, PAL.ink, 6);
  const cards = [
    ["~20,000", "RADIO SOURCES CATALOGUED"],
    ["2", "MOST DISTANT QUASARS THEN KNOWN"],
    ["1972", "NSF FUNDING CUT — TEAM LET GO"],
  ];
  cards.forEach(([big, small], i) => {
    const a = easeOut(clamp01((t - win.start - 1 - i * 1.6) / 1));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    const cw = 420, ch = 300, x = W / 2 + (i - 1) * (cw + 60) - cw / 2, y = H * 0.36;
    ctx.fillStyle = PAL.panel; ctx.fillRect(x, y, cw, ch);
    ctx.strokeStyle = "rgba(143,160,184,0.35)"; ctx.strokeRect(x, y, cw, ch);
    ctx.font = fnt("mono", 84); ctx.fillStyle = i === 2 ? PAL.warn : PAL.signal;
    ctx.textAlign = "center"; ctx.fillText(big, x + cw / 2, y + 120);
    ctx.font = fnt("body", 28); ctx.fillStyle = PAL.dim;
    const lines = wrap(ctx, small, cw - 60, 28);
    lines.forEach((l, j) => ctx.fillText(l, x + cw / 2, y + 180 + j * 36));
    ctx.globalAlpha = 1;
  });
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC07 narrowband machine (b07)
export function SC07(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.15, "N50CH — THE NARROWBAND SEARCH", 44, PAL.ink, 4, "body");
  // console + printer schematic
  const a = easeOut(clamp01((t - win.start - 0.6) / 1.2));
  ctx.globalAlpha = a;
  ctx.fillStyle = PAL.panel; ctx.fillRect(W * 0.12, H * 0.26, W * 0.34, H * 0.42);
  ctx.strokeStyle = "rgba(143,160,184,0.4)"; ctx.strokeRect(W * 0.12, H * 0.26, W * 0.34, H * 0.42);
  ctx.font = fnt("mono", 34); ctx.fillStyle = PAL.signal; ctx.textAlign = "left";
  ctx.fillText("IBM 1130", W * 0.15, H * 0.33);
  // printer paper with channel rows
  ctx.fillStyle = PAL.beige; ctx.fillRect(W * 0.54, H * 0.24, W * 0.34, H * 0.5);
  ctx.fillStyle = "#111";
  const rnd = prng(77);
  const rows = 12, cols = 24;
  const printed = Math.floor(clamp01((t - win.start - 1.4) / 6) * rows);
  for (let r = 0; r < printed; r++) {
    for (let c = 0; c < cols; c++) {
      const v = rnd();
      const ch = v > 0.93 ? String(Math.floor(rnd() * 9) + 1) : v > 0.86 ? "1" : " ";
      ctx.font = fnt("mono", 26);
      ctx.fillText(ch, W * 0.56 + c * 46, H * 0.30 + r * 38);
    }
  }
  ctx.font = fnt("body", 28); ctx.fillStyle = PAL.dim; ctx.textAlign = "center";
  ctx.fillText("50 CHANNELS × 10 kHz — ONE CHARACTER PER CHANNEL, PER ROW", W / 2, H * 0.86);
  ctx.globalAlpha = 1;
  reconLabel(ctx, W, H); vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC08 printout columns (b08) — the archival full page
let _imgPage = null;
export function SC08(ctx, W, H, t, win, imgs) {
  bg(ctx, W, H);
  const img = imgs?.printout_page || null;
  kenBurns(ctx, img, W, H, t, win.start, win.end, 0.05, 0, -0.3);
  if (!img) { displayText(ctx, W / 2, H / 2, "PRINTOUT PAGE", 60, PAL.dim, 6); }
  const a = easeOut(clamp01((t - win.start - 1) / 1));
  ctx.globalAlpha = a * 0.9;
  displayText(ctx, W / 2, H * 0.10, "THE RUN OF AUGUST 15, 1977", 40, PAL.ink, 6, "body");
  ctx.globalAlpha = 1;
  reconLabel(ctx, W, H, "ARCHIVAL SCAN — WIKIMEDIA COMMONS");
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC09 the six rows (b09) — ladder build
export function SC09(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.14, "CHANNEL 2 — SIX CONSECUTIVE ROWS", 42, PAL.ink, 5, "body");
  const chars = ["6", "E", "Q", "U", "J", "5"];
  const snr = [6, 14, 26, 30, 19, 5];
  const bw = 190, gap = 42;
  const x0 = W / 2 - (6 * bw + 5 * gap) / 2, yBase = H * 0.72, maxH = H * 0.38;
  chars.forEach((c, i) => {
    const a = easeOut(clamp01((t - win.start - 0.8 - i * 0.9) / 0.5));
    if (a <= 0) return;
    const x = x0 + i * (bw + gap);
    const bh = (snr[i] / 32) * maxH * a;
    ctx.fillStyle = i === 3 ? "rgba(75,225,160,0.30)" : "rgba(143,160,184,0.18)";
    ctx.fillRect(x, yBase - bh, bw, bh);
    ctx.strokeStyle = i === 3 ? PAL.signal : PAL.dim; ctx.lineWidth = 2.5;
    ctx.strokeRect(x, yBase - bh, bw, bh);
    ctx.font = fnt("mono", 88); ctx.fillStyle = i === 3 ? PAL.signal : PAL.ink;
    ctx.textAlign = "center"; ctx.fillText(c, x + bw / 2, yBase + 70);
    ctx.font = fnt("mono", 30); ctx.fillStyle = PAL.dim;
    ctx.fillText(String(snr[i]), x + bw / 2, yBase - bh - 18);
  });
  ctx.font = fnt("body", 28); ctx.fillStyle = PAL.dim; ctx.textAlign = "center";
  ctx.fillText("SIGNAL-TO-NOISE RATIO · LETTERS BEGIN AT 10 (A) THROUGH 35 (Z)", W / 2, H * 0.90);
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC10 intensity scale (b10)
export function SC10(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.14, "WHAT 'U' MEANS", 52, PAL.ink, 6);
  const x0 = W * 0.40, x1 = W * 0.44, yTop = H * 0.24, yBot = H * 0.80;
  ctx.strokeStyle = PAL.dim; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x0, yTop); ctx.lineTo(x0, yBot); ctx.stroke();
  for (let v = 0; v <= 35; v += 5) {
    const y = lerp(yBot, yTop, v / 35);
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.font = fnt("mono", 26); ctx.fillStyle = PAL.dim; ctx.textAlign = "right";
    ctx.fillText(String(v), x0 - 14, y + 9);
  }
  const uy = lerp(yBot, yTop, 30 / 35);
  const ringP = easeOut(clamp01((t - win.start - 1.4) / 1.2));
  ctx.strokeStyle = PAL.signal; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x0 + 90, uy, 34 * ringP + 1, 0, Math.PI * 2); ctx.stroke();
  ctx.font = fnt("mono", 44); ctx.fillStyle = PAL.signal; ctx.textAlign = "left";
  ctx.fillText("U", x0 + 60, uy - 48);
  const lines = [
    "PEAK INTENSITY: 30.5 ± 0.5 × BACKGROUND NOISE",
    "THE NOISE FLOOR IS THE RECEIVER'S OWN HISS —",
    "THE GALAXY, AND THE AFTERGLOW OF THE BIG BANG",
  ];
  paragraph(ctx, W * 0.52, H * 0.34, 700, lines, 36, PAL.ink, 1.6);
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC11 beam-transit arch (b11) — myth bust
export function SC11(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.14, "THE SHAPE OF A REAL TRANSIT", 46, PAL.ink, 5, "body");
  const p = easeOut(clamp01((t - win.start - 0.8) / 6));
  transitArch(ctx, W * 0.18, H * 0.62, W * 0.64, H * 0.28, p);
  ctx.strokeStyle = PAL.dim; ctx.beginPath();
  ctx.moveTo(W * 0.18, H * 0.62); ctx.lineTo(W * 0.82, H * 0.62); ctx.stroke();
  // 72 s window brackets + 37 s half-power myth chip
  const a = easeOut(clamp01((t - win.start - 5) / 1));
  ctx.globalAlpha = a;
  chip(ctx, W * 0.18, H * 0.70, "FULL WINDOW: 72 s", PAL.signal, 32);
  chip(ctx, W * 0.52, H * 0.70, "NOT '37 SECONDS' — THAT IS THE HALF-POWER WIDTH", PAL.warn, 32);
  ctx.globalAlpha = 1;
  ctx.font = fnt("body", 28); ctx.fillStyle = PAL.dim; ctx.textAlign = "center";
  ctx.fillText("RISE ~36 s → PEAK → FALL — EXACTLY WHAT A BEAM SWEEP SHOULD DRAW", W / 2, H * 0.88);
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC12 two horns (b12)
export function SC12(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.14, "ONE HORN ONLY", 56, PAL.ink, 6);
  const horn = (cx, lit, label) => {
    ctx.fillStyle = lit ? "rgba(75,225,160,0.18)" : "rgba(143,160,184,0.10)";
    ctx.strokeStyle = lit ? PAL.signal : PAL.dim;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 120, H * 0.72); ctx.lineTo(cx, H * 0.34);
    ctx.lineTo(cx + 120, H * 0.72); ctx.closePath();
    ctx.fill(); ctx.stroke();
    if (lit) {
      const p = easeOut(clamp01((t - win.start - 0.8) / 2));
      transitArch(ctx, cx - 100, H * 0.66, 200, 120 * p, 1);
    }
    ctx.font = fnt("body", 32); ctx.fillStyle = PAL.dim; ctx.textAlign = "center";
    ctx.fillText(label, cx, H * 0.79);
  };
  horn(W * 0.30, true, "POSITIVE HORN — SIGNAL");
  horn(W * 0.70, false, "SECOND HORN — +5 MIN — NOTHING");
  const a = easeOut(clamp01((t - win.start - 4) / 1));
  ctx.globalAlpha = a;
  ctx.font = fnt("body", 34); ctx.fillStyle = PAL.warn; ctx.textAlign = "center";
  ctx.fillText("THE SAME PATCH OF SKY. NO SECOND IMPRESSION.", W / 2, H * 0.90);
  ctx.globalAlpha = 1;
  vignette(ctx, W, H); grain(ctx, W, H, t);
}
