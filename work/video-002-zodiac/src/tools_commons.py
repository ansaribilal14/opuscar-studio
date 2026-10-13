#!/usr/bin/env python3
"""tools_commons.py — Wikimedia Commons search with license metadata.
usage: python3 src/tools_commons.py search "query" [limit]
       python3 src/tools_commons.py fetch <title> <outname.jpg>
License ledger appended to images/CREDITS-raw.md on fetch."""
import json, os, re, sys, urllib.parse, urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "documentary-engine/1.0 (research; contact: repo owner)"}

def call(params):
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def search(query, limit=8):
    d = call({"action": "query", "generator": "search", "gsrsearch": f"filetype:bitmap {query}",
              "gsrnamespace": "6", "gsrlimit": str(limit), "prop": "imageinfo",
              "iiprop": "url|extmetadata|size", "iiurlwidth": "1800", "format": "json"})
    out = []
    for p in (d.get("query", {}).get("pages", {}) or {}).values():
        ii = (p.get("imageinfo") or [{}])[0]
        em = ii.get("extmetadata", {})
        lic = em.get("LicenseShortName", {}).get("value", "?")
        artist = re.sub(r"<[^>]+>", "", em.get("Artist", {}).get("value", "?")).strip()[:60]
        out.append({"title": p.get("title", "?"), "license": lic, "artist": artist,
                    "w": ii.get("width"), "h": ii.get("height"),
                    "url": ii.get("thumburl") or ii.get("url")})
    return out

def fetch(title, outname):
    d = call({"action": "query", "titles": title, "prop": "imageinfo",
              "iiprop": "url|extmetadata", "iiurlwidth": "1800", "format": "json"})
    page = list(d["query"]["pages"].values())[0]
    ii = page["imageinfo"][0]
    em = ii.get("extmetadata", {})
    url = ii.get("thumburl") or ii["url"]
    req = urllib.request.Request(url, headers=UA)
    data = urllib.request.urlopen(req, timeout=60).read()
    if len(data) < 20000:
        raise SystemExit(f"too small: {len(data)}b")
    os.makedirs("images/cache", exist_ok=True)
    open(f"images/cache/{outname}", "wb").write(data)
    lic = em.get("LicenseShortName", {}).get("value", "?")
    artist = re.sub(r"<[^>]+>", "", em.get("Artist", {}).get("value", "?")).strip()
    credit = em.get("Credit", {}).get("value", "")
    credit = re.sub(r"<[^>]+>", "", credit).strip()[:120]
    src = em.get("AttributionRequired", {}).get("value", "")
    line = (f"| {outname} | {page['title']} | {lic} | {artist} | {credit} |\n")
    with open("images/CREDITS-raw.md", "a") as f:
        f.write(line)
    print(f"FETCHED {outname} {len(data)//1024}KB lic={lic}")

if __name__ == "__main__":
    if sys.argv[1] == "search":
        for r in search(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 8):
            print(f"{r['title'][:70]:70s} | {r['license']:22s} | {r['w']}x{r['h']} | {r['artist'][:40]}")
    elif sys.argv[1] == "fetch":
        fetch(sys.argv[2], sys.argv[3])
