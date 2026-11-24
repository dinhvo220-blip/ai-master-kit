"""Chloé Eau de Parfum – video kể chuyện "Vì sao chai nước hoa này luôn có một chiếc nơ" (24/11/2026).
Giọng VieNeu "Thục Đoan" (nữ, miền Nam). Ảnh: chloe.com (chụp qua trình duyệt trong app).
python3 data_story_chloe.py <vseg> <out_dir>  -> chloe.json, sfx.json, voice.wav
"""
import sys, json, re, wave, glob, os
import numpy as np
sys.path.insert(0, '/home/claude/chloe/tts')
from lines_chloe import L

VSEG = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/chloe/tts/vseg'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/ai-master-kit/remotion/src/chloe'
os.makedirs(OUT, exist_ok=True)
FPS, SR = 30, 48000
GAP = 0.34
BIG_GAP = {'y1952': 0.7, 'born': 0.5, 'blouse': 0.9, 'scent': 0.8, 'morning': 0.9, 'rose': 0.9, 'evening': 0.9, 'outro': 1.0, 'outro2': 0.35}
START = 0.45
END_CARD = 3.0

files = sorted(glob.glob(f'{VSEG}/*.wav'))
assert len(files) == len(L), (len(files), len(L))
t = START; voice = []; lines = []
for (k, d, txt), fn in zip(L, files):
    t += BIG_GAP.get(k, GAP) if lines else 0
    w = wave.open(fn); sr = w.getframerate()
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if sr != SR:
        x = np.arange(0, len(a), sr / SR); a = np.interp(x, np.arange(len(a)), a).astype(np.float32)
    env = np.abs(a) > 0.012
    i0 = max(0, np.argmax(env) - int(0.03 * SR)); i1 = len(a) - max(0, np.argmax(env[::-1]) - int(0.1 * SR))
    a = a[i0:i1]; dur = len(a) / SR
    voice.append((t, a))
    words = txt.split()
    wts = [len(re.sub(r'[^\w]', '', x)) + 2 + (5 if re.search(r'[,.:?!]$', x) else 0) for x in words]
    tot = sum(wts); acc = 0; wl = []
    for x, wt in zip(words, wts):
        s = t + dur * acc / tot; acc += wt; e = t + dur * acc / tot
        wl.append({'w': x, 's': round(s, 3), 'e': round(e, 3)})
    lines.append({'k': k, 's': round(t, 3), 'e': round(t + dur, 3), 'words': wl})
    t += dur
END = t + 0.6 + END_CARD
frames = int(round(END * FPS))

buf = np.zeros(int(END * SR) + SR, np.float32)
for s, a in voice:
    i = int(s * SR); buf[i:i + len(a)] += a
buf = buf[:int(END * SR)]
wo = wave.open(f'{OUT}/voice.wav', 'wb'); wo.setnchannels(1); wo.setsampwidth(2); wo.setframerate(SR)
wo.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes()); wo.close()

SPLIT = {
 'hook': ['Mình kể bạn nghe', 'vì sao chai nước hoa này', 'luôn có một chiếc nơ.'],
 'y1952': ['Năm 1952 ở Paris,', 'có một người phụ nữ', 'tên là Gaby Aghion.'],
 'rigid': ['Cô thấy thời trang lúc đó', 'quá cứng nhắc:', 'muốn đẹp thì phải đặt may,', 'phải gò bó.'],
 'free': ['Nên cô làm điều ngược lại:', 'những bộ đồ may sẵn,', 'mềm, nhẹ,', 'mặc vào là thấy mình được tự do.'],
 'born': ['Đó là cách Chloé ra đời.'],
 'blouse': ['Một món đồ đặc trưng của Chloé', 'là chiếc áo sơ mi lụa,', 'có chiếc nơ buộc nhẹ ở cổ áo.'],
 'wear': ['Nên khi làm nước hoa,', 'họ mặc luôn chiếc áo đó lên chai.'],
 'pleats': ['Thân chai là những nếp gấp', 'như lụa xếp ly,', 'còn chiếc nơ', 'chính là nơ cổ áo ngày xưa.'],
 'mini': ['Nói cách khác,', 'chai nước hoa này', 'là một chiếc áo Chloé thu nhỏ.'],
 'scent': ['Còn mùi của nó', 'thì mình hay tả thế này.'],
 'morning': ['Giống như sáng sớm', 'mở cửa sổ ở Paris,', 'gió đưa vào mùi hoa còn đọng sương,', 'hơi ngọt, rất trong.'],
 'rose': ['Một lúc sau,', 'bạn đi ngang một tiệm hoa hồng.'],
 'rose2': ['Không phải kiểu hoa hồng nồng nặc,', 'mà là hồng mới cắt,', 'mềm và sạch.'],
 'evening': ['Đến chiều tối, mùi lắng xuống,', 'ấm hơn,', 'như mùi trên chiếc áo lụa', 'bạn mặc cả ngày,', 'giờ chỉ còn vương lại trên da.'],
 'outro': ['Nên mỗi lần nhìn chiếc nơ này,', 'mình lại nghĩ:', 'Chloé không bán một mùi hương.'],
 'outro2': ['Họ đang kể lại câu chuyện', 'của một người phụ nữ', 'muốn được tự do.'],
}
KEYW = ['nơ', 'nơ.', 'paris,', '1952', 'gaby', 'aghion.', 'tự', 'do.', 'chloé', 'lụa,', 'lụa', 'nếp', 'gấp', 'hồng', 'hồng.', 'ấm', 'da.', 'sương,', 'trong.', 'sạch.', 'chai.']
subs = []
for ln in lines:
    ws = ln['words']; i = 0
    for part in SPLIT[ln['k']]:
        n = len(part.split())
        assert ' '.join(w['w'] for w in ws[i:i + n]) == part, (ln['k'], part)
        subs.append(ws[i:i + n]); i += n
    assert i == len(ws), ln['k']
for c in subs:
    for w in c:
        if w['w'].lower() in KEYW: w['k'] = 1
subs = [{'s': c[0]['s'], 'e': c[-1]['e'], 'words': c} for c in subs]
for i in range(len(subs) - 1):
    if subs[i + 1]['s'] - subs[i]['e'] < 0.5: subs[i]['e'] = subs[i + 1]['s']
for s in subs: s['e'] = round(s['e'] + 0.15, 3)

LN = {l['k']: l for l in lines}
def at(k, word=None, n=1, off=0.0):
    ln = LN[k]
    if word is None: return round(ln['s'] + off, 3)
    c = 0
    for w in ln['words']:
        if re.sub(r'[^\w]', '', w['w'].lower()).startswith(word.lower()):
            c += 1
            if c == n: return round(w['s'] + off, 3)
    raise KeyError((k, word))
def nxt(k):
    ks = [l['k'] for l in lines]; i = ks.index(k)
    return lines[i + 1]['s'] if i + 1 < len(lines) else END - END_CARD
P = 'chloe/'
S = []
def scene(k_from, k_to, **kw):
    s = 0 if k_from == 'hook' else LN[k_from]['s'] - 0.3
    e = nxt(k_to) - 0.3
    S.append({'s': round(s, 3), 'e': round(e, 3), 'k': k_from, **kw})

scene('hook', 'hook', kicker='CHLOÉ · EAU DE PARFUM', title='Vì sao luôn có\nmột chiếc nơ?', size=74,
      hero={'img': P + '02_bottle_big_m.jpg', 'from': 1.0, 'to': 1.32, 'ox': 50, 'oy': 30, 'sheen': at('hook', 'nơ')},
      sfx=[('whoosh_soft', 0.25), ('sparkle_long', at('hook', 'nơ', off=-0.1))])
scene('y1952', 'y1952', chapter='I · PARIS', kicker='NGƯỜI SÁNG LẬP', title='Gaby Aghion', size=78,
      cards=[{'img': P + '06_gaby_1952.jpg', 'x': 480, 'y': 975, 'w': 500, 'h': 666, 'd': at('y1952'), 'sepia': 1}],
      badge={'text': '1952', 'x': 745, 'y': 690, 'd': at('y1952', '1952')},
      labels=[{'text': 'PARIS', 'x': 300, 'y': 1250, 'd': at('y1952', 'paris'), 'pin': True}],
      sfx=[('whoosh_deep', at('y1952', off=-0.3)), ('ding_luxury', at('y1952', '1952')), ('pop_soft', at('y1952', 'paris'))])
scene('rigid', 'rigid', chapter='I · PARIS', kicker='THỜI TRANG LÚC ĐÓ', title='Cứng nhắc', size=96,
      cards=[{'img': P + '08_invite_1957.jpg', 'x': 480, 'y': 930, 'w': 470, 'h': 620, 'd': at('rigid'), 'rot': -3, 'dim': 1}],
      strikes=[{'text': 'Đặt may', 'd': at('rigid', 'đặt'), 'x': 300}, {'text': 'Gò bó', 'd': at('rigid', 'gò'), 'x': 660}],
      sfx=[('whoosh_soft', at('rigid', off=-0.2)), ('stamp', at('rigid', 'đặt', off=0.15)), ('stamp', at('rigid', 'gò', off=0.15))])
scene('free', 'free', chapter='I · PARIS', kicker='ĐIỀU NGƯỢC LẠI', title='Tự do', size=120,
      cards=[{'img': P + '07_1960_dress.jpg', 'x': 300, 'y': 960, 'w': 390, 'h': 520, 'rot': -4, 'd': at('free', 'những')},
             {'img': P + '09_dancer.jpg', 'x': 660, 'y': 1000, 'w': 390, 'h': 520, 'rot': 4, 'd': at('free', 'mặc')}],
      checks=[{'text': 'May sẵn', 'd': at('free', 'may')}, {'text': 'Mềm', 'd': at('free', 'mềm')}, {'text': 'Nhẹ', 'd': at('free', 'nhẹ')}],
      sfx=[('whoosh_soft', at('free', off=-0.2)), ('tick', at('free', 'may')), ('tick', at('free', 'mềm')), ('tick', at('free', 'nhẹ')), ('shimmer', at('free', 'tự'))])
scene('born', 'born', kicker='1952 · RA ĐỜI', mask={'word': 'Chloé', 'img': P + '10_blouse.jpg', 'grow': at('born', 'ra')},
      sfx=[('whoosh_deep', at('born', off=-0.3)), ('magic_reveal', at('born', 'chloé'))])
scene('blouse', 'blouse', chapter='II · CHIẾC NƠ', kicker='DI SẢN CỦA CHLOÉ', title='Áo sơ mi lụa', size=82,
      cards=[{'img': P + '10_blouse.jpg', 'x': 480, 'y': 960, 'w': 520, 'h': 693, 'd': at('blouse'), 'until': at('blouse', 'có'), 'nofade': 1},
             {'img': P + '11_blouse_bow.jpg', 'x': 480, 'y': 960, 'w': 520, 'h': 693, 'd': at('blouse', 'có')}],
      labels=[{'text': 'NƠ CỔ ÁO', 'x': 480, 'y': 1270, 'd': at('blouse', 'nơ')}],
      ribbon=at('blouse', off=-0.7),
      sfx=[('whoosh_deep', at('blouse', off=-0.7)), ('pop_soft', at('blouse', 'nơ'))])
scene('wear', 'wear', chapter='II · CHIẾC NƠ', kicker='TỪ CHIẾC ÁO', title='Đến chai nước hoa', size=70,
      cards=[{'img': P + '11_blouse_bow.jpg', 'x': 300, 'y': 960, 'w': 380, 'h': 506, 'rot': -4, 'd': at('wear')},
             {'img': P + '03_bottle_bow.jpg', 'x': 660, 'y': 1000, 'w': 380, 'h': 506, 'rot': 4, 'd': at('wear', 'mặc')}],
      arrow={'d': at('wear', 'mặc')},
      sfx=[('whoosh_soft', at('wear', off=-0.2)), ('glass_clink', at('wear', 'chai'))])
scene('pleats', 'pleats', chapter='II · CHIẾC NƠ', kicker='NHÌN KỸ NHÉ', title='Nếp gấp & nơ', size=86,
      cards=[{'img': P + '04_pleats.jpg', 'x': 480, 'y': 955, 'w': 520, 'h': 693, 'd': at('pleats'), 'until': at('pleats', 'còn'), 'nofade': 1, 'pleat': 1},
             {'img': P + '05_knot_macro.jpg', 'x': 480, 'y': 955, 'w': 520, 'h': 693, 'd': at('pleats', 'còn')}],
      labels=[{'text': 'NẾP GẤP = LỤA XẾP LY', 'x': 480, 'y': 1275, 'd': at('pleats', 'lụa'), 'until': at('pleats', 'còn')},
              {'text': 'NƠ = NƠ CỔ ÁO', 'x': 480, 'y': 1275, 'd': at('pleats', 'chính')}],
      sfx=[('whoosh_soft', at('pleats', off=-0.2)), ('pop_soft', at('pleats', 'lụa')), ('whoosh_soft', at('pleats', 'còn', off=-0.1)), ('pop_soft', at('pleats', 'chính'))])
scene('mini', 'mini', chapter='II · CHIẾC NƠ', kicker='NÓI CÁCH KHÁC', title='Chiếc áo\nthu nhỏ', size=88,
      hero={'img': P + '01_bottle_white_m.jpg', 'from': 1.25, 'to': 1.4, 'ox': 50, 'oy': 52, 'sheen': at('mini', 'thu'), 'ghost': P + '10_blouse.jpg'},
      sfx=[('whoosh_soft', at('mini', off=-0.2)), ('sparkle_long', at('mini', 'thu', off=-0.1))])
scene('scent', 'scent', chapter='III · MÙI HƯƠNG', kicker='CÒN MÙI CỦA NÓ', title='Mình tả\nthế này', size=88, mood='mist',
      hero={'img': P + '01_bottle_white_m.jpg', 'from': 1.0, 'to': 1.06, 'ox': 50, 'oy': 40, 'sheen': at('scent', 'tả')},
      ribbon=at('scent', off=-0.7),
      sfx=[('whoosh_deep', at('scent', off=-0.7)), ('perfume_spray', at('scent', off=0.1)), ('shimmer', at('scent', 'tả'))])
scene('morning', 'morning', chapter='III · MÙI HƯƠNG', kicker='BUỔI SÁNG', title='Cửa sổ\nở Paris', size=88, mood='morning',
      chips=[{'text': 'Đọng sương', 'd': at('morning', 'sương')}, {'text': 'Hơi ngọt', 'd': at('morning', 'hơi')}, {'text': 'Rất trong', 'd': at('morning', 'rất')}],
      leak=at('morning', off=-0.3),
      sfx=[('whoosh_soft', at('morning', off=-0.45)), ('sparkle_long', at('morning', 'sương', off=-0.1))])
scene('rose', 'rose2', chapter='III · MÙI HƯƠNG', kicker='MỘT LÚC SAU', title='Tiệm hoa hồng', size=78, mood='rose',
      chips=[{'text': 'Mới cắt', 'd': at('rose2', 'mới')}, {'text': 'Mềm', 'd': at('rose2', 'mềm')}, {'text': 'Sạch', 'd': at('rose2', 'sạch')}],
      leak=at('rose', off=-0.3),
      sfx=[('whoosh_soft', at('rose', off=-0.45)), ('ding_luxury', at('rose', 'hồng')), ('tick', at('rose2', 'mới')), ('tick', at('rose2', 'mềm')), ('tick', at('rose2', 'sạch'))])
scene('evening', 'evening', chapter='III · MÙI HƯƠNG', kicker='CHIỀU TỐI', title='Vương lại\ntrên da', size=86, mood='evening',
      chips=[{'text': 'Ấm hơn', 'd': at('evening', 'ấm')}, {'text': 'Áo lụa', 'd': at('evening', 'lụa')}],
      leak=at('evening', off=-0.3),
      sfx=[('whoosh_soft', at('evening', off=-0.45)), ('tick', at('evening', 'ấm')), ('shimmer', at('evening', 'vương'))])
scene('outro', 'outro2', chapter='', kicker='MỖI LẦN NHÌN CHIẾC NƠ', title='Không chỉ\nlà mùi hương', size=80, title2={'d': at('outro2'), 'kicker': 'MÀ LÀ CÂU CHUYỆN', 'text': 'Về sự\ntự do'},
      hero={'img': P + '02_bottle_big_m.jpg', 'from': 1.12, 'to': 1.0, 'ox': 50, 'oy': 45, 'sheen': at('outro2', 'tự'), 'halo': 1},
      sfx=[('whoosh_deep', at('outro', off=-0.3)), ('hit_soft', at('outro2', off=-0.05)), ('magic_reveal', at('outro2', 'tự'))])
for i in range(len(S) - 1):
    S[i]['e'] = round(S[i + 1]['s'] + 0.15, 3)
S[-1]['e'] = round(END - END_CARD + 0.2, 3)
sfx = [x for sc in S for x in sc.get('sfx', [])] + [('success_arp', round(END - END_CARD + 0.1, 3))]
json.dump({'frames': frames, 'end': round(END, 3), 'endCard': END_CARD, 'scenes': S, 'subs': subs, 'src': 'Ảnh: chloe.com'},
          open(f'{OUT}/chloe.json', 'w'), ensure_ascii=False, indent=1)
json.dump(sfx, open(f'{OUT}/sfx.json', 'w'))
print('frames', frames, 'sec', round(END, 1), 'scenes', len(S), 'subs', len(subs), 'sfx', len(sfx))
