# Worklog

---
Task ID: 1
Agent: Super Z (main agent)
Task: Build a documentary on the ostrich using the lemo-opuscar skill (https://github.com/lemomo-ai/lemo-opuscar), then release the finished video in a GitHub repo release section under superz1402; add the NVIDIA NIM key as an Actions secret.

Work Log:
- Cloned github.com/lemomo-ai/lemo-opuscar and read AGENTS.md, DIRECTOR.md, TECHNIQUE.md, core/README.md, the engraving STYLE.md + DEMO.md + engine sources (burin/plate/wash/copper).
- Chose style: Copperplate Engraving (natural-history plates are the style's native use case). Wrote TREATMENT.md (3 candidate structures, chose "one plate, one build"; logline; benchmark; 12-shot list; beat sheet; 88 BPM cue map; sound design table; subtitle/title design; colour reserve).
- Installed deps: core tier (npm, chromium-headless-shell, .venv), voice tier (Kokoro + faster-whisper), music tier (numba), VCSL instrument samples (harpsichord, harp, recorder, triangle). Downloaded OFL fonts (Bodoni Moda, Pinyon Script).
- Voice: 6 narration lines (Kokoro bm_george, speed 0.92), ASR check passed (exit 0) with asr-field spellings; word timestamps exported.
- Built the film in /home/z/my-project/ostrich-plate/: ostrich.js (subject authored in local units: body/neck/head rings sampled for contours + hatch; plumes via fur; two-toed feet; nest vignette; magnified eye+brain detail art), film.js (85-beat timeline, log-zoom camera keys, copper opening following the burin tip, early proof peel, three hatch passes, dimension labels, height/stride rules, eye roundel with live magnification → burnish → re-cut → travel ride, amber iris wash, press-roller transition, egg washes, finished plate with title/latin/plate no./series/credits), engine copied from the style demo.
- Iterated the anatomy against rendered stills (4 rounds: contour sampling via arc(), thigh-under-plumage body, vertical shanks, neck taper, roundel art recentred).
- Audio: music/score.py (88 BPM, D minor → D major at the iris; harpsichord/lute/harp/recorder/triangle from VCSL + pluck model), mix.py (workroom/paper room beds, procedural foley from events.json — burin hiss, chatter, hatch scratches, ring, burnish, travel whoosh, press/roller, peel crackle, plip/brush, nest, letter ticks, lock — voice compressed and ducked, true silence at the eye), mastered via mux.sh loudnorm to −14 LUFS (measured −14.1).
- Subtitles: hand-timed cue plan verified against the readcheck formula; .srt exported; burned deckled-script slips.
- QA: readcheck 24 OK / 0 BAD; no black frames; full-mix whisper transcript verified; contact sheet reviewed.
- Render: 1391 frames (2 workers, ~204 s), muxed to ostrich-plate.mp4 (57.96 s, 1920×1080, H.264+AAC, 19.5 MB) + poster.jpg (t=56.8).
- Deliverables in project folder: film, poster, .srt, TREATMENT.md, CREDITS, build.sh, README.md, full source.
- GitHub (token of superz1402): created repo superz1402/ostrich-documentary, pushed source (main), added NVIDIA_NIM_API_KEY as an Actions secret (encrypted via repo public key), created Release v1.0.0 with ostrich-plate.mp4 + poster.jpg + ostrich-plate.srt, set 10 topics.

Stage Summary:
- Film: /home/z/my-project/ostrich-plate/ostrich-plate.mp4 (58 s, −14 LUFS).
- Release: https://github.com/superz1402/ostrich-documentary/releases/tag/v1.0.0
- Repo: https://github.com/superz1402/ostrich-documentary (source + one-command build.sh).
- Decisions: style=engraving; structure="one plate, one build"; native-size beat replaced by "egg, twice natural size" vignette (documented in TREATMENT.md); narrator bm_george; 88 BPM D-minor→D-major score.

---
Task ID: 2
Agent: Super Z (main agent)
Task: URGENT RECOVERY — operator lost access to old GitHub account (superz1402, now deleted); back up everything and set up all infrastructure under new account ansaribilal14 with a fresh token.

Work Log:
- Verified new token (scopes: repo, workflow, admin:org, write:packages) authenticates as ansaribilal14.
- Assessed losses: old account returns Not Found on GitHub API (all repos, releases, assets, Pages site unrecoverable); local container had been reset (work/, ostrich-plate/, lemo-opuscar/ emptied).
- Recovered survivors: worklog.md (ostrich task record), scripts/build_subs.py, tool-results/read_*.txt (37 KB verbatim copy of burin.js engraving engine).
- Configured git globally: user ansaribilal14 / 295587816+ansaribilal14@users.noreply.github.com, credential store (~/.git-credentials, chmod 600).
- Created repo ansaribilal14/opuscar-studio via API.
- Wrote BRAIN.md — the git-as-main-brain methodology (prime directives, film registry, 10-step pipeline, compliance rules incl. AI-image labelling, git protocol, environment/credentials map, recovery doctrine, Isdal next-task brief).
- Wrote README.md (Documentary Engine branding), docs/RECOVERY-2026-10-13.md (incident report + lessons), docs/films.json (3-film registry: isdal-woman in_production, zodiac trailer_only, ostrich-plate rebuild_planned), docs/index.html (single-file, no-dep, data-driven landing page).
- Recreated dir skeleton with .gitkeep: work/, ostrich-plate/, lemo-opuscar/.
- Committed and pushed all of the above to main.

Stage Summary:
- New home: https://github.com/ansaribilal14/opuscar-studio (backup complete: all surviving assets + full method now in git).
- Pending on this repo: NVIDIA_NIM_API_KEY Actions secret, GitHub Pages enablement (main /docs) — done in this task unless noted otherwise.
- Lesson encoded in BRAIN.md §0: push after every step; repo is the brain, not the account.

---
Task ID: 2 (follow-up)
Agent: Super Z (main agent)
Task: Complete recovery setup — Actions secret, Pages, sanitized tooling.

Work Log:
- Registered NVIDIA_NIM_API_KEY as Actions secret on ansaribilal14/opuscar-studio (libsodium sealed box via scripts/set_secret.py).
- Sanitized set_secret.py to read credentials from env vars only, then committed (safe for repo reuse by any agent).
- Enabled GitHub Pages: main branch, /docs path -> https://ansaribilal14.github.io/opuscar-studio/
- Verified pages build + repo file tree via API.

Stage Summary:
- Infrastructure fully migrated: repo + brain docs + landing page + secret + Pages all live under ansaribilal14.
- Next task on the board (per BRAIN.md §6): video-003 Isdal Woman full film.

---
Task ID: 3
Agent: Super Z (main agent)
Task: video-003 — full Isdal Woman documentary + 4 vertical shorts, per BRAIN.md §6 and the 10-step pipeline.

Work Log:
- Research: 11 web searches + full reads of Wikipedia (rev 1377389703) and BBC 13 May 2017; wrote research/SOURCES.md (S1-S3 + upstream list), research/TIMELINE.md (40+ dated entries 1970-2026), research/CLAIMS.md (28 established E-claims, 7 disputed/open D-claims, 5 human-verification items).
- Treatment: TREATMENT.md — chose "one file, one section" structure over chronological and theory-led candidates; 9-beat sheet ~15-16 min; case-file visual language; compliance checklist.
- Script: src/narration.json canonical — 40 blocks (38 spoken), 1808 words, every block tagged to claim-ledger IDs; generated SCRIPT-readable form via JSON (single source of truth).
- TTS: NIM endpoints 404'd (API changed) — documented deviation, pivoted to platform TTS (z-ai tts, voice tongtong, speed 0.95); ASR round-trip QA passed; 38 blocks / 882.6s generated with 429 backoff handling.
- Images: image-search → 4 assets cached with images/CREDITS.md (BBC Isdalen photo, 1970 police sketch w/ original Norwegian caption, Bane NOR station, Life in Norway street); credits rendered on screen; no AI image used anywhere; Møllendal kept vector to avoid location misrepresentation.
- Pipeline (rebuilt after container loss): src/engine.mjs (primitives), src/scenes.mjs (40 scenes), src/timeline.js (deterministic; 988s/23,714 frames), src/render_range.mjs (node-canvas, 67ms/frame), src/music.py (D-minor score, narration-aware ducking, float32/O(N) after OOM fix), src/mix.py (ffmpeg adelay placement + loudnorm), build.sh (2-worker render → encode → mux), src/gen_subs.py (148 cues).
- QA: 14 still frames reviewed across all beats; DNA-scene double-label and end-card collision found and fixed; ASR spot-check at 380-402s matched narration verbatim; loudness −15.9 LUFS / TP −1.5 dBTP; duration 988s = 16.47 min.
- Shorts: src/shorts.mjs + build_shorts.sh — 4 vertical (720×1280) shorts reusing verified narration: A suitcases 109s, B notebook 70s, C spy 102s, D identity 95s.
- Release: video-003-isdal-woman-v1.0.0 created with 7 assets (full film 35.3MB, 4 shorts, poster, .srt) — all HTTP 201.
- Registry: docs/films.json video-003 → released; this worklog; everything pushed.

Stage Summary:
- Film: work/video-003-isdal-woman/build/isdal-woman-003.mp4 (16:28, 1280×720, −16 LUFS).
- Release: https://github.com/ansaribilal14/opuscar-studio/releases/tag/video-003-isdal-woman-v1.0.0
- Compliance: no invented dialogue/evidence; verdict contested on screen; spy/murder/sex-worker theories labelled DISPUTED/UNVERIFIED; 1991/2005 accounts stamped UNVERIFIED; no body depiction; archival images credited; open claims listed in release notes.
- Method note: NIM TTS deprecated → platform TTS recorded as the new default in future runs; pipeline code now lives in the repo and is reusable for video-004.

---
Task ID: 3-a
Agent: main (Super Z)
Task: video-003 v1 QA triage after user rejection ("shitty and worst") + v2 rebuild kickoff

Work Log:
- Downloaded released isdal-woman-003.mp4 from release video-003-isdal-woman-v1.0.0; sampled 8 frames at 30/120/250/420/560/700/850/950s
- QA VERDICT: v1 visuals unusable — frame@250s is 100% pure black; frame@560s has one tiny text box in black void; DNA helix @850s at ~3% opacity; 720p@~91kbps video; monospace debug-HUD styling; no motion; real photos barely used
- Root cause: scenes.mjs composed tiny elements on near-black base; x264 crushed static near-black content to nothing
- Assets confirmed GOOD: narration.json (40 blocks), 38 TTS wavs (882.6s), timeline.js, mix.py/music.py, research trio (SOURCES/TIMELINE/CLAIMS)
- Toolchain reinstalled (node canvas) after container reset; disk check: 9.1GB free => v2 MUST stream frames into ffmpeg (no PNG intermediates)
- Image search executed (10 queries); rejected all Alamy (watermarks) + StockCake (AI) results on policy
- Downloaded + verified 7 new real photos (moody_peak, misty_fjord, hairpin_road, rorbu_coast, archive_folders, stavanger_street, train_winter); archive_folders cropped to remove NYT UI chip; knit_texture dropped (unusable)
- CREDITS.md updated to v2 (11 photos, policy notes)

Stage Summary:
- DECISION: full visual rebuild (engine v2 + scenes v2 at 1920x1080, photo-first cinematic design, animated grain, Ken Burns on photos, crossfades instead of black dips, streaming encode). Narration/audio/mix/timeline untouched so SRT + durations stay valid.
- Next: engine film_look additions -> scenes2.mjs (all 40 visuals) -> streaming render_encode -> luma QA -> shorts rebuild -> poster -> release v2.0.0

---
Task ID: 3-b
Agent: main (Super Z)
Task: video-003 v2 visual engine — build + smoke validation

Work Log:
- Wrote src/film_look.mjs: graded photo cache (desaturate+cool, top-level-await preload), Ken Burns photoPlate/photoCard, animated grain tiles, basePlate luminance floor + halation, vignette, chrome2 w/ progress hairline, kicker/display (word-level reveal)/rule/paper/stamp2/fog2, stylized dot-grid Norway map w/ animated routes, glow
- Wrote src/scenes2.mjs: all 40 visuals rebuilt photo-first at 1920x1080 scale-relative; renderFrame dispatcher with 0.9s crossfades between blocks + pause gap-holding (v1 black-gap bug eliminated); persistent beat file-tab
- Wrote src/render_encode.mjs: frames streamed JPEG q93 into ffmpeg stdin (disk-safe: no PNG intermediates)
- Fixed: package.json type=module regression from npm init; loadImage async preload; norwayMap route destructure; DNA haplogroup overflow; suitcase contrast; end_card text brightness
- Smoke validation: 53 frames across all 40 scenes inspected visually via contact sheets — photos visible, big type, no voids

Stage Summary:
- v2 engine validated frame-accurate at 720p smoke scale; ready for full 1080p build
- Next: build_v2.sh (2-worker segmented stream encode + concat + mux v1 mix), qa_luma.py void check, full render launch

---
Task ID: 3-c
Agent: main (Super Z)
Task: video-003 v2 — resume interrupted render; worklog-discipline fix (log before resume, commit after every step)

Work Log:
- Session restarted after tool-pipeline outage killed the post-QA-fix re-render. User demanded worklog be updated before any session closes — adopting hard rule: append worklog + push BEFORE and AFTER each render round.
- State verified before touching anything: seg_0 (frames 0-1976) and seg_1 (1977-3953) complete at 1977 frames each, rendered 04:03 AFTER QA-fix commit 8c51e9a (film_look.mjs base-lift +11, scenes2.mjs code_decode/autopsy brightening +21) -> segments 0-1 valid, no re-render needed.
- Remaining: seg_2..seg_11 (10 segments, 2-parallel per tool call, ~340-460s per pair), then build_finish.sh (concat 12 -> score -> mix -> mux master -> poster), full-film luma QA (scripts/qa_luma.py), 4 vertical shorts v2 (build_shorts_v2.sh), release video-003-isdal-woman-v2.0.0, films.json + landing page update.
- Idempotency: every segment re-runnable standalone (build_seg.sh k 12); frame counts verified with ffprobe after each round; partial files simply re-rendered.

Stage Summary:
- Resume point: seg_2 next. Engine/timeline/narration/audio locked; QA fixes committed in 8c51e9a and pushed.
- Discipline change: worklog now updated at every round boundary, not only at session end.
