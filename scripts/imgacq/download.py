"""Bounded, validated downloads.

Rules enforced here (directive Phase 3):
- original file preferred over thumbnails (candidates carry both; download picks media_url)
- bounded timeouts, retries with exponential backoff, concurrency = 1 (foreground tool)
- size caps; magic-byte signature validation; full decode via Pillow
- HTML error pages masquerading as images are rejected
- a failed download never silently substitutes an unrelated image: the failure is
  recorded on the ledger entry and no file is written.
"""

import os

from . import common as cm
from .common import (HttpError, DOWNLOAD_TIMEOUT, MAX_BYTES, MIN_BYTES, MIN_W, MIN_H,
                     incoming_dir, save_json, load_json, now_iso, sha256_file)
from .dedup import dhash_path
from . import providers as pv

MAGIC = [
    (b"\xff\xd8\xff", "JPEG"),
    (b"\x89PNG\r\n\x1a\n", "PNG"),
    (b"GIF87a", "GIF"),
    (b"GIF89a", "GIF"),
]


def _sniff(data: bytes):
    for sig, fmt in MAGIC:
        if data.startswith(sig):
            return fmt
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "WEBP"
    if data[:4] in (b"II*\x00", b"MM\x00*"):
        return "TIFF"
    return None


def _looks_like_html(data: bytes) -> bool:
    head = data[:512].lstrip().lower()
    return head.startswith(b"<") or head.startswith(b"<!doctype") or b"<html" in head


def _http_get_bytes(url: str):
    """Streamed GET via python-requests with size caps. Returns (data, ctype)."""
    import requests
    r = requests.get(url, timeout=DOWNLOAD_TIMEOUT, stream=True,
                     headers={"User-Agent": cm.UA})
    if r.status_code != 200:
        raise HttpError(f"HTTP {r.status_code}", status=r.status_code)
    clen = int(r.headers.get("Content-Length") or 0)
    if clen and clen > MAX_BYTES:
        raise HttpError(f"Content-Length {clen} exceeds cap {MAX_BYTES}")
    chunks, total = [], 0
    for chunk in r.iter_content(1 << 16):
        total += len(chunk)
        if total > MAX_BYTES:
            raise HttpError(f"body exceeds cap {MAX_BYTES} mid-stream")
        chunks.append(chunk)
    return b"".join(chunks), (r.headers.get("Content-Type") or "").lower()


def _http_get_bytes_curl(url: str):
    """ONE bounded attempt of the SAME media GET through the standard curl client
    (same descriptive UA, same caps). Opt-in bridge for media hosts that serve
    standard clients while refusing the python TLS stack under shared-IP limits.
    Not evasion: no rotation, no identity change, no auth/CAPTCHA interaction.
    Returns (data, ctype)."""
    import subprocess
    marker = "__CURLMETA__"
    cmd = ["curl", "-sSL", "-m", str(DOWNLOAD_TIMEOUT),
           "-H", f"User-Agent: {cm.UA}",
           "--max-filesize", str(MAX_BYTES),
           "-o", "-", "-w", f"\n{marker}%{{content_type}}\t%{{http_code}}", url]
    try:
        p = subprocess.run(cmd, capture_output=True, timeout=DOWNLOAD_TIMEOUT + 5,
                           stdin=subprocess.DEVNULL)
    except (subprocess.TimeoutExpired, OSError) as e:
        raise HttpError(f"curl transport failed: {e}")
    if p.returncode != 0:
        raise HttpError(f"curl transport HTTP failure (rc={p.returncode})")
    body, sep, meta = p.stdout.rpartition(marker.encode())
    if not sep:
        raise HttpError("curl transport: missing metadata marker")
    try:
        ctype_s, code_s = meta.decode("latin1").strip().split("\t", 1)
        code = int(code_s)
    except (ValueError, IndexError):
        raise HttpError("curl transport: bad metadata")
    if code != 200:
        raise HttpError(f"HTTP {code} (via curl)", status=code)
    if len(body) > MAX_BYTES:
        raise HttpError(f"curl body exceeds cap {MAX_BYTES}")
    return body, ctype_s.lower()


def fetch_media(url: str, dest_dir: str, stem: str, tries: int = 3,
                curl_fallback: bool = False):
    """Download one media URL with validation. Returns (path, info dict).
    Raises HttpError on any failure — caller records it; nothing is written on failure.
    curl_fallback: ONE standard-client attempt after a 403/429 status refusal
    (same descriptive UA; some media hosts fingerprint-filter python clients)."""
    import requests
    last_err = None
    data = ctype = None
    for t in range(tries):
        if t:
            cm.SLEEP(1.8 ** t)
        try:
            data, ctype = _http_get_bytes(url)
            break
        except HttpError as e:
            if curl_fallback and getattr(e, "status", None) in (403, 429):
                print(f"  http: python client refused; one curl-transport "
                      f"attempt (same UA): {url[:80]}")
                data, ctype = _http_get_bytes_curl(url)
                break
            raise
        except requests.RequestException as e:
            last_err = e
        except Exception as e:
            last_err = e
    else:
        raise HttpError(f"download failed after {tries} tries: {last_err}")
    # ---- validation pipeline (same rules for every transport) ----
    try:
        if ctype.startswith("text/") or "html" in ctype:
            raise HttpError(f"refusing HTML/text response (Content-Type {ctype})")
        if len(data) < MIN_BYTES:
            raise HttpError(f"file too small ({len(data)} B < {MIN_BYTES} B)")
        if _looks_like_html(data):
            raise HttpError("HTML page masquerading as an image (signature check)")
        fmt = _sniff(data)
        if not fmt:
            raise HttpError(f"unrecognized image signature (Content-Type {ctype})")
        os.makedirs(dest_dir, exist_ok=True)
        ext = {"JPEG": ".jpg", "PNG": ".png", "GIF": ".gif", "WEBP": ".webp",
               "TIFF": ".tif"}[fmt]
        path = os.path.join(dest_dir, stem + ext)
        with open(path + ".part", "wb") as f:
            f.write(data)
        # full decode validation — corrupt/truncated files die here
        from PIL import Image
        try:
            with Image.open(path + ".part") as im:
                im.load()
                w, h = im.size
                real_fmt = im.format
        except Exception as decode_err:
            try:
                os.remove(path + ".part")   # no orphan files, no silent acceptance
            except OSError:
                pass
            raise HttpError(f"image decode failed: {decode_err}")
        if w < MIN_W or h < MIN_H:
            try:
                os.remove(path + ".part")
            except OSError:
                pass
            raise HttpError(f"image too small: {w}x{h} < {MIN_W}x{MIN_H} minimum")
        os.replace(path + ".part", path)
        return path, {"format": real_fmt, "width": w, "height": h, "bytes": len(data),
                      "sha256": sha256_file(path), "content_type": ctype}
    except HttpError:
        raise
    except Exception as e:
        raise HttpError(f"validation failed: {e}")


def download_candidates(film: str, ids=None, limit: int = 5, min_w: int = 0,
                        min_h: int = 0, retry_failed: bool = False) -> list:
    """Download pending candidates into images/incoming/, recording every outcome in
    the ledger (ledger.json). Concurrency = 1 (foreground discipline)."""
    from .ledger import ledger, save_ledger, classify
    lg = ledger(film)
    cands = {c["id"]: c for c in load_json(
        __import__("os").path.join(incoming_dir(film), "candidates.json"), [])}
    have = {e["asset_id"]: e for e in lg["entries"]}

    def _needs_work(c):
        # No explicit ids: pick up candidates never attempted, PLUS entries that
        # claim success but whose backing file vanished (container reset self-heal).
        # Failed/rejected entries are NOT auto-retried (retry via explicit ids).
        e = have.get(c["id"])
        if e is None:
            return True
        if e.get("status") in ("downloaded", "validated", "staged"):
            f = e.get("file") or ""
            return not (f and os.path.exists(f))
        if retry_failed and e.get("status") == "failed_download":
            return True
        return False

    todo = [c for c in cands.values()
            if (c["id"] in ids if ids else _needs_work(c))]
    todo.sort(key=lambda c: c.get("discovered_at") or "")
    done = []
    for c in todo[:limit]:
        cid = c["id"]
        entry = next((e for e in lg["entries"] if e["asset_id"] == cid), None)
        if entry is None:
            entry = {"asset_id": cid, "provider": c["provider"], "query": c["query"],
                     "media_url": c["media_url"], "source_page": c["source_page"],
                     "title": c["title"], "creator": c["creator"], "date": c["date"],
                     "license": c["license"], "license_url": c["license_url"],
                     "width": c["width"], "height": c["height"], "thumb_url": c["thumb_url"],
                     "mime": c["mime"], "episode": film, "slot": None, "scene": None,
                     "retrieved_at": None, "file": None, "bytes": None, "format": None,
                     "phash": None, "classification": "unverified", "review": "pending",
                     "status": "candidate", "error": None, "notes": ""}
            lg["entries"].append(entry)
        if entry.get("status") in ("downloaded", "validated", "staged"):
            f = entry.get("file") or ""
            if f and os.path.exists(f):
                done.append(entry["asset_id"])
                continue
            # Resume honesty: the ledger claims success but the backing file is
            # gone (container reset wipes untracked binaries). Do NOT trust the
            # stale status -- fall through and re-download. Provenance fields
            # survive; the success path below overwrites retrieval fields.
            entry.update({"status": "candidate", "file": None, "phash": None,
                          "retrieved_at": None,
                          "notes": (entry.get("notes") or "") +
                                   " | resume: backing file missing, re-downloading"})
            print(f"  RESUME {cid}: ledger status without backing file -> re-downloading")
        try:
            work = pv.Candidate.from_dict(c)
            if work.provider == "internetarchive":
                work = pv.internetarchive_resolve_media(work)
                entry["media_url"] = work.media_url
                c["media_url"] = work.media_url
            elif work.provider == "nasa":
                work = pv.nasa_resolve_media(work)
                entry["media_url"] = work.media_url
                c["media_url"] = work.media_url
            stem = now_iso().replace(":", "").replace("-", "")[:15] + "_" + cid
            path, info = fetch_media(work.media_url, incoming_dir(film), stem,
                                     curl_fallback=(work.provider == "commons"))
            entry.update({"file": path,
                "bytes": info["bytes"], "format": info["format"],
                "sha256": info["sha256"], "width": info["width"], "height": info["height"],
                "retrieved_at": now_iso(), "status": "downloaded",
                "phash": dhash_path(path), "error": None})
            if info["width"] < (min_w or MIN_W) or info["height"] < (min_h or MIN_H):
                entry["status"] = "rejected"
                entry["error"] = f"below resolution floor for film use {info['width']}x{info['height']}"
            else:
                entry["classification"] = classify(entry)
            print(f"  OK {cid} {info['format']} {info['width']}x{info['height']} "
                  f"{info['bytes']//1024}KB lic={entry['license'] or 'UNKNOWN'}")
            save_json(os.path.join(incoming_dir(film), "candidates.json"),
                      list(cands.values()))
        except HttpError as e:
            entry["status"] = "failed_download"
            entry["error"] = str(e)
            print(f"  FAIL {cid}: {e}")
        save_ledger(film, lg)
        done.append(cid)
    return done
