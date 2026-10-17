// Magnified details of the ostrich, each drawn for a roundel of radius 500 local units (centre 0,0).
// buildDetailO(name) → { ink, regions: { name: {path, polys} }, specimen (polys for the ruled ground to avoid) }
// ink groups: 'ol' outlines, 'h1', 'h2', 'h3', plus 'rule' (the ruled ground of the roundel).
import * as B from '../engine/burin.js';
const { ring, shape, clamp, hatch, outline, stroke, stipple, RNG, noise2, sphereTone, inPoly, ellipsePts, fur, bboxOf, sstep } = B;
const L = { x: -0.55, y: -0.62, z: 0.56 }, LV = [L.x, L.y];

export const DETAILS_O = { brain: buildBrain, foot: buildFoot, egg: buildEgg };
export function buildDetailO(name, o = {}) { return (DETAILS_O[name] || buildBrain)(o); }

// the ruled ground: fine horizontal lines laid by a ruling machine, stopped at the specimen
function ruled(ink, excl, { spacing = 11, w = 1.5 } = {}) {
  ink.group('rule');
  const circ = ring(ellipsePts(0, 0, 486, 486, 0, 96));
  hatch(ink, circ.polys, { angle: 0, spacing, tone: () => 0.6, thr: 0, wMin: w, wMax: w, jitter: 0, wobble: 0.08, taper: 3, excl });
}

// ---------------- Fig. · the brain, drawn beside the eye that dwarfs it ----------------
// The point of the figure is the comparison: the ostrich brain is smaller than either of its eyes.
function buildBrain({ seed = 5 } = {}) {
  const ink = new B.Ink();
  // the brain: a small rounded mass, side view, at the left of the roundel
  const bx = -200, by = 30;
  const brainPts = [];
  for (let i = 0; i < 90; i++) {
    const th = i / 90 * Math.PI * 2;
    const wob = 1 + 0.06 * Math.sin(th * 3 + 0.8) + 0.04 * Math.sin(th * 5 + 2);
    brainPts.push([bx + Math.cos(th) * 235 * wob, by + Math.sin(th) * 205 * wob - 30]);
  }
  const brain = ring(brainPts);
  // the cerebellum: a smaller pleated ball tucked under the back of the cerebrum
  const cb = ring(ellipsePts(bx + 150, by + 105, 105, 85, 0.2, 60));
  // the eye for comparison: a ball at the right, plainly bigger
  const ex = 235, ey = -60;
  const eye = ring(ellipsePts(ex, ey, 300, 285, 0, 90));
  const iris = ring(ellipsePts(ex + 95, ey - 25, 130, 120, 0, 60));
  const lens = ring(ellipsePts(ex + 60, ey - 20, 78, 72, 0, 48));
  // nerve stubs
  const optic = [[bx + 90, by + 90], [bx + 160, by + 150], [ex - 170, ey + 170]];
  // ---- tone ----
  const bC = [bx, by - 30], bTone = sphereTone(bC[0], bC[1], 240, 215, { L, base: 0.06 });
  ink.group('ol'); outline(ink, brain.polys[0], { w: 4.6, light: LV, vary: 0.9, seed });
  ink.group('h1'); hatch(ink, brain.polys, { angle: -0.4, bend: 0.0016, spacing: 9, tone: bTone, thr: 0.16, wMax: 3.2, wMin: 0.7, seed: seed + 1, taper: 14 });
  ink.group('h2'); hatch(ink, brain.polys, { angle: 0.75, spacing: 11, tone: bTone, thr: 0.5, wMax: 2.6, wMin: 0.7, seed: seed + 2, taper: 9 });
  // the sulci: the wavy folds of the cerebrum, drawn as paired squiggles
  ink.group('h3');
  { const R = RNG(seed + 3);
    for (let k = 0; k < 9; k++) {
      let xx = bx - 170 + R() * 90, yy = by - 160 + k * 36 + R() * 14;
      const pts = [[xx, yy]];
      for (let m = 0; m < 6; m++) { xx += 52 + R() * 20; yy += (R() - 0.5) * 26; pts.push([xx, yy]); }
      if (!inPoly(brain.polys, xx, yy) || !inPoly(brain.polys, pts[0][0], pts[0][1])) continue;
      const N = B.normals(pts, false);
      for (const [i, p] of pts.entries()) { const w = 5.5 - Math.abs(i - 3) * 1.1; stroke(ink, [[p[0] - N[i][0] * w, p[1] - N[i][1] * w], [p[0] + N[i][0] * w, p[1] + N[i][1] * w]], 2.6, { taper: 8 }); }
    } }
  // cerebellum with its finer pleats
  const cTone = sphereTone(bx + 150, by + 105, 100, 82, { L, base: 0.12, rot: 0.2 });
  ink.group('ol'); outline(ink, cb.polys[0], { w: 3.6, light: LV, vary: 0.8, seed: seed + 4 });
  ink.group('h1'); hatch(ink, cb.polys, { angle: 0.3, spacing: 7.5, tone: cTone, thr: 0.2, wMax: 2.4, wMin: 0.6, seed: seed + 5, taper: 10 });
  ink.group('h3');
  for (let k = 0; k < 6; k++) { const t0 = -0.9 + k * 0.34; stroke(ink, ellipsePts(bx + 150, by + 105, 88 - k * 4, 70 - k * 5, 0.2, 40, t0, t0 + 0.5), 1.9, { taper: 16 }); }
  // the eye, plainly larger: sclera ball, iris ring, lens, and the shadow the ball casts
  const eTone = sphereTone(ex, ey, 300, 285, { L, base: 0.05 });
  ink.group('ol'); outline(ink, eye.polys[0], { w: 4.8, light: LV, vary: 0.9, seed: seed + 6 });
  ink.group('h1'); hatch(ink, eye.polys, { angle: -0.5, spacing: 9.5, tone: eTone, thr: 0.16, wMax: 3.2, wMin: 0.7, seed: seed + 7, taper: 14 });
  ink.group('h2'); hatch(ink, eye.polys, { angle: 0.85, spacing: 11.5, tone: eTone, thr: 0.52, wMax: 2.4, wMin: 0.7, seed: seed + 8, taper: 9 });
  const iTone = sphereTone(ex + 95, ey - 25, 130, 120, { L, base: 0.3 });
  ink.group('ol'); outline(ink, iris.polys[0], { w: 3.8, light: LV, vary: 0.8, seed: seed + 9 });
  ink.group('h2'); hatch(ink, iris.polys, { angle: 0.6, spacing: 5.5, tone: iTone, thr: 0.3, wMax: 2.2, wMin: 0.6, seed: seed + 10, taper: 6 });
  ink.group('h3'); stipple(ink, iris.polys, { density: 0.012, tone: iTone, r: 2.2, seed: seed + 11, thr: 0.08 });
  ink.group('ol'); outline(ink, lens.polys[0], { w: 3.2, light: LV, vary: 0.8, seed: seed + 12 });
  ink.group('h1'); hatch(ink, lens.polys, { angle: -0.3, spacing: 6.5, tone: sphereTone(ex + 60, ey - 20, 78, 72, { L, base: 0.02 }), thr: 0.14, wMax: 2.0, wMin: 0.5, seed: seed + 13, taper: 8 });
  // optic nerve joining the two
  ink.group('ol'); stroke(ink, optic, 5.5, { taper: 20 });
  // the ground and the halo
  const spec = [...brain.polys, ...cb.polys, ...eye.polys, ...iris.polys, ...lens.polys];
  const halo = ring(ellipsePts(0, 0, 520, 520, 0, 80));
  ruled(ink, spec.map(p => [p]).flat().length ? [...spec, ...halo.polys] : spec, { spacing: 12 });
  const bp = new Path2D(); bp.addPath(brain.path); bp.addPath(cb.path);
  return { ink, regions: { head: { path: bp, polys: [...brain.polys, ...cb.polys] }, eye: { path: eye.path, polys: [...eye.polys, ...iris.polys, ...lens.polys] } }, specimen: spec };
}

// ---------------- Fig. · the foot: two toes only ----------------
// The ostrich is the only living bird with just two toes: the great third toe with its heavy nail,
// and a small outer fourth toe. Drawn from the front-left, on the ruled ground.
function buildFoot({ seed = 9 } = {}) {
  const ink = new B.Ink(), tilt = 0.1;
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const T = ([x, y]) => [x * ct - y * st, x * st + y * ct];
  // the tarsus coming down from above, widening slightly into the tarsal joint
  const tib = ring([[[-105, -560], [85, -560], [70, -380], [-88, -385]].map(T), [[-118, -545], [98, -545], [82, -360], [-100, -368]].map(T)].flat());
  // actually build the tarsus as one ring: front face of the shin
  const shin = ring([[-108, -620], [92, -620], [76, -395], [-90, -400]].map(T));
  // tarsal joint: a broad padded knob
  const joint = ring(ellipsePts(-8 * ct, -370 * (ct) , 150, 95, tilt, 60));
  // the big third toe: long, forward, padded under, heavy nail
  const to3Pts = [];
  const A = [-60, -300], Bp = [-95, 240];
  for (let i = 0; i <= 16; i++) { const t = i / 16, x = A[0] + (Bp[0] - A[0]) * t + Math.sin(t * Math.PI) * -40, y = A[1] + (Bp[1] - A[1]) * t; to3Pts.push([x - (26 + 8 * Math.sin(t * Math.PI)), y]); }
  for (let i = 16; i >= 0; i--) { const t = i / 16, x = A[0] + (Bp[0] - A[0]) * t + Math.sin(t * Math.PI) * -40, y = A[1] + (Bp[1] - A[1]) * t; to3Pts.push([x + (26 + 8 * Math.sin(t * Math.PI)), y]); }
  const to3 = ring(to3Pts.map(T));
  // its nail: the heavy blunt claw that leaves the three-toed print
  const nail = ring(ellipsePts(Bp[0] - 6, Bp[1] + 60, 92, 62, 0.12, 50).map(T));
  // the small fourth toe behind
  const to4 = ring(ellipsePts(150, -60, 60, 210, -0.15, 50).map(T));
  const nail4 = ring(ellipsePts(168, 165, 40, 34, -0.1, 30).map(T));
  // calloused pads along the sole of the big toe
  const pads = [];
  for (let k = 0; k < 5; k++) pads.push(ring(ellipsePts(-80 - k * 2, -160 + k * 95, 34, 30, 0, 24).map(T)));
  // ---- engraving ----
  const shTone = sphereTone(-8, -500, 110, 130, { L, base: 0.14 });
  ink.group('ol'); outline(ink, shin.polys[0], { w: 5, light: LV, vary: 0.9, seed });
  ink.group('h1'); hatch(ink, shin.polys, { angle: Math.PI / 2 + tilt, spacing: 9, tone: shTone, thr: 0.18, wMax: 3, wMin: 0.7, seed: seed + 1, taper: 12 });
  // the front scales of the shin, big and regular
  ink.group('h3');
  { const R = RNG(seed + 2);
    for (let yy = -590; yy < -410; yy += 34) {
      const pts = []; for (let xx = -95; xx <= 80; xx += 30) pts.push(T([xx + (R() - 0.5) * 6, yy + (R() - 0.5) * 5]));
      stroke(ink, pts, 2.6, { taper: 6 });
    } }
  const jTone = sphereTone(-8, -370, 150, 95, { L, base: 0.1 });
  ink.group('ol'); outline(ink, joint.polys[0], { w: 4.6, light: LV, vary: 0.9, seed: seed + 3 });
  ink.group('h1'); hatch(ink, joint.polys, { angle: 0.1, spacing: 8, tone: jTone, thr: 0.2, wMax: 2.8, wMin: 0.6, seed: seed + 4, taper: 10 });
  const toeTone = sphereTone(-80, -40, 60, 260, { L, base: 0.1 });
  ink.group('ol'); outline(ink, to3.polys[0], { w: 4.8, light: LV, vary: 0.9, seed: seed + 5 });
  ink.group('h1'); hatch(ink, to3.polys, { angle: Math.PI / 2 + 0.05, spacing: 9, tone: toeTone, thr: 0.2, wMax: 2.9, wMin: 0.7, seed: seed + 6, taper: 12 });
  ink.group('h2'); hatch(ink, to3.polys, { angle: -0.35, spacing: 12, tone: toeTone, thr: 0.55, wMax: 2.2, wMin: 0.6, seed: seed + 7, taper: 6 });
  for (const [k, p] of pads.entries()) { ink.group('ol'); outline(ink, p.polys[0], { w: 2.4, light: LV, vary: 0.8, seed: seed + 10 + k }); ink.group('h2'); hatch(ink, p.polys, { angle: 0.2, spacing: 4.5, tone: () => 0.6, thr: 0.25, wMax: 1.6, wMin: 0.5, seed: seed + 20 + k, taper: 4 }); }
  ink.group('ol'); outline(ink, nail.polys[0], { w: 4.2, light: LV, vary: 0.9, seed: seed + 8 });
  ink.group('h2'); hatch(ink, nail.polys, { angle: -0.4, spacing: 6, tone: () => 0.78, thr: 0.18, wMax: 2.2, wMin: 0.6, seed: seed + 9, taper: 6 });
  ink.group('ol'); outline(ink, to4.polys[0], { w: 3.6, light: LV, vary: 0.9, seed: seed + 30 });
  ink.group('h1'); hatch(ink, to4.polys, { angle: Math.PI / 2 - 0.1, spacing: 8, tone: sphereTone(150, -60, 60, 210, { L, base: 0.12 }), thr: 0.2, wMax: 2.2, wMin: 0.6, seed: seed + 31, taper: 8 });
  ink.group('ol'); outline(ink, nail4.polys[0], { w: 3, light: LV, vary: 0.8, seed: seed + 32 });
  ink.group('h2'); hatch(ink, nail4.polys, { angle: -0.3, spacing: 4.5, tone: () => 0.72, thr: 0.2, wMax: 1.6, wMin: 0.5, seed: seed + 33 });
  // the ground shadow under the print
  ink.group('h2');
  stroke(ink, [T([-190, 330]), T([0, 352]), T([220, 332])], 3.2, { taper: 40 });
  const spec = [...shin.polys, ...joint.polys, ...to3.polys, ...nail.polys, ...to4.polys, ...nail4.polys];
  ruled(ink, spec, { spacing: 12 });
  const lp = new Path2D(); lp.addPath(shin.path); lp.addPath(joint.path); lp.addPath(to3.path); lp.addPath(nail.path); lp.addPath(to4.path); lp.addPath(nail4.path);
  return { ink, regions: { legs: { path: lp, polys: spec } }, specimen: spec };
}

// ---------------- Fig. · the egg, with a dimension line ----------------
// The largest egg of any living bird: about fifteen centimetres long, a kilogram and a half of shell and promise.
function buildEgg({ seed = 13 } = {}) {
  const ink = new B.Ink();
  const ex = -30, ey = 10;
  const eggPts = [];
  for (let i = 0; i < 110; i++) {
    const th = i / 110 * Math.PI * 2;
    // the classic asymmetry: blunter at the bottom (th ≈ π/2), more pointed at the top
    const wob = 1 + 0.05 * Math.cos(th - 1.2);
    eggPts.push([ex + Math.cos(th) * 250 * wob, ey + Math.sin(th) * 335 * (th > Math.PI / 2 ? 1.04 * wob : wob)]);
  }
  const egg = ring(eggPts);
  const eTone = sphereTone(ex - 60, ey - 90, 260, 340, { L, base: 0.03 });
  ink.group('ol'); outline(ink, egg.polys[0], { w: 5, light: LV, vary: 0.9, seed });
  ink.group('h1'); hatch(ink, egg.polys, { angle: -0.45, bend: 0.001, spacing: 9.5, tone: eTone, thr: 0.16, wMax: 3.2, wMin: 0.7, seed: seed + 1, taper: 16 });
  ink.group('h2'); hatch(ink, egg.polys, { angle: 0.8, spacing: 12, tone: eTone, thr: 0.52, wMax: 2.5, wMin: 0.7, seed: seed + 2, taper: 9 });
  // the pore-speckled shell: a fine stipple, sparse, denser toward the shadow
  ink.group('h3'); stipple(ink, egg.polys, { density: 0.006, tone: eTone, r: 1.8, seed: seed + 3, thr: 0.12 });
  // the bright window highlight: a small reflected sun
  ink.group('h1');
  stroke(ink, ellipsePts(ex - 95, ey - 160, 60, 34, -0.55, 30, Math.PI * 0.9, Math.PI * 1.7), 2.6, { taper: 10 });
  // the dimension line: 15 cm, drawn the way draughtsmen do — with barbed ends
  ink.group('rule');
  const x0 = ex + 330, yA = ey - 345, yB = ey + 330;
  stroke(ink, [[x0, yA], [x0, yB]], 2.6, { taper: 2 });
  for (const yy of [yA, yB]) stroke(ink, [[x0 - 26, yy + (yy === yA ? 22 : -22)], [x0, yy], [x0 + 26, yy + (yy === yA ? 22 : -22)]], 2.2, { taper: 4 });
  ink.group('h2');
  // hatch marks across the dimension line's extension arms
  const spec = egg.polys;
  ruled(ink, [...spec], { spacing: 13 });
  return { ink, regions: { egg: { path: egg.path, polys: egg.polys } }, specimen: spec };
}
