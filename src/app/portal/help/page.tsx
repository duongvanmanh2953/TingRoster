'use client';

import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileQuestion,
  MessageSquare,
  ShieldAlert,
  Plus
} from 'lucide-react';

interface Ticket {
  id: string;
  ticketCode: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  adminNote?: string;
  createdAt: string;
}

export default function MemberHelpCenterPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [category, setCategory] = useState<'BILLING' | 'BUG' | 'FEATURE' | 'GENERAL'>('BILLING');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTickets = () => {
    fetch('/api/support/tickets')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setTickets(res.data || []);
        }
      })
      .catch((err) => console.error('Fetch tickets error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, subject, description, priority }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        setSubject('');
        setDescription('');
        setTimeout(() => {
          setShowCreate(false);
          setMsg(null);
          fetchTickets();
        }, 1500);
      } else {
        setMsg({ type: 'error', text: data.error || 'Không thể gửi yêu cầu' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'RESOLVED' || status === 'CLOSED') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap select-none">Đã giải quyết</span>;
    }
    if (status === 'IN_PROGRESS') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap select-none">Đang xử lý</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap select-none">Mới tiếp nhận</span>;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#2538D9]" />
            <h1 className="text-xl font-bold text-[#111827] dark:text-white">Trung Tâm Trợ Giúp & Khiếu Nại</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gửi yêu cầu kiểm tra giao dịch chuyển khoản, sai lệch điểm danh hoặc đề xuất tính năng mới.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo phiếu hỗ trợ mới</span>
        </button>
      </div>

      {/* Create Ticket Box */}
      {showCreate && (
        <div className="bg-white dark:bg-[#111726] border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#111827] dark:text-white mb-1">Gửi phiếu yêu cầu hỗ trợ</h2>
          <p className="text-xs text-slate-500 mb-4">Đội ngũ kỹ thuật và giáo viên sẽ phản hồi trong vòng 24 giờ làm việc.</p>

          {msg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold mb-4 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Loại vấn đề</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-50 dark:bg-[#0B0F19]"
                >
                  <option value="BILLING">Vấn đề thanh toán / Đối soát VietQR</option>
                  <option value="BUG">Báo lỗi giao diện / Không nhận thông báo</option>
                  <option value="FEATURE">Đề xuất cải tiến sản phẩm</option>
                  <option value="GENERAL">Thắc mắc chung</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mức độ ưu tiên</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-50 dark:bg-[#0B0F19]"
                >
                  <option value="NORMAL">Bình thường</option>
                  <option value="HIGH">Cần xử lý gấp trong ngày</option>
                  <option value="URGENT">Khẩn cấp (Sai lệch tài chính)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tiêu đề yêu cầu</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Đã chuyển khoản học phí tháng 10 nhưng chưa thấy gạch nợ..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-50 dark:bg-[#0B0F19]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mô tả chi tiết</label>
              <textarea
                rows={3}
                required
                placeholder="Cung cấp mã tham chiếu chuyển khoản hoặc thông tin chi tiết cần hỗ trợ..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-50 dark:bg-[#0B0F19]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-slate-600 font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-[#2538D9] text-white font-bold hover:bg-[#1E2DB8] disabled:opacity-60 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Đang gửi...' : 'Gửi phiếu hỗ trợ'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6">
        <h2 className="text-sm font-bold text-[#111827] dark:text-white mb-4">Lịch sử phiếu hỗ trợ của bạn</h2>

        {loading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Đang tải danh sách phiếu...</p>
        ) : tickets.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Bạn chưa có phiếu hỗ trợ nào.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#2538D9] font-mono">{t.ticketCode}</span>
                    <span className="text-slate-400">• {new Date(t.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {getStatusBadge(t.status)}
                </div>

                <h3 className="font-bold text-slate-800 dark:text-white text-sm">{t.subject}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t.description}</p>

                {t.adminNote && (
                  <div className="mt-2.5 p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Phản hồi từ TingRoster Support:</span>
                    <p className="text-slate-600 dark:text-slate-400">{t.adminNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
