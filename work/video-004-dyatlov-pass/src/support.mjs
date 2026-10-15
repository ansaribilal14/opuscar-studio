// support.mjs — shared composites for video-004 (extracted v4 support layer)
// Scene fns: (ctx, W, H, tLoc, dur, b) — CONTENT only; dispatcher adds chrome.
import { PAL as S, kicker, stamp2, display as _display } from "./film_look.mjs";
import { clamp, lerp, ease, easeOut, text, font, textW, RNG } from "./engine.mjs";

let FW = 1920;
export function setW(w) { FW = w; }
export function dline(ctx, str, cx, y, size, p, opts = {}) {
  return _display(ctx, str, cx, y, size, p, { maxW: FW * 0.92, ...opts });
}

export function header(ctx, W, H, tLoc, label, title) {
  const p = ease(clamp(tLoc / 1.1));
  const rise = (1 - easeOut(p)) * 26;
  ctx.save(); ctx.globalAlpha *= p;
  kicker(ctx, label, Math.round(W * 0.062), Math.round(H * 0.155 + rise), Math.round(H * 0.021));
  font(ctx, Math.round(H * 0.052), S.serif, "bold");
  ctx.fillStyle = S.bone;
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14;
  ctx.fillText(title, Math.round(W * 0.062), Math.round(H * 0.155 + H * 0.058 + rise));
  ctx.restore();
}
export function creditBR(ctx, W, H, str) {
  const size = Math.round(H * 0.014);
  const w = textW(ctx, str, size, S.mono) + 1.5 * (str.length - 1);
  const x = W - Math.round(W * 0.03) - w, y = Math.round(H * 0.055);
  ctx.save();
  ctx.fillStyle = "rgba(8,10,14,0.45)";
  ctx.fillRect(x - size * 0.7, y - size * 0.95, w + size * 1.4, size * 2.1);
  ctx.restore();
  text(ctx, str, x, y, size, { family: S.mono, color: S.boneFaint, alpha: 0.9, spacing: 1.5 });
}
export function chip(ctx, str, x, y, size, opts = {}) {
  const { color = S.boneDim, border = "rgba(234,227,212,0.35)", fill = "rgba(12,15,20,0.55)", align = "left", alpha = 1 } = opts;
  font(ctx, size, S.mono, "bold");
  const padX = size * 0.8, padY = size * 0.55;
  const w = ctx.measureText(str).width + padX * 2, h = size + padY * 2;
  let xx = x;
  if (align === "center") xx = x - w / 2;
  if (align === "right") xx = x - w;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.fillStyle = fill; ctx.fillRect(xx, y - padY, w, h);
  ctx.strokeStyle = border; ctx.lineWidth = 1.4; ctx.strokeRect(xx + 0.5, y - padY + 0.5, w - 1, h - 1);
  ctx.fillStyle = color; ctx.textAlign = "left";
  ctx.fillText(str, xx + padX, y + size * 0.36);
  ctx.restore();
  return w;
}
export function stamp(ctx, label, x, y, size, color = S.red, rot = -0.08, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  stamp2(ctx, label, 0, 0, size, { color, alpha });
  ctx.restore();
}
export function quoteBar(ctx, W, H, quote, who, p, yFrac = 0.86) {
  const y = Math.round(H * yFrac);
  ctx.save();
  const a = clamp(p * 1.6);
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(9,11,15,0.72)";
  ctx.fillRect(0, y - Math.round(H * 0.045), W, Math.round(H * 0.082));
  ctx.fillStyle = S.amber; ctx.fillRect(0, y - Math.round(H * 0.045), Math.round(W * 0.006 * clamp(p * 2)), Math.round(H * 0.082));
  const size = Math.round(H * 0.031);
  font(ctx, size, S.serif, "bold");
  ctx.fillStyle = S.bone;
  const q = quote.length > 128 ? quote.slice(0, 128) : quote;
  ctx.fillText(`\u201C${q}\u201D`, Math.round(W * 0.03), y + size * 0.32);
  font(ctx, Math.round(H * 0.017), S.mono, "bold");
  ctx.fillStyle = S.boneDim;
  ctx.fillText(who, Math.round(W * 0.032), y + Math.round(H * 0.082) - Math.round(H * 0.008));
  ctx.restore();
}
export function crosshair(ctx, x, y, r, t, opts = {}) {
  const { color = "rgba(208,90,60,0.95)", p = 1 } = opts;
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, r * 0.055);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.42, 0, 7); ctx.stroke();
  ctx.lineWidth = Math.max(1.6, r * 0.05);
  const rr = r * 0.9;
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42);
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    ctx.stroke();
  }
  ctx.restore();
}
export function listRow(ctx, W, cx, y, size, mark, markColor, str, p) {
  ctx.save(); ctx.globalAlpha = clamp(p * 1.4);
  font(ctx, size, S.mono, "bold");
  ctx.fillStyle = markColor;
  ctx.fillText(mark, cx - Math.round(W * 0.325), y);
  font(ctx, size, S.body, "");
  ctx.fillStyle = S.bone;
  ctx.fillText(str, cx - Math.round(W * 0.325) + size * 2.1, y);
  ctx.restore();
}
export function base(ctx, W, H, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, S.bgTop); g.addColorStop(0.55, S.bgMid); g.addColorStop(1, S.bgBot);
  ctx.save();
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const rng = RNG(7);
  for (let i = 0; i < 40; i++) {
    const x = rng() * W, y = rng() * H, r = 30 + rng() * 130;
    ctx.fillStyle = S.lift;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
}
