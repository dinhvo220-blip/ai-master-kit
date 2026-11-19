import json,re,os,numpy as np
K=json.load(open('/root/bb/K3.json')); W=json.load(open('/root/bb/words3.json'))
TOT=K[-1]['T1']; FR=int(round(TOT*30))
norm=lambda s: re.sub(r'[^\wÀ-ỹ%/]','',s.lower())
C=dict(cream='#FBF6EE',ink='#14241C',red='#8E1B1B',gold='#EBCB8B',camel='#B79262',green='#2F5A44',pink='#2F5A44')
def at(i,phrase,n=1,end=False):
  p=[norm(x) for x in phrase.split()]; ws=W[i]; nt=[norm(w[2]) for w in ws]; c=0
  for j in range(len(nt)-len(p)+1):
    if nt[j:j+len(p)]==p:
      c+=1
      if c==n: return ws[j+len(p)-1][1] if end else ws[j][0]
  raise Exception(f'not found {i} {phrase}')
S=lambda i: K[i]['T0']; E=lambda i: K[i]['T1']
# head track
head=[]
mk=np.fromfile('/root/bb/masks30.u8',np.uint8).reshape(-1,960,540)[::2]
tops=[];xs=[];wd=[]
for m in mk:
  rows=np.where((m>128).sum(1)>12)[0]
  top=rows[0] if len(rows) else 300
  band=m[top:top+90]>128; cols=np.where(band.any(0))[0]
  x=(cols.mean() if len(cols) else 270)
  hb=m[top+60:top+140]>128; c2=np.where(hb.any(0))[0]
  tops.append(top*2); xs.append(x*2); wd.append((c2.max()-c2.min())*2 if len(c2) else 400)
def smooth(a,k=7):
  a=np.array(a,float); w=np.exp(-np.linspace(-2,2,2*k+1)**2); w/=w.sum()
  return np.convolve(np.pad(a,k,mode='edge'),w,'valid')
tops,xs,wd=smooth(tops),smooth(xs),smooth(wd)
for fr in range(FR):
  j=min(fr//2,len(tops)-1); j2=min(j+1,len(tops)-1); a=(fr%2)/2
  t=tops[j]*(1-a)+tops[j2]*a; x=xs[j]*(1-a)+xs[j2]*a; w=wd[j]*(1-a)+wd[j2]*a
  head.append([round(x,1),round(t+260,1),round(t,1),round(w,1)])
def topat(t): return head[min(int(t*30),FR-1)][2]
def fit(txt,maxs,width=720,k=0.74): return int(min(maxs,width/(len(txt)*k)))
def title(s,e,big,small=None,color=C['ink'],size=None,**kw):
  sz=size or fit(big,240)
  sm=50 if small else 0
  tops=[head[min(int(t),FR-1)][2] for t in range(int(s*30),int(e*30)+1)]
  mt=float(np.median(tops))
  tgt=255+sm+sz*0.95-15
  ps=1.0
  topn=1920-(1920-mt)*ps
  y=max(262,topn+15-sz*0.95-sm)
  if ps<0.995: D['pscale'].append(dict(s=s,e=e,ps=round(ps,3)))
  return dict(s=s,e=e,big=big,small=small,color=color,size=sz,y=round(y),**kw)

D=dict(floats=[],pscale=[],frames=FR,head=head,shots=[],punches=[],cuts=[],shakes=[],blur=[],replace=[],walls=[],titles=[],orbits=[],sparkles=[],leaks=[],
       pills=[],bigs=[],strikes=[],pins=[],timelines=[],receipts=[],endcards=[],transitions=[],hideSubs=[],sfx=[])

GREEN='radial-gradient(ellipse at 50% 32%, #2F5A44 0%, #16281F 50%, #0A120E 85%)'
WINE='radial-gradient(ellipse at 50% 30%, #7A1E1E 0%, #3A0E0E 55%, #150606 100%)'
GOLD='radial-gradient(ellipse at 50% 30%, #FFF4D6 0%, #EBC983 50%, #B98C45 100%)'
a0=lambda p,n=1: at(0,p,n)
cuts0=[a0('Hi'),a0('Và đương'),a0('Và chương'),a0('Darren đang')]
sec_starts={0,2,3,6,7,8,10,13,15,18,22}
trans={2:'ribbon',3:'flash',6:'ribbon',8:'ribbon',10:'flash',13:'cut',15:'ribbon',18:'ribbon'}
stripe=['#1F3B2D','#8E1B1B','#1F3B2D']
z=1.0; shots=[]
for i,k in enumerate(K):
  pts=[k['T0']]+(cuts0 if i==0 else [])+[k['T1']]
  for j in range(len(pts)-1):
    if i in sec_starts and j==0: z=1.0
    else: z=1.05 if z==1.0 else 1.0
    D['shots'].append(dict(s=pts[j],e=pts[j+1],z=z))
    if j>0: D['cuts'].append(dict(t=pts[j],big=False)); D['sfx'].append(['swish',pts[j]-0.12,-22])
  if i==0: continue
  ty=trans.get(i,'cut')
  if ty=='ribbon':
    D['transitions'].append(dict(type='ribbon',t=k['T0'],colors=stripe)); D['sfx'].append(['whoosh',k['T0']-0.28,-9])
  elif ty=='flash':
    D['transitions'].append(dict(type='flash',t=k['T0'])); D['cuts'].append(dict(t=k['T0'],big=True)); D['sfx'].append(['impact',k['T0'],-10])
  else:
    D['cuts'].append(dict(t=k['T0'],big=False)); D['sfx'].append(['swish',k['T0']-0.12,-22])
def pills(items,s,e,variant='ink',y=1090,**kw):
  g=dict(s=s,e=e,variant=variant,y=y,items=[dict(text=a,t=b,**c) for a,b,*cc in items for c in ([cc[0]] if cc else [{}])],**kw)
  D['pills'].append(g)
  for it in g['items']:
    if not it.get('sep'): D['sfx'].append(['pop',it['t'],-15])
def punch(t,amt=0.06,hold=24): D['punches'].append(dict(t=t,amt=amt,hold=hold))

# ---- 0 HOOK
D['transitions'].append(dict(type='flash',t=0.0))
D['replace'].append(dict(s=0,e=2.6,dark=1,bg=GREEN))
D['walls'].append(dict(s=0,e=2.6,text='GUCCI',color=C['gold'],op=0.4))
D['titles'].append(title(0.15,cuts0[0]-0.05,'GUCCI',small='Black Friday',color=C['ink'],dark=C['gold'],track=True,size=200))
D['sfx'].append(['shimmer',0.2,-14])
pills([('-20%',a0('20%'),{'variant':'red','bounce':1})],a0('20%'),cuts0[0]-0.05,y=1060)
punch(a0('Gucci'),0.06,24)
D['titles'].append(title(cuts0[0]+0.1,cuts0[1]-0.05,'Beauty',small='Gucci',color=C['ink'],italic=True,size=210))
D['floats'].append(dict(s=a0('Darren'),e=cuts0[1]-0.1,words=['Hi! Darren đây','Thông báo nóng'],times=[a0('Darren'),a0('thông báo')]))
D['titles'].append(title(cuts0[1]+0.1,cuts0[2]-0.05,'1 Follow',small='Chi phí chỉ',color=C['red'],italic=True,size=170))
D['sparkles'].append(dict(s=a0('follow'),e=cuts0[2]-0.1,x=480,y=topat(a0('follow'))-60,w=700,h=260,color=C['gold'],n=12))
D['sfx'].append(['ding',a0('follow'),-15]); punch(a0('follow'),0.06,20)
D['titles'].append(title(cuts0[2]+0.1,cuts0[3]-0.05,'FRIDAY',small='Black',color=C['ink'],size=180,track=True))
D['timelines'].append(dict(s=a0('từ ngày'),e=cuts0[3]-0.05,y=1060)); D['sfx'].append(['riser',a0('từ ngày'),-18])
D['titles'].append(title(cuts0[3]+0.1,K[0]['T1']-0.05,'Crescent',small='Gucci Beauty ·',color=C['ink'],italic=True,size=150))
D['pins'].append(dict(s=a0('Crescent'),e=K[0]['T1']-0.05,y=1040,label='GHÉ GUCCI BEAUTY',items=[dict(name='Crescent Mall Q7',t=a0('Crescent'))]))
D['sfx'].append(['pop',a0('Crescent'),-14])
# ---- 1 online / contact
D['titles'].append(title(S(1)+0.1,E(1)-0.05,'Online',small='Không ra store được?',color=C['red'],italic=True,size=200))
pills([('Mua online',at(1,'online')),('Để lại comment',at(1,'contact'),{'variant':'red'}),('BA tư vấn',at(1,'contact')+0.7,{'variant':'gold'})],at(1,'online'),E(1)-0.05,y=1030)
# ---- 2 cùng xem
D['titles'].append(title(S(2)+0.1,E(2)-0.05,'Ưu đãi',small='Cùng xem',color=C['ink'],italic=True,size=210))
# ---- 3-5 -20%
D['replace'].append(dict(s=S(3),e=S(3)+2.6,dark=1,bg=WINE))
D['walls'].append(dict(s=S(3),e=S(3)+2.6,text='-20%',color=C['red'],op=0.55))
D['titles'].append(title(S(3)+0.05,E(3)-0.05,'-20%',small='Toàn bộ',color=C['red'],dark=C['gold'],size=260,extrude='#4a0c0c'))
D['shakes'].append(dict(t=S(3),amp=10)); punch(S(3),0.08,24)
D['sparkles'].append(dict(s=S(3),e=E(3),x=480,y=topat(S(3))-90,w=760,h=300,color=C['gold'],n=16))
D['titles'].append(title(S(4)+0.05,E(5)-0.05,'Makeup',small='Nước hoa &',color=C['ink'],italic=True,size=200))
pills([('Nước hoa',at(4,'hoa'),{'variant':'ink'}),('Makeup',at(4,'makeup'),{'variant':'red'}),('Son',at(4,'son'),{'variant':'cream'}),('Phấn',at(4,'phấn'),{'variant':'cream'}),('Cushion',at(5,'cushion'),{'variant':'gold','bounce':1})],at(4,'hoa'),E(5)-0.05,y=1010)
# ---- 6 online also
D['titles'].append(title(S(6)+0.1,E(6)-0.05,'-20%',small='Online vẫn',color=C['red'],size=220))
pills([('Ship tận nơi',at(6,'ship')),('Free ship toàn quốc',at(6,'free'),{'variant':'gold','bounce':1})],at(6,'ship'),E(6)-0.05,y=1040)
punch(at(6,'free'),0.06,20)
# ---- 7 receipt
D['titles'].append(title(S(7)+0.1,E(7)-0.05,'Bốc thăm',small='Còn được',color=C['ink'],italic=True,size=150))
D['receipts'].append(dict(s=at(7,'hóa đơn'),e=E(7)-0.05,y=1215,label='HÓA ĐƠN SAU GIẢM TRÊN',gift='BỐC THĂM',giftHi='QUÀ FULL SIZE',stamp='NHỚ NHA!',tGift=at(7,'bốc thăm'),tStamp=at(7,'Mọi người nhớ')))
D['hideSubs'].append(dict(s=at(7,'hóa đơn'),e=E(7)))
D['sfx']+= [['pop',at(7,'bốc thăm'),-13],['stamp',at(7,'Mọi người nhớ'),-10]]
# ---- 8-9 gifts
D['replace'].append(dict(s=S(8),e=S(8)+2.6,bg=GOLD))
D['walls'].append(dict(s=S(8),e=S(8)+2.6,text='QUÀ TẶNG',color='#FFFFFF',op=0.5))
D['leaks'].append(dict(s=S(8),e=S(8)+2.6,op=0.3))
D['titles'].append(title(S(8)+0.1,E(9)-0.05,'Quà tặng',small='Trong hộp bốc thăm',color=C['red'],italic=True,size=150))
D['sfx'].append(['shimmer',S(8)+0.1,-14])
D['floats'].append(dict(s=at(9,'nước hoa'),e=at(9,'Nói chung')-0.1,words=['Nước hoa 30ml','Makeup'],times=[at(9,'nước hoa'),at(9,'makeup')],color=C['ink'],bg='linear-gradient(135deg,#F7E2B0,#D4A955)'))
D['bigs'].append(dict(s=at(9,'giá trị'),e=E(9)-0.05,lines=['FULL SIZE'],font='sans',size=120,color=C['cream'],y=1330,echo=True,shadow='0 6px 24px rgba(20,36,28,.7)'))
D['hideSubs'].append(dict(s=at(9,'giá trị'),e=E(9)))
D['sfx'].append(['impact',at(9,'giá trị'),-11]); punch(at(9,'giá trị'),0.07,22)
# ---- 10-12
D['titles'].append(title(S(10)+0.1,at(12,'Từ ngày')-0.1,'Hấp dẫn',small='Cực kỳ',color=C['red'],italic=True,size=150))
pills([('Giảm trực tiếp',at(11,'giảm giá'),{'variant':'red'}),('+',at(12,'vừa')-0.05,{'sep':1}),('Bốc thăm may mắn',at(12,'bốc thăm'),{'variant':'gold','bounce':1})],at(11,'giảm giá'),at(12,'Từ ngày')-0.1,y=1230,sepColor=C['ink'])
D['titles'].append(title(at(12,'Từ ngày'),E(12)-0.05,'FRIDAY',small='Black',color=C['ink'],size=150,track=True))
D['timelines'].append(dict(s=at(12,'Từ ngày'),e=E(12)-0.05,y=1220)); D['sfx'].append(['riser',at(12,'Từ ngày'),-18])
# ---- 13-14 store
D['titles'].append(title(S(13)+0.1,E(14)-0.05,'Store',small='Ghé ngay',color=C['ink'],italic=True,size=160))
D['pins'].append(dict(s=at(13,'Crescent'),e=E(14)-0.05,y=1180,label='GUCCI BEAUTY',items=[dict(name='Crescent Mall Q7',t=at(13,'Crescent'))]))
D['sfx'].append(['pop',at(13,'Crescent'),-14])
D['floats'].append(dict(s=at(13,'makeup'),e=E(14)-0.1,words=['Makeup','Nước hoa'],times=[at(13,'makeup'),at(13,'nước hoa')]))
# ---- 15-17 holiday
D['replace'].append(dict(s=S(16),e=S(16)+2.6,bg=GOLD))
D['walls'].append(dict(s=S(16),e=S(16)+2.6,text='HOLIDAY',color='#FFFFFF',op=0.5))
D['leaks'].append(dict(s=S(16),e=E(17),op=0.25))
D['titles'].append(title(S(15)+0.1,at(17,'săn deal')-0.1,'Holiday',small='Mùa lễ hội',color=C['red'],italic=True,size=160))
D['sparkles'].append(dict(s=S(16),e=at(17,'săn deal'),x=480,y=topat(S(16))-80,w=760,h=300,color='#FFFFFF',n=16))
D['sfx'].append(['shimmer',S(16)+0.1,-14])
D['bigs'].append(dict(s=at(17,'săn deal'),e=E(17)-0.05,lines=['Săn deal'],italic=True,size=140,color=C['red'],y=300,shadow='0 0 26px rgba(255,255,255,.95), 0 0 10px rgba(255,255,255,.9)'))
D['floats'].append(dict(s=at(17,'quà'),e=E(17)-0.1,words=['Quà cuối năm','Mua sắm'],times=[at(17,'quà'),at(17,'mua sắm')],color=C['ink'],bg='linear-gradient(135deg,#F7E2B0,#D4A955)'))
punch(at(17,'săn deal'),0.06,20); D['sfx'].append(['ding',at(17,'săn deal'),-15])
# ---- 18-21 follow
endS=at(21,'beauty')
D['titles'].append(title(S(18)+0.1,endS-0.1,'Follow',small='Nhớ',color=C['red'],italic=True,size=220))
D['floats'].append(dict(s=at(18,'khuyến mãi'),e=endS-0.1,words=['Khuyến mãi','Sản phẩm mới','Beauty'],times=[at(18,'khuyến mãi'),at(19,'sản phẩm'),at(21,'thú vị')]))
punch(at(18,'follow'),0.06,20); D['sfx'].append(['ding',at(18,'follow'),-15])
D['endcards'].append(dict(s=endS,e=TOT,brand='GUCCI BEAUTY',sub='BLACK FRIDAY · 20–30.11',items=['Giảm 20% nước hoa & makeup','HĐ trên 5 triệu: bốc thăm quà full size','Crescent Mall Q7 · Online free ship']))
D['hideSubs'].append(dict(s=endS,e=TOT+1)); D['sfx'].append(['ding',endS,-14])
# ---- subtitle lines
KEY={'gucci','beauty','black','friday','20%','20','30','11','5','triệu','30ml','crescent','mall','quận','7','follow','online','free','ship','makeup','cushion','son','phấn','holiday','deal'}
P={tuple(p.split()) for p in ["mọi người","nước hoa","chúng ta","các bạn","Black Friday","Crescent Mall","phù hợp","đầu tiên","lựa chọn","nam tính","nữ tính","trẻ trung","năng động","tươi sáng","phiên bản","cô gái","anh chàng","suy nghĩ","đại diện","cực kỳ","hấp dẫn","tỏa sáng","quyền lực","nốt hương","phóng khoáng","tự do","mạnh mẽ","cá tính","khuyến mãi","sản phẩm","chương trình","giàu có","lịch lãm","điềm tĩnh","dễ thương","nũng nịu","hóa đơn","tất cả","nhanh nhất","cập nhật","Cảm ơn","cảm ơn","xin chào","lướt qua","chủ lực","không kém","thể hiện","nữ quyền","phụ nữ","tất tần","tần tật","toàn bộ","5 triệu","rất nhiều","xung quanh","trầm tính","đặc biệt","nhanh tay","ra store","Last but","but not","not least","3 dòng","sử dụng","từng dịp","một xíu","đúng là","Burberry Hero","Burberry Her","Hero Parfum","em Goddess","một chai","biết được","ví dụ","thử liền","mọng nước","Nhớ follow","Crescent Mall","Mall Q7","Gucci Beauty","quận 7","tháng 11","20 tháng","30 tháng","free ship","toàn quốc","bốc thăm","may mắn","săn deal","lễ hội","cuối năm","mua sắm","quà tặng","giảm giá","trực tiếp","tận nơi","sau giảm","full size","ưu đãi","1 follow","động lực","thông báo","đương nhiên","miễn phí","chi phí","hộp bốc","mặt hàng","giá trị","sắp tới","holiday,","Crescent Mall","tất tần","tần tật"]}
lines=[]
for i,ws in enumerate(W):
  units=[]
  for w in ws:
    a=norm(units[-1][-1][2]) if units else None
    if units and (re.sub(r'[.,!?]+$','',units[-1][-1][2]),re.sub(r'[.,!?]+$','',w[2])) in P and not re.search(r'[.,!?]$',units[-1][-1][2]): units[-1].append(w)
    else: units.append([w])
  cur=[];segl=[]
  for u in units:
    if cur and (len(cur)+len(u)>4 or len(' '.join(x[2] for x in cur+u))>19): segl.append(cur);cur=[]
    cur+=u
    if re.search(r'[.,!?]$',cur[-1][2]) and len(cur)>=2: segl.append(cur);cur=[]
  if cur:
    if segl and len(cur)==1 and len(' '.join(x[2] for x in segl[-1]+cur))<=22: segl[-1]+=cur
    else: segl.append(cur)
  for j,l in enumerate(segl):
    s=l[0][0]-0.08; e=(segl[j+1][0][0]-0.08) if j+1<len(segl) else min(l[-1][1]+0.25,K[i]['T1'])
    lines.append(dict(s=round(s,3),e=round(e,3),words=[dict(s=w[0],e=w[1],t=re.sub(r'[.,!?]+$','',w[2]),key=norm(w[2]) in KEY) for w in l]))
for a,b in zip(lines[:-1],lines[1:]):
  if a['e']>b['s']: a['e']=b['s']
D['lines']=lines
json.dump(D,open('/root/ai-master/src/data.json','w'),ensure_ascii=False)
json.dump(D['sfx'],open('/root/bb/sfx_events.json','w'))
print('ok frames',FR,'lines',len(lines),'pills',len(D['pills']))
