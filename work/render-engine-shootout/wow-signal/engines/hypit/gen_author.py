#!/usr/bin/env python3
"""gen_author.py — emit authors/main.svml for Engine C (Hypit) from the frozen package.

Built-in primitives only (no custom component package — documented limitation):
  34 scene windows × archival-motif image clips (2 PD scans, varied frames/pan/poses)
  + full 34-block narration on audio:Track at the frozen placements.
"""
import json

import sys
PILOT = "--pilot" in sys.argv
tl = json.load(open("../../TIMELINE.json"))
blocks, scenes = tl["blocks"], tl["scenes"]
order = sorted(blocks)
if PILOT:  # 60 s pilot: first 3 scenes + first block only
    LIMIT = 60.0
    scenes = {k: v for k, v in scenes.items() if v["end"] <= LIMIT}
    blocks = {k: v for k, v in blocks.items() if v["start"] + v["dur"] <= LIMIT}
    order = [b for b in order if b in blocks]

# frame variants (fractions of canvas; l/t/r/b within bounds)
FRAMES = {
    "full":  ("0%", "0%", "100%", "100%"),
    "colL":  ("2%", "4%", "30%", "88%"),
    "colR":  ("40%", "10%", "96%", "80%"),
    "row":   ("4%", "40%", "70%", "62%"),
    "hdr":   ("8%", "4%", "92%", "26%"),
    "mid":   ("22%", "26%", "78%", "74%"),
}
# per-scene: (image, frame, pan x0->x1, pan y0->y1)
PLAN = {
 "SC01": ("close", "full", 1.00, 1.06, 0), "SC02": ("close", "colL", 1.06, 1.00, 0), "SC03": ("page", "mid", 1.00, 1.05, -30),
 "SC04": ("page", "hdr", 1.05, 1.00, 30), "SC05": ("page", "row", 1.00, 1.06, -30), "SC06": ("page", "colR", 1.00, 1.05, 0),
 "SC07": ("page", "colL", 1.06, 1.00, 30), "SC08": ("page", "full", 1.00, 1.06, 0), "SC09": ("close", "colL", 1.00, 1.05, 20),
 "SC10": ("close", "row", 1.05, 1.00, 0), "SC11": ("close", "full", 1.00, 1.06, -25), "SC12": ("page", "row", 1.00, 1.05, 0),
 "SC13": ("close", "mid", 1.06, 1.00, -20), "SC14": ("close", "full", 1.00, 1.07, 25), "SC15": ("page", "full", 1.07, 1.00, 0),
 "SC16": ("page", "colR", 1.00, 1.05, 0), "SC17": ("page", "hdr", 1.05, 1.00, -25), "SC18": ("close", "colR", 1.00, 1.06, 20),
 "SC19": ("page", "mid", 1.06, 1.00, 0), "SC20": ("close", "row", 1.00, 1.05, -20), "SC21": ("page", "row", 1.05, 1.00, 20),
 "SC22": ("page", "colL", 1.00, 1.06, 0), "SC23": ("close", "full", 1.06, 1.00, -25), "SC24": ("page", "colL", 1.00, 1.05, 25),
 "SC25": ("close", "mid", 1.05, 1.00, 0), "SC26": ("page", "colR", 1.00, 1.06, -25), "SC27": ("close", "row", 1.06, 1.00, 0),
 "SC28": ("page", "mid", 1.00, 1.05, 20), "SC29": ("close", "full", 1.05, 1.00, 0), "SC30": ("page", "row", 1.00, 1.06, -20),
 "SC31": ("page", "hdr", 1.06, 1.00, 25), "SC32": ("close", "colL", 1.00, 1.05, -20), "SC33": ("close", "full", 1.00, 1.06, 0),
 "SC34": ("page", "full", 1.00, 1.04, 0),
}
DIM = {"close": (1024, 578), "page": (1024, 846)}

lines = []
A = lines.append
A('<?svml using="@hypit/markup@1"?>')
A("<svml>")
A('  <import as="time" from="@hypit/timeline-author@1"/>')
A('  <import as="media" from="@hypit/media@1"/>')
A('  <import as="mediaop" from="@hypit/media-operations@1"/>')
A('  <import as="visual" from="@hypit/visual-track@1"/>')
A('  <import as="audio" from="@hypit/audio-track@1"/>')
A('  <import as="space" from="@hypit/spatial@1"/>')
A('  <import as="film" from="@hypit/film@1"/>')
A('  <import as="html" from="@hypit/html-video@1"/>')
A('  <import as="recipes" source="../recipes/recipes.svs"/>')
A("")
A('  <space:Canvas id="screen" width="1920" height="1080"/>')
for name, (l, t, r, b) in FRAMES.items():
    A(f'  <space:Frame id="fr_{name}" within={{screen.bounds}} left="{l}" top="{t}" right="{r}" bottom="{b}"/>')
A('  <space:Extent id="ext_close" width="1024" height="578"/>')
A('  <space:Extent id="ext_page" width="1024" height="846"/>')
A("")
A('  <media:Image id="printout-close" src="../assets/printout_close.jpg"/>')
A('  <media:Image id="printout-page" src="../assets/printout_page.jpg"/>')
for bid in order:
    A(f'  <media:Audio id="ab{bid}" src="../assets/blocks/{bid}.wav"/>')
A("")
A('  <time:Clock id="clock" frame-rate="30"/>')
A('  <time:Timeline id="tl" clock={clock} end="' + ('1800f' if PILOT else '18000f') + '">')
FPS = 30
def fq(t):  # quantize to exact frame index
    return round(t * FPS)
for bid in order:
    b = blocks[bid]
    st, en = fq(b["start"]), fq(b["start"] + b["dur"])
    A(f'    <time:Window id="wb{bid}" from="{st}f" for="{en-st}f"/>')
for sc in sorted(scenes):
    w = scenes[sc]
    st, en = fq(w["start"]), fq(w["end"])
    A(f'    <time:Window id="ws{sc}" from="{st}f" for="{en-st}f"/>')
A("  </time:Timeline>")
A("")
for bid in order:
    A(f'  <mediaop:Normalize id="nb{bid}" source={{ab{bid}}} video="none" audio="default" '
      f'span-authority="audio" clock={{clock}}/>')
A("")

# motions (fade in/out + pan) — top-level Motion values
for sc in sorted(scenes):
    w = scenes[sc]
    img, fr, s0, s1, xp = PLAN[sc]
    dur = w["end"] - w["start"]
    fin = min(0.4, dur / 4)
    fout = dur - fin
    A(f'  <visual:Motion id="m{sc}">')
    A(f'    <visual:Pose at="start" scale="{s0:.2f}" x="0" opacity="0" easing="ease-out"/>')
    A(f'    <visual:Pose at="{int(fin*30)}f" scale="{s0:.2f}" x="0" opacity="1"/>')
    A(f'    <visual:Pose at="{int(fout*30)}f" scale="{s1:.2f}" x="{xp}" opacity="1"/>')
    A(f'    <visual:Pose at="end" scale="{s1:.2f}" x="{xp}" opacity="0"/>')
    A("  </visual:Motion>")
A("")
# visual:Track — 34 scene clips with fade poses + pan motion
A('  <visual:Track id="picture" timeline={tl.timeline}>')
for sc in sorted(scenes):
    w = scenes[sc]
    img, fr, s0, s1, xp = PLAN[sc]
    A(f'    <visual:Clip id="{sc}" image={{printout-{img}}} extent={{ext_{img}}} during={{tl.ws{sc}}} '
      f'frame={{fr_{fr}}} z="10" fit="cover" motion={{m{sc}}}/>')
A("  </visual:Track>")
A("")
A('  <audio:Track id="mix" timeline={tl.timeline}>')
for bid in order:
    A('    <audio:Clip id="ac' + bid + '" source={nb' + bid + '.media} during={tl.wb' + bid + '}/>')
A("  </audio:Track>")
A("")
A('  <film:Film id="main" canvas={screen.canvas} timeline={tl.timeline} appearance={recipes.film.film}>')
A('    <film:Track source={picture.visual}/>')
A('    <film:Track source={mix.audio}/>')
A("  </film:Film>")
A('  <html:Video id="final" composition={main.composition} timeline={tl.timeline}/>')
A("</svml>")
open("authors/pilot.svml" if PILOT else "authors/main.svml", "w").write("\n".join(lines) + "\n")
print(f"authors/main.svml written: {len(lines)} lines")
