#!/bin/bash
# build_finish.sh — concat segments, score+mix, mux master, poster (foreground)
set -e
cd "$(dirname "$0")"
ROOT="$(pwd)"
FPS=24
NSEG=12

echo "== verify segments =="
TOTAL_OK=0
for k in $(seq 0 $((NSEG-1))); do
  N=$(ffprobe -v error -select_streams v -show_entries stream=nb_frames -of csv=p=0 "build/seg/seg_$k.mp4" 2>/dev/null || echo MISSING)
  echo "  seg_$k: $N frames"
  [ "$N" = "MISSING" ] && { echo "SEGMENT $k MISSING — abort"; exit 1; }
  TOTAL_OK=$((TOTAL_OK + N))
done
echo "  total frames: $TOTAL_OK"

echo "== concat =="
printf "file '%s'\n" "$ROOT"/build/seg/seg_{0..11}.mp4 > build/concat.txt
ffmpeg -nostdin -y -f concat -safe 0 -i build/concat.txt -c copy build/video_silent.mp4 < /dev/null 2>&1 | tail -1

echo "== score =="
python3 src/music.py > /dev/null && echo "  music.wav ok"

echo "== mix =="
python3 src/mix.py | tail -2

echo "== mux master =="
ffmpeg -nostdin -y -i build/video_silent.mp4 -i build/mix.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest \
  -movflags +faststart build/isdal-woman-003.mp4 < /dev/null 2>&1 | tail -1

echo "== loudness =="
ffmpeg -nostdin -i build/isdal-woman-003.mp4 -af loudnorm=print_format=summary -f null - 2>&1 < /dev/null | grep -E "Input Integrated|Input True Peak" || true

echo "== poster =="
ffmpeg -nostdin -y -ss 68.5 -i build/isdal-woman-003.mp4 -frames:v 1 -q:v 2 build/poster.jpg < /dev/null

ls -la build/isdal-woman-003.mp4 build/poster.jpg
echo "DONE"
