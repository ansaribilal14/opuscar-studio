#!/bin/bash
# build_v2.sh — v2 full assembly: segmented stream-render -> concat -> mux -> poster
# usage: bash build_v2.sh [crf]
set -e
cd "$(dirname "$0")"
ROOT="$(pwd)"
CRF="${1:-20}"
FPS=24
SRC=src/render_encode.mjs
OUT=build
mkdir -p "$OUT/seg"

TOTAL_FRAMES=$(node --input-type=module -e "import {buildTimeline} from '$ROOT/src/timeline.js'; console.log(Math.ceil(buildTimeline().total*buildTimeline().fps));")
echo "== timeline: $TOTAL_FRAMES frames =="

NSEG=6
CHUNK=$(( (TOTAL_FRAMES + NSEG - 1) / NSEG ))

echo "== render $NSEG segments, 2 workers, crf $CRF =="
for wave in 0 1 2; do
  PIDS=()
  for k in $wave $((wave+3)); do
    [ $k -ge $NSEG ] && continue
    FIRST=$(( k * CHUNK ))
    LAST=$(( (k+1) * CHUNK - 1 ))
    [ $LAST -ge $TOTAL_FRAMES ] && LAST=$(( TOTAL_FRAMES - 1 ))
    [ $FIRST -gt $LAST ] && continue
    node "$SRC" "$FIRST" "$LAST" "$OUT/seg/seg_$k.mp4" --fps $FPS --w 1920 --h 1080 --crf $CRF > "$OUT/seg/seg_$k.log" 2>&1 &
    PIDS+=($!)
    echo "  launched seg_$k: $FIRST-$LAST (pid $!)"
  done
  FAIL=0
  for pid in "${PIDS[@]}"; do wait "$pid" || FAIL=1; done
  [ $FAIL -eq 1 ] && { echo "RENDER FAILED — see $OUT/seg/*.log"; exit 1; }
  echo "  wave $wave done"
done

echo "== verify segments =="
for k in $(seq 0 $((NSEG-1))); do
  N=$(ffprobe -v error -select_streams v -show_entries stream=nb_frames -of csv=p=0 "$OUT/seg/seg_$k.mp4" 2>/dev/null || echo MISSING)
  echo "  seg_$k: $N frames"
done

echo "== concat =="
printf "file '%s'\n" "$OUT"/seg/seg_{0..5}.mp4 > "$OUT/concat.txt"
ffmpeg -nostdin -y -f concat -safe 0 -i "$OUT/concat.txt" -c copy "$OUT/video_silent.mp4" 2>&1 | tail -1

echo "== score + mix (audio unchanged from v1 narration) =="
python3 "$ROOT/src/music.py" > /dev/null
python3 "$ROOT/src/mix.py" | tail -2

echo "== mux master =="
ffmpeg -nostdin -y -i "$OUT/video_silent.mp4" -i "$OUT/mix.wav" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest \
  -movflags +faststart "$OUT/isdal-woman-003.mp4" 2>&1 | tail -1

echo "== loudness =="
ffmpeg -nostdin -i "$OUT/isdal-woman-003.mp4" -af loudnorm=print_format=summary -f null - 2>&1 | grep -E "Input Integrated|Input True Peak" || true

echo "== poster =="
ffmpeg -nostdin -y -ss 68.5 -i "$OUT/isdal-woman-003.mp4" -frames:v 1 -q:v 2 "$OUT/poster.jpg" < /dev/null

echo "== srt =="
node "$ROOT/src/gen_subs.py" 2>/dev/null || python3 "$ROOT/src/gen_subs.py" || echo "(gen_subs failed — check)"

ls -la "$OUT"
echo "DONE: $OUT/isdal-woman-003.mp4"
