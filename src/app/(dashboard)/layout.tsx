'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  QrCode,
  Users2,
  GraduationCap,
  Settings,
  LogOut,
  Search,
  Zap,
  BarChart3,
  Bot,
  ExternalLink,
  Plus,
  Menu,
  X,
  Bell,
  Sparkles,
  Tv,
  ChevronDown,
  CalendarDays,
  Wallet,
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import { BankLogo } from '@/components/common/BankLogo';
import { Logo } from '@/components/common/Logo';
import { Avatar } from '@/components/common/Avatar';
import { useTheme } from '@/components/theme/ThemeContext';

interface UserData {
  name: string;
  email: string;
  role?: string;
  bankId?: string;
  bankAccountNo?: string;
}

const PRIMARY_NAV = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/groups', label: 'Lớp học / CLB', icon: Users2 },
  { href: '/calendar', label: 'Lịch biểu & Ca dạy', icon: CalendarDays },
  { href: '/attendance', label: 'Điểm danh', icon: CalendarCheck, badge: 'Hôm nay' },
  { href: '/members', label: 'Học viên', icon: GraduationCap },
  { href: '/invoices', label: 'Học phí & Hóa đơn', icon: CreditCard },
  { href: '/transactions', label: 'Giao dịch & Đối soát', icon: QrCode, live: true },
  { href: '/reports', label: 'Báo cáo', icon: BarChart3 },
  { href: '/billing', label: 'Số dư & Nạp tiền', icon: Wallet },
  { href: '/automations', label: 'Tự động hóa', icon: Zap },
  { href: '/ai-assistant', label: 'Trợ lý AI & OCR', icon: Sparkles },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

const SECONDARY_NAV = [
  { href: '/admin', label: 'Platform Admin', icon: ShieldCheck },
  { href: '/kiosk', label: 'Kiosk quét QR tại sân', icon: Tv, external: true },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const [userData, setUserData] = useState<UserData>({
    name: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@tingroster.vn',
    role: 'Giáo viên / Admin',
    bankId: 'MB',
    bankAccountNo: '0987654321',
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.status === 401) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.data) {
          setUserData({
            name: data.data.name || 'Nguyễn Văn Minh',
            email: data.data.email || 'minh.nguyen@tingroster.vn',
            role: 'Giáo viên / Admin',
            bankId: data.data.bankId || 'MB',
            bankAccountNo: data.data.bankAccountNo || '0987654321',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/invoices?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] text-[#101828] dark:text-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-[#2538D9] selection:text-white">
      
      {/* Desktop Sidebar (Dark Navy sleek contrast per AGENTS.md) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0B0F19] border-r border-[#1B2333] flex-shrink-0 relative z-20">
        
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 gap-3 border-b border-[#1B2333]/80">
          <Logo href="/dashboard" theme="dark" size="sm" showBadge={true} badgeText="PRO" />
        </div>

        {/* Bank Connection Pill with Logo */}
        <div className="p-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#131A2B] border border-[#1E283D] text-[11px]">
            <div className="flex items-center gap-2 min-w-0">
              <BankLogo bankId={userData.bankId} size="xs" />
              <span className="font-semibold text-slate-200 truncate">{userData.bankId} • {userData.bankAccountNo}</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold ml-1 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Auto
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.live && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ting-badge-pulse" />
                )}
              </Link>
            );
          })}

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Hạ tầng mở rộng
          </div>
          {SECONDARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2538D9]/30 text-indigo-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </div>
                {item.external && <ExternalLink className="w-3 h-3 text-slate-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Quick Theme Footer */}
        <div className="p-3 border-t border-[#1B2333] bg-[#0A0D17]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#131A2B] border border-[#1E283D]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                name={userData.name}
                size="sm"
                gender="MALE"
                ageGroup="ADULT"
                status="online"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{userData.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-white/10 rounded-md transition-colors"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        {/* Global Topbar */}
        <header className="h-16 bg-white/95 dark:bg-[#0B0F19]/95 border-b border-[#E4E7EC] dark:border-[#1E293B] px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
          
          {/* Mobile menu trigger & Mobile logo */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#101828] hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Logo href="/dashboard" size="xs" variant="icon" />
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm mã TR (VD: TR84920), tên học viên, phụ huynh..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#2538D9] transition-colors"
            />
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
              className="w-8 h-8 rounded-lg bg-[#F8FAFC] dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] text-slate-600 dark:text-slate-300 hover:text-[#2538D9] dark:hover:text-amber-400 flex items-center justify-center transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/invoices"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo hóa đơn</span>
            </Link>

            <Link
              href="/transactions"
              title="Giao dịch VietQR"
              className="w-8 h-8 rounded-lg bg-[#F8FAFC] dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] text-slate-600 dark:text-slate-300 hover:text-[#2538D9] flex items-center justify-center relative transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ting-badge-pulse" />
            </Link>

            <Link
              href="/settings"
              title="Cài đặt hệ thống"
              className="w-8 h-8 rounded-lg bg-[#F8FAFC] dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] text-slate-600 dark:text-slate-300 hover:text-[#101828] dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Profile Avatar Card */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none border border-transparent hover:border-[#E4E7EC] dark:hover:border-[#1E293B]"
              >
                <Avatar
                  name={userData.name}
                  size="sm"
                  gender="MALE"
                  ageGroup="ADULT"
                  status="online"
                />
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-[#101828] dark:text-[#F8FAFC] truncate max-w-[120px]">
                    {userData.name}
                  </span>
                  <span className="text-[10px] text-[#475467] dark:text-[#94A3B8] font-medium">
                    {userData.role || 'Giáo viên / Admin'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#111726] rounded-xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xl py-1.5 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-[#101828] dark:text-[#F8FAFC]">{userData.name}</p>
                    <p className="text-[11px] text-[#475467] dark:text-slate-400 truncate">{userData.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cài đặt tài khoản</span>
                  </Link>
                  <Link
                    href="/kiosk"
                    target="_blank"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <Tv className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mở Kiosk tại sân</span>
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B0F19] border-b border-[#1B2333] px-4 py-3 space-y-1">
            {PRIMARY_NAV.concat(SECONDARY_NAV).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-[#131A2B]"
                >
                  <Icon className="w-4 h-4 text-[#6D5CE8]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Page Inner Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#0B0F19]/95 border-t border-[#E4E7EC] dark:border-[#1E293B] backdrop-blur-xl flex items-center justify-around px-2 z-40">
        <Link 
          href="/dashboard" 
          className={`flex flex-col items-center gap-1 text-[10px] ${pathname === '/dashboard' ? 'text-[#2538D9] font-bold' : 'text-slate-500'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Tổng quan</span>
        </Link>
        <Link 
          href="/attendance" 
          className={`flex flex-col items-center gap-1 text-[10px] ${pathname === '/attendance' ? 'text-[#2538D9] font-bold' : 'text-slate-500'}`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span>Điểm danh</span>
        </Link>
        <Link 
          href="/invoices" 
          className="w-10 h-10 -mt-4 rounded-full bg-[#2538D9] hover:bg-[#1E2DB8] flex items-center justify-center text-white shadow-md shadow-[#2538D9]/30 border-2 border-white dark:border-[#0B0F19] font-bold"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </Link>
        <Link 
          href="/transactions" 
          className={`flex flex-col items-center gap-1 text-[10px] ${pathname === '/transactions' ? 'text-[#2538D9] font-bold' : 'text-slate-500'}`}
        >
          <QrCode className="w-5 h-5" />
          <span>Đối soát</span>
        </Link>
        <Link 
          href="/groups" 
          className={`flex flex-col items-center gap-1 text-[10px] ${pathname === '/groups' ? 'text-[#2538D9] font-bold' : 'text-slate-500'}`}
        >
          <Users2 className="w-5 h-5" />
          <span>Lớp & CLB</span>
        </Link>
      </div>

    </div>
  );
}
