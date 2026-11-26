import subprocess
S='/home/claude/ai-master-kit/sfx/'
R='/home/claude/ai-master-kit/remotion/out/'
V='/mnt/user-data/uploads/copy_981CDB6F-FEA7-4DD2-AEAF-7F1124784FFA.mov'
cover=[(20.95,'whoosh_soft',0.22),(22.9,'shimmer',0.14),(23.5,'whoosh_soft',0.2),(23.72,'ding_luxury',0.16),(25.18,'hit_soft',0.16),(26.88,'whoosh_fast',0.18),(28.95,'swoosh_up',0.12),(29.62,'whoosh_soft',0.13),(32.86,'whoosh_deep',0.2),(33.75,'sparkle_long',0.14),(36.36,'pop_soft',0.22),(36.4,'glitter',0.1),(39.64,'pop_soft',0.22),(39.7,'glitter',0.1),(42.12,'whoosh_fast',0.2)]
talk=[(0.08,'hit_soft',0.16)]+[(t,'swish',0.09) for t in [2.84,4.4,5.84,7.2,13.4,16.04,18.98,42.6,47.7,52.7,54.7,61.2,62.8,66.9]] \
 +[(t,'pop_soft',0.15) for t in [1.5,3.4,10.0,13.7,19.8,44.6,44.86,48.1,64.9,72.7]] \
 +[(8.5,'shimmer',0.12),(49.5,'click',0.12),(50.5,'click',0.12),(51.5,'click',0.12),(54.8,'glitter',0.1),(66.95,'coin',0.12),(68.06,'hit_soft',0.18),(70.2,'price_drop',0.14),(71.1,'ding_luxury',0.14),(76.9,'success_arp',0.14)]
ev=cover+talk
ins=['-i',V,'-i',R+'talkA.mp4','-i','/home/claude/ai-master-kit/remotion/out/tygar_cover.mp4','-i',R+'talkB.mp4']
for _,n,_ in ev: ins+=['-i',S+n+'.wav']
fl=[]
for i,(t,n,v) in enumerate(ev):
    d=int(t*1000); fl.append(f'[{i+4}:a]aresample=48000,aformat=channel_layouts=stereo,volume={v},adelay={d}|{d}[s{i}]')
fl.append('[0:a]aresample=48000,aformat=channel_layouts=stereo[v]')
fl.append('[v]'+''.join(f'[s{i}]' for i in range(len(ev)))+f'amix=inputs={len(ev)+1}:normalize=0:duration=first,alimiter=limit=0.95[a]')
fl.append("[0:v]fps=30[b];[2:v]setpts=PTS+20.5/TB[c];[3:v]setpts=PTS+1270/30/TB[d];"
          "[b][1:v]overlay=eof_action=pass:enable='lt(t,21.5)'[x1];[x1][c]overlay=eof_action=pass:enable='between(t,20.85,42.6)'[x2];"
          "[x2][d]overlay=eof_action=pass:enable='gte(t,42.6)',format=yuv420p[vo]")
cmd=['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(fl),'-map','[vo]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','18','-c:a','aac','-b:a','192k','-ar','44100','-movflags','+faststart','/root/w/Tygar_full_v2.mp4']
subprocess.run(cmd,check=True); print('ok')
