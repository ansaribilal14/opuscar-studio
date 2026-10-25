// scenes_c.mjs — SC25..SC34 v2 ("PAPER & SKY"). Surviving hypotheses (PAPER),
// evidence ledger (PAPER), verdict + close (SKY, single question).
import { fnt, prng, easeOut, clamp01, lerp } from "./support.mjs";
import { PAL, TS, skyBase, paperBase, bigEarPanorama, withPush, buildIn, displayBig,
         sectionTitle, label, numeral, chipBig, grain2, vignette2, recon2,
         channelMark, handStroke, handEllipse, sprog } from "./support2.mjs";

// SC25 two ideas survive — PAPER, lensing + scintillation diagrams
export function SC25(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 10, seed: 79 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.135 + b1.dy, "TWO IDEAS SURVIVE AS POSSIBILITIES", 62, PAL.inkPrint, "center");
      ctx.globalAlpha = 1;
    }
    // left card: gravitational lensing
    const a1 = easeOut(clamp01((t - win.start - 1.2) / 0.7));
    if (a1 > 0) {
      ctx.globalAlpha = a1;
      const cx = W * 0.28, cy = H * 0.47;
      ctx.strokeStyle = "#33302a"; ctx.lineWidth = 4;
      // source star
      ctx.fillStyle = "#5a5240"; ctx.beginPath(); ctx.arc(cx - 190, cy, 12, 0, Math.PI * 2); ctx.fill();
      // lens mass
      ctx.fillStyle = "#2a2620"; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill();
      // bent rays to observer
      ctx.strokeStyle = "rgba(29,92,68,0.8)"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(cx - 178, cy - 6); ctx.quadraticCurveTo(cx, cy - 58, cx + 180, cy - 26); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 178, cy + 6); ctx.quadraticCurveTo(cx, cy + 58, cx + 180, cy + 26); ctx.stroke();
      ctx.font = fnt("body", 40); ctx.fillStyle = "#33302a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("GRAVITATIONAL LENSING", cx, cy + 120);
      ctx.font = fnt("body", 36); ctx.fillStyle = "#4a4436";
      ctx.fillText("an unseen mass briefly focuses", cx, cy + 168);
      ctx.fillText("a fainter background source", cx, cy + 212);
      ctx.globalAlpha = 1;
    }
    // right card: interstellar scintillation
    const a2 = easeOut(clamp01((t - win.start - 2.2) / 0.7));
    if (a2 > 0) {
      ctx.globalAlpha = a2;
      const cx = W * 0.72, cy = H * 0.47;
      ctx.strokeStyle = "#33302a"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx - 200, cy + 30); ctx.lineTo(cx + 120, cy + 30); ctx.stroke();
      // twinkling signal path through plasma blobs
      const rnd = prng(91);
      for (let i = 0; i < 5; i++) {
        const bx = cx - 150 + i * 70, by = cy - 40 + Math.sin(t * 1.2 + i * 1.7) * 12;
        ctx.strokeStyle = "rgba(88,199,240,0.55)"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(bx, by, 20 + (rnd() * 8), 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = PAL.signal; ctx.shadowColor = "rgba(75,225,160,0.7)"; ctx.shadowBlur = 18;
      const pulse = 0.6 + 0.4 * Math.sin(t * 2.4);
      ctx.globalAlpha = a2 * pulse;
      ctx.beginPath(); ctx.arc(cx + 140, cy - 44, 12, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.globalAlpha = a2;
      ctx.font = fnt("body", 40); ctx.fillStyle = "#33302a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("INTERSTELLAR SCINTILLATION", cx, cy + 120);
      ctx.font = fnt("body", 36); ctx.fillStyle = "#4a4436";
      ctx.fillText("the interstellar medium twinkles", cx, cy + 168);
      ctx.fillText("— the triangle of 3 NVSS sources", cx, cy + 212);
      ctx.globalAlpha = 1;
    }
    const b2 = buildIn(t, win.start + 3.4, 2);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      chipBig(ctx, W * 0.235, H * 0.775, "BOTH SAY: SHOULD HAVE LASTED LONGER — OR RETURNED", "#8a2f22");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC26 comet hypothesis — PAPER card with three dismissal strikes
export function SC26(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 12, seed: 83 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.135 + b1.dy, "2017 — THE COMET HYPOTHESIS", TS.section, PAL.inkPrint, "center");
      label(ctx, W / 2, H * 0.20 + b1.dy, "Hydrogen clouds around two comets (266P / P/2008 Y2)", 40, "#5a5240", "center");
      ctx.globalAlpha = 1;
    }
    // comet card (hero-left): nucleus + tail
    const a1 = easeOut(clamp01((t - win.start - 1.2) / 0.7));
    if (a1 > 0) {
      ctx.globalAlpha = a1;
      const cx = W * 0.24, cy = H * 0.46;
      ctx.fillStyle = "#5a5240"; ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
      const g = ctx.createLinearGradient(cx, cy, cx + 260, cy - 90);
      g.addColorStop(0, "rgba(88,199,240,0.55)"); g.addColorStop(1, "rgba(88,199,240,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(cx - 10, cy - 22); ctx.lineTo(cx + 270, cy - 100); ctx.lineTo(cx + 250, cy - 40); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 6, cy + 20); ctx.lineTo(cx + 240, cy + 90); ctx.lineTo(cx + 210, cy + 40); ctx.closePath(); ctx.fill();
      ctx.font = fnt("body", 36); ctx.fillStyle = "#4a4436"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("266P — NEOWISE", cx - 40, cy + 90);
      ctx.fillText("P/2008 Y2 — GIBBS", cx + 60, cy - 110);
      ctx.globalAlpha = 1;
    }
    // dismissal strikes (hero-right)
    const strikes = [
      "NOT IN THE BEAM AT THE RIGHT TIME",
      "COMETS RARELY EMIT AT THE RIGHT FREQUENCY",
      "ONE HORN ONLY — COMETS WOULD SHOW IN BOTH",
    ];
    strikes.forEach((s, i) => {
      const a = easeOut(clamp01((t - win.start - 2.6 - i * 1.6) / 0.5));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      const bx = W * 0.44, by = H * (0.34 + i * 0.14), bw = W * 0.46;
      ctx.font = fnt("body", 38);
      ctx.fillStyle = "rgba(60,54,40,0.14)"; ctx.fillRect(bx, by - 30, bw, 60);
      ctx.fillStyle = "#33302a"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(s.slice(0, 46), bx + 22, by);
      ctx.strokeStyle = PAL.penRed; ctx.lineWidth = 7; ctx.lineCap = "round";
      handStroke(ctx, [[bx + 8, by + 2], [bx + bw - 30, by - 6]], 4, 86 + i, 1);
      ctx.globalAlpha = 1;
    });
    const b2 = buildIn(t, win.start + 8.4, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      label(ctx, W * 0.44, H * 0.775, "DISMISSED BY THE ORIGINAL OBSERVERS", 42, "#8a2f22");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC27 hydrogen maser — PAPER, 2024 Arecibo-Wow! re-examination
export function SC27(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 10, seed: 89 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.135 + b1.dy, "2024 — THE NEWEST HYPOTHESIS", TS.section, PAL.inkPrint, "center");
      label(ctx, W / 2, H * 0.20 + b1.dy, "Arecibo archive re-examination — a hydrogen cloud and a magnetar flare", 38, "#5a5240", "center");
      ctx.globalAlpha = 1;
    }
    // hero diagram: hydrogen cloud + magnetar flare -> maser burst
    const a1 = easeOut(clamp01((t - win.start - 1.4) / 0.8));
    if (a1 > 0) {
      ctx.globalAlpha = a1;
      const cx = W * 0.30, cy = H * 0.50;
      // hydrogen cloud (cluster of dots)
      const rnd = prng(97);
      for (let i = 0; i < 40; i++) {
        const ang = rnd() * Math.PI * 2, rr = rnd() * 90;
        ctx.fillStyle = "rgba(88,199,240,0.5)";
        ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * rr * 1.4, cy + Math.sin(ang) * rr * 0.7, 4 + rnd() * 4, 0, Math.PI * 2); ctx.fill();
      }
      label(ctx, cx, cy + 110, "COLD HYDROGEN CLOUD", 38, "#1d5c44", "center");
      // magnetar flare arrow
      const mx = cx + 330;
      ctx.strokeStyle = PAL.crimson; ctx.lineWidth = 8; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(mx - 90, cy - 120); ctx.lineTo(mx + 40, cy - 40); ctx.stroke();
      ctx.fillStyle = PAL.crimson;
      ctx.beginPath(); ctx.moveTo(mx + 48, cy - 34); ctx.lineTo(mx + 8, cy - 52); ctx.lineTo(mx + 26, cy - 14); ctx.closePath(); ctx.fill();
      ctx.font = fnt("body", 36); ctx.fillStyle = "#8a2f22"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("MAGNETAR FLARE", mx - 20, cy - 160);
      // maser burst
      ctx.strokeStyle = PAL.signal; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(mx + 40, cy - 30); ctx.lineTo(mx + 250, cy + 60); ctx.stroke();
      ctx.font = fnt("body", 40); ctx.fillStyle = "#1d5c44";
      ctx.fillText("MASER BURST AT 1420 MHz", mx + 170, cy + 120);
      ctx.globalAlpha = 1;
    }
    // verdict + caveat
    const b2 = buildIn(t, win.start + 4.4, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      chipBig(ctx, W * 0.60, H * 0.28, "PROPOSED — NOT PROVEN", PAL.warn, 44, true);
      ctx.globalAlpha = 1;
    }
    const b3 = buildIn(t, win.start + 8, 2);
    if (b3.a > 0) {
      ctx.globalAlpha = b3.a;
      numeral(ctx, W * 0.62, H * 0.775, "MODEL EVENTS ~100× WEAKER THAN WOW!", 42, "#33302a");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC28 evidence ledger — PAPER, ESTABLISHED column
export function SC28(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 8, seed: 101 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.125 + b1.dy, "WHERE THE EVIDENCE STANDS", TS.section, PAL.inkPrint, "center");
      ctx.globalAlpha = 1;
    }
    const facts = [
      "A STRONG, NARROWBAND RADIO BURST",
      "ON THE SKY FOR 72 SECONDS",
      "ON ONE OF THE 50 CHANNELS",
      "NEVER DETECTED AGAIN — DESPITE 5 DECADES OF BETTER INSTRUMENTS",
      "THE FACT THAT IT SITS ON ONE SHEET OF LINE-PRINTER PAPER",
    ];
    const bx = W * 0.13, bw = W * 0.74, rh = 84, y0 = H * 0.24;
    // column header chip
    chipBig(ctx, bx, y0 - 76, "ESTABLISHED", "#1d5c44", 44, true);
    facts.forEach((f, i) => {
      const a = easeOut(clamp01((t - win.start - 1.2 - i * 1.35) / 0.5));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(60,54,40,0.12)"; ctx.fillRect(bx, y0 + i * rh, bw, rh - 10);
      ctx.strokeStyle = "rgba(29,92,68,0.5)"; ctx.lineWidth = 3;
      ctx.strokeRect(bx, y0 + i * rh, bw, rh - 10);
      ctx.font = fnt("body", 40); ctx.fillStyle = "#26332b"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(f, bx + 30, y0 + i * rh + (rh - 10) / 2);
      // green check stroke
      ctx.strokeStyle = "#1d5c44"; ctx.lineWidth = 7; ctx.lineCap = "round";
      const cxx = bx + bw - 52, cyy = y0 + i * rh + (rh - 10) / 2;
      ctx.beginPath(); ctx.moveTo(cxx - 14, cyy + 2); ctx.lineTo(cxx - 3, cyy + 13); ctx.lineTo(cxx + 17, cyy - 12); ctx.stroke();
      ctx.globalAlpha = 1;
    });
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC29 not established — PAPER, open column
export function SC29(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 8, seed: 103 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.125 + b1.dy, "WHAT IS NOT ESTABLISHED", TS.section, PAL.inkPrint, "center");
      ctx.globalAlpha = 1;
    }
    const items = [
      ["WHO — OR WHAT — SENT IT", "NO EVIDENCE EITHER WAY"],
      ["THAT IT WAS AN EXTRATERRESTRIAL TRANSMISSION", "CANNOT BE RULED OUT — CANNOT BE CLAIMED"],
      ["ANY PROVEN NATURAL PHENOMENON", "ALL EXPLANATIONS REMAIN HYPOTHESES"],
    ];
    const bx = W * 0.13, bw = W * 0.74, rh = 108, y0 = H * 0.26;
    chipBig(ctx, bx, y0 - 80, "NOT ESTABLISHED", "#8a2f22", 44, true);
    items.forEach(([k, sub], i) => {
      const a = easeOut(clamp01((t - win.start - 1.4 - i * 1.7) / 0.6));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(60,54,40,0.12)"; ctx.fillRect(bx, y0 + i * rh, bw, rh - 12);
      ctx.strokeStyle = "rgba(138,47,34,0.55)"; ctx.lineWidth = 3;
      ctx.strokeRect(bx, y0 + i * rh, bw, rh - 12);
      ctx.font = fnt("body", 40); ctx.fillStyle = "#33302a"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(k, bx + 30, y0 + i * rh + 34);
      ctx.font = fnt("body", 34); ctx.fillStyle = "#8a2f22";
      ctx.fillText(sub, bx + 30, y0 + i * rh + 74);
      ctx.globalAlpha = 1;
    });
    const b2 = buildIn(t, win.start + 7.6, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      displayBig(ctx, W / 2, H * 0.775, "REPLICATION IS THE CURRENCY — NOTHING HAS REPLICATED", 42, "#4a4436", 4, "body");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC30 Ehman quotes — PAPER, big quote card
export function SC30(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 6, seed: 107 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.5, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      ctx.font = "italic bold 130px 'DejaVu Sans'"; ctx.fillStyle = "rgba(138,47,34,0.55)";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("\u201C", W * 0.10, H * 0.30);
      ctx.globalAlpha = 1;
    }
    const lines1 = ["THE ORIGIN OF THE WOW! SIGNAL", "IS STILL AN OPEN QUESTION FOR ME."];
    lines1.forEach((ln, i) => {
      const a = easeOut(clamp01((t - win.start - 1 - i * 0.6) / 0.7));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      ctx.font = fnt("title", 66); ctx.fillStyle = "#2e2a22";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(ln, W * 0.17, H * (0.30 + i * 0.10));
      ctx.globalAlpha = 1;
    });
    const lines2 = ["\u2026HALF-VAST DATA."];
    const a2 = easeOut(clamp01((t - win.start - 6) / 0.7));
    if (a2 > 0) {
      ctx.globalAlpha = a2;
      ctx.font = fnt("title", 60); ctx.fillStyle = "rgba(46,42,34,0.75)";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(lines2[0], W * 0.17, H * 0.56);
      ctx.globalAlpha = 1;
    }
    const b2 = buildIn(t, win.start + 7.2, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      ctx.strokeStyle = PAL.penRed; ctx.lineWidth = 5; ctx.lineCap = "round";
      handStroke(ctx, [[W * 0.17, H * 0.63], [W * 0.46, H * 0.625]], 3, 111, 1);
      label(ctx, W * 0.17, H * 0.70, "JERRY R. EHMAN — BIGEAR.ORG", 40, "#5a5240");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC31 telescope gone — SKY, Big Ear fades to outline
export function SC31(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.5, horizon: 0.86, nebula: false });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.14 + b1.dy, "1998 — THE TELESCOPE CAME DOWN", TS.section, PAL.ink, "center");
      ctx.globalAlpha = 1;
    }
    // panorama: solid fades to outline across the scene
    const fade = clamp01((t - win.start - 1.5) / 7);
    const px = W * 0.10, py = H * 0.62, pw = W * 0.80;
    const solidA = 1 - easeOut(fade);
    if (solidA > 0.02) bigEarPanorama(ctx, px, py, pw, solidA);
    if (fade > 0.1) {
      ctx.save(); ctx.globalAlpha = Math.min(1, fade * 1.3);
      ctx.strokeStyle = "rgba(157,176,200,0.5)"; ctx.lineWidth = 3;
      ctx.setLineDash([14, 12]);
      // outline variant
      ctx.strokeRect(px - pw * 0.08, py + pw * 0.048, pw * 1.16, pw * 0.09);
      ctx.beginPath();
      ctx.moveTo(px, py + pw * 0.048); ctx.lineTo(px + pw * 0.06, py);
      ctx.lineTo(px + pw * 0.94, py); ctx.lineTo(px + pw, py + pw * 0.048); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.56, py + pw * 0.048);
      ctx.quadraticCurveTo(px + pw * 0.66, py - pw * 0.186, px + pw * 0.78, py + pw * 0.048);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    const b2 = buildIn(t, win.start + 4.5, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      numeral(ctx, W / 2, H * 0.715, "THE LAND WAS SOLD — A GOLF COURSE AND 400 HOUSES", 42, PAL.dim);
      displayBig(ctx, W / 2, H * 0.775, "WHAT SURVIVES IS PAPER.", 52, PAL.ink, 8, "body");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.44); grain2(ctx, W, H, t);
}

// SC32 searches go on — SKY star map with modern survey cones
export function SC32(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.35, horizon: 0.92 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.135 + b1.dy, "LISTENING FOR ANOTHER WOW!", TS.section, PAL.ink, "center");
      ctx.globalAlpha = 1;
    }
    // star map + survey cones sweeping
    const rnd = prng(113);
    const my = H * 0.46;
    for (let i = 0; i < 70; i++) {
      const x = rnd() * W, y = H * 0.24 + rnd() * H * 0.42;
      ctx.globalAlpha = 0.25 + rnd() * 0.55;
      ctx.fillStyle = "#d8e6ff";
      ctx.beginPath(); ctx.arc(x, y, 1.5 + rnd() * 2.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // survey cones
    const cones = [0.16, 0.5, 0.84];
    cones.forEach((fx, i) => {
      const a = easeOut(clamp01((t - win.start - 1.2 - i * 0.9) / 0.7));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      const cx = W * fx, cy = H * 0.80;
      const sweep = (Math.sin(t * 0.9 + i * 2.1) * 0.28);
      const g = ctx.createLinearGradient(cx, cy, cx + sweep * W * 0.5, my);
      g.addColorStop(0, "rgba(75,225,160,0.45)"); g.addColorStop(1, "rgba(75,225,160,0.02)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx - 26, cy); ctx.lineTo(cx + 26, cy);
      ctx.lineTo(cx + sweep * W * 0.5 + 120, my - 60); ctx.lineTo(cx + sweep * W * 0.5 - 120, my - 60);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    });
    const b2 = buildIn(t, win.start + 4.4, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      chipBig(ctx, W * 0.28, H * 0.175, "NEW INSTRUMENTS · NEW SURVEYS · WIDER BANDS", PAL.signal);
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.42); grain2(ctx, W, H, t);
}

// SC33 final question — SKY, slow push toward Sagittarius, one line
export function SC33(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.25, horizon: 0.96 });
  // pull extra focus to the Sagittarius marker
  const mx = W * 0.62, my = H * 0.44;
  const glow = ctx.createRadialGradient(mx, my, 0, mx, my, H * 0.42);
  glow.addColorStop(0, "rgba(75,225,160,0.10)"); glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  withPush(ctx, W, H, sp * 1.4, () => {
    // marker
    const mp = easeOut(clamp01((t - win.start - 1) / 2));
    if (mp > 0) {
      ctx.globalAlpha = mp;
      ctx.strokeStyle = PAL.signal; ctx.lineWidth = 5; ctx.lineCap = "round";
      handEllipse(ctx, mx, my, 34, 24, 131, mp);
      const ring = (t * 0.5) % 1;
      ctx.globalAlpha = mp * (1 - ring) * 0.7;
      handEllipse(ctx, mx, my, 34 + 60 * ring, 24 + 42 * ring, 133, 1);
      ctx.globalAlpha = 1;
    }
    const l1a = easeOut(clamp01((t - win.start - 4.5) / 1.2));
    if (l1a > 0) {
      ctx.globalAlpha = l1a;
      displayBig(ctx, W / 2, H * 0.635, "IF IT WAS A BEACON, IT SPOKE ONCE.", 64, PAL.ink, 6);
      ctx.globalAlpha = 1;
    }
    const l2a = easeOut(clamp01((t - win.start - 7.5) / 1.2));
    if (l2a > 0) {
      ctx.globalAlpha = l2a;
      displayBig(ctx, W / 2, H * 0.725, "IF IT WAS NATURE, WE HAVE NOT CAUGHT IT AGAIN.", 56, PAL.signal, 6);
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t, 0.8);
  vignette2(ctx, W, H, 0.42); grain2(ctx, W, H, t);
}

// SC34 closing card — SKY, channel identity + credits + final hold
export function SC34(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t * 0.4, { emptier: 0.3, horizon: 0.94 });
  withPush(ctx, W, H, sp * 0.6, () => {
    const b1 = buildIn(t, win.start + 0.5, 0, 0.2, 0.8);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      ctx.strokeStyle = PAL.crimson; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(W / 2 - 220, H * 0.30 + b1.dy); ctx.lineTo(W / 2 + 220, H * 0.30 + b1.dy); ctx.stroke();
      displayBig(ctx, W / 2, H * 0.40 + b1.dy, "THE UNCLOSED FILE", TS.display2, PAL.ink, 18);
      ctx.globalAlpha = 1;
    }
    const b2 = buildIn(t, win.start + 1.4, 1, 0.2, 0.8);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      displayBig(ctx, W / 2, H * 0.505 + b2.dy, "THE WOW! SIGNAL — 72 SECONDS FROM DEEP SPACE", 44, PAL.dim, 8, "body");
      ctx.globalAlpha = 1;
    }
    const b3 = buildIn(t, win.start + 2.6, 2, 0.2, 0.8);
    if (b3.a > 0) {
      ctx.globalAlpha = b3.a;
      ctx.font = fnt("body", 36); ctx.fillStyle = "rgba(157,176,200,0.85)";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const credit = [
        "RESEARCH: BIGEAR.ORG · THE SETI INSTITUTE · PUBLISHED LITERATURE",
        "NARRATION: SYNTHETIC VOICE (MICROSOFT EDGE-TTS NEURAL)",
        "VISUALS: CODE-GENERATED + PUBLIC-DOMAIN ARCHIVAL (WIKIMEDIA COMMONS)",
      ];
      credit.forEach((ln, i) => ctx.fillText(ln, W / 2, H * 0.62 + i * 52));
      ctx.globalAlpha = 1;
    }
    const b4 = buildIn(t, win.start + 4.2, 3, 0.2, 0.9);
    if (b4.a > 0) {
      ctx.globalAlpha = b4.a;
      displayBig(ctx, W / 2, H * 0.775 + b4.dy, "SOME FILES NEVER CLOSE.", 64, PAL.crimson, 14);
      ctx.globalAlpha = 1;
    }
  });
  vignette2(ctx, W, H, 0.4); grain2(ctx, W, H, t);
}
