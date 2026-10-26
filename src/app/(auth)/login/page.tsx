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
  EyeOff
} from 'lucide-react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import { BankLogo } from '@/components/common/BankLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@tingroster.vn');
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
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Email hoặc mật khẩu không chính xác');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex items-center justify-center p-4 lg:p-8 relative selection:bg-emerald-500 selection:text-white">
      
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center relative z-10">
        
        {/* Left Side: Brand presentation */}
        <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-4">
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-lg shadow-emerald-500/10">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight text-white">
                    TingRoster
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase">
                    VietQR 2.0
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                  Điểm danh một chạm • Thu phí tự động • Đối soát khỏi lo
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Nền tảng quản lý chuyên cần và tự động khớp lệnh học phí qua VietQR hàng đầu cho giáo viên dạy thêm, trung tâm đào tạo, CLB thể thao (Pickleball, Cầu lông) và căn hộ cho thuê.
            </p>
          </div>

          {/* Interactive Live VietQR Simulation Mockup with Official Bank Logo */}
          <div className="ting-card p-4.5 space-y-3 max-w-lg border-emerald-500/25 bg-[#0D1424]">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1E283D]">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <BankLogo bankId="MB" size="xs" />
                <span>Biến động số dư MB Bank (Ting!)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Vừa xong</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Số tiền thực nhận</span>
                <div className="text-xl font-mono font-bold text-emerald-400">
                  +1.200.000 ₫
                </div>
              </div>
              <div className="text-right space-y-0.5">
                <Chip
                  label="Đã khớp tự động"
                  color="success"
                  size="small"
                  className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-bold text-[11px]"
                />
                <p className="text-[11px] font-mono text-slate-300 font-medium">Mã: TR84920</p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#111828] border border-[#1E283D] text-[11px] text-slate-300">
              <strong className="text-slate-400 font-normal">Nội dung CK:</strong> NGUYEN HOANG NAM chuyen hoc phi TR84920
            </div>

            {/* Supported Banks Row */}
            <div className="pt-2 border-t border-[#1E283D] flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hỗ trợ đối soát trực tiếp:</span>
              <div className="flex items-center gap-1.5">
                {['MB', 'VCB', 'TCB', 'ACB', 'BIDV', 'ICB'].map((code) => (
                  <BankLogo key={code} bankId={code} size="xs" />
                ))}
              </div>
            </div>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
            <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E283D]">
              <CalendarCheck className="w-4 h-4 text-emerald-400 mb-1.5" />
              <h4 className="text-xs font-bold text-white">Điểm danh 1 chạm</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Tính buổi học & chuyên cần tức thì</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E283D]">
              <QrCode className="w-4 h-4 text-indigo-400 mb-1.5" />
              <h4 className="text-xs font-bold text-white">Mã VietQR động</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Phụ huynh quét mã, không gõ nhầm tiền</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E283D]">
              <ShieldCheck className="w-4 h-4 text-purple-400 mb-1.5" />
              <h4 className="text-xs font-bold text-white">Đối soát 0 giây</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Chống trùng lặp giao dịch 100%</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card with Material UI */}
        <div className="lg:col-span-5">
          <div className="ting-card p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Đăng nhập tài khoản</h2>
              <p className="text-xs text-slate-400">Truy cập bảng điều hành quản lý TingRoster</p>
            </div>

            {/* Quick Demo Login Preset Buttons */}
            <div className="p-3 rounded-xl bg-[#111726] border border-[#1E283D] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-300">Dùng thử nhanh tài khoản mẫu:</span>
                <span className="text-emerald-400 font-bold">Mật khẩu: 123456</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('demo@tingroster.vn')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                    email === 'demo@tingroster.vn'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#161F33] text-slate-300 border-[#222E47] hover:bg-[#1E2B47]'
                  }`}
                >
                  Giáo viên dạy thêm
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@tingroster.vn')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                    email === 'admin@tingroster.vn'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#161F33] text-slate-300 border-[#222E47] hover:bg-[#1E2B47]'
                  }`}
                >
                  Chủ CLB thể thao
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert severity="error" className="bg-rose-500/10 border border-rose-500/30 text-rose-300">
                {error}
              </Alert>
            )}

            {/* Login Form with Material UI TextFields & Button */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                size="small"
                label="Email đăng nhập *"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@tingroster.vn"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail className="w-4 h-4 text-slate-400" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                label="Mật khẩu *"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <div className="flex justify-end">
                <a href="#" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                  Quên mật khẩu?
                </a>
              </div>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowRight className="w-4 h-4" />}
                className="py-3 mt-2"
              >
                {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
              </Button>
            </form>

            <div className="pt-2 text-center border-t border-[#1E283D]">
              <p className="text-xs text-slate-400">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">
                  Đăng ký miễn phí
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
