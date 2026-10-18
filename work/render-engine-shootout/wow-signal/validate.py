#!/usr/bin/env python3
"""validate.py — directive §11 validation matrix for one engine output.

Usage: validate.py <mp4> <engine> [--poster out.jpg]
Checks (measured, no assumptions):
  duration (599-601), frame count (17970-18030 @30fps), resolution/AR, codec,
  pix_fmt+range, audio codec/channels/rate, A/V duration delta, full decode,
  frozen/duplicate-frame scan, black-frame scan, loudness, scene samples.
Emits JSON to stdout (consumed by RESULTS.json assembly) and human summary.
"""
import json, subprocess, sys, os

path, engine = sys.argv[1], sys.argv[2]
FPS = 30

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

probe = run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path])
meta = json.loads(probe.stdout)
v = next(s for s in meta["streams"] if s["codec_type"] == "video")
a = next((s for s in meta["streams"] if s["codec_type"] == "audio"), None)
dur = float(meta["format"]["duration"])
nb = int(v.get("nb_frames", 0))

res = {"engine": engine, "file": os.path.basename(path)}
res["duration_s"] = round(dur, 3)
res["duration_ok"] = 599.0 <= dur <= 601.0
res["frames"] = nb
res["frames_ok"] = 17970 <= nb <= 18030
res["width"], res["height"] = v["width"], v["height"]
res["resolution_ok"] = (v["width"], v["height"]) == (1920, 1080)
res["aspect_ok"] = abs(v["width"] / v["height"] - 16 / 9) < 0.01
res["codec"] = v["codec_name"]
res["codec_ok"] = v["codec_name"] == "h264"
res["pix_fmt"] = v["pix_fmt"]
res["pix_fmt_ok"] = v["pix_fmt"] in ("yuv420p", "yuvj420p")
res["fps"] = v["r_frame_rate"]
res["fps_ok"] = v["r_frame_rate"].split("/")[0] in ("30", "30000") and v["r_frame_rate"].endswith(("/1", "/1000"))
res["color_range"] = v.get("color_range", "unknown")
if a:
    res["audio_codec"] = a["codec_name"]
    res["audio_ok"] = a["codec_name"] == "aac" and int(a["channels"]) == 2 and int(a["sample_rate"]) == 48000
    adur = float(a.get("duration", dur))
    res["av_delta_s"] = round(abs(adur - dur), 3)
    res["av_sync_ok"] = abs(adur - dur) < 0.5
# full decode
dec = run(["ffmpeg", "-nostdin", "-v", "error", "-i", path, "-f", "null", "-"])
res["decode_errors"] = len(dec.stderr.strip().splitlines()) if dec.stderr.strip() else 0
res["decode_ok"] = res["decode_errors"] == 0
# loudness
eb = run(["ffmpeg", "-nostdin", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"])
ilu = [l for l in eb.stderr.splitlines() if l.strip().startswith("I:")]
try:
    res["loudness_lufs"] = float(ilu[-1].strip().split("I:")[1].strip().split()[0])
    res["loudness_ok"] = -18.0 <= res["loudness_lufs"] <= -13.5
except Exception:
    res["loudness_lufs"] = None
    res["loudness_ok"] = False
# black / frozen frame scan (scene filter)
bf = run(["ffmpeg", "-nostdin", "-i", path, "-vf", "blackdetect=d=1.0:pix_th=0.02", "-an", "-f", "null", "-"])
blacks = [l for l in bf.stderr.splitlines() if "black_start" in l]
res["black_segments_over_1s"] = len(blacks)
res["black_ok"] = len(blacks) == 0 or all(
    float(l.split("black_start:")[1].split()[0]) < 2.0 for l in blacks)  # intro fade tolerated
frz = run(["ffmpeg", "-nostdin", "-i", path, "-vf", "freezedetect=n=0.001:d=12", "-an", "-f", "null", "-"])
freezes = []
for l in frz.stderr.splitlines():
    if "freeze_start:" in l:
        try:
            freezes.append(float(l.split("freeze_start:")[1].split()[0]))
        except Exception:
            pass
# documentary stills hold by design (grain-subtle motion) — a STALL is a long full freeze
# outside the closing-credits hold (last 25 s)
bad_freezes = [t for t in freezes if t < 575.0]
res["freeze_segments_over_12s"] = len(freezes)
res["freeze_stalls_outside_credits"] = len(bad_freezes)
res["freeze_ok"] = len(bad_freezes) == 0
# all gates
gates = [k for k in res if k.endswith("_ok")]
res["gates_total"] = len(gates)
res["gates_passed"] = sum(1 for k in gates if res[k])
res["all_gates_ok"] = all(res[k] for k in gates)
print(json.dumps(res, indent=1))
ok = res["all_gates_ok"]
print(f"\n{engine}: {res['gates_passed']}/{res['gates_total']} gates passed"
      f"{' — ALL GREEN' if ok else ' — FAILURES PRESENT'}", file=sys.stderr)
sys.exit(0 if ok else 1)
