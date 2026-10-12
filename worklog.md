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
