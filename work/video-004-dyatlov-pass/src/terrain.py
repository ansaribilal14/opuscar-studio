#!/usr/bin/env python3
"""terrain.py — fetch Mapzen terrarium elevation tiles (AWS Open Data, SRTM/ETOPO1),
build DEM mosaics, render hillshade + slope-angle plates for video-004.

Outputs (neutral plates; node scenes composite labels/markers over them):
  images/terrain/route_relief.png      z10 mosaic around Vizhay->Otorten corridor
  images/terrain/campsite_relief.png   z13 mosaic around Kholat Syakhl campsite
  images/terrain/campsite_slope.png    slope-degree map (science scenes)
  images/terrain_cache/*.png           raw tiles (cache + provenance)
  images/terrain/manifest.json         tile URLs, license, parameters
Resumable: cached tiles are reused.
"""
import json, math, os, time, urllib.request
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "images/terrain_cache")
OUT = os.path.join(ROOT, "images/terrain")
os.makedirs(CACHE, exist_ok=True); os.makedirs(OUT, exist_ok=True)
UA = {"User-Agent": "OpuscarStudio/1.0 (documentary terrain plates)"}
SRC = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium"
LICENSE = "Mapzen Terrain Tiles via AWS Open Data (sources: SRTM, ETOPO1, NED) — CC-BY 4.0, attribution required"

def tile_xy(lat, lon, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y

def fetch_tile(z, x, y):
    p = os.path.join(CACHE, f"{z}_{x}_{y}.png")
    if os.path.exists(p) and os.path.getsize(p) > 0:
        return Image.open(p)
    url = f"{SRC}/{z}/{x}/{y}.png"
    for t in range(4):
        try:
            req = urllib.request.Request(url, headers=UA)
            data = urllib.request.urlopen(req, timeout=40).read()
            open(p, "wb").write(data)
            time.sleep(0.4)
            return Image.open(p)
        except Exception as e:
            print(f"  retry {t+1} {z}/{x}/{y}: {e}"); time.sleep(3 * (t + 1))
    raise RuntimeError(f"tile {z}/{x}/{y} failed")

def mosaic(lat0, lat1, lon0, lon1, z):
    xa, _ = tile_xy(lat0, lon0, z); xb, _ = tile_xy(lat0, lon1, z)
    _, ya = tile_xy(lat1, lon0, z); _, yb = tile_xy(lat0, lon0, z)
    x0, x1 = int(math.floor(min(xa, xb))), int(math.ceil(max(xa, xb)))
    y0, y1 = int(math.floor(min(ya, yb))), int(math.ceil(max(ya, yb)))
    W, H = (x1 - x0) * 256, (y1 - y0) * 256
    dem = np.zeros((H, W), dtype=np.float32)
    urls = []
    for ty in range(y0, y1):
        for tx in range(x0, x1):
            im = np.asarray(fetch_tile(z, tx, ty), dtype=np.float32)
            elev = im[..., 0] * 256 + im[..., 1] + im[..., 2] / 256 - 32768
            dem[(ty - y0) * 256:(ty - y0 + 1) * 256, (tx - x0) * 256:(tx - x0 + 1) * 256] = elev
            urls.append(f"{SRC}/{z}/{tx}/{ty}.png")
    print(f"  z{z} mosaic {W}x{H} tiles={len(urls)} elev range {dem.min():.0f}..{dem.max():.0f} m")
    return dem, urls

def relief(dem, zres_m, azimuth=315, altitude=45, z=1.6):
    """Hillshade via gradient; zres = metres per pixel."""
    gy, gx = np.gradient(dem * z)
    gx *= zres_m; gy *= zres_m
    slope = np.pi / 2 - np.arctan(np.sqrt(gx ** 2 + gy ** 2))
    aspect = np.arctan2(-gx, gy)
    az = math.radians(azimuth); alt = math.radians(altitude)
    shaded = (np.sin(alt) * np.sin(slope) +
              np.cos(alt) * np.cos(slope) * np.cos(az - aspect))
    return np.clip(shaded, 0, 1) ** 1.25

def slope_deg(dem, zres_m):
    gy, gx = np.gradient(dem)
    gx *= zres_m; gy *= zres_m
    return np.degrees(np.arctan(np.sqrt(gx ** 2 + gy ** 2)))

def meters_per_px(lat, z):
    return 156543.03392 * math.cos(math.radians(lat)) / (2 ** z)

def save(arr, path, lo=2, hi=98, gain=1.0):
    a = arr.astype(np.float32)
    p1, p99 = np.percentile(a, [lo, hi])
    a = np.clip((a - p1) / max(p99 - p1, 1e-6), 0, 1) ** gain
    Image.fromarray((a * 255).astype(np.uint8)).save(path)

def main():
    man = {"license": LICENSE, "fetched": "2026-10-15", "plates": {}}
    # 1) route corridor Vizhay(60.9N)->Otorten(61.9N)
    print("route mosaic z10 ...")
    dem, urls = mosaic(60.82, 61.96, 59.15, 60.05, 10)
    zres = meters_per_px(61.4, 10)
    save(relief(dem, zres), os.path.join(OUT, "route_relief.png"))
    man["plates"]["route_relief"] = {"zoom": 10, "res_m": round(zres, 1), "tiles": urls}
    # 2) campsite close-up (Kholat Syakhl slope + shoulder + forest edge)
    print("campsite mosaic z13 ...")
    dem2, urls2 = mosaic(61.70, 61.79, 59.36, 59.55, 13)
    zres2 = meters_per_px(61.745, 13)
    save(relief(dem2, zres2, z=2.2), os.path.join(OUT, "campsite_relief.png"))
    man["plates"]["campsite_relief"] = {"zoom": 13, "res_m": round(zres2, 1), "tiles": urls2}
    # 3) slope-angle map of same region (evidence for the 23-degree claim)
    s = slope_deg(dem2, zres2)
    np.save(os.path.join(OUT, "campsite_slope_deg.npy"), s)
    save(s / 45.0, os.path.join(OUT, "campsite_slope.png"))
    man["plates"]["campsite_slope"] = {"zoom": 13, "res_m": round(zres2, 1), "tiles": urls2,
                                       "note": "slope degrees / 45 (linear gray)"}
    json.dump(man, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
    print("DONE — plates in images/terrain/, manifest written")

if __name__ == "__main__":
    main()
