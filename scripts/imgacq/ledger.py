"""The documentary asset ledger — per-film single source of truth for ACQUIRED images.

File: work/<film>/images/ledger.json

Relationship to existing ledgers (no second source of truth):
- terrain/manifest.json stays the authority for SRTM terrain plates (not copied here;
  the ledger only references it).
- images/CREDITS.md stays the human-facing usage record (what the film actually shows).
- ledger.json is the authority for web-acquired images: provenance + rights + integrity +
  review state. CREDITS.md can be updated FROM an approved ledger entry at staging time.

Classification rules (directive Phase 4) — conservative by construction:

  rejected            review == "rejected"
  unverified          license unknown/unclear, OR review still pending, OR sha256 missing
  illustration        explicitly set for generated artwork (never produced by discovery)
  reconstruction      explicitly set for our labelled reconstructions (never discovery)
  authentic_verified  human approved AND archival provenance recorded AND explicit
                      authenticity evidence note (--authentic). Search metadata alone
                      can NEVER reach this class.
  documentary_context human approved, license recognized free, but no archival
                      authenticity evidence — usable as context imagery, credited as such.

Licenses usable in monetized publication without extra review: Public domain, CC0,
CC BY, CC BY-SA. NC/ND variants and unknown licenses are held at review=pending with
a rights note — flagged, never silently approved.
"""

import os

from .common import ledger_path, load_json, save_json, now_iso
from .dedup import find_duplicates

FREE_LICENSES = {
    "public domain": "no known copyright restrictions",
    "pd": "public domain",
    "cc0": "CC0 1.0",
    "cc by": "CC BY (attribution required)",
    "cc by-sa": "CC BY-SA (attribution + share-alike)",
}
RESTRICTED_LICENSES = {
    "cc by-nc": "NON-COMMERCIAL — not usable in monetized publication",
    "cc by-nd": "NO DERIVATIVES — cropping/grading for film not permitted",
    "cc by-nc-sa": "NON-COMMERCIAL + share-alike — not usable in monetized publication",
    "cc by-nc-nd": "NON-COMMERCIAL + no derivatives — not usable",
}

CLASSIFICATION_VALUES = ("authentic_verified", "documentary_context", "illustration",
                         "reconstruction", "unverified")


def ledger(film: str) -> dict:
    lg = load_json(ledger_path(film), None)
    if lg is None:
        lg = {"film": film, "created_at": now_iso(), "updated_at": now_iso(),
              "entries": [], "notes": []}
    return lg


def save_ledger(film: str, lg: dict):
    lg["updated_at"] = now_iso()
    save_json(ledger_path(film), lg)


def entry_by_id(lg: dict, asset_id: str):
    return next((e for e in lg["entries"] if e["asset_id"] == asset_id), None)


def normalize_license(name: str):
    """Map a provider license string to (canonical, rights_note)."""
    n = (name or "").strip().lower().replace("cc ", "cc ")
    for k in ("cc by-nc-nd", "cc by-nc-sa", "cc by-nc", "cc by-nd", "cc by-sa", "cc by",
              "cc0", "public domain", "pd"):
        if n.startswith(k):
            canon = k
            note = RESTRICTED_LICENSES.get(canon) or FREE_LICENSES.get(canon)
            return canon, note
    if "public domain" in n or n in ("no known copyright restrictions", "pd-old-70",
                                     "pd-us", "pd-1996", "pd-russia", "pd"):
        return "public domain", FREE_LICENSES["public domain"]
    if n in ("cc0 1.0", "cc0 1.0 universal"):
        return "cc0", FREE_LICENSES["cc0"]
    if n.startswith("cc") or "creative commons" in n:
        return None, "unrecognized CC variant — review required"
    if n == "":
        return None, "no license metadata from provider — review required"
    return None, f"unrecognized license '{name}' — review required"


def classify(entry: dict) -> str:
    """Deterministic classification from provenance + review state (see module docstring)."""
    if entry.get("review") == "rejected":
        return "unverified" if not entry.get("sha256") else "unverified"
    if entry.get("classification") in ("illustration", "reconstruction"):
        return entry["classification"]          # explicit human designation
    review_approved = entry.get("review") == "approved"
    canon, _note = normalize_license(entry.get("license", ""))
    has_integrity = bool(entry.get("sha256")) and bool(entry.get("file"))
    if not review_approved or not canon or not has_integrity:
        return "unverified"
    if entry.get("authenticity_evidence"):
        return "authentic_verified"
    return "documentary_context"


def approve(film: str, asset_id: str, authentic: bool = False, note: str = "") -> dict:
    """Human review action. `authentic=True` requires an evidence note naming the
    archival provenance (what the image depicts and why that is established)."""
    lg = ledger(film)
    e = entry_by_id(lg, asset_id)
    if not e:
        raise SystemExit(f"asset {asset_id} not in ledger")
    if authentic:
        if not note or len(note) < 15:
            raise SystemExit("authentic_verified requires an evidence note (>=15 chars) "
                             "naming the archival provenance")
        e["authenticity_evidence"] = note
    e["review"] = "approved"
    if note:
        e["notes"] = (e.get("notes", "") + f" | review: {note}").strip(" |")
    e["classification"] = classify(e)
    save_ledger(film, lg)
    return e


def reject(film: str, asset_id: str, note: str = "") -> dict:
    lg = ledger(film)
    e = entry_by_id(lg, asset_id)
    if not e:
        raise SystemExit(f"asset {asset_id} not in ledger")
    e["review"] = "rejected"
    if note:
        e["notes"] = (e.get("notes", "") + f" | rejection: {note}").strip(" |")
    e["classification"] = classify(e)
    save_ledger(film, lg)
    return e


def refresh_derived(film: str) -> dict:
    """Recompute classifications + duplicate marks from current facts."""
    lg = ledger(film)
    dups = find_duplicates(lg["entries"])
    for e in lg["entries"]:
        e["classification"] = classify(e)
        e["duplicate_of"] = dups.get(e["asset_id"])
    save_ledger(film, lg)
    return lg
