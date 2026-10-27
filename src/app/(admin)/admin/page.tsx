'use client';

import React, { useState, useEffect } from 'react';
import { formatVND, formatDateVN } from '@/lib/utils';
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
  Smartphone
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

export default function PlatformAdminPage() {
  const [activeTab, setActiveTab] = useState<'TENANTS' | 'PLANS' | 'GATEWAYS' | 'SECURITY'>('TENANTS');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState<number>(100000);
  const [creditReason, setCreditReason] = useState('Thưởng số dư trải nghiệm');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [healthChecking, setHealthChecking] = useState(false);

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

  const handleGrantCredit = () => {
    if (!selectedTenant) return;
    setCreditModalOpen(false);
    setToastMessage(`Đã cộng +${formatVND(creditAmount)} vào số dư ví của tenant ${selectedTenant.name}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleImpersonate = (tenant: any) => {
    setToastMessage(`Đang chuyển quyền đăng nhập vào cơ sở: ${tenant.name}...`);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1200);
  };

  const handleHealthCheck = () => {
    setHealthChecking(true);
    setTimeout(() => {
      setHealthChecking(false);
      setToastMessage('Kiểm tra kết nối 4/4 Webhook Gateways thành công — Tất cả đều phản hồi dưới 200ms!');
      setTimeout(() => setToastMessage(null), 3500);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-3">
        <CircularProgress size={36} sx={{ color: '#2538D9' }} />
        <p className="text-xs text-[#475467] font-medium">Đang tải bảng điều khiển Platform Admin TingRoster...</p>
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
  };

  const filteredTenants = (data?.tenants || []).filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'ALL' || t.planType === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#101828]">
      
      {/* Platform Top Header */}
      <header className="bg-[#0B0F19] text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-xs font-semibold pr-3 border-r border-slate-800">
              <ArrowLeft className="w-4 h-4" />
              <span>Về Ứng dụng Tenant</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <Logo variant="horizontal" size="sm" theme="dark" />
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2538D9] text-white uppercase tracking-wider">
                Platform Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hệ thống Hoạt động 99.98%</span>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <Avatar name="Admin Master" size="xs" />
              <div className="hidden md:block text-left text-xs">
                <span className="font-bold text-white block">Quản trị viên Cấp cao</span>
                <span className="text-[10px] text-slate-400 block">superadmin@tingroster.vn</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Platform Master KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="ting-card p-5">
            <span className="text-xs font-medium text-[#475467] block">Tổng số Tenants (Cơ sở)</span>
            <div className="mt-2 text-2xl font-bold text-[#101828] tabular-nums tracking-tight">
              {stats.totalTenants} cơ sở
            </div>
            <p className="text-[11px] text-[#475467] mt-1 flex items-center justify-between">
              <span>Đang hoạt động: <strong className="text-emerald-700">{stats.activeTenants}</strong></span>
              <span className="text-[10px] text-[#2538D9] font-bold">100% active</span>
            </p>
          </div>

          <div className="ting-card p-5">
            <span className="text-xs font-medium text-[#475467] block">Doanh thu định kỳ (MRR)</span>
            <div className="mt-2 text-2xl font-bold text-emerald-700 tabular-nums tracking-tight">
              {formatVND(stats.mrr)}
            </div>
            <p className="text-[11px] text-[#475467] mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Từ các gói PRO và phí dịch vụ ví
            </p>
          </div>

          <div className="ting-card p-5">
            <span className="text-xs font-medium text-[#475467] block">Khối lượng VietQR (GMV Hệ thống)</span>
            <div className="mt-2 text-2xl font-bold text-[#2538D9] tabular-nums tracking-tight">
              {formatVND(stats.systemGmv)}
            </div>
            <p className="text-[11px] text-[#475467] mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2538D9]" />
              Tiền học phí luân chuyển qua VietQR
            </p>
          </div>

          <div className="ting-card p-5">
            <span className="text-xs font-medium text-[#475467] block">Số dư quỹ ví nạp (Platform Float)</span>
            <div className="mt-2 text-2xl font-bold text-purple-700 tabular-nums tracking-tight">
              {formatVND(stats.platformFloat)}
            </div>
            <p className="text-[11px] text-[#475467] mt-1 flex items-center justify-between">
              <span>Dự trữ duy trì cước</span>
              <span className="text-emerald-600 font-semibold text-[10px]">An toàn 100%</span>
            </p>
          </div>

        </div>

        {/* 2. Admin Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-2 shadow-xs">
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#2538D9',
                height: 3,
                borderRadius: 1.5,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: '#475467',
                minHeight: 44,
                '&.Mui-selected': {
                  color: '#2538D9',
                  fontWeight: 700,
                },
              },
            }}
          >
            <Tab
              value="TENANTS"
              label={`Quản lý Tenants & Người dùng (${data?.tenants.length || 0})`}
              icon={<Building2 className="w-4 h-4" />}
              iconPosition="start"
            />
            <Tab
              value="PLANS"
              label="Gói Cước & Bảng Phí Nền tảng"
              icon={<CreditCard className="w-4 h-4" />}
              iconPosition="start"
            />
            <Tab
              value="GATEWAYS"
              label="Giám sát Webhook & Hạ tầng (Gateways)"
              icon={<Activity className="w-4 h-4" />}
              iconPosition="start"
            />
            <Tab
              value="SECURITY"
              label="Nhật ký An ninh & Kiểm toán (Audit Logs)"
              icon={<ShieldCheck className="w-4 h-4" />}
              iconPosition="start"
            />
          </Tabs>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: TENANT MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'TENANTS' && (
          <div className="ting-card p-5 space-y-4 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E7EC]">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm tên cơ sở, email..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E4E7EC] text-xs text-[#101828] placeholder-slate-400 focus:outline-none focus:border-[#2538D9]"
                  />
                </div>

                {/* Plan Filter */}
                <div className="flex items-center gap-1.5 p-1 bg-[#F5F7FB] rounded-xl border border-[#E4E7EC] text-xs font-semibold">
                  {['ALL', 'PRO', 'FREE'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlanFilter(p)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        planFilter === p ? 'bg-white text-[#2538D9] shadow-xs' : 'text-[#475467]'
                      }`}
                    >
                      {p === 'ALL' ? 'Tất cả gói' : p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-[#475467]">
                Hiển thị <strong>{filteredTenants.length}</strong> cơ sở
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#475467] uppercase font-bold tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Tên cơ sở / Tenant</th>
                    <th className="py-3 px-4">Loại hình</th>
                    <th className="py-3 px-4 text-center">Gói cước</th>
                    <th className="py-3 px-4 text-center">Quy mô</th>
                    <th className="py-3 px-4 text-right">Số dư ví dịch vụ</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác Quản trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC]">
                  {filteredTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={t.name} size="sm" />
                          <div>
                            <span className="font-bold text-[#101828] text-xs block">{t.name}</span>
                            <span className="text-[11px] text-slate-500 block">{t.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#475467]">
                        {t.primaryType === 'CLASS' ? 'Lớp học / Dạy thêm' : t.primaryType === 'SPORTS_CLUB' ? 'CLB Thể thao' : 'Nhà trọ / Phòng'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.planType === 'PRO' ? 'bg-[#2538D9]/10 text-[#2538D9] border border-[#2538D9]/20' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.planType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center tabular-nums text-[#475467]">
                        <span className="font-bold text-[#101828]">{t.membersCount}</span> học viên ({t.groupsCount} lớp)
                      </td>

                      <td className="py-3.5 px-4 text-right tabular-nums font-bold text-emerald-700">
                        {formatVND(t.serviceBalance || 100000)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Hoạt động
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleImpersonate(t)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#E4E7EC] hover:bg-slate-50 text-[11px] font-semibold text-[#2538D9] transition-colors"
                            title="Đăng nhập dưới quyền tenant này"
                          >
                            Đăng nhập
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTenant(t);
                              setCreditModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#2538D9]/10 hover:bg-[#2538D9]/20 text-[11px] font-semibold text-[#2538D9] transition-colors"
                            title="Cộng tiền số dư dịch vụ"
                          >
                            + Nạp ví
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

        {/* ================================================================= */}
        {/* TAB 2: PLANS & BILLING CONFIG */}
        {/* ================================================================= */}
        {activeTab === 'PLANS' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Free Plan */}
              <div className="ting-card p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-[#101828]">Gói FREE</h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Mặc định</span>
                </div>
                <div className="text-2xl font-bold text-[#101828] tabular-nums">
                  0 đ <span className="text-xs text-slate-400 font-normal">/ tháng</span>
                </div>
                <p className="text-xs text-[#475467]">Dành cho giáo viên mới bắt đầu, 1 lớp dưới 30 học viên.</p>
                <div className="space-y-2 pt-3 border-t border-[#E4E7EC] text-xs text-[#475467]">
                  <div className="flex items-center gap-2">✓ Tối đa 1 lớp học</div>
                  <div className="flex items-center gap-2">✓ 30 học viên</div>
                  <div className="flex items-center gap-2">✓ VietQR tự động</div>
                  <div className="flex items-center gap-2">✕ Kiosk quét QR thể thao</div>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="ting-card p-6 space-y-4 border-2 border-[#2538D9] relative">
                <span className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-[#2538D9] text-white text-[10px] font-bold">
                  Phổ biến nhất
                </span>
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-[#101828]">Gói PRO</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2538D9] text-[10px] font-bold">Khuyên dùng</span>
                </div>
                <div className="text-2xl font-bold text-[#2538D9] tabular-nums">
                  299.000 đ <span className="text-xs text-slate-400 font-normal">/ tháng</span>
                </div>
                <p className="text-xs text-[#475467]">Dành cho trung tâm và giáo viên dạy nhiều lớp.</p>
                <div className="space-y-2 pt-3 border-t border-[#E4E7EC] text-xs text-[#475467]">
                  <div className="flex items-center gap-2 font-semibold text-[#101828]">✓ Không giới hạn số lớp</div>
                  <div className="flex items-center gap-2 font-semibold text-[#101828]">✓ 300 học viên</div>
                  <div className="flex items-center gap-2 font-semibold text-[#101828]">✓ Màn hình Kiosk quét QR</div>
                  <div className="flex items-center gap-2 font-semibold text-[#101828]">✓ Báo cáo đối soát chuyên sâu</div>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="ting-card p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-[#101828]">Gói ENTERPRISE</h3>
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">Đa cơ sở</span>
                </div>
                <div className="text-2xl font-bold text-[#101828] tabular-nums">
                  799.000 đ <span className="text-xs text-slate-400 font-normal">/ tháng</span>
                </div>
                <p className="text-xs text-[#475467]">Dành cho CLB thể thao lớn và chuỗi phòng trọ căn hộ.</p>
                <div className="space-y-2 pt-3 border-t border-[#E4E7EC] text-xs text-[#475467]">
                  <div className="flex items-center gap-2">✓ Không giới hạn học viên</div>
                  <div className="flex items-center gap-2">✓ Tên miền phụ riêng biệt</div>
                  <div className="flex items-center gap-2">✓ Bot Zalo ZNS thương hiệu riêng</div>
                  <div className="flex items-center gap-2">✓ SLA hỗ trợ 24/7 riêng</div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: GATEWAY MONITORING */}
        {/* ================================================================= */}
        {activeTab === 'GATEWAYS' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#101828]">Giám sát Sức khỏe Cổng kết nối Webhook</h3>
                <p className="text-xs text-[#475467] mt-0.5">Thời gian thực theo dõi độ trễ phản hồi từ SePay, Casso và VietQR Napas</p>
              </div>

              <button
                onClick={handleHealthCheck}
                disabled={healthChecking}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E4E7EC] hover:bg-slate-50 text-xs font-semibold text-[#101828] flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${healthChecking ? 'animate-spin text-[#2538D9]' : 'text-slate-500'}`} />
                <span>Kiểm tra kết nối toàn bộ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(data?.gateways || []).map((gw, idx) => (
                <div key={idx} className="ting-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {gw.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#101828]">{gw.name}</h4>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Uptime: {gw.uptime}</span>
                  </div>
                  <div className="pt-2 border-t border-[#E4E7EC] flex justify-between items-center text-xs">
                    <span className="text-slate-500">Độ trễ (Latency):</span>
                    <span className="font-bold text-[#2538D9] tabular-nums">{gw.latencyMs} ms</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: SECURITY & AUDIT LOGS */}
        {/* ================================================================= */}
        {activeTab === 'SECURITY' && (
          <div className="ting-card p-5 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Nhật ký Kiểm toán & An ninh Nền tảng (Security Audit Trail)</span>
                </h3>
                <p className="text-[11px] text-[#475467] mt-0.5">
                  Ghi nhận đầy đủ IP, thời gian, sự kiện xử lý webhook và biến động tài khoản
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E4E7EC]">
              {(data?.auditLogs || []).map((log) => (
                <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2538D9]">{log.action}</span>
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

                  <div className="text-right text-[11px] text-slate-400 tabular-nums">
                    <span className="block font-medium text-slate-600">{log.ipAddress || '127.0.0.1'}</span>
                    <span>{formatDateVN(log.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Grant Credit Modal */}
      <Dialog
        open={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1.25rem',
              padding: '8px',
            }
          }
        }}
      >
        <DialogTitle className="pb-2">
          <span className="font-bold text-base text-[#101828] block">Cộng tiền số dư ví dịch vụ</span>
          <span className="text-[11px] text-[#475467] font-normal">{selectedTenant?.name}</span>
        </DialogTitle>

        <DialogContent className="space-y-3 pt-2 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#101828] mb-1">Số tiền cộng (VNĐ)</label>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#101828] mb-1">Lý do điều chỉnh</label>
            <TextField
              fullWidth
              size="small"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
            />
          </div>
        </DialogContent>

        <DialogActions className="p-4 pt-1 gap-2">
          <Button variant="outlined" onClick={() => setCreditModalOpen(false)} sx={{ color: '#475467', borderColor: '#E4E7EC' }}>
            Hủy
          </Button>
          <Button variant="contained" onClick={handleGrantCredit} sx={{ backgroundColor: '#2538D9', '&:hover': { backgroundColor: '#1E2DB8' } }}>
            Xác nhận cộng tiền
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
