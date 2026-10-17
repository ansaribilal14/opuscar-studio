"""The Ostrich, Plate XII — original score, composed in code.
88 BPM (1 beat = 60/88 s). D minor through the engraving and the magnified details;
the first bowed notes arrive with the hand-colouring (45.1) and the music turns to D major —
the amber wash. Places every accent on the film's picture events (events.json).
Run: python3 music/score_ostrich.py   (ENG_WORK overrides the work folder)
Outputs: music/stems/{harpsichord,pizz,bowed}.wav, music/cues.json, music/CREDITS_music.txt,
music/timing_report.txt.
"""
import sys, os, json
ROOT = '/home/z/my-project/lemo-opuscar'   # the library root (core/ lives there)
sys.path.insert(0, ROOT)
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, lfilter
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.environ.get('ENG_WORK') or os.path.abspath(os.path.join(HERE, '..'))
MOUT = os.path.join(WORK, 'music'); os.makedirs(os.path.join(MOUT, 'stems'), exist_ok=True)
EVJ = json.load(open(os.path.join(WORK, 'events.json')))
DUR = float(EVJ['dur']); N = int(round(DUR * SR)) + SR
EV = {e['type'] + ('' if e.get('i') is None else str(e['i'])): e for e in EVJ['ev']}
first = lambda t: next(e for e in EVJ['ev'] if e['type'] == t)
PEEL = first('peel')['t']; TITLE = first('title')['t']; NAT = first('natsize')['t']
SIL = first('silence'); LAND = first('landing')['t']; TISSUE = first('tissue')['t']
DETS = [e for e in EVJ['ev'] if e['type'] == 'push']
def ev(t, i=None):
    return next(e for e in EVJ['ev'] if e['type'] == t and (i is None or str(e.get('g', e.get('i'))) == str(i)))

B = 60 / 88   # one beat
S.seed(11); RNG = np.random.default_rng(11)

STEMS = ['harpsichord', 'pizz', 'bowed']
bus = {k: np.zeros((N, 2), np.float32) for k in STEMS}
CUES = []; USED = set()
PRE = .003
def tr(x):
    x = np.asarray(x, np.float32); a = np.abs(x); i = int(np.argmax(a > .3 * a.max()))
    return x[max(0, i - int(PRE * SR)):]
PAN = {'harpsichord': -.12, 'violin_pizz': -.4, 'violins_pizz': .35, 'violas_pizz': .15,
       'cellos_pizz': -.08, 'contrabass_pizz': -.15,
       'violins': .3, 'violin': -.4, 'violas': .12, 'cellos': -.1, 'contrabass': -.18}
STEM_OF = lambda inst: 'harpsichord' if inst == 'harpsichord' else ('pizz' if inst.endswith('pizz') else 'bowed')

def cue(t, what, stem, band=None):
    CUES.append(dict(t=round(float(t), 4), what=what, stem=stem, **({'band': band} if band else {})))

def pl(t, inst, p, d=.25, v=.6, g=1.0, exact=False, pan=None, release=None):
    USED.add(inst)
    if not exact:
        t = t + RNG.uniform(-.004, .004); v = float(np.clip(v + RNG.uniform(-.04, .04), .05, 1))
    kw = {} if release is None else dict(release=release)
    x = tr(S.note(inst, p, d, vel=v, **kw))
    add(bus[STEM_OF(inst)], x, t - PRE, g, PAN[inst] if pan is None else pan)

def hch(t, ps, d=.4, v=.55, g=1.0, strum=.012, exact=False):
    for i, p in enumerate(ps): pl(t + i * strum, 'harpsichord', p, d, v, g, exact=(exact and i == 0))

def bow(t, inst, p, d, v=.45, g=1.0, attack=.5, release=.6, pan=None):
    USED.add(inst)
    x = S.note(inst, p, d, vel=v, release=release)
    a = np.abs(x); i0 = int(np.argmax(a > a.max() * 10 ** (-40 / 20)))
    x = x[i0:].copy(); na = int(attack * SR); x[:na] *= np.linspace(0, 1, na) ** 1.5
    add(bus['bowed'], x, t, g, PAN[inst] if pan is None else pan)

# ─── harmony (D minor → D major) ───
RHm = {'Dm': ['D4', 'F4', 'A4'], 'Gm': ['G3', 'Bb3', 'D4'], 'A7': ['A3', 'C#4', 'G4'],
       'Bb': ['Bb3', 'D4', 'F4'], 'C': ['C4', 'E4', 'G4'], 'Am': ['A3', 'C4', 'E4']}
Hm = {'Dm': ['F4', 'A4', 'D5', 'A4'], 'Gm': ['G4', 'Bb4', 'D5', 'Bb4'], 'A7': ['E4', 'G4', 'C#5', 'G4'],
      'Bb': ['D4', 'F4', 'Bb4', 'F4'], 'C': ['E4', 'G4', 'C5', 'G4'], 'Am': ['C4', 'E4', 'A4', 'E4']}
RH = {'D': ['D4', 'F#4', 'A4'], 'G': ['G3', 'B3', 'D4'], 'A': ['A3', 'C#4', 'E4'], 'Bm': ['B3', 'D4', 'F#4']}
H = {'D': ['F#4', 'A4', 'D5', 'A4'], 'G': ['G4', 'B4', 'D5', 'B4'], 'A': ['A4', 'C#5', 'E5', 'C#5'], 'Bm': ['D4', 'F#4', 'B4', 'F#4']}

def hatch16(t0, chord, beats, v=.36, g=1.0, table=None):
    n = int(round(beats * 4)); TB = table or Hm[chord]
    for i in range(n):
        vv = v + (.05 if i % 4 == 0 else 0)
        pl(t0 + i * B / 4, 'violins_pizz', TB[i % 4], .16, vv, g)

def cello8(t0, notes, v=.62, g=1.0):
    for i, p in enumerate(notes):
        if p: pl(t0 + i * B / 2, 'cellos_pizz', p, .3, v, g)

def ring_ting(t, root):
    pl(t, 'violin_pizz', root, .22, .72, 1.1, exact=True, release=.06)   # staccato ting: decay clears before the rise
    pl(t, 'harpsichord', S.midi(root) - 12, .3, .35, .5, exact=True)
    cue(t, f'ring ting ({root})', 'pizz', 'high')

def rise(t0, notes, dur, v0=.5, stem='pizz'):
    # the rising line doubles on the harpsichord; its cleaner attack carries the cue
    for i, p in enumerate(notes):
        tt = t0 + dur * i / max(1, len(notes) - 1)
        pl(tt, 'violin_pizz', p, .2, v0 + .02 * i, .8, exact=True)
        pl(tt, 'harpsichord', p, .15, .34 + .02 * i, .55, exact=True)
        if i == 0: cue(tt, 'rising line', stem if False else 'harpsichord')

def land_low(t):
    pl(t, 'cellos_pizz', 'D2', .5, .85, 1.2, exact=True)
    pl(t, 'contrabass_pizz', 'D2', .5, .85, 1.1, exact=True)
    pl(t, 'harpsichord', 'D3', .3, .5, .7, exact=True)
    cue(t, 'landing: low cello + bass pizz D', 'pizz', 'low')

# ═══ 0–1.75: no music (burin foley) ═══
# pickups into the peel
pl(1.75, 'harpsichord', 'D4', .09, .6, exact=True, release=.03); cue(1.75, 'pickup 1: D4', 'harpsichord')
pl(2.05, 'harpsichord', 'F4', .09, .64, exact=True, release=.03); cue(2.05, 'pickup 2: F4 (the lift)', 'harpsichord')

# ═══ PEEL (2.73): the proof is pulled — Dm tutti accent ═══
t = PEEL
hch(t, ['D3', 'A3', 'D4', 'F4'], .5, .78, .95, strum=.008, exact=True)
pl(t, 'contrabass_pizz', 'D2', .5, .85, 1.1, exact=True)
pl(t, 'cellos_pizz', 'D3', .35, .8, 1.0, exact=True)
cue(t, 'peel: Dm tutti accent', 'pizz', 'low')
cello8(t + B / 2, ['A2', 'D3', 'F3'])
cello8(t + 2 * B, ['G2', 'Bb2', 'D3'])
hatch16(t + B / 2, 'Dm', 2, .34)

# ═══ BUILD (2.86–7.5): three passes, texture grows; TITLE flourish at 6.82 ═══
t = T(0) if False else PEEL + 2 * B
hch(t + 2 * B, RHm['Bb'], .3, .45)
hatch16(t + 2 * B, 'Bb', 2, .3)
hch(t + 4 * B, RHm['Gm'], .3, .45); hatch16(t + 4 * B, 'Gm', 2, .32)
pl(ev('pass', 'h3')['t'], 'cellos_pizz', 'A2', .35, .55, exact=True)
cue(ev('pass', 'h3')['t'], 'third pass: cello A pedal (dominant shadow)', 'pizz', 'low')
hatch16(ev('pass', 'h3')['t'], 'A7', 2, .3)
# title flourish: rising harpsichord arpeggio landing on the title
FL = ['D3', 'F3', 'A3', 'D4', 'F4', 'A4']   # last note lands before the title, so the title D5 stands alone
ft = TITLE - .55
for i, p in enumerate(FL):
    pl(ft + i * .075, 'harpsichord', p, .18, .42 + .02 * i, .9, exact=(i == 0))
cue(ft, 'title flourish (rising Dm arpeggio)', 'harpsichord')
pl(TITLE, 'harpsichord', 'D5', .35, .5, .9, exact=True)
cue(TITLE, 'title engraved: D5', 'harpsichord')

# ═══ DETAIL A (10.23, long): texture thins — cello pedal + high figure; ring/travel/land ═══
ta = DETS[0]['t']
pl(ta, 'cellos_pizz', 'D3', .45, .6, exact=True); cue(ta, 'detail A: thins to cello D pedal', 'pizz', 'low')
FIG = ['A5', 'D5', 'F5', 'A5', 'D5', 'F5']
for i in range(5): pl(ta + i * B / 2, 'harpsichord', FIG[i % 6], .2, .34, exact=(i == 0))   # stops before the rise
ring_ting(ev('ring', 0)['t'], 'A6')
RISE = ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5']
tv = ev('travel', 0); rise(tv['t'], RISE, tv['until'] - tv['t'])

land_low(ev('land', 0)['t'])
# gentle pizz bed under the rest of A
cello8(ta + 5 * B, ['Bb2', 'D3', 'F3'], v=.5)
hatch16(ta + 6 * B, 'Bb', 2, .26)

# ═══ DETAIL B (19.77): same grammar, a third higher ═══
tb = DETS[1]['t']
pl(tb, 'cellos_pizz', 'F3', .45, .55, exact=True); cue(tb, 'detail B: F pedal', 'pizz', 'low')
for i, p in enumerate(['F5', 'A5']): pl(tb + i * B / 2, 'harpsichord', p, .18, .33)   # figure stops early so the rise lands clean
ring_ting(ev('ring', 1)['t'], 'C6')
tv = ev('travel', 1); rise(tv['t'], ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'F5'], tv['until'] - tv['t'], .48)

land_low(ev('land', 1)['t'])
cello8(tb + 1.5 * B, ['Bb2', 'D3'], v=.5)

# ═══ DETAIL C (27.27): thin again ═══
tc = DETS[2]['t']
pl(tc, 'cellos_pizz', 'A2', .45, .6, exact=True); cue(tc, 'detail C: A pedal', 'pizz', 'low')
for i, p in enumerate(['E5', 'A5']): pl(tc + i * B / 2, 'harpsichord', p, .18, .33)   # stops before the rise
ring_ting(ev('ring', 2)['t'], 'A6')
tv = ev('travel', 2); rise(tv['t'], ['A4', 'B4', 'C#5', 'D5', 'E5', 'F#5', 'A5'], tv['until'] - tv['t'], .5)

land_low(ev('land', 2)['t'])

# ═══ DETAIL D (34.77): the egg — the sweetest ═══
td = DETS[3]['t']
pl(td, 'cellos_pizz', 'Bb2', .45, .58, exact=True); cue(td, 'detail D: Bb pedal (warm)', 'pizz', 'low')
for i, p in enumerate(['Bb4', 'D5']): pl(td + i * B / 2, 'harpsichord', p, .18, .33)   # stops before the rise
ring_ting(ev('ring', 3)['t'], 'D6')
tv = ev('travel', 3); rise(tv['t'], ['Bb4', 'C5', 'D5', 'F5', 'G5', 'A5'], tv['until'] - tv['t'], .5)

pl(ev('land', 3)['t'], 'cellos_pizz', 'G2', .5, .8, 1.15, exact=True)
pl(ev('land', 3)['t'], 'contrabass_pizz', 'G1', .5, .78, 1.05, exact=True)
cue(ev('land', 3)['t'], 'landing #4 on G (the egg)', 'pizz', 'low')

# ═══ GATHER (42.27): a small lift, then the silence ═══
pl(NAT, 'violins_pizz', 'Bb4', .16, .34, exact=True)
hch(NAT, ['Bb3', 'D4', 'F4', 'Bb4'], .35, .45, .9, strum=.03, exact=True)
cue(NAT, 'gentle lift into the silence', 'harpsichord')

# ═══ SILENCE (43.64–45.0) — absolute ═══
cue(SIL['t'], 'silence begins', 'harpsichord')   # gate fade is 10 ms (below one frame)
cue(SIL['until'], 'silence ends', 'harpsichord')

# ═══ THE COLOUR (45.1): FIRST BOW — D MAJOR, the amber wash ═══
CH = [  # (t, cellos, violas, vln2, vln1, contrabass)
    (45.1, 'D3', 'A3', 'F#4', 'A5', None),
    (46.6, 'B2', 'B3', 'F#4', 'B5', None),
    (48.1, 'G2', 'B3', 'G4', 'B5', 'G1'),
    (49.2, 'A2', 'C#4', 'G4', 'C#6', 'A1'),
    (50.45, 'D3', 'D4', 'F#4', 'D6', 'D2'),
]
END_BOW = 57.5
def legato(col, inst, g, v0, pan=None):
    seq = [(c[0], c[col]) for c in CH if c[col] is not None]
    merged = []
    for tt, p in seq:
        if merged and merged[-1][1] == p: continue
        merged.append((tt, p))
    for i, (tt, p) in enumerate(merged):
        t1 = merged[i + 1][0] if i + 1 < len(merged) else END_BOW
        att = .3 if tt == 45.1 else (.12 if tt == 50.45 else .3)
        bow(tt, inst, p, t1 - tt + .12, v0 + (.08 if tt >= 49 else 0), g, attack=att,
            release=2.2 if t1 == END_BOW else .35, pan=pan)
legato(1, 'cellos', 1.0, .42)
legato(2, 'violas', .8, .38)
legato(3, 'violins', .7, .36, pan=.3)
legato(4, 'violins', .8, .4, pan=-.35)
legato(5, 'contrabass', .75, .4)
cue(45.1, 'FIRST BOW: D major, pp (the wash begins)', 'bowed')
# harpsichord: sparse, high, light under the voice
for t0, ps in [(46.6, ['B4', 'D5', 'F#5', 'B5']), (48.1, ['G4', 'B4', 'D5', 'G5'])]:
    for i, p in enumerate(ps): pl(t0 + i * B / 2, 'harpsichord', p, .25, .28)
for i, p in enumerate(['A4', 'C#5', 'E5']): pl(49.2 + i * B / 4, 'harpsichord', p, .2, .3)

# ═══ LANDING (50.45): perfect cadence V–I — the finished plate ═══
for p in ['D2', 'A2', 'D3']: pl(50.45, 'harpsichord', p, 1.6, .66, 1.0, exact=True)
hch(50.45 + .014, ['F#3', 'A3', 'D4', 'F#4', 'A4', 'D5'], 1.6, .6, 1.0, strum=.014)
pl(50.45, 'contrabass_pizz', 'D2', .8, .6, .9, exact=True)
cue(50.45, 'perfect cadence V-I: the plate lands', 'harpsichord')
pl(53.0, 'violin_pizz', 'D6', .4, .46, .9, exact=True); cue(53.0, 'wink: soft violin pizz D6', 'pizz')

# ═══ END CARD (55.03): soft tonic, fade ═══
hch(TISSUE + .3, ['D4', 'A4', 'D5'], .9, .3, .7, strum=.05, exact=True)
cue(TISSUE + .3, 'end card: soft tonic, fade begins', 'harpsichord')

# ═══ mixdown: room → gates → levels ═══
ROOM = {'harpsichord': dict(size=.28, mix=.16), 'pizz': dict(size=.3, mix=.18), 'bowed': dict(size=.42, mix=.24)}
for k in STEMS: bus[k] = S.room(bus[k], damp=.55, **ROOM[k]).astype(np.float32)

def gate(a, b, fin=.012, fout=.02):
    g = np.ones(N, np.float32); ia, ib = int(a * SR), int(b * SR)
    g[ia:ib] = 0; f = int(fin * SR); g[max(0, ia - f):ia] = np.linspace(1, 0, min(f, ia))
    fo = int(fout * SR); g[ib:ib + fo] = np.minimum(g[ib:ib + fo], np.linspace(0, 1, len(g[ib:ib + fo])))
    return g
G = gate(0.0, 1.70, 0, 0) * gate(SIL['t'], SIL['until'], .005, .005)
tt_ = np.arange(N) / SR
G *= np.clip(1 - (tt_ - (DUR - 3.5)) / 2.6, 0, 1).astype(np.float32)     # natural fade, zero by DUR-0.9
for k in STEMS: bus[k] *= G[:, None]
_HP = butter(2, 35, 'high', fs=SR, output='sos')
for k in STEMS: bus[k] = sosfilt(_HP, bus[k], axis=0).astype(np.float32)

GAIN = {'harpsichord': 1.0, 'pizz': 1.0, 'bowed': 1.45}
mix = sum(bus[k] * GAIN[k] for k in STEMS)

def lufs(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, .73248077421585]
    b2, a2 = [1, -2, 1], [1, -1.99004745483398, .99007225036621]
    y = lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)
    blk, hop = int(.4 * SR), int(.1 * SR)
    ms = np.array([np.sum(np.mean(y[i:i + blk] ** 2, 0)) for i in range(0, len(y) - blk, hop)])
    L = -.691 + 10 * np.log10(ms + 1e-12); ms = ms[L > -70]
    if not len(ms): return -99
    rel = -.691 + 10 * np.log10(ms.mean()) - 10
    ms = ms[-.691 + 10 * np.log10(ms) > rel]
    return -.691 + 10 * np.log10(ms.mean())

sc = 10 ** ((-18.0 - lufs(mix)) / 20)
mix = mix * sc
CEIL = 10 ** (-1.2 / 20)
mix = np.stack([limit(mix[:, 0], CEIL), limit(mix[:, 1], CEIL)], 1).astype(np.float32)
mix = np.clip(mix, -CEIL, CEIL)[:N]
sf.write(os.path.join(MOUT, 'score.wav'), mix, SR, subtype='PCM_24')
for k in STEMS: sf.write(os.path.join(MOUT, 'stems', k + '.wav'), np.clip(bus[k] * GAIN[k] * sc, -1, 1).astype(np.float32), SR, subtype='PCM_24')
json.dump(sorted(CUES, key=lambda c: c['t']), open(os.path.join(MOUT, 'cues.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(MOUT, 'CREDITS_music.txt'), 'w').write(
    'Original score for "The Ostrich, Plate XII" (Opuscar Studio rebuild of ostrich-plate), composed in code (music/score_ostrich.py).\n'
    'Instruments: harpsichord; violin, violins, violas, cellos, contrabass (pizzicato and arco).\n'
    '88 BPM; D minor for the engraving, D major with the first bowed notes at the hand-colouring.\n'
    + '\n'.join(S.credits(sorted(USED))) + '\n')

# ═══ timing verification ═══
TOL = .042
def onset_near(x, t, win=.06):
    m = x.mean(1) if x.ndim == 2 else x
    hop = int(.001 * SR); w = int(.004 * SR)
    a = int((t - win) * SR); b = int((t + .12) * SR)
    A = np.array([np.sqrt(np.mean(m[i:i + w] ** 2)) for i in range(a, b, hop)])
    ts = (np.arange(len(A)) * hop + a + w / 2) / SR
    k0 = int(np.argmax(A)); lo_i = int(np.argmin(A[:k0 + 1])); lo, hi = A[lo_i], A[k0]
    k = lo_i + int(np.argmax(A[lo_i:k0 + 1] >= lo + .3 * (hi - lo)))
    return float(ts[k]), float(20 * np.log10(hi / max(lo, 1e-9)))

lines = ['Timing check (tol ±0.042 s = 1 frame @24fps)', '']
allok = True
for c in sorted(CUES, key=lambda c: c['t']):
    if 'silence' in c['what']:
        c['got'] = c['t']; lines.append(f'GATE {c["t"]:7.4f}s  (verified by peak level below)  {c["what"]}'); continue
    x = bus[c['stem']]
    if c['stem'] == 'bowed':
        m = np.abs(x.mean(1)); i = int(np.argmax(m > 1e-5)); got = i / SR; rise = 0.0
    else:
        if c.get('band') == 'low': x = sosfilt(butter(4, 300, 'low', fs=SR, output='sos'), x, axis=0)
        if c.get('band') == 'high': x = sosfilt(butter(4, 2000, 'high', fs=SR, output='sos'), x, axis=0)
        got, rise = onset_near(x, c['t'])
    err = got - c['t']; ok = abs(err) <= TOL; allok &= ok
    c['got'] = got
    lines.append(f"{'OK ' if ok else 'BAD'} {c['t']:7.4f}s  got {got:7.4f}s  err {err*1000:+6.1f} ms  (rise {rise:4.1f} dB)  {c['what']}")
def rms_db(a, b): s = mix[int(a * SR):int(b * SR)]; return 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-12)
bw = np.abs(bus['bowed'].mean(1)); first_bow = int(np.argmax(bw > 1e-5)) / SR
sil_pk = 20 * np.log10(np.abs(mix[int((SIL['t'] + .1) * SR):int((SIL['until'] - .1) * SR)]).max() + 1e-12)
lines += ['', f'Silence 0.0–1.70 s: peak {20 * np.log10(np.abs(mix[:int(1.7 * SR)]).max() + 1e-12):.1f} dBFS',
          f'Picture silence {SIL["t"]:.2f}–{SIL["until"]:.2f} s: peak {sil_pk:.1f} dBFS',
          f'First bowed sample above -100 dB at {first_bow:.4f} s (target {45.1})',
          f'Mix: {len(mix) / SR:.3f} s, peak {20 * np.log10(np.abs(mix).max()):.2f} dBFS, integrated {lufs(mix):.1f} LUFS',
          '', 'ALL CUES WITHIN TOLERANCE' if allok else 'SOME CUES OUT OF TOLERANCE']
rep = '\n'.join(lines); print(rep)
open(os.path.join(MOUT, 'timing_report.txt'), 'w').write(rep + '\n')
