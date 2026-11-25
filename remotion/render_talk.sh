set -e
cd /home/claude/ai-master-kit/remotion
B="--browser-executable=/usr/bin/google-chrome --concurrency=2 --muted --crf=18 --x264-preset=veryfast"
npx remotion render src/chloe/index_talk.ts ChloeTalk out/k_a.mp4 --frames=0-959 $B > out/ka.log 2>&1
npx remotion render src/chloe/index_talk.ts ChloeTalk out/k_b.mp4 --frames=960-1919 $B > out/kb.log 2>&1
npx remotion render src/chloe/index_talk.ts ChloeTalk out/k_c.mp4 --frames=1920-2865 $B > out/kc.log 2>&1
echo DONE > out/talk.done
