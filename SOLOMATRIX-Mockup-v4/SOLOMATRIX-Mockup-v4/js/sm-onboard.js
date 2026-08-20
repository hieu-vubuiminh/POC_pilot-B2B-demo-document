/**
 * sm-onboard.js — ONBOARDING LẦN ĐẦU + TRẠM KẾT NỐI (trái tim của v4).
 *
 * Vì sao có file này: v3 bắt hộ tự tìm nút «Nối» và tin vào cờ giả của toggleConnector.
 * v4 đảo ngược — nền tảng CHỦ ĐỘNG HỎI, hộ chỉ trả lời câu hỏi về chính mình; danh mục
 * kết nối là hàm tính từ câu trả lời; mọi chuyển trạng thái connector đi qua MỘT đường
 * duy nhất D.datTrangThaiKetNoi (sự kiện ngoài hoặc cán bộ xác nhận tay có nhật ký).
 *
 * Kim chỉ nam Quang 20/08: người dùng MÙ CÔNG NGHỆ. Mọi chữ trên màn là lời cán bộ nói
 * với cô chú; thuật ngữ kỹ thuật chỉ nằm trong khối «cài đặt nâng cao» hoặc comment.
 *
 * MỤC LỤC
 *   §0  Hằng THAM_SO_CONNECTOR (bảng C.1 — 12 id) + THU_TU niềm tin (C.14)
 *   §1  Máy trạng thái t.onboarding (B.1–B.4) — ON.trangThai · boQuaTam · moLai
 *   §2  ON.traLoi + ON.danhMucCho (B.6–B.7 — hàm thuần, không viết cứng kết quả)
 *   §3  Tiện ích hợp đồng: tienDo · congNgayLamViec · duocDayTin · cuaSoTin · xacNhanTayCanBo
 *   §4  OB-1 «Kích hoạt» — viewObKichHoat/bind (B.5, câu 0, Aa, QR sai 3 lần)
 *   §5  OB-2 «Nhận diện hộ» — viewObNhanDien/bind (B.6, 5 câu + rút gọn 2 câu)
 *   §6  OB-3 «Danh mục của hộ» — viewObDanhMuc/bind (B.7, 3 nhóm)
 *   §7  OB-4 «Luồng từng connector» — viewObCon/bind (B.8, 3 kiểu)
 *   §8  OB-5 «Trạm kết nối» — viewTram/bind (B.9 + độ tươi D-#2 + đứt D-#5 + D-#6)
 *   §9  OB-6 «Việc đầu tiên» (B.10 — đích đo R-A2-07)
 *   §10 «Tạm dừng dùng OPC» — viewTamDung/bind (B.15/P13, 4 bước)
 *   §11 Xuất SM.onb (alias ON)
 *
 * Không đăng ký router — mobile.html (W6) tự đăng ký theo INTERFACE mục 7.
 */
(function (global) {
  'use strict';
  const SM = global.SM;
  if (!SM || !SM.dom) throw new Error('sm-onboard.js cần sm-core.js và sm-domain.js');
  const D = SM.dom, F = SM.fmt, E = F.esc;
  const O = SM.ops || null; // sm-ops nạp trước file này trong mobile.html

  /* ═══════════ §0. THAM_SỐ CONNECTOR — bảng C.1, một nguồn duy nhiên ═══════════
     12 id đúng INTERFACE mục 1. Mọi ô «chưa rõ» giữ NGUYÊN chữ
     «chưa rõ thời gian — có cán bộ theo dõi» (B.0 nguyên tắc 7 — không bịa số). */
  const CHUA_RO = 'chưa rõ thời gian — có cán bộ theo dõi';
  const THAM_SO_CONNECTOR = {
    bank: {
      ten: 'Tài khoản ngân hàng + nhận tiền QR', kieu: 'tuc-thi', nhom: 'nen-co',
      xacNhan: 'SePay bắn webhook thử — nhận được là nối xong [Q-002]',
      leadTime: 'khoảng vài phút [Q-002]',
      aiBam: 'Hộ bấm «Xác nhận cấp quyền»; mã OTP ngân hàng gửi cho hộ — cán bộ không làm thay bước OTP (N-06)',
      tienQuyen: 'Tài khoản ngân hàng của hộ + mã OTP',
      hoSo: 'Tài khoản ngân hàng + OTP',
      phi: 'Theo ngân hàng hộ đang dùng',
      giaTri: 'Tiền về tới đâu app biết ngay, khỏi mở app ngân hàng đối chiếu',
      kichBan: 'tienVe', kichBanTrung: 'tien-ve-trung', /* v3 sẵn + W3 bổ sung (INTERFACE mục 4) */
    },
    zalooa: {
      ten: 'Zalo OA (trang kinh doanh Zalo)', kieu: 'cho-duyet', nhom: 'nen-co',
      xacNhan: 'Thông báo Zalo duyệt hồ sơ [Q-004]',
      leadTime: '2–3 ngày làm việc [Q-004]',
      aiBam: 'Chủ hộ bấm «Gửi đăng ký» — tên in trên nút (N-06)',
      tienQuyen: 'Giấy phép ĐKKD + tên OA + ảnh đại diện [Q-004]',
      hoSo: 'GP ĐKKD + tên OA + ảnh [Q-004]',
      phi: '8 tin miễn phí/48 giờ rồi 55đ/tin; tin Giao dịch 165đ/tin; cửa sổ trả lời 7 ngày [Q-005]',
      giaTri: 'Khách nhắn 22 giờ cũng có câu trả lời soạn sẵn',
      kichBan: 'zalo-duyet-xong',
    },
    hddt: {
      ten: 'Hoá đơn điện tử', kieu: 'dieu-kien', nhom: 'theo-luat',
      xacNhan: 'Phản hồi của cổng thuế hoặc nhà cung cấp [Q-002]',
      leadTime: 'Cổng miễn phí: 15 phút–1 ngày làm việc [Q-002]',
      aiBam: 'Chủ hộ bấm «Gửi đăng ký» (N-06)',
      tienQuyen: 'Mã số thuế + chữ ký số',
      hoSo: 'MST + CTS',
      phi: 'Cổng của cơ quan thuế miễn phí [Q-002]; nhà cung cấp: chưa rõ giá (Q-040)',
      giaTri: 'Khách sạn đòi hoá đơn là xuất được ngay, công nợ tự gắn theo hoá đơn',
      kichBan: 'cong-thue-phan-hoi',
    },
    cts: {
      ten: 'Chữ ký số', kieu: 'dieu-kien', nhom: 'theo-luat',
      xacNhan: 'Nhà cung cấp xác nhận (mô phỏng)',
      leadTime: CHUA_RO + ' (Q-041)',
      aiBam: 'Chủ hộ ký — không ai ký thay (N-06); đường chính là ký số online, không cần đồ cắm [Q-002]',
      tienQuyen: 'Bắt buộc cho phát hành hoá đơn, kê khai/nộp thuế, BHXH điện tử [Q-001]',
      hoSo: 'CHƯA CÓ BẰNG CHỨNG hồ sơ đăng ký cần gì (Q-041)',
      phi: 'Theo nhà cung cấp — ' + CHUA_RO + ' (Q-041)',
      giaTri: 'Ký tờ khai và phát hành hoá đơn ngay trên điện thoại, không cần ra nơi khác',
      kichBan: 'cts-kich-hoat',
    },
    etax: {
      ten: 'Kê khai thuế điện tử', kieu: 'dieu-kien', nhom: 'nen-co',
      xacNhan: 'Cán bộ xác nhận tay — có nhật ký kèm mã cán bộ',
      leadTime: 'Theo kỳ kê khai — mức chi tiết đang chờ hướng dẫn, app sẽ báo', /* nguồn: Q-023 */
      aiBam: 'Cán bộ mở phiên, hộ xác nhận và bấm «Nộp» (N-06)',
      tienQuyen: 'MST + CTS',
      hoSo: 'MST + CTS',
      phi: 'Miễn phí — cổng của Nhà nước [Q-001]',
      giaTri: 'Tờ khai app tính sẵn từ số bán thật, hộ chỉ đọc và bấm nộp',
      kichBan: 'thue-ky-ke-khai',
    },
    ketoan: {
      ten: 'Sổ kế toán (nền tảng Nhà nước)', kieu: 'de-sau', nhom: 'de-sau',
      xacNhan: null, leadTime: 'Chưa vận hành [Q-001 · NĐ 20/2026]',
      aiBam: '—', tienQuyen: '—', hoSo: '—',
      phi: 'Miễn phí khi vận hành [Q-001]',
      giaTri: 'Sổ theo Nhà nước — OPC chỉ dẫn sang, không làm thay (N-01)',
      kichBan: null,
    },
    shopee: {
      ten: 'Gian hàng Shopee', kieu: 'cho-duyet', nhom: 'nen-co',
      xacNhan: 'Open Platform cấp token [Q-002]',
      leadTime: 'Token 4 giờ, làm mới 1 tháng [Q-002]',
      aiBam: 'Hộ uỷ quyền trên trang chính chủ của Shopee — OPC không ký thay (N-06)',
      tienQuyen: 'Tài khoản người bán Shopee',
      hoSo: 'Tài khoản người bán',
      phi: 'Từ 27/05/2026 Shopee chỉ nhận kết nối qua Open Platform [Q-002]',
      giaTri: 'Đơn trên sàn về thẳng app, tồn kho tự trừ, khỏi chép tay',
      kichBan: 'don-san-moi',
    },
    tiktok: {
      ten: 'Gian hàng TikTok Shop', kieu: 'cho-duyet', nhom: 'nen-co',
      xacNhan: 'Mô phỏng — chưa có bằng chứng (Q-042)',
      leadTime: CHUA_RO + ' (Q-042)',
      aiBam: 'Hộ cấp quyền trên trang chính chủ',
      tienQuyen: 'Tài khoản người bán TikTok Shop',
      hoSo: 'Tài khoản người bán',
      phi: CHUA_RO + ' (Q-042)',
      giaTri: 'Đơn livestream và video về cùng một chỗ với đơn sàn khác',
      kichBan: 'don-san-moi',
    },
    lazada: {
      ten: 'Gian hàng Lazada', kieu: 'cho-duyet', nhom: 'nen-co',
      xacNhan: 'Mô phỏng — chưa có bằng chứng (Q-042)',
      leadTime: CHUA_RO + ' (Q-042)',
      aiBam: 'Hộ cấp quyền trên trang chính chủ',
      tienQuyen: 'Tài khoản người bán Lazada',
      hoSo: 'Tài khoản người bán',
      phi: CHUA_RO + ' (Q-042)',
      giaTri: 'Đơn Lazada về chung chỗ với Shopee, TikTok — một bảng đơn thôi',
      kichBan: 'don-san-moi',
    },
    shipper: {
      ten: 'Đơn vị vận chuyển', kieu: 'tuc-thi', nhom: 'nen-co',
      xacNhan: 'Webhook đổi trạng thái đơn (mô phỏng) — chọn hãng bên trong',
      leadTime: 'Theo hãng — ' + CHUA_RO + ' (Q-043)',
      aiBam: 'Hộ chọn hãng và cấp quyền',
      tienQuyen: 'Tài khoản hãng vận chuyển',
      hoSo: 'Tài khoản hãng (GHN / GHTK / Viettel Post)',
      phi: 'Tiền thu hộ (COD) về thẳng tài khoản ngân hàng của hộ (N-07)',
      giaTri: 'Đơn giao xong tự sang trạng thái đã bán, tiền thu hộ tự thành dòng tiền',
      kichBan: 'don-hang-cap-nhat',
    },
    pos: {
      ten: 'Máy tính tiền', kieu: 'dieu-kien', nhom: 'de-sau',
      xacNhan: 'Cán bộ xác nhận tay (máy tại quầy)',
      leadTime: '1 buổi tại quầy [tự đề xuất]',
      aiBam: 'Cán bộ lắp, hộ duyệt',
      tienQuyen: 'Máy tính tiền có sẵn tại quầy',
      hoSo: 'Máy tính tiền có sẵn',
      phi: 'Theo nơi bán máy — ' + CHUA_RO + ' (Q-044)',
      giaTri: 'Bán tại quầy xong là có hoá đơn điện tử khởi tạo từ máy tính tiền [Q-001]',
      kichBan: 'pos-phien-ban',
    },
    booking: {
      ten: 'Nền tảng đặt phòng/đặt tour', kieu: 'cho-duyet', nhom: 'nen-co',
      xacNhan: 'Nền tảng xác nhận (mô phỏng) — đại diện cả nhóm đặt trước',
      leadTime: CHUA_RO + ' (Q-045)',
      aiBam: 'Hộ cấp quyền trên trang chính chủ',
      tienQuyen: 'Tài khoản chỗ nghỉ/tour trên nền tảng',
      hoSo: 'Tài khoản chỗ nghỉ/tour',
      phi: 'Hoa hồng nền tảng 82.500đ/lượt — số mô phỏng [seed]',
      giaTri: 'Khách đặt phòng từ nền tảng vào thẳng lịch, trùng lịch là app từ chối ngay',
      kichBan: 'booking-moi',
    },
  };
  const DANH_SACH_ID = ['bank','zalooa','hddt','cts','etax','ketoan','shopee','tiktok','lazada','shipper','pos','booking'];
  /* Thứ tự niềm tin C.14: tiền về tức thì → đơn sàn → chống trùng → hoá đơn/kê khai. */
  const THU_TU = ['bank','zalooa','shopee','tiktok','lazada','shipper','hddt','cts','etax','booking','pos','ketoan'];
  /* «Đang chờ ai» trên Trạm — TÊN THẬT trước mặt hộ, bỏ «bên thứ ba» khỏi mọi màn hộ (W0 #11). */
  const CHO_AI = {
    bank: 'SePay và ngân hàng', zalooa: 'Zalo duyệt hồ sơ', hddt: 'cổng thuế hoặc nhà cung cấp hoá đơn',
    cts: 'nhà cung cấp chữ ký số', etax: 'kỳ kê khai — cán bộ mở phiên cùng hộ', ketoan: '',
    shopee: 'Shopee', tiktok: 'TikTok Shop', lazada: 'Lazada', shipper: 'hãng vận chuyển',
    pos: 'cán bộ xuống quầy lắp máy', booking: 'nền tảng đặt phòng',
  };
  /* 12+ ngân hàng SePay hỗ trợ [Q-002] — lựa chọn mô phỏng cho nhánh «Có rồi». */
  const NGAN_HANG = ['Vietcombank','BIDV','VietinBank','Agribank','Techcombank','MB Bank',
                     'ACB','VPBank','TPBank','Sacombank','HDBank','OCB'];
  /* Id KICH_BAN hợp lệ theo hợp đồng: v3 sẵn + W3 thêm (INTERFACE mục 4) — ngoài danh sách thì ẩn nút Mô phỏng. */
  const KICH_BAN_HOP_LE = ['tienVe','tien-ve-trung','ket-noi-dut','cong-thue-phan-hoi','zalo-duyet-xong','don-san-moi',
                           'sanTMDT','sanQuaTon','datPhong','datTrung','daGiao','khachHoi','thueTraLoi','thueTuChoi'];

  /* ═══════════ §1. MÁY TRẠNG THÁI t.onboarding (B.1–B.3) ═══════════ */

  const BUOC_HOP_LE = ['chua_kich_hoat','kich_hoat','da_tra_loi','da_sinh_danh_muc','dang_noi','du_toi_thieu','xong_viec_dau','bo_qua_tam'];

  /** Đọc/khởi tạo t.onboarding đúng shape B.3. KHÔNG đè gì seed đã ghi sẵn. */
  function trangThai(t) {
    if (!t.onboarding) {
      t.onboarding = {
        buoc: t.license ? 'kich_hoat' : 'chua_kich_hoat',
        boQuaLuc: null, buocTruocKhiBoQua: null, manDangCho: null,
        traLoi: { nguoiLamChinh: null, nganh: null, giayTo: null, kenh: [], doanhThuUoc: null, posHienTai: null,
          chacTren1Ty: false, deChoKeCan: false },
        ketNoi: {}, coCanBo: null,
        viecDauTien: { loai: null, batDauLuc: null, doneLuc: null },
        ob1: null, ob2: null, lichSu: [],
      };
      SM.save();
    }
    const ob = t.onboarding;
    ob.traLoi = ob.traLoi || { nguoiLamChinh: null, nganh: null, giayTo: null, kenh: [], doanhThuUoc: null, posHienTai: null,
          chacTren1Ty: false, deChoKeCan: false };
    ob.traLoi.kenh = ob.traLoi.kenh || [];
    ob.ketNoi = ob.ketNoi || {};
    ob.viecDauTien = ob.viecDauTien || { loai: null, batDauLuc: null, doneLuc: null };
    ob.lichSu = ob.lichSu || [];
    return ob;
  }

  function ghiNhatKy(t, m) {
    if (O && typeof O.ghiNhatKy === 'function') { O.ghiNhatKy(t, m); return; }
    t.nhatKy = t.nhatKy || [];
    t.nhatKy.push({ id: 'NK' + String(t.nhatKy.length + 1).padStart(4, '0'),
      luc: new Date().toISOString(), ngay: SM.CLOCK.today,
      ai: m.ai || 'Hộ kinh doanh', viec: m.viec, doiTuong: m.doiTuong || null,
      truoc: m.truoc === undefined ? null : m.truoc, sau: m.sau === undefined ? null : m.sau, lyDo: m.lyDo || null });
  }

  /** Chuyển bước tổng — đường duy nhất; kèm nhật ký. */
  function chuyenBuoc(t, buocMoi, lyDo) {
    const ob = trangThai(t);
    if (BUOC_HOP_LE.indexOf(buocMoi) < 0) return { ok: false, lyDo: 'Bước không hợp lệ: ' + buocMoi };
    const cu = ob.buoc;
    if (buocMoi === 'bo_qua_tam') {
      if (cu !== 'bo_qua_tam') { ob.buocTruocKhiBoQua = cu; ob.manDangCho = manHienTaiTuBuoc(cu, ob); }
      ob.boQuaLuc = SM.CLOCK.today;
    } else if (cu === 'bo_qua_tam' && buocMoi !== 'bo_qua_tam') {
      ob.buocTruocKhiBoQua = null; ob.manDangCho = null;
    }
    if (buocMoi === cu) return { ok: true, cu, moi: cu };
    ob.buoc = buocMoi;
    ghiNhatKy(t, { viec: 'Phần mở đầu: ' + cu + ' → ' + buocMoi, lyDo: lyDo || null });
    SM.save();
    return { ok: true, cu, moi: buocMoi };
  }

  /** Bấm «Để sau» ở giữa chừng — nhớ đúng màn + đúng câu đang dở. */
  function boQuaTam(t, man) {
    const ob = trangThai(t);
    chuyenBuoc(t, 'bo_qua_tam');
    if (man) ob.manDangCho = man;
    SM.save();
    return { ok: true };
  }

  /** Mở lại sau «Để sau» — quay về đúng bước cũ (B.1 dòng bo_qua_tam). */
  function moLai(t) {
    const ob = trangThai(t);
    const ve = ob.buocTruocKhiBoQua || 'kich_hoat';
    chuyenBuoc(t, ve, 'Mở lại phần đang dở');
    return ve;
  }
  function manHienTaiTuBuoc(buoc, ob) {
    if (buoc === 'chua_kich_hoat') return 'obkichhoat';
    if (buoc === 'kich_hoat') return 'obkichhoat';
    if (buoc === 'da_tra_loi' || (ob && ob.ob2 && ob.ob2.cau)) return 'obnhandien';
    return 'obdanhmuc';
  }

  /** Trạng thái connector trong danh mục (B.2) — chỉ ĐỌC. */
  function ketNoiCua(t, ma) {
    const ob = trangThai(t);
    return ob.ketNoi[ma] || { trangThai: 'chua_hoi' };
  }

  /** Đường chuyển trạng thái connector DUY NHẤT (ràng buộc W1: cấm tự set t.connections). */
  function datKetNoi(t, ma, trangThaiMoi, meta) {
    if (typeof D.datTrangThaiKetNoi !== 'function')
      return { ok: false, lyDo: 'sm-domain.js chưa có datTrangThaiKetNoi (việc W2 — chưa xong ở lượt build này)' };
    const r = D.datTrangThaiKetNoi(t, ma, trangThaiMoi, meta || {});
    if (r && r.ok) {
      const ob = trangThai(t);
      /* B.1: connector đầu tiên rời chua_hoi → dang_noi */
      if (ob.buoc === 'da_sinh_danh_muc' && trangThaiMoi !== 'chua_hoi') chuyenBuoc(t, 'dang_noi');
      capNhatDuToiThieu(t);
    }
    return r;
  }

  /** Định nghĩa đạt tối thiểu B.1: LUẬT xong hết + bank/zalooa nối hoặc bỏ-có-lý-do. */
  function datToiThieu(t) {
    const ob = trangThai(t);
    if (['du_toi_thieu', 'xong_viec_dau'].indexOf(ob.buoc) >= 0) return true;
    const dm = danhMucCho(t);
    const song = m => { const k = ketNoiCua(t, m.ma); return k.trangThai === 'da_ket_noi'; };
    const luatOk = dm.batBuoc.every(m => m.phiConnector || song(m));
    const cotLoi = ['bank', 'zalooa'].every(ma => {
      const k = ketNoiCua(t, ma);
      return k.trangThai === 'da_ket_noi' || (k.trangThai === 'bo_qua' && k.lyDoBoQua);
    });
    return luatOk && cotLoi;
  }
  function capNhatDuToiThieu(t) {
    const ob = trangThai(t);
    if (datToiThieu(t) && ['da_sinh_danh_muc', 'dang_noi'].indexOf(ob.buoc) >= 0) chuyenBuoc(t, 'du_toi_thieu');
  }

  /** Onboarding LẠI (B.12): không reset máy trạng thái, giữ dữ liệu, chỉ mở lại phần hỏi. */
  function lamLai(t) {
    const ob = trangThai(t);
    ob.lichSu.push({ ngay: SM.CLOCK.today, traLoi: JSON.parse(JSON.stringify(ob.traLoi)) });
    ob.ob2 = { cau: 1 };
    if (ob.buoc !== 'chua_kich_hoat') chuyenBuoc(t, 'kich_hoat', 'Onboarding lại — đổi điện thoại / đổi nghề / trả lời sai');
    ghiNhatKy(t, { viec: 'Hộ mở lại phần hỏi (đã từng dùng OPC)', });
    SM.save();
    return { ok: true };
  }

  /* ═══════════ §2. CÂU HỎI + DANH MỤC (B.6–B.7 — hàm thuần) ═══════════ */

  function traLoi(t, cau, giaTri) {
    const ob = trangThai(t);
    if (cau === 'kenh') {
      const i = (ob.traLoi.kenh || []).indexOf(giaTri);
      if (i >= 0) ob.traLoi.kenh.splice(i, 1); else ob.traLoi.kenh.push(giaTri);
    } else {
      ob.traLoi[cau] = giaTri;
    }
    SM.save();
    return { ok: true };
  }

  /**
   * Có thật sự vượt 1 tỷ không (W0 câu 4(d))?: một câu ĐOÁN của hộ không được sinh nhóm LUẬT.
   * Chỉ 2 đường: (i) số bán thật — t.vuotLuc hoặc D.mocVuotNguong; (ii) hộ chủ động khẳng định
   * «Tôi chắc cả năm bán trên 1 tỷ» (traLoi.chacTren1Ty). Trả {ok, vi: 'so-that'|'khang-dinh'}.
   */
  function vuotNguongThat(t) {
    const ob = trangThai(t);
    if (ob.traLoi.chacTren1Ty === true) return { ok: true, vi: 'khang-dinh' };
    if (t.vuotLuc) return { ok: true, vi: 'so-that' };
    if (typeof D.mocVuotNguong === 'function' && D.mocVuotNguong(t) !== null) return { ok: true, vi: 'so-that' };
    return { ok: false };
  }

  /**
   * Danh mục kết nối riêng của hộ — HÀM THUẦN từ traLoi (B.7 + ma trận C.13).
   * Mục phi-connector (canh ngưỡng, GPKD, thuế sàn, MISA, chuyển dữ liệu) có cờ phiConnector:true.
   */
  function danhMucCho(t) {
    const ob = trangThai(t);
    const tl = ob.traLoi;
    const batBuoc = [], nenCo = [], deSau = [];
    const coSan = (tl.kenh || []).indexOf('san') >= 0;
    const coB2B = (tl.kenh || []).indexOf('b2b') >= 0;
    const duLich = tl.nganh === 'du-lich';

    /* — Nhóm BẮT BUỘC THEO LUẬT (W0 câu 4(d)): KHÔNG sinh từ câu đoán — chỉ từ số bán thật
       (t.vuotLuc / D.mocVuotNguong) hoặc lời khẳng định «Tôi chắc cả năm bán trên 1 tỷ».
       Câu 4 (doanhThuUoc) chỉ còn vai trò XẾP THỨ TỰ gợi ý. — */
    const vuot = vuotNguongThat(t);
    if (vuot.ok) {
      const coSo = vuot.vi === 'khang-dinh'
        ? 'Cô/chú khẳng định cả năm bán trên 1 tỷ'
        : 'Số bán thật của nhà mình đã vượt 1 tỷ một năm';
      batBuoc.push({ ma: 'hddt', ten: THAM_SO_CONNECTOR.hddt.ten,
        viSao: coSo + ' — phải dùng hoá đơn điện tử có mã, đăng ký trong 30 ngày [Q-001]',
        nguon: 'Q-001' + (vuot.vi === 'khang-dinh' ? ' + lời khẳng định của hộ (traLoi.chacTren1Ty)' : ' + số bán thật (vuotLuc/mocVuotNguong)') });
      batBuoc.push({ ma: 'cts', ten: THAM_SO_CONNECTOR.cts.ten,
        viSao: coSo + ' — chữ ký số bắt buộc cho phát hành hoá đơn và kê khai điện tử [Q-001]', nguon: 'Q-001' });
      batBuoc.push({ ma: 'etax', ten: 'Kê khai thuế điện tử đầy đủ',
        viSao: coSo + ' — kê khai thuế bằng đường điện tử [Q-001]', nguon: 'Q-001' });
    } else {
      /* MỌI nhánh không khẳng định (kể cả trả lời «trên 1 tỷ» mà chưa bấm nút khẳng định):
         chỉ CANH — P4: không nói con số, không nói «ngưỡng»/«lũy kế» trước mặt hộ. */
      batBuoc.push({ ma: 'canh-nguong', ten: 'Canh khi nào cần hoá đơn', phiConnector: true,
        viSao: 'Theo cách bán hiện nay, cuối năm nhà mình có thể phải dùng hoá đơn điện tử — app canh giùm, tới lúc cần sẽ báo trước 30 ngày.',
        nguon: 'Q-001 + hàm lũy kế (mốc 800tr chỉ nằm trong nguồn màn hình — P4)' });
      nenCo.push({ ma: 'etax', ten: 'Kê khai thuế theo dòng tiền',
        viSao: 'Tự tính – tự khai sau khi bỏ thuế khoán; mức chi tiết từng kỳ đang chờ hướng dẫn — app sẽ báo', /* nguồn: Q-023 */
        nguon: 'Q-001 · NQ 198/2025/QH15' });
    }
    if (coSan) batBuoc.push({ ma: 'thue-san', ten: 'Ghi nhận thuế sàn khấu trừ nộp thay', phiConnector: true,
      viSao: 'Sàn đã nộp thay phần của hộ — app chỉ đối chiếu, không khai lại', nguon: 'Q-001·Q-019 · NĐ 117/2025' });
    if (tl.giayTo === 'chua-co') batBuoc.push({ ma: 'gpkd', ten: 'Checklist làm giấy phép kinh doanh (cán bộ đồng hành)', phiConnector: true,
      viSao: 'Hầu hết kết nối dưới đây cần giấy phép', nguon: 'Q-004 + THUMOI IV.6' });

    /* — Nhóm NÊN CÓ: vận hành + danh mục tối thiểu Chương trình — */
    nenCo.push({ ma: 'bank', ten: THAM_SO_CONNECTOR.bank.ten,
      viSao: 'Ngân hàng + QR — SePay nối 12+ ngân hàng [Q-002]', nguon: 'Q-002' });
    nenCo.push({ ma: 'zalooa', ten: THAM_SO_CONNECTOR.zalooa.ten,
      viSao: '62% hộ nhỏ dùng app nhắn tin cho kinh doanh [Q-004, số 2021]', nguon: 'Q-004' });
    if (coSan) {
      nenCo.push({ ma: 'shopee', ten: THAM_SO_CONNECTOR.shopee.ten, viSao: 'Sàn hộ đang bán — tối thiểu 3 sàn', nguon: 'THUMOI IV.3' });
      nenCo.push({ ma: 'tiktok', ten: THAM_SO_CONNECTOR.tiktok.ten, viSao: 'Sàn hộ đang bán — tối thiểu 3 sàn', nguon: 'THUMOI IV.3' });
      nenCo.push({ ma: 'lazada', ten: THAM_SO_CONNECTOR.lazada.ten, viSao: 'Sàn hộ đang bán — tối thiểu 3 sàn', nguon: 'THUMOI IV.3' });
      nenCo.push({ ma: 'shipper', ten: THAM_SO_CONNECTOR.shipper.ten, viSao: 'Vận chuyển cho đơn sàn — tối thiểu 3 hãng', nguon: 'THUMOI IV.3' });
    }
    if (duLich || (tl.kenh || []).indexOf('booking') >= 0 || (tl.kenh || []).indexOf('food') >= 0)
      nenCo.push({ ma: 'booking', ten: THAM_SO_CONNECTOR.booking.ten,
        viSao: duLich ? 'Du lịch: nền tảng đặt phòng/tour — tối thiểu 2 nền tảng' : 'Hộ nhận đặt trước qua nền tảng', nguon: 'THUMOI IV.3' });
    if (tl.doanhThuUoc === 'sap-1-ty') /* chỉ là GỢI Ý xếp thứ tự (W0 câu 4(d)) */
      nenCo.push({ ma: 'cts', ten: THAM_SO_CONNECTOR.cts.ten,
        viSao: 'Bán có thể tăng nhanh — ký số sớm cho kịp hạn 30 ngày nếu bán chạy hơn hẳn', nguon: 'Q-001' });
    if (coB2B && !vuot.ok)
      nenCo.push({ ma: 'hddt', ten: THAM_SO_CONNECTOR.hddt.ten,
        viSao: 'TỰ NGUYỆN — khách doanh nghiệp đòi hoá đơn (bán cho nhà hàng, công ty). Đây là nhu cầu của hộ, không phải luật đòi [Q-002]',
        nguon: 'Q-002 · hoà giải T5-2.2' });
    if (tl.posHienTai === 'may-tinh-tien')
      nenCo.push({ ma: 'pos', ten: THAM_SO_CONNECTOR.pos.ten,
        viSao: 'Đường hoá đơn điện tử khởi tạo từ máy tính tiền kết nối dữ liệu cơ quan thuế [Q-001]', nguon: 'Q-001' });

    /* — Nhóm ĐỂ SAU — */
    deSau.push({ ma: 'ketoan', ten: THAM_SO_CONNECTOR.ketoan.ten, viSao: 'Nền tảng dùng chung Nhà nước — giữ cờ «chưa vận hành» [Q-001 · NĐ 20/2026]', nguon: 'N-01' });
    if (tl.posHienTai !== 'may-tinh-tien' && nenCo.every(m => m.ma !== 'pos'))
      deSau.push({ ma: 'pos', ten: THAM_SO_CONNECTOR.pos.ten, viSao: 'Có máy tại quầy thì nối sau', nguon: 'Q-044' });
    if (tl.doanhThuUoc === 'duoi-1-ty' && nenCo.every(m => m.ma !== 'cts'))
      deSau.push({ ma: 'cts', ten: THAM_SO_CONNECTOR.cts.ten, viSao: 'Chưa bắt buộc — để khi cần phát hành hoá đơn', nguon: 'Q-001' });
    if (vuot.ok) /* P8/W0-P8: MISA chỉ đề cập khi hộ đã thật sự thuộc chế độ đầy đủ */
      deSau.push({ ma: 'misa', ten: 'Sổ kế toán MISA (nếu hộ đã dùng)', phiConnector: true,
        viSao: 'Nhà mình đang dùng MISA — OPC không thay nó; phần nối sang nhau đang kiểm tra, xong sẽ báo.', nguon: 'Q-002 · Q-021 (chưa có bằng chứng cơ chế)' });
    if (tl.posHienTai === 'phan-mem-khac')
      deSau.push({ ma: 'chuyen-du-lieu', ten: 'Chuyển dữ liệu từ phần mềm cũ', phiConnector: true,
        viSao: 'THUMOI IV.3 — không khóa dữ liệu, chuyển khi hộ sẵn sàng', nguon: 'THUMOI IV.3' });

    return { batBuoc, nenCo, deSau };
  }

  /** Danh mục phẳng chỉ connector thật (bỏ mục phi-connector) — dùng cho tienDo/Trạm. */
  function connectorTrongDanhMuc(t) {
    const dm = danhMucCho(t);
    const thuong = dm.batBuoc.concat(dm.nenCo).filter(m => !m.phiConnector);
    return { ds: thuong, deSau: dm.deSau.filter(m => !m.phiConnector), dm };
  }

  /* ═══════════ §3. TIỆN ÍCH HỢP ĐỒNG (INTERFACE mục 3) ═══════════ */

  /** Tiến độ 0..100 — HÀM TÍNH từ kho, chỉ mốc 4 bước đầu là hằng máy trạng thái (B.1). */
  function tienDo(t) {
    const ob = trangThai(t);
    const map = { chua_kich_hoat: 0, kich_hoat: 5, da_tra_loi: 15, da_sinh_danh_muc: 20 };
    if (ob.buoc === 'xong_viec_dau') return 100;
    if (ob.buoc === 'bo_qua_tam' && map[ob.buocTruocKhiBoQua] !== undefined) return map[ob.buocTruocKhiBoQua];
    if (map[ob.buoc] !== undefined) return map[ob.buoc];
    /* dang_noi / du_toi_thieu / bo_qua_tam-chưa-sinh-danh-mục: đếm theo danh mục */
    const { ds } = connectorTrongDanhMuc(t);
    if (!ds.length) return map.da_sinh_danh_muc || 20;
    const xong = ds.filter(m => { const k = ketNoiCua(t, m.ma);
      return k.trangThai === 'da_ket_noi' || (k.trangThai === 'bo_qua' && k.lyDoBoQua); }).length;
    const phanTram = Math.round(xong / ds.length * 100);
    if (ob.buoc === 'du_toi_thieu') return Math.max(70, Math.min(99, phanTram)); /* còn chờ việc đầu tiên */
    return phanTram;
  }

  /** Cộng n NGÀY LÀM VIỆC (bỏ thứ 7/chủ nhật) — B.3 dùng cho hanDuKien. */
  function congNgayLamViec(iso, n) {
    let cur = String(iso).slice(0, 10);
    let con = Math.abs(n), buoc = n >= 0 ? 1 : -1;
    while (con > 0) {
      cur = SM.dayOffset(cur, buoc);
      const dow = new Date(cur + 'T00:00:00Z').getUTCDay();
      if (dow !== 0 && dow !== 6) con--;
    }
    return cur;
  }

  /** Số ngày nguyên b − a (an toàn múi giờ, tính UTC). */
  function chenhNgay(a, b) {
    const pa = String(a).slice(0, 10).split('-'), pb = String(b).slice(0, 10).split('-');
    return Math.round((Date.UTC(+pb[0], +pb[1] - 1, +pb[2]) - Date.UTC(+pa[0], +pa[1] - 1, +pa[2])) / 86400000);
  }

  /** ≤1 tin đẩy ngoài app / ngày / hộ (B.9 — P9). True thì TỰ ghi nhật ký hanh_dong 'dayTin'. */
  function duocDayTin(t, ngay) {
    const ngayXet = ngay || SM.CLOCK.today;
    const daDay = (t.nhatKy || []).some(n => n.viec === 'dayTin' && n.ngay === ngayXet);
    if (daDay) return false;
    ghiNhatKy(t, { viec: 'dayTin', doiTuong: 'Đẩy tin nhắc ngoài app (gom mọi việc trong ngày)',
      lyDo: 'Ngân sách 1 tin/ngày/hộ — N-09' });
    SM.save();
    return true;
  }

  /**
   * Cửa sổ tin Zalo OA theo khách (C.2 — Q-005). Tính từ t.messages (tin cuối 2 chiều).
   * duongGui: 'tu-van-free' | 'tu-van-55d' | 'giao-dich-165d' — phi là đ/tin.
   */
  function cuaSoTin(t, tenKhach) {
    const homNay = SM.CLOCK.today;
    const msgs = (t.messages || []).filter(m => m.tu === tenKhach);
    const cuoi = msgs.length ? msgs.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] : null;
    const imLang = cuoi ? chenhNgay(cuoi.date, homNay) : 99;
    const trong7Ngay = imLang <= 7;
    const tu48h = SM.dayOffset(homNay, -2);
    const daTraLoi48h = msgs.filter(m => m.traLoiLuc && m.traLoiLuc >= tu48h).length;
    const freeConLai = Math.max(0, 8 - daTraLoi48h);
    let duongGui = 'giao-dich-165d', phi = 165;
    if (trong7Ngay && freeConLai > 0) { duongGui = 'tu-van-free'; phi = 0; }
    else if (trong7Ngay) { duongGui = 'tu-van-55d'; phi = 55; }
    return { trong7Ngay, imLangNgay: imLang, freeConLai, duongGui, phi };
  }

  /** Cán bộ xác nhận tay (B.11) — bắt buộc mã cán bộ + lý do; đi qua D.datTrangThaiKetNoi. */
  function xacNhanTayCanBo(t, ma, maCanBo, lyDo) {
    if (!maCanBo || !String(maCanBo).trim()) return { ok: false, lyDo: 'Cần mã cán bộ' };
    if (!lyDo || !String(lyDo).trim()) return { ok: false, lyDo: 'Cần lý do bằng chữ' };
    const r = datKetNoi(t, ma, 'da_ket_noi', { maCanBo: String(maCanBo).trim(), lyDo: String(lyDo).trim(),
      aiBam: 'Cán bộ ' + String(maCanBo).trim() + ' xác nhận tay (dòng Sổ trực b2g lấy từ nhật ký này)' });
    if (r && r.ok) ghiNhatKy(t, { ai: 'Cán bộ ' + maCanBo, viec: 'Xác nhận tay đã nối: ' + (THAM_SO_CONNECTOR[ma] ? THAM_SO_CONNECTOR[ma].ten : ma), lyDo: lyDo });
    return r;
  }

  /* ═══════════ tiện ích trình bày — tái dùng markup .toast/.sheet của mobile.html ═══════════
     toast/sheet là hàm cục bộ của IIFE mobile.html nên file này tự dựng bản cùng markup;
     class CSS dùng chung nên người dùng thấy giống hệt. */
  function toast(m, ms) {
    let el = document.querySelector('.toast');
    if (el) el.remove();
    el = document.createElement('div'); el.className = 'toast'; el.textContent = m;
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, ms || 3000);
  }
  function closeSheet() { const s = document.querySelector('.sheet'); if (s) s.remove(); }
  function sheet(title, html, after) {
    closeSheet();
    const w = document.createElement('div'); w.className = 'sheet';
    w.innerHTML = '<div class="inner"><div class="row"><h3 style="flex:1">' + E(title) + '</h3>' +
      '<button class="btn sm gh" data-x>Đóng</button></div>' + html + '</div>';
    w.addEventListener('click', e => { if (e.target === w || e.target.hasAttribute('data-x')) closeSheet(); });
    document.body.appendChild(w);
    if (after) after(w);
    return w;
  }
  /** Vẽ lại màn hiện tại (mobile #view) sau khi đổi dữ liệu — không đụng TAB của mobile. */
  function veLai(t, viewFn, bindFn) {
    const v = document.querySelector('#view');
    if (!v) return;
    v.innerHTML = viewFn(t);
    if (bindFn) bindFn(t);
    window.scrollTo(0, 0);
    danhThucMobile();
  }
  /**
   * W8: mobile.html gắn handler cho mọi [data-di] trong bindNhac(), mà bindNhac CHỈ chạy bên trong
   * render() của nó. Module vẽ tay (veLai / đổi ruột #ob2-body) xong thì các nút «đi màn khác»
   * (Bắt đầu phần hỏi · Xem danh sách của nhà mình · Làm ngay · Để sau, vào dùng trước) thành nút
   * CHẾT — hộ bấm không có gì xảy ra, đúng chỗ hộ mù công nghệ bỏ app. Nhờ mobile render lại đúng
   * màn đang đứng bằng ui:change (nội dung y hệt, chỉ để nó gắn lại handler).
   */
  function danhThucMobile() {
    if (typeof SM.setUi !== 'function' || typeof SM.ui !== 'function') return;
    /* CHẶN: mobile.html nghe ui:change và ở CHẾ ĐỘ ĐƠN GIẢN nó ép TAB về «ban» với mọi màn ngoài
       ban/tien/ai — gồm cả màn phần mở đầu. Đánh thức lúc đó là ĐẨY HỘ RA giữa chừng wizard, còn
       tệ hơn nút chết. Nên chế độ đơn giản thì thôi. Sửa gốc nằm ở mobile.html (W6: cho các màn
       obkichhoat/obnhandien/obdanhmuc/obcon/ketnoi/tamdung vào danh sách được phép của chế độ
       đơn giản) — đã báo trong W8-BAO-CAO. */
    if (typeof SM.mode === 'function' && SM.mode() === 'simple') return;
    try { SM.setUi({ obVeLai: (SM.ui().obVeLai || 0) + 1 }); } catch (e) { /* kho ui hỏng thì thôi */ }
  }
  /**
   * Gắn việc riêng cho nút VỪA có data-di VỪA phải chạy việc của mình («Để sau» ghi chỗ đang dở,
   * «Mở lại chỗ đang dở»…). mobile.html gán thẳng `b.onclick` cho mọi [data-di] trong bindNhac(),
   * chạy SAU bind của module — gán onclick ở đây là bị ghi đè, việc mất sạch. addEventListener
   * đăng ký trước nên vẫn chạy (cùng cách ganDoiNguoi/ganNutMoCon đang làm). — W8
   */
  function ganBamTruoc(sel, fn) {
    const b = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (b) b.addEventListener('click', fn, true);
    return b;
  }
  /** Đổi màn giùm hộ: TAB nằm trong IIFE của mobile.html, module không với tới — mượn đúng nút
   *  [data-di] có sẵn trên màn vừa vẽ mà bấm hộ. Không có nút thì thôi, hộ tự bấm. — W8 */
  function tuBamDi(dich) {
    const b = document.querySelector('#view [data-di="' + dich + '"]');
    if (b) b.click();
  }
  /** Ghi mã connector sắp mở vào smv3:ui (KHÔNG emit — tránh render đè trước khi đổi TAB). */
  /* Claude verify 20/08: SM.NS KHÔNG được sm-core export (NS là const nội bộ) — bản W1 đọc/ghi key
     "undefinedui" nên mã connector không bao giờ lưu được. Dùng thẳng 'smv3:ui' (đúng KEY_UI của sm-core)
     và đọc CẢ khoá obConMa mà W6 ghi từ đường data-di="obcon:<ma>". */
  function datConMa(ma) {
    try {
      const u = JSON.parse(localStorage.getItem('smv3:ui') || '{}') || {};
      u.obCon = ma; u.obConMa = ma;
      localStorage.setItem('smv3:ui', JSON.stringify(u));
    } catch (e) { /* kho ui hỏng thì để view dùng mặc định */ }
  }
  function docConMa() {
    try { const u = JSON.parse(localStorage.getItem('smv3:ui') || '{}') || {}; return u.obConMa || u.obCon || 'bank'; }
    catch (e) { return 'bank'; }
  }
  /** Nút «Mô phỏng: …» — đẩy sự kiện vào hộp thư rồi xử lý ngay (đường B.2 đường (a)). */
  function moPhong(t, kichBanId, tenHien) {
    if (!global.SM || !SM.inbox) { toast('Chưa nạp sm-inbox.js'); return; }
    const r = SM.inbox.simulate(kichBanId, t.id);
    if (!r.ok) { toast('Kịch bản «' + tenHien + '» chưa có trong hộp thư — ' + r.lyDo + ' (W3 bổ sung)'); return; }
    const pr = SM.inbox.process(r.suKien.id);
    if (!pr.ok) toast('Sự kiện đã vào hộp thư; máy xử lý trả: ' + pr.lyDo + ' (chờ W3)');
    else toast('Mô phỏng xong — sự kiện «' + tenHien + '» đã được xử lý');
  }
  /** «Đọc to câu này» (T5-3b.7 — kịch bản hoá, không claimed có TTS). */
  function docTo(cau) {
    sheet('Đọc to câu này', '<div class="card"><div class="bd" style="text-align:center">' +
      '<div style="font-size:21px;font-weight:700;line-height:1.5">' + E(cau) + '</div>' +
      '<div class="tag warn" style="margin-top:12px">MÔ PHỎNG đọc — bản thật dùng giọng máy</div></div></div>');
  }
  const DONG_ANH_GIAY_TO = 'Ảnh giấy tờ nằm trong máy của hộ; bản gửi đi là bản rút gọn không kèm ảnh gốc. ' +
    'Ảnh cô chụp chỉ nằm trong máy của cô — gửi đi chỉ là tin «đã có giấy», không gửi tấm ảnh. ' +
    'Cán bộ chỉ thấy trạng thái hồ sơ, không thấy ảnh.'; /* P12 + câu quê W0-P12 */
  /** Cắt nhãn nguồn [Q-0xx]/(Q-0xx) khỏi chuỗi hiển thị cho hộ (W0 #13) — nhãn đầy đủ
   *  chỉ nằm trong khối «nguồn màn hình»/«cài đặt nâng cao» cho người chấm demo. */
  function boNhan(s) {
    return String(s == null ? '' : s).replace(/\s*[(\[][^)\]]*Q-\d+[^)\]]*[)\]]/g, '').trim();
  }
  /** VIỆC đời thường mở đầu mỗi dòng danh mục OB-3 (W0 #8) — tên dịch vụ thành chữ phụ nhỏ. */
  function viecDoiTuong(ma) {
    const V = {
      bank: 'Tiền về quầy tự hiện lên', zalooa: 'Khách nhắn 22 giờ cũng có câu trả lời',
      hddt: 'Khách đòi hoá đơn là xuất được ngay', cts: 'Ký tờ khai ngay trên điện thoại',
      etax: 'Tờ khai app tính sẵn, chỉ bấm nộp', ketoan: 'Sổ theo Nhà nước — OPC chỉ dẫn sang',
      shopee: 'Đơn Shopee về thẳng app', tiktok: 'Đơn TikTok về chung một bảng',
      lazada: 'Đơn Lazada về chung một bảng', shipper: 'Đơn giao xong tự sang đã bán',
      pos: 'Bán ở quầy xong là có hoá đơn', booking: 'Khách đặt phòng vào thẳng lịch',
      'canh-nguong': 'App canh giùm — cần làm hồ sơ là báo trước 30 ngày',
      'thue-san': 'Sàn đã nộp thay phần thuế của hộ — app đối chiếu giùm',
      gpkd: 'Làm giấy phép bán hàng — cán bộ đi cùng',
      misa: 'Nhà mình đang dùng MISA — OPC không thay nó',
      'chuyen-du-lieu': 'Chuyển sổ cũ trên phần mềm khác sang đây',
    };
    return V[ma] || '';
  }

  /* ═══════════ §4. OB-1 «KÍCH HOẠT» (B.5) ═══════════ */

  let qrSai = 0; /* đếm số lần gõ sai trong phiên — QR sai 3 lần → gọi cán bộ (B.13 #2) */

  function viewObKichHoat(t) {
    const ob = trangThai(t);
    /* sau mã hợp lệ: Câu 0 (và câu phụ 1 chạm) → màn chuyển sang OB-2.
       ob1.moiXong: vừa trả lời câu 0 — kể cả khi quay lại «Đổi người bấm» giữa chừng. */
    if (ob.ob1 && ob.ob1.giaiDoan === 'cau0') return veCau0(t);
    if (ob.ob1 && ob.ob1.giaiDoan === 'cau0-phu') return veCau0Phu(t);
    if (ob.ob1 && ob.ob1.giaiDoan === 'xong' && (ob.buoc === 'kich_hoat' || ob.ob1.moiXong)) {
      const g = ob.traLoi.nguoiLamChinh === 'bo-me';
      const deCho = ob.traLoi.deChoKeCan === true;
      const tenKe = t.keCan && t.keCan.ten ? t.keCan.ten : 'người nhà';
      return '<div class="card"><div class="bd">' +
        '<div style="font-size:18px;font-weight:700">Kích hoạt xong rồi.</div>' +
        '<div class="muted" style="margin-top:6px">' + (deCho
          ? 'Vì để tối ' + E(tenKe) + ' bấm phần còn lại — phần hỏi chỉ còn 2 câu, phần giấy tờ app để sẵn cho ' + E(tenKe) + ' bấm tối nay.'
          : g
            ? 'Vì bố mẹ cầm máy — phần hỏi chỉ còn 2 câu, phần giấy tờ app giao người nhà bấm giúp buổi tối.'
            : 'Còn mấy câu đơn giản về nhà mình — làm hết trong 5 phút, xong app biết nên nối gì cho mình.') + '</div>' +
        '<button class="btn pri w" style="margin-top:12px" data-di="obnhandien">Bắt đầu phần hỏi</button>' +
        '<div class="row" style="gap:8px;margin-top:8px">' +
        '<button class="btn gh ob-doinguoi" style="flex:1" data-di="obkichhoat">Đổi người bấm</button>' +
        '<button class="btn gh" style="flex:1" data-di="ban" id="ob1-desau2">Để sau, vào dùng trước</button></div>' +
        '</div></div>';
    }
    if (ob.buoc !== 'chua_kich_hoat') {
      return '<div class="card"><div class="hd"><h2>Phần mở đầu đã kích hoạt</h2></div><div class="bd">' +
        '<div class="row"><div style="flex:1"><div>Tiến độ <b class="num">' + tienDo(t) + '%</b></div>' +
        '<div class="muted">Bước hiện tại: ' + E(tenBuoc(ob.buoc)) + '</div></div></div>' +
        '<div class="row" style="gap:8px;margin-top:10px">' +
        '<button class="btn pri" style="flex:1" data-di="obnhandien">Làm tiếp phần hỏi</button>' +
        '<button class="btn" style="flex:1" data-di="ketnoi">Vào Trạm kết nối</button></div>' +
        '<button class="btn w gh" style="margin-top:8px" id="ob1-lamlai">Tôi đã từng dùng OPC — mở lại phần hỏi</button>' +
        '</div></div>';
    }
    let h = '<div class="card"><div class="bd">' +
      '<p style="font-size:16.5px;line-height:1.6">Chào cô chú. Đây là lần đầu mở app — làm phần mở đầu một lần thôi, chừng 5 phút. ' +
      'Có cán bộ ngồi cạnh thì đưa điện thoại cho cán bộ quét mã, càng nhanh. ' +
      'Chưa muốn làm bây giờ? Bấm «Để sau, vào dùng trước» — không sao cả.</p></div>' +
      '<div class="bd"><div class="row wrap" style="gap:8px">' +
      '<button class="btn pri" style="flex:1 1 100%" id="ob1-masuat">Tôi có mã suất của Chương trình</button>' +
      '<button class="btn" style="flex:1" id="ob1-tumua">Tôi tự mua, đã có tài khoản</button>' +
      '<button class="btn" style="flex:1" id="ob1-xemthu">Xem thử trước khi có mã</button>' +
      '<button class="btn gh" style="flex:1" data-di="ban" id="ob1-desau">Để sau, vào dùng trước</button>' +
      '</div></div></div>';
    h += '<div class="note br">Mã suất là dải QR cán bộ in từ bảng điều khiển của Chương trình — quét là vào, không cần gõ gì.</div>';
    return h;
  }

  function bindObKichHoat(t) {
    const ob = trangThai(t);
    if (ob.ob1 && ob.ob1.giaiDoan === 'cau0') { bindCau0(t); return; }
    if (ob.ob1 && ob.ob1.giaiDoan === 'cau0-phu') { bindCau0Phu(t); return; }
    ganDoiNguoi(t);
    const xt = document.querySelector('#ob1-xemthu');
    if (xt) xt.onclick = () => {
      /* W0 C3: buổi tập 20 hộ — cho MỌI người bấm thử wizard ở hộ demo cd4-moi, không đụng hộ thật.
         Xem thử thì KHÔNG đòi mã suất: mở thẳng câu 0 của hộ demo, hộ thật không bị chạm gì. */
      if (typeof SM.switchTenant !== 'function' || !SM.tenant('cd4-moi')) {
        toast('Chưa có hộ demo cd4-moi trong kho — cần seed v4 (việc W4)');
        return;
      }
      SM.switchTenant('cd4-moi');
      const td = SM.current();
      const obd = trangThai(td);
      if (obd.buoc === 'chua_kich_hoat') {
        chuyenBuoc(td, 'kich_hoat', 'Xem thử phần mở đầu — chưa có mã suất (hộ demo)');
        trangThai(td).ob1 = { giaiDoan: 'cau0', xemThu: true };
        SM.save();
      }
      toast('Đang bấm thử trên máy hộ demo «' + td.name + '» — thoải mái, hộ thật không bị đụng gì. Về hộ mình: đổi chân dung hộ ở góc trên.');
      veLai(td, viewObKichHoat, bindObKichHoat);
    };
    ganBamTruoc('#ob1-desau2', () => { boQuaTam(t, 'obkichhoat'); toast('Vào dùng app bình thường — quay lại bất cứ lúc nào'); });
    const lm = document.querySelector('#ob1-lamlai');
    if (lm) lm.onclick = () => {
      lamLai(t);
      toast('Mở lại phần hỏi — dữ liệu bán và tiền giữ nguyên');
      veLai(t, viewObKichHoat, bindObKichHoat);
      tuBamDi('obnhandien'); /* sang hẳn màn hỏi, đừng để hộ ngồi giữa hai màn */
    };
    ganBamTruoc('#ob1-desau', () => { boQuaTam(t, 'obkichhoat'); toast('Đã ghi nhớ — vào dùng app bình thường'); });
    const ms = document.querySelector('#ob1-masuat');
    if (ms) ms.onclick = () => sheetMaSuat(t);
    const tm = document.querySelector('#ob1-tumua');
    if (tm) tm.onclick = () => sheetTuMua(t);
  }

  function sheetMaSuat(t) {
    sheet('Kích hoạt bằng mã suất',
      '<div class="card"><div class="bd">' +
      '<div class="muted">Quét mã QR trên giấy cán bộ phát, hoặc gõ mã in bên dưới dải mã.</div>' +
      '<div class="note br" style="margin-top:8px">Quét mã giấy của cán bộ — không mất tiền, không điền gì cả.</div>' +
      /* W0 P3/#3: «GL26-» hiện sẵn cố định — hộ chỉ gõ 8 ký tự sau, khỏi lo chữ hoa/thường */
      '<div class="row" style="margin-top:8px;align-items:stretch">' +
      '<span class="mono" style="font-size:18px;font-weight:700;padding:10px 12px;background:var(--line);border-radius:8px 0 0 8px;display:flex;align-items:center">GL26-</span>' +
      '<input id="ob1-ma" class="mono" placeholder="XXXX-XXXX" maxlength="14" style="flex:1;font-size:18px;padding:10px;border-radius:0 8px 8px 0;min-width:0" autocomplete="off">' +
      '</div>' +
      '<button class="btn w" style="margin-top:10px" id="ob1-qr">Mô phỏng quét QR (điền mã demo)</button>' +
      '<button class="btn pri w" style="margin-top:8px" id="ob1-kichhoat">Kích hoạt</button>' +
      (qrSai >= 3 ? '<div class="note crit" style="margin-top:10px">Quét/gõ sai 3 lần rồi — <b>đừng lo</b>. <button class="btn sm" id="ob1-goi" style="margin-left:6px">Gọi cán bộ hỗ trợ địa bàn</button></div>' : '') +
      '<button class="btn gh w" style="margin-top:8px" id="ob1-dadung">Mã báo «đã kích hoạt trên máy khác»?</button>' +
      '</div></div>', w => {
        const inp = w.querySelector('#ob1-ma');
        inp.addEventListener('input', () => {
          /* nhận cả DÁN nguyên mã — tự bỏ sẵn phần «GL26-» hộ vừa dán (W0 P3) */
          const v = String(inp.value || '').toUpperCase();
          const sot = v.indexOf('GL26-') === 0 ? v.slice(5) : v;
          if (sot !== v) inp.value = sot;
        });
        const goi = w.querySelector('#ob1-goi');
        if (goi) goi.onclick = () => {
          const ob = trangThai(t);
          ob.viecGoiLai = ob.viecGoiLai || [];
          if (!ob.viecGoiLai.some(v => v.ma === 'kich-hoat' && !v.xongLuc)) {
            ob.viecGoiLai.push({ ma: 'kich-hoat', ngay: SM.CLOCK.today, xongLuc: null });
            ghiNhatKy(t, { viec: 'Quét QR sai 3 lần — hộ cần cán bộ hỗ trợ kích hoạt', lyDo: 'B.13 điểm bỏ cuộc #2' });
            SM.save();
          }
          closeSheet();
          /* W0 P7: chữ «SLA» là tiếng nội bộ — trước mặt hộ chỉ nói người thật trả lời trong bao lâu */
          toast('Đã gửi yêu cầu — cán bộ địa bàn sẽ liên hệ trong hôm nay, thường trả lời trong 15 phút');
        };
        w.querySelector('#ob1-qr').onclick = () => { inp.value = '7A2K-9QXM'; toast('Đã mô phỏng camera quét mã — mã điền vào ô'); };
        w.querySelector('#ob1-kichhoat').onclick = () => {
          const sot = String(inp.value || '').trim().toUpperCase().replace(/^GL26-?/, '');
          if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(sot)) {
            qrSai++;
            toast(qrSai >= 3 ? 'Sai 3 lần — bấm «Gọi cán bộ hỗ trợ địa bàn» bên dưới'
                             : 'Mã chưa đúng — kiểm tra lại 8 ký tự in trên giấy (phần GL26- app điền sẵn)');
            if (qrSai >= 3) { closeSheet(); sheetMaSuat(t); }
            return;
          }
          kichHoatXong(t, { ma: 'GL26-' + sot, loai: 'chuong-trinh' });
        };
        w.querySelector('#ob1-dadung').onclick = () => {
          closeSheet();
          sheet('Mã đã dùng trên máy khác',
            '<div class="card"><div class="bd">' +
            '<p style="font-size:15px">Mã này đã kích hoạt trên máy khác. Nếu đổi điện thoại, bấm «Tôi đã từng dùng OPC» — dữ liệu cũ của nhà mình không mất.</p>' +
            '<button class="btn pri w" id="ob1-dungroi">Tôi đã từng dùng OPC</button></div></div>', w2 => {
              w2.querySelector('#ob1-dungroi').onclick = () => {
                closeSheet(); lamLai(t);
                veLai(t, viewObKichHoat, bindObKichHoat);
                tuBamDi('obnhandien');
              };
            });
        };
      });
  }

  function sheetTuMua(t) {
    sheet('Đăng nhập tài khoản tự mua',
      '<div class="card"><div class="bd">' +
      '<div class="note br" style="margin:0 0 10px">Bản demo: chuỗi nào cũng vào được — không kiểm tra mật khẩu thật.</div>' +
      '<input id="ob1-tk" placeholder="Số điện thoại hoặc email" style="width:100%;font-size:17px;padding:10px" autocomplete="off">' +
      '<input id="ob1-mk" type="password" placeholder="Mật khẩu" style="width:100%;font-size:17px;padding:10px;margin-top:8px" autocomplete="off">' +
      '<button class="btn pri w" style="margin-top:10px" id="ob1-dangnhap">Đăng nhập</button></div></div>', w => {
        w.querySelector('#ob1-dangnhap').onclick = () => kichHoatXong(t, { ma: 'TU-MUA', loai: 'tu-mua' });
      });
  }

  /** Mã hợp lệ → gắn license + bước kich_hoat → hiện CÂU 0 (B.5). */
  function kichHoatXong(t, lic) {
    t.license = { ma: lic.ma, loai: lic.loai, capLuc: SM.CLOCK.today };
    chuyenBuoc(t, 'kich_hoat', 'Nhập mã ' + (lic.loai === 'tu-mua' ? 'tự mua' : 'suất Chương trình'));
    trangThai(t).ob1 = { giaiDoan: 'cau0' };
    SM.save();
    closeSheet();
    toast('Đã kích hoạt — còn vài câu đơn giản nữa thôi');
    veLai(t, viewObKichHoat, bindObKichHoat);
  }

  /** Danh sách người cho câu 0 — TÊN lấy từ seed (W0 câu 0(c)); tenant trắng giữ nhãn vai. */
  function nguoiCau0(t) {
    const ds = [];
    if (t.chuHo) ds.push({ gt: 'chu-ho', ten: t.chuHo, phu: 'chủ hộ — người đứng tên hộ' });
    else ds.push({ gt: 'chu-ho', ten: 'Chủ hộ', phu: '' });
    if (t.keCan && t.keCan.ten) ds.push({ gt: 'con', ten: t.keCan.ten, phu: t.keCan.vaiTro || 'người nhà hay giúp bán hàng' });
    else ds.push({ gt: 'con', ten: 'Người nhà trẻ', phu: 'con cháu hoặc người hay giúp bán hàng' });
    (t.nguoiLonTuoi || []).forEach(n => {
      if (t.chuHo && n.ten === t.chuHo) return; /* chủ hộ đã có ở nút đầu — không lặp */
      ds.push({ gt: 'bo-me', ten: n.ten, phu: n.vaiTro || 'người lớn tuổi trong nhà' });
    });
    ds.push({ gt: 'can-bo', ten: 'Cán bộ', phu: 'cán bộ đang ngồi cùng, hướng dẫn từng bước' });
    return ds;
  }

  function veCau0(t) {
    const tenKeCan = t.keCan && t.keCan.ten ? t.keCan.ten : '';
    const obx = trangThai(t);
    let h = (obx.ob1 && obx.ob1.xemThu
      ? '<div class="note br">Đang <b>bấm thử</b> trên máy hộ demo — làm sai cũng không sao, hộ nhà mình không bị đụng gì.</div>' : '') +
      '<div class="card"><div class="hd"><h2>Một câu nữa thôi</h2></div><div class="bd">' +
      '<p style="font-size:17px;font-weight:700;line-height:1.5">Máy này ai hay dùng nhất?</p>' +
      /* W0 điểm soi #1: nút đọc to bằng nút trả lời, đặt cạnh câu */
      '<button class="btn w" style="margin-top:8px;font-size:16px" data-docto="Máy này ai hay dùng nhất?">🔊 Đọc to câu này</button>';
    nguoiCau0(t).forEach(n => {
      h += '<button class="btn w ob0" style="margin-top:8px;text-align:left" data-nguoi="' + n.gt + '">' +
        '<b>' + E(n.ten) + '</b>' + (n.phu ? '<div class="muted" style="font-size:13px">' + E(n.phu) + '</div>' : '') + '</button>';
    });
    h += '<div class="muted" style="margin-top:10px">' + (tenKeCan
      ? 'Chọn người lớn tuổi thì app tự rút phần hỏi còn 2 câu — phần giấy tờ để ' + E(tenKeCan) + ' bấm tối nay.'
      : 'Chọn người lớn tuổi thì app tự rút phần hỏi còn 2 câu.') + '</div>' +
      '<button class="btn gh w" style="margin-top:8px" data-di="ban" id="ob0-desau">Để sau, vào dùng trước</button>' +
      '</div></div>';
    return h;
  }

  /** Câu phụ 1 chạm (W0 câu 0(c)): «Cô/chú tự bấm được không, hay để tối {kế cận} bấm giúp?» */
  function veCau0Phu(t) {
    const ten = t.keCan && t.keCan.ten ? t.keCan.ten : 'người nhà';
    return '<div class="card"><div class="hd"><h2>Hỏi thêm một câu</h2></div><div class="bd">' +
      '<p style="font-size:17px;font-weight:700;line-height:1.5">Cô/chú tự bấm được không, hay để tối ' + E(ten) + ' bấm giúp?</p>' +
      '<button class="btn w" style="margin-top:8px;font-size:16px" data-docto="Cô chú tự bấm được không, hay để tối ' + E(ten) + ' bấm giúp?">🔊 Đọc to câu này</button>' +
      '<button class="btn pri w" style="margin-top:8px" id="ob0p-tu">Tự bấm được</button>' +
      '<button class="btn w" style="margin-top:8px" id="ob0p-de">Để tối ' + E(ten) + ' bấm</button>' +
      '<div class="muted" style="margin-top:10px">Chọn «Để tối ' + E(ten) + ' bấm» thì phần hỏi rút còn 2 câu — phần còn lại app để sẵn việc cho ' + E(ten) + ' tối nay.</div>' +
      '</div></div>';
  }

  function bindCau0(t) {
    /* nút «đọc to» của câu 0 trước đây không được gắn ở đâu cả — bấm không ra gì (W8) */
    document.querySelectorAll('[data-docto]').forEach(b => b.onclick = () => docTo(b.dataset.docto));
    document.querySelectorAll('.ob0').forEach(b => b.onclick = () => {
      const ng = b.dataset.nguoi;
      traLoi(t, 'nguoiLamChinh', ng);
      const ob = trangThai(t);
      if (ng === 'can-bo') {
        if (!ob.coCanBo) {
          /* cán bộ mở app hộ trong buổi thăm — gắn người theo hộ (B.11); mã CB-01 = bản demo */
          ob.coCanBo = { maCanBo: 'CB-01', ten: 'Cán bộ hỗ trợ CB-01', diaBan: t.diaBan,
            ghiChu: 'Bản demo gán CB-01 — tên thật do seed b2g đặt' };
        }
        ob.ob1 = { giaiDoan: 'xong', nguoi: ng, moiXong: true };
        SM.save();
        veLai(t, viewObKichHoat, bindObKichHoat);
        return;
      }
      if (t.keCan && t.keCan.ten) {
        /* có kế cận trong hồ sơ → hỏi câu phụ 1 chạm trước khi vào wizard (W0 câu 0(c)) */
        ob.ob1 = { giaiDoan: 'cau0-phu', nguoiVuaChon: ng };
        SM.save();
        veLai(t, viewObKichHoat, bindObKichHoat);
        return;
      }
      ob.ob1 = { giaiDoan: 'xong', nguoi: ng, moiXong: true };
      SM.save();
      veLai(t, viewObKichHoat, bindObKichHoat);
    });
    ganBamTruoc('#ob0-desau', () => { boQuaTam(t, 'obkichhoat'); toast('Vào dùng app bình thường — quay lại bất cứ lúc nào'); });
  }

  function bindCau0Phu(t) {
    document.querySelectorAll('[data-docto]').forEach(b => b.onclick = () => docTo(b.dataset.docto));
    const ob = trangThai(t);
    const ng = ob.ob1 && ob.ob1.nguoiVuaChon;
    const tu = document.querySelector('#ob0p-tu');
    if (tu) tu.onclick = () => {
      ob.ob1 = { giaiDoan: 'xong', nguoi: ng, moiXong: true };
      SM.save();
      veLai(t, viewObKichHoat, bindObKichHoat);
    };
    const de = document.querySelector('#ob0p-de');
    if (de) de.onclick = () => {
      traLoi(t, 'deChoKeCan', true); /* rút gọn bất kể vai (W0 câu 0(c)) */
      const obx = trangThai(t);
      obx.ob1 = { giaiDoan: 'xong', nguoi: ng, moiXong: true, deCho: true };
      ghiNhatKy(t, { viec: 'Hộ để tối ' + (t.keCan ? t.keCan.ten : 'người nhà') + ' bấm phần còn lại — phần hỏi rút còn 2 câu',
        lyDo: 'W0 câu 0(c): «để tối cháu bấm» thì rút gọn bất kể vai trò' });
      SM.save();
      veLai(t, viewObKichHoat, bindObKichHoat);
    };
  }

  /** Nút «Đổi người bấm» (W0 câu 0(d)): có ở ĐẦU mọi màn wizard còn lại — sửa được
   *  một câu chọn nhầm ngay trong phiên, không phải đi đường onboarding-lại (B.12). */
  function ganDoiNguoi(t) {
    document.querySelectorAll('.ob-doinguoi').forEach(b => {
      b.addEventListener('click', () => {
        const ob = trangThai(t);
        ob.ob1 = { giaiDoan: 'cau0', doiLuc: SM.CLOCK.today };
        SM.save();
        toast('Quay lại câu chọn người bấm — trả lời khác thì phần hỏi tự đổi theo');
      }, true); /* capture: đặt lại giai đoạn TRƯỚC khi data-di đổi màn */
    });
  }

  /** «Nhắc {tên} qua Zalo» (W0 #14): sheet chữ soạn sẵn để hộ TỰ gửi bằng Zalo thường —
   *  app KHÔNG tự gửi tin nào (N-06/N-09); tin Zalo thường không tốn phí OA (Q-005). */
  function sheetNhacZalo(t, ten) {
    const chu = 'Chào ' + ten + ', app bán hàng của nhà mình còn phần giấy tờ chưa bấm nốt. ' +
      'Tối nay mở app trên máy này (hoặc cài app rồi vào) — việc để sẵn trong phần «Kết nối», làm chừng 5 phút là xong.';
    sheet('Nhắc ' + ten + ' qua Zalo',
      '<div class="card"><div class="bd">' +
      '<div class="muted">App soạn sẵn lời nhắc — cô chú copy rồi tự gửi cho ' + E(ten) + ' bằng Zalo thường. App không tự gửi tin nào.</div>' +
      '<textarea id="nz-chu" readonly style="width:100%;min-height:110px;font-size:15px;padding:10px;margin-top:8px">' + E(chu) + '</textarea>' +
      '<button class="btn pri w" style="margin-top:8px" id="nz-copy">Copy lời nhắc này</button>' +
      '<div class="muted" style="margin-top:8px">Dán vào khung chat Zalo với ' + E(ten) + ' rồi bấm gửi — tin Zalo thường, không tốn phí.</div>' +
      '</div></div>', w => {
        w.querySelector('#nz-copy').onclick = () => {
          const ok = () => toast('Đã copy — mở Zalo, dán vào khung chat với ' + ten + ' rồi gửi');
          const fail = () => toast('Không copy tự động được — bấm giữ ô chữ trên rồi chọn «Sao chép»');
          if (navigator.clipboard && navigator.clipboard.writeText)
            navigator.clipboard.writeText(chu).then(ok, fail);
          else fail();
        };
      });
  }

  /* ═══════════ §5. OB-2 «NHẬN DIỆN HỘ» — 5 câu (B.6) ═══════════ */

  /** Rút gọn: câu 0 chọn «bố mẹ», «để tối {kế cận} bấm» (W0 câu 0(c) — bất kể vai),
   *  hoặc máy đang ở chế độ đơn giản lần đầu (B.5 T5-3b.6). */
  function rutGon(t) {
    const ob = trangThai(t);
    if (ob.traLoi.nguoiLamChinh === 'bo-me') return true;
    if (ob.traLoi.deChoKeCan === true) return true;
    return SM.mode() === 'simple' && !ob.traLoi.nganh && ob.buoc === 'kich_hoat';
  }

  function viewObNhanDien(t) {
    const ob = trangThai(t);
    if (!ob.ob2) {
      ob.ob2 = { cau: 1 };
      if (!ob.batDauLuc) ob.batDauLuc = new Date().toISOString(); /* mốc 1/2 của «phút tới việc đầu» (B.10) */
      SM.save();
    }
    const g = rutGon(t);
    const tongCau = g ? 2 : 5;
    const noi = ob.ob2.cau > tongCau;
    let h = dariaCanBo(t);
    h += '<div class="card"><div class="bd">' +
      '<div class="row"><b style="flex:1;font-size:15px">Phần hỏi về nhà mình</b>' +
      '<span class="muted">' + Math.min(ob.ob2.cau, tongCau) + '/' + tongCau + '</span></div>' +
      '<div class="row" style="gap:5px;margin-top:8px">' +
      Array.from({ length: tongCau }, (_, i) =>
        '<span class="tag ' + (i < ob.ob2.cau - 1 ? 'ok' : i === ob.ob2.cau - 1 ? 'br' : 'gray') + '">' + (i + 1) + '</span>').join('') +
      '</div></div></div>';
    h += '<div id="ob2-body">' + veCau(t) + '</div>';
    if (noi) h = dariaCanBo(t) + '<div id="ob2-body">' + veCau(t) + '</div>';
    return h;
  }

  function bindObNhanDien(t) { ganBindCau(t); }

  /** Vẽ câu hiện tại vào #ob2-body — trả chuỗi nếu gọi từ view. */
  function veCau(t) {
    const ob = trangThai(t);
    const g = rutGon(t);
    const tongCau = g ? 2 : 5;
    /* đường «Bây giờ nhà mình bán thêm chỗ khác» từ Trạm — chỉ hỏi lại đúng câu kênh (W8) */
    if (ob.ob2.chiCauKenh) return cauKenh(t);
    const c = Math.min(ob.ob2.cau, tongCau + 1);
    if (g && c === 1) return cauNganh(t, g);
    if (g && c === 2) return cauNguoiGiup(t);
    if (c === 1) return cauNganh(t, g);
    if (c === 2) return cauGiayTo(t);
    if (c === 3) return cauKenh(t);
    if (c === 4) return cauDoanhThu(t);
    if (c === 5) return cauPos(t);
    /* xong hết câu hỏi */
    return '<div class="card"><div class="bd">' +
      '<div style="font-size:17px;font-weight:700">Xong phần hỏi rồi — cảm ơn cô chú.</div>' +
      '<div class="muted" style="margin-top:6px">App lập danh sách những thứ nhà mình nên nối dựa trên đúng những gì vừa nói.</div>' +
      '<button class="btn pri w" style="margin-top:12px" data-di="obdanhmuc">Xem danh sách của nhà mình</button>' +
      '<div class="row" style="gap:8px;margin-top:8px">' +
      '<button class="btn gh ob-doinguoi" style="flex:1" data-di="obkichhoat">Đổi người bấm</button>' +
      '<button class="btn gh" style="flex:1" data-di="ban" id="ob2-desau">Để sau, vào dùng trước</button></div></div></div>';
  }

  function ganBindCau(t) {
    const body = document.querySelector('#ob2-body');
    if (!body) return;
    const ob = trangThai(t);

    body.querySelectorAll('[data-tra]').forEach(b => {
      /* giữ trả lời cũ làm mặc định khi quay lại bằng «Sửa câu trước» (W0 câu 1(d)) */
      const hien = trangThai(t).traLoi[b.dataset.cau];
      if (hien && hien === b.dataset.tra) b.classList.add('pri');
      b.onclick = () => {
        const cau = b.dataset.cau, gt = b.dataset.tra;
        traLoi(t, cau, gt);
        if (cau === 'giayTo' && gt === 'chua-co')
          toast('OK — app thêm checklist làm giấy phép, có cán bộ đồng hành theo');
        if (cau === 'doanhThuUoc' && gt === 'khong-biet')
          toast('Không sao — app tự theo dõi doanh thu thật, tới lúc cần sẽ nhắc');
        if (b.closest('[data-chonroi]')) {
          /* câu 4: bấm nấc chỉ CHỌN — đổi được tới khi rời màn (W0 câu 4(d) sửa bấm nhầm) */
          b.parentNode.querySelectorAll('[data-tra]').forEach(x => x.classList.remove('pri'));
          b.classList.add('pri');
          return;
        }
        ob.ob2.cau = (ob.ob2.cau || 1) + 1;
        SM.save();
        vongLaiCau(t);
      };
    });
    body.querySelectorAll('[data-chip]').forEach(b => b.onclick = () => {
      b.classList.toggle('pri');
      traLoi(t, 'kenh', b.dataset.chip);
      const dem = body.querySelector('#ob2-dem');
      if (dem) dem.textContent = 'Đã chọn ' + (trangThai(t).traLoi.kenh || []).length + ' chỗ';
    });
    const tiep = body.querySelector('#ob2-tiep');
    if (tiep) tiep.onclick = () => { /* «Hết rồi, tiếp tục» LUÔN SÁNG — không chặn (W0 câu 3(c)) */
      if (ob.ob2.chiCauKenh) { /* chỉ hỏi lại câu kênh từ Trạm — xong là tính lại danh mục ngay */
        ob.ob2.chiCauKenh = false; SM.save(); xongPhanHoi(t); return;
      }
      ob.ob2.cau = ob.ob2.cau + 1; SM.save(); vongLaiCau(t); };
    const ob4tiep = body.querySelector('#ob4-tiep');
    if (ob4tiep) ob4tiep.onclick = () => { ob.ob2.cau = ob.ob2.cau + 1; SM.save(); vongLaiCau(t); };
    const ob4chac = body.querySelector('#ob4-chac');
    if (ob4chac) ob4chac.onclick = () => {
      /* lời khẳng định — đường THỨ HAI (sau số bán thật) sinh nhóm LUẬT (W0 câu 4(d)) */
      traLoi(t, 'chacTren1Ty', true);
      const obx = trangThai(t);
      obx.ob2.cau = (obx.ob2.cau || 1) + 1;
      ghiNhatKy(t, { viec: 'Hộ khẳng định «Tôi chắc cả năm bán trên 1 tỷ» — nhóm LUẬT sinh từ lời khẳng định',
        lyDo: 'W0 câu 4(d): câu đoán không sinh nghĩa vụ — chỉ số thật hoặc lời khẳng định' });
      SM.save();
      toast('Đã ghi lời khẳng định — app thêm mục LUẬT: hoá đơn điện tử, chữ ký số, kê khai');
      vongLaiCau(t);
    };
    const viSao = body.querySelector('#ob4-viSao');
    if (viSao) viSao.onclick = () => sheet('Vì sao app hỏi câu này?',
      '<div class="card"><div class="bd">' +
      '<div style="font-size:15.5px;line-height:1.6">Hỏi để biết nhà mình có phải dùng hoá đơn điện tử của cơ quan thuế không thôi — bán trên 1 tỷ một năm là phải làm hồ sơ trong 30 ngày.</div>' +
      '<div class="muted" style="margin-top:8px">Số này sau này app tự theo dõi bằng số bán thật — cô chú không phải khai gì thêm.</div>' +
      '</div></div>'); /* nhãn nguồn [Q-001] nằm ở chế độ «nguồn màn hình», không hiện trước hộ — W0 #13 */
    const sua = body.querySelector('#ob2-sua');
    if (sua) sua.onclick = () => {
      const obx = trangThai(t);
      if (obx.ob2 && obx.ob2.chiCauKenh) { /* đang hỏi lẻ câu kênh — «lùi» nghĩa là thôi, giữ nguyên như cũ */
        obx.ob2.chiCauKenh = false; SM.save(); xongPhanHoi(t); return;
      }
      if (obx.ob2 && obx.ob2.cau > 1) { obx.ob2.cau = obx.ob2.cau - 1; SM.save(); vongLaiCau(t); }
    };
    const chup = body.querySelector('#ob2-chup');
    if (chup) chup.onclick = () => {
      trangThai(t).ob2.daChup = true; SM.save();
      toast('Đã gắn ảnh giấy phép (mô phỏng)');
      vongLaiCau(t);
    };
    const ng = body.querySelectorAll('[data-nguoiGiup]');
    ng.forEach(b => b.onclick = () => {
      const ten = b.dataset.nguoigiup;
      const obx = trangThai(t);
      /* phần còn dở → việc cho người nhà (B.5 câu 0a, B.13 #10) — câu có tên (W0 #14) */
      obx.viecGiaoNguoiNha = { cho: ten, luc: SM.CLOCK.today,
        noiDung: 'Phần còn lại để tối ' + ten + ' bấm — app đã để sẵn' };
      obx.traLoi.giayTo = obx.traLoi.giayTo || 'chua-ro';
      obx.traLoi.doanhThuUoc = obx.traLoi.doanhThuUoc || 'khong-biet';
      obx.traLoi.posHienTai = obx.traLoi.posHienTai || 'chua-ro';
      ghiNhatKy(t, { viec: 'Phần còn lại để tối ' + ten + ' bấm — app đã để sẵn', lyDo: 'Rút còn 2 câu (B.5 + W0 #14)' });
      xongPhanHoi(t);
      sheetNhacZalo(t, ten);
    });
    ganBamTruoc(body.querySelector('#ob2-desau'), () => { boQuaTam(t, 'obnhandien'); toast('Đã ghi nhớ chỗ đang dở — quay lại đúng câu này'); });
    body.querySelectorAll('[data-docto]').forEach(b => b.onclick = () => docTo(b.dataset.docto));
    ganDoiNguoi(t);
  }

  function vongLaiCau(t) {
    const ob = trangThai(t);
    const g = rutGon(t);
    const tongCau = g ? 2 : 5;
    if (!ob.ob2.chiCauKenh && ob.ob2.cau > tongCau) { xongPhanHoi(t); return; }
    const body = document.querySelector('#ob2-body');
    if (!body) return;
    body.innerHTML = veCau(t);
    ganBindCau(t);
    window.scrollTo(0, 0);
    danhThucMobile(); /* nút «Để sau, vào dùng trước» của câu mới phải đi được thật */
  }

  /** Đủ câu chính → da_tra_loi → sinh danh mục → da_sinh_danh_muc (B.1).
   *  Đã đang nối (dang_noi/du_toi_thieu) thì chỉ TÍNH LẠI danh mục — không tụt bước
   *  (đường «Bây giờ nhà mình bán thêm chỗ khác» từ Trạm, W0 câu 3(d)). */
  function xongPhanHoi(t) {
    const ob = trangThai(t);
    const dm = danhMucCho(t);
    const chuaSinhDanhMuc = ['chua_kich_hoat', 'kich_hoat', 'da_tra_loi'].indexOf(ob.buoc) >= 0;
    if (chuaSinhDanhMuc) {
      if (ob.buoc !== 'da_tra_loi') chuyenBuoc(t, 'da_tra_loi', 'Đủ câu hỏi chính');
      chuyenBuoc(t, 'da_sinh_danh_muc', 'Danh mục sinh xong: ' +
        dm.batBuoc.length + ' bắt buộc · ' + dm.nenCo.length + ' nên có · ' + dm.deSau.length + ' để sau');
    } else {
      ghiNhatKy(t, { viec: 'Danh mục tính lại theo câu trả lời mới: ' +
        dm.batBuoc.length + ' bắt buộc · ' + dm.nenCo.length + ' nên có · ' + dm.deSau.length + ' để sau',
        lyDo: 'Trạm — «Bây giờ nhà mình bán thêm chỗ khác»' });
      capNhatDuToiThieu(t);
      SM.save();
    }
    const body = document.querySelector('#ob2-body');
    /* màn «Xong phần hỏi» có nút «Xem danh sách của nhà mình» (data-di) — phải nhờ mobile gắn lại */
    if (body) { body.innerHTML = veCau(t); ganBindCau(t); danhThucMobile(); }
    else veLai(t, viewObNhanDien, bindObNhanDien);
  }

  function dariaCanBo(t) {
    const ob = trangThai(t);
    if (!ob.coCanBo) return '';
    return '<div class="note br">Cán bộ <b>' + E(ob.coCanBo.ten) + '</b> đang cùng làm — mọi bước hộ tự bấm.</div>';
  }

  /* — từng câu, chữ lấy NGUYÊN VĂN bản viết lại W0 mục 2 (đề xuất đã duyệt 20/08) — */
  function khungCau(t, so, cauHoi, than, ghiChu) {
    return '<div class="card"><div class="hd"><h2>Câu ' + so + '</h2></div>' +
      '<div class="bd">' +
      '<div class="row" style="gap:6px;margin-bottom:10px;flex-wrap:wrap">' +
      '<button class="btn sm gh ob-doinguoi" data-di="obkichhoat">Đổi người bấm</button>' +
      /* «Để sau» phải THẬT SỰ đưa hộ vào app (đường lui B.5) — data-di="ban"; việc ghi chỗ đang dở
         gắn bằng ganBamTruoc vì mobile.html ghi đè onclick của mọi [data-di]. */
      '<button class="btn sm gh" id="ob2-desau" data-di="ban">Để sau, vào dùng trước</button>' +
      (so > 1 ? '<button class="btn sm gh" style="margin-left:auto" id="ob2-sua">Sửa câu trước</button>' : '') +
      '</div>' +
      '<p style="font-size:17px;font-weight:700;line-height:1.5">' + cauHoi + '</p>' +
      /* W0 điểm soi #1: nút đọc to phải TO BẰNG nút trả lời và nằm CẠNH CÂU — không phải chữ nhỏ góc màn */
      '<button class="btn w" style="margin-top:8px;font-size:16px" data-docto="' + E(cauHoi) + '">🔊 Đọc to câu này</button>' + than +
      (ghiChu ? '<div class="muted" style="margin-top:10px">' + ghiChu + '</div>' : '') +
      '</div></div>';
  }
  function cauNganh(t, g) {
    const than = [
      { gt: 'dac-san', ten: 'Đặc sản, đồ ăn đồ uống', ic: '🍜' },
      { gt: 'du-lich', ten: 'Du lịch: đón khách, ăn uống, nghỉ trọ', ic: '🏝' },
      { gt: 'nong-san', ten: 'Nông sản: thu mua, sơ chế', ic: '🌾' },
    ].map(x => '<button class="btn w" style="margin-top:8px;text-align:left" data-cau="nganh" data-tra="' + x.gt + '">' +
      '<span style="font-size:20px;margin-right:8px">' + x.ic + '</span>' + x.ten + '</button>').join('');
    return khungCau(t, 1, 'Nhà mình làm nghề gì?', than,
      g ? 'Chỉ 2 câu thôi — phần giấy tờ app sẽ giao người nhà bấm giúp buổi tối.' : null);
  }
  function cauNguoiGiup(t) {
    const nguoi = [{ ten: t.keCan ? t.keCan.ten : 'Người nhà', vai: t.keCan ? t.keCan.vaiTro : '' }]
      .concat((t.nguoiLonTuoi || []).map(n => ({ ten: n.ten, vai: n.vaiTro })));
    const than = nguoi.map(n =>
      '<button class="btn w" style="margin-top:8px;text-align:left" data-nguoiGiup="' + E(n.ten) + '">' +
      '<b>' + E(n.ten) + '</b>' + (n.vai ? ' <span class="muted">· ' + E(n.vai) + '</span>' : '') + '</button>').join('');
    const ten = t.keCan ? t.keCan.ten : 'người nhà';
    return khungCau(t, 2, 'Ai trong nhà giúp phần còn lại?', than,
      'Phần còn lại để tối ' + E(ten) + ' bấm — app đã để sẵn; tối ' + E(ten) + ' mở máy sẽ thấy việc chờ ngay đầu app. ' +
      /* W0 điểm soi #2: bản rút gọn phải nói rõ câu giấy tờ KHÔNG biến mất mà CHUYỂN cho người nhà */
      '<b>Phần giấy tờ để ' + E(ten) + ' bấm tối nay</b> — câu đó không mất đi đâu cả.');
  }
  function cauGiayTo(t) {
    const than = [
      ['co-mst', 'Có giấy phép, có cả con số thuế 10 số'], ['chi-gpkd', 'Có giấy phép thôi'],
      ['chua-co', 'Chưa đăng ký gì cả'],
    ].map(x => '<button class="btn w" style="margin-top:8px;text-align:left" data-cau="giayTo" data-tra="' + x[0] + '">' + x[1] + '</button>').join('') +
      /* «Không nhớ» = đáp án AN TOÀN — nút to mặc định (W0 câu 2(d)), đừng ép hộ bừa */
      '<button class="btn pri w" style="margin-top:14px;font-size:17px" data-cau="giayTo" data-tra="chua-ro">Không nhớ — để cán bộ xem giúp</button>';
    return khungCau(t, 2, 'Nhà mình có cái giấy phép bán hàng treo tường chưa?', than,
      'Có cái giấy phép treo tường không? Chụp nó giùm app là xong. <button class="btn sm" id="ob2-chup">Chụp ảnh giấy phép (mô phỏng)</button>' +
      (trangThai(t).ob2 && trangThai(t).ob2.daChup ? ' <span class="tag ok">đã gắn ảnh</span>' : '') +
      '<div class="note br" style="margin-top:8px">' + DONG_ANH_GIAY_TO + '</div>');
  }
  function cauKenh(t) {
    const k = trangThai(t).traLoi.kenh || [];
    const chips = [['quay', 'Tại quầy/cửa hàng'], ['b2b', 'Bán cho nhà hàng, công ty'],
      ['san', 'Bán trên Shopee/TikTok/Lazada'], ['zalo', 'Khách nhắn Zalo/Facebook'],
      ['live', 'Bán qua phát trực tiếp'], ['food', 'App giao đồ ăn'], ['booking', 'Khách đặt phòng/đặt tour']]
      .map(x => '<button class="btn sm ' + (k.indexOf(x[0]) >= 0 ? 'pri' : '') + '" style="margin:4px 4px 0 0" data-chip="' + x[0] + '">' + x[1] + '</button>').join('');
    const than = '<div class="row wrap">' + chips + '</div>' +
      '<div class="muted" style="margin-top:10px" id="ob2-dem">Đã chọn ' + k.length + ' chỗ</div>' +
      '<button class="btn pri w" style="margin-top:8px;font-size:17px" id="ob2-tiep">Hết rồi, tiếp tục</button>';
    /* W0 câu 3(c): KHÔNG đụng hội thoại Zalo của hộ — chỉ bấm chọn chỗ bán */
    return khungCau(t, 3, 'Hàng nhà mình bán qua chỗ nào? Bấm hết các chỗ bán, bấm lần nữa để bỏ', than, null);
  }
  function cauDoanhThu(t) {
    const hien = trangThai(t).traLoi.doanhThuUoc;
    const than = '<div data-chonroi="1">' +
      [['duoi-1-ty', 'Chưa tới 250 triệu'], ['sap-1-ty', '250–500 triệu'], ['tren-1-ty', 'trên 500 triệu']]
      .map(x => '<button class="btn w ' + (hien === x[0] ? 'pri' : '') + '" style="margin-top:8px" data-cau="doanhThuUoc" data-tra="' + x[0] + '">' + x[1] + '</button>').join('') +
      '<button class="btn w ' + (hien === 'khong-biet' ? 'pri' : '') + '" style="margin-top:14px;font-size:17px" data-cau="doanhThuUoc" data-tra="khong-biet">Không biết</button>' +
      /* nút khẳng định (W0 câu 4(d)) — đường duy nhất câu hỏi sinh nhóm LUẬT */
      '<button class="btn pri w" style="margin-top:14px;font-size:16px" id="ob4-chac">Tôi chắc cả năm bán trên 1 tỷ</button>' +
      '<button class="btn w" style="margin-top:8px" id="ob4-tiep">Tiếp tục</button></div>';
    return khungCau(t, 4, '3 tháng đông khách nhất, bán được bao nhiêu tiền, đại khái thôi?', than,
      'Hỏi để biết nhà mình có phải dùng hoá đơn điện tử của cơ quan thuế không thôi. ' +
      '<button class="btn sm" id="ob4-viSao">Xem vì sao app hỏi</button> ' +
      /* dòng phụ dài nhất màn cũng phải đọc to được (W0 điểm soi #1 điều kiện 2) */
      '<button class="btn sm" data-docto="Hỏi để biết nhà mình có phải dùng hoá đơn điện tử của cơ quan thuế không thôi.">🔊 Đọc to dòng này</button>');
  }
  function cauPos(t) {
    const than = [['giay-so', 'Ghi ra sổ, vở'], ['phan-mem-khac', 'Dùng app khác rồi'],
      ['may-tinh-tien', 'Có cái máy in bill ở quầy'], ['chua-ro', 'Không rõ']]
      .map(x => '<button class="btn w" style="margin-top:8px;text-align:left" data-cau="posHienTai" data-tra="' + x[0] + '">' + x[1] + '</button>').join('');
    return khungCau(t, 5, 'Hiện nay bán hàng nhà mình ghi ở đâu?', than,
      'Hôm nay xuất hoá đơn cho khách sạn, anh/chị xuất từ đâu, ai gõ? — «Không rõ» thì app coi như đang ghi sổ tay.');
  }

  function tenBuoc(buoc) {
    return ({ chua_kich_hoat: 'Chưa kích hoạt', kich_hoat: 'Đã kích hoạt — chưa hỏi gì', da_tra_loi: 'Đã trả lời xong',
      da_sinh_danh_muc: 'Đã có danh mục', dang_noi: 'Đang nối từng cái', du_toi_thieu: 'Đủ tối thiểu',
      xong_viec_dau: 'Xong việc đầu tiên', bo_qua_tam: 'Đang tạm dở' })[buoc] || buoc;
  }

  /* ═══════════ §6. OB-3 «DANH MỤC CỦA HỘ» (B.7) ═══════════ */

  function viewObDanhMuc(t) {
    const dm = danhMucCho(t);
    let h = dariaCanBo(t);
    h += '<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:8px">' +
      '<button class="btn sm gh ob-doinguoi" data-di="obkichhoat">Đổi người bấm</button>' +
      '<button class="btn sm gh" id="ob3-desau">Để sau</button></div>';
    h += '<div class="card"><div class="bd">' +
      '<p style="font-size:16px;line-height:1.6">Dựa trên những gì cô chú vừa cho biết, app lập danh sách những thứ nhà mình nên nối. ' +
      'Cái nào là LUẬT ĐÒI thì làm sớm — app ghi rõ vì sao. Còn lại là để bán đỡ vất vả hơn.</p></div></div>';

    h += nhomDanhMuc(t, 'BẮT BUỘC THEO LUẬT — làm sớm', dm.batBuoc, 'br');
    h += nhomDanhMuc(t, 'NÊN CÓ — bán đỡ vất vả', dm.nenCo, '');
    h += nhomDanhMuc(t, 'ĐỂ SAU — khi nhà mình sẵn sàng', dm.deSau, 'gray');

    /* nguồn màn hình — nhãn [Q-0xx] chỉ nằm đây, không hiện trước mặt hộ (W0 #13) */
    h += '<details class="card"><summary style="padding:12px;font-weight:600;font-size:13.5px">Nguồn màn hình — cho người chấm demo</summary><div class="bd tight list">' +
      dm.batBuoc.concat(dm.nenCo, dm.deSau).map(m =>
        '<div class="row"><div style="flex:1">' + E(m.ten) + '</div><span class="muted">' + E(m.nguon || '') + '</span></div>').join('') +
      '</div></details>';

    h += '<div class="card"><div class="bd">' +
      '<button class="btn pri w" data-di="ketnoi">Bắt đầu nối — vào Trạm kết nối</button>' +
      '<div class="muted" style="margin-top:8px">Trạm là MỘT nơi duy nhất để theo dõi mọi việc đang nối dở — không có thông báo rời rạc.</div>' +
      '</div></div>';
    return h;
  }
  function bindObDanhMuc(t) {
    ganNutMoCon(t);
    ganDoiNguoi(t);
    const ds = document.querySelector('#ob3-desau');
    if (ds) ds.onclick = () => { boQuaTam(t, 'obdanhmuc'); toast('Đã ghi nhớ — vào Trạm bấm «Mở lại chỗ đang dở» bất cứ lúc nào'); };
  }

  function nhomDanhMuc(t, tenNhom, ds, mauTag) {
    if (!ds.length) return '';
    let h = '<div class="card"><div class="hd"><h2>' + E(tenNhom) + '</h2><span class="sub">' + ds.length + ' mục</span></div>' +
      '<div class="bd tight list">';
    ds.forEach(m => {
      const ts = THAM_SO_CONNECTOR[m.ma];
      const kn = ts ? ketNoiCua(t, m.ma) : null;
      const laLuat = tenNhom.indexOf('LUẬT') >= 0;
      const viec = viecDoiTuong(m.ma);
      /* W0 #8: mở đầu bằng VIỆC đời thường in đậm — tên dịch vụ thành chữ phụ nhỏ bên dưới */
      h += '<div class="row" style="align-items:flex-start">' +
        '<div style="flex:1;min-width:0">' +
        (viec ? '<div style="font-weight:700;font-size:15px;line-height:1.45">' + E(viec) + '</div>' : '') +
        '<div class="muted" style="font-size:13px">' + E(m.ten) +
        (kn ? ' ' + tagTrangThai(kn.trangThai) : (mauTag ? ' <span class="tag ' + mauTag + '">' + (laLuat ? 'luật đòi' : m.phiConnector ? 'việc, không phải nối' : '') + '</span>' : '')) + '</div>' +
        '<div class="muted" style="font-size:13px;margin-top:2px">' + E(boNhan(m.viSao)) + '</div>' +
        '</div>' +
        (ts && ts.kieu !== 'de-sau' ? '<button class="btn sm pri" data-di="obcon" data-con-ma="' + m.ma + '">Làm ngay</button>' : '') +
        '</div>';
    });
    h += '</div></div>';
    return h;
  }

  /** Nút mở luồng connector: ghi mã vào smv3:ui rồi để data-di đổi màn (W6 đăng ký router). */
  function ganNutMoCon(t) {
    document.querySelectorAll('[data-con-ma]').forEach(b => {
      b.addEventListener('click', () => datConMa(b.dataset.conMa), true); /* capture: chạy TRƯỚC bindNhac đổi TAB */
    });
  }

  function tagTrangThai(tt) {
    const map = {
      chua_hoi: ['gray', 'Chưa hỏi'], chua_co_tk: ['warn', 'Chưa có — đăng ký ngay trong app'],
      dang_dang_ky: ['warn', 'Đang làm dở — mở tiếp'], cho_duyet: ['warn', 'Đang chờ duyệt'],
      da_ket_noi: ['ok', 'Đã nối + số liệu đã chảy'], loi: ['crit', 'Lỗi'], bo_qua: ['gray', 'Đã bỏ'],
    };
    const x = map[tt] || ['gray', tt];
    return '<span class="tag ' + x[0] + '">' + E(x[1]) + '</span>';
  }

  /* ═══════════ §7. OB-4 «LUỒNG TỪNG CONNECTOR» (B.8 — 3 kiểu) ═══════════ */

  function viewObCon(t) {
    const ma = docConMa();
    const ts = THAM_SO_CONNECTOR[ma];
    if (!ts) return '<div class="note crit">Không rõ dịch vụ cần nối — quay lại danh mục và bấm «Làm ngay».</div>';
    const kn = ketNoiCua(t, ma);
    const dm = danhMucCho(t);
    const laLuat = dm.batBuoc.some(m => m.ma === ma);
    let h = dariaCanBo(t);
    h += '<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:8px">' +
      '<button class="btn sm gh ob-doinguoi" data-di="obkichhoat">Đổi người bấm</button>' +
      '<button class="btn sm gh" id="obc-desau2">' + (laLuat ? 'Hoãn — cán bộ theo' : 'Để sau') + '</button></div>';
    h += '<div class="card"><div class="hd"><h2>' + E(ts.ten) + '</h2>' +
      (laLuat ? '<span class="tag br">LUẬT ĐÒI — không bỏ qua</span>' : '') + '</div><div class="bd">' +
      '<div class="muted">' + E(boNhan(ts.giaTri)) + '</div>' +
      '<p style="font-size:17px;font-weight:700;margin-top:10px">' + E(ts.ten) + ' — nhà mình ĐÃ có tài khoản chưa?</p>' +
      '<button class="btn pri w" style="margin-top:8px" id="obc-co">Có rồi</button>' +
      '<button class="btn w" style="margin-top:8px" id="obc-chua">Chưa có — đăng ký ngay trong app</button>' +
      (laLuat
        ? '<button class="btn gh w" style="margin-top:8px" id="obc-hoan">Hoãn — cán bộ theo dõi (nhóm LUẬT không bỏ qua)</button>'
        : '<button class="btn gh w" style="margin-top:8px" id="obc-desau">Để sau</button>') +
      '<button class="btn gh w" style="margin-top:8px" data-di="obdanhmuc">Quay lại danh mục</button>' +
      '</div></div>';

    /* trạng thái hiện tại */
    if (kn.trangThai !== 'chua_hoi') {
      h += '<div class="card"><div class="hd"><h2>Việc này đang thế nào</h2></div><div class="bd tight list">' +
        '<div class="row"><div style="flex:1">' + tagTrangThai(kn.trangThai) +
        (kn.hanDuKien ? '<div class="muted">Dự kiến xong <b>' + E(F.dmy(kn.hanDuKien)) + '</b></div>' : '') +
        (kn.aiBam ? '<div class="muted">Người bấm cuối: ' + E(boNhan(kn.aiBam)) + '</div>' : '') +
        (kn.lyDo ? '<div class="muted">Lý do: ' + E(boNhan(kn.lyDo)) + '</div>' : '') +
        '</div></div>' +
        '<div class="row"><div class="muted">Chờ bao lâu: ' + E(boNhan(ts.leadTime)) + '</div></div>' +
        '</div></div>';
    }

    h += '<div class="card"><div class="hd"><h2>Vì sao + cần gì</h2></div><div class="bd tight list">' +
      '<div class="row"><div style="flex:1"><div style="font-weight:600;font-size:13.5px">Tiên quyết</div><div class="muted">' + E(boNhan(ts.tienQuyen)) + '</div></div></div>' +
      '<div class="row"><div style="flex:1"><div style="font-weight:600;font-size:13.5px">Hồ sơ cần nộp</div><div class="muted">' + E(boNhan(ts.hoSo)) + '</div></div></div>' +
      '<div class="row"><div style="flex:1"><div style="font-weight:600;font-size:13.5px">Phí và ràng buộc</div><div class="muted">' + E(boNhan(ts.phi)) + '</div></div></div>' +
      /* bản gốc có nhãn [Q-0xx] — chỉ nằm trong khối nguồn màn hình (W0 #13) */
      '<details><summary class="muted" style="font-size:12.5px;padding:6px 0">Nguồn màn hình — cho người chấm demo</summary>' +
      '<div class="muted" style="font-size:12.5px">' + E(ts.giaTri) + '<br>' + E(ts.tienQuyen) + '<br>' + E(ts.hoSo) + '<br>' + E(ts.leadTime) + '<br>' + E(ts.phi) + '</div></details>' +
      '</div></div>';

    /* ketoan: không nút nối — chỉ dẫn + xuất dữ liệu (C.9) */
    if (ma === 'ketoan') {
      h += '<div class="note br">Nền tảng này của Nhà nước, chưa vận hành — OPC không làm thay sổ kế toán. ' +
        '<button class="btn sm" style="margin-left:6px" id="obc-xemhuongdan">Xem hướng dẫn nền tảng miễn phí của Nhà nước</button></div>';
    }
    /* khối «cài đặt nâng cao» — thuật ngữ kỹ thuật chỉ nằm ở đây */
    if (ma === 'bank') {
      h += '<details class="card"><summary style="padding:12px;font-weight:600;font-size:13.5px">Cài đặt nâng cao — cho cán bộ</summary><div class="bd">' +
        '<div class="muted">Webhook at-least-once; thử lại 7 lần giãn Fibonacci ~33 phút, quá 5 giờ bỏ; ' +
        'phản hồi 200 trong 30 giây (Webhooks) / 8 giây (Bank Hub IPN); chống trùng theo id/transaction_id. [Q-002·Q-006]</div>' +
        '</div></details>';
    }
    if (ts.kichBan && ma !== 'ketoan' && KICH_BAN_HOP_LE.indexOf(ts.kichBan) >= 0) {
      h += '<div class="card"><div class="bd">' +
        '<button class="btn w" id="obc-mophong">Mô phỏng: sự kiện xác nhận từ «' + E(ts.ten) + '»</button>' +
        '<div class="muted" style="margin-top:6px">Nút dành cho người chấm demo — tạo sự kiện thật trong hộp thư đến rồi xử lý.</div>' +
        '</div></div>';
    }
    return h;
  }

  function bindObCon(t) {
    const ma = docConMa();
    const ts = THAM_SO_CONNECTOR[ma];
    const dm = danhMucCho(t);
    const laLuat = dm.batBuoc.some(m => m.ma === ma);
    ganDoiNguoi(t);
    const d2 = document.querySelector('#obc-desau2');
    if (d2) d2.onclick = () => {
      if (laLuat) { const h = document.querySelector('#obc-hoan'); if (h) h.click(); }
      else sheetLyDoBoQua(t, ma);
    };
    const co = document.querySelector('#obc-co'), chua = document.querySelector('#obc-chua');
    if (co) co.onclick = () => luongCo(t, ma);
    if (chua) chua.onclick = () => luongChua(t, ma);
    const hoan = document.querySelector('#obc-hoan');
    if (hoan) hoan.onclick = () => {
      const ob = trangThai(t);
      ob.viecHoanLuat = ob.viecHoanLuat || [];
      ob.viecHoanLuat.push({ ma, ngay: SM.CLOCK.today, nguoi: t.chuHo });
      ghiNhatKy(t, { viec: 'Hoãn mục LUẬT ' + (THAM_SO_CONNECTOR[ma] ? THAM_SO_CONNECTOR[ma].ten : ma) + ' — cán bộ theo dõi', lyDo: 'Nhóm LUẬT không có «bỏ qua» (B.1)' });
      SM.save();
      toast('Đã hoãn — cán bộ theo dõi việc này, app không coi là xong');
      veLai(t, viewObCon, bindObCon);
    };
    const ds = document.querySelector('#obc-desau');
    if (ds) ds.onclick = () => sheetLyDoBoQua(t, ma);
    const mp = document.querySelector('#obc-mophong');
    if (mp) mp.onclick = () => { moPhong(t, ts.kichBan, ts.ten); veLai(t, viewObCon, bindObCon); };
    const hd = document.querySelector('#obc-xemhuongdan');
    if (hd) hd.onclick = () => sheet('Nền tảng dùng chung của Nhà nước',
      '<div class="card"><div class="bd"><div class="muted">Theo Điều 10 Nghị định 20/2026 — chưa vận hành. ' +
      'Khi vận hành thì miễn phí. OPC chỉ dẫn sang, không làm thay sổ kế toán (N-01).</div>' + /* miễn phí [Q-001] */
      '<div class="note br" style="margin-top:8px">Dữ liệu của hộ thuộc về hộ — xuất JSON/CSV bất cứ lúc nào ở màn «Tạm dừng dùng OPC».</div></div></div>');
  }

  /** Nhánh XIN QUYỀN («Có rồi») theo 3 kiểu B.8. */
  function luongCo(t, ma) {
    const ts = THAM_SO_CONNECTOR[ma];
    if (ma === 'bank') return sheetSePayCo(t);
    if (ma === 'zalooa') {
      sheet('Zalo OA — cho phép OPC quản tin',
        '<div class="card"><div class="bd">' +
        '<div class="muted">Nhập số điện thoại quản trị OA của nhà mình, rồi quét mã «cấp quyền cho OPC quản tin».</div>' +
        '<input id="oa-sdt" placeholder="Số điện thoại quản trị OA" style="width:100%;font-size:17px;padding:10px;margin-top:8px">' +
        '<button class="btn w" style="margin-top:8px" id="oa-quet">Mô phỏng quét mã cấp quyền</button>' +
        '<div class="note warn" style="margin-top:10px">Cách Zalo cho phép app quản tin hộ: <b>chưa có tài liệu rõ</b> — đang kiểm tra. App ghi «chờ xác nhận cơ chế — cán bộ kiểm tra».</div>' + /* Q-047 — nhãn chỉ nằm ở lyDo + nguồn màn hình (W0 #11) */
        '</div></div>', w => {
          w.querySelector('#oa-quet').onclick = () => {
            const r = datKetNoi(t, 'zalooa', 'cho_duyet', { aiBam: t.chuHo, hanDuKien: null,
              lyDo: 'Xin quyền quản tin OA — chờ xác nhận cơ chế (Q-047): chưa rõ thời gian — có cán bộ theo dõi' });
            closeSheet();
            toast(r && r.ok ? 'Đã gửi xin quyền — đang chờ xác nhận cơ chế, cán bộ kiểm tra' : (r && r.lyDo) || 'Lỗi');
            veLai(t, viewObCon, bindObCon);
          };
        });
      return;
    }
    if (ma === 'hddt') {
      sheet('HĐĐT — ai đang phát hành hoá đơn cho nhà mình?',
        '<div class="card"><div class="bd">' +
        ['Viettel', 'VNPT', 'MISA', 'FPT', 'SePay'].map(n =>
          '<button class="btn w" style="margin-top:6px;text-align:left" data-ncc="' + n + '">Đang dùng ' + n + '</button>').join('') +
        '<div class="muted" style="margin-top:10px">Nhà cung cấp được cơ quan thuế công nhận. Cơ chế chuyển/ghép nối từng nhà cung cấp: <b>chưa có bằng chứng</b> — app ghi rõ «chưa rõ thời gian — có cán bộ theo dõi».</div>' + /* [Q-002]; (Q-021) */
        '</div></div>', w => {
          w.querySelectorAll('[data-ncc]').forEach(b => b.onclick = () => {
            const r = datKetNoi(t, 'hddt', 'cho_duyet', { aiBam: t.chuHo, hoSoDaNop: ['don-chuyen-noi'],
              lyDo: 'Đối tác cũ ' + b.dataset.ncc + ' → chuyển/ghép nối OPC — chưa rõ thời gian — có cán bộ theo dõi (Q-021)' });
            closeSheet();
            toast(r && r.ok ? 'Đã ghi việc chuyển từ ' + b.dataset.ncc + ' — cán bộ theo dõi' : (r && r.lyDo) || 'Lỗi');
            veLai(t, viewObCon, bindObCon);
          });
        });
      return;
    }
    /* sàn / vận chuyển / đặt phòng: uỷ quyền trên trang chính chủ (mô phỏng) */
    sheet('Cấp quyền trên trang chính chủ',
      '<div class="card"><div class="bd">' +
      '<div style="font-size:15px">App mở trang chính chủ của <b>' + E(ts.ten) + '</b> — cô chú đăng nhập và bấm cho phép. OPC không giữ mật khẩu của bên khác.</div>' +
      '<div class="muted" style="margin-top:8px">Chờ bao lâu: ' + E(boNhan(ts.leadTime)) + '</div>' +
      '<button class="btn pri w" style="margin-top:10px" id="cc-xong">' + E(t.chuHo) + ' bấm: Tôi đã cấp quyền xong</button>' +
      '</div></div>', w => {
        w.querySelector('#cc-xong').onclick = () => {
          const r = datKetNoi(t, ma, 'cho_duyet', { aiBam: t.chuHo, hanDuKien: null,
            lyDo: 'Chờ ' + (CHO_AI[ma] || ts.ten) });
          closeSheet();
          toast(r && r.ok ? 'Đã ghi — đang chờ ' + (CHO_AI[ma] || 'phía ' + ts.ten) : (r && r.lyDo) || 'Lỗi');
          veLai(t, viewObCon, bindObCon);
        };
      });
  }

  /** SePay nhánh CÓ — chọn ngân hàng → trang SePay → OTP → webhook thử (B.8 Kiểu 1). */
  function sheetSePayCo(t) {
    sheet('Chọn ngân hàng của nhà mình',
      '<div class="card"><div class="bd"><div class="muted">SePay nối được 12+ ngân hàng — chọn ngân hàng cô chú đang dùng:</div>' + /* [Q-002] */
      NGAN_HANG.map(n => '<button class="btn sm" style="margin:4px 4px 0 0" data-nh="' + n + '">' + n + '</button>').join('') +
      '</div></div>', w => {
        w.querySelectorAll('[data-nh]').forEach(b => b.onclick = () => {
          const nh = b.dataset.nh;
          closeSheet();
          sheet('Trang này do SePay phụ trách',
            '<div class="card"><div class="bd">' +
            '<div class="note br" style="font-size:15px"><b>Đang sang trang của NGÂN HÀNG — giống đưa thẻ cho thu ngân.</b> Làm xong bên đó thì quay lại đây — app chờ, không đi đâu cả.</div>' +
            '<div class="muted" style="margin-top:8px">Đang mở trang nối của SePay — <span class="mono">developer.sepay.vn</span> (mô phỏng)</div>' +
            '<div class="muted" style="margin-top:6px">Trang này do <b>SePay</b> phụ trách, không phải OPC. Mã ngân hàng gửi về điện thoại của cô chú — cán bộ không làm thay bước này (N-06).</div>' +
            '<button class="btn pri w" style="margin-top:10px" id="sp-otp">Nhập mã ngân hàng gửi về — ' + E(nh) + ' (mô phỏng)</button>' +
            '<button class="btn w" style="margin-top:8px" data-sp-quaylai>Quay lại app</button>' +
            '</div></div>', w2 => {
              const ql = w2.querySelector('[data-sp-quaylai]');
              if (ql) ql.onclick = () => { closeSheet(); toast('Đã quay lại app — việc nối để dở, mở lại bất cứ lúc nào'); veLai(t, viewObCon, bindObCon); };
              w2.querySelector('#sp-otp').onclick = () => {
                closeSheet();
                sheet('Nhập mã ngân hàng gửi về điện thoại',
                  '<div class="card"><div class="bd">' +
                  '<div class="muted">Bản demo: gõ bất kỳ 6 số nào cũng được.</div>' +
                  '<input id="sp-otp-input" maxlength="6" inputmode="numeric" placeholder="••••••" style="width:100%;font-size:24px;text-align:center;letter-spacing:8px;padding:10px;margin-top:8px">' +
                  '<button class="btn pri w" style="margin-top:10px" id="sp-xacnhan">' + E(t.chuHo) + ' bấm: Xác nhận cấp quyền</button>' +
                  '</div></div>', w3 => {
                    w3.querySelector('#sp-xacnhan').onclick = () => {
                      closeSheet();
                      const r = datKetNoi(t, 'bank', 'da_ket_noi', { aiBam: t.chuHo + ' — mã ngân hàng ' + nh + ' (mô phỏng)' });
                      if (r && r.ok) moPhong(t, 'tienVe', 'SePay gửi thử một dòng tiền về');
                      toast(r && r.ok ? 'SePay gửi thử một dòng tiền về — nhận được, đã nối!' : (r && r.lyDo) || 'Lỗi');
                      veLai(t, viewObCon, bindObCon);
                    };
                  });
              };
            });
        });
      });
  }

  /** Nhánh ĐĂNG KÝ MỚI («Chưa có») theo kiểu. */
  function luongChua(t, ma) {
    const ts = THAM_SO_CONNECTOR[ma];
    if (ma === 'bank') {
      sheet('Chưa có tài khoản ngân hàng?',
        '<div class="card"><div class="bd">' +
        '<div style="font-size:15px">OPC <b>không mở hộ</b> tài khoản ngân hàng — việc đó của ngân hàng (N-07). Checklist ngắn:</div>' +
        '<div class="bd tight list" style="margin-top:8px">' +
        '<div class="row">✓ Đem CCCD đến quầy ngân hàng gần nhất</div>' +
        '<div class="row">✓ Muốn chọn ngân hàng nào cứ hỏi cán bộ — không bắt buộc ngân hàng nào</div>' +
        '</div>' +
        '<button class="btn pri w" style="margin-top:10px" id="bn-xong">Xong, tôi đã có tài khoản</button>' +
        '</div></div>', w => {
          w.querySelector('#bn-xong').onclick = () => { closeSheet(); sheetSePayCo(t); };
        });
      return;
    }
    if (ma === 'zalooa') {
      sheetZaloDangKy(t);
      return;
    }
    if (ma === 'hddt' || ma === 'cts') return luongHddtCts(t, ma);
    if (ma === 'etax') {
      sheet('Kê khai thuế điện tử',
        '<div class="card"><div class="bd">' +
        '<div style="font-size:15px">Không có kết nối tự động với cơ quan thuế. Cách làm: <b>cán bộ mở phiên, hộ xác nhận và bấm «Nộp»</b> — thủ công hai chiều là mức tối đa của N-06.</div>' +
        '<div class="muted" style="margin-top:8px">Miễn phí — cổng của Nhà nước. Kỳ kê khai chi tiết cho hộ dưới 1 tỷ: ' + CHUA_RO + '.</div>' + /* [Q-002]; [Q-001]; Q-023 */
        '<button class="btn pri w" style="margin-top:10px" id="et-mo">Cán bộ mở phiên kê khai đầu tiên (mô phỏng)</button>' +
        '</div></div>', w => {
          w.querySelector('#et-mo').onclick = () => {
            const ob = trangThai(t);
            if (!ob.coCanBo) ob.coCanBo = { maCanBo: 'CB-01', ten: 'Cán bộ hỗ trợ CB-01', diaBan: t.diaBan,
              ghiChu: 'Bản demo gán CB-01 — tên thật do seed b2g đặt' };
            const r = datKetNoi(t, 'etax', 'dang_dang_ky', { aiBam: 'cán bộ mở phiên — hộ bấm «Nộp» khi tới kỳ' });
            closeSheet();
            toast(r && r.ok ? 'Đã hẹn phiên kê khai đầu tiên cùng cán bộ' : (r && r.lyDo) || 'Lỗi');
            veLai(t, viewObCon, bindObCon);
          };
        });
      return;
    }
    if (ma === 'pos') {
      sheet('Máy tính tiền',
        '<div class="card"><div class="bd">' +
        '<div style="font-size:15px">Cán bộ xuống quầy lắp và nối trong 1 buổi — hộ duyệt trước khi dùng. ' +
        'Đường hoá đơn: máy tính tiền kết nối dữ liệu cơ quan thuế; danh mục thiết bị đang kiểm tra.</div>' + /* 1 buổi [tự đề xuất]; [Q-001]; Q-046 */
        '<button class="btn pri w" style="margin-top:10px" id="pos-hen">Hẹn cán bộ xuống lắp (mô phỏng)</button>' +
        '</div></div>', w => {
          w.querySelector('#pos-hen').onclick = () => {
            const r = datKetNoi(t, 'pos', 'dang_dang_ky', { aiBam: 'cán bộ lắp — hộ duyệt' });
            closeSheet();
            toast(r && r.ok ? 'Đã hẹn — việc nằm trong Sổ trực của cán bộ' : (r && r.lyDo) || 'Lỗi');
            veLai(t, viewObCon, bindObCon);
          };
        });
      return;
    }
    /* sàn/shipper/booking chưa có tài khoản — cũng cấp quyền trang chính chủ sau khi đăng ký bên ngoài */
    sheet('Chưa có tài khoản ' + ts.ten,
      '<div class="card"><div class="bd">' +
      '<div style="font-size:15px">Đăng ký tài khoản người bán trên trang chính chủ của <b>' + E(ts.ten) + '</b> (miễn phí, theo chính sách bên đó). Xong rồi quay lại đây bấm «Có rồi».</div>' +
      '<div class="muted" style="margin-top:8px">Chờ bao lâu sau khi cấp quyền: ' + E(boNhan(ts.leadTime)) + '</div>' +
      '<button class="btn gh w" style="margin-top:10px" data-x>Đóng — để tôi đăng ký đã</button>' +
      '</div></div>');
  }

  /** Zalo OA nhánh CHƯA — form thu hồ sơ, chủ hộ bấm Gửi (B.8 Kiểu 2). */
  function sheetZaloDangKy(t) {
    sheet('Đăng ký Zalo OA ngay trong app',
      '<div class="card"><div class="bd">' +
      '<div class="muted">Cần: Giấy phép ĐKKD + tên OA + ảnh đại diện. App điền sẵn từ hồ sơ — cô chú chỉ chụp ảnh giấy phép.</div>' + /* [Q-004] */
      '<table class="t" style="margin-top:8px">' +
      '<tr><td>Tên hộ</td><td style="text-align:right">' + E(t.name) + '</td></tr>' +
      '<tr><td>Chủ hộ</td><td style="text-align:right">' + E(t.chuHo) + '</td></tr>' +
      '<tr><td>MST</td><td style="text-align:right" class="mono">' + E(t.mst || '(chưa có)') + '</td></tr>' +
      '<tr><td>Địa bàn</td><td style="text-align:right">' + E(t.diaBan) + '</td></tr>' +
      '<tr><td>Tên OA đề xuất</td><td style="text-align:right">' + E(t.name) + '</td></tr></table>' +
      '<button class="btn w" style="margin-top:10px" id="oa-chup">Đính kèm ảnh giấy phép (mô phỏng)</button> <span class="tag ok" id="oa-dachup" style="display:none">đã gắn ảnh</span>' +
      '<div class="note br" style="margin-top:8px">' + DONG_ANH_GIAY_TO + '</div>' +
      '<button class="btn w" style="margin-top:10px" id="oa-xemtruoc">Xem trước đơn (PDF)</button>' +
      '<button class="btn pri w" style="margin-top:8px;font-size:16.5px" id="oa-gui">' + E(t.chuHo) + ' bấm: Gửi đăng ký</button>' +
      '<div class="muted" style="margin-top:8px">Ban quản trị Zalo duyệt hồ sơ trong <b>2–3 ngày làm việc</b>. Trong lúc chờ, tin Zalo CÁ NHÂN của khách vẫn vào app bình thường — khách không phải chờ.</div>' + /* 2–3 ngày làm việc [Q-004] */
      '<div class="note warn" style="margin-top:8px">Phí khi dùng: trả lời khách trong cửa sổ 7 ngày, 8 tin miễn phí/48 giờ rồi 55đ/tin; tin Giao dịch 165đ/tin.</div>' + /* [Q-005] */
      '</div></div>', w => {
        const danhDau = () => { const s = w.querySelector('#oa-dachup'); if (s) s.style.display = ''; };
        w.querySelector('#oa-chup').onclick = () => { toast('Đã gắn ảnh giấy phép (mô phỏng)'); danhDau(); };
        w.querySelector('#oa-xemtruoc').onclick = () =>
          sheet('Xem trước đơn đăng ký OA',
            '<div class="card"><div class="bd"><div class="muted">ĐƠN ĐĂNG KÝ ZALO OA (bản xem trước — mô phỏng PDF)</div>' +
            '<table class="t" style="margin-top:8px">' +
            '<tr><td>Hộ kinh doanh</td><td>' + E(t.name) + '</td></tr>' +
            '<tr><td>Chủ hộ</td><td>' + E(t.chuHo) + '</td></tr>' +
            '<tr><td>MST</td><td class="mono">' + E(t.mst || '(chưa có)') + '</td></tr>' +
            '<tr><td>Tên OA</td><td>' + E(t.name) + '</td></tr>' +
            '<tr><td>Đính kèm</td><td>Ảnh giấy phép ĐKKD (bản rút gọn)</td></tr></table>' +
            '<div class="muted" style="margin-top:8px">Người ký đơn: ' + E(t.chuHo) + ' — bấm «Gửi đăng ký» ở màn trước.</div></div></div>');
        w.querySelector('#oa-gui').onclick = () => {
          const han = congNgayLamViec(SM.CLOCK.today, 3); /* 2–3 ngày làm việc [Q-004] */
          const r = datKetNoi(t, 'zalooa', 'cho_duyet', { aiBam: t.chuHo, batDauLuc: SM.CLOCK.today, hanDuKien: han,
            hoSoDaNop: ['don-dang-ky-oa', 'anh-gpkd'] });
          if (r && r.ok) SM.enqueue('dangky', 'Gửi đăng ký Zalo OA', { tenant: t.id, connector: 'zalooa' });
          closeSheet();
          toast(r && r.ok ? 'Đã gửi — dự kiến duyệt xong trước ngày ' + F.dmy(han) : (r && r.lyDo) || 'Lỗi');
          veLai(t, viewObCon, bindObCon);
        };
      });
  }

  /** HĐĐT / CTS — Kiểu 3 «điều kiện + người ký» (B.8). */
  function luongHddtCts(t, ma) {
    const ob = trangThai(t);
    const trenTy = vuotNguongThat(t).ok; /* W0 câu 4(d): không dùng câu đoán để mở luồng LUẬT */
    if (ma === 'cts') {
      sheet('Chữ ký số — ký online, không cần USB',
        '<div class="card"><div class="bd">' +
        '<div style="font-size:15px">Đường chính là <b>ký số online 100%, không cần đồ cắm thêm</b>. ' +
        'Nếu đã có đồ cắm USB của nhà cung cấp cũ: cần mượn máy tính có cổng, 1 lần — đường này là đường phụ.</div>' + /* ký số online không USB token [Q-002] */
        '<div class="note warn" style="margin-top:8px">Hồ sơ đăng ký chữ ký số cho hộ kinh doanh cần gì: <b>chưa có bằng chứng</b> — ' + CHUA_RO + '.</div>' + /* Q-041 */
        '<div class="note br" style="margin-top:8px"><b>' + E(t.chuHo) + '</b> — chữ ký này là của cô/chú, dùng cho hoá đơn và tờ khai — không ai khác dùng được.</div>' +
        '<button class="btn pri w" style="margin-top:10px;font-size:16.5px" id="cts-ky">' + E(t.chuHo) + ' bấm: Ký đơn đăng ký</button>' +
        '<div class="muted" style="margin-top:8px">Người ký là chủ hộ — không ai ký thay (N-06). Chờ duyệt: ' + CHUA_RO + '.</div>' + /* Q-041 */
        '</div></div>', w => {
          w.querySelector('#cts-ky').onclick = () => {
            const r = datKetNoi(t, 'cts', 'cho_duyet', { aiBam: t.chuHo, hanDuKien: null,
              lyDo: 'Chờ nhà cung cấp xác nhận — ' + CHUA_RO + ' (Q-041)' });
            closeSheet();
            toast(r && r.ok ? 'Đã ký đơn — cán bộ theo dõi tiến độ duyệt' : (r && r.lyDo) || 'Lỗi');
            veLai(t, viewObCon, bindObCon);
          };
        });
      return;
    }
    /* hddt */
    const moLuong = trenTy || (ob.traLoi.kenh || []).indexOf('b2b') >= 0 || ob.moHddtTuNguyen;
    if (!moLuong) {
      sheet('Hoá đơn điện tử — chưa bắt buộc với hộ mình',
        '<div class="card"><div class="bd">' +
        '<div style="font-size:15px">Chưa bắt buộc với hộ mình — app <b>canh giùm bằng số bán thật</b>, tới lúc gần 1 tỷ sẽ nhắc làm hồ sơ trước 30 ngày.</div>' +
        '<div class="muted" style="margin-top:8px">Nếu khách doanh nghiệp đòi hoá đơn thì làm được luôn — đây là <b>nhu cầu của hộ, không phải luật đòi</b>. Nhà mình vẫn đăng ký tự nguyện được qua cổng miễn phí.</div>' + /* đăng ký tự nguyện qua cổng miễn phí [Q-002] */
        '<button class="btn w" style="margin-top:10px" id="hd-doi">Khách doanh nghiệp đòi hoá đơn — tôi muốn đăng ký</button>' +
        '</div></div>', w => {
          w.querySelector('#hd-doi').onclick = () => {
            trangThai(t).moHddtTuNguyen = true; SM.save();
            closeSheet(); luongHddtCts(t, ma);
          };
        });
      return;
    }
    sheet('Hoá đơn điện tử — 2 đường' + (trenTy ? ' · hạn 30 ngày đang chạy' : ' · tự nguyện'),
      '<div class="card"><div class="bd">' +
      (trenTy
        ? '<div class="note crit">Đã vượt 1 tỷ — phải đăng ký trong <b>30 ngày</b> theo luật. ' + dongHo30Ngay(t) + '</div>'
        : '<div class="note br">Đây là nhu cầu của hộ, không phải luật đòi — tự nguyện.</div>') + /* hạn 30 ngày [Q-001]; tự nguyện [Q-002] */
      '<div style="font-weight:700;margin-top:10px">Đường 1 — Cổng miễn phí của cơ quan thuế</div>' +
      '<div class="muted">hoadondientu.gdt.gov.vn — hoá đơn có mã <b>miễn phí</b>, đăng ký bằng MST, phản hồi 15 phút–1 ngày làm việc. App điền đơn từ hồ sơ.</div>' +
      '<button class="btn pri w" style="margin-top:8px;font-size:16.5px" id="hd-gui">' + E(t.chuHo) + ' bấm: Gửi đăng ký (cổng miễn phí)</button>' +
      /* W0 #10: trước mặt hộ chỉ nói «dịch vụ hoá đơn của hãng khác» — chữ máy móc nằm ở khối nâng cao */
      '<div style="font-weight:700;margin-top:14px">Đường 2 — Dùng dịch vụ hoá đơn của hãng khác</div>' +
      '<div class="muted">Ký số online 100% không cần đồ cắm thêm (SePay eInvoice). Giá và cách trả tiền: <b>chưa có bằng chứng</b> — <b>đang kiểm tra giá, xong sẽ hỏi trước khi bật</b>.</div>' + /* [Q-002]; giá (Q-040) */
      '<button class="btn w" style="margin-top:8px" id="hd-ncc">Chờ nhà cung cấp — cán bộ báo lại khi rõ giá</button>' +
      '<div class="muted" style="margin-top:8px">Lưu ý: phát hành hoá đơn cần <b>chữ ký số</b> — nếu chưa ký, làm mục Chữ ký số trước.</div>' + /* [Q-001] */
      '</div></div>', w => {
        w.querySelector('#hd-gui').onclick = () => {
          const han = congNgayLamViec(SM.CLOCK.today, 1); /* 15 phút–1 ngày làm việc [Q-002] */
          const r = datKetNoi(t, 'hddt', 'cho_duyet', { aiBam: t.chuHo, hanDuKien: han,
            hoSoDaNop: ['don-dang-ky-hddt'], lyDo: trenTy ? 'Bắt buộc — vượt 1 tỷ [Q-001]' : 'Tự nguyện — khách doanh nghiệp đòi hoá đơn' });
          if (r && r.ok) SM.enqueue('dangky', 'Gửi đăng ký HĐĐT (cổng miễn phí)', { tenant: t.id, connector: 'hddt' });
          closeSheet();
          toast(r && r.ok ? 'Đã gửi — cổng thường phản hồi trong 15 phút đến 1 ngày làm việc' : (r && r.lyDo) || 'Lỗi');
          veLai(t, viewObCon, bindObCon);
        };
        w.querySelector('#hd-ncc').onclick = () => {
          const r = datKetNoi(t, 'hddt', 'dang_dang_ky', { aiBam: null,
            lyDo: 'Chờ giá nhà cung cấp (Q-040) — đang kiểm tra, sẽ hỏi trước khi bật' });
          closeSheet();
          toast(r && r.ok ? 'Đã ghi — cán bộ báo lại khi rõ giá, KHÔNG bật khi chưa hỏi' : (r && r.lyDo) || 'Lỗi');
          veLai(t, viewObCon, bindObCon);
        };
      });
  }

  function dongHo30Ngay(t) {
    if (typeof D.mocVuotNguong !== 'function') return 'Đồng hồ 30 ngày cần hàm D.mocVuotNguong (việc W2).';
    const m = D.mocVuotNguong(t);
    if (!m) return '';
    if (m.conLai < 0) return '<b>Đã quá hạn ' + Math.abs(m.conLai) + ' ngày</b> — ' +
      (trangThai(t).coCanBo ? 'cán bộ ' + E(trangThai(t).coCanBo.ten) + ' sẽ liên hệ hôm nay.' : 'cán bộ đã nhận việc.');
    return 'Còn <b>' + m.conLai + ' ngày</b> — hết ngày ' + F.dmy(m.han) + '.'; /* hạn 30 ngày [Q-001] */
  }

  function sheetLyDoBoQua(t, ma) {
    const ts = THAM_SO_CONNECTOR[ma];
    sheet('Vì sao để sau? — ' + ts.ten,
      '<div class="card"><div class="bd">' +
      ['Chưa có giấy tờ', 'Chưa sẵn sàng làm tuần này', 'Muốn hỏi cán bộ trước']
        .map(l => '<button class="btn w" style="margin-top:6px;text-align:left" data-lydo="' + E(l) + '">' + l + '</button>').join('') +
      '<input id="bq-khac" placeholder="Lý do khác (nếu muốn ghi rõ)" style="width:100%;font-size:15px;padding:9px;margin-top:8px">' +
      '<button class="btn pri w" style="margin-top:8px" id="bq-xong">Để sau với lý do này</button>' +
      '</div></div>', w => {
        const chon = lyDo => {
          const r = datKetNoi(t, ma, 'bo_qua', { lyDo: lyDo });
          closeSheet();
          toast(r && r.ok ? 'Đã ghi «' + ts.ten + ' — để sau»: ' + lyDo : (r && r.lyDo) || 'Lỗi');
          veLai(t, viewObCon, bindObCon);
        };
        w.querySelectorAll('[data-lydo]').forEach(b => b.onclick = () => chon(b.dataset.lydo));
        w.querySelector('#bq-xong').onclick = () => {
          const khac = String(w.querySelector('#bq-khac').value || '').trim();
          chon(khac || 'Để sau — không ghi rõ hơn');
        };
      });
  }

  /* ═══════════ §8. OB-5 «TRẠM KẾT NỐI» (B.9 + D-#2/#5/#6) ═══════════ */

  function viewTram(t) {
    const ob = trangThai(t);
    const { ds, dm } = connectorTrongDanhMuc(t);
    let h = '';

    /* banner mờ khi đang «Để sau» */
    if (ob.buoc === 'bo_qua_tam') {
      h += '<div class="note warn">Phần mở đầu còn dở — 5 phút là xong. ' +
        '<button class="btn sm" data-di="' + E(ob.manDangCho || 'obkichhoat') + '" id="tr-molai">Mở lại chỗ đang dở</button></div>';
    }

    /* tiến độ tổng */
    h += '<div class="card"><div class="bd">' +
      '<div class="row"><b style="flex:1">Tiến độ phần mở đầu</b><span class="mid num">' + tienDo(t) + '%</span></div>' +
      '<div class="row" style="height:8px;background:var(--line);border-radius:4px;margin-top:8px;overflow:hidden">' +
      '<div style="width:' + Math.min(100, tienDo(t)) + '%;height:8px;background:var(--brand)"></div></div>' +
      '<div class="muted" style="margin-top:6px">' + E(tenBuoc(ob.buoc)) +
      (datToiThieu(t) && ob.buoc !== 'xong_viec_dau' ? ' — đã đủ danh mục tối thiểu' : '') + '</div>' +
      '</div></div>';

    /* W0 câu 4(d) + P4: hộ chưa khẳng định trên 1 tỷ và số bán thật chưa vượt → Trạm LUÔN có
       dòng canh giùm, cho MỌI nhánh trả lời (kể cả «Không biết»). Chữ lấy thẳng từ mục
       «canh-nguong» của danhMucCho — hàm tính, không viết cứng hai nơi; không con số, không
       chữ «ngưỡng»/«lũy kế» trước mặt hộ (nhãn nguồn nằm trong khối gập). */
    const canh = dm.batBuoc.find(m => m.ma === 'canh-nguong');
    if (canh) {
      h += '<div class="card"><div class="hd"><h2>' + E(canh.ten) + '</h2></div><div class="bd">' +
        '<div style="font-size:15.5px;line-height:1.55"><b>App đang theo dõi doanh thu để biết khi nào cần hoá đơn.</b></div>' +
        '<div class="muted" style="margin-top:6px">' + E(boNhan(canh.viSao)) + '</div>' +
        '<details style="margin-top:8px"><summary class="muted" style="font-size:12.5px;padding:4px 0">Nguồn màn hình — cho người chấm demo</summary>' +
        '<div class="muted" style="font-size:12.5px">' + E(canh.nguon || '') + '</div></details>' +
        '</div></div>';
    }

    /* việc giao người nhà (B.13 #10 + W0 #10) — nhắc qua Zalo, hộ TỰ gửi (N-06/N-09) */
    if (ob.viecGiaoNguoiNha) {
      const gv = ob.viecGiaoNguoiNha;
      h += '<div class="card"><div class="bd">' +
        '<div style="font-size:15px;font-weight:700">Phần còn lại để tối ' + E(gv.cho) + ' bấm — app đã để sẵn</div>' +
        '<div class="muted" style="margin-top:4px">Tối ' + E(gv.cho) + ' mở máy sẽ thấy việc chờ ngay đầu app (ghi ngày ' + E(F.dmy(gv.luc)) + ').</div>' +
        '<button class="btn w" style="margin-top:8px" id="tr-nhaczalo">Nhắc ' + E(gv.cho) + ' qua Zalo</button>' +
        '<div class="muted" style="margin-top:6px">Bấm ra tin nhắn soạn sẵn — cô/chú đọc lại rồi tự bấm gửi trong Zalo.</div>' +
        '</div></div>';
    }

    /* việc đầu tiên (B.10) — MỘT việc, không menu */
    if (ob.buoc === 'du_toi_thieu' || ob.buoc === 'xong_viec_dau') h += theViecDauTien(t);

    /* khối 1 — đang chờ ai */
    const dangCho = DANH_SACH_ID.filter(ma => {
      const k = ketNoiCua(t, ma).trangThai; return k === 'cho_duyet' || k === 'dang_dang_ky';
    });
    h += '<div class="card"><div class="hd"><h2>Đang chờ ai — dự kiến ngày nào</h2><span class="sub">' + dangCho.length + ' việc</span></div>';
    if (!dangCho.length) h += '<div class="bd"><div class="muted">Hiện không có việc nào đang chờ phía nào cả.</div></div>';
    else {
      h += '<div class="bd tight list">';
      dangCho.forEach(ma => {
        const ts = THAM_SO_CONNECTOR[ma], k = ketNoiCua(t, ma);
        const quaHan = k.hanDuKien && chenhNgay(k.hanDuKien, SM.CLOCK.today) < 0;
        const obc = trangThai(t).coCanBo;
        h += '<div class="row" style="align-items:flex-start">' +
          '<div style="flex:1;min-width:0">' +
          '<div style="font-weight:600;font-size:14px">' + E(ts.ten) + (quaHan ? ' <span class="tag crit">Đã quá ngày dự kiến</span>' : '') + '</div>' +
          (k.trangThai === 'dang_dang_ky'
            ? '<div class="muted">Đang làm dở — bấm mở tiếp đúng chỗ bỏ dở.</div>'
            : '<div class="muted">Đang chờ <b>' + E(CHO_AI[ma] || 'phía bên ngoài') + '</b>' +
              (k.hanDuKien ? ' — dự kiến <b>' + E(F.dmy(k.hanDuKien)) + '</b>' : ' — ' + CHUA_RO) + '</div>') +
          (quaHan ? '<div class="muted" style="margin-top:4px">Cái này chậm hơn hẹn — <b>KHÔNG phải lỗi của cô/chú</b>' + (obc ? ' — cán bộ ' + E(obc.ten) : '') + '.</div>' : '') +
          thanhThoiGian(t, k) +
          '<button class="btn sm gh" style="margin-top:6px" data-chuaco="' + ma + '">Thực ra nhà mình chưa có</button>' +
          '</div>' +
          (quaHan ? nutGoiCanBo(t, ma) : '<button class="btn sm pri" data-di="obcon" data-con-ma="' + ma + '">Mở tiếp</button>') +
          '</div>';
      });
      h += '</div>';
    }
    h += '</div>';

    /* khối 2 — nối tiếp theo thứ tự niềm tin C.14 */
    const tiepTheo = ds.concat(dm.deSau.filter(m => !m.phiConnector)).filter(m => {
      const k = ketNoiCua(t, m.ma).trangThai;
      return k === 'chua_hoi' || k === 'chua_co_tk';
    }).sort((a, b) => THU_TU.indexOf(a.ma) - THU_TU.indexOf(b.ma));
    h += '<div class="card"><div class="hd"><h2>Nối tiếp — việc kế tiếp của nhà mình</h2><span class="sub">theo thứ tự: tiền về trước, hoá đơn sau</span></div>';
    if (!tiepTheo.length) h += '<div class="bd"><div class="muted">Không còn việc nối mới nào trong danh mục của hộ.</div></div>';
    else {
      h += '<div class="bd tight list">';
      tiepTheo.forEach(m => {
        const ts = THAM_SO_CONNECTOR[m.ma];
        h += '<div class="row" style="align-items:flex-start"><div style="flex:1;min-width:0">' +
          '<div style="font-weight:600;font-size:14px">' + E(ts.ten) + '</div>' +
          '<div class="muted">Mở khoá: ' + E(boNhan(ts.giaTri)) + '</div>' +
          '<div class="muted">Chờ: ' + E(boNhan(ts.leadTime)) + ' · Người bấm: ' + E(boNhan(ts.aiBam).split(';')[0]) + '</div>' +
          '</div><button class="btn sm pri" data-di="obcon" data-con-ma="' + m.ma + '">Làm ngay</button></div>';
      });
      h += '</div>';
    }
    /* W8 #14: gọi lại câu hỏi kênh bán — hộ bán thêm chỗ mới giữa chừng */
    h += '<div class="bd"><button class="btn gh w" id="tr-themcho" data-di="obnhandien">Bây giờ nhà mình bán thêm chỗ khác</button>' +
      '<div class="muted" style="margin-top:6px">Trở lại câu «Hàng nhà mình bán qua chỗ nào?» — bấm thêm chỗ bán mới, danh mục tự tính lại.</div></div>';
    h += '</div>';

    /* khối 3 — đã xong, gập lại */
    const daXong = DANH_SACH_ID.filter(ma => ketNoiCua(t, ma).trangThai === 'da_ket_noi');
    h += '<div class="card"><div class="hd"><h2>Đã xong</h2><span class="sub">' + daXong.length + ' kết nối — bấm xem số liệu đã chảy</span></div>';
    if (!daXong.length) h += '<div class="bd"><div class="muted">Chưa có kết nối nào xong — làm mục đầu tiên ở khối trên nhé.</div></div>';
    else {
      h += '<div class="bd tight list">' + daXong.map(ma =>
        '<div class="row"><div style="flex:1;min-width:0"><span class="tag ok">✓</span> ' + E(THAM_SO_CONNECTOR[ma].ten) + '</div>' +
        '<button class="btn sm" data-xong="' + ma + '">Chi tiết</button></div>').join('') + '</div>';
    }
    h += '</div>';

    /* bảng độ tươi D-#2 + đứt D-#5 */
    h += bangDoTuoi(t);
    /* dòng «Điều kiện nối · Chờ · Người bấm» D-#6 */
    h += bangDieuKien(t);
    h += '<div class="note br">Trạm là MỘT nơi duy nhất theo dõi mọi việc đang nối — không có thông báo rời rạc. Đã ghi trong app, không đẩy tin ngoài khi chưa cần.</div>';
    return h;
  }

  function bindTram(t) {
    ganNutMoCon(t);
    /* W8 #14: hộ nhận ra thực ra chưa có tài khoản — hạ trạng thái + sinh việc cán bộ */
    document.querySelectorAll('[data-chuaco]').forEach(b => b.onclick = () => {
      const ma = b.dataset.chuaco;
      const r = datKetNoi(t, ma, 'chua_co_tk', { lyDo: 'Hộ nói thực ra chưa có tài khoản — cần cán bộ hướng dẫn đăng ký' });
      if (r && r.ok) {
        ghiViecQuaHan(t, ma); /* thành việc cán bộ trong Sổ trực */
        ghiNhatKy(t, { viec: 'Hộ báo thực ra chưa có ' + (THAM_SO_CONNECTOR[ma] ? THAM_SO_CONNECTOR[ma].ten : ma) + ' — cán bộ hướng dẫn đăng ký', lyDo: 'Trạm khối «Đang chờ» (W8 #14)' });
      }
      toast(r && r.ok ? 'Đã ghi — cán bộ sẽ hướng dẫn đăng ký, việc này không tính là «đang chờ» nữa' : (r && r.lyDo) || 'Lỗi');
      if (r && r.ok) veLai(t, viewTram, bindTram);
    });
    /* W8 #10: nhắc người nhà qua Zalo — sheet soạn sẵn, hộ TỰ gửi (N-06/N-09) */
    const nz = document.querySelector('#tr-nhaczalo');
    if (nz) nz.onclick = () => {
      const gv = trangThai(t).viecGiaoNguoiNha;
      if (gv) sheetNhacZalo(t, gv.cho);
    };
    /* W8 #14: quay lại câu kênh — capture chạy TRƯỚC handler data-di của mobile.html */
    const tc = document.querySelector('#tr-themcho');
    if (tc) tc.addEventListener('click', () => {
      const obx = trangThai(t);
      obx.ob2 = obx.ob2 || { cau: 3 };
      obx.ob2.cau = 3; /* về đúng câu «Hàng nhà mình bán qua chỗ nào?» */
      /* hộ bản RÚT GỌN chỉ có 2 câu — cau=3 sẽ rơi thẳng vào màn «xong», không thấy câu kênh.
         Cờ này bảo veCau vẽ ĐÚNG một câu kênh rồi tính lại danh mục (W8). */
      obx.ob2.chiCauKenh = true;
      SM.save();
    }, true);
    ganBamTruoc('#tr-molai', () => { moLai(t); toast('Quay lại đúng chỗ đang dở'); });
    document.querySelectorAll('[data-xong]').forEach(b => b.onclick = () => sheetDaXong(t, b.dataset.xong));
    document.querySelectorAll('[data-kiemtra]').forEach(b => b.onclick = () => sheetKiemTra(t, b.dataset.kiemtra));
    /* quá hạn: gọi cán bộ đã gắn, hoặc để lại yêu cầu liên hệ (B.9 khối 1) */
    document.querySelectorAll('[data-goi]').forEach(b => b.onclick = () => {
      const obx = trangThai(t);
      sheet('Gọi cán bộ ' + (obx.coCanBo ? obx.coCanBo.ten : ''),
        '<div class="card"><div class="bd"><div class="muted">Bản demo không gọi thật — thật ra cán bộ đã nhận việc «quá hạn» trong Sổ trực của mình từ khi việc trễ hẹn.</div></div></div>');
    });
    document.querySelectorAll('[data-yeucau]').forEach(b => b.onclick = () => {
      ghiViecQuaHan(t, b.dataset.yeucau);
      toast('Đã gửi yêu cầu — cán bộ địa bàn sẽ liên hệ, người thật trả lời trong 15 phút'); /* W0 P7: bỏ chữ «SLA» */
    });
    const vd = document.querySelector('#tr-viecDau');
    if (vd) bindViecDauTien(t);
  }

  function thanhThoiGian(t, k) {
    if (!k.hanDuKien || !k.batDauLuc) return '';
    const homNay = SM.CLOCK.today;
    const daCho = chenhNgay(k.batDauLuc, homNay);
    const con = chenhNgay(homNay, k.hanDuKien);
    const tong = Math.max(1, daCho + Math.max(0, con));
    const phanTram = Math.min(100, Math.round(daCho / tong * 100));
    return '<div class="row" style="align-items:center;gap:8px;margin-top:6px">' +
      '<div style="flex:1;height:6px;background:var(--line);border-radius:3px;overflow:hidden">' +
      '<div style="width:' + phanTram + '%;height:6px;background:' + (con < 0 ? 'var(--crit)' : 'var(--brand)') + '"></div></div>' +
      '<span class="muted" style="font-size:12px">' + (con < 0 ? 'đã chờ ' + (daCho) + ' ngày' : 'chờ ' + Math.max(0, daCho) + ' · còn ' + con + ' ngày') + '</span></div>';
  }

  function nutGoiCanBo(t, ma) {
    const ob = trangThai(t);
    ghiViecQuaHan(t, ma);
    if (ob.coCanBo) return '<button class="btn sm pri" data-goi="' + ma + '">Bấm để cán bộ ' + E(ob.coCanBo.ten) + ' gọi lại</button>';
    return '<button class="btn sm" data-yeucau="' + ma + '">Bấm để cán bộ gọi lại</button>';
  }
  /** Quá hạn → tạo việc trong Sổ trực b2g (B.9: «không có coCanBo» cũng phải thành việc). */
  function ghiViecQuaHan(t, ma) {
    const ob = trangThai(t);
    ob.viecGoiLai = ob.viecGoiLai || [];
    if (!ob.viecGoiLai.some(v => v.ma === ma && !v.xongLuc)) {
      ob.viecGoiLai.push({ ma, ngay: SM.CLOCK.today, xongLuc: null });
      ghiNhatKy(t, { viec: 'Quá hạn chờ ' + (THAM_SO_CONNECTOR[ma] ? THAM_SO_CONNECTOR[ma].ten : ma) + ' — cần cán bộ gọi lại hộ', lyDo: 'Trạm khối 1 (Sổ trực b2g #5)' });
      SM.save();
    }
  }

  function bangDoTuoi(t) {
    const cons = typeof D.connectors === 'function' ? D.connectors(t) : [];
    if (!cons.length) return '';
    /* cơ chế kỹ thuật → lời nói thường (W0 #11 + luật chung 9); bản gốc nằm trong nguồn màn hình */
    const CO_CHE_NOI = { webhook: 'tự chảy liền', polling: 'tự chảy theo giờ', 'thu-cong': 'cán bộ tự ghi' };
    let h = '<div class="card"><div class="hd"><h2>Dữ liệu tươi tới đâu</h2><span class="sub">đã công bố</span></div>' +
      '<div class="bd tight list">';
    const nguonGoc = [];
    cons.forEach(c => {
      const dt = c.doTuoi || null;
      const chet = c.trangThai === 'chet';
      const chuaDo = !(dt && dt.congBo) || dt.congBo.indexOf('chưa đo') === 0;
      if (chuaDo && dt && dt.congBo) nguonGoc.push(c.ten + ': ' + dt.congBo);
      h += '<div class="row" style="align-items:flex-start"><div style="flex:1;min-width:0">' +
        '<div style="font-weight:600;font-size:13.5px">' + E(c.ten) +
        (chet ? ' <span class="tag crit">đứt — kiểm tra</span>' : '') + '</div>' +
        '<div class="muted">' +
        (chuaDo
          ? '<span class="tag warn">Chưa đo được</span>'
          : 'Độ tươi: ' + E(boNhan(dt.congBo))) + /* cắt nhãn [Q-0xx] nếu bảng C.15 có gắn (W0 #13) */
        (dt && dt.coChe ? ' · ' + E(CO_CHE_NOI[dt.coChe] || dt.coChe) : '') +
        (c.lanDongBoCuoi ? ' · đồng bộ cuối ' + E(F.hm(c.lanDongBoCuoi)) + ' ' + E(F.dm(c.lanDongBoCuoi)) : '') +
        '</div></div>' +
        (chet ? '<button class="btn sm pri" data-kiemtra="' + E(c.id) + '">Kiểm tra</button>' : '') +
        '</div>';
    });
    h += '</div>';
    if (nguonGoc.length) h += '<div class="bd"><details><summary class="muted" style="font-size:12.5px;padding:4px 0">Nguồn màn hình — cho người chấm demo</summary>' +
      '<div class="muted" style="font-size:12.5px">' + nguonGoc.map(E).join('<br>') + '</div></details></div>';
    h += '</div>';
    return h;
  }

  /** D-#6: «Điều kiện nối · Chờ · Người bấm» — lấy thẳng bảng C.1, 100% connector đang nối. */
  function bangDieuKien(t) {
    const ds = DANH_SACH_ID.filter(ma => {
      const k = ketNoiCua(t, ma).trangThai;
      return k !== 'chua_hoi';
    });
    if (!ds.length) return '';
    let h = '<div class="card"><div class="hd"><h2>Điều kiện nối · Chờ · Người bấm</h2><span class="sub">mọi số có nhãn nguồn</span></div>' +
      '<div class="bd tight scrollx"><table class="t"><thead><tr><th>Việc</th><th>Cần gì trước</th><th>Chờ bao lâu</th><th>Ai bấm cuối</th></tr></thead><tbody>';
    ds.forEach(ma => {
      const ts = THAM_SO_CONNECTOR[ma];
      h += '<tr><td>' + E(ts.ten) + '</td><td>' + E(boNhan(ts.tienQuyen)) + '</td><td>' + E(boNhan(ts.leadTime)) + '</td><td>' + E(boNhan(ts.aiBam)) + '</td></tr>';
    });
    h += '</tbody></table></div></div>';
    return h;
  }

  function sheetDaXong(t, ma) {
    const ts = THAM_SO_CONNECTOR[ma];
    const cons = typeof D.connectors === 'function' ? D.connectors(t) : [];
    const c = cons.find(x => x.id === ma) || {};
    sheet(ts.ten + ' — đã nối',
      '<div class="card"><div class="bd tight list">' +
      '<div class="row"><div style="flex:1">Số liệu đã chảy về</div><b>' + ((c.donVe || 0)) + ' đơn/việc</b></div>' +
      (c.tuNgay ? '<div class="row"><div style="flex:1">Nối từ</div><b>' + E(F.dmy(c.tuNgay)) + '</b></div>' : '') +
      /* aiBam bản gốc có nhãn [Q-0xx] (vd chữ ký số) — cắt nhãn trước mặt hộ (W0 #13) */
      '<div class="row"><div style="flex:1">Người bấm cuối</div><b style="text-align:right">' + E(boNhan(ketNoiCua(t, ma).aiBam || ts.aiBam)) + '</b></div>' +
      '</div>' +
      '<div class="bd">' +
      '<button class="btn w" id="dx-xacnhan">Tôi là cán bộ — xác nhận đã nối (dùng khi không có tín hiệu ngoài)</button>' +
      '<button class="btn gh w" style="margin-top:8px" id="dx-ngat">Ngắt kết nối này</button>' +
      '</div></div>', w => {
        w.querySelector('#dx-xacnhan').onclick = () => sheetXacNhanTay(t, ma);
        w.querySelector('#dx-ngat').onclick = () => {
          const dm = danhMucCho(t);
          if (dm.batBuoc.some(m => m.ma === ma)) {
            toast('Việc này thuộc nhóm LUẬT — không tự ngắt được, gọi cán bộ');
            return;
          }
          const r = datKetNoi(t, ma, 'bo_qua', { lyDo: 'Ngắt tại Trạm — hộ chủ động' });
          closeSheet();
          toast(r && r.ok ? 'Đã ngắt ' + ts.ten : (r && r.lyDo) || 'Lỗi');
          veLai(t, viewTram, bindTram);
        };
      });
  }

  function sheetXacNhanTay(t, ma) {
    sheet('Cán bộ xác nhận tay — ' + THAM_SO_CONNECTOR[ma].ten,
      '<div class="card"><div class="bd">' +
      '<div class="muted">Dùng khi phía ngoài (ngân hàng, Zalo, sàn…) xác nhận qua điện thoại, không có tín hiệu tự động. Bắt buộc ghi mã cán bộ + lý do — dòng này hiện ở CẢ nhật ký của hộ VÀ Sổ trực của cán bộ.</div>' +
      '<input id="xn-ma" placeholder="Mã cán bộ (vd CB-02)" style="width:100%;font-size:16px;padding:9px;margin-top:8px">' +
      '<input id="xn-lydo" placeholder="Lý do bằng chữ (vd: gọi điện kiểm tra, phía ngoài xác nhận)" style="width:100%;font-size:15px;padding:9px;margin-top:8px">' +
      '<button class="btn pri w" style="margin-top:8px" id="xn-xong">Xác nhận đã nối</button>' +
      '</div></div>', w => {
        w.querySelector('#xn-xong').onclick = () => {
          const r = xacNhanTayCanBo(t, ma, w.querySelector('#xn-ma').value, w.querySelector('#xn-lydo').value);
          if (r && r.ok) { closeSheet(); toast('Đã xác nhận — ghi nhật ký + Sổ trực của cán bộ'); veLai(t, viewTram, bindTram); }
          else toast((r && r.lyDo) || 'Lỗi');
        };
      });
  }

  /** D-#5: nút «Kiểm tra» cho connector đứt — chạy thử lại, 2 ngã (sống lại / cần cán bộ SLA 15 phút). */
  function sheetKiemTra(t, ma) {
    const ts = THAM_SO_CONNECTOR[ma];
    sheet('Kiểm tra đường nối — ' + ts.ten,
      '<div class="card"><div class="bd">' +
      '<div class="muted">Đường tin tự động hết đến — chạy thử lại bằng đường kiểm tra đối soát mỗi ngày.</div>' + /* poll ≥24h [Q-003] */
      '<button class="btn pri w" style="margin-top:10px" id="kt-song">Chạy kiểm tra (mô phỏng: đường đã sống lại)</button>' +
      '<button class="btn w" style="margin-top:8px" id="kt-chet">Vẫn không phản hồi — gọi cán bộ</button>' +
      '</div></div>', w => {
        w.querySelector('#kt-song').onclick = () => {
          const r = datKetNoi(t, ma, 'da_ket_noi', { aiBam: 'Hệ thống tự kiểm tra',
            lyDo: 'Poll đối soát 24h phát hiện có dữ liệu mới — đường đã sống lại [Q-003]' });
          closeSheet();
          toast(r && r.ok ? 'Đã sống lại — đơn mới đang về lại' : (r && r.lyDo) || 'Lỗi');
          veLai(t, viewTram, bindTram);
        };
        w.querySelector('#kt-chet').onclick = () => {
          ghiViecQuaHan(t, ma);
          closeSheet();
          toast('Đã gửi việc cho cán bộ — người thật trả lời trong 15 phút'); /* W0 P7: bỏ chữ «SLA» */
        };
      });
  }

  /* ═══════════ §9. OB-6 «VIỆC ĐẦU TIỀN» (B.10 — đích đo R-A2-07) ═══════════ */

  function viecDauTienChon(t) {
    const ob = trangThai(t);
    const trenTy = vuotNguongThat(t).ok; /* W0 câu 4(d): chỉ số thật hoặc lời khẳng định */
    const hddtOk = ketNoiCua(t, 'hddt').trangThai === 'da_ket_noi';
    const khB2B = (ob.traLoi.kenh || []).indexOf('b2b') >= 0;
    /* chân dung B.10: CD1 đặc sản bán cho khách sạn; CD2 du lịch có phòng/tour (t.resources); CD3 nông sản */
    if (trenTy && hddtOk && khB2B)
      return { loai: 'xuat-hoa-don',
        ten: 'Xuất hoá đơn điện tử cho đoàn khách doanh nghiệp đang lưu trú',
        moTa: 'Sau khi hoá đơn điện tử đã nối — hoá đơn có mã cơ quan thuế (màn phát hành sẵn có), công nợ khách doanh nghiệp tự gắn theo hoá đơn ở tab Đơn.',
        ghiNhan: 'Trước đây ' + (t.keCan ? t.keCan.ten : 'người nhà') + ' chụp giấy gửi kế toán giờ hành chính — giờ hoá đơn ra ngay tại quầy.', di: 'hoadondc' };
    if ((t.resources || []).length > 0)
      return { loai: 'tra-loi-dat-phong',
        ten: 'Nhận tin đặt phòng mới nhất bằng máy trả lời sẵn',
        moTa: 'Zalo OA đã nối — tin nhắn đặt phòng đã có trong hộp hội thoại, app soạn mẫu trả lời (xác nhận phòng + giá mùa); cô chú chỉ bấm gửi.',
        ghiNhan: 'Tiền cọc qua QR tự thành dòng Tiền — không ghi sổ tay.', di: 'hoithoai' };
    return { loai: 'chot-ban-bang-ke',
      ten: 'Chốt lượt bán đầu tiên + chép bảng kê thu mua trong ngày',
      moTa: 'Bán hôm nay lấy bằng HÀM TÍNH từ kho (tổng thu QR + tiền mặt), kèm 1 dòng bảng kê thu mua của người bán trong màn bảng kê.',
      ghiNhan: 'Một ngày bán được bao nhiêu, thu mua của ai — app tự gộp, khỏi tính tay.', di: 'ban' };
  }

  function theViecDauTien(t) {
    const ob = trangThai(t);
    const v = viecDauTienChon(t);
    if (ob.buoc === 'xong_viec_dau') {
      const phut = soPhutViecDau(t);
      return '<div class="card"><div class="hd"><h2>Việc đầu tiên — XONG</h2><span class="tag ok">đã xong</span></div>' +
        '<div class="bd"><div class="big num" style="font-size:22px">' + phut + ' phút</div>' +
        '<div class="muted">Từ lúc mở app tới việc đầu tiên hoàn tất (' + E(v.ten) + ') — hai mốc lấy từ kho, không viết cứng.</div></div></div>';
    }
    return '<div class="card" id="tr-viecDau"><div class="hd"><h2>Việc đầu tiên của nhà mình</h2><span class="sub">một việc thôi — làm quen tay</span></div>' +
      '<div class="bd"><div style="font-size:16px;font-weight:700">' + E(v.ten) + '</div>' +
      '<div class="muted" style="margin-top:6px">' + E(v.moTa) + '</div>' +
      '<div class="row" style="gap:8px;margin-top:12px">' +
      '<button class="btn pri" style="flex:1" data-di="' + E(v.di) + '">Làm việc này</button>' +
      '<button class="btn" style="flex:1" id="vd-xong">Tôi làm xong rồi</button></div>' +
      '<div class="muted" style="margin-top:8px">' + E(v.ghiNhan) + '</div>' +
      '</div></div>';
  }
  function bindViecDauTien(t) {
    const x = document.querySelector('#vd-xong');
    if (!x) return;
    x.onclick = () => {
      const ob = trangThai(t);
      const v = viecDauTienChon(t);
      ob.viecDauTien = { loai: v.loai,
        batDauLuc: ob.viecDauTien.batDauLuc || ob.batDauLuc || new Date().toISOString(),
        doneLuc: new Date().toISOString() };
      chuyenBuoc(t, 'xong_viec_dau', 'Việc đầu tiên xong: ' + v.ten);
      ghiNhatKy(t, { viec: 'Việc đầu tiên hoàn tất — ' + v.ten });
      SM.save();
      toast('Tuyệt — từ lúc mở app tới giờ: ' + soPhutViecDau(t) + ' phút');
      veLai(t, viewTram, bindTram);
    };
  }
  function soPhutViecDau(t) {
    const vd = trangThai(t).viecDauTien;
    if (!vd || !vd.doneLuc || !vd.batDauLuc) return '—';
    return Math.max(1, Math.round((new Date(vd.doneLuc) - new Date(vd.batDauLuc)) / 60000));
  }

  /* ═══════════ §10. «TẠM DỪNG DÙNG OPC» (B.15 / P13 — 4 bước) ═══════════ */

  function viewTamDung(t) {
    const daNoi = DANH_SACH_ID.filter(ma => ketNoiCua(t, ma).trangThai === 'da_ket_noi');
    let h = '<div class="note br">Vào dễ thì ra cũng phải dễ. Màn này giúp cô chú lấy hết dữ liệu, ngắt từng kết nối, rồi xoá sạch trên máy — OPC không giữ lại gì.</div>';
    /* bước 1 — xuất dữ liệu */
    h += '<div class="card"><div class="hd"><h2>1. Lấy hết dữ liệu về máy</h2></div><div class="bd">' +
      '<div class="muted">JSON đầy đủ + CSV từng bảng — đủ chuyển sang nhà cung cấp khác (không khóa dữ liệu).</div>' +
      '<div class="row" style="gap:8px;margin-top:10px">' +
      '<button class="btn pri" style="flex:1" id="td-json">Tải file JSON</button>' +
      '<button class="btn" style="flex:1" id="td-csv">Tải các file CSV</button></div>' +
      '</div></div>';
    /* bước 2 — ngắt kết nối */
    h += '<div class="card"><div class="hd"><h2>2. Ngắt kết nối từng dịch vụ</h2><span class="sub">' + daNoi.length + ' đang nối</span></div><div class="bd">';
    if (!daNoi.length) h += '<div class="muted">Chưa có kết nối nào đang bật — sang bước 3 được luôn.</div>';
    else {
      h += '<div class="tight list">' + daNoi.map(ma =>
        '<div class="row"><div style="flex:1">' + E(THAM_SO_CONNECTOR[ma].ten) + '</div>' +
        '<button class="btn sm" data-thuhoi="' + ma + '">Thu hồi quyền trong OPC</button></div>').join('') + '</div>' +
        '<div class="muted" style="margin-top:8px">Với bên ngoài (ngân hàng, sàn, Zalo): mở trang quản lý tài khoản của họ và bấm ngắt ở đó — link nằm trong trang của họ.</div>';
    }
    h += '</div></div>';
    /* bước 3 — xoá kho máy */
    h += '<div class="card"><div class="hd"><h2>3. Xoá dữ liệu trên máy này</h2></div><div class="bd">' +
      '<div class="muted">Xoá toàn bộ dữ liệu của hộ nằm trong máy này. Cần xác nhận 2 lần — lần sau cùng bấm và GIỮ nút 5 giây.</div>' +
      '<button class="btn w" style="margin-top:10px" id="td-xoa">' + E(t.chuHo) + ' bấm: Xoá dữ liệu trên máy này</button>' +
      '</div></div>';
    /* bước 4 — dòng cuối */
    h += '<div class="note warn">Dữ liệu trên máy này đã xoá. Các quyền đã cấp cần cô chú tự bấm ngắt ở trang của họ — OPC không thể ngắt thay.</div>';
    return h;
  }

  function bindTamDung(t) {
    const j = document.querySelector('#td-json');
    if (j) j.onclick = () => {
      const duLieu = SM.exportTenant(t.id);
      if (!duLieu) { toast('Không xuất được — thiếu dữ liệu hộ'); return; }
      taiFile('solomatrix-du-lieu-' + t.id + '.json', JSON.stringify(duLieu, null, 2), 'application/json');
      toast('Đã tải file JSON — giữ file này để chuyển nhà cung cấp khác');
    };
    const c = document.querySelector('#td-csv');
    if (c) c.onclick = () => {
      const bang = SM.exportCsvTables(t.id);
      const so = Object.keys(bang).length;
      if (!so) { toast('Không có bảng nào để xuất'); return; }
      Object.keys(bang).forEach((ten, i) => setTimeout(() => taiFile(ten, bang[ten], 'text/csv'), i * 350));
      toast('Đang tải ' + so + ' file CSV');
    };
    document.querySelectorAll('[data-thuhoi]').forEach(b => b.onclick = () => {
      const r = datKetNoi(t, b.dataset.thuhoi, 'bo_qua', { lyDo: 'Tạm dừng dùng OPC — thu hồi quyền' });
      toast(r && r.ok ? 'Đã thu hồi quyền trong OPC cho mục này' : (r && r.lyDo) || 'Lỗi');
      veLai(t, viewTamDung, bindTamDung);
    });
    const x = document.querySelector('#td-xoa');
    if (x) x.onclick = () => xacNhanXoa1(t);
  }

  function taiFile(ten, noiDung, kieu) {
    try {
      const bl = new Blob([noiDung], { type: kieu + ';charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(bl); a.download = ten;
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    } catch (e) { toast('Trình duyệt chặn tải file — copy thủ công từ bảng'); }
  }

  function xacNhanXoa1(t) {
    sheet('Xoá dữ liệu — lần xác nhận 1/2',
      '<div class="card"><div class="bd">' +
      '<div style="font-size:15px">Điều này xoá <b>toàn bộ dữ liệu hộ trên máy này</b>: bán, tiền, hoá đơn, bảng kê. Đã tải file ở bước 1 chưa?</div>' +
      '<button class="btn w" style="margin-top:10px" id="xx-chua">Chưa — để tôi tải trước</button>' +
      '<button class="btn dan w" style="margin-top:8px" id="xx-tiep">Rồi — tiếp tục xoá</button>' +
      '</div></div>', w => {
        w.querySelector('#xx-chua').onclick = () => { closeSheet(); toast('Bước 1 có 2 nút tải — tải xong quay lại đây'); };
        w.querySelector('#xx-tiep').onclick = () => { closeSheet(); xacNhanXoa2(t); };
      });
  }
  function xacNhanXoa2(t) {
    sheet('Xoá dữ liệu — lần xác nhận 2/2',
      '<div class="card"><div class="bd">' +
      '<div style="font-size:15px">Giữ chặt nút dưới <b>đủ 5 giây</b> để chắc chắn là cô chú chủ hộ, không phải bấm nhầm. Thả sớm thì không xoá gì cả.</div>' +
      '<button class="btn dan w" style="margin-top:10px;font-size:17px" id="xx-giu">' + E(t.chuHo) + ' bấm và GIỮ 5 GIÂY — xoá vĩnh viễn</button>' +
      '<div style="height:10px;background:var(--line);border-radius:5px;margin-top:10px;overflow:hidden">' +
      '<div id="xx-thanh" style="width:0%;height:10px;background:var(--crit);transition:none"></div></div>' +
      '<div class="muted" style="margin-top:6px" id="xx-dem">Chưa giữ — giữ liên tục mới chạy</div>' +
      '</div></div>', w => {
        const nut = w.querySelector('#xx-giu'), thanh = w.querySelector('#xx-thanh'), dem = w.querySelector('#xx-dem');
        const GIAY = 5; let t0 = null, roi = null, xongRoi = false;
        const ve = pct => { thanh.style.width = pct + '%'; };
        const dung = () => {
          if (roi) { clearInterval(roi); roi = null; }
          if (!xongRoi) { ve(0); dem.textContent = 'Thả sớm — chưa xoá gì cả'; t0 = null; }
        };
        const chayXoa = () => {
          if (xongRoi) return;
          xongRoi = true;
          try { if (SM.inbox) SM.inbox.clear(t.id); } catch (e) { /* hộp thư có thể chưa nạp */ }
          localStorage.removeItem(SM.NS + 'inbox'); /* resetAll không xoá inbox — tự xoá cho sạch máy (P13) */
          SM.resetAll();
          closeSheet();
          /* mobile.html không nghe 'db:reseed' — màn hình sẽ đứng nguyên số cũ dù kho đã trắng.
             Đánh thức bằng ui:change để hộ THẤY máy trắng thật, đúng lời hứa của màn này. — W8 */
          if (typeof SM.setUi === 'function') { try { SM.setUi({}); } catch (e) { /* kho ui hỏng thì thôi */ } }
          toast('Đã xoá. Mở lại app = trắng như lần đầu cài.');
        };
        nut.addEventListener('pointerdown', e => {
          e.preventDefault();
          if (xongRoi) return;
          t0 = Date.now(); dem.textContent = 'Đang giữ…';
          roi = setInterval(() => {
            const s = (Date.now() - t0) / 1000;
            ve(Math.min(100, s / GIAY * 100));
            dem.textContent = 'Đang giữ… ' + Math.min(GIAY, Math.floor(s)) + '/' + GIAY + ' giây';
            if (s >= GIAY) { clearInterval(roi); roi = null; chayXoa(); }
          }, 100);
        });
        nut.addEventListener('pointerup', dung);
        nut.addEventListener('pointerleave', dung);
        nut.addEventListener('pointercancel', dung);
      });
  }

  /* ═══════════ §11. XUẤT ═══════════ */

  global.SM.onb = {
    /* hợp đồng INTERFACE mục 3 */
    trangThai, traLoi, danhMucCho, tienDo, congNgayLamViec, duocDayTin, cuaSoTin, xacNhanTayCanBo,
    viewObKichHoat, bindObKichHoat, viewObNhanDien, bindObNhanDien,
    viewObDanhMuc, bindObDanhMuc, viewObCon, bindObCon,
    viewTram, bindTram, viewTamDung, bindTamDung,
    /* tiện thêm cho W6/W7 gọi */
    THAM_SO_CONNECTOR, DANH_SACH_ID, THU_TU,
    lamLai, moLai, boQuaTam, datConMa, docConMa, chenhNgay, ketNoiCua,
    datToiThieu, viecDauTienChon, rutGon, veLai, toast, sheet,
  };
})(window);
/* Alias ON — các module sau nạp dùng tên ngắn (kiểu D/P/O đã có của repo). */
window.ON = window.SM && window.SM.onb ? window.SM.onb : null;
