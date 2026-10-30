'use client';

import React, { useState } from 'react';
import { Search, X, Calendar, User, Pin, ArrowRight } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';

interface MessageSearchModalProps {
  open: boolean;
  groupId: string;
  onClose: () => void;
  onSelectMessage: (messageId: string) => void;
}

export function MessageSearchModal({
  open,
  groupId,
  onClose,
  onSelectMessage,
}: MessageSearchModalProps) {
  const [keyword, setKeyword] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  if (!open) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyword.trim() && !pinnedOnly) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set('search', keyword.trim());
      if (pinnedOnly) params.set('pinnedOnly', 'true');
      params.set('limit', '50');

      const res = await fetch(`/api/groups/${groupId}/chat/messages?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data?.messages) {
        setResults(data.data.messages);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Tìm Kiếm Trong Nhóm Chat
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input & filters */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nhập từ khóa tin nhắn cần tìm..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || (!keyword.trim() && !pinnedOnly)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
            >
              {loading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Tìm'}
            </button>
          </form>

          <div className="flex items-center gap-4 mt-2.5">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={pinnedOnly}
                onChange={(e) => {
                  setPinnedOnly(e.target.checked);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1">
                <Pin className="w-3 h-3 text-amber-500" />
                Chỉ tin nhắn đã ghim
              </span>
            </label>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <CircularProgress size={20} sx={{ color: '#2538D9' }} />
              <span>Đang tìm kiếm tin nhắn trong nhóm...</span>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              Không tìm thấy tin nhắn nào phù hợp
            </div>
          )}

          {!loading &&
            results.map((msg) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => {
                  onSelectMessage(msg.id);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 bg-white dark:bg-slate-900/60 hover:bg-blue-50/30 transition group flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.createdAt).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {msg.isPinned && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 text-[9px] font-bold">
                        Đã ghim
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {msg.content}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
