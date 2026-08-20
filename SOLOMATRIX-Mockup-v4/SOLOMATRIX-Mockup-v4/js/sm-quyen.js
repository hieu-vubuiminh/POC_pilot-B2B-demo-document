/**
 * sm-quyen.js — BA VIỆC CUỐI trong bảng ưu tiên của soát 7 vai.
 *   1. Phân quyền trong hộ — nhiều người dùng chung, ai làm được gì
 *   2. Thiết bị và khôi phục — mất điện thoại thì dữ liệu còn không
 *   3. Truy xuất lô qua mã cho BÊN MUA quét
 *
 * ⚠️ Điểm riêng tư quan trọng ở mục 3: bên mua quét mã CHỈ được thấy đường đi
 * của hàng, KHÔNG được thấy tên và giấy tờ nông dân, KHÔNG được thấy giá mua vào.
 * Thông tin định danh nông dân nằm trong danh sách Chương trình cũng không được xem.
 */
(function (global) {
  'use strict';
  const SM = global.SM;
  if (!SM || !SM.dom || !SM.ops) throw new Error('sm-quyen.js cần sm-core, sm-domain, sm-ops');
  const D = SM.dom, O = SM.ops;

  /* ═══════════ 1. PHÂN QUYỀN TRONG HỘ ═══════════
     Vai kế toán chia sẻ hỏi: "tôi sửa thay hộ, hộ có thấy không?"
     Vai cán bộ chấm hỏi: "nhiều người dùng chung một tài khoản thì sao?"       */

  const VAI = [
    { id: 'chu-ho',   ten: 'Chủ hộ',            moTa: 'Làm được mọi việc, kể cả đổi giá và xoá',
      quyen: ['ban', 'don', 'kho', 'gia', 'chi', 'thue', 'hoadon', 'xoa', 'nguoidung'] },
    { id: 'ke-can',   ten: 'Thế hệ kế cận',     moTa: 'Làm việc hằng ngày, đổi giá được, không thêm bớt người dùng',
      quyen: ['ban', 'don', 'kho', 'gia', 'chi', 'thue', 'hoadon'] },
    { id: 'nguoi-nha',ten: 'Người nhà đứng quầy', moTa: 'Chỉ bán và xem tiền. Mở ra là chế độ chữ lớn.',
      quyen: ['ban'], cheDo: 'simple' },
    { id: 'ke-toan',  ten: 'Kế toán chia sẻ',   moTa: 'Xem chứng từ, lập tờ khai. KHÔNG đổi giá, KHÔNG xoá dữ liệu.',
      quyen: ['don', 'kho', 'chi', 'thue', 'hoadon'] },
    { id: 'can-bo',   ten: 'Cán bộ hỗ trợ địa bàn', moTa: 'Chỉ xem để hướng dẫn. Không sửa được gì.',
      quyen: [] },
  ];

  const TEN_QUYEN = {
    ban: 'Bán hàng và thu tiền', don: 'Xử lý đơn và vận chuyển', kho: 'Nhập kho, kiểm kê',
    gia: 'Đổi giá bán', chi: 'Ghi khoản chi', thue: 'Kê khai thuế',
    hoadon: 'Phát hành và điều chỉnh hoá đơn', xoa: 'Xoá dữ liệu', nguoidung: 'Quản lý người dùng',
  };

  function vaiCua(id) { return VAI.find(v => v.id === id) || null; }

  function nguoiDung(t) {
    if (!t.nguoiDung) {
      // Dựng lần đầu từ chính hồ sơ hộ — không bịa người
      t.nguoiDung = [
        { id: 'u1', ten: t.keCan.ten, tuoi: t.keCan.tuoi, vai: 'ke-can', dangDung: true, tuNgay: t.activatedAt },
        ...(t.nguoiLonTuoi || []).map((n, i) => ({ id: 'u' + (i + 2), ten: n.ten, tuoi: n.tuoi,
                                                  vai: 'nguoi-nha', dangDung: true, tuNgay: t.activatedAt })),
        { id: 'u9', ten: 'Kế toán chia sẻ của Chương trình', vai: 'ke-toan', dangDung: true, tuNgay: t.activatedAt },
      ];
      SM.save();
    }
    return t.nguoiDung.map(u => Object.assign({}, u, { vaiChiTiet: vaiCua(u.vai) }));
  }

  function doiVai(t, userId, vaiMoi) {
    const u = (t.nguoiDung || []).find(x => x.id === userId);
    if (!u) return { ok: false, lyDo: 'Không tìm thấy người dùng' };
    if (!vaiCua(vaiMoi)) return { ok: false, lyDo: 'Vai không hợp lệ' };
    const chuHo = (t.nguoiDung || []).filter(x => x.vai === 'chu-ho' && x.dangDung);
    if (u.vai === 'chu-ho' && vaiMoi !== 'chu-ho' && chuHo.length <= 1)
      return { ok: false, lyDo: 'Phải còn ít nhất một chủ hộ — đổi người khác thành chủ hộ trước' };
    const cu = u.vai; u.vai = vaiMoi;
    O.ghiNhatKy(t, { viec: 'Đổi vai người dùng', doiTuong: u.ten,
                     truoc: (vaiCua(cu) || {}).ten, sau: vaiCua(vaiMoi).ten });
    SM.save();
    return { ok: true, u };
  }

  /** Người này có làm được việc này không. */
  function duocLam(t, userId, quyen) {
    const u = (t.nguoiDung || []).find(x => x.id === userId);
    if (!u || !u.dangDung) return false;
    const v = vaiCua(u.vai);
    return !!(v && v.quyen.indexOf(quyen) >= 0);
  }

  /** Ai đang làm được việc gì — bảng để hộ nhìn một phát là hiểu. */
  function bangQuyen(t) {
    const us = nguoiDung(t).filter(u => u.dangDung);
    return { cot: Object.keys(TEN_QUYEN).map(k => ({ id: k, ten: TEN_QUYEN[k] })),
             dong: us.map(u => ({ nguoi: u, co: Object.keys(TEN_QUYEN).map(k => duocLam(t, u.id, k)) })) };
  }

  /* ═══════════ 2. THIẾT BỊ VÀ KHÔI PHỤC ═══════════
     Vai cán bộ chấm hỏi: "mất điện thoại thì mất luôn dữ liệu à?"              */

  function thietBi(t) {
    if (!t.thietBi) {
      t.thietBi = [
        { id: 'd1', ten: 'Điện thoại của ' + t.keCan.ten, loai: 'Android', lanCuoi: SM.CLOCK.today,
          dangDung: true, nguoiDung: 'u1', viTri: t.diaBan },
        { id: 'd2', ten: 'Máy để ở quầy', loai: 'Android', lanCuoi: SM.dayOffset(SM.CLOCK.today, -1),
          dangDung: true, nguoiDung: 'u2', viTri: t.diaBan },
      ];
      SM.save();
    }
    return t.thietBi;
  }

  function thuHoiThietBi(t, id, lyDo) {
    const d = (t.thietBi || []).find(x => x.id === id);
    if (!d) return { ok: false, lyDo: 'Không tìm thấy thiết bị' };
    if (!String(lyDo || '').trim()) return { ok: false, lyDo: 'Ghi rõ vì sao thu hồi — mất máy, đổi máy, hay nghỉ việc' };
    d.dangDung = false; d.thuHoiNgay = SM.CLOCK.today; d.lyDoThuHoi = lyDo;
    O.ghiNhatKy(t, { viec: 'Thu hồi quyền truy cập thiết bị', doiTuong: d.ten, lyDo });
    SM.save();
    return { ok: true, d };
  }

  /**
   * Dữ liệu nằm ở đâu — câu trả lời cho "mất máy có mất dữ liệu không".
   * Con số lấy THẬT từ kho, không viết cứng.
   */
  function noiLuuDuLieu(t) {
    const dem = k => (t[k] || []).length;
    return {
      tren_may_chu: [
        { ten: 'Hoá đơn đã phát hành', so: dem('invoices') },
        { ten: 'Đơn hàng', so: dem('orders') },
        { ten: 'Lô hàng trong kho', so: dem('lots') },
        { ten: 'Bảng kê thu mua', so: dem('purchases') },
        { ten: 'Khoản chi', so: dem('expenses') },
        { ten: 'Công nợ', so: dem('receivables') },
        { ten: 'Lượt đặt chỗ', so: dem('bookings') },
        { ten: 'Nhật ký thao tác', so: dem('nhatKy') },
      ],
      chi_tren_may: [
        { ten: 'Giao dịch đang chờ gửi lên', so: SM.queueCount(),
          ghiChu: 'Phần này nếu mất máy khi đang mất mạng thì mất — nên đừng để hàng đợi dồn lâu' },
      ],
      ketLuan: 'Mất máy KHÔNG mất dữ liệu. Đăng nhập máy khác là thấy lại đủ. ' +
               'Chỉ có ' + SM.queueCount() + ' giao dịch chưa kịp gửi lên là nằm trên máy cũ.',
    };
  }

  /* ═══════════ 3. TRUY XUẤT LÔ QUA MÃ — CHO BÊN MUA QUÉT ═══════════
     Doanh nghiệp chế biến và khách sạn đòi truy xuất. Nhưng bên mua KHÔNG
     được thấy tên nông dân, số giấy tờ, hay giá mua vào — đó là dữ liệu của hộ. */

  function maTraCuu(t, lotId) {
    return 'TX-' + String(t.mst || '').slice(-4) + '-' + String(lotId).replace(/[^A-Za-z0-9]/g, '').slice(-8).toUpperCase();
  }

  /** Đúng những gì bên mua được thấy — không hơn. */
  function traCuuCongKhai(t, lotId) {
    const lot = (t.lots || []).find(l => l.id === lotId);
    if (!lot) return null;
    const sk = (t.skus || []).find(s => s.sku === lot.sku) || {};
    const bk = lot.origin && lot.origin.bangKe ? (t.purchases || []).find(p => p.id === lot.origin.bangKe) : null;
    const hs = (t.compliance || []).filter(c => c.batBuoc && String(c.trangThai).indexOf('thieu') !== 0);
    return {
      ma: maTraCuu(t, lotId),
      sanPham: sk.name || lot.sku,
      lo: lot.id,
      ngayVaoKho: lot.inDate,
      hanDung: lot.hanDung || null,
      coSo: { ten: t.name, diaBan: t.diaBan, mst: t.mst },
      vungNguyenLieu: bk ? (bk.diaChi || t.diaBan) : (lot.origin && lot.origin.seller ? 'Tự chế biến tại cơ sở' : t.diaBan),
      hoSo: hs.map(c => ({ ten: c.ten, so: c.so || null, hetHan: c.expires || null })),
      /* Ba thứ CỐ TÌNH không trả về, và nói rõ ra để bên mua biết là có nguyên tắc,
         không phải hệ thống thiếu dữ liệu. */
      khongCongKhai: [
        'Tên và giấy tờ của nông dân bán hàng',
        'Giá mua vào và giá vốn của hộ',
        'Danh sách khách hàng khác của hộ',
      ],
    };
  }

  /** Lô nào đã bán ra thì mới có mã cho bên mua tra. */
  function loDaBan(t) {
    const ra = [];
    (t.invoices || []).forEach(inv => (inv.lines || []).forEach(l => (l.lots || []).forEach(u => {
      ra.push({ lot: u.lot, qty: u.qty, hoaDon: inv.id, khach: inv.buyer, ngay: inv.date,
                ma: maTraCuu(t, u.lot) });
    })));
    return ra;
  }

  SM.quyen = { VAI, TEN_QUYEN, vaiCua, nguoiDung, doiVai, duocLam, bangQuyen,
               thietBi, thuHoiThietBi, noiLuuDuLieu,
               maTraCuu, traCuuCongKhai, loDaBan };
})(window);
