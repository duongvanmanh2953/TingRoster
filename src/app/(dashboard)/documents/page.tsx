'use client';

import React, { useState } from 'react';
import { formatVND, formatDateVN } from '@/lib/utils';
import {
  FileText,
  Receipt,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import {
  Tabs,
  Tab,
  Button as MuiButton,
  Chip,
  Box,
  Tooltip,
} from '@mui/material';
import { LegalPrintableDocument, PrintableReceiptData } from '@/components/documents/LegalPrintableDocument';
import { LegalPrintableReconciliationReport, ReconciliationReportItem } from '@/components/documents/LegalPrintableReconciliationReport';

interface InternalReceipt {
  id: string;
  receiptNumber: string;
  payerName: string;
  groupName: string;
  amount: number;
  itemDescription: string;
  paymentMethod: 'VIETQR' | 'CASH';
  bankRef: string;
  confirmedAt: string;
  status: 'CONFIRMED' | 'PENDING';
  invoiceCode: string;
}

const MOCK_RECEIPTS: InternalReceipt[] = [
  {
    id: 'rec-1',
    receiptNumber: 'REC-20261028-001',
    payerName: 'Nguyễn Văn An',
    groupName: 'Lớp Toán 12 Nâng cao',
    amount: 1200000,
    itemDescription: 'Học phí ôn thi THPT QG - Tháng 10/2026',
    paymentMethod: 'VIETQR',
    bankRef: 'FT262981023910 (SeABank)',
    confirmedAt: '2026-10-28 09:15',
    status: 'CONFIRMED',
    invoiceCode: 'TR-2026-10-001',
  },
  {
    id: 'rec-2',
    receiptNumber: 'REC-20261028-002',
    payerName: 'Trần Thị Thu Hà',
    groupName: 'Nhà Trọ An Cư 12 Phòng',
    amount: 3850000,
    itemDescription: 'Tiền phòng 201 + Điện 120kWh + Nước 6 khối (T10/2026)',
    paymentMethod: 'VIETQR',
    bankRef: 'MB262980041289 (MBBank)',
    confirmedAt: '2026-10-28 08:40',
    status: 'CONFIRMED',
    invoiceCode: 'TR-2026-10-002',
  },
  {
    id: 'rec-3',
    receiptNumber: 'REC-20261027-003',
    payerName: 'Lê Hoàng Nam',
    groupName: 'CLB Cầu Lông Thủ Đức Stars',
    amount: 600000,
    itemDescription: 'Gia hạn thẻ tập 10 buổi sinh hoạt buổi tối',
    paymentMethod: 'VIETQR',
    bankRef: 'VCB262970912441 (Vietcombank)',
    confirmedAt: '2026-10-27 19:30',
    status: 'CONFIRMED',
    invoiceCode: 'TR-2026-10-003',
  },
  {
    id: 'rec-4',
    receiptNumber: 'REC-20261026-004',
    payerName: 'Phạm Minh Tuấn',
    groupName: 'Lớp Toán 10 Chuyên',
    amount: 1000000,
    itemDescription: 'Học phí chuyên đề Hình học không gian',
    paymentMethod: 'CASH',
    bankRef: 'Xác nhận tiền mặt tại quầy',
    confirmedAt: '2026-10-26 17:00',
    status: 'CONFIRMED',
    invoiceCode: 'TR-2026-10-004',
  },
];

export default function DocumentCenterPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<InternalReceipt | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const filteredReceipts = MOCK_RECEIPTS.filter(
    (r) =>
      r.payerName.toLowerCase().includes(search.toLowerCase()) ||
      r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.groupName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hóa đơn, Chứng từ & Biên nhận
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#3344D6] text-white uppercase tracking-wider">
              Document Center
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Quản lý tập trung các biên nhận thu tiền nội bộ, đối soát giao dịch và kết nối nhà cung cấp hóa đơn điện tử.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MuiButton
            variant="contained"
            size="small"
            startIcon={<Printer size={16} />}
            onClick={() => setShowReportModal(true)}
            sx={{
              textTransform: 'none',
              bgcolor: '#2538D9',
              '&:hover': { bgcolor: '#1E2DB8' },
              color: '#FFFFFF',
              fontWeight: 700,
              borderRadius: '8px',
            }}
          >
            In Báo cáo đối soát chuẩn
          </MuiButton>
          <MuiButton
            variant="outlined"
            size="small"
            startIcon={<Download size={16} />}
            href="/export"
            sx={{
              textTransform: 'none',
              borderColor: '#E2E8F0',
              color: '#334155',
              fontWeight: 600,
              borderRadius: '8px',
            }}
          >
            Xuất dữ liệu bàn giao kế toán
          </MuiButton>
        </div>
      </div>

      {/* Legal & Compliance Notice Banner - High Contrast */}
      <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-slate-900/90 border border-blue-200 dark:border-blue-500/40 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-l-4 border-l-[#3344D6]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-[#3344D6] dark:text-blue-300 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Quy chuẩn Phân biệt Biên nhận Nội bộ và Hóa đơn Điện tử (NĐ 254/2026/NĐ-CP)
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Biên nhận nội bộ:</strong> Là chứng từ ghi nhận việc thanh toán giữa cơ sở và người nộp, phục vụ lưu trữ đối soát nội bộ.
              <span className="mx-2 text-slate-400">|</span>
              <strong className="text-slate-900 dark:text-white">Hóa đơn điện tử:</strong> Hóa đơn có mã cơ quan Thuế chỉ được phát hành khi cơ sở kết nối với nhà cung cấp giải pháp HĐĐT hợp pháp (VNPT, Viettel, MISA).
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1.5 shadow-xs">
        <Tabs
          value={tabIndex}
          onChange={(_, val) => setTabIndex(val)}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#3344D6',
              height: 3,
              borderRadius: 1.5,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#64748B',
              minHeight: 42,
              '&.Mui-selected': {
                color: '#3344D6',
                fontWeight: 700,
              },
            },
          }}
        >
          <Tab
            label={`Biên nhận thu tiền nội bộ (${MOCK_RECEIPTS.length})`}
            icon={<Receipt size={16} />}
            iconPosition="start"
          />
          <Tab
            label="Chứng từ đối soát ngân hàng"
            icon={<FileText size={16} />}
            iconPosition="start"
          />
          <Tab
            label="Cổng Hóa đơn điện tử (e-Invoice)"
            icon={<Building2 size={16} />}
            iconPosition="start"
          />
        </Tabs>
      </div>

      {/* =============================================================== */}
      {/* TAB 0: BIÊN NHẬN THU TIỀN NỘI BỘ */}
      {/* =============================================================== */}
      {tabIndex === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã biên nhận, tên người nộp..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#3344D6]"
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Hiển thị <strong>{filteredReceipts.length}</strong> biên nhận đã xác nhận
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mã biên nhận</th>
                  <th className="py-3 px-4">Người nộp tiền</th>
                  <th className="py-3 px-4">Workspace / Nhóm</th>
                  <th className="py-3 px-4">Nội dung thu</th>
                  <th className="py-3 px-4 text-right">Số tiền</th>
                  <th className="py-3 px-4">Phương thức</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReceipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#3344D6] dark:text-indigo-400">
                      {rec.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {rec.payerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {rec.groupName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {rec.itemDescription}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {formatVND(rec.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {rec.paymentMethod === 'VIETQR' ? 'VietQR Tự động' : 'Tiền mặt'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 size={12} /> Đã xác nhận
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedReceipt(rec);
                          setPreviewOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-[#3344D6] dark:text-indigo-300 font-semibold text-[11px] border border-blue-200 dark:border-blue-800 transition-colors"
                      >
                        Xem & In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 1: CHỨNG TỪ ĐỐI SOÁT NGÂN HÀNG */}
      {/* =============================================================== */}
      {tabIndex === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Nhật ký Đối soát & Dấu vết Giao dịch Ngân hàng (Audit Trail)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mỗi biên nhận thu tiền đều liên kết 1:1 với một biến động số dư ngân hàng qua Napas 247.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {MOCK_RECEIPTS.map((rec) => (
              <div key={`proof-${rec.id}`} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{rec.bankRef}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      MATCHED 100%
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Khoản thu: <strong>{rec.invoiceCode}</strong> • Người nộp: {rec.payerName} ({rec.groupName})
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Thời gian gạch nợ: {rec.confirmedAt}
                  </span>
                </div>

                <div className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  +{formatVND(rec.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 2: CỔNG KẾT NỐI HÓA ĐƠN ĐIỆN TỬ (E-INVOICE) */}
      {/* =============================================================== */}
      {tabIndex === 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500 dark:text-slate-400">
            <Building2 size={28} />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chưa kết nối Cổng Hóa đơn điện tử (e-Invoice)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              TingRoster cung cấp biên nhận nội bộ và dữ liệu đối soát chuẩn cho kế toán. Nếu cơ sở của bạn là Doanh nghiệp hoặc Hộ kinh doanh thuộc diện phát hành hóa đơn điện tử có mã của cơ quan Thuế, vui lòng kết nối API với nhà cung cấp HĐĐT được cấp phép (VNPT, Viettel, MISA).
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <MuiButton
              variant="contained"
              size="small"
              sx={{
                bgcolor: '#3344D6',
                '&:hover': { bgcolor: '#2538D9' },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              Đăng ký kết nối e-Invoice
            </MuiButton>
            <MuiButton
              variant="outlined"
              size="small"
              href="/docs/invoice-and-document-spec.md"
              target="_blank"
              sx={{
                borderColor: '#E2E8F0',
                color: '#334155',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              Xem hướng dẫn pháp lý
            </MuiButton>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL IN PHIẾU THU CHUẨN MẪU 01 - TT (BỘ TÀI CHÍNH) */}
      {/* =============================================================== */}
      {previewOpen && selectedReceipt && (
        <LegalPrintableDocument
          data={{
            receiptNumber: selectedReceipt.receiptNumber,
            groupName: selectedReceipt.groupName,
            facilityAddress: 'Hà Nội / TP. Hồ Chí Minh',
            facilityPhone: '0987 654 321',
            payerName: selectedReceipt.payerName,
            payerPhone: '0912 345 678',
            amount: selectedReceipt.amount,
            itemDescription: selectedReceipt.itemDescription,
            paymentMethod: selectedReceipt.paymentMethod,
            bankRef: selectedReceipt.bankRef,
            invoiceCode: selectedReceipt.invoiceCode,
            confirmedAt: selectedReceipt.confirmedAt,
          }}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {/* =============================================================== */}
      {/* MODAL IN BÁO CÁO TỔNG HỢP ĐỐI SOÁT TÀI CHÍNH KẾ TOÁN */}
      {/* =============================================================== */}
      {showReportModal && (
        <LegalPrintableReconciliationReport
          reportTitle="BÁO CÁO TỔNG HỢP ĐỐI SOÁT GIAO DỊCH VÀ THU PHÍ"
          facilityName="Cơ Sở Giáo Dục & Đào Tạo TingRoster"
          periodText="Tháng 10/2026"
          items={MOCK_RECEIPTS.map((r) => ({
            id: r.id,
            transactionCode: r.bankRef.split(' ')[0],
            date: r.confirmedAt,
            payerName: r.payerName,
            groupName: r.groupName,
            content: r.itemDescription,
            amount: r.amount,
            provider: 'VietQR (Napas 247)',
            status: 'MATCHED',
          }))}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
