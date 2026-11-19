import numpy as np,wave,json
SR=48000
w=wave.open('/root/bb/base_a.wav');v=np.frombuffer(w.readframes(w.getnframes()),np.int16).reshape(-1,2).astype(np.float32)/32768
mix=v.copy(); N=len(v)
for name,t,db in json.load(open('/root/bb/sfx_events.json')):
  s=wave.open(f'/root/bb/sfx/{name}.wav');x=np.frombuffer(s.readframes(s.getnframes()),np.int16).astype(np.float32)/32768
  g=10**(db/20)*0.5; a=int(max(0,t)*SR); b=min(N,a+len(x))
  if b>a: mix[a:b]+=(x[:b-a]*g)[:,None]
mix=np.clip(mix,-1,1)
o=wave.open('/root/bb/mix.wav','w');o.setnchannels(2);o.setsampwidth(2);o.setframerate(SR);o.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok',len(json.load(open('/root/bb/sfx_events.json'))),'sfx')
