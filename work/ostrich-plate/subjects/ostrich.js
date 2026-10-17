// The ostrich (Struthio camelus), left-facing profile, as on a 19th-century natural-history plate.
// Built entirely from the burin engine. Local frame: plate px at scale 1, ground line at y = 0,
// the bird standing, head up (−y), drawn height ≈ 832 px for a 2.7 m cock (≈ 1/30 natural size on the plate).
//   buildOstrich({ x, y, s }) → { ink, regions, focus, center, s }
//   ink groups, in cutting order: 'ol0' (the first cut), 'ol' (outlines + plume ribs), 'h1' (first hatch families),
//   'h2' (cross-hatching), 'h3' (deep darks, plume beards, scales, lashes).
//   regions: named Path2D + polys for hand-colouring (body, plumes, neck, head, bill, eye, legs).
//   focus: named world points for the magnified details (eye, brain, foot, egg).
import * as B from '../engine/burin.js';
const { shape, ring, xf, clamp, ellipsePts, sphereTone, cylTone, hatch, outline, stroke, stipple, fur, RNG, noise2, inPoly, inAny, addT, resample, bboxOf, sstep } = B;

const L = { x: -0.55, y: -0.62, z: 0.56 };               // light from the upper left, as on every plate of the period
const LV = [L.x, L.y];
const norm = ([a, b]) => { const l = Math.hypot(a, b) || 1; return [a / l, b / l]; };
const mid = (a, b, t = 0.5) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// a tapered capsule between two points (neck and leg segments), as in the library's bee
function capsule(a, b, w0, w1, n = 10) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, px = -uy, py = ux, pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n, w = (w0 + (w1 - w0) * t) / 2, bulge = 1 + 0.1 * Math.sin(Math.PI * t); pts.push([a[0] + dx * t + px * w * bulge, a[1] + dy * t + py * w * bulge]); }
  for (let i = 0; i <= 8; i++) { const th = -Math.PI / 2 + Math.PI * i / 8; pts.push([b[0] + (ux * Math.cos(th) - px * Math.sin(th)) * w1 / 2 * 0.9, b[1] + (uy * Math.cos(th) - py * Math.sin(th)) * w1 / 2 * 0.9]); }
  for (let i = n; i >= 0; i--) { const t = i / n, w = (w0 + (w1 - w0) * t) / 2, bulge = 1 + 0.1 * Math.sin(Math.PI * t); pts.push([a[0] + dx * t - px * w * bulge, a[1] + dy * t - py * w * bulge]); }
  for (let i = 0; i <= 8; i++) { const th = Math.PI / 2 + Math.PI * i / 8; pts.push([a[0] + (ux * Math.cos(th) - px * Math.sin(th)) * w0 / 2 * 0.9, a[1] + (uy * Math.cos(th) - py * Math.sin(th)) * w0 / 2 * 0.9]); }
  return { ...ring(pts), a, b, ang: Math.atan2(dy, dx), len, w0, w1 };
}

// engrave a tube-like segment: outline, hatching along its axis in the shadow, rings across it in the deep dark
function tube(ink, c, { w = 1.3, spacing = 3.2, dark = 0, seed = 1, excl = null, bands = 0 } = {}) {
  const r = Math.max(c.w0, c.w1) / 2, cm = mid(c.a, c.b);
  const joint = (x, y) => { const ux = Math.cos(c.ang), uy = Math.sin(c.ang), along = (x - c.a[0]) * ux + (y - c.a[1]) * uy, e = Math.min(along, c.len - along); return 0.38 * Math.exp(-((e / (r * 0.9)) ** 2)); };
  const tone = addT(cylTone(cm[0], cm[1], r * 1.05, c.ang, { L }), dark, 0.12, joint);
  ink.group('ol'); outline(ink, c.polys[0], { w, light: LV, vary: 0.9, seed, excl });
  ink.group('h1'); hatch(ink, c.polys, { angle: c.ang, spacing: spacing * 0.8, tone, thr: 0.16, wMax: 1.3, wMin: 0.16, seed, taper: 5, excl });
  ink.group('h2'); hatch(ink, c.polys, { angle: c.ang + Math.PI / 2 - 0.25, spacing: spacing * 1.05, tone, thr: 0.5, wMax: 1.0, wMin: 0.16, seed: seed + 3, taper: 3, excl });
  if (bands) {   // the tarsus's front scales: rows of short stout bands across the shin
    ink.group('h3');
    const R = RNG(seed + 40), ux = Math.cos(c.ang), uy = Math.sin(c.ang), px = -uy, py = ux;
    for (let t = 0.08; t < 0.9; t += 0.045) {
      const bx = c.a[0] + (c.b[0] - c.a[0]) * t, by = c.a[1] + (c.b[1] - c.a[1]) * t, ww = (c.w0 + (c.w1 - c.w0) * t) / 2;
      const ln = ww * 1.7 * (0.85 + R() * 0.3);
      stroke(ink, [[bx - px * ln / 2, by - py * ln / 2], [bx + px * ln / 2, by + py * ln / 2]], 1.5, { taper: 3 });
    }
  }
  return c;
}

export function buildOstrich({ x = 960, y = 900, s = 1, seed = 11 } = {}) {
  const W = xf(x, y, s), P = p => W(p);
  const ink = new B.Ink(), regions = {}, add = (name, sh) => { (regions[name] ||= []).push(sh); };
  const S = v => v * s;

  // ================= body: a big tilted egg of a torso =================
  // parametric oval, chest lower at the front (left), rump high at the back (right)
  const BC = [-10, -485], BRX = 205, BRY = 158, BTILT = -0.1;
  const bodyPts = [];
  for (let i = 0; i < 120; i++) {
    const th = i / 120 * Math.PI * 2;
    const wob = 1 + 0.045 * Math.sin(th * 3 + 1.2) + 0.03 * Math.sin(th * 5 + 0.4);
    const ex = Math.cos(th) * BRX * wob, ey = Math.sin(th) * BRY * wob;
    const ct = Math.cos(BTILT), st = Math.sin(BTILT);
    bodyPts.push([BC[0] + ex * ct - ey * st, BC[1] + ex * st + ey * ct]);
  }
  const body = ring(bodyPts.map(P));
  add('body', body);

  // ================= plumes: the drooping wing curtain and the tail cascade =================
  // plume shapes are soft tongues hanging from the body's rim; the beard is drawn as long soft fur
  const plumeTongue = (x0, y0, x1, y1, w0, sag, seed) => {
    const R = RNG(seed), top = [], bot = [];
    const N = 14;
    for (let i = 0; i <= N; i++) {
      const t = i / N, xx = x0 + (x1 - x0) * t;
      const drop = Math.sin(Math.PI * t) * sag * (0.8 + R() * 0.4);
      const yy = y0 + (y1 - y0) * t + drop;
      const w = w0 * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, t * 1.15))) * (0.9 + R() * 0.2);
      top.push([xx - w / 2, yy]); bot.push([xx + w / 2, yy]);
    }
    return ring([...top, ...bot.reverse()].map(P));   // local tongue -> world (the plate's transform)
  };
  const wingPlumes = [], tailPlumes = [];
  // wing: a shaggy curtain hanging from the shoulder DOWN PAST THE BELLY LINE (the body's belly sits near y −327)
  wingPlumes.push(plumeTongue(-150, -480, -85, -155, 96, 44, seed + 1));
  wingPlumes.push(plumeTongue(-60, -475, 25, -150, 104, 48, seed + 2));
  wingPlumes.push(plumeTongue(30, -470, 110, -165, 96, 44, seed + 3));
  wingPlumes.push(plumeTongue(100, -470, 168, -180, 74, 36, seed + 4));
  // tail: the great white cascade behind, drooping down and back past the rump (body edge ≈ x 195)
  tailPlumes.push(plumeTongue(115, -560, 280, -245, 110, 56, seed + 5));
  tailPlumes.push(plumeTongue(148, -525, 290, -215, 88, 48, seed + 6));
  tailPlumes.push(plumeTongue(170, -485, 282, -205, 62, 40, seed + 7));
  for (const p of wingPlumes) add('plumes', p);
  for (const p of tailPlumes) add('plumes', p);

  // ================= neck (drawn before the head so the head sits over it) =================
  const NECK = [[-108, -570], [-146, -640], [-166, -700], [-170, -748], [-160, -792]];
  const neckW = [52, 42, 30, 23, 19];
  const neckSh = [];
  const neckX = [];   // exclusion: everything the neck's own lines must stop at
  for (let k = 0; k < NECK.length - 1; k++) {
    const c = capsule(P(NECK[k]), P(NECK[k + 1]), S(neckW[k]), S(neckW[k + 1]), 8);
    neckSh.push(c);
  }
  for (const c of neckSh) add('neck', c);

  // ================= head, bill, eye =================
  const headSh = shape('M-158 -826 C-140 -830 -122 -824 -114 -810 C-107 -796 -114 -782 -132 -777 C-150 -772 -170 -778 -177 -792 C-183 -805 -176 -822 -158 -826 Z', W, 1.1);
  add('head', headSh);
  const billSh = shape('M-176 -810 C-190 -810 -204 -806 -213 -800 C-217 -797 -216 -792 -210 -791 C-198 -789 -184 -791 -175 -795 Z', W, 1.1);
  add('bill', billSh);
  const eyeC = P([-163, -806]);
  const eyeSh = B.ellipse(eyeC[0], eyeC[1], S(9.5), S(8.5), -0.2);
  add('eye', eyeSh);

  // ================= legs: feathered thigh, bare banded tarsus, the two-toed foot =================
  const legsSh = [], feetSh = [];
  // front leg (bearing weight): hip → knee → ankle → toe joint
  const FRONT = [[28, -430], [52, -262], [22, -78], [8, -14]];
  // hind leg: drawn a touch lighter, behind
  const HIND = [[95, -435], [128, -275], [98, -76], [84, -12]];
  const legSeg = [];
  for (const [sg, LEG] of [['f', FRONT], ['h', HIND]]) {
    const Q = LEG.map(([px, py]) => P([px, py]));
    // thigh: feathered — hatched softly under the body plumes (short, from hip to knee)
    const thigh = capsule(Q[0], Q[1], S(46), S(30), 8);
    // tarsus: the bare banded shin
    const tar = capsule(Q[1], Q[2], S(19), S(13), 8);
    // pedal segment: ankle down to the toe joint
    const ped = capsule(Q[2], Q[3], S(13), S(10), 6);
    legsSh.push(thigh, tar, ped);
    legSeg.push({ sg, thigh, tar, ped, Q });
  }
  // the toes: big third toe forward, small fourth toe behind — the ostrich's signature
  function foot(ink, joint, dir, sgn, seed) {
    // third toe: long, forward; padded under; heavy toenail
    const a = joint, b = [joint[0] + sgn * S(52), joint[1] + S(2)];
    const to3 = capsule(a, b, S(13), S(9), 6);
    feetSh.push(to3);
    const nail = ring(ellipsePts(b[0] + sgn * S(7), b[1] - S(2), S(10), S(6.5), sgn > 0 ? -0.25 : 0.25, 24));
    // fourth toe: short, behind
    const c = [joint[0] + sgn * S(20), joint[1] + S(1)];
    const to4 = capsule(a, c, S(8), S(6), 5);
    feetSh.push(to4);
    return { to3, to4, nail };
  }
  for (const ls of legSeg) {
    const jt = ls.Q[3];
    ls.foot = foot(ink, jt, ls.ang, ls.sg === 'f' ? -1 : 1, seed + (ls.sg === 'f' ? 60 : 80));
  }

  // ================= exclusions =================
  const headX = [...headSh.polys, ...billSh.polys, ...eyeSh.polys];
  const neckPolys = neckSh.flatMap(c => c.polys);
  const bodyX = [...body.polys, ...neckPolys];
  const legsX = legsSh.flatMap(l => [...l.polys]);
  const feetX = feetSh.flatMap(f => [...f.polys]);

  // ================= the first cut: the body's back line =================
  ink.group('ol0');
  { const back = bodyPts.filter(p => p[1] < BC[1] - 40 && p[0] > BC[0] - 60).map(P);
    outline(ink, back, { w: 2.5, light: LV, vary: 0.9, seed: seed + 1, run: 200, closed: false }); }

  // ================= body engraving: soft rolled tone, shaggy rim =================
  const bodyTone = sphereTone(BC[0] - S(40), BC[1] - S(30), S(BRX), S(BRY), { L, base: 0.04, rot: BTILT });
  ink.group('ol'); outline(ink, body.polys[0], { w: 2.2, light: LV, vary: 0.9, seed: seed + 2 });
  ink.group('h1'); hatch(ink, body.polys, { angle: -0.42, bend: 0.0032 / s, spacing: 3.8, tone: bodyTone, thr: 0.2, wMax: 1.8, wMin: 0.18, seed: seed + 3 });
  ink.group('h2'); hatch(ink, body.polys, { angle: 0.62, bend: -0.0022 / s, spacing: 4.4, tone: bodyTone, thr: 0.56, wMax: 1.35, wMin: 0.18, seed: seed + 4 });
  ink.group('h3'); hatch(ink, body.polys, { angle: 1.42, spacing: 5.2, tone: bodyTone, thr: 0.8, wMax: 0.85, wMin: 0.18, seed: seed + 5 });
  // the shaggy coat: short fur combed down and back, thickest along the belly and rump
  ink.group('h3');
  fur(ink, body.polys, { density: 0.024, len: 13 * s, w: 0.75, seed: seed + 6, dir: (xx, yy) => norm([0.35, 1]), tone: bodyTone, curl: 0.45 });
  { const R = RNG(seed + 7), P0 = resample(body.polys[0], 3.2 * s);
    for (const [px, py] of P0) { if (R() < 0.42) continue; const d = norm([0.4, 1]), ln = (9 + R() * 12) * s, c = (R() - 0.5) * 0.7;
      stroke(ink, [[px - d[0] * 3 * s, py - d[1] * 3 * s], [px + d[0] * ln * 0.5 + d[1] * c * ln * 0.3, py + d[1] * ln * 0.5 - d[0] * c * ln * 0.3], [px + d[0] * ln + d[1] * c * ln, py + d[1] * ln - d[0] * c * ln]], 0.7, { taper: 4 }); } }

  // ================= plumes: long soft beards, white tips =================
  // The classic plates show the ostrich's curtain of plumes as bold curved shafts with a dense
  // fine beard between them. The shafts root at the body's flank and sweep down past the belly.
  for (const [list, sd] of [[wingPlumes, 20], [tailPlumes, 40]]) {
    for (const [k, p] of list.entries()) {
      const bb = bboxOf(p.polys);
      const cxm = (bb[0] + bb[2]) / 2, ytop = bb[1] + (bb[3] - bb[1]) * 0.28, ybot = bb[3];
      // shafts: long swelling curves from the root to the loose tips
      ink.group('ol');
      const R = RNG(sd + k + 9);
      const NS = 6;
      for (let i = 0; i < NS; i++) {
        const u = (i + 0.5) / NS, x0 = bb[0] + (bb[2] - bb[0]) * (0.2 + 0.55 * u);
        const ln = (ybot - ytop) * (0.5 + R() * 0.18), sway = (R() - 0.5) * 18;
        stroke(ink, [[x0, ytop], [x0 + sway * 0.4, ytop + ln * 0.45], [x0 + sway, ytop + ln]], 1.35, { taper: 60 });
      }
      // the beard: dense fine hatching down the whole tongue, fading toward the tips
      const pTone = (xx, yy) => { const u = clamp((yy - bb[1]) / (bb[3] - bb[1])); return 0.34 + 0.34 * (1 - u) * (0.7 + 0.3 * noise2(xx / 60, yy / 60, sd + k)); };
      ink.group('h1'); hatch(ink, p.polys, { angle: Math.atan2(bb[3] - bb[1], bb[2] - bb[0]) + Math.PI / 2, spacing: 3.2, tone: pTone, thr: 0.16, wMax: 1.7, wMin: 0.35, seed: sd + k + 3, taper: 40 });
      // the open vane: fine hair curling out at the rim
      ink.group('h3');
      fur(ink, p.polys, { density: 0.085, len: 26 * s, w: 0.85, seed: sd + k + 30, dir: (xx, yy) => norm([0.12, 1]), tone: (xx, yy) => 0.2 + 0.5 * clamp((yy - bb[1]) / (bb[3] - bb[1])), curl: 0.6 });
    }
  }

  // ================= neck =================
  for (const [k, c] of neckSh.entries()) {
    tube(ink, c, { seed: seed + 100 + k, w: 1.5, spacing: 3.0, excl: k ? neckPolys.slice(0, k * 1) : null, bands: 0 });
  }
  // the neck's down: sparse fuzzy hair over the bare skin (the ostrich neck is near-naked)
  ink.group('h3');
  { const allNeck = ring([].concat(...neckSh.map(c => c.polys[0])));
    fur(ink, allNeck.polys, { density: 0.02, len: 6 * s, w: 0.6, seed: seed + 110, dir: (xx, yy) => norm([(xx - P(BC)[0]) * 0.3, yy - P(BC)[1]]), tone: () => 0.4, curl: 0.3 }); }

  // ================= head =================
  const hC = P([-152, -800]), hTone = sphereTone(hC[0], hC[1], S(34), S(26), { L, base: 0.12 });
  ink.group('ol'); outline(ink, headSh.polys[0], { w: 1.8, light: LV, vary: 0.9, seed: seed + 120 });
  ink.group('h1'); hatch(ink, headSh.polys, { angle: -0.35, spacing: 2.6, tone: hTone, thr: 0.16, wMax: 1.5, wMin: 0.18, seed: seed + 121 });
  ink.group('h2'); hatch(ink, headSh.polys, { angle: 0.8, spacing: 3.0, tone: hTone, thr: 0.52, wMax: 1.1, wMin: 0.18, seed: seed + 122 });
  // the bill: flat, broad, with a nail at the tip
  ink.group('ol'); outline(ink, billSh.polys[0], { w: 1.6, light: LV, vary: 0.8, seed: seed + 123, excl: headSh.polys });
  ink.group('h2'); hatch(ink, billSh.polys, { angle: -0.15, spacing: 2.4, tone: () => 0.5, thr: 0.3, wMax: 0.9, seed: seed + 124 });
  // the ear: a small dark comma behind the eye
  ink.group('h3');
  stroke(ink, [P([-146, -798]), P([-140, -792]), P([-144, -787])], 1.6, { taper: 6 });

  // ================= the eye: big, dark, fringed with double lashes =================
  const et = sphereTone(eyeC[0], eyeC[1], S(9.5), S(8.5), { L, base: 0.34 });
  ink.group('ol'); outline(ink, eyeSh.polys[0], { w: 1.7, light: LV, vary: 0.8, seed: seed + 130 });
  ink.group('h1'); hatch(ink, eyeSh.polys, { angle: 0.5, spacing: 1.8, tone: et, thr: 0.3, wMax: 1.0, wMin: 0.2, seed: seed + 131 });
  ink.group('h3'); stipple(ink, eyeSh.polys, { density: 0.12, tone: et, r: 0.55, seed: seed + 132, thr: 0.1 });
  // the double lashes: the ostrich's famous fringes, long, sweeping up-forward
  ink.group('h3');
  for (const [a, b, c] of [[[-171, -812], [-179, -818], [-185, -821]], [[-168, -815], [-176, -823], [-183, -827]], [[-174, -808], [-183, -812], [-190, -813]]]) {
    stroke(ink, [P(a), P(b), P(c)], 1.1, { taper: 10 });
  }

  // ================= legs =================
  for (const [k, ls] of legSeg.entries()) {
    const seedK = seed + 140 + k * 10, isFront = ls.sg === 'f';
    // thigh: feathered — soft hatch + fur, lighter than the body
    const tTone = sphereTone(mid(ls.thigh.a, ls.thigh.b)[0], mid(ls.thigh.a, ls.thigh.b)[1], S(40), S(70), { L, base: 0.1 });
    ink.group('ol'); outline(ink, ls.thigh.polys[0], { w: 1.8, light: LV, vary: 0.8, seed: seedK });
    ink.group('h1'); hatch(ink, ls.thigh.polys, { angle: -0.5, spacing: 3.4, tone: tTone, thr: 0.18, wMax: 1.7, wMin: 0.18, seed: seedK + 1 });
    ink.group('h3'); fur(ink, ls.thigh.polys, { density: 0.05, len: 11 * s, w: 0.7, seed: seedK + 2, dir: (xx, yy) => norm([0.25, 1]), tone: tTone, curl: 0.4 });
    // tarsus: the bare banded shin — scales across the front
    tube(ink, ls.tar, { seed: seedK + 3, w: 1.7, spacing: 2.8, dark: isFront ? 0 : 0.08, bands: true });
    // pedal segment
    tube(ink, ls.ped, { seed: seedK + 4, w: 1.5, spacing: 2.6, dark: isFront ? 0 : 0.08 });
    // toes
    ink.group('ol'); outline(ink, ls.foot.to3.polys[0], { w: 1.7, light: LV, vary: 0.9, seed: seedK + 5 });
    outline(ink, ls.foot.to4.polys[0], { w: 1.4, light: LV, vary: 0.9, seed: seedK + 6 });
    outline(ink, ls.foot.nail.polys[0], { w: 1.6, light: LV, vary: 0.9, seed: seedK + 7 });
    ink.group('h2'); hatch(ink, ls.foot.to3.polys, { angle: 0.05, spacing: 2.2, tone: (xx, yy) => 0.42 + 0.3 * sstep(ls.foot.to3.a[0], ls.foot.to3.b[0], xx) * (ls.sg === 'f' ? -1 : 1) * 0 + 0.2 * clamp((yy - y) / S(20) + 1), thr: 0.4, wMax: 1.2, wMin: 0.2, seed: seedK + 8, taper: 3 });
    hatch(ink, ls.foot.nail.polys, { angle: -0.3, spacing: 1.8, tone: () => 0.72, thr: 0.2, wMax: 1.0, wMin: 0.2, seed: seedK + 9 });
    ink.group('h3');
    // toe pads: short tread lines under the big toe
    const a3 = ls.foot.to3.a, b3 = ls.foot.to3.b;
    for (let i = 1; i < 6; i++) { const t = i / 6, xx = a3[0] + (b3[0] - a3[0]) * t, yy = a3[1] + (b3[1] - a3[1]) * t; stroke(ink, [[xx, yy + S(3)], [xx - S(4), yy + S(5)]], 0.8, { taper: 3 }); }
  }

  // ================= ground: a soft shadow line the bird stands on =================
  ink.group('h2');
  { const R = RNG(seed + 160);
    for (let i = 0; i < 26; i++) { const xx = x + (R() - 0.5) * 320 * s, yy = y + (R() - 0.5) * 7; stroke(ink, [[xx - (14 + R() * 30) * s, yy], [xx + (14 + R() * 30) * s, yy]], 0.85, { taper: 40, w0: 0.2, w1: 0.2 }); } }

  // ================= regions → one Path2D each =================
  const reg = {};
  for (const [k, list] of Object.entries(regions)) { if (k.startsWith('_')) continue; const p = new Path2D(); for (const sh of list) p.addPath(sh.path); reg[k] = { path: p, polys: list.flatMap(sh => sh.polys), bbox: bboxOf(list.flatMap(sh => sh.polys)) }; }
  const focus = {
    eye: { x: eyeC[0], y: eyeC[1], r: S(34) },
    brain: { x: hC[0], y: hC[1], r: S(40) },
    foot: { x: P(FRONT[3])[0], y: P(FRONT[3])[1] - S(6), r: S(52) },
    egg: { x: P([-40, -390])[0], y: P([-40, -390])[1], r: S(44) },
  };
  return { ink, regions: reg, focus, center: [x, y], s, groundY: y, drawnH: 832 };
}
