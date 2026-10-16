# IMAGE ACQUISITION UPGRADE — Implementation Plan (Task 8)

Written AFTER inspecting the actual code, per the "inspect before modifying" directive.
Branch: `feat/image-acquisition`. No rendering/narration/timeline/mixing/QC/release files touched.

## 1. Root cause of the Dyatlov Commons failure

Two independent causes, both verified:

1. **Network (transient, external)** — the sandbox egress gateway throttled/403'd every
   Wikimedia domain for the entire Task-7 session (evidence: `worklog.md` Task-7 entry
   "Commons fully throttled… 403 on every domain"; `CHECKPOINT.md` "Commons THROTTLED at
   gateway"; `images/commons_candidates.json` left `[]`). Re-test on 2026-10-15:
   `commons.wikimedia.org/w/api.php` → **200 OK (1.25 s)** — the block was temporary.
2. **Architecture (permanent, ours)** — the only Commons "integration" was
   `scripts/v004_commons_sweep.py`: a one-shot sweep with **no cache, no resumability,
   no partial-progress persistence, no scheduling, and no consumer** (its output JSON is
   read by nothing). One network outage therefore zeroed the whole photo workstream.

Fix follows directly: a resumable, cached, multi-provider acquisition layer whose
candidates, downloads, and provenance survive restarts and can be run opportunistically
whenever egress allows.

## 2. What exists and gets reused (no duplication)

| Existing component | Role in this upgrade |
|---|---|
| `photo()` / `plate()` / preload in `work/video-*/src/comp_modes.mjs` | Renderer reads `images/cache/<slot>.jpg` and falls back to labelled reconstructions when absent — **the integration point; zero renderer changes** |
| `scene_briefs.json` (`photos` slot names + `fallback` + `why`) | Scene-level discovery contract (Phase 5 input) |
| `images/terrain/manifest.json` (v004) | Provenance-manifest pattern; stays the source of truth for terrain plates; new ledger notes it, does not duplicate it |
| `images/CREDITS.md` (v002) | Existing human-facing usage ledger; acquisition ledger records acquisition; CREDITS keeps recording *usage* |
| `scripts/v004_commons_sweep.py` | Prototype Commons query logic (categorymembers + search + extmetadata) — API knowledge reused, rewritten as a resumable provider |
| `lemo-opuscar/tools/fetch.sh` / `assets.json` | House conventions: sha256 verification, resumable downloads, foreground one-call-per-invocation |
| Isdal `images/search/fetch_batch.sh` + `pick_photos.py` | The deprecated ad-hoc approach (no license check, no validation → watermark incident); kept untouched as history, not extended |
| Python 3.12 + Pillow 11.3 + requests (sandbox-verified) | Implementation language for the tool (matches existing pipeline scripts) |
| pytest | Test runner (no new deps; sandbox-verified) |

## 3. Design — smallest complete solution

New package `scripts/imgacq/` (same layer as the other pipeline scripts):

- `providers.py` — provider registry, mandated priority order:
  1. **SearXNG** (self-hosted; used only if `IMGACQ_SEARXNG_URL` is set AND reachable;
     JSON API; graceful skip otherwise — never assumed to exist)
  2. **Openverse API** (api.openverse.org — free, anonymous, license-filtered; live-verified)
  3. **Internet Archive** (advancedsearch JSON; strict timeout; graceful skip on
     hang/403 — live evidence of the unavailable-provider path)
  4. **Wikimedia Commons** (search + categorymembers, extmetadata license fields) — fallback
  Normalized `Candidate` records; per-call bounded timeouts; honest UA; no proxies, no
  CAPTCHA/auth bypass; robots/terms respected (APIs used under their published terms).
- `download.py` — bounded timeouts, exponential backoff + jitter, size cap, magic-byte
  signature check (JPEG/PNG/WebP/GIF/TIFF), full decode via Pillow, min dimensions,
  cache under `work/<film>/images/incoming/`; failed downloads are never silently replaced.
- `dedup.py` — SHA-256 exact dedup + 64-bit dHash perceptual dedup (Hamming threshold).
- `ledger.py` — per-film `work/<film>/images/ledger.json`, single source of truth for
  acquired images: asset id, file path, source page URL, media URL, title/creator/date,
  provider, retrieval timestamp, license + rights URL, sha256, dimensions, episode/scene
  slot, classification, review status. Classifications:
  `authentic_verified | documentary_context | illustration | reconstruction | unverified`.
  Search metadata alone can never yield `authentic_verified`; unclear license ⇒ flagged
  for review, never auto-approved.
- `scene_queries.py` — reads `work/<film>/src/scene_briefs.json` and generates multiple
  targeted queries per photo slot (subject + aliases, dates, locations, document/evidence
  types, archive terms), then ranks candidates by license, resolution, authenticity
  evidence, and scene fit.
- `stage.py` — copies an approved ledger entry into `work/<film>/images/cache/<slot>` so
  the existing deterministic renderer picks it up on the next re-render; unstaged/failed
  acquisitions change nothing (existing fallback intact).
- `cli.py` — `python3 scripts/imgacq/cli.py <providers|discover|download|validate|dedup|
  ledger|scene-queries|stage|e2e> …` one command per call, foreground.

## 4. Tests (pytest, `scripts/imgacq/tests/`)

Provider normalization against local stub HTTP servers (SearXNG contract, provider outage,
rate-limit retry behavior), HTML-masquerading-as-image rejection, corrupt-file rejection,
oversize rejection, sha256 + dHash dedup, ledger persistence + classification rules,
scene-query generation against the real v004 briefs, staging backward compatibility.

**Live E2E (not mocked)**: Commons → "Dyatlov Pass 1959" → pick a file with documented
reuse rights → download → validate (signature + decode + dimensions) → hash + dedup →
ledger write → stage into `work/video-004-dyatlov-pass/images/cache/` → load through the
film's own preload → assert `photo()` resolves → render one still frame with the existing
renderer. Every step's real output recorded in the delivery report.

## 5. Explicitly out of scope

No changes to: narration, timeline, scene modules, transitions, score/SFX/mix, loudnorm,
SRT, QC gates, release scripts, `build_seg.sh`/`build_finish.sh`, terrain manifest,
CREDITS.md content, films.json. No paid APIs, no API keys, no proxy/CAPTCHA evasion,
no background processes, no `z-ai image-search` dependency (closed gateway tool; the
watermark incident came through it).
