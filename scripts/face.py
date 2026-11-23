# Haar: curl -sSL -o /root/bb/haar.xml https://raw.githubusercontent.com/opencv/opencv/4.x/data/haarcascades/haarcascade_frontalface_default.xml
import cv2,subprocess,numpy as np,json
cc=cv2.CascadeClassifier('/root/bb/haar.xml')
p=subprocess.Popen(['ffmpeg','-v','error','-i','/root/bb/src_n.mov','-vf','select=not(mod(n\\,3)),scale=360:640,format=gray','-vsync','0','-f','rawvideo','-'],stdout=subprocess.PIPE)
out=[];n=0
while True:
  b=p.stdout.read(360*640)
  if len(b)<360*640: break
  g=np.frombuffer(b,np.uint8).reshape(640,360)
  fs=cc.detectMultiScale(g,1.1,5,minSize=(50,50))
  if len(fs): x,y,w,h=max(fs,key=lambda r:r[2]*r[3]); out.append([n*3,int(x*3),int(y*3),int(w*3),int(h*3)])
  else: out.append([n*3,None,None,None,None])
  n+=1
json.dump(out,open('/root/bb/faces.json','w')); print('done',n,sum(1 for o in out if o[1] is not None))
