import numpy as np, subprocess, onnxruntime as ort, cv2, time, sys
W,H=540,960
so=ort.SessionOptions(); so.intra_op_num_threads=2
s=ort.InferenceSession('/root/.rembg/models/u2net_human_seg/u2net_human_seg.onnx',so,providers=['CPUExecutionProvider'])
iname=s.get_inputs()[0].name
p=subprocess.Popen(['ffmpeg','-v','error','-i','/root/bb/base_v.mp4','-vf',f'select=not(mod(n\\,2)),scale={W}:{H}','-vsync','0','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
out=open('/root/bb/masks15.u8','wb'); n=0; t=time.time()
mean=np.array([0.485,0.456,0.406]);std=np.array([0.229,0.224,0.225])
while True:
  b=p.stdout.read(W*H*3)
  if len(b)<W*H*3: break
  im=np.frombuffer(b,np.uint8).reshape(H,W,3)
  x=cv2.resize(im,(320,320),interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
  x=x/ x.max(); x=(x-mean)/std
  x=x.transpose(2,0,1)[None].astype(np.float32)
  d=s.run(None,{iname:x})[0][0,0]
  d=(d-d.min())/(d.max()-d.min()+1e-8)
  m=cv2.resize((d*255).astype(np.uint8),(W,H),interpolation=cv2.INTER_LANCZOS4)
  out.write(m.tobytes()); n+=1
  if n%50==0: print(n,round((time.time()-t)/n,3),flush=True)
out.close(); print('done',n,flush=True)
