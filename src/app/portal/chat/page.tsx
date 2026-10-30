'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  Users,
  Search,
  Sparkles,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { SpaceAvatar } from '@/components/common/SpaceAvatar';
import { GroupChatRoom } from '@/components/chat/GroupChatRoom';

interface StudentGroup {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  logoUrl?: string | null;
  themeColor?: string | null;
  ownerName: string;
  lastMessage?: {
    content: string;
    senderName: string;
    createdAt: string;
    messageType: string;
  } | null;
  isUnread: boolean;
}

function PortalChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedGroupId = searchParams.get('groupId');

  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch student's joined groups
  useEffect(() => {
    setLoading(true);
    fetch('/api/portal/chat/groups')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const list: StudentGroup[] = res.data;
          setGroups(list);

          // Select requested group from URL param or default to first group on desktop
          if (requestedGroupId) {
            const found = list.find((g) => g.id === requestedGroupId);
            if (found) setSelectedGroup(found);
            else if (list.length > 0) setSelectedGroup(list[0]);
          } else if (list.length > 0) {
            setSelectedGroup(list[0]);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [requestedGroupId]);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <CircularProgress size={32} sx={{ color: '#2538D9' }} />
        <p className="text-xs text-slate-500 font-medium">Đang tải danh sách nhóm chat...</p>
      </div>
    );
  }

  // Empty state: Student is not a member of any group yet
  if (groups.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] flex items-center justify-center mx-auto">
          <MessageSquare className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Chưa có nhóm trao đổi nào
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Bạn cần tham gia một không gian (lớp học, CLB thể thao hoặc phòng trọ) để bắt đầu trò chuyện cùng giáo viên và các thành viên khác.
          </p>
        </div>

        <Link
          href="/portal/join"
          className="w-full py-3 px-4 rounded-2xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition"
        >
          <KeyRound className="w-4 h-4" />
          <span>Tham gia không gian bằng mã / QR</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-6rem)] flex gap-4 overflow-hidden">
      {/* Left Groups List Sidebar (Hidden on mobile if a group is currently opened) */}
      <div
        className={`w-full sm:w-80 md:w-88 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm shrink-0 overflow-hidden ${
          selectedGroup ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2538D9]" />
              <span>Nhóm Của Tôi</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-[#2538D9] dark:text-blue-300 text-[10px] font-bold">
              {groups.length} nhóm
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên nhóm..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredGroups.map((g) => {
            const isSelected = selectedGroup?.id === g.id;

            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setSelectedGroup(g);
                  router.replace(`/portal/chat?groupId=${g.id}`, { scroll: false });
                }}
                className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-all ${
                  isSelected
                    ? 'bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <SpaceAvatar
                    name={g.name}
                    logoUrl={g.logoUrl}
                    themeColor={g.themeColor || '#2538D9'}
                    size="md"
                  />
                  {g.isUnread && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#2538D9] rounded-full border-2 border-white dark:border-slate-900" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {g.name}
                    </span>
                    {g.lastMessage && (
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(g.lastMessage.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {g.lastMessage ? (
                      <span>
                        <strong className="text-slate-700 dark:text-slate-300 font-medium">
                          {g.lastMessage.senderName}:
                        </strong>{' '}
                        {g.lastMessage.content}
                      </span>
                    ) : (
                      <span className="italic text-slate-400">Chưa có tin nhắn nào</span>
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Group Chat Area (Fills screen on mobile when opened) */}
      <div
        className={`flex-1 min-w-0 h-full ${
          selectedGroup ? 'flex' : 'hidden sm:flex'
        }`}
      >
        {selectedGroup ? (
          <GroupChatRoom
            key={selectedGroup.id}
            groupId={selectedGroup.id}
            isPortal={true}
            onBack={() => setSelectedGroup(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mb-2 text-slate-300" />
            <p className="text-xs">Chọn một nhóm bên trái để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortalChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Đang tải Tin nhắn & Trao đổi...</div>}>
      <PortalChatContent />
    </Suspense>
  );
}
