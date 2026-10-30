'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users2,
  CalendarCheck,
  Receipt,
  ArrowRightLeft,
  Settings,
  ExternalLink,
  Copy,
  Check,
  Share2,
  BarChart3,
  FileText,
  Sliders,
  ChevronRight,
  LayoutDashboard,
  MessageSquare
} from 'lucide-react';
import { SpaceAvatar } from '@/components/common/SpaceAvatar';
import { parseEnabledModules } from '@/lib/spaces/constants';
import { SmartBackButton } from '@/components/common/SmartBackButton';
import { ShareSpaceModal } from '@/components/spaces/ShareSpaceModal';

export interface SpaceNavHeaderProps {
  space: {
    id: string;
    name: string;
    slug: string;
    code?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    themeColor?: string | null;
    enabledModules?: string | null;
    groupType?: string | null;
    memberCount?: number;
  };
  activeSection: 'overview' | 'members' | 'attendance' | 'chat' | 'invoices' | 'transactions' | 'reports' | 'services' | 'bookings' | 'rentals' | 'meters' | 'classes' | 'contracts' | 'settings';
}

export function SpaceNavHeader({ space, activeSection }: SpaceNavHeaderProps) {
  const pathname = usePathname();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const modules = parseEnabledModules(space.enabledModules);
  const themeColor = space.themeColor || '#2538D9';
  const spaceCode = space.code || `TR-${space.slug.toUpperCase().slice(0, 4)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(spaceCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'members':
        return 'Thành viên';
      case 'attendance':
        return 'Lịch & Điểm danh';
      case 'chat':
        return 'Chat nhóm';
      case 'invoices':
        return 'Khoản thu & Học phí';
      case 'transactions':
        return 'Giao dịch VietQR';
      case 'services':
        return 'Bảng giá dịch vụ';
      case 'bookings':
        return 'Đặt sân & CI/CO';
      case 'rentals':
        return 'Phòng & Hợp đồng';
      case 'meters':
        return 'Điện, Nước & Định mức';
      case 'classes':
        return 'Lớp học & Khóa học';
      case 'reports':
        return 'Báo cáo không gian';
      case 'contracts':
        return 'Hợp đồng & Hồ sơ';
      case 'settings':
        return 'Thông tin không gian';
      default:
        return 'Tổng quan';
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <nav className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 flex-wrap">
          <Link
            href="/groups"
            className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
          >
            Không gian của tôi
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href={`/groups/${space.id}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 font-medium truncate max-w-[180px] transition-colors"
          >
            {space.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900 dark:text-white">
            {getSectionTitle()}
          </span>
        </nav>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lời mời tham gia</span>
          </button>

          <Link
            href={`/groups/${space.id}/contracts`}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              activeSection === 'contracts'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Hợp đồng & Hồ sơ</span>
          </Link>

          <Link
            href={`/groups/${space.id}/chat`}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              activeSection === 'chat'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Chat nhóm</span>
          </Link>

          <Link
            href={`/groups/${space.id}/settings`}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              activeSection === 'settings'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Thông tin không gian</span>
          </Link>

          <Link
            href={`/p/${space.slug}`}
            target="_blank"
            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer shadow-2xs"
            title="Mở cổng tra cứu công cộng (Portal)"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>



      {showShareModal && (
        <ShareSpaceModal
          space={space}
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
