# SoloMatrix v4 — mô phỏng Kế nghiệp số Gia Lai + ONBOARDING lần-đầu-đăng-nhập

*v4 dựng 20/08/2026 trên nền v3 (17/08). Bản v2 (`~/Downloads/SOLOMATRIX-Mockup-v2/`) giữ nguyên tham chiếu.*

## MỚI Ở v4 — luồng onboarding cho hộ MÙ CÔNG NGHỆ (Quang chốt 20/08)
Mở `mobile.html` → nút ☰ → chọn **CD2 Nhơn Lý** (hộ chưa kích hoạt) → app tự mở phần mở đầu:
1. **OB-1 kích hoạt**: quét QR mã suất (nút «Mô phỏng quét QR») · «Xem thử trước khi có mã» · «Để sau» không chặn app.
2. **Câu 0**: «Máy này ai hay dùng nhất?» — đáp án là TÊN người trong hộ; chọn người lớn tuổi thì wizard tự rút còn 2 câu, phần giấy tờ giao con bấm tối.
3. **5 câu nhận diện** toàn bấm-không-gõ (không một ô gõ số tiền); câu doanh thu hỏi theo mùa, «Không biết» là nút to — **nhóm LUẬT không sinh từ câu đoán**, chỉ sinh từ số bán thật (`vuotLuc`) hoặc nút «Tôi chắc cả năm bán trên 1 tỷ».
4. **Danh mục kết nối theo hộ**: mỗi dòng mở đầu bằng VIỆC đời thường («Tiền về quầy tự hiện lên»), 3 nhóm LUẬT/NÊN CÓ/ĐỂ SAU; từng connector 2 nhánh «Có rồi / Chưa có — đăng ký ngay trong app», lead-time thật có nhãn nguồn, **người bấm nút Gửi cuối luôn là hộ** (in tên trên nút).
5. **Trạm kết nối** (tab Thêm → Kết nối): đang chờ ai — dự kiến ngày nào — quá hạn gọi cán bộ; bảng độ tươi dữ liệu per-connector; kênh đứt báo ra tiếng.
6. **Demo 10 giây cho hội đồng**: Hộp thư → bảng giả lập → bắn «Tiền về» rồi bắn «SePay gửi TRÙNG» — tiền chỉ cộng MỘT lần, app khoe «bản trùng theo id — đã bỏ».
7. **b2g.html → Sổ trực onboarding**: cán bộ thấy 51 hộ (3 thật + 48 mô phỏng), ai kẹt bước nào, hạn 30 ngày HĐĐT, sinh suất QR; chạy được trên điện thoại cán bộ.
8. **Tạm dừng dùng OPC** (tab Thêm): xuất toàn bộ dữ liệu + ngắt kết nối + xoá bằng «bấm giữ 5 giây» — vào dễ, ra cũng dễ.

*Đồng hồ 30 ngày đăng ký HĐĐT: xem CD1 (đã vượt 1 tỷ) — thẻ «Còn N ngày» trên tab Bán/Tiền, N tính từ mốc `vuotLuc` trong seed, không viết cứng.*
*Hồ sơ thi công + kế hoạch + 11 báo cáo agent: `docs/plan-v4/` (PLAN-V4.md · INTERFACE-V4.md · out-build/).*

## Mở thế nào

Ba file HTML, dùng chung một kho dữ liệu trong trình duyệt. Không cần mạng, không cần cài gì.

| File | Ai dùng | Vai |
|---|---|---|
| **`mobile.html`** | Hộ kinh doanh | **Bề mặt chính.** Toàn bộ nghiệp vụ hằng ngày. Mở trên điện thoại. |
| `b2g.html` | Cán bộ Tổ công tác | Bảng điều khiển Chương trình: ba cửa thanh toán, số liệu tổng hợp, ranh giới dữ liệu |
| `index.html` | Hội đồng chấm | Hồ sơ giải pháp: 4 mốc, giá, kết nối, đội tại chỗ, nhân rộng, kịch bản demo, ma trận đối chiếu |
| `web.html` | Kế toán chia sẻ · cán bộ hỗ trợ | **Tuỳ chọn cộng thêm** — nhiều hộ trên một màn hình. Điện thoại vẫn làm được trọn vẹn mọi việc; web không bắt buộc. |

Mở bằng máy chủ tĩnh (đọc/ghi kho dữ liệu ổn định hơn `file://`):

```bash
cd solomatrix-v3-gialai && python3 -m http.server 8126
```

Rồi vào `http://localhost:8126/mobile.html`. Trên điện thoại: mở cùng địa chỉ trong mạng nội bộ, rồi Chia sẻ → Thêm vào Màn hình chính.

## Ba chân dung — đúng Mục III bài toán

| Mã | Hộ | Địa bàn | Trạng thái ngưỡng 1 tỷ | Bài toán riêng |
|---|---|---|---|---|
| **CD1** | Đặc sản Biển Xanh — hải sản khô, cá mắm, nước mắm | Phường Quy Nhơn, ven biển | **Đã thuộc diện** (1.020tr) | Tồn kho 3 kênh · hồ sơ ATTP, nhãn mác, truy xuất |
| **CD2** | Dịch vụ Du lịch Nhơn Lý — quán ăn, homestay, cano, lặn san hô | Xã Nhơn Lý, ven biển | **Sắp vượt** (780tr, ước cả năm 1.243tr) | Đặt chỗ chống trùng · QR nhiều điểm · mùa vụ |
| **CD3** | Nông sản Chư Păh — thu mua, sơ chế cà phê, mắc ca, chanh dây | Xã Chư Păh, cao nguyên | Dưới ngưỡng (607tr) | **Chứng từ đầu vào từ nông dân** · lô truy xuất |

Ba trạng thái ngưỡng khác nhau là **cố ý** — để demo được cả ba đường của ràng buộc IV.1.

## Năm thao tác hội đồng nên tự tay thử

1. **Bán khi mất mạng.** `mobile.html` → bấm `✈︎ Chế độ máy bay` → thêm món → thu tiền → xuất hoá đơn. Hoá đơn vẫn lập được, hàng đợi tăng. Tắt chế độ máy bay → hàng đợi tự rút, hoá đơn nhận mã cơ quan thuế.
2. **Bán quá hàng.** Tab Bán → *Thử nhận đơn từ kênh khác* → đặt vượt số còn lại. Bị chặn, kèm giải thích tổng tồn trừ phần đang giữ chỗ.
3. **Bảng kê thiếu giấy tờ.** Đổi sang CD3 → tab Thu mua → lập bảng kê nhưng bỏ trống *số giấy tờ định danh* → bị chặn. Rồi bấm **Truy xuất** trên hoá đơn bán cho doanh nghiệp chế biến → ra tới tên nông dân và bảng kê gốc.
4. **Đặt trùng chuyến đã đầy.** Đổi sang CD2 → tab Lịch → đặt Cano 1 khung `07:30` ngày `18/08` (đã đầy 12/12) → bị chặn, kèm danh sách khung còn chỗ.
5. **Hỏi trợ lý bằng câu của mình.** Tab Trợ lý → *"thuế tạm tính quý này bao nhiêu"*. Mỗi câu trả lời có dòng **"Tính từ đâu"** để đối chiếu — không phải chuỗi dựng sẵn.

Thêm: nút `Aa` đổi **chế độ đơn giản** cho bố mẹ lớn tuổi (chữ lớn, chỉ Bán / Tiền / Trợ lý).

## Mã nguồn

| File | Chứa gì |
|---|---|
| `js/sm-core.js` | Kho bền · **hàng đợi đồng bộ offline** · bus sự kiện đa tab · xuất toàn bộ dữ liệu (JSON + CSV) |
| `js/sm-domain.js` | **Nghiệp vụ**: thuế và định tuyến sổ · ngưỡng · tồn kho theo lô · bảng kê thu mua · đặt chỗ chống trùng · ba cửa thanh toán · truy xuất |
| `js/sm-seed-gialai.js` | Ba chân dung, sinh **xác định** (LCG có hạt giống) — mở lại luôn ra đúng số cũ |
| `js/sm-ai.js` | Trợ lý hai lớp + bộ nội dung nghiệp vụ có dấu phê duyệt + cam kết SLA |
| `js/sm-program.js` | Giá ba cột · bản đồ chồng lấn · 8 nghề · định mức nhân sự · chỉ số sống · 4 mốc · kịch bản demo |

**Nguyên tắc:** không có kết quả viết cứng. Mọi con số trên giao diện đều là hàm tính từ kho. Tồn kho tụt thật khi đặt đơn; thuế đổi thật khi bán thêm.

## Chỗ còn thiếu — nói trước

1. **Chưa có sản phẩm đã vận hành ổn định** (Mục II.1) và **chưa có dự án tương tự kèm số liệu** (VI.1(b)). Đây là bản mô phỏng đầy đủ nghiệp vụ, chưa có khách trả tiền.
2. **Chưa có nhân sự thường trú tại Gia Lai** (IV.6) — trụ sở là địa chỉ đăng ký. Đi theo cửa *"phương án thiết lập"* mà VI.1(b) cho phép.
3. **Bộ nội dung nghiệp vụ chưa được phê duyệt** — trợ lý Lớp B chạy trên bản nháp v0.3, mọi bài chưa phê duyệt hiện nhãn vàng.
4. **Biểu tỷ lệ thuế cần đối chiếu văn bản hiện hành** — bảng nằm một chỗ (`sm-domain.js` → `TAX.nhom`) và có cờ `canDoiChieu` bật cảnh báo trên giao diện.
5. **`web.html` là tuỳ chọn, không phải điều kiện.** Ràng buộc IV.4 cấm *yêu cầu* máy tính, không cấm *có* bản web. Mọi nghiệp vụ hằng ngày làm trọn trên `mobile.html`; web chỉ phục vụ kế toán chia sẻ và cán bộ hỗ trợ theo dõi nhiều hộ.
6. **PWA thật chưa làm** — hiện là trang web cài được vào Màn hình chính. Bản chính thức phải là app trên cả hai store theo đúng chữ IV.4.

## Liên quan

- Kế hoạch và 25 gap neo từng điều khoản: `~/Downloads/SoloMatrix_GiaLai_2026-08-17/PLAN_SoloMatrix_GiaLai.md`
- Toàn văn bài toán (bóc text, grep được): cùng thư mục trên, `nguon/THUMOI.txt`
- Bản v2 tham chiếu: `~/Downloads/SOLOMATRIX-Mockup-v2/`
