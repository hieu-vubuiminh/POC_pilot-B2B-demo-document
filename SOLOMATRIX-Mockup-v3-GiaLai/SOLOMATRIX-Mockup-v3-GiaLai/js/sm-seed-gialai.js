/**
 * sm-seed-gialai.js — BA CHÂN DUNG HỘ KINH DOANH theo đúng Mục III bài toán đặt hàng.
 * Thay hai tenant cũ của v2 (QNSC B2B / Nắng Store) — hai cái đó không khớp chân dung nào.
 *
 * Toàn bộ nội dung: TIẾNG VIỆT CÓ DẤU, KHÔNG ký tự CJK.
 * Dữ liệu sinh bằng bộ sinh XÁC ĐỊNH (LCG có hạt giống) — demo chạy lại ra y hệt,
 * không dùng Math.random để dữ liệu nghiệp vụ không nhảy giữa hai lần mở.
 *
 * Ba chân dung cố tình ở ba trạng thái ngưỡng KHÁC NHAU để demo được cả ba đường:
 *   CD1 đã vượt 1 tỷ/năm  → buộc dùng hoá đơn từ máy tính tiền
 *   CD2 đang trên đà vượt → cảnh báo chủ động trước khi vượt
 *   CD3 dưới ngưỡng       → câu chuyện nằm ở chứng từ đầu vào, không ở máy tính tiền
 */
(function (global) {
  'use strict';

  const TODAY = '2026-08-17';
  const Y = 2026;

  /* bộ sinh xác định */
  function rng(seed) {
    let s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function iso(y, m, d) { return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }
  const daysIn = (y, m) => new Date(y, m, 0).getDate();

  /**
   * Sinh dòng doanh thu theo hồ sơ tháng cho tới TODAY.
   * profile: {1:105e6, 2:90e6, ...} — số tiền mục tiêu mỗi tháng.
   * Trả về {orders, invoices} đã đạt xấp xỉ mục tiêu.
   */
  function genRevenue(seed, profile, cfg) {
    const r = rng(seed);
    const orders = [], invoices = [];
    let oN = 0, iN = 0;
    const lastMonth = 8, lastDay = 17;

    for (let m = 1; m <= lastMonth; m++) {
      let target = profile[m] || 0;
      if (!target) continue;
      const dmax = m === lastMonth ? lastDay : daysIn(Y, m);
      if (m === lastMonth) target = Math.round(target); // tháng dở đã cho số dở

      let got = 0;
      const nDocs = cfg.docsPerMonth || 5;
      for (let k = 0; k < nDocs && got < target; k++) {
        const remain = target - got;
        const last = k === nDocs - 1;
        const amount = last ? remain : Math.round(remain * (0.18 + r() * 0.3) / 1000) * 1000;
        if (amount <= 0) continue;
        const d = iso(Y, m, 1 + Math.floor(r() * dmax));
        const ch = pick(r, cfg.channels);

        if (cfg.b2bChannels.indexOf(ch) >= 0) {
          iN++;
          invoices.push({
            id: 'HD-' + String(Y).slice(2) + String(m).padStart(2, '0') + '-' + String(iN).padStart(3, '0'),
            date: d, buyer: pick(r, cfg.b2bBuyers), buyerMst: '41' + String(10000000 + Math.floor(r() * 8999999)),
            channel: ch, kind: 'Hoá đơn điện tử', fromPos: false,
            lines: [{ sku: pick(r, cfg.skuIds), qty: null, amount }],
            total: amount, taxGroup: cfg.taxGroup,
            cqtState: 'sent', cqtCode: 'M' + Y + '-' + String(100000 + Math.floor(r() * 899999)),
          });
        } else {
          oN++;
          // Đơn phải có DÒNG HÀNG, không chỉ có tổng tiền — nếu không thì màn Trả hàng
          // không biết trả mặt hàng nào, và tồn kho không truy ngược được.
          const skuBan = pick(r, cfg.skuIds);
          const donGia = (cfg.giaTheoSku && cfg.giaTheoSku[skuBan]) || 0;
          const sl = donGia > 0 ? Math.max(1, Math.round(amount / donGia)) : 1;
          orders.push({
            id: 'DH-' + String(Y).slice(2) + String(m).padStart(2, '0') + '-' + String(oN).padStart(3, '0'),
            date: d, channel: ch, buyer: ch === 'quay' ? 'Khách lẻ' : pick(r, cfg.retailNames),
            total: amount, state: 'done', taxGroup: cfg.taxGroup, synced: true,
            lines: [{ sku: skuBan, qty: sl, amount: amount }],
          });
        }
        got += amount;
      }
    }
    return { orders, invoices };
  }

  /* ════════════════════════════════════ CHÂN DUNG 1 ═══════════════════════
     Hộ chế biến hải sản khô, cá mắm, nước mắm, đặc sản — phường ven biển.
     Ba kênh: nhà hàng–khách sạn (định kỳ, công nợ, hoá đơn) · bán lẻ tại quầy
     mùa cao điểm du lịch · bán online toàn quốc.
     Bố mẹ chế biến, con gái 30 tuổi quản online và làm việc với khách sạn.   */

  const CD1_SKUS = [
    { sku: 'CCK', name: 'Cá cơm khô loại 1',      unit: 'kg',  price: 185000, taxGroup: 'sanXuat' },
    { sku: 'MK',  name: 'Mực khô một nắng',        unit: 'kg',  price: 620000, taxGroup: 'sanXuat' },
    { sku: 'NM5', name: 'Nước mắm nhĩ 500ml',      unit: 'chai', price: 95000, taxGroup: 'sanXuat' },
    { sku: 'TK',  name: 'Tôm khô bóc vỏ',          unit: 'kg',  price: 780000, taxGroup: 'sanXuat' },
    { sku: 'CM',  name: 'Cá mắm chưng thịt hộp',   unit: 'hộp', price: 68000, taxGroup: 'sanXuat', baoQuan: 'lanh' },
  ];

  const cd1Rev = genRevenue(1001,
    { 1: 105e6, 2: 90e6, 3: 100e6, 4: 120e6, 5: 150e6, 6: 170e6, 7: 185e6, 8: 100e6 },
    { docsPerMonth: 6, taxGroup: 'sanXuat',
      channels: ['b2b', 'b2b', 'b2b', 'quay', 'shopee', 'tiktok', 'lazada', 'zalo'],
      b2bChannels: ['b2b'],
      b2bBuyers: ['Khách sạn Hải Âu', 'Nhà hàng Gành Ráng', 'Khách sạn Bãi Xép',
                  'Nhà hàng Hương Biển', 'Khu nghỉ dưỡng Nhơn Hội', 'Nhà hàng Sao Biển'],
      retailNames: ['Chị Hoa (Hà Nội)', 'Anh Tuấn (TP.HCM)', 'Chị Mai (Đà Nẵng)', 'Anh Nam (Cần Thơ)'],
      skuIds: CD1_SKUS.map(s => s.sku),
      giaTheoSku: CD1_SKUS.reduce((a,x)=>{a[x.sku]=x.price;return a;},{}) });

  const CD1 = {
    id: 'cd1',
    ma: 'CD1',
    name: 'Hộ kinh doanh Đặc sản Biển Xanh',
    chuHo: 'Bà Nguyễn Thị Bảy',
    keCan: { ten: 'Chị Trần Thu Hà', tuoi: 30, vaiTro: 'Quản kênh online và làm việc với khách sạn' },
    nguoiLonTuoi: [{ ten: 'Bà Nguyễn Thị Bảy', tuoi: 58, vaiTro: 'Chế biến, đứng quầy khi con đi giao hàng' },
                   { ten: 'Ông Trần Văn Tám', tuoi: 61, vaiTro: 'Chế biến, phơi cá' }],
    diaBan: 'Phường Quy Nhơn',
    khongGian: 'Ven biển',
    nganh: 'Đồ ăn, đồ uống và đặc sản',
    mst: '4101' + '234567',
    regime: 'hkd',
    taxGroupDefault: 'sanXuat',
    activatedAt: '2026-05-12',
    dongLuc: 'Nhà hàng và khách sạn yêu cầu nhà cung cấp có pháp nhân và hoá đơn mới đưa vào danh sách mua hàng chính thức. Hộ cũng muốn xây thương hiệu đặc sản riêng.',
    kenh: ['quay', 'b2b', 'shopee', 'tiktok', 'lazada', 'zalo'],
    skus: CD1_SKUS,
    lots: [
      { id: 'L260801-01', sku: 'CCK', qty: 180, unit: 'kg',  inDate: '2026-08-01', origin: { seller: 'Tự chế biến — mẻ phơi 01/08' } },
      { id: 'L260808-02', sku: 'CCK', qty: 120, unit: 'kg',  inDate: '2026-08-08', origin: { seller: 'Tự chế biến — mẻ phơi 08/08' } },
      { id: 'L260805-03', sku: 'MK',  qty: 42,  unit: 'kg',  inDate: '2026-08-05', origin: { seller: 'Thu mua thuyền ông Chín' } },
      { id: 'L260710-04', sku: 'NM5', qty: 640, unit: 'chai', inDate: '2026-07-10', origin: { seller: 'Ủ chượp lô tháng 3' } },
      { id: 'L260812-05', sku: 'TK',  qty: 16,  unit: 'kg',  inDate: '2026-08-12', origin: { seller: 'Tự chế biến' } },
      { id: 'L260814-06', sku: 'CM',  qty: 210, unit: 'hộp', inDate: '2026-08-14', origin: { seller: 'Tự chế biến' } },
    ],
    orders: cd1Rev.orders.concat([
      // đơn đang mở — dùng để demo giữ chỗ tồn kho và chặn bán quá hàng
      { id: 'DH-2608-201', date: '2026-08-16', channel: 'shopee', buyer: 'Chị Linh (Hải Phòng)',
        state: 'picking', total: 1_850_000, taxGroup: 'sanXuat',
        lines: [{ sku: 'CCK', qty: 10, amount: 1_850_000 }], synced: true },
      { id: 'DH-2608-202', date: '2026-08-17', channel: 'tiktok', buyer: 'Anh Khoa (Bình Dương)',
        state: 'new', total: 3_100_000, taxGroup: 'sanXuat',
        lines: [{ sku: 'MK', qty: 5, amount: 3_100_000 }], synced: false },
      { id: 'DH-2608-203', date: '2026-08-17', channel: 'b2b', buyer: 'Khách sạn Hải Âu',
        state: 'new', total: 9_500_000, taxGroup: 'sanXuat',
        lines: [{ sku: 'CCK', qty: 30, amount: 5_550_000 }, { sku: 'NM5', qty: 40, amount: 3_800_000 }], synced: true },
    ]),
    invoices: cd1Rev.invoices,
    receivables: [
      { id: 'CN-01', buyer: 'Khách sạn Hải Âu',     amount: 18_400_000, due: '2026-08-05', paid: false, note: 'Đơn định kỳ tháng 7' },
      { id: 'CN-02', buyer: 'Nhà hàng Gành Ráng',   amount: 9_250_000,  due: '2026-08-12', paid: false, note: 'Đơn tuần 2 tháng 8' },
      { id: 'CN-03', buyer: 'Khu nghỉ dưỡng Nhơn Hội', amount: 26_800_000, due: '2026-08-28', paid: false, note: 'Công nợ 30 ngày' },
      { id: 'CN-04', buyer: 'Nhà hàng Hương Biển',  amount: 6_150_000,  due: '2026-09-04', paid: false, note: '' },
    ],
    // đơn định kỳ cho khách tổ chức
    recurring: [
      { id: 'DK-01', buyer: 'Khách sạn Hải Âu', buyerMst: '4100776221', chuKy: 'Thứ Ba và Thứ Sáu hằng tuần', items: 'Cá cơm khô 30kg, Nước mắm 40 chai', uocTinh: 9_350_000, lanCuoi: '2026-08-14', lines: [{sku:'CCK',qty:30,amount:5_550_000},{sku:'NM5',qty:40,amount:3_800_000}] },
      { id: 'DK-02', buyer: 'Khu nghỉ dưỡng Nhơn Hội', buyerMst: '4100884512', chuKy: 'Ngày 1 và 15 hằng tháng', items: 'Mực khô 8kg, Tôm khô 4kg', uocTinh: 8_080_000, lanCuoi: '2026-08-15', lines: [{sku:'MK',qty:8,amount:4_960_000},{sku:'TK',qty:4,amount:3_120_000}] },
      { id: 'DK-03', buyer: 'Nhà hàng Gành Ráng', buyerMst: '4100913447', chuKy: 'Thứ Năm hằng tuần', items: 'Cá cơm khô 15kg, Cá mắm 30 hộp', uocTinh: 4_815_000, lanCuoi: '2026-08-13', lines: [{sku:'CCK',qty:15,amount:2_775_000},{sku:'CM',qty:30,amount:2_040_000}] },
    ],
    // hồ sơ an toàn thực phẩm, nhãn mác, truy xuất — điều kiện để khách tổ chức nhận hàng
    compliance: [
      { id: 'ATTP', ten: 'Giấy chứng nhận cơ sở đủ điều kiện an toàn thực phẩm', so: 'GL-ATTP-0412/2024',
        capNgay: '2024-11-06', expires: '2026-11-05', trangThai: 'con-han', batBuoc: true,
        dungCho: 'Điều kiện bắt buộc để khách sạn đưa vào danh sách nhà cung cấp' },
      { id: 'TCB-NM', ten: 'Bản tự công bố sản phẩm — Nước mắm nhĩ 500ml', so: 'TCB-07/2025',
        capNgay: '2025-03-18', expires: null, trangThai: 'con-han', batBuoc: true,
        dungCho: 'Bắt buộc trước khi lưu thông và lên sàn' },
      { id: 'TCB-CCK', ten: 'Bản tự công bố sản phẩm — Cá cơm khô', so: 'TCB-11/2025',
        capNgay: '2025-06-02', expires: null, trangThai: 'con-han', batBuoc: true, dungCho: '' },
      { id: 'NHAN', ten: 'Mẫu nhãn hàng hoá theo quy định ghi nhãn', so: null,
        capNgay: '2025-06-10', expires: null, trangThai: 'thieu-1', batBuoc: true,
        dungCho: 'Còn thiếu nhãn cho Cá mắm chưng thịt hộp' },
      { id: 'TX', ten: 'Mã truy xuất nguồn gốc theo lô', so: null, capNgay: '2026-05-20', expires: null,
        trangThai: 'con-han', batBuoc: false, dungCho: 'Khách tổ chức quét mã xem lô, ngày chế biến, hạn dùng' },
      { id: 'KN', ten: 'Kiểm nghiệm định kỳ chỉ tiêu histamine — nước mắm', so: 'KN-2026/118',
        capNgay: '2026-02-14', expires: '2027-02-13', trangThai: 'con-han', batBuoc: false, dungCho: '' },
    ],
    qrPoints: [{ id: 'q1', ten: 'Quầy đặc sản', diaChi: 'Cửa hàng mặt đường' },
                { id: 'q2', ten: 'Gian hàng chợ đêm', diaChi: 'Khu ẩm thực ven biển, mùa cao điểm' }],
    payments: [
      { date: TODAY, point: 'q1', amount: 1_240_000, method: 'QR' },
      { date: TODAY, point: 'q1', amount: 380_000,  method: 'QR' },
      { date: TODAY, point: 'q1', amount: 95_000,   method: 'Tiền mặt' },
      { date: TODAY, point: 'q2', amount: 640_000,  method: 'QR' },
      { date: TODAY, point: 'q2', amount: 185_000,  method: 'Tiền mặt' },
    ],
    expenses: [
      { id:'CHI-0803-01', date:'2026-08-03', loai:'bao-bi',    moTa:'Hộp giấy và nhãn dán 500 cái', soTien:1_850_000, chungTu:'hoa-don', nhaCungCap:'Cơ sở in Quy Nhơn', viCaNhan:false },
      { id:'CHI-0806-02', date:'2026-08-06', loai:'van-chuyen',moTa:'Xăng xe giao hàng khách sạn tuần 1', soTien:640_000, chungTu:'khong', nhaCungCap:null, viCaNhan:true },
      { id:'CHI-0810-03', date:'2026-08-10', loai:'dien-nuoc', moTa:'Tiền điện tháng 7 khu chế biến', soTien:2_340_000, chungTu:'hoa-don', nhaCungCap:'Điện lực', viCaNhan:false },
      { id:'CHI-0812-04', date:'2026-08-12', loai:'nhan-cong', moTa:'Thuê 2 người phơi cá 5 ngày', soTien:3_000_000, chungTu:'khong', nhaCungCap:null, viCaNhan:true },
      { id:'CHI-0815-05', date:'2026-08-15', loai:'nguyen-lieu',moTa:'Muối hạt ủ chượp 300kg', soTien:1_200_000, chungTu:'phieu-chi', nhaCungCap:'Vựa muối Đề Gi', viCaNhan:false },
    ],
    messages: [
      { id:'TN1', date:'2026-08-16', tu:'Chị Ngọc', noiDung:'Ship ve Ha Noi mat may ngay v em', kenh:'zalo', daTraLoi:false },
      { id:'TN2', date:'2026-08-15', tu:'Anh Phú (NH Sao Biển)', noiDung:'Ben em con muc kho loai 1 khong, lay 10kg', kenh:'zalo', daTraLoi:true, traLoi:'Dạ còn ạ, em giữ 10kg cho anh, chiều em giao.', traLoiLuc:'2026-08-15' },
    ],
    taxFiled: ['Q1/2026', 'Q2/2026'],
  };

  /* ════════════════════════════════════ CHÂN DUNG 2 ═══════════════════════
     Hộ dịch vụ du lịch biển tổng hợp — xã ven biển: quán ăn hải sản, homestay,
     chở khách bằng thuyền và cano, tắm biển, vui chơi, lặn ngắm san hô.
     Bố quản thuyền, mẹ lo bếp, con trai 27 tuổi nhận khách và điều phối lịch. */

  const CD2_SKUS = [
    { sku: 'COMBO-A', name: 'Gói trọn gói: ăn trưa + cano + lặn ngắm san hô', unit: 'khách', price: 650000, taxGroup: 'dichVu' , dichVu: true },
    { sku: 'COMBO-B', name: 'Gói nửa ngày: cano + tắm biển',                  unit: 'khách', price: 350000, taxGroup: 'dichVu' , dichVu: true },
    { sku: 'ROOM',    name: 'Phòng homestay',                                  unit: 'đêm',   price: 550000, taxGroup: 'dichVu' , dichVu: true },
    { sku: 'ANUONG',  name: 'Suất ăn hải sản tại quán',                        unit: 'suất',  price: 180000, taxGroup: 'sanXuat' },
    { sku: 'LAN',     name: 'Suất lặn ngắm san hô',                            unit: 'khách', price: 250000, taxGroup: 'dichVu' , dichVu: true },
  ];

  const cd2Rev = genRevenue(2002,
    { 1: 25e6, 2: 30e6, 3: 45e6, 4: 90e6, 5: 140e6, 6: 165e6, 7: 180e6, 8: 105e6 },
    { docsPerMonth: 5, taxGroup: 'dichVu',
      channels: ['b2b', 'quay', 'booking', 'zalo', 'food'],
      b2bChannels: ['b2b'],
      b2bBuyers: ['Công ty Lữ hành Đất Võ', 'Công ty Du lịch Sông Cầu', 'Công ty TNHH Thương mại An Phú',
                  'Công ty Lữ hành Biển Đông', 'Trường THPT Quang Trung'],
      retailNames: ['Nhóm khách Hà Nội', 'Nhóm khách Gia Lai', 'Khách đoàn 12 người', 'Gia đình anh Dũng'],
      skuIds: CD2_SKUS.map(s => s.sku),
      giaTheoSku: CD2_SKUS.reduce((a,x)=>{a[x.sku]=x.price;return a;},{}) });

  const CD2 = {
    id: 'cd2',
    ma: 'CD2',
    name: 'Hộ kinh doanh Dịch vụ Du lịch Nhơn Lý',
    chuHo: 'Ông Lê Văn Sáu',
    keCan: { ten: 'Anh Lê Minh Duy', tuoi: 27, vaiTro: 'Nhận khách qua mạng xã hội và điều phối lịch' },
    nguoiLonTuoi: [{ ten: 'Ông Lê Văn Sáu', tuoi: 55, vaiTro: 'Quản thuyền và hoạt động trên biển' },
                   { ten: 'Bà Phạm Thị Lan', tuoi: 52, vaiTro: 'Phụ trách bếp' }],
    diaBan: 'Xã Nhơn Lý',
    khongGian: 'Ven biển',
    nganh: 'Dịch vụ du lịch',
    mst: '4101' + '345678',
    regime: 'hkd',
    taxGroupDefault: 'dichVu',
    activatedAt: '2026-06-02',
    dongLuc: 'Có pháp nhân để ký hợp đồng với công ty lữ hành, bán gói dịch vụ trọn gói và xuất hoá đơn cho khách đoàn, khách công ty.',
    kenh: ['quay', 'b2b', 'booking', 'zalo', 'food'],
    skus: CD2_SKUS,
    lots: [
      { id: 'L2608-AN', sku: 'ANUONG', qty: 400, unit: 'suất', inDate: '2026-08-17', origin: { seller: 'Bếp chuẩn bị theo ngày' } },
    ],
    // tài nguyên có giới hạn — nguồn của bài toán chống trùng đặt
    resources: [
      { id: 'P1', ten: 'Phòng 1 — hướng biển', kind: 'room', capacity: 1 },
      { id: 'P2', ten: 'Phòng 2 — hướng biển', kind: 'room', capacity: 1 },
      { id: 'P3', ten: 'Phòng 3 — hướng núi',  kind: 'room', capacity: 1 },
      { id: 'P4', ten: 'Phòng 4 — gia đình',   kind: 'room', capacity: 1 },
      { id: 'CANO1', ten: 'Cano 1', kind: 'boat', capacity: 12, slots: ['07:30', '09:30', '13:30', '15:30'] },
      { id: 'CANO2', ten: 'Cano 2', kind: 'boat', capacity: 8,  slots: ['07:30', '09:30', '13:30', '15:30'] },
      { id: 'LAN',   ten: 'Suất lặn ngắm san hô', kind: 'activity', capacity: 10, slots: ['08:00', '10:00', '14:00'] },
    ],
    bookings: [
      // 18/08 khung 07:30 Cano 1 đã ĐẦY 12/12 — để người chấm tự thử đặt trùng
      { id: 'DC-1708-01', date: '2026-08-18', slot: '07:30', resource: 'CANO1', pax: 8, guest: 'Công ty Lữ hành Đất Võ', phone: '0905xxx111', combo: 'COMBO-A', total: 5_200_000, channel: 'b2b', state: 'confirmed', createdAt: '2026-08-14' },
      { id: 'DC-1708-02', date: '2026-08-18', slot: '07:30', resource: 'CANO1', pax: 4, guest: 'Gia đình anh Dũng',     phone: '0912xxx222', combo: 'COMBO-B', total: 1_400_000, channel: 'zalo', state: 'confirmed', createdAt: '2026-08-15' },
      { id: 'DC-1708-03', date: '2026-08-18', slot: '09:30', resource: 'CANO2', pax: 6, guest: 'Nhóm khách Hà Nội',     phone: '0988xxx333', combo: 'COMBO-B', total: 2_100_000, channel: 'booking', state: 'confirmed', createdAt: '2026-08-16' },
      { id: 'DC-1708-04', date: '2026-08-18', slot: null,   resource: 'P1',    pax: 2, guest: 'Nhóm khách Hà Nội',     phone: '0988xxx333', combo: null,     total: 550_000,   channel: 'booking', state: 'confirmed', createdAt: '2026-08-16' },
      { id: 'DC-1708-05', date: '2026-08-18', slot: null,   resource: 'P2',    pax: 2, guest: 'Khách đoàn 12 người',   phone: '0977xxx444', combo: null,     total: 550_000,   channel: 'zalo', state: 'confirmed', createdAt: '2026-08-13' },
      { id: 'DC-1708-06', date: '2026-08-19', slot: '08:00', resource: 'LAN',  pax: 9, guest: 'Công ty Du lịch Sông Cầu', phone: '0903xxx555', combo: 'COMBO-A', total: 5_850_000, channel: 'b2b', state: 'confirmed', createdAt: '2026-08-15' },
      { id: 'DC-1708-07', date: '2026-08-20', slot: '13:30', resource: 'CANO1', pax: 5, guest: 'Nhóm khách Gia Lai',    phone: '0935xxx666', combo: 'COMBO-A', total: 3_250_000, channel: 'zalo', state: 'confirmed', createdAt: '2026-08-16' },
    ],
    orders: cd2Rev.orders,
    invoices: cd2Rev.invoices,
    receivables: [
      { id: 'CN-01', buyer: 'Công ty Lữ hành Đất Võ',  amount: 32_500_000, due: '2026-08-10', paid: false, note: 'Khách đoàn tháng 7, hợp đồng 30 ngày' },
      { id: 'CN-02', buyer: 'Công ty Du lịch Sông Cầu', amount: 14_700_000, due: '2026-09-02', paid: false, note: '' },
    ],
    // nhiều điểm quét QR — phải hợp nhất về một màn hình theo thời gian thực
    qrPoints: [
      { id: 'q1', ten: 'Bến thuyền',  diaChi: 'Bãi trước, cầu cảng nhỏ' },
      { id: 'q2', ten: 'Quán ăn',     diaChi: 'Nhà chính' },
      { id: 'q3', ten: 'Homestay',    diaChi: 'Khu phòng nghỉ' },
      { id: 'q4', ten: 'Điểm lặn',    diaChi: 'Chòi hướng dẫn' },
    ],
    payments: [
      { date: TODAY, point: 'q1', amount: 2_600_000, method: 'QR' },
      { date: TODAY, point: 'q1', amount: 1_400_000, method: 'QR' },
      { date: TODAY, point: 'q2', amount: 1_080_000, method: 'QR' },
      { date: TODAY, point: 'q2', amount: 720_000,   method: 'Tiền mặt' },
      { date: TODAY, point: 'q2', amount: 540_000,   method: 'QR' },
      { date: TODAY, point: 'q3', amount: 1_100_000, method: 'QR' },
      { date: TODAY, point: 'q4', amount: 2_250_000, method: 'QR' },
      { date: TODAY, point: 'q4', amount: 500_000,   method: 'QR' },
    ],
    compliance: [
      { id: 'ATTP2', ten: 'Giấy chứng nhận cơ sở đủ điều kiện an toàn thực phẩm — quán ăn', so: 'GL-ATTP-0912/2025',
        capNgay: '2025-09-14', expires: '2027-09-13', trangThai: 'con-han', batBuoc: true, dungCho: '' },
      { id: 'PTTS', ten: 'Đăng ký và đăng kiểm phương tiện thuỷ nội địa — Cano 1, Cano 2', so: 'GL-PT-118/2025',
        capNgay: '2025-12-01', expires: '2026-11-30', trangThai: 'con-han', batBuoc: true,
        dungCho: 'Điều kiện chở khách; công ty lữ hành yêu cầu bản sao khi ký hợp đồng' },
      { id: 'CUUHO', ten: 'Chứng chỉ cứu hộ và áo phao đủ số lượng', so: null,
        capNgay: '2026-04-02', expires: null, trangThai: 'con-han', batBuoc: true, dungCho: '' },
    ],
    expenses: [
      { id:'CHI-0805-01', date:'2026-08-05', loai:'nguyen-lieu',moTa:'Hải sản tươi nhập cho bếp tuần 1', soTien:8_600_000, chungTu:'phieu-chi', nhaCungCap:'Chợ cá Nhơn Lý', viCaNhan:false },
      { id:'CHI-0808-02', date:'2026-08-08', loai:'thiet-bi',  moTa:'Sửa máy cano số 2', soTien:4_200_000, chungTu:'hoa-don', nhaCungCap:'Xưởng cơ khí Hải Minh', viCaNhan:false },
      { id:'CHI-0811-03', date:'2026-08-11', loai:'van-chuyen',moTa:'Dầu chạy cano tuần cao điểm', soTien:5_400_000, chungTu:'khong', nhaCungCap:null, viCaNhan:true },
      { id:'CHI-0814-04', date:'2026-08-14', loai:'nhan-cong', moTa:'Thuê 3 hướng dẫn mùa cao điểm', soTien:6_000_000, chungTu:'khong', nhaCungCap:null, viCaNhan:true },
    ],
    messages: [
      { id:'TN1', date:'2026-08-17', tu:'Chị Thu', noiDung:'Mai ben minh con cho di cano khong em', kenh:'zalo', daTraLoi:false },
      { id:'TN2', date:'2026-08-16', tu:'Cty Lữ hành Đất Võ', noiDung:'Doan 20 khach ngay 22/8 con nhan khong', kenh:'zalo', daTraLoi:false },
    ],
    taxFiled: ['Q1/2026', 'Q2/2026'],
  };

  /* ════════════════════════════════════ CHÂN DUNG 3 ═══════════════════════
     Hộ thu mua và sơ chế cà phê, mắc ca, trái cây tại vùng nguyên liệu.
     Bán cho doanh nghiệp chế biến trong tỉnh và bán lẻ qua mạng.
     Con trai 32 tuổi phụ trách thu mua và bán hàng trực tuyến.
     Bài toán khó nhất: CHỨNG TỪ ĐẦU VÀO khi thu mua từ nông dân nhỏ lẻ.      */

  const CD3_SKUS = [
    { sku: 'CFN',  name: 'Cà phê nhân xô',        unit: 'kg', price: 96000,  taxGroup: 'phanPhoi' },
    { sku: 'CFR',  name: 'Cà phê rang mộc 500g',  unit: 'gói', price: 145000, taxGroup: 'sanXuat' },
    { sku: 'MCA',  name: 'Mắc ca sấy nứt vỏ',     unit: 'kg', price: 260000, taxGroup: 'sanXuat' },
    { sku: 'CDA',  name: 'Chanh dây tươi',        unit: 'kg', price: 28000,  taxGroup: 'phanPhoi', baoQuan: 'lanh' },
  ];

  const cd3Rev = genRevenue(3003,
    { 1: 60e6, 2: 55e6, 3: 70e6, 4: 65e6, 5: 75e6, 6: 80e6, 7: 85e6, 8: 45e6 },
    { docsPerMonth: 4, taxGroup: 'phanPhoi',
      channels: ['b2b', 'shopee', 'tiktok', 'live', 'zalo'],
      b2bChannels: ['b2b'],
      b2bBuyers: ['Công ty TNHH Vĩnh Hiệp', 'Công ty TNHH Xuất nhập khẩu Hoa Trang Gia Lai',
                  'Công ty Cổ phần Nông nghiệp AGRIS Gia Lai', 'Cơ sở rang xay Tây Nguyên'],
      retailNames: ['Chị Hạnh (Hà Nội)', 'Anh Phong (TP.HCM)', 'Quán cà phê Nhỏ (Đà Lạt)'],
      skuIds: CD3_SKUS.map(s => s.sku),
      giaTheoSku: CD3_SKUS.reduce((a,x)=>{a[x.sku]=x.price;return a;},{}) });

  const CD3 = {
    id: 'cd3',
    ma: 'CD3',
    name: 'Hộ kinh doanh Nông sản Chư Păh',
    chuHo: 'Ông Nguyễn Văn Bảo',
    keCan: { ten: 'Anh Nguyễn Thành Bình', tuoi: 32, vaiTro: 'Thu mua tại vườn và bán hàng trực tuyến' },
    nguoiLonTuoi: [{ ten: 'Ông Nguyễn Văn Bảo', tuoi: 60, vaiTro: 'Sơ chế, phơi sấy, cân hàng tại kho' }],
    diaBan: 'Xã Chư Păh',
    khongGian: 'Cao nguyên',
    nganh: 'Nông sản đặc sản',
    mst: '4101' + '456789',
    regime: 'hkd',
    taxGroupDefault: 'phanPhoi',
    activatedAt: '2026-07-08',
    dongLuc: 'Doanh nghiệp chế biến yêu cầu nhà cung cấp có hoá đơn để đưa vào chuỗi và phục vụ truy xuất nguồn gốc.',
    kenh: ['b2b', 'shopee', 'tiktok', 'live', 'zalo'],
    skus: CD3_SKUS,
    // bảng kê thu mua — hai dòng cuối CỐ TÌNH thiếu giấy tờ để demo cảnh báo
    purchases: [
      { id: 'BK-0805-01', date: '2026-08-05', seller: 'Ông Rơ Chăm Hlum', cccd: '064xxxxxx123', diaChi: 'Làng Kép, Xã Chư Păh',
        item: 'Cà phê nhân xô', sku: 'CFN', qty: 850, unit: 'kg', price: 82000, total: 69_700_000,
        lot: 'L260805-CFN-01', anhBienNhan: true, kyNhan: true, offline: false },
      { id: 'BK-0808-02', date: '2026-08-08', seller: 'Bà Siu H Blan', cccd: '064xxxxxx456', diaChi: 'Làng Mrông Yố, Xã Ia Ka',
        item: 'Cà phê nhân xô', sku: 'CFN', qty: 420, unit: 'kg', price: 83500, total: 35_070_000,
        lot: 'L260808-CFN-02', anhBienNhan: true, kyNhan: true, offline: true },
      { id: 'BK-0811-03', date: '2026-08-11', seller: 'Ông Trần Văn Lợi', cccd: '052xxxxxx789', diaChi: 'Thôn 4, Xã Ia Grai',
        item: 'Mắc ca tươi', sku: 'MCA', qty: 260, unit: 'kg', price: 105000, total: 27_300_000,
        lot: 'L260811-MCA-01', anhBienNhan: true, kyNhan: true, offline: false },
      { id: 'BK-0814-04', date: '2026-08-14', seller: 'Bà Nguyễn Thị Thu', cccd: '', diaChi: 'Thôn 2, Xã Chư Păh',
        item: 'Chanh dây tươi', sku: 'CDA', qty: 1200, unit: 'kg', price: 17500, total: 21_000_000,
        lot: 'L260814-CDA-01', anhBienNhan: false, kyNhan: true, offline: true },
      { id: 'BK-0816-05', date: '2026-08-16', seller: 'Ông Kpă Thanh', cccd: '064xxxxxx321', diaChi: '',
        item: 'Cà phê nhân xô', sku: 'CFN', qty: 310, unit: 'kg', price: 84000, total: 26_040_000,
        lot: 'L260816-CFN-03', anhBienNhan: false, kyNhan: false, offline: true },
    ],
    lots: [
      { id: 'L260805-CFN-01', sku: 'CFN', qty: 520, unit: 'kg', inDate: '2026-08-05',
        origin: { seller: 'Ông Rơ Chăm Hlum', diaChi: 'Làng Kép, Xã Chư Păh', bangKe: 'BK-0805-01' } },
      { id: 'L260808-CFN-02', sku: 'CFN', qty: 420, unit: 'kg', inDate: '2026-08-08',
        origin: { seller: 'Bà Siu H Blan', diaChi: 'Làng Mrông Yố, Xã Ia Ka', bangKe: 'BK-0808-02' } },
      { id: 'L260811-MCA-01', sku: 'MCA', qty: 205, unit: 'kg', inDate: '2026-08-11',
        origin: { seller: 'Ông Trần Văn Lợi', diaChi: 'Thôn 4, Xã Ia Grai', bangKe: 'BK-0811-03' } },
      { id: 'L260814-CDA-01', sku: 'CDA', qty: 1200, unit: 'kg', inDate: '2026-08-14',
        origin: { seller: 'Bà Nguyễn Thị Thu', diaChi: 'Thôn 2, Xã Chư Păh', bangKe: 'BK-0814-04' } },
      { id: 'L260816-CFN-03', sku: 'CFN', qty: 310, unit: 'kg', inDate: '2026-08-16',
        origin: { seller: 'Ông Kpă Thanh', diaChi: '', bangKe: 'BK-0816-05' } },
      { id: 'L260710-CFR-01', sku: 'CFR', qty: 180, unit: 'gói', inDate: '2026-07-10',
        origin: { seller: 'Rang từ lô L260630-CFN', bangKe: null } },
    ],
    orders: cd3Rev.orders.concat([
      { id: 'DH-2608-301', date: '2026-08-17', channel: 'live', buyer: 'Đơn phát trực tiếp tối 16/08',
        state: 'picking', total: 4_350_000, taxGroup: 'sanXuat',
        lines: [{ sku: 'CFR', qty: 30, amount: 4_350_000 }], synced: false },
    ]),
    invoices: cd3Rev.invoices.concat([
      // hoá đơn bán cho doanh nghiệp chế biến, GẮN LÔ để truy xuất được tới nông dân
      { id: 'HD-2608-901', date: '2026-08-15', buyer: 'Công ty TNHH Vĩnh Hiệp', buyerMst: '4100258963',
        channel: 'b2b', kind: 'Hoá đơn điện tử', fromPos: false, taxGroup: 'phanPhoi',
        lines: [{ sku: 'CFN', qty: 750, amount: 72_000_000,
                  lots: [{ lot: 'L260805-CFN-01', qty: 330, origin: { seller: 'Ông Rơ Chăm Hlum', diaChi: 'Làng Kép, Xã Chư Păh', bangKe: 'BK-0805-01' } },
                         { lot: 'L260808-CFN-02', qty: 420, origin: { seller: 'Bà Siu H Blan', diaChi: 'Làng Mrông Yố, Xã Ia Ka', bangKe: 'BK-0808-02' } }] }],
        total: 72_000_000, cqtState: 'sent', cqtCode: 'M2026-774512' },
    ]),
    receivables: [
      { id: 'CN-01', buyer: 'Công ty TNHH Vĩnh Hiệp', amount: 72_000_000, due: '2026-09-14', paid: false, note: 'Hợp đồng thanh toán 30 ngày' },
    ],
    qrPoints: [{ id: 'q1', ten: 'Kho thu mua', diaChi: 'Sân phơi' }],
    payments: [{ date: TODAY, point: 'q1', amount: 860_000, method: 'QR' }],
    compliance: [
      { id: 'TX3', ten: 'Mã truy xuất nguồn gốc theo lô thu mua', so: null, capNgay: '2026-07-12',
        expires: null, trangThai: 'con-han', batBuoc: true,
        dungCho: 'Doanh nghiệp chế biến yêu cầu truy xuất tới vườn' },
      { id: 'VG', ten: 'Liên kết vùng trồng có mã số', so: null, capNgay: null, expires: null,
        trangThai: 'thieu', batBuoc: false,
        dungCho: 'Chưa có — cần nếu muốn bán vào chuỗi xuất khẩu' },
    ],
    expenses: [
      { id:'CHI-0807-01', date:'2026-08-07', loai:'van-chuyen',moTa:'Thuê xe chở cà phê về kho', soTien:2_800_000, chungTu:'khong', nhaCungCap:null, viCaNhan:true },
      { id:'CHI-0810-02', date:'2026-08-10', loai:'bao-bi',    moTa:'Bao PP đựng cà phê nhân 200 cái', soTien:1_600_000, chungTu:'hoa-don', nhaCungCap:'Cửa hàng bao bì Pleiku', viCaNhan:false },
      { id:'CHI-0813-03', date:'2026-08-13', loai:'thiet-bi',  moTa:'Thay lưới máy sấy mắc ca', soTien:3_500_000, chungTu:'phieu-chi', nhaCungCap:null, viCaNhan:false },
    ],
    messages: [
      { id:'TN1', date:'2026-08-16', tu:'Anh Dũng', noiDung:'Ca phe nhan gia bao nhieu 1kg v em', kenh:'zalo', daTraLoi:false },
      { id:'TN2', date:'2026-08-15', tu:'Cty Vĩnh Hiệp - chị Nga', noiDung:'Lo giao tuan sau co giay truy xuat khong em', kenh:'zalo', daTraLoi:false },
      { id:'TN3', date:'2026-08-13', tu:'Chị Hồng (Đà Nẵng)', noiDung:'Mac ca con hang khong em, lay 5kg', kenh:'zalo', daTraLoi:true, traLoi:'Dạ còn ạ, em gói 5kg gửi chiều nay.', traLoiLuc:'2026-08-13' },
    ],
    taxFiled: ['Q2/2026'],
  };

  /* ═════════════════════════════════════════ META CHƯƠNG TRÌNH ════════════ */

  const META = {
    chuongTrinh: {
      ten: 'Chương trình Kế nghiệp số Gia Lai',
      chuTri: 'Hội Doanh nhân trẻ tỉnh Gia Lai — Tổ công tác Hộ kinh doanh lên doanh nghiệp',
      phoiHop: 'Sở Công Thương, Sở Tài chính, Thuế tỉnh',
      giaiDoan: 'Thí điểm 5–10 hộ từ tháng 11/2026 · khoá 100–150 hộ/khoá từ 2027',
      nganh: ['Đồ ăn, đồ uống và đặc sản', 'Dịch vụ du lịch', 'Nông sản đặc sản'],
    },
    // cohort sống — đo "còn hoạt động sau 12–24 tháng" (Mục II.3).
    // Số của khoá thí điểm là số THẬT của 3 hộ; các khoá sau là chỉ tiêu kế hoạch.
    cohort: [
      { khoa: 'Thí điểm Q4/2026', batDau: 3,   thang3: 3,  thang6: null, thang12: null, thang24: null, conHoatDong: 3,  ghiChu: 'Đang chạy — số thật từ dữ liệu ba hộ' },
      { khoa: 'Khoá 1 / 2027',    batDau: 120, thang3: null, thang6: null, thang12: null, thang24: null, conHoatDong: 0, ghiChu: 'Chỉ tiêu kế hoạch, chưa phát sinh' },
    ],
    ghiChuPDPL: 'Dữ liệu chi tiết của hộ thuộc về hộ. Bảng điều khiển Chương trình chỉ nhận số liệu tổng hợp phục vụ đo lường.',
  };

  global.SM_SEED_GIALAI = {
    tenants: { cd1: CD1, cd2: CD2, cd3: CD3 },
    meta: META,
  };
})(window);
