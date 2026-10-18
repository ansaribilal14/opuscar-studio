// scenes_b.mjs — SC13..SC24 (annotation → modern searches). Absolute program time.
import { PAL, fnt, prng, easeOut, clamp01, lerp, bg, vignette, starfield, grain,
         reconLabel, chip, displayText, paragraph, wrap, kenBurns, transitArch } from "./support.mjs";

// SC13 ehman context (b13)
export function SC13(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.26, "JERRY R. EHMAN", 84, PAL.ink, 8);
  displayText(ctx, W / 2, H * 0.35, "RADIO ASTRONOMER · OHIO STATE UNIVERSITY", 36, PAL.dim, 5, "body");
  const rows = 6;
  for (let i = 0; i < rows; i++) {
    const a = easeOut(clamp01((t - win.start - 1 - i * 0.5) / 0.6));
    if (a <= 0) continue;
    ctx.globalAlpha = a * 0.5;
    ctx.strokeStyle = i % 2 ? "rgba(143,160,184,0.5)" : "rgba(143,160,184,0.25)";
    ctx.beginPath(); ctx.moveTo(W * 0.30, H * 0.46 + i * 44); ctx.lineTo(W * 0.70, H * 0.46 + i * 44);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.font = fnt("body", 30); ctx.fillStyle = PAL.dim; ctx.textAlign = "center";
  ctx.fillText("EVERY FEW DAYS THE PRINTOUTS ARRIVED — HE READ THEM, ROW BY ROW", W / 2, H * 0.82);
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC14 the circle (b14) — archival close-up + animated overlay
let _imgClose = null;
export function SC14(ctx, W, H, t, win, imgs) {
  bg(ctx, W, H);
  const img = imgs?.printout_close || null;
  kenBurns(ctx, img, W, H, t, win.start, win.end, 0.07, 0.3, -0.2);
  if (!img) displayText(ctx, W / 2, H / 2, "THE ANNOTATION", 60, PAL.dim, 6);
  const a = easeOut(clamp01((t - win.start - 1) / 1));
  ctx.globalAlpha = a * 0.92;
  displayText(ctx, W / 2, H * 0.10, "AUGUST 19, 1977 — A FEW PAGES INTO THE RUN", 38, PAL.ink, 4, "body");
  ctx.globalAlpha = 1;
  reconLabel(ctx, W, H, "ARCHIVAL SCAN — WIKIMEDIA COMMONS");
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC15 name sticks (b15)
export function SC15(ctx, W, H, t, win, imgs) {
  bg(ctx, W, H);
  const img = imgs?.printout_page || null;
  kenBurns(ctx, img, W, H, t, win.start, win.end, 0.06, -0.3, -0.1);
  ctx.font = fnt("body", 34); ctx.fillStyle = PAL.ink; ctx.textAlign = "center";
  const a = easeOut(clamp01((t - win.start - 1) / 1));
  ctx.globalAlpha = a;
  ctx.fillText("KRAUS BEGAN CALLING IT THE WOW! SOURCE", W / 2, H * 0.90);
  ctx.globalAlpha = 1;
  reconLabel(ctx, W, H, "ARCHIVAL SCAN — WIKIMEDIA COMMONS");
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC16 sky coordinates (b16)
export function SC16(ctx, W, H, t, win) {
  bg(ctx, W, H); starfield(ctx, W, H, t, 55, 3);
  displayText(ctx, W / 2, H * 0.15, "WHERE THE SKY WAS", 48, PAL.ink, 5);
  const a = easeOut(clamp01((t - win.start - 1) / 1));
  ctx.globalAlpha = a;
  ctx.font = fnt("mono", 44); ctx.fillStyle = PAL.cyan; ctx.textAlign = "left";
  ctx.fillText("R.A.  19h 22m 25s ± 10s", W * 0.16, H * 0.32);
  ctx.fillText("DECL. −27° 03′ ± 20′ (1950.0)", W * 0.16, H * 0.39);
  // constellation frame: Sagittarius teapot-ish asterism (schematic)
  const pts = [[0.62, 0.52], [0.68, 0.50], [0.74, 0.55], [0.72, 0.63], [0.64, 0.66], [0.60, 0.60], [0.62, 0.52]];
  ctx.strokeStyle = "rgba(143,160,184,0.6)"; ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x * W, y * H) : ctx.lineTo(x * W, y * H));
  ctx.stroke();
  pts.slice(0, 6).forEach(([x, y]) => {
    ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(x * W, y * H, 4, 0, Math.PI * 2); ctx.fill();
  });
  const mx = 0.67 * W, my = 0.57 * H;
  ctx.strokeStyle = PAL.signal; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(mx, my, 26 + 6 * Math.sin(t * 2.2), 0, Math.PI * 2); ctx.stroke();
  ctx.font = fnt("body", 30); ctx.fillStyle = PAL.signal; ctx.textAlign = "left";
  ctx.fillText("SAGITTARIUS", mx + 40, my + 8);
  ctx.fillStyle = PAL.dim;
  ctx.fillText("TOWARD THE CENTER OF THE MILKY WAY", W * 0.16, H * 0.47);
  ctx.globalAlpha = 1;
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC17 watering hole (b17)
export function SC17(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.16, "1959 — A NATURAL MEETING FREQUENCY", 42, PAL.ink, 4, "body");
  displayText(ctx, W / 2, H * 0.235, "MORRISON & COCCONI", 30, PAL.dim, 8, "body");
  const a = easeOut(clamp01((t - win.start - 1) / 1.4));
  // hydrogen 21-cm diagram: nucleus + electron flip arrow
  ctx.globalAlpha = a;
  const cx = W * 0.30, cy = H * 0.52;
  ctx.fillStyle = PAL.cyan; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(88,199,240,0.5)"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(cx, cy, 90, 36, 0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy, 90, 36, -0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = PAL.signal; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(cx + 110, cy - 60); ctx.lineTo(cx + 160, cy - 20); ctx.stroke();
  ctx.font = fnt("body", 28); ctx.fillStyle = PAL.dim; ctx.textAlign = "left";
  ctx.fillText("21-centimeter line of neutral hydrogen", cx - 90, cy + 90);
  displayText(ctx, W * 0.68, H * 0.46, "1420 MHz", 96, PAL.signal, 6, "mono");
  displayText(ctx, W * 0.68, H * 0.56, "THE WATERING HOLE", 40, PAL.ink, 6, "body");
  ctx.globalAlpha = 1;
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC18 frequency offset (b18)
export function SC18(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.14, "ALMOST — BUT NOT EXACTLY — THE HYDROGEN LINE", 40, PAL.ink, 3, "body");
  const x0 = W * 0.14, x1 = W * 0.86, y = H * 0.55;
  ctx.strokeStyle = PAL.dim; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  // hydrogen line marker
  const hx = lerp(x0, x1, 0.35);
  ctx.strokeStyle = PAL.cyan; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(hx, y - 60); ctx.lineTo(hx, y + 60); ctx.stroke();
  ctx.font = fnt("mono", 30); ctx.fillStyle = PAL.cyan; ctx.textAlign = "center";
  ctx.fillText("1420.4058 MHz", hx, y + 100);
  ctx.font = fnt("body", 26); ctx.fillText("HYDROGEN LINE", hx, y + 136);
  // wow marker slides in
  const p = easeOut(clamp01((t - win.start - 1.2) / 1.2));
  const wx = lerp(hx + 30, lerp(x0, x1, 0.65), p);
  ctx.strokeStyle = PAL.signal; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(wx, y - 80); ctx.lineTo(wx, y + 80); ctx.stroke();
  ctx.fillStyle = PAL.signal; ctx.textAlign = "center";
  ctx.fillText("WOW!  1420.4556 MHz", wx, y - 104);
  // offset brace
  if (p > 0.9) {
    ctx.strokeStyle = PAL.warn; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(hx, y - 150); ctx.lineTo(wx, y - 150); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = PAL.warn; ctx.font = fnt("body", 28);
    ctx.fillText("+50 kHz  ·  ≈ 10 km/s TOWARD EARTH", (hx + wx) / 2, y - 176);
  }
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC19 paperwork story (b19)
export function SC19(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.16, "EVEN THE NUMBER HAS A STORY", 46, PAL.ink, 4);
  ctx.font = fnt("mono", 38); ctx.textAlign = "center";
  const rows = [
    ["LOCAL OSCILLATOR — ORDERED", "1450.4056 MHz", PAL.dim],
    ["LOCAL OSCILLATOR — DELIVERED", "1450.5056 MHz", PAL.warn],
    ["EHMAN'S CALCULATION", "CORRECTED", PAL.signal],
    ["KRAUS'S 1994 SUMMARY FOR SAGAN", "UNCORRECTED", PAL.warn],
  ];
  rows.forEach(([k, v, col], i) => {
    const a = easeOut(clamp01((t - win.start - 0.8 - i * 1.3) / 0.8));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    const y = H * 0.30 + i * 86;
    ctx.fillStyle = PAL.dim; ctx.textAlign = "right"; ctx.font = fnt("body", 30);
    ctx.fillText(k, W * 0.46, y);
    ctx.fillStyle = col; ctx.textAlign = "left"; ctx.font = fnt("mono", 34);
    ctx.fillText(v, W * 0.52, y);
    ctx.globalAlpha = 1;
  });
  displayText(ctx, W / 2, H * 0.82, "THE SIGNAL DID NOT MOVE. THE PAPERWORK DID.", 38, PAL.ink, 3, "body");
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC20 narrow vs wide (b20)
export function SC20(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.15, "NARROWNESS IS WHAT TECHNOLOGY DOES", 44, PAL.ink, 3, "body");
  const y0 = H * 0.34;
  // broadband bar
  ctx.fillStyle = "rgba(143,160,184,0.25)";
  ctx.fillRect(W * 0.14, y0, W * 0.72, 56);
  ctx.font = fnt("body", 30); ctx.fillStyle = PAL.dim; ctx.textAlign = "left";
  ctx.fillText("NATURAL RADIO SOURCES — BROADBAND (PULSARS, QUASARS, GALAXIES)", W * 0.14, y0 - 18);
  // narrow channel
  const p = easeOut(clamp01((t - win.start - 1.4) / 1.2));
  ctx.fillStyle = "rgba(75,225,160,0.55)";
  ctx.fillRect(lerp(W * 0.50, W * 0.475, p), y0 + 110, 10 + 90 * p, 56);
  ctx.fillStyle = PAL.signal; ctx.textAlign = "left";
  ctx.fillText("THE WOW! SIGNAL — ONE 10 kHz CHANNEL", W * 0.14, y0 + 92);
  displayText(ctx, W / 2, H * 0.72, "AND YET — NOTHING TECHNOLOGICAL WAS THERE TO DO IT", 36, PAL.warn, 3, "body");
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC21 look again (b21)
export function SC21(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.18, "THE FIRST FOLLOW-UP: LOOK AGAIN", 46, PAL.ink, 4);
  const sweeps = 3;
  for (let i = 0; i < sweeps; i++) {
    const a = easeOut(clamp01((t - win.start - 1 - i * 2.4) / 1.8));
    if (a <= 0) continue;
    const x0 = W * 0.16, y = H * (0.38 + i * 0.16), x1 = W * 0.84;
    ctx.strokeStyle = "rgba(143,160,184,0.4)"; ctx.strokeRect(x0, y, x1 - x0, 70);
    const px = lerp(x0, x1 - 90, a);
    ctx.fillStyle = "rgba(88,199,240,0.12)"; ctx.fillRect(px, y, 90, 70);
    ctx.font = fnt("mono", 30); ctx.fillStyle = PAL.warn; ctx.textAlign = "right";
    ctx.fillText("NULL", x1 - 14, y + 45);
  }
  chip(ctx, W * 0.16, H * 0.78, "NOT REPOINTABLE — THE SKY HAD TO BRING IT BACK. IT NEVER DID.", PAL.dim, 30);
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC22 decades of silence (b22)
export function SC22(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.14, "DECADES OF BETTER INSTRUMENTS", 46, PAL.ink, 4);
  const items = [
    ["1987 · 1989", "META ARRAY — OAK RIDGE (GRAY)"],
    ["1995", "GREEN BANK 12-m DRIFT SCAN (SHUCH)"],
    ["1995 · 1996", "VERY LARGE ARRAY (GRAY)"],
    ["1999", "MOUNT PLEASANT 26-m, TASMANIA (GRAY & ELLINGSEN)"],
  ];
  items.forEach(([yr, name], i) => {
    const a = easeOut(clamp01((t - win.start - 0.8 - i * 1.5) / 0.8));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    const y = H * 0.28 + i * 108;
    ctx.strokeStyle = "rgba(143,160,184,0.4)";
    ctx.beginPath(); ctx.moveTo(W * 0.13, y); ctx.lineTo(W * 0.87, y); ctx.stroke();
    ctx.font = fnt("mono", 36); ctx.fillStyle = PAL.cyan; ctx.textAlign = "left";
    ctx.fillText(yr, W * 0.13, y - 14);
    ctx.font = fnt("body", 30); ctx.fillStyle = PAL.ink; ctx.textAlign = "center";
    ctx.fillText(name, W * 0.50, y - 14);
    ctx.font = fnt("mono", 30); ctx.fillStyle = PAL.warn; ctx.textAlign = "right";
    ctx.fillText("NULL", W * 0.87, y - 14);
    ctx.globalAlpha = 1;
  });
  ctx.font = fnt("body", 34); ctx.fillStyle = PAL.ink; ctx.textAlign = "center";
  const a = easeOut(clamp01((t - win.start - 6.4) / 1));
  ctx.globalAlpha = a;
  ctx.fillText("SILENCE, EVERY TIME.", W / 2, H * 0.80);
  ctx.globalAlpha = 1;
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC23 modern searches (b23)
export function SC23(ctx, W, H, t, win) {
  bg(ctx, W, H); starfield(ctx, W, H, t, 88, 2);
  displayText(ctx, W / 2, H * 0.16, "THE SEARCHES CONTINUE", 48, PAL.ink, 4);
  const cards = [
    ["2022", "BREAKTHROUGH LISTEN", "GREEN BANK + ALLEN ARRAYS — INCL. SIMULTANEOUS"],
    ["2025", "SETI INSTITUTE", "COORDINATED GBT/ATA OBSERVATION OF THE POSITION"],
  ];
  cards.forEach(([yr, org, note], i) => {
    const a = easeOut(clamp01((t - win.start - 0.8 - i * 2) / 1));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    const cw = 660, x = W / 2 + (i - 0.5) * (cw + 80) - cw / 2, y = H * 0.32;
    ctx.fillStyle = PAL.panel; ctx.fillRect(x, y, cw, 240);
    ctx.strokeStyle = "rgba(143,160,184,0.35)"; ctx.strokeRect(x, y, cw, 240);
    ctx.font = fnt("mono", 44); ctx.fillStyle = PAL.cyan; ctx.textAlign = "center";
    ctx.fillText(yr, x + cw / 2, y + 70);
    ctx.font = fnt("body", 34); ctx.fillStyle = PAL.ink;
    ctx.fillText(org, x + cw / 2, y + 126);
    ctx.font = fnt("body", 26); ctx.fillStyle = PAL.dim;
    wrap(ctx, note, cw - 60, 26).forEach((l, j) => ctx.fillText(l, x + cw / 2, y + 172 + j * 32));
    ctx.font = fnt("mono", 30); ctx.fillStyle = PAL.warn;
    ctx.fillText("NULL", x + cw / 2, y + 275);
    ctx.globalAlpha = 1;
  });
  const a = easeOut(clamp01((t - win.start - 5) / 1));
  ctx.globalAlpha = a;
  ctx.font = fnt("mono", 52); ctx.fillStyle = PAL.signal; ctx.textAlign = "center";
  ctx.fillText("0 REPEATS IN 49 YEARS", W / 2, H * 0.80);
  ctx.globalAlpha = 1;
  vignette(ctx, W, H); grain(ctx, W, H, t);
}

// SC24 ruled out (b24)
export function SC24(ctx, W, H, t, win) {
  bg(ctx, W, H);
  displayText(ctx, W / 2, H * 0.13, "THE ORIGINAL TEAM RULED OUT THE OBVIOUS", 42, PAL.ink, 3, "body");
  const items = ["PLANETS", "ASTEROIDS", "SATELLITES", "AIRCRAFT", "SPACECRAFT"];
  items.forEach((s, i) => {
    const a = easeOut(clamp01((t - win.start - 0.6 - i * 0.7) / 0.5));
    if (a <= 0) return;
    const cw = 300, x = W * 0.10 + (i % 3) * (cw + 40), y = H * (0.26 + Math.floor(i / 3) * 0.16);
    ctx.globalAlpha = a;
    ctx.strokeStyle = "rgba(143,160,184,0.4)"; ctx.strokeRect(x, y, cw, 76);
    ctx.font = fnt("body", 32); ctx.fillStyle = PAL.dim; ctx.textAlign = "center";
    ctx.fillText(s, x + cw / 2, y + 38);
    if (a > 0.8) {
      ctx.strokeStyle = PAL.crimson; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x + 20, y + 62); ctx.lineTo(x + cw - 20, y + 14); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  const a = easeOut(clamp01((t - win.start - 4.4) / 1));
  ctx.globalAlpha = a;
  ctx.font = fnt("body", 32); ctx.fillStyle = PAL.ink; ctx.textAlign = "center";
  ctx.fillText("A TERRESTRIAL SIGNAL OFF SPACE DEBRIS?", W / 2, H * 0.68);
  ctx.fillStyle = PAL.warn;
  ctx.fillText("ILLEGAL TRANSMITTER + NON-TUMBLING SURFACE + PERFECT GEOMETRY", W / 2, H * 0.735);
  ctx.fillStyle = PAL.dim;
  ctx.fillText("IMPROBABLE IN PRACTICE", W / 2, H * 0.79);
  ctx.globalAlpha = 1;
  vignette(ctx, W, H); grain(ctx, W, H, t);
}
