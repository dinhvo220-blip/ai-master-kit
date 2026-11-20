"""Trộn giọng AI + nhạc nền tự tổng hợp (pad + piano nhẹ, không bản quyền) + SFX cho video kể chuyện.
python3 mix_story.py <story_dir> <sfx_dir> <out.wav>"""
import sys, json, wave
import numpy as np
SD, SFXD, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
NOVOICE = len(sys.argv) > 4 and sys.argv[4] == 'novoice'
SR = 48000
def rd(fn):
    w = wave.open(fn); n = w.getnchannels(); sr = w.getframerate(); sw = w.getsampwidth()
    a = np.frombuffer(w.readframes(w.getnframes()), dtype={2: np.int16, 4: np.int32}[sw]).astype(np.float32)
    a /= 32768 if sw == 2 else 2 ** 31
    a = a.reshape(-1, n)
    if n == 1: a = np.repeat(a, 2, 1)
    if sr != SR:
        x = np.arange(0, len(a), sr / SR); a = np.stack([np.interp(x, np.arange(len(a)), a[:, c]) for c in range(2)], 1)
    return a
v = rd(f'{SD}/voice.wav'); N = len(v)
t = np.arange(N) / SR
# ---- music: pad chords + soft piano arpeggio (D major, 72 bpm feel) ----
def note(m): return 440 * 2 ** ((m - 69) / 12)
chords = [[50, 57, 62, 66, 69], [47, 54, 62, 66, 69], [43, 55, 59, 62, 66], [45, 52, 57, 61, 64]]  # Dmaj7 Bm7 Gmaj7 A
BAR = 4.0
mus = np.zeros((N, 2), np.float32)
for bi in range(int(N / SR / BAR) + 2):
    ch = chords[bi % 4]; s0 = int(bi * BAR * SR); L = int((BAR + 1.5) * SR)
    if s0 >= N: break
    tt = np.arange(L) / SR
    env = np.minimum(1, tt / 1.2) * np.minimum(1, np.maximum(0, (BAR + 1.5 - tt) / 1.5))
    sig = np.zeros(L)
    for k, m in enumerate(ch):
        fq = note(m)
        sig += (np.sin(2 * np.pi * fq * tt) + 0.3 * np.sin(2 * np.pi * fq * 2.003 * tt) + 0.12 * np.sin(2 * np.pi * fq * 3.01 * tt)) * (0.9 if k else 0.6)
    sig *= env * 0.05
    e = min(N, s0 + L); seg = sig[:e - s0]
    mus[s0:e, 0] += seg; mus[s0:e, 1] += seg * 0.92
    # piano arp: 8th notes over chord, high octave
    for j in range(8):
        if (bi * 8 + j) % 3 == 2: continue
        m = ch[[1, 2, 3, 4, 3, 2, 4, 3][j]] + 12
        ps = s0 + int(j * BAR / 8 * SR); PL = int(1.8 * SR)
        pt = np.arange(PL) / SR; fq = note(m)
        p = (np.sin(2 * np.pi * fq * pt) + 0.4 * np.sin(2 * np.pi * 2 * fq * pt) * np.exp(-pt * 4) + 0.15 * np.sin(2 * np.pi * 3 * fq * pt) * np.exp(-pt * 6)) * np.exp(-pt * 2.6) * np.minimum(1, pt / 0.004) * 0.035
        e2 = min(N, ps + PL)
        if ps >= N: continue
        pan = 0.35 + 0.3 * (j % 2)
        mus[ps:e2, 0] += p[:e2 - ps] * (1 - pan) * 2; mus[ps:e2, 1] += p[:e2 - ps] * pan * 2
# simple reverb-ish smear on music
for d, g in [(0.083, 0.35), (0.131, 0.25), (0.197, 0.18)]:
    k = int(d * SR); mus[k:, 0] += mus[:-k, 1] * g; mus[k:, 1] += mus[:-k, 0] * g
fade = np.minimum(1, t / 1.5) * np.minimum(1, (t[-1] - t) / 2.0)
mus *= fade[:, None]
# ducking under voice
venv = np.abs(v[:, 0]); win = int(0.25 * SR)
venv = np.convolve(venv, np.ones(win) / win, 'same')
duck = np.where(venv > 0.01, 0.42, 1.0) if not NOVOICE else np.full(len(venv), 0.6)
duck = np.convolve(duck, np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same')
mus *= duck[:, None]
mus *= 10 ** (-3 / 20) / max(1e-6, np.sqrt(np.mean(mus ** 2))) * 0.05  # music rms ≈ -29 dBFS before duck
# ---- sfx ----
LV = {'whoosh_soft': -16, 'whoosh_deep': -15, 'ding_luxury': -17, 'pop_soft': -19, 'tick': -20, 'hit_soft': -15, 'stamp': -12,
      'glass_clink': -17, 'sparkle_long': -18, 'shimmer': -18, 'magic_reveal': -16, 'pop_bubble': -17, 'success_arp': -14}
fx = np.zeros((N, 2), np.float32)
cache = {}
for name, tm in json.load(open(f'{SD}/sfx.json')):
    if name not in cache: cache[name] = rd(f'{SFXD}/{name}.wav')
    a = cache[name] * 10 ** (LV.get(name, -16) / 20) / max(1e-6, np.max(np.abs(cache[name])))
    i = int(max(0, tm) * SR); e = min(N, i + len(a))
    if i < N: fx[i:e] += a[:e - i]
mixed = (0 if NOVOICE else v) + mus + fx
mixed /= max(1.0, np.max(np.abs(mixed)) / 0.95)
w = wave.open(OUT, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mixed * 32767).astype(np.int16).tobytes()); w.close()
print('ok', N / SR)
