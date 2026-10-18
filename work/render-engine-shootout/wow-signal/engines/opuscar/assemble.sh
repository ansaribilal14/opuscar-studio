#!/bin/bash
# assemble.sh — concat segments, normalize pixel range to yuv420p/tv, mux the shared
# narration program, run the full gate battery, cut the poster.
set -e
cd "$(dirname "$0")"
mkdir -p build out
SEG_N=10
# 1. concat list
: > build/concat.txt
for k in $(seq 0 $((SEG_N-1))); do echo "file 'seg/seg_$k.mp4'" >> build/concat.txt; done
# 2. concat (stream copy — identical codec params across segments)
ffmpeg -nostdin -y -f concat -safe 0 -i build/concat.txt -c copy build/video_j422p.mp4 < /dev/null 2> build/concat.log
# 3. final encode: full->limited range, mux shared narration (identical for all engines)
ffmpeg -nostdin -y -i build/video_j422p.mp4 -i ../../shared/audio/narration_program.wav \
  -vf "scale=in_range=jpeg:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -color_range tv \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart -shortest out/wow-signal-opuscar.mp4 < /dev/null 2> build/final.log
OUT=out/wow-signal-opuscar.mp4
echo "=== GATES ==="
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
ffprobe -v error -select_streams v -show_entries stream=width,height,r_frame_rate,nb_frames,codec_name,pix_fmt,color_range -of json "$OUT" | python3 -c "import json,sys;print(json.load(sys.stdin)['streams'][0])"
ffprobe -v error -select_streams a -show_entries stream=codec_name,channels,sample_rate -of json "$OUT" | python3 -c "import json,sys;print(json.load(sys.stdin)['streams'][0])"
echo "full decode:"
ffmpeg -nostdin -v error -i "$OUT" -f null - < /dev/null 2>&1 | wc -l
echo "loudness:"
ffmpeg -nostdin -i "$OUT" -af ebur128=peak=true -f null - < /dev/null 2>&1 | grep -A8 "Integrated loudness" | head -6 || true
# 4. poster (title card frame)
ffmpeg -nostdin -y -ss 35 -i "$OUT" -frames:v 1 -q:v 2 out/wow-signal-opuscar-poster.jpg < /dev/null 2>/dev/null
cp ../../shared/subtitles/wow-signal.srt out/wow-signal-opuscar.srt
echo "ASSEMBLY COMPLETE"
