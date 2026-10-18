// probe_stills.mjs — render single frames as JPEGs for visual inspection.
// usage: node src/probe_stills.mjs out_dir t1 t2 ...
import pkg_canvas from "canvas";
const { createCanvas, loadImage, registerFont } = pkg_canvas;
import fs from "node:fs";
import path from "node:path";
import { buildTimeline, cueAt, W, H, ASSETS } from "./timeline.js";
import { caption } from "./support.mjs";
import * as A from "./scenes_a.mjs";
import * as B from "./scenes_b.mjs";
import * as C from "./scenes_c.mjs";

const SCENES = {
  SC01: A.SC01, SC02: A.SC02, SC03: A.SC03, SC04: A.SC04, SC05: A.SC05, SC06: A.SC06,
  SC07: A.SC07, SC08: A.SC08, SC09: A.SC09, SC10: A.SC10, SC11: A.SC11, SC12: A.SC12,
  SC13: B.SC13, SC14: B.SC14, SC15: B.SC15, SC16: B.SC16, SC17: B.SC17, SC18: B.SC18,
  SC19: B.SC19, SC20: B.SC20, SC21: B.SC21, SC22: B.SC22, SC23: B.SC23, SC24: B.SC24,
  SC25: C.SC25, SC26: C.SC26, SC27: C.SC27, SC28: C.SC28, SC29: C.SC29, SC30: C.SC30,
  SC31: C.SC31, SC32: C.SC32, SC33: C.SC33, SC34: C.SC34,
};
const FONTFILES = [
  ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "DejaVu Sans", "normal"],
  ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "DejaVu Sans", "bold"],
  ["/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", "DejaVu Sans Mono", "normal"],
  ["/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", "DejaVu Sans Mono", "bold"],
  ["/usr/share/fonts/truetype/english/Carlito-Regular.ttf", "Carlito", "normal"],
  ["/usr/share/fonts/truetype/english/Carlito-Bold.ttf", "Carlito", "bold"],
];
for (const [p, fam, weight] of FONTFILES)
  if (fs.existsSync(p)) { registerFont(p, { family: fam, weight }); }

const outDir = process.argv[2];
fs.mkdirSync(outDir, { recursive: true });
const tl = buildTimeline();
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d", { alpha: false });
const imgs = {};
for (const [k, p] of Object.entries(ASSETS)) {
  try { imgs[k] = await loadImage(p); } catch (e) { console.error(`asset ${k}: ${e.message}`); }
}
for (const a of process.argv.slice(3)) {
  const t = +a;
  const win = tl.scenes.find((s) => t >= s.start && t < s.end) || tl.scenes[tl.scenes.length - 1];
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  SCENES[win.id](ctx, W, H, t, win, imgs);
  const cue = cueAt(t);
  if (cue) caption(ctx, W, H, cue);
  const f = Math.round(t * tl.fps);
  fs.writeFileSync(path.join(outDir, `f${String(f).padStart(5, "0")}_${win.id}.jpg`),
    canvas.toBuffer("image/jpeg", { quality: 0.9 }));
  console.log(`${win.id} @ t=${t}`);
}
