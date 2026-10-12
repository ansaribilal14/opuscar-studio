#!/usr/bin/env python3
"""Final cue plan for The Ostrich, Plate VII — hand-timed, verified against the readcheck
formula (non-space chars / 15 + 1.5 s) and the speech-hold rule (>= max(1.8, speech+0.45))."""
import json

proj = '/home/z/my-project/ostrich-plate'
BPM = 88
bb = lambda n: n * 60.0 / BPM

CUES = [
    (0.80,  4.40,  "It cannot fly. It has never needed to."),
    (7.50,  15.60, "The ostrich — the largest of all living birds. Two metres eighty tall, and up to one hundred and fifty-six kilograms."),
    (16.84, 22.00, "It is the fastest animal on two legs. Seventy kilometres an hour,"),
    (22.00, 27.30, "on strides three metres long — each foot carrying just two toes."),
    (27.95, 33.60, "And the eye, five centimetres across, is larger than the brain it serves."),
    (41.05, 45.40, "The largest egg on Earth: one and a half kilograms —"),
    (45.40, 51.45, "two dozen hen's eggs in the hand. The male keeps it warm through the African night."),
    (51.50, 55.00, "It cannot fly. It never needed to."),
]

ok = True
for i, (t0, t1, text) in enumerate(CUES):
    ns = len([c for c in text if not c.isspace()])
    need = ns / 15 + 1.5
    hold = t1 - t0
    nxt = CUES[i + 1][0] if i + 1 < len(CUES) else 1e9
    status = 'OK '
    if hold < need or t1 > nxt or hold < 1.8:
        status = 'BAD'; ok = False
    print(f"{status} {t0:6.2f} {t1:6.2f}  hold {hold:4.2f} need {need:4.2f}  ({len(text)}ch) {text[:60]}")

json.dump([{'t0': t0, 't1': t1, 'text': tx} for t0, t1, tx in CUES], open(f'{proj}/subs.json', 'w'), indent=1)
json.dump([{'t0': t0, 't1': t1, 'text': tx} for t0, t1, tx in CUES], open(f'{proj}/cues.json', 'w'), indent=1)
print('cues written' + ('' if ok else '  -- FIX NEEDED'))
