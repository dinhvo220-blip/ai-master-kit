# person.webm (alpha) cho base đã cắt: out frame f -> src frame (cắt 50.55–52.20)
import numpy as np, subprocess, cv2
mk = np.fromfile('/home/claude/cl2/masks15.u8', np.uint8).reshape(-1, 960, 540); n = len(mk)
W, H = 1080, 1920; CUT_F = 50.55 * 30; SHIFT = 1.65 * 30
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', '/root/ai-master/public/chloe_base.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', '30', '-i', '-', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-deadline', 'realtime', '-cpu-used', '8', '-row-mt', '1', '-b:v', '0', '-crf', '32', '-auto-alt-ref', '0', '/root/ai-master/public/chloe_person.webm'], stdin=subprocess.PIPE)
def M(x):
    x = min(max(x, 0), (n - 1) * 2); i = int(x // 2); fr = (x - 2 * i) / 2; j = min(i + 1, n - 1)
    return (mk[i].astype(np.float32) * (1 - fr) + mk[j] * fr)
fr = 0
while True:
    b = dec.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    s = fr if fr < CUT_F else fr + SHIFT
    m = (0.25 * M(s - 1) + 0.5 * M(s) + 0.25 * M(s + 1)) / 255
    a = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
    a = cv2.GaussianBlur(a, (0, 0), 1.3); a = np.clip((a - 0.15) / 0.7, 0, 1)
    im = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    enc.stdin.write(np.dstack([im, (a * 255).astype(np.uint8)]).tobytes())
    if fr % 300 == 0: print(fr, flush=True)
    fr += 1
enc.stdin.close(); enc.wait(); print('done', fr)
