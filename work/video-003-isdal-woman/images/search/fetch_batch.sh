#!/bin/bash
# fetch_batch.sh — image-search queries for video-003 v2 visual rebuild
# Each query: one coherent concept, real photographs only, US region.
S=/home/z/my-project/work/video-003-isdal-woman/images/search
run() { name="$1"; query="$2"; [ -s "$S/q_$name.json" ] && { echo "skip $name (exists)"; return; }; \
  z-ai image-search -q "$query" -c 5 --gl us -o "$S/q_$name.json" >/dev/null 2>&1 && echo "done $name" || echo "FAIL $name"; }

# batch 1
run bergen   "Bergen Norway Bryggen harbor wooden houses rain overcast moody photograph" &
run stavanger "Stavanger Norway old town white wooden houses street photograph" &
wait
# batch 2
run train    "vintage railway station platform winter snow nordic train photograph" &
run road     "empty desolate mountain road Norway dusk fog photograph" &
wait
# batch 3
run suitcase "old vintage leather suitcase worn travel photograph isolated" &
run notebook "vintage handwritten code cipher notebook page cryptic symbols photograph" &
wait
# batch 4
run archive  "old police archive filing cabinet case files folders photograph" &
run knit     "grey knitted wool sweater texture pattern close up photograph" &
wait
# batch 5
run newspaper "yellowed old newspapers stack vintage 1970 newspaper photograph" &
run fingerprint "fingerprint card archive forensic identification vintage photograph" &
wait
echo ALL_DONE
