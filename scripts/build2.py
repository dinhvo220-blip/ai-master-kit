import json,glob,subprocess,os,numpy as np,wave
files=sorted(glob.glob('/mnt/user-data/uploads/dji_*.mp4'))
K=[
(1,4.45,10.45,"Hello, xin chào mọi người! Cùng mình lướt qua 3 dòng nước hoa của Burberry. Mà các bạn xem hết đến đây, các bạn sẽ biết được là các bạn phù hợp với dòng nước hoa nào nha."),
(2,8.15,15.65,"Đầu tiên chúng ta sẽ có Burberry Hero mọi người. Một chai nước hoa nam, cực kỳ nam tính. Và ở đây sẽ có nhiều dòng Burberry cho mọi người lựa chọn nha."),
(2,16.00,24.40,"Tùy theo style của mọi người, thì mọi người có thể chọn một style nam tính, trẻ trung, năng động. Hoặc là mọi người có thể chọn một style trầm tính hơn, luxury hơn, kiểu giàu có hơn."),
(3,7.40,16.35,"Ví dụ như phiên bản Burberry Hero Parfum này sẽ cho chúng ta một cái vibe nam tính, lịch lãm nha mọi người. Không còn là một anh chàng tươi trẻ nữa, mà sẽ là một anh chàng"),
(3,16.65,18.45,"điềm tĩnh hơn, nam tính hơn."),
(4,0.70,3.56,"Qua phía bên này, chúng ta sẽ có Burberry Her mọi người."),
(4,4.06,5.35,"Với Burberry Her thì sẽ cho"),
(4,5.65,11.25,"chúng ta một cái vibe nữ tính, trẻ trung, một cái nốt hương kiểu mọng nước, tươi sáng, thì sẽ là Burberry Her cho mọi người."),
(4,27.55,35.15,"Và mọi người thử nghĩ xem xung quanh chúng ta ai sẽ là đại diện cho Her mọi người. Một cô gái trẻ trung, năng động, và có một xíu nữ tính, nũng nịu trong đó."),
(4,56.30,60.60,"Burberry Her cũng có rất nhiều phiên bản cho chúng ta lựa chọn trong từng dịp chúng ta sử dụng luôn nha."),
(5,3.00,4.25,"Last but not least, mọi người ơi!"),
(5,6.23,11.80,"Một dòng chủ lực không kém của Burberry nữa mọi người ơi. Một dòng nước hoa Goddess, thể hiện một cô gái"),
(5,12.15,17.95,"nữ quyền, cá tính, mạnh mẽ, tự do và phóng khoáng. Mọi người nghe cái từ mà gọi là Goddess,"),
(5,18.55,19.15,"đúng là thần đó!"),
(5,19.97,23.52,"Cái dòng nước hoa dòng Goddess này sẽ đại diện cho một kiểu phụ nữ đó mọi người."),
(5,36.55,41.50,"Và nếu mà mọi người muốn hôm đó mọi người mang lên mình một xíu quyền lực, gọi là tỏa sáng, một cái nốt hương"),
(5,41.80,43.70,"tươi sáng theo một cái cách gọi là"),
(5,44.10,47.55,"bung tỏa luôn đó, thì mọi người phải thử liền em Goddess nha mọi người."),
(6,3.80,13.35,"Và tổng hợp lại, chúng ta sẽ có 3 dòng chính của Burberry, và còn rất là nhiều dòng khác ở store của Takashimaya và Crescent Mall Q7, nếu mọi người nhanh tay ra store nha. Và đặc biệt là trong"),
(6,13.70,17.05,"dịp Black Friday này, từ 20/11 đến 30/11 sẽ giảm toàn bộ"),
(6,17.50,19.50,"20% tất cả các nước hoa, và"),
(6,19.90,23.60,"sau giảm, hóa đơn từ 5 triệu, mọi người sẽ được tặng thêm size 30ml nữa nha, cực kỳ hấp dẫn luôn."),
(6,26.83,34.20,"Nhớ follow để cập nhật nhanh nhất về chương trình khuyến mãi nè, những sản phẩm của brand nè mọi người, tất tần tật về beauty của tất cả các store nha mọi người ơi. Cảm ơn mọi người đã xem hết video."),
]
def env(c):
  w=wave.open(f'/root/bb/a{c}.wav');x=np.frombuffer(w.readframes(w.getnframes()),np.int16)/32768
  h=160; return np.array([np.sqrt(np.mean(x[i:i+h]**2)) for i in range(0,len(x)-h,h)])  # 10ms
E={c:env(c) for c in range(1,7)}
def snap(c,t,r=0.08):
  e=E[c]; a=int((t-r)*100); b=int((t+r)*100); a=max(a,0)
  return (a+int(np.argmin(e[a:b])))/100
d='/root/bb/seg2';os.makedirs(d,exist_ok=True)
lst=open(f'{d}/list.txt','w');T=0;out=[]
for i,(c,s,e,t) in enumerate(K):
  s0=max(0,snap(c,s-0.04)); e0=snap(c,e+0.06); du=e0-s0
  vf="scale=1080:1920:flags=lanczos,fps=30,format=yuv420p"
  af=f"afade=t=in:d=0.015,afade=t=out:st={du-0.025:.3f}:d=0.025"
  o=f'{d}/s{i:02d}.mp4'
  if not os.path.exists(o):
    subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{s0:.3f}','-i',files[c-1],'-t',f'{du:.3f}','-map','0:v:0','-map','0:a:0','-vf',vf,'-af',af,'-c:v','libx264','-preset','veryfast','-crf','16','-c:a','pcm_s16le','-ar','48000','-ac','2',o],check=True)
  nf=int(subprocess.check_output(['ffprobe','-v','error','-count_packets','-select_streams','v:0','-show_entries','stream=nb_read_packets','-of','csv=p=0',o]))
  du=nf/30
  lst.write(f"file '{o}'\n"); out.append(dict(c=c,s=s,e=e,text=t,T0=T,T1=T+du,pad=s-s0)); T+=du
lst.close(); json.dump(out,open('/root/bb/K3.json','w'),ensure_ascii=False); print('total',T)
