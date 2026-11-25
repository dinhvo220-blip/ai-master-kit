cd /home/claude/ai-master-kit/remotion
B="--browser-executable=/usr/bin/google-chrome --concurrency=2 --muted --crf=18 --x264-preset=veryfast"
P=public/gucci_person
while [ "$(tail -1 /home/claude/cl3/pg.log)" -lt 1500 ] 2>/dev/null; do sleep 10; done
cp /home/claude/cl3/person.webm public/gucci_person_a.webm
sed -i "s#gucci_person[_a]*.webm#gucci_person_a.webm#" src/gucci/GucciTalk.tsx
npx remotion render src/gucci/index.ts GucciTalk out/q_a.mp4 --frames=0-1199 $B > out/qa.log 2>&1
while ! grep -q done /home/claude/cl3/pg.log; do sleep 10; done
cp /home/claude/cl3/person.webm public/gucci_person.webm
sed -i "s#gucci_person_a.webm#gucci_person.webm#" src/gucci/GucciTalk.tsx
npx remotion render src/gucci/index.ts GucciTalk out/q_b.mp4 --frames=1200-2099 $B > out/qb.log 2>&1
npx remotion render src/gucci/index.ts GucciTalk out/q_c.mp4 --frames=2100-2999 $B > out/qc.log 2>&1
npx remotion render src/gucci/index.ts GucciTalk out/q_d.mp4 --frames=3000-3815 $B > out/qd.log 2>&1
echo DONE > out/gucci.done
