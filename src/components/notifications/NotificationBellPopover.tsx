'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  CreditCard,
  CalendarCheck,
  AlertTriangle,
  Info,
  Check,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';

export interface PushNotification {
  id: string;
  type: 'PAYMENT' | 'ATTENDANCE' | 'REMINDER' | 'SYSTEM';
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  timeAgoVi: string;
  timeAgoEn: string;
  isRead: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-1',
    type: 'PAYMENT',
    titleVi: 'Khớp thành công 500.000 đ',
    titleEn: 'Payment Matched 500,000 VND',
    descVi: 'Nguyễn Hoàng Nam (Lớp Toán 12A) chuyển khoản VietQR Napas 247 qua ngân hàng MB.',
    descEn: 'Nguyen Hoang Nam (Math 12A) transferred via VietQR MB Bank.',
    timeAgoVi: '2 phút trước',
    timeAgoEn: '2m ago',
    isRead: false,
    link: '/transactions',
  },
  {
    id: 'notif-2',
    type: 'ATTENDANCE',
    titleVi: 'Điểm danh hoàn tất',
    titleEn: 'Attendance Completed',
    descVi: 'Lớp Cầu Lông nâng cao: 12/12 hội viên đã điểm danh ca 18:00 hôm nay.',
    descEn: 'Badminton Advanced: 12/12 members checked in for the 18:00 slot.',
    timeAgoVi: '25 phút trước',
    timeAgoEn: '25m ago',
    isRead: false,
    link: '/attendance',
  },
  {
    id: 'notif-3',
    type: 'REMINDER',
    titleVi: 'Cảnh báo nợ quá hạn 1-7 ngày',
    titleEn: 'Overdue Alert (1-7 Days)',
    descVi: 'Có 3 học viên chưa hoàn thành học phí tháng 10. AI đề xuất gửi Zalo ZNS.',
    descEn: '3 students have unpaid October tuition. AI suggests sending Zalo reminder.',
    timeAgoVi: '1 giờ trước',
    timeAgoEn: '1h ago',
    isRead: false,
    link: '/invoices',
  },
  {
    id: 'notif-4',
    type: 'SYSTEM',
    titleVi: 'Hệ thống tự động đồng bộ VietQR',
    titleEn: 'VietQR Auto-sync Gateway Active',
    descVi: 'Đã kết nối webhook cổng thanh toán Napas 247. Thời gian phản hồi: 85ms.',
    descEn: 'Connected to Napas 247 payment gateway webhook. Response time: 85ms.',
    timeAgoVi: '3 giờ trước',
    timeAgoEn: '3h ago',
    isRead: true,
    link: '/settings',
  },
];

export function NotificationBellPopover() {
  const { locale, t } = useLanguage();
  const [notifications, setNotifications] = useState<PushNotification[]>(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markItemAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const getIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'ATTENDANCE':
        return <CalendarCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'REMINDER':
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'SYSTEM':
      default:
        return <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const getBadgeBg = (type: PushNotification['type']) => {
    switch (type) {
      case 'PAYMENT':
        return 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80';
      case 'ATTENDANCE':
        return 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/80';
      case 'REMINDER':
        return 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/80';
      case 'SYSTEM':
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/80';
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={t('common.notifications', 'Thông báo mới nhất')}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#2538D9] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs border-2 border-white dark:border-[#0B0F19] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-[#0B0F19]/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                {locale === 'en' ? 'Push Notifications' : 'Thông báo đẩy mới nhất'}
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2538D9] text-white">
                  {unreadCount} {locale === 'en' ? 'new' : 'mới'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-[#2538D9] dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {t('common.mark_all_read', 'Đã đọc')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {t('common.no_notifications', 'Chưa có thông báo mới')}
              </div>
            ) : (
              notifications.map((item) => {
                const title = locale === 'en' ? item.titleEn : item.titleVi;
                const desc = locale === 'en' ? item.descEn : item.descVi;
                const timeAgo = locale === 'en' ? item.timeAgoEn : item.timeAgoVi;

                return (
                  <div
                    key={item.id}
                    onClick={() => markItemAsRead(item.id)}
                    className={`p-3.5 transition-colors cursor-pointer flex gap-3 ${
                      item.isRead
                        ? 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 opacity-75'
                        : 'bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-[rgb(70 0 241 / 27%)] dark:hover:bg-indigo-950/40'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${getBadgeBg(
                        item.type
                      )}`}
                    >
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs truncate ${
                            item.isRead
                              ? 'font-medium text-slate-700 dark:text-slate-300'
                              : 'font-bold text-slate-900 dark:text-white'
                          }`}
                        >
                          {title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                          {timeAgo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {desc}
                      </p>
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2538D9] dark:text-indigo-400 hover:underline mt-1.5"
                        >
                          <span>{locale === 'en' ? 'Open details' : 'Xem chi tiết'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#2538D9] flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Link */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B0F19]/40 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#2538D9] dark:text-indigo-400 hover:underline inline-flex items-center gap-1.5"
            >
              <span>{t('common.view_all', 'Xem tất cả thông báo')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
