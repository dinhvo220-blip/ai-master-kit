import json,re,difflib
F=json.load(open('/root/bb/full.json'))
TX={
0:"Các deal đáng mua nhất trong dịp Black Friday này, vừa được giảm giá, vừa được tặng quà full size nữa mọi người ơi. Cùng Darren xem là những deal nào nha.",
1:"Ở cuối video là có cả makeup luôn nha mọi người ơi, giảm giá makeup chỉ còn chín trăm ít ít thôi.",
2:"Đầu tiên chúng ta sẽ có Burberry giảm 20%, và hóa đơn sau giảm 20% mà từ 5 triệu đến 8 triệu thì các bạn được tặng full size luôn nha.",
3:"Thì ở đây sẽ có Burberry Hero của nam nè, và Burberry Goddess của nữ, hoặc là Burberry Her, trẻ trung năng động.",
4:"Chloé sẽ giảm 20%, và hóa đơn từ 5 triệu đến 8 triệu cũng sẽ được tặng quà tặng full size luôn nha. Nói chung là bây giờ mọi người mua Black Friday ở đâu mọi người cũng sẽ có quà hết á.",
5:"Và đặc biệt ở Chloé, ngoài Signature và Nomade, chúng ta sẽ có dòng ADF, một cái dòng cao cấp của Chloé nữa nha mọi người, duy nhất ở đây mới có thôi.",
6:"Bvlgari cũng giảm 20%",
7:"và có quà tặng nữa,",
8:"tuy nhiên thì quà tặng sẽ theo list của cửa hàng.",
9:"Có thể là những cửa hàng khác cũng giảm 20%",
10:"và có quà tặng full size,",
11:"tuy nhiên thì theo list của cửa hàng.",
12:"Từ quà tặng full size, từ 5 triệu đến 8 triệu",
13:"các bạn sẽ được nhận full size,",
14:"tuy nhiên là nằm trong list nha.",
15:"Và ở store Bvlgari cũng rất là nhiều dòng.",
16:"Đầu tiên sẽ có Man Rain, một cái chai mà Darren cực kỳ thích luôn.",
17:"Và có cả Omnia nè mọi người.",
18:"Chai này cũng là một cái chai rất là đặc trưng của Bvlgari nha.",
19:"Có luôn cả Baciami của dòng Allegra nha mọi người ơi, chai này là mới ra luôn nè.",
20:"Và tiếp theo là Gucci Beauty nha mọi người ơi, sẽ được giảm 20% luôn cho tất cả các sản phẩm.",
21:"Và đặc biệt là mọi người được bốc thăm, và bốc thăm đó là không phải may rủi mà sẽ là trúng luôn.",
22:"Tùy theo cái món mọi người bốc được nha mọi người, bốc lên là trúng thôi đó.",
23:"Và điều kiện được bốc thăm là sau khi giảm hóa đơn trên 5 triệu nha mọi người.",
24:"Mọi người đang đợi son của Gucci đúng không? son của Gucci đang giảm 20% là còn chín trăm ít ít thôi mọi người ơi.",
25:"OK, và đó là những deal mà mình thấy là cực kỳ hấp dẫn trong dịp Black Friday này luôn mọi người.",
26:"Từ 20 tháng 11 đến 30 tháng 11 là hết nha.",
27:"Và đặc biệt quan trọng là hàng cũng rất là ít,",
28:"cho nên mọi người nhanh chân nhanh tay ghé để mà săn deal hời nha mọi người ơi.",
29:"Tại dịp sắp tới cũng là holiday nè mọi người,",
30:"trong những dịp đó mọi người tặng quà rất là nhiều đúng không?",
31:"Dịp cuối năm nữa, cho nên là dịp này là dịp mua sắm tốt nhất cho mọi người luôn á.",
32:"OK, cảm ơn mọi người đã xem hết video.",
33:"Và nhớ follow Darren để cập nhật thêm nhiều thông tin khuyến mãi, cũng như sản phẩm mới về, và tất tần tật về beauty của tất cả các quầy luôn nha.",
}
norm=lambda s: re.sub(r'[^\wÀ-ỹ%/]','',s.lower())
try: W33=json.load(open('/root/bb/w33.json'))
except: W33=None
out=[]
for i,seg in enumerate(F):
  rec=[(w[0],w[1],norm(w[2])) for w in seg['w']]; st,en=seg['s'],seg['e']
  if i==33:
    en=125.35
    if W33: rec=[(w[0],w[1],norm(w[2])) for w in W33]
    else: rec=[r for r in rec if r[0]<122]
  toks=TX[i].split(); nt=[norm(t) for t in toks]
  sm=difflib.SequenceMatcher(a=nt,b=[r[2] for r in rec],autojunk=False)
  tm=[None]*len(toks)
  for bl in sm.get_matching_blocks():
    for j in range(bl.size): tm[bl.a+j]=[rec[bl.b+j][0],rec[bl.b+j][1]]
  L=[max(1,len(t)) for t in toks]; res=list(tm)
  idx=[j for j,x in enumerate(tm) if x]
  bounds=[(-1,st)]+[(j,tm[j][0]) for j in idx]+[(len(toks),en)]
  for (ja,ta),(jb,tb) in zip(bounds[:-1],bounds[1:]):
    gap=list(range(ja+1,jb))
    if not gap: continue
    t0=res[ja][1] if ja>=0 else ta; t1=tb
    if t1<=t0+0.1*len(gap): t1=t0+0.18*len(gap)
    tot=sum(L[g] for g in gap); c=t0
    for g in gap:
      d=(t1-t0)*L[g]/tot; res[g]=[c,c+d]; c+=d
  for j in range(1,len(res)):
    if res[j][0]<res[j-1][0]: res[j][0]=res[j-1][0]
    if res[j][1]<res[j][0]+0.06: res[j][1]=res[j][0]+0.06
  out.append([[round(x[0],3),round(x[1],3),t] for x,t in zip(res,toks)])
  print(i,len(idx),'/',len(toks))
json.dump(out,open('/root/bb/words_m.json','w'),ensure_ascii=False)
