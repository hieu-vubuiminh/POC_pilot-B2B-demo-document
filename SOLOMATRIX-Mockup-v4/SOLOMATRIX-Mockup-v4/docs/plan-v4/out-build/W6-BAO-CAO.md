# W6 — BÁO CÁO BUILD: mobile.html (nối wizard vào app)

Ngày: 2026-08-20 · File sở hữu: `solomatrix-v3-gialai/mobile.html` (chỉ Edit từng chỗ, không Write đè).
Đã đọc theo thứ tự: INTERFACE-V4 (mục 7 + mục 0/3/9) → PLAN-V4 (B.2, B.5–B.9, B.14–B.15, C.2, D-#4, D-#11, E) → CHOT-P1-P13 → code quanh từng neo (Grep + Read theo offset, không nuốt cả file).

## 1. Từng Edit (14 Edit thành công, mỗi Edit neo ≥3 dòng)

| # | Neo (vị trí sau sửa) | Mục đích |
|---|---|---|
| 1 | 171–172 `sm-core`+`sm-seed-gialai`+`sm-domain` | Bump `?v=20260820`; **gỡ thẻ seed khỏi vị trí 2** (seed là dữ liệu thuần, `SM.db()` mới đọc ở cuối — di chuyển an toàn) |
| 2 | 174–179 khối `sm-ops…sm-program` | Bump `?v=` + **chèn `js/sm-onboard.js?v=20260820` SAU sm-quyen.js, TRƯỚC sm-seed-gialai.js** đúng INTERFACE §7(2) |
| 3 | 173–174 `sm-inbox`+`sm-ops` | Bump sót `sm-inbox.js` (tự phát hiện khi đọc lại) |
| 4 | 183–184 sau dòng alias `const D=SM.dom,…` | Thêm `const ON=SM.onb||{}` — alias cạnh các alias sẵn có; `||{}` để app vẫn boot khi W1 chưa nạp |
| 5 | 248–272 trước comment TAB BÁN | Hàm mới `sangNayCard(t)` — thẻ «Sáng nay cần để ý» (D-#11) |
| 6 | 277–279 đầu `viewBan` | `let h=sangNayCard(t); h+=alertsCard(t);` — thẻ đứng đầu tab Bán |
| 7 | 871 menu «Thêm» nhóm cuối | Mục `{id:'tamdung',ic:'🚪',ten:'Tạm dừng dùng OPC',mo:'xuất dữ liệu, ngắt kết nối'}` |
| 8 | 2259–2271 đầu `sheetNhacNo` | `var cuaSo` từ `ON.cuaSoTin(t, so.khach)` + nhánh dựng dòng phí (D-#4); `SM.onb` chưa nạp → `phiTin=''` giữ nguyên hành vi cũ |
| 9 | 2282 trong chuỗi `h` | Chèn `phiTin +` TRƯỚC nút `#nn-send` «Gửi qua Zalo» |
| 10 | 2464 entry `ketnoi` trong `VIEWS` | Đổi thành `ketnoi:[ON.viewTram,ON.bindTram]`; **viewKetnoi/bindKetnoi cũ để nguyên** (tham chiếu chết, không xoá) |
| 11 | 2475–2477 cuối `VIEWS` | Thêm 5 entry: `obkichhoat`, `obnhandien`, `obdanhmuc`, `obcon`, `tamdung` (đúng cặp `ON.viewX/ON.bindX`) |
| 12 | 2480–2487 `bindNhac` | Nhận tham số màn: `data-di="obcon:<ma>"` → `TAB='obcon'` + `SM.setUi({obConMa:<ma>})`; các `data-di` khác giữ nguyên |
| 13 | 2490 `render()` | Phòng hoá `if(!VIEWS[TAB]||!VIEWS[TAB][0]) TAB='ban'` — entry tồn tại nhưng view-fn undefined (W1 chưa nạp) thì rơi về Bán, không màn trắng |
| 14 | 2527–2530 sau `SM.db();render();` | Boot: `SM.onb && !SM.ui().obDaChao && ON.trangThai(SM.current()).buoc==='chua_kich_hoat'` → set cờ `obDaChao` trong `smv3:ui` + điều hướng `obkichhoat` đúng 1 lần («Để sau» vẫn vào app bình thường) |

2 Edit ngoài dải thành công: 1 lần Edit trượt neo (tự gõ sai `TruyXutQR` — đọc lại vùng rồi sửa đúng `TruyXuatQR`), 1 lần tự-sửa comment có `*/` nằm giữa (nguy cơ đóng comment sớm — phát hiện ngay sau khi dán).

## 2. Thiết kế các khối thêm vào

**«Sáng nay cần để ý» (D-#11)** — gom tối đa 5 mục, mọi mục là nút `data-di` đi thẳng, không chữ chết:
- ≤3 mục từ `D.deadlines(t)` (lọc `dichDen` — mục không có đích đã có `alertsCard` ngay dưới đảm nhiệm);
- 1 mục «N sự kiện mới trong hộp thư» từ `SM.inbox.unread(t.id)` + tiêu đề sự kiện mới nhất `trangThai==='moi'` → `hopthu`;
- 1 mục «N việc chờ gửi khi có mạng» từ `SM.queueCount()` → `hopthu` (viewHopThu có sẵn thẻ «Hàng đợi gửi đi» — đích trung thực).
Không mục nào viết cứng số — toàn bộ tính từ kho.

**Dòng phí nhắc nợ (D-#4)** — phân nhánh theo shape `ON.cuaSoTin` của INTERFACE §3:
`duongGui==='giao-dich-165d'` → «Khách im lặng X ngày — hết cửa sổ miễn phí, gửi kiểu Giao dịch 165đ/tin [Q-005]» (note warn);
còn trong cửa sổ 7 ngày → «Tin nhắn miễn phí (còn k/8 trong 48 giờ)» (note br);
nhánh giữa `tu-van-55d` → «gửi tin Tư vấn {phi}đ/tin [Q-005]». Số ngày/số tiền lấy từ đối tượng `cuaSo` (hàm của W1), không viết cứng (155/165 chỉ là fallback `||`).

## 3. toggleConnector (việc 7 của đề)

Grep toàn file: **đúng 1 lời gọi**, dòng 922, nằm trong `bindKetnoi` — hàm đã thành **mã chết** sau khi entry `ketnoi` của router đổi sang `ON.viewTram/ON.bindTram`. Theo đề W6 mục 7 («chỗ gọi nằm trong viewKetnoi cũ thì chỉ ghi chú, không sửa»): **không sửa, để nguyên làm tham chiếu chết**. Không còn lời gọi `toggleConnector` nào sống trong luồng điều hướng. (Báo cáo W2 chưa có lúc tôi grep — tự khảo sát; W2 sẽ xoá hàm trong sm-domain.js.)

## 4. Truyền mã connector cho màn `obcon` (việc 8 của đề)

Cơ chế `data-di` hiện có chỉ nhận id màn (`TAB=b.dataset.di`). Mở rộng: cú pháp `data-di="obcon:<ma>"` → lưu mã vào **`smv3:ui` với khoá `obConMa`** rồi điều hướng. INTERFACE §3 chỉ chốt «nhận mã qua SM.ui» chưa chốt tên khoá — **W1 cần đọc `SM.ui().obConMa` trong `ON.bindObCon`**; nhờ Claude verify đối chiếu giúp khi ghép W1.

## 5. Tự soát cú pháp bằng cách nào (nói thật)

- `node --check` không dùng được trực tiếp cho .html; cố bóc script inline ra file rồi check thì bị sandbox chặn (redirection ngoài thư mục dự án + `node -e` cần duyệt). **Không có bằng chứng parse máy.**
- Thay bằng: (a) đọc lại ±10 dòng quanh **mỗi** chỗ sửa (thực hiện đủ 14/14 vùng, trích trong transcript); (b) soát thủ công từng khối thêm vào — cặp ngoặc `(`/`)`, `{`/`}`, backtick lồng trong `${}` theo đúng idiom `alertsCard` sẵn có; (c) một lỗi thật đã bị bắt ngay bằng cách này (comment chứa `*/` — sửa trong cùng lượt).
- Scan CJK: lần đầu dùng `grep -P` bị macOS từ chối — output dễ gây hiểu nhầm "sạch"; **đã làm lại bằng ripgrep** (`[\x{4e00}-\x{9fff}\x{3040}-\x{30ff}\x{ac00}-\x{d7af}]`) → **No matches found**, sạch thật.

## 6. Grep chứng thực (chạy sau khi sửa xong)

- VIEWS: dòng 2464 `ketnoi:[ON.viewTram,ON.bindTram]` · 2475 `obkichhoat:` · 2475 `obnhandien:` · 2476 `obdanhmuc:` + `obcon:` · 2477 `tamdung:` → đủ 6 entry mới/đổi.
- Script: 171–179 đúng 9 thẻ, tất cả `?v=20260820`, `sm-onboard.js` (176) nằm giữa `sm-quyen.js` (175) và `sm-seed-gialai.js` (177).
- `toggleConnector`: chỉ còn dòng 922 trong mã chết (xem mục 3).

## 7. Chưa làm được / rủi ro tích hợp (nói thật)

1. `js/sm-onboard.js` của W1 **chưa tồn tại** lúc tôi thi công (8 agent song song). Đã phòng hoá 2 tầng (`ON=SM.onb||{}` + render kiểm tra view-fn) nên app boot và chạy bình thường không có W1; nhưng mở «Kết nối»/«Tạm dừng»/wizard trước khi W1 land sẽ rơi về tab Bán — cần verify lại toàn bộ 6 màn sau khi W1 có file.
2. Boot chào wizard phụ thuộc W4 seed tenant `chua_kich_hoat` (CD2/cd4-moi) và `ON.trangThai` tự khởi tạo shape — chưa chạy thử được với seed thật.
3. Tên khoá `obConMa` chờ W1 đối chiếu (mục 4).
4. Không sửa được hành vi «Mọi chữ là lời nói thường» bên trong các màn wizard — đó là việc W1; tôi chỉ nối router.

BUILD-AGENT-DONE W6 14
