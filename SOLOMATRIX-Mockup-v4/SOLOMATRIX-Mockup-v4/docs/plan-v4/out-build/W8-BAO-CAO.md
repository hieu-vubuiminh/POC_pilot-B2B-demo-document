# W8 — BÁO CÁO: POLISH `js/sm-onboard.js` THEO PHẢN BIỆN W0

*Ngày 20/08/2026 · file sở hữu duy nhất: `solomatrix-v3-gialai/js/sm-onboard.js` · 37 Edit, KHÔNG Write đè.*
*Nguồn lệnh: `out-build/W0-PHAN-BIEN-CAU-HOI.md` (đọc toàn bộ) + `INTERFACE-V4.md` + `CHOT-P1-P13.md`.*

---

## 0. Tình hình khi nhận file

Bản W1 (đã có vá của Claude sau lượt W1) **đã thi hành sẵn phần lớn 15 mục của đề W8** — câu chữ 5 câu
nhận diện, nút khẳng định 1 tỷ, prefix «GL26-», giữ-5-giây, việc đời thường ở OB-3, câu quê P12, tên
thật ở khối «Đang chờ»… Nên W8 làm hai việc:

1. **Đối chiếu từng mục 1→15**, mục nào đã đúng thì giữ nguyên (không sửa cho có).
2. **Sửa những chỗ mục đó CHƯA CHẠY ĐƯỢC THẬT** — tìm ra 4 lỗi hành vi làm chết đúng các đường lui
   mà W0 đòi. Đây là phần nặng nhất của lượt này.

---

## 1. Bốn lỗi hành vi đã sửa (quan trọng hơn câu chữ)

### (a) Nút «Thực ra nhà mình chưa có» làm VỠ trang — `ReferenceError`
`bindTram` gọi `THAM_SACH_CONNECTOR[ma]` (không tồn tại; đúng là `THAM_SO_CONNECTOR`). Bà Bảy bấm đúng
cái nút W0 mục 2-câu-2(d) đề xuất là **script chết giữa chừng**, trạng thái hạ rồi mà nhật ký không ghi,
màn không vẽ lại. → sửa tên biến.

### (b) Mọi nút «Để sau, vào dùng trước» / «Mở lại chỗ đang dở» KHÔNG ghi chỗ đang dở
`mobile.html:2493` gán **`b.onclick = …`** cho mọi `[data-di]` trong `bindNhac()`, và `bindNhac()` chạy
**SAU** `bind(t)` của module → mọi nút vừa có `data-di` vừa được module gán `onclick` bị **ghi đè, mất
việc**. Dính: `#ob1-desau`, `#ob1-desau2`, `#ob0-desau`, `#ob2-desau`, `#tr-molai`. Hệ quả đúng chỗ
nghiệm thu B.5/B.6: hộ bấm «Để sau» → app nhảy sang tab Bán nhưng **không hề nhớ hộ đang dở câu mấy**,
nên lời hứa «mở lại đứng đúng câu 3» sai.
→ thêm helper `ganBamTruoc()` (đăng ký `addEventListener` trước khi mobile gán onclick — đúng cách
`ganDoiNguoi`/`ganNutMoCon` đang dùng) và chuyển cả 5 nút sang đó.

### (c) Nút «đi màn khác» sau khi module tự vẽ lại là NÚT CHẾT
`veLai()` và `vongLaiCau()` thay ruột `#view`/`#ob2-body` bằng tay, nhưng `bindNhac()` chỉ chạy trong
`render()` của mobile → các nút `data-di` mới sinh **không có handler**: «Bắt đầu phần hỏi» (ngay sau
khi kích hoạt xong), «Xem danh sách của nhà mình» (ngay sau khi trả lời xong), «Làm ngay», «Để sau» của
từng câu. Hộ mù công nghệ bấm không ra gì = app hỏng = gỡ.
→ thêm `danhThucMobile()`: nhờ mobile render lại **đúng màn đang đứng** qua `SM.setUi` → `ui:change`
(nội dung y hệt, chỉ để nó gắn lại handler). Gọi trong `veLai`, `vongLaiCau`, nhánh `xongPhanHoi`.
→ thêm `tuBamDi(dich)`: TAB nằm trong IIFE của mobile, module không với tới — nên «mở lại phần hỏi»
mượn đúng nút `[data-di]` có sẵn trên màn mà bấm hộ, thay vì vẽ màn OB-2 lạc chỗ dưới tab OB-1.
→ màn Tạm dừng: sau `SM.resetAll()` mobile không nghe `db:reseed` nên màn vẫn đứng nguyên số cũ dù kho
đã trắng; nay đánh thức để hộ **thấy** máy trắng thật.

### (d) «Bây giờ nhà mình bán thêm chỗ khác» hụt với hộ bản rút gọn
Đường này đặt `ob2.cau = 3`, nhưng hộ bản rút gọn chỉ có 2 câu → rơi thẳng vào màn «xong», **không bao
giờ thấy câu kênh**. → thêm cờ `ob2.chiCauKenh`: vẽ đúng một câu kênh rồi tính lại danh mục ngay
(`xongPhanHoi`), «Sửa câu trước» trong chế độ này = thôi, giữ nguyên như cũ.

---

## 2. Đối chiếu 15 mục của đề

| # | Trạng thái | Ở đâu |
|---|---|---|
| 1 | **Đã có (W1), giữ** + **bổ sung** | `vuotNguongThat()` + `danhMucCho()`: `doanhThuUoc='tren-1-ty'` KHÔNG sinh nhóm LUẬT; chỉ `t.vuotLuc`/`D.mocVuotNguong` hoặc `traLoi.chacTren1Ty`. **W8 thêm**: Trạm nay LUÔN có thẻ «Canh khi nào cần hoá đơn» với đúng câu «App đang theo dõi doanh thu để biết khi nào cần hoá đơn.» cho MỌI nhánh không khẳng định (trước đây mục canh-ngưỡng chỉ hiện ở OB-3 rồi biến mất) |
| 2 | Đã có, **sửa hành vi** | `nguoiCau0()` lấy tên seed · `veCau0Phu` câu phụ 1 chạm · «Đổi người bấm» ở đầu mọi màn wizard. W8 sửa: nút «Để sau» cạnh nó nay ghi được chỗ đang dở (lỗi b) |
| 3 | Đã có, giữ nguyên văn | `cauNganh/cauGiayTo/cauKenh/cauDoanhThu/cauPos` — đã đúng bản viết lại W0, «Không nhớ — để cán bộ xem giúp» là nút to mặc định, dòng đếm + «Hết rồi, tiếp tục» luôn sáng, không đụng hội thoại Zalo |
| 4 | Đã có | «Sửa câu trước» trong `khungCau` (so > 1) + giữ trả lời cũ làm mặc định (`data-tra` gắn class `pri`) |
| 5 | Đã có | prefix «GL26-» cố định, nhận dán, dòng «Quét mã giấy của cán bộ — không mất tiền, không điền gì cả.» |
| 6 | Đã có | `viecDoiTuong()` — việc đời thường in đậm, tên dịch vụ là chữ phụ nhỏ |
| 7 | Đã có, **thêm 1 câu** | SePay có màn trung gian đóng khung + «Quay lại app»; «API»/«bên thứ ba» chỉ nằm trong comment (grep chứng minh ở §4). W8 sửa tiêu đề HĐĐT đường 2 → «Dùng dịch vụ hoá đơn của hãng khác… đang kiểm tra giá, xong sẽ hỏi trước khi bật» đúng chữ W0 #10 |
| 8 | Đã có | «Cái này chậm hơn hẹn — KHÔNG phải lỗi của cô/chú» + tên cán bộ; `dongHo30Ngay` quá hạn → «cán bộ … sẽ liên hệ hôm nay» |
| 9 | Đã có, **bịt thêm 3 lỗ** | «Chưa đo được» trước hộ, mã Q-0xx trong «nguồn màn hình». W8 bọc thêm `boNhan()` cho 3 chỗ còn xổ nhãn: `sheetDaXong` (người bấm cuối của chữ ký số có `[Q-002]`), `bangDoTuoi` (độ tươi đã công bố), `viewObCon` (người bấm cuối) |
| 10 | Đã có | thẻ «Phần còn lại để tối {tên} bấm» + `sheetNhacZalo` (soạn sẵn, hộ TỰ gửi — N-06/N-09) |
| 11 | Đã có | `xacNhanXoa1` → `xacNhanXoa2` giữ 5 giây có thanh chạy, thả sớm = không xoá |
| 12 | Đã có, **bổ sung** | không con số/«ngưỡng»/«lũy kế» trước hộ; «800tr» chỉ trong trường `nguon` (khối «Nguồn màn hình»). W8 đưa câu P4 lên Trạm (xem mục 1) |
| 13 | Đã có | `DONG_ANH_GIAY_TO` có đủ câu «Ảnh cô chụp chỉ nằm trong máy của cô…» |
| 14 | Đã có, **sửa hành vi** | «Thực ra nhà mình chưa có» (sửa lỗi a) · «Bây giờ nhà mình bán thêm chỗ khác» (sửa lỗi d) · «Xem thử trước khi có mã»: W8 sửa hẳn — trước đây chỉ đổi sang `cd4-moi` rồi **vẫn đứng ở màn đòi mã**; nay mở thẳng câu 0 của hộ demo, có banner «Đang bấm thử… hộ nhà mình không bị đụng gì» (đúng W0 C3: buổi tập 20 hộ bấm thử trước khi phát mã) |
| 15 | Đã có | thẻ MISA nhóm ĐỂ SAU với đúng câu «OPC không thay nó; phần nối sang nhau đang kiểm tra, xong sẽ báo.» |

## 3. Thi hành thêm các verdict khác của W0 (đề nói «mọi verdict trong W0 là quyết định đã duyệt»)

- **P7 — chữ «SLA» là tiếng nội bộ**: 3 toast trước mặt hộ đang ghi «(SLA kênh người 15 phút)» →
  đổi thành «người thật trả lời trong 15 phút». Nay không chuỗi hiển thị nào chứa «SLA».
- **Điểm soi #1 — nút «đọc to câu này»**: trước đây là **chip nhỏ ở góc header** (và ở câu 0 thì
  **không được gắn handler nào cả** — bấm không ra gì). Nay: nút to bằng nút trả lời, đặt ngay dưới
  câu, có ở câu 0 + câu phụ + cả 5 câu + **dòng phụ dài của câu 4**; sheet vẫn ghi rõ «MÔ PHỎNG đọc».
- **Điểm soi #2 — bản rút gọn**: câu 2 rút gọn nay nói rõ **«Phần giấy tờ để {tên} bấm tối nay» — câu
  đó không mất đi đâu cả**, đúng chỗ cuối màn.
- **B.5 đường lui**: «Để sau» trong từng câu wizard trước đây chỉ hiện toast rồi **đứng nguyên tại chỗ**
  (không có `data-di`) — hộ không thoát ra được. Nay là «Để sau, vào dùng trước» và đi thật vào app.

---

## 4. Tự soát cú pháp — làm bằng cách nào

`node --check` **không chạy được trong phiên này** (Bash đòi approval, phiên không tương tác) — nói
thẳng, không giấu. Thay bằng:

1. **Đọc lại toàn bộ diff của chính mình**: đọc lại từng vùng vừa Edit bằng Read theo offset (13 lần),
   soát ngoặc/dấu cộng/dấu phẩy trong từng chuỗi nối HTML.
2. **Grep bẫy chú thích**: `\*/.+$` — tìm mọi dấu đóng chú thích nằm giữa dòng. Cách này **đã bắt được
   1 lỗi thật do chính W8 tạo ra**: chú thích tiếng Việt viết `ob*/tamdung` chứa chuỗi đóng chú thích →
   đóng khối sớm, hỏng cả file. Đã sửa thành `obkichhoat/obnhandien/…/tamdung`.
3. **Grep chứng minh theo đề**:
   - `API` · `bên thứ ba` → chỉ còn ở **comment** (dòng 173, 545–559 khối chú thích) — 0 chuỗi hiển thị.
   - `Q-0` → 85 lần, tất cả nằm ở **comment cuối dòng**, trường `nguon` (chỉ in trong khối «Nguồn màn
     hình»), hoặc chuỗi đi qua `boNhan()` trước khi hiển thị.
   - `GIỮ 5 GIÂY` → còn (dòng 2152). `Tôi chắc cả năm bán trên 1 tỷ` → còn (nút `#ob4-chac`, dòng 1178).
   - `THAM_SACH` → 0 (lỗi a đã hết). `SLA` → chỉ trong comment.
   - CJK (`\p{Han}\p{Hiragana}\p{Katakana}\p{Hangul}`) → **0 khớp**.
4. **Đối chiếu API của sm-core trước khi dùng**: đã Read `js/sm-core.js` để xác nhận `SM.NS`, `SM.ui`,
   `SM.setUi`, `SM.mode`, `SM.tenant`, `SM.switchTenant`, `SM.current` đều có thật và `ui:change` có
   listener trong `mobile.html` — không gọi hàm tưởng tượng.
   *(Nhân tiện: chú thích ở dòng 556 của file nói «SM.NS KHÔNG được sm-core export» là **sai** — `NS`
   có trong `global.SM` dòng 297 của sm-core. Vá bằng chuỗi `'smv3:'` vẫn đúng nên W8 không đụng vào,
   chỉ ghi lại đây để W2/W6 khỏi lần theo một nhận định sai.)*

**Chữ ký hàm INTERFACE mục 3 giữ nguyên 100%** — không đổi tên, không bớt export; chỉ thêm hàm nội bộ
(`ganBamTruoc`, `danhThucMobile`, `tuBamDi`) và một trường trạng thái nội bộ `ob2.chiCauKenh`.

---

## 5. Còn chưa làm được — nói thật

1. **Chế độ đơn giản (`SM.mode()==='simple'`) vẫn còn nút `data-di` chết.** `mobile.html:2535` nghe
   `ui:change` và **ép `TAB` về `ban`** với mọi màn ngoài `ban/tien/ai` — gồm cả toàn bộ màn phần mở
   đầu. Nếu W8 đánh thức mobile ở chế độ đó thì **đẩy hộ văng khỏi wizard giữa chừng**, còn tệ hơn nút
   chết, nên `danhThucMobile()` tự tắt trong chế độ đơn giản. Đây đúng là chế độ của bà Bảy
   (`rutGon()` dùng chính cờ này), nên **cần W6 sửa gốc trong `mobile.html`**: cho
   `obkichhoat / obnhandien / obdanhmuc / obcon / ketnoi / tamdung` vào danh sách màn được phép của
   chế độ đơn giản. Ngoài quyền ghi của W8 nên W8 không đụng.
2. **W0 #2 phần «camera mô phỏng hiện khung + con QR mẫu»** chưa dựng — mới có dòng trấn an + nút «Mô
   phỏng quét QR (điền mã demo)». Đề W8 mục 5 chỉ yêu cầu dòng chữ nên W8 dừng ở đó; phần khung camera
   để lượt sau nếu Quang muốn.
3. **W0 #1 (tab Bán trắng của tenant mới)** và **C1/C2/C4/C5 (Sổ trực trên điện thoại cán bộ)** không
   thuộc file này — đích là `mobile.html` (W6) và `b2g` (W5), W8 không chạm.
4. **Chưa chạy thử trên trình duyệt.** Mọi kết luận ở trên là từ đọc code + đối chiếu `mobile.html`,
   `sm-core.js`. Cần một lượt bấm thật 3 chân dung (đặc biệt: kích hoạt CD2 từ đầu → câu 0 → 5 câu →
   danh mục → Trạm → «bán thêm chỗ khác» → Tạm dừng) để xác nhận `danhThucMobile` không gây nháy màn
   khó chịu.

---

## 6. Danh sách Edit (37)

Bug hành vi: `THAM_SACH_CONNECTOR` (1) · `ganBamTruoc` + 5 nút chuyển sang nó (6) · `veLai` +
`danhThucMobile` + guard + 2 chỗ gọi thêm + sửa bẫy `*/` (6) · `tuBamDi` + 2 chỗ dùng (3) ·
`chiCauKenh` 4 chỗ (4) · «Xem thử» mở wizard hộ demo + banner (2) · màn Tạm dừng đánh thức (1).
Câu chữ/giao diện: nút đọc to (khungCau, veCau0, veCau0Phu, dòng phụ câu 4, 2 chỗ gắn handler = 6) ·
câu giấy tờ bản rút gọn (1) · 3 toast bỏ «SLA» (3) · thẻ canh ngưỡng ở Trạm (1) · 3 chỗ bọc `boNhan`
(3) · tiêu đề HĐĐT đường 2 (1).

BUILD-AGENT-DONE W8 37
