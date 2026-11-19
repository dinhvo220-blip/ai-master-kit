cd ~/ai-master
for fr in "$@"; do npx remotion still src/index.ts Gucci out/s$fr.png --frame=$fr --browser-executable=/usr/bin/google-chrome 2>&1 | grep -E "Error|error" | head -3; done
python3 - "$@" <<'PY'
import sys
from PIL import Image, ImageDraw
ims=[]
for fr in sys.argv[1:]:
  im=Image.open(f'/root/ai-master/out/s{fr}.png').convert('RGB'); d=ImageDraw.Draw(im)
  d.rectangle([70,245,890,1535],outline=(255,0,0),width=4); d.text((20,20),fr,fill=(255,0,0))
  ims.append(im.resize((360,640)))
W=Image.new('RGB',(360*len(ims),640)); [W.paste(im,(i*360,0)) for i,im in enumerate(ims)]; W.save('/root/ai-master/out/sheet.jpg',quality=85)
PY
