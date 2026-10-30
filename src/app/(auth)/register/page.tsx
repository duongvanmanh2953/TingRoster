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
  Moon,
  Sparkles,
  GraduationCap,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Phone
} from 'lucide-react';
import { BankLogo, POPULAR_BANKS } from '@/components/common/BankLogo';
import { useTheme } from '@/components/theme/ThemeContext';

const VIETNAMESE_BANKS = Object.values(POPULAR_BANKS);

type RegisterMode = 'OWNER' | 'STUDENT';

export default function RegisterPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  // Mode selection: Owner / Teacher vs Student
  const [mode, setMode] = useState<RegisterMode>('OWNER');

  // Owner Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [bankId, setBankId] = useState('MB');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  // Student Activation State
  const [studentCode, setStudentCode] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentPasswordConfirm, setStudentPasswordConfirm] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle Owner Registration
  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          bankId,
          bankAccountNo: bankAccountNo.trim() || undefined,
          bankAccountName: bankAccountName.trim() || name.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Lỗi đăng ký tài khoản quản lý');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  // Handle Student Activation
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!studentCode.trim()) {
      setError('Vui lòng nhập mã học viên hoặc số điện thoại được cấp');
      return;
    }

    if (studentPassword.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự');
      return;
    }

    if (studentPassword !== studentPasswordConfirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: studentCode.trim(),
          password: studentPassword,
          email: studentEmail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message || 'Kích hoạt thành công! Đang chuyển đến Cổng Học Viên...');
        setTimeout(() => {
          router.push('/portal');
        }, 1200);
      } else {
        setError(data.error || 'Mã kích hoạt không hợp lệ');
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
          className="w-9 h-9 rounded-xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] shadow-sm text-slate-600 dark:text-slate-300 hover:text-[#2538D9] dark:hover:text-amber-400 flex items-center justify-center transition-all cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-lg space-y-6">
        
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
          <h1 className="text-2xl font-black text-[#101828] dark:text-[#F8FAFC] tracking-tight">
            {mode === 'OWNER' ? 'Tạo tài khoản quản lý TingRoster' : 'Kích hoạt tài khoản học viên'}
          </h1>
          <p className="text-xs font-semibold text-[#2538D9] dark:text-indigo-400">
            Nền tảng quản lý đa không gian • Điểm danh & Thu phí tự động
          </p>
        </div>

        {/* 2-Mode Selector Tab (Section 4.2 of Architecture) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#E4E7EC]/80 dark:bg-[#1E293B] rounded-2xl">
          <button
            type="button"
            onClick={() => { setMode('OWNER'); setError(null); }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'OWNER'
                ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Tôi quản lý / Giáo viên</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('STUDENT'); setError(null); }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'STUDENT'
                ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Tôi là học viên / Thành viên</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="p-6 sm:p-8 space-y-5 shadow-2xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] rounded-2xl">
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE 1: OWNER / TEACHER ONBOARDING */}
          {mode === 'OWNER' && (
            <>
              {/* 30-Day Pro Trial Entitlement Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-800/60 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#2538D9] dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-[#2538D9] dark:text-indigo-300">Dùng thử Pro 30 ngày đầy đủ tính năng:</span>
                  {' '}Tự động đối soát VietQR, quản lý nhiều không gian, AI trích xuất danh sách và Kiosk check-in độc lập.
                </div>
              </div>

              <form onSubmit={handleOwnerSubmit} className="space-y-4 text-xs">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#2538D9] focus:ring-2 focus:ring-[#2538D9]/20 transition-all font-medium"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#2538D9] focus:ring-2 focus:ring-[#2538D9]/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                    Mật khẩu quản lý *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#2538D9] focus:ring-2 focus:ring-[#2538D9]/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#101828] dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                      Ngân hàng nhận phí VietQR
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
                  className="w-full py-3 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold rounded-xl shadow-md shadow-[#2538D9]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50 mt-2 cursor-pointer"
                >
                  <span>{loading ? 'Đang khởi tạo tài khoản...' : 'Hoàn tất & Bắt đầu dùng thử Pro'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* MODE 2: STUDENT / MEMBER ACTIVATION */}
          {mode === 'STUDENT' && (
            <>
              {/* Guidance Notice */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  <span className="font-bold">Dành cho học viên / thành viên:</span>
                  {' '}Hồ sơ của bạn đã được giáo viên hoặc chủ cơ sở tạo sẵn. Vui lòng nhập mã học viên hoặc số điện thoại để kích hoạt mật khẩu cá nhân.
                </div>
              </div>

              <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                    Mã kích hoạt hoặc Mã học viên / Số điện thoại *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value)}
                      placeholder="VD: TR-MEMBER-clx... hoặc 0912345678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 font-mono focus:outline-none focus:border-[#2538D9] focus:ring-2 focus:ring-[#2538D9]/20 transition-all font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Nhập mã được in trên phiếu học phí, tin nhắn mời, hoặc số điện thoại đăng ký tại lớp.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                    Email của bạn (tùy chọn)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="hocsinh@gmail.com (dùng nhận thông báo)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#2538D9] focus:ring-2 focus:ring-[#2538D9]/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                    Đặt mật khẩu cá nhân *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showStudentPassword ? 'text' : 'password'}
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#2538D9] focus:ring-2 focus:ring-[#2538D9]/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPassword(!showStudentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#101828] dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                    Xác nhận lại mật khẩu *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showStudentPassword ? 'text' : 'password'}
                      required
                      value={studentPasswordConfirm}
                      onChange={(e) => setStudentPasswordConfirm(e.target.value)}
                      placeholder="Nhập lại mật khẩu phía trên"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#2538D9] focus:ring-2 focus:ring-[#2538D9]/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold rounded-xl shadow-md shadow-[#2538D9]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50 mt-2 cursor-pointer"
                >
                  <span>{loading ? 'Đang kích hoạt...' : 'Kích hoạt & Vào Cổng Học Viên'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* No invitation code helper */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Chưa nhận được mã học viên?</p>
                <p>
                  Vui lòng liên hệ trực tiếp giáo viên hoặc ban quản lý lớp học/CLB để được cấp thông tin hoặc lời mời tham gia.
                </p>
              </div>
            </>
          )}

          {/* Footer link to Login */}
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
