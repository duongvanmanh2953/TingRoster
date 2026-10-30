'use client';

import React, { useState } from 'react';
import { X, Megaphone, Pin } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';

interface CreateNoticeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; shouldPin: boolean }) => Promise<void>;
}

export function CreateNoticeModal({ open, onClose, onSubmit }: CreateNoticeModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [shouldPin, setShouldPin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        shouldPin,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Không thể phát thông báo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Gửi Thông Báo Quan Trọng
              </h3>
              <p className="text-[11px] text-slate-400">Phát thông báo chính thức đến mọi thành viên</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Tiêu đề thông báo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Lịch nghỉ lễ và thay đổi ca tập tuần tới"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              maxLength={120}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nội dung chi tiết <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung thông báo đầy đủ cho nhóm..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              maxLength={1500}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={shouldPin}
                onChange={(e) => setShouldPin(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1 font-medium">
                <Pin className="w-3.5 h-3.5 text-amber-500" />
                Ghim thông báo này lên đầu khung chat
              </span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <CircularProgress size={14} sx={{ color: '#fff' }} />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Phát thông báo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
