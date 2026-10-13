#!/bin/bash
# build_seg.sh — render ONE segment of the main film (foreground; sandbox kills bg jobs)
# usage: bash build_seg.sh <k> <nseg> [crf]
set -e
cd "$(dirname "$0")"
ROOT="$(pwd)"
K="$1"; NSEG="$2"; CRF="${3:-20}"
FPS=24
mkdir -p build/seg
TOTAL_FRAMES=$(node --input-type=module -e "import {buildTimeline} from '$ROOT/src/timeline.js'; console.log(Math.ceil(buildTimeline().total*buildTimeline().fps));")
CHUNK=$(( (TOTAL_FRAMES + NSEG - 1) / NSEG ))
FIRST=$(( K * CHUNK ))
LAST=$(( (K+1) * CHUNK - 1 ))
[ $LAST -ge $TOTAL_FRAMES ] && LAST=$(( TOTAL_FRAMES - 1 ))
echo "seg_$K: frames $FIRST-$LAST of $TOTAL_FRAMES"
node src/render_encode.mjs "$FIRST" "$LAST" "build/seg/seg_$K.mp4" --fps $FPS --w 1920 --h 1080 --crf $CRF
N=$(ffprobe -v error -select_streams v -show_entries stream=nb_frames -of csv=p=0 "build/seg/seg_$K.mp4")
echo "seg_$K done: $N frames"
