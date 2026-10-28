'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CreditCard,
  Sun,
  Moon
} from 'lucide-react';
import { BankLogo, POPULAR_BANKS } from '@/components/common/BankLogo';
import { useTheme } from '@/components/theme/ThemeContext';

const VIETNAMESE_BANKS = Object.values(POPULAR_BANKS);

export default function RegisterPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [bankId, setBankId] = useState('MB');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          bankId,
          bankAccountNo: bankAccountNo || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Lỗi đăng ký tài khoản');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
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

      <div className="w-full max-w-md space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2538D9] to-[#6D5CE8] flex items-center justify-center mx-auto text-white font-black text-2xl shadow-md shadow-[#2538D9]/25">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.95"/>
                <path d="M2 17L12 22L2 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#101828] dark:text-[#F8FAFC] tracking-tight">
            Tạo tài khoản TingRoster
          </h1>
          <p className="text-xs font-semibold text-[#2538D9] dark:text-indigo-400">
            Điểm danh một chạm • Thu phí VietQR tự động
          </p>
        </div>

        {/* Register Card */}
        <div className="ting-card p-6 sm:p-8 space-y-5 shadow-2xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] rounded-2xl">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                Họ và tên của bạn *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Thầy Nguyễn Văn Minh"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2538D9] focus:ring-2 focus:ring-[#2538D9]/20 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                Email đăng nhập *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2538D9] focus:ring-2 focus:ring-[#2538D9]/20 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                Mật khẩu đăng nhập *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2538D9] focus:ring-2 focus:ring-[#2538D9]/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#101828] dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                  Ngân hàng nhận phí
                </label>
                <select
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] font-bold focus:outline-none focus:border-[#2538D9]"
                >
                  {VIETNAMESE_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                  Số tài khoản (tùy chọn)
                </label>
                <input
                  type="text"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value.trim())}
                  placeholder="0987654321"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] font-mono focus:outline-none focus:border-[#2538D9]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold rounded-xl shadow-md shadow-[#2538D9]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Đang khởi tạo tài khoản...' : 'Hoàn tất đăng ký & Bắt đầu'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#E4E7EC] dark:border-[#1E293B]">
            <p className="text-xs text-[#475467] dark:text-slate-400">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-[#2538D9] dark:text-indigo-400 hover:underline font-bold">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
