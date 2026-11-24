import sys, re, difflib, shutil, os
from lines_chloe import L, SUB
from vieneu import Vieneu
from faster_whisper import WhisperModel
OUT='vseg'; os.makedirs(OUT, exist_ok=True)
only = sys.argv[1].split(',') if len(sys.argv) > 1 else None
tts = Vieneu(); V = tts.get_preset_voice('Thục Đoan')
m = WhisperModel('small', device='cpu', compute_type='int8')
norm = lambda s: re.sub(r'[^\w ]', '', s.lower().replace('-', ''))
for i, (k, d, t) in enumerate(L):
    if only and k not in only: continue
    tt = t
    for a, b in SUB.items(): tt = tt.replace(a, b)
    best = None
    for tr in range(5):
        a = tts.infer(tt, voice=V, temperature=0.7)
        tts.save(a, '/tmp/c.wav')
        segs, _ = m.transcribe('/tmp/c.wav', language='vi', beam_size=2)
        hyp = ' '.join(s.text.strip() for s in segs)
        r = difflib.SequenceMatcher(None, norm(tt), norm(hyp)).ratio()
        if best is None or r > best[0]:
            best = (r, hyp); shutil.copy('/tmp/c.wav', f'{OUT}/{i:02d}_{k}.wav')
        if r > 0.9: break
    print(k, round(best[0], 2), '|', best[1], flush=True)
print('ALLDONE')
