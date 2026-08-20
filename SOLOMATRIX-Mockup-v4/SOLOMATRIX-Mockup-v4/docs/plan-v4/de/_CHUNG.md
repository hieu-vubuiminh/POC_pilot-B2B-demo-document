# BỐI CẢNH CHUNG — chiến dịch PLAN v4 (phần này giống nhau ở mọi đề T1–T6)

Bạn là GLM chạy trong harness Claude Code, đóng đúng MỘT vai được giao ở phần sau của prompt.
Claude ra đề và sẽ verify từng mục sau khi bạn xong. Sản phẩm của bạn là MỘT file .md,
ghi bằng tool Write vào đúng đường dẫn ở mục «SẢN PHẨM» của đề.

## Mục tiêu cả chiến dịch
Lập KẾ HOẠCH CHI TIẾT (chưa code) để nâng mockup SoloMatrix v3 «Gia Lai» lên v4, theo 2 mạch:
1. Đưa các phát hiện đã kiểm chứng của radar OPC vào mockup — cái gì thật hay thì thành màn hình/luồng.
2. **QUAN TRỌNG NHẤT (Quang — CEO — chốt):** thiết kế luồng **ONBOARDING lần-đầu-đăng-nhập**.
   Chân dung người dùng: hộ kinh doanh truyền thống, KHÔNG quen sản phẩm công nghệ, nay buộc phải
   dùng OPC. Họ không biết mình cần kết nối gì → nền tảng phải CHỦ ĐỘNG hỏi, xin tài khoản bên thứ 3
   để kết nối; hộ CHƯA có tài khoản thì phải đăng ký được NGAY TRONG OPC; danh mục kết nối
   TUỲ LOẠI HÌNH KINH DOANH (3 chân dung khác nhau).

## Nguồn đọc (Read/Grep — cwd là «/Users/quangle/QNSC - local»)
- Mockup v3: `solomatrix-v3-gialai/` — `README.md` · `mobile.html` (~180k ký tự — CHỈ Grep + Read
  theo offset/limit, cấm nuốt nguyên file) · `b2g.html` · `index.html` · `web.html` ·
  `js/sm-core.js` (kho bền localStorage, hàng đợi đồng bộ offline, SM.fmt, SM.CLOCK.today) ·
  `js/sm-domain.js` (TAX + ngưỡng 1 tỷ, tồn kho theo lô, đặt chỗ chống trùng, 3 cửa thanh toán, truy xuất) ·
  `js/sm-inbox.js` (NGUON sự kiện ngoài vào: SePay/sàn/vận chuyển; hộp thư đến; bảng giả lập) ·
  `js/sm-ops.js` (12 việc thật: nhật ký thao tác, kết ca, công nợ, khoản chi, hoá đơn điều chỉnh…) ·
  `js/sm-quyen.js` (VAI phân quyền, thiết bị & khôi phục, truy xuất cho bên mua) ·
  `js/sm-seed-gialai.js` (3 chân dung, sinh xác định LCG) · `js/sm-program.js` (tầng Chương trình).
- Sổ radar OPC (bằng chứng ĐÃ kiểm chứng — tin được, trích kèm nhãn):
  `/Users/quangle/.claude/memory-sync/opc-radar/REQUIREMENTS.md` (R-A1-01…R-A3-07, cột v2) ·
  `ANTI-SCOPE.md` (N-01…N-09) · `DIGEST.md` · `findings/*.md` (Q-001…Q-007, Q-019).
- Đầu bài tỉnh Gia Lai (toàn văn, grep được):
  `/Users/quangle/Downloads/SoloMatrix_GiaLai_2026-08-17/nguon/THUMOI.txt`

## Ba chân dung trong seed (kênh lấy đúng từ `sm-seed-gialai.js`)
- **CD1** Đặc sản Biển Xanh — hải sản khô; **ĐÃ >1 tỷ** (1.020tr); kênh `quay,b2b,shopee,tiktok,lazada,zalo`.
- **CD2** Du lịch Nhơn Lý — quán ăn/homestay/cano; **SẮP vượt 1 tỷ** (780tr, ước cả năm 1.243tr); kênh `quay,b2b,booking,zalo,food`.
- **CD3** Nông sản Chư Păh — thu mua/sơ chế; dưới ngưỡng (607tr); kênh `b2b,shopee,tiktok,live,zalo`.

## Giao diện hiện có (neo thật, đừng đoán lại)
- Tab dưới (mobile): `ban` · (`lich`|`mua`|`kho` tuỳ chân dung) · `don` · `tien` · `them`.
- Menu «Thêm» đã có các màn id: `hopthu, hoithoai, khachhang, trahang, datcho, hanghoa, nhapkho,
  huyhong, truyxuat, tainguyen, ketca, congno, khoanchi, hoadondc, giadoi, chiphi, ketnoi
  («Kết nối kênh bán» — có khái niệm «danh mục tối thiểu»), phanquyen` … (xem hàm menu trong mobile.html ~dòng 810–840).
- Nút `Aa` = chế độ đơn giản cho người lớn tuổi (chữ lớn, chỉ Bán/Tiền/Trợ lý).
- Nguyên tắc bất di: **không có kết quả viết cứng** — mọi số trên giao diện là hàm tính từ kho.

## BẢNG SỐ LIỆU ĐƯỢC PHÉP DÙNG (trích sẵn từ findings — dùng đúng, kèm nhãn [Q-00x]; số NGOÀI bảng này thì phải tự Read finding để trích, hoặc ghi «THIẾU BẰNG CHỨNG»)
- Bỏ thuế khoán từ 01/01/2026 (NQ 198/2025/QH15) [Q-001]
- Ngưỡng miễn GTGT/TNCN nâng 500tr → **1 tỷ/năm** (NĐ 141/2026/NĐ-CP sửa NĐ 68/2026/NĐ-CP) [Q-001]
- Hộ >1 tỷ/năm: bắt buộc HĐĐT có mã CQT hoặc HĐĐT máy tính tiền kết nối CQT; **đăng ký trong 30 ngày**
  kể từ ngày cuối kỳ tính thuế có doanh thu lũy kế vượt 1 tỷ [Q-001]
- Kế toán hộ KD: TT 152/2025/TT-BTC; Nhà nước cấp **miễn phí** PM kế toán tích hợp HĐĐT/CTS từ 15/01/2026 (NĐ 20/2026/NĐ-CP) [Q-001]
- Chữ ký số bắt buộc cho: phát hành HĐĐT · kê khai/nộp thuế điện tử · BHXH điện tử (NĐ 12/2015, Luật QLT 2019, k7 Đ10 NĐ 123/2020) [Q-001]
- Sàn TMĐT khấu trừ nộp thay thuế (NĐ 117/2025/NĐ-CP, hiệu lực 01/07/2025 — xác minh KHÔNG hết hiệu lực) [Q-001·Q-019]
- Cổng hoadondientu.gdt.gov.vn: HĐĐT có mã **miễn phí**, đăng ký bằng MST, phản hồi **15 phút–1 ngày làm việc**;
  NCC được CQT công nhận: Viettel, VNPT, MISA, FPT, SePay… [Q-002]
- SePay: webhook **12+ ngân hàng, self-serve ~phút**; eInvoice API **ký số online 100% không cần USB token**;
  webhook at-least-once, retry 7 lần giãn Fibonacci ~33 phút, quá 5 giờ bỏ; response 200 trong 30s (Webhooks) / 8s (Bank Hub IPN);
  connector phải **dedup theo `id`/`transaction_id`** [Q-002·Q-006]
- MISA AMIS Open API: đăng ký qua **nhân viên kinh doanh** (app_id/access_code) — lead-time thương mại, không self-serve [Q-002]
- Shopee Open Platform: cần tài khoản open.shopee.com + tạo app + publish + **shop ủy quyền**; access_token 4 giờ,
  refresh 1 tháng; hạn chuyển kết nối hợp lệ **27/05/2026** [Q-002]
- Zalo OA xác thực: cần **Giấy phép ĐKKD**, BQT duyệt **2–3 ngày làm việc** [Q-004]
- Zalo tin Tư vấn: cửa sổ tương tác **7 ngày**; **8 tin miễn phí/48 giờ** rồi 55đ/tin; tin Giao dịch **165đ/tin**;
  broadcast cần người dùng Quan tâm OA, gói Premium trần **04 tin/tháng** [Q-005]
- 75% MSME online dùng điện thoại làm thiết bị chính; 62% dùng app nhắn tin cho kinh doanh (DAI/Ipsos, **số 2021**, n=999) [Q-004]
- Hộ KD «cơ bản không có kiến thức tài chính, kế toán» (hội nghị Cục Thuế 6/2025) [Q-004]
- 3,6 triệu hộ được quản lý thuế (cuối 2024); ~37.000 hộ >1 tỷ phải dùng HĐĐT máy tính tiền từ 1/6 [Q-004]
- KiotViet: 270k/330k/490k mỗi tháng; **mọi gói kèm HĐĐT + chữ ký số + PM kế toán hộ KD 0đ** [Q-007]
- Kiến trúc 24/7: durable execution (trạng thái nghỉ không tốn compute) + webhook + polling đối soát
  (poll an toàn tối thiểu 24h) + **idempotency store trước connector đầu tiên** [Q-003]

## LUẬT CỨNG (vi phạm = bản nộp bị bác)
1. Viết **tiếng Việt có dấu**. Không lọt bất kỳ ký tự Trung/Nhật/Hàn nào — tự kiểm lại trước khi ghi file.
2. **Cấm bịa**: tên văn bản pháp luật, con số, thời hạn, giá, tên dịch vụ. Chỉ dùng bảng số liệu trên,
   findings, code mockup. Thiếu thì ghi «THIẾU BẰNG CHỨNG — đề xuất câu hỏi radar: …».
3. Tôn trọng ANTI-SCOPE: N-01 (không tự làm PM kế toán/khai thuế — kết nối/dẫn sang bản miễn phí nhà nước) ·
   **N-06 (không ký thay/khai thay/nộp thay — OPC chỉ CHUẨN BỊ sẵn, NGƯỜI bấm gửi; mọi luồng «đăng ký hộ»
   phải ghi rõ ai bấm nút cuối)** · N-07 (không giữ tiền khách) · N-09 (không dùng broadcast Zalo làm kênh đẩy vận hành).
4. Kế hoạch cho **MOCKUP TĨNH** (HTML+JS, không backend): mọi đề xuất phải mô phỏng được bằng seed + hàm tính
   + bảng giả lập sự kiện; ghi rõ mô phỏng thế nào.
5. Quy tắc mockup của Quang: mọi đầu vào/ra phải **LỘ ĐƯỜNG ĐI** (ai gửi · qua đâu · payload thô · tạo ra gì);
   cấm bắt người dùng gõ tay dữ liệu lẽ ra tự chảy vào.
6. Mỗi mục đề xuất PHẢI có: **nhãn nguồn** (Q-00x / R-xx / N-xx / THUMOI mục nào / «tự đề xuất») +
   **màn/file đích** + **tiêu chí nghiệm thu đo được**.
7. CHỈ ghi file vào `solomatrix-v3-gialai/docs/plan-v4/out/` (đúng file được giao). **Cấm sửa mọi file khác**,
   đặc biệt cấm đụng mobile.html/js/*.js — đây là bước KẾ HOẠCH, chưa thi công.
8. Được phép dùng Task (subagent) để đọc song song cho nhanh, nhưng file sản phẩm phải do chính bạn Write.
9. Xong thì in ra đúng một dòng cuối: `PLAN-AGENT-DONE <mã đề> <đường dẫn file> <số mục chính đã viết>`.

---
