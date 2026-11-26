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
- v2 (Darren 23/11): cover full màn quá nhiều làm mất hình Darren → chỉ giữ cover ảnh quầy + hook 1.45 s. Thẻ/tiêu đề đụng mặt → **băng chữ chạy** (Ticker, kính mờ, 1–2 dòng chạy ngược chiều, mở bằng wipe) ở trên đầu (y≈252) hoặc trên ngực ngay trên phụ đề; tiêu đề sau người trùng giờ với băng chữ thì dời giờ/bỏ. Chữ hoa tiếng Việt bị cắt dấu khi overflow hidden → paddingTop 0.36em + marginTop âm.
- SFX v3 (`scripts/sfx3.py`): boom_reveal (hút ngược + sub boom, mở ảnh quầy), drumroll_crash + tada_short (bốc thăm), price_slam (giá giảm), pluck_1..4 xoay vòng cho nhãn, swish_ticker, jingle (holiday), bubble_seq; tick rất nhỏ (-25 dB) ở từ khóa phụ đề để có nhịp.

## Style "Bvlgari Holiday 2026" – gift set (23/11/2026)
- Code: `remotion/src/bvlgari/Bv.tsx` (comp `BvGift`, entry `src/bvlgari/index.ts`), dữ liệu `scripts/data_bvlgari_gift.py`, lời `scripts/align_bvlgari_gift.py`.
- Họa tiết theo bao bì nước hoa Bvlgari Holiday 2026: bầu trời sao + pháo hoa vàng, sao 8 cánh, lưới Pantheon. Chuyển cảnh: SkyWipe (màn trời sao xanh đêm quét chéo + pháo hoa + tên chương, giữ ~1 s), StarWipe (sao 8 cánh vàng phóng to rồi mở cảnh mới qua lỗ hình sao), MeshWipe (ô Pantheon lật). Chữ: Noto Serif Display vàng gradient + Be Vietnam Pro; xanh navy #0E1936 / vàng #D9B76C.
- Clip quay cận (mặt chiếm gần hết khung) → không tách nền, không tiêu đề sau người; head track lấy từ Haar (lọc hộp mặt sai: w lệch >30% median, tâm lệch >0.45w). Thẻ sản phẩm đặt thấp sát phụ đề (subTop 1360), hiện ~3.4 s rồi thu thành tag nhỏ ở mép.
- B-roll Darren gửi (lia quầy 3.3 s) làm hook, playbackRate 0.67. Đoạn không lời khoe hộp quà: SFX `musicbox` (hộp nhạc) + sao nhấp nháy.
- SFX thêm trong sfx3.py: firework, musicbox. Render 162 s phải chia ≤1400 frame/lần (timeout lệnh 10 phút).
- Darren xác nhận: Man Rain Essence, Man Wood Essence (cả đoạn 00:21–00:36), Pour Homme, Eau Parfumée Thé Blanc/Thé Vert, Omnia Crystalline EDT (hand cream + chai mini), Omnia Crystalline EDP (hoa nhài, gỗ đàn hương), Omnia Amethyste.

## Video kể chuyện tông sáng – Chloé Eau de Parfum "Vì sao luôn có một chiếc nơ" (24/11/2026)
- Code: `remotion/src/chloe/Chloe.tsx` + `index.ts` (comp `ChloeStory`). Dữ liệu: `scripts/data_story_chloe.py` (đọc `lines_chloe.py`, wav từng câu ở /home/claude/chloe/tts/vseg). Trộn: `scripts/mix_story.py remotion/src/chloe sfx out.wav` rồi loudnorm -14.
- Duyệt still nhanh 1 lần bundle: `node stills_chloe.mjs 100 250 ...` (scale 0.5). Render: `render_chloe.sh` (2 nửa ≤1230 frame, chạy nền).
- Giọng: VieNeu preset **"Thục Đoan"** (nữ, miền Nam, kể chuyện) – `scripts/gen_preset_chloe.py` (tối đa 5 lần/câu, Whisper chấm). Tên riêng viết lại cho TTS: Chloé → "Clô-ê", Gaby Aghion → "Ga-bi A-ghi-ông", Paris → "Pa-ri", năm 1952 → "một nghìn chín trăm năm mươi hai" (đọc "một chín năm hai" Whisper nghe thành "19 năm 2"). Whisper small nghe giọng Nam "chai" thành "trai" – không phải lỗi.
- Ảnh chloe.com: viewport trình duyệt 900x1200 → mở ảnh `dw/image/v2/...jpeg?sw=2000&sfrm=png&q=95` (sw tối đa ~2000, 3600 báo 400), crop phóng to bằng JS (`width:900*s; left:-x0*s`) rồi chụp màn hình (file 800x1066 trong /tmp/claude-tool-results). Ảnh lịch sử: /en-us/maison/history.html (Maison_History_1952 = Gaby Aghion). Áo nơ: tìm "lavallière blouse".
- Ảnh sản phẩm nền trắng trên nền kem: KHÔNG dùng mix-blend multiply trong khối có opacity/filter (bị cô lập, vẫn ra ô trắng) → nhân màu nền trước bằng PIL (`*_m.jpg`) + mask-image radial làm mờ mép.
- Shotcraft đã dùng: text-as-mask (chữ "Chloé" serif chứa ảnh áo bằng background-clip:text thay vì SVG mask – SVG mask không dùng được webfont), light-leak-burn (dọc, tông đào/hồng) cho chuyển cảnh mùi hương, sheen sweep, halation. Chuyển chương: dải ruy băng satin quét chéo. Cảnh mùi hương vẽ bằng code: cửa sổ Paris mở + tia nắng + sương, cánh hoa hồng rơi, lụa gợn sóng chiều tối.

## Talking-head tông Chloé nhẹ nhàng – "Vì sao luôn có một chiếc nơ" (25/11/2026)
- Code: `remotion/src/chloe/ChloeTalk.tsx` + `index_talk.ts` (comp `ChloeTalk`; dùng lại `Mood`, `loadSerif`, `C` export từ Chloe.tsx). Dữ liệu: `scripts/data_chloe_talk.py` (lời đã sửa + căn từ: `scripts/align_chloe_talk.py` trên full.json của `transcribe_full.py`, medium, 1 luồng CPU để chạy song song matte).
- Cắt im lặng bằng trim/concat (src 50.55–52.20); matte chạy trên clip GỐC (masks15), `person_chloe_talk.py` ánh xạ frame đã cắt → frame gốc khi tạo webm alpha. Model: rembg tự tải về /root/.rembg/models/u2net_human_seg/.
- Nền thay sau lưng bằng iris mềm (mask radial-gradient từ đầu x640,y760): cuộn phim tư liệu sepia (2 dải chéo chạy ngược chiều, ảnh lịch sử chloe.com) khi nói nguồn gốc/lịch sử; lụa bay (SVG 4 lớp vải gradient + sheen) khi nói áo sơ mi lụa; sáng Paris rộng (trời, nắng, mái nhà, sương); tiệm hoa (cánh hoa rơi); tối Paris (lụa gợn amber).
- Ảnh chèn: KHÔNG phủ full màn ảnh 3:4 (cover cắt mặt người mẫu dưới tiêu đề) → thẻ khung kem 690x920 trên nền kem, tiêu đề serif ở dải trên, ≤2.6 s. Không chèn khi Darren đang tự cầm chai cận (đoạn nếp gấp/nơ) – chỉ thêm thẻ tiêu đề kính mờ góc phải.
- Phụ đề trên áo sơ mi trắng: chữ trắng KHÔNG đọc được → hộp kính mờ kem, chữ mực nâu Be Vietnam Pro 600, từ khóa serif nghiêng màu hồng đất. Ngắt cụm: mệnh đề theo dấu câu, mệnh đề >6 từ tách ở từ nối, phạt tách từ ghép (danh sách PAIRS).
- Màu: brightness 1.04, contrast .95, saturate .93, sepia .06 cho cả video và người; quầng sáng kem góc trên trái + vignette nhẹ. Zoom theo câu 1.0/1.045/1.02 ease 20 frame.
- Darren xác nhận: "Ở đây có bạn nào biết…", dòng Chloé Signature, Chloé Crescent Mall quận 7.
- v2 (Darren 25/11): tách nền u2net_human_seg làm MẤT chai nước hoa trên tay + mép thô → chỉ trong các cửa sổ có nền thay/chữ sau người: chạy `isnet-general-use` (1024, ~1.5 s/frame, frame chẵn, `scripts/isnet_windows.py`), hợp với human_seg trong vùng nở 91px quanh người, guided filter (opencv-contrib ximgproc, r=5, eps=2e-3), siết alpha (g-0.22)/0.6, bỏ mảnh nhỏ <6000px (`scripts/person_v2_chloe_talk.py`). Giữ được chai, tóc nét.
- Bỏ nền lụa → thay bằng tiêu đề chữ sau người. Bỏ nền vẽ cửa sổ/hoa hồng/tối → bố cục **khung bo góc** theo mẫu Darren gửi: video thu 0.95, dịch (-6, 452), clip inset(1050 60 24 60 round 60) ở nửa dưới, lớp người (matte) cắt phía trên khung → đầu nhô ra khỏi khung; ảnh thật Paris (Unsplash, chụp qua trình duyệt) khung dọc 330x440 phía trên, lần lượt trượt phải→trái; chữ viết tay Dancing Script 700 (có tiếng Việt, @fontsource/dancing-script) gradient hồng đất, xoay -4°, lộ dần trái→phải; dòng chữ nhỏ sans nghiêng xen kẽ đậm/nhạt hiện theo lời. Phụ đề hạ 70px khi ở bố cục khung.
- Unsplash: trang tìm kiếm có màn kiểm tra trình duyệt (chờ vài giây); ảnh lấy bằng `images.unsplash.com/<id>?w=..&h=..&fit=crop`, viewport 675x1200 → chụp 800x1421.

## Gucci Beauty đứng nói "Hà Nội cũng giảm 20%" – kiểu chữ mới (25/11/2026)
- Code: `remotion/src/gucci/GucciTalk.tsx` + `index.ts`; dữ liệu `scripts/data_gucci_talk.py`, lời `scripts/align_gucci_talk.py`, phụ đề dùng chung `scripts/subs_util.py` (make_subs).
- Kiểu chữ học từ mẫu Darren gửi (kênh talking head): serif nghiêng THÂN HẸP = Noto Serif Display wdth-italic (@fontsource-variable, `fontVariationSettings "'wdth' 62.5"`), gradient xanh rêu Gucci đổ mờ ở chân chữ, quầng sáng trắng (drop-shadow 10px + 32px), hiện bằng nhòe tan (blur 18→0, giãn chữ), ẩn bằng nhòe ngang + bóng mờ lệch. Chữ nhỏ Be Vietnam Pro 300/400 viết thường, tracking âm. Số (−20%, 505, ngày) vàng đậm #7E5718→#B98A3E (vàng nhạt không đọc được trên nền hồng). Tất cả tiêu đề đặt SAU người ở dải trên.
- Phụ đề không hộp: chữ xanh rêu 600 38px + quầng trắng, từ khóa serif hẹp nghiêng vàng.
- Tốc độ: matte u2net 1.07 s/mask → clip 127 s mất ~35 phút nếu 15 fps. Đã đổi: phần sau chạy 7.5 fps (bước 4 frame, masksB) + guided filter theo ảnh gốc vẫn giữ mép nét. KHÔNG render Remotion song song với matte/person (Chrome crash "Page crashed!" do thiếu RAM).
- Darren xác nhận: son lì = Rouge à Lèvres Mat (Matte) màu 505 Janet Rust (best seller), son dưỡng có màu = Rouge de Beauté Brillant, Gucci Beauty 2 chi nhánh: Crescent Mall Q7 (HCM), Vincom Bà Triệu (Hà Nội); cả 2 có khắc tên.

### Gucci Hà Nội v2 (25/11) – bài học
- Chữ theo mẫu Darren: chồng 3 tầng (sans nhỏ lệch trái, serif nghiêng chữ thường Noto Serif Display màu xanh Gucci + glow trắng, sans nhỏ lệch phải) đặt TRƯỚC người ngang ngực → không còn bị mất chữ.
- Chữ đậm sau đầu chỉ dùng ở vài beat có matte tốt (HÀ NỘI, −20%).
- Matte: mask 15 fps (không dùng 7.5), isnet hợp u2net cho hook, guidedFilter r=7 eps=3e-3 + EMA 0.65/0.35 → tóc mượt.
- Serif tự co: fontSize = min(124, 780/(0.52*số ký tự)) để câu dài không tràn mép.
- Card layout: thêm CardWord lớn để phần trên thẻ không trống.
- Sửa đoạn ngắn: render --frames từng đoạn, cắt phần còn lại bằng select, concat demuxer rồi re-encode với setpts=N/30/TB (concat -c copy làm hỏng timestamp; filter trim nhiều lần trên 1 input bị OOM).

## Bvlgari Le Gemme Tygar – đồ hoạ soạn trước theo kịch bản voice-off (26/11/2026)
- Code: `remotion/src/tygar/Tygar.tsx` (comp `TygarGfx`, entry `src/tygar/index.ts`), duyệt still: `node stills_tygar.mjs 60 150 ...`.
- Style dynamic word reels (skill 6h) + tông mắt hổ: đen #0D0A07 / nâu #2A1A0E / hổ phách #C47A2C / vàng #D9B26A→#F3DDA2. Từ khóa khổng lồ sau đầu đổi theo lời (13tr đếm số → Tygar → Le Gemme → đá quý → mắt hổ → Kerala → Cavallier → bưởi/gừng/hổ phách → ngày & đêm → -20%), thẻ kính mờ, viên đá mắt hổ cabochon có dải sáng chạy, tháp hương, lưới chai sáng dần, timeline 20.11→30.11, màn kết.
- `preview=true` vẽ nền + bóng người giả. Khi có clip: thay PreviewBg/PreviewPerson bằng OffthreadVideo + matte, khớp BEATS theo timestamp lời thật.
## Cover ảnh thật – Bvlgari Le Gemme Tygar (26/11/2026)
- Code: `remotion/src/tygar_cover/Tygar.tsx` + `index.ts`/`Root.tsx` (comp `TygarCover`, 675 frame = 20.5→43.0 s của clip gốc, `public/tygar/seg.mp4` cắt từ clip). Duyệt still: `node stills_tygar_cover.mjs 60 150 ...`. Ghép lại: ffmpeg `overlay` với `setpts=PTS+20.5/TB` lên video gốc + SFX `adelay` (không render lại cả video).
- Ảnh THẬT, không tự tạo: chai Le Gemme từ media.bulgari.com (`image/upload/f_png/<id>.png`, Tygar 1742326, Onekh 1742328, Amunae 1742279, Gyan 1742332, Falkar 1742301, Yasep 1742329, Sahare 1742283) + Wikimedia Commons (Tiger's eye 2.jpg, Tiger's eye quartz 12.jpg, Green Park Spices plantation-WUS07412/07404 – Kerala, Citrus paradisi white bg, ginger root). Shell không vào được 2 trang này → lấy bằng trình duyệt trong app: viewport 675x1200, hiển thị ảnh full khung (JS document.body + img), chụp màn hình scale 1 (file 800x1421 trong /tmp/claude-tool-results; scale <1 thì file lưu cũng bị nhỏ). Commons API trong trình duyệt: `/w/api.php?action=query&generator=search&gsrnamespace=6&prop=imageinfo&iiurlwidth=330` (chỉ dùng cỡ thumb chuẩn 330/500/1280/3000). Chai trắng nền: trim bằng canvas rồi rembg `isnet-general-use`; quả/gừng cutout bị mờ mép → dùng khung tròn (medallion) ảnh gốc.
- Cảnh: (1) 6 chai Le Gemme trồi lên + quầng sáng nắp đá; (2) nền vân đá mắt hổ + viên đá cutout + TYGAR tracking expand; (3) Kerala rừng gia vị → iris sang dây tiêu; (4) chai Tygar giữa, note hương hiện theo lời: đường vàng vẽ từ chai ra medallion ảnh thật (01 Bưởi, 02 Gừng). Chuyển: iris vào, light leak, whip, dip đen, zoom-through ra.

## Tygar talking-head – chữ cho phần ngoài cover (26/11/2026)
- Code: `remotion/src/tygar_talk/Talk.tsx` (comp `TygarTalk`, 2396 frame) – dùng lại bộ đồ hoạ soạn trước `src/tygar` (BigWord, Glass, Pill, Pyramid, Duo, BottleGrid, Timeline, EndCard) khớp lời thật + phụ đề cụm nghĩa (từ khóa serif nghiêng vàng, nền kính tối mờ). Render `render_tygar_talk.sh` (2 phần, bỏ đoạn cover), ghép `scripts/final_tygar.py` (overlay talkA → cover → talkB + SFX), rồi loudnorm -14.
- Nền tường quầy Bvlgari cam-vàng → chữ vàng chìm: chữ lớn đổi sang nâu espresso + quầng kem; thẻ kính tối rgba(16,11,7,.62).
- Đoạn 0–21 s đầu Darren cao (đỉnh tóc ~y330) → chữ lớn đặt TRƯỚC người, ≤150px, chỉ đè tóc; từ 42 s đầu thấp hơn → chữ sau người (matte u2net 15fps + guided filter, `scripts/person_tygar_talk.py`).
- Whisper medium "ảo" chép lại initial_prompt cho cả đoạn 1.5–18 s → chạy lại không prompt cho đoạn đó. "đã đoàn thấy" = "Darren thấy"; "lông viên hương" = long diên hương; "có điều hồi" = "có deal hời".
- v2 (Darren 26/11): phụ đề PHẢI 1 dòng (cắt cụm ≤ ~30 ký tự, nowrap, cỡ tự co), viền chữ tối thay hộp nền (hộp đổi kích thước gây giật). Chữ lớn: lộ bằng mặt nạ trượt lên + giãn chữ, ra bằng mờ tan 12 frame chồng sang từ sau (không nhảy). Pill trượt + mờ, không scale nảy. KHÔNG chữ đè mặt: Haar (`/root/w/faces.json`) kiểm tra hộp mặt × khung chữ; nửa sau đầu thấp (cằm ~y1265) → thẻ/pill dời xuống y≈1300, phụ đề 1445. Chuyển cảnh cover: hoà tan chéo + zoom + nhòe (bỏ iris tròn, whip, dip đen).
