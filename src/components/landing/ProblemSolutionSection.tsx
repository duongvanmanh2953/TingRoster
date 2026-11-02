'use client';

import React from 'react';
import { 
  XCircle, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  MessageSquare, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

export function ProblemSolutionSection() {
  return (
    <section className="problem-solution-section py-20 sm:py-28 bg-[#F5F7FB] dark:bg-[#0B0F19] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="problem-solution-header text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475467] dark:text-slate-300 text-xs font-medium">
            <span>Sự chuyển đổi vận hành</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#101828] dark:text-white leading-tight">
            Từ quản lý sổ sách thủ công sang tự động hóa 24/7
          </h2>
          <p className="text-base text-[#475467] dark:text-slate-400 font-normal leading-relaxed">
            Xem sự khác biệt rõ rệt khi cơ sở của bạn loại bỏ các bảng tính Excel phân mảnh và tin nhắn chuyển khoản rời rạc.
          </p>
        </div>

        {/* Comparison Grid: 2 Large Panels (Before vs After) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Panel 1: Trước khi dùng TingRoster (Manual Pain Points) */}
          <div className="problem-card-pain p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#111726] border border-rose-200/80 dark:border-rose-950/60 shadow-sm space-y-6 text-left relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                <XCircle className="w-4 h-4" />
                <span>Quy trình thủ công truyền thống</span>
              </span>
              <span className="text-xs text-slate-400">Tốn 15–20h/tháng</span>
            </div>

            <h3 className="text-xl font-semibold text-[#101828] dark:text-white">
              Sổ sách phân tán, sao kê ngân hàng đối chiếu mệt mỏi
            </h3>

            <div className="space-y-4 text-sm text-[#475467] dark:text-slate-400">
              <div className="problem-item-pain flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <FileSpreadsheet className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#101828] dark:text-slate-200">File Excel quá tải & dễ sai sót</p>
                  <p className="text-xs text-slate-500 mt-0.5">Nhầm lẫn học viên cùng tên, ghi sót buổi vắng, mất công tính bù tiền cuối tháng.</p>
                </div>
              </div>

              <div className="problem-item-pain flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <MessageSquare className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#101828] dark:text-slate-200">Nhắc phí qua Zalo/Tin nhắn bất tiện</p>
                  <p className="text-xs text-slate-500 mt-0.5">Học viên chuyển tiền nhưng không ghi nội dung, phải chụp màn hình kiểm tra từng người.</p>
                </div>
              </div>

              <div className="problem-item-pain flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#101828] dark:text-slate-200">Thất thoát 8% - 15% doanh thu</p>
                  <p className="text-xs text-slate-500 mt-0.5">Quên thu phí ca tập vãng lai, chậm thu tiền phòng trọ, công nợ tồn đọng không theo dõi được.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Sau khi có TingRoster (Automated Solution) */}
          <div className="problem-card-solution p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#111726] border border-blue-200/80 dark:border-blue-900/60 shadow-md space-y-6 text-left relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] dark:text-[#4F62FF] text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Giải pháp tự động hóa TingRoster</span>
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Tiết kiệm 95% thời gian</span>
            </div>

            <h3 className="text-xl font-semibold text-[#101828] dark:text-white">
              Điểm danh tự động, VietQR khớp tiền tức thì
            </h3>

            <div className="space-y-4 text-sm text-[#475467] dark:text-slate-300">
              <div className="problem-item-solution flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                <Zap className="w-5 h-5 text-[#2538D9] dark:text-[#4F62FF] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#101828] dark:text-white">Điểm danh 1 chạm tại quầy hoặc Kiosk</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Thành viên quét QR trên điện thoại, hệ thống ghi nhận buổi và trừ buổi tự động.</p>
                </div>
              </div>

              <div className="problem-item-solution flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                <CheckCircle2 className="w-5 h-5 text-[#2538D9] dark:text-[#4F62FF] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#101828] dark:text-white">VietQR Napas 24/7 gạch nợ tức thì</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mã QR động chứa sẵn mã hóa đơn và số tiền chính xác. Tiền về tài khoản là hệ thống tự gạch nợ ngay.</p>
                </div>
              </div>

              <div className="problem-item-solution flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                <ShieldCheck className="w-5 h-5 text-[#2538D9] dark:text-[#4F62FF] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#101828] dark:text-white">Cổng tra cứu công nợ minh bạch</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Phụ huynh và hội viên tự tra cứu lịch sử đóng học phí và điểm danh qua link cá nhân riêng tư.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
