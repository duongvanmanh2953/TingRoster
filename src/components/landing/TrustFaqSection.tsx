'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

const FAQS = [
  {
    q: 'TingRoster phù hợp với những ai?',
    a: 'TingRoster được thiết kế chuyên biệt cho 3 nhóm đối tượng chính: (1) Giáo viên dạy thêm và trung tâm ngoại ngữ/năng khiếu; (2) Chủ câu lạc bộ thể thao như Pickleball, Cầu lông, Bóng đá, Gym, Yoga; (3) Chủ phòng trọ hoặc căn hộ dịch vụ mini cần chốt điện nước và đối soát hóa đơn.',
  },
  {
    q: 'Học viên và hội viên có bắt buộc phải tải app về điện thoại không?',
    a: 'Hoàn toàn KHÔNG. TingRoster hoạt động 100% trên nền tảng Web App Responsive tối ưu cho điện thoại. Học viên chỉ cần quét mã QR tại quầy bằng camera điện thoại có sẵn hoặc truy cập đường link cá nhân để xem lịch và bảng đối soát.',
  },
  {
    q: 'Cơ chế "Zero-Custody" bảo vệ tiền của tôi như thế nào?',
    a: 'TingRoster không phải là ví điện tử hay cổng trung gian thu hộ tiền. Mã VietQR động trên hóa đơn chứa trực tiếp số tài khoản ngân hàng chính chủ của bạn (MB, VCB, Techcombank...). Khi học viên quét mã chuyển tiền, tiền vào thẳng tài khoản ngân hàng của bạn ngay lập tức. TingRoster chỉ nhận tín hiệu biến động số dư qua Webhook để tự động gạch nợ.',
  },
  {
    q: 'Hệ thống hỗ trợ những ngân hàng nào tại Việt Nam?',
    a: 'Hệ thống hỗ trợ 100% các ngân hàng thành viên trong mạng lưới Napas 24/7 tại Việt Nam: MBBank, Vietcombank, Techcombank, ACB, VPBank, TPBank, BIDV, Agribank, OCB, Sacombank và các ngân hàng số.',
  },
  {
    q: 'Tôi có thể quản lý nhiều lớp học hoặc nhiều sân bóng khác nhau không?',
    a: 'Có. Bạn có thể tạo nhiều Không gian (Space) độc lập trên cùng một tài khoản quản lý: ví dụ vừa có lớp học Toán 12A, vừa có CLB Cầu Lông, vừa có Tòa nhà dịch vụ cho thuê với cấu hình module và tài khoản nhận tiền độc lập.',
  },
  {
    q: 'Dữ liệu thành viên và tài chính của tôi có được bảo mật không?',
    a: 'Dữ liệu được mã hóa và phân quyền nghiêm ngặt theo vai trò (RBAC). Học viên chỉ thấy dữ liệu cá nhân của mình, nhân viên chỉ được phép điểm danh, và chỉ có Chủ tài khoản (Owner) mới có quyền truy cập vào báo cáo doanh thu tài chính.',
  },
];

export function TrustFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 sm:py-28 bg-[#F5F7FB] dark:bg-[#0B0F19] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475467] dark:text-slate-300 text-xs font-medium">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Giải đáp thắc mắc</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#101828] dark:text-white leading-tight">
            Những câu hỏi thường gặp
          </h2>
          <p className="text-base text-[#475467] dark:text-slate-400 font-normal leading-relaxed">
            Mọi điều bạn cần biết trước khi bắt đầu sử dụng nền tảng TingRoster.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5 text-left">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-medium text-[#101828] dark:text-white">
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-blue-50 text-[#2538D9] dark:bg-blue-950 dark:text-[#4F62FF]' : 'text-slate-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#475467] dark:text-slate-300 font-normal leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Note */}
        <div className="mt-10 p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-4 text-xs text-[#344054] dark:text-slate-300">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#2538D9] dark:text-[#4F62FF] shrink-0" />
            <span>Bạn có câu hỏi riêng về mô hình của mình? Đội ngũ TingRoster luôn sẵn sàng đồng hành.</span>
          </div>
          <a
            href="mailto:support@tingroster.vn"
            className="font-semibold text-[#2538D9] dark:text-[#4F62FF] hover:underline shrink-0"
          >
            Liên hệ hỗ trợ &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}
