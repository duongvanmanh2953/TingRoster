'use client';

import React from 'react';
import { formatVND, numberToVietnameseWords, formatDateVN, formatDateTimeVN } from '@/lib/utils';
import { Printer, Download, X, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { printViaIsolatedIframe, generateReceipt01TTHtml } from '@/lib/printUtils';

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
  paymentMethod: 'VIETQR' | 'CASH' | 'BANK_TRANSFER';
  bankRef: string;
  invoiceCode: string;
  confirmedAt: string;
  lineItems?: Array<{
    name: string;
    qty: number;
    unit?: string;
    unitPrice: number;
    total: number;
    note?: string;
  }>;
}

interface LegalPrintableDocumentProps {
  data: PrintableReceiptData;
  mode?: 'RECEIPT_01_TT' | 'STATEMENT' | 'BOTH';
  onClose?: () => void;
}

export function LegalPrintableDocument({
  data,
  mode = 'RECEIPT_01_TT',
  onClose,
}: LegalPrintableDocumentProps) {
  const handlePrint = () => {
    const html = generateReceipt01TTHtml(data);
    printViaIsolatedIframe(html, `Phieu-Thu-${data.receiptNumber}`);
  };

  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  const wordsAmount = numberToVietnameseWords(data.amount);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:static print:bg-white print:overflow-visible">
      {/* Outer Shell for Screen Preview */}
      <div className="bg-slate-100 dark:bg-[#0B0F19] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden print:w-full print:max-w-none print:shadow-none print:rounded-none print:bg-white">
        
        {/* Screen Controls Header (Hidden on Print) */}
        <div className="no-print p-4 bg-white dark:bg-[#111726] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-[#2538D9] dark:bg-indigo-950 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Bản In Chuẩn Mẫu 01 - TT (Bộ Tài Chính) & Bảng Kê Kế Toán
              </h2>
              <span className="text-[11px] text-slate-500">
                Tuân thủ quy chuẩn kế toán Thông tư 200/2014/TT-BTC & Thông tư 133/2016/TT-BTC
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay (Khổ A4/A5 Chuẩn)</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Area - Formatted Strictly for Vietnamese Legal Paperwork */}
        <div className="p-4 sm:p-8 max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 flex justify-center">
          <div
            className="printable-document bg-white !text-black p-8 sm:p-12 rounded-xl shadow-2xl border border-slate-200 max-w-[210mm] w-full text-[13px] leading-relaxed"
            style={{ fontFamily: '"Times New Roman", Times, "Liberation Serif", serif', color: '#000000', backgroundColor: '#FFFFFF' }}
          >
            
            {/* ========================================================= */}
            {/* LIÊN 1: LƯU TẠI CƠ SỞ (MẪU 01 - TT) */}
            {/* ========================================================= */}
            <div className="avoid-break space-y-4 pb-8 border-b-2 border-dashed border-slate-400">
              {/* Header: Đơn vị & Mẫu số Bộ Tài Chính */}
              <div className="grid grid-cols-12 gap-2 text-xs">
                <div className="col-span-7 space-y-0.5">
                  <div className="font-bold uppercase text-[13px]">{data.groupName}</div>
                  <div>Địa chỉ: {data.facilityAddress || 'Hà Nội / TP. Hồ Chí Minh'}</div>
                  <div>Điện thoại: {data.facilityPhone || '0987 654 321'}</div>
                  {data.taxCode && <div>MST / Mã cơ sở: {data.taxCode}</div>}
                </div>

                <div className="col-span-5 text-right space-y-0.5">
                  <div className="font-bold">Mẫu số: 01 - TT</div>
                  <div className="text-[11px] italic">
                    (Ban hành theo TT số 200/2014/TT-BTC
                    <br />
                    ngày 22/12/2014 của Bộ Tài chính)
                  </div>
                  <div className="pt-1 font-mono">
                    Số phiếu: <strong>{data.receiptNumber}</strong>
                  </div>
                  <div className="text-[11px]">Quyển số: 01/2026</div>
                </div>
              </div>

              {/* Title Header */}
              <div className="text-center pt-2 pb-1 space-y-0.5">
                <h1 className="text-lg font-bold uppercase">PHIẾU THU TIỀN</h1>
                <div className="text-xs italic font-sans">
                  Ngày {day} tháng {month} năm {year}
                </div>
                <div className="text-[11px] font-sans font-semibold text-slate-600 print:text-black">
                  (Liên 1: Lưu tại cơ sở)
                </div>
              </div>

              {/* Body Details */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-baseline">
                  <span className="w-44 shrink-0 font-semibold">Họ và tên người nộp tiền:</span>
                  <span className="font-bold uppercase text-[13.5px] border-b border-dotted border-slate-400 flex-1 pb-0.5">
                    {data.payerName}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="w-44 shrink-0 font-semibold">Địa chỉ / SĐT liên hệ:</span>
                  <span className="border-b border-dotted border-slate-400 flex-1 pb-0.5">
                    {data.payerPhone || data.payerAddress || 'Theo hồ sơ học viên đã đăng ký'}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="w-44 shrink-0 font-semibold">Lý do nộp tiền:</span>
                  <span className="border-b border-dotted border-slate-400 flex-1 pb-0.5 font-medium">
                    {data.itemDescription}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="w-44 shrink-0 font-semibold">Số tiền nộp (bằng số):</span>
                  <span className="font-bold text-sm font-mono border-b border-dotted border-slate-400 flex-1 pb-0.5">
                    {formatVND(data.amount)}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="w-44 shrink-0 font-semibold">Số tiền (viết bằng chữ):</span>
                  <span className="italic font-bold border-b border-dotted border-slate-400 flex-1 pb-0.5">
                    {wordsAmount}.
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="w-44 shrink-0 font-semibold">Kèm theo:</span>
                  <span className="border-b border-dotted border-slate-400 flex-1 pb-0.5 font-mono text-xs">
                    01 Chứng từ gốc (Mã GD VietQR: {data.invoiceCode} • Tham chiếu: {data.bankRef})
                  </span>
                </div>
              </div>

              {/* Signatures Block (4 Columns) */}
              <div className="pt-6 grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <div className="font-bold">Thủ trưởng cơ sở</div>
                  <div className="text-[10px] italic">(Ký, họ tên, đóng dấu)</div>
                  <div className="h-16 flex items-end justify-center font-bold text-[11px]">
                    Thầy Nguyễn Văn Tuấn
                  </div>
                </div>

                <div>
                  <div className="font-bold">Kế toán trưởng</div>
                  <div className="text-[10px] italic">(Ký, họ tên)</div>
                  <div className="h-16 flex items-end justify-center font-bold text-[11px]">
                    Kế toán TingRoster
                  </div>
                </div>

                <div>
                  <div className="font-bold">Người nộp tiền</div>
                  <div className="text-[10px] italic">(Ký, họ tên)</div>
                  <div className="h-16 flex items-end justify-center font-bold text-[11px]">
                    {data.payerName}
                  </div>
                </div>

                <div>
                  <div className="font-bold">Người lập phiếu</div>
                  <div className="text-[10px] italic">(Ký, họ tên)</div>
                  <div className="h-16 flex items-end justify-center font-bold text-[11px]">
                    Hệ thống tự động
                  </div>
                </div>
              </div>

              {/* Receipt Footer & Legal Statement */}
              <div className="pt-3 border-t border-slate-200 print:border-slate-400 flex items-center justify-between text-[10px] italic text-slate-500 print:text-black">
                <span>
                  * Chứng từ nội bộ phục vụ hạch toán, không thay thế hóa đơn GTGT điện tử (Nghị định 123/2020/NĐ-CP).
                </span>
                <span className="font-mono">Thời gian gạch nợ: {data.confirmedAt}</span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* LIÊN 2: GIAO CHO NGƯỜI NỘP (DÙNG ĐỂ THANH TOÁN CÔNG TÁC PHÍ) */}
            {/* ========================================================= */}
            <div className="avoid-break space-y-4 pt-8">
              {/* Header: Đơn vị & Mẫu số Bộ Tài Chính */}
              <div className="grid grid-cols-12 gap-2 text-xs">
                <div className="col-span-7 space-y-0.5">
                  <div className="font-bold uppercase text-[13px]">{data.groupName}</div>
                  <div>Địa chỉ: {data.facilityAddress || 'Hà Nội / TP. Hồ Chí Minh'}</div>
                  <div>Điện thoại: {data.facilityPhone || '0987 654 321'}</div>
                </div>

                <div className="col-span-5 text-right space-y-0.5">
                  <div className="font-bold">Mẫu số: 01 - TT</div>
                  <div className="text-[11px] italic">
                    (Ban hành theo TT số 200/2014/TT-BTC của BTC)
                  </div>
                  <div className="pt-1 font-mono">
                    Số phiếu: <strong>{data.receiptNumber}</strong>
                  </div>
                </div>
              </div>

              {/* Title Header */}
              <div className="text-center pt-2 pb-1 space-y-0.5">
                <h2 className="text-lg font-bold uppercase">GIẤY BIÊN NHẬN NỘP TIỀN</h2>
                <div className="text-xs italic font-sans">
                  Ngày {day} tháng {month} năm {year}
                </div>
                <div className="text-[11px] font-sans font-bold text-emerald-700 print:text-black">
                  (Liên 2: Giao cho người nộp tiền làm bằng chứng thanh toán)
                </div>
              </div>

              {/* Body Details */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-baseline">
                  <span className="w-44 shrink-0 font-semibold">Họ và tên người nộp tiền:</span>
                  <span className="font-bold uppercase text-[13.5px] border-b border-dotted border-slate-400 flex-1 pb-0.5">
                    {data.payerName}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="w-44 shrink-0 font-semibold">Nội dung nộp tiền:</span>
                  <span className="border-b border-dotted border-slate-400 flex-1 pb-0.5 font-medium">
                    {data.itemDescription}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="w-44 shrink-0 font-semibold">Số tiền nộp (bằng số):</span>
                  <span className="font-bold text-sm font-mono border-b border-dotted border-slate-400 flex-1 pb-0.5 text-emerald-700 print:text-black">
                    {formatVND(data.amount)}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="w-44 shrink-0 font-semibold">Số tiền (viết bằng chữ):</span>
                  <span className="italic font-bold border-b border-dotted border-slate-400 flex-1 pb-0.5">
                    {wordsAmount}.
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="w-44 shrink-0 font-semibold">Hình thức thanh toán:</span>
                  <span className="border-b border-dotted border-slate-400 flex-1 pb-0.5">
                    Chuyển khoản VietQR Napas 247 (Đối soát tự động qua ngân hàng)
                  </span>
                </div>
              </div>

              {/* Signatures Block (3 Columns for Member Copy) */}
              <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="font-bold">Đại diện cơ sở đào tạo</div>
                  <div className="text-[10px] italic">(Ký, họ tên, đóng dấu)</div>
                  <div className="h-14 flex items-end justify-center font-bold text-[11px]">
                    Thầy Nguyễn Văn Tuấn
                  </div>
                </div>

                <div>
                  <div className="font-bold">Thủ quỹ / Kế toán</div>
                  <div className="text-[10px] italic">(Ký, ghi rõ họ tên)</div>
                  <div className="h-14 flex items-end justify-center font-bold text-[11px]">
                    Đã thu đủ tiền
                  </div>
                </div>

                <div>
                  <div className="font-bold">Người nộp tiền</div>
                  <div className="text-[10px] italic">(Ký, ghi rõ họ tên)</div>
                  <div className="h-14 flex items-end justify-center font-bold text-[11px]">
                    {data.payerName}
                  </div>
                </div>
              </div>

              {/* Bottom Verification Note */}
              <div className="pt-3 border-t border-slate-200 print:border-slate-400 flex items-center justify-between text-[10px] italic text-slate-500 print:text-black">
                <span>
                  Xác thực chứng từ điện tử qua hệ thống TingRoster.vn • Mã đối soát: {data.invoiceCode}
                </span>
                <span className="font-mono">Ngày in: {formatDateTimeVN(today)}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
