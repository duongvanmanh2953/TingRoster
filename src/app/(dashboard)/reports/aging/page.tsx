'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatVND, formatCompactVND } from '@/lib/utils';
import {
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Send,
  Sparkles,
  Phone,
  Layers,
  ArrowRight
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import { ReportHeader } from '@/components/reports/ReportHeader';
import { type DatePeriodPreset } from '@/components/common/DateRangeFilter';
import { DebtAgingDistributionChart } from '@/components/reports/ReportCharts';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';

export default function AgingDebtReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriodPreset>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-28');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);
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
      .catch((err) => console.error('Failed to load aging report:', err))
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

  const handleSendReminder = async (invoiceId: string) => {
    setRemindingId(invoiceId);
    try {
      await fetch('/api/automations/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      alert('Đã gửi thông báo nhắc nợ VietQR thành công!');
    } catch {
      alert('Lỗi khi gửi nhắc nợ');
    } finally {
      setRemindingId(null);
    }
  };

  const agingData = data?.agingDebtReport || {
    totalDebt: 0,
    agingSchedule: {
      current: { amount: 0, count: 0, label: 'Chưa đến hạn' },
      overdue1to7: { amount: 0, count: 0, label: 'Quá hạn 1–7 ngày' },
      overdue8to30: { amount: 0, count: 0, label: 'Quá hạn 8–30 ngày' },
      overdueOver30: { amount: 0, count: 0, label: 'Quá hạn >30 ngày' },
    },
    invoices: [],
  };

  const handleExportCsv = () => {
    const rows = [
      ['Mã hóa đơn', 'Học viên / Thành viên', 'Số điện thoại', 'Lớp / Không gian', 'Số tiền phải thu', 'Số tiền còn nợ', 'Hạn thanh toán', 'Số ngày quá hạn', 'Phân loại tuổi nợ'],
      ...agingData.invoices.map((inv: any) => [
        inv.paymentCode,
        inv.member.name,
        inv.member.phone || '—',
        inv.group.name,
        inv.amountDue,
        inv.remainingDebt,
        inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('vi-VN') : '—',
        inv.daysOverdue,
        inv.agingBucket,
      ]),
    ];
    const csvContent = '\uFEFF' + rows.map((e) => e.map((val: string | number) => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bao_cao_tuoi_no_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <CircularProgress size={32} sx={{ color: '#2538D9' }} />
        <p className="text-xs text-slate-500 font-medium">Đang tính toán tuổi nợ và phân bổ theo Thông tư BTC...</p>
      </div>
    );
  }

  const filteredInvoices = selectedBucket
    ? agingData.invoices.filter((inv: any) => inv.agingBucket === selectedBucket)
    : agingData.invoices;

  const pagedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Breadcrumbs & Date Filter */}
      <ReportHeader
        title="Báo cáo Tuổi nợ & Công nợ quá hạn"
        description="Phân loại công nợ theo 4 chu kỳ quá hạn (Aging Schedule) để phát hiện sớm rủi ro nợ xấu và kích hoạt quy trình thu hồi tự động"
        currentBreadcrumb="Báo cáo Tuổi nợ"
        icon={Clock}
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

      {/* 2. AI Insight Banner */}
      <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-slate-800 p-4 rounded-xl flex items-start gap-3 shadow-xs border-l-4 border-l-rose-500">
        <Sparkles className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
          <strong className="font-bold text-[#101828] dark:text-white">Cảnh báo nợ quá hạn: </strong>
          Có <span className="font-bold text-rose-600">{agingData.agingSchedule.overdue1to7.count} khoản nợ</span> trong khung 1–7 ngày và{' '}
          <span className="font-bold text-rose-700">{agingData.agingSchedule.overdueOver30.count} khoản nợ khó đòi (&gt;30 ngày)</span>.
          Gửi link VietQR trực tiếp qua Zalo để học viên thanh toán ngay trên điện thoại không cần nhập số tài khoản.
        </div>
      </div>

      {/* 3. The 4 Aging Schedule Buckets (Clickable Filter Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bucket 1: Chưa đến hạn */}
        <div
          onClick={() => setSelectedBucket(selectedBucket === 'CURRENT' ? null : 'CURRENT')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            selectedBucket === 'CURRENT'
              ? 'ring-2 ring-blue-600 bg-blue-50/50 dark:bg-blue-950/20 border-blue-300'
              : 'bg-white dark:bg-[#111726] border-[#E4E7EC] dark:border-[#1E293B] hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">
            <span>Chưa đến hạn</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-bold">
              {agingData.agingSchedule.current.count} hóa đơn
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatVND(agingData.agingSchedule.current.amount)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Trong hạn quy định, chưa cần nhắc</p>
          </div>
        </div>

        {/* Bucket 2: Quá hạn 1–7 ngày */}
        <div
          onClick={() => setSelectedBucket(selectedBucket === 'OVERDUE_1_7' ? null : 'OVERDUE_1_7')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            selectedBucket === 'OVERDUE_1_7'
              ? 'ring-2 ring-amber-600 bg-amber-50/50 dark:bg-amber-950/20 border-amber-300'
              : 'bg-white dark:bg-[#111726] border-[#E4E7EC] dark:border-[#1E293B] hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
            <span>Quá hạn 1–7 ngày</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold">
              {agingData.agingSchedule.overdue1to7.count} hóa đơn
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
              {formatVND(agingData.agingSchedule.overdue1to7.amount)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Khung thời gian vàng để gửi nhắc nợ nhẹ</p>
          </div>
        </div>

        {/* Bucket 3: Quá hạn 8–30 ngày */}
        <div
          onClick={() => setSelectedBucket(selectedBucket === 'OVERDUE_8_30' ? null : 'OVERDUE_8_30')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            selectedBucket === 'OVERDUE_8_30'
              ? 'ring-2 ring-rose-500 bg-rose-50/50 dark:bg-rose-950/20 border-rose-300'
              : 'bg-white dark:bg-[#111726] border-[#E4E7EC] dark:border-[#1E293B] hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">
            <span>Quá hạn 8–30 ngày</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 font-bold">
              {agingData.agingSchedule.overdue8to30.count} hóa đơn
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatVND(agingData.agingSchedule.overdue8to30.amount)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Cần liên hệ trực tiếp với phụ huynh/người thuê</p>
          </div>
        </div>

        {/* Bucket 4: Quá hạn >30 ngày */}
        <div
          onClick={() => setSelectedBucket(selectedBucket === 'OVERDUE_OVER_30' ? null : 'OVERDUE_OVER_30')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            selectedBucket === 'OVERDUE_OVER_30'
              ? 'ring-2 ring-red-700 bg-red-50/50 dark:bg-red-950/20 border-red-300'
              : 'bg-white dark:bg-[#111726] border-[#E4E7EC] dark:border-[#1E293B] hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-red-700 dark:text-red-400 uppercase">
            <span>Quá hạn &gt; 30 ngày</span>
            <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 font-bold">
              {agingData.agingSchedule.overdueOver30.count} hóa đơn
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-red-800 dark:text-red-300">
              {formatVND(agingData.agingSchedule.overdueOver30.amount)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Rủi ro nợ khó đòi, cân nhắc tạm dừng dịch vụ</p>
          </div>
        </div>
      </div>

      {/* 4. Chart: Aging Distribution */}
      <div className="bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Phân bổ Công nợ theo Tuổi nợ (VND)</h3>
            <p className="text-xs text-slate-500">Nhấp vào từng cột để lọc danh sách chi tiết bên dưới</p>
          </div>
          {selectedBucket && (
            <button
              onClick={() => setSelectedBucket(null)}
              className="text-xs font-semibold text-[#2538D9] hover:underline"
            >
              Hiển thị tất cả
            </button>
          )}
        </div>
        <div className="mt-4">
          <DebtAgingDistributionChart
            schedule={agingData.agingSchedule}
            selectedBucket={selectedBucket}
            onSelectBucket={(bucket) => setSelectedBucket(bucket)}
          />
        </div>
      </div>

      {/* 5. Detailed Table: Overdue Invoices */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E4E7EC] dark:border-[#1E293B] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">
              Danh sách Khoản nợ {selectedBucket ? `(Lọc: ${selectedBucket})` : 'toàn hệ thống'}
            </h3>
            <p className="text-xs text-slate-500">Tổng cộng {filteredInvoices.length} khoản nợ cần theo dõi</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Mã hóa đơn</th>
                <th className="py-3 px-4">Học viên / Thành viên</th>
                <th className="py-3 px-4">Không gian</th>
                <th className="py-3 px-4 text-right">Còn nợ</th>
                <th className="py-3 px-4 text-center">Hạn chót</th>
                <th className="py-3 px-4 text-center">Quá hạn</th>
                <th className="py-3 px-4 text-center">Phân loại</th>
                <th className="py-3 px-4 text-center">Thao tác thu nợ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pagedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    Không có khoản nợ nào trong tiêu chí này. Tuyệt vời!
                  </td>
                </tr>
              ) : (
                pagedInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#2538D9]">{inv.paymentCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{inv.member.name}</div>
                      {inv.member.phone && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{inv.member.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{inv.group.name}</td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                      {formatVND(inv.remainingDebt)}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {inv.daysOverdue > 0 ? (
                        <span className="font-bold text-rose-600">{inv.daysOverdue} ngày</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Chưa đến hạn</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.agingBucket === 'CURRENT' ? 'bg-blue-50 text-blue-700' :
                        inv.agingBucket === 'OVERDUE_1_7' ? 'bg-amber-50 text-amber-700' :
                        inv.agingBucket === 'OVERDUE_8_30' ? 'bg-rose-50 text-rose-700' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {inv.agingBucket === 'CURRENT' ? 'Chưa đến hạn' :
                         inv.agingBucket === 'OVERDUE_1_7' ? '1–7 ngày' :
                         inv.agingBucket === 'OVERDUE_8_30' ? '8–30 ngày' : '>30 ngày'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(inv.group.slug, inv.publicToken)}
                          title="Sao chép link cổng thanh toán phụ huynh"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {copiedToken === inv.publicToken ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={remindingId === inv.id}
                          onClick={() => handleSendReminder(inv.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-[11px] font-semibold transition-colors disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          <span>Nhắc nợ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 6. Pagination */}
        <div className="border-t border-[#E4E7EC] dark:border-[#1E293B]">
          <TablePagination
            component="div"
            count={filteredInvoices.length}
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
