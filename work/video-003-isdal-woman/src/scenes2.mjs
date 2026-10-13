// scenes2.mjs — v2 visual compositions for video-003 (photo-first cinematic)
// Each scene fn: (ctx, W, H, tLoc, dur, b) — draws CONTENT only.
// renderFrame applies: crossfades, base plate, grain, vignette, chrome.
import {
  PAL, photoPlate, photoCard, grain, basePlate, vignette, chrome2,
  kicker, display as _display, rule, paper, stamp2, fog2, norwayMap, glow,
} from "./film_look.mjs";
import { clamp, lerp, ease, easeOut, text, font, textW } from "./engine.mjs";
import { RNG } from "./engine.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const S = PAL; // shorthand
let FW = 1920; // frame width for display auto-fit
function display(ctx, str, cx, y, size, p, opts = {}) {
  return _display(ctx, str, cx, y, size, p, { maxW: FW * 0.92, ...opts });
}

// ---------- shared composites ----------
function fileHeader(ctx, W, H, tLoc, label, title) {
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
function creditBR(ctx, W, H, str) {
  const w = textW(ctx, str, Math.round(H * 0.014), S.mono);
  text(ctx, str, W - Math.round(W * 0.03) - w, Math.round(H * 0.055), Math.round(H * 0.014), { family: S.mono, color: S.boneFaint, alpha: 0.85, spacing: 1.5 });
}
function chip(ctx, str, x, y, size, opts = {}) {
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
function quoteBar(ctx, W, H, quote, who, p, yFrac = 0.86) {
  const y = Math.round(H * yFrac);
  ctx.save();
  const a = clamp(p * 1.6);
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(9,11,15,0.72)";
  ctx.fillRect(0, y - Math.round(H * 0.045), W, Math.round(H * 0.082));
  ctx.fillStyle = S.amber; ctx.fillRect(0, y - Math.round(H * 0.045), Math.round(W * 0.006 * clamp(p * 2)), Math.round(H * 0.082));
  const size = Math.round(H * 0.031);
  font(ctx, size, S.serif, "bold");
  ctx.fillStyle = S.bone; ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 8;
  ctx.fillText(quote, W / 2, y + Math.round(H * 0.002));
  ctx.shadowBlur = 0;
  text(ctx, who, W / 2, y + Math.round(H * 0.026), Math.round(H * 0.0145), { family: S.mono, color: S.amber, align: "center", alpha: 0.95 });
  ctx.restore();
}

// ==================== BEAT 0 — COLD OPEN ====================
function valley_intro(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "isdalen_valley.jpg", { zoom: [1.02, 1.12], pan: [0, 0.2, 0, -0.2], scrim: 0.5 });
  fog2(ctx, W, H, t, 5, 0.06);
  kicker(ctx, "WEST OF BERGEN — NORWAY'S COAST", Math.round(W * 0.062), Math.round(H * 0.72), Math.round(H * 0.020), { p: undefined });
  display(ctx, "THE ICE VALLEY", Math.round(W * 0.062), Math.round(H * 0.80), Math.round(H * 0.085), clamp(t / 1.4), { align: "left" });
  rule(ctx, Math.round(W * 0.062 + W * 0.16), Math.round(H * 0.83), Math.round(W * 0.16), clamp((t - 0.8) / 1));
  text(ctx, "Locals have another name for it —  \u201CD\u00F8dsdalen\u201D. Death Valley.", Math.round(W * 0.062), Math.round(H * 0.875), Math.round(H * 0.026), { family: S.body, color: S.boneDim, alpha: clamp((t - 1.1) / 1) });
  creditBR(ctx, W, H, "ISDALEN VALLEY — FILE PHOTO: BBC");
}
function valley_date_sting(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "misty_fjord.jpg", { zoom: [1.10, 1.04], pan: [0, 0, 0, 0.25], dark: 0.18 });
  fog2(ctx, W, H, t, 9, 0.07);
  const pulse = 0.75 + 0.25 * Math.sin(t * 1.4);
  glow(ctx, W / 2, H * 0.34, H * 0.30 * pulse, "rgba(210,168,94,0.10)", 1);
  kicker(ctx, "ISDALEN, BERGEN — 13:15", W / 2, Math.round(H * 0.30), Math.round(H * 0.021), { align: "center" });
  display(ctx, "29 NOVEMBER 1970", W / 2, Math.round(H * 0.46), Math.round(H * 0.115), clamp((t - 0.25) / 1.3));
  rule(ctx, W / 2, Math.round(H * 0.52), Math.round(W * 0.22), clamp((t - 1) / 1.2));
  display(ctx, "A BURNED BODY AMONG THE ROCKS", W / 2, Math.round(H * 0.60), Math.round(H * 0.038), clamp((t - 1.3) / 1.2), { weight: "", color: S.boneDim, shadow: false });
}
function casefile_stamp(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "archive_folders.jpg", { zoom: [1.06, 1.12], pan: [0.2, 0, -0.2, 0], dark: 0.30 });
  // left paper case file
  const pw = Math.round(W * 0.40), ph = Math.round(H * 0.52);
  const px = Math.round(W * 0.07), py = Math.round(H * 0.26);
  paper(ctx, px, py, pw, ph, { tilt: -0.018 });
  const inkIn = clamp((t - 0.5) / 0.9);
  ctx.save(); ctx.globalAlpha *= inkIn;
  text(ctx, "CASE 134/70", px + pw * 0.07, py + ph * 0.16, Math.round(ph * 0.085), { family: S.mono, color: S.ink, spacing: 2 });
  font(ctx, Math.round(ph * 0.075), S.serif, "bold"); ctx.fillStyle = S.ink;
  ctx.fillText("UNKNOWN WOMAN", px + pw * 0.07, py + ph * 0.30);
  ctx.fillText("ISDALEN — BERGEN", px + pw * 0.07, py + ph * 0.395);
  // ink rules
  ctx.strokeStyle = "rgba(40,38,32,0.65)"; ctx.lineWidth = 2;
  [0.47, 0.54, 0.61].forEach((fy, i) => {
    const wp = clamp(inkIn * 2 - i * 0.35);
    ctx.beginPath(); ctx.moveTo(px + pw * 0.07, py + ph * fy);
    ctx.lineTo(px + pw * (0.07 + 0.5 * wp), py + ph * fy); ctx.stroke();
  });
  ctx.restore();
  // big stamp punch
  const sp = clamp((t - 1.5) / 0.5);
  if (sp > 0) {
    const sc = 1 + (1 - easeOut(sp)) * 0.9;
    ctx.save(); ctx.translate(px + pw * 0.62, py + ph * 0.62); ctx.scale(sc, sc);
    stamp2(ctx, "CLOSED 1971", 0, 0, Math.round(ph * 0.105), { angle: -0.10 });
    ctx.restore();
    if (sp >= 1) text(ctx, "PROBABLE SUICIDE", px + pw * 0.62, py + ph * 0.87, Math.round(ph * 0.055), { family: S.mono, color: S.red, align: "center", alpha: clamp((t - 2.1) / 0.5), spacing: 2 });
  }
  // right statement
  display(ctx, "HER NAME", W * 0.775, Math.round(H * 0.40), Math.round(H * 0.075), clamp((t - 0.8) / 1), { align: "center" });
  display(ctx, "IS STILL UNKNOWN", W * 0.775, Math.round(H * 0.49), Math.round(H * 0.075), clamp((t - 1.2) / 1), { align: "center", color: S.amber });
  text(ctx, "Half a century later — still no name.", W * 0.775, Math.round(H * 0.565), Math.round(H * 0.024), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 1.8) / 1) });
}
function title_card(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "misty_fjord.jpg", { zoom: [1.03, 1.10], pan: [-0.2, 0, 0.2, 0], dark: 0.34, scrim: 0 });
  fog2(ctx, W, H, t, 11, 0.05);
  glow(ctx, W / 2, H * 0.40, H * 0.42, "rgba(210,168,94,0.07)", 1);
  kicker(ctx, "A COLD CASE IN EIGHT FILES", W / 2, Math.round(H * 0.27), Math.round(H * 0.020), { align: "center" });
  display(ctx, "THE ISDAL WOMAN", W / 2, Math.round(H * 0.435), Math.round(H * 0.128), clamp((t - 0.4) / 1.6));
  rule(ctx, W / 2, Math.round(H * 0.50), Math.round(W * 0.26), clamp((t - 1.4) / 1.4));
  display(ctx, "The Woman Who Erased Her Own Identity", W / 2, Math.round(H * 0.585), Math.round(H * 0.042), clamp((t - 1.8) / 1.4), { weight: "", color: S.boneDim, shadow: false });
  text(ctx, "THE DOCUMENTARY ENGINE — 2026", W / 2, Math.round(H * 0.905), Math.round(H * 0.0145), { family: S.mono, color: S.boneFaint, align: "center", alpha: clamp((t - 2.6) / 1) * 0.9, spacing: 3 });
}

// ==================== BEAT 1 — FILE 1: THE VALLEY ====================
function scene_diagram(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 4, 0.05);
  fileHeader(ctx, W, H, t, "FILE 1 / 8", "The Valley");
  // terrain cross-section (big, readable)
  const gy = H * 0.62;
  const layers = [
    { y: 0.50, c: "rgba(64,76,92,0.30)", amp: 46, f: 2.2 },
    { y: 0.58, c: "rgba(52,62,76,0.55)", amp: 34, f: 3.1 },
    { y: 0.66, c: "rgba(40,48,60,0.85)", amp: 24, f: 4.2 },
  ];
  layers.forEach((L, li) => {
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 10) {
      const y = H * L.y - Math.sin(x / W * Math.PI * L.f + li * 1.7) * L.amp - Math.sin(x / 163) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = L.c; ctx.fill();
  });
  // ground fill
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 10) {
    const y = gy - Math.sin(x / W * Math.PI * 3.4) * 20 - Math.sin(x / 121) * 9;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H); ctx.closePath();
  const gg = ctx.createLinearGradient(0, gy - 60, 0, H);
  gg.addColorStop(0, "rgba(28,34,44,0.98)"); gg.addColorStop(1, "rgba(16,20,27,0.99)");
  ctx.fillStyle = gg; ctx.fill();
  // body silhouette (reclined, abstract, bone outline) at center
  const bx = W * 0.46, by = gy + H * 0.012;
  const bp = clamp((t - 0.7) / 1.1);
  ctx.save(); ctx.globalAlpha = bp;
  ctx.strokeStyle = S.bone; ctx.lineWidth = 3; ctx.lineCap = "round";
  ctx.shadowColor = "rgba(0,0,0,0.7)"; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.ellipse(bx, by, W * 0.052, H * 0.013, 0.06, 0, Math.PI * 2); ctx.stroke(); // torso
  ctx.beginPath(); ctx.arc(bx - W * 0.062, by - H * 0.008, H * 0.011, 0, Math.PI * 2); ctx.stroke(); // head
  ctx.beginPath(); ctx.moveTo(bx - W * 0.02, by - H * 0.006); ctx.quadraticCurveTo(bx - W * 0.035, by - H * 0.035, bx - W * 0.055, by - H * 0.026); ctx.stroke(); // arm drawn up
  ctx.beginPath(); ctx.moveTo(bx + W * 0.03, by); ctx.lineTo(bx + W * 0.052, by - H * 0.016); ctx.stroke(); // leg drawn up
  ctx.restore();
  // scorch glow on front (above torso)
  const sg = clamp((t - 1.2) / 1);
  if (sg > 0) {
    ctx.save(); ctx.globalAlpha = sg * 0.8;
    const gr = ctx.createRadialGradient(bx, by - H * 0.012, 0, bx, by - H * 0.012, W * 0.055);
    gr.addColorStop(0, "rgba(176,64,47,0.34)"); gr.addColorStop(1, "rgba(176,64,47,0)");
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(bx, by - H * 0.012, W * 0.055, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // petrol pool traces under
  const pp = clamp((t - 1.7) / 1);
  ctx.save(); ctx.globalAlpha = pp;
  ctx.fillStyle = "rgba(210,168,94,0.14)";
  ctx.beginPath(); ctx.ellipse(bx + W * 0.01, by + H * 0.02, W * 0.075, H * 0.012, 0, 0, Math.PI * 2); ctx.fill();
  ctx.setLineDash([6, 6]); ctx.strokeStyle = "rgba(210,168,94,0.6)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(bx + W * 0.01, by + H * 0.02, W * 0.075, H * 0.012, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  // torch light sweep from upper-left
  const sw = Math.sin(t * 0.7) * 0.04;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.translate(W * 0.16, H * 0.10); ctx.rotate(0.72 + sw);
  const cone = ctx.createLinearGradient(0, 0, 0, H * 0.9);
  cone.addColorStop(0, "rgba(226,214,180,0.20)"); cone.addColorStop(1, "rgba(226,214,180,0)");
  ctx.fillStyle = cone;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-W * 0.09, H * 0.95); ctx.lineTo(W * 0.13, H * 0.95); ctx.closePath(); ctx.fill();
  ctx.restore();
  // labels with leaders
  const labels = [
    { txt: "FACE + FRONT — BURNED", x: bx - W * 0.17, y: by - H * 0.10, tx: bx - W * 0.06, ty: by - H * 0.014, p: clamp((t - 2.0) / 0.7), color: S.red },
    { txt: "BACK — UNBURNED", x: bx + W * 0.10, y: by + H * 0.09, tx: bx + W * 0.035, ty: by + H * 0.008, p: clamp((t - 2.5) / 0.7), color: S.boneDim },
    { txt: "PETROL — IN GROUND + FUR HAT", x: bx + W * 0.055, y: by + H * 0.155, tx: bx + W * 0.02, ty: by + H * 0.024, p: clamp((t - 3.0) / 0.7), color: S.amber },
  ];
  ctx.save();
  for (const L of labels) {
    if (L.p <= 0) continue;
    ctx.globalAlpha = L.p;
    ctx.strokeStyle = L.color; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(L.tx, L.ty); ctx.lineTo(L.x, L.y); ctx.stroke();
    ctx.fillStyle = L.color;
    ctx.beginPath(); ctx.arc(L.tx, L.ty, 3, 0, Math.PI * 2); ctx.fill();
    font(ctx, Math.round(H * 0.019), S.mono, "bold");
    ctx.textAlign = L.x < L.tx ? "right" : "left";
    ctx.fillText(L.txt, L.x + (L.x < L.tx ? -8 : 8), L.y - 6);
  }
  ctx.restore();
  kicker(ctx, "RECONSTRUCTION — FROM POLICE RECORDS", Math.round(W * 0.062), Math.round(H * 0.93), Math.round(H * 0.015), { alpha: 0.75 });
}
function scene_inventory(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 6, 0.04);
  const items = [
    "ST. HALLVARD LIQUEUR — EMPTY BOTTLE", "PLASTIC WATER BOTTLES × 2", "PLASTIC PASSPORT HOLDER",
    "RUBBER BOOTS", "WOOLEN JUMPER + SCARF", "NYLON STOCKINGS",
    "UMBRELLA", "PURSE + MATCHBOX", "TRACES OF BURNED PAPER",
    "WATCH — PLACED, NOT WORN", "TWO EARRINGS — PLACED", "RING — PLACED",
  ];
  const pw = Math.round(W * 0.62), ph = Math.round(H * 0.66);
  const px = Math.round(W * 0.055), py = Math.round(H * 0.175);
  paper(ctx, px, py, pw, ph, { tilt: -0.012 });
  kicker(ctx, "SCENE INVENTORY — 12 ITEMS", px + pw * 0.06, py + ph * 0.10, Math.round(H * 0.018), { color: "#7a5c28" });
  const cols = 2, colW = pw * 0.44;
  items.forEach((it, i) => {
    const ip = clamp((t - 0.5 - i * 0.22) / 0.5);
    if (ip <= 0) return;
    const col = i % cols, row = Math.floor(i / cols);
    const x = px + pw * 0.06 + col * colW;
    const y = py + ph * 0.20 + row * ph * 0.115;
    ctx.save(); ctx.globalAlpha = easeOut(ip);
    font(ctx, Math.round(H * 0.021), S.mono, "bold");
    ctx.fillStyle = "#a5772e";
    ctx.fillText(String(i + 1).padStart(2, "0"), x, y);
    font(ctx, Math.round(H * 0.0225), S.body, "");
    ctx.fillStyle = S.ink;
    ctx.fillText(it, x + Math.round(H * 0.032), y);
    ctx.strokeStyle = "rgba(90,80,60,0.30)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y + Math.round(H * 0.016)); ctx.lineTo(x + colW - Math.round(H * 0.02), y + Math.round(H * 0.016)); ctx.stroke();
    ctx.restore();
  });
  // jewellery callout right
  const jp = clamp((t - 3.2) / 1);
  if (jp > 0) {
    ctx.save(); ctx.globalAlpha = jp;
    const jx = Math.round(W * 0.735);
    glow(ctx, jx + W * 0.075, H * 0.36, W * 0.09, "rgba(210,168,94,0.10)", 1);
    text(ctx, "PLACED — NOT WORN", jx + W * 0.075, H * 0.245, Math.round(H * 0.019), { family: S.mono, color: S.amber, align: "center", spacing: 2 });
    // ring, earrings glyphs
    ctx.strokeStyle = S.amber; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(jx + W * 0.075, H * 0.36, W * 0.024, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(jx + W * 0.030, H * 0.475, W * 0.011, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(jx + W * 0.120, H * 0.475, W * 0.011, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(jx + W * 0.030, H * 0.475, W * 0.004, 0, Math.PI * 2); ctx.stroke();
    text(ctx, "BESIDE THE BODY", jx + W * 0.075, H * 0.56, Math.round(H * 0.016), { family: S.mono, color: S.boneFaint, align: "center", spacing: 1.5 });
    ctx.restore();
  }
  quoteBar(ctx, W, H, "\u201CSOME KIND OF CEREMONY\u201D", "T. B\u00D8NES — FORENSIC INVESTIGATOR (BBC, 2017)", clamp((t - 3.8) / 0.9));
}
function label_cut(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  // giant paper macro fills frame
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.rotate(0.024); ctx.translate(-W / 2, -H / 2);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#e7dfcd"); g.addColorStop(1, "#cfc5ad");
  ctx.fillStyle = g; ctx.fillRect(-W * 0.1, -H * 0.1, W * 1.2, H * 1.2);
  // fabric label strip
  const sy = H * 0.36, shh = H * 0.13;
  ctx.fillStyle = "#b9b19d";
  ctx.fillRect(W * 0.12, sy, W * 0.76, shh);
  ctx.strokeStyle = "rgba(70,64,50,0.5)"; ctx.lineWidth = 2;
  ctx.strokeRect(W * 0.12, sy, W * 0.76, shh);
  for (let i = 0; i < 9; i++) { // stitching
    ctx.strokeStyle = "rgba(70,64,50,0.35)"; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(W * 0.13, sy + shh * (0.25 + 0.25 * (i % 2))); ctx.lineTo(W * 0.87, sy + shh * (0.25 + 0.25 * (i % 2))); ctx.stroke();
    ctx.setLineDash([]);
  }
  text(ctx, "MADE IN ———  size ——  cotton ———", W * 0.5, sy + shh * 0.62, Math.round(H * 0.028), { family: S.mono, color: "rgba(60,55,42,0.75)", align: "center" });
  // animated scissors cut line
  const cp = ease(clamp((t - 0.6) / 1.6));
  const cx = W * 0.12 + W * 0.76 * cp;
  ctx.strokeStyle = S.red; ctx.lineWidth = 3; ctx.setLineDash([14, 10]);
  ctx.beginPath(); ctx.moveTo(W * 0.12, sy + shh * 0.5); ctx.lineTo(cx, sy + shh * 0.5); ctx.stroke();
  ctx.setLineDash([]);
  // scissors glyph at cut head
  ctx.save(); ctx.translate(cx, sy + shh * 0.5); ctx.rotate(0.1);
  ctx.strokeStyle = S.ink; ctx.lineWidth = 4; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-14, -18); ctx.lineTo(14, 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14, 14); ctx.lineTo(14, -18); ctx.stroke();
  ctx.beginPath(); ctx.arc(-18, -22, 8, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(-18, 18, 8, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  // the cut piece falls away
  if (cp > 0.55) {
    const fp = clamp((cp - 0.55) / 0.45);
    ctx.save(); ctx.globalAlpha = 1 - fp * 0.6;
    ctx.translate(0, fp * H * 0.16); ctx.rotate(fp * 0.10);
    ctx.fillStyle = "#b9b19d";
    ctx.fillRect(W * 0.12, sy, W * 0.76 * 0.45, shh);
    ctx.restore();
  }
  ctx.restore();
  // headline over paper
  display(ctx, "EVERY LABEL — REMOVED", W / 2, Math.round(H * 0.665), Math.round(H * 0.072), clamp((t - 1.2) / 1.2), { color: "#26221a" });
  const chips = ["CLOTHES — CUT OUT", "BOTTLES — RUBBED CLEAN", "NOTHING SAID WHO SHE WAS"];
  let cw = 0;
  chips.forEach((c, i) => {
    const cp2 = clamp((t - 1.9 - i * 0.4) / 0.5);
    if (cp2 <= 0) return;
    ctx.save(); ctx.globalAlpha = cp2;
    const w = chip(ctx, c, W / 2, Math.round(H * (0.755 + i * 0.062)), Math.round(H * 0.019), { align: "center", color: "#5a4620", border: "rgba(90,70,32,0.5)", fill: "rgba(60,50,30,0.10)" });
    ctx.restore();
  });
  kicker(ctx, "ONE DETAIL REPEATED ITSELF", Math.round(W * 0.062), Math.round(H * 0.14), Math.round(H * 0.019), { color: "#7a5c28" });
}
function interpol_appeal(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 8, 0.04);
  // fingerprint arcs backdrop (left)
  const fp0 = clamp(t / 2);
  ctx.save(); ctx.globalAlpha = 0.16 * fp0;
  ctx.strokeStyle = S.amber; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(W * 0.22, H * 0.72, W * (0.028 + i * 0.016) * fp0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }
  ctx.restore();
  kicker(ctx, "POLICE APPEAL — VIA INTERPOL", Math.round(W * 0.062), Math.round(H * 0.16), Math.round(H * 0.019));
  const rows = [
    ["AGE", "25 – 40 YEARS"], ["HEIGHT", "1.64 M — SLIM BUILD"], ["HAIR", "BROWNISH-BLACK — LONG"],
    ["STYLE", "PONYTAIL — BLUE/WHITE RIBBON"],
  ];
  rows.forEach((r, i) => {
    const rp = clamp((t - 0.4 - i * 0.35) / 0.55);
    if (rp <= 0) return;
    const y = Math.round(H * (0.26 + i * 0.105));
    ctx.save(); ctx.globalAlpha = easeOut(rp);
    text(ctx, r[0], Math.round(W * 0.062), y, Math.round(H * 0.020), { family: S.mono, color: S.amber, spacing: 2 });
    font(ctx, Math.round(H * 0.040), S.serif, "bold");
    ctx.fillStyle = S.bone;
    ctx.fillText(r[1], Math.round(W * 0.062), y + Math.round(H * 0.052));
    ctx.restore();
  });
  const ep = clamp((t - 2.2) / 0.8);
  if (ep > 0) {
    ctx.save(); ctx.globalAlpha = ep;
    chip(ctx, "SKETCHES + FINGERPRINTS — TO EUROPE · N. AFRICA · MIDDLE EAST", Math.round(W * 0.062), Math.round(H * 0.70), Math.round(H * 0.0165), { color: S.boneDim });
    display(ctx, "NO ONE RECOGNISED HER", Math.round(W * 0.062), Math.round(H * 0.815), Math.round(H * 0.050), clamp((t - 2.6) / 1), { align: "left", color: S.bone });
    ctx.restore();
  }
  photoCard(ctx, "police_sketch.jpg", Math.round(W * 0.585), Math.round(H * 0.16), Math.round(W * 0.36), Math.round(H * 0.70),
    "POLICE SKETCH — 1970", "VIA BBC", clamp((t - 0.3) / 0.8), t, 0.05);
}

// ==================== BEAT 2 — FILE 2: THE SUITCASES ====================
function station(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "bergen_station.jpg", { zoom: [1.03, 1.12], pan: [0, 0.15, 0, -0.15], scrim: 0.55 });
  fog2(ctx, W, H, t, 7, 0.04);
  fileHeader(ctx, W, H, t, "FILE 2 / 8", "The Suitcases");
  chip(ctx, "BERGEN RAILWAY STATION — LEFT-LUGGAGE OFFICE", Math.round(W * 0.062), Math.round(H * 0.74), Math.round(H * 0.019), { color: S.amber, border: "rgba(210,168,94,0.5)" });
  display(ctx, "TWO SUITCASES WAITED", Math.round(W * 0.062), Math.round(H * 0.845), Math.round(H * 0.072), clamp((t - 0.6) / 1.2), { align: "left" });
  text(ctx, "Three days after the discovery — they belonged to her.", Math.round(W * 0.062), Math.round(H * 0.90), Math.round(H * 0.026), { family: S.body, color: S.boneDim, alpha: clamp((t - 1.4) / 1) });
  creditBR(ctx, W, H, "BERGEN STATION — FILE PHOTO: BANE NOR");
}
function suitcase_open(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 3, 0.04);
  kicker(ctx, "SUITCASE CONTENTS — RECONSTRUCTION", Math.round(W * 0.062), Math.round(H * 0.15), Math.round(H * 0.017), { alpha: 0.8 });
  // suitcase: lid (open, behind) + base
  const sw = W * 0.30, sh = H * 0.30;
  const sx = W * 0.115, syBase = H * 0.72;
  const lidP = ease(clamp((t - 0.2) / 1.2));
  glow(ctx, sx + sw * 0.5, syBase - sh * 0.35, W * 0.10, "rgba(226,196,130,0.10)", 1);
  // lid
  ctx.save();
  ctx.translate(sx + sw / 2, syBase);
  ctx.rotate(-lidP * 0.5);
  ctx.fillStyle = "#39424e";
  ctx.strokeStyle = "rgba(234,227,212,0.75)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(-sw / 2, -sh, sw, sh, 10); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(210,168,94,0.5)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-sw / 2 + 12, -sh + 12, sw - 24, sh - 24, 8); ctx.stroke();
  ctx.restore();
  // base
  ctx.fillStyle = "#414b58";
  ctx.strokeStyle = "rgba(234,227,212,0.75)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(sx, syBase, sw, sh * 0.92, 10); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(210,168,94,0.45)"; ctx.lineWidth = 2;
  ctx.strokeRect(sx + 14, syBase + 14, sw - 28, sh * 0.92 - 28);
  // handle
  ctx.strokeStyle = "rgba(234,227,212,0.85)"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(sx + sw * 0.38, syBase - sh * 0.10, sw * 0.24, sh * 0.12, 8); ctx.stroke();
  // items pop out as floating chips with leader dots
  const items = [
    { s: "CLOTHES + SHOES", c: S.boneDim }, { s: "WIGS — SEVERAL", c: S.boneDim },
    { s: "COSMETICS · COMB · HAIRBRUSH", c: S.boneDim }, { s: "MAPS + TIMETABLES", c: S.boneDim },
    { s: "COINS — BE · UK · CH + NOK", c: S.boneDim },
    { s: "GLASSES — FINGERPRINT MATCHED THE BODY", c: S.amber, hot: true },
    { s: "ECZEMA CREAM — PRESCRIPTION STICKER SCRAPED OFF", c: S.red, hot: true },
  ];
  items.forEach((it, i) => {
    const ip = clamp((t - 0.9 - i * 0.5) / 0.6);
    if (ip <= 0) return;
    const e = easeOut(ip);
    const y = H * (0.30 + i * 0.082);
    const rise = (1 - e) * 20;
    ctx.save(); ctx.globalAlpha = e;
    glow(ctx, W * 0.545, y - H * 0.008 + rise, W * (it.hot ? 0.008 : 0.005), it.hot ? "rgba(210,168,94,0.5)" : "rgba(234,227,212,0.28)", 1);
    ctx.fillStyle = it.c;
    ctx.beginPath(); ctx.arc(W * 0.545, y - H * 0.008 + rise, 4.5, 0, Math.PI * 2); ctx.fill();
    // leader to suitcase
    ctx.strokeStyle = "rgba(234,227,212,0.16)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.545, y - H * 0.008 + rise); ctx.lineTo(W * 0.50, y - H * 0.008 + rise); ctx.stroke();
    font(ctx, Math.round(H * 0.0285), it.hot ? S.mono : S.body, it.hot ? "bold" : "");
    ctx.fillStyle = it.c;
    ctx.fillText(it.s, W * 0.565, y + rise);
    ctx.restore();
  });
  chip(ctx, "EVERY MARK THAT COULD NAME HER — REMOVED", Math.round(W * 0.62), Math.round(H * 0.925), Math.round(H * 0.0165), { align: "center", color: S.boneDim, alpha: clamp((t - 4.6) / 0.8) });
}
function money_lining(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  kicker(ctx, "HIDDEN IN THE LINING", Math.round(W * 0.062), Math.round(H * 0.15), Math.round(H * 0.019));
  // cutaway suitcase with peeled lining
  const sw = W * 0.30, sh = H * 0.40;
  const sx = W * 0.10, sy = H * 0.30;
  ctx.fillStyle = "#232830";
  ctx.strokeStyle = "rgba(234,227,212,0.55)"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, 12); ctx.fill(); ctx.stroke();
  // peeled lining flap
  const peel = ease(clamp((t - 0.4) / 1.1));
  ctx.save();
  ctx.translate(sx + sw * 0.5, sy + sh * 0.42);
  ctx.rotate(-peel * 0.42);
  ctx.fillStyle = "#4a4436";
  ctx.beginPath(); ctx.roundRect(-sw * 0.42, -sh * 0.30, sw * 0.84, sh * 0.60, 6); ctx.fill();
  ctx.strokeStyle = "rgba(234,227,212,0.30)"; ctx.lineWidth = 1.5;
  ctx.stroke(); ctx.setLineDash([7, 6]); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  // banknotes fan
  const np = clamp((t - 1.3) / 1.3);
  if (np > 0) {
    for (let i = 0; i < 5; i++) {
      const ip = clamp(np * 5 - i);
      if (ip <= 0) continue;
      const a = -0.32 + i * 0.14;
      ctx.save();
      ctx.globalAlpha = easeOut(ip);
      ctx.translate(sx + sw * 0.52, sy + sh * 0.62);
      ctx.rotate(a);
      const bw = sw * 0.56, bh = sh * 0.26;
      ctx.fillStyle = "#cbb98a";
      ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
      ctx.strokeStyle = "rgba(70,55,25,0.7)"; ctx.lineWidth = 2;
      ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      ctx.fillStyle = "#6b5324"; ctx.beginPath(); ctx.arc(0, 0, bh * 0.30, 0, Math.PI * 2); ctx.stroke();
      text(ctx, "100", 0, bh * 0.10, Math.round(bh * 0.34), { family: S.serif, color: "#6b5324", align: "center", weight: "bold" });
      ctx.restore();
    }
    const sp = clamp((t - 2.2) / 0.7);
    if (sp > 0) { ctx.save(); ctx.globalAlpha = sp; stamp2(ctx, "500 DM", sx + sw * 0.54, sy + sh * 0.30, Math.round(H * 0.042), { angle: -0.09 }); ctx.restore(); }
  }
  // right column
  display(ctx, "SEWN INTO THE LINING", W * 0.72, Math.round(H * 0.32), Math.round(H * 0.052), clamp((t - 0.7) / 1), { align: "center" });
  display(ctx, "5 × 100 DEUTSCHE MARKS", W * 0.72, Math.round(H * 0.425), Math.round(H * 0.062), clamp((t - 1.6) / 1.1), { align: "center", color: S.amber });
  text(ctx, "≈ 137 US dollars at the time — unregistered.", W * 0.72, Math.round(H * 0.49), Math.round(H * 0.024), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 2.3) / 0.9) });
  // mini notepad with code scribbles
  const npad = clamp((t - 2.7) / 1);
  if (npad > 0) {
    ctx.save(); ctx.globalAlpha = npad;
    const nx = W * 0.60, ny = H * 0.565, nw = W * 0.235, nh = H * 0.33;
    paper(ctx, nx, ny, nw, nh, { tilt: 0.025 });
    const rnd = RNG(42);
    ctx.strokeStyle = "rgba(60,80,120,0.16)"; ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(nx + nw * 0.08, ny + nh * i / 8); ctx.lineTo(nx + nw * 0.92, ny + nh * i / 8); ctx.stroke(); }
    ctx.strokeStyle = "rgba(176,64,47,0.55)"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(nx + nw * 0.16, ny + 4); ctx.lineTo(nx + nw * 0.16, ny + nh - 4); ctx.stroke();
    const toks = ["O22 · O28 · P", "O29PS", "O29S", "O30 · BN5", "N4 · N9 · ??", "T14 · T15"];
    toks.forEach((tk, i) => {
      const tp = clamp(npad * 6 - i);
      if (tp <= 0) return;
      text(ctx, tk, nx + nw * 0.22, ny + nh * (0.14 + i * 0.13), Math.round(nh * 0.085), { family: S.mono, color: "#33302a", alpha: tp });
    });
    ctx.restore();
  }
  chip(ctx, "AND A NOTEPAD — WRITTEN IN CODE", W * 0.72, Math.round(H * 0.935), Math.round(H * 0.019), { align: "center", color: S.red, border: "rgba(176,64,47,0.55)", alpha: clamp((t - 3.4) / 0.8) });
}
function paris_inquiry(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "archive_folders.jpg", { zoom: [1.04, 1.10], dark: 0.42 });
  kicker(ctx, "THE INQUIRY REACHES PARIS", W / 2, Math.round(H * 0.22), Math.round(H * 0.020), { align: "center" });
  display(ctx, "GALERIES LAFAYETTE", W / 2, Math.round(H * 0.34), Math.round(H * 0.075), clamp((t - 0.3) / 1.1));
  text(ctx, "Department stores asked to recognise her cosmetics packaging.", W / 2, Math.round(H * 0.40), Math.round(H * 0.026), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 0.9) / 0.9) });
  // cosmetic bottles row (procedural, elegant)
  const bp = clamp((t - 1.2) / 1);
  if (bp > 0) {
    const cx0 = W / 2, cy = H * 0.52;
    [[-1.6, 0.9], [-0.9, 1.25], [0, 1.5], [0.9, 1.15], [1.7, 0.85]].forEach(([dx, hh], i) => {
      const ip = clamp(bp * 5 - i);
      if (ip <= 0) return;
      ctx.save(); ctx.globalAlpha = easeOut(ip);
      const bw = W * 0.017 * hh, bh = H * 0.075 * hh;
      const x = cx0 + dx * W * 0.030;
      ctx.strokeStyle = "rgba(234,227,212,0.75)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x - bw / 2, cy - bh, bw, bh, 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - bw * 0.22, cy - bh); ctx.lineTo(x - bw * 0.22, cy - bh - H * 0.022); ctx.lineTo(x + bw * 0.22, cy - bh - H * 0.022); ctx.lineTo(x + bw * 0.22, cy - bh); ctx.stroke();
      ctx.restore();
    });
    text(ctx, "PACKAGING SHOWN — STORE BY STORE", W / 2, H * 0.615, Math.round(H * 0.0155), { family: S.mono, color: S.boneFaint, align: "center", spacing: 2, alpha: clamp((t - 2.0) / 0.8) });
  }
  const rp = clamp((t - 2.4) / 0.6);
  if (rp > 0) {
    const sc = 1 + (1 - easeOut(rp)) * 1.1;
    ctx.save(); ctx.globalAlpha = rp; ctx.translate(W / 2, H * 0.775); ctx.scale(sc, sc);
    stamp2(ctx, "NO MATCH", 0, 0, Math.round(H * 0.105), { angle: -0.06 });
    ctx.restore();
  }
}
function suitcase_realisation(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 10, 0.04);
  kicker(ctx, "AT FIRST — OPTIMISM", W / 2, Math.round(H * 0.185), Math.round(H * 0.019), { align: "center" });
  // left optimistic card
  const pw = W * 0.34, ph = H * 0.30;
  const p1 = clamp((t - 0.4) / 0.7);
  if (p1 > 0) {
    ctx.save(); ctx.globalAlpha = easeOut(p1);
    paper(ctx, W * 0.115, H * 0.26, pw, ph, { tilt: -0.02 });
    text(ctx, "DAY 1 — THE WORKING ASSUMPTION", W * 0.115 + pw / 2, H * 0.335, Math.round(H * 0.0145), { family: S.mono, color: "#7a6a3e", align: "center", spacing: 1.5 });
    font(ctx, Math.round(H * 0.040), S.serif, "bold"); ctx.fillStyle = S.ink; ctx.textAlign = "center";
    ctx.fillText("A SUITCASE NAMES", W * 0.115 + pw / 2, H * 0.42);
    ctx.fillText("ITS OWNER IN DAYS", W * 0.115 + pw / 2, H * 0.475);
    ctx.restore();
  }
  // arrow
  const ap = clamp((t - 1.5) / 0.5);
  if (ap > 0) {
    ctx.save(); ctx.globalAlpha = ap;
    ctx.strokeStyle = S.amber; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W * 0.475, H * 0.41); ctx.lineTo(W * 0.475 + (W * 0.05) * easeOut(ap), H * 0.41); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.475 + W * 0.05 * ap, H * 0.41); ctx.lineTo(W * 0.475 + W * 0.05 * ap - 12, H * 0.41 - 8); ctx.moveTo(W * 0.475 + W * 0.05 * ap, H * 0.41); ctx.lineTo(W * 0.475 + W * 0.05 * ap - 12, H * 0.41 + 8); ctx.stroke();
    ctx.restore();
  }
  // right realisation card
  const p2 = clamp((t - 1.9) / 0.7);
  if (p2 > 0) {
    ctx.save(); ctx.globalAlpha = easeOut(p2);
    paper(ctx, W * 0.545, H * 0.26, pw, ph, { tilt: 0.022 });
    ctx.strokeStyle = "rgba(176,64,47,0.65)"; ctx.lineWidth = 3;
    ctx.strokeRect(W * 0.545 + 4, H * 0.26 + 4, pw - 8, ph - 8);
    text(ctx, "THEN — THE REALISATION", W * 0.545 + pw / 2, H * 0.335, Math.round(H * 0.0145), { family: S.mono, color: S.red, align: "center", spacing: 1.5 });
    font(ctx, Math.round(H * 0.036), S.serif, "bold"); ctx.fillStyle = S.ink; ctx.textAlign = "center";
    ctx.fillText("EVERY LABEL WAS", W * 0.545 + pw / 2, H * 0.415);
    ctx.fillText("REMOVED — DELIBERATELY,", W * 0.545 + pw / 2, H * 0.468);
    ctx.fillText("BEFORE SHE DIED", W * 0.545 + pw / 2, H * 0.521);
    ctx.restore();
  }
  display(ctx, "NOTHING WOULD SPEAK HER NAME", W / 2, Math.round(H * 0.755), Math.round(H * 0.058), clamp((t - 2.6) / 1.1));
  chip(ctx, "HER CLOTHES · HER BELONGINGS · HERSELF", W / 2, Math.round(H * 0.83), Math.round(H * 0.018), { align: "center", color: S.boneDim, alpha: clamp((t - 3.2) / 0.8) });
}

// ==================== BEAT 3 — FILE 3: THE WOMAN AT THE HOTELS ====================
function hotel_card(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "bergen_1970s.jpg", { zoom: [1.05, 1.13], pan: [0.15, 0, -0.15, 0], scrim: 0.55 });
  fileHeader(ctx, W, H, t, "FILE 3 / 8", "The Woman at the Hotels");
  // ledger card
  const lw = W * 0.42, lh = H * 0.44;
  const lp = clamp((t - 0.5) / 0.8);
  if (lp > 0) {
    ctx.save(); ctx.globalAlpha = easeOut(lp);
    paper(ctx, W * 0.062, H * 0.30, lw, lh, { tilt: -0.016 });
    kicker(ctx, "GUEST LEDGER — 23 NOV 1970", W * 0.062 + lw * 0.06, H * 0.30 + lh * 0.12, Math.round(H * 0.0155), { color: "#7a5c28" });
    const rows = [
      ["HOTEL HORDAHEIMEN — CENTRAL BERGEN", S.ink],
      ["ROOM 407 — CHECKED OUT 23 NOV", S.ink],
      ["BILL PAID — IN CASH", S.ink],
      ["TAXI REQUESTED — TO THE STATION", S.ink],
    ];
    rows.forEach((r, i) => {
      const rp = clamp(lp * 4 - i);
      if (rp <= 0) return;
      text(ctx, r[0], W * 0.062 + lw * 0.06, H * 0.30 + lh * (0.24 + i * 0.135), Math.round(H * 0.0245), { family: S.body, color: r[1], alpha: rp, weight: "bold" });
    });
    ctx.restore();
  }
  display(ctx, "THEN SIX DAYS", W * 0.775, Math.round(H * 0.44), Math.round(H * 0.068), clamp((t - 1.5) / 1), { align: "center" });
  display(ctx, "OF NOTHING", W * 0.775, Math.round(H * 0.525), Math.round(H * 0.068), clamp((t - 1.9) / 1), { align: "center", color: S.amber });
  text(ctx, "What she did between 23 and 29 November is not known.", W * 0.775, Math.round(H * 0.595), Math.round(H * 0.023), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 2.5) / 0.9) });
  creditBR(ctx, W, H, "BERGEN — FILE PHOTO: LIFE IN NORWAY");
}
function witness_cards(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 12, 0.03);
  kicker(ctx, "WITNESS ACCOUNTS — HOTEL STAFF", W / 2, Math.round(H * 0.155), Math.round(H * 0.019), { align: "center" });
  display(ctx, "WHAT THE STAFF REMEMBERED", W / 2, Math.round(H * 0.245), Math.round(H * 0.052), clamp((t - 0.2) / 1));
  const cards = [
    { h: "\u201CSHE SEEMED — ON GUARD\u201D", b: "Kept to her room. Asked to change rooms — three times on one stay.", tilt: -0.03, x: 0.115 },
    { h: "WIGS", b: "People noticed she wore wigs — different styles, different hotels.", tilt: 0.015, x: 0.395 },
    { h: "GARLIC — AND THREE LANGUAGES", b: "A smell of garlic. Heard speaking English, some German, Flemish.", tilt: -0.018, x: 0.675 },
  ];
  cards.forEach((c, i) => {
    const cp = clamp((t - 0.8 - i * 0.7) / 0.7);
    if (cp <= 0) return;
    ctx.save(); ctx.globalAlpha = easeOut(cp);
    const cw = W * 0.21, chh = H * 0.38, cx = W * c.x, cy = H * 0.36 + (i % 2) * H * 0.018;
    paper(ctx, cx, cy, cw, chh, { tilt: c.tilt });
    // tape
    ctx.save(); ctx.translate(cx + cw / 2, cy); ctx.rotate(c.tilt * -1.4);
    ctx.fillStyle = "rgba(200,190,150,0.5)"; ctx.fillRect(-cw * 0.14, -10, cw * 0.28, 20);
    ctx.restore();
    text(ctx, c.h, cx + cw * 0.08, cy + chh * 0.20, Math.round(H * 0.0235), { family: S.serif, color: S.ink, weight: "bold", alpha: cp });
    // wrapped body text
    font(ctx, Math.round(H * 0.0205), S.body, "");
    ctx.fillStyle = "#4a4438"; ctx.textAlign = "left";
    const words = c.b.split(" "); let line = "", yy = cy + chh * 0.33;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > cw * 0.84 && line) { ctx.fillText(line, cx + cw * 0.08, yy); line = w; yy += H * 0.034; }
      else line = test;
    }
    if (line) ctx.fillText(line, cx + cw * 0.08, yy);
    ctx.restore();
  });
  chip(ctx, "GOOD-LOOKING · c. 1.63 M · DARK BROWN HAIR · SMALL BROWN EYES", W / 2, Math.round(H * 0.885), Math.round(H * 0.0165), { align: "center", color: S.boneDim, alpha: clamp((t - 3.4) / 0.8) });
}
function neptun_card(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  // dark restaurant window scene (vector, clearly stylised)
  const wx = W * 0.085, wy = H * 0.22, ww = W * 0.50, wh = H * 0.60;
  ctx.save();
  ctx.fillStyle = "rgba(20,26,34,0.9)"; ctx.fillRect(wx, wy, ww, wh);
  ctx.strokeStyle = "rgba(234,227,212,0.4)"; ctx.lineWidth = 3; ctx.strokeRect(wx, wy, ww, wh);
  // interior glow
  const ig = ctx.createRadialGradient(wx + ww / 2, wy + wh * 0.6, 0, wx + ww / 2, wy + wh * 0.6, ww * 0.7);
  ig.addColorStop(0, "rgba(226,196,130,0.16)"); ig.addColorStop(1, "rgba(226,196,130,0)");
  ctx.fillStyle = ig; ctx.fillRect(wx, wy, ww, wh);
  // table + two navy silhouettes
  const ty = wy + wh * 0.66;
  ctx.fillStyle = "rgba(234,227,212,0.20)";
  ctx.fillRect(wx + ww * 0.38, ty, ww * 0.26, 8);
  ctx.fillRect(wx + ww * 0.47, ty + 8, 6, wh * 0.22); ctx.fillRect(wx + ww * 0.55, ty + 8, 6, wh * 0.22);
  const sil = (x, s, a) => {
    ctx.fillStyle = `rgba(10,12,16,${a})`;
    ctx.beginPath(); ctx.arc(x, ty - wh * 0.16 * s, wh * 0.055 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(x - wh * 0.075 * s, ty - wh * 0.105 * s, wh * 0.15 * s, wh * 0.28 * s, 8); ctx.fill();
  };
  sil(wx + ww * 0.42, 1.0, 0.85); sil(wx + ww * 0.60, 1.05, 0.85); // two German navy men
  // officer cap hint on one
  ctx.fillStyle = "rgba(234,227,212,0.25)";
  ctx.fillRect(wx + ww * 0.565, ty - wh * 0.235, wh * 0.075, wh * 0.020);
  // lone woman near, never with
  sil(wx + ww * 0.16, 0.92, 0.9);
  ctx.strokeStyle = "rgba(210,168,94,0.75)"; ctx.lineWidth = 2; ctx.setLineDash([5, 6]);
  ctx.beginPath(); ctx.arc(wx + ww * 0.16, ty - wh * 0.10, wh * 0.20, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  text(ctx, "NEAR — NEVER WITH", wx + ww * 0.16, ty + wh * 0.16, Math.round(H * 0.0155), { family: S.mono, color: S.amber, align: "center", alpha: clamp((t - 1.6) / 0.8) });
  ctx.restore();
  kicker(ctx, "HOTEL NEPTUN — OBSERVED (BBC, 2017)", Math.round(W * 0.655), Math.round(H * 0.235), Math.round(H * 0.0165));
  display(ctx, "\u201CTRAVELLING", W * 0.775, Math.round(H * 0.385), Math.round(H * 0.055), clamp((t - 0.4) / 0.9), { align: "center" });
  display(ctx, "SALESWOMAN\u201D", W * 0.775, Math.round(H * 0.455), Math.round(H * 0.055), clamp((t - 0.7) / 0.9), { align: "center" });
  display(ctx, "\u201CANTIQUITIES DEALER\u201D", W * 0.775, Math.round(H * 0.555), Math.round(H * 0.042), clamp((t - 1.1) / 0.9), { align: "center", color: S.amber });
  text(ctx, "Another witness overheard her talking with a man — in German.", W * 0.775, Math.round(H * 0.645), Math.round(H * 0.024), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 1.9) / 0.9), maxWidth: W * 0.30 });
  chip(ctx, "WHAT SHE TOLD PEOPLE SHE WAS", Math.round(W * 0.655), Math.round(H * 0.885), Math.round(H * 0.016), { color: S.boneFaint, alpha: clamp((t - 2.4) / 0.8) });
}
function stavanger_card(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  photoCard(ctx, "stavanger_street.jpg", Math.round(W * 0.545), Math.round(H * 0.16), Math.round(W * 0.395), Math.round(H * 0.68),
    "GAMLE STAVANGER — OLD TOWN", "FILE PHOTO", clamp((t - 0.2) / 0.8), t, 0.05);
  kicker(ctx, "STAVANGER — OCTOBER 1970", Math.round(W * 0.062), Math.round(H * 0.175), Math.round(H * 0.019));
  // shop card
  const sp = clamp((t - 0.5) / 0.8);
  if (sp > 0) {
    ctx.save(); ctx.globalAlpha = easeOut(sp);
    paper(ctx, W * 0.062, H * 0.245, W * 0.40, H * 0.30, { tilt: -0.014 });
    text(ctx, "OSCAR R\u00D8RTVEDT — FOOTWEAR", W * 0.062 + W * 0.02, H * 0.245 + H * 0.075, Math.round(H * 0.0265), { family: S.serif, color: S.ink, weight: "bold" });
    const rows = ["TOOK FAR LONGER THAN MOST CUSTOMERS", "THE SALESMEN REMEMBERED — ACCENT · GARLIC · CALM", "THE SALE LED POLICE TO HER HOTEL — ANOTHER FALSE NAME"];
    rows.forEach((r, i) => {
      const rp = clamp(sp * 3 - i);
      if (rp <= 0) return;
      text(ctx, "— " + r, W * 0.062 + W * 0.02, H * 0.245 + H * (0.16 + i * 0.085), Math.round(H * 0.0195), { family: S.body, color: "#4a4438", alpha: rp });
    });
    ctx.restore();
  }
  display(ctx, "THE BOOTS", W * 0.262, Math.round(H * 0.685), Math.round(H * 0.062), clamp((t - 1.6) / 0.9), { align: "center" });
  display(ctx, "MATCHED THE SCENE", W * 0.262, Math.round(H * 0.76), Math.round(H * 0.044), clamp((t - 1.9) / 0.9), { align: "center", color: S.amber });
  chip(ctx, "SO DID THE UMBRELLA", Math.round(W * 0.262), Math.round(H * 0.83), Math.round(H * 0.0165), { align: "center", color: S.boneDim, alpha: clamp((t - 2.4) / 0.8) });
  creditBR(ctx, W, H, "");
}
function alias_list(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "train_winter.jpg", { zoom: [1.06, 1.13], pan: [0, 0, 0, -0.2], dark: 0.55, scrim: 0.3 });
  kicker(ctx, "HANDWRITING ANALYSIS TIED THE HOTEL FORMS TOGETHER", Math.round(W * 0.062), Math.round(H * 0.155), Math.round(H * 0.0175));
  display(ctx, "AT LEAST EIGHT NAMES", Math.round(W * 0.062), Math.round(H * 0.245), Math.round(H * 0.058), clamp((t - 0.3) / 1), { align: "left" });
  const aliases = ["GENEVIÈVE LANCIER", "CLAUDIA TIELT", "CLAUDIA NIELSEN", "ALEXIA ZARNE-MERCHEZ", "VERA JARLE", "FENELLA LORCH", "ELISABETH LEENHOUWER"];
  const colX = [0.062, 0.40];
  aliases.forEach((a, i) => {
    const ap = clamp((t - 0.9 - i * 0.32) / 0.5);
    if (ap <= 0) return;
    const cx = W * colX[i % 2], cy = H * (0.325 + Math.floor(i / 2) * 0.115);
    ctx.save(); ctx.globalAlpha = easeOut(ap);
    ctx.fillStyle = "rgba(12,15,20,0.55)";
    const bw = W * 0.31, bh = H * 0.082;
    ctx.fillRect(cx, cy - bh * 0.62, bw, bh);
    ctx.strokeStyle = "rgba(234,227,212,0.22)"; ctx.lineWidth = 1;
    ctx.strokeRect(cx + 0.5, cy - bh * 0.62 + 0.5, bw - 1, bh - 1);
    font(ctx, Math.round(H * 0.030), S.serif, "bold");
    ctx.fillStyle = S.bone; ctx.textAlign = "left";
    ctx.fillText(a, cx + W * 0.014, cy);
    chip(ctx, "BELGIAN", cx + bw - W * 0.075, cy - H * 0.018, Math.round(H * 0.0125), { color: S.amber, border: "rgba(210,168,94,0.45)", fill: "rgba(20,16,8,0.4)" });
    ctx.restore();
  });
  const wp = clamp((t - 3.4) / 0.9);
  if (wp > 0) {
    ctx.save(); ctx.globalAlpha = wp;
    display(ctx, "MARCH → NOVEMBER 1970", W * 0.775, Math.round(H * 0.775), Math.round(H * 0.038), wp, { align: "center", color: S.slate });
    chip(ctx, "8+ ALIASES — ONE CLAIMED NATIONALITY", Math.round(W * 0.062), Math.round(H * 0.875), Math.round(H * 0.018), { color: S.red, border: "rgba(176,64,47,0.55)" });
    chip(ctx, "FORMS WRITTEN IN GERMAN OR FRENCH — NEARLY EVERY ADDRESS FALSE", Math.round(W * 0.062), Math.round(H * 0.935), Math.round(H * 0.0165), { color: S.boneDim, alpha: clamp((t - 3.9) / 0.8) });
    ctx.restore();
  }
  creditBR(ctx, W, H, "WINTER RAILWAY — FILE PHOTO: TRIP.COM");
}
// ==================== BEAT 4 — FILE 4: THE NOTEBOOK ====================
function notebook_intro(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 13, 0.035);
  fileHeader(ctx, W, H, t, "FILE 4 / 8", "The Notebook");
  // big notepad right
  const nx = W * 0.52, ny = H * 0.24, nw = W * 0.40, nh = H * 0.62;
  const np = clamp((t - 0.4) / 0.8);
  if (np > 0) {
    ctx.save(); ctx.globalAlpha = easeOut(np);
    paper(ctx, nx, ny, nw, nh, { tilt: 0.018 });
    // spiral binding
    ctx.strokeStyle = "rgba(80,70,50,0.6)"; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const bx = nx + nw * (0.09 + i * 0.10);
      ctx.beginPath(); ctx.arc(bx, ny + 8, 5, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(60,80,120,0.15)";
    for (let i = 1; i < 10; i++) { const yy = ny + nh * (0.12 + i * 0.085); ctx.beginPath(); ctx.moveTo(nx + nw * 0.07, yy); ctx.lineTo(nx + nw * 0.93, yy); ctx.stroke(); }
    const toks = ["O22 · O28 · P", "O29PS", "O29S", "O30 · BN5", "N4 · N9 · ??"];
    toks.forEach((tk, i) => {
      const tp = clamp(np * 5 - i);
      if (tp <= 0) return;
      text(ctx, tk, nx + nw * 0.10, ny + nh * (0.16 + i * 0.085), Math.round(nh * 0.062), { family: S.mono, color: "#33302a", alpha: tp });
    });
    ctx.restore();
  }
  display(ctx, "A NOTEPAD", W * 0.28, Math.round(H * 0.44), Math.round(H * 0.070), clamp((t - 0.7) / 0.9), { align: "center" });
  display(ctx, "WRITTEN IN CODE", W * 0.28, Math.round(H * 0.53), Math.round(H * 0.070), clamp((t - 1.1) / 0.9), { align: "center", color: S.amber });
  text(ctx, "When police finally cracked it, the answer was almost ordinary.", W * 0.28, Math.round(H * 0.615), Math.round(H * 0.024), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 1.7) / 0.9), maxWidth: W * 0.36 });
  chip(ctx, "PARTIALLY DECODED", Math.round(W * 0.28), Math.round(H * 0.71), Math.round(H * 0.017), { align: "center", color: S.boneDim, alpha: clamp((t - 2.2) / 0.8) });
}
function code_decode(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  kicker(ctx, "THE CODE, CRACKED", Math.round(W * 0.062), Math.round(H * 0.15), Math.round(H * 0.019));
  display(ctx, "THE CODE RECORDED JOURNEYS", W / 2, Math.round(H * 0.235), Math.round(H * 0.058), clamp((t - 0.15) / 0.9));
  const rows = [
    ["O22 – O28 · P", "PARIS", "22–28 OCTOBER"],
    ["O29 · PS", "PARIS → STAVANGER", "TRAVEL DAY"],
    ["O29 · S", "STAVANGER", "29 OCTOBER"],
    ["O30 · BN5", "BERGEN 30.10 – 05.11", "THE LAST STAY"],
  ];
  rows.forEach((r, i) => {
    const rp = clamp((t - 0.7 - i * 0.75) / 0.6);
    if (rp <= 0) return;
    const y = H * (0.335 + i * 0.145);
    const e = easeOut(rp);
    ctx.save(); ctx.globalAlpha = e;
    // code chip
    ctx.fillStyle = "rgba(36,44,56,0.92)";
    const cw = W * 0.235, chh = H * 0.095;
    const cx = W * 0.075;
    ctx.fillRect(cx, y - chh * 0.55, cw, chh);
    ctx.strokeStyle = "rgba(210,168,94,0.55)"; ctx.lineWidth = 1.6;
    ctx.strokeRect(cx + 0.5, y - chh * 0.55 + 0.5, cw - 1, chh - 1);
    text(ctx, r[0], cx + cw * 0.5, y - chh * 0.02, Math.round(H * 0.032), { family: S.mono, color: S.amber, align: "center", weight: "bold" });
    // arrow
    ctx.strokeStyle = "rgba(234,227,212,0.5)"; ctx.lineWidth = 2.4;
    const ax0 = cx + cw + W * 0.012, ax1 = ax0 + W * 0.045 * e;
    ctx.beginPath(); ctx.moveTo(ax0, y - chh * 0.08); ctx.lineTo(ax1, y - chh * 0.08); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax1, y - chh * 0.08); ctx.lineTo(ax1 - 11, y - chh * 0.08 - 7); ctx.moveTo(ax1, y - chh * 0.08); ctx.lineTo(ax1 - 11, y - chh * 0.08 + 7); ctx.stroke();
    // meaning
    font(ctx, Math.round(H * 0.041), S.serif, "bold");
    ctx.fillStyle = S.bone; ctx.textAlign = "left";
    ctx.fillText(r[1], ax1 + W * 0.018, y);
    text(ctx, r[2], ax1 + W * 0.018, y + H * 0.043, Math.round(H * 0.0155), { family: S.mono, color: S.boneFaint, alpha: e * 0.95 });
    ctx.restore();
  });
  chip(ctx, "ENTRY AFTER ENTRY — MATCHED A HOTEL STAY", Math.round(W * 0.062), Math.round(H * 0.935), Math.round(H * 0.018), { color: S.boneDim, alpha: clamp((t - 3.9) / 0.8) });
}
function notebook_close(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 14, 0.04);
  // notepad closing (scales down, tilts flat)
  const cp = ease(clamp((t - 0.2) / 1.4));
  const nw = W * 0.21 * (1 - cp * 0.35), nh = H * 0.34 * (1 - cp * 0.35);
  ctx.save();
  ctx.translate(W * 0.5, H * 0.40);
  ctx.rotate(cp * 0.10);
  ctx.globalAlpha = 0.9;
  const g = ctx.createLinearGradient(-nw / 2, -nh / 2, nw / 2, nh / 2);
  g.addColorStop(0, "#efe8d8"); g.addColorStop(1, "#d8cfba");
  ctx.fillStyle = g;
  ctx.fillRect(-nw / 2, -nh / 2, nw, nh);
  ctx.strokeStyle = "rgba(120,110,88,0.5)"; ctx.lineWidth = 1.5;
  ctx.strokeRect(-nw / 2, -nh / 2, nw, nh);
  ctx.strokeStyle = "rgba(90,80,60,0.4)";
  for (let i = 1; i < 6; i++) { const yy = -nh / 2 + nh * i / 6; ctx.beginPath(); ctx.moveTo(-nw * 0.4, yy); ctx.lineTo(nw * 0.4, yy); ctx.stroke(); }
  ctx.restore();
  display(ctx, "A PRIVATE TRAVEL LOG", W / 2, Math.round(H * 0.635), Math.round(H * 0.060), clamp((t - 0.9) / 1));
  display(ctx, "PLACES, AND DATES. NOTHING MORE.", W / 2, Math.round(H * 0.725), Math.round(H * 0.042), clamp((t - 1.4) / 1.1), { color: S.boneDim });
  chip(ctx, "TRAVEL LOG — NOT ESPIONAGE MATERIAL", W / 2, Math.round(H * 0.825), Math.round(H * 0.019), { align: "center", color: S.amber, border: "rgba(210,168,94,0.5)", alpha: clamp((t - 2.1) / 0.8) });
}

// ==================== BEAT 5 — FILE 5: THE VERDICT ====================
function autopsy_card(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 15, 0.035);
  fileHeader(ctx, W, H, t, "FILE 5 / 8", "The Verdict");
  // big stat left
  const sp = clamp((t - 0.5) / 1);
  if (sp > 0) {
    ctx.save(); ctx.globalAlpha = easeOut(sp);
    kicker(ctx, "GADES INSTITUTT — AUTOPSY FINDING", Math.round(W * 0.062), Math.round(H * 0.31), Math.round(H * 0.0165));
    display(ctx, "50 – 70", Math.round(W * 0.062), Math.round(H * 0.52), Math.round(H * 0.170), clamp((t - 0.3) / 1.0), { align: "left", color: S.bone });
    text(ctx, "FENEMAL SLEEPING PILLS — STILL NOT FULLY", Math.round(W * 0.062), Math.round(H * 0.605), Math.round(H * 0.0235), { family: S.mono, color: S.boneDim, alpha: clamp((t - 1.5) / 0.8) });
    text(ctx, "ABSORBED — A FOREIGN BRAND, IN HER STOMACH", Math.round(W * 0.062), Math.round(H * 0.645), Math.round(H * 0.0235), { family: S.mono, color: S.boneDim, alpha: clamp((t - 1.6) / 0.8) });
    ctx.restore();
  }
  // right stat stack
  const rp = clamp((t - 1.9) / 0.9);
  if (rp > 0) {
    ctx.save(); ctx.globalAlpha = easeOut(rp);
    const bx = W * 0.72;
    ctx.fillStyle = "rgba(34,41,52,0.88)";
    ctx.fillRect(bx - W * 0.16, H * 0.30, W * 0.32, H * 0.40);
    ctx.strokeStyle = "rgba(234,227,212,0.22)"; ctx.lineWidth = 1;
    ctx.strokeRect(bx - W * 0.16 + 0.5, H * 0.30 + 0.5, W * 0.32 - 1, H * 0.40 - 1);
    display(ctx, "+ 12", bx, Math.round(H * 0.43), Math.round(H * 0.095), clamp(rp * 1.5), { align: "center", color: S.bone });
    text(ctx, "MORE PILLS — BESIDE THE BODY", bx, Math.round(H * 0.485), Math.round(H * 0.0175), { family: S.mono, color: S.boneDim, align: "center" });
    ctx.restore();
  }
  chip(ctx, "CARBON MONOXIDE  +  PHENOBARBITAL — COMBINED", Math.round(W * 0.062), Math.round(H * 0.775), Math.round(H * 0.0195), { color: S.amber, border: "rgba(210,168,94,0.5)", alpha: clamp((t - 2.6) / 0.8) });
  chip(ctx, "DEATH, THEN FIRE — OR FIRE, THEN DEATH?", Math.round(W * 0.062), Math.round(H * 0.85), Math.round(H * 0.0165), { color: S.boneFaint, alpha: clamp((t - 3.1) / 0.8) });
}
function autopsy_facts(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  kicker(ctx, "WHAT THE AUTOPSY FOUND", W / 2, Math.round(H * 0.16), Math.round(H * 0.019), { align: "center" });
  display(ctx, "SHE WAS ALIVE AS THE FIRE REACHED HER", W / 2, Math.round(H * 0.26), Math.round(H * 0.056), clamp((t - 0.15) / 0.9));
  const panels = [
    { k: "SOOT IN HER LUNGS", b: "Smoke breathed before death — the fire was not instantaneous.", c: S.bone },
    { k: "NECK BRUISE — UNEXPLAINED", b: "Right side. Possibly a fall. Possibly a blow. Never resolved.", c: S.red, border: "rgba(176,64,47,0.6)" },
    { k: "NO ILLNESS — NEVER A CHILD", b: "No signs of disease. She had never given birth.", c: S.slate },
  ];
  panels.forEach((p, i) => {
    const pp = clamp((t - 0.9 - i * 0.8) / 0.7);
    if (pp <= 0) return;
    const pw = W * 0.27, phh = H * 0.34;
    const px = W * (0.075 + i * 0.325), py = H * 0.36 + (i % 2) * H * 0.02;
    ctx.save(); ctx.globalAlpha = easeOut(pp);
    ctx.fillStyle = "rgba(30,37,47,0.90)";
    ctx.fillRect(px, py, pw, phh);
    ctx.strokeStyle = p.border || "rgba(234,227,212,0.25)"; ctx.lineWidth = 1.6;
    ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, phh - 1);
    ctx.fillStyle = p.c; ctx.fillRect(px, py, pw * 0.006 * pp, 6);
    text(ctx, p.k, px + pw * 0.08, py + phh * 0.20, Math.round(H * 0.0235), { family: S.mono, color: p.c, weight: "bold" });
    font(ctx, Math.round(H * 0.0225), S.body, "");
    ctx.fillStyle = S.boneDim; ctx.textAlign = "left";
    const words = p.b.split(" "); let line = "", yy = py + phh * 0.34;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > pw * 0.84 && line) { ctx.fillText(line, px + pw * 0.08, yy); line = w; yy += H * 0.036; }
      else line = test;
    }
    if (line) ctx.fillText(line, px + pw * 0.08, yy);
    ctx.restore();
  });
  chip(ctx, "THE BODY CONTRADICTED A SIMPLE STORY", W / 2, Math.round(H * 0.885), Math.round(H * 0.0175), { align: "center", color: S.boneDim, alpha: clamp((t - 3.4) / 0.8) });
}
function dental_card(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 16, 0.03);
  fileHeader(ctx, W, H, t, "FILE 5 / 8", "The Teeth");
  // dental arc RECONSTRUCTION
  const cx = W * 0.30, cy = H * 0.56, R = W * 0.135;
  const ap = clamp((t - 0.4) / 1.4);
  const totalTeeth = 14, upper = 8;
  for (let i = 0; i < totalTeeth; i++) {
    const ip = clamp(ap * totalTeeth - i);
    if (ip <= 0) continue;
    const filled = i < 9;           // 14 filled of 28 shown? — visual: mark 14 of the displayed set
    const gold = i === 2 || i === 5 || i === 9;
    const ang = Math.PI * (0.15 + (i / (totalTeeth - 1)) * 0.7);
    const tx = cx + Math.cos(ang) * R * (i < upper ? 1 : 0.78);
    const ty = cy - Math.abs(Math.sin(ang)) * R * (i < upper ? 0.62 : 0.46);
    ctx.save(); ctx.globalAlpha = easeOut(ip);
    const tw = W * 0.0135, th = H * 0.040;
    ctx.translate(tx, ty); ctx.rotate(Math.cos(ang) * 0.5);
    if (gold) {
      const gg = ctx.createLinearGradient(-tw, -th, tw, th);
      gg.addColorStop(0, "#e8c877"); gg.addColorStop(0.5, "#b8923c"); gg.addColorStop(1, "#e8c877");
      ctx.fillStyle = gg;
    } else if (filled) ctx.fillStyle = "rgba(234,227,212,0.92)";
    else ctx.fillStyle = "rgba(234,227,212,0.28)";
    ctx.beginPath(); ctx.roundRect(-tw / 2, -th / 2, tw, th, 4); ctx.fill();
    ctx.strokeStyle = "rgba(10,12,16,0.6)"; ctx.lineWidth = 1; ctx.strokeRect(-tw / 2, -th / 2, tw, th);
    ctx.restore();
  }
  ctx.save(); ctx.globalAlpha = clamp(ap * 1.3);
  ctx.strokeStyle = "rgba(234,227,212,0.30)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy + R * 0.35, R * 1.02, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke();
  ctx.restore();
  text(ctx, "RECONSTRUCTION — DENTAL CHART", cx, cy + R * 0.62, Math.round(H * 0.0155), { family: S.mono, color: S.boneFaint, align: "center", alpha: clamp((t - 1.4) / 0.8) });
  // right facts
  display(ctx, "14 FILLED TEETH", W * 0.755, Math.round(H * 0.335), Math.round(H * 0.058), clamp((t - 0.8) / 1), { align: "center" });
  display(ctx, "SEVERAL — GOLD CROWNS", W * 0.755, Math.round(H * 0.425), Math.round(H * 0.040), clamp((t - 1.3) / 1), { align: "center", color: S.amber });
  text(ctx, "A kind of work seen in the Far East, Central/Southern Europe,", W * 0.755, Math.round(H * 0.50), Math.round(H * 0.0235), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 1.8) / 0.9), maxWidth: W * 0.38 });
  text(ctx, "and South America — and NOT in Norway.", W * 0.755, Math.round(H * 0.545), Math.round(H * 0.0235), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 2.0) / 0.9), maxWidth: W * 0.38 });
  chip(ctx, "DENTAL WORK: NOT NORWEGIAN", Math.round(W * 0.755), Math.round(H * 0.635), Math.round(H * 0.018), { align: "center", color: S.red, border: "rgba(176,64,47,0.55)", alpha: clamp((t - 2.4) / 0.8) });
  text(ctx, "Her jaw was removed at the autopsy — preserved, for an", W * 0.755, Math.round(H * 0.72), Math.round(H * 0.0235), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 2.8) / 0.9), maxWidth: W * 0.38 });
  text(ctx, "identification everyone hoped would come.", W * 0.755, Math.round(H * 0.765), Math.round(H * 0.0235), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 3.0) / 0.9), maxWidth: W * 0.38 });
}
function verdict_card(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "archive_folders.jpg", { zoom: [1.05, 1.11], dark: 0.5 });
  kicker(ctx, "THE OFFICIAL CONCLUSION — 1970", W * 0.28, Math.round(H * 0.185), Math.round(H * 0.0165), { align: "center" });
  const p1 = clamp((t - 0.4) / 0.7);
  if (p1 > 0) {
    const sc = 1 + (1 - easeOut(p1)) * 0.8;
    ctx.save(); ctx.globalAlpha = p1; ctx.translate(W * 0.28, H * 0.40); ctx.scale(sc, sc);
    stamp2(ctx, "PROBABLE SUICIDE", 0, 0, Math.round(H * 0.052), { angle: -0.045 });
    ctx.restore();
    text(ctx, "SUPPORTED BY BERGEN'S CHIEF OF POLICE", W * 0.28, Math.round(H * 0.475), Math.round(H * 0.0155), { family: S.mono, color: S.boneFaint, align: "center", alpha: clamp((t - 1) / 0.8) });
  }
  // right: doubt
  const p2 = clamp((t - 1.2) / 0.8);
  if (p2 > 0) {
    ctx.save(); ctx.globalAlpha = p2;
    ctx.strokeStyle = "rgba(210,168,94,0.0)";
    kicker(ctx, "INSIDE THE INVESTIGATION — DOUBT", W * 0.735, Math.round(H * 0.185), Math.round(H * 0.0165), { align: "center", color: S.slate });
    font(ctx, Math.round(H * 0.050), S.serif, "bold");
    ctx.fillStyle = S.bone; ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 10;
    ctx.fillText("\u201CVERY FEW THOUGHT", W * 0.735, H * 0.335);
    ctx.fillText("IT WAS SUICIDE\u201D", W * 0.735, H * 0.405);
    ctx.shadowBlur = 0;
    text(ctx, "CARL HALVOR AAS — POLICE LAWYER (BBC, 2017)", W * 0.735, Math.round(H * 0.465), Math.round(H * 0.0155), { family: S.mono, color: S.amber, align: "center" });
    ctx.restore();
  }
  // bottom reasons
  const p3 = clamp((t - 2.1) / 0.9);
  if (p3 > 0) {
    ctx.save(); ctx.globalAlpha = p3;
    chip(ctx, "THE PLACE WAS REMOTE", W * 0.335, Math.round(H * 0.70), Math.round(H * 0.019), { align: "center" });
    chip(ctx, "THE METHOD WAS EXTRAORDINARY", W * 0.665, Math.round(H * 0.70), Math.round(H * 0.019), { align: "center" });
    display(ctx, "THE VERDICT NEVER SAT RIGHT", W / 2, Math.round(H * 0.845), Math.round(H * 0.048), clamp((t - 2.5) / 1));
    ctx.restore();
  }
}
function case_closed(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "moody_peak.jpg", { zoom: [1.05, 1.12], dark: 0.5 });
  display(ctx, "FEBRUARY 1971", W / 2, Math.round(H * 0.30), Math.round(H * 0.036), clamp((t - 0.2) / 0.9), { color: S.slate, weight: "" });
  const sp = clamp((t - 0.7) / 0.6);
  if (sp > 0) {
    const sc = 1 + (1 - easeOut(sp)) * 1.2;
    ctx.save(); ctx.globalAlpha = sp; ctx.translate(W / 2, H * 0.47); ctx.scale(sc, sc);
    stamp2(ctx, "CASE CLOSED", 0, 0, Math.round(H * 0.115), { angle: -0.05 });
    ctx.restore();
  }
  display(ctx, "NO NAME.  NO LEADS.", W / 2, Math.round(H * 0.67), Math.round(H * 0.055), clamp((t - 1.3) / 1));
  text(ctx, "The file went to the shelf. The questions did not.", W / 2, Math.round(H * 0.745), Math.round(H * 0.026), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 1.9) / 0.9) });
}

// ==================== BEAT 6 — FILE 6: THE THEORIES ====================
function theory_intro(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "moody_peak.jpg", { zoom: [1.03, 1.12], pan: [0.2, 0, -0.1, 0], dark: 0.30 });
  fog2(ctx, W, H, t, 17, 0.06);
  fileHeader(ctx, W, H, t, "FILE 6 / 8", "The Theories");
  display(ctx, "THE ERASURE FUELLED", Math.round(W * 0.062), Math.round(H * 0.40), Math.round(H * 0.068), clamp((t - 0.5) / 1), { align: "left" });
  display(ctx, "EVERYTHING AFTER", Math.round(W * 0.062), Math.round(H * 0.49), Math.round(H * 0.068), clamp((t - 0.9) / 1), { align: "left", color: S.amber });
  const chips = ["CUT LABELS", "SCRAPED SCRIPTS", "EIGHT NAMES"];
  chips.forEach((c, i) => {
    const cp = clamp((t - 1.5 - i * 0.35) / 0.5);
    if (cp <= 0) return;
    ctx.save(); ctx.globalAlpha = cp;
    chip(ctx, c, Math.round(W * (0.062 + i * 0.155)), Math.round(H * 0.585), Math.round(H * 0.018), { color: S.bone });
    ctx.restore();
  });
  text(ctx, "Bergen, 1970 — a city of Cold War rumour, with few foreign visitors.", Math.round(W * 0.062), Math.round(H * 0.68), Math.round(H * 0.026), { family: S.body, color: S.boneDim, alpha: clamp((t - 2.3) / 0.9) });
  chip(ctx, "THE EVIDENCE DOES NOT SETTLE WHAT FOLLOWED", Math.round(W * 0.062), Math.round(H * 0.93), Math.round(H * 0.0165), { color: S.boneFaint, alpha: clamp((t - 2.9) / 0.8) });
}
function theoryBoard(ctx, W, H, t, num, title, verdict, verdictColor) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 18 + num, 0.035);
  // theory tag
  const tp = clamp((t - 0.3) / 0.6);
  if (tp > 0) {
    ctx.save(); ctx.globalAlpha = tp;
    ctx.strokeStyle = verdictColor; ctx.lineWidth = 2.5;
    ctx.strokeRect(W * 0.062, H * 0.155, W * 0.235, H * 0.085);
    text(ctx, `THEORY ${num}`, W * 0.062 + W * 0.1175, Math.round(H * 0.205), Math.round(H * 0.024), { family: S.mono, color: verdictColor, align: "center", spacing: 4, weight: "bold" });
    ctx.restore();
  }
  display(ctx, title, W * 0.062, Math.round(H * 0.315), Math.round(H * 0.062), clamp((t - 0.5) / 1), { align: "left" });
  // verdict punch
  const vp = clamp((t - 1.4) / 0.8);
  if (vp > 0) {
    const sc = 1 + (1 - easeOut(vp)) * 0.5;
    ctx.save(); ctx.globalAlpha = vp; ctx.translate(W * 0.062 + W * 0.16, H * 0.445); ctx.scale(sc, sc);
    font(ctx, Math.round(H * 0.052), S.serif, "bold");
    ctx.fillStyle = verdictColor; ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 12;
    ctx.fillText(verdict, 0, 0);
    ctx.restore();
  }
}
function theory_murder(ctx, W, H, t, dur) {
  theoryBoard(ctx, W, H, t, 1, "MURDER", "ARGUED — NEVER PROVEN", S.red);
  const pts = ["THE REMOVED IDENTITY", "JEWELLERY PLACED AROUND THE BODY", "THE PETROL", "THE UNEXPLAINED NECK BRUISE"];
  pts.forEach((p, i) => {
    const pp = clamp((t - 1.9 - i * 0.45) / 0.5);
    if (pp <= 0) return;
    const y = H * (0.575 + i * 0.083);
    ctx.save(); ctx.globalAlpha = easeOut(pp);
    ctx.fillStyle = S.red;
    ctx.beginPath(); ctx.arc(W * 0.075, y - H * 0.007, 4, 0, Math.PI * 2); ctx.fill();
    font(ctx, Math.round(H * 0.0275), S.body, "");
    ctx.fillStyle = S.bone; ctx.textAlign = "left";
    ctx.fillText(p, W * 0.095, y);
    ctx.restore();
  });
  // right: counterweight
  const cp = clamp((t - 3.2) / 0.9);
  if (cp > 0) {
    ctx.save(); ctx.globalAlpha = cp;
    const bx = W * 0.70;
    ctx.fillStyle = "rgba(12,15,20,0.6)"; ctx.fillRect(bx - W * 0.155, H * 0.545, W * 0.31, H * 0.30);
    ctx.strokeStyle = "rgba(234,227,212,0.25)"; ctx.lineWidth = 1;
    ctx.strokeRect(bx - W * 0.155 + 0.5, H * 0.545 + 0.5, W * 0.31 - 1, H * 0.30 - 1);
    text(ctx, "THE OFFICIAL VERDICT", bx, Math.round(H * 0.615), Math.round(H * 0.0145), { family: S.mono, color: S.boneFaint, align: "center", spacing: 2 });
    display(ctx, "SUICIDE", bx, Math.round(H * 0.70), Math.round(H * 0.062), clamp(cp * 1.4), { align: "center", color: S.slate });
    text(ctx, "— never overturned, never confirmed", bx, Math.round(H * 0.75), Math.round(H * 0.0195), { family: S.body, color: S.boneDim, align: "center" });
    ctx.restore();
  }
  chip(ctx, "NO COURT HAS EVER RULED", Math.round(W * 0.062), Math.round(H * 0.93), Math.round(H * 0.0165), { color: S.boneFaint, alpha: clamp((t - 3.8) / 0.8) });
}
function theory_spy(ctx, W, H, t, dur) {
  theoryBoard(ctx, W, H, t, 2, "ESPIONAGE", "NEVER ESTABLISHED", S.slate);
  // mini map with test area
  const mm = clamp((t - 1.9) / 0.9);
  if (mm > 0) {
    ctx.save(); ctx.globalAlpha = mm;
    norwayMap(ctx, W * 0.062, H * 0.50, W * 0.34, H * 0.36, t, {
      p: mm, highlight: ["stavanger"],
      routes: [{ path: ["stavanger", "bergen"], p: clamp(mm * 1.3) }],
      marks: [{ x: 0.24, y: 0.68, label: "MISSILE TEST AREA — NORTH SEA", at: 0.5 }],
    });
    ctx.restore();
  }
  const pts = [
    ["DECLASSIFIED DEFENCE RECORDS", "Her movements \u201Cseem to correspond\u201D to top-secret Penguin missile trials"],
    ["A FISHERMAN'S ACCOUNT", "Placed her near the test area"],
    ["THE SHOE SALE", "Confirms she was in Stavanger in October"],
  ];
  pts.forEach((p, i) => {
    const pp = clamp((t - 1.9 - i * 0.6) / 0.6);
    if (pp <= 0) return;
    const x = W * 0.50, y = H * (0.545 + i * 0.115);
    ctx.save(); ctx.globalAlpha = easeOut(pp);
    text(ctx, p[0], x, y, Math.round(H * 0.0185), { family: S.mono, color: S.amber });
    font(ctx, Math.round(H * 0.0255), S.body, "");
    ctx.fillStyle = S.bone; ctx.textAlign = "left";
    ctx.fillText(p[1], x, y + H * 0.040);
    ctx.restore();
  });
  chip(ctx, "THE CRACKED NOTEBOOK HELD ONLY TRAVEL DATES", W * 0.70, Math.round(H * 0.90), Math.round(H * 0.0175), { align: "center", color: S.boneDim, alpha: clamp((t - 3.9) / 0.8) });
}
function theory_accounts(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  kicker(ctx, "SHADOWING THE FILE", W / 2, Math.round(H * 0.155), Math.round(H * 0.019), { align: "center" });
  display(ctx, "TWO ACCOUNTS — NEITHER VERIFIED", W / 2, Math.round(H * 0.245), Math.round(H * 0.050), clamp((t - 0.2) / 1));
  const cards = [
    { yr: "1991", who: "ANONYMOUS TAXI DRIVER", b: "Claimed a man joined the woman for the ride — from her hotel to the station.", x: 0.13 },
    { yr: "2005", who: "FL\u00D8YEN HIKER", b: "Saw her on the Fl\u00F8yen hillside days before — walking ahead of two men in coats.", x: 0.535 },
  ];
  cards.forEach((c, i) => {
    const cp = clamp((t - 0.8 - i * 0.9) / 0.8);
    if (cp <= 0) return;
    const cw = W * 0.335, chh = H * 0.42;
    const cx = W * c.x, cy = H * 0.33;
    ctx.save(); ctx.globalAlpha = easeOut(cp);
    ctx.fillStyle = "rgba(12,15,20,0.66)"; ctx.fillRect(cx, cy, cw, chh);
    ctx.strokeStyle = "rgba(234,227,212,0.28)"; ctx.lineWidth = 1.6;
    ctx.strokeRect(cx + 0.5, cy + 0.5, cw - 1, chh - 1);
    display(ctx, c.yr, cx + cw / 2, cy + chh * 0.26, Math.round(H * 0.085), clamp(cp * 1.5), { align: "center", color: S.bone });
    text(ctx, c.who, cx + cw / 2, cy + chh * 0.37, Math.round(H * 0.018), { family: S.mono, color: S.amber, align: "center", spacing: 2 });
    font(ctx, Math.round(H * 0.024), S.body, "");
    ctx.fillStyle = S.boneDim; ctx.textAlign = "left";
    const words = c.b.split(" "); let line = "", yy = cy + chh * 0.50;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > cw * 0.86 && line) { ctx.fillText(line, cx + cw * 0.07, yy); line = w; yy += H * 0.040; }
      else line = test;
    }
    if (line) ctx.fillText(line, cx + cw * 0.07, yy);
    // UNVERIFIED stamp
    const us = clamp(cp * 2 - 1);
    if (us > 0) {
      ctx.save(); ctx.translate(cx + cw * 0.5, cy + chh * 0.87);
      stamp2(ctx, "UNVERIFIED", 0, 0, Math.round(H * 0.030), { color: S.slate, angle: -0.05, alpha: us });
      ctx.restore();
    }
    ctx.restore();
  });
  chip(ctx, "RECORDED — AS RECORDED. NOTHING MORE.", W / 2, Math.round(H * 0.885), Math.round(H * 0.0175), { align: "center", color: S.boneFaint, alpha: clamp((t - 3.2) / 0.8) });
}
function theory_book(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 21, 0.035);
  // book cover card
  const bp = clamp((t - 0.3) / 0.8);
  if (bp > 0) {
    ctx.save(); ctx.globalAlpha = easeOut(bp);
    const bw = W * 0.24, bh = H * 0.56, bx = W * 0.135, by = H * 0.22;
    ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.fillRect(bx + 8, by + 12, bw, bh);
    const g = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    g.addColorStop(0, "#2c3440"); g.addColorStop(1, "#1c2129");
    ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "rgba(234,227,212,0.35)"; ctx.lineWidth = 2; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    text(ctx, "KVINNEN", bx + bw / 2, by + bh * 0.24, Math.round(bh * 0.085), { family: S.serif, color: S.bone, align: "center", weight: "bold" });
    text(ctx, "I ISDALEN", bx + bw / 2, by + bh * 0.33, Math.round(bh * 0.085), { family: S.serif, color: S.bone, align: "center", weight: "bold" });
    ctx.fillStyle = S.amber; ctx.fillRect(bx + bw * 0.3, by + bh * 0.40, bw * 0.4, 3);
    text(ctx, "DENNIS ZACHER ASKE — 2018", bx + bw / 2, by + bh * 0.88, Math.round(bh * 0.030), { family: S.mono, color: S.boneDim, align: "center" });
    ctx.restore();
  }
  kicker(ctx, "A DIFFERENT READING", W * 0.60, Math.round(H * 0.26), Math.round(H * 0.018));
  display(ctx, "ANOTHER HIDDEN", W * 0.60, Math.round(H * 0.39), Math.round(H * 0.058), clamp((t - 0.6) / 0.9), { align: "center" });
  display(ctx, "PROFESSION?", W * 0.60, Math.round(H * 0.475), Math.round(H * 0.058), clamp((t - 0.95) / 0.9), { align: "center", color: S.amber });
  text(ctx, "Goal-oriented routes. Anonymity. Men who were never traced.", W * 0.60, Math.round(H * 0.565), Math.round(H * 0.0255), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 1.5) / 0.9), maxWidth: W * 0.42 });
  chip(ctx, "A PUBLISHED ARGUMENT — NOT AN ESTABLISHED FACT", Math.round(W * 0.60), Math.round(H * 0.67), Math.round(H * 0.018), { align: "center", color: S.bone, alpha: clamp((t - 2.1) / 0.8) });
}
// ==================== BEAT 7 — FILE 7: THE BONES SPEAK ====================
function reopening(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "archive_folders.jpg", { zoom: [1.06, 1.12], pan: [-0.15, 0, 0.15, 0], dark: 0.45 });
  fileHeader(ctx, W, H, t, "FILE 7 / 8", "The Bones Speak");
  display(ctx, "2016 — THE CASE REOPENED", Math.round(W * 0.062), Math.round(H * 0.315), Math.round(H * 0.056), clamp((t - 0.4) / 1), { align: "left" });
  // cellar-find card
  const cp = clamp((t - 1.0) / 0.9);
  if (cp > 0) {
    ctx.save(); ctx.globalAlpha = easeOut(cp);
    const cw = W * 0.42, chh = H * 0.30, cx = W * 0.062, cy = H * 0.40;
    ctx.fillStyle = "rgba(12,15,20,0.68)"; ctx.fillRect(cx, cy, cw, chh);
    ctx.strokeStyle = "rgba(234,227,212,0.3)"; ctx.lineWidth = 1.6;
    ctx.strokeRect(cx + 0.5, cy + 0.5, cw - 1, chh - 1);
    kicker(ctx, "HAUKELAND UNIVERSITY HOSPITAL", cx + cw * 0.06, cy + chh * 0.18, Math.round(H * 0.0155));
    const rows = [
      "DR. INGE MORILD SEARCHED THE CELLAR ARCHIVE",
      "THE JAW — KEPT SINCE 1970, LONG ASSUMED DESTROYED — FOUND",
      "PARAFFIN BLOCKS OF TISSUE — PRESERVED BESIDE IT",
    ];
    rows.forEach((r, i) => {
      const rp = clamp(cp * 3 - i);
      if (rp <= 0) return;
      text(ctx, "— " + r, cx + cw * 0.06, cy + chh * (0.35 + i * 0.18), Math.round(H * 0.0205), { family: S.body, color: S.bone, alpha: rp });
    });
    ctx.restore();
  }
  display(ctx, "A SOURCE OF DNA", W * 0.775, Math.round(H * 0.52), Math.round(H * 0.062), clamp((t - 1.9) / 1), { align: "center" });
  display(ctx, "IN A SCIENCE THAT", W * 0.775, Math.round(H * 0.605), Math.round(H * 0.036), clamp((t - 2.3) / 0.9), { align: "center", color: S.boneDim });
  display(ctx, "DID NOT EXIST IN 1970", W * 0.775, Math.round(H * 0.665), Math.round(H * 0.036), clamp((t - 2.6) / 0.9), { align: "center", color: S.boneDim });
}
function isotope_card(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 22, 0.03);
  kicker(ctx, "2017 — ISOTOPE ANALYSIS OF THE TEETH", Math.round(W * 0.062), Math.round(H * 0.15), Math.round(H * 0.018));
  display(ctx, "THE WATER SHE DRANK AS A CHILD", W / 2, Math.round(H * 0.24), Math.round(H * 0.040), clamp((t - 0.2) / 1), { color: S.boneDim });
  // isotope waves (procedural, elegant)
  const wp = clamp((t - 0.6) / 1.4);
  ctx.save(); ctx.globalAlpha = wp;
  for (let L = 0; L < 2; L++) {
    ctx.strokeStyle = L === 0 ? "rgba(139,160,180,0.75)" : "rgba(210,168,94,0.75)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x <= W * 0.9 * easeOut(wp); x += 6) {
      const y = H * (0.335 + L * 0.05) + Math.sin(x / (90 + L * 40) + L * 2 + t * 0.6) * (14 + L * 6) * Math.sin(x / W * Math.PI);
      x === 0 ? ctx.moveTo(W * 0.05 + x, y) : ctx.lineTo(W * 0.05 + x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  text(ctx, "OXYGEN + STRONTIUM — READ FROM TOOTH ENAMEL", Math.round(W * 0.062), Math.round(H * 0.44), Math.round(H * 0.0155), { family: S.mono, color: S.boneFaint, alpha: clamp((t - 1.6) / 0.8) });
  // results
  const rp = clamp((t - 1.9) / 1);
  if (rp > 0) {
    display(ctx, "BORN c. 1930  ±  4 YEARS", W / 2, Math.round(H * 0.575), Math.round(H * 0.078), clamp(rp * 1.2));
    rule(ctx, W / 2, Math.round(H * 0.625), Math.round(W * 0.30), clamp(rp - 0.3));
  }
  const rp2 = clamp((t - 2.6) / 1);
  if (rp2 > 0) {
    display(ctx, "MOST LIKELY: IN OR NEAR NUREMBERG", W / 2, Math.round(H * 0.71), Math.round(H * 0.046), clamp(rp2), { color: S.amber });
    display(ctx, "CHILDHOOD: FRANCE / THE FRENCH–GERMAN BORDER", W / 2, Math.round(H * 0.785), Math.round(H * 0.030), clamp((t - 3.1) / 0.9), { color: S.boneDim });
  }
  chip(ctx, "HER HANDWRITING HAD ALREADY SUGGESTED A FRENCH EDUCATION", W / 2, Math.round(H * 0.90), Math.round(H * 0.0165), { align: "center", color: S.boneFaint, alpha: clamp((t - 3.7) / 0.8) });
}
function dna_card(ctx, W, H, t, dur) {
  basePlate(ctx, W, H, t);
  fog2(ctx, W, H, t, 23, 0.03);
  // BIG bright helix (the v1 failure inverted: now fully visible)
  const hp = clamp((t - 0.2) / 1.2);
  const hx = W * 0.26, hy0 = H * 0.16, hy1 = H * 0.90, coils = 6;
  ctx.save();
  ctx.globalAlpha = 0.95;
  const amp = W * 0.075;
  for (let strand = 0; strand < 2; strand++) {
    ctx.strokeStyle = strand === 0 ? "rgba(234,227,212,0.9)" : "rgba(210,168,94,0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let y = 0; y <= (hy1 - hy0) * hp; y += 4) {
      const ph = y / (hy1 - hy0) * Math.PI * 2 * coils + strand * Math.PI + t * 0.5;
      const x = hx + Math.sin(ph) * amp;
      y === 0 ? ctx.moveTo(x, hy0 + y) : ctx.lineTo(x, hy0 + y);
    }
    ctx.stroke();
  }
  // rungs
  const nR = Math.floor((hy1 - hy0) * hp / (H * 0.045));
  for (let i = 0; i <= nR; i++) {
    const y = i * H * 0.045;
    const ph = y / (hy1 - hy0) * Math.PI * 2 * coils + t * 0.5;
    const x1 = hx + Math.sin(ph) * amp, x2 = hx + Math.sin(ph + Math.PI) * amp;
    ctx.strokeStyle = `rgba(139,160,180,${0.35 + 0.35 * Math.abs(Math.sin(ph))})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x1, hy0 + y); ctx.lineTo(x2, hy0 + y); ctx.stroke();
  }
  ctx.restore();
  kicker(ctx, "THE DNA — WHAT IT COULD SAY", W * 0.585, Math.round(H * 0.20), Math.round(H * 0.018));
  const rows = [
    ["EXTENDED PROFILE", "EUROPEAN DESCENT", S.bone],
    ["MITOCHONDRIAL LINE", "HAPLOGROUP H24", S.amber],
  ];
  const subs = [null, "ROOTS IN S.E. EUROPE / S.W. ASIA"];
  rows.forEach((r, i) => {
    const rp = clamp((t - 0.9 - i * 0.9) / 0.8);
    if (rp <= 0) return;
    const y = H * (0.32 + i * 0.17);
    ctx.save(); ctx.globalAlpha = easeOut(rp);
    text(ctx, r[0], W * 0.585, y, Math.round(H * 0.0165), { family: S.mono, color: S.boneFaint, spacing: 2 });
    font(ctx, Math.round(H * 0.048), S.serif, "bold");
    ctx.fillStyle = r[2]; ctx.textAlign = "left";
    ctx.fillText(r[1], W * 0.585, y + H * 0.062);
    if (subs[i]) text(ctx, subs[i], W * 0.585, y + H * 0.105, Math.round(H * 0.0185), { family: S.mono, color: S.boneFaint, alpha: 0.9 });
    ctx.restore();
  });
  const rp3 = clamp((t - 2.9) / 0.9);
  if (rp3 > 0) {
    ctx.save(); ctx.globalAlpha = easeOut(rp3);
    ctx.fillStyle = "rgba(12,15,20,0.6)";
    ctx.fillRect(W * 0.565, H * 0.685, W * 0.40, H * 0.16);
    ctx.strokeStyle = "rgba(234,227,212,0.25)"; ctx.lineWidth = 1;
    ctx.strokeRect(W * 0.565 + 0.5, H * 0.685 + 0.5, W * 0.40 - 1, H * 0.16 - 1);
    text(ctx, "AND ONE MORE THREAD —", W * 0.765, Math.round(H * 0.745), Math.round(H * 0.0195), { family: S.mono, color: S.boneDim, align: "center" });
    text(ctx, "AN UNIDENTIFIED FRENCH PASSENGER", W * 0.765, Math.round(H * 0.79), Math.round(H * 0.0235), { family: S.body, color: S.bone, align: "center", weight: "bold" });
    text(ctx, "registered on one of her flights to Norway", W * 0.765, Math.round(H * 0.825), Math.round(H * 0.0185), { family: S.body, color: S.boneFaint, align: "center" });
    ctx.restore();
  }
}
function podcast_card(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "misty_fjord.jpg", { zoom: [1.05, 1.11], dark: 0.42 });
  kicker(ctx, "2018 — THE CASE GOES PUBLIC", W / 2, Math.round(H * 0.24), Math.round(H * 0.019), { align: "center" });
  display(ctx, "\u201CDEATH IN ICE VALLEY\u201D", W / 2, Math.round(H * 0.40), Math.round(H * 0.080), clamp((t - 0.3) / 1.2));
  text(ctx, "NRK + BBC WORLD SERVICE PODCAST", W / 2, Math.round(H * 0.475), Math.round(H * 0.020), { family: S.mono, color: S.amber, align: "center", spacing: 3, alpha: clamp((t - 1) / 0.8) });
  // waveform
  const wp = clamp((t - 1.4) / 1);
  ctx.save(); ctx.globalAlpha = wp;
  const n = 42, cx0 = W / 2 - W * 0.16;
  for (let i = 0; i < n; i++) {
    const bp2 = clamp(wp * n - i);
    if (bp2 <= 0) break;
    const hgt = (0.25 + 0.75 * Math.abs(Math.sin(i * 1.7))) * H * 0.05 * easeOut(bp2);
    ctx.fillStyle = i % 7 === 3 ? S.amber : "rgba(234,227,212,0.7)";
    ctx.fillRect(cx0 + i * (W * 0.32 / n), H * 0.565 - hgt / 2, W * 0.0035, hgt);
  }
  ctx.restore();
  const pp = clamp((t - 2.2) / 0.9);
  if (pp > 0) {
    display(ctx, "ITS PICTURE MATCHES THE SCIENCE", W / 2, Math.round(H * 0.70), Math.round(H * 0.034), clamp(pp), { color: S.bone, weight: "" });
    display(ctx, "BORN c. 1930 — PROBABLY RAISED IN FRENCH-SPEAKING BELGIUM", W / 2, Math.round(H * 0.775), Math.round(H * 0.026), clamp((t - 2.6) / 0.9), { color: S.boneDim, weight: "" });
  }
  chip(ctx, "LISTENERS SENT NEW CLUES — NONE PRODUCED A NAME", W / 2, Math.round(H * 0.885), Math.round(H * 0.0175), { align: "center", color: S.boneDim, alpha: clamp((t - 3.2) / 0.8) });
}

// ==================== BEAT 8 — FILE 8: THE UNMARKED GRAVE ====================
function candleGlow(ctx, W, H, t, cx, cy, scale = 1) {
  const fl = 0.82 + 0.18 * Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1);
  glow(ctx, cx, cy, H * 0.30 * scale * fl, "rgba(226,168,84,0.16)", 1);
  glow(ctx, cx, cy, H * 0.10 * scale * fl, "rgba(240,200,120,0.35)", 1);
  // flame
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "rgba(250,220,150,0.95)";
  ctx.beginPath();
  ctx.ellipse(0, -H * 0.012 * scale, W * 0.004 * scale, H * 0.018 * scale * fl, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
function funeral_card(ctx, W, H, t, dur) {
  // v2.1: graded photo backdrop (was flat night gradient -> luma-void flags). Somber, dark-graded, RECONSTRUCTION-labelled.
  photoPlate(ctx, W, H, t, dur, "isdalen_valley.jpg", { zoom: [1.12, 1.05], pan: [0, 0.35, 0, -0.1], dark: 0.55, scrim: 0.25 });
  fog2(ctx, W, H, t, 24, 0.035);
  candleGlow(ctx, W, H, t, W * 0.80, H * 0.52, 1.4);
  chip(ctx, "RECONSTRUCTION — NOT THE ACTUAL LOCATION", Math.round(W * 0.94), Math.round(H * 0.935), Math.round(H * 0.015), { align: "right", color: S.boneFaint, alpha: clamp((t - 2.2) / 0.8) * 0.8 });
  fileHeader(ctx, W, H, t, "FILE 8 / 8", "The Unmarked Grave");
  kicker(ctx, "5 FEBRUARY 1971 — M\u00D8LLENDAL CEMETERY, BERGEN", Math.round(W * 0.062), Math.round(H * 0.30), Math.round(H * 0.0175));
  const rows = [
    ["A CATHOLIC CEREMONY", "chosen for the saints' names on her hotel forms"],
    ["A ZINC COFFIN", "to preserve her remains, for the day science might name her"],
    ["SIXTEEN OFFICERS", "Bergen police, burying the woman they could not name"],
    ["PHOTOGRAPHED", "in case relatives ever came forward"],
  ];
  rows.forEach((r, i) => {
    const rp = clamp((t - 0.7 - i * 0.7) / 0.6);
    if (rp <= 0) return;
    const y = H * (0.395 + i * 0.115);
    ctx.save(); ctx.globalAlpha = easeOut(rp);
    font(ctx, Math.round(H * 0.034), S.serif, "bold");
    ctx.fillStyle = S.bone; ctx.textAlign = "left";
    ctx.fillText(r[0], W * 0.062, y);
    text(ctx, r[1], W * 0.062 + W * 0.235, y, Math.round(H * 0.0235), { family: S.body, color: S.boneDim });
    ctx.restore();
  });
  text(ctx, "The police report describes the unknown woman — put to the grave in a", Math.round(W * 0.062), Math.round(H * 0.885), Math.round(H * 0.024), { family: S.body, color: S.boneDim, alpha: clamp((t - 3.6) / 0.9) });
  text(ctx, "foreign country, without any family present.", Math.round(W * 0.062), Math.round(H * 0.925), Math.round(H * 0.024), { family: S.body, color: S.boneDim, alpha: clamp((t - 3.8) / 0.9) });
}
function grave_card(ctx, W, H, t, dur) {
  // v2.1: graded photo backdrop (was flat gradient -> luma-void flags)
  photoPlate(ctx, W, H, t, dur, "rorbu_coast.jpg", { zoom: [1.10, 1.05], pan: [0, -0.1, 0, 0.1], dark: 0.62, scrim: 0.20 });
  fog2(ctx, W, H, t, 25, 0.03);
  chip(ctx, "RECONSTRUCTION — NOT THE ACTUAL LOCATION", Math.round(W * 0.94), Math.round(H * 0.935), Math.round(H * 0.015), { align: "right", color: S.boneFaint, alpha: clamp((t - 2.2) / 0.8) * 0.8 });
  // wreath + candle at grave (vector, respectful, no location claimed)
  const gx = W * 0.30, gy = H * 0.52;
  ctx.save(); ctx.globalAlpha = clamp(t / 1.5);
  ctx.strokeStyle = "rgba(120,140,120,0.5)"; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(gx, gy, H * 0.10, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "rgba(150,170,150,0.35)"; ctx.lineWidth = 3;
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(gx + Math.cos(a) * H * 0.10, gy + Math.sin(a) * H * 0.10);
    ctx.lineTo(gx + Math.cos(a + 0.12) * H * 0.115, gy + Math.sin(a + 0.12) * H * 0.115);
    ctx.stroke();
  }
  ctx.restore();
  candleGlow(ctx, W, H, t, W * 0.30, H * 0.72, 1.1);
  display(ctx, "FIFTY-FIVE YEARS", W * 0.775, Math.round(H * 0.30), Math.round(H * 0.062), clamp((t - 0.4) / 1), { align: "center" });
  display(ctx, "STILL NO NAME", W * 0.775, Math.round(H * 0.40), Math.round(H * 0.062), clamp((t - 0.8) / 1), { align: "center", color: S.amber });
  text(ctx, "The sketches, the fingerprints, the isotopes, the DNA —", W * 0.775, Math.round(H * 0.50), Math.round(H * 0.0245), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 1.4) / 0.9), maxWidth: W * 0.38 });
  text(ctx, "still point at no one.", W * 0.775, Math.round(H * 0.545), Math.round(H * 0.0245), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 1.6) / 0.9), maxWidth: W * 0.38 });
  chip(ctx, "HER GRAVE IS MARKED ONLY BY WHAT VISITORS LEAVE", Math.round(W * 0.775), Math.round(H * 0.66), Math.round(H * 0.0165), { align: "center", color: S.boneFaint, alpha: clamp((t - 2.1) / 0.8) });
  text(ctx, "A wreath. A candle.", W * 0.775, Math.round(H * 0.75), Math.round(H * 0.030), { family: S.serif, color: S.bone, align: "center", alpha: clamp((t - 2.5) / 0.9) });
}
function closing(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "misty_fjord.jpg", { zoom: [1.08, 1.03], pan: [0, -0.2, 0, 0.2], dark: 0.30, scrim: 0.3 });
  fog2(ctx, W, H, t, 26, 0.06);
  glow(ctx, W / 2, H * 0.44, H * 0.35, "rgba(210,168,94,0.06)", 1);
  kicker(ctx, "WHAT REMAINS IS THE FILE", W / 2, Math.round(H * 0.335), Math.round(H * 0.020), { align: "center" });
  display(ctx, "A REAL WOMAN —", W / 2, Math.round(H * 0.47), Math.round(H * 0.062), clamp((t - 0.4) / 1));
  display(ctx, "HER IDENTITY ERASED", W / 2, Math.round(H * 0.565), Math.round(H * 0.062), clamp((t - 0.8) / 1));
  display(ctx, "BY HER, OR BY SOMEONE ELSE", W / 2, Math.round(H * 0.655), Math.round(H * 0.036), clamp((t - 1.3) / 1), { color: S.boneDim, weight: "" });
  rule(ctx, W / 2, Math.round(H * 0.725), Math.round(W * 0.24), clamp((t - 1.8) / 1.2));
  display(ctx, "THE CASE REMAINS OPEN", W / 2, Math.round(H * 0.80), Math.round(H * 0.052), clamp((t - 2.1) / 1.1), { color: S.amber });
}
function relatives_quote(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "isdalen_valley.jpg", { zoom: [1.10, 1.04], dark: 0.55, scrim: 0.2 });
  candleGlow(ctx, W, H, t, W * 0.5, H * 0.42, 2.2);
  kicker(ctx, "WHY EVERY UNKNOWN BODY IS WORKED", W / 2, Math.round(H * 0.26), Math.round(H * 0.0175), { align: "center" });
  font(ctx, Math.round(H * 0.052), S.serif, "bold");
  ctx.fillStyle = S.bone; ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 14;
  const qp = clamp((t - 0.4) / 1.4);
  ctx.save(); ctx.globalAlpha = qp;
  ctx.fillText("\u201CSO THAT RELATIVES", W / 2, H * 0.415);
  ctx.fillText("CAN HAVE AN ANSWER\u201D", W / 2, H * 0.49);
  ctx.restore();
  ctx.shadowBlur = 0;
  text(ctx, "HEAD OF FORENSICS — WESTERN NORWAY POLICE DISTRICT (BBC, 2017)", W / 2, Math.round(H * 0.575), Math.round(H * 0.0155), { family: S.mono, color: S.amber, align: "center", alpha: clamp((t - 1.5) / 0.8) });
  const sp = clamp((t - 2.2) / 1);
  if (sp > 0) {
    display(ctx, "SOMEWHERE, THERE MAY STILL BE A FAMILY", W / 2, Math.round(H * 0.735), Math.round(H * 0.032), sp, { color: S.boneDim, weight: "" });
    display(ctx, "WONDERING WHERE SHE WENT", W / 2, Math.round(H * 0.795), Math.round(H * 0.032), clamp((t - 2.6) / 1), { color: S.boneDim, weight: "" });
  }
}
function end_card(ctx, W, H, t, dur) {
  photoPlate(ctx, W, H, t, dur, "misty_fjord.jpg", { zoom: [1.04, 1.09], dark: 0.58, scrim: 0.2 });
  fog2(ctx, W, H, t, 27, 0.04);
  kicker(ctx, "THE ISDAL WOMAN", W / 2, Math.round(H * 0.30), Math.round(H * 0.020), { align: "center" });
  rule(ctx, W / 2, Math.round(H * 0.36), Math.round(W * 0.16), clamp((t - 0.5) / 1.2));
  const lp = clamp((t - 0.8) / 1.2);
  ctx.save(); ctx.globalAlpha = lp;
  text(ctx, "SOURCES — POLICE RECORDS · BBC NEWS (2017) · NRK/BBC \u201CDEATH IN ICE VALLEY\u201D (2018)", W / 2, Math.round(H * 0.46), Math.round(H * 0.0205), { family: S.mono, color: S.bone, align: "center" });
  text(ctx, "FULL SOURCE LIST + CLAIM LEDGER — IN THE VIDEO DESCRIPTION", W / 2, Math.round(H * 0.515), Math.round(H * 0.0185), { family: S.mono, color: S.boneDim, align: "center" });
  ctx.restore();
  const ep = clamp((t - 1.6) / 1.2);
  ctx.save(); ctx.globalAlpha = ep;
  text(ctx, "THE DOCUMENTARY ENGINE", W / 2, Math.round(H * 0.685), Math.round(H * 0.018), { family: S.mono, color: S.amber, align: "center", spacing: 4 });
  text(ctx, "every claim sourced — theories labelled — nothing invented", W / 2, Math.round(H * 0.725), Math.round(H * 0.0265), { family: S.body, color: S.boneDim, align: "center" });
  ctx.restore();
}

// ==================== DISPATCH ====================
const SCENES = {
  valley_intro, valley_date_sting, casefile_stamp, title_card,
  scene_diagram, scene_inventory, label_cut, interpol_appeal,
  station, suitcase_open, money_lining, paris_inquiry, suitcase_realisation,
  hotel_card, witness_cards, neptun_card, stavanger_card, alias_list,
  notebook_intro, code_decode, notebook_close,
  autopsy_card, autopsy_facts, dental_card, verdict_card, case_closed,
  theory_intro, theory_murder, theory_spy, theory_accounts, theory_book,
  reopening, isotope_card, dna_card, podcast_card,
  funeral_card, grave_card, closing, relatives_quote, end_card,
};

// persistent file tab during a beat (small, after first block of the beat)
function beatTab(ctx, W, H, t, block) {
  const names = {
    1: ["FILE 1 / 8", "THE VALLEY"], 2: ["FILE 2 / 8", "THE SUITCASES"], 3: ["FILE 3 / 8", "THE HOTELS"],
    4: ["FILE 4 / 8", "THE NOTEBOOK"], 5: ["FILE 5 / 8", "THE VERDICT"], 6: ["FILE 6 / 8", "THE THEORIES"],
    7: ["FILE 7 / 8", "THE BONES SPEAK"], 8: ["FILE 8 / 8", "THE UNMARKED GRAVE"],
  };
  const n = names[block.beat];
  if (!n) return;
  const alpha = 0.5;
  text(ctx, n[0], Math.round(W * 0.024), Math.round(H * 0.048), Math.round(H * 0.0145), { family: S.mono, color: S.amber, alpha, spacing: 2 });
  const lw = textW(ctx, n[1], Math.round(H * 0.0135), S.mono);
  text(ctx, n[1], W - Math.round(W * 0.024) - lw, Math.round(H * 0.048), Math.round(H * 0.0135), { family: S.mono, color: S.boneFaint, alpha, spacing: 2 });
}

// offscreen canvases for crossfade
let _xf = null;
function xfadeBuffers(W, H) {
  if (!_xf || _xf.W !== W || _xf.H !== H) {
    const { createCanvas } = require("canvas");
    _xf = { W, H, a: createCanvas(W, H), b: createCanvas(W, H) };
  }
  return _xf;
}
function drawScene(c2d, W, H, b, tLoc) {
  const fn = SCENES[b.visual] || valley_intro;
  fn(c2d, W, H, tLoc, b.dur);
}

const TRANS = 0.9; // crossfade seconds at block starts (not before first)

export function renderFrame(ctx, W, H, tl, t) {
  FW = W;
  const blocks = tl.blocks;
  // current block: last block whose start <= t (holds through pauses)
  let idx = 0;
  for (let i = 0; i < blocks.length; i++) { if (t >= blocks[i].start) idx = i; else break; }
  const b = blocks[idx];
  const tLoc = t - b.start;
  const prev = idx > 0 ? blocks[idx - 1] : null;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);

  // crossfade window at the start of a block
  const inTrans = prev && tLoc < TRANS;
  if (inTrans) {
    const { a, b: cvsB } = xfadeBuffers(W, H);
    const ca = a.getContext("2d"), cb = cvsB.getContext("2d");
    ca.setTransform(1, 0, 0, 1, 0, 0); ca.clearRect(0, 0, W, H);
    cb.setTransform(1, 0, 0, 1, 0, 0); cb.clearRect(0, 0, W, H);
    const prevHold = t - prev.start; // prev scene holds its state past its dur (p clamps)
    drawScene(ca, W, H, prev, prevHold);
    drawScene(cb, W, H, b, tLoc);
    const mix = ease(clamp(tLoc / TRANS));
    ctx.drawImage(a, 0, 0);
    ctx.save(); ctx.globalAlpha = mix; ctx.drawImage(cvsB, 0, 0); ctx.restore();
  } else {
    drawScene(ctx, W, H, b, tLoc);
  }

  // global finishing pass
  vignette(ctx, W, H);
  grain(ctx, W, H, t);
  chrome2(ctx, W, H, t, tl.total);
  // persistent beat tab (skip beat 0 and title/end cards)
  if (b.beat > 0 && b.visual !== "end_card") beatTab(ctx, W, H, t, b);
}
