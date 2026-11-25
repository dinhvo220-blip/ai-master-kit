# person.webm v2: trong các cửa sổ có nền thay/chữ sau người -> union(u2net_human_seg, isnet ∩ vùng quanh người) + guided filter (giữ chai nước hoa, mép tóc nét)
import numpy as np, subprocess, cv2, json, os
mk = np.fromfile('masks15.u8', np.uint8).reshape(-1, 960, 540); n = len(mk)
W, H = 1080, 1920; CUT_F = 50.55 * 30; SHIFT = 1.65 * 30
win = json.load(open('win.json'))
inwin = lambda f: any(a * 30 - 6 <= f <= b * 30 + 6 for a, b in win)
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', '/root/ai-master/public/chloe_base.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', '30', '-i', '-', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-deadline', 'realtime', '-cpu-used', '8', '-row-mt', '1', '-b:v', '0', '-crf', '28', '-auto-alt-ref', '0', '/home/claude/cl2/person_v2.webm'], stdin=subprocess.PIPE)
def M(x):
    x = min(max(x, 0), (n - 1) * 2); i = int(x // 2); fr = (x - 2 * i) / 2; j = min(i + 1, n - 1)
    return (mk[i].astype(np.float32) * (1 - fr) + mk[j] * fr)
cache = {}
def ISN(f):
    if f in cache: return cache[f]
    p = f'isn/{f}.png'
    v = cv2.imread(p, 0).astype(np.float32) / 255 if os.path.exists(p) else None
    cache[f] = v
    if len(cache) > 8: cache.pop(next(iter(cache)))
    return v
K = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (91, 91))
fr = 0
while True:
    b = dec.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    im = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    s = fr if fr < CUT_F else fr + SHIFT
    hum = (0.25 * M(s - 1) + 0.5 * M(s) + 0.25 * M(s + 1)) / 255
    iv = None
    if inwin(fr):
        e = fr - fr % 2; a, c = ISN(e), ISN(e + 2)
        iv = a if fr % 2 == 0 else (a if c is None else (c if a is None else (a + c) / 2))
    if iv is not None:
        near = cv2.dilate((hum > 0.5).astype(np.uint8), K)
        m = np.maximum(hum, iv * near)
        m = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
        g = cv2.ximgproc.guidedFilter(guide=im, src=m.astype(np.float32), radius=5, eps=2e-3)
        al = np.clip((g - 0.22) / 0.6, 0, 1)
        nl, lab, st, _ = cv2.connectedComponentsWithStats((al > 0.5).astype(np.uint8), 8)
        if nl > 2:
            keep = np.zeros(nl, bool); keep[1:] = st[1:, cv2.CC_STAT_AREA] > 6000
            al = al * cv2.GaussianBlur(keep[lab].astype(np.float32), (0, 0), 3)
    else:
        al = cv2.resize(hum, (W, H), interpolation=cv2.INTER_LINEAR)
        al = np.clip((cv2.GaussianBlur(al, (0, 0), 1.3) - 0.15) / 0.7, 0, 1)
    enc.stdin.write(np.dstack([im, (al * 255).astype(np.uint8)]).tobytes())
    if fr % 300 == 0: print(fr, flush=True)
    fr += 1
enc.stdin.close(); enc.wait(); print('done', fr)
