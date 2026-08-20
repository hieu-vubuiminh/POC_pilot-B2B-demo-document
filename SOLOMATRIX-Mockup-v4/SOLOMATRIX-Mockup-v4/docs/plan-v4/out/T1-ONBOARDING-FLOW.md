# T1 — KIẾN TRÚC SƯ LUỒNG ONBOARDING LẦN-ĐẦU-ĐĂNG-NHẬP (mockup v4 «Gia Lai»)

Tài liệu kế hoạch — chưa thi công. Mọi mục gắn nhãn nguồn: `[Q-00x]` (findings radar) · `[R-xx]` (REQUIREMENTS) · `[N-xx]` (ANTI-SCOPE) · `THUMOI <mục>` (Thư mời) · `[seed]` (code mockup v3) · `[tự đề xuất]`.
Vị trí neo code dẫn theo file:dòng của v3 hiện hành để bên thi công tìm ngay.

**Đề xuất module mới** `js/sm-onboard.js` (chưa tồn tại — mọi hàm dưới đây đặt ở đó) + sửa `mobile.html` (thêm màn), `js/sm-seed-gialai.js` (thêm `t.onboarding` cho 3 chân dung + 1 tenant mẫu mới), `js/sm-inbox.js` (thêm loại sự kiện onboarding). Không đụng lõi `sm-core.js` — dùng nguyên kho bền + hàng đợi.

---

## 1. Nguyên tắc thiết kế

Đúc từ bằng chứng, mỗi nguyên tắc kèm gốc:

1. **Nói như cán bộ nói với cô chú, không thuật ngữ.** Hộ KD «cơ bản không có kiến thức tài chính, kế toán» [Q-004] — câu chữ hiển thị phải dịch «HĐĐT có mã của CQT» thành «hoá đơn cơ quan thuế đóng dấu mã sẵn». Không bao giờ hiện chữ «connector», «webhook», «OAuth» cho hộ.
2. **Nền tảng CHỦ ĐỘNG HỎI, hộ KHÔNG cần tự biết mình cần gì.** [tự đề xuất, thoả mãn đầu bài CEO + THUMOI III «hộ sẽ dùng những công cụ nào, ai cài đặt»]. Hộ chỉ trả lời 5 câu về chính mình; danh mục kết nối là hàm tính sinh ra từ câu trả lời.
3. **Mọi việc ≤ 3 chạm** (R-A2-04). Mỗi câu hỏi nhận diện = 1 lần bấm, không gõ tay. Gõ tay chỉ chấp nhận ở trường hộ bắt buộc như mã số thuế.
4. **Onboarding KHÔNG chặn dùng app.** Mọi màn có nút «Để sau, dùng app trước»; app vào thẳng tab Bán. Bỏ qua được, quay lại sau — tiến trình không mất [tự đề xuất theo R-A2-07].
5. **Đo bằng thời gian tới việc-đầu-tiên-xong** (R-A2-07), không đếm số màn đã đi qua. Onboarding kết thúc bằng một VIỆC THẬT (bán 1 đơn / nhận 1 lượt đặt / ghi 1 bảng kê), không phải bằng màn «Chúc mừng».
6. **Chưa có tài khoản thì đăng ký NGAY TRONG OPC** — nhưng OPC chỉ CHUẨN BỊ đơn; nút Gửi cuối cùng luôn do NGƯỜI (chủ hộ hoặc người được chủ hộ ủy quyền rõ ràng) bấm (N-06). Màn nào có nút Gửi phải ghi tên người sẽ bấm ngay trên nút.
7. **Mọi trạng thái chờ hiện lead-time THẬT kèm nhãn nguồn** — SePay ~phút [Q-002], cổng HĐĐT 15 phút–1 ngày làm việc [Q-002], Zalo OA 2–3 ngày làm việc [Q-004]. Không có số → hiện «chưa rõ thời gian — có cán bộ theo dõi», không bịa.
8. **Mất mạng không mất tiến trình.** Câu trả lời ghi thẳng kho cục bộ (`SM.save()`, kho bền `smv3:db` [seed sm-core.js:87-90]); việc gửi hồ sơ đi xếp hàng đợi offline (`SM.enqueue`) và tự drain khi có mạng (THUMOI IV.4 · sm-core.js:169-215).
9. **Không có kết quả viết cứng** [seed README]. Tiến độ %, số nhóm đạt, hạn chờ... đều là hàm tính từ `t.onboarding` + `D.connectorSummary(t)`.
10. **Mỗi kết nối nói «giá trị mở khoá» bằng 1 câu đời thường** trước khi xin bất cứ thứ gì — hộ phải thấy được gì trước khi bị xin tài khoản.

---

## 2. Máy trạng thái onboarding

### 2.1 Trạng thái tiến trình tổng (`t.onboarding.buoc`)

```
chua_kich_hoat → kich_hoat → da_tra_loi → da_sinh_danh_muc → dang_noi → du_toi_thieu → xong_viec_dau
                        ↘ bo_qua_tam (bất kỳ bước nào → quay lại đúng bước đang dở)
```

| Trạng thái | Nghĩa | Điều kiện chuyển |
|---|---|---|
| `chua_kich_hoat` | Chưa có license (mã suất/tự mua) | nhập mã hợp lệ → `kich_hoat` |
| `kich_hoat` | Có license, chưa hỏi gì | bấm «Bắt đầu» màn OB-2 → `da_tra_loi` |
| `da_tra_loi` | Đủ 5 câu nhận diện | `ON.danhMucCho(t)` sinh xong → `da_sinh_danh_muc` |
| `da_sinh_danh_muc` | Có danh mục kết nối riêng của hộ | connector đầu tiên vào `dang_dang_ky/cho_duyet/da_ket_noi` → `dang_noi` |
| `dang_noi` | Đang nối từng cái (có thể kéo dài nhiều ngày — chờ duyệt Zalo 2–3 ngày làm việc [Q-004]) | mọi connector nhóm BẮT BUỘC ở `da_ket_noi` hoặc `bo_qua`-có-lý-do → `du_toi_thieu` |
| `du_toi_thieu` | Đủ danh mục tối thiểu theo luật | việc đầu tiên `done` → `xong_viec_dau` |
| `xong_viec_dau` | **Đích đo R-A2-07** — ghi `batDauLuc`/`doneLuc` để tính thời gian | — |
| `bo_qua_tam` | Bấm «Để sau» — app vẫn dùng bình thường; banner mờ ở Trạm kết nối | mở lại → về đúng bước cũ |

### 2.2 Trạng thái từng connector (`t.onboarding.ketNoi[ma]`)

Đủ 7 trạng thái theo đề (tên không dấu theo phong cách seed):

| Trạng thái | Khi nào | Hiển thị trên Trạm |
|---|---|---|
| `chua_hoi` | Danh mục sinh ra nhưng chưa mở luồng | thẻ xám «Chưa hỏi» |
| `chua_co_tk` | Hộ trả lời chưa có tài khoản dịch vụ đó | thẻ vàng «Chưa có — đăng ký ngay trong app» |
| `dang_dang_ky` | Hồ sơ đã gửi (hộ bấm nút) hoặc đang đi đến bước xin quyền | thẻ xanh nhạt «Đang gửi/đang xin quyền» |
| `cho_duyet` | Đã gửi, chờ bên thứ ba — **bắt buộc kèm `hanDuKien`** | thẻ xanh nhạt «Đang chờ {ai} — dự kiến {ngày}» |
| `da_ket_noi` | Có tín hiệu xác nhận từ ngoài về (webhook thử / mã phản hồi) | thẻ xanh «Đã nối + số liệu đã chảy» |
| `loi` | Từ chối / hết hạn / lỗi kỹ thuật, kèm `lyDo` nguyên văn | thẻ đỏ + nút «Xem lỗi» |
| `bo_qua` | Hộ chủ động bỏ, bắt buộc ghi `lyDoBoQua` | thẻ xám gạch ngang + lý do |

**Quy tắc chuyển vào `da_ket_noi`: không phải do hộ bấm nút «Nối» nữa** (v3 toggleConnector chỉ bật cờ — giả). Chỉ có 2 đường hợp lệ: (a) sự kiện xác nhận từ ngoài đẩy qua hộp thư đến (sm-inbox), (b) cán bộ xác nhận tay kèm ghi nhật ký. Nguồn gốc của mọi chuyển trạng thái ghi vào `t.nhatKy` (dùng `O.ghiNhatKy` sẵn có).

### 2.3 Hình dạng dữ liệu lưu trong kho

Đặt trong tenant, đúng phong cách đặt tên tiếng-Việt-không-dấu của seed (`taxFiled`, `dongLuc`, `anhBienNhan`...):

```js
t.onboarding = {
  buoc: 'chua_kich_hoat',          // máy trạng thái 2.1
  boQuaLuc: null,                    // ISO ngày bấm «Để sau» gần nhất
  traLoi: {                          // 5 câu nhận diện, mục 3b
    nganh: null,                     // 'dac-san' | 'du-lich' | 'nong-san'
    giayTo: null,                    // 'co-mst' | 'chi-gpkd' | 'chua-co' | 'chua-ro'
    kenh: [],                        // mảng mã kênh: 'quay','b2b','san','zalo','live','food','booking'
    doanhThuUoc: null,               // 'duoi-1-ty' | 'sap-1-ty' | 'tren-1-ty' | 'khong-biet'
    posHienTai: null,                // 'giay-so' | 'phan-mem-khac' | 'may-tinh-tien' | 'chua-ro'
  },
  ketNoi: {                          // [maConnector]: mục 2.2
    hddt: { trangThai:'cho_duyet', batDauLuc:'2026-08-18', hanDuKien:'2026-08-19',
            hoSoDaNop:['don-dang-ky-hddt','anh-gpkd'], aiBam:'Chị Trần Thu Hà' },
  },
  coCanBo: null,                     // hoặc { maCanBo:'CB-07', ten:'Anh Ngọc', diaBan:'...' } — mục 4
  viecDauTien: { loai:null, batDauLuc:null, doneLuc:null },   // đích đo R-A2-07
};
```

### 2.4 Mất mạng giữa chừng — tận dụng sm-core có sẵn

- **Trả lời câu hỏi**: ghi thẳng tenant rồi `SM.save()` — kho bền đã sống qua F5 (sm-core.js:87-90), nên đóng app giữa OB-2 mở lại vẫn ở đúng câu đang dở.
- **Gửi hồ sơ đăng ký**: dùng đúng hàng đợi hiện có, thêm kind mới `SM.enqueue('dangky', 'Gửi đăng ký {dịch vụ}', { tenant, connector })` — khi offline việc nằm chờ, `setOnline(true)` tự `drain()` (sm-core.js:155-160). Màn hiển thị badge «Sẽ gửi khi có mạng» lấy từ `SM.queueCount()`.
- **Ngày tháng**: mọi mốc onboarding dùng `SM.CLOCK.today` (đồng hồ demo cố định [seed sm-core.js:56]) + `SM.dayOffset` (đã fix múi giờ) — hạn chờ `hanDuKien = dayOffset(today, nNgayLamViec)` tính bằng hàm đếm ngày làm việc mới `ON.congNgayLamViec(iso, n)` đặt trong sm-onboard.js. `batDauLuc/doneLuc` của `viecDauTien` cũng lấy CLOCK — demo tái lập được.
- **Sự kiện từ ngoài về khi đang offline**: theo đúng mô hình sm-inbox hiện có — sự kiện vẫn vào sổ, ghi rõ nhận được khi có mạng lại [seed sm-inbox.js:299-310].

---

## 3. Kịch bản màn-theo-màn (wireframe bằng chữ)

Quy ước: id màn mới đều có tiền tố `ob` nối-viết-thường như id hiện có (`hopthu`, `ketnoi`...). Mỗi màn ghi: câu chữ hiển thị NGUYÊN VĂN → input → hành vi → nhánh rẽ. «Đích» = file sửa + id màn; «Nghiệm thu» = tiêu chí đo được khi chạy `python3 -m http.server 8126`.

Mô phỏng chung (luật 4 — mockup tĩnh, không backend): mọi «bên ngoài» (cổng thuế, Zalo, SePay, sàn) xuất hiện qua **bảng giả lập sự kiện onboarding** mở rộng `KICH_BAN` của sm-inbox.js, đúng hình dạng webhook hiện có (`NGUON`, `push`, `process`). Nút «Mô phỏng: {sự kiện}» chỉ nằm trong khối «công cụ demo» góc màn (như nút «Thử nhận đơn từ kênh khác» của tab Bán hiện nay) — hộ không gõ tay dữ liệu lẽ ra tự chảy [Quy tắc lộ đường đi].

### 3a. OB-1 «Kích hoạt» — id màn `obkichhoat`

> **«Chào cô chú. Đây là lần đầu mở app — làm phần mở đầu một lần thôi, chừng 5 phút.
> Có cán bộ ngồi cạnh thì đưa điện thoại cho cán bộ quét mã, càng nhanh.
> Chưa muốn làm bây giờ? Bấm "Để sau, vào dùng trước" — không sao cả.»**
> — **[Để sau, vào dùng trước]** · **[Tôi có mã suất của Chương trình]** · **[Tôi tự mua, đã có tài khoản]**

- **Input**: nhánh Chương trình → ô quét QR (nút «Mô phỏng quét QR» chèn mã `GL26-XXXX-XXXX`) hoặc ô gõ 12 ký tự; nhánh tự mua → ô tài khoản + mật khẩu (mockup: bất kỳ chuỗi nào cũng vào được, vì đây là bản mô phỏng — hiện dòng chữ đó ngay trên form).
- **Đường đi của mã (lộ đường đi)**: cán bộ in/tải QR từ bảng điều khiển `b2g.html` (mỗi suất một mã, gắn tenant) → camera quét → mã resolve thành `{tenantId, loai:'chuong-trinh', capLuc}` → gắn license vào `t.license`, `buoc` → `kich_hoat`. QR sai 3 lần → hiện «Gọi cán bộ hỗ trợ địa bàn» (lấy từ màn `hoso` hiện có, mobile.html:931-956) chứ không treo hộ ở đó.
- **Nhánh rẽ**: mã của suất đã có người dùng rồi (mockup: mã trùng tenant đã `kich_hoat`) → «Mã này đã kích hoạt trên máy khác. Nếu đổi điện thoại, bấm "Tôi đã từng dùng OPC"» → dẫn nhánh onboarding-lại (mục 5).
- **Đích**: `mobile.html` thêm router `obkichhoat:[viewObKichHoat,bindObKichHoat]` (đăng ký cạnh dòng mobile.html:2420); seed thêm `t.license`.
- **Nghiệm thu**: mở `mobile.html` lần đầu (sau «Nạp lại dữ liệu mẫu») thấy OB-1 trong 2 giây; bấm «Để sau» vào thẳng tab Bán; bấm «Mô phỏng quét QR» → `t.onboarding.buoc === 'kich_hoat'` (kiểm tra bằng console `SM.current().onboarding.buoc`).
- **Nguồn**: THUMOI IV.7 (thanh toán theo số hộ đã **cài đặt** — kích hoạt là mốc đầu) · cấu trúc suất Chương trình THUMOI I.3.

### 3b. OB-2 «Nhận diện hộ» — id màn `obnhandien` — đúng TỐI ĐA 5 câu, mỗi câu 1 màn

Mỗi câu một màn, thanh tiến độ 5 chấm, nút «Để sau» ở mọi câu (thoát an toàn về `bo_qua_tam`).

**Câu 1 — Nghành nghề.**
> **«Hộ mình làm nghề gì?»** *(chọn 1)*
> — «Đặc sản, đồ ăn đồ uống» · «Du lịch: ăn uống, nghỉ, tour» · «Nông sản: thu mua, sơ chế»

- Vì sao cần: chọn bộ câu hỏi + danh mục kết nối + seed phù hợp (3 ngành của Chương trình, THUMOI I.3).
- Đổ vào `traLoi.nganh`; đối chiếu chéo `t.nganh` — nếu khác nhau giữ `traLoi.nganh` làm chuẩn cho danh mục (hộ tự nói về mình đúng hơn hồ sơ).
- «Không biết» không áp dụng (ai cũng biết mình bán gì).

**Câu 2 — Giấy tờ.**
> **«Nhà mình đã đăng ký kinh doanh chưa?»** *(chọn 1)*
> — «Có giấy phép lẫn mã số thuế» · «Có giấy phép, chưa có mã số thuế» · «Chưa đăng ký gì cả» · **«Chưa rõ — để cán bộ kiểm tra giúp»**

- Vì sao cần: gần như mọi kết nối đều xin MST/GPKD (đăng ký HĐĐT bằng MST [Q-002]; Zalo OA xác thực cần Giấy phép ĐKKD [Q-004]).
- Đổ vào `traLoi.giayTo`. Nhánh «chưa có» → màn OB-3 thêm mục sớm «Làm giấy phép đăng ký» ở nhóm BẮT BUỘC (Chương trình đồng hành — THUMOI IV.6; mockup: chỉ checklist chuẩn bị hồ sơ + cán bộ theo, không làm thay thủ tục — N-06).
- «Chưa rõ» → `giayTo:'chua-ro'`, các connector cần MST sinh ở trạng thái `chua_hoi` kèm dòng «Cần xác định giấy tờ trước — cán bộ sẽ kiểm tra»; không chặn các connector khác.

**Câu 3 — Kênh bán (chọn nhiều).**
> **«Hàng/dịch vụ bán qua đường nào?»** *(bấm vài cái cũng được, bấm lại để bỏ)*
> — «Tại cửa hàng/quầy» · «Bán cho nhà hàng, công ty (công nợ, hoá đơn)» · «Sàn Shopee/TikTok/Lazada» · «Zalo, Facebook nhắn khách» · «Bán qua phát trực tiếp» · «App giao đồ ăn» · «Khách đặt phòng/đặt tour»

- Vì sao cần: quyết định nhóm sàn/vận chuyển/app đồ ăn/nền tảng đặt phòng xuất hiện trong danh mục — danh mục TUỲ LOẠI HÌNH KINH DOANH (đầu bài CEO; THUMOI IV.3 cũng bắt tối thiểu theo ngành).
- Đổ vào `traLoi.kenh` (mảng mã). Ưu tiên: nếu `traLoi.kenh` rỗng → mọi connector kênh-bán về nhóm ĐỂ SAU, không hỏi.

**Câu 4 — Doanh thu năm ước (3 nấc).**
> **«Một năm bán được khoảng bao nhiêu? Cộng hết các kênh lại, ước thôi cũng được.»** *(chọn 1)*
> — «Chưa tới 1 tỷ» · «Khoảng chừng 1 tỷ, có khi vượt» · «Trên 1 tỷ rồi» · **«Không biết»**
> *(dòng phụ ngay dưới, chữ nhỏ: «Hỏi để biết hộ mình có phải dùng hoá đơn điện tử cơ quan thuế không thôi. Bán trên 1 tỷ một năm thì theo quy định phải dùng hoá đơn điện tử có mã, và phải đăng ký trong 30 ngày. Số này sau này app tự theo dõi bằng số bán thật — cô chú không phải khai gì thêm.»)*

- Vì sao hỏi bằng lời dễ hiểu: ngưỡng 1 tỷ quyết định nghĩa vụ HĐĐT + 30 ngày đăng ký [Q-001]; hộ «cơ bản không có kiến thức tài chính» [Q-004] nên phải giải thích vì-sao-hỏi ngay tại chỗ, kèm cam kết không dùng để «báo ai».
- Đổ vào `traLoi.doanhThuUoc`. «Không biết» → `khong-biet`: app không đoán — gắn cờ theo dõi lũy kế bằng số bán thật (hàm `D.revenueLines` có sẵn) và hiện ở Trạm dòng «App đang theo dõi doanh thu để biết khi nào cần hoá đơn»; riêng câu này còn gợi ý «Cách ước nhanh: lấy tiền bán trung bình một tháng × 12» (văn bản hướng dẫn, không phải phép tính viết cứng).
- Chân dung khớp: CD1 → `tren-1-ty` (1.020tr) · CD2 → `sap-1-ty` (780tr, ước cả năm 1.243tr) · CD3 → `duoi-1-ty` (607tr) [seed sm-seed-gialai.js:11-12, README].
- **Đích**: `mobile.html` + `js/sm-onboard.js` (hàm `ON.danhMucCho(t)`).
- **Nghiệm thu**: chọn 3 nấc khác nhau trên 3 lần reset → OB-3 hiện 3 danh mục khác nhau đúng Bảng mục 3c.

**Câu 5 — Đang bán bằng gì.**
> **«Hiện ghi chép bán hàng bằng gì?»** *(chọn 1)*
> — «Ghi giấy/vở» · «Dùng app hoặc phần mềm khác» · «Có máy tính tiền in hoá đơn» · **«Chưa rõ»**

- Vì sao cần: (a) «phần mềm khác» → sinh mục ĐỂ SAU «chuyển dữ liệu từ phần mềm cũ» (khoá dữ liệu là điều khoản, THUMOI IV.3 — màn `dulieu` hiện có); (b) «máy tính tiền» → nối HĐĐT theo đường «máy tính tiền kết nối dữ liệu CQT» [Q-001] thay vì đường app phát hành; (c) «ghi giấy» → nhấn mạnh việc-đầu-tiên cho quen dần.
- Đổ vào `traLoi.posHienTai`; «Chưa rõ» → coi như `giay-so`, không hỏi lại.

- **Đích**: `mobile.html` màn `obnhandien` (5 màn con), logic `ON.traLoi(t, cau, gt)`.
- **Nghiệm thu chung OB-2**: đi hết 5 câu chỉ bấm (không gõ bàn phím) trừ trường mã suất; đóng app giữa câu 3 mở lại → đứng đúng câu 3 (kho bền); `t.onboarding.traLoi` đủ 5 khóa.

### 3c. OB-3 «Danh mục kết nối của hộ» — id màn `obdanhmuc`

> **«Dựa trên những gì cô chú vừa cho biết, app lập danh sách những thứ nhà mình nên nối.
> Cái nào là LUẬT ĐÒI thì làm sớm — app ghi rõ vì sao. Còn lại là để bán đỡ vất vả hơn.»**

Sinh bằng `ON.danhMucCho(t)` — hàm thuần từ `traLoi`, KHÔNG viết cứng danh sách. Ba nhóm:

**Nhóm BẮT BUỘC THEO LUẬT** (mỗi mục kèm 1 dòng «vì sao» + «giá trị mở khoá»):

| Điều kiện sinh | Mục | Vì sao (hiển thị rút gọn) | Nguồn |
|---|---|---|---|
| mọi hộ | Kê khai thuế điện tử (eTax/cổng thuế) | «Từ 01/01/2026 hết thuế khoán, hộ tự kê khai theo dòng tiền» | [Q-001] NQ 198/2025/QH15 |
| `doanhThuUoc='tren-1-ty'` | Hoá đơn điện tử + Chữ ký số | «Trên 1 tỷ/năm phải dùng hoá đơn điện tử có mã; phải đăng ký trong 30 ngày kể từ kỳ vượt ngưỡng» | [Q-001] |
| `doanhThuUoc='sap-1-ty'` hoặc `'khong-biet'` | «Canh ngưỡng 1 tỷ» (không phải connector — là theo dõi) | «Chưa bắt buộc hôm nay. App theo dõi tổng bán thật, tới lúc gần 1 tỷ sẽ nhắc làm hồ sơ trước 30 ngày» | [Q-001] + hàm tính lũy kế |
| `kenh` có 'san' | Ghi nhận thuế sàn khấu trừ nộp thay | «Sàn đã nộp thay phần của hộ — app chỉ đối chiếu, không khai lại» | [Q-001·Q-019] NĐ 117/2025 |
| `giayTo='chua-co'` | Checklist làm GPKD (cán bộ đồng hành) | «Hầu hết kết nối dưới đây cần giấy phép» | [Q-004] + THUMOI IV.6 |

**Nhóm NÊN CÓ** (vận hành + danh mục tối thiểu IV.3 — kế thừa ngưỡng `connectorSummary` hiện có sm-domain.js:896): tài khoản ngân hàng + QR (đối soát tiền về, SePay webhook 12+ ngân hàng [Q-002]); sàn TMĐT nếu `kenh` có 'san' (tối thiểu 3 theo THUMOI IV.3); vận chuyển (tối thiểu 3); app giao đồ ăn nếu ngành đặc sản (tối thiểu 1); nền tảng đặt phòng nếu du lịch (tối thiểu 2) [THUMOI IV.3]; Zalo OA (kênh chạm khách chính ở tỉnh, 62% MSME dùng app nhắn tin cho kinh doanh [Q-004, số 2021]).

**Nhóm ĐỂ SAU**: nền tảng dùng chung Nhà nước `ntqg` (NĐ 20/2026 — mockup giữ cờ «chưa vận hành» như v3 [seed sm-domain.js:856-857, Q-001]); kế toán MISA nếu hộ >1 tỷ đã dùng (cấp quyền qua nhân viên kinh doanh — không tự phục vụ [Q-002]); chuyển dữ liệu từ phần mềm cũ nếu `posHienTai='phan-mem-khac'`.

Mỗi mục hiện **«giá trị mở khoá»** — ví dụ: SePay → «Tiền về tới đâu app biết ngay, khỏi mở app ngân hàng đối chiếu»; Zalo OA → «Khách nhắn 22 giờ cũng có câu trả lời soạn sẵn»; HĐĐT → «Khách sạn đòi hoá đơn là xuất được ngay, công nợ tự gắn theo hoá đơn».

**Ba chân dung cho 3 danh mục khác nhau** (đề này chính là yêu cầu «danh mục tuỳ loại hình»):

| | CD1 Biển Xanh | CD2 Nhơn Lý | CD3 Chư Păh |
|---|---|---|---|
| BẮT BUỘC | HĐĐT + CTS (đã vượt 1 tỷ) · kê khai điện tử · thuế sàn | kê khai điện tử · **canh ngưỡng** (780tr) | kê khai điện tử · thuế sàn |
| NÊN CÓ | SePay · 3 sàn · GHN + chuyển phát lạnh · Zalo OA · QR 2 điểm | SePay · 2 nền tảng đặt phòng · QR 4 điểm · Zalo OA | SePay · 3 sàn · vận chuyển · Zalo OA · thu mua bảng kê (việc riêng chân dung) |
| ĐỂ SAU | MISA (khách sạn cần sổ riêng) | — (mùa vụ chênh lớn → nhắc kỳ kê khai) | ntqg · vùng trồng mã số |
| Nguồn chân dung | [seed CD1] kenh `quay,b2b,shopee,tiktok,lazada,zalo` | [seed CD2] `quay,b2b,booking,zalo,food` | [seed CD3] `b2b,shopee,tiktok,live,zalo` |

- **Đích**: `mobile.html` `obdanhmuc`; `js/sm-onboard.js` `ON.danhMucCho(t)`.
- **Nghiệm thu**: reset → đi OB-2 theo 3 bộ câu trả lời của CD1/CD2/CD3 → 3 danh mục đúng bảng trên (so từng dòng); nhóm BẮT BUỘC của CD1 có dòng chữ «30 ngày» và nhãn [Q-001] trong nguồn màn hình (xem bằng chế độ «xem nguồn màn hình» của công cụ demo).

### 3d. OB-4 «Luồng từng connector» — id màn `obcon-<ma>`

Mỗi connector một luồng 2 nhánh, hỏi trước:

> **«{Tên dịch vụ} — nhà mình ĐÃ có tài khoản chưa?»**
> — **«Có rồi»** · **«Chưa có — đăng ký ngay trong app»** · **«Để sau»**

#### Kiểu 1 — SEPAY «tức thì» (đại diện self-serve nhanh) [Q-002]

- **Nhánh CÓ** (hộ đã có tài khoản ngân hàng): xin gì — chọn ngân hàng trong 12+ ngân hàng SePay hỗ trợ [Q-002] → app mở trang xác nhận của SePay (mockup: màn trung gian vẽ đúng URL `developer.sepay.vn` + chữ «Trang này do SePay phụ trách») → hộ nhập OTP ngân hàng (ai cấp OTP: ngân hàng của hộ) → SePay bắn **webhook thử** → nhận được = `da_ket_noi`. Số bước: 3 chạm. Lead-time: «khoảng vài phút» [Q-002].
- **Nhánh CHƯA** (chưa có tài khoản ngân hàng): app KHÔNG mở hộ tài khoản — hiện checklist «Đem CCCD đến quầy ngân hàng gần nhất; muốn chọn ngân hàng nào cứ hỏi cán bộ» + nút «Xong, tôi đã có tài khoản» → quay về nhánh CÓ. (Mở tài khoản là nghiệp vụ ngân hàng — ngoài scope, N-07 tinh thần không ôm việc của bên khác.)
- **Ai bấm cuối**: hộ bấm «Xác nhận cấp quyền»; OTP do ngân hàng gửi cho hộ. Cán bộ không được làm thay bước OTP.
- **Kỹ thuật hiển thị ở khối «cài đặt nâng cao» (chỉ cán bộ)**: webhook at-least-once, retry 7 lần giãn Fibonacci ~33 phút, quá 5 giờ bỏ; response 200 trong 30 giây (Webhooks) / 8 giây (Bank Hub IPN); hệ thống chống trùng theo `id`/`transaction_id` [Q-002·Q-006].
- **Mô phỏng**: nút «Mô phỏng: SePay bắn webhook thử» → đẩy sự kiện `tien-ve` (kịch bản `tienVe` hiện có sm-inbox.js:215-226) → nếu nó thành tiền trong bảng thanh toán = kết nối sống thật trong mô phỏng. Kiểm tra đường đi: webhook → inbox → `process()` → dòng tiền mới trong tab Tiền.
- **Nghiệm thu**: từ OB-1 tới SePay `da_ket_noi` ≤ 10 chạm tổng; sau khi nối, kịch bản «Tiền về» chạy mà tab Tiền tăng đúng số tiền payload.

#### Kiểu 2 — ZALO OA «chờ duyệt» [Q-004]

- **Nhánh CÓ OA**: xin gì — số điện thoại quản trị OA + quét mã «cấp quyền cho OPC quản tin» (mô phỏng). **THIẾU BẰNG CHỨNG** — cơ chế cụ thể uỷ quyền OA sẵn có cho bên thứ ba chưa soi được (Q-002 mới soi cổng Zalo cho OA mới). Đề xuất câu hỏi radar: *«Zalo OA: API/uỷ quyền cho bên thứ ba nhận-đáp tin thay OA (connector) có không, điều kiện gì?»* Trong mockup: nhánh này gắn `cho_duyet` kèm «chờ xác nhận cơ chế — cán bộ kiểm tra».
- **Nhánh CHƯA**: form thu hồ sơ ngay trong OPC — cần **Giấy phép ĐKKD** [Q-004] + tên OA mong muốn + ảnh đại diện. App điền sẵn từ `t` (tên hộ, MST, địa bàn); hộ chỉ chụp ảnh giấy phép (nút «Chụp ảnh» — mockup: nút «Đính kèm ảnh mẫu»). **Xem trước đơn dạng PDF** → nút to: **«Chủ hộ bấm: Gửi đăng ký»** (tên người bấm lấy từ `t.chuHo`). Sau khi bấm: `cho_duyet`, `hanDuKien` = hôm nay + 2–3 ngày làm việc [Q-004], dòng hiển thị «Ban quản trị Zalo duyệt hồ sơ trong 2–3 ngày làm việc».
- Trong lúc chờ: app vẫn nhận tin từ Zalo CÁ NHÂN của hộ (seed `messages` kênh `zalo` đang là cá nhân [seed]) — khách không phải chờ.
- **Giá trị mở khoá + ràng buộc phí tin** hiển thị trong màn: trả lời khách trong cửa sổ tương tác 7 ngày, 8 tin miễn phí/48 giờ rồi 55đ/tin; tin Giao dịch 165đ/tin [Q-005] — để hộ hiểu vì sao «tin tự động» có giới hạn.
- **Nghiệm thu**: bấm Gửi → `cho_duyet` + `hanDuKien` đúng = hôm nay + số ngày làm việc (thứ 7/chủ nhật bỏ qua); nút «Mô phỏng: Zalo duyệt xong» (kéo sự kiện `ket-qua-duyet`) → `da_ket_noi` + dòng nhật ký.

#### Kiểu 3 — HĐĐT / CTS «điều kiện + người ký» [Q-001][Q-002]

- **Điều kiện trước tiên** (màn tự đánh giá, không hỏi thêm): nếu `doanhThuUoc` ≤1 tỷ → mục này hiện «Chưa bắt buộc với hộ mình — app canh ngưỡng» và KHÔNG cho gửi hồ sơ (tránh hộ đăng ký thứ chưa cần); nếu `tren-1-ty` → hiện đếm lùi «30 ngày» [Q-001] tính từ mốc cuối kỳ đang mở (hàm từ `D.periodRange`).
- **Nhánh ĐÃ có HĐĐT** (đang dùng nhà cung cấp Viettel/VNPT/MISA/FPT/SePay — các NCC được CQT công nhận [Q-002]): hỏi «Ai đang phát hành hoá đơn cho nhà mình?» → sinh việc «đối tác cũ → chuyển/ghép nối OPC» — **THIẾU BẰNG CHỨNG** cơ chế chuyển đổi từng NCC; đề xuất câu hỏi radar: *«Mỗi NCC HĐĐT (Viettel/VNPT/MISA/FPT/SePay) có API/uỷ quyền cho nền tảng thứ ba phát hành hộ không?»* Mockup: trạng thái `cho_duyet` không hạn cụ thể + dòng «chưa rõ thời gian — cán bộ theo dõi».
- **Nhánh CHƯA có** — 2 đường, app xếp sẵn:
  1. **Cổng miễn phí**: hoadondientu.gdt.gov.vn — hoá đơn có mã **miễn phí**, đăng ký bằng MST, phản hồi **15 phút–1 ngày làm việc** [Q-002]. App điền đơn từ hồ sơ (`t.mst`, `t.name`); **chủ hộ bấm «Gửi đăng ký»** (N-06). Lead-time hiển thị đúng «15 phút đến 1 ngày làm việc» [Q-002].
  2. **Qua NCC trung gian có API** (phát hành thẳng trong app, ký số online 100% không cần USB token — SePay eInvoice [Q-002]): phí/phương thức **THIẾU BẰNG CHỨNG** trong bảng số liệu → đề xuất câu hỏi radar: *«SePay eInvoice: giá phát hành mỗi hoá đơn cho hộ KD, cách cấp quyền?»* Mockup hiển thị «đang kiểm tra giá — sẽ hỏi trước khi bật».
- **Chữ ký số**: bắt buộc cho phát hành HĐĐT · kê khai/nộp thuế điện tử · BHXH điện tử [Q-001]. Có 2 đường: đã có token USB → «mượn máy tính có cổng, 1 lần»; hoặc đường **ký số online không cần USB token** [Q-002]. **Người ký số là chủ hộ — không ai ký thay** (N-06); màn xác nhận ký hiện rõ họ tên `t.chuHo` và câu «Chữ ký này là của cô/chú, dùng cho hoá đơn và tờ khai — không ai khác dùng được». Hồ sơ đăng ký CTS cần gì cho hộ KD: **THIẾU BẰNG CHỨNG** → câu hỏi radar: *«Đăng ký chữ ký số cá nhân/chủ hộ KD online: hồ sơ, phí, thời gian?»*
- **Nghiệm thu**: CD1 (đã >1 tỷ) thấy nút đường cổng + đếm «30 ngày»; CD3 (dưới ngưỡng) không thấy nút gửi, chỉ thấy «canh ngưỡng»; sau «Mô phỏng: cổng thuế phản hồi» → `da_ket_noi` và thử phát hành 1 hoá đơn cho khách sạn (dùng màn hoá đơn hiện có) → hoá đơn có mã CQT.

#### Bảng tham số các connector còn lại (T2 sẽ đặc tả đủ — đây là khung)

| Mã | Xin gì khi ĐÃ có | Hồ sơ khi CHƯA có | Lead-time + nhãn | Ai bấm cuối | Ghi chú nguồn |
|---|---|---|---|---|---|
| `bank` | Số tài khoản + cấp quyền đọc biến động (qua SePay kiểu 1) | checklist mở TK ngân hàng | ~phút [Q-002] | hộ (OTP NH) | trùng SePay |
| `qr` | Chọn điểm quét từ `t.qrPoints` [seed] | tạo điểm quét mới | tức thì (nội bộ) | hộ | R-A1-05 |
| `shopee` | tài khoản open.shopee.com + app + publish + **shop uỷ quyền**; access_token 4 giờ, refresh 1 tháng [Q-002] | hướng dẫn mở shop trên sàn (sàn cấp) | publish app: **THIẾU BẰNG CHỨNG**; uỷ quyền shop: trong phiên | chủ shop | hạn chuyển kết nối hợp lệ 27/05/2026 [Q-002] |
| `tiktok`,`lazada` | tương tự Shopee | tương tự | **THIẾU BẰNG CHỨNG — câu hỏi radar: điều kiện + lead-time TikTok Shop/Lazada Open Platform** (Q-002 ghi rõ chưa soi) | chủ shop | R-A1-06 |
| `ghn`,`ghtk`,`vtp` | API key/người bán từ app hãng | hướng dẫn đăng ký người gửi | **THIẾU BẰNG CHỨNG — câu hỏi radar** (R-A1-07 mới có seed) | hộ | R-A1-07 |
| `food`,`grab` | uỷ quyền nhà hàng trong app hãng | mở quán trên app | THIẾU BẰNG CHỨNG | hộ | THUMOI IV.3 |
| `booking`,`agoda`,`travel` | tài khoản đối tác nền tảng | mở listing (cần GPKD/ATTP tùy nền) | THIẾU BẰNG CHỨNG — câu hỏi radar | hộ | THUMOI IV.3 |
| `fb` | trang Facebook + quyền nhắn tin | tạo trang | THIẾU BẰNG CHỨNG | hộ | R-A1-08 |
| `etax`,`cthue` | mã truy cập eTax (tự hộ tạo) | hướng dẫn tạo trên app eTax | tức thì trong phiên; **API đọc trạng thái kê khai chưa có tài liệu công khai → trỏ Q-024** [Q-002] | hộ | R-A1-01 |
| `misa` | đăng ký qua **nhân viên kinh doanh** (app_id/access_code) — không tự phục vụ [Q-002] | — | thương mại, không số | Quang/đối tác | N-01 ranh giới |
| `ntqg` | — | — | «chưa vận hành» giữ nguyên `chuaCo` [seed] | — | Q-001 NĐ 20/2026 |

### 3e. OB-5 «Trạm kết nối» — id màn `obtram` (màn tiến độ tổng)

> **«Trạm kết nối — việc gì đang chờ ai, app nhớ hết.»**

- **Thanh tiến độ**: `%` = hàm tính `ON.tienDo(t)` = (số connector `da_ket_noi` + số `bo_qua`-có-lý-do) / (tổng connector trong danh mục sinh ra). Không viết cứng.
- **«Đang chờ ai»**: mỗi dòng `cho_duyet` hiện — dịch vụ · bên chờ · dự kiến ngày (`hanDuKien`) · đã chờ mấy ngày. Ví dụ seed CD2: «Zalo OA — chờ Ban quản trị Zalo duyệt — dự kiến 21/08 — đã chờ 1 ngày» [Q-004].
- **Đến hạn rồi im lặng**: cơ chế «kéo đối soát» mỗi 24 giờ (polling an toàn tối thiểu 24h [Q-003] — mockup: nút «Kiểm tra ngay» trong khối demo) + nếu quá hạn: dòng đỏ «Đã quá dự kiến —**gọi cán bộ**» (nút gọi từ màn `hoso`).
- **Kênh nhắc tới hạn** (ràng buộc [Q-005] + N-09): nhắc chính = **thông báo trong app** (chấm đỏ tab Thêm + dòng đầu Trạm). Nhắc đẩy = Zalo OA **tin Tư vấn** — chủ hộ tương tác hằng ngày nên nằm trong cửa sổ 7 ngày và 8 tin miễn phí/48 giờ [Q-005]; nếu im lặng quá 7 ngày thì dùng **tin Giao dịch 165đ/tin** [Q-005]. **KHÔNG dùng tin Truyền thông/broadcast** (trần 04 tin/tháng gói Premium [Q-005], N-09). Màn hiển thị đúng chi phí này để cán bộ thấy mô hình vận hành thật.
- **Nghiệm thu**: tiến độ % khớp đếm thủ công trạng thái trong `t.onboarding.ketNoi`; một connector quá `hanDuKien` (mockup quay CLOCK hoặc seed trước) hiện dòng đỏ + nút gọi.

### 3f. OB-6 «Việc đầu tiên» — id màn `obviecdau`

> **«Nối xong rồi — làm một việc thật luôn cho nhớ tay. Chọn một việc:»**

Việc đề xuất **theo chân dung** (hàm từ `traLoi.nganh` + dữ liệu sẵn):

| Chân dung | Việc đầu tiên | Câu chữ nút |
|---|---|---|
| CD1 (đặc sản, có quầy + sàn) | Bán 1 đơn tại quầy (món có sẵn) rồi vào tab Tiền xem nó hiện | «Bán món đầu tiên ngay» |
| CD2 (du lịch, có lịch) | Nhận 1 lượt đặt vào lịch hôm nay (mô phỏng khách Zalo đặt cano) | «Nhận lượt đặt đầu tiên» |
| CD3 (nông sản, mùa thu mua) | Ghi 1 bảng kê thu mua hôm nay (chụp giấy tờ nông dân) | «Ghi bảng kê đầu tiên» |

- Đích đo R-A2-07: khi việc `done`, ghi `viecDauTien.doneLuc = SM.CLOCK.today`; thời gian tới việc đầu tiên = `doneLuc − kichHoatLuc`; b2g hiện phân bố chỉ số này theo hộ (dạng tổng hợp — THUMOI IV.8).
- **Nghiệm thu**: bấm nút việc đầu tiên → app dẫn đúng màn nghiệp vụ tương ứng (tab Bán / tab Lịch / tab Thu mua); hoàn tất → `t.onboarding.buoc === 'xong_viec_dau'` + Trạm hiện «Đã xong việc đầu tiên sau {n} ngày».

---

## 4. Chế độ «làm cùng cán bộ» (THUMOI IV.6 «cầm tay chỉ việc»)

- **Gắn phiên**: màn OB-1 có thêm dòng «Có cán bộ ngồi cạnh? Cho cán bộ quét mã của cán bộ» — cán bộ quét mã người-hỗ-trợ (từ bảng điều khiển cán bộ, mô phỏng trong `b2g.html`) → `t.onboarding.coCanBo = { maCanBo, ten, diaBan }`. Hiệu ứng: các màn thêm dòng nhỏ «Cán bộ {tên} đang cùng làm» — câu chữ thay từ «cô chú tự bấm» sang «cán bộ chỉ, cô chú bấm».
- **Cán bộ làm thay ĐƯỢC**: điền form, chụp ảnh giấy tờ, đọc và giải thích, bấm «Mô phỏng sự kiện» trong khối demo, xác nhận tay trạng thái `da_ket_noi` (bắt buộc ghi nhật ký kèm mã cán bộ — `O.ghiNhatKy`).
- **Hộ PHẢI tự bấm (N-06 — không ngoại lệ)**: nút «Gửi đăng ký» mọi hồ sơ (HĐĐT, Zalo OA, CTS) — nút in đậm tên người bấm; OTP ngân hàng; uỷ quyền shop trên sàn; ký số. Màn ghi rõ: «Những nút này app không thể bấm hộ được — đây là trách nhiệm của chủ hộ theo luật».
- **Dấu vết cho b2g thấy tiến độ**: (a) `t.nhatKy` ghi từng bước kèm `maCanBo`; (b) `b2g.html` thêm cột «trạng thái onboarding» cho từng hộ — **chỉ số liệu tổng hợp** (bước hiện tại, số connector đã nối, quá hạn mấy mục, đã xong việc đầu tiên chưa, thời gian tới việc đầu) — đúng ranh giới dữ liệu THUMOI IV.8 (không chi tiết đơn/tin nhắn).
- **SLA hỗ trợ**: kế thừa nguyên khối SLA đang hiển thị ở màn `hoso` (mobile.html:956) — không thêm con số mới (tránh bịa).
- **Nghiệm thu**: phiên có `coCanBo` → nhật ký có dòng «cán bộ CB-07 hỗ trợ bước nhan-dien»; nút «Gửi đăng ký» vẫn chỉ mang tên chủ hộ; b2g thấy cột tiến độ đúng trạng thái `t.onboarding.buoc`.

---

## 5. Onboarding lại & nhiều người (nối sm-quyen)

- **Thêm người dùng thứ 2 (vợ/chồng/con) vào hộ ĐÃ onboard — KHÔNG chạy lại 5 câu.** Chủ hộ/người có quyền `nguoidung` (VAI `chu-ho` [seed sm-quyen.js:22-23]) mở «Thêm người trong nhà» → chọn vai trong 5 `VAI` hiện có → app sinh **mã mời + QR** → người mới quét → chỉ thấy MỘT màn: «Bạn là {tên} — {vai} của {hộ}. Vào dùng được ngay» → với `nguoi-nha` thì mở thẳng chế độ đơn giản (nút `Aa` hiện có, mobile.html:851-855) **không onboarding gì thêm**. Toàn bộ dùng `Q.nguoiDung/doiVai/bangQuyen` sẵn có — chỉ thêm phần sinh mã mời.
- **Đổi điện thoại**: dùng nguyên `Q.thietBi/thuHoiThietBi/noiLuuDuLieu` (sm-quyen.js:88-135): đăng nhập máy mới → thấy lại đủ (dữ liệu ở máy chủ), chỉ mất hàng đợi chưa gửi trên máy cũ (màn hiện sẵn con số đó — giữ); onboarding KHÔNG chạy lại vì `t.onboarding` nằm trong tenant, không nằm trên máy. OB-1 có nhánh «Tôi đã từng dùng OPC» dẫn thẳng đăng nhập thay vì hỏi mới.
- **Làm lại danh mục** (đổi ngành, thêm kênh mới giữa năm): chỉ chạy lại từ Câu 3 (kênh bán) — `ON.danhMucCho` sinh phần mới, **không đè** trạng thái các connector đã `da_ket_noi` (nguyên tắc không ghi đè — chỉ thêm).
- **Hộ ngủ đông quay lại** (sau mốc 90 ngày của cổng thanh toán THUMOI IV.7): Trạm hiện «Lâu rồi không dùng — rà lại {n} kết nối» + polling đối soát 24h [Q-003] tự kiểm trạng thái từng connector rồi báo cái nào chết (R-A3-05: connector chết phải nói ra).
- **Nghiệm thu**: thêm người mới bằng mã mời ≤ 2 màn; đổi máy (mockup: xoá localStorage một máy, giữ kho) → mở lại còn đúng `t.onboarding`.

---

## 6. Điểm bỏ cuộc & phòng ngừa (≥8 dòng)

| # | Bước | Lý do bỏ cuộc có thể | Phòng ngừa trong thiết kế | Nguồn |
|---|---|---|---|---|
| 1 | OB-1 nhập mã | sai mã nhiều lần, không biết tìm ai | QR + «Mô phỏng quét» + nút gọi cán bộ địa bàn (màn hoso) + «vào dùng trước» | THUMOI IV.6 |
| 2 | OB-2 câu giấy tờ | chưa có GPKD/MST, thấy «chưa đủ điều kiện» là nản | «Chưa rõ» không chặn; nhóm BẮT BUỘC sinh checklist cán bộ đồng hành | [Q-004] |
| 3 | OB-2 câu doanh thu | sợ «khai rồi bị thuế để ý» | giải thích vì-sao-hỏi ngay dưới câu hỏi + cam kết dữ liệu chi tiết thuộc hộ (THUMOI IV.8) | [Q-004] |
| 4 | OB-4 form dài | thấy phải chụp ảnh, điền nhiều | form điền sẵn từ hồ sơ hộ, hộ chỉ chụp 1 ảnh; xem trước PDF trước khi gửi | [tự đề xuất] |
| 5 | OB-4 chờ Zalo OA 2–3 ngày | quên luôn, không quay lại | Trạm + chấm đỏ + đẩy tin Tư vấn trong cửa sổ 7 ngày (8 tin free/48h) [Q-005]; quá hạn → cán bộ gọi | [Q-004][Q-005] |
| 6 | OB-4 xin OTP ngân hàng | sợ lừa đảo | màn nói rõ OTP do ngân hàng gửi, SePay chỉ đọc biến động; không bao giờ xin OTP qua chat | [Q-002] |
| 7 | Nút «Gửi đăng ký» | sợ chịu trách nhiệm pháp lý | xem trước đơn + dòng «app chỉ chuẩn bị, người gửi là cô/chú» (N-06) | N-06 |
| 8 | Mất mạng giữa chừng | tưởng mất dữ liệu, bỏ | kho cục bộ + hàng đợi tự drain; badge «sẽ gửi khi có mạng» | THUMOI IV.4 · sm-core |
| 9 | Người lớn tuổi mở app lần đầu | onboarding chữ nghĩa gây sợ | vai `nguoi-nha` bỏ qua onboarding, vào chế độ `Aa` | R-A2-01 · seed |
| 10 | Đổi máy | tưởng làm lại từ đầu | onboarding gắn tenant không gắn máy; nhánh «đã từng dùng OPC» | sm-quyen |
| 11 | Chờ NCC thương mại (MISA) không self-serve [Q-002] | chán vì không bấm được | xếp nhóm ĐỂ SAU, không để việc chờ thương mại chặn nhóm luật | N-01 |

---

## 7. Tích hợp với màn `ketnoi` hiện có

**Hiện trạng (neo code):** `viewKetnoi` (mobile.html:866-889) = khung «Danh mục tối thiểu» theo nhóm từ `connectorSummary` (ngưỡng: Sàn 3 · Vận chuyển 3 · App đồ ăn 1 · Đặt phòng 2 — sm-domain.js:896) + danh sách CONNECTORS lọc ngành + nút «Nối/Đã nối» gọi `toggleConnector` chỉ set `{noi, tuNgay}` (sm-domain.js:877-886). Connector `batBuoc` được coi **đã nối tự động** (`noi: !!c.batBuoc` — sm-domain.js:869) — nghĩa là HĐĐT/CTS hiện «đã nối» kể cả khi hộ chưa hề có chữ ký số.

**Ba thay đổi bắt buộc:**
1. Cờ boolean → **máy trạng thái 7 mức** (mục 2.2). Nút «Nối» biến thành lối vào luồng 2 nhánh OB-4. `da_ket_noi` chỉ đến từ sự kiện ngoài/xác nhận cán bộ.
2. Bỏ auto-noi của `batBuoc` — nhóm Thuế-Hoá đơn hiện trạng thật (chưa có CTS phải thấy «chưa»). «Danh mục tối thiểu» tách hai lớp: **tối thiểu theo LUẬT** (nhóm BẮT BUỘC của OB-3) và **tối thiểu theo CHƯƠNG TRÌNH** (ngưỡng IV.3 hiện có — giữ nguyên làm nhóm NÊN CÓ).
3. Thêm cột «chờ ai / dự kiến khi nào» cho mọi dòng `cho_duyet`.

**Quyết định: GỘP — «Trạm kết nối» (OB-5) chính là màn `ketnoi` nâng cấp, giữ nguyên id `ketnoi` và vị trí menu.** Lập luận: (a) menu «Thêm» đã 22 mục, tách thêm màn là tái tạo «bãi rác» mà người soát v3 đã phê (mobile.html:810-811); (b) hộ chỉ cần nhớ MỘT chỗ để xem kết nối; (c) `b2g.html`/`web.html` đang đọc chung `D.connectors` — gộp thì không phá; (d) onboarding chỉ là **lối đi lần đầu** dẫn tới Trạm, sau đó Trạm là màn quản-thường-trực. Kế thừa thêm: ghi chú «kiến trúc mở — mô-đun rời» (mobile.html:887), nhóm «chờ vận hành» `ntqg` (mobile.html:883).

**Nghiệm thu tích hợp**: mở menu Thêm → vẫn đúng 1 mục «Kết nối kênh bán»; vào ra thấy Trạm mới; `toggleConnector` cũ không còn đường gọi trực tiếp từ nút Nối (grep `data-con` chỉ còn ở luồng OB-4).

---

## 8. Việc cần Quang chốt

- **Q1.** Onboarding chặn tới đâu? Đề xuất: KHÔNG chặn app, chỉ chặn ĐÚNG nghiệp vụ liên quan (chưa có CTS thì không phát hành HĐĐT — tự nhiên đúng luật [Q-001]). Chốt hay không chặn luôn?
- **Q2.** Seed v4: 3 tenant hiện có đặt `onboarding` ở 3 trạng thái khác nhau (CD1 `xong_viec_dau`, CD2 `dang_noi` + Zalo OA `cho_duyet`, CD3 `da_sinh_danh_muc`) để demo Trạm sống — hay thêm 1 tenant «hộ mới» trắng hoàn toàn để chạy onboarding từ số 0 (đề xuất: làm cả hai, tenant mới tên `cd4-moi` không kèm dữ liệu bán)?
- **Q3.** Mã suất Chương trình: format và nơi sinh (b2g?) — mockup đề xuất `GL26-XXXX-XXXX` sinh từ b2g, mỗi mã một suất.
- **Q4.** Mốc nhắc «sắp 1 tỷ»: nhắc từ bao nhiêu phần trăm lũy kế so với 1 tỷ (CD2 đang 780tr — đề xuất nhắc từ 80% = 800tr, khớp hình ảnh «sắp» của seed)? Hiện chưa có văn bản nào định mốc — đây là lựa chọn sản phẩm.
- **Q5.** Luồng «tự mua license» ngoài Chương trình: làm thật trong v4 mockup (màn giá — có sẵn `P.tinhGia`) hay chỉ mã suất, tự mua để T khác?
- **Q6.** Đẩy Zalo OA tới chủ hộ trong mockup mô phỏng bằng gì: hộp thư trong app (đề xuất — trùng mô hình inbox) hay vẽ màn hình Zalo giả?
- **Q7.** MISA / tầng kế toán miễn phí: giữ ĐỂ SAU cho mọi chân dung (đề xuất — đúng N-01), hay CD1 (khách sạn cần sổ riêng) làm trước?
- **Q8.** Danh sách câu hỏi radar phát sinh từ bản này (5 câu THIẾU BẰNG CHỨNG ở mục 3d + Q-024 có sẵn) — có nhặt vào lịch radar luôn không?

---

*Tự soát đã làm: đủ 8 phần đúng thứ tự · mọi con số/lead-time có nhãn [Q-00x]/[R-xx]/[N-xx]/THUMOI · không ký tự CJK · mọi luồng «đăng ký hộ» (HĐĐT, Zalo OA, CTS, sàn, SePay) đều ghi rõ người bấm nút cuối theo N-06 · mọi tính năng có cách mô phỏng bằng seed + hàm tính + bảng giả lập sự kiện.*
