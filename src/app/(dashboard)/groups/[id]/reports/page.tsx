'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  CalendarCheck,
  Download,
  AlertTriangle,
  RefreshCw,
  Search
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { Avatar } from '@/components/common/Avatar';
import { formatVND } from '@/lib/utils';

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

interface MemberDebtItem {
  id: string;
  name: string;
  phone?: string | null;
  totalDue: number;
  totalPaid: number;
  remainingDue: number;
  unpaidInvoiceCount: number;
}

export default function SpaceReportsPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const [space, setSpace] = useState<SpaceDetail | null>(null);
  const [debts, setDebts] = useState<MemberDebtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
        // Aggregate debt by member
        const memberMap: Record<string, MemberDebtItem> = {};
        invJson.data.forEach((inv: any) => {
          const mId = inv.member.id;
          if (!memberMap[mId]) {
            memberMap[mId] = {
              id: mId,
              name: inv.member.name,
              phone: inv.member.phone,
              totalDue: 0,
              totalPaid: 0,
              remainingDue: 0,
              unpaidInvoiceCount: 0,
            };
          }
          memberMap[mId].totalDue += inv.amountDue;
          memberMap[mId].totalPaid += inv.amountPaid;
          const remaining = Math.max(0, inv.amountDue - inv.amountPaid);
          memberMap[mId].remainingDue += remaining;
          if (remaining > 0) {
            memberMap[mId].unpaidInvoiceCount += 1;
          }
        });
        setDebts(Object.values(memberMap));
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
    if (!search.trim()) return debts;
    const q = search.toLowerCase();
    return debts.filter((d) => d.name.toLowerCase().includes(q) || d.phone?.includes(q));
  }, [debts, search]);

  const summary = useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    let debtorsCount = 0;

    debts.forEach((d) => {
      totalDue += d.totalDue;
      totalPaid += d.totalPaid;
      totalRemaining += d.remainingDue;
      if (d.remainingDue > 0) debtorsCount++;
    });

    return { totalDue, totalPaid, totalRemaining, debtorsCount };
  }, [debts]);

  return (
    <div className="w-full space-y-6 pb-12">
      {space && (
        <SpaceNavHeader
          space={{
            ...space,
            memberCount: space.members?.length || 0,
          }}
          activeSection="reports"
        />
      )}

      {/* Sub-report Drilldown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href={`/groups/${groupId}/reports/financial`}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 hover:shadow-xs transition group"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
              Tài chính
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Khoản thu & đối soát</p>
        </Link>

        <Link
          href={`/groups/${groupId}/reports/debt`}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-rose-500 hover:shadow-xs transition group"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition">
              Công nợ
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tuổi nợ & quá hạn</p>
        </Link>

        <Link
          href={`/groups/${groupId}/reports/attendance`}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 hover:shadow-xs transition group"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <CalendarCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
              Chuyên cần
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Điểm danh & tỷ lệ vắng</p>
        </Link>

        <Link
          href={`/groups/${groupId}/reports/services`}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500 hover:shadow-xs transition group"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition">
              Dịch vụ
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Hiệu suất danh mục phí</p>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Tổng học phí / Khoản thu</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums block mt-1 font-mono">
            {formatVND(summary.totalDue)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Tính riêng trong không gian này</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600 block">Đã thực thu qua VietQR</span>
          <span className="text-2xl font-black text-emerald-600 tabular-nums block mt-1 font-mono">
            {formatVND(summary.totalPaid)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Tỷ lệ thu: {summary.totalDue > 0 ? Math.round((summary.totalPaid / summary.totalDue) * 100) : 0}%</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-rose-600 block">Công nợ cần thu</span>
          <span className="text-2xl font-black text-rose-600 tabular-nums block mt-1 font-mono">
            {formatVND(summary.totalRemaining)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">{summary.debtorsCount} thành viên còn nợ</span>
        </div>
      </div>

      {/* Search and Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Chi tiết công nợ từng thành viên
          </h3>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên thành viên..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#2538D9]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-2">
            <CircularProgress size={28} sx={{ color: '#2538D9' }} />
            <p className="text-xs text-slate-400">Đang tổng hợp báo cáo công nợ...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-slate-400">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không có dữ liệu công nợ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E4E7EC] dark:border-slate-800 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Thành viên</th>
                  <th className="py-3 px-4 text-right">Tổng phải đóng</th>
                  <th className="py-3 px-4 text-right">Đã thanh toán</th>
                  <th className="py-3 px-4 text-right">Còn nợ</th>
                  <th className="py-3 px-4 text-center">Số hóa đơn nợ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] dark:divide-slate-800">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={d.name} size="xs" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{d.name}</span>
                          {d.phone && <span className="text-[10px] text-slate-400">{d.phone}</span>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatVND(d.totalDue)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 tabular-nums">
                      {formatVND(d.totalPaid)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      {d.remainingDue > 0 ? (
                        <span className="text-rose-600">-{formatVND(d.remainingDue)}</span>
                      ) : (
                        <span className="text-emerald-600">Đã hoàn tất</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {d.unpaidInvoiceCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {d.unpaidInvoiceCount} hóa đơn
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">0</span>
                      )}
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
