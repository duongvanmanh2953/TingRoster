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
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  QrCode,
  KeyRound,
  Camera,
  Clock
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Avatar } from '@/components/common/Avatar';
import { useTheme } from '@/components/theme/ThemeContext';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { LanguageSwitch } from '@/components/i18n/LanguageSwitch';
import { NotificationBellPopover } from '@/components/notifications/NotificationBellPopover';
import { usePageTitle } from '@/hooks/usePageTitle';

interface PortalNavProps {
  children: React.ReactNode;
}

interface NavSection {
  titleVi: string;
  titleEn: string;
  items: Array<{
    labelVi: string;
    labelEn: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

const PORTAL_NAV_SECTIONS: NavSection[] = [
  {
    titleVi: 'Học tập & Vận hành',
    titleEn: 'Learning & Schedule',
    items: [
      { labelVi: 'Tổng quan học tập', labelEn: 'Overview', href: '/portal', icon: LayoutDashboard },
      { labelVi: 'Quét mã QR', labelEn: 'Scan Action QR', href: '/portal/scan', icon: Camera, badge: 'Camera' },
      { labelVi: 'Mã QR của tôi', labelEn: 'My QR Code', href: '/portal/qr', icon: QrCode },
      { labelVi: 'Không gian & Nhóm của tôi', labelEn: 'My Spaces & Groups', href: '/portal/groups', icon: Users2 },
      { labelVi: 'Tham gia không gian', labelEn: 'Join Space', href: '/portal/join', icon: KeyRound },
      { labelVi: 'Kích hoạt tài khoản', labelEn: 'Claim Account', href: '/portal/claim', icon: ShieldCheck },
      { labelVi: 'Lịch sử điểm danh', labelEn: 'Attendance History', href: '/portal/attendance', icon: CalendarCheck2 },
      { labelVi: 'Ca làm & Chấm công', labelEn: 'Shifts & Attendance', href: '/portal/shifts', icon: Clock },
    ],
  },
  {
    titleVi: 'Tài chính & Pháp lý',
    titleEn: 'Finance & Legal',
    items: [
      { labelVi: 'Khoản phải đóng', labelEn: 'Tuition & Fees', href: '/portal/fees', icon: Receipt, badge: 'VietQR' },
      { labelVi: 'Hợp đồng & Ký điện tử', labelEn: 'Contracts & E-Sign', href: '/portal/contracts', icon: FileText, badge: 'E-Sign' },
    ],
  },
  {
    titleVi: 'Kết nối & Cá nhân',
    titleEn: 'Communication & Profile',
    items: [
      { labelVi: 'Tin nhắn & Trao đổi', labelEn: 'Chat & Messages', href: '/portal/chat', icon: MessageSquare },
      { labelVi: 'Hồ sơ cá nhân', labelEn: 'My Profile', href: '/portal/profile', icon: UserCheck },
      { labelVi: 'Hướng dẫn & Hỏi đáp', labelEn: 'Help & FAQs', href: '/portal/help', icon: HelpCircle },
    ],
  },
];

export default function PortalLayout({ children }: PortalNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { locale, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = (path: string, loc: string): string => {
    if (path === '/portal') return loc === 'en' ? 'Student Portal - Overview' : 'Cổng Học Viên - Tổng quan';
    if (path === '/portal/scan') return loc === 'en' ? 'Scan Action QR' : 'Quét Mã QR Hành Động';
    if (path === '/portal/qr') return loc === 'en' ? 'My Check-in QR' : 'Mã QR Điểm Danh Cá Nhân';
    if (path.startsWith('/portal/groups')) return loc === 'en' ? 'My Spaces & Groups' : 'Không gian & Nhóm của tôi';
    if (path.startsWith('/portal/fees')) return loc === 'en' ? 'Tuition & Payment' : 'Khoản phải đóng & Học phí';
    if (path.startsWith('/portal/attendance')) return loc === 'en' ? 'Attendance History' : 'Lịch sử Điểm danh';
    if (path.startsWith('/portal/shifts')) return loc === 'en' ? 'Work Shifts' : 'Ca làm & Chấm công';
    if (path.startsWith('/portal/chat')) return loc === 'en' ? 'Chat & Communication' : 'Tin nhắn & Trao đổi';
    if (path.startsWith('/portal/profile')) return loc === 'en' ? 'My Profile' : 'Hồ sơ cá nhân';
    if (path.startsWith('/portal/help')) return loc === 'en' ? 'Help & Guides' : 'Hướng dẫn & Hỏi đáp';
    return loc === 'en' ? 'Member Portal' : 'Cổng Học Viên';
  };

  usePageTitle(getPageTitle(pathname, 'vi'), getPageTitle(pathname, 'en'));

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/login');
  };

  const renderNavLinks = (closeDrawer?: () => void) => (
    <nav className="flex-1 px-3 space-y-4 overflow-y-auto py-2">
      {PORTAL_NAV_SECTIONS.map((section) => (
        <div key={section.titleVi} className="space-y-1">
          <div className="px-2 pt-2 pb-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
            {locale === 'en' ? section.titleEn : section.titleVi}
          </div>
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const label = locale === 'en' ? item.labelEn : item.labelVi;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeDrawer}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                  ? 'bg-[#2538D9] text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span className="truncate">{label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Cross link to Owner / Public */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <Link
          href="/legal"
          onClick={closeDrawer}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <FileText className="w-4 h-4 text-slate-400" />
          <span>{locale === 'en' ? 'Terms & Policies' : 'Điều khoản & Chính sách'}</span>
        </Link>
      </div>
    </nav>
  );

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F5F7FB] dark:bg-[#0B0F19] text-[#101828] dark:text-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-[#2538D9] selection:text-white">
      {/* Desktop Sidebar (Fixed 256px) */}
      <aside className="hidden md:flex flex-col w-64 h-screen flex-shrink-0 bg-white dark:bg-[#111726] border-r border-[#E4E7EC] dark:border-[#1E293B] shadow-xs transition-colors duration-200 z-20 overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 flex-shrink-0 flex items-center px-5 border-b border-[#E4E7EC] dark:border-[#1E293B]">
          <Logo href="/portal" size="sm" showBadge={true} badgeText="HỌC VIÊN" />
        </div>

        {/* Student Quick Identity Card */}
        <div className="p-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#131A2B] border border-slate-200 dark:border-[#1E283D] flex items-center gap-2.5">
            <Avatar name="Nguyễn Hoàng Nam" size="sm" gender="MALE" ageGroup="TEEN" status="online" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Nguyễn Hoàng Nam
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Mã: HV-2026-084 • Toán 12A
              </p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        {renderNavLinks()}

        {/* Footer Utilities */}
        <div className="p-3 border-t border-[#E4E7EC] dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#0A0D17] space-y-2">
          {/* Quick Pay CTA */}
          <Link
            href="/portal/fees"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{locale === 'en' ? 'Pay Tuition (VietQR)' : 'Thanh toán học phí VietQR'}</span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors bg-white/80 dark:bg-slate-900/80"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation (Off-canvas) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-xs h-full bg-white dark:bg-[#111726] border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
              <Logo href="/portal" size="sm" showBadge={false} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#131A2B] border border-slate-200 dark:border-[#1E283D] flex items-center gap-2.5">
                <Avatar name="Nguyễn Hoàng Nam" size="sm" gender="MALE" ageGroup="TEEN" status="online" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Nguyễn Hoàng Nam
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    HV-2026-084 • Toán 12A
                  </p>
                </div>
              </div>
            </div>

            {renderNavLinks(() => setMobileMenuOpen(false))}

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <LanguageSwitch variant="select" />
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Header */}
        <header className="h-16 flex-shrink-0 bg-white/95 dark:bg-[#111726]/95 border-b border-[#E4E7EC] dark:border-[#1E293B] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{getPageTitle(pathname, locale)}</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {locale === 'en'
                  ? 'Real-time tuition verification & attendance tracking'
                  : 'Nền tảng kiểm tra học phí VietQR và chuyên cần trực tuyến'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <LanguageSwitch variant="select" />
            <NotificationBellPopover />
            <Link
              href="/portal/fees"
              className="h-9 flex items-center gap-1.5 px-3 rounded-lg bg-[#2538D9] text-white hover:bg-[#1E2DB8] text-xs font-bold shadow-xs transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">VietQR Pay</span>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors bg-white/80 dark:bg-slate-900/80 shadow-2xs"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (Section 8.1 & 16 of Architecture) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111726]/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-3 py-1.5 flex items-center justify-around shadow-lg">
          <Link
            href="/portal"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${pathname === '/portal'
              ? 'text-[#2538D9] dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Tổng quan</span>
          </Link>

          <Link
            href="/portal/fees"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${pathname.startsWith('/portal/fees')
              ? 'text-[#2538D9] dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            <span>Học phí</span>
          </Link>

          {/* Central Highlighted QR Button */}
          <Link
            href="/portal/scan"
            className="flex flex-col items-center justify-center -mt-4"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${pathname === '/portal/scan' || pathname === '/portal/qr'
              ? 'bg-gradient-to-tr from-[#2538D9] to-[#6D5CE8] text-white ring-4 ring-[#2538D9]/20 shadow-[#2538D9]/40'
              : 'bg-[#2538D9] text-white shadow-[#2538D9]/30'
              }`}>
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-[#2538D9] dark:text-indigo-400 mt-1">Quét QR</span>
          </Link>

          <Link
            href="/portal/attendance"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${pathname.startsWith('/portal/attendance')
              ? 'text-[#2538D9] dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            <CalendarCheck2 className="w-5 h-5 mb-0.5" />
            <span>Điểm danh</span>
          </Link>

          <Link
            href="/portal/profile"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${pathname.startsWith('/portal/profile')
              ? 'text-[#2538D9] dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            <UserCheck className="w-5 h-5 mb-0.5" />
            <span>Cá nhân</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
