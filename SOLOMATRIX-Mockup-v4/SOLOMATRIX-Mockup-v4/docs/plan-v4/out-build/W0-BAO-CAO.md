# W0 — BÁO CÁO THI CÔNG

**Việc:** phản biện toàn bộ câu hỏi/câu chữ từ 3 vai mù công nghệ (bà Nguyễn Thị Bảy 58 · ông Lê Văn
Sáu 55 · cán bộ dẫn 20 hộ). Không viết code — đúng quyền sở hữu INTERFACE mục 0 (W0 chỉ ghi
`out-build/W0-PHAN-BIEN-CAU-HOI.md` + báo cáo này).

## Đã làm gì

1. Đọc theo thứ tự bắt buộc: `INTERFACE-V4.md` (toàn bộ) · `PLAN-V4.md` mục B.0–B.15 toàn bộ + A +
   C.14–C.15 + G · `CHOT-P1-P13.md` · `out/T3-KICH-BAN-3-CHAN-DUNG.md` (toàn bộ) ·
   `js/sm-seed-gialai.js` (toàn bộ, lấy tên/tuổi/vai trò nhân vật) · ANTI-SCOPE (N-01/06/07/09).
   Đọc thêm có chọn lọc: `mobile.html` chỉ 2 điểm liên quan vai — nút `Aa` (dòng 158, nhãn «Đổi cỡ
   chữ», handler dòng 2462 đổi mode `simple/full`) để phản biện chế độ Aa đúng thực trạng code.
2. **Write** `out-build/W0-PHAN-BIEN-CAU-HOI.md` (~250 dòng), đủ 4 phần đúng đề:
   - Phần 1: bảng 13 chốt P — mỗi P một dòng ĐỒNG Ý/BÁC + vì sao từ 3 vai. 2 chỗ BÁC một phần:
     P4 (chữ «sắp tới ngưỡng»/số 800tr không hiện ra màn hộ) và P13 (bỏ «gõ XOÁ» — chữ Á có dấu
     chặn người ít chữ; đổi sang bấm-giữ 5 giây). P1 bổ khuyết «bấm Để sau thì thấy gì»: tab Bán
     tenant trắng là màn trống → đề xuất thẻ chào + bán thử.
   - Phần 2 (quan trọng nhất): 6 câu wizard (câu 0 + 5 câu) đủ a–d mỗi câu. Phát hiện lớn nhất:
     câu 4 hiện DÙNG `doanhThuUoc='tren-1-ty'` để sinh nhóm BẮT BUỘC THEO LUẬT (B.7) — tức câu đoán
     của hộ quyết định nghĩa vụ pháp lý, trong khi T3 chứng minh cả 3 nhà đều đoán sai; đề xuất nhóm
     LUẬT chỉ sinh từ số thật (`t.vuotLuc`) hoặc nút khẳng định chủ động. Đề xuất bỏ «bấm 2 đoạn hội
     thoại thật trong máy» (đụng hộp thoại Zalo của hộ — tự phá lời trấn an dữ liệu).
   - Phần 3: bảng top-15 chỗ vấp OB-1→OB-6 + Trạm + Tạm dừng, kèm 4 điểm đề dặn soi riêng (nút đọc
     to / Aa rút 2 câu / «việc giao người nhà» / thẻ đỏ quá hạn). Bắt thêm 2 lỗi chữ PLAN chưa ai
     nêu: «Đang chờ {bên thứ ba}» (B.9) và nhãn «chưa đo — radar đang hỏi Q-0xx» (C.15) lộ tiếng
     nội bộ ra màn hộ.
   - Phần 4: 5 điều cán bộ dẫn 20 hộ cần (b2g trên điện thoại · hiện «dở ở câu mấy» · nút Xem thử
     không cần mã · ghi kết quả cuộc gọi · tin nhắc cuối buổi theo ngân sách ≤1 tin/ngày, đúng N-09)
     — mỗi điều ≤3 dòng kèm đích, để Claude cân nhắc, không tự thêm code.
3. **Tự soát cú pháp/chữ**: sau khi Write, grep kiểm `\p{Han}|\p{Hiragana}|\p{Katakana}|\p{Hangul}`
   → sạch (luật CJK). Đã bắt và sửa 4 lỗi soạn thảo ngay trong lần soát đầu: 1 ký tự Hán Tự lọt dòng
   P2, 1 lỗi đánh máy «liềntud» (dòng 8 bảng), 1 cụm tiếng Anh lốt «không_VERB», 1 tên người sai
   «Mai/con Trai» → «chị Thu Hà» (tên đúng từ seed). Mọi trích dẫn «…» đối chiếu nguyên văn PLAN/T3
   trước khi ghi.

## Edit/Write ở đâu

- Write mới: `docs/plan-v4/out-build/W0-PHAN-BIEN-CAU-HOI.md` (+4 Edit sửa soạn thảo trong chính nó).
- Write mới: `docs/plan-v4/out-build/W0-BAO-CAO.md` (file này).
- Không đụng file nào khác — đúng bảng quyền sở hữu.

## Chưa làm được / hở

- Phần 3 đi lại luồng dựa trên câu chữ + đặc tả trong PLAN (vì màn v4 chưa có code lúc W0 chạy) —
  nếu W1/W6 thi công lệch chữ so với PLAN thì bảng 15 dòng cần đối chiếu lại trên UI thật.
- Không đánh giá được độ ưu tiên thực thi của 5 điều mục 4 với lộ trình 3 đợt (mục F) — việc của
  Claude cân nhắc.
- Phát hiện ngoài đề nhưng chưa thuộc quyền xử lý của W0: nút `Aa` hiện tại của mobile.html (W6 sở
  hữu) nhãn «Đổi cỡ chữ» nhưng thật ra đổi chế độ simple/full — đã ghi vào phần 3 để W6/Claude cân nhắc.

BUILD-AGENT-DONE W0 2
