/**
 * sm-ops.js — MƯỜI HAI VIỆC THẬT do GLM soi ra khi tự đóng bảy vai (18/08/2026).
 *
 * Đây là những chuyện xảy ra thật với hộ kinh doanh mà mockup chưa chạm tới.
 * Chúng đều đụng tiền, tồn kho hoặc sổ sách — nên lõi nằm ở đây, giao diện tách riêng.
 *
 * Nguồn: docs/SOAT-KICH-BAN-7-VAI.md
 */
(function (global) {
  'use strict';
  const SM = global.SM;
  if (!SM || !SM.dom) throw new Error('sm-ops.js cần sm-core.js và sm-domain.js');
  const D = SM.dom;

  /* ═══════════ 0. NHẬT KÝ THAO TÁC — ai sửa gì, không xoá được ═══════════
     Vai kế toán chia sẻ hỏi: "tôi sửa số thay hộ, hộ có thấy không?"          */

  function ghiNhatKy(t, m) {
    t.nhatKy = t.nhatKy || [];
    t.nhatKy.push({
      id: 'NK' + String(t.nhatKy.length + 1).padStart(4, '0'),
      luc: new Date().toISOString(), ngay: SM.CLOCK.today,
      ai: m.ai || 'Hộ kinh doanh', viec: m.viec, doiTuong: m.doiTuong || null,
      truoc: m.truoc === undefined ? null : m.truoc,
      sau: m.sau === undefined ? null : m.sau,
      lyDo: m.lyDo || null,
    });
    return t.nhatKy[t.nhatKy.length - 1];
  }
  function nhatKy(t) { return (t.nhatKy || []).slice().reverse(); }

  /* ═══════════ 1. CA BÁN HÀNG — mở ca, kết ca, đếm tiền mặt ═══════════
     Vai bà Bảy: mỗi tối đếm tiền, không có chỗ đối chiếu với máy.             */

  function caHienTai(t) { return (t.cas || []).find(c => !c.dongLuc) || null; }

  function moCa(t, tienDauCa) {
    if (caHienTai(t)) return { ok: false, lyDo: 'Đang có ca chưa kết, phải kết ca cũ trước' };
    t.cas = t.cas || [];
    const ca = { id: 'CA-' + SM.CLOCK.today.slice(5, 7) + SM.CLOCK.today.slice(8, 10) + '-' + String(t.cas.length + 1).padStart(2, '0'),
                 ngay: SM.CLOCK.today, moLuc: new Date().toISOString(), dongLuc: null,
                 tienDauCa: tienDauCa || 0, nguoiTruc: null };
    t.cas.push(ca);
    ghiNhatKy(t, { viec: 'Mở ca bán hàng', doiTuong: ca.id, sau: tienDauCa });
    SM.save();
    return { ok: true, ca };
  }

  /** Số máy tính được trong ca: tách tiền mặt và tiền vào tài khoản. */
  function tinhCa(t, ca) {
    const tu = ca.moLuc;
    const pm = (t.payments || []).filter(p => p.date === ca.ngay && (!ca.dongLuc || true));
    const tienMat = pm.filter(p => p.method === 'Tiền mặt' || p.method === 'Tiền thu hộ')
                      .reduce((s, p) => s + p.amount, 0);
    const qua = pm.filter(p => p.method === 'QR').reduce((s, p) => s + p.amount, 0);
    const hd = (t.invoices || []).filter(i => i.date === ca.ngay).length;
    return { tienMat, chuyenKhoan: qua, tong: tienMat + qua, soHoaDon: hd,
             duKienTrongKet: (ca.tienDauCa || 0) + tienMat };
  }

  /**
   * Kết ca. Điểm mấu chốt: LỆCH TIỀN phải ghi lý do, và lệch được lưu lại —
   * đây là chỗ hộ hay mất tiền mà không biết mất lúc nào.
   */
  function ketCa(t, tienDemDuoc, lyDoLech) {
    const ca = caHienTai(t);
    if (!ca) return { ok: false, lyDo: 'Không có ca nào đang mở' };
    const s = tinhCa(t, ca);
    const lech = tienDemDuoc - s.duKienTrongKet;
    if (lech !== 0 && !String(lyDoLech || '').trim())
      return { ok: false, lyDo: 'Tiền đếm được lệch ' + SM.fmt.d(lech) + ' so với máy — phải ghi lý do', lech, duKien: s.duKienTrongKet };
    ca.dongLuc = new Date().toISOString();
    ca.tienDemDuoc = tienDemDuoc; ca.lech = lech; ca.lyDoLech = lyDoLech || null;
    ca.chiTiet = s;
    ghiNhatKy(t, { viec: 'Kết ca', doiTuong: ca.id, truoc: s.duKienTrongKet, sau: tienDemDuoc, lyDo: lyDoLech || null });
    SM.save();
    return { ok: true, ca, lech, chiTiet: s };
  }

  function dsCa(t) { return (t.cas || []).slice().reverse(); }

  /* ═══════════ 2. CÔNG NỢ — trả một phần, nhắc nợ, nợ khó đòi ═══════════ */

  function conNo(r) { return r.amount - (r.daTra || 0); }

  function traNoMotPhan(t, id, soTien, hinhThuc) {
    const r = (t.receivables || []).find(x => x.id === id);
    if (!r) return { ok: false, lyDo: 'Không tìm thấy khoản nợ' };
    if (!(soTien > 0)) return { ok: false, lyDo: 'Số tiền phải lớn hơn 0' };
    if (soTien > conNo(r)) return { ok: false, lyDo: 'Trả vượt số còn nợ (' + SM.fmt.d(conNo(r)) + ')' };
    r.daTra = (r.daTra || 0) + soTien;
    r.lichSuTra = r.lichSuTra || [];
    r.lichSuTra.push({ ngay: SM.CLOCK.today, soTien, hinhThuc: hinhThuc || 'Chuyển khoản' });
    if (conNo(r) === 0) { r.paid = true; r.ngayTraHet = SM.CLOCK.today; }
    // tiền về thì cũng vào bảng thanh toán để khớp doanh thu ngày
    t.payments = t.payments || [];
    t.payments.push({ date: SM.CLOCK.today, point: (t.qrPoints || [{ id: 'q1' }])[0].id,
                      amount: soTien, method: hinhThuc === 'Tiền mặt' ? 'Tiền mặt' : 'QR',
                      noiDung: 'Thu nợ ' + r.buyer + ' (' + r.id + ')' });
    ghiNhatKy(t, { viec: 'Thu nợ một phần', doiTuong: r.id, truoc: conNo(r) + soTien, sau: conNo(r) });
    SM.save();
    return { ok: true, conNo: conNo(r), traHet: !!r.paid };
  }

  function xoaNoKhoDoi(t, id, lyDo) {
    const r = (t.receivables || []).find(x => x.id === id);
    if (!r) return { ok: false, lyDo: 'Không tìm thấy khoản nợ' };
    if (!String(lyDo || '').trim()) return { ok: false, lyDo: 'Phải ghi lý do — xoá nợ là ghi nhận mất tiền' };
    r.khoDoi = true; r.lyDoKhoDoi = lyDo; r.ngayXoa = SM.CLOCK.today;
    ghiNhatKy(t, { viec: 'Ghi nhận nợ khó đòi', doiTuong: r.id, truoc: conNo(r), sau: 0, lyDo });
    SM.save();
    return { ok: true, mat: conNo(r) };
  }

  function noSummary(t) {
    const rs = (t.receivables || []).filter(r => !r.paid);
    const quaHan = rs.filter(r => r.due < SM.CLOCK.today && !r.khoDoi);
    const soNgayQua = r => Math.round((new Date(SM.CLOCK.today) - new Date(r.due)) / 86400000);
    return {
      rows: rs.map(r => Object.assign({}, r, { conLai: conNo(r), soNgayQuaHan: r.due < SM.CLOCK.today ? soNgayQua(r) : 0 })),
      tongConNo: rs.reduce((s, r) => s + conNo(r), 0),
      quaHan, tienQuaHan: quaHan.reduce((s, r) => s + conNo(r), 0),
      khoDoi: rs.filter(r => r.khoDoi), tienKhoDoi: rs.filter(r => r.khoDoi).reduce((s, r) => s + conNo(r), 0),
    };
  }

  /* ═══════════ 3. GIÁ TẠI THỜI ĐIỂM BÁN — đổi giá khi còn đơn treo ═══════
     Vai hội đồng hỏi: "giá đổi giữa chừng thì doanh thu tính theo giá nào?"    */

  function soSanhGia(t, o) {
    return (o.lines || []).map(l => {
      const sk = (t.skus || []).find(s => s.sku === l.sku);
      const luc = l.qty ? Math.round(l.amount / l.qty) : l.amount;
      const nay = sk ? sk.price : null;
      return { sku: l.sku, ten: sk ? sk.name : l.sku, qty: l.qty,
               donGiaLucBan: luc, giaHienTai: nay,
               lech: nay === null ? null : nay - luc, doiGia: nay !== null && nay !== luc };
    });
  }

  /** Đơn chưa giao mà giá đã đổi — hộ cần biết để quyết giữ giá hay báo khách. */
  function donBiDoiGia(t) {
    return (t.orders || [])
      .filter(o => (o.state === 'new' || o.state === 'picking' || o.state === 'shipping') && (o.lines || []).length)
      .map(o => ({ don: o, dong: soSanhGia(t, o) }))
      .filter(x => x.dong.some(d => d.doiGia));
  }

  /* ═══════════ 4. HOÁ ĐƠN ĐIỀU CHỈNH, THAY THẾ, HUỶ ═══════════
     Hoá đơn đã phát hành thì KHÔNG được sửa đè — phải lập hoá đơn mới có liên kết. */

  const LOAI_DIEU_CHINH = [
    { id: 'dieu-chinh', ten: 'Hoá đơn điều chỉnh', moTa: 'Sai số tiền hoặc số lượng — lập hoá đơn điều chỉnh tăng hoặc giảm, hoá đơn gốc vẫn còn hiệu lực' },
    { id: 'thay-the',   ten: 'Hoá đơn thay thế',   moTa: 'Sai thông tin người mua hoặc mặt hàng — lập hoá đơn thay thế, hoá đơn gốc hết hiệu lực' },
    { id: 'huy',        ten: 'Huỷ hoá đơn',        moTa: 'Giao dịch không xảy ra — huỷ, phải có biên bản thoả thuận với người mua' },
  ];

  function dieuChinhHoaDon(t, invId, m) {
    const goc = (t.invoices || []).find(i => i.id === invId);
    if (!goc) return { ok: false, lyDo: 'Không tìm thấy hoá đơn' };
    if (goc.trangThaiDC) return { ok: false, lyDo: 'Hoá đơn này ' + goc.trangThaiDC + ' rồi' };
    if (goc.cqtState !== 'sent') return { ok: false, lyDo: 'Hoá đơn chưa truyền xong sang cơ quan thuế — chờ có mã rồi mới điều chỉnh được' };
    if (!String(m.lyDo || '').trim()) return { ok: false, lyDo: 'Phải ghi lý do điều chỉnh' };
    const loai = LOAI_DIEU_CHINH.find(x => x.id === m.loai);
    if (!loai) return { ok: false, lyDo: 'Chưa chọn loại xử lý' };

    goc.trangThaiDC = loai.id === 'huy' ? 'đã huỷ' : (loai.id === 'thay-the' ? 'đã thay thế' : 'đã điều chỉnh');
    goc.lyDoDC = m.lyDo;

    let moi = null;
    if (loai.id !== 'huy') {
      const seq = (t.invoices || []).length + 1;
      moi = {
        id: (loai.id === 'thay-the' ? 'HDTT-' : 'HDDC-') + SM.CLOCK.today.slice(2, 4) + SM.CLOCK.today.slice(5, 7) + '-' + String(seq).padStart(3, '0'),
        date: SM.CLOCK.today, buyer: m.buyerMoi || goc.buyer, buyerMst: m.buyerMstMoi || goc.buyerMst,
        channel: goc.channel, kind: loai.ten, fromPos: false,
        lines: m.lines || goc.lines, total: m.total !== undefined ? m.total : goc.total,
        taxGroup: goc.taxGroup, cqtState: SM.isOnline() ? 'sending' : 'queued',
        choHoaDon: goc.id, loaiDC: loai.id,
      };
      t.invoices.push(moi);
      SM.enqueue('einvoice', 'Truyền ' + loai.ten.toLowerCase() + ' ' + moi.id + ' cho hoá đơn ' + goc.id, { tenant: t.id, id: moi.id });
    }
    ghiNhatKy(t, { viec: loai.ten, doiTuong: goc.id, truoc: goc.total, sau: moi ? moi.total : 0, lyDo: m.lyDo });
    SM.save();
    return { ok: true, goc, moi, loai };
  }

  /* ═══════════ 5. CHỐNG PHÁT HÀNH HOÁ ĐƠN TRÙNG KHI MẤT MẠNG ═══════════
     Vai hội đồng hỏi thẳng câu này. Cách chặn: khoá theo dấu vân của giỏ hàng. */

  function vanTayGio(lines, total) {
    return SM.hash(JSON.stringify((lines || []).map(l => [l.sku, l.qty, l.amount])) + '|' + total + '|' + SM.CLOCK.today);
  }

  /**
   * Kiểm trước khi phát hành: nếu vừa phát hành đúng giỏ này trong phiên thì
   * KHÔNG phát hành nữa, trả lại hoá đơn cũ.
   */
  function kiemTrung(t, lines, total) {
    const key = vanTayGio(lines, total);
    const cu = (t.invoices || []).find(i => i.vanTay === key);
    return cu ? { trung: true, hoaDon: cu } : { trung: false, key };
  }

  /* ═══════════ 6. KHÁCH ĐẶT KHÔNG ĐẾN — no-show, giữ cọc, nhả chỗ ═══════ */

  function noShow(t, bookingId, m) {
    const b = (t.bookings || []).find(x => x.id === bookingId);
    if (!b) return { ok: false, lyDo: 'Không tìm thấy lượt đặt' };
    if (b.state === 'cancelled') return { ok: false, lyDo: 'Lượt này đã huỷ rồi' };
    b.state = 'cancelled'; b.noShow = true;
    b.ghiChuHuy = 'Khách đặt nhưng không đến' + (m && m.lyDo ? ' — ' + m.lyDo : '');
    const giu = m && m.giuCoc && b.coc;
    if (b.coc) {
      b.cocXuLy = giu ? 'giữ cọc' : 'hoàn cọc';
      if (giu) {
        t.payments = t.payments || [];
        t.payments.push({ date: SM.CLOCK.today, point: (t.qrPoints || [{ id: 'q1' }])[0].id,
                          amount: b.coc.soTien, method: 'Tiền mặt', noiDung: 'Giữ cọc do khách không đến — ' + b.id });
      }
    }
    ghiNhatKy(t, { viec: 'Khách không đến', doiTuong: b.id, truoc: b.total, sau: giu ? b.coc.soTien : 0,
                   lyDo: b.ghiChuHuy });
    SM.save();
    return { ok: true, booking: b, giuCoc: !!giu, tienGiu: giu ? b.coc.soTien : 0 };
  }

  /* ═══════════ 7. HUỶ LÔ HÀNG HỎNG — ghi tổn thất ═══════════ */

  function huyLo(t, lotId, soLuong, lyDo) {
    const lot = (t.lots || []).find(l => l.id === lotId);
    if (!lot) return { ok: false, lyDo: 'Không tìm thấy lô' };
    if (!(soLuong > 0) || soLuong > lot.qty) return { ok: false, lyDo: 'Số lượng huỷ phải trong khoảng 1 đến ' + lot.qty };
    if (!String(lyDo || '').trim()) return { ok: false, lyDo: 'Phải ghi lý do huỷ — đây là ghi nhận mất hàng' };
    const sk = (t.skus || []).find(s => s.sku === lot.sku) || {};
    const thietHai = soLuong * (sk.price || 0);
    lot.qty -= soLuong;
    t.huyLoLog = t.huyLoLog || [];
    t.huyLoLog.push({ ngay: SM.CLOCK.today, lot: lotId, sku: lot.sku, soLuong, lyDo, uocThietHai: thietHai });
    ghiNhatKy(t, { viec: 'Huỷ hàng hỏng', doiTuong: lotId, truoc: lot.qty + soLuong, sau: lot.qty, lyDo });
    SM.save();
    return { ok: true, conLai: lot.qty, uocThietHai: thietHai,
             goiY: 'Nên ghi ' + SM.fmt.d(thietHai) + ' vào Khoản chi mục nguyên liệu để giá vốn đúng' };
  }

  /* ═══════════ 8. TỪ TIN NHẮN TẠO ĐƠN ═══════════ */

  function donTuTinNhan(t, msgId, lines) {
    const m = (t.messages || []).find(x => x.id === msgId);
    if (!m) return { ok: false, lyDo: 'Không tìm thấy tin nhắn' };
    if (!(lines || []).length) return { ok: false, lyDo: 'Chưa chọn mặt hàng nào' };
    const chk = D.checkOrder(t, lines);
    if (!chk.ok) return { ok: false, lyDo: 'Không đủ hàng: ' + chk.viPham.map(v => v.name + ' còn ' + v.con).join('; '), viPham: chk.viPham };
    t.orders = t.orders || [];
    const o = { id: 'DH-' + SM.CLOCK.today.slice(2, 4) + SM.CLOCK.today.slice(5, 7) + '-' + String(700 + t.orders.length).slice(-3),
                date: SM.CLOCK.today, channel: m.kenh, buyer: m.tu, state: 'new',
                lines, total: lines.reduce((s, l) => s + l.amount, 0),
                taxGroup: t.taxGroupDefault, tuTinNhan: m.id, synced: false };
    t.orders.push(o);
    m.daTaoDon = o.id;
    ghiNhatKy(t, { viec: 'Tạo đơn từ tin nhắn', doiTuong: o.id, sau: o.total });
    SM.save();
    return { ok: true, order: o };
  }

  /* ═══════════ 9. ĐỐI SOÁT B2B — khách sạn trả gộp, trừ chiết khấu ═══════ */

  function doiSoatB2B(t, khach, soTienNhan) {
    const rs = (t.receivables || []).filter(r => r.buyer === khach && !r.paid);
    const tongNo = rs.reduce((s, r) => s + conNo(r), 0);
    const lech = soTienNhan - tongNo;
    const phanBo = [];
    let con = soTienNhan;
    rs.slice().sort((a, b) => a.due.localeCompare(b.due)).forEach(r => {
      const tra = Math.min(con, conNo(r));
      if (tra > 0) { phanBo.push({ id: r.id, note: r.note, no: conNo(r), tra, conLai: conNo(r) - tra }); con -= tra; }
    });
    return {
      khach, soKhoan: rs.length, tongNo, soTienNhan, lech, phanBo, thua: con,
      ketLuan: lech === 0 ? 'Khớp đúng' :
               lech < 0 ? 'Nhận thiếu ' + SM.fmt.d(-lech) + ' — có thể là chiết khấu hoặc trừ hàng lỗi, cần hỏi lại bên mua'
                        : 'Nhận thừa ' + SM.fmt.d(lech) + ' — giữ lại trừ vào kỳ sau hoặc hoàn trả',
    };
  }

  /** Chốt đối soát: ghi thu cho từng khoản theo phân bổ, phần lệch ghi lý do. */
  function chotDoiSoat(t, khach, soTienNhan, lyDoLech) {
    const ds = doiSoatB2B(t, khach, soTienNhan);
    if (ds.lech !== 0 && !String(lyDoLech || '').trim())
      return { ok: false, lyDo: 'Lệch ' + SM.fmt.d(ds.lech) + ' — phải ghi lý do trước khi chốt' };
    ds.phanBo.forEach(p => traNoMotPhan(t, p.id, p.tra, 'Chuyển khoản'));
    if (ds.lech < 0 && lyDoLech) {
      (t.receivables || []).filter(r => r.buyer === khach && !r.paid)
        .forEach(r => { r.ghiChuDoiSoat = lyDoLech; });
    }
    ghiNhatKy(t, { viec: 'Chốt đối soát công nợ', doiTuong: khach, truoc: ds.tongNo, sau: soTienNhan, lyDo: lyDoLech || null });
    SM.save();
    return { ok: true, ds };
  }

  /* ═══════════ 10. NHẮC NỢ QUA TIN NHẮN — nối Công nợ với Hội thoại ═══════
     Người soát chỉ ra: hai màn này liên quan nhau mà không biết đến nhau.
     Hộ đang xem công nợ thì phải nhắc được ngay, không phải nhớ tên rồi sang màn khác gõ lại. */

  /** Soạn lời nhắc TỪ SỐ THẬT — không phải câu mẫu điền tên. */
  function soanNhacNo(t, id) {
    const r = (t.receivables || []).find(x => x.id === id);
    if (!r) return null;
    const con = conNo(r);
    const qua = r.due < SM.CLOCK.today
      ? Math.round((new Date(SM.CLOCK.today) - new Date(r.due)) / 86400000) : 0;
    const daTra = r.daTra || 0;
    const lan = (r.lichSuNhac || []).length;

    let than;
    if (qua <= 0) {
      than = 'Dạ em gửi anh chị thông tin khoản ' + SM.fmt.d(con) + ' đến hạn ngày ' +
             SM.fmt.dmy(r.due) + '. Anh chị sắp xếp giúp em ạ.';
    } else if (lan === 0) {
      than = 'Dạ em xin phép nhắc khoản ' + SM.fmt.d(con) + ' đã quá hạn ' + qua +
             ' ngày (hạn ' + SM.fmt.dmy(r.due) + '). Anh chị xem giúp em ạ.';
    } else {
      than = 'Dạ em nhắc lại khoản ' + SM.fmt.d(con) + ' quá hạn ' + qua + ' ngày. ' +
             'Em đã nhắn ' + lan + ' lần rồi ạ, anh chị cho em xin lịch thanh toán cụ thể để em còn cân đối.';
    }
    if (daTra > 0) than += ' (Anh chị đã thanh toán ' + SM.fmt.d(daTra) + ', còn lại ' + SM.fmt.d(con) + '.)';

    return {
      khach: r.buyer, khoan: r.id, con, qua, daTra, lanDaNhac: lan,
      lanNhacCuoi: (r.lichSuNhac || []).length ? r.lichSuNhac[r.lichSuNhac.length - 1].ngay : null,
      than,
      tinhTu: 'Số còn nợ sau khi trừ phần đã trả, ngày hạn trên khoản nợ, và số lần đã nhắc trước đó.',
      giongDieu: qua <= 0 ? 'nhẹ, chưa tới hạn' : lan === 0 ? 'nhắc lần đầu' : 'nhắc lại lần ' + (lan + 1),
      // D-#4 [Q-005]: cửa sổ tin Zalo của khách này — màn nhắc hiện phí TRƯỚC nút gửi.
      // Fallback null an toàn khi sm-onboard.js chưa nạp.
      cuaSo: SM.onb && SM.onb.cuaSoTin ? SM.onb.cuaSoTin(t, r.buyer) : null,
    };
  }

  /** Gửi lời nhắc: vào hội thoại như một tin ĐI, và xếp hàng đợi gửi thật. */
  function guiNhacNo(t, id, noiDung) {
    const r = (t.receivables || []).find(x => x.id === id);
    if (!r) return { ok: false, lyDo: 'Không tìm thấy khoản nợ' };
    if (!String(noiDung || '').trim()) return { ok: false, lyDo: 'Chưa có nội dung nhắc' };
    t.messages = t.messages || [];
    const m = {
      id: 'TN' + (t.messages.length + 1), date: SM.CLOCK.today,
      tu: r.buyer, kenh: 'zalo', huong: 'di',
      noiDung: noiDung.trim(), daTraLoi: true,
      veKhoanNo: r.id,
    };
    t.messages.push(m);
    r.lichSuNhac = r.lichSuNhac || [];
    r.lichSuNhac.push({ ngay: SM.CLOCK.today, noiDung: noiDung.trim() });
    ghiNhatKy(t, { viec: 'Nhắc nợ qua tin nhắn', doiTuong: r.id, sau: conNo(r) });
    SM.enqueue('channel', 'Gửi lời nhắc nợ cho ' + r.buyer + ' qua Zalo', { tenant: t.id, id: m.id });
    SM.save();
    return { ok: true, msg: m, lanThu: r.lichSuNhac.length };
  }

  /** Người đang nhắn tin này có đang nợ không — để hộ biết ngay trong lúc chat. */
  function noCuaNguoi(t, ten) {
    const rs = (t.receivables || []).filter(r => r.buyer === ten && !r.paid);
    if (!rs.length) return null;
    return { soKhoan: rs.length, tongCon: rs.reduce((s, r) => s + conNo(r), 0),
             quaHan: rs.filter(r => r.due < SM.CLOCK.today).length,
             khoan: rs.map(r => ({ id: r.id, con: conNo(r), due: r.due, note: r.note })) };
  }

  SM.ops = {
    soanNhacNo, guiNhacNo, noCuaNguoi,
    LOAI_DIEU_CHINH,
    ghiNhatKy, nhatKy,
    caHienTai, moCa, tinhCa, ketCa, dsCa,
    conNo, traNoMotPhan, xoaNoKhoDoi, noSummary,
    soSanhGia, donBiDoiGia,
    dieuChinhHoaDon, vanTayGio, kiemTrung,
    noShow, huyLo, donTuTinNhan,
    doiSoatB2B, chotDoiSoat,
  };
})(window);
