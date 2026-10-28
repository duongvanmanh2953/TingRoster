'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Inbox,
  Activity,
  Users,
  Building2,
  GraduationCap,
  Home,
  Sparkles,
  TrendingUp,
  QrCode,
  CreditCard,
  ShieldCheck,
  LineChart,
  Cpu,
  LifeBuoy,
  Server,
  SlidersHorizontal,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Avatar } from '@/components/common/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@/components/theme/ThemeContext';

export type AdminTabKey =
  | 'OVERVIEW'
  | 'ACTION_QUEUE'
  | 'SYSTEM_HEALTH'
  | 'USERS'
  | 'TENANTS'
  | 'CLASSES'
  | 'RENTALS'
  | 'TRIALS'
  | 'FINANCE_OVERVIEW'
  | 'TOPUP_ORDERS'
  | 'CREDIT_LEDGER'
  | 'COLLECTIONS_MONITOR'
  | 'ANALYTICS_GROWTH'
  | 'ANALYTICS_AI'
  | 'SUPPORT_TICKETS'
  | 'WEBHOOK_GATEWAYS'
  | 'CONFIG'
  | 'AUDIT_LOGS';

interface AdminSidebarProps {
  activeTab: AdminTabKey;
  onSelectTab: (tab: AdminTabKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  counts?: {
    users?: number;
    tenants?: number;
    trials?: number;
    pendingTopups?: number;
    tickets?: number;
  };
}

interface NavItem {
  key: AdminTabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  counts = {},
}: AdminSidebarProps) {
  const { isDarkSidebar } = useTheme();
  const groups: NavGroup[] = [
    {
      id: 'OVERVIEW',
      title: 'Điều hành & Giám sát',
      items: [
        { key: 'OVERVIEW', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
        {
          key: 'ACTION_QUEUE',
          label: 'Hàng đợi xử lý',
          icon: Inbox,
          badge: '3 việc',
          badgeColor: 'bg-amber-500/20 text-amber-300',
        },
        { key: 'SYSTEM_HEALTH', label: 'Sức khỏe hạ tầng & SLA', icon: Activity, badge: '99.98%', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
      ],
    },
    {
      id: 'CUSTOMERS',
      title: 'Khách hàng & Cơ sở',
      items: [
        {
          key: 'USERS',
          label: 'Người dùng toàn nền tảng',
          icon: Users,
          badge: counts.users || 142,
          badgeColor: 'bg-slate-800 text-slate-300',
        },
        {
          key: 'TENANTS',
          label: 'Quản lý Cơ sở (Tenants)',
          icon: Building2,
          badge: counts.tenants || 138,
          badgeColor: 'bg-slate-800 text-slate-300',
        },
        { key: 'CLASSES', label: 'Lớp học & Trung tâm', icon: GraduationCap },
        { key: 'RENTALS', label: 'Nhà trọ & Phòng trọ', icon: Home },
        {
          key: 'TRIALS',
          label: 'Dùng thử 30 ngày & Thu phí',
          icon: Sparkles,
          badge: counts.trials || 14,
          badgeColor: 'bg-amber-400/20 text-amber-300',
        },
      ],
    },
    {
      id: 'FINANCE',
      title: 'Tài chính & Thu phí Nền tảng',
      items: [
        { key: 'FINANCE_OVERVIEW', label: 'Doanh thu cước dịch vụ', icon: TrendingUp },
        {
          key: 'TOPUP_ORDERS',
          label: 'Đơn nạp ví duy trì',
          icon: QrCode,
          badge: counts.pendingTopups || 1,
          badgeColor: 'bg-amber-500/20 text-amber-300',
        },
        { key: 'CREDIT_LEDGER', label: 'Sổ cái Ví CreditLedger', icon: CreditCard },
        { key: 'COLLECTIONS_MONITOR', label: 'Giám sát tiền thu cơ sở', icon: ShieldCheck },
      ],
    },
    {
      id: 'ANALYTICS',
      title: 'Báo cáo & Phân tích',
      items: [
        { key: 'ANALYTICS_GROWTH', label: 'Tăng trưởng & Phễu kích hoạt', icon: LineChart },
        { key: 'ANALYTICS_AI', label: 'Trợ lý AI & Bot thông minh', icon: Cpu },
      ],
    },
    {
      id: 'OPERATIONS',
      title: 'Vận hành & Hỗ trợ',
      items: [
        {
          key: 'SUPPORT_TICKETS',
          label: 'Trung tâm Hỗ trợ Tickets',
          icon: LifeBuoy,
          badge: counts.tickets || 3,
          badgeColor: 'bg-rose-500/20 text-rose-300',
        },
        { key: 'WEBHOOK_GATEWAYS', label: 'Cổng Webhook & Napas 247', icon: Server },
      ],
    },
    {
      id: 'SETTINGS',
      title: 'Hệ thống & Cấu hình',
      items: [
        {
          key: 'CONFIG',
          label: 'Cấu hình các phần & Bảng giá',
          icon: SlidersHorizontal,
          badge: 'Mới',
          badgeColor: 'bg-indigo-500/20 text-indigo-300',
        },
      ],
    },
    {
      id: 'SECURITY',
      title: 'An ninh & Kiểm toán',
      items: [
        { key: 'AUDIT_LOGS', label: 'Nhật ký An ninh & Audit Trail', icon: ShieldAlert },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out ${
          isDarkSidebar
            ? 'bg-[#0B0F19] text-slate-300 border-r border-slate-800/90'
            : 'bg-white text-slate-700 border-r border-slate-200 shadow-xs'
        } ${
          collapsed ? 'w-[72px]' : 'w-[264px]'
        } ${mobileOpen ? 'translate-x-0 !w-[272px]' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand & Platform Header */}
        <div className={`h-16 px-4 flex items-center justify-between shrink-0 border-b ${
          isDarkSidebar ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <Logo variant="horizontal" size="sm" theme={isDarkSidebar ? 'dark' : 'light'} />
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2538D9] text-white uppercase tracking-wider shrink-0 shadow-xs">
                ADMIN
              </span>
            </div>
          ) : (
            <div className="mx-auto">
              <Logo variant="icon" size="sm" theme={isDarkSidebar ? 'dark' : 'light'} />
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex p-1.5 rounded-lg transition-colors ${
              isDarkSidebar
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className={`lg:hidden p-1.5 rounded-lg ${
              isDarkSidebar
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items with Scroll */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {groups.map((group) => (
            <div key={group.id}>
              {!collapsed && (
                <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {group.title}
                </div>
              )}
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;

                  const buttonContent = (
                    <button
                      onClick={() => {
                        onSelectTab(item.key);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center rounded-xl transition-all text-xs font-semibold ${
                        collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                      } ${
                        isActive
                          ? 'bg-[#2538D9] text-white shadow-md shadow-blue-900/40'
                          : isDarkSidebar
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : isDarkSidebar ? 'text-slate-400' : 'text-slate-500'}`} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!collapsed && item.badge && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                            item.badgeColor || (isDarkSidebar ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );

                  return collapsed ? (
                    <Tooltip key={item.key} title={item.label} placement="right" arrow>
                      <div>{buttonContent}</div>
                    </Tooltip>
                  ) : (
                    <div key={item.key}>{buttonContent}</div>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Quick Back & Admin Profile */}
        <div className={`p-3 space-y-2 shrink-0 border-t ${
          isDarkSidebar
            ? 'border-slate-800/80 bg-slate-950/70'
            : 'border-slate-200 bg-slate-50'
        }`}>
          <Link
            href="/dashboard"
            className={`w-full flex items-center rounded-xl transition-all text-xs font-semibold border ${
              isDarkSidebar
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 shadow-2xs'
            } ${
              collapsed ? 'justify-center p-2.5' : 'justify-center gap-2 px-3 py-2'
            }`}
            title="Về Workspace App"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 shrink-0" />
            {!collapsed && <span>Về Workspace App</span>}
          </Link>

          {!collapsed && (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <Avatar name="Admin Master" size="sm" />
              <div className="flex-1 min-w-0 text-left text-xs">
                <span className={`font-semibold block truncate leading-tight ${isDarkSidebar ? 'text-slate-200' : 'text-slate-900'}`}>
                  Quản trị viên Cấp cao
                </span>
                <span className={`text-[10px] block truncate ${isDarkSidebar ? 'text-slate-400' : 'text-slate-500'}`}>
                  superadmin@tingroster.vn
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
