/**
 * sm-b2g.js — SỔ TRỰC ONBOARDING cho bảng điều khiển Chương trình (b2g.html)
 * SoloMatrix v4 — PLAN B.11 (6 mục Sổ trực + việc hôm nay + định mức + đợt OA)
 * + D-#12 (khối «Căn cứ hành vi») · INTERFACE mục 6 · agent W5.
 *
 * Nâng cấp W9 (20/08/2026) theo W0-PHAN-BIEN-CAU-HOI.md mục 4:
 * C1 media query <=480px (điện thoại cán bộ) · C2 cột «dở ở câu mấy» ·
 * C4 ghi kết quả việc (đang chờ / đã gọi – hẹn / xong) · C5 «Soạn tin nhắc
 * cuối buổi» vào hộp thư in-app của hộ (N-09: tối đa 1 tin/ngày/hộ) ·
 * vá KPI «Hộ đang theo dõi» · vá ngữ nghĩa khối «Hạn 30 ngày» khi mốc
 * vượt ngưỡng còn ở tương lai.
 *
 * Toàn bộ nội dung hiển thị: TIẾNG VIỆT CÓ DẤU. KHÔNG chứa ký tự CJK.
 *
 * Ranh giới IV.8 giữ nguyên: Sổ trực chỉ hiện TRẠNG THÁI + NGÀY của từng hộ —
 * không doanh thu, không đơn hàng, không tin nhắn chi tiết.
 *
 * Dữ liệu: 3 tenant thật (SM.db) + 48 hộ mô phỏng từ SM.seedB2G() (W4, file
 * sm-seed-b2g.js). Seed chưa nạp thì các khối tự hiện «đang nạp dữ liệu» —
 * khối Suất QR vẫn chạy vì chỉ cần localStorage riêng.
 */
(function (global) {
  'use strict';
  const SM = global.SM, F = SM.fmt, E = F.esc;

  const KEY_SUAT = SM.NS + 'b2g-suat';            // đề W5: «lưu smv3:b2g-suat»
  const KEY_VIEC = SM.NS + 'b2g-viec';            // C4 (W9): trạng thái việc của cán bộ theo ngày
  const KEY_TIN = SM.NS + 'b2g-tin';              // C5 (W9): đếm tin nhắc hộ mô phỏng đã soạn trong ngày
  const KY_TU_MA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bỏ O/I/0/1 — khỏi nhầm khi đọc

  /* ═══ Nhãn hiển thị ═══ */

  const BUOC_TEN = {
    chua_kich_hoat: 'Chưa kích hoạt',
    kich_hoat: 'Đã nhận suất, chưa trả lời câu hỏi',
    da_tra_loi: 'Đã trả lời câu hỏi mở đầu',
    da_sinh_danh_muc: 'Đã có danh mục việc cần nối',
    dang_noi: 'Đang nối từng việc',
    du_toi_thieu: 'Đủ mức tối thiểu',
    xong_viec_dau: 'Đã xong việc đầu tiên',
    bo_qua_tam: 'Tạm dừng, dùng app trước',
  };

  const KN_TEN = {
    bank: 'Ngân hàng (nhận tiền về)', zalooa: 'Zalo OA', hddt: 'Hoá đơn điện tử',
    cts: 'Chữ ký số', etax: 'Kê khai thuế điện tử', ketoan: 'Phần mềm kế toán Nhà nước',
    pos: 'Máy tính tiền', shopee: 'Sàn Shopee', tiktok: 'Sàn TikTok', lazada: 'Sàn Lazada',
    ghn: 'Giao Hàng Nhanh', ghtk: 'Giao Hàng Tiết Kiệm', vtp: 'Viettel Post',
  };
  const KN_LUAT = ['hddt', 'cts', 'etax'];       // nhóm BẮT BUỘC THEO LUẬT (B.1)

  function tenKN(ma) { return KN_TEN[ma] || 'Dịch vụ ' + ma; }

  function knThe(k) {                              // thẻ trạng thái một dịch vụ
    if (!k || !k.trangThai) return null;
    const M = {
      chua_hoi: ['no', 'Chưa hỏi'], chua_co_tk: ['warn', 'Chưa có tài khoản'],
      dang_dang_ky: ['br', 'Đang làm dở'], cho_duyet: ['br', 'Chờ duyệt'],
      da_ket_noi: ['ok', 'Đã nối'], loi: ['crit', 'Bị lỗi'],
      bo_qua: ['no', 'Đã bỏ'], hoan: ['warn', 'Đang hoãn'],
    };
    return M[k.trangThai] || ['no', k.trangThai];
  }

  /* ═══ Ngày tháng — bản nội bộ, không phụ thuộc module v4 khác đang dựng song song ═══ */

  function soNgay(a, b) {                          // b − a (nguyên, có thể âm)
    const p = s => { const q = String(s).slice(0, 10).split('-'); return Date.UTC(+q[0], +q[1] - 1, +q[2]); };
    return Math.round((p(b) - p(a)) / 86400000);
  }
  function laCuoiTuan(iso) {
    const p = String(iso).slice(0, 10).split('-');
    const w = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay();
    return w === 0 || w === 6;
  }
  /** cộng n NGÀY LÀM VIỆC (bỏ T7/CN) — cùng nghĩa ON.congNgayLamViec (W1) */
  function congNgayLamViec(iso, n) {
    let x = String(iso).slice(0, 10), them = n;
    while (them > 0) { x = SM.dayOffset(x, 1); if (!laCuoiTuan(x)) them--; }
    return x;
  }
  function soPhut(a, b) {
    const x = Date.parse(a), y = Date.parse(b);
    return isNaN(x) || isNaN(y) ? null : Math.round((y - x) / 60000);
  }

  /* ═══ Nguồn dữ liệu ═══ */

  function lay(r, ks) {                            // lấy trường đầu khác rỗng
    for (let i = 0; i < ks.length; i++) {
      const v = r ? r[ks[i]] : null;
      if (v !== undefined && v !== null) return v;
    }
    return null;
  }
  function knDict(kn) {                            // chấp nhận object hoặc mảng từ seed
    if (!kn) return {};
    if (Array.isArray(kn)) {
      const o = {};
      kn.forEach(k => { if (k) o[k.ma || k.id] = k; });
      return o;
    }
    return kn;
  }

  /** 48 hộ mô phỏng (W4) — chuẩn hoá về một shape; seed chưa có thì trả [] */
  function hoMoPhong() {
    if (typeof SM.seedB2G !== 'function') return [];
    let goc = null;
    try { goc = SM.seedB2G(); } catch (e) { return []; }
    const ds = Array.isArray(goc) ? goc
      : (goc && Array.isArray(goc.ho)) ? goc.ho
      : (goc && Array.isArray(goc.ds)) ? goc.ds : [];
    return ds.map((r, i) => {
      const ob = r.onboarding || {};
      const vd = lay(r, ['viecDauTien']) || ob.viecDauTien || {};
      let phut = lay(r, ['phutTuKichHoat', 'phut']);
      if (phut === null && vd.doneLuc && vd.batDauLuc) phut = soPhut(vd.batDauLuc, vd.doneLuc);
      return {
        id: lay(r, ['id', 'ma']) || 'GL' + (i + 1),
        ma: lay(r, ['ma', 'suat', 'maSuat']) || (r.license && r.license.ma) || null,
        ten: lay(r, ['ten', 'name']) || ('Hộ số ' + (i + 1)),
        diaBan: lay(r, ['diaBan', 'dia_ban']) || '—',
        nganh: lay(r, ['nganh']) || '—',
        buoc: lay(r, ['buoc']) || ob.buoc || null,
        canBo: lay(r, ['canBo', 'maCanBo']) || (ob.coCanBo ? ob.coCanBo.maCanBo : null),
        vuotLuc: lay(r, ['vuotLuc']) || null,
        ketNoi: knDict(lay(r, ['ketNoi']) || ob.ketNoi),
        nhatKy: lay(r, ['nhatKy']) || [],
        phut: phut === null ? null : Math.max(1, Math.round(phut)),
        dot: lay(r, ['dotNopOA', 'dot']) || null,
      };
    });
  }

  /** 3 tenant thật trong kho — CD1 phải lên khối Hạn 30 ngày (nghiệm thu B.11) */
  function hoThat() {
    return SM.tenantIds().map(id => {
      const t = SM.tenant(id);
      const ob = t.onboarding || {};
      const vd = ob.viecDauTien || {};
      let phut = null;
      if (vd.doneLuc && vd.batDauLuc) phut = soPhut(vd.batDauLuc, vd.doneLuc);
      const kn = knDict(ob.ketNoi);
      return {
        that: true, id: t.id,
        /* W9-vá số: hộ thật «đang theo dõi» = có license HOẶC activatedAt — loại tenant demo trắng cd4-moi */
        dayDu: !!(t.license || t.activatedAt),
        onb: {                                   // C2: dữ liệu dở của hộ thật (đọc t.onboarding)
          boQuaLuc: ob.boQuaLuc || null,
          buocTruocKhiBoQua: ob.buocTruocKhiBoQua || null,
          manDangCho: ob.manDangCho || null,
          cau: (ob.ob2 && ob.ob2.cau) || null,   // câu OB-2 đang dở (1..5)
          soCauTL: demCauTraLoi(ob.traLoi),
        },
        ma: (t.license && t.license.ma) || null,
        ten: t.name, diaBan: t.diaBan, nganh: t.nganh,
        buoc: ob.buoc || null,
        canBo: ob.coCanBo ? ob.coCanBo.maCanBo : null,
        vuotLuc: t.vuotLuc || null,
        ketNoi: kn, nhatKy: t.nhatKy || [],
        phut: phut === null ? null : Math.max(1, Math.round(phut)),
        dot: lay(t, ['dotNopOA']) || (kn.zalooa ? lay(kn.zalooa, ['dot']) : null) || null,
      };
    });
  }

  function tatCaHo() { return hoThat().concat(hoMoPhong()); }
  function seedSan() { return typeof SM.seedB2G === 'function'; }

  /* ═══ C2 (W9) — «hộ đang dở màn/câu mấy» · hộ thật đọc t.onboarding, hộ mô phỏng suy từ buoc ═══ */

  const MAN_TEN = {
    obkichhoat: 'mở đầu (nhận suất kích hoạt)',
    obnhandien: 'phần trả lời câu hỏi',
    obdanhmuc: 'phần chọn việc cần nối',
    obcon: 'phần nối việc đầu tiên',
  };
  /** cùng nghĩa manHienTaiTuBuoc của sm-onboard.js (W1) — file đó không nạp ở b2g nên chép logic */
  function manTuBuoc(buoc, cau) {
    if (buoc === 'chua_kich_hoat' || buoc === 'kich_hoat') return 'obkichhoat';
    if (buoc === 'da_tra_loi' || cau) return 'obnhandien';
    return 'obdanhmuc';
  }
  /** đếm câu OB-2 đã trả lời (0..5 — câu 1..5: nghề, giấy tờ, kênh, doanh thu, cách ghi bán) */
  function demCauTraLoi(tl) {
    if (!tl) return 0;
    let n = 0;
    ['nganh', 'giayTo', 'doanhThuUoc', 'posHienTai'].forEach(k => { if (tl[k]) n++; });
    if (tl.kenh && tl.kenh.length) n++;
    return n;
  }
  /** nhãn «dở ở câu mấy» cho Sổ trực + sheet Xem hộ — trả {cls, text} */
  function dangCho(h) {
    if (h.that) {
      const ob = h.onb || {};
      const cau = ob.cau || null;
      const daTL = ob.soCauTL || 0;
      if (h.buoc === 'bo_qua_tam') {
        const man = ob.manDangCho || manTuBuoc(ob.buocTruocKhiBoQua, cau);
        return { cls: 'warn', text: 'Bấm «Để sau» ' + (ob.boQuaLuc ? F.dm(ob.boQuaLuc) : '') + ' — còn dở ở ' + (MAN_TEN[man] || man) + (cau ? ' (câu ' + cau + '/5)' : '') };
      }
      if (h.buoc === 'chua_kich_hoat') return { cls: 'no', text: 'Chưa quét mã suất — chưa bắt đầu câu hỏi' };
      if (h.buoc === 'kich_hoat' || h.buoc === 'da_tra_loi')
        return { cls: 'warn', text: 'Đang dở câu ' + (cau || Math.min(daTL + 1, 5)) + '/5 — đã trả lời ' + daTL + ' câu' };
      return { cls: 'ok', text: 'Đã xong phần hỏi (' + daTL + '/5 câu) — đang làm phần việc nối' };
    }
    /* 48 hộ mô phỏng: seed không có màn/câu — số câu sinh XÁC ĐỊNH từ mã hộ (SM.hash), ghi rõ mô phỏng */
    if (h.buoc === 'kich_hoat')
      return { cls: 'warn', text: 'Đang dở câu ' + (1 + SM.hash(h.ma || h.id) % 5) + '/5 (số câu suy từ mã hộ — mô phỏng)' };
    if (h.buoc === 'da_tra_loi') return { cls: 'ok', text: 'Đã trả lời đủ 5 câu' };
    if (h.buoc === 'chua_kich_hoat') return { cls: 'no', text: 'Chưa quét mã suất' };
    return { cls: 'ok', text: 'Đã xong phần hỏi — đang nối việc' };
  }

  /* ═══ Hạn 30 ngày [Q-001] — luc = ngày cuối kỳ vượt 1 tỷ, han = luc + 30 ngày lịch ═══ */

  function han30(h) {
    let luc = h.vuotLuc;
    if (!luc && h.that && SM.dom && SM.dom.mocVuotNguong) {   // W2 có hàm thì dùng
      const mv = SM.dom.mocVuotNguong(SM.tenant(h.id));
      if (mv) luc = mv.luc;
    }
    if (!luc) return null;
    const han = SM.dayOffset(luc, 30);
    /* W9-vá ngữ nghĩa: mốc vượt ngưỡng còn ở tương lai → kỳ tính thuế CHƯA KẾT THÚC,
       đồng hồ 30 ngày chưa chạy — không hiện «còn N ngày» (N>30 gây hiểu nhầm đồng hồ đang chạy) */
    return { luc, han, conLai: soNgay(SM.CLOCK.today, han), chuaDenLuc: soNgay(SM.CLOCK.today, luc) > 0 };
  }

  /* ═══ Suất QR — GL26-XXXX-XXXX, kho riêng smv3:b2g-suat (P3) ═══ */

  function docSuat() {
    try {
      const s = localStorage.getItem(KEY_SUAT);
      const v = s ? JSON.parse(s) : null;
      return v && typeof v === 'object' ? v : { seq: 0, ds: [] };
    } catch (e) { return { seq: 0, ds: [] }; }
  }
  function ghiSuat(o) {
    try { localStorage.setItem(KEY_SUAT, JSON.stringify(o)); } catch (e) { console.warn('[SM.b2g] không ghi được suất:', e); }
  }
  function buocMa(seq) {                            // mã xác định theo số thứ tự — tái lập được
    const cs = [];
    for (let i = 0; i < 8; i++) cs.push(KY_TU_MA[SM.hash('GL26:' + seq + ':' + i) % KY_TU_MA.length]);
    return 'GL26-' + cs.slice(0, 4).join('') + '-' + cs.slice(4).join('');
  }
  function sinhSuat(n) {
    const o = docSuat();
    const co = {};
    o.ds.forEach(s => { co[s.ma] = 1; });
    for (let i = 0; i < n; i++) {
      let ma;
      do { o.seq += 1; ma = buocMa(o.seq); } while (co[ma]);
      co[ma] = 1;
      o.ds.push({ ma, capLuc: SM.CLOCK.today, inLuc: null, inBoi: null });
    }
    ghiSuat(o);
    return o;
  }
  function danhDauIn(ma, cb) {
    const o = docSuat();
    const s = o.ds.find(x => x.ma === ma);
    if (!s) return;
    s.inBoi = cb; s.inLuc = SM.CLOCK.today;
    ghiSuat(o);
  }
  /** trạng thái suất là HÀM TÍNH: đã dùng nếu một tenant đã gắn license trùng mã */
  function theSuat(s) {
    const dung = SM.tenantIds().some(id => {
      const l = SM.tenant(id).license;
      return l && l.ma === s.ma;
    });
    if (dung) return ['ok', 'Đã dùng'];
    if (s.inBoi) return ['br', 'Đã in'];
    return ['no', 'Chưa cấp'];
  }
  /** ô QR giả lập — vẽ theo mã, tái lập được, ghi rõ là mô phỏng */
  function qrGia(ma) {
    const N = 21, cell = 9;
    let h = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const den = SM.hash(ma + ':' + x + ',' + y) % 2 === 0;
      h += '<i style="width:' + cell + 'px;height:' + cell + 'px;background:' + (den ? '#14191B' : '#FFF') + '"></i>';
    }
    return '<div style="display:inline-grid;grid-template-columns:repeat(' + N + ',' + cell + 'px);border:6px solid #14191B;background:#FFF">' + h + '</div>';
  }

  /* ═══ C4 (W9) — ghi kết quả cuộc gọi ngay ở Sổ trực: đang chờ / đã gọi – hẹn / xong ═══
     Khoá việc = mã hộ + loại việc + NGÀY — trạng thái chỉ sống trong hôm nay:
     «xong» gập xuống cuối hôm nay; sáng mai mở lại, việc hiện như mới (không treo
     thẻ «xong» cũ), cán bộ không gọi trùng việc đã xử lý của hôm trước.          */

  function docViec() {
    try {
      const s = localStorage.getItem(KEY_VIEC);
      const v = s ? JSON.parse(s) : null;
      return v && typeof v === 'object' ? v : {};
    } catch (e) { return {}; }
  }
  function ghiTrangThaiViec(khoa, tt) {
    const o = docViec();
    o[khoa + '@' + SM.CLOCK.today] = tt;
    try { localStorage.setItem(KEY_VIEC, JSON.stringify(o)); }
    catch (e) { console.warn('[SM.b2g] không ghi được trạng thái việc:', e); }
  }
  function trangThaiViec(khoa) { return khoa ? (docViec()[khoa + '@' + SM.CLOCK.today] || 'cho') : 'cho'; }

  /* ═══ C5 (W9) — «Soạn tin nhắc cuối buổi»: tin trong ứng dụng của hộ, không Zalo broadcast ═══ */

  /** ≤1 tin/ngày/hộ (N-09) — ưu tiên hàm chốt ON.duocDayTin (W1); sm-onboard không nạp ở b2g thì
      tự đếm + tự ghi dòng nhật ký CÙNG SHAPE (viec 'dayTin', kèm ngày) để hai đường đọc chung nhau */
  function duocDayTinFallback(t) {
    const daDay = (t.nhatKy || []).some(n => n.viec === 'dayTin' && n.ngay === SM.CLOCK.today);
    if (daDay) return false;
    t.nhatKy = t.nhatKy || [];
    t.nhatKy.push({ id: 'NK' + String(t.nhatKy.length + 1).padStart(4, '0'), luc: new Date().toISOString(),
                    ngay: SM.CLOCK.today, ai: 'Hộ kinh doanh', viec: 'dayTin',
                    doiTuong: 'Đẩy tin nhắc ngoài app (gom mọi việc trong ngày)',
                    truoc: null, sau: null, lyDo: 'Ngân sách 1 tin/ngày/hộ — N-09' });
    SM.save();
    return true;
  }
  /** đếm tin nhắc hộ mô phỏng đã soạn hôm nay — chỉ đếm demo, không có hộp thư thật */
  function demTinMoPhong() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY_TIN)) || null;
      return v && v.ngay === SM.CLOCK.today ? v.so : 0;
    } catch (e) { return 0; }
  }
  function tangTinMoPhong() {
    try { localStorage.setItem(KEY_TIN, JSON.stringify({ ngay: SM.CLOCK.today, so: demTinMoPhong() + 1 })); }
    catch (e) { /* không ghi được kho — đếm demo mất ở lần tải sau, vô hại */ }
  }
  /** nội dung «nhà mình còn thiếu gì» — rút từ việc ưu tiên cao nhất của hộ */
  function viecThieuChoTin(v) {
    if (!v) return 'một việc còn dở';
    if (v.loai === 'Hạn 30 ngày') return 'hồ sơ đăng ký hoá đơn điện tử';
    if (v.loai === 'Chờ duyệt quá hạn') return 'bổ sung hồ sơ ' + (v.tenKN || 'đang chờ duyệt');
    if (v.loai === 'Hoãn việc nhóm LUẬT') return 'việc ' + (v.tenKN || 'nhóm luật') + ' còn dở';
    return 'một việc còn dở';
  }
  /** bấm nút: mỗi hộ có việc hôm nay nhận tối đa 1 tin in-app (N-09); hộ mô phỏng chỉ tăng đếm */
  function nhacTinCuoiBuoi(chonCBHienTai) {
    if (!SM.inbox || typeof SM.inbox.push !== 'function')
      return { loi: 'Chưa nạp sm-inbox.js — không gửi được tin vào hộp thư của hộ thật.' };
    const hs = tatCaHo()
      .filter(h => chonCBHienTai === 'tatca' || h.canBo === chonCBHienTai)
      .filter(h => viecCuaHo(h).length);
    const kq = { daDay: 0, daCo: 0, moPhong: 0, loi: null };
    hs.forEach(h => {
      const v = viecCuaHo(h)[0];                       // việc ưu tiên cao nhất của hộ
      const thieu = viecThieuChoTin(v);
      if (h.that) {
        const t = SM.tenant(h.id);
        if (!t) return;
        const duoc = (SM.onb && typeof SM.onb.duocDayTin === 'function')
          ? SM.onb.duocDayTin(t) : duocDayTinFallback(t);
        if (!duoc) { kq.daCo++; return; }              // hộ đã có tin hôm nay — bỏ, không gửi trùng
        SM.inbox.push(t.id, {
          nguonId: 'app', loaiSuKien: 'canh-bao',
          tieuDe: 'Nhà mình còn thiếu ' + thieu + ' — mai cán bộ ' + (h.canBo || 'địa bàn') + ' qua',
          payload: { loaiTin: 'nhac-onboarding', viecThieu: thieu, maCanBo: h.canBo || null, ngay: SM.CLOCK.today },
        });
        kq.daDay++;
      } else { tangTinMoPhong(); kq.moPhong++; }
    });
    return kq;
  }

  /* ═══ Việc hôm nay của cán bộ — gộp khối 4 + 5 + 6 thành dòng hành động ═══ */

  function viecCuaHo(h) {
    const ds = [];
    const m30 = han30(h);
    if (m30) {
      const hd = h.ketNoi.hddt;
      const daXong = hd && hd.trangThai === 'da_ket_noi';
      if (!daXong) {
        if (m30.chuaDenLuc) ds.push({ muc: 'br', loai: 'Hạn 30 ngày', khoa: h.id + '|han30', tenKN: 'Hoá đơn điện tử', text: 'Ghé ' + h.ten + ' — kỳ tính thuế dự kiến chốt ' + F.dmy(m30.luc) + ': nhắc sẵn hồ sơ hoá đơn điện tử, đồng hồ 30 ngày bắt đầu chạy từ mốc đó' });
        else if (m30.conLai < 0) ds.push({ muc: 'crit', loai: 'Hạn 30 ngày', khoa: h.id + '|han30', tenKN: 'Hoá đơn điện tử', text: 'Ghé ngay ' + h.ten + ' — ĐÃ QUÁ HẠN ' + (0 - m30.conLai) + ' ngày đăng ký hoá đơn điện tử' });
        else ds.push({ muc: m30.conLai < 7 ? 'warn' : 'br', loai: 'Hạn 30 ngày', khoa: h.id + '|han30', tenKN: 'Hoá đơn điện tử', text: 'Ghé ' + h.ten + ' — còn ' + m30.conLai + ' ngày hạn đăng ký hoá đơn điện tử, hết ' + F.dmy(m30.han) });
      }
    }
    Object.keys(h.ketNoi).forEach(ma => {
      const k = h.ketNoi[ma];
      if (!k || k.trangThai !== 'cho_duyet' || !k.hanDuKien) return;
      const qua = soNgay(k.hanDuKien, SM.CLOCK.today);
      if (qua > 0) ds.push({ muc: 'crit', loai: 'Chờ duyệt quá hạn', khoa: h.id + '|choduyet|' + ma, tenKN: tenKN(ma), text: 'Gọi lại ' + h.ten + ' — ' + tenKN(ma) + ' chờ duyệt đã quá ' + qua + ' ngày dự kiến' });
    });
    KN_LUAT.forEach(ma => {
      const k = h.ketNoi[ma];
      if (!k) return;
      const hoan = k.trangThai === 'hoan' || k.hoan === true;
      const lyDo = lay(k, ['lyDoHoan', 'hoanLyDo', 'lyDo']);
      if (hoan) ds.push({ muc: 'warn', loai: 'Hoãn việc nhóm LUẬT', khoa: h.id + '|hoan|' + ma, tenKN: tenKN(ma), text: 'Hẹn lại ' + h.ten + ' — đang hoãn ' + tenKN(ma) + (lyDo ? ' (lý do: ' + lyDo + ')' : '') + '. Việc luật không tự mất, cán bộ theo tới cùng' });
    });
    return ds;
  }

  /* ═══ Định mức nhân sự — phân bố phút-tới-việc-đầu (mọi cột annotate giá trị) ═══ */

  function phanBoPhut(hs) {
    const moc = [0, 15, 30, 45, 60, Infinity];
    const nhan = ['0–15 phút', '15–30 phút', '30–45 phút', '45–60 phút', 'trên 60 phút'];
    const cb = [0, 0, 0, 0, 0], tl = [0, 0, 0, 0, 0];
    let tcb = 0, ncb = 0, ttl = 0, ntl = 0;
    hs.forEach(h => {
      if (h.phut === null || h.buoc !== 'xong_viec_dau') return;   // chỉ đo hộ đã xong việc đầu
      let i = moc.length - 2;
      for (let j = 0; j < moc.length - 1; j++) if (h.phut >= moc[j] && h.phut < moc[j + 1]) { i = j; break; }
      if (h.canBo) { cb[i]++; tcb += h.phut; ncb++; } else { tl[i]++; ttl += h.phut; ntl++; }
    });
    return {
      nhan, cb, tl,
      tbCb: ncb ? Math.round(tcb / ncb) : null, nCb: ncb,
      tbTl: ntl ? Math.round(ttl / ntl) : null, nTl: ntl,
    };
  }

  /* ═══ Nhóm đợt nộp OA (theo tuần) — ngày dự kiến duyệt +2–3 ngày làm việc [Q-004] ═══ */

  function nhomDotOA(hs) {
    const nhom = {};
    hs.forEach(h => {
      const kn = h.ketNoi.zalooa;
      if (!kn) return;
      const daNop = kn.trangThai === 'cho_duyet' || kn.trangThai === 'da_ket_noi' || (kn.hoSoDaNop && kn.hoSoDaNop.length);
      const dot = h.dot || lay(kn, ['dot']);
      if (!daNop || !dot) return;
      const key = String(dot);
      const g = nhom[key] = nhom[key] || { key, so: 0, nopLuc: null, duKien: null };
      g.so++;
      const nl = lay(kn, ['batDauLuc', 'nopLuc']);
      if (nl && (!g.nopLuc || nl < g.nopLuc)) g.nopLuc = nl;
      const dk = kn.hanDuKien || (nl ? congNgayLamViec(nl, 3) : null);   // +2–3 ngày làm việc [Q-004]
      if (dk && (!g.duKien || dk > g.duKien)) g.duKien = dk;
    });
    return Object.keys(nhom).sort().map(k => nhom[k]);
  }

  /* ═══ Khối «Căn cứ hành vi» (D-#12) — 4 con số [Q-004], nhãn nguồn ghi cạnh, không giấu ═══ */

  const CAN_CU = [
    { so: '75%', ten: 'Điện thoại là máy chính của chủ hộ', nhan: '2021, khảo sát Facebook ủy quyền, n=999 · [Q-004]' },
    { so: '62%', ten: 'Chủ hộ nhỏ dùng app nhắn tin cho việc bán hàng', nhan: '2021, khảo sát Facebook ủy quyền, n=999 · [Q-004]' },
    { so: 'về cơ bản chưa có', ten: 'Kiến thức tài chính của hộ kinh doanh', nhan: 'nhận định tại hội nghị Cục Thuế 6/2025 · [Q-004]', chu: true },
    { so: F.num(37000), ten: 'Hộ trên 1 tỷ phải dùng hoá đơn điện tử máy tính tiền', nhan: 'số hộ thuộc diện bắt buộc · [Q-004]' },
  ];

  /* ═══ HTML của từng khối ═══ */

  function tag(cls, txt) { return '<span class="tag ' + cls + '">' + E(txt) + '</span>'; }
  function theBuoc(buoc) {
    if (!buoc || !BUOC_TEN[buoc]) return '<span class="tag no">chưa rõ</span>';
    const cls = buoc === 'xong_viec_dau' ? 'ok' : (buoc === 'dang_noi' || buoc === 'du_toi_thieu' ? 'br' : 'no');
    return tag(cls, BUOC_TEN[buoc]);
  }
  function ghiDangNap(them) {
    return '<div class="note warn">Đang nạp dữ liệu mô phỏng — 48 hộ của khoá sẽ hiện ở đây' + (them ? '. ' + them : '') + '.</div>';
  }

  function kpisDau(hs, chonCB) {
    const cbSet = {};
    hs.forEach(h => { if (h.canBo) cbSet[h.canBo] = 1; });
    const soCB = Object.keys(cbSet).length;
    const hoCuaCB = chonCB === 'tatca' ? hs : hs.filter(h => h.canBo === chonCB);
    const viec = [];
    hoCuaCB.forEach(h => viecCuaHo(h).forEach(v => viec.push(v)));
    const quaHan = viec.filter(v => v.muc === 'crit').length;
    const suat = docSuat().ds;
    const chuaDung = suat.filter(s => theSuat(s)[1] !== 'Đã dùng').length;
    /* W9-vá số: đếm hộ thật = tenant có license HOẶC activatedAt — tenant demo trắng ra hàng riêng,
       số hiển thị = đúng tổng các nhóm ghi trong chữ (không còn lệch 52 vs «3+48») */
    const thatDangTheo = hs.filter(h => h.that && h.dayDu).length;
    const trangChuaVao = hs.filter(h => h.that && !h.dayDu).length;
    const moPhong = hs.filter(h => !h.that).length;
    return '<div class="kpis" style="margin-bottom:14px">'
      + '<div><div class="k">Hộ đang theo dõi</div><div class="v">' + (thatDangTheo + moPhong) + '</div><div class="n">' + thatDangTheo + ' hộ thật + ' + moPhong + ' hộ mô phỏng' + (trangChuaVao ? ' — thêm ' + trangChuaVao + ' hộ demo trắng chưa vào theo dõi' : '') + '</div></div>'
      + '<div><div class="k">Cán bộ địa bàn</div><div class="v">' + soCB + '</div><div class="n">mã CB-01… CB-06</div></div>'
      + '<div><div class="k">Việc hôm nay' + (chonCB === 'tatca' ? '' : ' · ' + chonCB) + '</div><div class="v ' + (viec.length ? 'warn' : 'ok') + '">' + viec.length + '</div><div class="n">gộp hạn 30 ngày + chờ quá hạn + hoãn luật</div></div>'
      + '<div><div class="k">Việc cấp bách</div><div class="v ' + (quaHan ? 'crit' : 'ok') + '">' + quaHan + '</div><div class="n">đã quá hạn, phải xử lý ngay</div></div>'
      + '<div><div class="k">Suất chưa dùng</div><div class="v">' + chuaDung + '</div><div class="n">trong ' + suat.length + ' suất đã sinh</div></div>'
      + '</div>';
  }

  function khungViecHomNay(hs, chonCB, dsCB) {
    const hoCuaCB = chonCB === 'tatca' ? hs : hs.filter(h => h.canBo === chonCB);
    const dong = [];
    hoCuaCB.forEach(h => {
      const vv = viecCuaHo(h);
      vv.forEach(v => dong.push({ h, v }));
    });
    dong.sort((a, b) => {
      const xongA = trangThaiViec(a.v.khoa) === 'xong' ? 1 : 0;    // việc «xong» gập xuống cuối (C4)
      const xongB = trangThaiViec(b.v.khoa) === 'xong' ? 1 : 0;
      if (xongA !== xongB) return xongA - xongB;
      const m = { crit: 0, warn: 1, br: 2 };
      return (m[a.v.muc] || 3) - (m[b.v.muc] || 3);
    });
    let h = '<section><h2>Việc hôm nay của cán bộ</h2>'
      + '<p class="lede">Mỗi dòng là một việc cần làm hôm nay — gọi xong bấm ghi ngay kết quả, khỏi lo mai gọi trùng.</p>'
      + '<div class="card"><div class="hd"><h4>Gộp từ khối 4 + 5 + 6</h4><span class="sub">'
      + '<label for="b2gChonCb">Cán bộ: </label><select id="b2gChonCb" data-chon-cb>'
      + '<option value="tatca"' + (chonCB === 'tatca' ? ' selected' : '') + '>Tất cả cán bộ</option>'
      + dsCB.map(c => '<option value="' + E(c.ma) + '"' + (chonCB === c.ma ? ' selected' : '') + '>' + E(c.ma) + ' · ' + c.soHo + ' hộ</option>').join('')
      + '</select></span><button type="button" class="pri" data-nhac-tin="1" style="margin-left:8px"'
      + ' title="Gửi vào thư trong ứng dụng của hộ — không qua đường Zalo trả phí, mỗi hộ tối đa 1 tin mỗi ngày">Soạn tin nhắc cuối buổi</button></div><div class="bd">';
    if (!seedSan()) h += ghiDangNap('dưới đây mới chỉ là các hộ thật trong kho');
    h += '<div class="note" style="background:var(--sunk)">«Soạn tin nhắc cuối buổi»: tin trong ứng dụng của hộ (không qua đường Zalo trả phí — không tốn phí) — mỗi hộ tối đa 1 tin/ngày, hộ đã có tin trong hôm nay tự bỏ không gửi trùng. Hộ mô phỏng chỉ tăng đếm demo: đã soạn ' + demTinMoPhong() + ' tin hôm nay.</div>';
    if (!dong.length) h += '<div class="note ok">Không có việc nào đang treo cho ' + (chonCB === 'tatca' ? 'cả tổ' : E(chonCB)) + ' — hạn nào cũng còn dư thời gian.</div>';
    else {
      h += '<div class="b2g-vd">' + dong.map(x => {
        const tt = trangThaiViec(x.v.khoa);
        return '<div class="b2g-viec' + (tt === 'xong' ? ' b2g-viec-xong' : '') + '">'
          + tag(x.v.muc === 'crit' ? 'crit' : x.v.muc, x.v.loai)
          + '<span class="b2g-vt">' + E(x.v.text) + '</span>'
          + '<span class="b2g-tt">'
          + [['cho', 'Đang chờ'], ['hen', 'Đã gọi – hẹn'], ['xong', 'Xong']].map(p =>
            '<button type="button"' + (tt === p[0] ? ' class="pri"' : '')
            + ' data-viec-trang="' + p[0] + '" data-khoa="' + E(x.v.khoa) + '">' + p[1] + '</button>').join('')
          + '</span>'
          + '<button type="button" data-xem-ho="' + E(x.h.id) + '">Xem hộ</button></div>';
      }).join('') + '</div>'
      + '<div class="note" style="background:var(--sunk);margin:12px 0 0">Trạng thái việc tính theo HÔM NAY — việc «xong» gập xuống cuối. Sáng mai mọi việc tự hiện lại như mới (không treo «xong» cũ) để cán bộ theo tới cùng, không việc luật nào tự mất.</div>';
    }
    h += '</div></div></section>';
    return h;
  }

  function khungSuatQR() {
    const o = docSuat();
    const dsCB = danhSachCB(tatCaHo());
    let h = '<section><h2>Khối 1 — Suất QR của Chương trình</h2>'
      + '<p class="lede">Sinh mã suất, cán bộ in ra mang đi — hộ quét mã là kích hoạt ngay.</p>'
      + '<div class="card"><div class="hd"><h4>Mã suất GL26</h4><span class="sub">'
      + '<label for="b2gSuatCb">Cán bộ in: </label><select id="b2gSuatCb">'
      + dsCB.map(c => '<option value="' + E(c.ma) + '">' + E(c.ma) + '</option>').join('')
      + '</select> </span><button type="button" class="pri" data-sinh="10" style="margin-left:8px">Sinh 10 suất</button></div>'
      + '<div class="bd">';
    if (!o.ds.length) {
      h += '<div class="note br">Chưa có suất nào. Bấm «Sinh 10 suất» để sinh loạt mã đầu — mã mô phỏng định dạng GL26-XXXX-XXXX, lưu ở kho «smv3:b2g-suat» của máy này.</div>';
    } else {
      h += '<div class="scrollx" style="border:none;border-radius:0"><table>'
        + '<thead><tr><th>Mã suất</th><th>Cấp ngày</th><th>Trạng thái</th><th>Ai in</th><th></th></tr></thead><tbody>'
        + o.ds.slice().reverse().map(s => {
          const t = theSuat(s);
          return '<tr><td class="mono"><b>' + E(s.ma) + '</b></td>'
            + '<td class="mono">' + E(F.dmy(s.capLuc)) + '</td>'
            + '<td>' + tag(t[0], t[1]) + '</td>'
            + '<td>' + (s.inBoi ? E(s.inBoi) : '—') + '</td>'
            + '<td><button type="button" data-in-suat="' + E(s.ma) + '">In QR</button></td></tr>';
        }).join('')
        + '</tbody></table></div>'
        + '<div class="note" style="background:var(--sunk);margin:12px 0 0">Trạng thái «Đã dùng» tự tính khi hộ kích hoạt mã — không ai gõ tay. Hộ quét QR là đường chính, gõ tay 12 ký tự là đường dự phòng (P3).</div>';
    }
    h += '</div></div></section>';
    return h;
  }

  function danhSachCB(hs) {
    const bag = {};
    hs.forEach(h => { if (h.canBo) bag[h.canBo] = (bag[h.canBo] || 0) + 1; });
    return Object.keys(bag).sort().map(ma => ({ ma, soHo: bag[ma] }));
  }

  function khungHoAiTheo(hs, chonCB) {
    const ds = chonCB === 'tatca' ? hs : hs.filter(h => h.canBo === chonCB);
    let h = '<section><h2>Khối 2 — Hộ ai theo</h2>'
      + '<p class="lede">Nhìn một chỗ biết hộ nào của ai, đang ở bước nào, còn dở câu mấy.</p>'
      + '<div class="scrollx"><table><thead><tr><th>Hộ</th><th>Địa bàn</th><th>Ngành</th><th>Cán bộ theo</th><th>Đang ở bước</th><th>Dở ở câu mấy</th></tr></thead><tbody>';
    if (!ds.length) h += '<tr><td colspan="6">' + (seedSan() ? 'Không có hộ nào của cán bộ này.' : 'Đang nạp dữ liệu…') + '</td></tr>';
    else h += ds.map(x => {
      const dc = dangCho(x);                     // C2: hộ thật đọc t.onboarding, hộ mô phỏng suy từ buoc
      return '<tr>'
      + '<td><b>' + E(x.ten) + '</b>' + (x.that ? ' <span class="tag br">hộ thật</span>' : '') + (x.ma ? '<div class="mono" style="font-size:11.5px;color:var(--ink3)">' + E(x.ma) + '</div>' : '') + '</td>'
      + '<td>' + E(x.diaBan) + '</td><td>' + E(x.nganh) + '</td>'
      + '<td>' + (x.canBo ? E(x.canBo) : '<span class="tag no">chưa gán</span>') + '</td>'
      + '<td>' + theBuoc(x.buoc) + '</td>'
      + '<td><span class="b2g-do-' + dc.cls + '">' + E(dc.text) + '</span></td></tr>';
    }).join('');
    h += '</tbody></table></div>'
      + '<div class="note br" style="margin-top:12px">Ranh giới IV.8: bảng này chỉ có trạng thái + ngày — không có doanh thu hay đơn hàng của hộ.</div></section>';
    return h;
  }

  function khungXacNhanTay(hs) {
    const dong = [];
    hs.forEach(h => {
      (h.nhatKy || []).forEach(n => {
        const cb = lay(n, ['maCanBo']) || (/^CB-\d/.test(n.ai || '') ? n.ai : null);
        if (!cb) return;
        dong.push({ h, n, cb, viec: n.viec || 'Xác nhận đã nối', lyDo: n.lyDo || null, ngay: n.ngay || (n.luc || '').slice(0, 10) });
      });
    });
    dong.sort((a, b) => (a.ngay < b.ngay ? 1 : -1));
    let h = '<section><h2>Khối 3 — Cán bộ xác nhận tay «đã nối»</h2>'
      + '<p class="lede">Mỗi lần cán bộ bấm xác nhận hộ thay vì chờ tín hiệu ngoài — ghi ở đây, không nuốt vào đâu được.</p>'
      + '<div class="card"><div class="bd">';
    if (!dong.length) h += seedSan() ? '<div class="note ok">Chưa có lần xác nhận tay nào — mọi việc nối đều có tín hiệu từ bên ngoài xác nhận.</div>' : ghiDangNap();
    else {
      h += '<div class="scrollx" style="border:none;border-radius:0"><table>'
        + '<thead><tr><th>Ngày</th><th>Cán bộ</th><th>Hộ</th><th>Việc</th><th>Lý do xác nhận tay</th></tr></thead><tbody>'
        + dong.map(d => '<tr><td class="mono">' + E(F.dmy(d.ngay)) + '</td><td>' + E(d.cb) + '</td>'
          + '<td><b>' + E(d.h.ten) + '</b></td><td>' + E(d.viec) + '</td>'
          + '<td style="color:var(--ink2)">' + (d.lyDo ? E(d.lyDo) : '—') + '</td></tr>').join('')
        + '</tbody></table></div>';
    }
    h += '</div></div>'
      + '<div class="note warn" style="margin-top:12px">Điều kiện chống «đạt giả»: dòng này phải hiện ở CẢ nhật ký của hộ VÀ Sổ trực này (B.11) — chỉ một nơi là chưa đủ.</div></section>';
    return h;
  }

  function khungHan30(hs) {
    const dong = hs.map(h => ({ h, m: han30(h) })).filter(x => x.m);
    dong.sort((a, b) => a.m.conLai - b.m.conLai);
    let h = '<section><h2>Khối 4 — Hạn 30 ngày đăng ký hoá đơn điện tử [Q-001]</h2>'
      + '<p class="lede">Hộ vượt ngưỡng 1 tỷ có 30 ngày lịch để đăng ký — hạn nào cũng là việc của tổ, không tự mất.</p>'
      + '<div class="scrollx"><table><thead><tr><th>Hộ</th><th>Ngày cuối kỳ vượt ngưỡng</th><th>Hết hạn</th><th>Còn lại</th><th>Cán bộ</th></tr></thead><tbody>';
    if (!dong.length) h += '<tr><td colspan="5">' + (seedSan() ? 'Không có hộ nào đang đếm lùi hạn 30 ngày.' : 'Đang nạp dữ liệu…') + '</td></tr>';
    else h += dong.map(x => {
      const cl = x.m.chuaDenLuc ? tag('no', 'kỳ thuế chưa chốt')
        : x.m.conLai < 0 ? tag('crit', 'ĐÃ QUÁ HẠN ' + (0 - x.m.conLai) + ' ngày')
        : x.m.conLai < 7 ? tag('warn', 'Còn ' + x.m.conLai + ' ngày')
        : tag('no', 'Còn ' + x.m.conLai + ' ngày');
      return '<tr><td><b>' + E(x.h.ten) + '</b>' + (x.h.that ? ' <span class="tag br">hộ thật</span>' : '') + '</td>'
        + '<td class="mono">' + E(F.dmy(x.m.luc)) + '</td>'
        + '<td class="mono"><b>' + E(F.dmy(x.m.han)) + '</b></td>'
        + '<td>' + cl
        + (x.m.chuaDenLuc ? '<div style="font-size:11.5px;color:var(--ink3);margin-top:3px">Kỳ tính thuế chưa kết thúc — bắt đầu đếm 30 ngày từ ' + E(F.dmy(x.m.luc)) + ', hạn ' + E(F.dmy(x.m.han)) + '</div>' : '')
        + '</td>'
        + '<td>' + (x.h.canBo ? E(x.h.canBo) : '<span class="tag no">chưa gán</span>') + '</td></tr>';
    }).join('');
    h += '</tbody></table></div>'
      + '<div class="note" style="background:var(--sunk);margin-top:12px">Vàng: còn dưới 7 ngày. Đỏ: đã quá hạn — Tổ công tác vào việc, app không coi hộ cháy hạn là «đã đạt» (B.1). Hộ ghi «kỳ thuế chưa chốt»: mốc vượt ngưỡng nằm ở tương lai — đồng hồ 30 ngày chưa chạy nên không đếm «còn N ngày» cho N lớn gây hiểu nhầm.</div></section>';
    return h;
  }

  function khungQuaHanCho(hs) {
    const dong = [];
    hs.forEach(h => Object.keys(h.ketNoi).forEach(ma => {
      const k = h.ketNoi[ma];
      if (!k || k.trangThai !== 'cho_duyet' || !k.hanDuKien) return;
      const qua = soNgay(k.hanDuKien, SM.CLOCK.today);
      if (qua > 0) dong.push({ h, ma, qua, han: k.hanDuKien });
    }));
    dong.sort((a, b) => b.qua - a.qua);
    let h = '<section><h2>Khối 5 — Chờ duyệt đã quá ngày dự kiến</h2>'
      + '<p class="lede">Hồ sơ đã gửi, bên thứ ba hứa ngày đó mà chưa trả lời — việc gọi lại hộ.</p>'
      + '<div class="scrollx"><table><thead><tr><th>Hộ</th><th>Việc đang chờ</th><th>Dự kiến xong</th><th>Đã quá</th><th></th></tr></thead><tbody>';
    if (!dong.length) h += '<tr><td colspan="5">' + (seedSan() ? 'Không có hồ sơ nào chờ quá hạn — mọi lời hứa ngày đang giữ đúng.' : 'Đang nạp dữ liệu…') + '</td></tr>';
    else h += dong.map(d => '<tr><td><b>' + E(d.h.ten) + '</b></td><td>' + E(tenKN(d.ma)) + '</td>'
      + '<td class="mono">' + E(F.dmy(d.han)) + '</td>'
      + '<td>' + tag('crit', 'quá ' + d.qua + ' ngày') + '</td>'
      + '<td><button type="button" data-xem-ho="' + E(d.h.id) + '">Xem hộ</button></td></tr>').join('');
    h += '</tbody></table></div></section>';
    return h;
  }

  function khungHoanLuat(hs) {
    const dong = [];
    hs.forEach(h => KN_LUAT.forEach(ma => {
      const k = h.ketNoi[ma];
      if (!k) return;
      const hoan = k.trangThai === 'hoan' || k.hoan === true;
      if (!hoan) return;
      dong.push({ h, ma, lyDo: lay(k, ['lyDoHoan', 'hoanLyDo', 'lyDo']) || '(chưa ghi lý do)', tuLuc: lay(k, ['hoanTu', 'batDauLuc']) });
    }));
    let h = '<section><h2>Khối 6 — Việc hoãn nhóm LUẬT</h2>'
      + '<p class="lede">Hộ hoãn hoá đơn, chữ ký số kèm lý do — app không để việc luật «biến mất», chỉ chuyển cho cán bộ theo tiếp.</p>'
      + '<div class="scrollx"><table><thead><tr><th>Hộ</th><th>Việc luật đang hoãn</th><th>Lý do hộ nói</th><th>Ngày hoãn</th><th>Cán bộ theo</th></tr></thead><tbody>';
    if (!dong.length) h += '<tr><td colspan="5">' + (seedSan() ? 'Không có hộ nào đang hoãn việc nhóm luật.' : 'Đang nạp dữ liệu…') + '</td></tr>';
    else h += dong.map(d => '<tr><td><b>' + E(d.h.ten) + '</b></td><td>' + E(tenKN(d.ma)) + '</td>'
      + '<td style="color:var(--ink2)">' + E(d.lyDo) + '</td>'
      + '<td class="mono">' + (d.tuLuc ? E(F.dmy(d.tuLuc)) : '—') + '</td>'
      + '<td>' + (d.h.canBo ? E(d.h.canBo) : '<span class="tag no">chưa gán</span>') + '</td></tr>').join('');
    h += '</tbody></table></div>'
      + '<div class="note crit" style="margin-top:12px">Nhóm LUẬT không có «bỏ qua hợp lệ» — chỉ hoãn + cán bộ theo (B.1). Hộ cháy hạn là việc của Tổ công tác, không phải số liệu bị xoá đi cho gọn.</div></section>';
    return h;
  }

  function khungDinhMuc(hs) {
    const pb = phanBoPhut(hs);
    const dsCB = danhSachCB(hs);
    const soHo = hs.length, soCB = dsCB.length || 1;
    let h = '<section><h2>Định mức nhân sự</h2>'
      + '<p class="lede">Bao nhiêu hộ cho một cán bộ, và hộ có cán bộ ngồi cạnh làm việc đầu nhanh hơn bao nhiêu.</p>'
      + '<div class="kpis" style="margin-bottom:14px">'
      + '<div><div class="k">Hộ mỗi cán bộ</div><div class="v">' + (soHo ? Math.round(soHo / soCB * 10) / 10 : 0) + '</div><div class="n">' + soHo + ' hộ chia ' + soCB + ' cán bộ</div></div>'
      + '<div><div class="k">Phút tới việc đầu · có cán bộ</div><div class="v">' + (pb.tbCb === null ? '—' : pb.tbCb) + '</div><div class="n">trung bình ' + pb.nCb + ' hộ đã xong</div></div>'
      + '<div><div class="k">Phút tới việc đầu · tự làm</div><div class="v">' + (pb.tbTl === null ? '—' : pb.tbTl) + '</div><div class="n">trung bình ' + pb.nTl + ' hộ đã xong</div></div>'
      + '</div>';
    const maxC = Math.max(1, Math.max.apply(null, pb.cb.concat(pb.tl)));
    const CAO = 110;
    h += '<div class="card"><div class="hd"><h4>Phân bố thời gian từ mở app tới việc đầu tiên xong</h4>'
      + '<span class="sub"><i class="b2g-ma1"></i> có cán bộ cùng làm · <i class="b2g-ma2"></i> hộ tự làm</span></div>'
      + '<div class="bd"><div class="b2g-chart">'
      + pb.nhan.map((n, i) =>
        '<div class="b2g-nhom">'
        + '<div class="b2g-cot"><b>' + pb.cb[i] + '</b><i style="height:' + Math.max(pb.cb[i] ? 3 : 0, Math.round(pb.cb[i] / maxC * CAO)) + 'px"></i></div>'
        + '<div class="b2g-cot b2g-tl"><b>' + pb.tl[i] + '</b><i style="height:' + Math.max(pb.tl[i] ? 3 : 0, Math.round(pb.tl[i] / maxC * CAO)) + 'px"></i></div>'
        + '<span>' + E(n) + '</span></div>'
      ).join('')
      + '</div>'
      + '<div class="note" style="background:var(--sunk);margin:12px 0 0">Số mô phỏng demo — tính từ mốc ghi trong dữ liệu từng hộ, không nhập tay. Đích đo là «thời gian tới việc-đầu-tiên-xong» (R-A2-07), không phải số tài khoản.</div>'
      + '</div></div></section>';
    return h;
  }

  function khungDotOA(hs) {
    const nhom = nhomDotOA(hs);
    let h = '<section><h2>Nhóm đợt nộp hồ sơ Zalo OA</h2>'
      + '<p class="lede">Cả khoá nộp theo đợt trong tuần — chờ duyệt theo đợt, không gọi từng hộ [Q-004].</p>'
      + '<div class="scrollx"><table><thead><tr><th>Đợt nộp</th><th class="r">Hồ sơ đã nộp</th><th>Nộp ngày</th><th>Dự kiến duyệt xong</th></tr></thead><tbody>';
    if (!nhom.length) h += '<tr><td colspan="4">' + (seedSan() ? 'Chưa có đợt nộp nào được ghi.' : 'Đang nạp dữ liệu…') + '</td></tr>';
    else h += nhom.map(g => '<tr><td><b>' + E(g.key) + '</b></td>'
      + '<td class="r num">' + g.so + '</td>'
      + '<td class="mono">' + (g.nopLuc ? E(F.dmy(g.nopLuc)) : '—') + '</td>'
      + '<td class="mono">' + (g.duKien ? '<b>' + E(F.dmy(g.duKien)) + '</b>' : '—') + '</td></tr>').join('');
    h += '</tbody></table></div>'
      + '<div class="note" style="background:var(--sunk);margin-top:12px">Ngày dự kiến duyệt = ngày nộp + 2–3 ngày làm việc (bỏ thứ 7, chủ nhật) — lead-time Zalo duyệt hồ sơ có giấy phép ĐKKD [Q-004].</div></section>';
    return h;
  }

  function khungCanCu() {
    let h = '<section><h2>Căn cứ hành vi — vì sao làm theo lối này</h2>'
      + '<p class="lede">Số liệu đang có về thói quen của chủ hộ nhỏ. Nguồn ghi cạnh từng số.</p>'
      + '<div class="kpis">'
      + CAN_CU.map(c => '<div><div class="k">' + E(c.ten) + '</div>'
        + '<div class="v"' + (c.chu ? ' style="font-size:17px;line-height:1.3"' : '') + '>' + E(c.so) + '</div>'
        + '<div class="n">' + E(c.nhan) + '</div></div>').join('')
      + '</div>'
      + '<div class="note warn" style="margin-top:12px">Không số nào trình bày như đo đạc mới nhất: hai tỷ lệ là số 2021 từ khảo sát Facebook ủy quyền n=999; nhận định kiến thức tài chính là lời nói tại hội nghị Cục Thuế 6/2025; con số 37.000 là diện hộ phải dùng hoá đơn điện tử máy tính tiền [Q-004].</div></section>';
    return h;
  }

  /* ═══ Sheet chi tiết hộ — chỉ trạng thái + ngày (IV.8) ═══ */

  function sheetHo(id) {
    const h = tatCaHo().find(x => x.id === id);
    if (!h) return;
    const m30 = han30(h);
    let body = '<div style="color:var(--ink3);font-size:12.5px;margin-bottom:10px">' + E(h.diaBan) + ' · ' + E(h.nganh) + (h.canBo ? ' · cán bộ ' + E(h.canBo) : '') + '</div>'
      + '<div style="margin-bottom:6px">' + theBuoc(h.buoc) + (h.that ? ' <span class="tag br">hộ thật trong kho</span>' : '') + '</div>'
      + '<div style="margin-bottom:10px;font-size:13.5px"><b>Đang dở:</b> <span class="b2g-do-' + dangCho(h).cls + '">' + E(dangCho(h).text) + '</span></div>';
    if (m30) {
      const cl = m30.conLai < 0 ? 'crit' : (m30.conLai < 7 && !m30.chuaDenLuc) ? 'warn' : 'br';
      body += '<div class="note ' + cl + '">Hạn 30 ngày đăng ký hoá đơn điện tử [Q-001]: '
        + (m30.chuaDenLuc
          ? 'kỳ tính thuế chưa kết thúc — dự kiến bắt đầu đếm 30 ngày từ <b>' + E(F.dmy(m30.luc)) + '</b>, hạn <b>' + E(F.dmy(m30.han)) + '</b>.'
          : 'hết <b>' + E(F.dmy(m30.han)) + '</b> — ' + (m30.conLai < 0 ? 'ĐÃ QUÁ HẠN ' + (0 - m30.conLai) + ' ngày' : 'còn ' + m30.conLai + ' ngày') + '.') + '</div>';
    }
    const mas = Object.keys(h.ketNoi);
    body += mas.length
      ? '<div class="scrollx" style="border:none"><table><thead><tr><th>Việc đang nối</th><th>Trạng thái</th><th>Ngày gửi</th><th>Dự kiến / ghi chú</th></tr></thead><tbody>'
        + mas.map(ma => {
          const k = h.ketNoi[ma], t = knThe(k);
          return '<tr><td>' + E(tenKN(ma)) + '</td><td>' + (t ? tag(t[0], t[1]) : '—') + '</td>'
            + '<td class="mono">' + (k.batDauLuc ? E(F.dmy(k.batDauLuc)) : '—') + '</td>'
            + '<td>' + (k.hanDuKien ? 'dự kiến ' + E(F.dmy(k.hanDuKien)) : (k.lyDo ? E(k.lyDo) : '—')) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
      : '<div class="note" style="background:var(--sunk)">Hộ chưa có việc nối nào đang mở.</div>';
    body += '<div class="note" style="background:var(--sunk);margin-bottom:0">Chỉ trạng thái + ngày (IV.8) — dữ liệu bán hàng, doanh thu, tin nhắn của hộ không đưa ra màn này.</div>';
    moSheet('Chi tiết hộ: ' + E(h.ten), body);
  }

  function sheetQR(ma, cb) {
    const s = docSuat().ds.find(x => x.ma === ma);
    if (!s) return;
    const body = '<div style="text-align:center;padding:6px 0 2px">'
      + qrGia(ma)
      + '<div class="mono" style="font-size:24px;font-weight:700;letter-spacing:.06em;margin-top:14px">' + E(ma) + '</div>'
      + '<div style="color:var(--ink2);margin-top:6px">Hộ quét mã này là kích hoạt ngay — hoặc gõ tay 12 ký tự ở ô dự phòng.</div>'
      + '<div style="color:var(--ink3);font-size:12.5px;margin-top:8px">Cấp ' + E(F.dmy(s.capLuc)) + (s.inBoi ? ' · cán bộ ' + E(s.inBoi) + ' in ' + E(F.dmy(s.inLuc)) : ' · chưa in') + '</div>'
      + '<div class="note warn" style="text-align:left;margin-top:12px">Ô QR trên là bản giả lập mô phỏng — bản thật in ra quét được bằng camera. Gắn tên cán bộ «' + E(cb) + '» vào lượt in này để biết ai phát suất (điều kiện P3).</div>'
      + '</div>';
    moSheet('In suất QR', body);
  }

  function moSheet(tieuDe, body) {
    let el = document.getElementById('b2gSheet');
    if (!el) {
      el = document.createElement('div');
      el.id = 'b2gSheet';
      el.addEventListener('click', e => { if (e.target.getAttribute('data-do-sheet') !== null || e.target === el) dongSheet(); });
      document.body.appendChild(el);
    }
    el.innerHTML = '<div class="b2g-sheet-card"><div class="b2g-sheet-hd"><b>' + tieuDe + '</b>'
      + '<button type="button" data-do-sheet="1">Đóng</button></div><div class="b2g-sheet-bd">' + body + '</div></div>';
    el.style.display = 'block';
  }
  function dongSheet() {
    const el = document.getElementById('b2gSheet');
    if (el) el.style.display = 'none';
  }

  /* ═══ Render chính + điều hướng tab ═══ */

  let chonCB = 'tatca';

  function render() {
    const se = document.getElementById('sotruc');
    if (!se) return;
    const hs = tatCaHo();
    const dsCB = danhSachCB(hs);
    if (!document.getElementById('b2gStyle')) {
      const st = document.createElement('style');
      st.id = 'b2gStyle';
      st.textContent = [
        '#b2gSheet{position:fixed;inset:0;background:rgba(20,25,27,.5);display:none;z-index:60;overflow:auto;padding:28px 16px}',
        '#b2gSheet .b2g-sheet-card{background:#FFF;border-radius:14px;max-width:640px;margin:0 auto;border:1px solid var(--line)}',
        '#b2gSheet .b2g-sheet-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 18px;border-bottom:1px solid var(--line)}',
        '#b2gSheet .b2g-sheet-bd{padding:16px 18px}',
        '.b2g-viec{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)}',
        '.b2g-viec:last-child{border-bottom:none}',
        '.b2g-viec .b2g-vt{flex:1;font-size:14px}',
        '.b2g-viec button{min-height:32px;font-size:12.5px}',
        '.b2g-chart{display:flex;align-items:flex-end;gap:18px;overflow-x:auto;padding:6px 2px 2px}',
        '.b2g-nhom{text-align:center;flex:1;min-width:86px}',
        '.b2g-cot{display:inline-flex;flex-direction:column;align-items:center;vertical-align:bottom;margin:0 3px}',
        '.b2g-cot b{font-size:12px;font-variant-numeric:tabular-nums;color:var(--ink2)}',
        '.b2g-cot i{display:block;width:34px;background:var(--brand);border-radius:4px 4px 0 0}',
        '.b2g-cot.b2g-tl i{background:var(--warn)}',
        '.b2g-nhom>span{display:block;font-size:11.5px;color:var(--ink3);margin-top:6px;border-top:1px solid var(--line2);padding-top:5px}',
        '.b2g-ma1,.b2g-ma2{display:inline-block;width:10px;height:10px;border-radius:3px;vertical-align:-1px}',
        '.b2g-ma1{background:var(--brand)} .b2g-ma2{background:var(--warn)}',
        '#b2gChonCb,#b2gSuatCb{min-height:34px;font:inherit;border:1px solid var(--line2);border-radius:8px;padding:0 8px;background:var(--card)}',
        '.b2g-tt{display:inline-flex;gap:6px;flex:none}',
        '.b2g-tt button{min-height:32px;font-size:12px;padding:0 10px}',
        '.b2g-viec.b2g-viec-xong .b2g-vt{color:var(--ink3);text-decoration:line-through}',
        '.b2g-do-warn{color:var(--warn)} .b2g-do-ok{color:var(--ink2)} .b2g-do-no{color:var(--ink3)}',
        /* C1 (W9): Sổ trực chạy trên ĐIỆN THOẠI cán bộ — mọi rule scoped #sotruc/#b2gSheet
           nên bảng điều khiển cũ (#app) không bị ảnh hưởng. Bảng: cuộn ngang. Nút: to >=44px. */
        '@media (max-width:480px){'
        + '#sotruc .kpis{grid-template-columns:repeat(2,1fr)}'
        + '#sotruc .two{grid-template-columns:1fr}'
        + '#sotruc .scrollx{overflow-x:auto;-webkit-overflow-scrolling:touch}'
        + '#sotruc button{min-height:44px;min-width:44px;font-size:15px;padding:0 12px}'
        + '#b2gSheet button{min-height:44px}'
        + '.b2g-viec{flex-wrap:wrap;row-gap:8px}'
        + '.b2g-vt{flex-basis:100%}'
        + '.b2g-chart{gap:10px}'
        + '}',
      ].join('\n');
      document.head.appendChild(st);
    }
    let h = '<section><h2>Sổ trực onboarding</h2>'
      + '<p class="lede">Một chỗ để cán bộ thấy ngay hộ nào đang kẹt ở đâu, việc gì phải làm hôm nay.</p>'
      + (seedSan() ? '' : '<div class="note warn">File dữ liệu mô phỏng 48 hộ (sm-seed-b2g.js) chưa nạp — các khối dưới tự đầy khi có dữ liệu. Khối Suất QR và 3 hộ thật vẫn chạy bình thường.</div>')
      + '</section>'
      + kpisDau(hs, chonCB)
      + khungViecHomNay(hs, chonCB, dsCB)
      + '<div class="two">' + khungSuatQR() + khungXacNhanTay(hs) + '</div>'
      + khungHoAiTheo(hs, chonCB)
      + '<div class="two">' + khungHan30(hs) + khungQuaHanCho(hs) + '</div>'
      + khungHoanLuat(hs)
      + khungDinhMuc(hs)
      + '<div class="two">' + khungDotOA(hs) + khungCanCu() + '</div>';
    se.innerHTML = h;
  }

  function mount() {
    const nav = document.getElementById('b2gNav');
    const app = document.getElementById('app');
    const wr = document.getElementById('sotrucWrap');
    const se = document.getElementById('sotruc');
    if (!nav || !app || !wr || !se) return;

    nav.addEventListener('click', e => {
      const b = e.target.closest('button[data-tab]');
      if (!b) return;
      const laSo = b.getAttribute('data-tab') === 'sotruc';
      Array.prototype.forEach.call(nav.querySelectorAll('button'), x => x.classList.toggle('pri', x === b));
      app.style.display = laSo ? 'none' : '';
      wr.style.display = laSo ? '' : 'none';
      if (laSo) render();
    });

    se.addEventListener('click', e => {
      const t = e.target;
      const vt = t.closest ? t.closest('[data-viec-trang]') : null;      // C4: ghi kết quả việc
      if (vt) {
        ghiTrangThaiViec(vt.getAttribute('data-khoa'), vt.getAttribute('data-viec-trang'));
        render();
        return;
      }
      const nt = t.closest ? t.closest('[data-nhac-tin]') : null;        // C5: soạn tin nhắc cuối buổi
      if (nt) {
        const kq = nhacTinCuoiBuoi(chonCB);
        if (kq.loi) { moSheet('Soạn tin nhắc cuối buổi', '<div class="note warn">' + E(kq.loi) + '</div>'); return; }
        render();
        moSheet('Soạn tin nhắc cuối buổi',
          '<div class="note ok">Đã gửi ' + kq.daDay + ' tin vào thư trong ứng dụng của hộ thật — mỗi hộ tối đa 1 tin/ngày, không gửi trùng.'
          + (kq.daCo ? ' ' + kq.daCo + ' hộ đã có tin trong hôm nay nên tự bỏ.' : '') + '</div>'
          + '<div class="note" style="background:var(--sunk);margin-bottom:0">Hộ mô phỏng: soạn thêm ' + kq.moPhong + ' tin demo hôm nay (không có hộp thư thật — chỉ đếm để thấy cách hoạt động). Đường Zalo trả phí không dùng ở đây vì là tin trong app.</div>');
        return;
      }
      const xem = t.closest ? t.closest('[data-xem-ho]') : null;
      if (xem) { sheetHo(xem.getAttribute('data-xem-ho')); return; }
      const inQ = t.closest ? t.closest('[data-in-suat]') : null;
      if (inQ) {
        const cbEl = document.getElementById('b2gSuatCb');
        const cb = cbEl && cbEl.value ? cbEl.value : 'CB-01';
        danhDauIn(inQ.getAttribute('data-in-suat'), cb);
        render();
        sheetQR(inQ.getAttribute('data-in-suat'), cb);
        return;
      }
      const sinh = t.closest ? t.closest('[data-sinh]') : null;
      if (sinh) { sinhSuat(parseInt(sinh.getAttribute('data-sinh'), 10) || 10); render(); return; }
    });
    se.addEventListener('change', e => {
      if (e.target && e.target.id === 'b2gChonCb') { chonCB = e.target.value; render(); }
    });

    SM.on('db:save', () => { if (wr.style.display !== 'none') render(); });
    SM.on('db:reseed', () => { if (wr.style.display !== 'none') render(); });
  }

  global.SM.b2g = {
    render, mount,
    sinhSuat, docSuat, han30, viecCuaHo, phanBoPhut, nhomDotOA, tatCaHo,
  };

  mount();
})(window);
