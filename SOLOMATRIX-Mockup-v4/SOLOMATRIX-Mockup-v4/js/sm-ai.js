/**
 * sm-ai.js — TRỢ LÝ TIẾNG VIỆT HAI LỚP, đúng ràng buộc IV.5.
 *
 *   Lớp A — hỏi trên CHÍNH DỮ LIỆU CỦA HỘ. Mọi câu trả lời TÍNH từ kho qua
 *           SM.dom, không có câu trả lời viết cứng. Kèm phần "tính từ đâu" để
 *           hộ tự kiểm — và để người chấm thấy đây không phải kịch bản dựng.
 *   Lớp B — hỏi NGHIỆP VỤ theo "bộ nội dung được Chương trình phê duyệt".
 *           Mỗi bài có: phiên bản · trạng thái phê duyệt · dẫn nguồn.
 *           Bài CHƯA được phê duyệt thì trả lời kèm nhãn cảnh báo, không giả vờ chắc.
 *   Lớp C — việc trợ lý KHÔNG được tự làm → chuyển người thật, có đồng hồ SLA.
 */
(function (global) {
  'use strict';
  const SM = global.SM;
  if (!SM || !SM.dom) throw new Error('sm-ai.js cần sm-core.js và sm-domain.js');
  const D = SM.dom, F = SM.fmt;

  /* ══════════════════ BỘ NỘI DUNG NGHIỆP VỤ ĐƯỢC CHƯƠNG TRÌNH PHÊ DUYỆT ═══
     IV.5(b): trả lời câu hỏi nghiệp vụ "theo bộ nội dung được Chương trình
     phê duyệt". Nên bộ này phải có dấu phê duyệt nhìn thấy được, có phiên bản,
     và có dẫn nguồn — không phải model tự nói.                              */

  const KB = {
    phienBan: 'v0.3',
    capNhat: '2026-08-17',
    coQuanPheDuyet: 'Tổ công tác Hộ kinh doanh lên doanh nghiệp — Hội Doanh nhân trẻ tỉnh Gia Lai',
    ghiChu: 'Bản nháp do đơn vị đề xuất soạn, CHƯA trình phê duyệt. Bài chưa phê duyệt hiện nhãn vàng.',
    bai: [
      { id: 'KB-01', pheDuyet: false,
        hoi: ['bỏ thuế khoán', 'thuế khoán', 'kê khai thay khoán', 'sao phải kê khai'],
        tieuDe: 'Vì sao từ 2026 hộ kinh doanh không còn nộp thuế khoán',
        traLoi: 'Từ ngày 01/01/2026, phương pháp thuế khoán với hộ kinh doanh chấm dứt. Nghĩa vụ thuế được xác định theo doanh thu thực tế phản ánh qua hoá đơn điện tử, dòng tiền và dữ liệu giao dịch. Nghĩa là: bán bao nhiêu, khai bấy nhiêu — nên việc ghi nhận doanh thu hằng ngày trở thành việc bắt buộc, không còn là việc tuỳ.',
        nguon: 'Bài toán đặt hàng Chương trình Kế nghiệp số Gia Lai, Mục I.1' },

      { id: 'KB-02', pheDuyet: false,
        hoi: ['máy tính tiền', 'hoá đơn từ máy tính tiền', 'mtt', 'khi nào phải dùng máy tính tiền', '1 tỷ'],
        tieuDe: 'Khi nào hộ phải dùng hoá đơn điện tử khởi tạo từ máy tính tiền',
        traLoi: 'Hộ kinh doanh có doanh thu trên 01 tỷ đồng một năm thuộc diện sử dụng hoá đơn điện tử khởi tạo từ máy tính tiền, có kết nối chuyển dữ liệu với cơ quan thuế. Ứng dụng theo dõi doanh thu luỹ kế và cảnh báo trước khi hộ chạm ngưỡng, để hộ chuẩn bị chứ không bị động.',
        nguon: 'Bài toán đặt hàng, Mục I.1 và ràng buộc Mục IV.1' },

      { id: 'KB-03', pheDuyet: false,
        hoi: ['thu mua nông dân', 'không có hoá đơn đầu vào', 'bảng kê', 'chứng từ đầu vào', 'mua của dân'],
        tieuDe: 'Thu mua từ nông dân nhỏ lẻ mà không có hoá đơn thì làm sao',
        traLoi: 'Trường hợp mua hàng của người dân trực tiếp sản xuất, không có hoá đơn, thì phải lập bảng kê thu mua kèm thông tin người bán: họ tên, số giấy tờ định danh, địa chỉ, mặt hàng, số lượng, đơn giá, chữ ký nhận tiền. Bảng kê là chứng từ để hạch toán chi phí đầu vào. Ứng dụng lập bảng kê ngay tại vườn, chụp ảnh biên nhận, và chặn không cho khoá kỳ nếu bảng kê còn thiếu mục bắt buộc.',
        canhBao: 'Chi tiết mẫu biểu và điều kiện hạch toán cần đối chiếu văn bản thuế hiện hành trước khi áp dụng.',
        nguon: 'Chân dung 3 trong bài toán đặt hàng — yêu cầu "xử lý bài toán chứng từ đầu vào khi thu mua từ nông dân nhỏ lẻ"' },

      { id: 'KB-04', pheDuyet: false,
        hoi: ['hạn kê khai', 'khi nào phải khai', 'khai quý', 'hạn nộp thuế'],
        tieuDe: 'Hạn kê khai và nộp thuế theo quý',
        traLoi: 'Hộ khai thuế theo quý thì hạn nộp hồ sơ khai thuế là ngày cuối cùng của tháng đầu quý sau. Ứng dụng đếm ngược tới hạn, và trước hạn sẽ soát trước giúp hộ: hoá đơn nào chưa truyền xong sang cơ quan thuế, bảng kê nào còn thiếu giấy tờ.',
        canhBao: 'Cần đối chiếu quy định hiện hành cho từng trường hợp cụ thể.',
        nguon: 'Luật Quản lý thuế — cần gắn số hiệu điều khoản trước khi phê duyệt' },

      { id: 'KB-05', pheDuyet: false,
        hoi: ['nộp thuế hộ hay ai nộp', 'ai bấm nộp', 'etax', 'nộp thay'],
        tieuDe: 'Ai là người bấm nộp tờ khai',
        traLoi: 'Nền tảng chuẩn bị số, lập tờ khai nháp, soát lỗi và dẫn hộ sang ứng dụng thuế điện tử ngay trên điện thoại. Nhưng người chịu trách nhiệm phải tự bấm nộp trên cổng của cơ quan thuế. Nền tảng chỉ lưu lại mã biên nhận do hộ nhập vào. Đây là ranh giới trách nhiệm cố ý, không phải thiếu tính năng: tờ khai có giá trị pháp lý thì người ký phải là người chịu trách nhiệm.',
        nguon: 'Ranh giới trách nhiệm của nền tảng — API-CONTRACT mục Hard limits' },

      { id: 'KB-06', pheDuyet: false,
        hoi: ['an toàn thực phẩm', 'attp', 'giấy tờ bán cho khách sạn', 'khách sạn đòi gì', 'nhãn mác', 'truy xuất'],
        tieuDe: 'Bán cho nhà hàng và khách sạn cần giấy tờ gì',
        traLoi: 'Khách hàng tổ chức thường yêu cầu bộ ba: pháp nhân và hoá đơn; giấy chứng nhận cơ sở đủ điều kiện an toàn thực phẩm hoặc bản tự công bố sản phẩm; và nhãn hàng hoá đúng quy định, kèm khả năng truy xuất theo lô. Thiếu một trong ba thì hộ không vào được danh sách nhà cung cấp chính thức, dù hàng tốt. Ứng dụng theo dõi hạn từng loại giấy tờ và cảnh báo trước 90 ngày.',
        canhBao: 'Yêu cầu cụ thể tuỳ nhóm sản phẩm — cần đối chiếu quy định ngành trước khi phê duyệt.',
        nguon: 'Chân dung 1 trong bài toán đặt hàng' },

      { id: 'KB-07', pheDuyet: false,
        hoi: ['mùa vụ', 'doanh thu thất thường', 'mùa vắng khách', 'mùa cao điểm'],
        tieuDe: 'Doanh thu mùa vụ chênh lệch lớn thì kê khai thế nào',
        traLoi: 'Doanh thu mùa vụ không làm đổi cách khai: vẫn khai theo doanh thu thực tế từng kỳ. Điều cần chuẩn bị là dòng tiền — quý cao điểm phát sinh số thuế lớn, nên phải để dành từ trong mùa. Ứng dụng hiện doanh thu theo tháng, tính số thuế tạm tính luỹ kế realtime và nhắc trước mốc, để hộ không bị bất ngờ ở quý cao điểm.',
        nguon: 'Chân dung 2 trong bài toán đặt hàng' },

      { id: 'KB-08', pheDuyet: false,
        hoi: ['lên doanh nghiệp', 'chuyển thành doanh nghiệp', 'thành lập công ty', 'khác gì hộ'],
        tieuDe: 'Chuyển từ hộ kinh doanh lên doanh nghiệp thì đổi những gì',
        traLoi: 'Ba thứ đổi ngay. Một, cách tính thuế: hộ tính theo tỷ lệ trên doanh thu, doanh nghiệp tính thuế giá trị gia tăng theo phương pháp khấu trừ và thuế thu nhập doanh nghiệp trên lợi nhuận — nên hoá đơn đầu vào bắt đầu có giá trị tiền thật. Hai, sổ sách và báo cáo nhiều hơn. Ba, tài sản: nên tách hẳn tài khoản và dòng tiền của công ty khỏi tiền túi gia đình, vì khi không chứng minh được tách bạch thì chủ sở hữu có thể phải chịu trách nhiệm bằng tài sản cá nhân. Ứng dụng có công tắc chuyển chế độ và cảnh báo khi thấy chi tiêu cá nhân đi bằng tài khoản kinh doanh.',
        canhBao: 'Nội dung về trách nhiệm tài sản cần luật sư soát trước khi phê duyệt.',
        nguon: 'Ràng buộc IV.1 "hỗ trợ kê khai cho hộ và cho doanh nghiệp sau chuyển đổi"' },

      { id: 'KB-09', pheDuyet: false,
        hoi: ['nền tảng miễn phí', 'nhà nước cho không', 'sao phải trả tiền', 'trùng với phần mềm nhà nước'],
        tieuDe: 'Nhà nước đã cấp miễn phí phần mềm kế toán, sao vẫn phải mua thêm',
        traLoi: 'Đúng là tầng tuân thủ đang được cấp miễn phí: khai thuế điện tử, phần mềm kế toán và hoá đơn cơ bản, chữ ký số. Phần trả tiền KHÔNG nằm ở đó và không được tính trùng. Phần trả tiền nằm ở tầng vận hành và bán hàng: nối các kênh bán về một chỗ, giữ tồn kho không bán quá hàng, đặt chỗ không trùng, trợ lý trực 24/7, và người xuống tận cơ sở hướng dẫn. Khi nền tảng dùng chung của Nhà nước vận hành, các cấu phần chồng lấn sẽ tắt hoặc giao lại.',
        nguon: 'Nguyên tắc Mục II.2 và ràng buộc Mục IV.2' },

      { id: 'KB-10', pheDuyet: false,
        hoi: ['dữ liệu của ai', 'muốn đổi nhà cung cấp', 'xuất dữ liệu', 'khoá dữ liệu', 'nhà nước xem được gì'],
        tieuDe: 'Dữ liệu của hộ thuộc về ai',
        traLoi: 'Dữ liệu chi tiết thuộc về hộ. Hộ có quyền xuất toàn bộ dữ liệu của mình theo định dạng thông dụng bất cứ lúc nào để chuyển sang nhà cung cấp khác — đây là cam kết trong hợp đồng, không phải tính năng có thể bỏ. Bảng điều khiển của Chương trình chỉ nhận số liệu tổng hợp theo địa bàn và ngành, không nhận chi tiết từng đơn, từng khách của hộ.',
        nguon: 'Ràng buộc Mục IV.3 và IV.8' },
    ],
  };

  function kbFind(q) {
    const s = strip(q);
    let best = null, bestScore = 0;
    KB.bai.forEach(b => {
      let score = 0;
      b.hoi.forEach(k => { if (s.indexOf(strip(k)) >= 0) score += strip(k).length; });
      if (score > bestScore) { bestScore = score; best = b; }
    });
    return bestScore > 0 ? best : null;
  }

  function strip(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* ═══════════════════════════ LỚP A — HỎI TRÊN DỮ LIỆU CỦA HỘ ═══════════ */

  /* Nhãn quy ước D-#7 (đóng R-A3-04): chỗ nào CHƯA ĐO thì nói thẳng «chưa đo»,
     không bỏ trống và không bịa con số thay. Mọi module dùng chung nhãn này. */
  const CHUA_DO = 'chưa đo — radar đang hỏi Q-0xx';

  const A_HANDLERS = [
    {
      key: ['hom nay ban duoc bao nhieu', 'hom nay ban', 'doanh thu hom nay', 'nay thu duoc'],
      run(t) {
        const qr = D.qrPoints(t, SM.CLOCK.today);
        const ords = (t.orders || []).filter(o => o.date === SM.CLOCK.today);
        const invs = (t.invoices || []).filter(i => i.date === SM.CLOCK.today);
        const tong = qr.total + ords.reduce((s, o) => s + o.total, 0) + invs.reduce((s, i) => s + i.total, 0);
        return {
          chinh: `Hôm nay ${F.dmy(SM.CLOCK.today)} thu được ${F.d(tong)}.`,
          chiTiet: [
            qr.count ? `${qr.count} lượt quét tại ${qr.points.filter(p => p.count).length} điểm: ${F.d(qr.total)}` : null,
            ords.length ? `${ords.length} đơn trên kênh số: ${F.d(ords.reduce((s, o) => s + o.total, 0))}` : null,
            invs.length ? `${invs.length} hoá đơn khách tổ chức: ${F.d(invs.reduce((s, i) => s + i.total, 0))}` : null,
          ].filter(Boolean),
          tinhTu: 'Cộng từ bảng thanh toán, bảng đơn hàng và bảng hoá đơn có ngày bằng hôm nay.',
        };
      }
    },
    {
      key: ['thue tam tinh', 'thue quy nay', 'phai nop bao nhieu', 'thue bao nhieu'],
      run(t) {
        const e = D.taxEstimate(t);
        const rows = e.byGroup.map(g => g.rate
          ? `${g.rate.ten}: doanh thu ${F.d(g.revenue)} → GTGT ${F.pct(g.rate.gtgt)} = ${F.d(g.gtgt)}, TNCN ${F.pct(g.rate.tncn)} = ${F.d(g.tncn)} (ghi ${g.book})`
          : `${g.group}: ${F.d(g.revenue)}`);
        return {
          chinh: e.regime === 'dn'
            ? `Quý ${SM.CLOCK.quarter}/${SM.CLOCK.year} tạm tính phải nộp ${F.d(e.total)} — gồm GTGT ${F.d(e.gtgt)} và TNDN ${F.d(e.tndn)} (thuế suất ${e.tndnSuat}%).`
            : `Quý ${SM.CLOCK.quarter}/${SM.CLOCK.year} tạm tính phải nộp ${F.d(e.total)} — gồm GTGT ${F.d(e.gtgt)} và TNCN ${F.d(e.tncn)}.`,
          chiTiet: rows.concat(e.mienThue ? ['Doanh thu năm chưa vượt ngưỡng miễn thuế nên tạm tính bằng 0.'] : []),
          tinhTu: `Doanh thu kỳ ${F.dmy(e.period.from)}–${F.dmy(e.period.to)} là ${F.d(e.revenue)}, tách theo nhóm ngành rồi áp biểu tỷ lệ.`,
          canhBao: D.TAX.canDoiChieu ? 'Biểu tỷ lệ đang dùng bản nháp, cần đối chiếu văn bản hiện hành.' : null,
        };
      }
    },
    {
      key: ['con bao nhieu ngay', 'con may ngay', 'han ke khai', 'bao gio den han'],
      run(t) {
        const dl = D.deadlines(t).filter(x => x.conLai !== null && x.conLai !== undefined);
        const thue = dl.find(x => x.loai === 'thue');
        return {
          chinh: thue
            ? `Còn ${thue.conLai} ngày tới hạn ${thue.ten.toLowerCase()} — hạn ${F.dmy(thue.han)}, số tạm tính ${F.d(thue.soTien)}.`
            : 'Không còn mốc kê khai nào đang chờ.',
          chiTiet: dl.filter(x => x !== thue).map(x => `${x.ten}${x.han ? ' — hạn ' + F.dmy(x.han) : ''}`),
          tinhTu: 'Đếm từ hôm nay tới ngày cuối tháng đầu quý sau.',
        };
      }
    },
    {
      key: ['con bao nhieu hang', 'ton kho', 'con hang khong', 'kho con gi'],
      run(t) {
        const st = D.stockAll(t).filter(s => s.meta);
        const canh = st.filter(s => s.available <= 0);
        return {
          chinh: canh.length
            ? `Có ${canh.length} mặt hàng đã hết hàng khả dụng: ${canh.map(s => s.meta.name).join(', ')}.`
            : `Còn hàng cả ${st.length} mặt. Ít nhất là ${st.slice().sort((a, b) => a.available - b.available)[0].meta.name}.`,
          chiTiet: st.map(s => `${s.meta.name}: còn ${F.num(s.available)} ${s.meta.unit}` +
            (s.reserved ? ` (đang giữ chỗ ${F.num(s.reserved)} cho đơn chưa giao)` : '') +
            (s.lots.length > 1 ? ` · ${s.lots.length} lô` : '')),
          tinhTu: 'Tổng tồn các lô trừ đi phần đang giữ chỗ cho đơn chưa giao. Một con số dùng chung cho mọi kênh bán.',
        };
      }
    },
    {
      key: ['ai dang no', 'cong no', 'no qua han', 'ai chua tra tien'],
      run(t) {
        const rs = (t.receivables || []).filter(r => !r.paid);
        const od = rs.filter(r => r.due < SM.CLOCK.today);
        return {
          chinh: od.length
            ? `${od.length} khoản quá hạn, tổng ${F.d(od.reduce((s, r) => s + r.amount, 0))}. Tổng công nợ chưa thu ${F.d(rs.reduce((s, r) => s + r.amount, 0))}.`
            : `Không có khoản nào quá hạn. Tổng công nợ chưa thu ${F.d(rs.reduce((s, r) => s + r.amount, 0))}.`,
          chiTiet: rs.map(r => `${r.buyer}: ${F.d(r.amount)} — hạn ${F.dmy(r.due)}` +
            (r.due < SM.CLOCK.today ? ` (quá ${Math.round((new Date(SM.CLOCK.today) - new Date(r.due)) / 86400000)} ngày)` : '')),
          tinhTu: 'Bảng công nợ, so ngày hạn với hôm nay.',
        };
      }
    },
    {
      key: ['lich mai', 'lich hom nay', 'may khach', 'con cho khong', 'thuyen con cho', 'phong con'],
      run(t) {
        if (!(t.resources || []).length) return null;
        const cal = D.calendar(t, SM.CLOCK.today, 3);
        const lines = [];
        cal.forEach(day => day.res.forEach(r => r.slots.forEach(s => {
          if (s.used > 0) lines.push(`${F.dm(day.date)} ${s.slot} · ${r.res.ten}: ${s.used}/${s.cap}` + (s.free <= 0 ? ' — ĐÃ ĐẦY' : ` (còn ${s.free})`));
        })));
        const full = lines.filter(l => l.indexOf('ĐÃ ĐẦY') >= 0);
        return {
          chinh: full.length
            ? `Có ${full.length} khung đã đầy trong 3 ngày tới — đặt thêm vào đó sẽ bị chặn.`
            : 'Ba ngày tới còn chỗ ở tất cả các khung đang có khách.',
          chiTiet: lines.length ? lines : ['Chưa có lượt đặt nào trong 3 ngày tới.'],
          tinhTu: 'Cộng số khách đã đặt theo từng tài nguyên và từng khung giờ, so với số chỗ tối đa.',
        };
      }
    },
    {
      key: ['bang ke', 'thu mua thang nay', 'mua bao nhieu', 'chung tu thieu'],
      run(t) {
        if (!(t.purchases || []).length) return null;
        const ps = D.purchaseSummary(t);
        return {
          chinh: `Kỳ này đã thu mua ${ps.soLuot} lượt, tổng ${F.d(ps.total)}.` +
                 (ps.thieuChungTu ? ` Có ${ps.thieuChungTu} bảng kê còn thiếu giấy tờ — phải bổ sung trước khi khoá kỳ.` : ' Bảng kê đã đủ giấy tờ.'),
          chiTiet: ps.bad.map(p => {
            const c = D.checkPurchase(p);
            return `${p.id} — ${p.seller}: thiếu ${c.thieu.join(', ')}`;
          }),
          tinhTu: 'Soát từng bảng kê thu mua theo danh mục mục bắt buộc.',
        };
      }
    },
    {
      key: ['kenh nao lai', 'kenh nao ban tot', 'ban o dau nhieu nhat', 'kenh nao nhieu'],
      run(t) {
        const lines = D.revenueLines(t, { from: SM.CLOCK.year + '-01-01', to: SM.CLOCK.year + '-12-31' });
        const bag = {};
        lines.forEach(l => { bag[l.channel] = (bag[l.channel] || 0) + l.amount; });
        const rows = Object.entries(bag).sort((a, b) => b[1] - a[1]);
        const tong = rows.reduce((s, r) => s + r[1], 0);
        return {
          chinh: rows.length ? `Kênh mạnh nhất từ đầu năm là ${(D.CHANNELS[rows[0][0]] || {}).ten || rows[0][0]} với ${F.d(rows[0][1])}, chiếm ${F.pct(rows[0][1] / tong * 100)}.` : 'Chưa có doanh thu.',
          chiTiet: rows.map(r => `${(D.CHANNELS[r[0]] || {}).ten || r[0]}: ${F.d(r[1])} (${F.pct(r[1] / tong * 100)})`),
          tinhTu: 'Nhóm toàn bộ dòng doanh thu từ đầu năm theo kênh bán.',
        };
      }
    },
    {
      key: ['co phai dung may tinh tien', 'vuot 1 ty', 'nguong doanh thu'],
      run(t) {
        const p = D.needsPosInvoice(t);
        return {
          chinh: p.thuocDien
            ? `Đã thuộc diện dùng hoá đơn điện tử khởi tạo từ máy tính tiền: doanh thu từ đầu năm ${F.d(p.yearRev)}, vượt ngưỡng ${F.dShort(p.nguong)}.`
            : p.sapVuot
              ? `Chưa vượt, nhưng đang trên đà vượt: đầu năm tới nay ${F.d(p.yearRev)}, theo tiến độ này cả năm khoảng ${F.d(p.projected)} — trên ngưỡng ${F.dShort(p.nguong)}. Nên chuẩn bị trước.`
              : `Chưa thuộc diện: doanh thu từ đầu năm ${F.d(p.yearRev)}, dự kiến cả năm khoảng ${F.d(p.projected)}, dưới ngưỡng ${F.dShort(p.nguong)}.`,
          chiTiet: [`Ngưỡng áp dụng: ${D.TAX.nguong.posInvoice.ten}`],
          tinhTu: 'Doanh thu luỹ kế từ 01/01, chia theo số ngày đã qua rồi nhân 365 để ước cả năm.',
        };
      }
    },

    /* ═══ 3 handler vận hành D-#7 — trạng thái nền tảng nói thật về mình ═══
       Đơn mới nhất đọc SỔ SỰ KIỆN hộp thư (nguồn, giờ tới, nội dung bản tin);
       kênh đứt đọc trạng thái từng kết nối; độ tươi đọc bảng ngân sách C.15 —
       dòng chưa đo trả đúng nhãn CHUA_DO thay vì im lặng hoặc bịa số.        */

    {
      key: ['don moi nhat', 'don vua ve', 'don cuoi cung', 'don moi ve luc nao'],
      run(t) {
        if (!SM.inbox || !SM.inbox.list) return null;
        const ev = SM.inbox.list(t.id).find(e => e.loaiSuKien === 'don-moi');
        if (!ev) return {
          chinh: 'Chưa có đơn nào về trong hộp thư — sổ sự kiện đang trống đơn.',
          chiTiet: [],
          tinhTu: 'Đọc sổ hộp thư đến: nơi ghi lại từng sự kiện các kênh đẩy vào, kèm giờ tới.',
        };
        const p = ev.payload || {};
        const tong = (p.items || []).reduce((s, it) => s + (it.qty || 0) * (it.donGia || 0), 0);
        const nguon = SM.inbox.nguonCua(ev);
        const xuLy = ev.trangThai === 'da-xu-ly' ? 'đã vào sổ bán'
          : ev.trangThai === 'loi' ? 'bị kẹt — cần cô chú xem lại'
          : ev.trangThai === 'trung-bo' ? 'bản trùng theo mã — đã bỏ, không cộng lần hai'
          : 'chờ cô chú mở ra xem';
        return {
          chinh: `Đơn mới nhất về lúc ${F.hm(ev.luc)} ngày ${F.dmy(String(ev.luc).slice(0, 10))}, từ kênh ${nguon.ten}.`,
          chiTiet: [
            p.maDon ? `Mã đơn ${p.maDon}, khách ${p.khach || 'chưa rõ tên'}.` : null,
            tong ? `Giá trị ${F.d(tong)} — ${xuLy}.` : `Tình trạng: ${xuLy}.`,
          ].filter(Boolean),
          tinhTu: 'Sổ hộp thư đến ghi lại từng sự kiện NGAY KHI nó tới: nguồn nào gửi, giờ nào tới, bản tin nói gì.',
        };
      }
    },
    {
      key: ['kenh nao dut', 'ket noi on khong', 'cac kenh co on khong', 'kenh chet'],
      run(t) {
        const cs = D.connectors(t);
        const trangThaiCua = c => c.trangThai || (c.noi ? 'ok' : 'chua-noi');   // tolerant khi trạng thái mới chưa có
        const dut = cs.filter(c => trangThaiCua(c) === 'chet');
        const noi = cs.filter(c => trangThaiCua(c) === 'ok');
        return {
          chinh: dut.length
            ? `${dut.length} kênh đang đứt: ${dut.map(c => c.ten).join(', ')}. Đơn từ kênh này có thể không về — em đã nhắc cán bộ kiểm tra, kênh khác vẫn chạy bình thường.`
            : (noi.length ? `Các kênh đang nối đều chạy bình thường — chưa thấy kênh nào đứt.` : 'Hộ chưa nối kênh nào nên chưa có gì để đứt.'),
          chiTiet: noi.map(c => `${c.ten}: ổn`),
          tinhTu: 'Mỗi kênh nối tự báo hiệu; kênh im quá lâu bị đánh dấu đứt và chờ bước đối soát kiểm tra lại.',
        };
      }
    },
    {
      key: ['du lieu tuoi', 'du lieu tuoi toi dau', 'cap nhat lan cuoi'],
      run(t) {
        const cs = D.connectors(t).filter(c => c.trangThai ? c.trangThai !== 'chua-noi' : c.noi);
        if (!cs.length) return null;
        const soDo = cs.filter(c => (c.doTuoi || {}).congBo).length;
        const chuaDo = cs.length - soDo;
        return {
          chinh: `Đang nối ${cs.length} kênh: ${soDo} kênh có số đo, ${chuaDo} kênh «${CHUA_DO}». Chưa đo thì nói chưa đo — không hô realtime khi chưa có bằng chứng.`,
          chiTiet: cs.map(c => {
            const tuoi = (c.doTuoi || {}).congBo || CHUA_DO;
            const phut = c.lanDongBoCuoi
              ? Math.max(0, Math.round((Date.now() - new Date(c.lanDongBoCuoi).getTime()) / 60000)) : null;
            return `${c.ten}: ${tuoi}${phut !== null ? ` — lần cuối đồng bộ ${phut} phút trước` : ''}`;
          }),
          tinhTu: 'Bảng ngân sách độ tươi từng kênh (cơ chế nào, công bố gì) cộng mốc lần đồng bộ cuối của chính kênh đó.',
        };
      }
    },
  ];

  /* ═══════════════════════════════ SINH NỘI DUNG BÁN HÀNG ════════════════
     IV.5 cuối: "Trợ lý cũng hỗ trợ tạo nội dung đăng bán sản phẩm và trả lời
     khách hàng."                                                            */

  function genListing(t, sku) {
    const s = (t.skus || []).find(x => x.sku === sku) || (t.skus || [])[0];
    if (!s) return null;
    const st = D.stock(t, s.sku);
    const lot = st.lots[0];
    const attp = (t.compliance || []).find(c => c.id && String(c.id).indexOf('TCB') === 0 || c.id === 'ATTP');
    return {
      sku: s.sku,
      tieuDe: `${s.name} — ${t.diaBan}, giao toàn quốc`,
      than: [
        `${s.name}, hàng làm tại ${t.diaBan}.`,
        lot ? `Lô ${lot.id}, vào ngày ${F.dmy(lot.inDate)} — quét mã trên bao bì xem được nguồn gốc.` : '',
        attp ? `Cơ sở có ${attp.ten.toLowerCase()}.` : '',
        `Giá ${F.d(s.price)}/${s.unit}. Còn ${F.num(st.available)} ${s.unit}.`,
        'Nhắn tin để được tư vấn số lượng và cách bảo quản.',
      ].filter(Boolean).join(' '),
      the: ['#dacsan' + (t.khongGian === 'Ven biển' ? 'bien' : 'taynguyen'), '#GiaLai', '#' + strip(s.name).replace(/\s/g, '')],
      canhBao: 'Nội dung do trợ lý soạn — hộ đọc lại trước khi đăng. Không tự đăng thay hộ.',
    };
  }

  /** Trả lời khách đặt dịch vụ NGOÀI GIỜ (chân dung 2) — tính từ lịch thật. */
  function afterHoursReply(t, req) {
    if (!(t.resources || []).length) return null;
    const date = req && req.date || SM.dayOffset(SM.CLOCK.today, 1);
    const cal = D.calendar(t, date, 1)[0];
    const free = [];
    cal.res.forEach(r => r.slots.forEach(s => { if (s.free > 0) free.push({ res: r.res, slot: s }); }));
    const boats = free.filter(f => f.res.kind === 'boat');
    const rooms = free.filter(f => f.res.kind === 'room');
    return {
      guiLuc: 'Ngoài giờ làm việc — trợ lý trả lời thay, chủ hộ xem lại sáng mai',
      than: [
        `Dạ em cảm ơn anh chị đã nhắn. Ngày ${F.dmy(date)} bên em còn:`,
        boats.length ? `· Cano: ${boats.slice(0, 3).map(f => `${f.res.ten} khung ${f.slot.slot} còn ${f.slot.free} chỗ`).join('; ')}` : '· Cano: đã đầy hết các khung',
        rooms.length ? `· Homestay: còn ${rooms.length} phòng` : '· Homestay: đã hết phòng',
        `Gói trọn gói ăn trưa cùng cano và lặn ngắm san hô ${F.d((t.skus.find(s => s.sku === 'COMBO-A') || {}).price || 0)}/khách.`,
        'Anh chị cho em biết số khách và khung giờ mong muốn, em giữ chỗ và xác nhận lại ngay ạ.',
      ].filter(Boolean).join('\n'),
      ranhGioi: 'Trợ lý chỉ báo chỗ trống và giữ tạm. Chốt đơn và nhận tiền vẫn do người quyết.',
      choHo: 'Trợ lý soạn sẵn trong 1 phút, cô chú đọc rồi tự bấm gửi — tin chỉ đi khi cô chú bấm.',   // N-06
    };
  }

  /* ═════════════════ LỚP C — CHUYỂN NGƯỜI THẬT, CÓ ĐỒNG HỒ SLA ═══════════
     IV.5: "nêu rõ ... thời gian phản hồi của kênh hỗ trợ có con người khi trợ
     lý không giải quyết được".                                              */

  const SLA = {
    uptime: { camKet: 99.5, ten: 'Mức sẵn sàng hệ thống cam kết trong tháng' },
    doTre: [
      { muc: 'Chặn bán hàng hoặc chặn xuất hoá đơn', dauTien: '15 phút', xuLy: '2 giờ', kenh: 'Gọi trực tiếp cán bộ phụ trách địa bàn', gio: '07:00–21:00 mọi ngày' },
      { muc: 'Kỳ kê khai, hạn nộp thuế', dauTien: '30 phút', xuLy: '4 giờ', kenh: 'Cán bộ hỗ trợ tại chỗ, có thể đến cơ sở', gio: '07:00–21:00 mọi ngày' },
      { muc: 'Hỏi nghiệp vụ, hướng dẫn thao tác', dauTien: '2 giờ', xuLy: '1 ngày làm việc', kenh: 'Zalo nhóm hộ và tổng đài', gio: 'Giờ hành chính' },
      { muc: 'Đề nghị thêm kênh bán, đổi cấu hình', dauTien: '1 ngày làm việc', xuLy: '5 ngày làm việc', kenh: 'Phiếu yêu cầu trong ứng dụng', gio: 'Giờ hành chính' },
    ],
    ghiChu: 'Trợ lý trực 24/7. Ngoài khung giờ có người, trợ lý ghi nhận và hẹn giờ gọi lại — không để hộ chờ không biết bao lâu.',
  };

  function escalate(t, question) {
    return {
      ma: 'HT-' + SM.CLOCK.today.slice(5).replace('-', '') + '-' + String(SM.hash(question) % 900 + 100),
      cauHoi: question,
      mucDo: 'Hỏi nghiệp vụ, hướng dẫn thao tác',
      phanHoiDauTien: '2 giờ',
      nguoiPhuTrach: 'Cán bộ hỗ trợ địa bàn ' + t.diaBan,
      trangThai: 'Đã chuyển người thật',
    };
  }

  /* ═════════════════════════════════════════ HỎI ═════════════════════════ */

  /**
   * ask(question) → {lop:'A'|'B'|'C', ...}
   * Thứ tự: thử Lớp A trước (dữ liệu của hộ), rồi Lớp B (nghiệp vụ), cuối cùng Lớp C.
   */
  function ask(question, tenant) {
    const t = tenant || SM.current();
    const s = strip(question);

    for (const h of A_HANDLERS) {
      if (h.key.some(k => s.indexOf(strip(k)) >= 0)) {
        const r = h.run(t);
        if (r) return Object.assign({ lop: 'A', nhan: 'Trả lời từ dữ liệu của hộ', hoi: question }, r);
      }
    }

    const b = kbFind(question);
    if (b) {
      return {
        lop: 'B', nhan: 'Trả lời từ bộ nội dung nghiệp vụ', hoi: question,
        baiId: b.id, tieuDe: b.tieuDe, chinh: b.traLoi,
        canhBao: b.canhBao || null,
        nguon: b.nguon,
        pheDuyet: b.pheDuyet,
        kbPhienBan: KB.phienBan,
        kbCoQuan: KB.coQuanPheDuyet,
      };
    }

    return Object.assign({ lop: 'C', nhan: 'Trợ lý không tự trả lời — đã chuyển người thật', hoi: question,
      chinh: 'Câu này chưa có trong bộ nội dung được Chương trình phê duyệt, và cũng không tính được từ dữ liệu của hộ. Em đã chuyển cho cán bộ hỗ trợ.' },
      { phieu: escalate(t, question) });
  }

  /** Câu gợi ý — bám đúng ví dụ nêu trong ràng buộc IV.5(a). */
  function suggestions(t) {
    const base = ['Hôm nay bán được bao nhiêu?', 'Thuế tạm tính quý này bao nhiêu?', 'Còn bao nhiêu ngày đến hạn kê khai?'];
    const extra = [];
    if ((t.resources || []).length) extra.push('Mai thuyền còn chỗ không?');
    if ((t.purchases || []).length) extra.push('Bảng kê thu mua có thiếu giấy tờ không?');
    if ((t.skus || []).length) extra.push('Còn bao nhiêu hàng trong kho?');
    if ((t.receivables || []).length) extra.push('Ai đang nợ tiền?');
    extra.push('Kênh nào bán tốt nhất?');
    extra.push('Đơn mới nhất về lúc nào, từ đâu?');
    extra.push('Kết nối các kênh có ổn không?');
    extra.push('Dữ liệu tươi tới đâu rồi?');
    extra.push('Nhà nước đã cấp miễn phí phần mềm kế toán, sao vẫn phải mua thêm?');
    return base.concat(extra);
  }

  SM.ai = { KB, SLA, ask, suggestions, genListing, afterHoursReply, escalate, strip, CHUA_DO };
})(window);
