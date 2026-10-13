#!/bin/bash
# build_shorts_v2.sh — render + encode the 4 vertical shorts (1080x1920, streaming)
set -e
cd "$(dirname "$0")"
ROOT="$(pwd)"
for K in A B C D; do
  echo "== short $K =="
  node "$ROOT/src/render_encode_shorts.mjs" "$K" "$ROOT/build/isdal-short-$K.mp4" --crf 20
  python3 "$ROOT/src/mix_shorts.py" "$K" | tail -1
  ffmpeg -nostdin -y -i "$ROOT/build/isdal-short-$K.mp4" -i "$ROOT/build/short_$K.wav" \
    -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart \
    "$ROOT/build/isdal-short-$K-final.mp4" < /dev/null 2>&1 | tail -1
  mv "$ROOT/build/isdal-short-$K-final.mp4" "$ROOT/build/isdal-short-$K.mp4"
  rm -f "$ROOT/build/short_$K.wav"
  echo "  done: $ROOT/build/isdal-short-$K.mp4"
done
echo "ALL SHORTS DONE"
ls -la "$ROOT/build/"isdal-short-*.mp4
