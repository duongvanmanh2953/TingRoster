'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, RefreshCw, Calculator, TrendingUp, Clock, ShieldCheck } from 'lucide-react';
import { formatVND } from '@/lib/utils';
import { AmbientGlow } from '@/components/reactbits/AmbientGlow';
import { TiltedCard } from '@/components/reactbits/TiltedCard';

interface RoiCalculatorSectionProps {
  onInstantDemo: () => Promise<void>;
  isDemoLoggingIn: boolean;
}

export function RoiCalculatorSection({ onInstantDemo, isDemoLoggingIn }: RoiCalculatorSectionProps) {
  const [memberCount, setMemberCount] = useState<number>(60);

  // Formula matching the brief:
  // At 60 members: 27 hours saved (60 * 0.45), 2.700.000đ recovered (60 * 45.000)
  const hoursSaved = Math.round(memberCount * 0.45);
  const moneyRecovered = memberCount * 45000;

  return (
    <section id="roi-calculator" className="scroll-reveal py-24 sm:py-32 relative bg-[#0B0F19] text-white w-full overflow-hidden">
      <AmbientGlow className="top-10 left-1/3" size={650} color="rgba(37, 56, 217, 0.22)" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5 text-[#2538D9]" />
            <span>Đo lường giá trị thực tế</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-normal leading-tight">
            Ước tính hiệu quả vận hành thực tế
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Kéo thanh trượt theo quy mô học sinh hoặc hội viên của bạn để xem ngay số giờ lao động tiết kiệm và doanh thu thu hồi mỗi tháng.
          </p>
        </div>

        {/* Interactive Calculator Workspace */}
        <div className="max-w-5xl mx-auto p-8 sm:p-12 rounded-3xl bg-slate-900/90 space-y-12" data-ui>
          {/* Slider & Input Row */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-slate-300 block">
                  Quy mô học sinh / hội viên / khách thuê:
                </span>
                <span className="text-3xl sm:text-4xl font-black text-[#2538D9] dark:text-blue-400">
                  {memberCount} người
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2">
                {[10, 60, 150, 300].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMemberCount(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      memberCount === preset
                        ? 'bg-[#2538D9] text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {preset === 300 ? '300+ người' : `${preset} người`}
                  </button>
                ))}
              </div>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min="10"
              max="400"
              step="5"
              value={memberCount}
              onChange={(e) => setMemberCount(Number(e.target.value))}
              aria-label="Quy mô học sinh hoặc hội viên"
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2538D9]"
            />
          </div>

          {/* 3 Key Metric Displays */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Metric 1: Hours Saved */}
            <TiltedCard maxTilt={6} perspective={1000}>
              <div className="p-6 rounded-2xl bg-slate-800/80 space-y-3 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Thời gian tiết kiệm / tháng</span>
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-4xl sm:text-5xl font-black text-white block">
                    ~{hoursSaved} giờ
                  </span>
                  <span className="text-xs text-slate-400 mt-2 block">
                    Tương đương {Math.max(1, Math.round(hoursSaved / 8))} ngày công lao động ngồi dò sổ sách
                  </span>
                </div>
              </div>
            </TiltedCard>

            {/* Metric 2: Money Recovered */}
            <TiltedCard maxTilt={6} perspective={1000}>
              <div className="p-6 rounded-2xl bg-slate-800/80 space-y-3 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Thu hồi thất thoát / tháng</span>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-4xl sm:text-5xl font-black text-emerald-400 block">
                    ~{formatVND(moneyRecovered)}
                  </span>
                  <span className="text-xs text-slate-400 mt-2 block">
                    Tránh quên thu phí, bỏ sót buổi học và nhầm lẫn đối soát
                  </span>
                </div>
              </div>
            </TiltedCard>

            {/* Metric 3: Reconciliation Accuracy */}
            <TiltedCard maxTilt={6} perspective={1000}>
              <div className="p-6 rounded-2xl bg-slate-800/80 space-y-3 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Sai lệch sao kê</span>
                  <ShieldCheck className="w-5 h-5 text-[#2538D9]" />
                </div>
                <div>
                  <span className="text-4xl sm:text-5xl font-black text-[#2538D9] dark:text-blue-400 block">
                    0%
                  </span>
                  <span className="text-xs text-slate-400 mt-2 block">
                    Khớp tự động chuẩn cú pháp Napas 24/7 sau 0.18 giây
                  </span>
                </div>
              </div>
            </TiltedCard>
          </div>

          {/* Action CTA */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onInstantDemo}
              disabled={isDemoLoggingIn}
              className="px-8 py-4 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-sm sm:text-base transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isDemoLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Đang mở không gian demo...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current text-amber-300 shrink-0" />
                  <span>Trải nghiệm dùng thử miễn phí 30 ngày</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
