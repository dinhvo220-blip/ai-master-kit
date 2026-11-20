"""Burberry Beauty – video kể chuyện (voice AI + ảnh chính hãng burberry.com), 21/11/2026.
Tạo remotion/src/story/story.json + voice.wav. Chạy: python3 data_story_burberry.py <thư mục vseg> <out_dir>
"""
import sys, json, re, wave, glob, os
import numpy as np
sys.path.insert(0, '/home/claude/tts')
from lines2 import L

VSEG = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/tts/vseg'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/ai-master-kit/remotion/src/story'
os.makedirs(OUT, exist_ok=True)
FPS = 30
SR = 48000
GAP = 0.32
BIG_GAP = {'s1856': 0.7, 'check': 0.6, 'bridge': 0.7, 'hero': 0.5, 'goddess': 0.6, 'her': 0.6, 'prorsum': 0.8, 'outro': 0.7, 'cta': 0.45}
START = 0.35

files = sorted(glob.glob(f'{VSEG}/*.wav'))
assert len(files) == len(L)
t = START
voice = []
lines = []
for (k, d, txt), fn in zip(L, files):
    t += BIG_GAP.get(k, GAP) if lines else 0
    w = wave.open(fn); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    # trim leading/trailing silence
    env = np.abs(a) > 0.01
    i0 = max(0, np.argmax(env) - int(0.03 * SR)); i1 = len(a) - max(0, np.argmax(env[::-1]) - int(0.08 * SR))
    a = a[i0:i1]
    dur = len(a) / SR
    voice.append((t, a))
    # word timings: weight by length + pause after punctuation
    words = txt.split()
    wts = [len(re.sub(r'[^\w]', '', x)) + 2 + (5 if re.search(r'[,.:?!]$', x) else 0) for x in words]
    tot = sum(wts); acc = 0; wl = []
    for x, wt in zip(words, wts):
        s = t + dur * acc / tot; acc += wt; e = t + dur * acc / tot
        wl.append({'w': x, 's': round(s, 3), 'e': round(e, 3)})
    lines.append({'k': k, 's': round(t, 3), 'e': round(t + dur, 3), 'words': wl})
    t += dur
END = t + 2.6  # end card
frames = int(round(END * FPS))

# voice track
buf = np.zeros(int(END * SR) + SR, np.float32)
for s, a in voice:
    i = int(s * SR); buf[i:i + len(a)] += a
buf = buf[:int(END * SR)]
wave_out = wave.open(f'{OUT}/voice.wav', 'wb'); wave_out.setnchannels(1); wave_out.setsampwidth(2); wave_out.setframerate(SR)
wave_out.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes()); wave_out.close()

# subtitle chunks: split at punctuation or 7 words
subs = []
for ln in lines:
    cur = []
    for i, w in enumerate(ln['words']):
        cur.append(w)
        if re.search(r'[,.:?!]$', w['w']) and len(cur) >= 3 or len(cur) >= 7:
            subs.append(cur); cur = []
    if cur:
        if len(cur) <= 2 and subs and subs[-1][0]['s'] >= ln['s']: subs[-1] += cur
        else: subs.append(cur)
subs = [{'s': c[0]['s'], 'e': c[-1]['e'], 'words': c} for c in subs]
for i in range(len(subs) - 1):  # hold until next if gap small
    if subs[i + 1]['s'] - subs[i]['e'] < 0.5: subs[i]['e'] = subs[i + 1]['s']
for s in subs:
    s['e'] = round(s['e'] + 0.15, 3)

LN = {l['k']: l for l in lines}
def at(k, word=None, n=1, off=0.0):
    """time when `word` (n-th occurrence, lowercase prefix) is spoken in line k"""
    ln = LN[k]
    if word is None: return round(ln['s'] + off, 3)
    c = 0
    for w in ln['words']:
        if re.sub(r'[^\w]', '', w['w'].lower()).startswith(word.lower()):
            c += 1
            if c == n: return round(w['s'] + off, 3)
    raise KeyError((k, word))

def nxt(k):
    ks = [l['k'] for l in lines]
    i = ks.index(k)
    return lines[i + 1]['s'] if i + 1 < len(lines) else END
P = 'bb/'
SRC = 'Ảnh: burberry.com'
# ---------- scenes ----------
S = []
def scene(k_from, k_to, **kw):
    s = LN[k_from]['s'] - (0.25 if k_from != 'hook' else LN[k_from]['s'])
    e = nxt(k_to) - 0.25 if k_to != 'cta' else END
    S.append({'s': round(s, 3), 'e': round(e, 3), **kw})

scene('hook', 'hook', chapter='', kicker='BURBERRY BEAUTY', title='Áo mưa\n& nước hoa?', size=96,
      cards=[{'img': P + '06_trench_1914.jpg', 'x': 315, 'y': 960, 'w': 380, 'h': 673, 'rot': -4, 'd': at('hook', 'áo')},
             {'img': P + '08_goddess_family.jpg', 'x': 655, 'y': 1000, 'w': 400, 'h': 533, 'rot': 4, 'd': at('hook', 'nước')}],
      sfx=[('whoosh_deep', at('hook')), ('ding_luxury', at('hook', 'nước'))])
scene('hook2', 'hook2', kicker='XEM HẾT ĐỂ HIỂU', title='Burberry\nBeauty', size=104,
      cards=[{'img': P + '11_prorsum_collection.jpg', 'x': 480, 'y': 990, 'w': 540, 'h': 674, 'd': at('hook2')}],
      pill={'text': '170 NĂM DI SẢN ANH QUỐC', 'd': at('hook2', 'burberry')},
      sfx=[('whoosh_soft', at('hook2')), ('sparkle_long', at('hook2', 'burberry'))])
scene('s1856', 's1856', chapter='I · KHỞI NGUỒN', kicker='NGƯỜI SÁNG LẬP', title='Thomas Burberry', size=74,
      cards=[{'img': P + '01_founder_1856.jpg', 'x': 480, 'y': 950, 'w': 520, 'h': 650, 'd': at('s1856')}],
      badge={'text': '1856', 'x': 740, 'y': 660, 'd': at('s1856', '1856')},
      labels=[{'text': '21 TUỔI', 'x': 250, 'y': 1180, 'd': at('s1856', '21')},
              {'text': 'BASINGSTOKE · ANH', 'x': 480, 'y': 1300, 'd': at('s1856', 'basingstoke'), 'pin': True}],
      sfx=[('whoosh_deep', at('s1856', off=-0.3)), ('ding_luxury', at('s1856', '1856')), ('pop_soft', at('s1856', '21')), ('pop_soft', at('s1856', 'basingstoke'))])
scene('s1879', 's1879', chapter='I · KHỞI NGUỒN', kicker='MỤC TIÊU CỦA ÔNG', title='Chống lại\nthời tiết Anh', size=84, rain=True,
      sfx=[('whoosh_soft', at('s1879', off=-0.2))])
scene('s1879b', 's1879b', chapter='I · KHỞI NGUỒN', kicker='PHÁT MINH', title='Gabardine', size=100,
      cards=[{'img': P + '02_gabardine_1879.jpg', 'x': 480, 'y': 940, 'w': 520, 'h': 650, 'd': at('s1879b')}],
      badge={'text': '1879', 'x': 740, 'y': 650, 'd': at('s1879b', '1879')},
      checks=[{'text': 'Thoáng khí', 'd': at('s1879b', 'thoáng')}, {'text': 'Chống chọi thời tiết', 'd': at('s1879b', 'chống')}],
      sfx=[('whoosh_soft', at('s1879b', off=-0.2)), ('ding_luxury', at('s1879b', '1879')), ('tick', at('s1879b', 'thoáng')), ('tick', at('s1879b', 'chống'))])
scene('trench', 'trench', chapter='I · KHỞI NGUỒN', kicker='RA ĐỜI TỪ GABARDINE', title='Trench Coat', size=92,
      cards=[{'img': P + '06_trench_1914.jpg', 'x': 480, 'y': 960, 'w': 420, 'h': 744, 'd': at('trench')}],
      sfx=[('whoosh_soft', at('trench', off=-0.2)), ('hit_soft', at('trench', 'huyền'))])
scene('check', 'check', chapter='II · DI SẢN', kicker='NHỮNG NĂM 1920', title='Burberry Check', size=80,
      cards=[{'img': P + '04_check.jpg', 'x': 480, 'y': 950, 'w': 520, 'h': 650, 'd': at('check')}],
      badge={'text': '1920s', 'x': 740, 'y': 650, 'd': at('check', '1920'), 'small': True},
      labels=[{'text': 'BAN ĐẦU: LỚP LÓT ÁO KHOÁC', 'x': 480, 'y': 1300, 'd': at('check', 'lớp')}],
      sfx=[('whoosh_deep', at('check', off=-0.3)), ('ding_luxury', at('check', '1920')), ('pop_soft', at('check', 'lớp'))])
scene('logo', 'logo', chapter='II · DI SẢN', kicker='LOGO HIỆP SĨ CƯỠI NGỰA', title='Prorsum', size=110,
      cards=[{'img': P + '03_logo_1901.jpg', 'x': 480, 'y': 900, 'w': 640, 'h': 510, 'd': at('logo')}],
      stamp={'text': 'TIẾN LÊN', 'x': 480, 'y': 1250, 'd': at('logo', 'tiến')},
      labels=[{'text': 'TIẾNG LATIN', 'x': 480, 'y': 1180, 'd': at('logo', 'tiếng')}],
      sfx=[('whoosh_soft', at('logo', off=-0.2)), ('pop_soft', at('logo', 'prorsum')), ('stamp', at('logo', 'tiến'))])
scene('bridge', 'bridge', chapter='III · NƯỚC HOA', kicker='TỪ THỜI TRANG', title='Đến nước hoa', size=92,
      cards=[{'img': P + '05_trench_atelier.jpg', 'x': 330, 'y': 960, 'w': 400, 'h': 500, 'rot': -4, 'd': at('bridge')},
             {'img': P + '07_hero_edp.jpg', 'x': 650, 'y': 1010, 'w': 380, 'h': 475, 'rot': 4, 'd': at('bridge', 'nước')}],
      sfx=[('whoosh_deep', at('bridge', off=-0.3)), ('glass_clink', at('bridge', 'nước'))])
scene('hero', 'hero2', chapter='III · NƯỚC HOA', kicker='BURBERRY', title='Hero', size=120,
      cards=[{'img': P + '07_hero_edp.jpg', 'x': 480, 'y': 930, 'w': 500, 'h': 625, 'd': at('hero')}],
      labels=[{'text': 'CÁCH ĐIỆU TỪ MÓNG NGỰA', 'x': 480, 'y': 1290, 'd': at('hero', 'móng'), 'until': at('hero2')}],
      chips=[{'text': x, 'd': at('hero2', w)} for x, w in [('Nhũ hương', 'nhũ'), ('Benzoin', 'benzoin'), ('Tuyết tùng', 'tuyết'), ('Thông', 'thông')]],
      sfx=[('whoosh_soft', at('hero', off=-0.2)), ('ding_luxury', at('hero', 'hero')), ('pop_soft', at('hero', 'móng'))] + [('tick', at('hero2', w)) for w in ['nhũ', 'benzoin', 'tuyết', 'thông']])
scene('goddess', 'goddess2', chapter='III · NƯỚC HOA', kicker='BURBERRY', title='Goddess', size=116,
      cards=[{'img': P + '08_goddess_family.jpg', 'x': 480, 'y': 930, 'w': 500, 'h': 666, 'd': at('goddess'), 'until': at('goddess2')},
             {'img': P + '09_goddess_refill.jpg', 'x': 480, 'y': 930, 'w': 500, 'h': 624, 'd': at('goddess2')}],
      stamp={'text': 'REFILL ĐẦU TIÊN', 'x': 480, 'y': 1280, 'd': at('goddess', 'refill'), 'until': at('goddess2')},
      labels=[{'text': 'BỘ BA VANILLA', 'x': 480, 'y': 1290, 'd': at('goddess2', 'bộ')}],
      sfx=[('whoosh_soft', at('goddess', off=-0.2)), ('ding_luxury', at('goddess', 'goddess')), ('stamp', at('goddess', 'refill')), ('whoosh_soft', at('goddess2', off=-0.1)), ('pop_soft', at('goddess2', 'bộ'))])
scene('her', 'her2', chapter='III · NƯỚC HOA', kicker='BURBERRY', title='Her', size=120,
      cards=[{'img': P + '10_her_london.jpg', 'x': 480, 'y': 930, 'w': 470, 'h': 702, 'd': at('her'), 'until': at('her2')},
             {'img': P + '10b_her_edp.jpg', 'x': 480, 'y': 930, 'w': 500, 'h': 625, 'd': at('her2')}],
      labels=[{'text': 'TINH THẦN LONDON', 'x': 480, 'y': 1300, 'd': at('her', 'london'), 'until': at('her2')}],
      chips=[{'text': x, 'd': at('her2', w)} for x, w in [('Quả mọng', 'quả'), ('Hổ phách', 'hổ'), ('Gỗ trắng', 'gỗ')]],
      sfx=[('whoosh_soft', at('her', off=-0.2)), ('ding_luxury', at('her', 'her')), ('pop_soft', at('her', 'london')), ('whoosh_soft', at('her2', off=-0.1))] + [('tick', at('her2', w)) for w in ['quả', 'hổ', 'gỗ']])
scene('prorsum', 'prorsum', chapter='IV · 170 NĂM', kicker='BỘ SƯU TẬP MỚI', title='Prorsum', size=112,
      cards=[{'img': P + '11_prorsum_collection.jpg', 'x': 480, 'y': 930, 'w': 520, 'h': 650, 'd': at('prorsum')}],
      badge={'text': '2026', 'x': 740, 'y': 640, 'd': at('prorsum', '2026')},
      labels=[{'text': '8 MÙI HƯƠNG', 'x': 480, 'y': 1300, 'd': at('prorsum', '8'), 'big': True}],
      sfx=[('whoosh_deep', at('prorsum', off=-0.3)), ('ding_luxury', at('prorsum', '2026')), ('sparkle_long', at('prorsum', 'prorsum')), ('hit_soft', at('prorsum', '8'))])
scene('prorsum2', 'prorsum2', chapter='IV · 170 NĂM', kicker='LẦN ĐẦU TIÊN', title='Check\nthành mùi hương', size=78,
      cards=[{'img': P + '04_check.jpg', 'x': 330, 'y': 960, 'w': 380, 'h': 475, 'rot': -4, 'd': at('prorsum2')},
             {'img': P + '12_prorsum_gabardine.jpg', 'x': 650, 'y': 1000, 'w': 380, 'h': 475, 'rot': 4, 'd': at('prorsum2', 'chuyển')}],
      sfx=[('whoosh_soft', at('prorsum2', off=-0.2)), ('shimmer', at('prorsum2', 'chuyển'))])
scene('prorsum3', 'prorsum3', chapter='IV · 170 NĂM', kicker='TÊN GỌI TỪ DI SẢN', title='Prorsum', size=96,
      trio=[{'img': P + '12_prorsum_gabardine.jpg', 'name': 'Gabardine', 'd': at('prorsum3', 'gabardine')},
            {'img': P + '13_prorsum_kensington.jpg', 'name': 'Kensington Trench', 'd': at('prorsum3', 'kensington')},
            {'img': P + '14_prorsum_knight.jpg', 'name': 'Knight', 'd': at('prorsum3', 'knight')}],
      sfx=[('whoosh_soft', at('prorsum3', off=-0.2))] + [('pop_soft', at('prorsum3', w)) for w in ['gabardine', 'kensington', 'knight']])
scene('outro', 'outro', chapter='', kicker='BURBERRY BEAUTY', title='170 năm di sản\nkể bằng mùi hương', size=72,
      cards=[{'img': P + '07_hero_edp.jpg', 'x': 250, 'y': 1000, 'w': 300, 'h': 375, 'rot': -6, 'd': at('outro')},
             {'img': P + '08_goddess_family.jpg', 'x': 480, 'y': 960, 'w': 320, 'h': 426, 'd': at('outro', 'burberry')},
             {'img': P + '10b_her_edp.jpg', 'x': 710, 'y': 1000, 'w': 300, 'h': 375, 'rot': 6, 'd': at('outro', 'beauty')}],
      sfx=[('whoosh_deep', at('outro', off=-0.3)), ('magic_reveal', at('outro', 'burberry'))])
scene('cta', 'cta', chapter='', kicker='CÒN BẠN?', title='Muốn thử\nmùi nào?', size=96, end=True,
      comment={'d': at('cta', 'bình')},
      sfx=[('whoosh_soft', at('cta', off=-0.2)), ('pop_bubble', at('cta', 'bình')), ('success_arp', END - 2.4)])
# scenes are sequential – fix overlaps
for i in range(len(S) - 1):
    S[i]['e'] = S[i + 1]['s'] + 0.12
S[-1]['e'] = round(END - 2.5, 3)
json.dump({'frames': frames, 'end': round(END, 3), 'scenes': S, 'subs': subs, 'src': SRC}, open(f'{OUT}/story.json', 'w'), ensure_ascii=False, indent=1)
sfx = [x for sc in S for x in sc.get('sfx', [])]
json.dump(sfx, open(f'{OUT}/sfx.json', 'w'))
print('frames', frames, 'sec', round(END, 1), 'scenes', len(S), 'subs', len(subs), 'sfx', len(sfx))
