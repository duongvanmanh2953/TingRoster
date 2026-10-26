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
  Building2
} from 'lucide-react';
import { BankLogo } from '@/components/common/BankLogo';

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

      // Fetch AI Advisor recommendation
      const aiRes = await fetch('/api/ai/match-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: tx.id }),
      });
      const aiData = await aiRes.json();
      if (aiData.success && aiData.data?.suggestions) {
        setAiSuggestions(aiData.data.suggestions);
        if (aiData.data.suggestions.length > 0) {
          setAssignInvoiceId(aiData.data.suggestions[0].invoiceId);
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx || !assignInvoiceId) return;

    setIsAssigning(true);
    try {
      const res = await fetch('/api/transactions/manual-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: selectedTx.id,
          invoiceId: assignInvoiceId,
          note: assignNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTx(null);
        loadTransactions(tab);
      } else {
        alert(data.error || 'Lỗi gán giao dịch');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setIsAssigning(false);
    }
  };

  const unmatchedCount = transactions.filter((t) => t.processingStatus === 'UNMATCHED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Lịch sử & Đối soát VietQR
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase">
              Tự động 100%
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi dòng tiền chuyển khoản VietQR, SePay & Casso tự động khớp và gạch nợ học phí
          </p>
        </div>

        <button
          onClick={() => loadTransactions(tab)}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-[#1E283D] bg-[#111726] rounded-xl hover:bg-[#182136] text-slate-300 hover:text-white text-xs font-bold transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E283D] pb-2">
        <button
          onClick={() => setTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            tab === 'ALL'
              ? 'bg-emerald-500 text-[#080C14] shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-[#111726]'
          }`}
        >
          Tất cả giao dịch
        </button>

        <button
          onClick={() => setTab('UNMATCHED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            tab === 'UNMATCHED'
              ? 'bg-amber-500 text-[#080C14] shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-[#111726]'
          }`}
        >
          <span>Giao dịch chưa khớp</span>
          {unmatchedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
              {unmatchedCount}
            </span>
          )}
        </button>
      </div>

      {/* Transactions Table */}
      <div className="ting-card overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 animate-pulse text-xs">Đang tải lịch sử giao dịch...</div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111726] border-b border-[#1E283D] text-slate-400 uppercase font-bold tracking-wider">
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
              <tbody className="divide-y divide-[#1A2338]">
                {transactions.map((tx) => {
                  return (
                    <tr key={tx.id} className="hover:bg-[#131C2E] transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {formatDateTimeVN(tx.transactionDate)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <BankLogo bankId={tx.provider.includes('MB') ? 'MB' : 'VCB'} size="xs" />
                          <span>{tx.provider}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-white max-w-xs truncate">
                        {tx.content}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                        +{formatVND(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {tx.processingStatus === 'PROCESSED' || tx.processingStatus === 'MATCHED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            <CheckCircle2 className="w-3 h-3" /> Đã khớp
                          </span>
                        ) : tx.processingStatus === 'UNMATCHED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                            <HelpCircle className="w-3 h-3" /> Chưa khớp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#111726] text-slate-400 border border-[#1E283D]">
                            {tx.processingStatus}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {tx.matchedInvoice ? (
                          <div>
                            <span className="font-semibold text-white block">
                              {tx.matchedInvoice.member.name}
                            </span>
                            <span className="text-[11px] font-mono text-emerald-400">
                              {tx.matchedInvoice.paymentCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Chưa xác định</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {tx.processingStatus === 'UNMATCHED' && (
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(tx)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-[#080C14] rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Gán thủ công
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
          <div className="text-center py-16 text-slate-400 text-xs">
            Không có giao dịch nào trong mục này
          </div>
        )}
      </div>

      {/* Manual Assign Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1626] border border-[#1E283D] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#1E283D] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Gán giao dịch thủ công</h3>
                <p className="text-[11px] text-slate-400">Khớp giao dịch ngân hàng vào hóa đơn học viên tương ứng</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#111726] rounded-xl border border-[#1E283D] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Số tiền:</span>
                <span className="font-bold text-emerald-400 text-sm font-mono">
                  +{formatVND(selectedTx.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nội dung CK:</span>
                <span className="font-semibold text-white font-mono break-all">{selectedTx.content}</span>
              </div>
            </div>

            {/* AI Advisor Card */}
            {aiSuggestions.length > 0 && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    ✨ AI Đề Xuất Học Viên Trùng Khớp ({aiSuggestions[0].confidence}% tin cậy)
                  </span>
                </div>
                {aiSuggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => setAssignInvoiceId(s.invoiceId)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition ${
                      assignInvoiceId === s.invoiceId
                        ? 'bg-[#111726] border-emerald-500 shadow-sm text-white'
                        : 'bg-[#111726]/60 border-[#1E283D] text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span>{s.memberName} ({s.groupName})</span>
                      <span className="text-emerald-400 font-mono">Đang nợ: {formatVND(s.remaining)}</span>
                    </div>
                    <ul className="text-[11px] text-slate-400 mt-1 list-disc list-inside">
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chọn học viên / Phiếu thu để gạch nợ *
                </label>
                <select
                  value={assignInvoiceId}
                  onChange={(e) => setAssignInvoiceId(e.target.value)}
                  className="w-full border border-[#1E283D] rounded-xl px-3.5 py-2.5 bg-[#111726] text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.member.name} — {inv.title} (Còn nợ: {formatVND(inv.amountDue - inv.amountPaid)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ghi chú đối soát (tùy chọn)
                </label>
                <input
                  type="text"
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="Ví dụ: Phụ huynh ghi sai tên, đã đối chiếu số điện thoại..."
                  className="w-full border border-[#1E283D] rounded-xl px-3.5 py-2.5 bg-[#111726] text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E283D]">
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
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
