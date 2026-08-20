# W3 — BÁO CÁO THI CÔNG `js/sm-inbox.js`

Agent W3 · ngày 20/08/2026 · sở hữu duy nhất `js/sm-inbox.js` (Edit từng chỗ, không Write đè).
Đối chiếu: INTERFACE-V4 mục 4 + 9 · PLAN-V4 D-#3/#5/#8, C.15, dòng E bảng module · CHOT-P1-P13.

## 1. Đã làm gì — 5 việc của đề

### Việc 1 — DEDUP trong `process()` (D-#3, [Q-006])
- `khoaDuyNhat(p)` (dòng ~144): rút mã giao dịch từ payload theo thứ tự `transaction_id → id → maGiaoDich → maDon → maVanDon → maDat` (ghép cả tên trường vào khóa để hai loại mã trùng số không ăn nhầm nhau).
- Nhánh chặn trong `process()` (dòng ~162–183): tra **sổ sự kiện đã lưu** — cùng hộ + cùng nguồn + cùng khóa, đã `da-xu-ly` thì bản mới đánh dấu `trangThai:'trung-bo'`, `ghiChu:'bản trùng theo id — đã bỏ, không cộng tiền lần hai'`, `taoRa.moTa:'Máy nhận trùng một lần chuyển khoản — đã tự bỏ, tiền không bị cộng hai lần'`; KHÔNG tạo nghiệp vụ; tăng `t.trungBoDem`; ghi 1 dòng nhật ký (`SM.ops.ghiNhatKy` nếu module đã nạp — sm-ops nạp SAU sm-inbox nên gọi lúc runtime, có fallback tự push cùng shape). Trả `{ ok:true, trungBo:true, taoRa, suKien }` — mobile hiện toast «Đã xử lý — …» đúng, không báo lỗi.
- Chốt chặn xử lý lại (dòng ~157): sự kiện `trung-bo` bấm lần nữa → từ chối thẳng, không rơi vào nhánh cộng tiền.
- Phạm vi chứng nhận: chỉ sự kiện `da-xu-ly` mới算 «đã xử lý» — bản `loi` (vd vượt tồn) được nguồn gửi lại thì XỬ LÝ LẠI được, đúng ngữ nghĩa at-least-once.
- Không đưa `maHoaDon` vào khóa: phản hồi thuế cho cùng hoá đơn có thể đến lần hai sau khi hộ sửa và truyền lại — chặn nó sẽ sai nghiệp vụ.
- **Tác dụng phụ có chủ đích**: kịch bản `tienVe` bấm 2 lần trong ngày sinh cùng `maGiaoDich` (hash theo ngày+đơn) → bản hai giờ bị chặn như một bản trùng thật; `daGiao` bấm 2 lần không còn cộng tiền COD hai lần (trước đây là bug thật).

### Việc 2 — KICH_BAN thêm 4 kịch bản (id đúng INTERFACE mục 4, dòng 404–444)
| id | nguonId | hành vi |
|---|---|---|
| `tien-ve-trung` | sepay | bắn lại ĐÚNG payload (kể cả mã) của giao dịch tiền-về gần nhất trong sổ (`list()` đã sort mới nhất đầu). Chưa có tiền-về nào → fallback bắn kịch bản `tienVe` thường + nhãn đuôi tiêu đề «bấm thêm lần nữa để thấy máy chặn bản trùng». |
| `ket-noi-dut` | shopee* | chọn sàn đang nối chưa đứt (`sanDangNoi` — lọc `D.connectors` nhóm Sàn, ưu tiên Shopee theo thứ tự danh mục) → `datChet()` đặt `t.connections[ma].trangThai='chet'` + `chetTu`; ưu tiên `D.datTrangThaiKetNoi(t,ma,'loi',{lyDo})` nếu W2 đã có, fallback set trực tiếp + nhật ký. Kèm 1 sự kiện `canh-bao` vào hộp thư («…không đẩy đơn 2 ngày — có thể kết nối đứt», ngưỡng 24 giờ [Q-003], «2 ngày» = số mô phỏng vượt ngưỡng). Trạng thái đứt đặt ngay lúc bấm để thẻ deadlines/Trạm của W2 hiện tức thì. |
| `cong-thue-phan-hoi` | cqt | sự kiện «Cổng thuế phản hồi: chấp nhận đăng ký hoá đơn điện tử» → xử lý trong `process()` nhánh `ket-noi-duyet`: `duyetKetNoi(t,'hddt','da_ket_noi',{aiBam:'cổng CQT (mô phỏng)'})`. |
| `zalo-duyet-xong` | zalo | tương tự cho `zalooa`, `aiBam:'Zalo (mô phỏng)'`. |

(*) `nguonId` sự kiện do `dung()` trả (`built.nguonId || k.nguonId`) — sửa nhỏ trong `simulate()` để cảnh báo đứt gắn đúng sàn được chọn.

### Việc 3 — Đơn sàn kèm thuế nộp thay (D-#8, [Q-019])
- Kịch bản `sanTMDT`: payload thêm `thueSanDaNop = Math.round(giá trị đơn × 0.015)` — comment «số mô phỏng ~1,5% giá trị đơn — tỷ lệ thật chờ Q-032».
- Tiêu đề sự kiện + `taoRa.moTa` hiện đúng dòng «thuế sàn đã khấu trừ nộp thay: Xđ (nguồn: payload sàn)».
- `process()` nhánh `don-moi`: chép nguyên `o.thueSanDaNop = p.thueSanDaNop` khi có (W2 `taxEstimate` tổng được từ đây). Ranh giới giữ đúng: chỉ HIỆN số từ payload, không tự khấu trừ/khai thay.

### Việc 4 — NGUON thêm `doTuoi` (đồng bộ C.15, dòng 22–33)
sepay «đẩy tức thì — giây đến phút [Q-006]» · cqt «trả lời sau 15 phút đến 1 ngày làm việc [Q-002]» · shopee Q-036 · tiktok/lazada Q-042 đề xuất · ghn/vtp Q-037 · zalo Q-034 · booking Q-045 · food không có trong C.15 → «chưa đo — chưa có trong bảng độ tươi» (không bịa số Q).

### Việc 5 — Map id cũ qua `D.chuyenId`
`maMoi(id)` đảo map `D.chuyenId` của W2 (id cũ zalo/qr/ghn… → id v4), fallback trả nguyên id khi W2 chưa ghép. Dùng tại: `tenKenh`, `trangThaiKetNoi`, nhánh `ket-noi-duyet`/`canh-bao` trong `process()`, kịch bản `ket-noi-dut`. Có guard `if (!id) return id` (tránh `indexOf('')` khớp nhầm phần tử đầu của map).

## 2. Edit ở đâu (9 Edit trên sm-inbox.js)
1. NGUON — thêm `doTuoi` × 10 nguồn + dòng chú thích (dòng 22–34).
2. Chèn khối helper trước mục XỬ LÝ SỰ KIỆN: `maMoi` · `TEN_NGHE`+`tenKenh` · `trangThaiKetNoi` · `nhatKy` · `duyetKetNoi` · `datChet` · `sanDangNoi` · `khoaDuyNhat` (dòng 71–152).
3. `process()` — guard `trung-bo` + khối dedup tra sổ (dòng 157, 165–183).
4. `process()` nhánh `don-moi` — `o.thueSanDaNop` + dòng moTa thuế nộp thay (dòng 211–216).
5. `process()` — 2 nhánh mới `ket-noi-duyet` + `canh-bao` trước else cuối (dòng 278–288).
6. Kịch bản `sanTMDT` — `thueSanDaNop` + tiêu đề (dòng 310–322).
7. KICH_BAN — 4 kịch bản mới trước `];` (dòng 409–444).
8. `simulate()` — `ALIAS_KICH_BAN` + nhận `built.nguonId` (dòng 459–477).
9. Vá sau khi đọc lại: guard `maMoi('')` + bảng `TEN_NGHE` cho `tenKenh` (tránh mã kỹ thuật lọt chuỗi hiển thị khi W2 chưa merge).

Không đổi tên hàm/sự kiện hiện có: `NGUON`, `KICH_BAN` cũ, `list/unread/get/push/process/scenarios/simulate/clear/nguonCua`, các `loaiSuKien` cũ — giữ nguyên hết (mobile đang nghe). Chỉ THÊM trường, THÊM nhánh, THÊM kịch bản.

## 3. Tự soát cú pháp bằng cách nào
- `node --check` bị sandbox job nền từ chối quyền (đã thử 3 dạng lệnh) → theo fallback INTERFACE mục 9: **đọc lại TOÀN BỘ file sau sửa** (481 dòng), soát từng khối mới về ngoặc/dấu phẩy/cân bằng `if/else`, đối chiếu shape các hàm phụ thuộc đọc từ nguồn thật: `SM.ops.ghiNhatKy` (sm-ops.js:18–29), `D.connectors` (sm-domain.js:861–875), cách mobile render `tieuDe/taoRa.moTa/ghiChu/trangThai` và gọi `simulate/process` (mobile.html:1042–1157).
- Grep bằng chứng (dán kết quả thật):
  - `trung-bo` trong process: dòng 157 (`if (e.trangThai === 'trung-bo') return …`), 171 (`e.trangThai = 'trung-bo';`), 173 (`taoRa loai:'trung-bo'`), 176–181 (`trungBoDem`, nhatKy, return `trungBo:true`).
  - 4 id mới: `id: 'tien-ve-trung'` (409) · `id: 'ket-noi-dut'` (425) · `id: 'cong-thue-phan-hoi'` (437) · `id: 'zalo-duyet-xong'` (444).
  - `thueSanDaNop`: 212, 215, 320 · `doTuoi`: 24–33 · CJK (khoảng 　–～ đặc tả đầy đủ): **0 kết quả**.

## 4. Chưa làm được / cần các agent khác biết (nói thật)
1. **Không verify runtime trong trình duyệt được** từ job nền này (không mở Chrome) — mọi kết luận trên là soát-tĩnh + đối chiếu contract. Nghiệm thu click-thật (bấm `tien-ve-trung` 2 lần, thấy tiền cộng 1 lần) thuộc lượt verify chung.
2. **Lệch INTERFACE — id kịch bản đơn sàn**: INTERFACE mục 4 gọi `don-san-moi`, nhưng id đang sống trong file (mobile đang nghe) là `sanTMDT`. Tôi KHÔNG đổi tên theo ràng buộc «không đổi tên sự kiện hiện có»; đã thêm `ALIAS_KICH_BAN = { 'don-san-moi': 'sanTMDT' }` trong `simulate()` nên cả hai tên đều chạy được. W6/W7 nếu tham chiếu `don-san-moi` thì hoạt động ngay.
3. **Hiển thị tag «trùng» trên mobile là việc W6**: nhánh render hiện tại (mobile.html:1053) đánh mọi trạng thái ngoài `moi/da-xu-ly` là «lỗi» — bản `trung-bo` sẽ mang tag «lỗi» cho tới khi W6 thêm nhãn riêng theo INTERFACE mục 4. Dữ liệu tôi trả đã tự hiển thị được phần chữ: `taoRa.moTa` hiện ở dòng danh sách (mobile.html:1058–1059) và toast sau xử lý (mobile.html:1153) — demo không chết chờ W6.
4. **Cho W2 biết**: `datChet` ghi kép hai trục — `t.connections[ma].trangThai='chet'` + `chetTu` (trục dữ liệu, nguồn cho thẻ `ketnoi-dut` của `deadlines()` và tag Trạm) và `D.datTrangThaiKetNoi(t,ma,'loi',{lyDo})` (trục onboarding, nếu hàm có). `duyetKetNoi` chỉ đi qua `D.datTrangThaiKetNoi(…,'da_ket_noi',{aiBam})`, fallback tự ghi `t.onboarding.ketNoi[ma]` đúng shape INTERFACE mục 2.
5. **PLAN E nói «sửa `seq()` :187 cho kịch bản này»** — tôi không sửa `seq()` (hàm dùng chung, không có neo an toàn cho từng kịch bản) mà giải quyết tận gốc: kịch bản trùng **tái sử dụng nguyên payload cũ** nên không bao giờ sinh mã mới. Kết quả nghiệm thu D-#3 vẫn đạt: bấm 2 lần cùng một id, tiền cộng 1 lần.
6. `ket-noi-dut` chỉ hiện khi hộ có sàn đang nối (đúng D-#5 «connector sàn đang nối»); seed chưa nối sàn nào thì nút ẩn — W4 seed CD1 `dang_noi` sẽ có.

## 5. Kết luận
Đủ 5 việc của đề; 9 Edit có neo, không đụng file ngoài quyền sở hữu; không Write đè file hiện có; tiếng Việt có dấu toàn bộ; không ký tự CJK; không viết cứng kết quả — mọi số hiển thị tính từ kho (`SM.CLOCK`, payload, sổ sự kiện) hoặc có nhãn nguồn/mô phỏng.
