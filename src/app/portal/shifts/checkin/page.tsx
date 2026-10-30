'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  Check,
  ArrowLeft
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { ResolvedAction } from '@/lib/qr/actionEngine';

function ShiftCheckInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const actionToken = searchParams.get('actionToken') || searchParams.get('token');

  const [actionData, setActionData] = useState<ResolvedAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!actionToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/qr/actions/${encodeURIComponent(actionToken)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setActionData(res.data);
        } else {
          setErrorMsg(res.error || 'Mã chấm công ca không hợp lệ hoặc đã hết hạn');
        }
      })
      .catch(() => setErrorMsg('Lỗi kết nối máy chủ'))
      .finally(() => setLoading(false));
  }, [actionToken]);

  const handleConfirm = async () => {
    if (!actionToken || confirming) return;

    setConfirming(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/qr/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: actionToken }),
      });

      const resData = await res.json();
      if (resData.success) {
        setSuccessMsg(resData.data?.message || 'Chấm công ca làm thành công!');
      } else {
        setErrorMsg(resData.error || 'Không thể thực hiện chấm công ca');
      }
    } catch {
      setErrorMsg('Lỗi mạng khi xác nhận chấm công');
    } finally {
      setConfirming(false);
    }
  };

  const isCheckIn = actionData?.actionType === 'SHIFT_CHECK_IN';

  return (
    <div className="max-w-md mx-auto space-y-5 py-6 font-sans">
      <Link
        href="/portal/shifts"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về danh sách ca làm</span>
      </Link>

      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            {isCheckIn ? 'Xác Nhận Vào Ca (Check-in)' : 'Xác Nhận Ra Ca (Check-out)'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận thời gian làm việc thực tế thông qua Action QR.
          </p>
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <CircularProgress size={24} sx={{ color: '#2538D9' }} />
            <p className="text-xs text-slate-400">Đang kiểm tra thông tin ca...</p>
          </div>
        ) : successMsg ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-300 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-sm">{successMsg}</h3>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Thời gian: {new Date().toLocaleTimeString('vi-VN')} ngày {new Date().toLocaleDateString('vi-VN')}
            </p>
            <div className="pt-2">
              <Link
                href="/portal/shifts"
                className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Xong
              </Link>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 space-y-3">
            <AlertCircle className="w-7 h-7 text-rose-600 mx-auto" />
            <p className="text-xs font-bold">{errorMsg}</p>
            <Link
              href="/portal/scan"
              className="inline-block px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
            >
              Quét lại mã khác
            </Link>
          </div>
        ) : actionData ? (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {actionData.title}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{actionData.groupName}</span>
              </p>
              {actionData.description && (
                <p className="text-xs text-slate-400">{actionData.description}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full py-3 rounded-2xl bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-[#2538D9]/30 flex items-center justify-center gap-2 transition"
            >
              {confirming ? (
                <>
                  <CircularProgress size={16} sx={{ color: '#fff' }} />
                  <span>Đang ghi nhận...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isCheckIn ? 'Xác nhận Bắt Đầu Ca Làm' : 'Xác nhận Kết Thúc Ca Làm'}</span>
                </>
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ShiftCheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
          <CircularProgress size={32} sx={{ color: '#2538D9' }} />
          <p className="text-xs text-slate-500 font-medium">Đang tải xác nhận ca làm...</p>
        </div>
      }
    >
      <ShiftCheckInContent />
    </Suspense>
  );
}
