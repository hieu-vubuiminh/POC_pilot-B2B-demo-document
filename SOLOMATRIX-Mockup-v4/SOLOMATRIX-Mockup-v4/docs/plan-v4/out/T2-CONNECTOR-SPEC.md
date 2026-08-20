# T2 — ĐẶC TẢ «TRẠM KẾT NỐI»: 12 CONNECTOR CHO MOCKUP V4

- Ngày: 2026-08-20 · Vai: kỹ sư tích hợp (đề T1 lo UI, bản này lo sự thật kỹ thuật/pháp lý/chi phí từng kết nối).
- Sản phẩm nền cho: màn «trạm kết nối» (hiện là `viewKetnoi`, mobile.html:866), wizard onboarding lần-đầu (T1), seed mockup (T4 thi công).
- Nguồn: findings radar Q-001·Q-002·Q-003·Q-005·Q-006·Q-007·Q-019 · REQUIREMENTS.md (R-A1, R-A3) · ANTI-SCOPE.md (N-01…N-09) · code v3 `js/sm-inbox.js` · `js/sm-domain.js` (mảng CONNECTORS dòng 834–858) · `js/sm-seed-gialai.js`.

## 0. Quy ước đọc

**Nhãn nguồn**: `[Q-00x]` = finding radar · `[R-xx]` = REQUIREMENTS · `[N-xx]` = ANTI-SCOPE · `[seed]` = dữ liệu dựng sẵn trong sm-seed-gialai.js · `tự đề xuất` = không có bằng chứng, chỉ là thiết kế.

**Máy trạng thái onboarding** (khớp máy T1 đang thiết kế, 7 trạng thái):
`chua_hoi` (chưa hỏi chủ hộ có dùng dịch vụ đó không) → `chua_co_tk` (chủ hộ trả lời có nhu cầu nhưng chưa có tài khoản/dịch vụ bên thứ ba) → `dang_dang_ky` (hồ sơ đang điền/gửi dở) → `cho_duyet` (bên thứ ba đang xét) → `da_ket_noi` · lệch: `loi` (đầu nối chết/bị từ chối) · `bo_qua` (chủ hộ nói không dùng, wizard không hỏi lại).

**Ánh xạ id T2 ↔ code v3 hiện có** (sm-domain.js CONNECTORS):
| id T2 | id hiện có trong CONNECTORS | ghi chú |
|---|---|---|
| `bank` | `bank` + `qr` (nhóm Tiền) | gộp: một đầu nối tiền-về |
| `zalooa` | `zalo` | đổi id, tách rõ OA + ZNS |
| `hddt` | `hddt` | mở rộng 2 đường (cổng CQT / NCC) |
| `cts` | `cks` | đổi id cks → cts |
| `etax` | `etax` + `cthue` | gộp 2 hàng thành 1 connector |
| `ketoan` | `ntqg` (đang `chuaCo: true`) | thêm đường MISA AMIS |
| `shopee` `tiktok` `lazada` | giữ nguyên | |
| `shipper` | `ghn` + `ghtk` + `vtp` (+ `lanh` theo ngành) | gộp thành 1 connector, wizard hỏi hãng |
| `pos` | (chưa có — thêm mới) | |
| `booking` | `booking` (nhóm có `agoda`, `travel`) | |

**NGUON trong sm-inbox.js hiện có** (`sepay, zalo, cqt, shopee, tiktok, lazada, food, booking, ghn, vtp`) — mọi mô phỏng dưới đây ưu tiên NỐI VÀO NGUON có sẵn, chỉ thêm nguồn mới (`pos`, `etax`) khi thật sự thiếu.

---

## 1. ĐẶC TẢ 12 CONNECTOR

### 1.1 `bank` — Tiền về (SePay/VietQR)

| Trường | Nội dung |
|---|---|
| **Ai cần** | Cả 3 chân dung (CD1–CD3 đều có `qrPoints` thu QR trong seed). Không điều kiện doanh thu. |
| **Vì sao** | `DEFACTO` — R-A1-05 MUST: đối soát tiền về theo thời gian thực. SePay webhook 12+ ngân hàng, tích hợp self-serve [Q-002]. |
| **Điều kiện tiên quyết** | Chủ hộ có tài khoản ngân hàng của hộ. ⚠️ Dấu hiệu «từ 03/2026 tài khoản NH phải đúng tên hộ KD» CHƯA xác minh — đã có câu radar Q-020 mở sẵn. |
| **Cách đăng ký** | Self-serve: chủ hộ tự mở tài khoản SePay trên web SePay, quét QR xác thực liên kết ngân hàng; OPC CHUẨN BỊ sẵn form hướng dẫn từng bước + ô dán về kết quả. **Người bấm nút cuối: CHỦ HỘ** trên trang SePay (N-06: OPC không thao tác thay). |
| **Lead-time** | «Tích hợp trong 5 phút» — mức phút [Q-002]. Đây là connector nhanh nhất trong 12 [Q-002 suy luận: lộ trình xếp theo độ khó ngược]. |
| **Chi phí** | THIẾU BẰNG CHỨNG — bảng giá SePay (phí webhook/tháng/theo giao dịch) chưa được radar đọc; Q-002 không nêu phí. Đề xuất câu radar Q-040 (mục 4). Mockup tạm hiển thị «chưa có số phí — radar đang hỏi». |
| **Cơ chế dữ liệu** | Webhook push realtime — «bắn ngay khi có giao dịch phát sinh» [Q-006]; at-least-once: retry tối đa 7 lần giãn Fibonacci ~33 phút, quá 5 giờ không gọi lại nữa; endpoint phải trả 200 trong 30 giây (Webhooks) / 8 giây (Bank Hub IPN); **connector phải dedup theo `id`/`transaction_id`** [Q-006]. **Ngân sách độ tươi công bố: giây–phút** [Q-006]. |
| **Khi chết báo gì** | Webhook đứt quá 5 giờ = SePay BỎ GỬI — sự kiện mất thật [Q-006] → phải luôn kèm polling đối soát, chu kỳ an toàn tối thiểu 24 giờ [Q-003]; idempotency store phải có TRƯỚC khi nhận webhook đầu tiên [Q-003]. Báo lỗi ra tiếng cho chủ hộ theo R-A3-05: «Đồng bộ ngân hàng đứt từ X giờ — tiền về có thể chưa cập nhật, bấm đối soát lại». |
| **Mô phỏng trong mockup** | Nguồn `NGUON.sepay` có sẵn (sm-inbox.js:29), kịch bản `tienVe` có sẵn. BỔ SUNG: (a) kịch bản `trungWebhook` — bắn 2 lần cùng `maGiaoDich`, hộp thư đến chỉ ghi 1 dòng + nhãn «đã bỏ bản trùng (dedup theo id)»; (b) kịch bản `sepayChet5h` — tiền về đến trễ kèm nhãn «webhook đứt >5 giờ, lấy bằng đối soát định kỳ»; (c) seed thêm `t.connections.bank.trangThai` + `lanDongBoCuoi` để màn trạm kết nối hiện «cập nhật lần cuối X phút trước». |
| **Trạng thái onboarding đi qua** | `chua_hoi → da_ket_noi` (tức thì, phút); `loi` khi webhook đứt >5 giờ chưa đối soát. |

### 1.2 `zalooa` — Zalo OA + ZNS

| Trường | Nội dung |
|---|---|
| **Ai cần** | Cả 3 chân dung — cả ba đều có kênh `zalo` trong mảng `kenh` [seed]; Q-004: 62% MSME dùng app nhắn tin cho kinh doanh (DAI/Ipsos 2021, n=999). |
| **Vì sao** | `DEFACTO` — R-A1-08 MUST (kênh chạm khách & chạm chủ hộ) [Q-004·Q-005]. Ràng buộc dùng: N-09 cấm coi broadcast là kênh đẩy vận hành. |
| **Điều kiện tiên quyết** | **Giấy phép ĐKKD** (Zalo OA xác thực cần giấy phép ĐKKD) [Q-004] — hộ đã có GPKD trong hồ sơ Chương trình; số điện thoại chủ OA. |
| **Cách đăng ký** | Chủ hộ tự đăng OA trên oa.zalo.me; Ban quản trị Zalo xét duyệt. **Người bấm nút cuối: CHỦ HỘ** (tạo OA + nộp giấy phép trên trang Zalo). OPC chuẩn bị bộ ảnh chụp giấy tờ + tên OA gợi ý theo tên hộ. |
| **Lead-time** | **2–3 ngày làm việc** để BQT duyệt OA [Q-004]. → Đây là connector phải NỘP HỒ SƠ NGAY NGÀY 0 để chạy song song [tự đề xuất, lập luận từ Q-002: xếp theo lead-time ngược]. |
| **Chi phí** | Theo loại tin, chính chủ oa.zalo.me [Q-005]: Tin Tư vấn — 8 tin miễn phí/48 giờ kể từ tương tác cuối, ngoài đó **55đ/tin**; Tin Giao dịch **165đ/tin**; Tin Truyền thông cần người dùng Quan tâm OA, gói Premium trần **04 tin/tháng**. Đơn giá ZNS theo template: chưa mở được bảng giá chính chủ (Q-033 mở sẵn). |
| **Cơ chế dữ liệu** | Webhook tin nhắn KHÁCH GỬI VÀO (NGUON.zalo có sẵn). Chiều ĐẨY RA bị ràng: tin Tư vấn chỉ gửi được trong **cửa sổ tương tác 7 ngày** (đường OpenAPI) [Q-005]. **Ngân sách độ tươi: THIẾU BẰNG CHỨNG** (SLA độ trễ Zalo chưa công bố — Q-034 mở sẵn). |
| **Khi chết báo gì** | (a) Hết cửa sổ 7 ngày: không đẩy được nữa → app phải hiện «khách này im lặng >7 ngày, muốn nhắn phải dùng tin Giao dịch 165đ/tin» [Q-005]; (b) OA bị thu hồi/đình chỉ: báo tiếng «Zalo OA của hộ đang bị khóa — tin nhắn khách không về». Không dùng broadcast làm kênh vận hành (N-09). |
| **Mô phỏng trong mockup** | Nguồn `NGUON.zalo` + kịch bản `khachHoi` có sẵn. BỔ SUNG: (a) kịch bản `zaloVuotCuaSo` — khách cuối tương tác 8 ngày trước, trợ lý soạn xong câu trả lời, hiện nhãn «ngoài cửa sổ 7 ngày → chuyển tin Giao dịch, phí 165đ» và xin chủ hộ duyệt phí; (b) bảng giả lập «chi phí tin nhắn tháng này» tính = hàm đếm số tin theo loại × đơn giá [Q-005] — không số viết cứng; (c) seed thêm `t.zaloOa = {trangThai:'cho_duyet', nopHoSo:'2026-08-17'}` cho CD nào chưa có OA. |
| **Trạng thái onboarding đi qua** | `chua_hoi → chua_co_tk → dang_dang_ky → cho_duyet (2–3 ngày làm việc) → da_ket_noi`; `loi` khi bị từ chối duyệt OA. |

### 1.3 `hddt` — Hoá đơn điện tử (2 đường + máy tính tiền)

| Trường | Nội dung |
|---|---|
| **Ai cần** | **BẮT BUỘC hộ doanh thu năm >1 tỷ**: HĐĐT có mã CQT hoặc HĐĐT máy tính tiền kết nối dữ liệu CQT; **đăng ký trong 30 ngày** kể từ ngày cuối kỳ tính thuế có doanh thu lũy kế vượt 1 tỷ [Q-001]. Trong seed: CD1 ĐÃ vượt (1.020tr), CD2 ước cả năm 1.243tr → sẽ vượt, CD3 (607tr) không bắt buộc [seed]. |
| **Vì sao** | `LUAT` — R-A1-02 MUST [Q-001: k5 Đ8 NĐ 68/2026 sửa bởi NĐ 141/2026]. ⚠️ Cảnh báo tồn: Q-031 đang xác minh NĐ 123/2020 + NĐ 70/2025 có bị thay bởi NĐ 254/2026 từ 01/7/2026 không. |
| **Điều kiện tiên quyết** | MST (cả 3 CD có trong seed) + chữ ký số (connector `cts`). Đường cổng CQT: đăng ký bằng MST [Q-002]. Đường máy tính tiền: thiết bị/PM máy tính tiền kết nối được CQT (đi qua connector `pos`). |
| **Cách đăng ký** | **OPC-chuẩn-bị-người-bấm-gửi** (N-06). 2 đường cho wizard chọn: (a) **Cổng CQT miễn phí** hoadondientu.gdt.gov.vn — HĐĐT có mã miễn phí; (b) **NCC được CQT công nhận** (ví dụ: Viettel, VNPT, MISA, FPT, SePay… [Q-002]). OPC điền sẵn toàn bộ hồ sơ từ dữ liệu hộ (tên, MST, địa chỉ, người đại diện); **người bấm nút cuối: CHỦ HỘ** trên cổng CQT hoặc trên trang NCC. Mockup phải vẽ rõ 2 bước: «Trợ lý đã điền xong hồ sơ» → «Chờ anh/chị bấm GỬI» — không có nút gửi tự động. |
| **Lead-time** | Cổng CQT: phản hồi **15 phút – 1 ngày làm việc** [Q-002]. NCC trung gian: thời gian phê duyệt hồ sơ chưa đo — Q-021 mở sẵn. |
| **Chi phí** | Đường cổng CQT: **HĐĐT có mã miễn phí** [Q-002]. Đường NCC: phí chưa đo (THIẾU BẰNG CHỨNG — Q-021). Tham chiếu thị trường: KiotViet kèm «HĐĐT KiotViet» miễn phí trong mọi gói [Q-007]. |
| **Cơ chế dữ liệu** | Phát hành: hộ (hoặc máy tính tiền) gửi → NCC/cổng truyền → CQT trả kết quả. Trong mockup: `NGUON.cqt` kênh «trả lời đồng bộ» đã có (sm-inbox.js:32). **Độ tươi: 15 phút–1 ngày làm việc** cho phê duyệt [Q-002]. Không phải luồng liên tục. |
| **Khi chết báo gì** | CQT TỪ CHỐI: báo nguyên văn lý do + việc phải sửa (kịch bản `thueTuChoi` đã có: «MST người mua không tồn tại»). Hết hạn chữ ký số: chặn phát hành + nhắc gia hạn `cts`. |
| **Mô phỏng trong mockup** | `NGUON.cqt` + kịch bản `thueTraLoi`/`thueTuChoi` có sẵn. BỔ SUNG: (a) sự kiện `vuotNguong1Ty` — HÀM TÍNH từ kho: tổng doanh thu 12 tháng trượt vượt 1 tỷ → thẻ cảnh báo «lũy kế đã vượt 1 tỷ — còn X/30 ngày đăng ký HĐĐT» [Q-001], CD1 hiện ngay ở trạng thái đã trễ/đang chạy, CD2 hiện dự báo theo ước cả năm; (b) luồng 2 bước N-06: màn «hồ sơ đã điền xong — chờ chủ hộ bấm gửi trên cổng» rồi mới chuyển `cho_duyet`. |
| **Trạng thái onboarding đi qua** | `chua_hoi → chua_co_tk (hộ chưa có HĐĐT nào) → dang_dang_ky → cho_duyet (15 phút–1 ngày) → da_ket_noi`; `loi` khi CQT từ chối hồ sơ/hoá đơn. CD3 dưới ngưỡng thường dừng ở `chua_hoi` → `bo_qua` trừ khi khách B2B đòi hoá đơn (động cơ ghi trong seed CD3). |

### 1.4 `cts` — Chữ ký số

| Trường | Nội dung |
|---|---|
| **Ai cần** | Hộ >1 tỷ phát hành HĐĐT + kê khai/nộp thuế điện tử; luật liệt kê bắt buộc CTS cho: phát hành HĐĐT · kê khai/nộp thuế điện tử · BHXH điện tử [Q-001: NĐ 12/2015, Luật QLT 2019, k7 Đ10 NĐ 123/2020]. ⚠️ Q-025 đang xác minh lại từ văn bản gốc (nguồn hiện nặng phía bên bán CTS). Thực tế: CD1 cần ngay, CD2 cần khi vượt ngưỡng, CD3 chưa cần. |
| **Vì sao** | `LUAT` — R-A1-03 MUST [Q-001]. Đường kỹ thuật có sẵn: ký số online **100% không cần USB token** (SePay eInvoice) [Q-002]. |
| **Điều kiện tiên quyết** | Thông tin định danh chủ hộ (CCCD — hồ sơ hộ đã có trong Chương trình); hợp đồng với một NCC CTS. Loại CTS nào được chấp nhận cho hộ KD: chờ Q-025. |
| **Cách đăng ký** | OPC chuẩn bị bảng so sánh NCC + form đăng ký; **người bấm nút cuối: CHỦ HỘ** ký hợp đồng với NCC CTS trên trang NCC. Không self-serve qua OPC (N-06). |
| **Lead-time** | Phần mềm ký số online không cần USB token [Q-002] nghĩa là không chờ giao thiết bị vật lý; nhưng lead-time cấp CTS ban đầu (định danh, ký hợp đồng) CHƯA đo — THIẾU BẰNG CHỨNG. Đề xuất câu radar Q-041 (mục 4). |
| **Chi phí** | THIẾU BẰNG CHỨNG (giá CTS rời theo NCC chưa đọc — Q-041). Tham chiếu: KiotViet kèm «Chữ ký số» miễn phí trong mọi gói [Q-007]. |
| **Cơ chế dữ liệu** | Không phải luồng dữ liệu liên tục — CTS chỉ «nói» lúc ký (phát hành HĐĐT, gửi tờ khai). Không webhook, không polling, **không có ngân sách độ tươi**. |
| **Khi chết báo gì** | Token/hợp đồng hết hạn → mọi luồng ký bị chặn. Phải cảnh báo TRƯỚC hạn (đếm ngược từ ngày hết hạn trong seed) bằng lời tiếng: «Chữ ký số hết hạn sau X ngày — không ký được hoá đơn nếu để quá». |
| **Mô phỏng trong mockup** | Không bắn NGUON định kỳ. BỔ SUNG: (a) seed thêm `t.cts = { loai:'cloud-khong-usb', ncc:'…', han:'2027-05-12' }`; (b) kịch bản `ctsHetHan` — chủ hộ bấm phát hành hoá đơn → bị chặn với thông điệp tiếng + nút «xem cách gia hạn»; (c) trong wizard: bước `cts` đứng TRƯỚC bước `hddt`/`etax` vì là tiên quyết của cả hai. |
| **Trạng thái onboarding đi qua** | `chua_hoi → dang_dang_ky → da_ket_noi`; quay lại `loi` khi hết hạn (có ngày cụ thể từ seed). |

### 1.5 `etax` — Kê khai + nộp thuế điện tử

| Trường | Nội dung |
|---|---|
| **Ai cần** | Hộ >1 tỷ: tự tính–tự khai–tự nộp sau khi bỏ thuế khoán 01/01/2026 [Q-001: NQ 198/2025/QH15 k6 Đ10 + NĐ 68/2026 + TT 18/2026] — CD1 ngay, CD2 khi vượt. CD3 (≤1 tỷ): được miễn GTGT/TNCN theo NĐ 141/2026 [Q-001]; nghĩa vụ định kỳ còn lại của nhóm ≤1 tỷ chưa chốt — Q-023 mở sẵn. |
| **Vì sao** | `LUAT` — R-A1-01 MUST [Q-001]. |
| **Điều kiện tiên quyết** | MST + CTS + tài khoản trên cổng thuế điện tử (thuedientu.gdt.gov.vn / eTax Mobile). ⚠️ **KHÔNG có «API thuế» mở cho bên thứ ba tự gọi** [Q-002] — đây là connector duy nhất bắt buộc dạng «chuẩn bị + người bấm». |
| **Cách đăng ký** | **OPC-chuẩn-bị-người-bấm-gửi, mức tối đa của N-06**: OPC tính số, điền tờ khai, xuất PDF/HTML nộp; **người bấm nút cuối: CHỦ HỘ** đăng nhập cổng thuế + bấm gửi. OPC KHÔNG khai thay, nộp thay (N-06). Đọc lại trạng thái «đã nộp chưa»: chưa có kênh chính thức — Q-024 mở sẵn. |
| **Lead-time** | THIẾU BẰNG CHỨNG (thời gian mở tài khoản cổng thuế lần đầu chưa đo — Q-024). |
| **Chi phí** | Cổng nhà nước — nguồn đã đọc không ghi phí nào cho hộ; coi 0đ trong mockup với nhãn «không thấy nguồn ghi phí». (NĐ 20/2026 cấp miễn phí NỀN TẢNG SỐ cho hộ KD [Q-001] — phần nền tảng chắc chắn 0đ.) |
| **Cơ chế dữ liệu** | **Thủ công hai chiều**: OPC xuất tờ khai → chủ hộ gửi trên cổng; trạng thái xác nhận hiện phải tự khai báo trong app (gắn ảnh chụp màn hình biên lai) đến khi Q-024 tìm được kênh đọc. **Ngân sách độ tươi: KHÔNG CÓ** (không luồng tự động) — bảng độ tươi ghi «thủ công». |
| **Khi chết báo gì** | Không có tín hiệu tự chết; rủi ro là HẸN: wizard phải đặt nhắc hạn kê khai theo kỳ (tần suất kỳ kê khai hộ >1 tỷ chưa chốt — Q-023). Nhắc qua kênh đẩy đúng N-09 (tin Tư vấn trong cửa sổ, không broadcast). |
| **Mô phỏng trong mockup** | sm-domain.js đã có `filingSteps` — tái dùng. BỔ SUNG: (a) NGUON mới `etax` (loại «thủ công», kenh: 'người-bấm') để hộp thư đến có chỗ nhận «biên lai chủ hộ vừa gắn» — sự kiện `bienLaiNopThue` do CHỦ HỘ tạo (chọn ảnh) chứ không phải hệ thống tự sinh; (b) luồng 2 bước hiển thị: «Tờ khai đã tính xong, chờ anh/chị xem và bấm gửi trên cổng thuế» → nút «Tôi đã gửi» → trạng thái chuyển; (c) lịch nghĩa vụ tính từ hàm đếm kỳ (Q-023 chốt thì thay số). |
| **Trạng thái onboarding đi qua** | `chua_hoi → chua_co_tk (chưa có tài khoản cổng) → dang_dang_ky → da_ket_noi` (thủ công); CD3 thường `bo_qua` cho tới khi vượt ngưỡng. |

### 1.6 `ketoan` — Sổ sách (PM nhà nước miễn phí / MISA)

| Trường | Nội dung |
|---|---|
| **Ai cần** | Hộ >1 tỷ phải giữ sổ sách theo chế độ kế toán hộ KD (TT 152/2025/TT-BTC; sổ giấy HOẶC điện tử đều hợp lệ) [Q-001] — CD1, rồi CD2. Hộ ≤1 tỷ: không bắt buộc → `bo_qua`/để sau. |
| **Vì sao** | `LUAT` — R-A1-04 MUST [Q-001]. Nhà nước cấp **miễn phí** PM kế toán tích hợp HĐĐT/CTS cho hộ KD từ 15/01/2026 (NĐ 20/2026/NĐ-CP) [Q-001]. **N-01: OPC KHÔNG tự làm PM kế toán — chỉ kết nối/dẫn sang bản miễn phí.** |
| **Điều kiện tiên quyết** | MST. Trạng thái vận hành thật của PM dùng chung nhà nước chưa chốt — Q-009 mở sẵn; mockup v3 đang đánh dấu `ntqg` là `chuaCo: true` («chưa vận hành») theo NĐ 20/2026 — giữ nguyên mô tả đó cho tới khi Q-009 trả lời. |
| **Cách đăng ký** | 2 đường, khác nhau hẳn: (a) **PM dùng chung nhà nước**: OPC chỉ DẪN SANG — nút mở liên kết + hướng dẫn; người bấm cuối: CHỦ HỘ trên nền tảng nhà nước; (b) **MISA AMIS**: Open API có tài liệu công khai nhưng cấp quyền qua **đăng ký + đầu mối nhân viên kinh doanh** (app_id/access_code) — lead-time thương mại, không self-serve [Q-002]; bên đàm phán hợp đồng là QNSC (kỹ thuật), người dùng cuối vẫn là chủ hộ cấp quyền dữ liệu. |
| **Lead-time** | (a) chưa đo — Q-009; (b) thương mại, không công bố [Q-002]. |
| **Chi phí** | PM nhà nước: **0đ** [Q-001]. MISA cho hộ KD: «miễn phí trọn đời cho ~2 triệu hộ» [N-01 — ghi trong ANTI-SCOPE]. MISA AMIS cho DN (nếu hộ lên DN): giá chưa đo — THIẾU BẰNG CHỨNG. |
| **Cơ chế dữ liệu** | Chiều ra chủ yếu: OPC xuất bộ số liệu có cấu trúc (đơn/hoá đơn/thu chi theo kỳ) để NHẬP VÀO sổ — chiều tự động đọc ngược lại phụ thuộc Q-009 (API nền tảng nhà nước) và đàm phán MISA. **Độ tươi: THIẾU BẰNG CHỨNG** — Q-037 (phần KiotViet/PM) mở sẵn. |
| **Khi chết báo gì** | Xuất file lỗi/lệch kỳ → báo «Bộ số liệu tháng X chưa xuất — sổ bên kế toán sẽ thiếu». Không có webhook để chết; rủi ro là QUÊN, không phải đứt. |
| **Mô phỏng trong mockup** | BỔ SUNG: (a) nút «Xuất bộ số liệu cho phần mềm kế toán» trong màn kế toán/kết ca — sinh JSON/CSV từ hàm tính trên kho (đơn, hoá đơn, khoản chi, công nợ theo kỳ), KHÔNG số viết cứng; (b) hàng `ketoan` trong trạm kết nối có 2 lựa chọn con (nhà nước / MISA) với trạng thái riêng; (c) giữ nhãn «chờ vận hành» cho PM nhà nước đúng như CONNECTORS hiện tại; (d) NGUON thêm `ketoan` nhận sự kiện xác nhận «đã nhập sổ kỳ X» (chủ hộ hoặc kế toán bấm). |
| **Trạng thái onboarding đi qua** | `chua_hoi → bo_qua` (hộ ≤1 tỷ) HOẶC `chua_hoi → dang_dang_ky → cho_duyet (MISA: chờ NVKD) → da_ket_noi`. |

### 1.7 `shopee` — Sàn TMĐT Shopee

| Trường | Nội dung |
|---|---|
| **Ai cần** | CD1 và CD3 (cả hai có `shopee` trong `kenh` [seed]). CD2 không bán sàn → `bo_qua`. |
| **Vì sao** | `DEFACTO` — R-A1-06 MUST: đơn hàng + phần thuế sàn khấu trừ nộp thay (NĐ 117/2025/NĐ-CP, hiệu lực 01/07/2025, xác minh KHÔNG hết hiệu lực) [Q-001·Q-019]. |
| **Điều kiện tiên quyết** | Shop Shopee đang chạy + **tài khoản open.shopee.com** + tạo app + **publish app thành công** + **shop ủy quyền** [Q-002]. ⚠️ Mốc «27/05/2026 hạn chuyển kết nối hợp lệ» mới từ blog bên thứ ba — Q-026 đang kiểm chứng chính chủ. |
| **Cách đăng ký** | Ba lớp ai-làm: (1) QNSC (kỹ thuật) tự tạo + publish app trên open.shopee.com; (2) mỗi SHOP ủy quyền riêng — **người bấm nút cuối: CHỦ HỘ** bấm Authorize trong App List [Q-002]; (3) OPC lưu token thay shop. Vòng đời: access_token 4 giờ, refresh_token 1 tháng [Q-002] — wizard phải chuẩn bị luồng «cấp quyền lại» ngay từ ngày đầu. |
| **Lead-time** | Ngày–tuần, tuỳ duyệt publish app [Q-002]. → Nộp hồ sơ app NGAY NGÀY 0 của onboarding, song song với mọi việc khác. |
| **Chi phí** | THIẾU BẰNG CHỨNG — phí API Shopee chưa đọc. (Thuế sàn khấu trừ nộp thay KHÔNG phải phí connector — đó là thuế của hộ, sàn nộp thay [Q-019 Đ11 k4].) |
| **Cơ chế dữ liệu** | Webhook đơn mới + polling đối soát (chu kỳ an toàn ≥24h [Q-003]). **Độ tươi đơn sàn: THIẾU BẰNG CHỨNG** — Q-036 mở sẵn (trang open.shopee.com render rỗng qua webReader, cần đường đọc khác). |
| **Khi chết báo gì** | (a) Token hết hạn 4 giờ mà refresh thất bại → đơn ngừng về: báo tiếng «Kết nối Shopee đứt từ X giờ — đơn trên sàn có thể chưa về, bấm cấp quyền lại»; (b) thiếu hàng khi đơn về — đã có logic từ chối nhận đơn trong `process()` (sm-inbox.js:85–94), giữ nguyên và báo rõ «không nhận đơn vì thiếu hàng — xử lý trên sàn». |
| **Mô phỏng trong mockup** | `NGUON.shopee` + kịch bản `sanTMDT`/`sanQuaTon` có sẵn. BỔ SUNG: (a) **trường `thueSanKtru` trong payload đơn sàn** — hiện THIẾU (Q-032 mở sẵn): mockup thêm được ngay bằng hàm tính mô phỏng, kèm nhãn «số mô phỏng — chờ Q-032 có field thật»; nhờ vậy trợ lý nói đúng «phần thuế này sàn đã nộp thay, không khai lại» [Q-019 Đ11 k4]; (b) kịch bản `tokenChet` — đơn về trễ 6 giờ kèm nhãn «token hết hạn, đã lấy lại, đang kéo bù»; (c) seed thêm `t.connections.shopee = { trangThai, lanDongBoCuoi }` cho màn trạm kết nối. |
| **Trạng thái onboarding đi qua** | `chua_hoi → chua_co_tk (chưa có shop) → dang_dang_ky (app publish) → cho_duyet → da_ket_noi`; `loi` khi token hết hạn/bị gỡ ủy quyền. **Đặc thù**: bước `cho_duyet` có 2 người chờ khác nhau (Shopee duyệt app — việc của QNSC; shop ủy quyền — việc của chủ hộ). |

### 1.8 `tiktok` — TikTok Shop

| Trường | Nội dung |
|---|---|
| **Ai cần** | CD1 và CD3 (cả hai có `tiktok` trong `kenh` [seed]). CD2 `bo_qua`. |
| **Vì sao** | `DEFACTO` — R-A1-06 MUST (cơ sở pháp lý thuế sàn như Shopee [Q-001·Q-019]); riêng TikTok còn là kênh livestream của CD3 (kênh `live` [seed]). |
| **Điều kiện tiên quyết** | Shop TikTok Shop đang chạy. Cụ thể điều kiện API: **THIẾU BẰNG CHỨNG** — Q-002 ghi rõ «TikTok Shop/Lazada Open Platform chưa soi». |
| **Cách đăng ký** | Theo khuôn Shopee (app + shop ủy quyền) — `tự đề xuất` theo mô hình chung của sàn [Q-002]; **người bấm nút cuối: CHỦ HỘ** bấm ủy quyền shop. CẦN radar xác nhận trước khi thi công thật (đề xuất Q-042). |
| **Lead-time** | THIẾU BẰNG CHỨNG (chưa soi TikTok Open Platform) — đề xuất câu radar Q-042 (mục 4). |
| **Chi phí** | THIẾU BẰNG CHỨNG. (Thuế sàn nộp thay áp như Shopee [Q-019].) |
| **Cơ chế dữ liệu** | Webhook đơn + polling đối soát ≥24h [Q-003 áp chung]. **Độ tươi: THIẾU BẰNG CHỨNG** → Q-036 (đơn sàn). |
| **Khi chết báo gì** | Khuôn Shopee: token/ủy quyền đứt → báo tiếng + nút cấp lại [tự đề xuất từ Q-003]. |
| **Mô phỏng trong mockup** | `NGUON.tiktok` có sẵn; kịch bản `sanQuaTon` đang gắn nguonId `tiktok` — giữ. BỔ SUNG như Shopee: trường `thueSanKtru` (mô phỏng, nhãn Q-032) + kịch bản token. Riêng CD3 thêm kịch bản `donLive` — đơn dồn về sau buổi livestream (kênh `live` đã có trong seed, đơn DH-2608-301 có `synced:false` — dựng payload bắn 3 đơn liên tiếp trong 10 phút để demo dồn đơn). |
| **Trạng thái onboarding đi qua** | Như `shopee` (`chua_hoi → chua_co_tk → dang_dang_ky → cho_duyet → da_ket_noi`; `loi` token). |

### 1.9 `lazada` — Lazada

| Trường | Nội dung |
|---|---|
| **Ai cần** | Chỉ CD1 (duy nhất có `lazada` trong `kenh` [seed]). CD2, CD3 `bo_qua`. |
| **Vì sao** | `DEFACTO` — R-A1-06 MUST áp cho mọi sàn TMĐT [Q-001·Q-019]. |
| **Điều kiện tiên quyết** | Shop Lazada đang chạy. Điều kiện API: **THIẾU BẰNG CHỨNG** (Q-002 chưa soi). |
| **Cách đăng ký** | Khuôn Shopee, `tự đề xuất`; người bấm cuối: chủ hộ ủy quyền shop. Chờ câu radar Q-042. |
| **Lead-time** | THIẾU BẰNG CHỨNG → Q-042. |
| **Chi phí** | THIẾU BẰNG CHỨNG. (Thuế sàn nộp thay áp như Shopee [Q-019].) |
| **Cơ chế dữ liệu** | Webhook + polling ≥24h [Q-003 áp chung]. Độ tươi: THIẾU → Q-036. |
| **Khi chết báo gì** | Khuôn Shopee: báo tiếng + cấp lại ủy quyền. |
| **Mô phỏng trong mockup** | `NGUON.lazada` có sẵn, chưa có kịch bản riêng — BỔ SUNG kịch bản `donLazada` khuôn `sanTMDT` với tiền tố mã đơn `LZD-` + trường `thueSanKtru` mô phỏng. |
| **Trạng thái onboarding đi qua** | Như `shopee`. Với CD2/CD3 wizard không hỏi (`bo_qua` ngay từ đầu theo chân dung). |

### 1.10 `shipper` — Vận chuyển/COD (GHN, GHTK, VTP, lạnh theo ngành)

| Trường | Nội dung |
|---|---|
| **Ai cần** | CD1, CD3 (bán online giao xa, có vận đơn trong luồng). CD2: khách tại chỗ — `ĐỂ SAU`/`KHÔNG`; riêng hàng đồ ăn CD2 đi qua app giao đồ ăn (`food`) không phải hãng vận chuyển kiểu giao hàng bưu kiện. |
| **Vì sao** | `DEFACTO` — R-A1-07 SHOULD (vòng đời đơn + tiền COD). Nguồn hiện tại: seed + NGUON đã dựng; «chưa có bằng chứng mới» [REQUIREMENTS R-A1-07]. |
| **Điều kiện tiên quyết** | Hợp đồng/đăng ký với hãng (GHN/GHTK/VTP): cụ thể điều kiện từng hãng **THIẾU BẰNG CHỨNG** — đề xuất câu radar Q-043 (mục 4). Hàng lạnh (`lanh`, ngành Đồ ăn của CD1): chuẩn bảo quản lạnh trong seed đã có (`baoQuan:'lanh'`). |
| **Cách đăng ký** | Chủ hộ thường ĐÃ có tài khoản hãng khi bán online — wizard chỉ HỎI «đang dùng hãng nào?» rồi xin cấp API key/theo gói dịch vụ của hãng; người bấm cuối: chủ hộ trên portal hãng. `tự đề xuất`. |
| **Lead-time** | THIẾU BẰNG CHỨNG → Q-043. |
| **Chi phí** | Cước vận chuyển là chi phí hộ trả hãng theo bảng cước từng hãng — **THIẾU BẰNG CHỨNG** bảng cước; mockup dùng khoản chi `van-chuyen` có sẵn trong seed để hiển thị, không bịa đơn giá. **N-07: OPC không giữ hộ tiền COD — tiền thu hộ về thẳng tài khoản NGÂN HÀNG của hộ** (trong mockup: payment «Tiền thu hộ» vào `t.payments` như sm-inbox.js:146–148 đã làm — đúng ranh giới, giữ nguyên). |
| **Cơ chế dữ liệu** | Webhook trạng thái vận đơn (mã vận đơn, đã giao, tiền thu hộ) — `NGUON.ghn/vtp` + sự kiện `van-don` đã có. **Độ tươi vận đơn: THIẾU BẰNG CHỨNG** → Q-037 mở sẵn. |
| **Khi chết báo gì** | Đơn giao 48 giờ không có cập nhật trạng thái → cảnh báo tiếng «vận đơn X im 2 ngày — gọi hãng hay chờ?» (R-A3-05 áp cho loại này vì webhook hãng cũng best-effort [Q-003]). |
| **Mô phỏng trong mockup** | `NGUON.ghn`/`vtp` + kịch bản `daGiao` có sẵn. BỔ SUNG: (a) kịch bản `vandonThatLac` — vận đơn 2 ngày không cập nhật, hộp thư đến hiện thẻ cảnh báo; (b) gộp UI: trạm kết nối hiển thị MỘT connector `shipper` với chip chọn hãng đã nối (thay 3–4 hàng rời hiện tại); seed thêm `t.connections.shipper = {hangDaNoi:['ghn','vtp']}`. |
| **Trạng thái onboarding đi qua** | `chua_hoi → da_ket_noi` nếu hộ đã dùng hãng (chỉ việc cấp key); `chua_co_tk → dang_dang_ky → da_ket_noi` nếu chưa; `loi` khi webhook im >48h. |

### 1.11 `pos` — Máy tính tiền/PM bán hàng hộ ĐANG dùng (kết nối, không thay)

| Trường | Nội dung |
|---|---|
| **Ai cần** | Hộ đã dùng PM bán hàng tại quầy. Trong seed không hộ nào khai PM sẵn — nhưng CD1 >1 tỷ cần **HĐĐT khởi tạo từ máy tính tiền có kết nối dữ liệu CQT** [Q-001] → đường máy-tính-tiền là lựa chọn tự nhiên cho CD1. Định vị: OPC KẾT NỐI, KHÔNG thay thế POS hộ đang dùng (tự đề xuất — giữ thói quen, đúng tinh thần «nhân sự số dùng công cụ có sẵn»). |
| **Vì sao** | `LUAT` (đường HĐĐT máy tính tiền [Q-001]) + `DEFACTO` (KiotViet có Public API self-serve OAuth2 — ghi nhận trong đối chiếu sản phẩm của Q-007, dẫn De-An dòng 818). Tham chiếu giá để chủ hộ so sánh: KiotViet 270k/330k/490k mỗi tháng +270k/+375k mỗi chi nhánh +150k mỗi kho; **mọi gói kèm HĐĐT + chữ ký số + PM kế toán hộ KD 0đ** [Q-007]. |
| **Điều kiện tiên quyết** | Hộ có tài khoản PM bán hàng (KiotViet hoặc tương đương). Điều kiện cấp quyền API chi tiết cho bên thứ ba: **THIẾU BẰNG CHỨNG** — Q-037 nhắc KiotViet Public API ở góc độ độ tươi; điều kiện/lead-time cấp quyền chưa có câu riêng → đề xuất Q-044 (mục 4). |
| **Cách đăng ký** | Self-serve OAuth2 (theo ghi nhận Q-007 từ De-An): chủ hộ bấm cấp quyền đọc/ghi cho OPC; **người bấm nút cuối: CHỦ HỘ** trên trang PM bán hàng. Cần radar kiểm chứng lại từ tài liệu chính chủ KiotViet (Q-044). |
| **Lead-time** | THIẾU BẰNG CHỨNG → Q-044 (mockup hiển thị nhãn «chưa đo», không ghi số đoán). |
| **Chi phí** | Không phát sinh thêm nếu hộ đã trả PM bán hàng (270k–490k/tháng theo gói KiotViet [Q-007]). OPC không thu thêm ở lớp này (đúng N-01: lớp POS đã gồm đủ tuân thủ 0đ — không đối đầu giá ở đó). |
| **Cơ chế dữ liệu** | Đơn tại quầy + tồn kho hai chiều qua API của PM (polling là đường chính — webhook hiếm trong lớp POS [Q-003: «webhook thường không có → polling feature-parity»]). **Độ tươi: THIẾU BẰNG CHỨNG** → Q-037 (có nhắc KiotViet Public API). |
| **Khi chết báo gì** | Đồng bộ hai chiều lệch → phát hiện bằng đối soát tồn (hàm so sánh tồn kho hai nguồn) → báo «Tồn kho quầy và kho app lệch N mặt hàng từ X giờ — bấm đối soát». |
| **Mô phỏng trong mockup** | BỔ SUNG: (a) NGUON mới `pos` (loại «Máy tính tiền», cơ chế đồng bộ — thực chất polling, endpoint «đồng bộ POS»); (b) kịch bản `donPos` — đơn quầy vào từ POS, `synced:true`, cộng dồn vào doanh thu quầy; (c) kịch bản `posLechTon` — bán tại quầy không đẩy kịp → tồn lệch 1 SKU, hộp thư đến gợi ý đối soát; (d) với CD1: luồng «hoá đơn từ máy tính tiền» — phát hành có mã CQT từ chính đầu nối pos [Q-001], thể hiện trên màn hoá đơn bằng nhãn `fromPos` (trường đã có trong seed hoá đơn CD1: `fromPos: false` — bổ sung sự kiện bắn hoá đơn `fromPos:true`). |
| **Trạng thái onboarding đi qua** | `chua_hoi` (hỏi «anh/chị đã dùng phần mềm bán hàng nào chưa?») → `chua_co_tk` (chưa dùng → đề xuất giữ bán trên app, không bắt mua) → `da_ket_noi` (cấp quyền OAuth); `loi` khi lệch tồn/đứt đồng bộ. |

### 1.12 `booking` — Kênh đặt chỗ/đồ ăn cho CD2

| Trường | Nội dung |
|---|---|
| **Ai cần** | Chỉ CD2 (ngành Dịch vụ du lịch — CONNECTORS đã lọc theo `nganh` [seed]); CD2 có `booking` + `food` trong `kenh`. CD1, CD3: `KHÔNG` (wizard không hỏi). |
| **Vì sao** | `DEFACTO` — CD2 sống nhờ khách đoàn và phòng: 7 lượt đặt trong seed với channel `booking`/`zalo`/`b2b` [seed]; NGUON.booking + logic chống trùng đặt đã có (sm-inbox `dat-cho`). Không yêu cầu R riêng — thuộc nhóm R-A1-07 theo tinh thần «kênh ngoài đẩy việc về». |
| **Điều kiện tiên quyết** | Tài khoản đối tác trên nền tảng đặt phòng. Điều kiện API/webhook cho nhà nghỉ nhỏ bán đơn lẻ: **THIẾU BẰNG CHỨNG** — đề xuất câu radar Q-045 (mục 4). |
| **Cách đăng ký** | Chủ hộ đăng tài khoản đối tác trên nền tảng (đã có sẵn nếu đang bán); cấp quyền kết nối; **người bấm nút cuối: CHỦ HỘ** trên trang đối tác của nền tảng. `tự đề xuất` (khuôn chung OAuth/ủy quyền). |
| **Lead-time** | THIẾU BẰNG CHỨNG → Q-045. |
| **Chi phí** | Hoa hồng nền tảng theo đặt chỗ: **THIẾU BẰNG CHỨNG** bảng giá chính chủ — seed đang đặt `hoaHongSan: 82500` cho đơn 550.000đ (giá trị GIẢ LẬP, không được trình bày như hoa hồng thật); mockup hiển thị kèm nhãn «số mô phỏng». |
| **Cơ chế dữ liệu** | Webhook đặt chỗ (NGUON.booking có sẵn, endpoint `/webhooks/booking/reservations`). **Độ tươi: THIẾU BẰNG CHỨNG** → Q-045/Q-037. |
| **Khi chết báo gì** | Đặt về trùng lịch khi đứt kết nối → hệ thống từ chối giữ chỗ (kịch bản `datTrung` có sẵn) — báo «nền tảng đẩy đặt trùng chuyến đã đầy: liên hệ khách dời khung». |
| **Mô phỏng trong mockup** | `NGUON.booking` + kịch bản `datPhong`/`datTrung` có sẵn. BỔ SUNG: (a) hiển thị dòng «hoa hồng nền tảng (mô phỏng — chờ số thật)» tính từ `hoaHongSan` trong payload; (b) kịch bản `bookingHuy` — khách huỷ phòng 1 ngày trước, lịch mở lại chỗ, đề xuất Zalo mời khách đổi ngày (nối sang connector `zalooa`, đúng cửa sổ 7 ngày). |
| **Trạng thái onboarding đi qua** | `chua_hoi → da_ket_noi` (đã có tài khoản đối tác) hoặc `chua_co_tk → dang_dang_ky → cho_duyet → da_ket_noi`; `loi` khi đặt trùng/đứt webhook. |

---

## 2. MA TRẬN CHÂN DUNG × CONNECTOR

Ô = BẮT BUỘC / NÊN / ĐỂ SAU / KHÔNG. «BẮT BUỘC» ở đây = luật đòi hoặc kênh bán đang chạy thật trong seed; «NÊN» = giá trị rõ nhưng không vội; «ĐỂ SAU» = chờ sự kiện kích hoạt (vượt ngưỡng); «KHÔNG» = chân dung không dính.

| Connector | CD1 Biển Xanh (>1 tỷ) | CD2 Nhơn Lý (780tr → ước 1.243tr) | CD3 Chư Păh (607tr) |
|---|---|---|---|
| `bank` | BẮT BUỘC — thu QR 2 quầy, tiền khách sạn qua CK [seed]; R-A1-05 [Q-002] | BẮT BUỘC — 4 điểm quét QR [seed]; R-A1-05 | BẮT BUỘC — quỹ QR tại kho [seed]; R-A1-05 |
| `zalooa` | BẮT BUỘC — kênh `zalo` đang chạy [seed]; R-A1-08 [Q-004] | BẮT BUỘC — kênh `zalo` [seed]; R-A1-08 | BẮT BUỘC — kênh `zalo` [seed]; R-A1-08 |
| `hddt` | BẮT BUỘC — đã vượt 1 tỷ, vòng 30 ngày đang chạy [Q-001·seed 1.020tr] | NÊN → tự chuyển BẮT BUỘC khi lũy kế vượt 1 tỷ (ước cả năm 1.243tr [seed]) — wizard đặt mốc cảnh báo | ĐỂ SAU — dưới ngưỡng không bắt buộc [Q-001]; nhưng khách B2B đòi hoá đơn (động cơ seed) → vẫn hỏi ở bước «khách doanh nghiệp» |
| `cts` | BẮT BUỘC — tiên quyết `hddt` + `etax` [Q-001] | NÊN — mua trước khi vượt ngưỡng để không đứt khi đến hạn 30 ngày [Q-001] | ĐỂ SAU — theo `hddt` |
| `etax` | BẮT BUỘC — hộ >1 tỷ tự tính–tự khai–tự nộp [Q-001] | NÊN — chuẩn bị trước khi vượt [Q-001] | ĐỂ SAU — ≤1 tỷ miễn GTGT/TNCN [Q-001]; nghĩa vụ còn lại chờ Q-023 |
| `ketoan` | BẮT BUỘC — sổ theo TT 152/2025 khi >1 tỷ [Q-001] | NÊN — cùng mốc vượt ngưỡng [Q-001] | KHÔNG (hiện tại) — không bắt buộc, trả lời wizard «để sau» |
| `shopee` | BẮT BUỘC — kênh `shopee` chạy thật [seed]; R-A1-06 | KHÔNG — không có kênh sàn [seed] | BẮT BUỘC — kênh `shopee` [seed]; R-A1-06 |
| `tiktok` | BẮT BUỘC — kênh `tiktok` [seed] | KHÔNG — không có [seed] | BẮT BUỘC — `tiktok` + `live` [seed] |
| `lazada` | NÊN — có kênh `lazada` [seed], ưu tiên sau 2 sàn lớn hơn | KHÔNG [seed] | KHÔNG — không có `lazada` [seed] |
| `shipper` | BẮT BUỘC — giao toàn quốc, có vận đơn [seed·R-A1-07] | KHÔNG — khách tại chỗ, đồ ăn đi app giao đồ ăn | BẮT BUỘC — giao hàng online [seed·R-A1-07] |
| `pos` | NÊN — đường «HĐĐT máy tính tiền» cho hộ >1 tỷ [Q-001]; chỉ khi hộ muốn giữ quầy POS | NÊN — quán ăn nhiều điểm thu, khi vượt ngưỡng dùng đường máy tính tiền [Q-001] | ĐỂ SAU — chưa vướng ngưỡng, đề xuất dùng bán trên app |
| `booking` | KHÔNG — không phải ngành dịch vụ du lịch [CONNECTORS lọc nganh] | BẮT BUỘC — kênh `booking` + `food` [seed] | KHÔNG [seed] |

### Thứ tự kết nối đề xuất từng chân dung

Nguyên tắc (lập luận từ [Q-002]: xếp theo lead-time NGƯỢC độ khó — cái tự-thực-phục làm ngay trong buổi đầu; cái chờ duyệt nộp hồ sơ NGAY NGÀY 0 để thời gian chờ chạy song song với việc khác):

**CD1 (buổi đầu 60–90 phút + ngày 0):**
1. `bank` — phút [Q-002]: làm đầu tiên để tiền về chạy ngay, cho thấy «dữ liệu tự chảy» ngay trong buổi.
2. `zalooa` + `shopee` + `tiktok` app/ủy quyền — NỘP HỒ SƠ NGAY NGÀY 0 (zalooa chờ duyệt 2–3 ngày làm việc [Q-004]; sàn chờ publish [Q-002]) — trong lúc chờ, hộ vẫn bán như cũ.
3. `cts` → `hddt` (cổng CQT miễn phí, phản hồi 15 phút–1 ngày [Q-002]) — nộp trong buổi vì CD1 ĐÃ vượt ngưỡng, đồng hồ 30 ngày đang chạy [Q-001]; người bấm gửi: chủ hộ (N-06).
4. `etax` + `ketoan` — sau khi có CTS + HĐĐT, trong tuần đầu.
5. `shipper` (hộ đã có tài khoản hãng — chỉ cấp key) · `lazada` · `pos` — tuần sau.

**CD2 (ngày 0):**
1. `bank` — phút.
2. `zalooa` (nộp ngày 0, chờ 2–3 ngày [Q-004]) + `booking` (cấp quyền tài khoản đối tác sẵn có).
3. `cts` — NÊN ký sớm (không chờ vượt ngưỡng) để khi lũy kế vượt 1 tỷ thì 30 ngày đăng ký HĐĐT là ĐỦ dùng, không đứt giữa chừng [Q-001].
4. `hddt` + `etax` + `ketoan` — KÍCH HOẠT TỰ ĐỘNG khi hàm tính lũy kế 12 tháng chạm 1 tỷ (mockup: sự kiện `vuotNguong1Ty`); trước đó wizard chỉ ghi «đã chuẩn bị sẵn».
5. `pos` — khi mở rộng điểm thu.

**CD3 (ngày 0):**
1. `bank` — phút.
2. `zalooa` (nộp ngày 0) + `shopee` + `tiktok` (ủy quyền shop).
3. `shipper` (cấp key hãng sẵn dùng).
4. `hddt` — chỉ khi trả lời wizard «khách doanh nghiệp đòi hoá đơn» (động cơ có trong seed); luật chưa bắt buộc [Q-001·Q-022 mở].
5. `etax`/`ketoan`/`pos` — `bo_qua` mặc định, để sau.

---

## 3. NGÂN SÁCH ĐỘ TƯƠI PER-CONNECTOR (đóng R-A3-02 — đang ❌)

Khuôn theo DIGEST 20/08 đòi: độ tươi công bố (giây/phút) · webhook hay polling · chu kỳ poll an toàn · nguồn. Nguyên tắc chung [Q-003]: webhook là best-effort — «events will be missed. Not might. Will.» → MỌI dòng webhook đều kèm polling đối soát, chu kỳ an toàn tối thiểu **24 giờ**; idempotency store phải dựng trước connector đầu.

| Connector | Độ tươi CÔNG BỐ | Cơ chế | Chu kỳ poll an toàn | Nguồn |
|---|---|---|---|---|
| `bank` (tiền về) | **giây–phút** | webhook push realtime | ≥24h đối soát số dư [Q-003] | [Q-006] — bắn ngay khi có giao dịch; at-least-once, dedup theo `id` |
| `hddt` (phê duyệt hoá đơn/đăng ký) | **15 phút – 1 ngày làm việc** (phản hồi của CQT) | trả lời sau (không luồng liên tục) | không áp | [Q-002] |
| `cts` | không áp (không luồng dữ liệu) | — | — | [Q-002] (chỉ biết có đường ký online không USB) |
| `etax` | **thủ công** (người bấm gửi/nhận biên lai) | thủ công | không áp | [Q-002] — không có API thuế mở; chờ Q-024 |
| `ketoan` | THIẾU BẰNG CHỨNG | tùy nền tảng (chưa chốt đường) | — | Q-009 (PM nhà nước) · Q-037 (PM thương mại) |
| `zalooa` (tin khách về) | THIẾU BẰNG CHỨNG | webhook (chiều ra bị chặn cửa sổ 7 ngày) | — | [Q-005] không công bố SLA; Q-034 mở |
| `shopee` (đơn sàn) | THIẾU BẰNG CHỨNG | webhook + polling | ≥24h [Q-003] | Q-036 mở (trang chính chủ đọc rỗng qua webReader) |
| `tiktok` (đơn sàn) | THIẾU BẰNG CHỨNG | webhook + polling (giả định) | ≥24h [Q-003] | THIẾU — chưa soi; đề xuất Q-042 |
| `lazada` (đơn sàn) | THIẾU BẰNG CHỨNG | webhook + polling (giả định) | ≥24h [Q-003] | THIẾU — chưa soi; đề xuất Q-042 |
| `shipper` (vận đơn) | THIẾU BẰNG CHỨNG | webhook + polling | ≥24h [Q-003] | Q-037 mở |
| `pos` (đơn quầy/tồn) | THIẾU BẰNG CHỨNG | polling là đường chính [Q-003] | theo rate limit từng PM | Q-037 mở (KiotViet) |
| `booking` (đặt chỗ) | THIẾU BẰNG CHỨNG | webhook + polling | ≥24h [Q-003] | THIẾU — đề xuất Q-045 |

**Mô phỏng màn mới**: 1 màn mobile «Độ tươi dữ liệu» (đề xuất T1 đặt trong trạm kết nối) + 1 mục hồ sơ index.html. Mọi dòng THIẾU hiển thị nhãn «chưa đo — radar đang hỏi Q-0xx» thay vì để trống (R-A3-04: biết nói chưa có số). Mỗi dòng kèm «cập nhật lần cuối X phút trước» tính từ `lanDongBoCuoi` trong seed — số từ hàm tính, không viết cứng.

---

## 4. CÂU HỎI ĐỀ XUẤT MỚI CHO RADAR

Đã kiểm BACKLOG.tsv (Q-008–Q-039): các câu dưới KHÔNG trùng câu đang mở. Những chỗ THIẾU đã có câu mở sẵn thì chỉ trỏ: Q-009 (PM nhà nước vận hành chưa) · Q-020 (TK NH đúng tên) · Q-021 (NCC HĐĐT phê duyệt) · Q-022 (HĐĐT hộ ≤1 tỷ bán sàn) · Q-023 (kỳ kê khai hộ >1 tỷ) · Q-024 (đọc trạng thái kê khai) · Q-025 (nghĩa vụ CTS văn bản gốc) · Q-026 (Shopee chính chủ 27/05/2026) · Q-031 (NĐ 254/2026) · Q-032 (field thuế sàn per giao dịch) · Q-033/034/035 (ZNS giá/SLA/duyệt template) · Q-036 (đơn sàn) · Q-037 (tồn kho/vận đơn/tờ khai) · Q-039 (mốc giá KiotViet).

Câu ĐỀ XUẤT MỚI (mã gợi ý tiếp Q-040+, radar quyết):

| # | Trục | Câu hỏi |
|---|---|---|
| Q-040 | A1 | Bảng giá dịch vụ SePay (developer.sepay.vn/docs chính chủ): gói webhook tiền về tính phí thế nào — theo tháng, theo giao dịch hay theo ngân hàng liên kết; ngưỡng miễn phí có không — để đặt «Chi phí» cho connector `bank` vốn đang trống |
| Q-041 | A1 | Vòng đời dịch vụ chữ ký số cho hộ KD trên thị trường (Viettel/VNPT/MISA/FPT/SePay): giá hợp đồng năm đầu + phí gia hạn, thời hạn token, lead-time cấp lần đầu, NCC nào bắt buộc USB token — để đặt «Chi phí» + «Lead-time» cho connector `cts` (khác Q-025: Q-025 hỏi nghĩa vụ pháp lý, câu này hỏi giá và vận hành) |
| Q-042 | A1 | TikTok Shop Open Platform và Lazada Open Platform (tài liệu chính chủ): quy trình cấp quyền app, shop ủy quyền, webhook đơn hàng có thật không, vòng đời token, giới hạn rate — để đặc tả connector `tiktok`/`lazada` bằng bằng chứng thay vì giả định theo khuôn Shopee |
| Q-043 | A1 | Hãng vận chuyển GHN/GHTK/Viettel Post (trang developer chính chủ): điều kiện cấp tài khoản API cho merchant/bên thứ ba, webhook vòng đời vận đơn có thật không, đọc tiền thu hộ COD theo vận đơn thế nào — để đặc tả `shipper` (Q-037 chỉ lo độ tươi, câu này lo điều kiện đăng ký) |
| Q-044 | A1 | KiotViet Public API (tài liệu chính chủ): phạm vi đọc/ghi, self-serve OAuth2 đúng không, lead-time cấp quyền, rate limit và chu kỳ polling tối thiểu cho bên thứ ba — để đặc tả `pos` bằng bằng chứng (hiện chỉ có ghi nhận trong tài liệu sản phẩm nội bộ) |
| Q-045 | A1 | Nền tảng đặt phòng/app giao đồ ăn cho hộ nhỏ (Booking.com Partner, Agoda, ShopeeFood partner): API/webhook cho nhà nghỉ quy mô nhỏ bán đơn lẻ, hoa hồng công bố từng kênh, điều kiện tài khoản đối tác — để đặc tả `booking` cho CD2 (hoa hồng trong seed 82.500đ hiện là số mô phỏng) |
| Q-046 | A1 | «HĐĐT khởi tạo từ máy tính tiền có kết nối dữ liệu với CQT» (k5 Đ8 NĐ 68/2026): chuẩn kỹ thuật kết nối, danh mục thiết bị/PM đã được CQT công nhận, hộ mua ở đâu giá bao nhiêu — để đặc tả đường máy-tính-tiền của connector `pos`/`hddt` (Q-021 hỏi về NCC trung gian HĐĐT chung, câu này hỏi riêng lớp thiết bị máy tính tiền) |

---

## TỰ SOÁT (trước khi nộp)

- Đủ **12 khối × 10 trường** (mỗi khối: Ai cần · Vì sao · Tiên quyết · Cách đăng ký + ai bấm · Lead-time · Chi phí · Cơ chế + độ tươi · Khi chết · Mô phỏng · Trạng thái onboarding).
- Mọi số có nhãn nguồn; chỗ thiếu ghi «THIẾU BẰNG CHỨNG» + trỏ câu radar (mở sẵn Q-009/020/021/022/023/024/025/026/031/032/033/034/035/036/037/039; mới đề xuất Q-040–Q-046).
- N-01: `ketoan` chỉ kết nối/dẫn sang bản miễn phí nhà nước + MISA — không tự làm kế toán; `etax` chỉ chuẩn bị tờ khai, người tự nộp. N-06: mọi khối «Cách đăng ký» ghi rõ **người bấm nút cuối = chủ hộ** (trừ việc publish app của QNSC trên open.shopee.com — việc nội bộ kỹ thuật, không phải thay hộ ký). N-07: `shipper` — tiền COD về thẳng tài khoản hộ, mockup giữ nguyên payment «Tiền thu hộ» hiện có. N-09: `zalooa` mô phỏng đúng cửa sổ 7 ngày + phí theo loại tin, không dùng broadcast làm kênh vận hành.
- Không kết quả viết cứng: mọi con số mô phỏng là hàm tính từ kho (lũy kế 1 tỷ, đếm tin, đếm đơn) hoặc payload giả lập có nhãn «mô phỏng».
- Không ký tự CJK; tiếng Việt có dấu toàn bộ.
