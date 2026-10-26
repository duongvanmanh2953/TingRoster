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
  Tv,
  Settings,
  LogOut,
  Bell,
  Search,
  Zap,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Plus,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { BankLogo } from '@/components/common/BankLogo';

interface UserData {
  name: string;
  email: string;
  bankId?: string;
  bankAccountNo?: string;
}

const PRIMARY_NAV = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/attendance', label: 'Điểm danh 1 chạm', icon: CalendarCheck, badge: 'Hôm nay' },
  { href: '/invoices', label: 'Học phí & Hóa đơn', icon: CreditCard },
  { href: '/transactions', label: 'Đối soát VietQR', icon: QrCode, live: true },
  { href: '/groups', label: 'Lớp học & CLB', icon: Users2 },
  { href: '/members', label: 'Học viên & Hội viên', icon: GraduationCap },
];

const SECONDARY_NAV = [
  { href: '/kiosk', label: 'Màn hình Kiosk', icon: Tv, external: true },
  { href: '/reports', label: 'Báo cáo doanh thu', icon: BarChart3 },
  { href: '/automations', label: 'Tự động nhắc nợ', icon: Zap },
  { href: '/settings', label: 'Cài đặt ngân hàng', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    name: 'Cô Mai Hương',
    email: 'huong.mai@tingroster.vn',
    bankId: 'MB',
    bankAccountNo: '0987654321',
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            name: data.data.name || 'Người dùng TingRoster',
            email: data.data.email || 'user@tingroster.vn',
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
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0B0F19] border-r border-[#1B2333] flex-shrink-0 relative z-20">
        
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 gap-3 border-b border-[#1B2333]">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400 font-black text-lg">
            ⚡
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-white tracking-tight">TingRoster</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Đối soát VietQR tự động</p>
          </div>
        </div>

        {/* Bank Connection Pill with Logo */}
        <div className="p-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#111726] border border-[#1E283D] text-[11px]">
            <div className="flex items-center gap-2 min-w-0">
              <BankLogo bankId={userData.bankId} size="xs" />
              <span className="font-semibold text-slate-200 truncate">{userData.bankId} {userData.bankAccountNo}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold ml-1 flex-shrink-0">Live</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quản lý cốt lõi
          </div>
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131A2B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {item.badge}
                  </span>
                )}
                {item.live && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Auto
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 pb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Mở rộng & Công cụ
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
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131A2B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </div>
                {item.external && <ExternalLink className="w-3 h-3 text-slate-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-[#1B2333] bg-[#0A0D17]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#111726] border border-[#1E283D]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
                {userData.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{userData.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{userData.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        {/* Global Topbar */}
        <header className="h-16 bg-[#0B0F19]/90 border-b border-[#1B2333] px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-xl">
          
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#131A2B]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã thanh toán (VD: TR84920), tên học viên, lớp..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111726] border border-[#1E283D] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tạo hóa đơn</span>
            </Link>

            <Link
              href="/transactions"
              title="Giao dịch VietQR"
              className="w-9 h-9 rounded-xl bg-[#111726] border border-[#1E283D] text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 flex items-center justify-center relative transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 right-2 ting-badge-pulse" />
            </Link>

            <Link
              href="/settings"
              title="Cài đặt hệ thống"
              className="w-9 h-9 rounded-xl bg-[#111726] border border-[#1E283D] text-slate-300 hover:text-white hover:bg-[#182136] flex items-center justify-center transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-[#1B2333]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">
                {userData.name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-slate-200 hidden sm:inline">{userData.name}</span>
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
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Page Inner Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0B0F19]/95 border-t border-[#1B2333] backdrop-blur-xl flex items-center justify-around px-2 z-40">
        <Link 
          href="/dashboard" 
          className={`flex flex-col items-center gap-1 text-[10px] ${pathname === '/dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Tổng quan</span>
        </Link>
        <Link 
          href="/attendance" 
          className={`flex flex-col items-center gap-1 text-[10px] ${pathname === '/attendance' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span>Điểm danh</span>
        </Link>
        <Link 
          href="/invoices" 
          className="w-11 h-11 -mt-5 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-[#080C14] shadow-lg shadow-emerald-500/30 border-2 border-[#080C14] font-bold"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </Link>
        <Link 
          href="/transactions" 
          className={`flex flex-col items-center gap-1 text-[10px] ${pathname === '/transactions' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <QrCode className="w-5 h-5" />
          <span>Đối soát</span>
        </Link>
        <Link 
          href="/groups" 
          className={`flex flex-col items-center gap-1 text-[10px] ${pathname === '/groups' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <Users2 className="w-5 h-5" />
          <span>Lớp & CLB</span>
        </Link>
      </div>

    </div>
  );
}
