// shorts.mjs — 4 vertical shorts (720×1280), reusing narration audio + engine primitives.
// Shorts: A. The Strange Suitcases  B. The Notebook and the Travel Trail
//         C. Was She a Spy?         D. The Identity That Remains Unknown
import fs from "fs";
import path from "path";
import {
  C, RNG, clamp, easeOut, text, font, textW, paperCard, stamp, chrome, edgeFade,
  fog, loadImageSafe, archivePhoto,
} from "./engine.mjs";

import { fileURLToPath } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);  // src/ -> film root
const NARR = JSON.parse(fs.readFileSync(path.join(ROOT, "src/narration.json"), "utf8"));
const DUR = JSON.parse(fs.readFileSync(path.join(ROOT, "audio/durations.json"), "utf8"));

const blockById = {};
for (const b of NARR.blocks) blockById[b.id] = b;

function bl(id) { return { ...blockById[id], dur: DUR[id] + 0.5 }; }

// ---- short definitions ----
export const SHORTS = {
  A: {
    slug: "the-strange-suitcases",
    title: "THE STRANGE SUITCASES",
    sub: "The Isdal Woman — Short",
    blocks: ["b2a", "b2b", "b2c", "b2e"],
    art: { b2a: "stationV", b2b: "suitcaseV", b2c: "moneyV", b2e: "labelV" },
  },
  B: {
    slug: "the-notebook-and-travel-trail",
    title: "THE NOTEBOOK",
    sub: "The Isdal Woman — Short",
    blocks: ["b4a", "b4b", "b4c"],
    art: { b4a: "notebookV", b4b: "decodeV", b4c: "notebookCloseV" },
  },
  C: {
    slug: "was-she-a-spy",
    title: "WAS SHE A SPY?",
    sub: "The Isdal Woman — Short",
    blocks: ["b6a", "b6c", "b6d"],
    art: { b6a: "rumourV", b6c: "penguinV", b6d: "accountsV" },
  },
  D: {
    slug: "the-identity-that-remains-unknown",
    title: "THE IDENTITY THAT REMAINS UNKNOWN",
    sub: "The Isdal Woman — Short",
    blocks: ["b7b", "b7c", "b8b", "b8c"],
    art: { b7b: "isotopeV", b7c: "helixV", b8b: "graveV", b8c: "fileV" },
  },
};

const CARD = 4.6; // end card dwell
export function shortTimeline(key) {
  const S = SHORTS[key];
  let t = 2.2;
  const blocks = [];
  for (const id of S.blocks) {
    const b = bl(id);
    blocks.push({ ...b, start: t });
    t += b.dur + 0.9;
  }
  const endStart = t;
  const total = t + CARD;
  return { key, S, total, blocks, endStart };
}

// ---- vertical art (compact, centred 720-wide compositions) ----
const VA = {
  stationV(ctx, W, p) {
    const im = loadImageSafe(ROOT + "/images/cache/bergen_station.jpg");
    if (im) archivePhoto(ctx, im, W * 0.08, 0, W * 0.84, W * 0.62, "BERGEN STATION", "PHOTO: BANE NOR", easeOut(clamp(p * 2)), 0.08, 0.26);
  },
  suitcaseV(ctx, W, p) {
    paperCard(ctx, W * 0.10, W * 0.10, W * 0.80, 300, {});
    text(ctx, "SUITCASE CONTENTS", W * 0.16, W * 0.10 + 44, 16, { family: C.mono, color: C.inkSoft, spacing: 2 });
    const items = ["CLOTHES + SHOES", "SEVERAL WIGS", "COSMETICS · COMB", "MAPS + TIMETABLES", "COINS: BE · GB · CH", "GLASSES — FINGERPRINT MATCH", "ECZEMA CREAM — LABEL SCRAPED"];
    items.forEach((it, i) => {
      const a = easeOut(clamp(p * items.length * 1.2 - i, 0, 1));
      text(ctx, "— " + it, W * 0.16, W * 0.10 + 90 + i * 30, 15, { family: C.mono, color: C.ink, alpha: a });
    });
  },
  moneyV(ctx, W, p) {
    paperCard(ctx, W * 0.10, W * 0.10, W * 0.80, 240, {});
    const np = easeOut(clamp((p - 0.2) * 2));
    for (let i = 0; i < 5; i++) {
      const ia = clamp(np * 5 - i, 0, 1);
      ctx.save(); ctx.globalAlpha = ia;
      ctx.translate(W * 0.5 - 160 + i * 80, W * 0.10 + 120); ctx.rotate(-0.06 + i * 0.02);
      ctx.fillStyle = "#3d4a3a"; ctx.fillRect(-46, -24, 92, 48);
      text(ctx, "100", 0, -2, 16, { family: C.serif, color: "#cfd8c8", align: "center" });
      text(ctx, "DM", 0, 14, 9, { family: C.mono, color: "#9fb09a", align: "center" });
      ctx.restore();
    }
    text(ctx, "SEWN INTO THE LINING", W * 0.5, W * 0.10 + 200, 14, { family: C.mono, color: C.ink, align: "center", alpha: np });
  },
  labelV(ctx, W, p) {
    const a = easeOut(clamp(p * 2));
    ctx.save(); ctx.globalAlpha = a;
    stamp(ctx, "ALL LABELS REMOVED", W * 0.5, W * 0.42, 18, C.red, a, -0.05);
    ctx.restore();
  },
  notebookV(ctx, W, p) {
    paperCard(ctx, W * 0.12, W * 0.08, W * 0.76, 280, {});
    ctx.strokeStyle = "rgba(28,26,22,0.35)";
    for (let i = 0; i < 7; i++) {
      const y = W * 0.08 + 50 + i * 32;
      ctx.beginPath(); ctx.moveTo(W * 0.18, y); ctx.lineTo(W * 0.82, y); ctx.stroke();
    }
    ["O22 O28 P", "O29PS", "O29S", "O30BN5"].forEach((e, i) => {
      const a = easeOut(clamp((p - 0.2 - i * 0.12) * 3));
      text(ctx, e, W * 0.22, W * 0.08 + 60 + i * 32, 15, { family: C.mono, color: C.ink, alpha: a });
    });
  },
  decodeV(ctx, W, p) {
    const rows = [["O22–O28 P", "PARIS"], ["O29PS", "PARIS→STAVANGER"], ["O29S", "STAVANGER"], ["O30BN5", "BERGEN 30.10–05.11"]];
    rows.forEach(([code, city], i) => {
      const a = easeOut(clamp((p - 0.1 - i * 0.2) * 2.6));
      if (a <= 0) return;
      const y = W * 0.12 + i * 66;
      ctx.save(); ctx.globalAlpha = a;
      paperCard(ctx, W * 0.12, y - 22, 170, 44, { alpha: a });
      text(ctx, code, W * 0.12 + 85, y + 7, 17, { family: C.mono, color: C.ink, align: "center" });
      text(ctx, "→", W * 0.12 + 196, y + 8, 17, { family: C.mono, color: C.amber });
      text(ctx, city, W * 0.12 + 226, y + 7, 16, { family: C.mono, color: "#e6dfcf" });
      ctx.restore();
    });
  },
  notebookCloseV(ctx, W, p) {
    const a = easeOut(clamp((p - 0.15) * 2));
    ctx.save(); ctx.globalAlpha = a;
    stamp(ctx, "A TRAVEL LOG — NOTHING MORE", W * 0.5, W * 0.42, 15, C.amber, a, -0.04);
    ctx.restore();
  },
  rumourV(ctx, W, p) {
    const a = easeOut(clamp(p * 2));
    ctx.save(); ctx.globalAlpha = a;
    text(ctx, "BERGEN, 1970", W * 0.5, W * 0.30, 15, { family: C.mono, color: C.amber, align: "center", spacing: 2 });
    text(ctx, "A CITY OF", W * 0.5, W * 0.38, 22, { family: C.serif, color: "#e6dfcf", align: "center" });
    text(ctx, "COLD WAR RUMOUR", W * 0.5, W * 0.44, 22, { family: C.serif, color: "#e6dfcf", align: "center" });
    ctx.restore();
  },
  penguinV(ctx, W, p) {
    const cx = W * 0.5, cy = W * 0.38;
    ctx.save();
    ctx.globalAlpha = easeOut(clamp((p - 0.05) * 2));
    for (let r = 0; r < 3; r++) {
      const rp = ((p * 0.9 + r * 0.33) % 1);
      ctx.strokeStyle = `rgba(163,60,47,${(1 - rp) * 0.55})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 12 + rp * 90, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = "rgba(220,210,190,0.9)";
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    text(ctx, "PENGUIN MISSILE TRIALS — WEST NORWAY", cx, cy + 110, 13, { family: C.mono, color: "#d6cfc0", align: "center" });
    stamp(ctx, "THEORY: ESPIONAGE — NEVER ESTABLISHED", cx, cy + 170, 11, C.red, easeOut(clamp((p - 0.5) * 2)), -0.04);
    ctx.restore();
  },
  accountsV(ctx, W, p) {
    [["1991", "ANONYMOUS TAXI DRIVER"], ["2005", "FLØYEN HIKER"]].forEach(([yr, s], i) => {
      const a = easeOut(clamp((p - 0.15 - i * 0.25) * 2.4));
      if (a <= 0) return;
      const y = W * 0.22 + i * 90;
      const w = textW(ctx, s, 14, C.mono) + 150;
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(18,20,23,0.85)";
      ctx.fillRect(W * 0.5 - w / 2, y - 22, w, 44);
      ctx.strokeStyle = "rgba(163,60,47,0.7)"; ctx.strokeRect(W * 0.5 - w / 2, y - 22, w, 44);
      stamp(ctx, "UNVERIFIED", W * 0.5 - w / 2 + 58, y, 9, C.red, a, -0.07);
      text(ctx, s, W * 0.5 - w / 2 + 100, y + 5, 13, { family: C.mono, color: "#e0d8c8" });
      ctx.restore();
    });
  },
  isotopeV(ctx, W, p) {
    [["BORN c. 1930 ±4"], ["NUREMBERG REGION"], ["CHILDHOOD: FRANCE / FR–DE BORDER"]].forEach(([s], i) => {
      const a = easeOut(clamp((p - 0.1 - i * 0.22) * 2.6));
      if (a <= 0) return;
      const y = W * 0.34 + i * 66;
      const w = textW(ctx, s, 15, C.mono) + 48;
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(18,20,23,0.88)";
      ctx.fillRect(W * 0.5 - w / 2, y - 20, w, 40);
      ctx.strokeStyle = "rgba(201,163,92,0.7)"; ctx.strokeRect(W * 0.5 - w / 2, y - 20, w, 40);
      text(ctx, s, W * 0.5, y + 6, 15, { family: C.mono, color: "#e6dfcf", align: "center" });
      ctx.restore();
    });
  },
  helixV(ctx, W, p) {
    [["DNA — EUROPEAN DESCENT"], ["mtDNA — HAPLOGROUP H24"]].forEach(([s2], i) => {
      const a = easeOut(clamp((p - 0.25 - i * 0.25) * 2.6));
      if (a <= 0) return;
      const y = W * 0.72 + i * 60;
      const w = textW(ctx, s2, 14, C.mono) + 44;
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(18,20,23,0.88)";
      ctx.fillRect(W * 0.5 - w / 2, y - 19, w, 38);
      ctx.strokeStyle = "rgba(201,163,92,0.7)"; ctx.strokeRect(W * 0.5 - w / 2, y - 19, w, 38);
      text(ctx, s2, W * 0.5, y + 5, 14, { family: C.mono, color: "#e6dfcf", align: "center" });
      ctx.restore();
    });
    const cx = W * 0.5, cy = W * 0.30;
    ctx.save();
    ctx.globalAlpha = easeOut(clamp(p * 2));
    ctx.lineWidth = 2;
    for (let y = 0; y < 200; y += 5) {
      const ph = y / 36 + p * 2;
      const x1 = cx + Math.sin(ph) * 34, x2 = cx + Math.sin(ph + Math.PI) * 34;
      ctx.strokeStyle = `rgba(93,114,133,${0.35 + 0.25 * Math.sin(y / 24)})`;
      ctx.beginPath(); ctx.moveTo(x1, cy - 90 + y); ctx.lineTo(x2, cy - 90 + y); ctx.stroke();
    }
    ctx.restore();
  },
  graveV(ctx, W, p) {
    const cx = W * 0.5, cy = W * 0.40;
    ctx.save();
    ctx.globalAlpha = easeOut(clamp(p * 2));
    ctx.fillStyle = "rgba(220,210,190,0.22)";
    ctx.fillRect(cx - 10, cy, 20, 54);
    const fl = Math.sin(p * 60) * 1.6;
    const g = ctx.createRadialGradient(cx + fl, cy - 12, 1, cx + fl, cy - 12, 22);
    g.addColorStop(0, "rgba(255,220,140,0.95)"); g.addColorStop(1, "rgba(230,160,60,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(cx + fl, cy - 12, 8, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },
  fileV(ctx, W, p) {
    const a = easeOut(clamp((p - 0.1) * 2));
    ctx.save(); ctx.globalAlpha = a;
    ctx.translate(W * 0.5 - 90, W * 0.22);
    ctx.rotate(-0.02);
    paperCard(ctx, 0, 0, 180, 130, {});
    text(ctx, "134/70", 22, 78, 30, { family: C.mono, color: C.ink, weight: "bold" });
    ctx.restore();
  },
};

// ---- frame renderer ----
const VW = 720, VH = 1280;
export function renderShortFrame(ctx, key, tAbs) {
  const TL = shortTimeline(key);
  const { S } = TL;
  // bg
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, "#101216"); g.addColorStop(1, "#14171b");
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  // chrome
  text(ctx, "CASE 134/70", 24, VH - 26, 12, { family: C.mono, color: C.amber, alpha: 0.5, spacing: 2 });
  // header
  ctx.fillStyle = "rgba(201,163,92,0.14)";
  ctx.fillRect(24, 46, textW(ctx, S.title, 17, C.mono, "bold") + 36, 40);
  ctx.strokeStyle = "rgba(201,163,92,0.6)";
  ctx.strokeRect(24.5, 46.5, textW(ctx, S.title, 17, C.mono, "bold") + 36, 40);
  text(ctx, S.title, 42, 72, 17, { family: C.mono, color: C.amber, spacing: 1 });
  text(ctx, S.sub, VW - 24 - textW(ctx, S.sub, 11, C.mono), 72, 11, { family: C.mono, color: "#8a8577" });

  // find active block
  const b = TL.blocks.find(x => tAbs >= x.start && tAbs < x.start + x.dur);
  if (b) {
    const tLoc = tAbs - b.start;
    const p = tLoc / b.dur;
    // art region (middle band)
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 130, VW, 640); ctx.clip();
    (VA[S.art[b.id]] || VA.fileV)(ctx, VW, p);
    ctx.restore();
    // narration screen lines (mono style) lower band
    let mi = 0;
    (b.screen || []).forEach(([s, kind], i) => {
      if (!["mono", "quote", "warn"].includes(kind)) return;
      const a = easeOut(clamp((p - 0.12 - mi * 0.22) * 2.6));
      if (a <= 0) { mi++; return; }
      const y = 850 + mi * 44;
      ctx.fillStyle = `rgba(201,163,92,${0.85 * a})`;
      ctx.fillRect(28, y - 14, 4, 18);
      const size = kind === "quote" ? 13 : 14.5;
      const lines = wrap(ctx, s, VW - 90, size, C.mono);
      lines.forEach((ln, li) => {
        text(ctx, ln, 44, y + li * 24, size, { family: C.mono, color: kind === "quote" ? "#c9c2b2" : "#d9d2c2", alpha: a });
      });
      mi += lines.length;
    });
    ctx.save();
    edgeFade(ctx, VW, VH, tLoc, b.dur, 0.35, 0.35);
    ctx.restore();
  } else if (tAbs >= TL.endStart) {
    // end card
    const p = clamp((tAbs - TL.endStart) / 1.2);
    ctx.save(); ctx.globalAlpha = easeOut(p);
    text(ctx, "THE FULL FILE", VW / 2, VH * 0.40, 34, { family: C.serif, color: "#e9e2d3", align: "center", spacing: 2 });
    text(ctx, "THE ISDAL WOMAN", VW / 2, VH * 0.40 + 54, 22, { family: C.serif, color: C.amber, align: "center" });
    text(ctx, "WATCH THE FULL DOCUMENTARY", VW / 2, VH * 0.40 + 120, 14, { family: C.mono, color: "#a49e8f", align: "center", spacing: 2 });
    text(ctx, "LINK IN DESCRIPTION", VW / 2, VH * 0.40 + 148, 12, { family: C.mono, color: "#6f6a5e", align: "center", spacing: 2 });
    ctx.restore();
  } else {
    // intro beat — title splash
    const p = clamp(tAbs / 1.4);
    ctx.save(); ctx.globalAlpha = easeOut(p);
    fog(ctx, VW, VH, tAbs * 6, 9, 0.04);
    text(ctx, "THE ISDAL WOMAN", VW / 2, VH * 0.44, 30, { family: C.serif, color: "#e9e2d3", align: "center", spacing: 1 });
    text(ctx, "SHORT — " + S.title, VW / 2, VH * 0.44 + 44, 13, { family: C.mono, color: C.amber, align: "center", spacing: 2 });
    ctx.restore();
  }
  // grain
  const rnd = RNG(7 + Math.floor(tAbs * 24) % 8);
  ctx.save(); ctx.globalAlpha = 0.05; ctx.fillStyle = "#fff";
  for (let i = 0; i < 60; i++) ctx.fillRect(rnd() * VW, rnd() * VH, 1.2, 1.2);
  ctx.restore();
}
function wrap(ctx, s, maxW, size, family) {
  font(ctx, size, family);
  const words = s.split(/\s+/); const lines = []; let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
