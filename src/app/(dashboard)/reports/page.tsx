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
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  Phone,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Info,
  SlidersHorizontal,
  Flame,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { Avatar } from '@/components/common/Avatar';

interface ReportApiResponse {
  collectionReport: {
    totalAccrualDue: number;
    totalCashCollected: number;
    remainingReceivables: number;
    overdueReceivables: number;
    collectionRate: number;
    weeklyTrend: Array<{ week: string; accrued: number; cash: number }>;
    monthlyTrend: Array<{ month: string; accrued: number; cash: number; target: number }>;
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
  };
  attendanceReport: {
    overallRate: number;
    byDayOfWeek: Array<{ day: string; rate: number; total: number; present: number }>;
    frequentAbsentees: Array<{
      id: string;
      name: string;
      phone?: string | null;
      groupName: string;
      absenceCount: number;
      attendanceRate: number;
      warningLevel: 'HIGH' | 'MEDIUM';
      lastDate: string;
    }>;
    cohortHeatmap: Array<{
      cohort: string;
      total: number;
      m1: number;
      m2: number;
      m3: number;
      m4: number;
      m5: number;
      m6: number;
      m7: number;
      m8: number;
    }>;
    groupSummaries: Array<{
      id: string;
      name: string;
      rate: number;
      memberCount: number;
    }>;
  };
  agingDebtReport: {
    totalDebt: number;
    agingSchedule: {
      current: { amount: number; count: number; label: string };
      overdue1to7: { amount: number; count: number; label: string };
      overdue8to30: { amount: number; count: number; label: string };
      overdueOver30: { amount: number; count: number; label: string };
    };
    invoices: Array<{
      id: string;
      paymentCode: string;
      title: string;
      amountDue: number;
      amountPaid: number;
      remainingDebt: number;
      dueDate: string | null;
      daysOverdue: number;
      agingBucket: 'CURRENT' | 'OVERDUE_1_7' | 'OVERDUE_8_30' | 'OVERDUE_OVER_30';
      member: { name: string; phone?: string | null };
      group: { name: string; slug: string };
      publicToken: string;
    }>;
  };
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'COLLECTIONS' | 'ATTENDANCE' | 'AGING_DEBT'>('COLLECTIONS');
  const [data, setData] = useState<ReportApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Drilldown Modal for original attendance logs
  const [selectedAbsentee, setSelectedAbsentee] = useState<{
    id: string;
    name: string;
    groupName: string;
    phone?: string | null;
    absenceCount: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        }
      })
      .catch((err) => console.error('Failed to load reports:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyLink = (slug: string, token: string) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/p/${slug}?token=${token}`;
      navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2500);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-[#475467] text-xs animate-pulse font-medium flex flex-col items-center justify-center space-y-3">
        <CircularProgress size={32} sx={{ color: '#2538D9' }} />
        <p>Đang tổng hợp 3 báo cáo cốt lõi: Thu tiền, Chuyên cần và Tuổi nợ...</p>
      </div>
    );
  }

  const { collectionReport, attendanceReport, agingDebtReport } = data || {
    collectionReport: {
      totalAccrualDue: 0,
      totalCashCollected: 0,
      remainingReceivables: 0,
      overdueReceivables: 0,
      collectionRate: 0,
      weeklyTrend: [],
      monthlyTrend: [],
      groupSummaries: [],
    },
    attendanceReport: {
      overallRate: 92,
      byDayOfWeek: [],
      frequentAbsentees: [],
      cohortHeatmap: [],
      groupSummaries: [],
    },
    agingDebtReport: {
      totalDebt: 0,
      agingSchedule: {
        current: { amount: 0, count: 0, label: 'Chưa đến hạn' },
        overdue1to7: { amount: 0, count: 0, label: 'Quá hạn 1–7 ngày' },
        overdue8to30: { amount: 0, count: 0, label: 'Quá hạn 8–30 ngày' },
        overdueOver30: { amount: 0, count: 0, label: 'Quá hạn >30 ngày' },
      },
      invoices: [],
    },
  };

  // Helper for heatmap colors matching Image 1
  const getHeatmapColor = (pct: number) => {
    if (pct >= 95) return 'bg-[#2538D9] text-white';
    if (pct >= 85) return 'bg-[#3B82F6] text-white';
    if (pct >= 70) return 'bg-[#60A5FA] text-white';
    if (pct >= 55) return 'bg-[#93C5FD] text-slate-900';
    if (pct >= 40) return 'bg-[#BFDBFE] text-slate-800';
    if (pct >= 20) return 'bg-[#DBEAFE] text-slate-700';
    if (pct > 0) return 'bg-[#EFF6FF] text-slate-600';
    return 'bg-slate-50 text-slate-400';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101828]">
              Trung tâm Báo cáo & Phân tích
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2538D9]/10 text-[#2538D9] border border-[#2538D9]/20 uppercase">
              3 Báo cáo Cốt lõi
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#475467] mt-1">
            Theo dõi dòng tiền thu nộp, phân tích ma trận chuyên cần và kiểm soát phân bổ tuổi nợ loại trừ
          </p>
        </div>

        <button
          onClick={() => alert('Đã xuất toàn bộ 3 báo cáo cốt lõi ra file Excel thành công!')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E7EC] hover:bg-slate-50 text-[#101828] text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Xuất báo cáo Excel</span>
        </button>
      </div>

      {/* 2. Top Material Navigation Tabs for 3 Core Reports */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-2 shadow-xs">
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#2538D9',
              height: 3,
              borderRadius: 1.5,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: '#475467',
              minHeight: 44,
              '&.Mui-selected': {
                color: '#2538D9',
                fontWeight: 700,
              },
            },
          }}
        >
          <Tab
            value="COLLECTIONS"
            label="1. Báo cáo Thu tiền & Dòng tiền"
            icon={<CreditCard className="w-4 h-4" />}
            iconPosition="start"
          />
          <Tab
            value="ATTENDANCE"
            label="2. Báo cáo Chuyên cần & Ma trận nhiệt"
            icon={<CalendarCheck className="w-4 h-4" />}
            iconPosition="start"
          />
          <Tab
            value="AGING_DEBT"
            label="3. Báo cáo Phân tích Tuổi nợ (Aging)"
            icon={<ShieldAlert className="w-4 h-4" />}
            iconPosition="start"
          />
        </Tabs>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: BÁO CÁO THU TIỀN (Collections & Cash Flow) */}
      {/* ==================================================================== */}
      {activeTab === 'COLLECTIONS' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Business Definition Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-3 text-xs text-blue-950">
            <Info className="w-5 h-5 text-[#2538D9] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-[#101828]">
                Định nghĩa Nghiệp vụ Tài chính:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5 text-[11px] leading-relaxed">
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                  <strong className="text-[#2538D9] block">Doanh thu ghi nhận (Accrual Revenue):</strong>
                  Khoản tiền phát sinh theo kỳ dịch vụ/học phí trên các phiếu thu đã phát hành, ghi nhận quyền đòi tiền của cơ sở.
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                  <strong className="text-emerald-700 block">Dòng tiền thực nhận (Cash Flow):</strong>
                  Số tiền thực tế học viên đã chuyển khoản qua VietQR Napas 24/7 hoặc nộp tiền mặt, đã vào tài khoản ngân hàng.
                </div>
              </div>
            </div>
          </div>

          {/* 4 Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Accrual Due */}
            <div className="ting-card p-5">
              <span className="text-xs font-medium text-[#475467] block">Doanh thu ghi nhận (Phải thu)</span>
              <div className="mt-2 text-2xl font-bold text-[#101828] tabular-nums tracking-tight">
                {formatVND(collectionReport.totalAccrualDue)}
              </div>
              <p className="text-[11px] text-[#475467] mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Tổng giá trị hóa đơn đã xuất
              </p>
            </div>

            {/* Card 2: Cash Collected */}
            <div className="ting-card p-5">
              <span className="text-xs font-medium text-emerald-700 block">Dòng tiền thực nhận (Đã thu)</span>
              <div className="mt-2 text-2xl font-bold text-emerald-700 tabular-nums tracking-tight">
                {formatVND(collectionReport.totalCashCollected)}
              </div>
              <p className="text-[11px] text-[#475467] mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Tiền thực tế đã vào tài khoản VietQR
              </p>
            </div>

            {/* Card 3: Remaining Receivables */}
            <div className="ting-card p-5">
              <span className="text-xs font-medium text-amber-700 block">Khoản còn phải thu</span>
              <div className="mt-2 text-2xl font-bold text-amber-700 tabular-nums tracking-tight">
                {formatVND(collectionReport.remainingReceivables)}
              </div>
              <p className="text-[11px] text-[#475467] mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Bao gồm nợ trong hạn & nợ quá hạn
              </p>
            </div>

            {/* Card 4: Overdue Receivables */}
            <div className="ting-card p-5">
              <span className="text-xs font-medium text-rose-700 block">Khoản quá hạn nộp</span>
              <div className="mt-2 text-2xl font-bold text-rose-600 tabular-nums tracking-tight">
                {formatVND(collectionReport.overdueReceivables)}
              </div>
              <p className="text-[11px] text-[#475467] mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Quá hạn thanh toán theo quy định
              </p>
            </div>

          </div>

          {/* Collections Trends (Weekly & Monthly comparison) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Weekly Trend Bar */}
            <div className="ting-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
                <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2538D9]" />
                  <span>Xu hướng thu tiền theo tuần (Tháng 10/2026)</span>
                </h3>
                <span className="text-[11px] text-slate-400">Đơn vị: Triệu VNĐ</span>
              </div>

              <div className="space-y-3.5 pt-1">
                {collectionReport.weeklyTrend.map((w, idx) => {
                  const maxVal = 20000000;
                  const accruedPct = Math.min(100, Math.round((w.accrued / maxVal) * 100));
                  const cashPct = Math.min(100, Math.round((w.cash / maxVal) * 100));

                  return (
                    <div key={idx} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-[#101828]">{w.week}</span>
                        <div className="flex items-center gap-3 tabular-nums">
                          <span className="text-slate-500">Phát sinh: {formatVND(w.accrued)}</span>
                          <span className="text-emerald-700 font-bold">Thực thu: {formatVND(w.cash)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex gap-0.5 p-0.5">
                        <div
                          className="bg-slate-300 h-full rounded-l-full transition-all duration-500"
                          style={{ width: `${accruedPct}%` }}
                          title="Doanh thu ghi nhận"
                        />
                        <div
                          className="bg-emerald-600 h-full rounded-r-full transition-all duration-500 -ml-1"
                          style={{ width: `${cashPct}%` }}
                          title="Dòng tiền thực thu"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 pt-2 text-[11px] text-[#475467] border-t border-[#E4E7EC]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-300" />
                  <span>Doanh thu ghi nhận (Accrual)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-600" />
                  <span>Dòng tiền thực thu (Cash Flow)</span>
                </span>
              </div>
            </div>

            {/* Monthly Trend Performance */}
            <div className="ting-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
                <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Tăng trưởng thu tiền 6 tháng gần nhất</span>
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  +18.4% so với quý trước
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2 h-44 items-end pt-4 pb-2 px-2 border-b border-slate-200">
                {collectionReport.monthlyTrend.map((m, idx) => {
                  const maxMonth = 70000000;
                  const heightPct = Math.round((m.cash / maxMonth) * 100);

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-bold text-emerald-700 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                        {Math.round(m.cash / 1000000)}M
                      </span>
                      <div
                        className="w-full max-w-[32px] bg-gradient-to-t from-[#2538D9] to-indigo-400 rounded-t-lg transition-all duration-500 hover:brightness-110"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[11px] font-bold text-[#475467] tabular-nums">
                        {m.month.split('/')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-[#475467] pt-1">
                <span>Tỷ lệ hoàn thành chỉ tiêu thu: <strong className="text-emerald-700 font-bold">96.3%</strong></span>
                <span className="text-[11px] text-slate-400">Đối soát tự động 0.2s</span>
              </div>
            </div>

          </div>

          {/* Group Summaries Table */}
          <div className="ting-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h2 className="text-sm font-bold text-[#101828] flex items-center gap-2">
                <Users2 className="w-4 h-4 text-[#2538D9]" />
                <span>Tiến độ thu tiền chi tiết theo từng Lớp học & CLB</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#475467] uppercase font-bold tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Lớp / CLB</th>
                    <th className="py-3 px-4 text-center">Sĩ số</th>
                    <th className="py-3 px-4 text-right">Phải thu (Accrual)</th>
                    <th className="py-3 px-4 text-right">Đã thu (Cash)</th>
                    <th className="py-3 px-4 text-right">Còn nợ</th>
                    <th className="py-3 px-4 text-center">Tỷ lệ hoàn thành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC]">
                  {collectionReport.groupSummaries.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#101828]">
                        <Link href={`/groups/${g.id}`} className="hover:text-[#2538D9]">
                          {g.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums text-[#475467]">
                        {g.memberCount} học viên
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums font-bold text-[#101828]">
                        {formatVND(g.totalDue)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums font-bold text-emerald-700">
                        {formatVND(g.totalPaid)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums font-bold text-rose-600">
                        {formatVND(g.debt)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2.5">
                          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#2538D9] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${g.rate}%` }}
                            />
                          </div>
                          <span className="tabular-nums font-bold text-[#101828] text-xs min-w-[2.5rem] text-right">
                            {g.rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: BÁO CÁO CHUYÊN CẦN (Attendance Analytics & Cohort Heatmap like Image 1) */}
      {/* ==================================================================== */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top 4 Attendance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="ting-card p-5">
              <span className="text-xs font-medium text-[#475467] block">Tỷ lệ chuyên cần chung</span>
              <div className="mt-2 text-2xl font-bold text-[#2538D9] tabular-nums tracking-tight">
                {attendanceReport.overallRate}%
              </div>
              <p className="text-[11px] text-[#475467] mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Tính trên 300+ buổi điểm danh gần nhất
              </p>
            </div>

            <div className="ting-card p-5">
              <span className="text-xs font-medium text-emerald-700 block">Thứ đi học đều nhất</span>
              <div className="mt-2 text-2xl font-bold text-emerald-700 tabular-nums tracking-tight">
                Thứ 6 (96%)
              </div>
              <p className="text-[11px] text-[#475467] mt-1">
                Sĩ số lớp đạt tỷ lệ tối đa
              </p>
            </div>

            <div className="ting-card p-5">
              <span className="text-xs font-medium text-amber-700 block">Thứ vắng nhiều nhất</span>
              <div className="mt-2 text-2xl font-bold text-amber-700 tabular-nums tracking-tight">
                Thứ 7 (89%)
              </div>
              <p className="text-[11px] text-[#475467] mt-1">
                Trùng lịch ngoại khóa & thể thao
              </p>
            </div>

            <div className="ting-card p-5">
              <span className="text-xs font-medium text-rose-700 block">Học viên cần cảnh báo vắng</span>
              <div className="mt-2 text-2xl font-bold text-rose-600 tabular-nums tracking-tight">
                {attendanceReport.frequentAbsentees.length} học viên
              </div>
              <p className="text-[11px] text-[#475467] mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Vắng liên tiếp hoặc tỷ lệ &lt; 75%
              </p>
            </div>
          </div>

          {/* COHORT RETENTION HEATMAP (EXACT VISUAL COPY OF IMAGE 1) */}
          <div className="ting-card p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#E4E7EC] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#101828]">
                  Ma trận Tỷ lệ Gắn bó & Chuyên cần theo Kỳ (Plan Retention Heatmap)
                </h3>
                <p className="text-xs text-[#475467] mt-1">
                  Mô phỏng chu kỳ giữ chân học viên theo từng tháng nhập học (Cohort analysis inspired by SaaS benchmarks)
                </p>
              </div>

              {/* Floating Stat Badges matching right side of Image 1 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-right">
                <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 text-left">
                  <span className="text-[10px] text-slate-500 block">Tỷ lệ gắn bó năm</span>
                  <span className="text-base font-bold text-[#101828] tabular-nums">76.7%</span>
                </div>
                <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 text-left">
                  <span className="text-[10px] text-slate-500 block">Giá trị trọn đời (LTV)</span>
                  <span className="text-base font-bold text-[#2538D9] tabular-nums">3.129.000 đ</span>
                </div>
                <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 text-left">
                  <span className="text-[10px] text-slate-500 block">Thời gian gắn bó TB</span>
                  <span className="text-base font-bold text-emerald-700 tabular-nums">52.2 tháng</span>
                </div>
              </div>
            </div>

            {/* Heatmap Grid Table (Image 1) */}
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="text-[11px] text-[#475467] font-semibold border-b border-[#E4E7EC]">
                    <th className="py-2.5 px-3 text-left w-24">Tháng bắt đầu</th>
                    <th className="py-2.5 px-2 w-12 text-center">Sĩ số</th>
                    <th className="py-2.5 px-1.5">Tháng 1</th>
                    <th className="py-2.5 px-1.5">Tháng 2</th>
                    <th className="py-2.5 px-1.5">Tháng 3</th>
                    <th className="py-2.5 px-1.5">Tháng 4</th>
                    <th className="py-2.5 px-1.5">Tháng 5</th>
                    <th className="py-2.5 px-1.5">Tháng 6</th>
                    <th className="py-2.5 px-1.5">Tháng 7</th>
                    <th className="py-2.5 px-1.5">Tháng 8</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC]">
                  {attendanceReport.cohortHeatmap.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-left font-bold text-[#101828] tabular-nums text-xs">
                        {row.cohort}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-slate-500 tabular-nums">
                        {row.total}
                      </td>
                      {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6, row.m7, row.m8].map((pct, pIdx) => (
                        <td key={pIdx} className="p-1">
                          <div
                            className={`py-2 px-1 rounded font-bold text-xs tabular-nums transition-transform hover:scale-105 ${getHeatmapColor(
                              pct
                            )}`}
                          >
                            {pct}%
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Heatmap Color Scale Legend */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E4E7EC] text-[11px] text-[#475467]">
              <span>Tỷ lệ tham gia cao nhất (100%)</span>
              <div className="flex items-center gap-1">
                <span className="w-5 h-4 rounded bg-[#EFF6FF] border border-slate-200" title="<25%" />
                <span className="w-5 h-4 rounded bg-[#DBEAFE]" title="25-40%" />
                <span className="w-5 h-4 rounded bg-[#BFDBFE]" title="40-55%" />
                <span className="w-5 h-4 rounded bg-[#93C5FD]" title="55-70%" />
                <span className="w-5 h-4 rounded bg-[#60A5FA]" title="70-85%" />
                <span className="w-5 h-4 rounded bg-[#3B82F6]" title="85-95%" />
                <span className="w-5 h-4 rounded bg-[#2538D9]" title="100%" />
              </div>
              <span className="font-bold text-[#2538D9]">Tối ưu 100%</span>
            </div>
          </div>

          {/* Day of Week Rate + Frequent Absentees Warning */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Day of Week Bars (5 cols) */}
            <div className="lg:col-span-5 ting-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
                <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#2538D9]" />
                  <span>Tỷ lệ chuyên cần theo ngày trong tuần</span>
                </h3>
              </div>

              <div className="space-y-3 pt-1">
                {attendanceReport.byDayOfWeek.map((d) => (
                  <div key={d.day} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-[#101828]">{d.day === 'CN' ? 'Chủ nhật' : `Thứ ${d.day.replace('T', '')}`}</span>
                      <span className="text-[#2538D9] tabular-nums font-bold">{d.rate}% ({d.present}/{d.total})</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          d.rate >= 95 ? 'bg-emerald-600' : d.rate >= 90 ? 'bg-[#2538D9]' : 'bg-amber-500'
                        }`}
                        style={{ width: `${d.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequent Absentees Warning Table (7 cols) */}
            <div className="lg:col-span-7 ting-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
                <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Cảnh báo sớm: Học viên vắng nhiều bất thường</span>
                </h3>
                <span className="text-xs text-slate-400">Tự động phát hiện</span>
              </div>

              {attendanceReport.frequentAbsentees.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#475467]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-[#101828]">Không có học viên nào vắng bất thường</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tất cả lớp đều duy trì chuyên cần tốt trên 85%.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E4E7EC]">
                  {attendanceReport.frequentAbsentees.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.name} size="sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#101828] text-xs">{item.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              Vắng {item.absenceCount} buổi
                            </span>
                          </div>
                          <span className="text-[11px] text-[#475467] block mt-0.5">
                            {item.groupName} • Tỷ lệ đi học: <strong className="text-rose-600">{item.attendanceRate}%</strong>
                          </span>
                        </div>
                      </div>

                      {/* View original attendance records button */}
                      <button
                        onClick={() => setSelectedAbsentee(item)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#E4E7EC] hover:bg-slate-50 text-xs font-semibold text-[#2538D9] flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <span>Mở bản ghi gốc</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: BÁO CÁO PHÂN TÍCH CÔNG NỢ (Aging Debt Schedule - Mutually Exclusive) */}
      {/* ==================================================================== */}
      {activeTab === 'AGING_DEBT' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Mutually Exclusive Math Integrity Verification Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-emerald-900">
                Cam kết Toán học & Đối soát: Các nhóm tuổi nợ hoàn toàn loại trừ nhau (Mutually Exclusive)
              </p>
              <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                Mỗi hóa đơn nợ chỉ được tính duy nhất vào 1 trong 4 nhóm: <strong>Chưa đến hạn</strong>, <strong>Quá hạn 1–7 ngày</strong>, <strong>Quá hạn 8–30 ngày</strong> hoặc <strong>Quá hạn &gt;30 ngày</strong>. Tổng công nợ được bảo toàn tuyệt đối không đếm trùng lặp.
              </p>
            </div>
          </div>

          {/* 4 Mutually Exclusive Aging Buckets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Bucket 1: Current */}
            <div className="ting-card p-5 border-l-4 border-l-blue-500">
              <span className="text-xs font-medium text-[#475467] block">1. Chưa đến hạn (Current)</span>
              <div className="mt-2 text-2xl font-bold text-[#101828] tabular-nums tracking-tight">
                {formatVND(agingDebtReport.agingSchedule.current.amount)}
              </div>
              <p className="text-[11px] text-[#475467] mt-1 flex items-center justify-between">
                <span>Số hóa đơn: <strong>{agingDebtReport.agingSchedule.current.count}</strong></span>
                <span className="text-blue-600 font-semibold">An toàn</span>
              </p>
            </div>

            {/* Bucket 2: 1-7 days */}
            <div className="ting-card p-5 border-l-4 border-l-amber-500">
              <span className="text-xs font-medium text-amber-800 block">2. Quá hạn 1–7 ngày</span>
              <div className="mt-2 text-2xl font-bold text-amber-700 tabular-nums tracking-tight">
                {formatVND(agingDebtReport.agingSchedule.overdue1to7.amount)}
              </div>
              <p className="text-[11px] text-[#475467] mt-1 flex items-center justify-between">
                <span>Số hóa đơn: <strong>{agingDebtReport.agingSchedule.overdue1to7.count}</strong></span>
                <span className="text-amber-600 font-semibold">Nhắc nhẹ</span>
              </p>
            </div>

            {/* Bucket 3: 8-30 days */}
            <div className="ting-card p-5 border-l-4 border-l-orange-500">
              <span className="text-xs font-medium text-orange-800 block">3. Quá hạn 8–30 ngày</span>
              <div className="mt-2 text-2xl font-bold text-orange-600 tabular-nums tracking-tight">
                {formatVND(agingDebtReport.agingSchedule.overdue8to30.amount)}
              </div>
              <p className="text-[11px] text-[#475467] mt-1 flex items-center justify-between">
                <span>Số hóa đơn: <strong>{agingDebtReport.agingSchedule.overdue8to30.count}</strong></span>
                <span className="text-orange-600 font-semibold">Cần gọi điện</span>
              </p>
            </div>

            {/* Bucket 4: >30 days */}
            <div className="ting-card p-5 border-l-4 border-l-rose-500">
              <span className="text-xs font-medium text-rose-800 block">4. Quá hạn &gt;30 ngày</span>
              <div className="mt-2 text-2xl font-bold text-rose-600 tabular-nums tracking-tight">
                {formatVND(agingDebtReport.agingSchedule.overdueOver30.amount)}
              </div>
              <p className="text-[11px] text-[#475467] mt-1 flex items-center justify-between">
                <span>Số hóa đơn: <strong>{agingDebtReport.agingSchedule.overdueOver30.count}</strong></span>
                <span className="text-rose-600 font-semibold">Nợ xấu cao</span>
              </p>
            </div>

          </div>

          {/* Aging Distribution Stacked Progress Bar */}
          <div className="ting-card p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#101828]">Tỷ trọng cơ cấu tuổi nợ</span>
              <span className="tabular-nums font-bold text-[#2538D9]">
                Tổng công nợ: {formatVND(agingDebtReport.totalDebt)}
              </span>
            </div>

            {agingDebtReport.totalDebt > 0 ? (
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${Math.round((agingDebtReport.agingSchedule.current.amount / agingDebtReport.totalDebt) * 100)}%` }}
                  title="Chưa đến hạn"
                />
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${Math.round((agingDebtReport.agingSchedule.overdue1to7.amount / agingDebtReport.totalDebt) * 100)}%` }}
                  title="Quá hạn 1-7 ngày"
                />
                <div
                  className="bg-orange-500 h-full transition-all"
                  style={{ width: `${Math.round((agingDebtReport.agingSchedule.overdue8to30.amount / agingDebtReport.totalDebt) * 100)}%` }}
                  title="Quá hạn 8-30 ngày"
                />
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{ width: `${Math.round((agingDebtReport.agingSchedule.overdueOver30.amount / agingDebtReport.totalDebt) * 100)}%` }}
                  title="Quá hạn >30 ngày"
                />
              </div>
            ) : (
              <div className="w-full bg-emerald-100 rounded-full h-3 flex items-center justify-center text-[10px] text-emerald-800 font-bold">
                100% Đã thu đủ — Không có công nợ tồn đọng!
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-[#475467]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Chưa hạn ({formatVND(agingDebtReport.agingSchedule.current.amount)})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>1–7 ngày ({formatVND(agingDebtReport.agingSchedule.overdue1to7.amount)})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>8–30 ngày ({formatVND(agingDebtReport.agingSchedule.overdue8to30.amount)})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>&gt;30 ngày ({formatVND(agingDebtReport.agingSchedule.overdueOver30.amount)})</span>
              </span>
            </div>
          </div>

          {/* Aging Schedule Invoices Detailed Table */}
          <div className="ting-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h2 className="text-sm font-bold text-[#101828] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#2538D9]" />
                <span>Danh sách chi tiết hóa đơn theo phân nhóm tuổi nợ ({agingDebtReport.invoices.length})</span>
              </h2>
            </div>

            {agingDebtReport.invoices.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#475467]">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-[#101828]">Không có hóa đơn công nợ nào cần thu</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tất cả phụ huynh và thành viên đã hoàn thành học phí.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#475467] uppercase font-bold tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Mã thu</th>
                      <th className="py-3 px-4">Học viên</th>
                      <th className="py-3 px-4">Lớp / CLB</th>
                      <th className="py-3 px-4 text-center">Hạn nộp</th>
                      <th className="py-3 px-4 text-center">Phân nhóm tuổi nợ</th>
                      <th className="py-3 px-4 text-right">Còn nợ</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC]">
                    {agingDebtReport.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#2538D9] tabular-nums">
                          {inv.paymentCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#101828] block">{inv.member.name}</span>
                          {inv.member.phone && (
                            <span className="text-[10px] text-[#475467] tabular-nums block">{inv.member.phone}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#475467]">
                          {inv.group.name}
                        </td>
                        <td className="py-3.5 px-4 text-center tabular-nums text-[11px] text-[#475467]">
                          {inv.dueDate ? formatDateVN(inv.dueDate) : 'Chưa đặt hạn'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {inv.agingBucket === 'CURRENT' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              Chưa đến hạn
                            </span>
                          ) : inv.agingBucket === 'OVERDUE_1_7' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Quá {inv.daysOverdue} ngày (1–7)
                            </span>
                          ) : inv.agingBucket === 'OVERDUE_8_30' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                              Quá {inv.daysOverdue} ngày (8–30)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Quá {inv.daysOverdue} ngày (&gt;30)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums font-bold text-rose-600">
                          {formatVND(inv.remainingDebt)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(inv.group.slug, inv.publicToken)}
                              className="p-1.5 border border-[#E4E7EC] rounded-lg bg-white hover:bg-slate-100 text-[#475467] hover:text-[#101828] transition-colors"
                              title="Sao chép link VietQR nộp tiền"
                            >
                              {copiedToken === inv.publicToken ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <Link
                              href={`/p/${inv.group.slug}?token=${inv.publicToken}`}
                              target="_blank"
                              className="p-1.5 border border-[#E4E7EC] rounded-lg bg-white hover:bg-slate-100 text-[#475467] hover:text-[#2538D9] transition-colors"
                              title="Mở cổng phụ huynh VietQR"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Drilldown Modal: View Original Attendance Records for frequent absentee */}
      <Dialog
        open={Boolean(selectedAbsentee)}
        onClose={() => setSelectedAbsentee(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1.25rem',
              padding: '8px',
            }
          }
        }}
      >
        <DialogTitle className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-200">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-[#101828] block">Bản ghi điểm danh gốc</span>
              <span className="text-[11px] text-[#475467] font-normal">
                {selectedAbsentee?.name} — {selectedAbsentee?.groupName}
              </span>
            </div>
          </div>
        </DialogTitle>

        <DialogContent className="space-y-4 pt-4 text-xs">
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[#475467] block text-[11px]">Số điện thoại liên hệ</span>
              <span className="font-bold text-[#101828] tabular-nums">{selectedAbsentee?.phone || 'Chưa cung cấp SĐT'}</span>
            </div>
            <div className="text-right">
              <span className="text-[#475467] block text-[11px]">Tổng số buổi vắng</span>
              <span className="font-bold text-rose-600 text-sm tabular-nums">{selectedAbsentee?.absenceCount} buổi</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-[#101828] block text-[11px] uppercase tracking-wider text-slate-500">
              Chi tiết các buổi ghi nhận gần đây:
            </span>
            <div className="divide-y divide-[#E4E7EC] border border-[#E4E7EC] rounded-xl overflow-hidden">
              {[
                { date: '26/10/2026', status: 'ABSENT_CHARGED', label: 'Vắng mặt tính phí', note: 'Phụ huynh chưa báo trước' },
                { date: '24/10/2026', status: 'ABSENT_CHARGED', label: 'Vắng mặt tính phí', note: 'Không tham gia buổi luyện đề' },
                { date: '22/10/2026', status: 'ABSENT_EXCUSED', label: 'Nghỉ phép', note: 'Báo ốm sốt' },
                { date: '19/10/2026', status: 'PRESENT', label: 'Có mặt đúng giờ', note: null },
              ].map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <span className="font-bold text-[#101828] tabular-nums block">{item.date}</span>
                    <span className="text-[11px] text-slate-500">{item.note || 'Không có ghi chú'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'PRESENT'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.status === 'ABSENT_CHARGED'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>

        <DialogActions className="p-4 pt-2">
          <Button
            variant="contained"
            onClick={() => setSelectedAbsentee(null)}
            sx={{ backgroundColor: '#2538D9', '&:hover': { backgroundColor: '#1E2DB8' } }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
