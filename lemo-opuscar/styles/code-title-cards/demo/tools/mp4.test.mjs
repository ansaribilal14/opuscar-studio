// mp4.test.mjs — final-artifact gates (task spec §13 L + §11): ffprobe facts, full
// decode with zero errors, representative frame extraction, first-frame ground check.
// Run from the library root AFTER the full render:
//   node --test styles/code-title-cards/demo/tools/mp4.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, rmSync, mkdirSync, statSync } from 'fs';

const here = dirname(fileURLToPath(import.meta.url));
const LIB = join(here, '..', '..', '..', '..');
const MP4 = join(LIB, 'styles/code-title-cards/demo/out/title-cards.mp4');

test('L: the MP4 exists and is nonempty', () => {
  assert.equal(existsSync(MP4), true, `missing ${MP4} — render it first (see DEMO.md)`);
  assert.ok(statSync(MP4).size > 10_000, 'file is suspiciously small');
});

test('L: ffprobe — 1920x1080, 30 fps, H.264, yuv420p, one video stream, no audio', () => {
  const j = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', MP4], { encoding: 'utf8' }));
  const v = j.streams.filter(s => s.codec_type === 'video');
  const a = j.streams.filter(s => s.codec_type === 'audio');
  assert.equal(v.length, 1, 'exactly one video stream');
  assert.equal(a.length, 0, 'no audio stream (silent by design)');
  assert.equal(v[0].codec_name, 'h264');
  assert.equal(v[0].width, 1920);
  assert.equal(v[0].height, 1080);
  assert.equal(v[0].pix_fmt, 'yuv420p');
  assert.equal(v[0].r_frame_rate, '30/1');
  assert.equal(+v[0].nb_frames, 540, '540 frames = 18.0 s at 30 fps');
  assert.ok(Math.abs(+j.format.duration - 18.0) < 0.05, `duration ~18.0 s (got ${j.format.duration})`);
});

test('L: the complete file decodes with zero errors', async () => {
  const res = await new Promise((res, rej) => {
    const p = spawn('ffmpeg', ['-nostdin', '-v', 'error', '-i', MP4, '-f', 'null', '-'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    p.stderr.on('data', d => { err += d; });
    p.on('close', code => res({ code, err }));
    p.on('error', rej);
  });
  assert.equal(res.code, 0, `decode exit ${res.code}`);
  assert.equal(res.err, '', `decoder reported errors:\n${res.err}`);
});

test('L: representative frames extract cleanly (first, mids, transitions, final)', async () => {
  const outDir = join(LIB, 'styles/code-title-cards/demo/out/qa-frames');
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const times = { first_in: 0.25, first_hold: 2.0, cut_1_2: 3.95, mid_2: 6.0, mid_3: 9.5, cut_3_4: 11.1, mid_4: 12.9, last_in: 15.0, final: 17.8 };
  for (const [name, t] of Object.entries(times)) {
    const f = join(outDir, `${name}_t${t}.png`);
    execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-ss', String(t), '-i', MP4, '-frames:v', '1', '-y', f], { stdio: 'ignore' });
    assert.ok(existsSync(f) && statSync(f).size > 1000, `frame ${name} extracted`);
  }
  // the very first encoded frame is the ground colour by design (card 1 starts at opacity 0):
  // decode it to 64x36 raw gray and require the mean luma to be near the #0b0b0f ground (~13)
  const mean = await new Promise((res, rej) => {
    const p = spawn('ffmpeg', ['-nostdin', '-v', 'error', '-i', MP4, '-frames:v', '1', '-vf', 'scale=64:36', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks = [];
    p.stdout.on('data', d => chunks.push(d));
    p.on('close', code => {
      if (code !== 0) return rej(new Error('rawvideo decode failed'));
      const buf = Buffer.concat(chunks);
      let s = 0; for (const b of buf) s += b;
      res(s / buf.length);
    });
    p.on('error', rej);
  });
  assert.ok(mean < 25, `first frame is the dark ground (mean luma ${mean.toFixed(1)} < 25)`);
});
