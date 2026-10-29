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
  ExternalLink,
  Plus,
  Menu as MenuIcon,
  X,
  Sparkles,
  Tv,
  ChevronDown,
  CalendarDays,
  Wallet,
  ShieldCheck,
  Moon,
  Sun,
  Bell,
  HelpCircle,
  Building2,
  Receipt,
  Download,
  Workflow,
  Palette,
  Layers,
  ArrowLeft,
  ArrowRightLeft
} from 'lucide-react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';

import {
  TrendingUp,
  Clock,
  Languages
} from 'lucide-react';
import { BankLogo } from '@/components/common/BankLogo';
import { Logo } from '@/components/common/Logo';
import { Avatar } from '@/components/common/Avatar';
import { SpaceAvatar } from '@/components/common/SpaceAvatar';
import { parseEnabledModules } from '@/lib/spaces/constants';
import { TingBadge, TingTag } from '@/components/common/Badge';
import { QuickCreateInvoiceModal } from '@/components/invoices/QuickCreateInvoiceModal';
import { useTheme } from '@/components/theme/ThemeContext';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { LanguageSwitch } from '@/components/i18n/LanguageSwitch';
import { NotificationBellPopover } from '@/components/notifications/NotificationBellPopover';

interface UserData {
  name: string;
  email: string;
  role?: string;
  bankId?: string;
  bankAccountNo?: string;
  logoUrl?: string;
}

interface NavSubItem {
  href: string;
  label: string;
  labelEn?: string;
  badge?: string;
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'info' | 'brand';
  live?: boolean;
  external?: boolean;
}

interface NavGroupItem {
  id: string;
  href?: string;
  label: string;
  labelEn?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'info' | 'brand';
  live?: boolean;
  billingOnly?: boolean;
  adminOnly?: boolean;
  external?: boolean;
  subItems?: NavSubItem[];
}

interface NavCategory {
  title: string;
  titleEn?: string;
  items: NavGroupItem[];
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    title: 'Tổng quan',
    titleEn: 'Overview',
    items: [
      {
        id: 'overview',
        href: '/dashboard',
        label: 'Bảng điều khiển',
        labelEn: 'Dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Vận hành & Quản lý',
    titleEn: 'Operations & Management',
    items: [
      {
        id: 'management',
        label: 'Quản lý',
        labelEn: 'Management',
        icon: Building2,
        subItems: [
          { href: '/groups', label: 'Không gian của tôi', labelEn: 'My Spaces' },
          { href: '/members', label: 'Thành viên', labelEn: 'Members' },
          { href: '/attendance', label: 'Lịch & Điểm danh', labelEn: 'Attendance & Schedule', badge: 'Hôm nay', badgeVariant: 'success' },
          { href: '/workflows', label: 'Quy trình vận hành', labelEn: 'Workflows & Rules' },
        ],
      },
    ],
  },
  {
    title: 'Tài chính & Thu phí',
    titleEn: 'Finance & Payments',
    items: [
      {
        id: 'finance',
        label: 'Tài chính',
        labelEn: 'Finance',
        icon: CreditCard,
        subItems: [
          { href: '/invoices', label: 'Khoản thu', labelEn: 'Collections' },
          { href: '/transactions', label: 'Giao dịch VietQR', labelEn: 'VietQR Transactions', live: true },
          { href: '/documents', label: 'Hóa đơn & Chứng từ', labelEn: 'Receipts & Documents' },
        ],
      },
    ],
  },
  {
    title: 'Báo cáo & Phân tích',
    titleEn: 'Reports & Analytics',
    items: [
      {
        id: 'reports',
        label: 'Tổng quan báo cáo',
        labelEn: 'Reports Overview',
        icon: BarChart3,
        subItems: [
          { href: '/reports', label: 'Tổng quan báo cáo', labelEn: 'Report Overview' },
          { href: '/reports/cashflow', label: 'Báo cáo khoản thu', labelEn: 'Collections Report' },
          { href: '/reports/aging', label: 'Báo cáo công nợ', labelEn: 'Debt & Receivables' },
          { href: '/reports/attendance', label: 'Báo cáo điểm danh', labelEn: 'Attendance Analytics' },
          { href: '/reports/tax', label: 'Báo cáo thuế TT 40', labelEn: 'Tax Estimate TT 40' },
          { href: '/reports/reconciliation', label: 'Báo cáo đối soát', labelEn: 'VietQR Reconciliation' },
          { href: '/export', label: 'Xuất sổ sách kế toán', labelEn: 'Data Export' },
        ],
      },
    ],
  },
  {
    title: 'Tự động hóa & AI',
    titleEn: 'Automations & AI',
    items: [
      {
        id: 'automations',
        label: 'Tự động hóa thông minh',
        labelEn: 'Automations & AI',
        icon: Sparkles,
        subItems: [
          { href: '/automations', label: 'Kịch bản & Quy tắc', labelEn: 'Automated Rules' },
          { href: '/ai-assistant', label: 'Trợ lý AI TingRoster', labelEn: 'AI Assistant', badge: 'AI', badgeVariant: 'brand' },
        ],
      },
    ],
  },
  {
    title: 'Giao tiếp',
    titleEn: 'Communication',
    items: [
      {
        id: 'notifications',
        href: '/notifications',
        label: 'Trung tâm Thông báo',
        labelEn: 'Notifications',
        icon: Bell,
      },
    ],
  },
  {
    title: 'Cấu hình & Mở rộng',
    titleEn: 'Settings & Portals',
    items: [
      {
        id: 'settings',
        label: 'Cấu hình & Hệ thống',
        labelEn: 'Settings & Ecosystem',
        icon: Settings,
        subItems: [
          { href: '/settings', label: 'Cài đặt workspace & VietQR', labelEn: 'Settings' },
          { href: '/billing', label: 'Gói cước & Số dư', labelEn: 'Billing & Subscriptions' },
          { href: '/help', label: 'Trợ giúp & Hướng dẫn', labelEn: 'Help & Guides' },
          { href: '/portal', label: 'Cổng Học Viên (Portal)', labelEn: 'Member Portal', badge: 'Học viên', badgeVariant: 'neutral' },
          { href: '/kiosk', label: 'Kiosk quét QR tại sân', labelEn: 'QR Kiosk Check-in', external: true },
          { href: '/admin', label: 'Platform Admin', labelEn: 'Platform Admin' },
        ],
      },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleTheme, isDarkSidebar } = useTheme();
  const { locale, t } = useLanguage();

  const spaceMatch = pathname.match(/^\/groups\/([^/]+)/);
  const currentSpaceId = spaceMatch && spaceMatch[1] !== 'groups' && spaceMatch[1] !== 'new' ? spaceMatch[1] : null;

  const [activeSpace, setActiveSpace] = useState<{
    id: string;
    name: string;
    slug: string;
    code?: string | null;
    logoUrl?: string | null;
    themeColor?: string | null;
    enabledModules?: string | null;
    groupType?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!currentSpaceId) {
      setActiveSpace(null);
      return;
    }
    fetch(`/api/groups/${currentSpaceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.data) {
          setActiveSpace(data.data);
        }
      })
      .catch(() => {});
  }, [currentSpaceId]);

  const getPageTitle = (path: string, loc: string): string => {
    if (path === '/dashboard') return loc === 'en' ? 'Dashboard' : 'Tổng quan';
    if (path === '/groups') return loc === 'en' ? 'My Spaces' : 'Không gian của tôi';
    if (path.startsWith('/groups/')) {
      const spaceTitle = activeSpace?.name || (loc === 'en' ? 'Space' : 'Không gian');
      if (path.endsWith('/members')) return `${spaceTitle} • ${loc === 'en' ? 'Members' : 'Thành viên'}`;
      if (path.endsWith('/settings')) return `${spaceTitle} • ${loc === 'en' ? 'Space Info' : 'Thông tin không gian'}`;
      return `${spaceTitle} • ${loc === 'en' ? 'Overview' : 'Tổng quan'}`;
    }
    if (path.startsWith('/attendance')) return loc === 'en' ? 'Attendance & Schedule' : 'Lịch & Điểm danh';
    if (path.startsWith('/members')) return loc === 'en' ? 'Members' : 'Thành viên';
    if (path.startsWith('/workflows')) return loc === 'en' ? 'Workflows' : 'Quy trình vận hành';
    if (path.startsWith('/invoices')) return loc === 'en' ? 'Collections' : 'Khoản thu';
    if (path.startsWith('/transactions')) return loc === 'en' ? 'Transactions & VietQR' : 'Giao dịch VietQR';
    if (path.startsWith('/documents')) return loc === 'en' ? 'Receipts & Documents' : 'Hóa đơn & Chứng từ';
    if (path === '/reports') return loc === 'en' ? 'Reports Overview' : 'Tổng quan báo cáo';
    if (path.startsWith('/reports/cashflow')) return loc === 'en' ? 'Collections Report' : 'Báo cáo khoản thu';
    if (path.startsWith('/reports/aging')) return loc === 'en' ? 'Debt & Receivables' : 'Báo cáo công nợ';
    if (path.startsWith('/reports/attendance')) return loc === 'en' ? 'Attendance Analytics' : 'Báo cáo điểm danh';
    if (path.startsWith('/reports/tax')) return loc === 'en' ? 'Tax Estimate TT 40' : 'Báo cáo thuế TT 40';
    if (path.startsWith('/reports/reconciliation')) return loc === 'en' ? 'VietQR Reconciliation' : 'Báo cáo đối soát';
    if (path.startsWith('/reports')) return loc === 'en' ? 'Reports Center' : 'Tổng quan báo cáo';
    if (path.startsWith('/export')) return loc === 'en' ? 'Data Export' : 'Xuất sổ sách kế toán';
    if (path.startsWith('/automations')) return loc === 'en' ? 'Automations & AI' : 'Tự động hóa thông minh';
    if (path.startsWith('/ai-assistant')) return loc === 'en' ? 'AI Assistant' : 'Trợ lý AI TingRoster';
    if (path.startsWith('/billing')) return loc === 'en' ? 'Billing & Subscriptions' : 'Gói cước & Số dư';
    if (path.startsWith('/notifications')) return loc === 'en' ? 'Notifications' : 'Trung tâm Thông báo';
    if (path.startsWith('/help')) return loc === 'en' ? 'Help & Guides' : 'Trợ giúp & Hướng dẫn';
    if (path.startsWith('/settings')) return loc === 'en' ? 'Settings' : 'Cài đặt hệ thống';
    return 'TingRoster';
  };

  usePageTitle(getPageTitle(pathname, 'vi'), getPageTitle(pathname, 'en'));

  const [userData, setUserData] = useState<UserData>({
    name: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@tingroster.vn',
    role: 'Giáo viên / Admin',
    bankId: 'MB',
    bankAccountNo: '0987654321',
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const profileOpen = Boolean(profileAnchorEl);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  // Manage expandable submenus
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    management: true,
    finance: true,
    reports: true,
    automations: false,
    settings: false,
  });

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Auto-expand group containing current route
  useEffect(() => {
    for (const cat of NAV_CATEGORIES) {
      for (const item of cat.items) {
        if (item.subItems) {
          const hasActiveChild = item.subItems.some((sub) => {
            const subBase = sub.href.split('?')[0];
            return pathname === subBase || (subBase !== '/' && pathname.startsWith(subBase));
          });
          if (hasActiveChild) {
            setExpandedGroups((prev) => ({
              ...prev,
              [item.id]: true,
            }));
          }
        }
      }
    }
  }, [pathname]);

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
            logoUrl: data.data.logoUrl || undefined,
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

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const renderNavLinks = (closeDrawer?: () => void) => {
    // LEVEL 2: CONTEXTUAL SPACE NAVIGATION (When inside a specific space)
    if (currentSpaceId) {
      const spaceModules = parseEnabledModules(activeSpace?.enabledModules);
      const themeColor = activeSpace?.themeColor || '#2538D9';
      const spaceCode = activeSpace?.code || (activeSpace?.slug ? `TR-${activeSpace.slug.toUpperCase().slice(0, 4)}` : '');

      return (
        <nav className="flex-1 px-3 space-y-3 overflow-y-auto pb-4">
          {/* Quay lại cấp 1 */}
          <div className="pt-1">
            <Link
              href="/groups"
              onClick={closeDrawer}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isDarkSidebar
                  ? 'text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1]'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>← Không gian của tôi</span>
            </Link>
          </div>

          {/* Active Space Identity Card */}
          <div className={`p-2.5 rounded-2xl border transition-all ${
            isDarkSidebar
              ? 'bg-[#131A2B] border-[#1E283D]'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <SpaceAvatar
                name={activeSpace?.name || 'Không gian'}
                logoUrl={activeSpace?.logoUrl}
                themeColor={themeColor}
                enabledModules={activeSpace?.enabledModules}
                groupType={activeSpace?.groupType}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold truncate ${isDarkSidebar ? 'text-white' : 'text-slate-900'}`}>
                  {activeSpace?.name || 'Đang tải...'}
                </p>
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  {spaceCode}
                </p>
              </div>
            </div>
          </div>

          {/* Space Context Categories */}
          <div className="space-y-3.5">
            {/* TỔNG QUAN */}
            <div className="space-y-1">
              <div className={`px-2 text-[10px] font-bold uppercase tracking-wider ${
                isDarkSidebar ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Tổng quan
              </div>
              <Link
                href={`/groups/${currentSpaceId}`}
                onClick={closeDrawer}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  pathname === `/groups/${currentSpaceId}`
                    ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                    : isDarkSidebar
                    ? 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Bảng điều khiển</span>
              </Link>
            </div>

            {/* QUẢN LÝ */}
            <div className="space-y-1">
              <div className={`px-2 text-[10px] font-bold uppercase tracking-wider ${
                isDarkSidebar ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Quản lý
              </div>

              {spaceModules.includes('members') && (
                <Link
                  href={`/groups/${currentSpaceId}/members`}
                  onClick={closeDrawer}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    pathname === `/groups/${currentSpaceId}/members`
                      ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                      : isDarkSidebar
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Thành viên</span>
                </Link>
              )}

              {spaceModules.includes('attendance') && (
                <Link
                  href={`/attendance?groupId=${currentSpaceId}`}
                  onClick={closeDrawer}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    pathname.startsWith('/attendance')
                      ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                      : isDarkSidebar
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Lịch & Điểm danh</span>
                </Link>
              )}
            </div>

            {/* TÀI CHÍNH */}
            <div className="space-y-1">
              <div className={`px-2 text-[10px] font-bold uppercase tracking-wider ${
                isDarkSidebar ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Tài chính
              </div>

              {spaceModules.includes('invoices') && (
                <Link
                  href={`/invoices?groupId=${currentSpaceId}`}
                  onClick={closeDrawer}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    pathname.startsWith('/invoices')
                      ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                      : isDarkSidebar
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Khoản thu</span>
                </Link>
              )}

              <Link
                href={`/transactions?groupId=${currentSpaceId}`}
                onClick={closeDrawer}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  pathname.startsWith('/transactions')
                    ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                    : isDarkSidebar
                    ? 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Giao dịch VietQR</span>
              </Link>
            </div>

            {/* BÁO CÁO */}
            <div className="space-y-1">
              <div className={`px-2 text-[10px] font-bold uppercase tracking-wider ${
                isDarkSidebar ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Báo cáo
              </div>

              <Link
                href={`/reports?groupId=${currentSpaceId}`}
                onClick={closeDrawer}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  pathname === '/reports'
                    ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                    : isDarkSidebar
                    ? 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Tổng quan báo cáo</span>
              </Link>

              <Link
                href={`/reports/cashflow?groupId=${currentSpaceId}`}
                onClick={closeDrawer}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  pathname.startsWith('/reports/cashflow')
                    ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                    : isDarkSidebar
                    ? 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Báo cáo khoản thu</span>
              </Link>

              <Link
                href={`/reports/aging?groupId=${currentSpaceId}`}
                onClick={closeDrawer}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  pathname.startsWith('/reports/aging')
                    ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                    : isDarkSidebar
                    ? 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Báo cáo công nợ</span>
              </Link>

              {spaceModules.includes('attendance') && (
                <Link
                  href={`/reports/attendance?groupId=${currentSpaceId}`}
                  onClick={closeDrawer}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    pathname.startsWith('/reports/attendance')
                      ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                      : isDarkSidebar
                      ? 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Báo cáo điểm danh</span>
                </Link>
              )}

              <Link
                href={`/reports/reconciliation?groupId=${currentSpaceId}`}
                onClick={closeDrawer}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  pathname.startsWith('/reports/reconciliation')
                    ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                    : isDarkSidebar
                    ? 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Báo cáo đối soát</span>
              </Link>
            </div>

            {/* CÀI ĐẶT KHÔNG GIAN */}
            <div className="space-y-1">
              <div className={`px-2 text-[10px] font-bold uppercase tracking-wider ${
                isDarkSidebar ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Cài đặt
              </div>

              <Link
                href={`/groups/${currentSpaceId}/settings`}
                onClick={closeDrawer}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  pathname === `/groups/${currentSpaceId}/settings`
                    ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                    : isDarkSidebar
                    ? 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Thông tin không gian</span>
              </Link>

              {activeSpace?.slug && (
                <Link
                  href={`/p/${activeSpace.slug}`}
                  target="_blank"
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isDarkSidebar
                      ? 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Cổng tra cứu (Portal)</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </nav>
      );
    }

    // LEVEL 1: GLOBAL GENERAL NAVIGATION
    return (
    <nav className="flex-1 px-3 space-y-3.5 overflow-y-auto pb-4">
      {NAV_CATEGORIES.map((category) => (
        <div key={category.title} className="space-y-1">
          <div className={`px-2 pt-2 pb-0.5 text-[10px] font-bold uppercase tracking-wider ${
            isDarkSidebar ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {locale === 'en' && category.titleEn ? category.titleEn : category.title}
          </div>
          {category.items
            .filter((item) => {
              if (item.adminOnly && userData.role !== 'ADMIN' && userData.role !== 'Admin') {
                return false;
              }
              if (item.billingOnly && (userData.role === 'Staff' || userData.role === 'Nhân viên')) {
                return false;
              }
              return true;
            })
            .map((item) => {
              const Icon = item.icon;
              const hasSubmenu = Boolean(item.subItems && item.subItems.length > 0);
              const isExpanded = expandedGroups[item.id] ?? false;

              // If has no submenu, standard single link
              if (!hasSubmenu && item.href) {
                const isActive = pathname === item.href;
                const label = locale === 'en' && item.labelEn ? item.labelEn : item.label;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    onClick={closeDrawer}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                        : isDarkSidebar
                        ? 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : isDarkSidebar ? 'text-slate-400' : 'text-slate-500'}`} />
                      <span className="truncate">{label}</span>
                    </div>
                    {item.live && !isActive && <TingBadge pulse variant="dot" />}
                  </Link>
                );
              }

              // Group with Submenu
              const isChildActive = (item.subItems || []).some((sub) => {
                const subBase = sub.href.split('?')[0];
                return pathname === subBase || (subBase !== '/' && pathname.startsWith(subBase));
              });
              const label = locale === 'en' && item.labelEn ? item.labelEn : item.label;

              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => toggleGroupExpand(item.id)}
                    aria-expanded={isExpanded}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isChildActive
                        ? isDarkSidebar
                          ? 'text-white bg-white/[0.05]'
                          : 'text-[#2538D9] bg-indigo-50/60 dark:bg-indigo-950/20'
                        : isDarkSidebar
                        ? 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${
                        isChildActive
                          ? 'text-[#2538D9] dark:text-indigo-400'
                          : isDarkSidebar
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`} />
                      <span className="truncate">{label}</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </button>

                  {/* Submenu items */}
                  {isExpanded && item.subItems && (
                    <div className="pl-6 pr-1 space-y-0.5 py-0.5 border-l-2 border-slate-200 dark:border-slate-800 ml-3.5 my-1">
                      {item.subItems.map((sub) => {
                        const subBase = sub.href.split('?')[0];
                        const isActive = subBase === '/reports'
                          ? pathname === '/reports'
                          : pathname === subBase || (subBase !== '/' && pathname.startsWith(`${subBase}/`));
                        const subLabel = locale === 'en' && sub.labelEn ? sub.labelEn : sub.label;

                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            target={sub.external ? '_blank' : undefined}
                            onClick={closeDrawer}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-md text-[11.5px] transition-all ${
                              isActive
                                ? 'bg-[#2538D9] text-white font-bold shadow-xs'
                                : isDarkSidebar
                                ? 'text-slate-400 hover:text-white hover:bg-white/[0.06] font-medium'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                            }`}
                          >
                            <span className="truncate">{subLabel}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {sub.badge && (
                                <TingTag
                                  label={sub.badge}
                                  variantStyle={isActive ? 'neutral' : (sub.badgeVariant || 'success')}
                                />
                              )}
                              {sub.live && !isActive && <TingBadge pulse variant="dot" />}
                              {sub.external && <ExternalLink className="w-3 h-3 text-slate-400" />}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ))}
    </nav>
    );
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F5F7FB] dark:bg-[#0B0F19] text-[#101828] dark:text-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-[#2538D9] selection:text-white">
      {/* Desktop Sidebar (Independent Scroll) */}
      <aside className={`hidden md:flex flex-col w-64 h-screen flex-shrink-0 transition-colors duration-200 relative z-20 overflow-hidden ${
        isDarkSidebar
          ? 'bg-[#0B0F19] border-r border-[#1B2333] text-slate-300'
          : 'bg-white border-r border-[#E4E7EC] text-slate-700 shadow-xs'
      }`}>
        {/* Brand Header (Fixed in Sidebar) */}
        <div className={`h-16 flex-shrink-0 flex items-center px-5 gap-3 border-b ${
          isDarkSidebar ? 'border-[#1B2333]/80' : 'border-[#E4E7EC]'
        }`}>
          {userData.logoUrl ? (
            <Link href="/dashboard" className="flex items-center gap-2.5 focus:outline-none">
              <div className="h-9 max-w-[140px] flex items-center justify-start overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={userData.logoUrl}
                  alt="Workspace Logo"
                  className="h-full w-auto max-w-[140px] object-contain select-none"
                />
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2538D9]/10 text-[#2538D9] border border-[#2538D9]/20 uppercase">
                PRO
              </span>
            </Link>
          ) : (
            <Logo href="/dashboard" theme={isDarkSidebar ? 'dark' : 'light'} size="sm" showBadge={true} badgeText="PRO" />
          )}
        </div>

        {/* Bank Connection Pill with Logo & MUI Tag */}
        <div className="p-3">
          <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-[11px] border ${
            isDarkSidebar
              ? 'bg-[#131A2B] border-[#1E283D] text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <BankLogo bankId={userData.bankId} size="xs" />
              <span className={`font-semibold truncate ${isDarkSidebar ? 'text-slate-200' : 'text-slate-800'}`}>
                {userData.bankId} • {userData.bankAccountNo}
              </span>
            </div>
            <TingTag
              variantStyle="success"
              label="Auto"
              size="small"
              icon={
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
              }
            />
          </div>
        </div>

        {/* Desktop Navigation Links with real submenus */}
        {renderNavLinks()}

        {/* User Profile Footer (Cleaned: Single Source of Truth for Global Actions) */}
        <div className={`p-3 border-t ${
          isDarkSidebar ? 'border-[#1B2333] bg-[#0A0D17]' : 'border-[#E4E7EC] bg-slate-50'
        }`}>
          <div className={`flex items-center justify-between p-2 rounded-lg border ${
            isDarkSidebar
              ? 'bg-[#131A2B] border-[#1E283D]'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                name={userData.name}
                size="sm"
                gender="MALE"
                ageGroup="ADULT"
                status="online"
              />
              <div className="min-w-0">
                <p className={`text-xs font-semibold truncate ${isDarkSidebar ? 'text-white' : 'text-slate-900'}`}>{userData.name}</p>
                <p className={`text-[10px] truncate ${isDarkSidebar ? 'text-slate-400' : 'text-slate-500'}`}>{userData.email}</p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2538D9]/10 text-[#2538D9] dark:text-indigo-400 border border-[#2538D9]/20 uppercase flex-shrink-0">
              PRO
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Synchronized with isDarkSidebar) */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              backgroundColor: isDarkSidebar ? '#0B0F19' : '#FFFFFF',
              borderRight: isDarkSidebar ? '1px solid #1B2333' : '1px solid #E4E7EC',
              color: isDarkSidebar ? '#FFFFFF' : '#101828',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <div className={`h-16 flex items-center justify-between px-5 border-b ${
          isDarkSidebar ? 'border-[#1B2333]' : 'border-[#E4E7EC]'
        }`}>
          {userData.logoUrl ? (
            <Link href="/dashboard" className="flex items-center gap-2 focus:outline-none">
              <div className="h-8 max-w-[130px] flex items-center justify-start overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={userData.logoUrl}
                  alt="Workspace Logo"
                  className="h-full w-auto max-w-[130px] object-contain select-none"
                />
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2538D9]/10 text-[#2538D9] border border-[#2538D9]/20 uppercase">
                PRO
              </span>
            </Link>
          ) : (
            <Logo href="/dashboard" theme={isDarkSidebar ? 'dark' : 'light'} size="sm" showBadge={true} badgeText="PRO" />
          )}
          <IconButton
            size="small"
            onClick={() => setMobileMenuOpen(false)}
            sx={{ color: isDarkSidebar ? '#94A3B8' : '#64748B', '&:hover': { color: isDarkSidebar ? '#FFFFFF' : '#101828' } }}
          >
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="p-3">
          <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-[11px] border ${
            isDarkSidebar
              ? 'bg-[#131A2B] border-[#1E283D] text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <BankLogo bankId={userData.bankId} size="xs" />
              <span className={`font-semibold truncate ${isDarkSidebar ? 'text-slate-200' : 'text-slate-800'}`}>
                {userData.bankId} • {userData.bankAccountNo}
              </span>
            </div>
            <TingTag
              variantStyle="success"
              label="Auto"
              size="small"
              icon={
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
              }
            />
          </div>
        </div>

        {renderNavLinks(() => setMobileMenuOpen(false))}

        <div className={`p-3 border-t ${
          isDarkSidebar ? 'border-[#1B2333] bg-[#0A0D17]' : 'border-[#E4E7EC] bg-slate-50'
        }`}>
          <div className={`flex items-center justify-between p-2 rounded-lg border ${
            isDarkSidebar ? 'bg-[#131A2B] border-[#1E283D]' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                name={userData.name}
                size="sm"
                gender="MALE"
                ageGroup="ADULT"
                status="online"
              />
              <div className="min-w-0">
                <p className={`text-xs font-semibold truncate ${isDarkSidebar ? 'text-white' : 'text-slate-900'}`}>{userData.name}</p>
                <p className={`text-[10px] truncate ${isDarkSidebar ? 'text-slate-400' : 'text-slate-500'}`}>{userData.email}</p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2538D9]/10 text-[#2538D9] dark:text-indigo-400 border border-[#2538D9]/20 uppercase flex-shrink-0">
              PRO
            </span>
          </div>
        </div>
      </Drawer>

      {/* Main Content Area (Header fixed, Main scrolls independently) */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        {/* Global Topbar Header with MUI Components */}
        <header className="h-16 flex-shrink-0 bg-white/95 dark:bg-[#0B0F19]/95 border-b border-[#E4E7EC] dark:border-[#1E293B] px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <IconButton
              size="small"
              edge="start"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ color: isDark ? '#F8FAFC' : '#101828' }}
            >
              <MenuIcon className="w-5 h-5" />
            </IconButton>
            <Logo href="/dashboard" size="xs" variant="icon" />
          </div>

          {/* Search Form using MUI OutlinedInput */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <OutlinedInput
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã TR (VD: TR84920), tên học viên, phụ huynh..."
              startAdornment={
                <InputAdornment position="start">
                  <Search className="w-4 h-4 text-slate-400" />
                </InputAdornment>
              }
              endAdornment={
                searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      edge="end"
                      sx={{ p: 0.5 }}
                    >
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
              sx={{
                height: 36,
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                bgcolor: isDark ? '#111726' : '#F8FAFC',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? '#1E293B' : '#E4E7EC',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2538D9',
                  borderWidth: '1.5px',
                },
              }}
            />
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* National Flag Language Select */}
            <LanguageSwitch variant="select" />

            {/* Notification Bell Popover */}
            <NotificationBellPopover />

            {/* Dark Mode Toggle with MUI Tooltip & IconButton */}
            <Tooltip
              title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
              arrow
            >
              <IconButton
                size="small"
                onClick={toggleTheme}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '0.5rem',
                  border: isDark ? '1px solid #1E293B' : '1px solid #E4E7EC',
                  bgcolor: isDark ? '#111726' : '#F8FAFC',
                }}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </IconButton>
            </Tooltip>

            {/* Quick Action: Create Invoice Button with MUI Button */}
            <Button
              variant="contained"
              size="small"
              onClick={() => setQuickCreateOpen(true)}
              startIcon={<Plus className="w-4 h-4" />}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                bgcolor: '#2538D9',
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'none',
                px: 2,
                height: 36,
                borderRadius: '0.5rem',
                boxShadow: '0 2px 8px rgba(37, 56, 217, 0.35)',
                '&:hover': { bgcolor: '#1E2DB8' },
              }}
            >
              {t('common.create_invoice', 'Tạo hóa đơn')}
            </Button>

            {/* VietQR Live Transactions with MUI TingBadge */}
            <Tooltip title="Giao dịch VietQR tự động" arrow>
              <IconButton
                component={Link}
                href="/transactions"
                size="small"
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  width: 36,
                  height: 36,
                  borderRadius: '0.5rem',
                  border: isDark ? '1px solid #1E293B' : '1px solid #E4E7EC',
                  bgcolor: isDark ? '#111726' : '#F8FAFC',
                }}
              >
                <TingBadge pulse variant="dot">
                  <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </TingBadge>
              </IconButton>
            </Tooltip>

            {/* Settings Link with MUI Tooltip */}
            <Tooltip title="Cài đặt hệ thống" arrow>
              <IconButton
                component={Link}
                href="/settings"
                size="small"
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  width: 36,
                  height: 36,
                  borderRadius: '0.5rem',
                  border: isDark ? '1px solid #1E293B' : '1px solid #E4E7EC',
                  bgcolor: isDark ? '#111726' : '#F8FAFC',
                }}
              >
                <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </IconButton>
            </Tooltip>

            {/* Profile Trigger Button & Accessible MUI Menu */}
            <div>
              <button
                type="button"
                onClick={handleProfileClick}
                aria-controls={profileOpen ? 'profile-dropdown-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={profileOpen ? 'true' : undefined}
                className="h-9 flex items-center gap-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all focus:outline-none shadow-2xs cursor-pointer"
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

              <Menu
                id="profile-dropdown-menu"
                anchorEl={profileAnchorEl}
                open={profileOpen}
                onClose={handleProfileClose}
                onClick={handleProfileClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    elevation: 4,
                    sx: {
                      minWidth: 220,
                      mt: 1,
                      backgroundColor: isDark ? '#111726' : '#FFFFFF',
                      border: isDark ? '1px solid #1E293B' : '1px solid #E4E7EC',
                      borderRadius: '0.75rem',
                    },
                  },
                }}
              >
                <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-xs text-[#101828] dark:text-[#F8FAFC]">
                    {userData.name}
                  </p>
                  <p className="text-[11px] text-[#475467] dark:text-slate-400 truncate">
                    {userData.email}
                  </p>
                </div>
                <MenuItem component={Link} href="/settings">
                  <ListItemIcon>
                    <Settings className="w-4 h-4 text-slate-500" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span className="text-xs font-semibold">Cài đặt tài khoản</span>}
                  />
                </MenuItem>
                <MenuItem component={Link} href="/kiosk" target="_blank">
                  <ListItemIcon>
                    <Tv className="w-4 h-4 text-slate-500" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span className="text-xs font-semibold">Mở Kiosk tại sân</span>}
                  />
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleLogout} sx={{ color: '#E11D48' }}>
                  <ListItemIcon>
                    <LogOut className="w-4 h-4 text-rose-600" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span className="text-xs font-semibold text-rose-600">Đăng xuất</span>}
                  />
                </MenuItem>
              </Menu>
            </div>
          </div>
        </header>

        {/* Page Inner Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar with MUI Badges */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#0B0F19]/95 border-t border-[#E4E7EC] dark:border-[#1E293B] backdrop-blur-xl flex items-center justify-around px-2 z-40">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 text-[10px] ${
            pathname === '/dashboard' ? 'text-[#2538D9] font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Tổng quan</span>
        </Link>
        <Link
          href="/attendance"
          className={`flex flex-col items-center gap-1 text-[10px] ${
            pathname === '/attendance' ? 'text-[#2538D9] font-bold' : 'text-slate-500'
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span>Điểm danh</span>
        </Link>
        <button
          type="button"
          onClick={() => setQuickCreateOpen(true)}
          className="w-10 h-10 -mt-4 rounded-full bg-[#2538D9] hover:bg-[#1E2DB8] flex items-center justify-center text-white shadow-md shadow-[#2538D9]/30 border-2 border-white dark:border-[#0B0F19] font-bold"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
        <Link
          href="/transactions"
          className={`flex flex-col items-center gap-1 text-[10px] ${
            pathname === '/transactions' ? 'text-[#2538D9] font-bold' : 'text-slate-500'
          }`}
        >
          <TingBadge pulse variant="dot">
            <QrCode className="w-5 h-5" />
          </TingBadge>
          <span>Đối soát</span>
        </Link>
        <Link
          href="/groups"
          className={`flex flex-col items-center gap-1 text-[10px] ${
            pathname.startsWith('/groups') ? 'text-[#2538D9] font-bold' : 'text-slate-500'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Không gian</span>
        </Link>
      </div>

      {/* Quick 1-Touch Create Invoice Modal */}
      <QuickCreateInvoiceModal
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
