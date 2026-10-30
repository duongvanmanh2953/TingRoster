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
  ShieldCheck,
  Building2,
  Check,
  Tv,
  ExternalLink,
  Sun,
  Moon,
  RefreshCw,
  LogIn,
  GraduationCap,
  Trophy,
  Home,
  CheckCircle,
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

  // Interactive Pricing Blueprint State
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PRO' | 'ENTERPRISE'>('PRO');

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
    }, 500);
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
        <div className="bg-[#0B0F19] dark:bg-[#060911] text-white text-base py-3 px-4 text-center flex items-center justify-center gap-3 flex-wrap">
          <span className="font-medium text-slate-200">
            Tự động đối soát VietQR Napas 24/7 trực tiếp qua SePay & Casso • Tiền về thẳng tài khoản
          </span>
          <button
            onClick={handleInstantDemoLogin}
            disabled={isDemoLoggingIn}
            className="underline font-bold text-white hover:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
          >
            {isDemoLoggingIn ? 'Đang vào...' : 'Vào thử Demo ngay'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Global Navigation Header */}
        <header className="bg-white dark:bg-[#0B0F19] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Unified Brand Logo */}
            <Logo href="/" size="md" theme={isDark ? 'dark' : 'light'} showTagline={false} />

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 text-base font-semibold text-[#475467] dark:text-slate-300">
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
                className="p-2.5 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <Link
                href="/login"
                className="px-4 py-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-base font-bold text-[#101828] dark:text-white transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 text-[#2538D9]" />
                <span>Đăng nhập</span>
              </Link>

              <button
                type="button"
                onClick={handleInstantDemoLogin}
                disabled={isDemoLoggingIn}
                className="hidden sm:inline-flex px-5 py-2.5 rounded bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-base font-bold items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
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

        {/* HERO SECTION — Direction: The Product Performs (Stage + Interactive Console) */}
        <section className="pt-12 pb-20 lg:pt-16 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="space-y-12">
            {/* Top Area: Confident 2-Line Headline across wide measure */}
            <div className="max-w-4xl space-y-5 text-left">
              <h1 className="hero-headline text-3xl sm:text-5xl lg:text-6xl font-black text-[#101828] dark:text-white tracking-tight leading-[1.08]">
                Điểm danh một chạm.<br className="hidden sm:inline" /> Đối soát tự động.
              </h1>

              <p className="hero-subtext text-base sm:text-lg text-[#475467] dark:text-slate-300 leading-relaxed max-w-2xl">
                Nền tảng quản lý chuyên cần và tự động gạch nợ VietQR Napas 24/7 cho lớp học, CLB thể thao và nhà trọ tại Việt Nam.
              </p>

              {/* Actions & Proof */}
              <div className="hero-cta-buttons flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  disabled={isDemoLoggingIn}
                  className="px-6 py-3.5 rounded bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
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
                  className="px-6 py-3.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#101828] dark:text-white font-bold text-base transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4 text-[#2538D9] shrink-0" />
                  <span>Đăng nhập</span>
                </Link>

                <div className="flex items-center gap-3 pl-2">
                  <AvatarGroup
                    members={[
                      { name: 'Nguyễn Văn Minh' },
                      { name: 'Trần Thị Bích' },
                      { name: 'Lê Minh Chiến' },
                      { name: 'Phạm Thuỳ Dung' },
                    ]}
                    max={4}
                    size="sm"
                  />
                  <span className="text-base text-[#475467] dark:text-slate-300">
                    <strong className="text-[#101828] dark:text-white font-bold">1.250+</strong> cơ sở tin dùng
                  </span>
                </div>
              </div>
            </div>

            {/* LIVE OPERATIONAL CONSOLE (data-ui: Real Working Product Fragment) */}
            <div className="hero-operational-console w-full">
              <div
                data-ui="true"
                className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 space-y-6 text-left"
              >
                {/* Console Strip Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                  <div>
                    <span className="text-base font-bold text-[#101828] dark:text-white block">
                      Bàn điều khiển vận hành trực tiếp • Lớp Toán 12A
                    </span>
                    <span className="text-base text-[#475467] dark:text-slate-400">
                      Sĩ số hôm nay: {presentCount}/4 thành viên • Thao tác trực tiếp để xem dữ liệu nhảy
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold px-3 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      ● Đang kết nối Napas 24/7
                    </span>
                  </div>
                </div>

                {/* 3 Live Metric Panels (Asymmetric Spans) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-5 p-4 rounded bg-[#F5F7FB] dark:bg-slate-800/80">
                    <span className="text-2xl sm:text-3xl font-black text-[#101828] dark:text-white tabular-nums block">
                      {presentCount}/4 ({Math.round((presentCount / 4) * 100)}%)
                    </span>
                    <span className="text-base font-medium text-[#475467] dark:text-slate-300 block mt-1">
                      Sĩ số có mặt thực tế
                    </span>
                  </div>

                  <div className="sm:col-span-4 p-4 rounded bg-[#F5F7FB] dark:bg-slate-800/80">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 tabular-nums block">
                      {formatVND(totalRevenue)}
                    </span>
                    <span className="text-base font-medium text-[#475467] dark:text-slate-300 block mt-1">
                      Dự kiến thu theo buổi
                    </span>
                  </div>

                  <div className="sm:col-span-3 p-4 rounded bg-[#F5F7FB] dark:bg-slate-800/80">
                    <span className="text-2xl sm:text-3xl font-black text-[#2538D9] dark:text-blue-400 tabular-nums block">
                      0.2s
                    </span>
                    <span className="text-base font-medium text-[#475467] dark:text-slate-300 block mt-1">
                      Tốc độ gạch nợ tức thì
                    </span>
                  </div>
                </div>

                {/* 2-Column Split: Attendance Roster on Left, VietQR Stream on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  {/* Left Column: Interactive Roster (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    <span className="text-base font-bold text-[#101828] dark:text-white block">
                      Sổ điểm danh một chạm (Bấm trạng thái để đổi):
                    </span>
                    <div className="space-y-2">
                      {students.map((st) => (
                        <div
                          key={st.id}
                          className="p-3.5 rounded bg-[#F8FAFC] dark:bg-slate-800/60 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar name={st.name} size="sm" gender={st.gender} age={st.age} />
                            <div className="truncate">
                              <span className="text-base font-bold text-[#101828] dark:text-white block truncate">
                                {st.name}
                              </span>
                              <span className="text-base text-[#475467] dark:text-slate-300">
                                {formatVND(st.fee)} / buổi
                              </span>
                            </div>
                          </div>

                          {/* Interactive Status Switcher */}
                          <button
                            type="button"
                            onClick={() => cycleStudentStatus(st.id)}
                            className={`px-4 py-2 rounded text-base font-bold cursor-pointer transition-colors whitespace-nowrap ${
                              st.status === 'PRESENT'
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : st.status === 'LATE'
                                ? 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
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

                  {/* Right Column: VietQR Invoice & Webhook Simulator (5 cols) */}
                  <div className="lg:col-span-5 p-5 rounded bg-[#F5F7FB] dark:bg-slate-800 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-base text-[#475467] dark:text-slate-400 block">
                            Hóa đơn #HD-1092 • Nguyễn Văn An
                          </span>
                          <span className="text-lg font-black text-[#101828] dark:text-white tabular-nums">
                            600.000 ₫ (4 buổi học)
                          </span>
                        </div>

                        <span
                          className={`text-base font-bold px-3 py-1 rounded ${
                            simulatedInvoiceStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {simulatedInvoiceStatus === 'PAID' ? 'ĐÃ ĐÓNG ĐỦ' : 'CHƯA ĐÓNG'}
                        </span>
                      </div>

                      <div className="p-3.5 rounded bg-white dark:bg-slate-900 text-base space-y-1">
                        <span className="text-[#475467] dark:text-slate-400 block">
                          Cú pháp Napas 24/7:
                        </span>
                        <span className="font-bold text-[#101828] dark:text-white tracking-wider block text-lg">
                          TR84920
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      {simulatedInvoiceStatus === 'PENDING' ? (
                        <button
                          type="button"
                          onClick={handleSimulatePayment}
                          disabled={isSimulatingBank}
                          className="w-full px-4 py-3.5 rounded bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-base font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          {isSimulatingBank ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Đang khớp ngân hàng...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              <span>Mô phỏng Chuyển khoản VietQR (Ting!)</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResetSimulatedPayment}
                          className="w-full px-4 py-3.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-[#101828] dark:text-white text-base font-bold transition-colors cursor-pointer"
                        >
                          Thử lại mô phỏng đối soát
                        </button>
                      )}

                      {/* Webhook Log Output */}
                      {simulatedWebhookLog && (
                        <div className="p-3.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 text-base space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Khớp thành công lúc {simulatedWebhookLog.time}</span>
                          </div>
                          <p className="text-base leading-relaxed">
                            {simulatedWebhookLog.bank} đã nhận +{formatVND(simulatedWebhookLog.amount)} • Cú pháp: {simulatedWebhookLog.code} • Tự động gạch nợ sau 0.18s
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: COMPOSED SPLIT NARRATIVE — Operational Contrast & Capabilities */}
        <section id="tinh-nang" className="scroll-reveal py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black text-[#101828] dark:text-white tracking-tight leading-tight">
                Vận hành tự động đến dòng tiền
              </h2>
              <p className="text-base sm:text-lg text-[#475467] dark:text-slate-300 leading-relaxed max-w-[60ch]">
                Chấm dứt hoàn toàn cảnh đối chiếu từng ảnh chụp bill ngân hàng mờ nhạt và ghi chép sổ tay nhầm lẫn.
              </p>
            </div>

            {/* Split Comparison Ledger: Manual Pain vs TingRoster Automated Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: The Manual Chaos (5 cols) */}
              <div className="lg:col-span-5 p-8 rounded-xl bg-[#F5F7FB] dark:bg-slate-800 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-base font-bold text-rose-800 dark:text-rose-300 block">
                    Cách quản lý thủ công truyền thống
                  </span>
                  <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed max-w-[54ch]">
                    Mỗi cuối tháng là nỗi lo: cộng sổ điểm danh, trừ ngày nghỉ phép từng em, gửi tin nhắn đòi nợ rồi ngồi rà soát hàng trăm ảnh chụp sao kê ngân hàng.
                  </p>
                  <ul className="space-y-3 pt-2 text-base text-[#475467] dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                      <span>Mất 25–40 giờ mỗi tháng đối chiếu sao kê</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                      <span>Thất thoát học phí do quên ghi chép buổi nghỉ</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                      <span>Ngại ngùng khi nhắn tin nhắc nợ phụ huynh</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 text-base font-medium">
                  Tỷ lệ thất thoát trung bình 5–8% tổng doanh thu mỗi cơ sở.
                </div>
              </div>

              {/* Right Column: TingRoster Automated Pipeline (7 cols) */}
              <div className="lg:col-span-7 p-8 rounded-xl bg-[#0B0F19] text-white space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-blue-300 block">
                      Quy trình khép kín TingRoster
                    </span>
                    <span className="text-base font-bold text-emerald-400">
                      Chính xác 100%
                    </span>
                  </div>

                  {/* 4 Concrete Capabilities as a Connected Command Flow */}
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <span className="text-base font-bold text-white block">
                        Điểm danh một chạm & Tự bù trừ nghỉ có phép
                      </span>
                      <p className="text-base text-slate-300 leading-relaxed max-w-[56ch]">
                        Thao tác nhanh trên điện thoại hoặc tablet tại lớp. Hệ thống tự trừ tiền các buổi vắng có phép và cộng dồn học phí đúng theo số buổi thực học.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-base font-bold text-white block">
                        VietQR Napas động tạo sẵn số tiền và nội dung
                      </span>
                      <p className="text-base text-slate-300 leading-relaxed max-w-[56ch]">
                        Mỗi học viên mang mã định danh duy nhất. Quét mã bằng bất kỳ ngân hàng nào (MB, VCB, Techcombank, Momo) mà không cần gõ tay số tiền.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-base font-bold text-white block">
                        Webhook SePay & Casso gạch nợ tức thì 0.2 giây
                      </span>
                      <p className="text-base text-slate-300 leading-relaxed max-w-[56ch]">
                        Bắt biến động số dư 24/7. Tiền về thẳng tài khoản bạn, hóa đơn tự động chuyển trạng thái Đã đóng đủ mà không cần nhân viên kiểm tra sao kê.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-base font-bold text-white block">
                        Cổng tra cứu riêng tư bảo vệ danh bạ
                      </span>
                      <p className="text-base text-slate-300 leading-relaxed max-w-[56ch]">
                        Mỗi phụ huynh nhận link bảo mật với token ngẫu nhiên. Không bao giờ hiển thị danh bạ hoặc công nợ của học sinh khác.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-base text-slate-400">
                  <span>Tiền về 100% tài khoản chính chủ</span>
                  <span className="text-white font-bold">Zero-Custody</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: MULTI-DEVICE ECOSYSTEM SHOWCASE */}
        <section id="da-thiet-bi" className="scroll-reveal py-20 bg-[#F5F7FB] dark:bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black text-[#101828] dark:text-white tracking-tight leading-tight">
                Đồng bộ tức thì trên mọi thiết bị
              </h2>
              <p className="text-base sm:text-lg text-[#475467] dark:text-slate-300 leading-relaxed max-w-[60ch]">
                Dữ liệu đồng bộ theo thời gian thực giữa máy tính giáo viên, tablet tại sân bóng, kiosk lễ tân và điện thoại thông minh.
              </p>
            </div>

            {/* Primary Multi-Device Banner */}
            <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-800">
              <div className="relative w-full h-[320px] sm:h-[460px] lg:h-[500px]">
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
                <span className="text-xl sm:text-2xl font-black block">
                  Một tài khoản duy nhất — Vận hành toàn bộ cơ sở
                </span>
                <p className="text-base text-slate-300 leading-relaxed max-w-[60ch]">
                  Thay đổi danh sách học sinh trên máy tính, dữ liệu xuất hiện ngay trên tablet của giáo viên và màn hình kiosk ở quầy đón tiếp mà không cần tải lại trang.
                </p>
              </div>
            </div>

            {/* Two Operational Perspectives (Kiosk Reception vs Mobile VietQR) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Perspective 1: Kiosk Check-in */}
              <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
                <div className="relative w-full h-64 sm:h-72">
                  <Image
                    src="/images/kiosk-checkin.jpg"
                    alt="Quầy kiosk tự phục vụ cho hội viên quét mã check-in"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#101828] dark:text-white">
                      Đón tiếp tự động — Giảm 80% áp lực quầy lễ tân
                    </h3>
                    <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed mt-2 max-w-[54ch]">
                      Đặt tablet tại cửa ra vào. Hội viên tự quét mã cá nhân để điểm danh, phát âm thanh chào đón và cảnh báo nếu có phí chưa thanh toán.
                    </p>
                  </div>
                  <Link
                    href="/kiosk"
                    className="text-base font-bold text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1.5 pt-2"
                  >
                    <span>Mở màn hình Kiosk tự phục vụ</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Perspective 2: Mobile VietQR */}
              <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
                <div className="relative w-full h-64 sm:h-72">
                  <Image
                    src="/images/mobile-vietqr.jpg"
                    alt="Cổng phụ huynh tra cứu và thanh toán VietQR trên điện thoại"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#101828] dark:text-white">
                      Thanh toán Napas 24/7 trực tiếp không cần tải app
                    </h3>
                    <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed mt-2 max-w-[54ch]">
                      Phụ huynh mở link tra cứu trên Zalo. Mã QR sinh sẵn chính xác số tiền và cú pháp. Tiền chuyển xong là gạch nợ tức thì 0.2 giây.
                    </p>
                  </div>
                  <Link
                    href="/p/demo"
                    className="text-base font-bold text-amber-900 dark:text-amber-300 hover:underline flex items-center gap-1.5 pt-2"
                  >
                    <span>Xem thử Cổng phụ huynh</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: INDUSTRY PERSONAS — Interactive Segment Tabs */}
        <section id="doi-tuong" className="scroll-reveal py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black text-[#101828] dark:text-white tracking-tight leading-tight">
                Giải pháp chuyên biệt từng mô hình
              </h2>
              <p className="text-base sm:text-lg text-[#475467] dark:text-slate-300 leading-relaxed max-w-[60ch]">
                Tối ưu hóa cấu trúc dữ liệu theo nghiệp vụ đặc thù của lớp học, CLB thể thao và phòng trọ.
              </p>
            </div>

            {/* Persona Switcher Tabs */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActivePersona('CLASS')}
                className={`px-5 py-3 rounded text-base font-bold transition-colors cursor-pointer flex items-center gap-2 ${
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
                className={`px-5 py-3 rounded text-base font-bold transition-colors cursor-pointer flex items-center gap-2 ${
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
                className={`px-5 py-3 rounded text-base font-bold transition-colors cursor-pointer flex items-center gap-2 ${
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
            <div className="p-8 sm:p-10 rounded-xl bg-[#F5F7FB] dark:bg-slate-800 space-y-6">
              {activePersona === 'CLASS' && (
                <div className="space-y-6">
                  <div className="max-w-2xl space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#101828] dark:text-white">
                      Giáo viên & Trung tâm dạy thêm
                    </h3>
                    <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed max-w-[56ch]">
                      Quản lý danh sách lớp, tính tiền học phí linh hoạt theo gói tháng hoặc theo số buổi điểm danh thực tế. Phụ huynh an tâm nhận thông báo minh bạch.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-1">
                      <span className="text-base font-semibold text-[#475467] dark:text-slate-400 block">Hình thức học phí</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Thu theo buổi hoặc tháng</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base font-semibold text-[#475467] dark:text-slate-400 block">Nghỉ phép</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Tự động trừ tiền buổi nghỉ</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base font-semibold text-[#475467] dark:text-slate-400 block">Kênh gửi</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Link phụ huynh & Zalo</span>
                    </div>
                  </div>
                </div>
              )}

              {activePersona === 'SPORTS' && (
                <div className="space-y-6">
                  <div className="max-w-2xl space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#101828] dark:text-white">
                      CLB Pickleball, Cầu lông & Phòng Gym
                    </h3>
                    <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed max-w-[56ch]">
                      Check-in nhanh từng lượt vào sân. Kiosk quét QR tự phục vụ tại cửa ra vào, tự động kiểm tra số buổi tập còn lại của thành viên.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-1">
                      <span className="text-base font-semibold text-[#475467] dark:text-slate-400 block">Hình thức thẻ</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Gói lượt tập & Hội viên</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base font-semibold text-[#475467] dark:text-slate-400 block">Điểm danh tại sân</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Kiosk tablet 1 giây</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base font-semibold text-[#475467] dark:text-slate-400 block">Thu nợ giải đấu</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Mã VietQR động Napas 24/7</span>
                    </div>
                  </div>
                </div>
              )}

              {activePersona === 'RENTAL' && (
                <div className="space-y-6">
                  <div className="max-w-2xl space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#101828] dark:text-white">
                      Chủ Nhà trọ & Căn hộ dịch vụ mini
                    </h3>
                    <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed max-w-[56ch]">
                      Quản lý từng phòng, chốt chỉ số điện nước cuối tháng và gửi hóa đơn chi tiết. Khách thuê chuyển khoản đúng nội dung là hệ thống tự khớp nợ.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-1">
                      <span className="text-base font-semibold text-[#475467] dark:text-slate-400 block">Hóa đơn</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Tiền phòng + Điện nước</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base font-semibold text-[#475467] dark:text-slate-400 block">Đối soát phòng</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Tự động gạch nợ từng phòng</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base font-semibold text-[#475467] dark:text-slate-400 block">Thông báo</span>
                      <span className="text-base font-bold text-[#101828] dark:text-white block">Nhắc nợ Zalo định kỳ</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 4: ROI & TIME SAVED CALCULATOR */}
        <section id="roi-calculator" className="scroll-reveal py-20 bg-[#0B0F19] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Ước tính hiệu quả vận hành
              </h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-[60ch]">
                Kéo thanh trượt theo số lượng học sinh hoặc khách thuê để xem ngay số giờ lao động tiết kiệm và doanh thu thu hồi.
              </p>
            </div>

            <div className="max-w-3xl p-8 sm:p-10 rounded-xl bg-[#131A2B] space-y-8">
              {/* Slider Control Block */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-slate-300">
                    Quy mô học sinh / khách thuê:
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
                  className="w-full h-2.5 bg-slate-700 rounded appearance-none cursor-pointer accent-[#2538D9]"
                />

                <div className="flex justify-between text-base text-slate-400 font-medium">
                  <span>Quy mô 10 người</span>
                  <span>150 người</span>
                  <span>300+ người</span>
                </div>
              </div>

              {/* Real Measured Outcomes: Asymmetric Metric Layout (6 / 3 / 3 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-4">
                <div className="sm:col-span-6 p-6 rounded-xl bg-[#0B0F19] space-y-2">
                  <span className="text-3xl font-black text-emerald-400 tabular-nums block">
                    ~{hoursSavedPerMonth} giờ
                  </span>
                  <span className="text-base font-bold text-white block">Thời gian tiết kiệm</span>
                  <span className="text-base text-slate-400 block max-w-[32ch]">
                    Tương đương {Math.round(hoursSavedPerMonth / 8)} ngày công lao động
                  </span>
                </div>

                <div className="sm:col-span-3 p-6 rounded-xl bg-[#0B0F19] space-y-2">
                  <span className="text-2xl sm:text-3xl font-black text-white tabular-nums block">
                    ~{formatVND(moneyRecoveredPerMonth)}
                  </span>
                  <span className="text-base font-bold text-white block">Thu hồi</span>
                  <span className="text-base text-slate-400 block">
                    Không sót buổi
                  </span>
                </div>

                <div className="sm:col-span-3 p-6 rounded-xl bg-[#0B0F19] space-y-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums block">
                    0%
                  </span>
                  <span className="text-base font-bold text-white block">Sai lệch</span>
                  <span className="text-base text-slate-400 block">
                    Khớp cú pháp
                  </span>
                </div>
              </div>

              {/* Instant Action */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  className="px-6 py-3.5 rounded bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-base transition-colors flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current text-amber-300 shrink-0" />
                  <span>Trải nghiệm dùng thử miễn phí</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: BANK NETWORK */}
        <section className="scroll-reveal py-16 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#101828] dark:text-white tracking-tight leading-tight">
                Tương thích toàn bộ ngân hàng Napas
              </h2>
              <p className="text-base text-[#475467] dark:text-slate-300 max-w-[60ch]">
                Học viên và khách hàng quét mã từ ứng dụng ngân hàng bất kỳ. Tiền chuyển về thẳng tài khoản chính chủ của bạn.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {['MB', 'VCB', 'TCB', 'ACB', 'VPB', 'TPB', 'BIDV', 'ICB'].map((bankKey) => {
                const b = POPULAR_BANKS[bankKey];
                return (
                  <div
                    key={bankKey}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded bg-[#F5F7FB] dark:bg-slate-800"
                  >
                    <BankLogo bankId={bankKey} size="sm" />
                    <span className="text-base font-bold text-[#101828] dark:text-white">{b.shortName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 6: CONTINUOUS OPERATIONAL SEQUENCE (Connected Operational Pipeline) */}
        <section className="scroll-reveal py-20 bg-[#F5F7FB] dark:bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black text-[#101828] dark:text-white tracking-tight leading-tight">
                Ba bước vận hành tự động
              </h2>
              <p className="text-base sm:text-lg text-[#475467] dark:text-slate-300 leading-relaxed max-w-[60ch]">
                Không cần cài đặt phức tạp, không cần thiết bị chuyên dụng đắt tiền.
              </p>
            </div>

            {/* Continuous Operational Flow: 3 Connected Sequential Stages with Culmination Step */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              <div className="md:col-span-4 p-8 rounded-xl bg-white dark:bg-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-base font-bold text-[#2538D9] dark:text-blue-400 block">
                    Bước 1 • Khởi tạo
                  </span>
                  <h3 className="text-xl font-bold text-[#101828] dark:text-white">
                    Workspace & Nhập danh sách
                  </h3>
                  <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed max-w-[48ch]">
                    Thiết lập tên lớp học, CLB hoặc nhà trọ. Nhập danh sách thành viên bằng file Excel có sẵn hoặc thêm nhanh trên điện thoại.
                  </p>
                </div>
                <span className="text-base font-semibold text-[#475467] dark:text-slate-400 pt-2 block">
                  Hoàn tất trong 3 phút
                </span>
              </div>

              <div className="md:col-span-4 p-8 rounded-xl bg-white dark:bg-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-base font-bold text-[#2538D9] dark:text-blue-400 block">
                    Bước 2 • Tác nghiệp
                  </span>
                  <h3 className="text-xl font-bold text-[#101828] dark:text-white">
                    Điểm danh & Chốt số
                  </h3>
                  <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed max-w-[48ch]">
                    Điểm danh một chạm đầu buổi, mở kiosk tự phục vụ tại quầy, hoặc nhập số điện nước. Hệ thống tự tính toán chính xác học phí.
                  </p>
                </div>
                <span className="text-base font-semibold text-[#475467] dark:text-slate-400 pt-2 block">
                  Tự động trừ ngày nghỉ phép
                </span>
              </div>

              <div className="md:col-span-4 p-8 rounded-xl bg-[#0B0F19] text-white space-y-4 flex flex-col justify-between border-2 border-emerald-500/40">
                <div className="space-y-3">
                  <span className="text-base font-bold text-emerald-400 block">
                    Bước 3 • Ngân hàng Napas
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    VietQR Tự gạch nợ 24/7
                  </h3>
                  <p className="text-base text-slate-300 leading-relaxed max-w-[48ch]">
                    Gửi mã VietQR có sẵn số tiền và nội dung. Tiền về thẳng tài khoản bạn, hệ thống đối soát gạch nợ tự động trong 0.2 giây.
                  </p>
                </div>
                <span className="text-base font-semibold text-emerald-300 pt-2 block">
                  Không cần kiểm tra sao kê
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: AUTHORITATIVE ROLES & PERMISSIONS MATRIX */}
        <section className="scroll-reveal py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black text-[#101828] dark:text-white tracking-tight leading-tight">
                An toàn Zero-Custody & Phân quyền
              </h2>
              <p className="text-base sm:text-lg text-[#475467] dark:text-slate-300 leading-relaxed max-w-[60ch]">
                Thiết kế theo chuẩn Zero-Custody: TingRoster không bao giờ giữ tiền, không trung gian ví điện tử.
              </p>
            </div>

            {/* Authoritative Security & Role Matrix: Single Unified Table Container */}
            <div
              data-ui="true"
              className="rounded-xl bg-[#F5F7FB] dark:bg-slate-800 divide-y divide-slate-200/80 dark:divide-slate-700/80 overflow-hidden"
            >
              {[
                {
                  label: 'Tài khoản ngân hàng nhận tiền',
                  owner: 'Tài khoản chính chủ 100% (MB, VCB, TCB...)',
                  staff: 'Không có quyền truy cập',
                  member: 'Không có quyền truy cập',
                },
                {
                  label: 'Báo cáo doanh thu & Dòng tiền',
                  owner: 'Toàn quyền theo dõi đối soát và nợ đọng',
                  staff: 'Ẩn hoàn toàn doanh thu tổng',
                  member: 'Ẩn hoàn toàn doanh thu tổng',
                },
                {
                  label: 'Điểm danh & Thao tác hiện trường',
                  owner: 'Toàn quyền cấu hình sĩ số và học phí',
                  staff: 'Thao tác một chạm nhanh trên tablet/di động',
                  member: 'Quét mã QR tự phục vụ tại Kiosk',
                },
                {
                  label: 'Bảo mật danh bạ & Dữ liệu riêng tư',
                  owner: 'Quản trị danh bạ an toàn tuyệt đối',
                  staff: 'Chỉ xem danh sách học sinh thuộc lớp phụ trách',
                  member: 'Link token bảo mật, không xem thông tin người khác',
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center text-base"
                >
                  <div className="md:col-span-4 font-bold text-[#101828] dark:text-white">
                    {row.label}
                  </div>
                  <div className="md:col-span-3 text-[#2538D9] dark:text-blue-400 font-semibold">
                    <span className="text-slate-400 font-normal md:hidden block text-sm">Chủ cơ sở: </span>
                    {row.owner}
                  </div>
                  <div className="md:col-span-2 text-[#475467] dark:text-slate-300">
                    <span className="text-slate-400 font-normal md:hidden block text-sm">Giáo viên: </span>
                    {row.staff}
                  </div>
                  <div className="md:col-span-3 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <span className="text-slate-400 font-normal md:hidden block text-sm">Phụ huynh: </span>
                    {row.member}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8: PRICING — Blueprint: Plan Names, One Live Figure */}
        <section id="bang-gia" className="scroll-reveal py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl space-y-3 mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-[#101828] dark:text-white tracking-tight leading-tight">
              Biểu phí minh bạch, không phí ẩn
            </h2>
            <p className="text-base sm:text-lg text-[#475467] dark:text-slate-300 leading-relaxed max-w-[60ch]">
              Không hoa hồng trên từng giao dịch. Tiền vào thẳng 100% tài khoản ngân hàng của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Columns 1-5 Plan Names as Stacked Buttons */}
            <div className="lg:col-span-5 space-y-3">
              {[
                {
                  id: 'STARTER',
                  name: 'Gói Khởi đầu',
                  desc: 'Cho giáo viên mới hoặc nhóm dưới 25 người',
                },
                {
                  id: 'PRO',
                  name: 'Gói Chuyên nghiệp',
                  desc: 'Tự động đối soát ngân hàng Napas 24/7',
                },
                {
                  id: 'ENTERPRISE',
                  name: 'Gói Chuỗi & Cơ sở lớn',
                  desc: 'Nhiều cơ sở, phân quyền giáo viên và Zalo ZNS',
                },
              ].map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id as 'STARTER' | 'PRO' | 'ENTERPRISE')}
                    className={`w-full text-left p-6 rounded-xl transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#2538D9] text-white'
                        : 'bg-white dark:bg-slate-800 text-[#101828] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <div>
                      <span className="text-xl sm:text-2xl font-black block">
                        {plan.name}
                      </span>
                      <span
                        className={`text-base block mt-1 ${
                          isSelected ? 'text-blue-100' : 'text-[#475467] dark:text-slate-300'
                        }`}
                      >
                        {plan.desc}
                      </span>
                    </div>
                    <span
                      className={`w-3.5 h-3.5 rounded-full shrink-0 ml-4 ${
                        isSelected ? 'bg-white' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right: Columns 6-12 The One Live Figure Stage */}
            <div className="lg:col-span-7 p-8 sm:p-10 rounded-xl bg-white dark:bg-slate-800 space-y-6">
              {selectedPlan === 'STARTER' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-[#101828] dark:text-white">
                      Miễn phí
                    </span>
                    <span className="text-base text-[#475467] dark:text-slate-400">trọn đời</span>
                  </div>
                  <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed max-w-[54ch]">
                    Dành cho giáo viên mở lớp dạy thêm tại nhà hoặc các câu lạc bộ mới thành lập dưới 25 thành viên.
                  </p>
                  <div className="space-y-3 pt-2 text-base text-[#101828] dark:text-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>1 Workspace quản lý lớp học hoặc nhóm</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Tối đa 25 thành viên hoạt động</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Điểm danh một chạm & xuất file báo cáo Excel</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Tạo mã VietQR chuyển khoản cá nhân</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Link
                      href="/onboarding"
                      className="inline-flex px-8 py-4 rounded bg-[#101828] dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-base transition-colors"
                    >
                      Bắt đầu miễn phí ngay
                    </Link>
                  </div>
                </div>
              )}

              {selectedPlan === 'PRO' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-[#2538D9] dark:text-blue-400">
                      199.000 đ
                    </span>
                    <span className="text-base text-[#475467] dark:text-slate-400">/tháng</span>
                  </div>
                  <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed max-w-[54ch]">
                    Tự động hóa hoàn toàn luồng tiền ngân hàng: kết nối SePay & Casso bắt giao dịch 24/7 và gạch nợ sau 0.2 giây.
                  </p>
                  <div className="space-y-3 pt-2 text-base text-[#101828] dark:text-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#2538D9] dark:bg-blue-400 shrink-0" />
                      <span>Không giới hạn số lớp học, cụm sân hoặc phòng trọ</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#2538D9] dark:bg-blue-400 shrink-0" />
                      <span>Tối đa 500 thành viên hoạt động</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#2538D9] dark:bg-blue-400 shrink-0" />
                      <span>Tự động đối soát Webhook ngân hàng SePay & Casso 24/7</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#2538D9] dark:bg-blue-400 shrink-0" />
                      <span>Kiosk quét QR check-in tự phục vụ tại quầy đón tiếp</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#2538D9] dark:bg-blue-400 shrink-0" />
                      <span>Báo cáo doanh thu thời gian thực và quản lý nợ đọng</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleInstantDemoLogin}
                      className="px-8 py-4 rounded bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-base transition-colors cursor-pointer"
                    >
                      Dùng thử Pro 14 ngày miễn phí
                    </button>
                  </div>
                </div>
              )}

              {selectedPlan === 'ENTERPRISE' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-[#101828] dark:text-white">
                      499.000 đ
                    </span>
                    <span className="text-base text-[#475467] dark:text-slate-400">/tháng</span>
                  </div>
                  <p className="text-base text-[#475467] dark:text-slate-300 leading-relaxed max-w-[54ch]">
                    Dành cho các trung tâm đào tạo nhiều chi nhánh, tổ hợp thể thao lớn hoặc chuỗi nhà trọ dịch vụ cao cấp.
                  </p>
                  <div className="space-y-3 pt-2 text-base text-[#101828] dark:text-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Không giới hạn số lượng học sinh và hội viên</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Phân quyền chi tiết cho nhiều giáo viên, HLV và trợ giảng</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Tự động gửi thông báo hóa đơn và nhắc nợ qua Zalo ZNS</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Hỗ trợ kỹ thuật ưu tiên qua kênh Zalo và điện thoại 24/7</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Link
                      href="/onboarding"
                      className="inline-flex px-8 py-4 rounded bg-[#101828] dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-base transition-colors"
                    >
                      Đăng ký gói Chuỗi & Doanh nghiệp
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 9: FAQ ACCORDION */}
        <section id="huong-dan" className="scroll-reveal py-20 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-[#101828] dark:text-white tracking-tight leading-tight">
                Câu hỏi thường gặp
              </h2>
              <p className="text-base text-[#475467] dark:text-slate-300 max-w-[60ch]">
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
                    <div className="px-5 pb-5 text-base text-[#475467] dark:text-slate-300 leading-relaxed max-w-[60ch]">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 10: CLOSING ACTION CTA */}
        <section className="scroll-reveal py-20 bg-[#F5F7FB] dark:bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#101828] dark:text-white tracking-tight leading-tight">
              Tự động hóa cơ sở của bạn ngay hôm nay
            </h2>
            <p className="text-base sm:text-lg text-[#475467] dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Gia nhập cùng 1.250+ giáo viên, câu lạc bộ thể thao và chủ nhà trọ tại Việt Nam.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="px-8 py-4 rounded bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-base inline-flex items-center gap-2 transition-colors cursor-pointer"
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

            <div className="flex flex-wrap items-center gap-6 text-base text-slate-400">
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

          <div className="max-w-7xl mx-auto mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-base text-slate-400 gap-2">
            <span>© {new Date().getFullYear()} TingRoster — Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo.</span>
            <span>VietQR Napas 24/7 • Casso & SePay Webhooks</span>
          </div>
        </footer>
      </div>
    </LandingMotionProvider>
  );
}
