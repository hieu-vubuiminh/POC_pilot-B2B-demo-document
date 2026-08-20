# KIỂM KÊ MÀN HÌNH — SoloMatrix v3, soát 18/08/2026

Soát theo hai lăng kính: (a) yêu cầu nêu đích danh trong bài toán · (b) **mọi đầu vào/ra phải lộ cơ chế**.

## A. ĐANG CÓ (mobile) — 12 màn
Bán tại quầy · Đơn & vận chuyển · Lịch đặt chỗ · Kho & lô · Thu mua · Tiền & thuế ·
Trợ lý · Thêm · Kết nối kênh · Chi phí của tôi · Hồ sơ hộ · Dữ liệu của tôi

## B. THIẾU — 11 màn, chia 3 đợt

### Đợt 1 — ĐƯỜNG ĐI CỦA DỮ LIỆU (trả lời trực tiếp câu Quang hỏi)
| # | Màn | Vì sao bắt buộc |
|---|---|---|
| 1 | **Hộp thư đến** — sự kiện từ ngoài vào | Không có thì không ai biết đơn/tiền/tin nhắn đến bằng cách nào |
| 2 | **Bảng giả lập sự kiện bên ngoài** | Cách duy nhất để hội đồng THẤY đơn chảy vào, thay vì hộ tự gõ |
| 3 | **Hàng đợi gửi đi** — xem đích và payload | Đang chỉ có con số đếm, không xem được gửi gì đi đâu |

### Đợt 2 — NGHIỆP VỤ HẰNG NGÀY CÒN HỞ
| # | Màn | Vì sao bắt buộc |
|---|---|---|
| 4 | **Danh mục hàng hoá** — thêm, sửa, đổi giá | Hộ đổi giá theo mùa mà không có chỗ đổi |
| 5 | **Nhập kho / ghi mẻ chế biến** | CD1 phơi xong một mẻ cá thì ghi vào đâu? Hiện lô chỉ có sẵn |
| 6 | **Khoản chi** — bao bì, xăng xe, điện nước | Hộ có chi tiền thật mà không có chỗ ghi ⇒ chế độ doanh nghiệp tính lãi sai |
| 7 | **Khách hàng** — hồ sơ + lịch sử mua | CD1 bán khách sạn, CD3 bán doanh nghiệp chế biến; cần biết ai mua gì, nợ bao nhiêu |
| 8 | **Hội thoại với khách** | Tin nhắn Zalo đến rồi đọc và trả lời ở đâu? |

### Đợt 3 — HOÀN THIỆN THEO NGÀNH
| # | Màn | Vì sao |
|---|---|---|
| 9 | **Chi tiết lượt đặt chỗ** — đổi, huỷ, thu cọc | CD2 khách huỷ thì xử lý thế nào |
| 10 | **Tài nguyên & bảng giá gói** | CD2 mua thêm cano, đổi giá gói theo mùa |
| 11 | **Trả hàng / đổi hàng** | Sàn có tỷ lệ hoàn đơn thật, phải trả tồn về kho |

## C. HỒ SƠ GIẢI PHÁP (index.html) phải cập nhật
Thêm một tab **"Bản đồ màn hình"**: liệt kê đủ màn theo vai, và một bảng **"Đường đi dữ liệu"**
(nguồn → cách đến → endpoint → tạo ra gì) cho cả 8 luồng vào và các luồng ra.
