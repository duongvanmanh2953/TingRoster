'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserCheck,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  KeyRound,
  Building2,
  User
} from 'lucide-react';
import { SmartBackButton } from '@/components/common/SmartBackButton';

function ClaimAccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const codeFromUrl = searchParams.get('code') || '';
  const [activationCode, setActivationCode] = useState(codeFromUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimedAccount, setClaimedAccount] = useState<{
    id: string;
    identifier: string;
    displayName: string;
    spaceRole: string;
    group: {
      id: string;
      name: string;
      slug: string;
    };
  } | null>(null);

  useEffect(() => {
    if (codeFromUrl) {
      setActivationCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/portal/temporary-accounts/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activationCode: activationCode.trim().toUpperCase()
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setClaimedAccount(data.data);
      } else {
        setError(data.error || 'Mã kích hoạt không đúng hoặc đã hết hạn.');
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi kích hoạt tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6 px-4">
      <SmartBackButton fallbackUrl="/portal/groups" label="Quay lại Không gian của tôi" />

      {claimedAccount ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Kích Hoạt Tài Khoản Thành Công!
          </h2>

          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Bạn đã tiếp nhận chính thức danh tính <strong>{claimedAccount.displayName}</strong> ({claimedAccount.identifier}) trong không gian <strong>{claimedAccount.group.name}</strong>.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/portal/groups/${claimedAccount.group.id}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Vào không gian của tôi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/portal/groups"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50"
            >
              Danh sách không gian
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 text-xs font-bold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Tiếp Nhận Danh Tính Thành Viên</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Kích Hoạt Tài Khoản Tạm Thời
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nếu chủ không gian, giáo viên hoặc quản lý phòng trọ đã cấp trước cho bạn một mã kích hoạt (dạng ACT-XXXXXX), hãy nhập mã bên dưới để liên kết với tài khoản TingRoster của bạn.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleClaim} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Mã kích hoạt (6 ký tự):
              </label>
              <input
                type="text"
                required
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                placeholder="Ví dụ: ACT-98F12A"
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm font-mono font-bold tracking-wider text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực mã...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Xác Nhận & Kích Hoạt Tài Khoản</span>
                </>
              )}
            </button>
          </form>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-400 space-y-1 leading-relaxed">
            <p className="font-bold text-slate-600 dark:text-slate-300">Quy tắc bảo mật tài khoản:</p>
            <p>• Mã kích hoạt chỉ sử dụng 1 lần duy nhất để gán quyền vào không gian.</p>
            <p>• Mọi lịch sử điểm danh và hóa đơn trước đó của bạn được bảo toàn nguyên vẹn.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClaimAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-24 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs">Đang tải...</p>
        </div>
      }
    >
      <ClaimAccountContent />
    </Suspense>
  );
}
