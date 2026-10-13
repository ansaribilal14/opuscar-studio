// shorts.mjs (v2) — 4 vertical shorts 1080×1920, film_look v2 engine.
// API kept: SHORTS, shortTimeline(key), renderShortFrame(ctx, key, t).
// A. The Strange Suitcases  B. The Notebook  C. Was She a Spy?  D. The Identity That Remains Unknown
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  PAL, photoPlate, grain, basePlate, vignette, chrome2,
  kicker, display as _display, rule, paper, stamp2, fog2, norwayMap, glow, photo,
} from "./film_look.mjs";
import { clamp, lerp, ease, easeOut, text, font, textW } from "./engine.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const S = PAL;
// shadow display(): vertical lines auto-shrink to fit frame width
function display(ctx, str, cx, y, size, p, opts = {}) {
  return _display(ctx, str, cx, y, size, p, { maxW: W_DYN * 0.9, ...opts });
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const NARR = JSON.parse(fs.readFileSync(path.join(ROOT, "src/narration.json"), "utf8"));
const DUR = JSON.parse(fs.readFileSync(path.join(ROOT, "audio/durations.json"), "utf8"));
const blockById = {};
for (const b of NARR.blocks) blockById[b.id] = b;
function bl(id) { return { ...blockById[id], dur: DUR[id] + 0.5 }; }

export const SHORTS = {
  A: { slug: "the-strange-suitcases", title: "THE STRANGE SUITCASES", blocks: ["b2a", "b2b", "b2c", "b2e"] },
  B: { slug: "the-notebook-and-travel-trail", title: "THE NOTEBOOK", blocks: ["b4a", "b4b", "b4c"] },
  C: { slug: "was-she-a-spy", title: "WAS SHE A SPY?", blocks: ["b6a", "b6c", "b6d"] },
  D: { slug: "the-identity-that-remains-unknown", title: "THE IDENTITY THAT REMAINS UNKNOWN", blocks: ["b7b", "b7c", "b8b", "b8c"] },
};

const CARD = 4.8, LEAD = 2.2, GAP = 0.9;
export function shortTimeline(key) {
  const SH = SHORTS[key];
  let t = LEAD;
  const blocks = [];
  for (const id of SH.blocks) {
    const b = bl(id);
    blocks.push({ ...b, start: t });
    t += b.dur + GAP;
  }
  const endStart = t;
  const total = t + CARD;
  return { key, S: SH, total, blocks, endStart };
}

// ---------- vertical scene helpers ----------
function vTitle(ctx, W, H, kickerTxt, line1, line2, p, yFrac = 0.16) {
  const y = Math.round(H * yFrac);
  kicker(ctx, kickerTxt, W / 2, y, Math.round(W * 0.030), { align: "center" });
  display(ctx, line1, W / 2, Math.round(y + H * 0.055), Math.round(W * 0.105), clamp(p), { align: "center" });
  if (line2) display(ctx, line2, W / 2, Math.round(y + H * 0.055 + W * 0.125), Math.round(W * 0.105), clamp(p - 0.5), { align: "center" });
}
function vChipCenter(ctx, str, y, W, size, opts = {}) {
  chipV(ctx, str, W / 2, y, size, { align: "center", ...opts });
}
function chipV(ctx, str, x, y, size, opts = {}) {
  const { color = S.boneDim, border = "rgba(234,227,212,0.35)", fill = "rgba(12,15,20,0.55)", align = "left", alpha = 1 } = opts;
  font(ctx, size, S.mono, "bold");
  const padX = size * 0.8, padY = size * 0.6;
  let w = ctx.measureText(str).width;
  w = Math.min(w + padX * 2, W_DYN * 0.92);
  const h = size + padY * 2;
  let xx = x;
  if (align === "center") xx = x - w / 2;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.fillStyle = fill; ctx.fillRect(xx, y - padY, w, h);
  ctx.strokeStyle = border; ctx.lineWidth = 1.4; ctx.strokeRect(xx + 0.5, y - padY + 0.5, w - 1, h - 1);
  ctx.fillStyle = color; ctx.textAlign = "left";
  // draw text possibly truncated to fit
  let s = str;
  while (ctx.measureText(s).width > w - padX * 2 && s.length > 4) s = s.slice(0, -2);
  if (s !== str) s += "…";
  ctx.fillText(s, xx + padX, y + size * 0.36);
  ctx.restore();
}
let W_DYN = 1080;
function paperV(ctx, x, y, w, h, opts = {}) { paper(ctx, x, y, w, h, opts); }

// ---------- per-block vertical art ----------
const ART = {
  b2a(ctx, W, H, t, dur) {
    photoPlate(ctx, W, H, t, dur, "bergen_station.jpg", { zoom: [1.02, 1.12], scrim: 0.5 });
    vTitle(ctx, W, H, "BERGEN — LEFT-LUGGAGE OFFICE", "TWO SUITCASES", "WAITED FOR HER", clamp(t / 1.2), 0.70);
    text(ctx, "PHOTO: BANE NOR", W - W * 0.05, H - H * 0.035, Math.round(W * 0.022), { family: S.mono, color: S.boneFaint, align: "right", alpha: 0.8 });
  },
  b2b(ctx, W, H, t, dur) {
    basePlate(ctx, W, H, t);
    kicker(ctx, "SUITCASE CONTENTS — RECONSTRUCTION", W / 2, Math.round(H * 0.115), Math.round(W * 0.026), { align: "center" });
    const items = [
      ["CLOTHES + SHOES", 0], ["SEVERAL WIGS", 0], ["COSMETICS · COMB · BRUSH", 0],
      ["MAPS + TIMETABLES", 0], ["COINS — BE · UK · CH + NOK", 0],
      ["GLASSES — FINGERPRINT MATCHED", 1], ["ECZEMA CREAM — STICKER SCRAPED OFF", 2],
    ];
    items.forEach(([s, hot], i) => {
      const ip = clamp((t - 0.5 - i * 0.55) / 0.6);
      if (ip <= 0) return;
      const y = Math.round(H * (0.20 + i * 0.082));
      ctx.save(); ctx.globalAlpha = easeOut(ip);
      const col = hot === 2 ? S.red : hot === 1 ? S.amber : S.bone;
      glow(ctx, W * 0.12, y - W * 0.008, W * (hot ? 0.016 : 0.010), hot ? "rgba(210,168,94,0.4)" : "rgba(234,227,212,0.22)", 1);
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(W * 0.12, y - W * 0.008, W * 0.008, 0, Math.PI * 2); ctx.fill();
      font(ctx, Math.round(W * 0.043), hot ? S.mono : S.body, hot ? "bold" : "");
      ctx.fillStyle = col; ctx.textAlign = "left";
      ctx.fillText(s, W * 0.17, y);
      ctx.restore();
    });
    chipV(ctx, "EVERY IDENTIFYING MARK — REMOVED", W / 2, Math.round(H * 0.83), Math.round(W * 0.030), { align: "center", alpha: clamp((t - 4.4) / 0.8) });
  },
  b2c(ctx, W, H, t, dur) {
    basePlate(ctx, W, H, t);
    // banknote fan
    const np = clamp((t - 0.4) / 1.2);
    for (let i = 0; i < 5; i++) {
      const ip = clamp(np * 5 - i);
      if (ip <= 0) continue;
      ctx.save(); ctx.globalAlpha = easeOut(ip);
      ctx.translate(W / 2, Math.round(H * 0.34)); ctx.rotate(-0.30 + i * 0.13);
      const bw = W * 0.52, bh = W * 0.26;
      ctx.fillStyle = "#cbb98a"; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
      ctx.strokeStyle = "rgba(70,55,25,0.7)"; ctx.lineWidth = 2; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      ctx.strokeStyle = "#6b5324"; ctx.beginPath(); ctx.arc(0, 0, bh * 0.30, 0, Math.PI * 2); ctx.stroke();
      text(ctx, "100", 0, bh * 0.12, Math.round(bh * 0.36), { family: S.serif, color: "#6b5324", align: "center", weight: "bold" });
      ctx.restore();
    }
    const sp = clamp((t - 1.4) / 0.6);
    if (sp > 0) {
      ctx.save(); ctx.globalAlpha = sp;
      const sc = 1 + (1 - easeOut(sp)) * 0.6;
      ctx.translate(W / 2, Math.round(H * 0.30)); ctx.scale(sc, sc);
      stamp2(ctx, "500 DM", 0, 0, Math.round(W * 0.075), { angle: -0.10 });
      ctx.restore();
    }
    vTitle(ctx, W, H, "HIDDEN IN THE LINING", "5 × 100", "DEUTSCHE MARKS", clamp((t - 1.6) / 1), 0.50);
    chipV(ctx, "AND A NOTEPAD — WRITTEN IN CODE", W / 2, Math.round(H * 0.755), Math.round(W * 0.030), { align: "center", color: S.red, border: "rgba(176,64,47,0.55)", alpha: clamp((t - 2.6) / 0.8) });
  },
  b2e(ctx, W, H, t, dur) {
    basePlate(ctx, W, H, t);
    vTitle(ctx, W, H, "THEN — THE REALISATION", "EVERY LABEL", "REMOVED BEFORE SHE DIED", clamp(t / 1.2), 0.30);
    const pp = clamp((t - 1.4) / 0.7);
    if (pp > 0) {
      ctx.save(); ctx.globalAlpha = pp;
      paperV(ctx, W * 0.14, Math.round(H * 0.50), W * 0.72, Math.round(H * 0.17), { tilt: -0.02 });
      font(ctx, Math.round(W * 0.052), S.serif, "bold");
      ctx.fillStyle = S.ink; ctx.textAlign = "center";
      ctx.fillText("DELIBERATELY.", W / 2, Math.round(H * 0.50 + H * 0.10));
      ctx.restore();
    }
    chipV(ctx, "NOTHING WOULD SPEAK HER NAME", W / 2, Math.round(H * 0.76), Math.round(W * 0.028), { align: "center", alpha: clamp((t - 2.2) / 0.8) });
  },
  b4a(ctx, W, H, t, dur) {
    basePlate(ctx, W, H, t);
    vTitle(ctx, W, H, "FROM THE SUITCASE", "A NOTEPAD", "WRITTEN IN CODE", clamp(t / 1.2), 0.22);
    const np = clamp((t - 0.7) / 0.9);
    if (np > 0) {
      ctx.save(); ctx.globalAlpha = easeOut(np);
      const nw = W * 0.72, nh = H * 0.26, nx = W * 0.14, ny = Math.round(H * 0.47);
      paperV(ctx, nx, ny, nw, nh, { tilt: 0.02 });
      const toks = ["O22 · O28 · P", "O29PS", "O29S", "O30 · BN5"];
      toks.forEach((tk, i) => {
        const tp = clamp(np * 4 - i);
        if (tp <= 0) return;
        text(ctx, tk, nx + nw * 0.09, ny + nh * (0.20 + i * 0.20), Math.round(nh * 0.14), { family: S.mono, color: "#33302a", alpha: tp });
      });
      ctx.restore();
    }
  },
  b4b(ctx, W, H, t, dur) {
    basePlate(ctx, W, H, t);
    vTitle(ctx, W, H, "THE CODE, CRACKED", "IT RECORDED", "JOURNEYS", clamp(t / 1.2), 0.10);
    const rows = [["O22 – O28 · P", "PARIS"], ["O29 · PS", "PARIS → STAVANGER"], ["O29 · S", "STAVANGER"], ["O30 · BN5", "BERGEN 30.10–05.11"]];
    rows.forEach(([code, mean], i) => {
      const rp = clamp((t - 0.8 - i * 0.7) / 0.6);
      if (rp <= 0) return;
      const y = Math.round(H * (0.335 + i * 0.115));
      ctx.save(); ctx.globalAlpha = easeOut(rp);
      ctx.fillStyle = "rgba(16,20,27,0.85)";
      ctx.fillRect(W * 0.08, y - H * 0.038, W * 0.38, H * 0.076);
      ctx.strokeStyle = "rgba(210,168,94,0.55)"; ctx.lineWidth = 1.6;
      ctx.strokeRect(W * 0.08 + 0.5, y - H * 0.038 + 0.5, W * 0.38 - 1, H * 0.076 - 1);
      text(ctx, code, W * 0.27, y + W * 0.008, Math.round(W * 0.040), { family: S.mono, color: S.amber, align: "center", weight: "bold" });
      font(ctx, Math.round(W * 0.047), S.serif, "bold");
      ctx.fillStyle = S.bone; ctx.textAlign = "left";
      ctx.fillText(mean, W * 0.51, y + W * 0.010);
      ctx.restore();
    });
  },
  b4c(ctx, W, H, t, dur) {
    basePlate(ctx, W, H, t);
    vTitle(ctx, W, H, "NOT A CIPHER OF STATE SECRETS", "A PRIVATE", "TRAVEL LOG", clamp(t / 1.2), 0.30);
    chipV(ctx, "PLACES, AND DATES — NOTHING MORE", W / 2, Math.round(H * 0.60), Math.round(W * 0.030), { align: "center", alpha: clamp((t - 1.5) / 0.8) });
    chipV(ctx, "NOT ESPIONAGE MATERIAL", W / 2, Math.round(H * 0.68), Math.round(W * 0.028), { align: "center", color: S.amber, border: "rgba(210,168,94,0.5)", alpha: clamp((t - 2.0) / 0.8) });
  },
  b6a(ctx, W, H, t, dur) {
    photoPlate(ctx, W, H, t, dur, "moody_peak.jpg", { zoom: [1.02, 1.12], dark: 0.25 });
    fog2(ctx, W, H, t, 17, 0.06);
    vTitle(ctx, W, H, "BERGEN, 1970 — COLD WAR RUMOUR", "THE ERASURE", "FUELLED THEORIES", clamp(t / 1.2), 0.30);
    chipV(ctx, "CUT LABELS · SCRAPED SCRIPTS · EIGHT NAMES", W / 2, Math.round(H * 0.60), Math.round(W * 0.026), { align: "center", alpha: clamp((t - 1.6) / 0.8) });
  },
  b6c(ctx, W, H, t, dur) {
    basePlate(ctx, W, H, t);
    vTitle(ctx, W, H, "THEORY THAT FOLLOWED THE CASE", "WAS SHE", "A SPY?", clamp(t / 1.2), 0.12);
    const rows = [
      ["DECLASSIFIED RECORDS", "movements \u201Cseem to correspond\u201D to secret missile trials"],
      ["A FISHERMAN", "placed her near the test area"],
      ["THE SHOE SALE", "confirms Stavanger, October"],
    ];
    rows.forEach(([k, v], i) => {
      const rp = clamp((t - 1.2 - i * 0.8) / 0.6);
      if (rp <= 0) return;
      const y = Math.round(H * (0.36 + i * 0.105));
      ctx.save(); ctx.globalAlpha = easeOut(rp);
      text(ctx, k, W * 0.10, y, Math.round(W * 0.030), { family: S.mono, color: S.amber });
      text(ctx, v, W * 0.10, y + Math.round(H * 0.032), Math.round(W * 0.035), { family: S.body, color: S.bone, maxWidth: W * 0.80 });
      ctx.restore();
    });
    norwayMap(ctx, W * 0.28, Math.round(H * 0.70), W * 0.44, W * 0.62, t, {
      p: clamp((t - 2.6) / 1), highlight: ["stavanger"],
      routes: [{ path: ["stavanger", "bergen"], p: clamp((t - 2.8) / 1.2) }],
    });
    chipV(ctx, "NEVER ESTABLISHED — NO EVIDENCE SHE WAS A SPY", W / 2, Math.round(H * 0.945), Math.round(W * 0.026), { align: "center", color: S.bone, border: "rgba(234,227,212,0.4)", alpha: clamp((t - 3.6) / 0.8) });
  },
  b6d(ctx, W, H, t, dur) {
    basePlate(ctx, W, H, t);
    vTitle(ctx, W, H, "SHADOWING THE FILE", "TWO ACCOUNTS", "NEITHER VERIFIED", clamp(t / 1.2), 0.12);
    const cards = [
      ["1991", "ANONYMOUS TAXI DRIVER", "A man joined her for the ride to the station."],
      ["2005", "FL\u00D8YEN HIKER", "She walked ahead of two men in coats."],
    ];
    cards.forEach(([yr, who, v], i) => {
      const cp = clamp((t - 1.0 - i * 1.1) / 0.8);
      if (cp <= 0) return;
      const cy = Math.round(H * (0.34 + i * 0.24));
      const chh = Math.round(H * 0.20);
      ctx.save(); ctx.globalAlpha = easeOut(cp);
      ctx.fillStyle = "rgba(12,15,20,0.66)"; ctx.fillRect(W * 0.10, cy, W * 0.80, chh);
      ctx.strokeStyle = "rgba(234,227,212,0.28)"; ctx.lineWidth = 1.6;
      ctx.strokeRect(W * 0.10 + 0.5, cy + 0.5, W * 0.80 - 1, chh - 1);
      font(ctx, Math.round(W * 0.10), S.serif, "bold");
      ctx.fillStyle = S.bone; ctx.textAlign = "left";
      ctx.fillText(yr, W * 0.15, cy + chh * 0.42);
      text(ctx, who, W * 0.15, cy + chh * 0.62, Math.round(W * 0.028), { family: S.mono, color: S.amber });
      text(ctx, v, W * 0.15, cy + chh * 0.80, Math.round(W * 0.033), { family: S.body, color: S.boneDim, maxWidth: W * 0.70 });
      stamp2(ctx, "UNVERIFIED", W * 0.74, cy + chh * 0.30, Math.round(W * 0.036), { color: S.slate, angle: -0.06, alpha: clamp(cp * 2 - 0.6) });
      ctx.restore();
    });
  },
  b7b(ctx, W, H, t, dur) {
    basePlate(ctx, W, H, t);
    fog2(ctx, W, H, t, 22, 0.03);
    vTitle(ctx, W, H, "2017 — ISOTOPES IN HER TEETH", "THE WATER SHE", "DRANK AS A CHILD", clamp(t / 1.2), 0.12);
    const rp = clamp((t - 1.3) / 1);
    if (rp > 0) {
      display(ctx, "BORN c. 1930", W / 2, Math.round(H * 0.44), Math.round(W * 0.115), clamp(rp));
      display(ctx, "± 4 YEARS", W / 2, Math.round(H * 0.505), Math.round(W * 0.075), clamp(rp - 0.3), { color: S.boneDim });
    }
    const rp2 = clamp((t - 2.2) / 1);
    if (rp2 > 0) {
      display(ctx, "MOST LIKELY:", W / 2, Math.round(H * 0.615), Math.round(W * 0.045), clamp(rp2), { color: S.boneDim, weight: "" });
      display(ctx, "NUREMBERG REGION", W / 2, Math.round(H * 0.665), Math.round(W * 0.078), clamp(rp2 - 0.2), { color: S.amber });
      display(ctx, "CHILDHOOD: FRANCE / FR–DE BORDER", W / 2, Math.round(H * 0.745), Math.round(W * 0.040), clamp((t - 3.0) / 0.9), { color: S.boneDim, weight: "" });
    }
  },
  b7c(ctx, W, H, t, dur) {
    basePlate(ctx, W, H, t);
    // vertical helix — centred, bright
    const hp = clamp((t - 0.2) / 1.2);
    const hx = W * 0.5, hy0 = H * 0.14, hy1 = H * 0.52, coils = 4.5, amp = W * 0.16;
    ctx.save(); ctx.globalAlpha = 0.95;
    for (let strand = 0; strand < 2; strand++) {
      ctx.strokeStyle = strand === 0 ? "rgba(234,227,212,0.9)" : "rgba(210,168,94,0.9)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let y = 0; y <= (hy1 - hy0) * hp; y += 4) {
        const ph = y / (hy1 - hy0) * Math.PI * 2 * coils + strand * Math.PI + t * 0.5;
        const x = hx + Math.sin(ph) * amp;
        y === 0 ? ctx.moveTo(x, hy0 + y) : ctx.lineTo(x, hy0 + y);
      }
      ctx.stroke();
    }
    const nR = Math.floor((hy1 - hy0) * hp / (H * 0.022));
    for (let i = 0; i <= nR; i++) {
      const y = i * H * 0.022;
      const ph = y / (hy1 - hy0) * Math.PI * 2 * coils + t * 0.5;
      ctx.strokeStyle = `rgba(139,160,180,${0.3 + 0.4 * Math.abs(Math.sin(ph))})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(hx + Math.sin(ph) * amp, hy0 + y);
      ctx.lineTo(hx + Math.sin(ph + Math.PI) * amp, hy0 + y);
      ctx.stroke();
    }
    ctx.restore();
    vTitle(ctx, W, H, "WHAT THE DNA COULD SAY", "EUROPEAN", "DESCENT", clamp((t - 1.2) / 1), 0.56);
    chipV(ctx, "mtDNA — HAPLOGROUP H24", W / 2, Math.round(H * 0.78), Math.round(W * 0.036), { align: "center", color: S.amber, border: "rgba(210,168,94,0.5)", alpha: clamp((t - 2.4) / 0.8) });
    chipV(ctx, "AN UNIDENTIFIED FRENCH PASSENGER — ON ONE FLIGHT", W / 2, Math.round(H * 0.85), Math.round(W * 0.026), { align: "center", alpha: clamp((t - 3.0) / 0.8) });
  },
  b8b(ctx, W, H, t, dur) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#12161d"); g.addColorStop(1, "#0d1015");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    fog2(ctx, W, H, t, 25, 0.03);
    // wreath + candle
    const gx = W / 2, gy = Math.round(H * 0.30);
    ctx.save(); ctx.globalAlpha = clamp(t / 1.5);
    ctx.strokeStyle = "rgba(120,140,120,0.55)"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(gx, gy, W * 0.16, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(150,170,150,0.35)"; ctx.lineWidth = 3;
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(gx + Math.cos(a) * W * 0.16, gy + Math.sin(a) * W * 0.16);
      ctx.lineTo(gx + Math.cos(a + 0.12) * W * 0.185, gy + Math.sin(a + 0.12) * W * 0.185);
      ctx.stroke();
    }
    ctx.restore();
    const fl = 0.82 + 0.18 * Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1);
    glow(ctx, gx, Math.round(H * 0.52), W * 0.30 * fl, "rgba(226,168,84,0.16)", 1);
    glow(ctx, gx, Math.round(H * 0.52), W * 0.10 * fl, "rgba(240,200,120,0.4)", 1);
    vTitle(ctx, W, H, "M\u00D8LLENDAL — THE UNMARKED GRAVE", "FIFTY-FIVE YEARS", "STILL NO NAME", clamp((t - 0.4) / 1.2), 0.60);
    chipV(ctx, "MARKED ONLY BY WHAT VISITORS LEAVE", W / 2, Math.round(H * 0.82), Math.round(W * 0.028), { align: "center", alpha: clamp((t - 1.8) / 0.8) });
    text(ctx, "A wreath. A candle.", W / 2, Math.round(H * 0.88), Math.round(W * 0.045), { family: S.serif, color: S.bone, align: "center", alpha: clamp((t - 2.2) / 0.9) });
  },
  b8c(ctx, W, H, t, dur) {
    photoPlate(ctx, W, H, t, dur, "misty_fjord.jpg", { zoom: [1.08, 1.02], dark: 0.28, scrim: 0.3 });
    fog2(ctx, W, H, t, 26, 0.06);
    vTitle(ctx, W, H, "WHAT REMAINS IS THE FILE", "THE CASE", "REMAINS OPEN", clamp(t / 1.2), 0.34);
    text(ctx, "The evidence does not settle it.", W / 2, Math.round(H * 0.62), Math.round(W * 0.045), { family: S.body, color: S.boneDim, align: "center", alpha: clamp((t - 1.6) / 0.9) });
  },
};

// ---------- title lead-in + end card ----------
function leadIn(ctx, W, H, t, key) {
  basePlate(ctx, W, H, t);
  photoPlate(ctx, W, H, t, LEAD + 4, "misty_fjord.jpg", { zoom: [1.04, 1.08], dark: 0.42, scrim: 0.2 });
  fog2(ctx, W, H, t, 30, 0.05);
  const SH = SHORTS[key];
  kicker(ctx, "THE ISDAL WOMAN — SHORT", W / 2, Math.round(H * 0.42), Math.round(W * 0.026), { align: "center" });
  const words = SH.title.split(" ");
  const mid = Math.ceil(words.length / 2);
  const l1 = words.slice(0, mid).join(" "), l2 = words.slice(mid).join(" ");
  display(ctx, l1, W / 2, Math.round(H * 0.50), Math.round(W * 0.098), clamp((t - 0.3) / 0.9), { align: "center" });
  if (l2) display(ctx, l2, W / 2, Math.round(H * 0.50 + W * 0.115), Math.round(W * 0.098), clamp((t - 0.6) / 0.9), { align: "center" });
}
function endCard(ctx, W, H, t, key) {
  basePlate(ctx, W, H, t);
  photoPlate(ctx, W, H, t, 10, "misty_fjord.jpg", { zoom: [1.06, 1.10], dark: 0.5, scrim: 0.2 });
  fog2(ctx, W, H, t, 31, 0.04);
  kicker(ctx, "THE FULL FILM", W / 2, Math.round(H * 0.44), Math.round(W * 0.026), { align: "center" });
  display(ctx, "THE ISDAL WOMAN", W / 2, Math.round(H * 0.52), Math.round(W * 0.082), clamp((t - 0.3) / 1), { align: "center" });
  rule(ctx, W / 2, Math.round(H * 0.565), Math.round(W * 0.30), clamp((t - 0.8) / 0.9));
  text(ctx, "SOURCES — POLICE RECORDS · BBC (2017) · NRK/BBC (2018)", W / 2, Math.round(H * 0.64), Math.round(W * 0.026), { family: S.mono, color: S.boneDim, align: "center", alpha: clamp((t - 1.1) / 0.8) });
  text(ctx, "THE DOCUMENTARY ENGINE", W / 2, Math.round(H * 0.70), Math.round(W * 0.024), { family: S.mono, color: S.amber, align: "center", spacing: 3, alpha: clamp((t - 1.4) / 0.8) });
}

// ---------- dispatcher ----------
let _xfS = null;
function xfadeS(W, H) {
  if (!_xfS || _xfS.W !== W || _xfS.H !== H) {
    const { createCanvas } = require("canvas");
    _xfS = { W, H, a: createCanvas(W, H), b: createCanvas(W, H) };
  }
  return _xfS;
}

const TRANS = 0.8;
export function renderShortFrame(ctx, W, H, key, t) {
  W_DYN = W;
  const TL = shortTimeline(key);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const blocks = TL.blocks;
  // segment map: lead [0,LEAD), blocks, end [endStart, total)
  let draw = null;
  if (t < LEAD) draw = (c) => leadIn(c, W, H, t, key);
  else if (t >= TL.endStart) draw = (c) => endCard(c, W, H, t - TL.endStart, key);
  else {
    let idx = 0;
    for (let i = 0; i < blocks.length; i++) { if (t >= blocks[i].start) idx = i; else break; }
    const b = blocks[idx];
    const tLoc = t - b.start;
    if (tLoc < TRANS && idx > 0) {
      const { a, b: cvsB } = xfadeS(W, H);
      const ca = a.getContext("2d"), cb = cvsB.getContext("2d");
      ca.setTransform(1, 0, 0, 1, 0, 0); ca.clearRect(0, 0, W, H);
      cb.setTransform(1, 0, 0, 1, 0, 0); cb.clearRect(0, 0, W, H);
      const pb = blocks[idx - 1];
      ART[pb.id](ca, W, H, t - pb.start, pb.dur);
      ART[b.id](cb, W, H, tLoc, b.dur);
      ctx.drawImage(a, 0, 0);
      ctx.save(); ctx.globalAlpha = ease(clamp(tLoc / TRANS)); ctx.drawImage(cvsB, 0, 0); ctx.restore();
      draw = null;
    } else {
      draw = (c) => ART[b.id](c, W, H, tLoc, b.dur);
    }
  }
  if (draw) draw(ctx);
  vignette(ctx, W, H);
  grain(ctx, W, H, t);
  chrome2(ctx, W, H, t, TL.total);
}
