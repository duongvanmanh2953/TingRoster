'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ArrowRight, 
  Send,
  Mail,
  ShieldCheck 
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/components/theme/ThemeContext';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR' | 'NO_TOKEN'>(
    token ? 'LOADING' : 'NO_TOKEN'
  );
  const [message, setMessage] = useState<string>('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendResult, setResendResult] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('NO_TOKEN');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (data.success) {
          setStatus('SUCCESS');
          setMessage(data.data?.message || 'Xác thực địa chỉ email thành công!');
        } else {
          setStatus('ERROR');
          setMessage(data.error || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
          if (data.email) {
            setResendEmail(data.email);
          }
        }
      } catch {
        setStatus('ERROR');
        setMessage('Lỗi kết nối máy chủ khi xác thực email.');
      }
    };

    verify();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResending(true);
    setResendResult(null);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setResendResult(data.data?.message || 'Đã gửi lại thư xác thực!');
      } else {
        setResendResult(data.error || 'Gửi lại email thất bại.');
      }
    } catch {
      setResendResult('Lỗi kết nối khi gửi lại email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors selection:bg-[#2538D9] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo href="/" size="lg" theme={isDark ? 'dark' : 'light'} />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-[#111726] py-10 px-6 sm:px-10 border border-[#E4E7EC] dark:border-slate-800 rounded-2xl shadow-sm text-center">
          {status === 'LOADING' && (
            <div className="py-6">
              <Loader2 className="w-12 h-12 text-[#2538D9] dark:text-[#4F62FF] animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-medium text-[#101828] dark:text-white">
                Đang xác thực địa chỉ email...
              </h2>
              <p className="mt-2 text-sm text-[#475467] dark:text-slate-400">
                Vui lòng đợi giây lát trong khi chúng tôi kích hoạt tài khoản của bạn.
              </p>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="py-4">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-medium text-[#101828] dark:text-white">
                Xác thực thành công!
              </h2>
              <p className="mt-2 text-sm text-[#475467] dark:text-slate-400 leading-relaxed">
                {message}
              </p>
              <div className="mt-8">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] dark:bg-[#4F62FF] dark:hover:bg-[#3E51E8] text-white text-sm font-medium transition-all"
                >
                  <span>Đăng nhập ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {(status === 'ERROR' || status === 'NO_TOKEN') && (
            <div className="py-2">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-medium text-[#101828] dark:text-white">
                {status === 'NO_TOKEN' ? 'Yêu cầu xác thực email' : 'Không thể xác thực'}
              </h2>
              <p className="mt-2 text-sm text-[#475467] dark:text-slate-400 leading-relaxed">
                {message || 'Vui lòng kiểm tra email của bạn hoặc nhập email bên dưới để nhận liên kết xác thực mới.'}
              </p>

              <form onSubmit={handleResend} className="mt-6 text-left space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#344054] dark:text-slate-300 mb-1">
                    Nhập email nhận lại liên kết
                  </label>
                  <div className="relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="block w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-[#D0D5DD] dark:border-slate-700 rounded-lg text-sm text-[#101828] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2538D9]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resending}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] dark:bg-[#4F62FF] dark:hover:bg-[#3E51E8] text-white text-xs font-semibold cursor-pointer disabled:opacity-60 transition-colors"
                >
                  {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Gửi lại email xác thực</span>
                </button>
              </form>

              {resendResult && (
                <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg text-left">
                  {resendResult}
                </p>
              )}

              <div className="mt-6 pt-4 border-t border-[#EAECF0] dark:border-slate-800">
                <Link
                  href="/login"
                  className="text-xs font-medium text-[#2538D9] dark:text-[#4F62FF] hover:underline"
                >
                  Quay lại trang Đăng nhập
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-[#EAECF0] dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-[#475467] dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Xác thực danh tính an toàn TingRoster</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2538D9]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
