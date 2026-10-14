# task-main.md — Operator Master Directive (verbatim, word-for-word)

> This file is the operator's directive, preserved exactly as given. All work is
> tracked as git issues referencing this document. Do not edit the text below.

---

The voiceover chosen is not good ,choose the voiceover which is chosen by https://github.com/ansaribilal14/last-stop-yt-engine/releases/tag/v1.0-blackpink.

The visuals is toooo dead meat ,the backgrounds keep getting out of frame .

The voiceover is too detailed to keep the pace right which can cause watcher too bore out.

The music and tone used is too soft ,I would prefer more dramatic volumetric background sound and effects which still compliments the voiceover but most importantly keep the item great.


The images used are too less ,the editing done per scene is tooo stale ,


Clone ,deep dive ,and learn everything to implement in our Enging from below gits.

lemomo-ai/lemo-opuscar
https://github.com/lemomo-ai/lemo-opuscar

anil-matcha/open-generative-ai
https://github.com/anil-matcha/open-generative-ai

edenfunf/reelmimic
https://github.com/edenfunf/reelmimic

latent-spaces/brag
https://github.com/latent-spaces/brag

https://github.com/harry0703/MoneyPrinterTurbo/blob/main/README-en.md


MASTER DIRECTIVE: VIDEO ENGINE RESEARCH, BENCHMARKING & SAFE INTEGRATION

Objective

Inspect these five repositories and determine which capabilities can best improve my existing AI documentary video-production system. Implement the highest-value compatible improvements without breaking, replacing, or degrading the existing setup.

Repositories to audit

1. Geneva — https://github.com/geneva-render/geneva
2. OpenFilm — https://github.com/openfilm/openfilm
3. HyperFrames — https://github.com/heygen-com/hyperframes
4. Revideo — https://github.com/redotvideo/revideo
5. Motion Canvas — https://github.com/motion-canvas/motion-canvas

Do not assume repository descriptions, licenses, features, maintenance status, or installation instructions are current. Inspect the actual source code, documentation, release history, dependencies, and licenses before making decisions.

Phase 1 — Establish the existing system's baseline

Before changing anything:

1. Identify the active project repository, branch, current commit, working-tree state, runtime, package manager, dependency versions, and deployment environment.
2. Map the existing architecture, including:
   - Orchestrator and agent interfaces.
   - Research and script generation.
   - Scene planning and timeline representation.
   - Image and video asset ingestion.
   - Existing video downloaders and media processing.
   - AI narration, audio mixing, and subtitles.
   - Rendering, encoding, export, and output validation.
   - Scheduled jobs, API routes, storage, and configuration.
3. Identify the existing production workflow and all working features that must be preserved.
4. Run available baseline tests and the smallest existing end-to-end render. Record results, output properties, and failures.
5. Inspect recent changes and any unfinished work. Do not overwrite work in progress.

If the working tree is dirty, preserve those changes. Do not reset, clean, force-checkout, or overwrite user work.

Phase 2 — Audit all five repositories

Study each repository independently before selecting anything.

For each project, document:

- Verified capabilities and architectural design.
- Actual rendering mechanism and output formats.
- How projects, scenes, timelines, animations, and transitions are represented.
- Support for HTML/CSS, SVG, JavaScript, TypeScript, keyframes, text, images, footage, audio, and subtitles.
- Headless rendering and command-line automation support.
- AI-agent integration and API or MCP interfaces, where available.
- Installation requirements, operating-system compatibility, GPU requirements, and cloud-runtime compatibility.
- Dependency footprint, performance, resource consumption, and failure modes.
- License and relevant restrictions, including commercial use.
- Repository maintenance, releases, known limitations, and compatibility risks.
- Whether the useful functionality can be adopted through an adapter, subprocess, package, or isolated service rather than a wholesale fork.

Distinguish verified functionality from assumptions. Do not claim that a repository supports a feature unless its source, documentation, or a working test establishes it.

Phase 3 — Benchmark representative capabilities

Where technically feasible, create a small isolated proof of concept for the strongest candidates.

Use the same representative documentary scene:

- A full-screen image or video background.
- Animated documentary title and subtitle.
- Evidence card or timeline graphic.
- Lower-third identification.
- Fade or transition between scenes.
- Existing narration audio.
- Accurate subtitle timing.
- A final H.264 MP4 export at 1920 × 1080 and 30 FPS.

Measure actual render time, memory use, output integrity, dependency requirements, and visual quality. Record unavailable or untested metrics rather than inventing them.

Compare candidates on:

1. Visual quality and animation flexibility.
2. Compatibility with the current orchestrator.
3. Reliable unattended rendering.
4. Ease of agent-controlled composition.
5. Integration complexity and maintenance burden.
6. Runtime cost and resource usage.
7. Licensing and long-term sustainability.

Do not integrate every candidate simply because it offers useful features.

Phase 4 — Select the best architecture

Choose the smallest combination of tools that materially improves the existing system.

Prefer these architectural principles:

- Preserve the current orchestrator and its existing contracts.
- Keep the scene planner independent of any specific rendering engine.
- Introduce or reuse a stable rendering-provider interface.
- Use adapters to translate the existing scene/timeline format into a selected engine's native format.
- Keep the existing rendering path available as a fallback.
- Isolate new dependencies and configuration.
- Use reusable motion-graphics templates for titles, lower thirds, evidence cards, maps, chapter headings, and transitions.
- Keep FFmpeg for final encoding, audio mixing, and media operations where it remains the most appropriate component.
- Preserve existing narration, subtitles, asset ingestion, downloaders, storage, and export behavior.
- Avoid duplicating capabilities already implemented reliably.

Do not migrate the entire project to a new framework merely because it is architecturally attractive.

Phase 5 — Implement the best compatible improvements

After the audit, implement the highest-value improvements that can be validated safely.

Requirements:

1. Work in an isolated branch or worktree where available.
2. Pin dependency versions and respect the existing package manager and runtime.
3. Keep new engines optional until they pass the acceptance tests.
4. Avoid breaking changes to existing APIs, scene formats, database schemas, environment variables, and deployment commands.
5. Do not introduce paid APIs, paid rendering services, or mandatory external services.
6. Do not remove existing dependencies or functionality without demonstrated necessity and explicit approval.
7. Do not expose credentials, secrets, or private assets while inspecting external repositories.
8. Do not deploy, publish releases, push changes, modify production infrastructure, or trigger destructive operations without authorization.
9. Document new configuration, installation steps, resource requirements, and rollback procedures.
10. If an integration is too risky, incomplete, incompatible, or cannot be validated in the available environment, leave the production path unchanged and document the blocker.

Prefer a working, minimal integration over a broad rewrite.

Phase 6 — Mandatory regression testing

After implementation:

- Run relevant existing tests.
- Run the original baseline render again.
- Run the new renderer's proof-of-concept export.
- Verify that the output file exists, is nonempty, and decodes successfully.
- Verify resolution, frame rate, video codec, audio presence, audio duration, and subtitle synchronization.
- Check that transitions and animations render correctly.
- Verify that existing scene inputs and asset paths still work.
- Confirm that the existing renderer and fallback remain usable.
- Compare baseline and post-change results for regressions.
- Run the existing build, lint, and type checks where applicable.

Do not report tests as passing unless they were actually executed. Distinguish completed checks, failed checks, and checks that could not be run.

Phase 7 — Deliverables

Create or update the following project documentation, following the repository's existing documentation conventions:

- "VIDEO_ENGINE_AUDIT.md" — findings for all five repositories, including licenses and verified capabilities.
- "VIDEO_ENGINE_BENCHMARK.md" — test methodology, results, limitations, and chosen engine.
- "VIDEO_ENGINE_ARCHITECTURE.md" — provider interface, adapter design, data flow, and fallback behavior.
- "VIDEO_ENGINE_INTEGRATION.md" — implemented changes, configuration, usage, and rollback instructions.

Do not create redundant files if equivalent documentation already exists; update the existing documents instead.

At completion, report:

1. The strongest candidate and why it won.
2. What was implemented and which files changed.
3. What remains unchanged.
4. Tests and renders actually completed, with results.
5. Resource requirements and any limitations.
6. How to run the new renderer and switch back to the previous one.
7. Any blockers requiring my decision.

Final operating rule

RESEARCH → INSPECT → BENCHMARK → SELECT → IMPLEMENT → TEST → REPORT.

Do not stop after producing a plan if a safe, useful implementation can be completed.

Do not rush into integration before establishing the baseline. Never sacrifice the existing working system for an unverified improvement.

Success means a demonstrably better documentary production workflow, a validated rendered output, preserved existing functionality, and a reversible integration — not simply installing five repositories.

---

Below is the method you used to generate few shorts which was actually great level and that is not the level we have right now on our engine.

I'll pick up from where we left off. The new directive: study the reference repos, add a **real-image / clipboard-art layer** to our engine, rebrand as **"The Documentary Engine"**, and then regenerate the last project's shorts with the upgraded look — without breaking what already works.

Let me first re-establish ground truth (worklog + local state):
The worklog reveals something crucial: **the Isdal Woman project (video-003) is already complete** — full 13:53 documentary + 4 vertical shorts (A–D, ~35s each) shipped as release `video-003-isdal-v1.0.0`. So "the last project's shorts" = the **4 Isdal shorts**, and the mission is: upgrade the engine with a real-image/clipboard-art layer, rebrand as **documentary engine**, then regenerate those 4 shorts with the richer look (leaving the main film untouched).

Let me check the repo/git state and find the shorts render pipeline:
All 11 repos cloned. Now let me study the key ones — MoneyPrinterTurbo's image-sourcing machinery first, plus our current shorts engine:
Excellent — major discovery: **we already have image-sourcing DNA in our own repos** — `documentary-agent-kit/scripts/commons_search.py` (Wikimedia Commons), `imgagent` (image search + ranking + downloader), and `vfactory/footage/` (footage library builder). Let me dig into those plus MoneyPrinterTurbo's image pipeline, and inspect our current shorts engine:
Now let me study our current shorts engine (the thing I'll upgrade) and MoneyPrinterTurbo's material pipeline:
The current shorts engine is clear: one vector scene per short + captions + CTA, deterministic `render(t)` via browser. Now I need the frame-rendering mechanism and audio pipeline:
All infrastructure is in place — Playwright + the OpusCar render core at `/home/z/my-project/opuscar/core/render/`. Let me check the engine core, how shorts frames were rendered, and skim the three best references for image-sourcing patterns:
I now have the full picture. The best part: **we already own an image-acquisition agent (`imgagent`)** and a **Wikimedia Commons search script** in `documentary-agent-kit` — MoneyPrinterTurbo's key lesson is the per-asset **source ledger** (provider + search term + creator). Let me set the plan:
**Task type: Type 4/production pipeline work (video engine upgrade + repo rebrand).** My plan:

1. **Learn** from the 11 repos → `ENGINE-NOTES.md` (adopting: MoneyPrinterTurbo's per-asset source ledger, imgagent's search→rank→download contract, ChatCut's skill-file layout, reelmimic's skill-locked agent pattern)
2. **New stills pipeline** in the engine: `core/stills/` (Commons search w/ license metadata → download → PIL "archival plate" prep → ledger)
3. **Source real images** for the Isdal case (police handouts, station, hotel, valley, map, deutschmark)
4. **Shorts v2 engine**: each narration beat gets a real-photo plate in taped/polaroid clipboard style with Ken Burns + stamps/labels — narration audio untouched
5. **Render + mix + publish** as `video-003-isdal-shorts-v2.0.0`, update gh-pages/README/films.json
6. **Rebrand** repo → `superz1402/documentary-engine`

Quick skim of the remaining two references to round out the notes:
I have all the learnings I need. Now the critical path: find out what **real archival images** are available on Wikimedia Commons for the Isdal case (license-safe sourcing with metadata). The `commons_search.py` from our own documentary-agent-kit is standalone — let me run several queries:
Strong results: PD National Library photos of **Isdalen valley**, CC BY-SA **Bergen station**, CC BY **Bergen 1970 rally** (period street scene!), and the exact **500 Deutsche Mark note** (CC BY-SA) needed for short A. Now let me pull the actual evidence photos used by the Wikipedia article (police handouts — sketch, suitcase, jewelry):
The English article holds 4 usable images (police sketch, valley view, cemetery, Penguin missile). Let me check the richer Norwegian article too, then fetch full metadata for all candidates:
Key finding: the police sketch is **not on Commons** (likely fair-use on en.wiki — can't reuse it). I'll skip it and keep evidence beats vector-based where no licensed photo exists. More period searches for the travel trail (short B) and origin city (short D), plus verify the sketch file's license directly:
License checks complete — the sketch is fair-use (skipped ✅), but I have **12 license-safe archival images** (PD National Library/USGS, CC BY-SA station/valley/DM-note, CC BY 1970 municipal archives). Now let me read the render core's `page.mjs` (needed for the shorts render driver), then build everything:
`openDemo` forces `index.html` — the shorts live on `shorts.html?which=X`, so I'll write a custom driver. Let me check `serve.mjs` URL mapping:
现在我将进行构建。首先是 **`ENGINE-NOTES.md`** —— 从这 11 个仓库中提炼出的学习成果文档（任务 1 交付物）：
Now the **stills pipeline tools** — copy our Commons search into the engine, plus a fetcher with validation + auto-ledger:
Now the **Isdal stills manifest** (12 plates, honest captions + credit tags):
所有 12 个素材已下载并验证。现在运行 **PIL prep tool** —— 裁剪至节拍宽高比（beat aspect），应用冷档案双色调（cold archival duotone）、颗粒（grain）和暗角（vignette）：
Let me visually verify the plate treatment looks right before building the engine:
**Bug caught** — a leftover placeholder line (`g.point(lambda v: 0)`) zeroed every plate. Fixing:
The plate treatment is **beautiful** — cold steel-blue archival duotone, exactly the ice-dossier palette. Now let me verify the render browser plumbing, then build the shorts v2 engine:
All plumbing confirmed. Now the **shorts v2 data generator** — merges the untouched narration with a hand-authored beat map (12 real-photo beats + 10 vector beats):
Now the engine. First, quick consistency check — the aliases list already fact-checked in v1's SOURCES:
All verified — 8 documented aliases to reuse. Now the centerpiece: **shorts.html v2** — beat-driven engine with real photo plates (Ken Burns + archival mat + tape + credit tags) and richer vector collages:
Now let me patch the issues I spotted (defs wipe killing `frameClip`, an off-screen card in the oslo decoration, cipher divider math, end-card timing, chip positions):
Now the **render driver** for the shorts (reusable, resumable, with a QC stills mode):
`playwright-core` 无法从影片文件夹中解析（ESM 会忽略 NODE_PATH）。修复方法：使用绝对路径导入：
**Excellent!** The real Bergen station photo in a taped archival mat with the hook title — exactly the "alive" look requested. Checking the other QC frames:
**Bug caught** — a leftover placeholder line zeroed every plate. Fixing:
The plate treatment is **beautiful** — cold steel-blue archival duotone, exactly the ice-dossier palette. Now let me verify the render browser plumbing, then build the shorts v2 engine:
All plumbing confirmed. Now the **shorts v2 data generator** — merges the untouched narration with a hand-authored beat map (12 real-photo beats + 10 vector beats):
Now the engine. All verified — 8 documented aliases to reuse. Now the centerpiece: **shorts.html v2** — beat-driven engine with real photo plates (Ken Burns + archival mat + tape + credit tags) and richer vector collages:
Now let me patch the issues I spotted (defs wipe killing `frameClip`, an off-screen card in the oslo decoration, cipher divider math, end-card timing, chip positions):
Now the **render driver** for the shorts (reusable, resumable, with a QC stills mode):
**Excellent!** The real Bergen station photo in a taped archival mat with the hook title — exactly the "alive" look requested. Checking the other QC frames:
B@12（1970年带有航线定位针的地形图）正是我们想要的拼贴效果。B@17.5 需要修复：别名卡片重叠太严重（名称被截断），且印章与明信片（polaroid）重叠。在修复前，让我先检查一下剩余部分：
B@27 和 C@24 没问题。正在检查剩余的帧：
B@4 和 C@11 都很棒。现在唯一真正的修复是：**vAliases 粉丝 → 可读的 4×2 网格**：
Re-QC the fixed aliases beat + spot-check 4 more frames:
D@24 很美。Aliases 网格现在可以正常工作了，但 stamp/chip 与卡片重叠了——最终的位置修复：
All QC frames pass. Now the **full render** of all 4 shorts (≈840 frames each @24fps):
A 已完成；B 在批量处理中途被终止。正在逐个渲染剩余部分，并设置独立的超时时间：
所有 4 个短片已渲染。现在验证完整性，复用现有的音频混音（旁白未改变），并 mux：
All verified: 1080×1920, durations match the narration. Muxing with the existing audio mixes:
All 4 final shorts are muxed. Now the **rebrand + publish** sequence. First, look at what needs updating — README and gh-pages films.json:
README 缺少 Isdal 行，且 films.json 仍指向旧名称。让我检查一下上传脚本和 youtube.md，然后执行完整的发布序列：
Now the README rebrand (with Isdal row + shorts v2), image credits in youtube.md/CREDITS, then commit → rename → gh-pages → release:
The stills weren't staged — checking gitignore rules:
`stills/` was a leftover blanket ignore. Plates + the license ledger must be in the repo (only `raw/` is re-derivable):
推送被拒绝 —— 远程有新的提交。正在检查差异：
那只是上一次会话中的 README 行——我的重写已经涵盖了它。正在 rebase 并保留我们的 README：
Main pushed. Now the **rebrand — rename the repo** via the GitHub API:
Rename successful. Updating the Pages URL in README, then the gh-pages branch:
Worktree 中的 Shell cwd 异常。正在使用 `git -C` 重新尝试：
The worktree is gone — checking whether the push actually landed before the teardown:
gh-pages 已上线。确认 shorts 行已在已发布页面中，然后清理 worktree：
New Pages URL is live (200); old one 404s (Pages doesn't redirect). Sweeping for any leftover old Pages links in published docs:
Repo URLs auto-redirect after rename (only the Pages site doesn't). Checking the existing v1.0.0 release body for old Pages links:
Now creating the **shorts v2 release** with all four verticals:
All four uploaded. Final verification + worklog:
All done ✅ — here's what changed:

**Studied & adopted** — `ENGINE-NOTES.md` documents what we took from MoneyPrinterTurbo (per-asset source ledger), imgagent (verified-bytes contract), ChatCut (known-errors + verification skills) and reelmimic — nothing that worked was changed.

**New "real images" layer** — `core/stills/` now searches Wikimedia Commons with license metadata, validates downloads, and produces cold-duotone archival plates. 12 real Isdal plates (Bergen station, the 500-DM note, 1970 topo map with route pins, Nuremberg, Møllendal cemetery…) are now embedded in taped evidence-board frames — the fair-use police sketch was deliberately excluded and documented.

**Rebranded** — repo is now `superz1402/documentary-engine`; landing page, README, releases and credits all updated.

**Shorts regenerated** — all 4 Isdal shorts re-rendered (1080×1920) with real plates on every beat, same narration/audio, shipped as `video-003-isdal-shorts-v2.0.0` and linked on the landing page.

**Next steps you might want:** ① point your YouTube uploads at the v2 shorts, ② have me apply the stills layer to the *full* Isdal film or Zodiac next, ③ wire the `ttagent`/`ytagent` publish agents so shorts auto-post — just say the word.

---

The below is the prompt I have before the above tasks you did.

Let's try to grow more so we can source images as well as clipboard arts to make videos more alive ,don't change whatever going good just learn some repos so how we can improve our system.

https://github.com/harry0703/MoneyPrinterTurbo/blob/main/README-en.md

https://github.com/superz1402/ahyeon-documentary
https://github.com/superz1402/opuscar-studio
https://github.com/superz1402/vfactory
https://github.com/superz1402/films
https://github.com/Bilal140202/imgagent
https://github.com/superz1402/somerton-man-documentary
https://github.com/superz1402/documentary-agent-kit
https://github.com/superz1402/promos.
edenfunf/reelmimic
https://github.com/edenfunf/reelmimic
ChatCut-Inc/agent-plugin
https://github.com/ChatCut-Inc/agent-plugin

https://github.com/Bilal140202/ttagent
https://github.com/Bilal140202/igagent
https://github.com/Bilal140202/xthread-agent
https://github.com/Bilal140202/ytagent
https://github.com/ansaribilal14/personal-social-agen

The topics would still remain the same so be smart on that part,our videos are good right now but want to apeal more with real clipboard style images or Google images embed inside each screen where needed to improve better also our new repo name would be the documentary engine , remember right now things are going good but we still need to expand and improve once done work on regenerate better version for the last project shorts not the real video just the shorts

I expect better videos from you take your time ,mainly used the whole of the prompt I am give as a to do task devide it into multiple task and use git issues as your task todo setup one by one do everything,mainly keep this full as task-main.md same as word to word then start documentinh it into multiple task with detailed setup using git issues whichever I ls solved and implemented add it is issues resolved on git too.

Take your time and do your best
