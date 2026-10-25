// probe_error.mjs — load a composition in Chrome and capture the full page error stack
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const file = process.argv[2] || "segments/segment_00.html";
// find cached chrome
const cacheDir = "/home/z/.cache/puppeteer";
let bin = null;
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === "chrome" && e.stats?.isFile?.() !== false) { if (p.includes("chrome-linux") || p.includes("chrome-headless")) { bin = p; return; } }
  }
}
walk(cacheDir);
if (!bin) { console.error("no chrome in cache"); process.exit(1); }
console.log("chrome:", bin);

const browser = await puppeteer.launch({ executablePath: bin, headless: "shell", args: ["--no-sandbox", "--disable-gpu"] });
const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE:", m.text()); });
page.on("pageerror", (e) => { console.log("PAGEERROR STACK:\n" + (e.stack || e.message)); });
await page.goto("file://" + path.resolve(file), { waitUntil: "networkidle0", timeout: 30000 });
await new Promise((r) => setTimeout(r, 2500));
// force the timeline seek like hyperframes does
const res = await page.evaluate(() => {
  try {
    const tl = window.__timelines && window.__timelines.main;
    if (!tl) return "NO __timelines.main";
    tl.seek(0.5); tl.seek(1.5); tl.seek(0);
    return "SEEK OK, duration=" + tl.duration();
  } catch (e) { return "SEEK FAIL: " + (e.stack || e.message); }
});
console.log(res);
await browser.close();
