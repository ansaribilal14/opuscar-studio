// timeline.js — canonical timeline for the Opuscar implementation.
// Single source of truth: the frozen ../TIMELINE.json + shared SRT + block audio.
// Deterministic: pure function of committed data files.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILM = path.resolve(HERE, "../../..");       // engines/opuscar/src -> wow-signal/
const RAW = JSON.parse(fs.readFileSync(path.join(FILM, "TIMELINE.json"), "utf8"));

export const FPS = RAW.render_spec.fps;            // 30
export const W = RAW.render_spec.width;            // 1920
export const H = RAW.render_spec.height;           // 1080
export const TOTAL = RAW.render_spec.duration;     // 600.0
export const FRAMES = Math.round(TOTAL * FPS);     // 18000

// narration blocks: {id,start,end,text,scene,segment}
export const blocks = Object.entries(RAW.blocks)
  .map(([id, b]) => ({ id, ...b }))
  .sort((a, b) => a.start - b.start);

// scene windows (continuous coverage, quantized to frames in the freeze step)
export const scenes = Object.entries(RAW.scenes)
  .map(([id, s]) => ({ id, start: s.start, end: s.end }))
  .sort((a, b) => a.start - b.start);

export function sceneAt(t) {
  for (const s of scenes) if (t >= s.start && t < s.end) return s.id;
  return scenes[scenes.length - 1].id;
}

export function blockAt(t) {
  for (const b of blocks) if (t >= b.start && t < b.end) return b;
  return null;
}

// shared caption cues (word-timed SRT -> burned captions)
function parseSrt(p) {
  const txt = fs.readFileSync(p, "utf8");
  const cues = [];
  const chunks = txt.trim().split(/\n\n+/);
  for (const c of chunks) {
    const lines = c.split("\n");
    if (lines.length < 2) continue;
    const m = lines[1].match(/(\d+):(\d+):(\d+),(\d+)\s*-->\s*(\d+):(\d+):(\d+),(\d+)/);
    if (!m) continue;
    const s = +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
    const e = +m[5] * 3600 + +m[6] * 60 + +m[7] + +m[8] / 1000;
    cues.push({ start: s, end: e, text: lines.slice(2).join("\n") });
  }
  return cues;
}
export const cues = parseSrt(path.join(FILM, "shared/subtitles/wow-signal.srt"));
export function cueAt(t) {
  for (const c of cues) if (t >= c.start && t < c.end) return c.text;
  return null;
}

export function buildTimeline() {
  return { fps: FPS, w: W, h: H, total: TOTAL, frames: FRAMES,
           blocks, scenes, cues };
}

export const FILM_ROOT = FILM;
export const ASSETS = {
  printout_close: path.join(FILM, "shared/assets/printout_close.jpg"),
  printout_page: path.join(FILM, "shared/assets/printout_page.jpg"),
};
