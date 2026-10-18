#!/bin/bash
set -e
cd "$(dirname "$0")"
mkdir -p build out
: > build/concat.txt
for k in 00 01 02 03 04 05 06 07 08 09; do echo "file 'seg/seg_$k.mp4'" >> build/concat.txt; done
ffmpeg -nostdin -y -f concat -safe 0 -i build/concat.txt -c copy build/concat.mp4 < /dev/null 2>build/concat.log
# normalize: ensure yuv420p tv-range output + faststart (segments are already yuv420p; copy would preserve)
ffmpeg -nostdin -y -i build/concat.mp4 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -color_range tv \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart out/wow-signal-hyperframes.mp4 < /dev/null 2>build/final.log
OUT=out/wow-signal-hyperframes.mp4
echo "=== GATES ==="
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
ffprobe -v error -select_streams v -show_entries stream=width,height,r_frame_rate,nb_frames,codec_name,pix_fmt,color_range -of json "$OUT" | python3 -c "import json,sys;print(json.load(sys.stdin)['streams'][0])"
ffprobe -v error -select_streams a -show_entries stream=codec_name,channels,sample_rate -of json "$OUT" | python3 -c "import json,sys;print(json.load(sys.stdin)['streams'][0])"
echo "decode errors: $(ffmpeg -nostdin -v error -i "$OUT" -f null - < /dev/null 2>&1 | wc -l)"
ffmpeg -nostdin -y -ss 35 -i "$OUT" -frames:v 1 -q:v 2 out/wow-signal-hyperframes-poster.jpg < /dev/null 2>/dev/null
cp ../../shared/subtitles/wow-signal.srt out/wow-signal-hyperframes.srt
echo ASSEMBLY COMPLETE
