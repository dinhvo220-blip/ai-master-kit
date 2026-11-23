# Beat plan: Bvlgari Holiday 2026 gift set (clip 1 file 162 s, quay cận) – style Bv.tsx (sao 8 cánh, trời sao + pháo hoa vàng, lưới Pantheon)
import json,re,numpy as np
W=json.load(open('/root/bb2/words.json')); FR=4867; TOT=FR/30
OUT='/root/ai-master/src/bvlgari/bv_gift.json'
norm=lambda s: re.sub(r'[^\wÀ-ỹ%/]','',s.lower())
def at(i,phrase,n=1):
  p=[norm(x) for x in phrase.split()]; ws=W[i]; nt=[norm(w[2]) for w in ws]; c=0
  for j in range(len(nt)-len(p)+1):
    if nt[j:j+len(p)]==p:
      c+=1
      if c==n: return ws[j][0]
  raise Exception(f'not found {i} {phrase}')
S=lambda i: W[i][0][0]; E=lambda i: W[i][-1][1]
# ---- mặt (Haar) -> head track + hộp mặt
FC=json.load(open('/root/bb2/faces.json'))
fx=np.array([o for o in FC if o[1] is not None],float)
def raw(fr):
  i=np.searchsorted(fx[:,0],fr); i=min(max(i,0),len(fx)-1); return fx[i,1:]
cx=[];cy=[];tp=[];ww=[]
for fr in range(FR):
  x,y,w,h=raw(fr); cx.append(x+w/2); cy.append(y+h/2); tp.append(y-0.35*h); ww.append(w)
def sm(a,k=9):
  a=np.array(a); g=np.exp(-np.linspace(-2,2,2*k+1)**2); g/=g.sum(); return np.convolve(np.pad(a,k,mode='edge'),g,'valid')
cx,cy,tp,ww=sm(cx),sm(cy),sm(tp),sm(ww)
head=[[round(cx[i],1),round(cy[i],1),round(tp[i],1),round(ww[i],1)] for i in range(FR)]
def faceU(s,e):
  R=np.array([raw(fr) for fr in range(int(s*30),int(e*30)+1,3)])
  mw=np.median(R[:,2]); mc=np.median(R[:,0]+R[:,2]/2); my=np.median(R[:,1]+R[:,3]/2)
  ok=(R[:,2]>0.7*mw)&(R[:,2]<1.3*mw)&(np.abs(R[:,0]+R[:,2]/2-mc)<0.45*mw)&(np.abs(R[:,1]+R[:,3]/2-my)<0.45*mw)
  R=R[ok] if ok.sum()>=2 else R
  b=np.array([[x-0.12*w,y-0.3*h,x+1.12*w,y+1.12*h] for x,y,w,h in R])
  return [np.percentile(b[:,0],5),np.percentile(b[:,1],5),np.percentile(b[:,2],92),np.percentile(b[:,3],92)]
def hit(r,b): return not (r[2]<b[0] or r[0]>b[2] or r[3]<b[1] or r[1]>b[3])
SUBTOP=1360; LIMIT=SUBTOP+28   # đáy thẻ được phép chạm mép trên dòng phụ đề

D=dict(base='bv_src.mp4',frames=FR,head=head,subTop=SUBTOP,shots=[],punches=[],cuts=[],shakes=[],products=[],tags=[],tickers=[],chapters=[],
       brolls=[],brands=[],_pending=[],endcards=[],skies=[],stars=[],meshes=[],twinkles=[],hideSubs=[],sfx=[])
X=lambda n,t,db: D['sfx'].append([n,t,db])

PSIDE=[1]
def product(s,e,name,kicker,notes,line=None,size=64,short=None):
  # thẻ sản phẩm hiện ~3.4s, đặt thấp sát phụ đề (ít che hộp quà), rồi thu thành tag nhỏ ở mép
  ce=min(e,s+3.4) if short is None else min(e,s+short)
  fb=faceU(s,ce); full=270 if line else 222
  y=max(fb[3]+14,LIMIT-full)
  if y+full>LIMIT and line: line=None; full=222; y=max(fb[3]+14,LIMIT-full)
  if y+full>LIMIT: y=LIMIT-full
  if hit([80,y,880,y+full],fb): print('WARN product chạm mặt',name,round(y),[round(v) for v in fb])
  D['products'].append(dict(s=s,e=ce,y=round(y),name=name,kicker=kicker,notes=notes,line=line,size=size))
  X('ding_luxury',s,-15)
  for n in notes: X('pluck_%d'%(1+len(D['sfx'])%4),n['t'],-16)
  D['twinkles'].append(dict(s=s,e=ce,x=480,y=y-120,w=760,h=200,n=8))
  if e-ce>1.5: PSIDE[0]*=-1; D['_pending'].append((ce,e,name,PSIDE[0]))
  print('product',name,round(s,1),round(y))
def tag(s,e,text,sub=None,side=-1):
  fb=faceU(s,e); h=64; y=max(fb[3]+16,1000)
  if y+h>LIMIT: y=LIMIT-h
  w=len(text)*19+(len(sub)*13 if sub else 0)+90
  r=[76,y,76+w,y+h] if side<0 else [884-w,y,884,y+h]
  if hit(r,fb):
    side=-side; r=[76,y,76+w,y+h] if side<0 else [884-w,y,884,y+h]
    if hit(r,fb): print('WARN tag chạm mặt',text)
  D['tags'].append(dict(s=s,e=e,y=round(y),text=text,sub=sub,side=side)); X('pluck_%d'%(1+len(D['tags'])%4),s,-15)
def ticker(s,e,lines):
  fb=faceU(s,e); need=len(lines)*82
  y=max(fb[3]+14,980)
  if y+need>LIMIT: y=LIMIT-need
  if hit([70,y,890,y+need],fb): lines=lines[:1]; need=82; y=LIMIT-need
  D['tickers'].append(dict(s=s,e=e,y=round(y),lines=lines)); X('swish_ticker',s-0.05,-15)
def sky(t,title,kicker=None,hold=1.0):
  D['skies'].append(dict(t=t,title=title,kicker=kicker,hold=hold)); D['hideSubs'].append(dict(s=t-0.15,e=t+hold+0.2))
  X('boom_reveal',t-0.72,-11); X('firework',t+0.05,-12); X('firework',t+0.45,-16)

# ---- shots / chuyển cảnh tại điểm cắt thật
real=[4.97,9.53,14.8,21.53,23.83,27.8,36.07,44.0,55.53,64.33,71.3,78.77,84.53,87.33,91.63,103.6,117.1,128.17,130.3,132.03,137.0,142.47,152.4,154.97]
fake=[S(13),S(29),S(41),S(44)]
SKY={4.97:('Gift Set Nam','HOLIDAY 2026 · 01'),55.53:('Eau Parfumée','HOLIDAY 2026 · 02'),71.3:('Gift Set Nữ','HOLIDAY 2026 · 03'),117.1:('Custom hộp quà','HOLIDAY 2026 · 04')}
STAR=[21.53,36.07,64.33,84.53,94.2]
MESH=[14.8,44.0,103.6,132.03,142.47]
pts=sorted(set(real+fake)); z=1.0; prev=0
for t in pts+[TOT]:
  D['shots'].append(dict(s=prev,e=t,z=z)); z=1.05 if z==1.0 else 1.0; prev=t
for t in pts:
  if t in SKY: sky(t,*SKY[t])
  elif t in MESH: D['meshes'].append(t); X('glitter',t-0.3,-15); X('whoosh_fast',t-0.2,-17)
  elif t in (152.4,): pass
  else: D['cuts'].append(dict(t=t)); X('whoosh_fast',t-0.15,-20)
for t in STAR: D['stars'].append(t); X('magic_reveal',t-0.55,-15); X('whoosh_soft',t-0.3,-14)

# ---- HOOK: cảnh lia quầy
D['brolls'].append(dict(s=0,e=4.97,src='bv_broll.mp4',rate=0.67,kicker='HOLIDAY 2026',title='BVLGARI',sub='Tổng hợp gift set mùa lễ hội'))
X('bass_drop',0.0,-13); X('sparkle_long',0.4,-17); X('camera_shutter',at(0,'nhớ'),-15)

# ---- NAM
D['chapters'].append(dict(s=6.1,e=55.4,name='GIFT SET NAM'))
product(6.2,at(3,'Đối'),'Man Rain Essence','BVLGARI MAN',[dict(text='Trà xanh',t=at(2,'trà')),dict(text='Musk',t=at(2,'musk'))],'Trẻ trung · năng động · hiện đại')
tag(at(3,'Đối'),at(4,'Một')-0.05,'Full size + 15ml','dạng xịt')
tag(at(4,'Một'),21.4,'Chai 15ml','bỏ túi tiện lợi',side=1)
product(24.0,S(7)-0.05,'Man Wood Essence','BVLGARI MAN',[dict(text='Gỗ',t=at(5,'gỗ')+0.2),dict(text='Ấm áp',t=S(6)+0.3)],'Mạnh mẽ · nam tính · tự tin')
tag(S(7),S(8)-0.05,'Hương ấm áp','hợp buổi tối',side=1)
tag(S(8),35.9,'Full size + 15ml','dạng xịt')
product(at(10,'Pour')-0.2,S(11)-0.05,'Pour Homme','BVLGARI',[dict(text='Trà',t=at(9,'note')),dict(text='Musk',t=at(9,'musk'))],'Tinh tế · điềm đạm · lịch lãm')
tag(S(11),S(12)-0.05,'Mini + Full size','+ sữa tắm',side=1)
X('glass_clink',at(11,'sữa'),-17)
ticker(S(12),55.4,['HỘP QUÀ RẤT XINH','SỮA TẮM · MINI · FULL SIZE'])

# ---- EAU PARFUMÉE
D['chapters'].append(dict(s=56.7,e=71.2,name='EAU PARFUMÉE'))
product(at(14,'Thé'),64.2,'Thé Blanc','EAU PARFUMÉE',[dict(text='Trà trắng',t=at(14,'trà')),dict(text='Musk',t=at(14,'musk'))],'Tối giản · thư giãn')
product(S(16)+0.2,71.2,'Thé Vert','EAU PARFUMÉE',[dict(text='Trà xanh',t=S(17)),dict(text='Cam chanh',t=at(17,'cam'))],'Tươi mát · sảng khoái · tự nhiên')

# ---- NỮ
D['chapters'].append(dict(s=72.5,e=110.8,name='GIFT SET NỮ'))
product(at(18,'Omnia'),S(19)-0.05,'Omnia Crystalline','EAU DE TOILETTE',[dict(text='Hand cream',t=at(18,'hand')),dict(text='Chai mini',t=at(18,'mini'))],None,size=58)
tag(S(19),S(20)-0.05,'Chai 15ml','dạng xịt',side=1)
product(S(20),84.4,'Omnia Crystalline','HƯƠNG THƠM',[dict(text='Hoa lê',t=at(20,'hoa')),dict(text='Sen',t=at(20,'sen'))],'Trong trẻo · dịu dàng · trẻ trung',size=58)
product(S(22)+0.1,S(27)-0.1,'Omnia Crystalline','EAU DE PARFUM',[dict(text='Hoa nhài',t=at(23,'nhài')),dict(text='Gỗ đàn hương',t=at(23,'gỗ'))],'Sang trọng · lãng mạn · thanh lịch',size=58)
product(S(27)+0.3,S(30)-0.05,'Omnia Amethyste','BVLGARI OMNIA',[dict(text='Hoa',t=at(29,'hoa')),dict(text='Powdery nhẹ',t=at(29,'powdery'))],'Phấn nhẹ · nữ tính',size=60)
tag(S(30),S(31)-0.05,'Full size + 15ml','dạng xịt')
ticker(S(31),110.8,['HỘP ĐẸP · LÀM QUÀ TẶNG RẤT XINH'])

# ---- CUSTOM
D['chapters'].append(dict(s=118.4,e=131.9,name='CUSTOM HỘP QUÀ'))
ticker(S(32)+1.3,131.9,['TỰ CHỌN SẢN PHẨM TẠI STORE','GÓI QUÀ · NHIỀU MÀU RUY BĂNG'])
X('swoosh_up',at(34,'gói'),-17)

# ---- STORE / CTA
D['chapters'].append(dict(s=132.1,e=152.3,name='TẠI STORE'))
ticker(S(36),S(39)-0.05,['CÓ SẴN TẠI STORE','MUA TẠI STORE · NHIỀU QUÀ TẶNG HƠN'])
tag(S(38),S(39)-0.05,'Mua online','cũng được',side=1)
tag(S(39),141.9,'Comment','Darren gửi BA tư vấn')
X('pop_bubble',S(39),-15)
ticker(S(41),152.3,['NHIỀU ƯU ĐÃI TẠI STORE','CHÍNH HÃNG · GÓI QUÀ XINH'])
D['brands'].append(dict(s=152.4,e=154.9,img='img/bvlgari.jpg',ar=1000/815,name='BVLGARI',tag='Crescent Mall · Quận 7',kicker='DARREN ĐANG Ở ĐÂY'))
D['hideSubs'].append(dict(s=152.4,e=154.9)); X('boom_reveal',152.4-0.72,-11); X('camera_shutter',152.6,-15)
ticker(S(46),157.3,['BẠN SẼ TẶNG SET QUÀ NÀY CHO AI?'])
es=S(47)
D['endcards'].append(dict(s=es,e=TOT,kicker='HOLIDAY 2026 · GIFT SET',title='BVLGARI',sub='Lưu lại để chọn quà nhé',
  items=[dict(a='Nam',b='Man Rain · Man Wood · Pour Homme'),dict(a='Unisex',b='Eau Parfumée Thé Blanc · Thé Vert'),dict(a='Nữ',b='Omnia Crystalline · Amethyste'),dict(a='Store',b='Crescent Mall · Quận 7')],
  cta='Follow @darrenbeauty01'))
D['hideSubs'].append(dict(s=es,e=TOT+1)); X('jingle',es,-13); X('tada_short',es+0.3,-15); X('firework',es+0.2,-14); X('firework',es+0.47,-17)

for ce,e,name,side in D.pop('_pending'):
  busy=[(g['s'],g['e']) for g in D['tags'] if g['s']<e and ce<g['e']]
  if busy: e=min([e]+[a for a,b in busy if a>ce]); 
  if e-ce>1.2: tag(ce,e,name,side=side)
# ---- khoe hộp quà (không lời)
D['products'].append(dict(s=111.0,e=116.9,y=LIMIT-222,name='Hộp quà pháo hoa vàng',kicker='BVLGARI · HOLIDAY 2026',notes=[dict(text='Bầu trời sao',t=112.2),dict(text='Pháo hoa vàng',t=112.8)],size=56))
D['twinkles'].append(dict(s=110.9,e=117.0,x=480,y=760,w=820,h=900,n=16))
X('musicbox',110.9,-11); X('sparkle_long',111.2,-17); X('shimmer',114.5,-18)
# ---- subtitles
KEY={'bvlgari','man','rain','wood','essence','pour','homme','omnia','crystalline','amethyste','thé','blanc','vert','eau','parfumée','musk','full','size','15ml','mini','edt','edp','store','custom','crescent','mall','q7','online','powdery','sen','lê','nhài','trà'}
P={tuple(p.split()) for p in ["gift set","mùa lễ","lễ hội","Man Rain","Rain Essence","Man Wood","Wood Essence","Pour Homme","Eau Parfumée","Thé Blanc","Thé Vert","Omnia Crystalline","Omnia Amethyste","full size","dạng xịt","trà xanh","trà trắng","sữa tắm","hand cream","cam chanh","hoa lê","hoa nhài","gỗ đàn","đàn hương","mọi người","nước hoa","trẻ trung","năng động","nam tính","nữ tính","sang trọng","lãng mạn","thanh lịch","tinh tế","điềm đạm","lịch lãm","hộp quà","ruy băng","quà tặng","ưu đãi","Crescent Mall","rất là","cực kỳ","một xíu","tư vấn","chính hãng","trực tiếp","xem hết","quý ông","đàn ông","cô nàng","biết đâu","sạch sẽ","hiện đại","bỏ túi","15ml này","tối giản","thư giãn","sảng khoái","tự nhiên","dịu dàng","trong trẻo"]}
PL={(a.lower(),b.lower()) for a,b in P}
lines=[]
for i,ws in enumerate(W):
  units=[]
  for w in ws:
    a=re.sub(r'[.,!?]+$','',units[-1][-1][2]).lower() if units else ''
    if units and (a,re.sub(r'[.,!?]+$','',w[2]).lower()) in PL and not re.search(r'[.,!?]$',units[-1][-1][2]): units[-1].append(w)
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
last=-9
for l in lines:
  for w in l['words']:
    if w['key'] and w['s']-last>0.9: X('tick',w['s'],-25); last=w['s']
json.dump(D,open(OUT,'w'),ensure_ascii=False)
json.dump(D['sfx'],open('/root/bb2/sfx_events.json','w'))
print('ok',FR,'lines',len(lines),'products',len(D['products']),'sfx',len(D['sfx']))
