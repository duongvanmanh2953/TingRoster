'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  MessageSquare,
  Megaphone,
  Users,
  Send,
  Lock,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface ChatConversation {
  id: string;
  title: string;
  type: 'ANNOUNCEMENT' | 'GROUP' | 'DIRECT';
  groupId?: string;
  workspaceId: string;
  isLocked?: boolean;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderName: string;
  };
}

interface ChatMsg {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  isAnnouncement: boolean;
  createdAt: string;
}

export default function ChatPortalPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [sending, setSending] = useState(false);
  const [directMessagesEnabled, setDirectMessagesEnabled] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations
  useEffect(() => {
    fetch('/api/chat/conversations')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setConversations(res.data.conversations || []);
          setDirectMessagesEnabled(res.data.entitlements.directMessagesEnabled);
          if (res.data.conversations.length > 0) {
            setActiveConv(res.data.conversations[0]);
          }
        }
      })
      .catch((err) => console.error('Fetch conversations error:', err))
      .finally(() => setLoadingConv(false));
  }, []);

  // 2. Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsg(true);
    setErrorMsg(null);

    fetch(`/api/chat/messages?conversationId=${activeConv.id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setMessages(res.data || []);
        } else {
          setErrorMsg(res.error || 'Không thể tải tin nhắn');
        }
      })
      .catch((err) => console.error('Fetch messages error:', err))
      .finally(() => setLoadingMsg(false));
  }, [activeConv?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || sending) return;

    setSending(true);
    setErrorMsg(null);

    const tempContent = inputText.trim();
    setInputText('');

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConv.id,
          content: tempContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
      } else {
        setErrorMsg(data.message || data.error || 'Không thể gửi tin nhắn');
        setInputText(tempContent); // restore
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ');
      setInputText(tempContent);
    } finally {
      setSending(false);
    }
  };

  const getConvIcon = (type: string) => {
    if (type === 'ANNOUNCEMENT') return <Megaphone className="w-4 h-4 text-indigo-600" />;
    if (type === 'DIRECT') return <MessageSquare className="w-4 h-4 text-purple-600" />;
    return <Users className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl shadow-xs overflow-hidden flex flex-col md:flex-row h-[700px]">
      {/* Left Sidebar: Conversations List (1/3 width) */}
      <div className="w-full md:w-80 border-r border-[#E5E7EB] dark:border-[#1E293B] flex flex-col bg-[#F9FAFB] dark:bg-[#0B0F19]">
        <div className="p-4 border-b border-[#E5E7EB] dark:border-[#1E293B]">
          <h2 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#2538D9]" />
            <span>Kênh Trò Chuyện & Bảng Tin</span>
          </h2>
          <span className="text-[11px] text-slate-400">Trao đổi nội bộ giữa Thầy cô và Học viên</span>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
          {loadingConv ? (
            <div className="p-4 text-center text-xs text-slate-400">Đang tải danh sách kênh...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">Không có cuộc trò chuyện nào.</div>
          ) : (
            conversations.map((c) => {
              const isActive = activeConv?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConv(c)}
                  className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                    isActive
                      ? 'bg-white dark:bg-[#111726] border-l-4 border-l-[#2538D9] shadow-xs'
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-slate-800 shrink-0">
                    {getConvIcon(c.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{c.title}</span>
                      {c.isLocked && <Lock className="w-3 h-3 text-amber-500 shrink-0 ml-1" />}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                      {c.type === 'ANNOUNCEMENT' ? 'Bảng tin thông báo' : c.type === 'DIRECT' ? 'Nhắn tin riêng 1-1' : 'Nhóm thảo luận'}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {c.lastMessage ? `${c.lastMessage.senderName}: ${c.lastMessage.content}` : 'Chưa có tin nhắn mới'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Panel (2/3 width) */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#111726]">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B]">
                  {getConvIcon(activeConv.type)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827] dark:text-white">{activeConv.title}</h3>
                  <span className="text-[11px] text-slate-400">
                    {activeConv.type === 'ANNOUNCEMENT'
                      ? 'Kênh thông báo 1 chiều từ Giáo viên / Quản lý'
                      : activeConv.type === 'DIRECT'
                      ? 'Nhắn tin riêng tư bảo mật'
                      : 'Các thành viên trong nhóm có thể tự do thảo luận'}
                  </span>
                </div>
              </div>

              {activeConv.type === 'ANNOUNCEMENT' && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-[#2538D9] border border-indigo-200">
                  Chỉ đọc
                </span>
              )}
            </div>

            {/* Locked feature banner (if Direct message is locked) */}
            {activeConv.isLocked && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Tính năng <strong>Direct Messages (1-1)</strong> thuộc gói Pro của cơ sở. Cơ sở hiện đang dùng gói miễn phí nên tính năng tạm khóa.
                  </span>
                </div>
                <span className="text-[11px] font-bold underline cursor-pointer">Tìm hiểu thêm</span>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 border-b border-rose-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loadingMsg ? (
                <div className="text-center text-xs text-slate-400 py-12">Đang tải lịch sử trò chuyện...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-12">
                  Chưa có tin nhắn nào trong kênh này. Hãy gửi tin nhắn đầu tiên!
                </div>
              ) : (
                messages.map((m) => {
                  const isTeacher = m.senderRole === 'TEACHER' || m.senderRole === 'OWNER';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.isAnnouncement
                          ? 'items-center my-3'
                          : isTeacher
                          ? 'items-start'
                          : 'items-start sm:items-end'
                      }`}
                    >
                      {/* If announcement card */}
                      {m.isAnnouncement ? (
                        <div className="w-full max-w-lg p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1 text-center">
                          <span className="text-[10px] uppercase font-bold text-[#2538D9] tracking-wider block">
                            📢 THÔNG BÁO TỪ GIÁO VIÊN ({m.senderName})
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{m.content}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} •{' '}
                            {new Date(m.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ) : (
                        <div className="max-w-md space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{m.senderName}</span>
                            {isTeacher && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                                Chủ nhiệm
                              </span>
                            )}
                            <span>{new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isTeacher
                                ? 'bg-slate-100 dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 rounded-tl-xs'
                                : 'bg-[#2538D9] text-white rounded-tr-xs'
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer Box */}
            <div className="p-3 sm:p-4 border-t border-[#E5E7EB] dark:border-[#1E293B] bg-[#F9FAFB] dark:bg-[#0B0F19]">
              {activeConv.type === 'ANNOUNCEMENT' ? (
                <div className="text-center text-xs text-slate-400 py-2">
                  🔒 Kênh thông báo phát thanh 1 chiều. Học viên chỉ có quyền xem tin nhắn.
                </div>
              ) : activeConv.isLocked ? (
                <div className="text-center text-xs text-amber-600 font-semibold py-2">
                  🔒 Tính năng nhắn tin riêng bị khóa theo gói của cơ sở.
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#111726] text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#2538D9]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Đang gửi...' : 'Gửi'}</span>
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            Chọn một kênh trò chuyện để bắt đầu.
          </div>
        )}
      </div>
    </div>
  );
}
