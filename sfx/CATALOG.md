# SFX catalog – AI MASTER kit

Tất cả SFX do code tự tổng hợp (`scripts/sfx.py` cho bản v1 mono, `scripts/sfx2.py` cho bản v2 stereo).
Không lấy từ nguồn ngoài → **không bản quyền, dùng thương mại thoải mái**. WAV 48 kHz, đỉnh -1 dBFS.
Tạo lại: `python3 scripts/sfx2.py /root/bb/sfx`

Mức âm lượng gợi ý khi mix dưới giọng nói (dB so với voice): nhẹ -18, vừa -12, mạnh -8.

| File | Dài | Dùng khi | Mức |
|---|---|---|---|
| **Chuyển cảnh** ||||
| whoosh | 0.55s | chuyển cảnh chuẩn (v1) | vừa |
| whoosh_soft | 0.70s | chuyển cảnh sang trọng, chậm – mặc định cho luxury | nhẹ |
| whoosh_fast | 0.32s | zoom-cut, cắt nhanh | vừa |
| whoosh_deep | 0.90s | chuyển cảnh lớn, mở đầu phần mới | vừa |
| swish | 0.25s | thẻ/pill trượt vào (v1) | nhẹ |
| swoosh_up | 0.60s | chữ bay lên, dẫn vào reveal | vừa |
| riser / riser_long | 0.8 / 2.3s | build-up trước tiết lộ giá/quà | vừa |
| tape_stop | 0.50s | dừng đột ngột, "khoan đã" | vừa |
| **Hiện chữ / UI** ||||
| pop / pop_soft / pop_bubble | 0.1–0.15s | chữ, sticker, icon bật lên | nhẹ |
| click / tick | 0.04–0.05s | bullet, checklist, chọn mục | nhẹ |
| typing | 1.3s | chữ gõ từng ký tự | nhẹ |
| ui_toggle | 0.24s | bật/tắt, so sánh trước–sau | nhẹ |
| **Luxury / sản phẩm** ||||
| ding / ding_luxury | 1.2 / 2.4s | sản phẩm xuất hiện (ding_luxury có reverb, sang hơn) | vừa |
| chime_double | 2.2s | thông báo, tin vui | vừa |
| success_arp | 2.3s | chốt ưu đãi, endcard | vừa |
| shimmer / glitter / sparkle_long | 0.9 / 1.0 / 2.1s | lấp lánh khi lộ chai, logo | nhẹ |
| glass_clink | 1.6s | chạm chai nước hoa, ly | vừa |
| perfume_spray | 0.63s | cảnh xịt nước hoa | vừa |
| magic_reveal | 2.6s | khoe sản phẩm chính (riser + chuông) | vừa |
| camera_shutter | 0.16s | freeze frame, ảnh chụp | vừa |
| **Giá / khuyến mãi** ||||
| cash_kaching | 1.8s | hiện giá sale, % giảm | vừa |
| coin | 0.6s | quà tặng, điểm thưởng | nhẹ |
| price_drop | 0.5s | giá cũ gạch → giá mới | vừa |
| stamp | 0.35s | đóng dấu "SALE", "HOT" (v1) | mạnh |
| countdown_beep | 0.19s | đếm ngược ngày cuối | nhẹ |
| **Nhấn mạnh** ||||
| impact / hit_soft / punch | 0.25–0.9s | nhấn từ khóa (hit_soft hợp luxury) | vừa |
| bass_drop | 1.4s | mở video, tiết lộ lớn | vừa |
| heartbeat | 0.7s | hồi hộp, "chỉ còn…" | vừa |
| glitch | 0.35s | hiệu ứng glitch chữ (dùng ít) | nhẹ |
| record_scratch | 0.45s | "khoan!", đổi ý, hài | vừa |

Nguyên tắc cho brand luxury (Gucci, Bvlgari, Burberry, Kilian…): ưu tiên whoosh_soft, ding_luxury, sparkle_long, glass_clink, hit_soft; hạn chế glitch, record_scratch, tape_stop.
