# Lời đã sửa cho clip Chloé đứng nói (25/11/2026) + căn thời gian từng từ theo Whisper medium (full.json).
import json, re, difflib, sys
F = json.load(open('/home/claude/cl3/full.json'))
TX = [
 "Dù là cách xa cả nghìn cây số, nhưng mà các bạn ở Hà Nội vẫn hỏi mình là Gucci Beauty Hà Nội có giảm 20% giống ở Sài Gòn hay không?",
 "Thì đương nhiên là có rồi mọi người ơi, Gucci Beauty ở Sài Gòn giảm 20%,",
 "thì Gucci Beauty ở Vincom Bà Triệu ở Hà Nội cũng giảm 20% cho mọi người luôn nha.",
 "Ngoài ra thì hóa đơn sau giảm trên 5 triệu còn được tặng quà full size nữa nha mọi người ơi.",
 "Cái này thì tùy theo cửa hàng nha mọi người, mỗi cửa hàng sẽ có một danh sách quà tặng full size riêng.",
 "Cho nên để mà tốt nhất thì các bạn nên ra cửa hàng để các bạn được tư vấn kỹ nhất nha.",
 "Thì nhắc đến Gucci thì mọi người không thể nào thiếu son được rồi.",
 "Mọi người, ở đây Darren có son lì nè, son Matte nè.",
 "Thì cái này là màu 505, một cái màu cũng rất là xinh mọi người.",
 "Màu này là một trong những màu best seller của Gucci á.",
 "Mình sẽ có son kem nè,",
 "Brillant, Brillant nó là một dạng son dưỡng có màu mọi người.",
 "Nó rất là nhiều dưỡng.",
 "Đây, xinh lắm.",
 "Nếu mọi người thích hiệu ứng lì thì mọi người có thể chọn son Matte.",
 "Và mọi người thích dưỡng một xíu mà có màu và che phủ cũng tốt tốt,",
 "mọi người chọn Brillant.",
 "Cushion cũng là một thứ rất là đáng để thử của Gucci nha mọi người ơi.",
 "Trong dịp Black Friday này thì mọi người nên ra để mà mua một em Cushion của Gucci thử, để mọi người sẽ ghiền liền luôn đó.",
 "Má hồng cũng giảm 20% cho mọi người luôn, và đặc biệt là nước hoa cũng giảm 20% cho mọi người luôn.",
 "Tuy nhiên thì dịp Black Friday này diễn ra từ ngày 20 tháng 11 đến 30 tháng 11, thì hôm nay là 25, 26 rồi.",
 "Thì có thể là một số hàng nó sẽ hết đó mọi người, tại vì đợt này giảm sâu quá mà đúng không?",
 "Vì vậy, nếu mà được thì mọi người cứ ra cửa hàng để mọi người thử nha.",
 "Còn không thì mọi người cứ inbox cho Darren để Darren sẽ gửi contact của người",
 "Và mọi người nhớ nha, mọi người inbox kèm theo tên brand, Darren sẽ gửi contact của brand đó cho mọi người nha.",
 "Và hiện tại Gucci Beauty thì có 2 chi nhánh:",
 "Hồ Chí Minh sẽ có ở Crescent Mall quận 7,",
 "và Hà Nội sẽ có ở Vincom Bà Triệu nha mọi người ơi.",
 "Và đặc biệt là 2 store này đều có khắc tên cho mọi người luôn.",
 "Cho nên là mọi người có dự định săn deal mà được cá nhân hóa khắc tên",
 "thì mọi người nhanh tay ra store nha.",
 "Black Friday này Darren thấy ưu đãi rất là lớn luôn mọi người.",
 "Và Darren hi vọng cái clip này sẽ đến kịp với mọi người để mọi người có thể ra store gần nhất,",
 "hoặc ít nhất mọi người hãy comment để Darren có thể gửi BA tư vấn cho mọi người nha.",
 "Để cho mùa lễ hội thú vị và có những cái deal hời cho mọi người,",
 "Darren sẽ cố gắng cập nhật nhanh nhất có thể cho mọi người.",
 "Và gần đây Darren đã liên tục cập nhật Black Friday cho mọi người rồi đó.",
 "Và nhớ follow Darren để cập nhật thêm nhiều thông tin về sản phẩm nè,",
 "ưu đãi tại store nè, hoạt động tại store nè,",
 "và tất tần tật về beauty của tất cả các brand luôn nha mọi người ơi.",
 "Cảm ơn mọi người đã xem hết video.",
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
json.dump(out, open('/home/claude/cl3/words.json', 'w'), ensure_ascii=False)
