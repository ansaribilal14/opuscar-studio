// render_encode_shorts.mjs — vertical shorts, streaming encode (1080×1920)
// usage: node render_encode_shorts.mjs <A|B|C|D> <outMp4> [--crf 20]
import { createCanvas } from "canvas";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { shortTimeline, renderShortFrame } from "./shorts.mjs";

const [,, key, outArg] = process.argv;
const arg = (name, def) => { const i = process.argv.indexOf(name); return i > -1 ? parseFloat(process.argv[i + 1]) : def; };
const FPS = 24, W = 1080, H = 1920, CRF = arg("--crf", 20);

fs.mkdirSync(path.dirname(path.resolve(outArg)), { recursive: true });
const TL = shortTimeline(key);
const totalFrames = Math.ceil(TL.total * FPS);
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

const ff = spawn("ffmpeg", [
  "-y",
  "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-c:v", "libx264", "-preset", "medium", "-crf", String(CRF),
  -1, "-pix_fmt", "yuv420p", "-profile:v", "high",
  "-movflags", "+faststart", outArg,
].filter(a => a !== -1), { stdio: ["pipe", "ignore", "pipe"] });

let errTail = "";
ff.stderr.on("data", d => { errTail = (errTail + d).slice(-1200); });

const t0 = Date.now();
for (let f = 0; f < totalFrames; f++) {
  renderShortFrame(ctx, W, H, key, f / FPS);
  const buf = canvas.toBuffer("image/jpeg", 93);
  if (!ff.stdin.write(buf)) await new Promise(res => ff.stdin.once("drain", res));
  if (f % 120 === 0) console.log(`short ${key}: ${f}/${totalFrames}`);
}
ff.stdin.end();
const code = await new Promise(res => ff.on("close", res));
if (code !== 0) { console.error(`ffmpeg exit ${code}\n${errTail}`); process.exit(1); }
console.log(`short ${key}: DONE ${totalFrames} frames -> ${outArg}`);
