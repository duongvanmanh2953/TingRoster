'use client';

import React from 'react';
import { XCircle, CheckCircle2, AlertTriangle, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { AmbientGlow } from '@/components/reactbits/AmbientGlow';

export function ProblemSolutionSection() {
  return (
    <section className="scroll-reveal py-24 sm:py-32 relative overflow-hidden bg-white dark:bg-[#0B0F19] w-full">
      <AmbientGlow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={650} color="rgba(37, 56, 217, 0.1)" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Nỗi đau vận hành thực tế</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#101828] dark:text-white tracking-normal leading-tight">
            Quản lý thủ công đang âm thầm làm bạn mất bao nhiêu tiền?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Dò sổ sách lúc đêm muộn, đối chiếu tin nhắn biến động số dư và những khoản thu bị lãng quên đã đến lúc được tự động hóa.
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left: Quản lý thủ công & Rủi ro */}
          <div className="p-8 sm:p-10 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 space-y-6 flex flex-col justify-between" data-ui>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center font-bold">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-rose-950 dark:text-rose-200">
                    Cách làm thủ công truyền thống
                  </h3>
                  <span className="text-xs text-rose-600 dark:text-rose-400">Dễ sai sót & mất thời gian</span>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Dò từng dòng sao kê ngân hàng lúc đêm muộn để biết ai đã đóng tiền ai chưa.</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Học viên hoặc khách thuê chuyển khoản không ghi nội dung, trùng tên, gửi nhầm số tiền.</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Bỏ sót buổi học, học viên nghỉ không bù, thất thoát 5-10% doanh thu mỗi tháng.</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Nhắc nợ qua tin nhắn thủ công gây ngại ngùng, thiếu tính chuyên nghiệp.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 p-3 rounded-xl bg-rose-100/50 dark:bg-rose-900/30 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              Hệ quả: Mất trung bình 20 - 30 giờ/tháng chỉ để xử lý sổ sách và đối chiếu số dư.
            </div>
          </div>

          {/* Right: TingRoster Tự động hóa */}
          <div className="p-8 sm:p-10 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/40 space-y-6 flex flex-col justify-between" data-ui>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-200">
                    Vận hành tự động cùng TingRoster
                  </h3>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">Chính xác tuyệt đối sau 0.18 giây</span>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Mã VietQR động gắn định danh duy nhất theo học viên, không thể nhầm lẫn.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Webhook Napas 24/7 bắt biến động số dư và gạch nợ hóa đơn ngay lập tức.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Điểm danh 1 chạm tại Kiosk, tự động trừ buổi hoặc tính tiền theo ca chính xác.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cổng phụ huynh minh bạch xem trực tiếp lịch học và hóa đơn mọi lúc mọi nơi.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 p-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-900/30 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-between">
              <span>Tiết kiệm ~27 giờ/tháng & 0% sai lệch sao kê</span>
              <span className="font-bold text-emerald-600">Zero-Custody 100%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
