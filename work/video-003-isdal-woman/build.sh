#!/bin/bash
# build.sh — full assembly for video-003 (deterministic render -> encode -> mix -> mux)
# usage: bash build.sh [workers]
set -e
cd "$(dirname "$0")"
ROOT="$(pwd)"
WORKERS="${1:-5}"
FPS=24
mkdir -p build frames/main

echo "== 1. timeline sanity =="
node --input-type=module -e "import {buildTimeline} from '$ROOT/src/timeline.js'; const tl=buildTimeline(); console.log('total', tl.total.toFixed(1)+'s, frames', Math.ceil(tl.total*tl.fps));"
TOTAL_FRAMES=$(node --input-type=module -e "import {buildTimeline} from '$ROOT/src/timeline.js'; const tl=buildTimeline(); console.log(Math.ceil(tl.total*tl.fps));")

echo "== 2. render frames ($WORKERS workers, $TOTAL_FRAMES frames) =="
CHUNK=$(( (TOTAL_FRAMES + WORKERS - 1) / WORKERS ))
PIDS=()
for i in $(seq 0 $((WORKERS-1))); do
  FIRST=$(( i * CHUNK ))
  LAST=$(( (i+1) * CHUNK - 1 ))
  [ $LAST -ge $TOTAL_FRAMES ] && LAST=$(( TOTAL_FRAMES - 1 ))
  [ $FIRST -gt $LAST ] && continue
  node "$ROOT/src/render_range.mjs" "$FIRST" "$LAST" "$ROOT/frames/main" > "$ROOT/frames/worker_$i.log" 2>&1 &
  PIDS+=($!)
  echo "  worker $i: frames $FIRST-$LAST (pid ${PIDS[-1]})"
done
FAIL=0
for pid in "${PIDS[@]}"; do
  wait "$pid" || FAIL=1
done
[ $FAIL -eq 1 ] && { echo "RENDER WORKER FAILED — see frames/worker_*.log"; exit 1; }
echo "  frames done: $(ls "$ROOT/frames/main" | wc -l)"

echo "== 3. score =="
python3 "$ROOT/src/music.py"

echo "== 4. mix =="
python3 "$ROOT/src/mix.py"

echo "== 5. encode video =="
ffmpeg -nostdin -y -framerate $FPS -i "$ROOT/frames/main/f%06d.png" \
  -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -profile:v high -level 4.0 \
  -movflags +faststart "$ROOT/build/video_silent.mp4"

echo "== 6. mux + master =="
ffmpeg -nostdin -y -i "$ROOT/build/video_silent.mp4" -i "$ROOT/build/mix.wav" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest \
  -movflags +faststart "$ROOT/build/isdal-woman-003.mp4"

echo "== 7. poster =="
ffmpeg -nostdin -y -ss 71 -i "$ROOT/build/isdal-woman-003.mp4" -frames:v 1 -q:v 2 "$ROOT/build/poster.jpg"

echo "== 8. loudness check =="
ffmpeg -nostdin -i "$ROOT/build/isdal-woman-003.mp4" -af loudnorm=print_format=summary -f null - 2>&1 | grep -E "Input Integrated|Input True Peak" || true

echo "DONE: $ROOT/build/isdal-woman-003.mp4"
ls -la "$ROOT/build/"
