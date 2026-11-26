# render 2 phần ngoài đoạn cover (0–645, 1270–2395), chạy nền
cd "$(dirname "$0")"
R="npx remotion render src/tygar_talk/index.ts TygarTalk --browser-executable=/usr/bin/google-chrome --concurrency=2 --muted --crf=17 --x264-preset=veryfast"
$R out/talkA.mp4 --frames=0-645 && $R out/talkB.mp4 --frames=1270-2395 && echo ALLDONE
