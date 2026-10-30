'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  Receipt,
  Users,
  Clock,
  Search,
  Download,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatVND } from '@/lib/utils';

export default function SpaceDebtReportPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        if (invJson.success && Array.isArray(invJson.data)) {
          const map: Record<string, any> = {};
          const now = new Date();

          invJson.data.forEach((inv: any) => {
            const remaining = Math.max(0, inv.amountDue - inv.amountPaid);
            if (remaining <= 0) return;

            const mId = inv.member.id;
            if (!map[mId]) {
              map[mId] = {
                memberId: mId,
                name: inv.member.name,
                phone: inv.member.phone,
                totalRemaining: 0,
                under30Days: 0,
                days30To60: 0,
                over60Days: 0,
                unpaidInvoices: [],
              };
            }

            map[mId].totalRemaining += remaining;
            const created = new Date(inv.createdAt);
            const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 3600 * 24));

            if (diffDays <= 30) {
              map[mId].under30Days += remaining;
            } else if (diffDays <= 60) {
              map[mId].days30To60 += remaining;
            } else {
              map[mId].over60Days += remaining;
            }

            map[mId].unpaidInvoices.push({
              id: inv.id,
              title: inv.title,
              paymentCode: inv.paymentCode,
              remaining,
              diffDays,
            });
          });

          setDebts(Object.values(map));
        }
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

  const totalOutstanding = debts.reduce((sum, d) => sum + d.totalRemaining, 0);
  const totalUnder30 = debts.reduce((sum, d) => sum + d.under30Days, 0);
  const total30To60 = debts.reduce((sum, d) => sum + d.days30To60, 0);
  const totalOver60 = debts.reduce((sum, d) => sum + d.over60Days, 0);

  const filteredDebts = debts.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.phone && d.phone.includes(searchTerm))
  );

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
            <span className="font-bold text-slate-900 dark:text-white">Báo cáo công nợ & Tuổi nợ</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Phân tích Công nợ & Tuổi nợ Phải thu</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi danh sách các thành viên chưa đóng tiền và phân loại tuổi nợ (dưới 30 ngày, 30-60 ngày, quá 60 ngày).
          </p>
        </div>
      </div>

      {/* Aging KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-rose-700 dark:text-rose-400">Tổng nợ phải thu</div>
          <div className="text-2xl font-black text-rose-600 mt-1 font-mono tabular-nums">
            {formatVND(totalOutstanding)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-amber-700 dark:text-amber-400">Dưới 30 ngày</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {formatVND(totalUnder30)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-orange-700 dark:text-orange-400">Từ 30 - 60 ngày</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {formatVND(total30To60)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-rose-700 dark:text-rose-400">Quá 60 ngày (Cảnh báo)</div>
          <div className="text-2xl font-black text-rose-700 mt-1 font-mono tabular-nums">
            {formatVND(totalOver60)}
          </div>
        </div>
      </div>

      {/* Filter search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm tên hoặc số điện thoại thành viên nợ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
        />
      </div>

      {/* Debt Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Đang đối soát công nợ...</span>
          </div>
        ) : filteredDebts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            Tuyệt vời! Không có khoản công nợ nào chưa thu trong không gian này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-4">Thành viên nợ</th>
                  <th className="py-3 px-4 text-center">Số khoản chưa trả</th>
                  <th className="py-3 px-4 text-right">Tổng nợ</th>
                  <th className="py-3 px-4 text-right">Nợ &lt; 30 ngày</th>
                  <th className="py-3 px-4 text-right">Nợ 30 - 60 ngày</th>
                  <th className="py-3 px-4 text-right text-rose-600 font-bold">Nợ &gt; 60 ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDebts.map((d) => (
                  <tr key={d.memberId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{d.name}</div>
                      <div className="text-[11px] text-slate-400">{d.phone || '—'}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      {d.unpaidInvoices.length}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      {formatVND(d.totalRemaining)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      {formatVND(d.under30Days)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-orange-600">
                      {formatVND(d.days30To60)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600 font-black">
                      {formatVND(d.over60Days)}
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
