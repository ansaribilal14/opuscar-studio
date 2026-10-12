# Opuscar Studio — The Documentary Engine

> Agent-built documentaries. **Git is the main brain**: every method, decision, script,
> and artifact is committed here so that any agent — anywhere — can reproduce the exact
> workflow by reading the repo.

**Start here → [`BRAIN.md`](BRAIN.md)** — the full methodology (pipeline, compliance
rules, git protocol, environment map).

## What lives in this repo

| Path | Purpose |
|---|---|
| `BRAIN.md` | The method. Entry point for any agent. |
| `worklog.md` | Append-only log of every task, decision, and artifact. |
| `docs/` | Landing page (GitHub Pages) + recovery/incident reports. |
| `docs/films.json` | Data-driven film registry consumed by the landing page. |
| `scripts/` | Reusable pipeline scripts. |
| `work/<film>/` | One workspace per film (timeline, script, sources, build). |

## Films

See the [landing page](https://ansaribilal14.github.io/opuscar-studio/) and
[`docs/films.json`](docs/films.json).

## Non-negotiables

1. **Push after every step** — unpushed work is lost work.
2. **Real images never faked** — AI imagery is always labelled as reconstruction; it is
   never presented as archival photos, crime-scene photos, or real documents.
3. **Sourced facts only** — every on-screen claim traces to `SOURCES.md`.
4. **No secrets in git** — keys live in Actions secrets / local `.env` only.
