"""Provider registry — discovery order mandated by the Task 8 directive:

  1. self-hosted SearXNG     (only if IMGACQ_SEARXNG_URL is set AND reachable; JSON API)
  2. public endpoints that permit automated access (Openverse — free, anonymous, license-filtered)
  3. public archive catalogs (Internet Archive — strict timeouts, graceful on outage)
  4. Wikimedia Commons       (existing archive integration, as fallback)

No paid API, no key, no account anywhere. No proxies / CAPTCHA / auth bypass; any 403/429
is reported honestly as "unavailable this run".
"""

import os
import urllib.parse
from typing import List

from .common import (Candidate, HttpError, http_json, clean_html, asset_id,
                     provider_rateSleep, now_iso)

# ------------------------------------------------------------------ helpers
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
OPENVERSE_API = "https://api.openverse.org/v1/images/"
IA_SEARCH = "https://archive.org/advancedsearch.php"
IA_METADATA = "https://archive.org/metadata/"

_FREE_LICENSES = {
    "cc0": "CC0", "pdm": "Public domain", "by": "CC BY", "by-sa": "CC BY-SA",
}


# ------------------------------------------------------------------ 1. SearXNG
def searxng_base() -> str:
    return (os.environ.get("IMGACQ_SEARXNG_URL") or "").rstrip("/")


def searxng_search(query: str, limit: int = 10) -> List[Candidate]:
    """Self-hosted SearXNG image search. NOTE: SearXNG aggregates other engines and
    carries NO license metadata — candidates from this provider are discovery-only and
    stay 'unverified' until a human completes provenance on the source page."""
    base = searxng_base()
    if not base:
        return []
    params = {"q": query, "format": "json", "categories": "images"}
    try:
        j = http_json(base + "/search", params=params)
    except HttpError as e:
        print(f"  searxng: unavailable this run ({e})")
        return []
    out = []
    for i, r in enumerate(j.get("results", [])[:limit]):
        media = r.get("img_src") or ""
        if not media:
            continue
        page = r.get("url") or ""
        cid = asset_id("searxng", media)
        out.append(Candidate(
            id=cid, provider="searxng", query=query, media_url=media,
            source_page=page, title=clean_html(r.get("title", "")),
            creator=clean_html(r.get("author", "") or r.get("source", "")),
            license="", license_url="",
            width=int(r.get("img_width") or 0), height=int(r.get("img_height") or 0),
            thumb_url=r.get("thumbnail_src") or r.get("thumbnail") or "",
            mime=r.get("img_format") or "",
        ))
        if i + 1 >= limit:
            break
    return out


# ------------------------------------------------------------------ 2. Openverse
def openverse_search(query: str, limit: int = 12) -> List[Candidate]:
    """Openverse (openverse.org) — aggregates CC/PD images from Flickr, museums,
    archives; anonymous access explicitly permitted; license fields included."""
    params = {"q": query, "page_size": min(limit, 20),
              "license": "cc0,pdm,by,by-sa"}   # free-for-commerce-usable set
    try:
        j = http_json(OPENVERSE_API, params=params)
    except HttpError as e:
        print(f"  openverse: unavailable this run ({e})")
        return []
    out = []
    for r in j.get("results", []):
        media = r.get("url") or ""
        if not media:
            continue
        code = (r.get("license") or "").lower()
        ver = r.get("license_version") or ""
        lic = _FREE_LICENSES.get(code, "")
        if lic and ver and code in ("by", "by-sa"):
            lic = f"{lic} {ver}"
        out.append(Candidate(
            id=asset_id("openverse", media), provider="openverse", query=query,
            media_url=media,
            source_page=r.get("foreign_landing_url") or "",
            title=clean_html(r.get("title", "")), creator=clean_html(r.get("creator", "")),
            date=str(r.get("date") or ""),
            license=lic, license_url=r.get("license_url") or "",
            width=int(r.get("width") or 0), height=int(r.get("height") or 0),
            thumb_url=r.get("thumbnail") or "", mime=r.get("filetype") or "",
        ))
    return out


# ------------------------------------------------------------------ 3. Internet Archive
def internetarchive_search(query: str, limit: int = 10) -> List[Candidate]:
    """Internet Archive advancedsearch. Item-level discovery; the concrete image file is
    resolved from the item's metadata endpoint at download time (one extra bounded call).
    The endpoint hangs under some throttles — strict timeout makes it degrade gracefully."""
    params = {"q": query + " AND mediatype:image", "fl[]": ["identifier", "title",
              "licenseurl", "year", "creator"], "rows": min(limit, 25), "output": "json"}
    try:
        j = http_json(IA_SEARCH, params=params)
    except HttpError as e:
        print(f"  internetarchive: unavailable this run ({e})")
        return []
    docs = (j.get("response", {}) or {}).get("docs", []) or []
    out = []
    for d in docs:
        ident = d.get("identifier") or ""
        if not ident:
            continue
        title = d.get("title", "")
        if isinstance(title, list):
            title = title[0] if title else ""
        creator = d.get("creator", "")
        if isinstance(creator, list):
            creator = creator[0] if creator else ""
        out.append(Candidate(
            id=asset_id("internetarchive", ident), provider="internetarchive",
            query=query, media_url=IA_METADATA + urllib.parse.quote(ident),
            source_page=f"https://archive.org/details/{urllib.parse.quote(ident)}",
            title=clean_html(title), creator=clean_html(creator),
            date=str(d.get("year") or ""), license="",
            license_url=d.get("licenseurl") or "",
        ))
    return out


def internetarchive_resolve_media(candidate: Candidate) -> Candidate:
    """Resolve the largest image file in an IA item (mutates media_url/thumb/mime/w/h)."""
    j = http_json(candidate.media_url)
    files = j.get("files", []) or []
    best, best_size = None, -1
    for f in files:
        name = f.get("name", "")
        fmt = (f.get("format") or "").lower()
        size = int(f.get("size") or 0)
        if not name.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        if "thumb" in fmt or "thumbnail" in name.lower():
            continue
        if size > best_size:
            best, best_size = f, size
    if best:
        ident = candidate.media_url.rsplit("/", 1)[-1]
        candidate.media_url = IA_METADATA + urllib.parse.quote(ident) + "/" + urllib.parse.quote(best["name"])
        candidate.thumb_url = "https://archive.org/services/img/" + ident
        candidate.mime = "image/jpeg" if candidate.media_url.lower().endswith((".jpg", ".jpeg")) else "image/png"
    return candidate


# ------------------------------------------------------------------ 3a. NASA image library
NASA_API = "https://images-api.nasa.gov/search"
NASA_ASSET = "https://images-api.nasa.gov/asset/"
NASA_RIGHTS_URL = "https://www.nasa.gov/nasa-brand-center/images-and-media/"


def nasa_search(query: str, limit: int = 10) -> List[Candidate]:
    """NASA Image and Video Library (images.nasa.gov) — public archive catalog,
    keyless, documented open API; imagery is public domain with no known
    restrictions (rights URL recorded on every candidate)."""
    params = {"q": query, "media_type": "image"}
    try:
        j = http_json(NASA_API, params=params)
    except HttpError as e:
        print(f"  nasa: unavailable this run ({e})")
        return []
    items = ((j.get("collection", {}) or {}).get("items", []) or [])[:limit]
    out = []
    for it in items:
        d = (it.get("data") or [{}])[0]
        nid = d.get("nasa_id") or ""
        if not nid:
            continue
        links = it.get("links") or []
        thumb = links[0].get("href", "") if links else ""
        out.append(Candidate(
            id=asset_id("nasa", nid), provider="nasa", query=query,
            media_url=NASA_ASSET + urllib.parse.quote(nid),   # resolved at download
            source_page=f"https://images.nasa.gov/details/{urllib.parse.quote(nid)}",
            title=clean_html(d.get("title", "")),
            creator=d.get("center") or "NASA",
            date=str(d.get("date_created") or "")[:10],
            license="Public domain", license_url=NASA_RIGHTS_URL,
            thumb_url=thumb, mime="image/jpeg",
        ))
    return out


def nasa_resolve_media(candidate: Candidate) -> Candidate:
    """Resolve the original (orig.jpg > large > medium) asset URL for a NASA item."""
    j = http_json(candidate.media_url)
    items = (j.get("collection", {}) or {}).get("items", []) or []
    urls = [i.get("href", "") for i in items]
    pick = None
    for suffix in ("~orig.jpg", "~large.jpg", "~medium.jpg"):
        for u in urls:
            if u.split("?")[0].endswith(suffix):
                pick = u
                break
        if pick:
            break
    if pick:
        candidate.media_url = pick.split("?")[0]
    return candidate


# ------------------------------------------------------------------ 4. Wikimedia Commons
def commons_search(query: str, limit: int = 12) -> List[Candidate]:
    """Commons full-text search (file namespace). Fallback provider per directive order.
    extmetadata carries license/artist/date — the authoritative provenance source."""
    params = {"action": "query", "generator": "search",
              "gsrsearch": f"{query} filetype:bitmap", "gsrnamespace": 6,
              "gsrlimit": min(limit, 50), "prop": "imageinfo",
              "iiprop": "url|size|mime|extmetadata", "iiurlwidth": "1600", "format": "json"}
    try:
        j = http_json(COMMONS_API, params=params)
    except HttpError as e:
        print(f"  commons: unavailable this run ({e})")
        return []
    return _commons_from_pages(j, query)


def commons_category(category: str, limit: int = 20) -> List[Candidate]:
    params = {"action": "query", "generator": "categorymembers", "gcmtitle": category,
              "gcmtype": "file", "gcmlimit": min(limit, 100), "prop": "imageinfo",
              "iiprop": "url|size|mime|extmetadata", "iiurlwidth": "1600", "format": "json"}
    try:
        j = http_json(COMMONS_API, params=params)
    except HttpError as e:
        print(f"  commons: unavailable this run ({e})")
        return []
    return _commons_from_pages(j, f"category:{category}")


def _commons_from_pages(j: dict, query: str) -> List[Candidate]:
    out = []
    pages = (j.get("query", {}) or {}).get("pages", {}) or {}
    for p in pages.values():
        ii = (p.get("imageinfo") or [None])[0]
        if not ii:
            continue
        em = ii.get("extmetadata", {}) or {}

        def f(key):
            return clean_html((em.get(key, {}) or {}).get("value", ""))

        title = p.get("title", "")
        page = "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_"))
        out.append(Candidate(
            id=asset_id("commons", ii.get("url", title)), provider="commons", query=query,
            media_url=ii.get("url", ""), source_page=page, title=title,
            creator=f("Artist"), date=f("DateTimeOriginal"),
            license=f("LicenseShortName"), license_url=f("LicenseUrl"),
            width=int(ii.get("width") or 0), height=int(ii.get("height") or 0),
            thumb_url=ii.get("thumburl", ""), mime=ii.get("mime", ""),
        ))
    return out


# ------------------------------------------------------------------ registry
def providers_in_order() -> List[str]:
    """Mandated discovery order; SearXNG first only when a base URL is configured."""
    names = []
    if searxng_base():
        names.append("searxng")
    names += ["openverse", "nasa", "internetarchive", "commons"]
    return names


def discover(query: str, per_provider: int = 10, providers=None) -> List[Candidate]:
    """Run one query across the registry in priority order. Serial + rate-limited.
    Deduplicates by media_url within the batch (cross-run dedup lives in the ledger)."""
    seen_urls, out = set(), []
    for name in (providers or providers_in_order()):
        provider_rateSleep()
        fn = {"searxng": searxng_search, "openverse": openverse_search,
              "nasa": nasa_search, "internetarchive": internetarchive_search,
              "commons": commons_search}[name]
        try:
            batch = fn(query, per_provider)
        except Exception as e:   # a provider must never abort the sweep
            print(f"  {name}: FAILED {type(e).__name__}: {e}")
            batch = []
        fresh = 0
        for c in batch:
            if c.media_url and c.media_url not in seen_urls:
                seen_urls.add(c.media_url)
                out.append(c)
                fresh += 1
        print(f"  {name}: {len(batch)} results ({fresh} new) for '{query[:60]}'")
    return out
