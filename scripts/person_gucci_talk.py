# gucci_person.webm: u2net_human_seg (masks15) + guided filter trong cửa sổ có chữ sau người / khung
import numpy as np, subprocess, cv2, json
import os, time
A = np.fromfile('masksA.u8', np.uint8).reshape(-1, 960, 540); NA = len(A); S0 = NA * 2
TOTB = (3816 - S0 + 3) // 4
def loadB():
    global B
    B = np.fromfile('masksB.u8', np.uint8).reshape(-1, 960, 540) if os.path.exists('masksB.u8') else np.zeros((0, 960, 540), np.uint8)
loadB()
W, H = 1080, 1920
win = json.load(open('win.json'))
inwin = lambda f: any(a * 30 - 6 <= f <= b * 30 + 6 for a, b in win)
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', '/root/ai-master/public/gucci_base.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', '30', '-i', '-', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-deadline', 'realtime', '-cpu-used', '8', '-row-mt', '1', '-b:v', '0', '-crf', '30', '-auto-alt-ref', '0', '/home/claude/cl3/person.webm'], stdin=subprocess.PIPE)
def M(x):
    x = max(x, 0)
    if x < S0 - 2:
        i = int(x // 2); fr_ = (x - 2 * i) / 2; j = min(i + 1, NA - 1)
        return A[i].astype(np.float32) * (1 - fr_) + A[j] * fr_
    if x < S0:
        return A[NA - 1].astype(np.float32) * (S0 - x) / 2 + B[0] * (1 - (S0 - x) / 2) if len(B) else A[NA - 1].astype(np.float32)
    y = (x - S0) / 4; i = min(int(y), len(B) - 1); j = min(i + 1, len(B) - 1); t = y - int(y)
    return B[i].astype(np.float32) * (1 - t) + B[j] * t
fr = 0
while True:
    b = dec.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    im = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    while fr >= S0 - 2 and len(B) < min(TOTB, (fr - S0) // 4 + 3) and 'done' not in open('matteB.log').read():
        time.sleep(5); loadB()
    hum = (0.25 * M(fr - 1) + 0.5 * M(fr) + 0.25 * M(fr + 1)) / 255
    if inwin(fr):
        m = cv2.resize(hum, (W, H), interpolation=cv2.INTER_LINEAR).astype(np.float32)
        g = cv2.ximgproc.guidedFilter(guide=im, src=m, radius=5, eps=2e-3)
        al = np.clip((g - 0.2) / 0.6, 0, 1)
    else:
        al = np.zeros((H, W), np.float32)
    enc.stdin.write(np.dstack([im, (al * 255).astype(np.uint8)]).tobytes())
    if fr % 300 == 0: print(fr, flush=True)
    fr += 1
enc.stdin.close(); enc.wait(); print('done', fr)
