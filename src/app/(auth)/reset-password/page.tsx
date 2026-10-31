'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/components/theme/ThemeContext';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Mã token đặt lại mật khẩu không tồn tại.');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Đặt lại mật khẩu không thành công.');
      }
    } catch {
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Logo href="/" size="lg" theme={isDark ? 'dark' : 'light'} />
          <div className="mt-8 bg-white dark:bg-[#111726] p-8 border border-[#E4E7EC] dark:border-slate-800 rounded-2xl shadow-sm">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-[#101828] dark:text-white">Thiếu mã xác thực</h3>
            <p className="mt-2 text-sm text-[#475467] dark:text-slate-400">
              Đường dẫn đặt lại mật khẩu không hợp lệ hoặc thiếu mã token. Vui lòng kiểm tra lại liên kết trong email của bạn.
            </p>
            <div className="mt-6">
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-[#2538D9] dark:text-[#4F62FF] hover:underline"
              >
                Gửi lại yêu cầu đặt lại mật khẩu
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors selection:bg-[#2538D9] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo href="/" size="lg" theme={isDark ? 'dark' : 'light'} />
        <h2 className="mt-4 text-2xl font-medium tracking-tight text-[#101828] dark:text-white">
          Tạo mật khẩu mới
        </h2>
        <p className="mt-2 text-sm text-[#475467] dark:text-slate-400">
          Nhập mật khẩu mới an toàn cho tài khoản của bạn
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

          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-[#101828] dark:text-white">
                Đổi mật khẩu thành công!
              </h3>
              <p className="mt-2 text-sm text-[#475467] dark:text-slate-400 leading-relaxed">
                Mật khẩu mới đã được cập nhật an toàn. Bạn có thể sử dụng mật khẩu này để đăng nhập ngay bây giờ.
              </p>
              <div className="mt-6 pt-6 border-t border-[#EAECF0] dark:border-slate-800">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] dark:bg-[#4F62FF] dark:hover:bg-[#3E51E8] text-white text-sm font-medium transition-all"
                >
                  <span>Đăng nhập ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1.5">
                  Mật khẩu mới (tối thiểu 8 ký tự)
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-[#D0D5DD] dark:border-slate-700 rounded-lg text-sm text-[#101828] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2538D9] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1.5">
                  Xác nhận lại mật khẩu
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#D0D5DD] dark:border-slate-700 rounded-lg text-sm text-[#101828] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2538D9] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] dark:bg-[#4F62FF] dark:hover:bg-[#3E51E8] text-white text-sm font-medium shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang cập nhật mật khẩu...</span>
                  </>
                ) : (
                  <>
                    <span>Cập nhật mật khẩu mới</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#EAECF0] dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-[#475467] dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mã hóa bảo mật mật khẩu cấp độ cao</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2538D9]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
