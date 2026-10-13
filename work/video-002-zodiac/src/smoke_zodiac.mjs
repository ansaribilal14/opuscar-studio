// smoke_zodiac.mjs — render 1 frame per block at small scale into a contact sheet
import { createCanvas } from "canvas";
import fs from "fs";
import { buildTimeline } from "./timeline.js";
import { renderFrame } from "./scenes_zodiac.mjs";

const tl = buildTimeline();
const W = 480, H = 270;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");
const times = tl.blocks.map(b => b.start + Math.min(b.dur * 0.55, 4.5));
fs.mkdirSync("build/smoke", { recursive: true });
for (let i = 0; i < tl.blocks.length; i++) {
  renderFrame(ctx, W, H, tl, times[i]);
  fs.writeFileSync(`build/smoke/f_${String(i).padStart(2, "0")}_${tl.blocks[i].id}.png`, canvas.toBuffer("image/png"));
}
// contact sheets: 6 cols x N rows
const { loadImage } = await import("canvas");
const cols = 6, cellW = 480, cellH = 270, label = 26;
const per = 12;
for (let s = 0; s * per < times.length; s++) {
  const chunk = tl.blocks.slice(s * per, (s + 1) * per);
  const rows = Math.ceil(chunk.length / cols);
  const sheet = createCanvas(cols * cellW, rows * (cellH + label));
  const sc = sheet.getContext("2d");
  sc.fillStyle = "#000"; sc.fillRect(0, 0, sheet.width, sheet.height);
  for (let i = 0; i < chunk.length; i++) {
    const b = chunk[i];
    const img = fs.readFileSync(`build/smoke/f_${String(s * per + i).padStart(2, "0")}_${b.id}.png`);
    sc.drawImage(await loadImage(img), (i % cols) * cellW, Math.floor(i / cols) * (cellH + label));
    sc.fillStyle = "#0f0";
    sc.font = "16px monospace";
    sc.fillText(`${s * per + i} ${b.id}`, (i % cols) * cellW + 6, Math.floor(i / cols) * (cellH + label) + cellH + 18);
  }
  fs.writeFileSync(`build/smoke/sheet_${s}.png`, sheet.toBuffer("image/png"));
}
console.log("smoke frames:", times.length, "-> build/smoke/sheet_*.png");
