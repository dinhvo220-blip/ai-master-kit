set -e
cd /home/claude/ai-master-kit/remotion
B="--browser-executable=/usr/bin/google-chrome --concurrency=2 --muted --crf=18 --x264-preset=veryfast"
npx remotion render src/chloe/index.ts ChloeStory out/c_a.mp4 --frames=0-1229 $B > out/ra.log 2>&1
npx remotion render src/chloe/index.ts ChloeStory out/c_b.mp4 --frames=1230-2456 $B > out/rb.log 2>&1
echo RENDERDONE > out/render.done
