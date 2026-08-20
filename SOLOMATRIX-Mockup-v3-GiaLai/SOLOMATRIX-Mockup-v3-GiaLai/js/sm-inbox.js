/**
 * sm-inbox.js — ĐƯỜNG ĐI CỦA DỮ LIỆU TỪ BÊN NGOÀI VÀO.
 *
 * Vì sao có file này: mockup trước đó bắt CHÍNH HỘ gõ tay một đơn giả để "thử
 * nhận đơn từ kênh khác". Đời thực ngược lại — khách đặt trên sàn, đơn CHẢY VÀO,
 * hộ chỉ nhận. Mọi dữ liệu vào/ra phải trả lời được: ai gửi · qua đường nào ·
 * nội dung thô ra sao · tạo ra cái gì.
 *
 * Ba webhook đã định nghĩa từ bản v2 (`docs/API-CONTRACT.md` mục 6) nay được
 * hiện lên giao diện: SePay (tiền vào) · sàn TMĐT (đơn mới) · hãng vận chuyển.
 *
 * KHÔNG chứa giao diện — giao diện ở mobile.html và web.html.
 */
(function (global) {
  'use strict';
  const SM = global.SM;
  if (!SM || !SM.dom) throw new Error('sm-inbox.js cần sm-core.js và sm-domain.js');
  const D = SM.dom;

  /* ═══════════════ NGUỒN BÊN NGOÀI ═══════════════ */

  const NGUON = {
    shopee:  { ten: 'Shopee',            loai: 'Sàn thương mại điện tử', kenh: 'webhook', endpoint: 'POST /webhooks/ecommerce/orders' },
    tiktok:  { ten: 'TikTok Shop',       loai: 'Sàn thương mại điện tử', kenh: 'webhook', endpoint: 'POST /webhooks/ecommerce/orders' },
    lazada:  { ten: 'Lazada',            loai: 'Sàn thương mại điện tử', kenh: 'webhook', endpoint: 'POST /webhooks/ecommerce/orders' },
    food:    { ten: 'ShopeeFood',        loai: 'App giao đồ ăn',         kenh: 'webhook', endpoint: 'POST /webhooks/food/orders' },
    booking: { ten: 'Booking.com',       loai: 'Nền tảng đặt phòng',     kenh: 'webhook', endpoint: 'POST /webhooks/booking/reservations' },
    zalo:    { ten: 'Zalo OA',           loai: 'Kênh chạm khách',        kenh: 'webhook', endpoint: 'POST /webhooks/zalo/messages' },
    sepay:   { ten: 'SePay — ngân hàng', loai: 'Dòng tiền',              kenh: 'webhook', endpoint: 'POST /webhooks/sepay' },
    ghn:     { ten: 'Giao Hàng Nhanh',   loai: 'Vận chuyển',             kenh: 'webhook', endpoint: 'POST /webhooks/shipping/ghn' },
    vtp:     { ten: 'Viettel Post',      loai: 'Vận chuyển',             kenh: 'webhook', endpoint: 'POST /webhooks/shipping/vtp' },
    cqt:     { ten: 'Cơ quan thuế',      loai: 'Tuân thủ',               kenh: 'trả lời đồng bộ', endpoint: 'phản hồi cho POST /einvoice/issue' },
  };

  const KEY = SM.NS + 'inbox';

  function all() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function saveAll(v) { localStorage.setItem(KEY, JSON.stringify(v)); SM.emit('inbox:change', { chuaDoc: unread() }); }

  function list(tenantId) {
    const t = tenantId || SM.current().id;
    return all().filter(e => e.tenant === t).sort((a, b) => b.luc.localeCompare(a.luc));
  }
  function unread(tenantId) {
    const t = tenantId || SM.current().id;
    return all().filter(e => e.tenant === t && e.trangThai === 'moi').length;
  }
  function get(id) { return all().find(e => e.id === id) || null; }

  /** Ghi một sự kiện ĐẾN vào sổ. Chưa xử lý — chờ hộ xác nhận hoặc tự động. */
  function push(tenantId, ev) {
    const l = all();
    const rec = {
      id: 'EV' + String(l.length + 1).padStart(4, '0'),
      tenant: tenantId,
      luc: new Date().toISOString(),
      nguonId: ev.nguonId,
      loaiSuKien: ev.loaiSuKien,
      tieuDe: ev.tieuDe,
      payload: ev.payload,
      trangThai: 'moi',
      taoRa: null,
      tuDong: !!ev.tuDong,
    };
    l.push(rec);
    saveAll(l);
    return rec;
  }

  /* ═══════════════ XỬ LÝ SỰ KIỆN — sinh ra dữ liệu nghiệp vụ thật ═══════════
     Đây là chỗ "tạo ra cái gì" trở thành thật: đơn vào bảng đơn, tiền vào bảng
     thanh toán, lượt đặt vào lịch — và tồn kho tụt thật.                      */

  function process(evId) {
    const l = all();
    const e = l.find(x => x.id === evId);
    if (!e) return { ok: false, lyDo: 'Không tìm thấy sự kiện' };
    if (e.trangThai === 'da-xu-ly') return { ok: false, lyDo: 'Sự kiện này đã xử lý rồi' };
    const t = SM.tenant(e.tenant);
    if (!t) return { ok: false, lyDo: 'Không tìm thấy hộ' };

    const p = e.payload;
    let taoRa = null, loi = null;

    if (e.loaiSuKien === 'don-moi') {
      const lines = (p.items || []).map(it => ({ sku: it.sku, qty: it.qty, amount: it.qty * it.donGia }));
      const chk = D.checkOrder(t, lines);
      if (!chk.ok) {
        // Không đủ hàng: KHÔNG nhận đơn, ghi lỗi để hộ xử lý với sàn.
        e.trangThai = 'loi';
        e.ghiChu = 'Không đủ hàng: ' + chk.viPham.map(v => v.name + ' xin ' + v.xin + ' còn ' + v.con).join('; ');
        saveAll(l);
        return { ok: false, lyDo: e.ghiChu, viPham: chk.viPham };
      }
      t.orders = t.orders || [];
      const o = {
        id: p.maDon,
        date: SM.CLOCK.today,
        channel: e.nguonId,
        buyer: p.khach,
        diaChi: p.diaChi || null,
        state: 'new',
        lines,
        total: lines.reduce((s, x) => s + x.amount, 0),
        taxGroup: t.taxGroupDefault,
        tuSuKien: e.id,
        synced: true,
      };
      t.orders.push(o);
      SM.save();
      taoRa = { loai: 'don', id: o.id, moTa: 'Đơn hàng mới, đã giữ chỗ tồn kho' };
    }

    else if (e.loaiSuKien === 'tien-ve') {
      t.payments = t.payments || [];
      t.payments.push({ date: SM.CLOCK.today, point: p.diemQuet || (t.qrPoints || [{ id: 'q1' }])[0].id,
                        amount: p.soTien, method: 'QR', noiDung: p.noiDung, tuSuKien: e.id });
      // khớp đơn nếu nội dung chuyển khoản có mã đơn
      let khop = null;
      (t.orders || []).forEach(o => { if (p.noiDung && p.noiDung.indexOf(o.id) >= 0) khop = o; });
      if (khop) { khop.state = 'paid'; khop.paidAt = SM.CLOCK.today; }
      SM.save();
      taoRa = { loai: 'thanh-toan', id: p.maGiaoDich,
                moTa: khop ? ('Đã khớp và đánh dấu đã thu tiền cho đơn ' + khop.id) : 'Ghi nhận tiền về, chưa khớp đơn nào' };
    }

    else if (e.loaiSuKien === 'dat-cho') {
      const r = D.addBooking(t, { date: p.ngay, slot: p.khungGio || null, resource: p.taiNguyen,
                                  pax: p.soKhach, guest: p.khach, phone: p.dienThoai || '',
                                  combo: p.goi || null, total: p.soTien || 0, channel: e.nguonId });
      if (!r.ok) {
        e.trangThai = 'loi';
        e.ghiChu = 'Không giữ được chỗ: ' + r.chk.lyDo;
        saveAll(l);
        return { ok: false, lyDo: e.ghiChu, chk: r.chk };
      }
      taoRa = { loai: 'dat-cho', id: r.rec.id, moTa: 'Đã giữ chỗ, lịch tập trung cập nhật ngay' };
    }

    else if (e.loaiSuKien === 'van-don') {
      const o = (t.orders || []).find(x => x.tracking === p.maVanDon);
      if (!o) { e.trangThai = 'loi'; e.ghiChu = 'Không tìm thấy đơn có mã vận đơn ' + p.maVanDon; saveAll(l); return { ok: false, lyDo: e.ghiChu }; }
      o.trangThaiVanChuyen = p.trangThai;
      if (p.trangThai === 'da-giao') {
        o.state = 'done'; o.doneAt = SM.CLOCK.today;
        if (o.cod) { t.payments = t.payments || [];
          t.payments.push({ date: SM.CLOCK.today, point: (t.qrPoints || [{ id: 'q1' }])[0].id,
                            amount: o.cod, method: 'Tiền thu hộ', noiDung: 'COD đơn ' + o.id, tuSuKien: e.id }); }
      }
      SM.save();
      taoRa = { loai: 'don', id: o.id,
                moTa: p.trangThai === 'da-giao' ? ('Đơn chuyển sang đã giao xong' + (o.cod ? ', tiền thu hộ đã về' : '')) : 'Cập nhật trạng thái vận chuyển' };
    }

    else if (e.loaiSuKien === 'tin-nhan') {
      t.messages = t.messages || [];
      t.messages.push({ id: 'TN' + ((t.messages || []).length + 1), date: SM.CLOCK.today,
                        tu: p.khach, noiDung: p.noiDung, kenh: e.nguonId, tuSuKien: e.id, daTraLoi: false });
      SM.save();
      taoRa = { loai: 'tin-nhan', id: 'TN' + (t.messages.length), moTa: 'Vào hộp hội thoại, trợ lý soạn sẵn câu trả lời' };
    }

    else if (e.loaiSuKien === 'phan-hoi-thue') {
      const inv = (t.invoices || []).find(x => x.id === p.maHoaDon);
      if (!inv) { e.trangThai = 'loi'; e.ghiChu = 'Không tìm thấy hoá đơn ' + p.maHoaDon; saveAll(l); return { ok: false, lyDo: e.ghiChu }; }
      if (p.ketQua === 'chap-nhan') { inv.cqtState = 'sent'; inv.cqtCode = p.maCoQuanThue; }
      else { inv.cqtState = 'error'; inv.cqtLoi = p.lyDo; }
      SM.save();
      taoRa = { loai: 'hoa-don', id: inv.id,
                moTa: p.ketQua === 'chap-nhan' ? ('Cơ quan thuế chấp nhận, cấp mã ' + p.maCoQuanThue) : ('Bị từ chối: ' + p.lyDo) };
    }

    else { loi = 'Chưa hỗ trợ loại sự kiện ' + e.loaiSuKien; }

    if (loi) { e.trangThai = 'loi'; e.ghiChu = loi; saveAll(l); return { ok: false, lyDo: loi }; }
    e.trangThai = 'da-xu-ly';
    e.taoRa = taoRa;
    e.xuLyLuc = new Date().toISOString();
    saveAll(l);
    return { ok: true, taoRa, suKien: e };
  }

  /* ═══════════════ GIẢ LẬP SỰ KIỆN BÊN NGOÀI ═══════════════
     Nút cho người chấm TỰ BẤM để thấy dữ liệu đến từ ngoài, thay vì bắt hộ gõ tay.
     Mỗi kịch bản dựng payload đúng hình dạng webhook thật.                     */

  function seq(t, pre) { return pre + SM.CLOCK.today.slice(2, 4) + SM.CLOCK.today.slice(5, 7) + SM.CLOCK.today.slice(8, 10) + '-' + String(((t.orders || []).length + all().length + 1)).padStart(3, '0'); }

  const KICH_BAN = [
    { id: 'sanTMDT', ten: 'Khách đặt hàng trên sàn thương mại điện tử', nguonId: 'shopee',
      moTa: 'Sàn đẩy đơn mới về qua webhook. Hệ thống kiểm tồn rồi mới nhận.',
      apDung: t => (t.skus || []).length > 0,
      dung: t => {
        const st = D.stockAll(t).filter(s => s.available > 0);
        const s = st.length ? st[0] : null;
        if (!s) return null;
        const qty = Math.min(2, s.available);
        return { loaiSuKien: 'don-moi', tieuDe: 'Đơn mới từ Shopee — ' + s.meta.name + ' ×' + qty,
          payload: { maDon: seq(t, 'SPE-'), khach: 'Chị Lan (Hà Nội)', diaChi: 'Quận Cầu Giấy, Hà Nội',
                     items: [{ sku: s.sku, ten: s.meta.name, qty, donGia: s.meta.price }],
                     phiVanChuyen: 30000, hinhThucThanhToan: 'Đã thanh toán trên sàn' } };
      } },

    { id: 'sanQuaTon', ten: 'Khách đặt VƯỢT số hàng còn lại', nguonId: 'tiktok',
      moTa: 'Cùng đường webhook, nhưng số lượng vượt tồn khả dụng. Hệ thống PHẢI từ chối.',
      apDung: t => (t.skus || []).length > 0,
      dung: t => {
        const st = D.stockAll(t).filter(s => s.meta);
        const s = st.sort((a, b) => a.available - b.available)[0];
        return { loaiSuKien: 'don-moi', tieuDe: 'Đơn từ TikTok Shop — ' + s.meta.name + ' ×' + (s.available + 5) + ' (vượt tồn)',
          payload: { maDon: seq(t, 'TTS-'), khach: 'Anh Khoa (Bình Dương)',
                     items: [{ sku: s.sku, ten: s.meta.name, qty: s.available + 5, donGia: s.meta.price }] } };
      } },

    { id: 'tienVe', ten: 'Tiền về tài khoản ngân hàng', nguonId: 'sepay',
      moTa: 'Ngân hàng báo có qua SePay. Hệ thống tự khớp với đơn nếu nội dung chuyển khoản có mã đơn.',
      apDung: () => true,
      dung: t => {
        const cho = (t.orders || []).filter(o => o.state === 'new' || o.state === 'picking');
        const o = cho.length ? cho[cho.length - 1] : null;
        return { loaiSuKien: 'tien-ve', tieuDe: o ? ('Tiền về ' + SM.fmt.d(o.total) + ' — nội dung có mã ' + o.id) : 'Tiền về 500.000đ — khách lẻ',
          payload: { maGiaoDich: 'SP' + Math.abs(SM.hash(SM.CLOCK.today + (o ? o.id : 'x'))) % 900000,
                     soTien: o ? o.total : 500000, taiKhoan: '8610110816',
                     noiDung: o ? ('CK ' + o.id + ' thanh toan don hang') : 'CK khach le',
                     diemQuet: (t.qrPoints || [{ id: 'q1' }])[0].id, luc: SM.CLOCK.today + 'T10:24:00' } };
      } },

    { id: 'datPhong', ten: 'Khách đặt phòng qua nền tảng đặt phòng', nguonId: 'booking',
      moTa: 'Nền tảng đẩy lượt đặt về. Hệ thống kiểm lịch, trùng thì từ chối ngay.',
      apDung: t => (t.resources || []).length > 0,
      dung: t => {
        const phong = (t.resources || []).filter(r => r.kind === 'room');
        const r = phong.length ? phong[phong.length - 1] : (t.resources || [])[0];
        return { loaiSuKien: 'dat-cho', tieuDe: 'Đặt phòng từ Booking.com — ' + r.ten + ' đêm 19/08',
          payload: { maDat: seq(t, 'BKG-'), khach: 'Nguyen Van Hai', dienThoai: '0913xxx777',
                     taiNguyen: r.id, ngay: SM.dayOffset(SM.CLOCK.today, 2), soKhach: 2,
                     soTien: 550000, hoaHongSan: 82500 } };
      } },

    { id: 'datTrung', ten: 'Khách đặt TRÙNG chuyến đã đầy', nguonId: 'booking',
      moTa: 'Cùng đường webhook. Chuyến đã kín chỗ nên hệ thống từ chối, không nhận bừa rồi vỡ lịch.',
      apDung: t => (t.resources || []).some(r => r.kind === 'boat'),
      dung: t => {
        const b = (t.resources || []).find(r => r.kind === 'boat');
        return { loaiSuKien: 'dat-cho', tieuDe: 'Đặt tour từ Booking.com — ' + b.ten + ' khung 07:30 ngày 18/08',
          payload: { maDat: seq(t, 'BKG-'), khach: 'Doan khach 6 nguoi', taiNguyen: b.id,
                     ngay: '2026-08-18', khungGio: '07:30', soKhach: 6, soTien: 2100000 } };
      } },

    { id: 'daGiao', ten: 'Hãng vận chuyển báo đã giao hàng', nguonId: 'ghn',
      moTa: 'Hãng đẩy trạng thái về. Đơn chuyển sang đã giao, tiền thu hộ ghi nhận luôn.',
      apDung: t => (t.orders || []).some(o => o.tracking),
      dung: t => {
        const o = (t.orders || []).filter(x => x.tracking && x.state === 'shipping').pop() ||
                  (t.orders || []).filter(x => x.tracking).pop();
        return { loaiSuKien: 'van-don', tieuDe: 'Đã giao thành công — vận đơn ' + o.tracking,
          payload: { maVanDon: o.tracking, trangThai: 'da-giao', luc: SM.CLOCK.today + 'T15:40:00',
                     nguoiNhan: o.buyer, tienThuHo: o.cod || 0 } };
      } },

    { id: 'khachHoi', ten: 'Khách nhắn tin hỏi ngoài giờ', nguonId: 'zalo',
      moTa: 'Zalo OA đẩy tin nhắn về lúc 22 giờ. Trợ lý soạn sẵn câu trả lời từ dữ liệu thật.',
      apDung: () => true,
      dung: t => ({ loaiSuKien: 'tin-nhan', tieuDe: 'Tin nhắn Zalo lúc 22:14',
        payload: { khach: 'Chi Ngoc', maNguoiDung: 'zoa_88213', luc: SM.CLOCK.today + 'T22:14:00',
                   noiDung: (t.resources || []).length ? 'Mai ben minh con cho di cano khong em' : 'Ship ve Ha Noi mat may ngay v em' } }) },

    { id: 'thueTraLoi', ten: 'Cơ quan thuế phản hồi hoá đơn', nguonId: 'cqt',
      moTa: 'Sau khi truyền hoá đơn, cơ quan thuế trả kết quả. Chấp nhận thì cấp mã, từ chối thì báo lý do.',
      apDung: t => (t.invoices || []).length > 0,
      dung: t => {
        const inv = (t.invoices || [])[(t.invoices || []).length - 1];
        return { loaiSuKien: 'phan-hoi-thue', tieuDe: 'Cơ quan thuế chấp nhận hoá đơn ' + inv.id,
          payload: { maHoaDon: inv.id, ketQua: 'chap-nhan',
                     maCoQuanThue: 'M' + SM.CLOCK.year + '-' + (Math.abs(SM.hash(inv.id)) % 900000 + 100000),
                     luc: SM.CLOCK.today + 'T09:12:00' } };
      } },

    { id: 'thueTuChoi', ten: 'Cơ quan thuế TỪ CHỐI hoá đơn', nguonId: 'cqt',
      moTa: 'Trường hợp hỏng: mã số thuế người mua sai. Hộ phải sửa và truyền lại.',
      apDung: t => (t.invoices || []).length > 0,
      dung: t => {
        const inv = (t.invoices || [])[(t.invoices || []).length - 1];
        return { loaiSuKien: 'phan-hoi-thue', tieuDe: 'Cơ quan thuế từ chối hoá đơn ' + inv.id,
          payload: { maHoaDon: inv.id, ketQua: 'tu-choi',
                     lyDo: 'Mã số thuế người mua không tồn tại trên hệ thống', luc: SM.CLOCK.today + 'T09:12:00' } };
      } },
  ];

  /** Kịch bản áp dụng được cho hộ đang chọn. */
  function scenarios(t) {
    const ten = t || SM.current();
    return KICH_BAN.filter(k => k.apDung(ten)).map(k => ({ id: k.id, ten: k.ten, moTa: k.moTa,
      nguonId: k.nguonId, nguon: NGUON[k.nguonId] }));
  }

  /**
   * Bấm nút giả lập: dựng payload đúng hình dạng webhook rồi ĐẨY VÀO hộp thư đến.
   * Nếu đang mất mạng thì sự kiện vẫn vào sổ nhưng ghi rõ là nhận được khi có mạng lại.
   */
  function simulate(kichBanId, tenantId) {
    const t = tenantId ? SM.tenant(tenantId) : SM.current();
    const k = KICH_BAN.find(x => x.id === kichBanId);
    if (!k) return { ok: false, lyDo: 'Không có kịch bản này' };
    if (!k.apDung(t)) return { ok: false, lyDo: 'Kịch bản này không áp dụng cho hộ đang chọn' };
    const built = k.dung(t);
    if (!built) return { ok: false, lyDo: 'Không dựng được sự kiện (thiếu dữ liệu nền)' };
    const ev = push(t.id, { nguonId: k.nguonId, loaiSuKien: built.loaiSuKien,
                            tieuDe: built.tieuDe, payload: built.payload });
    return { ok: true, suKien: ev };
  }

  function clear(tenantId) {
    const t = tenantId || SM.current().id;
    saveAll(all().filter(e => e.tenant !== t));
  }

  SM.inbox = { NGUON, KICH_BAN, list, unread, get, push, process, scenarios, simulate, clear,
               nguonCua(e) { return NGUON[e.nguonId] || { ten: e.nguonId, loai: '—', kenh: '—', endpoint: '—' }; } };
})(window);
