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
# Bố cục chữ v2 (theo mẫu Darren): chữ nhỏ sans lệch trái + serif nghiêng chữ thường lớn + chữ nhỏ lệch phải, đặt TRƯỚC người ở vùng ngực;
# chữ đậm khối (heavy) đặt SAU đầu chỉ ở vài điểm nhấn (cần matte đẹp).
B = []
def beat(s, e, serif, sd, a=None, ad=None, b=None, bd=None, heavy=None, hd=None):
    B.append({'s': s, 'e': e, 'serif': serif, 'sd': sd, 'a': a, 'ad': ad, 'b': b, 'bd': bd, 'heavy': heavy, 'hd': hd})
beat(0.1, at(0, 'gucci', off=-0.1), 'các bạn ở', at(0, 'các'), 'cách xa cả nghìn cây số', 0.15, 'vẫn hỏi Darren', at(0, 'hỏi'), 'HÀ NỘI', at(0, 'hà'))
beat(at(0, 'gucci'), end(0, 0.1), 'có giảm 20%?', at(0, 'giảm'), 'Gucci Beauty Hà Nội', at(0, 'gucci'), 'giống Sài Gòn', at(0, 'giống'), '−20%', at(0, 'giảm'))
beat(at(1, off=-0.05), at(2, 'vincom', off=-0.25), 'đương nhiên là có', at(1, 'đương'), 'Gucci Beauty Sài Gòn', at(1, 'gucci'), 'giảm 20%', at(1, 'giảm'), '−20%', at(1, 'giảm'))
beat(at(2, 'vincom', off=-0.1), end(2, 0.2), 'Vincom Bà Triệu', at(2, 'vincom'), 'ở Hà Nội', at(2, 'hà'), 'cũng giảm 20%', at(2, 'cũng'), '−20%', at(2, 'cũng'))
beat(at(3, off=-0.05), end(3, 0.2), 'quà full size', at(3, 'quà'), 'hóa đơn sau giảm', at(3, 'hóa'), 'trên 5 triệu', at(3, 'trên'))
beat(at(4, off=-0.05), end(5, 0.2), 'danh sách riêng', at(4, 'danh'), 'mỗi cửa hàng', at(4, 'mỗi'), 'ra store để được tư vấn', at(5, 'cửa'))
beat(at(6, 'son', off=-0.1), end(7, 0.2), 'son Gucci', at(6, 'son'), 'không thể thiếu', at(6, 'không'), 'son lì · Matte', at(7, 'lì'))
beat(at(8, '505', off=-0.15), end(9, 0.2), 'màu 505', at(8, '505'), 'Janet Rust', at(8, 'màu'), 'best seller của Gucci', at(9, 'best'))
beat(at(10, off=-0.05), end(13, 0.2), 'Brillant', at(11), 'son dưỡng có màu', at(11, 'son'), 'rất nhiều dưỡng', at(12, 'rất'))
beat(at(14, off=-0.05), at(15, off=-0.15), 'chọn Matte', at(14, 'chọn'), 'thích hiệu ứng lì', at(14, 'thích'), None, None)
beat(at(15, off=-0.05), end(16, 0.3), 'chọn Brillant', at(16, 'chọn'), 'dưỡng · có màu', at(15, 'dưỡng'), 'che phủ tốt', at(15, 'che'))
beat(at(17, off=-0.1), end(18, 0.3), 'Cushion', at(17), 'rất đáng để thử', at(17, 'đáng'), 'ghiền liền luôn', at(18, 'ghiền'))
beat(at(19, off=-0.05), at(19, 'nước', off=-0.2), 'má hồng', at(19, 'má'), 'cũng giảm', at(19, 'giảm'), '20%', at(19, 'giảm'))
beat(at(19, 'nước', off=-0.05), end(19, 0.3), 'nước hoa', at(19, 'nước'), 'đặc biệt', at(19, 'đặc'), 'cũng giảm 20%', at(19, 'giảm', 2))
beat(at(20, off=-0.05), end(20, 0.3), '20.11 – 30.11', at(20, '20'), 'Black Friday', at(20, 'black'), 'hôm nay đã 25, 26 rồi', at(20, 'hôm'))
beat(at(21, off=-0.05), end(22, 0.2), 'giảm sâu', at(21, 'giảm'), 'hàng có thể hết', at(21, 'hàng'), 'ra store thử nha', at(22, 'cửa'))
beat(at(23, off=-0.05), end(24, 0.3), 'inbox Darren', at(23, 'inbox'), 'kèm tên brand', at(24, 'tên'), 'để nhận contact', at(24, 'contact'))
beat(at(25, off=-0.05), end(27, 0.3), '2 chi nhánh', at(25, '2'), 'Crescent Mall Q7', at(26), 'Vincom Bà Triệu', at(27, 'vincom'))
beat(at(28, off=-0.05), end(30, 0.3), 'khắc tên', at(28, 'khắc'), 'cả 2 store đều có', at(28, 'store'), 'cá nhân hóa món quà', at(29, 'cá'))
beat(at(31, off=-0.05), end(33, 0.4), 'ưu đãi rất lớn', at(31, 'ưu'), 'Black Friday này', at(31), 'comment để có BA tư vấn', at(33, 'comment'))
beat(at(37, off=-0.05), END, 'follow Darren', at(37, 'follow'), 'nhớ nha', at(37), '@darrenbeauty01', at(37, 'darren', off=0.4))
cards = [{'s': at(6, off=-0.1), 'e': end(10, 0.1), 'word': 'LIPSTICK'}, {'s': at(17, off=-0.1), 'e': end(18, 0.25), 'word': 'CUSHION'}, {'s': at(25, off=-0.1), 'e': end(27, 0.3), 'word': '2 STORE'}]
zooms = [ws[0][0] for ws in W]
sfx = []
for b in B:
    sfx.append(('whoosh_soft', round(b['s'] - 0.1, 3))); sfx.append(('pop_soft', b['sd']))
    if b['heavy']: sfx.append(('hit_soft', b['hd']))
for c in cards: sfx.append(('shimmer', c['s']))
sfx.append(('success_arp', at(40)))
json.dump({'frames': int(round(END * 30)), 'end': END, 'subs': subs, 'beats': B, 'cards': cards, 'zooms': zooms}, open('/home/claude/ai-master-kit/remotion/src/gucci/talk.json', 'w'), ensure_ascii=False, indent=1)
json.dump(sfx, open('/home/claude/ai-master-kit/remotion/src/gucci/talk_sfx.json', 'w'))
win = [(b['s'] - 0.3, b['e'] + 0.3) for b in B if b['heavy']] + [(c['s'] - 0.3, c['e'] + 0.3) for c in cards]
json.dump(win, open('/home/claude/cl3/win.json', 'w'))
print('beats', len(B), 'subs', len(subs), 'win', round(sum(b - a for a, b in win), 1))
