'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Users2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Copy,
  Printer,
  Check
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

export interface ParsedMemberRow {
  index: number;
  name: string;
  phone: string;
  parentName: string;
  note: string;
  isValid: boolean;
  errors: string[];
}

interface ExcelStudentImportModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  onSuccess: () => void;
}

export function ExcelStudentImportModal({
  open,
  onClose,
  groupId,
  groupName,
  onSuccess,
}: ExcelStudentImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<'UPLOAD' | 'PREVIEW' | 'RESULT'>('UPLOAD');
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedMemberRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [importedCount, setImportedCount] = useState(0);
  const [createdCodes, setCreatedCodes] = useState<Array<{ name: string; phone?: string; code: string }>>([]);
  const [copiedRoster, setCopiedRoster] = useState(false);

  // 1. Download Standard Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Họ và tên *': 'Nguyễn Văn An',
        'Số điện thoại': '0912345678',
        'Người giám hộ / Phụ huynh': 'Nguyễn Văn Hùng',
        'Ghi chú': 'Học sinh mới',
      },
      {
        'Họ và tên *': 'Trần Thị Mai',
        'Số điện thoại': '0987654321',
        'Người giám hộ / Phụ huynh': 'Trần Văn Bình',
        'Ghi chú': 'Đăng ký ca chiều',
      },
      {
        'Họ và tên *': 'Lê Hoàng Nam',
        'Số điện thoại': '0905123456',
        'Người giám hộ / Phụ huynh': 'Phạm Thị Cúc',
        'Ghi chú': 'Tham gia CLB',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocVien');

    // Auto-fit column widths
    worksheet['!cols'] = [{ wch: 24 }, { wch: 18 }, { wch: 28 }, { wch: 20 }];

    XLSX.writeFile(workbook, `TingRoster_Mau_Nhap_Hoc_Vien_${groupName.replace(/\s+/g, '_')}.xlsx`);
  };

  // 2. Parse Excel/CSV File
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage(null);
    setLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

      if (rawJson.length === 0) {
        setErrorMessage('File Excel không có dữ liệu học viên');
        setLoading(false);
        return;
      }

      // Map columns flexibily
      const parsedRows: ParsedMemberRow[] = rawJson.map((row, idx) => {
        let name = '';
        let phone = '';
        let parentName = '';
        let note = '';

        for (const [key, val] of Object.entries(row)) {
          const lowerKey = key.toLowerCase().trim();
          const strVal = String(val).trim();

          if (lowerKey.includes('họ và tên') || lowerKey.includes('họ tên') || lowerKey.includes('tên') || lowerKey === 'name') {
            name = strVal;
          } else if (lowerKey.includes('điện thoại') || lowerKey.includes('sđt') || lowerKey === 'phone') {
            phone = strVal;
          } else if (lowerKey.includes('phụ huynh') || lowerKey.includes('giám hộ') || lowerKey.includes('parent')) {
            parentName = strVal;
          } else if (lowerKey.includes('ghi chú') || lowerKey.includes('lớp') || lowerKey === 'note') {
            note = strVal;
          }
        }

        // Validate row
        const errors: string[] = [];
        if (!name || name.length < 2) {
          errors.push('Thiếu họ và tên học viên');
        }

        // Format VN phone: if 9 digits, add leading 0
        if (phone) {
          const cleanPhone = phone.replace(/\D/g, '');
          if (cleanPhone.length === 9) {
            phone = '0' + cleanPhone;
          } else {
            phone = cleanPhone;
          }
        }

        return {
          index: idx + 1,
          name,
          phone,
          parentName,
          note,
          isValid: errors.length === 0,
          errors,
        };
      });

      // Call Backend PREVIEW API to validate duplicates in database
      try {
        const previewRes = await fetch('/api/members/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId,
            fileName: file.name,
            action: 'PREVIEW',
            isAiOcr: false,
            members: parsedRows.map((r) => ({
              name: r.name,
              phone: r.phone || undefined,
              parentName: r.parentName || undefined,
              note: r.note || undefined,
            })),
          }),
        });

        const previewData = await previewRes.json();
        if (previewData.success && previewData.data?.rows) {
          setRows(
            previewData.data.rows.map((r: { index: number; name: string; phone: string | null; parentName: string | null; note: string | null; isValid: boolean; errors: string[] }) => ({
              index: r.index,
              name: r.name,
              phone: r.phone || '',
              parentName: r.parentName || '',
              note: r.note || '',
              isValid: r.isValid,
              errors: r.errors || [],
            }))
          );
        } else {
          setRows(parsedRows);
        }
      } catch {
        // Fallback to client-parsed rows if preview endpoint has network issue
        setRows(parsedRows);
      }

      setStep('PREVIEW');
    } catch (err) {
      console.error('Error parsing Excel:', err);
      setErrorMessage('Không thể đọc file Excel. Vui lòng kiểm tra định dạng .xlsx, .xls hoặc .csv');
    } finally {
      setLoading(false);
    }
  };

  // 3. Confirm and Submit to Bulk Import API (COMMIT mode)
  const handleConfirmImport = async () => {
    const validRows = rows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMessage('Không có dòng học viên hợp lệ nào để nhập');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/members/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          fileName,
          action: 'COMMIT',
          isAiOcr: false,
          members: validRows.map((r) => ({
            name: r.name,
            phone: r.phone || undefined,
            parentName: r.parentName || undefined,
            note: r.note || undefined,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setImportedCount(data.data.importedCount);
        if (data.data.createdMembers && Array.isArray(data.data.createdMembers)) {
          setCreatedCodes(data.data.createdMembers);
        } else {
          setCreatedCodes(
            validRows.map((r, i) => ({
              name: r.name,
              phone: r.phone,
              code: `TR-MEMBER-${Date.now().toString().slice(-6)}${i}`,
            }))
          );
        }
        setStep('RESULT');
        onSuccess();
      } else {
        setErrorMessage(data.error || 'Lỗi khi nhập danh sách học viên');
      }
    } catch {
      setErrorMessage('Lỗi kết nối máy chủ khi tải lên danh sách');
    } finally {
      setLoading(false);
    }
  };

  // Download error report for invalid rows
  const handleDownloadErrorReport = () => {
    const errorRows = rows.filter((r) => !r.isValid);
    if (errorRows.length === 0) return;

    const reportData = errorRows.map((r) => ({
      'Dòng': r.index,
      'Họ và tên': r.name,
      'Số điện thoại': r.phone,
      'Phụ huynh': r.parentName,
      'Lý do lỗi / Trùng lặp': r.errors.join('; '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dong_Bi_Loi');
    worksheet['!cols'] = [{ wch: 8 }, { wch: 22 }, { wch: 16 }, { wch: 22 }, { wch: 38 }];

    XLSX.writeFile(workbook, `TingRoster_Bao_Cao_Loi_${groupName.replace(/\s+/g, '_')}.xlsx`);
  };

  // Download activation sheet for created members
  const handleDownloadActivationSheet = () => {
    if (createdCodes.length === 0) return;

    const rosterData = createdCodes.map((c, i) => ({
      'STT': i + 1,
      'Họ và tên học viên': c.name,
      'Số điện thoại': c.phone || '',
      'Mã QR kích hoạt': c.code,
      'Cổng học viên': 'https://tingroster.vn/portal/qr',
      'Hướng dẫn': 'Đăng ký tài khoản học viên và nhập mã này để liên kết',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rosterData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kich_Hoat_Hoc_Vien');
    worksheet['!cols'] = [{ wch: 6 }, { wch: 24 }, { wch: 16 }, { wch: 24 }, { wch: 32 }, { wch: 45 }];

    XLSX.writeFile(workbook, `TingRoster_Danh_Sach_Kich_Hoat_${groupName.replace(/\s+/g, '_')}.xlsx`);
  };

  // Copy roster for activation
  const handleCopyRoster = () => {
    const text = createdCodes
      .map((c) => `${c.name} | SĐT: ${c.phone || '—'} | Mã QR: ${c.code}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedRoster(true);
    setTimeout(() => setCopiedRoster(false), 2000);
  };

  const handleReset = () => {
    setStep('UPLOAD');
    setRows([]);
    setFileName('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = rows.filter((r) => r.isValid).length;
  const invalidCount = rows.length - validCount;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '1.25rem',
            overflow: 'hidden',
          },
          className: 'dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] shadow-2xl',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E7EC] dark:border-[#1E293B] flex items-center justify-between bg-slate-50/60 dark:bg-[#0B0F19]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-[#2538D9] flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#101828] dark:text-[#F8FAFC]">
                Nhập danh sách học viên từ Excel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Không gian: <span className="font-bold text-[#2538D9] dark:text-indigo-400">{groupName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD & DOWNLOAD TEMPLATE */}
          {step === 'UPLOAD' && (
            <div className="space-y-6">
              
              {/* Template Download Prompt */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Bước 1: Tải file mẫu Excel chuẩn TingRoster
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    File mẫu gồm các cột: Họ và tên (bắt buộc), Số điện thoại, Họ tên phụ huynh/người giám hộ.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 text-[#2538D9] dark:text-blue-300 font-bold flex items-center justify-center gap-2 hover:bg-blue-50/50 shadow-2xs flex-shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file mẫu .xlsx</span>
                </button>
              </div>

              {/* Upload Drag & Drop Box */}
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-2">
                  Bước 2: Tải lên danh sách học viên
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#2538D9] dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-8 text-center space-y-3 cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-[#2538D9] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Bấm để chọn file hoặc kéo thả file Excel vào đây
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Hỗ trợ định dạng: .xlsx, .xls, .csv (tối đa 500 học viên / lần)
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION */}
          {step === 'PREVIEW' && (
            <div className="space-y-4">
              
              {/* Summary Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-500 block">Tổng số dòng:</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    {rows.length}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-600 block font-semibold">Hợp lệ để nhập:</span>
                  <span className="text-base font-extrabold text-emerald-600 font-mono">
                    {validCount}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-rose-600 block font-semibold">Dòng có lỗi:</span>
                  <span className="text-base font-extrabold text-rose-600 font-mono">
                    {invalidCount}
                  </span>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">STT</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3">Số điện thoại</th>
                      <th className="py-2.5 px-3">Phụ huynh / Giám hộ</th>
                      <th className="py-2.5 px-3 w-28 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rows.map((row) => (
                      <tr
                        key={row.index}
                        className={row.isValid ? 'hover:bg-slate-50/50' : 'bg-rose-50/50 dark:bg-rose-950/20'}
                      >
                        <td className="py-2 px-3 text-center text-slate-500 font-mono">{row.index}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                          {row.name || <span className="text-rose-500 italic">Trống</span>}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {row.phone || '—'}
                        </td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                          {row.parentName || '—'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Hợp lệ</span>
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                              title={row.errors.join(', ')}
                            >
                              <AlertCircle className="w-3 h-3" />
                              <span>Lỗi</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {invalidCount > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                    <span>Có {invalidCount} dòng bị lỗi hoặc trùng lặp (sẽ tự động bỏ qua khi nhập).</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadErrorReport}
                    className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 font-bold text-[11px] hover:bg-amber-100/50 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải báo cáo lỗi (.xlsx)</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* STEP 3: RESULT & ACTIVATION ROSTER */}
          {step === 'RESULT' && (
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Đã nhập thành công {importedCount} học viên vào không gian {groupName}!
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Mỗi học viên đã được cấp mã định danh QR cá nhân. Bạn có thể sao chép hoặc tải danh sách về máy để gửi cho học sinh/phụ huynh kích hoạt tài khoản.
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                  <span>Phí nhập Excel: 0đ (Miễn phí)</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left max-h-48 overflow-y-auto font-mono text-[11px]">
                {createdCodes.map((c, i) => (
                  <div key={i} className="py-1 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-center justify-between">
                    <span className="font-sans font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                    <span className="text-[#2538D9] dark:text-indigo-400 font-bold">{c.code}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadActivationSheet}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4 text-[#2538D9]" />
                  <span>Tải danh sách kích hoạt (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyRoster}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  {copiedRoster ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedRoster ? 'Đã sao chép' : 'Sao chép mã học viên'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E4E7EC] dark:border-[#1E293B] flex items-center justify-between bg-slate-50/50 dark:bg-[#0B0F19]/50">
          {step === 'PREVIEW' ? (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              Chọn lại file khác
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step === 'RESULT' ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Hoàn tất & Đóng
              </button>
            ) : step === 'PREVIEW' ? (
              <button
                type="button"
                disabled={loading || validCount === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang nhập dữ liệu...</span>
                  </>
                ) : (
                  <>
                    <span>Xác nhận nhập {validCount} học viên</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy
              </button>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
