# T5 — PHẢN BIỆN ĐỘC LẬP + LĂNG KÍNH CÁN BỘ VẬN HÀNH KHOÁ

- Vai: (1) phản biện độc lập, ưu tiên BÁC — soát T1–T4 bằng ANTI-SCOPE, THUMOI, findings radar; (2) cán bộ Tổ công tác vận hành khoá 100–150 hộ/khóa [THUMOI I.3] — người chịu trận nếu onboarding hỏng hàng loạt.
- Ngày: 2026-08-20. Đã đọc đủ: `out/T1-ONBOARDING-FLOW.md`, `out/T2-CONNECTOR-SPEC.md`, `out/T3-KICH-BAN-3-CHAN-DUNG.md`, `out/T4-FINDINGS-VAO-MOCKUP.md`, ANTI-SCOPE.md, REQUIREMENTS.md, DIGEST.md, THUMOI (I–VII), findings Q-001·Q-002·Q-003·Q-004·Q-005·Q-006·Q-007·Q-019 (đối chiếu chọn mẫu số về finding gốc), và spot-check neo code trên v3 (menu mobile.html:806-849 · `Aa` :849-856 · viewKetnoi :866-895 · CONNECTORS sm-domain.js:834-858 · seed TODAY 2026-08-17 · VAI sm-quyen.js:20+ · COD sm-inbox.js:144-150 · seq() :187 · deadlines nguong-mtt sm-domain.js:240-245 · khối b2g programBoard/IV.7 b2g.html:115-166).

**Đối chiếu chọn mẫu số về finding gốc (7 mẫu, tất cả KHỚP):** «15 phút–1 ngày làm việc» + «12+ ngân hàng, 5 phút» + «token 4 giờ / refresh 1 tháng / 27-05-2026» [Q-002] · «7 ngày / 8 tin 48h / 55đ / 165đ / 04 tin tháng» [Q-005] · «75% / 62% / n=999 / 2021 / 3,6 triệu / 37.000 / 2–3 ngày làm việc» [Q-004] · «270k/330k/490k + 0đ kèm» [Q-007] · «retry 7 lần Fibonacci ~33 phút / 5 giờ / 30s / 8s / dedup id» [Q-006]. T1–T4 trích đều đúng finding; tìm thấy 2 lỗi số/điều kiện, ghi ở bảng verdict (T3-CD2e, T2-1.7).

---

## 1. BẢNG VERDICT

Verdict: **GIỮ** / **SỬA** (kèm sửa thế nào) / **BỎ**. Chỉ liệt kê đề xuất LỚN; chi tiết nhỏ gom vào dòng tương ứng.

### T1 — Kiến trúc sư onboarding

| Mã | Đề xuất | Verdict | Căn cứ |
|---|---|---|---|
| T1-P1 | 10 nguyên tắc thiết kế (nói đời thường, ≤3 chạm, không chặn app, lộ đường đi) | GIỮ | Khớp Q-004 «hộ cơ bản không có kiến thức tài chính» + R-A2-04/07 + quy tắc mockup của Quang |
| T1-2 | Máy trạng thái 7 mức per-connector; `da_ket_noi` chỉ đến từ sự kiện ngoài hoặc cán bộ xác nhận tay (có nhật ký) | GIỮ | Sửa đúng chỗ giả của v3 (`toggleConnector` chỉ set cờ — đã verify sm-domain.js:877-886; auto-noi `batBuoc` :869 là nói dối trạng thái) |
| T1-3a | OB-1 kích hoạt bằng mã suất QR `GL26-…` sinh từ b2g | GIỮ (kèm điều kiện) | THUMOI IV.7 thanh toán theo hộ **đã cài đặt**. Điều kiện: b2g hiện CHƯA có khối sinh suất/mã cán bộ (chỉ có bảng IV.7 ba cửa — đã verify) — phải đặc tả thêm, xem mục 3a file này |
| T1-3b | Wizard 5 câu nhận diện, mỗi câu 1 màn | SỬA | Ba sửa, tất cả từ T3 (mục 2 file này): (1) câu 4 doanh thu đổi dạng hỏi-theo-mùa + «Không biết» là lựa chọn nổi bật nhất — T3 (b) chứng minh cả 3 nhà đều KHÔNG biết con số năm và mỗi nhà sai một kiểu; (2) thêm câu 0 «trong nhà ai hay cầm điện thoại nhất?» TRƯỚC câu nghiệp vụ (T3 (g)) — gắn vào OB-1 để không vượt 5 câu chính; (3) câu 3 chọn «bán cho nhà hàng, công ty» phải là tín hiệu MỞ luồng hoá đơn tự nguyện cho hộ dưới ngưỡng (xem T1-3d) |
| T1-3c | Nhóm BẮT BUỘC: «mọi hộ → Kê khai thuế điện tử» | SỬA | Quá rộng so bằng chứng: R-A1-01 ghi «nhóm chịu chế độ đầy đủ = hộ doanh thu >1 tỷ»; Q-001 chỉ nêu nghĩa vụ cụ thể cho ngưỡng; T2-1.5 tự ghi «nghĩa vụ định kỳ nhóm ≤1 tỷ chưa chốt — Q-023». Sửa: tách 2 dòng — «khai thuế theo dòng tiền sau bỏ thuế khoán (mọi hộ)» [Q-001 NQ 198/2025/QH15] và «kê khai điện tử đầy đủ + HĐĐT + CTS (hộ >1 tỷ)» [Q-001]; phần ≤1 tỷ ghi «mức chi tiết chờ Q-023» |
| T1-3c | Công thức `du_toi_thieu`: nhóm BẮT BUỘC tính `bo_qua`-có-lý-do là đạt | SỬA | Cho phép hộ >1 tỷ «bỏ qua có lý do» HĐĐT rồi coi ĐẠT tối thiểu là sai luật: hạn 30 ngày là nghĩa vụ [Q-001], không có «bỏ qua» hợp lệ. Sửa: `bo_qua` chỉ hợp lệ ở nhóm NÊN CÓ/ĐỂ SAU; nhóm LUẬT chỉ có «hoãn + việc cán bộ theo», máy trạng thái giữ nguyên không hoàn thành. Đây còn là yêu cầu của chính tôi với vai cán bộ: hộ cháy hạn là trách nhiệm Tổ công tác, app phải đẩy việc cho cán bộ chứ không nuốt bằng cách «đạt» |
| T1-3d | Kiểu 3 (HĐĐT): hộ ≤1 tỷ «KHÔNG cho gửi hồ sơ» | SỬA | Bác phần cấm: CD3 dưới ngưỡng nhưng khách DN đòi hoá đơn là ĐỘNG LỰC CHUYỂN ĐỔI trong chính đầu bài [THUMOI III-CD3: «xuất hóa đơn bán hàng cho doanh nghiệp chế biến»]; T2-1.3 và thứ tự CD3 của T2 cũng để luồng này mở. Hộ dưới ngưỡng hoàn toàn được đăng ký HĐĐT tự nguyện qua cổng miễn phí [Q-002]. Sửa: mặc định hiện «chưa bắt buộc — app canh ngưỡng», nhưng nếu câu 3 chọn kênh b2b hoặc hộ bấm «khách đòi hoá đơn» thì mở luồng gửi (nhãn «tự nguyện, không phải luật đòi») |
| T1-3d | Bảng tham số: shopee «uỷ quyền shop: trong phiên» | SỬA nhẹ | «Trong phiên» chưa có bằng chứng (Q-002 chỉ chốt cơ chế Authorize trong App List); gắn nhãn [tự đề xuất] như T2 đã làm cho tiktok/lazada |
| T1-3e | Trạm kết nối: «đang chờ ai — dự kiến — quá hạn gọi cán bộ» + nhắc đúng loại tin Zalo, không broadcast | GIỮ | Đúng Q-004 (2–3 ngày làm việc), Q-005 (Tư vấn/Giao dịch), N-09. Bổ sung theo mục 2 file này: thêm dòng «cập nhật lần cuối X phút trước» (T2-1.1 đã đòi) + ngân sách ≤1 tin đẩy/ngày/hộ |
| T1-3f | Việc đầu tiên theo chân dung, đích đo R-A2-07 | GIỮ | Khớp thẳng T3 (e): CD1 tiền về quầy · CD2 hợp nhất 4 điểm + chặn đặt trùng · CD3 bảng kê → mã truy xuất. Đây là phần hay nhất của T1 — giữ nguyên |
| T1-4 | Chế độ «làm cùng cán bộ» — cán bộ làm được gì, hộ bấm gì | GIỮ (kèm điều kiện) | Đúng N-06, đúng THUMOI IV.6. Điều kiện: «cán bộ xác nhận tay `da_ket_noi`» phải kèm mã cán bộ trong nhật ký (T1 đã ghi) VÀ xuất hiện trong Sổ trực b2g (mục 3a) — nếu không, cách xác nhận tay này trở thành lỗ hổng đạt-giả: cán bộ bấm xong cho kịp chỉ số |
| T1-5 | Thêm người trong nhà bằng mã mời, không chạy lại onboarding; đổi máy giữ tiến trình | GIỮ | Đúng sm-quyen hiện có (VAI `nguoi-nha` mở ra chế độ chữ lớn — đã verify moTa). Lưu ý thi công: T1 viết «5 VAI hiện có» — đếm lại danh sách VAI khi code, đừng kế thừa con số này nếu lệch |
| T1-7 | GỘP Trạm kết nối vào màn `ketnoi` hiện có, bỏ auto-noi `batBuoc` | GIỮ | Đúng hiện trạng (menu 4 nhóm đã chống «bãi rác» — comment code gốc xác nhận; `connectorSummary` ngưỡng IV.3 còn đúng). Tách 2 lớp «tối thiểu theo LUẬT / theo CHƯƠNG TRÌNH» là cải tiến đúng |

### T2 — Đặc tả 12 connector

| Mã | Đề xuất | Verdict | Căn cứ |
|---|---|---|---|
| T2-0 | Đổi id (`cks`→`cts`, `zalo`→`zalooa`), gộp connector (bank+qr, etax+cthue, shipper) | SỬA nhẹ | Bản thân việc gộp/đổi hợp lý (đã verify CONNECTORS gốc sm-domain.js:834-858), nhưng thiếu kế hoạch migrate: seed v3 đang dùng id cũ trong `t.connections`, `donVe` đếm theo `o.channel === c.id`, b2g/web đọc chung `D.connectors`. Sửa: thêm mục «bảng chuyển id + chỗ nào phải đổi cùng lúc» vào đặc tả thi công, nếu không v4 nối sai lệch đơn về connector |
| T2-1.1 | `bank` (SePay): lead-time phút, dedup, kịch bản trùng webhook, connector chết >5 giờ | GIỮ | Khớp Q-002 (12+ NH, «Tích hợp trong 5 phút» nguyên văn) + Q-006 (7 lần/Fibonacci ~33 phút/5 giờ/30s/8s/dedup id) — đã đối chiếu finding gốc |
| T2-1.2 | `zalooa`: GP ĐKKD, 2–3 ngày làm việc, phí theo loại tin, kịch bản vượt cửa sổ | GIỮ | Khớp Q-004 + Q-005 từng con số; N-09 tôn trọng |
| T2-1.3 | `hddt` 2 đường (cổng CQT miễn phí / NCC công nhận), 2 bước N-06 | GIỮ | Khớp Q-001 (30 ngày) + Q-002 (miễn phí, 15 phút–1 ngày, danh sách NCC «ví dụ: Viettel, VNPT…» — T2 giữ chữ «ví dụ» đúng) |
| T2-1.4 | `cts` đứng TRƯỚC `hddt`/`etax`; cảnh báo hết hạn trước | GIỮ | Sơ đồ tiên quyết đúng [Q-001]; seed `han` + kịch bản chặn phát hành là mô phỏng được |
| T2-1.5 | `etax` = thủ công hai chiều, «mức tối đa của N-06», 0đ có nhãn «không thấy nguồn ghi phí» | GIỮ | Đúng Q-002 «KHÔNG có API thuế mở»; trung thực về số chưa đo |
| T2-1.6 | `ketoan` chỉ DẪN SANG bản miễn phí nhà nước / MISA qua NVKD, nút xuất bộ số liệu | GIỮ | Đúng N-01 + Q-001 (NĐ 20/2026 miễn phí) + Q-002 (NVKD). Nút xuất JSON/CSV còn trả lời THUMOI IV.3 «không khóa dữ liệu» |
| T2-1.7 | `shopee` 3 lớp ai-làm, token 4h/refresh 1 tháng, QNSC publish app ngày 0 | GIỮ / SỬA câu chữ thời điểm | Số đúng [Q-002] và T2 đã cảnh báo nguồn blog (Q-026). Nhưng «hạn chuyển kết nối hợp lệ 27/05/2026» viết như hạn TƯƠNG LAI trong khi hôm nay 20/08/2026 — đã qua 3 tháng. Sửa câu chữ: «từ 27/05/2026 Shopee chỉ nhận kết nối qua Open Platform» (điều kiện đang sống, không phải deadline). Đây đúng là loại lỗi mà hội đồng tỉnh sẽ bắt |
| T2-1.8/1.9 | `tiktok`/`lazada` khuôn Shopee, nhãn THIẾU BẰNG CHỨNG + Q-042 | GIỮ | Trung thực đúng quy ước radar; không bịa điều kiện |
| T2-1.10 | `shipper` gộp; tiền COD về thẳng tài khoản NGÂN HÀNG hộ | GIỮ | Đã verify sm-inbox.js:144-150: COD vào `t.payments` «Tiền thu hộ» tại điểm QR của hộ — không khối tiền nào đi qua OPC. Đúng N-07 |
| T2-1.11 | `pos` kết nối-not-thay-thế; tham chiếu giá KiotViet; nhãn kiểm chứng Q-044 | GIỮ | Trích «Public API self-serve OAuth2» đúng như Q-007 dẫn (De-An dòng 818) và tự mở Q-044 kiểm chứng chính chủ — cách dùng bằng chứng nội bộ đúng trọng lượng |
| T2-1.12 | `booking` hoa hồng 82.500đ ghi «số mô phỏng» | GIỮ | Giá trị trong seed là giả lập — T2 tự nói, tránh tội trình bày như số thật |
| T2-2 | Ma trận chân dung × connector + thứ tự nộp hồ sơ ngày 0 theo lead-time ngược | GIỮ | Logic khớp SUY LUẬN Q-002 (T2 có ghi «lập luận từ»/«suy luận» đúng chỗ). Riêng ô etax CD2/CD3 lệch T1 — xử lý ở mục 2 |
| T2-3 | Bảng ngân sách độ tươi per-connector (chuẩn duy nhất) | GIỮ | Mọi dòng THIẾU có nhãn Q mở — đúng R-A3-04. T4 đã trỏ đây làm nguồn chuẩn, không đặc tả 2 nơi |
| T2-4 | 7 câu radar mới Q-040–Q-046 (đã kiểm không trùng BACKLOG) | GIỮ | Đúng quy trình radar; nhặt vào lịch (mục 5) |

### T3 — Kịch bản 3 chân dung

| Mã | Đề xuất | Verdict | Căn cứ |
|---|---|---|---|
| T3-CD1/2/3 | Toàn bộ kịch bản nhập vai (a)–(e) | GIỮ | Neo seed đúng (đã verify BK-0808-02/420kg/Bà Siu H Blan; TODAY 17/08; MST 3 hộ; kịch bản VAI 2 thế hệ khớp THUMOI I.2). Giá trị lớn nhất của T3 là câu chữ người hộ thật — chuyển thẳng vào UI |
| T3-CD2e | «bến 4,0 + quán 2,34 + homestay 1,1 + lặn 2,75, cộng cả tiền mặt 0,72 = 10,19 triệu» | SỬA | LỖI CỘNG: 4,0+2,34+1,1+2,75 = 10,19 là tổng KHÔNG tính tiền mặt; cộng 0,72 phải = 10,91. Lỗi nhỏ nhưng là đúng kiểu số bị vồ khi trình hội đồng — sửa câu chữ («10,19 triệu qua QR, cộng 0,72 tiền mặt = 10,91») và khi thi công lấy tổng bằng HÀM TÍNH từ kho, không cộng tay |
| T3-CD1d#3 | Nghiệm thu «≥80% SKU hiện sẵn» | SỬA nhẹ | Con số 80% không nhãn — là ngưỡng nghiệm thu tự chọn: gắn [tự đề xuất] |
| T3-(e) | Thời gian ước «~5 phút có cán bộ / ~12–20 phút tự làm» | SỬA nhẹ | Ước mô phỏng chưa nhãn — gắn [tự đề xuất, ước cho demo]; khi thi công đo thật bằng `doneLuc − kichHoatLuc` như T1-3f |
| T3-(g) | 6 nguyên tắc wizard «khác người thiết kế phần mềm» | GIỮ + NÂNG | Toàn bộ GIỮ và nên đổi từ «đề xuất cho T1/T6» thành YÊU CẦU BẮT BUỘC của wizard v4: không hỏi số năm trong 3 câu đầu · 1 chạm vào thứ hộ đã có · tách XIN QUYỀN/ĐĂNG KÝ MỚI · thứ tự = thứ tự niềm tin · thiết kế cho 2 người trong nhà · không cảnh báo pháp lý trước việc đầu tiên. Mỗi nguyên tắc đều có tình huống cụ thể chống đỡ trong (b)/(c)/(d) |

### T4 — Findings vào mockup

| Mã | Đề xuất | Verdict | Căn cứ |
|---|---|---|---|
| T4-#1 | Đồng hồ 30 ngày + hàm `moc30Ngay` quét **quý** lũy kế | SỬA | Ý tưởng GIỮ (đúng lỗi kể-chuyện lớn nhất của v3: CD1 đã vượt mà không còn thẻ nào — đã verify deadlines chỉ hiện khi `sapVuot`). Hai sửa: (1) giả định «kỳ tính thuế = quý» không nhãn — Q-023 (tần suất kỳ kê khai hộ >1 tỷ) đang mở; gắn nhãn «giả định kỳ quý — chờ Q-023» + tham số hoá hàm (quý/năm); (2) T1-3d lại tính mốc bằng `D.periodRange` «kỳ đang mở» — 2 bản 2 hàm, chốt 1 hàm chung (mục 2) |
| T4-#2 | Màn «Độ tươi dữ liệu», nội dung lấy chuẩn T2 | GIỮ | Đóng R-A3-02; T4 không đặc tả lại — không lo 2 nơi lệch |
| T4-#3 | Kịch bản «SePay gửi TRÙNG» + dedup theo id + màn «Trợ lý chạy nền» | GIỮ | Đúng chỗ yếu có thật (đã verify `seq()` sm-inbox.js:187 sinh mã mới mỗi lần bấm — bấm 2 lần = 2 giao dịch, trái at-least-once [Q-006]). Demo 10 giây tốt nhất của cả chiến dịch |
| T4-#4 | Chính sách tin Zalo lộ phí TRƯỚC nút gửi (hàm `cuaSoTin`) | SỬA nhẹ | Số đúng [Q-005]. Bổ sung trọng lượng bằng chứng: cửa sổ 7 ngày là ràng buộc đường TỰ ĐỘNG (OpenAPI) — Q-005 ghi chú gửi thủ công qua OA Manager có thể tới 365 ngày nhưng trang KHÔNG có ngày cập nhật, chỉ «tham khảo». Hiển thị nên là «hết cửa sổ tự động → tin Giao dịch 165đ/tin [Q-005]» chứ không «hết cửa sổ = hết đường», và đừng dựa vào con số 365 ngày cho tới Q-033/034 chốt |
| T4-#5 | Connector chết báo ra tiếng + kịch bản đứt + nút Kiểm tra | GIỮ | R-A3-05 MUST, Q-003 «events will be missed. Not might. Will.»; mô phỏng trọn vòng được trong mockup tĩnh |
| T4-#6 | Dòng «Điều kiện nối · Chờ · Người bấm» lấy thẳng bảng T2 | GIỮ | Không điều tra lại — đúng phân công; không connector nào gợi «OPC bấm thay» |
| T4-#7 | Handler hỏi trạng thái vận hành + nhãn `CHUA_DO` | GIỮ | R-A3-04; «chưa đo — Q-0xx» thay vì bịa |
| T4-#8 | Thuế sàn đã nộp thay: trường payload + tách cột tờ khai | GIỮ | NĐ 117/2025 Đ11 k4 [Q-019, đã xác minh bản ký gốc theo R-A1-06]; chỉ HIỆN số từ payload, không khai thay (N-06) — ranh giới đúng |
| T4-#9 | Bảng giá vs KiotViet vào sm-program.js/index.html (tầng Chương trình) | GIỮ | Số khớp Q-007 từng con (270k/330k/490k, +270k/+375k, +150k, 3 lớp 0đ); không đụng mobile; đúng N-01 (định vị, không đối đầu giá lớp miễn phí) |
| T4-#10 | Giọng nói: ĐỂ-SAU, mô phỏng trung thực + nhãn MÔ PHỎNG | GIỮ có điều kiện | R-A2-05 chỉ SHOULD, nhưng THUMOI IV.4 ghi «hỗ trợ thao tác bằng giọng nói tiếng Việt» trong khối ràng buộc — mức ĐỂ-SAU của mockup chấp nhận được cho v4, song HỒ SƠ nộp tỉnh (THUMOI VI.1) phải nêu đường đi + roadmap, không được im lặng. Giữ nút «Nói thay gõ» kịch bản hoá đúng như T4 vẽ |
| T4-#11 | Thẻ «Sáng nay cần gì» + nhân bản qua Zalo Tư vấn trong cửa sổ 48h | SỬA nhẹ | Không phạm N-09 (đúng loại tin), NHƯNG chưa đặt ngân sách tổng: brief + nhắc hạn + cảnh báo đứt + nhắc nợ cùng ngày có thể vượt 8 tin/48h [Q-005], và CD3 đi vườn cả ngày có ngày không mở OA. Sửa: quy tắc «≤1 tin đẩy/ngày/hộ, mọi việc GOM vào brief, in-app là kênh chính»; tin sắp-to (quá hạn 30 ngày HĐĐT) mới lên loại Giao dịch 165đ — và chi phí đó hiện đúng như T2-1.2 đã làm |
| T4-#12 | Khối «Căn cứ hành vi» vào b2g với nhãn hạn chế phương pháp | GIỮ | Đúng Q-004 kèm «số 2021, khảo sát Facebook ủy quyền, n=999» — không trình bày số cũ như đo đạc mới |

**Sweep 4 câu hỏi soi riêng của đề:**
- **N-06 (ký/khai/nộp thay):** KHÔNG tìm thấy vi phạm trực tiếp — mọi khối «Cách đăng ký» của T2 ghi người bấm cuối = chủ hộ; T1 in tên người bấm trên nút; T4 dòng 4/6/7/11 giữ. Điểm cần chặt thêm: T1-4 «cán bộ xác nhận tay `da_ket_noi`» (xem verdict T1-4) và T2-1.7 publish app Shopee — T2 đã phân định đúng «việc nội bộ kỹ thuật, không phải thay hộ ký».
- **N-07 (giữ tiền):** SẠCH. Kiểm kỹ `shipper` (nơi dễ sa ngã nhất): T2 giữ nguyên payment COD về điểm QR hộ — đúng.
- **II.2 / N-01 (tính phí lớp miễn phí):** SẠCH — T1 giữ `ntqg` «chưa vận hành»; T2 `ketoan` chỉ dẫn sang; T4-#9 định vị «lớp tuân thủ mình cũng để 0đ». Không bản nào đề xuất thu tiền lớp HĐĐT-cổng/CTS-kèm/PM kế toán.
- **IV.4 (không đòi máy tính):** 1 vệt: T1-3d nhánh CTS «đã có token USB → mượn máy tính có cổng, 1 lần». Không phải app đòi máy tính, nhưng phải ĐẢO mặc định: đường ký online không USB [Q-002] là chính, USB token là nhánh phụ có cảnh báo — nếu không hội đọc lướt sẽ thấy «app cần PC».

---

## 2. MÂU THUẪN GIỮA CÁC BẢN + CÁCH HOÀ GIẢI

| # | Cặp | Mâu thuẫn | Hoà giải đề xuất |
|---|---|---|---|
| 1 | T1-3c vs T2-1.5/2 | T1: «kê khai điện tử» BẮT BUỘC cho MỌI hộ (cả CD2, CD3). T2: etax của CD2 = NÊN, CD3 = ĐỂ SAU chờ Q-023 | Tách 2 lớp nghĩa vụ trong OB-3: (i) «tự tính–tự khai sau bỏ thuế khoán — mọi hộ» [Q-001 NQ 198/2025/QH15]; (ii) «chế độ đầy đủ: kê khai điện tử + HĐĐT + CTS — hộ >1 tỷ» [Q-001]. Nhóm BẮT BUỘC của OB-3 chỉ chứa (ii) khi hộ >1 tỷ; mọi hộ thấy (i) ở nhóm NÊN CÓ kèm dòng «mức chi tiết nhóm ≤1 tỷ chờ Q-023». Ma trận T2-2 giữ nguyên làm chuẩn |
| 2 | T1-3d vs T2-1.3/2 + THUMOI III-CD3 | T1 CẤM gửi hồ sơ HĐĐT khi ≤1 tỷ; T2 và đầu bài đều cần CD3 xuất hoá đơn cho khách DN (tự nguyện) | Bỏ cấm. Mặc định «canh ngưỡng»; tín hiệu mở = câu 3 chọn «bán cho nhà hàng, công ty» hoặc nút «khách đòi hoá đơn» (T3-CD3 (c) có sẵn tình huống chị Nga Vĩnh Hiệp). Trên màn luôn ghi «đây là nhu cầu của hộ, không phải luật đòi» — tránh thuyết phục hộ dưới ngưỡng đăng ký thứ chưa cần |
| 3 | T1-3b (câu 4) vs T3-(b)(g) | T1 hỏi doanh thu năm 3 nấc ngay câu 4/5, TRƯỚC khi kết nối nguồn nào; T3: cả 3 nhà không biết con số của chính mình, «không bao giờ hỏi số năm trong 3 câu đầu», «câu doanh thu không xuất hiện khi số nguồn đã nối = 0» | Giữ vị trí câu 4 nhưng đổi DẠNG theo T3: hỏi theo mùa («3 tháng đông khách nhất ước chừng bao nhiêu?») + 3 nấc chỉ là gợi ý + «Không biết» là nút to mặc định (không phán xét); T1 đã có cam kết «app tự theo dõi lũy kế bằng số bán thật» — giữ làm lời mollifier ngay tại câu hỏi. Nghiệm thu thêm của T3: toàn wizard KHÔNG có ô gõ số tiền nào |
| 4 | T1-3b vs T3-(g) | T3 đòi câu «ai trong nhà hay cầm điện thoại nhất?» TRƯỚC mọi câu nghiệp vụ + thiết kế cho 2 người; T1 không có câu này (chỉ lo thêm người SAU onboarding) | Thêm «câu 0» vào OB-1 (chọn người đang cầm máy: chủ hộ / con / bố mẹ / cán bộ) — đúng 1 chạm, không tăng số màn chính; kết quả đặt `traLoi.nguoiLamChinh` chi phối: bố mẹ lớn tuổi → đề xuất mở `Aa` ngay đầu; kế cận → wizard đầy đủ. Đúng THUMOI I.2 (gói trao thế hệ kế cận) |
| 5 | T1-3d vs T4-#1 | Mốc 30 ngày tính 2 cách: T1 dùng `D.periodRange` (kỳ đang mở); T2-1.3 nói «đồng hồ 30 ngày đang chạy»; T4 chế `moc30Ngay` quét quý lũy kế — chưa ai cùng 1 hàm | Một hàm chung `mocVuotNguong(t)` đặt sm-domain, tham số hoá kỳ (mặc định quý, nhãn «giả định — chờ Q-023»); seed v4 ghi THÊM trường `vuotLuc` (mốc vượt thật) cho CD1 thay vì suy ngược từ dòng doanh thu — demo không lệch khi đổi tham số kỳ. T1/T4/T2 cùng gọi hàm này |
| 6 | T1-2.2 vs T2-0 (máy trạng thái) | Cùng 7 tên trạng thái nhưng `dang_dang_ky` khác nghĩa: T1 «hồ sơ ĐÃ gửi hoặc đang xin quyền»; T2 «đang điền/gửi dở» | Chốt nghĩa T2 (đang làm dở). Đã gửi thì chuyển thẳng `cho_duyet` với `hanDuKien` BẮT BUỘC (T1) — như vậy Trạm luôn trả lời được «đang chờ ai tới ngày nào» |
| 7 | T2-3 vs T4-#2 (bảng độ tươi) | Kiểm tra xong: KHÔNG lệch — T4 trỏ T2 làm chuẩn («không đặc tả lại»). Rủi ro duy nhất: T1-3e Trạm không nhắc độ tươi | Đồng bộ thêm: mỗi dòng connector trong Trạm có «cập nhật lần cuối X phút trước» từ `lanDongBoCuoi` (T2-1.1 (c) đã đòi) — một nguồn dữ liệu, hai màn |
| 8 | T1-3e vs T4-#11 (kênh Zalo đẩy) | Cả hai đều đẩy Tư vấn trong cửa sổ nhưng chưa ai đặt NGÂN SÁCH TIN: nhắc onboarding (T1) + brief sáng + nhắc nợ + cảnh báo (T4) cùng tranh 8 tin/48h [Q-005] | Quy tắc chung ghi vào cả hai màn: in-app là kênh chính (chấm đỏ + Trạm); Zalo ≤1 tin/ngày/hộ gom tất cả; loại Giao dịch 165đ chỉ cho việc có hạn pháp lý (đăng ký HĐĐT chờ, hạn kê khai). Chi phí/thuê bao hiện đúng bảng T2-1.2 |

---

## 3. LỖ HỔNG CẢ 4 BẢN CÙNG BỎ SÓT

### (a) Lăng kính cán bộ vận hành khoá 100–150 hộ [THUMOI I.3, V.3]

1. **b2g không có «Sổ trực onboarding».** Hiện trạng b2g (đã soát): bảng IV.7 ba cửa thanh toán per-hộ + khối II.3, V.5, IV.8, IV.2, Sổ kiểm chứng, Tình trạng đường truyền. Tất cả trả lời «trả tiền bao nhiêu», KHÔNG khối nào trả lời «sáng nay tôi phải giải cứu hộ nào». Với vai cán bộ, tôi cần và 4 bản chưa thiết kế: bảng hộ × (bước onboarding đang đứng · hồ sơ chờ AI duyệt · đã chờ/quá `hanDuKien` mấy ngày · mục luật sắp cháy hạn 30 ngày · CTS/token sắp hết hạn · cán bộ phụ trách · lần mở app cuối). May là mockup dùng chung kho localStorage nên b2g đọc được `t.onboarding` — mô phỏng trọn vẹn được, không cần backend. Ranh giới giữ nguyên IV.8: chỉ trạng thái + ngày, không đơn/tin nhắn chi tiết.
2. **Quy trình «giải cứu» hộ kẹt.** T1-3e có «quá hạn → gọi cán bộ» PHÍA HỘ; không bản nào có phía CÁN BỘ: việc-được-giao hôm nay, mức xử lý (nhắc / gọi / hẹn tới tận nơi — đúng IV.6 «cầm tay chỉ việc»), và dấu hiệu hoàn tất. Đề xuất: khối «Việc hôm nay của cán bộ» cạnh Sổ trực, mỗi việc bấm đi thẳng đúng hộ (cơ chế `data-di` sẵn có của mobile — T4-#11 đã dùng).
3. **Định mức nhân sự trên 100 hộ** — THUMOI V.3 hỏi thẳng («định mức nhân sự hỗ trợ tại chỗ trên 100 hộ là bao nhiêu?») và không bản nào trả lời, kể cả bằng mô phỏng. Đề xuất: b2g hiển thị số hộ đang hoạt động / cán bộ (từ `coCanBo`) + phân bố thời gian-tới-việc-đầu-tiên theo cán bộ vs tự làm (từ `viecDauTien` của T1) — hồ sơ đối thoại 22/9–03/10 có số để trả lời câu tư vấn ngược này mà không cần bịa.
4. **Seed cho khoá thật.** Demo b2g với 3–4 tenant không mô phỏng được khoá 150 hộ (bảng trống, không có cảm giác đông, không có cụm kẹt). Đề xuất: seed sinh thêm ~40–60 tenant mô phỏng bằng đúng bộ sinh xác định LCG hiện có (mỗi hộ 1 trạng thái onboarding rải đều máy trạng thái) — chỉ cho b2g, không hiển thị trong mobile.
5. **Đợt rollout:** 150 hộ nộp hồ sơ Zalo OA cùng lúc [Q-004: 2–3 ngày làm việc] → Sổ trực phải nhóm được theo «đợt nộp + ngày dự kiến duyệt» để cán bộ không gọi từng hộ. Không bản nào nhắc hiệu ứng hàng-loạt của lead-time.

### (b) Lăng kính hộ yếu công nghệ nhất

6. **Chế độ `Aa` và onboarding không gặp nhau.** T1 thiết kế wizard cho người «bình thường»; `Aa` chỉ Bán/Tiền/Trợ lý (đã verify mobile.html:849-856). Không bản nào trả lời: (i) máy đang ở chế độ đơn giản mà lần đầu mở app — wizard hiện dạng gì? (ii) bố/mẹ là người cầm máy NGÀY ĐẦU (T3 có tình huống mẹ Bảy, bố Bảo nhưng T1 không mô hình hoá). Đề xuất: nếu câu 0 trả lời «bố mẹ / người lớn tuổi» thì wizard tự rút còn 2 câu (nghề + ai trong nhà giúp phần còn lại), phần còn dở chuyển thành «việc giao người nhà» có thông báo trong app cho kế cận khi họ mở máy — đúng tình huống CD3 «chụp giấy gửi con, tối con bấm tiếp» của T3.
7. **Người không đọc nhanh chữ.** T1 dịch thuật ngữ tốt, nhưng không có phương án đọc-to (audio) câu hỏi — trong khi đối tượng IV.4 là «chủ hộ lớn tuổi». Đề xuất mức mockup: nút «đọc to câu này» (kịch bản hoá + nhãn MÔ PHỎNG như T4-#10 làm cho giọng nói vào) + quy tắc ngôn ngữ của T3-CD3d#5 (nhãn ≤3 âm tiết trong Aa) áp vào toàn bộ câu wizard. Chi phí thấp, bỏ sót là tiếc.

### (c) Bảo mật & vòng đời dữ liệu

8. **Ảnh giấy tờ định danh trong app.** T1-3d (chụp GPKD cho OA, ảnh CCCD bảng kê CD3) nhưng không bản nào nói: ảnh lưu đâu, ai xem được, xoá khi nào. Với khoá 150 hộ, đây là câu ĐẦU TIÊN của Sở Tài chính khi duyệt hồ sơ (IV.8 «tuân thủ đầy đủ quy định bảo vệ dữ liệu cá nhân»). Đề xuất mức mockup: ghi rõ trên màn «ảnh giấy tờ nằm trong máy của hộ, bản gửi đi là bản rút gọn không kèm ảnh gốc»; cán bộ (kể cả Sổ trực b2g) chỉ thấy TRẠNG THÁI hồ sơ, không thấy ảnh.
9. **Hộ rời giữa chừng / rời hẳn.** T1 có `bo_qua_tam` quay lại được và «hộ ngủ đông 90 ngày» — tốt; nhưng không bản nào có màn «hộ kết thúc dùng Chương trình»: xuất toàn bộ + xoá theo yêu cầu (THUMOI IV.3 «khi kết thúc sử dụng» có quyền chuyển nhà cung cấp khác). Nút cuối do chủ hộ bấm (N-06). Màn `dulieu` hiện có là chỗ đứng tự nhiên.

### (d) Lỗ hổng khác

10. **Cam kết uptime/kênh hỗ trợ người (THUMOI IV.5)** đòi «tỷ lệ thời gian hoạt động + thời gian phản hồi kênh hỗ trợ có con người» — 4 bản đều đúng khi không bịa số, nhưng cũng không chuẩn bị CÁCH trả lời. Cần Quang chốt (mục 5, P7) mức dám cam kết; mockup có sẵn khối SLA ở `hoso` để gắn.
11. **QR mã suất in từ b2g (T1-3a) chưa có đặc tả b2g** — xem (a).1: sinh suất, trạng thái sử dụng, ai in — việc vận hành khoá, không phải việc hộ.

---

## 4. TOP-10 CHUNG CUỘC (trộn 4 bản SAU phản biện)

| # | Việc | 1 dòng lý do |
|---|---|---|
| 1 | **Đồng hồ 30 ngày đăng ký HĐĐT** (T4-#1 + T1-3d + T2-1.3, đã hợp nhất hàm `mocVuotNguong` tham số kỳ) | Hậu quả pháp lý duy nhất có sự kiện + thời hạn đo được [Q-001]; CD1 đã vượt mà v3 im lặng là lỗi kể chuyện lớn nhất; demo CD2 sắp vượt là kịch bản đắt nhất của seed |
| 2 | **Wizard nhận diện 6 câu** (T1-3b + câu 0 «ai cầm máy» + doanh thu hỏi theo mùa theo T3, không ô gõ số) | Trái tim của đầu bài CEO; T3 chứng minh bằng 3 gia đình rằng hỏi sai dạng là hỏi vào chỗ hộ bỏ cuộc |
| 3 | **Máy trạng thái 7 mức connector + bỏ auto-noi `batBuoc` + gộp Trạm vào `ketnoi`** (T1-2/7 + T2-0 kèm bảng chuyển id) | Thay cờ giả bằng trạng thái thật; «Đã nối» phải đến từ sự kiện ngoài — nền móng cho mọi mục khác |
| 4 | **Trạm «đang chờ ai — dự kiến ngày nào — quá hạn gọi cán bộ»** (T1-3e + `hanDuKien` bắt buộc + lần-cập-nhật X phút trước) | Làm cho chờ duyệt 2–3 ngày [Q-004] thành việc có chủ, không phải số treo lơ lửng — hộ ngừng tin đúng ở chỗ đó (T3-(g)) |
| 5 | **Màn Độ tươi + kịch bản webhook TRÙNG dedup + «Trợ lý chạy nền»** (T4-#2/#3, bảng chuẩn T2-3) | Đóng R-A3-02 bằng bằng chứng; «bấm 2 lần tiền chỉ cộng 1 lần» là 10 giây demo thuyết phục nhất về idempotency [Q-006·Q-003] |
| 6 | **Chính sách tin Zalo lộ phí trước nút gửi + quy tắc ≤1 tin đẩy/ngày** (T4-#4 + T2-1.2 + hoà giải mục 2.8) | Chỉ bên nào hiện 7 ngày + 55đ/165đ mới chứng minh hiểu vận hành thật [Q-005·N-09]; đồng thời cứu quota cho cả brief sáng |
| 7 | **Thuế sàn đã nộp thay trên đơn + tách cột tờ khai** (T4-#8) | NĐ 117/2025 còn hiệu lực đã xác minh bản ký gốc [Q-019] — không tận dụng là bỏ bằng chứng mua sẵn; không tách là đưa hộ chuẩn bị SAI số phải tự nộp |
| 8 | **Connector chết báo ra tiếng + kịch bản đứt** (T4-#5) | R-A3-05 MUST chưa có gì; «Shopee đứt 2 ngày mà app im lặng» là nỗi sợ thật [Q-003: chết là SẼ XẢY RA] |
| 9 | **Sổ trực onboarding + sinh suất QR trong b2g** (mới của T5, mục 3a) | Không có nó thì khoá 150 hộ [THUMOI I.3] vận hành bằng mắt; đồng thời trả lời được câu định mức nhân sự V.3 bằng số demo |
| 10 | **Bảng giá vs KiotViet + căn cứ hành vi vào tầng hồ sơ** (T4-#9/#12) | Đòn đỡ câu hỏi chắc-từ-của hội đồng «tại sao không lấy 270k có sẵn mọi thứ» [Q-007]; số hành vi dán đúng hạn chế phương pháp [Q-004] |

---

## 5. VIỆC CẦN QUANG CHỐT (hợp nhất T1 Q1–Q8, T2 mục 4, DIGEST 20/08, và của T5 — khử trùng lặp, đánh số lại)

| # | Việc chốt | Đề xuất của phản biện |
|---|---|---|
| P1 | Onboarding chặn tới đâu? (T1-Q1) | Theo T1: không chặn app, chỉ chặn đúng nghiệp vụ liên quan (chưa CTS không phát hành HĐĐT — tự đúng luật [Q-001]); BỔ SUNG: nhóm LUẬT trong OB-3 không có «bỏ qua» hợp lệ (verdict T1-3c) |
| P2 | Seed v4: 3 tenant 3 trạng thái + tenant trắng `cd4-moi`? (T1-Q2) | Làm cả hai như T1 đề xuất; thêm yêu cầu T5-3a.4: sinh 40–60 tenant mô phỏng cho b2g Sổ trực (chỉ b2g thấy) |
| P3 | Mã suất: format `GL26-XXXX-XXXX`, b2g sinh + tra trạng thái? (T1-Q3) | Đồng ý; kèm khối «suất + mã cán bộ + in QR» trong b2g (P6) |
| P4 | Mốc nhắc «sắp 1 tỷ»: từ 80% lũy kế (800tr cho CD2)? (T1-Q4) | 800tr hợp ảnh «sắp» của seed; ghi rõ là lựa chọn sản phẩm chưa có văn bản |
| P5 | Luồng tự mua license ngoài Chương trình: màn giá `P.tinhGia` hay để T khác? (T1-Q5) | Mockup giữ 1 màn giá, không luồng thanh toán (việc chạm tiền cần riêng); nhãn «demo» |
| P6 | Xây «Sổ trực onboarding + việc hôm nay của cán bộ + sinh suất» trong b2g cho v4? (T5-3a) | ĐỀ NGHỊ CÓ — đây là thiếu sốt lớn nhất của cả 4 bản cho khoá 150 hộ; giữ ranh giới IV.8 (chỉ trạng thái + ngày) |
| P7 | Mức cam kết uptime + thời gian phản hồi kênh người cho hồ sơ tỉnh (THUMOI IV.5) | Chọn mức dám hứa (con số nội bộ QNSC quyết — mockup không bịa); mockup gắn vào khối SLA màn `hoso` |
| P8 | MISA / tầng kế toán: giữ ĐỂ SAU mọi chân dung? (T1-Q7) | Đồng ý — đúng N-01; chỉ khi Q-009 (PM nhà nước vận hành) trả lời mới xét lại |
| P9 | Đẩy Zalo OA tới chủ hộ trong mockup: hộp thư in-app hay vẽ màn hình Zalo? (T1-Q6) | Hộp thư in-app (trùng mô hình inbox); kèm quy tắc ≤1 tin/ngày (mục 2.8) |
| P10 | Nhặt câu hỏi radar mới vào lịch: Q-040–Q-046 của T2 + 5 câu THIẾU của T1 (Zalo OA uỷ quyền bên thứ ba · NCC HĐĐT từng nhà · giá SePay eInvoice · hồ sơ CTS hộ KD · điều kiện TikTok/Lazada) (T1-Q8 + T2-4) | Đưa hết vào BACKLOG radar; ưu tiên trước tiên: Zalo-OA-connector (chặn luồng T1 Kiểu 2) và kỳ kê khai hộ (Q-023 có sẵn — quyết định tham số hàm `mocVuotNguong`) |
| P11 | Bảng đối chiếu giá 299k vs KiotViet 270k vào De-An trước khi trình đề án? (DIGEST 20/08 «Cần Quang chốt») | Có — đã có sẵn nguyên liệu T4-#9; đây là câu hỏi chắc chắn của hội đồng [Q-007] |
| P12 | Chính sách ảnh giấy tờ định danh trong app (mức hiển thị mockup + nguyên tắc bản thật) (T5-3c.8) | Chốt câu hiển thị «ảnh nằm trong máy hộ, bản gửi đi là bản rút gọn»; cán bộ/b2g chỉ thấy trạng thái |
| P13 | Màn «kết thúc dùng Chương trình» (xuất + xoá theo yêu cầu hộ, chủ hộ bấm cuối) có vào v4? (T5-3c.9) | Đề xuất có dạng tối giản (dùng nền màn `dulieu`) — trả lời IV.3 «không khóa dữ liệu» trọn vòng đời |

---

*Tự soát: mọi verdict có mã + căn cứ (N-xx / THUMOI mục / Q-00x / R-xx / verify code); không đề xuất mới ngoài phần 3; đã đối chiếu chọn mẫu 7 cụm số về finding gốc (khớp) + 2 lỗi số/câu chữ tìm thấy (T3-CD2e, T2-1.7); không ký tự CJK; chỉ ghi đúng 1 file này.*
