# W5 — BÁO CÁO THI CÔNG (Sổ trực onboarding b2g)

Agent W5 · thi công xong 20/08/2026 · theo INTERFACE mục 6 + PLAN B.11 + D-#12 + CHOT P3/P6.

## 1. Đã làm gì

### `js/sm-b2g.js` — VIẾT MỚI (718 dòng, namespace `SM.b2g`, IIFE + 'use strict')

| Yêu cầu đề W5 | Vị trí trong file | Cách làm |
|---|---|---|
| Khối 1 · Suất QR | `khungSuatQR` (~:365) | Nút «Sinh 10 suất» → `sinhSuat` sinh mã `GL26-XXXX-XXXX` xác định theo số thứ tự (LCQ từ `SM.hash`, bỏ ký tự O/I/0/1), lưu `localStorage 'smv3:b2g-suat'`; trạng thái chưa cấp/đã in/đã dùng là **hàm tính** (đã dùng = có tenant gắn `license.ma` trùng mã); «In QR» gán cán bộ CB-xx + mở sheet mã to + ô QR giả lập 21×21 module vẽ từ hash mã, ghi rõ «bản giả lập mô phỏng» |
| Khối 2 · Hộ ai theo | `khungHoAiTheo` (~:401) | Bảng hộ↔cán bộ (`coCanBo`), lọc theo CB chọn ở khối Việc hôm nay (select chung `b2gChonCb`) |
| Khối 3 · Xác nhận tay | `khungXacNhanTay` (~:417) | Quét `t.nhatKy` mọi hộ (thật + mô phỏng), lấy dòng có `maCanBo` hoặc `ai` khớp `^CB-\d`; hiện ngày + mã CB + hộ + việc + lý do |
| Khối 4 · Hạn 30 ngày | `khungHan30` + `han30` (~:155, :444) | `han = vuotLuc + 30 ngày lịch`, `conLai` so `SM.CLOCK.today`; vàng <7 ngày, đỏ quá hạn; hộ thật đọc `t.vuotLuc` (dùng thêm `D.mocVuotNguong` của W2 nếu có) → **CD1 lên bảng khi W4 gắn mốc** |
| Khối 5 · Quá hạn chờ | `khungQuaHanCho` (~:466) | Quét `ketNoi[ma].trangThai==='cho_duyet'` có `hanDuKien < today` |
| Khối 6 · Việc hoãn nhóm LUẬT | `khungHoanLuat` (~:487) | Quét connector nhóm luật (`hddt/cts/etax`) có `trangThai==='hoan'` hoặc `hoan===true` + lý do; kèm note «nhóm LUẬT không có bỏ qua hợp lệ» |
| Việc hôm nay của cán bộ | `khungViecHomNay` + `viecCuaHo` (~:226, :334) | Gộp đúng khối 4+5+6 thành dòng hành động («Gọi lại … — Zalo OA chờ duyệt đã quá 2 ngày dự kiến»), sort crit→warn→br, theo CB đang chọn; nút «Xem hộ» mở sheet chi tiết hộ |
| Định mức nhân sự | `khungDinhMuc` + `phanBoPhut` (~:255, :509) | KPI hộ/cán bộ + bar chart 5 khung phút (0–15…>60) 2 chuỗi «có cán bộ / tự làm» từ `phutTuKichHoat` (fallback: hiệu `viecDauTien.doneLuc − batDauLuc`); **mọi cột annotate giá trị** ngay trên đỉnh; chú thích «Số mô phỏng demo» + R-A2-07 |
| Nhóm đợt nộp OA | `nhomDotOA` + `khungDotOA` (~:275, :537) | Nhóm theo đợt (tuần) → số hồ sơ, ngày nộp, ngày dự kiến duyệt = nộp + 2–3 ngày làm việc (hàm nội bộ bỏ T7/CN, cùng nghĩa `ON.congNgayLamViec`), nhãn [Q-004] |
| Căn cứ hành vi D-#12 | `CAN_CU` + `khungCanCu` (~:296, :552) | 4 số đúng PLAN: 75% · 62% · «về cơ bản chưa có» (hội nghị Cục Thuế 6/2025) · 37.000 — mỗi số kèm nhãn **hiện cạnh số**: «2021, khảo sát Facebook ủy quyền, n=999 · [Q-004]»; note «không số nào trình bày như đo đạc mới nhất» |
| Fallback seed chưa có | `hoMoPhong` + `ghiDangNap` | `SM.seedB2G` chưa là hàm → trả [], các khối hiện «Đang nạp dữ liệu mô phỏng — 48 hộ của khoá sẽ hiện ở đây»; Suất QR + 3 hộ thật vẫn chạy |

Dữ liệu chuẩn hoá phòng thủ (W4 làm song song): `lay(r,[...])` đọc nhiều tên trường khả dĩ (`ma/suat/maSuat`, `canBo/maCanBo`/`onboarding.coCanBo.maCanBo`, `phutTuKichHoat/phut`, `dotNopOA/dot`…), `ketNoi` chấp nhận object hoặc mảng. Không file nào ngoài 2 file sở hữu bị ghi.

### `b2g.html` — EDIT NHỎ (3 Edit, không phá khối cũ)

1. `:102–112` — thêm nav `#b2gNav` (2 nút: «Bảng điều khiển» + «Sổ trực onboarding») trước `#app`, và `#sotrucWrap` chứa `<section id="sotruc">` sau `#app`. File gốc **không có nav nào** nên nav mới có 2 nút — mục mới là «Sổ trực», nút còn lại là đường lui về bảng điều khiển (luật «mọi bước có đường lui»). Ẩn/hiện bằng `style.display`, IIFE render cũ của `#app` không bị đụng.
2. `:114–118` — 5 thẻ script cũ `?v=20260818j` → `?v=20260820`.
3. `:317–318` — thêm `js/sm-seed-b2g.js?v=20260820` + `js/sm-b2g.js?v=20260820` sau tất cả script hiện có (sm-b2g gọi `mount()` ngay khi load; nav/section nằm trước nên bắt được).

Điều khiển tab + sự kiện (click `data-xem-ho` / `data-in-suat` / `data-sinh`, change select CB) + `<style id="b2gStyle>` scoped `b2g-*` đều nằm trong sm-b2g.js — b2g.html chỉ thêm thẻ tĩnh.

## 2. Tự soát bằng cách nào — kết quả dán sẵn

- **node --check KHÔNG CHẠY ĐƯỢC** trong phiên này (Bash `node --check` bị từ chối quyền) — không lách sang cách khác ngoài quyền. Thay bằng: **đọc lại toàn bộ file 718 dòng một lượt sau khi Write + 7 Edit**, soát từng khối nối chuỗi/ngoặc/dấu phẩy (mỗi `let h = '<section>…' + … + ';</section>'` đếm đóng mở), kiểm tra mọi hàm được gọi đều khai báo trước khi dùng trong scope IIFE.
- Grep CJK (`\x{4E00}-\x{9FFF}`, kana, hangul, ký tự đầy đủ) trên **cả 2 file**: **0 kết quả**.
- Grep nghiệm thu (dán kết quả):
  - 6 khối: `Khối 1 — Suất QR` (:368) · `Khối 2 — Hộ ai theo` (:403) · `Khối 3 — Cán bộ xác nhận tay «đã nối»` (:427) · `Khối 4 — Hạn 30 ngày…` (:447) · `Khối 5 — Chờ duyệt đã quá ngày dự kiến` (:475) · `Khối 6 — Việc hoãn nhóm LUẬT` (:496) + `Việc hôm nay của cán bộ` (:345) · `Định mức nhân sự` (:513) · `Nhóm đợt nộp hồ sơ Zalo OA` (:539) · `Căn cứ hành vi` (:553).
  - nav có Sổ trực: b2g.html `:104 <button … data-tab="sotruc">Sổ trực onboarding</button>`.
  - không sửa section cũ: 8 heading cũ còn nguyên đúng dòng — IV.7 (:140), IV.8 báo cáo định kỳ (:177), II.3 cohort (:201), IV.8 PDPL (:227), IV.2 (:253), Sổ kiểm chứng (:269), Tình trạng đường truyền (:292) — IIFE render cũ không đụng tay.

## 3. Chưa làm được / rủi ro cần Claude verify khi gộp (nói thật)

1. **Chưa chạy thử trong trình duyệt** — job này không mở được Chrome để verify runtime; chỉ soát tĩnh. Cần lượt verify mở `b2g.html` → bấm «Sổ trực onboarding» → sinh 10 suất → In QR → chọn CB → Xem hộ.
2. **`sm-seed-b2g.js` chưa tồn tại lúc thi công** (W4 song song). Tôi code theo INTERFACE mục 5 + đọc phòng thủ nhiều tên trường; nếu W4 đặt tên khác hẳn (ngoài các tên đã dự phòng) thì khối 2–6 sẽ rỗng «đang nạp dữ liệu» chứ không vỡ trang. Điểm cần đối chiếu nhất với W4: tên trường `phutTuKichHoat`, `dot`/`dotNopOA`, cách đánh dấu hộ **hoãn nhóm luật** (B.2 không định nghĩa trạng thái `hoan` — tôi quét `trangThai==='hoan' || hoan===true` + `lyDoHoan/hoanLyDo/lyDo`), và `vuotLuc` trên 48 hộ.
3. **INTERFACE mục 6 ghi việc hôm nay «`data-di` đi thẳng hộ»** — `data-di` là cơ chế router của mobile.html; b2g không có màn hộ nên tôi thay bằng nút «Xem hộ» mở sheet chi tiết hộ (đúng ranh giới IV.8: chỉ trạng thái + ngày). Claude verify nếu muốn đổi sang cơ chế khác.
4. Trạng thái suất «đã dùng» chỉ tính khi `t.license.ma` trùng mã trong bảng suất b2g — nếu W4 sinh license CD1/CD3 bằng chuỗi riêng (không qua bảng suất này) thì suất b2g không tự đánh dấu; đây là chủ đích (b2g là nơi sinh suất), ghi chú lại để đối chiếu P3.
5. Sheet QR là **QR giả lập** (ghi rõ trên màn) — đúng phạm vi mockup, bản thật cần engine.

## 4. Đếm thay đổi

Write 1 (sm-b2g.js) + Edit 7 (sm-b2g.js) + Edit 3 (b2g.html) + Write 1 (báo cáo này) = **12 thao tác ghi**, đều trong bảng quyền sở hữu W5.

BUILD-AGENT-DONE W5 12
