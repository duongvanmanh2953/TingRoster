'use client';

import React, { useState } from 'react';
import { formatVND, formatDateVN } from '@/lib/utils';
import { generateVietQRUrl } from '@/lib/providers/vietqr';
import { Check, Copy, AlertCircle, CheckCircle2, Clock, Ban } from 'lucide-react';
import Image from 'next/image';
import { BankLogo } from '@/components/common/BankLogo';

export interface PublicInvoiceData {
  id: string;
  publicToken: string;
  paymentCode: string;
  title: string;
  groupName: string;
  memberName: string;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERPAID' | 'VOID';
  amountDue: number;
  amountPaid: number;
  dueDate?: string | null;
  billingPeriodStart?: string | null;
  billingPeriodEnd?: string | null;
  sessionCount?: number | null;
  feePerSession?: number | null;
  bankId: string;
  bankAccountNo: string;
  bankAccountName: string;
}

interface PublicPaymentCardProps {
  invoice: PublicInvoiceData;
  onRefresh?: () => void;
}

export function PublicPaymentCard({ invoice }: PublicPaymentCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const remaining = Math.max(0, invoice.amountDue - invoice.amountPaid);
  const excess = Math.max(0, invoice.amountPaid - invoice.amountDue);

  // Generate VietQR URL for remaining balance
  const qrUrl = generateVietQRUrl({
    bankId: invoice.bankId,
    accountNo: invoice.bankAccountNo,
    accountName: invoice.bankAccountName,
    amount: remaining > 0 ? remaining : invoice.amountDue,
    paymentCode: invoice.paymentCode,
  });

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      // Fallback
    }
  };

  const renderStatusBadge = () => {
    switch (invoice.status) {
      case 'PAID':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã đóng đủ
          </div>
        );
      case 'PARTIAL':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Đóng thiếu
          </div>
        );
      case 'OVERPAID':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đóng thừa ({formatVND(excess)})
          </div>
        );
      case 'VOID':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            <Ban className="w-3.5 h-3.5" />
            Đã hủy
          </div>
        );
      case 'UNPAID':
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Chưa đóng tiền
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Phiếu thu học phí & hoạt động
          </span>
          {renderStatusBadge()}
        </div>
        <h1 className="text-xl font-bold text-white mb-1">{invoice.title}</h1>
        <p className="text-sm text-slate-300">
          Lớp / Nhóm: <span className="font-semibold text-white">{invoice.groupName}</span>
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Student & Period Info */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-sm">
          <div>
            <span className="text-slate-500 block text-xs">Học viên</span>
            <span className="font-semibold text-slate-900 text-base">{invoice.memberName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">Hạn thanh toán</span>
            <span className="font-medium text-slate-900">
              {invoice.dueDate ? formatDateVN(invoice.dueDate) : 'Không có'}
            </span>
          </div>

          {invoice.sessionCount !== null && invoice.sessionCount !== undefined && invoice.sessionCount > 0 && (
            <div>
              <span className="text-slate-500 block text-xs">Số buổi tính phí</span>
              <span className="font-medium text-slate-900">{invoice.sessionCount} buổi</span>
            </div>
          )}

          {invoice.feePerSession !== null && invoice.feePerSession !== undefined && invoice.feePerSession > 0 && (
            <div>
              <span className="text-slate-500 block text-xs">Đơn giá / buổi</span>
              <span className="font-medium text-slate-900">{formatVND(invoice.feePerSession)}</span>
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm border border-slate-100">
          <div className="flex justify-between items-center text-slate-600">
            <span>Tổng tiền phải đóng:</span>
            <span className="font-semibold text-slate-900">{formatVND(invoice.amountDue)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Đã thanh toán:</span>
            <span className="font-semibold text-emerald-600">{formatVND(invoice.amountPaid)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="font-medium text-slate-900">Số tiền còn nợ:</span>
            <span className="text-lg font-bold text-rose-600">
              {formatVND(remaining)}
            </span>
          </div>
        </div>

        {/* Payment QR Section (only active if UNPAID or PARTIAL) */}
        {invoice.status !== 'PAID' && invoice.status !== 'VOID' && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Quét mã VietQR bằng app ngân hàng
              </span>
            </div>

            <div className="flex justify-center">
              <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm inline-block">
                {!imageError ? (
                  <Image
                    src={qrUrl}
                    alt={`VietQR ${invoice.paymentCode}`}
                    width={260}
                    height={260}
                    priority
                    unoptimized
                    onError={() => setImageError(true)}
                    className="rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-64 h-64 flex flex-col items-center justify-center p-4 text-center bg-slate-50 rounded-lg text-slate-500 text-xs">
                    <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                    <span>Không tải được ảnh QR tự động. Vui lòng chuyển khoản thủ công theo thông tin bên dưới.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Instructions & One-click Copy */}
            <div className="space-y-2.5 pt-2">
              {/* Transfer Content */}
              <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                <div>
                  <span className="text-xs text-indigo-700 block font-medium">Nội dung chuyển khoản (bắt buộc)</span>
                  <span className="text-base font-bold text-indigo-950 font-mono tracking-wider">
                    {invoice.paymentCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(invoice.paymentCode, 'code')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg transition"
                  aria-label="Sao chép nội dung chuyển khoản"
                >
                  {copiedField === 'code' ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Đã chép
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Sao chép
                    </>
                  )}
                </button>
              </div>

              {/* Bank Account */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <BankLogo bankId={invoice.bankId} size="md" />
                  <div>
                    <span className="text-xs text-slate-500 block">Ngân hàng ({invoice.bankId})</span>
                    <span className="text-sm font-semibold text-slate-900 font-mono">
                      {invoice.bankAccountNo}
                    </span>
                    <span className="text-xs text-slate-500 block uppercase font-medium">{invoice.bankAccountName}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(invoice.bankAccountNo, 'acc')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 active:scale-95 text-slate-700 rounded-lg transition"
                  aria-label="Sao chép số tài khoản"
                >
                  {copiedField === 'acc' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã chép
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Sao chép
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-center text-slate-400">
              ⚡ Hệ thống TingRoster tự động đối soát và gạch nợ trong vòng 5-30 giây sau khi chuyển khoản.
            </p>
          </div>
        )}

        {/* State: PAID */}
        {invoice.status === 'PAID' && (
          <div className="text-center py-6 space-y-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-emerald-900">Phiếu thu đã thanh toán đầy đủ</h3>
            <p className="text-xs text-emerald-700 max-w-xs mx-auto">
              Cảm ơn quý phụ huynh / thành viên đã hoàn thành học phí đúng hạn.
            </p>
          </div>
        )}

        {/* State: OVERPAID */}
        {invoice.status === 'OVERPAID' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1">
            <p className="font-semibold">Đã ghi nhận thanh toán vượt mức (+{formatVND(excess)})</p>
            <p>Khoản tiền dư sẽ được chủ lớp hoàn lại hoặc cấn trừ vào kỳ thu tiếp theo.</p>
          </div>
        )}

        {/* State: VOID */}
        {invoice.status === 'VOID' && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 text-center">
            Phiếu thu này đã được hủy bỏ và không còn hiệu lực thanh toán.
          </div>
        )}
      </div>
    </div>
  );
}
