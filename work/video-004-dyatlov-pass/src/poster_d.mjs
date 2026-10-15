// poster_d.mjs — dedicated 1280x720 thumbnail per operator brief (task-7-main.md §1):
// tent focal point, mountain behind it, small crimson evidence marker, text
// "WHY DID THEY LEAVE?" — no graphic imagery; labelled stylized composition
// (NOT presented as a 1959 photograph).
import { createCanvas } from "canvas";
import fs from "fs";
import { PAL as S, grain, vignette } from "./film_look.mjs";
import { clamp, ease, text, font, textW, RNG } from "./engine.mjs";
import { terrainPlate, mark, snow } from "./terrain_d.mjs";
import { inkTent } from "./scenes_d1.mjs";

const W = 1280, H = 720;
const cv = createCanvas(W, H);
const ctx = cv.getContext("2d");

// 1) the mountain (real SRTM relief of the actual slope), cold dusk grade
terrainPlate(ctx, W, H, 3.0, 6.0, "camp", {
  seed: "thumb", night: 0.30, scrim: 0.10, topScrim: 0.10,
  move: { zoom: [1.22, 1.22], pan: [0.42, 0.35, 0.42, 0.35] },
});
// darkening for text zones
const g = ctx.createLinearGradient(0, 0, 0, H);
g.addColorStop(0, "rgba(8,10,14,0.42)"); g.addColorStop(0.5, "rgba(8,10,14,0.18)"); g.addColorStop(1, "rgba(8,10,14,0.55)");
ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

// 2) the tent — focal point, slightly left of center, large
inkTent(ctx, W * 0.44, H * 0.60, W * 0.40, H * 0.36, { p: 1, cuts: 3, night: true, alpha: 1 });
snow(ctx, W, H, 2.5, 11, 60, 26);

// 3) small crimson evidence marker near the tent
mark(ctx, W * 0.665, H * 0.70, { size: 10 });

// 4) the question — huge display type (thumbnail contract line)
font(ctx, Math.round(H * 0.155), S.serif, "bold");
ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 18;
ctx.fillStyle = S.bone; ctx.textAlign = "center";
ctx.fillText("WHY DID", W * 0.60, H * 0.30);
ctx.fillStyle = "rgba(226,120,96,0.98)";
ctx.fillText("THEY LEAVE?", W * 0.60, H * 0.30 + H * 0.155);
ctx.shadowBlur = 0;
// channel mark
font(ctx, Math.round(H * 0.045), S.mono, "bold");
ctx.fillStyle = "rgba(234,227,212,0.92)";
ctx.fillText("THE UNCLOSED FILE", W * 0.60, H * 0.93);
// honesty micro-label (bottom-left)
text(ctx, "STYLIZED RECONSTRUCTION \u00B7 NOT A 1959 PHOTOGRAPH", Math.round(W * 0.02), Math.round(H * 0.965), Math.round(H * 0.026), { family: S.mono, color: "rgba(234,227,212,0.55)", spacing: 1 });

grain(ctx, W, H, 2.5);
vignette(ctx, W, H);
fs.writeFileSync("build/thumbnail.jpg", cv.toBuffer("image/jpeg", 92));
console.log("build/thumbnail.jpg written (1280x720)");
