'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users2,
  Receipt,
  CalendarCheck2,
  MessageSquare,
  UserCheck,
  LogOut,
  HelpCircle,
  FileText,
  Menu,
  X,
  CreditCard,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/components/theme/ThemeContext';

interface PortalNavProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Tổng quan', href: '/portal', icon: LayoutDashboard },
    { label: 'Nhóm của tôi', href: '/portal/groups', icon: Users2 },
    { label: 'Khoản phải đóng', href: '/portal/fees', icon: Receipt },
    { label: 'Điểm danh', href: '/portal/attendance', icon: CalendarCheck2 },
    { label: 'Tin nhắn & Chat', href: '/portal/chat', icon: MessageSquare },
    { label: 'Hồ sơ cá nhân', href: '/portal/profile', icon: UserCheck },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] dark:bg-[#0B0F19] text-[#111827] dark:text-[#F8FAFC] flex flex-col font-sans selection:bg-[#2538D9] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#111726] border-b border-[#E5E7EB] dark:border-[#1E293B] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <Logo href="/portal" size="sm" showTagline={false} />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cổng Học Viên / Hội Viên
            </span>
          </div>

          {/* Desktop Top Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-[#2538D9] text-white shadow-xs'
                      : 'text-[#4B5563] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/portal/fees"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#2538D9] dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 text-xs font-bold hover:bg-indigo-100 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>VietQR Pay</span>
            </Link>

            <Link
              href="/legal"
              title="Điều khoản & Chính sách"
              className="w-9 h-9 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] text-slate-500 hover:text-[#111827] dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <FileText className="w-4 h-4" />
            </Link>

            <button
              onClick={toggleTheme}
              title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
              className="w-9 h-9 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] text-slate-500 hover:text-[#111827] dark:hover:text-white flex items-center justify-center transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="w-9 h-9 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] text-slate-700 dark:text-slate-200 flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] dark:border-[#1E293B] bg-white dark:bg-[#111726] p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-[#2538D9] text-white'
                      : 'text-[#4B5563] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-12">
        {children}
      </main>

      {/* Mobile Bottom Fixed Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111726]/95 backdrop-blur-md border-t border-[#E5E7EB] dark:border-[#1E293B] px-3 py-2 flex items-center justify-around shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-[#2538D9] dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#2538D9] dark:text-indigo-400' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
