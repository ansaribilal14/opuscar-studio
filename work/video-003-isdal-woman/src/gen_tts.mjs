// gen_tts.mjs — narration generation entry point.
// CANONICAL ENGINE: edge-tts (Microsoft neural voices) — house narrator
// en-US-GuyNeural, pitch -1Hz, default rate -8% (operator-mandated 2026-10-13).
//
// DEPRECATED AND REMOVED: z-ai platform voice "tongtong" (rejected by the
// operator — do not reintroduce). This stub delegates to src/revoice_edge.py:
//   - blocks already present in audio/durations.json -> duration-fitted re-voice
//   - new blocks (not in durations.json) -> natural-duration synthesis (free-run)
// Usage: node src/gen_tts.mjs [blockId ...]
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const script = fileURLToPath(new URL("./revoice_edge.py", import.meta.url));
const r = spawnSync("python3", [script, ...process.argv.slice(2)], { stdio: "inherit" });
process.exit(r.status ?? 1);
