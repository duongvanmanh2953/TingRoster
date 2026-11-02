'use client';

import React from 'react';
import { 
  Building2, 
  UserPlus, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    step: '1',
    title: 'Khởi tạo không gian quản lý',
    desc: 'Chọn mô hình phù hợp (Lớp học, CLB thể thao, Nhà trọ) và nhập tài khoản ngân hàng chính chủ của bạn để nhận tiền.',
    icon: Building2,
  },
  {
    step: '2',
    title: 'Thêm danh sách thành viên',
    desc: 'Tải file Excel danh sách lên hoặc gửi link/mã QR để học viên và người thuê phòng tự đăng ký tham gia.',
    icon: UserPlus,
  },
  {
    step: '3',
    title: 'Điểm danh 1 chạm tại cơ sở',
    desc: 'Thành viên quét mã QR tại quầy hoặc Kiosk tự phục vụ. Hệ thống ghi nhận có mặt và tự động trừ buổi.',
    icon: QrCode,
  },
  {
    step: '4',
    title: 'Hệ thống sinh mã VietQR Napas',
    desc: 'Hóa đơn học phí hoặc tiền phòng được gửi kèm mã VietQR chứa sẵn số tiền và mã hóa đơn chính xác.',
    icon: CreditCard,
  },
  {
    step: '5',
    title: 'Tự động đối soát & Gạch nợ',
    desc: 'Ngay khi có biến động số dư ngân hàng, TingRoster đối soát tự động gạch nợ 24/7 mà không cần chụp ảnh sao kê.',
    icon: CheckCircle2,
  },
];

export function HowItWorksSection() {
  return (
    <section className="how-it-works-section py-20 sm:py-28 bg-[#F5F7FB] dark:bg-[#0B0F19] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="how-header text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475467] dark:text-slate-300 text-xs font-medium">
            <span>Quy trình 5 bước đơn giản</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#101828] dark:text-white leading-tight">
            Cách thức TingRoster vận hành cùng bạn
          </h2>
          <p className="text-base text-[#475467] dark:text-slate-400 font-normal leading-relaxed">
            Thiết lập dễ dàng chỉ trong 3 phút, không cần cài đặt phần mềm máy chủ hay thiết bị chuyên dụng đắt đỏ.
          </p>
        </div>

        {/* Timeline Steps */}
        <div className="how-steps-grid grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 text-left relative">
          {/* Animated Connecting Line on Desktop */}
          <div className="hidden lg:block absolute top-[44px] left-[8%] right-[8%] h-[2px] bg-slate-200 dark:bg-slate-800 z-0 pointer-events-none">
            <div className="how-progress-bar h-full bg-gradient-to-r from-[#2538D9] via-[#6D5CE8] to-[#2538D9] origin-left scale-x-0" />
          </div>

          {STEPS.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div 
                key={idx}
                className="how-step-card p-6 rounded-2xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-3 relative flex flex-col justify-between z-10"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 text-[#2538D9] dark:text-[#4F62FF] text-xs font-semibold flex items-center justify-center">
                      {st.step}
                    </span>
                    <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#101828] dark:text-white leading-snug">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#475467] dark:text-slate-400 font-normal leading-relaxed mt-2">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2538D9] dark:text-[#4F62FF] hover:underline"
          >
            <span>Bắt đầu trải nghiệm ngay quy trình tự động hóa</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
