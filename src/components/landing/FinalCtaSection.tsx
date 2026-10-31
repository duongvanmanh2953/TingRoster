'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export function FinalCtaSection() {
  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-[#0B0F19] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cinematic Card with Subtle Radial Glow */}
        <div className="relative rounded-3xl bg-[#0B0F19] text-white p-10 sm:p-16 lg:p-20 overflow-hidden shadow-2xl border border-slate-800 text-center">
          
          {/* Subtle Aurora Glow inside Card */}
          <div 
            className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-30 blur-3xl -z-0"
            style={{
              background: 'radial-gradient(circle, rgba(79, 98, 255, 0.4) 0%, rgba(109, 92, 232, 0.25) 50%, transparent 70%)'
            }}
          />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Khởi tạo trong 3 phút • Dùng thử 30 ngày đầy đủ tính năng</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
              Sẵn sàng giải phóng thời gian và chấm dứt nỗi lo đối soát?
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              Tham gia cùng hàng trăm giáo viên và câu lạc bộ thể thao đang vận hành điểm danh và thu phí tự động mỗi ngày với TingRoster.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-sm font-semibold shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
              >
                <span>Tạo tài khoản miễn phí ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-all"
              >
                <span>Đăng nhập hệ thống</span>
              </Link>
            </div>

            {/* Micro guarantees */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Không cần thẻ tín dụng</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero-Custody 100% an toàn</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Hỗ trợ kỹ thuật tận tình</span>
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
