'use client';

import React from 'react';
import Link from 'next/link';
import {
  QrCode,
  CreditCard,
  FileSpreadsheet,
  ShieldCheck,
  Tv,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';

export function FeatureBentoSection() {
  return (
    <section className="scroll-reveal py-24 sm:py-32 relative bg-white dark:bg-[#0B0F19] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-[#2538D9] dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tính năng cốt lõi vượt trội</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#101828] dark:text-white tracking-normal leading-tight">
            Vũ khí vận hành tự động cho cơ sở của bạn
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Kết hợp điểm danh thông minh, thanh toán Napas 24/7 và kế toán hộ kinh doanh trong một hệ thống duy nhất.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Kiosk QR (Span 7) */}
          <SpotlightCard
            spotlightColor="rgba(37, 56, 217, 0.2)"
            className="md:col-span-7 p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-800 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-[#2538D9]/10 text-[#2538D9] dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center">
                <Tv className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#101828] dark:text-white">
                  Màn hình Kiosk quét QR tự phục vụ
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Đặt một máy tính bảng hoặc laptop tại quầy đón tiếp. Thành viên chỉ cần đưa thẻ hoặc mở điện thoại có mã QR, hệ thống tự động nhận diện và phát âm thanh chào mừng tức thì.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <QrCode className="w-6 h-6 text-[#2538D9]" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Tốc độ nhận diện camera: 0.12 giây
                  </span>
                </div>
                <Link
                  href="/kiosk"
                  className="font-bold text-[#2538D9] dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Mở Kiosk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2: Zero-Custody Napas 24/7 (Span 5) */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.2)"
            className="md:col-span-5 p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-800 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#101828] dark:text-white">
                  Cơ chế Zero-Custody tuyệt đối
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  TingRoster không giữ tiền trung gian. 100% dòng tiền chuyển khoản Napas 24/7 đi thẳng vào tài khoản ngân hàng chính chủ của bạn.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                An toàn tuyệt đối theo chuẩn bảo mật tài chính ngân hàng.
              </div>
            </div>
          </SpotlightCard>

          {/* Card 3: Tax Accounting Compliance (Span 5) */}
          <SpotlightCard
            spotlightColor="rgba(245, 158, 11, 0.2)"
            className="md:col-span-5 p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-800 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#101828] dark:text-white">
                  Kế toán Hộ kinh doanh chuẩn mực
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Hỗ trợ xuất bảng kê Mẫu 01-1/BK-HDKD (Thông tư 40/2021) và sổ S1-HKD, S2-HKD (Thông tư 88/2021) ra file Excel chỉ trong 1 click.
                </p>
              </div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
                Sẵn sàng nộp cơ quan thuế không cần thuê kế toán ngoài
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4: Parent Portal with Public Token (Span 7) */}
          <SpotlightCard
            spotlightColor="rgba(37, 56, 217, 0.2)"
            className="md:col-span-7 p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-800 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-[#2538D9] dark:text-blue-300 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#101828] dark:text-white">
                  Cổng phụ huynh bảo mật qua Public Token
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Mỗi học viên có một đường dẫn bảo mật riêng với public token mã hóa an toàn. Phụ huynh xem được đúng thông tin và hóa đơn con mình, không thấy công nợ người khác.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 text-xs font-semibold">
                Phụ huynh quét mã VietQR Napas thanh toán ngay trên điện thoại không cần đăng ký tài khoản rườm rà.
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
