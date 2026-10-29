'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { SpaceSettingsForm } from '@/components/spaces/SpaceSettingsForm';
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
  groupType: string;
  defaultFee: number;
  billingCycle: string;
  publicPortalEnabled: boolean;
  isActive: boolean;
  members: Array<{ id: string; name: string }>;
}

export default function SpaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

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

  const handleArchive = async () => {
    if (!group) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn lưu trữ không gian "${group.name}" không? Các thành viên và hóa đơn vẫn được lưu an toàn.`
      )
    ) {
      return;
    }

    try {
      setArchiving(true);
      const res = await fetch(`/api/groups/${group.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/groups');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-xs">Đang tải thông tin cài đặt...</p>
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

  const themeColor = group.themeColor || '#2538D9';

  return (
    <div
      className="w-full space-y-6 pb-12"
      style={{ '--space-accent': themeColor } as React.CSSProperties}
    >
      <SpaceNavHeader
        space={{
          ...group,
          memberCount: group.members?.length || 0,
        }}
        activeSection="settings"
      />

      {/* Main Settings Form */}
      <SpaceSettingsForm
        space={group}
        onSuccess={(updated) => {
          setGroup((prev) => (prev ? { ...prev, ...updated } : prev));
        }}
        isPageLayout={true}
      />

      {/* SECTION 5: KHU VỰC NGUY HIỂM / QUẢN LÝ TRẠNG THÁI */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 shadow-2xs space-y-4">
        <div className="border-b border-rose-100 dark:border-rose-950/40 pb-3">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-black text-rose-600">
              Khu vực nguy hiểm
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Các thao tác liên quan đến trạng thái hoạt động và lưu trữ dữ liệu không gian.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Lưu trữ không gian này
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Ẩn không gian khỏi danh sách hoạt động chính. Mọi dữ liệu điểm danh, hội viên và khoản thu được giữ nguyên vẹn.
            </span>
          </div>

          <button
            type="button"
            disabled={archiving}
            onClick={handleArchive}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors flex-shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{archiving ? 'Đang xử lý...' : 'Lưu trữ không gian'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
