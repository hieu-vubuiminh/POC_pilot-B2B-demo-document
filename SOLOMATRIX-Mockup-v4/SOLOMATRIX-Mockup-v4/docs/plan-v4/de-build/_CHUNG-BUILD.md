# CHIẾN DỊCH BUILD MOCKUP v4 — bối cảnh chung (giống nhau ở W0–W7)

Bạn là GLM chạy trong harness Claude Code, THI CÔNG mockup SoloMatrix v4 theo kế hoạch đã duyệt.
Quang (CEO) chốt 20/08: «tất cả agent làm SONG SONG; phản biện tất cả các câu hỏi; luôn đặt mình là
end user MÙ CÔNG NGHỆ — onboarding mọi thứ phải thật dễ dàng». 8 agent làm song song, mỗi agent
SỞ HỮU file riêng — đụng file người khác là hỏng cả chiến dịch.

## ĐỌC THEO THỨ TỰ (bắt buộc, trước khi gõ chữ nào)
1. `solomatrix-v3-gialai/docs/plan-v4/INTERFACE-V4.md` — hợp đồng chữ ký hàm + hình dạng dữ liệu + quyền sở hữu file. LỆCH LÀ VỠ TÍCH HỢP.
2. `solomatrix-v3-gialai/docs/plan-v4/PLAN-V4.md` — CHỈ các mục được trỏ trong đề của bạn (file dài, đọc có chọn lọc).
3. `solomatrix-v3-gialai/docs/plan-v4/CHOT-P1-P13.md` — quyết định đã chốt.
4. Code hiện có LIÊN QUAN đến file bạn sở hữu (Grep + Read theo offset; `mobile.html` ~180k ký tự — cấm nuốt nguyên file).

## Luật cứng
- Viết tiếng Việt có dấu; KHÔNG một ký tự Trung/Nhật/Hàn — tự grep kiểm trước khi kết thúc.
- Chữ hiển thị cho HỘ = lời nói thường (như cán bộ nói với cô chú); thuật ngữ kỹ thuật chỉ được nằm trong
  khối «cài đặt nâng cao»/comment code.
- Không bịa: tên người chỉ từ seed; số/lead-time/văn bản pháp lý đúng như PLAN đã gắn nhãn.
- Không viết cứng kết quả — mọi số hiển thị là hàm tính từ kho (`SM`, `D`, `ON`).
- File hiện có: CHỈ dùng Edit từng chỗ, mỗi Edit nhỏ và có neo (KHÔNG Write đè file hiện có).
  File MỚI thuộc sở hữu của bạn: dùng Write. Không ghi file nào ngoài bảng quyền sở hữu ở INTERFACE mục 0.
- Mã nguồn theo phong cách file hiện có (IIFE, 'use strict', tên hàm/trường tiếng Việt không dấu, comment gọn).
- Xong việc: (a) Write báo cáo `solomatrix-v3-gialai/docs/plan-v4/out-build/<ID>-BAO-CAO.md` — đã làm gì,
  Edit/Write ở đâu, tự soát cú pháp bằng cách nào, còn gì chưa làm được (nói thật, đừng bịa lý do);
  (b) in đúng một dòng cuối: `BUILD-AGENT-DONE <ID> <số thay đổi>`.

---
