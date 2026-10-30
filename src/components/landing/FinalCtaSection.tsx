'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, RefreshCw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AmbientGlow } from '@/components/reactbits/AmbientGlow';
import { MagneticButton } from '@/components/reactbits/MagneticButton';

interface FinalCtaSectionProps {
  onInstantDemo: () => Promise<void>;
  isDemoLoggingIn: boolean;
}

export function FinalCtaSection({ onInstantDemo, isDemoLoggingIn }: FinalCtaSectionProps) {
  return (
    <section className="scroll-reveal py-24 sm:py-32 relative bg-[#0B0F19] text-white w-full overflow-hidden">
      <AmbientGlow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={750} color="rgba(37, 56, 217, 0.28)" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 text-blue-300 text-xs sm:text-sm font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#2538D9]" />
          <span>Sẵn sàng chuyển đổi quy trình trong hôm nay</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-normal leading-[1.15]">
          Bắt đầu vận hành chuyên nghiệp cùng TingRoster
        </h2>

        <p className="text-base sm:text-xl text-slate-300 max-w-[62ch] mx-auto leading-relaxed">
          Xóa bỏ 100% nỗi lo dò sổ sách, thu học phí và thất thoát doanh thu. Hãy để công nghệ Napas 24/7 tự động phục vụ bạn.
        </p>

        {/* CTAs */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link href="/onboarding">
            <MagneticButton className="px-8 py-4 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-base transition-colors flex items-center gap-2">
              <span>Bắt đầu 30 ngày dùng thử miễn phí</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </MagneticButton>
          </Link>

          <button
            type="button"
            onClick={onInstantDemo}
            disabled={isDemoLoggingIn}
            className="px-7 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isDemoLoggingIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#2538D9]" />
                <span>Đang kết nối...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current text-amber-400" />
                <span>Xem Demo trực tiếp</span>
              </>
            )}
          </button>
        </div>

        {/* Trust points */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Không yêu cầu thẻ tín dụng</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cài đặt sẵn sàng trong 60 giây</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cam kết Zero-Custody an toàn</span>
          </div>
        </div>
      </div>
    </section>
  );
}
