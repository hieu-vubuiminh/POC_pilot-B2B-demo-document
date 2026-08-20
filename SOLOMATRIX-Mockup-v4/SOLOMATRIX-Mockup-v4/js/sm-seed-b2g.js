/**
 * sm-seed-b2g.js — 48 HỘ MÔ PHỎNG cho Sổ trực onboarding của b2g [CHOT P2 · PLAN B.11].
 *
 * Chỉ b2g đọc qua SM.seedB2G() — phía hộ KHÔNG thấy các hộ này.
 * KHÔNG tên người thật: hộ chỉ có mã suất, «Hộ số N — ngành», cán bộ CB-01…CB-06.
 * Sinh bằng LCG XÁC ĐỊNH mượn pattern của sm-seed-gialai.js — không Math.random:
 * chạy lại bao nhiêu lần cũng ra đúng 48 hộ y hệt; cache localStorage sinh 1 lần.
 *
 * Ranh giới IV.8 giữ nguyên: mỗi hộ chỉ có TRẠNG THÁI + NGÀY, không doanh thu chi tiết.
 */
(function (global) {
  'use strict';

  const N = 48;                 // [CHOT P2] — 48 hộ mô phỏng cho b2g
  const KEY = 'smv3:b2g-hos';   // cache: sinh 1 lần, đọc lại ổn định
  const AB = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bỏ I, O, 0, 1 — dễ đọc nhầm khi gõ tay

  /* bộ sinh xác định — giống hệt sm-seed-gialai.js */
  function rng(seed) {
    let s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

  /* 7 mức máy trạng thái tiến trình onboarding (PLAN B.1) */
  const BUOC = ['chua_kich_hoat', 'kich_hoat', 'da_tra_loi', 'da_sinh_danh_muc',
                'dang_noi', 'du_toi_thieu', 'xong_viec_dau'];
  const NGANH = [
    { ma: 'dac-san',  ten: 'Đặc sản' },
    { ma: 'du-lich',  ten: 'Du lịch' },
    { ma: 'nong-san', ten: 'Nông sản' },
  ];
  const CAN_BO = ['CB-01', 'CB-02', 'CB-03', 'CB-04', 'CB-05', 'CB-06'];

  /* đợt nộp hồ sơ Zalo OA theo tuần [Q-004 — hộ nộp cùng lúc nên nhóm theo đợt];
     nopTu = ngày nộp đại diện giữa tuần, làm mốc tính hạn duyệt */
  const DOT_OA = [
    { ten: 'Tuần nộp 1 (10/08–16/08)', nopTu: '2026-08-12' },
    { ten: 'Tuần nộp 2 (17/08–23/08)', nopTu: '2026-08-19' },
    { ten: 'Tuần nộp 3 (24/08–30/08)', nopTu: '2026-08-26' },
    { ten: 'Tuần nộp 4 (31/08–06/09)', nopTu: '2026-09-02' },
  ];

  /* cộng n NGÀY LÀM VIỆC (bỏ T7/CN) — cùng nghĩa ON.congNgayLamViec của sm-onboard.js */
  function congNgayLamViec(iso, n) {
    const d = new Date(iso + 'T00:00:00Z');
    let them = n;
    while (them > 0) {
      d.setUTCDate(d.getUTCDate() + 1);
      const w = d.getUTCDay();            // 0 = chủ nhật, 6 = thứ bảy
      if (w !== 0 && w !== 6) them -= 1;
    }
    return d.toISOString().slice(0, 10);
  }

  function sinhHo() {
    const r = rng(482048);        // hạt giống cố định — đổi số này là đổi cả bảng
    const rand = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

    /* vòng 1 — xương mỗi hộ; kèm bảo hiểm cho 7 mức B.1 đều có mặt */
    const xuong = [];
    for (let i = 1; i <= N; i++) {
      xuong.push({
        so: i,
        buoc: pick(r, BUOC),
        nganh: pick(r, NGANH),
        canBo: pick(r, CAN_BO),
        dotOA: pick(r, DOT_OA),
        cungCanBo: r() < 0.4,   // hộ làm cùng cán bộ ngay từ đầu — để b2g vẽ định mức 2 nhóm
        vuotNguong: r() < 0.15, // hộ >1 tỷ — thức dòng «Hạn 30 ngày» của Sổ trực [Q-001]
      });
    }
    BUOC.forEach((b, i) => { if (!xuong.some(h => h.buoc === b)) xuong[i].buoc = b; });

    /* vòng 2 — đắp đếm kết nối + hạn + phút, suy từ buoc để không tự mâu thuẫn */
    const maDaDung = {};
    return xuong.map(x => {
      const kt = { chua_hoi: 0, chua_co_tk: 0, dang_dang_ky: 0, cho_duyet: 0, da_ket_noi: 0, loi: 0, bo_qua: 0 };
      if (x.buoc === 'da_sinh_danh_muc') {
        kt.chua_hoi = rand(4, 8);                                 // danh mục vừa sinh, chưa mở luồng nào
      }
      if (x.buoc === 'dang_noi') {
        kt.da_ket_noi = rand(1, 3); kt.cho_duyet = rand(0, 2);
        kt.dang_dang_ky = rand(0, 1); kt.chua_hoi = rand(2, 6);
        kt.loi = r() < 0.1 ? 1 : 0;
      }
      if (x.buoc === 'du_toi_thieu') {
        kt.da_ket_noi = rand(2, 4); kt.cho_duyet = rand(0, 1); kt.chua_hoi = rand(0, 3);
      }
      if (x.buoc === 'xong_viec_dau') {
        kt.da_ket_noi = rand(2, 5); kt.chua_hoi = rand(0, 2);
        kt.bo_qua = r() < 0.3 ? 1 : 0;
      }

      // hạn duyệt: 2–3 ngày làm việc kể từ giữa đợt nộp [Q-004]
      const hanDuKien = kt.cho_duyet > 0 ? congNgayLamViec(x.dotOA.nopTu, 2 + Math.floor(r() * 2)) : null;

      // phút tới việc đầu (đích đo R-A2-07) — chỉ hộ đã xong việc đầu có số;
      // hộ làm cùng cán bộ thì nhanh hơn (5–15’) so với tự làm (16–40’)
      const phut = x.buoc === 'xong_viec_dau' ? (x.cungCanBo ? rand(5, 15) : rand(16, 40)) : null;

      // mã suất GL26-XXXX-XXXX [P3] — sinh lại tới khi không trùng trong bảng
      let ma;
      do {
        ma = 'GL26';
        for (let g = 0; g < 2; g++) {
          let nhom = '';
          for (let k = 0; k < 4; k++) nhom += AB[Math.floor(r() * AB.length)];
          ma += '-' + nhom;
        }
      } while (maDaDung[ma]);
      maDaDung[ma] = 1;

      return {
        ma, ten: 'Hộ số ' + x.so + ' — ' + x.nganh.ten, nganh: x.nganh.ma,
        buoc: x.buoc, ketNoiTom: kt, canBo: x.canBo, dotOA: x.dotOA.ten,
        hanDuKien, cungCanBo: x.cungCanBo, vuotNguong: x.vuotNguong, phutTuKichHoat: phut,
      };
    });
  }

  function seedB2G() {
    try {
      const s = localStorage.getItem(KEY);
      if (s) { const hos = JSON.parse(s); if (hos && hos.length === N) return hos; }
    } catch (e) { /* kho hỏng — sinh lại bên dưới */ }
    const hos = sinhHo();
    try { localStorage.setItem(KEY, JSON.stringify(hos)); } catch (e) { /* không ghi được cache vẫn dùng được */ }
    return hos;
  }

  global.SM_SEED_B2G = { soHo: N, sinhHo };        // dự phòng khi nạp trước sm-core.js
  (global.SM = global.SM || {}).seedB2G = seedB2G; // SM.seedB2G() — nạp SAU sm-core.js
})(window);
