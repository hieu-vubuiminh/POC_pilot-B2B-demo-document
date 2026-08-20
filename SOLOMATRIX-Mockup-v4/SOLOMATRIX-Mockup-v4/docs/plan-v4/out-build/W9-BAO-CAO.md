# W9 — BÁO CÁO THI CÔNG (Nâng Sổ trực b2g theo «5 điều cán bộ cần» + vá số liệu)

Agent W9 · thi công xong 20/08/2026 · theo đề W9 (W0 mục 4: C1, C2, C4, C5) + 2 việc vá số liệu. Toàn bộ thay đổi nằm trong 2 file sở hữu W9 kế thừa từ W5: `js/sm-b2g.js` (14 Edit) + `b2g.html` (1 Edit). KHÔNG Write đè file nào — chỉ Edit từng chỗ có neo.

## 1. Đã làm gì

### Việc C1 — Media query ≤480px (`js/sm-b2g.js` Edit 13, :828–843)

Thêm 1 block `@media (max-width:480px)` vào CUỐI chuỗi style động `#b2gStyle` trong `render()`, mọi rule scoped để không đụng bảng điều khiển cũ (`#app`):

- `#sotruc .kpis{grid-template-columns:repeat(2,1fr)}` — KPI 2 cột;
- `#sotruc .scrollx{overflow-x:auto;-webkit-overflow-scrolling:touch}` — bảng cuộn ngang;
- `#sotruc button` + `#b2gSheet button` `min-height:44px;min-width:44px;font-size:15px` — nút to đủ ngón tay;
- kèm `#sotruc .two{grid-template-columns:1fr}`, `.b2g-viec{flex-wrap:wrap}` + `.b2g-vt{flex-basis:100%}` để dòng việc không chen cột trạng thái.

Đi kèm class mới cho C2/C4: `.b2g-tt` (nhóm 3 nút trạng thái), `.b2g-do-warn/-ok/-no` (cột «Dở ở câu mấy»), `.b2g-viec-xong .b2g-vt{line-through}` (việc xong gập xuống cuối).

### Việc C2 — Cột «Dở ở câu mấy» (Edit 3 :171–214, Edit 4 :146–156, Edit 10 :567–585, Edit 12 :739–752)

- **Hộ thật** (`hoThat()` đúc thêm `onb`): đọc đúng `t.onboarding` — `buoc`, `boQuaLuc`/`buocTruocKhiBoQua`/`manDangCho` (mức màn), `ob2.cau` (câu OB-2 dở 1..5), và `demCauTraLoi(t.traLoi)` đếm số khóa đã có nội dung (`nganh, giayTo, doanhThuUoc, posHienTai, kenh[]` non-empty → 0..5).
- **48 hộ mô phỏng**: không có onboarding → câu dở suy xác định từ mã hộ `1 + SM.hash(h.ma) % 5`, dòng hiện thêm chữ «(số câu suy từ mã hộ — mô phỏng)».
- `dangCho(h)` trả `{cls, text}` theo từng mức: `bo_qua_tam` → «Bấm «Để sau» {ngày} — còn dở ở {màn} (câu n/5)»; `chua_kich_hoat` → «Chưa quét mã suất»; `kich_hoat`/`da_tra_loi` → «Đang dở câu n/5 — đã trả lời k câu»; đã qua → «Đã xong phần hỏi — đang làm phần việc nối».
- Hiện ở **2 nơi đúng đề**: cột mới trong bảng Khối 2 «Hộ ai theo» (`<th>Dở ở câu mấy</th>`, colspan 5→6) + sheet «Xem hộ» (dòng `<b>Đang dở:</b>`).

### Việc C4 — 3 trạng thái bấm được cho «Việc hôm nay» (Edit 2 :27–28, Edit 6 :289–369, Edit 7 :373–399, Edit 9 :487–529, Edit 14 :879–897)

- `localStorage 'smv3:b2g-viec'` (KEY_VIEC); **khoá = mã hộ + loại việc + ngày** (`khoa + '@' + SM.CLOCK.today`) — mai mở lại tự là khoá mới, việc đã xong hôm trước không còn trùng.
- `viecCuaHo()` gán mỗi việc `khoa` dạng `h.id + '|han30'` / `'|choduyet|' + mã` / `'|hoan|' + mã`.
- Mỗi dòng có nhóm `<span class="b2g-tt">` 3 nút «Đang chờ / Đã gọi – hẹn / Xong» (`data-viec-trang` + `data-khoa`), nút đang chọn mang class `pri`; click → `ghiTrangThaiViec` → render lại.
- Việc «xong» **gập xuống cuối** (sort: việc xong trước, rồi theo mức crit→warn→br) + tên việc gạch ngang mờ.
- Note cuối khối giải thích rõ trạng thái tính theo HÔM NAY của đồng hồ demo, mai tự làm mới.

### Việc C5 — Nút «Soạn tin nhắc cuối buổi» (Edit 6 :289–369, Edit 9 :487–529, Edit 14 :879–897, + b2g.html :317)

- Nút nằm ở card head khung Việc hôm nay, `title` ghi rõ: «Gửi vào thư trong ứng dụng của hộ — không qua đường Zalo trả phí, mỗi hộ tối đa 1 tin mỗi ngày» (Q-005 chỉ áp tin Zalo — tin in-app không phí).
- `nhacTinCuoiBuoi(chonCB)` quét các việc chưa «xong» của cán bộ đang chọn → hộ **thật** (cd1/cd3) nhận tin in-app qua `SM.inbox.push(t.id, {nguonId:'app', loaiSuKien:'canh-bao', tieuDe:'Nhà mình còn thiếu {X} — mai cán bộ {CB} qua', payload:{loaiTin:'nhac-onboarding', viecThieu, maCanBo, ngay}})`. KHÔNG Zalo broadcast — đúng N-09.
- Ngân sách ≤1 tin/ngày/hộ: ưu tiên `SM.onb.duocDayTin(t)` nếu có, không có thì **fallback tự đếm nhật ký** cùng shape (`viec:'dayTin'`, `ngay===today`) và tự ghi dòng nhật ký + `SM.save()` — 2 đường dùng chung shape nên không double.
- Hộ **mô phỏng** không push — chỉ tăng đếm demo `demTinMoPhong()` (`localStorage 'smv3:b2g-tin'`, reset theo ngày), hiện dưới nút «Đã soạn N tin cho hộ mô phỏng (demo)».
- Kết quả hiện qua `moSheet`: gửi mới / đã có tin hôm nay (bỏ qua) / số demo.
- **Đề phát hiện phụ thuộc**: `b2g.html` không nạp `sm-inbox.js` → thêm 1 thẻ `<script src="js/sm-inbox.js?v=20260820">` (:317) trước 2 script sẵn — file mình sở hữu, không đụng script cũ.

### Việc Vá số — KPI «Hộ đang theo dõi» (Edit 8 :463–479)

`hoThat()` đúc `dayDu: !!(t.license || t.activatedAt)`; KPI đếm `hộ thật có dayDu (3: cd1, cd2, cd3) + hộ mô phỏng (48) = 51`, caption tách bạch: «3 hộ thật + 48 hộ mô phỏng — thêm 1 hộ demo trắng (cd4-moi) chưa vào theo dõi». Số và chữ cùng một nguồn — không thể lệch.

### Việc Vá ngữ nghĩa — `vuotLuc` tương lai (Edit 5 :225–228, Edit 7 :373–399, Edit 11 :614–637, Edit 12 :739–752)

`han30()` trả thêm `chuaDenLuc: soNgay(today, luc) > 0`. Khi mốc chưa qua (CD1 có `vuotLuc 2026-09-30` > CLOCK 2026-08-17), cả 3 chỗ hiển thị đổi: Khối 4 tag «kỳ thuế chưa chốt» + dòng «Kỳ tính thuế chưa kết thúc — bắt đầu đếm 30 ngày từ {dmy}, hạn {dmy}»; dòng việc hôm nay «Ghé {tên} — kỳ tính thuế dự kiến chốt {dmy}: nhắc sẵn hồ sơ hoá đơn điện tử»; sheet «Xem hộ» cùng chữ. Không còn dạng «còn N ngày» với N>30.

### Ràng buộc chữ

- Bỏ nhãn `[Q-001]` khỏi text dòng việc bảng chính — các mã `Q-0xx` khác chỉ còn ở comment mã nguồn, nhãn nguồn Khối Căn cứ, heading/note sẵn của W5 và sheet chi tiết (mức nguồn, đúng D-#12).
- Không ký tự Trung/Nhật/Hàn; thuật ngữ kỹ thuật chỉ trong comment/title.

## 2. Tự soát cú pháp bằng cách nào

- `node --check` **bị từ chối quyền lần nữa** (thử lại 20/08, vẫn "requires approval") — không lách sang đường khác ngoài quyền.
- Thay bằng: **đọc lại toàn bộ `sm-b2g.js` 927 dòng một lượt sau 14 Edit** — soát từng khối nối chuỗi HTML đóng/mở, đếm ngoặc các hàm mới (`dangCho`, `demCauTraLoi`, `manTuBuoc`, `docViec`, `ghiTrangThaiViec`, `trangThaiViec`, `duocDayTinFallback`, `demTinMoPhong`, `tangTinMoPhong`, `viecThieuChoTin`, `nhacTinCuoiBuoi`), mọi hàm gọi đều là function declaration trong cùng IIFE (hoisted).
- Grep CJK (`\p{Han}|\p{Hiragana}|\p{Katakana}|\p{Hangul}` qua Grep tool) trên cả 2 file: **0 match**.
- Grep nghiệm thu có số dòng: media query `:834` · cột «Dở ở câu mấy» `:571`, `dangCho` gọi ở `:194/:574/:745` · 3 trạng thái `:519`, KEY_VIEC `:27` · nút C5 `:507`, handler `:887`, push `:363` · KPI `:475–479` · `chuaDenLuc` `:228/:380/:622/:630/:635/:747–749` · `sm-inbox.js` trong b2g.html `:317`.

## 3. Chưa làm được / rủi ro cần Claude verify (nói thật)

1. **Chưa chạy thử trong trình duyệt** — chỉ soát tĩnh. Cần lượt verify: mở `b2g.html` → «Sổ trực onboarding» → bấm 3 trạng thái một dòng việc (F5 còn nguyên, đổi ngày demo tự reset) → «Soạn tin nhắc cuối buổi» → mở `mobile.html` hộ cd1 xem tin trong thư.
2. **Nhánh `process()` 'canh-bao' của sm-inbox là code W3**: khi HỘ bấm xử lý tin nhắc, `moTa` sinh theo KICH_BAN «nhãn đứt» của W3 — không khớp nội dung nhắc onboarding. Không sửa được (file W3). Đề xuất W3 thêm phân nhánh đọc `payload.loaiTin==='nhac-onboarding'`.
3. **b2g.html không nạp sm-onboard.js** nên ngân sách 1 tin/ngày luôn đi `duocDayTinFallback` (tự đếm + tự ghi nhật ký cùng shape `viec:'dayTin'`). Mã vẫn ưu tiên `SM.onb.duocDayTin` nếu script đó được nạp sau này — 2 đường cùng shape, không double-count. Không tự thêm thẻ script sm-onboard.js vì ngoài đề.
4. **Seed W4 lệch trường với reader W5**: 48 hộ mô phỏng có `ketNoiTom` (số đếm) + `hanDuKien` cấp hộ + `vuotNguong` (boolean), KHÔNG có dict `ketNoi` từng connector/ngày `vuotLuc` → khối 4/5/6 và «Việc hôm nay» chỉ chạy trên hộ thật. Hệ quả cho W9: nhánh mô phỏng của C4/C5 không có việc mẫu (đếm demo = 0). Tôi **không tự map** `ketNoiTom→ketNoi` vì vượt phạm vi đề W9 — đây là điểm tích hợp W4↔W5 cần Claude quyết (hướng khả dĩ: trong `hoMoPhong()` suy `ketNoi.zalooa = {trangThai:'cho_duyet', hanDuKien, batDauLuc}` khi `cho_duyet>0`).
5. **Thực tế chỉ cd1 có việc hôm nay** (cd3 đã xong việc đầu, cd2/cd4 không việc theo seed) → nút C5 lần đầu gửi đúng 1 tin cho cd1, còn lại báo «đã có tin» nếu bấm lại trong ngày. Nhánh hộ thật nhiều việc/hộ chưa được chạy trên dữ liệu thật.
6. C2 với hộ mô phỏng là **số suy từ mã hộ** (deterministic, có ghi chú «mô phỏng» trên từng dòng) — đúng đề, nhưng không phản ánh trạng thái thật nào.

## 4. Đếm thay đổi

Edit 14 (`js/sm-b2g.js`) + Edit 1 (`b2g.html`) + Write 1 (báo cáo này) + Edit 2 sửa chính tả báo cáo sau soát cuối (1 chữ Hán lọt vào dòng đầu mục 1 do chính agent — đã bỏ, grep CJK lại = 0) = **18 thao tác ghi**, đều trong bảng quyền sở hữu W9.

BUILD-AGENT-DONE W9 18
