// dispatch_variant.mjs — proof-benchmark variant dispatcher (directive §10)
// Controlled comparison, same narration/timeline, isolating two variables:
//   variant "base" -> the EXACT v3 dispatcher (scenes_z3.mjs: uniform xfade, BACKS)
//   variant A      -> v4 HOOK scenes, v3 composition scenes
//   variant B      -> v3 HOOK scenes, v4 composition scenes
//   variant C      -> full v4
import { renderFrame as renderFrameV3 } from "./scenes_z3.mjs";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import {
  PAL as S, grain, basePlate, vignette, chrome2,
} from "./film_look.mjs";
import { clamp, ease, text, textW } from "./engine.mjs";
import { softVignette } from "./comp_modes.mjs";
// v3 scene fns
import {
  cold_open_paper as v3_cold_open_paper, cold_open_years as v3_cold_open_years,
  cold_open_rules as v3_cold_open_rules, title_card as v3_title_card,
  attack_benicia as v3_attack_benicia, attack_vallejo as v3_attack_vallejo,
  attack_berryessa as v3_attack_berryessa, attack_presidio as v3_attack_presidio,
  fear_grid as v3_fear_grid,
} from "./scenes_z1.mjs";
// v4 scene fns
import {
  cold_open_paper as v4_cold_open_paper, cold_open_years as v4_cold_open_years,
  cold_open_rules as v4_cold_open_rules, title_card as v4_title_card,
  attack_benicia as v4_attack_benicia, attack_vallejo as v4_attack_vallejo,
  attack_berryessa as v4_attack_berryessa, attack_presidio as v4_attack_presidio,
  fear_grid as v4_fear_grid,
} from "./scenes_z1v4.mjs";
import {
  letters_three as v4_letters_three, letters_name as v4_letters_name,
  letters_symbol as v4_letters_symbol, letters_evidence as v4_letters_evidence,
} from "./scenes_z2v4.mjs";
import {
  z13_z32 as v4_z13_z32, underdetermined as v4_underdetermined,
  physical_trail as v4_physical_trail,
  allen_file as v4_allen_file, allen_excluded as v4_allen_excluded,
  poste_rejected as v4_poste_rejected, bias_cycle as v4_bias_cycle,
  era_1969 as v4_era_1969, dna_2002 as v4_dna_2002, record_recap as v4_record_recap,
  verdict_proves as v4_verdict_proves, verdict_open as v4_verdict_open,
  closing_fog as v4_closing_fog, end_card as v4_end_card,
} from "./scenes_z3v4.mjs";

const BRIEFS = JSON.parse(fs.readFileSync(new URL("./scene_briefs.json", import.meta.url), "utf8")).briefs;

const HOOK = { v3: [v3_cold_open_paper, v3_cold_open_years, v3_cold_open_rules, v3_title_card], v4: [v4_cold_open_paper, v4_cold_open_years, v4_cold_open_rules, v4_title_card] };
const VIS_ORDER = ["cold_open_paper", "cold_open_years", "cold_open_rules", "title_card"];
const COMP_MAP = {
  attack_benicia: [v3_attack_benicia, v4_attack_benicia],
  attack_vallejo: [v3_attack_vallejo, v4_attack_vallejo],
  attack_berryessa: [v3_attack_berryessa, v4_attack_berryessa],
  attack_presidio: [v3_attack_presidio, v4_attack_presidio],
  fear_grid: [v3_fear_grid, v4_fear_grid],
};

function beatTab(ctx, W, H, t, block) {
  const names = {
    1: ["FILE 1 / 8", "THE ATTACKS"], 2: ["FILE 2 / 8", "THE LETTERS"], 3: ["FILE 3 / 8", "THE 408"],
    4: ["FILE 4 / 8", "THE 340"], 5: ["FILE 5 / 8", "WHAT REMAINS UNSOLVED"], 6: ["FILE 6 / 8", "THE SUSPECTS"],
    7: ["FILE 7 / 8", "THE INVESTIGATION"], 8: ["FILE 8 / 8", "THE VERDICT"],
  };
  const n = names[block.beat];
  if (!n) return;
  text(ctx, n[0], Math.round(W * 0.024), Math.round(H * 0.048), Math.round(H * 0.0145), { family: S.mono, color: S.amber, alpha: 0.5, spacing: 2 });
  const lw = textW(ctx, n[1], Math.round(H * 0.0135), S.mono);
  text(ctx, n[1], W - Math.round(W * 0.024) - lw, Math.round(H * 0.048), Math.round(H * 0.0135), { family: S.mono, color: S.boneFaint, alpha: 0.5, spacing: 2 });
}

let _xf = null;
function xfadeBuffers(W, H) {
  if (!_xf || _xf.W !== W || _xf.H !== H) {
    const { createCanvas } = require("canvas");
    _xf = { W, H, a: createCanvas(W, H), b: createCanvas(W, H) };
  }
  return _xf;
}

export function renderFrameVariant(ctx, W, H, tl, t, variant) {
  if (variant === "base") return renderFrameV3(ctx, W, H, tl, t);
  const hookV = variant === "B" ? "v3" : "v4";   // A: v4 hook, B: v3 hook
  const compV = variant === "A" ? "v3" : "v4";   // A: v3 comp, B: v4 comp
  const blocks = tl.blocks;
  let idx = 0;
  for (let i = 0; i < blocks.length; i++) { if (t >= blocks[i].start) idx = i; else break; }
  const b = blocks[idx];
  const tLoc = t - b.start;
  const prev = idx > 0 ? blocks[idx - 1] : null;
  const br = BRIEFS[b.id] || {};
  const vi = VIS_ORDER.indexOf(b.visual);
  const fn = vi >= 0 ? HOOK[hookV][vi] : (COMP_MAP[b.visual] ? COMP_MAP[b.visual][compV === "v3" ? 0 : 1] : null);
  const useV4Rest = compV === "v4";
  const REST = {
    letters_three: useV4Rest ? v4_letters_three : null,
    letters_name: useV4Rest ? v4_letters_name : null,
    letters_symbol: useV4Rest ? v4_letters_symbol : null,
    letters_evidence: useV4Rest ? v4_letters_evidence : null,
    z13_z32: useV4Rest ? v4_z13_z32 : null,
    underdetermined: useV4Rest ? v4_underdetermined : null,
    physical_trail: useV4Rest ? v4_physical_trail : null,
    allen_file: useV4Rest ? v4_allen_file : null,
    allen_excluded: useV4Rest ? v4_allen_excluded : null,
    poste_rejected: useV4Rest ? v4_poste_rejected : null,
    bias_cycle: useV4Rest ? v4_bias_cycle : null,
    era_1969: useV4Rest ? v4_era_1969 : null,
    dna_2002: useV4Rest ? v4_dna_2002 : null,
    record_recap: useV4Rest ? v4_record_recap : null,
    verdict_proves: useV4Rest ? v4_verdict_proves : null,
    verdict_open: useV4Rest ? v4_verdict_open : null,
    closing_fog: useV4Rest ? v4_closing_fog : null,
    end_card: useV4Rest ? v4_end_card : null,
  };
  const scene = fn || REST[b.visual] || null;
  if (!scene) throw new Error("no scene fn for " + b.visual + " variant " + variant);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  basePlate(ctx, W, H, t);
  const inTrans = prev && tLoc < 0.9 && (br.in || "dissolve") === "dissolve";
  const draw = (c2d, block, tL) => scene(c2d, W, H, tL, block.dur, block);
  if (inTrans) {
    const { a, b: cvsB } = xfadeBuffers(W, H);
    const ca = a.getContext("2d"), cb = cvsB.getContext("2d");
    ca.setTransform(1, 0, 0, 1, 0, 0); ca.clearRect(0, 0, W, H);
    cb.setTransform(1, 0, 0, 1, 0, 0); cb.clearRect(0, 0, W, H);
    basePlate(ca, W, H, t); basePlate(cb, W, H, t);
    draw(ca, prev, t - prev.start);
    draw(cb, b, tLoc);
    const mix = ease(clamp(tLoc / 0.9));
    ctx.drawImage(a, 0, 0);
    ctx.save(); ctx.globalAlpha = mix; ctx.drawImage(cvsB, 0, 0); ctx.restore();
  } else {
    draw(ctx, b, tLoc);
  }
  if ((br.vig || "std") === "soft") softVignette(ctx, W, H);
  else vignette(ctx, W, H);
  grain(ctx, W, H, t);
  chrome2(ctx, W, H, t, tl.total);
  if (b.beat > 0 && b.visual !== "end_card") beatTab(ctx, W, H, t, b);
}
