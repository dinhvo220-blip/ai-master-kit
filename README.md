# AI MASTER kit – talking-head motion (mẫu Burberry 3 dòng v4, 18/11/2026)

Lấy kit: `git clone --depth 1 https://github.com/dinhvo220-blip/ai-master-kit ~/ai-master-kit`
Thư mục làm việc: `mkdir -p /root/bb/sfx && cp sfx/*.wav /root/bb/sfx/ && ln -sfn ~/ai-master-kit/remotion /root/ai-master && mkdir -p /root/ai-master/out`
Sau mỗi video có sửa code: commit + push lại kho này.

## Cài (≈3 phút)
pip install --break-system-packages -q faster-whisper rembg onnxruntime opencv-python-headless "av>=11,<16" "click>=8.4.2,<9"
cd ~/ai-master-kit/remotion && npm i -q   # remotion@4, @remotion/noise, react 18, fonts woff2 đã có sẵn
Model tách nền: rembg tự tải u2net_human_seg (~176MB) vào ~/.rembg/models

## Luồng (đường dẫn trong script đang trỏ /root/bb, /root/ai-master – sửa biến đầu file)
1. Trích audio mỗi clip -> a{i}.wav (16k mono). `chunks.py`: tách đoạn theo năng lượng (store ồn: ngưỡng -24 dB, 50 ms) + medium transcribe từng đoạn -> chọn take.
2. `build2.py`: danh sách K=(clip,start,end,"lời đã sửa chính tả"); snap điểm cắt vào chỗ năng lượng thấp nhất ±80 ms; xuất seg 1080x1920@30 + ghép base_v.mp4/base_a.wav (độ dài audio khớp số frame).
3. `align.py`: timestamp từng từ (medium theo từng seg, ghép difflib với lời đã sửa; seg hỏng -> dùng timestamp clip gốc).
4. `matte.py` (u2net_human_seg qua onnxruntime, 540x960, ~0.5 s/frame, CHẠY NỀN ngay sau bước 2) -> `person.py` (webm VP9 alpha 1080x1920, làm sạch vệt nền sáng trên đỉnh tóc).
5. `data.py`: beat plan (titles sau người, floats 2 bên, pills, strike, pins, timeline, receipt, endcard, replace-bg iris ngắn, sfx) -> remotion/src/data.json.
6. `stills.sh 60 300 ...` duyệt bố cục (khung đỏ = vùng an toàn) -> gửi Darren duyệt.
7. Nháp: `npx remotion render ... --scale=0.5`; Bản cuối: `--concurrency=2 --muted --crf=18 --x264-preset=veryfast` (~20 phút/110 s).
8. `mix.py` (voice + sfx) -> loudnorm -14 LUFS -> mux.

## SFX v2 (21/11/2026)
- 39 file trong `sfx/` (9 bản v1 + 30 bản v2 stereo, tự tổng hợp – không bản quyền). Xem `sfx/CATALOG.md` để chọn SFX theo tình huống + mức âm lượng.
- Tạo lại: `python3 scripts/sfx2.py /root/bb/sfx`. Brand luxury: ưu tiên whoosh_soft, ding_luxury, sparkle_long, glass_clink, hit_soft.

## Bổ sung (Gucci Beauty Black Friday, 19/11/2026)
- Main.tsx: palette lấy từ data.palette (mặc định tông Gucci kem/xanh rêu/đỏ/vàng); Pins.label, Timeline a/b + dark, Receipt label/gift/giftHi/stamp, EndCard brand/sub/items đều lấy từ data – đổi brand không cần sửa code. Bản Burberry gốc: src/Main.burberry.tsx.
- data_gucci.py: beat plan mẫu Gucci (1 clip dài, chia shot giả tại các câu để có zoom-cut). Clip 1 file: dùng a0.wav, K0.json (cut0 trong data_gucci theo chunks).
- m30.py: nội suy masks15.u8 -> masks30.u8 (cần trước person.py/data.py).
- sheet.py: ghép ảnh still thành lưới 4 cột có khung vùng an toàn: `python3 sheet.py out.jpg 30 170 ...`
- Cận cảnh (đầu chiếm >50% khung): đặt thẻ/pill/timeline y≈1200–1230, ẩn phụ đề khi có thẻ lớn, tiêu đề sau người ≤150px; chữ nào bị tóc che quá nửa thì chuyển thành bigs (lớp trước) ở y≈300.

## Video kể chuyện không người nói (Burberry Beauty 170 năm, 21/11/2026)
- Style học từ kênh "Thế giới xa xỉ": nền tối 1 màu, kicker chữ thưa + tiêu đề serif vàng in hoa (mask-slide), ảnh khung vàng có góc, huy hiệu năm, nhãn mộc đỏ, chip nốt hương, phụ đề karaoke nhỏ ở đáy, nhãn chương "I · KHỞI NGUỒN" góc trái.
- Code: `remotion/src/story/Story.tsx` + `index.ts` (entry riêng: `npx remotion render src/story/index.ts BurberryStory ...`). Dữ liệu: `scripts/data_story_burberry.py` (đọc lời ở /home/claude/tts/lines2.py, wav từng câu), trộn: `scripts/mix_story.py` (nhạc pad+piano tự tổng hợp, duck dưới giọng).
- Giọng đọc AI: `pip install vieneu` (VieNeu-TTS v3 Turbo, chạy CPU/ONNX, đọc được tên tiếng Anh). Lỗi onnxruntime "External data path escapes model directory" → thay symlink trong ~/.cache/huggingface/hub/*/snapshots bằng file thật. Giọng dùng: "Thục Đoan" (nữ, miền Nam, kể chuyện). Piper vi_VN đọc sai nhiều, không dùng.
- Ảnh chính hãng: shell không vào được burberry.com → mở trang bằng trình duyệt trong app Claude, liệt kê ảnh assets.burberry.com bằng JS, hiển thị từng ảnh full khung (viewport 1200x1500) rồi chụp màn hình (file lưu ở /tmp/claude-tool-results, ~800px). Không commit ảnh/giọng.
- Gradient chữ (background-clip:text) cắt mất dấu tiếng Việt in hoa → thêm paddingTop 0.34em + marginTop -0.3em cho chính phần tử chữ.
- v2 (21/11): Playfair Display rớt dấu chồng tiếng Việt (MUỐN→MUÔN, hỏi trông như sắc) → tiêu đề dùng Noto Serif Display (wght variable, file trong public/fonts). Phụ đề ngắt tay theo cụm nghĩa (SPLIT trong data script), không tách từ ghép. Giọng: clone giọng Darren bằng VieNeu `ref_audio` (đoạn 5–8 s sạch từ clip cũ của Darren), `scripts/gen_clone.py` sinh lại tối đa 4 lần/câu, chọn bản Whisper chép khớp nhất. Không dùng "áo mưa" (tiếng lóng) – gọi là trench coat.
- Clip 2 (makeup, 21/11): `scripts/data_story_makeup.py` + entry `src/story/index_mk.ts` (Story nhận prop d). Không giọng: thời lượng câu ước lượng 3.7 tiếng/giây, xuất kịch bản có mốc giây cho Darren tự lồng tiếng; `mix_story.py ... novoice` (nhạc không duck, loudnorm -20 LUFS để chừa chỗ giọng). Ảnh sản phẩm: dùng preset `?$BBY_V3_SL_1$&wid=1500&hei=1500`; ảnh chụp màn hình trình duyệt chỉ lấy ~533 px CSS góc trên-trái khi viewport 800x800 → phóng ảnh 533*z và căn giữa để lấy vùng sản phẩm.

## Style "Modern Clean" – Black Friday 4 brand (23/11/2026)
- Code: `remotion/src/modern/Modern.tsx` + `index.ts`/`Root.tsx` (comp `BFMulti`, data `src/modern/bf_multi.json`, không commit). Dữ liệu: `scripts/data_bf_multi.py`; lời đã sửa + căn từ: `scripts/align_bf_multi.py` (dựa trên full.json của Whisper medium chạy cả clip, vad_filter).
- Clip đã được Darren cắt sẵn trong CapCut → không cắt lại; base = clip chuẩn hóa `src_n.mp4`. Điểm cắt thật dò bằng chênh lệch khung (54x96 gray, >6× median).
- Chữ sans Be Vietnam Pro (thêm 300/400/700), đen/trắng, kính mờ (backdrop blur). Mỗi brand mở bằng ảnh quầy Darren gửi (public/img, whip vào + zoom-through ra, shine sweep); hook = cover chữ full màn + montage 4 ảnh. Phụ đề: từ đang nói nằm trong ô trắng chữ đen. Note quà chạy suốt clip ở đáy vùng an toàn (y 1478), sáng lên khi nói "theo list".
- **KHÔNG CHỮ ĐÈ MẶT (Darren 23/11):** `face.py` (Haar, mỗi 3 frame) → hộp mặt, đối chiếu head track từ matte. Chip xét theo cửa sổ 3 s: đụng mặt → đổi bên/dời xuống, không được thì bỏ. Thẻ info đụng mặt → cover full màn (nền mờ). Tiêu đề sau người bị đầu che >8% (percentile 75) → cover full màn 1.7–2.2 s.
- Darren xác nhận: Chloé "Signature, Nomade" + dòng Atelier des Fleurs (ghi đủ tên, không viết ADF trơn); Bvlgari Man Rain Essence, Omnia, Allegra Baciami; son Gucci −20% "còn 9 trăm mấy" (9xx.000đ).
