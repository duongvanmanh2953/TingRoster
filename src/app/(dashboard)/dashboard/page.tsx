'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatVND, formatDateTimeVN } from '@/lib/utils';
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
  ChevronDown,
  CalendarDays
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
import { BankLogo } from '@/components/common/BankLogo';
import { Avatar } from '@/components/common/Avatar';

interface DashboardStats {
  totalDue: number;
  totalPaid: number;
  remaining: number;
  collectionRate: number;
  unpaidCount: number;
  partialCount: number;
  paidCount: number;
  todayAttendeesCount: number;
  unmatchedCount: number;
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
  const [chartFilter, setChartFilter] = useState<'week' | 'month'>('month');

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

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/dashboard/summary');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Không thể tải dữ liệu tổng quan');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
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
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Row — Greeting & Action Controls (per 00-overview.png Screen 3) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
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

      {/* 2. Row 1: 4 Key Metric Cards (Doanh thu, Đã thu, Cần phải thu, Tỷ lệ thu) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Doanh thu */}
        <div className="ting-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#475467] dark:text-slate-400">Doanh thu ghi nhận</span>
            <div className="w-7 h-7 rounded-lg bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-[28px] font-bold text-[#101828] dark:text-[#F8FAFC] font-mono font-tnum leading-none">
              {formatVND(totalRevenue)}
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +12% so với tháng trước
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Đã thu */}
        <div className="ting-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#475467] dark:text-slate-400">Đã thực thu</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-[28px] font-bold text-emerald-700 dark:text-emerald-400 font-mono font-tnum leading-none">
              {formatVND(totalCollected)}
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +78% so với cùng kỳ
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Cần phải thu */}
        <div className="ting-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#475467] dark:text-slate-400">Còn phải thu</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-[28px] font-bold text-rose-600 dark:text-rose-400 font-mono font-tnum leading-none">
              {formatVND(remainingDue)}
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="text-xs text-[#475467] dark:text-slate-400 font-medium">
                {stats?.unpaidCount || 12} khoản thu chưa hoàn tất
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Tỷ lệ thu */}
        <div className="ting-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#475467] dark:text-slate-400">Tỷ lệ thu phí</span>
            <div className="w-7 h-7 rounded-lg bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-[28px] font-bold text-[#2538D9] dark:text-indigo-400 font-mono font-tnum leading-none">
              {collectionRate}%
            </div>
            <div className="mt-2.5">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="bg-[#2538D9] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, collectionRate)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Row 2: Charts & Breakdown Row (Doanh thu theo thời gian, Tình trạng các lớp, Sắp đến hạn) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Block A: Doanh thu theo thời gian (Span 6 columns) */}
        <div className="lg:col-span-6 ting-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
            <div>
              <h2 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Doanh thu theo thời gian</h2>
              <p className="text-[11px] text-[#475467] dark:text-slate-400">Dòng tiền học phí chuyển khoản thực tế qua VietQR</p>
            </div>
            <div className="flex items-center gap-1 bg-[#F5F7FB] dark:bg-slate-900 p-0.5 rounded-lg border border-[#E4E7EC] dark:border-[#1E293B] text-[11px]">
              <button
                onClick={() => setChartFilter('week')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  chartFilter === 'week' ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-indigo-400 shadow-xs font-semibold' : 'text-[#475467] dark:text-slate-400'
                }`}
              >
                Tuần này
              </button>
              <button
                onClick={() => setChartFilter('month')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  chartFilter === 'month' ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-indigo-400 shadow-xs font-semibold' : 'text-[#475467] dark:text-slate-400'
                }`}
              >
                Tháng này
              </button>
            </div>
          </div>

          {/* Clean Smooth SVG Chart */}
          <div className="py-4">
            <div className="h-44 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2538D9" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2538D9" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal reference lines */}
                <line x1="0" y1="30" x2="400" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="400" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="400" y2="110" stroke="#F1F5F9" strokeWidth="1" />
                
                {/* Area fill */}
                <path
                  d="M 0 110 L 0 95 C 60 85, 100 90, 150 65 C 200 40, 240 70, 300 45 C 350 25, 380 35, 400 20 L 400 110 Z"
                  fill="url(#revenueGrad)"
                />
                {/* Line stroke */}
                <path
                  d="M 0 95 C 60 85, 100 90, 150 65 C 200 40, 240 70, 300 45 C 350 25, 380 35, 400 20"
                  fill="none"
                  stroke="#2538D9"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Data points */}
                <circle cx="0" cy="95" r="3.5" fill="#FFFFFF" stroke="#2538D9" strokeWidth="2" />
                <circle cx="150" cy="65" r="3.5" fill="#FFFFFF" stroke="#2538D9" strokeWidth="2" />
                <circle cx="300" cy="45" r="3.5" fill="#FFFFFF" stroke="#2538D9" strokeWidth="2" />
                <circle cx="400" cy="20" r="4.5" fill="#2538D9" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-2 px-1 font-mono">
              <span>14/4</span>
              <span>17/4</span>
              <span>20/4</span>
              <span>23/4</span>
              <span>Hôm nay</span>
            </div>
          </div>
        </div>

        {/* Block B: Tình trạng các lớp (Span 3 columns) */}
        <div className="lg:col-span-3 ting-card p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Tình trạng các lớp</h2>
            <p className="text-[11px] text-[#475467] dark:text-slate-400">Phân bổ tiến độ thu các lớp</p>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* 4 segments */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#2538D9" strokeWidth="4.5" strokeDasharray="50 100" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#067647" strokeWidth="4.5" strokeDasharray="25 100" strokeDashoffset="-50" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#B54708" strokeWidth="4.5" strokeDasharray="15 100" strokeDashoffset="-75" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#B42318" strokeWidth="4.5" strokeDasharray="10 100" strokeDashoffset="-90" />
              </svg>
              <div className="absolute text-center">
                <span className="text-base font-extrabold text-[#101828] dark:text-[#F8FAFC] block">4 lớp</span>
                <span className="text-[9px] text-[#475467] dark:text-slate-400 uppercase font-bold tracking-wider">Đang chạy</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-2 border-t border-[#E4E7EC] dark:border-[#1E293B]">
            <div className="flex items-center justify-between text-[#475467] dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2538D9]" />
                Đã thu
              </span>
              <span className="font-semibold text-[#101828] dark:text-[#F8FAFC]">3 lớp</span>
            </div>
            <div className="flex items-center justify-between text-[#475467] dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#067647]" />
                Đúng hạn
              </span>
              <span className="font-semibold text-[#101828] dark:text-[#F8FAFC]">1 lớp</span>
            </div>
            <div className="flex items-center justify-between text-[#475467] dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B54708]" />
                Chờ nộp
              </span>
              <span className="font-semibold text-[#101828] dark:text-[#F8FAFC]">1 lớp</span>
            </div>
            <div className="flex items-center justify-between text-[#475467] dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B42318]" />
                Còn nợ
              </span>
              <span className="font-semibold text-[#101828] dark:text-[#F8FAFC]">1 lớp</span>
            </div>
          </div>
        </div>

        {/* Block C: Sắp đến hạn (Span 3 columns) */}
        <div className="lg:col-span-3 ting-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Sắp đến hạn</h2>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-[#475467] dark:text-slate-400">Các đợt thu học phí cần nhắc</p>
          </div>

          <div className="space-y-3 my-3">
            <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-[11px]">
                  6A
                </div>
                <div>
                  <p className="font-semibold text-[#101828] dark:text-[#F8FAFC]">Lớp Toán 6A</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Hạn: 26/04</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                2 ngày
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-[11px]">
                  PB
                </div>
                <div>
                  <p className="font-semibold text-[#101828] dark:text-[#F8FAFC]">CLB Pickleball</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Hạn: 29/04</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                5 ngày
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[11px]">
                  7A
                </div>
                <div>
                  <p className="font-semibold text-[#101828] dark:text-[#F8FAFC]">Lớp Tiếng Anh 7</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Hạn: 30/04</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                7 ngày
              </span>
            </div>
          </div>

          <Link
            href="/invoices?status=UNPAID"
            className="text-xs text-[#2538D9] dark:text-indigo-400 hover:underline font-semibold flex items-center justify-between pt-2 border-t border-[#E4E7EC] dark:border-[#1E293B]"
          >
            <span>Gửi thông báo nhắc phí</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Lịch biểu & Ca dạy hôm nay Widget */}
      <div className="ting-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-blue-50/40 dark:from-[#111726] dark:via-[#111726] dark:to-blue-950/20">
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

        {/* Feed 2: Giao dịch cần xử lý */}
        <div className="ting-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Giao dịch cần xử lý</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              3 chờ duyệt
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1E293B] my-2">
            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-[#101828] dark:text-[#F8FAFC]">Lê Văn D</p>
                <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">Thiếu 50.000đ</span>
                  <span>• 09:43</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#101828] dark:text-[#F8FAFC] tabular-nums block">200.000đ</span>
                <Link href="/transactions" className="text-[10px] text-[#2538D9] dark:text-indigo-400 hover:underline font-semibold">
                  Khớp thủ công
                </Link>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-[#101828] dark:text-[#F8FAFC]">Hoàng Thị E</p>
                <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">Sai nội dung</span>
                  <span>• 09:18</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#101828] dark:text-[#F8FAFC] tabular-nums block">400.000đ</span>
                <Link href="/transactions" className="text-[10px] text-[#2538D9] dark:text-indigo-400 hover:underline font-semibold">
                  Gợi ý khớp
                </Link>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-[#101828] dark:text-[#F8FAFC]">Đỗ Văn F</p>
                <div className="flex items-center gap-1 text-[10px] text-rose-700 dark:text-rose-400 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">Trùng webhook</span>
                  <span>• 08:35</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#101828] dark:text-[#F8FAFC] font-mono block">600.000đ</span>
                <span className="text-[10px] text-slate-400">Đã chặn</span>
              </div>
            </div>
          </div>

          <Link
            href="/transactions"
            className="pt-2 text-xs text-[#2538D9] dark:text-indigo-400 hover:underline font-semibold flex items-center justify-between border-t border-[#E4E7EC] dark:border-[#1E293B]"
          >
            <span>Mở trang đối soát chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Feed 3: Hoạt động gần đây */}
        <div className="ting-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
            <h2 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Hoạt động gần đây</h2>
            <History className="w-4 h-4 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1E293B] my-2">
            <div className="py-2.5 flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#101828] dark:text-[#F8FAFC] truncate">Đã thanh toán học phí Tháng 4</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Học sinh: Nguyễn Văn A • Lớp 6A</p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">10:24</span>
              </div>
            </div>

            <div className="py-2.5 flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-lg bg-[#2538D9]/10 text-[#2538D9] dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#101828] dark:text-[#F8FAFC] truncate">Tạo đợt thu mới: CLB Pickleball</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Phát hành 12 thông báo thanh toán</p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">09:48</span>
              </div>
            </div>

            <div className="py-2.5 flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CalendarCheck className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#101828] dark:text-[#F8FAFC] truncate">Điểm danh xong ca sáng</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">18/20 thành viên có mặt</p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">08:21</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-[#E4E7EC] dark:border-[#1E293B]">
            <span>Audit log ghi nhận đầy đủ</span>
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

    </div>
  );
}
