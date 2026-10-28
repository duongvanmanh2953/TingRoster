'use client';

import React, { useState, useEffect } from 'react';
import { formatVND, formatCompactVND, formatDateVN } from '@/lib/utils';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
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
  ArrowRight,
  FileSpreadsheet,
  Landmark,
  ReceiptText,
  Scale,
  Printer
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';
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
import { LegalPrintableReconciliationReport } from '@/components/documents/LegalPrintableReconciliationReport';
import { AttendanceCalendarHeatmap } from '@/components/attendance/AttendanceCalendarHeatmap';
import { DateRangeFilter, type DatePeriodPreset } from '@/components/common/DateRangeFilter';
import TablePagination from '@mui/material/TablePagination';

interface TaxEstimateReport {
  taxYear: number;
  annualAccumulatedRevenue: number;
  taxThreshold: number;
  isTaxExempt: boolean;
  thresholdUsagePercent: number;
  propertyRental: {
    categoryName: string;
    totalRate: number;
    vatRate: number;
    pitRate: number;
    estimatedTotalTax: number;
    estimatedVat: number;
    estimatedPit: number;
  };
  educationAndSports: {
    categoryName: string;
    totalRate: number;
    vatRate: number;
    pitRate: number;
    estimatedTotalTax: number;
    estimatedVat: number;
    estimatedPit: number;
  };
  legalCitation: string;
}

interface BankReconciliationReport {
  totalCashCollected: number;
  reconciledCount: number;
  reconciledRate: number;
  recentTransactions: Array<{
    id: string;
    transactionDate: string;
    bankRef: string;
    senderName: string;
    paymentCode: string;
    amount: number;
    channel: string;
    status: 'MATCHED';
    groupName: string;
  }>;
}

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
  taxEstimateReport?: TaxEstimateReport;
  bankReconciliationReport?: BankReconciliationReport;
}

function getTabFromQuery(param: string | null): 'COLLECTIONS' | 'ATTENDANCE' | 'AGING_DEBT' | 'TAX_ESTIMATE' | 'CASH_LEDGER' {
  switch (param) {
    case 'attendance':
      return 'ATTENDANCE';
    case 'aging':
      return 'AGING_DEBT';
    case 'tax':
      return 'TAX_ESTIMATE';
    case 'reconciliation':
      return 'CASH_LEDGER';
    case 'cashflow':
    default:
      return 'COLLECTIONS';
  }
}

function getQueryFromTab(tab: 'COLLECTIONS' | 'ATTENDANCE' | 'AGING_DEBT' | 'TAX_ESTIMATE' | 'CASH_LEDGER'): string {
  switch (tab) {
    case 'ATTENDANCE':
      return 'attendance';
    case 'AGING_DEBT':
      return 'aging';
    case 'TAX_ESTIMATE':
      return 'tax';
    case 'CASH_LEDGER':
      return 'reconciliation';
    case 'COLLECTIONS':
    default:
      return 'cashflow';
  }
}

function ReportsPageContent() {
  const searchParams = useSearchParams();
  const { t, locale } = useLanguage();

  const tabQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'COLLECTIONS' | 'ATTENDANCE' | 'AGING_DEBT' | 'TAX_ESTIMATE' | 'CASH_LEDGER'>(
    getTabFromQuery(tabQuery)
  );

  useEffect(() => {
    const nextTab = getTabFromQuery(tabQuery);
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [tabQuery]);

  const tabTitles: Record<typeof activeTab, string> = {
    COLLECTIONS: t('reports.tab_collections'),
    ATTENDANCE: t('reports.tab_attendance'),
    AGING_DEBT: t('reports.tab_aging'),
    TAX_ESTIMATE: t('reports.tab_tax'),
    CASH_LEDGER: t('reports.tab_cash'),
  };
  usePageTitle(`${tabTitles[activeTab]} — ${t('reports.title')}`);

  const [selectedTaxCategory, setSelectedTaxCategory] = useState<'EDUCATION' | 'RENTAL'>('EDUCATION');
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriodPreset>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-28');
  const [attendanceSubView, setAttendanceSubView] = useState<'CALENDAR' | 'COHORT'>('CALENDAR');
  const [groupTablePage, setGroupTablePage] = useState<number>(0);
  const [groupTableRowsPerPage, setGroupTableRowsPerPage] = useState<number>(10);
  const [data, setData] = useState<ReportApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showPrintReport, setShowPrintReport] = useState(false);

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

  // Real CSV Exporter
  const exportToCsv = (filename: string, rows: (string | number)[][]) => {
    const csvContent = '\uFEFF' + rows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCurrentTab = () => {
    if (!data) return;

    if (activeTab === 'COLLECTIONS') {
      const rows: (string | number)[][] = [
        ['Lớp / Nhóm', 'Sĩ số', 'Phải thu (Accrual)', 'Đã thu (Cash-in)', 'Còn nợ', 'Tỷ lệ thu %'],
        ...data.collectionReport.groupSummaries.map((g) => [
          g.name,
          g.memberCount,
          g.totalDue,
          g.totalPaid,
          g.debt,
          `${g.rate}%`,
        ]),
      ];
      exportToCsv('bao_cao_thu_tien_tingroster.csv', rows);
    } else if (activeTab === 'ATTENDANCE') {
      const rows: (string | number)[][] = [
        ['Học viên', 'Lớp học', 'Số buổi vắng', 'Tỷ lệ có mặt', 'Mức độ cảnh báo', 'Buổi gần nhất'],
        ...data.attendanceReport.frequentAbsentees.map((a) => [
          a.name,
          a.groupName,
          a.absenceCount,
          `${a.attendanceRate}%`,
          a.warningLevel === 'HIGH' ? 'Cao' : 'Trung bình',
          a.lastDate,
        ]),
      ];
      exportToCsv('bao_cao_chuyen_can_tingroster.csv', rows);
    } else if (activeTab === 'AGING_DEBT') {
      const rows: (string | number)[][] = [
        ['Mã nợ', 'Học viên', 'Số điện thoại', 'Lớp', 'Còn nợ (VND)', 'Số ngày quá hạn', 'Phân nhóm tuổi nợ'],
        ...data.agingDebtReport.invoices.map((inv) => [
          inv.paymentCode,
          inv.member.name,
          inv.member.phone || '',
          inv.group.name,
          inv.remainingDebt,
          inv.daysOverdue,
          inv.agingBucket,
        ]),
      ];
      exportToCsv('bao_cao_tuoi_no_tingroster.csv', rows);
    } else if (activeTab === 'TAX_ESTIMATE') {
      const taxData = data.taxEstimateReport;
      const rows: (string | number)[][] = [
        ['Năm tính thuế', 'Doanh thu lũy kế (VND)', 'Ngưỡng miễn thuế (VND)', 'Trạng thái', 'Loại hình kinh doanh', 'Thuế GTGT', 'Thuế TNCN', 'Tổng thuế ước tính'],
        [
          taxData?.taxYear || 2026,
          taxData?.annualAccumulatedRevenue || 0,
          100000000,
          (taxData?.isTaxExempt ? 'Miễn thuế (Dưới 100tr)' : 'Phải nộp thuế'),
          selectedTaxCategory === 'EDUCATION' ? 'Dạy thêm / CLB Thể thao (7%)' : 'Cho thuê nhà trọ (10%)',
          selectedTaxCategory === 'EDUCATION' ? (taxData?.educationAndSports.estimatedVat || 0) : (taxData?.propertyRental.estimatedVat || 0),
          selectedTaxCategory === 'EDUCATION' ? (taxData?.educationAndSports.estimatedPit || 0) : (taxData?.propertyRental.estimatedPit || 0),
          selectedTaxCategory === 'EDUCATION' ? (taxData?.educationAndSports.estimatedTotalTax || 0) : (taxData?.propertyRental.estimatedTotalTax || 0),
        ],
      ];
      exportToCsv('bang_ke_doanh_thu_thue_TT40.csv', rows);
    } else if (activeTab === 'CASH_LEDGER') {
      const txs = data.bankReconciliationReport?.recentTransactions || [];
      const rows: (string | number)[][] = [
        ['Mã GD', 'Thời gian', 'Mã ngân hàng (BankRef)', 'Người nộp', 'Mã hóa đơn', 'Nhóm / Lớp / Phòng', 'Số tiền (VND)', 'Kênh thanh toán', 'Trạng thái'],
        ...txs.map((tx) => [
          tx.id,
          tx.transactionDate,
          tx.bankRef,
          tx.senderName,
          tx.paymentCode,
          tx.groupName,
          tx.amount,
          tx.channel,
          'Đã đối soát tự động',
        ]),
      ];
      exportToCsv('so_quy_tien_gui_vietqr.csv', rows);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-slate-500 dark:text-slate-400 text-xs font-medium flex flex-col items-center justify-center space-y-3">
        <CircularProgress size={28} sx={{ color: '#2538D9' }} />
        <p>Đang tổng hợp dữ liệu tài chính, chuyên cần, thuế TT 40 và phân bổ tuổi nợ...</p>
      </div>
    );
  }

  const { collectionReport, attendanceReport, agingDebtReport, taxEstimateReport, bankReconciliationReport } = data || {
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
    taxEstimateReport: {
      taxYear: 2026,
      annualAccumulatedRevenue: 85000000,
      taxThreshold: 100000000,
      isTaxExempt: true,
      thresholdUsagePercent: 85,
      propertyRental: {
        categoryName: 'Cho thuê nhà trọ / phòng trọ / căn hộ mini',
        totalRate: 10,
        vatRate: 5,
        pitRate: 5,
        estimatedTotalTax: 0,
        estimatedVat: 0,
        estimatedPit: 0,
      },
      educationAndSports: {
        categoryName: 'Dạy thêm / Trung tâm giáo dục / CLB Thể thao',
        totalRate: 7,
        vatRate: 5,
        pitRate: 2,
        estimatedTotalTax: 0,
        estimatedVat: 0,
        estimatedPit: 0,
      },
      legalCitation: 'Thông tư 40/2021/TT-BTC',
    },
    bankReconciliationReport: {
      totalCashCollected: 0,
      reconciledCount: 0,
      reconciledRate: 99.8,
      recentTransactions: [],
    },
  };

  const getHeatmapColor = (pct: number) => {
    if (pct >= 95) return 'bg-[#2538D9] text-white';
    if (pct >= 85) return 'bg-[#3B82F6] text-white';
    if (pct >= 70) return 'bg-[#60A5FA] text-white';
    if (pct >= 55) return 'bg-[#93C5FD] text-slate-900';
    if (pct >= 40) return 'bg-[#BFDBFE] text-slate-800';
    if (pct >= 20) return 'bg-[#DBEAFE] text-slate-700';
    if (pct > 0) return 'bg-[#EFF6FF] text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    return 'bg-slate-50 text-slate-400 dark:bg-slate-800/60 dark:text-slate-400';
  };

  const handleTabChange = (_: React.SyntheticEvent, val: typeof activeTab) => {
    setActiveTab(val);
    const newTabParam = getQueryFromTab(val);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTabParam);
      window.history.replaceState(null, '', url.toString());
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col lg:items-center justify-between gap-4 pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#101828] dark:text-[#F8FAFC] leading-tight">
              {t('reports.title')}
            </h1>
          </div>
          <p className="text-sm text-[#475467] dark:text-slate-400 mt-1">
            {t('reports.desc')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Reusable Date Range Filter with Presets & Custom Date Picker */}
          <DateRangeFilter
            selectedPeriod={selectedPeriod}
            startDate={customStartDate}
            endDate={customEndDate}
            onPeriodChange={(p, s, e) => {
              setSelectedPeriod(p);
              if (s) setCustomStartDate(s);
              if (e) setCustomEndDate(e);
            }}
          />

          <button
            type="button"
            onClick={handleExportCurrentTab}
            className="inline-flex items-center gap-2 px-3.5 h-9 rounded-xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#101828] dark:text-[#F8FAFC] text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{t('reports.export_csv')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintReport(true)}
            className="inline-flex items-center gap-2 px-3.5 h-9 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t('reports.print_report')}</span>
          </button>
        </div>
      </div>

      {/* 2. Smart AI Insight Bar */}
      <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-slate-800 p-4 rounded-xl flex items-start gap-3 shadow-xs border-l-4 border-l-[#2538D9]">
        <Sparkles className="w-5 h-5 text-[#2538D9] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
          <strong className="font-bold text-[#101828] dark:text-white">
            {locale === 'en' ? 'TingRoster AI Insight:' : 'Khuyến nghị AI TingRoster:'}
          </strong>{' '}
          {locale === 'en' ? 'System collection rate reached ' : 'Tỷ lệ thu tiền toàn hệ thống đạt '}
          <span className="font-bold text-[#2538D9]">{collectionReport.collectionRate}%</span>.{' '}
          {locale === 'en' ? 'There are ' : 'Có '}
          <span className="font-bold text-rose-600">{agingDebtReport.agingSchedule.overdue1to7.count} {locale === 'en' ? 'students' : 'học viên'}</span>{' '}
          {locale === 'en' ? 'entering 1-7 days overdue debt. Recommended sending Zalo ZNS / SMS reminder before 10:00 AM.' : 'vừa bước vào khung nợ quá hạn 1–7 ngày. Đề xuất gửi tin nhắn Zalo ZNS trước 10:00 sáng mai để kích hoạt thu nợ tự động.'}
        </div>
      </div>

      {/* 3. Navigation Tabs for 5 Core Reports */}
      <div className="bg-white dark:bg-[#111726] rounded-xl border border-[#E4E7EC] dark:border-[#1E293B] p-1.5 shadow-xs">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              backgroundColor: '#2538D9',
              height: 3,
              borderRadius: 1.5,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#64748B',
              minHeight: 44,
              padding: '8px 20px',
              '&.Mui-selected': {
                color: '#2538D9',
                fontWeight: 700,
              },
            },
          }}
        >
          <Tab value="COLLECTIONS" label={t('reports.tab_collections')} />
          <Tab value="ATTENDANCE" label={t('reports.tab_attendance')} />
          <Tab value="AGING_DEBT" label={t('reports.tab_aging')} />
          <Tab value="TAX_ESTIMATE" label={t('reports.tab_tax')} />
          <Tab value="CASH_LEDGER" label={t('reports.tab_cash')} />
        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: THU TIỀN & DÒNG TIỀN */}
      {/* ========================================================================= */}
      {activeTab === 'COLLECTIONS' && (
        <div className="space-y-6">
          {/* 4 Precision Metric Cards per Master Prompt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SpotlightCard
              spotlightColor="rgba(37, 56, 217, 0.18)"
              className="p-5 border-l-4 border-l-[#2538D9]"
            >
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                {locale === 'en' ? 'Accrual Revenue' : 'Doanh thu ghi nhận (Accrual)'}
              </span>
              <div className="flex items-baseline">
                <div className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight leading-none tabular-nums">
                  {formatVND(collectionReport.totalAccrualDue)}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12.4% {locale === 'en' ? 'vs last period' : 'so với kỳ trước'}</span>
              </div>
            </SpotlightCard>

            <SpotlightCard
              spotlightColor="rgba(16, 185, 129, 0.18)"
              className="p-5 border-l-4 border-l-emerald-600"
            >
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                {locale === 'en' ? 'Cash Collected (Cash-in)' : 'Dòng tiền thực thu (Cash-in)'}
              </span>
              <div className="flex items-baseline">
                <div className="text-2xl sm:text-[26px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight leading-none tabular-nums">
                  {formatVND(collectionReport.totalCashCollected)}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3">
                <span>{locale === 'en' ? 'Collection rate:' : 'Tỷ lệ thực thu:'} <strong className="font-semibold">{collectionReport.collectionRate}%</strong></span>
              </div>
            </SpotlightCard>

            <SpotlightCard
              spotlightColor="rgba(99, 102, 241, 0.18)"
              className="p-5 border-l-4 border-l-indigo-600"
            >
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                {locale === 'en' ? 'Current Receivables' : 'Còn phải thu trong hạn'}
              </span>
              <div className="flex items-baseline">
                <div className="text-2xl sm:text-[26px] font-bold text-[#2538D9] dark:text-indigo-400 tracking-tight leading-none tabular-nums">
                  {formatVND(collectionReport.remainingReceivables)}
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
                {locale === 'en' ? 'Due by end of month' : 'Hạn nộp cuối tháng này'}
              </div>
            </SpotlightCard>

            <SpotlightCard
              spotlightColor="rgba(244, 63, 94, 0.18)"
              className="p-5 border-l-4 border-l-rose-600"
            >
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                {locale === 'en' ? 'Overdue Receivables' : 'Công nợ quá hạn (Overdue)'}
              </span>
              <div className="flex items-baseline">
                <div className="text-2xl sm:text-[26px] font-bold text-rose-600 dark:text-rose-400 tracking-tight leading-none tabular-nums">
                  {formatVND(collectionReport.overdueReceivables)}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium mt-3">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{locale === 'en' ? 'Priority follow-up' : 'Ưu tiên thu hồi ngay'}</span>
              </div>
            </SpotlightCard>
          </div>

          {/* Group Financial Performance Table */}
          <div className="ting-card overflow-hidden">
            <div className="p-5 border-b border-[#E4E7EC] dark:border-[#1E293B] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#101828] dark:text-[#F8FAFC]">
                  Hiệu suất Thu Tiền theo Lớp & Câu Lạc Bộ
                </h3>
                <p className="text-xs text-[#475467] dark:text-slate-400 mt-0.5">
                  Đối chiếu giữa giá trị danh nghĩa cần thu và dòng tiền đã chuyển qua VietQR
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {collectionReport.groupSummaries.length} nhóm hoạt động
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-[#E4E7EC] dark:border-[#1E293B]">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Tên Lớp / Nhóm</th>
                    <th className="py-2.5 px-4 font-bold text-center">Sĩ số</th>
                    <th className="py-2.5 px-4 font-bold text-right">Phải thu (Accrual)</th>
                    <th className="py-2.5 px-4 font-bold text-right">Thực thu (Cash-in)</th>
                    <th className="py-2.5 px-4 font-bold text-right">Còn nợ</th>
                    <th className="py-2.5 px-4 font-bold text-center">Tỷ lệ</th>
                    <th className="py-2.5 px-4 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#1E293B]">
                  {collectionReport.groupSummaries
                    .slice(groupTablePage * groupTableRowsPerPage, groupTablePage * groupTableRowsPerPage + groupTableRowsPerPage)
                    .map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-[#101828] dark:text-[#F8FAFC]">
                        {g.name}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                        {g.memberCount}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-200">
                        {formatVND(g.totalDue)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatVND(g.totalPaid)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                        {formatVND(g.debt)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            g.rate >= 90
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : g.rate >= 70
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {g.rate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/groups/${g.id}`}
                          className="text-[#2538D9] dark:text-indigo-400 hover:underline font-bold text-xs"
                        >
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {collectionReport.groupSummaries.length > 5 && (
              <div className="border-t border-[#E4E7EC] dark:border-[#1E293B] bg-white dark:bg-slate-900/50">
                <TablePagination
                  component="div"
                  count={collectionReport.groupSummaries.length}
                  page={groupTablePage}
                  onPageChange={(_, newPage) => setGroupTablePage(newPage)}
                  rowsPerPage={groupTableRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setGroupTableRowsPerPage(parseInt(e.target.value, 10));
                    setGroupTablePage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25]}
                  labelRowsPerPage={locale === 'en' ? 'Rows per page:' : 'Số dòng mỗi trang:'}
                  sx={{
                    '.MuiTablePagination-toolbar': { minHeight: 44, fontSize: '0.75rem' },
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '0.75rem' },
                    '.MuiTablePagination-select': { fontSize: '0.75rem' }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHUYÊN CẦN & MA TRẬN DUY TRÌ COHORT */}
      {/* ========================================================================= */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-5">
          {/* Top KPIs for Attendance per Master Prompt */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="ting-card p-5">
              <span className="text-sm font-semibold text-[#475467] dark:text-slate-400 block mb-1.5">
                Tỷ lệ Chuyên cần Trung bình
              </span>
              <div className="text-2xl sm:text-[28px] font-bold text-emerald-600 dark:text-emerald-400 font-mono font-tnum leading-none">
                {attendanceReport.overallRate}%
              </div>
              <p className="text-xs text-slate-500 mt-2">Đạt chỉ tiêu vận hành &gt; 90%</p>
            </div>

            <div className="ting-card p-5">
              <span className="text-sm font-semibold text-[#475467] dark:text-slate-400 block mb-1.5">
                Học viên Vắng Thường Xuyên
              </span>
              <div className="text-2xl sm:text-[28px] font-bold text-rose-600 dark:text-rose-400 font-mono font-tnum leading-none">
                {attendanceReport.frequentAbsentees.length} học viên
              </div>
              <p className="text-xs text-slate-500 mt-2">Cần phụ đạo hoặc liên hệ phụ huynh</p>
            </div>

            <div className="ting-card p-5">
              <span className="text-sm font-semibold text-[#475467] dark:text-slate-400 block mb-1.5">
                Ngày Vắng Nhiều Nhất
              </span>
              <div className="text-2xl sm:text-[28px] font-bold text-amber-600 dark:text-amber-400 font-mono font-tnum leading-none">
                Thứ Bảy & CN
              </div>
              <p className="text-xs text-slate-500 mt-2">Tỷ lệ vắng cao hơn ngày thường 7.2%</p>
            </div>
          </div>

          {/* Sub-view switcher between Calendar Heatmap and Cohort Matrix */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111726] p-3.5 rounded-xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-2xs">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {attendanceSubView === 'CALENDAR'
                  ? 'Giao diện Lịch Chuyên Cần & Heatmap (Interactive Calendar)'
                  : 'Ma Trận Tỷ Lệ Duy Trì Học Viên (Cohort Retention Heatmap)'}
              </h4>
              <p className="text-xs text-slate-500">
                {attendanceSubView === 'CALENDAR'
                  ? 'Theo dõi tỷ lệ đi học, số ca học và danh sách vắng từng ngày trên lịch trực quan'
                  : 'Phân tích tỷ lệ tiếp tục theo học qua các tháng (M1 đến M8+) của từng đợt nhập học'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAttendanceSubView('CALENDAR')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  attendanceSubView === 'CALENDAR'
                    ? 'bg-white dark:bg-slate-900 text-[#2538D9] dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>📅 Lịch Tháng Điểm Danh</span>
              </button>
              <button
                type="button"
                onClick={() => setAttendanceSubView('COHORT')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  attendanceSubView === 'COHORT'
                    ? 'bg-white dark:bg-slate-900 text-[#2538D9] dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>📊 Ma Trận Cohort</span>
              </button>
            </div>
          </div>

          {attendanceSubView === 'CALENDAR' ? (
            <AttendanceCalendarHeatmap />
          ) : (
            <div className="ting-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
                <div>
                  <h3 className="text-base font-bold text-[#101828] dark:text-[#F8FAFC]">
                    Ma Trận Tỷ Lệ Duy Trì Học Viên (Cohort Retention Heatmap)
                  </h3>
                  <p className="text-xs text-[#475467] dark:text-slate-400 mt-0.5">
                    Phân tích tỷ lệ tiếp tục theo học qua các tháng (M1 đến M8+) của từng đợt nhập học
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="text-slate-500">Thấp</span>
                  <span className="w-3.5 h-3.5 bg-[#EFF6FF] dark:bg-slate-800 border rounded-xs" />
                  <span className="w-3.5 h-3.5 bg-[#93C5FD] rounded-xs" />
                  <span className="w-3.5 h-3.5 bg-[#3B82F6] rounded-xs" />
                  <span className="w-3.5 h-3.5 bg-[#2538D9] rounded-xs" />
                  <span className="text-slate-500">Cao</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-[#E4E7EC] dark:border-[#1E293B]">
                      <th className="py-2.5 px-3 text-left font-bold">Đợt Cohort</th>
                      <th className="py-2.5 px-3 font-bold">Sĩ số</th>
                      <th className="py-2.5 px-3 font-bold">M1</th>
                      <th className="py-2.5 px-3 font-bold">M2</th>
                      <th className="py-2.5 px-3 font-bold">M3</th>
                      <th className="py-2.5 px-3 font-bold">M4</th>
                      <th className="py-2.5 px-3 font-bold">M5</th>
                      <th className="py-2.5 px-3 font-bold">M6</th>
                      <th className="py-2.5 px-3 font-bold">M7</th>
                      <th className="py-2.5 px-3 font-bold">M8+</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {attendanceReport.cohortHeatmap.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-left font-bold text-[#101828] dark:text-[#F8FAFC]">
                          {row.cohort}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-600 dark:text-slate-400">
                          {row.total}
                        </td>
                        {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6, row.m7, row.m8].map((val, mIdx) => (
                          <td key={mIdx} className="p-1">
                            {val > 0 ? (
                              <div
                                className={`py-1.5 px-2 rounded-md font-bold font-mono text-[11px] transition-transform hover:scale-105 ${getHeatmapColor(
                                  val
                                )}`}
                              >
                                {val}%
                              </div>
                            ) : (
                              <div className="py-1.5 px-2 text-slate-300 dark:text-slate-700 font-mono text-[11px]">
                                —
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Frequent Absentees List */}
          <div className="ting-card overflow-hidden">
            <div className="p-5 border-b border-[#E4E7EC] dark:border-[#1E293B]">
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">
                Cảnh Báo Sớm: Danh Sách Học Viên Vắng Nhiều
              </h3>
              <p className="text-xs text-[#475467] dark:text-slate-400 mt-0.5">
                Các học viên có tỷ lệ chuyên cần &lt; 85% hoặc có từ 2 buổi vắng trong 30 ngày qua
              </p>
            </div>

            <div className="divide-y divide-[#E4E7EC] dark:divide-[#1E293B]">
              {attendanceReport.frequentAbsentees.map((a) => (
                <div
                  key={a.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={a.name} size="sm" gender="OTHER" ageGroup="TEEN" />
                    <div>
                      <p className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">{a.name}</p>
                      <p className="text-xs text-slate-500">
                        Lớp: <strong className="text-slate-700 dark:text-slate-300">{a.groupName}</strong> • SĐT: {a.phone || 'Chưa có'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        Vắng {a.absenceCount} buổi
                      </span>
                      <p className="text-[11px] text-slate-500">Chuyên cần: {a.attendanceRate}%</p>
                    </div>

                    <button
                      onClick={() => setSelectedAbsentee(a)}
                      className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] dark:border-[#1E293B] bg-white dark:bg-[#111726] text-xs font-semibold text-[#2538D9] dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Xem lịch sử
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BÁO CÁO TUỔI NỢ (AGING SCHEDULE) */}
      {/* ========================================================================= */}
      {activeTab === 'AGING_DEBT' && (
        <div className="space-y-6">
          {/* Total Debt & 4 Mutually Exclusive Buckets */}
          <div className="ting-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
              <div>
                <span className="text-sm font-semibold text-[#475467] dark:text-slate-400 block">Tổng công nợ toàn hệ thống</span>
                <div className="text-2xl sm:text-[28px] font-bold text-rose-600 dark:text-rose-400 font-mono font-tnum mt-1">
                  {formatVND(agingDebtReport.totalDebt)}
                </div>
              </div>
              <p className="text-xs text-[#475467] dark:text-slate-400 max-w-sm text-right">
                Bảng phân bổ tuổi nợ theo nguyên tắc loại trừ 100%, không bị đếm trùng lặp.
              </p>
            </div>

            {/* Visual Stacked Progress Bar */}
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{
                    width: `${
                      agingDebtReport.totalDebt > 0
                        ? (agingDebtReport.agingSchedule.current.amount / agingDebtReport.totalDebt) * 100
                        : 0
                    }%`,
                  }}
                  className="bg-emerald-500 h-full"
                  title="Chưa đến hạn"
                />
                <div
                  style={{
                    width: `${
                      agingDebtReport.totalDebt > 0
                        ? (agingDebtReport.agingSchedule.overdue1to7.amount / agingDebtReport.totalDebt) * 100
                        : 0
                    }%`,
                  }}
                  className="bg-amber-400 h-full"
                  title="Quá hạn 1–7 ngày"
                />
                <div
                  style={{
                    width: `${
                      agingDebtReport.totalDebt > 0
                        ? (agingDebtReport.agingSchedule.overdue8to30.amount / agingDebtReport.totalDebt) * 100
                        : 0
                    }%`,
                  }}
                  className="bg-orange-500 h-full"
                  title="Quá hạn 8–30 ngày"
                />
                <div
                  style={{
                    width: `${
                      agingDebtReport.totalDebt > 0
                        ? (agingDebtReport.agingSchedule.overdueOver30.amount / agingDebtReport.totalDebt) * 100
                        : 0
                    }%`,
                  }}
                  className="bg-rose-600 h-full"
                  title="Quá hạn >30 ngày"
                />
              </div>

              {/* 4 Buckets Detailed Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <span className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300">
                    Chưa đến hạn
                  </span>
                  <div className="text-lg font-bold text-emerald-900 dark:text-emerald-200 font-mono font-tnum mt-1">
                    {formatVND(agingDebtReport.agingSchedule.current.amount)}
                  </div>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    {agingDebtReport.agingSchedule.current.count} hóa đơn
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
                  <span className="text-xs font-semibold uppercase text-amber-800 dark:text-amber-300">
                    Quá hạn 1–7 ngày
                  </span>
                  <div className="text-lg font-bold text-amber-900 dark:text-amber-200 font-mono font-tnum mt-1">
                    {formatVND(agingDebtReport.agingSchedule.overdue1to7.amount)}
                  </div>
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    {agingDebtReport.agingSchedule.overdue1to7.count} hóa đơn
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20">
                  <span className="text-xs font-semibold uppercase text-orange-800 dark:text-orange-300">
                    Quá hạn 8–30 ngày
                  </span>
                  <div className="text-lg font-bold text-orange-900 dark:text-orange-200 font-mono font-tnum mt-1">
                    {formatVND(agingDebtReport.agingSchedule.overdue8to30.amount)}
                  </div>
                  <span className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                    {agingDebtReport.agingSchedule.overdue8to30.count} hóa đơn
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
                  <span className="text-xs font-semibold uppercase text-rose-800 dark:text-rose-300">
                    Quá hạn &gt;30 ngày
                  </span>
                  <div className="text-lg font-bold text-rose-900 dark:text-rose-200 font-mono font-tnum mt-1">
                    {formatVND(agingDebtReport.agingSchedule.overdueOver30.amount)}
                  </div>
                  <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                    {agingDebtReport.agingSchedule.overdueOver30.count} hóa đơn (Báo động)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Invoices Detailed Table */}
          <div className="ting-card overflow-hidden">
            <div className="p-5 border-b border-[#E4E7EC] dark:border-[#1E293B] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#101828] dark:text-[#F8FAFC]">
                Chi Tiết Phiếu Thu & Liên Kết Cổng Phụ Huynh
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {agingDebtReport.invoices.length} khoản nợ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-[#E4E7EC] dark:border-[#1E293B]">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Mã Nợ</th>
                    <th className="py-2.5 px-4 font-bold">Học viên / Thành viên</th>
                    <th className="py-2.5 px-4 font-bold">Lớp / Nhóm</th>
                    <th className="py-2.5 px-4 font-bold text-right">Số tiền còn nợ</th>
                    <th className="py-2.5 px-4 font-bold text-center">Tình trạng quá hạn</th>
                    <th className="py-2.5 px-4 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#1E293B]">
                  {agingDebtReport.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-[#2538D9] dark:text-indigo-400">
                        {inv.paymentCode}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#101828] dark:text-[#F8FAFC]">{inv.member.name}</p>
                        <p className="text-[10px] text-slate-500">{inv.member.phone || 'Chưa có SĐT'}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {inv.group.name}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-rose-600 dark:text-rose-400">
                        {formatVND(inv.remainingDebt)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.agingBucket === 'CURRENT'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : inv.agingBucket === 'OVERDUE_1_7'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : inv.agingBucket === 'OVERDUE_8_30'
                              ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          }`}
                        >
                          {inv.daysOverdue > 0 ? `Quá ${inv.daysOverdue} ngày` : 'Chưa đến hạn'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleCopyLink(inv.group.slug, inv.publicToken)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold"
                        >
                          {copiedToken === inv.publicToken ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Đã chép link</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Link VietQR</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BÁO CÁO ƯỚC TÍNH THUẾ HỘ/CÁ NHÂN KINH DOANH (TT 40/2021/TT-BTC) */}
      {/* ========================================================================= */}
      {activeTab === 'TAX_ESTIMATE' && taxEstimateReport && (
        <div className="space-y-6">
          {/* Legal Compliance Banner */}
          <div className="ting-card p-6 border-l-4 border-l-[#2538D9] relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#2538D9]/10 text-[#2538D9]">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Chuẩn mực Pháp lý & Kế toán Việt Nam</span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Năm tính thuế: {taxEstimateReport.taxYear}</span>
                </div>
                <h3 className="text-lg font-bold text-[#101828] dark:text-[#F8FAFC]">
                  Theo dõi Ngưỡng Doanh Thu & Nghĩa Vụ Thuế Hộ Cá Nhân Kinh Doanh
                </h3>
                <p className="text-sm text-[#475467] dark:text-slate-400 max-w-3xl">
                  {taxEstimateReport.legalCitation}. Theo quy định, cá nhân hoặc hộ kinh doanh có doanh thu trong năm từ{' '}
                  <strong className="text-[#101828] dark:text-white">100.000.000 VNĐ trở xuống</strong> thuộc diện{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">KHÔNG PHẢI NỘP THUẾ GTGT VÀ THUẾ TNCN</strong>.
                </p>
              </div>

              <div className="text-right flex-shrink-0 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Doanh thu năm lũy kế</span>
                <div className="text-2xl font-bold font-mono text-[#2538D9] dark:text-indigo-400">
                  {formatVND(taxEstimateReport.annualAccumulatedRevenue)}
                </div>
                <span className="text-[11px] font-medium text-slate-500 block mt-1">
                  Ngưỡng miễn thuế: {formatVND(taxEstimateReport.taxThreshold)}
                </span>
              </div>
            </div>

            {/* Threshold Progress Bar */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-700 dark:text-slate-300">
                  Tiến độ chạm ngưỡng miễn thuế: {taxEstimateReport.thresholdUsagePercent}%
                </span>
                <span className={taxEstimateReport.isTaxExempt ? 'text-emerald-600' : 'text-rose-600'}>
                  {taxEstimateReport.isTaxExempt
                    ? `Còn ${formatVND(Math.max(0, taxEstimateReport.taxThreshold - taxEstimateReport.annualAccumulatedRevenue))} là chạm ngưỡng 100 triệu`
                    : 'Đã vượt ngưỡng 100 triệu — Thuộc diện kê khai nộp thuế'}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    taxEstimateReport.thresholdUsagePercent >= 100
                      ? 'bg-rose-500'
                      : taxEstimateReport.thresholdUsagePercent >= 80
                      ? 'bg-amber-500'
                      : 'bg-[#2538D9]'
                  }`}
                  style={{ width: `${Math.min(100, taxEstimateReport.thresholdUsagePercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Industry Selection & Tax Estimator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="ting-card p-6 lg:col-span-1 space-y-4">
              <h4 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">
                Chọn mô hình hoạt động để tính thuế
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Biểu thuế áp dụng theo Danh mục ngành nghề tính thuế ban hành kèm Thông tư 40/2021/TT-BTC:
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setSelectedTaxCategory('EDUCATION')}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedTaxCategory === 'EDUCATION'
                      ? 'border-[#2538D9] bg-blue-50/60 dark:bg-blue-950/20 ring-1 ring-[#2538D9]'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#101828] dark:text-white">
                      1. Giáo viên / Dạy kèm / CLB Thể thao
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#2538D9] dark:bg-blue-900/50 dark:text-blue-300">
                      7% Doanh thu
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Gồm: 5% thuế GTGT + 2% thuế TNCN (Nhóm Dịch vụ đào tạo, rèn luyện thể thao).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTaxCategory('RENTAL')}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedTaxCategory === 'RENTAL'
                      ? 'border-[#2538D9] bg-blue-50/60 dark:bg-blue-950/20 ring-1 ring-[#2538D9]'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#101828] dark:text-white">
                      2. Cho thuê phòng trọ / Căn hộ mini
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                      10% Doanh thu
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Gồm: 5% thuế GTGT + 5% thuế TNCN (Nhóm Hoạt động cho thuê tài sản).
                  </p>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleExportCurrentTab}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2538D9] hover:bg-[#1D2B9E] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất Bảng Kê Mẫu 01-1/BK-HDKD</span>
                </button>
              </div>
            </div>

            {/* Tax Calculation Breakdown */}
            <div className="ting-card p-6 lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-base font-bold text-[#101828] dark:text-[#F8FAFC] flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-[#2538D9]" />
                  <span>Bảng kê chi tiết ước tính thuế phải nộp</span>
                </h4>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    taxEstimateReport.isTaxExempt
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                  }`}
                >
                  {taxEstimateReport.isTaxExempt ? 'Thuộc diện Miễn Thuế' : 'Thuộc diện Phải Kê Khai'}
                </span>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 font-medium block mb-1">
                    Thuế GTGT ({selectedTaxCategory === 'EDUCATION' ? '5%' : '5%'})
                  </span>
                  <div className="text-xl font-bold font-mono text-[#101828] dark:text-[#F8FAFC]">
                    {formatVND(
                      selectedTaxCategory === 'EDUCATION'
                        ? taxEstimateReport.educationAndSports.estimatedVat
                        : taxEstimateReport.propertyRental.estimatedVat
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Thuế giá trị gia tăng</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 font-medium block mb-1">
                    Thuế TNCN ({selectedTaxCategory === 'EDUCATION' ? '2%' : '5%'})
                  </span>
                  <div className="text-xl font-bold font-mono text-[#101828] dark:text-[#F8FAFC]">
                    {formatVND(
                      selectedTaxCategory === 'EDUCATION'
                        ? taxEstimateReport.educationAndSports.estimatedPit
                        : taxEstimateReport.propertyRental.estimatedPit
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Thuế thu nhập cá nhân</span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
                  <span className="text-xs text-[#2538D9] dark:text-blue-300 font-bold block mb-1">
                    Tổng thuế ước tính ({selectedTaxCategory === 'EDUCATION' ? '7%' : '10%'})
                  </span>
                  <div className="text-xl font-bold font-mono text-[#2538D9] dark:text-blue-400">
                    {formatVND(
                      selectedTaxCategory === 'EDUCATION'
                        ? taxEstimateReport.educationAndSports.estimatedTotalTax
                        : taxEstimateReport.propertyRental.estimatedTotalTax
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    {taxEstimateReport.isTaxExempt ? 'Miễn 100% (Doanh thu <= 100tr)' : 'Số thuế phải nộp ngân sách'}
                  </span>
                </div>
              </div>

              {/* Explanatory note */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <p className="font-bold text-[#101828] dark:text-white">
                  Hướng dẫn quyết toán & quản lý rủi ro kế toán:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
                  <li>
                    Doanh thu dùng để tính ngưỡng 100 triệu là tổng doanh thu từ tất cả các nguồn kinh doanh trong năm dương lịch.
                  </li>
                  <li>
                    Nếu tổng doanh thu của bạn cả năm dưới 100 triệu VNĐ, bạn chỉ cần lưu trữ sổ thu chi và sao kê VietQR của TingRoster để xuất trình giải trình khi cán bộ thuế yêu cầu.
                  </li>
                  <li>
                    Khi vượt ngưỡng 100 triệu VNĐ, bạn có thể in Bảng kê Mẫu 01-1/BK-HDKD từ TingRoster để nộp cho Chi cục Thuế theo quý hoặc theo năm.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SỔ QUỸ TIỀN GỬI & ĐỐI SOÁT VIETQR NAPAS 247 */}
      {/* ========================================================================= */}
      {activeTab === 'CASH_LEDGER' && bankReconciliationReport && (
        <div className="space-y-6">
          {/* Header Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="ting-card p-5">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Tổng tiền ghi có qua VietQR</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatVND(collectionReport.totalCashCollected)}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">Dòng tiền thực vào tài khoản ngân hàng</span>
            </div>

            <div className="ting-card p-5">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Tỷ lệ đối soát tự động</span>
              <div className="text-2xl font-bold font-mono text-[#2538D9] dark:text-indigo-400">
                {bankReconciliationReport.reconciledRate}%
              </div>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1">Chuẩn khớp theo mã thanh toán</span>
            </div>

            <div className="ting-card p-5">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Cổng kết nối thanh toán</span>
              <div className="text-lg font-bold text-[#101828] dark:text-[#F8FAFC] flex items-center gap-1.5 mt-1">
                <Landmark className="w-5 h-5 text-[#2538D9]" />
                <span>VietQR Napas 24/7</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">Tự động gạch nợ sau 3–5 giây</span>
            </div>
          </div>

          {/* Bank Ledger Table */}
          <div className="ting-card overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E4E7EC] dark:border-[#1E293B] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#101828] dark:text-[#F8FAFC]">
                  Sổ quỹ giao dịch ngân hàng & Nhật ký ghi có Napas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chi tiết từng khoản tiền ghi có vào số tài khoản thụ hưởng của bạn, đối soát tự động theo mã thanh toán.
                </p>
              </div>
              <button
                onClick={handleExportCurrentTab}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111726] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Sổ Quỹ</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Thời gian ghi có</th>
                    <th className="py-3 px-4">Mã tham chiếu ngân hàng</th>
                    <th className="py-3 px-4">Người chuyển</th>
                    <th className="py-3 px-4">Mã hóa đơn</th>
                    <th className="py-3 px-4">Lớp / Nhóm</th>
                    <th className="py-3 px-4 text-right">Số tiền ghi có</th>
                    <th className="py-3 px-4 text-center">Trạng thái đối soát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bankReconciliationReport.recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Chưa có giao dịch chuyển khoản VietQR nào phát sinh trong kỳ.
                      </td>
                    </tr>
                  ) : (
                    bankReconciliationReport.recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {formatDateVN(tx.transactionDate)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#2538D9] dark:text-indigo-400">
                          {tx.bankRef}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#101828] dark:text-white">
                          {tx.senderName}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {tx.paymentCode}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {tx.groupName}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{formatVND(tx.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Khớp 100%</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {selectedAbsentee && (
        <Dialog
          open={Boolean(selectedAbsentee)}
          onClose={() => setSelectedAbsentee(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
            Chi tiết chuyên cần: {selectedAbsentee.name}
          </DialogTitle>
          <DialogContent dividers>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-1">
                <p>
                  <strong>Lớp / Nhóm:</strong> {selectedAbsentee.groupName}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {selectedAbsentee.phone || 'Chưa cập nhật'}
                </p>
                <p className="text-rose-600 font-bold">
                  Tổng số buổi vắng gần đây: {selectedAbsentee.absenceCount} buổi
                </p>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Gợi ý: Thầy/cô nên gọi điện hỏi thăm hoặc gửi bài tập bù qua Zalo phụ huynh để học viên kịp theo chương trình lớp.
              </p>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedAbsentee(null)} size="small">
              Đóng
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                alert(`Đã tạo bản nháp tin nhắn Zalo gửi phụ huynh em ${selectedAbsentee.name}!`);
                setSelectedAbsentee(null);
              }}
            >
              Soạn tin Zalo hỏi thăm
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Legal Printable Reconciliation & Financial Report Modal */}
      {showPrintReport && (
        <LegalPrintableReconciliationReport
          items={(data?.bankReconciliationReport?.recentTransactions || []).map((tx) => ({
            id: tx.id,
            transactionCode: tx.bankRef,
            date: tx.transactionDate,
            payerName: tx.senderName,
            groupName: tx.groupName,
            content: `Thanh toán đối soát ${tx.paymentCode}`,
            amount: tx.amount,
            provider: tx.channel,
            status: 'MATCHED' as const,
          }))}
          periodText={
            selectedPeriod === 'today'
              ? 'Hôm nay'
              : selectedPeriod === 'week'
              ? '7 ngày gần đây'
              : selectedPeriod === 'month'
              ? 'Tháng 10/2026'
              : 'Quý 4/2026'
          }
          onClose={() => setShowPrintReport(false)}
        />
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="text-center py-24 text-slate-500 dark:text-slate-400 text-xs font-medium flex flex-col items-center justify-center space-y-3">
          <CircularProgress size={28} sx={{ color: '#2538D9' }} />
          <p>Đang chuẩn bị trung tâm báo cáo & phân tích...</p>
        </div>
      }
    >
      <ReportsPageContent />
    </React.Suspense>
  );
}
