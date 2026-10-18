// render_encode.mjs — deterministic frame renderer (node-canvas), JPEG streamed to
// ffmpeg stdin. Same provider class as the studio's production canvas engine
// (VIDEO_ENGINE_ARCHITECTURE.md §canvas — used by every delivered film).
// usage: node src/render_encode.mjs <first> <last> <out.mp4> [--fps 30] [--w 1920] [--h 1080] [--crf 20]
import pkg_canvas from "canvas";
const { createCanvas, loadImage, registerFont } = pkg_canvas;
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { buildTimeline, cueAt, W as TW, H as TH, ASSETS } from "./timeline.js";
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

const args = process.argv.slice(2);
const first = +args[0], last = +args[1], out = args[2];
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? +args[i + 1] : d; };
const fps = opt("fps", 30), W = opt("w", TW), H = opt("h", TH), crf = opt("crf", 20);

const tl = buildTimeline();
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d", { alpha: false });

const imgs = {};
for (const [k, p] of Object.entries(ASSETS)) {
  try { imgs[k] = await loadImage(p); }
  catch (e) { console.error(`asset ${k} failed to load: ${e.message}`); }
}

fs.mkdirSync(path.dirname(out), { recursive: true });
const ffv = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
if (ffv.error) { console.error("ffmpeg not found"); process.exit(1); }
const proc = spawn("ffmpeg",
  ["-nostdin", "-y", "-f", "image2pipe", "-vcodec", "mjpeg", "-framerate", String(fps),
   "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", String(crf),
   "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
  { stdio: ["pipe", "inherit", "inherit"] });

function renderFrame(t) {
  const win = tl.scenes.find((s) => t >= s.start && t < s.end) || tl.scenes[tl.scenes.length - 1];
  const fn = SCENES[win.id] || SCENES.SC01;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  fn(ctx, W, H, t, win, imgs);
  const cue = cueAt(t);
  if (cue) caption(ctx, W, H, cue);
}

const t0 = Date.now();
for (let f = first; f <= last; f++) {
  renderFrame(f / fps);
  const buf = canvas.toBuffer("image/jpeg", { quality: 0.93, chromaSubsampling: false });
  if (!proc.stdin.write(buf)) {
    await new Promise((r) => proc.stdin.once("drain", r));
  }
  if ((f - first) % 300 === 0 && f > first) {
    const el = (Date.now() - t0) / 1000;
    console.log(`frame ${f}/${last} (${((f - first) / el).toFixed(1)} fps)`);
  }
}
proc.stdin.end();
await new Promise((r) => proc.on("close", (c) => { if (c !== 0) process.exit(c); }));
console.log(`rendered frames ${first}..${last} -> ${out}`);
