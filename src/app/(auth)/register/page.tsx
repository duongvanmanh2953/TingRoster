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
  EyeOff
} from 'lucide-react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { BankLogo, POPULAR_BANKS } from '@/components/common/BankLogo';

const VIETNAMESE_BANKS = Object.values(POPULAR_BANKS);

export default function RegisterPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex items-center justify-center p-4 lg:p-8 relative selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 font-black text-2xl shadow-lg shadow-emerald-500/10">
            ⚡
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Tạo tài khoản TingRoster
          </h1>
          <p className="text-xs text-emerald-400">
            Điểm danh một chạm • Thu phí VietQR tự động
          </p>
        </div>

        {/* Register Card */}
        <div className="ting-card p-6 sm:p-8 space-y-5 shadow-2xl">
          {error && (
            <Alert severity="error" className="bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              size="small"
              label="Họ và tên của bạn *"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Mai Hương"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <User className="w-4 h-4 text-slate-400" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Địa chỉ Email *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="huong.mai@tingroster.vn"
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

            {/* Optional Bank account for VietQR integration with Bank Logo */}
            <div className="pt-2 border-t border-[#1E283D] space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Tài khoản nhận tiền VietQR (Tùy chọn)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="reg-bank-label">Ngân hàng</InputLabel>
                  <Select
                    labelId="reg-bank-label"
                    value={bankId}
                    label="Ngân hàng"
                    onChange={(e) => setBankId(e.target.value)}
                    className="bg-[#111726] text-white"
                  >
                    {VIETNAMESE_BANKS.map((b) => (
                      <MenuItem key={b.code} value={b.code} className="bg-[#0F1626] text-white hover:bg-[#1E283D]">
                        <div className="flex items-center gap-2">
                          <BankLogo bankId={b.code} size="xs" />
                          <span className="font-bold text-xs">{b.shortName}</span>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  label="Số tài khoản"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  placeholder="0987654321"
                  slotProps={{
                    input: {
                      className: 'font-mono',
                    },
                  }}
                />
              </div>
            </div>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowRight className="w-4 h-4" />}
              className="py-3 mt-3"
            >
              {loading ? 'Đang khởi tạo...' : 'Tạo tài khoản & Bắt đầu ngay'}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
