'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/i18n/LanguageContext';

export const ROUTE_TITLES: Record<string, { vi: string; en: string }> = {
  '/dashboard': { vi: 'Tổng quan Vận hành', en: 'Operations Overview' },
  '/attendance': { vi: 'Điểm danh & Chuyên cần', en: 'Attendance Tracking' },
  '/members': { vi: 'Danh sách Thành viên', en: 'Members Directory' },
  '/groups': { vi: 'Lớp học & Phòng trọ', en: 'Groups & Workspaces' },
  '/workflows': { vi: 'Quy trình Vận hành', en: 'Workflows & Policies' },
  '/invoices': { vi: 'Khoản thu & Công nợ', en: 'Invoices & Receivables' },
  '/transactions': { vi: 'Giao dịch & Đối soát VietQR', en: 'VietQR Transactions' },
  '/reports': { vi: 'Trung tâm Báo cáo & Phân tích', en: 'Reports & Analytics Center' },
  '/billing': { vi: 'Gói cước & Subscription', en: 'Billing & Plans' },
  '/automations': { vi: 'AI & Tự động hóa', en: 'AI & Automations' },
  '/notifications': { vi: 'Trung tâm Thông báo', en: 'Notifications' },
  '/settings': { vi: 'Cài đặt Hệ thống', en: 'System Settings' },
  '/portal': { vi: 'Tổng quan Học tập', en: 'Learning Dashboard' },
  '/portal/attendance': { vi: 'Lịch sử Điểm danh', en: 'Attendance History' },
  '/portal/fees': { vi: 'Học phí & VietQR', en: 'Tuition & Payment' },
  '/portal/groups': { vi: 'Lớp học & Phòng trọ', en: 'My Classes & Rooms' },
  '/portal/chat': { vi: 'Trò chuyện & Hỗ trợ', en: 'Chat & Support' },
  '/portal/profile': { vi: 'Hồ sơ cá nhân', en: 'My Profile' },
  '/portal/help': { vi: 'Hướng dẫn & Hỏi đáp', en: 'Help & FAQs' },
  '/admin': { vi: 'Platform Admin Console', en: 'Platform Admin Console' },
  '/kiosk': { vi: 'Kiosk Điểm Danh Sân', en: 'Attendance Kiosk' },
  '/login': { vi: 'Đăng nhập', en: 'Sign In' },
  '/register': { vi: 'Đăng ký Tài khoản', en: 'Register' },
};

export function usePageTitle(customTitleVi?: string, customTitleEn?: string) {
  const { locale } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    let title = '';
    if (customTitleVi) {
      title = locale === 'en' && customTitleEn ? customTitleEn : customTitleVi;
    } else if (pathname && ROUTE_TITLES[pathname]) {
      title = ROUTE_TITLES[pathname][locale];
    } else if (pathname) {
      const match = Object.keys(ROUTE_TITLES).find(
        (key) => key !== '/' && pathname.startsWith(key)
      );
      if (match) {
        title = ROUTE_TITLES[match][locale];
      }
    }

    if (title) {
      document.title = `${title} • TingRoster`;
    }
  }, [customTitleVi, customTitleEn, locale, pathname]);
}
