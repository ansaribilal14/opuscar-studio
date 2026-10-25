#!/usr/bin/env python3
"""gen_author.py — v2 "PAPER & SKY" author for Engine C (Hypit) from the frozen package.

v2 (per docs/QA-V1-REJECTION.md): full-frame designed environments, hero content,
captions, titles, diagrams — via deterministic plates (plates/gen_plates.py, Pillow)
composited BY HYPIT with motion poses, plus the frozen narration at frozen windows.
Two layers per scene (bg environment + fg content) with parallax Ken Burns poses.
"""
import json
import os

PILOT = "--pilot" in os.environ.get("HYPIOPT", "")
tl = json.load(open("../../TIMELINE.json"))
blocks, scenes = tl["blocks"], tl["scenes"]
order = sorted(blocks)
if PILOT:
    LIMIT = 60.0
    scenes = {k: v for k, v in scenes.items() if v["end"] <= LIMIT}
    blocks = {k: b for k, b in blocks.items() if b["start"] + b["dur"] <= LIMIT}
    order = [b for b in order if b in blocks]
    # cap cues at 60s
    CUE_LIMIT = LIMIT
else:
    CUE_LIMIT = None

# count cues
srt = open("../../shared/subtitles/wow-signal.srt").read().strip().split("\n\n")
cues = []
for chunk in srt:
    lines = chunk.split("\n")
    if len(lines) < 2:
        continue
    m = lines[1]
    import re
    mm = re.match(r"(\d+):(\d+):(\d+),(\d+)\s*-->\s*(\d+):(\d+):(\d+),(\d+)", m)
    s = int(mm[1])*3600 + int(mm[2])*60 + int(mm[3]) + int(mm[4])/1000
    e = int(mm[5])*3600 + int(mm[6])*60 + int(mm[7]) + int(mm[8])/1000
    cues.append((s, e))
if CUE_LIMIT is not None:
    cues = [c for c in cues if c[1] <= CUE_LIMIT]

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
A('  <space:Extent id="ext_full" width="1920" height="1080"/>')
A('  <space:Extent id="ext_cap" width="1920" height="220"/>')
A('  <space:Frame id="fr_full" within={screen.bounds} left="0%" top="0%" right="100%" bottom="100%"/>')
A('  <space:Frame id="fr_cap" within={screen.bounds} left="0%" top="84%" right="100%" bottom="99.5%"/>')
for sc in sorted(scenes):
    A(f'  <media:Image id="bg-{sc}" src="../plates/build/bg_{sc}.png"/>')
    A(f'  <media:Image id="fg-{sc}" src="../plates/build/fg_{sc}.png"/>')
for i in range(1, len(cues) + 1):
    A(f'  <media:Image id="cap{i:04d}" src="../plates/build/caps/cap_{i:04d}.png"/>')
for bid in order:
    A(f'  <media:Audio id="ab{bid}" src="../assets/blocks/{bid}.wav"/>')
A("")
A('  <time:Clock id="clock" frame-rate="30"/>')
A('  <time:Timeline id="tl" clock={clock} end="' + ('1800f' if PILOT else '18000f') + '">')
FPS = 30
def fq(t):
    return round(t * FPS)
for bid in order:
    b = blocks[bid]
    st, en = fq(b["start"]), fq(b["start"] + b["dur"])
    A(f'    <time:Window id="wb{bid}" from="{st}f" for="{en-st}f"/>')
for sc in sorted(scenes):
    w = scenes[sc]
    st, en = fq(w["start"]), fq(w["end"])
    A(f'    <time:Window id="ws{sc}" from="{st}f" for="{en-st}f"/>')
    A(f'    <time:Window id="ws{sc}f" from="{st}f" for="{en-st}f"/>')
for i, (s, e) in enumerate(cues):
    st, en = fq(s), fq(e)
    A(f'    <time:Window id="wc{i+1:04d}" from="{st}f" for="{max(1,en-st)}f"/>')
A("  </time:Timeline>")
A("")
for bid in order:
    A(f'  <mediaop:Normalize id="nb{bid}" source={{ab{bid}}} video="none" audio="default" '
      f'span-authority="audio" clock={{clock}}/>')
A("")

# per-scene motion: bg zoom 1.00->1.06, fg zoom 1.03->1.09 (parallax), fades
for sc in sorted(scenes):
    w = scenes[sc]
    dur = w["end"] - w["start"]
    fin = min(0.5, dur / 4)
    fout = dur - fin
    A(f'  <visual:Motion id="mb{sc}">')
    A(f'    <visual:Pose at="start" scale="1.00" opacity="0"/>')
    A(f'    <visual:Pose at="{int(fin*30)}f" scale="1.01" opacity="1"/>')
    A(f'    <visual:Pose at="{int(fout*30)}f" scale="1.05" opacity="1"/>')
    A(f'    <visual:Pose at="end" scale="1.06" opacity="0"/>')
    A("  </visual:Motion>")
    A(f'  <visual:Motion id="mf{sc}">')
    A(f'    <visual:Pose at="start" scale="1.03" x="0" opacity="0"/>')
    A(f'    <visual:Pose at="{int(fin*30)}f" scale="1.04" x="-8" opacity="1"/>')
    A(f'    <visual:Pose at="{int(fout*30)}f" scale="1.08" x="10" opacity="1"/>')
    A(f'    <visual:Pose at="end" scale="1.09" x="12" opacity="0"/>')
    A("  </visual:Motion>")
# caption motion: quick fades
A('  <visual:Motion id="mcap">')
A('    <visual:Pose at="start" opacity="0"/>')
A('    <visual:Pose at="4f" opacity="1"/>')
A('    <visual:Pose at="end" opacity="1"/>')
A("  </visual:Motion>")
A("")
A('  <visual:Track id="picture" timeline={tl.timeline}>')
for sc in sorted(scenes):
    w = scenes[sc]
    A(f'    <visual:Clip id="{sc}-bg" image={{bg-{sc}}} extent={{ext_full}} during={{tl.ws{sc}}} '
      f'z="5" fit="cover" frame={{fr_full}} motion={{mb{sc}}}/>')
    A(f'    <visual:Clip id="{sc}-fg" image={{fg-{sc}}} extent={{ext_full}} during={{tl.ws{sc}f}} '
      f'z="10" fit="cover" frame={{fr_full}} motion={{mf{sc}}}/>')
for i in range(len(cues)):
    A(f'    <visual:Clip id="cap{i+1:04d}" image={{cap{i+1:04d}}} extent={{ext_cap}} frame={{fr_cap}} during={{tl.wc{i+1:04d}}} '
      f'z="30" fit="contain" motion={{mcap}}/>')
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
os.makedirs("authors", exist_ok=True)
open("authors/pilot.svml" if PILOT else "authors/main.svml", "w").write("\n".join(lines) + "\n")
print(f"authors/{'pilot' if PILOT else 'main'}.svml written: {len(lines)} lines")
