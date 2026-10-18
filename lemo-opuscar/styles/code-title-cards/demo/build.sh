#!/bin/sh
# 从零重现《Render It Free》（静音标题卡：无配音、无配乐、无混音、无 mux）：
#   sh styles/code-title-cards/demo/build.sh      （在库根或任意目录运行）
# 输出：<demo>/out/title-cards.mp4（1920x1080、30 fps、约 18 s、H.264、无音频轨）
# 依赖：node、ffmpeg、playwright-core（sh plugin/skills/lemo-opuscar/scripts/setup.sh deps）
# 字体：fonts/SpaceGrotesk-700.woff2 须在本地（缺失时先跑 demo/tools/refont.sh）
set -e
cd "$(dirname "$0")/../../.."
D=styles/code-title-cards/demo
S=styles/code-title-cards

[ -f "$D/fonts/SpaceGrotesk-700.woff2" ] || { echo "missing $D/fonts/SpaceGrotesk-700.woff2 — run: sh $D/tools/refont.sh"; exit 1; }

node core/render/video.mjs "$D" --fps 30 --workers 2 --out "$D/out/title-cards.mp4"
node core/render/readcheck.mjs "$D"

# 每张卡一格（停留中段）+ 淡入/淡出探针帧；时间点由 timeline.js 计算（唯一数据源，不手抄）
TIMES=$(node "$D/tools/card_times.mjs" hold)
node core/render/still.mjs "$D" $TIMES --out "$D/stills" --prefix frame_
PROBES=$(node "$D/tools/card_times.mjs" probes)
node core/render/still.mjs "$D" $PROBES --out "$D/out/stills-qa" --prefix probe_
python3 core/render/sheet.py "$D/stills/frame_contact-sheet.jpg" "$D"/stills/frame_*.jpg --cols 5

# 文档用样式帧 + 海报（海报取自成片）+ 目录用成片副本
SF=$(node "$D/tools/card_times.mjs" styleframe)
node core/render/still.mjs "$D" "$SF" --out "$D/out/stills-sf" --prefix sf_
cp "$D/out/stills-sf/$(ls "$D/out/stills-sf" | head -1)" "$D/stills/styleframe.jpg"
ffmpeg -nostdin -v error -y -ss "$SF" -i "$D/out/title-cards.mp4" -frames:v 1 -q:v 2 "$S/poster.jpg" < /dev/null
cp "$D/out/title-cards.mp4" "$S/code-title-cards.mp4"
echo "build complete: $D/out/title-cards.mp4 (+ $S/code-title-cards.mp4, $S/poster.jpg)"
