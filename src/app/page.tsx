'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  Lock,
  ArrowUpRight,
  Bell,
  GraduationCap,
  Trophy,
  Home,
  CheckCircle,
  Smartphone,
  Laptop,
  Sun,
  Moon,
  RefreshCw,
  LogIn,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Avatar, AvatarGroup } from '@/components/common/Avatar';
import { BankLogo, POPULAR_BANKS } from '@/components/common/BankLogo';
import { useTheme } from '@/components/theme/ThemeContext';
import { formatVND } from '@/lib/utils';
import { LandingMotionProvider } from '@/components/landing/LandingMotionProvider';

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
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    setStudents((prev) =>
      prev.map((st) => {
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
  const presentCount = students.filter((s) => s.status === 'PRESENT' || s.status === 'LATE').length;
  const totalRevenue = students
    .filter((s) => s.status === 'PRESENT' || s.status === 'LATE')
    .reduce((acc, s) => acc + s.fee, 0);

  // ROI Calculator Math
  const hoursSavedPerMonth = Math.round(memberCount * 0.45);
  const moneyRecoveredPerMonth = Math.round(memberCount * 45000);

  return (
    <LandingMotionProvider>
      <div className="min-h-svh bg-[#F5F7FB] dark:bg-[#0B0F19] text-[#101828] dark:text-[#F1F5F9] flex flex-col font-sans selection:bg-[#2538D9] selection:text-white">
        {/* Top Announcement Bar */}
        <div className="bg-[#0B0F19] dark:bg-[#060911] text-white text-sm py-2.5 px-4 text-center flex items-center justify-center gap-2 flex-wrap">
          <span className="font-medium text-slate-200">
            Tự động đối soát VietQR Napas 24/7 trực tiếp qua SePay & Casso • Tiền về thẳng tài khoản
          </span>
          <button
            onClick={handleInstantDemoLogin}
            disabled={isDemoLoggingIn}
            className="underline font-bold text-white hover:text-slate-200 ml-1 inline-flex items-center gap-1 cursor-pointer"
          >
            {isDemoLoggingIn ? 'Đang vào...' : 'Vào thử Demo ngay'} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Global Navigation Header */}
        <header className="bg-white dark:bg-[#0B0F19] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-4 flex items-center justify-between">
            {/* Unified Brand Logo */}
            <Logo href="/" size="md" theme={isDark ? 'dark' : 'light'} showTagline={false} />

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#475467] dark:text-slate-300">
              <a href="#tinh-nang" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">
                Tính năng
              </a>
              <a href="#da-thiet-bi" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">
                Đa thiết bị
              </a>
              <a href="#doi-tuong" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">
                Đối tượng
              </a>
              <a href="#roi-calculator" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">
                Tính tiết kiệm
              </a>
              <a href="#bang-gia" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">
                Bảng giá
              </a>
              <Link
                href="/kiosk"
                className="hover:text-[#2538D9] dark:hover:text-white transition-colors flex items-center gap-1.5 text-[#2538D9] dark:text-blue-400 font-bold"
              >
                <Tv className="w-4 h-4" />
                <span>Kiosk sân</span>
              </Link>
            </nav>

            {/* Action CTAs */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                aria-label="Chuyển đổi giao diện sáng tối"
                className="p-2.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <Link
                href="/login"
                className="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold text-[#101828] dark:text-white transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 text-[#2538D9]" />
                <span>Đăng nhập</span>
              </Link>

              <button
                type="button"
                onClick={handleInstantDemoLogin}
                disabled={isDemoLoggingIn}
                className="hidden sm:inline-flex px-5 py-2.5 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-sm font-bold items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                {isDemoLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang kết nối...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-amber-300" />
                    <span>Vào Demo (1-Click)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* HERO SECTION — Blueprint: Fragment on Shaped Stage */}
        <section className="pt-12 pb-20 lg:pt-16 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Two-Line Headline & Argument */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <h1 className="hero-headline text-4xl sm:text-5xl lg:text-6xl font-black text-[#101828] dark:text-white tracking-tight leading-[1.08]">
                Điểm danh một chạm.<br className="hidden sm:inline" />
                Đối soát tự động.
              </h1>

              <p className="hero-subtext text-base sm:text-lg text-[#475467] dark:text-slate-300 leading-relaxed max-w-xl">
                Nền tảng quản lý chuyên cần và tự động gạch nợ VietQR Napas 24/7 cho lớp học, CLB thể thao và nhà trọ tại Việt Nam.
              </p>

              {/* Actions */}
              <div className="hero-cta-buttons flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  disabled={isDemoLoggingIn}
                  className="px-6 py-3.5 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isDemoLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      <span>Đang kết nối demo...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current text-amber-300 shrink-0" />
                      <span>Trải nghiệm Demo ngay</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0" />
                    </>
                  )}
                </button>

                <Link
                  href="/login"
                  className="px-6 py-3.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#101828] dark:text-white font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4 text-[#2538D9] shrink-0" />
                  <span>Đăng nhập</span>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="pt-2 flex items-center gap-3">
                <AvatarGroup
                  members={[
                    { name: 'Nguyễn Văn Minh' },
                    { name: 'Trần Thị Bích' },
                    { name: 'Lê Minh Chiến' },
                    { name: 'Phạm Thuỳ Dung' },
                    { name: 'Hoàng Văn Em' },
                  ]}
                  max={4}
                  size="sm"
                />
                <p className="text-sm text-[#475467] dark:text-slate-400">
                  <strong className="text-[#101828] dark:text-white font-bold">1.250+</strong> cơ sở tin dùng mỗi ngày
                </p>
              </div>

              {/* 3 Real Operational Values */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#2538D9] dark:text-blue-400 tabular-nums block">
                    0.2s
                  </span>
                  <span className="text-sm font-medium text-[#475467] dark:text-slate-400 block mt-1">
                    Gạch nợ tức thì
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums block">
                    100%
                  </span>
                  <span className="text-sm font-medium text-[#475467] dark:text-slate-400 block mt-1">
                    Về thẳng tài khoản
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#101828] dark:text-white tabular-nums block">
                    0 VNĐ
                  </span>
                  <span className="text-sm font-medium text-[#475467] dark:text-slate-400 block mt-1">
                    Phí giao dịch
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Main Working Fragment on Flat Stage (data-ui) */}
            <div className="lg:col-span-7 w-full">
              <div
                data-ui="true"
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 space-y-6 text-left"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-sm font-bold text-[#101828] dark:text-white block">
                      Lớp Toán 12A • Điểm danh & Đối soát
                    </span>
                    <span className="text-xs text-[#475467] dark:text-slate-400">
                      Buổi học hôm nay • Sĩ số {presentCount}/4 thành viên
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Sẵn sàng tương tác
                  </span>
                </div>

                {/* Metrics Summary Strip */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-slate-800">
                    <span className="text-xs font-medium text-[#475467] dark:text-slate-400 block">Sĩ số có mặt</span>
                    <span className="text-xl font-black text-[#101828] dark:text-white tabular-nums block mt-0.5">
                      {presentCount}/4 ({Math.round((presentCount / 4) * 100)}%)
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-slate-800">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 block">Dự kiến thu</span>
                    <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 tabular-nums block mt-0.5">
                      {formatVND(totalRevenue)}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-slate-800">
                    <span className="text-xs font-medium text-[#2538D9] dark:text-blue-400 block">Napas 24/7</span>
                    <span className="text-sm font-bold text-[#2538D9] dark:text-blue-400 block mt-1">
                      Tự động khớp
                    </span>
                  </div>
                </div>

                {/* Interactive Roster (1-Touch Attendance) */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-[#475467] dark:text-slate-400 block">
                    Bấm vào trạng thái để thử đổi điểm danh:
                  </span>
                  <div className="space-y-2">
                    {students.map((st) => (
                      <div
                        key={st.id}
                        className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={st.name} size="sm" gender={st.gender} age={st.age} />
                          <div>
                            <span className="text-sm font-bold text-[#101828] dark:text-white block leading-tight">
                              {st.name}
                            </span>
                            <span className="text-xs text-[#475467] dark:text-slate-400">
                              {formatVND(st.fee)} / buổi
                            </span>
                          </div>
                        </div>

                        {/* Interactive Status Switcher */}
                        <button
                          type="button"
                          onClick={() => cycleStudentStatus(st.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            st.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : st.status === 'LATE'
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : st.status === 'ABSENT'
                              ? 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {st.status === 'PRESENT' && 'Có mặt'}
                          {st.status === 'LATE' && 'Đi muộn'}
                          {st.status === 'ABSENT' && 'Vắng mặt'}
                          {st.status === 'EXCUSED' && 'Nghỉ có phép'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive VietQR Invoice Simulator */}
                <div className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#475467] dark:text-slate-400 block">
                        Hóa đơn #HD-1092 • Nguyễn Văn An
                      </span>
                      <span className="text-base font-black text-[#101828] dark:text-white tabular-nums">
                        600.000 ₫ (4 buổi Toán)
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded ${
                        simulatedInvoiceStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {simulatedInvoiceStatus === 'PAID' ? 'ĐÃ ĐÓNG ĐỦ' : 'CHƯA ĐÓNG'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-[#475467] dark:text-slate-400">
                      Cú pháp Napas: <strong className="text-[#101828] dark:text-white font-bold">TR84920</strong>
                    </span>

                    {simulatedInvoiceStatus === 'PENDING' ? (
                      <button
                        type="button"
                        onClick={handleSimulatePayment}
                        disabled={isSimulatingBank}
                        className="px-4 py-2.5 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isSimulatingBank ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang khớp ngân hàng...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Mô phỏng VietQR Chuyển Khoản (Ting!)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResetSimulatedPayment}
                        className="px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-[#101828] dark:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Thử lại mô phỏng
                      </button>
                    )}
                  </div>

                  {/* Webhook Log Output */}
                  {simulatedWebhookLog && (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Webhook khớp thành công lúc {simulatedWebhookLog.time}</span>
                      </div>
                      <p className="text-[13px] leading-tight">
                        {simulatedWebhookLog.bank} đã nhận +{formatVND(simulatedWebhookLog.amount)} • Nội dung: {simulatedWebhookLog.code} • Tự động gạch nợ sau 0.18s
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 SUPERPOWERS — Blueprint: Composed Asymmetric Narrative */}
        <section id="tinh-nang" className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                Vận hành tự động từ điểm danh đến dòng tiền
              </h2>
              <p className="text-base sm:text-lg text-[#475467] dark:text-slate-400 leading-relaxed">
                Không còn sổ sách thủ công, không còn đối chiếu từng ảnh chụp màn hình chuyển khoản ngân hàng.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#2538D9] flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#101828] dark:text-white">
                  Điểm danh một chạm & Tự bù trừ nghỉ có phép
                </h3>
                <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed">
                  Thao tác nhanh trên điện thoại hoặc máy tính bảng. Tự động tính bù trừ nghỉ có phép và cộng dồn học phí theo số buổi học thực tế từng học sinh.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#2538D9] flex items-center justify-center">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#101828] dark:text-white">
                  Mã VietQR động tạo sẵn số tiền và nội dung
                </h3>
                <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed">
                  Mỗi hóa đơn mang mã định danh riêng biệt. Phụ huynh quét mã bằng bất kỳ ứng dụng ngân hàng nào (MB, VCB, Techcombank, Momo) mà không cần nhập tay.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#101828] dark:text-white">
                  Đối soát Webhook gạch nợ tức thì 0.2s
                </h3>
                <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed">
                  Tích hợp SePay & Casso bắt biến động số dư ngân hàng 24/7. Hóa đơn tự động chuyển trạng thái Đã đóng đủ mà không cần nhân viên kiểm tra sao kê.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 flex items-center justify-center">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#101828] dark:text-white">
                  Cổng tra cứu minh bạch & Nhắc nợ tự động
                </h3>
                <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed">
                  Link tra cứu riêng tư cho từng học viên và phụ huynh. Tự động gửi nhắc nợ nhẹ nhàng qua Zalo, không lộ thông tin danh bạ hoặc công nợ người khác.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MULTI-DEVICE ECOSYSTEM SHOWCASE */}
        <section id="da-thiet-bi" className="py-20 bg-[#F5F7FB] dark:bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                Vận hành đồng bộ trên mọi thiết bị
              </h2>
              <p className="text-base sm:text-lg text-[#475467] dark:text-slate-400 leading-relaxed">
                Dữ liệu cập nhật tức thì giữa máy tính văn phòng, tablet trên sân bóng, kiosk lễ tân và điện thoại thông minh.
              </p>
            </div>

            {/* Primary Multi-Device Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
              <div className="relative w-full h-[320px] sm:h-[460px] lg:h-[520px]">
                <Image
                  src="/images/multidevice-suite.jpg"
                  alt="Hệ sinh thái thiết bị TingRoster: Desktop, Tablet, Kiosk và Smartphone"
                  fill
                  priority={false}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover object-center"
                />
              </div>
              <div className="p-6 sm:p-8 bg-[#0B0F19] text-white space-y-2">
                <h3 className="text-xl sm:text-2xl font-black">
                  Một tài khoản duy nhất — Vận hành toàn bộ cơ sở
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Thay đổi danh sách học sinh trên máy tính, dữ liệu xuất hiện ngay trên tablet của giáo viên và màn hình kiosk ở quầy đón tiếp mà không cần làm mới trang.
                </p>
              </div>
            </div>

            {/* 3 Real Life Scenario Contexts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Context 1: Tablet in Action */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                <div className="relative w-full h-56 sm:h-64">
                  <Image
                    src="/images/tablet-manager.jpg"
                    alt="Giáo viên thao tác điểm danh trên máy tính bảng iPad"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#101828] dark:text-white">
                      Quản lý hiện trường không giấy tờ
                    </h3>
                    <p className="text-sm text-[#475467] dark:text-slate-300 leading-relaxed mt-2">
                      Giáo viên đứng tại lớp, HLV tại sân pickleball hay quản lý nhà trọ: mọi thao tác điểm danh và chốt số điện nước hoàn tất chỉ với vài cú chạm.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#2538D9] dark:text-blue-400 block pt-3">
                    Tương thích iPad & Android Tablet
                  </span>
                </div>
              </div>

              {/* Context 2: Kiosk Check-in */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                <div className="relative w-full h-56 sm:h-64">
                  <Image
                    src="/images/kiosk-checkin.jpg"
                    alt="Quầy kiosk tự phục vụ cho hội viên quét mã check-in"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#101828] dark:text-white">
                      Đón tiếp tự động — Giảm 80% áp lực lễ tân
                    </h3>
                    <p className="text-sm text-[#475467] dark:text-slate-300 leading-relaxed mt-2">
                      Đặt một chiếc tablet tại cửa ra vào. Hội viên tự quét mã cá nhân để check-in, màn hình phát âm thanh chào đón và cảnh báo nếu có phí quá hạn.
                    </p>
                  </div>
                  <Link
                    href="/kiosk"
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 pt-3"
                  >
                    <span>Mở Kiosk tự phục vụ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Context 3: Mobile VietQR */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                <div className="relative w-full h-56 sm:h-64">
                  <Image
                    src="/images/mobile-vietqr.jpg"
                    alt="Cổng phụ huynh tra cứu và thanh toán VietQR trên điện thoại"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#101828] dark:text-white">
                      Thanh toán Napas 24/7 không cần tải app
                    </h3>
                    <p className="text-sm text-[#475467] dark:text-slate-300 leading-relaxed mt-2">
                      Phụ huynh nhận link tra cứu qua tin nhắn Zalo. Mở trên trình duyệt điện thoại với mã QR có sẵn số tiền. Chuyển khoản xong là gạch nợ tức thì.
                    </p>
                  </div>
                  <Link
                    href="/p/demo"
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 pt-3"
                  >
                    <span>Xem thử Cổng phụ huynh</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INDUSTRY PERSONAS — Interactive Segment Tabs */}
        <section id="doi-tuong" className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                Giải pháp chuyên biệt cho từng mô hình
              </h2>
              <p className="text-base sm:text-lg text-[#475467] dark:text-slate-400 leading-relaxed">
                Tối ưu hóa cấu trúc dữ liệu theo nghiệp vụ đặc thù của lớp học, CLB thể thao và phòng trọ.
              </p>
            </div>

            {/* Persona Switcher Tabs */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActivePersona('CLASS')}
                className={`px-5 py-3 rounded-lg text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  activePersona === 'CLASS'
                    ? 'bg-[#2538D9] text-white'
                    : 'bg-[#F5F7FB] dark:bg-slate-800 text-[#475467] dark:text-slate-300 hover:text-[#101828]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Giáo viên & Trung tâm dạy thêm</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona('SPORTS')}
                className={`px-5 py-3 rounded-lg text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  activePersona === 'SPORTS'
                    ? 'bg-[#2538D9] text-white'
                    : 'bg-[#F5F7FB] dark:bg-slate-800 text-[#475467] dark:text-slate-300 hover:text-[#101828]'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>CLB Thể thao (Pickleball, Cầu lông, Gym)</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona('RENTAL')}
                className={`px-5 py-3 rounded-lg text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  activePersona === 'RENTAL'
                    ? 'bg-[#2538D9] text-white'
                    : 'bg-[#F5F7FB] dark:bg-slate-800 text-[#475467] dark:text-slate-300 hover:text-[#101828]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Nhà trọ & Căn hộ dịch vụ</span>
              </button>
            </div>

            {/* Persona Detail Presentation */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800 space-y-6">
              {activePersona === 'CLASS' && (
                <div className="space-y-6">
                  <div className="max-w-2xl space-y-2">
                    <h3 className="text-2xl font-bold text-[#101828] dark:text-white">
                      Dành cho Giáo viên & Trung tâm bồi dưỡng kiến thức
                    </h3>
                    <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed">
                      Quản lý danh sách lớp, tính tiền học phí linh hoạt theo gói tháng hoặc theo số buổi điểm danh thực tế. Phụ huynh an tâm nhận thông báo minh bạch.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-xs font-semibold text-[#475467] dark:text-slate-400">Hình thức học phí</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Thu theo buổi hoặc tháng</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-xs font-semibold text-[#475467] dark:text-slate-400">Nghỉ phép</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Tự động trừ tiền buổi nghỉ</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-xs font-semibold text-[#475467] dark:text-slate-400">Kênh gửi</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Link phụ huynh & Zalo</span>
                    </div>
                  </div>
                </div>
              )}

              {activePersona === 'SPORTS' && (
                <div className="space-y-6">
                  <div className="max-w-2xl space-y-2">
                    <h3 className="text-2xl font-bold text-[#101828] dark:text-white">
                      Dành cho CLB Pickleball, Cầu lông, Bóng đá & Phòng Gym
                    </h3>
                    <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed">
                      Check-in nhanh từng lượt vào sân. Kiosk quét QR tự phục vụ tại cửa ra vào, tự động kiểm tra số buổi tập còn lại của thành viên.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-xs font-semibold text-[#475467] dark:text-slate-400">Hình thức thẻ</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Gói lượt tập & Hội viên</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-xs font-semibold text-[#475467] dark:text-slate-400">Điểm danh tại sân</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Kiosk tablet 1 giây</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-xs font-semibold text-[#475467] dark:text-slate-400">Thu nợ giải đấu</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Mã VietQR động Napas 24/7</span>
                    </div>
                  </div>
                </div>
              )}

              {activePersona === 'RENTAL' && (
                <div className="space-y-6">
                  <div className="max-w-2xl space-y-2">
                    <h3 className="text-2xl font-bold text-[#101828] dark:text-white">
                      Dành cho Chủ Nhà trọ & Căn hộ dịch vụ mini
                    </h3>
                    <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed">
                      Quản lý từng phòng, chốt chỉ số điện nước cuối tháng và gửi hóa đơn chi tiết. Khách thuê chuyển khoản đúng nội dung là hệ thống tự khớp nợ.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-xs font-semibold text-[#475467] dark:text-slate-400">Hóa đơn</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Tiền phòng + Điện nước</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-xs font-semibold text-[#475467] dark:text-slate-400">Đối soát phòng</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Tự động gạch nợ từng phòng</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-xs font-semibold text-[#475467] dark:text-slate-400">Thông báo</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Nhắc nợ Zalo định kỳ</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ROI & TIME SAVED CALCULATOR */}
        <section id="roi-calculator" className="py-20 bg-[#0B0F19] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ước tính hiệu quả vận hành thực tế
              </h2>
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
                Kéo thanh trượt để xem số giờ lao động tiết kiệm và doanh thu thu hồi mỗi tháng.
              </p>
            </div>

            <div className="max-w-3xl p-8 sm:p-10 rounded-2xl bg-[#131A2B] space-y-8">
              {/* Slider Control */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">
                    Quy mô học sinh / hội viên / khách thuê:
                  </span>
                  <span className="text-2xl font-black text-white tabular-nums">
                    {memberCount} <span className="text-base font-normal text-slate-400">người</span>
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

                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>10 người (Lớp nhỏ)</span>
                  <span>150 người</span>
                  <span>300+ người (Trung tâm lớn)</span>
                </div>
              </div>

              {/* Real Measured Outcomes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-5 rounded-xl bg-[#0B0F19] space-y-1">
                  <span className="text-xs text-slate-400 block">Thời gian tiết kiệm</span>
                  <span className="text-3xl font-black text-emerald-400 tabular-nums block">
                    ~{hoursSavedPerMonth} giờ
                  </span>
                  <span className="text-xs text-slate-400 block pt-1">
                    Tương đương {Math.round(hoursSavedPerMonth / 8)} ngày công lao động
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-[#0B0F19] space-y-1">
                  <span className="text-xs text-slate-400 block">Thất thoát thu hồi</span>
                  <span className="text-3xl font-black text-white tabular-nums block">
                    ~{formatVND(moneyRecoveredPerMonth)}
                  </span>
                  <span className="text-xs text-slate-400 block pt-1">
                    Nhờ đối soát chính xác từng khoản thu
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-[#0B0F19] space-y-1">
                  <span className="text-xs text-slate-400 block">Tỷ lệ sai lệch nợ</span>
                  <span className="text-3xl font-black text-amber-400 tabular-nums block">
                    0%
                  </span>
                  <span className="text-xs text-slate-400 block pt-1">
                    Không còn nhầm lẫn nội dung chuyển khoản
                  </span>
                </div>
              </div>

              {/* Instant Action */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  className="px-6 py-3.5 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current text-amber-300 shrink-0" />
                  <span>Trải nghiệm dùng thử miễn phí</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* BANK NETWORK */}
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                Tương thích 100% hệ thống ngân hàng Napas 24/7
              </h2>
              <p className="text-sm text-[#475467] dark:text-slate-400">
                Học viên và khách hàng quét mã từ ứng dụng ngân hàng bất kỳ. Tiền chuyển về thẳng tài khoản chính chủ của bạn.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {['MB', 'VCB', 'TCB', 'ACB', 'VPB', 'TPB', 'BIDV', 'ICB'].map((bankKey) => {
                const b = POPULAR_BANKS[bankKey];
                return (
                  <div
                    key={bankKey}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#F5F7FB] dark:bg-slate-800"
                  >
                    <BankLogo bankId={bankKey} size="sm" />
                    <span className="text-sm font-bold text-[#101828] dark:text-white">{b.shortName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3-STEP IMPLEMENTATION */}
        <section className="py-20 bg-[#F5F7FB] dark:bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                Ba bước đơn giản để bắt đầu vận hành
              </h2>
              <p className="text-base sm:text-lg text-[#475467] dark:text-slate-400 leading-relaxed">
                Không cần cài đặt phức tạp, không cần thiết bị chuyên dụng đắt tiền.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#2538D9] flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#101828] dark:text-white">
                  Tạo Workspace & Nhập danh sách
                </h3>
                <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed">
                  Thiết lập tên lớp học, CLB hoặc nhà trọ. Nhập danh sách thành viên bằng file Excel có sẵn hoặc thêm nhanh trên điện thoại.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#2538D9] flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#101828] dark:text-white">
                  Điểm danh hoặc Chốt số điện nước
                </h3>
                <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed">
                  Điểm danh một chạm đầu buổi, mở kiosk tự phục vụ tại quầy, hoặc nhập số điện nước. Hệ thống tự tính toán chính xác học phí.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#101828] dark:text-white">
                  VietQR Tự gạch nợ 24/7
                </h3>
                <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed">
                  Gửi mã VietQR có sẵn số tiền và nội dung. Tiền về thẳng tài khoản bạn, hệ thống đối soát gạch nợ tự động trong 0.2 giây.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY & PERMISSIONS */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                An toàn tài chính & Phân quyền chặt chẽ
              </h2>
              <p className="text-base sm:text-lg text-[#475467] dark:text-slate-400 leading-relaxed">
                Thiết kế theo chuẩn Zero-Custody: TingRoster không bao giờ giữ tiền, không trung gian ví điện tử.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Owner */}
              <div className="p-6 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800 space-y-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#2538D9] text-white inline-block">
                  Chủ cơ sở
                </span>
                <h3 className="text-lg font-bold text-[#101828] dark:text-white">Toàn quyền Quản trị & Tài chính</h3>
                <ul className="space-y-2 text-sm text-[#475467] dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Cấu hình tài khoản ngân hàng nhận tiền</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Xem toàn bộ dòng tiền, nợ đọng & báo cáo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Mời và phân quyền giáo viên / nhân viên</span>
                  </li>
                </ul>
              </div>

              {/* Staff */}
              <div className="p-6 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800 space-y-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-700 text-white inline-block">
                  Giáo viên & Trợ giảng
                </span>
                <h3 className="text-lg font-bold text-[#101828] dark:text-white">Vận hành Hiện trường & Điểm danh</h3>
                <ul className="space-y-2 text-sm text-[#475467] dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Điểm danh sĩ số lớp & ghi chú học viên</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Không truy cập doanh thu tổng hoặc ngân hàng</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Thao tác nhanh trên máy tính bảng hoặc di động</span>
                  </li>
                </ul>
              </div>

              {/* Member */}
              <div className="p-6 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800 space-y-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-600 text-white inline-block">
                  Phụ huynh & Hội viên
                </span>
                <h3 className="text-lg font-bold text-[#101828] dark:text-white">Cổng Tra cứu Minh bạch Riêng tư</h3>
                <ul className="space-y-2 text-sm text-[#475467] dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Mã token ngẫu nhiên an toàn, không lộ danh bạ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Xem chuyên cần, lịch sử đóng và mã VietQR</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Không xem thông tin hoặc công nợ của người khác</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING TABLE */}
        <section id="bang-gia" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
              Biểu phí minh bạch, không phí ẩn
            </h2>
            <p className="text-base sm:text-lg text-[#475467] dark:text-slate-400 leading-relaxed">
              Không hoa hồng trên từng giao dịch. Tiền vào thẳng 100% tài khoản ngân hàng của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-sm font-bold text-[#475467] dark:text-slate-400 block">Gói Khởi đầu</span>
                <h3 className="text-3xl font-black text-[#101828] dark:text-white">Miễn phí</h3>
                <p className="text-sm text-[#475467] dark:text-slate-400">
                  Dành cho giáo viên mới hoặc nhóm hoạt động dưới 25 thành viên.
                </p>
                <div className="pt-4 space-y-2.5 text-sm text-[#475467] dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>1 Workspace / Lớp học</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Tối đa 25 thành viên</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Điểm danh & xuất file Excel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Tạo mã VietQR chuyển khoản</span>
                  </div>
                </div>
              </div>
              <Link
                href="/onboarding"
                className="w-full py-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-sm font-bold text-[#101828] dark:text-white flex items-center justify-center transition-colors"
              >
                Bắt đầu ngay
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 flex flex-col justify-between space-y-6 relative">
              <div className="space-y-4">
                <span className="text-sm font-bold text-[#2538D9] dark:text-blue-400 block">Gói Chuyên nghiệp</span>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-4xl font-black text-[#101828] dark:text-white">199.000 đ</h3>
                  <span className="text-sm text-[#475467] dark:text-slate-400">/tháng</span>
                </div>
                <p className="text-sm text-[#475467] dark:text-slate-400">
                  Tự động hóa hoàn toàn đối soát ngân hàng 24/7 và thông báo.
                </p>
                <div className="pt-4 space-y-2.5 text-sm text-[#475467] dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#2538D9]" />
                    <span>Không giới hạn lớp học / CLB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#2538D9]" />
                    <span>Tối đa 500 thành viên</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#2538D9]" />
                    <span>Tự động đối soát Casso & SePay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#2538D9]" />
                    <span>Kiosk quét QR check-in tại sân</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#2538D9]" />
                    <span>Báo cáo doanh thu & tỷ lệ nợ</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="w-full py-3 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                Dùng thử Pro 14 ngày
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-sm font-bold text-[#101828] dark:text-white block">Gói Chuỗi & Cơ sở lớn</span>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-4xl font-black text-[#101828] dark:text-white">499.000 đ</h3>
                  <span className="text-sm text-[#475467] dark:text-slate-400">/tháng</span>
                </div>
                <p className="text-sm text-[#475467] dark:text-slate-400">
                  Cho trung tâm nhiều chi nhánh hoặc cụm sân thể thao.
                </p>
                <div className="pt-4 space-y-2.5 text-sm text-[#475467] dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Không giới hạn thành viên</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Phân quyền nhiều giáo viên & trợ giảng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Tự động gửi thông báo Zalo ZNS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Hỗ trợ kỹ thuật ưu tiên 24/7</span>
                  </div>
                </div>
              </div>
              <Link
                href="/onboarding"
                className="w-full py-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-sm font-bold text-[#101828] dark:text-white flex items-center justify-center transition-colors"
              >
                Đăng ký gói Chuỗi
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section id="huong-dan" className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                Câu hỏi thường gặp
              </h2>
              <p className="text-base text-[#475467] dark:text-slate-400">
                Những giải đáp nhanh giúp bạn an tâm vận hành
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'TingRoster có giữ tiền học phí của tôi không?',
                  a: 'Không bao giờ. Tiền do học viên hoặc hội viên chuyển khoản sẽ vào trực tiếp 100% tài khoản ngân hàng chính chủ của bạn (MB, Vietcombank, Techcombank...). TingRoster chỉ nhận diện biến động số dư qua webhook để tự động gạch nợ.',
                },
                {
                  q: 'Làm sao hệ thống biết giao dịch nào thuộc về học sinh nào?',
                  a: 'Mỗi học viên hoặc khoản thu được sinh một mã chuyển khoản duy nhất (ví dụ: TR84920). Khi người nộp quét mã QR, mã này được điền tự động vào nội dung chuyển khoản. Hệ thống đọc mã này để khớp lệnh chính xác 100%.',
                },
                {
                  q: 'Tôi không rành công nghệ có sử dụng được không?',
                  a: 'Rất dễ dàng. Giao diện được tối ưu bằng tiếng Việt trực quan, chỉ mất 3 phút để tạo lớp và bắt đầu điểm danh. Bạn không cần cài đặt phần mềm phức tạp.',
                },
                {
                  q: 'Kiosk tại sân hoạt động như thế nào?',
                  a: 'Bạn chỉ cần mở trang Kiosk trên một chiếc máy tính bảng hoặc laptop đặt tại quầy lễ tân. Hội viên đưa mã QR vào camera để check-in tức thì, màn hình sẽ phát âm thanh chào mừng.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="rounded-xl bg-[#F5F7FB] dark:bg-slate-800 overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-5 text-left font-bold text-base text-[#101828] dark:text-white flex items-center justify-between cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-xl font-bold text-[#2538D9] dark:text-blue-400 ml-4 shrink-0">
                      {activeFaq === idx ? '−' : '+'}
                    </span>
                  </button>
                  {activeFaq === idx && (
                    <div className="px-5 pb-5 text-base text-[#475467] dark:text-slate-300 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING ACTION CTA */}
        <section className="py-20 bg-[#F5F7FB] dark:bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-[#101828] dark:text-white tracking-tight">
              Bắt đầu tự động hóa cơ sở của bạn hôm nay.
            </h2>
            <p className="text-base sm:text-lg text-[#475467] dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Gia nhập cùng 1.250+ giáo viên, câu lạc bộ thể thao và chủ nhà trọ tại Việt Nam.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="px-8 py-4 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-base inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-current text-amber-300 shrink-0" />
                <span>Trải nghiệm Demo ngay (1-Click)</span>
              </button>
            </div>
          </div>
        </section>

        {/* GLOBAL FOOTER */}
        <footer className="bg-[#0B0F19] text-white py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Logo variant="full" theme="dark" size="md" showTagline={false} />
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
              <a href="#tinh-nang" className="hover:text-white transition-colors">
                Tính năng
              </a>
              <a href="#da-thiet-bi" className="hover:text-white transition-colors">
                Đa thiết bị
              </a>
              <a href="#doi-tuong" className="hover:text-white transition-colors">
                Đối tượng
              </a>
              <a href="#roi-calculator" className="hover:text-white transition-colors">
                Tính tiết kiệm
              </a>
              <a href="#bang-gia" className="hover:text-white transition-colors">
                Bảng giá
              </a>
              <Link href="/login" className="hover:text-white font-bold text-white transition-colors">
                Đăng nhập
              </Link>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>© {new Date().getFullYear()} TingRoster — Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo.</span>
            <span>VietQR Napas 24/7 • Casso & SePay Webhooks</span>
          </div>
        </footer>
      </div>
    </LandingMotionProvider>
  );
}
