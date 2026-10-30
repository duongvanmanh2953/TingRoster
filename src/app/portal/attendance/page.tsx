'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';
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
  Check,
  Sparkles,
  Building2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { ResolvedAction } from '@/lib/qr/actionEngine';
import { TingDatePicker } from '@/components/common/DatePicker';
import { TingSelect } from '@/components/common/Select';

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

function MemberAttendanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const actionToken = searchParams.get('actionToken');

  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [adjDate, setAdjDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [adjStatus, setAdjStatus] = useState<string>('PRESENT');
  const [adjReason, setAdjReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Action QR Confirmation State
  const [actionData, setActionData] = useState<ResolvedAction | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [confirmingAttendance, setConfirmingAttendance] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Load Action QR Details if token is provided in query params
  useEffect(() => {
    if (!actionToken) return;

    setLoadingAction(true);
    setActionErrorMsg(null);
    fetch(`/api/qr/actions/${encodeURIComponent(actionToken)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setActionData(res.data);
        } else {
          setActionErrorMsg(res.error || 'Mã điểm danh không hợp lệ hoặc đã hết hạn');
        }
      })
      .catch(() => setActionErrorMsg('Không thể kết nối đến máy chủ xác minh điểm danh'))
      .finally(() => setLoadingAction(false));
  }, [actionToken]);

  const handleConfirmAttendance = async () => {
    if (!actionToken || confirmingAttendance) return;

    setConfirmingAttendance(true);
    setActionErrorMsg(null);

    try {
      const res = await fetch('/api/qr/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: actionToken }),
      });

      const resData = await res.json();
      if (resData.success) {
        setActionSuccessMsg(resData.data?.message || 'Điểm danh thành công!');
        fetchAttendance();
      } else {
        setActionErrorMsg(resData.error || 'Không thể xác nhận điểm danh');
      }
    } catch {
      setActionErrorMsg('Lỗi mạng khi xác nhận điểm danh');
    } finally {
      setConfirmingAttendance(false);
    }
  };

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

      {/* Action QR Scan Attendance Confirmation Card */}
      {actionToken && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-xl space-y-4 border border-blue-700/50 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Yêu Cầu Điểm Danh Từ Mã QR</span>
            </span>
            <button
              type="button"
              onClick={() => router.push('/portal/attendance')}
              className="text-xs text-blue-300 hover:text-white transition"
            >
              Đóng
            </button>
          </div>

          {loadingAction ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs font-medium text-blue-200">
              <CircularProgress size={20} sx={{ color: '#fff' }} />
              <span>Đang kiểm tra thông tin buổi điểm danh...</span>
            </div>
          ) : actionSuccessMsg ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm">{actionSuccessMsg}</h4>
                <p className="text-xs text-emerald-200/80">Lịch sử điểm danh đã được cập nhật tự động.</p>
              </div>
            </div>
          ) : actionErrorMsg ? (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-100 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Không thể thực hiện điểm danh</h4>
                <p className="text-xs text-rose-200/80">{actionErrorMsg}</p>
              </div>
            </div>
          ) : actionData ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
                <div>
                  <h3 className="text-base font-extrabold text-white">{actionData.title}</h3>
                  <p className="text-xs text-blue-200 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{actionData.groupName}</span>
                  </p>
                  {actionData.description && (
                    <p className="text-xs text-blue-100/80 mt-1">{actionData.description}</p>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap select-none ${
                    actionData.canExecute
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  }`}>
                    {actionData.eligibilityMessage || (actionData.canExecute ? 'Có thể điểm danh' : 'Không khả dụng')}
                  </span>
                </div>
              </div>

              {actionData.canExecute && (
                <button
                  type="button"
                  onClick={handleConfirmAttendance}
                  disabled={confirmingAttendance}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/40 flex items-center justify-center gap-2 transition"
                >
                  {confirmingAttendance ? (
                    <>
                      <CircularProgress size={16} sx={{ color: '#fff' }} />
                      <span>Đang lưu điểm danh...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Xác nhận Điểm Danh Ngay</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}

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
                {records.map((r: AttendanceRecord) => {
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
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap select-none ${
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
            {data.pendingAdjustments.map((adj: AdjustmentRequest) => (
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
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-auto whitespace-nowrap select-none ${
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
                <TingDatePicker
                  value={adjDate}
                  onChange={(val) => setAdjDate(val)}
                  sizeVariant="sm"
                  className="w-full"
                  containerClassName="w-full"
                  placeholder="Chọn ngày học"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Trạng thái thực tế</label>
                <TingSelect
                  value={adjStatus}
                  onChange={(e) => setAdjStatus(e.target.value)}
                  options={[
                    { value: 'PRESENT', label: 'Có mặt (Bị điểm danh vắng nhầm)' },
                    { value: 'ABSENT_EXCUSED', label: 'Nghỉ có phép (Đã gửi đơn xin phép)' },
                    { value: 'MAKEUP', label: 'Đã học bù sang ca khác' },
                  ]}
                  size="small"
                  fullWidth
                />
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

export default function MemberAttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
          <CircularProgress size={32} sx={{ color: '#2538D9' }} />
          <p className="text-xs text-slate-500 font-medium">Đang tải trang điểm danh...</p>
        </div>
      }
    >
      <MemberAttendanceContent />
    </Suspense>
  );
}
