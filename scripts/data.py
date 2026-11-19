import json,re,os,numpy as np
K=json.load(open('/root/bb/K3.json')); W=json.load(open('/root/bb/words3.json'))
TOT=K[-1]['T1']; FR=int(round(TOT*30))
norm=lambda s: re.sub(r'[^\wÀ-ỹ%/]','',s.lower())
C=dict(cream='#FBF6EE',ink='#1E1712',red='#8C2F23',gold='#F2D49B',camel='#C8A27A',blush='#F3C6CF',pink='#D9748A')
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
sec_starts={0,1,3,5,10,11,18,19,22}
trans={1:'ribbon',3:'big',5:'ribbon',10:'flash',11:'ribbon',18:'ribbon',19:'ribbon'}
z=1.0
for i,k in enumerate(K):
  if i in sec_starts: z=1.0
  else: z=1.05 if z==1.0 else 1.0
  D['shots'].append(dict(s=k['T0'],e=k['T1'],z=z))
  if i==0: continue
  ty=trans.get(i,'cut')
  if ty=='ribbon':
    D['transitions'].append(dict(type='ribbon',t=k['T0'])); D['sfx'].append(['whoosh',k['T0']-0.28,-9])
  elif ty=='flash':
    D['transitions'].append(dict(type='flash',t=k['T0'])); D['cuts'].append(dict(t=k['T0'],big=True)); D['sfx'].append(['impact',k['T0'],-10])
  else:
    big= ty=='big' or i in (9,14,15,22)
    D['cuts'].append(dict(t=k['T0'],big=big)); D['sfx'].append(['swish',k['T0']-0.12,-16 if big else -22])
ribcols={5:[C['blush'],'#FFFFFF',C['pink']],11:['#F7E2B0','#D4A955',C['cream']],19:[C['ink'],C['red'],C['gold']]}
for t in D['transitions']:
  for i,k in enumerate(K):
    if abs(k['T0']-t['t'])<1e-6 and i in ribcols: t['colors']=ribcols[i]
def pills(items,s,e,variant='ink',y=1090,**kw):
  g=dict(s=s,e=e,variant=variant,y=y,items=[dict(text=a,t=b,**c) for a,b,*cc in items for c in ([cc[0]] if cc else [{}])],**kw)
  D['pills'].append(g)
  for it in g['items']:
    if not it.get('sep'): D['sfx'].append(['pop',it['t'],-15])
def punch(t,amt=0.06,hold=24): D['punches'].append(dict(t=t,amt=amt,hold=hold))

# ---- 0 HOOK
D['transitions'].append(dict(type='flash',t=0.0))
D['titles'].append(title(0.15,E(0)-0.05,'BURBERRY',small='3 dòng nước hoa',color=C['ink'],track=True))
D['sfx'].append(['shimmer',0.2,-14])
D['floats'].append(dict(s=1.0,e=E(0)-0.05,words=['Hero','Her','Goddess'],gap=0.45))
punch(at(0,'Burberry'),0.05,30)
pills([('Bạn hợp dòng nào?',at(0,'phù hợp'))],at(0,'phù hợp'),E(0)-0.05,'red')
# ---- 1 HERO
D['replace'].append(dict(s=S(1),e=S(1)+2.9,dark=1,bg='radial-gradient(ellipse at 50% 32%, #57402d 0%, #2a1e15 45%, #120d09 80%)'))
D['walls'].append(dict(s=S(1),e=S(1)+2.9,text='HERO',color=C['camel'],op=0.5))
D['titles'].append(title(S(1)+0.15,E(1)-0.05,'HERO',small='01 · Burberry',color=C['ink'],dark=C['gold'],size=230))
D['sfx'].append(['shimmer',S(1)+0.2,-16])
pills([('Nam tính',at(1,'nam tính',1),{'bounce':1,'variant':'gold'}),('Nhiều lựa chọn',at(1,'nhiều dòng'),{'variant':'ghost'})],at(1,'nam tính',1),E(1)-0.05)
punch(at(1,'cực kỳ'),0.07,20)
# ---- 2 STYLE choice
D['titles'].append(title(S(2)+0.1,E(2)-0.05,'Style',small='Tùy theo',color=C['ink'],italic=True,size=200))
pills([('Nam tính',at(2,'nam tính'),{'variant':'cream'}),('Trẻ trung',at(2,'trẻ trung'),{'variant':'cream'}),('Năng động',at(2,'năng động'),{'variant':'cream'}),
       ('hoặc',at(2,'Hoặc'),{'sep':1}),('Trầm tính',at(2,'trầm tính'),{'variant':'ink'}),('Luxury',at(2,'luxury'),{'variant':'ink'}),('Giàu có',at(2,'giàu có'),{'variant':'gold'})],
      at(2,'nam tính'),E(2)-0.05,y=1010,sepColor=C['ink'])
punch(at(2,'luxury'),0.05,20)
# ---- 3-4 HERO PARFUM
D['replace'].append(dict(s=S(3),e=S(3)+2.6,dark=1,bg='radial-gradient(ellipse at 50% 30%, #7a5434 0%, #3b2617 45%, #150d08 85%)'))
D['walls'].append(dict(s=S(3),e=S(3)+2.6,text='PARFUM',color=C['camel'],op=0.35))
D['titles'].append(title(S(3)+0.15,E(4)-0.05,'Parfum',small='Burberry Hero',color=C['red'],dark=C['gold'],italic=True,size=210))
D['sparkles'].append(dict(s=S(3)+0.3,e=S(3)+3.5,x=480,y=topat(S(3))-60,w=700,h=260,color=C['gold'],n=14))
D['sfx'].append(['shimmer',S(3)+0.3,-14])
D['floats'].append(dict(s=at(3,'nam tính'),e=at(3,'Không còn')-0.1,words=['Nam tính','Lịch lãm'],times=[at(3,'nam tính'),at(3,'lịch lãm')]))
D['strikes'].append(dict(s=at(3,'Không còn'),e=E(4)-0.05,old='TƯƠI TRẺ',new='Điềm tĩnh',tStrike=at(3,'nữa'),tNew=at(4,'điềm tĩnh'),y=1040))
D['sfx']+= [['swish',at(3,'nữa'),-16],['ding',at(4,'điềm tĩnh'),-16]]
punch(at(4,'điềm tĩnh'),0.08,26)
# ---- 5-7 HER
D['replace'].append(dict(s=S(5),e=S(5)+2.9,bg='linear-gradient(180deg,#FDEEF1 0%,#F6CFD8 55%,#EBA9B8 100%)'))
D['walls'].append(dict(s=S(5),e=S(5)+2.9,text='HER',color=C['pink'],op=0.45))
D['titles'].append(title(S(5)+0.15,E(7)-0.05,'HER',small='02 · Burberry',color=C['red'],size=240))
D['sfx'].append(['shimmer',S(5)+0.2,-14])
punch(at(5,'Burberry Her'),0.06,24)
pills([('Nữ tính',at(7,'nữ tính')),('Trẻ trung',at(7,'trẻ trung')),('Mọng nước',at(7,'mọng nước')),('Tươi sáng',at(7,'tươi sáng'))],at(7,'nữ tính'),E(7)-0.05,'pink',y=1060)
# ---- 8 who is Her
D['titles'].append(title(S(8)+0.1,at(8,'nũng nịu')-0.2,'nàng Her?',small='Ai là',color=C['red'],italic=True,size=150))
D['floats'].append(dict(s=at(8,'trẻ trung'),e=at(8,'nũng nịu')-0.1,words=['Trẻ trung','Năng động','Nữ tính'],times=[at(8,'trẻ trung'),at(8,'năng động'),at(8,'nữ tính')],color='#7A2338',bg='linear-gradient(135deg,#FDECEF,#F3C1CC)'))
D['bigs'].append(dict(s=at(8,'nũng nịu'),e=E(8)-0.05,lines=['nũng nịu'],italic=True,size=130,color='#F7C5D0',y=1040,shadow='0 6px 24px rgba(90,31,44,.6)'))
D['sfx'].append(['ding',at(8,'nũng nịu'),-15]); punch(at(8,'nũng nịu'),0.07,22)
# ---- 9 versions
D['titles'].append(title(S(9)+0.1,E(9)-0.05,'Her',small='Nhiều phiên bản',color=C['red'],italic=True,size=200))
pills([('Cho từng dịp',at(9,'từng dịp'),{'bounce':1})],at(9,'từng dịp'),E(9)-0.05,'pink')
# ---- 10 LAST BUT NOT LEAST
D['replace'].append(dict(s=S(10),e=E(10),dark=1,bg='radial-gradient(ellipse at 50% 35%, #2c2119, #0c0806 75%)'))
D['bigs'].append(dict(s=S(10),e=E(10),lines=['LAST BUT','NOT LEAST'],font='sans',size=120,color=C['cream'],y=980,echo=True))
D['hideSubs'].append(dict(s=S(10),e=E(10)))
# ---- 11-14 GODDESS
D['replace'].append(dict(s=S(11),e=S(11)+3.0,bg='radial-gradient(ellipse at 50% 30%, #FFF4D6 0%, #EBC983 50%, #B98C45 100%)'))
D['walls'].append(dict(s=S(11),e=S(11)+3.0,text='GODDESS',color='#FFFFFF',op=0.5))
D['titles'].append(title(S(11)+0.15,at(12,'Mọi người nghe')-0.1,'GODDESS',small='03 · Burberry',color=C['ink'],size=150,track=True))
D['sfx'].append(['shimmer',S(11)+0.2,-13])
D['leaks'].append(dict(s=S(11),e=S(11)+3.0,op=0.3))
D['leaks'].append(dict(s=S(13)-0.4,e=E(13)+0.9,op=0.3))
pills([('Chủ lực',at(11,'chủ lực'),{'variant':'ink'})],at(11,'chủ lực'),at(11,'Goddess')-0.1)
words=['nữ quyền','cá tính','mạnh mẽ','tự do','phóng khoáng']
pills([(w.capitalize(),at(12,w),{'bounce':1,'variant':['ink','red','ink','red','ink'][j]}) for j,w in enumerate(words)],at(12,'nữ quyền'),at(12,'Mọi người nghe')-0.05,y=1030)
for j,w in enumerate(words): punch(at(12,w),0.035,6)
D['titles'].append(title(at(12,'Mọi người nghe'),E(14)-0.05,'Nữ thần',small='Goddess =',color=C['red'],italic=True,size=170))
D['sparkles'].append(dict(s=S(13),e=E(14),x=480,y=topat(S(13))-80,w=760,h=300,color='#FFFFFF',n=18))
D['replace'].append(dict(s=S(13)-0.4,e=E(13)+0.9,bg='radial-gradient(ellipse at 50% 30%, #FFF4D6 0%, #EBC983 50%, #B98C45 100%)'))
D['walls'].append(dict(s=S(13)-0.4,e=E(13)+0.9,text='NỮ THẦN',color='#FFFFFF',op=0.5))
D['shakes'].append(dict(t=S(13),amp=10)); D['sfx']+= [['impact',S(13),-9],['shimmer',S(13)+0.05,-13]]; punch(S(13),0.09,20)
pills([('Phụ nữ hiện đại',at(14,'phụ nữ'),{'variant':'ink'})],at(14,'phụ nữ'),E(14)-0.05)
# ---- 15-17 power
D['floats'].append(dict(s=at(15,'quyền lực'),e=at(17,'thử liền')-0.1,words=['Quyền lực','Tỏa sáng','Bung tỏa'],times=[at(15,'quyền lực'),at(15,'tỏa sáng'),at(17,'bung tỏa')],color=C['ink'],bg='linear-gradient(135deg,#F7E2B0,#D4A955)'))
for w_ in ['quyền lực','tỏa sáng']: D['sfx'].append(['pop',at(15,w_),-15])
D['sfx'].append(['pop',at(17,'bung tỏa'),-15])
D['bigs'].append(dict(s=at(17,'thử liền'),e=E(17)-0.05,lines=['Thử liền','em Goddess'],italic=True,size=104,color=C['red'],y=1000,shadow='0 0 26px rgba(255,255,255,.95), 0 0 10px rgba(255,255,255,.9)'))
D['hideSubs'].append(dict(s=at(17,'thử liền'),e=E(17)))
punch(at(17,'Goddess'),0.07,18); D['sfx'].append(['ding',at(17,'thử liền'),-15])
# ---- 18 summary
D['titles'].append(title(S(18)+0.1,at(18,'store của')-0.1,'3 dòng chính',small='Tổng hợp lại',color=C['ink'],italic=True,size=120))
pills([('Hero',at(18,'3 dòng'),{'variant':'ink'}),('Her',at(18,'3 dòng')+0.3,{'variant':'pink'}),('Goddess',at(18,'3 dòng')+0.6,{'variant':'gold'})],at(18,'3 dòng'),at(18,'store của')-0.1)
D['titles'].append(title(at(18,'store của'),E(18)-0.05,'Store',small='Ghé ngay',color=C['ink'],italic=True,size=200))
D['pins'].append(dict(s=at(18,'store của'),e=E(18)-0.05,y=1020,items=[dict(name='Takashimaya',t=at(18,'Takashimaya')),dict(name='Crescent Mall Q7',t=at(18,'Crescent'))]))
D['sfx']+= [['pop',at(18,'Takashimaya'),-14],['pop',at(18,'Crescent'),-14]]
# ---- 19-21 BLACK FRIDAY
D['replace'].append(dict(s=S(19),e=S(19)+2.4,dark=1,bg='radial-gradient(ellipse at 50% 30%, #4a1f17 0%, #1b0e0a 55%, #070504 100%)'))
D['walls'].append(dict(s=S(19),e=S(19)+2.4,text='BLACK FRIDAY',color=C['red'],op=0.55))
D['titles'].append(title(S(19)+0.1,E(19)-0.05,'FRIDAY',small='Black',color=C['ink'],dark=C['gold'],size=180,track=True))
D['timelines'].append(dict(s=at(19,'từ'),e=E(19)-0.05,y=1080)); D['sfx'].append(['riser',at(19,'từ'),-17])
D['titles'].append(title(S(20),E(21)-0.05,'-20%',small='Giảm toàn bộ',color=C['red'],dark=C['gold'],size=260,extrude='#4a120c'))
D['replace'].append(dict(s=S(20)-0.1,e=E(20),dark=1,bg='radial-gradient(ellipse at 50% 30%, #4a1f17 0%, #1b0e0a 55%, #070504 100%)'))
D['walls'].append(dict(s=S(20)-0.1,e=E(20),text='-20%',color=C['red'],op=0.55))
D['shakes'].append(dict(t=S(20),amp=12)); D['sfx']+= [['impact',S(20),-8]]; punch(S(20),0.08,24)
D['sparkles'].append(dict(s=S(20),e=E(20),x=480,y=topat(S(20))-90,w=760,h=300,color=C['gold'],n=16))
pills([('Tất cả nước hoa',at(20,'tất cả'),{'variant':'gold'})],at(20,'tất cả'),E(20)-0.05)
D['receipts'].append(dict(s=S(21),e=E(21)-0.05,y=1000,tGift=at(21,'tặng'),tStamp=at(21,'cực kỳ')))
D['sfx']+= [['pop',at(21,'tặng'),-13],['stamp',at(21,'cực kỳ'),-10]]
D['hideSubs'].append(dict(s=S(21)+0.2,e=E(21)))
# ---- 22 outro
cam_s=at(22,'Cảm ơn')
D['titles'].append(title(S(22)+0.1,cam_s-0.1,'Follow',small='Nhớ',color=C['red'],italic=True,size=220))
D['floats'].append(dict(s=at(22,'khuyến mãi'),e=cam_s-0.1,words=['Khuyến mãi','Sản phẩm','Beauty'],times=[at(22,'khuyến mãi'),at(22,'sản phẩm'),at(22,'beauty')]))
D['endcards'].append(dict(s=cam_s,e=TOT)); D['hideSubs'].append(dict(s=cam_s,e=TOT+1)); D['sfx'].append(['ding',cam_s,-14])
# ---- subtitle lines
KEY={'burberry','hero','her','goddess','parfum','black','friday','20%','20/11','30/11','5','triệu','30ml','takashimaya','crescent','mall','q7','luxury','3'}
P={tuple(p.split()) for p in ["mọi người","nước hoa","chúng ta","các bạn","Black Friday","Crescent Mall","phù hợp","đầu tiên","lựa chọn","nam tính","nữ tính","trẻ trung","năng động","tươi sáng","phiên bản","cô gái","anh chàng","suy nghĩ","đại diện","cực kỳ","hấp dẫn","tỏa sáng","quyền lực","nốt hương","phóng khoáng","tự do","mạnh mẽ","cá tính","khuyến mãi","sản phẩm","chương trình","giàu có","lịch lãm","điềm tĩnh","dễ thương","nũng nịu","hóa đơn","tất cả","nhanh nhất","cập nhật","Cảm ơn","cảm ơn","xin chào","lướt qua","chủ lực","không kém","thể hiện","nữ quyền","phụ nữ","tất tần","tần tật","toàn bộ","5 triệu","rất nhiều","xung quanh","trầm tính","đặc biệt","nhanh tay","ra store","Last but","but not","not least","3 dòng","sử dụng","từng dịp","một xíu","đúng là","Burberry Hero","Burberry Her","Hero Parfum","em Goddess","một chai","biết được","ví dụ","thử liền","mọng nước","Nhớ follow","Crescent Mall","Mall Q7"]}
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
