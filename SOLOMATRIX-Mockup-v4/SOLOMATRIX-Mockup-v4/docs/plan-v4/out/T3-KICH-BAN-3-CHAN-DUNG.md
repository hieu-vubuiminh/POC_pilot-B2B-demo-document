# T3 — Kịch bản nhập vai: ba chủ hộ đi qua NGÀY ĐẦU cầm license OPC

*Thế hệ plan-v4 · vai T3 · ngày 20/08/2026 · nguồn: `js/sm-seed-gialai.js` (toàn bộ), `README.md`,
findings Q-001 · Q-002 · Q-004 · Q-005 (kèm Q-006/Q-007 đã trích trong bảng số liệu chiến dịch),
THUMOI.txt mục I.2, II.4, III (3 chân dung + 4 mốc), IV.3–IV.6, IV.8.*

**Cách đọc file này:** mỗi khối là tôi nhập vai chủ hộ / người kế cận của chính hộ đó, kể ngày đầu
cầm license — có gì trong tay, hiểu được gì, kẹt ở đâu, vì sao mà gần bỏ cuộc. Tôi không thiết kế
wizard (T1 lo); mọi chỗ tôi nói «app nên…» chỉ là yêu cầu từ phía người dùng, đề xuất cho T1/T6 gom ở
mục (g). Quy ước nhãn: **[Q-00x]** = finding radar · **[s]** = suy từ seed (`sm-seed-gialai.js`) ·
**[THUMOI x.y]** = đầu bài tỉnh · **[R-xx / N-xx]** = REQUIREMENTS / ANTI-SCOPE · **[tự]** = tự đề xuất
(giả định mô phỏng, chưa có bằng chứng ngoài seed). Tên người, tên khách, số tiền trong file đều lấy
nguyên từ seed hoặc findings — không thêm bớt.

Thời điểm ngày 0 của cả ba hộ: hôm 17/08/2026 (= TODAY của seed [s]) — giữa mùa cao điểm hè ở ven
biển, giữa vụ thu mua ở cao nguyên.

---

## KHỐI CD1 — Hộ Đặc sản Biển Xanh, phường Quy Nhơn (ven biển)

Tôi là chị Trần Thu Hà, 30 tuổi, quản kênh online và làm việc với các khách sạn [s]. Bố là ông Trần
Vám… không, ông Trần Văn Tám 61 tuổi phơi cá, mẹ là bà Nguyễn Thị Bảy 58 tuổi đứng quầy khi tôi đi
giao hàng [s]. Mở app trước mẹ — mẹ chỉ biết nhận tiền QR và chụp ảnh cho khách.

### (a) Ngày 0 có gì trong tay

| Món | Trạng thái | Căn cứ |
|---|---|---|
| Điện thoại thông minh | **CÓ** — nhà 3 máy, tôi và bố mẹ mỗi người một máy; máy bố mẹ chỉ nghe gọi, chụp ảnh | đang chạy 3 gian hàng sàn + nhận đơn Shopee/TikTok [s]; đa số hộ online dùng điện thoại làm thiết bị chính (75%, số 2021, n=999) [Q-004] |
| Zalo cá nhân | **CÓ** — khách đặt hàng nhắn thẳng Zalo cá nhân của tôi (Chị Ngọc hỏi ship Hà Nội, Anh Phú nhà hàng Sao Biển hỏi giữ hàng) [s] | [s] |
| Tài khoản ngân hàng nhận QR | **CÓ** việc nhận: 2 quầy (Quầy đặc sản, Gian hàng chợ đêm) đều thu QR hôm nay, 5 dòng tiền về [s]. Nhưng tk là CÁ NHÂN hay đúng TÊN HỘ — **KHÔNG-RÕ** | THIẾU BẰNG CHỨNG — radar đang để câu hỏi Q-020 (ghi chú tại Q-001) về tài khoản đúng tên; đề xuất câu hỏi radar: «Q-020: quy định nào buộc/không buộc hộ KD nhận thanh toán vào tài khoản đứng tên hộ?» |
| GPKD + MST | **CÓ** — MST 4101234567, giấy ATTP số GL-ATTP-0412/2024 còn hạn đến 05/11/2026, treo tại quầy [s] | [s] |
| Tài khoản sàn TMĐT | **CÓ cả 3**: Shopee, TikTok, Lazada (đơn Shopee đang soạn hàng, đơn TikTok mới về sáng nay) [s] | [s] → ngày đầu chỉ cần **ỦY QUYỀN**, không đăng ký mới [Q-002] |
| Máy tính tiền kết nối CQT | **KHÔNG-RÕ, nghiêng CHƯA** — mọi hoá đơn trong sổ đều lập KHÔNG từ máy tính tiền (`fromPos: false`) [s] | [s]; trong khi nhà tôi đã vượt 1 tỷ (1.020tr 8 tháng [s]) nên thuộc diện HĐĐT khởi tạo từ máy tính tiền kết nối CQT [Q-001] — đây là gap thật của chính hộ, không phải của app |
| Hoá đơn điện tử có mã CQT | **CÓ** — hoá đơn cho 6 khách sạn/nhà hàng đều có mã CQT dạng M2026-… [s] | [s] |
| Chữ ký số | **KHÔNG-RÕ loại, nghiêng CÓ** — nhà đã kê khai Q1+Q2/2026 và phát hành HĐĐT [s], mà hai việc đó cần CTS/chữ ký điện tử [Q-001] | [s]+[Q-001]; USB token hay remote-signing thì không rõ |
| Người trong nhà rành điện thoại hơn | **Tôi** (kế cận 30 tuổi) — đúng độ 25–40 chương trình chọn để trao gói [THUMOI I.2] | [s] |

### (b) Trả lời được câu hỏi nhận diện nào

| Câu wizard dự kiến | Nhà tôi trả lời thế nào | Kẹt ở đâu | Hỏi lại bằng lời nhà tôi hiểu |
|---|---|---|---|
| 1. Ngành nào? | Ngay: «bán đặc sản biển» | Không biết mình rơi vào mục «Đồ ăn, đồ uống và đặc sản» như trong hồ sơ [s] | Cho 3 tấm ảnh ngành (đồ ăn-đặc sản / du lịch / nông sản) — chạm chọn, không gõ |
| 2. Có GPKD/MST chưa? | Tôi trả lời ngay (giấy trong khung kính ở quầy, tôi có chụp ảnh lưu máy — giả định mô phỏng [tự]) | Mẹ thì trả lời «cái giấy trong khung kính đó, con hỏi gì kỳ quá» | «Có cái giấy phép treo tường không? Chụp nó giùm app là xong» — chụp ảnh, không gõ số [tự] |
| 3. Bán qua kênh nào? | Kể ngay: khách sạn, quầy, Shopee | Hay THIẾU 2 kênh: gian hàng chợ đêm chỉ bung mùa cao điểm; và KHÔNG kể Zalo dù khách nhắn đặt hàng đầy [s] | «Khách nào nhắn đặt hàng qua Zalo không?» — rồi cho bấm vào 2 đoạn hội thoại thật trong máy [tự] |
| 4. Doanh thu năm ước (3 nấc)? | **Câu khó nhất.** Nhà đã qua 1 tỷ (1.020tr 8 tháng [s]) nhưng KHÔNG AI BIẾT: tôi biết tiền sàn, mẹ biết tiền quầy, không ai cộng 3 mảng | Đoán 3 nấc thì tôi nghiêng chọn «dưới 1 tỷ» — sai; mà hệ quả là chậm cảnh báo 30 ngày đăng ký HĐĐT máy tính tiền kể từ kỳ vượt ngưỡng [Q-001] | «Tháng nào đông khách nhất? Tháng đó ước bao nhiêu?» — 3–4 câu là tự tính được, đừng hỏi cả năm |
| 5. Có máy tính tiền chưa? | «Máy in bill hả? Có cái máy in cho đơn Shopee» — không hiểu «máy tính tiền» là gì [tự] | Hoá đơn khách sạn đang lập kiểu cũ, không từ máy POS [s] | «Hôm nay xuất hoá đơn cho khách sạn, anh/chị xuất từ đâu, ai gõ?» — rồi app tự kết luận [tự] |

### (c) Kết nối nào CHƯA có tài khoản — phản ứng khi app đề nghị «đăng ký ngay»

- **Webhook tiền về kiểu SePay (biết TIỀN VỀ tức thì): CHƯA có.** Self-serve trong ~vài phút, 12+
  ngân hàng [Q-002]. Phản ứng của tôi: «App này có lấy mật khẩu ngân hàng của em không, nó thấy hết
  số dư à?» — sợ lộ thông tin tiền, sợ bị trừ nhầm. Ai trấn an: cán bộ Tổ công tác ngồi cạnh (chương
  trình cam kết «cầm tay chỉ việc» [THUMOI IV.6]), lời nói: «Nó chỉ ĐỌC tin nhắn tiền về, không động
  vào tiền của nhà mình, không giữ tiền hộ» (đúng N-07). Nút «Đồng ý kết nối» cuối cùng là TAY TÔI
  bấm, không phải cán bộ, không phải app (N-06).
- **Zalo OA xác thực: CHƯA có** — cần GPKD (nhà có sẵn) và Ban quản trị Zalo duyệt 2–3 ngày làm việc
  [Q-004]. Tôi hỏi lại: «Tạo cái này có mất tiền không? Khách quen vẫn nhắn Zalo cá nhân của em thì
  sao?» — phải nói thẳng bảng giá tin: tin Tư vấn free 8 tin/48 giờ rồi 55đ/tin, tin Giao dịch
  165đ/tin, broadcast trần 4 tin/tháng [Q-005] — đừng hứa «Zalo miễn phí vô hạn».
- **Nỗi sợ của MẸ (bà Bảy), không nằm ở một dịch vụ nào:** «Đưa hết lên đó thì thuế biết hết.» Thêm
  nghịch lý nhà tôi đang chịu: sàn đã khấu trừ nộp thay thuế hộ bán trên nền tảng [Q-001·Q-019] mà
  mẹ không hiểu khấu trừ đó là gì. Trấn an không phải bằng lời suông mà bằng dòng chữ trong app:
  dữ liệu chi tiết thuộc về nhà mình, bảng điều khiển chương trình chỉ nhận số tổng hợp [s ghiChuPDPL
  trong META; THUMOI IV.8], và nhà mình xuất được toàn bộ dữ liệu ra mang đi bất cứ lúc nào
  [THUMOI IV.3].

### (d) Điều gì khiến nhà tôi bỏ cuộc + phòng ngừa

| # | Khoảnh khắc | Vì sao bỏ | Phòng ngừa (thiết kế / con người) | Màn đích + nghiệm thu |
|---|---|---|---|---|
| 1 | Mở app trắng tinh, câu thứ ba đã hỏi «doanh thu năm bao nhiêu» | Không biết con số của chính mình + sợ chữ «doanh thu» kéo thuế tới | Không hỏi số tiền trước khi cho thấy được việc gì; doanh thu app tự tính sau khi kéo dữ liệu sàn/QR | wizard của T1 · nghiệm thu: 3 câu đầu tiên không chứa ô nhập số tiền nào |
| 2 | Màn kết nối Shopee hiện ô «nhập mật khẩu Shopee» | Gian hàng sàn là cơm áo của nhà — sợ mất trắng, dừng tay ngay | Ủy quyền qua trang đăng nhập chính chủ của Shopee (tài khoản open.shopee.com của nền tảng + shop ủy quyền [Q-002]), OPC chỉ nhận token, không bao giờ nhận mật khẩu | `ketnoi` · nghiệm thu: luồng kết nối sàn không có ô mật khẩu nào trên màn của OPC (mockup: bảng giả lập trang ủy quyền bên thứ ba) |
| 3 | Bắt lập danh mục 5 món hàng + đơn giá bằng tay trước khi thấy lợi ích gì | Tôi chạy đơn cả ngày, không ngồi gõ bảng giá | Hàng hoá tự nạp từ đơn sàn + hoá đơn cũ đã có, tôi chỉ XÁC NHẬN lại đơn giá từng món | `hanghoa` · nghiệm thu: sau kết nối sàn, ≥80% SKU hiện sẵn với giá để chỉ bấm «đúng» (đo được trong mockup: đếm SKU trong seed xuất hiện tự động) |
| 4 | Ông Tám 61 tuổi được giao «dùng app để quản cả」 | Không theo nổi — chữ nhỏ, từ lạ | Chế độ `Aa` cho bố mẹ (chỉ Bán/Tiền/Trợ lý) + phân quyền VAI: bố mẹ bán và đếm tiền, tôi giữ phần giấy tờ | `phanquyen` + nút `Aa` · nghiệm thu: trong chế độ Aa, một lượt bán hoàn tất trong ≤3 chạm, không có từ «tồn kho/công nợ» nào xuất hiện |
| 5 | App vừa mở đã gắn cờ đỏ «còn thiếu nhãn Cá mắm chưng thịt hộp» | «Cái app mới vào đã mắng nhà mình» — bực, xóa | Cảnh báo pháp lý chỉ xếp hàng SAU khi việc đầu tiên xong, hiển thị theo hạn gần nhất | `tainguyen` · nghiệm thu: trong phiên ngày 0, không quá 1 cảnh báo pháp lý được đẩy |

### (e) Việc-đầu-tiên-xong (R-A2-07)

Với nhà tôi, việc đầu tiên nên là: **THẤY TIỀN VỀ QUẦY HIỆN LÊN TỨC THÌ** — cán bộ hoặc tôi quét một
QR mua nhỏ thật ở quầy (hoặc bấm nút «phát sinh một giao dịch thử») → tiền về → màn TIỀN nhảy số và
thêm dòng mới sáng lên. Tiền về tức thì thuyết phục hơn mọi lời giới thiệu [Q-006: webhook SePay
push xuống, connector dedup theo id/transaction_id — trích bảng Q-002·Q-006]. Nhân tiện màn đó cho tôi
thấy luôn một thứ đau hơn: Khách sạn Hải Âu còn nợ 18.400.000 đồng đã quá hạn từ 05/08 [s CN-01] —
«app đòi tiền giùm mình».

- Mô phỏng mockup tĩnh: bảng giả lập sự kiện NGUON (`sm-inbox`) phát 1 sự kiện webhook tiền về tại
  điểm `q1` → hàng đợi đồng bộ (`sm-core`) rút → màn `tien` thêm 1 dòng, tổng ngày tăng bằng HÀM TÍNH
  từ kho — không viết cứng số nào.
- Thời gian từ mở app đến việc xong: **tự làm ~12–15 phút** (cài app + kết nối QR self-serve ~vài
  phút [Q-002] + 1 giao dịch thử); **có cán bộ ngồi cạnh ~5 phút**.

---

## KHỐI CD2 — Hộ Dịch vụ Du lịch Nhơn Lý, xã Nhơn Lý (ven biển)

Tôi là anh Lê Minh Duy, 27 tuổi, nhận khách qua mạng xã hội và điều phối lịch [s]. Bố là ông Lê Văn
Sáu 55 tuổi quản thuyền, mẹ là bà Phạm Thị Lan 52 tuổi lo bếp [s]. Hôm nay đang cao điểm: 7 đặt chỗ
trong 3 ngày tới, 2 tin Zalo chưa kịp trả [s]. Ai dạy tôi dùng app thì nói nhanh, xong ra bến phụ bố.

### (a) Ngày 0 có gì trong tay

| Món | Trạng thái | Căn cứ |
|---|---|---|
| Điện thoại thông minh | **CÓ** — cái chính của nhà, tôi cầm cả ngày trên bến | nhận khách qua mạng xã hội [s]; 75% hộ online dùng điện thoại làm thiết bị chính (2021) [Q-004] |
| Zalo cá nhân | **CÓ** — kênh khách đặt chính: Chị Thu hỏi chuyến cano mai, Công ty Lữ hành Đất Võ hỏi nhận đoàn 20 khách ngày 22/8 — cả 2 chưa trả lời [s] | [s] |
| Nền tảng đặt phòng | **CÓ ít nhất 1** — có đơn khách đến từ kênh đặt phòng online [s]. THUMOI IV.3 đòi tối thiểu 2 nền tảng với ngành du lịch → **có thể còn thiếu 1**; tên nền tảng cụ thể seed không nêu → KHÔNG-RÕ | [s]+[THUMOI IV.3] |
| Ứng dụng giao đồ ăn | **CÓ dấu vết** — kênh `food` có trong danh sách kênh nhà [s]; mức độ đang chạy gian hàng thật hay chỉ tải về → KHÔNG-RÕ | [s] |
| Ngân hàng + QR | **CÓ** — thu QR ở 4 điểm: bến thuyền, quán ăn, homestay, điểm lặn (8 dòng tiền về hôm nay) [s]. Tài khoản đứng tên cá nhân hay tên hộ: **KHÔNG-RÕ** (như CD1, câu hỏi radar Q-020 tại Q-001) | [s] |
| GPKD + MST | **CÓ** — MST 4101345678 [s] | [s] |
| Máy tính tiền | **KHÔNG-RÕ, nghiêng CHƯA** — hoá đơn cho công ty lữ hành đều `fromPos: false` [s]; khách đoàn cần hoá đơn «ngay tại chỗ» [THUMOI III-CD2] nhưng hiện chưa có gì xuất tại chỗ cả | [s]+[THUMOI III] |
| Chữ ký số | **KHÔNG-RÕ loại, nghiêng CÓ** — đã kê khai Q1+Q2/2026 và phát hành hoá đơn cho 5 công ty [s]; CTS là điều kiện hai việc đó [Q-001] | [s]+[Q-001] |
| Người rành điện thoại | **Tôi** (27) — nhưng ngày 0 của tôi là ngày ĐÚNG CAO ĐIỂM, khác hẳn nhà CD1 [s] | [s] |

### (b) Trả lời được câu hỏi nhận diện nào

| Câu wizard dự kiến | Nhà tôi trả lời thế nào | Kẹt ở đâu | Hỏi lại bằng lời nhà tôi hiểu |
|---|---|---|---|
| 1. Ngành nào? | Ngay: «chạy du lịch» | Chữ «dịch vụ du lịch tổng hợp» trong giấy tờ là chữ của công ty, không phải của tôi [s] | Ảnh 3 ngành, chạm chọn — như CD1 |
| 2. GPKD/MST? | Nhanh — tôi đang cần pháp nhân để ký hợp đồng lữ hành nên thuộc mấy con số này [s] | Ít kẹt nhất trong 3 nhà | «Số trên giấy phép chụp giùm app» |
| 3. Kênh bán? | Kể: khách đoàn công ty, khách Zalo, đặt phòng online, quán | Hay thiếu: tiền quán ăn tại chỗ và không coi app giao đồ ăn là «kênh» | «Quán có nhận đơn qua app giao đồ ăn không?» — có/không một chạm |
| 4. Doanh thu năm ước (3 nấc)? | **Khó nhất với nhà này.** 780tr 8 tháng, ước cả năm 1.243tr [s] — tức SẮP VƯỢT 1 tỷ, mà tôi không biết | Doanh thu mùa vụ chênh lệch lớn [THUMOI III-CD2]: tôi nghĩ «mùa hè trưng, mùa đông ngồi không» — chọn 3 nấc rất dễ trượt giữa «gần 1 tỷ» và «trên 1 tỷ»; trượt là mất cảnh báo 30 ngày đăng ký HĐĐT đúng hạn [Q-001] | «3 tháng mùa vừa rồi thu về chừng bao nhiêu? 3 tháng mùa ngồi không thì bao nhiêu?» — nhân theo mùa, app tự cộng |
| 5. Máy tính tiền? | «Nhà em bán gói, có cái gì đâu mà tính tiền từng món» | Hộ dịch vụ không có khái niệm POS | «Đoàn 20 khách ngày 22/8 cần hoá đơn, hôm nay anh xuất từ đâu, ai gõ?» — đúng tin nhắn đang treo trong máy tôi [s TN2] |

### (c) Kết nối nào CHƯA có tài khoản — phản ứng khi app đề nghị «đăng ký ngay»

- **Nền tảng đặt phòng THỨ HAI: CHƯA có** (IV.3 tối thiểu 2, nhà đang có 1 [s]). Phản ứng của tôi
  gắt gáp nhất ở câu này: «Lên thêm nền tảng nữa thì khách đặt hai nơi CHÙNG NHAU thì chạy sao? Mất
  tiền cọc khách nữa chứ.» Trấn an bằng DEMO trước, đăng ký sau: đặt chỗ chống trùng là ruột của app —
  khung 07:30 Cano 1 ngày 18/08 đã đầy 12/12, tôi thử đặt bị chặn và app chỉ ra khung còn chỗ [s;
  README thao tác 4]. Ai trấn an: cán bộ cầm tay chỉ việc [THUMOI IV.6] tự tay đặt thử trùng cho tôi
  thấy nó chặn. Nút «Đăng ký nền tảng» cuối cùng do TÔI bấm (N-06).
- **Zalo OA xác thực: CHƯA có** — khách hỏi ngoài giờ cần trợ lý trả lời hộ [THUMOI IV.5], OA cần
  GPKD + duyệt 2–3 ngày làm việc [Q-004]. Tôi sợ phí khi nghe tin nhắn có đơn giá 55đ/165đ từng tin
  [Q-005] — cứ nói thẳng, đừng giấu; kèm note trần broadcast 4 tin/tháng [Q-005] để tôi đỡ kỳ vọng
  «gửi thông báo thoải mái».
- **Bố Sáu không phản đối gì cả — bố CHỈ BỎ NGOÀI CUỘC.** «Biết gõ gì đâu con.» Với bố, ngày 0 cần
  đúng một thứ: mở ra thấy LỊCH THUYỀN hôm nay, khách mấy giờ, chỗ nào còn trống — nhìn là hiểu,
  không cần tài khoản riêng [tự].

### (d) Điều gì khiến nhà tôi bỏ cuộc + phòng ngừa

| # | Khoảnh khắc | Vì sao bỏ | Phòng ngừa | Màn đích + nghiệm thu |
|---|---|---|---|---|
| 1 | Ngày 0 đúng cao điểm: 7 đặt chỗ 3 ngày tới + 2 tin Zalo chưa trả [s] — app đòi học 40 phút | Không một phút nào rảnh, đóng app luôn | Wizard có «bản 10 phút»: chỉ tên + quét lịch + 1 kết nối duy nhất; bấm «hẹn làm tiếp hôm thấp điểm» | wizard T1 · nghiệm thu: nhánh rút gọn hoàn tất ≤10 phút, có nút «hẹn gọi lại» thoát được bất cứ lúc nào mà không mất gì |
| 2 | Câu «doanh thu năm ước» hiện quá sớm | Mùa vụ khiến tôi đoán sai nấc → sau này app báo «sắp vượt ngưỡng» lúc tôi tưởng mình dưới → tôi coi app là đồ nói bừa | Chỉ hỏi doanh thu SAU khi đã kéo được ít nhất 1 nguồn thật (đặt phòng/QR); số ước chỉ là gợi ý, app tính lại từ dữ liệu | wizard T1 · nghiệm thu: câu doanh thu không xuất hiện khi số nguồn đã kết nối = 0 |
| 3 | Ngay ngày đầu app giục «lên nền tảng đặt phòng thứ 2» | Sợ trùng đặt, sợ hoa hồng, chưa tin gì đã phải mở tiền | Đảo thứ tự: DEMO chặn trùng trước (đặt thử Cano 1 khung 07:30 đã đầy [s]) — đăng ký nền tảng thứ 2 xếp cuối hàng chờ | `datcho` → `ketnoi` · nghiệm thu: nút kết nối nền tảng đặt phòng chỉ mở SAU màn demo chống trùng |
| 4 | 4 điểm QR về lẫn lộn: tiền mặt quán, chuyển khoản công ty, QR bến — app đòi «gán từng dòng vào điểm nào» | Đối soát tay đã mệt sẵn từ trước app; giờ app còn bắt làm thêm một bước | Màn TIỀN tự hợp nhất theo điểm quét có sẵn trong giao dịch, không có bước gán tay nào | `tien` · nghiệm thu: từ lúc mở app đến thấy tổng 4 điểm, số bước gán tay = 0 |
| 5 | Thông báo nhảy lúc đang chở khách: «Đơn hàng chưa xử lý» kiểu chung chung | Chỉ cần 2–3 tiếng báo sai giờ là tôi tắt thông báo vĩnh viễn | Cảnh báo bám đúng 2 tin Zalo chưa trả và đúng khung giờ nhận khách, không bắn thông báo «định kỳ» | `hoithoai`/`hopthu` · nghiệm thu: cảnh báo đầu tiên tôi nhận được trùng đúng 1 trong 2 tin chưa trả lời trong seed (kiểm đếm được trong bảng cảnh báo mockup) |

### (e) Việc-đầu-tiên-xong (R-A2-07)

Việc đầu tiên nên là: **MỞ MÀN TIỀN, THẤY 4 ĐIỂM HỢP NHẤT** — hôm nay bến thuyền 4,0 triệu, quán ăn
2,34 triệu, homestay 1,1 triệu, điểm lặn 2,75 triệu, cộng cả tiền mặt 0,72 triệu = 10,19 triệu trong
một màn hình, tách theo từng điểm [s: tổng 8 dòng payments hôm nay — đúng yêu cầu hợp nhất thời gian
thực của THUMOI III-CD2]. Chưa từng có ngày nào nhà tôi nói được con số đó trước 9 giờ tối. Kèm
trong 5 phút sau đó: TÔI THỬ ĐẶT TRÙNG Cano 1 khung 07:30 ngày 18/08 và thấy nó chặn + chỉ khung
còn chỗ [s] — lần đầu tiên «cái sổ tay» của tôi tự canh được.

- Mô phỏng mockup tĩnh: bảng giả lập sự kiện NGUON phát 8 giao dịch QR đánh dấu điểm `q1–q4` trong
  ngày → màn `tien` nhóm theo điểm bằng hàm tính; màn `datcho` dựng sẵn vụ 18/08 đầy 12/12 từ seed.
- Thời gian từ mở app đến việc xong: **tự làm ~10–12 phút**; **có cán bộ ngồi cạnh ~5 phút** — và
  với nhà tôi, mùa cao điểm thì gần như PHẢI có cán bộ (IV.6), tự làm là không có giờ.

---

## KHỐI CD3 — Hộ Nông sản Chư Păh, xã Chư Păh (cao nguyên)

Tôi là anh Nguyễn Thành Bình, 32 tuổi, thu mua tại vườn và bán hàng trực tuyến [s]. Bố là ông Nguyễn
Văn Bảo 60 tuổi, sơ chế, phơi sấy, cân hàng tại kho [s]. Ban ngày tôi chạy vườn, tối mới ngồi vào
điện thoại; sóng trên này lúc có lúc không — đơn live tối 16/08 vẫn còn chưa đồng bộ [s].

### (a) Ngày 0 có gì trong tay

| Món | Trạng thái | Căn cứ |
|---|---|---|
| Điện thoại thông minh | **CÓ** — nhưng dùng ở nơi sóng yếu: đơn live tối 16/08 vẫn treo «chưa đồng bộ» [s]; điều kiện miền núi là ràng buộc của đầu bài [THUMOI II.4, IV.4] | [s]+[THUMOI] |
| Zalo cá nhân | **CÓ** — khách nhắn hỏi giá cà phê, mắc ca đủ thứ (3 tin, 2 chưa trả) [s] | [s] |
| Tài khoản sàn | **CÓ 2**: Shopee, TikTok (đơn Shopee, đơn live TikTok đều có) [s] → ngày đầu là ỦY QUYỀN, không đăng ký mới [Q-002] | [s] |
| Bán qua phát trực tiếp (live) | **CÓ** — kênh `live` với đơn «phát trực tiếp tối 16/08» [s] | [s] |
| Ngân hàng | **Nửa vời** — có thu QR tại kho thu mua (1 dòng hôm nay) [s], nhưng tiền THU MUA nông dân chủ yếu TIỀN MẶT từng chuyến (bảng kê thu mua 21–69 triệu/chuyến) [s]. Tài khoản đúng tên hộ: **KHÔNG-RÕ** (Q-020) | [s] |
| GPKD + MST | **CÓ** — MST 4101456789 [s] | [s] |
| Máy tính tiền | **KHÔNG-RÕ, nghiêng CHƯA** — hoá đơn bán doanh nghiệp `fromPos: false` [s]; nhà dưới ngưỡng (607tr [s]) nên chưa bị buộc máy tính tiền [Q-001] | [s]+[Q-001] |
| Chữ ký số | **KHÔNG-RÕ, nghiêng CHƯA trong 3 nhà** — sổ kê khai chỉ bắt đầu từ Q2/2026 (không có Q1) [s]; khả năng nhà mới chuyển sang kê khai điện tử gần đây — không rõ lý do Q1 vắng, ghi trung thực là không rõ | [s]; CTS là điều kiện của kê khai điện tử + phát hành HĐĐT [Q-001] |
| Người rành điện thoại | **Tôi** (32) — nhưng ngày 0 tôi đi vườn cả ngày; ở kho chỉ có bố Bảo 60 [s] | [s] |

### (b) Trả lời được câu hỏi nhận diện nào

| Câu wizard dự kiến | Nhà tôi trả lời thế nào | Kẹt ở đâu | Hỏi lại bằng lời nhà tôi hiểu |
|---|---|---|---|
| 1. Ngành nào? | Ngay: «mua cà phê, mắc ca» | Chữ «nông sản đặc sản» là chữ hồ sơ [s] | Ảnh 3 ngành, chạm chọn |
| 2. GPKD/MST? | Tôi biết số (đang làm với 4 công ty) [s]; bố không nhớ | Bố ở kho một mình ban ngày — wizard mà chỉ hỏi được bố là xong | «Chụp giấy phép gửi con — tối con bấm tiếp» (phiên chuyển giao trong nhà) [tự] |
| 3. Kênh bán? | Kể: công ty, Shopee, live tối | Hay thiếu Zalo lẻ (Chị Hồng Đà Nẵng mua 5kg mắc ca qua Zalo) [s] — không coi là kênh | «Có khách nhắn Zalo mua lẻ không?» — bấm vào hội thoại thật |
| 4. Doanh thu năm ước (3 nấc)? | Trả lời KHIÊM TỐN: «làm ăn có sấp vốn đâu mà tỷ» — nhà thực ra 607tr [s] | Tôi nghĩ theo LÃI MỖI TẤN, không theo DOANH THU; 3 nấc dễ chọn nhầm vì trong đầu tôi «doanh thu» = «tiền về trừ tiền mua» | «Mỗi tuần tải về kho bao nhiêu tấn? Bán ra chừng nào một ký?» — app tự nhân từ bảng kê + đơn |
| 5. Máy tính tiền? | «Kho cân tạ, cần gì cái máy đó» | Không hiểu từ; hoá đơn công ty đang ai đó gõ giúp ngoài app [s] | «Bán cho công ty Vĩnh Hiệp, hoá đơn ai soạn, gửi qua đâu?» [s HD-2608-901] |

### (c) Kết nối nào CHƯA có tài khoản — phản ứng khi app đề nghị «đăng ký ngay»

- **Webhook tiền về kiểu SePay: CHƯA có** (self-serve ~vài phút, 12+ ngân hàng [Q-002]). Phản ứng
  của tôi là gắt nhất trong 3 nhà: «Tiền mua cà phê của bà con đưa tay từng bó, đưa hết lên app thì
  chị Thuế thấy hết à?» — nỗi sợ LỘ TIỀN MẶT thu mua là thật. Ai trấn an: cán bộ Tổ công tác [THUMOI
  IV.6], bằng 3 câu có kiểm chứng được: (1) dữ liệu chi tiết thuộc về nhà tôi, chương trình chỉ nhận
  số tổng hợp [s META ghiChuPDPL; THUMOI IV.8]; (2) tôi xuất toàn bộ dữ liệu ra mang đi bất cứ lúc
  nào, không bị khóa [THUMOI IV.3]; (3) OPC không kê khai thay ai bao giờ — mọi nút gửi ra cơ quan
  thuế là TAY NGƯỜI bấm (N-06), và kết nối ngân hàng phục vụ thấy TIỀN VỀ BÁN LẺ, không sinh nghĩa vụ
  thuế mới — nghĩa vụ đã do luật định theo hoá đơn/dữ liệu giao dịch [Q-001].
- **Zalo OA xác thực: CHƯA có** — khách lẻ hỏi giá đầy trong máy [s]; cần GPKD + duyệt 2–3 ngày làm
  việc [Q-004]; nói thẳng phí tin 55đ/165đ [Q-005].
- **Sàn mới: KHÔNG cần** — Shopee/TikTok đã có [s]. Danh mục tối thiểu của app (`ketnoi`, «danh mục
  tối thiểu» ở mobile.html:836) phải tự hiểu nhà tôi đã đạt phần sàn; chuyện còn thiếu của nhà tôi
  không nằm ở sàn — nằm ở CHỨNG TỪ ĐẦU VÀO: 2/5 bảng kê tuần này thiếu giấy tờ (chuyến Chanh dây
  14/08 không có số CCCD, không chụp biên nhận; chuyến 16/08 của ông Kpă Thanh thiếu địa chỉ, thiếu
  ký nhận) [s].

### (d) Điều gì khiến nhà tôi bỏ cuộc + phòng ngừa

| # | Khoảnh khắc | Vì sao bỏ | Phòng ngừa | Màn đích + nghiệm thu |
|---|---|---|---|---|
| 1 | Ngay đầu app bắt lập danh mục hàng hoá + đơn giá bằng tay | Tôi đi vườn cả ngày — không gõ; bỏ dở ngay màn 2 | Danh mục nạp từ đơn sàn + bảng kê thu mua (món nào mua nhiều lần thành mặt hàng), tôi chỉ cân lại đơn giá | `hanghoa` · nghiệm thu: từ mở app đến xong việc đầu tiên, số lần mở bàn phím để nhập SKU = 0 |
| 2 | Bảng kê đòi số CCCD + ký nhận từng nông dân | Nông dân chở cà phê tới không ai mang theo CCCD, chương tôi ghi lười — đúng 2 chuyến tuần này thiếu [s] — rồi cảnh báo đỏ treo thường trực, tôi quen mắt bỏ qua | Offline-first (chuyến 08/08 ghi OFFLINE vẫn đạt vì đủ giấy tờ [s]); ảnh biên nhận thay txt; trạng thái «bổ sung sau» là chính thức, mỗi dòng thiếu nhắc đúng 1 lần | `nhapkho`/`mua` · nghiệm thu: dòng offline đủ giấy tờ KHÔNG mang cảnh báo; dòng thiếu hiện đúng 1 nhắc không lặp lại |
| 3 | Cảm giác «đưa hết lên app = tự tống hồ sơ cho thuế» | Tôi dùng app cho bán lẻ nhưng giấu mảng thu mua → dữ liệu nửa vời → thấy không hơn sổ tay → bỏ hẳn | Công khai ranh giới ngay màn đầu: OPC không khai thay (N-06), dữ liệu của tôi là của tôi, nút xuất JSON/CSV ngay trong app (`sm-core` đã có xuất toàn bộ) | `ketnoi` + nút xuất dữ liệu · nghiệm thu: mọi màn có hành động gửi ra ngoài đều kèm dòng «chính anh bấm gửi» |
| 4 | Buổi live tối, sóng yếu trên Chư Păh, đơn không vào | Nghĩ «app hỏng» — xóa sau 2 buổi live thất bại | Hàng đợi offline: bán/kháâu vẫn xong khi mất mạng, tự rút khi có sóng (README thao tác 1); demo MẤT MẠNG ngay ngày đầu để tôi thấy nhánh này trước khi gặp thật | `ban` + hàng đợi `sm-core` · nghiệm thu: bật chế độ máy bay vẫn hoàn tất 1 lượt bán + 1 dòng bảng kê, hàng đợi tăng, tắt máy bay tự rút |
| 5 | Bố Bảo 60 tuổi ở kho một mình, màn hình toàn «tồn kho / công nợ / doanh thu» | Không hiểu từ — không dám bấm — cân xong vẫn ghi giấy như cũ | Chế độ `Aa` với từ vựng đời thường: «Cân hàng», «Tiền», «Trợ lý»; tôi làm phần còn lại buổi tối | `Aa` · nghiệm thu: mọi nhãn màn trong Aa ≤3 âm tiết, không chứa «tồn kho/công nợ/doanh thu» |

### (e) Việc-đầu-tiên-xong (R-A2-07)

Việc đầu tiên nên là: **GHI 1 DÒNG BẢNG KÊ TỐI QUA — APP TRẢ LẠI MÃ TRUY XUẤT LÔ.** Chuyến 08/08 mua
420kg của bà Siu H Blan, tôi chụp biên nhận, gõ 3 ô (ai bán, bao nhiêu ký, bao nhiêu tiền) [s
BK-0808-02] → kho hiện lô mới → app sinh mã truy xuất; bấm «Truy xuất» trên hoá đơn bán Công ty
Vĩnh Hiệp thì ra tận vườn: lô nào của ông Rơ Chăm Hlum làng Kép, lô nào của bà Siu H Blan xã Ia Ka,
kèm bảng kê gốc [s HD-2608-901]. Việc tôi vẫn làm mỗi tối bỗng sinh ra đúng thứ công ty đang hỏi —
tin nhắn của chị Nga (Vĩnh Hiệp): «lô giao tuần sau có giấy truy xuất không em» vẫn chưa trả lời
[s TN2] — giờ tôi trả lời được BẰNG VẼ, không phải lời hứa.

- Mô phỏng mockup tĩnh: giữ nguyên dòng bảng kê + lô từ seed; thêm 1 dòng bảng kê «mới ghi» vào kho
  giả lập (bảng sự kiện NGUON hoặc thao tác thật trong mockup) → lô xuất hiện trong `kho`, mã truy
  xuất sinh bằng hàm từ chuỗi lô — không viết cứng.
- Thời gian từ mở app đến việc xong: **tự làm ~15–20 phút** (sóng yếu, cài lại 1 lần); **có cán bộ
  ngồi cạnh ~8–10 phút** — nên hẹn CANH TỐI khi tôi hết chạy vườn [tự].

---

## KHỐI TỔNG

### (f) Khác biệt cốt lõi giữa 3 chân dung ảnh hưởng onboarding (≤8 dòng)

| # | Chiều | CD1 Biển Xanh | CD2 Nhơn Lý | CD3 Chư Păh |
|---|---|---|---|---|
| 1 | Ngưỡng 1 tỷ [s] | ĐÃ vượt (1.020tr) — việc là gấp | SẮP vượt (780tr, ước 1.243tr) — việc là biết trước | Dưới xa (607tr) — việc không nằm ở ngưỡng |
| 2 | Tài sản số ngày 0 [s] | 3 sàn + QR 2 quầy + HĐĐT b2b có mã | 1 nền tảng đặt phòng + app đồ ăn + QR 4 điểm | 2 sàn + live + QR 1 kho + bảng kê giấy |
| 3 | Nút xoay onboarding | Công nợ khách sạn + tồn kho 3 kênh [THUMOI III-CD1] | Chống trùng chỗ + hợp nhất tiền 4 điểm [THUMOI III-CD2] | Chứng từ đầu vào nông dân + truy xuất lô [THUMOI III-CD3] |
| 4 | Người sống ngày 0 | Con gái 30 — bố mẹ đứng quầy [s] | Con trai 27 — bố trên biển cả ngày [s] | Con trai 32 — đi vườn ban ngày, bố ở kho [s] |
| 5 | Câu wizard khó nhất | Doanh thu: không ai cộng 3 kênh | Doanh thu: mùa vụ đánh lừa | Doanh thu: nghĩ theo lãi, không theo doanh thu |
| 6 | Sợ nhất khi kết nối | Mất gian hàng sàn (nhập mật khẩu) | Trùng đặt giữa 2 nền tảng | Lộ dòng tiền mặt thu mua |
| 7 | Việc-đầu-tiên thuyết phục | Tiền về quầy tức thì + công nợ quá hạn hiện lên | 4 điểm tiền hợp nhất + xem app chặn đặt trùng | Bảng kê tối qua → mã truy xuất lô trả lời được khách DN |
| 8 | Bối cảnh ngày 0 | Sau cao điểm, có giờ ngồi | ĐÚNG cao điểm, không có giờ | Giữa vụ thu mua, sóng yếu, làm buổi tối |

### (g) Đề xuất cho T1/T6 — wizard phải làm khác đi so với «người thiết kế phần mềm» thông thường

- **Không bao giờ hỏi số tiền năm trong 3 câu đầu** — cả 3 nhà đều KHÔNG biết con số của chính mình,
  mỗi nhà sai một kiểu (không cộng / bị mùa vụ lừa / nghĩ theo lãi). Hỏi theo mùa hoặc theo tuần,
  rồi app tự tính từ dữ liệu kéo về; con số hộ tự gõ là mỏ sai và là cội nguồn sợ thuế [tự, từ (b)
  cả 3 khối].
- **Mọi câu nhận diện phải trả được bằng MỘT LẦN CHẠM vào thứ hộ đã có** — ảnh giấy phép treo tường,
  gian hàng sàn, đoạn hội thoại Zalo, hoá đơn cũ. Cấm ô nhập tay cho thông tin lẽ ra tự chảy vào
  (đúng quy tắc mockup của Quang; T3 xác nhận từ phía hộ: chỗ nào bắt gõ là chỗ nhà đó bỏ).
- **Tách bạch XIN QUYỀN và ĐĂNG KÝ MỚI ngay trên giao diện**: sàn/đặt phòng là XIN QUYỀN (hộ đã có
  tài khoản → ủy quyền qua trang chính chủ, không ô mật khẩu nào của OPC [Q-002]); OA Zalo/webhook
  tiền về là ĐĂNG KÝ MỚI — luồng này phải ghi rõ AI BẤM NÚT CUỐI (luôn là người hộ, N-06) và CHỜ BAO
  LÂU (Zalo OA duyệt 2–3 ngày làm việc [Q-004]; webhook tiền về tự phục vụ ~vài phút [Q-002]).
- **Thứ tự kết nối = thứ tự niềm tin, không phải thứ tự kiến trúc**: tiền về tức thì → đơn sàn →
  chống trùng/đặt chỗ → hoá đơn/kê khai (khớp bản đồ lead-time Q-002). Mỗi kết nối xong phải ĐỔ VÀO
  một màn cụ thể ngay trong phiên (TIỀN thêm dòng, ĐƠN thêm tab) — trạng thái «đã kết nối» treo lơ
  lửng là chỗ hộ ngừng tin.
- **Thiết kế cho HAI người trong một nhà, không phải một**: wizard phải hỏi «trong nhà ai hay cầm
  điện thoại nhất?» TRƯỚC mọi câu nghiệp vụ, rồi mới tới «ai đứng quầy/kho ban ngày?» — kế cận
  25–40 làm onboarding đầy đủ [THUMOI I.2], bố mẹ lớn tuổi vào chế độ `Aa` (Bán/Tiền/Trợ lý) với từ
  vựng ≤3 âm tiết, không «tồn kho/công nợ/doanh thu».
- **Ngày 0 không đẩy cảnh báo pháp lý trước khi việc đầu tiên xong** — thiếu nhãn (CD1), sắp vượt
  ngưỡng (CD2), bảng kê thiếu CCCD (CD3) đều là thật [s] nhưng nhận cảnh báo trước niềm tin = bị coi
  là «app vào nhà đã mắng». Đúng tinh thần R-A2-07: đo bằng thời gian tới việc-đầu-tiên-xong, không
  phải số tính năng đã bật.

---

*Kiểm soát chất lượng T3: 3 khối × 5 mục (a–e) + khối tổng 2 mục (f–g) = 17 mục chính · mọi số kèm
nhãn [Q-00x]/[s]/[THUMOI]/[tự] · tên người/tên khách/số tiền lấy nguyên từ seed · không ký tự CJK.*
