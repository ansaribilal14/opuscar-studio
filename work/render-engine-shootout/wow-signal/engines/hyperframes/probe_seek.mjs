// probe_seek.mjs — seek timeline & inspect element states at given times
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const file = process.argv[2];
const times = (process.argv[3] || "2,17,24,28").split(",").map(Number);
const bin = "/home/z/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome";
const browser = await puppeteer.launch({ executablePath: bin, headless: "shell", args: ["--no-sandbox", "--disable-gpu"] });
const page = await browser.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
await page.goto("file://" + path.resolve(file), { waitUntil: "networkidle0", timeout: 30000 });
await new Promise((r) => setTimeout(r, 1200));
for (const t of times) {
  const res = await page.evaluate((tt) => {
    const tl = window.__timelines && window.__timelines.main;
    tl.seek(tt);
    const q = (s) => {
      const el = document.querySelector(s);
      if (!el) return "MISSING";
      const cs = getComputedStyle(el);
      return `op=${(+cs.opacity).toFixed(2)} vis=${cs.visibility} disp=${cs.display}`;
    };
    const sc01 = document.querySelector("#SC01");
    const sc02 = document.querySelector("#SC02");
    const cap = document.querySelectorAll(".cap");
    let activeCap = "none";
    cap.forEach((c) => {
      const st = +c.dataset.start, du = +c.dataset.duration;
      if (tt >= st && tt < st + du && getComputedStyle(c).display !== "none") activeCap = c.textContent.slice(0, 40);
    });
    return {
      seeked: tt,
      SC01: q("#SC01"), SC02: q("#SC02"),
      sc01Start: sc01?.dataset.start, sc01Dur: sc01?.dataset.duration,
      pc0: q(".pc"),
      activeCap,
      tlTime: tl.time(),
    };
  }, t);
  console.log(JSON.stringify(res));
}
console.log("pageerrors:", errs.slice(0, 5));
await browser.close();
