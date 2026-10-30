'use client';

import React from 'react';
import { formatVND, numberToVietnameseWords, formatDateVN, formatDateTimeVN } from '@/lib/utils';
import { Printer, Download, X, BarChart3, ShieldCheck } from 'lucide-react';
import { printViaIsolatedIframe, generateReconciliationReportHtml } from '@/lib/printUtils';

export interface ReconciliationReportItem {
  id: string;
  transactionCode: string;
  date: string;
  payerName: string;
  groupName: string;
  content: string;
  amount: number;
  provider: string;
  status: 'MATCHED' | 'UNMATCHED';
}

interface LegalPrintableReconciliationReportProps {
  reportTitle?: string;
  facilityName?: string;
  periodText?: string;
  items: ReconciliationReportItem[];
  onClose?: () => void;
}

export function LegalPrintableReconciliationReport({
  reportTitle = 'BÁO CÁO TỔNG HỢP ĐỐI SOÁT GIAO DỊCH VÀ THU PHÍ',
  facilityName = 'Cơ Sở Giáo Dục & Thể Thao TingRoster',
  periodText = 'Tháng 10/2026',
  items,
  onClose,
}: LegalPrintableReconciliationReportProps) {
  const handlePrint = () => {
    const html = generateReconciliationReportHtml({
      reportTitle,
      facilityName,
      periodText,
      items,
    });
    printViaIsolatedIframe(html, `Bao-Cao-Doi-Soat-${periodText}`);
  };

  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();

  const totalAmount = items.reduce((sum, item) => sum + (item.status === 'MATCHED' ? item.amount : 0), 0);
  const matchedCount = items.filter((i) => i.status === 'MATCHED').length;
  const wordsAmount = numberToVietnameseWords(totalAmount);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:static print:bg-white print:overflow-visible">
      <div className="bg-slate-100 dark:bg-[#0B0F19] rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden print:w-full print:max-w-none print:shadow-none print:rounded-none print:bg-white">
        
        {/* Screen Controls Header (Hidden on Print) */}
        <div className="no-print p-4 bg-white dark:bg-[#111726] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-black-50 text-[#2538D9] dark:bg-black-950 dark:text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Bản In Báo Cáo Đối Soát Tài Chính Kế Toán
              </h2>
              <span className="text-[11px] text-slate-500">
                Mẫu báo cáo tổng hợp thu chi định kỳ phục vụ kiểm toán nội bộ và cơ quan thuế
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Báo Cáo (A4 Ngang/Dọc)</span>
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

        {/* Printable Area */}
        <div className="p-4 sm:p-8 max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 flex justify-center">
          <div
            className="printable-document bg-white !text-black p-8 sm:p-12 rounded-xl shadow-2xl border border-slate-200 max-w-[210mm] w-full text-[12.5px] leading-relaxed"
            style={{ fontFamily: '"Times New Roman", Times, "Liberation Serif", serif', color: '#000000', backgroundColor: '#FFFFFF' }}
          >
            
            {/* National Header / Facility Header */}
            <div className="grid grid-cols-12 gap-2 pb-4 border-b border-slate-300 print:border-black text-xs">
              <div className="col-span-6 space-y-0.5">
                <div className="font-bold uppercase text-[13px]">{facilityName}</div>
                <div>Đơn vị: Bộ phận Quản lý & Thu học phí / Tiền phòng</div>
                <div>Địa chỉ: Hà Nội / TP. Hồ Chí Minh</div>
              </div>

              <div className="col-span-6 text-center space-y-0.5">
                <div className="font-bold uppercase text-[12px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="font-bold underline text-[11px]">Độc lập - Tự do - Hạnh phúc</div>
                <div className="text-[11px] italic pt-1">
                  Ngày {day} tháng {month} năm {year}
                </div>
              </div>
            </div>

            {/* Report Title */}
            <div className="text-center py-5 space-y-1">
              <h1 className="text-xl font-bold uppercase">{reportTitle}</h1>
              <div className="text-xs font-semibold font-sans text-slate-700 print:text-black">
                Kỳ đối soát: {periodText} (Từ ngày 01/{month}/{year} đến ngày {day}/{month}/{year})
              </div>
              <div className="text-[11px] italic text-slate-500 print:text-black">
                Căn cứ: Dữ liệu sao kê giao dịch ngân hàng VietQR Napas 247 được gạch nợ tự động
              </div>
            </div>

            {/* Reconciliation Table */}
            <div className="pt-2">
              <table className="w-full text-left text-xs border-collapse border border-slate-400 print:border-black">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200 text-center font-bold">
                    <th className="border border-slate-400 print:border-black p-2 w-10">STT</th>
                    <th className="border border-slate-400 print:border-black p-2 w-28">Mã tham chiếu</th>
                    <th className="border border-slate-400 print:border-black p-2 w-24">Thời gian</th>
                    <th className="border border-slate-400 print:border-black p-2">Người nộp / Khách hàng</th>
                    <th className="border border-slate-400 print:border-black p-2">Lớp / Cơ sở</th>
                    <th className="border border-slate-400 print:border-black p-2">Nội dung đối soát</th>
                    <th className="border border-slate-400 print:border-black p-2 text-right w-28">Số tiền (VNĐ)</th>
                    <th className="border border-slate-400 print:border-black p-2 text-center w-24">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="border border-slate-400 print:border-black p-2 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-400 print:border-black p-2 font-mono font-bold text-[11px]">
                        {item.transactionCode}
                      </td>
                      <td className="border border-slate-400 print:border-black p-2 text-center text-[11px]">
                        {item.date}
                      </td>
                      <td className="border border-slate-400 print:border-black p-2 font-bold">
                        {item.payerName}
                      </td>
                      <td className="border border-slate-400 print:border-black p-2">
                        {item.groupName}
                      </td>
                      <td className="border border-slate-400 print:border-black p-2 text-[11px]">
                        {item.content}
                      </td>
                      <td className="border border-slate-400 print:border-black p-2 text-right font-mono font-bold">
                        {formatVND(item.amount)}
                      </td>
                      <td className="border border-slate-400 print:border-black p-2 text-center text-[10px] font-bold">
                        {item.status === 'MATCHED' ? 'ĐỐI SOÁT 100%' : 'CHƯA KHỚP'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 print:bg-slate-200 font-bold">
                    <td colSpan={6} className="border border-slate-400 print:border-black p-2 text-right">
                      TỔNG CỘNG THỰC THU ({matchedCount} GIAO DỊCH):
                    </td>
                    <td className="border border-slate-400 print:border-black p-2 text-right font-mono text-sm font-extrabold">
                      {formatVND(totalAmount)}
                    </td>
                    <td className="border border-slate-400 print:border-black p-2 text-center text-[11px]">
                      Hoàn thành
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Total in Words */}
            <div className="pt-3 pb-2 text-xs">
              <span className="font-semibold">Số tiền viết bằng chữ: </span>
              <span className="font-bold italic">{wordsAmount}.</span>
            </div>

            {/* Signatures Block (3 Columns) */}
            <div
              className="pt-8 grid grid-cols-3 gap-6 text-center text-xs avoid-break"
              style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
            >
              <div>
                <div className="font-bold">Người lập biểu</div>
                <div className="text-[10px] italic">(Ký, ghi rõ họ tên)</div>
                <div className="h-20 flex items-end justify-center font-bold text-[12px]">
                  Hệ thống TingRoster
                </div>
              </div>

              <div>
                <div className="font-bold">Kế toán trưởng / Phụ trách tài chính</div>
                <div className="text-[10px] italic">(Ký, ghi rõ họ tên)</div>
                <div className="h-20 flex items-end justify-center font-bold text-[12px]">
                  Kế toán cơ sở
                </div>
              </div>

              <div>
                <div className="font-bold">Thủ trưởng đơn vị</div>
                <div className="text-[10px] italic">(Ký, họ tên, đóng dấu)</div>
                <div className="h-20 flex items-end justify-center font-bold text-[12px]">
                  Thầy Nguyễn Văn Tuấn
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-6 border-t border-slate-300 print:border-slate-400 flex items-center justify-between text-[10px] italic text-slate-500 print:text-black">
              <span>
                Báo cáo tự động trích xuất từ phần mềm TingRoster.vn • Đảm bảo số liệu toàn vẹn bất biến.
              </span>
              <span className="font-mono">In lúc: {formatDateTimeVN(today)}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
