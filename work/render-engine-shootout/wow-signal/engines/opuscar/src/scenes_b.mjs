// scenes_b.mjs — SC13..SC24 v2 ("PAPER & SKY"). Ehman + the circle (PAPER/scan),
// sky map (SKY), watering hole + frequency story (PAPER), decades of silence (SKY, emptier).
import { fnt, prng, easeOut, clamp01, lerp } from "./support.mjs";
import { PAL, TS, skyBase, paperBase, gradeArchival, withPush, buildIn, displayBig,
         sectionTitle, label, numeral, chipBig, signalBar, coordChip, grain2,
         vignette2, recon2, channelMark, handStroke, handEllipse, sprog } from "./support2.mjs";

// SC13 Ehman context — PAPER typographic card, big
export function SC13(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 16, seed: 51 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.20 + b1.dy, "JERRY R. EHMAN", TS.section + 10, PAL.inkPrint, "center");
      label(ctx, W / 2, H * 0.275 + b1.dy, "Radio astronomer · Ohio State University", 42, "#5a5240", "center");
      ctx.globalAlpha = 1;
    }
    // printout stack motif (hero-left) + review routine (hero-right)
    const b2 = buildIn(t, win.start + 1.2, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      // stack of pages
      for (let i = 4; i >= 0; i--) {
        const sx = W * 0.30 + i * 10, sy = H * 0.46 + i * 12;
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.03 + i * 0.015);
        ctx.fillStyle = "#e9e0c8"; ctx.fillRect(-W * 0.11, -H * 0.14, W * 0.22, H * 0.28);
        ctx.strokeStyle = "rgba(120,105,70,0.55)"; ctx.lineWidth = 3;
        ctx.strokeRect(-W * 0.11, -H * 0.14, W * 0.22, H * 0.28);
        ctx.fillStyle = "rgba(46,42,34,0.5)";
        for (let r = 0; r < 7; r++) ctx.fillRect(-W * 0.09, -H * 0.11 + r * H * 0.036, W * (0.1 + ((r * 7 + i) % 3) * 0.03), 5);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    const b3 = buildIn(t, win.start + 2.2, 2);
    if (b3.a > 0) {
      ctx.globalAlpha = b3.a;
      // review routine rows: highlight one
      const rx = W * 0.52, ry = H * 0.40, rw = W * 0.34;
      for (let r = 0; r < 5; r++) {
        const hi = r === 2 && clamp01((t - win.start - 3) / 0.4) >= 1;
        ctx.fillStyle = hi ? "rgba(75,225,160,0.30)" : "rgba(60,54,40,0.10)";
        ctx.fillRect(rx, ry + r * 58, rw, 50);
        ctx.strokeStyle = "rgba(90,80,55,0.45)"; ctx.lineWidth = 2;
        ctx.strokeRect(rx, ry + r * 58, rw, 50);
        ctx.font = fnt("mono", 32); ctx.fillStyle = "#3a352b";
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(["ROW 41 — SCAN", "ROW 42 — SCAN", "ROW 43 — 6EQUJ5", "ROW 44 — SCAN", "ROW 45 — SCAN"][r], rx + 20, ry + r * 58 + 25);
      }
      label(ctx, rx, ry + 5 * 58 + 46, "EVERY FEW DAYS — REVIEW PAGE BY PAGE", 36, "#5a5240");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC14 the circle — REAL SCAN full-bleed + red pen circle + Wow! writes (THE moment)
export function SC14(ctx, W, H, t, win, imgs) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.8, nebula: false });
  withPush(ctx, W, H, sp, () => {
    if (imgs.printout_close) {
      const iw = imgs.printout_close.width, ih = imgs.printout_close.height;
      const dh = H * 0.94, dw = dh * (iw / ih);
      const dx = W / 2 - dw / 2, dy = H * 0.035;
      ctx.fillStyle = "rgba(15,10,5,0.6)"; ctx.fillRect(dx + 20, dy + 24, dw, dh);
      ctx.drawImage(imgs.printout_close, dx, dy, dw, dh);
      ctx.globalCompositeOperation = "multiply";
      const gg = ctx.createLinearGradient(0, dy, 0, dy + dh);
      gg.addColorStop(0, "rgba(240,245,252,0.30)"); gg.addColorStop(1, "rgba(198,214,236,0.44)");
      ctx.fillStyle = gg; ctx.fillRect(dx, dy, dw, dh);
      ctx.globalCompositeOperation = "source-over";
      // red pen circle draws around the six-character arch (center of scan)
      const cp = easeOut(clamp01((t - win.start - 1.6) / 2.2));
      if (cp > 0) {
        ctx.strokeStyle = PAL.penRed; ctx.lineWidth = 14; ctx.globalAlpha = 0.95; ctx.lineCap = "round";
        handEllipse(ctx, dx + dw * 0.52, dy + dh * 0.42, dw * 0.13, dh * 0.24, 33, cp, -0.08);
        ctx.globalAlpha = 1;
      }
      // Wow! margin note writes on
      const wp = easeOut(clamp01((t - win.start - 4) / 1.5));
      if (wp > 0) {
        ctx.font = "italic bold 120px 'DejaVu Sans'"; ctx.fillStyle = PAL.penRed;
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.globalAlpha = 0.95;
        ctx.fillText("Wow!".slice(0, Math.max(1, Math.round(wp * 4))), dx + dw + 40, dy + dh * 0.38);
        ctx.globalAlpha = 1;
      }
      // date chip
      const b1 = buildIn(t, win.start + 6, 0);
      if (b1.a > 0) {
        ctx.globalAlpha = b1.a;
        chipBig(ctx, dx + dw + 40, dy + dh * 0.5, "AUGUST 19, 1977", PAL.dim);
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = "rgba(88,199,240,0.35)"; ctx.lineWidth = 4; ctx.strokeRect(dx, dy, dw, dh);
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H, "THE PRINTOUT — WIKIMEDIA COMMONS (PD)");
  vignette2(ctx, W, H, 0.4); grain2(ctx, W, H, t);
}

// SC15 name sticks — scan holds; later rows return empty (scroll effect)
export function SC15(ctx, W, H, t, win, imgs) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 6, seed: 57 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.125 + b1.dy, "HE CHECKED THE REST FIRST", TS.section, PAL.inkPrint, "center");
      label(ctx, W / 2, H * 0.19 + b1.dy, "Did the annotation appear again on later rows? No.", 42, "#5a5240", "center");
      ctx.globalAlpha = 1;
    }
    // scrolling empty rows (hero): rows stream upward, all empty
    const bx = W * 0.20, by = H * 0.26, bw = W * 0.60, bh = H * 0.50;
    ctx.save();
    ctx.translate(bx, by); ctx.rotate(0.008);
    ctx.fillStyle = "#e9e0c8"; ctx.fillRect(0, 0, bw, bh);
    ctx.strokeStyle = "rgba(120,105,70,0.5)"; ctx.lineWidth = 3; ctx.strokeRect(0, 0, bw, bh);
    ctx.fillStyle = "rgba(90,80,55,0.14)";
    ctx.fillRect(0, 0, bw * 0.03, bh); ctx.fillRect(bw * 0.97, 0, bw * 0.03, bh);
    ctx.font = fnt("mono", 34);
    const rows = ["1 1 1 2 3 1 1 1 1 1 1", "1 2 1 1 1 1 1 1 1 1 1", "1 1 1 1 2 1 1 1 1 1 1", "1 1 1 1 1 1 1 1 1 1 1", "1 1 1 1 1 1 1 2 1 1 1", "1 1 1 1 1 1 1 1 1 1 1"];
    const off = (t * 26) % 96;
    ctx.fillStyle = "rgba(46,42,34,0.55)"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    for (let r = 0; r < 9; r++) {
      const yy = bh - 20 - ((r * 96 + off) % (bh - 40));
      ctx.fillText(rows[r % rows.length], 30, yy);
    }
    ctx.restore();
    // verdict chips
    const chips = [["NOT REPEATED ON ANY LATER ROW", win.start + 3.4], ["THE CIRCLE STANDS ALONE", win.start + 6.4]];
    chips.forEach(([txt, t0], i) => {
      const b = buildIn(t, t0, 0, 0, 0.5);
      if (b.a <= 0) return;
      ctx.globalAlpha = b.a;
      chipBig(ctx, W * (0.14 + i * 0.36), H * 0.775, txt, i === 0 ? "#8a2f22" : "#4a4436");
      ctx.globalAlpha = 1;
    });
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC16 sky coordinates — SKY, full-frame Sagittarius star map + coordinates
export function SC16(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.2, horizon: 0.96 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.125 + b1.dy, "WHERE THE SKY WAS", TS.section, PAL.ink, "center");
      ctx.globalAlpha = 1;
    }
    // Sagittarius star map (hero): constellation lines + marker
    const rnd = prng(77);
    const mx = W * 0.60, my = H * 0.52, mr = H * 0.34;
    for (let i = 0; i < 60; i++) {
      const a = rnd() * Math.PI * 2, rr = rnd() * mr;
      const x = mx + Math.cos(a) * rr, y = my + Math.sin(a) * rr * 0.8;
      ctx.globalAlpha = 0.3 + rnd() * 0.6;
      ctx.fillStyle = rnd() > 0.85 ? PAL.starWarm : "#d8e6ff";
      ctx.beginPath(); ctx.arc(x, y, 1.6 + rnd() * 2.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // teapot asterism lines
    const pts = [[-0.32, 0.10], [-0.10, -0.18], [0.16, -0.10], [0.28, 0.12], [0.05, 0.24], [-0.20, 0.22], [-0.32, 0.10]];
    const lp = easeOut(clamp01((t - win.start - 1.4) / 2.5));
    ctx.strokeStyle = "rgba(88,199,240,0.55)"; ctx.lineWidth = 3;
    ctx.beginPath();
    const upto = Math.max(2, Math.round(pts.length * lp));
    for (let i = 0; i < upto; i++) {
      const [px, py] = pts[i];
      i === 0 ? ctx.moveTo(mx + px * mr, my + py * mr) : ctx.lineTo(mx + px * mr, my + py * mr);
    }
    ctx.stroke();
    for (let i = 0; i < Math.min(upto, pts.length - 1); i++) {
      const [px, py] = pts[i];
      ctx.fillStyle = "#ffffff"; ctx.shadowColor = "rgba(255,255,255,0.9)"; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(mx + px * mr, my + py * mr, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    // the signal position marker
    const mp = clamp01((t - win.start - 4.4) / 1.4);
    if (mp > 0) {
      ctx.globalAlpha = mp;
      const px2 = mx - 0.02 * mr, py2 = my + 0.02 * mr;
      ctx.strokeStyle = PAL.signal; ctx.lineWidth = 6; ctx.lineCap = "round";
      handEllipse(ctx, px2, py2, 30, 22, 41, mp);
      ctx.strokeStyle = "rgba(75,225,160,0.6)"; ctx.lineWidth = 3;
      handEllipse(ctx, px2, py2, 30 + 34 * (0.4 + 0.6 * ((t * 0.7) % 1)), 22 + 24 * (0.4 + 0.6 * ((t * 0.7) % 1)), 43, 1);
      label(ctx, px2 + 52, py2 - 14, "WOW! SOURCE", 40, PAL.signal);
      ctx.globalAlpha = 1;
    }
    // coordinates card (hero-left)
    const b2 = buildIn(t, win.start + 1, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      coordChip(ctx, W * 0.055, H * 0.28, ["R.A.  19h 22m 25s ± 10s", "DEC.  −27° 03′ ± 20′", "EPOCH 1950.0"], 44);
      ctx.globalAlpha = 1;
    }
    label(ctx, W * 0.055, H * 0.62, "TOWARD THE CENTER OF THE MILKY WAY · SAGITTARIUS", 38, PAL.dim);
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.4); grain2(ctx, W, H, t);
}

// SC17 watering hole — PAPER, 1959 Morrison-Cocconi + hydrogen line diagram
export function SC17(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 12, seed: 61 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.135 + b1.dy, "1959 — A NATURAL MEETING FREQUENCY", TS.section, PAL.inkPrint, "center");
      label(ctx, W / 2, H * 0.20 + b1.dy, "Giuseppe Cocconi · Philip Morrison — where would civilization listen?", 40, "#5a5240", "center");
      ctx.globalAlpha = 1;
    }
    // hero: hydrogen line diagram (rotated frame — orbit + electron)
    const cx = W * 0.5, cy = H * 0.50;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(-0.30);
    ctx.strokeStyle = "#3a352b"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(0, 0, 150, 62, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#3a352b";
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
    const oa = (t * 0.9) % (Math.PI * 2);
    ctx.fillStyle = "#5a5240";
    ctx.beginPath(); ctx.arc(Math.cos(oa) * 150, Math.sin(oa) * 62, 11, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // spin-flip arrow
    const a2 = clamp01((t - win.start - 2) / 1.2);
    if (a2 > 0) {
      ctx.strokeStyle = PAL.crimson; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.globalAlpha = a2;
      ctx.beginPath(); ctx.arc(cx + 40, cy - 30, 34, -0.6, 2.2); ctx.stroke();
      ctx.fillStyle = PAL.crimson;
      ctx.beginPath(); ctx.moveTo(cx + 74, cy - 46); ctx.lineTo(cx + 58, cy - 58); ctx.lineTo(cx + 66, cy - 34); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // 1420 MHz numeral + watering hole band
    const b2 = buildIn(t, win.start + 3.2, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      numeral(ctx, cx, H * 0.735, "1420 MEGAHERTZ", TS.numeral - 12, "#1d5c44");
      label(ctx, cx, H * 0.80, "THE WATERING HOLE — THE 21-CENTIMETER LINE OF HYDROGEN", 40, "#4a4436", "center");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC18 frequency offset — PAPER, spectrum bar with markers
export function SC18(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 10, seed: 63 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.135 + b1.dy, "ALMOST — BUT NOT EXACTLY — THE HYDROGEN LINE", 62, PAL.inkPrint, "center");
      ctx.globalAlpha = 1;
    }
    // hero spectrum bar
    const bx = W * 0.10, bw = W * 0.80, by = H * 0.44, bh = 34;
    const segs = [["1420.4058", 0.0, "HYDROGEN LINE", "#1d5c44"], ["1420.4556", 0.72, "WOW! SIGNAL", "#8a2f22"]];
    ctx.fillStyle = "rgba(60,54,40,0.12)"; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "rgba(70,64,48,0.6)"; ctx.lineWidth = 3; ctx.strokeRect(bx, by, bw, bh);
    // zoom window between the two markers (frequencies are 50kHz apart; bar shows the gap)
    segs.forEach(([freq, frac, tag, col], i) => {
      const a = easeOut(clamp01((t - win.start - 1.4 - i * 1.8) / 0.6));
      if (a <= 0) return;
      const mx = bx + bw * (0.08 + frac * 0.84);
      ctx.globalAlpha = a;
      ctx.strokeStyle = col; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(mx, by - 70); ctx.lineTo(mx, by + bh + 12); ctx.stroke();
      ctx.font = fnt("mono", 44); ctx.fillStyle = col;
      ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.fillText(freq, mx, by - 92);
      ctx.font = fnt("body", 36);
      ctx.fillText(tag, mx, by + bh + 56);
      ctx.globalAlpha = 1;
    });
    // offset bracket + blueshift note
    const b2 = buildIn(t, win.start + 5.2, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      const mx0 = bx + bw * 0.08, mx1 = bx + bw * (0.08 + 0.72 * 0.84);
      ctx.strokeStyle = "#5a5240"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(mx0, by + bh + 96); ctx.lineTo(mx0, by + bh + 122); ctx.lineTo(mx1, by + bh + 122); ctx.lineTo(mx1, by + bh + 96); ctx.stroke();
      ctx.font = fnt("body", 40); ctx.fillStyle = "#3a352b"; ctx.textAlign = "center";
      ctx.fillText("≈ 50 KILOHERTZ  →  ≈ 10 KM/S TOWARD EARTH", W / 2, by + bh + 178);
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC19 paperwork story — PAPER, LO typo with strike-through corrections
export function SC19(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 14, seed: 67 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.135 + b1.dy, "EVEN THE NUMBER HAS A STORY", TS.section, PAL.inkPrint, "center");
      label(ctx, W / 2, H * 0.20 + b1.dy, "The local oscillator was delivered 100 kHz off", 40, "#5a5240", "center");
      ctx.globalAlpha = 1;
    }
    // hero: ledger rows with ordered/delivered/corrected
    const rows = [
      ["LOCAL OSCILLATOR — ORDERED", "1450.4056 MHz", false],
      ["LOCAL OSCILLATOR — DELIVERED", "1450.5056 MHz", true],
      ["EHMAN'S 1979 CALCULATION", "CORRECTED", false],
      ["KRAUS'S 1995 SUMMARY FOR SAGAN", "UNCORRECTED", true],
    ];
    const bx = W * 0.14, by = H * 0.32, bw = W * 0.72, rh = 74;
    rows.forEach(([k, v, strike], i) => {
      const a = easeOut(clamp01((t - win.start - 1.2 - i * 1.3) / 0.5));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      ctx.fillStyle = i % 2 ? "rgba(60,54,40,0.08)" : "rgba(60,54,40,0.14)";
      ctx.fillRect(bx, by + i * rh, bw, rh - 8);
      ctx.font = fnt("body", 36); ctx.fillStyle = "#33302a"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(k, bx + 28, by + i * rh + (rh - 8) / 2);
      ctx.font = fnt("mono", 40);
      ctx.fillStyle = strike ? "#8a2f22" : "#1d5c44"; ctx.textAlign = "right";
      ctx.fillText(v, bx + bw - 28, by + i * rh + (rh - 8) / 2);
      if (strike) {
        ctx.strokeStyle = PAL.penRed; ctx.lineWidth = 6; ctx.lineCap = "round";
        const vw = ctx.measureText(v).width;
        handStroke(ctx, [[bx + bw - 28 - vw, by + i * rh + (rh - 8) / 2 + 4], [bx + bw - 28, by + i * rh + (rh - 8) / 2 - 2]], 3, 70 + i, 1);
      }
      ctx.globalAlpha = 1;
    });
    const b2 = buildIn(t, win.start + 7.4, 2);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      displayBig(ctx, W / 2, H * 0.775, "TWO VALUES IN THE LITERATURE — ONE KNOB", 40, "#4a4436", 4, "body");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC20 narrow vs wide — PAPER, comparison bars
export function SC20(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 12, seed: 71 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.135 + b1.dy, "NARROWNESS IS WHAT TECHNOLOGY DOES", 62, PAL.inkPrint, "center");
      ctx.globalAlpha = 1;
    }
    // hero bars: broadband vs narrowband
    const bx = W * 0.10, bw = W * 0.80, y1 = H * 0.34, y2 = H * 0.56, bh = 56;
    const g1 = easeOut(clamp01((t - win.start - 1.2) / 1.4));
    if (g1 > 0) {
      ctx.globalAlpha = g1;
      ctx.fillStyle = "rgba(60,54,40,0.30)"; ctx.fillRect(bx, y1, bw * g1, bh);
      ctx.font = fnt("body", 38); ctx.fillStyle = "#33302a"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("NATURAL RADIO SOURCES — BROADBAND (PULSARS · QUASARS · GALAXIES)", bx, y1 - 26);
      ctx.globalAlpha = 1;
    }
    const g2 = easeOut(clamp01((t - win.start - 2.8) / 1.2));
    if (g2 > 0) {
      ctx.globalAlpha = g2;
      ctx.fillStyle = "rgba(29,92,68,0.55)";
      const nw = 26;
      ctx.fillRect(bx + bw * 0.5 - nw / 2, y2, nw * g2, bh);
      ctx.font = fnt("body", 38); ctx.fillStyle = "#1d5c44"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("THE WOW! SIGNAL — ONE 10-KILOHERTZ CHANNEL", bx, y2 - 26);
      ctx.globalAlpha = 1;
    }
    const b2 = buildIn(t, win.start + 4.4, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      numeral(ctx, W / 2, H * 0.78, "AND YET — NOTHING TECHNOLOGICAL WAS THERE TO DO IT", 44, "#33302a");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}

// SC21 look again — SKY, empty sweep cards + NOT REPOINTABLE
export function SC21(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.45, horizon: 0.92 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.135 + b1.dy, "THE FIRST FOLLOW-UP: LOOK AGAIN", TS.section, PAL.ink, "center");
      ctx.globalAlpha = 1;
    }
    // three empty sweep cards
    for (let i = 0; i < 3; i++) {
      const a = easeOut(clamp01((t - win.start - 1.2 - i * 0.8) / 0.5));
      if (a <= 0) continue;
      ctx.globalAlpha = a;
      const cw = W * 0.24, chh = H * 0.36;
      const cx = W * (0.22 + i * 0.28), cy = H * 0.44;
      ctx.fillStyle = "rgba(10,18,38,0.7)"; ctx.fillRect(cx - cw / 2, cy - chh / 2, cw, chh);
      ctx.strokeStyle = "rgba(88,199,240,0.4)"; ctx.lineWidth = 3;
      ctx.strokeRect(cx - cw / 2, cy - chh / 2, cw, chh);
      // tiny empty swath rows
      ctx.fillStyle = "rgba(88,199,240,0.10)";
      for (let r = 0; r < 6; r++) ctx.fillRect(cx - cw / 2 + 18, cy - chh / 2 + 20 + r * (chh / 6), cw - 36, 8);
      ctx.font = fnt("body", 36); ctx.fillStyle = PAL.dim; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("SWEEP " + (i + 1), cx, cy + chh / 2 + 40);
      ctx.fillStyle = PAL.warn; ctx.font = fnt("body", 40);
      ctx.fillText("NULL", cx, cy);
      ctx.globalAlpha = 1;
    }
    const b2 = buildIn(t, win.start + 4.4, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      numeral(ctx, W / 2, H * 0.735, "BIG EAR COULD NEVER BE REPOINTED", 52, PAL.ink);
      displayBig(ctx, W / 2, H * 0.795, "THE SKY ONLY PASSES — ONCE PER DAY, UNDER THE SAME BEAM", 38, PAL.dim, 4, "body");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.44); grain2(ctx, W, H, t);
}

// SC22 decades of silence — SKY emptier, 1987→1999 timeline, NULL stamps
export function SC22(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.6, horizon: 0.9, nebula: false });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.135 + b1.dy, "DECADES OF BETTER INSTRUMENTS", TS.section, PAL.ink, "center");
      label(ctx, W / 2, H * 0.205 + b1.dy, "Every instrument that could hear it — heard nothing", 40, PAL.dim, "center");
      ctx.globalAlpha = 1;
    }
    const rows = [
      ["1987 - 1989", "META ARRAY — OAK RIDGE (GRAY)", "NULL"],
      ["1995", "GREEN BANK 35-m SNIFTING SCAN (SHOSTAK)", "NULL"],
      ["1995 - 1996", "VERY LARGE ARRAY (GRAY)", "NULL"],
      ["1999", "MOUNT PLEASANT 26-m, TASMANIA", "NULL"],
    ];
    const bx = W * 0.10, bw = W * 0.80, rh = 82, y0 = H * 0.30;
    ctx.strokeStyle = "rgba(88,199,240,0.30)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(bx, y0 + rh * rows.length / 2); ctx.lineTo(bx + bw, y0 + rh * rows.length / 2); ctx.stroke();
    rows.forEach(([yr, what, verdict], i) => {
      const a = easeOut(clamp01((t - win.start - 1.4 - i * 1.5) / 0.55));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      const yy = y0 + i * rh + rh / 2;
      ctx.font = fnt("mono", 44); ctx.fillStyle = PAL.cyan; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(yr, bx, yy);
      ctx.font = fnt("body", 36); ctx.fillStyle = PAL.ink; ctx.textAlign = "left";
      ctx.fillText(what, bx + 260, yy);
      // NULL stamp (rotated red)
      ctx.save();
      ctx.translate(bx + bw - 90, yy); ctx.rotate(-0.10);
      ctx.strokeStyle = "rgba(192,57,43,0.9)"; ctx.lineWidth = 5;
      ctx.strokeRect(-84, -32, 168, 64);
      ctx.font = fnt("title", 42); ctx.fillStyle = "rgba(192,57,43,0.95)"; ctx.textAlign = "center";
      ctx.fillText("NULL", 0, 2);
      ctx.restore();
      ctx.globalAlpha = 1;
    });
    const b2 = buildIn(t, win.start + 8.4, 2);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      displayBig(ctx, W / 2, H * 0.80, "SILENCE, EVERY TIME", 48, PAL.dim, 12, "body");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  vignette2(ctx, W, H, 0.44); grain2(ctx, W, H, t);
}

// SC23 modern searches — SKY emptier, 2022 + 2025, 0 repeats counter
export function SC23(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  skyBase(ctx, W, H, t, { emptier: 0.68, horizon: 0.9, nebula: false });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.15 + b1.dy, "THE SEARCHES CONTINUE", TS.section, PAL.ink, "center");
      ctx.globalAlpha = 1;
    }
    const cards = [
      ["2022", "BREAKTHROUGH LISTEN", "GREEN BANK + ALLEN ARRAYS — FULL COVERAGE OF THE REGION", win.start + 1.2],
      ["2025", "SETI INSTITUTE", "COORDINATED COSMIC CALLER SEARCH ACROSS ARCHIVES", win.start + 3.0],
    ];
    cards.forEach(([yr, org, what, t0], i) => {
      const b = buildIn(t, t0, 0, 0, 0.6);
      if (b.a <= 0) return;
      ctx.globalAlpha = b.a;
      const cw = W * 0.38, chh = H * 0.26;
      const cx = W * (0.27 + i * 0.46), cy = H * 0.42;
      ctx.fillStyle = "rgba(10,18,38,0.75)"; ctx.fillRect(cx - cw / 2, cy - chh / 2, cw, chh);
      ctx.strokeStyle = "rgba(88,199,240,0.45)"; ctx.lineWidth = 3; ctx.strokeRect(cx - cw / 2, cy - chh / 2, cw, chh);
      numeral(ctx, cx, cy - chh * 0.22, yr, 72, PAL.cyan);
      ctx.font = fnt("body", 40); ctx.fillStyle = PAL.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(org, cx, cy + 8);
      ctx.font = fnt("body", 34); ctx.fillStyle = PAL.dim;
      ctx.fillText(what.slice(0, 38), cx, cy + 56);
      ctx.font = fnt("title", 40); ctx.fillStyle = "rgba(192,57,43,0.95)";
      ctx.fillText("NULL", cx, cy + chh / 2 - 26);
      ctx.globalAlpha = 1;
    });
    const b2 = buildIn(t, win.start + 5.4, 2);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      numeral(ctx, W / 2, H * 0.665, "0", TS.numeral + 34, PAL.signal);
      displayBig(ctx, W / 2, H * 0.765, "REPEATS IN FORTY-NINE YEARS", 48, PAL.ink, 10, "body");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  vignette2(ctx, W, H, 0.44); grain2(ctx, W, H, t);
}

// SC24 ruled out — PAPER evidence board, struck chips + debris diagram
export function SC24(ctx, W, H, t, win) {
  const sp = sprog(t, win);
  paperBase(ctx, W, H, t, { printRows: 10, seed: 73 });
  withPush(ctx, W, H, sp, () => {
    const b1 = buildIn(t, win.start + 0.4, 0);
    if (b1.a > 0) {
      ctx.globalAlpha = b1.a;
      sectionTitle(ctx, W / 2, H * 0.135 + b1.dy, "THE ORIGINAL TEAM RULED OUT THE OBVIOUS", 62, PAL.inkPrint, "center");
      ctx.globalAlpha = 1;
    }
    // five struck chips (evidence board layout)
    const chips = ["PLANETS", "ASTEROIDS", "SATELLITES", "AIRCRAFT", "SPACECRAFT"];
    chips.forEach((c, i) => {
      const a = easeOut(clamp01((t - win.start - 1.2 - i * 1.1) / 0.45));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      const col = i % 3, row = Math.floor(i / 3);
      const cx = W * (0.165 + col * 0.34), cy = H * (0.30 + row * 0.24);
      ctx.font = fnt("body", 44);
      const tw = ctx.measureText(c).width + 72;
      ctx.fillStyle = "#f0e8d0"; ctx.fillRect(cx - tw / 2, cy - 44, tw, 88);
      ctx.strokeStyle = "rgba(70,64,48,0.6)"; ctx.lineWidth = 3; ctx.strokeRect(cx - tw / 2, cy - 44, tw, 88);
      ctx.fillStyle = "#33302a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(c, cx, cy);
      ctx.strokeStyle = PAL.penRed; ctx.lineWidth = 9; ctx.lineCap = "round";
      handStroke(ctx, [[cx - tw / 2 + 16, cy + 30], [cx + tw / 2 - 20, cy - 30]], 4, 80 + i, 1);
      ctx.globalAlpha = 1;
    });
    // debris-reflection mini-diagram + verdict
    const b2 = buildIn(t, win.start + 7.4, 1);
    if (b2.a > 0) {
      ctx.globalAlpha = b2.a;
      const dx = W * 0.20, dy = H * 0.68;
      ctx.strokeStyle = "#33302a"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(dx, dy, 26, 0, Math.PI * 2); ctx.stroke(); // earth
      ctx.beginPath(); ctx.moveTo(dx + 26, dy - 6); ctx.lineTo(dx + 130, dy - 64); ctx.stroke(); // up link
      ctx.beginPath(); ctx.moveTo(dx + 130, dy - 64); ctx.lineTo(dx + 60, dy - 110); ctx.stroke(); // debris scatter
      ctx.fillStyle = "#5a5240"; ctx.beginPath(); ctx.arc(dx + 130, dy - 64, 8, 0, Math.PI * 2); ctx.fill();
      ctx.font = fnt("body", 36); ctx.fillStyle = "#4a4436"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("A TERRESTRIAL SIGNAL OFF SPACE DEBRIS —", dx + 170, dy - 52);
      ctx.fillText("WRONG TRANSMITTER, WRONG GEOMETRY", dx + 170, dy - 6);
      label(ctx, dx + 170, dy + 40, "IMPROBABLE IN PRACTICE", 40, "#8a2f22");
      ctx.globalAlpha = 1;
    }
  });
  channelMark(ctx, W, t);
  recon2(ctx, W, H);
  vignette2(ctx, W, H, 0.5); grain2(ctx, W, H, t, 99, 0.035);
}
