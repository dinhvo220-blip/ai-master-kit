"""SFX v2 – bộ âm thanh tổng hợp (tự tạo bằng code, không bản quyền, dùng thương mại thoải mái).
Chạy: python3 sfx2.py [thư_mục_ra]   (mặc định ../sfx cạnh script)
Ra: WAV 48 kHz, 16-bit, stereo, đỉnh -1 dBFS, cắt sạch khoảng lặng cuối.
"""
import sys, os, wave
import numpy as np
from scipy.signal import lfilter, butter, sosfilt, fftconvolve

SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sfx')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def t(d): return np.arange(int(SR * d)) / SR
def noise(n): return rng.standard_normal(n)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def lpf(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)

def sweep_lp(x, f0, f1):
    """Lọc thấp một cực với tần số cắt quét từ f0 -> f1 (mảng hoặc số)."""
    fc = np.broadcast_to(np.asarray(f0) + (np.asarray(f1) - np.asarray(f0)) * np.linspace(0, 1, len(x)), x.shape) if np.isscalar(f1) else f1
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); p = 0.0
    for i in range(len(x)):
        p += a[i] * (x[i] - p); y[i] = p
    return y

def osc(f, tt, kind='sin'):
    ph = 2 * np.pi * np.cumsum(np.broadcast_to(f, tt.shape)) / SR
    return np.sin(ph) if kind == 'sin' else np.sign(np.sin(ph))

def reverb(x, dur=1.2, mix=0.25, damp=6000):
    """Reverb stereo: IR nhiễu giảm dần, hai kênh khác nhau để có độ rộng."""
    n = int(SR * dur); tt = np.arange(n) / SR
    out = []
    for ch in range(2):
        ir = lpf(noise(n), damp) * np.exp(-tt * 6.9 / dur)
        ir[:int(SR * 0.012)] = 0
        wet = np.pad(fftconvolve(x, ir), (0, 1))[:len(x) + n]
        wet /= np.abs(wet).max() + 1e-9
        dry = np.pad(x, (0, n)) / (np.abs(x).max() + 1e-9)
        out.append(dry * (1 - mix) + wet * mix)
    return np.stack(out, 1)

def stereo(x, width=0.0):
    if x.ndim == 2: return x
    if width <= 0: return np.stack([x, x], 1)
    d = int(SR * 0.0004 * width * 10)
    return np.stack([x, np.concatenate([np.zeros(d), x[:-d]]) if d else x], 1)

def save(name, x, rev=None, width=0.0):
    x = np.asarray(x, float)
    x = reverb(x, **rev) if rev else stereo(x, width)
    # cắt đuôi lặng (< -60 dB) + fade 5 ms
    a = np.abs(x).max(1); thr = a.max() * 1e-3
    end = np.nonzero(a > thr)[0][-1] + int(SR * 0.01)
    x = x[:end]
    f = min(int(SR * 0.005), len(x) // 4); x[-f:] *= np.linspace(1, 0, f)[:, None]
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (-1 / 20)
    y = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name + '.wav'), 'w') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
    print(f'{name:18s} {len(y)/SR:5.2f}s')

def bell(tt, f0, partials=((1, 1, 3), (2.76, .5, 5), (5.4, .25, 8), (8.93, .12, 11)), detune=1.0):
    return sum(a * np.sin(2 * np.pi * f0 * r * detune * tt) * np.exp(-tt * k) for r, a, k in partials)

def env_ar(tt, att, dec):
    return np.minimum(tt / att, 1) * np.exp(-np.maximum(tt - att, 0) * dec)

# ---------- CHUYỂN CẢNH ----------
d = 0.7; tt = t(d); e = np.sin(np.pi * tt / d) ** 2
save('whoosh_soft', sweep_lp(noise(len(tt)), 0, 400 + 2600 * np.sin(np.pi * tt / d) ** 2) * e, width=1)
d = 0.32; tt = t(d); e = np.sin(np.pi * tt / d) ** 3
save('whoosh_fast', sweep_lp(noise(len(tt)), 0, 800 + 6000 * np.sin(np.pi * tt / d) ** 2) * e, width=1)
d = 0.9; tt = t(d); e = np.sin(np.pi * tt / d) ** 2
x = sweep_lp(noise(len(tt)), 0, 150 + 1200 * np.sin(np.pi * tt / d) ** 2) * e + 0.5 * osc(55 + 40 * e, tt) * e
save('whoosh_deep', x, width=1)
d = 0.6; tt = t(d); e = (tt / d) ** 2 * (tt < d * 0.92) + 0.0
x = sweep_lp(noise(len(tt)), 0, 300 + 7000 * (tt / d) ** 2) * (tt / d) ** 1.5 * np.exp(-np.maximum(tt - 0.55, 0) * 60)
save('swoosh_up', x, width=1)
d = 1.6; tt = t(d)
x = (sweep_lp(noise(len(tt)), 0, 200 + 6000 * (tt / d) ** 3) * 0.8 + 0.25 * osc(200 + 900 * (tt / d) ** 2, tt)) * (tt / d) ** 2.5
save('riser_long', x, rev=dict(dur=0.8, mix=0.2))
# tape stop / rewind nhẹ
d = 0.5; tt = t(d); f = 600 * (1 - tt / d) ** 2 + 40
save('tape_stop', osc(f, tt) * 0.6 * (1 - tt / d) + bp(noise(len(tt)), 300, 2000) * 0.1 * (1 - tt / d))

# ---------- HIỆN CHỮ / UI ----------
d = 0.1; tt = t(d)
save('pop_soft', osc(500 * np.exp(-tt * 30) + 220, tt) * np.exp(-tt * 45))
d = 0.15; tt = t(d)
save('pop_bubble', osc(300 + 1400 * (1 - np.exp(-tt * 60)), tt) * env_ar(tt, 0.004, 35))
d = 0.06; tt = t(d)
save('tick', bp(noise(len(tt)), 2500, 7000) * np.exp(-tt * 180) + 0.5 * np.sin(2 * np.pi * 3200 * tt) * np.exp(-tt * 220))
# gõ phím: chuỗi 9 tiếng
d = 1.3; tt = t(d); x = np.zeros_like(tt)
for i, s in enumerate(np.cumsum(rng.uniform(0.09, 0.16, 9))):
    m = tt >= s; u = tt[m] - s
    x[m] += (bp(noise(m.sum()), 1500, 6000) * np.exp(-u * 250) + 0.3 * np.sin(2 * np.pi * rng.uniform(180, 260) * u) * np.exp(-u * 120)) * rng.uniform(.6, 1)
save('typing', x)
d = 0.25; tt = t(d)
x = np.zeros_like(tt)
for s, f in [(0, 1200), (0.06, 1600)]:
    m = tt >= s; u = tt[m] - s; x[m] += np.sin(2 * np.pi * f * u) * np.exp(-u * 40)
save('ui_toggle', x)

# ---------- LUXURY / SẢN PHẨM ----------
d = 2.5; tt = t(d)
save('ding_luxury', bell(tt, 1318.5) + 0.6 * bell(tt, 1975.5, detune=1.002), rev=dict(dur=1.8, mix=0.35))
d = 1.8; tt = t(d); x = np.zeros_like(tt)
for s, f in [(0, 1046.5), (0.14, 1568)]:
    m = tt >= s; x[m] += bell(tt[m] - s, f)
save('chime_double', x, rev=dict(dur=1.4, mix=0.3))
d = 2.0; tt = t(d); x = np.zeros_like(tt)
for s, f in [(0, 1046.5), (0.1, 1318.5), (0.2, 1568), (0.3, 2093)]:
    m = tt >= s; x[m] += bell(tt[m] - s, f) * 0.8
save('success_arp', x, rev=dict(dur=1.5, mix=0.3))
d = 2.2; tt = t(d); x = np.zeros_like(tt)
for i in range(40):
    s = rng.uniform(0, 1.3) * (i / 40) ** 0.7 + 0.02; f = rng.uniform(3000, 9000); m = tt >= s; u = tt[m] - s
    x[m] += np.sin(2 * np.pi * f * u) * np.exp(-u * rng.uniform(10, 25)) * rng.uniform(.2, 1)
x += hp(noise(len(tt)), 7000) * 0.04 * np.sin(np.pi * np.clip(tt / 1.6, 0, 1))
save('sparkle_long', x, rev=dict(dur=1.2, mix=0.35, damp=10000))
d = 1.0; tt = t(d); x = np.zeros_like(tt)
for i in range(18):
    s = rng.uniform(0, 0.4); f = rng.uniform(4000, 10000); m = tt >= s; u = tt[m] - s
    x[m] += np.sin(2 * np.pi * f * u) * np.exp(-u * 30) * rng.uniform(.3, 1)
save('glitter', x, rev=dict(dur=0.7, mix=0.3, damp=10000))
# cụng ly thủy tinh / chạm chai nước hoa
d = 1.8; tt = t(d)
x = bell(tt, 2637, partials=((1, 1, 3.5), (2.32, .6, 5), (3.9, .3, 7), (5.6, .15, 9))) + 0.6 * bell(tt, 2690, partials=((1, 1, 4), (2.4, .4, 6)))
x[:int(SR * 0.003)] += noise(int(SR * 0.003)) * 2
save('glass_clink', x, rev=dict(dur=1.0, mix=0.25, damp=12000))
# xịt nước hoa
d = 0.75; tt = t(d)
x = hp(bp(noise(len(tt)), 3000, 14000), 2500) * env_ar(tt, 0.015, 1.2) * (tt < 0.62) + 0
x = x * np.where(tt > 0.6, np.exp(-(tt - 0.6) * 40), 1)
save('perfume_spray', x, width=1)
d = 1.6; tt = t(d)
x = (sweep_lp(noise(len(tt)), 0, 300 + 5000 * (tt / 0.8).clip(0, 1) ** 2) * (tt / 0.8).clip(0, 1) ** 2 * np.exp(-np.maximum(tt - 0.8, 0) * 30))
y = np.zeros_like(tt); m = tt >= 0.8; u = tt[m] - 0.8
y[m] = bell(u, 1568) + 0.5 * bell(u, 2349)
save('magic_reveal', x * 0.7 + y, rev=dict(dur=1.6, mix=0.3))
# shutter máy ảnh
d = 0.25; tt = t(d); x = np.zeros_like(tt)
for s, a in [(0, 1), (0.075, .7)]:
    m = tt >= s; u = tt[m] - s
    x[m] += a * (bp(noise(m.sum()), 1000, 8000) * np.exp(-u * 90) + 0.4 * np.sin(2 * np.pi * 180 * u) * np.exp(-u * 70))
save('camera_shutter', x)

# ---------- GIÁ / KHUYẾN MÃI ----------
d = 1.6; tt = t(d); x = np.zeros_like(tt)
m = tt >= 0; x += 0.7 * (bp(noise(len(tt)), 800, 5000) * np.exp(-tt * 60))          # cơ cấu ngăn kéo
for i in range(10):                                                                      # leng keng xu
    s = 0.12 + rng.uniform(0, 0.25); m = tt >= s; u = tt[m] - s
    x[m] += bell(u, rng.uniform(3500, 6000), partials=((1, 1, 18), (2.7, .4, 25))) * rng.uniform(.2, .5)
m = tt >= 0.08; u = tt[m] - 0.08
x[m] += bell(u, 2093) * 0.9 + bell(u, 2637) * 0.6                                       # chuông ka-ching
save('cash_kaching', x, rev=dict(dur=0.9, mix=0.2))
d = 0.6; tt = t(d)
save('coin', bell(tt, 1975, partials=((1, 1, 6), (1.5, .8, 6))) * (tt > 0.07) * 0 + np.where(tt < 0.07, bell(tt, 987, partials=((1, 1, 8),)), bell(np.maximum(tt - 0.07, 0), 1975, partials=((1, 1, 6), (3, .3, 10)))))
d = 0.5; tt = t(d)
save('price_drop', osc(1800 * np.exp(-tt * 5) + 200, tt) * 0.5 * env_ar(tt, 0.01, 4) + bp(noise(len(tt)), 400, 3000) * 0.1 * np.exp(-tt * 8))
d = 0.3; tt = t(d)
save('countdown_beep', np.sin(2 * np.pi * 1000 * tt) * env_ar(tt, 0.003, 12) * (tt < 0.18))

# ---------- NHẤN MẠNH ----------
d = 1.4; tt = t(d)
save('bass_drop', osc(30 + 90 * np.exp(-tt * 6), tt) * env_ar(tt, 0.005, 2.5) + lpf(noise(len(tt)), 300) * 0.3 * np.exp(-tt * 12))
d = 0.5; tt = t(d)
save('hit_soft', osc(70 + 80 * np.exp(-tt * 30), tt) * np.exp(-tt * 9) + bp(noise(len(tt)), 200, 2500) * 0.35 * np.exp(-tt * 35), rev=dict(dur=0.6, mix=0.15))
d = 0.25; tt = t(d)
save('punch', osc(90 + 200 * np.exp(-tt * 50), tt) * np.exp(-tt * 18) + bp(noise(len(tt)), 500, 5000) * 0.6 * np.exp(-tt * 60))
d = 1.2; tt = t(d); x = np.zeros_like(tt)
for s in [0, 0.22]:
    m = tt >= s; u = tt[m] - s; x[m] += osc(48 + 20 * np.exp(-u * 40), u) * np.exp(-u * 14)
save('heartbeat', lpf(x, 200))
d = 0.35; tt = t(d)
save('glitch', lpf(np.sign(np.sin(2 * np.pi * np.repeat(rng.uniform(80, 2000, 12), len(tt) // 12 + 1)[:len(tt)] * tt)) * 0.4 * (rng.random(len(tt)) > 0.02) * np.repeat(rng.random(12) > 0.3, len(tt) // 12 + 1)[:len(tt)], 5000) * 0.6)
d = 0.45; tt = t(d)
save('record_scratch', bp(noise(len(tt)), 300, 4000) * (0.5 + 0.5 * np.sin(2 * np.pi * (6 + 20 * tt) * tt)) * env_ar(tt, 0.01, 6))
print('done ->', os.path.abspath(OUT))
