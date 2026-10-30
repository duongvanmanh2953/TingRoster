'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRightLeft,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Building2
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatVND, formatDateVN } from '@/lib/utils';

interface SpaceDetail {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  themeColor?: string | null;
  enabledModules?: string | null;
  defaultFee: number;
  members: Array<{ id: string; name: string; phone?: string | null }>;
}

interface TransactionItem {
  id: string;
  amount: number;
  direction: string;
  status: string;
  transactionTime: string;
  description: string;
  provider: string;
  matchedInvoice?: {
    id: string;
    paymentCode: string;
    title: string;
    member?: { name: string };
  } | null;
}

export default function SpaceTransactionsPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const [space, setSpace] = useState<SpaceDetail | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const [spaceRes, txRes] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/transactions?groupId=${groupId}`),
      ]);

      const [spaceJson, txJson] = await Promise.all([
        spaceRes.json(),
        txRes.json(),
      ]);

      if (spaceJson.success) setSpace(spaceJson.data);
      if (txJson.success && Array.isArray(txJson.data)) {
        setTransactions(txJson.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.matchedInvoice?.paymentCode.toLowerCase().includes(q) ||
        t.matchedInvoice?.member?.name.toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const totalCollected = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
  }, [transactions]);

  return (
    <div className="w-full space-y-6 pb-12">
      {space && (
        <SpaceNavHeader
          space={{
            ...space,
            memberCount: space.members?.length || 0,
          }}
          activeSection="transactions"
        />
      )}

      {/* Header Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Tổng số giao dịch VietQR</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums block mt-1">
            {transactions.length} giao dịch
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Đã đồng bộ ngân hàng</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600 block">Tổng tiền ghi nhận tự động</span>
          <span className="text-2xl font-black text-emerald-600 tabular-nums block mt-1 font-mono">
            {formatVND(totalCollected)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Khớp mã hóa đơn tự động</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo nội dung / mã chuyển khoản..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#2538D9]"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <CircularProgress size={28} sx={{ color: '#2538D9' }} />
            <p className="text-xs text-slate-400">Đang tải lịch sử giao dịch...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ArrowRightLeft className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Chưa phát sinh giao dịch nào</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Khi phụ huynh quét VietQR chuyển khoản vào tài khoản ngân hàng của bạn, giao dịch sẽ xuất hiện tại đây ngay lập tức.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E4E7EC] dark:border-slate-800 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4 text-right">Số tiền</th>
                  <th className="py-3 px-4">Nội dung giao dịch</th>
                  <th className="py-3 px-4">Hóa đơn khớp nối</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] dark:divide-slate-800">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {t.transactionTime ? formatDateVN(t.transactionTime) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 tabular-nums">
                      +{formatVND(t.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 max-w-xs truncate">
                      {t.description}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {t.matchedInvoice ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#2538D9]">{t.matchedInvoice.paymentCode}</span>
                          {t.matchedInvoice.member && (
                            <span className="text-slate-400 font-sans font-normal text-[11px]">
                              ({t.matchedInvoice.member.name})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-sans font-normal">Chờ đối soát</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Khớp lệnh thành công</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
