import sys, re, difflib, shutil, os
sys.path.insert(0, '/home/claude/tts')
from lines2 import L
from vieneu import Vieneu
from faster_whisper import WhisperModel
REF = sys.argv[1]; OUT = sys.argv[2]
only = sys.argv[3].split(',') if len(sys.argv) > 3 else None
os.makedirs(OUT, exist_ok=True)
SUB = {'Prorsum': 'Pror-sum'}  # cách viết giúp model đọc đúng tiếng Anh
tts = Vieneu(onnx_dir='/home/claude/vn/onnx_update')
m = WhisperModel('small', device='cpu', compute_type='int8')
norm = lambda s: re.sub(r'[^\w ]', '', s.lower().replace('-', ''))
for i, (k, d, t) in enumerate(L):
    if only and k not in only: continue
    tt = t
    for a, b in SUB.items(): tt = tt.replace(a, b)
    best = None
    for tr in range(4):
        a = tts.infer(tt, ref_audio=REF, denoise=True, temperature=0.75)
        tts.save(a, '/tmp/c.wav')
        segs, _ = m.transcribe('/tmp/c.wav', language='vi', beam_size=2)
        hyp = ' '.join(s.text.strip() for s in segs)
        r = difflib.SequenceMatcher(None, norm(t), norm(hyp)).ratio()
        if best is None or r > best[0]:
            best = (r, hyp); shutil.copy('/tmp/c.wav', f'{OUT}/{i:02d}_{k}.wav')
        if r > 0.93: break
    print(k, round(best[0], 2), '|', best[1], flush=True)
