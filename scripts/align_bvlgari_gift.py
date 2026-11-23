import json,re,difflib
F=json.load(open('/root/bb2/full.json'))
TX={
0:"Tổng hợp tất cả các bộ gift set của Bvlgari trong mùa lễ hội này, nhớ lưu video lại, biết đâu bạn sẽ cần.",
1:"Đầu tiên sẽ có Man Rain Essence, đây cũng là dòng nước hoa mà Darren cực kỳ thích luôn.",
2:"Với trà xanh và musk, phù hợp với những chàng trai trẻ trung, năng động, yêu thích sự sạch sẽ và hiện đại.",
3:"Đối với set này sẽ có một chai full size và một chai 15ml, và đặc biệt cái chai 15ml này là dạng xịt luôn nha.",
4:"Một chai nhỏ dạng xịt rất phù hợp để bỏ túi.",
5:"Thiên về gỗ thì sẽ có Man Wood Essence.",
6:"Mạnh mẽ, nam tính, dành cho những người đàn ông trưởng thành, tự tin và cá tính.",
7:"Một set hương ấm áp dành cho buổi tối, nếu ban ngày mọi người xịt ít lại sẽ ok.",
8:"Và cũng là một chai full size và một chai 15ml dạng xịt luôn nha mọi người.",
9:"Thì set này cũng cực kỳ thú vị mọi người ơi, cũng là note trà và musk.",
10:"Tuy nhiên thì Pour Homme sẽ phù hợp cho những bạn nào thích sự tinh tế, điềm đạm, một quý ông lịch lãm á.",
11:"Thì set này sẽ rất là phù hợp, và set này sẽ có một chai mini nè, một chai full size và một chai sữa tắm nữa mọi người ơi.",
12:"Cái hộp mà Darren thấy là rất là xinh.",
13:"Đã có đầy đủ cho mọi người từ sữa tắm, nước hoa mini và nước hoa full size luôn.",
14:"Ở dòng Eau Parfumée chúng ta sẽ có Thé Blanc, nốt hương trà trắng và musk.",
15:"Dành cho ai yêu thích sự tối giản và một xíu nốt hương kiểu hơi thư giãn một xíu á.",
16:"Chúng ta cũng sẽ có Thé Vert.",
17:"Tươi, mát, xanh, có một xíu cam chanh, phù hợp với những người năng động, cảm giác sảng khoái và tự nhiên.",
18:"Với nữ thì sẽ có Omnia Crystalline, mọi người, bản EDT thì sẽ có hand cream và một chai mini cho mọi người.",
19:"Và một chai cũng là 15ml và dạng xịt luôn á.",
20:"Một nốt hương trong trẻo với hoa lê và sen.",
21:"Một nốt hương dành cho những nàng mà dịu dàng, trẻ trung.",
22:"Rồi cũng sẽ có bản EDP.",
23:"Một nốt hoa nhài, gỗ đàn hương.",
24:"Dành cho những cô nàng thích sự sang trọng, nữ tính.",
25:"Tuy nhiên thì vẫn trẻ trung nha mọi người.",
26:"Cô nàng thật sự lãng mạn, thanh lịch, tinh tế.",
27:"Thì đây là một bản Omnia Amethyste.",
28:"Thì bản này sẽ là một nốt hoa phấn nhẹ mọi người.",
29:"Một nốt hương hoa, tuy nhiên hơi có một chút powdery.",
30:"Một chai full size và một chai 15ml dạng xịt.",
31:"Cái hộp cũng rất là xinh, cái này mọi người làm quà tặng cũng rất là đẹp.",
32:"Còn nếu mọi người muốn custom một cái hộp quà xinh xẻo hơn,",
33:"mọi người có thể đến store để mọi người lựa chọn những cái sản phẩm phù hợp để mọi người bỏ vào đây,",
34:"rồi gói lại cho mọi người, cũng rất là nhiều màu ruy băng cho mọi người lựa chọn luôn.",
35:"Và cái hộp cũng rất là xinh.",
36:"Tất cả đang có sẵn tại store rồi.",
37:"Nếu mà mọi người đến store mọi người mua thì còn có nhiều quà tặng hơn nữa,",
38:"hoặc là mua online cũng được luôn,",
39:"mọi người có thể để comment,",
40:"Darren sẽ gửi contact BA tư vấn cho mọi người ha.",
41:"Rồi, hiện tại thì có rất là nhiều ưu đãi tại store nè mọi người.",
42:"Khi mà mọi người mua chính hãng tại store thì cũng rất là nhiều ưu đãi,",
43:"cũng như là dịch vụ kèm theo, gói quà cũng rất là xinh luôn á,",
44:"nên là mọi người có thể mua trực tiếp tại store ha.",
45:"Hiện tại là Darren đang ở store của Bvlgari, Crescent Mall Q7.",
46:"Mọi người nghĩ xem sắp tới mọi người sẽ dành những set quà tặng này cho ai.",
47:"Còn nếu mà chưa cần thì hãy lưu video này lại, để biết đâu một ngày nào đó mọi người lại tìm lại.",
48:"Cảm ơn mọi người đã xem hết video.",
}
norm=lambda s: re.sub(r'[^\wÀ-ỹ%/]','',s.lower())
assert len(TX)==len(F),(len(TX),len(F))
out=[]
for i,seg in enumerate(F):
  rec=[(w[0],w[1],norm(w[2])) for w in seg['w']]; st,en=seg['s'],seg['e']
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
json.dump(out,open('/root/bb2/words.json','w'),ensure_ascii=False); print('ok',len(out))
