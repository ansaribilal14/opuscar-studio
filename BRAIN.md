# BRAIN.md — The Documentary Engine's Main Brain

> **This repository IS the method.** Any agent — anywhere, anytime — should be able to
> reproduce our entire documentary workflow by reading this file, `worklog.md`, and the
> project folders. No knowledge lives only in an agent's memory; it lives here, in git.

---

## 0. The Prime Directives

1. **Git is the brain, not you.** Every decision, method, script, and artifact must be
   committed and pushed. If it is not in the repo, it does not exist.
2. **Push after every step.** Commit messages describe *what* and *why*. The worklog
   (`worklog.md`) is append-only and updated at the end of every task.
3. **Nothing is lost that is pushed.** Losing access to one machine or account must never
   destroy work (see `docs/RECOVERY-2026-10-13.md` for why this rule exists).
4. **Truth over drama.** This engine makes documentaries about real people and events.
   Facts are sourced; uncertainty is stated; nothing is invented.

---

## 1. Project Identity

| Field | Value |
|---|---|
| Studio | **Opuscar Studio** — "The Documentary Engine" |
| Repo (current home) | `ansaribilal14/opuscar-studio` |
| Film registry | `films.json` (landing page data source) |
| ID convention | `video-001`, `video-002`, … (sequential, never reused) |
| Workspaces | One folder per film: `/home/z/my-project/work/<film>/` |

### Film registry (as of 2026-10-13)

| ID | Title | Status |
|---|---|---|
| video-001 | (unassigned) | — |
| video-002 | Zodiac — **RELEASED v3.0.0** (image-first v4 engine) | tag `video-002-zodiac-v3.0.0` |
| video-003 | *The Isdal Woman* — **RELEASED v2.2.0** (full film + 4 shorts, edge-tts) | tag `video-003-isdal-woman-v2.2.0` |
| video-004 | *Dyatlov Pass: What Really Happened to the Nine Hikers?* — **RELEASED v1.0.0** (15:10 full film) | tag `video-004-dyatlov-pass-v1.0.0` |
| ostrich-plate | 58 s copperplate-engraving natural-history short (lemo-opuscar style) | Source LOST; release `superz1402/ostrich-documentary` gone; method preserved below |

---

## 2. The Method — Documentary Pipeline (10 Steps)

Every film follows the same deterministic pipeline. **Do not skip steps; do not reorder
the compliance-critical ones.**

### Step 1 — Research & Sources
- Collect facts from primary/authoritative sources: police records, Interpol, national
  broadcasters (e.g. BBC), established newspapers. No blogs, no forums, no AI folklore.
- Build **`SOURCES.md`**: every claim gets a source line + access date.
- Build a **dated timeline** of events (each entry: date, event, source).
- Build a **claim ledger**: `claim | status (established / disputed / open) | source`.
  Only `established` claims may be stated as fact in the film.

### Step 2 — Treatment & Beat Sheet
- Write a treatment: logline, structure choice (among 2–3 candidates), beat sheet.
- Documentary default structure: ① cold open ② discovery ③ evidence trail ④ turning
  point ⑤ theories weighed *against the evidence* ⑥ modern forensics/reexamination
  ⑦ open ending that respects the victims.
- Runtime targets: full film 12–18 min; shorts 45–70 s (vertical 1080×1920).

### Step 3 — Script
- Narration-only script mapped to timeline beats. Word count ≈ 150 words/min.
- **Forbidden**: invented dialogue, invented quotes, invented evidence, invented forensic
  conclusions, asserting guilt/espionage beyond the record, gore, padding, generic-AI tone.
- Speculation must be *labelled as theory* and immediately balanced with what the
  evidence does and does not support.

### Step 4 — Voice (TTS)
- Engine: **edge-tts** (Microsoft neural voices) — PERMANENT default, operator-mandated
  2026-10-13. House narrator (operator-mandated 2026-10-14, issue #5):
  **`en-US-AndrewMultilingualNeural`, rate `-3%`** — recovered from
  `ansaribilal14/last-stop-yt-engine` (`projects/ahyeon/config.json`,
  `pipeline/tts_all.py`); ~136 wpm effective on documentary copy.
- Capture **WordBoundary events** per block (`audio/words/<id>.words.json`) for
  word-timed SRT cues and SFX alignment (last-stop contract).
- Prior narrator: `en-US-GuyNeural`, `pitch -1Hz` (video-001..003 era) — superseded by
  operator directive; originals preserved per project in `audio/blocks_guy/`.
- One file per narration block (`gen_tts_andrew.py`); new scripts are free-run (timeline
  rebuilt around new durations); legacy re-voice fitting lives in `revoice_edge.py`.
- History (do NOT regress): NIM TTS 404'd (video-003) → platform voice "tongtong" shipped
  once → operator REJECTED it. edge-tts or nothing.
- Generate one file per narration block; verify duration vs. timeline; normalize.

### Step 5 — Deterministic Render (render(t))
- Every visual is code: SVG/Canvas objects exposing `render(t)`; a `timeline.js` maps
  narration boundaries to time.
- `render_range.mjs` renders frames deterministically (same seed → same pixels);
  `build.sh` assembles with ffmpeg; `mix.py` mixes narration/music/beds.
- **Audio standard**: loudnorm −16 LUFS (trailer/shorts −14 LUFS acceptable if noted).
- **ffmpeg rule**: always `-nostdin` and redirect stdin (`< /dev/null`) — the sandbox
  otherwise hangs.
- **Fonts** (Tinos is broken in the sandbox): DejaVu Serif (titles), Carlito (body),
  DejaVuSansMono (mono/labels).

### Step 6 — Real Images (archival material) — COMPLIANCE-CRITICAL
- Search → download → record **license + attribution + URL + access date** in
  `SOURCES.md` → cache locally → embed inside `render(t)` frames as needed.
- **ABSOLUTE RULE**: AI-generated images must never be presented as real archival
  photos, crime-scene photos, or real documents. If a visual is AI-generated or a
  reconstruction, it is *labelled as such on screen* (e.g. "RECONSTRUCTION").
- Public-domain / press-archive images: check license, credit exactly as the source
  requires.

### Step 7 — Shorts
- 4 vertical shorts per film, cut from the strongest beats (per film's short plan).
- Same compliance rules; each short ends with a pointer to the full film.

### Step 8 — QA
- `readcheck` (readability timing formula) must pass; no black frames; full-mix
  transcript spot-check; contact-sheet review of keyframes; loudness measured.

### Step 9 — Release
- GitHub Release on the film's repo or on `opuscar-studio`: tag
  `video-XXX-<slug>-v1.0.0`; assets: `*.mp4`, poster `.jpg`, `.srt`.
- Release notes contain: title, logline, **full source list** (from SOURCES.md), and a
  list of *open claims requiring human verification*.

### Step 10 — Landing Page
- Add the film to `films.json` (root of `docs/`); Pages site is data-driven — a new
  film is *one folder + one JSON entry*.
- Site: `docs/index.html` — single file, no external dependencies.

---

## 3. Git Protocol (how agents must work here)

- Read `worklog.md` **before** starting; append your section **after** finishing:

```
---
Task ID: <global order, e.g. 2-a / 2-b / 3>
Agent: <name>
Task: <one line>

Work Log:
- <concrete steps>

Stage Summary:
- <results, decisions, artifact paths>
```

- Commit after every meaningful step (`git add -A && git commit && git push`).
- Never commit secrets (API keys, tokens). Keys live in `.env` locally (gitignored) and
  in GitHub **Actions secrets** remotely.
- Never rewrite pushed history; append.

---

## 4. Environment & Credentials Map

| Item | Where it lives |
|---|---|
| GitHub token | provided per-session by the operator; goes into `~/.git-credentials` (chmod 600) — **never** into the repo |
| NVIDIA NIM TTS key | GitHub Actions secret `NVIDIA_NIM_API_KEY`; locally `.env` (gitignored) |
| Fonts | sandbox paths under `/usr/share/fonts/truetype/` (`dejavu`, `english/Carlito`, …) |
| ffmpeg/ffprobe | system; always `-nostdin`, stdin redirected |

---

## 5. Recovery Doctrine

- If the account or machine is lost: the new home repo is authoritative; rebuild any
  lost artifact from this brain + worklog. Document the loss in `docs/`.
- After any recovery: re-verify Actions secrets, Pages, and `films.json` integrity
  (see `docs/RECOVERY-2026-10-13.md`).

---

## 6. Current Priority — none open; video-004 released 2026-10-15

video-004 *Dyatlov Pass* shipped through the full pipeline: research ledger → license-
verified assets (SRTM terrain; reconstructions labelled) → 42-block narration → v4
image-first scenes → 10-cue score + blizzard SFX → 16 verified segments → gates
(−16.1 LUFS, ASR 0.97, 0 decode errors, 10-question review) → release
`video-004-dyatlov-pass-v1.0.0`. The Unclosed File identity (black / archival beige /
crimson) maintained. Commons asset slots exist in the project for period photos if
licences verify later — the render falls back to labelled reconstructions today.

---

*Last updated: 2026-10-13 by the recovery agent. This file is the entry point of the
brain — keep it current.*
