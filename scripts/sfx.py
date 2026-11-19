import numpy as np, wave
SR=48000
def save(n,x):
  x=np.clip(x/ (np.abs(x).max()+1e-9)*0.9,-1,1); y=(x*32767).astype(np.int16)
  w=wave.open(f'/root/bb/sfx/{n}.wav','w');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(y.tobytes())
t=lambda d: np.arange(int(SR*d))/SR
rng=np.random.default_rng(1)
def lp(x,a):  # one-pole lowpass, a per-sample array or scalar
  y=np.zeros_like(x);p=0;a=np.broadcast_to(a,x.shape)
  for i in range(len(x)): p=p+a[i]*(x[i]-p); y[i]=p
  return y
# whoosh: noise with sweeping lowpass, envelope
d=0.55;tt=t(d);n=rng.standard_normal(len(tt))
env=np.sin(np.pi*np.clip(tt/d,0,1))**2
a=0.02+0.25*np.sin(np.pi*tt/d)**2
save('whoosh',lp(n,a)*env)
# swish short
d=0.25;tt=t(d);n=rng.standard_normal(len(tt));save('swish',lp(n,0.35)*np.sin(np.pi*tt/d)**3)
# pop
d=0.12;tt=t(d);f=900*np.exp(-tt*25)+300;ph=2*np.pi*np.cumsum(f)/SR;save('pop',np.sin(ph)*np.exp(-tt*40))
# ding (bell)
d=1.2;tt=t(d);x=sum(a*np.sin(2*np.pi*f*tt)*np.exp(-tt*k) for f,a,k in [(1568,1,4),(3136,.4,6),(4704,.2,8),(2350,.25,5)]);save('ding',x)
# shimmer (sparkle)
d=0.9;tt=t(d);x=np.zeros_like(tt)
for i in range(14):
  s=rng.uniform(0,0.6);f=rng.uniform(2500,6000);m=tt>s;x[m]+=np.sin(2*np.pi*f*(tt[m]-s))*np.exp(-(tt[m]-s)*12)*rng.uniform(.3,1)
save('shimmer',x)
# impact
d=0.9;tt=t(d);f=60+120*np.exp(-tt*18);ph=2*np.pi*np.cumsum(f)/SR
x=np.sin(ph)*np.exp(-tt*5)+lp(rng.standard_normal(len(tt)),0.08)*np.exp(-tt*14)*0.6;save('impact',x)
# click
d=0.04;tt=t(d);save('click',rng.standard_normal(len(tt))*np.exp(-tt*300))
# stamp
d=0.35;tt=t(d);x=lp(rng.standard_normal(len(tt)),0.15)*np.exp(-tt*30)+np.sin(2*np.pi*90*tt)*np.exp(-tt*20);save('stamp',x)
# riser
d=0.8;tt=t(d);f=300+1500*(tt/d)**2;ph=2*np.pi*np.cumsum(f)/SR;x=(np.sin(ph)*0.3+lp(rng.standard_normal(len(tt)),0.05+0.3*tt/d))*(tt/d)**2;save('riser',x)
print('ok')
