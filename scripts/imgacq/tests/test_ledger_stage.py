"""Dedup, ledger classification, and staging tests (all offline)."""

import os
import io
import json
import pytest

from imgacq import common as cm
from imgacq import download as dl
from imgacq import ledger as lg
from imgacq import stage as st
from imgacq.dedup import dhash_hex, dhash_path, hamming, find_duplicates
from PIL import Image


def make_image(path, w=1000, h=700, color=(100, 100, 100), fmt="JPEG", pattern="a"):
    """Two distinct 2-D structures ("a": bright wedge top-left, "b": dark wedge
    bottom-right) — dHash needs adjacent-pixel variation in both axes; flat or
    single-axis-gradient images degenerate to the zero hash."""
    im = Image.new("RGB", (w, h), color)
    from PIL import ImageDraw
    d = ImageDraw.Draw(im)
    if pattern == "a":
        d.polygon([(0, 0), (int(w * 0.7), 0), (0, int(h * 0.7))], fill=(235, 235, 235))
    else:
        d.polygon([(w, h), (int(w * 0.3), h), (w, int(h * 0.3))], fill=(20, 20, 20))
    im.save(path, fmt)
    return path


def add_entry(film, asset_id, **kw):
    e = {"asset_id": asset_id, "provider": "commons", "query": "q",
         "media_url": "https://x/y.jpg", "source_page": "https://x/page",
         "title": kw.get("title", "T"), "creator": "C", "date": "1959",
         "license": kw.get("license", "Public domain"), "license_url": "",
         "width": 1600, "height": 1200, "thumb_url": "", "mime": "image/jpeg",
         "episode": film, "slot": None, "scene": None, "retrieved_at": cm.now_iso(),
         "file": kw.get("file") or "/fake/incoming/x.jpg", "bytes": 1234, "format": "JPEG",
         "sha256": kw.get("sha256", "a" * 64), "phash": kw.get("phash"),
         "classification": "unverified", "review": kw.get("review", "pending"),
         "status": kw.get("status", "downloaded"), "error": None, "notes": ""}
    l = lg.ledger(film)
    l["entries"].append(e)
    lg.save_ledger(film, l)
    return e


# ------------------------------------------------------------------ dHash
def test_dhash_stable_under_recompression(tmp_path):
    p1 = tmp_path / "a.jpg"
    make_image(str(p1))
    h1 = dhash_path(str(p1))
    # resave at different quality → visually identical, bytes differ
    im = Image.open(str(p1))
    p2 = tmp_path / "b.jpg"
    im.save(str(p2), "JPEG", quality=40)
    h2 = dhash_path(str(p2))
    assert h1 != "0" * 16
    assert hamming(h1, h2) <= 8


def test_dhash_distinguishes_different_images(tmp_path):
    a = dhash_path(make_image(str(tmp_path / "da.jpg"), color=(10, 10, 10), pattern="a"))
    b = dhash_path(make_image(str(tmp_path / "db.jpg"), color=(245, 245, 245), pattern="b"))
    assert hamming(a, b) > 8


def test_find_duplicates_exact_and_visual(film, tmp_path):
    p1 = make_image(str(tmp_path / "1.jpg"), color=(10, 10, 10), pattern="a")
    p2 = make_image(str(tmp_path / "2.jpg"), color=(10, 10, 10), pattern="a")
    p3 = make_image(str(tmp_path / "3.jpg"), color=(240, 30, 90), pattern="b")
    e1 = add_entry(film, "dup1", file=p1, sha256="S1", phash=dhash_path(p1))
    e2 = add_entry(film, "dup2", file=p2, sha256="S1", phash=dhash_path(p2))  # exact dup
    e3 = add_entry(film, "vis1", file=p3, sha256="S3", phash=dhash_path(p3))
    dups = find_duplicates([e1, e2, e3])
    assert dups.get("dup2") == "dup1"
    assert "vis1" not in dups


# ------------------------------------------------------------------ classification
def test_metadata_alone_never_authentic(film):
    e = add_entry(film, "m1", license="Public domain", review="pending")
    assert lg.classify(e) == "unverified"


def test_approved_documentary_context(film):
    e = add_entry(film, "m2", license="CC BY 4.0", review="approved")
    assert lg.classify(e) == "documentary_context"


def test_approved_authentic_requires_evidence(film):
    e = add_entry(film, "m3", license="Public domain", review="approved",
                  )
    e["authenticity_evidence"] = "1959 search-party print; depicted tent matches case file"
    assert lg.classify(e) == "authentic_verified"


def test_unknown_license_stays_unverified_even_approved(film):
    e = add_entry(film, "m4", license="", review="approved")
    assert lg.classify(e) == "unverified"


def test_restricted_license_flagged(film):
    e = add_entry(film, "m5", license="CC BY-NC 2.0", review="pending")
    canon, note = lg.normalize_license("CC BY-NC 2.0")
    assert canon == "cc by-nc" and "NON-COMMERCIAL" in note
    assert lg.classify(e) == "unverified"


def test_missing_integrity_blocks_classification(film):
    e = add_entry(film, "m6", license="Public domain", review="approved", sha256="")
    assert lg.classify(e) == "unverified"


def test_approve_requires_evidence_note_for_authentic(film):
    add_entry(film, "m7", license="Public domain", review="pending")
    with pytest.raises(SystemExit):
        lg.approve(film, "m7", authentic=True, note="short")


def test_reject_marks_rejected(film):
    add_entry(film, "m8")
    lg.reject(film, "m8", note="watermark visible")
    e = lg.entry_by_id(lg.ledger(film), "m8")
    assert e["review"] == "rejected"


# ------------------------------------------------------------------ staging
def _prepare_staged_candidate(film, tmp_path, asset="stg1", slot="tent_1959.jpg",
                              license="Public domain"):
    p = make_image(str(tmp_path / f"{asset}.jpg"))
    add_entry(film, asset, file=p, license=license, status="downloaded",
              sha256=cm.sha256_file(p), phash=dhash_path(p))
    lg.approve(film, asset, authentic=True,
               note="archival 1959 print, depicted subject matches case files")
    return p


def test_stage_into_declared_slot(film, tmp_path):
    _prepare_staged_candidate(film, tmp_path)
    e = st.stage(film, "stg1", "tent_1959.jpg")
    assert os.path.exists(e["staged_path"])
    assert e["staged_path"].endswith("images/cache/tent_1959.jpg")
    assert e["scene"] == "b1"          # brief linkage recorded
    assert e["status"] == "staged"


def test_stage_refuses_unapproved(film, tmp_path):
    p = make_image(str(tmp_path / "x.jpg"))
    add_entry(film, "stg2", file=p, review="pending")
    with pytest.raises(SystemExit, match="review"):
        st.stage(film, "stg2", "tent_1959.jpg")


def test_stage_refuses_undeclared_slot_without_force(film, tmp_path):
    _prepare_staged_candidate(film, tmp_path, asset="stg3")
    with pytest.raises(SystemExit, match="not declared"):
        st.stage(film, "stg3", "not_a_slot.jpg")
    e = st.stage(film, "stg3", "not_a_slot.jpg", force=True)   # explicit override works
    assert os.path.exists(e["staged_path"])


def test_stage_refuses_restricted_license(film, tmp_path):
    _prepare_staged_candidate(film, tmp_path, asset="stg4", license="CC BY-NC 2.0")
    # NC stays unverified even after approval (monetized publication rule)…
    e = lg.entry_by_id(lg.ledger(film), "stg4")
    assert e["classification"] == "unverified"
    # …and staging is refused outright.
    with pytest.raises(SystemExit, match="refusing to stage stg4"):
        st.stage(film, "stg4", "tent_1959.jpg")


def test_stage_refuses_sha_mismatch(film, tmp_path):
    p = _prepare_staged_candidate(film, tmp_path, asset="stg5")
    make_image(p, color=(255, 0, 0))                # mutate AFTER approval
    with pytest.raises(SystemExit, match="sha256"):
        st.stage(film, "stg5", "tent_1959.jpg")


def test_stage_archives_replaced_file(film, tmp_path):
    _prepare_staged_candidate(film, tmp_path, asset="stg6")
    cache = os.path.join(film, "images", "cache")
    os.makedirs(cache, exist_ok=True)
    with open(os.path.join(cache, "tent_1959.jpg"), "wb") as f:
        f.write(b"old")
    e = st.stage(film, "stg6", "tent_1959.jpg")
    archived = [f for f in os.listdir(cache) if f.startswith("tent_1959.jpg.replaced_")]
    assert archived and e["status"] == "staged"


def test_ledger_persistence_roundtrip(film):
    add_entry(film, "per1")
    l2 = lg.ledger(film)
    assert lg.entry_by_id(l2, "per1")["asset_id"] == "per1"
    assert l2["film"] == film
