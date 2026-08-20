/**
 * sm-program.js — TẦNG CHƯƠNG TRÌNH: những thứ hội đồng chấm chứ hộ không dùng.
 *
 * Phủ: IV.2 bản đồ chồng lấn với nền tảng miễn phí quốc gia
 *      IV.9 công bố giá ba cột · II.2 không tính phí trùng lặp
 *      IV.6 + V.3 định mức nhân sự tại chỗ trên 100 hộ
 *      V.1 một gói chung cấu hình được → nhân rộng 8 nghề, 1.200 hộ một người
 *      V.2 mô hình giá + cơ chế mua chung theo lô lớn
 *      V.5 chỉ số phản ánh khả năng "sống" của hộ
 *      Mục III 4 mốc: phút mỗi ngày · chi phí từng cấu phần · lý do bỏ cuộc
 */
(function (global) {
  'use strict';
  const SM = global.SM;
  if (!SM) throw new Error('sm-program.js cần sm-core.js');

  /* ═════════════ GIÁ BA CỘT (IV.9) — tách rõ phần MIỄN PHÍ QUỐC GIA ═══════
     "Công bố giá bán lẻ niêm yết, mức giá sỉ đề xuất cho Chương trình và mức
      giá hộ tự chi trả từ năm thứ ba trở đi."
     Nguyên tắc II.2: cấu phần đã miễn phí thì KHÔNG tính tiền — để 0đ và nói rõ.
     Đơn vị: đồng / hộ / năm, trừ dòng ghi khác.                              */

  const GIA = {
    donViMacDinh: 'đồng/hộ/năm',
    dieuKienGiaSi: 'Giá sỉ áp dụng khi Chương trình đàm phán mua chung từ 1.000 tài khoản trở lên',
    nguonDieuKien: 'Slide Chương trình phối hợp Hội Doanh nhân trẻ — "đàm phán mua chung theo lô lớn, từ 1.000 tài khoản trở lên"',
    nhom: [
      {
        ten: 'Tầng tuân thủ — Nhà nước và thị trường đã cấp miễn phí',
        mienPhi: true,
        ghiChu: 'Chương trình KHÔNG trả tiền cho nhóm này. Nền tảng chỉ kết nối vào, không tính phí trùng lặp.',
        dong: [
          { ten: 'Kê khai và nộp thuế điện tử (eTax Mobile, Cổng thuế điện tử)', niemYet: 0, si: 0, nam3: 0, nguon: 'Nhà nước cung cấp' },
          { ten: 'Phần mềm kế toán và hoá đơn cơ bản dùng chung', niemYet: 0, si: 0, nam3: 0, nguon: 'Điều 10 Nghị định 20/2026/NĐ-CP — khi nền tảng vận hành' },
          { ten: 'Chữ ký số cho hộ kinh doanh', niemYet: 0, si: 0, nam3: 0, nguon: 'Theo chương trình miễn phí đang có của nhà cung cấp' },
        ],
      },
      {
        ten: 'Gói chung cấu hình được — tầng vận hành và bán hàng',
        mienPhi: false,
        ghiChu: 'Một gói chung cho cả ba ngành, khác nhau ở cấu hình chứ không khác phần mềm. Đây là phần trả lời câu V.1.',
        dong: [
          { ten: 'Nối kênh bán và hợp nhất đơn (sàn thương mại điện tử, mạng xã hội, app giao đồ ăn, nền tảng đặt phòng)', niemYet: 2_400_000, si: 1_440_000, nam3: 1_200_000 },
          { ten: 'Tồn kho đa kênh, quản theo lô, truy xuất nguồn gốc', niemYet: 1_320_000, si: 780_000, nam3: 660_000 },
          { ten: 'Trợ lý tiếng Việt hai lớp, trực 24/7, cảnh báo trước mốc nghĩa vụ', niemYet: 1_560_000, si: 900_000, nam3: 780_000 },
          { ten: 'Bảng điều khiển doanh thu, công nợ, nghĩa vụ thuế tạm tính theo thời gian thực', niemYet: 600_000, si: 480_000, nam3: 300_000 },
        ],
      },
      {
        ten: 'Cấu phần theo ngành — bật theo chân dung, không bán kèm bừa',
        mienPhi: false,
        ghiChu: 'Hộ chỉ trả cho cấu phần ngành mình dùng. Trả lời trực tiếp câu V.1 "cấu phần nào thừa hoặc thiếu với từng ngành".',
        dong: [
          { ten: 'Đặt chỗ theo tài nguyên: khung giờ, giới hạn chỗ mỗi chuyến, lịch phòng và lịch thuyền chống trùng', niemYet: 1_200_000, si: 720_000, nam3: 600_000, nganh: 'Dịch vụ du lịch' },
          { ten: 'Bảng kê thu mua và chứng từ đầu vào khi mua của nông dân nhỏ lẻ', niemYet: 1_200_000, si: 720_000, nam3: 600_000, nganh: 'Nông sản đặc sản' },
          { ten: 'Hồ sơ an toàn thực phẩm, nhãn mác, truy xuất theo lô cho khách hàng tổ chức', niemYet: 960_000, si: 600_000, nam3: 480_000, nganh: 'Đồ ăn, đồ uống và đặc sản' },
        ],
      },
      {
        ten: 'Triển khai tại chỗ — chỉ thu năm thứ nhất',
        mienPhi: false,
        motLan: true,
        ghiChu: 'Cầm tay chỉ việc tại cơ sở giai đoạn thiết lập và kỳ kê khai đầu tiên. Đây là phần tỉnh đang thiếu người làm, không phải phần mềm.',
        dong: [
          { ten: 'Cài đặt tại cơ sở, nhập dữ liệu ban đầu, đào tạo hai thế hệ trong hộ', niemYet: 2_400_000, si: 1_500_000, nam3: 0 },
          { ten: 'Đồng hành kỳ kê khai đầu tiên tại cơ sở', niemYet: 1_200_000, si: 750_000, nam3: 0 },
        ],
      },
      {
        ten: 'Phí theo giao dịch — biến phí thật, không gói vào thuê bao',
        mienPhi: false,
        theoGiaoDich: true,
        ghiChu: 'Chỉ phát sinh khi hộ thực sự phát hành hoá đơn. Hộ nhỏ trả ít, hộ lớn trả nhiều — công bằng và không phải trả trước.',
        dong: [
          { ten: 'Hoá đơn điện tử phát hành (gồm hoá đơn khởi tạo từ máy tính tiền)', niemYet: 300, si: 200, nam3: 250, donVi: 'đồng/hoá đơn' },
        ],
      },
    ],
  };

  /** Tổng giá cho một chân dung: chỉ cộng cấu phần ngành của chân dung đó. */
  function tinhGia(nganh) {
    const cot = { niemYet: 0, si: 0, nam3: 0 }, motLan = { niemYet: 0, si: 0, nam3: 0 }, dong = [];
    GIA.nhom.forEach(n => {
      if (n.theoGiaoDich) return;
      n.dong.forEach(d => {
        if (d.nganh && d.nganh !== nganh) return;
        const bag = n.motLan ? motLan : cot;
        bag.niemYet += d.niemYet; bag.si += d.si; bag.nam3 += d.nam3;
        dong.push(Object.assign({ nhom: n.ten, mienPhi: !!n.mienPhi, motLan: !!n.motLan }, d));
      });
    });
    return { nganh, hangNam: cot, motLan, dong,
             nam1: { niemYet: cot.niemYet + motLan.niemYet, si: cot.si + motLan.si },
             nam2: { si: Math.round(cot.si * 0.5) },   // ngân sách 50% năm 2
             nam3: cot.nam3 };
  }

  /* ═════════════ BẢN ĐỐI CHIẾU GIÁ VỚI KIOTVIET (D-#9) ═══════════════════
     Câu hỏi chắc chắn của hội đồng: «tại sao không lấy 270k có sẵn mọi thứ?»
     [Q-007 · mốc giá đối chiếu Q-039]. Số đối thủ giữ đúng TỪNG CON theo
     bằng chứng — không thêm bớt, không bịa tên gói. Định vị theo N-01: không
     đối đầu giá ở lớp miễn phí, chỉ nói rõ bên mình bán cái gì KiotViet không có. */

  const DOI_THU = {
    ten: 'KiotViet',
    nhanNguon: 'Bảng giá KiotViet thu thập cho phản biện — mốc giá đối chiếu Q-039 [Q-007]',
    donVi: 'đồng/tháng',
    goi: [                                    // 3 gói [Q-007] — tên ghi theo mức giá, không bịa tên thương mại
      { ten: 'Gói 270k', giaThang: 270_000 },
      { ten: 'Gói 330k', giaThang: 330_000 },
      { ten: 'Gói 490k', giaThang: 490_000 },
    ],
    phuPhi: [                                 // phụ phí [Q-007] — bản gốc không ghi rõ mức nào cho gói nào nên ghi cả hai mức
      { ten: 'Thêm mỗi chi nhánh', muc: '+270.000đ hoặc +375.000đ tùy gói' },
      { ten: 'Thêm mỗi kho', muc: '+150.000đ' },
    ],
    phiChiNhanh: [270_000, 375_000],          // hai mức trên, hàm tính nhận caller chọn mức
    phiKho: 150_000,
    kemMiễnPhi: [                             // mọi gói KiotViet đều kèm, 0đ [Q-007]
      { ten: 'Hoá đơn điện tử', phi: 0 },
      { ten: 'Chữ ký số', phi: 0 },
      { ten: 'Phần mềm kế toán hộ kinh doanh', phi: 0 },
    ],
    dinhVi: 'KiotViet 270k mua phần mềm bán hàng kèm tuân thủ 0đ; bên mình bán việc-được-làm-xong đa kênh + trợ lý 24/7 + người xuống cơ sở; lớp tuân thủ bên mình cũng để 0đ',
  };

  /** Tổng tiền KiotViet một năm cho một lựa chọn — TÍNH từ cấu phần, không ghi sẵn tổng.
      Phần kèm (HĐĐT, CTS, PM kế toán) 0đ nên không cộng vào [Q-007]. */
  function tinhKiotVietNam(goiIdx, soChiNhanh, mucChiNhanh, soKho) {
    const g = DOI_THU.goi[goiIdx] || DOI_THU.goi[0];
    const phiCN = DOI_THU.phiChiNhanh[mucChiNhanh] || DOI_THU.phiChiNhanh[0];
    const thang = g.giaThang + Math.max(0, soChiNhanh || 0) * phiCN + Math.max(0, soKho || 0) * DOI_THU.phiKho;
    return { thang, nam: thang * 12 };
  }

  /* ═════════════ BẢN ĐỒ CHỒNG LẤN (IV.2) ═════════════════════════════════
     "nêu rõ phương án kỹ thuật và các cấu phần SẼ ĐIỀU CHỈNH để tránh trùng lặp"
     khi nền tảng số, phần mềm kế toán dùng chung theo Điều 10 NĐ 20/2026 vận hành. */

  const CHONG_LAN = {
    cauHoi: 'Khi nền tảng dùng chung của Nhà nước vận hành, cấu phần nào của chúng tôi tắt đi?',
    nguyenTac: 'Cấu phần nào Nhà nước làm thì chúng tôi tắt và giao lại, không giữ để tính tiền. Cấu phần nào Nhà nước không làm thì chúng tôi giữ. Ranh giới đặt ở chỗ: tuân thủ là của Nhà nước, vận hành và bán hàng là của thị trường.',
    dong: [
      { cauPhan: 'Lập và gửi tờ khai thuế', hienTai: 'Nền tảng lập tờ khai nháp rồi dẫn hộ sang cổng thuế', khiCoNenTangQuocGia: 'TẮT phần lập tờ khai, chỉ còn đẩy dữ liệu doanh thu sang nền tảng dùng chung', mucDo: 'tat' },
      { cauPhan: 'Sổ kế toán theo chế độ hộ kinh doanh', hienTai: 'Định tuyến giao dịch vào đúng sổ theo hình thức chịu thuế', khiCoNenTangQuocGia: 'GIAO LẠI cho nền tảng dùng chung; giữ lại lớp định tuyến vì nền quốc gia nhận dữ liệu đã phân loại', mucDo: 'giao' },
      { cauPhan: 'Phát hành hoá đơn điện tử', hienTai: 'Phát hành qua nhà cung cấp hoá đơn, gồm hoá đơn từ máy tính tiền', khiCoNenTangQuocGia: 'GIỮ đường phát hành nhưng chuyển sang dùng hạ tầng miễn phí nếu nền quốc gia cấp; phí theo hoá đơn giảm về 0', mucDo: 'giao' },
      { cauPhan: 'Chữ ký số', hienTai: 'Chỉ tích hợp, không bán', khiCoNenTangQuocGia: 'Không đổi — vốn đã không tính phí', mucDo: 'giu' },
      { cauPhan: 'Nối kênh bán và hợp nhất đơn nhiều kênh', hienTai: 'Sàn, mạng xã hội, app giao đồ ăn, nền tảng đặt phòng', khiCoNenTangQuocGia: 'GIỮ — nền tảng dùng chung không làm phần này', mucDo: 'giu' },
      { cauPhan: 'Tồn kho đa kênh và quản theo lô', hienTai: 'Một con số tồn dùng chung mọi kênh, truy xuất theo lô', khiCoNenTangQuocGia: 'GIỮ — không thuộc phạm vi tuân thủ', mucDo: 'giu' },
      { cauPhan: 'Đặt chỗ theo tài nguyên', hienTai: 'Khung giờ, giới hạn chỗ, chống trùng đặt', khiCoNenTangQuocGia: 'GIỮ', mucDo: 'giu' },
      { cauPhan: 'Bảng kê thu mua từ nông dân nhỏ lẻ', hienTai: 'Lập tại vườn, chặn thiếu giấy tờ', khiCoNenTangQuocGia: 'GIỮ phần thu nhận và kiểm tra; đẩy kết quả sang nền quốc gia thay vì tự hạch toán', mucDo: 'giao' },
      { cauPhan: 'Trợ lý tiếng Việt hai lớp', hienTai: 'Hỏi trên dữ liệu hộ và hỏi nghiệp vụ theo bộ nội dung được phê duyệt', khiCoNenTangQuocGia: 'GIỮ — nhưng bộ nội dung nghiệp vụ chuyển sang lấy từ nguồn của cơ quan thuế để luôn đúng bản mới nhất', mucDo: 'giu' },
      { cauPhan: 'Triển khai và hỗ trợ tại chỗ', hienTai: 'Người xuống cơ sở', khiCoNenTangQuocGia: 'GIỮ — đây là phần không có nền tảng nào thay được', mucDo: 'giu' },
    ],
  };

  /* ═════════════ NHÂN RỘNG: MỘT GÓI CHUNG, NHIỀU NGHỀ (V.1) ══════════════
     Slide Chương trình: doanh nghiệp một người ứng dụng AI 1.200/3.680 hộ,
     cách làm "đóng gói sẵn 8–10 mô hình nghề với bộ công cụ AI dễ tiếp cận".
     Ba chân dung là ba cấu hình của cùng một bộ khung — 8 nghề cũng vậy.     */

  const NGHE = {
    nguon: 'Slide Chương trình phối hợp Hội Doanh nhân trẻ — 08 lĩnh vực đã liệt kê sẵn',
    mucTieu: { opc: 1200, tong: 3680, hoChuyenDoi: 3000, hoTong: 32500 },
    khung: ['Nối kênh khách', 'Ghi doanh thu và xuất hoá đơn', 'Tồn kho hoặc lịch tài nguyên', 'Chứng từ đầu vào', 'Trợ lý hai lớp', 'Kê khai và mốc nghĩa vụ'],
    danhSach: [
      { ten: 'Dịch vụ kỹ thuật nông nghiệp: bay không người lái phun thuốc và gieo hạt, đo đạc lập bản đồ lô thửa, tư vấn dinh dưỡng cây trồng',
        canThem: 'Lịch tài nguyên theo thiết bị và theo thửa', giongChanDung: 'CD2', nhomThue: 'dichVu' },
      { ten: 'Nội dung số, thiết kế, thương mại điện tử và bán hàng xuyên biên giới cho nông sản, đồ gỗ, thủ công mỹ nghệ',
        canThem: 'Hợp đồng theo gói việc, thanh toán từng chặng', giongChanDung: 'CD1', nhomThue: 'dichVu' },
      { ten: 'Sửa chữa, bảo trì thiết bị công nghiệp và thiết bị chế biến nông sản',
        canThem: 'Phiếu việc tại hiện trường, vật tư thay thế', giongChanDung: 'CD3', nhomThue: 'dichVu' },
      { ten: 'Logistics chặng cuối, gom hàng, dịch vụ kho và chuỗi lạnh quy mô nhỏ',
        canThem: 'Chuyến và tải trọng, nhiệt độ theo lô', giongChanDung: 'CD1', nhomThue: 'sanXuat' },
      { ten: 'Du lịch trải nghiệm, lưu trú nhỏ, dịch vụ dẫn tour chuyên đề văn hoá và thiên nhiên',
        canThem: 'Không cần thêm — dùng đúng cấu hình chân dung 2', giongChanDung: 'CD2', nhomThue: 'dichVu' },
      { ten: 'Chế biến quy mô nhỏ đạt chuẩn an toàn thực phẩm: gia vị, trái cây sấy, cà phê đặc sản, dược liệu sơ chế',
        canThem: 'Không cần thêm — dùng đúng cấu hình chân dung 1', giongChanDung: 'CD1', nhomThue: 'sanXuat' },
      { ten: 'Dịch vụ chăm sóc người cao tuổi tại nhà và dịch vụ y tế, phục hồi chức năng cơ bản',
        canThem: 'Lịch theo người chăm sóc, hồ sơ chứng chỉ hành nghề', giongChanDung: 'CD2', nhomThue: 'dichVu' },
      { ten: 'Dịch vụ kế toán, pháp lý, nhân sự thuê ngoài cho doanh nghiệp siêu nhỏ',
        canThem: 'Nhiều khách trên một tài khoản, phân tách dữ liệu từng khách', giongChanDung: 'CD3', nhomThue: 'dichVu' },
    ],
  };

  /* ═════════════ ĐỊNH MỨC NHÂN SỰ TẠI CHỖ (IV.6 + V.3) ═══════════════════ */

  const DINH_MUC = {
    cauHoi: 'Định mức nhân sự hỗ trợ tại chỗ trên 100 hộ là bao nhiêu?',
    giaiDoan: [
      { ten: 'Thiết lập và kỳ kê khai đầu tiên (3 tháng đầu)',
        vaiTro: [
          { ten: 'Cán bộ hỗ trợ địa bàn — xuống cơ sở, cầm tay chỉ việc', ty: '1 người / 40 hộ', tren100: 2.5 },
          { ten: 'Chuyên viên nghiệp vụ thuế lưu động — trực kỳ kê khai', ty: '1 người / 200 hộ', tren100: 0.5 },
          { ten: 'Điều phối và kỹ thuật — nối kênh, xử lý sự cố', ty: '1 người / 300 hộ', tren100: 0.33 },
        ], tong: 3.33 },
      { ten: 'Vận hành ổn định (từ tháng thứ 4)',
        vaiTro: [
          { ten: 'Cán bộ hỗ trợ địa bàn', ty: '1 người / 80 hộ', tren100: 1.25 },
          { ten: 'Chuyên viên nghiệp vụ thuế lưu động', ty: '1 người / 300 hộ', tren100: 0.33 },
          { ten: 'Điều phối và kỹ thuật', ty: '1 người / 500 hộ', tren100: 0.2 },
        ], tong: 1.78 },
    ],
    ghiChu: 'Địa bàn miền núi tính hệ số 1,3 do thời gian di chuyển. Định mức trên là cho địa bàn thường.',
    thucTe: 'QNSC hiện CHƯA có nhân sự thường trú tại Gia Lai — trụ sở là địa chỉ đăng ký. Hồ sơ đi theo cửa "phương án thiết lập" mà Mục VI.1(b) cho phép, kèm số người, chi phí và mốc tuyển.',
  };

  /* ═════════════ CHỈ SỐ "SỐNG" (V.5) ════════════════════════════════════
     Ngoài chỉ số Chương trình dự kiến, đây là chỉ số phản ánh thực chất hơn.  */

  const CHI_SO_SONG = {
    cauHoi: 'Chỉ số nào phản ánh thực chất nhất khả năng "sống" của hộ sau chuyển đổi?',
    deXuat: [
      { ten: 'Tỷ lệ hộ TỰ BỎ TIỀN trả từ năm thứ ba', vi: 'Hộ móc túi trả là bằng chứng mạnh nhất rằng họ thấy lợi. Mọi chỉ số khác đều có thể đẹp nhờ trợ giá.', doTot: '≥ 60%' },
      { ten: 'Số hoá đơn mỗi tháng ở tháng 12 so với tháng 3', vi: 'Bắt được hộ dùng cho có rồi tắt dần — thứ mà chỉ số "đã kích hoạt" không thấy.', doTot: '≥ 1,0 lần' },
      { ten: 'Số kênh bán còn hoạt động (có ít nhất một giao dịch trong 30 ngày)', vi: 'Hộ mở 5 kênh rồi bỏ 4 thì không phải chuyển đổi thành công.', doTot: '≥ 2 kênh' },
      { ten: 'Tỷ lệ kỳ kê khai đúng hạn mà KHÔNG cần cán bộ nhắc', vi: 'Đo mức tự chủ. Đúng hạn nhờ người gọi nhắc là đúng hạn của cán bộ, không phải của hộ.', doTot: '≥ 80%' },
      { ten: 'Tỷ lệ hộ có ít nhất một khách hàng tổ chức (nhà hàng, khách sạn, doanh nghiệp chế biến)', vi: 'Đây là ĐỘNG LỰC chuyển đổi thật của cả ba chân dung. Có khách tổ chức thì pháp nhân mới có nghĩa.', doTot: '≥ 50%' },
      { ten: 'Tỷ lệ hộ tự thao tác trọn một kỳ không gọi hỗ trợ', vi: 'Đo được chi phí hỗ trợ dài hạn, tức là mô hình có nhân rộng nổi hay không.', doTot: '≥ 70%' },
    ],
    phanBien: 'Chỉ số Chương trình dự kiến đã đúng hướng vì đo giao dịch thật. Chỗ cần bổ sung là đo TÍNH TỰ CHỦ: một hộ đúng hạn nhờ cán bộ gọi nhắc và một hộ tự đúng hạn cho ra cùng con số ở chỉ số hiện tại, nhưng chỉ hộ thứ hai sống được khi hết trợ giá.',
  };

  /* ═════════════ MÔ HÌNH GIÁ — TRẢ LỜI V.2 ══════════════════════════════ */

  const MO_HINH_GIA = {
    cauHoi: 'Tính theo hộ/năm, theo giao dịch, hay kết hợp? Lộ trình đồng chi trả 100% – 50% – hộ tự trả có hợp lý không?',
    deXuat: 'Kết hợp, nhưng chia rõ: thuê bao theo hộ mỗi năm cho phần nền (ngân sách tỉnh dự toán được, không bị đội), phí theo giao dịch CHỈ ở hoá đơn phát hành (biến phí thật, hộ nhỏ trả ít). Không tính phí theo doanh thu — hộ sẽ che doanh thu, đúng thứ Chương trình đang muốn chống.',
    phanBien: [
      { diem: 'Vách đứng năm thứ ba', noiDung: 'Ngân sách 100% năm 1, 50% năm 2, hộ tự trả 100% từ năm 3 tạo một vách: hộ nhảy từ trả 50% lên trả 100% đúng lúc hết người đồng hành. Đây là chỗ hộ bỏ nhiều nhất.',
        thay: 'Năm 2 để hộ tự trả một khoản nhỏ nhưng THẬT (đề xuất 20–30%), để việc trả tiền thành thói quen trước khi thành gánh nặng. Năm 3 hộ trả phần còn lại theo giá đã công bố trước.' },
      { diem: 'Trợ giá nên gắn ba cửa, không gắn đầu người', noiDung: 'Ràng buộc IV.7 đã đúng. Nên đi thêm một bước: phần trợ giá năm 2 chỉ giải ngân cho hộ còn phát sinh giao dịch, không giải ngân đều.',
        thay: 'Ngân sách năm 2 tính theo hộ CÒN SỐNG ở mốc 12 tháng. Nhà cung cấp nào để hộ chết thì tự mất doanh thu năm 2 — không cần điều khoản phạt.' },
      { diem: 'Mua chung theo lô lớn nên gộp cả ba nhóm', noiDung: 'Slide Chương trình đặt mốc 1.000 tài khoản. Nhóm hộ chuyển đổi (3.000) và nhóm doanh nghiệp một người (1.200) dùng chung một bộ khung, nên gộp để đàm phán được giá tốt hơn.',
        thay: 'Đàm phán một lần cho cả 4.200 tài khoản của hai nhóm, thay vì hai lần rời.' },
    ],
    giuChan: 'Mô hình giữ chân tốt hơn không phải mô hình rẻ hơn mà là mô hình mà DỮ LIỆU CỦA HỘ nằm ở đó: một năm số liệu bán hàng, công nợ, mùa vụ và truy xuất lô là thứ hộ không muốn bỏ. Đúng ràng buộc IV.3 hộ vẫn được xuất toàn bộ dữ liệu — giữ chân bằng giá trị, không bằng khoá cửa.',
  };

  /* ═════════════ BỐN MỐC × BA CHÂN DUNG (Mục III) ════════════════════════
     Mỗi mốc: hộ dùng gì · ai cài · ai đào tạo · bao nhiêu phút mỗi ngày ·
     chi phí cấu phần · điều gì khiến hộ bỏ cuộc và cách phòng ngừa.          */

  const MOC = [
    { id: 'M1', ten: 'Ngày đầu tiên', phu: 'Thiết lập' },
    { id: 'M2', ten: '30 ngày đầu', phu: 'Vận hành ban đầu' },
    { id: 'M3', ten: 'Kỳ kê khai đầu tiên', phu: 'Nghĩa vụ thuế' },
    { id: 'M4', ten: '12 tháng', phu: 'Tăng trưởng' },
  ];

  const HANH_TRINH = {
    cd1: {
      M1: { congCu: 'Cài ứng dụng cho con gái; nhập 5–7 mặt bán chạy trước; nối Zalo và một sàn; khai báo 3 khách sạn đang giao định kỳ',
            aiCai: 'Cán bộ hỗ trợ địa bàn đến tận cửa hàng', aiDaoTao: 'Cán bộ hỗ trợ, kèm con gái 90 phút, bố mẹ chỉ xem',
            phut: 45, phutGhiChu: 'một lần, có người làm cùng',
            ruiRo: 'Bố mẹ thấy phần mềm đòi nhập quá nhiều thứ cho từng loại cá khô, nước mắm — mỗi loại một giá, một đơn vị tính — nên đòi dừng ngay buổi đầu vì "gõ còn lâu hơn ghi sổ".',
            phongNgua: 'Chỉ cho con gái nhập 5–7 mặt bán chạy nhất trước, phần còn lại để sau; ai khai thác kênh nào thì chỉ nhập mặt của kênh đó.' },
      M2: { congCu: 'Bán quầy quét mã phát hành hoá đơn từ máy tính tiền; đơn sàn tự về; tồn kho một con số dùng chung ba kênh; nhắc công nợ khách sạn',
            aiCai: 'Không phải cài thêm', aiDaoTao: 'Cán bộ ghé lại 2 lần trong tháng đầu',
            phut: 8, phutGhiChu: 'mỗi ngày — quét mã khoảng 10 giây một đơn, cuối ngày soát 5 phút',
            ruiRo: 'Khách sạn, nhà hàng đang quen nhận hàng qua điện thoại, giấy tay; nếu nhập đơn vào phần mềm chậm hơn gọi điện thì con gái sẽ bỏ phần mềm sau hai tuần bận mùa khách.',
            phongNgua: 'Đặt mục tiêu chỉ nhập đơn khách sạn vào cuối ngày, không bắt nhập ngay khi nhận máy; kèm nhắc việc này vào buổi giao hàng định kỳ hằng tuần.' },
      M3: { congCu: 'Đường kê khai 5 bước trên điện thoại; hệ thống soát trước hoá đơn chưa truyền; dẫn sang ứng dụng thuế điện tử để hộ tự bấm nộp; chụp lại mã biên nhận',
            aiCai: '—', aiDaoTao: 'Chuyên viên nghiệp vụ thuế lưu động ngồi cùng tại cơ sở',
            phut: 25, phutGhiChu: 'một lần trong kỳ',
            ruiRo: 'Đến kỳ kê khai, hộ lo sợ số liệu trên phần mềm khác sổ tay sẽ bị phạt nên muốn quay về ghi tay cho "ổn".',
            phongNgua: 'Trước kỳ kê khai, cán bộ hỗ trợ ngồi đối chiếu số phần mềm với sổ tay cho hộ kiểm tra chính họ, sai ở đâu sửa ở đấy, hộ phải tự thấy hai bên khớp mới yên tâm.' },
      M4: { congCu: 'Thêm hai sàn; hồ sơ an toàn thực phẩm và truy xuất theo lô để vào danh sách nhà cung cấp của khu nghỉ dưỡng; báo cáo kênh nào lãi hơn',
            aiCai: '—', aiDaoTao: 'Tự chủ; hỗ trợ theo yêu cầu',
            phut: 6, phutGhiChu: 'mỗi ngày',
            ruiRo: 'Sau một năm nếu hộ không thấy phần mềm giúp bán được thêm hay thu tiền nhanh hơn, họ sẽ coi đó là việc thừa của con gái và cho dừng.',
            phongNgua: 'Cuối năm in ra cho bố mẹ xem vài con số đơn giản: bao nhiêu khách mua lại, kênh nào lãi hơn; có con số đứng bằng tiền thì hộ mới tiếp tục.' },
    },
    cd2: {
      M1: { congCu: 'Khai 4 phòng, 2 cano với số chỗ từng chuyến, khung giờ suất lặn; dựng 2 gói trọn gói; nối Zalo và một nền tảng đặt phòng; dán mã QR ở 4 điểm',
            aiCai: 'Cán bộ hỗ trợ địa bàn đến tận cơ sở', aiDaoTao: 'Cán bộ hỗ trợ, kèm con trai 2 giờ',
            phut: 60, phutGhiChu: 'một lần — nhiều tài nguyên nên lâu hơn',
            ruiRo: 'Bố quản thuyền không cầm máy tính bảng được, lại thấy phải khai thuyền, lịch chạy, chỗ ngồi cho từng khách là quá rối, nên bảo con trai "cứ gọi điện cho khách như cũ".',
            phongNgua: 'Thiết lập chỉ cần con trai một người nhập, bố chỉ nhìn lịch trên màn hình treo ở quán; không bắt bố mẹ thao tác gì trong tháng đầu.' },
      M2: { congCu: 'Nhận đặt chỗ theo khung giờ, hệ thống chặn trùng và chặn vượt số chỗ; doanh thu 4 điểm QR hợp nhất về một màn hình; trợ lý trả khách ngoài giờ',
            aiCai: 'Không phải cài thêm', aiDaoTao: 'Cán bộ ghé lại 2 lần, nhắn kiểm tra mỗi 3 ngày',
            phut: 12, phutGhiChu: 'mỗi ngày — chủ yếu là xác nhận đặt chỗ',
            ruiRo: 'Mùa vắng khách, ít đơn nên quên nhập, tới khi có khách phàn nàn xếp lịch chạy thuyền chồng chéo thì đổ lỗi cho phần mềm và bỏ hẳn.',
            phongNgua: 'Cứ 3 ngày một lần, người hỗ trợ nhắn tin hỏi con trai một câu ngắn xem đã nhập đủ lịch chạy chưa, thay vì để tự nhớ.' },
      M3: { congCu: 'Kê khai với doanh thu mùa vụ: xem doanh thu 12 tháng, thuế tạm tính luỹ kế, nhắc để dành từ trong mùa; xuất hoá đơn khách đoàn ngay tại bến',
            aiCai: '—', aiDaoTao: 'Chuyên viên nghiệp vụ thuế lưu động',
            phut: 30, phutGhiChu: 'một lần trong kỳ',
            ruiRo: 'Doanh thu mùa vụ chênh nhau lớn, kỳ kê khai đầu tiên rơi vào mùa vắng nên hộ hoảng khi thấy doanh thu thấp mà vẫn phải nộp chi phí phần mềm, muốn huỷ hợp đồng.',
            phongNgua: 'Bấm cho hộ thấy chi phí phần mềm nhỏ so với một ngày cao điểm mùa trước; nếu vẫn lưỡng lự thì xin được tạm khoá tài khoản đến mùa khách thay vì để hộ bỏ hẳn.' },
      M4: { congCu: 'Lên nền tảng đặt phòng thứ hai; ký hợp đồng công ty lữ hành có hoá đơn; dùng dữ liệu mùa để canh giá theo mùa',
            aiCai: '—', aiDaoTao: 'Tự chủ; hỗ trợ theo yêu cầu',
            phut: 10, phutGhiChu: 'mỗi ngày',
            ruiRo: 'Sau một năm, nếu khách đặt qua mạng xã hội vẫn chiếm gần hết thì con trai sẽ thấy phần mềm chỉ là việc nhập lại cho có, dần bỏ nhập rồi hệ thống chết.',
            phongNgua: 'Giúp con trai dùng dữ liệu một năm để canh giá dịch vụ theo mùa, đấy là cái lợi nhìn thấy được; đồng thời chỉ nhập đơn gộp mỗi ngày để không quá sức.' },
    },
    cd3: {
      M1: { congCu: 'Cài ứng dụng; khai 4 mặt hàng; dựng mẫu bảng kê thu mua; nối một sàn và kênh phát trực tiếp; khai 2 doanh nghiệp chế biến đang bán',
            aiCai: 'Cán bộ hỗ trợ địa bàn đến tận kho', aiDaoTao: 'Cán bộ hỗ trợ CÙNG chuyên viên nghiệp vụ thuế — vì bài toán chứng từ đầu vào',
            phut: 40, phutGhiChu: 'một lần',
            ruiRo: 'Thu mua từ nông dân nhỏ lẻ không có hoá đơn, hộ thấy phần mềm bắt khai nguồn hàng mà không biết ghi thế nào cho đúng, sợ sai bị phạt nên muốn dừng ngay.',
            phongNgua: 'Buổi thiết lập phải có người hiểu thuế nông sản hướng dẫn cụ thể cách ghi thu mua không hoá đơn, ghi mẫu câu vào sổ tay cho con trai tra cứu, không để hộ tự đoán.' },
      M2: { congCu: 'Lập bảng kê ngay tại vườn, chụp ảnh biên nhận, chạy được khi mất mạng rồi tự đồng bộ; mỗi lượt mua thành một lô truy xuất được',
            aiCai: 'Không phải cài thêm', aiDaoTao: 'Kiểm qua điện thoại mỗi tuần một lần trong mùa thu mua',
            phut: 10, phutGhiChu: 'mỗi ngày — khoảng 90 giây một lượt thu mua',
            ruiRo: 'Mùa thu mua, con trai chạy xe đi mua khắp vùng, điện thoại yếu, sóng chập chờn nên không nhập được tại chỗ, về nhà thì quên hết số liệu.',
            phongNgua: 'Hướng dẫn cách ghi giấy tay theo mẫu có sẵn rồi nhập gộp buổi tối khi có wifi; kiểm tra qua điện thoại mỗi tuần một lần trong mùa thu mua.' },
      M3: { congCu: 'Hệ thống chặn khoá kỳ khi bảng kê còn thiếu giấy tờ; xuất bảng đối chiếu cho doanh nghiệp chế biến; hoá đơn bán gắn đúng lô đã mua',
            aiCai: '—', aiDaoTao: 'Chuyên viên nghiệp vụ thuế lưu động — kỳ này là kỳ khó nhất trong ba chân dung',
            phut: 35, phutGhiChu: 'một lần trong kỳ — nhiều bảng kê nên lâu hơn',
            ruiRo: 'Kỳ kê khai đầu tiên, doanh nghiệp mua cà phê đòi đối chiếu khớp số liệu mà bảng của hộ làm thủ công không khớp phần mềm, hộ mất niềm tin ngay.',
            phongNgua: 'Trước khi giao hàng cho doanh nghiệp, người hỗ trợ cùng con trai xuất bảng đối chiếu và so với số người mua yêu cầu, sửa lệch trước khi gửi.' },
      M4: { congCu: 'Bán lẻ qua phát trực tiếp; truy xuất lô cho chuỗi; dùng dữ liệu một năm để canh vốn thu mua theo tháng',
            aiCai: '—', aiDaoTao: 'Tự chủ; hỗ trợ theo yêu cầu',
            phut: 8, phutGhiChu: 'mỗi ngày',
            ruiRo: 'Sau một năm, giá nông sản lên xuống mạnh, hộ thấy phần mềm không "bán hộ" được gì trên mạng nên cho rằng vô ích, chỉ giữ bán online bằng cách cũ.',
            phongNgua: 'Cho con trai dùng dữ liệu một năm để biết tháng nào nên rút tiền thu mua mạnh, tháng nào giữ lại; lợi ích phải là tiền trong mùa thu mua, không phải bài giới thiệu.' },
    },
  };

  /* ═════════════ KỊCH BẢN DEMO (VI.1(e)) ════════════════════════════════ */

  const DEMO = {
    ten: 'Đề xuất nội dung trình diễn tại phiên đối thoại',
    doDai: '20 phút, trong đó 12 phút để hội đồng TỰ TAY bấm',
    nguyenTac: 'Không trình bày slide. Mở ứng dụng trên điện thoại của thành viên hội đồng và để họ tự thử những việc mà một mockup dựng sẵn không làm được.',
    buoc: [
      { phut: '0–2', ten: 'Hội đồng mở ứng dụng trên điện thoại CỦA MÌNH', tuTay: true,
        chungMinh: 'Ràng buộc IV.4 — nghiệp vụ làm trọn trên điện thoại, không cần máy tính',
        lam: 'Quét mã, mở ứng dụng, chọn chân dung 1. Đổi sang chế độ đơn giản để thấy màn dành cho bố mẹ lớn tuổi.' },
      { phut: '2–5', ten: 'Bán hàng khi MẤT MẠNG', tuTay: true,
        chungMinh: 'IV.4 — bán hàng hoạt động khi mất kết nối và tự đồng bộ khi có mạng lại',
        lam: 'Hội đồng tự bật chế độ máy bay. Bán 2 đơn tại quầy, phát hành hoá đơn từ máy tính tiền. Xem hàng đợi đồng bộ tăng. Tắt chế độ máy bay, xem hàng đợi tự rút và hoá đơn nhận mã cơ quan thuế.' },
      { phut: '5–8', ten: 'Tồn kho ba kênh — thử bán quá hàng', tuTay: true,
        chungMinh: 'Chân dung 1 — tồn kho đồng bộ realtime giữa ba kênh để không nhận đơn quá lượng hàng',
        lam: 'Xem còn bao nhiêu mực khô. Đặt một đơn trên kênh sàn vượt số còn lại. Hệ thống chặn và nói rõ còn bao nhiêu, đơn nào đang giữ chỗ.' },
      { phut: '8–11', ten: 'Chứng từ đầu vào khi mua của nông dân', tuTay: true,
        chungMinh: 'Chân dung 3 — bài toán kế toán khó nhất, không nhà cung cấp đại trà nào giải',
        lam: 'Chuyển sang chân dung 3. Lập một bảng kê thu mua cà phê tại vườn, cố tình bỏ trống số giấy tờ người bán. Hệ thống chặn khoá kỳ và chỉ đúng chỗ thiếu. Bổ sung rồi xem lượt mua thành một lô. Mở hoá đơn bán cho doanh nghiệp chế biến, bấm truy xuất — ra tới tên nông dân và bảng kê gốc.' },
      { phut: '11–14', ten: 'Đặt chỗ trùng chuyến đã đầy', tuTay: true,
        chungMinh: 'Chân dung 2 — giới hạn số chỗ trên từng chuyến, lịch tập trung chống trùng đặt',
        lam: 'Chuyển sang chân dung 2. Cano 1 khung 07:30 ngày 18/08 đã đầy 12/12. Hội đồng tự đặt thêm — bị chặn, kèm lý do và số chỗ còn lại của khung khác. Xem doanh thu 4 điểm QR hợp nhất về một màn hình.' },
      { phut: '14–17', ten: 'Hỏi trợ lý bằng câu của mình', tuTay: true,
        chungMinh: 'IV.5 — trợ lý hai lớp; và chứng minh câu trả lời TÍNH từ dữ liệu chứ không đọc chuỗi dựng sẵn',
        lam: 'Hội đồng tự hỏi: "thuế tạm tính quý này bao nhiêu", "còn bao nhiêu ngày đến hạn kê khai". Trợ lý trả lời kèm phần "tính từ đâu" để đối chiếu. Rồi hỏi câu nghiệp vụ để thấy Lớp B trả lời theo bộ nội dung có dấu phê duyệt và dẫn nguồn. Rồi hỏi một câu ngoài phạm vi để thấy hệ thống chuyển người thật kèm đồng hồ phản hồi.' },
      { phut: '17–20', ten: 'Cổng Chương trình — tự tính tiền tỉnh phải trả', tuTay: false,
        chungMinh: 'IV.7 ba cửa thanh toán theo kích hoạt thật · IV.8 chỉ số liệu tổng hợp và ranh giới dữ liệu cá nhân',
        lam: 'Mở cổng Chương trình. Ba cửa của từng hộ: đã cài, đã phát hành hoá đơn đầu tiên, còn giao dịch sau 90 ngày. Hệ thống tự tính số tiền Chương trình phải trả theo kết quả — và tự trừ phần không đạt cửa. Xem ranh giới ĐƯỢC XEM và KHÔNG ĐƯỢC XEM.' },
    ],
    khongDemo: [
      'Không demo console 17 màn của bản cũ — hội đồng mở điện thoại trước.',
      'Không đọc slide kiến trúc. Kiến trúc nằm trong hồ sơ, phiên đối thoại để bấm.',
    ],
  };

  SM.prog = { GIA, tinhGia, DOI_THU, tinhKiotVietNam, CHONG_LAN, NGHE, DINH_MUC, CHI_SO_SONG, MO_HINH_GIA, MOC, HANH_TRINH, DEMO };
})(window);
