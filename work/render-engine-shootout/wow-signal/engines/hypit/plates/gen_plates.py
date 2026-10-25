#!/usr/bin/env python3
"""gen_plates.py — deterministic 1920x1080 plates for the Hypit implementation (v2 PAPER & SKY).

Two layers per scene:
  bg_SCXX.png  — full-frame environment (SKY night gradient / PAPER light-table), no content
  fg_SCXX.png  — transparent RGBA hero content (big type, diagrams, cards, archival scans)

Plus caption strips (caps/cap_0001.png ...) from the frozen SRT.
Everything is drawn here with Pillow — this is Engine C's own asset pipeline
(the Hypit runtime composites, moves, times and encodes everything).
"""
import json
import math
import os
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
W, H = 1920, 1080

F = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FM = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
FMb = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
FC = "/usr/share/fonts/truetype/english/Carlito-Regular.ttf"
FCB = "/usr/share/fonts/truetype/english/Carlito-Bold.ttf"

def font(path, size):
    return ImageFont.truetype(path, size)

INK = (244, 242, 236, 255); DIM = (157, 176, 200, 255)
SIGNAL = (75, 225, 160, 255); CYAN = (88, 199, 240, 255)
CRIMSON = (192, 57, 43, 255); WARN = (224, 179, 76, 255)
PENRED = (192, 57, 43, 255)
INKP = (46, 42, 34, 255); INKP2 = (74, 68, 54, 255); INKP3 = (58, 53, 43, 255)
GRN = (29, 92, 68, 255); REDD = (138, 47, 34, 255)

def tw(d, s, f):
    b = d.textbbox((0, 0), s, font=f); return b[2] - b[0]

def text_tracked(d, cx, cy, s, f, fill, tracking=8):
    total = sum(tw(d, ch, f) + tracking for ch in s) - tracking
    x = cx - total / 2
    for ch in s:
        d.text((x, cy), ch, font=f, fill=fill, anchor="lm")
        x += tw(d, ch, f) + tracking
    return total

def text_c(d, cx, cy, s, f, fill):
    d.text((cx, cy), s, font=f, fill=fill, anchor="mm")

def hand_ellipse(d, cx, cy, rx, ry, color, width=10, seed=5, rot=-0.06):
    rnd = random.Random(seed)
    pts = []
    for i in range(73):
        a = i / 72 * math.tau
        jx = (rnd.random() - 0.5) * 5
        jy = (rnd.random() - 0.5) * 5
        x = cx + math.cos(a) * rx * math.cos(rot) - math.sin(a) * ry * math.sin(rot) + jx
        y = cy + math.cos(a) * rx * math.sin(rot) + math.sin(a) * ry * math.cos(rot) + jy
        pts.append((x, y))
    d.line(pts, fill=color, width=width, joint="curve")

def hand_line(d, pts, color, width=6, seed=8):
    rnd = random.Random(seed)
    j = [(x + (rnd.random() - 0.5) * 5, y + (rnd.random() - 0.5) * 5) for x, y in pts]
    d.line(j, fill=color, width=width, joint="curve")

def sky_bg(emptier=0.0, bigear=False, seed=7):
    im = Image.new("RGB", (W, H))
    px = im.load()
    top = (19, 32, 63); mid = (10, 18, 38); low = (4, 7, 15)
    for y in range(H):
        t = y / H
        if t < 0.45:
            c = tuple(int(top[i] + (mid[i] - top[i]) * (t / 0.45)) for i in range(3))
        else:
            c = tuple(int(mid[i] + (low[i] - mid[i]) * ((t - 0.45) / 0.55)) for i in range(3))
        for x in range(W):
            px[x, y] = c
    d = ImageDraw.Draw(im, "RGBA")
    band = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    bd.polygon([(W * 0.1, H * 0.62), (W * 0.55, H * 0.18), (W * 0.75, H * 0.3), (W * 0.3, H * 0.75)],
               fill=(88, 199, 240, 16))
    band = band.filter(ImageFilter.GaussianBlur(60))
    im.paste(band, (0, 0), band)
    d = ImageDraw.Draw(im, "RGBA")
    rnd = random.Random(101)
    for _ in range(int(240 * (1 - emptier * 0.55))):
        bx = rnd.uniform(0, W); by = rnd.uniform(H * 0.25, H * 0.68)
        off = abs(bx * math.tan(-0.42) + by - H * 0.45)
        if off < H * 0.16:
            d.rectangle([bx, by, bx + 2, by + 2], fill=(219, 233, 255, rnd.randint(70, 160)))
    for _ in range(int(200 * (1 - emptier * 0.5))):
        x, y = rnd.uniform(0, W), rnd.uniform(0, H * 0.9)
        s = rnd.choice([1, 1, 2, 2, 3])
        col = (255, 255, 255, rnd.randint(90, 220)) if rnd.random() > 0.1 else (88, 199, 240, 200)
        d.ellipse([x - s / 2, y - s / 2, x + s / 2, y + s / 2], fill=col)
    hz = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hz)
    hd.rectangle([0, H * 0.84, W, H], fill=(16, 44, 72, 120))
    hz = hz.filter(ImageFilter.GaussianBlur(30))
    im.paste(hz, (0, 0), hz)
    d = ImageDraw.Draw(im, "RGBA")
    d.line([(0, H * 0.86), (W, H * 0.86)], fill=(88, 199, 240, 40), width=2)
    if bigear:
        big_ear(d, W * 0.35, H * 0.905, W * 0.30)
    return im

def big_ear(d, x, y, w):
    h = w * 0.30
    d.rectangle([x - w * 0.08, y, x + w * 1.08, y + h * 0.30], fill=(2, 4, 10, 255))
    d.polygon([(x, y), (x + w * 0.06, y - h * 0.84), (x + w * 0.94, y - h * 0.84), (x + w, y)], fill=(2, 4, 10, 255))
    d.polygon([(x + w * 0.56, y), (x + w * 0.66, y - h * 2.07), (x + w * 0.78, y)], fill=(2, 4, 10, 255))
    d.line([(x + w * 0.63, y - h * 1.13), (x + w * 0.63, y - h * 1.73)], fill=(2, 4, 10, 255), width=max(3, int(w * 0.008)))
    d.line([(x + w * 0.71, y - h), (x + w * 0.71, y - h * 1.53)], fill=(2, 4, 10, 255), width=max(3, int(w * 0.008)))

def paper_bg(seed=31, rows=22):
    im = Image.new("RGB", (W, H), (23, 15, 8))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W * 0.05, H * 0.08, W * 0.95, H * 0.92], fill=(36, 26, 16, 255))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    im.paste(glow, (0, 0), glow)
    sheet = Image.new("RGBA", (W + 80, H + 80), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sheet)
    sd.rectangle([0, 0, W + 80, H + 80], fill=(236, 227, 205, 255))
    pg = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    pgd = ImageDraw.Draw(pg)
    pgd.ellipse([-W * 0.2, -H * 0.2, W * 1.1, H * 1.0], fill=(255, 250, 230, 42))
    pgd.ellipse([-W * 0.1, -H * 0.1, W * 1.2, H * 1.3], fill=(120, 100, 60, 46))
    pg = pg.filter(ImageFilter.GaussianBlur(120))
    sheet.paste(pg, (0, 0), pg)
    sd = ImageDraw.Draw(sheet)
    sd.rectangle([0, 0, 62, H + 80], fill=(120, 106, 78, 46))
    sd.rectangle([W + 18, 0, W + 80, H + 80], fill=(120, 106, 78, 46))
    rnd = random.Random(seed)
    for i in range(26):
        yy = 30 + i * ((H + 40) / 26)
        sd.ellipse([14, yy - 8, 46, yy + 8], fill=(40, 34, 20, 70))
        sd.ellipse([W + 34, yy - 8, W + 66, yy + 8], fill=(40, 34, 20, 70))
    for i in range(30):
        yy = 30 + i * ((H + 40) / 30)
        sd.line([(62, yy), (W + 18, yy)], fill=(90, 84, 62, 66), width=2)
    f = font(FM, 24)
    glyph = "0123456789 .+"
    for r in range(rows):
        yy = 40 + r * ((H + 20) / rows)
        xx = 120
        cols = rnd.randint(8, 16)
        for c in range(cols):
            run = rnd.randint(1, 3)
            s = "".join(rnd.choice(glyph) for _ in range(run))
            sd.text((xx, yy), s, font=f, fill=(46, 42, 34, rnd.randint(130, 215)))
            xx += 150 + rnd.randint(0, 90)
            if xx > W - 80: break
    sheet = sheet.rotate(0.7, resample=Image.BICUBIC, expand=False)
    im.paste(sheet, (-40, -40), sheet)
    return im

SKY_SCENES = {"SC01": dict(bigear=True), "SC02": dict(emptier=0.55), "SC03": dict(),
              "SC04": dict(), "SC05": dict(emptier=0.35), "SC11": dict(emptier=0.3),
              "SC12": dict(emptier=0.35), "SC16": dict(), "SC21": dict(emptier=0.45),
              "SC22": dict(emptier=0.6), "SC23": dict(emptier=0.68), "SC31": dict(emptier=0.5),
              "SC32": dict(), "SC33": dict(emptier=0.25), "SC34": dict()}
PAPER_SCENES = {"SC06": 20, "SC07": 22, "SC08": 8, "SC09": 6, "SC10": 14, "SC13": 16,
                "SC14": 6, "SC15": 6, "SC17": 12, "SC18": 10, "SC19": 14, "SC20": 12,
                "SC24": 10, "SC25": 10, "SC26": 12, "SC27": 10, "SC28": 8, "SC29": 8, "SC30": 6}

def channel_mark(d):
    d.rectangle([48, 54, 54, 96], fill=CRIMSON)
    f = font(FCB, 36)
    d.text((72, 75), "THE UNCLOSED FILE", font=f, fill=INK, anchor="lm")

def recon(d, s="RECONSTRUCTION"):
    f = font(FC, 32)
    d.text((W - 48, 84), s, font=f, fill=(157, 176, 200, 185), anchor="rm")

def chip(d, x, y, s, color, size=38):
    f = font(FCB, size)
    w = tw(d, s.upper(), f)
    d.rectangle([x, y, x + w + 56, y + size + 34], outline=color, width=3)
    d.text((x + 28, y + (size + 34) / 2), s.upper(), font=f, fill=color, anchor="lm")

def pcard(d, x, y, w, h):
    d.rectangle([x + 14, y + 18, x + w + 14, y + h + 18], fill=(25, 16, 8, 110))
    d.rectangle([x, y, x + w, y + h], fill=(236, 227, 205, 255), outline=(120, 105, 70, 140), width=3)
    d.rectangle([x, y, x + 24, y + h], fill=(90, 80, 55, 40))
    d.rectangle([x + w - 24, y, x + w, y + h], fill=(90, 80, 55, 40))

SCAN_CLOSE = Image.open(os.path.join(FILM, "shared/assets/printout_close.jpg")).convert("RGB")
SCAN_PAGE = Image.open(os.path.join(FILM, "shared/assets/printout_page.jpg")).convert("RGB")

def paste_scan(fg, img, x, y, h):
    ih = img.height; iw = img.width
    w = int(h * iw / ih)
    sc = img.resize((w, int(h)))
    sh = Image.new("RGBA", (w + 20, int(h) + 20), (0, 0, 0, 0))
    shd = ImageDraw.Draw(sh)
    shd.rectangle([14, 16, w + 14, int(h) + 16], fill=(15, 10, 5, 160))
    sh.paste(sc, (0, 0))
    shd.rectangle([0, 0, w - 1, int(h) - 1], outline=(88, 199, 240, 110), width=4)
    fg.paste(sh, (int(x), int(y)), sh)
    return w

def fg_base():
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)

def gen_fg(sc):
    im, d = fg_base()
    fc36 = font(FC, 36); fc38 = font(FCB, 38); fc40 = font(FCB, 40)
    if sc == "SC01":
        text_tracked(d, W/2, 195, "AUGUST 15, 1977", font(FB, 92), INK, 8)
        text_tracked(d, W/2, 287, "11:16 P.M. EASTERN", font(FC, 44), DIM, 10)
        pts = [(W*0.12 + i/110*W*0.76, H*0.68 - math.exp(-(((i/110)-0.5)/0.235)**2/2)*H*0.30) for i in range(111)]
        d.line(pts, fill=SIGNAL, width=7, joint="curve")
        d.rectangle([W*0.30, H*0.715, W*0.70, H*0.715+22], outline=SIGNAL, width=3)
        d.rectangle([W*0.42, H*0.715, W*0.58, H*0.715+22], fill=(75, 225, 160, 200))
        text_tracked(d, W/2, 837, "OHIO IS LISTENING TO THE SKY", font(FC, 40), DIM, 6)
        channel_mark(d)
    elif sc == "SC02":
        chars = "6EQUJ5"
        f = font(FMb, 230)
        total = sum(tw(d, c, f) for c in chars) + 30 * 5
        x = W/2 - total/2
        for i, c in enumerate(chars):
            col = SIGNAL if i == 3 else INK
            d.text((x + tw(d, c, f)/2, H*0.44), c, font=f, fill=col, anchor="mm")
            x += tw(d, c, f) + 30
        hand_ellipse(d, W/2 - 6, H*0.44, 470, 155, PENRED, 12, 12)
        d.text((W*0.105, H*0.44 + 250), "Wow!", font=font(FB, 165), fill=PENRED, anchor="lm")
        text_tracked(d, W/2, 853, "SIX CHARACTERS FROM DEEP SPACE", font(FC, 48), DIM, 8)
        channel_mark(d); recon(d, "PRINTOUT CHARACTERS — WIKIMEDIA COMMONS (PD)")
    elif sc == "SC03":
        d.rectangle([W*0.36, H*0.235, W*0.64, H*0.235 + 8], fill=CRIMSON)
        text_tracked(d, W/2, H*0.415, "THE WOW! SIGNAL", font(FB, 148), INK, 16)
        text_tracked(d, W/2, H*0.545, "72 SECONDS FROM DEEP SPACE", font(FB, 58), SIGNAL, 14)
        text_tracked(d, W/2, H*0.66, "A FILM FROM THE UNCLOSED FILE", font(FC, 40), DIM, 10)
    elif sc == "SC04":
        text_tracked(d, W/2, 108, "BIG EAR", font(FB, 78), INK, 10)
        text_tracked(d, W/2, 186, "OHIO STATE UNIVERSITY RADIO OBSERVATORY", font(FC, 40), DIM, 6)
        labels = [("FLAT REFLECTOR", W*0.30, H*0.47), ("FIXED PARABOLOID", W*0.74, H*0.34),
                  ("FEED HORNS", W*0.845, H*0.475), ("STEEL GROUND PLANE", W*0.175, H*0.80)]
        for s, lx, ly in labels:
            d.text((lx, ly + 8), s, font=fc40, fill=INK, anchor="mm")
        d.rectangle([W*0.655, H*0.34, W*0.665, H*0.53], fill=(75, 225, 160, 130))
        channel_mark(d); recon(d)
    elif sc == "SC05":
        text_tracked(d, W/2, 135, "THE SKY SWEEPS — THE TELESCOPE NEVER MOVES", font(FB, 64), INK, 2)
        d.text((W*0.035, H*0.24), "DECLINATION STRIP +30° TO −50° (1950.0)", font=fc38, fill=DIM, anchor="lm")
        d.rectangle([0, H*0.30, W, H*0.72], fill=(10, 18, 38, 140), outline=(88, 199, 240, 90), width=3)
        text_tracked(d, W/2, 837, "72 SECONDS PER SKY POINT", font(FB, 60), INK, 4)
        channel_mark(d); recon(d)
    elif sc == "SC06":
        text_tracked(d, W/2, 130, "A DECADE OF LISTENING", font(FB, 72), INKP, 4)
        cards = [("~20,000", "RADIO SOURCES CATALOGUED", INKP), ("2", "RECORD QUASARS FOUND", INKP),
                 ("1972", "FUNDING CUT ORDERED", PENRED)]
        for i, (num, cap, col) in enumerate(cards):
            x = W*(0.06 + i*0.33); y = H*0.28
            pcard(d, x, y, W*0.26, H*0.42)
            nf = font(FB, 96 if len(num) > 4 else 116)
            d.text((x + W*0.13, y + H*0.15), num, font=nf, fill=col, anchor="mm")
            d.text((x + W*0.13, y + H*0.31), cap, font=fc36, fill=INKP2, anchor="mm")
            if i == 2:
                hand_line(d, [(x + W*0.05, y + H*0.225), (x + W*0.21, y + H*0.22)], PENRED, 6, 8 + i)
        channel_mark(d); recon(d)
    elif sc == "SC07":
        text_tracked(d, W/2, 100, "THE NARROWBAND SEARCH MACHINE", font(FB, 72), INKP, 2)
        d.text((W/2, 188), "50 channels · IBM 1130-era computing · line printer", font=fc40, fill=(90, 82, 64, 255), anchor="mm")
        bx, by, bw, bh = W*0.085, H*0.28, W*0.83, H*0.44
        d.rectangle([bx + 10, by + 14, bx + bw + 10, by + bh + 14], fill=(25, 16, 8, 100))
        d.rectangle([bx, by, bx + bw, by + bh], fill=(217, 207, 178, 255), outline=(120, 105, 70, 140), width=3)
        cw, chh = bw/10, bh/5
        f = font(FM, 30)
        for r in range(5):
            for c in range(10):
                idx = r*10 + c
                x0, y0 = bx + c*cw, by + r*chh
                d.rectangle([x0+5, y0+5, x0+cw-5, y0+chh-5], fill=(75, 225, 160, 56),
                            outline=(90, 80, 55, 100), width=2)
                d.text((x0+cw/2, y0+chh/2), f"{idx+1:02d}", font=f, fill=(29, 74, 56, 255), anchor="mm")
        chip(d, W*0.085, H*0.775, "ONE CHARACTER PER ROW — EVERY 12 SECONDS", (90, 82, 64, 255))
        channel_mark(d); recon(d)
    elif sc == "SC08":
        paste_scan(im, SCAN_PAGE, W*0.40, H*0.09, H*0.82)
        d.text((W*0.045, H*0.22), "THE RUN OF", font=font(FB, 62), fill=INKP, anchor="lm")
        d.text((W*0.045, H*0.30), "AUGUST 15, 1977", font=font(FB, 62), fill=INKP, anchor="lm")
        d.text((W*0.155, H*0.425), "11:16 P.M.", font=font(FB, 76), fill=REDD, anchor="mm")
        d.text((W*0.045, H*0.53), "Two feed horns alternate rows", font=fc40, fill=INKP3, anchor="lm")
        d.text((W*0.045, H*0.585), "A/B/A/B — 50 channels of sky", font=fc40, fill=(90, 82, 64, 255), anchor="lm")
        channel_mark(d); recon(d, "ARCHIVAL PRINTOUT — WIKIMEDIA COMMONS (PD)")
    elif sc == "SC09":
        x0 = W/2 - H*0.86*1024/578/2
        wsc = paste_scan(im, SCAN_CLOSE, x0, H*0.10, H*0.86)
        rows = [("6", 6), ("E", 14), ("Q", 24), ("U", 30), ("J", 17), ("5", 5)]
        rh = (H*0.86)/6
        for i, (ch, v) in enumerate(rows):
            y0 = H*0.10 + i*rh
            d.rectangle([x0+6, y0+4, x0+wsc-6, y0+rh-4], fill=(75, 225, 160, 76))
            d.rectangle([x0+40, y0+rh-26, x0+40 + (v/32)*wsc*0.5, y0+rh-14], fill=(40, 60, 90, 190))
            d.text((x0+wsc-190, y0+rh/2), ch, font=font(FMb, 64), fill=(13, 92, 63, 255) if i == 3 else (29, 36, 48, 255), anchor="mm")
        channel_mark(d); recon(d, "CHANNEL 2 — SIX ROWS · SCAN — WIKIMEDIA COMMONS (PD)")
    elif sc == "SC10":
        text_tracked(d, W/2, 100, "WHAT 'U' MEANS", font(FB, 72), INKP, 4)
        sx, sy, shh = W*0.16, H*0.22, H*0.62
        d.rectangle([sx, sy, sx+26, sy+shh], fill=(70, 64, 48, 60))
        d.rectangle([sx, sy + shh*(1-30/35), sx+26, sy+shh], fill=(70, 64, 48, 220))
        for i in range(0, 36, 5):
            yy = sy + shh - shh*i/35
            d.line([(sx-18, yy), (sx+18, yy)], fill=(70, 64, 48, 200), width=3)
            d.text((sx-34, yy), str(i), font=fc36, fill=INKP2, anchor="rm")
        za, zb = sy + shh - shh*30/35, sy + shh - shh*10/35
        d.rectangle([sx+22, za, sx+22+sx*0.9, zb], fill=(75, 225, 160, 40), outline=SIGNAL, width=4)
        d.text((sx+68, za+52), "LETTER ZONE — 10σ TO 30σ", font=fc38, fill=GRN, anchor="lm")
        hand_ellipse(d, sx+46, za, 56, 34, PENRED, 10, 21)
        d.text((sx+46, za), "U", font=font(FB, 64), fill=PENRED, anchor="mm")
        pcard(d, W*0.55, H*0.26, W*0.34, H*0.40)
        d.text((W*0.72, H*0.335), "PEAK: 30σ ± 0.5σ", font=fc40, fill=INKP3, anchor="mm")
        for i, ln in enumerate(["Most background is the", "receiver's own hiss — the", "galaxy and the afterglow", "of the Big Bang."]):
            d.text((W*0.72, H*0.42 + i*44), ln, font=fc36, fill=INKP2, anchor="mm")
        channel_mark(d); recon(d)
    elif sc == "SC11":
        text_tracked(d, W/2, 140, "THE SHAPE OF A REAL TRANSIT", font(FB, 72), INK, 2)
        pts = [(W*0.10 + i/120*W*0.80, H*0.70 - math.exp(-(((i/120)-0.5)/0.235)**2/2)*H*0.34) for i in range(121)]
        d.line(pts, fill=SIGNAL, width=8, joint="curve")
        d.line([(W*0.10 + W*0.80*0.265, H*0.70 - H*0.34*0.5), (W*0.10 + W*0.80*0.735, H*0.70 - H*0.34*0.5)],
               fill=(224, 179, 76, 200), width=4)
        d.text((W/2, H*0.70 - H*0.34*0.5 - 30), "FULL WIDTH ≈ 37 s", font=fc38, fill=WARN, anchor="mm")
        for i, s in enumerate(["FULL WINDOW: 72 s", "RISE 36 s → PEAK → FALL", "NOT A SQUARE PULSE"]):
            chip(d, W*(0.115 + i*0.30), H*0.775, s, DIM)
        channel_mark(d); recon(d)
    elif sc == "SC12":
        text_tracked(d, W/2, 145, "ONE HORN ONLY", font(FB, 80), INK, 8)
        for cx, live in [(W*0.30, True), (W*0.70, False)]:
            top, bot, hw = H*0.26, H*0.70, W*0.14
            col = (75, 225, 160, 140) if live else (88, 199, 240, 60)
            d.polygon([(cx-hw*0.22, top), (cx+hw*0.22, top), (cx+hw, bot), (cx-hw, bot)], fill=col)
            d.line([(cx-hw*0.22, top+17), (cx+hw*0.22, top+17)], fill=(75, 225, 160, 220) if live else (88, 199, 240, 120), width=34)
        d.text((W*0.30, H*0.725), "HORN A — SIGNAL", font=fc40, fill=SIGNAL, anchor="mm")
        d.text((W*0.70, H*0.725), "HORN B — EMPTY · NOTHING CAME BACK", font=fc40, fill=DIM, anchor="mm")
        text_tracked(d, W/2, 842, "+5 MINUTES — SAME PATCH OF SKY: NOTHING", font(FB, 48), WARN, 2)
        channel_mark(d); recon(d)
    elif sc == "SC13":
        text_tracked(d, W/2, 155, "JERRY R. EHMAN", font(FB, 82), INKP, 6)
        d.text((W/2, 235), "Radio astronomer · Ohio State University", font=fc40, fill=(90, 82, 64, 255), anchor="mm")
        for i in range(5):
            x, y = W*0.30 - 40 + i*10, H*0.38 + i*12
            d.rectangle([x, y, x + W*0.22, y + H*0.26], fill=(233, 224, 200, 255), outline=(120, 105, 70, 140), width=3)
            for r in range(7):
                d.rectangle([x + W*0.02, y + H*0.03 + r*H*0.033, x + W*0.16, y + H*0.03 + r*H*0.033 + 6], fill=(46, 42, 34, 120))
        rows = ["ROW 41 — SCAN", "ROW 42 — SCAN", "ROW 43 — 6EQUJ5", "ROW 44 — SCAN", "ROW 45 — SCAN"]
        for r, s in enumerate(rows):
            y0 = H*0.36 + r*58
            d.rectangle([W*0.52, y0, W*0.86, y0+50], fill=(75, 225, 160, 76) if r == 2 else (60, 54, 40, 26),
                        outline=(90, 80, 55, 115), width=2)
            d.text((W*0.52+20, y0+25), s, font=font(FM, 32), fill=INKP3, anchor="lm")
        d.text((W*0.52, H*0.36+5*58+46), "EVERY FEW DAYS — REVIEW PAGE BY PAGE", font=fc36, fill=(90, 82, 64, 255), anchor="lm")
        channel_mark(d); recon(d)
    elif sc == "SC14":
        x0 = W*0.035
        wsc = paste_scan(im, SCAN_CLOSE, x0, H*0.075, H*0.85)
        cx, cy = x0 + wsc*0.52, H*0.075 + H*0.85*0.42
        hand_ellipse(d, cx, cy, wsc*0.13, H*0.85*0.24, PENRED, 14, 33)
        d.text((x0 + wsc - 150, H*0.30), "Wow!", font=font(FB, 110), fill=PENRED, anchor="lm")
        chip(d, x0 + wsc - 150, H*0.42, "AUGUST 19, 1977", DIM)
        channel_mark(d); recon(d, "THE PRINTOUT — WIKIMEDIA COMMONS (PD)")
    elif sc == "SC15":
        text_tracked(d, W/2, 100, "HE CHECKED THE REST FIRST", font(FB, 72), INKP, 2)
        d.text((W/2, 172), "Did the annotation appear again on later rows? No.", font=fc40, fill=(90, 82, 64, 255), anchor="mm")
        bx, by, bw, bh = W*0.20, H*0.24, W*0.60, H*0.48
        d.rectangle([bx, by, bx+bw, by+bh], fill=(233, 224, 200, 255), outline=(120, 105, 70, 140), width=3)
        f = font(FM, 34)
        rowsL = ["1 1 1 2 3 1 1 1 1 1 1", "1 2 1 1 1 1 1 1 1 1 1", "1 1 1 1 2 1 1 1 1 1 1", "1 1 1 1 1 1 1 1 1 1 1"]
        for r in range(8):
            d.text((bx+30, by+40+r*72), rowsL[r % 4], font=f, fill=(46, 42, 34, 140), anchor="lm")
        chip(d, W*0.14, H*0.775, "NOT REPEATED ON ANY LATER ROW", REDD)
        chip(d, W*0.50, H*0.775, "THE CIRCLE STANDS ALONE", INKP2)
        channel_mark(d); recon(d)
    elif sc == "SC16":
        text_tracked(d, W/2, 95, "WHERE THE SKY WAS", font(FB, 72), INK, 4)
        d.rectangle([W*0.055, H*0.24, W*0.055+760, H*0.24+220], fill=(5, 10, 22, 170), outline=(88, 199, 240, 100), width=3)
        for i, ln in enumerate(["R.A.  19h 22m 25s ± 10s", "DEC.  −27° 03′ ± 20′", "EPOCH 1950.0"]):
            d.text((W*0.055+32, H*0.24+52+i*66), ln, font=font(FM, 44), fill=CYAN, anchor="lm")
        pts = [(W*0.60-0.32*H*0.34, H*0.52+0.08*H*0.34), (W*0.60+0.28*H*0.34, H*0.52+0.10*H*0.34),
               (W*0.60-0.02*H*0.34, H*0.52+0.02*H*0.34)]
        for a, b in [(0, 1), (1, 2)]:
            d.line([pts[a], pts[b]], fill=(88, 199, 240, 140), width=3)
        for p in pts:
            d.ellipse([p[0]-5, p[1]-5, p[0]+5, p[1]+5], fill=(255, 255, 255, 255))
        mp = pts[2]
        hand_ellipse(d, mp[0], mp[1], 30, 22, SIGNAL, 6, 41)
        d.text((mp[0]+52, mp[1]-14), "WOW! SOURCE", font=fc40, fill=SIGNAL, anchor="lm")
        d.text((W*0.055, H*0.62), "TOWARD THE CENTER OF THE MILKY WAY · SAGITTARIUS", font=fc38, fill=DIM, anchor="lm")
        channel_mark(d); recon(d)
    elif sc == "SC17":
        text_tracked(d, W/2, 100, "1959 — A NATURAL MEETING FREQUENCY", font(FB, 68), INKP, 2)
        d.text((W/2, 178), "Giuseppe Cocconi · Philip Morrison — where would civilization listen?", font=fc40, fill=(90, 82, 64, 255), anchor="mm")
        cx, cy = W*0.5, H*0.44
        d.ellipse([cx-150, cy-62, cx+150, cy+62], outline=INKP3, width=4)
        d.ellipse([cx-16, cy-16, cx+16, cy+16], fill=INKP3)
        d.ellipse([cx+150-11, cy-11, cx+150+11, cy+11], fill=(90, 82, 64, 255))
        d.arc([cx+6, cy-64, cx+74, cy+4], start=-30, end=140, fill=PENRED, width=8)
        d.text((cx, H*0.735), "1420 MEGAHERTZ", font=font(FB, 104), fill=GRN, anchor="mm")
        d.text((W/2, H*0.80), "THE WATERING HOLE — THE 21-CENTIMETER LINE OF HYDROGEN", font=fc40, fill=INKP2, anchor="mm")
        channel_mark(d); recon(d)
    elif sc == "SC18":
        text_tracked(d, W/2, 105, "ALMOST — BUT NOT EXACTLY — THE HYDROGEN LINE", font(FB, 58), INKP, 1)
        bx, by, bw, bh = W*0.10, H*0.44, W*0.80, 34
        d.rectangle([bx, by, bx+bw, by+bh], fill=(60, 54, 40, 30), outline=(70, 64, 48, 150), width=3)
        for frac, freq, tag, col in [(0.08, "1420.4058", "HYDROGEN LINE", GRN), (0.68, "1420.4556", "WOW! SIGNAL", REDD)]:
            mx = bx + bw*frac
            d.line([(mx, by-70), (mx, by+bh+12)], fill=col, width=8)
            d.text((mx, by-92), freq, font=font(FM, 44), fill=col, anchor="mm")
            d.text((mx, by+bh+56), tag, font=fc36, fill=col, anchor="mm")
        y0 = by+bh+96
        d.line([(bx+bw*0.08, y0), (bx+bw*0.08, y0+26), (bx+bw*0.68, y0+26), (bx+bw*0.68, y0)], fill=(90, 82, 64, 255), width=4)
        d.text((W/2, y0+82), "≈ 50 KILOHERTZ  →  ≈ 10 KM/S TOWARD EARTH", font=fc40, fill=INKP3, anchor="mm")
        channel_mark(d); recon(d)
    elif sc == "SC19":
        text_tracked(d, W/2, 105, "EVEN THE NUMBER HAS A STORY", font(FB, 72), INKP, 2)
        d.text((W/2, 180), "The local oscillator was delivered 100 kHz off", font=fc40, fill=(90, 82, 64, 255), anchor="mm")
        rows = [("LOCAL OSCILLATOR — ORDERED", "1450.4056 MHz", False), ("LOCAL OSCILLATOR — DELIVERED", "1450.5056 MHz", True),
                ("EHMAN'S 1979 CALCULATION", "CORRECTED", False), ("KRAUS'S 1995 SUMMARY FOR SAGAN", "UNCORRECTED", True)]
        bx, bw = W*0.14, W*0.72
        for i, (k, v, strike) in enumerate(rows):
            y0 = H*0.28 + i*74
            d.rectangle([bx, y0, bx+bw, y0+66], fill=(60, 54, 40, 22 if i % 2 else 36))
            d.text((bx+28, y0+33), k, font=fc36, fill=INKP3, anchor="lm")
            col = REDD if strike else GRN
            vf = font(FM, 40)
            vw = tw(d, v, vf)
            d.text((bx+bw-28, y0+33), v, font=vf, fill=col, anchor="rm")
            if strike:
                hand_line(d, [(bx+bw-28-vw, y0+36), (bx+bw-28, y0+30)], PENRED, 6, 70+i)
        text_tracked(d, W/2, 837, "TWO VALUES IN THE LITERATURE — ONE KNOB", font(FCB, 40), INKP2, 4)
        channel_mark(d); recon(d)
    elif sc == "SC20":
        text_tracked(d, W/2, 105, "NARROWNESS IS WHAT TECHNOLOGY DOES", font(FB, 62), INKP, 2)
        d.text((W*0.10, H*0.30), "NATURAL RADIO SOURCES — BROADBAND (PULSARS · QUASARS · GALAXIES)", font=fc38, fill=INKP3, anchor="lm")
        d.rectangle([W*0.10, H*0.34, W*0.90, H*0.34+56], fill=(60, 54, 40, 80))
        d.text((W*0.10, H*0.50), "THE WOW! SIGNAL — ONE 10-KILOHERTZ CHANNEL", font=fc38, fill=GRN, anchor="lm")
        d.rectangle([W*0.496, H*0.54, W*0.504+18, H*0.54+56], fill=(29, 92, 68, 160))
        text_tracked(d, W/2, 842, "AND YET — NOTHING TECHNOLOGICAL WAS THERE TO DO IT", font(FCB, 44), INKP3, 2)
        channel_mark(d); recon(d)
    elif sc == "SC21":
        text_tracked(d, W/2, 135, "THE FIRST FOLLOW-UP: LOOK AGAIN", font(FB, 72), INK, 2)
        for i in range(3):
            cx = W*(0.22 + i*0.28); cy = H*0.44
            d.rectangle([cx-W*0.12, cy-H*0.18, cx+W*0.12, cy+H*0.18], fill=(10, 18, 38, 180), outline=(88, 199, 240, 100), width=3)
            for r in range(6):
                d.rectangle([cx-W*0.12+18, cy-H*0.18+20+r*H*0.05, cx+W*0.12-18, cy-H*0.18+28+r*H*0.05], fill=(88, 199, 240, 26))
            d.text((cx, cy), "NULL", font=font(FB, 40), fill=WARN, anchor="mm")
            d.text((cx, cy+H*0.18+40), f"SWEEP {i+1}", font=fc36, fill=DIM, anchor="mm")
        text_tracked(d, W/2, 794, "BIG EAR COULD NEVER BE REPOINTED", font(FB, 52), INK, 4)
        text_tracked(d, W/2, 858, "THE SKY ONLY PASSES — ONCE PER DAY, UNDER THE SAME BEAM", font(FC, 38), DIM, 4)
        channel_mark(d); recon(d)
    elif sc == "SC22":
        text_tracked(d, W/2, 145, "DECADES OF BETTER INSTRUMENTS", font(FB, 72), INK, 2)
        d.text((W/2, 220), "Every instrument that could hear it — heard nothing", font=fc40, fill=DIM, anchor="mm")
        rows = [("1987 - 1989", "META ARRAY — OAK RIDGE (GRAY)"), ("1995", "GREEN BANK 35-m SNIFTING SCAN (SHOSTAK)"),
                ("1995 - 1996", "VERY LARGE ARRAY (GRAY)"), ("1999", "MOUNT PLEASANT 26-m, TASMANIA")]
        for i, (yr, what) in enumerate(rows):
            yy = H*0.30 + i*82 + 36
            d.text((W*0.10, yy), yr, font=font(FM, 44), fill=CYAN, anchor="lm")
            d.text((W*0.10+260, yy), what, font=fc36, fill=INK, anchor="lm")
            st = font(FB, 42)
            sw = tw(d, "NULL", st)
            d.rectangle([W*0.90-sw-48, yy-32, W*0.90, yy+32], outline=(192, 57, 43, 230), width=5)
            d.text((W*0.90-sw/2-24, yy), "NULL", font=st, fill=(192, 57, 43, 240), anchor="mm")
        text_tracked(d, W/2, 864, "SILENCE, EVERY TIME", font(FC, 48), DIM, 12)
        channel_mark(d)
    elif sc == "SC23":
        text_tracked(d, W/2, 162, "THE SEARCHES CONTINUE", font(FB, 72), INK, 4)
        for i, (yr, org, what) in enumerate([("2022", "BREAKTHROUGH LISTEN", "GREEN BANK + ALLEN ARRAYS"),
                                             ("2025", "SETI INSTITUTE", "COORDINATED SEARCH ACROSS ARCHIVES")]):
            cx = W*(0.27 + i*0.46); cy = H*0.42
            d.rectangle([cx-W*0.19, cy-H*0.13, cx+W*0.19, cy+H*0.13], fill=(10, 18, 38, 190), outline=(88, 199, 240, 115), width=3)
            d.text((cx, cy-56), yr, font=font(FM, 72), fill=CYAN, anchor="mm")
            d.text((cx, cy+8), org, font=fc40, fill=INK, anchor="mm")
            d.text((cx, cy+56), what, font=font(FC, 34), fill=DIM, anchor="mm")
            d.text((cx, cy+H*0.13-26), "NULL", font=font(FB, 40), fill=(192, 57, 43, 240), anchor="mm")
        d.text((W/2, H*0.665), "0", font=font(FB, 150), fill=SIGNAL, anchor="mm")
        text_tracked(d, W/2, 826, "REPEATS IN FORTY-NINE YEARS", font(FC, 48), INK, 10)
        channel_mark(d)
    elif sc == "SC24":
        text_tracked(d, W/2, 105, "THE ORIGINAL TEAM RULED OUT THE OBVIOUS", font(FB, 58), INKP, 1)
        chips = ["PLANETS", "ASTEROIDS", "SATELLITES", "AIRCRAFT", "SPACECRAFT"]
        for i, c in enumerate(chips):
            col = i % 3; row = i // 3
            cx = W*(0.165 + col*0.34); cy = H*(0.30 + row*0.24)
            f = font(FCB, 44); w = tw(d, c, f) + 72
            d.rectangle([cx-w/2, cy-44, cx+w/2, cy+44], fill=(240, 232, 208, 255), outline=(70, 64, 48, 150), width=3)
            d.text((cx, cy), c, font=f, fill=INKP3, anchor="mm")
            hand_line(d, [(cx-w/2+16, cy+30), (cx+w/2-20, cy-30)], PENRED, 9, 80+i)
        d.ellipse([W*0.14, H*0.66, W*0.14+52, H*0.66+52], outline=INKP3, width=4)
        d.line([(W*0.14+52, H*0.66+44), (W*0.14+156, H*0.66-12)], fill=INKP3, width=4)
        d.line([(W*0.14+156, H*0.66-12), (W*0.14+86, H*0.66-58)], fill=INKP3, width=4)
        d.text((W*0.40, H*0.66-40), "A TERRESTRIAL SIGNAL OFF SPACE DEBRIS —", font=fc36, fill=INKP2, anchor="lm")
        d.text((W*0.40, H*0.66-2), "WRONG TRANSMITTER, WRONG GEOMETRY", font=fc36, fill=INKP2, anchor="lm")
        d.text((W*0.40, H*0.66+42), "IMPROBABLE IN PRACTICE", font=fc40, fill=REDD, anchor="lm")
        channel_mark(d); recon(d)
    elif sc == "SC25":
        text_tracked(d, W/2, 105, "TWO IDEAS SURVIVE AS POSSIBILITIES", font(FB, 62), INKP, 2)
        cx, cy = W*0.28, H*0.42
        d.ellipse([cx-202, cy-12, cx-178, cy+12], fill=(90, 82, 64, 255))
        d.ellipse([cx-22, cy-22, cx+22, cy+22], fill=(42, 38, 32, 255))
        d.line([(cx-178, cy-6), (cx+180, cy-26)], fill=(29, 92, 68, 200), width=5)
        d.line([(cx-178, cy+6), (cx+180, cy+26)], fill=(29, 92, 68, 200), width=5)
        d.text((cx, H*0.56), "GRAVITATIONAL LENSING", font=fc40, fill=INKP3, anchor="mm")
        d.text((cx, H*0.615), "an unseen mass briefly focuses", font=fc36, fill=INKP2, anchor="mm")
        d.text((cx, H*0.66), "a fainter background source", font=fc36, fill=INKP2, anchor="mm")
        cx2 = W*0.72
        d.line([(cx2-200, H*0.44), (cx2+120, H*0.44)], fill=INKP3, width=4)
        for i in range(5):
            d.ellipse([cx2-150+i*70-20, H*0.36-20, cx2-150+i*70+20, H*0.36+20], outline=(88, 199, 240, 140), width=3)
        d.ellipse([cx2+134, H*0.30, cx2+158, H*0.30+24], fill=SIGNAL)
        d.text((cx2, H*0.56), "INTERSTELLAR SCINTILLATION", font=fc40, fill=INKP3, anchor="mm")
        d.text((cx2, H*0.615), "the interstellar medium twinkles", font=fc36, fill=INKP2, anchor="mm")
        d.text((cx2, H*0.66), "— the triangle of 3 NVSS sources", font=fc36, fill=INKP2, anchor="mm")
        chip(d, W*0.235, H*0.775, "BOTH SAY: SHOULD HAVE LASTED LONGER — OR RETURNED", REDD)
        channel_mark(d); recon(d)
    elif sc == "SC26":
        text_tracked(d, W/2, 100, "2017 — THE COMET HYPOTHESIS", font(FB, 72), INKP, 4)
        d.text((W/2, 178), "Hydrogen clouds around two comets (266P / P/2008 Y2)", font=fc40, fill=(90, 82, 64, 255), anchor="mm")
        cx, cy = W*0.24, H*0.44
        d.ellipse([cx-26, cy-26, cx+26, cy+26], fill=(90, 82, 64, 255))
        d.polygon([(cx-10, cy-22), (cx+270, cy-100), (cx+250, cy-40)], fill=(88, 199, 240, 90))
        d.polygon([(cx-6, cy+20), (cx+240, cy+90), (cx+210, cy+40)], fill=(88, 199, 240, 78))
        d.text((cx-40, cy+90), "266P — NEOWISE", font=fc36, fill=INKP2, anchor="lm")
        d.text((cx+60, cy-110), "P/2008 Y2 — GIBBS", font=fc36, fill=INKP2, anchor="lm")
        strikes = ["NOT IN THE BEAM AT THE RIGHT TIME", "COMETS RARELY EMIT AT THE RIGHT FREQUENCY", "ONE HORN ONLY — WOULD SHOW IN BOTH"]
        for i, s in enumerate(strikes):
            bx2, by2 = W*0.44, H*(0.30 + i*0.13)
            d.rectangle([bx2, by2-30, bx2+W*0.46, by2+30], fill=(60, 54, 40, 36))
            d.text((bx2+22, by2), s[:46], font=fc38, fill=INKP3, anchor="lm")
            hand_line(d, [(bx2+8, by2+2), (bx2+W*0.46-30, by2-6)], PENRED, 7, 86+i)
        d.text((W*0.44, H*0.775), "DISMISSED BY THE ORIGINAL OBSERVERS", font=fc40, fill=REDD, anchor="lm")
        channel_mark(d); recon(d)
    elif sc == "SC27":
        text_tracked(d, W/2, 100, "2024 — THE NEWEST HYPOTHESIS", font(FB, 72), INKP, 4)
        d.text((W/2, 178), "Arecibo archive re-examination — a hydrogen cloud and a magnetar flare", font=font(FC, 38), fill=(90, 82, 64, 255), anchor="mm")
        cx, cy = W*0.24, H*0.50
        rnd = random.Random(97)
        for _ in range(40):
            ang = rnd.uniform(0, math.tau); rr = rnd.uniform(0, 90)
            d.ellipse([cx+math.cos(ang)*rr*1.4-4, cy+math.sin(ang)*rr*0.7-4, cx+math.cos(ang)*rr*1.4+4, cy+math.sin(ang)*rr*0.7+4],
                      fill=(88, 199, 240, 130))
        d.text((cx, cy+110), "COLD HYDROGEN CLOUD", font=fc38, fill=GRN, anchor="mm")
        d.line([(cx+240, cy-120), (cx+370, cy-40)], fill=PENRED, width=8)
        d.polygon([(cx+378, cy-34), (cx+338, cy-52), (cx+356, cy-14)], fill=PENRED)
        d.text((cx+310, cy-160), "MAGNETAR FLARE", font=fc36, fill=REDD, anchor="mm")
        d.line([(cx+378, cy-30), (cx+628, cy+60)], fill=SIGNAL, width=6)
        d.text((cx+558, cy+120), "MASER BURST AT 1420 MHz", font=fc40, fill=GRN, anchor="mm")
        chip(d, W*0.60, H*0.24, "PROPOSED — NOT PROVEN", WARN, 44)
        d.text((W*0.62, H*0.775), "MODEL EVENTS ~100× WEAKER THAN WOW!", font=font(FCB, 42), fill=INKP3, anchor="mm")
        channel_mark(d); recon(d)
    elif sc == "SC28":
        text_tracked(d, W/2, 88, "WHERE THE EVIDENCE STANDS", font(FB, 72), INKP, 2)
        chip(d, W*0.13, H*0.155, "ESTABLISHED", GRN, 44)
        facts = ["A STRONG, NARROWBAND RADIO BURST", "ON THE SKY FOR 72 SECONDS", "ON ONE OF THE 50 CHANNELS",
                 "NEVER DETECTED AGAIN — DESPITE 5 DECADES OF BETTER INSTRUMENTS", "THE FACT THAT IT SITS ON ONE SHEET OF LINE-PRINTER PAPER"]
        for i, s in enumerate(facts):
            y0 = H*0.24 + i*84
            d.rectangle([W*0.13, y0, W*0.87, y0+74], fill=(60, 54, 40, 30), outline=(29, 92, 68, 130), width=3)
            d.text((W*0.13+30, y0+37), s, font=font(FCB, 40), fill=(38, 51, 43, 255), anchor="lm")
            d.line([(W*0.87-66, y0+38), (W*0.87-52, y0+52), (W*0.87-30, y0+24)], fill=GRN, width=7)
        channel_mark(d); recon(d)
    elif sc == "SC29":
        text_tracked(d, W/2, 88, "WHAT IS NOT ESTABLISHED", font(FB, 72), INKP, 2)
        chip(d, W*0.13, H*0.155, "NOT ESTABLISHED", REDD, 44)
        items = [("WHO — OR WHAT — SENT IT", "NO EVIDENCE EITHER WAY"),
                 ("THAT IT WAS AN EXTRATERRESTRIAL TRANSMISSION", "CANNOT BE RULED OUT — CANNOT BE CLAIMED"),
                 ("ANY PROVEN NATURAL PHENOMENON", "ALL EXPLANATIONS REMAIN HYPOTHESES")]
        for i, (k, sub) in enumerate(items):
            y0 = H*0.26 + i*108
            d.rectangle([W*0.13, y0, W*0.87, y0+96], fill=(60, 54, 40, 30), outline=(138, 47, 34, 140), width=3)
            d.text((W*0.13+30, y0+34), k, font=font(FCB, 40), fill=INKP3, anchor="lm")
            d.text((W*0.13+30, y0+74), sub, font=font(FC, 34), fill=REDD, anchor="lm")
        text_tracked(d, W/2, 837, "REPLICATION IS THE CURRENCY — NOTHING HAS REPLICATED", font(FCB, 42), INKP2, 4)
        channel_mark(d); recon(d)
    elif sc == "SC30":
        d.text((W*0.10, H*0.24), "\u201C", font=font(FB, 130), fill=(138, 47, 34, 140), anchor="lm")
        d.text((W*0.17, H*0.30), "THE ORIGIN OF THE WOW! SIGNAL", font=font(FB, 66), fill=INKP, anchor="lm")
        d.text((W*0.17, H*0.40), "IS STILL AN OPEN QUESTION FOR ME.", font=font(FB, 66), fill=INKP, anchor="lm")
        d.text((W*0.17, H*0.56), "…HALF-VAST DATA.", font=font(FB, 60), fill=(46, 42, 34, 190), anchor="lm")
        hand_line(d, [(W*0.17, H*0.63), (W*0.46, H*0.625)], PENRED, 5, 111)
        d.text((W*0.17, H*0.70), "JERRY R. EHMAN — BIGEAR.ORG", font=fc40, fill=(90, 82, 64, 255), anchor="lm")
        channel_mark(d); recon(d)
    elif sc == "SC31":
        text_tracked(d, W/2, 105, "1998 — THE TELESCOPE CAME DOWN", font(FB, 72), INK, 2)
        text_tracked(d, W/2, 815, "THE LAND WAS SOLD — A GOLF COURSE AND 400 HOUSES", font(FCB, 42), DIM, 2)
        text_tracked(d, W/2, 882, "WHAT SURVIVES IS PAPER.", font(FC, 52), INK, 8)
        channel_mark(d); recon(d)
    elif sc == "SC32":
        text_tracked(d, W/2, 145, "LISTENING FOR ANOTHER WOW!", font(FB, 72), INK, 4)
        chip(d, W*0.28, H*0.175, "NEW INSTRUMENTS · NEW SURVEYS · WIDER BANDS", SIGNAL)
        for i, fx in enumerate([0.16, 0.5, 0.84]):
            cx = W*fx; cy = H*0.80
            d.polygon([(cx-26, cy), (cx+26, cy), (cx+W*0.10, H*0.30), (cx-W*0.10, H*0.30)], fill=(75, 225, 160, 60))
        channel_mark(d); recon(d)
    elif sc == "SC33":
        mx, my = W*0.62, H*0.44
        hand_ellipse(d, mx, my, 34, 24, SIGNAL, 5, 131)
        hand_ellipse(d, mx, my, 62, 46, (75, 225, 160, 120), 3, 133)
        text_tracked(d, W/2, H*0.635, "IF IT WAS A BEACON, IT SPOKE ONCE.", font(FB, 64), INK, 6)
        text_tracked(d, W/2, H*0.725, "IF IT WAS NATURE, WE HAVE NOT CAUGHT IT AGAIN.", font(FB, 56), SIGNAL, 6)
        channel_mark(d)
    elif sc == "SC34":
        d.rectangle([W/2-220, H*0.30, W/2+220, H*0.30+10], fill=CRIMSON)
        text_tracked(d, W/2, H*0.40, "THE UNCLOSED FILE", font(FB, 132), INK, 18)
        text_tracked(d, W/2, H*0.505, "THE WOW! SIGNAL — 72 SECONDS FROM DEEP SPACE", font(FC, 44), DIM, 8)
        creds = ["RESEARCH: BIGEAR.ORG · THE SETI INSTITUTE · PUBLISHED LITERATURE",
                 "NARRATION: SYNTHETIC VOICE (MICROSOFT EDGE-TTS NEURAL)",
                 "VISUALS: CODE-GENERATED + PUBLIC-DOMAIN ARCHIVAL (WIKIMEDIA COMMONS)"]
        for i, c in enumerate(creds):
            d.text((W/2, H*0.62 + i*52), c, font=font(FC, 36), fill=(157, 176, 200, 215), anchor="mm")
        text_tracked(d, W/2, H*0.775, "SOME FILES NEVER CLOSE.", font(FB, 64), CRIMSON, 14)
    return im

def caption_strip(text):
    lines = text.split("\n")
    size = 44; lh = int(size*1.32)
    f = font(FC, size)
    tmp = Image.new("RGBA", (10, 10)); dt = ImageDraw.Draw(tmp)
    widest = max(dt.textbbox((0, 0), l, font=f)[2] for l in lines)
    boxW = min(int(W*0.92), widest + 96); boxH = len(lines)*lh + 52
    im = Image.new("RGBA", (boxW, boxH), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, boxW-1, boxH-1], fill=(4, 7, 15, 190), outline=(88, 199, 240, 60), width=2)
    for i, l in enumerate(lines):
        d.text((boxW/2, 26 + lh*(i+0.5)), l, font=f, fill=INK, anchor="mm")
    return im

def main():
    out = os.path.join(HERE, "build")
    os.makedirs(out, exist_ok=True)
    tl = json.load(open(os.path.join(FILM, "TIMELINE.json")))
    for sc, opt in SKY_SCENES.items():
        sky_bg(opt.get("emptier", 0.0), opt.get("bigear", False)).save(f"{out}/bg_{sc}.png")
        print("bg", sc, flush=True)
    for sc, rows in PAPER_SCENES.items():
        paper_bg(rows=rows).save(f"{out}/bg_{sc}.png")
        print("bg", sc, flush=True)
    for sc in sorted(tl["scenes"]):
        gen_fg(sc).save(f"{out}/fg_{sc}.png")
        print("fg", sc, flush=True)
    srt = open(os.path.join(FILM, "shared/subtitles/wow-signal.srt")).read().strip().split("\n\n")
    capdir = os.path.join(out, "caps"); os.makedirs(capdir, exist_ok=True)
    n = 0
    for chunk in srt:
        lines = chunk.split("\n")
        if len(lines) < 2: continue
        text = "\n".join(lines[2:])
        n += 1
        caption_strip(text).save(f"{capdir}/cap_{n:04d}.png")
    print("captions:", n)

if __name__ == "__main__":
    main()
