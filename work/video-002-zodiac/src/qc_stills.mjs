// qc_stills.mjs — visual editorial QC contact sheets (directive §9)
// Renders representative frames from the deterministic timeline:
//   - first 15s sampled densely (hook review)
//   - every block start + mid-block (scene boundary + composition review)
//   - final minute (resolution review)
// Usage: node src/qc_stills.mjs [scale] [outdir]
//   scale: 0.5 => 960x540 stills (default), 1 => 1920x1080
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import { buildTimeline } from "./timeline.js";
import { renderFrame } from "./scenes_zodiac.mjs";

const SCALE = parseFloat(process.argv[2] || "0.5");
const OUT = process.argv[3] || "build/qc";
const tl = buildTimeline();
const W = Math.round(1920 * SCALE), H = Math.round(1080 * SCALE);
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

fs.mkdirSync(`${OUT}/frames`, { recursive: true });

const shots = [];
// 1. hook window: 0..15s dense (every 1.5s)
for (let t = 0; t <= 15; t += 1.5) shots.push({ t, tag: `hook_${t.toFixed(1).replace(".", "_")}s` });
// 2. per block: start+0.35s (boundary) and mid (composition)
for (const b of tl.blocks) {
  shots.push({ t: b.start + 0.35, tag: `b_${b.id}_in` });
  shots.push({ t: b.start + Math.min(b.dur * 0.62, b.dur - 0.2), tag: `b_${b.id}_mid` });
}
// 3. final minute
const T = tl.total;
for (let t = T - 60; t < T - 1; t += 12) shots.push({ t, tag: `end_${Math.round(t)}s` });
// dedupe + sort
shots.sort((a, b) => a.t - b.t);

for (const s of shots) {
  renderFrame(ctx, W, H, tl, Math.max(0, Math.min(s.t, T - 0.05)));
  fs.writeFileSync(`${OUT}/frames/${String(Math.round(s.t * 10)).padStart(6, "0")}_${s.tag}.png`, canvas.toBuffer("image/png"));
}

// contact sheets: 5 cols x 3 rows per sheet, labeled
const cols = 5, rows = 3, per = cols * rows;
const cellW = W, cellH = H, label = Math.round(30 * SCALE);
const files = fs.readdirSync(`${OUT}/frames`).sort();
for (let s = 0; s * per < files.length; s++) {
  const chunk = files.slice(s * per, (s + 1) * per);
  const sheet = createCanvas(cols * cellW, rows * (cellH + label));
  const sc = sheet.getContext("2d");
  sc.fillStyle = "#000"; sc.fillRect(0, 0, sheet.width, sheet.height);
  for (let i = 0; i < chunk.length; i++) {
    const img = await loadImage(`${OUT}/frames/${chunk[i]}`);
    const cx = (i % cols) * cellW, cy = Math.floor(i / cols) * (cellH + label);
    sc.drawImage(img, cx, cy);
    sc.fillStyle = "#0f0"; sc.font = `${Math.round(20 * SCALE)}px monospace`;
    sc.fillText(chunk[i].replace(/^\d+_/, "").replace(".png", ""), cx + 8, cy + cellH + Math.round(20 * SCALE));
  }
  fs.writeFileSync(`${OUT}/sheet_${String(s).padStart(2, "0")}.png`, sheet.toBuffer("image/png"));
}
console.log(`QC stills: ${files.length} frames -> ${OUT}/ (sheets: ${Math.ceil(files.length / per)})`);
