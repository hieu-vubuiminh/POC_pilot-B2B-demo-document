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

  // doTuoi = độ tươi CÔNG BỐ theo bảng C.15 (một nguồn duy nhất) — chuỗi ngắn hiện trong chi tiết sự kiện.
  const NGUON = {
    shopee:  { ten: 'Shopee',            loai: 'Sàn thương mại điện tử', kenh: 'webhook', endpoint: 'POST /webhooks/ecommerce/orders', doTuoi: 'nguồn này chưa đo — Q-036' },
    tiktok:  { ten: 'TikTok Shop',       loai: 'Sàn thương mại điện tử', kenh: 'webhook', endpoint: 'POST /webhooks/ecommerce/orders', doTuoi: 'nguồn này chưa đo — Q-042 đề xuất' },
    lazada:  { ten: 'Lazada',            loai: 'Sàn thương mại điện tử', kenh: 'webhook', endpoint: 'POST /webhooks/ecommerce/orders', doTuoi: 'nguồn này chưa đo — Q-042 đề xuất' },
    food:    { ten: 'ShopeeFood',        loai: 'App giao đồ ăn',         kenh: 'webhook', endpoint: 'POST /webhooks/food/orders', doTuoi: 'nguồn này chưa đo — chưa có trong bảng độ tươi' },
    booking: { ten: 'Booking.com',       loai: 'Nền tảng đặt phòng',     kenh: 'webhook', endpoint: 'POST /webhooks/booking/reservations', doTuoi: 'nguồn này chưa đo — Q-045' },
    zalo:    { ten: 'Zalo OA',           loai: 'Kênh chạm khách',        kenh: 'webhook', endpoint: 'POST /webhooks/zalo/messages', doTuoi: 'nguồn này chưa đo — Q-034' },
    sepay:   { ten: 'SePay — ngân hàng', loai: 'Dòng tiền',              kenh: 'webhook', endpoint: 'POST /webhooks/sepay', doTuoi: 'nguồn này đẩy tức thì — giây đến phút [Q-006]' },
    ghn:     { ten: 'Giao Hàng Nhanh',   loai: 'Vận chuyển',             kenh: 'webhook', endpoint: 'POST /webhooks/shipping/ghn', doTuoi: 'nguồn này chưa đo — Q-037' },
    vtp:     { ten: 'Viettel Post',      loai: 'Vận chuyển',             kenh: 'webhook', endpoint: 'POST /webhooks/shipping/vtp', doTuoi: 'nguồn này chưa đo — Q-037' },
    cqt:     { ten: 'Cơ quan thuế',      loai: 'Tuân thủ',               kenh: 'trả lời đồng bộ', endpoint: 'phản hồi cho POST /einvoice/issue', doTuoi: 'trả lời sau 15 phút đến 1 ngày làm việc [Q-002]' },
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

  /* ═══════════════ HỢP TÁC VỚI sm-domain (W2 làm song song — gọi kèm fallback) ═══════════════ */

  /** Map id cũ của connector (zalo/qr/ghn…) về id v4 — qua D.chuyenId của W2, chưa có thì giữ nguyên. */
  function maMoi(id) {
    if (!id) return id;
    const m = D.chuyenId;
    if (!m) return id;
    for (const moi in m) if (m[moi].indexOf(id) >= 0) return moi;
    return id;
  }

  // Tên gọi nền khi danh sách connector chưa tra ra (ví dụ W2 chưa ghép map id mới).
  const TEN_NGHE = { hddt: 'Hoá đơn điện tử', zalooa: 'Zalo OA' };

  /** Tên hiển thị của kênh — tra danh sách connector (cả id cũ lẫn id mới), không thấy thì dùng tên nền. */
  function tenKenh(t, ma) {
    const c = D.connectors(t).find(x => x.id === ma || maMoi(x.id) === ma);
    return c ? c.ten : (TEN_NGHE[ma] || ma);
  }

  /** Trạng thái đăng ký kết nối một kênh (t.onboarding.ketNoi) — chưa có gì thì 'chua_hoi'. */
  function trangThaiKetNoi(t, ma) {
    const k = (t.onboarding && t.onboarding.ketNoi) || {};
    if (k[ma] && k[ma].trangThai) return k[ma].trangThai;
    const cu = (D.chuyenId || {})[ma] || [];
    for (let i = 0; i < cu.length; i++) if (k[cu[i]] && k[cu[i]].trangThai) return k[cu[i]].trangThai;
    return 'chua_hoi';
  }

  /** Một dòng nhật ký của hộ — ưu tiên sổ của sm-ops, module chưa nạp thì tự ghi cùng hình dạng. */
  function nhatKy(t, m) {
    if (SM.ops && SM.ops.ghiNhatKy) return SM.ops.ghiNhatKy(t, m);
    t.nhatKy = t.nhatKy || [];
    t.nhatKy.push({ id: 'NK' + String(t.nhatKy.length + 1).padStart(4, '0'),
                    luc: new Date().toISOString(), ngay: SM.CLOCK.today, ai: m.ai || 'Hộ kinh doanh',
                    viec: m.viec, doiTuong: m.doiTuong || null, truoc: m.truoc === undefined ? null : m.truoc,
                    sau: m.sau === undefined ? null : m.sau, lyDo: m.lyDo || null });
    return t.nhatKy[t.nhatKy.length - 1];
  }

  /** Bên ngoài duyệt xong một kênh — đường chuyển trạng thái duy nhất là D.datTrangThaiKetNoi (W2), chưa có thì tự ghi cùng chỗ. */
  function duyetKetNoi(t, ma, aiBam) {
    if (typeof D.datTrangThaiKetNoi === 'function') {
      D.datTrangThaiKetNoi(t, ma, 'da_ket_noi', { aiBam: aiBam });
    } else {
      t.onboarding = t.onboarding || {};
      t.onboarding.ketNoi = t.onboarding.ketNoi || {};
      t.onboarding.ketNoi[ma] = Object.assign({}, t.onboarding.ketNoi[ma],
        { trangThai: 'da_ket_noi', aiBam: aiBam, luc: new Date().toISOString() });
      nhatKy(t, { viec: 'Kênh được duyệt kết nối', doiTuong: ma, sau: 'da_ket_noi', lyDo: aiBam });
    }
    SM.save();
  }

  /** Đánh dấu một kênh ĐỨT — dừng nhận dữ liệu cho tới khi kiểm tra lại (D-#5). */
  function datChet(t, ma, lyDo) {
    t.connections = t.connections || {};
    t.connections[ma] = Object.assign({}, t.connections[ma], { trangThai: 'chet', chetTu: SM.CLOCK.today });
    if (typeof D.datTrangThaiKetNoi === 'function') D.datTrangThaiKetNoi(t, ma, 'loi', { lyDo: lyDo });
    else nhatKy(t, { viec: 'Kênh đứt — dừng nhận dữ liệu', doiTuong: ma, lyDo: lyDo });
    SM.save();
  }

  /** Các kênh sàn đang nối và chưa đứt — kịch bản đứt chọn một trong số đó. */
  function sanDangNoi(t) {
    return D.connectors(t).filter(c => c.nhom === 'Sàn thương mại điện tử' && c.noi &&
      c.trangThai !== 'chet' && (t.connections[c.id] || {}).trangThai !== 'chet');
  }

  /* ═══ CHẶN BẢN TRÙNG (D-#3) ═══ Nguồn ngoài gửi lại bản đã xử lý là chuyện thường (at-least-once
     [Q-006]). Mỗi payload mang một mã giao dịch riêng; tra SỔ sự kiện đã lưu — mã nào đã xử lý
     rồi thì lần sau chỉ ghi nhận là trùng: KHÔNG cộng tiền, KHÔNG tạo đơn lần hai.                */
  function khoaDuyNhat(p) {
    const truong = ['transaction_id', 'id', 'maGiaoDich', 'maDon', 'maVanDon', 'maDat'];
    for (let i = 0; i < truong.length; i++) if (p[truong[i]]) return truong[i] + '|' + p[truong[i]];
    return null;
  }

  /* ═══════════════ XỬ LÝ SỰ KIỆN — sinh ra dữ liệu nghiệp vụ thật ═══════════
     Đây là chỗ "tạo ra cái gì" trở thành thật: đơn vào bảng đơn, tiền vào bảng
     thanh toán, lượt đặt vào lịch — và tồn kho tụt thật.                      */

  function process(evId) {
    const l = all();
    const e = l.find(x => x.id === evId);
    if (!e) return { ok: false, lyDo: 'Không tìm thấy sự kiện' };
    if (e.trangThai === 'da-xu-ly') return { ok: false, lyDo: 'Sự kiện này đã xử lý rồi' };
    if (e.trangThai === 'trung-bo') return { ok: false, lyDo: 'Bản trùng theo id — đã bỏ rồi, không xử lý lại' };
    const t = SM.tenant(e.tenant);
    if (!t) return { ok: false, lyDo: 'Không tìm thấy hộ' };

    const p = e.payload;
    let taoRa = null, loi = null;

    // D-#3: tra sổ TRƯỚC khi động vào tiền — cùng hộ + cùng nguồn + cùng mã đã xử lý thì đây là bản trùng.
    const khoa = khoaDuyNhat(p);
    if (khoa) {
      const coTrung = l.find(x => x.id !== e.id && x.tenant === e.tenant && x.nguonId === e.nguonId &&
        x.trangThai === 'da-xu-ly' && khoaDuyNhat(x.payload) === khoa);
      if (coTrung) {
        e.trangThai = 'trung-bo';
        e.ghiChu = 'bản trùng theo id — đã bỏ, không cộng tiền lần hai';
        e.taoRa = { loai: 'trung-bo', id: p.maGiaoDich || p.transaction_id || p.id || coTrung.id,
                    moTa: 'Máy nhận trùng một lần chuyển khoản — đã tự bỏ, tiền không bị cộng hai lần' };
        e.xuLyLuc = new Date().toISOString();
        t.trungBoDem = (t.trungBoDem || 0) + 1;
        nhatKy(t, { viec: 'Chặn bản trùng theo id', doiTuong: khoa.split('|')[1], sau: t.trungBoDem,
                    lyDo: 'nguồn gửi lại bản đã xử lý — bỏ, không cộng lần hai' });
        saveAll(l);
        SM.save();
        return { ok: true, trungBo: true, taoRa: e.taoRa, suKien: e };
      }
    }

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
      // D-#8 [Q-019 NĐ 117/2025 Đ11 k4]: sàn khấu trừ thuế nộp thay — chỉ chép số từ payload,
      // không tự khấu trừ/khai thay. Nguồn số nằm trong payload sàn, đơn giữ nguyên vẹn.
      if (p.thueSanDaNop) o.thueSanDaNop = p.thueSanDaNop;
      SM.save();
      taoRa = { loai: 'don', id: o.id, moTa: 'Đơn hàng mới, đã giữ chỗ tồn kho' +
        (p.thueSanDaNop ? ' — thuế sàn đã khấu trừ nộp thay: ' + SM.fmt.d(p.thueSanDaNop) + ' (nguồn: payload sàn)' : '') };
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

    else if (e.loaiSuKien === 'ket-noi-duyet') {
      const ma = maMoi(p.kenh || '');
      duyetKetNoi(t, ma, p.aiBam || 'cổng ngoài (mô phỏng)');
      taoRa = { loai: 'ket-noi', id: ma, moTa: tenKenh(t, ma) + ' đã được duyệt — kênh sẵn sàng dùng' };
    }

    else if (e.loaiSuKien === 'canh-bao') {
      // Cảnh báo đứt: trạng thái đã đặt khi cảnh báo đến — xử lý ở đây chỉ là hộ đã nhìn thấy.
      taoRa = { loai: 'canh-bao', id: p.kenh || null,
                moTa: 'Đã bật nhãn đứt cho ' + tenKenh(t, maMoi(p.kenh || '')) + ' ở Trạm dữ liệu — kiểm tra để nối lại' };
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
        const thueNopThay = Math.round(qty * s.meta.price * 0.015);   // số mô phỏng ~1,5% giá trị đơn — tỷ lệ thật chờ Q-032
        return { loaiSuKien: 'don-moi', tieuDe: 'Đơn mới từ Shopee — ' + s.meta.name + ' ×' + qty +
                 ' — thuế sàn đã khấu trừ nộp thay: ' + SM.fmt.d(thueNopThay) + ' (nguồn: payload sàn)',
          payload: { maDon: seq(t, 'SPE-'), khach: 'Chị Lan (Hà Nội)', diaChi: 'Quận Cầu Giấy, Hà Nội',
                     items: [{ sku: s.sku, ten: s.meta.name, qty, donGia: s.meta.price }],
                     thueSanDaNop: thueNopThay,
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

    { id: 'tien-ve-trung', ten: 'SePay gửi LẠI bản trùng — cùng một mã giao dịch', nguonId: 'sepay',
      moTa: 'Ngân hàng báo có hai lần cho một chuyển khoản. Máy đối mã: trùng thì bỏ, tiền không cộng hai lần.',
      apDung: () => true,
      dung: t => {
        const ganNhat = list(t.id).filter(x => x.loaiSuKien === 'tien-ve')[0];   // list() đã sort mới nhất đứng đầu
        if (!ganNhat) {
          // Chưa có tiền-về nào trong sổ: bắn một bản thường trước, nhắc bấm lại lần nữa sẽ thấy máy chặn trùng.
          const thuong = KICH_BAN.find(x => x.id === 'tienVe').dung(t);
          thuong.tieuDe += ' — bấm thêm lần nữa để thấy máy chặn bản trùng';
          return thuong;
        }
        return { loaiSuKien: 'tien-ve',
                 tieuDe: 'Tiền về (GỬI LẠI) — máy đối mã ' + ganNhat.payload.maGiaoDich + ' thấy TRÙNG',
                 payload: ganNhat.payload };   // ĐÚNG payload cũ kể cả mã — nhánh trung-bo trong process() sẽ chặn
      } },

    { id: 'ket-noi-dut', ten: 'Kênh sàn im lặng — kết nối có thể đứt', nguonId: 'shopee',
      moTa: 'Sàn hết đẩy đơn qua 24 giờ — bước đối soát hằng ngày phát hiện và lên tiếng (poll an toàn ≥24 giờ [Q-003]).',
      apDung: t => sanDangNoi(t).length > 0,
      dung: t => {
        const c = sanDangNoi(t)[0];
        const ma = maMoi(c.id);
        datChet(t, ma, 'sàn hết đẩy đơn qua 24 giờ — đối soát phát hiện');   // ngưỡng 24 giờ = chu kỳ poll an toàn [Q-003]
        return { nguonId: c.id, loaiSuKien: 'canh-bao',
                 tieuDe: 'Cảnh báo: ' + c.ten + ' không đẩy đơn 2 ngày — có thể kết nối đứt',
                 payload: { kenh: ma, soNgayIm: 2, luc: SM.CLOCK.today + 'T06:00:00' } };   // 2 ngày = mô phỏng vượt ngưỡng trên
      } },

    { id: 'cong-thue-phan-hoi', ten: 'Cổng thuế phản hồi: chấp nhận đăng ký hoá đơn điện tử', nguonId: 'cqt',
      moTa: 'Sau khi hộ nộp hồ sơ, cổng trả lời. Chấp nhận thì kênh hoá đơn điện tử sẵn sàng dùng.',
      apDung: t => trangThaiKetNoi(t, 'hddt') !== 'da_ket_noi',
      dung: () => ({ loaiSuKien: 'ket-noi-duyet', tieuDe: 'Cổng thuế phản hồi: chấp nhận đăng ký hoá đơn điện tử',
        payload: { kenh: 'hddt', ketQua: 'chap-nhan', aiBam: 'cổng CQT (mô phỏng)',
                   luc: SM.CLOCK.today + 'T09:30:00' } }) },

    { id: 'zalo-duyet-xong', ten: 'Zalo duyệt xong tài khoản OA của hộ', nguonId: 'zalo',
      moTa: 'Hồ sơ Zalo OA được duyệt — kênh nhắn tới khách hàng sẵn sàng dùng.',
      apDung: t => trangThaiKetNoi(t, 'zalooa') !== 'da_ket_noi',
      dung: () => ({ loaiSuKien: 'ket-noi-duyet', tieuDe: 'Zalo duyệt xong tài khoản OA của hộ',
        payload: { kenh: 'zalooa', ketQua: 'chap-nhan', aiBam: 'Zalo (mô phỏng)',
                   luc: SM.CLOCK.today + 'T14:05:00' } }) },
  ];

  /** Kịch bản áp dụng được cho hộ đang chọn. */
  function scenarios(t) {
    const ten = t || SM.current();
    return KICH_BAN.filter(k => k.apDung(ten)).map(k => ({ id: k.id, ten: k.ten, moTa: k.moTa,
      nguonId: k.nguonId, nguon: NGUON[k.nguonId] }));
  }

  // INTERFACE mục 4 gọi kịch bản đơn sàn bằng id `don-san-moi` — nút đang sống là `sanTMDT`
  // (mobile đang nghe, không đổi tên) nên nhận cả hai tên, trỏ về cùng một kịch bản.
  const ALIAS_KICH_BAN = { 'don-san-moi': 'sanTMDT' };

  /**
   * Bấm nút giả lập: dựng payload đúng hình dạng webhook rồi ĐẨY VÀO hộp thư đến.
   * Nếu đang mất mạng thì sự kiện vẫn vào sổ nhưng ghi rõ là nhận được khi có mạng lại.
   */
  function simulate(kichBanId, tenantId) {
    const t = tenantId ? SM.tenant(tenantId) : SM.current();
    const k = KICH_BAN.find(x => x.id === kichBanId || x.id === ALIAS_KICH_BAN[kichBanId]);
    if (!k) return { ok: false, lyDo: 'Không có kịch bản này' };
    if (!k.apDung(t)) return { ok: false, lyDo: 'Kịch bản này không áp dụng cho hộ đang chọn' };
    const built = k.dung(t);
    if (!built) return { ok: false, lyDo: 'Không dựng được sự kiện (thiếu dữ liệu nền)' };
    const ev = push(t.id, { nguonId: built.nguonId || k.nguonId, loaiSuKien: built.loaiSuKien,
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
