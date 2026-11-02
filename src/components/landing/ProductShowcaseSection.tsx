'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  Laptop, 
  Smartphone, 
  CheckCircle2, 
  QrCode, 
  CreditCard, 
  Users, 
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Sparkles,
  MousePointer
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ProductShowcaseSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedStageRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(0);

  useGSAP(
    () => {
      if (typeof window === 'undefined') return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Master Pinned ScrollTrigger Timeline
      // Khi người dùng cuộn tới mục #giai-phap, màn hình sẽ "BẮT CUỘN" (PIN)
      // và quán tính cuộn chuột sẽ điều khiển diễn hoạt 3 giai đoạn tự động hoá
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=2500',
          pin: pinnedStageRef.current,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.33) {
              setActiveStep(0);
            } else if (p < 0.68) {
              setActiveStep(1);
            } else {
              setActiveStep(2);
            }
          },
        },
      });

      // 1. Thanh tiến trình chạy theo độ cuộn chuột (0 -> 1)
      tl.to('.showcase-progress-indicator', {
        scaleX: 1,
        ease: 'none',
        duration: 3,
      }, 0);

      // 2. Chuyển từ Giai đoạn 1 (Điểm danh QR) -> Giai đoạn 2 (VietQR Đối soát)
      tl.to('.stage-scene-1', {
        opacity: 0,
        y: -30,
        scale: 0.95,
        duration: 0.6,
        ease: 'power2.inOut',
      }, 0.8)
        .to('.phone-scene-1', {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: 'power2.inOut',
        }, 0.8)
        .fromTo('.stage-scene-2', 
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power2.out' },
          1.1
        )
        .fromTo('.phone-scene-2',
          { opacity: 0, scale: 0.92, y: 25 },
          { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)' },
          1.1
        )
        .fromTo('.vietqr-flash-badge',
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' },
          1.3
        );

      // 3. Chuyển từ Giai đoạn 2 (VietQR Đối soát) -> Giai đoạn 3 (Báo cáo & Khép kín)
      tl.to('.stage-scene-2', {
        opacity: 0,
        y: -30,
        scale: 0.95,
        duration: 0.6,
        ease: 'power2.inOut',
      }, 1.9)
        .to('.phone-scene-2', {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: 'power2.inOut',
        }, 1.9)
        .fromTo('.stage-scene-3', 
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power2.out' },
          2.2
        )
        .fromTo('.phone-scene-3',
          { opacity: 0, scale: 0.92, y: 25 },
          { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)' },
          2.2
        )
        .fromTo('.analytics-bar-fill',
          { width: '0%' },
          { width: '98.5%', duration: 0.6, ease: 'power2.out' },
          2.4
        );
    },
    { scope: containerRef }
  );

  return (
    <section id="giai-phap" ref={containerRef} className="relative w-full bg-[#F5F7FB] dark:bg-[#0B0F19]">
      {/* KHUNG ĐƯỢC GSAP SCROLLTRIGGER PIN LẠI (STICKY STAGE) */}
      <div 
        ref={pinnedStageRef} 
        className="w-full min-h-screen flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-y border-[#E4E7EC] dark:border-slate-800 bg-white dark:bg-[#0B0F19] transition-colors relative overflow-hidden"
      >
        
        {/* Phần 1: Tiêu đề & Cụm Tab chỉ báo trạng thái cuộn */}
        <div className="max-w-5xl mx-auto w-full text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-[#2538D9] dark:text-[#4F62FF] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kịch bản cuộn tương tác 3 giai đoạn tự động</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#101828] dark:text-white leading-tight">
            Vận hành thực tế trên thiết bị của bạn
          </h2>

          <p className="text-sm sm:text-base text-[#475467] dark:text-slate-400 font-normal max-w-2xl mx-auto">
            Cuộn chuột để quan sát dữ liệu đồng bộ thời gian thực từ Kiosk điểm danh đến tài khoản ngân hàng Napas 24/7.
          </p>

          {/* 3 Step Interactive Indicator Tabs */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 relative">
              
              {/* Tab 1 */}
              <div 
                className={`p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeStep === 0 
                    ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-[#4F62FF] shadow-md shadow-blue-500/10' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <QrCode className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">1. Điểm danh QR Kiosk</span>
                <span className="sm:hidden">1. Điểm danh</span>
              </div>

              {/* Tab 2 */}
              <div 
                className={`p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeStep === 1 
                    ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-[#4F62FF] shadow-md shadow-blue-500/10' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Zap className="w-4 h-4 shrink-0 text-amber-500" />
                <span className="hidden sm:inline">2. Đối soát VietQR</span>
                <span className="sm:hidden">2. VietQR</span>
              </div>

              {/* Tab 3 */}
              <div 
                className={`p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeStep === 2 
                    ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-[#4F62FF] shadow-md shadow-blue-500/10' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0 text-emerald-500" />
                <span className="hidden sm:inline">3. Khép kín công nợ</span>
                <span className="sm:hidden">3. Báo cáo</span>
              </div>

              {/* Micro Progress Bar beneath tabs */}
              <div className="absolute -bottom-1 left-2 right-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="showcase-progress-indicator h-full bg-gradient-to-r from-[#2538D9] via-[#6D5CE8] to-[#2538D9] origin-left scale-x-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Phần 2: Trung tâm diễn biến (Dual Device Stage: Laptop + Smartphone) */}
        <div className="max-w-6xl mx-auto w-full my-auto py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Cột trái (Chiếm 7 phần): Màn hình Laptop Quản trị Console */}
            <div className="lg:col-span-8 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#E4E7EC] dark:border-slate-800 shadow-2xl bg-slate-900 group aspect-[16/10] w-full">
                
                {/* Background desk texture */}
                <Image
                  src="/images/landing/devices/laptop_desk.jpg"
                  alt="TingRoster trên máy tính để bàn"
                  fill
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover object-center opacity-30 blur-[1px]"
                />
                
                {/* Simulated Glass Console Container */}
                <div className="absolute inset-2 sm:inset-5 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/40 dark:border-slate-700/50 shadow-2xl flex flex-col justify-between overflow-hidden">
                  
                  {/* Console Top Window Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="ml-2 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        TingRoster Hub • Không gian Toán 12A & CLB Thể Thao
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>VietQR Napas Đang Đồng Bộ</span>
                    </span>
                  </div>

                  {/* KỊCH BẢN 1: BẢNG ĐIỂM DANH KIOSK (STAGE SCENE 1) */}
                  <div className="stage-scene-1 absolute inset-x-4 sm:inset-x-6 top-16 bottom-14 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-[#101828] dark:text-white">Điểm danh ca học 18:00 - 19:30</h4>
                          <p className="text-xs text-[#475467] dark:text-slate-400">Tự động ghi nhận giờ vào ca qua camera Kiosk</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950 text-[#2538D9] dark:text-[#4F62FF]">
                          Đã có mặt: 48/50 em
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[11px]">
                              AN
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">Nguyễn Văn An</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">17:58:12</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium text-[10px]">
                              Quét QR Kiosk
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[11px]">
                              MAI
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">Trần Thị Mai</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">18:01:45</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium text-[10px]">
                              Quét QR Kiosk
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs animate-pulse">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center text-[11px]">
                              MINH
                            </div>
                            <span className="font-semibold text-emerald-900 dark:text-emerald-200">Vũ Đức Minh • Check-in vừa xong</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">18:04:02</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px]">
                              + Trừ 1 buổi
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KỊCH BẢN 2: TỰ ĐỘNG ĐỐI SOÁT VIETQR (STAGE SCENE 2 - Ban đầu ẩn) */}
                  <div className="stage-scene-2 absolute inset-x-4 sm:inset-x-6 top-16 bottom-14 flex flex-col justify-between opacity-0 pointer-events-none">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-[#101828] dark:text-white flex items-center gap-2">
                            <span>Biến động số dư VietQR Napas 24/7</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 font-bold">Tự gạch nợ &lt; 3s</span>
                          </h4>
                          <p className="text-xs text-[#475467] dark:text-slate-400">Webhook SePay / Casso xử lý tức thì khi tiền về tài khoản</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                          Đã thu: 28.600.000 đ
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                              <span>MBBank • NGUYEN VAN AN</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-bold">Khớp 100%</span>
                            </p>
                            <p className="text-[11px] text-[#475467] dark:text-slate-400">Nội dung CK: <code className="text-[#2538D9] dark:text-[#4F62FF] font-mono">TR8921 NGUYEN VAN AN</code></p>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Đã gạch nợ hóa đơn học phí HP-10 • Buổi học đã gia hạn</p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">+600.000 đ</p>
                            <p className="text-[10px] text-slate-400">Vừa khớp 2s trước</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">Techcombank • TRAN THI MAI</p>
                            <p className="text-[10px] text-slate-400">Nội dung CK: TR8921 TRAN THI MAI • Gạch nợ HĐ HP-11</p>
                          </div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">+600.000 đ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KỊCH BẢN 3: BÁO CÁO CÔNG NỢ & AN TOÀN ZERO-CUSTODY (STAGE SCENE 3 - Ban đầu ẩn) */}
                  <div className="stage-scene-3 absolute inset-x-4 sm:inset-x-6 top-16 bottom-14 flex flex-col justify-between opacity-0 pointer-events-none">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-base font-semibold text-[#101828] dark:text-white">Báo cáo tài chính & Bảo toàn dòng tiền</h4>
                        <p className="text-xs text-[#475467] dark:text-slate-400">Không sai sót Excel • Không thất thoát ca vãng lai</p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Tỷ lệ thu đủ</p>
                          <p className="text-lg font-bold text-[#2538D9] dark:text-[#4F62FF] tabular-nums">98.5%</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Tiền về tài khoản</p>
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">100%</p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Thời gian tiết kiệm</p>
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400 tabular-nums">18h / tháng</p>
                        </div>
                      </div>

                      {/* Animated Progress Gauge */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300">Tiến độ thu học phí & ca sân tháng này</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">48 / 50 thành viên</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="analytics-bar-fill h-full bg-gradient-to-r from-[#2538D9] to-emerald-500 rounded-full w-0" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Console Bottom Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Cơ chế Zero-Custody: Tiền về thẳng ngân hàng chính chủ, TingRoster không giữ tiền.</span>
                    </span>
                    <span className="font-semibold text-[#2538D9] dark:text-[#4F62FF] hidden sm:inline">TingRoster Real-time Engine</span>
                  </div>

                </div>
              </div>
            </div>

            {/* Cột phải (Chiếm 4-5 phần): Smartphone Check-in & Thông báo Real-time */}
            <div className="lg:col-span-4 relative flex justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl bg-slate-950 aspect-[9/16]">
                
                {/* Phone Speaker Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-30" />

                {/* PHONE SCENE 1: Màn hình quét QR tại cơ sở */}
                <div className="phone-scene-1 absolute inset-0 p-4 pt-10 flex flex-col justify-between text-white z-10">
                  <div className="text-center space-y-1">
                    <p className="text-[11px] text-slate-400">Kiosk Điểm Danh Tự Phục Vụ</p>
                    <p className="text-sm font-semibold">Quét mã để check-in</p>
                  </div>

                  {/* QR Box with animated scanning laser */}
                  <div className="relative mx-auto w-44 h-44 rounded-2xl bg-white p-3 shadow-inner flex items-center justify-center overflow-hidden">
                    <Image
                      src="/images/landing/devices/smartphone_qr.jpg"
                      alt="Mã QR điểm danh"
                      fill
                      className="object-cover p-2"
                    />
                    {/* Glowing scanning laser beam */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#2538D9] to-transparent shadow-[0_0_12px_#2538D9] animate-[bounce_2s_infinite]" />
                  </div>

                  <div className="p-3 rounded-xl bg-blue-900/60 border border-blue-700/60 text-center">
                    <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Camera nhận diện tức thì</span>
                    </p>
                    <p className="text-[10px] text-slate-300 mt-0.5">Không cần cài app, quét trực tiếp qua Zalo hoặc Camera</p>
                  </div>
                </div>

                {/* PHONE SCENE 2: Màn hình App Ngân hàng & Chuyển khoản VietQR */}
                <div className="phone-scene-2 absolute inset-0 p-4 pt-10 flex flex-col justify-between text-white z-20 opacity-0 pointer-events-none bg-gradient-to-b from-slate-900 to-blue-950">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600 font-bold uppercase tracking-wider">VietQR Napas 24/7</span>
                    <p className="text-sm font-semibold">Chuyển khoản học phí</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-2">
                    <p className="text-xs text-slate-300">Số tiền thanh toán</p>
                    <p className="text-2xl font-bold text-emerald-400 tabular-nums">600.000 đ</p>
                    <div className="p-2 rounded bg-slate-900/80 text-[11px] font-mono text-blue-300">
                      ND: TR8921 NGUYEN VAN AN
                    </div>
                  </div>

                  {/* VietQR Flash confirmation badge */}
                  <div className="vietqr-flash-badge p-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-center text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-slate-950" />
                    <span>Giao dịch thành công! Gạch nợ tức thì</span>
                  </div>
                </div>

                {/* PHONE SCENE 3: Màn hình Cổng phụ huynh tra cứu riêng tư */}
                <div className="phone-scene-3 absolute inset-0 p-4 pt-10 flex flex-col justify-between text-white z-20 opacity-0 pointer-events-none bg-slate-900">
                  <div className="text-center space-y-1">
                    <p className="text-[11px] text-slate-400">Cổng Phụ Huynh / Học Viên</p>
                    <p className="text-sm font-semibold">Lịch sử & Biên lai học phí</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Học phí Tháng 10</span>
                        <span className="text-emerald-400">Đã đóng đủ</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Số tiền: 600.000 đ • Khớp qua VietQR</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Chuyên cần: 8/8 buổi</span>
                        <span className="text-blue-400">100% Đầy đủ</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Không có buổi vắng nào trong tháng</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-center">
                    <p className="text-xs font-semibold text-emerald-400">Minh bạch 100% công nợ</p>
                    <p className="text-[10px] text-slate-400">Không cần chụp màn hình chuyển khoản qua Zalo</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Phần 3: Lời nhắc điều khiển cuộn chuột (Scroll Guidance Footer) */}
        <div className="max-w-md mx-auto w-full text-center pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700 shadow-sm animate-bounce">
            <MousePointer className="w-3.5 h-3.5 text-[#2538D9] dark:text-[#4F62FF]" />
            <span>
              {activeStep === 0 && 'Cuộn chuột tiếp để xem tự động đối soát VietQR...'}
              {activeStep === 1 && 'Cuộn tiếp để xem báo cáo khép kín công nợ...'}
              {activeStep === 2 && 'Đã hoàn tất 3 bước! Tiếp tục cuộn để xem so sánh...'}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
