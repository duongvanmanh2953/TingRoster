'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  CreditCard,
  QrCode,
  Users2,
  Tv,
  ShieldCheck,
  Building2,
  TrendingUp,
  Sparkles,
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  Lock,
  ArrowUpRight,
  Volume2,
  Bell,
  Play,
  HelpCircle,
  GraduationCap,
  Trophy,
  Home,
  CheckCircle,
  Smartphone,
  Laptop,
  Activity,
  DollarSign,
  Sun,
  Moon,
  RefreshCw,
  Sliders,
  LogIn,
  Layers,
  FileCheck2,
  CheckCheck
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Avatar, AvatarGroup } from '@/components/common/Avatar';
import { BankLogo, POPULAR_BANKS } from '@/components/common/BankLogo';
import { useTheme } from '@/components/theme/ThemeContext';
import { formatVND } from '@/lib/utils';

interface DemoStudent {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  fee: number;
}

export default function HomePage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  // Instant 1-Click Demo Login State
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);

  // Interactive Live Attendance State
  const [students, setStudents] = useState<DemoStudent[]>([
    { id: '1', name: 'Nguyễn Văn An', gender: 'male', age: 17, status: 'PRESENT', fee: 150000 },
    { id: '2', name: 'Trần Bảo Ngọc', gender: 'female', age: 17, status: 'PRESENT', fee: 150000 },
    { id: '3', name: 'Lê Hoàng Nam', gender: 'male', age: 18, status: 'PRESENT', fee: 150000 },
    { id: '4', name: 'Phạm Thuỳ Linh', gender: 'female', age: 17, status: 'LATE', fee: 150000 },
  ]);

  // Interactive Webhook / VietQR Simulator State
  const [simulatedInvoiceStatus, setSimulatedInvoiceStatus] = useState<'PENDING' | 'PAID'>('PENDING');
  const [simulatedWebhookLog, setSimulatedWebhookLog] = useState<{
    bank: string;
    amount: number;
    code: string;
    time: string;
  } | null>(null);
  const [isSimulatingBank, setIsSimulatingBank] = useState(false);

  // Interactive Persona Tabs
  const [activePersona, setActivePersona] = useState<'CLASS' | 'SPORTS' | 'RENTAL'>('CLASS');

  // Interactive ROI Calculator State
  const [memberCount, setMemberCount] = useState<number>(60);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // 1-Click Demo Instant Login Handler
  const handleInstantDemoLogin = async () => {
    setIsDemoLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@tingroster.vn', password: '123456' }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/dashboard';
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    } finally {
      setIsDemoLoggingIn(false);
    }
  };

  // Sound generator for "Ting!"
  const playTingSound = () => {
    if (typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window)) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } catch {
        // audio fallback
      }
    }
  };

  // Trigger simulated bank transaction webhook
  const handleSimulatePayment = () => {
    setIsSimulatingBank(true);
    playTingSound();

    setTimeout(() => {
      setSimulatedInvoiceStatus('PAID');
      setSimulatedWebhookLog({
        bank: 'MB Bank',
        amount: 600000,
        code: 'TR84920',
        time: new Date().toLocaleTimeString('vi-VN'),
      });
      setIsSimulatingBank(false);
    }, 600);
  };

  const handleResetSimulatedPayment = () => {
    setSimulatedInvoiceStatus('PENDING');
    setSimulatedWebhookLog(null);
  };

  // Toggle student status in interactive hero widget
  const cycleStudentStatus = (id: string) => {
    const statusCycle: DemoStudent['status'][] = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'];
    setStudents(prev =>
      prev.map(st => {
        if (st.id === id) {
          const currentIndex = statusCycle.indexOf(st.status);
          const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
          return { ...st, status: nextStatus };
        }
        return st;
      })
    );
  };

  // Derived calculations for attendance
  const presentCount = students.filter(s => s.status === 'PRESENT' || s.status === 'LATE').length;
  const totalRevenue = students
    .filter(s => s.status === 'PRESENT' || s.status === 'LATE')
    .reduce((acc, s) => acc + s.fee, 0);

  // ROI Calculator Math
  const hoursSavedPerMonth = Math.round(memberCount * 0.45);
  const moneyRecoveredPerMonth = Math.round(memberCount * 45000);

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] text-[#101828] dark:text-[#F1F5F9] flex flex-col font-sans selection:bg-[#2538D9] selection:text-white transition-colors duration-200">
      
      {/* Top Banner / Announcement Bar */}
      <div className="bg-[#0B0F19] dark:bg-[#060911] text-white text-xs py-2 px-4 text-center border-b border-[#1E283D] flex items-center justify-center gap-2 flex-wrap">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-200">
          Tự động đối soát VietQR Napas 24/7 trực tiếp qua SePay & Casso • Không qua trung gian
        </span>
        <button
          onClick={handleInstantDemoLogin}
          disabled={isDemoLoggingIn}
          className="underline font-bold text-indigo-300 hover:text-white ml-1 inline-flex items-center gap-1 cursor-pointer"
        >
          {isDemoLoggingIn ? 'Đang vào...' : 'Vào thử Demo ngay'} <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Global Navigation Header */}
      <header className="border-b border-[#E4E7EC] dark:border-[#1E283D] bg-white/95 dark:bg-[#0B0F19]/95 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          
          {/* Unified Brand Logo */}
          <Logo href="/" size="md" theme={isDark ? 'dark' : 'light'} showTagline={false} />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#475467] dark:text-slate-300">
            <a href="#tinh-nang" className="hover:text-[#2538D9] dark:hover:text-indigo-400 transition-colors">Tính năng</a>
            <a href="#trai-nghiem-live" className="hover:text-[#2538D9] dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2538D9] animate-ping" />
              <span>Dùng thử Live</span>
            </a>
            <a href="#doi-tuong" className="hover:text-[#2538D9] dark:hover:text-indigo-400 transition-colors">Đối tượng</a>
            <a href="#roi-calculator" className="hover:text-[#2538D9] dark:hover:text-indigo-400 transition-colors">Tính tiết kiệm</a>
            <a href="#bang-gia" className="hover:text-[#2538D9] dark:hover:text-indigo-400 transition-colors">Bảng giá</a>
            <Link href="/kiosk" className="hover:text-[#2538D9] dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-[#2538D9] dark:text-indigo-400">
              <Tv className="w-3.5 h-3.5" />
              <span>Kiosk tại sân</span>
            </Link>
          </nav>

          {/* Action CTAs: Theme Toggle, Đăng nhập, Demo 1-Click & Bắt đầu */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Clear Đăng nhập Button */}
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl border border-[#E4E7EC] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-[#101828] dark:text-white transition-all flex items-center gap-1.5 shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-[#2538D9] dark:text-indigo-400" />
              <span>Đăng nhập</span>
            </Link>

            {/* Fast 1-Click Demo Button */}
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={isDemoLoggingIn}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-gradient-to-r from-[#2538D9] to-[#6D5CE8] hover:from-[#1E2DB8] hover:to-[#5B4BD8] text-white text-xs font-bold shadow-md shadow-[#2538D9]/25 items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-60"
            >
              {isDemoLoggingIn ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang kết nối...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
                  <span>Vào Demo (1-Click)</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-10 pb-16 lg:pt-14 lg:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & High-Converting CTAs */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2538D9]/10 dark:bg-[#2538D9]/20 border border-[#2538D9]/20 text-xs font-bold text-[#2538D9] dark:text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-[#2538D9] animate-pulse" />
              <span>Nền tảng Điểm danh & Thu phí tự động số 1</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#101828] dark:text-white tracking-tight leading-[1.12]">
              Điểm danh một chạm. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2538D9] via-[#4353EB] to-[#6D5CE8]">
                Thu phí tự động.
              </span> <br />
              Đối soát khỏi lo.
            </h1>

            <p className="text-sm sm:text-base text-[#475467] dark:text-slate-300 leading-relaxed">
              Giải pháp toàn diện cho <strong className="text-[#101828] dark:text-white">Giáo viên dạy thêm</strong>, <strong className="text-[#101828] dark:text-white">CLB Thể thao (Pickleball/Cầu lông)</strong> và <strong className="text-[#101828] dark:text-white">Chủ nhà trọ mini</strong>. Tự động gạch nợ tức thì bằng VietQR Napas 24/7 trực tiếp vào tài khoản ngân hàng của bạn.
            </p>

            {/* Direct Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                disabled={isDemoLoggingIn}
                className="px-6 py-3.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#2538D9]/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
              >
                {isDemoLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang khởi tạo phiên demo...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-yellow-300" />
                    <span>Vào Dashboard ngay (Demo 1-Click)</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              <Link
                href="/login"
                className="px-5 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-[#E4E7EC] dark:border-slate-700 text-[#101828] dark:text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-[#2538D9] dark:text-indigo-400" />
                <span>Đăng nhập tài khoản</span>
              </Link>
            </div>

            {/* Micro Social Proof */}
            <div className="pt-2 flex items-center gap-3">
              <AvatarGroup
                members={[
                  { name: 'Nguyễn Văn Minh' },
                  { name: 'Trần Thị B' },
                  { name: 'Lê Minh C' },
                  { name: 'Phạm Thị D' },
                  { name: 'Hoàng Văn E' },
                ]}
                max={4}
                size="sm"
              />
              <p className="text-xs text-[#475467] dark:text-slate-400">
                <strong className="text-[#101828] dark:text-white">1.250+</strong> giáo viên, CLB & chủ nhà trọ tin dùng mỗi ngày
              </p>
            </div>

            {/* 3 Value Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-lg font-black text-[#2538D9] dark:text-indigo-400 tabular-nums">0.2s</span>
                <span className="text-[11px] text-[#475467] dark:text-slate-400 block leading-tight">Gạch nợ tức thì</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">100%</span>
                <span className="text-[11px] text-[#475467] dark:text-slate-400 block leading-tight">Về thẳng tài khoản</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-lg font-black text-violet-600 dark:text-violet-400 tabular-nums">0 VNĐ</span>
                <span className="text-[11px] text-[#475467] dark:text-slate-400 block leading-tight">Phí giao dịch</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual — Interactive Mockup Canvas */}
          <div className="lg:col-span-7 relative">
            
            {/* Ambient Glows */}
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#2538D9]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#6D5CE8]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Interactive Banner Tag */}
            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-800 rounded-t-2xl border border-b-0 border-[#E4E7EC] dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-bold text-[#101828] dark:text-white ml-2">TingRoster Live Simulator</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sẵn sàng tương tác
              </span>
            </div>

            {/* Main Interactive Sandbox Card */}
            <div className="bg-white dark:bg-slate-900 rounded-b-2xl border border-[#E4E7EC] dark:border-slate-700 shadow-2xl p-4 sm:p-6 space-y-5 text-left relative overflow-hidden">
              
              {/* Top Row: Mini Metrics Bar */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-semibold text-[#475467] dark:text-slate-400 block">Sĩ số buổi này</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base sm:text-lg font-black text-[#101828] dark:text-white tabular-nums">{presentCount}/4</span>
                    <span className="text-[10px] font-bold text-[#2538D9] dark:text-indigo-400">({Math.round((presentCount / 4) * 100)}%)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">Dự kiến thu</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300 tabular-nums block mt-0.5">
                    {formatVND(totalRevenue)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 block">Đối soát Napas</span>
                  <span className="text-xs sm:text-sm font-bold text-violet-700 dark:text-violet-300 block mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Tự động 24/7
                  </span>
                </div>
              </div>

              {/* Interactive Roster (Feature 1 Demo) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#475467] dark:text-slate-300 px-1">
                  <span className="flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-[#2538D9]" />
                    Bấm vào trạng thái để thử điểm danh 1-chạm:
                  </span>
                  <span className="text-[11px] text-[#2538D9] dark:text-indigo-400 font-semibold">Lớp Toán 12A</span>
                </div>

                <div className="space-y-1.5">
                  {students.map(st => (
                    <div
                      key={st.id}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar name={st.name} size="sm" gender={st.gender} age={st.age} />
                        <div>
                          <span className="text-xs font-bold text-[#101828] dark:text-white block leading-tight">
                            {st.name}
                          </span>
                          <span className="text-[10px] text-[#475467] dark:text-slate-400">
                            {formatVND(st.fee)} / buổi
                          </span>
                        </div>
                      </div>

                      {/* Clickable Status Switcher */}
                      <button
                        type="button"
                        onClick={() => cycleStudentStatus(st.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                          st.status === 'PRESENT'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                            : st.status === 'LATE'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                            : st.status === 'ABSENT'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-100'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>
                          {st.status === 'PRESENT' && 'Có mặt'}
                          {st.status === 'LATE' && 'Đi muộn'}
                          {st.status === 'ABSENT' && 'Vắng mặt'}
                          {st.status === 'EXCUSED' && 'Nghỉ có phép'}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive VietQR Webhook Box (Feature 2 Demo) */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-[#2538D9]/25 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#2538D9] dark:text-indigo-400" />
                    <span className="text-xs font-bold text-[#101828] dark:text-white">
                      Hóa đơn #HD-1092: 600.000đ (Nguyễn Văn An)
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    simulatedInvoiceStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700'
                      : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700'
                  }`}>
                    {simulatedInvoiceStatus === 'PAID' ? '✓ ĐÃ GẠCH NỢ' : 'CHƯA ĐÓNG'}
                  </span>
                </div>

                {/* Simulated Payment Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] text-[#475467] dark:text-slate-300 flex items-center gap-1.5">
                    <BankLogo bankId="MB" size="xs" />
                    <span>Nội dung chuyển khoản chuẩn: <code className="font-mono font-bold text-[#2538D9] dark:text-indigo-400">TR84920</code></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {simulatedInvoiceStatus === 'PENDING' ? (
                      <button
                        type="button"
                        onClick={handleSimulatePayment}
                        disabled={isSimulatingBank}
                        className="px-3.5 py-1.5 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#2538D9]/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
                        <span>{isSimulatingBank ? 'Đang nhận diện...' : 'Bắn thử 600.000đ (Ting!)'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResetSimulatedPayment}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#475467] dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Thử lại</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Webhook Confirmation Banner */}
                {simulatedWebhookLog && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
                    <span className="flex items-center gap-1.5">
                      <CheckCheck className="w-4 h-4 text-emerald-600" />
                      Ting! Nhận +600.000đ lúc {simulatedWebhookLog.time} qua {simulatedWebhookLog.bank}. Hóa đơn khớp 100%!
                    </span>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                      ĐÃ ĐỐI SOÁT
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Direct Link to Full Dashboard */}
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="text-xs font-bold text-[#2538D9] dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Xem giao diện đầy đủ với dữ liệu mẫu thật của bạn</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 4 Core Superpower Pillars */}
      <section id="tinh-nang" className="py-14 bg-white dark:bg-slate-900 border-y border-[#E4E7EC] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-[#2538D9] dark:text-indigo-400 tracking-wider uppercase">Tính năng cốt lõi</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-white tracking-tight">
              Tất cả những gì bạn cần để vận hành thảnh thơi
            </h2>
            <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400">
              Không còn sổ sách thủ công, không còn canh tin nhắn ngân hàng từng phút để kiểm tra ai đã đóng tiền.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Superpower 1: Điểm danh một chạm */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E4E7EC] dark:border-slate-700/60 hover:border-[#2538D9]/40 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-[#2538D9] dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#101828] dark:text-white mb-2">Điểm danh 1-Chạm</h3>
              <p className="text-xs text-[#475467] dark:text-slate-400 leading-relaxed">
                Thao tác nhanh trên điện thoại hoặc máy tính bảng. Tự động tính bù trừ nghỉ có phép và cập nhật học phí theo số buổi thực tế.
              </p>
            </div>

            {/* Superpower 2: QR VietQR Động */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E4E7EC] dark:border-slate-700/60 hover:border-[#2538D9]/40 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-[#6D5CE8] dark:text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#101828] dark:text-white mb-2">VietQR Napas 24/7</h3>
              <p className="text-xs text-[#475467] dark:text-slate-400 leading-relaxed">
                Tự động tạo mã QR có sẵn số tiền và nội dung chuyển khoản chuẩn xác. Quét được từ tất cả các ứng dụng ngân hàng và ví điện tử.
              </p>
            </div>

            {/* Superpower 3: Đối soát Webhook tự động */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E4E7EC] dark:border-slate-700/60 hover:border-[#2538D9]/40 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#101828] dark:text-white mb-2">Đối soát tự động 0.2s</h3>
              <p className="text-xs text-[#475467] dark:text-slate-400 leading-relaxed">
                Khớp giao dịch tức thì qua SePay & Casso. Hóa đơn tự động chuyển trạng thái &quot;Đã thanh toán&quot; mà không cần xem biên lai.
              </p>
            </div>

            {/* Superpower 4: Nhắc phí Zalo & Cổng minh bạch */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E4E7EC] dark:border-slate-700/60 hover:border-[#2538D9]/40 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#101828] dark:text-white mb-2">Cổng Phụ huynh & Zalo</h3>
              <p className="text-xs text-[#475467] dark:text-slate-400 leading-relaxed">
                Link tra cứu minh bạch chuyên cần và học phí riêng cho từng học viên / thành viên. Tự động gửi nhắc nợ nhẹ nhàng, tế nhị.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3 Industry Personas Deep-Dive (Interactive Tabs) */}
      <section id="doi-tuong" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-[#2538D9] dark:text-indigo-400 tracking-wider uppercase">Đối tượng sử dụng</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
            Tối ưu hóa chuyên sâu cho từng mô hình
          </h2>
          <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400">
            Tùy biến luồng dữ liệu theo đặc thù riêng biệt của lớp học, sân tập và căn hộ dịch vụ.
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setActivePersona('CLASS')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activePersona === 'CLASS'
                  ? 'bg-[#2538D9] text-white shadow-md shadow-[#2538D9]/25'
                  : 'text-[#475467] dark:text-slate-300 hover:text-[#101828] dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Giáo viên & Trung tâm</span>
            </button>

            <button
              onClick={() => setActivePersona('SPORTS')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activePersona === 'SPORTS'
                  ? 'bg-[#2538D9] text-white shadow-md shadow-[#2538D9]/25'
                  : 'text-[#475467] dark:text-slate-300 hover:text-[#101828] dark:hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>CLB Thể thao (Pickleball/Cầu lông)</span>
            </button>

            <button
              onClick={() => setActivePersona('RENTAL')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activePersona === 'RENTAL'
                  ? 'bg-[#2538D9] text-white shadow-md shadow-[#2538D9]/25'
                  : 'text-[#475467] dark:text-slate-300 hover:text-[#101828] dark:hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Chủ nhà trọ & Căn hộ mini</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-[#E4E7EC] dark:border-slate-700 p-6 sm:p-10 shadow-lg">
          {activePersona === 'CLASS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-bold text-[#2538D9] dark:text-indigo-300">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Dành riêng cho Gia sư & Trung tâm Giáo dục</span>
                </div>
                <h3 className="text-2xl font-black text-[#101828] dark:text-white">
                  Quản lý chuyên cần và học phí không bao giờ sai sót
                </h3>
                <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-300 leading-relaxed">
                  Giáo viên chỉ cần điểm danh 1 chạm vào đầu buổi học. Cuối tháng, hệ thống tự động nhân số buổi thực tế có mặt, trừ đi các buổi vắng có phép đã duyệt, và tạo hóa đơn kèm link VietQR động gửi đến từng phụ huynh.
                </p>
                <ul className="space-y-2.5 text-xs text-[#475467] dark:text-slate-300 pt-2">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Điểm danh sĩ số lớp nhanh bằng danh sách hoặc ảnh thẻ</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Cổng phụ huynh tra cứu lịch sử học và đóng học phí trực tiếp</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Xuất bảng kê điểm danh & tài chính ra file Excel chuẩn format</span>
                  </li>
                </ul>
                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleInstantDemoLogin}
                    className="px-5 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold shadow-md shadow-[#2538D9]/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Trải nghiệm ngay mô hình Lớp học</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href="/p/demo"
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold text-[#101828] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#2538D9]" />
                    <span>Xem thử Cổng Phụ huynh</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 bg-[#F8FAFC] dark:bg-slate-900 rounded-2xl border border-[#E4E7EC] dark:border-slate-700 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#101828] dark:text-white">
                  <span>Học sinh Lớp 12A • Tháng này</span>
                  <span className="text-emerald-600 font-bold">Đã thu 88%</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Nguyễn Văn An', sessions: '8/8 buổi', fee: '1.200.000đ', status: 'Đã đóng đủ' },
                    { name: 'Trần Bảo Ngọc', sessions: '7/8 buổi (1 phép)', fee: '1.050.000đ', status: 'Đã đóng đủ' },
                    { name: 'Lê Hoàng Nam', sessions: '8/8 buổi', fee: '1.200.000đ', status: 'Chưa đóng' },
                  ].map((row, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={row.name} size="sm" />
                        <div>
                          <span className="font-bold text-[#101828] dark:text-white block">{row.name}</span>
                          <span className="text-[10px] text-[#475467] dark:text-slate-400">{row.sessions}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#101828] dark:text-white block tabular-nums">{row.fee}</span>
                        <span className={`text-[10px] font-bold ${row.status === 'Chưa đóng' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePersona === 'SPORTS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-xs font-bold text-[#6D5CE8] dark:text-violet-300">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Dành riêng cho CLB Cầu lông, Pickleball, Bóng đá</span>
                </div>
                <h3 className="text-2xl font-black text-[#101828] dark:text-white">
                  Kiosk quét QR tại sân & Chia tiền quỹ chuẩn từng xu
                </h3>
                <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-300 leading-relaxed">
                  Đặt máy tính bảng hoặc iPad tại cửa sân làm Kiosk check-in. Hội viên chỉ cần quét mã QR để ghi nhận trận đấu. Tự động chia tiền thuê sân, tiền bóng, tiền nước và gửi VietQR thu hội phí theo tuần hoặc theo tháng.
                </p>
                <ul className="space-y-2.5 text-xs text-[#475467] dark:text-slate-300 pt-2">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Màn hình Kiosk quét QR tự phục vụ tại cửa sân</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Cảnh báo hết hạn gói lượt hoặc âm quỹ ngay khi check-in</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Chia đều tiền sân hoặc thu theo lượt chơi cực kỳ linh hoạt</span>
                  </li>
                </ul>
                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleInstantDemoLogin}
                    className="px-5 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold shadow-md shadow-[#2538D9]/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Trải nghiệm ngay CLB Thể thao</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href="/kiosk"
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold text-[#101828] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1"
                  >
                    <Tv className="w-3.5 h-3.5 text-violet-600" />
                    <span>Mở màn hình Kiosk sân</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 bg-[#F8FAFC] dark:bg-slate-900 rounded-2xl border border-[#E4E7EC] dark:border-slate-700 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#101828] dark:text-white">
                  <span>CLB Pickleball Sài Gòn • Kiosk Sân 2</span>
                  <span className="text-violet-600 font-bold">Kiosk Online</span>
                </div>
                <div className="p-4 rounded-xl bg-violet-900 text-white space-y-3 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-violet-700/60 flex items-center justify-center">
                    <QrCode className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">Quét QR Check-in vào sân</span>
                    <span className="text-[11px] text-violet-200">Đưa camera điện thoại quét mã thành viên</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePersona === 'RENTAL' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <Home className="w-3.5 h-3.5" />
                  <span>Dành riêng cho Chủ nhà trọ & Căn hộ mini</span>
                </div>
                <h3 className="text-2xl font-black text-[#101828] dark:text-white">
                  Chốt số điện nước & Tự động gạch nợ tiền thuê phòng
                </h3>
                <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-300 leading-relaxed">
                  Nhập số công tơ điện nước vào cuối tháng, TingRoster tự sinh hóa đơn tiền phòng kèm mã VietQR riêng cho từng phòng. Khách thuê chuyển khoản xong là tiền vào tài khoản chủ nhà, hệ thống gạch nợ ngay lập tức.
                </p>
                <ul className="space-y-2.5 text-xs text-[#475467] dark:text-slate-300 pt-2">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Ghi chỉ số điện nước & dịch vụ theo công tơ nhanh chóng</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Mỗi phòng 1 mã chuyển khoản riêng biệt, không bao giờ nhầm lẫn</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Tự động phát hiện khách nợ đọng quá hạn để gửi thông báo</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleInstantDemoLogin}
                    className="px-5 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold shadow-md shadow-[#2538D9]/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Trải nghiệm ngay Quản lý nhà trọ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 bg-[#F8FAFC] dark:bg-slate-900 rounded-2xl border border-[#E4E7EC] dark:border-slate-700 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#101828] dark:text-white">
                  <span>Dãy Trọ Hoa Sữa (12 phòng)</span>
                  <span className="text-emerald-600 font-bold">Kỳ Tháng 10</span>
                </div>
                <div className="space-y-2">
                  {[
                    { room: 'Phòng 101', elec: '85 kWh', water: '6 khối', total: '3.650.000đ', status: 'Đã thanh toán' },
                    { room: 'Phòng 102', elec: '110 kWh', water: '9 khối', total: '3.920.000đ', status: 'Chưa đóng' },
                    { room: 'Phòng 201', elec: '70 kWh', water: '5 khối', total: '3.450.000đ', status: 'Đã thanh toán' },
                  ].map((row, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#101828] dark:text-white block">{row.room}</span>
                        <span className="text-[10px] text-[#475467] dark:text-slate-400">Điện {row.elec} • Nước {row.water}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#101828] dark:text-white block tabular-nums">{row.total}</span>
                        <span className={`text-[10px] font-bold ${row.status === 'Chưa đóng' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactive ROI & Time Saved Calculator */}
      <section id="roi-calculator" className="py-16 bg-[#0B0F19] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Tính toán hiệu quả đầu tư</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              TingRoster giúp bạn tiết kiệm bao nhiêu?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Kéo thanh trượt để ước tính số giờ làm việc và doanh thu thu hồi mỗi tháng.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-[#131A2B] border border-[#1E283D] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
            
            {/* Slider Control */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Số lượng học sinh / hội viên / khách thuê của bạn:
                </span>
                <span className="text-2xl font-black text-indigo-400 tabular-nums">
                  {memberCount} <span className="text-sm font-semibold text-slate-400">người</span>
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={memberCount}
                onChange={(e) => setMemberCount(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#2538D9]"
              />

              <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                <span>10 người (Quy mô nhỏ)</span>
                <span>150 người</span>
                <span>300+ người (Quy mô lớn)</span>
              </div>
            </div>

            {/* Calculated Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 text-left">
                <span className="text-[11px] text-slate-400 block">Thời gian tiết kiệm</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums block mt-1">
                  ~{hoursSavedPerMonth} giờ
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Tương đương {Math.round(hoursSavedPerMonth / 8)} ngày công lao động
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 text-left">
                <span className="text-[11px] text-slate-400 block">Thất thoát thu hồi</span>
                <span className="text-2xl sm:text-3xl font-black text-indigo-400 tabular-nums block mt-1">
                  ~{formatVND(moneyRecoveredPerMonth)}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Nhờ nhắc nợ tự động & đối soát chính xác
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 text-left">
                <span className="text-[11px] text-slate-400 block">Tỷ lệ sai lệch nợ</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums block mt-1">
                  0%
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Không còn nhầm lẫn nội dung chuyển khoản
                </span>
              </div>
            </div>

            {/* Instant Demo Action */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2538D9] to-[#6D5CE8] hover:from-[#1E2DB8] hover:to-[#5B4BD8] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#2538D9]/25 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current text-yellow-300" />
                <span>Bắt đầu tiết kiệm thời gian ngay hôm nay (Dùng thử miễn phí)</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Supported Bank Network Showcase */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-[#E4E7EC] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-xs font-bold text-[#475467] dark:text-slate-400 uppercase tracking-wider">
            Tương thích trực tiếp với hệ sinh thái ngân hàng Napas 24/7 & Ví điện tử
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 opacity-90">
            {['MB', 'VCB', 'TCB', 'ACB', 'VPB', 'TPB', 'BIDV', 'ICB'].map((bankKey) => {
              const b = POPULAR_BANKS[bankKey];
              return (
                <div key={bankKey} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <BankLogo bankId={bankKey} size="sm" />
                  <span className="text-xs font-bold text-[#101828] dark:text-white">{b.shortName}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-[#475467] dark:text-slate-500 max-w-xl mx-auto">
            Học viên & khách hàng quét mã từ app ngân hàng bất kỳ. Tiền chuyển về 100% thẳng tài khoản chính chủ của bạn.
          </p>
        </div>
      </section>

      {/* Pricing / Bảng giá minh bạch */}
      <section id="bang-gia" className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-[#2538D9] dark:text-indigo-400 tracking-wider uppercase">Bảng giá minh bạch</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
            Gói dịch vụ phù hợp mọi quy mô
          </h2>
          <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400">
            Không phí ẩn, không hoa hồng trên mỗi giao dịch. Tiền vào thẳng tài khoản ngân hàng của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Free Starter */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#E4E7EC] dark:border-slate-700 p-6 lg:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#475467] dark:text-slate-400 uppercase">Khởi đầu</span>
              <h3 className="text-2xl font-black text-[#101828] dark:text-white">Miễn phí</h3>
              <p className="text-xs text-[#475467] dark:text-slate-400">Cho giáo viên mới hoặc nhóm hoạt động dưới 25 thành viên.</p>
              <div className="border-t border-[#E4E7EC] dark:border-slate-700 pt-4 space-y-2 text-xs text-[#475467] dark:text-slate-300">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>1 Workspace / Lớp học</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Tối đa 25 thành viên</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Điểm danh & xuất file Excel</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Tạo mã VietQR chuyển khoản</span></div>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/onboarding" className="w-full py-2.5 rounded-xl border border-[#E4E7EC] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-[#101828] dark:text-white flex items-center justify-center">
                Bắt đầu ngay
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-[#2538D9] p-6 lg:p-8 relative shadow-xl flex flex-col justify-between">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#2538D9] text-white text-[10px] font-bold">
              Khuyên dùng
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#2538D9] dark:text-indigo-400 uppercase">Chuyên nghiệp (Pro)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#101828] dark:text-white">199.000 đ</span>
                <span className="text-xs text-[#475467] dark:text-slate-400">/tháng</span>
              </div>
              <p className="text-xs text-[#475467] dark:text-slate-400">Đầy đủ tự động hóa đối soát ngân hàng 24/7 và thông báo.</p>
              <div className="border-t border-[#E4E7EC] dark:border-slate-700 pt-4 space-y-2 text-xs text-[#475467] dark:text-slate-300">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2538D9]" /><span>Không giới hạn lớp học / CLB</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2538D9]" /><span>Tối đa 500 thành viên</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2538D9]" /><span>Tự động đối soát Casso & SePay</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2538D9]" /><span>Kiosk quét QR check-in tại sân</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2538D9]" /><span>Báo cáo doanh thu & tỷ lệ nợ</span></div>
              </div>
            </div>
            <div className="pt-6">
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="w-full py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center justify-center shadow-md shadow-[#2538D9]/25 cursor-pointer"
              >
                Dùng thử Pro 14 ngày
              </button>
            </div>
          </div>

          {/* Enterprise */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#E4E7EC] dark:border-slate-700 p-6 lg:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#475467] dark:text-slate-400 uppercase">Trung tâm & Chuỗi</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#101828] dark:text-white">499.000 đ</span>
                <span className="text-xs text-[#475467] dark:text-slate-400">/tháng</span>
              </div>
              <p className="text-xs text-[#475467] dark:text-slate-400">Cho trung tâm nhiều cơ sở, chuỗi sân thể thao hoặc tòa nhà.</p>
              <div className="border-t border-[#E4E7EC] dark:border-slate-700 pt-4 space-y-2 text-xs text-[#475467] dark:text-slate-300">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Không giới hạn số lượng thành viên</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Phân quyền nhiều giáo viên & trợ giảng</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Tự động gửi tin nhắn Zalo ZNS</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Hỗ trợ kỹ thuật ưu tiên 24/7</span></div>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/onboarding" className="w-full py-2.5 rounded-xl border border-[#E4E7EC] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-[#101828] dark:text-white flex items-center justify-center">
                Liên hệ tư vấn
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ & Knowledge Accordion */}
      <section id="huong-dan" className="py-16 bg-white dark:bg-slate-900 border-t border-[#E4E7EC] dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-white">Câu hỏi thường gặp</h2>
            <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400">Những giải đáp nhanh giúp bạn an tâm vận hành</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'TingRoster có giữ tiền học phí của tôi không?',
                a: 'Không bao giờ. Tiền do học viên/hội viên chuyển khoản sẽ vào trực tiếp 100% tài khoản ngân hàng chính chủ của bạn (MB, Vietcombank, Techcombank...). TingRoster chỉ nhận diện biến động số dư qua webhook để tự động gạch nợ.'
              },
              {
                q: 'Làm sao hệ thống biết giao dịch nào thuộc về học sinh nào?',
                a: 'Mỗi học viên hoặc khoản thu được sinh một mã chuyển khoản duy nhất (ví dụ: TR84920). Khi người nộp quét mã QR, mã này được điền tự động vào nội dung chuyển khoản. Hệ thống đọc mã này để khớp lệnh chính xác 100%.'
              },
              {
                q: 'Tôi không rành công nghệ có sử dụng được không?',
                a: 'Rất dễ dàng. Giao diện được tối ưu bằng tiếng Việt trực quan, chỉ mất 3 phút để tạo lớp và bắt đầu điểm danh. Bạn không cần cài đặt phần mềm phức tạp.'
              },
              {
                q: 'Kiosk tại sân hoạt động như thế nào?',
                a: 'Bạn chỉ cần mở trang Kiosk trên một chiếc máy tính bảng hoặc laptop đặt tại quầy lễ tân / cửa sân. Hội viên đưa mã QR vào camera để check-in tức thì, màn hình sẽ phát âm thanh chào mừng.'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-[#E4E7EC] dark:border-slate-700 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-[#101828] dark:text-white flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-[#475467] dark:text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-90 text-[#2538D9] dark:text-indigo-400' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-[#475467] dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2 bg-slate-50/50 dark:bg-slate-800/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="bg-[#0B0F19] text-white py-12 px-4 border-t border-[#1E283D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo variant="full" theme="dark" size="md" showTagline={false} />
            <span className="hidden sm:inline text-xs text-slate-400 border-l border-slate-700 pl-3">
              Quản lý lớp học, CLB thể thao, nhà trọ...
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <a href="#tinh-nang" className="hover:text-white">Tính năng</a>
            <a href="#doi-tuong" className="hover:text-white">Đối tượng</a>
            <a href="#roi-calculator" className="hover:text-white">Tính tiết kiệm</a>
            <a href="#bang-gia" className="hover:text-white">Bảng giá</a>
            <Link href="/login" className="hover:text-white font-bold text-white">Đăng nhập</Link>
            <button
              onClick={handleInstantDemoLogin}
              className="px-4 py-2 rounded-xl bg-[#2538D9] text-white font-bold hover:bg-[#1E2DB8] transition-colors cursor-pointer"
            >
              Vào Demo ngay
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#1E283D] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>© {new Date().getFullYear()} TingRoster — Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo.</span>
          <span>100% VietQR Napas 24/7 • Casso & SePay Webhooks</span>
        </div>
      </footer>

    </div>
  );
}
