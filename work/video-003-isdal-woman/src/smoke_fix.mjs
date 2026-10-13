import { createCanvas } from "canvas";
import { renderFrame } from "./scenes2.mjs";
import { buildTimeline } from "./timeline.js";
import { writeFileSync } from "fs";
const W=1920,H=1080;
const tl = buildTimeline();
for (const [label,gt] of [["funeral",898.5],["grave",930.5],["grave_late",940]]) {
  const c=createCanvas(W,H), ctx=c.getContext("2d");
  renderFrame(ctx, W, H, tl, gt);
  writeFileSync(`/home/z/my-project/work/qa/fix_${label}.jpg`, c.toBuffer("image/jpeg",{quality:90}));
  console.log(label,"ok");
}
