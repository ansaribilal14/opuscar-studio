import fs from "fs";
import { createCanvas } from "canvas";
import { buildTimeline } from "./timeline.js";
import { renderFrame } from "./scenes2.mjs";
const tl = buildTimeline();
const W = 1280, H = 720;
const cv = createCanvas(W, H); const ctx = cv.getContext("2d");
const times = [490, 500, 510, 540, 560, 580, 600, 605];
for (const t of times) {
  renderFrame(ctx, W, H, tl, t);
  fs.writeFileSync("/tmp/flag_" + t + ".jpg", cv.toBuffer("image/jpeg", 88));
}
console.log("ok");
