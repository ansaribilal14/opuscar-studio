#!/bin/bash
# Patient pass #2: ONE asset per invocation after a FULL quiet refill window.
# No probes during quiet (every hit drains the bucket).
set -u
cd /home/z/my-project
FILM=video-004-dyatlov-pass
A="$1"
QUIET="${2:-160}"
echo "=== quiet ${QUIET}s ($(date +%T)) ==="
sleep "$QUIET"
echo "=== single pass $A ($(date +%T)) ==="
timeout 240 python3 scripts/imgacq/cli.py download --film "$FILM" --asset "$A" 2>&1 | tail -4
python3 - "$A" <<'EOF'
import json,sys,os
aid=sys.argv[1]
led=json.load(open('work/video-004-dyatlov-pass/images/ledger.json'))
e=next((e for e in led['entries'] if e['asset_id']==aid),None)
ok=e and e.get('status') in ('downloaded','validated') and e.get('file') and os.path.exists(e['file'])
print(f"RESULT {aid}: {'OK '+e.get('file','') if ok else 'STILL FAILED'}")
EOF