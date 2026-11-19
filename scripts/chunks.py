import numpy as np,wave,json,sys
from faster_whisper import WhisperModel
m=WhisperModel('medium',device='cpu',compute_type='int8')
res={}
for c in range(1,7):
  w=wave.open(f'/root/bb/a{c}.wav');x=np.frombuffer(w.readframes(w.getnframes()),np.int16)/32768
  h=800 # 50ms
  r=np.array([20*np.log10(np.sqrt(np.mean(x[i:i+h]**2))+1e-9) for i in range(0,len(x)-h,h)])
  sp=r>-24
  # close small gaps <0.25s
  idx=np.where(sp)[0]; ch=[]
  if len(idx):
    s=idx[0];p=idx[0]
    for i in idx[1:]:
      if i-p>5: ch.append((s,p));s=i
      p=i
    ch.append((s,p))
  ch=[(a*0.05,(b+1)*0.05) for a,b in ch if (b-a)>=3]
  out=[]
  for a,b in ch:
    seg=x[int(max(0,a-0.1)*16000):int((b+0.1)*16000)].astype(np.float32)
    ss,_=m.transcribe(seg,language='vi',condition_on_previous_text=False,initial_prompt='Burberry Hero, Burberry Her, Goddess, Takashimaya, Crescent Mall.')
    t=' '.join(s.text.strip() for s in ss)
    out.append([round(a,2),round(b,2),t]); print(c,f'{a:.2f}-{b:.2f}',t,flush=True)
  res[c]=out
json.dump(res,open('/root/bb/chunks.json','w'),ensure_ascii=False)
