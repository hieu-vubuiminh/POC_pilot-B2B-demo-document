# HỢP ĐỒNG INTERFACE v4 — mọi agent build PHẢI theo đúng, lệch là vỡ tích hợp

Nguồn thiết kế: `PLAN-V4.md` (đọc mục được trỏ trong đề của bạn) + `CHOT-P1-P13.md`. File này chỉ pin
CHỮ KÝ HÀM + HÌNH DẠNG DỮ LIỆU + RANH GIỚI FILE để 7 agent làm song song.

## 0. Quyền sở hữu file — TUYỆT ĐỐI không sửa file ngoài phần của mình
| Agent | Được GHI |
|---|---|
| W1 | `js/sm-onboard.js` (MỚI — Write) |
| W2 | `js/sm-domain.js` (Edit từng chỗ) |
| W3 | `js/sm-inbox.js` (Edit từng chỗ) |
| W4 | `js/sm-seed-gialai.js` (Edit) + `js/sm-seed-b2g.js` (MỚI) |
| W5 | `js/sm-b2g.js` (MỚI) + `b2g.html` (Edit nhỏ) |
| W6 | `mobile.html` (Edit từng chỗ — CẤM Write đè cả file) |
| W7 | `js/sm-ai.js` · `js/sm-ops.js` · `js/sm-program.js` · `index.html` · `web.html` (Edit) |
| W0 | chỉ ghi `docs/plan-v4/out-build/W0-PHAN-BIEN-CAU-HOI.md` |
Mỗi agent ghi thêm đúng 1 báo cáo `docs/plan-v4/out-build/<ID>-BAO-CAO.md` (làm gì, ở dòng nào, tự test gì).

## 1. Connector id v4 (12) + ánh xạ
`bank, zalooa, hddt, cts, etax, ketoan, shopee, tiktok, lazada, shipper, pos, booking`
`D.chuyenId = { bank:['bank','qr'], zalooa:['zalo'], cts:['cks'], etax:['etax','cthue'], ketoan:['ntqg'], shipper:['ghn','ghtk','vtp'] }`
(id không có trong map = giữ nguyên). W2 sở hữu map; **mọi module khác đọc qua `D.connectors()` — cấm hard-code id cũ.**

## 2. W2 — sm-domain.js EXPORT thêm (đặt cạnh helpers thuế/connector hiện có)
```js
D.mocVuotNguong(t, ky='quy') // → null | {luc, han, conLai}
//   đọc t.vuotLuc (NGÀY CUỐI KỲ TÍNH THUẾ có doanh thu lũy kế vượt 1 tỷ — đúng chữ Q-001,
//   KHÔNG phải ngày giao dịch vượt); han = luc + 30 NGÀY LỊCH; conLai = D.ngayGiua(SM.CLOCK.today, han)
//   (âm = đã quá hạn — vẫn trả về, giao diện hiện «đã quá hạn N ngày»)
D.congNgay(iso, n)   // cộng n ngày lịch → iso
D.ngayGiua(a, b)     // số ngày b − a (nguyên, có thể âm)
D.datTrangThaiKetNoi(t, ma, trangThai, meta) // ĐƯỜNG CHUYỂN TRẠNG THÁI DUY NHẤT
//   trangThai ∈ chua_hoi|chua_co_tk|dang_dang_ky|cho_duyet|da_ket_noi|loi|bo_qua
//   meta = {aiBam?, maCanBo?, lyDo?, hanDuKien?, hoSoDaNop?} — ghi vào t.onboarding.ketNoi[ma]
//   + đẩy 1 dòng t.nhatKy (qua SM.ops.ghiNhatKy nếu có, không thì tự push cùng shape)
```
`D.connectors(t)` mỗi phần tử THÊM trường: `trangThai:'ok'|'chua-noi'|'chet'` ·
`doTuoi:{congBo, coChe:'webhook'|'polling'|'thu-cong'|null, pollAnToan, nguon}` (giá trị theo bảng C.15 —
dòng thiếu ghi `congBo:'chưa đo — radar đang hỏi Q-0xx'`) · `lanDongBoCuoi: iso|null` (mốc giờ seed, KHÔNG dùng SM.CLOCK.today).
`deadlines(t)` THÊM thẻ: id `nguong-30n` (loai:'nguong', dichDen:'thue') khi `mocVuotNguong(t) !== null`;
id `ketnoi-dut` (dichDen:'ketnoi') khi có connector `trangThai==='chet'`.
`taxEstimate(t)` trả THÊM `{ sanDaNopThay }` = tổng `o.thueSanDaNop||0` các đơn kênh sàn.
**XOÁ**: nhánh auto-noi `batBuoc` trong `connectors()` + toàn bộ `toggleConnector` (thay bằng `datTrangThaiKetNoi`;
grep chỗ gọi `toggleConnector` trong mobile.html/web.html để BÁO trong báo cáo — W6/W7 sửa phía gọi).

## 3. W1 — sm-onboard.js MỚI, namespace `SM.onb` (alias ON), IIFE 'use strict' như mẫu các module
```js
ON.trangThai(t)            // → t.onboarding (tự khởi tạo đúng shape PLAN B.3 nếu chưa có)
ON.traLoi(t, cau, giaTri)  // cau: 'nguoiLamChinh'|'nganh'|'giayTo'|'kenh'|'doanhThuUoc'|'posHienTai'
ON.danhMucCho(t)           // → {batBuoc:[{ma,ten,viSao,nguon}], nenCo:[...], deSau:[...]} — hàm thuần từ traLoi (PLAN B.7)
ON.tienDo(t)               // 0..100
ON.congNgayLamViec(iso, n) // cộng n NGÀY LÀM VIỆC (bỏ T7/CN)
ON.duocDayTin(t, ngay)     // ≤1 tin đẩy/ngày/hộ — true thì tự ghi nhật ký hanh_dong:'dayTin'
ON.cuaSoTin(t, tenKhach)   // → {trong7Ngay, imLangNgay, freeConLai, duongGui:'tu-van-free'|'tu-van-55d'|'giao-dich-165d', phi}
ON.xacNhanTayCanBo(t, ma, maCanBo, lyDo) // gọi D.datTrangThaiKetNoi(...,'da_ket_noi',{maCanBo,lyDo})
// VIEWS (trả chuỗi HTML + hàm bind, đúng mẫu view/bind của mobile.html):
ON.viewObKichHoat/bindObKichHoat · viewObNhanDien/bind· viewObDanhMuc/bind · viewObCon/bind (nhận mã qua SM.ui)
ON.viewTram/bindTram       // THAY viewKetnoi cũ — 3 khối PLAN B.9 + bảng độ tươi D-#2 (đọc D.connectors().doTuoi)
ON.viewTamDung/bindTamDung // PLAN B.15 (4 bước, confirm 2 lần + gõ «XOÁ»)
```
`t.onboarding` shape = PLAN-V4 mục B.3 nguyên văn. Nút «đọc to câu này» 🔊 + dòng «ảnh giấy tờ nằm trong
máy của hộ…» (P12) nằm TRONG các view wizard = việc W1.

## 4. W3 — sm-inbox.js: KICH_BAN thêm id (đúng tên, W6/W1 tham chiếu)
`tien-ve-trung` (bắn lại ĐÚNG payload id giao dịch tiền-về gần nhất — demo dedup) ·
`ket-noi-dut` (đặt `trangThai='chet'` cho connector sàn đang nối + 1 sự kiện cảnh báo) ·
`cong-thue-phan-hoi` (→ `D.datTrangThaiKetNoi(t,'hddt','da_ket_noi',{aiBam:'cổng CQT (mô phỏng)'})`) ·
`zalo-duyet-xong` (→ zalooa `da_ket_noi`) · đơn sàn (`don-san-moi`) payload THÊM `thueSanDaNop` (số mô phỏng).
`process()` DEDUP: payload có `id`/`transaction_id` đã xử lý → bản ghi sự kiện đánh dấu `trangThai:'trung-bo'`,
KHÔNG tạo nghiệp vụ, tăng `t.trungBoDem`; sổ hộp thư hiện «bản trùng theo id — đã bỏ, không cộng tiền lần hai».
NGUON mỗi nguồn thêm `doTuoi` đồng bộ C.15. Không đổi tên hàm/sự kiện hiện có.

## 5. W4 — seed
`sm-seed-gialai.js` (Edit): CD1 = `dang_noi` (hddt `cho_duyet` + `t.vuotLuc='2026-09-30'` → «còn N ngày» dương;
1 khách `messages` tương tác cuối 2026-08-05 = im lặng >7 ngày) · CD2 = `chua_kich_hoat` (tenant demo wizard
từ đầu) · CD3 = `xong_viec_dau` (viecDauTien 2 mốc thật, cách nhau ~14 phút) · tenant trắng `cd4-moi` ·
`thueSanDaNop` các đơn sàn (CD1/CD3) · `t.license` ({ma:'GL26-…', loai:'chuong-trinh', capLuc}) cho CD1/CD3, CD2 để null (kích hoạt trong demo).
`sm-seed-b2g.js` (MỚI): `SM.seedB2G()` → 48 hộ LCG xác định (mã `GL26-…`, tên «Hộ số N — <ngành>», trạng thái
onboarding rải đủ 7 mức, cán bộ CB-01…CB-06, đợt nộp OA theo tuần) — CHỈ b2g đọc, KHÔNG tên người thật.

## 6. W5 — sm-b2g.js (`SM.b2g`) + b2g.html
Views 6 mục Sổ trực (PLAN B.11) + «Việc hôm nay của cán bộ» + định mức (số hộ/cán bộ, phân bố phút-tới-việc-đầu)
+ nhóm đợt OA + sinh suất QR (bảng ở `localStorage 'smv3:b2g-suat'`) + khối «Căn cứ hành vi» (D-#12, số kèm
nhãn «2021, Facebook ủy quyền, n=999»). b2g.html: Edit nhỏ — thêm 2 thẻ script (`sm-seed-b2g.js`, `sm-b2g.js`,
đều `?v=20260820`), 1 mục nav «Sổ trực», 1 container section. Ranh giới IV.8: chỉ trạng thái + ngày, KHÔNG doanh thu chi tiết hộ.

## 7. W6 — mobile.html (Edit phẫu thuật, theo neo)
(1) `VIEWS` (≈dòng 2418) thêm: `obkichhoat:[ON.viewObKichHoat,ON.bindObKichHoat]`, `obnhandien`, `obdanhmuc`,
`obcon`, `tamdung` — và ĐỔI `ketnoi:[ON.viewTram,ON.bindTram]` (giữ nguyên viewKetnoi cũ trong file, không xoá);
(2) thẻ `<script src="js/sm-onboard.js?v=20260820">` chèn SAU sm-quyen.js, TRƯỚC seed; mọi thẻ js hiện có thêm `?v=20260820`;
(3) boot lần đầu: tenant hiện tại `ON.trangThai(t).buoc==='chua_kich_hoat'` → điều hướng `obkichhoat` một lần (cờ trong `smv3:ui`);
(4) thẻ «Sáng nay cần gì» đầu `viewBan` (D-#11: gom `D.deadlines` + events qua đêm + queue, mỗi mục nút `data-di`);
(5) `sheetNhacNo` (≈dòng 2226) chèn dòng phí từ `ON.cuaSoTin` TRƯỚC nút gửi (hết cửa sổ → «tin Giao dịch 165đ/tin [Q-005]»);
(6) menu «Thêm»: mục `tamdung` «Tạm dừng dùng OPC» nhóm cuối; (7) mọi chỗ gọi `toggleConnector` → thay theo báo cáo W2.

## 8. W7 — sm-ai/sm-ops/sm-program/index/web
sm-ai: 3 A-handler («đơn mới nhất về lúc nào/từ đâu» đọc events · «kênh nào đang đứt» đọc `trangThai` ·
«dữ liệu tươi bao nhiêu» đọc `doTuoi`) + quy ước nhãn `CHUA_DO` («chưa đo — radar đang hỏi Q-0xx») +
afterHoursReply thêm «trợ lý soạn trong 1 phút, hộ duyệt và bấm gửi». sm-ops: `soanNhacNo` trả thêm
`{cuaSo: ON.cuaSoTin(t, tenKhach)}` (fallback an toàn nếu `SM.onb` chưa nạp). sm-program: khối `DOI_THU`
(3 gói KiotViet 270k/330k/490k + 3 dòng kèm 0đ + câu định vị D-#9, nhãn [Q-007]). index.html: render bảng
DOI_THU cạnh bảng giá + 1 mục hồ sơ «độ tươi per-connector» (render từ D.connectors mẫu). web.html: mọi chỗ
đọc id connector cũ đi qua `D.chuyenId`.

## 9. Luật chung (mọi agent)
- **Kim chỉ nam Quang 20/08: người dùng MÙ CÔNG NGHỆ.** Mọi chữ trên màn = lời nói thường (không «connector/
  webhook/OAuth/token» trước mặt hộ); mọi bước có đường lui; không bước nào bắt hiểu kỹ thuật; chữ to, nút to.
- Không CJK; tên người CHỈ lấy từ seed; mọi số/lead-time giữ nhãn [Q-00x]/[seed]/[tự đề xuất] trong comment code
  hoặc chuỗi «nguồn màn hình» sẵn có.
- Không viết cứng kết quả — mọi số hiển thị là hàm tính từ kho.
- File hiện có: CHỈ Edit từng chỗ (Write đè cả file bị coi là hỏng lượt — trừ file MỚI của mình).
- Xong: Write báo cáo `out-build/<ID>-BAO-CAO.md` + in dòng cuối `BUILD-AGENT-DONE <ID> <số thay đổi>`.
- Tự test tối thiểu: `node --check` không dùng được cho file gắn DOM — thay bằng đọc lại diff của chính mình
  + soát ngoặc/dấu phẩy; ghi vào báo cáo «đã tự soát cú pháp bằng cách nào».
