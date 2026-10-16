"""Provider adapter tests against local stub HTTP servers — plus live-shape validation.
No external network in pytest; live behavior is proven separately by the real E2E run."""

import json
import pytest

from imgacq import providers as pv
from imgacq.common import HttpError, RETRIES


# ------------------------------------------------------------------ SearXNG
def test_searxng_skips_gracefully_when_unconfigured(monkeypatch):
    monkeypatch.delenv("IMGACQ_SEARXNG_URL", raising=False)
    assert pv.searxng_search("anything") == []
    assert "searxng" not in pv.providers_in_order()


def test_searxng_adapter_contract(stub_server, monkeypatch):
    base, H = stub_server
    H.routes["/search"] = (200, {"Content-Type": "application/json"}, {
        "results": [
            {"title": "Tent 1959 <b>photo</b>", "url": "https://example.org/page",
             "img_src": "https://example.org/img.jpg", "author": "Archive",
             "img_width": 1200, "img_height": 800},
            {"title": "no img_src", "url": "https://x"},
        ]})
    monkeypatch.setenv("IMGACQ_SEARXNG_URL", base)
    res = pv.searxng_search("tent")
    assert len(res) == 1
    c = res[0]
    assert c.provider == "searxng"
    assert c.media_url == "https://example.org/img.jpg"
    assert c.source_page == "https://example.org/page"
    assert c.license == ""          # SearXNG carries no license data → must stay unverified
    assert "<b>" not in c.title     # HTML stripped


def test_searxng_outage_degrades(stub_server, monkeypatch, no_sleep):
    base, _ = stub_server            # server up but no /search route → 404
    monkeypatch.setenv("IMGACQ_SEARXNG_URL", base)
    assert pv.searxng_search("q") == []


# ------------------------------------------------------------------ Openverse
def test_openverse_normalization(stub_server):
    base, H = stub_server
    pv.OPENVERSE_API = base + "/v1/images/"
    H.routes["/v1/images/"] = (200, {"Content-Type": "application/json"}, {
        "results": [{
            "url": "https://live.staticflickr.com/x.jpg",
            "foreign_landing_url": "https://www.flickr.com/photos/a/1",
            "title": "Group portrait", "creator": "I. Photographer",
            "license": "by", "license_version": "4.0",
            "license_url": "https://creativecommons.org/licenses/by/4.0/",
            "width": 1024, "height": 768, "filetype": "jpg",
        }, {
            "url": "https://live.staticflickr.com/y.jpg",
            "title": "PD photo", "license": "pdm", "license_version": "",
            "width": 800, "height": 600,
        }]})
    res = pv.openverse_search("dyatlov")
    assert [c.license for c in res] == ["CC BY 4.0", "Public domain"]
    assert res[0].license_url.endswith("/by/4.0/")


def test_openverse_rate_limit_returns_empty_after_retries(stub_server, no_sleep):
    base, H = stub_server
    pv.OPENVERSE_API = base + "/v1/images/"
    H.routes["/v1/images/"] = (429, {"Retry-After": "0"}, {"error": "slow down"})
    assert pv.openverse_search("q") == []     # exhausted retries, degraded gracefully
    assert len(H.calls) == RETRIES         # retried the mandated number of times


# ------------------------------------------------------------------ Internet Archive
def test_internetarchive_unavailable_degrades(monkeypatch, no_sleep):
    # unroutable host in the closed-port range → connect timeout → []
    pv.IA_SEARCH = "http://127.0.0.1:1/advancedsearch.php"
    assert pv.internetarchive_search("q") == []


def test_internetarchive_discovery_and_media_resolution(stub_server):
    base, H = stub_server
    pv.IA_SEARCH = base + "/advancedsearch.php"
    pv.IA_METADATA = base + "/metadata/"
    H.routes["/advancedsearch.php"] = (200, {"Content-Type": "application/json"}, {
        "response": {"docs": [{"identifier": "dyatlov_collection",
                               "title": ["Case files"], "year": "1959"}]}})
    H.routes["/metadata/dyatlov_collection"] = (200, {"Content-Type": "application/json"}, {
        "files": [{"name": "small_thumb.jpg", "format": "Thumbnail", "size": 100},
                  {"name": "plate_full.jpg", "format": "JPEG", "size": 900000},
                  {"name": "doc.pdf", "format": "Text PDF", "size": 5000000}]})
    res = pv.internetarchive_search("dyatlov")
    assert len(res) == 1
    c = res[0]
    c = pv.internetarchive_resolve_media(c)
    assert c.media_url.endswith("/metadata/dyatlov_collection/plate_full.jpg")
    assert c.source_page == "https://archive.org/details/dyatlov_collection"


# ------------------------------------------------------------------ Commons
def test_commons_normalization(stub_server):
    base, H = stub_server
    pv.COMMONS_API = base + "/w/api.php"
    H.routes["/w/api.php"] = (200, {"Content-Type": "application/json"}, {
        "query": {"pages": {"101": {
            "title": "File:Dyatlov tent 1959.jpg", "imageinfo": [{
                "url": "https://upload.wikimedia.org/full.jpg",
                "thumburl": "https://upload.wikimedia.org/1600px-full.jpg",
                "width": 2000, "height": 1500, "mime": "image/jpeg",
                "extmetadata": {
                    "LicenseShortName": {"value": "Public domain"},
                    "LicenseUrl": {"value": ""},
                    "Artist": {"value": "<span>Ivanov, 1959</span>"},
                    "DateTimeOriginal": {"value": "1959-02-26"},
                }}]}}}})
    res = pv.commons_search("dyatlov")
    assert len(res) == 1
    c = res[0]
    assert c.license == "Public domain"
    assert c.creator == "Ivanov, 1959"       # HTML stripped from extmetadata
    assert c.source_page == ("https://commons.wikimedia.org/wiki/"
                             "File%3ADyatlov_tent_1959.jpg")


def test_commons_rate_limited_degrades(stub_server, no_sleep):
    base, H = stub_server
    pv.COMMONS_API = base + "/w/api.php"
    H.routes["/w/api.php"] = (403, {"Content-Type": "text/html"},
                              "<html>Too Many Reqs</html>")
    assert pv.commons_search("q") == []


# ------------------------------------------------------------------ registry/dispatch
def test_discover_priority_order_and_never_aborts(stub_server, monkeypatch, no_sleep):
    base, H = stub_server
    pv.OPENVERSE_API = base + "/ov/"
    pv.COMMONS_API = base + "/w/api.php"
    pv.IA_SEARCH = base + "/ia"
    H.routes["/ov/"] = (200, {}, {"results": [{"url": base + "/ov_img.jpg",
                                               "title": "OV", "license": "cc0"}]})
    H.routes["/ia"] = (500, {}, "boom")           # provider failure must not abort sweep
    H.routes["/w/api.php"] = (200, {}, {"query": {"pages": {}}})
    res = pv.discover("dyatlov", per_provider=3)
    assert [c.provider for c in res] == ["openverse"]   # OV first (SearXNG unconfigured)
    # order of route hits proves priority: openverse before ia before commons
    order = [p.split("?")[0] for p in H.calls]
    assert order.index("/ov/") < order.index("/ia") < order.index("/w/api.php")


def test_discover_dedups_within_batch(stub_server):
    base, H = stub_server
    pv.OPENVERSE_API = base + "/ov/"
    H.routes["/ov/"] = (200, {}, {"results": [{"url": base + "/same.jpg", "title": "A",
                                               "license": "cc0"},
                                              {"url": base + "/same.jpg", "title": "B",
                                               "license": "cc0"}]})
    res = pv.discover("q", per_provider=5, providers=["openverse"])
    assert len(res) == 1


def test_commons_curl_fallback_degrades(stub_server, no_sleep):
    """Commons-only curl fallback: after requests-retries exhaust on 403, one curl
    attempt is made (total = RETRIES+1 calls) and failure still degrades to [].
    Other providers keep their exact retry contract (no fallback)."""
    base, H = stub_server
    pv.COMMONS_API = base + "/w/api.php"
    H.routes["/w/api.php"] = (403, {}, "blocked")
    assert pv.commons_search("q") == []
    assert len(H.calls) == 4 + 1            # commons tries=4 override + single curl attempt
    # openverse contract unchanged: exactly RETRIES calls, no curl attempt
    pv.OPENVERSE_API = base + "/v1/images/"
    H.routes["/v1/images/"] = (429, {"Retry-After": "0"}, {"error": "slow down"})
    assert pv.openverse_search("q") == []
    total_before = len(H.calls)
    assert total_before == (4 + 1) + RETRIES
