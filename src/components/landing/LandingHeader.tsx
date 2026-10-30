'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LogIn, Zap, RefreshCw, Menu, X, Sun, Moon } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/components/theme/ThemeContext';

interface LandingHeaderProps {
  onInstantDemo: () => Promise<void>;
  isDemoLoggingIn: boolean;
}

export function LandingHeader({ onInstantDemo, isDemoLoggingIn }: LandingHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-[#0B0F19] sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="shrink-0">
          <Logo href="/" size="md" theme={isDark ? 'dark' : 'light'} showTagline={false} />
        </div>

        {/* Clean, spacious desktop nav */}
        <nav className="hidden md:flex items-center gap-10 lg:gap-12 text-sm font-semibold tracking-normal text-slate-600 dark:text-slate-300">
          <a href="#san-pham" className="hover:text-[#2538D9] dark:hover:text-white transition-colors py-2">
            Giải pháp
          </a>
          <a href="#roi-calculator" className="hover:text-[#2538D9] dark:hover:text-white transition-colors py-2">
            Tính ROI
          </a>
          <a href="#bang-gia" className="hover:text-[#2538D9] dark:hover:text-white transition-colors py-2">
            Bảng giá
          </a>
        </nav>

        {/* Header Action CTAs */}
        <div className="flex items-center gap-2.5 sm:gap-3">
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
            className="hidden sm:inline-flex px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold text-[#101828] dark:text-white transition-colors items-center gap-1.5"
          >
            <LogIn className="w-4 h-4 text-[#2538D9]" />
            <span>Đăng nhập</span>
          </Link>

          <button
            type="button"
            onClick={onInstantDemo}
            disabled={isDemoLoggingIn}
            className="inline-flex px-4 sm:px-5 py-2.5 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-sm font-bold items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            {isDemoLoggingIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang vào...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current text-amber-300" />
                <span>Vào Demo</span>
              </>
            )}
          </button>

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
        <div className="md:hidden bg-white dark:bg-[#0B0F19] px-6 py-5 space-y-4">
          <nav className="flex flex-col space-y-3 text-base font-semibold text-slate-700 dark:text-slate-200">
            <a
              href="#san-pham"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#2538D9] py-1"
            >
              Giải pháp chuyên biệt
            </a>
            <a
              href="#roi-calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#2538D9] py-1"
            >
              Ước tính hiệu quả ROI
            </a>
            <a
              href="#bang-gia"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#2538D9] py-1"
            >
              Biểu phí minh bạch
            </a>
            <Link
              href="/kiosk"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#2538D9] font-bold py-1"
            >
              Mở Kiosk Check-in sân
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
