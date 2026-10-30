'use client';

import React, { useState } from 'react';
import { ChevronRight, ShieldCheck, HelpCircle, Lock } from 'lucide-react';

export function TrustFaqSection() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'TingRoster có giữ tiền học phí hay tiền phòng của tôi không?',
      a: 'Tuyệt đối không. Tiền do học viên hoặc khách thuê chuyển khoản sẽ vào trực tiếp 100% tài khoản ngân hàng chính chủ của bạn (MB, Vietcombank, Techcombank...). TingRoster hoạt động theo mô hình Zero-Custody, chỉ nhận diện biến động số dư qua webhook để tự động gạch nợ.',
    },
    {
      q: 'Học viên hoặc khách thuê chuyển khoản sai cú pháp thì xử lý thế nào?',
      a: 'Hệ thống lưu trữ toàn bộ giao dịch vào mục Đối soát chưa khớp. Bạn chỉ cần 1 cú click để gán thủ công giao dịch đó vào đúng học viên mà không bao giờ bị thất thoát tiền.',
    },
    {
      q: 'Tôi có thể xuất dữ liệu để nộp thuế theo Thông tư 88/2021 và 40/2021 không?',
      a: 'Có. TingRoster tích hợp sẵn mẫu bảng kê doanh thu Mẫu 01-1/BK-HDKD và sổ chi tiết doanh thu S1-HKD, S2-HKD chuẩn mực của Bộ Tài chính, giúp bạn xuất file Excel đầy đủ để kê khai thuế nhanh chóng.',
    },
    {
      q: 'Màn hình Kiosk điểm danh hoạt động ra sao nếu tôi chỉ có điện thoại hoặc máy tính bảng cũ?',
      a: 'Bạn chỉ cần mở trình duyệt web trên bất kỳ máy tính bảng, điện thoại hoặc laptop nào có camera và truy cập đường link Kiosk của cơ sở. Không cần mua máy quét chuyên dụng đắt tiền.',
    },
    {
      q: 'Phụ huynh có cần phải tải app hoặc tạo tài khoản để xem công nợ không?',
      a: 'Không cần. Phụ huynh chỉ cần truy cập vào đường link Cổng phụ huynh bảo mật bằng mã token riêng do bạn chia sẻ để xem ngay lịch học và quét mã VietQR thanh toán tiện lợi.',
    },
    {
      q: 'Tôi có được hỗ trợ cài đặt và nhập danh sách học viên ban đầu không?',
      a: 'Có. Đội ngũ chuyên viên kỹ thuật của TingRoster luôn sẵn sàng hỗ trợ bạn import danh sách học viên từ file Excel, kết nối tài khoản ngân hàng và cấu hình biểu phí hoàn toàn miễn phí qua Zalo và Hotline 24/7.',
    },
  ];

  return (
    <section id="huong-dan" className="scroll-reveal py-24 sm:py-32 bg-slate-50/50 dark:bg-[#070A11] w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-[#2538D9] dark:text-blue-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Giải đáp thắc mắc</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#101828] dark:text-white tracking-normal leading-tight">
            Câu hỏi thường gặp
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-[60ch] mx-auto">
            Những thông tin cốt lõi giúp bạn hoàn toàn an tâm khi đưa cơ sở vào vận hành tự động.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-800 transition-colors"
                data-ui
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-base sm:text-lg text-[#101828] dark:text-white">
                    {faq.q}
                  </span>
                  <ChevronRight
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-90 text-[#2538D9]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
