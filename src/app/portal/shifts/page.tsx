'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Users2,
  Camera,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { ResolvedAction } from '@/lib/qr/actionEngine';

interface ShiftItem {
  id: string;
  name: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  maxSlots: number;
  description?: string | null;
  group: { id: string; name: string; slug: string };
  assignments: Array<{
    id: string;
    userId: string;
    userName: string;
    status: string;
    checkInTime?: string | null;
    checkOutTime?: string | null;
  }>;
}

import { Suspense } from 'react';

function StudentShiftsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const actionToken = searchParams.get('actionToken') || searchParams.get('token');

  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Action QR state
  const [actionData, setActionData] = useState<ResolvedAction | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Load shifts
  const loadShifts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portal/shifts');
      const data = await res.json();
      if (data.success && data.data) {
        setShifts(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  // Load Action QR details if token is provided
  useEffect(() => {
    if (!actionToken) return;

    setLoadingAction(true);
    fetch(`/api/qr/actions/${encodeURIComponent(actionToken)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setActionData(res.data);
        } else {
          setActionErrorMsg(res.error || 'Mã đăng ký ca không hợp lệ');
        }
      })
      .catch(() => setActionErrorMsg('Lỗi kết nối máy chủ'))
      .finally(() => setLoadingAction(false));
  }, [actionToken]);

  // Confirm registration from Action QR
  const handleConfirmRegister = async () => {
    if (!actionToken || registering) return;

    setRegistering(true);
    setActionErrorMsg(null);

    try {
      const res = await fetch('/api/qr/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: actionToken }),
      });

      const resData = await res.json();
      if (resData.success) {
        setActionSuccessMsg(resData.data?.message || 'Đăng ký ca làm việc thành công!');
        loadShifts();
      } else {
        setActionErrorMsg(resData.error || 'Không thể đăng ký ca làm');
      }
    } catch {
      setActionErrorMsg('Lỗi mạng khi đăng ký ca');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#2538D9]" />
            <h1 className="text-xl font-black text-[#111827] dark:text-white">
              Lịch Ca & Điểm Danh Trực
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đăng ký ca làm việc, ca hỗ trợ hoặc trực sân thể thao bằng Action QR và điểm danh Check-in/Check-out.
          </p>
        </div>

        <Link
          href="/portal/scan"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2538D9] text-white text-xs font-bold hover:bg-[#1E2DB8] transition shadow-xs self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" />
          <span>Quét QR ca làm</span>
        </Link>
      </div>

      {/* ACTION QR CONFIRMATION CARD */}
      {actionToken && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-900 to-orange-950 text-white shadow-xl space-y-4 border border-amber-700/50 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đăng Ký Ca Từ Mã QR</span>
            </span>
            <button
              type="button"
              onClick={() => router.push('/portal/shifts')}
              className="text-xs text-amber-300 hover:text-white transition"
            >
              Đóng
            </button>
          </div>

          {loadingAction ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs font-medium text-amber-200">
              <CircularProgress size={20} sx={{ color: '#fff' }} />
              <span>Đang kiểm tra thông tin ca làm...</span>
            </div>
          ) : actionSuccessMsg ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm">{actionSuccessMsg}</h4>
                <p className="text-xs text-emerald-200/80">Lịch ca của bạn đã được ghi nhận.</p>
              </div>
            </div>
          ) : actionErrorMsg ? (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-100 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Không thể đăng ký</h4>
                <p className="text-xs text-rose-200/80">{actionErrorMsg}</p>
              </div>
            </div>
          ) : actionData ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
                <h3 className="text-base font-extrabold text-white">{actionData.title}</h3>
                <p className="text-xs text-amber-200 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{actionData.groupName}</span>
                </p>
                {actionData.description && (
                  <p className="text-xs text-amber-100/80">{actionData.description}</p>
                )}
              </div>

              {actionData.canExecute && (
                <button
                  type="button"
                  onClick={handleConfirmRegister}
                  disabled={registering}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/40 flex items-center justify-center gap-2 transition"
                >
                  {registering ? (
                    <>
                      <CircularProgress size={16} sx={{ color: '#fff' }} />
                      <span>Đang lưu đăng ký...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Xác nhận Đăng Ký Ca Này</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* SHIFTS LIST */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
          Danh Sách Ca Làm Đang Mở
        </h2>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <CircularProgress size={24} sx={{ color: '#2538D9' }} />
            <p className="text-xs text-slate-400">Đang tải danh sách ca...</p>
          </div>
        ) : shifts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#111726] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Hiện Chưa Có Ca Mở Đăng Ký
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Khi người quản lý mở ca trực mới hoặc tạo mã QR ca làm việc, bạn có thể quét mã để đăng ký tham gia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shifts.map((shift) => {
              const remainingSlots = Math.max(0, shift.maxSlots - shift.assignments.length);
              const isFull = remainingSlots === 0;

              return (
                <div
                  key={shift.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2538D9]">{shift.group.name}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isFull
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}
                    >
                      {isFull ? 'Hết chỗ' : `Còn ${remainingSlots} chỗ`}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {shift.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(shift.shiftDate).toLocaleDateString('vi-VN')} • {shift.startTime} - {shift.endTime}
                      </span>
                    </p>
                    {shift.location && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{shift.location}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {shift.assignments.length} người đã đăng ký
                    </span>
                    <Link
                      href="/portal/scan"
                      className="inline-flex items-center gap-1 text-[#2538D9] font-bold hover:underline"
                    >
                      <span>Quét QR điểm danh ca</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentShiftsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
          <CircularProgress size={32} sx={{ color: '#2538D9' }} />
          <p className="text-xs text-slate-500 font-medium">Đang tải danh sách ca hoạt động...</p>
        </div>
      }
    >
      <StudentShiftsContent />
    </Suspense>
  );
}
