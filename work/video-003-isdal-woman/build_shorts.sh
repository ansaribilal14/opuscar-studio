#!/bin/bash
# build_shorts.sh — render + encode the 4 vertical shorts (720x1280)
set -e
cd "$(dirname "$0")"
ROOT="$(pwd)"
for K in A B C D; do
  echo "== short $K =="
  TOTAL_F=$(node --input-type=module -e "import {shortTimeline} from '$ROOT/src/shorts.mjs'; console.log(Math.ceil(shortTimeline('$K').total*24));")
  echo "  frames: $TOTAL_F"
  rm -rf "$ROOT/frames/short_$K"
  node "$ROOT/src/render_shorts_range.mjs" "$K" 0 $((TOTAL_F-1)) "$ROOT/frames/short_$K"
  python3 "$ROOT/src/mix_shorts.py" "$K"
  ffmpeg -nostdin -y -framerate 24 -i "$ROOT/frames/short_$K/f%06d.png" \
    -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -movflags +faststart "$ROOT/build/short_${K}_silent.mp4"
  ffmpeg -nostdin -y -i "$ROOT/build/short_${K}_silent.mp4" -i "$ROOT/build/short_${K}.wav" \
    -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart \
    "$ROOT/build/isdal-short-$K.mp4"
  rm -rf "$ROOT/frames/short_$K" "$ROOT/build/short_${K}_silent.mp4" "$ROOT/build/short_${K}.wav"
  echo "  done: $ROOT/build/isdal-short-$K.mp4"
done
echo "ALL SHORTS DONE"
ls -la "$ROOT/build/"isdal-short-*.mp4
