#!/bin/bash
# Patient period-photo download for video-004 — one asset per imgacq pass,
# quiet window between passes (Wikimedia limiter is burst-triggered on this IP).
# Honest outcomes only: whatever fails stays failed_download, resumable.
set -u
cd /home/z/my-project
FILM=video-004-dyatlov-pass
ASSETS="656bd19d14aa 723a7ca59b5f d1135d8da4e4 3c777ed43344 68f7f5a5ac5f"
for a in $ASSETS; do
  ok=0
  for try in 1 2 3; do
    echo "=== pass asset $a try $try ($(date +%T)) ==="
    timeout 240 python3 scripts/imgacq/cli.py download --film "$FILM" --asset "$a" 2>&1 | tail -3
    if python3 - "$a" <<'EOF'
import json,sys,os
aid=sys.argv[1]
led=json.load(open('work/video-004-dyatlov-pass/images/ledger.json'))
e=next((e for e in led['entries'] if e['asset_id']==aid),None)
sys.exit(0 if e and e.get('status') in ('downloaded','validated') and e.get('file') and os.path.exists(e['file']) else 1)
EOF
    then ok=1; echo "--- asset $a OK"; break; fi
    sleep 70
  done
  [ $ok = 0 ] && echo "--- asset $a STILL FAILED (resumable, nothing substituted)"
  sleep 20
done
echo "=== final ledger state ==="
python3 - <<'EOF'
import json,os
led=json.load(open('work/video-004-dyatlov-pass/images/ledger.json'))
for e in led['entries']:
    f=e.get('file')
    print(f"{e['asset_id']} {e['status']:16} exists={os.path.exists(f) if f else False} {e.get('title','')[:50]}")
EOF