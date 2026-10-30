'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  QrCode,
  KeyRound,
  Building2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Clock,
  Camera,
  Send,
  UserCheck,
  XCircle,
  Phone
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { ResolvedAction } from '@/lib/qr/actionEngine';

interface JoinRequestItem {
  id: string;
  groupId: string;
  userName: string;
  userPhone?: string | null;
  message?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  group: {
    id: string;
    name: string;
    slug: string;
    groupType: string;
    logoUrl?: string | null;
    user: { name: string; email: string };
  };
}

function StudentJoinSpaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionTokenParam = searchParams.get('actionToken') || searchParams.get('token');
  const codeParam = searchParams.get('code');

  const [inviteCode, setInviteCode] = useState(codeParam || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Action QR state
  const [actionData, setActionData] = useState<ResolvedAction | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [actionPhone, setActionPhone] = useState('');
  const [actionSuccessResult, setActionSuccessResult] = useState<{
    message: string;
    isPending?: boolean;
    isApproved?: boolean;
  } | null>(null);

  // My Pending / Past Requests
  const [myRequests, setMyRequests] = useState<JoinRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Load user's past join requests
  const loadMyRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const res = await fetch('/api/portal/join-requests');
      const data = await res.json();
      if (data.success && data.data) {
        setMyRequests(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    loadMyRequests();
  }, [loadMyRequests]);

  // Load Action QR details if actionToken or code is present
  useEffect(() => {
    const targetToken = actionTokenParam || (codeParam && codeParam.startsWith('tr_act_') ? codeParam : null);
    if (!targetToken) return;

    setLoadingAction(true);
    setError(null);

    fetch(`/api/qr/actions/${encodeURIComponent(targetToken)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setActionData(res.data);
        } else {
          setError(res.error || 'Mã tham gia không hợp lệ hoặc đã hết hạn');
        }
      })
      .catch(() => setError('Lỗi kết nối máy chủ xác minh mã tham gia'))
      .finally(() => setLoadingAction(false));
  }, [actionTokenParam, codeParam]);

  // Submit manual invite code or space code
  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Try resolving with Action QR Resolver first
      const resolveRes = await fetch('/api/qr/actions/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      const resolveJson = await resolveRes.json();

      if (resolveJson.success && resolveJson.data) {
        const action: ResolvedAction = resolveJson.data;
        if (action.actionType === 'JOIN_SPACE' || action.actionType === 'JOIN_GROUP') {
          setActionData(action);
          setLoading(false);
          return;
        } else {
          // If the scanned code was for ATTENDANCE or PAYMENT, redirect directly!
          router.push(action.destinationUrl);
          return;
        }
      }

      // 2. Fallback to legacy invitations/accept
      const res = await fetch('/api/portal/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccessResult({
          message: `Đã tham gia thành công không gian ${data.data.group.name}!`,
          isApproved: true,
        });
        loadMyRequests();
      } else {
        setError(data.error || 'Mã tham gia không hợp lệ hoặc đã hết hạn');
      }
    } catch {
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Action QR Join Request
  const handleConfirmActionJoin = async () => {
    if (!actionData || submittingAction) return;

    setSubmittingAction(true);
    setError(null);

    try {
      const res = await fetch('/api/qr/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: actionData.token,
          notes: actionNotes.trim() || undefined,
          phone: actionPhone.trim() || undefined,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        setActionSuccessResult({
          message: resData.data?.message || 'Yêu cầu tham gia đã được gửi thành công!',
          isPending: resData.data?.isPending,
          isApproved: resData.data?.isApproved,
        });
        loadMyRequests();
      } else {
        setError(resData.error || 'Không thể gửi yêu cầu tham gia');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4 font-sans">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-[#2538D9] flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <Link
            href="/portal/scan"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] text-xs font-bold hover:bg-blue-100 transition"
          >
            <Camera className="w-4 h-4" />
            <span>Quét QR tham gia</span>
          </Link>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-[#111827] dark:text-white tracking-tight">
          Tham Gia Không Gian & Lớp Học
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Gửi yêu cầu tham gia lớp học, câu lạc bộ hoặc phòng trọ thông qua Action QR, mã ngắn (<span className="font-mono font-bold text-slate-700 dark:text-slate-300">ACT-XXXX</span>) hoặc mã định danh học viên.
        </p>
      </div>

      {/* ACTION QR CONFIRMATION CARD */}
      {actionData && (
        <div className="bg-white dark:bg-[#111726] border border-[#2538D9]/40 rounded-3xl p-6 sm:p-7 shadow-lg space-y-5 animate-fade-in ring-2 ring-[#2538D9]/10">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lời Mời Tham Gia Từ Mã QR</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 font-bold">
              {actionData.shortCode}
            </span>
          </div>

          {actionSuccessResult ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {actionSuccessResult.isApproved ? 'Đã Tham Gia Thành Công!' : 'Yêu Cầu Đã Được Gửi!'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                {actionSuccessResult.message}
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  href="/portal"
                  className="px-5 py-2.5 rounded-xl bg-[#2538D9] text-white text-xs font-bold shadow-xs hover:bg-[#1E2DB8] transition"
                >
                  Về Trang chủ Học viên
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setActionData(null);
                    setActionSuccessResult(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition"
                >
                  Nhập mã khác
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Space Info */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {actionData.groupName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {actionData.title}
                    </p>
                  </div>
                </div>
                {actionData.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed">
                    {actionData.description}
                  </p>
                )}
              </div>

              {/* Status Notice */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                <Clock className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>
                  {actionData.eligibilityMessage ||
                    'Yêu cầu này sẽ được gửi đến Quản lý / Chủ không gian để xét duyệt trước khi kích hoạt thành viên.'}
                </span>
              </div>

              {/* Contact phone & note */}
              {actionData.canExecute && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Số điện thoại liên hệ (để đối chiếu):
                    </label>
                    <input
                      type="tel"
                      value={actionPhone}
                      onChange={(e) => setActionPhone(e.target.value)}
                      placeholder="Ví dụ: 0912 345 678"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#2538D9]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Lời nhắn gửi người quản lý (tùy chọn):
                    </label>
                    <input
                      type="text"
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Ví dụ: Em xin phép tham gia lớp Toán 12A chiều thứ 3"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#2538D9]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmActionJoin}
                    disabled={submittingAction}
                    className="w-full py-3 rounded-2xl bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2538D9]/30 transition"
                  >
                    {submittingAction ? (
                      <>
                        <CircularProgress size={16} sx={{ color: '#fff' }} />
                        <span>Đang gửi yêu cầu...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Gửi Yêu Cầu Tham Gia Ngay</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MANUAL CODE SUBMISSION FORM */}
      {!actionData && (
        <form
          onSubmit={handleSubmitCode}
          className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs"
        >
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Nhập mã tham gia hoặc mã hành động:
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Ví dụ: ACT-8492 hoặc TR-MEMBER-9A1F2C hoặc slug-lop-hoc"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2538D9] font-mono tracking-wide"
            />
            <p className="text-[11px] text-slate-400">
              Bạn có thể nhập mã dự phòng 4 số hiển thị trên Kiosk (<span className="font-mono font-bold text-slate-600 dark:text-slate-300">ACT-XXXX</span>) hoặc link mời.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !inviteCode.trim()}
            className="w-full py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Đang xác minh mã...</span>
            ) : (
              <>
                <span>Xác nhận tham gia không gian</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* MY PENDING / PAST JOIN REQUESTS LIST */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users2 className="w-4 h-4 text-[#2538D9]" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Yêu Cầu Tham Gia Của Bạn
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {myRequests.length} yêu cầu
          </span>
        </div>

        {loadingRequests ? (
          <div className="py-6 flex items-center justify-center">
            <CircularProgress size={20} sx={{ color: '#2538D9' }} />
          </div>
        ) : myRequests.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Bạn chưa gửi yêu cầu tham gia không gian nào.
          </p>
        ) : (
          <div className="space-y-2.5">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    {req.group.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Quản lý: {req.group.user.name} • {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div>
                  {req.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 text-[11px] font-bold">
                      <Clock className="w-3 h-3" />
                      <span>Chờ duyệt</span>
                    </span>
                  )}
                  {req.status === 'APPROVED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 text-[11px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã duyệt</span>
                    </span>
                  )}
                  {req.status === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 text-[11px] font-bold">
                      <XCircle className="w-3 h-3" />
                      <span>Bị từ chối</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentJoinSpacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
          <CircularProgress size={32} sx={{ color: '#2538D9' }} />
          <p className="text-xs text-slate-500 font-medium">Đang tải trang tham gia không gian...</p>
        </div>
      }
    >
      <StudentJoinSpaceContent />
    </Suspense>
  );
}
