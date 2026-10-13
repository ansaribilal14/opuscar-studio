import fs from "fs";
import { createCanvas } from "canvas";
import { buildTimeline } from "./timeline.js";
import { renderFrame } from "./scenes2.mjs";
const tl = buildTimeline();
const W = 1280, H = 720;
const cv = createCanvas(W, H); const ctx = cv.getContext("2d");
fs.mkdirSync("/home/z/my-project/work/qa/smoke3", { recursive: true });
// mid-late points inside each uninspected window + crossfade checks
const times = [68, 70.5, 150, 158, 230, 245, 260, 270, 282, 286, 350, 362, 478, 483, 528, 636, 770, 978, 983, 212.5, 249.5, 469.8];
for (const t of times) {
  renderFrame(ctx, W, H, tl, t);
  fs.writeFileSync("/home/z/my-project/work/qa/smoke3/t" + String(t).padStart(6, "1") + ".jpg", cv.toBuffer("image/jpeg", 88));
}
console.log("done", times.length);
