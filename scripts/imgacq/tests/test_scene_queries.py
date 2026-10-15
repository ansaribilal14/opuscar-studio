"""Scene-query generation + backward compatibility with the existing renderer."""

import json
import os
import subprocess

import pytest

from imgacq import scene_queries as sq
from imgacq import stage as st


def test_slot_queries_from_config(film):
    cfg = {"subject": "Dyatlov Pass incident", "aliases": ["Dyatlov group"],
           "archive_terms": ["case files"], "dates": ["1959"],
           "slot_hints": {"tent_1959.jpg": ["abandoned tent snow slope"]}}
    qs = sq.slot_queries("tent_1959.jpg", cfg)
    assert qs[0] == "Dyatlov Pass incident abandoned tent snow slope"
    assert any("Dyatlov group tent" in q for q in qs)
    assert any("case files" in q for q in qs)
    assert len(qs) == len(set(q.lower() for q in qs))       # no duplicates


def test_slot_queries_deterministic_without_config(film):
    a = sq.slot_queries("last_photo.jpg", {})
    b = sq.slot_queries("last_photo.jpg", {})
    assert a == b
    assert a and "last photo" in a[0]


def test_scene_query_plan_maps_briefs(film):
    plan = sq.scene_query_plan(film)
    assert set(plan) == {"tent_1959.jpg"}
    assert plan["tent_1959.jpg"]["briefs"] == ["b1"]
    assert plan["tent_1959.jpg"]["fallback"] == "recon_tent"


def test_rank_candidates_prefers_license_and_resolution():
    cands = [
        {"id": "low", "provider": "searxng", "license": "", "title": "x",
         "query": "dyatlov tent", "width": 0, "height": 0},
        {"id": "mid", "provider": "openverse", "license": "CC BY 4.0", "title": "y",
         "query": "dyatlov tent", "width": 1200, "height": 800},
        {"id": "top", "provider": "commons", "license": "Public domain",
         "title": "Tent of the group, 1959", "query": "dyatlov tent",
         "width": 2400, "height": 1800},
    ]
    ranked = sq.rank_candidates(cands, ["dyatlov tent"])
    assert [c["id"] for c in ranked] == ["top", "mid", "low"]


def test_rank_candidates_respects_resolution_floor():
    cands = [{"id": "small", "provider": "commons", "license": "Public domain",
              "title": "t", "query": "q", "width": 500, "height": 300}]
    assert sq.rank_candidates(cands, ["q"], min_w=900) == []


# ------------------------------------------------------------------ backward compat
def test_real_v004_briefs_plan_matches_photo_slots():
    """The real production briefs must produce a plan covering every photo slot."""
    repo = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
        os.path.abspath(__file__)))))
    film = os.path.join(repo, "work", "video-004-dyatlov-pass")
    if not os.path.exists(os.path.join(film, "src", "scene_briefs.json")):
        pytest.skip("production briefs not present")
    plan = sq.scene_query_plan(film)
    slots = st.brief_slots(film)
    assert set(plan) == set(slots)
    assert {"tent_1959.jpg", "group_1959.jpg", "yudin_farewell.jpg",
            "last_photo.jpg", "search_photos.jpg"} <= set(slots)
    for slot, meta in plan.items():
        assert meta["queries"], f"{slot} produced no queries"


def test_renderer_consumes_staged_slot_and_falls_back_without(film, tmp_path):
    """End-to-end backward compat at the renderer boundary — using a tiny stand-in
    module that mirrors comp_modes.mjs's documented preload contract (canvas is only
    installed inside the real film packages; the contract is: file in images/cache
    → photo() resolves; missing → null fallback)."""
    renderer = """
    const fs = require('fs');
    const path = require('path');
    function photo(name) {
      const p = path.join(process.cwd(), 'images', 'cache', name);
      return fs.existsSync(p);
    }
    process.stdout.write(JSON.stringify({
      staged: photo(%s), missing: photo('never_staged.jpg')
    }));
    """ % json.dumps("tent_1959.jpg")
    r = subprocess.run(["node", "-e", renderer], cwd=film, capture_output=True,
                       text=True, timeout=30, stdin=subprocess.DEVNULL)
    out = json.loads(r.stdout)
    assert out["staged"] is False          # nothing staged yet in the temp film
    cache = os.path.join(film, "images", "cache")
    os.makedirs(cache, exist_ok=True)
    with open(os.path.join(cache, "tent_1959.jpg"), "wb") as f:
        f.write(b"x")
    r = subprocess.run(["node", "-e", renderer], cwd=film, capture_output=True,
                       text=True, timeout=30, stdin=subprocess.DEVNULL)
    out = json.loads(r.stdout)
    assert out["staged"] is True           # staged file activates the slot…
    assert out["missing"] is False         # …while absent slots still fall back
