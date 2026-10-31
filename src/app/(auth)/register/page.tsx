'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Inbox,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/components/theme/ThemeContext';

export default function RegisterPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Mật khẩu phải có tối thiểu 8 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!agreeTerms) {
      setError('Bạn cần đồng ý với Điều khoản sử dụng và Chính sách bảo mật.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          agreeTerms: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRegisteredEmail(email.trim());
      } else {
        setError(data.error || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch {
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResending(true);
    setResendStatus(null);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setResendStatus(data.data?.message || 'Đã gửi lại email xác thực!');
      } else {
        setResendStatus(data.error || 'Không thể gửi lại email.');
      }
    } catch {
      setResendStatus('Lỗi kết nối máy chủ.');
    } finally {
      setResending(false);
    }
  };

  // If registration is complete, show the check-email prompt
  if (registeredEmail) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Logo href="/" size="lg" theme={isDark ? 'dark' : 'light'} />
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white dark:bg-[#111726] py-10 px-6 sm:px-10 border border-[#E4E7EC] dark:border-slate-800 rounded-2xl text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#EEF4FF] dark:bg-blue-950/50 text-[#2538D9] dark:text-[#4F62FF] flex items-center justify-center">
              <Inbox className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-medium text-[#101828] dark:text-white">
              Kiểm tra hộp thư của bạn
            </h2>
            <p className="mt-2 text-sm text-[#475467] dark:text-slate-400">
              Chúng tôi đã gửi một liên kết xác thực tài khoản tới:
            </p>
            <p className="mt-1 font-semibold text-sm text-[#101828] dark:text-slate-200 bg-slate-50 dark:bg-slate-900 py-2 px-3 rounded-lg inline-block">
              {registeredEmail}
            </p>
            <p className="mt-4 text-xs text-[#667085] dark:text-slate-400 leading-relaxed">
              Vui lòng mở email và nhấn vào nút <strong>Xác thực email ngay</strong> để kích hoạt tài khoản của bạn. Liên kết có hiệu lực trong 24 giờ.
            </p>

            {resendStatus && (
              <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg">
                {resendStatus}
              </p>
            )}

            <div className="mt-6 pt-6 border-t border-[#EAECF0] dark:border-slate-800 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-[#101828] dark:text-white transition-colors cursor-pointer disabled:opacity-60"
              >
                {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Chưa nhận được? Gửi lại email</span>
              </button>

              <Link
                href="/login"
                className="text-xs font-medium text-[#2538D9] dark:text-[#4F62FF] hover:underline"
              >
                Quay lại trang Đăng nhập
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
        <div className="inline-block mb-4">
          <Logo href="/" size="lg" theme={isDark ? 'dark' : 'light'} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#101828] dark:text-white">
          Tạo tài khoản TingRoster
        </h2>
        <p className="mt-2 text-sm text-[#475467] dark:text-slate-400">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-medium text-[#2538D9] dark:text-[#4F62FF] hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-[#111726] py-8 px-6 sm:px-10 shadow-sm border border-[#E4E7EC] dark:border-slate-800 rounded-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1.5">
                Họ và tên
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#D0D5DD] dark:border-slate-700 rounded-lg text-sm text-[#101828] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2538D9] dark:focus:ring-[#4F62FF] focus:border-transparent transition-all"
                />
              </div>
            </div>

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
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1.5">
                Mật khẩu (tối thiểu 8 ký tự)
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

            <div>
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1.5">
                Nhập lại mật khẩu
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
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#D0D5DD] dark:border-slate-700 rounded-lg text-sm text-[#101828] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2538D9] dark:focus:ring-[#4F62FF] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2538D9] focus:ring-[#2538D9]"
                />
                <span className="text-xs text-[#475467] dark:text-slate-400 leading-normal">
                  Tôi đồng ý với{' '}
                  <Link href="/terms" target="_blank" className="text-[#2538D9] dark:text-[#4F62FF] hover:underline">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy" target="_blank" className="text-[#2538D9] dark:text-[#4F62FF] hover:underline">
                    Chính sách quyền riêng tư
                  </Link>{' '}
                  của TingRoster.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] dark:bg-[#4F62FF] dark:hover:bg-[#3E51E8] text-white text-sm font-medium shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang khởi tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Tạo tài khoản miễn phí</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#EAECF0] dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-[#475467] dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Xác thực email 2 lớp & Bảo mật tài khoản Zero-Custody</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
