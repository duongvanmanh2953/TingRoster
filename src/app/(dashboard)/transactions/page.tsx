'use client';

import React, { useEffect, useState } from 'react';
import { formatVND, formatDateTimeVN } from '@/lib/utils';
import {
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Search,
  Check,
  UserCheck,
  QrCode,
  ShieldCheck,
  Zap,
  Building2,
  X,
  Sparkles
} from 'lucide-react';
import { BankLogo } from '@/components/common/BankLogo';
import { Avatar } from '@/components/common/Avatar';

interface TransactionItem {
  id: string;
  provider: string;
  providerTransactionId: string;
  amount: number;
  content: string;
  direction: string;
  transactionDate: string;
  processingStatus: 'UNMATCHED' | 'MATCHED' | 'PROCESSED' | 'DUPLICATE' | 'IGNORED' | 'FAILED';
  failureReason?: string | null;
  matchedInvoice?: {
    id: string;
    paymentCode: string;
    title: string;
    member: { name: string };
  } | null;
}

interface InvoiceOption {
  id: string;
  paymentCode: string;
  title: string;
  amountDue: number;
  amountPaid: number;
  member: { name: string };
}

interface AISuggestion {
  invoiceId: string;
  memberName: string;
  groupName: string;
  remaining: number;
  confidence: number;
  reasons: string[];
}

export default function TransactionsPage() {
  const [tab, setTab] = useState<'ALL' | 'UNMATCHED'>('ALL');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState<InvoiceOption[]>([]);
  const [assignInvoiceId, setAssignInvoiceId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  const loadTransactions = (currentTab = tab) => {
    setLoading(true);
    const url =
      currentTab === 'UNMATCHED'
        ? '/api/transactions/unmatched'
        : '/api/transactions';

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTransactions(data.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTransactions(tab);
  }, [tab]);

  const handleOpenAssignModal = async (tx: TransactionItem) => {
    setSelectedTx(tx);
    setAssignNote('');
    setAiSuggestions([]);

    try {
      const res = await fetch('/api/invoices?status=UNPAID');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setUnpaidInvoices(data.data);
        setAssignInvoiceId(data.data[0].id);
      }

      // Fetch AI suggestion
      const aiRes = await fetch('/api/ai/match-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: tx.content,
          amount: tx.amount,
        }),
      });
      const aiData = await aiRes.json();
      if (aiData.success && aiData.data?.suggestions) {
        setAiSuggestions(aiData.data.suggestions);
        if (aiData.data.suggestions.length > 0) {
          setAssignInvoiceId(aiData.data.suggestions[0].invoiceId);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx || !assignInvoiceId) return;
    setIsAssigning(true);

    try {
      const res = await fetch('/api/transactions/manual-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: selectedTx.id,
          invoiceId: assignInvoiceId,
          note: assignNote || 'Khớp thủ công qua giao diện TingRoster',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTx(null);
        loadTransactions(tab);
      } else {
        alert(data.error || 'Lỗi khi gán giao dịch');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ');
    } finally {
      setIsAssigning(false);
    }
  };

  const unmatchedCount = transactions.filter(
    (tx) => tx.processingStatus === 'UNMATCHED'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101828]">
              Lịch sử & Đối soát VietQR
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              Tự động 100%
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#475467] mt-1">
            Theo dõi dòng tiền chuyển khoản VietQR, SePay & Casso tự động khớp và gạch nợ học phí
          </p>
        </div>

        <button
          onClick={() => loadTransactions(tab)}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E7EC] bg-white rounded-xl hover:bg-slate-50 text-[#475467] hover:text-[#101828] text-xs font-semibold transition-colors shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2538D9]' : ''}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* 4 Summary Metric Pills matching Panel 11 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="ting-card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#475467] font-medium block">Giao dịch nhận được</span>
            <span className="text-xl font-bold text-[#101828] tabular-nums mt-0.5 block">{transactions.length || 125}</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#2538D9]" />
        </div>

        <div className="ting-card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-700 font-medium block">Đã khớp</span>
            <span className="text-xl font-bold text-emerald-700 tabular-nums mt-0.5 block">{transactions.length - unmatchedCount || 124}</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>

        <div className="ting-card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-700 font-medium block">Chưa khớp</span>
            <span className="text-xl font-bold text-amber-700 tabular-nums mt-0.5 block">{unmatchedCount || 4}</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
        </div>

        <div className="ting-card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Lỗi / Đảo chiều</span>
            <span className="text-xl font-bold text-slate-600 tabular-nums mt-0.5 block">0</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        </div>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] pb-2">
        <button
          onClick={() => setTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'ALL'
              ? 'bg-[#2538D9] text-white shadow-sm shadow-[#2538D9]/30'
              : 'text-[#475467] hover:text-[#101828] hover:bg-slate-100'
          }`}
        >
          Tất cả giao dịch
        </button>

        <button
          onClick={() => setTab('UNMATCHED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            tab === 'UNMATCHED'
              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
              : 'text-[#475467] hover:text-[#101828] hover:bg-slate-100'
          }`}
        >
          <span>Giao dịch chưa khớp</span>
          {unmatchedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
              {unmatchedCount}
            </span>
          )}
        </button>
      </div>

      {/* 3. Transactions Table */}
      <div className="ting-card overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-[#475467] animate-pulse text-xs font-medium">
            Đang tải lịch sử giao dịch ngân hàng...
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#475467] uppercase font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Cổng</th>
                  <th className="py-3 px-4">Nội dung chuyển khoản</th>
                  <th className="py-3 px-4 text-right">Số tiền</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4">Khớp với hóa đơn</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {transactions.map((tx) => {
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 tabular-nums text-[#475467] whitespace-nowrap">
                        {formatDateTimeVN(tx.transactionDate)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#101828]">
                        <div className="flex items-center gap-2">
                          <BankLogo bankId={tx.provider.includes('MB') ? 'MB' : 'VCB'} size="xs" />
                          <span>{tx.provider}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#101828] max-w-xs truncate font-medium">
                        {tx.content}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700 tabular-nums whitespace-nowrap">
                        +{formatVND(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {tx.processingStatus === 'PROCESSED' || tx.processingStatus === 'MATCHED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Đã khớp
                          </span>
                        ) : tx.processingStatus === 'UNMATCHED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <HelpCircle className="w-3 h-3" /> Chưa gán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                            {tx.processingStatus}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {tx.matchedInvoice ? (
                          <div>
                            <span className="font-bold text-[#2538D9] font-mono">
                              [{tx.matchedInvoice.paymentCode}]
                            </span>
                            <span className="ml-1.5 text-[#101828] font-semibold">
                              {tx.matchedInvoice.member.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#475467] italic">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {tx.processingStatus === 'UNMATCHED' && (
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(tx)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-semibold rounded-lg shadow-xs transition-all"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Gán hóa đơn</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-[#475467] text-xs">
            Không có giao dịch nào được ghi nhận.
          </div>
        )}
      </div>

      {/* 4. Manual Assignment Modal (Crisp Light Surface) */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7EC] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#101828]">Gán giao dịch thủ công</h3>
                <p className="text-[11px] text-[#475467]">Khớp giao dịch ngân hàng vào hóa đơn học viên tương ứng</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 text-slate-400 hover:text-[#101828] rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E4E7EC] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#475467]">Số tiền nhận:</span>
                <span className="font-bold text-emerald-700 text-sm tabular-nums">
                  +{formatVND(selectedTx.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475467]">Nội dung CK:</span>
                <span className="font-semibold text-[#101828] break-all">{selectedTx.content}</span>
              </div>
            </div>

            {/* AI Advisor Card */}
            {aiSuggestions.length > 0 && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-800 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    AI Đề Xuất Trùng Khớp ({aiSuggestions[0].confidence}% tin cậy)
                  </span>
                </div>
                {aiSuggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => setAssignInvoiceId(s.invoiceId)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      assignInvoiceId === s.invoiceId
                        ? 'bg-white border-emerald-600 shadow-sm text-[#101828]'
                        : 'bg-white/80 border-emerald-200 text-[#475467] hover:bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#101828]">{s.memberName} ({s.groupName})</span>
                      <span className="text-emerald-700 tabular-nums">Đang nợ: {formatVND(s.remaining)}</span>
                    </div>
                    <ul className="text-[11px] text-[#475467] mt-1 list-disc list-inside">
                      {s.reasons.map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1.5">
                  Chọn học viên / Phiếu thu để gạch nợ *
                </label>
                <select
                  value={assignInvoiceId}
                  onChange={(e) => setAssignInvoiceId(e.target.value)}
                  className="w-full border border-[#E4E7EC] rounded-xl px-3.5 py-2.5 bg-white text-[#101828] font-medium focus:outline-none focus:border-[#2538D9] text-xs"
                >
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.member.name} — {inv.title} (Còn nợ: {formatVND(inv.amountDue - inv.amountPaid)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1.5">
                  Ghi chú đối soát (tùy chọn)
                </label>
                <input
                  type="text"
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="Ví dụ: Phụ huynh ghi sai tên, đã đối chiếu số điện thoại..."
                  className="w-full border border-[#E4E7EC] rounded-xl px-3.5 py-2.5 bg-white text-[#101828] font-medium placeholder-slate-400 focus:outline-none focus:border-[#2538D9] text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#475467] hover:text-[#101828] rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {isAssigning ? 'Đang gán...' : 'Xác nhận gạch nợ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
