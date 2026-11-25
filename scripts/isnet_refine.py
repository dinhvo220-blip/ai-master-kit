import numpy as np, onnxruntime as ort, cv2, time, sys
so=ort.SessionOptions(); so.intra_op_num_threads=2
S=ort.InferenceSession('/root/.rembg/models/isnet-general-use/isnet-general-use.onnx',so,providers=['CPUExecutionProvider'])
IN=S.get_inputs()[0].name
def isnet(rgb):
    x=cv2.resize(rgb,(1024,1024),interpolation=cv2.INTER_LINEAR).astype(np.float32)/255.
    x=(x-0.5)/1.0; x=x.transpose(2,0,1)[None]
    d=S.run(None,{IN:x})[0][0,0]; d=(d-d.min())/(d.max()-d.min()+1e-8)
    return cv2.resize(d,(rgb.shape[1],rgb.shape[0]))
mk=np.fromfile('masks15.u8',np.uint8).reshape(-1,960,540)
def human(srcf):
    i=min(int(round(srcf/2)),len(mk)-1); return cv2.resize(mk[i].astype(np.float32)/255,(1080,1920))
def refine(rgb, hum, isn):
    h=(hum>0.5).astype(np.uint8)
    near=cv2.dilate(h,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(181,181)))
    a=np.maximum(hum, isn*near)
    gray=cv2.cvtColor(rgb,cv2.COLOR_RGB2GRAY)
    g=cv2.ximgproc.guidedFilter(guide=rgb, src=a.astype(np.float32), radius=6, eps=1e-3)
    return np.clip((g-0.1)/0.8,0,1)
if __name__=='__main__' and False:
    for t in [5.3, 48.4, 86.8]:
        cap=cv2.VideoCapture('src_n.mp4'); cap.set(cv2.CAP_PROP_POS_FRAMES,int(t*30)); ok,bgr=cap.read(); rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)
        t0=time.time(); isn=isnet(rgb); print('isnet',round(time.time()-t0,2))
        a=refine(rgb,human(t*30),isn)
        bg=np.zeros_like(rgb); bg[:]=(60,200,120)
        comp=(rgb*a[...,None]+bg*(1-a[...,None])).astype(np.uint8)
        old=human(t*30); oc=(rgb*old[...,None]+bg*(1-old[...,None])).astype(np.uint8)
        cv2.imwrite(f'cmp_{t}.jpg',cv2.cvtColor(np.hstack([oc,comp])[::2,::2],cv2.COLOR_RGB2BGR))
