// map_z.mjs — stylized Bay Area / Northern California dot-grid map (engine-style)
// Same machinery as film_look's norwayMap but with a Bay Area polygon and cities.
import { clamp, easeOut, text, font } from "./engine.mjs";
import { PAL as S } from "./film_look.mjs";

// rough NorCal coast/inland outline in normalized box coords (x right, y down)
const BAY = [
  [0.10,0.06],[0.14,0.14],[0.12,0.24],[0.16,0.32],[0.13,0.40],[0.17,0.48],[0.15,0.56],
  [0.19,0.62],[0.17,0.70],[0.21,0.78],[0.26,0.86],[0.34,0.92],[0.44,0.96],[0.56,0.98],
  [0.68,0.96],[0.78,0.92],[0.88,0.86],[0.92,0.76],[0.94,0.64],[0.96,0.52],[0.94,0.40],
  [0.96,0.28],[0.92,0.16],[0.84,0.08],[0.72,0.04],[0.58,0.02],[0.44,0.04],[0.30,0.02],[0.20,0.04],
];
const CITIES = {
  sf:         { x: 0.225, y: 0.600, label: "SAN FRANCISCO", dx: -0.02, dy: 0.035 },
  benicia:    { x: 0.300, y: 0.545, label: "BENICIA",       dx:  0.05, dy: -0.02 },
  vallejo:    { x: 0.262, y: 0.568, label: "VALLEJO",       dx: -0.06, dy: -0.015 },
  napa:       { x: 0.305, y: 0.492, label: "NAPA COUNTY",   dx:  0.06, dy: -0.01 },
  berryessa:  { x: 0.352, y: 0.452, label: "LAKE BERRYESSA",dx:  0.075,dy: -0.012 },
  presidio:   { x: 0.210, y: 0.578, label: "PRESIDIO HTS",  dx: -0.055,dy: 0.045 },
  sanjose:    { x: 0.270, y: 0.760, label: "SAN JOSE",      dx:  0.02, dy: 0.02 },
  sacramento: { x: 0.560, y: 0.430, label: "SACRAMENTO",    dx:  0.02, dy: 0.0 },
};
function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; j = i, i < poly.length; i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
// opts: p (reveal 0..1), pins: [cityKey...], hit: cityKey, dateChip: "string"
export function bayAreaMap(ctx, x, y, w, h, t, opts = {}) {
  const { p = 1, pins = [], hit = null, dateChip = null, labels = null } = opts;
  const step = Math.max(9, Math.round(w / 58));
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  // backdrop
  ctx.fillStyle = "rgba(13,16,22,0.72)"; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(217,164,65,0.16)"; ctx.lineWidth = 1;
  for (let gx = x; gx <= x + w; gx += step * 2) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke(); }
  for (let gy = y; gy <= y + h; gy += step * 2) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke(); }
  const n = Math.ceil(BAY.length * clamp(p * 1.2));
  const reveal = new Set(BAY.slice(0, n));
  for (let gy = y + step / 2; gy < y + h; gy += step) {
    for (let gx = x + step / 2; gx < x + w; gx += step) {
      const nx = (gx - x) / w, ny = (gy - y) / h;
      if (!pointInPoly(nx, ny, BAY)) continue;
      let ord = (1 - ny) * 0.7 + nx * 0.3;
      let on = false;
      for (const pt of reveal) { const [px, py] = pt; if (Math.abs(px - nx) < step / w * 0.9 && Math.abs(py - ny) < step / h * 0.9) { on = true; break; } }
      const idx = Math.floor(ord * 240 + nx * 60);
      const a = on ? 0.85 : 0.16 + 0.08 * Math.sin(t * 0.7 + idx);
      ctx.fillStyle = on ? "rgba(217,164,65,0.5)" : `rgba(190,200,215,${a * 0.35})`;
      ctx.beginPath(); ctx.arc(gx, gy, Math.max(1.1, step * 0.09), 0, 7); ctx.fill();
    }
  }
  // cities + labels
  for (const [k, c] of Object.entries(CITIES)) {
    const cx = x + c.x * w, cy = y + c.y * h;
    const isPin = pins.includes(k), isHit = hit === k;
    if (!isPin && !isHit) {
      ctx.fillStyle = "rgba(200,208,220,0.5)";
      ctx.beginPath(); ctx.arc(cx, cy, 2.2, 0, 7); ctx.fill();
      continue;
    }
    const pulse = isHit ? 1 + 0.22 * Math.sin(t * 4.2) : 1;
    ctx.strokeStyle = isHit ? "rgba(192,57,43,0.95)" : "rgba(217,164,65,0.9)";
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(cx, cy, (isHit ? 7 : 5.4) * pulse, 0, 7); ctx.stroke();
    ctx.fillStyle = isHit ? "rgba(192,57,43,0.95)" : "rgba(217,164,65,0.95)";
    ctx.beginPath(); ctx.arc(cx, cy, 2.6, 0, 7); ctx.fill();
    if (isHit) {
      ctx.strokeStyle = "rgba(192,57,43,0.4)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, 13 + 6 * Math.sin(t * 2.4), 0, 7); ctx.stroke();
    }
    if (labels && !isHit && !labels.includes(k)) continue;
    const fs = Math.max(11, Math.round(h * 0.036));
    font(ctx, fs, S.body, "bold");
    ctx.fillStyle = isHit ? "rgba(240,234,220,0.98)" : "rgba(226,220,206,0.82)";
    ctx.textAlign = c.dx >= 0 ? "left" : "right";
    ctx.fillText(c.label, cx + c.dx * w, cy + c.dy * h + fs * 0.35);
  }
  if (dateChip) {
    const fs = Math.max(12, Math.round(h * 0.042));
    font(ctx, fs, S.mono, "bold");
    const tw = ctx.measureText(dateChip).width;
    const cx = x + w - tw - fs * 1.4, cy = y + h - fs * 2.2;
    ctx.fillStyle = "rgba(9,11,15,0.8)"; ctx.fillRect(cx - fs * 0.7, cy - fs, tw + fs * 1.4, fs * 1.9);
    ctx.strokeStyle = "rgba(217,164,65,0.5)"; ctx.lineWidth = 1.2; ctx.strokeRect(cx - fs * 0.7, cy - fs, tw + fs * 1.4, fs * 1.9);
    ctx.fillStyle = "rgba(217,164,65,0.95)"; ctx.textAlign = "left";
    ctx.fillText(dateChip, cx, cy + fs * 0.42);
  }
  ctx.restore();
}
