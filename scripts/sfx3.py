# SFX v3 (23/11/2026) – hiệu ứng "đặc sắc" hơn cho video khuyến mãi: tự tổng hợp, không bản quyền
# python3 sfx3.py /root/bb/sfx
import numpy as np, wave, sys, os
SR = 48000
out = sys.argv[1] if len(sys.argv) > 1 else '/root/bb/sfx'
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)
T = lambda d: np.arange(int(d * SR)) / SR

def save(name, x, stereo_w=0.0):
    x = np.asarray(x, np.float32)
    if x.ndim == 1:
        d = int(0.011 * SR)
        r = np.concatenate([np.zeros(d), x[:-d]]) if stereo_w > 0 else x
        x = np.stack([x * (1 - stereo_w * .3) + r * stereo_w * .3, x * (1 - stereo_w * .3) + np.roll(r, 7) * stereo_w * .3], 1)
    x = x / (np.abs(x).max() + 1e-9) * 0.89
    with wave.open(f'{out}/{name}.wav', 'w') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def env(n, a=0.005, r=0.3, d=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
    return e
def lp(x, k):
    c = np.ones(k) / k; return np.convolve(x, c, 'same')
def reverb(x, t=1.2, mix=0.3):
    n = int(t * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (t / 5)); ir = lp(ir, 6)
    y = np.convolve(x, ir); y = np.pad(y, (0, len(x) + n - len(y)))[:len(x) + n]; y = y / (np.abs(y).max() + 1e-9)
    xx = np.concatenate([x, np.zeros(n)])
    return xx * (1 - mix) + y * mix * np.abs(x).max()

# 1. boom_reveal: hút ngược (reverse cymbal) 0.7s -> sub boom + sparkle  (mở ảnh quầy)
t = T(0.7); nz = lp(rng.standard_normal(len(t)), 3) * (t / 0.7) ** 3
sw = np.sin(2 * np.pi * (300 + 2600 * (t / .7) ** 2) * t) * 0.15 * (t / .7) ** 2
pre = nz * 0.6 + sw
tb = T(1.4); boom = np.sin(2 * np.pi * (90 * np.exp(-tb * 5) + 42) * tb) * env(len(tb), 0.002, 0.45)
click = rng.standard_normal(len(tb)) * env(len(tb), 0.0005, 0.012) * 0.6
spark = sum(np.sin(2 * np.pi * f * tb) * env(len(tb), 0.003, 0.35) * 0.12 for f in (2637, 3136, 3951))
save('boom_reveal', reverb(np.concatenate([pre, boom + click + spark]), 1.0, 0.25), 0.8)

# 2. drumroll 1.6s -> crash (bốc thăm)
t = T(1.6); dr = np.zeros(len(t))
for k in range(int(1.6 * 28)):
    i = int(k / 28 * SR); n = min(2400, len(t) - i)
    dr[i:i + n] += rng.standard_normal(n) * env(n, 0.0005, 0.03) * (0.35 + 0.65 * k / 45)
dr = lp(dr, 4)
tc = T(1.3); crash = lp(rng.standard_normal(len(tc)), 2) * env(len(tc), 0.001, 0.4) + np.sin(2 * np.pi * 60 * tc) * env(len(tc), 0.002, 0.15)
save('drumroll_crash', np.concatenate([dr, crash * 1.4]), 0.9)

# 3. jingle: chuông lắc (holiday)
t = T(1.2); x = np.zeros(len(t))
for k in range(9):
    i = int((k * 0.11 + rng.uniform(0, .02)) * SR); n = len(t) - i; tt = np.arange(n) / SR
    for f in (5200, 6900, 8300): x[i:] += np.sin(2 * np.pi * (f + rng.uniform(-200, 200)) * tt) * np.exp(-tt / 0.08) * 0.2
    x[i:] += rng.standard_normal(n) * np.exp(-tt / 0.01) * 0.15
save('jingle', reverb(x, 0.8, 0.3), 1.0)

# 4. swish_ticker: lướt băng chữ = whoosh ngắn + click + tick-tick
t = T(0.45); w = lp(rng.standard_normal(len(t)), 8) * np.sin(np.pi * t / .45) ** 2
tk = np.zeros(len(t))
for k in range(4):
    i = int((0.2 + k * 0.05) * SR); n = min(600, len(t) - i); tk[i:i + n] += np.sin(2 * np.pi * 3200 * np.arange(n) / SR) * env(n, 0.0003, 0.004)
save('swish_ticker', w * 0.8 + tk * 0.5, 0.7)

# 5. pluck_1..4: nốt pluck vui (marimba) cho nhãn sản phẩm – đổi cao độ để không lặp
for i, f in enumerate([784, 988, 1175, 1319]):
    t = T(0.6); x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.03)) * env(len(t), 0.001, 0.12)
    save(f'pluck_{i + 1}', reverb(x, 0.5, 0.2), 0.6)

# 6. price_slam: giá giảm đập xuống (whoosh xuống + thud + kaching nhẹ)
t = T(0.25); wd = lp(rng.standard_normal(len(t)), 5) * (t / .25) ** 2 * 0.5
tb = T(0.9); thud = np.sin(2 * np.pi * (140 * np.exp(-tb * 12) + 55) * tb) * env(len(tb), 0.001, 0.18)
bell = sum(np.sin(2 * np.pi * f * tb) * env(len(tb), 0.002, 0.25) * a for f, a in ((2093, .25), (2637, .2), (3136, .15)))
save('price_slam', np.concatenate([wd, thud + bell * np.where(tb > 0.05, 1, 0)]), 0.6)

# 7. tada_short: hợp âm vui khi lộ kết quả
t = T(1.4); x = np.zeros(len(t))
for k, f in enumerate([523, 659, 784, 1047]):
    i = int(k * 0.045 * SR); tt = np.arange(len(t) - i) / SR
    x[i:] += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt / 0.5) * 0.3
save('tada_short', reverb(x, 0.9, 0.25), 0.9)

# 8. bubble_seq: chuỗi pop lên dần (khi nhiều chữ hiện)
t = T(0.5); x = np.zeros(len(t))
for k in range(5):
    i = int(k * 0.07 * SR); n = int(0.06 * SR); tt = np.arange(n) / SR
    x[i:i + n] += np.sin(2 * np.pi * (500 + k * 180 + 1400 * tt / 0.06) * tt) * env(n, 0.001, 0.02)
save('bubble_seq', x, 0.6)
print('sfx3 ok')
