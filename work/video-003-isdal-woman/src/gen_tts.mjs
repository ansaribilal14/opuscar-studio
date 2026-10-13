// gen_tts.mjs — generate narration WAVs for every spoken block in narration.json
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const ROOT = "/home/z/my-project/work/video-003-isdal-woman";
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "src/narration.json"), "utf8"));
const outDir = path.join(ROOT, "audio/blocks");
fs.mkdirSync(outDir, { recursive: true });

const VOICE = process.env.TTS_VOICE || "tongtong";
const SPEED = parseFloat(process.env.TTS_SPEED || "0.95");

function dur(f) {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { stdio: ["ignore"] }).toString().trim();
  return parseFloat(out);
}

const zai = await ZAI.create();
const durations = {};
for (const b of data.blocks) {
  if (!b.text || !b.text.trim()) continue;
  if (b.text.length > 1024) throw new Error(`block ${b.id} exceeds 1024 chars (${b.text.length})`);
  const out = path.join(outDir, `${b.id}.wav`);
  if (fs.existsSync(out)) {
    durations[b.id] = dur(out);
    console.log(`skip ${b.id} (${durations[b.id].toFixed(2)}s)`);
    continue;
  }
  let ok = false, attempt = 0;
  while (!ok && attempt < 8) {
    attempt++;
    try {
      const resp = await zai.audio.tts.create({
        input: b.text, voice: VOICE, speed: SPEED,
        response_format: "wav", stream: false,
      });
      const buf = Buffer.from(new Uint8Array(await resp.arrayBuffer()));
      if (buf.length < 1000) throw new Error(`suspiciously small (${buf.length}b)`);
      fs.writeFileSync(out, buf);
      durations[b.id] = dur(out);
      console.log(`gen  ${b.id} ${durations[b.id].toFixed(2)}s (${buf.length}b)`);
      ok = true;
    } catch (e) {
      const is429 = /429|Too many/i.test(e.message);
      console.error(`attempt ${attempt} failed for ${b.id}: ${e.message}`);
      if (attempt >= 8) throw e;
      await new Promise(r => setTimeout(r, is429 ? 20000 + 10000 * attempt : 2000 * attempt));
    }
  }
}
fs.writeFileSync(path.join(ROOT, "audio/durations.json"), JSON.stringify(durations, null, 2));
const total = Object.values(durations).reduce((a, b) => a + b, 0);
console.log(`\nTOTAL narration: ${total.toFixed(1)}s across ${Object.keys(durations).length} blocks`);
