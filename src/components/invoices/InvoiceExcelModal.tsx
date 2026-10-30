'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  FileDown,
  Info
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { formatVND, formatCompactVND } from '@/lib/utils';

export interface InvoiceExcelModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  groups?: Array<{ id: string; name: string }>;
}

interface ParsedRow {
  index: number;
  refCode: string;
  title: string;
  memberName: string;
  memberPhone: string;
  groupName: string;
  amountDue: number;
  dueDate: string;
  note: string;
  isValid: boolean;
  errors: string[];
}

export function InvoiceExcelModal({
  open,
  onClose,
  onSuccess,
  groups = [],
}: InvoiceExcelModalProps) {
  const [step, setStep] = useState<'UPLOAD' | 'PREVIEW' | 'RESULT'>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultSummary, setResultSummary] = useState<{ count: number; totalAmount: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep('UPLOAD');
    setFile(null);
    setParsedRows([]);
    setIsProcessing(false);
    setErrorMessage(null);
    setResultSummary(null);
  };

  const handleClose = () => {
    if (isProcessing) return;
    resetState();
    onClose();
  };

  // -------------------------------------------------------------
  // 1. Download Standard Sample Template (.xlsx)
  // -------------------------------------------------------------
  const handleDownloadSample = () => {
    const defaultGroupName = groups.length > 0 ? groups[0].name : 'Lớp Toán 12 Thầy Minh';

    // Sample data rows
    const sampleData = [
      {
        'Mã tham chiếu': 'REF-T10-001',
        'Tên khoản thu (*)': 'Học phí Tháng 10/2026',
        'Tên học viên / Khách (*)': 'Nguyễn Văn An',
        'Số điện thoại': '0901234567',
        'Lớp / Nhóm (*)': defaultGroupName,
        'Số tiền (VND) (*)': 1200000,
        'Hạn thanh toán (YYYY-MM-DD)': '2026-10-31',
        'Ghi chú': 'Đóng qua VietQR Napas',
      },
      {
        'Mã tham chiếu': 'REF-T10-002',
        'Tên khoản thu (*)': 'Học phí Tháng 10/2026',
        'Tên học viên / Khách (*)': 'Trần Thị Thu Hà',
        'Số điện thoại': '0912345678',
        'Lớp / Nhóm (*)': defaultGroupName,
        'Số tiền (VND) (*)': 1200000,
        'Hạn thanh toán (YYYY-MM-DD)': '2026-10-31',
        'Ghi chú': 'Học sinh giỏi',
      },
      {
        'Mã tham chiếu': 'REF-T10-003',
        'Tên khoản thu (*)': 'Tiền thuê sân Pickleball ca tối',
        'Tên học viên / Khách (*)': 'Lê Hoàng Nam',
        'Số điện thoại': '0987654321',
        'Lớp / Nhóm (*)': defaultGroupName,
        'Số tiền (VND) (*)': 450000,
        'Hạn thanh toán (YYYY-MM-DD)': '2026-11-05',
        'Ghi chú': 'CLB Pickleball Thứ 6',
      },
    ];

    const instructionData = [
      { 'Quy tắc nhập file': '1. Cột có dấu (*) là thông tin bắt buộc phải điền.' },
      { 'Quy tắc nhập file': '2. Số tiền là số nguyên dương, không nhập chữ, dấu phẩy hoặc chữ đ (Ví dụ: 1200000).' },
      { 'Quy tắc nhập file': '3. Định dạng ngày tháng: YYYY-MM-DD (Ví dụ: 2026-10-31).' },
      { 'Quy tắc nhập file': '4. Số điện thoại nên giữ số 0 ở đầu (được xử lý dạng văn bản text).' },
      { 'Quy tắc nhập file': '5. Tên lớp/nhóm nên trùng khớp với danh sách không gian làm việc trên TingRoster.' },
    ];

    const wb = XLSX.utils.book_new();
    const wsSample = XLSX.utils.json_to_sheet(sampleData);
    const wsInstruct = XLSX.utils.json_to_sheet(instructionData);

    // Set column widths
    wsSample['!cols'] = [
      { wch: 16 }, // refCode
      { wch: 28 }, // title
      { wch: 24 }, // memberName
      { wch: 16 }, // memberPhone
      { wch: 26 }, // groupName
      { wch: 18 }, // amountDue
      { wch: 26 }, // dueDate
      { wch: 24 }, // note
    ];

    XLSX.utils.book_append_sheet(wb, wsSample, 'DanhSachKhoanThu');
    XLSX.utils.book_append_sheet(wb, wsInstruct, 'HuongDan_LuuY');

    XLSX.writeFile(wb, 'TingRoster_Mau_Nhap_KhoanThu.xlsx');
  };

  // -------------------------------------------------------------
  // 2. Parse & Validate Uploaded File (.xlsx, .xls, .csv)
  // -------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    processFile(selectedFile);
  };

  const processFile = (inputFile: File) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: false });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Convert to array of row objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('File rỗng hoặc không có dữ liệu ở trang tính đầu tiên.');
        }

        const rows: ParsedRow[] = [];

        rawJson.forEach((row, i) => {
          const errors: string[] = [];

          // Map column names flexibly
          const refCode = String(row['Mã tham chiếu'] || row['Mã'] || row['Ref'] || '').trim();
          const title = String(row['Tên khoản thu (*)'] || row['Tên khoản thu'] || row['Tiêu đề'] || '').trim();
          const memberName = String(row['Tên học viên / Khách (*)'] || row['Họ tên'] || row['Người nộp'] || row['Học viên'] || '').trim();
          let memberPhone = String(row['Số điện thoại'] || row['SĐT'] || row['Phone'] || '').trim();
          const groupName = String(row['Lớp / Nhóm (*)'] || row['Lớp'] || row['Nhóm'] || row['Workspace'] || '').trim();
          const rawAmount = String(row['Số tiền (VND) (*)'] || row['Số tiền'] || row['Tiền'] || row['Amount'] || '').replace(/[^0-9]/g, '');
          const amountDue = parseInt(rawAmount, 10);
          const rawDueDate = String(row['Hạn thanh toán (YYYY-MM-DD)'] || row['Hạn thanh toán'] || row['Hạn nộp'] || '').trim();
          const note = String(row['Ghi chú'] || row['Note'] || '').trim();

          // Validation rules
          if (!title) {
            errors.push('Thiếu tên khoản thu');
          }
          if (!memberName) {
            errors.push('Thiếu họ tên người nộp');
          }
          if (isNaN(amountDue) || amountDue <= 0) {
            errors.push('Số tiền phải là số lớn hơn 0');
          }

          // Format phone with leading zero if 9 digits
          if (memberPhone && /^\d{9}$/.test(memberPhone)) {
            memberPhone = '0' + memberPhone;
          }

          rows.push({
            index: i + 1,
            refCode,
            title,
            memberName,
            memberPhone,
            groupName,
            amountDue: isNaN(amountDue) ? 0 : amountDue,
            dueDate: rawDueDate,
            note,
            isValid: errors.length === 0,
            errors,
          });
        });

        setParsedRows(rows);
        setStep('PREVIEW');
      } catch (err: any) {
        console.error('File parsing error:', err);
        setErrorMessage(err.message || 'Không thể đọc nội dung file. Vui lòng kiểm tra định dạng .xlsx / .csv');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Lỗi khi đọc file từ ổ đĩa máy tính.');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(inputFile);
  };

  // -------------------------------------------------------------
  // 3. Download Error Rows File for Correction
  // -------------------------------------------------------------
  const handleDownloadErrors = () => {
    const errorRows = parsedRows.filter((r) => !r.isValid);
    if (errorRows.length === 0) return;

    const errorData = errorRows.map((r) => ({
      'Dòng': r.index,
      'Lỗi phát hiện': r.errors.join('; '),
      'Mã tham chiếu': r.refCode,
      'Tên khoản thu': r.title,
      'Họ tên': r.memberName,
      'Số điện thoại': r.memberPhone,
      'Lớp / Nhóm': r.groupName,
      'Số tiền': r.amountDue,
      'Hạn nộp': r.dueDate,
      'Ghi chú': r.note,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(errorData);
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSachDongLoi');
    XLSX.writeFile(wb, 'TingRoster_DanhSach_Loi_CanSua.xlsx');
  };

  // -------------------------------------------------------------
  // 4. Confirm & Commit Valid Invoices to Database
  // -------------------------------------------------------------
  const handleConfirmImport = async () => {
    const validItems = parsedRows.filter((r) => r.isValid);
    if (validItems.length === 0) {
      setErrorMessage('Không có dòng hợp lệ nào để nhập.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/invoices/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: validItems.map((r) => ({
            refCode: r.refCode,
            title: r.title,
            memberName: r.memberName,
            memberPhone: r.memberPhone,
            groupName: r.groupName,
            amountDue: r.amountDue,
            dueDate: r.dueDate,
            note: r.note,
          })),
          dryRun: false,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Lỗi lưu dữ liệu hóa đơn');
      }

      setResultSummary({
        count: data.count || validItems.length,
        totalAmount: data.totalAmount || validItems.reduce((sum, r) => sum + r.amountDue, 0),
      });
      setStep('RESULT');

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi máy chủ khi ghi nhận hóa đơn');
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;
  const totalAmount = parsedRows.filter((r) => r.isValid).reduce((sum, r) => sum + r.amountDue, 0);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '1rem',
            overflow: 'hidden',
          },
        },
      }}
    >
      <DialogTitle sx={{ p: 2.5, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2538D9]/10 text-[#2538D9] dark:text-indigo-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Nhập danh sách khoản thu bằng Excel (.xlsx)
              </h2>
              <p className="text-xs text-slate-500">
                Tạo đợt thu hàng loạt, sinh mã VietQR tự động và đối soát tức thì
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: UPLOAD & DOWNLOAD TEMPLATE */}
        {step === 'UPLOAD' && (
          <div className="space-y-6">
            {/* Guide & Sample Download Box */}
            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-black-50/40 dark:bg-black-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#2538D9] dark:text-indigo-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Bước 1: Tải file mẫu chuẩn
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  File mẫu gồm các cột tiêu đề chuẩn, ví dụ minh họa và quy tắc nhập số tiền không bị lỗi font hay khoa học.
                </p>
              </div>
              <Button
                variant="outlined"
                size="small"
                onClick={handleDownloadSample}
                startIcon={<Download className="w-4 h-4" />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: '0.5rem',
                  borderColor: '#2538D9',
                  color: '#2538D9',
                  whiteSpace: 'nowrap',
                  '&:hover': { borderColor: '#1E2DB8', bgcolor: 'rgba(37, 56, 217, 0.04)' },
                }}
              >
                Tải file mẫu Excel (.xlsx)
              </Button>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#2538D9] dark:hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-black-50 dark:bg-black-950/50 text-[#2538D9] dark:text-indigo-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Chọn file hoặc kéo thả file Excel vào đây
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Hỗ trợ định dạng .xlsx, .xls, .csv (Tối đa 500 dòng mỗi đợt)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: '#2538D9',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  borderRadius: '0.5rem',
                  mt: 1,
                  '&:hover': { bgcolor: '#1E2DB8' },
                }}
              >
                Duyệt file từ máy
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & ERROR VALIDATION */}
        {step === 'PREVIEW' && (
          <div className="space-y-4">
            {/* Validation Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">
                  Dòng hợp lệ
                </span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {validCount} / {parsedRows.length}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-black-50/50 dark:bg-black-950/20">
                <span className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 block">
                  Tổng tiền dự kiến
                </span>
                <span className="text-xl font-bold text-[#2538D9] dark:text-indigo-400 tabular-nums">
                  {formatVND(totalAmount)}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 block">
                    Dòng lỗi (Cần sửa)
                  </span>
                  {errorCount > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadErrors}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <FileDown className="w-3 h-3" />
                      Tải file lỗi
                    </button>
                  )}
                </div>
                <span className="text-xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {errorCount} dòng
                </span>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 px-3 font-bold w-12 text-center">STT</th>
                      <th className="py-2 px-3 font-bold">Người nộp</th>
                      <th className="py-2 px-3 font-bold">Lớp / Nhóm</th>
                      <th className="py-2 px-3 font-bold">Nội dung</th>
                      <th className="py-2 px-3 font-bold text-right">Số tiền</th>
                      <th className="py-2 px-3 font-bold text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.map((row) => (
                      <tr
                        key={row.index}
                        className={row.isValid ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-rose-50/40 dark:bg-rose-950/20'}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                          {row.index}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900 dark:text-white">{row.memberName}</p>
                          <p className="text-[10px] text-slate-500">{row.memberPhone || '—'}</p>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          {row.groupName || 'Tất cả'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          {row.title}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                          {formatVND(row.amountDue)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Hợp lệ
                            </span>
                          ) : (
                            <Tooltip title={row.errors.join('; ')} arrow>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 cursor-help">
                                <AlertCircle className="w-3 h-3" />
                                {row.errors[0]}
                              </span>
                            </Tooltip>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FINAL SUCCESS SUMMARY */}
        {step === 'RESULT' && resultSummary && (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Đã nhập thành công {resultSummary.count} khoản thu!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Tổng giá trị phát sinh: <strong className="text-emerald-600 font-bold">{formatVND(resultSummary.totalAmount)}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Hệ thống đã tự động gán mã thanh toán VietQR (TRxxxx) cho từng học viên. Bạn có thể sao chép đường link hoặc gửi bảng kê ngay.
              </p>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        {step === 'UPLOAD' && (
          <Button onClick={handleClose} disabled={isProcessing} color="inherit" sx={{ textTransform: 'none' }}>
            Hủy
          </Button>
        )}

        {step === 'PREVIEW' && (
          <>
            <Button
              onClick={() => {
                setStep('UPLOAD');
                setParsedRows([]);
              }}
              disabled={isProcessing}
              color="inherit"
              sx={{ textTransform: 'none' }}
            >
              Chọn file khác
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmImport}
              disabled={isProcessing || validCount === 0}
              startIcon={isProcessing ? <CircularProgress size={16} color="inherit" /> : <FileCheck className="w-4 h-4" />}
              sx={{
                bgcolor: '#2538D9',
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'none',
                borderRadius: '0.5rem',
                '&:hover': { bgcolor: '#1E2DB8' },
              }}
            >
              {isProcessing ? 'Đang tạo hóa đơn...' : `Xác nhận tạo ${validCount} khoản thu`}
            </Button>
          </>
        )}

        {step === 'RESULT' && (
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              bgcolor: '#2538D9',
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'none',
              borderRadius: '0.5rem',
              '&:hover': { bgcolor: '#1E2DB8' },
            }}
          >
            Hoàn tất & Xem danh sách
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// -------------------------------------------------------------
// Real Invoices Excel Exporter Utility
// -------------------------------------------------------------
export function exportInvoicesToExcel({
  invoices,
  filename = 'TingRoster_DanhSach_KhoanThu.xlsx',
}: {
  invoices: Array<{
    paymentCode: string;
    title: string;
    amountDue: number;
    amountPaid: number;
    status: string;
    dueDate?: string | null;
    createdAt: string;
    member?: { name: string; phone?: string | null };
    group?: { name: string };
  }>;
  filename?: string;
}) {
  const exportData = invoices.map((inv) => {
    const debt = Math.max(0, inv.amountDue - inv.amountPaid);
    let statusLabel = 'Chưa đóng';
    if (inv.status === 'PAID') statusLabel = 'Đã đóng đủ';
    else if (inv.status === 'PARTIAL') statusLabel = 'Đóng thiếu';
    else if (inv.status === 'OVERPAID') statusLabel = 'Đóng thừa';

    return {
      'Mã thanh toán (TR)': inv.paymentCode,
      'Tên khoản thu': inv.title,
      'Người nộp': inv.member?.name || '—',
      'Số điện thoại': inv.member?.phone ? `'${inv.member.phone}` : '—', // Preserves leading zero
      'Lớp / Workspace': inv.group?.name || '—',
      'Số tiền phải thu (VND)': inv.amountDue,
      'Đã thanh toán (VND)': inv.amountPaid,
      'Còn nợ (VND)': debt,
      'Trạng thái': statusLabel,
      'Hạn thanh toán': inv.dueDate ? inv.dueDate.split('T')[0] : '—',
      'Ngày tạo': inv.createdAt ? inv.createdAt.split('T')[0] : '—',
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  ws['!cols'] = [
    { wch: 18 },
    { wch: 28 },
    { wch: 24 },
    { wch: 16 },
    { wch: 26 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'SoKhoanThu');
  XLSX.writeFile(wb, filename);
}
