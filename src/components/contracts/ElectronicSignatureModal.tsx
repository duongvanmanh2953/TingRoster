'use client';

import React, { useRef, useState } from 'react';
import {
  X,
  Check,
  RotateCcw,
  ShieldCheck,
  PenTool,
  Type,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';

export interface ElectronicSignatureModalProps {
  open?: boolean;
  isOpen?: boolean;
  contractId?: string;
  contractTitle: string;
  contractCode?: string;
  contractContent?: string;
  signerRoleText?: string;
  partyRole?: 'PARTY_A' | 'PARTY_B';
  partyName?: string;
  onClose: () => void;
  onSign?: (signatureData: string, type: 'DRAWING' | 'TYPING' | 'OTP_CONFIRMED') => Promise<void>;
  onSuccess?: () => void;
}

export function ElectronicSignatureModal({
  open,
  isOpen,
  contractId,
  contractTitle,
  contractCode,
  contractContent,
  signerRoleText,
  partyRole,
  partyName,
  onClose,
  onSign,
  onSuccess,
}: ElectronicSignatureModalProps) {
  const isModalOpen = open !== undefined ? open : !!isOpen;
  const roleText = signerRoleText || (partyRole === 'PARTY_A' ? 'Bên A (Chủ không gian)' : 'Bên B (Thành viên / Học viên)');
  const displayCode = contractCode || (contractId ? `HD-${contractId.slice(-6).toUpperCase()}` : 'TR-HD');

  const [signMode, setSignMode] = useState<'DRAWING' | 'TYPING'>('DRAWING');
  const [typedName, setTypedName] = useState(partyName || '');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [confirmedTruth, setConfirmedTruth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isModalOpen) return null;

  // Drawing canvas logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirmSign = async () => {
    if (!confirmedTruth) {
      setError('Vui lòng xác nhận đã đọc và đồng ý với nội dung tài liệu');
      return;
    }

    let signatureData = '';
    if (signMode === 'DRAWING') {
      if (!hasDrawn || !canvasRef.current) {
        setError('Vui lòng vẽ chữ ký của bạn vào khung ký');
        return;
      }
      signatureData = canvasRef.current.toDataURL('image/png');
    } else {
      if (!typedName.trim()) {
        setError('Vui lòng nhập họ và tên của bạn để ký');
        return;
      }
      signatureData = typedName.trim();
    }

    setSubmitting(true);
    setError(null);

    try {
      if (onSign) {
        await onSign(signatureData, signMode);
      } else if (contractId) {
        const res = await fetch(`/api/groups/general/contracts/${contractId}/sign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signerRole: partyRole || 'PARTY_B',
            signerName: partyName || (signMode === 'TYPING' ? typedName.trim() : 'Người ký'),
            signatureType: signMode === 'DRAWING' ? 'DRAWN' : 'TYPED',
            signatureValue: signatureData,
          }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Lỗi ký hợp đồng');
        }
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi ký văn bản');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Ký Kết Điện Tử (E-Signature)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {displayCode} • {roleText}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract Title info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Tài liệu ký kết:
          </span>
          <p className="font-extrabold text-slate-900 dark:text-white">
            {contractTitle}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Xác lập theo Luật Giao dịch điện tử 2023. Bằng chứng ký được lưu trữ an toàn.</span>
          </p>
        </div>

        {error && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-600 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sign Method Selector */}
        <div className="p-4 space-y-4">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setSignMode('DRAWING')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                signMode === 'DRAWING'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Vẽ chữ ký tay</span>
            </button>

            <button
              type="button"
              onClick={() => setSignMode('TYPING')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                signMode === 'TYPING'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Nhập tên ký xác nhận</span>
            </button>
          </div>

          {/* Drawing Box */}
          {signMode === 'DRAWING' ? (
            <div className="space-y-2">
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[150px] cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400">
                    Ký tên của bạn vào khung này...
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Xóa chữ ký vẽ lại</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Họ và tên người ký <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Ví dụ: NGUYỄN VĂN AN"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold uppercase text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                Chữ ký được tạo dưới dạng xác nhận danh tính điện tử kèm dấu thời gian và địa chỉ IP.
              </p>
            </div>
          )}

          {/* Legal Acknowledgement Checkbox */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={confirmedTruth}
                onChange={(e) => setConfirmedTruth(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="leading-relaxed">
                Tôi xác nhận đã đọc toàn bộ các điều khoản, thỏa thuận trong hợp đồng này và đồng ý ký kết bằng phương thức điện tử có giá trị pháp lý ràng buộc.
              </span>
            </label>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={submitting || !confirmedTruth}
            onClick={handleConfirmSign}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            {submitting ? (
              <>
                <CircularProgress size={14} sx={{ color: '#fff' }} />
                <span>Đang ghi nhận chữ ký...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4" />
                <span>Hoàn Tất Ký Hợp Đồng</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
