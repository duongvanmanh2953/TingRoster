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
  LayoutDashboard
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
  activeSection: 'overview' | 'members' | 'settings';
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

      {/* Space Identity Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <SmartBackButton fallbackUrl="/groups" label="Không gian của tôi" />

          <SpaceAvatar
            name={space.name}
            logoUrl={space.logoUrl}
            themeColor={themeColor}
            enabledModules={space.enabledModules}
            groupType={space.groupType}
            size="lg"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                {space.name}
              </h1>

              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Sao chép mã định danh không gian"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{spaceCode}</span>
              </button>
            </div>

            {space.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {space.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Links (Route-based tabs) */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        {/* Tổng quan */}
        <Link
          href={`/groups/${space.id}`}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'overview'
              ? 'text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          style={activeSection === 'overview' ? { backgroundColor: themeColor } : {}}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Tổng quan</span>
        </Link>

        {/* Thành viên */}
        {modules.includes('members') && (
          <Link
            href={`/groups/${space.id}/members`}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'members'
                ? 'text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            style={activeSection === 'members' ? { backgroundColor: themeColor } : {}}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Thành viên</span>
            {space.memberCount !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono tabular-nums">
                {space.memberCount}
              </span>
            )}
          </Link>
        )}

        {/* Điểm danh */}
        {modules.includes('attendance') && (
          <Link
            href={`/attendance?groupId=${space.id}`}
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Lịch & Điểm danh</span>
          </Link>
        )}

        {/* Khoản thu */}
        {modules.includes('invoices') && (
          <Link
            href={`/invoices?groupId=${space.id}`}
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Khoản thu</span>
          </Link>
        )}

        {/* Giao dịch */}
        {modules.includes('reconciliation') && (
          <Link
            href={`/transactions?groupId=${space.id}`}
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Giao dịch VietQR</span>
          </Link>
        )}

        {/* Báo cáo công nợ */}
        {modules.includes('reports') && (
          <Link
            href={`/reports/aging?groupId=${space.id}`}
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Báo cáo công nợ</span>
          </Link>
        )}

        {/* Cài đặt */}
        <Link
          href={`/groups/${space.id}/settings`}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'settings'
              ? 'text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          style={activeSection === 'settings' ? { backgroundColor: themeColor } : {}}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Thông tin không gian</span>
        </Link>
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
