'use client';

import React, { useState } from 'react';
import {
  Menu as MenuIcon,
  Search,
  RefreshCw,
  BellRing,
  ShieldCheck,
  Zap,
  Building2,
  Users,
  CreditCard,
  X,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { AdminTabKey } from './AdminSidebar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { useTheme } from '@/components/theme/ThemeContext';

interface AdminTopbarProps {
  activeTab: AdminTabKey;
  onOpenMobileSidebar: () => void;
  onRefreshData: () => void;
  onCheckGateways: () => void;
  isRefreshing: boolean;
  isCheckingGateways: boolean;
  onSelectTab: (tab: AdminTabKey) => void;
  tenantsCount?: number;
  usersCount?: number;
}

export function AdminTopbar({
  activeTab,
  onOpenMobileSidebar,
  onRefreshData,
  onCheckGateways,
  isRefreshing,
  isCheckingGateways,
  onSelectTab,
  tenantsCount = 138,
  usersCount = 142,
}: AdminTopbarProps) {
  const { isDark, toggleTheme, sidebarTheme, cycleSidebarTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Tab metadata
  const tabMetadata: Record<AdminTabKey, { group: string; title: string; desc: string }> = {
    OVERVIEW: {
      group: 'Điều hành',
      title: 'Tổng quan Hệ thống & Báo cáo Điều hành',
      desc: 'Giám sát toàn bộ KPI cốt lõi, dòng tiền đối soát VietQR và tình trạng hoạt động',
    },
    ACTION_QUEUE: {
      group: 'Điều hành',
      title: 'Hàng đợi Công việc Cần Admin Xử lý',
      desc: '3 việc khẩn cấp: Đơn nạp pending > 30p, Trial sắp hết hạn, Ticket hỗ trợ',
    },
    SYSTEM_HEALTH: {
      group: 'Điều hành',
      title: 'Sức khỏe Hạ tầng & Tích hợp Ngân hàng',
      desc: 'Giám sát kết nối Napas 247, SePay Callback, Casso và Bot thông báo Zalo ZNS',
    },
    USERS: {
      group: 'Khách hàng',
      title: 'Danh bạ Người dùng Toàn Nền tảng (Users Directory)',
      desc: 'Quản lý tài khoản cá nhân, thông tin định danh che (masked), vai trò và trạng thái',
    },
    TENANTS: {
      group: 'Khách hàng',
      title: 'Quản lý Cơ sở & Khách hàng (Tenants)',
      desc: 'Theo dõi 138 cơ sở giáo dục, CLB thể thao và nhà trọ đang hoạt động trên hệ thống',
    },
    CLASSES: {
      group: 'Khách hàng',
      title: 'Quản lý Lớp học & Trung tâm Giáo dục',
      desc: 'Sĩ số học viên, số buổi điểm danh, tiến độ thu học phí và tỷ lệ chuyên cần',
    },
    RENTALS: {
      group: 'Khách hàng',
      title: 'Quản lý Nhà trọ & Bất động sản Cho thuê',
      desc: 'Tỷ lệ lấp đầy phòng, hạn hợp đồng thuê, công nợ tiền phòng và hóa đơn dịch vụ',
    },
    TRIALS: {
      group: 'Khách hàng',
      title: 'Quản lý Dùng thử 30 Ngày & Phễu Chuyển đổi',
      desc: 'Theo dõi 14 cơ sở đang trial, cảnh báo hết hạn và tỷ lệ nạp phí duy trì',
    },
    FINANCE_OVERVIEW: {
      group: 'Tài chính',
      title: 'Doanh thu Nền tảng & Phí Dịch vụ (Miền A Float)',
      desc: 'MRR từ cước phần mềm và phí duy trì 500đ/giao dịch VietQR đối soát',
    },
    TOPUP_ORDERS: {
      group: 'Tài chính',
      title: 'Đơn Nạp Tiền Ví Dịch vụ (Top-up Orders)',
      desc: 'Quản lý luồng nạp tiền của chủ cơ sở qua VietQR Napas 247 để duy trì hệ thống',
    },
    CREDIT_LEDGER: {
      group: 'Tài chính',
      title: 'Sổ cái Biến động Ví Dịch vụ (Credit Ledger)',
      desc: 'Bút toán append-only ghi nhận cộng tiền, trừ phí webhook và bồi hoàn đối soát',
    },
    COLLECTIONS_MONITOR: {
      group: 'Tài chính',
      title: 'Giám sát Tiền Thu Cơ sở (Customer Collections - Miền B)',
      desc: 'TingRoster zero-custody: Học phí & tiền trọ chuyển thẳng về STK ngân hàng của chủ cơ sở',
    },
    ANALYTICS_GROWTH: {
      group: 'Báo cáo',
      title: 'Phân tích Tăng trưởng & Phễu Kích hoạt',
      desc: 'Tỷ lệ hoàn tất Onboarding, phát sinh giao dịch VietQR đầu tiên và chuyển đổi',
    },
    ANALYTICS_AI: {
      group: 'Báo cáo',
      title: 'Hiệu suất Trợ lý AI & Bot Thông minh',
      desc: 'Tần suất quét OCR biên lai chuyển khoản và trợ lý nhắc nợ thông minh',
    },
    SUPPORT_TICKETS: {
      group: 'Vận hành',
      title: 'Trung tâm Tiếp nhận & Xử lý Yêu cầu Hỗ trợ',
      desc: 'Danh sách sự cố và ticket hỗ trợ kỹ thuật từ chủ cơ sở và người quản lý',
    },
    WEBHOOK_GATEWAYS: {
      group: 'Vận hành',
      title: 'Giám sát Cổng Webhook & API Đối soát',
      desc: 'Độ trễ phản hồi, tỷ lệ thành công 99.98% và cơ chế tự động thử lại khi lỗi',
    },
    CONFIG: {
      group: 'Cấu hình',
      title: 'Cấu hình Hệ thống & Biểu phí Nền tảng',
      desc: 'Thiết lập thời gian trial 30 ngày, biểu phí 500đ/tx, gói Pro 299k và tài khoản nhận cước',
    },
    AUDIT_LOGS: {
      group: 'An ninh',
      title: 'Nhật ký An ninh & Kiểm toán Quản trị (Audit Trail)',
      desc: 'Truy vết toàn bộ hành vi nhạy cảm: Cộng tiền ví, gia hạn trial, phân quyền và IP tracing',
    },
  };

  const currentMeta = tabMetadata[activeTab] || tabMetadata.OVERVIEW;

  // Search quick items
  const quickSearchItems = [
    { label: 'CLB Cầu Lông Thủ Đức Stars', type: 'Tenant', tab: 'TENANTS' as AdminTabKey },
    { label: 'Thầy Hưng Toán Luyện Thi ĐH', type: 'Tenant', tab: 'TENANTS' as AdminTabKey },
    { label: 'Nhà Trọ An Cư 12 Phòng', type: 'Rental', tab: 'RENTALS' as AdminTabKey },
    { label: 'TOP-20261028-03 (PENDING 1.000.000 đ)', type: 'Order', tab: 'TOPUP_ORDERS' as AdminTabKey },
    { label: 'Hỗ trợ SePay Webhook chưa nhận callback', type: 'Ticket', tab: 'SUPPORT_TICKETS' as AdminTabKey },
    { label: 'Cấu hình biểu phí 500đ/tx & Gói Pro 299k', type: 'Config', tab: 'CONFIG' as AdminTabKey },
  ];

  const filteredItems = quickSearchItems.filter((i) =>
    i.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#0E1526] border-b border-[#E5E7EB] dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left: Mobile hamburger & Context Header */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-400 truncate">
              <span>Platform Admin</span>
              <span>/</span>
              <span className="text-[#2538D9] dark:text-indigo-400 font-semibold">{currentMeta.group}</span>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300 truncate">{currentMeta.title}</span>
            </div>

            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate leading-tight">
              {currentMeta.title}
            </h1>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Global Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium transition-all shadow-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tìm kiếm toàn hệ thống...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500">
              Ctrl K
            </kbd>
          </button>

          {/* Webhook SLA Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SLA 99.98%</span>
          </div>

          {/* Check Gateways Button */}
          <button
            onClick={onCheckGateways}
            disabled={isCheckingGateways}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{isCheckingGateways ? 'Đang kiểm tra...' : 'Kiểm tra Gateways'}</span>
          </button>

          {/* Theme & Sidebar Controls */}
          <button
            onClick={cycleSidebarTheme}
            className="p-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-xs"
            title={`Kiểu Sidebar: ${sidebarTheme === 'auto' ? 'Tự động' : sidebarTheme === 'light' ? 'Sáng' : 'Tối'} (Bấm để đổi)`}
          >
            <Palette className="w-4 h-4 text-[#2538D9]" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-xs"
            title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Refresh Data Button */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-xs"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#2538D9]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1rem',
              padding: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
            },
          },
        }}
      >
        <div className="p-3 border-b border-[#E5E7EB] flex items-center gap-2.5">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm cơ sở, người dùng, mã đơn nạp (TRTOP), ticket hỗ trợ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-slate-900 placeholder:text-slate-400 font-medium"
            autoFocus
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <DialogContent className="p-2 space-y-1 max-h-80 overflow-y-auto">
          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Kết quả gợi ý thao tác nhanh
          </div>
          {filteredItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectTab(item.tab);
                setSearchOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#2538D9]">
                  {item.type}
                </span>
                <span className="font-semibold text-slate-800">{item.label}</span>
              </div>
              <span className="text-[11px] text-slate-400">Chuyển đến tab &rarr;</span>
            </button>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
}
