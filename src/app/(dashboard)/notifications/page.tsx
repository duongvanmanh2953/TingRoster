'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Check,
  Trash2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  Chip,
  Button as MuiButton,
  Tabs,
  Tab,
  Box,
  Badge,
} from '@mui/material';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  type: 'PAYMENT' | 'ATTENDANCE' | 'SYSTEM' | 'SECURITY';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'PAYMENT',
    title: 'Giao dịch đối soát tự động thành công',
    message: 'Học sinh Nguyễn Văn An đã thanh toán 1.200.000 đ cho hóa đơn TR-2026-10-001 qua VietQR SeABank.',
    timestamp: '10 phút trước',
    read: false,
    severity: 'success',
    actionUrl: '/transactions',
    actionText: 'Xem giao dịch',
  },
  {
    id: 'notif-2',
    type: 'PAYMENT',
    title: 'Cảnh báo giao dịch chưa khớp nội dung',
    message: 'Nhận 850.000 đ từ MBBank nhưng nội dung "Chuyen tien hoc phi" thiếu mã nhận diện TR. Cần gán thủ công.',
    timestamp: '45 phút trước',
    read: false,
    severity: 'warning',
    actionUrl: '/transactions',
    actionText: 'Đối soát ngay',
  },
  {
    id: 'notif-3',
    type: 'ATTENDANCE',
    title: 'Điểm danh buổi học: Lớp Toán 12 Nâng cao',
    message: 'Buổi học kết thúc lúc 09:30. Đã ghi nhận 18/20 học viên có mặt, 2 học viên vắng có phép.',
    timestamp: '2 giờ trước',
    read: true,
    severity: 'info',
    actionUrl: '/attendance',
    actionText: 'Xem sổ điểm danh',
  },
  {
    id: 'notif-4',
    type: 'SYSTEM',
    title: 'Thời gian dùng thử 30 ngày đang kích hoạt',
    message: 'Workspace của bạn còn 24 ngày dùng thử không giới hạn tính năng. Nâng cấp bất cứ lúc nào tại mục Gói dịch vụ.',
    timestamp: '1 ngày trước',
    read: true,
    severity: 'info',
    actionUrl: '/billing',
    actionText: 'Xem gói dịch vụ',
  },
  {
    id: 'notif-5',
    type: 'SECURITY',
    title: 'Phiên đăng nhập mới từ IP 14.161.42.11',
    message: 'Đăng nhập thành công trên trình duyệt Chrome (Windows 11). Nếu không phải bạn, hãy đổi mật khẩu ngay.',
    timestamp: '2 ngày trước',
    read: true,
    severity: 'info',
    actionUrl: '/settings',
    actionText: 'Bảo mật tài khoản',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [tabIndex, setTabIndex] = useState(0);
  const [filterType, setFilterType] = useState<string>('ALL');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (tabIndex === 1 && n.read) return false;
    if (filterType !== 'ALL' && n.type !== filterType) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hộp thư thông báo
            </h1>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} mới`}
                size="small"
                sx={{
                  bgcolor: '#3344D6',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Theo dõi tức thời biến động thanh toán, điểm danh, tin nhắn ZNS và cảnh báo bảo mật.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <MuiButton
              variant="outlined"
              size="small"
              startIcon={<Check size={16} />}
              onClick={handleMarkAllRead}
              sx={{
                textTransform: 'none',
                borderColor: '#E2E8F0',
                color: '#334155',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              Đánh dấu tất cả đã đọc
            </MuiButton>
          )}
        </div>
      </div>

      {/* Filter Tabs & Categories */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          value={tabIndex}
          onChange={(_, val) => setTabIndex(val)}
          sx={{
            minHeight: '40px',
            '& .MuiTab-root': {
              minHeight: '40px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#64748B',
              '&.Mui-selected': {
                color: '#3344D6',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#3344D6',
              height: 2,
            },
          }}
        >
          <Tab label="Tất cả thông báo" />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Chưa đọc</span>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Box>
            }
          />
        </Tabs>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-2 pb-1 sm:pb-0">
          <Chip
            label="Tất cả loại"
            clickable
            variant={filterType === 'ALL' ? 'filled' : 'outlined'}
            onClick={() => setFilterType('ALL')}
            size="small"
            sx={{
              fontWeight: 500,
              ...(filterType === 'ALL'
                ? { bgcolor: '#EEF2FF', color: '#3344D6' }
                : { color: '#64748B' }),
            }}
          />
          <Chip
            label="Thanh toán"
            clickable
            variant={filterType === 'PAYMENT' ? 'filled' : 'outlined'}
            onClick={() => setFilterType('PAYMENT')}
            size="small"
            sx={{
              fontWeight: 500,
              ...(filterType === 'PAYMENT'
                ? { bgcolor: '#ECFDF3', color: '#067647' }
                : { color: '#64748B' }),
            }}
          />
          <Chip
            label="Điểm danh"
            clickable
            variant={filterType === 'ATTENDANCE' ? 'filled' : 'outlined'}
            onClick={() => setFilterType('ATTENDANCE')}
            size="small"
            sx={{
              fontWeight: 500,
              ...(filterType === 'ATTENDANCE'
                ? { bgcolor: '#EFF8FF', color: '#175CD3' }
                : { color: '#64748B' }),
            }}
          />
          <Chip
            label="Hệ thống"
            clickable
            variant={filterType === 'SYSTEM' ? 'filled' : 'outlined'}
            onClick={() => setFilterType('SYSTEM')}
            size="small"
            sx={{
              fontWeight: 500,
              ...(filterType === 'SYSTEM'
                ? { bgcolor: '#F8FAFC', color: '#334155' }
                : { color: '#64748B' }),
            }}
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Bell size={24} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Không có thông báo mới</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Tất cả thông báo về giao dịch thu phí, điểm danh và cảnh báo đã được cập nhật đầy đủ.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            let IconComp = Bell;
            let iconBg = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

            if (n.type === 'PAYMENT') {
              IconComp = CreditCard;
              iconBg = n.severity === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
            } else if (n.type === 'ATTENDANCE') {
              IconComp = Calendar;
              iconBg = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
            } else if (n.type === 'SECURITY') {
              IconComp = AlertTriangle;
              iconBg = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
            }

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  !n.read
                    ? 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-500/40 shadow-sm ring-1 ring-blue-500/10'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <IconComp size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm ${!n.read ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#3344D6] dark:bg-black-400"></span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                      <span>{n.timestamp}</span>
                      {n.actionUrl && (
                        <>
                          <span>•</span>
                          <Link
                            href={n.actionUrl}
                            className="text-[#3344D6] dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            {n.actionText}
                            <ArrowRight size={12} />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      title="Đánh dấu đã đọc"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    title="Xóa thông báo"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
