'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { GroupChatRoom } from '@/components/chat/GroupChatRoom';
import { SmartBackButton } from '@/components/common/SmartBackButton';
import CircularProgress from '@mui/material/CircularProgress';

interface GroupDetail {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  themeColor?: string | null;
  enabledModules?: string | null;
  groupType?: string | null;
  members: Array<{ id: string; name: string }>;
}

function SpaceChatContent() {
  const params = useParams();
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
      <div className="py-24 text-center text-slate-400 space-y-2">
        <CircularProgress size={28} sx={{ color: '#2538D9' }} />
        <p className="text-xs">Đang tải phòng chat nhóm...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-24 text-center text-slate-500 space-y-3">
        <p className="text-sm font-bold">Không tìm thấy không gian.</p>
        <SmartBackButton fallbackUrl="/groups" label="Quay lại danh sách không gian" />
      </div>
    );
  }

  const themeColor = group.themeColor || '#2538D9';

  return (
    <div
      className="w-full space-y-4 pb-6 flex flex-col h-[calc(100vh-5.5rem)]"
      style={{ '--space-accent': themeColor } as React.CSSProperties}
    >
      <SpaceNavHeader
        space={{
          ...group,
          memberCount: group.members.length,
        }}
        activeSection="chat"
      />

      <div className="flex-1 min-h-0">
        <GroupChatRoom groupId={group.id} />
      </div>
    </div>
  );
}

export default function SpaceChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Đang tải Chat nhóm...</div>}>
      <SpaceChatContent />
    </Suspense>
  );
}
