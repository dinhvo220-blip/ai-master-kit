import json,re,difflib,numpy as np
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio
K=json.load(open('/root/bb/K3.json'))
a=decode_audio('/root/bb/base_a.wav',16000)
m=WhisperModel('medium',device='cpu',compute_type='int8')
norm=lambda s: re.sub(r'[^\wÀ-ỹ%/]','',s.lower())
out=[]
for i,k in enumerate(K):
  s0=k['T0']; seg=a[int(s0*16000):int(k['T1']*16000)]
  ss,_=m.transcribe(seg,language='vi',word_timestamps=True,condition_on_previous_text=False,initial_prompt='Burberry Hero, Burberry Her, Goddess.')
  rec=[(w.start+s0,w.end+s0,norm(w.word)) for x in ss for w in x.words]
  toks=k['text'].split(); nt=[norm(t) for t in toks]
  if difflib.SequenceMatcher(a=nt,b=[r[2] for r in rec],autojunk=False).ratio()<0.5:
    ss,_=m.transcribe(seg,language='vi',word_timestamps=True,condition_on_previous_text=False,vad_filter=True)
    rec=[(w.start+s0,w.end+s0,norm(w.word)) for x in ss for w in x.words]
  sm=difflib.SequenceMatcher(a=nt,b=[r[2] for r in rec],autojunk=False)
  tm=[None]*len(toks)
  for bl in sm.get_matching_blocks():
    for j in range(bl.size): tm[bl.a+j]=(rec[bl.b+j][0],rec[bl.b+j][1])
  # speech span
  st=k['T0']+k['pad']; en=k['T1']-0.08
  # anchors
  idx=[j for j,x in enumerate(tm) if x]
  L=[max(1,len(t)) for t in toks]
  res=[None]*len(toks)
  for j in idx: res[j]=list(tm[j])
  # fill gaps by interpolation between anchors
  bounds=[(-1,st)]+[(j,tm[j][0]) for j in idx]+[(len(toks),en)]
  for (ja,ta),(jb,tb) in zip(bounds[:-1],bounds[1:]):
    gap=list(range(ja+1,jb))
    if not gap: continue
    t0=res[ja][1] if ja>=0 else ta; t1=tb
    if t1<=t0: t1=t0+0.15*len(gap)
    tot=sum(L[g] for g in gap); c=t0
    for g in gap:
      d=(t1-t0)*L[g]/tot; res[g]=[c,c+d]; c+=d
  # monotonic fix
  for j in range(1,len(res)):
    if res[j][0]<res[j-1][0]: res[j][0]=res[j-1][0]
    if res[j][1]<res[j][0]+0.05: res[j][1]=res[j][0]+0.05
  out.append([[round(x[0],3),round(x[1],3),t] for x,t in zip(res,toks)])
  print(i,sum(1 for x in tm if x),'/',len(toks),' '.join(r[2] for r in rec)[:120],flush=True)
json.dump(out,open('/root/bb/words3.json','w'),ensure_ascii=False)
