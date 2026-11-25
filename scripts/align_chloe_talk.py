# Lời đã sửa cho clip Chloé đứng nói (25/11/2026) + căn thời gian từng từ theo Whisper medium (full.json).
import json, re, difflib, sys
F = json.load(open('/home/claude/cl2/full.json'))
TX = [
 "Ở đây có bạn nào biết vì sao dòng Chloé Signature luôn có một chiếc nơ trên chai nước hoa không?",
 "Chúng mình cùng quay về nguồn gốc của Chloé trước nha.",
 "Chloé là một trong những nhà mốt nổi tiếng ở Paris, và nổi tiếng nhất của Chloé là những chiếc áo sơ mi lụa nhẹ nhàng, bay bổng.",
 "Khi làm nước hoa thì họ lấy chính những chiếc áo đó để làm cảm hứng.",
 "Thân chai thì có những nếp gấp như là vải lụa xếp ly.",
 "Còn chiếc nơ ruy băng buộc trên chai gợi nhớ đến những chiếc nơ cổ áo đặc trưng của Chloé.",
 "Và Chloé là một nhà mốt luôn theo đuổi sự nhẹ nhàng, tự do và nữ tính,",
 "và ngay cả trong những cái mùi hương, những nốt hương trong chai nước hoa cũng có những điều đó.",
 "Đọc được một cái đoạn mô tả như thế này mọi người ơi:",
 "Mùi hương của Chloé giống như là buổi sáng mở cửa sổ ở Paris,",
 "gió đưa vào một cái mùi hương hoa còn đọng sương, trong trẻo và hơi ngọt nhẹ.",
 "Có những nốt hoa của Chloé, nó tươi mát, giống như là bạn đi ngang một tiệm hoa, một bó hoa mới cắt ra vậy đó.",
 "Và đương nhiên là không thể thiếu những mùi ấm áp như là những buổi tối ở Paris được rồi mọi người.",
 "Trong lúc mà Darren tìm hiểu về chai nước hoa của Chloé, Darren thấy là chai nước hoa không còn đơn thuần là một chai nước hoa nữa, mà",
 "Chloé tạo ra một chai nước hoa giống như là một chiếc áo sơ mi thu nhỏ, một điểm đặc trưng rất là Chloé luôn.",
 "Không còn đơn thuần là một chai nước hoa có một cái nơ trên này nữa.",
 "Ok, và hiện tại Chloé đang có chương trình Black Friday giảm giá 20% cho tất cả các dòng nước hoa.",
 "Và đặc biệt là mọi người mua nước hoa hóa đơn trên 5 triệu thì mọi người sẽ được quà tặng full size nữa.",
 "Đó, hấp dẫn luôn đó mọi người.",
 "Hiện tại thì Darren đang đứng ở Chloé Crescent Mall quận 7 nha,",
 "để mọi người biết nha.",
 "Điều thú vị nữa là Darren muốn tìm hiểu về những cái lịch sử thương hiệu,",
 "cũng như là tại sao một cái chai nước hoa lại có cái hình như thế này.",
 "Darren luôn có những câu hỏi trong đầu như vậy đó.",
 "Và Darren cũng thích được chia sẻ những cái câu chuyện này đến với mọi người.",
 "Ok, và cảm ơn mọi người đã xem hết video.",
]
assert len(TX) == len(F), (len(TX), len(F))
norm = lambda s: re.sub(r'[^\wÀ-ỹ%]', '', s.lower())
out = []
for i, seg in enumerate(F):
    rec = [(w['s'], w['e'], norm(w['w'])) for w in seg['w']]; st, en = seg['s'], seg['e']
    toks = TX[i].split(); nt = [norm(t) for t in toks]
    sm = difflib.SequenceMatcher(a=nt, b=[r[2] for r in rec], autojunk=False)
    tm = [None] * len(toks)
    for bl in sm.get_matching_blocks():
        for j in range(bl.size): tm[bl.a + j] = [rec[bl.b + j][0], rec[bl.b + j][1]]
    L = [max(1, len(t)) for t in toks]; res = list(tm)
    idx = [j for j, x in enumerate(tm) if x]
    bounds = [(-1, st)] + [(j, tm[j][0]) for j in idx] + [(len(toks), en)]
    for (ja, ta), (jb, tb) in zip(bounds[:-1], bounds[1:]):
        gap = list(range(ja + 1, jb))
        if not gap: continue
        t0 = res[ja][1] if ja >= 0 else ta; t1 = tb
        if t1 <= t0 + 0.1 * len(gap): t1 = t0 + 0.18 * len(gap)
        tot = sum(L[g] for g in gap); c = t0
        for g in gap:
            d = (t1 - t0) * L[g] / tot; res[g] = [c, c + d]; c += d
    for j in range(1, len(res)):
        if res[j][0] < res[j - 1][0]: res[j][0] = res[j - 1][0]
        if res[j][1] < res[j][0] + 0.06: res[j][1] = res[j][0] + 0.06
    out.append([[round(x[0], 3), round(x[1], 3), t] for x, t in zip(res, toks)])
    print(i, len(idx), '/', len(toks), toks[0], res[0][0])
json.dump(out, open('/home/claude/cl2/words.json', 'w'), ensure_ascii=False)
