cd "$(dirname "$0")"
npx remotion render src/tygar_cover/index.ts TygarCover out/tygar_cover.mp4 --browser-executable=/usr/bin/google-chrome --concurrency=2 --muted --crf=17 --x264-preset=veryfast && ./render_tygar_talk.sh
