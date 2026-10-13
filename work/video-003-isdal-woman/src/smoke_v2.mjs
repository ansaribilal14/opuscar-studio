import fs from "fs";
import { createCanvas } from "canvas";
import { buildTimeline } from "./timeline.js";
import { renderFrame } from "./scenes2.mjs";
const tl = buildTimeline();
console.log("timeline total", tl.total.toFixed(1), "s, frames", Math.ceil(tl.total * tl.fps));
const W = 1280, H = 720;
const cv = createCanvas(W, H); const ctx = cv.getContext("2d");
fs.mkdirSync("/home/z/my-project/work/qa/smoke2", { recursive: true });
const times = [2,6,10,18,32,58,80,100,130,175,215,250,290,330,385,420,470,520,560,610,660,700,745,790,830,860,890,915,940,960,975];
for (const t of times) {
  renderFrame(ctx, W, H, tl, t);
  fs.writeFileSync("/home/z/my-project/work/qa/smoke2/t" + String(t).padStart(4, "0") + ".jpg", cv.toBuffer("image/jpeg", 88));
}
console.log("smoke frames written:", times.length);
