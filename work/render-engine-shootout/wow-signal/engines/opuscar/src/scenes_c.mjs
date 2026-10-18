// scenes_c.mjs — SC25..SC34 (explanations → closing). Absolute program time.
import { PAL, fnt, prng, easeOut, clamp01, lerp, bg, vignette, starfield, grain,
         reconLabel, chip, displayText, paragraph, wrap, kenBurns } from "./support.mjs";

// SC25 propagation ideas (b25)
export function SC25(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.13, "TWO IDEAS SURVIVE AS POSSIBILITIES", 44, PAL.ink, 3, "body");
  // lensing (left)
  const lx = W * 0.28, ly = H * 0.48;
  ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(lx, ly, 34, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PAL.dim; ctx.stroke();
  ctx.strokeStyle = PAL.cyan; ctx.lineWidth = 2.5;
  [-26, 0, 26].forEach((dy) => {
    ctx.beginPath();
    ctx.moveTo(lx - 300, ly - 90 + dy * 1.6);
    ctx.quadraticCurveTo(lx, ly + dy * 0.4, lx + 300, ly - 90 + dy * -0.6);
    ctx.stroke();
  });
  ctx.font = fnt("body", 30); ctx.fillStyle = PAL.ink; ctx.textAlign = "center";
  ctx.fillText("GRAVITATIONAL LENSING", lx, ly + 120);
  ctx.font = fnt("body", 26); ctx.fillStyle = PAL.dim;
  ctx.fillText("SHOULD HAVE LASTED LONGER", lx, ly + 158);
  // scintillation (right)
  const rx = W * 0.72, ry = H * 0.48;
  const flick = Math.sin(t * 6) * 0.5 + 0.5;
  ctx.fillStyle = PAL.cyan;
  ctx.globalAlpha = 0.35 + 0.65 * flick;
  ctx.beginPath(); ctx.arc(rx, ry, 22, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(143,160,184,0.35)";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.arc(rx, ry, 40 + i * 22 + flick * 10, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = PAL.ink; ctx.font = fnt("body", 30);
  ctx.fillText("INTERSTELLAR SCINTILLATION", rx, ry + 120);
  ctx.fillStyle = PAL.dim; ctx.font = fnt("body", 26);
  ctx.fillText("THE TWINKLE OF STARS, IN RADIO", rx, ry + 158);
  const a = easeOut(clamp01((t - win.start - 5) / 1));
  ctx.globalAlpha = a;
  ctx.fillStyle = PAL.warn; ctx.font = fnt("body", 32);
  ctx.fillText("BOTH SHOULD ALSO HAVE SHOWN IN THE SECOND HORN", W / 2, H * 0.84);
  ctx.globalAlpha = 1;
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC26 comet hypothesis (b26)
export function SC26(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.15, "2017 — THE COMET HYPOTHESIS", 46, PAL.ink, 4);
  const cx = W * 0.30, cy = H * 0.42;
  ctx.fillStyle = "rgba(232,223,200,0.9)";
  ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(232,223,200,0.4)"; ctx.lineWidth = 3;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath(); ctx.arc(cx, cy, 20 + i * 26, Math.PI * 0.7, Math.PI * 1.5); ctx.stroke();
  }
  ctx.font = fnt("body", 28); ctx.fillStyle = PAL.dim; ctx.textAlign = "center";
  ctx.fillText("HYDROGEN CLOUDS AROUND COMETS 266P / 335P", cx, cy + 130);
  const strikes = ["NOT IN THE BEAM AT THE RIGHT TIME", "COMETS BARELY EMIT AT THAT FREQUENCY", "ONE HORN SAW EVERYTHING — THE OTHER NOTHING"];
  strikes.forEach((s, i) => {
    const a = easeOut(clamp01((t - win.start - 2 - i * 1.5) / 0.7));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    ctx.strokeStyle = PAL.crimson; ctx.lineWidth = 3;
    ctx.strokeRect(W * 0.52, H * (0.28 + i * 0.13), W * 0.40, 64);
    ctx.fillStyle = PAL.ink; ctx.font = fnt("body", 27); ctx.textAlign = "center";
    ctx.fillText(s, W * 0.72, H * (0.28 + i * 0.13) + 40);
    ctx.globalAlpha = 1;
  });
  displayText(ctx, W / 2, H * 0.82, "DISMISSED — INCLUDING BY BIG EAR'S OWN VETERANS", 34, PAL.warn, 3, "body");
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC27 hydrogen maser (b27) — proposed, not proven
export function SC27(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.13, "2024 — THE NEWEST HYPOTHESIS", 44, PAL.ink, 3, "body");
  // hydrogen cloud + magnetar flare arrow → maser burst
  const cx = W * 0.36, cy = H * 0.48;
  const rnd = prng(303);
  for (let i = 0; i < 60; i++) {
    const x = cx + (rnd() - 0.5) * 380, y = cy + (rnd() - 0.5) * 200;
    ctx.fillStyle = "rgba(88,199,240,0.35)";
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = "rgba(88,199,240,0.5)";
  ctx.beginPath(); ctx.ellipse(cx, cy, 200, 100, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.font = fnt("body", 28); ctx.fillStyle = PAL.dim; ctx.textAlign = "center";
  ctx.fillText("COLD HYDROGEN CLOUD", cx, cy + 150);
  // magnetar flare
  const p = easeOut(clamp01((t - win.start - 1.2) / 1.2));
  ctx.strokeStyle = PAL.warn; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(W * 0.62, H * 0.20);
  ctx.lineTo(lerp(W * 0.62, cx + 120, p), lerp(H * 0.20, cy - 40, p)); ctx.stroke();
  ctx.font = fnt("body", 26); ctx.fillStyle = PAL.warn;
  ctx.fillText("MAGNETAR FLARE (EXCITATION)", W * 0.70, H * 0.17);
  if (p > 0.85) {
    ctx.strokeStyle = PAL.signal; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx - 210, cy); ctx.lineTo(cx - 300, cy); ctx.stroke();
    ctx.fillStyle = PAL.signal; ctx.textAlign = "left";
    ctx.fillText("MASER-LIKE BURST AT 1420 MHz", cx - 300, cy - 24);
  }
  chip(ctx, W * 0.56, H * 0.58, "PROPOSED — NOT PROVEN", PAL.warn, 34);
  ctx.font = fnt("body", 30); ctx.fillStyle = PAL.dim; ctx.textAlign = "center";
  const a = easeOut(clamp01((t - win.start - 4) / 1));
  ctx.globalAlpha = a;
  ctx.fillText("MODEL EVENTS RUN ~100× WEAKER THAN WOW!", W * 0.5, H * 0.78);
  ctx.fillText("A NEW CLASS OF FALSE POSITIVE FOR FUTURE SEARCHES", W * 0.5, H * 0.83);
  ctx.globalAlpha = 1;
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC28 evidence ledger (b28)
export function SC28(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.14, "WHERE THE EVIDENCE STANDS", 48, PAL.ink, 4);
  const rows = [
    "A STRONG, NARROWBAND RADIO BURST",
    "ON THE SKY FOR 72 SECONDS",
    "NEVER DETECTED AGAIN — DESPITE 25 YEARS OF BETTER INSTRUMENTS",
    "THE FACT BASE FITS ON ONE SHEET OF LINE-PRINTER PAPER",
  ];
  rows.forEach((s, i) => {
    const a = easeOut(clamp01((t - win.start - 0.7 - i * 1.4) / 0.7));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    chip(ctx, W * 0.16, H * (0.26 + i * 0.12), s, i === 3 ? PAL.signal : PAL.ink, 30);
    ctx.globalAlpha = 1;
  });
  chip(ctx, W * 0.16, H * 0.16, "ESTABLISHED", PAL.signal, 34);
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC29 not established (b29)
export function SC29(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.14, "WHAT IS NOT ESTABLISHED", 48, PAL.ink, 4);
  chip(ctx, W * 0.16, H * 0.16, "NOT ESTABLISHED", PAL.warn, 34);
  const rows = [
    "WHO — OR WHAT — SENT IT",
    "\u201CSENT\u201D MAY BE THE WRONG VERB ENTIRELY",
    "AN EXTRATERRESTRIAL TRANSMISSION CANNOT BE RULED OUT",
    "NEITHER CAN A RARE NATURAL PHENOMENON",
  ];
  rows.forEach((s, i) => {
    const a = easeOut(clamp01((t - win.start - 0.7 - i * 1.4) / 0.7));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    chip(ctx, W * 0.16, H * (0.26 + i * 0.11), s, PAL.dim, 30);
    ctx.globalAlpha = 1;
  });
  const a = easeOut(clamp01((t - win.start - 5) / 1));
  ctx.globalAlpha = a;
  displayText(ctx, W / 2, H * 0.80, "BOTH REMAIN HYPOTHESES — NEITHER IS A CONCLUSION", 38, PAL.ink, 3, "body");
  ctx.globalAlpha = 1;
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC30 ehman quotes (b30)
export function SC30(ctx, W, H, t, win) {
  bg(ctx, W, H);
  const q1 = "\u201CThe origin of the Wow! signal is still an open question for me.\u201D";
  const q2 = "\u201CI choose not to draw vast conclusions from half-vast data.\u201D";
  const a1 = easeOut(clamp01((t - win.start - 0.8) / 1));
  ctx.globalAlpha = a1;
  paragraph(ctx, W * 0.14, H * 0.36, W * 0.72, wrap(ctx, q1, W * 0.7, 52), 52, PAL.ink, 1.5);
  ctx.globalAlpha = 1;
  const a2 = easeOut(clamp01((t - win.start - 4.4) / 1));
  ctx.globalAlpha = a2;
  paragraph(ctx, W * 0.14, H * 0.58, W * 0.72, wrap(ctx, q2, W * 0.7, 52), 52, PAL.ink, 1.5);
  ctx.globalAlpha = 1;
  displayText(ctx, W * 0.86, H * 0.78, "— JERRY R. EHMAN, bigear.org", 30, PAL.dim, 2, "body");
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC31 telescope gone (b31)
export function SC31(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.16, "1998 — THE TELESCOPE CAME DOWN", 46, PAL.ink, 3, "body");
  // silhouette fading to outline
  const p = easeOut(clamp01((t - win.start - 1) / 4));
  ctx.save(); ctx.translate(W * 0.5, H * 0.55);
  const draw = (fill) => {
    ctx.beginPath();
    ctx.moveTo(-300, 120); ctx.lineTo(-140, -40); ctx.lineTo(-60, -40);
    ctx.lineTo(60, -140); ctx.lineTo(140, -140); ctx.lineTo(150, -110);
    ctx.lineTo(90, -110); ctx.lineTo(80, -40); ctx.lineTo(260, 120); ctx.closePath();
    if (fill) { ctx.fillStyle = "#1a2438"; ctx.fill(); }
    ctx.strokeStyle = fill ? "rgba(143,160,184,0.2)" : "rgba(143,160,184,0.55)";
    ctx.stroke();
  };
  ctx.globalAlpha = 1 - p * 0.85; draw(true); ctx.globalAlpha = 1;
  draw(false);
  ctx.restore();
  ctx.font = fnt("body", 30); ctx.fillStyle = PAL.dim; ctx.textAlign = "center";
  const a = easeOut(clamp01((t - win.start - 5) / 1));
  ctx.globalAlpha = a;
  ctx.fillText("THE LAND WAS SOLD — A GOLF COURSE AND 400 HOUSES", W / 2, H * 0.84);
  ctx.fillStyle = PAL.ink;
  ctx.fillText("WHAT SURVIVES IS PAPER", W / 2, H * 0.90);
  ctx.globalAlpha = 1;
  reconLabel(ctx, W, H); vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC32 searches go on (b32)
export function SC32(ctx, W, H, t, win) {
  bg(ctx, W, H); starfield(ctx, W, H, t, 121, 4);
  displayText(ctx, W / 2, H * 0.20, "EVERY NARROWBAND SEARCH IS LISTENING FOR ANOTHER WOW!", 40, PAL.ink, 2, "body");
  // survey cones sweeping
  for (const [i, cx] of [[0, W * 0.3], [1, W * 0.7]].values?.() ?? [[0, W * 0.3], [1, W * 0.7]]) {
    const ph = (t * 0.5 + i * 0.5) % 1;
    ctx.fillStyle = "rgba(88,199,240,0.10)";
    ctx.beginPath();
    ctx.moveTo(cx, H * 0.85);
    ctx.lineTo(cx - 90 - 40 * ph, H * 0.30 - 30 * ph);
    ctx.lineTo(cx + 90 + 40 * ph, H * 0.30 - 30 * ph);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(88,199,240,0.4)";
    ctx.beginPath(); ctx.moveTo(cx, H * 0.85); ctx.lineTo(cx, H * 0.35); ctx.stroke();
  }
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC33 final question (b33)
export function SC33(ctx, W, H, t, win) {
  bg(ctx, W, H); starfield(ctx, W, H, t, 55, 3);
  // slow push toward Sagittarius region (reprise of SC16 marker)
  const p = easeOut(clamp01((t - win.start) / (win.end - win.start)));
  const mx = lerp(W * 0.5, W * 0.30, p * 0.3), my = lerp(H * 0.5, H * 0.42, p * 0.3);
  ctx.strokeStyle = PAL.signal; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(mx, my, 22 + 5 * Math.sin(t * 1.7), 0, Math.PI * 2); ctx.stroke();
  const lines = [
    "IF IT WAS A BEACON, IT SPOKE ONCE.",
    "IF IT WAS NATURE, WE HAVE NOT CAUGHT IT AGAIN.",
  ];
  const a = easeOut(clamp01((t - win.start - 1.5) / 1.4));
  ctx.globalAlpha = a;
  lines.forEach((s, i) => displayText(ctx, W / 2, H * (0.62 + i * 0.09), s, 44, PAL.ink, 3, "body"));
  ctx.globalAlpha = 1;
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC34 closing card (b34) — identical closing card + credits across all engines
export function SC34(ctx, W, H, t, win) {
  bg(ctx, W, H); starfield(ctx, W, H, t * 0.5, 21, 2);
  const a = easeOut(clamp01((t - win.start - 0.5) / 1.2));
  ctx.globalAlpha = a;
  displayText(ctx, W / 2, H * 0.24, "THE UNCLOSED FILE", 72, PAL.ink, 10);
  ctx.fillStyle = PAL.crimson; ctx.fillRect(W * 0.36, H * 0.30, W * 0.28, 4);
  displayText(ctx, W / 2, H * 0.36, "THE WOW! SIGNAL — 72 SECONDS FROM DEEP SPACE", 34, PAL.dim, 3, "body");
  const credit = [
    "RESEARCH & SOURCES: bigear.org · THE SETI INSTITUTE · THE PUBLISHED LITERATURE",
    "PRINTOUT SCANS: WIKIMEDIA COMMONS (PUBLIC DOMAIN)",
    "NARRATION: SYNTHETIC VOICE (EDGE-TTS)",
    "VISUALS: CODE-GENERATED · LABELLED RECONSTRUCTIONS WHERE APPLICABLE",
  ];
  paragraph(ctx, W * 0.20, H * 0.47, W * 0.6, credit, 26, PAL.dim, 1.9, "center");
  displayText(ctx, W / 2, H * 0.68, "SOME FILES NEVER CLOSE.", 46, PAL.crimson, 8);
  ctx.globalAlpha = 1;
  vignette(ctx, W, H); grain(ctx, W, H, t);
}
