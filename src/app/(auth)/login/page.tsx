'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  CalendarCheck, 
  QrCode, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/components/theme/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [emailOrPhone, setEmailOrPhone] = useState('demo@tingroster.vn');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrPhone, password }),
      });
      const data = await res.json();
      if (data.success) {
        if (emailOrPhone.includes('hocvien')) {
          router.push('/portal');
        } else if (emailOrPhone.includes('admin')) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Email/Số điện thoại hoặc mật khẩu không chính xác');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogin = async (email = 'demo@tingroster.vn', pass = '123456') => {
    setError(null);
    setLoading(true);
    setEmailOrPhone(email);
    setPassword(pass);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success) {
        if (email.includes('hocvien')) {
          router.push('/portal');
        } else if (email.includes('admin')) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Đăng nhập không thành công');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoAccount: string) => {
    handleDirectLogin(demoAccount, '123456');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] text-[#101828] dark:text-[#F8FAFC] flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-[#2538D9] selection:text-white relative">
      
      {/* Quick Theme Switcher Floating Top-Right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          className="w-9 h-9 rounded-xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] shadow-sm text-slate-600 dark:text-slate-300 hover:text-[#2538D9] dark:hover:text-amber-400 flex items-center justify-center transition-all"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Container card matching Modern SaaS UX */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#111726] rounded-3xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Brand Panel: Dark Navy */}
        <div className="lg:col-span-5 bg-[#0B0F19] text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle glowing ambient circles */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#2538D9]/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#6D5CE8]/20 blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10">
            <Logo href="/" theme="dark" size="md" showTagline={false} />
          </div>

          {/* Middle text & 4 bullets */}
          <div className="relative z-10 my-8 space-y-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Quản lý thông minh <br />
                <span className="text-indigo-400">Kết nối bền vững</span>
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Giải pháp toàn diện cho giáo viên dạy thêm, CLB thể thao và chủ nhà trọ.
              </p>
            </div>

            {/* 4 Core Value Bullets */}
            <div className="space-y-3.5 pt-2">
              {[
                { num: '1', title: 'Tiết kiệm thời gian', desc: 'Điểm danh 1 chạm, gạch nợ tức thì' },
                { num: '2', title: 'Tăng tỷ lệ thu phí', desc: 'Nhắc phí tự động kèm VietQR Napas 24/7' },
                { num: '3', title: 'Giảm sai sót, nhầm lẫn', desc: 'Đối soát chuẩn xác qua webhook ngân hàng' },
                { num: '4', title: 'Bảo mật tuyệt đối', desc: 'Tiền chuyển khoản vào thẳng tài khoản bạn' },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#2538D9]/40 border border-[#2538D9] flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                    {item.num}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom badge */}
          <div className="relative z-10 text-[11px] text-slate-400 border-t border-slate-800 pt-4 flex items-center justify-between">
            <span>TingRoster v2.0</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sẵn sàng kết nối
            </span>
          </div>

        </div>

        {/* Right Form Panel: Responsive Light/Dark */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between">
          
          <div className="max-w-md mx-auto w-full space-y-6">
            
            {/* Header */}
            <div>
              <h3 className="text-2xl font-black text-[#101828] dark:text-[#F8FAFC] tracking-tight">
                Chào mừng bạn quay lại!
              </h3>
              <p className="text-xs text-[#475467] dark:text-slate-400 mt-1">
                Đăng nhập để tiếp tục quản lý công việc và đối soát tài chính.
              </p>
            </div>

            {/* 1-Click Fast Demo Banner */}
            <div className="p-3.5 rounded-2xl bg-[#F9FAFB] dark:bg-[#111827] border border-[#E5E7EB] dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
              <div className="text-left min-w-0">
                <span className="text-xs font-bold text-[#2538D9] dark:text-indigo-400 block flex items-center gap-1.5 truncate">
                  <Zap className="w-3.5 h-3.5 fill-current flex-shrink-0" />
                  Trải nghiệm nhanh không cần mật khẩu
                </span>
                <span className="text-[11px] text-[#475467] dark:text-slate-400">Vào ngay tài khoản Giáo viên mẫu</span>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDirectLogin('demo@tingroster.vn', '123456')}
                className="px-3.5 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#2538D9]/20 transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Vào Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email / Phone Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#101828] dark:text-[#F8FAFC] block">
                  Email hoặc số điện thoại
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Nhập email hoặc số điện thoại"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2538D9] focus:ring-2 focus:ring-[#2538D9]/20 transition-all bg-[#F8FAFC] dark:bg-[#0F172A]"
                  />
                </div>
              </div>

              {/* Password Field with "Quên mật khẩu?" */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#101828] dark:text-[#F8FAFC]">
                    Mật khẩu
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => { e.preventDefault(); alert('Vui lòng sử dụng tài khoản mẫu với mật khẩu mặc định 123456'); }}
                    className="text-xs font-semibold text-[#2538D9] dark:text-indigo-400 hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2538D9] focus:ring-2 focus:ring-[#2538D9]/20 transition-all bg-[#F8FAFC] dark:bg-[#0F172A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#2538D9]/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Đang đăng nhập...</span>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>
            </form>

            {/* Social Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E4E7EC] dark:border-[#1E293B]" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white dark:bg-[#111726] px-3 text-[#667085] dark:text-slate-400 font-semibold">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>

            {/* Google & Apple Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('demo@tingroster.vn')}
                className="py-2.5 px-4 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#344054] dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('demo@tingroster.vn')}
                className="py-2.5 px-4 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#344054] dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 1.01-2.84-.95.04-2.09.64-2.73 1.39-.57.65-1.07 1.7-1.03 2.72 1.05.08 2.13-.52 2.75-1.27z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1.5 text-[11px]">
              <span className="font-bold text-[#2538D9] dark:text-indigo-400 block">Đăng nhập nhanh dữ liệu mẫu:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('demo@tingroster.vn')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F172A] border border-indigo-200 dark:border-indigo-800 font-semibold text-[#2538D9] dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40"
                >
                  Chủ nhóm / Giáo viên (demo@tingroster.vn)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('hocvien@tingroster.vn')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                >
                  Học viên / Thành viên (hocvien@tingroster.vn)
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-[#475467] dark:text-slate-400">
              <span>Chưa có tài khoản? </span>
              <Link href="/onboarding" className="font-bold text-[#2538D9] dark:text-indigo-400 hover:underline">
                Đăng ký ngay
              </Link>
            </div>

          </div>

          <div className="text-center text-[11px] text-[#98A2B3] dark:text-slate-500 pt-4">
            Bằng việc đăng nhập, bạn đồng ý với Điều khoản & Chính sách bảo mật của TingRoster.
          </div>

        </div>

      </div>

    </div>
  );
}
