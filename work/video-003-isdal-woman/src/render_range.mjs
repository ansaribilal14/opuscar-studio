// render_range.mjs — deterministic frame renderer
// usage: node render_range.mjs <firstFrame> <lastFrame> <outDir> [--fps 24] [--scale 1]
import fs from "fs";
import path from "path";
import { createCanvas } from "canvas";
import { buildTimeline } from "./timeline.js";
import { renderFrame } from "./scenes.mjs";

const [,, firstArg, lastArg, outDir] = process.argv;
const arg = (name, def) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? parseFloat(process.argv[i + 1]) : def;
};
const first = parseInt(firstArg), last = parseInt(lastArg);
const FPS = arg("--fps", 24);
const SCALE = arg("--scale", 1);

fs.mkdirSync(outDir, { recursive: true });
const tl = buildTimeline();
const W = Math.round(1280 * SCALE), H = Math.round(720 * SCALE);
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

let lastPct = -1;
for (let f = first; f <= last; f++) {
  const t = f / FPS;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  renderFrame(ctx, W, H, tl, t);
  const buf = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outDir, `f${String(f).padStart(6, "0")}.png`), buf);
  const pct = Math.floor((f - first) / Math.max(1, last - first) * 100);
  if (pct !== lastPct && pct % 5 === 0) { console.log(`worker ${process.pid}: ${pct}% (frame ${f})`); lastPct = pct; }
}
console.log(`worker ${process.pid}: DONE ${first}-${last}`);
