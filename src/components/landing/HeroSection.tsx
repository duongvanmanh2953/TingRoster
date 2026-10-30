'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Users,
  Building2,
  GraduationCap,
  Trophy,
  Volume2,
} from 'lucide-react';
import { BankLogo, POPULAR_BANKS } from '@/components/common/BankLogo';
import { formatVND } from '@/lib/utils';
import { TiltedCard } from '@/components/reactbits/TiltedCard';
import { AmbientGlow } from '@/components/reactbits/AmbientGlow';
import { MagneticButton } from '@/components/reactbits/MagneticButton';

export interface DemoStudent {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  fee: number;
  subtitle?: string;
}

interface HeroSectionProps {
  onInstantDemo: () => Promise<void>;
  isDemoLoggingIn: boolean;
}

export function HeroSection({ onInstantDemo, isDemoLoggingIn }: HeroSectionProps) {
  const [heroScenario, setHeroScenario] = useState<'CLASS' | 'SPORTS' | 'RENTAL'>('CLASS');
  const [simulatedInvoiceStatus, setSimulatedInvoiceStatus] = useState<'PENDING' | 'PAID'>('PENDING');
  const [isSimulatingBank, setIsSimulatingBank] = useState<boolean>(false);
  const [simulatedWebhookLog, setSimulatedWebhookLog] = useState<{
    bank: string;
    amount: number;
    code: string;
    time: string;
  } | null>(null);

  const [classStudents, setClassStudents] = useState<DemoStudent[]>([
    { id: '1', name: 'Nguyễn Minh Anh', gender: 'female', age: 15, status: 'PRESENT', fee: 600000, subtitle: 'Toán 10 Nâng cao' },
    { id: '2', name: 'Trần Hoàng Nam', gender: 'male', age: 16, status: 'PRESENT', fee: 600000, subtitle: 'Toán 10 Nâng cao' },
    { id: '3', name: 'Lê Bảo Châu', gender: 'female', age: 15, status: 'LATE', fee: 600000, subtitle: 'Toán 10 Nâng cao' },
    { id: '4', name: 'Phạm Đức Huy', gender: 'male', age: 15, status: 'ABSENT', fee: 600000, subtitle: 'Toán 10 Nâng cao' },
  ]);

  const [sportsMembers, setSportsMembers] = useState<DemoStudent[]>([
    { id: 's1', name: 'Vũ Quốc Tuấn', gender: 'male', age: 28, status: 'PRESENT', fee: 800000, subtitle: 'Pickleball CLB Thủ Đức' },
    { id: 's2', name: 'Đặng Thảo Vy', gender: 'female', age: 24, status: 'PRESENT', fee: 800000, subtitle: 'Pickleball CLB Thủ Đức' },
    { id: 's3', name: 'Lê Minh Khang', gender: 'male', age: 31, status: 'LATE', fee: 800000, subtitle: 'Pickleball CLB Thủ Đức' },
  ]);

  const [rentalTenants, setRentalTenants] = useState<DemoStudent[]>([
    { id: 'r1', name: 'Hoàng Văn Thái', gender: 'male', age: 26, status: 'PRESENT', fee: 3850000, subtitle: 'Phòng 204 - Ký túc xá Bình Thạnh' },
    { id: 'r2', name: 'Ngô Thanh Hà', gender: 'female', age: 23, status: 'LATE', fee: 4200000, subtitle: 'Phòng 301 - Căn hộ mini Cầu Giấy' },
  ]);

  const activeRoster =
    heroScenario === 'CLASS' ? classStudents : heroScenario === 'SPORTS' ? sportsMembers : rentalTenants;

  const cycleStatus = (id: string) => {
    const sequence: DemoStudent['status'][] = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'];
    if (heroScenario === 'CLASS') {
      setClassStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: sequence[(sequence.indexOf(s.status) + 1) % 4] } : s))
      );
    } else if (heroScenario === 'SPORTS') {
      setSportsMembers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: sequence[(sequence.indexOf(s.status) + 1) % 4] } : s))
      );
    } else {
      setRentalTenants((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: sequence[(sequence.indexOf(s.status) + 1) % 4] } : s))
      );
    }
  };

  const playTingSound = () => {
    if (typeof window !== 'undefined') {
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
        // Audio fallback
      }
    }
  };

  const handleSimulatePayment = () => {
    setIsSimulatingBank(true);
    playTingSound();

    const sampleAmount =
      heroScenario === 'CLASS' ? 600000 : heroScenario === 'SPORTS' ? 800000 : 3850000;
    const sampleCode =
      heroScenario === 'CLASS' ? 'TR84920' : heroScenario === 'SPORTS' ? 'TR72911' : 'P101-T11';

    setTimeout(() => {
      setSimulatedInvoiceStatus('PAID');
      setSimulatedWebhookLog({
        bank: 'MB Bank (Napas 24/7)',
        amount: sampleAmount,
        code: sampleCode,
        time: new Date().toLocaleTimeString('vi-VN'),
      });
      setIsSimulatingBank(false);
    }, 450);
  };

  const handleResetSimulatedPayment = () => {
    setSimulatedInvoiceStatus('PENDING');
    setSimulatedWebhookLog(null);
  };

  const presentCount = activeRoster.filter((s) => s.status === 'PRESENT').length;
  const lateCount = activeRoster.filter((s) => s.status === 'LATE').length;
  const absentCount = activeRoster.filter((s) => s.status === 'ABSENT').length;
  const totalRosterFee = activeRoster.reduce((sum, s) => sum + s.fee, 0);

  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden w-full">
      {/* React Bits Ambient Glow */}
      <AmbientGlow className="top-10 left-1/2 -translate-x-1/2" size={680} color="rgba(37, 56, 217, 0.2)" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] dark:text-blue-300 text-xs sm:text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#2538D9]" />
              <span>Chuẩn kết nối Napas 24/7 — Zero-Custody</span>
            </div>

            <h1 className="hero-headline text-3xl sm:text-5xl lg:text-6xl font-black text-[#101828] dark:text-white tracking-normal leading-[1.12]">
              Nền tảng vận hành học phí & điểm danh một chạm
            </h1>

            <p className="hero-subtext text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-[56ch]">
              Tự động hóa toàn diện quy trình điểm danh, đối soát Napas 24/7 theo mô hình Zero-Custody. Tiền vào thẳng tài khoản ngân hàng của bạn, gạch nợ tức thì sau 0.18 giây.
            </p>

            {/* CTAs */}
            <div className="hero-cta-buttons pt-2 flex flex-wrap items-center gap-3.5">
              <Link href="/onboarding">
                <MagneticButton className="px-6 py-3.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-sm sm:text-base transition-colors flex items-center gap-2">
                  <span>Dùng thử miễn phí 30 ngày</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </MagneticButton>
              </Link>

              <button
                type="button"
                onClick={onInstantDemo}
                disabled={isDemoLoggingIn}
                className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#101828] dark:text-white font-bold text-sm sm:text-base transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isDemoLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#2538D9]" />
                    <span>Đang khởi tạo...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-amber-500" />
                    <span>Trải nghiệm Demo tức thì</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust metrics pill */}
            <div className="pt-4 flex items-center gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Không thu phí ẩn</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% tài khoản chính chủ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Console (TiltedCard) */}
          <div className="lg:col-span-6 hero-operational-console">
            <TiltedCard maxTilt={8} perspective={1200}>
              <div className="rounded-2xl bg-white dark:bg-[#111C33] p-5 sm:p-7 space-y-5" data-ui>
                {/* Console Header & Scenario switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHeroScenario('CLASS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        heroScenario === 'CLASS'
                          ? 'bg-[#2538D9] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Lớp học</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroScenario('SPORTS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        heroScenario === 'SPORTS'
                          ? 'bg-[#2538D9] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>CLB Thể thao</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroScenario('RENTAL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        heroScenario === 'RENTAL'
                          ? 'bg-[#2538D9] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Căn hộ / Trọ</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={playTingSound}
                    aria-label="Phát âm thanh Ting"
                    className="p-1.5 rounded-md text-slate-400 hover:text-[#2538D9] dark:hover:text-white transition-colors cursor-pointer"
                    title="Âm thanh ting khi có tiền về"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Summary chips */}
                <div className="grid grid-cols-4 gap-2 text-center py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Sĩ số</span>
                    <span className="text-sm font-bold text-[#101828] dark:text-white">{activeRoster.length}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Có mặt</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Đi trễ</span>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{lateCount}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Dự thu</span>
                    <span className="text-sm font-bold text-[#2538D9] dark:text-blue-400">{formatVND(totalRosterFee)}</span>
                  </div>
                </div>

                {/* Interactive Member Roster */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeRoster.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => cycleStatus(item.id)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#2538D9]/10 text-[#2538D9] dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-[#101828] dark:text-white block">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {formatVND(item.fee)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : item.status === 'LATE'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                              : item.status === 'ABSENT'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                          }`}
                        >
                          {item.status === 'PRESENT'
                            ? 'Có mặt'
                            : item.status === 'LATE'
                            ? 'Đi trễ'
                            : item.status === 'ABSENT'
                            ? 'Vắng'
                            : 'Nghỉ phép'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Webhook Bar */}
                <div className="pt-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        simulatedInvoiceStatus === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span className="text-slate-600 dark:text-slate-300">
                      {simulatedInvoiceStatus === 'PAID'
                        ? 'Đã khớp sao kê Napas 24/7'
                        : 'Chờ giao dịch chuyển khoản...'}
                    </span>
                  </div>

                  {simulatedInvoiceStatus === 'PENDING' ? (
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isSimulatingBank}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {isSimulatingBank ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang khớp...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Bấm giả lập thanh toán</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetSimulatedPayment}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-300 transition-colors cursor-pointer"
                    >
                      Đặt lại
                    </button>
                  )}
                </div>

                {/* Simulated Webhook Log Chip */}
                {simulatedWebhookLog && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
                    <div>
                      <span className="font-bold block">Ting! Nhận {formatVND(simulatedWebhookLog.amount)}</span>
                      <span className="text-emerald-700 dark:text-emerald-300">
                        {simulatedWebhookLog.bank} • Cú pháp: {simulatedWebhookLog.code}
                      </span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{simulatedWebhookLog.time}</span>
                  </div>
                )}
              </div>
            </TiltedCard>
          </div>
        </div>

        {/* Bank Integration Marquee */}
        <div className="pt-16 sm:pt-24 space-y-4">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block text-center">
            Tương thích 100% ứng dụng ngân hàng Napas 24/7 & Ví điện tử tại Việt Nam
          </span>
          <div className="overflow-hidden py-3">
            <div className="animate-marquee gap-4 flex items-center">
              {[...Object.keys(POPULAR_BANKS), ...Object.keys(POPULAR_BANKS)].map((bankKey, idx) => {
                const b = POPULAR_BANKS[bankKey];
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 shrink-0"
                  >
                    <BankLogo bankId={bankKey} size="sm" />
                    <span className="text-sm font-bold text-[#101828] dark:text-white">{b.shortName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
