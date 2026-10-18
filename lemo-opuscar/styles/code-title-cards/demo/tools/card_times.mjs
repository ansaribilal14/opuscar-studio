// card_times.mjs — representative preview timestamps, derived from the SAME timeline
// module the page renders with (never hand-copied numbers).
//   node tools/card_times.mjs hold        -> one mid-hold time per card (space-separated)
//   node tools/card_times.mjs probes      -> mid fade-in + mid fade-out per card too
//   node tools/card_times.mjs styleframe  -> the gallery-card frame (first card mid-hold)
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { validateConfig, buildTimeline } from '../timeline.js';

const here = dirname(fileURLToPath(import.meta.url));
const cfg = validateConfig(JSON.parse(readFileSync(join(here, '..', 'content.json'), 'utf8')));
const tl = buildTimeline(cfg);
const mid = c => c.start + cfg.fadeIn + Math.max(0, (c.end - cfg.fadeOut - (c.start + cfg.fadeIn)) / 2);
const mode = process.argv[2] || 'hold';
if (mode === 'styleframe') console.log(mid(tl.cards[0]).toFixed(2));
else if (mode === 'probes') console.log(tl.cards.flatMap(c => [(c.start + cfg.fadeIn / 2), mid(c), (c.end - cfg.fadeOut / 2)]).map(t => t.toFixed(2)).join(' '));
else console.log(tl.cards.map(mid).map(t => t.toFixed(2)).join(' '));
