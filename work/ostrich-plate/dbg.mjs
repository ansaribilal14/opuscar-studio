// dbg_ostrich.mjs — capture the full error stack from makeFilm
import { chromium } from '/home/z/my-project/lemo-opuscar/node_modules/playwright-core/index.mjs';
import { serve, pageURL } from '/home/z/my-project/lemo-opuscar/core/render/serve.mjs';
const ROOT = '/home/z/my-project/lemo-opuscar';
const { server, port } = await new Promise(res => { const s = serve(ROOT); s.then ? s.then(res) : res(s); });
const url = pageURL(ROOT, port, '/home/z/my-project/work/ostrich-plate');
console.log('url', url);
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', e => console.log('PAGEERROR:', e.message, '\n', e.stack));
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('CONSOLE', m.type(), m.text().slice(0, 500)); });
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('goto', e.message));
await page.waitForTimeout(2500);
const st = await page.evaluate(() => ({ ready: window.READY === true, dur: window.DUR || 0 }));
console.log('state', st);
if (!st.ready) {
  const err = await page.evaluate(async () => {
    try {
      const C = await (await fetch('content.json')).json();
      const { makeFilm } = await import('./film.js');
      makeFilm(C, {});
      return 'makeFilm OK';
    } catch (e) { return e.stack || e.message; }
  });
  console.log('makeFilm:', String(err).slice(0, 3000));
}
await browser.close(); server.close();
