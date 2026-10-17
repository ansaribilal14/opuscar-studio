// smoke_ostrich.mjs — load the ostrich film in the headless browser and dump stills at key times
import { openDemo, closeServer } from '/home/z/my-project/lemo-opuscar/core/render/page.mjs';
import fs from 'fs';
const dir = '/home/z/my-project/work/ostrich-plate';
const OUT = '/home/z/my-project/work/ostrich-plate/out';
fs.mkdirSync(OUT, { recursive: true });
const times = (process.argv[2] || '1.5,3.5,5,7.5,10.5,13,15.5,18,21,24,27,31,35,40,45,50').split(',').map(Number);
const { browser, page } = await openDemo(dir, { w: 1920, h: 1080, q: 'nosub=1' });
const DUR = await page.evaluate(() => window.DUR);
console.log('DUR =', DUR);
for (const t of times) {
  if (t > DUR) continue;
  await page.evaluate(t => window.render(t), t);
  const buf = await page.screenshot({ type: 'jpeg', quality: 90 });
  fs.writeFileSync(`${OUT}/smoke_${String(t).padStart(5, '0').replace('.', '_')}.jpg`, buf);
  console.log('wrote', t);
}
await browser.close(); await closeServer();
console.log('SMOKE OK');
