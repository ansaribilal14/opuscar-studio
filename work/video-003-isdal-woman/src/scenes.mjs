// scenes.mjs — every visual for video-003. Each scene: (ctx, W, H, b, tLoc, tAbs)
// b = timeline block (has .screen[] pairs [text, kind], .visual, .dur)
import path from "path";
import { fileURLToPath } from "url";
import {
  C, RNG, clamp, lerp, ease, easeOut, win, text, font, textW, paperCard, tape, stamp,
  chrome, edgeFade, camera, fog, loadImageSafe, archivePhoto, timelineStrip, bullets,
} from "./engine.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG = (n) => process.cwd() + `/images/cache/${n}`;

// ===================== shared backdrops =====================
function valleySky(ctx, W, H, p, night = 0.62) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#171b21"); g.addColorStop(0.55, "#20242b"); g.addColorStop(1, "#101216");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // mountain layers (Bergen: Ulriken ridge + valley V)
  const layers = [
    { y: 0.52, c: `rgba(38,44,52,${night})`, f: 2.1, a: 90, s: 1.0 },
    { y: 0.62, c: `rgba(30,35,42,${night + 0.1})`, f: 3.2, a: 60, s: 1.4 },
    { y: 0.74, c: `rgba(22,26,31,${night + 0.2})`, f: 4.5, a: 40, s: 2.0 },
  ];
  layers.forEach((L, li) => {
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) {
      const y = H * L.y - Math.sin(x / W * Math.PI * L.f + li * 2) * L.a * 0.4 - Math.sin(x / 137) * 18;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = L.c; ctx.fill();
  });
  // valley V between two ridges
  ctx.beginPath();
  ctx.moveTo(W * 0.18, H * 0.30); ctx.lineTo(W * 0.46, H * 0.78); ctx.lineTo(W * 0.78, H * 0.28);
  ctx.strokeStyle = "rgba(150,160,170,0.20)"; ctx.lineWidth = 2; ctx.stroke();
  fog(ctx, W, H, p * 30, 5, 0.06);
}

function deskBase(ctx, W, H) {
  const g = ctx.createRadialGradient(W * 0.5, H * 0.42, H * 0.1, W * 0.5, H * 0.5, H);
  g.addColorStop(0, "#1a1d21"); g.addColorStop(1, "#0e1013");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function fileTab(ctx, W, H, label, p) {
  ctx.save();
  ctx.globalAlpha *= easeOut(clamp(p * 3));
  const w = textW(ctx, label, 20, C.mono, "bold") + 44;
  ctx.fillStyle = "rgba(201,163,92,0.14)";
  ctx.fillRect(26, 30, w, 46);
  ctx.strokeStyle = "rgba(201,163,92,0.65)"; ctx.lineWidth = 1;
  ctx.strokeRect(26.5, 30.5, w, 46);
  text(ctx, label, 48, 60, 20, { family: C.mono, color: C.amber, spacing: 1 });
  ctx.restore();
}

// ===================== generic screen text =====================
const ST = {
  title(ctx, W, H, s, p) {
    const a = easeOut(clamp(p * 2.2));
    text(ctx, s, W / 2, H * 0.46, 78, { family: C.serif, color: "#e9e2d3", align: "center", alpha: a, spacing: 3 });
    const lw = 430 * easeOut(clamp((p - 0.12) * 2));
    ctx.fillStyle = "rgba(201,163,92,0.9)";
    ctx.fillRect(W / 2 - lw / 2, H * 0.46 + 34, lw, 2);
  },
  subtitle(ctx, W, H, s, p) {
    text(ctx, s, W / 2, H * 0.46 + 92, 30, { family: C.serif, color: "#b7b0a0", align: "center", alpha: easeOut(clamp((p - 0.18) * 2)), spacing: 1 });
  },
  tab(ctx, W, H, s, p) { fileTab(ctx, W, H, s, p); },
  mono(ctx, W, H, s, p, i) {
    const a = easeOut(clamp((p - 0.10 - i * 0.16) * 2.6));
    if (a <= 0) return;
    const y = H - 76 + i * 26;
    ctx.fillStyle = `rgba(201,163,92,${0.85 * a})`;
    ctx.fillRect(26, y - 15, 4, 20);
    text(ctx, s, 40, y, 16, { family: C.mono, color: "#d9d2c2", alpha: a });
  },
  warn(ctx, W, H, s, p, i) {
    const a = easeOut(clamp((p - 0.10 - i * 0.16) * 2.6));
    if (a <= 0) return;
    const y = H - 76 + i * 30;
    const w = textW(ctx, s, 16, C.mono);
    ctx.strokeStyle = `rgba(163,60,47,${a})`; ctx.lineWidth = 1;
    ctx.strokeRect(26.5, y - 19, w + 28, 28);
    stampDot(ctx, 40, y - 6, a);
    text(ctx, s, 58, y, 15, { family: C.mono, color: "#e0b6ad", alpha: a });
  },
  quote(ctx, W, H, s, p) {
    const a = easeOut(clamp((p - 0.15) * 1.8));
    if (a <= 0) return;
    const y = H * 0.80;
    ctx.fillStyle = `rgba(8,9,11,${0.62 * a})`;
    ctx.fillRect(0, y - 34, W, 64);
    ctx.fillStyle = `rgba(201,163,92,${a})`;
    ctx.fillRect(0, y - 34, 3, 64);
    text(ctx, s, W / 2, y + 4, 19, { family: C.serif, color: "#ddd6c6", align: "center", alpha: a });
  },
  decode(ctx, W, H, s, p, i) {
    const a = easeOut(clamp((p - 0.12 - i * 0.22) * 2.4));
    if (a <= 0) return;
    const rows = ST._decodeRows || (ST._decodeRows = []);
    const y = H * 0.30 + i * 62;
    ctx.save(); ctx.globalAlpha = a;
    paperCard(ctx, W * 0.30, y - 22, 190, 44, { alpha: a * 0.95 });
    text(ctx, s.split(" → ")[0], W * 0.30 + 95, y + 7, 22, { family: C.mono, color: C.ink, align: "center" });
    text(ctx, "→", W * 0.30 + 218, y + 8, 22, { family: C.mono, color: C.amber });
    text(ctx, s.split(" → ")[1], W * 0.30 + 250, y + 7, 22, { family: C.mono, color: "#d9d2c2" });
    ctx.restore();
  },
  result(ctx, W, H, s, p, i) {
    const a = easeOut(clamp((p - 0.12 - i * 0.24) * 2.4));
    if (a <= 0) return;
    const y = H * 0.34 + i * 74;
    const w = textW(ctx, s, 22, C.mono) + 60;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(18,20,23,0.85)";
    ctx.fillRect(W / 2 - w / 2, y - 26, w, 52);
    ctx.strokeStyle = "rgba(201,163,92,0.7)"; ctx.strokeRect(W / 2 - w / 2, y - 26, w, 52);
    text(ctx, s, W / 2, y + 8, 22, { family: C.mono, color: "#e6dfcf", align: "center" });
    ctx.restore();
  },
  disputed(ctx, W, H, s, p) {
    const a = easeOut(clamp((p - 0.18) * 2));
    if (a <= 0) return;
    const y = H * 0.70;
    ctx.save(); ctx.globalAlpha = a;
    const w = textW(ctx, s, 18, C.mono) + 130;
    ctx.fillStyle = "rgba(18,20,23,0.8)";
    ctx.fillRect(W / 2 - w / 2, y - 24, w, 48);
    ctx.strokeStyle = "rgba(163,60,47,0.85)"; ctx.strokeRect(W / 2 - w / 2, y - 24, w, 48);
    stamp(ctx, "DISPUTED", W / 2 - w / 2 + 62, y, 12, C.red, a, -0.08);
    text(ctx, s, W / 2 - w / 2 + 108, y + 6, 15, { family: C.mono, color: "#e0d8c8" });
    ctx.restore();
  },
  open(ctx, W, H, s, p, i) {
    const a = easeOut(clamp((p - 0.14 - i * 0.28) * 2.2));
    if (a <= 0) return;
    const y = H * 0.62 + i * 56;
    const w = textW(ctx, s, 16, C.mono) + 120;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(18,20,23,0.8)";
    ctx.fillRect(W / 2 - w / 2, y - 20, w, 40);
    ctx.strokeStyle = "rgba(163,60,47,0.7)"; ctx.strokeRect(W / 2 - w / 2, y - 20, w, 40);
    stamp(ctx, "UNVERIFIED", W / 2 - w / 2 + 58, y, 10, C.red, a, -0.07);
    text(ctx, s, W / 2 - w / 2 + 100, y + 5, 14, { family: C.mono, color: "#e0d8c8" });
    ctx.restore();
  },
  aliases(ctx, W, H, s, p) {
    const list = ["Geneviève Lancier", "Claudia Tielt", "Claudia Nielsen", "Alexia Zarne-Merchez", "Vera Jarle", "Fenella Lorch", "Elisabeth Leenhouwer"];
    const colW = W / 2 - 80;
    list.forEach((name, i) => {
      const a = easeOut(clamp((p - 0.16 - i * 0.10) * 3));
      if (a <= 0) return;
      const col = i % 2, row = Math.floor(i / 2);
      const x = 80 + col * colW, y = H * 0.30 + row * 52;
      ctx.save(); ctx.globalAlpha = a;
      text(ctx, String(i + 1).padStart(2, "0"), x, y, 18, { family: C.mono, color: C.amber });
      text(ctx, name, x + 44, y, 22, { family: C.serif, color: "#d9d2c2" });
      ctx.strokeStyle = "rgba(120,115,100,0.35)";
      ctx.beginPath(); ctx.moveTo(x + 44, y + 12); ctx.lineTo(x + 44 + textW(ctx, name, 22, C.serif), y + 12); ctx.stroke();
      ctx.restore();
    });
  },
};
function stampDot(ctx, x, y, a) {
  ctx.fillStyle = `rgba(163,60,47,${a})`;
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
}
export function drawScreen(ctx, W, H, b, p) {
  let mi = 0;
  (b.screen || []).forEach(([s, kind], i) => {
    const fn = ST[kind] || ST.mono;
    const idx = (kind === "mono" || kind === "warn" || kind === "open") ? (mi++) : i;
    fn(ctx, W, H, s, p, idx);
  });
}

// ===================== scene art =====================
const scenes = {};

scenes.valley_intro = (ctx, W, H, b, t, T) => {
  const p = t / b.dur;
  valleySky(ctx, W, H, p);
  camera(ctx, W, H, ease(p) * 0.5, 0.05);
  const im = loadImageSafe(IMG("isdalen_valley.jpg"));
  if (im) archivePhoto(ctx, im, W * 0.56, H * 0.14, W * 0.38, H * 0.44, "ISDALEN VALLEY — BERGEN", "PHOTO: BBC", easeOut(clamp((p - 0.45) * 2)));
};

scenes.valley_date_sting = (ctx, W, H, b, t, T) => {
  valleySky(ctx, W, H, 0.5);
  const p = t / b.dur;
  const a = easeOut(clamp(p * 3));
  ctx.fillStyle = `rgba(8,9,11,${0.45 * a})`; ctx.fillRect(0, 0, W, H);
  const lw = 320 * easeOut(clamp((p - 0.1) * 2));
  ctx.fillStyle = C.amber; ctx.fillRect(W / 2 - lw / 2, H * 0.40, lw, 2);
  ctx.fillRect(W / 2 - lw / 2, H * 0.40 + 54, lw, 2);
};

scenes.casefile_stamp = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  // manila folder sliding in
  const fx = W * 0.5 - 170, fy = H * 0.28 + (1 - easeOut(clamp(p * 2))) * 40;
  ctx.save();
  ctx.translate(fx + 170, fy + 110); ctx.rotate(-0.045); ctx.translate(-(fx + 170), -(fy + 110));
  paperCard(ctx, fx, fy, 340, 220, {});
  text(ctx, "POLICE REPORT", fx + 24, fy + 46, 15, { family: C.mono, color: C.inkSoft, spacing: 2 });
  text(ctx, "134/70", fx + 24, fy + 110, 52, { family: C.mono, color: C.ink, weight: "bold" });
  text(ctx, "BERGEN POLITI — 1970", fx + 24, fy + 150, 13, { family: C.mono, color: C.inkSoft, spacing: 1 });
  stamp(ctx, "CLOSED", fx + 240, fy + 150, 22, C.red, easeOut(clamp((p - 0.4) * 2)), -0.12);
  ctx.restore();
};

scenes.title_card = (ctx, W, H, b, t) => {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0d0f12"); g.addColorStop(1, "#14171b");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  fog(ctx, W, H, t * 6, 9, 0.03);
  const p = clamp(t / Math.min(1.2, b.dur));
  drawScreen(ctx, W, H, b, p);
  text(ctx, "A DOCUMENTARY FROM THE CASE FILE 134/70", W / 2, H - 84, 14, { family: C.mono, color: "#8a8577", align: "center", spacing: 3, alpha: 0.8 });
};

scenes.scene_diagram = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  // annotated evidence diagram (abstract, respectful): position + burn extent
  const cx = W * 0.5, cy = H * 0.42;
  ctx.save();
  const a = easeOut(clamp(p * 2));
  ctx.globalAlpha = a;
  paperCard(ctx, cx - 300, cy - 160, 600, 320, {});
  // figure outline (abstract)
  ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(cx, cy - 90, 26, 32, 0, 0, Math.PI * 2); ctx.stroke(); // head
  ctx.beginPath(); ctx.moveTo(cx - 20, cy - 55); ctx.quadraticCurveTo(cx, cy - 65, cx + 20, cy - 55);
  ctx.lineTo(cx + 30, cy + 40); ctx.quadraticCurveTo(cx, cy + 55, cx - 30, cy + 40); ctx.closePath(); ctx.stroke(); // torso+legs mass
  // burn extent front
  ctx.fillStyle = `rgba(163,60,47,${0.16 * easeOut(clamp((p - 0.25) * 2))})`;
  ctx.beginPath(); ctx.ellipse(cx, cy - 10, 90, 95, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `rgba(163,60,47,0.8)`;
  ctx.beginPath(); ctx.ellipse(cx, cy - 10, 90, 95, 0, 0, Math.PI * 2); ctx.stroke();
  label(ctx, "FRONT BURNED", cx + 96, cy - 80, p, 0.3);
  label(ctx, "BACK NOT BURNED", cx - 220, cy + 30, p, 0.42);
  label(ctx, "PETROL TRACES — GROUND", cx - 230, cy - 130, p, 0.55);
  label(ctx, "FUR HAT BENEATH BODY — PETROL", cx + 60, cy + 120, p, 0.65);
  ctx.restore();
};
function label(ctx, s, x, y, p, at) {
  const a = easeOut(clamp((p - at) * 3));
  if (a <= 0) return;
  text(ctx, s, x, y, 13, { family: C.mono, color: C.ink, alpha: a });
  ctx.strokeStyle = `rgba(28,26,22,${a * 0.5})`; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - 8, y - 4); ctx.lineTo(x - 26, y - 4); ctx.stroke();
}

scenes.scene_inventory = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const items = ["LIQUEUR — ST. HALLVARD", "WATER BOTTLES ×2", "PASSPORT HOLDER (PLASTIC)", "RUBBER BOOTS", "WOOLEN JUMPER + SCARF", "NYLON STOCKINGS", "UMBRELLA", "PURSE", "MATCHBOX", "BURNED PAPER", "WATCH + EARRINGS + RING", "FUR HAT (PETROL)"];
  const cols = 3, rows = 4, cw = 250, ch = 64;
  const ox = W / 2 - (cols * cw) / 2, oy = H * 0.24;
  items.forEach((it, i) => {
    const ip = easeOut(clamp(p * items.length * 1.15 - i, 0, 1));
    if (ip <= 0) return;
    const col = i % cols, row = Math.floor(i / cols);
    const x = ox + col * (cw + 14), y = oy + row * (ch + 12);
    ctx.save(); ctx.globalAlpha = ip;
    ctx.fillStyle = "rgba(35,38,44,0.9)";
    ctx.fillRect(x, y, cw, ch);
    ctx.strokeStyle = "rgba(201,163,92,0.35)"; ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
    text(ctx, String(i + 1).padStart(2, "0"), x + 14, y + 30, 14, { family: C.mono, color: C.amber });
    text(ctx, it, x + 44, y + 30, 12.5, { family: C.mono, color: "#d6cfc0", maxWidth: cw - 56 });
    ctx.restore();
  });
};

scenes.label_cut = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  // a garment label being cut — abstract: paper strip + scissors line
  const cx = W / 2, cy = H * 0.40;
  ctx.save();
  paperCard(ctx, cx - 220, cy - 60, 440, 120, { tilt: -0.02 });
  text(ctx, "MAKER  ·  SIZE  ·  ORIGIN", cx, cy + 6, 20, { family: C.mono, color: C.ink, align: "center", alpha: 1 - easeOut(clamp((p - 0.25) * 2)) });
  // scissors path
  const cut = easeOut(clamp((p - 0.2) * 1.6));
  ctx.strokeStyle = C.red; ctx.lineWidth = 3;
  ctx.setLineDash([14, 10]);
  ctx.beginPath(); ctx.moveTo(cx - 220 - 30 + 470 * cut, cy - 60 - 8); ctx.lineTo(cx - 220 - 30 + 470 * cut + 30, cy - 60 - 8); ctx.stroke();
  ctx.setLineDash([]);
  text(ctx, "CUT", cx - 240 + 470 * cut, cy - 74, 12, { family: C.mono, color: C.red, align: "center", alpha: cut > 0.05 ? 1 : 0 });
  ctx.restore();
};

scenes.interpol_appeal = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const im = loadImageSafe(IMG("police_sketch.jpg"));
  if (im) {
    // the real 1970 police sketch, framed left; radiating reach lines right
    archivePhoto(ctx, im, W * 0.07, H * 0.13, W * 0.46, H * 0.60, "POLICE SKETCH 1970 — \"UKJENT KVINNE\"", "VIA BBC · SEE CREDITS", easeOut(clamp(p * 2)));
    const cx = W * 0.78, cy = H * 0.42;
    ctx.save();
    ctx.strokeStyle = "rgba(93,114,133,0.6)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx, cy, 150, 150, 0, 0, Math.PI * 2); ctx.stroke();
    const rnd = RNG(11);
    for (let i = 0; i < 10; i++) {
      const a = easeOut(clamp(p * 2.4 - i * 0.06));
      const ang = rnd() * Math.PI * 2, rr = 90 + rnd() * 130;
      ctx.strokeStyle = `rgba(201,163,92,${0.55 * a})`;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr); ctx.stroke();
      ctx.fillStyle = `rgba(150,160,170,${a})`;
      ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    text(ctx, "DISTRIBUTED VIA INTERPOL — EUROPE · N. AFRICA · MIDDLE EAST", cx, cy + 190, 12, { family: C.mono, color: "#a49e8f", align: "center", alpha: easeOut(clamp((p - 0.5) * 2)), maxWidth: 320 });
    ctx.restore();
  } else {
    const cx = W * 0.5, cy = H * 0.40;
    const rnd = RNG(11);
    const dots = Array.from({ length: 26 }, () => ({ x: cx - 330 + rnd() * 660, y: cy - 150 + rnd() * 280 }));
    ctx.save();
    ctx.strokeStyle = "rgba(93,114,133,0.5)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(cx, cy, 360, 200, 0, 0, Math.PI * 2); ctx.stroke();
    dots.forEach((d, i) => {
      const a = easeOut(clamp(p * 3 - i * 0.05));
      ctx.fillStyle = `rgba(150,160,170,${a})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, 2.2, 0, Math.PI * 2); ctx.fill();
    });
    for (let r = 0; r < 4; r++) {
      const rp = ((p * 1.3 + r * 0.25) % 1);
      ctx.strokeStyle = `rgba(201,163,92,${(1 - rp) * 0.5})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 30 + rp * 260, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
};

scenes.station = (ctx, W, H, b, t) => {
  valleySky(ctx, W, H, 0.4, 0.7);
  const p = t / b.dur;
  const im = loadImageSafe(IMG("bergen_station.jpg"));
  if (im) {
    archivePhoto(ctx, im, W * 0.08, H * 0.16, W * 0.52, H * 0.52, "BERGEN RAILWAY STATION", "PHOTO: BANE NOR", easeOut(clamp(p * 2)));
  } else {
    // vector station hall
    ctx.save();
    const a = easeOut(clamp(p * 2));
    ctx.globalAlpha = a;
    ctx.strokeStyle = "rgba(200,190,170,0.6)"; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const x = W * 0.12 + i * W * 0.11;
      ctx.beginPath(); ctx.moveTo(x, H * 0.70); ctx.lineTo(x + 26, H * 0.22); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(W * 0.10, H * 0.22); ctx.quadraticCurveTo(W * 0.4, H * 0.12, W * 0.72, H * 0.22); ctx.stroke();
    ctx.restore();
  }
  // two suitcase outlines
  const sx = W * 0.68, sy = H * 0.52;
  [[0, 0], [70, -34]].forEach(([dx, dy], i) => {
    const a = easeOut(clamp((p - 0.3 - i * 0.15) * 2.4));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(sx + dx, sy + dy);
    ctx.strokeStyle = "rgba(220,210,190,0.85)"; ctx.lineWidth = 2;
    roundRect(ctx, -60, -40, 120, 80, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-24, -40); ctx.lineTo(-24, -52); ctx.lineTo(24, -52); ctx.lineTo(24, -40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-60, -14); ctx.lineTo(60, -14); ctx.stroke();
    ctx.restore();
  });
};
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

scenes.suitcase_open = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W * 0.5, cy = H * 0.38;
  // open suitcase
  ctx.save();
  const a = easeOut(clamp(p * 2));
  ctx.globalAlpha = a;
  paperCard(ctx, cx - 260, cy - 120, 520, 260, { tilt: -0.01 });
  // lid
  ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2;
  ctx.strokeRect(cx - 230, cy - 90, 460, 60);
  text(ctx, "CONTENTS MANIFEST", cx - 210, cy - 52, 13, { family: C.mono, color: C.inkSoft, spacing: 2 });
  bullets(ctx, ["CLOTHES + SHOES", "WIGS (SEVERAL)", "COSMETICS · COMB · HAIRBRUSH", "MAPS + TIMETABLES", "COINS: BE · GB · CH + 135 NOK"], cx - 210, cy + 0, 15, 430, p - 0.1, {});
  // glasses callout
  const gp = easeOut(clamp((p - 0.55) * 2));
  if (gp > 0) {
    ctx.strokeStyle = `rgba(163,60,47,${gp})`; ctx.lineWidth = 1.6;
    ctx.strokeRect(cx + 150, cy + 6, 92, 34);
    text(ctx, "GLASSES", cx + 196, cy + 28, 12, { family: C.mono, color: C.red, align: "center", alpha: gp });
    text(ctx, "FINGERPRINT → MATCH", cx + 150, cy + 68, 12, { family: C.mono, color: "#d6cfc0", alpha: gp });
  }
  // eczema cream callout
  const ep = easeOut(clamp((p - 0.7) * 2));
  if (ep > 0) {
    ctx.strokeStyle = `rgba(163,60,47,${ep})`;
    ctx.strokeRect(cx - 210, cy + 66, 150, 30);
    text(ctx, "ECZEMA CREAM", cx - 135, cy + 86, 12, { family: C.mono, color: C.red, align: "center", alpha: ep });
    text(ctx, "PRESCRIPTION STICKER — SCRAPED OFF", cx - 40, cy + 86, 12, { family: C.mono, color: "#d6cfc0", alpha: ep });
  }
  ctx.restore();
};

scenes.money_lining = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W / 2, cy = H * 0.40;
  ctx.save();
  paperCard(ctx, cx - 280, cy - 110, 560, 240, {});
  // lining flap opening
  const open = easeOut(clamp((p - 0.1) * 1.8));
  ctx.fillStyle = "#d8d0bd";
  ctx.beginPath();
  ctx.moveTo(cx - 240, cy - 60); ctx.lineTo(cx + 240, cy - 60);
  ctx.lineTo(cx + 240, cy - 60 + 40 * (1 - open)); ctx.lineTo(cx - 240, cy - 60 + 40 * (1 - open));
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.inkSoft; ctx.stroke();
  // notes revealed
  const np = easeOut(clamp((p - 0.35) * 2.2));
  for (let i = 0; i < 5; i++) {
    const ia = clamp(np * 5 - i, 0, 1);
    if (ia <= 0) continue;
    ctx.save(); ctx.globalAlpha = ia;
    ctx.translate(cx - 160 + i * 80, cy + 30); ctx.rotate(-0.06 + i * 0.02);
    ctx.fillStyle = "#3d4a3a"; ctx.fillRect(-52, -26, 104, 52);
    ctx.strokeStyle = "#20281f"; ctx.strokeRect(-52, -26, 104, 52);
    text(ctx, "100", 0, 2, 18, { family: C.serif, color: "#cfd8c8", align: "center" });
    text(ctx, "DM", 0, 18, 10, { family: C.mono, color: "#9fb09a", align: "center" });
    ctx.restore();
  }
  text(ctx, "≈ US$137 (1970) — FLAGGED FOR VERIFICATION", cx, cy + 100, 12, { family: C.mono, color: C.inkSoft, align: "center" });
  ctx.restore();
};

scenes.paris_inquiry = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  // arc Bergen→Paris on minimal Europe
  const bx = W * 0.56, by = H * 0.28, px = W * 0.44, py = H * 0.62;
  ctx.save();
  ctx.strokeStyle = "rgba(93,114,133,0.35)";
  ctx.beginPath(); ctx.ellipse(W / 2, H * 0.44, 330, 210, 0, 0, Math.PI * 2); ctx.stroke();
  const arc = clamp((p - 0.15) / 0.5);
  ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx, by);
  ctx.quadraticCurveTo(W * 0.28, H * 0.34, lerp(bx, px, ease(arc)), lerp(by, py, ease(arc)));
  ctx.stroke();
  [[bx, by, "BERGEN"], [px, py, "PARIS"]].forEach(([x, y, s], i) => {
    const a = easeOut(clamp((p - i * 0.2) * 3));
    ctx.fillStyle = `rgba(220,210,190,${a})`;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    text(ctx, s, x, y - 16, 13, { family: C.mono, color: "#d6cfc0", align: "center", alpha: a });
  });
  const na = easeOut(clamp((p - 0.62) * 2));
  stamp(ctx, "NO MATCH", W / 2, H * 0.80, 24, C.red, na, -0.05);
  ctx.restore();
};

scenes.suitcase_realisation = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W / 2, cy = H * 0.40;
  ctx.save();
  paperCard(ctx, cx - 250, cy - 90, 500, 190, { tilt: 0.012 });
  text(ctx, "EVERY LABEL REMOVED", cx, cy - 20, 26, { family: C.serif, color: C.ink, align: "center" });
  const lines = ["her clothes", "her belongings", "her identity"];
  lines.forEach((s, i) => {
    const a = easeOut(clamp((p - 0.3 - i * 0.18) * 2.5));
    text(ctx, "— " + s, cx, cy + 22 + i * 34, 18, { family: C.body, color: C.inkSoft, align: "center", alpha: a });
  });
  ctx.restore();
};

scenes.hotel_card = (ctx, W, H, b, t) => {
  const p = t / b.dur;
  deskBase(ctx, W, H);
  const im = loadImageSafe(IMG("bergen_1970s.jpg"));
  if (im) archivePhoto(ctx, im, W * 0.06, H * 0.14, W * 0.46, H * 0.56, "BERGEN — CITY CENTRE", "PHOTO: LIFE IN NORWAY", easeOut(clamp(p * 2)));
  else valleySky(ctx, W, H, p, 0.5);
  // room key tag
  ctx.save();
  const ka = easeOut(clamp((p - 0.35) * 2));
  ctx.globalAlpha = ka;
  ctx.translate(W * 0.74, H * 0.36); ctx.rotate(0.06);
  paperCard(ctx, -90, -60, 180, 120, {});
  ctx.beginPath(); ctx.arc(-90 + 90, -60, 12, 0, Math.PI * 2); ctx.fillStyle = C.bg; ctx.fill();
  text(ctx, "ROOM", 0, -18, 13, { family: C.mono, color: C.inkSoft, align: "center" });
  text(ctx, "407", 0, 26, 40, { family: C.serif, color: C.ink, align: "center", weight: "bold" });
  ctx.restore();
};

scenes.witness_cards = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cards = [
    ["HOTEL STAFF", "kept to her room", "\"on guard\""],
    ["ROOM CHANGES", "asked ×3 on one stay", "wigs noted"],
    ["LANGUAGES", "English · German", "Flemish"],
    ["DETAIL", "smell of garlic", "—"],
  ];
  cards.forEach((c, i) => {
    const a = easeOut(clamp((p * 4.2 - i), 0, 1));
    if (a <= 0) return;
    const col = i % 2, row = Math.floor(i / 2);
    const x = W / 2 - 250 + col * 260, y = H * 0.22 + row * 150;
    ctx.save(); ctx.globalAlpha = easeOut(a);
    ctx.translate(x + 125, y + 60); ctx.rotate((i % 2 ? 0.012 : -0.012)); ctx.translate(-(x + 125), -(y + 60));
    paperCard(ctx, x, y, 240, 120, {});
    text(ctx, c[0], x + 18, y + 30, 12, { family: C.mono, color: C.amber, spacing: 1 });
    text(ctx, c[1], x + 18, y + 62, 15, { family: C.body, color: C.ink });
    text(ctx, c[2], x + 18, y + 88, 15, { family: C.body, color: C.inkSoft });
    ctx.restore();
  });
};

scenes.neptun_card = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  // dining hall abstract: tables dots, woman near two navy figures
  const cx = W / 2, cy = H * 0.42;
  ctx.save();
  ctx.globalAlpha = easeOut(clamp(p * 2));
  paperCard(ctx, cx - 300, cy - 150, 600, 300, {});
  text(ctx, "HOTEL NEPTUN — DINING HALL (RECONSTRUCTION)", cx, cy - 118, 12, { family: C.mono, color: C.inkSoft, align: "center", spacing: 1 });
  // two navy figures
  [[cx + 70], [cx + 110]].forEach(([x], i) => {
    const a = easeOut(clamp((p - 0.25 - i * 0.1) * 2.5));
    ctx.fillStyle = `rgba(40,52,66,${a})`;
    ctx.beginPath(); ctx.ellipse(x, cy + 20, 16, 46, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, cy - 40, 12, 0, Math.PI * 2); ctx.fill();
  });
  text(ctx, "GERMAN NAVY (ONE AN OFFICER)", cx + 90, cy + 92, 11, { family: C.mono, color: C.inkSoft, align: "center", alpha: easeOut(clamp((p - 0.4) * 2)) });
  // her seat — separated
  const ha = easeOut(clamp((p - 0.15) * 2.5));
  ctx.fillStyle = `rgba(201,163,92,${ha})`;
  ctx.beginPath(); ctx.arc(cx - 60, cy + 10, 9, 0, Math.PI * 2); ctx.fill();
  text(ctx, "SHE SAT NEAR — NEVER WITH", cx - 60, cy + 92, 11, { family: C.mono, color: C.ink, align: "center", alpha: ha });
  // separator
  ctx.strokeStyle = `rgba(163,60,47,${easeOut(clamp((p - 0.5) * 2))})`; ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath(); ctx.moveTo(cx + 20, cy - 60); ctx.lineTo(cx + 20, cy + 70); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
};

scenes.stavanger_card = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W / 2, cy = H * 0.40;
  ctx.save();
  // boot pair vector
  const a = easeOut(clamp(p * 2));
  ctx.globalAlpha = a;
  [[cx - 70, -0.08], [cx + 40, 0.05]].forEach(([x, rot]) => {
    ctx.save(); ctx.translate(x, cy); ctx.rotate(rot);
    ctx.strokeStyle = "#d9d2c2"; ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-22, -50); ctx.lineTo(-22, 10); ctx.lineTo(34, 10); ctx.lineTo(34, -8); ctx.lineTo(0, -14); ctx.lineTo(0, -50); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(34, 0); ctx.stroke();
    ctx.restore();
  });
  // tag
  const ta = easeOut(clamp((p - 0.45) * 2));
  ctx.globalAlpha = ta;
  paperCard(ctx, cx + 130, cy - 90, 240, 96, { tilt: 0.03 });
  text(ctx, "OSCAR RØRTVEDT", cx + 148, cy - 62, 13, { family: C.mono, color: C.ink });
  text(ctx, "FOOTWEAR — STAVANGER", cx + 148, cy - 40, 11, { family: C.mono, color: C.inkSoft });
  text(ctx, "BOOTS + UMBRELLA MATCHED", cx + 148, cy - 18, 11, { family: C.mono, color: C.red });
  ctx.restore();
};

scenes.alias_list = (ctx, W, H, b, t) => { deskBase(ctx, W, H); };

scenes.notebook_intro = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W / 2, cy = H * 0.40;
  ctx.save();
  const a = easeOut(clamp(p * 2));
  ctx.globalAlpha = a;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.03); ctx.translate(-cx, -cy);
  paperCard(ctx, cx - 240, cy - 140, 480, 290, {});
  ctx.strokeStyle = "rgba(28,26,22,0.35)"; ctx.lineWidth = 1;
  for (let i = 0; i < 9; i++) { const y = cy - 100 + i * 28; ctx.beginPath(); ctx.moveTo(cx - 200, y); ctx.lineTo(cx + 200, y); ctx.stroke(); }
  ctx.strokeStyle = "rgba(163,60,47,0.8)";
  ctx.beginPath(); ctx.moveTo(cx - 170, cy - 120); ctx.lineTo(cx - 170, cy + 120); ctx.stroke();
  // cryptic entries
  const rnd = RNG(21);
  const entries = ["O22 O28 P", "O29PS", "O29S", "O30BN5", "N14 N16 O", "D07 D08 K"];
  entries.forEach((e, i) => {
    const ia = easeOut(clamp((p - 0.2 - i * 0.1) * 3));
    text(ctx, e, cx - 150, cy - 84 + i * 28, 15, { family: C.mono, color: C.ink, alpha: ia });
  });
  ctx.restore(); ctx.restore();
};

scenes.code_decode = (ctx, W, H, b, t) => { deskBase(ctx, W, H); };

scenes.notebook_close = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W / 2, cy = H * 0.40;
  const a = easeOut(clamp((p - 0.2) * 2));
  ctx.save(); ctx.globalAlpha = a;
  paperCard(ctx, cx - 270, cy - 80, 540, 160, {});
  text(ctx, "A PRIVATE TRAVEL LOG", cx, cy - 20, 24, { family: C.serif, color: C.ink, align: "center" });
  text(ctx, "PLACES + DATES — NOTHING MORE", cx, cy + 24, 15, { family: C.mono, color: C.inkSoft, align: "center", spacing: 1 });
  ctx.restore();
};

scenes.autopsy_card = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W / 2, cy = H * 0.38;
  ctx.save();
  ctx.globalAlpha = easeOut(clamp(p * 2));
  // forensic card (per BBC: name/position/address/date of birth & death all "unknown")
  paperCard(ctx, cx - 290, cy - 130, 580, 270, { tilt: -0.008 });
  tape(ctx, cx, cy - 130, 90, 0.5);
  text(ctx, "GADES INSTITUTT — AUTOPSY SUMMARY", cx - 260, cy - 90, 13, { family: C.mono, color: C.ink, spacing: 1 });
  const rows = [["NAME", "UNKNOWN"], ["OCCUPATION", "UNKNOWN"], ["ADDRESS", "UNKNOWN"], ["DATE OF BIRTH", "UNKNOWN"], ["DATE OF DEATH", "c. NOVEMBER 1970"]];
  rows.forEach(([k, v], i) => {
    const a = easeOut(clamp((p - 0.15 - i * 0.08) * 3));
    const y = cy - 56 + i * 34;
    text(ctx, k, cx - 260, y, 14, { family: C.mono, color: C.inkSoft, alpha: a });
    text(ctx, v, cx + 30, y, 14, { family: C.mono, color: C.red, alpha: a, weight: "bold" });
  });
  ctx.restore();
};

scenes.autopsy_facts = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const facts = [["50–70 ×", "FENEMAL PILLS — STOMACH (NOT FULLY ABSORBED)"], ["12 ×", "PILLS BESIDE THE BODY"], ["SOOT", "IN LUNGS — ALIVE AS FIRE REACHED HER"], ["BRUISE", "RIGHT SIDE OF NECK — UNEXPLAINED"]];
  facts.forEach(([k, v], i) => {
    const a = easeOut(clamp((p * 4.4 - i), 0, 1));
    if (a <= 0) return;
    const y = H * 0.26 + i * 96;
    ctx.save(); ctx.globalAlpha = easeOut(a);
    ctx.fillStyle = "rgba(24,27,32,0.92)";
    ctx.fillRect(W / 2 - 340, y - 34, 680, 68);
    ctx.strokeStyle = i === 3 ? "rgba(163,60,47,0.7)" : "rgba(201,163,92,0.4)";
    ctx.strokeRect(W / 2 - 340, y - 34, 680, 68);
    text(ctx, k, W / 2 - 310, y + 10, 24, { family: C.mono, color: C.amber, weight: "bold" });
    text(ctx, v, W / 2 - 160, y + 8, 14.5, { family: C.mono, color: "#d9d2c2" });
    ctx.restore();
  });
};

scenes.dental_card = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W / 2, cy = H * 0.36;
  ctx.save();
  // jaw diagram (abstract)
  ctx.globalAlpha = easeOut(clamp(p * 2));
  paperCard(ctx, cx - 300, cy - 120, 600, 240, {});
  // teeth row
  const n = 12;
  for (let i = 0; i < n; i++) {
    const x = cx - 230 + i * 42;
    const filled = [1, 3, 4, 6, 7, 8, 10].includes(i);
    const gold = [4, 7].includes(i);
    const a = easeOut(clamp((p - 0.2 - i * 0.04) * 3));
    ctx.globalAlpha = a;
    ctx.fillStyle = gold ? "#c9a35c" : filled ? "#b8ab90" : "#ece5d5";
    ctx.strokeStyle = "#1c1a16";
    roundRect(ctx, x, cy - 40, 30, 64, 6); ctx.fill(); ctx.stroke();
    if (filled && !gold) { ctx.beginPath(); ctx.moveTo(x + 8, cy - 30); ctx.lineTo(x + 22, cy + 14); ctx.stroke(); }
    ctx.globalAlpha = easeOut(clamp(p * 2));
  }
  text(ctx, "14 FILLED TEETH · GOLD CROWNS", cx, cy + 78, 16, { family: C.mono, color: C.ink, align: "center" });
  text(ctx, "STYLE: FAR EAST · C/S EUROPE · SOUTH AMERICA — NOT NORWAY", cx, cy + 104, 12, { family: C.mono, color: C.red, align: "center", alpha: easeOut(clamp((p - 0.6) * 2)) });
  ctx.restore();
};

scenes.verdict_card = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W / 2, cy = H * 0.36;
  ctx.save();
  const a = easeOut(clamp(p * 2));
  ctx.globalAlpha = a;
  paperCard(ctx, cx - 280, cy - 110, 560, 220, {});
  text(ctx, "OFFICIAL CONCLUSION — 1970", cx - 250, cy - 74, 12, { family: C.mono, color: C.inkSoft, spacing: 1 });
  text(ctx, "PROBABLE SUICIDE", cx, cy - 20, 34, { family: C.serif, color: C.ink, align: "center" });
  stamp(ctx, "CONTESTED", cx + 170, cy + 40, 16, C.red, easeOut(clamp((p - 0.45) * 2)), -0.1);
  text(ctx, "\"VERY FEW THOUGHT IT WAS SUICIDE\"", cx - 250, cy + 56, 13, { family: C.mono, color: C.inkSoft, alpha: easeOut(clamp((p - 0.55) * 2)) });
  text(ctx, "— C. H. AAS, POLICE LAWYER", cx - 250, cy + 80, 12, { family: C.mono, color: C.inkSoft, alpha: easeOut(clamp((p - 0.62) * 2)) });
  ctx.restore();
};

scenes.case_closed = (ctx, W, H, b, t) => {
  valleySky(ctx, W, H, 0.5);
  const p = t / b.dur;
  const a = easeOut(clamp((p - 0.15) * 2));
  ctx.fillStyle = `rgba(8,9,11,${0.35 * a})`; ctx.fillRect(0, 0, W, H);
  stamp(ctx, "CASE CLOSED — FEBRUARY 1971", W / 2, H * 0.46, 20, C.amber, a, -0.03);
};

scenes.theory_intro = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const words = ["CUT LABELS", "SCRAPED PRESCRIPTIONS", "EIGHT NAMES"];
  words.forEach((w, i) => {
    const a = easeOut(clamp((p * 3.4 - i), 0, 1));
    if (a <= 0) return;
    const x = W / 2 + (i - 1) * 250;
    ctx.save(); ctx.globalAlpha = easeOut(a); ctx.translate(x, H * 0.38);
    ctx.rotate(-0.03 + i * 0.03);
    ctx.fillStyle = "rgba(35,38,44,0.9)";
    const w2 = textW(ctx, w, 16, C.mono) + 40;
    ctx.fillRect(-w2 / 2, -22, w2, 44);
    ctx.strokeStyle = "rgba(201,163,92,0.4)"; ctx.strokeRect(-w2 / 2, -22, w2, 44);
    text(ctx, w, 0, 6, 15, { family: C.mono, color: "#d9d2c2", align: "center" });
    ctx.restore();
  });
};

scenes.theory_murder = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W / 2, cy = H * 0.34;
  ctx.save();
  ctx.globalAlpha = easeOut(clamp((p - 0.05) * 2));
  const rows = ["THE REMOVED IDENTITY", "THE JEWELLERY PLACED BESIDE HER", "THE PETROL", "THE UNEXPLAINED BRUISE"];
  rows.forEach((r, i) => {
    const a = easeOut(clamp((p - 0.2 - i * 0.12) * 2.5));
    text(ctx, "— " + r, cx, cy - 30 + i * 44, 17, { family: C.body, color: "#d9d2c2", align: "center", alpha: a });
  });
  ctx.restore();
};

scenes.theory_spy = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  // Norway outline abstract + Penguin test zone
  const cx = W * 0.44, cy = H * 0.40;
  ctx.save();
  ctx.globalAlpha = easeOut(clamp((p - 0.05) * 2));
  ctx.strokeStyle = "rgba(93,114,133,0.7)"; ctx.lineWidth = 2;
  ctx.beginPath(); // crude south-norway coast
  ctx.moveTo(cx - 150, cy - 120); ctx.quadraticCurveTo(cx - 60, cy - 150, cx + 30, cy - 110);
  ctx.quadraticCurveTo(cx + 90, cy - 80, cx + 120, cy - 20);
  ctx.quadraticCurveTo(cx + 60, cy + 60, cx - 20, cy + 80);
  ctx.quadraticCurveTo(cx - 120, cy + 90, cx - 150, cy + 20);
  ctx.closePath(); ctx.stroke();
  // Bergen dot + test zone
  const a2 = easeOut(clamp((p - 0.25) * 2));
  ctx.fillStyle = `rgba(220,210,190,${a2})`; ctx.beginPath(); ctx.arc(cx - 60, cy - 20, 5, 0, Math.PI * 2); ctx.fill();
  text(ctx, "BERGEN", cx - 60, cy - 34, 11, { family: C.mono, color: "#d6cfc0", align: "center", alpha: a2 });
  // missile arcs
  for (let r = 0; r < 3; r++) {
    const rp = ((p * 1.1 + r * 0.33) % 1);
    ctx.strokeStyle = `rgba(163,60,47,${(1 - rp) * 0.6 * a2})`;
    ctx.beginPath(); ctx.arc(cx + 90, cy + 10, 10 + rp * 46, 0, Math.PI * 2); ctx.stroke();
  }
  text(ctx, "PENGUIN MISSILE TRIALS — WEST NORWAY", cx + 90, cy + 84, 11, { family: C.mono, color: "#d6cfc0", align: "center", alpha: a2 });
  ctx.restore();
};

scenes.theory_accounts = (ctx, W, H, b, t) => { deskBase(ctx, W, H); };

scenes.theory_book = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W / 2, cy = H * 0.40;
  ctx.save();
  ctx.globalAlpha = easeOut(clamp((p - 0.1) * 2));
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.02);
  paperCard(ctx, -110, -140, 220, 280, {});
  text(ctx, "KVINNEN", 0, -40, 22, { family: C.serif, color: C.ink, align: "center" });
  text(ctx, "ISDALEN", 0, -10, 22, { family: C.serif, color: C.ink, align: "center" });
  text(ctx, "ASKE — 2018", 0, 90, 11, { family: C.mono, color: C.inkSoft, align: "center" });
  ctx.restore();
  ctx.restore();
};

scenes.reopening = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W / 2, cy = H * 0.40;
  ctx.save();
  // archive boxes + jaw find
  ctx.globalAlpha = easeOut(clamp((p - 0.1) * 2));
  [[-230, 30], [-70, -10], [90, 40]].forEach(([dx, dy], i) => {
    ctx.fillStyle = "rgba(52,45,36,0.9)";
    ctx.fillRect(cx + dx, cy + dy, 150, 90);
    ctx.strokeStyle = "rgba(201,163,92,0.35)"; ctx.strokeRect(cx + dx, cy + dy, 150, 90);
    text(ctx, "PM 1970 — " + (134 + i * 7) + "/70", cx + dx + 75, cy + dy + 50, 11, { family: C.mono, color: "#a49e8f", align: "center" });
  });
  const fa = easeOut(clamp((p - 0.5) * 2));
  stamp(ctx, "JAW RECOVERED", cx + 180, cy - 60, 14, C.amber, fa, -0.08);
  ctx.restore();
};

scenes.isotope_card = (ctx, W, H, b, t) => { deskBase(ctx, W, H); };

scenes.dna_card = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W * 0.30, cy = H * 0.42;
  ctx.save();
  // double helix abstract (labels come from the generic result cards)
  ctx.globalAlpha = easeOut(clamp(p * 2));
  ctx.lineWidth = 2;
  for (let y = 0; y < 260; y += 5) {
    const ph = y / 42 + p * 2;
    const x1 = cx + Math.sin(ph) * 40, x2 = cx + Math.sin(ph + Math.PI) * 40;
    ctx.strokeStyle = `rgba(93,114,133,${0.35 + 0.25 * Math.sin(y / 26)})`;
    ctx.beginPath(); ctx.moveTo(x1, cy - 130 + y); ctx.lineTo(x2, cy - 130 + y); ctx.stroke();
  }
  ctx.restore();
};

scenes.podcast_card = (ctx, W, H, b, t) => {
  deskBase(ctx, W, H);
  const p = t / b.dur;
  const cx = W / 2, cy = H * 0.40;
  ctx.save();
  ctx.globalAlpha = easeOut(clamp(p * 2));
  // sound waves
  for (let i = 0; i < 40; i++) {
    const h = (Math.sin(i * 1.7 + t * 2) * 0.5 + 0.5) * 60 * easeOut(clamp(p * 2));
    ctx.fillStyle = "rgba(201,163,92,0.75)";
    ctx.fillRect(cx - 240 + i * 12, cy - h / 2, 4, h);
  }
  ctx.restore();
};

scenes.funeral_card = (ctx, W, H, b, t) => {
  const p = t / b.dur;
  deskBase(ctx, W, H);
  const im = loadImageSafe(IMG("mollendal.jpg"));
  if (im) archivePhoto(ctx, im, W * 0.10, H * 0.14, W * 0.5, H * 0.55, "MØLLENDAL CEMETERY — BERGEN", "ARCHIVE · SEE CREDITS", easeOut(clamp(p * 2)));
  else valleySky(ctx, W, H, p, 0.75);
  // zinc coffin silhouette (respectful, abstract)
  ctx.save();
  const a = easeOut(clamp((p - 0.35) * 2));
  ctx.globalAlpha = a;
  ctx.strokeStyle = "rgba(190,200,210,0.8)"; ctx.lineWidth = 2;
  ctx.translate(W * 0.74, H * 0.44);
  ctx.beginPath();
  ctx.moveTo(-80, 0); ctx.quadraticCurveTo(-60, -34, 0, -34); ctx.quadraticCurveTo(60, -34, 80, 0);
  ctx.quadraticCurveTo(60, 34, 0, 34); ctx.quadraticCurveTo(-60, 34, -80, 0);
  ctx.closePath(); ctx.stroke();
  // flowers
  ctx.fillStyle = "rgba(150,120,160,0.6)";
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-40 + i * 20, 20, 4, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
};

scenes.grave_card = (ctx, W, H, b, t) => {
  valleySky(ctx, W, H, 0.4, 0.8);
  const p = t / b.dur;
  // candle flame
  const cx = W / 2, cy = H * 0.46;
  ctx.save();
  const fa = easeOut(clamp(p * 2));
  ctx.globalAlpha = fa;
  ctx.fillStyle = "rgba(220,210,190,0.25)";
  roundRect(ctx, cx - 12, cy, 24, 64, 4); ctx.fill();
  const fl = Math.sin(t * 9) * 2;
  const g = ctx.createRadialGradient(cx + fl, cy - 14, 1, cx + fl, cy - 14, 26);
  g.addColorStop(0, "rgba(255,220,140,0.95)"); g.addColorStop(0.4, "rgba(230,160,60,0.5)"); g.addColorStop(1, "rgba(230,160,60,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(cx + fl, cy - 14, 10, 22, 0, 0, Math.PI * 2); ctx.fill();
  fog(ctx, W, H, t * 8, 13, 0.04);
  ctx.restore();
};

scenes.closing = (ctx, W, H, b, t) => {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0d0f12"); g.addColorStop(1, "#121417");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  fog(ctx, W, H, t * 5, 17, 0.03);
};

scenes.relatives_quote = (ctx, W, H, b, t) => {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0d0f12"); g.addColorStop(1, "#121417");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
};

scenes.end_card = (ctx, W, H, b, t) => {
  ctx.fillStyle = "#0b0c0e"; ctx.fillRect(0, 0, W, H);
  const p = clamp(t / 1.2);
  drawScreen(ctx, W, H, b, p);
  text(ctx, "OPUSCAR STUDIO — THE DOCUMENTARY ENGINE · VIDEO-003", W / 2, H - 30, 12, { family: C.mono, color: "#6f6a5e", align: "center", spacing: 2, alpha: clamp((t - 1) * 0.8) });
};

// scenes that rely only on generic screen text over deskBase
for (const k of ["alias_list", "code_decode", "isotope_card", "theory_accounts"]) {
  if (!scenes[k]) scenes[k] = (ctx, W, H, b, t) => { deskBase(ctx, W, H); };
}

// ===================== master render =====================
export function renderFrame(ctx, W, H, tl, tAbs) {
  const b = tl.blocks.find(bl => tAbs >= bl.start && tAbs < bl.end) || tl.blocks[tl.blocks.length - 1];
  const tLoc = tAbs - b.start;
  chrome(ctx, W, H, tLoc, tAbs, { showCase: b.id !== "b0d" && b.id !== "b8d" });
  const fn = scenes[b.visual] || scenes.closing;
  ctx.save();
  fn(ctx, W, H, b, tLoc, tAbs);
  ctx.restore();
  // screen text layer above art
  ctx.save();
  if (!["title_card", "end_card"].includes(b.visual)) drawScreen(ctx, W, H, b, tLoc / b.dur);
  ctx.restore();
  // edge fade per scene
  ctx.save();
  edgeFade(ctx, W, H, tLoc, b.dur, 0.4, b.visual === "end_card" ? 0 : 0.4);
  ctx.restore();
}
