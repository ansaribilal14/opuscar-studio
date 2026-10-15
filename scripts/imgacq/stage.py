"""Staging — the ONLY bridge between acquisition and the existing renderer.

The renderer (work/<film>/src/comp_modes.mjs) loads images/cache/<slot> via its own
preload and falls back to labelled reconstructions when a slot is empty. Staging an
approved, license-cleared file into that slot therefore requires ZERO renderer changes,
and NOT staging one preserves today's fallback behavior exactly (backward compatible).

A slot name must be declared in scene_briefs.json `photos` (or --force must be given).
"""

import os
import shutil

from .common import cache_dir, images_dir, load_json, save_json, now_iso, sha256_file
from .ledger import ledger, save_ledger, entry_by_id
from .dedup import dhash_path


def brief_slots(film: str):
    briefs_path = os.path.join(images_dir(film), "..", "src", "scene_briefs.json")
    briefs = load_json(briefs_path, {}) or {}
    blocks = briefs.get("briefs", briefs if isinstance(briefs, list) else {})
    out = {}
    for bid, b in (blocks.items() if isinstance(blocks, dict) else enumerate(blocks)):
        for slot in (b.get("photos") or []):
            out.setdefault(slot, []).append(bid)
    return out


def stage(film: str, asset_id: str, slot: str, force: bool = False) -> dict:
    lg = ledger(film)
    e = entry_by_id(lg, asset_id)
    if not e:
        raise SystemExit(f"asset {asset_id} not in ledger")
    if e.get("review") != "approved":
        raise SystemExit(f"refusing to stage {asset_id}: review={e.get('review')} — "
                         f"human approval is required before any film use")
    if e.get("classification") not in ("authentic_verified", "documentary_context"):
        raise SystemExit(f"refusing to stage {asset_id}: classification="
                         f"{e.get('classification')} — clear license/provenance first")
    if e.get("duplicate_of"):
        raise SystemExit(f"refusing to stage {asset_id}: duplicate of {e['duplicate_of']}")
    src = e.get("file")
    if not src or not os.path.exists(src):
        raise SystemExit(f"refusing to stage {asset_id}: file missing ({src})")
    canon, rights_note = None, ""
    from .ledger import normalize_license
    canon, rights_note = normalize_license(e.get("license", ""))
    if not canon:
        raise SystemExit(f"refusing to stage {asset_id}: license not usable for "
                         f"monetized publication ({rights_note})")
    slots = brief_slots(film)
    if slot not in slots and not force:
        raise SystemExit(f"slot '{slot}' is not declared in scene_briefs.json photos "
                         f"(declared: {sorted(slots)}); pass --force to override")
    # integrity re-check at stage time — the file must still be the reviewed bytes
    if sha256_file(src) != e["sha256"]:
        raise SystemExit(f"refusing to stage {asset_id}: sha256 changed since review")
    dst_dir = cache_dir(film)
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, slot)
    if os.path.exists(dst):
        prev = f"{slot}.replaced_{now_iso().replace(':', '')}"
        shutil.move(dst, os.path.join(dst_dir, prev))
        e["notes"] = (e.get("notes", "") + f" | replaced previous {slot} (archived as {prev})").strip(" |")
    shutil.copy2(src, dst)
    e["slot"] = slot
    e["staged_path"] = dst
    e["staged_at"] = now_iso()
    e["status"] = "staged"
    briefs = slots.get(slot, [])
    if briefs:
        e["scene"] = ",".join(briefs)
    save_ledger(film, lg)
    return e
