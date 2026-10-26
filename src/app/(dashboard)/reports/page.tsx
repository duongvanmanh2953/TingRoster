'use client';

import React, { useState, useEffect } from 'react';
import { formatVND, formatDateVN } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Users2,
  Clock,
  ArrowUpRight,
  Download,
  Building2
} from 'lucide-react';
import Link from 'next/link';

interface ReportData {
  groupSummaries: Array<{
    id: string;
    name: string;
    slug: string;
    memberCount: number;
    totalDue: number;
    totalPaid: number;
    debt: number;
    rate: number;
    unpaidCount: number;
  }>;
  monthlyData: Array<{
    month: string;
    revenue: number;
    target: number;
  }>;
  attendanceRate: number;
  overdueInvoices: Array<{
    id: string;
    paymentCode: string;
    title: string;
    amountDue: number;
    amountPaid: number;
    dueDate: string;
    member: { name: string; phone?: string | null };
    group: { name: string };
  }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-24 text-slate-400 text-xs animate-pulse">Đang tổng hợp báo cáo tài chính...</div>;
  }

  const totalRevenue = data?.groupSummaries.reduce((acc, g) => acc + g.totalPaid, 0) || 0;
  const totalDebt = data?.groupSummaries.reduce((acc, g) => acc + g.debt, 0) || 0;
  const totalDue = totalRevenue + totalDebt;
  const overallRate = totalDue > 0 ? Math.round((totalRevenue / totalDue) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Báo cáo Doanh thu & Chuyên cần
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase">
              Tài chính
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Phân tích tỷ lệ thu tiền, biểu đồ tăng trưởng học phí và danh sách công nợ quá hạn
          </p>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ting-card p-5">
          <span className="text-xs font-semibold text-slate-400">Tổng doanh thu thực nhận</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {formatVND(totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Đã đối soát qua VietQR</p>
        </div>

        <div className="ting-card p-5">
          <span className="text-xs font-semibold text-slate-400">Tổng nợ chưa thu</span>
          <div className="mt-2 text-2xl font-extrabold text-rose-400 font-mono tracking-tight">
            {formatVND(totalDebt)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cần nhắc phụ huynh / hội viên</p>
        </div>

        <div className="ting-card p-5">
          <span className="text-xs font-semibold text-slate-400">Tỷ lệ thu thành công</span>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono tracking-tight">
            {overallRate}%
          </div>
          <div className="mt-2 w-full bg-[#1A2338] rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${overallRate}%` }} />
          </div>
        </div>

        <div className="ting-card p-5">
          <span className="text-xs font-semibold text-slate-400">Tỷ lệ chuyên cần bình quân</span>
          <div className="mt-2 text-2xl font-extrabold text-cyan-400 font-mono tracking-tight">
            {data?.attendanceRate || 92}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ghi nhận qua sổ điểm danh</p>
        </div>
      </div>

      {/* Group Summaries Table */}
      <div className="ting-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E283D] pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users2 className="w-4 h-4 text-emerald-400" />
            <span>Tiến độ thu học phí theo từng Lớp học & CLB</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111726] border-b border-[#1E283D] text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Lớp / CLB</th>
                <th className="py-3 px-4 text-center">Sĩ số</th>
                <th className="py-3 px-4 text-right">Phải thu</th>
                <th className="py-3 px-4 text-right">Đã thu</th>
                <th className="py-3 px-4 text-right">Còn nợ</th>
                <th className="py-3 px-4 text-center">Tỷ lệ hoàn thành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2338]">
              {data?.groupSummaries.map((g) => (
                <tr key={g.id} className="hover:bg-[#131C2E] transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    {g.name}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">
                    {g.memberCount} học viên
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    {formatVND(g.totalDue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {formatVND(g.totalPaid)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                    {formatVND(g.debt)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-[#1A2338] rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${g.rate}%` }} />
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-[11px]">{g.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overdue Invoices List */}
      {data?.overdueInvoices && data.overdueInvoices.length > 0 && (
        <div className="ting-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E283D] pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Hóa đơn quá hạn nộp ({data.overdueInvoices.length})</span>
            </h2>
          </div>

          <div className="divide-y divide-[#1A2338]">
            {data.overdueInvoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{inv.member.name}</span>
                    <span className="font-mono text-emerald-400 font-bold">[{inv.paymentCode}]</span>
                    <span className="text-slate-400">({inv.group.name})</span>
                  </div>
                  <p className="text-[11px] text-rose-400 mt-0.5">
                    Hạn nộp: {formatDateVN(inv.dueDate)} • Còn nợ: {formatVND(inv.amountDue - inv.amountPaid)}
                  </p>
                </div>

                <Link
                  href={`/invoices`}
                  className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
                >
                  Nhắc phí
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
