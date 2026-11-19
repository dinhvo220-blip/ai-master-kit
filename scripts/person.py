import numpy as np,subprocess,cv2,json
FR=int(round(json.load(open('/root/bb/K3.json'))[-1]['T1']*30))
mk=np.fromfile('/root/bb/masks30.u8',np.uint8).reshape(-1,960,540)
n=len(mk)
W,H=1080,1920
dec=subprocess.Popen(['ffmpeg','-v','error','-i','/root/bb/base_v.mp4','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',f'{W}x{H}','-r','30','-i','-','-c:v','libvpx-vp9','-pix_fmt','yuva420p','-deadline','realtime','-cpu-used','8','-row-mt','1','-b:v','0','-crf','32','-auto-alt-ref','0','/root/ai-master/public/person.webm'],stdin=subprocess.PIPE)
for fr in range(FR):
  b=dec.stdout.read(W*H*3)
  if len(b)<W*H*3: break
  j=min(fr,n-1); jm=max(j-1,0); jp=min(j+1,n-1)
  m=(0.25*mk[jm].astype(np.float32)+0.5*mk[j]+0.25*mk[jp])/255
  a=cv2.resize(m,(W,H),interpolation=cv2.INTER_LINEAR)
  a=cv2.GaussianBlur(a,(0,0),1.3)
  a=np.clip((a-0.15)/0.7,0,1)
  im=np.frombuffer(b,np.uint8).reshape(H,W,3)
  rows=np.where((mk[j]>128).sum(1)>12)[0]
  if len(rows):
    top=rows[0]*2; cols=np.where((mk[j][rows[0]:rows[0]+120]>128).any(0))[0]
    hw=(cols.max()-cols.min())*2 if len(cols) else 400
    y0=max(0,top-40); y1=min(H,top+int(0.22*hw))
    lum=im[y0:y1].astype(np.float32).mean(2)
    keep=np.clip((135-lum)/40,0,1)
    a[y0:y1]*=cv2.GaussianBlur(keep,(0,0),1.5)
  enc.stdin.write(np.dstack([im,(a*255).astype(np.uint8)]).tobytes())
  if fr%300==0: print(fr,flush=True)
enc.stdin.close(); enc.wait(); print('done')
