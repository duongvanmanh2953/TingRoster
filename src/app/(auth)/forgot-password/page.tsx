'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/components/theme/ThemeContext';

export default function ForgotPasswordPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Không thể gửi yêu cầu đặt lại mật khẩu.');
      }
    } catch {
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors selection:bg-[#2538D9] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo href="/" size="lg" theme={isDark ? 'dark' : 'light'} />
        <h2 className="mt-4 text-2xl font-medium tracking-tight text-[#101828] dark:text-white">
          Khôi phục mật khẩu
        </h2>
        <p className="mt-2 text-sm text-[#475467] dark:text-slate-400">
          Nhập email đăng ký tài khoản TingRoster của bạn
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-[#111726] py-8 px-6 sm:px-10 border border-[#E4E7EC] dark:border-slate-800 rounded-2xl shadow-sm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
            </div>
          )}

          {submitted ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-[#101828] dark:text-white">
                Kiểm tra email của bạn
              </h3>
              <p className="mt-2 text-sm text-[#475467] dark:text-slate-400 leading-relaxed">
                Nếu tài khoản <strong>{email}</strong> tồn tại trên hệ thống, chúng tôi đã gửi đường dẫn đặt lại mật khẩu đến hộp thư của bạn.
              </p>
              <p className="mt-3 text-xs text-[#667085] dark:text-slate-500">
                Liên kết có hiệu lực trong vòng 60 phút.
              </p>
              <div className="mt-6 pt-6 border-t border-[#EAECF0] dark:border-slate-800">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#2538D9] dark:text-[#4F62FF] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại trang Đăng nhập</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1.5">
                  Địa chỉ email tài khoản
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#D0D5DD] dark:border-slate-700 rounded-lg text-sm text-[#101828] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2538D9] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] dark:bg-[#4F62FF] dark:hover:bg-[#3E51E8] text-white text-sm font-medium shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi yêu cầu...</span>
                  </>
                ) : (
                  <>
                    <span>Gửi liên kết đặt lại mật khẩu</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#475467] dark:text-slate-400 hover:text-[#2538D9] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại Đăng nhập</span>
                </Link>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#EAECF0] dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-[#475467] dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mã bảo mật đặt lại 1 lần duy nhất</span>
          </div>
        </div>
      </div>
    </div>
  );
}
