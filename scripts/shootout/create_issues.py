#!/usr/bin/env python3
"""Create the render-engine-shootout issue tree (parent + children). Idempotent: skips if a same-title open issue exists."""
import sys, json
sys.path.insert(0, "/home/z/my-project/scripts/shootout")
from gh import api

PARENT = {
    "title": "RENDER-ENGINE SHOOTOUT: The Wow! Signal — three-engine full documentary (Opuscar vs HyperFrames vs Hypit)",
    "body": """## Objective
Produce **three complete, independently rendered ~10-minute documentary videos** of *THE WOW! SIGNAL — 72 Seconds from Deep Space* (channel: The Unclosed File) using three different rendering engines — **A: Opuscar Studio (existing engine)**, **B: HyperFrames (heygen-com/hyperframes)**, **C: Hypit (hypit-ai/hypit)** — then publish videos, posters, contact sheet, comparison report, results JSON and checksums to a GitHub Release so the owner can personally compare.

This is the parent issue. Workstreams are tracked in child issues linked below. Full directive: operator brief "MASTER TASK: THREE-ENGINE DOCUMENTARY PRODUCTION SHOOTOUT" (2026-10-18, uploaded in session).

## Scope
- Shared editorial package (research, script, timeline, narration audio, subtitles, assets) prepared ONCE, consumed by all three engines.
- Isolated per-engine implementations under `work/render-engine-shootout/wow-signal/engines/{opuscar,hyperframes,hypit}/`.
- Technical validation per output (ffprobe, full decode, frame inspection), fair performance comparison, release publishing, recovery drill.
- Target spec: 10:00 (9:59–10:01), 1920×1080, 30 fps, H.264 yuv420p, stereo AAC, one shared narration recording, identical subtitles, identical closing card.

## Non-negotiable rules (from directive §1)
- GitHub is the durable source of truth; commit+push every validated milestone; never trust local state.
- Every issue closed only after acceptance criteria verified on the remote.
- No silent substitutions between engines; a failed engine is reported honestly, not faked.
- Do not modify the production renderer defaults or merge production branches; work on `feat/render-engine-shootout`.
- Editorial safety: no claim that alien intelligence caused the signal; hypotheses labelled as hypotheses (see research child issue).

## Acceptance criteria (parent)
- [ ] All child issues closed with verified evidence.
- [ ] Three ~10-min MP4s rendered independently, validated (duration 9:59–10:01, 30fps, 1080p, H.264 yuv420p, AAC stereo).
- [ ] Comparison report + RESULTS.json with real measurements; no invented scores.
- [ ] Release `render-engine-shootout-v1.0.0` with all §14 assets uploaded and remotely verified.
- [ ] worklog.md / CHECKPOINT.md / BRAIN.md updated with actual final state.

## Dependencies / risks
- 2-CPU, 3 GB RAM, ~8 GB free disk container: renders are long (≈18k frames each × 3); disk budget managed by streaming encoders, intermediates cleaned per milestone.
- HyperFrames/Hypit are external 0.x projects with fast churn — audit current versions before implementation.
- Hypit requires Node ≥22.15 (container has v24.21.0 — gate passes; Opuscar benchmark documents Node 20) and ships a modified Apache-2.0 license with conditions (see docs/HYPIT_ENGINE_AUDIT.md).
- Session resets are expected; recovery per BRAIN.md/CHECKPOINT.md/worklog.md doctrine.

## Verification plan
- Every milestone: exact test commands + observed output recorded in worklog; pushes verified by hash; final release assets verified via authenticated API (nonzero size, retrievable).
""",
}

CHILDREN = [
 ("Engine audit and compatibility (HyperFrames current + Hypit re-verify)",
  """**Parent:** shootout parent issue. **Directive:** §2, §3, Engine B/C.

## Objective
Audit the CURRENT HyperFrames and Hypit engines from real source (not READMEs) and verify they can genuinely author+render a full 10-min documentary on this container.

## Scope
- HyperFrames: clone/inspect current release (npm `@hyperframes/cli`), verify CLI commands, local-render path (no cloud/credits), determinism model, captions/audio/subtitle support, Node/FFmpeg requirements, license (expected Apache-2.0), disk footprint of install + browser download.
- Hypit: docs/HYPIT_ENGINE_AUDIT.md (2026-10-18, v0.3.1) covers structure/license/runtime — RE-VERIFY current release, then deepen on the shootout-specific gaps: custom narration audio input, still-image tracks, exact SVML authoring for a 10-min timeline, local-only render (no AI connectors), result retrieval.
- Runtime gates on this container: Node v24.21.0, 2 CPU, 3 GB RAM, 8 GB disk; no GPU.

## Acceptance criteria
- [ ] AUDIT update committed (docs/ or work/render-engine-shootout/): versions, install commands, render commands, license notes, risks.
- [ ] Both engines actually install + render a short smoke composition locally on this container.
- [ ] Feasibility verdict per engine for the 10-min film, with limitations recorded.

## Risks
- HyperFrames 0.x churn may have changed CLI since 2026-10-13 audit; browser download size vs disk budget; Hypit word-anchored timing may expect its own ASR/TTS connectors.
""", []),
 ("Historical research and fact-checking (Wow! Signal)",
  """**Parent:** shootout parent issue. **Directive:** §4.3.

## Objective
Authoritative research for the 1977 Wow! Signal with per-claim sourcing; produce RESEARCH.md, SOURCE_NOTES.md, FACT_CHECK.md.

## Scope
- Sources prioritized: Big Ear Observatory / Ohio State historical resources; original scientific papers (Ehman's account, the 1977–79 observations); SETI Institute; NASA; reputable astronomy publications.
- Claim ledger: claim | status (established/disputed/open) | source. Distinguish observations, measured properties, interpretations, proposed explanations, unresolved questions.
- Known care points: exact 6EQUJ5 notation meaning; intensity ratio (30σ vs "30 times background" phrasing); narrowband ~1420 MHz; 72-s duration as observation-window artifact; follow-up failure (no confirmation); 1977 date (Aug 15), Ehman circled printout Dec 1977... each must be sourced, not folklore.

## Acceptance criteria
- [ ] RESEARCH.md + SOURCE_NOTES.md + FACT_CHECK.md committed with access dates and URLs.
- [ ] Every script-bound factual claim traceable to a source; disputed items use qualified wording.

## Risks
- Internet folklore is dense around this topic (alien interpretation); wording must be scientifically responsible.
""", []),
 ("Script and storyboard (shared editorial spec)",
  """**Parent:** shootout parent issue. **Directive:** §4.2, §5, §6, §7.

## Objective
Freeze the shared creative specification: SCRIPT.md, STORYBOARD.md, BRIEF.md, canonical TIMELINE.json, RENDER_SPEC.json.

## Scope
- ~1,200–1,450 narration words (≈150 wpm house voice) targeting 10:00 with natural pacing; narration duration measured from actual TTS audio is the final authority.
- Segment structure per directive §6 (cold open → observatory → signal → annotation → why it stood out → follow-ups → proposed explanations → evidence vs speculation → unresolved question → closing/credits).
- Visual system: deep navy/black, restrained green/cyan signal accents, code-generated data visualizations, archival imagery where licensed, labelled reconstructions, readable typography, consistent closing card. No alien-causation implication.
- TIMELINE.json: scene IDs, start/end, narration refs, subtitle refs, visual descriptions, transitions, asset IDs — engine-neutral, consumed by all three implementations.

## Acceptance criteria
- [ ] All five docs committed and frozen before engine implementations start.
- [ ] Timeline sums to the measured narration duration ±10 s; gates documented.

## Dependencies
- Research issue (claims before script), audio issue (measured durations before timeline freeze).
""", []),
 ("Asset acquisition and licensing (shared across engines)",
  """**Parent:** shootout parent issue. **Directive:** §8.

## Objective
One shared, lawfully acquired, fully provenanced asset package for all three engines.

## Scope
- Use house imgacq standard (scripts/imgacq, provider priority; conservative classifications; ledger with sha256, license, retrieval date, intended scene).
- Big Ear telescope / radio astronomy imagery: verify free license; if unclear → replace or exclude. Code-generated diagrams (signal strip chart, sky coordinates, spectrum plots) authored in-repo with source committed.
- ASSET_MANIFEST.json + ASSET_CREDITS.md; no paid stock, no AI-imagery-as-archival; reconstructions labelled.

## Acceptance criteria
- [ ] Every external asset has complete provenance fields per directive §8.
- [ ] Ledger + manifest committed; zero unclassified assets staged to any engine.

## Risks
- Wikimedia rate-limit windows (imgacq 1.1 UA rules apply); famous Big Ear photos may not be freely licensed — labelled-reconstruction fallbacks per house doctrine.
""", []),
 ("Shared narration, captions, and audio preparation",
  """**Parent:** shootout parent issue. **Directive:** §5 (narration gate), §9.

## Objective
ONE identical narration recording + identical subtitle file + AUDIO_MANIFEST.json, prepared before any engine implementation.

## Scope
- House voice: edge-tts en-US-AndrewMultilingualNeural rate −3% (BRAIN.md Step 4; operator-mandated issue #5). Per-block files + WordBoundary word timings.
- Measure real narration duration; revise script content (not padding) if short of natural 10:00; then freeze timeline.
- Subtitles from final script + measured timing (word-timed SRT per house pipeline). Check clipping, silence, sync, loudness (−16 LUFS full-film standard).
- Music bed (optional): if used, one identical source for all engines; must not obscure narration.

## Acceptance criteria
- [ ] Narration WAV/MP3 + SRT + AUDIO_MANIFEST.json committed; measured duration recorded.
- [ ] Transcript spot-check (ASR word coverage) passes on the narration audio.

## Dependencies
- Script freeze (research first). Gates all three engine implementations.
""", []),
 ("Engine A — Opuscar implementation and full render",
  """**Parent:** shootout parent issue. **Directive:** §3.1, §10.1.

## Objective
Build the complete film in an isolated project using the EXISTING Opuscar renderer contract (window.render(t) / DUR / READY / TEXTS(t); core/render/video.mjs; PLAYWRIGHT_CHROME build 1200). No new renderer; no shared-default changes.

## Scope
- work/render-engine-shootout/wow-signal/engines/opuscar/ — timeline built from the frozen shared TIMELINE.json; image-first scenes per video-004 v4 conventions; burned captions; closing card identical to other engines.
- Deterministic per-segment renders, integrity gates per segment, full-decode 0 errors, loudnorm −16 LUFS, ASR spot-check, luma QA.

## Acceptance criteria
- [ ] Full ~10-min MP4 rendered + validated (9:59–10:01, 1080p30, H.264 yuv420p, AAC stereo).
- [ ] All house gates green with evidence in worklog; milestone committed+pushed.

## Risks
- Render wall-clock on 2 CPUs; disk budget (streaming JPEG→x264, clean per milestone).
""", []),
 ("Engine B — HyperFrames implementation and full render",
  """**Parent:** shootout parent issue. **Directive:** §3.1, §10.2.

## Objective
Genuine HyperFrames project (its own authoring + rendering) producing the same film. NOT an Opuscar render credited to HyperFrames.

## Scope
- engines/hyperframes/: real composition(s) in HyperFrames' HTML data-* timing model with its supported animation adapters, captions and audio tracks; local render only (no cloud render, no credits); current CLI verified at implementation time.
- Same narration/subtitle/assets/timeline from the frozen shared package.

## Acceptance criteria
- [ ] Installed version + exact commands recorded; smoke render passed (audit issue).
- [ ] Full ~10-min MP4 rendered by HyperFrames itself, validated to the shared spec; evidence in worklog; committed+pushed.

## Risks
- 0.x CLI churn; headless-Chrome seek-per-frame speed on 2 CPUs; sharp/native deps install; determinism depends on its no-wall-clock rules.
""", []),
 ("Engine C — Hypit implementation and full render",
  """**Parent:** shootout parent issue. **Directive:** §3.1, §10.3.

## Objective
Genuine Hypit project (its SVML authoring + build workflow) producing the same film. NOT another engine's MP4.

## Scope
- engines/hypit/: real SVML project using Hypit's current local toolchain; NO paid/AI connector services — local/free path only; custom narration audio + stills + captions within what Hypit supports locally; document any capability that requires an external provider as an honest limitation.
- License conditions (modified Apache-2.0) respected: own use OK, preserve logo/copyright in surfaces derived from its CLI reports; output ownership is ours per audit.

## Acceptance criteria
- [ ] Installed version + exact authoring/build commands recorded; smoke render passed (audit issue).
- [ ] Full ~10-min MP4 rendered by Hypit itself (or honest blocker documented with evidence and effect on comparison); committed+pushed.

## Risks
- Word-anchored timing model (WhisperX) may expect connectors; 86-package pnpm monorepo + browser download vs disk budget; Node ≥22.15 gate passes on Node 24.
""", []),
 ("Technical validation and regression tests (all outputs)",
  """**Parent:** shootout parent issue. **Directive:** §11.

## Objective
Independent validation of every output; no "exit 0 means correct".

## Scope
- Per output: ffprobe (duration, fps, frame count, resolution, codec, pix_fmt), full-decode (0 errors), audio properties (codec/channels/sample rate/duration), A/V sync, subtitle wording+timing, frozen/duplicate/black frame scan, transition integrity, clipping check, closing card + credits inspection, beginning/middle/end + representative scenes.
- Determinism: re-render a short sequence twice per engine; distinguish byte-identical vs visually equivalent; only measured claims.
- House gates where applicable (luma QA, ASR spot-check, loudness).

## Acceptance criteria
- [ ] Validation matrix per engine committed (docs/ or work/…/docs/), with actual measured values.
- [ ] Determinism observation recorded per engine with method.

## Dependencies
- Each engine's render milestone.
""", []),
 ("Comparison report and performance measurements",
  """**Parent:** shootout parent issue. **Directive:** §12.

## Objective
Fair, measured comparison — objective data separated from subjective visual judgment; no automatic winner (owner decides).

## Scope
- Per engine: versions, setup time, creative implementation time, render wall-clock, peak memory where measurable, file size, failures/retries, manual interventions, test results, determinism observations, editability/reuse characteristics, limitations, external services + actual costs (expect zero), recovery-from-interruption if tested.
- Asset research/prep time kept separate from engine implementation/render time.
- Scoring rubric §12 with written evidence per category; report docs/RENDER_ENGINE_SHOOTOUT.md + COMPARISON_REPORT.md + RESULTS.json.

## Acceptance criteria
- [ ] All numbers traceable to worklog timestamps/commands; no invented scores.
- [ ] Report committed with results JSON.

## Dependencies
- Validation issue complete.
""", []),
 ("Release publishing and final verification",
  """**Parent:** shootout parent issue. **Directive:** §14, §15, §18.

## Objective
GitHub Release `render-engine-shootout-v1.0.0` on ansaribilal14/opuscar-studio with all required assets, remotely verified.

## Scope
- Assets: 3 × wow-signal-<engine>.mp4, 3 × poster jpg, contact sheet, comparison report md, results json, checksums txt.
- Release notes: subject, why three engines, which engine made which file, real durations/specs, where the report lives, limitations/failed engines if any, owner-will-decide statement.
- Post-upload verification via API: asset exists, nonzero size, retrievable. Draft release until results are final.

## Acceptance criteria
- [ ] Release published (or draft with honest incomplete labelling if an engine failed) and assets remotely verified.
- [ ] Final response to owner prepared per §18 (links, versions, measurements, viewing guide).

## Dependencies
- Comparison report complete; all engine milestones resolved (done or honestly blocked).
""", []),
]

def main():
    # parent
    st, existing = api("issues?state=all&per_page=50")
    titles = {i["title"].split(":")[0][:60] for i in existing}
    st, parent = api("issues", "POST", PARENT)
    if st != 201:
        print("PARENT FAILED", st, parent); return
    print(f"parent #{parent['number']} created")
    child_nums = []
    for title, body, _ in CHILDREN:
        st, ch = api("issues", "POST", {"title": title, "body": body})
        if st != 201:
            print(f"CHILD FAILED {st} {title}"); continue
        child_nums.append(ch["number"])
        print(f"child #{ch['number']} created: {title[:60]}")
    # cross-link comment on parent
    lines = [f"- #{n}" for n in child_nums]
    st, c = api(f"issues/{parent['number']}/comments", "POST",
                {"body": "Child workstreams (directive §1.2):\n" + "\n".join(lines)})
    print("parent comment:", st, c.get("html_url", c) if isinstance(c, dict) else c)

if __name__ == "__main__":
    main()
