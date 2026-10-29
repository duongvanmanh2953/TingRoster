'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatVND } from '@/lib/utils';
import {
  Users2,
  CalendarCheck,
  Receipt,
  ArrowRight,
  RefreshCw,
  Sliders,
  BarChart3,
  ArrowRightLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { parseEnabledModules } from '@/lib/spaces/constants';
import { SmartBackButton } from '@/components/common/SmartBackButton';

interface GroupDetail {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  themeColor?: string | null;
  enabledModules?: string | null;
  defaultFee: number;
  billingCycle: string;
  groupType: string;
  publicPortalEnabled: boolean;
  members: Array<{
    id: string;
    name: string;
    phone?: string | null;
    parentName?: string | null;
  }>;
  _count: {
    members: number;
    invoices: number;
  };
}

export default function SpaceDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGroup = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setGroup(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) loadGroup();
  }, [groupId, loadGroup]);

  if (loading) {
    return (
      <div className="text-center py-24 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-xs">Đang tải thông tin không gian...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-24 text-slate-500 space-y-3">
        <p className="text-sm font-bold">Không tìm thấy không gian.</p>
        <SmartBackButton fallbackUrl="/groups" label="Quay lại danh sách không gian" />
      </div>
    );
  }

  const modules = parseEnabledModules(group.enabledModules);
  const themeColor = group.themeColor || '#2538D9';
  const recentMembers = (group.members || []).slice(0, 5);

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      style={{ '--space-accent': themeColor } as React.CSSProperties}
    >
      {/* Contextual Header with Breadcrumb & Subnav */}
      <SpaceNavHeader
        space={{
          ...group,
          memberCount: group.members.length,
        }}
        activeSection="overview"
      />

      {/* Space Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
            Tổng số thành viên
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums block mt-1">
            {group.members.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Đang hoạt động trong không gian này
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
            Hóa đơn đã phát hành
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums block mt-1">
            {group._count.invoices}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Gắn mã thanh toán tự động VietQR
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
            Mô hình & Định kỳ thu
          </span>
          <span className="text-base font-black text-slate-900 dark:text-white block mt-1">
            {group.billingCycle === 'MONTHLY'
              ? 'Thu theo Tháng'
              : group.billingCycle === 'PER_SESSION'
              ? 'Thu theo Buổi'
              : 'Thu theo Ngày'}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Mức phí mặc định: {formatVND(group.defaultFee)}
          </span>
        </div>
      </div>

      {/* Quick Launchpad based on enabled modules */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">
          Lối tắt tác vụ nhanh
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {modules.includes('attendance') && (
            <Link
              href={`/attendance?groupId=${group.id}`}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Mở Điểm Danh Hôm Nay
                  </span>
                  <span className="text-[10px] text-slate-400">1 chạm cho cả sĩ số</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {modules.includes('invoices') && (
            <Link
              href={`/invoices?groupId=${group.id}`}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 transition-all flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Tạo Đợt Thu Phí
                  </span>
                  <span className="text-[10px] text-slate-400">Sinh VietQR tự động</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          <Link
            href={`/groups/${group.id}/settings`}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 transition-all flex items-center justify-between group text-left shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Cài Đặt Không Gian
                </span>
                <span className="text-[10px] text-slate-400">Đổi màu & bật/tắt module</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>

      {/* Recent Members Section with Link to /members */}
      {modules.includes('members') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Thành viên không gian ({group.members.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Những thành viên gần đây nhất đang tham gia
              </p>
            </div>

            <Link
              href={`/groups/${group.id}/members`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1 transition-colors"
            >
              <span>Quản lý thành viên ({group.members.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentMembers.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <Users2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              Chưa có thành viên nào. Vào trang Quản lý thành viên để thêm mới hoặc quét danh sách bằng AI.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentMembers.map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {m.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {m.phone || 'Chưa có SĐT'}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/members/${m.id}`}
                    className="text-[11px] font-semibold text-slate-500 hover:text-blue-600"
                  >
                    Xem hồ sơ
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
