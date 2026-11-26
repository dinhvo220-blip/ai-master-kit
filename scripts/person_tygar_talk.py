import numpy as np, subprocess, cv2, os, time
W,H=1080,1920
win=[(0,2.84),(2.84,9.36),(13.4,21.0),(42.6,46.3),(47.7,49.14),(52.7,56.24),(61.2,64.38),(66.9,72.28)]
inwin=lambda f: any(a*30-8<=f<=b*30+8 for a,b in win)
N=2396; A=np.memmap('/root/w/masks15.u8',np.uint8,'r').reshape(-1,960,540); NA=len(A)
def M(x):
    x=min(max(x,0),2*NA-2); i=int(x//2); t=(x-2*i)/2; j=min(i+1,NA-1)
    return A[i].astype(np.float32)*(1-t)+A[j]*t
dec=subprocess.Popen(['ffmpeg','-v','error','-i','/home/claude/ai-master-kit/remotion/public/tygar_talk/base.mp4','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',f'{W}x{H}','-r','30','-i','-','-c:v','libvpx-vp9','-pix_fmt','yuva420p','-deadline','realtime','-cpu-used','8','-row-mt','1','-b:v','0','-crf','30','-auto-alt-ref','0','/home/claude/ai-master-kit/remotion/public/tygar_talk/person.webm'],stdin=subprocess.PIPE)
prev=None; fr=0
while True:
    b=dec.stdout.read(W*H*3)
    if len(b)<W*H*3: break
    im=np.frombuffer(b,np.uint8).reshape(H,W,3)
    if inwin(fr):
        hum=(0.25*M(fr-1)+0.5*M(fr)+0.25*M(fr+1))/255
        m=cv2.resize(hum,(W,H),interpolation=cv2.INTER_LINEAR).astype(np.float32)
        g=cv2.ximgproc.guidedFilter(guide=im,src=m,radius=7,eps=3e-3)
        al=np.clip((g-0.22)/0.6,0,1)
        if prev is not None and inwin(fr-1): al=0.65*al+0.35*prev
        prev=al
    else:
        al=np.zeros((H,W),np.float32); prev=None
    enc.stdin.write(np.dstack([im,(al*255).astype(np.uint8)]).tobytes())
    if fr%300==0: print(fr,flush=True)
    fr+=1
enc.stdin.close(); enc.wait(); print('done',fr,flush=True)
