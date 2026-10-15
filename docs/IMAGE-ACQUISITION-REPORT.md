# IMAGE ACQUISITION UPGRADE — Delivery Report (Task 8)

Branch: `feat/image-acquisition` · PR: opened against `main` · Date: 2026-10-15

## 1. Root cause of the previous image-access failure

**Two independent causes, both verified with evidence:**

1. **Rate limiting by Wikimedia itself, on a shared egress IP.** The 403 body served by
   Wikimedia's Varnish cache (`cp5024`) reads `Error: 403, Too Many Reqs (1862a4b)` and
   names the client IP `8.212.10.159` — the sandbox's shared outbound IP. Aggregate
   traffic from all tenants tripped the limiter, which is why *every* Wikimedia domain
   returned 403 for the whole Task-7 session and why the block appeared intermittent
   within single sessions (200 → 403 after a few calls; today it oscillated 403 → 429).
   Not a code bug, not fixable by headers; policy forbids evasion, so the correct
   engineering response is graceful degradation + caching + retry-later.
2. **The only "integration" was a one-shot script.** `scripts/v004_commons_sweep.py` had
   no cache, no resumability, no partial-progress persistence, and no consumer (its
   output JSON was read by nothing). One network outage therefore zeroed the photo
   workstream (`images/commons_candidates.json` stayed `[]`).

## 2. Exact files changed (all on the branch; renderer src/ untouched — 0 diffs)

```
docs/IMAGE-ACQUISITION-PLAN.md                                   (plan, committed first)
scripts/imgacq/__init__.py common.py providers.py download.py
scripts/imgacq/dedup.py ledger.py scene_queries.py stage.py cli.py
scripts/imgacq/tests/{conftest,test_providers,test_download,
                      test_ledger_stage,test_scene_queries}.py
work/video-004-dyatlov-pass/images/acq_config.json               (research-derived data)
work/video-004-dyatlov-pass/images/incoming/candidates.json      (live discovery cache)
work/video-004-dyatlov-pass/images/ledger.json                   (provenance ledger)
docs/IMAGE-ACQUISITION-REPORT.md                                 (this file)
```

## 3. Free tools and providers implemented (priority order per directive)

| # | Provider | Access | Status this session |
|---|----------|--------|---------------------|
| 1 | Self-hosted SearXNG | `IMGACQ_SEARXNG_URL` env; JSON API; graceful skip | Not configured (correctly absent from registry) |
| 2 | Openverse API | anonymous, keyless, license-filtered | **LIVE: 200** — real candidates retrieved |
| 3 | NASA Image Library | anonymous, keyless public archive catalog | **LIVE: 200** — real archival candidates |
| 4 | Internet Archive | anonymous advancedsearch | Unreachable (connect timeout) — degrades gracefully, live evidence |
| 5 | Wikimedia Commons | anonymous API | Rate-limited (403/429 from Wikimedia Varnish, shared IP) — degrades gracefully, live evidence |

No paid API, no key, no account, no proxy rotation, no CAPTCHA/auth bypass anywhere.
`z-ai image-search` (the closed gateway tool behind the old watermark incident) is not
part of the pipeline.

## 4. Configuration required

None by default. Optional: `IMGACQ_SEARXNG_URL=http://host:port` enables the SearXNG
provider when a self-hosted instance exists. Everything else (film dir, floors, caps)
is CLI flags or per-film `images/acq_config.json` data.

## 5. Live retrieval test results (not mocked)

`python3 scripts/imgacq/cli.py e2e --film video-004-dyatlov-pass --q "Apollo 11 surface" ...`
→ **10/10 steps PASS**, twice, against real public endpoints:

- discover(live): 8 candidates (Openverse 4 + NASA 4; IA/Commons degrade honestly)
- candidates persisted (resumable across runs) → ranking → download+validate
  (JPEG 1023×818, 159 KB, magic-byte + full-decode validation, sha256 `7ed9ca29…`)
- dedup (sha256 + dHash, no duplicate) → ledger provenance
  (source page `flickr.com/photos/136485307@N06/48230363551`, license Public domain)
- review → **authentic_verified** (requires explicit archival evidence note)
- stage → renderer consumption: the film's own `comp_modes.mjs` preload
  (verbatim module copy, real canvas, throwaway harness — production cache untouched)
  resolves the staged file = **true**
- cleanup: proof artifact removed from production cache; provenance retained in ledger

Live failure evidence (also recorded in the ledger, not hidden): Flickr media host
returned 429 during one window (3 ranked attempts failed, nothing substituted); all
Wikimedia calls returned 403/429 from Wikimedia's own limiter.

## 6. Test and regression results

- **pytest: 46/46 PASS** (offline, no network): provider adapters vs stub servers;
  outage/429/403 degradation; retry counts; HTML-masquerade rejection; corrupt-image
  rejection; oversize rejection; undersize rejection; unknown-signature rejection;
  sha256 + dHash dedup; conservative classification (metadata alone never
  authentic_verified; NC/ND refused even after approval — caught by test); ledger
  persistence; staging gates (unapproved/undeclared-slot/restricted-license/sha-mismatch
  refusals, replaced-file archival); scene-query plan against the REAL v004 briefs;
  renderer boundary compat (staged slot activates, absent slots fall back).
- **Backward compatibility:** `git diff main..branch -- work/video-004-dyatlov-pass/src/`
  = empty. Narration, timeline, scenes, transitions, score/SFX/mix, loudnorm, SRT, QC
  gates, release scripts, terrain manifest, CREDITS.md, films.json: untouched.
  Renderer preload smoke through the real module: PASS.

## 7. Remaining restrictions and limitations

- Wikimedia Commons stays unusable while the shared egress IP is over Wikimedia's
  aggregate limit. The tool retries with backoff each run and keeps everything
  resumable; when the budget frees, `discover --slots …` picks up 1959 period photos
  into the waiting briefs slots with zero renderer changes.
- Internet Archive was unreachable all session from this network (connect timeout) —
  adapter implemented + unit-tested, live behavior = honest degradation.
- SearXNG support requires an externally hosted instance; none exists in this sandbox,
  so its adapter is proven by contract tests only.
- SearXNG/Openverse candidates carry no/less provenance than Commons/NASA; they stay
  `unverified` or `documentary_context` until a human completes review. NC/ND licenses
  are refused for staging outright.
- This task did NOT re-render the film: staging Dyatlov period photos into slots is a
  content decision for the next production pass (the mechanism is proven end to end).

## 8. Commit and pull-request URLs

- Branch: `https://github.com/ansaribilal14/opuscar-studio/tree/feat/image-acquisition`
- PR: `https://github.com/ansaribilal14/opuscar-studio/pull/17` (opened from
  `feat/image-acquisition` → `main`; merge only after review — no production release
  is published by this task).
