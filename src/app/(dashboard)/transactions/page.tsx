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
} from 'lucide-react';

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

export default function TransactionsPage() {
  const [tab, setTab] = useState<'ALL' | 'UNMATCHED'>('ALL');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState<InvoiceOption[]>([]);
  const [assignInvoiceId, setAssignInvoiceId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

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

  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAiAdvice, setLoadingAiAdvice] = useState(false);

  // Load unpaid invoices & AI advice for manual assignment
  const handleOpenAssignModal = async (tx: TransactionItem) => {
    setSelectedTx(tx);
    setAiSuggestions([]);
    setLoadingAiAdvice(true);

    try {
      // 1. Load unpaid invoices
      const res = await fetch('/api/invoices?status=UNPAID');
      const data = await res.json();
      if (data.success) {
        setUnpaidInvoices(data.data);
        if (data.data.length > 0) {
          setAssignInvoiceId(data.data[0].id);
        }
      }

      // 2. Fetch AI advice
      const aiRes = await fetch('/api/ai/reconciliation-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionLogId: tx.id }),
      });
      const aiData = await aiRes.json();
      if (aiData.success && aiData.data?.suggestions) {
        setAiSuggestions(aiData.data.suggestions);
        if (aiData.data.suggestions.length > 0) {
          // Pre-select the highest confidence candidate
          setAssignInvoiceId(aiData.data.suggestions[0].invoiceId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiAdvice(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx || !assignInvoiceId) return;
    setIsAssigning(true);

    try {
      const res = await fetch(`/api/transactions/${selectedTx.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: assignInvoiceId,
          note: assignNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTx(null);
        setAssignNote('');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Lịch sử & Đối soát Giao dịch
          </h1>
          <p className="text-sm text-slate-500">
            Theo dõi dòng tiền chuyển khoản VietQR, SePay & Casso tự động khớp và gạch nợ
          </p>
        </div>

        <button
          onClick={() => loadTransactions(tab)}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            tab === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Tất cả giao dịch
        </button>

        <button
          onClick={() => setTab('UNMATCHED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            tab === 'UNMATCHED'
              ? 'bg-amber-500 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Giao dịch chưa khớp</span>
          {unmatchedCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white text-amber-700 font-extrabold">
              {unmatchedCount}
            </span>
          )}
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Đang tải lịch sử giao dịch...</div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Kênh</th>
                  <th className="py-3.5 px-4">Nội dung chuyển khoản</th>
                  <th className="py-3.5 px-4 text-right">Số tiền</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4">Đối soát với</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                        {formatDateTimeVN(tx.transactionDate)}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                        {tx.provider}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-800 max-w-xs truncate">
                        {tx.content}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                        +{formatVND(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {tx.processingStatus === 'PROCESSED' || tx.processingStatus === 'MATCHED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Đã khớp
                          </span>
                        ) : tx.processingStatus === 'UNMATCHED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <HelpCircle className="w-3 h-3" /> Chưa khớp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            {tx.processingStatus}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-900">
                        {tx.matchedInvoice ? (
                          <div>
                            <span className="font-semibold block">
                              {tx.matchedInvoice.member.name}
                            </span>
                            <span className="text-[11px] font-mono text-indigo-600">
                              {tx.matchedInvoice.paymentCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa xác định</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {tx.processingStatus === 'UNMATCHED' && (
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(tx)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition shadow-sm"
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
          <div className="text-center py-16 text-slate-400 text-sm">
            Không có giao dịch nào trong mục này
          </div>
        )}
      </div>

      {/* Manual Assign Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Gán giao dịch thủ công</h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền:</span>
                <span className="font-bold text-emerald-600 text-sm font-mono">
                  +{formatVND(selectedTx.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nội dung CK:</span>
                <span className="font-semibold text-slate-800 font-mono">{selectedTx.content}</span>
              </div>
            </div>

            {/* AI Advisor Card */}
            {aiSuggestions.length > 0 && (
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-indigo-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    ✨ AI Đề Xuất Học Viên Trùng Khớp ({aiSuggestions[0].confidence}% tin cậy)
                  </span>
                </div>
                {aiSuggestions.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setAssignInvoiceId(s.invoiceId)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition ${
                      assignInvoiceId === s.invoiceId
                        ? 'bg-white border-indigo-500 shadow-sm'
                        : 'bg-white/60 border-indigo-100 hover:bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{s.memberName} ({s.groupName})</span>
                      <span className="text-emerald-600 font-mono">Đang nợ: {formatVND(s.remaining)}</span>
                    </div>
                    <ul className="text-[11px] text-slate-500 mt-1 list-disc list-inside">
                      {s.reasons.map((r: string, rIdx: number) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn học viên / Phiếu thu để gạch nợ *
                </label>
                <select
                  value={assignInvoiceId}
                  onChange={(e) => setAssignInvoiceId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.member.name} — {inv.title} (Còn nợ: {formatVND(inv.amountDue - inv.amountPaid)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú đối soát (tùy chọn)
                </label>
                <input
                  type="text"
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="Ví dụ: Phụ huynh ghi sai tên, đã đối chiếu số điện thoại..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
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
