# W2 — BÁO CÁO THI CÔNG `js/sm-domain.js` (nghiệp vụ lõi)

Sở hữu: `solomatrix-v3-gialai/js/sm-domain.js` (Edit từng chỗ, KHÔNG Write đè) + file báo cáo này.
Đối chiếu: INTERFACE-V4 mục 0/1/2/9 · PLAN-V4 C.0/C.3/C.15, B.7/B.14, E (dòng sm-domain.js) · CHOT P1–P13.

## 1. Đã làm gì — 7/7 việc, 11 Edit

| # | Việc | Chỗ sửa (dòng SAU khi sửa) |
|---|---|---|
| 1 | `congNgay(iso, n)` · `ngayGiua(a, b)` · `mocVuotNguong(t, ky)` — đặt cạnh helpers thuế, sau `periodRange`. `mocVuotNguong` đọc `t.vuotLuc` (ngày cuối kỳ tính thuế có lũy kế vượt), `han = congNgay(luc, 30)` ngày LỊCH [Q-001], `conLai` có thể âm (âm = «Đã quá hạn N ngày — cần cán bộ»); trả thêm `ky` + `nhan:'giả định kỳ quý — chờ Q-023'` khi `ky='quy'` (C.3 yêu cầu nhãn hiển thị đi kèm — giao diện đọc từ kết quả hàm, không viết cứng) | :75–101 |
| 2 | CONNECTORS viết lại thành 12 id v4 đúng cột «Hiển thị cho hộ» của C.0; `D.chuyenId` nguyên văn INTERFACE mục 1; bảng ngược `CU_SANG_MOI` + hàm nội bộ `veIdMoi(id)`; mỗi connector có `doTuoi:{congBo, coChe, pollAnToan, nguon}` đúng bảng C.15 — dòng THIẾU BẰNG CHỨNG ghi `congBo:'chưa đo — radar đang hỏi Q-0xx'` (chuỗi bắt đầu bằng «chưa đo» để W1 `bangDoTuoi` nhận diện nhãn). Trường `batBuoc` BỎ hẳn khỏi bảng (nhánh dùng nó đã xoá — thấy mục 3); giữ `nhom/moTa/nganh/chuaCo` | :891–945 |
| 3 | `connectors(t)`: XOÁ nhánh auto-noi (`noi` mặc định **false**); nguồn `noi` = `t.connections[id].noi` HOẶC `onboarding.ketNoi[id].trangThai==='da_ket_noi'` (máy trạng thái B.2 — seed W4 ghi đường này); thêm `trangThai` ('ok'\|'chua-noi'\|'chet' — ưu tiên `t.connections[id].trangThai` nếu seed/kịch bản W3 ghi, kể cả khi `noi` false); `lanDongBoCuoi` = mốc GIỜ từ seed `t.connections[id].dongBoCuoi` (trường cũ `dongBoCuoi: SM.CLOCK.today` đã xoá — không còn tự sinh từ CLOCK); `donVe` đếm `veIdMoi(o.channel) === c.id` (đơn kênh `qr` về `bank`, `ghn/ghtk/vtp` về `shipper`…); dòng seed còn id cũ được mượn về connector v4 tương ứng (migrate C.0); `tuNgay` lấy từ `st.tuNgay` hoặc `kn.batDauLuc` (seed W4 dùng `batDauLuc`) | :947–973 |
| 4 | XOÁ `toggleConnector`; thêm `D.datTrangThaiKetNoi(t, ma, trangThai, meta)` — 7 mức B.2, `meta` ghi thẳng vào record, tự dịch `ma` qua `veIdMoi` (gọi nhầm id cũ vẫn vào đúng khoá v4), trả giá trị sai bị chặn `{ok:false}`; ghi `t.onboarding.ketNoi[ma]` + 1 dòng nhật ký qua `SM.ops.ghiNhatKy` (chưa nạp thì tự push cùng shape: `id/luc/ngay/ai/viec/doiTuong/truoc/sau/lyDo`) + `SM.save()` | :975–1003 |
| 5 | `deadlines(t)` thêm thẻ `nguong-30n` (khi `mocVuotNguong(t)!==null`; chữ «Còn N ngày đăng ký hoá đơn điện tử — hết ngày D» / «Đã quá hạn N ngày — cần cán bộ»; `dichDen:'thue'`) + thẻ `ketnoi-dut` (khi có connector `trangThai==='chet'`; chữ «Kênh {tên} không gửi dữ liệu {n} ngày — có thể kết nối đứt», n tính từ `lanDongBoCuoi`, nhiều kênh nối thêm «(và k kênh khác)»; `dichDen:'ketnoi'`). Cả 2 thẻ chèn SAU khối gán `DICH` để `dichDen` đặc biệt không bị ghi đè; thẻ `nguong-mtt` giữ nguyên cho cả `sapVuot` | :296–320 |
| 6 | `taxEstimate(t)` thêm `sanDaNopThay` = tổng `o.thueSanDaNop||0` đơn kênh sàn (`shopee/tiktok/lazada` qua `veIdMoi`) trong kỳ, state paid/done — có ở CẢ nhánh DN và HKD; không đổi cách tính trường cũ | :126–131, :158, :175 |
| 7 | `connectorSummary(t)` tách 2 lớp: mỗi nhóm gắn `lop:'chuong-trinh'` (ngưỡng `toiThieu` cũ giữ làm lớp CHƯƠNG TRÌNH); khi đã vượt 1 tỷ (`mocVuotNguong(t)!==null`) thêm dòng đầu `lop:'luat'` = bộ `hddt+cts+etax` [Q-001]. **Trả về vẫn LÀ MẢNG** (mobile.html:830 `.filter`, web.html:342 `.forEach` chạy nguyên) | :1005–1041 |
| — | Export `SM.dom`: thêm `chuyenId, datTrangThaiKetNoi, congNgay, ngayGiua, mocVuotNguong`; bỏ `toggleConnector` | :1043–1048 |

## 2. Quyết định thiết kế cần W6/W7/Claude biết

1. **`toiThieu` nhóm gộp đổi 3→1 và 2→1** (`Vận chuyển`, `Nền tảng đặt phòng, đặt tour`): C.0 gộp 3 hãng vận chuyển vào MỘT connector `shipper` («chọn hãng bên trong») và cả nhóm đặt trước vào `booking` — giữ ngưỡng 3/2 với 1 connector đại diện thì nhóm KHÔNG BAO GIỜ «đạt». Ngưỡng «3 sàn» giữ 3 (còn đúng 3 gian hàng riêng). Nhóm «App giao đồ ăn» của v3 hết dòng riêng (food/grab không còn id — C.0 cho food «tham chiếu nhóm booking») → không xuất hiện trong summary. Ghi comment tại :1015–1017.
2. **Dòng lớp LUẬT chỉ sinh khi đã vượt 1 tỷ** (đúng B.7 — nhóm BẮT BUỘC chỉ chứa chế độ đầy đủ khi hộ >1 tỷ; chưa vượt = «canh ngưỡng», không phải connector). Renderer cũ (web.html:342) hiển thị dòng này ổn: `2/3` + nhãn nhóm «Theo LUẬT — đã vượt 1 tỷ [Q-001]».
3. **Trường `batBuoc` biến mất khỏi `D.connectors()`** → tag «bắt buộc» ở web.html:357 và mobile.html:909 (mã chết) không còn nguồn. Việc thay bằng render 2 lớp là của W7/W6 nếu cần.
4. `mocVuotNguong` trả thêm `nhan` + `ky` (ngoài `{luc, han, conLai}` nguyên văn INTERFACE) — chỉ THÊM trường, mọi consumer đọc `luc/han/conLai` (W5 `han30` đọc `mv.luc`) không đổi.

## 3. Chỗ gọi `toggleConnector` còn lại — LIỆT KÊ cho W6/W7 (tôi không sửa file người khác)

| File : dòng | Ngữ cảnh | Trạng thái |
|---|---|---|
| `mobile.html:922` | trong `bindKetnoi` — hàm **mã chết**: VIEWS dòng 2465 đã đổi `ketnoi:[ON.viewTram,ON.bindTram]`, grep toàn file không còn tham chiếu `bindKetnoi`/`viewKetnoi` ngoài 2 chỗ định nghĩa (:896, :920) | Không có đường gọi sống → xoá hàm khỏi sm-domain an toàn về runtime. W6/Claude verify nên dọn xác chết `viewKetnoi`+`bindKetnoi` ở lượt verify (đề W6 mục 7 đã báo trước) |
| `web.html` | W7 đã tự dọn — grep 0 match (báo cáo W7 mục «Nút Bật/Ngắt») | sạch |

## 4. Grep chứng minh sạch (trên `js/sm-domain.js`, chạy sau khi sửa)

```
$ grep -n "batBuoc\|toggleConnector\|dongBoCuoi:" js/sm-domain.js
→ No matches found
$ grep -nP "[\x{4e00}-\x{9fff}\x{3040}-\x{30ff}\x{ac00}-\x{d7af}]" js/sm-domain.js
→ 0 occurrences (không ký tự Trung/Nhật/Hàn)
```

## 5. Tự soát cú pháp bằng cách nào (nói thật)

- `node --check` và `node -e` (stub SM để test runtime) **đều bị sandbox từ chối quyền** — không có bằng chứng parse máy. Không tìm đường lách.
- Thay bằng: (a) đọc lại NGUYÊN VĂN từng vùng sửa bằng Read (vùng connector :891–1003, connectorSummary+export :1003–1055, 3 hàm ngày :75–101, deadlines :290–320) — soát cặp ngoặc `{}`, backtick lồng `${}`, dấu phẩy trailing; (b) từng Edit neo nguyên văn chuỗi cũ nên phần code quanh chỗ sửa không thể xê dịch; (c) grep ngược các định danh mới (`SAN_IDS`, `veIdMoi`, `moc30`, `sanDaNopThay`) xác nhận khai báo–sử dụng khớp nhau; (d) kiểm tra TDZ: `SAN_IDS`/`veIdMoi` định nghĩa sau `taxEstimate` nhưng cùng IIFE và chỉ được gọi runtime (sau khi IIFE khởi tạo xong) — an toàn.
- Một nghi vấn đã kiểm chứng: Grep tool hiển thị comment `//` thành `/` trong output có context — Read nguyên văn xác nhận file đúng `//` (artifact hiển thị, không phải lỗi file).

## 6. Chưa làm được / rủi ro (nói thật)

1. **Không chạy được test runtime** (node bị chặn quyền): logic `mocVuotNguong`, `connectors` migrate id cũ, `datTrangThaiKetNoi`, `sanDaNopThay` chỉ được soát tay — đề nghị lượt Claude verify chạy lại bằng node với stub SM hoặc mở app thật với seed CD1 (kỳ vọng: Trạm hiện bank `da_ket_noi`, etax `chua-noi`; thẻ «Còn 71 ngày đăng ký hoá đơn điện tử — hết ngày 2026-10-30»; tenant chưa vượt không có dòng lớp LUẬT).
2. `deadlines` thẻ `ketnoi-dut`: nếu connector `chet` mà `lanDongBoCuoi` null (seed chưa ghi mốc) thì chữ bỏ cụm «{n} ngày» — không bịa số.
3. Nhóm «App giao đồ ăn» biến mất khỏi `connectorSummary` (hệ quả gộp id C.0 — mục 2.1). index.html của W7 có bảng tĩnh riêng với nhóm này (index.html:319) — hai nguồn có thể lệch nhau, W7/Claude verify đối chiếu.
4. `moTa` connector là lời nói thường + nhãn nguồn [Q-00x] đúng luật chung; từ «webhook/polling» chỉ nằm trong `doTuoi.coChe` (dữ liệu bảng C.15 cho màn Độ tươi — nơi W1/W7 tự định dạng, kèm khối «cài đặt nâng cao» của họ).

BUILD-AGENT-DONE W2 11
