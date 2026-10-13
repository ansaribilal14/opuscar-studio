import fs from "fs";
import { createCanvas } from "canvas";
import { renderShortFrame, shortTimeline } from "./shorts.mjs";
const W = 540, H = 960;
const cv = createCanvas(W, H); const ctx = cv.getContext("2d");
fs.mkdirSync("/home/z/my-project/work/qa/smoke_short", { recursive: true });
for (const K of ["A","B","C","D"]) {
  const tl = shortTimeline(K);
  const times = [1.0, tl.blocks[0].start + 1.5, tl.blocks[Math.min(1,tl.blocks.length-1)].start + 1.5, tl.blocks[tl.blocks.length-1].start + 2, tl.endStart + 2];
  for (const t of times) {
    renderShortFrame(ctx, W, H, K, t);
    fs.writeFileSync(`/home/z/my-project/work/qa/smoke_short/${K}_${t.toFixed(1)}.jpg`, cv.toBuffer("image/jpeg", 85));
  }
  console.log(K, "total", tl.total.toFixed(1), "s");
}
console.log("done");
