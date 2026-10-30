'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Send,
  Paperclip,
  Smile,
  Search,
  Info,
  ArrowLeft,
  ChevronDown,
  Pin,
  Reply,
  Copy,
  Edit2,
  Trash2,
  X,
  Lock,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Check,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { SpaceAvatar } from '@/components/common/SpaceAvatar';
import { ChatCard } from '@/components/chat/ChatCards';
import { ImageLightbox } from '@/components/chat/ImageLightbox';
import { SlashCommandPicker, SlashCommand } from '@/components/chat/SlashCommandPicker';
import { CreatePollModal } from '@/components/chat/CreatePollModal';
import { CreateNoticeModal } from '@/components/chat/CreateNoticeModal';
import { MessageSearchModal } from '@/components/chat/MessageSearchModal';
import { GroupInfoDrawer } from '@/components/chat/GroupInfoDrawer';

const QUICK_EMOJIS = ['👍', '❤️', '🎉', '🔥', '👏', '😂'];

interface ChatAttachment {
  id?: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

interface ChatMsg {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  messageType: string;
  isAnnouncement: boolean;
  replyToId?: string | null;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
    isDeleted: boolean;
    messageType: string;
  } | null;
  isEdited: boolean;
  editedAt?: string | null;
  isDeleted: boolean;
  isPinned: boolean;
  pinnedAt?: string | null;
  pinnedByName?: string | null;
  cardPayload?: string | null;
  createdAt: string;
  attachments: ChatAttachment[];
  reactionsSummary: Array<{
    emoji: string;
    count: number;
    users: string[];
    hasReacted: boolean;
  }>;
  poll?: any;
}

interface GroupChatRoomProps {
  groupId: string;
  isPortal?: boolean;
  onBack?: () => void;
}

export function GroupChatRoom({ groupId, isPortal, onBack }: GroupChatRoomProps) {
  // State
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [actor, setActor] = useState<any>(null);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Composer state
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMsg | null>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Slash commands
  const [showSlashPicker, setShowSlashPicker] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');

  // Modals & Panels
  const [showPollModal, setShowPollModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // In-line editing
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // UI scroll & unread floating button
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [newMessagesArrived, setNewMessagesArrived] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Initial Load
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [infoRes, msgRes] = await Promise.all([
        fetch(`/api/groups/${groupId}/chat`).then((r) => r.json()),
        fetch(`/api/groups/${groupId}/chat/messages?limit=40`).then((r) => r.json()),
      ]);

      if (infoRes.success) {
        setGroupInfo(infoRes.data.group);
        setActor(infoRes.data.actor);
      }

      if (msgRes.success) {
        setMessages(msgRes.data.messages || []);
        setHasMore(msgRes.data.hasMore);
        setNextCursor(msgRes.data.nextCursor);

        // Mark last message as read
        if (msgRes.data.messages?.length > 0) {
          const last = msgRes.data.messages[msgRes.data.messages.length - 1];
          fetch(`/api/groups/${groupId}/chat/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId: last.id }),
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Fetch chat error:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // 2. Smart Polling for realtime updates (every 3 seconds)
  useEffect(() => {
    if (!groupId) return;

    const interval = setInterval(async () => {
      // Don't poll if document is hidden to conserve resources
      if (document.hidden) return;

      try {
        const res = await fetch(`/api/groups/${groupId}/chat/messages?limit=25`);
        const data = await res.json();
        if (data.success && data.data?.messages) {
          const newBatch: ChatMsg[] = data.data.messages;

          setMessages((prev) => {
            const prevIds = new Set(prev.map((m) => m.id));
            const hasBrandNew = newBatch.some((m) => !prevIds.has(m.id));

            if (hasBrandNew && showScrollBottom) {
              setNewMessagesArrived(true);
            }

            // Merge updates (edits, reactions, polls)
            const map = new Map(prev.map((m) => [m.id, m]));
            for (const m of newBatch) {
              map.set(m.id, m);
            }
            return Array.from(map.values()).sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });
        }
      } catch (err) {
        console.error('Chat polling error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [groupId, showScrollBottom]);

  // 3. Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
      setShowScrollBottom(false);
      setNewMessagesArrived(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && messages.length > 0 && !showScrollBottom) {
      scrollToBottom(false);
    }
  }, [loading, scrollToBottom, showScrollBottom]);

  // 4. Handle scroll for infinite scroll up & floating button
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollBottom(!atBottom);
    if (atBottom) setNewMessagesArrived(false);

    // If near top and has more, load older messages
    if (el.scrollTop < 60 && hasMore && !loadingOlder && nextCursor) {
      loadOlderMessages();
    }
  };

  const loadOlderMessages = async () => {
    if (!nextCursor || loadingOlder) return;
    setLoadingOlder(true);

    const el = scrollContainerRef.current;
    const prevScrollHeight = el?.scrollHeight || 0;

    try {
      const res = await fetch(
        `/api/groups/${groupId}/chat/messages?cursor=${encodeURIComponent(nextCursor)}&limit=30`
      );
      const data = await res.json();
      if (data.success && data.data?.messages) {
        const older: ChatMsg[] = data.data.messages;
        setMessages((prev) => {
          const map = new Map();
          for (const m of older) map.set(m.id, m);
          for (const m of prev) map.set(m.id, m);
          return Array.from(map.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        setHasMore(data.data.hasMore);
        setNextCursor(data.data.nextCursor);

        // Preserve scroll position
        requestAnimationFrame(() => {
          if (el) {
            el.scrollTop = el.scrollHeight - prevScrollHeight;
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOlder(false);
    }
  };

  // 5. Jump to message with pulse highlight
  const jumpToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(messageId);
      setTimeout(() => setHighlightedMsgId(null), 2500);
    }
  };

  // 6. Text input change & Slash command detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (val.startsWith('/')) {
      setShowSlashPicker(true);
      setSlashQuery(val);
    } else {
      setShowSlashPicker(false);
    }

    // Auto-grow textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // 7. Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || sending) return;

    setSending(true);
    const content = inputText.trim();
    const replyId = replyingTo?.id || null;
    const currentAttachments = [...attachments];

    // Clear composer immediately for snappy UX
    setInputText('');
    setAttachments([]);
    setReplyingTo(null);
    setShowSlashPicker(false);
    setShowEmojiPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch(`/api/groups/${groupId}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content || 'Đã gửi tệp đính kèm',
          messageType: 'TEXT',
          replyToId: replyId,
          attachments: currentAttachments,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setSending(false);
    }
  };

  // 8. Keydown handler: Enter sends, Shift+Enter newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSlashPicker) return; // Allow picker to intercept

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 9. Execute Slash Command
  const handleSelectSlashCommand = async (cmd: SlashCommand) => {
    setShowSlashPicker(false);
    setInputText('');

    if (cmd.id === 'poll') {
      setShowPollModal(true);
    } else if (cmd.id === 'notice') {
      setShowNoticeModal(true);
    } else if (cmd.id === 'schedule') {
      // Send interactive Schedule Card
      await fetch(`/api/groups/${groupId}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '📅 Lịch hoạt động mới nhất của nhóm',
          messageType: 'CARD_SCHEDULE',
          cardPayload: JSON.stringify({
            title: `Lịch sinh hoạt: ${groupInfo?.name}`,
            date: 'Tuần này',
            time: 'Theo thời khóa biểu quy định',
            location: 'Địa điểm không gian',
            link: isPortal ? '/portal/attendance' : `/groups/${groupId}/attendance`,
          }),
        }),
      });
      fetchInitialData();
    } else if (cmd.id === 'attendance') {
      // Send Attendance Card
      await fetch(`/api/groups/${groupId}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '✅ Thông tin phiên điểm danh hiện tại',
          messageType: 'CARD_ATTENDANCE',
          cardPayload: JSON.stringify({
            sessionName: `Điểm danh: ${groupInfo?.name}`,
            date: new Date().toLocaleDateString('vi-VN'),
            isOpen: true,
            totalCount: groupInfo?.membersCount || 0,
            link: isPortal ? '/portal/attendance' : `/groups/${groupId}/attendance`,
          }),
        }),
      });
      fetchInitialData();
    } else if (cmd.id === 'payment') {
      // Send VietQR Payment Card
      await fetch(`/api/groups/${groupId}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '💳 Thông báo đóng học phí & quỹ nhóm qua VietQR',
          messageType: 'CARD_PAYMENT',
          cardPayload: JSON.stringify({
            title: `Khoản thu: ${groupInfo?.name}`,
            slug: groupInfo?.slug,
          }),
        }),
      });
      fetchInitialData();
    } else if (cmd.id === 'members' || cmd.id === 'files') {
      setShowInfoDrawer(true);
    } else if (cmd.id === 'report') {
      if (!isPortal) {
        window.location.href = `/groups/${groupId}/reports`;
      }
    } else if (cmd.id === 'help') {
      setShowSlashPicker(true);
      setSlashQuery('');
    }
  };

  // 10. File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingAttachment(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(`/api/groups/${groupId}/chat/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.data) {
          setAttachments((prev) => [...prev, data.data]);
        } else {
          alert(data.error || 'Lỗi khi tải tệp');
        }
      } catch (err) {
        console.error(err);
      }
    }
    setUploadingAttachment(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 11. Toggle Reaction
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch(
        `/api/groups/${groupId}/chat/messages/${messageId}/reactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji }),
        }
      );
      const data = await res.json();
      if (data.success) {
        // Optimistic toggle locally
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId) return m;

            const existing = m.reactionsSummary.find((r) => r.emoji === emoji);
            let nextSummary = [...m.reactionsSummary];

            if (data.data.action === 'added') {
              if (existing) {
                nextSummary = nextSummary.map((r) =>
                  r.emoji === emoji
                    ? { ...r, count: r.count + 1, hasReacted: true }
                    : r
                );
              } else {
                nextSummary.push({
                  emoji,
                  count: 1,
                  users: [actor?.name || 'Bạn'],
                  hasReacted: true,
                });
              }
            } else {
              if (existing) {
                if (existing.count <= 1) {
                  nextSummary = nextSummary.filter((r) => r.emoji !== emoji);
                } else {
                  nextSummary = nextSummary.map((r) =>
                    r.emoji === emoji
                      ? { ...r, count: r.count - 1, hasReacted: false }
                      : r
                  );
                }
              }
            }
            return { ...m, reactionsSummary: nextSummary };
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 12. Toggle Pin
  const handleTogglePin = async (messageId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/chat/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pin' }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, isPinned: data.data.isPinned } : m
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 13. Delete / Revoke Message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Bạn có chắc chắn muốn thu hồi tin nhắn này?')) return;
    try {
      const res = await fetch(`/api/groups/${groupId}/chat/messages/${messageId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, isDeleted: true, content: 'Tin nhắn đã được thu hồi' }
              : m
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 14. Save Edited Message
  const handleSaveEdit = async (messageId: string) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch(`/api/groups/${groupId}/chat/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, content: editingText.trim(), isEdited: true }
              : m
          )
        );
        setEditingMsgId(null);
        setEditingText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 15. Vote on Poll
  const handleVotePoll = async (pollId: string, optionId: string) => {
    try {
      const res = await fetch(
        `/api/groups/${groupId}/chat/polls/${pollId}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optionId }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.poll && m.poll.id === pollId) {
              return { ...m, poll: data.data };
            }
            return m;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 16. Close Poll
  const handleClosePoll = async (pollId: string) => {
    if (!confirm('Bạn có chắc chắn muốn đóng bình chọn này?')) return;
    try {
      const res = await fetch(
        `/api/groups/${groupId}/chat/polls/${pollId}/close`,
        {
          method: 'POST',
        }
      );
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.poll && m.poll.id === pollId) {
              return { ...m, poll: { ...m.poll, isClosed: true } };
            }
            return m;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Find latest pinned message for top banner
  const latestPinned = [...messages].reverse().find((m) => m.isPinned && !m.isDeleted);

  // Can current user post?
  const canPost = actor?.canPost ?? true;

  if (loading) {
    return (
      <div className="flex-1 h-full min-h-[450px] flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <CircularProgress size={32} sx={{ color: '#2538D9' }} />
        <p className="text-xs text-slate-500 font-medium">Đang tải cuộc trò chuyện nhóm...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full min-h-[500px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden relative">
      {/* 1. CHAT HEADER */}
      <header className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition"
              title="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <SpaceAvatar
            name={groupInfo?.name || 'Nhóm'}
            logoUrl={groupInfo?.logoUrl}
            themeColor={groupInfo?.themeColor || '#2538D9'}
            size="md"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {groupInfo?.name || 'Chat Nhóm'}
              </h2>
              {groupInfo?.code && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 shrink-0">
                  {groupInfo.code}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
              <span>{groupInfo?.membersCount || 0} thành viên</span>
              {groupInfo?.onlyAdminCanPost && (
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                  • <Lock className="w-3 h-3" /> Chỉ Quản lý gửi tin
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Header Actions (NO voice or video call buttons) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Tìm kiếm trong nhóm"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowInfoDrawer(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Thông tin nhóm & tệp đính kèm"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. PINNED MESSAGE BANNER */}
      {latestPinned && (
        <div className="px-4 py-2 bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between gap-3 text-xs z-10 shrink-0">
          <div
            className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-85"
            onClick={() => jumpToMessage(latestPinned.id)}
          >
            <Pin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-amber-900 dark:text-amber-300 mr-1.5">
                Đã ghim:
              </span>
              <span className="text-slate-700 dark:text-slate-300 truncate">
                {latestPinned.content}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => jumpToMessage(latestPinned.id)}
              className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
            >
              Xem
            </button>
            {actor?.isOwnerOrAdmin && (
              <button
                type="button"
                onClick={() => handleTogglePin(latestPinned.id)}
                className="text-slate-400 hover:text-slate-600"
                title="Bỏ ghim"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. MESSAGE STREAM CONTAINER */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC] dark:bg-[#0B0F19]"
      >
        {loadingOlder && (
          <div className="py-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <CircularProgress size={14} sx={{ color: '#2538D9' }} />
            <span>Đang tải tin nhắn cũ hơn...</span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="py-24 text-center text-slate-400 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Chào mừng bạn đến với nhóm chat!
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hãy gửi tin nhắn đầu tiên, chia sẻ lịch hoạt động hoặc gõ{' '}
              <code className="text-blue-600 font-mono font-bold">/</code> để sử dụng các lệnh nghiệp vụ.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === actor?.id;
            const isSystem = msg.messageType === 'SYSTEM';
            const isCard = msg.messageType.startsWith('CARD_');
            const isHighlighted = highlightedMsgId === msg.id;

            // Day separator check
            const currentDate = new Date(msg.createdAt).toDateString();
            const prevDate = idx > 0 ? new Date(messages[idx - 1].createdAt).toDateString() : null;
            const showDateSeparator = currentDate !== prevDate;

            // System Message Bubble
            if (isSystem) {
              return (
                <div key={msg.id} id={`msg-${msg.id}`} className="flex justify-center my-2">
                  <div className="px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 text-center max-w-md shadow-2xs">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <React.Fragment key={msg.id}>
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-3">
                    <span className="px-3 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {new Date(msg.createdAt).toLocaleDateString('vi-VN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                <div
                  id={`msg-${msg.id}`}
                  className={`group relative flex gap-2.5 ${
                    isMe ? 'flex-row-reverse' : 'flex-row'
                  } ${isHighlighted ? 'animate-pulse bg-blue-50/60 dark:bg-blue-950/30 p-2 rounded-2xl' : ''}`}
                >
                  {/* Sender Avatar */}
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      {msg.senderName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Sender Name & Role */}
                    {!isMe && (
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {msg.senderName}
                        </span>
                        {msg.senderRole === 'OWNER' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                            Chủ nhóm
                          </span>
                        )}
                        {msg.senderRole === 'ADMIN' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-100 text-purple-700">
                            Quản trị
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reply quote preview if any */}
                    {msg.replyTo && (
                      <div
                        onClick={() => jumpToMessage(msg.replyTo!.id)}
                        className={`text-[11px] p-2 rounded-xl mb-1 cursor-pointer border-l-2 transition truncate ${
                          isMe
                            ? 'bg-blue-700/20 border-white/60 text-white/90'
                            : 'bg-slate-200/70 dark:bg-slate-800 border-blue-500 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-bold block truncate">
                          Trích dẫn {msg.replyTo.senderName}:
                        </span>
                        <span className="truncate block opacity-85">
                          {msg.replyTo.isDeleted ? 'Tin nhắn đã thu hồi' : msg.replyTo.content}
                        </span>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`relative px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-[#2538D9] text-white rounded-br-xs'
                          : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {/* Editing state */}
                      {editingMsgId === msg.id ? (
                        <div className="space-y-2 py-1 min-w-[200px]">
                          <textarea
                            rows={2}
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingMsgId(null)}
                              className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(msg.id)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-white text-blue-700 rounded-lg hover:bg-slate-100"
                            >
                              Lưu
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Deleted text */}
                          {msg.isDeleted ? (
                            <span className="italic opacity-60">Tin nhắn đã được thu hồi</span>
                          ) : isCard ? (
                            <ChatCard
                              cardType={msg.messageType}
                              payloadStr={msg.cardPayload}
                              pollData={msg.poll}
                              currentUserId={actor?.id || ''}
                              onVotePoll={handleVotePoll}
                              onClosePoll={handleClosePoll}
                              isOwnerOrAdmin={actor?.isOwnerOrAdmin}
                            />
                          ) : (
                            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          )}

                          {/* Image Attachments */}
                          {msg.attachments?.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              {msg.attachments.map((att, aIdx) => {
                                const isImg = att.fileType.startsWith('image/');
                                if (isImg) {
                                  return (
                                    <div
                                      key={aIdx}
                                      onClick={() => setLightboxImg(att.fileUrl)}
                                      className="rounded-xl overflow-hidden max-w-xs cursor-pointer hover:opacity-90 transition border border-white/20"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={att.fileUrl}
                                        alt={att.fileName}
                                        className="w-full max-h-60 object-cover"
                                      />
                                    </div>
                                  );
                                }
                                return (
                                  <a
                                    key={aIdx}
                                    href={att.fileUrl}
                                    download={att.fileName}
                                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition ${
                                      isMe
                                        ? 'bg-blue-800/50 hover:bg-blue-800/70 text-white'
                                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white'
                                    }`}
                                  >
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <span className="truncate flex-1">{att.fileName}</span>
                                    <span className="text-[10px] opacity-70 shrink-0 font-mono">
                                      {(att.fileSize / 1024).toFixed(0)} KB
                                    </span>
                                  </a>
                                );
                              })}
                            </div>
                          )}

                          {/* Footer metadata */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isMe ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {msg.isPinned && (
                              <Pin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            )}
                            {msg.isEdited && <span>(đã sửa)</span>}
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && <Check className="w-3 h-3 text-blue-200" />}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Reactions Bar */}
                    {msg.reactionsSummary?.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-1">
                        {msg.reactionsSummary.map((r, rIdx) => (
                          <button
                            key={rIdx}
                            type="button"
                            onClick={() => handleToggleReaction(msg.id, r.emoji)}
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 border transition ${
                              r.hasReacted
                                ? 'bg-blue-50 dark:bg-blue-950 border-blue-400 text-blue-700 dark:text-blue-300'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                            }`}
                            title={r.users.join(', ')}
                          >
                            <span>{r.emoji}</span>
                            <span className="text-[10px] font-mono">{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Action Bar on Hover */}
                  {!msg.isDeleted && (
                    <div
                      className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 self-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-1 py-0.5 shadow-sm shrink-0`}
                    >
                      {/* Quick React Button */}
                      <div className="relative group/react">
                        <button
                          type="button"
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-800"
                          title="Thả cảm xúc"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-full mb-1 left-0 hidden group-hover/react:flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg z-30">
                          {QUICK_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className="w-6 h-6 hover:scale-125 transition flex items-center justify-center text-xs"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reply */}
                      <button
                        type="button"
                        onClick={() => setReplyingTo(msg)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-800"
                        title="Trả lời"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>

                      {/* Copy */}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-800"
                        title="Sao chép nội dung"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Pin (for owner/admin) */}
                      {actor?.isOwnerOrAdmin && (
                        <button
                          type="button"
                          onClick={() => handleTogglePin(msg.id)}
                          className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded ${
                            msg.isPinned ? 'text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-800'
                          }`}
                          title={msg.isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Edit (for sender if not card) */}
                      {isMe && !isCard && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMsgId(msg.id);
                            setEditingText(msg.content);
                          }}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-800"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete / Revoke */}
                      {(isMe || actor?.isOwnerOrAdmin) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-rose-600"
                          title="Thu hồi tin nhắn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating "Tin nhắn mới" Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className={`absolute bottom-20 right-6 px-3 py-1.5 rounded-full shadow-lg text-xs font-bold flex items-center gap-1.5 transition-all z-20 ${
            newMessagesArrived
              ? 'bg-[#2538D9] text-white animate-bounce'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <ChevronDown className="w-4 h-4" />
          <span>{newMessagesArrived ? 'Có tin nhắn mới' : 'Cuộn xuống cuối'}</span>
        </button>
      )}

      {/* 4. COMPOSER AREA */}
      <footer className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 relative">
        {/* Reply Bar Preview */}
        {replyingTo && (
          <div className="px-3 py-1.5 mb-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <Reply className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Đang trả lời {replyingTo.senderName}:
              </span>
              <span className="text-slate-500 truncate">{replyingTo.content}</span>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs flex items-center gap-1.5 shrink-0"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate max-w-[140px] font-medium">{att.fileName}</span>
                <button
                  type="button"
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                  className="p-0.5 text-slate-400 hover:text-rose-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Slash Command Picker Popup */}
        {showSlashPicker && (
          <SlashCommandPicker
            filterText={slashQuery}
            isOwnerOrAdmin={actor?.isOwnerOrAdmin}
            onSelect={handleSelectSlashCommand}
            onClose={() => setShowSlashPicker(false)}
          />
        )}

        {/* Locked Post Notice if only Admin can post */}
        {!canPost ? (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Chỉ Quản trị viên / Giáo viên mới có quyền gửi tin nhắn trong nhóm này.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 focus-within:border-blue-500 transition px-3 py-2 flex flex-col gap-1.5">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn (Gõ / để mở lệnh nghiệp vụ)..."
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none max-h-28"
              />

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                {/* Left toolbar icons */}
                <div className="flex items-center gap-1 text-slate-400">
                  {/* File attach */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingAttachment}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                    title="Đính kèm tệp hoặc ảnh"
                  >
                    {uploadingAttachment ? (
                      <CircularProgress size={14} sx={{ color: '#2538D9' }} />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                  </button>

                  {/* Slash command shortcut */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowSlashPicker(true);
                      setSlashQuery('/');
                    }}
                    className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition"
                    title="Mở bảng lệnh nghiệp vụ"
                  >
                    / Lệnh
                  </button>

                  {/* Emoji button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1.5 rounded-lg hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                      title="Chọn emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    {showEmojiPicker && (
                      <div className="absolute bottom-full mb-2 left-0 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-6 gap-1 z-30">
                        {QUICK_EMOJIS.concat(['❤️', '🎉', '🔥', '👏', '😂', '😮', '🙏', '✅', '💯', '⭐', '🚀', '📌']).map((em, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setInputText((prev) => prev + em);
                              setShowEmojiPicker(false);
                            }}
                            className="w-7 h-7 flex items-center justify-center hover:scale-125 transition text-sm"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Shift+Enter xuống dòng
                </span>
              </div>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && attachments.length === 0) || sending}
              className="p-3 rounded-2xl bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-40 text-white shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0"
              title="Gửi tin nhắn (Enter)"
            >
              {sending ? (
                <CircularProgress size={16} sx={{ color: '#fff' }} />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        )}
      </footer>

      {/* 5. MODALS */}
      {showPollModal && (
        <CreatePollModal
          open={showPollModal}
          onClose={() => setShowPollModal(false)}
          onSubmit={async (data) => {
            const res = await fetch(`/api/groups/${groupId}/chat/polls`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            const resData = await res.json();
            if (resData.success) {
              fetchInitialData();
            } else {
              throw new Error(resData.error || 'Lỗi khi tạo bình chọn');
            }
          }}
        />
      )}

      {showNoticeModal && (
        <CreateNoticeModal
          open={showNoticeModal}
          onClose={() => setShowNoticeModal(false)}
          onSubmit={async (data) => {
            const res = await fetch(`/api/groups/${groupId}/chat/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content: `📢 ${data.title}\n\n${data.content}`,
                messageType: 'CARD_ANNOUNCEMENT',
                isAnnouncement: true,
                cardPayload: JSON.stringify({
                  title: data.title,
                  content: data.content,
                }),
              }),
            });
            const resData = await res.json();
            if (resData.success && data.shouldPin) {
              await fetch(`/api/groups/${groupId}/chat/messages/${resData.data.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'pin' }),
              });
            }
            fetchInitialData();
          }}
        />
      )}

      {showSearchModal && (
        <MessageSearchModal
          open={showSearchModal}
          groupId={groupId}
          onClose={() => setShowSearchModal(false)}
          onSelectMessage={jumpToMessage}
        />
      )}

      {showInfoDrawer && (
        <GroupInfoDrawer
          open={showInfoDrawer}
          groupId={groupId}
          isOwnerOrAdmin={actor?.isOwnerOrAdmin}
          onClose={() => setShowInfoDrawer(false)}
          onJumpToMessage={jumpToMessage}
          onOpenImage={(src) => setLightboxImg(src)}
        />
      )}

      {lightboxImg && (
        <ImageLightbox
          src={lightboxImg}
          onClose={() => setLightboxImg(null)}
        />
      )}
    </div>
  );
}
