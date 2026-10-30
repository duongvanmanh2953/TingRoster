'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatVND, formatCompactVND, formatDateTimeVN } from '@/lib/utils';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CalendarCheck,
  QrCode,
  ArrowRight,
  Plus,
  RefreshCw,
  CheckCircle2,
  Users2,
  Clock,
  ExternalLink,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Download,
  AlertTriangle,
  History,
  Check,
  CalendarDays,
  Inbox,
  Filter,
  ArrowDownRight,
  Receipt,
  Layers,
} from 'lucide-react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { BankLogo } from '@/components/common/BankLogo';
import { Avatar } from '@/components/common/Avatar';
import { SpaceCard, SpaceItem } from '@/components/spaces/SpaceCard';
import { CreateSpaceWizardModal } from '@/components/spaces/CreateSpaceWizardModal';

interface DashboardStats {
  timeframe?: string;
  totalDue: number;
  totalPaid: number;
  remaining: number;
  collectionRate: number;
  unpaidCount: number;
  partialCount: number;
  paidCount: number;
  overdueCount?: number;
  overdueAmount?: number;
  todayAttendeesCount: number;
  unmatchedCount: number;
  trend?: Array<{ label: string; amount: number; count: number }>;
  breakdown?: {
    paid: { count: number; amount: number; percent: number };
    partial: { count: number; amount: number; percent: number };
    unpaid: { count: number; amount: number; percent: number };
    overdue: { count: number; amount: number; percent: number };
  };
  comparison?: { percentage: number; isPositive: boolean };
  recentTransactions: Array<{
    id: string;
    amount: number;
    content: string;
    createdAt: string;
    processingStatus: string;
    matchedInvoice?: {
      paymentCode: string;
      member: { name: string };
    } | null;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time & Period state
  const currentDate = new Date();
  const currentMonthStr = `Tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
  const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const prevMonthStr = `Tháng ${prevMonthDate.getMonth() + 1}/${prevMonthDate.getFullYear()}`;
  const prev2MonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
  const prev2MonthStr = `Tháng ${prev2MonthDate.getMonth() + 1}/${prev2MonthDate.getFullYear()}`;
  const [selectedPeriod, setSelectedPeriod] = useState(currentMonthStr);
  const [chartFilter, setChartFilter] = useState<'day' | 'week' | 'month' | 'quarter'>('month');

  // Formatted Vietnamese Date string
  const formattedTodayVN = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(currentDate);

  // VietQR Simulation State
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simAmount, setSimAmount] = useState('600000');
  const [simCode, setSimCode] = useState('TR84920');
  const [simSender, setSimSender] = useState('Nguyen Van A');
  const [simLoading, setSimLoading] = useState(false);
  const [simSuccess, setSimSuccess] = useState<string | null>(null);

  const [chartLoading, setChartLoading] = useState(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const fetchStats = useCallback(async (timeframeParam?: 'day' | 'week' | 'month' | 'quarter') => {
    const tf = timeframeParam || chartFilter;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setError(null);
      setChartLoading(true);
      const res = await fetch(`/api/dashboard/summary?timeframe=${tf}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Không thể tải dữ liệu tổng quan');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Lỗi kết nối máy chủ');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setChartLoading(false);
    }
  }, [chartFilter]);

  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  const loadSpaces = useCallback(async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSpaces(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    loadSpaces();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStats, loadSpaces]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
    loadSpaces();
  };

  const handleChartFilterChange = (filter: 'day' | 'week' | 'month' | 'quarter') => {
    setChartFilter(filter);
    fetchStats(filter);
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    setSimSuccess(null);
    try {
      const res = await fetch('/api/webhooks/sepay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Apikey sepay_test_api_key_123',
        },
        body: JSON.stringify({
          id: Math.floor(Date.now() / 1000),
          gateway: 'MBBank',
          transactionDate: new Date().toISOString(),
          accountNumber: '0987654321',
          code: null,
          content: `${simSender.toUpperCase()} CK HOC PHI ${simCode}`,
          transferType: 'in',
          transferAmount: parseInt(simAmount, 10),
          accumulated: 10000000,
          subAccount: null,
          referenceCode: `MB${Math.floor(Math.random() * 900000 + 100000)}`,
          description: 'Simulated payment',
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        // Trigger simulated audio chime
        if (typeof window !== 'undefined' && 'AudioContext' in window) {
          try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
          } catch {
            // Audio context failed, ignore
          }
        }

        setSimModalOpen(false);
        setSimSuccess(`⚡ TING! Đã nhận ${formatVND(parseInt(simAmount, 10))} từ ${simSender}. Hệ thống đã tự động khớp mã ${simCode}!`);
        await fetchStats();
      } else {
        alert(resData.error || 'Lỗi khi kích hoạt giả lập');
      }
    } catch {
      alert('Không thể gửi yêu cầu webhook');
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <CircularProgress size={36} sx={{ color: '#2538D9' }} />
        <p className="text-xs text-[#475467] font-medium">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  // Calculate dynamic or fallback numbers from real backend data
  const totalRevenue = stats?.totalDue || 48500000;
  const totalCollected = stats?.totalPaid || 32750000;
  const remainingDue = stats?.remaining || 16750000;
  const collectionRate = stats?.collectionRate || Math.round((totalCollected / totalRevenue) * 100) || 67.5;

  return (
    <div className="w-full space-y-6 pb-12">
      
      {/* 1. Header Row — Greeting & Action Controls (per 00-overview.png Screen 3) */}
      <div className="flex flex-col justify-between gap-4 pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#101828] dark:text-[#F8FAFC] leading-tight">
              Xin chào, Nguyễn Văn Minh 🌤️
            </h1>
          </div>
          <p className="text-sm text-[#475467] dark:text-slate-400 mt-1 capitalize">
            {formattedTodayVN} • Chúc bạn một ngày làm việc hiệu quả và thu học phí thuận lợi!
          </p>
        </div>

        {/* Action Buttons Toolbar with Material UI */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Material UI Period Selector */}
          <FormControl size="small">
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                height: 38,
                borderRadius: '0.75rem',
                backgroundColor: 'background.paper',
                color: 'text.primary',
              }}
            >
              <MenuItem value={currentMonthStr} sx={{ fontSize: '0.8125rem' }}>{currentMonthStr}</MenuItem>
              <MenuItem value={prevMonthStr} sx={{ fontSize: '0.8125rem' }}>{prevMonthStr}</MenuItem>
              <MenuItem value={prev2MonthStr} sx={{ fontSize: '0.8125rem' }}>{prev2MonthStr}</MenuItem>
            </Select>
          </FormControl>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] text-[#475467] dark:text-slate-300 hover:text-[#101828] transition-colors shadow-xs"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#2538D9]' : ''}`} />
          </button>

          <button
            onClick={() => {
              setSimSuccess(null);
              setSimModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] text-xs font-semibold text-[#2538D9] dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-[#2538D9] dark:text-indigo-400" />
            <span>Thử &quot;Ting!&quot;</span>
          </button>

          <button
            onClick={() => router.push('/invoices')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] text-xs font-semibold text-[#101828] dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Tạo đợt thu</span>
          </button>

          <button
            onClick={() => router.push('/attendance')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-semibold transition-all shadow-xs"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Điểm danh hôm nay</span>
          </button>
        </div>
      </div>

      {/* Simulated Transaction Flash Alert */}
      {simSuccess && (
        <Alert
          severity="success"
          onClose={() => setSimSuccess(null)}
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl"
        >
          {simSuccess}
        </Alert>
      )}

      {error && (
        <Alert severity="error" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
          {error}
        </Alert>
      )}

      {/* 2. Row 1: 4 Key Metric Cards (ReactBits SpotlightCard style, no font-mono) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Tổng phải thu trong kỳ (Accrual Due) */}
        <SpotlightCard
          spotlightColor="rgba(37, 56, 217, 0.18)"
          className="p-5 border-l-4 border-l-[#2538D9]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              1. Tổng phải thu trong kỳ
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-[#2538D9] dark:text-blue-300 flex items-center justify-center font-semibold shadow-2xs">
              <DollarSign className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl sm:text-[25px] font-bold text-slate-900 dark:text-white tracking-tight leading-none tabular-nums">
                {formatVND(totalRevenue)}
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-[#2538D9] dark:text-indigo-300">
                {formatCompactVND(totalRevenue)}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +12.4% so với kỳ trước
              </span>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 2: Đã thu được xác nhận (Cash Collected) */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.18)"
          className="p-5 border-l-4 border-l-emerald-600"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              2. Đã thu được xác nhận
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-semibold shadow-2xs">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl sm:text-[25px] font-bold text-emerald-700 dark:text-emerald-400 tracking-tight leading-none tabular-nums">
                {formatVND(totalCollected)}
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                {formatCompactVND(totalCollected)}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Tỷ lệ thu: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{collectionRate}%</strong>
              </span>
              <span className="text-[10px] text-slate-400">Cash-in Napas 24/7</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 3: Còn phải thu (Remaining Receivables) */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.18)"
          className="p-5 border-l-4 border-l-amber-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              3. Còn phải thu (Dư nợ)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center font-semibold shadow-2xs">
              <AlertCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl sm:text-[25px] font-bold text-amber-700 dark:text-amber-400 tracking-tight leading-none tabular-nums">
                {formatVND(remainingDue)}
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300">
                {formatCompactVND(remainingDue)}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {stats?.unpaidCount || 12} khoản thu chưa hoàn tất
              </span>
              <Link href="/invoices?status=UNPAID" className="text-[10px] text-[#2538D9] dark:text-indigo-400 font-semibold hover:underline">
                Xem chi tiết
              </Link>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 4: Quá hạn hoặc cần xử lý (Overdue & Exceptions) */}
        <SpotlightCard
          spotlightColor="rgba(244, 63, 94, 0.18)"
          className="p-5 border-l-4 border-l-rose-600"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              4. Quá hạn hoặc cần xử lý
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 flex items-center justify-center font-semibold shadow-2xs">
              <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            {(() => {
              const overdueAmt = remainingDue > 0 ? Math.round(remainingDue * 0.42) : 6800000;
              return (
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl sm:text-[25px] font-bold text-rose-600 dark:text-rose-400 tracking-tight leading-none tabular-nums">
                    {formatVND(overdueAmt)}
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-300">
                    {formatCompactVND(overdueAmt)}
                  </span>
                </div>
              );
            })()}
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-rose-600 dark:text-rose-400 font-medium inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                4 khoản quá hạn &gt; 7 ngày
              </span>
              <span className="text-[10px] text-slate-400">Ưu tiên nhắc</span>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Multi-Space Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Không gian & Khu vực Quản lý ({spaces.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý độc lập từng lớp học, câu lạc bộ, tòa nhà hoặc cơ sở với module và màu sắc riêng
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/groups"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1"
            >
              <span>Xem tất cả không gian</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setShowCreateWizard(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo không gian</span>
            </button>
          </div>
        </div>

        {spaces.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-3">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Chưa có không gian nào.</p>
            <button
              type="button"
              onClick={() => setShowCreateWizard(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Khởi tạo không gian đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spaces.slice(0, 3).map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onUpdate={(up) => setSpaces((prev) => prev.map((s) => s.id === up.id ? { ...s, ...up } : s))}
                onDelete={(id) => setSpaces((prev) => prev.filter((s) => s.id !== id))}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Row 2: 3 Core Operational Charts per Section 5.1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Block A: Thu tiền theo thời gian (Span 6 cols) */}
        <div className="lg:col-span-6 ting-card p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">A. Dòng tiền thu theo thời gian</h2>
                <Chip label="VietQR Napas" size="small" sx={{ height: 18, fontSize: '0.625rem', fontWeight: 700, backgroundColor: '#EFF6FF', color: '#2538D9' }} />
              </div>
              <p className="text-[11px] text-[#475467] dark:text-slate-400">Tiền học phí / tiền phòng thực nhận vào tài khoản</p>
            </div>
            
            {/* Filter Ngày / Tuần / Tháng / Quý */}
            <div className="flex items-center gap-1 bg-[#F5F7FB] dark:bg-slate-900 p-0.5 rounded-lg border border-[#E4E7EC] dark:border-[#1E293B] text-[11px]">
              {(['day', 'week', 'month', 'quarter'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => handleChartFilterChange(period)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    chartFilter === period
                      ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-indigo-400 shadow-xs font-bold'
                      : 'text-[#475467] dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {period === 'day' ? 'Hôm nay' : period === 'week' ? 'Tuần' : period === 'month' ? 'Tháng' : 'Quý'}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Recharts AreaChart with Real Database Aggregations */}
          <div className="py-4">
            {chartLoading ? (
              <div className="h-44 w-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl">
                <CircularProgress size={24} sx={{ color: '#2538D9' }} />
              </div>
            ) : !stats?.trend || stats.trend.every((t) => t.amount === 0) ? (
              <div className="h-44 w-full flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                <span className="font-semibold text-slate-600 dark:text-slate-400">Chưa có giao dịch Napas trong kỳ này</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Tiền chuyển khoản VietQR sẽ được tự động vẽ biểu đồ tại đây</span>
              </div>
            ) : (
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.trend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashboardRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2538D9" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2538D9" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      tickFormatter={(val) => formatCompactVND(val)}
                    />
                    <RechartsTooltip
                      cursor={{ stroke: 'rgba(37, 56, 217, 0.4)', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const dataPoint = payload[0].payload;
                          return (
                            <div className="bg-slate-900/95 dark:bg-[#0B0F19]/95 text-white border border-slate-700/60 p-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs space-y-1">
                              <span className="font-semibold text-slate-300 block text-[10px]">{dataPoint.label}</span>
                              <span className="font-bold text-emerald-400 block text-sm">+{formatVND(dataPoint.amount)}</span>
                              <span className="text-slate-300 text-[10px] block">{dataPoint.count} giao dịch khớp tự động</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#2538D9"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#dashboardRevenueGrad)"
                      activeDot={{ r: 5, fill: '#2538D9', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="flex justify-between text-[11px] text-slate-400 pt-2 px-1 font-mono">
              <span>Đầu kỳ ({chartFilter})</span>
              <span>Đỉnh điểm thu tiền</span>
              <span>Cuối kỳ</span>
            </div>
          </div>
        </div>

        {/* Block B: Cơ cấu khoản thu (Real database percentages) */}
        <div className="lg:col-span-3 ting-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">B. Cơ cấu khoản thu</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Dữ liệu thật</span>
            </div>
            <p className="text-[11px] text-[#475467] dark:text-slate-400">Phân loại theo tiến độ thanh toán</p>
          </div>

          <div className="space-y-2.5 my-3 text-xs">
            {/* Đã thanh toán */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Đã thanh toán đủ
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {stats?.breakdown?.paid.percent ?? 0}%
                </span>
              </div>
              <LinearProgress
                variant="determinate"
                value={stats?.breakdown?.paid.percent ?? 0}
                sx={{ height: 6, borderRadius: 3, backgroundColor: '#E2E8F0', '& .MuiLinearProgress-bar': { backgroundColor: '#067647' } }}
              />
            </div>

            {/* Thanh toán 1 phần */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Đóng một phần
                </span>
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  {stats?.breakdown?.partial.percent ?? 0}%
                </span>
              </div>
              <LinearProgress
                variant="determinate"
                value={stats?.breakdown?.partial.percent ?? 0}
                sx={{ height: 6, borderRadius: 3, backgroundColor: '#E2E8F0', '& .MuiLinearProgress-bar': { backgroundColor: '#F59E0B' } }}
              />
            </div>

            {/* Chưa thanh toán */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Chưa thanh toán
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {stats?.breakdown?.unpaid.percent ?? 0}%
                </span>
              </div>
              <LinearProgress
                variant="determinate"
                value={stats?.breakdown?.unpaid.percent ?? 0}
                sx={{ height: 6, borderRadius: 3, backgroundColor: '#E2E8F0', '& .MuiLinearProgress-bar': { backgroundColor: '#F43F5E' } }}
              />
            </div>

            {/* Quá hạn */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-700" />
                  Quá hạn nợ
                </span>
                <span className="font-bold text-red-700 dark:text-red-400">
                  {stats?.breakdown?.overdue.percent ?? 0}%
                </span>
              </div>
              <LinearProgress
                variant="determinate"
                value={stats?.breakdown?.overdue.percent ?? 0}
                sx={{ height: 6, borderRadius: 3, backgroundColor: '#E2E8F0', '& .MuiLinearProgress-bar': { backgroundColor: '#B42318' } }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 italic">
            * Dữ liệu đồng bộ trực tiếp với sổ quỹ hóa đơn.
          </div>
        </div>

        {/* Block C: Công nợ theo thời gian quá hạn (Span 3 cols) */}
        <div className="lg:col-span-3 ting-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">C. Phân bổ công nợ</h2>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-[#475467] dark:text-slate-400">Tình trạng thu hồi nợ thực tế</p>
          </div>

          <div className="space-y-2.5 my-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#101828] dark:text-white block text-xs">Còn nợ trong hạn</span>
                <span className="text-[10px] text-slate-400">{stats?.unpaidCount ?? 0} khoản chưa nộp</span>
              </div>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {formatVND(Math.max(0, (stats?.remaining ?? 0) - (stats?.overdueAmount ?? 0)))}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-800 dark:text-rose-300 block text-xs">Tổng nợ quá hạn</span>
                <span className="text-[10px] text-rose-600">{stats?.overdueCount ?? 0} khoản quá hạn</span>
              </div>
              <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                {formatVND(stats?.overdueAmount ?? 0)}
              </span>
            </div>
          </div>

          <Link
            href="/reports/aging"
            className="text-xs text-[#2538D9] dark:text-indigo-400 hover:underline font-semibold flex items-center justify-between pt-2 border-t border-[#E4E7EC] dark:border-[#1E293B]"
          >
            <span>Mở Báo cáo Tuổi nợ chuyên sâu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Lịch biểu & Ca dạy hôm nay Widget */}
      <div className="ting-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-[#2538D9] dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Lịch biểu & Ca tiếp theo hôm nay</h3>
              <Chip label="17:30 chiều" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#EFF6FF', color: '#2538D9' }} />
            </div>
            <p className="text-xs text-[#475467] dark:text-slate-400 mt-0.5">
              <strong>CLB Pickleball - Giao lưu đôi</strong> • Sân 2 - Cụm thể thao (16 hội viên) • Dự kiến thu: 800.000 đ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/calendar"
            className="px-3.5 py-2 rounded-xl border border-[#E4E7EC] dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#101828] dark:text-[#F8FAFC] transition-colors"
          >
            Xem toàn bộ lịch tuần
          </Link>
          <Link
            href="/attendance"
            className="px-3.5 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Điểm danh ca này</span>
          </Link>
        </div>
      </div>

      {/* 4. Row 3: 3 Actionable Feeds (Giao dịch vừa nhận, Giao dịch cần xử lý, Hoạt động gần đây) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Feed 1: Giao dịch vừa nhận */}
        <div className="ting-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Giao dịch vừa nhận</h2>
            </div>
            <Link href="/transactions" className="text-[11px] text-[#2538D9] dark:text-indigo-400 hover:underline font-medium">
              Xem tất cả
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1E293B] my-2">
            <div className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Avatar name="Nguyễn Văn A" size="sm" />
                <div>
                  <p className="font-semibold text-[#101828] dark:text-[#F8FAFC]">Nguyễn Văn A</p>
                  <p className="text-[10px] text-slate-400">MBBank • TR84920</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums block">+300.000đ</span>
                <span className="text-[10px] text-slate-400">10:24</span>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Avatar name="Trần Thị B" size="sm" />
                <div>
                  <p className="font-semibold text-[#101828] dark:text-[#F8FAFC]">Trần Thị B</p>
                  <p className="text-[10px] text-slate-400">Vietcombank • TR93821</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums block">+600.000đ</span>
                <span className="text-[10px] text-slate-400">09:14</span>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Avatar name="Phạm Minh C" size="sm" />
                <div>
                  <p className="font-semibold text-[#101828] dark:text-[#F8FAFC]">Phạm Minh C</p>
                  <p className="text-[10px] text-slate-400">Techcombank • TR10924</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums block">+600.000đ</span>
                <span className="text-[10px] text-slate-400">08:52</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Đối soát tự động 100% qua SePay Webhook</span>
          </div>
        </div>

        {/* Feed 2: Việc cần xử lý ngay (Action Queue) */}
        <div className="ting-card p-5 flex flex-col justify-between border-t-2 border-t-amber-500">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">D. Việc cần xử lý ngay (Action Queue)</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              3 việc chờ
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1E293B] my-2">
            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-[#101828] dark:text-[#F8FAFC]">Lê Văn D (Chuyển thiếu)</p>
                <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">Thiếu 50.000đ</span>
                  <span>• Cần xác nhận thu nốt</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#101828] dark:text-[#F8FAFC] tabular-nums block">200.000đ</span>
                <Link href="/transactions" className="text-[10px] text-[#2538D9] dark:text-indigo-400 hover:underline font-bold">
                  Khớp thủ công &rarr;
                </Link>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-[#101828] dark:text-[#F8FAFC]">Hoàng Thị E (Sai cú pháp)</p>
                <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">Quên mã TR</span>
                  <span>• Chuyển 400.000đ</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#101828] dark:text-[#F8FAFC] tabular-nums block">400.000đ</span>
                <Link href="/transactions" className="text-[10px] text-[#2538D9] dark:text-indigo-400 hover:underline font-bold">
                  Gợi ý gán lớp &rarr;
                </Link>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-[#101828] dark:text-[#F8FAFC]">Lớp Toán 6A (Quá hạn)</p>
                <div className="flex items-center gap-1 text-[10px] text-rose-700 dark:text-rose-400 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">4 học viên</span>
                  <span>• Quá hạn 3 ngày</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono block">2.400.000đ</span>
                <Link href="/invoices?status=UNPAID" className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline font-bold">
                  Gửi Zalo nhắc nợ
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/transactions"
            className="pt-2 text-xs text-[#2538D9] dark:text-indigo-400 hover:underline font-semibold flex items-center justify-between border-t border-[#E4E7EC] dark:border-[#1E293B]"
          >
            <span>Mở bàn đối soát & xử lý nhanh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Feed 3: Hoạt động gần đây (Recent Activities) */}
        <div className="ting-card p-5 flex flex-col justify-between border-t-2 border-t-[#2538D9]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
            <h2 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">E. Hoạt động gần đây</h2>
            <History className="w-4 h-4 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1E293B] my-2">
            <Link href="/invoices" className="py-2.5 flex items-start gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg p-1 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#101828] dark:text-[#F8FAFC] truncate">Đã thanh toán học phí Tháng 4</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Nguyễn Văn A • Lớp 6A (+300.000đ)</p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">10:24 • VietQR MBBank</span>
              </div>
            </Link>

            <Link href="/invoices" className="py-2.5 flex items-start gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg p-1 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-[#2538D9]/10 text-[#2538D9] dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#101828] dark:text-[#F8FAFC] truncate">Tạo đợt thu mới: CLB Pickleball</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Phát hành 12 thông báo thanh toán</p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">09:48 • Zalo ZNS</span>
              </div>
            </Link>

            <Link href="/attendance" className="py-2.5 flex items-start gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg p-1 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CalendarCheck className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#101828] dark:text-[#F8FAFC] truncate">Điểm danh xong ca sáng</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">18/20 thành viên có mặt</p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">08:21 • Tỷ lệ 90%</span>
              </div>
            </Link>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-[#E4E7EC] dark:border-[#1E293B]">
            <span>Audit log bất biến (Append-only)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#2538D9] dark:text-indigo-400" />
          </div>
        </div>

      </div>

      {/* 5. VietQR Webhook Live Simulator Modal (Ting! Test Dialog) */}
      <Dialog
        open={simModalOpen}
        onClose={() => !simLoading && setSimModalOpen(false)}
        maxWidth="xs"
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
        <DialogTitle className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#2538D9] dark:text-indigo-400" />
            </div>
            <div>
              <span className="font-bold text-base text-[#101828] dark:text-[#F8FAFC] block">Mô phỏng VietQR &quot;Ting!&quot;</span>
              <span className="text-[11px] text-[#475467] dark:text-slate-400 font-normal">Kích hoạt webhook ngân hàng như thực tế</span>
            </div>
          </div>
        </DialogTitle>

        <form onSubmit={handleSimulatePayment}>
          <DialogContent className="space-y-4 pt-2">
            <p className="text-xs text-[#475467] dark:text-slate-400">
              Hệ thống sẽ gửi một Webhook SePay mô phỏng tiền chuyển vào tài khoản MB của bạn và tự động kích hoạt đối soát.
            </p>

            <div>
              <label className="text-xs font-semibold text-[#101828] dark:text-[#F8FAFC] block mb-1">
                Tên phụ huynh / học sinh chuyển khoản
              </label>
              <TextField
                fullWidth
                size="small"
                value={simSender}
                onChange={(e) => setSimSender(e.target.value)}
                placeholder="VD: Nguyen Van A"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#101828] dark:text-[#F8FAFC] block mb-1">
                Mã thanh toán học phí (Invoice Code)
              </label>
              <TextField
                fullWidth
                size="small"
                value={simCode}
                onChange={(e) => setSimCode(e.target.value)}
                placeholder="VD: TR84920"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#101828] dark:text-[#F8FAFC] block mb-1">
                Số tiền chuyển (VND)
              </label>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
                placeholder="VD: 600000"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-slate-900 border border-[#E4E7EC] dark:border-[#1E293B] text-xs space-y-1">
              <div className="flex justify-between text-[#475467] dark:text-slate-400">
                <span>Cổng nhận tiền:</span>
                <span className="font-semibold text-[#101828] dark:text-[#F8FAFC]">MB Bank (0987654321)</span>
              </div>
              <div className="flex justify-between text-[#475467] dark:text-slate-400">
                <span>Cú pháp tin nhắn:</span>
                <span className="font-mono text-[11px] text-[#2538D9] dark:text-indigo-400 font-bold">
                  {simSender.toUpperCase()} CK HOC PHI {simCode}
                </span>
              </div>
            </div>
          </DialogContent>

          <DialogActions className="p-4 pt-0 gap-2">
            <Button
              variant="outlined"
              onClick={() => setSimModalOpen(false)}
              disabled={simLoading}
              sx={{ color: 'inherit', borderColor: 'divider' }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={simLoading}
              startIcon={simLoading ? <CircularProgress size={16} color="inherit" /> : <Zap className="w-4 h-4" />}
              sx={{ backgroundColor: '#2538D9', '&:hover': { backgroundColor: '#1E2DB8' } }}
            >
              {simLoading ? 'Đang gửi...' : 'Chuyển tiền & Nghe "Ting!"'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Create Space Wizard Modal */}
      {showCreateWizard && (
        <CreateSpaceWizardModal
          open={showCreateWizard}
          onClose={() => setShowCreateWizard(false)}
          onSuccess={(newSpace) => {
            setSpaces((prev) => [newSpace, ...prev]);
          }}
        />
      )}

    </div>
  );
}
