'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LogIn, ArrowRight, Menu, X, Sun, Moon } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/components/theme/ThemeContext';

export function LandingHeader() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#E4E7EC] dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="shrink-0">
          <Logo href="/" size="md" theme={isDark ? 'dark' : 'light'} showTagline={false} />
        </div>

        {/* Clean, spacious desktop nav */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-medium tracking-normal text-slate-600 dark:text-slate-300">
          <a href="#giai-phap" className="hover:text-[#2538D9] dark:hover:text-[#4F62FF] transition-colors py-2">
            Giải pháp
          </a>
          <a href="#mo-hinh" className="hover:text-[#2538D9] dark:hover:text-[#4F62FF] transition-colors py-2">
            Mô hình áp dụng
          </a>
          <a href="#tinh-nang" className="hover:text-[#2538D9] dark:hover:text-[#4F62FF] transition-colors py-2">
            Tính năng cốt lõi
          </a>
          <a href="#roi-calculator" className="hover:text-[#2538D9] dark:hover:text-[#4F62FF] transition-colors py-2">
            Ước tính hiệu quả
          </a>
          <a href="#bang-gia" className="hover:text-[#2538D9] dark:hover:text-[#4F62FF] transition-colors py-2">
            Biểu phí
          </a>
        </nav>

        {/* Header Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Chuyển đổi giao diện sáng tối"
            className="p-2.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            href="/login"
            className="hidden sm:inline-flex px-3.5 py-2 rounded-lg text-sm font-medium text-[#344054] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors items-center gap-1.5"
          >
            <LogIn className="w-4 h-4 text-[#2538D9] dark:text-[#4F62FF]" />
            <span>Đăng nhập</span>
          </Link>

          <Link
            href="/register"
            className="inline-flex px-4 sm:px-5 py-2 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] dark:bg-[#4F62FF] dark:hover:bg-[#3E51E8] text-white text-sm font-medium items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>Bắt đầu ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Mở danh mục điều hướng"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0B0F19] px-6 py-5 space-y-4 border-b border-[#E4E7EC] dark:border-slate-800">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            <a
              href="#giai-phap"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#2538D9] py-1.5"
            >
              Giải pháp chuyên biệt
            </a>
            <a
              href="#mo-hinh"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#2538D9] py-1.5"
            >
              Mô hình áp dụng
            </a>
            <a
              href="#tinh-nang"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#2538D9] py-1.5"
            >
              Tính năng cốt lõi
            </a>
            <a
              href="#roi-calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#2538D9] py-1.5"
            >
              Ước tính hiệu quả ROI
            </a>
            <a
              href="#bang-gia"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#2538D9] py-1.5"
            >
              Biểu phí minh bạch
            </a>
          </nav>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
            <Link
              href="/login"
              className="w-full text-center py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-[#101828] dark:text-white"
            >
              Đăng nhập tài khoản
            </Link>
            <Link
              href="/register"
              className="w-full text-center py-2.5 rounded-lg bg-[#2538D9] text-white text-sm font-medium"
            >
              Tạo tài khoản miễn phí
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
