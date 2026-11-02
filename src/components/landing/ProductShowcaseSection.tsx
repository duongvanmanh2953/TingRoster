'use client';

import React, { useRef, useState } from 'react';
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
  MousePointer,
  Bell,
  Search,
  Check,
  Building2,
  CalendarCheck,
  DollarSign,
  ChevronRight,
  Wallet,
  Clock,
  ArrowUpRight,
  BadgeCheck,
  Lock,
  Layers,
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Settings
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ProductShowcaseSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedStageRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Cho phép người dùng click trực tiếp vào tab để nhảy ngay sang màn hình tương ứng
  const handleSelectStep = (stepIdx: number) => {
    setActiveStep(stepIdx);
    
    // Đồng bộ ngay lập tức các layer hiển thị
    gsap.to(['.ipad-scene-0', '.ipad-scene-1', '.ipad-scene-2'], { opacity: 0, duration: 0.25 });
    gsap.to(['.phone-scene-0', '.phone-scene-1', '.phone-scene-2'], { opacity: 0, duration: 0.25 });
    
    gsap.to(`.ipad-scene-${stepIdx}`, { opacity: 1, duration: 0.35, delay: 0.05 });
    gsap.to(`.phone-scene-${stepIdx}`, { opacity: 1, duration: 0.35, delay: 0.05 });
  };

  useGSAP(
    () => {
      if (typeof window === 'undefined') return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Đảm bảo ban đầu Scene 0 luôn hiển thị 100% rõ nét, không bị trễ hoặc mờ
      gsap.set('.ipad-scene-0', { opacity: 1, display: 'flex' });
      gsap.set('.phone-scene-0', { opacity: 1, display: 'flex' });
      gsap.set(['.ipad-scene-1', '.ipad-scene-2'], { opacity: 0 });
      gsap.set(['.phone-scene-1', '.phone-scene-2'], { opacity: 0 });

      // GSAP ScrollTrigger Pinned Scrub:
      // Giữ màn hình và chuyển cảnh theo tiến độ cuộn chuột (0% -> 33% -> 66% -> 100%)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=1800',
          pin: pinnedStageRef.current,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.35) {
              setActiveStep(0);
            } else if (p < 0.72) {
              setActiveStep(1);
            } else {
              setActiveStep(2);
            }
          },
        },
      });

      // 1. Thanh tiến trình chạy bám sát tiến độ cuộn
      tl.to('.showcase-progress-indicator', {
        scaleX: 1,
        ease: 'none',
        duration: 2,
      }, 0);

      // 2. Chuyển từ Bước 0 (Điểm danh) sang Bước 1 (Đối soát VietQR)
      tl.to(['.ipad-scene-0', '.phone-scene-0'], {
        opacity: 0,
        y: -15,
        duration: 0.4,
        ease: 'power2.inOut',
      }, 0.6)
        .to(['.ipad-scene-1', '.phone-scene-1'], {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        }, 0.8)
        .fromTo('.dynamic-island-badge',
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' },
          0.9
        );

      // 3. Chuyển từ Bước 1 (VietQR) sang Bước 2 (Báo cáo Doanh thu)
      tl.to(['.ipad-scene-1', '.phone-scene-1'], {
        opacity: 0,
        y: -15,
        duration: 0.4,
        ease: 'power2.inOut',
      }, 1.3)
        .to(['.ipad-scene-2', '.phone-scene-2'], {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        }, 1.5)
        .fromTo('.chart-bar-grow',
          { scaleY: 0.2 },
          { scaleY: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', transformOrigin: 'bottom' },
          1.6
        );
    },
    { scope: containerRef }
  );

  return (
    <section id="giai-phap" ref={containerRef} className="relative w-full bg-[#F5F7FB] dark:bg-[#0B0F19]">
      {/* KHUNG CỐ ĐỊNH KHI BẮT ĐẦU CUỘN (STICKY PINNED STAGE) */}
      <div 
        ref={pinnedStageRef} 
        className="w-full min-h-screen flex flex-col justify-between py-6 sm:py-8 px-3 sm:px-6 lg:px-8 border-y border-[#E4E7EC] dark:border-slate-800 bg-[#F5F7FB] dark:bg-[#0B0F19] transition-colors relative overflow-hidden"
      >
        
        {/* Phần 1: Tiêu đề & Cụm Tab tương tác */}
        <div className="max-w-5xl mx-auto w-full text-center space-y-2.5 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-[#2538D9] dark:text-[#4F62FF] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Giao diện thật của TingRoster trên iPad Pro & iPhone 16 Pro</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#101828] dark:text-white leading-tight">
            Vận hành thực tế trên thiết bị của bạn
          </h2>

          <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400 font-normal max-w-2xl mx-auto">
            Dữ liệu đồng bộ tức thì: Quản lý nhìn thấy trên iPad ngay khi học viên thao tác trên iPhone.
          </p>

          {/* 3 Step Interactive Indicator Tabs */}
          <div className="pt-1 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 relative">
              
              {/* Tab 1 */}
              <button
                type="button"
                onClick={() => handleSelectStep(0)}
                className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeStep === 0 
                    ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-[#4F62FF] shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">1. Điểm danh Kiosk</span>
                <span className="sm:hidden">1. Điểm danh</span>
              </button>

              {/* Tab 2 */}
              <button
                type="button"
                onClick={() => handleSelectStep(1)}
                className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeStep === 1 
                    ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-[#4F62FF] shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span className="hidden sm:inline">2. Tự động đối soát</span>
                <span className="sm:hidden">2. Đối soát</span>
              </button>

              {/* Tab 3 */}
              <button
                type="button"
                onClick={() => handleSelectStep(2)}
                className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeStep === 2 
                    ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-[#4F62FF] shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span className="hidden sm:inline">3. Báo cáo & Tài chính</span>
                <span className="sm:hidden">3. Báo cáo</span>
              </button>

              {/* Thanh tiến trình chạy theo độ lăn chuột */}
              <div className="absolute -bottom-1 left-2 right-2 h-1 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="showcase-progress-indicator h-full bg-gradient-to-r from-[#2538D9] via-[#6D5CE8] to-[#2538D9] origin-left scale-x-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Phần 2: KHUNG IPAD & IPHONE CHỨA GIAO DIỆN THẬT 100% CỦA TINGROSTER */}
        <div className="max-w-6xl mx-auto w-full my-auto py-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
            
            {/* ============================================================== */}
            {/* THIẾT BỊ 1: KHUNG IPAD PRO 12.9" THỰC TẾ (QUẢN LÝ / OWNER)     */}
            {/* ============================================================== */}
            <div className="lg:col-span-8 relative">
              {/* Thân máy nhôm Space Gray của iPad Pro */}
              <div className="relative rounded-[2.2rem] p-3 sm:p-4 bg-gradient-to-br from-[#1C1C1E] via-[#2C2C2E] to-[#1C1C1E] border-[3px] border-slate-600/80 shadow-2xl">
                
                {/* Camera đục lỗ trước viền iPad */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-black border border-slate-700 z-30" />
                
                {/* Màn hình Retina Liquid Display */}
                <div className="relative rounded-[1.4rem] bg-white dark:bg-[#0B0F19] overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[16/10.5] flex flex-col justify-between text-left select-none shadow-inner">
                  
                  {/* iPad Navigation Bar */}
                  <div className="h-10 bg-slate-100 dark:bg-[#111726] border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 flex items-center justify-between text-xs shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-[#2538D9] text-white flex items-center justify-center font-bold text-[10px]">
                          TR
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">TingRoster</span>
                      </div>
                      
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-[#2538D9] dark:text-[#4F62FF] font-semibold text-[10px]">
                        <Building2 className="w-3 h-3" />
                        <span>Lớp Toán 12A • Thầy Dũng</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Napas 24/7 Live</span>
                      </span>
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-[#2538D9] font-bold text-[10px] flex items-center justify-center">
                        TD
                      </div>
                    </div>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* SCENE 0: KIOSK ĐIỂM DANH & SĨ SỐ THỰC TẾ                 */}
                  {/* -------------------------------------------------------- */}
                  <div className="ipad-scene-0 absolute inset-x-0 top-10 bottom-0 p-3 sm:p-5 flex flex-col justify-between bg-white dark:bg-[#0B0F19]">
                    <div className="space-y-3">
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-[#101828] dark:text-white">
                            Điểm Danh Tự Phục Vụ (Kiosk Screen)
                          </h3>
                          <p className="text-[11px] text-[#475467] dark:text-slate-400">
                            Ca 18:00 - 19:30 • Phòng A102 • Trừ buổi tự động
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-bold text-[#2538D9] dark:text-[#4F62FF]">
                            48/50 Học viên có mặt
                          </span>
                          <p className="text-[10px] text-emerald-600 font-medium">96% chuyên cần</p>
                        </div>
                      </div>

                      {/* Danh sách học viên thực tế */}
                      <div className="space-y-2">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                              AN
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">Nguyễn Văn An</p>
                              <p className="text-[10px] text-slate-400">Mã HV: HV-2024-08 • Gói 8 buổi/tháng</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                              Đã điểm danh 17:58
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Quét QR Kiosk</p>
                          </div>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                              MAI
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">Trần Thị Mai</p>
                              <p className="text-[10px] text-slate-400">Mã HV: HV-2024-12 • Gói 8 buổi/tháng</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                              Đã điểm danh 18:01
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Quét QR Kiosk</p>
                          </div>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">
                              NAM
                            </div>
                            <div>
                              <p className="font-semibold text-emerald-950 dark:text-emerald-100">Lê Hoàng Nam (Vừa xong)</p>
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Nhận diện camera • Khớp danh sách lớp</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-[10px] animate-pulse">
                            + Ghi nhận 18:04
                          </span>
                        </div>
                      </div>

                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Mã Action QR tự làm mới mỗi 30s chống gian lận</span>
                      <span className="font-semibold text-[#2538D9] dark:text-[#4F62FF]">Kiosk Mode Active</span>
                    </div>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* SCENE 1: NHẬT KÝ ĐỐI SOÁT VIETQR TỰ ĐỘNG                 */}
                  {/* -------------------------------------------------------- */}
                  <div className="ipad-scene-1 absolute inset-x-0 top-10 bottom-0 p-3 sm:p-5 flex flex-col justify-between bg-white dark:bg-[#0B0F19] opacity-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-[#101828] dark:text-white flex items-center gap-2">
                            <span>Sổ Giao Dịch & Đối Soát VietQR Napas</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">Khớp &lt; 2s</span>
                          </h3>
                          <p className="text-[11px] text-[#475467] dark:text-slate-400">
                            Tiền về thẳng tài khoản MBBank 0989218888 • TingRoster gạch nợ tức thì
                          </p>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          +46.200.000 đ tháng này
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 sm:p-3 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/40 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">MBBank Napas 24/7</span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-[9px] font-bold">
                                TỰ ĐỘNG GẠCH NỢ
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">
                              Nội dung: <strong className="text-[#2538D9] dark:text-[#4F62FF]">TR8921 NGUYEN VAN AN</strong>
                            </p>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                              Đã khớp hóa đơn học phí HP-10 (Tháng 10/2026) • 0 sai lệch
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                              +600.000 đ
                            </span>
                            <p className="text-[10px] text-slate-400">2 giây trước</p>
                          </div>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Techcombank Napas</span>
                            <p className="text-[10px] text-slate-400 font-mono">TR8921 TRAN THI MAI • Khớp HĐ HP-11</p>
                          </div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">+600.000 đ</span>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Vietcombank Napas</span>
                            <p className="text-[10px] text-slate-400 font-mono">CAULONG LE HOANG NAM • Vé ca sân 19:00</p>
                          </div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">+50.000 đ</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Cơ chế Zero-Custody: 100% tiền vào tài khoản ngân hàng của bạn</span>
                      <span className="text-emerald-600 font-semibold">Tỷ lệ khớp 100%</span>
                    </div>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* SCENE 2: BÁO CÁO DOANH THU & TÀI CHÍNH                   */}
                  {/* -------------------------------------------------------- */}
                  <div className="ipad-scene-2 absolute inset-x-0 top-10 bottom-0 p-3 sm:p-5 flex flex-col justify-between bg-white dark:bg-[#0B0F19] opacity-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-[#101828] dark:text-white">
                            Báo Cáo Doanh Thu Tháng 10
                          </h3>
                          <p className="text-[11px] text-[#475467] dark:text-slate-400">
                            Số liệu tài chính tổng hợp từ các lớp học & ca sân thể thao
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold text-xs">
                          Thu đủ 98.5%
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                          <p className="text-[10px] text-slate-400">Tổng doanh thu</p>
                          <p className="text-xs sm:text-base font-bold text-[#101828] dark:text-white mt-1 tabular-nums">48.600.000 đ</p>
                          <p className="text-[9px] text-emerald-600 mt-0.5">↑ +14.2%</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                          <p className="text-[10px] text-slate-400">Đã thu VietQR</p>
                          <p className="text-xs sm:text-base font-bold text-emerald-600 mt-1 tabular-nums">46.200.000 đ</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">Khớp 24/7</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                          <p className="text-[10px] text-slate-400">Công nợ tồn</p>
                          <p className="text-xs sm:text-base font-bold text-rose-600 mt-1 tabular-nums">2.400.000 đ</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">Còn 4 học viên</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-2">
                          <span>Biểu đồ thu phí 7 ngày gần nhất</span>
                          <span className="text-[#2538D9] dark:text-[#4F62FF] font-semibold">Tăng trưởng ổn định</span>
                        </div>
                        <div className="h-14 flex items-end gap-2 justify-between px-2">
                          {[35, 45, 60, 50, 80, 95, 100].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div 
                                className="chart-bar-grow w-full rounded-t bg-gradient-to-t from-[#2538D9] to-[#6D5CE8]" 
                                style={{ height: `${h}%` }}
                              />
                              <span className="text-[8px] text-slate-400">T{i+2}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Xuất báo cáo định kỳ: Excel, PDF sẵn sàng</span>
                      <span className="font-semibold text-emerald-600">Zero Slippage</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* THIẾT BỊ 2: KHUNG IPHONE 16 PRO THỰC TẾ (HỌC VIÊN / PHỤ HUYNH) */}
            {/* ============================================================== */}
            <div className="lg:col-span-4 relative flex justify-center">
              {/* Thân máy kim loại Titan Tự Nhiên của iPhone 16 Pro */}
              <div className="relative w-full max-w-[270px] sm:max-w-[290px] rounded-[3rem] p-3 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border-[3.5px] border-slate-600/90 shadow-2xl">
                
                {/* Màn hình Super Retina XDR */}
                <div className="relative rounded-[2.3rem] bg-slate-950 text-white overflow-hidden aspect-[9/19] flex flex-col justify-between border border-slate-800 shadow-inner">
                  
                  {/* Dynamic Island */}
                  <div className="pt-2 px-3 shrink-0 z-30">
                    <div className="dynamic-island-badge mx-auto w-24 h-6 rounded-full bg-black border border-slate-800 flex items-center justify-between px-2.5 text-[9px] text-white shadow-md">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold font-mono text-[8px] text-emerald-400">Napas 24/7</span>
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* SCENE 0 TRÊN IPHONE: QUÉT QR CHECK-IN TẠI QUẦY           */}
                  {/* -------------------------------------------------------- */}
                  <div className="phone-scene-0 absolute inset-0 pt-12 pb-4 px-3.5 flex flex-col justify-between text-white z-10">
                    <div className="text-center space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">TingRoster Pass</p>
                      <h4 className="text-xs sm:text-sm font-bold">Thẻ Thành Viên & Quét QR</h4>
                    </div>

                    <div className="relative mx-auto w-36 h-36 rounded-2xl bg-white p-2.5 shadow-2xl flex items-center justify-center overflow-hidden">
                      <div className="relative w-full h-full rounded-xl bg-slate-100 flex flex-col items-center justify-center p-2 text-slate-900 text-center">
                        <QrCode className="w-16 h-16 text-[#2538D9]" />
                        <span className="text-[8px] font-mono font-bold mt-1 text-slate-700">AN-8921-VIP</span>
                      </div>
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#2538D9] to-transparent shadow-[0_0_10px_#2538D9] animate-[bounce_2s_infinite]" />
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
                      <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Check-in Thành Công</span>
                      </p>
                      <p className="text-[10px] text-slate-300">Học viên: Nguyễn Văn An</p>
                      <p className="text-[9px] text-slate-400">17:58 • Lớp Toán 12A • Còn 7 buổi</p>
                    </div>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* SCENE 1 TRÊN IPHONE: CHUYỂN KHOẢN APP NGÂN HÀNG VIETQR   */}
                  {/* -------------------------------------------------------- */}
                  <div className="phone-scene-1 absolute inset-0 pt-12 pb-4 px-3.5 flex flex-col justify-between text-white z-20 opacity-0 pointer-events-none bg-gradient-to-b from-slate-950 via-blue-950/40 to-slate-950">
                    <div className="text-center space-y-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-600 font-bold uppercase">
                        VietQR Napas 24/7
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold">Xác Nhận Chuyển Khoản</h4>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-blue-500/30 text-center space-y-2 shadow-xl">
                      <p className="text-[10px] text-slate-400">Người nhận: THAY DUNG TOAN 12A</p>
                      <p className="text-xl font-bold text-emerald-400 font-mono">600.000 đ</p>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-blue-300">
                        ND: TR8921 NGUYEN VAN AN
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-center text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
                      <span>Đã chuyển tiền & Gạch nợ tức thì</span>
                    </div>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* SCENE 2 TRÊN IPHONE: CỔNG TRA CỨU PHỤ HUYNH TINGROSTER    */}
                  {/* -------------------------------------------------------- */}
                  <div className="phone-scene-2 absolute inset-0 pt-12 pb-4 px-3.5 flex flex-col justify-between text-white z-20 opacity-0 pointer-events-none bg-slate-950">
                    <div className="text-center space-y-1">
                      <p className="text-[10px] text-slate-400">Cổng Học Viên / Phụ Huynh</p>
                      <h4 className="text-xs sm:text-sm font-bold">TingRoster Portal</h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-200">Học phí Tháng 10</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[9px] font-bold">
                            Đã đóng đủ
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">600.000 đ • Khớp qua VietQR</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-200">Lịch sử chuyên cần</span>
                          <span className="text-blue-400 text-[10px] font-bold">8/8 Buổi</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Điểm danh đầy đủ 100%</p>
                      </div>

                      <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-900/40 text-center">
                        <p className="text-[10px] text-blue-300 font-medium">Báo cáo cập nhật tự động 24/7</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400">Zero-Custody • Dữ liệu bảo mật</p>
                    </div>
                  </div>

                  <div className="w-20 h-1 bg-slate-600 rounded-full mx-auto mb-1 shrink-0" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Phần 3: Lời nhắc lăn chuột điều khiển (Scroll Guidance Footer) */}
        <div className="max-w-md mx-auto w-full text-center pt-1 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-300/80 dark:border-slate-700 shadow-sm animate-bounce">
            <MousePointer className="w-3.5 h-3.5 text-[#2538D9] dark:text-[#4F62FF]" />
            <span>
              {activeStep === 0 && 'Cuộn chuột tiếp để xem tự động đối soát VietQR trên iPad & iPhone...'}
              {activeStep === 1 && 'Cuộn tiếp để xem biểu đồ báo cáo tài chính TingRoster...'}
              {activeStep === 2 && 'Đã hoàn tất 3 bước! Tiếp tục cuộn để xem so sánh giải pháp...'}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
