#!/bin/sh
# 从零重现《Render It Free》（静音标题卡：无配音、无配乐、无混音、无 mux）：
#   sh styles/code-title-cards/demo/build.sh      （在库根或任意目录运行）
# 输出：<demo>/out/title-cards.mp4（1920x1080、30 fps、约 18 s、H.264、无音频轨）
set -e
cd "$(dirname "$0")/../../.."
D=styles/code-title-cards/demo

node core/render/video.mjs "$D" --fps 30 --workers 2 --out "$D/out/title-cards.mp4"
node core/render/readcheck.mjs "$D"

# 每张卡一格（停留中段），时间点由 timeline.js 计算（唯一数据源，不手抄）
TIMES=$(node "$D/tools/card_times.mjs" hold)
node core/render/still.mjs "$D" $TIMES --out "$D/stills" --prefix card_
python3 core/render/sheet.py "$D/stills/contact-sheet.jpg" "$D"/stills/card_*.jpg --cols 5

# 文档用样式帧
node core/render/still.mjs "$D" "$(node "$D/tools/card_times.mjs" styleframe)" --out "$D/stills" --prefix sf_
cp "$D/stills/$(ls "$D/stills" | grep '^sf_' | head -1)" "$D/stills/styleframe.jpg"
echo "build complete: $D/out/title-cards.mp4"
