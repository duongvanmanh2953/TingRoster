'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/components/theme/ThemeContext';

export function LandingFooter() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className="bg-slate-100 dark:bg-[#070A11] py-16 text-slate-600 dark:text-slate-400 text-sm w-full transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-sm">
            <Logo href="/" size="md" theme={isDark ? 'dark' : 'light'} showTagline={false} />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Nền tảng điểm danh một chạm và tự động đối soát giao dịch VietQR Napas 24/7 theo mô hình Zero-Custody hàng đầu tại Việt Nam.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <a href="#san-pham" className="hover:text-[#2538D9] transition-colors">
              Giải pháp
            </a>
            <a href="#roi-calculator" className="hover:text-[#2538D9] transition-colors">
              Tính ROI
            </a>
            <a href="#bang-gia" className="hover:text-[#2538D9] transition-colors">
              Bảng giá
            </a>
            <Link href="/kiosk" className="hover:text-[#2538D9] transition-colors">
              Kiosk Check-in
            </Link>
            <Link href="/login" className="hover:text-[#2538D9] transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>

        <div className="pt-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} TingRoster. Nền tảng SaaS quản lý học phí & điểm danh một chạm.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">Chính sách bảo mật</Link>
            <Link href="/terms" className="hover:underline">Điều khoản sử dụng</Link>
            <span>Hỗ trợ: hotline@tingroster.vn</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
