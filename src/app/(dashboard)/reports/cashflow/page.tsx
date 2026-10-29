'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatVND, formatCompactVND } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users2,
  ArrowRight,
  Sparkles,
  Download
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

export default function CashflowReportPage() {
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
      .catch((err) => console.error('Failed to load cashflow report:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCsv = () => {
    if (!data?.collectionReport) return;
    const rows = [
      ['Tên nhóm / Lớp / Không gian', 'Số thành viên', 'Doanh thu phát sinh (VND)', 'Đã thực thu (VND)', 'Công nợ còn lại (VND)', 'Tỷ lệ thu tiền (%)', 'Số khoản chưa thu'],
      ...data.collectionReport.groupSummaries.map((g: any) => [
        g.name,
        g.memberCount,
        g.totalDue,
        g.totalPaid,
        g.debt,
        `${g.rate}%`,
        g.unpaidCount,
      ]),
    ];
    const csvContent = '\uFEFF' + rows.map((e) => e.map((val: string | number) => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bao_cao_thu_tien_dong_tien_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <CircularProgress size={32} sx={{ color: '#2538D9' }} />
        <p className="text-xs text-slate-500 font-medium">Đang tổng hợp báo cáo thu tiền và dòng tiền VietQR...</p>
      </div>
    );
  }

  const collection = data?.collectionReport || {
    totalAccrualDue: 0,
    totalCashCollected: 0,
    remainingReceivables: 0,
    collectionRate: 0,
    monthlyTrend: [],
    groupSummaries: [],
  };

  const pagedGroups = collection.groupSummaries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Header with Breadcrumbs & Date Filter */}
      <ReportHeader
        title="Báo cáo Khoản thu & Dòng tiền"
        description="Theo dõi chi tiết doanh thu phát sinh (Accrual), tiền thực nhận vào tài khoản (Cash Flow) và tỷ lệ thu hồi theo từng lớp học / không gian"
        currentBreadcrumb="Khoản thu & Dòng tiền"
        icon={TrendingUp}
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
          <strong className="font-bold text-[#101828] dark:text-white">Khuyến nghị dòng tiền TingRoster: </strong>
          Tỷ lệ thu tiền toàn hệ thống đạt <span className="font-bold text-[#2538D9]">{collection.collectionRate}%</span>. 
          Tiền thực nhận qua VietQR chiếm tỷ trọng vượt trội so với tiền mặt. Hãy tiếp tục duy trì gửi mã QR động kèm thông báo hạn chót.
        </div>
      </div>

      {/* 3. Top Metrics (Vertical Layout with Scannable Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard spotlightColor="rgba(37, 56, 217, 0.18)" className="p-5 border-l-4 border-l-[#2538D9]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <span>Doanh thu phát sinh</span>
            <DollarSign className="w-4 h-4 text-[#2538D9]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{formatVND(collection.totalAccrualDue)}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#2538D9]">{formatCompactVND(collection.totalAccrualDue)}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Tổng giá trị hóa đơn đã xuất trong kỳ</p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.18)" className="p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <span>Thực thu vào tài khoản</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{formatVND(collection.totalCashCollected)}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">{formatCompactVND(collection.totalCashCollected)}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Tiền thực nhận đã khớp đối soát tự động</p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.18)" className="p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <span>Công nợ còn lại</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatVND(collection.remainingReceivables)}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">{formatCompactVND(collection.remainingReceivables)}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Bao gồm chưa thanh toán & đóng thiếu</p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(109, 92, 232, 0.18)" className="p-5 border-l-4 border-l-[#6D5CE8]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <span>Tỷ lệ hoàn thành</span>
            <TrendingUp className="w-4 h-4 text-[#6D5CE8]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#6D5CE8]">{collection.collectionRate}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Mục tiêu trung tâm &gt; 90%</p>
        </SpotlightCard>
      </div>

      {/* 4. Charts Section (Xu hướng & Cơ cấu phân bố) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Xu hướng Dòng tiền thu theo tháng</h3>
              <p className="text-xs text-slate-500">So sánh doanh thu phát sinh và thực nhận vào tài khoản</p>
            </div>
          </div>
          <div className="mt-4">
            <CollectionsTrendChart
              monthlyData={collection.monthlyTrend || []}
              weeklyData={collection.weeklyTrend || []}
            />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Cơ cấu Thanh toán</h3>
              <p className="text-xs text-slate-500">Tỷ lệ theo trạng thái thực tế</p>
            </div>
          </div>
          <div className="mt-4">
            <PaymentStatusDonutChart
              totalPaid={collection.totalCashCollected}
              remainingDebt={collection.remainingReceivables}
              overdue={collection.overdueReceivables || 0}
            />
          </div>
        </div>
      </div>

      {/* 5. Detailed Table: Phân bổ theo từng nhóm / lớp */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E4E7EC] dark:border-[#1E293B] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Bảng chi tiết thu tiền theo Không gian & Lớp học</h3>
            <p className="text-xs text-slate-500">Dữ liệu tổng hợp từ các hóa đơn trong hệ thống</p>
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
                <th className="py-3 px-4 text-center">Chưa đóng</th>
                <th className="py-3 px-4 text-center">Hành động</th>
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
                  <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{g.unpaidCount}</td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/invoices?groupId=${g.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2538D9] hover:underline"
                    >
                      <span>Xem khoản thu</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 6. Pagination */}
        <div className="border-t border-[#E4E7EC] dark:border-[#1E293B]">
          <TablePagination
            component="div"
            count={collection.groupSummaries.length}
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
