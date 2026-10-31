'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/components/theme/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUnverified(false);
    setResendSuccess(null);

    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (data.success) {
        const userRole = data.data?.role;
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
          router.push('/admin');
        } else if (userRole === 'MEMBER') {
          router.push('/portal');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Email hoặc mật khẩu không chính xác');
        if (data.isUnverified) {
          setIsUnverified(true);
        }
      }
    } catch {
      setError('Lỗi kết nối máy chủ. Vui lòng kiểm tra đường truyền.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setResending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setResendSuccess(data.data?.message || 'Đã gửi lại email xác thực thành công!');
      } else {
        setError(data.error || 'Không thể gửi lại email.');
      }
    } catch {
      setError('Lỗi kết nối khi gửi lại thư xác thực.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#2538D9] selection:text-white transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block mb-4">
          <Logo href="/" size="lg" theme={isDark ? 'dark' : 'light'} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#101828] dark:text-white">
          Đăng nhập vào TingRoster
        </h2>
        <p className="mt-2 text-sm text-[#475467] dark:text-slate-400">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-medium text-[#2538D9] dark:text-[#4F62FF] hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-[#111726] py-8 px-6 sm:px-10 shadow-sm border border-[#E4E7EC] dark:border-slate-800 rounded-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-sm text-rose-700 dark:text-rose-300">
                <p>{error}</p>
                {isUnverified && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2538D9] dark:text-[#4F62FF] hover:underline cursor-pointer"
                  >
                    {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Gửi lại email xác thực</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">{resendSuccess}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1.5">
                Địa chỉ email
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
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#D0D5DD] dark:border-slate-700 rounded-lg text-sm text-[#101828] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2538D9] dark:focus:ring-[#4F62FF] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#344054] dark:text-slate-300">
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#2538D9] dark:text-[#4F62FF] hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
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
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-[#D0D5DD] dark:border-slate-700 rounded-lg text-sm text-[#101828] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2538D9] dark:focus:ring-[#4F62FF] focus:border-transparent transition-all"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] dark:bg-[#4F62FF] dark:hover:bg-[#3E51E8] text-white text-sm font-medium shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#EAECF0] dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-[#475467] dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Bảo mật session an toàn qua HttpOnly Cookie & Zero-Custody</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
