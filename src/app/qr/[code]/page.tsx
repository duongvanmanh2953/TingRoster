'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Tv,
  GraduationCap,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Building2,
  CreditCard,
  Sparkles
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { ResolvedAction } from '@/lib/qr/actionEngine';

export default function QrDispatcherPage() {
  const params = useParams();
  const router = useRouter();
  const rawCode = (params?.code as string) || '';
  const cleanCode = decodeURIComponent(rawCode).trim();

  const [analyzing, setAnalyzing] = useState(true);
  const [resolvedAction, setResolvedAction] = useState<ResolvedAction | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!cleanCode) {
      setAnalyzing(false);
      setErrorMsg('Mã QR trống');
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);

    // Call unified Action QR Resolver
    fetch('/api/qr/actions/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: cleanCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const action: ResolvedAction = data.data;
          setResolvedAction(action);
          // Automatic seamless redirect
          if (action.destinationUrl) {
            setTimeout(() => {
              router.push(action.destinationUrl);
            }, 800);
          }
        } else {
          setErrorMsg(data.error || 'Mã QR không hợp lệ hoặc đã hết hạn');
        }
      })
      .catch(() => {
        setErrorMsg('Không thể kết nối đến máy chủ TingRoster');
      })
      .finally(() => {
        setAnalyzing(false);
      });
  }, [cleanCode, router]);

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        {analyzing ? (
          <div className="py-12 space-y-3">
            <CircularProgress size={36} sx={{ color: '#2538D9' }} />
            <p className="text-xs text-slate-500 font-semibold">Đang nhận diện mã QR hành động...</p>
          </div>
        ) : errorMsg ? (
          <div className="space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Mã QR Không Hợp Lệ
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{errorMsg}</p>
            </div>
            <div className="pt-2">
              <Link
                href="/portal"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#2538D9] text-white text-xs font-bold"
              >
                Về Trang Chủ Học Viên
              </Link>
            </div>
          </div>
        ) : resolvedAction ? (
          <div className="space-y-4 py-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-blue-50 text-[#2538D9] border border-blue-200 mb-2">
                {resolvedAction.actionType}
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {resolvedAction.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{resolvedAction.groupName}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#2538D9]">
              <CircularProgress size={14} sx={{ color: '#2538D9' }} />
              <span>Đang chuyển hướng tới trang nghiệp vụ...</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push(resolvedAction.destinationUrl)}
                className="w-full py-2.5 rounded-xl bg-[#2538D9] text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>Mở ngay bây giờ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
