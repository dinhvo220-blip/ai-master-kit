"""Burberry Make-up – video kể chuyện không giọng (Darren tự lồng tiếng), 21/11/2026.
Thông tin lấy từ mô tả sản phẩm trên burberry.com. Thời lượng câu ước lượng theo tốc độ đọc ~3.7 tiếng/giây.
Tạo remotion/src/story/mk/story.json, sfx.json, voice.wav (câm) + kịch bản có mốc giây."""
import json, re, wave, os
import numpy as np
OUT = '/home/claude/ai-master-kit/remotion/src/story/mk'
os.makedirs(OUT, exist_ok=True)
FPS, SR = 30, 48000
# (key, [cụm phụ đề...])
L = [
 ('hook', ['Một lớp nền', 'lấy cảm hứng từ chiếc trench coat?']),
 ('hook2', ['Đây là Burberry Make-up,', 'và đây là lý do nó đặc biệt.']),
 ('tech', ['Bí mật nằm ở', 'Trench Protect Technology,', 'lấy cảm hứng từ vải gabardine', 'của chiếc trench coat biểu tượng.']),
 ('tech2', ['Công nghệ tạo một lớp màng mỏng,', 'chống nước mà vẫn thoáng khí.']),
 ('found', ['Beyond Wear', 'Perfecting Matte Foundation,', 'lớp nền lì tự nhiên,', 'che phủ từ vừa đến cao.']),
 ('found2', ['Chống nước, độ ẩm,', 'mồ hôi và nhiệt.']),
 ('primer', ['Bước đầu tiên:', 'Beyond Wear Radiance Primer,', 'căng bóng rạng rỡ từ bên trong,', 'cấp ẩm 24 giờ.']),
 ('powder', ['Bước cuối:', 'Setting and Refining Powder,', 'phấn phủ 2 trong 1,', 'cho lớp lì 24 giờ.']),
 ('blush', ['Outdoor Blush có sáu sắc lì ánh nhẹ,', 'lấy cảm hứng từ sắc màu dịu', 'của vùng quê nước Anh.']),
 ('eye', ['Burberry Eye Quad,', 'bảng mắt bốn ô', 'lấy cảm hứng từ màu di sản Burberry.']),
 ('eye2', ['Trong hộp màu be và vàng đặc trưng,', 'kèm gương và đầu tán.']),
 ('kisses', ['Son biểu tượng Burberry Kisses:', 'chất son satin, 31 sắc,', 'hương hoa hồng tươi.']),
 ('shine', ['Burberry Brit Shine:', 'son dạng balm bóng,', 'bắt sáng từ mọi góc.']),
 ('veil', ['Còn Brit Matte Lip Veil:', 'son lì mỏng nhẹ,', 'lấy cảm hứng từ nhịp sống London.']),
 ('outro', ['Từ chiếc trench coat', 'đến từng thỏi son,', 'đó là Burberry Make-up.']),
 ('cta', ['Bạn muốn thử món nào trước?', 'Bình luận cho mình biết nhé.']),
]
EN = {'make-up': 2, 'technology,': 4, 'perfecting': 3, 'foundation,': 3, 'hydrating': 3, 'radiance': 3, 'primer,': 2, 'refining': 3, 'powder,': 2,
      'outdoor': 2, 'holiday': 3, 'edition,': 3, 'quad,': 1, 'kisses:': 2, 'gabardine': 3, 'burberry': 3, 'protect': 2, 'london.': 2}
def syl(w):
    k = w.lower()
    if k in EN: return EN[k]
    if re.fullmatch(r'\d+', re.sub(r'[^\w]', '', w)): return 2
    return 1
GAP, BIG = 0.35, {'tech': 0.6, 'found': 0.5, 'primer': 0.5, 'powder': 0.4, 'blush': 0.7, 'eye': 0.5, 'kisses': 0.7, 'shine': 0.5, 'veil': 0.5, 'outro': 0.7, 'cta': 0.45}
RATE = 3.7
t = 0.4; lines = []; subs = []
for k, parts in L:
    if lines: t += BIG.get(k, GAP)
    s0 = t; wl = []
    for pi, part in enumerate(parts):
        ws = part.split(); cs = []
        for w in ws:
            d = syl(w) / RATE + (0.28 if re.search(r'[,.:?!]$', w) else 0)
            cs.append({'w': w, 's': round(t, 3), 'e': round(t + d, 3)}); t += d
        subs.append({'s': cs[0]['s'], 'e': cs[-1]['e'], 'words': cs}); wl += cs
    lines.append({'k': k, 's': round(s0, 3), 'e': round(t, 3), 'words': wl})
END = t + 2.6
frames = int(round(END * FPS))
for i in range(len(subs) - 1):
    if subs[i + 1]['s'] - subs[i]['e'] < 0.5: subs[i]['e'] = subs[i + 1]['s']
for s in subs: s['e'] = round(s['e'] + 0.15, 3)
w = wave.open(f'{OUT}/voice.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.zeros(int(END * SR), np.int16).tobytes()); w.close()

LN = {l['k']: l for l in lines}
def at(k, word=None, n=1, off=0.0):
    ln = LN[k]
    if word is None: return round(ln['s'] + off, 3)
    c = 0
    for x in ln['words']:
        if re.sub(r'[^\w]', '', x['w'].lower()).startswith(word.lower()):
            c += 1
            if c == n: return round(x['s'] + off, 3)
    raise KeyError((k, word))
def nxt(k):
    ks = [l['k'] for l in lines]; i = ks.index(k)
    return lines[i + 1]['s'] if i + 1 < len(lines) else END
P = 'mk/'
S = []
def scene(a, b, **kw):
    s = LN[a]['s'] - (0.25 if a != 'hook' else LN[a]['s'])
    S.append({'s': round(s, 3), 'e': round(nxt(b) - 0.25, 3), **kw})
SQ = 560  # ảnh vuông
scene('hook', 'hook', chapter='', kicker='BURBERRY MAKE-UP', title='Trench coat\ntrên làn da?', size=88,
      cards=[{'img': P + '05_trench_atelier.jpg', 'x': 315, 'y': 960, 'w': 380, 'h': 475, 'rot': -4, 'd': at('hook', 'một')},
             {'img': P + '01_foundation.jpg', 'x': 655, 'y': 1000, 'w': 420, 'h': 420, 'rot': 4, 'd': at('hook', 'trench')}],
      sfx=[('whoosh_deep', at('hook')), ('ding_luxury', at('hook', 'trench'))])
scene('hook2', 'hook2', kicker='XEM HẾT ĐỂ HIỂU', title='Burberry\nMake-up', size=100,
      cards=[{'img': P + '07_eyequad.jpg', 'x': 270, 'y': 990, 'w': 320, 'h': 320, 'rot': -6, 'd': at('hook2')},
             {'img': P + '08_kisses.jpg', 'x': 480, 'y': 950, 'w': 340, 'h': 340, 'd': at('hook2', 'make')},
             {'img': P + '05_blush.jpg', 'x': 690, 'y': 990, 'w': 320, 'h': 320, 'rot': 6, 'd': at('hook2', 'lý')}],
      sfx=[('whoosh_soft', at('hook2')), ('sparkle_long', at('hook2', 'make'))])
scene('tech', 'tech', chapter='I · LỚP NỀN', kicker='CÔNG NGHỆ ĐỘC QUYỀN', title='Trench Protect', size=74,
      cards=[{'img': P + '02_gabardine_1879.jpg', 'x': 480, 'y': 950, 'w': 520, 'h': 650, 'd': at('tech', 'lấy')}],
      labels=[{'text': 'CẢM HỨNG TỪ VẢI GABARDINE', 'x': 480, 'y': 1300, 'd': at('tech', 'gabardine')}],
      sfx=[('whoosh_deep', at('tech', off=-0.3)), ('hit_soft', at('tech', 'trench')), ('pop_soft', at('tech', 'gabardine'))])
scene('tech2', 'tech2', chapter='I · LỚP NỀN', kicker='TRENCH PROTECT TECHNOLOGY', title='Màng mỏng\nthoáng khí', size=84,
      cards=[{'img': P + '02_foundation_texture.jpg', 'x': 480, 'y': 960, 'w': SQ, 'h': SQ, 'd': at('tech2')}],
      checks=[{'text': 'Chống nước', 'd': at('tech2', 'chống')}, {'text': 'Thoáng khí', 'd': at('tech2', 'thoáng')}],
      sfx=[('whoosh_soft', at('tech2', off=-0.2)), ('tick', at('tech2', 'chống')), ('tick', at('tech2', 'thoáng'))])
scene('found', 'found2', chapter='I · LỚP NỀN', kicker='KEM NỀN', title='Beyond Wear', size=96,
      cards=[{'img': P + '01_foundation.jpg', 'x': 480, 'y': 940, 'w': SQ, 'h': SQ, 'd': at('found')}],
      labels=[{'text': 'LÌ TỰ NHIÊN · CHE PHỦ VỪA ĐẾN CAO', 'x': 480, 'y': 1270, 'd': at('found', 'lớp'), 'until': at('found2')}],
      chips=[{'text': x, 'd': at('found2', w)} for x, w in [('Nước', 'nước'), ('Độ ẩm', 'độ'), ('Mồ hôi', 'mồ'), ('Nhiệt', 'nhiệt')]],
      sfx=[('whoosh_soft', at('found', off=-0.2)), ('ding_luxury', at('found', 'beyond')), ('pop_soft', at('found', 'lớp'))] + [('tick', at('found2', w)) for w in ['nước', 'độ', 'mồ', 'nhiệt']])
scene('primer', 'primer', chapter='I · LỚP NỀN', kicker='BƯỚC ĐẦU TIÊN · CĂNG BÓNG', title='Radiance Primer', size=76,
      cards=[{'img': P + '03_primer_radiance.jpg', 'x': 480, 'y': 940, 'w': SQ, 'h': SQ, 'd': at('primer', 'beyond')}],
      badge={'text': '24H', 'label': 'CẤP ẨM', 'x': 740, 'y': 680, 'd': at('primer', '24')},
      labels=[{'text': 'RẠNG RỠ TỪ BÊN TRONG', 'x': 480, 'y': 1270, 'd': at('primer', 'căng')}],
      sfx=[('whoosh_soft', at('primer', off=-0.2)), ('shimmer', at('primer', 'căng')), ('ding_luxury', at('primer', '24'))])
scene('powder', 'powder', chapter='I · LỚP NỀN', kicker='BƯỚC CUỐI', title='Setting Powder', size=74,
      cards=[{'img': P + '04_powder.jpg', 'x': 480, 'y': 940, 'w': SQ, 'h': SQ, 'd': at('powder', 'setting')}],
      stamp={'text': '2 TRONG 1', 'x': 480, 'y': 1250, 'd': at('powder', '2')},
      badge={'text': '24H', 'label': 'LÌ', 'x': 740, 'y': 680, 'd': at('powder', '24')},
      sfx=[('whoosh_soft', at('powder', off=-0.2)), ('stamp', at('powder', '2')), ('ding_luxury', at('powder', '24'))])
scene('blush', 'blush', chapter='II · MÁ & MẮT', kicker='MÁ HỒNG', title='Outdoor Blush', size=78,
      cards=[{'img': P + '05_blush.jpg', 'x': 480, 'y': 940, 'w': SQ, 'h': SQ, 'd': at('blush')}],
      labels=[{'text': '6 SẮC · VÙNG QUÊ NƯỚC ANH', 'x': 480, 'y': 1270, 'd': at('blush', 'vùng')}],
      sfx=[('whoosh_deep', at('blush', off=-0.3)), ('ding_luxury', at('blush', 'outdoor')), ('pop_soft', at('blush', 'vùng'))])
scene('eye', 'eye2', chapter='II · MÁ & MẮT', kicker='PHẤN MẮT', title='Eye Quad', size=104,
      cards=[{'img': P + '07_eyequad.jpg', 'x': 480, 'y': 940, 'w': SQ, 'h': SQ, 'd': at('eye')}],
      labels=[{'text': '4 Ô · MÀU DI SẢN BURBERRY', 'x': 480, 'y': 1270, 'd': at('eye', 'bảng'), 'until': at('eye2')}],
      chips=[{'text': x, 'd': at('eye2', w)} for x, w in [('Hộp be & vàng', 'hộp'), ('Gương', 'gương'), ('Đầu tán', 'đầu')]],
      sfx=[('whoosh_soft', at('eye', off=-0.2)), ('ding_luxury', at('eye', 'eye')), ('pop_soft', at('eye', 'bảng'))] + [('tick', at('eye2', w)) for w in ['hộp', 'gương', 'đầu']])
scene('kisses', 'kisses', chapter='III · ĐÔI MÔI', kicker='SON BIỂU TƯỢNG', title='Kisses', size=112,
      cards=[{'img': P + '08_kisses.jpg', 'x': 480, 'y': 940, 'w': SQ, 'h': SQ, 'd': at('kisses'), 'until': at('kisses', 'hương', off=-0.2)},
             {'img': P + '09_kisses_swatch.jpg', 'x': 480, 'y': 940, 'w': SQ, 'h': SQ, 'd': at('kisses', 'hương', off=-0.2)}],
      badge={'text': '31', 'label': 'SẮC', 'x': 740, 'y': 680, 'd': at('kisses', '31')},
      chips=[{'text': x, 'd': at('kisses', w)} for x, w in [('Satin', 'satin'), ('Hương hoa hồng', 'hương')]],
      sfx=[('whoosh_deep', at('kisses', off=-0.3)), ('ding_luxury', at('kisses', 'kisses')), ('pop_soft', at('kisses', '31')), ('tick', at('kisses', 'satin')), ('tick', at('kisses', 'hương'))])
scene('shine', 'shine', chapter='III · ĐÔI MÔI', kicker='SON BÓNG DẠNG BALM', title='Brit Shine', size=104,
      cards=[{'img': P + '10_brit_shine.jpg', 'x': 480, 'y': 940, 'w': SQ, 'h': SQ, 'd': at('shine')}],
      labels=[{'text': 'BẮT SÁNG TỪ MỌI GÓC', 'x': 480, 'y': 1270, 'd': at('shine', 'bắt')}],
      sfx=[('whoosh_soft', at('shine', off=-0.2)), ('shimmer', at('shine', 'bắt'))])
scene('veil', 'veil', chapter='III · ĐÔI MÔI', kicker='SON LÌ MỎNG NHẸ', title='Lip Veil', size=108,
      cards=[{'img': P + '11_lip_veil.jpg', 'x': 480, 'y': 940, 'w': SQ, 'h': SQ, 'd': at('veil')}],
      labels=[{'text': 'NHỊP SỐNG LONDON', 'x': 480, 'y': 1270, 'd': at('veil', 'nhịp')}],
      sfx=[('whoosh_soft', at('veil', off=-0.2)), ('pop_soft', at('veil', 'nhịp'))])
scene('outro', 'outro', chapter='', kicker='BURBERRY MAKE-UP', title='Từ trench coat\nđến thỏi son', size=78,
      cards=[{'img': P + '01_foundation.jpg', 'x': 270, 'y': 990, 'w': 320, 'h': 320, 'rot': -6, 'd': at('outro')},
             {'img': P + '07_eyequad.jpg', 'x': 480, 'y': 950, 'w': 340, 'h': 340, 'd': at('outro', 'đến')},
             {'img': P + '08_kisses.jpg', 'x': 690, 'y': 990, 'w': 320, 'h': 320, 'rot': 6, 'd': at('outro', 'son')}],
      sfx=[('whoosh_deep', at('outro', off=-0.3)), ('magic_reveal', at('outro', 'đó'))])
scene('cta', 'cta', chapter='', kicker='CÒN BẠN?', title='Muốn thử\nmón nào?', size=96,
      comment={'d': at('cta', 'bình'), 'names': ['Beyond Wear', 'Outdoor Blush', 'Eye Quad', 'Kisses']},
      sfx=[('whoosh_soft', at('cta', off=-0.2)), ('pop_bubble', at('cta', 'bình')), ('success_arp', END - 2.4)])
for i in range(len(S) - 1): S[i]['e'] = S[i + 1]['s'] + 0.12
S[-1]['e'] = round(END - 2.5, 3)
json.dump({'frames': frames, 'end': round(END, 3), 'scenes': S, 'subs': subs, 'src': 'Ảnh: burberry.com', 'endSub': 'Make-up'},
          open(f'{OUT}/story.json', 'w'), ensure_ascii=False, indent=1)
json.dump([x for sc in S for x in sc.get('sfx', [])], open(f'{OUT}/sfx.json', 'w'))
def mm(x): return f"{int(x // 60)}:{x % 60:04.1f}"
txt = "KỊCH BẢN LỒNG TIẾNG – BURBERRY MAKE-UP (clip %s)\nĐọc theo mốc thời gian; phụ đề trong clip chạy đúng nhịp này.\n\n" % mm(END)
txt += '\n'.join(f"[{mm(l['s'])}]  {' '.join(p for p in dict(L)[l['k']])}" for l in lines) + '\n'
open('/home/claude/deliver/Burberry_Makeup_KichBan_LongTieng.txt', 'w').write(txt)
print(txt); print('frames', frames)
