"""Scene-level discovery (directive Phase 5).

Reads the film's existing contracts — scene_briefs.json (photo slots + `why` rationale)
and images/acq_config.json (research-derived subject data) — and produces multiple
targeted queries per slot plus a deterministic candidate ranking.

acq_config.json is DATA derived from the research ledger (SOURCES.md/CLAIMS.md), e.g.:
{
  "subject": "Dyatlov Pass incident",
  "aliases": ["Dyatlov group", "Kholat Syakhl"],
  "locations": ["Northern Urals", "Soviet Union 1959"],
  "dates": ["February 1959", "1959"],
  "archive_terms": ["case files", "search operation", "memorial"],
  "slot_hints": {"tent_1959.jpg": ["abandoned tent snow slope"]},
  "min_width": 900, "min_height": 600
}
"""

import os
import re

from .common import config_path, load_json, images_dir
from .dedup import hamming


DEFAULT_SLOT_HINTS = {
    # deterministic fallback: strip trailing year + extension → "tent_1959.jpg" → "tent 1959"
}


def slot_queries(slot: str, cfg: dict) -> list:
    base = re.sub(r"\.(jpg|jpeg|png|webp)$", "", slot, flags=re.I)
    base = re.sub(r"_?19\d\d$", "", base).replace("_", " ")
    qs = []
    subject = cfg.get("subject", "")
    for hint in cfg.get("slot_hints", {}).get(slot, [base]):
        if subject and subject.lower() not in hint.lower():
            qs.append(f"{subject} {hint}")
        else:
            qs.append(hint)
    for alias in cfg.get("aliases", [])[:2]:
        qs.append(f"{alias} {base}")
    for term in cfg.get("archive_terms", [])[:2]:
        qs.append(f"{subject} {term} {base}")
    for d in cfg.get("dates", [])[:1]:
        qs.append(f"{base} {d} historical photograph")
    seen, out = set(), []
    for q in qs:
        q = re.sub(r"\s+", " ", q).strip()
        if q and q.lower() not in seen:
            seen.add(q.lower())
            out.append(q)
    return out


def scene_query_plan(film: str) -> dict:
    """{slot: [queries]} from the real scene_briefs.json photo slots."""
    briefs_path = os.path.join(images_dir(film), "..", "src", "scene_briefs.json")
    briefs = load_json(briefs_path, {}) or {}
    blocks = briefs.get("briefs", briefs if isinstance(briefs, list) else {})
    cfg = load_json(config_path(film), {})
    slots = {}
    for bid, b in (blocks.items() if isinstance(blocks, dict) else enumerate(blocks)):
        for slot in (b.get("photos") or []):
            slots.setdefault(slot, {"briefs": [], "visual": b.get("visual", ""),
                                    "fallback": b.get("fallback", "")})
            slots[slot]["briefs"].append(bid)
    plan = {}
    for slot, meta in sorted(slots.items()):
        qs = slot_queries(slot, cfg)
        if qs:
            plan[slot] = {"queries": qs, "briefs": meta["briefs"],
                          "visual": meta["visual"], "fallback": meta["fallback"]}
    return plan


# ------------------------------------------------------------------ ranking
_LICENSE_SCORE = {"public domain": 3.0, "pd": 3.0, "cc0": 3.0, "cc by": 2.0,
                  "cc by-sa": 2.0}
_PROVIDER_SCORE = {"commons": 1.0, "internetarchive": 0.8, "openverse": 0.7,
                   "searxng": 0.3}


def rank_candidates(cands: list, queries: list, min_w: int = 0, min_h: int = 0) -> list:
    """Deterministic score: license (3/2) + provider authority (1.0-0.3) + resolution
    (0-1.5) + query match position (earlier in more queries = better) + archival title
    evidence (year/subject match in title = +0.5). Stable sort; ties by asset id.
    Accepts Candidate objects or plain dicts."""
    cands = [c.to_dict() if hasattr(c, "to_dict") else dict(c) for c in cands]
    qlows = [q.lower() for q in queries]

    def score(c):
        from .ledger import normalize_license
        canon, _ = normalize_license(c.get("license", ""))
        s = _LICENSE_SCORE.get(canon or "", 0.0)
        s += _PROVIDER_SCORE.get(c.get("provider", ""), 0.0)
        w, h = int(c.get("width") or 0), int(c.get("height") or 0)
        if w and h:
            s += min(1.5, (w / 1600.0 + h / 900.0) / 2.0)
        else:
            s += 0.25   # dimensions unknown (SearXNG/IA) — slight optimism, verified later
        hits = sum(1 for q in qlows
                   if q and (q in (c.get("title", "") or "").lower()
                             or q in (c.get("query", "") or "").lower()))
        first_pos = min([qlows.index(q) for q in qlows
                         if q and q in (c.get("query", "") or "").lower()] or [99])
        s += hits * 0.4 + max(0.0, (5 - first_pos) * 0.05)
        title = (c.get("title", "") or "").lower()
        if re.search(r"19[0-9]{2}", title):
            s += 0.25
        if any(a.lower() in title for a in ("dyatlov", "kholat", "искател", "групп", "турис")):
            s += 0.5
        return s

    def ok(c):
        w, h = int(c.get("width") or 0), int(c.get("height") or 0)
        if min_w and w and w < min_w:
            return False
        if min_h and h and h < min_h:
            return False
        return True

    return sorted([c for c in cands if ok(c)], key=lambda c: (-score(c), c["id"]))
