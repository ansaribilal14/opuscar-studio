"""imgacq — free, keyless image discovery/retrieval/provenance for the documentary pipeline.

Design constraints (Task 8 directive):
- No paid APIs, no API keys, no accounts. Free public endpoints + optional self-hosted SearXNG.
- Foreground, bounded, resumable: one CLI invocation = a bounded batch of calls; every
  candidate/download/provenance is persisted immediately so any later run continues.
- License-first: search metadata alone can never qualify an image as authentic.
- Renderer compatibility: this package never modifies rendering code; it only stages
  approved files into work/<film>/images/cache/<slot> (the existing photo-slot mechanism).
"""

__version__ = "1.0.0"

import os
import re
import sys
import json
import time
import hashlib
import urllib.parse
from dataclasses import dataclass, field, asdict
from typing import Optional

# ---------------------------------------------------------------- paths
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WORK_DIR = os.path.join(REPO_ROOT, "work")

UA = ("OpusCarStudio-ImageAcq/1.0 (documentary production; free/public endpoints only; "
      "respectful rate: 1 req / 1.5 s; no bots meant to evade any control)")

# ---------------------------------------------------------------- tunables
HTTP_TIMEOUT = 25          # seconds per HTTP call (bounded)
DOWNLOAD_TIMEOUT = 60      # seconds for media downloads
RETRIES = 3                # per URL
BACKOFF = 1.8              # exponential base
RATE_SLEEP = 1.2           # polite spacing between calls to the same provider
MAX_BYTES = 25 * 1024 * 1024
MIN_BYTES = 10 * 1024
MIN_W, MIN_H = 640, 360

# Injected in tests to avoid real sleeping.
SLEEP = time.sleep


def film_dir(film: str) -> str:
    """Resolve a film work directory ('video-004-dyatlov-pass' or an explicit path)."""
    if os.path.isabs(film):
        return film
    return os.path.join(WORK_DIR, film)


def images_dir(film: str) -> str:
    return os.path.join(film_dir(film), "images")


def cache_dir(film: str) -> str:
    return os.path.join(images_dir(film), "cache")


def incoming_dir(film: str) -> str:
    d = os.path.join(images_dir(film), "incoming")
    os.makedirs(d, exist_ok=True)
    return d


def candidates_path(film: str) -> str:
    return os.path.join(incoming_dir(film), "candidates.json")


def ledger_path(film: str) -> str:
    return os.path.join(images_dir(film), "ledger.json")


def config_path(film: str) -> str:
    return os.path.join(images_dir(film), "acq_config.json")


def load_json(path: str, default):
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: str, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".part"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)
    os.replace(tmp, path)


def now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def asset_id(provider: str, media_url: str) -> str:
    h = hashlib.sha1((provider + "|" + media_url).encode()).hexdigest()
    return h[:12]


# ---------------------------------------------------------------- Candidate
@dataclass
class Candidate:
    id: str
    provider: str
    query: str
    media_url: str
    source_page: str = ""
    title: str = ""
    creator: str = ""
    date: str = ""
    license: str = ""          # normalized short name; "" = unknown
    license_url: str = ""
    width: int = 0
    height: int = 0
    thumb_url: str = ""
    mime: str = ""
    discovered_at: str = field(default_factory=now_iso)

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def from_dict(d: dict) -> "Candidate":
        fields = {f for f in Candidate.__dataclass_fields__}
        return Candidate(**{k: v for k, v in d.items() if k in fields})


def clean_html(s: str, limit: int = 220) -> str:
    """Provider metadata often arrives with embedded HTML tags — strip to plain text."""
    if not s:
        return ""
    s = re.sub(r"<[^>]+>", " ", str(s))
    s = re.sub(r"\s+", " ", s).strip()
    return s[:limit]


def merge_candidates(film: str, new: list) -> tuple:
    """Merge candidates by id into images/incoming/candidates.json. Returns (kept, added)."""
    path = candidates_path(film)
    cur = {c["id"]: c for c in load_json(path, [])}
    added = 0
    for c in new:
        d = c.to_dict() if isinstance(c, Candidate) else dict(c)
        if d["id"] not in cur:
            cur[d["id"]] = d
            added += 1
        else:
            # refresh metadata, keep first discovery time
            old = cur[d["id"]]
            d["discovered_at"] = old.get("discovered_at")
            cur[d["id"]] = d
    save_json(path, list(cur.values()))
    return len(cur), added


# ---------------------------------------------------------------- HTTP with backoff
class HttpError(Exception):
    def __init__(self, msg, status=None):
        super().__init__(msg)
        self.status = status


def http_get(url: str, timeout: float = HTTP_TIMEOUT, headers: Optional[dict] = None,
             accept_status=(200,)):
    """Single bounded GET. Raises HttpError with status for non-2xx. No proxies, no evasion:
    a 403/429/robots-restricted resource is reported as-is, never worked around."""
    import requests
    hs = {"User-Agent": UA}
    if headers:
        hs.update(headers)
    r = requests.get(url, timeout=timeout, headers=hs, stream=False)
    if r.status_code not in accept_status:
        raise HttpError(f"HTTP {r.status_code} for {url[:120]}", status=r.status_code)
    return r


def http_json(url: str, params: Optional[dict] = None, tries: int = RETRIES,
              headers: Optional[dict] = None):
    """GET JSON with retries + exponential backoff; honors Retry-After on 429.
    All sleep() calls go through module SLEEP (tests inject a no-op)."""
    import requests
    last = None
    for t in range(tries):
        if t:
            delay = BACKOFF ** t
            if last is not None and getattr(last, "status", None) == 429:
                ra = last.headers.get("Retry-After") if last.headers else None
                try:
                    delay = max(delay, float(ra)) if ra else delay
                except (TypeError, ValueError):
                    pass
            SLEEP(delay)
        try:
            r = requests.get(url, params=params, timeout=HTTP_TIMEOUT,
                             headers={"User-Agent": UA, **(headers or {})})
            last = r
            if r.status_code == 200:
                return r.json()
            raise HttpError(f"HTTP {r.status_code} for {r.url[:120]}", status=r.status_code)
        except HttpError:
            if t == tries - 1:
                raise
        except (requests.RequestException, ValueError) as e:
            last = e
            if t == tries - 1:
                raise HttpError(f"network error: {e}")
    raise HttpError("unreachable")


def provider_rateSleep():
    SLEEP(RATE_SLEEP)
