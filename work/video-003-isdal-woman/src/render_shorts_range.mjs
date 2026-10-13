// render_shorts_range.mjs — vertical short frame renderer
// usage: node render_shorts_range.mjs <shortKey A|B|C|D> <first> <last> <outDir>
import fs from "fs";
import path from "path";
import { createCanvas } from "canvas";
import { renderShortFrame, shortTimeline } from "./shorts.mjs";

const [,, key, firstArg, lastArg, outDir] = process.argv;
const first = parseInt(firstArg), last = parseInt(lastArg);
const FPS = 24;
fs.mkdirSync(outDir, { recursive: true });
const TL = shortTimeline(key);
const W = 720, H = 1280;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");
for (let f = first; f <= last; f++) {
  const t = f / FPS;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  renderShortFrame(ctx, key, t);
  fs.writeFileSync(path.join(outDir, `f${String(f).padStart(6, "0")}.png`), canvas.toBuffer("image/png"));
}
console.log(`short ${key} worker ${process.pid}: DONE ${first}-${last}`);
