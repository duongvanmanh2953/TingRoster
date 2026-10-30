'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { formatVND, formatDateVN } from '@/lib/utils';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  Filter,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Clock,
  Eye,
  Info
} from 'lucide-react';
import {
  Button as MuiButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface ExportReportType {
  id: string;
  title: string;
  description: string;
  category: 'FINANCE' | 'OPERATION' | 'MEMBER';
  format: 'CSV' | 'XLSX';
  sampleHeaders: string[];
}

const REPORT_TYPES: ExportReportType[] = [
  {
    id: 'ACCOUNTING_HANDOVER',
    title: 'Dữ liệu Bàn giao Kế toán (Accounting Handover Data)',
    description: 'Nhật ký các giao dịch thu tiền đã đối soát qua VietQR/tiền mặt, dùng làm căn cứ lập sổ sách kế toán.',
    category: 'FINANCE',
    format: 'CSV',
    sampleHeaders: ['Mã giao dịch', 'Mã khoản thu', 'Ngày ghi nhận', 'Người nộp', 'Nội dung', 'Số tiền (VND)', 'Ngân hàng nhận', 'Bank Ref', 'Trạng thái đối soát'],
  },
  {
    id: 'DEBT_AGING_REPORT',
    title: 'Báo cáo Tổng hợp Công nợ & Phân bổ Aging',
    description: 'Danh sách các khoản nợ phân theo 4 aging buckets: Chưa đến hạn, 1-7 ngày, 8-30 ngày, >30 ngày.',
    category: 'FINANCE',
    format: 'CSV',
    sampleHeaders: ['Mã hóa đơn', 'Họ tên', 'Số điện thoại', 'Workspace', 'Số tiền phải thu', 'Đã trả', 'Còn thiếu', 'Hạn thanh toán', 'Số ngày quá hạn'],
  },
  {
    id: 'ATTENDANCE_SUMMARY',
    title: 'Báo cáo Điểm danh & Tỷ lệ Chuyên cần',
    description: 'Chi tiết từng buổi học/tập: có mặt, vắng phép, không phép, muộn và tổng số buổi đã sử dụng.',
    category: 'OPERATION',
    format: 'CSV',
    sampleHeaders: ['Mã học viên', 'Họ và tên', 'Lớp/CLB', 'Ngày điểm danh', 'Trạng thái', 'Ghi chú buổi học', 'Người điểm danh'],
  },
  {
    id: 'MEMBER_DIRECTORY',
    title: 'Danh bạ Thành viên & Khách thuê',
    description: 'Hồ sơ thông tin liên hệ, ngày tham gia, gói dịch vụ và người bảo hộ (dành cho học sinh).',
    category: 'MEMBER',
    format: 'CSV',
    sampleHeaders: ['Mã định danh', 'Họ tên', 'Số điện thoại', 'Email', 'Workspace', 'Ngày tham gia', 'Trạng thái hoạt động'],
  },
];

export default function ExportCenterPage() {
  const [selectedReportId, setSelectedReportId] = useState<string>('ACCOUNTING_HANDOVER');
  const [timeRange, setTimeRange] = useState<'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'ALL'>('THIS_MONTH');
  const [exportFormat, setExportFormat] = useState<'CSV' | 'XLSX'>('CSV');
  const [downloading, setDownloading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const currentReport = REPORT_TYPES.find((r) => r.id === selectedReportId)!;

  const handleExportDownload = async () => {
    setDownloading(true);

    try {
      if (selectedReportId === 'ACCOUNTING_HANDOVER') {
        const res = await fetch('/api/transactions?limit=200');
        const data = await res.json();
        const txList = data.success && Array.isArray(data.data) ? data.data : [];

        const exportData = txList.map((tx: any) => ({
          'Mã giao dịch': tx.id,
          'Mã khoản thu': tx.paymentCode || '—',
          'Ngày ghi nhận': tx.transactionDate ? new Date(tx.transactionDate).toLocaleString('vi-VN') : '—',
          'Người nộp': tx.senderName || '—',
          'Nội dung': tx.description || '—',
          'Số tiền (VND)': tx.amount,
          'Ngân hàng nhận': tx.bankId || 'MB',
          'Bank Ref': tx.providerTransactionId || tx.id,
          'Trạng thái đối soát': tx.processingStatus === 'MATCHED' ? 'Đã đối soát 100%' : 'Chờ kiểm tra',
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData.length > 0 ? exportData : [{ 'Thông báo': 'Chưa có giao dịch phát sinh' }]);
        XLSX.utils.book_append_sheet(wb, ws, 'SoGiaoDich');
        XLSX.writeFile(wb, `TingRoster_BanGiao_KeToan_${timeRange}.${exportFormat.toLowerCase()}`);
      } else if (selectedReportId === 'DEBT_AGING_REPORT') {
        const res = await fetch('/api/invoices');
        const data = await res.json();
        const invList = data.success && Array.isArray(data.data) ? data.data : [];

        const exportData = invList.map((inv: any) => {
          const debt = Math.max(0, inv.amountDue - inv.amountPaid);
          return {
            'Mã hóa đơn': inv.paymentCode,
            'Họ tên': inv.member?.name || '—',
            'Số điện thoại': inv.member?.phone ? `'${inv.member.phone}` : '—',
            'Workspace': inv.group?.name || '—',
            'Số tiền phải thu': inv.amountDue,
            'Đã trả': inv.amountPaid,
            'Còn thiếu': debt,
            'Hạn thanh toán': inv.dueDate ? inv.dueDate.split('T')[0] : '—',
            'Trạng thái': inv.status === 'PAID' ? 'Đã thu đủ' : inv.status === 'PARTIAL' ? 'Đóng thiếu' : 'Chưa đóng',
          };
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData.length > 0 ? exportData : [{ 'Thông báo': 'Chưa có dữ liệu công nợ' }]);
        XLSX.utils.book_append_sheet(wb, ws, 'TongHopCongNo');
        XLSX.writeFile(wb, `TingRoster_BaoCao_CongNo_${timeRange}.${exportFormat.toLowerCase()}`);
      } else {
        const res = await fetch('/api/members');
        const data = await res.json();
        const memberList = data.success && Array.isArray(data.data) ? data.data : [];

        const exportData = memberList.map((m: any) => ({
          'Mã định danh': m.id,
          'Họ tên': m.name,
          'Số điện thoại': m.phone ? `'${m.phone}` : '—',
          'Email': m.email || '—',
          'Workspace': m.group?.name || '—',
          'Ngày tham gia': m.createdAt ? m.createdAt.split('T')[0] : '—',
          'Trạng thái hoạt động': m.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm nghỉ',
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData.length > 0 ? exportData : [{ 'Thông báo': 'Chưa có thành viên' }]);
        XLSX.utils.book_append_sheet(wb, ws, 'DanhBaThanhVien');
        XLSX.writeFile(wb, `TingRoster_DanhBa_${selectedReportId}_${timeRange}.${exportFormat.toLowerCase()}`);
      }
    } catch (err) {
      console.error('Export download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Trung tâm Xuất Báo cáo & Bàn giao Kế toán
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Kết xuất dữ liệu có cấu trúc phục vụ lưu trữ nội bộ, đối soát ngân hàng và bàn giao cho nhân viên kế toán.
          </p>
        </div>
      </div>

      {/* Compliance Disclaimer Notice Card - High Contrast */}
      <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-slate-900/90 border border-blue-200 dark:border-blue-500/40 shadow-xs flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-[#3344D6] dark:text-blue-300 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
          <strong className="text-slate-900 dark:text-white">Lưu ý nghiệp vụ kế toán:</strong> Dữ liệu xuất ra từ TingRoster phản ánh thực tế dòng tiền chuyển khoản VietQR và ghi nhận nội bộ của cơ sở. Báo cáo này mang tính chất <em className="font-semibold text-[#3344D6] dark:text-blue-300">nhật ký chứng từ thu tiền</em>, được dùng làm căn cứ phối hợp với kế toán viên để hoàn thiện sổ sách kế toán, không tự xưng là tờ khai thuế pháp định chính thức.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left: Report Types Selector */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#3344D6] dark:text-indigo-400" />
              <span>1. Chọn loại Báo cáo cần xuất</span>
            </h3>

            <div className="space-y-2.5 pt-1">
              {REPORT_TYPES.map((rep) => {
                const isSelected = selectedReportId === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReportId(rep.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-[#2538D9] dark:border-indigo-400 bg-blue-50/80 dark:bg-black-950/60 ring-1 ring-[#2538D9]/40 dark:ring-indigo-400/50 shadow-xs'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#131C2E]'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isSelected ? 'text-[#2538D9] dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>
                          {rep.title}
                        </span>
                        <Chip
                          label={rep.category}
                          size="small"
                          sx={{
                            fontSize: '0.6875rem',
                            height: '20px',
                            fontWeight: 700,
                            ...(rep.category === 'FINANCE'
                              ? { bgcolor: '#ECFDF3', color: '#067647' }
                              : { bgcolor: '#EFF8FF', color: '#175CD3' }),
                          }}
                        />
                      </div>
                      <p className={`text-xs leading-relaxed ${isSelected ? 'text-slate-700 dark:text-indigo-100 font-medium' : 'text-slate-600 dark:text-slate-200 font-normal'}`}>
                        {rep.description}
                      </p>
                    </div>

                    <div className="shrink-0 mt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-[#2538D9] dark:border-indigo-400 bg-[#2538D9] dark:bg-black-500'
                            : 'border-slate-300 dark:border-slate-500 bg-transparent'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Scope & Trigger */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#3344D6] dark:text-indigo-400" />
              <span>2. Khoảng thời gian</span>
            </h3>

            <div className="space-y-2 text-xs">
              {[
                { id: 'THIS_MONTH', label: 'Tháng hiện tại (Tháng 10/2026)' },
                { id: 'LAST_MONTH', label: 'Tháng trước (Tháng 09/2026)' },
                { id: 'THIS_QUARTER', label: 'Quý 4/2026' },
                { id: 'ALL', label: 'Toàn bộ thời gian' },
              ].map((t) => {
                const isChecked = timeRange === t.id;
                return (
                  <label
                    key={t.id}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-[#2538D9] dark:border-indigo-400 bg-blue-50/80 dark:bg-black-950/60 text-[#2538D9] dark:text-indigo-200 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 bg-white dark:bg-[#131C2E] hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeRange"
                      value={t.id}
                      checked={isChecked}
                      onChange={() => setTimeRange(t.id as any)}
                      className="accent-[#2538D9] dark:accent-indigo-400 w-4 h-4"
                    />
                    <span>{t.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Định dạng file xuất:
              </span>
              <div className="flex items-center gap-4 text-xs text-slate-800 dark:text-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="CSV"
                    checked={exportFormat === 'CSV'}
                    onChange={() => setExportFormat('CSV')}
                    className="accent-[#2538D9] dark:accent-indigo-400 w-3.5 h-3.5"
                  />
                  <span>CSV (Unicode UTF-8)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="XLSX"
                    checked={exportFormat === 'XLSX'}
                    onChange={() => setExportFormat('XLSX')}
                    className="accent-[#2538D9] dark:accent-indigo-400 w-3.5 h-3.5"
                  />
                  <span>Excel (.xlsx)</span>
                </label>
              </div>
            </div>


            <div className="pt-3 space-y-2.5">
              <MuiButton
                fullWidth
                variant="contained"
                onClick={handleExportDownload}
                disabled={downloading}
                startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <Download size={16} />}
                sx={{
                  bgcolor: '#3344D6',
                  '&:hover': { bgcolor: '#2538D9' },
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '10px',
                  py: 1.2,
                  boxShadow: '0 2px 6px rgba(51, 68, 214, 0.35)',
                }}
              >
                {downloading ? 'Đang tạo file dữ liệu...' : 'Tải file báo cáo (.csv)'}
              </MuiButton>

              <MuiButton
                fullWidth
                variant="outlined"
                onClick={() => setPreviewOpen(true)}
                startIcon={<Eye size={16} />}
                sx={{
                  borderColor: '#E2E8F0',
                  color: '#334155',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '10px',
                  py: 1,
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    bgcolor: '#F8FAFC',
                  },
                }}
              >
                Xem trước cấu trúc cột
              </MuiButton>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1.25rem',
              padding: '16px',
            },
          },
        }}
      >
        <DialogTitle className="pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="font-bold text-base text-slate-900 dark:text-white block">
            Cấu trúc cột dữ liệu: {currentReport.title}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            Dữ liệu sẽ được kết xuất theo chuẩn bảng tương thích Excel / Google Sheets
          </span>
        </DialogTitle>

        <DialogContent className="pt-4 text-xs">
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  {currentReport.sampleHeaders.map((header, idx) => (
                    <th key={idx} className="py-2.5 px-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  {currentReport.sampleHeaders.map((_, idx) => (
                    <td key={idx} className="py-3 px-3.5 text-[11px] whitespace-nowrap">
                      Dữ liệu mẫu #{idx + 1}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>

        <DialogActions className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <MuiButton
            variant="contained"
            onClick={() => setPreviewOpen(false)}
            sx={{ bgcolor: '#3344D6', textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
          >
            Đã hiểu
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
