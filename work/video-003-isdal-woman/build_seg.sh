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
# integrity gate: full decode must be error-free (catches double-write NAL corruption)
ERRS=$(ffmpeg -nostdin -v error -i "build/seg/seg_$K.mp4" -f null - < /dev/null 2>&1 | wc -l)
echo "seg_$K decode errors: $ERRS"
[ "$ERRS" -ne 0 ] && { echo "SEG_$K CORRUPT — aborting (re-run build_seg.sh $K $NSEG)"; exit 1; }
[ "$N" -ne $(( LAST - FIRST + 1 )) ] && { echo "SEG_$K FRAME COUNT WRONG ($N != $(( LAST - FIRST + 1 )))"; exit 1; }
echo "seg_$K VERIFIED"
