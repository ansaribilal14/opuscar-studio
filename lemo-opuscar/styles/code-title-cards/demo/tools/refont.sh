#!/bin/sh
# Reproduce fonts/SpaceGrotesk-700.woff2 from the legitimate upstream sources and
# verify its checksum. Requires: curl, python3, fontTools + brotli
# (pip3 install fonttools brotli). The font is SIL OFL 1.1 — the license text at
# fonts/OFL-SpaceGrotesk.txt must always accompany the file.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
FDIR="$HERE/../fonts"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
curl -sL -o "$TMP/SpaceGrotesk-VF.ttf" "https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"
curl -sL -o "$TMP/OFL.txt" "https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/OFL.txt"
python3 - "$TMP" "$FDIR" <<'EOF'
import sys, hashlib
from fontTools import ttLib
from fontTools.varLib.instancer import instantiateVariableFont
tmp, fdir = sys.argv[1], sys.argv[2]
f = ttLib.TTFont(tmp + '/SpaceGrotesk-VF.ttf')
inst = instantiateVariableFont(f, {'wght': 700}, inplace=False, updateFontNames=True)
inst.flavor = 'woff2'
out = fdir + '/SpaceGrotesk-700.woff2'
inst.save(out)
sha = hashlib.sha256(open(out, 'rb').read()).hexdigest()
print('wrote', out)
print('sha256', sha)
print('expected b3c513b2089aa8d3959d39d05e41c04b47c502c6838aa7dd95ae6dab249c3f0f')
EOF
diff <(tr -d '\r' < "$TMP/OFL.txt") <(tr -d '\r' < "$FDIR/OFL-SpaceGrotesk.txt") && echo "OFL license text matches upstream"
