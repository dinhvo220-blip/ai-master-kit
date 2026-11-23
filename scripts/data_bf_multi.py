# Beat plan: Black Friday multi-brand (Burberry, Chloé, Bvlgari, Gucci Beauty) – style Modern Clean, 23/11/2026
# Clip 1 file không cắt: base = src_n.mov (1080x1920@30), lời đã sửa ở /root/bb/words_m.json (align_m.py)
import json,re,os,numpy as np
W=json.load(open('/root/bb/words_m.json'))
TOT=3764/30; FR=3764
OUT='/root/ai-master/src/modern/bf_multi.json'
norm=lambda s: re.sub(r'[^\wÀ-ỹ%/]','',s.lower())
def at(i,phrase,n=1,end=False):
  p=[norm(x) for x in phrase.split()]; ws=W[i]; nt=[norm(w[2]) for w in ws]; c=0
  for j in range(len(nt)-len(p)+1):
    if nt[j:j+len(p)]==p:
      c+=1
      if c==n: return ws[j+len(p)-1][1] if end else ws[j][0]
  raise Exception(f'not found {i} {phrase}')
S=lambda i: W[i][0][0]
# ---- head track
mk=np.memmap('/root/bb/masks30.u8',np.uint8,'r').reshape(-1,960,540)
tops=[];xs=[];wd=[]
for m in mk[::2]:
  rows=np.where((m>128).sum(1)>12)[0]; top=rows[0] if len(rows) else 250
  band=m[top:top+90]>128; cols=np.where(band.any(0))[0]
  hb=m[top+60:top+140]>128; c2=np.where(hb.any(0))[0]
  tops.append(top*2); xs.append((cols.mean() if len(cols) else 270)*2); wd.append((c2.max()-c2.min())*2 if len(c2) else 400)
def smooth(a,k=7):
  a=np.array(a,float); w=np.exp(-np.linspace(-2,2,2*k+1)**2); w/=w.sum()
  return np.convolve(np.pad(a,k,mode='edge'),w,'valid')
from scipy.ndimage import median_filter
wd=np.minimum(np.array(wd,float),median_filter(np.array(wd,float),size=31,mode='nearest'))  # bỏ gai do tay giơ cạnh đầu
tops,xs,wd=smooth(tops),smooth(xs),smooth(wd)
head=[]
for fr in range(FR):
  j=min(fr//2,len(tops)-1); j2=min(j+1,len(tops)-1); a=(fr%2)/2
  t=tops[j]*(1-a)+tops[j2]*a; x=xs[j]*(1-a)+xs[j2]*a; w=wd[j]*(1-a)+wd[j2]*a
  head.append([round(x,1),round(t+260,1),round(t,1),round(w,1)])


# ---- vị trí mặt (Haar, mỗi 3 frame) -> hộp mặt nới rộng, để chữ/thẻ né mặt
FC=json.load(open('/root/bb/faces.json'))
# (head phải tính trước) 
fx=np.array([[o[0]]+o[1:] for o in FC if o[1] is not None],float)
def facebox(fr):
  hx,_,ht,hw=head[min(fr,FR-1)]
  i=np.searchsorted(fx[:,0],fr); i=min(max(i,0),len(fx)-1)
  x,y,w,h=fx[i,1:]
  ok=abs(fr-fx[i,0])<=6 and abs(x+w/2-hx)<0.45*hw and w<1.15*hw and y>ht
  if not ok: x,w,y,h=hx-0.42*hw,0.84*hw,ht+0.3*hw,0.84*hw
  return [x-0.12*w, y-0.3*h, x+1.12*w, y+1.12*h]
def faceU(s,e):
  bs=[facebox(fr) for fr in range(int(s*30),int(e*30)+1,3)]
  b=np.array(bs); return [np.percentile(b[:,0],5),np.percentile(b[:,1],5),np.percentile(b[:,2],95),np.percentile(b[:,3],95)]
def hit(r,b): return not (r[2]<b[0] or r[0]>b[2] or r[3]<b[1] or r[1]>b[3])
SUBTOP=1330

D=dict(titlesFront=[],covers=[],base='src_n.mp4',person='person.webm',frames=FR,head=head,shots=[],punches=[],cuts=[],shakes=[],titles=[],chapters=[],chips=[],infos=[],bigs=[],
       timelines=[],montages=[],brands=[],endcards=[],flashes=[],bokeh=[],hideSubs=[],noteHi=[],noteHide=[],subY=[],sfx=[])
def title(s,e,big,small=None,size=None,**kw):
  sz=int(min(size or 190,790/(len(big)*0.8)))
  tp=float(np.median([head[min(int(t),FR-1)][2] for t in range(int(s*30),int(e*30)+1)]))
  y=max(318,tp+22-sz*0.98-(52 if small else 0))
  # % chữ bị người che (tách nền) -> nếu che nhiều: đưa chữ ra trước (trên tóc, không chạm mặt) hoặc làm cover full màn
  tw=min(820,len(big)*sz*0.8); x0=int((480-tw/2)/2); x1=int((480+tw/2)/2); ya=int((y+(52 if small else 0))/2); yb=int((y+(52 if small else 0)+0.7*sz)/2)
  cov=np.percentile([ (mk[fr][ya:yb,x0:x1]>128).mean() for fr in range(int(s*30),int(e*30),6)],75)
  fb=faceU(s,e); bottom=y+(52 if small else 0)+sz
  if cov>0.08 or kw.pop('force',0):
    if bottom<fb[1]-6:
      D['titlesFront'].append(dict(s=s,e=e,big=big,small=small,size=sz,y=round(y),color='#FFFFFF',glow=False,shadow=1,**kw)); print('title FRONT',big,round(cov,2)); return
    ws=big.split(); lines=[big] if len(big)<=12 else [' '.join(ws[:1]),' '.join(ws[1:])]
    D['covers'].append(dict(s=s,e=min(e,s+(2.2 if len(lines)>1 else 1.7)),small=small,lines=lines,size=min(150,int(790/(max(len(l) for l in lines)*0.8))),y=640 if len(lines)>1 else 700)); D['hideSubs'].append(dict(s=s,e=min(e,s+1.7)))
    print('title COVER',big,round(cov,2)); return
  D['titles'].append(dict(s=s,e=e,big=big,small=small,size=sz,y=round(y),**kw))
def chipsize(it):
  sz=it.get('size',38)
  w=max(len(it['text'])*sz*0.6, len(it.get('sub',''))*25*0.52)+ (len(it['tag'])*15+34 if it.get('tag') else 0)+50
  h=sz*1.15+(32 if it.get('sub') else 0)+30
  return w,h
def chips(s,e,items):
  for it in items:
    w,h=chipsize(it); te=min(e,it['t']+3.0)
    if e-it['t']>3.3: it['te']=round(te,3)
    fb=faceU(it['t'],te+0.3)
    def rect(side,y): return [70+10,y,70+10+w,y+h] if side<0 else [890-10-w,y,890-10,y+h]
    side=it.get('side',-1); y=it['y']
    if hit(rect(side,y),fb):
      if not hit(rect(-side,y),fb): side=-side
      elif fb[3]+18+h<=SUBTOP-8: y=fb[3]+18
      else: y=SUBTOP-8-h
    if hit(rect(side,y),fb): print([round(v) for v in fb],w,h,y,side,'DROP chip (mặt quá to)',it['text'],round(it['t'],1)); it['drop']=1
    it['side']=side; it['y']=round(y)
  items=[it for it in items if not it.get('drop')]
  if items: D['chips'].append(dict(s=s,e=e,items=items))
  for it in items: D['sfx'].append(['pop_soft',it['t'],-17])
def info(s,e,y,**kw):
  rows=kw.get('rows',[]); h=50+(36 if kw.get('label') else 0)+(118 if kw.get('big') else 0)+sum(64 if r.get('size',36)<=36 else 70 for r in rows)
  fb=faceU(s,e)
  if hit([100,y,860,y+h],fb):
    if fb[3]+20+h<=SUBTOP-10: y=fb[3]+20
    else: kw['cover']=1; y=round(960-h/2-120)
  D['infos'].append(dict(s=s,e=e,y=round(y),**kw)); D['sfx'].append(['swoosh_up',s-0.1,-20])
  for r in kw.get('rows',[]): D['sfx'].append(['tick',r['t'],-18])
def punch(t,amt=0.05,hold=20): D['punches'].append(dict(t=t,amt=amt,hold=hold))
SFXI=lambda n,t,db: D['sfx'].append([n,t,db])

# ---- shots: cắt thật trong clip + cắt giả ở đầu câu (shot dài)
real=[7.57,12.0,14.83,18.77,25.8,36.47,44.8,64.3,75.83,79.57,91.63,94.7,99.37]
fake=[S(9),S(12),S(17),S(21),S(26),S(28),S(29),S(31)]
pts=sorted(real+fake); z=1.0; prev=0.0
brand_t=[12.0,25.8,44.8,79.57]
for t in pts+[TOT]:
  D['shots'].append(dict(s=prev,e=t,z=z)); z=1.06 if z==1.0 else 1.0
  prev=t
for t in pts:
  if t in brand_t: continue
  D['cuts'].append(dict(t=t)); SFXI('whoosh_fast',t-0.15,-21)

# ---- note quà (xuyên suốt)
D['note']=dict(s=13.8,e=118.4,a='Quà full size tặng theo ',b='danh sách quà của cửa hàng')
for i in (8,11,14): D['noteHi'].append(dict(s=S(i)-0.1,e=W[i][-1][1]+0.6))

# ---- 0 HOOK 0–7.57
D['flashes'].append(dict(t=0.0,op=0.9)); SFXI('hit_soft',0.05,-12)
D['covers'].append(dict(s=0.0,e=at(0,'giảm')-0.05,small='Deal đáng mua nhất',lines=['BLACK','FRIDAY'],size=170,y=600,sub='−20% · Quà full size'))
D['hideSubs'].append(dict(s=0,e=at(0,'giảm')-0.05)); SFXI('bass_drop',0.0,-16)
punch(at(0,'Black'),0.05,18)
chips(at(0,'giảm'),at(0,'Cùng')-0.1,[dict(text='−20%',sub='Giảm giá',t=at(0,'giảm'),side=-1,y=1010,size=46),
                                       dict(text='Quà full size',sub='Theo danh sách quà',t=at(0,'tặng'),side=1,y=1150)])
SFXI('cash_kaching',at(0,'giảm'),-19)
IM=dict(burberry=('img/burberry.jpg',1120/844),chloe=('img/chloe.jpg',1120/844),bvlgari=('img/bvlgari.jpg',1000/815),gucci=('img/gucci.jpg',678/452))
ms=at(0,'Cùng')
D['montages'].append(dict(s=ms,e=7.57,kicker='4 QUẦY · 1 MÙA SALE',items=[dict(img=IM[k][0],ar=IM[k][1],name=n) for k,n in [('burberry','BURBERRY'),('chloe','CHLOÉ'),('bvlgari','BVLGARI'),('gucci','GUCCI')]]))
for j in range(4): SFXI('camera_shutter',ms+j*(7.57-ms)/4,-16)
D['hideSubs'].append(dict(s=ms,e=7.57))
# 7.57–12 makeup
title(7.6,11.95,'MAKEUP',small='Cuối video có',size=170)
chips(at(1,'giảm giá'),11.95,[dict(text='Son Gucci',tag='−20%',sub='Chỉ còn 9xx.000đ',t=at(1,'giảm giá'),side=1,y=1170)])

# ---- BURBERRY 12.0–25.8
def brand(s,e,key,name,tag,kicker,**kw):
  D['brands'].append(dict(s=s,e=e,img=IM[key][0],ar=IM[key][1],name=name,tag=tag,kicker=kicker,**kw))
  SFXI('whoosh_soft',s-0.3,-12); SFXI('shimmer',s+0.35,-19)
brand(12.0,13.75,'burberry','BURBERRY','−20% · Quà full size','01 / 04')
D['chapters'].append(dict(s=13.75,e=25.75,num='01',name='BURBERRY'))
title(13.75,18.75,'BURBERRY',small='Ưu đãi tại',size=150)
info(14.0,18.7,1000,label='Burberry · Black Friday',big='−20%',bigSub='nước hoa',
     rows=[dict(t=at(2,'hóa đơn'),text='Hóa đơn sau giảm 5 – 8 triệu'),dict(t=at(2,'tặng'),text='Tặng quà full size',icon='gift',strong=1)])
SFXI('cash_kaching',14.1,-19)
# 00:20 ICON
title(18.8,25.75,'BURBERRY',small='Sản phẩm icon',size=150)
chips(at(3,'Hero')-0.1,25.75,[dict(text='Burberry Hero',tag='ICON',sub='Dành cho nam',t=at(3,'Hero')-0.1,side=-1,y=1110),
                         dict(text='Burberry Goddess',tag='ICON',sub='Dành cho nữ',t=at(3,'Goddess')-0.1,side=1,y=1000,size=36),
                         dict(text='Burberry Her',tag='ICON',sub='Trẻ trung, năng động',t=at(3,'Her')-0.1,side=-1,y=1225)])
SFXI('ding_luxury',at(3,'Hero')-0.1,-16); punch(at(3,'Goddess'),0.04,16)

# ---- CHLOÉ 25.8–44.8
brand(25.8,27.7,'chloe','CHLOÉ','−20% · Quà full size','02 / 04')
D['chapters'].append(dict(s=27.7,e=44.75,num='02',name='CHLOÉ'))
title(27.7,36.45,'CHLOÉ',small='Ưu đãi tại',size=170)
info(27.9,at(4,'Nói')-0.05,1000,label='Chloé · Black Friday',big='−20%',bigSub='nước hoa',
     rows=[dict(t=at(4,'hóa đơn'),text='Hóa đơn 5 – 8 triệu'),dict(t=at(4,'tặng'),text='Tặng quà full size',icon='gift',strong=1)])
SFXI('cash_kaching',28.0,-19)
chips(at(4,'Nói'),36.45,[dict(text='Quầy nào cũng có quà',sub='Mùa Black Friday',t=at(4,'mua'),side=1,y=1180)])
title(36.5,44.75,'ATELIER DES FLEURS',small='Dòng cao cấp · ADF',size=180)
chips(at(5,'Signature'),44.75,[
                          dict(text='Signature',t=at(5,'Signature'),side=1,y=980,size=34),
                          dict(text='Nomade',t=at(5,'Nomade'),side=-1,y=1080,size=34),
                          dict(text='Atelier des Fleurs',tag='ĐỘC QUYỀN',sub='Chỉ có tại quầy này',t=at(5,'ADF'),side=1,y=1180,size=36)])
SFXI('sparkle_long',at(5,'ADF'),-17); punch(at(5,'ADF'),0.05,20)

# ---- BVLGARI 44.8–79.57
brand(44.8,46.6,'bvlgari','BVLGARI','−20% · Quà theo danh sách','03 / 04')
D['chapters'].append(dict(s=46.6,e=79.5,num='03',name='BVLGARI'))
title(46.6,53.85,'BVLGARI',small='Ưu đãi tại',size=160)
info(46.8,53.85,1000,label='Bvlgari · Black Friday',big='−20%',bigSub='nước hoa',
     rows=[dict(t=at(7,'quà'),text='Có quà tặng full size',icon='gift'),dict(t=at(8,'theo'),text='Quà theo danh sách của cửa hàng',strong=1,size=34)])
SFXI('cash_kaching',46.9,-19)
# lưu ý quà 53.88–64.3
title(53.9,64.25,'QUÀ TẶNG',small='Lưu ý nhỏ',size=150)
info(54.0,64.25,930,dark=1,label='Quà tặng full size',
     rows=[dict(t=S(9)+0.2,text='Các quầy khác cũng −20% & có quà'),dict(t=at(12,'5'),text='Hóa đơn 5 – 8 triệu'),
           dict(t=at(13,'nhận'),text='Nhận quà full size',icon='gift'),dict(t=at(14,'list'),text='Chọn theo danh sách quà của cửa hàng',strong=1,size=34)])
D['noteHide'].append(dict(s=53.9,e=64.3)); SFXI('chime_double',at(14,'list'),-18)
# sản phẩm
title(64.35,75.8,'BVLGARI',small='Nổi bật tại',size=160)
chips(at(16,'Man'),75.8,[dict(text='Man Rain Essence',tag='DARREN THÍCH',t=at(16,'Man'),side=-1,y=880,size=36),
                         dict(text='Omnia',sub='Chai rất đặc trưng',t=at(17,'Omnia'),side=1,y=1060)])
punch(at(17,'Omnia'),0.04,16)
title(75.85,79.5,'ALLEGRA',small='Mới ra mắt',size=160)
chips(at(19,'Baciami'),79.5,[dict(text='Allegra Baciami',tag='NEW',sub='Mới ra luôn',t=at(19,'Baciami'),side=1,y=1120)])
SFXI('sparkle_long',at(19,'Baciami'),-18)
info(at(19,'Baciami'),79.45,1000,label='Bvlgari · Mới ra mắt',big='Allegra Baciami',bigSize=70)

# ---- GUCCI 79.57–99.37
brand(79.57,81.4,'gucci','GUCCI BEAUTY','−20% · Bốc thăm trúng quà','04 / 04',nameSize=86)
D['chapters'].append(dict(s=81.4,e=99.3,num='04',name='GUCCI BEAUTY'))
title(81.4,S(21)-0.05,'GUCCI',small='Ưu đãi tại',size=170)
info(81.5,S(21)-0.05,1010,label='Gucci Beauty · Black Friday',big='−20%',bigSub='tất cả sản phẩm')
SFXI('cash_kaching',81.6,-19)
title(S(21),91.6,'BỐC THĂM',small='Đặc biệt',size=150)
SFXI('riser',S(21)-0.6,-20)
info(at(21,'không'),91.6,1000,label='Bốc thăm may mắn',big='100%',bigSub='trúng quà',
     rows=[dict(t=at(22,'Tùy'),text='Quà tùy theo món bạn bốc được',icon='gift')])
SFXI('success_arp',at(21,'trúng'),-16); punch(at(21,'trúng'),0.05,18)
title(91.65,94.65,'ĐIỀU KIỆN',small='Bốc thăm',size=150)
info(at(23,'điều kiện'),94.65,1040,label='Điều kiện bốc thăm',rows=[dict(t=at(23,'hóa đơn'),text='Hóa đơn sau giảm trên 5 triệu',strong=1)])
title(94.7,99.3,'SON GUCCI',small='Mọi người đang đợi',size=140,force=1)
info(at(24,'20%')-0.1,99.3,1000,label='Son Gucci',big='−20%',bigSub='chỉ còn 9xx.000đ')
SFXI('cash_kaching',at(24,'20%'),-20)

# ---- TỔNG KẾT 99.37–118.46
title(99.4,S(26)-0.05,'BLACK FRIDAY',small='Cực kỳ hấp dẫn',size=150)
D['flashes'].append(dict(t=99.37,op=0.6)); SFXI('hit_soft',99.37,-14)
title(S(26),S(27)-0.05,'20 – 30.11',small='Thời gian',size=150)
D['timelines'].append(dict(s=S(26),e=S(27)-0.05,y=1080,a='20.11',b='30.11'))
SFXI('countdown_beep',S(26)+0.2,-16); SFXI('countdown_beep',S(26)+0.9,-16)
title(S(27),S(28)-0.05,'CÓ HẠN',small='Số lượng',size=170)
D['shakes'].append(dict(t=at(27,'ít'),amp=7)); SFXI('stamp',at(27,'ít'),-16)
title(S(28),S(29)-0.05,'SĂN DEAL',small='Nhanh tay',size=160)
punch(at(28,'săn'),0.05,18)
title(S(29),S(31)-0.05,'HOLIDAY',small='Mùa lễ hội',size=160)
D['bokeh'].append(dict(s=S(29),e=118.4,op=0.35)); SFXI('sparkle_long',S(29),-19)
chips(at(30,'tặng'),S(31)-0.05,[dict(text='Quà tặng',sub='Cho người thân',t=at(30,'tặng'),side=1,y=1140)])
title(S(31),118.4,'CUỐI NĂM',small='Mua sắm',size=160)
chips(at(31,'tốt'),118.4,[dict(text='Thời điểm tốt nhất',sub='Để mua sắm',t=at(31,'tốt'),side=-1,y=1140)])

# ---- END 118.46–
es=S(32)
D['endcards'].append(dict(s=es,e=TOT,kicker='BLACK FRIDAY · 20–30.11',title='−20%',sub='4 QUẦY · QUÀ FULL SIZE',
  items=[dict(a='BURBERRY',b='−20% · quà full size'),dict(a='CHLOÉ',b='−20% · quà full size'),dict(a='BVLGARI',b='−20% · quà full size'),dict(a='GUCCI',b='−20% · bốc thăm trúng quà')],
  note='Quà full size tặng theo danh sách quà của cửa hàng',cta='Follow @darrenbeauty01'))
D['hideSubs'].append(dict(s=es,e=TOT+1)); SFXI('whoosh_soft',es-0.25,-13); SFXI('success_arp',es+0.3,-15)

# ---- NÉ MẶT (Darren 23/11): không chữ/thẻ nào đè lên mặt. Mặt ≈ [x±0.6w] × [top, top+1.32w]
def face(s,e):
  hs=[head[min(fr,FR-1)] for fr in range(int(s*30),int(e*30)+1)]
  x0=min(h[0]-0.6*h[3] for h in hs); x1=max(h[0]+0.6*h[3] for h in hs)
  y1=float(np.percentile([h[2]+1.2*h[3] for h in hs],95)); y0=min(h[2] for h in hs)
  return x0,x1,y0,y1
SUB_TOP=1325
def chip_w(it):
  sz=it.get('size',38); w=len(it['text'])*sz*0.58
  if it.get('sub'): w=max(w,len(it['sub'])*25*0.55)
  if it.get('tag'): w+=len(it['tag'])*20*0.75+34
  return w+60
def chip_h(it): return 70+(30 if it.get('sub') else 0)
for g in D['chips']:
  for it in g['items']:
    x0,x1,y0,y1=face(it['t'],it.get('te',g['e'])); w=chip_w(it); h=chip_h(it)
    cx0,cx1=(76,76+w) if it['side']<0 else (884-w,884)
    if cx1>x0 and cx0<x1 and it['y']<y1 and it['y']+h>y0:
      ny=int(y1+16)
      if ny+h<=SUB_TOP: it['y']=ny
      else:  # không đủ chỗ dưới mặt → đặt ngay trên dải phụ đề, sát mép ngoài
        it['y']=SUB_TOP-h; it['edge']=1
      print('chip moved',it['text'],it['y'])
# chip cùng phía chồng nhau → chip trước rút đi khi chip sau xuất hiện
for g in D['chips']:
  its=sorted(g['items'],key=lambda x:x['t'])
  for a_i,a in enumerate(its):
    for b in its[a_i+1:]:
      if a['side']==b['side'] and abs(a['y']-b['y'])<chip_h(a)+8 and 'te' not in a: a['te']=b['t']-0.05
def card_h(c):
  h=56+(40 if c.get('label') else 0)+((c.get('bigSize',112)+6) if c.get('big') else 0)
  for r in c.get('rows',[]): h+=r.get('size',36)*1.25+14
  return h
for c in D['infos']+[dict(t,_tl=1) for t in []]:
  x0,x1,y0,y1=face(c['s'],c['e']); h=card_h(c)
  if c['y']<y1:
    ny=int(y1+18)
    if ny+h<=SUB_TOP: c['y']=ny; print('info moved',c.get('label'),ny)
    else:
      c['cover']=1; c['y']=int(1000-h/2)
      last=max([c['s']]+[r['t'] for r in c.get('rows',[])])
      c['e']=min(c['e'],max(c['s']+3.4,last+1.8)); print('info COVER',c.get('label'),round(c['e']-c['s'],1))
for t in D['timelines']:
  x0,x1,y0,y1=face(t['s'],t['e'])
  if t['y']<y1:
    if y1+18+175<=SUB_TOP: t['y']=int(y1+18)
    else: t['cover']=1; t['y']=930
    print('timeline',t)
mx=max(h[2]+1.2*h[3] for h in head)
print('face bottom max',round(mx), 'frames face>subs', sum(1 for h in head if h[2]+1.2*h[3]>SUB_TOP+10))

# ---- subtitles
KEY={'black','friday','burberry','hero','goddess','her','chloé','bvlgari','gucci','beauty','20%','5','8','triệu','full','size','adf','omnia','baciami','allegra','rain','man','makeup','100%','holiday','deal','son','list','danh','sách','rose','naturelle','signature','nomade'}
P={tuple(p.split()) for p in ["mọi người","Black Friday","full size","giảm giá","quà tặng","hóa đơn","cửa hàng","Burberry Hero","Burberry Goddess","Burberry Her","trẻ trung","năng động","cao cấp","Gucci Beauty","bốc thăm","may rủi","điều kiện","5 triệu","8 triệu","tháng 11","20 tháng","30 tháng","săn deal","nhanh chân","nhanh tay","cuối năm","mua sắm","tất tần","tần tật","khuyến mãi","cập nhật","sản phẩm","đặc biệt","quan trọng","Man Rain","Rose Naturelle","cực kỳ","rất là","ít ít","chín trăm","đặc trưng","mới ra","Atelier des","tốt nhất","holiday nè","cảm ơn","xem hết","nói chung","bây giờ"]}
lines=[]
for i,ws in enumerate(W):
  units=[]
  for w in ws:
    if units and (re.sub(r'[.,!?]+$','',units[-1][-1][2]).lower(),re.sub(r'[.,!?]+$','',w[2]).lower()) in {(a.lower(),b.lower()) for a,b in P} and not re.search(r'[.,!?]$',units[-1][-1][2]): units[-1].append(w)
    else: units.append([w])
  cur=[];segl=[]
  for u in units:
    if cur and (len(cur)+len(u)>4 or len(' '.join(x[2] for x in cur+u))>20): segl.append(cur);cur=[]
    cur+=u
    if re.search(r'[.,!?]$',cur[-1][2]) and len(cur)>=2: segl.append(cur);cur=[]
  if cur:
    if segl and len(cur)==1 and len(' '.join(x[2] for x in segl[-1]+cur))<=22: segl[-1]+=cur
    else: segl.append(cur)
  for j,l in enumerate(segl):
    s=l[0][0]-0.06; e=(segl[j+1][0][0]-0.06) if j+1<len(segl) else l[-1][1]+0.3
    lines.append(dict(s=round(s,3),e=round(e,3),words=[dict(s=w[0],e=w[1],t=re.sub(r'[.,!?]+$','',w[2]),key=norm(w[2]) in KEY) for w in l]))
for a,b in zip(lines[:-1],lines[1:]):
  if a['e']>b['s']: a['e']=b['s']
D['lines']=lines
# phụ đề né cằm khi quay cận
bad=0
for l in lines:
  fb=face(l['s'],max(l['s']+0.05,l['e']))[3]
  if fb>1358:
    if fb<1422: D['subY'].append(dict(s=l['s'],e=l['e'],y=1395)); D['noteHide'].append(dict(s=l['s']-0.05,e=l['e']+0.05))
    else: bad+=1; print('SUB on face',l['s'],round(fb))
print('subs low',len(D['subY']),'bad',bad)
os.makedirs(os.path.dirname(OUT),exist_ok=True)
json.dump(D,open(OUT,'w'),ensure_ascii=False)
json.dump(D['sfx'],open('/root/bb/sfx_events.json','w'))
print('ok',FR,'lines',len(lines),'titles',len(D['titles']),'sfx',len(D['sfx']))
