"""Gucci Beauty – Darren đứng nói: Hà Nội cũng giảm 20% (25/11/2026). Chữ kiểu mới (học từ mẫu Darren gửi):
serif nghiêng thân hẹp có quầng sáng + đổ màu mờ dần, sans mảnh nhỏ xen kẽ, hiện/ẩn bằng nhòe. -> remotion/src/gucci/talk.json"""
import json, re
W = json.load(open('/home/claude/cl3/words.json'))
END = 127.2
nz = lambda s: re.sub(r'[^\wÀ-ỹ% ]', '', s.lower())
def at(seg, word=None, n=1, off=0.0):
    ws = W[seg]
    if word is None: return round(ws[0][0] + off, 3)
    c = 0
    for s, e, t in ws:
        if nz(t).startswith(nz(word)):
            c += 1
            if c == n: return round(s + off, 3)
    raise KeyError((seg, word))
def end(seg, off=0.0): return round(W[seg][-1][1] + off, 3)
# ---- phụ đề (ngắt theo mệnh đề, như Chloé) ----
exec(open('/home/claude/ai-master-kit/scripts/subs_util.py').read())
subs = make_subs(W, lambda t: t)
L = lambda t, st, d: {'t': t, 'st': st, 'd': d}
B = []
def beat(s, e, lines, pos='top', behind=1, align='c'): B.append({'s': s, 'e': e, 'lines': lines, 'pos': pos, 'behind': behind, 'align': align})
beat(0.1, at(0, 'gucci', off=-0.15), [L('cách xa cả nghìn cây số', 'small', 0.15), L('Hà Nội', 'big', at(0, 'hà')), L('vẫn hỏi Darren', 'light', at(0, 'hỏi'))], behind=1)
beat(at(0, 'gucci'), end(0, 0.1), [L('Gucci Beauty', 'small', at(0, 'gucci')), L('có giảm 20%?', 'big', at(0, 'giảm'))], behind=1)
beat(at(1, 'gucci', off=-0.1), at(2, 'vincom', off=-0.3), [L('Gucci Beauty Sài Gòn', 'small', at(1, 'gucci')), L('−20%', 'num', at(1, 'giảm'))])
beat(at(2, 'vincom', off=-0.15), end(2, 0.2), [L('Vincom Bà Triệu · Hà Nội', 'small', at(2, 'vincom')), L('cũng −20%', 'big', at(2, 'cũng'))])
beat(at(3, off=-0.05), end(4, 0.2), [L('hóa đơn sau giảm trên 5 triệu', 'small', at(3, 'hóa')), L('quà full size', 'big', at(3, 'quà')), L('tùy danh sách mỗi cửa hàng', 'light', at(4, 'mỗi'))], behind=1)
beat(at(6, 'son', off=-0.1), end(7, 0.2), [L('không thể thiếu', 'small', at(6, 'không')), L('son Gucci', 'big', at(6, 'son')), L('son lì · Matte', 'light', at(7, 'lì'))])
beat(at(8, '505', off=-0.15), end(9, 0.2), [L('son lì Matte · màu', 'small', at(8, 'màu')), L('505', 'num', at(8, '505')), L('Janet Rust · best seller', 'light', at(9, 'best'))])
beat(at(11, off=-0.1), end(12, 0.3), [L('son dưỡng có màu', 'small', at(11, 'son')), L('Brillant', 'big', at(11)), L('rất nhiều dưỡng', 'light', at(12, 'rất'))])
beat(at(14, off=-0.05), at(15, off=-0.15), [L('thích hiệu ứng lì', 'small', at(14, 'thích')), L('chọn Matte', 'big', at(14, 'chọn'))])
beat(at(15, off=-0.05), end(16, 0.3), [L('dưỡng · có màu · che phủ tốt', 'small', at(15, 'dưỡng')), L('chọn Brillant', 'big', at(16, 'chọn'))])
beat(at(17, off=-0.1), end(18, 0.3), [L('rất đáng để thử', 'small', at(17, 'đáng')), L('Cushion', 'big', at(17)), L('ghiền liền luôn', 'light', at(18, 'ghiền'))])
beat(at(19, off=-0.05), at(19, 'nước', off=-0.2), [L('má hồng', 'small', at(19, 'má')), L('−20%', 'num', at(19, 'giảm'))])
beat(at(19, 'nước', off=-0.05), end(19, 0.3), [L('nước hoa', 'small', at(19, 'nước')), L('cũng −20%', 'big', at(19, 'giảm', 2))])
beat(at(20, 'diễn', off=-0.1), end(20, 0.3), [L('Black Friday', 'small', at(20, 'black')), L('20.11 – 30.11', 'num', at(20, '20')), L('hôm nay đã 25, 26 rồi', 'light', at(20, 'hôm'))])
beat(at(21, off=-0.05), end(22, 0.2), [L('hàng có thể hết', 'small', at(21, 'hàng')), L('giảm sâu', 'big', at(21, 'giảm'))])
beat(at(23, 'inbox', off=-0.1), end(24, 0.3), [L('inbox Darren', 'small', at(23, 'inbox')), L('+ tên brand', 'big', at(24, 'tên')), L('nhận contact của brand', 'light', at(24, 'contact'))])
beat(at(25, off=-0.05), end(27, 0.3), [L('Gucci Beauty', 'small', at(25, 'gucci')), L('2 chi nhánh', 'big', at(25, '2')), L('HCM · Crescent Mall Q7', 'small', at(26)), L('Hà Nội · Vincom Bà Triệu', 'small', at(27, 'hà'))])
beat(at(28, 'khắc', off=-0.15), end(30, 0.3), [L('cả 2 store đều có', 'small', at(28, 'store')), L('khắc tên', 'big', at(28, 'khắc')), L('cá nhân hóa món quà', 'light', at(29, 'cá'))])
beat(at(31, off=-0.05), end(31, 0.3), [L('ưu đãi rất lớn', 'small', at(31, 'ưu')), L('Black Friday', 'big', at(31))])
beat(at(33, 'comment', off=-0.1), end(33, 0.4), [L('comment', 'small', at(33, 'comment')), L('BA tư vấn', 'big', at(33, 'ba'))])
beat(at(37, 'follow', off=-0.1), END, [L('nhớ follow', 'small', at(37, 'follow')), L('Darren', 'big', at(37, 'darren')), L('@darrenbeauty01', 'light', at(37, 'darren', off=0.4))])
cards = [{'s': at(6, off=-0.1), 'e': end(10, 0.1)}, {'s': at(17, off=-0.1), 'e': end(18, 0.25)}, {'s': at(25, off=-0.1), 'e': end(27, 0.3)}]
zooms = [ws[0][0] for ws in W]
sfx = []
for b in B:
    sfx.append(('whoosh_soft', round(b['s'] - 0.1, 3)))
    for l in b['lines']: sfx.append(('tick' if l['st'] in ('small', 'light') else 'pop_soft', l['d']))
for c in cards: sfx.append(('shimmer', c['s']))
sfx.append(('success_arp', at(40)))
json.dump({'frames': int(round(END * 30)), 'end': END, 'subs': subs, 'beats': B, 'cards': cards, 'zooms': zooms}, open('/home/claude/ai-master-kit/remotion/src/gucci/talk.json', 'w'), ensure_ascii=False, indent=1)
json.dump(sfx, open('/home/claude/ai-master-kit/remotion/src/gucci/talk_sfx.json', 'w'))
win = [(b['s'] - 0.3, b['e'] + 0.3) for b in B if b['behind']] + [(c['s'] - 0.3, c['e'] + 0.3) for c in cards]
json.dump(win, open('/home/claude/cl3/win.json', 'w'))
print('beats', len(B), 'subs', len(subs), 'win', round(sum(b - a for a, b in win), 1))
