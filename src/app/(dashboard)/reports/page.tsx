'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatVND, formatCompactVND } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CalendarCheck,
  Scale,
  Landmark,
  ArrowRight,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Building2,
  Download,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import { ReportHeader } from '@/components/reports/ReportHeader';
import { type DatePeriodPreset } from '@/components/common/DateRangeFilter';
import {
  CollectionsTrendChart,
  PaymentStatusDonutChart
} from '@/components/reports/ReportCharts';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';

export default function ReportsOverviewPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriodPreset>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-28');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        }
      })
      .catch((err) => console.error('Failed to load overview reports:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCsv = () => {
    if (!data) return;
    const { collectionReport } = data;
    const rows = [
      ['Không gian / Lớp', 'Thành viên', 'Phải thu (VND)', 'Đã thu (VND)', 'Còn nợ (VND)', 'Tỷ lệ thu (%)'],
      ...collectionReport.groupSummaries.map((g: any) => [
        g.name,
        g.memberCount,
        g.totalDue,
        g.totalPaid,
        g.debt,
        `${g.rate}%`,
      ]),
    ];
    const csvContent = '\uFEFF' + rows.map((e) => e.map((val: string | number) => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tong_quan_bao_cao_tingroster_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <CircularProgress size={32} sx={{ color: '#2538D9' }} />
        <p className="text-xs text-slate-500 font-medium">Đang tổng hợp dữ liệu toàn bộ trung tâm báo cáo...</p>
      </div>
    );
  }

  const {
    collectionReport,
    attendanceReport,
    agingDebtReport,
    taxEstimateReport,
    bankReconciliationReport,
  } = data || {
    collectionReport: { totalAccrualDue: 0, totalCashCollected: 0, remainingReceivables: 0, collectionRate: 0, monthlyTrend: [], groupSummaries: [] },
    attendanceReport: { overallRate: 0, byDayOfWeek: [], frequentAbsentees: [] },
    agingDebtReport: { totalDebt: 0, agingSchedule: { overdue1to7: { count: 0 }, overdueOver30: { count: 0 } }, invoices: [] },
    taxEstimateReport: { annualAccumulatedRevenue: 0, isTaxExempt: true },
    bankReconciliationReport: { reconciledCount: 0, reconciledRate: 99.8 },
  };

  const pagedGroups = collectionReport.groupSummaries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Breadcrumbs & Action Controls */}
      <ReportHeader
        title="Trung tâm Báo cáo & Phân tích"
        description="Bảng tổng hợp điều hành toàn bộ dữ liệu tài chính, công nợ, điểm danh và đối soát tự động của TingRoster"
        currentBreadcrumb="Tổng quan"
        icon={BarChart3}
        selectedPeriod={selectedPeriod}
        startDate={customStartDate}
        endDate={customEndDate}
        onPeriodChange={(p, s, e) => {
          setSelectedPeriod(p);
          if (s) setCustomStartDate(s);
          if (e) setCustomEndDate(e);
        }}
        onExportCsv={handleExportCsv}
      />

      {/* 2. Smart AI Insight Bar */}
      <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-slate-800 p-4 rounded-xl flex items-start gap-3 shadow-xs border-l-4 border-l-[#2538D9]">
        <Sparkles className="w-5 h-5 text-[#2538D9] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
          <strong className="font-bold text-[#101828] dark:text-white">Tổng hợp điều hành TingRoster: </strong>
          Tỷ lệ thu tiền toàn hệ thống đạt <span className="font-bold text-[#2538D9]">{collectionReport.collectionRate}%</span>.
          Có <span className="font-bold text-rose-600">{agingDebtReport.agingSchedule.overdue1to7.count} học viên</span> bước vào hạn nợ 1–7 ngày.
          Tỷ lệ chuyên cần đạt <span className="font-bold text-emerald-600">{attendanceReport.overallRate}%</span>.
          Tất cả dữ liệu được đồng bộ trực tiếp từ giao dịch VietQR và nhật ký điểm danh.
        </div>
      </div>

      {/* 3. Executive Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard spotlightColor="rgba(37, 56, 217, 0.18)" className="p-5 border-l-4 border-l-[#2538D9]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <span>Tổng phải thu phát sinh</span>
            <DollarSign className="w-4 h-4 text-[#2538D9]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{formatVND(collectionReport.totalAccrualDue)}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#2538D9]">{formatCompactVND(collectionReport.totalAccrualDue)}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Toàn bộ hóa đơn trong kỳ</p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.18)" className="p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <span>Thực thu VietQR Napas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{formatVND(collectionReport.totalCashCollected)}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">{formatCompactVND(collectionReport.totalCashCollected)}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Đã đối soát vào tài khoản ngân hàng</p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.18)" className="p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <span>Công nợ còn tồn</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatVND(collectionReport.remainingReceivables)}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">{formatCompactVND(collectionReport.remainingReceivables)}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Tỷ lệ hoàn thành thu {collectionReport.collectionRate}%</p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(109, 92, 232, 0.18)" className="p-5 border-l-4 border-l-[#6D5CE8]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <span>Tỷ lệ chuyên cần chung</span>
            <CalendarCheck className="w-4 h-4 text-[#6D5CE8]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#6D5CE8]">{attendanceReport.overallRate}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Điểm danh qua một chạm / QR Kiosk</p>
        </SpotlightCard>
      </div>

      {/* 4. Specialized Report Direct Navigation Hub (Replaces old horizontal tabs completely!) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-[#101828] dark:text-[#F8FAFC]">
              Các Báo cáo Chuyên sâu trong Hệ thống
            </h2>
            <p className="text-xs text-slate-500">
              Chọn từng báo cáo chi tiết để xem biểu đồ, đối chiếu dữ liệu và xuất dữ liệu chuyên biệt
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Báo cáo Khoản thu & Dòng tiền */}
          <Link
            href="/reports/cashflow"
            className="group block bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] hover:border-[#2538D9] dark:hover:border-indigo-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2538D9] flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2538D9] group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">
              Báo cáo Khoản thu & Dòng tiền
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              So sánh Accrual (doanh thu phát sinh) và Cash Flow (thực thu) theo tuần và tháng.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-[#2538D9] font-semibold">
              Xem chi tiết dòng tiền &rarr;
            </div>
          </Link>

          {/* Card 2: Báo cáo Tuổi nợ */}
          <Link
            href="/reports/aging"
            className="group block bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                {agingDebtReport.agingSchedule.overdue1to7.count} quá hạn
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">
              Báo cáo Tuổi nợ & Công nợ quá hạn
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Phân loại 4 chu kỳ tuổi nợ (Aging Schedule), gửi link phụ huynh và nhắc nợ tự động.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-rose-600 font-semibold">
              Xem danh sách nợ &rarr;
            </div>
          </Link>

          {/* Card 3: Báo cáo Điểm danh & Chuyên cần */}
          <Link
            href="/reports/attendance"
            className="group block bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">
              Báo cáo Điểm danh & Chuyên cần
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tỷ lệ chuyên cần theo ngày trong tuần, bản đồ Heatmap và danh sách vắng nhiều.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 font-semibold">
              Xem phân tích chuyên cần &rarr;
            </div>
          </Link>

          {/* Card 4: Báo cáo Thuế TT 40 */}
          <Link
            href="/reports/tax"
            className="group block bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">
              Báo cáo Thuế TT 40/2021/TT-BTC
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Theo dõi hạn mức doanh thu 100tr miễn thuế và ước tính GTGT / TNCN theo từng ngành.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-amber-600 font-semibold">
              Xem ước tính thuế &rarr;
            </div>
          </Link>

          {/* Card 5: Báo cáo Đối soát VietQR Napas */}
          <Link
            href="/reports/reconciliation"
            className="group block bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#2538D9] flex items-center justify-center font-bold">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                99.8% khớp tự động
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">
              Báo cáo Đối soát VietQR Napas
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Sổ quỹ biến động số dư ngân hàng, đối chiếu hóa đơn và in biên bản pháp lý.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-[#2538D9] font-semibold">
              Xem sổ quỹ đối soát &rarr;
            </div>
          </Link>

          {/* Card 6: Xuất sổ sách kế toán */}
          <Link
            href="/export"
            className="group block bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">
              Xuất Sổ sách Kế toán (.xlsx)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Xuất dữ liệu Excel chuẩn hóa cho kế toán, danh sách học viên, hóa đơn và giao dịch.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
              Trung tâm xuất dữ liệu &rarr;
            </div>
          </Link>
        </div>
      </div>

      {/* 5. Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Xu hướng Dòng tiền thu theo tháng</h3>
            <p className="text-xs text-slate-500">So sánh thực thu và doanh thu phát sinh toàn hệ thống</p>
          </div>
          <div className="mt-4">
            <CollectionsTrendChart
              monthlyData={collectionReport.monthlyTrend || []}
              weeklyData={collectionReport.weeklyTrend || []}
            />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Cơ cấu Khoản thu</h3>
            <p className="text-xs text-slate-500">Tỷ lệ tiền đã vào tài khoản</p>
          </div>
          <div className="mt-4">
            <PaymentStatusDonutChart
              totalPaid={collectionReport.totalCashCollected}
              remainingDebt={collectionReport.remainingReceivables}
              overdue={agingDebtReport?.totalDebt || 0}
            />
          </div>
        </div>
      </div>

      {/* 6. Consolidated Detailed Table */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E4E7EC] dark:border-[#1E293B] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">
              Tổng hợp Thu phí theo từng Không gian & Lớp học
            </h3>
            <p className="text-xs text-slate-500">Dữ liệu tổng hợp từ các giao dịch VietQR đã ghi nhận</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Không gian / Lớp</th>
                <th className="py-3 px-4 text-center">Thành viên</th>
                <th className="py-3 px-4 text-right">Phải thu (Accrual)</th>
                <th className="py-3 px-4 text-right">Đã thu (Cash)</th>
                <th className="py-3 px-4 text-right">Còn nợ</th>
                <th className="py-3 px-4 text-center">Tiến độ</th>
                <th className="py-3 px-4 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pagedGroups.map((g: any) => (
                <tr key={g.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#2538D9]" />
                    <span>{g.name}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">{g.memberCount}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">{formatVND(g.totalDue)}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatVND(g.totalPaid)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-rose-600 dark:text-rose-400">
                    {g.debt > 0 ? formatVND(g.debt) : '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      g.rate >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      g.rate >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {g.rate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href="/reports/cashflow"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2538D9] hover:underline"
                    >
                      <span>Báo cáo thu tiền</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 7. Pagination */}
        <div className="border-t border-[#E4E7EC] dark:border-[#1E293B]">
          <TablePagination
            component="div"
            count={collectionReport.groupSummaries.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} trên tổng số ${count}`}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>
    </div>
  );
}
