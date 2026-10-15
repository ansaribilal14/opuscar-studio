#!/usr/bin/env python3
"""Commons asset sweep for video-004: category members + searches -> candidate JSON.
Serial, bounded, license metadata captured per file (url, extmeta)."""
import json, urllib.request, urllib.parse, time, sys

UA = {'User-Agent': 'OpuscarStudio/1.0 (documentary asset research; contact repo)'}
OUT = '/home/z/my-project/work/video-004-dyatlov-pass/images/commons_candidates.json'

def api(params, tries=4):
    params = dict(params, format='json')
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    for t in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=45) as r:
                return json.loads(r.read().decode())
        except Exception as e:
            print(f'  retry {t+1} after error: {e}', file=sys.stderr); time.sleep(4 * (t + 1))
    return None

def sweep(params, label):
    j = api(params)
    if not j: return []
    pages = j.get('query', {}).get('pages', {})
    items = []
    for p in pages.values():
        if 'imageinfo' not in p: continue
        ii = p['imageinfo'][0]
        em = ii.get('extmetadata', {})
        def f(k):
            v = em.get(k, {}).get('value', '') or ''
            import re as _re
            return _re.sub(r'<[^>]+>', '', str(v)).strip()[:220]
        items.append({
            'title': p.get('title', ''), 'url': ii.get('url', ''),
            'thumb': ii.get('thumburl', ''), 'w': ii.get('width'), 'h': ii.get('height'),
            'license_short': f('LicenseShortName'), 'license_url': f('LicenseUrl'),
            'artist': f('Artist'), 'credit': f('Credit'), 'date': f('DateTimeOriginal'),
            'desc': f('ImageDescription'), 'categories_hint': label,
        })
    return items

all_items = {}
# 1) category members (incl. subcats via gcmcategoryhierarchy? keep top level + explicit subcats)
CATS = ['Category:Dyatlov Pass incident', 'Category:Kholat Syakhl', 'Category:Dyatlov Pass']
for cat in CATS:
    r = sweep({'action': 'query', 'generator': 'categorymembers', 'gcmtitle': cat,
               'gcmtype': 'file', 'gcmlimit': 100,
               'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata',
               'iiurlwidth': '1600'}, cat)
    for it in (r or []): all_items[it['title']] = it
    print(f'{cat}: {len(r or [])} files'); time.sleep(2)

# 2) targeted searches
QUERIES = ['Dyatlov Pass tent', 'Dyatlov Pass 1959', 'Kholat Syakhl', 'Otorten',
           'Dyatlov memorial', 'Dyatlov Pass search']
for q in QUERIES:
    r = sweep({'action': 'query', 'generator': 'search', 'gsrsearch': f'{q} filetype:bitmap',
               'gsrnamespace': 6, 'gsrlimit': 25,
               'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata',
               'iiurlwidth': '1600'}, f'search:{q}')
    for it in (r or []): all_items.setdefault(it['title'], it)
    print(f'search "{q}": {len(r or [])} files'); time.sleep(2)

json.dump(list(all_items.values()), open(OUT, 'w'), indent=1, ensure_ascii=False)
print(f'TOTAL UNIQUE CANDIDATES: {len(all_items)} -> {OUT}')
# quick license triage summary
from collections import Counter
c = Counter((it.get('license_short') or 'UNKNOWN') for it in all_items.values())
print('LICENSE TRIAGE:', dict(c))
