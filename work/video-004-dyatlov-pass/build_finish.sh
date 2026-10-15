#!/bin/bash
# build_finish.sh — assemble verified segments into the master, mux 3-bus mix, poster.
# Rules honored: mux output NEVER equals an input path (temp file + mv); faststart on.
set -e
cd "$(dirname "$0")"
NSEG=16
CRF="${1:-20}"

# 1) concat (all segs verified by build_seg.sh gates)
printf "file 'seg/seg_%d.mp4'\n" $(seq 0 $((NSEG-1))) > build/concat.txt
ffmpeg -nostdin -y -f concat -safe 0 -i build/concat.txt -c copy build/master_silent.mp4
V=$(ffprobe -v error -select_streams v -show_entries stream=nb_frames -of csv=p=0 build/master_silent.mp4)
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 build/master_silent.mp4)
echo "master_silent: $V frames, ${D}s"

# 2) mux with the 3-bus mix (temp file -> mv; never in-place)
ffmpeg -nostdin -y -i build/master_silent.mp4 -i build/mix.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
  build/dyatlov_tmp.mp4
mv build/dyatlov_tmp.mp4 build/dyatlov-pass-004.mp4

# 3) verify final
A=$(ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 build/dyatlov-pass-004.mp4)
D2=$(ffprobe -v error -show_entries format=duration -of csv=p=0 build/dyatlov-pass-004.mp4)
echo "FINAL build/dyatlov-pass-004.mp4 — audio=$A duration=${D2}s"
ERRS=$(ffmpeg -nostdin -v error -i build/dyatlov-pass-004.mp4 -f null - < /dev/null 2>&1 | wc -l)
echo "final decode errors: $ERRS"
[ "$ERRS" -ne 0 ] && { echo "FINAL CORRUPT"; exit 1; }

# 4) poster (t=52s — mid cold-open with photo + title)
ffmpeg -nostdin -y -ss 65.5 -i build/dyatlov-pass-004.mp4 -frames:v 1 -q:v 2 build/poster.jpg
echo "poster written"
