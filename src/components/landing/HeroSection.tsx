'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  CheckCircle2, 
  QrCode, 
  ChevronRight
} from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32 lg:pb-36 bg-[#F5F7FB] dark:bg-[#0B0F19] transition-colors">
      {/* Subtle radial ambient glow behind content */}
      <div 
        className="hero-ambient-glow pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] opacity-40 dark:opacity-20 blur-3xl -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(37, 56, 217, 0.25) 0%, rgba(109, 92, 232, 0.15) 45%, transparent 70%)'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-[#2538D9] dark:text-[#4F62FF] text-xs font-medium">
              <span className="flex h-2 w-2 rounded-full bg-[#2538D9] animate-pulse" />
              <span>Nền tảng SaaS Zero-Custody Hàng Đầu Việt Nam</span>
            </div>

            <h1 className="hero-title text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#101828] dark:text-white leading-[1.18]">
              Điểm danh một chạm.<br />
              Thu phí tự động.<br />
              <span className="text-[#2538D9] dark:text-[#4F62FF]">Đối soát khỏi lo.</span>
            </h1>

            <p className="hero-desc text-base sm:text-lg text-[#475467] dark:text-slate-300 leading-relaxed max-w-xl font-normal">
              Giải pháp quản trị toàn diện dành cho giáo viên dạy thêm, câu lạc bộ thể thao (Pickleball, Cầu lông, Gym) và căn hộ cho thuê. Tiền về thẳng tài khoản ngân hàng của bạn qua VietQR Napas 24/7.
            </p>

            {/* CTAs */}
            <div className="hero-cta pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] dark:bg-[#4F62FF] dark:hover:bg-[#3E51E8] text-white text-sm font-medium shadow-md shadow-blue-600/10 transition-all cursor-pointer"
              >
                <span>Tạo tài khoản miễn phí</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#giai-phap"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-[#E4E7EC] dark:border-slate-700 text-[#344054] dark:text-slate-200 text-sm font-medium transition-all"
              >
                <span>Xem cách hoạt động</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#EAECF0] dark:border-slate-800">
              <div className="hero-trust-item space-y-1">
                <p className="text-lg sm:text-xl font-semibold text-[#101828] dark:text-white tabular-nums">0%</p>
                <p className="text-xs text-[#475467] dark:text-slate-400 font-normal">Không giữ hộ tiền</p>
              </div>
              <div className="hero-trust-item space-y-1">
                <p className="text-lg sm:text-xl font-semibold text-[#101828] dark:text-white tabular-nums">&lt; 3s</p>
                <p className="text-xs text-[#475467] dark:text-slate-400 font-normal">Gạch nợ tức thì</p>
              </div>
              <div className="hero-trust-item space-y-1">
                <p className="text-lg sm:text-xl font-semibold text-[#101828] dark:text-white tabular-nums">24/7</p>
                <p className="text-xs text-[#475467] dark:text-slate-400 font-normal">VietQR Napas</p>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Lifestyle & Device Mockup Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Main Lifestyle Image */}
              <div className="hero-image-card relative rounded-2xl overflow-hidden border border-[#E4E7EC] dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 group">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/images/landing/hero/hero_manager.jpg"
                    alt="Người quản lý sử dụng TingRoster trên laptop và tablet"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                  />
                  {/* Subtle darkening scrim for badge readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Floating Activity Card: Real-time VietQR Confirmation */}
                <div className="hero-floating-vietqr absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 bg-white/95 dark:bg-[#111726]/95 backdrop-blur-md p-4 rounded-xl border border-[#E4E7EC] dark:border-slate-800 shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-[#101828] dark:text-white flex items-center gap-1.5">
                          <span>Đối soát tự động thành công</span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">Napas 24/7</span>
                        </p>
                        <p className="text-[11px] text-[#475467] dark:text-slate-400">
                          Học viên: <span className="font-medium text-[#101828] dark:text-slate-200">Nguyễn Văn An</span> • Khớp hóa đơn HP-10
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +600.000 đ
                      </p>
                      <p className="text-[10px] text-slate-400">Vừa xong</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Counter Badge on Top-Right */}
              <div className="hero-floating-attendance hidden sm:flex absolute -top-4 -right-4 bg-white dark:bg-[#111726] p-3.5 rounded-xl border border-[#E4E7EC] dark:border-slate-800 shadow-lg items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] dark:text-[#4F62FF] flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-[#475467] dark:text-slate-400">Điểm danh hôm nay</p>
                  <p className="text-sm font-semibold text-[#101828] dark:text-white">48/50 thành viên</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
