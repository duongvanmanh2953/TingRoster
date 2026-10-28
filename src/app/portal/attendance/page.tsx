'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  FileEdit,
  X,
  Check
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT_CHARGED' | 'ABSENT_EXCUSED' | 'MAKEUP';
  isPresent: boolean;
  note?: string;
  group: { id: string; name: string };
}

interface AdjustmentRequest {
  id: string;
  date: string;
  requestedStatus: string;
  reason: string;
  status: string;
  reviewNote?: string;
  createdAt: string;
}

interface AttendanceData {
  records: AttendanceRecord[];
  stats: {
    present: number;
    absentCharged: number;
    absentExcused: number;
    makeup: number;
    total: number;
  };
  pendingAdjustments: AdjustmentRequest[];
}

export default function MemberAttendancePage() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [adjDate, setAdjDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [adjStatus, setAdjStatus] = useState<string>('PRESENT');
  const [adjReason, setAdjReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAttendance = () => {
    fetch('/api/portal/attendance')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
          if (res.data.records.length > 0 && !selectedGroup) {
            setSelectedGroup(res.data.records[0].group.id);
          }
        }
      })
      .catch((err) => console.error('Fetch attendance error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg(null);

    try {
      const res = await fetch('/api/portal/attendance/adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroup,
          date: adjDate,
          requestedStatus: adjStatus,
          reason: adjReason,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSubmitMsg({ type: 'success', text: result.message || 'Gửi yêu cầu thành công!' });
        setAdjReason('');
        setTimeout(() => {
          setShowAdjustmentModal(false);
          setSubmitMsg(null);
          fetchAttendance();
        }, 1500);
      } else {
        setSubmitMsg({ type: 'error', text: result.error || 'Không thể gửi yêu cầu' });
      }
    } catch {
      setSubmitMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#2538D9] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải lịch sử điểm danh...</p>
      </div>
    );
  }

  const records = data?.records || [];
  const stats = data?.stats || { present: 0, absentCharged: 0, absentExcused: 0, makeup: 0, total: 0 };
  const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-[#2538D9]" />
            <h1 className="text-xl font-bold text-[#111827] dark:text-white">Điểm Danh & Theo Dõi Chuyên Cần</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Minh bạch lịch tham gia các buổi học / sinh hoạt. Bạn có thể gửi yêu cầu khiếu nại nếu phát hiện sai sót.
          </p>
        </div>

        <button
          onClick={() => setShowAdjustmentModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto shadow-xs"
        >
          <FileEdit className="w-4 h-4" />
          <span>Gửi khiếu nại điểm danh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500">Tỷ lệ chuyên cần</span>
          <div className="text-2xl font-extrabold text-[#2538D9] mt-1 font-mono">{attendanceRate}%</div>
          <span className="text-[11px] text-slate-400">Trên tổng {stats.total} buổi</span>
        </div>

        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500">Có mặt đúng giờ</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">{stats.present}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Tham gia đầy đủ</span>
        </div>

        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500">Nghỉ có phép</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1 font-mono">{stats.absentExcused}</div>
          <span className="text-[11px] text-slate-400">Đã xin phép trước</span>
        </div>

        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500">Vắng tính phí / Học bù</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 font-mono">
            {stats.absentCharged + stats.makeup}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold">Theo quy chế cơ sở</span>
        </div>
      </div>

      {/* Attendance History List */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6">
        <h2 className="text-sm font-bold text-[#111827] dark:text-white mb-4">Chi tiết các buổi sinh hoạt & học tập</h2>

        {records.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">Chưa có dữ liệu điểm danh.</p>
        ) : (
          <div className="rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B0F19] border-b border-[#E5E7EB] dark:border-[#1E293B] text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Ngày học</th>
                  <th className="py-2.5 px-4">Nhóm / Lớp</th>
                  <th className="py-2.5 px-4">Trạng thái điểm danh</th>
                  <th className="py-2.5 px-4">Ghi chú từ giáo viên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
                {records.map((r) => {
                  const isPresent = r.status === 'PRESENT';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(r.date).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.group.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : r.status === 'ABSENT_CHARGED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isPresent ? 'Có mặt' : r.status === 'ABSENT_CHARGED' ? 'Vắng (Tính phí)' : 'Nghỉ có phép'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic">{r.note || 'Không có ghi chú'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Adjustments Queue */}
      {data?.pendingAdjustments && data.pendingAdjustments.length > 0 && (
        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#111827] dark:text-white mb-3">Yêu cầu khiếu nại đã gửi</h2>
          <div className="space-y-2">
            {data.pendingAdjustments.map((adj) => (
              <div
                key={adj.id}
                className="p-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Ngày xin sửa: {new Date(adj.date).toLocaleDateString('vi-VN')}
                  </span>
                  <p className="text-slate-500 mt-0.5">Lý do: &quot;{adj.reason}&quot;</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                    adj.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : adj.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {adj.status === 'APPROVED' ? 'Đã duyệt' : adj.status === 'REJECTED' ? 'Từ chối' : 'Chờ giáo viên xem xét'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Gửi khiếu nại điểm danh */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAdjustmentModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Yêu cầu điều chỉnh điểm danh</h3>
            <p className="text-xs text-slate-500 mb-4">
              Điền thông tin buổi học cần khiếu nại để giáo viên hoặc chủ cơ sở kiểm tra và cập nhật lại.
            </p>

            {submitMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold mb-4 ${
                  submitMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {submitMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmitAdjustment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ngày diễn ra buổi học</label>
                <input
                  type="date"
                  required
                  value={adjDate}
                  onChange={(e) => setAdjDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-50 dark:bg-[#0B0F19]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Trạng thái thực tế</label>
                <select
                  value={adjStatus}
                  onChange={(e) => setAdjStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-50 dark:bg-[#0B0F19]"
                >
                  <option value="PRESENT">Có mặt (Bị điểm danh vắng nhầm)</option>
                  <option value="ABSENT_EXCUSED">Nghỉ có phép (Đã gửi đơn xin phép)</option>
                  <option value="MAKEUP">Đã học bù sang ca khác</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Lý do giải trình chi tiết</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ví dụ: Em có tham gia buổi học hôm đó và ngồi bàn 2, nhờ thầy cô kiểm tra lại sổ điểm danh..."
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-50 dark:bg-[#0B0F19]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#2538D9] text-white font-bold hover:bg-[#1E2DB8] disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
