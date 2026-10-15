// timeline.js — deterministic timeline: narration durations + pauses -> block windows
// Consumed by scenes/render_range/mix. Regenerate any time; audio layout must match mix.py.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const FPS = 24;
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "src/narration.json"), "utf8"));
const durations = JSON.parse(fs.readFileSync(path.join(ROOT, "audio/durations.json"), "utf8"));

// pause AFTER a block (seconds) — editorial rhythm
function pauseAfter(block, next) {
  if (!block.text) return 0;                 // title/end cards carry their own dwell
  if (!next) return 0;
  if (!next.text) return 1.2;                // into title / end card
  if (block.beat !== next.beat) return 2.6;  // section break
  return 1.5;                                // normal breath
}
const CARD_DWELL = { b1e: 6.5, b6f: 9.5 };   // silent cards

export function buildTimeline() {
  let t = 3.2; // cold-open music lead-in
  const blocks = [];
  for (let i = 0; i < data.blocks.length; i++) {
    const b = data.blocks[i];
    const next = data.blocks[i + 1];
    let dur;
    if (!b.text) { dur = CARD_DWELL[b.id] || 5.0; }
    else {
      const d = durations[b.id];
      if (!d) throw new Error(`missing duration for ${b.id} — is TTS generation complete?`);
      dur = d + 0.55; // tail pad
    }
    const start = t;
    blocks.push({ ...b, start, dur, end: start + dur });
    t = start + dur + pauseAfter(b, next);
  }
  const total = t + 2.2; // music outro
  return { fps: FPS, total, blocks };
}

export function blockAt(t) {
  const tl = buildTimeline();
  for (const b of tl.blocks) if (t >= b.start && t < b.end) return b;
  return null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const tl = buildTimeline();
  console.log(`TOTAL: ${tl.total.toFixed(1)}s = ${(tl.total / 60).toFixed(2)} min @ ${tl.fps}fps → ${Math.ceil(tl.total * tl.fps)} frames`);
  for (const b of tl.blocks) {
    console.log(`${b.id.padEnd(6)} beat${b.beat} ${b.start.toFixed(1).padStart(7)}s → ${(b.start + b.dur).toFixed(1).padStart(7)}s  (${b.dur.toFixed(1)}s) ${b.visual}`);
  }
}
