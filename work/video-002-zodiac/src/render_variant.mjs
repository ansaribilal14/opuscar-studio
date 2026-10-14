// render_variant.mjs — render the proof-benchmark window for one variant (directive §10)
// usage: node src/render_variant.mjs <variant: base|A|B|C> <firstFrame> <lastFrame> <outMp4> [--fps 24] [--w 1920] [--h 1080] [--crf 18]
import { createCanvas } from "canvas";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { buildTimeline } from "./timeline.js";
import { renderFrameVariant } from "./dispatch_variant.mjs";

const [,, variant, firstArg, lastArg, outArg] = process.argv;
const arg = (name, def) => { const i = process.argv.indexOf(name); return i > -1 ? parseFloat(process.argv[i + 1]) : def; };
const first = parseInt(firstArg), last = parseInt(lastArg), out = outArg;
const FPS = arg("--fps", 24), W = arg("--w", 1920), H = arg("--h", 1080), CRF = arg("--crf", 18);

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
const tl = buildTimeline();
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

const ff = spawn("ffmpeg", [
  "-y",
  "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-c:v", "libx264", "-preset", "medium", "-crf", String(CRF),
  "-pix_fmt", "yuv420p", "-profile:v", "high",
  "-movflags", "+faststart", out,
], { stdio: ["pipe", "ignore", "pipe"] });

let errTail = "";
ff.stderr.on("data", d => { errTail = (errTail + d).slice(-1200); });

const t0 = Date.now();
for (let f = first; f <= last; f++) {
  const t = f / FPS;
  renderFrameVariant(ctx, W, H, tl, t, variant);
  const buf = canvas.toBuffer("image/jpeg", 93);
  if (!ff.stdin.write(buf)) await new Promise(res => ff.stdin.once("drain", res));
  if ((f - first) % 240 === 0) {
    const el = (Date.now() - t0) / 1000, done = f - first + 1;
    console.log(`${variant}: ${done}/${last - first + 1} frames, ${el.toFixed(0)}s, ${(done / el).toFixed(1)} f/s`);
  }
}
ff.stdin.end();
const code = await new Promise(res => ff.on("close", res));
if (code !== 0) { console.error(`ffmpeg exit ${code}\n${errTail}`); process.exit(1); }
console.log(`DONE ${variant} ${first}-${last} -> ${out}`);
