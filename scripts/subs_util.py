import re
nz = lambda s: re.sub(r'[^\wÀ-ỹ% ]', '', s.lower())
def make_subs(W, O):
    # ---- phụ đề: ngắt theo mệnh đề, tách mệnh đề dài ở chỗ tự nhiên, không tách từ ghép ----
    KEY = {'gucci', 'beauty', 'hà', 'nội', 'sài', 'gòn', 'matte', 'brillant', 'cushion', '505', 'khắc', 'tên', 'inbox', 'brand', 'crescent', 'vincom', 'bà', 'triệu', 'quà', 'má', 'hồng', 'nước', '20', '30', 'darren', 'chloé', 'signature', 'nơ', 'paris', 'lụa', 'nếp', 'gấp', 'xếp', 'ly', 'ruy', 'băng', 'cổ', 'áo', 'tự', 'do', 'nữ', 'tính', 'sương', 'trẻo', 'ngọt', 'ấm', 'áp', '20%', 'full', 'size', '5', 'triệu', 'crescent', 'mall', 'quận', '7', 'black', 'friday', 'sơ', 'mi', 'nhẹ', 'nhàng', 'bay', 'bổng', 'thu', 'nhỏ'}
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
            cl.append({'w': t, 's': O(s), 'e': O(e), **({'k': 1} if nz(t) in KEY else {})})
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
    return subs
