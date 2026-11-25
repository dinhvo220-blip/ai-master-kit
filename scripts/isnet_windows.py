# isnet-general-use cho các khung cần tách nền (out frame chẵn trong cửa sổ) -> isn/<f>.png (540x960)
import json, os, numpy as np, cv2, subprocess, time
from m2 import isnet
win = json.load(open('win.json')); os.makedirs('isn', exist_ok=True)
CUT, SH = 50.55, 1.65
need = sorted({f for a, b in win for f in range(max(0, int(a * 30)) // 2 * 2, int(b * 30) + 2, 2)})
print('frames', len(need), flush=True)
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', '/root/ai-master/public/chloe_base.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
S = set(need); fr = 0; t0 = time.time(); n = 0
while True:
    b = dec.stdout.read(1080 * 1920 * 3)
    if len(b) < 1080 * 1920 * 3: break
    if fr in S and not os.path.exists(f'isn/{fr}.png'):
        rgb = np.frombuffer(b, np.uint8).reshape(1920, 1080, 3)
        d = isnet(rgb); cv2.imwrite(f'isn/{fr}.png', (cv2.resize(d, (540, 960)) * 255).astype(np.uint8)); n += 1
        if n % 25 == 0: print(n, round((time.time() - t0) / n, 2), flush=True)
    fr += 1
print('done', n, flush=True)
