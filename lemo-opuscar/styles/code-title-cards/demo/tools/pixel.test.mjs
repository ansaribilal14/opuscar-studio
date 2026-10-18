// pixel.test.mjs — browser-level tests (task spec §13 F, G, H, I, J, K).
// Uses the engine's own page driver (core/render/page.mjs) and browser launcher
// (core/render/browser.mjs, honours PLAYWRIGHT_CHROME). Run from the library root:
//   node --test styles/code-title-cards/demo/tools/pixel.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { openDemo, closeServer, ROOT } from '../../../../core/render/page.mjs';
import { serve, pageURL } from '../../../../core/render/serve.mjs';
import { EXE, ARGS } from '../../../../core/render/browser.mjs';
import { chromium } from 'playwright-core';

const here = dirname(fileURLToPath(import.meta.url));
const LIB = join(here, '..', '..', '..', '..');
const DEMO = 'styles/code-title-cards/demo';

let page, browser;
const extraServers = [];
const serveOnce = async () => { const s = await serve(ROOT); extraServers.push(s.server); return s; };
test.before(async () => { ({ browser, page } = await openDemo(DEMO, { w: 1920, h: 1080 })); });
test.after(async () => { await browser?.close(); for (const s of extraServers) try { s.close(); } catch {} closeServer(); });

// ---------- G (happy path): readiness, DUR, FPS ----------
test('G: page is READY only after font+content init; contract values correct', async () => {
  const s = await page.evaluate(() => ({ ready: window.READY === true, dur: window.DUR, fps: window.FPS, ev: Array.isArray(window.EV) && window.EV.length === 0, render: typeof window.render, texts: typeof window.TEXTS }));
  assert.equal(s.ready, true);
  assert.equal(s.dur, 18.0);
  assert.equal(s.fps, 30);
  assert.equal(s.ev, true, 'EV is an empty array (silent by design)');
  assert.equal(s.render, 'function');
  assert.equal(s.texts, 'function');
  assert.equal(await page.evaluate(() => document.fonts.check('700 40px "Space Grotesk"')), true, 'local Space Grotesk loaded');
});

// ---------- H + I: same t twice (and after an intervening frame) = identical pixels ----------
test('H/I: render(2.0) twice, with an intervening render(5.0), yields identical pixel buffers', async () => {
  const grab = () => page.evaluate(() => {
    const c = document.getElementById('c');
    return c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  });
  await page.evaluate(t => window.render(t), 2.0);
  const a = Buffer.from(await grab());
  await page.evaluate(t => window.render(t), 5.0);
  await page.evaluate(t => window.render(t), 2.0);
  const c = Buffer.from(await grab());
  await page.evaluate(t => window.render(t), 2.0);
  const d = Buffer.from(await grab());
  assert.equal(a.length, 1920 * 1080 * 4);
  assert.ok(a.equals(c), 'same t after an intervening frame = identical pixels');
  assert.ok(c.equals(d), 'same t once more = identical pixels');
});

// ---------- J: out-of-order rendering on a second page (as video.mjs workers do) ----------
test('J: timestamps rendered out of order (second page) produce identical frames', async () => {
  const times = [0.25, 0.62, 2.0, 4.5, 5.9, 8.0, 9.7, 12.4, 14.8, 16.9, 17.9];
  const hashAt = (p, t) => p.evaluate(t => {
    window.render(t);
    const c = document.getElementById('c'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let h = 0x811c9dc5 | 0;
    for (let i = 0; i < d.length; i++) { h ^= d[i]; h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  }, t);
  const forward = {};
  for (const t of times) forward[t] = await hashAt(page, t);
  const page2 = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page2.goto(pageURL(ROOT, (await serveOnce()).port, DEMO));
  await page2.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  const shuffled = [...times].reverse();                       // deterministic, definitely not the forward order
  for (const t of shuffled) {
    const h = await hashAt(page2, t);
    assert.equal(h, forward[t], `t=${t} identical across pages and orders`);
  }
  await page2.close();
});

// ---------- K: TEXTS boxes + readability ----------
const bboxOfInk = () => page.evaluate(() => {
  const c = document.getElementById('c'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, W = c.width;
  let x0 = W, y0 = c.height, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (Math.abs(d[i] - 11) + Math.abs(d[i + 1] - 11) + Math.abs(d[i + 2] - 15) > 24) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1 };
});
test('K: TEXTS(t) box matches the actual ink pixels and respects safe margins', async () => {
  const t = 2.0;
  await page.evaluate(t => window.render(t), t);
  const box = (await page.evaluate(t => window.TEXTS(t), t))[0];
  assert.equal(box.text, 'Every frame is code');
  assert.equal(box.id, 'line-0');
  assert.ok(box.x0 >= 144 - 2 && box.x1 <= 1920 - 144 + 2, `x within safe margins: ${box.x0}..${box.x1}`);
  assert.ok(box.y0 >= 144 - 2 && box.y1 <= 1080 - 144 + 2, `y within safe margins: ${box.y0}..${box.y1}`);
  const ink = await bboxOfInk();
  assert.ok(ink, 'frame has ink');
  assert.ok(ink.x0 >= box.x0 - 3 && ink.x1 <= box.x1 + 3 && ink.y0 >= box.y0 - 3 && ink.y1 <= box.y1 + 3, `measured ink ${JSON.stringify(ink)} inside reported box ${JSON.stringify(box)} (+3px AA)`);
  await page.evaluate(() => window.render(18.0));
  assert.deepEqual(await page.evaluate(() => window.TEXTS(18.0)), [], 'no text after the last card');
});
test('K: the engine readcheck passes end-to-end', () => {
  const out = execFileSync('node', ['core/render/readcheck.mjs', DEMO], { cwd: LIB, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  assert.match(out, /OK/, 'readcheck reports OK per text');
});

// ---------- F (pixel half): full render respects margins at every card ----------
test('F: ink stays inside the safe area on every card mid-hold', async () => {
  for (const t of [2.0, 6.0, 9.5, 12.9, 16.5]) {
    await page.evaluate(t => window.render(t), t);
    const box = (await page.evaluate(t => window.TEXTS(t), t))[0];
    const ink = await bboxOfInk();
    assert.ok(ink.x0 >= 144 - 3 && ink.x1 <= 1920 - 144 + 3 && ink.y0 >= 144 - 3 && ink.y1 <= 1080 - 144 + 3, `t=${t}: ink ${JSON.stringify(ink)} within margins`);
    assert.ok(ink.x0 >= box.x0 - 3 && ink.y0 >= box.y0 - 3, `t=${t}: ink starts inside the reported box`);
  }
});

// ---------- G (failure path): a bad font file fails READY explicitly ----------
test('G: font-load failure is explicit, actionable, and never sets READY', async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ARGS });
  try {
    const p = await b.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
    const errPromise = new Promise(res => p.on('pageerror', e => res(String(e.message))));
    const port = (await serveOnce()).port;
    await p.goto(pageURL(ROOT, port, DEMO) + '?' + new URLSearchParams({ fontfile: 'fonts/definitely-missing.woff2' }).toString());
    const msg = await Promise.race([errPromise, new Promise(r => setTimeout(() => r('NO PAGE ERROR WITHIN 20s'), 20000))]);
    assert.match(msg, /failed to load from fonts\/definitely-missing\.woff2/i);
    assert.equal(await p.evaluate(() => window.READY === true), false, 'READY stays false on failure');
  } finally {
    await b.close();
  }
});
