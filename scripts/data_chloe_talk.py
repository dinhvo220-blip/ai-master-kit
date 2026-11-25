"""Chloé – Darren đứng nói "Vì sao luôn có một chiếc nơ" (25/11/2026). Beat plan -> remotion/src/chloe/talk.json
Cắt im lặng src 50.55–52.20. Nền thay (phim lịch sử / lụa / sáng Paris / tiệm hoa / tối Paris) sau lưng người, ảnh chèn ngắn ≤2.4 s.
"""
import json, re
W = json.load(open('/home/claude/cl2/words.json'))
CUT, SH = 50.55, 1.65
END = 95.55
o = lambda t: round(t if t < CUT else t - SH, 3)
nz = lambda s: re.sub(r'[^\wÀ-ỹ% ]', '', s.lower())
def at(seg, word=None, n=1, off=0.0):
    ws = W[seg]
    if word is None: return o(ws[0][0] + off)
    c = 0
    for s, e, t in ws:
        if nz(t).startswith(nz(word)):
            c += 1
            if c == n: return o(s + off)
    raise KeyError((seg, word))
def end(seg, off=0.0): return o(W[seg][-1][1] + off)

# ---- phụ đề: ngắt theo mệnh đề, tách mệnh đề dài ở chỗ tự nhiên, không tách từ ghép ----
KEY = {'chloé', 'signature', 'nơ', 'paris', 'lụa', 'nếp', 'gấp', 'xếp', 'ly', 'ruy', 'băng', 'cổ', 'áo', 'tự', 'do', 'nữ', 'tính', 'sương', 'trẻo', 'ngọt', 'ấm', 'áp', '20%', 'full', 'size', '5', 'triệu', 'crescent', 'mall', 'quận', '7', 'black', 'friday', 'sơ', 'mi', 'nhẹ', 'nhàng', 'bay', 'bổng', 'thu', 'nhỏ'}
PAIRS = set(x.lower() for x in """nguồn gốc|nhà mốt|nổi tiếng|sơ mi|nhẹ nhàng|bay bổng|nước hoa|cảm hứng|nếp gấp|xếp ly|ruy băng|cổ áo|đặc trưng|tự do|nữ tính|mùi hương|nốt hương|mô tả|mọi người|buổi sáng|cửa sổ|đọng sương|trong trẻo|ngọt nhẹ|tươi mát|tiệm hoa|bó hoa|ấm áp|buổi tối|tìm hiểu|đơn thuần|thu nhỏ|chương trình|giảm giá|tất cả|hóa đơn|quà tặng|full size|hấp dẫn|crescent mall|mall quận|quận 7|thú vị|lịch sử|thương hiệu|câu hỏi|chia sẻ|câu chuyện|cảm ơn|black friday|chloé signature|chiếc nơ|chiếc áo|vải lụa|áo sơ|mi lụa|lụa xếp|chai nước|một chiếc|một chai|đương nhiên|không thể|ngay cả|điều đó|trên chai|gợi nhớ|theo đuổi|cùng quay|quay về|có một|mở cửa|đi ngang|mới cắt|5 triệu|20% cho|giống như|như là|cho tất|mua nước|chloé crescent|hoa lại|biệt là|là mọi|full size|đầu như|như vậy|đó để|làm cảm|họ lấy|xem hết|hết video|cái hình|tạo ra|rất là|đã xem""".split('|'))
BRK = {'cũng', 'hóa', 'và', 'mà', 'thì', 'giống', 'như', 'của', 'cho', 'để', 'trong', 'về', 'ở', 'trên', 'đến', 'những', 'là', 'luôn', 'không', 'có', 'gió', 'một', 'sẽ', 'được', 'đang', 'muốn'}
def best_split(c, ret_pen=False):
    n = len(c); best = None
    for i in range(2, n - 1):
        pen = abs(i - n / 2)
        pair = (nz(c[i - 1]['w']) + ' ' + nz(c[i]['w']))
        if pair in PAIRS: pen += 10
        if nz(c[i]['w']) not in BRK: pen += 2.5
        if best is None or pen < best[0]: best = (pen, i)
    return best if ret_pen else best[1]
def chop(c):
    if len(c) <= 6: return [c]
    if len(c) <= 7 and best_split(c, True)[0] >= 10: return [c]
    i = best_split(c); return chop(c[:i]) + chop(c[i:])
subs = []
for ws in W:
    cl = []
    for s, e, t in ws:
        cl.append({'w': t, 's': o(s), 'e': o(e), **({'k': 1} if nz(t) in KEY else {})})
        if re.search(r'[,.:?!]$', t):
            subs.append(cl); cl = []
    if cl: subs.append(cl)
merged = []
CONN = {'mà', 'và', 'thì'}
for k in range(len(subs) - 1):
    if len(subs[k]) == 1 and nz(subs[k][0]['w']) in CONN:
        subs[k + 1] = subs[k] + subs[k + 1]; subs[k] = []
subs = [c for c in subs if c]
for c in subs:
    if merged and len(c) == 1 and len(merged[-1]) <= 6: merged[-1] = merged[-1] + c
    elif merged and len(merged[-1]) == 1 and len(c) <= 6: merged[-1] = merged[-1] + c
    else: merged.append(c)
subs = [x for c in merged for x in chop(c)]
subs = [{'s': c[0]['s'], 'e': c[-1]['e'], 'words': c} for c in subs]
for i in range(len(subs) - 1):
    if subs[i + 1]['s'] - subs[i]['e'] < 0.6: subs[i]['e'] = subs[i + 1]['s']
    else: subs[i]['e'] = round(subs[i]['e'] + 0.25, 3)

P = 'chloe/'
ev = {}
# nền thay sau lưng (iris mở từ đầu)
ev['bgs'] = [
 {'kind': 'film', 's': at(1, off=-0.1), 'e': at(2, 'và', off=-0.05)},                       # quay về nguồn gốc … nổi tiếng ở Paris
 {'kind': 'silk', 's': at(2, 'những', 2, off=-0.15), 'e': end(2, 0.25)},                      # áo sơ mi lụa nhẹ nhàng bay bổng
 {'kind': 'morning', 's': at(9, 'buổi', off=-0.2), 'e': end(10, 0.3)},                       # mở cửa sổ ở Paris … hơi ngọt nhẹ
 {'kind': 'rose', 's': at(11, 'giống', off=-0.1), 'e': end(11, 0.25)},                       # tiệm hoa, bó hoa mới cắt
 {'kind': 'evening', 's': at(12, 'những', off=-0.1), 'e': end(12, 0.2)},                     # ấm áp như buổi tối ở Paris
 {'kind': 'film', 's': at(21, 'lịch', off=-0.25), 'e': end(22, 0.1)},                         # lịch sử thương hiệu
]
# ảnh chèn full màn (ngắn)
ev['inserts'] = [
 {'s': at(3, off=-0.05), 'e': end(3, 0.1), 'imgs': [P + '10_blouse.jpg', P + '11_blouse_bow.jpg'], 'pos': ['50% 78%', '50% 60%'], 'sw': at(3, 'chiếc', off=0), 'label': 'Cảm hứng từ áo sơ mi lụa', 'kick': 'CHLOÉ · NGUỒN CẢM HỨNG'},
 {'s': at(14, 'giống', off=-0.05), 'e': at(14, 'nhỏ', off=0.55), 'imgs': [P + '11_blouse_bow.jpg', P + '02_bottle_big_m.jpg'], 'pos': ['50% 60%', '50% 50%'], 'sw': at(14, 'chiếc', off=0.1), 'label': 'Chiếc áo sơ mi thu nhỏ', 'kick': 'MỘT ĐIỂM RẤT CHLOÉ'},
]
# tiêu đề/nhãn – lớp trước, dải tiêu đề (y 245–580), tránh mặt
ev['titles'] = [
 {'s': at(0, off=0.05), 'e': end(0, 0.2), 'kick': 'CHLOÉ · SIGNATURE', 'text': 'Vì sao luôn có\nmột chiếc nơ?', 'size': 70, 'behind': 1},
 {'s': at(4, 'nếp', off=-0.1), 'e': end(4, 0.15), 'kick': 'THÂN CHAI', 'text': 'Nếp gấp\nlụa xếp ly', 'size': 66, 'side': 'r'},
 {'s': at(5, 'nơ', off=-0.1), 'e': end(5, 0.2), 'kick': 'NƠ RUY BĂNG', 'text': 'Nơ cổ áo\ncủa Chloé', 'size': 66, 'side': 'r'},
 {'s': at(13, 'không', off=-0.1), 'e': end(13, 0.1), 'kick': 'VỚI DARREN', 'text': 'Không chỉ là\nmột chai nước hoa', 'size': 62, 'behind': 1},
 {'s': at(23, off=-0.1), 'e': end(24, 0.2), 'kick': 'DARREN KỂ BẠN NGHE', 'text': 'Câu chuyện sau\nmỗi chai nước hoa', 'size': 60, 'behind': 1},
]
# ba chữ nữ tính – sau người, hiện theo lời
ev['trio'] = {'s': at(6, off=0.0), 'e': end(6, 0.5), 'words': [['Nhẹ nhàng', at(6, 'nhẹ')], ['Tự do', at(6, 'tự')], ['Nữ tính', at(6, 'nữ')]]}
ev['quote'] = {'s': at(8, off=-0.05), 'e': at(9, 'buổi', off=-0.25), 'text': 'Một đoạn mô tả về Chloé…'}
ev['chips'] = [
 {'text': 'Đọng sương', 'd': at(10, 'đọng'), 'e': end(10, 0.3)},
 {'text': 'Trong trẻo', 'd': at(10, 'trong'), 'e': end(10, 0.3)},
 {'text': 'Hơi ngọt nhẹ', 'd': at(10, 'hơi'), 'e': end(10, 0.3)},
 {'text': 'Hoa mới cắt', 'd': at(11, 'mới'), 'e': end(11, 0.25)},
 {'text': 'Ấm áp', 'd': at(12, 'ấm'), 'e': end(12, 0.2)},
]
ev['deal'] = [
 {'s': at(16, 'black', off=-0.1), 'e': end(16, 0.2), 'kick': 'BLACK FRIDAY', 'big': '−20%', 'sub': 'Tất cả các dòng nước hoa'},
 {'s': at(17, off=-0.05), 'e': end(18, 0.2), 'kick': 'HÓA ĐƠN TRÊN 5 TRIỆU', 'big': 'Quà full size', 'sub': 'Tặng kèm khi mua nước hoa', 'gift': 1},
]
ev['pin'] = {'s': at(19, 'chloé', off=-0.1), 'e': end(20, 0.3), 'a': 'Chloé', 'b': 'Crescent Mall · Quận 7'}
ev['end'] = {'s': at(25, off=-0.1)}
# zoom nhẹ theo câu (shot giả, rất mềm)
ev['zooms'] = [o(ws[0][0]) for ws in W]
sfx = []
for b in ev['bgs']: sfx += [('whoosh_soft', round(b['s'] - 0.15, 3)), ('shimmer', round(b['s'] + 0.2, 3))]
for b in ev['inserts']: sfx += [('whoosh_soft', round(b['s'] - 0.12, 3)), ('sparkle_long', round(b['sw'], 3))]
for t in ev['titles']: sfx.append(('pop_soft', t['s']))
for w in ev['trio']['words']: sfx.append(('tick', w[1]))
sfx.append(('pop_soft', ev['quote']['s']))
for c in ev['chips']: sfx.append(('tick', c['d']))
sfx += [('ding_luxury', ev['deal'][0]['s']), ('glass_clink', ev['deal'][1]['s']), ('pop_soft', ev['pin']['s']), ('success_arp', ev['end']['s'])]
json.dump({'frames': int(round(END * 30)), 'end': END, 'subs': subs, **ev}, open('/home/claude/ai-master-kit/remotion/src/chloe/talk.json', 'w'), ensure_ascii=False, indent=1)
json.dump([(a, b) for a, b in sfx], open('/home/claude/ai-master-kit/remotion/src/chloe/talk_sfx.json', 'w'))
print('subs', len(subs), 'sfx', len(sfx))
for b in ev['bgs']: print(b['kind'], b['s'], b['e'])
for b in ev['inserts']: print('ins', b['s'], b['e'])
for s in subs[:0]: print(s['s'], ' '.join(w['w'] for w in s['words']))
