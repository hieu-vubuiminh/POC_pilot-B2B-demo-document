# W4-BAO-CAO — SEED: sm-seed-gialai.js (Edit) + sm-seed-b2g.js (Mới)

Agent W4 · thi công theo INTERFACE-V4 mục 5 + PLAN-V4 B.1/B.3/B.11 + CHOT P2/P3.
Chỉ ghi đúng 2 file sở hữu + báo cáo này. Không đụng file nào khác.

## 1. Đã làm gì

### 1.1 `js/sm-seed-gialai.js` — 10 Edit, KHÔNG Write đè, không phá dữ liệu cũ

| # | Nội dung | Dòng (sau sửa) |
|---|---|---|
| E1 | Thêm 3 helper sau `daysIn`: `maSuat()` (mã GL26-XXXX-XXXX, LCG **riêng** `rng(20260817)` — không xô dịch chuỗi rng của `genRevenue`) · `ganThueSan(orders)` (gắn `thueSanDaNop = Math.round(total*0.015)` cho đơn kênh `shopee/tiktok/lazada`, comment «chờ Q-032») · `onboardMacDinh()` (factory shape B.3 mặc định) | 29–61 |
| E2+E3 | Bọc `orders:` CD1 qua `ganThueSan(...)` — cả 3 đơn đang mở lẫn đơn sinh từ LCG | 171, 182 |
| E4 | CD1 `messages` thêm TN3 **«Chị Sáu (tạp hoá Phù Cát)»** — tin cuối + trả lời ngày 05/08 → im lặng 12 ngày so với TODAY 17/08, demo cửa sổ 7 ngày [Q-005]. Tên không trùng ai trong seed (CD2 có «Ông Lê Văn Sáu» — khác chuỗi, khác người) | 233–234 |
| E5 | CD1 thêm `license` {ma: maSuat(), loai:'chuong-trinh', capLuc:'2026-05-12T08:40'} · `vuotLuc:'2026-09-30'` (kèm đúng comment đề yêu cầu) · `onboarding` `buoc:'dang_noi'`: traLoi đủ 6 khóa; ketNoi = bank `da_ket_noi` · zalooa `cho_duyet` hanDuKien **2026-08-18** (16/08 là chủ nhật → +2 ngày làm việc [Q-004]) · hddt `cho_duyet` hanDuKien 2026-08-17 (cổng miễn phí 15 phút–1 ngày làm việc [Q-002]), hoSoDaNop, aiBam = **Chị Trần Thu Hà** (kế cận seed) · cts `dang_dang_ky` · 3 sàn `chua_hoi`; coCanBo {maCanBo:'CB-02', ten:'(cán bộ CB-02)', diaBan:'Quy Nhơn'} | 238–260 |
| E6 | CD2 thêm `license: null` + `onboarding: onboardMacDinh()` — tenant demo wizard từ đầu | 372–375 |
| E7 | Bọc `orders:` CD3 qua `ganThueSan(...)` | 451, 455 |
| E8 | CD3 thêm `license` (capLuc 2026-07-08T07:55) + `onboarding` `buoc:'xong_viec_dau'`: traLoi đủ; ketNoi bank+zalooa `da_ket_noi` (từ 08/07) và shopee+tiktok `da_ket_noi` (09/07) — cốt để «thuế sàn ghi nhận»: đơn sàn có `thueSanDaNop` [Q-019]; `viecDauTien` {loai:'ban-va-bang-ke', batDauLuc 09:12, doneLuc 09:26 ngày 10/07} = **14 phút** | 490–507 |
| E9 | Thêm tenant trắng `CD4` {id:'cd4-moi', name:'Hộ mới — chưa nhận diện', license:null, onboarding mặc định} — không skus/orders/keCan | 510–520 |
| E10 | `tenants` thêm `'cd4-moi': CD4` (cuối map — `current()` vẫn mặc định cd1) | 542 |

### 1.2 `js/sm-seed-b2g.js` — Write MỚI (134 dòng)

`SM.seedB2G()` → **48 hộ** LCG xác định `rng(482048)` mượn đúng pattern seed-gialai (không `Math.random`).
Mỗi hộ: `{ ma:'GL26-XXXX-XXXX' (không dùng I/O/0/1, tự sinh lại khi trùng), ten:'Hộ số N — <Đặc sản|Du lịch|Nông sản>', nganh (mã B.3), buoc, ketNoiTom (đủ 7 khóa trạng thái B.2, đếm suy từ buoc để không tự mâu thuẫn), canBo CB-01…CB-06, dotOA ('Tuần nộp 1…4', 4 đợt 10/08→06/09), hanDuKien (chỉ khi `cho_duyet>0` = giữa đợt + 2–3 ngày làm việc [Q-004]), cungCanBo (bool ~40%), vuotNguong (bool ~15% [Q-001]), phutTuKichHoat (5–15 nếu cungCanBo, 16–40 nếu tự làm — chỉ hộ `xong_viec_dau` có số, hộ khác null) }`.
**Bảo hiểm đủ 7 mức B.1**: `BUOC.forEach` gán lại cho hộ thiếu mặt — bất kể chuỗi LCG thế nào cũng đủ 7 mức (dòng 73).
**Cache**: `localStorage 'smv3:b2g-hos'`, sinh 1 lần, đọc lại ổn định (guard `length === 48`, hỏng thì sinh lại).
Dự phòng `global.SM_SEED_B2G = {soHo, sinhHo}` cho trường hợp nạp trước sm-core.

## 2. Tự soát cú pháp bằng cách nào (nói thật)

- **`node` KHÔNG chạy được** — lệnh bị chặn quyền ở permission mode này (đã thử thường + đề xuất unsafe, đều yêu cầu approval). Theo luật: báo thiếu quyền, không lách sang tool khác (không dùng awk/perl mô phỏng để «chạy ná»).
- Thay bằng đúng phương án INTERFACE mục 9: **đọc lại toàn bộ file sau sửa** (545 dòng seed-gialai + soát từng block Write mới) — kiểm ngoặc đóng/mở, dấu phẩy, neo từng Edit; grep chứng minh (mục 3).
- **Bảo đảm «mở lại ra đúng số cũ» bằng thiết kế, không phải bằng chạy thử**: (a) `genRevenue` không bị sửa một ký tự nào → chuỗi gọi `r()` giữ nguyên → amount/date/channel/total y hệt cũ; (b) `ganThueSan` chỉ **thêm trường** tính thuần từ `o.total`, không gọi rng; (c) `maSuat` dùng stream LCG riêng `rSuat`. Doanh thu/tồn kho không đổi.

## 3. Grep chứng minh (đã chạy, dán nguyên kết quả)

```
$ rg -n "onboarding:|onboardMacDinh|vuotLuc|cd4-moi|license:|maSuat\(\)|ganThueSan\(|thueSanDaNop|TN3.*Phù Cát" js/sm-seed-gialai.js
34:  function maSuat() {
44:  function ganThueSan(orders) {
47:        o.thueSanDaNop = Math.round(o.total * 0.015);
54:  function onboardMacDinh() {
171:    orders: ganThueSan(cd1Rev.orders.concat([
234:      { id:'TN3', date:'2026-08-05', tu:'Chị Sáu (tạp hoá Phù Cát)', ... traLoiLuc:'2026-08-05' },
239:    license: { ma: maSuat(), loai: 'chuong-trinh', capLuc: '2026-05-12T08:40' },
240:    vuotLuc: '2026-09-30', // ngày cuối kỳ tính thuế (giả định quý — Q-023)...
241:    onboarding: {                      ← CD1
374:    license: null,
375:    onboarding: onboardMacDinh(),      ← CD2
451:    orders: ganThueSan(cd3Rev.orders.concat([
491:    license: { ma: maSuat(), loai: 'chuong-trinh', capLuc: '2026-07-08T07:55' },
492:    onboarding: {                      ← CD3
516:    id: 'cd4-moi',
518:    license: null,
519:    onboarding: onboardMacDinh(),      ← CD4 (tenant trắng)
542:    tenants: { cd1: CD1, cd2: CD2, cd3: CD3, 'cd4-moi': CD4 },
```
→ **4/4 tenant có onboarding** (CD2/CD4 qua factory) · **vuotLuc đúng 1 chỗ** (dòng 240) · **cd4-moi tồn tại** (516, 542) · ganThueSan áp CD1+CD3.

```
$ rg -n "const N = |i <= N|hos\.length === N|return hos|smv3:b2g-hos|seedB2G|BUOC\.forEach|Math\.random" js/sm-seed-b2g.js
14:  const N = 48;
15:  const KEY = 'smv3:b2g-hos';
62:    for (let i = 1; i <= N; i++) {          ← vòng đẩy đúng 48 phần tử
73:    BUOC.forEach((b, i) => { ... });        ← bảo hiểm đủ 7 mức
125:      if (s) { const hos = JSON.parse(s); if (hos && hos.length === N) return hos; }
129:    return hos;
133:  (global.SM = global.SM || {}).seedB2G = seedB2G;
```
→ seedB2G trả **48 phần tử** (vòng lặp 1..N + `map` 1–1; không chạy được node nên chứng minh bằng cấu trúc + script mục 5).

```
$ rg -n "[<CJK ranges>]" js/          → No matches found   (cả 2 file + toàn thư mục js/)
```

## 4. Quyết định diễn giải — nhờ Claude verify adjudicate

1. **`traLoi.kenh` ghi mã gộp `'san'`** thay vì liệt kê `shopee/tiktok/lazada`: đề ghi «kenh theo seed» — nội dung đúng hộ (CD1 bán quay+b2b+3 sàn+zalo), nhưng B.3/B.6/B.7 dùng mã enum `'san'` cho câu 3 của wizard (`ON.danhMucCho` điều kiện `kenh có 'san'`). Nếu seed ghi id sàn riêng thì danh mục sinh ra sẽ THIẾU nhóm sàn → vỡ nghiệm thu B.7. Chọn enum + comment rõ trong code. CD3 tương tự: `['b2b','san','live','zalo']`.
2. **CD3 sàn `da_ket_noi`**: đề ghi «thuế sàn ghi nhận» — diễn giải là shopee+tiktok đã nối (đơn sàn seed đang `synced:true` + có `thueSanDaNop`); bank+zalooa `da_ket_noi` đủ định nghĩa tối thiểu B.1.
3. **hddt hanDuKien 17/08** (đề chỉ pin zalooa = 18/08): B.2 bắt buộc `cho_duyet` phải kèm `hanDuKien`; chọn 1 ngày làm việc theo [Q-002] «15 phút–1 ngày làm việc». Hôm nay 17/08 là đúng hạn — mai chuyển đỏ, khớp kịch bản quá hạn B.13 #7.
4. **`capLuc` ghi datetime có phút** (không chỉ ngày) — mốc kiểu ISO `2026-05-12T08:40`, cùng dạng `viecDauTien.batDauLuc`. [seed]
5. **sm-seed-b2g thêm trường `cungCanBo`** (ngoài danh sách tối thiểu của đề): cần thiết để «hộ có cán bộ nhanh hơn» máy móc hiểu được — W5 vẽ định mức 2 nhóm «theo cán bộ vs tự làm» (B.11). `phutTuKichHoat = null` với hộ chưa `xong_viec_dau` (không thể có số phút khi việc đầu chưa xong).
6. **CD1 `nguoiLamChinh:'con'` + zalooa aiBam = chủ hộ** «Bà Nguyễn Thị Bảy» (B.8 Kiểu 2 ghi nút «Chủ hộ bấm: Gửi đăng ký»); hddt aiBam = kế cận theo đúng đề.

## 5. Script kiểm chứng cho lượt verify (node bị chặn quyền ở máy này)

```js
// w4-verify.js — chạy: node w4-verify.js
global.window = global;
const store = {};
global.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
};
require('./js/sm-seed-gialai.js');
require('./js/sm-seed-b2g.js');
const S = global.SM_SEED_GIALAI, sum = a => (a || []).reduce((x, o) => x + (o.total || 0), 0);
for (const id of Object.keys(S.tenants))
  console.log(id, 'orders', (S.tenants[id].orders || []).length, sum(S.tenants[id].orders),
    'invoices', (S.tenants[id].invoices || []).length, sum(S.tenants[id].invoices));
const t = S.tenants;
console.log('onboarding:', ['cd1','cd2','cd3','cd4-moi'].map(id => t[id].onboarding.buoc).join(' | '));
console.log('vuotLuc:', Object.values(t).filter(x => x.vuotLuc).length, '(phải = 1)');
console.log('donSanCoThue:', ['cd1','cd3'].map(id =>
  t[id].orders.filter(o => o.thueSanDaNop > 0).length).join(' | '));
const hos = global.SM.seedB2G();
console.log('b2g:', hos.length, '(phải = 48); đủ 7 mức:',
  new Set(hos.map(h => h.buoc)).size, '(phải = 7); vuotNguong:', hos.filter(h => h.vuotNguong).length,
  '(kỳ vọng ~7); gọi lần 2 ổn định:', global.SM.seedB2G()[0].ma === hos[0].ma);
```
Đối chiếu số orders/invoices với bản TRƯỚC khi sửa (tôi không chụp được baseline vì node bị chặn — nhưng `genRevenue` nguyên vẹn nên số phải trùng mọi lần chạy trước của demo).

## 6. Còn chưa làm được / rủi ro tích hợp cần agent khác biết

1. **[W6 — crash] `mobile.html:2478`** sheet «Chọn chân dung hộ» đọc `t.keCan.ten`/`t.keCan.tuoi`/`t.diaBan`… khi duyệt MỌI tenant → với `cd4-moi` (không keCan — chưa ai nhận diện) sẽ **TypeError, sheet không mở được với bất kỳ tenant nào**. W6 cần guard kiểu `t.keCan ? ... : 'Chưa nhận diện'`. Tôi không sửa được (file của W6). Các chỗ khác (`gatesOf`, `revenueLines`, `tinhGia`, `esc`) đều guard sẵn — chỉ hiện rỗng, không vỡ.
2. **[W6] boot redirect**: cả CD2 và cd4-moi đều `buoc==='chua_kich_hoat'` — đúng spec điều hướng `obkichhoat` 1 lần (cờ `smv3:ui`); lưu ý người demo muốn xem tab Bán của CD2 phải bấm «Để sau».
3. **[W5] thứ tự nạp**: `sm-seed-b2g.js` phải nằm **SAU** `sm-core.js` trong b2g.html (sm-core gán lại `global.SM = {...}` nguyên object — nạp trước sẽ mất `SM.seedB2G`; đã có `SM_SEED_B2G` dự phòng).
4. **[W5] shape hộ b2g**: xem mục 1.2 — `hanDuKien`/`phutTuKichHoat` là `null` khi không áp dụng; `ketNoiTom` luôn đủ 7 khóa; `dotOA` là chuỗi nhãn tuần (4 giá trị).
5. **[W2/W7] `programBoard` (sm-domain.js:652)** giờ đếm `soHo = 4` (cd4 không `activatedAt` → g1 false, không góp gates; `tinhGia(undefined)` an toàn — chỉ cộng dòng không theo ngành). Bảng B2G «số hộ» sẽ lên 4 — nếu muốn loại tenant trắng khỏi bảng chương trình thì lọc theo `t.license || t.activatedAt` (việc của W2/W7). `index.html:166` hiển thị nút chọn hộ với ma/nganh rỗng (không crash nhờ `esc`).
6. **[W1] `coCanBo.ten` là placeholder** `(cán bộ CB-02)` đúng như B.3 đã sửa — không bịa tên người; W1/W5 hiển thị đúng chuỗi này hoặc thay bằng tên từ seed b2g sau.
7. **VuotNguong ~15% trong 48 hộ là kỳ vọng thống kê** của LCG — không guarantee ≥1 bằng code (xác suất 0 hộ ≈ 0,04%). Lệnh verify mục 5 sẽ ra con số thật; nếu rủi ro rơi vào 0 thì đổi hạt giống `rng(482048)` thành số khác (một dòng).

## 7. Kết luận

Đủ 6 việc đề W4 giao: onboarding 3 tenant rải đúng trạng thái P2 + vuotLuc 1 chỗ + license + thueSanDaNop + khách im lặng + cd4-moi; `sm-seed-b2g.js` 48 hộ LCG cache ổn định. Số liệu doanh thu/tồn kho cũ giữ nguyên theo thiết kế (genRevenue bất động). Chưa chạy được kiểm chứng động vì node bị chặn quyền — script kèm sẵn mục 5.

BUILD-AGENT-DONE W4 11
