# KẾT QUẢ SOÁT MOCKUP — LƯỢT CUỐI TRƯỚC HỘI ĐỒNG

**Chạy bốn vai trước khi kết luận:**
- **Vai A (thiết kế):** 5 tab đúng việc làm чаще nhất, nhưng menu "Thêm" 22 mục là bãi rác thật — ra quyết định giảm còn khoảng 10.
- **Vai B (bà Bảy):** mở app thấy tab Bán và nút Trợ lý nổi — ổn. Nhưng bà hay làm nhất là "nợ ai, trả mấy" mà Công nợ nằm trong "Thêm", phải bấm 2 lần.
- **Vai C (cán bộ demo):** đường dài nhất là Trợ lý → nhắc nợ → mở Công nợ: 3 chạm; và Bán → chọn hàng → tạo đơn → in hoá đơn: 5 chạm. Chấp nhận được nhưng cần nút tắt.
- **Vai D (dữ liệu):** phát hiện 6 chỗ mâu thuẫn/trống/giả, chi tiết ở Phần 3.

---

## 1. BỐ CỤC MÀN HÌNH

Bố cục 5 tab theo ngành là đúng hướng, giữ nguyên. Vấn đề duy nhất là menu "Thêm".

**Nên GỘP (22 mục → 10 mục):**
1. **Chi phí của tôi** gộp vào **Khoản chi** — hai màn này là một việc, chỉ khác người xem; gộp bằng bộ lọc "chi phí tôi đã lập".
2. **Đơn treo bị đổi giá** gộp vào **Hoá đơn điều chỉnh thay thế huỷ** thành một màn "Xử lý đơn bất thường" (cùng nhóm rủi ro, cùng người dùng).
3. **Huỷ hàng hỏng** gộp vào **Nhập kho và kiểm kê** — huỷ hỏng về bản chất là điều chỉnh kho.
4. **Hồ sơ hộ** gộp vào **Dữ liệu của tôi** thành một màn dạng accordion.
5. **Truy xuất lô cho bên mua** không nên là màn riêng — chuyển thành nút trong chi tiết từng đơn/lô.
6. **Danh mục hàng hoá** chỉ cần cho CD1, CD3 (có kho); CD2 nên thấy **Tài nguyên và bảng giá gói** thay thế chỗ này.

**Sai chỗ:** **Công nợ và đối soát** là việc nhìn hằng ngày của hộ nhỏ (CD1 có 61 triệu nợ chưa trả!) mà đang chôn trong "Thêm". Đề xuất: CD1 đổi tab "Tiền" thành "Tiền & Nợ" hoặc đưa Công nợ lên ngay đầu menu "Thêm" kèm badge số tiền quá hạn. **Kết ca và đếm tiền** tương tự — hộ bán lẻ dùng mỗi ngày, nên là nút nổi trên tab Tiền, không nằm trong "Thêm".

Kết luận: thanh tab ổn; menu "Thêm" phải dọn, không được đem 22 mục ra trước hội đồng.

## 2. LUỒNG THAO TÁC

**CD1 — chị Hà (đặc sản):**
1. Tab Bán → chọn Nước mắm nhĩ → nhập 2 chai → thêm khách nợ → tạo đơn. 
2. Trợ lý → "2 khoản nợ quá hạn 12 ngày" → *(ĐỨT: không có nút đi thẳng, phải lùi ra, vào Thêm → Công nợ, 3 chạm)* → thêm nút "Xem công nợ" trong thẻ nhắc.
3. Tab Đơn → mở 1 trong 3 đơn chưa xử lý → xuất hoá đơn. *(ĐỨT nhẹ: không có nút "đơn chưa xử lý" trên tab Đơn, phải lọc tay — thêm chip lọc sẵn).*

**CD2 — anh Duy (du lịch):**
1. Tab Lịch → xem 7 đặt chỗ → nhận cọc. 
2. Tab Thu mua/Bán → bán Suất ăn hải sản → kiểm tra trống Cano 1.
3. Trợ lý → cảnh báo "sắp vượt 1 tỷ" → *(ĐỨT: cảnh báo không dẫn tới màn Tài nguyên để xem công suất còn lại — thêm nút).*

**CD3 — anh Bình (nông sản):**
1. Tab Bán → bán 50kg cà phê nhân → truy xuất lô → xuất bảng kê. 
2. Trợ lý → "2 bảng kê thiếu giấy tờ" → *(ĐỨT: phải tự tìm màn Bảng kê trong Thêm — thêm nút đi thẳng).*

**Lối tắt cần thêm (chung):** (a) nút "Xem chi tiết" trong mọi thẻ nhắc của Trợ lý; (b) từ chi tiết công nợ có nút "gửi tin nhắn nhắc" sang Hội thoại với khách — hai màn này đang không biết đến nhau; (c) chip lọc "chưa xử lý / quá hạn" đặt sẵn trên tab Đơn và tab Tiền.

## 3. DỮ LIỆU DEMO

**MÂU THUẪN:**
- CD2: **7 đặt chỗ nhưng mọi gói dịch vụ "còn 0"** (trừ Suất ăn còn 400). Nếu đặt chỗ chiếm chỗ thì số "còn" phải trừ được ra; hiện hai con số không thoại được với nhau. Sửa: đặt Phòng homestay còn 2, Cano 1 còn 4, để hội đồng thấy lịch đầy – trống và giải thích được.
- Tỷ lệ thuế/doanh thu quý ba hộ chênh nhau (4,6% / 6,7% / 2,5%) cùng một loại thuế khoán/RTTT — hội đồng hỏi là bỏ lửng. Sửa: thống nhất một cơ sở (ví dụ RTTT 5% hoặc ghi rõ mỗi hộ hình thức nào) trong hồ sơ 9 tab.
- CD1: đã vượt ngưỡng 1 tỷ nhưng chỉ **4 hoá đơn trên 47 đơn** — màn Hoá đơn gần như rỗng ngay tại hộ được chọn làm "trường hợp đã vượt". Sửa: nâng lên 12–15 hoá đơn, chủ yếu từ 3 khách tổ chức.

**TRỐNG (màn rỗng khi bấm):**
- CD1, CD3: đặt chỗ 0 → không demo được luồng cọc/đổi huỷ ở hai hộ này; chấp nhận nếu kịch bản chỉ demo CD2, nhưng phải ghi rõ trong kịch bản "không bấm chỗ này với CD1/CD3".
- CD1 bảng kê 0, CD3 tin nhắn 1 → Hội thoại với khách ở CD3 gần trống. Sửa: thêm 2–3 tin nhắn hội thoại cho CD3.

**KHÔNG THẬT:**
- CD2 "Suất lặn ngắm san hô sức chứa 10" liệt kê như tài nguyên nhưng mặt hàng lại "còn 0" — dịch vụ chính của hộ lại hết sạch, trông như dữ liệu chết. Sửa: còn 6.
- CD1 kích hoạt 2026-05-12 mà "doanh thu năm 1020tr" — chưa tròn một năm hoạt động, phải ghi rõ là doanh thu luỹ kế từ kích hoạt, không ghi "năm".

**THIẾU:**
- CD2 chỉ 1 lô → không demo so sánh/truy xuất nhiều lô; thêm 3–4 lô (cano, phòng).
- CD1 "điểm QR 1" quá ít để demo quét truy xuất nguồn gốc; thêm 2 điểm nữa.

## 4. KỊCH BẢN DEMO 20 PHÚT — BẢN CUỐI

| Phút | Việc | Bấm ở đâu | Ai bấm |
|---|---|---|---|
| 0–2 | Giới thiệu 3 chân dung trên hồ sơ giải pháp 9 tab | Bề mặt hội đồng | Cán bộ |
| 2–4 | Đăng nhập CD1 chị Hà, chỉ thanh tab đổi theo ngành | Màn chính | Cán bộ |
| 4–6 | Bán lẻ: nước mắm 2 chai + tôm khô, tạo đơn có nợ | Tab Bán | **Hội đồng tự bấm** |
| 6–8 | Trợ lý nhắc 2 khoản nợ quá hạn 12 ngày → đi thẳng vào Công nợ → gửi tin nhắn nhắc khách | Trợ lý → Công nợ | **Hội đồng tự bấm** |
| 8–10 | Truy xuất lô cá cơm khô trên đơn vừa bán, quét QR | Chi tiết đơn | Cán bộ |
| 10–12 | Chuyển CD2: 7 đặt chỗ trên Lịch, nhận cọc 1 chỗ | Tab Lịch | **Hội đồng tự bấm** |
| 12–14 | Trợ lý cảnh báo "sắp vượt 1 tỷ, sẽ phải dùng hoá đơn máy tính tiền" → mở màn Tài nguyên xem công suất cano/phòng | Trợ lý → Tài nguyên | Cán bộ |
| 14–16 | Chuyển CD3: xuất 50kg cà phê kèm bảng kê, Trợ lý nhắc 2 bảng kê thiếu giấy tờ | Tab Bán → Trợ lý | Cán bộ |
| 16–18 | Kết ca đếm tiền + đối soát công nợ (chỉ phần mềm thật làm được) | Thêm → Kết ca | Cán bộ |
| 18–20 | Bàn làm việc kế toán: đối chiếu khoản chi không chứng từ 4tr của CD1; hỏi đáp | Bề mặt web | Cán bộ |

Nguyên tắc: mọi thao tác bấm vào phần trong menu "Thêm" đã được dọn theo Phần 1 — nếu không dọn thì mục 16–18 phải thay bằng "nhìn nhanh", không cho bấm lung tung.

## 5. MƯỜI VIỆC PHẢI SỬA

| # | Việc | Vì sao | Sửa ở đâu | Lượng |
|---|---|---|---|---|
| 1 | Dọn menu "Thêm" 22 → 10 mục theo Phần 1 | Vai A + Vai B: bãi rác, hộ nhỏ không tìm nổi | Sitemap + nav | Vừa |
| 2 | Đưa Công nợ và Kết ca lên vị trí bấm 1 lần | Việc hằng ngày của hộ | Tab Tiền của 3 chân dung | Nhỏ |
| 3 | Thêm nút "đi thẳng" trong mọi thẻ nhắc của Trợ lý | Luồng đang đứt ở điểm nóng nhất demo | Trợ lý | Nhỏ |
| 4 | Sửa dữ liệu CD2: dịch vụ "còn 0" mâu thuẫn với 7 đặt chỗ | Mâu thuẫn số liệu, hội đồng bấm là lộ | Bản dữ liệu CD2 | Nhỏ |
| 5 | Nâng CD1 lên 12–15 hoá đơn | 4/47 hoá đơn làm màn hoá đơn rỗng ở hộ "đã vượt" | Dữ liệu CD1 | Nhỏ |
| 6 | Thêm 3–4 lô và 2 điểm QR cho CD2/CD1 | Không đủ dữ liệu demo truy xuất nhiều lô | Dữ liệu CD2, CD1 | Nhỏ |
| 7 | Thêm tin nhắn hội thoại cho CD3 (1 → 3–4) | Màn Hội thoại gần trống | Dữ liệu CD3 | Nhỏ |
| 8 | Nối Hội thoại với khách ↔ Công nợ bằng nút "nhắc nợ qua tin" | Hai màn liên quan không biết đến nhau | Màn Công nợ, Hội thoại | Vừa |
| 9 | Thống nhất cơ sở thuế 3 hộ, ghi rõ trong hồ sơ 9 tab | Tránh câu hỏi bỏ lửng về tỷ lệ thuế khác nhau | Dữ liệu + hồ sơ 9 tab | Vừa |
| 10 | Ghi chú trong kịch bản: không mở màn đặt chỗ ở CD1/CD3 | Tránh màn rỗng trước hội đồng | Kịch bản demo | Nhỏ |

Tổng: 8 việc nhỏ, 2 việc vừa — làm xong trong vòng một ngày làm việc là đủ trước giờ hội đồng.