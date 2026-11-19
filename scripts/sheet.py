import sys
from PIL import Image, ImageDraw
fr=sys.argv[2:]; ims=[]
for f in fr:
  im=Image.open(f'/root/ai-master/out/s{f}.png').convert('RGB'); d=ImageDraw.Draw(im)
  d.rectangle([70,245,890,1535],outline=(255,0,0),width=4); ims.append(im.resize((360,640)))
W=Image.new('RGB',(360*4,640*((len(ims)+3)//4)),'white')
for i,im in enumerate(ims): W.paste(im,((i%4)*360,(i//4)*640))
W.save(sys.argv[1],quality=85)
