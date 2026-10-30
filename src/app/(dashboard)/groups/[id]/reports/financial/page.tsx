'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  Calendar,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatVND } from '@/lib/utils';

export default function SpaceFinancialReportPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [spaceRes, invRes] = await Promise.all([
          fetch(`/api/groups/${spaceId}`),
          fetch(`/api/invoices?groupId=${spaceId}`),
        ]);
        const [spaceJson, invJson] = await Promise.all([spaceRes.json(), invRes.json()]);

        if (spaceJson.success) setSpace(spaceJson.data);
        if (invJson.success) setInvoices(invJson.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (spaceId) {
      loadData();
    }
  }, [spaceId]);

  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  return (
    <div className="space-y-6">
      {space && (
        <SpaceNavHeader
          space={{
            id: space.id,
            name: space.name,
            slug: space.slug || space.id,
            code: space.code,
            groupType: space.groupType,
          }}
          activeSection="reports"
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href={`/groups/${spaceId}/reports`} className="hover:text-blue-600 transition">
              Báo cáo không gian
            </Link>
            <span>/</span>
            <span className="font-bold text-slate-900 dark:text-white">Báo cáo tài chính & Khoản thu</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Báo cáo Tài chính & Dòng tiền Khoản thu</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Thống kê chi tiết số tiền phát hành, thực thu qua VietQR và tỷ lệ hoàn thành thu phí trong không gian này.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng phát sinh</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {formatVND(totalBilled)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Đã thu thực tế</div>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono tabular-nums">
            {formatVND(totalCollected)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-rose-700 dark:text-rose-400">Chưa thu / Còn nợ</div>
          <div className="text-2xl font-black text-rose-600 mt-1 font-mono tabular-nums">
            {formatVND(totalOutstanding)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-blue-700 dark:text-blue-400">Tỷ lệ thu phí</div>
          <div className="text-2xl font-black text-blue-600 mt-1 font-mono tabular-nums">
            {collectionRate}%
          </div>
        </div>
      </div>

      {/* Invoices Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
          <span>Chi tiết các hóa đơn phát sinh</span>
          <span className="text-xs font-normal text-slate-500">Tổng cộng {invoices.length} chứng từ</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Đang tải số liệu tài chính...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            Chưa có hóa đơn nào phát sinh trong không gian này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-4">Mã TT & Tiêu đề</th>
                  <th className="py-3 px-4">Thành viên</th>
                  <th className="py-3 px-4 text-right">Cần thu</th>
                  <th className="py-3 px-4 text-right">Đã thu</th>
                  <th className="py-3 px-4 text-right">Còn nợ</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{inv.title}</div>
                      <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">{inv.paymentCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{inv.member?.name}</div>
                      <div className="text-[11px] text-slate-400">{inv.member?.phone || '—'}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatVND(inv.amountDue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-bold">
                      {formatVND(inv.amountPaid)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600 font-bold">
                      {formatVND(Math.max(0, inv.amountDue - inv.amountPaid))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center whitespace-nowrap select-none px-2.5 py-1 rounded-full text-xs font-semibold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : inv.status === 'PARTIAL'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {inv.status === 'PAID' ? 'Đã thanh toán' : inv.status === 'PARTIAL' ? 'Thu một phần' : 'Chưa thanh toán'}
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
