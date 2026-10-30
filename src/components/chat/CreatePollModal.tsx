'use client';

import React, { useState } from 'react';
import { X, Vote, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';

interface CreatePollModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { question: string; options: string[]; isMultiple: boolean }) => Promise<void>;
}

export function CreatePollModal({ open, onClose, onSubmit }: CreatePollModalProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [isMultiple, setIsMultiple] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleAddOption = () => {
    if (options.length >= 8) return;
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, val: string) => {
    const next = [...options];
    next[index] = val;
    setOptions(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Vui lòng nhập câu hỏi bình chọn');
      return;
    }

    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setError('Vui lòng nhập ít nhất 2 phương án bình chọn');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        question: question.trim(),
        options: cleanOptions,
        isMultiple,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Không thể tạo bình chọn');
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
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
              <Vote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Tạo Bình Chọn Nhóm
              </h3>
              <p className="text-[11px] text-slate-400">Thu thập ý kiến thành viên nhanh chóng</p>
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
              Câu hỏi bình chọn <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ví dụ: Thứ 7 này nhóm mình tổ chức thi đấu giao lưu lúc mấy giờ?"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Các phương án lựa chọn <span className="text-rose-500">*</span>
            </label>

            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Phương án ${idx + 1}`}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  maxLength={100}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {options.length < 8 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm phương án</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isMultiple}
                onChange={(e) => setIsMultiple(e.target.checked)}
                className="rounded text-violet-600 focus:ring-violet-500"
              />
              <span>Cho phép chọn nhiều phương án</span>
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
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white shadow-md shadow-violet-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <CircularProgress size={14} sx={{ color: '#fff' }} />
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <Vote className="w-3.5 h-3.5" />
                  <span>Gửi bình chọn</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
