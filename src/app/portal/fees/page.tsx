'use client';

import React, { useEffect, useState, Suspense } from 'react';
import {
  Receipt,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building2,
  ExternalLink,
  Printer
} from 'lucide-react';
import { formatVND } from '@/lib/utils';
import { LegalPrintableDocument } from '@/components/documents/LegalPrintableDocument';

import { useSearchParams } from 'next/navigation';

interface LineItem {
  id?: string;
  name: string;
  qty: number;
  unit?: string;
  unitPrice: number;
  discount?: number;
  total: number;
  note?: string;
}

interface FeeInvoice {
  id: string;
  title: string;
  paymentCode: string;
  publicToken: string;
  amountDue: number;
  amountPaid: number;
  remainingAmount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERPAID' | 'VOID';
  dueDate?: string;
  createdAt: string;
  group: { id: string; name: string; groupType: string };
  member?: { id: string; name: string; phone?: string | null };
  recipient: {
    name: string;
    bankId: string;
    bankAccountNo: string;
    bankAccountName: string;
  };
  vietQrUrl: string;
  lineItems: LineItem[];
  partialPaymentAllowed: boolean;
  minPartialAmount: number;
  documentType: string;
  statementNumber: string;
  allocations: Array<{
    id: string;
    amount: number;
    createdAt: string;
    transactionLog: {
      providerTransactionId: string;
      transactionDate: string;
      provider: string;
    };
  }>;
}

function MemberFeesContent() {
  const searchParams = useSearchParams();
  const targetInvoiceId = searchParams.get('invoiceId');
  const targetPaymentCode = searchParams.get('paymentCode');

  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [printReceiptOpen, setPrintReceiptOpen] = useState(false);

  // Surcharge proposals awaiting member acceptance
  const [surcharges, setSurcharges] = useState<Array<{
    id: string;
    title: string;
    category: string;
    amount: number;
    reason: string;
    evidenceUrl?: string | null;
    clauseReference?: string | null;
    status: string;
    group: { name: string };
  }>>([]);
  const [surchargeLoadingId, setSurchargeLoadingId] = useState<string | null>(null);

  const loadPortalData = () => {
    fetch('/api/portal/fees')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setInvoices(res.data);
          if (res.data.length > 0) {
            const matched = res.data.find(
              (i: FeeInvoice) =>
                (targetInvoiceId && i.id === targetInvoiceId) ||
                (targetPaymentCode && i.paymentCode === targetPaymentCode)
            );
            setSelectedInvoice(matched || res.data[0]);
          }
        }
      })
      .catch((err) => console.error('Fetch fees error:', err))
      .finally(() => setLoading(false));

    fetch('/api/portal/surcharges')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setSurcharges(res.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadPortalData();
  }, [targetInvoiceId, targetPaymentCode]);

  const handleRespondSurcharge = async (surchargeId: string, action: 'ACCEPT' | 'DISPUTE') => {
    let note: string | null = null;
    if (action === 'DISPUTE') {
      note = prompt('Vui lòng nhập lý do từ chối / khiếu nại khoản phí này:');
      if (note === null) return;
    }
    try {
      setSurchargeLoadingId(surchargeId);
      const res = await fetch('/api/portal/surcharges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surchargeId, action, responseNote: note }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      alert(action === 'ACCEPT' ? 'Bạn đã xác nhận đồng ý khoản phụ phí này.' : 'Đã gửi ý kiến khiếu nại tới chủ cơ sở.');
      loadPortalData();
    } catch (err: any) {
      alert(err.message || 'Lỗi xử lý');
    } finally {
      setSurchargeLoadingId(null);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'UNPAID') return inv.status !== 'PAID';
    if (filterStatus === 'PAID') return inv.status === 'PAID';
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#2538D9] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải danh sách khoản phí & mã VietQR...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#2538D9]" />
              <h1 className="text-xl font-bold text-[#111827] dark:text-white">Khoản Phải Đóng & Thanh Toán Minh Bạch</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Bảng kê chi tiết từng danh mục (Line Items), hỗ trợ thanh toán tự động qua VietQR với mã đối soát định danh chuẩn xác.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0B0F19] rounded-xl self-start sm:self-auto border border-[#E5E7EB] dark:border-[#1E293B]">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === 'ALL'
                  ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({invoices.length})
            </button>
            <button
              onClick={() => setFilterStatus('UNPAID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === 'UNPAID'
                  ? 'bg-white dark:bg-[#111726] text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cần đóng ({invoices.filter((i) => i.status !== 'PAID').length})
            </button>
            <button
              onClick={() => setFilterStatus('PAID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === 'PAID'
                  ? 'bg-white dark:bg-[#111726] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đã hoàn tất ({invoices.filter((i) => i.status === 'PAID').length})
            </button>
          </div>
        </div>
      </div>

      {/* Surcharge Proposals Section (Mutual Acceptance Workflow) */}
      {surcharges.filter((s) => s.status !== 'CANCELLED').length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#2538D9]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Yêu cầu phụ phí & bồi hoàn cần sự đồng thuận hai bên
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {surcharges.map((sur) => {
              const isPending = sur.status === 'PROPOSED' || sur.status === 'WAITING_FOR_PARTY_B';
              const isAccepted = sur.status === 'ACCEPTED';
              const isDisputed = sur.status === 'DISPUTED';

              return (
                <div
                  key={sur.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">{sur.group.name}</span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{sur.title}</h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                        isAccepted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isDisputed
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isAccepted ? 'Bạn đã đồng ý' : isDisputed ? 'Đang khiếu nại' : 'Chờ bạn phản hồi'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                    {sur.reason}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-white/5">
                    <span className="text-slate-500">Số tiền đề xuất:</span>
                    <span className="font-bold text-[#2538D9] dark:text-indigo-400 tabular-nums">
                      {formatVND(sur.amount)}
                    </span>
                  </div>

                  {sur.clauseReference && (
                    <div className="text-[11px] text-slate-500">
                      Căn cứ điều khoản: <span className="font-semibold text-slate-700 dark:text-slate-300">{sur.clauseReference}</span>
                    </div>
                  )}

                  {sur.evidenceUrl && (
                    <a
                      href={sur.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#2538D9] hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Xem tài liệu / hình ảnh đính kèm
                    </a>
                  )}

                  {isPending && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleRespondSurcharge(sur.id, 'ACCEPT')}
                        disabled={surchargeLoadingId === sur.id}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors whitespace-nowrap"
                      >
                        Đồng ý khoản phí
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespondSurcharge(sur.id, 'DISPUTE')}
                        disabled={surchargeLoadingId === sur.id}
                        className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        Khiếu nại / Từ chối
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredInvoices.length === 0 ? (
        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Không có khoản thu nào trong mục này</h3>
          <p className="text-xs text-slate-500 mt-1">Tất cả các khoản học phí và dịch vụ của bạn đã được đối soát hoàn tất.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Invoices List */}
          <div className="lg:col-span-5 space-y-3">
            {filteredInvoices.map((inv) => {
              const isSelected = selectedInvoice?.id === inv.id;
              const isPaid = inv.status === 'PAID';
              const isPartial = inv.status === 'PARTIAL';
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-[#111726] border-[#2538D9] shadow-md ring-2 ring-[#2538D9]/10'
                      : 'bg-white dark:bg-[#111726] border-[#E5E7EB] dark:border-[#1E293B] hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{inv.group.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200'
                          : isPartial
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200'
                      }`}
                    >
                      {isPaid ? 'Đã đóng đủ' : isPartial ? 'Đóng thiếu' : 'Chưa đóng'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#111827] dark:text-white mt-1.5">{inv.title}</h3>

                  <div className="mt-3 pt-3 border-t border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Mã chuyển khoản</span>
                      <span className="font-extrabold text-[#2538D9] font-mono tracking-wider">{inv.paymentCode}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Số tiền</span>
                      <span className={`font-mono font-extrabold ${isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatVND(inv.remainingAmount > 0 ? inv.remainingAmount : inv.amountDue)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (7 cols): Selected Invoice Itemized Details & VietQR Card */}
          {selectedInvoice && (
            <div className="lg:col-span-7 bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              {/* Document Header */}
              <div className="border-b border-[#E5E7EB] dark:border-[#1E293B] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {selectedInvoice.documentType === 'INTERNAL_STATEMENT' ? 'Bản Kê Học Phí Nội Bộ' : 'Biên Nhận'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Số: {selectedInvoice.statementNumber}</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#111827] dark:text-white mt-1.5">{selectedInvoice.title}</h2>
                  <p className="text-xs text-slate-500">Đơn vị phát hành: {selectedInvoice.recipient.name} ({selectedInvoice.group.name})</p>
                </div>

                {/* Legal notice distinction */}
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 max-w-xs">
                  <div className="flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      <strong>Lưu ý pháp lý:</strong> Đây là biên nhận đối soát nội bộ. Hóa đơn GTGT điện tử (nếu có nhu cầu) sẽ do cơ sở phát hành riêng theo quy định.
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items Breakdown Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Chi tiết các hạng mục</h3>
                  <button
                    type="button"
                    onClick={() => setPrintReceiptOpen(true)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#2538D9]" />
                    <span>In Phiếu Thu Mẫu 01-TT</span>
                  </button>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#0B0F19] border-b border-[#E5E7EB] dark:border-[#1E293B] text-slate-500 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Hạng mục</th>
                        <th className="py-2.5 px-3 text-center">Số lượng</th>
                        <th className="py-2.5 px-3 text-right">Đơn giá</th>
                        <th className="py-2.5 px-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
                      {selectedInvoice.lineItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{item.name}</span>
                            {item.note && <span className="text-[10px] text-slate-400 block">{item.note}</span>}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300">
                            {item.qty} {item.unit || ''}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                            {formatVND(item.unitPrice)}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-mono font-bold ${item.total < 0 ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-100'}`}>
                            {formatVND(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50/80 dark:bg-[#0B0F19]/80 font-bold border-t border-[#E5E7EB] dark:border-[#1E293B]">
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right text-slate-600 dark:text-slate-300">Tổng cộng khoản phí:</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-800 dark:text-white font-extrabold">{formatVND(selectedInvoice.amountDue)}</td>
                      </tr>
                      {selectedInvoice.amountPaid > 0 && (
                        <tr>
                          <td colSpan={3} className="py-2 px-3 text-right text-emerald-600">Đã thanh toán:</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-600 font-extrabold">-{formatVND(selectedInvoice.amountPaid)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={3} className="py-2.5 px-3 text-right text-rose-600 text-sm">Số tiền còn phải thanh toán:</td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-600 text-base font-extrabold">
                          {formatVND(selectedInvoice.remainingAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* VietQR Payment Card (if not fully paid) */}
              {selectedInvoice.remainingAmount > 0 ? (
                <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#CBD5E1] dark:border-[#1E293B] space-y-4">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#2538D9]" />
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-white">
                      Thanh toán chuyển khoản qua VietQR Napas 24/7
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* QR Code image */}
                    <div className="md:col-span-5 flex flex-col items-center">
                      <div className="p-2.5 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs">
                        <img
                          src={selectedInvoice.vietQrUrl}
                          alt="VietQR Payment Code"
                          className="w-44 h-44 object-contain"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 text-center">
                        Mở App ngân hàng bất kỳ để quét mã
                      </span>
                    </div>

                    {/* Bank Details & Copy buttons */}
                    <div className="md:col-span-7 space-y-2.5 text-xs">
                      {/* Ngân hàng */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Ngân hàng thụ hưởng</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {selectedInvoice.recipient.bankId} - Ngân hàng Quân Đội (MB)
                          </span>
                        </div>
                      </div>

                      {/* Số tài khoản */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Số tài khoản</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono text-sm">
                            {selectedInvoice.recipient.bankAccountNo}
                          </span>
                          <span className="text-[11px] text-slate-500 block">{selectedInvoice.recipient.bankAccountName}</span>
                        </div>
                        <button
                          onClick={() => handleCopy('acc', selectedInvoice.recipient.bankAccountNo)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-slate-600 hover:text-[#2538D9] flex items-center gap-1 font-semibold text-[11px]"
                        >
                          {copiedKey === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'acc' ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>

                      {/* Nội dung chuyển khoản */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#111726] border-2 border-indigo-200 dark:border-indigo-900 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#2538D9] dark:text-indigo-400 block">
                            Nội dung chuyển khoản (Bắt buộc giữ nguyên)
                          </span>
                          <span className="font-extrabold text-[#2538D9] font-mono text-sm tracking-wider">
                            {selectedInvoice.paymentCode}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy('code', selectedInvoice.paymentCode)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#2538D9] text-white hover:bg-[#1E2DB8] flex items-center gap-1 font-semibold text-[11px]"
                        >
                          {copiedKey === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'code' ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Khoản thu này đã được thanh toán đủ</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Cảm ơn bạn đã hoàn thành học phí đúng hạn. Bạn có thể xem lịch sử đối soát giao dịch phía dưới.
                  </p>
                </div>
              )}

              {/* Transaction Allocation History */}
              {selectedInvoice.allocations.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Lịch sử đối soát giao dịch ngân hàng</h3>
                  <div className="space-y-2">
                    {selectedInvoice.allocations.map((alloc) => (
                      <div
                        key={alloc.id}
                        className="p-3 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            Đã nhận: {formatVND(alloc.amount)}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Mã GD: {alloc.transactionLog.providerTransactionId} • {new Date(alloc.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap select-none">
                          Khớp tự động
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Official Legal Receipt Modal (Mẫu số 01 - TT) */}
      {printReceiptOpen && selectedInvoice && (
        <LegalPrintableDocument
          data={{
            receiptNumber: selectedInvoice.statementNumber || `REC-${selectedInvoice.paymentCode}`,
            groupName: selectedInvoice.group.name,
            facilityAddress: 'Hà Nội / TP. Hồ Chí Minh',
            facilityPhone: '0987 654 321',
            payerName: selectedInvoice.member?.name || 'Học viên / Thành viên',
            payerPhone: selectedInvoice.member?.phone || '0912 345 678',
            amount: selectedInvoice.amountDue,
            itemDescription: selectedInvoice.title,
            paymentMethod: 'VIETQR',
            bankRef: `TR-${selectedInvoice.paymentCode} (Napas 247)`,
            invoiceCode: selectedInvoice.paymentCode,
            confirmedAt: new Date(selectedInvoice.createdAt).toLocaleString('vi-VN'),
            lineItems: selectedInvoice.lineItems,
          }}
          onClose={() => setPrintReceiptOpen(false)}
        />
      )}
    </div>
  );
}

export default function MemberFeesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
          <div className="w-8 h-8 border-3 border-[#2538D9] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Đang tải danh sách khoản phí...</p>
        </div>
      }
    >
      <MemberFeesContent />
    </Suspense>
  );
}
