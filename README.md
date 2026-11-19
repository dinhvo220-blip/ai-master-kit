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

## Bổ sung (Gucci Beauty Black Friday, 19/11/2026)
- Main.tsx: palette lấy từ data.palette (mặc định tông Gucci kem/xanh rêu/đỏ/vàng); Pins.label, Timeline a/b + dark, Receipt label/gift/giftHi/stamp, EndCard brand/sub/items đều lấy từ data – đổi brand không cần sửa code. Bản Burberry gốc: src/Main.burberry.tsx.
- data_gucci.py: beat plan mẫu Gucci (1 clip dài, chia shot giả tại các câu để có zoom-cut). Clip 1 file: dùng a0.wav, K0.json (cut0 trong data_gucci theo chunks).
- m30.py: nội suy masks15.u8 -> masks30.u8 (cần trước person.py/data.py).
- sheet.py: ghép ảnh still thành lưới 4 cột có khung vùng an toàn: `python3 sheet.py out.jpg 30 170 ...`
- Cận cảnh (đầu chiếm >50% khung): đặt thẻ/pill/timeline y≈1200–1230, ẩn phụ đề khi có thẻ lớn, tiêu đề sau người ≤150px; chữ nào bị tóc che quá nửa thì chuyển thành bigs (lớp trước) ở y≈300.
