# W0 — PHẢN BIỆN TOÀN BỘ CÂU HỎI, TỪ VAI NGƯỜI MÙ CÔNG NGHỆ

*Ngày 20/08/2026 · nguồn đối chiếu: `PLAN-V4.md` mục B + C.14–C.15 + G · `CHOT-P1-P13.md` ·
`out/T3-KICH-BAN-3-CHAN-DUNG.md` · `js/sm-seed-gialai.js` (tên người, số liệu chỉ lấy từ đây).*

Ba vai nhập theo lượt, xuyên suốt: **bà Nguyễn Thị Bảy** (58, chủ hộ CD1, đứng quầy, ít chữ, sợ bấm
nhầm mất tiền — seed `chuHo` CD1) · **ông Lê Văn Sáu** (55, chủ hộ CD2, quản thuyền, nóng tính, không
kiên nhẫn — seed `chuHo` CD2) · **cán bộ địa bàn dẫn 20 hộ** (ít thời gian cho từng hộ). Mọi trích dẫn
trong ngoặc kép «…» là nguyên văn PLAN/kịch bản; mọi đề xuất chỉ để Claude cân nhắc — W0 không sửa code.

---

## 1. Phản biện 13 chốt P

| P | Chốt | Phán đoán | Vì sao (từ 3 vai) + đề xuất |
|---|---|---|---|
| P1 | Không chặn app, chỉ chặn nghiệp vụ | **ĐỒNG Ý, bổ «thấy gì đầu tiên»** | Hỏi đúng câu đề: bà Bảy bấm «Để sau, vào dùng trước» → nghiệm thu B.5 ghi «vào thẳng tab Bán» — nhưng tenant trắng `cd4-moi` chưa có đơn/tiền/tin nào, tab Bán là MÀN TRỐNG. Với người sợ máy, màn trống = «app hỏng» = gỡ. Đề xuất: tab Bán tenant trắng luôn có 1 thẻ chào «Máy chưa biết nhà mình bán gì — 5 phút khai cho app biết, hoặc bấm thử 1 đơn làm quen» (đường vào lại không bao giờ biến mất). |
| P2 | 4 tenant + 48 hộ mô phỏng cho b2g | **ĐỒNG Ý** | Hộ không thấy 48 hộ mô phỏng (đúng ranh giới IV.8); 3 trạng thái seed cho phép cả 3 vai đi hết đường mà không cần dựng dữ liệu tay. Không có gì phản đối. |
| P3 | Mã `GL26-XXXX-XXXX`, QR chính, gõ tay dự phòng | **ĐỒNG Ý, sửa gõ tay** | 12 ký tự có dấu gạch + chữ hoa là bẫy với bà Bảy (bàn phím thường lowercase, bà không biết có phân biệt hoa/thường). Đề xuất: ô gõ hiện sẵn phần «GL26-» cố định, hộ chỉ gõ 8 ký tự sau; hoặc nhận cả dán (paste). QR sai 3 lần → «Gọi cán bộ hỗ trợ địa bàn» (B.13 #2) — giữ nguyên, đó là đường thoát đúng. |
| P4 | Mốc «sắp 1 tỷ» = 800tr lũy kế, nhãn «lựa chọn sản phẩm» | **ĐỒNG Ý số, BÁC chữ «sắp tới ngưỡng»** | Ông Sáu không biết «ngưỡng» là gì, càng không biết «lũy kế». Và T3 chứng minh cả 3 nhà ĐỀU KHÔNG BIẾT con số của chính mình — hiện «800 triệu» ra màn là nói chuyện với người không có con số. Đề xuất hiển thị: «Theo cách bán hiện nay, cuối năm nhà mình có thể phải dùng hoá đơn điện tử — app canh giùm, tới lúc cần sẽ báo trước 30 ngày». Số 800tr chỉ nằm trong khối «cài đặt nâng cao»/nguồn màn hình. |
| P5 | Tự mua = 1 màn giá demo, không thanh toán | **ĐỒNG Ý** | Không chạm tiền là đúng ranh giới; ai tự mua được license là người đã rảnh app hơn mặt bằng chung — 1 màn giá là đủ, đừng vẽ wizard thanh toán làm nặng. |
| P6 | Sổ trực onboarding trong b2g | **ĐỒNG Ý** | Đúng «hộ mù công nghệ sống được là nhờ cán bộ thấy ai đang kẹt». Đặt tên đích: Sổ trực phải chạy được trên ĐIỆN THOẠI cán bộ — cán bộ ở ngoài địa bàn cả ngày, không ai cầm laptop đi thăm hộ (chi tiết còn thiếu, xem mục 4-C1). |
| P7 | Giữ treo con số uptime cho Quang | **ĐỒNG Ý** | Mockup không bịa — đúng luật. Chỉ chú ý: SLA «15 phút/2 giờ» của sm-ai là chuyện vận hành QNSC; đừng để chữ «SLA» xuất hiện trên màn hộ (thuật ngữ), chỉ nói «Gửi tin cho người thật — trả lời trong X phút». |
| P8 | MISA/tầng kế toán để sau | **ĐỒNG Ý** | Với CD1 (nhà đã dùng MISA cho khách sạn), «ĐỂ SAU» trên màn phải kèm 1 câu đời thường: «Nhà mình đang dùng MISA — OPC không thay nó; phần nối sang nhau đang kiểm tra, xong sẽ báo» (đúng trạng thái chưa có bằng chứng Q-021 — không hứa). |
| P9 | Hộp thư in-app + ≤1 tin/ngày/hộ | **ĐỒNG Ý** | Quy tắc ≤1 tin là điều kiện sống (bà Bảy nhận 2 tin một sáng là tắt thông báo vĩnh viễn). Nhãn màn hộ phải là «Thư của app» — chữ «hộp thư»/«inbox» đừng để lộ. |
| P10 | 8 câu radar vào backlog | **ĐỒNG Ý** | Việc kỹ thuật sau màn hình, không ảnh hưởng trực tiếp 3 vai trong bản demo. |
| P11 | Giữ treo phần đề án; bảng giá vs KiotViet làm ngay | **ĐỒNG Ý** | Bảng so nằm ở `index.html` (web hồ sơ) — đúng chỗ, không làm màn mobile hộ nặng thêm. |
| P12 | «ảnh nằm trong máy của hộ; bản gửi đi là bản rút gọn không kèm ảnh gốc» | **ĐỒNG Ý, thêm 1 câu quê** | Câu chốt đúng nghĩa nhưng «bản rút gọn» vẫn là tiếng kỹ thuật. Đề xuất hiển thị 2 câu: giữ câu chuẩn trên + lời giải thích: «Ảnh cô chụp chỉ nằm trong máy của cô. Gửi đi chỉ là tin "đã có giấy", không gửi tấm ảnh.» |
| P13 | Màn «Tạm dừng dùng OPC» tối giản | **ĐỒNG Ý, BÁC chi tiết «gõ XOÁ»** | Vào dễ ra cũng dễ — đúng tinh thần. Nhưng bước (3) «confirm 2 lần + gõ chữ «XOÁ»» tự mâu thuẫn với người ít chữ: «XOÁ» chứa chữ Á CÓ DẤU — bà Bảy tìm dấu sắc trên bàn phím là bị chặn không cho RA. Đề xuất thay bằng «bấm và GIỮ nút xoá 5 giây, có thanh chạy» — an toàn ngang nhau, không cần gõ. Bốn bước còn lại giữ nguyên. |

---

## 2. Phản biện TỪNG câu wizard (6 câu — phần quan trọng nhất)

### Câu 0 (OB-1): «Trong nhà ai hay cầm điện thoại nhất?»

- **(a) Đọc to bằng tai bà Bảy:** hiểu được — câu đời thường. NHƯNG đáp án «chủ hộ / con / bố mẹ / cán
  bộ» là 4 KHÁI NIỆM, bà phải dịch «mình là chủ hộ» — trong lúc bà chính là người cầm máy. Chọn
  «chủ hộ» (đúng mặt chữ) → wizard đầy đủ 5 câu — trao bản nặng nhất cho tay người yếu nhất của cả
  thiết kế. Đây là lỗ hổng logic của câu hỏi, không phải câu chữ.
- **(b) Thuật ngữ trá hình:** «cán bộ» xuất hiện trong 4 đáp án khi hộ mới mở app lần đầu chưa quen
  ai — chấp nhận được (câu OB-1 đã nhắc «cán bộ ngồi cạnh» trước đó), nhưng chỉ đúng khi cán bộ có
  mặt; hộ tự tải thì đáp án này gây thắc mắc «cán bộ nào?».
- **(c) Đề xuất viết lại (≤2 dòng):** «Máy này ai hay dùng nhất?» — đáp án là TÊN người lấy từ hồ sơ
  nhà: «Bà Nguyễn Thị Bảy — chủ hộ» · «Chị Trần Thu Hà — con» · «Cán bộ». Chọn xong hỏi thêm 1 câu
  phụ đúng 1 chạm: «Cô tự bấm được không, hay để tối cháu bấm giúp?» — trả lời «để cháu» thì rút gọn
  bất kể vai trò.
- **(d) Trả lời sai:** chọn «con» mà con không có máy/app — phần còn dở thành «việc giao người nhà»
  nhưng PLAN chỉ ghi «thông báo trong app cho kế cận khi họ mở máy»: nếu cháu chưa từng cài app,
  việc nằm chờ mãi không ai thấy. Đề xuất: khi chọn «con», app hiện «Tối nay đưa máy này (hoặc máy
  cháu cài app) cho cháu bấm nốt — app để sẵn việc» + dòng nhắc cách gửi việc qua Zalo thường. Sửa
  lại lựa chọn sai: nút «Đổi người bấm» phải có ở đầu MỌI màn còn lại của wizard (hiện chỉ có đường
  onboarding-lại B.12 — quá xa để sửa một câu chọn nhầm).

### Câu 1 — Nghề: «Hộ mình làm nghề gì?»

- **(a) Tai bà Bảy/ông Sáu:** «Hộ mình» là chữ hồ sơ — nhà mình. Ba tấm ảnh là hình thức đúng nhất
  trong cả wizard (1 chạm, không đọc nhiều). Trả lời nổi 1 chạm: CÓ.
- **(b) Thuật ngữ trá hình:** «Du lịch: ăn uống, nghỉ, tour» — «tour» là tiếng nước ngoài, ông Sáu
  nói «đón khách», «chạy thuyền», không nói «tour». «Nông sản: thu mua, sơ chế» — «sơ chế» là chữ
  giấy phép (chấp nhận, vì anh Bình CD3 dùng nó thật).
- **(c) Viết lại:** «Nhà mình làm nghề gì?» — «Đặc sản, đồ ăn đồ uống» · «Du lịch: đón khách, ăn
  uống, nghỉ trọ» · «Nông sản: thu mua, sơ chế».
- **(d) Sai:** chọn nhầm ngành → `danhMucCho` sinh sai toàn bộ. Đường sửa duy nhất rõ là onboarding
  lại (B.12) — quá nặng cho một bấm nhầm. Đề xuất: thanh 5 chấm tiến độ của OB-2 cho BẤM LÙI lại
  từng câu ngay trong phiên (màn con có nút «Sửa câu trước»); đây cũng là điều kiện để «đóng app mở
  lại đứng đúng câu 3» (nghiệm thu B.6) có nghĩa với người dùng, không chỉ với người test.

### Câu 2 — Giấy tờ: «Nhà mình đã đăng ký kinh doanh chưa?»

- **(a) Tai bà Bảy:** câu hỏi hiểu; KHÔNG hiểu đáp án. «Có giấy phép lẫn mã số thuế» — «lẫn» là văn
  viết; «mã số thuế» bà không biết mình có hay không (giấy treo tường bà gọi là «cái giấy phép»).
  Bà trả lời bừa một trong hai nút đầu — sai 50/50.
- **(b) Thuật ngữ trá hình:** «mã số thuế» (lộ trực diện), «đăng ký kinh doanh» (vừa giấy phép vừa
  thuế trong một chữ — hộ không tách được hai thứ này, mà app lại cần tách vì 4 nhánh `giayTo` khác
  nhau).
- **(c) Viết lại:** «Nhà mình có cái giấy phép bán hàng treo tường chưa?» — «Có giấy phép, có cả
  con số thuế 10 số» · «Có giấy phép thôi» · «Chưa đăng ký gì cả» · «Không nhớ — để cán bộ xem giúp».
  Giữ nguyên câu dẫn đã có trong PLAN (T3-CD1): «Có cái giấy phép treo tường không? Chụp nó giùm app
  là xong» — nhưng phải HIỆN TRONG MÀN, không chỉ nằm trong tư liệu.
- **(d) Sai:** khai «có MST» mà thật ra không → connector cần MST sinh ra rồi treo «đang chờ» mãi.
  Đề xuất: mọi thẻ «Đang chờ» trên Trạm có nút phụ «Thực ra nhà mình chưa có» → tự hạ trạng thái +
  sinh việc cán bộ. Ngược lại khai «chưa có» mà có → mục checklist GPKD xuất hiện thừa, vô hại, nhưng
  cùng nút «Nhà mình có rồi» để rút. Câu «Chưa rõ — để cán bộ kiểm tra giúp» là đáp án AN TOÀN — nên
  đặt nó ở vị trí nút to mặc định cho các màn này (bà không bị ép bừa).

### Câu 3 — Kênh bán: «Hàng/dịch vụ bán qua đường nào?» (chọn nhiều)

- **(a) Tai ba vai:** các đáp án rất tốt («Zalo, Facebook nhắn khách» là chữ của chính hộ). Vấp ở
  CHỌN NHIỀU: bà Bảy sợ «bấm nhiều cái có bị gì không», và không biết bấm lần nữa để BỎ chọn. Ông Sáu
  bấm 1 cái rồi chờ màn tự nhảy — không nhảy (vì chờ chọn tiếp).
- **(b) Thuật ngữ trá hình:** «dịch vụ» (chấp nhận nhẹ); «Sàn Shopee/TikTok/Lazada» — «sàn» là tiếng
  ngành thương mại điện tử, hộ nói «bán trên Shopee». Câu dẫn T3 «bấm 2 đoạn hội thoại thật trong
  máy» — PHẢN BIỆN: đừng cho app đụng vào hội thoại Zalo của hộ, kể cả chỉ «bấm xem». Hộ sợ nhất là
  «nó xem hết tin nhắn của mình» (T3-CD1 c đã ghi nỗi sợ lộ); đòi mở hộp thoại là tự phá lời trấn an
  «dữ liệu là của nhà mình».
- **(c) Viết lại:** «Hàng nhà mình bán qua chỗ nào? Bấm hết các chỗ bán, bấm lần nữa để bỏ» — «Tại
  quầy/cửa hàng» · «Bán cho nhà hàng, công ty» · «Bán trên Shopee/TikTok/Lazada» · «Khách nhắn
  Zalo/Facebook» · «Bán qua phát trực tiếp» · «App giao đồ ăn» · «Khách đặt phòng/đặt tour». Thêm
  dòng đếm «Đã chọn 2 chỗ» + nút lớn «Hết rồi, tiếp tục» luôn sáng.
- **(d) Sai:** thiếu kênh (T3 ghi hộ hay thiếu Zalo + kênh mùa) → connector kênh đó về ĐỂ SAU — hệ
  quả nhẹ, sửa được bằng onboarding lại hoặc «Thêm chỗ bán» từ Trạm (đề xuất: nút «Bây giờ nhà mình
  bán thêm chỗ khác» ở Trạm — cùng đường hàm `danhMucCho` tính lại, không cần vào lại wizard). Chọn
  thừa — sau này app kéo không thấy dữ liệu, Trạm hiện «Chỗ này hình như chưa bán — bỏ theo dõi?».

### Câu 4 — Doanh thu theo mùa: «3 tháng đông khách nhất ước chừng bao nhiêu?»

- **(a) Tai ba vai:** hỏi theo mùa là sửa đúng hướng (cả 3 nhà đều trả lời được câu mùa). Nhưng
  «ước chừng» là văn viết — bà nói «đại khái», ông Sáu nói «chừng». Dòng phụ 4 dòng giải thích 1 tỷ
  là dòng ĐÚNG NHẤT về pháp lý nhưng DÀI NHẤT màn — ông Sáu nóng tính không đọc, bà Bảy đọc không
  xuể.
- **(b) Thuật ngữ trá hình:** «ước chừng» (văn viết); «lũy kế» (chỉ ở dòng phụ — may nằm phần sau);
  chính các NẤC là rủi ro lớn hơn chữ: 3 tháng cao điểm «trên 500 triệu» × quy 4 quý → dễ thành
  «trên 1 tỷ» với nhà mùa vụ NHƯNG THẬT RA DƯỚI (CD2 hè chiếm phần lớn năm) — và ngược lại nhà
  như CD1 (1.020tr, rải đều) lại có 3 tháng cao điểm ~500tr → chọn «250–500» khiến app nghĩ dưới
  ngưỡng.
- **(c) Viết lại câu hỏi:** «3 tháng đông khách nhất, bán được bao nhiêu tiền, đại khái thôi?» —
  nút to mặc định giữ «Không biết» (không phán xét — đã đúng). Dòng phụ gấp gọn còn 1 câu + nút «Xem
  vì sao app hỏi»: «Hỏi để biết nhà mình có phải dùng hoá đơn điện tử của cơ quan thuế không thôi —
  bán trên 1 tỷ một năm là phải làm hồ sơ trong 30 ngày [Q-001].»
- **(d) Sai — ĐÂY LÀ CHỖ NGUY HIỂM NHẤT CỦA WIZARD:** theo B.7, `doanhThuUoc='tren-1-ty'` sinh ngay
  nhóm BẮT BUỘC THEO LUẬT — tức một câu trả lời ĐOÁN của hộ quyết định nghĩa vụ pháp lý hiển thị.
  T3 chứng minh cả 3 nhà đều đoán sai kiểu khác nhau. Đề xuất tách hẳn: câu 4 chỉ dùng để SẮP THỨ TỰ
  gợi ý danh mục, KHÔNG sinh nhóm LUẬT; nhóm LUẬT chỉ sinh khi (i) số bán thật vượt (`t.vuotLuc` /
  `mocVuotNguong` — seed v4 đã có) hoặc (ii) hộ chủ động khẳng định ở nút phụ «Tôi chắc cả năm trên
  1 tỷ». Trả lời nấc nào thì sau đó Trạm vẫn hiện «App đang theo dõi doanh thu để biết khi nào cần
  hoá đơn» (PLAN đã có câu này cho nhánh «Không biết» — đề xuất áp cho MỌI nhánh không khẳng định).
  Sửa nấc bấm nhầm: cho bấm lại nấc khác ngay (nút nấc giữ trạng thái đổi được đến khi rời màn).

### Câu 5 — Đang bán bằng gì: «Hiện ghi chép bán hàng bằng gì?»

- **(a) Tai bà Bảy:** «ghi chép» là văn viết — bà nói «ghi ra vở». Đáp án «Có máy tính tiền in hoá
  đơn» — T3-CD1 b ghi hộ gọi máy in bill là «máy in», KHÔNG biết «máy tính tiền» là gì → bà không
  biết chọn gì dù quầy đang có máy in đơn Shopee.
- **(b) Thuật ngữ trá hình:** «ghi chép», «máy tính tiền», «phần mềm» (ông Sáu chỉ biết «app»).
- **(c) Viết lại:** «Hiện nay bán hàng nhà mình ghi ở đâu?» — «Ghi ra sổ, vở» · «Dùng app khác rồi»
  · «Có cái máy in bill ở quầy» · «Không rõ». Câu dẫn T3 «Hôm nay xuất hoá đơn cho khách sạn, anh/chị
  xuất từ đâu, ai gõ?» — tốt, đưa vào dòng phụ.
- **(d) Sai:** «Không rõ» → coi như `giay-so` (PLAN) — hợp lý, giữ. Bấm nhầm «app khác» (thật ra là
  máy in bill) → sinh mục ĐỂ SAU «chuyển dữ liệu từ phần mềm cũ» — hệ quả nhẹ (nhóm ĐỂ SAU), sửa bằng
  cách bỏ mục đó trên Trạm bằng nút «Nhà mình không dùng cái này». Không cần đường sửa nặng.

---

## 3. Đi lại toàn luồng OB-1 → OB-6 + Trạm + Tạm dừng — top-15 chỗ vấp

Mức: CHẮN = dừng tay/bỏ app · GẮT = lúng túng, cần hỏi người bên cạnh · NHẸ = vấp nhẹ tự vượt được.

| # | Màn | Khoảnh khắc vấp (đời thường) | Mức | Sửa đề xuất |
|---|---|---|---|---|
| 1 | OB-1 bấm «Để sau» | Bà Bảy vào app → tab Bán trắng trơn không có gì để «dùng trước» → «app hỏng rồi» → gỡ | CHẮN | Tab Bán tenant trắng hiện 1 thẻ chào + nút «Bán thử 1 đơn làm quen» + đường «Làm phần mở đầu» luôn sáng (xem P1) |
| 2 | OB-1 quét QR | Bà Bảy không biết QR là gì — «quét mã» nghe như phải CHIẢ tiền qua mã QR (nỗi sợ mất tiền) | GẮT | Dòng kèm máy quét: «Quét mã GIỜY của cán bộ — không mất tiền, không điền gì cả»; camera mô phỏng hiện khung + con QR mẫu |
| 3 | OB-1 gõ tay mã | Gõ 12 ký tự `GL26-…`: dấu gạch, chữ hoa/thường — bàn phím điện thoại mặc định thường | GẮT | Hiện sẵn «GL26-» cố định, chỉ gõ 8 ký tự sau, nhận cả dán (P3) |
| 4 | OB-2 câu 0 | Bà Bảy chọn «chủ hộ» vì đúng danh xưng của mình → nhận bản wizard đầy đủ — nhầm người cần bản rút gọn | GẮT | Đáp án bằng TÊN người + câu phụ «Tự bấm được không, hay để tối cháu bấm giúp?» (mục 2, câu 0) |
| 5 | OB-2 câu 2 | «mã số thuế» — bà không biết mình có không; giấy phép treo tường bà gọi là «cái giấy phép» | GẮT | Đổi đáp án «Có giấy phép, có cả con số thuế 10 số» + cho chụp ảnh giấy, app tự nhận diện có/MST (mục 2, câu 2) |
| 6 | OB-2 câu 3 | Ông Sáu bấm 1 kênh rồi chờ — không biết là CHỌN NHIỀU, màn không tự nhảy | GẮT | Dòng đếm «Đã chọn 2 chỗ» + nút lớn «Hết rồi, tiếp tục» luôn hiện; bấm lần nữa = bỏ chọn |
| 7 | OB-2 câu 4 | Câu đoán 3 tháng → sinh nhóm LUẬT sai chiều theo mùa vụ — hộ tin nhầm nghĩa vụ của mình | CHẮN | Câu 4 chỉ xếp gợi ý; nhóm LUẬT chỉ sinh từ số thật (`vuotLuc`) hoặc nút khẳng định «Tôi chắc cả năm trên 1 tỷ» (mục 2, câu 4) |
| 8 | OB-3 danh mục | Vừa trả lời bằng lời quê 5 câu, sang màn liền túc gặp cả bảng «SePay · Zalo OA · HĐĐT · CTS» — bà giật mình «mình đâu biết mấy cái này» | GẮT | Mỗi dòng danh mục mở đầu bằng VIỆC đời thường in đậm («Tiền về quầy tự hiện lên»), tên dịch vụ làm chữ phụ; câu mở màn B.7 «Cái nào là LUẬT ĐÒI thì làm sớm» giữ nguyên — đó là câu tốt |
| 9 | OB-4 SePay nhánh CÓ | Máy nhảy sang màn khác (URL `developer.sepay.vn`) — ông Sáu tưởng bị lừa quay ra trang lạ, kích thoát | GẮT | Màn trung gian đóng khung nổi: «Đang sang trang của NGÂN HÀNG — giống đưa thẻ cho thu ngân» + nút «Quay lại app» luôn hiện dưới |
| 10 | OB-4 HĐĐT đường (2) | Đặc tả B.8 viết «NCC trung gian có API» — nếu chữ «API» lọt ra màn hộ thì phạm quy B.0 (1) cấm thuật ngữ | GẮT | Trước mặt hộ chỉ: «Dùng dịch vụ hoá đơn của hãng khác — đang kiểm tra giá, xong sẽ hỏi trước khi bật»; «API» nằm trong khối «cài đặt nâng cao» đúng như SePay đã làm |
| 11 | Trạm — khối chờ | «Đang chờ {bên thứ ba} — dự kiến {hanDuKien}»: «bên thứ ba» là tiếng hành chính — bà không biết đang chờ AI | GẮT | Dùng tên thật như B.2 đã có mẫu: «Đang chờ Zalo duyệt — dự kiến thứ Sáu»; bỏ hẳn «bên thứ ba» khỏi mọi màn hộ |
| 12 | Trạm — thẻ đỏ «Đã quá ngày dự kiến» / «đã quá hạn {n} ngày — cần xử lý» | Bà Bảy thấy ĐỎ + chữ «cần xử lý» → tưởng mình phạm luật, sợ, đóng app | GẮT | Giọng trấn an + việc cụ thể: «Cái này chậm hơn hẹn — KHÔNG phải lỗi của cô. Bấm để cán bộ gọi lại.» Màu đỏ chỉ dành cho dòng có nút hành động, kèm luôn tên cán bộ nếu có `coCanBo` |
| 13 | Trạm — nhãn độ tươi «chưa đo — radar đang hỏi Q-0xx» | Mã Q-0xx là tiếng nội bộ lộ ra màn nhìn thấy của hộ — «radar là cái gì?» | NHẸ | Trước mặt hộ chỉ «Chưa đo được»; nhãn Q-0xx chỉ hiện trong «xem nguồn màn hình» (chế độ demo đã có) |
| 14 | «Việc giao người nhà» | Bà Bảy đọc cụm «việc giao người nhà» không ra nghĩa (ngữ pháp cụt, không chủ ngữ) | GẮT | Hiện tên từ seed: «Phần còn lại để tối chị Thu Hà bấm — app đã để sẵn cho cháu»; kèm nút «Nhắc cháu qua Zalo» (tin thường, không tốn phí OA) |
| 15 | Màn Tạm dừng — bước gõ «XOÁ» | Người ít chữ phải tìm chữ Á có dấu — bị chặn chính giữa lúc đã quyết định ra đi | GẮT | Thay bằng «bấm và GIỮ nút xoá 5 giây» có thanh chạy (giữ 2 lần confirm); dòng cuối B.15 «Các quyền đã cấp cần cô chú tự bấm ngắt ở trang của họ» giữ nguyên — câu đó đúng và rõ |

Bốn điểm đề dặn soi riêng:

- **Nút «đọc to câu này» 🔊 (B.6):** CÓ cứu người đọc chậm — với 3 điều kiện: (1) nút to bằng nút
  trả lời, đặt cạnh câu, không phải chữ nhỏ góc màn; (2) mỗi câu wizard đều có, kể cả dòng phụ dài
  (câu 4); (3) trong mockup chỉ là nhãn mô phỏng thì ghi rõ «[giọng đọc — mô phỏng]» để người xem demo
  không tưởng đã có sẵn giọng thật. Ông Sáu sẽ không bao giờ bấm — không sao, nó không nằm đường đi
  của ông.
- **Chế độ Aa rút còn 2 câu (B.5):** đã ĐỦ về số câu (nghề + giao người nhà), nhưng CHƯA đủ về nội
  dung: câu giấy tờ (câu 2) là câu quyết định danh mục LUẬT — bản rút gọn phải nói rõ câu đó KHÔNG
  biến mất mà CHUYỂN cho con: «Phần giấy tờ để {tên con} bấm tối nay» (PLAN đã có câu này — cần hiện
  đúng chỗ cuối màn rút gọn, không chỉ là mô tả). Và lưu ý kỹ thuật hiện tại: nút `Aa` trong
  mobile.html (dòng 158) chỉ là nút đổi chế độ `simple/full` với nhãn «Đổi cỡ chữ» — bà Bảy không
  biết «Aa» nghĩa là gì; cân nhắc thêm chữ «Chữ to» cạnh Aa khi ở chế độ thường.
- **«Việc giao người nhà»:** xem dòng 14 — cụm danh từ không có động từ không phải lời nói; mọi tên
  màn cho hộ phải là câu có chủ ngữ.
- **Thẻ đỏ «quá hạn»:** xem dòng 12 — đỏ là màu của HÀNH ĐỘNG («bấm gọi cán bộ»), không phải màu của
  LỖI CỦA HỘ. Hộ cháy hạn 30 ngày (B.13 #9) cũng vậy: chữ «cần xử lý» đổi thành «cán bộ sẽ liên hệ
  hôm nay» khi hộ có `coCanBo`.

---

## 4. 5 điều cán bộ dẫn 20 hộ cần mà kế hoạch chưa có (hoặc chưa đủ)

| # | Điều cần | Vì sao (từ vai cán bộ) | Đích |
|---|---|---|---|
| C1 | **Bản Sổ trực chạy trên điện thoại cán bộ** | Buổi dẫn hộ ở thôn bản, cán bộ chỉ có điện thoại; `b2g.html` là web để bàn — đứng giữa sân không tra được «hộ này kẹt gì» | b2g (bố cục responsive/màn nhỏ cho 6 mục Sổ trực) |
| C2 | **Sổ trực hiện «hộ dở ở câu mấy»** | 7 mức `buoc` là trạng thái tổng — tới nhà phải biết hộ DỞ CÂU SỐ MẤY để mở thẳng đúng chỗ; dữ liệu `boQuaLuc`/màn dở đã có trong `t.onboarding`, chỉ chưa được đẩy lên Sổ trực | b2g (thêm cột từ dữ liệu onboarding sẵn có) |
| C3 | **Nút «Xem thử» không cần mã suất** | Buổi tập 20 hộ cùng phòng: muốn cho MỌI người bấm thử wizard một lượt rồi mới phát mã thật — hiện mọi đường vào OB-1 đều cần license, không có đường demo không ghi đè | mobile (OB-1 thêm nút «Xem thử trước khi có mã», chạy tenant demo không lưu) |
| C4 | **Ghi kết quả cuộc gọi ngay ở Sổ trực** | Mục 5 «Quá hạn chờ» sinh việc gọi hộ — nhưng gọi xong không có chỗ ghi «đã gọi, hẹn mai 9h»; mai mở lại thấy còn nguyên việc, gọi trùng | b2g (mỗi việc 1 dòng trạng thái: đang chờ / đã gọi-hẹn / xong) |
| C5 | **Cuối buổi: 1 tin nhắc cho mỗi hộ theo ngân sách ≤1 tin/ngày** | Dẫn 20 hộ xong, mỗi hộ thiếu một thứ khác — cán bộ cần app soạn sẵn «nhà mình còn thiếu X, mai tôi qua» gửi VÀO HỘP THƯ app hộ (không broadcast, đúng N-09: tin Tư vấn trong cửa sổ 7 ngày, tốn phí Q-005 thì hiện phí trước khi gửi) | b2g → hộp thư in-app của mobile |

*(Cả 5 điều đều để Claude cân nhắc tích hợp theo đúng quyền sở hữu file INTERFACE mục 0 — W0 không
tự thêm vào code. Không đề xuất nào chạm N-01/N-06/N-07/N-09.)*

---

## Tự soát

- Đủ 4 phần đúng đề: (1) bảng 13 chốt · (2) 6 câu đầy đủ a–d · (3) bảng 15 chỗ vấp + 4 điểm soi
  riêng · (4) 5 điều cán bộ, mỗi điều ≤3 dòng kèm đích.
- Mọi trích dẫn «…» đối chiếu nguyên văn PLAN-V4 (B.0–B.15, C.14–C.15, G) và CHOT-P1-P13; tên người,
  tuổi, vai trò chỉ từ `sm-seed-gialai.js` (bà Nguyễn Thị Bảy 58 — `chuHo`/`nguoiLonTuoi` CD1; ông Lê
  Văn Sáu 55 — `chuHo` CD2; chị Trần Thu Hà — `keCan` CD1).
- Không đề xuất nào vượt ranh giới: N-01 (không đụng tầng kế toán), N-06 (mọi nút gửi/xoá cuối vẫn
  tay người hộ — chỉ đổi cơ chế confirm gõ → giữ nút), N-07 (không chạm tiền; C5 chỉ soạn tin, phí
  hiện trước khi gửi), N-09 (C5 đi từng hộ trong cửa sổ tin Tư vấn, không broadcast).
- Không ký tự Trung/Nhật/Hàn (đã grep kiểm sau khi ghi file).
