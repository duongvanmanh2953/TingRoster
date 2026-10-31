'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Clock, 
  Coins, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

export function RoiCalculatorSection() {
  const [memberCount, setMemberCount] = useState<number>(60);
  const [avgFee, setAvgFee] = useState<number>(600000); // 600,000 VND / month / student

  // Realistic transparent calculation assumptions:
  // 1. Manual reconciliation time: ~15 minutes per member per month (checking bank screenshot, matching invoice, sending reminder)
  const hoursSavedPerMonth = Math.round((memberCount * 12) / 60); // 12 mins per member
  
  // 2. Labor cost saved: estimated standard admin labor at 40,000 VND/hour
  const laborCostSaved = hoursSavedPerMonth * 40000;

  // 3. Uncollected fee recovery: average manual uncollected/slippage rate is ~5%, TingRoster reduces uncollected to < 0.5%
  const totalRevenue = memberCount * avgFee;
  const recoveredFee = Math.round(totalRevenue * 0.045); // 4.5% recovered

  // 4. Total monthly financial gain
  const totalMonthlyGain = laborCostSaved + recoveredFee;

  return (
    <section id="roi-calculator" className="py-20 sm:py-28 bg-white dark:bg-[#0B0F19] transition-colors border-y border-[#E4E7EC] dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] dark:text-[#4F62FF] text-xs font-medium">
            <Calculator className="w-3.5 h-3.5" />
            <span>Công cụ tính toán hiệu quả thực tế</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#101828] dark:text-white leading-tight">
            Ước tính hiệu quả vận hành & Doanh thu bảo toàn
          </h2>
          <p className="text-base text-[#475467] dark:text-slate-400 font-normal leading-relaxed">
            Kéo thanh trượt để xem bạn tiết kiệm được bao nhiêu thời gian và giảm thiểu được bao nhiêu thất thoát công nợ mỗi tháng.
          </p>
        </div>

        {/* Interactive Calculator Container */}
        <div className="max-w-4xl mx-auto p-6 sm:p-10 rounded-2xl bg-[#F5F7FB] dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Sliders and Inputs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#344054] dark:text-slate-300">
                    Số lượng thành viên / học viên
                  </label>
                  <span className="text-sm font-semibold text-[#2538D9] dark:text-[#4F62FF] tabular-nums">
                    {memberCount} người
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={memberCount}
                  onChange={(e) => setMemberCount(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#2538D9] dark:accent-[#4F62FF]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>10 thành viên</span>
                  <span>150</span>
                  <span>300+</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#344054] dark:text-slate-300">
                    Mức thu trung bình mỗi tháng
                  </label>
                  <span className="text-sm font-semibold text-[#2538D9] dark:text-[#4F62FF] tabular-nums">
                    {formatVND(avgFee)} / người
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="2000000"
                  step="50000"
                  value={avgFee}
                  onChange={(e) => setAvgFee(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#2538D9] dark:accent-[#4F62FF]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>100.000 đ</span>
                  <span>1.000.000 đ</span>
                  <span>2.000.000 đ</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3 text-xs text-[#475467] dark:text-slate-400">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Giả định tính toán:</strong> Tiết kiệm 12 phút kiểm tra sao kê/nhắc nợ trên mỗi thành viên; chi phí nhân sự ước tính 40.000 đ/giờ; tỷ lệ thất thoát nợ giảm 4.5% nhờ đối soát tự động 24/7.
                </p>
              </div>
            </div>

            {/* Right Column: Dynamic Results Grid */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-5 text-left">
              <div>
                <p className="text-xs font-medium text-[#475467] dark:text-slate-400">
                  Lợi ích kinh tế ước tính mỗi tháng
                </p>
                <p className="text-2xl sm:text-3xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
                  ~ {formatVND(totalMonthlyGain)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Bao gồm công nợ thu hồi và chi phí thời gian</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#475467] dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Thời gian tiết kiệm</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-[#101828] dark:text-white tabular-nums">
                    {hoursSavedPerMonth} giờ / tháng
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#475467] dark:text-slate-400">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>Công nợ thu hồi</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-[#101828] dark:text-white tabular-nums">
                    {formatVND(recoveredFee)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/register"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] dark:bg-[#4F62FF] dark:hover:bg-[#3E51E8] text-white text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  <span>Bắt đầu tự động hóa ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
