'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { ShieldCheck, Heart } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';

export function LandingFooter() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className="bg-white dark:bg-[#070A12] border-t border-[#E4E7EC] dark:border-slate-800/80 text-left transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Info (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <Logo href="/" size="md" theme={isDark ? 'dark' : 'light'} />
            <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400 font-normal leading-relaxed max-w-sm">
              Nền tảng quản lý điểm danh, thu học phí và tự động đối soát giao dịch VietQR Napas 24/7 hàng đầu tại Việt Nam theo cơ chế Zero-Custody an toàn tuyệt đối.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#475467] dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tiền vào thẳng tài khoản ngân hàng chính chủ của bạn.</span>
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-3 text-xs sm:text-sm">
            <p className="font-semibold text-[#101828] dark:text-white">Giải pháp</p>
            <ul className="space-y-2 text-[#475467] dark:text-slate-400">
              <li><a href="#mo-hinh" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">Lớp học & Dạy thêm</a></li>
              <li><a href="#mo-hinh" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">CLB Pickleball & Cầu lông</a></li>
              <li><a href="#mo-hinh" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">Phòng trọ & Căn hộ mini</a></li>
              <li><a href="#mo-hinh" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">Chuỗi cơ sở doanh nghiệp</a></li>
            </ul>
          </div>

          {/* Features Column */}
          <div className="space-y-3 text-xs sm:text-sm">
            <p className="font-semibold text-[#101828] dark:text-white">Tính năng</p>
            <ul className="space-y-2 text-[#475467] dark:text-slate-400">
              <li><a href="#tinh-nang" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">Điểm danh mã QR Kiosk</a></li>
              <li><a href="#tinh-nang" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">Đối soát VietQR 24/7</a></li>
              <li><a href="#roi-calculator" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">Ước tính hiệu quả ROI</a></li>
              <li><a href="#bang-gia" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">Biểu phí minh bạch</a></li>
            </ul>
          </div>

          {/* Legal & Account Column */}
          <div className="space-y-3 text-xs sm:text-sm">
            <p className="font-semibold text-[#101828] dark:text-white">Quy định & Tài khoản</p>
            <ul className="space-y-2 text-[#475467] dark:text-slate-400">
              <li><Link href="/login" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">Đăng nhập</Link></li>
              <li><Link href="/register" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">Đăng ký tài khoản</Link></li>
              <li><Link href="/terms" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link href="/privacy" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">Chính sách quyền riêng tư</Link></li>
              <li><Link href="/refund" className="hover:text-[#2538D9] dark:hover:text-white transition-colors">Chính sách hoàn tiền</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#EAECF0] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#667085] dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} TingRoster Platform. Đã đăng ký bản quyền.</p>
          <p className="flex items-center gap-1">
            <span>Điểm danh một chạm • Thu phí tự động • Đối soát khỏi lo</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
