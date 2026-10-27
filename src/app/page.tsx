'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Copy,
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
  Laptop
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Avatar, AvatarGroup } from '@/components/common/Avatar';
import { BankLogo } from '@/components/common/BankLogo';

export default function HomePage() {
  const [attendedStudents, setAttendedStudents] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': false,
  });
  const [simulatedTing, setSimulatedTing] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleStudent = (id: string) => {
    setAttendedStudents(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const playDemoTingSound = () => {
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
    setSimulatedTing(true);
    setTimeout(() => setSimulatedTing(false), 4500);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#101828] flex flex-col font-sans selection:bg-[#2538D9] selection:text-white">
      
      {/* Top Banner / Announcement */}
      <div className="bg-[#0B0F19] text-white text-xs py-2 px-4 text-center border-b border-[#1B2333] flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-200">
          Tự động đối soát VietQR Napas 24/7 trực tiếp qua SePay & Casso • Không phụ thuộc bên thứ ba
        </span>
        <Link href="/login" className="underline font-bold text-indigo-300 hover:text-white ml-1 inline-flex items-center gap-1">
          Dùng thử ngay <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Global Navigation Header per Reference Panel 1 */}
      <header className="border-b border-[#E4E7EC] bg-white/95 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          
          {/* TingRoster Official Brand Logo */}
          <Logo href="/" size="md" showTagline={false} />

          {/* Navigation Links per Spec Panel 1 */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#475467]">
            <a href="#tinh-nang" className="hover:text-[#2538D9] transition-colors">Tính năng</a>
            <a href="#doi-tuong" className="hover:text-[#2538D9] transition-colors">Đối tượng sử dụng</a>
            <a href="#bang-gia" className="hover:text-[#2538D9] transition-colors">Bảng giá</a>
            <a href="#huong-dan" className="hover:text-[#2538D9] transition-colors">Hướng dẫn</a>
            <Link href="/kiosk" className="hover:text-[#2538D9] transition-colors flex items-center gap-1 text-[#2538D9]">
              <Tv className="w-3.5 h-3.5" />
              <span>Kiosk tại sân</span>
            </Link>
          </nav>

          {/* Action CTAs: Đăng nhập & Bắt đầu miễn phí */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#475467] hover:text-[#101828] px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/onboarding"
              className="px-4 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold shadow-md shadow-[#2538D9]/25 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <span>Bắt đầu miễn phí</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section per Panel 1 (Exact Typography, Layout, Laptop + Mobile Mockup & Callout Annotations) */}
      <section className="pt-12 pb-16 lg:pt-16 lg:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2538D9]/10 border border-[#2538D9]/20 text-xs font-bold text-[#2538D9]">
              <span className="w-2 h-2 rounded-full bg-[#2538D9] animate-pulse" />
              <span>Nền tảng Quản trị & Đối soát tự động #1</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#101828] tracking-tight leading-[1.15]">
              Điểm danh một chạm. <br />
              <span className="text-[#2538D9]">Thu phí tự động.</span> <br />
              Đối soát khỏi lo.
            </h1>

            <p className="text-sm sm:text-base text-[#475467] leading-relaxed">
              Quản lý lớp học, câu lạc bộ và khoản thu trên một nền tảng. Thao tác dễ dàng mọi lúc, an ninh với giáo viên và các đối tác.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#2538D9]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Dùng thử miễn phí</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <a
                href="#cach-hoat-dong"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-[#E4E7EC] text-[#101828] font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#2538D9]" />
                <span>Xem cách hoạt động</span>
              </a>
            </div>

            {/* Micro social proof with Member Avatars */}
            <div className="pt-4 flex items-center gap-3">
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
              <p className="text-xs text-[#475467]">
                <strong className="text-[#101828]">1.200+</strong> giáo viên, CLB & căn hộ tin dùng
              </p>
            </div>
          </div>

          {/* Right Column: Hero Visual — Laptop Preview + Phone Mockup + Callout Tags */}
          <div className="lg:col-span-7 relative">
            
            {/* Callout Tag 1: Quản lý dễ dàng (Pointing to Dashboard) */}
            <div className="hidden sm:flex absolute -top-4 left-6 z-20 items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-[#2538D9]/30 shadow-lg text-xs font-bold text-[#2538D9] backdrop-blur-md animate-bounce">
              <span className="w-2 h-2 rounded-full bg-[#2538D9]" />
              <span>Quản lý dễ dàng</span>
              <svg className="w-4 h-4 text-[#2538D9] transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>

            {/* Callout Tag 2: Thu phí tự động (Pointing to Phone VietQR) */}
            <div className="hidden sm:flex absolute -bottom-3 right-4 z-20 items-center gap-2 px-3 py-1.5 rounded-full bg-[#2538D9] text-white shadow-xl text-xs font-bold shadow-[#2538D9]/30 animate-pulse">
              <Zap className="w-3.5 h-3.5" />
              <span>Thu phí tự động 100%</span>
            </div>

            {/* Callout Tag 3: Đối soát khỏi lo */}
            <div className="hidden sm:flex absolute top-1/2 -left-4 z-20 items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 shadow-md text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Đối soát khỏi lo</span>
            </div>

            {/* Laptop Device Frame */}
            <div className="relative mx-auto bg-slate-900 p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-slate-800 max-w-xl">
              {/* Laptop Camera dot */}
              <div className="w-2 h-2 bg-slate-700 rounded-full mx-auto mb-2" />
              
              {/* Screen Inner Preview */}
              <div className="bg-[#F5F7FB] rounded-xl overflow-hidden border border-slate-700 shadow-inner">
                {/* Simulated Mini Dashboard Header */}
                <div className="bg-white px-3 py-2 border-b border-[#E4E7EC] flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-[#101828] ml-2">TingRoster Dashboard</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Avatar name="Nguyễn Văn Minh" size="xs" />
                    <span className="font-medium text-[#475467]">Nguyễn Văn Minh</span>
                  </div>
                </div>

                {/* Simulated Metrics Strip */}
                <div className="p-3 grid grid-cols-3 gap-2 text-left">
                  <div className="bg-white p-2.5 rounded-lg border border-[#E4E7EC]">
                    <span className="text-[9px] text-[#475467] block">Tổng phải thu</span>
                    <span className="text-xs font-bold text-[#101828] tabular-nums">48.500.000đ</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#E4E7EC]">
                    <span className="text-[9px] text-emerald-600 block">Đã thu</span>
                    <span className="text-xs font-bold text-emerald-700 tabular-nums">32.750.000đ</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#E4E7EC]">
                    <span className="text-[9px] text-amber-600 block">Còn thiếu</span>
                    <span className="text-xs font-bold text-amber-700 tabular-nums">15.750.000đ</span>
                  </div>
                </div>

                {/* Mini Class Roster List */}
                <div className="px-3 pb-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#475467] px-1">
                    <span>Lớp học gần đây</span>
                    <span className="text-[#2538D9]">Tất cả (4)</span>
                  </div>
                  {[
                    { name: 'Lớp Toán 6A', members: '48 học sinh', progress: '78%', status: 'Hoạt động' },
                    { name: 'CLB Pickleball', members: '36 hội viên', progress: '92%', status: 'Đang đấu' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-lg border border-[#E4E7EC] flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold text-[10px]">
                          {idx === 0 ? 'T' : 'P'}
                        </div>
                        <div>
                          <span className="font-bold text-[#101828] block leading-none">{item.name}</span>
                          <span className="text-[9px] text-[#475467]">{item.members}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="tabular-nums font-bold text-[10px] text-[#2538D9]">{item.progress}</span>
                        <span className="text-[9px] text-emerald-600 block">Đã đối soát</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Laptop bottom base hinge */}
              <div className="w-20 h-1.5 bg-slate-700 rounded-full mx-auto mt-2" />
            </div>

            {/* Overlapping Smartphone Mockup showing VietQR Bill */}
            <div className="absolute -bottom-8 -right-2 sm:-right-6 w-44 sm:w-52 bg-slate-900 p-2 rounded-[2rem] shadow-2xl border-2 border-slate-700 z-10 hidden xs:block">
              <div className="bg-white rounded-[1.7rem] p-3 text-center space-y-2 border border-slate-200">
                <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />
                <div className="flex items-center justify-between text-[9px] text-[#475467] px-1">
                  <span className="font-bold text-[#101828]">VietQR Bill</span>
                  <span className="text-emerald-600 font-bold">24/7 Napas</span>
                </div>
                
                {/* Mini QR code representation */}
                <div className="w-24 h-24 mx-auto bg-slate-50 border-2 border-[#2538D9] rounded-xl p-1.5 flex items-center justify-center relative shadow-sm">
                  <QrCode className="w-full h-full text-slate-800" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full bg-white shadow-xs flex items-center justify-center text-[8px] font-black text-[#2538D9]">
                      Ting
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#475467] block">Số tiền thanh toán</span>
                  <span className="text-sm font-bold text-[#2538D9] tabular-nums">500.000 đ</span>
                </div>

                <div className="bg-slate-50 p-1.5 rounded-lg text-[9px] text-left border border-slate-200 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-[#475467]">Người nhận:</span>
                    <span className="font-bold text-[#101828]">NGUYEN VAN MINH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#475467]">Nội dung:</span>
                    <span className="font-mono font-bold text-[#2538D9]">TR84920</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4 Core Benefits Row (Matching Screen 1 of Reference Image) */}
      <section id="tinh-nang" className="py-12 bg-white border-y border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Benefit 1: Điểm danh nhanh */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E4E7EC] hover:border-[#2538D9]/40 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#2538D9] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#101828] mb-1.5">Điểm danh nhanh</h3>
              <p className="text-xs text-[#475467] leading-relaxed">
                Chỉ 1 chạm, tiết kiệm thời gian. Tự động tính buổi học và đồng bộ công nợ tức thì.
              </p>
            </div>

            {/* Benefit 2: QR VietQR */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E4E7EC] hover:border-[#2538D9]/40 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-[#6D5CE8] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#101828] mb-1.5">QR VietQR</h3>
              <p className="text-xs text-[#475467] leading-relaxed">
                Tạo mã quét mọi ngân hàng và ví điện tử. Tự điền đúng số tiền và nội dung chuyển khoản.
              </p>
            </div>

            {/* Benefit 3: Đối soát tự động */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E4E7EC] hover:border-[#2538D9]/40 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#101828] mb-1.5">Đối soát tự động</h3>
              <p className="text-xs text-[#475467] leading-relaxed">
                Chính xác, an toàn, không bao giờ nhầm lẫn. Webhook ngân hàng khớp tiền trong 0.2 giây.
              </p>
            </div>

            {/* Benefit 4: Nhắc phí thông minh */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E4E7EC] hover:border-[#2538D9]/40 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#101828] mb-1.5">Nhắc phí thông minh</h3>
              <p className="text-xs text-[#475467] leading-relaxed">
                Nhắc phí tự động kèm link thanh toán trực tiếp qua Zalo / SMS, giảm 90% tỷ lệ nợ đọng.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Target Audience Section: "Dành cho bạn" per Panel 1 */}
      <section id="doi-tuong" className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-[#2538D9] tracking-wider uppercase">Dành cho bạn</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
            Thiết kế chuyên sâu cho từng mô hình
          </h2>
          <p className="text-xs sm:text-sm text-[#475467]">
            Tối ưu riêng biệt cho giáo viên, quản lý câu lạc bộ thể thao và chủ khu phòng trọ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Giáo viên dạy thêm */}
          <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#2538D9] flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101828]">Giáo viên dạy thêm</h3>
              <p className="text-xs text-[#475467] leading-relaxed">
                Quản lý sĩ số lớp học, điểm danh theo buổi và thu học phí tự động. Phụ huynh quét QR là gạch nợ ngay.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#475467]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Điểm danh 1-chạm không mất thời gian</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Cổng nộp học phí VietQR riêng cho từng học sinh</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Xuất báo cáo phụ huynh minh bạch</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/onboarding"
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-[#2538D9] text-[#101828] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#E4E7EC]"
              >
                <span>Tạo lớp học thử</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Chủ CLB thể thao */}
          <div className="bg-white rounded-2xl border border-[#2538D9]/40 p-6 lg:p-8 shadow-md hover:shadow-xl transition-all relative flex flex-col justify-between">
            <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-[#2538D9] text-white text-[10px] font-bold">
              Phổ biến nhất
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 text-[#6D5CE8] flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101828]">Chủ CLB thể thao</h3>
              <p className="text-xs text-[#475467] leading-relaxed">
                Cầu lông, Pickleball, Bóng đá, Gym. Quản lý hội viên, lịch sân, gói tập và kiosk check-in quét QR tại sân.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#475467]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Màn hình Kiosk quét QR tại sân tự động</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Thu hội phí tháng / quý / gói lượt chuẩn xác</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Cảnh báo hội viên hết hạn thẻ ngay khi check-in</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/onboarding"
                className="w-full py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-[#2538D9]/20"
              >
                <span>Tạo câu lạc bộ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Chủ nhà trọ nhỏ */}
          <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101828]">Chủ nhà trọ nhỏ</h3>
              <p className="text-xs text-[#475467] leading-relaxed">
                Theo dõi phòng, số điện, số nước, dịch vụ. Tự gửi hóa đơn tiền phòng kèm mã VietQR tới từng khách thuê.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#475467]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Ghi chỉ số điện nước & tính hóa đơn tự động</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Gạch nợ tiền thuê phòng ngay khi khách chuyển khoản</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Không sợ khách chuyển nhầm hay sửa nội dung</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/onboarding"
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-[#2538D9] text-[#101828] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#E4E7EC]"
              >
                <span>Quản lý phòng trọ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Workflow Section: "Xem cách hoạt động" */}
      <section id="cach-hoat-dong" className="py-16 bg-[#0B0F19] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Quy trình 5 bước khép kín</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Từ điểm danh đến tiền về tài khoản
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Mọi công đoạn thủ công trước đây được TingRoster tự động hóa 100%.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Tạo Workspace', desc: 'Chọn mô hình lớp học, CLB thể thao hoặc nhà trọ.' },
              { step: '02', title: 'Điểm danh 1-chạm', desc: 'Ghi nhận chuyên cần hoặc check-in qua Kiosk tại sân.' },
              { step: '03', title: 'Tạo khoản thu', desc: 'Hệ thống tự sinh hóa đơn và mã chuyển khoản riêng.' },
              { step: '04', title: 'Quét VietQR', desc: 'Học viên quét mã Napas 24/7 từ bất kỳ app ngân hàng nào.' },
              { step: '05', title: 'Đối soát Ting!', desc: 'Webhook nhận diện và tự gạch nợ trong 0.2 giây.' },
            ].map((st, i) => (
              <div key={i} className="bg-[#131A2B] border border-[#1E283D] p-5 rounded-2xl relative">
                <span className="text-2xl font-bold text-[#6D5CE8] tabular-nums block mb-2">{st.step}</span>
                <h4 className="text-sm font-bold text-white mb-1">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          {/* Sound & Webhook Simulator Bar */}
          <div className="bg-[#131A2B] border border-[#2538D9]/40 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2538D9] flex items-center justify-center text-white flex-shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Trải nghiệm âm thanh thông báo &quot;Ting!&quot; nhận tiền</p>
                <p className="text-[11px] text-slate-400">Âm thanh chuông báo chuẩn ngân hàng khi giao dịch đối soát thành công</p>
              </div>
            </div>
            <button
              onClick={playDemoTingSound}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2538D9]/30"
            >
              <Zap className="w-4 h-4" />
              <span>Bấm thử âm thanh</span>
            </button>
          </div>

          {simulatedTing && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between animate-pulse">
              <span>⚡ <strong>TING!</strong> MB Bank vừa ghi nhận +500.000đ từ học sinh Nguyễn Văn A (Mã TR84920). Hóa đơn đã gạch nợ thành công!</span>
              <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded">Khớp 100%</span>
            </div>
          )}

        </div>
      </section>

      {/* Pricing / Bảng giá */}
      <section id="bang-gia" className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-[#2538D9] tracking-wider uppercase">Bảng giá minh bạch</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
            Gói dịch vụ phù hợp mọi quy mô
          </h2>
          <p className="text-xs sm:text-sm text-[#475467]">
            Không phí ẩn, không hoa hồng trên mỗi giao dịch. Tiền vào thẳng tài khoản ngân hàng của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Free Starter */}
          <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 lg:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#475467] uppercase">Khởi đầu</span>
              <h3 className="text-2xl font-black text-[#101828]">Miễn phí</h3>
              <p className="text-xs text-[#475467]">Cho giáo viên mới hoặc nhóm hoạt động dưới 20 thành viên.</p>
              <div className="border-t border-[#E4E7EC] pt-4 space-y-2 text-xs text-[#475467]">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>1 Workspace / Lớp học</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Tối đa 25 thành viên</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Điểm danh & xuất file Excel</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Tạo mã VietQR chuyển khoản</span></div>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/onboarding" className="w-full py-2.5 rounded-xl border border-[#E4E7EC] hover:bg-slate-50 text-xs font-bold text-[#101828] flex items-center justify-center">
                Bắt đầu ngay
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl border-2 border-[#2538D9] p-6 lg:p-8 relative shadow-xl flex flex-col justify-between">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#2538D9] text-white text-[10px] font-bold">
              Khuyên dùng
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#2538D9] uppercase">Chuyên nghiệp</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#101828]">199.000 đ</span>
                <span className="text-xs text-[#475467]">/tháng</span>
              </div>
              <p className="text-xs text-[#475467]">Đầy đủ tự động hóa đối soát ngân hàng 24/7 và thông báo.</p>
              <div className="border-t border-[#E4E7EC] pt-4 space-y-2 text-xs text-[#475467]">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2538D9]" /><span>Không giới hạn lớp học / CLB</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2538D9]" /><span>Tối đa 500 thành viên</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2538D9]" /><span>Tự động đối soát Casso & SePay</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2538D9]" /><span>Kiosk quét QR check-in tại sân</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2538D9]" /><span>Báo cáo doanh thu & tỷ lệ nợ</span></div>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/onboarding" className="w-full py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center justify-center shadow-md shadow-[#2538D9]/25">
                Dùng thử 14 ngày
              </Link>
            </div>
          </div>

          {/* Enterprise */}
          <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 lg:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#475467] uppercase">Trung tâm & Chuỗi</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#101828]">499.000 đ</span>
                <span className="text-xs text-[#475467]">/tháng</span>
              </div>
              <p className="text-xs text-[#475467]">Cho trung tâm nhiều cơ sở, chuỗi sân thể thao hoặc tòa nhà.</p>
              <div className="border-t border-[#E4E7EC] pt-4 space-y-2 text-xs text-[#475467]">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Không giới hạn số lượng học viên</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Phân quyền nhiều giáo viên & trợ giảng</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Tự động gửi tin nhắn Zalo ZNS</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /><span>Hỗ trợ kỹ thuật ưu tiên 24/7</span></div>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/onboarding" className="w-full py-2.5 rounded-xl border border-[#E4E7EC] hover:bg-slate-50 text-xs font-bold text-[#101828] flex items-center justify-center">
                Liên hệ tư vấn
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ & Guides per Panel 1 */}
      <section id="huong-dan" className="py-16 bg-white border-t border-[#E4E7EC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828]">Câu hỏi thường gặp</h2>
            <p className="text-xs sm:text-sm text-[#475467]">Những giải đáp nhanh giúp bạn an tâm vận hành</p>
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
                className="border border-[#E4E7EC] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-[#101828] flex items-center justify-between hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-[#475467] transition-transform ${activeFaq === idx ? 'rotate-90 text-[#2538D9]' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-[#475467] leading-relaxed border-t border-slate-100 pt-2 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Banner per Reference Image Panel 1 */}
      <section className="bg-[#0B0F19] text-white py-12 px-4 border-t border-[#1B2333]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo variant="full" theme="dark" size="md" showTagline={false} />
            <span className="hidden sm:inline text-xs text-slate-400 border-l border-slate-700 pl-3">
              Quản lý lớp học, CLB, nhà trọ...
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <a href="#tinh-nang" className="hover:text-white">Tính năng</a>
            <a href="#doi-tuong" className="hover:text-white">Đối tượng</a>
            <a href="#bang-gia" className="hover:text-white">Bảng giá</a>
            <Link href="/login" className="hover:text-white">Đăng nhập</Link>
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-xl bg-[#2538D9] text-white font-bold hover:bg-[#1E2DB8] transition-colors"
            >
              Bắt đầu miễn phí
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#1B2333] text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} TingRoster — Nền tảng điểm danh & đối soát tự động hàng đầu Việt Nam.
        </div>
      </section>

    </div>
  );
}
