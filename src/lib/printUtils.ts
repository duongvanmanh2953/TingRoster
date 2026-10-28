import { formatVND, numberToVietnameseWords, formatDateVN, formatDateTimeVN } from './utils';

export interface PrintableReceiptData {
  receiptNumber: string;
  groupName: string;
  facilityAddress?: string;
  facilityPhone?: string;
  taxCode?: string;
  payerName: string;
  payerPhone?: string;
  payerAddress?: string;
  amount: number;
  itemDescription: string;
  paymentMethod?: 'VIETQR' | 'CASH' | 'BANK_TRANSFER';
  bankRef?: string;
  invoiceCode?: string;
  confirmedAt?: string;
  lineItems?: Array<{
    name: string;
    qty: number;
    unit?: string;
    unitPrice: number;
    total: number;
    note?: string;
  }>;
}

export interface PrintableReconciliationData {
  reportTitle?: string;
  facilityName?: string;
  periodText?: string;
  items: Array<{
    id: string;
    transactionCode: string;
    date: string;
    payerName: string;
    groupName: string;
    content: string;
    amount: number;
    provider: string;
    status: 'MATCHED' | 'UNMATCHED';
  }>;
}

/**
 * In tài liệu qua Iframe cô lập hoàn toàn:
 * - Không chịu ảnh hưởng bởi dark mode / Tailwind CSS / backdrop của web
 * - Áp dụng 100% phông chữ Times New Roman theo tiêu chuẩn văn bản hành chính NĐ 30/2020/NĐ-CP
 * - Không lệch dấu tiếng Việt, không nhòe mực, độ sắc nét cao
 */
export function printViaIsolatedIframe(htmlContent: string, documentTitle: string = 'In Chứng Từ Kế Toán') {
  if (typeof window === 'undefined') return;

  const existingIframe = document.getElementById('tingroster-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'tingroster-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <title>${documentTitle}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 15mm 10mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #ffffff !important;
          color: #000000 !important;
          font-family: "Times New Roman", "Liberation Serif", Times, serif !important;
          font-size: 12.5pt;
          line-height: 1.35;
          letter-spacing: 0.01em;
        }
        .container {
          width: 100%;
          max-width: 190mm;
          margin: 0 auto;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .font-semibold { font-weight: 600; }
        .italic { font-style: italic; }
        .uppercase { text-transform: uppercase; }
        
        .header-grid {
          display: table;
          width: 100%;
          margin-bottom: 8px;
        }
        .header-col-left {
          display: table-cell;
          width: 58%;
          vertical-align: top;
          font-size: 11pt;
          line-height: 1.3;
        }
        .header-col-right {
          display: table-cell;
          width: 42%;
          vertical-align: top;
          text-align: right;
          font-size: 11pt;
          line-height: 1.3;
        }
        
        .title-block {
          text-align: center;
          margin: 10px 0 14px 0;
        }
        .title-main {
          font-size: 16pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin: 0;
        }
        .title-sub {
          font-size: 11.5pt;
          font-style: italic;
          margin-top: 2px;
        }
        .title-lien {
          font-size: 11pt;
          font-weight: bold;
          margin-top: 2px;
        }
        
        .info-row {
          display: flex;
          align-items: baseline;
          margin-bottom: 5px;
          font-size: 12pt;
        }
        .info-label {
          font-weight: 600;
          white-space: nowrap;
          padding-right: 6px;
        }
        .info-dots {
          flex: 1;
          border-bottom: 1px dotted #333333;
          padding-bottom: 1px;
          min-height: 16px;
        }
        .amount-num {
          font-weight: bold;
          font-size: 13pt;
        }
        
        .sign-grid {
          display: table;
          width: 100%;
          margin-top: 14px;
          text-align: center;
          font-size: 11pt;
        }
        .sign-col-5 {
          display: table-cell;
          width: 20%;
          vertical-align: top;
          padding: 0 4px;
        }
        .sign-col-3 {
          display: table-cell;
          width: 33.33%;
          vertical-align: top;
          padding: 0 8px;
        }
        .sign-title {
          font-weight: bold;
          font-size: 11pt;
          margin-bottom: 2px;
        }
        .sign-sub {
          font-size: 9.5pt;
          font-style: italic;
          color: #444444;
        }
        .sign-space {
          height: 52px;
        }
        .sign-name {
          font-weight: bold;
          font-size: 10.5pt;
        }
        
        .cut-line {
          border-top: 1px dashed #666666;
          margin: 18px 0;
          position: relative;
          text-align: center;
        }
        .cut-badge {
          display: inline-block;
          background: #ffffff;
          padding: 0 10px;
          font-size: 9pt;
          font-style: italic;
          color: #666666;
          position: relative;
          top: -8px;
        }
        
        .legal-footer {
          margin-top: 10px;
          padding-top: 4px;
          border-top: 0.5px solid #cccccc;
          font-size: 8.5pt;
          font-style: italic;
          color: #555555;
          display: flex;
          justify-content: space-between;
        }

        /* Quy tắc phân trang nhiều trang cho bảng biểu và báo cáo kế toán */
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
        tr {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        h1, h2, h3, .title-block {
          break-after: avoid;
          page-break-after: avoid;
        }
        .sign-grid {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .legal-footer {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* Bảng kê chi tiết kế toán */
        table.accounting-table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
          font-size: 11pt;
        }
        table.accounting-table th,
        table.accounting-table td {
          border: 1px solid #000000;
          padding: 5px 8px;
        }
        table.accounting-table th {
          background-color: #f2f2f2;
          font-weight: bold;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${htmlContent}
      </div>
    </body>
    </html>
  `);
  doc.close();

  // Đợi font và ảnh render hoàn tất rồi gọi hộp thoại in của hệ điều hành
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      iframe.remove();
    }, 2000);
  }, 250);
}

/**
 * Tạo nội dung HTML chuẩn Mẫu số 01 - TT: Phiếu Thu
 * (Ban hành theo Thông tư số 200/2014/TT-BTC & TT 133/2016/TT-BTC của Bộ Tài chính)
 */
export function generateReceipt01TTHtml(data: PrintableReceiptData): string {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  const wordsAmount = numberToVietnameseWords(data.amount);

  return `
    <!-- ================= LIÊN 1: LƯU TẠI QUỸ ================= -->
    <div style="page-break-inside: avoid;">
      <div class="header-grid">
        <div class="header-col-left">
          <div class="font-bold uppercase" style="font-size: 12pt;">${data.groupName}</div>
          <div>Địa chỉ: ${data.facilityAddress || 'Hà Nội / TP. Hồ Chí Minh'}</div>
          <div>Điện thoại: ${data.facilityPhone || '0987 654 321'}</div>
          ${data.taxCode ? `<div>Mã số thuế / Mã cơ sở: ${data.taxCode}</div>` : ''}
        </div>
        <div class="header-col-right">
          <div class="font-bold">Mẫu số: 01 - TT</div>
          <div class="italic" style="font-size: 9.5pt;">
            (Ban hành theo Thông tư số 200/2014/TT-BTC<br>
            và TT số 133/2016/TT-BTC của Bộ Tài chính)
          </div>
          <div style="margin-top: 3px;">Số phiếu: <strong>${data.receiptNumber}</strong></div>
          <div style="font-size: 9.5pt;">Quyển số: 01/2026</div>
        </div>
      </div>

      <div class="title-block">
        <h1 class="title-main">PHIẾU THU</h1>
        <div class="title-sub">Ngày ${day} tháng ${month} năm ${year}</div>
        <div class="title-lien">(Liên 1: Lưu tại cơ sở)</div>
      </div>

      <div class="info-row">
        <span class="info-label">Họ và tên người nộp tiền:</span>
        <span class="info-dots font-bold uppercase">${data.payerName}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Địa chỉ / Lớp / Phòng:</span>
        <span class="info-dots">${data.payerAddress || data.payerPhone || 'Học viên / Thành viên cơ sở'}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Lý do nộp:</span>
        <span class="info-dots">${data.itemDescription}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Số tiền:</span>
        <span class="info-dots"><strong class="amount-num">${formatVND(data.amount)}</strong></span>
      </div>

      <div class="info-row">
        <span class="info-label">Số tiền (viết bằng chữ):</span>
        <span class="info-dots italic font-bold">${wordsAmount}.</span>
      </div>

      <div class="info-row">
        <span class="info-label">Kèm theo:</span>
        <span class="info-dots">01 Chứng từ gốc (Mã hóa đơn: ${data.invoiceCode || data.receiptNumber}${data.bankRef ? ` • GD Napas 247: ${data.bankRef}` : ''})</span>
      </div>

      <div class="sign-grid">
        <div class="sign-col-5">
          <div class="sign-title">Thủ trưởng đơn vị</div>
          <div class="sign-sub">(Ký, họ tên, đóng dấu)</div>
          <div class="sign-space"></div>
          <div class="sign-name">Ban Quản Lý</div>
        </div>
        <div class="sign-col-5">
          <div class="sign-title">Kế toán trưởng</div>
          <div class="sign-sub">(Ký, họ tên)</div>
          <div class="sign-space"></div>
          <div class="sign-name">Bộ phận Kế toán</div>
        </div>
        <div class="sign-col-5">
          <div class="sign-title">Người nộp tiền</div>
          <div class="sign-sub">(Ký, họ tên)</div>
          <div class="sign-space"></div>
          <div class="sign-name">${data.payerName}</div>
        </div>
        <div class="sign-col-5">
          <div class="sign-title">Người lập phiếu</div>
          <div class="sign-sub">(Ký, họ tên)</div>
          <div class="sign-space"></div>
          <div class="sign-name">Hệ thống TingRoster</div>
        </div>
        <div class="sign-col-5">
          <div class="sign-title">Thủ quỹ</div>
          <div class="sign-sub">(Ký, họ tên)</div>
          <div class="sign-space"></div>
          <div class="sign-name">Đã thu đủ tiền</div>
        </div>
      </div>

      <div class="legal-footer">
        <span>* Chứng từ kế toán nội bộ phục vụ hạch toán theo quy định; không thay thế hóa đơn GTGT điện tử (Nghị định 123/2020/NĐ-CP).</span>
        <span>Thời gian gạch nợ: ${data.confirmedAt || formatDateTimeVN(today)}</span>
      </div>
    </div>

    <!-- ================= ĐƯỜNG CẮT XÉ LIÊN 1 VÀ LIÊN 2 ================= -->
    <div class="cut-line">
      <span class="cut-badge">✂ Cắt theo đường này giao cho người nộp tiền (Liên 2)</span>
    </div>

    <!-- ================= LIÊN 2: GIAO CHO NGƯỜI NỘP ================= -->
    <div style="page-break-inside: avoid;">
      <div class="header-grid">
        <div class="header-col-left">
          <div class="font-bold uppercase" style="font-size: 12pt;">${data.groupName}</div>
          <div>Địa chỉ: ${data.facilityAddress || 'Hà Nội / TP. Hồ Chí Minh'}</div>
          <div>Điện thoại: ${data.facilityPhone || '0987 654 321'}</div>
        </div>
        <div class="header-col-right">
          <div class="font-bold">Mẫu số: 01 - TT</div>
          <div class="italic" style="font-size: 9.5pt;">
            (Ban hành theo Thông tư số 200/2014/TT-BTC)
          </div>
          <div style="margin-top: 3px;">Số phiếu: <strong>${data.receiptNumber}</strong></div>
        </div>
      </div>

      <div class="title-block">
        <h2 class="title-main">GIẤY BIÊN NHẬN NỘP TIỀN</h2>
        <div class="title-sub">Ngày ${day} tháng ${month} năm ${year}</div>
        <div class="title-lien" style="color: #004488;">(Liên 2: Giao cho người nộp tiền làm bằng chứng thanh toán)</div>
      </div>

      <div class="info-row">
        <span class="info-label">Họ và tên người nộp tiền:</span>
        <span class="info-dots font-bold uppercase">${data.payerName}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Nội dung thanh toán:</span>
        <span class="info-dots">${data.itemDescription}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Số tiền đã nộp:</span>
        <span class="info-dots"><strong class="amount-num" style="color: #005500;">${formatVND(data.amount)}</strong></span>
      </div>

      <div class="info-row">
        <span class="info-label">Số tiền (viết bằng chữ):</span>
        <span class="info-dots italic font-bold">${wordsAmount}.</span>
      </div>

      <div class="info-row">
        <span class="info-label">Phương thức thanh toán:</span>
        <span class="info-dots">${data.paymentMethod === 'VIETQR' ? 'Chuyển khoản VietQR Napas 247 (Đối soát tự động qua ngân hàng)' : 'Tiền mặt / Chuyển khoản'}</span>
      </div>

      <div class="sign-grid">
        <div class="sign-col-3">
          <div class="sign-title">Đại diện cơ sở</div>
          <div class="sign-sub">(Ký, họ tên, đóng dấu)</div>
          <div class="sign-space"></div>
          <div class="sign-name">Thầy Nguyễn Văn Tuấn</div>
        </div>
        <div class="sign-col-3">
          <div class="sign-title">Thủ quỹ / Kế toán</div>
          <div class="sign-sub">(Ký, ghi rõ họ tên)</div>
          <div class="sign-space"></div>
          <div class="sign-name">Đã thu đủ tiền</div>
        </div>
        <div class="sign-col-3">
          <div class="sign-title">Người nộp tiền</div>
          <div class="sign-sub">(Ký, ghi rõ họ tên)</div>
          <div class="sign-space"></div>
          <div class="sign-name">${data.payerName}</div>
        </div>
      </div>

      <div class="legal-footer">
        <span>Xác thực giao dịch tự động qua TingRoster.vn • Mã đối soát: ${data.invoiceCode || data.receiptNumber}</span>
        <span>In lúc: ${formatDateTimeVN(today)}</span>
      </div>
    </div>
  `;
}

/**
 * Tạo nội dung HTML chuẩn Báo Cáo Đối Soát Giao Dịch & Sổ Quỹ Kế Toán
 */
export function generateReconciliationReportHtml(data: PrintableReconciliationData): string {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();

  const totalAmount = data.items.reduce((sum, item) => sum + (item.status === 'MATCHED' ? item.amount : 0), 0);
  const matchedCount = data.items.filter((i) => i.status === 'MATCHED').length;
  const wordsAmount = numberToVietnameseWords(totalAmount);

  const rowsHtml = data.items.map((item, index) => `
    <tr>
      <td style="text-align: center;">${index + 1}</td>
      <td style="text-align: center; font-size: 10pt;">${item.date}</td>
      <td style="font-family: monospace; font-size: 10pt;">${item.transactionCode}</td>
      <td><strong>${item.payerName}</strong></td>
      <td>${item.groupName}</td>
      <td>${item.content}</td>
      <td style="text-align: right; font-weight: bold; font-family: monospace;">${formatVND(item.amount)}</td>
      <td style="text-align: center; font-size: 9.5pt;">${item.provider}</td>
      <td style="text-align: center; font-size: 9.5pt; color: #006600; font-weight: bold;">
        ${item.status === 'MATCHED' ? 'Đã khớp' : 'Chờ soát'}
      </td>
    </tr>
  `).join('');

  return `
    <div style="display: table; width: 100%; margin-bottom: 12px;">
      <div style="display: table-cell; width: 50%; vertical-align: top; line-height: 1.3;">
        <div class="font-bold uppercase" style="font-size: 11pt;">${data.facilityName || 'CƠ SỞ GIÁO DỤC & THỂ THAO TINGROSTER'}</div>
        <div style="font-size: 10.5pt;">Bộ phận: Kế toán & Quản trị tài chính</div>
        <div style="font-size: 10pt; color: #444;">Hệ thống đối soát thanh toán tự động VietQR Napas 247</div>
      </div>
      <div style="display: table-cell; width: 50%; vertical-align: top; text-align: center; line-height: 1.3;">
        <div class="font-bold" style="font-size: 11.5pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="font-semibold" style="font-size: 11pt;">Độc lập - Tự do - Hạnh phúc</div>
        <div style="letter-spacing: -2px; color: #000; font-size: 8pt; margin-top: -3px;">─────────────────</div>
        <div class="italic" style="font-size: 10pt; margin-top: 4px;">Hà Nội, ngày ${day} tháng ${month} năm ${year}</div>
      </div>
    </div>

    <div class="title-block" style="margin: 18px 0 16px 0;">
      <h1 class="title-main" style="font-size: 16pt;">${data.reportTitle || 'BÁO CÁO TỔNG HỢP ĐỐI SOÁT GIAO DỊCH VÀ THU PHÍ'}</h1>
      <div class="title-sub" style="font-size: 11pt;">Kỳ đối soát: <strong>${data.periodText || `Tháng ${month}/${year}`}</strong></div>
    </div>

    <div style="margin: 12px 0; font-size: 11pt; line-height: 1.5;">
      <div>• Căn cứ sao kê biến động số dư tài khoản ngân hàng thụ hưởng (VietQR Napas 247).</div>
      <div>• Tổng số món giao dịch thành công: <strong>${matchedCount} / ${data.items.length} món</strong>.</div>
      <div>• Tổng số tiền thực thu: <strong style="font-size: 12pt; color: #005500;">${formatVND(totalAmount)}</strong></div>
      <div>• Bằng chữ: <strong class="italic">${wordsAmount}.</strong></div>
    </div>

    <table class="accounting-table">
      <thead>
        <tr>
          <th style="width: 35px;">STT</th>
          <th style="width: 85px;">Thời gian</th>
          <th style="width: 105px;">Mã ngân hàng</th>
          <th style="width: 120px;">Người nộp</th>
          <th style="width: 95px;">Lớp / Phòng</th>
          <th>Nội dung thanh toán</th>
          <th style="width: 105px;">Số tiền</th>
          <th style="width: 75px;">Kênh</th>
          <th style="width: 75px;">Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr style="font-weight: bold; background-color: #f7f7f7;">
          <td colspan="6" style="text-align: right; padding: 6px 8px;">TỔNG CỘNG THỰC THU:</td>
          <td style="text-align: right; font-family: monospace; font-size: 11.5pt; color: #005500;">${formatVND(totalAmount)}</td>
          <td colspan="2" style="text-align: center;">${matchedCount} món khớp</td>
        </tr>
      </tfoot>
    </table>

    <div class="sign-grid" style="margin-top: 24px;">
      <div class="sign-col-3">
        <div class="sign-title">NGƯỜI LẬP BIỂU</div>
        <div class="sign-sub">(Ký, họ tên)</div>
        <div class="sign-space"></div>
        <div class="sign-name">Kế toán viên</div>
      </div>
      <div class="sign-col-3">
        <div class="sign-title">KẾ TOÁN TRƯỞNG</div>
        <div class="sign-sub">(Ký, họ tên)</div>
        <div class="sign-space"></div>
        <div class="sign-name">Trưởng ban Tài chính</div>
      </div>
      <div class="sign-col-3">
        <div class="sign-title">THỦ TRƯỞNG ĐƠN VỊ</div>
        <div class="sign-sub">(Ký, họ tên, đóng dấu)</div>
        <div class="sign-space"></div>
        <div class="sign-name">Giám đốc / Chủ cơ sở</div>
      </div>
    </div>

    <div class="legal-footer" style="margin-top: 35px;">
      <span>Báo cáo tài chính nội bộ xuất từ hệ thống TingRoster.vn</span>
      <span>Ký điện tử & Đối soát tự động bởi Napas 247 Gateway</span>
    </div>
  `;
}
