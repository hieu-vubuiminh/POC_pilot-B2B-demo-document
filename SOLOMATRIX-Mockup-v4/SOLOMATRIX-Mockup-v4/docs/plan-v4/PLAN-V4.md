# KẾ HOẠCH MOCKUP v4 — Onboarding + Radar findings (bản GLM tổng hợp, chờ Claude verify)

- Chủ biên T6 · ngày 2026-08-20 · hợp nhất `out/T1-ONBOARDING-FLOW.md` · `out/T2-CONNECTOR-SPEC.md` · `out/T3-KICH-BAN-3-CHAN-DUNG.md` · `out/T4-FINDINGS-VAO-MOCKUP.md`, ĐÃ thi hành toàn bộ verdict của `out/T5-PHAN-BIEN.md` (bảng verdict mục 1, 8 hoà giải mục 2, lỗ hổng mục 3 với nhãn `T5-3x.n`). **Không có bảo lưu nào** — T6 đồng ý và thi hành nguyên vẹn mọi verdict SỬA/SỬA nhẹ của T5 (không có verdict BỎ nào phải gỡ).
- Quy ước nhãn nguồn: `[Q-00x]` finding radar · `[R-xx]` REQUIREMENTS · `[N-xx]` ANTI-SCOPE · `THUMOI <mục>` Thư mời Gia Lai · `[seed]`/`(seed: file:dòng)` code v3 · `[tự đề xuất]` không có bằng chứng ngoài thiết kế · `(T1-3c)`… = mục nguồn gốc ở bản T1–T5, giữ nguyên khi hợp nhất.
- Nguyên tắc bất di: **không có kết quả viết cứng** — mọi số trên giao diện là hàm tính từ kho bền; mọi đầu vào/ra **lộ đường đi** (ai gửi · qua đâu · payload thô · tạo ra gì); cấm bắt người dùng gõ tay dữ liệu lẽ ra tự chảy vào.
- Kế hoạch cho MOCKUP TĨNH (HTML+JS, không backend): mọi «bên ngoài» (cổng thuế, Zalo, SePay, sàn) mô phỏng bằng seed + hàm tính + bảng giả lập sự kiện mở rộng `KICH_BAN` của `js/sm-inbox.js`; nút «Mô phỏng: {sự kiện}» chỉ nằm trong khối công cụ demo góc màn.

---

## A. Tóm tắt điều hành

Top-10 chung cuộc của T5 (mục 4), mỗi việc trỏ mục thi công:

1. Đồng hồ 30 ngày đăng ký HĐĐT — hàm chung `mocVuotNguong` tham số hoá kỳ → B.8/C.3/D-#1 [Q-001].
2. Wizard nhận diện 6 câu (câu 0 + 5 câu, doanh thu hỏi theo mùa, không ô gõ số) → B.5–B.6 [T3-(g)].
3. Máy trạng thái 7 mức connector + bỏ auto-noi `batBuoc` + bảng chuyển id → B.2/C.0/B.14.
4. Trạm «đang chờ ai — dự kiến ngày nào — quá hạn gọi cán bộ» gộp vào `ketnoi` → B.9.
5. Màn Độ tươi + kịch bản webhook TRÙNG dedup + «Trợ lý chạy nền» → D-#2/#3, bảng chuẩn C.15.
6. Chính sách tin Zalo lộ phí trước nút gửi + quy tắc ≤1 tin đẩy/ngày/hộ → D-#4 + C.2 [Q-005·N-09].
7. Thuế sàn đã nộp thay trên đơn + tách cột tờ khai → D-#8 [Q-019].
8. Connector chết báo ra tiếng + kịch bản đứt → D-#5 [Q-003].
9. Sổ trực onboarding + sinh suất QR trong b2g → B.11 (T5-3a) — thiếu sốt lớn nhất cho khoá 150 hộ.
10. Bảng giá vs KiotViet + căn cứ hành vi vào tầng hồ sơ → D-#9/#12 [Q-007·Q-004].

Ranh giới pháp lý giữ toàn vẹn: N-06 — mọi nút Gửi cuối cùng do NGƯỜI (chủ hộ/người được ủy quyền rõ ràng) bấm, tên người bấm in trên nút; N-07 — tiền COD về thẳng tài khoản ngân hàng hộ; N-01 — chỉ dẫn sang PM kế toán miễn phí nhà nước, không tự làm; N-09 — Zalo chỉ dùng tin Tư vấn/Giao dịch, không broadcast.

---

## B. Luồng onboarding lần đầu — màn-theo-màn

### B.0 Nguyên tắc thiết kế (T1-P1, GIỮ) + 6 yêu cầu bắt buộc của wizard (T3-(g), NÂNG theo T5)

10 nguyên tắc (T1 mục 1): (1) nói như cán bộ nói với cô chú — không bao giờ hiện «connector/webhook/OAuth» cho hộ [Q-004]; (2) nền tảng CHỦ ĐỘNG HỎI, hộ chỉ trả lời câu hỏi về chính mình, danh mục kết nối là hàm tính; (3) mọi việc ≤3 chạm (R-A2-04), gõ tay chỉ ở trường bắt buộc như MST; (4) onboarding KHÔNG chặn app — nút «Để sau, dùng app trước» mọi màn; (5) đo bằng thời gian tới việc-đầu-tiên-xong (R-A2-07); (6) chưa có tài khoản thì đăng ký NGAY TRONG OPC nhưng OPC chỉ CHUẨN BỊ đơn — nút Gửi cuối luôn do NGƯỜI bấm, tên in trên nút (N-06); (7) mọi trạng thái chờ hiện lead-time THẬT kèm nhãn — không có số thì ghi «chưa rõ thời gian — có cán bộ theo dõi»; (8) mất mạng không mất tiến trình (kho bền + hàng đợi sm-core); (9) không kết quả viết cứng — tiến độ % là hàm tính; (10) mỗi kết nối nói «giá trị mở khoá» bằng 1 câu đời thường TRƯỚC khi xin tài khoản.

6 yêu cầu BẮT BUỘC của wizard v4 (T3-(g), T5 nâng từ «đề xuất» thành yêu cầu): (i) không bao giờ hỏi số tiền năm trong 3 câu đầu — hỏi theo mùa/tuần rồi app tự tính; (ii) mọi câu nhận diện trả được bằng MỘT LẦN CHẠM vào thứ hộ đã có (ảnh giấy phép, gian hàng sàn, đoạn hội thoại Zalo, hoá đơn cũ); (iii) tách bạch XIN QUYỀN (hộ đã có tài khoản → uỷ quyền qua trang chính chủ, không ô mật khẩu nào của OPC) và ĐĂNG KÝ MỚI (luồng ghi rõ AI bấm nút cuối + CHỜ BAO LÂU); (iv) thứ tự kết nối = thứ tự niềm tin (tiền về tức thì → đơn sàn → chống trùng → hoá đơn/kê khai); (v) thiết kế cho HAI người trong một nhà (câu 0); (vi) ngày 0 không đẩy cảnh báo pháp lý trước khi việc đầu tiên xong.

### B.1 Máy trạng thái tiến trình tổng `t.onboarding.buoc` (T1-2.1, sửa `du_toi_thieu` theo verdict T1-3c)

```
chua_kich_hoat → kich_hoat → da_tra_loi → da_sinh_danh_muc → dang_noi → du_toi_thieu → xong_viec_dau
                       ↘ bo_qua_tam (bất kỳ bước → quay lại đúng bước đang dở)
```

| Trạng thái | Nghĩa | Điều kiện chuyển |
|---|---|---|
| `chua_kich_hoat` | Chưa có license (mã suất/tự mua) | nhập mã hợp lệ → `kich_hoat` |
| `kich_hoat` | Có license, chưa hỏi gì | bấm «Bắt đầu» OB-2 → `da_tra_loi` |
| `da_tra_loi` | Đủ 5 câu chính (câu 0 thuộc OB-1) | `ON.danhMucCho(t)` sinh xong → `da_sinh_danh_muc` |
| `da_sinh_danh_muc` | Có danh mục kết nối riêng của hộ | connector đầu tiên rời `chua_hoi` → `dang_noi` |
| `dang_noi` | Đang nối từng cái (kéo dài nhiều ngày — Zalo OA 2–3 ngày làm việc [Q-004]) | đạt tối thiểu → `du_toi_thieu` (định nghĩa dưới) |
| `du_toi_thieu` | Đủ danh mục tối thiểu | việc đầu tiên `done` → `xong_viec_dau` |
| `xong_viec_dau` | Đích đo R-A2-07 — ghi `batDauLuc`/`doneLuc` | — |
| `bo_qua_tam` | Bấm «Để sau» — app dùng bình thường, banner mờ ở Trạm | mở lại → về đúng bước cũ |

**Định nghĩa đạt tối thiểu (sửa theo verdict T1-3c + hoà giải T5-2.1):** `du_toi_thieu` đạt khi (a) mọi connector nhóm BẮT BUỘC THEO LUẬT (chỉ sinh ra khi hộ >1 tỷ, xem B.7) ở `da_ket_noi` — **nhóm LUẬT không có «bỏ qua hợp lệ»**: hạn 30 ngày là nghĩa vụ [Q-001]; mục luật chưa xong chỉ có «hoãn + việc cán bộ theo dõi» và máy trạng thái KHÔNG hoàn thành (hộ cháy hạn là việc của Tổ công tác, app đẩy việc cho cán bộ chứ không «nuốt» bằng cách coi là đạt); (b) connector nhóm NÊN CÓ cốt lõi (ma trận C.13: tối thiểu `bank` + `zalooa` cho mọi chân dung) ở `da_ket_noi` **hoặc** `bo_qua`-có-lý-do (chỉ hợp lệ ở nhóm NÊN CÓ/ĐỂ SAU). Tiến độ % = `ON.tienDo(t)` = (số `da_ket_noi` + số `bo_qua`-có-lý-do) / tổng connector trong danh mục — hàm tính, không viết cứng.

### B.2 Máy trạng thái từng connector `t.onboarding.ketNoi[ma]` (T1-2.2, chốt nghĩa `dang_dang_ky` theo hoà giải T5-2.6)

| Trạng thái | Khi nào | Hiển thị trên Trạm |
|---|---|---|
| `chua_hoi` | Danh mục sinh ra nhưng chưa mở luồng | thẻ xám «Chưa hỏi» |
| `chua_co_tk` | Hộ trả lời chưa có tài khoản dịch vụ đó | thẻ vàng «Chưa có — đăng ký ngay trong app» |
| `dang_dang_ky` | **Đang điền/gửi dở** (nghĩa chốt theo T2) | thẻ xanh nhạt «Đang làm dở — mở tiếp» |
| `cho_duyet` | **Hồ sơ ĐÃ gửi**, chờ bên thứ ba — bắt buộc kèm `hanDuKien` | thẻ xanh nhạt «Đang chờ {ai} — dự kiến {ngày}» |
| `da_ket_noi` | Có tín hiệu xác nhận từ ngoài về (webhook thử / mã phản hồi) | thẻ xanh «Đã nối + số liệu đã chảy» |
| `loi` | Từ chối / hết hạn / lỗi kỹ thuật, kèm `lyDo` nguyên văn | thẻ đỏ + nút «Xem lỗi» |
| `bo_qua` | Hộ chủ động bỏ (chỉ nhóm NÊN CÓ/ĐỂ SAU), bắt buộc `lyDoBoQua` | thẻ xám gạch ngang + lý do |

Chuyển sang `da_ket_noi` **không còn do hộ bấm nút «Nối»** (v3 `toggleConnector` chỉ set cờ — giả, sm-domain.js:877-886; `batBuoc` auto-noi sm-domain.js:869 là nói dối trạng thái). Chỉ 2 đường hợp lệ: (a) sự kiện xác nhận từ ngoài qua hộp thư đến (sm-inbox); (b) cán bộ xác nhận tay — **bắt buộc ghi nhật ký kèm mã cán bộ** (`O.ghiNhatKy`) VÀ dòng đó xuất hiện trong Sổ trực b2g (điều kiện verdict T1-4 — nếu không, xác nhận tay thành lỗ hổng đạt-giả, xem B.11). Mọi chuyển trạng thái ghi `t.nhatKy`.

### B.3 Hình dạng dữ liệu `t.onboarding` trong kho (T1-2.3 + bổ sung hoà giải T5-2.4/2.5, T5-3b.6)

```js
t.onboarding = {
  buoc: 'chua_kich_hoat',          // máy trạng thái B.1
  boQuaLuc: null,                   // ISO ngày bấm «Để sau» gần nhất
  traLoi: {
    nguoiLamChinh: null,            // CÂU 0 (OB-1): 'chu-ho' | 'con' | 'bo-me' | 'can-bo' — T5-2.4
    nganh: null,                    // 'dac-san' | 'du-lich' | 'nong-san'
    giayTo: null,                   // 'co-mst' | 'chi-gpkd' | 'chua-co' | 'chua-ro'
    kenh: [],                       // mảng mã: 'quay','b2b','san','zalo','live','food','booking'
    doanhThuUoc: null,              // 'duoi-1-ty' | 'sap-1-ty' | 'tren-1-ty' | 'khong-biet'
    posHienTai: null,               // 'giay-so' | 'phan-mem-khac' | 'may-tinh-tien' | 'chua-ro'
  },
  ketNoi: {                         // [maConnector]: B.2 — ví dụ
    hddt: { trangThai:'cho_duyet', batDauLuc:'2026-08-18', hanDuKien:'2026-08-19',
            hoSoDaNop:['don-dang-ky-hddt','anh-gpkd'], aiBam:'Chị Trần Thu Hà' },
  },
  coCanBo: null,                    // { maCanBo:'CB-07', ten:'(tên cán bộ — seed b2g đặt khi thi công)', diaBan:'...' } — B.11
  viecDauTien: { loai:null, batDauLuc:null, doneLuc:null },   // đích đo R-A2-07
};
// Seed v4 ghi THÊM ở tầng tenant (hoà giải T5-2.5): t.vuotLuc = <mốc vượt 1 tỷ thật của CD1>
// thay vì suy ngược từ dòng doanh thu — demo không lệch khi đổi tham số kỳ của mocVuotNguong.
```

Tên trường theo phong cách tiếng-Việt-không-dấu của seed (`taxFiled`, `dongLuc`…). Mọi mốc ngày lấy `SM.CLOCK.today` + `SM.dayOffset`; hạn chờ `hanDuKien = ON.congNgayLamViec(iso, n)` (hàm đếm ngày làm việc mới đặt trong sm-onboard.js — thứ 7/chủ nhật bỏ qua).

### B.4 Mất mạng giữa chừng (T1-2.4)

- Trả lời câu hỏi: ghi thẳng tenant + `SM.save()` — kho bền `smv3:db` sống qua F5 (sm-core.js:87-90).
- Gửi hồ sơ: hàng đợi hiện có + kind mới `SM.enqueue('dangky', 'Gửi đăng ký {dịch vụ}', { tenant, connector })`; offline nằm chờ, `setOnline(true)` tự `drain()` (sm-core.js:155-160); badge «Sẽ gửi khi có mạng» từ `SM.queueCount()`.
- Sự kiện ngoài về khi offline: theo mô hình sm-inbox — vào sổ, ghi rõ nhận được khi có mạng lại (sm-inbox.js:299-310).
- Demo mất mạng ngày đầu (T3-CD3 d#4): bật chế độ máy bay vẫn hoàn tất 1 lượt bán + 1 dòng bảng kê, hàng đợi tăng, tắt máy bay tự rút.

### B.5 OB-1 «Kích hoạt» — màn `obkichhoat` (T1-3a GIỮ kèm điều kiện + câu 0 của hoà giải T5-2.4 + Aa của T5-3b.6)

Câu chữ gốc (T1): «Chào cô chú. Đây là lần đầu mở app — làm phần mở đầu một lần thôi, chừng 5 phút. Có cán bộ ngồi cạnh thì đưa điện thoại cho cán bộ quét mã, càng nhanh. Chưa muốn làm bây giờ? Bấm 'Để sau, vào dùng trước' — không sao cả.» — 3 nút: **[Để sau, vào dùng trước]** · **[Tôi có mã suất của Chương trình]** · **[Tôi tự mua, đã có tài khoản]**.

- **Input**: nhánh Chương trình → ô quét QR (nút «Mô phỏng quét QR» chèn mã `GL26-XXXX-XXXX`) hoặc ô gõ 12 ký tự; nhánh tự mua → form tài khoản (mockup: chuỗi nào cũng vào được, dòng chữ đó hiện ngay trên form).
- **Lộ đường đi của mã**: cán bộ in/tải QR từ bảng điều khiển `b2g.html` — khối «sinh suất + trạng thái sử dụng + ai in + mã cán bộ» (đặc tả b2g ở B.11, điều kiện verdict T1-3a; P3/P6) → camera quét → mã resolve thành `{tenantId, loai:'chuong-trinh', capLuc}` → gắn license vào `t.license`, `buoc` → `kich_hoat`. QR sai 3 lần → «Gọi cán bộ hỗ trợ địa bàn» (màn `hoso` có sẵn, mobile.html:931-956) — không treo hộ.
- **Mã suất đã dùng trên máy khác** → «Mã này đã kích hoạt trên máy khác. Nếu đổi điện thoại, bấm 'Tôi đã từng dùng OPC'» → nhánh onboarding-lại (B.12).
- **CÂU 0** (hoà giải T5-2.4) — cuối màn OB-1 sau khi mã hợp lệ, KHÔNG tăng số màn chính: «Trong nhà ai hay cầm điện thoại nhất?» — chọn người đang cầm máy: **chủ hộ / con / bố mẹ / cán bộ** (1 chạm) → `traLoi.nguoiLamChinh`. Hiệu ứng: (a) «bố mẹ / người lớn tuổi» → wizard **tự rút còn 2 câu** (nghề + «ai trong nhà giúp phần còn lại»), phần còn dở chuyển thành «việc giao người nhà» có thông báo trong app cho kế cận khi họ mở máy — đúng tình huống CD3 «chụp giấy gửi con, tối con bấm tiếp» (T3-CD3 b, T5-3b.6); đề xuất mở chế độ `Aa` ngay đầu; (b) kế cận/chủ hộ → wizard đầy đủ. Đúng THUMOI I.2 (gói trao thế hệ kế cận 25–40).
- **Chế độ `Aa` đang bật mà lần đầu mở app** (T5-3b.6): máy ở chế độ đơn giản vẫn thấy OB-1 nhưng wizard là bản rút gọn 2 câu như trên; bố mẹ xong phần mình thì app nhắc «phần giấy tờ để {tên con} bấm tối nay».
- **Đích**: `mobile.html` thêm router `obkichhoat:[viewObKichHoat,bindObKichHoat]` (đăng ký cạnh mobile.html:2420); seed thêm `t.license`.
- **Nghiệm thu**: mở lần đầu thấy OB-1 ≤2 giây; «Để sau» vào thẳng tab Bán; «Mô phỏng quét QR» → `SM.current().onboarding.buoc === 'kich_hoat'` (console); chọn câu 0 = «bố mẹ» → OB-2 chỉ còn 2 câu + việc giao người nhà xuất hiện; máy đang bật `Aa` mở lại → không bắt 5 câu.

### B.6 OB-2 «Nhận diện hộ» — màn `obnhandien`, 5 màn con + thanh tiến độ 5 chấm (T1-3b SỬA theo T3+T5)

Mọi câu có nút «Để sau» (thoát an toàn `bo_qua_tam`). Mọi nút câu hỏi có **«đọc to câu này»** (kịch bản hoá + nhãn MÔ PHỎNG như D-#10 — T5-3b.7); quy tắc ngôn ngữ ≤3 âm tiết của `Aa` áp cho toàn bộ câu wizard (T3-CD3 d#5).

**Câu 1 — Nghề** (1 chạm, 3 tấm ảnh ngành — T3 b): «Hộ mình làm nghề gì?» — «Đặc sản, đồ ăn đồ uống» · «Du lịch: ăn uống, nghỉ, tour» · «Nông sản: thu mua, sơ chế» → `traLoi.nganh` (khác `t.nganh` thì giữ `traLoi` làm chuẩn cho danh mục — hộ tự nói về mình đúng hơn hồ sơ).

**Câu 2 — Giấy tờ** (chụp thay gõ — T3 b): «Nhà mình đã đăng ký kinh doanh chưa?» — «Có giấy phép lẫn mã số thuế» · «Có giấy phép, chưa có mã số thuế» · «Chưa đăng ký gì cả» · «Chưa rõ — để cán bộ kiểm tra giúp» → `traLoi.giayTo`. «Chưa có» → OB-3 thêm checklist làm GPKD nhóm BẮT BUỘC (cán bộ đồng hành THUMOI IV.6; mockup chỉ checklist + cán bộ theo, không làm thay thủ tục — N-06). «Chưa rõ» → connector cần MST sinh ở `chua_hoi` kèm «Cần xác định giấy tờ trước — cán bộ sẽ kiểm tra», không chặn connector khác. Câu chữ dẫn đường (T3-CD1 b): «Có cái giấy phép treo tường không? Chụp nó giùm app là xong».

**Câu 3 — Kênh bán** (chọn nhiều, bấm hội thoại thật — T3 b): «Hàng/dịch vụ bán qua đường nào?» — «Tại cửa hàng/quầy» · «Bán cho nhà hàng, công ty (công nợ, hoá đơn)» · «Sàn Shopee/TikTok/Lazada» · «Zalo, Facebook nhắn khách» · «Bán qua phát trực tiếp» · «App giao đồ ăn» · «Khách đặt phòng/đặt tour» → `traLoi.kenh`. Kênh rỗng → connector kênh-bán về nhóm ĐỂ SAU, không hỏi. **Chọn «bán cho nhà hàng, công ty» là tín hiệu MỞ luồng hoá đơn tự nguyện** cho hộ dưới ngưỡng (hoà giải T5-2.2, xem B.8 Kiểu 3). Câu dẫn (T3): «Khách nào nhắn đặt hàng qua Zalo không?» → bấm 2 đoạn hội thoại thật trong máy; «Quán có nhận đơn qua app giao đồ ăn không?» → 1 chạm.

**Câu 4 — Doanh thu theo MÙA** (đổi dạng theo hoà giải T5-2.3): «3 tháng đông khách nhất ước chừng bao nhiêu?» — 3 nấc «Chưa tới 250 triệu / 250–500 triệu / trên 500 triệu» **chỉ là gợi ý** để quy về năm [tự đề xuất — nấc chia là lựa chọn sản phẩm, không phải mốc pháp lý; mốc pháp lý duy nhất là 1 tỷ/năm Q-001] · nút to mặc định **«Không biết»** (không phán xét). Dòng phụ: «Hỏi để biết hộ mình có phải dùng hoá đơn điện tử cơ quan thuế không thôi. Bán trên 1 tỷ một năm thì theo quy định phải dùng hoá đơn điện tử có mã, và phải đăng ký trong 30 ngày. Số này sau này app tự theo dõi bằng số bán thật — cô chú không phải khai gì thêm.» [Q-001] → `traLoi.doanhThuUoc`. «Không biết» → app không đoán: gắn theo dõi lũy kế bằng số bán thật (`D.revenueLines`) + dòng Trạm «App đang theo dõi doanh thu để biết khi nào cần hoá đơn». Ngữ liệu theo chân dung (T3 b, chuyển thẳng vào UI): CD1 «Tháng nào đông khách nhất? Tháng đó ước bao nhiêu?» · CD2 «3 tháng mùa vừa rồi thu về chừng bao nhiêu? 3 tháng mùa ngồi không thì bao nhiêu?» · CD3 «Mỗi tuần tải về kho bao nhiêu tấn? Bán ra chừng nào một ký?» (app tự nhân từ bảng kê + đơn).

**Câu 5 — Đang bán bằng gì**: «Hiện ghi chép bán hàng bằng gì?» — «Ghi giấy/vở» · «Dùng app hoặc phần mềm khác» · «Có máy tính tiền in hoá đơn» · «Chưa rõ» → `traLoi.posHienTai`. (a) «phần mềm khác» → mục ĐỂ SAU «chuyển dữ liệu từ phần mềm cũ» (THUMOI IV.3, màn `dulieu`); (b) «máy tính tiền» → nối HĐĐT đường «máy tính tiền kết nối dữ liệu CQT» [Q-001] (connector `pos`, C.11); (c) «ghi giấy» → nhấn việc-đầu-tiên cho quen tay. Câu dẫn (T3): «Hôm nay xuất hoá đơn cho khách sạn, anh/chị xuất từ đâu, ai gõ?». «Chưa rõ» → coi như `giay-so`.

- **Đích**: `mobile.html` màn `obnhandien` (5 màn con) + `js/sm-onboard.js` hàm `ON.traLoi(t, cau, gt)`, `ON.danhMucCho(t)`.
- **Nghiệm thu OB-2**: đi hết 5 câu chỉ bấm (không gõ bàn phím trừ mã suất); đóng app giữa câu 3 mở lại đứng đúng câu 3; `traLoi` đủ 6 khóa (gồm `nguoiLamChinh`); **toàn wizard KHÔNG có ô gõ số tiền nào** (nghiệm thu T3-(g) của hoà giải T5-2.3); 3 bộ câu trả lời CD1/CD2/CD3 → 3 danh mục đúng bảng B.7/C.13.

### B.7 OB-3 «Danh mục kết nối của hộ» — màn `obdanhmuc` (T1-3c SỬA theo hoà giải T5-2.1/2.2)

«Dựa trên những gì cô chú vừa cho biết, app lập danh sách những thứ nhà mình nên nối. Cái nào là LUẬT ĐÒI thì làm sớm — app ghi rõ vì sao. Còn lại là để bán đỡ vất vả hơn.» Sinh bằng `ON.danhMucCho(t)` — hàm thuần từ `traLoi`, KHÔNG viết cứng.

**Nhóm BẮT BUỘC THEO LUẬT** — sau hoà giải T5-2.1, tách 2 lớp nghĩa vụ:

| Điều kiện sinh | Mục | Vì sao (hiển thị rút gọn) | Nguồn |
|---|---|---|---|
| `doanhThuUoc='tren-1-ty'` | Kê khai điện tử đầy đủ + HĐĐT + CTS | «Trên 1 tỷ/năm: chế độ đầy đủ — hoá đơn điện tử có mã, đăng ký trong 30 ngày kể từ kỳ vượt ngưỡng; kê khai điện tử; chữ ký số» | [Q-001] |
| `doanhThuUoc='sap-1-ty'` hoặc `'khong-biet'` | «Canh ngưỡng 1 tỷ» (theo dõi, không phải connector) | «Chưa bắt buộc hôm nay. App theo dõi tổng bán thật, tới lúc gần 1 tỷ sẽ nhắc làm hồ sơ trước 30 ngày» | [Q-001] + hàm lũy kế |
| `kenh` có 'san' | Ghi nhận thuế sàn khấu trừ nộp thay | «Sàn đã nộp thay phần của hộ — app chỉ đối chiếu, không khai lại» | [Q-001·Q-019] NĐ 117/2025 |
| `giayTo='chua-co'` | Checklist làm GPKD (cán bộ đồng hành) | «Hầu hết kết nối dưới đây cần giấy phép» | [Q-004] + THUMOI IV.6 |

Lớp (i) «tự tính–tự khai sau bỏ thuế khoán — MỌI hộ» [Q-001 NQ 198/2025/QH15] đặt ở nhóm NÊN CÓ kèm dòng «mức chi tiết nghĩa vụ định kỳ nhóm ≤1 tỷ chờ Q-023». Nhóm BẮT BUỘC chỉ chứa chế độ đầy đủ khi hộ >1 tỷ. **Nhóm LUẬT không có «bỏ qua» hợp lệ** (B.1) — chỉ «hoãn + việc cán bộ theo».

**Nhóm NÊN CÓ** (vận hành + danh mục tối thiểu Chương trình THUMOI IV.3, kế thừa ngưỡng `connectorSummary` sm-domain.js:896 — tách 2 lớp «tối thiểu theo LUẬT» / «tối thiểu theo CHƯƠNG TRÌNH»): ngân hàng + QR (SePay webhook 12+ ngân hàng [Q-002]); sàn nếu `kenh` có 'san' (tối thiểu 3); vận chuyển (tối thiểu 3); app đồ ăn nếu đặc sản (tối thiểu 1); nền tảng đặt phòng nếu du lịch (tối thiểu 2); Zalo OA (62% MSME dùng app nhắn tin cho kinh doanh [Q-004, số 2021]); kê khai thuế theo dòng tiền (lớp (i) trên).

**Nhóm ĐỂ SAU**: nền tảng dùng chung Nhà nước `ntqg`→`ketoan` (giữ cờ «chưa vận hành» [seed sm-domain.js:856-857, Q-001 NĐ 20/2026]); MISA nếu hộ >1 tỷ đã dùng (cấp quyền qua nhân viên kinh doanh [Q-002]); chuyển dữ liệu phần mềm cũ nếu `posHienTai='phan-mem-khac'`.

Mỗi mục hiện «giá trị mở khoá»: SePay → «Tiền về tới đâu app biết ngay, khỏi mở app ngân hàng đối chiếu»; Zalo OA → «Khách nhắn 22 giờ cũng có câu trả lời soạn sẵn»; HĐĐT → «Khách sạn đòi hoá đơn là xuất được ngay, công nợ tự gắn theo hoá đơn».

Ba chân dung = 3 danh mục (ma trận đầy đủ C.13):

| | CD1 Biển Xanh (>1 tỷ, 1.020tr) | CD2 Nhơn Lý (780tr → ước 1.243tr) | CD3 Chư Păh (607tr) |
|---|---|---|---|
| BẮT BUỘC | HĐĐT + CTS + kê khai điện tử (đã vượt) · thuế sàn | canh ngưỡng · thuế theo dòng tiền (NÊN CÓ) | thuế sàn |
| NÊN CÓ | SePay · 3 sàn · vận chuyển · Zalo OA · thuế dòng tiền | SePay · 2 nền tảng đặt phòng · Zalo OA · CTS (ký sớm) | SePay · 3 sàn · vận chuyển · Zalo OA · thu mua bảng kê (việc riêng chân dung) |
| ĐỂ SAU | MISA (khách sạn cần sổ riêng) | mùa vụ chênh lớn → nhắc kỳ kê khai (Q-023) | ketoan · vùng trồng mã số |
| Kênh seed | `quay,b2b,shopee,tiktok,lazada,zalo` | `quay,b2b,booking,zalo,food` | `b2b,shopee,tiktok,live,zalo` |

- **Đích**: `mobile.html` `obdanhmuc`; `js/sm-onboard.js` `ON.danhMucCho(t)`.
- **Nghiệm thu**: 3 bộ câu trả lời → 3 danh mục đúng bảng trên (so từng dòng); nhóm BẮT BUỘC của CD1 có chữ «30 ngày» + nhãn [Q-001] trong nguồn màn hình (chế độ «xem nguồn màn hình» của công cụ demo); CD3 KHÔNG thấy connector HĐĐT nhóm LUẬT nhưng THẤY mục «khách doanh nghiệp đòi hoá đơn?» mở được (B.8 Kiểu 3).

### B.8 OB-4 «Luồng từng connector» — màn `obcon-<ma>` (T1-3d SỬA theo hoà giải T5-2.2/2.5 + sweep IV.4)

Mỗi connector mở bằng: «{Tên dịch vụ} — nhà mình ĐÃ có tài khoản chưa?» — **«Có rồi»** (XIN QUYỀN) · **«Chưa có — đăng ký ngay trong app»** (ĐĂNG KÝ MỚI) · **«Để sau»**. Ba kiểu đại diện; **bảng tham số đầy đủ 12 connector = mục C (một nguồn duy nhất, không đặc tả 2 nơi — tinh thần hoà giải T5-2.7).**

#### Kiểu 1 — SEPAY «tức thì» [Q-002]

- **Nhánh CÓ**: chọn ngân hàng trong 12+ ngân hàng SePay hỗ trợ → app mở màn trung gian vẽ đúng URL `developer.sepay.vn` + chữ «Trang này do SePay phụ trách» → hộ nhập OTP ngân hàng → SePay bắn webhook thử → nhận được = `da_ket_noi`. 3 chạm; lead-time «khoảng vài phút» [Q-002].
- **Nhánh CHƯA**: KHÔNG mở hộ tài khoản ngân hàng — checklist «Đem CCCD đến quầy ngân hàng gần nhất; muốn chọn ngân hàng nào cứ hỏi cán bộ» + nút «Xong, tôi đã có tài khoản» → về nhánh CÓ (mở tài khoản là nghiệp vụ ngân hàng — ngoài scope, tinh thần N-07 không ôm việc bên khác).
- **Ai bấm cuối**: hộ bấm «Xác nhận cấp quyền»; OTP do ngân hàng gửi cho hộ — cán bộ không làm thay bước OTP (N-06).
- Khối «cài đặt nâng cao» (chỉ cán bộ): webhook at-least-once, retry 7 lần giãn Fibonacci ~33 phút, quá 5 giờ bỏ; response 200 trong 30 giây (Webhooks) / 8 giây (Bank Hub IPN); chống trùng theo `id`/`transaction_id` [Q-002·Q-006].
- **Mô phỏng**: nút «Mô phỏng: SePay bắn webhook thử» → sự kiện `tien-ve` (kịch bản `tienVe` sm-inbox.js:215-226) → webhook → inbox → `process()` → dòng tiền mới trong tab Tiền.
- **Nghiệm thu**: OB-1 tới SePay `da_ket_noi` ≤10 chạm tổng; kịch bản «Tiền về» chạy mà tab Tiền tăng đúng số tiền payload.

#### Kiểu 2 — ZALO OA «chờ duyệt» [Q-004]

- **Nhánh CÓ OA**: xin số điện thoại quản trị OA + quét mã «cấp quyền cho OPC quản tin» (mô phỏng). Cơ chế uỷ quyền OA sẵn có cho bên thứ ba: **THIẾU BẰNG CHỨNG** — câu hỏi radar H/Q-047; mockup gắn `cho_duyet` kèm «chờ xác nhận cơ chế — cán bộ kiểm tra».
- **Nhánh CHƯA**: form thu hồ sơ ngay trong OPC — cần **Giấy phép ĐKKD** [Q-004] + tên OA + ảnh đại diện; app điền sẵn từ `t`; hộ chỉ chụp ảnh giấy phép («Đính kèm ảnh mẫu»). **Xem trước đơn PDF** → nút to **«Chủ hộ bấm: Gửi đăng ký»** (tên từ `t.chuHo`) → `cho_duyet`, `hanDuKien` = hôm nay + 2–3 ngày làm việc [Q-004] (`ON.congNgayLamViec`), dòng «Ban quản trị Zalo duyệt hồ sơ trong 2–3 ngày làm việc».
- Trong lúc chờ: app vẫn nhận tin Zalo CÁ NHÂN của hộ (seed `messages` kênh `zalo`) — khách không phải chờ.
- **Giá trị mở khoá + ràng buộc phí** hiển thị trong màn: trả lời khách trong cửa sổ tương tác 7 ngày, 8 tin miễn phí/48 giờ rồi 55đ/tin; tin Giao dịch 165đ/tin [Q-005].
- **Nghiệm thu**: bấm Gửi → `cho_duyet` + `hanDuKien` đúng công thức ngày làm việc; nút «Mô phỏng: Zalo duyệt xong» (sự kiện `ket-qua-duyet`) → `da_ket_noi` + dòng nhật ký.

#### Kiểu 3 — HĐĐT / CTS «điều kiện + người ký» [Q-001][Q-002] (bỏ cấm ≤1 tỷ theo hoà giải T5-2.2)

- **Mặc định hộ ≤1 tỷ**: «Chưa bắt buộc với hộ mình — app canh ngưỡng» — KHÔNG cấm nữa. **Tín hiệu mở luồng gửi**: câu 3 chọn «bán cho nhà hàng, công ty» HOẶC nút «khách đòi hoá đơn» (tình huống chị Nga Vĩnh Hiệp của CD3 — T3-CD3 (c), THUMOI III-CD3 «xuất hóa đơn bán hàng cho doanh nghiệp chế biến»). Màn luôn ghi «**đây là nhu cầu của hộ, không phải luật đòi**». Hộ dưới ngưỡng được đăng ký HĐĐT tự nguyện qua cổng miễn phí [Q-002].
- **Hộ >1 tỷ**: đếm lùi «30 ngày» [Q-001] bằng hàm chung `mocVuotNguong(t)` (D-#1, hoà giải T5-2.5).
- **Nhánh ĐÃ có HĐĐT** (NCC Viettel/VNPT/MISA/FPT/SePay được CQT công nhận [Q-002]): hỏi «Ai đang phát hành hoá đơn cho nhà mình?» → việc «đối tác cũ → chuyển/ghép nối OPC» — **THIẾU BẰNG CHỨNG** cơ chế từng NCC (H, câu mở sẵn Q-021); mockup: `cho_duyet` + «chưa rõ thời gian — cán bộ theo dõi».
- **Nhánh CHƯA — 2 đường**: (1) **Cổng miễn phí** hoadondientu.gdt.gov.vn — HĐĐT có mã **miễn phí**, đăng ký bằng MST, phản hồi **15 phút–1 ngày làm việc** [Q-002]; app điền đơn từ hồ sơ; **chủ hộ bấm «Gửi đăng ký»** (N-06). (2) **NCC trung gian có API** — ký số online 100% không cần USB token (SePay eInvoice [Q-002]); giá/phương thức **THIẾU BẰNG CHỨNG** (H, mở rộng Q-040); hiển thị «đang kiểm tra giá — sẽ hỏi trước khi bật».
- **Chữ ký số** — bắt buộc cho phát hành HĐĐT · kê khai/nộp thuế điện tử · BHXH điện tử [Q-001]. **Đường chính là ký số online KHÔNG cần USB token** [Q-002]; nhánh «đã có token USB» là phụ, kèm cảnh báo «cần mượn máy tính có cổng, 1 lần» (đảo mặc định theo sweep T5 IV.4). Người ký là chủ hộ — không ai ký thay (N-06); màn xác nhận ký hiện `t.chuHo` + «Chữ ký này là của cô/chú, dùng cho hoá đơn và tờ khai — không ai khác dùng được». Hồ sơ đăng ký CTS hộ KD cần gì: **THIẾU BẰNG CHỨNG** (H, mở rộng Q-041).
- **Nghiệm thu**: CD1 thấy 2 đường + đếm «30 ngày»; CD3 mặc định «canh ngưỡng», sau tín hiệu mở thấy luồng gửi + nhãn «tự nguyện»; «Mô phỏng: cổng thuế phản hồi» → `da_ket_noi`, phát hành 1 hoá đơn (màn hiện có) → hoá đơn có mã CQT.

### B.9 OB-5 «Trạm kết nối» — gộp vào màn `ketnoi` (T1-3e GIỮ, gọp thêm ngân sách tin của T5 Top-10 #6)

Sau OB-3, mọi việc nối dở rời wizard, về **một nơi duy nhất: Trạm** = tab «Kết nối» (`ketnoi`) đã có trong app — không thêm tab mới, không thông báo rời rạc. Ba khối:

1. **«Đang chờ ai — dự kiến ngày nào»** — mọi connector `cho_duyet`/`dang_dang_ky`: dòng «Đang chờ {bên thứ ba} — dự kiến {hanDuKien}» + thanh thời gian (đã chờ bao lâu / còn bao lâu, tính từ `SM.CLOCK.today`). `dang_dang_ky` hiện «Đang làm dở — bấm mở tiếp đúng chỗ bỏ dở». **Quá `hanDuKien`** → thẻ chuyển đỏ + dòng «Đã quá ngày dự kiến» + nút **«Gọi cán bộ {t.coCanBo.ten}»** (có `coCanBo`) hoặc «Yêu cầu cán bộ liên hệ» (chưa có — tạo việc trong Sổ trực b2g, B.11). Không bao giờ im lặng bỏ qua.
2. **«Nối tiếp — việc kế tiếp của nhà mình»** — connector `chua_hoi`/`chua_co_tk` sắp theo thứ tự niềm tin (C.14), mỗi thẻ kèm «giá trị mở khoá» 1 câu.
3. **«Đã xong»** — `da_ket_noi`, gập lại, bấm mở ra xem số liệu đã chảy + «ngắt kết nối» (B.15).

Trạm cũng hiện tiến độ tổng `ON.tienDo(t)` (%) + banner mờ khi `bo_qua_tam` («Phần mở đầu còn dở — 5 phút là xong»).

**Ngân sách tin — hàm chốt duy nhất** `ON.duocDayTin(t, ngay)` trong sm-onboard.js: tối đa **1 tin đẩy ngoài app / ngày / hộ** (hộp thư đến + Web Push của v3; N-09 — không broadcast); việc còn lại trong ngày chỉ badge đỏ trong Trạm. Tin Zalo OA hộ→khách tuân phí riêng Q-005 (D-#4). Mọi nơi muốn «nhắc» đều gọi hàm này — cấm đẩy thẳng.

- **Đích**: `mobile.html` sửa view `ketnoi` (thay khối connector v3); `js/sm-onboard.js` `ON.duocDayTin`.
- **Nghiệm thu**: seed 3 tenant mở Trạm thấy đủ 3 khối đúng trạng thái; kịch bản «quá hạn» (`SM.dayOffset`) → thẻ đỏ + nút gọi cán bộ; bật 2 việc cùng ngày → chỉ 1 tin đẩy (nhật ký có đúng 1 dòng `dayTin`).

### B.10 OB-6 «Việc đầu tiên» — đích đo R-A2-07 (T1-3f, kịch bản T3 đã đối chiếu T5)

Khi `du_toi_thieu` đạt, Trạm hiện **một** việc đầu tiên theo chân dung (chọn việc phù hợp nhất, không đưa menu):

- **CD1 Biển Xanh (khách sạn + nhà hàng >1 tỷ)**: «Xuất hoá đơn điện tử cho đoàn khách doanh nghiệp đang lưu trú» — sau khi HĐĐT `da_ket_noi`; hoá đơn có mã CQT (màn phát hành hiện có), công nợ B2B tự gắn theo hoá đơn (tab Đơn). Ghi nhận: «trước đây chị Thu Hà chụp giấy gửi kế toán giờ hành chính — giờ hoá đơn ra ngay tại quầy» (kịch bản T3-CD1; tên theo seed `keCan` CD1 — Claude verify sửa, T6 ghi nhầm «chị Ngân» không có trong seed).
- **CD2 Nhơn Lý (homestay mùa vụ)**: «Nhận tin đặt phòng mới nhất bằng máy trả lời sẵn» — Zalo OA `da_ket_noi` + tin nhắn đặt phòng trong seed → app soạn mẫu trả lời (xác nhận phòng + giá mùa) — anh Duy chỉ bấm gửi; tiền cọc qua QR SePay tự thành dòng Tiền (kịch bản T3-CD2; tên theo seed `keCan` CD2 «Anh Lê Minh Duy» — Claude verify sửa, T6 ghi nhầm «chị Hằng» không có trong seed).
- **CD3 Chư Păh (thu mua nông sản)**: «Chốt lượt bán đầu tiên + chép bảng kê thu mua trong ngày»: bán thu **10,19 triệu qua QR + 0,72 triệu tiền mặt = 10,91 triệu** trong ngày (T3-CD3; tổng đã sửa lại theo chỉ ra của T5 — lấy bằng HÀM TÍNH từ kho, không cộng tay), kèm 1 dòng bảng kê thu mua của 2 người bán (màn bảng kê hiện có) — đúng «một ngày bán 10,91 triệu, thu mua của 2 người bán» (T3-CD3).

Việc xong ghi `viecDauTien.doneLuc`; Trạm hiện «Từ lúc mở app tới việc đầu tiên hoàn tất: {phút} phút» (hiệu `doneLuc − batDauLuc` — cả hai mốc thật trong `t`). Đây là con số «độ nhanh» duy nhất được hiển thị — không có số «5 phút» viết cứng (ước «~5 phút có cán bộ / ~12–20 phút tự làm» của T3-(e) gắn nhãn [tự đề xuất, ước cho demo]).

- **Nghiệm thu**: 3 chân dung chạy tới `xong_viec_dau`; CD3 chạy được khi offline (B.4); số phút trên Trạm khớp hiệu 2 mốc trong `t.onboarding.viecDauTien`.

### B.11 Chế độ làm-cùng-cán-bộ + Sổ trực b2g (T1-5 GIỮ, nâng thành khối bắt buộc theo lỗ hổng T5-3a — thiếu sót lớn nhất cho khoá 150 hộ)

**Phía hộ**: câu 0 chọn «cán bộ» (hoặc cán bộ mở app hộ trong buổi thăm) → gắn `t.onboarding.coCanBo = { maCanBo, ten, diaBan }` — mọi màn wizard hiện dải mỏng trên đầu «Cán bộ {tên} đang cùng làm — mọi bước hộ tự bấm». Cán bộ có nút riêng «Xác nhận đã nối» (dùng khi không có tín hiệu ngoài — ví dụ bên thứ ba xác nhận qua điện thoại): bấm thì PHẢI kèm mã cán bộ + lý do bằng chữ → `da_ket_noi` + 1 dòng nhật ký tenant + 1 dòng Sổ trực. **Không có đường tắt «bấm hộ toàn bộ»** — hộ vẫn tự bấm nút Gửi của mình (N-06).

**Phía b2g — khối «Sổ trực onboarding»** (thêm vào `b2g.html`, 6 mục):

| # | Mục | Dữ liệu |
|---|---|---|
| 1 | Suất QR | sinh mã `GL26-*`, trạng thái (chưa cấp/đã in/đã dùng), ai in (mã cán bộ), ngày cấp — điều kiện verdict T1-3a (P3/P6) |
| 2 | Hộ ai theo | map tenant ↔ cán bộ địa bàn (`coCanBo`) — nhìn đâu biết hộ nào của ai |
| 3 | Xác nhận tay | mọi dòng «cán bộ xác nhận nối» — mã cán bộ + việc + lý do (điều kiện verdict T1-4 chống đạt-giả) |
| 4 | Hạn 30 ngày | hộ >1 tỷ đang đếm lùi / đã cháy hạn [Q-001] — vàng <7 ngày, đỏ đã quá |
| 5 | Quá hạn chờ | connector `cho_duyet` vượt `hanDuKien` chưa xử lý — việc gọi lại hộ |
| 6 | Việc hoãn nhóm LUẬT | hộ hoãn HĐĐT/CTS + lý do — không để «nuốt» trạng thái (B.1) |

Kèm theo T5-3a: khối **«Việc hôm nay của cán bộ»** (mỗi việc `data-di` đi thẳng đúng hộ — mức xử lý nhắc/gọi/hẹn tận nơi đúng IV.6 «cầm tay chỉ việc»); **định mức nhân sự** hiển thị số hộ/cán bộ + phân bố thời gian-tới-việc-đầu-tiên theo cán bộ vs tự làm (trả lời THUMOI V.3 bằng số demo, không bịa); **nhóm theo đợt nộp OA** (150 hộ nộp cùng lúc [Q-004] → nhóm «đợt + ngày dự kiến duyệt», không gọi từng hộ). Ranh giới IV.8 giữ nguyên: chỉ trạng thái + ngày, không đơn/tin nhắn chi tiết.

- **Đích**: `b2g.html` + `js/sm-b2g.js` (file mới, xem E); `js/sm-onboard.js` nút xác nhận tay.
- **Nghiệm thu**: cán bộ xác nhận tay 1 connector → 1 dòng hiện ở CẢ nhật ký tenant VÀ Sổ trực b2g (đủ điều kiện T1-4); sinh QR trong b2g → dùng được ở OB-1; bảng hạn 30 ngày có ít nhất 1 dòng (CD1 seed); nhóm đợt nộp OA hiện ≥2 đợt.

### B.12 Onboarding LẠI (T1-6)

«Tôi đã từng dùng OPC» (từ OB-1 hoặc màn hồ sơ): KHÔNG reset máy trạng thái tổng; giữ toàn bộ dữ liệu bán/tiền; chỉ mở lại phần HỎI (OB-2) — lý do: đổi điện thoại (kèm mã suất cũ), đổi nghề, trả lời sai. `ON.danhMucCho` tính lại: connector đã `da_ket_noi` giữ nguyên; connector mới sinh `chua_hoi`; connector không còn phù hợp → «Không còn cần cho nghề mới — ngắt hay giữ?» (hộ chọn). Mỗi lần hỏi lưu `t.onboarding.lichSu[]` (ngày + toàn bộ câu trả lời) — truy vết được «hộ từng nói gì».

- **Nghiệm thu**: làm lại OB-2 đổi `nganh` → danh mục đổi theo; connector `da_ket_noi` cũ không mất; `lichSu` có 2 bản.

### B.13 Bảng điểm bỏ cuộc — ứng xử an toàn (T1-7, 11 điểm)

| # | Điểm bỏ cuộc | Ứng xử |
|---|---|---|
| 1 | OB-1 «Để sau» | vào app bình thường, banner mờ ở Trạm, KHÔNG đẩy tin |
| 2 | QR sai 3 lần | «Gọi cán bộ địa bàn» — màn `hoso`, không treo |
| 3 | OB-2 giữa chừng «Để sau» | `bo_qua_tam` — mở lại đúng câu đang dở |
| 4 | Câu giấy tờ «Chưa rõ» | `chua_hoi` + «cán bộ kiểm tra» — không chặn connector khác |
| 5 | SePay «chưa có tài khoản NH» | checklist quầy ngân hàng + nút «Đã có rồi» → về nhánh CÓ |
| 6 | Zalo OA chờ duyệt quá hạn | thẻ đỏ Trạm + việc gọi cán bộ (Sổ trực #5) |
| 7 | HĐĐT cổng chậm phản hồi | «chưa rõ thời gian — có cán bộ theo dõi» + Sổ trực #5 |
| 8 | Mất mạng mọi lúc | hàng đợi `SM.enqueue` + badge «gửi khi có mạng» (B.4) |
| 9 | Hộ >1 tỷ cháy hạn 30 ngày | KHÔNG coi là đạt — đẩy việc cán bộ (Sổ trực #4), app hiện «đã quá hạn {n} ngày — cần xử lý» |
| 10 | Bố mẹ bỏ dở giữa chừng | phần còn dở = «việc giao người nhà», kế cận mở máy thấy việc (B.5 câu 0) |
| 11 | Muốn ngừng dùng OPC | màn «Tạm dừng dùng» — xuất dữ liệu + hướng ngắt từng kết nối (B.15, lỗ hổng T5-3d) |

### B.14 Tích hợp vào tab `ketnoi` hiện có (T1-8) — 3 thay đổi bắt buộc

1. **Gỡ auto-noi**: xoá nhánh `batBuoc` auto `da_ket_noi` (sm-domain.js:869) và `toggleConnector` giả (sm-domain.js:877-886) — kết nối chỉ đến từ máy trạng thái B.2 (sự kiện ngoài / xác nhận cán bộ có nhật ký).
2. **Bảng chuyển id** (chi tiết C.0): `CONNECTORS` v3 đổi sang 12 id mới; seed `t.connections`, `donVe` đếm `o.channel === c.id`, `b2g.html`/`web.html` đọc `D.connectors` — một ánh xạ `ID_MOI ← ID_CU` duy nhất đặt trong sm-domain.js, mọi nơi khác qua ánh xạ.
3. **Render lại màn `ketnoi`**: nhóm 3 lớp BẮT BUỘC/NÊN CÓ/ĐỂ SAU + trạng thái B.2 + độ tươi C.15 — thay danh sách phẳng v3 (sm-domain.js:834-858).

### B.15 Bảo mật & vòng đời dữ liệu (T1-9 + lỗ hổng T5-3c.8/3d.9)

- **Không mật khẩu của bên ngoài nào nằm trong OPC**: xin quyền luôn qua trang chính chủ (B.0 iii); app chỉ giữ token mô phỏng của connector do hộ cấp — hiển thị trong «Danh sách đã cấp quyền» + nút thu hồi từng cái.
- **Ảnh giấy tờ định danh** (T5-3c.8): dòng hiển thị bắt buộc trên mọi màn chụp giấy tờ: «Ảnh giấy tờ nằm trong máy của hộ; bản gửi đi là bản rút gọn không kèm ảnh gốc»; cán bộ (kể cả b2g) chỉ thấy TRẠNG THÁI hồ sơ, không thấy ảnh.
- Kho bền `smv3:db` chỉ nằm máy hộ (mockup: localStorage); cán bộ KHÔNG xem được số bán của hộ từ b2g — Sổ trực chỉ có trạng thái onboarding + hạn, không có doanh thu (ranh giới dữ liệu THUMOI).
- **Kết thúc dùng** (T5-3d.9): màn «Tạm dừng dùng OPC» đặt trên nền màn `dulieu` hiện có — (1) xuất toàn bộ dữ liệu JSON + CSV (lộ đường đi: nút tải 2 file — trả lời THUMOI IV.3 «không khóa dữ liệu»); (2) checklist ngắt kết nối từng dịch vụ (link trang quản lý tài khoản từng bên + nút thu hồi token); (3) xoá kho local (confirm 2 lần + gõ chữ «XOÁ»); (4) dòng cuối «Dữ liệu trên máy này đã xoá. Các quyền đã cấp cần cô chú tự bấm ngắt ở trang của họ — OPC không thể ngắt thay» (N-06). Chủ hộ bấm nút cuối (P13).
- **Nghiệm thu**: màn hiện đủ 4 bước; export chạy ra 2 file; sau xoá, mở lại app = trạng thái trắng như lần đầu cài; không màn nào cho cán bộ xem ảnh giấy tờ.

---

## C. Trạm kết nối — 12 connector (đặc tả một nguồn duy nhất, theo T2)

### C.0 Bảng chuyển id (T2-0 + verdict SỬA nhẹ của T5: kèm kế hoạch migrate)

| id v4 | Gộp/đổi từ v3 | Hiển thị cho hộ | Chỗ phải đổi cùng lúc |
|---|---|---|---|
| `bank` | `bank` + `qr` | «Tài khoản ngân hàng + nhận tiền QR» | seed `t.connections` gộp 2 dòng cũ |
| `zalooa` | `zalo` | «Zalo OA (trang kinh doanh Zalo)» | đổi khóa; `messages` kênh `zalo` giữ nguyên |
| `hddt` | `hddt` | «Hoá đơn điện tử» | giữ |
| `cts` | `cks` (đổi tên) | «Chữ ký số» | đổi id, giữ `t.chuKySo` nếu có |
| `etax` | `etax` + `cthue` | «Kê khai thuế điện tử» | gộp: tờ khai + nộp thuế một nơi |
| `ketoan` | `ntqg` | «Sổ kế toán (nền tảng Nhà nước)» | giữ cờ «chưa vận hành» (N-01: chỉ dẫn sang) |
| `shopee` | `shopee` | «Gian hàng Shopee» | giữ |
| `tiktok` | `tiktok` | «Gian hàng TikTok Shop» | giữ |
| `lazada` | `lazada` | «Gian hàng Lazada» | giữ |
| `shipper` | `ghn`+`ghtk`+`vtp` | «Đơn vị vận chuyển» | nhóm 1 connector, chọn hãng bên trong |
| `pos` | `pos` (nếu v3 có) / mới | «Máy tính tiền» | đường HĐĐT qua máy tính tiền [Q-001] |
| `booking` | `booking` | «Nền tảng đặt phòng/đặt tour» | đại diện nhóm nền tảng đặt trước (agoda/travel); nền tảng giao đồ ăn (`food`) tham chiếu nhóm này — API từng nền tảng THIẾU BẰNG CHỨNG chung (Q-042/Q-045) |

Ánh xạ `ID_MOI ← ID_CU` đặt duy nhất trong `js/sm-domain.js` (`D.chuyenId`); `donVe` đếm `o.channel === c.id` (qua ánh xạ); `b2g.html`/`web.html` đọc `D.connectors`. Không có ánh xạ này thì v4 nối sai lệch đơn về connector (cảnh báo của T5 tại verdict T2-0).

### C.1 Chuẩn 10 trường mỗi connector (T2: Ai cần · Vì sao · Tiên quyết · Cách đăng ký + ai bấm · Lead-time · Chi phí · Cơ chế + độ tươi · Khi chết · Mô phỏng · Trạng thái onboarding) — bảng tham số đầy đủ

| id | Kiểu (B.8) | Xác nhận `da_ket_noi` | Lead-time (nhãn) | Ai bấm cuối (N-06) | Hồ sơ cần | Phí/ràng buộc | Sự kiện mô phỏng (KICH_BAN) |
|---|---|---|---|---|---|---|---|
| `bank` | tức thì | SePay webhook thử [Q-002] | self-serve ~5 phút [Q-002] | hộ (OTP ngân hàng) | tài khoản NH + OTP | theo NH của hộ | `tien-ve` |
| `zalooa` | chờ duyệt | thông báo Zalo duyệt [Q-004] | 2–3 ngày làm việc [Q-004] | chủ hộ «Gửi đăng ký» | GP ĐKKD + tên OA + ảnh [Q-004] | 8 tin/48h rồi 55đ; Giao dịch 165đ; cửa sổ 7 ngày [Q-005] | `khach-nhan-tin` + `ket-qua-duyet` |
| `hddt` | điều kiện | phản hồi cổng/NCC [Q-002] | cổng miễn phí: 15 phút–1 ngày làm việc [Q-002] | chủ hộ «Gửi đăng ký» | MST + CTS | cổng miễn phí [Q-002]; NCC: THIẾU BẰNG CHỨNG (Q-040) | `hddo-phai-hieu` |
| `cts` | điều kiện | NCC CTS xác nhận (mô phỏng) | chưa rõ — cán bộ theo dõi (Q-041) | chủ hộ ký (tên trên nút) | THIẾU BẰNG CHỨNG (Q-041) | theo NCC — chưa rõ (Q-041) | `cts-kich-hoat` |
| `etax` | điều kiện | cán bộ xác nhận (có nhật ký) | theo kỳ kê khai — Q-023 | cán bộ mở phiên, hộ xác nhận + bấm «Nộp» | MST + CTS | miễn phí (cổng nhà nước) [Q-001] | `thue-ky-ke-khai` |
| `ketoan` | ĐỂ SAU | — (chưa vận hành) | — [Q-001 NĐ 20/2026] | — | — | miễn phí khi vận hành [Q-001] | — |
| `shopee` | chờ duyệt | Open Platform cấp token [Q-002] | token 4h, refresh 1 tháng [Q-002] | hộ uỷ quyền trên trang chính chủ (publish app là việc nội bộ QNSC, không phải thay hộ ký) | tài khoản người bán | «từ 27/05/2026 Shopee chỉ nhận kết nối qua Open Platform» [Q-002; câu chữ theo verdict T2-1.7 — điều kiện đang sống, không phải deadline] | `don-san-moi` |
| `tiktok` | chờ duyệt | mô phỏng (THIẾU BẰNG CHỨNG — Q-042) | chưa rõ (Q-042) | hộ cấp quyền trang chính chủ | tài khoản người bán | chưa rõ (Q-042) | `don-san-moi` |
| `lazada` | chờ duyệt | mô phỏng (THIẾU BẰNG CHỨNG — Q-042) | chưa rõ (Q-042) | hộ cấp quyền trang chính chủ | tài khoản người bán | chưa rõ (Q-042) | `don-san-moi` |
| `shipper` | tức thì (mỗi hãng) | webhook đổi trạng thái đơn (mô phỏng) | theo hãng — chưa rõ (Q-043) | hộ chọn hãng + cấp quyền | tài khoản hãng vận chuyển | COD về thẳng tài khoản ngân hàng hộ (N-07 — giữ payment «Tiền thu hộ» sm-inbox.js:144-150) | `don-hang-cap-nhat` |
| `pos` | điều kiện | cán bộ xác nhận (máy tại quầy) | 1 buổi tại quầy [tự đề xuất] | cán bộ lắp, hộ duyệt | máy tính tiền có sẵn | theo NCC máy — chưa rõ (Q-044 KiotViet) | `pos-phien-ban` |
| `booking` | chờ duyệt | nền tảng xác nhận (mô phỏng) | chưa rõ (Q-045) | hộ cấp quyền trang chính chủ | tài khoản chỗ nghỉ/tour | hoa hồng 82.500đ = số mô phỏng [seed] | `booking-moi` |

Trường «Vì sao» (Ai cần) + «Tiên quyết» thể hiện ngay trong thẻ OB-4 (B.8) và Trạm; mọi ô «chưa rõ» hiển thị đúng dòng «chưa rõ thời gian — có cán bộ theo dõi» (B.0 nguyên tắc 7), KHÔNG bịa số.

### C.2 Chính sách tin Zalo OA (T2-1.2 + T4-#4 SỬA nhẹ + hoà giải T5-2.8) [Q-005·N-09]

- Hàm `ON.cuaSoTin(t, khach)` tính từ `t.messages` (tin cuối 2 chiều): «còn trong cửa sổ 7 ngày» / «im lặng X ngày» + số tin miễn phí còn trong 48h + giá đường gửi được [Q-005].
- Trước MỌI nút gửi tin cho khách: thẻ phí «tin Tư vấn, miễn phí (còn k/8 trong 48h)» hoặc «hết cửa sổ TỰ ĐỘNG → tin Giao dịch 165đ/tin [Q-005]» + tổng tiền nếu gửi N khách. KHÔNG nói «hết cửa sổ = hết đường» — gửi tay qua OA Manager có thể khác (365 ngày, trang không ghi ngày cập nhật — chỉ «tham khảo», chờ Q-033/034 chốt, không dùng con số 365).
- Ngân sách chung: in-app là kênh chính (badge đỏ + Trạm); Zalo OA tới CHỦ HỘ ≤1 tin/ngày gom mọi việc (B.9); tin Giao dịch 165đ chỉ cho việc có hạn pháp lý (hạn 30 ngày HĐĐT, hạn kê khai). Broadcast 4 tin/tháng gói Premium [Q-005] không dùng làm kênh vận hành (N-09) — chỉ hiện trong màn «thông báo cho khách» của hộ.
- Seed thêm 1 khách tương tác cuối >7 ngày để demo. Nghiệm thu: khách im lặng >7 ngày → sheet nhắc nợ hiện «hết cửa sổ tự động — 165đ/tin» + nút «soạn ZNS»; trong cửa sổ → «miễn phí, còn k/8»; gửi xong hàng đợi hiển thị tin đang chờ; gửi 9 tin/48h → tin thứ 9 hiện phí trước nút.

### C.3 Hàm chung `mocVuotNguong(t)` (hoà giải T5-2.5 — thay 2 bản `moc30Ngay`/`periodRange` của T1/T4 bằng 1 hàm; dùng chung D-#1)

```js
// js/sm-domain.js — đặt cạnh helpers thuế hiện có
D.mocVuotNguong = function(t, ky) {      // ky: 'quy' (mặc định) | 'nam' — tham số hoá kỳ
  const luc = t.vuotLuc;                 // mốc vượt 1 tỷ (seed ghi sẵn ở tenant — T5-2.5)
  if (!luc) return null;                 // chưa vượt → Trạm hiện «canh ngưỡng»
  const han = D.congNgay(luc, 30);       // 30 ngày [Q-001]
  return { luc, han, conLai: D.ngayGiua(SM.CLOCK.today, han) };
};
```

- Nhãn hiển thị bắt buộc khi `ky='quy'`: «giả định kỳ quý — chờ Q-023»; chỗ hiện số ngày đếm lùi luôn kèm [Q-001].
- Gọi tại: OB-4 Kiểu 3, Trạm (thẻ hạn), b2g Sổ trực #4, tab Thuế (D-#1). T1/T2/T4 cùng gọi hàm này — không còn bản thứ hai.
- Nghiệm thu: đổi `ky` không đổi mốc `luc`/`han` (chỉ đổi nhãn); CD2 (chưa vượt) trả `null` → hiển thị «canh ngưỡng»; CD1 hiện «còn N ngày» với N tính từ seed.

### C.4–C.12 Ghi chú riêng từng connector (phần chưa có ở C.1/B.8)

- **C.4 `bank`**: webhook thử là tín hiệu nối; dòng QR/CK vào `bankai` (seed); dedup `transaction_id` [Q-002·Q-006] — kịch bản TRÙNG ở D-#3; chết >5 giờ không retry [Q-006].
- **C.5 `zalooa`**: chờ duyệt KHÔNG chặn nhận tin cá nhân; sau nối: mẫu trả lời tự động chỉ với khách trong cửa sổ 7 ngày [Q-005]; độ tươi tin khách về: THIẾU BẰNG CHỨNG (Q-034).
- **C.6 `hddt`**: 2 đường (cổng miễn phí / NCC API) như B.8 Kiểu 3; hoá đơn phát hành gắn `maCQT` + công nợ B2B tự gắn; độ tươi «15 phút–1 ngày làm việc» là phản hồi, không phải luồng [Q-002].
- **C.7 `cts`**: tiên quyết cho `hddt`/`etax` (đứng TRƯỚC — T2-1.4); người ký = chủ hộ (N-06); đường chính ký online không USB [Q-002]; cảnh báo hết hạn trước (seed `han` + kịch bản chặn phát hành khi CTS hết hạn).
- **C.8 `etax`**: «thủ công hai chiều — mức tối đa của N-06» (T2-1.5): OPC chuẩn bị tờ khai (hàm tính từ `D.revenueLines` + dòng thuế sàn [Q-019]), HỘ bấm «Nộp»; không có API thuế mở [Q-002]; 0đ có nhãn «không thấy nguồn ghi phí»; kỳ kê khai nhóm ≤1 tỷ chờ Q-023.
- **C.9 `ketoan`**: giữ cờ «chưa vận hành» [Q-001 NĐ 20/2026]; thẻ chỉ có nút «Xem hướng dẫn nền tảng miễn phí của Nhà nước» + nút xuất JSON/CSV (THUMOI IV.3 «không khóa dữ liệu») + dòng «OPC không làm thay sổ kế toán» (N-01); MISA (hộ >1 tỷ đã dùng) cấp quyền qua NVKD [Q-002].
- **C.10 `shopee`·`tiktok`·`lazada`**: đơn sàn về hộp thư chung (NGUON `san`); Shopee qua Open Platform [Q-002 — nguồn blog, cảnh báo Q-026], 2 sàn kia khuôn Shopee nhưng THIẾU BẰNG CHỨNG (Q-042); polling ≥24h + idempotency trước connector đầu [Q-003]; `tiktok`/`lazada` là uỷ quyền trong phiên [tự đề xuất] (verdict T1-3d SỬA nhẹ).
- **C.11 `pos`**: đường «HĐĐT khởi tạo từ máy tính tiền kết nối dữ liệu CQT» (k5 Đ8 NĐ 68/2026 [Q-001] — chuẩn kỹ thuật/danh mục thiết bị chờ Q-046); kết nối-not-thay-thế; hợp nhất phiên POS thành dòng bán; tham chiếu giá KiotViet [Q-007, kiểm chứng Q-044].
- **C.12 `shipper`·`booking`**: shipper nhóm 3 hãng (GHN/GHTK/Viettel Post — điều kiện API chờ Q-043), trạng thái đơn đẩy `don-hang-cap-nhat`, COD về thẳng tài khoản hộ (N-07); booking đại diện nhóm nền tảng đặt trước cho CD2 (2 nền tảng), hoa hồng 82.500đ = số mô phỏng [seed], điều kiện đối tác chờ Q-045.

### C.13 Ma trận CD × connector (chuẩn T2-2, khớp B.7)

| Connector | CD1 (>1 tỷ) | CD2 (780tr, ước 1.243tr) | CD3 (607tr) |
|---|---|---|---|
| `bank` | NÊN CÓ | NÊN CÓ | NÊN CÓ |
| `zalooa` | NÊN CÓ | NÊN CÓ | NÊN CÓ |
| `hddt` | BẮT BUỘC (đã vượt) | tự nguyện (b2b) — mở theo tín hiệu | tự nguyện (b2b — chị Nga) — mở theo tín hiệu |
| `cts` | BẮT BUỘC | NÊN CÓ (ký sớm) | ĐỂ SAU |
| `etax` | BẮT BUỘC | canh ngưỡng (`khong-biet`) | canh ngưỡng |
| `ketoan` | ĐỂ SAU (chưa vận hành) | ĐỂ SAU | ĐỂ SAU |
| `shopee`/`tiktok`/`lazada` | NÊN CÓ (3) | — (không bán sàn) | NÊN CÓ (3) |
| `shipper` | NÊN CÓ | — | NÊN CÓ |
| `pos` | ĐỂ SAU | — | theo câu 5 |
| `booking` | ĐỂ SAU (OTA khách sạn) | NÊN CÓ (2 nền tảng) | — |

### C.14 Thứ tự nộp hồ sơ ngày 0 (T2-2 — lead-time ngược + thứ tự niềm tin B.0 iv)

1. `zalooa` nộp NGAY ngày 0 (chờ 2–3 ngày [Q-004] — nằm chờ trong lúc làm việc khác) → 2. `shopee` + `tiktok` (uỷ quyền shop) → 3. `shipper` (cấp key hãng sẵn dùng) → 4. `hddt` chỉ khi wizard có tín hiệu «khách doanh nghiệp đòi hoá đơn» (động cơ có trong seed; luật chưa bắt buộc [Q-001·Q-022 mở]) → 5. `etax`/`ketoan`/`pos` `bo_qua` mặc định, để sau. `bank` làm trước tiên ở mọi chân dung vì tức thì (kiến trúc niềm tin; T2 đặt zalooa đầu danh sách nộp HỒ SƠ — hai thứ tự không mâu thuẫn: nộp hồ sơ cái chậm nhất trước, làm ngay cái tức thì).

### C.15 Bảng ngân sách độ tươi (chuẩn duy nhất T2-3, đóng R-A3-02 — không đặc tả 2 nơi)

| Connector | Độ tươi CÔNG BỐ | Cơ chế | Chu kỳ poll an toàn | Nguồn |
|---|---|---|---|---|
| `bank` (tiền về) | **giây–phút** | webhook push realtime | ≥24h đối soát số dư [Q-003] | [Q-006] |
| `hddt` (phê duyệt) | 15 phút–1 ngày làm việc | trả lời sau | không áp | [Q-002] |
| `cts` | không áp (không luồng dữ liệu) | — | — | [Q-002] |
| `etax` | thủ công | thủ công | không áp | [Q-002] |
| `ketoan` | THIẾU BẰNG CHỨNG | tùy nền tảng | — | Q-009 · Q-037 |
| `zalooa` (tin khách về) | THIẾU BẰNG CHỨNG | webhook (chiều ra chặn cửa sổ 7 ngày) | — | Q-034 |
| `shopee` (đơn sàn) | THIẾU BẰNG CHỨNG | webhook + polling | ≥24h [Q-003] | Q-036 |
| `tiktok`/`lazada` | THIẾU BẰNG CHỨNG | webhook + polling (giả định) | ≥24h [Q-003] | Q-042 đề xuất |
| `shipper` (vận đơn) | THIẾU BẰNG CHỨNG | webhook + polling | ≥24h [Q-003] | Q-037 |
| `pos` (đơn quầy/tồn) | THIẾU BẰNG CHỨNG | polling là đường chính [Q-003] | theo rate limit | Q-037 · Q-044 |
| `booking` (đặt chỗ) | THIẾU BẰNG CHỨNG | webhook + polling | ≥24h [Q-003] | Q-045 đề xuất |

Mọi dòng THIẾU hiển thị nhãn «chưa đo — radar đang hỏi Q-0xx» thay vì để trống (R-A3-04); mỗi dòng kèm «cập nhật lần cuối X phút trước» tính từ `lanDongBoCuoi` (đổi sm-domain.js:871 từ `SM.CLOCK.today` sang mốc giờ seed + hàm fmt). Quy tắc chung: webhook là best-effort — «events will be missed. Not might. Will.» [Q-003] → mọi dòng webhook kèm polling đối soát ≥24h; idempotency store trước connector đầu; đứt >7 ngày → trạng thái `loi` «đứt từ {ngày}» (D-#5).

---

## D. Cải tiến ngoài onboarding — 12 điểm T4 với verdict T5 đã thi hành (giữ mã + xếp hạng T4-#n)

- **D-#1 Đồng hồ 30 ngày HĐĐT** (T4-#1, verdict SỬA: 1 hàm chung + nhãn kỳ): thẻ `nguong-30n` trong `deadlines()` khi `thuocDien` hoặc có mốc — «Còn N ngày đăng ký hoá đơn điện tử — hết ngày D» (N từ `mocVuotNguong` C.3, không viết cứng); CD2 thêm dòng «nếu đà này giữ nguyên, quý X sẽ vượt → chuông 30 ngày chạy cuối quý đó»; nút đi thẳng KB-02 (`js/sm-ai.js:36-39`) + checklist chuẩn bị. Nghiệm thu T4-#1: CD1 thấy thẻ «còn N ngày» tính từ seed; CD2 thấy «đà vượt + quý dự kiến»; hỏi trợ lý «bao giờ phải đăng ký hoá đơn» trả lời kèm «tính từ đâu».
- **D-#2 Màn «Độ tươi dữ liệu»** (T4-#2 GIỮ): đặt trong `ketnoi` (chung Trạm); nội dung bảng = C.15 (một nguồn); mỗi dòng có con số phút «lần cuối» từ hàm; dòng chưa đo hiện nhãn «chưa đo» (R-A3-04); không dòng nào viết «realtime» cho nguồn chưa có bằng chứng. Thêm 1 mục hồ sơ ở index.html.
- **D-#3 Kịch bản «SePay gửi TRÙNG» + màn «Trợ lý chạy nền»** (T4-#3 GIỮ): KICH_BAN thêm kịch bản TRÙNG — bấm 2 lần cùng một `id`: tiền chỉ cộng 1 lần, hộp thư bản 2 hiện «bản trùng theo id — đã bỏ, không cộng tiền lần hai», nhật ký «chặn N bản trùng» (dedup bằng chính kho localStorage — trung thực, không giả vờ backend; sửa chỗ `seq()` sm-inbox.js:187 sinh mã mới mỗi lần bấm). Màn «Trợ lý chạy nền»: bảng 3 cột — việc đang chờ (timer 30 ngày, hạn kê khai) · đánh thức bởi gì (webhook nguồn N / poll đối soát 24h [Q-003] / hộ mở app) · khi ngủ tốn gì («không tốn tài nguyên — trạng thái nằm ở bộ nhớ bền» [Q-003]). Nghiệm thu T4-#3.
- **D-#4 Chính sách tin Zalo lộ phí trước nút gửi** (T4-#4 SỬA nhẹ): `ON.cuaSoTin` (C.2); sheetNhacNo (mobile.html:2226-2249) hiện dòng chính sách + chi phí TRƯỚC nút gửi; hết cửa sổ tự động → «tin Giao dịch 165đ/tin hoặc ZNS template đã duyệt» + tổng tiền nếu gửi N khách; hàng đợi gửi đi (queue `channel`) hiện trạng thái từng tin; seed 1 khách im lặng >7 ngày. Nghiệm thu T4-#4, mọi số nhãn [Q-005].
- **D-#5 Connector chết báo ra tiếng** (T4-#5 GIỮ): trường `trangThai` (`ok|chua-noi|chet`) per connector trong `t.connections`; kịch bản «kết nối đứt» (dùng `failRate` sm-core.js:244 hoặc cờ seed) — webhook sàn hết đến >24h → poll đối soát phát hiện [Q-003]; thẻ deadlines «Kênh Shopee không đẩy đơn 2 ngày — có thể kết nối đứt» + `dichDen:'ketnoi'`; màn ketnoi tag đỏ «đứt — kiểm tra» + nút «Kiểm tra» chạy thử lại → «đã sống lại» hoặc «cần cán bộ — SLA 15 phút» (khớp sm-ai.js:316). Nghiệm thu T4-#5.
- **D-#6 Dòng «Điều kiện nối · Chờ · Người bấm»** (T4-#6 GIỮ): lấy thẳng bảng C.1, render trên màn `ketnoi` — 100% connector đang nối hiện đủ 3 thông tin (nhãn nguồn từng số); không connector nào gợi ý «OPC bấm thay» (N-06). Đã gộp vào Trạm B.9.
- **D-#7 Hỏi–đáp trạng thái vận hành + nhãn `CHUA_DO`** (T4-#7 GIỮ): thêm A-handler «đơn mới nhất về lúc nào/từ đâu» (đọc events sm-inbox), «kênh nào đang đứt» (đọc D-#5), «dữ liệu tươi bao nhiêu» (đọc C.15); quy ước nhãn `CHUA_DO` dùng chung mọi chỗ «chưa đo» — trợ lý trả «chưa đo, radar đang hỏi Q-036» thay vì im lặng/bịa; afterHoursReply «trợ lý soạn trong 1 phút, hộ duyệt và bấm gửi» (N-06).
- **D-#8 Thuế sàn đã khấu trừ nộp thay** (T4-#8 GIỮ) [Q-019 NĐ 117/2025 Đ11 k4]: payload đơn sàn thêm `thueSanDaNop` (số giả lập trong seed); `taxEstimate` (sm-domain.js:134-140) tách cột «doanh thu qua sàn — sàn đã nộp thay, không tính lại» + dòng giải thích trên màn Thuế; chi tiết đơn hiện «thuế sàn đã khấu trừ nộp thay: Xđ (nguồn: payload sàn)». Ranh giới: chỉ HIỆN số từ payload, không tự khấu trừ/khai thay (N-06). Nghiệm thu T4-#8.
- **D-#9 Bảng giá vs KiotViet** (T4-#9 GIỮ) [Q-007]: khối `DOI_THU` vào `js/sm-program.js` (đúng tầng Chương trình, KHÔNG nhét vào mobile): 3 gói 270k/330k/490k + 3 dòng kèm miễn phí (HĐĐT + CTS + PM kế toán hộ KD 0đ) + câu định vị «270k mua phần mềm bán hàng kèm tuân thủ 0đ; bên mình bán việc-được-làm-xong đa kênh + trợ lý 24/7 + người xuống cơ sở; lớp tuân thủ mình cũng để 0đ»; render index.html cạnh bảng giá IV.9; hàm tính tổng so cùng kỳ (không viết cứng); mốc giá đối chiếu Q-039.
- **D-#10 Giọng nói «Nói thay gõ»** (T4-#10 GIỮ có điều kiện — ĐỂ SAU): nút ở màn Thu mua: bấm mở sheet kết quả nhận dạng THEO KỊCH BẢN (chùm 5 nông dân giá khác nhau — dữ liệu tự chảy, đúng quy tắc cấm gõ tay); bản thoại thô hiển thị cạnh cấu trúc bóc ra; 1 chạm xác nhận từng người; nhãn đậm «MÔ PHỎNG nhận dạng — bản thật cần engine»; không chỗ nào claimed có ASR thật. HỒ SƠ nộp tỉnh (THUMOI VI.1) phải nêu đường đi + roadmap (ràng buộc IV.4), không được im lặng.
- **D-#11 Thẻ «Sáng nay cần gì»** (T4-#11 SỬA nhẹ): đầu tab Bán, gom 3–5 việc từ `deadlines()` + events qua đêm + queue, MỖI mục nút đi thẳng dùng cơ chế `data-di` (mobile.html:242); in-app là kênh chính; nhân bản Zalo tới chủ hộ ≤1 tin/ngày gom (C.2); tin sắp-to (hạn 30 ngày) mới lên loại Giao dịch 165đ. Nghiệm thu T4-#11: CD1 buổi sáng thấy ≥3 việc từ dữ liệu thật, mỗi việc 1 chạm tới đúng màn, không mục nào là chữ chết.
- **D-#12 Khối «Căn cứ hành vi» trong b2g** (T4-#12 GIỮ) [Q-004]: 75% điện thoại chính · 62% messaging cho kinh doanh · «hộ cơ bản không có kiến thức tài chính» (hội nghị Cục Thuế 6/2025) · 37.000 hộ >1 tỷ phải dùng HĐĐT máy tính tiền — mỗi số kèm nhãn [Q-004] + «số 2021, khảo sát Facebook ủy quyền, n=999» ghi cạnh như FINDING đã dán; không số nào trình bày như đo đạc mới nhất.

---

## E. Thay đổi module & dữ liệu — từng file, từng dòng (mục cần ghi kèm)

| File | Thêm/Sửa | Cho mục |
|---|---|---|
| `js/sm-onboard.js` **MỚI** | `ON.traLoi` · `ON.danhMucCho` · `ON.tienDo` · `ON.congNgayLamViec` · `ON.duocDayTin` · `ON.cuaSoTin` · view/bind OB-1→OB-4 · nút cán bộ «Xác nhận đã nối» (kèm mã cán bộ) | B.5–B.11, C.2, D-#4 |
| `js/sm-domain.js` | (1) thêm `D.mocVuotNguong` + `D.congNgay`/`D.ngayGiua`; (2) XOÁ auto-noi `batBuoc` (:869) + `toggleConnector` giả (:877-886); (3) bảng 12 id mới + `D.chuyenId` (duy nhất ở đây); (4) `dongBoCuoi` (:871) → mốc giờ seed + fmt «X phút trước»; (5) `taxEstimate` (:134-140) tách cột thuế sàn nộp thay; (6) `deadlines()` thêm thẻ `nguong-30n` (khi `thuocDien`/có mốc) + thẻ «connector đứt»; (7) `connectors()` thêm `trangThai` (`ok|chua-noi|chet`) | C.0/C.3/C.15, B.14, D-#1/#2/#5/#8 |
| `js/sm-inbox.js` | (1) KICH_BAN thêm: «SePay gửi TRÙNG» (cùng id, sửa `seq()` :187 cho kịch bản này) · «kết nối đứt» · «cổng thuế phản hồi» · «Zalo duyệt xong» · đơn sàn kèm `thueSanDaNop`; (2) `process()` check id trùng TRƯỚC khi cộng — bỏ + đếm `trungBo`; (3) NGUON thêm trường độ tươi công bố | B.8, C.15, D-#3/#5/#8 |
| `js/sm-seed-gialai.js` | (1) `t.onboarding` đầy đủ (B.3) × 3 tenant + tenant trắng `cd4-moi`; (2) `t.vuotLuc` cho CD1; (3) `thueSanDaNop` trong payload sàn; (4) 1 khách im lặng >7 ngày; (5) 40–60 tenant mô phỏng (LCG xác định, rải đều máy trạng thái — CHỈ b2g thấy); (6) `t.license` + bảng suất QR `GL26-*`; (7) `t.chuHo` đầy đủ để in tên trên nút Gửi | B.3/B.5, C.3, D-#4/#8, P2 |
| `js/sm-ai.js` | (1) 3 A-handler vận hành (đơn mới nhất / kênh đứt / độ tươi); (2) nhãn `CHUA_DO` quy ước chung; (3) afterHoursReply cam kết «soạn trong 1 phút, hộ bấm gửi» | D-#7 |
| `js/sm-program.js` | khối `DOI_THU` (KiotViet + định vị + hàm tính tổng so cùng kỳ) | D-#9 |
| `js/sm-ops.js` | `soanNhacNo/guiNhacNo` (:302-357) gọi `ON.cuaSoTin` + hiện phí trước nút gửi | D-#4 |
| `js/sm-quyen.js` | VAI kế cận nhận «việc giao người nhà» (thông báo trong app khi mở máy); **đếm lại danh sách VAI khi code — không kế thừa con số «5 VAI» của T1** (ghi chú verdict T1-5) | B.5 |
| `mobile.html` | (1) router `obkichhoat`/`obnhandien`/`obdanhmuc`/`obcon-*` (đăng ký cạnh :2420); (2) view `ketnoi` = Trạm 3 khối + Độ tươi + tag đứt; (3) thẻ «Sáng nay cần gì» đầu tab Bán; (4) màn «Tạm dừng dùng» (nền `dulieu`); (5) nút «đọc to câu này» mọi câu wizard; (6) dòng «ảnh giấy tờ nằm trong máy hộ» mọi màn chụp | B.5–B.9, B.15, D-#2/#11 |
| `b2g.html` + `js/sm-b2g.js` **MỚI** | Sổ trực onboarding 6 mục (B.11) + «Việc hôm nay của cán bộ» (`data-di` đi thẳng hộ) + định mức nhân sự (số hộ/cán bộ + phân bố thời gian-tới-việc-đầu-tiên) + nhóm theo đợt nộp OA + sinh suất QR + khối «Căn cứ hành vi» | B.11, D-#12, T5-3a |
| `index.html` | bảng KiotViet cạnh bảng giá IV.9 + 1 mục hồ sơ độ tươi | D-#9, C.15 |
| `web.html` | đọc `D.connectors` qua `D.chuyenId` (không hard-code id mới) | C.0 |

Không file nào trong `js/` bị ghi đè nội dung hiện có ngoài các dòng liệt kê; mọi hàm mới đặt cạnh code cùng loại (giữ cấu trúc file).

---

## F. Ba đợt thi công (việc · nghiệm thu đo được · effort ước [tự đề xuất])

**Đợt 1 «Nói thật về kết nối» (nền móng):** sm-onboard.js khung + máy trạng thái B.1/B.2 + bảng id C.0 + gỡ auto-noi + seed `t.onboarding` 3 tenant + Trạm 3 khối + mocVuotNguong. *Nghiệm thu:* 3 tenant Trạm đúng trạng thái; console không còn đường `da_ket_noi` từ nút hộ; CD1 hiện «còn N ngày». *Effort:* ~2 ngày GLM + 1 lượt Claude verify.
**Đợt 2 «Wizard 6 câu + 12 connector»:** OB-1→OB-4 (kèm câu 0, Aa rút gọn, đọc-to) + render bảng C.1 + Độ tươi + kịch bản TRÙNG + Trợ lý chạy nền + connector đứt + việc đầu tiên 3 chân dung. *Nghiệm thu:* đi CD1/CD2/CD3 tới `xong_viec_dau`; wizard không ô gõ số tiền; bấm 2 lần tiền cộng 1 lần + nhật ký chặn trùng; kịch bản đứt ra thẻ + nút Kiểm tra. *Effort:* ~3 ngày.
**Đợt 3 «b2g + findings còn lại»:** Sổ trực + QR suất + seed 40–60 hộ + đợt nộp OA + định mức + KiotViet + thuế sàn + cuaSoTin + Sáng nay cần gì + CHUA_DO + Tạm dừng dùng. *Nghiệm thu:* xác nhận tay hiện 2 nơi (tenant + b2g); bảng hạn 30 ngày ≥1 dòng; đơn sàn hiện nộp thay; sheet nhắc nợ hiện phí trước nút; export 2 file chạy. *Effort:* ~2–3 ngày.

---

## G. Việc Quang chốt — P1–P13 (nguyên văn danh sách T5 mục 5)

| # | Việc chốt | Đề xuất của phản biện (T5) |
|---|---|---|
| P1 | Onboarding chặn tới đâu? (T1-Q1) | Không chặn app, chỉ chặn đúng nghiệp vụ liên quan (chưa CTS không phát hành HĐĐT — tự đúng luật [Q-001]); BỔ SUNG: nhóm LUẬT trong OB-3 không có «bỏ qua» hợp lệ |
| P2 | Seed v4: 3 tenant 3 trạng thái + tenant trắng `cd4-moi`? (T1-Q2) | Làm cả hai; thêm 40–60 tenant mô phỏng cho b2g Sổ trực (chỉ b2g thấy) |
| P3 | Mã suất: format `GL26-XXXX-XXXX`, b2g sinh + tra trạng thái? (T1-Q3) | Đồng ý; kèm khối «suất + mã cán bộ + in QR» trong b2g (P6) |
| P4 | Mốc nhắc «sắp 1 tỷ»: từ 80% lũy kế (800tr cho CD2)? (T1-Q4) | 800tr hợp ảnh «sắp» của seed; ghi rõ là lựa chọn sản phẩm chưa có văn bản |
| P5 | Luồng tự mua license ngoài Chương trình: màn giá `P.tinhGia` hay để T khác? (T1-Q5) | Mockup giữ 1 màn giá, không luồng thanh toán (việc chạm tiền cần riêng); nhãn «demo» |
| P6 | Xây «Sổ trực onboarding + việc hôm nay của cán bộ + sinh suất» trong b2g cho v4? (T5-3a) | ĐỀ NGHỊ CÓ — thiếu sót lớn nhất của cả 4 bản cho khoá 150 hộ; giữ ranh giới IV.8 (chỉ trạng thái + ngày) |
| P7 | Mức cam kết uptime + thời gian phản hồi kênh người cho hồ sơ tỉnh (THUMOI IV.5) | Chọn mức dám hứa (con số nội bộ QNSC quyết — mockup không bịa); gắn vào khối SLA màn `hoso` |
| P8 | MISA / tầng kế toán: giữ ĐỂ SAU mọi chân dung? (T1-Q7) | Đồng ý — đúng N-01; chỉ khi Q-009 trả lời mới xét lại |
| P9 | Đẩy Zalo OA tới chủ hộ trong mockup: hộp thư in-app hay vẽ màn hình Zalo? (T1-Q6) | Hộp thư in-app (trùng mô hình inbox); kèm quy tắc ≤1 tin/ngày |
| P10 | Nhặt câu radar mới vào lịch: Q-040–Q-046 của T2 + 5 câu THIẾU của T1 | Đưa hết vào BACKLOG radar; ưu tiên tiên: Zalo-OA-connector (chặn luồng Kiểu 2) và kỳ kê khai (Q-023 có sẵn — quyết định tham số `mocVuotNguong`) |
| P11 | Bảng đối chiếu giá 299k vs KiotViet 270k vào De-An trước khi trình đề án? (DIGEST 20/08) | Có — nguyên liệu sẵn T4-#9; câu hỏi chắc chắn của hội đồng [Q-007] |
| P12 | Chính sách ảnh giấy tờ định danh trong app (mức hiển thị mockup + nguyên tắc bản thật) (T5-3c.8) | Chốt câu hiển thị «ảnh nằm trong máy hộ, bản gửi đi là bản rút gọn»; cán bộ/b2g chỉ thấy trạng thái |
| P13 | Màn «kết thúc dùng Chương trình» (xuất + xoá theo yêu cầu hộ, chủ hộ bấm cuối) có vào v4? (T5-3c.9) | Đề xuất có dạng tối giản (nền màn `dulieu`) — trả lời IV.3 «không khóa dữ liệu» trọn vòng đời |

---

## H. Câu hỏi radar — khử trùng (T2 mục 4 + T1 phần 4 + mọi THIẾU BẰNG CHỨNG trong file này)

> **✅ ĐÃ NHẶT VÀO BACKLOG 20/08 (P10):** engine radar đã tự dùng tới Q-043, nên 8 câu dưới được đánh số
> thật là **Q-044…Q-051** trong `opc-radar/BACKLOG.tsv` (cột `them_boi=claude-plan-v4`, `ghi_chu` map về nhãn
> ở đây: plan Q-040→BACKLOG Q-044 · Q-041→Q-045 · Q-042→Q-046 · Q-043→Q-047 · Q-044→Q-048 · Q-045→Q-049 ·
> Q-046→Q-050 · Q-047→Q-051). Nhãn trong thân file này giữ nguyên theo T2.

**Giữ nguyên 7 câu đề xuất của T2 (đã kiểm không trùng BACKLOG Q-008–Q-039):**

| # | Trục | Câu (rút từ T2 mục 4 — nguyên văn tại đó) | Note của T6 |
|---|---|---|---|
| Q-040 | A1 | Giá dịch vụ SePay webhook (gói/tháng/theo giao dịch/theo NH, ngưỡng miễn phí) — đặt «Chi phí» cho `bank` | **Mở rộng:** kèm giá/phương thức SePay eInvoice cho đường NCC HĐĐT (B.8 Kiểu 3 đường 2) |
| Q-041 | A1 | Vòng đời CTS hộ KD (giá năm đầu + gia hạn, thời hạn token, lead-time, NCC nào bắt buộc USB) | dùng cho `cts` (khác Q-025 — câu này hỏi giá/vận hành) |
| Q-042 | A1 | TikTok Shop + Lazada Open Platform: cấp quyền app, webhook đơn, token, rate limit | **Mở rộng:** kèm nền tảng giao đồ ăn (nhóm `food` của `booking`) |
| Q-043 | A1 | GHN/GHTK/Viettel Post: điều kiện API merchant/bên thứ ba, webhook vận đơn, đọc COD | cho `shipper` |
| Q-044 | A1 | KiotViet Public API: phạm vi đọc/ghi, self-serve OAuth2, rate limit, polling tối thiểu | cho `pos` |
| Q-045 | A1 | Nền tảng đặt phòng/app giao đồ ăn hộ nhỏ (Booking.com Partner, Agoda, ShopeeFood): API/webhook, hoa hồng công bố, điều kiện đối tác | cho `booking` (hoa hồng 82.500đ trong seed là mô phỏng) |
| Q-046 | A1 | «HĐĐT khởi tạo từ máy tính tiền kết nối dữ liệu CQT» (k5 Đ8 NĐ 68/2026): chuẩn kỹ thuật, danh mục thiết bị được công nhận, giá | cho đường `pos`/`hddt` |

**Câu đề xuất MỚI của T6 (từ 5 câu THIẾU của T1, khử trùng — 4 câu map vào câu mở/mở rộng ở trên, 1 câu mới):**

| # | Câu | Xuất xứ |
|---|---|---|
| **Q-047 (đề xuất)** | Zalo OA: cơ chế uỷ quyền quản trị OA cho bên thứ ba (OPC quản tin hộ) có sẵn không — API/portal nào, ai bấm cấp, thu hồi thế nào | T1 Kiểu 2 — CHẶN luồng B.8 Kiểu 2; ưu tiên cao nhất theo P10 |
| → Q-021 | «NCC HĐĐT từng nhà (Viettel/VNPT/MISA/FPT/SePay) phê duyệt/chuyển giao» — câu ĐÃ MỞ sẵn của radar | T1 (map, không mở mới) |
| → Q-040 | giá SePay eInvoice → mở rộng Q-040 (trên) | T1 |
| → Q-041 | hồ sơ CTS hộ KD → chính là Q-041 (trên) | T1 |
| → Q-042 | TikTok/Lazada → trùng Q-042 (bỏ, không mở mới) | T1 |

**Câu đã mở sẵn được tham chiếu trong file (không mở lại):** Q-009 (PM nhà nước vận hành — ketoan) · Q-010 (chuẩn đo «không cần đào tạo») · Q-020 (TK NH đúng tên) · Q-022 (HĐĐT hộ ≤1 tỷ bán sàn) · Q-023 (kỳ kê khai hộ >1 tỷ — quyết định tham số `mocVuotNguong`) · Q-024 (đọc trạng thái kê khai) · Q-025 (nghĩa vụ CTS văn bản gốc) · Q-026 (Shopee chính chủ 27/05/2026) · Q-027 (PoC $/tenant durable) · Q-031 (NĐ 254/2026) · Q-032 (field thuế sàn per giao dịch) · Q-033/034/035 (ZNS giá/SLA/duyệt template) · Q-036/Q-037 (độ tươi đơn sàn/tồn kho/vận đơn/tờ khai) · Q-039 (mốc giá KiotViet).

---

## I. Ma trận phủ — TỪNG finding + TỪNG dòng REQUIREMENTS v2 (không dòng trống)

**Findings radar (8):**

| Finding | Được phủ bởi | Ghi chú |
|---|---|---|
| Q-001 (ngưỡng 1 tỷ · 30 ngày · TT 152/2025 · NĐ 20/2026 · NQ 198/2025) | B.7 (2 lớp nghĩa vụ) · B.8 Kiểu 3 · C.3 `mocVuotNguong` · C.9 · D-#1 | mọi chỗ hiện số kèm nhãn |
| Q-002 (SePay/cổng HĐĐT/Shopee Open Platform/MISA NVKD) | B.8 cả 3 kiểu · C.1 · C.4/C.6/C.7/C.10 · D-#6 | «từ 27/05/2026…» câu chữ theo verdict T2-1.7 |
| Q-003 (durable · poll 24h · idempotency · webhook best-effort) | D-#3 (Trợ lý chạy nền + TRÙNG) · D-#5 · C.15 | |
| Q-004 (Zalo OA GP ĐKKD 2–3 ngày · 75%/62%/n=999/2021 · 3,6 triệu · 37.000) | B.5 (QR/cán bộ) · B.6 câu 2 · B.8 Kiểu 2 · D-#12 | số hành vi dán «2021, Facebook ủy quyền, n=999» |
| Q-005 (cửa sổ 7 ngày · 8 tin/48h · 55đ/165đ · broadcast 4 tin/tháng) | C.2 · D-#4 · B.9 (≤1 tin/ngày) | N-09 giữ |
| Q-006 (SePay docs: realtime · at-least-once · retry 7 Fibonacci ~33' · 5h · 30s/8s · dedup id) | C.15 · D-#2/#3 · B.8 Kiểu 1 (khối cán bộ) | |
| Q-007 (KiotViet 270k/330k/490k + 0đ kèm) | D-#9 · C.11 | |
| Q-019 (NĐ 117/2025 Đ11 k4 thuế sàn nộp thay) | D-#8 · C.8 · B.7 (điều kiện sinh) | |

**REQUIREMENTS v2 (22 dòng) — trạng thái v2 giữ nguyên sổ sống; cột phải = v4 trỏ mục:**

| ID | v2 | v4 phủ bằng | Ghi chú |
|---|---|---|---|
| R-A1-01 | ? | B.7 lớp (i) + C.8 (tờ khai hàm tính) | mức định kỳ nhóm ≤1 tỷ ghi rõ «chờ Q-023» |
| R-A1-02 | ? | B.7 BẮT BUỘC >1 tỷ · B.8 Kiểu 3 (2 đường) · C.3 · C.6 · D-#1 | cảnh báo Q-031 giữ nguyên trong hồ sơ |
| R-A1-03 | ? | B.8 Kiểu 3 (CTS online không USB) · C.7 | hồ sơ CTS THIẾU → Q-041; Q-025 giữ |
| R-A1-04 | ? | B.7 ĐỂ SAU `ketoan` (chỉ dẫn sang) · C.9 | N-01; đúng TT 152/2025 [Q-001] |
| R-A1-05 | ? | C.4 (SePay 12+ NH realtime) · B.8 Kiểu 1 | Q-020 (TK đúng tên) chưa xác minh — giữ nhãn |
| R-A1-06 | ? | C.10 (sàn) · D-#8 (nộp thay) | Q-032 (field per giao dịch) tham chiếu |
| R-A1-07 | ? | C.12 (`shipper`) | COD N-07; điều kiện API chờ Q-043 |
| R-A1-08 | 🟡 | C.5 · C.2 · D-#4 | đầy đủ cửa sổ + phí + ≤1 tin/ngày |
| R-A2-01 | 🟡 | toàn bộ mục B (mobile-first) | không việc riêng |
| R-A2-02 | 🟡 | **KHÔNG ĐƯA VÀO v4** — mockup tĩnh không mô phỏng «vào không cần cài app»; Zalo OA trong v4 chỉ là connector đầu ra (C.5) | để hồ sơ đề án; giữ trạng thái 🟡 |
| R-A2-03 | ? | D-#11 (Sáng nay cần gì + `data-di`) · B.9 (ngân sách tin) | |
| R-A2-04 | ? | B.0 nguyên tắc 3 + nghiệm thu B.5/B.8 (≤10 chạm SePay) | |
| R-A2-05 | ? | D-#10 (ĐỂ SAU, nút Mô phỏng) | roadmap phải vào hồ sơ VI.1 |
| R-A2-06 | ? | **KHÔNG ĐƯA VÀO v4** — cần dữ liệu phân bố thiết bị thật (engine); mockup HTML chạy máy demo | để hồ sơ; giữ trạng thái ? |
| R-A2-07 | ? | B.1 + B.10 (`viecDauTien`, số phút là hàm tính) | chuẩn đo chờ Q-010 |
| R-A3-01 | ? | D-#3 (màn Trợ lý chạy nền — mô phỏng durable) | |
| R-A3-02 | ❌ | C.15 + D-#2 (màn Độ tươi) | đóng ❌ → có màn công bố |
| R-A3-03 | 🟡 | D-#7 (3 A-handler + SLA hiển thị) | |
| R-A3-04 | ? | D-#7 nhãn `CHUA_DO` + quy ước nhãn toàn file | |
| R-A3-05 | ? | D-#5 (connector chết + kịch bản đứt) | |
| R-A3-06 | ❌ | D-#3 («khi ngủ tốn gì: không tốn tài nguyên — trạng thái nằm bộ nhớ bền» [Q-003]) | $/tenant chờ Q-027 — không bịa |
| R-A3-07 | ❌ | D-#3 (dedup id trước connector đầu) + C.15 (poll ≥24h mọi dòng webhook) | |

*Tự soát T6: đủ 9 mục A–I; mọi verdict SỬA/SỬA nhẹ của T5 đã thi hành (bảng đối chiếu: T1-3b→B.5/B.6 · T1-3c→B.1/B.7 · T1-3d→B.8 · T1-3e→B.9 · T2-0→C.0 · T2-1.7→C.1 · T3-CD2e→B.10 · T3-CD1d#3 & T3-(e)→B.10 nhãn [tự đề xuất] · T4-#1→C.3 · T4-#4→C.2 · T4-#11→D-#11 · T5-3a→B.11 · T5-3b.6→B.5 · T5-3b.7→B.6 · T5-3c.8→B.15 · T5-3c.9→B.15 · T5-3d.10→P7); mọi số có nhãn [Q-00x]/[seed]/[tự đề xuất]; không ký tự Trung/Nhật/Hàn; mục I đủ 30 dòng không trống; chỉ ghi đúng 1 file này.*

---

## ✅ VERIFY CỦA CLAUDE — 20/08/2026 (rubric viết TRƯỚC khi đọc bản GLM: `scratchpad/VERIFY-RUBRIC.md` phiên 20/08)

**Cơ học (đã chạy lệnh, có kết quả):**
1. CJK: 0 ký tự Trung/Nhật/Hàn trên cả 6 file (perl unicode scan). T1/T2/T6 đều TỰ bắt và tự sửa CJK lọt trong lúc soạn — ghi trong log từng agent.
2. Số hiệu văn bản: toàn bộ thuộc tập cho phép từ findings; `NĐ 254/2026` + `NĐ 70/2025` chỉ xuất hiện đúng vai «Q-031 đang xác minh» — không dùng làm căn cứ.
3. Trích dẫn file:dòng — spot-check khớp code thật: `sm-domain.js:861-896` (connectors/toggleConnector/connectorSummary — đúng lỗ «auto-noi batBuoc» và «toggleConnector giả»), `sm-domain.js:31-33/165-167/242` (TAX.nguong 1e9, needsPosInvoice, thẻ nguong-mtt chỉ hiện khi sapVuot — đúng lỗ «CD1 đã vượt thì không còn thẻ»), `sm-ai.js:316` (SLA 15 phút), `sm-core.js:87-90/155-160/244`, `mobile.html:242 (data-di)/2226 (sheetNhacNo)/2418+ (VIEWS router)`, `sm-inbox.js` (NGUON/KICH_BAN/seq).
4. Điều khoản THUMOI viện dẫn khớp nguyên văn: I.2 (thế hệ kế cận 25–40, đồng hành 12 tháng) · II.1 («đã vận hành ổn định») · II.2 (không tính phí trùng lặp tầng miễn phí) · IV.4 (trọn vẹn trên điện thoại, giọng nói tiếng Việt, offline) · IV.6 (cầm tay chỉ việc) · IV.8 (dữ liệu chi tiết thuộc về hộ, Chương trình chỉ nhận tổng hợp).
5. Số học: 10,19 + 0,72 = 10,91 ✅ (lỗi cộng của T3 đã được T5 bắt, T6 thi hành đúng).
6. Ma trận I: đủ 8 findings + 22 dòng REQUIREMENTS, 2 dòng KHÔNG-ĐƯA-VÀO có lý do (R-A2-02, R-A2-06) — hợp lệ.

**Nội dung (rubric 12 điểm A–L): ĐẠT CẢ 12** — đáng nói nhất: tách đúng «CD1 đã vượt → đồng hồ 30 ngày» vs «CD2 đà vượt → cảnh báo quý dự kiến» (đúng luật hơn kỳ vọng rubric); nhóm LUẬT không có «bỏ qua» hợp lệ; mọi luồng đăng-ký-hộ in tên NGƯỜI bấm nút cuối (N-06); COD không qua OPC (N-07); bảng độ tươi chỉ điền số cho nguồn có bằng chứng.

**Claude sửa chồng 4 chỗ (đã sửa trong bản này):**
- B.10 CD1: «chị Ngân» → «chị Thu Hà» — T6 bịa tên không có trong seed (seed keCan CD1 = Chị Trần Thu Hà); T3 gốc KHÔNG dùng tên này.
- B.10 CD2: «chị Hằng» → «anh Duy» — cùng lỗi (seed keCan CD2 = Anh Lê Minh Duy).
- B.3 ví dụ `coCanBo.ten:'Anh Ngọc'` → placeholder trung tính (tên cán bộ để seed b2g đặt khi thi công).
- B.6 câu 4: gắn nhãn [tự đề xuất] cho 3 nấc gợi ý 250/500tr (nấc chia là lựa chọn sản phẩm, không phải mốc pháp lý).

**Trạng thái:** KẾ HOẠCH SẴN SÀNG TRÌNH QUANG — chưa thi công; chờ chốt P1–P13 (mục G). Engine: cả 6 lượt đều chạy GLM thật (0 lượt failover Claude — kiểm `grep ENGINE-FALLBACK logs/* = 0`).
