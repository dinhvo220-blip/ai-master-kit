cd /home/claude/ai-master-kit/remotion
B="--browser-executable=/usr/bin/google-chrome --concurrency=2 --muted --crf=18 --x264-preset=veryfast"
while ! grep -q done /home/claude/cl3/pg.log; do sleep 5; done
cp /home/claude/cl3/person.webm public/gucci_person.webm
for r in "a 0-959" "b 960-1919" "c 1920-2879" "d 2880-3815"; do set -- $r
  for try in 1 2; do npx remotion render src/gucci/index.ts GucciTalk out/q_$1.mp4 --frames=$2 $B > out/q$1.log 2>&1 && break; done
done
echo DONE > out/gucci.done
