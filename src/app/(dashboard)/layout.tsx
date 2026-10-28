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
  FileText,
  Palette,
  Layers
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

import { BankLogo } from '@/components/common/BankLogo';
import { Logo } from '@/components/common/Logo';
import { Avatar } from '@/components/common/Avatar';
import { TingBadge, TingTag } from '@/components/common/Badge';
import { QuickCreateInvoiceModal } from '@/components/invoices/QuickCreateInvoiceModal';
import { useTheme } from '@/components/theme/ThemeContext';

interface UserData {
  name: string;
  email: string;
  role?: string;
  bankId?: string;
  bankAccountNo?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'info' | 'brand';
  live?: boolean;
  billingOnly?: boolean;
  external?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Vận hành hằng ngày',
    items: [
      { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { href: '/attendance', label: 'Điểm danh & Lịch', icon: CalendarCheck, badge: 'Hôm nay', badgeVariant: 'success' },
      { href: '/members', label: 'Thành viên & Học viên', icon: GraduationCap },
      { href: '/groups', label: 'Workspace & Lớp', icon: Building2 },
      { href: '/workflows', label: 'Quy trình quản lý', icon: Workflow },
    ],
  },
  {
    title: 'Tài chính & Đối soát',
    items: [
      { href: '/invoices', label: 'Khoản thu & Công nợ', icon: CreditCard },
      { href: '/transactions', label: 'Giao dịch VietQR', icon: QrCode, live: true },
      { href: '/documents', label: 'Hóa đơn & Chứng từ', icon: Receipt },
      { href: '/reports', label: 'Báo cáo & Phân tích', icon: BarChart3 },
      { href: '/export', label: 'Xuất sổ sách', icon: Download },
    ],
  },
  {
    title: 'Hệ thống & Công cụ',
    items: [
      { href: '/automations', label: 'AI & Tự động hóa', icon: Sparkles },
      { href: '/billing', label: 'Gói cước & Số dư', icon: Wallet, billingOnly: true },
      { href: '/notifications', label: 'Thông báo', icon: Bell },
      { href: '/help', label: 'Trợ giúp & Hướng dẫn', icon: HelpCircle },
      { href: '/settings', label: 'Cài đặt hệ thống', icon: Settings },
    ],
  },
  {
    title: 'Cổng liên kết & Mở rộng',
    items: [
      { href: '/portal', label: 'Cổng Học Viên (Portal)', icon: Users2, badge: 'Học viên', badgeVariant: 'neutral' },
      { href: '/admin', label: 'Platform Admin', icon: ShieldCheck },
      { href: '/kiosk', label: 'Kiosk quét QR tại sân', icon: Tv, external: true },
      { href: '/legal', label: 'Điều khoản & Hoàn phí', icon: FileText },
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
  const { isDark, toggleTheme, sidebarTheme, isDarkSidebar, cycleSidebarTheme } = useTheme();

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

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const renderNavLinks = (closeDrawer?: () => void) => (
    <nav className="flex-1 px-3 space-y-4 overflow-y-auto pb-4">
      {NAV_SECTIONS.map((section, idx) => (
        <div key={section.title} className="space-y-1">
          <div className={`px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider ${
            isDarkSidebar ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {section.title}
          </div>
          {section.items
            .filter((item) => {
              if (item.billingOnly) {
                const isRestrictedStaff = userData.role === 'Staff' || userData.role === 'Nhân viên';
                return !isRestrictedStaff;
              }
              return true;
            })
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  onClick={closeDrawer}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#2538D9] text-white font-semibold shadow-xs'
                      : isDarkSidebar
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : isDarkSidebar ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {item.badge && (
                      <TingTag
                        label={item.badge}
                        variantStyle={isActive ? 'neutral' : (item.badgeVariant || 'success')}
                      />
                    )}
                    {item.live && !isActive && (
                      <TingBadge pulse variant="dot" />
                    )}
                    {item.external && (
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </Link>
              );
            })}
        </div>
      ))}
    </nav>
  );

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
          <Logo href="/dashboard" theme={isDarkSidebar ? 'dark' : 'light'} size="sm" showBadge={true} badgeText="PRO" />
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

        {/* Desktop Navigation Links */}
        {renderNavLinks()}

        {/* User Profile & Footer Actions */}
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

            <div className="flex items-center gap-0.5">
              <Tooltip
                title={`Kiểu Sidebar: ${sidebarTheme === 'auto' ? 'Tự động' : sidebarTheme === 'light' ? 'Sáng' : 'Tối'} (Bấm để đổi)`}
                arrow
              >
                <IconButton
                  size="small"
                  onClick={cycleSidebarTheme}
                  sx={{
                    color: isDarkSidebar ? '#94A3B8' : '#64748B',
                    '&:hover': { color: '#2538D9', bgcolor: isDarkSidebar ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
                  }}
                >
                  <Palette className="w-4 h-4" />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={isDark ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
                arrow
              >
                <IconButton
                  size="small"
                  onClick={toggleTheme}
                  sx={{
                    color: isDarkSidebar ? '#94A3B8' : '#64748B',
                    '&:hover': { color: '#F59E0B', bgcolor: isDarkSidebar ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
                  }}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Đăng xuất" arrow>
                <IconButton
                  size="small"
                  onClick={handleLogout}
                  sx={{
                    color: isDarkSidebar ? '#94A3B8' : '#64748B',
                    '&:hover': { color: '#F43F5E', bgcolor: 'rgba(244, 63, 94, 0.1)' },
                  }}
                >
                  <LogOut className="w-4 h-4" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Using MUI Drawer) */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              backgroundColor: '#0B0F19',
              borderRight: '1px solid #1B2333',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#1B2333]">
          <Logo href="/dashboard" theme="dark" size="sm" showBadge={true} badgeText="PRO" />
          <IconButton
            size="small"
            onClick={() => setMobileMenuOpen(false)}
            sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}
          >
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#131A2B] border border-[#1E283D] text-[11px]">
            <div className="flex items-center gap-2 min-w-0">
              <BankLogo bankId={userData.bankId} size="xs" />
              <span className="font-semibold text-slate-200 truncate">
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

            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{ color: '#F43F5E', '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.1)' } }}
            >
              <LogOut className="w-4 h-4" />
            </IconButton>
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
                py: 0.85,
                borderRadius: '0.625rem',
                boxShadow: '0 2px 8px rgba(37, 56, 217, 0.35)',
                '&:hover': { bgcolor: '#1E2DB8' },
              }}
            >
              Tạo hóa đơn
            </Button>

            {/* VietQR Live Transactions with MUI TingBadge */}
            <Tooltip title="Giao dịch VietQR tự động" arrow>
              <IconButton
                component={Link}
                href="/transactions"
                size="small"
                sx={{
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
            pathname === '/groups' ? 'text-[#2538D9] font-bold' : 'text-slate-500'
          }`}
        >
          <Users2 className="w-5 h-5" />
          <span>Lớp & CLB</span>
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
