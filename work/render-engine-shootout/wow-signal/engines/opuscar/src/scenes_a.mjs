// scenes_a.mjs — SC01..SC12 v2 ("PAPER & SKY"). Act 1 SKY (cold open, tease, title),
// Act 2 SKY (observatory), Act 3 PAPER begins (narrowband machine, printout).
// Every scene: full-frame environment, hero >=55% coverage, staggered build-ins,
// global slow push, type >=34px. Absolute program time via win.start/end.
import { fnt, prng, easeOut, clamp01, lerp } from "./support.mjs";
import { PAL, TS, skyBase, paperBase, bigEarPanorama, gradeArchival, lightLeak, withPush,
         buildIn, displayBig, sectionTitle, label, numeral, chipBig, caption2,
         signalBar, coordChip, grain2, vignette2, recon2, channelMark, handStroke,
         handEllipse, sprog } from "./support2.mjs";

// SC01 cold open — full sky, Big Ear panorama, big date, arch draws, signal bar fills
export function SC01(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { bigEar: true, horizon: 0.86 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      displayBig(ctx, W / 2, H * 0.18 + b1.dy, "AUGUST 15, 1977", 92, PAL.ink, 8);
      ctx.globalAlpha = 1;
    }
    const b2 = buildIn(t, win.start + 0.9, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      displayBig(ctx, W / 2, H * 0.265 + b2.dy, "11:16 P.M. EASTERN", 44, PAL.dim, 10, "body");
      ctx.globalAlpha = 1;
    }
    // the beam-transit arch — HERO
    const ap = easeOut(clamp01((t - win.start - 2.2) / 7));
    if (ap > 0) {
      ctx.save();
      ctx.strokeStyle = PAL.signal; ctx.lineWidth = 7;
      ctx.shadowColor = "rgba(75,225,160,0.55)"; ctx.shadowBlur = 26;
      ctx.beginPath();
      const x0 = W * 0.12, w0 = W * 0.76, y0 = H * 0.68, h0 = H * 0.30, N = 110;
      for (let i = 0; i <= N * ap; i++) {
        const x01 = i / N;
        const yv = Math.exp(-Math.pow((x01 - 0.5) / 0.235, 2) / 2) * h0;
        i === 0 ? ctx.moveTo(x0 + x01 * w0, y0 - yv) : ctx.lineTo(x0 + x01 * w0, y0 - yv);
      }
      ctx.stroke(); ctx.restore();
      if (ap >= 1) {
        const bp = clamp01((t - win.start - 9.2) / 4);
        signalBar(ctx, W * 0.30, H * 0.715, W * 0.40, 22, bp, PAL.signal, null);
      }
    }
    const b3 = buildIn(t, win.start + 11.4, 2);
    if (b3.a > 0) {
      ctx.globalAlpha = b3.a * 0.95;
      displayBig(ctx, W / 2, H * 0.775 + b3.dy, "OHIO IS LISTENING TO THE SKY", 40, PAL.dim, 6, "body");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  vignette2(ctx, W, H, 0.42); grain2(ctx, W, H, t);
}

// SC02 tease — 6EQUJ5 HUGE with red circle + script Wow!
export function SC02(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.55, nebula: true });
  withPush(ctx, W, H, sp, () => {
    const chars = ["6", "E", "Q", "U", "J", "5"];
    const size = 230, gap = 172;
    const startX = W / 2 - (chars.length - 1) * gap / 2 - 8;
    const cy = H * 0.44;
    chars.forEach((c, i) => {
      const a = easeOut(clamp01((t - win.start - 0.5 - i * 0.5) / 0.38));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      ctx.font = fnt("mono", size); ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = i === 3 ? PAL.signal : PAL.ink;
      if (i === 3) { ctx.shadowColor = "rgba(75,225,160,0.6)"; ctx.shadowBlur = 34; }
      ctx.fillText(c, startX + i * gap, cy);
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    });
    const cp = easeOut(clamp01((t - win.start - 3.4) / 1.8));
    if (cp > 0) {
      ctx.strokeStyle = PAL.crimson; ctx.lineWidth = 12; ctx.globalAlpha = 0.94;
      ctx.lineCap = "round";
      handEllipse(ctx, W / 2 - 6, cy, 470, 155, 12, cp);
      ctx.globalAlpha = 1;
    }
    const wp = easeOut(clamp01((t - win.start - 5.4) / 1.3));
    if (wp > 0) {
      ctx.font = "italic bold 165px 'DejaVu Sans'"; ctx.fillStyle = PAL.crimson;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      const n = Math.max(1, Math.round(wp * 4));
      ctx.fillText("Wow!".slice(0, n), W * 0.105, cy + 250);
    }
    const b1 = buildIn(t, win.start + 7.2, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      displayBig(ctx, W / 2, H * 0.79 + b1.dy, "SIX CHARACTERS FROM DEEP SPACE", 48, PAL.dim, 8, "body");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H, "PRINTOUT CHARACTERS — WIKIMEDIA COMMONS (PD)");
  vignette2(ctx, W, H, 0.45); grain2(ctx, W, H, t);
}

// SC03 title — full sky, giant title, channel identity
export function SC03(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t * 0.5, { emptier: 0.15, horizon: 0.92 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.6, 0, 0.18, 0.7);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      ctx.strokeStyle = PAL.crimson; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(W / 2 - 170, H * 0.235 + b1.dy); ctx.lineTo(W / 2 + 170, H * 0.235 + b1.dy); ctx.stroke();
      displayBig(ctx, W / 2, H * 0.415 + b1.dy, "THE WOW! SIGNAL", TS.display, PAL.ink, 16);
      ctx.globalAlpha = 1;
    }
    const b2 = buildIn(t, win.start + 1.5, 1, 0.18, 0.7);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      displayBig(ctx, W / 2, H * 0.545 + b2.dy, "72 SECONDS FROM DEEP SPACE", 58, PAL.signal, 14);
      ctx.globalAlpha = 1;
    }
    const b3 = buildIn(t, win.start + 2.4, 2);
    if (b3.a > 0) {
      ctx.globalAlpha = b3.a;
      displayBig(ctx, W / 2, H * 0.66 + b3.dy, "A FILM FROM THE UNCLOSED FILE", 40, PAL.dim, 10, "body");
      ctx.globalAlpha = 1;
    }
  });
  vignette2(ctx, W, H, 0.4); grain2(ctx, W, H, t);
}

// SC04 Big Ear — hero panorama with big labelled parts
export function SC04(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.2, horizon: 0.94 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.5, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W * 0.5, H * 0.13 + b1.dy, "BIG EAR", TS.section + 6, PAL.ink, "center");
      label(ctx, W * 0.5, H * 0.19 + b1.dy, "Ohio State University Radio Observatory", 40, PAL.dim, "center");
      ctx.globalAlpha = 1;
    }
    // hero panorama — big
    const px = W * 0.07, py = H * 0.66, pw = W * 0.86;
    const ap = easeOut(clamp01((t - win.start - 1.2) / 2.4));
    if (ap > 0) {
      ctx.save(); ctx.globalAlpha = ap;
      bigEarPanorama(ctx, px, py, pw, 1);
      ctx.restore();
      // beam path glow from horns to sky
      const bp = easeOut(clamp01((t - win.start - 3.2) / 2.2));
      if (bp > 0) {
        ctx.save();
        ctx.globalAlpha = bp * 0.75;
        const g = ctx.createLinearGradient(W * 0.66, py - 60, W * 0.66, py - 480);
        g.addColorStop(0, "rgba(75,225,160,0.5)"); g.addColorStop(1, "rgba(75,225,160,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 16;
        ctx.beginPath(); ctx.moveTo(W * 0.66, py - 60); ctx.lineTo(W * 0.66, py - 470); ctx.stroke();
        ctx.restore();
      }
    }
    // labels with leader lines (staggered, 40px)
    const labels = [
      ["FLAT REFLECTOR", W * 0.30, H * 0.47, W * 0.335, H * 0.585],
      ["FIXED PARABOLOID", W * 0.74, H * 0.34, W * 0.72, H * 0.50],
      ["FEED HORNS", W * 0.845, H * 0.475, W * 0.715, H * 0.545],
      ["STEEL GROUND PLANE", W * 0.175, H * 0.80, W * 0.28, H * 0.725],
    ];
    labels.forEach(([txt, lx, ly, tx, ty], i) => {
      const b = buildIn(t, win.start + 4.2, i, 0.5, 0.5);
      if (b.a <= 0) return;
      ctx.globalAlpha = b.a;
      ctx.strokeStyle = "rgba(157,176,200,0.5)"; ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(lx, ly + b.dy); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = fnt("body", 40); ctx.fillStyle = PAL.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(txt, lx, ly + b.dy);
      ctx.globalAlpha = 1;
    });
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.42); grain2(ctx, W, H, t);
}

// SC05 sweep — full-frame sky swath, beam scans, clock numerals
export function SC05(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.35, horizon: 0.98, nebula: false });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.5, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.125 + b1.dy, "THE SKY SWEEPS — THE TELESCOPE NEVER MOVES", 64, PAL.ink, "center");
      ctx.globalAlpha = 1;
    }
    // giant swath band (declination strip) with drifting sky points
    const sy = H * 0.30, sh = H * 0.42;
    ctx.fillStyle = "rgba(10,18,38,0.55)"; ctx.fillRect(0, sy, W, sh);
    ctx.strokeStyle = "rgba(88,199,240,0.35)"; ctx.lineWidth = 3;
    ctx.strokeRect(0, sy, W, sh);
    const rnd = prng(55);
    for (let i = 0; i < 46; i++) {
      const x0 = rnd() * W, y0 = sy + 20 + rnd() * (sh - 40), s = 2 + rnd() * 3;
      const x = (x0 - t * 26) % W; const xx = x < 0 ? x + W : x;
      ctx.globalAlpha = 0.4 + rnd() * 0.5; ctx.fillStyle = "#cfe2ff";
      ctx.beginPath(); ctx.arc(xx, y0, s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // beam rectangle sweeping L->R (loops like the real 72s cycle)
    const cyc = ((t - win.start) % 8) / 8;
    const bx = W * 0.06 + cyc * W * 0.76, bw = W * 0.18;
    ctx.fillStyle = "rgba(75,225,160,0.14)"; ctx.fillRect(bx, sy, bw, sh);
    ctx.strokeStyle = PAL.signal; ctx.lineWidth = 5; ctx.strokeRect(bx, sy, bw, sh);
    // declination label + clock numeral
    label(ctx, W * 0.035, sy - 28, "DECLINATION STRIP +30° TO −50° (1950.0)", 38, PAL.dim);
    numeral(ctx, W / 2, H * 0.775, "72 SECONDS PER SKY POINT", 60, PAL.ink);
    // source dot exits the strip (story: source crosses and is gone)
    const dp = clamp01((t - win.start - 5) / 5);
    if (dp > 0 && dp < 1) {
      const dx = lerp(W * 0.62, W * 0.98, dp);
      ctx.fillStyle = PAL.starWarm; ctx.shadowColor = "rgba(255,233,201,0.8)"; ctx.shadowBlur = 22;
      ctx.beginPath(); ctx.arc(dx, sy + sh * 0.52, 7, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.4); grain2(ctx, W, H, t);
}

// SC06 survey numbers — PAPER world, three huge numeral cards
export function SC06(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 20 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W * 0.5, H * 0.155 + b1.dy, "A DECADE OF LISTENING", TS.section, PAL.inkPrint, "center");
      ctx.globalAlpha = 1;
    }
    const cards = [
      ["~20,000", "RADIO SOURCES CATALOGUED", PAL.inkPrint],
      ["2", "RECORD QUASARS FOUND", PAL.inkPrint],
      ["1972", "FUNDING CUT ORDERED", PAL.crimson],
    ];
    cards.forEach(([num, cap, col], i) => {
      const b = buildIn(t, win.start + 1.2, i, 0.55, 0.6);
      if (b.a <= 0) return;
      const cw = W * 0.26, chh = H * 0.42;
      const cx = W * (0.19 + i * 0.31), cy = H * 0.50 + b.dy;
      ctx.globalAlpha = b.a;
      // paper card with shadow
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate((i - 1) * 0.018);
      ctx.fillStyle = "rgba(30,20,10,0.45)"; ctx.fillRect(-cw / 2 + 14, -chh / 2 + 18, cw, chh);
      ctx.fillStyle = i === 2 ? "#f3ead2" : "#ece3cd"; ctx.fillRect(-cw / 2, -chh / 2, cw, chh);
      ctx.strokeStyle = "rgba(120,105,70,0.5)"; ctx.lineWidth = 3; ctx.strokeRect(-cw / 2, -chh / 2, cw, chh);
      ctx.fillStyle = "rgba(90,80,55,0.16)";
      ctx.fillRect(-cw / 2, -chh / 2, cw * 0.03, chh); ctx.fillRect(cw / 2 - cw * 0.03, -chh / 2, cw * 0.03, chh);
      numeral(ctx, 0, -chh * 0.08, num, TS.numeral + (num.length > 6 ? -18 : 6), col);
      ctx.font = fnt("body", 36); ctx.fillStyle = "#4a4436"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const words = cap.split(" ");
      const l1 = [], l2 = [];
      words.forEach((wd) => (l1.join(" ").length + wd.length < 18 ? l1 : l2).push(wd));
      ctx.fillText(l1.join(" "), 0, chh * 0.24);
      if (l2.length) ctx.fillText(l2.join(" "), 0, chh * 0.24 + 44);
      // red pen underline under numeral
      if (i === 2) {
        ctx.strokeStyle = PAL.penRed; ctx.lineWidth = 6; ctx.lineCap = "round";
        handStroke(ctx, [[-cw * 0.22, chh * 0.06], [cw * 0.2, chh * 0.05], [cw * 0.24, chh * 0.08]], 3, 8 + i, 1);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    });
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC07 narrowband machine — PAPER, big console schematic
export function SC07(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 22, seed: 41 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W * 0.5, H * 0.13 + b1.dy, "THE NARROWBAND SEARCH MACHINE", TS.section, PAL.inkPrint, "center");
      label(ctx, W * 0.5, H * 0.195 + b1.dy, "50 channels · IBM 1130-era computing · line printer", 40, "#5a5240", "center");
      ctx.globalAlpha = 1;
    }
    // hero: 50-channel cell board (10x5), cells light as "printer" walks
    const bx = W * 0.085, by = H * 0.28, bw = W * 0.83, bh = H * 0.44;
    ctx.save();
    ctx.translate(bx, by); ctx.rotate(0.006);
    ctx.fillStyle = "rgba(30,20,10,0.4)"; ctx.fillRect(10, 14, bw, bh);
    ctx.fillStyle = "#d9cfb2"; ctx.fillRect(0, 0, bw, bh);
    ctx.strokeStyle = "rgba(120,105,70,0.55)"; ctx.lineWidth = 3; ctx.strokeRect(0, 0, bw, bh);
    const cols = 10, rows = 5;
    const cw = bw / cols, chh = bh / rows;
    const walked = Math.floor(clamp01((t - win.start - 1.6) / 9) * cols * rows);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const on = idx < walked;
      const x = c * cw, y = r * chh;
      ctx.fillStyle = on ? "rgba(75,225,160,0.22)" : "rgba(60,54,40,0.10)";
      ctx.fillRect(x + 5, y + 5, cw - 10, chh - 10);
      ctx.strokeStyle = "rgba(90,80,55,0.4)"; ctx.lineWidth = 2;
      ctx.strokeRect(x + 5, y + 5, cw - 10, chh - 10);
      ctx.font = fnt("mono", 30); ctx.fillStyle = on ? "#1d4a38" : "rgba(70,64,48,0.75)";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(idx + 1).padStart(2, "0"), x + cw / 2, y + chh / 2);
    }
    ctx.restore();
    // printer walk label + row of printed glyphs
    const b2 = buildIn(t, win.start + 12, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      chipBig(ctx, W * 0.085, H * 0.775, "ONE CHARACTER PER ROW — EVERY 12 SECONDS", "#5a5240");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC08 printout columns — REAL SCAN right-hero + left text column
export function SC08(ctx, W, H, t, win, imgs) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 8, seed: 44 });
  withPush(ctx, W, H, sp, () => {
    if (imgs.printout_page) {
      const iw = imgs.printout_page.width, ih = imgs.printout_page.height;
      const dh = H * 0.82, dw = dh * (iw / ih);
      const dx = W - dw - 44, dy = H * 0.10;
      ctx.save();
      ctx.translate(W / 2, H / 2); ctx.rotate(0.008); ctx.translate(-W / 2, -H / 2);
      ctx.fillStyle = "rgba(20,12,6,0.55)"; ctx.fillRect(dx + 16, dy + 20, dw, dh);
      ctx.drawImage(imgs.printout_page, dx, dy, dw, dh);
      ctx.globalCompositeOperation = "multiply";
      const gg = ctx.createLinearGradient(0, dy, 0, dy + dh);
      gg.addColorStop(0, "rgba(235,242,250,0.35)"); gg.addColorStop(1, "rgba(205,220,240,0.4)");
      ctx.fillStyle = gg; ctx.fillRect(dx, dy, dw, dh);
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(88,199,240,0.4)"; ctx.lineWidth = 4; ctx.strokeRect(dx, dy, dw, dh);
      ctx.restore();
    }
    // left column: title + stacked facts (stays clear of caption band)
    const b1 = buildIn(t, win.start + 0.5, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W * 0.045, H * 0.22 + b1.dy, "THE RUN OF", 62, PAL.inkPrint);
      sectionTitle(ctx, W * 0.045, H * 0.30 + b1.dy, "AUGUST 15, 1977", 62, PAL.inkPrint);
      ctx.globalAlpha = 1;
    }
    const b2 = buildIn(t, win.start + 1.8, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      numeral(ctx, W * 0.045 + 210, H * 0.425 + b2.dy, "11:16 P.M.", 76, "#8a2f22");
      ctx.globalAlpha = 1;
    }
    const b3 = buildIn(t, win.start + 2.8, 2);
    if (b3.a > 0) {
      ctx.globalAlpha = b3.a;
      label(ctx, W * 0.045, H * 0.53 + b3.dy, "Two feed horns alternate rows", 40, "#33302a");
      label(ctx, W * 0.045, H * 0.585 + b3.dy, "A/B/A/B — 50 channels of sky", 40, "#5a5240");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H, "ARCHIVAL PRINTOUT — WIKIMEDIA COMMONS (PD)");
  vignette2(ctx, W, H, 0.44); grain2(ctx, W, H, t);
}

// SC09 the six rows — scan close-up + highlight ladder (hero = zoomed rows)
export function SC09(ctx, W, H, t, win, imgs) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.7, nebula: false });
  withPush(ctx, W, H, sp, () => {
    if (imgs.printout_close) {
      // zoom hard into the close scan (the six rows region)
      const iw = imgs.printout_close.width, ih = imgs.printout_close.height;
      const dh = H * 0.86, dw = dh * (iw / ih);
      const dx = W / 2 - dw / 2, dy = H * 0.10;
      ctx.fillStyle = "rgba(15,10,5,0.6)"; ctx.fillRect(dx + 18, dy + 22, dw, dh);
      ctx.drawImage(imgs.printout_close, dx, dy, dw, dh);
      ctx.globalCompositeOperation = "multiply";
      const gg = ctx.createLinearGradient(0, dy, 0, dy + dh);
      gg.addColorStop(0, "rgba(238,244,252,0.32)"); gg.addColorStop(1, "rgba(200,216,238,0.42)");
      ctx.fillStyle = gg; ctx.fillRect(dx, dy, dw, dh);
      ctx.globalCompositeOperation = "source-over";
      // highlight ladder: rows 6 E Q U J 5 build one by one with SNR bars
      const rows = ["6", "E", "Q", "U", "J", "5"];
      const vals = [6, 14, 24, 30, 17, 5];
      const rh = dh / 6;
      rows.forEach((ch, i) => {
        const a = easeOut(clamp01((t - win.start - 1.4 - i * 1.15) / 0.5));
        if (a <= 0) return;
        ctx.globalAlpha = a * 0.30; ctx.fillStyle = PAL.signal;
        ctx.fillRect(dx + 6, dy + i * rh + 4, dw - 12, rh - 8);
        ctx.globalAlpha = a;
        ctx.font = fnt("mono", Math.min(72, rh * 0.62)); ctx.fillStyle = i === 3 ? "#0d5c3f" : "#1d2430";
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(ch, dx + dw - 190, dy + i * rh + rh / 2);
        // SNR bar
        const bw = (vals[i] / 32) * dw * 0.5;
        ctx.fillStyle = "rgba(40,60,90,0.75)";
        ctx.fillRect(dx + 40, dy + i * rh + rh - 26, bw, 12);
        ctx.globalAlpha = 1;
      });
      ctx.strokeStyle = "rgba(88,199,240,0.45)"; ctx.lineWidth = 4; ctx.strokeRect(dx, dy, dw, dh);
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H, "CHANNEL 2 — SIX ROWS · SCAN — WIKIMEDIA COMMONS (PD)");
  vignette2(ctx, W, H, 0.42); grain2(ctx, W, H, t);
}

// SC10 intensity scale — PAPER, giant vertical scale
export function SC10(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 14, seed: 47 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W * 0.5, H * 0.13 + b1.dy, "WHAT 'U' MEANS", TS.section, PAL.inkPrint, "center");
      ctx.globalAlpha = 1;
    }
    // hero vertical scale 0..35
    const sx = W * 0.16, sy = H * 0.22, shh = H * 0.62, sw = 26;
    const steps = 35;
    const drawn = Math.floor(clamp01((t - win.start - 1) / 4.5) * steps);
    ctx.strokeStyle = "rgba(70,64,48,0.7)"; ctx.lineWidth = sw;
    ctx.beginPath(); ctx.moveTo(sx, sy + shh); ctx.lineTo(sx, sy + shh - (shh * drawn / steps)); ctx.stroke();
    for (let i = 0; i <= drawn; i += 5) {
      const yy = sy + shh - (shh * i / steps);
      ctx.strokeStyle = "rgba(70,64,48,0.7)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(sx - 18, yy); ctx.lineTo(sx + 18, yy); ctx.stroke();
      ctx.font = fnt("body", 36); ctx.fillStyle = "#4a4436"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(String(i), sx - 34, yy);
    }
    // letter zone A..Z band (10..30)
    const za = sy + shh - (shh * 30 / steps), zb = sy + shh - (shh * 10 / steps);
    ctx.fillStyle = "rgba(75,225,160,0.16)"; ctx.fillRect(sx + 22, za, sx * 0.9, zb - za);
    ctx.strokeStyle = PAL.signal; ctx.lineWidth = 4; ctx.strokeRect(sx + 22, za, sx * 0.9, zb - za);
    label(ctx, sx + 46, za + 52, "LETTER ZONE — 10σ TO 30σ", 38, "#1d5c44");
    // U ring at 30
    const a30 = clamp01((t - win.start - 5.5) / 1.2);
    if (a30 > 0) {
      ctx.globalAlpha = a30;
      const uy = sy + shh - (shh * 30 / steps);
      ctx.strokeStyle = PAL.crimson; ctx.lineWidth = 10; ctx.lineCap = "round";
      handEllipse(ctx, sx + 46, uy, 56, 34, 21, a30);
      numeral(ctx, sx + 46, uy, "U", 64, PAL.crimson);
      ctx.globalAlpha = 1;
    }
    // right side explanation card
    const b2 = buildIn(t, win.start + 6.4, 1);
    if (b2.a > 0) {
      const cw = W * 0.34, chh = H * 0.4, cx = W * 0.72, cy = H * 0.46 + b2.dy;
      ctx.globalAlpha = b2.a;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.012);
      ctx.fillStyle = "rgba(25,16,8,0.4)"; ctx.fillRect(-cw / 2 + 12, -chh / 2 + 14, cw, chh);
      ctx.fillStyle = "#f0e8d0"; ctx.fillRect(-cw / 2, -chh / 2, cw, chh);
      ctx.strokeStyle = "rgba(120,105,70,0.5)"; ctx.lineWidth = 3; ctx.strokeRect(-cw / 2, -chh / 2, cw, chh);
      ctx.font = fnt("body", 40); ctx.fillStyle = "#33302a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("PEAK: 30σ ± 0.5σ", 0, -chh * 0.30);
      ctx.font = fnt("body", 36); ctx.fillStyle = "#4a4436";
      ctx.fillText("Most background is the", 0, -chh * 0.08);
      ctx.fillText("receiver's own hiss — the", 0, -chh * 0.08 + 44);
      ctx.fillText("galaxy and the afterglow", 0, -chh * 0.08 + 88);
      ctx.fillText("of the Big Bang.", 0, -chh * 0.08 + 132);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC11 arch shape — SKY, full-frame fitted arch + myth-bust chips
export function SC11(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.3, horizon: 0.94 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.13 + b1.dy, "THE SHAPE OF A REAL TRANSIT", TS.section, PAL.ink, "center");
      ctx.globalAlpha = 1;
    }
    // hero arch
    const ap = easeOut(clamp01((t - win.start - 1) / 5));
    if (ap > 0) {
      ctx.save();
      ctx.strokeStyle = PAL.signal; ctx.lineWidth = 8;
      ctx.shadowColor = "rgba(75,225,160,0.5)"; ctx.shadowBlur = 24;
      ctx.beginPath();
      const x0 = W * 0.10, w0 = W * 0.80, y0 = H * 0.70, h0 = H * 0.34, N = 120;
      for (let i = 0; i <= N * ap; i++) {
        const x01 = i / N;
        const yv = Math.exp(-Math.pow((x01 - 0.5) / 0.235, 2) / 2) * h0;
        i === 0 ? ctx.moveTo(x0 + x01 * w0, y0 - yv) : ctx.lineTo(x0 + x01 * w0, y0 - yv);
      }
      ctx.stroke(); ctx.restore();
      // half-power annotations
      const b2 = buildIn(t, win.start + 6, 0);
      if (b2.a > 0) {
        ctx.globalAlpha = b2.a;
        ctx.strokeStyle = "rgba(224,179,76,0.8)"; ctx.lineWidth = 4; ctx.setLineDash([12, 10]);
        ctx.beginPath(); ctx.moveTo(x0 + w0 * 0.265, y0 - h0 * 0.5); ctx.lineTo(x0 + w0 * 0.735, y0 - h0 * 0.5); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = fnt("body", 38); ctx.fillStyle = PAL.warn; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("FULL WIDTH ≈ 37 s", W / 2, y0 - h0 * 0.5 - 30);
        ctx.globalAlpha = 1;
      }
    }
    // myth-bust chips
    const chips = [["FULL WINDOW: 72 s", win.start + 8.2], ["RISE 36 s → PEAK → FALL", win.start + 9.2], ["NOT A SQUARE PULSE", win.start + 10.2]];
    chips.forEach(([txt, t0], i) => {
      const b = buildIn(t, t0, 0, 0, 0.5);
      if (b.a <= 0) return;
      ctx.globalAlpha = b.a;
      ctx.font = fnt("body", 40);
      const wch = ctx.measureText(txt).width + 56;
      chipBig(ctx, W * (0.115 + i * 0.30), H * 0.775, txt, PAL.dim);
      ctx.globalAlpha = 1;
    });
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.42); grain2(ctx, W, H, t);
}

// SC12 two horns — SKY, two beam silhouettes, onehorn-only verdict
export function SC12(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.35, horizon: 0.9 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.13 + b1.dy, "ONE HORN ONLY", TS.section + 8, PAL.ink, "center");
      ctx.globalAlpha = 1;
    }
    // two horns as big beam cones
    const horns = [
      { cx: W * 0.30, live: true, tag: "HORN A — SIGNAL", t0: win.start + 1.4 },
      { cx: W * 0.70, live: false, tag: "HORN B — EMPTY · NOTHING CAME BACK", t0: win.start + 3.2 },
    ];
    horns.forEach((hn, i) => {
      const b = buildIn(t, hn.t0, 0, 0, 0.7);
      if (b.a <= 0) return;
      ctx.globalAlpha = b.a;
      const top = H * 0.26, bot = H * 0.70, hw = W * 0.14;
      const g = ctx.createLinearGradient(hn.cx, top, hn.cx, bot);
      if (hn.live) { g.addColorStop(0, "rgba(75,225,160,0.55)"); g.addColorStop(1, "rgba(75,225,160,0.03)"); }
      else { g.addColorStop(0, "rgba(88,199,240,0.20)"); g.addColorStop(1, "rgba(88,199,240,0.02)"); }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(hn.cx - hw * 0.22, top); ctx.lineTo(hn.cx + hw * 0.22, top);
      ctx.lineTo(hn.cx + hw, bot); ctx.lineTo(hn.cx - hw, bot);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = hn.live ? PAL.signal : "rgba(88,199,240,0.5)";
      ctx.lineWidth = 4; ctx.stroke();
      // feed box
      ctx.fillStyle = hn.live ? "rgba(75,225,160,0.85)" : "rgba(88,199,240,0.45)";
      ctx.fillRect(hn.cx - hw * 0.3, top - 34, hw * 0.6, 34);
      label(ctx, hn.cx, H * 0.725, hn.tag, 40, hn.live ? PAL.signal : PAL.dim, "center");
      ctx.globalAlpha = 1;
    });
    // +5min clock verdict (above caption band)
    const b2 = buildIn(t, win.start + 5.4, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      numeral(ctx, W / 2, H * 0.78, "+5 MINUTES — SAME PATCH OF SKY: NOTHING", 48, PAL.warn);
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.42); grain2(ctx, W, H, t);
}
