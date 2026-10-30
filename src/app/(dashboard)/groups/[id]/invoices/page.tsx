'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Search,
  RefreshCw,
  QrCode,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { Avatar } from '@/components/common/Avatar';
import { formatVND, formatDateVN } from '@/lib/utils';
import { QuickCreateInvoiceModal } from '@/components/invoices/QuickCreateInvoiceModal';

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

interface InvoiceItem {
  id: string;
  publicToken: string;
  paymentCode: string;
  title: string;
  amountDue: number;
  amountPaid: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERPAID' | 'VOID';
  dueDate?: string | null;
  createdAt: string;
  member: {
    id: string;
    name: string;
    phone?: string | null;
  };
  group: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function SpaceInvoicesPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const [space, setSpace] = useState<SpaceDetail | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const [spaceRes, invRes] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/invoices?groupId=${groupId}`),
      ]);

      const [spaceJson, invJson] = await Promise.all([
        spaceRes.json(),
        invRes.json(),
      ]);

      if (spaceJson.success) setSpace(spaceJson.data);
      if (invJson.success && Array.isArray(invJson.data)) {
        setInvoices(invJson.data);
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

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.title.toLowerCase().includes(search.toLowerCase()) ||
        inv.paymentCode.toLowerCase().includes(search.toLowerCase()) ||
        inv.member.name.toLowerCase().includes(search.toLowerCase()) ||
        (inv.member.phone && inv.member.phone.includes(search));

      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const stats = useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;
    invoices.forEach((inv) => {
      totalDue += inv.amountDue;
      totalPaid += inv.amountPaid;
    });
    return {
      totalDue,
      totalPaid,
      totalRemaining: Math.max(0, totalDue - totalPaid),
    };
  }, [invoices]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap select-none">Đã đóng đủ</span>;
      case 'PARTIAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap select-none">Đóng thiếu</span>;
      case 'OVERPAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap select-none">Đóng thừa</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap select-none">Chưa đóng</span>;
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {space && (
        <SpaceNavHeader
          space={{
            ...space,
            memberCount: space.members?.length || 0,
          }}
          activeSection="invoices"
        />
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Tổng khoản phải thu</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums block mt-1 font-mono">
            {formatVND(stats.totalDue)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">{invoices.length} đợt phát hành</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600 block">Đã thực thu (VietQR)</span>
          <span className="text-2xl font-black text-emerald-600 tabular-nums block mt-1 font-mono">
            {formatVND(stats.totalPaid)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Đối soát ngân hàng tự động</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-rose-600 block">Công nợ còn lại</span>
          <span className="text-2xl font-black text-rose-600 tabular-nums block mt-1 font-mono">
            {formatVND(stats.totalRemaining)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Chờ phụ huynh/học viên thanh toán</span>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'UNPAID', 'PARTIAL', 'PAID'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#2538D9] text-white shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL'
                ? 'Tất cả'
                : st === 'UNPAID'
                ? 'Chưa đóng'
                : st === 'PARTIAL'
                ? 'Đóng thiếu'
                : 'Đã đóng đủ'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên / mã thanh toán..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#2538D9]"
            />
          </div>

          <button
            onClick={() => setQuickCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo khoản thu</span>
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <CircularProgress size={28} sx={{ color: '#2538D9' }} />
            <p className="text-xs text-slate-400">Đang tải danh sách khoản thu...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Chưa có khoản thu nào</p>
            <button
              onClick={() => setQuickCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2538D9] text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo khoản thu đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E4E7EC] dark:border-slate-800 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mã thanh toán</th>
                  <th className="py-3 px-4">Thành viên</th>
                  <th className="py-3 px-4">Tiêu đề khoản thu</th>
                  <th className="py-3 px-4 text-right">Phải đóng</th>
                  <th className="py-3 px-4 text-right">Đã đóng</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] dark:divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span>{inv.paymentCode}</span>
                        <button
                          onClick={() => handleCopy(inv.paymentCode)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {copiedCode === inv.paymentCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={inv.member.name} size="xs" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{inv.member.name}</span>
                          {inv.member.phone && <span className="text-[10px] text-slate-400">{inv.member.phone}</span>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {inv.title}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatVND(inv.amountDue)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 tabular-nums">
                      {formatVND(inv.amountPaid)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(inv.status)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/p/${inv.publicToken}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2538D9] font-bold text-[11px] transition-colors"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>VietQR</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Create Invoice Modal */}
      {quickCreateOpen && (
        <QuickCreateInvoiceModal
          open={quickCreateOpen}
          onClose={() => setQuickCreateOpen(false)}
          onSuccess={loadData}
          initialGroupId={groupId}
        />
      )}
    </div>
  );
}
