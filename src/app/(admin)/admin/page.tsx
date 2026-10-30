'use client';

import React, { useState, useEffect } from 'react';
import { formatVND, formatCompactVND, formatDateVN } from '@/lib/utils';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { PlatformConfigTab } from '@/components/admin/PlatformConfigTab';
import { AdminSidebar, AdminTabKey } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { UserDirectoryTab } from '@/components/admin/UserDirectoryTab';
import { ClassesAndRentalsTab } from '@/components/admin/ClassesAndRentalsTab';
import { FinancialOperationsTab } from '@/components/admin/FinancialOperationsTab';
import { SupportTicketsTab } from '@/components/admin/SupportTicketsTab';
import {
  ShieldCheck,
  Building2,
  Users2,
  CreditCard,
  QrCode,
  Activity,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Lock,
  Unlock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Key,
  BadgeAlert,
  Layers,
  Sparkles,
  Smartphone,
  Clock,
  HelpCircle,
  FileText,
  DollarSign,
  AlertCircle,
  Inbox,
  ArrowUpRight,
  Check,
  X,
  History,
  LifeBuoy,
  Eye,
  Settings,
  Menu as MenuIcon,
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { Avatar } from '@/components/common/Avatar';
import { Logo } from '@/components/common/Logo';

interface AdminData {
  stats: {
    totalTenants: number;
    activeTenants: number;
    totalGroups: number;
    totalMembers: number;
    systemGmv: number;
    platformFloat: number;
    mrr: number;
    webhookSuccessRate: number;
    trialStats?: {
      activeTrials: number;
      expiringTrials: number;
      convertedPaid: number;
      conversionRate: number;
    };
  };
  tenants: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    planType: string;
    serviceBalance: number;
    groupsCount: number;
    membersCount: number;
    primaryType: string;
    bankInfo: string;
    createdAt: string;
    trialEndsAt?: string;
    trialDaysLeft?: number;
    trialStatus?: 'TRIAL_ACTIVE' | 'TRIAL_EXPIRING' | 'CONVERTED' | 'EXPIRED';
    status: string;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string | null;
    ipAddress: string | null;
    createdAt: string;
  }>;
  gateways: Array<{
    name: string;
    status: string;
    latencyMs: number;
    uptime: string;
  }>;
}

interface TopUpOrder {
  id: string;
  tenantName: string;
  amount: number;
  provider: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
  reference: string;
}

const MOCK_TOPUP_ORDERS: TopUpOrder[] = [
  {
    id: 'TOP-20261028-01',
    tenantName: 'Thầy Hưng Toán Luyện Thi ĐH',
    amount: 500000,
    provider: 'VietQR SeABank',
    status: 'SUCCESS',
    createdAt: '2026-10-28 10:15',
    reference: 'TRTOP500K12',
  },
  {
    id: 'TOP-20261028-02',
    tenantName: 'Nhà Trọ An Cư 12 Phòng',
    amount: 200000,
    provider: 'VietQR MBBank',
    status: 'SUCCESS',
    createdAt: '2026-10-28 09:40',
    reference: 'TRTOP200K88',
  },
  {
    id: 'TOP-20261028-03',
    tenantName: 'CLB Cầu Lông Thủ Đức Stars',
    amount: 1000000,
    provider: 'VietQR Techcombank',
    status: 'PENDING',
    createdAt: '2026-10-28 08:30',
    reference: 'TRTOP1M04',
  },
];

interface SupportTicket {
  id: string;
  tenantName: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  category: string;
}

const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TICK-101',
    tenantName: 'CLB Cầu Lông Thủ Đức Stars',
    title: 'Hỗ trợ kết nối webhook SePay chưa nhận được callback',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: '30 phút trước',
    category: 'Cổng thanh toán',
  },
  {
    id: 'TICK-102',
    tenantName: 'Trung tâm Ngoại ngữ Alpha',
    title: 'Xin gia hạn dùng thử thêm 15 ngày để kiểm thử đợt nhập học mới',
    priority: 'MEDIUM',
    status: 'OPEN',
    createdAt: '2 giờ trước',
    category: 'Gói dịch vụ',
  },
  {
    id: 'TICK-103',
    tenantName: 'Nhà Trọ Xanh Q9',
    title: 'Hướng dẫn in mã QR động dán trước cửa phòng trọ',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: '1 ngày trước',
    category: 'Vận hành',
  },
];

import { usePageTitle } from '@/hooks/usePageTitle';

export default function PlatformAdminPage() {
  usePageTitle('Quản trị Nền tảng (Platform Admin)', 'Platform Admin Console');
  const [activeTab, setActiveTab] = useState<AdminTabKey>('OVERVIEW');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  
  // Modals
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [tenantDetailOpen, setTenantDetailOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState<number>(100000);
  const [creditType, setCreditType] = useState<'ADJUSTMENT' | 'TOP_UP' | 'COMPENSATION'>('ADJUSTMENT');
  const [creditReason, setCreditReason] = useState('Thưởng số dư trải nghiệm đợt dùng thử');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [healthChecking, setHealthChecking] = useState(false);
  const [tempPasswordModalOpen, setTempPasswordModalOpen] = useState(false);
  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);

  const handleResetTenantPassword = async (tenant: any) => {
    if (!confirm(`Bạn có chắc chắn muốn cấp lại mật khẩu tạm thời cho ${tenant.email}?`)) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET_PASSWORD',
          tenantId: tenant.id,
          reason: 'Platform Admin cấp lại mật khẩu tạm thời an toàn',
        }),
      });
      const resData = await res.json();
      if (resData.success && resData.data?.temporaryPassword) {
        setSelectedTenant(tenant);
        setTempPasswordResult(resData.data.temporaryPassword);
        setTempPasswordModalOpen(true);
        setToastMessage(`Đã cấp mật khẩu tạm thời cho ${tenant.email}`);
      } else {
        alert(resData.error || 'Lỗi khi cấp mật khẩu');
      }
    } catch {
      alert('Không thể kết nối máy chủ');
    }
  };

  const loadAdminData = () => {
    setLoading(true);
    fetch('/api/admin')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        }
      })
      .catch((err) => console.error('Failed to load admin data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleGrantCredit = async () => {
    if (!selectedTenant) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREDIT_BALANCE',
          tenantId: selectedTenant.id,
          amount: creditAmount,
          reason: `[${creditType}] ${creditReason}`,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setCreditModalOpen(false);
        setToastMessage(`Đã ghi sổ cái và cộng +${formatVND(creditAmount)} vào ví dịch vụ của ${selectedTenant.name}!`);
        loadAdminData();
      } else {
        alert(resData.error || 'Lỗi khi cộng tiền');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể thực hiện tác vụ cộng tiền');
    } finally {
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleExtendTrial = async (tenantId: string, tenantName: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EXTEND_TRIAL',
          tenantId,
          reason: 'Gia hạn thêm 30 ngày dùng thử miễn phí từ Platform Admin Console',
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setToastMessage(`Đã gia hạn thành công thêm 30 ngày dùng thử cho ${tenantName}!`);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleImpersonate = (tenant: any) => {
    setToastMessage(`Đang chuyển quyền sang phiên hỗ trợ của: ${tenant.name}...`);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  const handleHealthCheck = () => {
    setHealthChecking(true);
    setTimeout(() => {
      setHealthChecking(false);
      setToastMessage('Kiểm tra kết nối 4/4 Webhook Gateways thành công — Tất cả đều phản hồi dưới 200ms!');
      setTimeout(() => setToastMessage(null), 3500);
    }, 900);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-3">
        <CircularProgress size={32} sx={{ color: '#3344D6' }} />
        <p className="text-xs text-slate-500 font-medium">Đang tải bảng điều khiển Platform Admin TingRoster...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalTenants: 142,
    activeTenants: 138,
    totalGroups: 320,
    totalMembers: 4820,
    systemGmv: 4280000000,
    platformFloat: 38600000,
    mrr: 68500000,
    webhookSuccessRate: 99.98,
    trialStats: {
      activeTrials: 14,
      expiringTrials: 5,
      convertedPaid: 18,
      conversionRate: 34.2,
    },
  };

  const filteredTenants = (data?.tenants || []).filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'ALL' || t.planType === planFilter;
    const matchesIndustry = industryFilter === 'ALL' || t.primaryType.includes(industryFilter);
    return matchesSearch && matchesPlan && matchesIndustry;
  });

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] flex text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* 1. Admin Dedicated Left Sidebar with 7 Groups */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        counts={{
          users: stats.totalTenants,
          tenants: stats.activeTenants,
          trials: stats.trialStats?.activeTrials || 14,
          pendingTopups: 1,
          tickets: 3,
        }}
      />

      {/* 2. Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[264px]'
        }`}
      >
        {/* Topbar */}
        <AdminTopbar
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onRefreshData={loadAdminData}
          onCheckGateways={handleHealthCheck}
          isRefreshing={loading}
          isCheckingGateways={healthChecking}
          onSelectTab={(tab) => setActiveTab(tab)}
          tenantsCount={stats.activeTenants}
          usersCount={stats.totalTenants}
        />

        {/* Main Canvas Scroll Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Toast Alert */}
          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Financial Domain Boundary Warning Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#111C33] border border-blue-200/80 dark:border-blue-900/50 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-l-4 border-l-[#3344D6]">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#3344D6] shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Nguyên tắc Phân định Ranh giới Tài chính Bất biến
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  <strong>Miền A (Platform Credits):</strong> Số dư nạp ví dịch vụ trả phí duy trì TingRoster (500đ/tx đối soát, ZNS).
                  <span className="mx-2 text-slate-300">|</span>
                  <strong>Miền B (Customer Collections):</strong> Tiền học phí/tiền trọ luân chuyển qua VietQR trực tiếp về STK ngân hàng của chủ cơ sở. <em>TingRoster zero-custody, tuyệt đối không gộp 2 dòng tiền này!</em>
                </p>
              </div>
            </div>
            <Link
              href="/docs/financial-domain-boundaries.md"
              target="_blank"
              className="text-xs font-semibold text-[#3344D6] hover:underline flex items-center gap-1 shrink-0 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 rounded-lg"
            >
              Đặc tả tài chính
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* ========================================================================= */}
          {/* TAB 0: OVERVIEW & ACTION QUEUE */}
          {/* ========================================================================= */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* 4 Master Platform KPI Cards with SpotlightCard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SpotlightCard
                  className="p-5 bg-white dark:bg-[#111C33] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs"
                  spotlightColor="rgba(51, 68, 214, 0.12)"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng cơ sở (Tenants)</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {stats.totalTenants} <span className="text-sm font-normal text-slate-500">cơ sở</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
                    <span>Đang hoạt động: <strong className="text-emerald-600 font-semibold">{stats.activeTenants}</strong></span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">100% active</span>
                  </p>
                </SpotlightCard>

                <SpotlightCard
                  className="p-5 bg-white dark:bg-[#111C33] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs"
                  spotlightColor="rgba(16, 185, 129, 0.12)"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Doanh thu định kỳ (MRR)</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {formatVND(stats.mrr)}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Phí duy trì & gói cước
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700">{formatCompactVND(stats.mrr)}</span>
                  </p>
                </SpotlightCard>

                <SpotlightCard
                  className="p-5 bg-white dark:bg-[#111C33] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs"
                  spotlightColor="rgba(99, 102, 241, 0.12)"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Dòng tiền đối soát (GMV)</span>
                    <div className="w-8 h-8 rounded-lg bg-black-50 dark:bg-black-950 text-indigo-600 flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-[#3344D6] dark:text-indigo-400 tracking-tight">
                    {formatVND(stats.systemGmv)}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3344D6]" />
                      Học phí & tiền trọ cơ sở
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-700">{formatCompactVND(stats.systemGmv)}</span>
                  </p>
                </SpotlightCard>

                <SpotlightCard
                  className="p-5 bg-white dark:bg-[#111C33] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs"
                  spotlightColor="rgba(168, 85, 247, 0.12)"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Quỹ ví nạp (Platform Float)</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-purple-700 dark:text-purple-400 tracking-tight">
                    {formatVND(stats.platformFloat)}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
                    <span>Sổ cái CreditLedgerEntry</span>
                    <span className="text-emerald-600 font-semibold text-[10px]">An toàn 100%</span>
                  </p>
                </SpotlightCard>
              </div>

              {/* Action Queue */}
              <div className="bg-white dark:bg-[#111726] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <BadgeAlert className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Hàng đợi Công việc Cần Admin Xử lý (Action Queue)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">3 việc cần chú ý</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Warning / Pending Top-up */}
                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2.5 transition-all hover:border-amber-400">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center whitespace-nowrap select-none px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                        Đơn nạp ví chờ duyệt
                      </span>
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">&gt; 30 phút</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      TOP-20261028-03: CLB Cầu Lông Thủ Đức
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Đơn nạp 1.000.000 đ chưa thấy webhook xác nhận từ VietQR Techcombank. Cần đối soát thủ công.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('CREDIT_LEDGER')}
                      className="text-xs font-bold text-[#2538D9] dark:text-indigo-400 hover:underline flex items-center gap-1 pt-1"
                    >
                      <span>Mở tab Sổ cái kiểm tra</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 2: Neutral / Info Trial Expiry */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-2.5 transition-all hover:border-indigo-400">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center whitespace-nowrap select-none px-2 py-0.5 rounded-md text-xs font-semibold bg-black-50 dark:bg-black-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                        Dùng thử sắp hết hạn
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">5 cơ sở (&le; 5 ngày)</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      Cần gửi thông báo nhắc nạp phí duy trì
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      5 cơ sở kết thúc dùng thử trong 5 ngày tới. Tự động gửi Zalo ZNS hướng dẫn nạp phí qua VietQR.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('TRIALS')}
                      className="text-xs font-bold text-[#2538D9] dark:text-indigo-400 hover:underline flex items-center gap-1 pt-1"
                    >
                      <span>Xem danh sách dùng thử</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 3: Danger / Ticket */}
                  <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-2.5 transition-all hover:border-rose-400">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center whitespace-nowrap select-none px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
                        Yêu cầu hỗ trợ mới
                      </span>
                      <span className="text-[11px] text-rose-700 dark:text-rose-400 font-bold">Ưu tiên cao</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      CLB Thủ Đức: Webhook chưa nhận callback
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Khách báo quét VietQR xong app chưa tự động tick xanh. Cần test lại đường truyền IPN.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('SUPPORT_TICKETS')}
                      className="text-xs font-bold text-[#2538D9] dark:text-indigo-400 hover:underline flex items-center gap-1 pt-1"
                    >
                      <span>Xử lý ticket ngay</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            {/* Growth & Conversion Funnel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#3344D6]" />
                  <span>Phễu Kích hoạt & Chuyển đổi Dùng thử (Trial Funnel)</span>
                </h3>
                <div className="space-y-2.5 pt-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>1. Đăng ký & Kích hoạt Trial 30 ngày</span>
                      <span className="font-bold text-slate-900">142 cơ sở (100%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-[#3344D6] h-2 rounded-full w-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>2. Tạo lớp học / dãy trọ & thêm thành viên</span>
                      <span className="font-bold text-slate-900">128 cơ sở (90.1%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-[#3344D6] h-2 rounded-full w-[90%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>3. Phát sinh giao dịch VietQR đầu tiên</span>
                      <span className="font-bold text-slate-900">96 cơ sở (67.6%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full w-[67%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>4. Nạp tiền duy trì sau khi hết 30 ngày (Converted)</span>
                      <span className="font-bold text-emerald-700">48 cơ sở (34.2%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full w-[34%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Sức khỏe Hạ tầng & Tích hợp Ngân hàng</span>
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-900 block">Cổng VietQR Napas 247</span>
                      <span className="text-[11px] text-slate-500">Độ trễ trung bình: 142ms</span>
                    </div>
                    <Chip label="ONLINE" size="small" sx={{ bgcolor: '#ECFDF3', color: '#067647', fontWeight: 700 }} />
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-900 block">Webhook SePay Callback</span>
                      <span className="text-[11px] text-slate-500">Độ trễ trung bình: 165ms</span>
                    </div>
                    <Chip label="ONLINE" size="small" sx={{ bgcolor: '#ECFDF3', color: '#067647', fontWeight: 700 }} />
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-900 block">Bot Zalo ZNS Thông báo nhắc phí</span>
                      <span className="text-[11px] text-slate-500">Tỷ lệ phát thành công: 99.4%</span>
                    </div>
                    <Chip label="ONLINE" size="small" sx={{ bgcolor: '#ECFDF3', color: '#067647', fontWeight: 700 }} />
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-900 block">PostgreSQL Connection Pool</span>
                      <span className="text-[11px] text-slate-500">Active connections: 24/100</span>
                    </div>
                    <Chip label="OPTIMAL" size="small" sx={{ bgcolor: '#EFF8FF', color: '#175CD3', fontWeight: 700 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: USERS DIRECTORY */}
        {/* ========================================================================= */}
        {activeTab === 'USERS' && (
          <UserDirectoryTab onActionToast={(msg) => setToastMessage(msg)} />
        )}

        {/* ========================================================================= */}
        {/* TAB: CLASSES & EDUCATIONAL CENTERS */}
        {/* ========================================================================= */}
        {activeTab === 'CLASSES' && (
          <ClassesAndRentalsTab initialType="CLASSES" />
        )}

        {/* ========================================================================= */}
        {/* TAB: RENTALS & PROPERTIES */}
        {/* ========================================================================= */}
        {activeTab === 'RENTALS' && (
          <ClassesAndRentalsTab initialType="RENTALS" />
        )}

        {/* ========================================================================= */}
        {/* TAB 1: TENANT & USER MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'TENANTS' && (
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm tên cơ sở, email..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#3344D6]"
                  />
                </div>

                {/* Plan Filter */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
                  {['ALL', 'PRO', 'FREE'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlanFilter(p)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        planFilter === p ? 'bg-white text-[#3344D6] shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {p === 'ALL' ? 'Tất cả gói' : p}
                    </button>
                  ))}
                </div>

                {/* Industry Filter */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
                  {[
                    { id: 'ALL', label: 'Tất cả ngành' },
                    { id: 'Lớp học', label: 'Lớp học' },
                    { id: 'Nhà trọ', label: 'Nhà trọ' },
                    { id: 'CLB', label: 'CLB' },
                  ].map((ind) => (
                    <button
                      key={ind.id}
                      onClick={() => setIndustryFilter(ind.id)}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        industryFilter === ind.id ? 'bg-white text-[#3344D6] shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {ind.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Hiển thị <strong>{filteredTenants.length}</strong> cơ sở
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Tên cơ sở / Tenant</th>
                    <th className="py-3 px-4">Loại hình</th>
                    <th className="py-3 px-4 text-center">Gói cước</th>
                    <th className="py-3 px-4 text-center">Hạn dùng thử 30 ngày</th>
                    <th className="py-3 px-4 text-center">Quy mô</th>
                    <th className="py-3 px-4 text-right">Số dư ví (Miền A)</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => {
                            setSelectedTenant(t);
                            setTenantDetailOpen(true);
                          }}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <Avatar name={t.name} size="sm" />
                          <div>
                            <span className="font-bold text-slate-900 text-xs block group-hover:text-[#3344D6] transition-colors">
                              {t.name}
                            </span>
                            <span className="text-[11px] text-slate-500 block">{t.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {t.primaryType}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.planType === 'PRO'
                              ? 'bg-black-50 text-[#3344D6] border border-indigo-200/80'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t.planType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {t.planType === 'PRO' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black-50 text-[#3344D6] border border-indigo-200">
                            Đã nâng cấp PRO
                          </span>
                        ) : t.trialStatus === 'EXPIRED' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Hết hạn dùng thử
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              (t.trialDaysLeft || 0) <= 5
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            Còn {t.trialDaysLeft ?? 24} ngày trial
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center tabular-nums text-slate-600 font-mono">
                        <span className="font-bold text-slate-900">{t.membersCount}</span> tv ({t.groupsCount} nhóm)
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatVND(t.serviceBalance || 100000)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3" /> Hoạt động
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleExtendTrial(t.id, t.name)}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[11px] font-semibold text-emerald-700 border border-emerald-200 transition-colors"
                            title="Gia hạn thêm 30 ngày dùng thử"
                          >
                            +30d
                          </button>
                          <button
                            onClick={() => handleImpersonate(t)}
                            className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-[#3344D6] transition-colors"
                            title="Hỗ trợ dưới quyền cơ sở này"
                          >
                            Truy cập
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTenant(t);
                              setCreditModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#3344D6]/10 hover:bg-[#3344D6]/20 text-[11px] font-semibold text-[#3344D6] transition-colors"
                            title="Cộng tiền số dư dịch vụ"
                          >
                            + Ví
                          </button>
                          <button
                            onClick={() => handleResetTenantPassword(t)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-1"
                            title="Cấp mật khẩu tạm thời an toàn"
                          >
                            <Key className="w-3 h-3 text-slate-500" />
                            <span>Đổi MK</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRIALS 30 DAYS */}
        {/* ========================================================================= */}
        {activeTab === 'TRIALS' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E5E7EB] dark:border-slate-800 p-5 border-l-4 border-l-[#2538D9] shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3344D6] text-white">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Chính sách Dùng Thử 30 Ngày</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      • Tỷ lệ chuyển đổi nạp phí: {stats.trialStats?.conversionRate || 34.2}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Quy định Thu Phí Duy Trì Dịch Vụ SaaS TingRoster
                  </h3>
                  <p className="text-xs text-slate-600 max-w-4xl leading-relaxed">
                    Mọi cơ sở đăng ký mới được cấp quyền <strong>dùng thử miễn phí 30 ngày không giới hạn tính năng</strong>. 
                    Sau khi kết thúc 30 ngày, <strong>CHỈ CÓ NGƯỜI QUẢN LÝ</strong> (Chủ nhà trọ, Thầy cô giáo, Chủ CLB) mới cần nạp tiền vào ví để duy trì hệ thống đối soát VietQR và bot nhắc nợ. <strong>Học viên, phụ huynh và khách thuê hoàn toàn không mất phí</strong>.
                  </p>
                </div>

                <div className="shrink-0 bg-white p-3.5 rounded-xl border border-slate-200 text-right shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Trial-to-Paid Rate</span>
                  <span className="text-2xl font-bold font-mono text-[#3344D6]">34.2%</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">+4.8% tháng này</span>
                </div>
              </div>
            </div>

            {/* Trial Table */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#3344D6]" />
                  <span>Danh sách Cơ sở đang trong kỳ Dùng thử 30 ngày</span>
                </h4>
                <span className="text-xs text-slate-500">
                  Hiển thị người quản lý cần chăm sóc & hỗ trợ nạp tiền duy trì
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Tên cơ sở / Người quản lý</th>
                      <th className="py-3 px-4">Loại hình quản lý</th>
                      <th className="py-3 px-4 text-center">Hạn dùng thử</th>
                      <th className="py-3 px-4 text-center">Ngày còn lại</th>
                      <th className="py-3 px-4 text-right">Số dư ví hiện tại</th>
                      <th className="py-3 px-4 text-center">Trạng thái Trial</th>
                      <th className="py-3 px-4 text-right">Thao tác Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.tenants.map((t) => (
                      <tr key={`trial-${t.id}`} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{t.name}</p>
                          <p className="text-[11px] text-slate-500">{t.email}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {t.primaryType}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-500">
                          {t.trialEndsAt ? formatDateVN(t.trialEndsAt) : '30 ngày'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span className={t.trialStatus === 'TRIAL_EXPIRING' ? 'text-amber-600' : 'text-[#3344D6]'}>
                            {t.trialDaysLeft ?? 24} ngày
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatVND(t.serviceBalance || 100000)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.planType === 'PRO'
                                ? 'bg-black-50 text-[#3344D6]'
                                : t.trialStatus === 'TRIAL_EXPIRING'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {t.planType === 'PRO' ? 'Converted PRO' : t.trialStatus === 'TRIAL_EXPIRING' ? 'Sắp hết hạn' : 'Đang dùng thử'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleExtendTrial(t.id, t.name)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200 transition-colors"
                            >
                              +30 ngày Trial
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTenant(t);
                                setCreditModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#3344D6] hover:bg-[#2538D9] text-white font-semibold text-[11px] transition-colors"
                            >
                              Nạp ví
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FINANCIAL OPERATIONS (REVENUE, TOPUP, LEDGER, COLLECTIONS) */}
        {/* ========================================================================= */}
        {activeTab === 'FINANCE_OVERVIEW' && (
          <FinancialOperationsTab initialSubTab="REVENUE" onActionToast={(msg) => setToastMessage(msg)} />
        )}
        {activeTab === 'TOPUP_ORDERS' && (
          <FinancialOperationsTab initialSubTab="TOPUP_ORDERS" onActionToast={(msg) => setToastMessage(msg)} />
        )}
        {activeTab === 'CREDIT_LEDGER' && (
          <FinancialOperationsTab initialSubTab="LEDGER" onActionToast={(msg) => setToastMessage(msg)} />
        )}
        {activeTab === 'COLLECTIONS_MONITOR' && (
          <FinancialOperationsTab initialSubTab="COLLECTIONS" onActionToast={(msg) => setToastMessage(msg)} />
        )}

        {/* ========================================================================= */}
        {/* TAB 4: GATEWAYS & WEBHOOKS */}
        {/* ========================================================================= */}
        {(activeTab === 'WEBHOOK_GATEWAYS' || activeTab === 'SYSTEM_HEALTH') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Giám sát Sức khỏe Cổng kết nối Webhook</h3>
                <p className="text-xs text-slate-500 mt-0.5">Thời gian thực theo dõi độ trễ phản hồi từ SePay, Casso và VietQR Napas</p>
              </div>

              <button
                onClick={handleHealthCheck}
                disabled={healthChecking}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-900 flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${healthChecking ? 'animate-spin text-[#3344D6]' : 'text-slate-500'}`} />
                <span>Kiểm tra kết nối toàn bộ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(data?.gateways || []).map((gw, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {gw.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{gw.name}</h4>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Uptime: {gw.uptime}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Độ trễ (Latency):</span>
                    <span className="font-bold font-mono text-[#3344D6] tabular-nums">{gw.latencyMs} ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SUPPORT TICKETS */}
        {/* ========================================================================= */}
        {activeTab === 'SUPPORT_TICKETS' && (
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-[#3344D6]" />
                  <span>Trung tâm Hỗ trợ & Tiếp nhận Yêu cầu Kỹ thuật</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Xử lý khiếu nại giao dịch đối soát, cài đặt VietQR và gia hạn dùng thử
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {MOCK_SUPPORT_TICKETS.map((ticket) => (
                <div key={ticket.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#3344D6]">{ticket.id}</span>
                      <span className="font-bold text-slate-900">{ticket.tenantName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ticket.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ticket.priority} PRIORITY
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      {ticket.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Chuyên mục: {ticket.category}</span>
                      <span>•</span>
                      <span>{ticket.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ticket.status === 'OPEN'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {ticket.status === 'OPEN' ? 'ĐANG XỬ LÝ' : 'ĐÃ ĐÓNG'}
                    </span>
                    <button className="px-3 py-1.5 rounded-lg bg-[#3344D6] text-white font-semibold text-xs hover:bg-[#2538D9] transition-colors">
                      Phản hồi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SECURITY & AUDIT TRAIL */}
        {/* ========================================================================= */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Nhật ký Kiểm toán & An ninh Nền tảng (Security Audit Trail)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Append-only log ghi nhận IP, sự kiện webhook và mọi can thiệp số dư
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {(data?.auditLogs || []).map((log) => (
                <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#3344D6]">{log.action}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                        {log.entityType} • {log.entityId}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-[11px] text-slate-500 font-mono max-w-2xl truncate">
                        {log.details}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-400 tabular-nums font-mono">
                    <span className="block font-medium text-slate-600">{log.ipAddress || '127.0.0.1'}</span>
                    <span>{formatDateVN(log.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: ANALYTICS GROWTH & AI */}
        {/* ========================================================================= */}
        {activeTab === 'ANALYTICS_GROWTH' && (
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E5E7EB] dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Báo Cáo Phễu Tăng Trưởng & Kích Hoạt Khách Hàng</h3>
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>1. Đăng ký & Kích hoạt Trial 30 ngày</span>
                  <span className="font-bold text-slate-900">{stats.totalTenants} cơ sở (100%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-[#2538D9] h-2.5 rounded-full w-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>2. Tạo lớp học / dãy trọ & thêm thành viên</span>
                  <span className="font-bold text-slate-900">128 cơ sở (90.1%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-[#2538D9] h-2.5 rounded-full w-[90%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>3. Phát sinh giao dịch VietQR đầu tiên</span>
                  <span className="font-bold text-slate-900">96 cơ sở (67.6%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-emerald-600 h-2.5 rounded-full w-[67%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>4. Nạp tiền duy trì sau khi hết 30 ngày (Converted)</span>
                  <span className="font-bold text-emerald-700">48 cơ sở (34.2%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-emerald-600 h-2.5 rounded-full w-[34%]"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ANALYTICS_AI' && (
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E5E7EB] dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Báo Cáo Hiệu Suất Trợ Lý AI & Bot Nhắc Nợ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-slate-50">
                <span className="text-xs text-slate-500 block">Lệnh Quét OCR Biên Lai Chuyển Khoản</span>
                <span className="text-2xl font-bold text-[#2538D9] block mt-1">1.840 lượt</span>
                <span className="text-[11px] text-emerald-600 font-semibold">Độ chính xác: 99.2%</span>
              </div>
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-slate-50">
                <span className="text-xs text-slate-500 block">Tin Nhắn Nhắc Phí Tự Động (Zalo ZNS)</span>
                <span className="text-2xl font-bold text-emerald-600 block mt-1">4.210 tin</span>
                <span className="text-[11px] text-slate-500">Tỷ lệ mở xem: 94.5%</span>
              </div>
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-slate-50">
                <span className="text-xs text-slate-500 block">Khuyến Nghị Thu Nợ AI Thành Công</span>
                <span className="text-2xl font-bold text-purple-700 block mt-1">89.4%</span>
                <span className="text-[11px] text-emerald-600 font-semibold">Rút ngắn kỳ thu nợ 4.2 ngày</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: SUPPORT & DISPUTE TICKETS */}
        {/* ========================================================================= */}
        {activeTab === 'SUPPORT_TICKETS' && (
          <SupportTicketsTab />
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SYSTEM & PLATFORM CONFIGURATION (CẤU HÌNH CÁC PHẦN) */}
        {/* ========================================================================= */}
        {activeTab === 'CONFIG' && (
          <PlatformConfigTab onSaveSuccess={(msg: string) => setToastMessage(msg)} />
        )}
      </main>
      </div>

      {/* Grant Credit Modal */}
      <Dialog
        open={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1rem',
              padding: '8px',
            },
          },
        }}
      >
        <DialogTitle className="pb-2">
          <span className="font-bold text-base text-slate-900 block">Cộng tiền số dư ví dịch vụ</span>
          <span className="text-[11px] text-slate-500 font-normal">{selectedTenant?.name}</span>
        </DialogTitle>

        <DialogContent className="space-y-3 pt-2 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">Số tiền cộng (VNĐ)</label>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">Loại điều chỉnh</label>
            <TextField
              select
              fullWidth
              size="small"
              value={creditType}
              onChange={(e) => setCreditType(e.target.value as any)}
            >
              <MenuItem value="ADJUSTMENT">Điều chỉnh số dư nội bộ (ADJUSTMENT)</MenuItem>
              <MenuItem value="TOP_UP">Nạp tiền có đối soát (TOP_UP)</MenuItem>
              <MenuItem value="COMPENSATION">Bồi hoàn cước do lỗi đối soát (COMPENSATION)</MenuItem>
            </TextField>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">Lý do điều chỉnh (bắt buộc)</label>
            <TextField
              fullWidth
              size="small"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              placeholder="Nhập lý do chi tiết để ghi vào Sổ cái..."
            />
          </div>
        </DialogContent>

        <DialogActions className="p-4 pt-1 gap-2">
          <Button
            variant="outlined"
            onClick={() => setCreditModalOpen(false)}
            sx={{ color: '#475467', borderColor: '#E4E7EC', textTransform: 'none', borderRadius: '8px' }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleGrantCredit}
            sx={{
              backgroundColor: '#3344D6',
              '&:hover': { backgroundColor: '#2538D9' },
              textTransform: 'none',
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            Xác nhận ghi sổ cái
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tenant Detail Modal */}
      <Dialog
        open={tenantDetailOpen}
        onClose={() => setTenantDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1rem',
              padding: '16px',
            },
          },
        }}
      >
        <DialogTitle className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar name={selectedTenant?.name || ''} size="md" />
              <div>
                <span className="font-bold text-base text-slate-900 block leading-tight">
                  {selectedTenant?.name}
                </span>
                <span className="text-xs text-slate-500 font-normal">
                  {selectedTenant?.email} • ID: {selectedTenant?.id}
                </span>
              </div>
            </div>
            <Chip
              label={selectedTenant?.planType}
              size="small"
              sx={{ bgcolor: '#EEF2FF', color: '#3344D6', fontWeight: 700 }}
            />
          </div>
        </DialogTitle>

        <DialogContent className="pt-4 space-y-3.5 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-500 text-[11px] block">Loại hình cơ sở</span>
              <span className="font-semibold text-slate-900">{selectedTenant?.primaryType}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Số dư ví dịch vụ</span>
              <span className="font-bold font-mono text-emerald-700 text-sm">
                {formatVND(selectedTenant?.serviceBalance || 100000)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Quy mô thành viên</span>
              <span className="font-semibold text-slate-900">
                {selectedTenant?.membersCount} thành viên ({selectedTenant?.groupsCount} nhóm)
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Hạn dùng thử 30 ngày</span>
              <span className="font-semibold text-[#3344D6]">
                {selectedTenant?.trialDaysLeft ?? 24} ngày còn lại
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 text-xs block">Tài khoản ngân hàng đối soát</span>
            <p className="text-[11px] text-slate-600">
              {selectedTenant?.bankInfo || 'MBBank — 0987654321 (Chủ TK: NGUYEN VAN MINH)'}
            </p>
          </div>
        </DialogContent>

        <DialogActions className="p-4 pt-2 gap-2 border-t border-slate-100">
          <Button
            variant="outlined"
            onClick={() => setTenantDetailOpen(false)}
            sx={{ color: '#475467', borderColor: '#E4E7EC', textTransform: 'none', borderRadius: '8px' }}
          >
            Đóng
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setTenantDetailOpen(false);
              setCreditModalOpen(true);
            }}
            sx={{
              bgcolor: '#3344D6',
              '&:hover': { bgcolor: '#2538D9' },
              textTransform: 'none',
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            + Nạp ví cơ sở này
          </Button>
        </DialogActions>
      </Dialog>

      {/* Temporary Password Dialog */}
      <Dialog
        open={tempPasswordModalOpen}
        onClose={() => setTempPasswordModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '1rem', padding: '16px' } },
        }}
      >
        <DialogTitle className="pb-2">
          <span className="font-bold text-base text-slate-900 block">Mật khẩu Tạm thời Mới</span>
          <span className="text-xs text-slate-500 font-normal">{selectedTenant?.email}</span>
        </DialogTitle>
        <DialogContent className="space-y-3 pt-2 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 leading-relaxed">
            <strong>Bảo mật:</strong> Mật khẩu này được tạo ngẫu nhiên và mã hóa một chiều bằng bcrypt trong database.
            Mật khẩu dưới đây chỉ hiển thị <strong>một lần duy nhất</strong> trên màn hình này. Hãy copy và gửi trực tiếp cho chủ cơ sở, yêu cầu đổi sau lần đăng nhập đầu tiên.
          </div>

          <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between font-mono text-base font-bold tracking-wider">
            <span>{tempPasswordResult}</span>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                if (tempPasswordResult) {
                  navigator.clipboard.writeText(tempPasswordResult);
                  alert('Đã sao chép mật khẩu tạm thời vào clipboard!');
                }
              }}
              sx={{ backgroundColor: '#2538D9', textTransform: 'none', fontSize: '11px' }}
            >
              Sao chép
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTempPasswordModalOpen(false)}>Đã lưu và đóng</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
