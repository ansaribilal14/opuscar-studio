#!/bin/bash
# build_seg.sh — render one 60s HyperFrames segment + integrity gates
set -e
cd "$(dirname "$0")"
K=$(printf "%02d" "$1")
mkdir -p build/seg
[ -f "build/seg/seg_$K.mp4" ] && { echo "seg_$K exists, skip"; exit 0; }
timeout 480 hyperframes render -c "segments/segment_$K.html" --output "build/seg/seg_$K.mp4" --workers 2 > "/tmp/hfseg$K.log" 2>&1 || { echo "seg_$K RENDER FAILED"; tail -5 "/tmp/hfseg$K.log"; exit 1; }
N=$(ffprobe -v error -select_streams v -show_entries stream=nb_frames -of csv=p=0 "build/seg/seg_$K.mp4")
A=$(ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 "build/seg/seg_$K.mp4")
ERRS=$(ffmpeg -nostdin -v error -i "build/seg/seg_$K.mp4" -f null - < /dev/null 2>&1 | wc -l)
echo "seg_$K: frames=$N audio=$A decode_errors=$ERRS"
[ "$N" -ne 1800 ] && { echo "seg_$K FRAME COUNT WRONG"; exit 1; }
[ "$A" != "aac" ] && { echo "seg_$K AUDIO MISSING"; exit 1; }
[ "$ERRS" -ne 0 ] && { echo "seg_$K CORRUPT"; exit 1; }
echo "seg_$K VERIFIED"
