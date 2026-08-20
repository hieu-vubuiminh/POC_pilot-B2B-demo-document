/**
 * sm-domain.js — NGHIỆP VỤ. Mọi con số hiện trên giao diện đều TÍNH TỪ ĐÂY,
 * không có chuỗi kết quả viết cứng trong seed. (Cán bộ chấm nói rõ họ sẽ thử
 * bắt lỗi "trả lời từ seed data" — nên nguyên tắc: tính, đừng kể.)
 *
 * Phủ các ràng buộc: IV.1 (hoá đơn từ máy tính tiền + hai chế độ HKD/DN)
 *                    IV.5 (nghĩa vụ thuế tạm tính realtime + cảnh báo mốc)
 *                    chân dung 1 (tồn kho 3 kênh) · 2 (đặt chỗ chống trùng)
 *                    · 3 (bảng kê thu mua + lô truy xuất)
 *                    IV.7 (ba cửa thanh toán theo kích hoạt thật)
 */
(function (global) {
  'use strict';
  const SM = global.SM;
  if (!SM) throw new Error('sm-domain.js cần sm-core.js nạp trước');

  /* ================================================================== THUẾ ==
     ⚠️ BẢNG TỶ LỆ CẦN ĐỐI CHIẾU VĂN BẢN HIỆN HÀNH TRƯỚC KHI ĐƯA VÀO HỒ SƠ.
     Mockup cố tình để bảng này ở MỘT chỗ, thay được, và hiện nguồn trên giao
     diện — thay vì rải số khắp nơi.                                          */

  const TAX = {
    nguon: 'Biểu tỷ lệ % trên doanh thu theo nhóm ngành áp cho hộ kinh doanh nộp thuế theo phương pháp kê khai',
    canDoiChieu: true,          // hiện cảnh báo vàng trên giao diện
    nhom: {
      phanPhoi:  { ten: 'Phân phối, cung cấp hàng hoá',                        gtgt: 1.0, tncn: 0.5 },
      sanXuat:   { ten: 'Sản xuất, vận tải, dịch vụ có gắn với hàng hoá',      gtgt: 3.0, tncn: 1.5 },
      dichVu:    { ten: 'Dịch vụ, xây dựng không bao thầu nguyên vật liệu',    gtgt: 5.0, tncn: 2.0 },
      khac:      { ten: 'Hoạt động kinh doanh khác',                           gtgt: 2.0, tncn: 1.0 },
    },
    nguong: {
      mienThue:   { value: 200e6, ten: 'Doanh thu năm không quá 200 triệu — thuộc diện miễn GTGT và TNCN', canDoiChieu: true },
      posInvoice: { value: 1e9,   ten: 'Doanh thu trên 1 tỷ đồng/năm — thuộc diện dùng hoá đơn điện tử khởi tạo từ máy tính tiền có kết nối dữ liệu với cơ quan thuế', nguon: 'Bài toán đặt hàng Mục I.1' },
    },
    // Chế độ doanh nghiệp sau chuyển đổi
    dn: {
      gtgtSuat: 10,             // phương pháp khấu trừ
      tndnBac: [
        { tran: 3e9,  suat: 15, ten: 'Doanh thu năm không quá 3 tỷ' },
        { tran: 50e9, suat: 17, ten: 'Doanh thu năm trên 3 tỷ đến 50 tỷ' },
        { tran: Infinity, suat: 20, ten: 'Doanh thu năm trên 50 tỷ' },
      ],
      canDoiChieu: true,
    },
    // Sổ theo chế độ kế toán hộ kinh doanh: định tuyến theo hình thức chịu thuế
    so: {
      S1a: 'Sổ nhóm doanh thu không chịu thuế',
      S2a: 'Sổ nhóm chịu thuế GTGT và TNCN trực tiếp trên doanh thu',
      canDoiChieu: true,
    },
  };

  /** Nhóm thuế của một dòng doanh thu → quyết định cả tỷ lệ lẫn sổ ghi. */
  function taxGroupOf(t, line) {
    if (line.taxGroup) return line.taxGroup;
    const sku = (t.skus || []).find(s => s.sku === line.sku);
    if (sku && sku.taxGroup) return sku.taxGroup;
    return t.taxGroupDefault || 'phanPhoi';
  }

  function bookOf(group) {
    return group === 'mienThue' ? 'S1a' : 'S2a';
  }

  /** Doanh thu theo kỳ. period: {from,to} hoặc {quarter,year} */
  function periodRange(period) {
    if (period && period.from) return period;
    const q = (period && period.quarter) || SM.CLOCK.quarter;
    const y = (period && period.year) || SM.CLOCK.year;
    const m0 = (q - 1) * 3 + 1;
    const last = new Date(y, m0 + 2, 0).getDate();
    return { from: `${y}-${String(m0).padStart(2, '0')}-01`, to: `${y}-${String(m0 + 2).padStart(2, '0')}-${last}` };
  }

  function revenueLines(t, period) {
    const r = periodRange(period);
    const out = [];
    (t.invoices || []).forEach(inv => {
      if (inv.date < r.from || inv.date > r.to) return;
      if (inv.void) return;
      (inv.lines || [{ sku: null, amount: inv.total, taxGroup: inv.taxGroup }]).forEach(l => {
        out.push({ src: 'invoice', id: inv.id, date: inv.date, channel: inv.channel || 'b2b',
                   sku: l.sku, amount: l.amount, taxGroup: taxGroupOf(t, l) });
      });
    });
    // Đơn bán lẻ / sàn đã thu tiền nhưng chưa lập hoá đơn riêng (POS gộp cuối ngày)
    (t.orders || []).forEach(o => {
      if (o.date < r.from || o.date > r.to) return;
      if (o.state !== 'paid' && o.state !== 'done') return;
      if (o.invoiceId) return; // đã tính ở hoá đơn
      out.push({ src: 'order', id: o.id, date: o.date, channel: o.channel,
                 sku: null, amount: o.total, taxGroup: o.taxGroup || t.taxGroupDefault || 'phanPhoi' });
    });
    return out;
  }

  /** Nghĩa vụ thuế TẠM TÍNH — realtime, theo đúng ràng buộc IV.5. */
  function taxEstimate(t, period) {
    const lines = revenueLines(t, period);
    const byGroup = {};
    let revenue = 0;
    lines.forEach(l => {
      revenue += l.amount;
      const g = l.taxGroup;
      byGroup[g] = byGroup[g] || { group: g, revenue: 0, gtgt: 0, tncn: 0, book: bookOf(g) };
      byGroup[g].revenue += l.amount;
    });

    const isDN = t.regime === 'dn';
    let gtgt = 0, tncn = 0, tndn = 0;

    if (isDN) {
      // Chế độ doanh nghiệp: GTGT khấu trừ, TNDN trên lợi nhuận
      const inputVat = (t.purchaseInvoices || []).reduce((s, p) =>
        (p.date >= periodRange(period).from && p.date <= periodRange(period).to) ? s + (p.vat || 0) : s, 0);
      gtgt = Math.max(0, revenue * TAX.dn.gtgtSuat / 100 - inputVat);
      const cost = costOfPeriod(t, period);
      const profit = Math.max(0, revenue - cost);
      const yearRev = revenueLines(t, { from: `${SM.CLOCK.year}-01-01`, to: `${SM.CLOCK.year}-12-31` })
        .reduce((s, l) => s + l.amount, 0);
      const bac = TAX.dn.tndnBac.find(b => yearRev <= b.tran) || TAX.dn.tndnBac[TAX.dn.tndnBac.length - 1];
      tndn = profit * bac.suat / 100;
      Object.values(byGroup).forEach(g => { g.gtgt = null; g.tncn = null; g.book = '—'; });
      return { regime: 'dn', period: periodRange(period), revenue, byGroup: Object.values(byGroup),
               gtgt, tncn: 0, tndn, tndnSuat: bac.suat, inputVat, cost, profit,
               total: gtgt + tndn, mienThue: false };
    }

    // Chế độ hộ kinh doanh: tỷ lệ trực tiếp trên doanh thu
    const yearRev = revenueLines(t, { from: `${SM.CLOCK.year}-01-01`, to: `${SM.CLOCK.year}-12-31` })
      .reduce((s, l) => s + l.amount, 0);
    const mienThue = yearRev <= TAX.nguong.mienThue.value;

    Object.values(byGroup).forEach(g => {
      const rate = TAX.nhom[g.group] || TAX.nhom.khac;
      g.gtgt = mienThue ? 0 : g.revenue * rate.gtgt / 100;
      g.tncn = mienThue ? 0 : g.revenue * rate.tncn / 100;
      g.rate = rate;
      gtgt += g.gtgt; tncn += g.tncn;
    });

    return { regime: 'hkd', period: periodRange(period), revenue, yearRev, mienThue,
             byGroup: Object.values(byGroup), gtgt, tncn, tndn: 0, total: gtgt + tncn };
  }

  function costOfPeriod(t, period) {
    const r = periodRange(period);
    const buy = (t.purchases || []).reduce((s, p) => (p.date >= r.from && p.date <= r.to) ? s + p.total : s, 0);
    const inv = (t.purchaseInvoices || []).reduce((s, p) => (p.date >= r.from && p.date <= r.to) ? s + (p.net || 0) : s, 0);
    // Khoản chi hằng ngày (bao bì, vận chuyển, điện nước...) cũng là giá vốn —
    // thiếu nó thì chế độ doanh nghiệp tính lãi cao hơn thực tế.
    const chi = (t.expenses || []).reduce((s, e) => (e.date >= r.from && e.date <= r.to) ? s + e.soTien : s, 0);
    return buy + inv + chi;
  }

  /** Có thuộc diện phải dùng hoá đơn từ máy tính tiền? (IV.1) */
  function needsPosInvoice(t) {
    const yearRev = revenueLines(t, { from: `${SM.CLOCK.year}-01-01`, to: `${SM.CLOCK.year}-12-31` })
      .reduce((s, l) => s + l.amount, 0);
    // ước cả năm theo tiến độ để cảnh báo TRƯỚC khi vượt, không phải sau
    const dayOfYear = Math.round((new Date(SM.CLOCK.today) - new Date(SM.CLOCK.year + '-01-01')) / 86400000) + 1;
    const projected = yearRev / dayOfYear * 365;
    return {
      yearRev, projected,
      nguong: TAX.nguong.posInvoice.value,
      thuocDien: yearRev > TAX.nguong.posInvoice.value,
      sapVuot: yearRev <= TAX.nguong.posInvoice.value && projected > TAX.nguong.posInvoice.value,
    };
  }

  /* ============================================== SỔ THEO CHẾ ĐỘ KẾ TOÁN ====
     Định tuyến giao dịch vào đúng sổ — không bắt hộ hiểu bút toán Nợ/Có.      */

  function books(t, period) {
    const lines = revenueLines(t, period);
    const out = { S1a: { code: 'S1a', ten: TAX.so.S1a, rows: [], total: 0 },
                  S2a: { code: 'S2a', ten: TAX.so.S2a, rows: [], total: 0 } };
    const est = taxEstimate(t, period);
    lines.forEach(l => {
      const b = est.mienThue ? 'S1a' : bookOf(l.taxGroup);
      out[b].rows.push(l);
      out[b].total += l.amount;
    });
    return out;
  }

  /* ============================================ MỐC NGHĨA VỤ + CẢNH BÁO =====
     IV.5: "cảnh báo chủ động trước các mốc nghĩa vụ (hạn kê khai, hạn nộp
     thuế, đơn hàng chưa xử lý)".                                             */

  function deadlines(t) {
    const q = SM.CLOCK.quarter, y = SM.CLOCK.year;
    // hạn kê khai thuế quý: ngày cuối tháng đầu của quý sau
    const m = q * 3 + 1;
    const khaiQuy = m > 12 ? `${y + 1}-01-31` : `${y}-${String(m).padStart(2, '0')}-${new Date(y, m, 0).getDate()}`;
    const days = iso => Math.round((new Date(iso) - new Date(SM.CLOCK.today)) / 86400000);

    const list = [{
      id: 'khai-q' + q, loai: 'thue',
      ten: `Kê khai và nộp thuế quý ${q}/${y}`,
      han: khaiQuy, conLai: days(khaiQuy),
      soTien: taxEstimate(t).total,
      trangThai: (t.taxFiled || []).includes('Q' + q + '/' + y) ? 'done' : 'todo',
    }];

    // đơn chưa xử lý
    const pend = (t.orders || []).filter(o => o.state === 'new' || o.state === 'picking');
    if (pend.length) list.push({
      id: 'don-cho', loai: 'don', ten: `${pend.length} đơn chưa xử lý`,
      han: null, conLai: null, trangThai: 'todo', refs: pend.map(o => o.id),
    });

    // công nợ quá hạn
    const od = (t.receivables || []).filter(r => r.due < SM.CLOCK.today && !r.paid);
    if (od.length) list.push({
      id: 'no-qua-han', loai: 'no',
      ten: `${od.length} khoản công nợ quá hạn`,
      soTien: od.reduce((s, r) => s + r.amount, 0),
      han: od.map(r => r.due).sort()[0], conLai: days(od.map(r => r.due).sort()[0]),
      trangThai: 'todo',
    });

    // hoá đơn chưa truyền được sang cơ quan thuế
    const stuck = (t.invoices || []).filter(i => i.cqtState === 'queued' || i.cqtState === 'error');
    if (stuck.length) list.push({
      id: 'hd-chua-truyen', loai: 'hoadon',
      ten: `${stuck.length} hoá đơn chưa truyền sang cơ quan thuế`,
      trangThai: 'todo', refs: stuck.map(i => i.id),
    });

    // bảng kê thu mua thiếu giấy tờ — chặn khoá kỳ
    const ps = purchaseSummary(t);
    if (ps.thieuChungTu) list.push({
      id: 'bangke-thieu', loai: 'bangke',
      ten: `${ps.thieuChungTu} bảng kê thu mua thiếu giấy tờ`,
      trangThai: 'todo',
    });

    // ngưỡng máy tính tiền
    const pos = needsPosInvoice(t);
    if (pos.sapVuot) list.push({
      id: 'nguong-mtt', loai: 'nguong',
      ten: 'Doanh thu đang trên đà vượt 1 tỷ/năm — sẽ thuộc diện hoá đơn từ máy tính tiền',
      soTien: pos.projected, trangThai: 'warn',
    });

    // hồ sơ an toàn thực phẩm sắp hết hạn (chân dung 1)
    (t.compliance || []).forEach(c => {
      if (!c.expires) return;
      const d = days(c.expires);
      if (d <= 90) list.push({
        id: 'attp-' + c.id, loai: 'hoso',
        ten: `${c.ten} ${d < 0 ? 'ĐÃ HẾT HẠN' : 'hết hạn sau ' + d + ' ngày'}`,
        han: c.expires, conLai: d, trangThai: d < 30 ? 'todo' : 'warn',
      });
    });

    // Mỗi việc phải BẤM ĐI THẲNG được. Trước đây thẻ nhắc chỉ báo rồi để hộ tự mò
    // — đúng chỗ đứt luồng mà người soát chỉ ra.
    const DICH = { thue: 'tien', don: 'don', no: 'congno', hoadon: 'hopthu',
                   nguong: 'ban', hoso: 'kho', bangke: 'mua' };
    list.forEach(x => { x.dichDen = DICH[x.loai] || null; });

    return list.sort((a, b) => {
      const rank = s => s === 'todo' ? 0 : s === 'warn' ? 1 : 2;
      if (rank(a.trangThai) !== rank(b.trangThai)) return rank(a.trangThai) - rank(b.trangThai);
      return (a.conLai === null ? 999 : a.conLai) - (b.conLai === null ? 999 : b.conLai);
    });
  }

  /* ================================= TỒN KHO ĐA KÊNH + THEO LÔ ==============
     Chân dung 1: "tồn kho đồng bộ theo thời gian thực giữa ba kênh để không
     nhận đơn quá lượng hàng".  Chân dung 3: "quản lý tồn kho theo lô phục vụ
     truy xuất".                                                              */

  const CHANNELS = {
    quay:    { ten: 'Bán lẻ tại quầy',   icon: '🏪' },
    b2b:     { ten: 'Nhà hàng, khách sạn', icon: '🏨' },
    shopee:  { ten: 'Shopee',            icon: '🛒' },
    tiktok:  { ten: 'TikTok Shop',       icon: '🎵' },
    lazada:  { ten: 'Lazada',            icon: '🛍️' },
    zalo:    { ten: 'Zalo',              icon: '💬' },
    food:    { ten: 'App giao đồ ăn',    icon: '🛵' },
    booking: { ten: 'Nền tảng đặt phòng', icon: '🛏️' },
    live:    { ten: 'Phát trực tiếp',    icon: '📡' },
  };

  /** Tồn khả dụng = tổng tồn các lô − đã giữ chỗ cho đơn chưa giao. MỘT con số cho MỌI kênh. */
  /**
   * ⚠️ DỊCH VỤ KHÔNG CÓ TỒN KHO. Gói tour, phòng homestay, suất lặn bị giới hạn bởi
   * LỊCH ĐẶT CHỖ chứ không phải bởi kho. Trước đây coi chúng như hàng hoá nên màn Bán
   * hiện "hết hàng" cho toàn bộ dịch vụ của hộ du lịch — vô lý và trông như dữ liệu chết.
   */
  function laDichVu(t, sku) {
    const s = (t.skus || []).find(x => x.sku === sku);
    return !!(s && s.dichVu);
  }

  function stock(t, sku) {
    if (laDichVu(t, sku)) {
      return { sku, dichVu: true, onHand: null, reserved: null, available: Infinity, lots: [] };
    }
    const lots = (t.lots || []).filter(l => l.sku === sku && l.qty > 0);
    const onHand = lots.reduce((s, l) => s + l.qty, 0);
    const reserved = (t.orders || [])
      .filter(o => o.state === 'new' || o.state === 'picking')
      .reduce((s, o) => s + (o.lines || []).filter(l => l.sku === sku).reduce((a, l) => a + l.qty, 0), 0);
    return { sku, onHand, reserved, available: onHand - reserved, lots };
  }

  function stockAll(t) { return (t.skus || []).map(s => Object.assign({ meta: s }, stock(t, s.sku))); }

  /**
   * Kiểm tra nhận đơn — CHẶN bán quá tồn, bất kể đơn đến từ kênh nào.
   * Trả về {ok, viPham:[{sku, name, xin, con}]}
   */
  function checkOrder(t, lines) {
    const viPham = [];
    lines.forEach(l => {
      const st = stock(t, l.sku);
      if (l.qty > st.available) {
        const meta = (t.skus || []).find(s => s.sku === l.sku);
        viPham.push({ sku: l.sku, name: meta ? meta.name : l.sku, xin: l.qty, con: st.available });
      }
    });
    return { ok: viPham.length === 0, viPham };
  }

  /** Trừ kho theo lô, cũ trước (giữ được đường truy xuất từ lô mua → lô bán). */
  function consume(t, sku, qty) {
    if (laDichVu(t, sku)) return { used: [], thieu: 0, dichVu: true };
    const lots = (t.lots || []).filter(l => l.sku === sku && l.qty > 0)
      .sort((a, b) => (a.inDate || '').localeCompare(b.inDate || ''));
    const used = [];
    let need = qty;
    for (const lot of lots) {
      if (need <= 0) break;
      const take = Math.min(lot.qty, need);
      lot.qty -= take; need -= take;
      used.push({ lot: lot.id, qty: take, origin: lot.origin || null });
    }
    return { used, thieu: need > 0 ? need : 0 };
  }

  /* ================================ BẢNG KÊ THU MUA (CHÂN DUNG 3) ===========
     "xử lý bài toán chứng từ đầu vào khi thu mua từ nông dân nhỏ lẻ".
     Đây là bài toán kế toán khó nhất trong cả ba chân dung.                   */

  function addPurchase(t, p) {
    const seq = (t.purchases || []).length + 1;
    const rec = {
      id: 'BK-' + SM.CLOCK.today.slice(5, 7) + SM.CLOCK.today.slice(8, 10) + '-' + String(seq).padStart(2, '0'),
      date: p.date || SM.CLOCK.today,
      seller: p.seller, cccd: p.cccd || '', diaChi: p.diaChi || '',
      item: p.item, sku: p.sku, qty: p.qty, unit: p.unit || 'kg',
      price: p.price, total: p.qty * p.price,
      lot: p.lot || ('L' + SM.CLOCK.today.replace(/-/g, '').slice(2) + '-' + String(seq).padStart(2, '0')),
      anhBienNhan: p.anhBienNhan || false,
      kyNhan: p.kyNhan || false,
      offline: !SM.isOnline(),
    };
    t.purchases = t.purchases || [];
    t.purchases.push(rec);

    // vào kho thành một lô truy xuất được
    t.lots = t.lots || [];
    t.lots.push({ id: rec.lot, sku: rec.sku, qty: rec.qty, unit: rec.unit,
                  inDate: rec.date, origin: { seller: rec.seller, diaChi: rec.diaChi, bangKe: rec.id } });
    SM.save();
    return rec;
  }

  /** Kiểm tra một bảng kê đã đủ điều kiện làm chứng từ đầu vào chưa. */
  function checkPurchase(rec) {
    const thieu = [];
    if (!rec.seller) thieu.push('tên người bán');
    if (!rec.cccd) thieu.push('số giấy tờ định danh người bán');
    if (!rec.diaChi) thieu.push('địa chỉ người bán');
    if (!rec.qty || !rec.price) thieu.push('số lượng hoặc đơn giá');
    if (!rec.kyNhan && !rec.anhBienNhan) thieu.push('chữ ký nhận tiền hoặc ảnh biên nhận');
    return { ok: thieu.length === 0, thieu };
  }

  function purchaseSummary(t, period) {
    const r = periodRange(period);
    const rows = (t.purchases || []).filter(p => p.date >= r.from && p.date <= r.to);
    const bad = rows.filter(p => !checkPurchase(p).ok);
    return { rows, total: rows.reduce((s, p) => s + p.total, 0), soLuot: rows.length,
             thieuChungTu: bad.length, bad };
  }

  /** Truy xuất: từ hoá đơn bán → lô → bảng kê → nông dân. */
  function trace(t, invoiceId) {
    const inv = (t.invoices || []).find(i => i.id === invoiceId);
    if (!inv) return null;
    const chain = [];
    (inv.lines || []).forEach(l => {
      (l.lots || []).forEach(u => {
        const lot = (t.lots || []).find(x => x.id === u.lot) ||
                    (t.lotsArchive || []).find(x => x.id === u.lot);
        const bk = lot && lot.origin ? (t.purchases || []).find(p => p.id === lot.origin.bangKe) : null;
        chain.push({ sku: l.sku, qty: u.qty, lot: u.lot,
                     nguon: lot && lot.origin ? lot.origin : null, bangKe: bk });
      });
    });
    return { invoice: inv, chain };
  }

  /* ================================= ĐẶT CHỖ THEO TÀI NGUYÊN (CHÂN DUNG 2) ==
     "đặt chỗ theo khung giờ và giới hạn số chỗ trên từng chuyến" +
     "lịch phòng homestay và lịch thuyền tập trung, tránh trùng đặt".          */

  /** Số chỗ đã dùng của một tài nguyên trong một khung giờ / một đêm. */
  function used(t, resourceId, date, slot) {
    return (t.bookings || [])
      .filter(b => b.state !== 'cancelled' && b.resource === resourceId && b.date === date &&
                   (slot ? b.slot === slot : true))
      .reduce((s, b) => s + (b.pax || 1), 0);
  }

  function resource(t, id) { return (t.resources || []).find(r => r.id === id) || null; }

  /**
   * Kiểm tra đặt chỗ. CHẶN trùng đặt và CHẶN vượt số chỗ trên chuyến.
   * Với phòng (kind='room') thì một đêm chỉ một lượt: capacity 1.
   */
  function checkBooking(t, req) {
    const res = resource(t, req.resource);
    if (!res) return { ok: false, lyDo: 'Không tìm thấy tài nguyên' };
    const cap = res.capacity || 1;
    const dang = used(t, req.resource, req.date, res.kind === 'room' ? null : req.slot);
    const xin = req.pax || 1;

    if (res.kind === 'room' && dang >= 1) {
      const b = (t.bookings || []).find(x => x.state !== 'cancelled' && x.resource === req.resource && x.date === req.date);
      return { ok: false, trung: true, lyDo: `${res.ten} đã có khách đêm ${SM.fmt.dmy(req.date)}`,
               boiVi: b ? b.id + ' — ' + b.guest : null, con: 0, cap };
    }
    if (dang + xin > cap) {
      return { ok: false, vuot: true, cap, dang, con: cap - dang,
               lyDo: `${res.ten} khung ${req.slot || ''} chỉ còn ${cap - dang}/${cap} chỗ, đơn xin ${xin} chỗ` };
    }
    return { ok: true, cap, dang, con: cap - dang - xin };
  }

  function addBooking(t, req) {
    const chk = checkBooking(t, req);
    if (!chk.ok) return { ok: false, chk };
    const seq = (t.bookings || []).length + 1;
    const rec = {
      id: 'DC-' + SM.CLOCK.today.slice(5, 7) + SM.CLOCK.today.slice(8, 10) + '-' + String(seq).padStart(2, '0'),
      date: req.date, slot: req.slot || null, resource: req.resource,
      pax: req.pax || 1, guest: req.guest || 'Khách lẻ', phone: req.phone || '',
      combo: req.combo || null, total: req.total || 0,
      channel: req.channel || 'zalo', state: 'confirmed', createdAt: SM.CLOCK.today,
    };
    t.bookings = t.bookings || [];
    t.bookings.push(rec);
    SM.save();
    return { ok: true, rec };
  }

  /** Lịch tập trung: mọi tài nguyên trên MỘT màn hình (chống trùng bằng cách cho thấy hết). */
  function calendar(t, fromDate, days) {
    const out = [];
    for (let i = 0; i < (days || 7); i++) {
      const d = SM.dayOffset(fromDate || SM.CLOCK.today, i);
      const row = { date: d, res: [] };
      (t.resources || []).forEach(r => {
        if (r.kind === 'room') {
          const u = used(t, r.id, d, null);
          row.res.push({ res: r, slots: [{ slot: 'đêm', cap: 1, used: u, free: 1 - u }] });
        } else {
          row.res.push({
            res: r,
            slots: (r.slots || []).map(s => {
              const u = used(t, r.id, d, s);
              return { slot: s, cap: r.capacity, used: u, free: r.capacity - u };
            })
          });
        }
      });
      out.push(row);
    }
    return out;
  }

  /** Doanh thu mùa vụ (chân dung 2): theo tháng, cộng cảnh báo lệch mùa. */
  function seasonality(t) {
    const y = SM.CLOCK.year;
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const last = new Date(y, m, 0).getDate();
      const rev = revenueLines(t, { from: `${y}-${String(m).padStart(2, '0')}-01`,
                                    to: `${y}-${String(m).padStart(2, '0')}-${last}` })
        .reduce((s, l) => s + l.amount, 0);
      months.push({ m, rev, ten: 'T' + m });
    }
    const has = months.filter(x => x.rev > 0);
    const max = Math.max(...months.map(x => x.rev), 0);
    const min = has.length ? Math.min(...has.map(x => x.rev)) : 0;
    return { months, max, min, lech: min > 0 ? max / min : null,
             caoDiem: months.filter(x => x.rev >= max * 0.7).map(x => x.ten),
             thapDiem: has.filter(x => x.rev <= min * 1.3).map(x => x.ten) };
  }

  /* ================== HỢP NHẤT DOANH THU NHIỀU ĐIỂM QR (CHÂN DUNG 2) ========
     "thanh toán QR tại nhiều điểm và hợp nhất doanh thu các điểm theo thời
     gian thực về một màn hình".                                              */

  function qrPoints(t, date) {
    const d = date || SM.CLOCK.today;
    const pts = (t.qrPoints || []).map(p => Object.assign({}, p, { revenue: 0, count: 0 }));
    (t.payments || []).forEach(pm => {
      if (pm.date !== d) return;
      const p = pts.find(x => x.id === pm.point);
      if (p) { p.revenue += pm.amount; p.count += 1; }
    });
    return { date: d, points: pts, total: pts.reduce((s, p) => s + p.revenue, 0),
             count: pts.reduce((s, p) => s + p.count, 0) };
  }

  /* ========================== HOÁ ĐƠN + MÁY TÍNH TIỀN (IV.1) ================ */

  /**
   * Phát hành hoá đơn. fromPos=true nghĩa là hoá đơn điện tử KHỞI TẠO TỪ MÁY
   * TÍNH TIỀN có kết nối chuyển dữ liệu với cơ quan thuế.
   * Offline vẫn lập được → xếp hàng đợi truyền sau (IV.4).
   */
  function issueInvoice(t, o) {
    const seq = (t.invoices || []).length + 1;
    const est = taxEstimate(t);
    const group = o.taxGroup || t.taxGroupDefault || 'phanPhoi';
    const rate = TAX.nhom[group] || TAX.nhom.khac;

    const inv = {
      id: (o.fromPos ? 'MTT-' : 'HD-') + SM.CLOCK.today.slice(2, 4) + SM.CLOCK.today.slice(5, 7) + '-' + String(seq).padStart(3, '0'),
      date: o.date || SM.CLOCK.today,
      buyer: o.buyer || 'Khách lẻ không lấy hoá đơn',
      buyerMst: o.buyerMst || null,
      channel: o.channel || 'quay',
      kind: o.fromPos ? 'Hoá đơn điện tử khởi tạo từ máy tính tiền' : 'Hoá đơn điện tử',
      fromPos: !!o.fromPos,
      lines: o.lines || [],
      total: o.total || (o.lines || []).reduce((s, l) => s + l.amount, 0),
      taxGroup: group,
      vat: t.regime === 'dn' ? null : null,   // hộ kê khai: tỷ lệ trên doanh thu, không tách VAT trên hoá đơn bán
      tyLe: { gtgt: rate.gtgt, tncn: rate.tncn },
      book: est.mienThue ? 'S1a' : bookOf(group),
      cqtState: SM.isOnline() ? 'sending' : 'queued',
      lapOffline: !SM.isOnline(),
    };

    // trừ kho theo lô + ghi đường truy xuất
    (inv.lines || []).forEach(l => {
      if (!l.sku || !l.qty) return;
      const c = consume(t, l.sku, l.qty);
      l.lots = c.used;
    });

    t.invoices = t.invoices || [];
    t.invoices.push(inv);
    SM.save();

    SM.enqueue('einvoice',
      `Truyền ${inv.fromPos ? 'hoá đơn từ máy tính tiền' : 'hoá đơn'} ${inv.id} sang cơ quan thuế`,
      { tenant: t.id, id: inv.id });
    return inv;
  }

  /** Đường kê khai 5 bước — làm TRỌN VẸN trên điện thoại (gỡ điểm yếu IV.4). */
  function filingSteps(t, period) {
    const est = taxEstimate(t, period);
    const b = books(t, period);
    const ps = purchaseSummary(t, period);
    const stuck = (t.invoices || []).filter(i => i.cqtState !== 'sent');
    return [
      { n: 1, ten: 'Gom số', xong: true,
        chiTiet: `${revenueLines(t, period).length} dòng doanh thu · ${SM.fmt.d(est.revenue)}` },
      { n: 2, ten: 'Định tuyến vào sổ', xong: true,
        chiTiet: `${b.S2a.rows.length} dòng vào ${b.S2a.code} · ${b.S1a.rows.length} dòng vào ${b.S1a.code}` },
      { n: 3, ten: 'Kiểm tra chéo trước khi khai',
        xong: stuck.length === 0 && ps.thieuChungTu === 0,
        canh: [].concat(
          stuck.length ? [`${stuck.length} hoá đơn chưa truyền xong sang cơ quan thuế`] : [],
          ps.thieuChungTu ? [`${ps.thieuChungTu} bảng kê thu mua còn thiếu giấy tờ`] : []),
        chiTiet: 'Hệ thống soát trước, hộ không phải tự dò' },
      { n: 4, ten: 'Mở eTax Mobile ngay trong máy để nộp', xong: false,
        chiTiet: `Số phải nộp tạm tính ${SM.fmt.d(est.total)} — người chịu trách nhiệm tự bấm nộp trên cổng của cơ quan thuế`,
        ranhGioi: true },
      { n: 5, ten: 'Chụp lại mã biên nhận, đóng sổ kỳ', xong: false,
        chiTiet: 'Nền tảng chỉ lưu mã biên nhận do hộ nhập, không thay hộ nộp' },
    ];
  }

  /* ======================== BA CỬA THANH TOÁN THEO KÍCH HOẠT (IV.7) =========
     "căn cứ thanh toán là số hộ đã cài đặt, phát hành hoá đơn đầu tiên và
     còn phát sinh giao dịch sau 90 ngày; không thanh toán theo số tài khoản
     phát ra."                                                                */

  const GATES = [
    { id: 'g1', ten: 'Đã cài đặt và kích hoạt tại cơ sở', tyLe: 30 },
    { id: 'g2', ten: 'Đã phát hành hoá đơn đầu tiên',      tyLe: 30 },
    { id: 'g3', ten: 'Còn phát sinh giao dịch sau 90 ngày', tyLe: 40 },
  ];

  /**
   * Xét ba cửa cho MỘT hộ, tính từ dữ liệu thật của hộ đó.
   * ⚠️ Cửa 2 chỉ đếm hoá đơn phát hành TỪ NGÀY KÍCH HOẠT trở đi — hoá đơn hộ
   * đã tự phát hành trước khi vào Chương trình KHÔNG được tính, nếu không thì
   * cửa 2 tự đạt sẵn và mất hết ý nghĩa làm căn cứ thanh toán.
   */
  function gatesOf(t) {
    const all = (t.invoices || []).filter(i => !i.void).sort((a, b) => a.date.localeCompare(b.date));
    const g1 = !!t.activatedAt;
    const inv = g1 ? all.filter(i => i.date >= t.activatedAt) : [];
    const g2 = inv.length > 0;
    let g3 = false, moc90 = null;
    if (g1) {
      moc90 = SM.dayOffset(t.activatedAt, 90);
      if (SM.CLOCK.today >= moc90) {
        const sau = SM.dayOffset(SM.CLOCK.today, -30);
        g3 = inv.some(i => i.date >= sau) ||
             (t.orders || []).some(o => o.date >= sau && (o.state === 'paid' || o.state === 'done'));
      }
    }
    const dat = [g1, g2, g3];
    return {
      tenant: t.id, name: t.name, diaBan: t.diaBan, nganh: t.nganh,
      activatedAt: t.activatedAt || null,
      hoaDonDauTien: inv.length ? inv[0].date : null,
      soHoaDon: inv.length,
      soHoaDonTruocChuongTrinh: all.length - inv.length,
      moc90,
      gates: GATES.map((g, i) => Object.assign({}, g, { dat: dat[i] })),
      tyLeThanhToan: GATES.reduce((s, g, i) => s + (dat[i] ? g.tyLe : 0), 0),
    };
  }

  /**
   * Đơn giá sỉ mỗi hộ mỗi năm — LẤY TỪ BẢNG GIÁ CÔNG BỐ (sm-program.js), không
   * viết cứng. Trước đây viết cứng 3,6tr khiến cổng Chương trình và trang giá
   * nói hai số khác nhau; giá theo ngành nên cũng khác nhau giữa các chân dung.
   */
  function donGiaSi(t) {
    if (SM.prog && SM.prog.tinhGia) return SM.prog.tinhGia(t.nganh).hangNam.si;
    return 0;
  }

  /** Bảng điều khiển Chương trình — CHỈ số liệu tổng hợp (IV.8 + PDPL). */
  function programBoard() {
    const rows = SM.tenantIds().map(id => {
      const t = SM.tenant(id);
      const g = gatesOf(t);
      g.donGia = donGiaSi(t);
      g.phaiTra = Math.round(g.donGia * g.tyLeThanhToan / 100);
      return g;
    });
    const tong = {
      soHo: rows.length,
      g1: rows.filter(r => r.gates[0].dat).length,
      g2: rows.filter(r => r.gates[1].dat).length,
      g3: rows.filter(r => r.gates[2].dat).length,
      soHoaDon: rows.reduce((s, r) => s + r.soHoaDon, 0),
    };
    tong.phaiTra = rows.reduce((s, r) => s + r.phaiTra, 0);
    tong.neuTinhTheoTaiKhoan = rows.reduce((s, r) => s + r.donGia, 0);
    tong.tietKiem = tong.neuTinhTheoTaiKhoan - tong.phaiTra;

    // doanh thu qua kênh số, theo địa bàn và theo ngành (đúng chữ IV.8)
    const theoDiaBan = {}, theoNganh = {};
    SM.tenantIds().forEach(id => {
      const t = SM.tenant(id);
      const digital = revenueLines(t, { from: SM.CLOCK.year + '-01-01', to: SM.CLOCK.year + '-12-31' })
        .filter(l => l.channel !== 'quay' && l.channel !== 'b2b')
        .reduce((s, l) => s + l.amount, 0);
      const all = revenueLines(t, { from: SM.CLOCK.year + '-01-01', to: SM.CLOCK.year + '-12-31' })
        .reduce((s, l) => s + l.amount, 0);
      const add = (bag, key) => {
        bag[key] = bag[key] || { key, soHo: 0, doanhThuSo: 0, doanhThu: 0, soHoaDon: 0 };
        bag[key].soHo += 1; bag[key].doanhThuSo += digital; bag[key].doanhThu += all;
        bag[key].soHoaDon += (t.invoices || []).length;
      };
      add(theoDiaBan, t.diaBan); add(theoNganh, t.nganh);
    });

    return { rows, tong, GATES,
             theoDiaBan: Object.values(theoDiaBan), theoNganh: Object.values(theoNganh) };
  }

  /** Cohort sống — II.3 "còn hoạt động sau 12–24 tháng" (dữ liệu mô phỏng chương trình). */
  function cohort() {
    const c = (SM.db().meta && SM.db().meta.cohort) || [];
    return c.map(r => Object.assign({}, r,
      { tyLe: r.batDau ? Math.round(r.conHoatDong / r.batDau * 1000) / 10 : 0 }));
  }

  /* ----------------------------------------------------------------- xuất ra */
  /* ══════════════ ĐƠN HÀNG & VẬN CHUYỂN ═══════════════════════════════════
     IV.4 gọi đích danh "theo dõi đơn hàng và vận chuyển" trong danh sách
     nghiệp vụ phải làm TRỌN VẸN trên điện thoại.
     CD1 còn đòi "phương án vận chuyển phù hợp hàng thực phẩm khô, hàng lạnh". */

  const CARRIERS = [
    { id: 'ghn',   ten: 'Giao Hàng Nhanh',      cod: true,  lanh: false, ghi: 'Nội tỉnh 1 ngày, liên tỉnh 2–3 ngày' },
    { id: 'ghtk',  ten: 'Giao Hàng Tiết Kiệm',  cod: true,  lanh: false, ghi: 'Rẻ nhất cho hàng khô nhẹ' },
    { id: 'vtp',   ten: 'Viettel Post',         cod: true,  lanh: false, ghi: 'Phủ địa bàn miền núi tốt nhất' },
    { id: 'jt',    ten: 'J&T Express',          cod: true,  lanh: false, ghi: '' },
    { id: 'lanh',  ten: 'Chuyển phát lạnh chuyên tuyến', cod: false, lanh: true, ghi: 'Bắt buộc cho hàng tươi, hàng cần giữ lạnh' },
    { id: 'tutra', ten: 'Hộ tự giao trong tỉnh', cod: true, lanh: true,  ghi: 'Giao thẳng cho nhà hàng, khách sạn trong ngày' },
  ];

  const ORDER_STATES = [
    { id: 'new',     ten: 'Mới về',        tiep: 'picking' },
    { id: 'picking', ten: 'Đang gói hàng', tiep: 'shipping' },
    { id: 'shipping',ten: 'Đang giao',     tiep: 'done' },
    { id: 'done',    ten: 'Đã giao xong',  tiep: null },
    { id: 'paid',    ten: 'Đã thu tiền',   tiep: null },
    { id: 'cancel',  ten: 'Đã huỷ',        tiep: null },
  ];

  function orderState(id) { return ORDER_STATES.find(s => s.id === id) || { id, ten: id, tiep: null }; }

  /** Cần giao lạnh không — suy từ mặt hàng trong đơn. */
  function needsCold(t, o) {
    return (o.lines || []).some(l => {
      const s = (t.skus || []).find(x => x.sku === l.sku);
      return s && s.baoQuan === 'lanh';
    });
  }

  function carriersFor(t, o) {
    const cold = needsCold(t, o);
    return CARRIERS.filter(c => cold ? c.lanh : true)
      .map(c => Object.assign({}, c, { khuyenNghi: cold ? c.lanh : (c.id === 'ghtk' || c.id === 'vtp') }));
  }

  /** Gán hãng vận chuyển + sinh mã vận đơn. Chạy được khi mất mạng (xếp hàng đợi). */
  function ship(t, orderId, carrierId) {
    const o = (t.orders || []).find(x => x.id === orderId);
    const c = CARRIERS.find(x => x.id === carrierId);
    if (!o || !c) return { ok: false, lyDo: 'Không tìm thấy đơn hoặc hãng vận chuyển' };
    o.carrier = c.id;
    o.carrierTen = c.ten;
    o.tracking = c.id.toUpperCase() + SM.CLOCK.today.slice(2, 4) + SM.CLOCK.today.slice(5, 7) +
                 SM.CLOCK.today.slice(8, 10) + String(Math.abs(hashOf(orderId)) % 9000 + 1000);
    o.shipAt = SM.CLOCK.today;
    o.state = 'shipping';
    o.cod = c.cod ? o.total : 0;
    SM.save();
    SM.enqueue('channel', 'Đẩy mã vận đơn ' + o.tracking + ' về kênh ' + ((CHANNELS[o.channel] || {}).ten || o.channel),
      { tenant: t.id, id: o.id });
    return { ok: true, order: o };
  }

  function hashOf(s) { return SM.hash(s); }

  /** Chuyển trạng thái đơn. Trả tồn về kho nếu huỷ. */
  function advanceOrder(t, orderId, to) {
    const o = (t.orders || []).find(x => x.id === orderId);
    if (!o) return { ok: false };
    if (to === 'cancel' && (o.lines || []).length) {
      (o.lines || []).forEach(l => {
        const lot = (t.lots || []).find(x => x.sku === l.sku);
        if (lot) lot.qty += l.qty;      // trả hàng về lô gần nhất
      });
    }
    o.state = to || (orderState(o.state).tiep || o.state);
    if (o.state === 'done' || o.state === 'paid') o.doneAt = SM.CLOCK.today;
    SM.save();
    SM.enqueue('channel', 'Cập nhật trạng thái đơn ' + o.id + ' → ' + orderState(o.state).ten, { tenant: t.id, id: o.id });
    return { ok: true, order: o };
  }

  /** Tạo đơn từ mẫu đơn định kỳ (CD1 — "quản lý đơn hàng định kỳ"). */
  function orderFromRecurring(t, recId) {
    const r = (t.recurring || []).find(x => x.id === recId);
    if (!r) return { ok: false, lyDo: 'Không tìm thấy mẫu' };
    const chk = checkOrder(t, r.lines || []);
    if (!chk.ok) return { ok: false, chk };
    const seq = (t.orders || []).length + 1;
    const o = {
      id: 'DH-' + SM.CLOCK.today.slice(2, 4) + SM.CLOCK.today.slice(5, 7) + '-' + String(seq).padStart(3, '0'),
      date: SM.CLOCK.today, channel: 'b2b', buyer: r.buyer, buyerMst: r.buyerMst || null,
      state: 'new', lines: (r.lines || []).slice(),
      total: (r.lines || []).reduce((s, l) => s + l.amount, 0),
      taxGroup: t.taxGroupDefault, tuMauDinhKy: r.id, synced: false,
    };
    t.orders = t.orders || [];
    t.orders.push(o);
    r.lanCuoi = SM.CLOCK.today;
    SM.save();
    return { ok: true, order: o };
  }

  /**
   * Xuất hoá đơn CHO KHÁCH TỔ CHỨC (có mã số thuế) từ một đơn hàng hoặc một
   * lượt đặt chỗ. Đây là ĐỘNG LỰC CHUYỂN ĐỔI của cả ba chân dung:
   *   CD1 nhà hàng–khách sạn · CD2 khách đoàn, công ty lữ hành · CD3 doanh nghiệp chế biến.
   */
  function invoiceForOrg(t, src, buyer) {
    const lines = (src.lines || []).slice();
    const inv = issueInvoice(t, {
      fromPos: false,
      channel: src.channel || 'b2b',
      buyer: buyer.ten,
      buyerMst: buyer.mst || null,
      buyerDiaChi: buyer.diaChi || null,
      lines: lines.length ? lines : [{ sku: null, qty: null, amount: src.total }],
      total: src.total,
      taxGroup: src.taxGroup || t.taxGroupDefault,
    });
    inv.tuDon = src.id;
    if (src.state) { src.invoiceId = inv.id; }
    // ghi công nợ nếu khách tổ chức trả sau
    if (buyer.traSau) {
      t.receivables = t.receivables || [];
      t.receivables.push({
        id: 'CN-' + String((t.receivables || []).length + 1).padStart(2, '0'),
        buyer: buyer.ten, amount: src.total,
        due: SM.dayOffset(SM.CLOCK.today, buyer.soNgay || 30),
        paid: false, note: 'Từ hoá đơn ' + inv.id,
      });
    }
    SM.save();
    return inv;
  }

  /* ══════════════ KẾT NỐI KÊNH (IV.3) ═════════════════════════════════════
     CD1 "gian hàng trên sàn" · CD2 "đưa cơ sở lên tối thiểu hai nền tảng đặt
     phòng" · CD3 "mở gian hàng trên sàn, kết nối vận chuyển, bán qua phát
     trực tiếp" — đây là VIỆC HỘ PHẢI LÀM ĐƯỢC, không phải danh sách để khoe. */

  const CONNECTORS = [
    { id: 'etax',    nhom: 'Thuế và hoá đơn', ten: 'eTax Mobile',            batBuoc: true, moTa: 'Nộp tờ khai, tra cứu nghĩa vụ' },
    { id: 'cthue',   nhom: 'Thuế và hoá đơn', ten: 'Cổng thuế điện tử',      batBuoc: true, moTa: 'Đối chiếu' },
    { id: 'hddt',    nhom: 'Thuế và hoá đơn', ten: 'Hoá đơn điện tử',        batBuoc: true, moTa: 'Gồm hoá đơn khởi tạo từ máy tính tiền' },
    { id: 'cks',     nhom: 'Thuế và hoá đơn', ten: 'Chữ ký số',              batBuoc: true, moTa: 'Ký tờ khai và hoá đơn' },
    { id: 'bank',    nhom: 'Tiền',            ten: 'Tài khoản ngân hàng',    batBuoc: true, moTa: 'Đối soát tiền về' },
    { id: 'qr',      nhom: 'Tiền',            ten: 'Thanh toán QR',          batBuoc: true, moTa: 'Nhiều điểm quét' },
    { id: 'shopee',  nhom: 'Sàn thương mại điện tử', ten: 'Shopee',          moTa: 'Đơn và tồn kho hai chiều' },
    { id: 'tiktok',  nhom: 'Sàn thương mại điện tử', ten: 'TikTok Shop',     moTa: 'Đơn, tồn kho, phát trực tiếp' },
    { id: 'lazada',  nhom: 'Sàn thương mại điện tử', ten: 'Lazada',          moTa: 'Đơn và tồn kho' },
    { id: 'ghn',     nhom: 'Vận chuyển',      ten: 'Giao Hàng Nhanh',        moTa: 'Vòng đời đơn, tiền thu hộ' },
    { id: 'ghtk',    nhom: 'Vận chuyển',      ten: 'Giao Hàng Tiết Kiệm',    moTa: '' },
    { id: 'vtp',     nhom: 'Vận chuyển',      ten: 'Viettel Post',           moTa: 'Phủ miền núi' },
    { id: 'lanh',    nhom: 'Vận chuyển',      ten: 'Chuyển phát lạnh',       moTa: 'Hàng tươi, hàng giữ lạnh', nganh: 'Đồ ăn, đồ uống và đặc sản' },
    { id: 'food',    nhom: 'App giao đồ ăn',  ten: 'ShopeeFood',             moTa: '', nganh: 'Đồ ăn, đồ uống và đặc sản' },
    { id: 'grab',    nhom: 'App giao đồ ăn',  ten: 'GrabFood',               moTa: '', nganh: 'Đồ ăn, đồ uống và đặc sản' },
    { id: 'booking', nhom: 'Nền tảng đặt phòng, đặt tour', ten: 'Booking.com', moTa: 'Lịch phòng hai chiều', nganh: 'Dịch vụ du lịch' },
    { id: 'agoda',   nhom: 'Nền tảng đặt phòng, đặt tour', ten: 'Agoda',      moTa: 'Lịch phòng hai chiều', nganh: 'Dịch vụ du lịch' },
    { id: 'travel',  nhom: 'Nền tảng đặt phòng, đặt tour', ten: 'Traveloka',  moTa: '', nganh: 'Dịch vụ du lịch' },
    { id: 'zalo',    nhom: 'Mạng xã hội bán hàng', ten: 'Zalo và Zalo OA',   batBuoc: true, moTa: 'Kênh chạm khách chính ở tỉnh' },
    { id: 'fb',      nhom: 'Mạng xã hội bán hàng', ten: 'Facebook',          moTa: '' },
    { id: 'live',    nhom: 'Mạng xã hội bán hàng', ten: 'Phát trực tiếp TikTok', moTa: 'Bán qua livestream', nganh: 'Nông sản đặc sản' },
    { id: 'ntqg',    nhom: 'Nền tảng dùng chung của Nhà nước', ten: 'Phần mềm kế toán, hoá đơn dùng chung',
      moTa: 'Theo Điều 10 Nghị định 20/2026 — chưa vận hành', chuaCo: true },
  ];

  /** Danh sách kết nối của một hộ: lọc theo ngành + trạng thái đã nối. */
  function connectors(t) {
    t.connections = t.connections || {};
    return CONNECTORS
      .filter(c => !c.nganh || c.nganh === t.nganh)
      .map(c => {
        const st = t.connections[c.id];
        const donVe = (t.orders || []).filter(o => o.channel === c.id).length;
        return Object.assign({}, c, {
          noi: st ? st.noi : !!c.batBuoc,
          tuNgay: st ? st.tuNgay : (c.batBuoc ? t.activatedAt : null),
          dongBoCuoi: st && st.noi ? SM.CLOCK.today : null,
          donVe,
        });
      });
  }

  function toggleConnector(t, id) {
    t.connections = t.connections || {};
    const cur = connectors(t).find(c => c.id === id);
    if (!cur || cur.chuaCo) return { ok: false, lyDo: 'Dịch vụ này chưa vận hành để nối' };
    const noi = !cur.noi;
    t.connections[id] = { noi, tuNgay: noi ? SM.CLOCK.today : null };
    SM.save();
    if (noi) SM.enqueue('channel', 'Nối kênh ' + cur.ten + ' và kéo dữ liệu về', { tenant: t.id, id });
    return { ok: true, noi, ten: cur.ten };
  }

  /** Đếm theo nhóm để đối chiếu danh mục tối thiểu của IV.3. */
  function connectorSummary(t) {
    const rows = connectors(t);
    const bag = {};
    rows.forEach(c => {
      bag[c.nhom] = bag[c.nhom] || { nhom: c.nhom, tong: 0, noi: 0 };
      bag[c.nhom].tong++; if (c.noi) bag[c.nhom].noi++;
    });
    const toiThieu = { 'Sàn thương mại điện tử': 3, 'Vận chuyển': 3, 'App giao đồ ăn': 1, 'Nền tảng đặt phòng, đặt tour': 2 };
    return Object.values(bag).map(g => {
      // Nhóm mà mọi dịch vụ đều CHƯA VẬN HÀNH thì không phải "đạt" — nó là "chờ".
      // Trước đây nhóm nền tảng dùng chung của Nhà nước hiện 0/1 mà vẫn xanh, gây hiểu nhầm.
      const rowsG = rows.filter(c => c.nhom === g.nhom);
      const choVanHanh = rowsG.length > 0 && rowsG.every(c => c.chuaCo);
      return Object.assign(g, {
        toiThieu: toiThieu[g.nhom] || 0,
        choVanHanh,
        dat: choVanHanh ? null : (!toiThieu[g.nhom] || g.noi >= toiThieu[g.nhom]),
      });
    });
  }

  SM.dom = {
    TAX, CHANNELS, GATES, CARRIERS, ORDER_STATES, CONNECTORS,
    orderState, needsCold, carriersFor, ship, advanceOrder, orderFromRecurring, invoiceForOrg,
    connectors, toggleConnector, connectorSummary,
    periodRange, revenueLines, taxEstimate, books, bookOf, needsPosInvoice, deadlines, costOfPeriod,
    stock, stockAll, checkOrder, consume, laDichVu,
    addPurchase, checkPurchase, purchaseSummary, trace,
    resource, used, checkBooking, addBooking, calendar, seasonality, qrPoints,
    issueInvoice, filingSteps,
    gatesOf, programBoard, cohort,
  };
})(window);

/* ═══════════════════════════════════════════════════════════════════════════
   ĐỢT 2 — NGHIỆP VỤ HẰNG NGÀY CÒN HỞ (bổ sung 18/08/2026)
   Soát theo nguyên tắc "mọi đầu vào/ra phải lộ cơ chế": năm việc hộ làm thật
   mỗi ngày mà mockup chưa có chỗ làm.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  const SM = global.SM, D = SM.dom;

  /* ───────── 1. DANH MỤC HÀNG HOÁ — hộ tự thêm, sửa, đổi giá theo mùa ───── */

  const NHOM_THUE_CHON = [
    { id: 'phanPhoi', ten: 'Phân phối, cung cấp hàng hoá' },
    { id: 'sanXuat',  ten: 'Sản xuất, vận tải, dịch vụ có gắn với hàng hoá' },
    { id: 'dichVu',   ten: 'Dịch vụ, xây dựng không bao thầu nguyên vật liệu' },
    { id: 'khac',     ten: 'Hoạt động kinh doanh khác' },
  ];

  /** Thêm mới hoặc sửa một mặt hàng. Đổi giá thì ghi lại lịch sử để giải trình. */
  function upsertSku(t, m) {
    t.skus = t.skus || [];
    const ma = String(m.sku || '').trim().toUpperCase();
    if (!ma) return { ok: false, lyDo: 'Thiếu mã hàng' };
    if (!String(m.name || '').trim()) return { ok: false, lyDo: 'Thiếu tên hàng' };
    if (!(m.price > 0)) return { ok: false, lyDo: 'Giá bán phải lớn hơn 0' };

    const cu = t.skus.find(s => s.sku === ma);
    if (!cu) {
      t.skus.push({ sku: ma, name: m.name.trim(), unit: m.unit || 'cái', price: m.price,
                    taxGroup: m.taxGroup || t.taxGroupDefault || 'phanPhoi',
                    baoQuan: m.baoQuan || null, lichSuGia: [{ ngay: SM.CLOCK.today, gia: m.price }] });
      SM.save();
      return { ok: true, moi: true, sku: ma };
    }
    if (cu.price !== m.price) {
      cu.lichSuGia = cu.lichSuGia || [{ ngay: cu.ngayTao || SM.CLOCK.today, gia: cu.price }];
      cu.lichSuGia.push({ ngay: SM.CLOCK.today, gia: m.price, truoc: cu.price });
    }
    cu.name = m.name.trim(); cu.unit = m.unit || cu.unit; cu.price = m.price;
    cu.taxGroup = m.taxGroup || cu.taxGroup; cu.baoQuan = m.baoQuan || null;
    SM.save();
    return { ok: true, moi: false, sku: ma, doiGia: cu.lichSuGia.length > 1 };
  }

  /** Xoá mặt hàng — CHẶN nếu còn tồn hoặc đã từng bán, vì xoá là mất dấu vết. */
  function deleteSku(t, sku) {
    const conTon = (t.lots || []).some(l => l.sku === sku && l.qty > 0);
    const daBan = (t.orders || []).some(o => (o.lines || []).some(l => l.sku === sku)) ||
                  (t.invoices || []).some(i => (i.lines || []).some(l => l.sku === sku));
    if (conTon) return { ok: false, lyDo: 'Mặt hàng còn tồn kho — nhập bằng 0 trước khi xoá' };
    if (daBan) return { ok: false, lyDo: 'Mặt hàng đã từng bán, xoá sẽ mất dấu vết sổ sách. Chỉ nên ngừng bán.' };
    t.skus = (t.skus || []).filter(s => s.sku !== sku);
    SM.save();
    return { ok: true };
  }

  /* ───────── 2. NHẬP KHO — ghi mẻ chế biến, hàng mua về, kiểm kê ───────── */

  const NGUON_NHAP = [
    { id: 'che-bien', ten: 'Mẻ tự chế biến', moTa: 'Phơi, sấy, ủ, đóng gói xong một mẻ' },
    { id: 'mua-ngoai', ten: 'Mua của nhà cung cấp', moTa: 'Có hoá đơn đầu vào' },
    { id: 'thu-mua', ten: 'Thu mua của dân', moTa: 'Lập bảng kê ở màn Thu mua' },
    { id: 'tra-lai', ten: 'Khách trả lại', moTa: 'Hàng hoàn về kho' },
  ];

  /** Nhập kho tạo MỘT LÔ MỚI — giữ nguyên đường truy xuất. */
  function nhapKho(t, m) {
    const sku = (t.skus || []).find(s => s.sku === m.sku);
    if (!sku) return { ok: false, lyDo: 'Không có mặt hàng này trong danh mục' };
    if (!(m.qty > 0)) return { ok: false, lyDo: 'Số lượng phải lớn hơn 0' };
    const ng = NGUON_NHAP.find(n => n.id === m.nguon) || NGUON_NHAP[0];
    t.lots = t.lots || [];
    const seq = (t.lots || []).length + 1;
    const lot = {
      id: 'L' + SM.CLOCK.today.replace(/-/g, '').slice(2) + '-' + sku.sku + '-' + String(seq).padStart(2, '0'),
      sku: sku.sku, qty: m.qty, unit: sku.unit, inDate: m.ngay || SM.CLOCK.today,
      hanDung: m.hanDung || null,
      origin: { seller: m.ghiChu || ng.ten, loaiNguon: ng.id, nhaCungCap: m.nhaCungCap || null },
    };
    t.lots.push(lot);
    SM.save();
    SM.enqueue('report', 'Đẩy phiếu nhập kho ' + lot.id + ' vào sổ', { tenant: t.id, id: lot.id });
    return { ok: true, lot };
  }

  /** Kiểm kê: đếm thực tế lệch sổ thì điều chỉnh, BẮT BUỘC ghi lý do. */
  function kiemKe(t, sku, soThuc, lyDo) {
    const st = D.stock(t, sku);
    const lech = soThuc - st.onHand;
    if (!lyDo || !String(lyDo).trim()) return { ok: false, lyDo: 'Phải ghi lý do lệch — đây là điều chỉnh sổ sách' };
    if (lech === 0) return { ok: true, lech: 0, ghiChu: 'Khớp sổ, không phải điều chỉnh' };
    t.lots = t.lots || [];
    if (lech > 0) {
      t.lots.push({ id: 'KK' + SM.CLOCK.today.replace(/-/g, '').slice(2) + '-' + sku, sku, qty: lech,
                    unit: (t.skus.find(s => s.sku === sku) || {}).unit, inDate: SM.CLOCK.today,
                    origin: { seller: 'Điều chỉnh kiểm kê: ' + lyDo, loaiNguon: 'kiem-ke' } });
    } else {
      D.consume(t, sku, -lech);
    }
    t.kiemKeLog = t.kiemKeLog || [];
    t.kiemKeLog.push({ ngay: SM.CLOCK.today, sku, soSo: st.onHand, soThuc, lech, lyDo });
    SM.save();
    return { ok: true, lech, soSo: st.onHand, soThuc };
  }

  /* ───────── 3. KHOẢN CHI — hộ chi tiền thật mỗi ngày ───────── */

  const LOAI_CHI = [
    { id: 'bao-bi',    ten: 'Bao bì, nhãn mác' },
    { id: 'van-chuyen',ten: 'Vận chuyển, xăng xe' },
    { id: 'dien-nuoc', ten: 'Điện, nước, internet' },
    { id: 'mat-bang',  ten: 'Thuê mặt bằng' },
    { id: 'nhan-cong', ten: 'Thuê nhân công' },
    { id: 'thiet-bi',  ten: 'Mua sắm thiết bị, sửa chữa' },
    { id: 'nguyen-lieu', ten: 'Nguyên liệu, vật tư' },
    { id: 'khac',      ten: 'Chi khác' },
  ];

  /**
   * Ghi một khoản chi. `chungTu` là điểm mấu chốt: chi KHÔNG có chứng từ thì khi
   * hộ lên doanh nghiệp sẽ không được tính vào chi phí hợp lệ — phải cảnh báo sớm.
   */
  function addChi(t, m) {
    if (!(m.soTien > 0)) return { ok: false, lyDo: 'Số tiền phải lớn hơn 0' };
    if (!String(m.moTa || '').trim()) return { ok: false, lyDo: 'Ghi rõ chi vào việc gì' };
    t.expenses = t.expenses || [];
    const rec = {
      id: 'CHI-' + SM.CLOCK.today.slice(5, 7) + SM.CLOCK.today.slice(8, 10) + '-' + String(t.expenses.length + 1).padStart(2, '0'),
      date: m.ngay || SM.CLOCK.today,
      loai: m.loai || 'khac',
      moTa: m.moTa.trim(),
      soTien: m.soTien,
      chungTu: m.chungTu || 'khong',      // 'hoa-don' | 'phieu-chi' | 'khong'
      nhaCungCap: m.nhaCungCap || null,
      viCaNhan: !!m.viCaNhan,             // trả bằng tiền túi → cảnh báo trộn ví
    };
    t.expenses.push(rec);
    SM.save();
    return { ok: true, rec };
  }

  function chiSummary(t, period) {
    const r = D.periodRange(period);
    const rows = (t.expenses || []).filter(e => e.date >= r.from && e.date <= r.to);
    const theoLoai = {};
    rows.forEach(e => {
      const k = e.loai;
      theoLoai[k] = theoLoai[k] || { loai: k, ten: (LOAI_CHI.find(x => x.id === k) || {}).ten || k, soTien: 0, soLuot: 0 };
      theoLoai[k].soTien += e.soTien; theoLoai[k].soLuot += 1;
    });
    const khongChungTu = rows.filter(e => e.chungTu === 'khong');
    const traViCaNhan = rows.filter(e => e.viCaNhan);
    return {
      rows, tong: rows.reduce((s, e) => s + e.soTien, 0), soLuot: rows.length,
      theoLoai: Object.values(theoLoai).sort((a, b) => b.soTien - a.soTien),
      khongChungTu, tienKhongChungTu: khongChungTu.reduce((s, e) => s + e.soTien, 0),
      traViCaNhan, tienViCaNhan: traViCaNhan.reduce((s, e) => s + e.soTien, 0),
    };
  }

  /* ───────── 4. KHÁCH HÀNG — gom từ hoá đơn, đơn, công nợ, lượt đặt ───── */

  function customers(t) {
    const bag = {};
    const cham = (ten, o) => {
      if (!ten) return;
      bag[ten] = bag[ten] || { ten, mst: null, toChuc: false, tongMua: 0, soLan: 0,
                               lanDau: null, lanCuoi: null, conNo: 0, kenh: {} };
      const c = bag[ten];
      if (o.mst) { c.mst = o.mst; c.toChuc = true; }
      if (o.tien) { c.tongMua += o.tien; c.soLan += 1; }
      if (o.ngay) {
        if (!c.lanDau || o.ngay < c.lanDau) c.lanDau = o.ngay;
        if (!c.lanCuoi || o.ngay > c.lanCuoi) c.lanCuoi = o.ngay;
      }
      if (o.kenh) c.kenh[o.kenh] = (c.kenh[o.kenh] || 0) + 1;
    };
    (t.invoices || []).forEach(i => cham(i.buyer, { mst: i.buyerMst, tien: i.total, ngay: i.date, kenh: i.channel }));
    (t.orders || []).forEach(o => { if (!o.invoiceId) cham(o.buyer, { tien: o.total, ngay: o.date, kenh: o.channel }); });
    (t.bookings || []).forEach(b => cham(b.guest, { tien: b.total, ngay: b.date, kenh: b.channel }));
    (t.receivables || []).forEach(r => { if (!r.paid) { cham(r.buyer, {}); bag[r.buyer].conNo += r.amount; } });
    return Object.values(bag)
      .map(c => Object.assign(c, { kenhChinh: Object.keys(c.kenh).sort((a, b) => c.kenh[b] - c.kenh[a])[0] || null }))
      .sort((a, b) => b.tongMua - a.tongMua);
  }

  function customerDetail(t, ten) {
    const c = customers(t).find(x => x.ten === ten);
    if (!c) return null;
    return Object.assign({}, c, {
      hoaDon: (t.invoices || []).filter(i => i.buyer === ten).sort((a, b) => b.date.localeCompare(a.date)),
      don: (t.orders || []).filter(o => o.buyer === ten).sort((a, b) => b.date.localeCompare(a.date)),
      datCho: (t.bookings || []).filter(b => b.guest === ten),
      congNo: (t.receivables || []).filter(r => r.buyer === ten && !r.paid),
      dinhKy: (t.recurring || []).filter(r => r.buyer === ten),
    });
  }

  /* ───────── 5. HỘI THOẠI VỚI KHÁCH ───────── */

  function messages(t) {
    return (t.messages || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }

  /** Trợ lý soạn sẵn câu trả lời — TÍNH TỪ DỮ LIỆU THẬT, không phải câu mẫu. */
  function goiYTraLoi(t, msg) {
    const n = String(msg.noiDung || '').toLowerCase();
    if ((t.resources || []).length && /cano|thuyen|thuyền|cho|chỗ|tour|phong|phòng/.test(n)) {
      const r = SM.ai.afterHoursReply(t, { date: SM.dayOffset(SM.CLOCK.today, 1) });
      return { than: r ? r.than : '', tinhTu: 'Lịch tài nguyên ngày mai, đếm chỗ còn trống theo từng khung.' };
    }
    if (/ship|giao|van chuyen|vận chuyển|may ngay|mấy ngày/.test(n)) {
      const cs = D.CARRIERS.filter(c => !c.lanh);
      return { than: 'Dạ bên em gửi qua ' + cs.slice(0, 2).map(c => c.ten).join(' hoặc ') +
        '. ' + (cs[0].ghi || '') + '. Anh chị cho em địa chỉ để em báo phí chính xác ạ.',
        tinhTu: 'Danh sách đơn vị vận chuyển đang nối trong mục Kết nối kênh.' };
    }
    if (/gia|giá|bao nhieu|bao nhiêu/.test(n)) {
      const st = D.stockAll(t).filter(s => s.available > 0).slice(0, 3);
      return { than: 'Dạ giá bên em: ' + st.map(s => s.meta.name + ' ' + SM.fmt.d(s.meta.price) + '/' + s.meta.unit).join(', ') +
        '. Anh chị lấy số lượng nhiều em báo giá riêng ạ.',
        tinhTu: 'Bảng giá trong danh mục hàng hoá và số tồn còn nhận được.' };
    }
    return { than: 'Dạ em cảm ơn anh chị đã nhắn. Em xem lại rồi trả lời anh chị ngay ạ.',
             tinhTu: 'Không khớp mẫu nào — trợ lý chỉ chào, không tự bịa thông tin.' };
  }

  function replyMessage(t, id, noiDung) {
    const m = (t.messages || []).find(x => x.id === id);
    if (!m) return { ok: false, lyDo: 'Không tìm thấy tin nhắn' };
    if (!String(noiDung || '').trim()) return { ok: false, lyDo: 'Chưa nhập nội dung trả lời' };
    m.daTraLoi = true; m.traLoi = noiDung.trim(); m.traLoiLuc = SM.CLOCK.today;
    SM.save();
    SM.enqueue('channel', 'Gửi trả lời cho ' + m.tu + ' qua ' + ((D.CHANNELS[m.kenh] || {}).ten || m.kenh), { tenant: t.id, id });
    return { ok: true, msg: m };
  }

  Object.assign(D, {
    NHOM_THUE_CHON, NGUON_NHAP, LOAI_CHI,
    upsertSku, deleteSku, nhapKho, kiemKe,
    addChi, chiSummary, customers, customerDetail,
    messages, goiYTraLoi, replyMessage,
  });
})(window);
