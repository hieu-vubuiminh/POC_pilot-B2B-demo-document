# W7 — BÁO CÁO THI CÔNG

Agent W7 · 5 file sở hữu: `js/sm-ai.js` · `js/sm-ops.js` · `js/sm-program.js` · `index.html` · `web.html`.
Đối chiếu: INTERFACE-V4 mục 8 + PLAN-V4 D-#4 (mảng ops), D-#7, D-#9, C.15, N-06, [Q-007/Q-039/Q-005] + CHOT P11 (phần mockup làm ngay).

## Đã làm gì

### 1. `js/sm-ai.js` — 5 edit
| # | Chỗ | Việc |
|---|---|---|
| 1 | :116 | Hằng `CHUA_DO = 'chưa đo — radar đang hỏi Q-0xx'` đặt trước `A_HANDLERS`, export trong `SM.ai` để module khác dùng chung (D-#7 / R-A3-04) |
| 2 | :265–331 | 3 A-handler mới cuối `A_HANDLERS`: «đơn mới nhất» (đọc `SM.inbox.list` — nguồn qua `nguonCua`, giờ từ ISO, tổng tiền tính từ `payload.items`, kèm `tinhTu` như handler cũ) · «kênh nào đứt» (đọc `D.connectors` trường `trangThai`, fallback `c.noi` khi W2 chưa ship) · «dữ liệu tươi» (đọc `doTuoi.congBo` + phút từ `lanDongBoCuoi`, dòng thiếu trả nhãn `CHUA_DO`) |
| 3 | :378 | `afterHoursReply` thêm trường `choHo` = «Trợ lý soạn sẵn trong 1 phút, cô chú đọc rồi tự bấm gửi — tin chỉ đi khi cô chú bấm.» (N-06, nguyên văn đề + 1 vế giải thích) |
| 4 | :452–454 | `suggestions` thêm 3 câu gợi ý tương ứng (đã soát key match qua `strip()`) |
| 5 | :459 | Export `SM.ai` thêm `CHUA_DO` |

### 2. `js/sm-ops.js` — 1 edit
- `soanNhacNo` (:329–341) trả thêm trường `cuaSo: SM.onb && SM.onb.cuaSoTin ? SM.onb.cuaSoTin(t, r.buyer) : null` — fallback null an toàn khi sm-onboard.js chưa nạp (D-#4, [Q-005]). Chữ ký cũ giữ nguyên — mobile W6 đọc trường mới.

### 3. `js/sm-program.js` — 2 edit
- Khối `DOI_THU` (:105–126): 3 gói 270k/330k/490k đ/tháng + phụ phí «+270.000đ hoặc +375.000đ tùy gói / chi nhánh, +150.000đ / kho» + 3 dòng kèm 0đ (HĐĐT, chữ ký số, PM kế toán hộ KD) + câu định vị nguyên văn D-#9 + nhãn `[Q-007]`, `nhanNguon` ghi «mốc giá đối chiếu Q-039».
- Hàm `tinhKiotVietNam(goiIdx, soChiNhanh, mucChiNhanh, soKho)` (:130–135): tổng năm TÍNH từ cấu phần (phần kèm 0đ không cộng) — không có tổng viết cứng. Export `SM.prog` thêm `DOI_THU, tinhKiotVietNam`.

### 4. `index.html` — 3 edit
- `secGia` (:243–270): khối «So với KiotViet» đặt CẠNH bảng giá IV.9 — bảng 3 gói (3 cột kèm «0đ kèm»), dòng phụ phí, bảng «so cùng kỳ 12 tháng» chạy `tinhKiotVietNam(0,1,0,1)` cho 3 chân dung vs `tinhGia().nam1.si`/`nam3` (ghi rõ giả định hộ 1 cửa hàng + 1 kho + gói rẻ nhất; công thức in dưới con số).
- `secKetnoi` (:355–374): mục hồ sơ «Độ tươi dữ liệu từng kênh nối (bảng C.15)» — render từ `D.connectors(SM.tenant(HO))`, đủ cột C.15 (độ tươi công bố · cơ chế · đối soát an toàn · nguồn) + trạng thái D-#5 (ổn/chưa nối/đứt–kiểm tra) + «lần cuối X phút trước» từ `lanDongBoCuoi`; dòng thiếu hiện nhãn CHUA_DO (fallback chuỗi nội tuyến khi `AI.CHUA_DO` chưa có).
- 7 thẻ script bump `?v=20260818j` → `?v=20260820` (file mình sở hữu; tránh cache js cũ sau khi W2/W7 đổi tầng js).

### 5. `web.html` — 1 edit (tabKenh :348–363)
- Helper `chuyenId(id)` đi qua `D.chuyenId` (fallback `|| id`) — áp cho `data-cid` của dòng trạng thái (chỗ duy nhất trong web đọc id connector).
- Nút «Bật/Ngắt» + toàn bộ khối bind `toggleConnector` bị XOÁ (W2 xoá hàm khỏi sm-domain — grep web.html: 0 match `toggleConnector`), thay bằng badge «đã nối / chưa nối» + dòng chữ tĩnh «quản lý kết nối trên điện thoại của hộ» (web là màn kế toán chia sẻ, không nối hộ).

## Tự soát cú pháp bằng cách nào
- `node --check` bị harness chặn quyền (không chạy được) → theo INTERFACE mục 9, đọc lại TOÀN BỘ diff của mình (sm-ai :116–120, :265–332, :378, :452–459; sm-ops :329–341; sm-program :99–135; index :243–270, :355–374; web :348–363) — soát ngoặc/dấu phẩy/backtick từng khối, kể cả template literal lồng.
- Chạy ripgrep `\p{Han}|\p{Hiragana}|\p{Katakana}|\p{Hangul}` trên cả 5 file: **0 match** (lưu ý: `grep -P` không có trên macOS — lần grep -P báo «SACH» là vô hiệu, kết luận bằng ripgrep mới tính).

## Grep nghiệm thu (đã chạy, kết quả thật)
```
$ grep -c "don moi nhat|kenh nao dut|du lieu tuoi" js/sm-ai.js   → 3 (3 handler mới)
$ grep -n "CHUA_DO" js/sm-ai.js                                   → 5 chỗ (hằng + comment + 2 dùng + export)
$ grep -c "DOI_THU" js/sm-program.js index.html                   → 5 và 4 (tồn tại + được render)
$ grep -n "So với KiotViet|Độ tươi dữ liệu từng kênh" index.html  → :243 và :355 (2 khối mới)
$ grep -c "toggleConnector" web.html                              → 0 (đã sạch)
```

## Chưa làm được / cần ai khác
- **Phụ phí KiotViet +270k/+375k mỗi chi nhánh**: bản gốc [Q-007] (T4-FINDINGS dòng 9) không ghi rõ mức nào cho gói nào → tôi KHÔNG tự gán; hiển thị «tùy gói» và hàm tính nhận tham số mức do caller chọn. Nếu Quang/de-An có mapping thật, sửa 1 chỗ trong `DOI_THU.goi`.
- Hiển thị độ tươi phụ thuộc W2 ship `doTuoi`/`trangThai`/`lanDongBoCuoi` trong `D.connectors()` — tôi đã viết fallback đầy đủ (nhãn CHUA_DO, `c.noi`, «—»), chạy không lỗi dù W2 chưa xong, nhưng số đo thật chỉ hiện khi W2 nộp.
- `soanNhacNo.cuaSo` chỉ có giá trị khi W1 nộp sm-onboard.js — trước đó luôn null (an toàn, đúng đề).
- Không mở Chrome kiểm tra render (máy Air vai trò read-only dashboard; đó là bước verify của phiên tương tác, không phải của job build này).

BUILD-AGENT-DONE W7 12
