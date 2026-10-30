'use client';

import React from 'react';
import { Sparkles, Building2, UserPlus, QrCode, CheckCircle2 } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      num: '1',
      title: 'Tạo không gian trong 60 giây',
      desc: 'Chọn loại hình (Lớp học, CLB thể thao, Nhà trọ), thiết lập tên lớp và khung học phí mong muốn.',
      icon: Building2,
    },
    {
      num: '2',
      title: 'Thêm danh sách thành viên',
      desc: 'Import từ file Excel hoặc tạo mới. Mỗi thành viên được cấp mã định danh và mã QR cá nhân độc nhất.',
      icon: UserPlus,
    },
    {
      num: '3',
      title: 'Quét VietQR chuyển khoản',
      desc: 'Học viên quét mã VietQR tự động điền sẵn số tiền và cú pháp chuẩn Napas 24/7 từ bất kỳ ứng dụng ngân hàng nào.',
      icon: QrCode,
    },
    {
      num: '4',
      title: 'Gạch nợ tức thì sau 0.18 giây',
      desc: 'Tiền về thẳng tài khoản của bạn, hóa đơn tự động chuyển trạng thái Đã đóng đủ, sẵn sàng xuất báo cáo thuế.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="quy-trinh" className="scroll-reveal py-24 sm:py-32 relative bg-white dark:bg-[#0B0F19] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-[#2538D9] dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quy trình tinh gọn</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#101828] dark:text-white tracking-normal leading-tight">
            Vận hành thông minh qua 4 bước đơn giản
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Không cần cài đặt phần mềm phức tạp, bắt đầu quản lý ngay trên trình duyệt web của điện thoại hoặc máy tính.
          </p>
        </div>

        {/* 4 Connected Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-800 space-y-5 flex flex-col justify-between"
                data-ui
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#2538D9]/10 text-[#2538D9] dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center font-black text-lg">
                      {st.num}
                    </div>
                    <Icon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                  </div>

                  <h3 className="text-lg font-black text-[#101828] dark:text-white">{st.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="pt-2 text-[11px] font-bold text-[#2538D9] dark:text-blue-400">
                  Bước {st.num} trên 4
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
