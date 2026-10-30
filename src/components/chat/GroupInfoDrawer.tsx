'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Pin,
  FolderOpen,
  Settings,
  ShieldAlert,
  FileText,
  Download,
  Image as ImageIcon,
  Copy,
  Check,
  Lock,
  Unlock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { SpaceAvatar } from '@/components/common/SpaceAvatar';
import CircularProgress from '@mui/material/CircularProgress';

interface GroupInfoDrawerProps {
  open: boolean;
  groupId: string;
  isOwnerOrAdmin: boolean;
  onClose: () => void;
  onJumpToMessage: (messageId: string) => void;
  onOpenImage: (url: string) => void;
}

export function GroupInfoDrawer({
  open,
  groupId,
  isOwnerOrAdmin,
  onClose,
  onJumpToMessage,
  onOpenImage,
}: GroupInfoDrawerProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'pinned' | 'files' | 'settings'>('members');
  const [groupInfo, setGroupInfo] = useState<any | null>(null);
  const [pinnedList, setPinnedList] = useState<any[]>([]);
  const [filesList, setFilesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [updatingSetting, setUpdatingSetting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    Promise.all([
      fetch(`/api/groups/${groupId}/chat`).then((r) => r.json()),
      fetch(`/api/groups/${groupId}/chat/messages?pinnedOnly=true&limit=30`).then((r) => r.json()),
      fetch(`/api/groups/${groupId}/chat/files`).then((r) => r.json()),
    ])
      .then(([infoRes, pinRes, fileRes]) => {
        if (infoRes.success) setGroupInfo(infoRes.data.group);
        if (pinRes.success) setPinnedList(pinRes.data.messages || []);
        if (fileRes.success) setFilesList(fileRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [open, groupId]);

  if (!open) return null;

  const handleCopyCode = () => {
    if (!groupInfo?.code) return;
    navigator.clipboard.writeText(groupInfo.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleToggleAdminOnly = async () => {
    if (!groupInfo || updatingSetting) return;
    setUpdatingSetting(true);
    try {
      const nextVal = !groupInfo.onlyAdminCanPost;
      const res = await fetch(`/api/groups/${groupId}/chat`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onlyAdminCanPost: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        setGroupInfo({ ...groupInfo, onlyAdminCanPost: nextVal });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingSetting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">
          Thông Tin Nhóm
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-2 text-slate-400 text-xs">
          <CircularProgress size={24} sx={{ color: '#2538D9' }} />
          <span>Đang tải thông tin nhóm...</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Group Overview Banner */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center gap-3">
            <SpaceAvatar
              name={groupInfo?.name || 'Nhóm'}
              logoUrl={groupInfo?.logoUrl}
              themeColor={groupInfo?.themeColor || '#2538D9'}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {groupInfo?.name}
              </h4>
              <p className="text-[11px] text-slate-500 truncate">
                Chủ nhóm: {groupInfo?.owner?.name}
              </p>
              {groupInfo?.code && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                  title="Sao chép mã nhóm"
                >
                  <span>Mã: {groupInfo.code}</span>
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-2 pt-1 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
                activeTab === 'members'
                  ? 'border-[#2538D9] text-[#2538D9] dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Thành viên ({groupInfo?.membersCount || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pinned')}
              className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
                activeTab === 'pinned'
                  ? 'border-[#2538D9] text-[#2538D9] dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>Ghim ({pinnedList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('files')}
              className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
                activeTab === 'files'
                  ? 'border-[#2538D9] text-[#2538D9] dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Tệp & Ảnh ({filesList.length})</span>
            </button>

            {isOwnerOrAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 text-xs font-bold text-center border-b-2 transition flex items-center justify-center ${
                  activeTab === 'settings'
                    ? 'border-[#2538D9] text-[#2538D9] dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
                title="Cài đặt chat"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* 1. MEMBERS TAB */}
            {activeTab === 'members' && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Danh sách thành viên chính thức
                </span>
                {(groupInfo?.members || []).map((m: any) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {m.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Tham gia: {new Date(m.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                      Học viên
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 2. PINNED TAB */}
            {activeTab === 'pinned' && (
              <div className="space-y-2">
                {pinnedList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Chưa có tin nhắn nào được ghim trong nhóm này.
                  </div>
                ) : (
                  pinnedList.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => onJumpToMessage(msg.id)}
                      className="p-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-400 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3">
                        {msg.content}
                      </p>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline mt-1.5 inline-flex items-center gap-0.5">
                        Nhảy đến tin nhắn →
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. FILES TAB */}
            {activeTab === 'files' && (
              <div className="space-y-2">
                {filesList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Chưa có tệp hay tài liệu nào được gửi trong nhóm.
                  </div>
                ) : (
                  filesList.map((file) => {
                    const isImg = file.fileType.startsWith('image/');

                    return (
                      <div
                        key={file.id}
                        className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600">
                            {isImg ? <ImageIcon className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-emerald-500" />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                              {file.fileName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {(file.fileSize / 1024).toFixed(0)} KB • bởi {file.message?.senderName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isImg && (
                            <button
                              type="button"
                              onClick={() => onOpenImage(file.fileUrl)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs"
                              title="Xem ảnh"
                            >
                              Xem
                            </button>
                          )}
                          <a
                            href={file.fileUrl}
                            download={file.fileName}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            title="Tải về"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 4. SETTINGS TAB */}
            {activeTab === 'settings' && isOwnerOrAdmin && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {groupInfo?.onlyAdminCanPost ? (
                          <Lock className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Unlock className="w-4 h-4 text-emerald-500" />
                        )}
                        Chỉ Quản lý được gửi tin
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Khi bật, các thành viên/học viên chỉ có thể đọc tin và phản hồi bình chọn; không thể nhắn tin tự do.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={updatingSetting}
                      onClick={handleToggleAdminOnly}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        groupInfo?.onlyAdminCanPost ? 'bg-[#2538D9]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          groupInfo?.onlyAdminCanPost ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
