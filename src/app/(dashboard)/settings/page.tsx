'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Save,
  RefreshCw,
} from 'lucide-react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { BankLogo, POPULAR_BANKS } from '@/components/common/BankLogo';

const VIETNAMESE_BANKS = Object.values(POPULAR_BANKS);

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bankId, setBankId] = useState('MB');
  const [bankAccountNo, setBankAccountNo] = useState('0987654321');
  const [bankAccountName, setBankAccountName] = useState('NGUYEN VAN A');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setName(data.data.name || '');
          setEmail(data.data.email || '');
          setBankId(data.data.bankId || 'MB');
          setBankAccountNo(data.data.bankAccountNo || '');
          setBankAccountName(data.data.bankAccountName || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bankId,
          bankAccountNo,
          bankAccountName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Đã lưu cấu hình tài khoản ngân hàng thành công!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(data.error || 'Lỗi cập nhật cấu hình');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/sepay` : 'https://tingroster.vn/api/webhooks/sepay';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-24 space-y-3">
        <CircularProgress color="success" size={32} />
        <p className="text-xs text-slate-400">Đang tải cấu hình hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Cài đặt & Ngân hàng VietQR
          </h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase">
            Hệ thống
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Thiết lập tài khoản ngân hàng thụ hưởng nhận học phí và cổng tự động đối soát SePay / Casso
        </p>
      </div>

      {message && (
        <Alert severity="success" className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          {message}
        </Alert>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Bank Configuration Card */}
        <Card className="bg-[#0F1626] border border-[#1E283D] rounded-2xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E283D]">
              <div className="flex items-center gap-3">
                <BankLogo bankId={bankId} size="lg" />
                <div>
                  <Typography variant="h6" className="text-sm font-bold text-white">
                    Tài khoản Ngân hàng nhận tiền VietQR
                  </Typography>
                  <Typography variant="body2" className="text-[11px] text-slate-400">
                    Sinh mã VietQR Napas 24/7 trực tiếp trỏ về tài khoản ngân hàng này
                  </Typography>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                Chính thức
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <FormControl fullWidth size="small">
                <InputLabel id="bank-select-label" className="text-slate-400">Ngân hàng thụ hưởng *</InputLabel>
                <Select
                  labelId="bank-select-label"
                  value={bankId}
                  label="Ngân hàng thụ hưởng *"
                  onChange={(e) => setBankId(e.target.value)}
                  className="bg-[#111726] text-white"
                >
                  {VIETNAMESE_BANKS.map((b) => (
                    <MenuItem key={b.code} value={b.code} className="bg-[#0F1626] text-white hover:bg-[#1E283D]">
                      <div className="flex items-center gap-2.5 py-1">
                        <BankLogo bankId={b.code} size="xs" />
                        <span className="font-bold text-xs">{b.shortName}</span>
                        <span className="text-[11px] text-slate-400">({b.name})</span>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                label="Số tài khoản ngân hàng *"
                value={bankAccountNo}
                onChange={(e) => setBankAccountNo(e.target.value)}
                placeholder="VD: 0987654321"
                slotProps={{
                  input: {
                    className: 'bg-[#111726] text-white font-mono',
                  },
                }}
              />

              <div className="sm:col-span-2">
                <TextField
                  fullWidth
                  size="small"
                  label="Tên chủ tài khoản (In hoa không dấu) *"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                  placeholder="VD: NGUYEN VAN A"
                  helperText="Tên chủ tài khoản phải khớp chính xác với CMND/CCCD mở tài khoản để mã VietQR hiển thị tên chuẩn."
                  slotProps={{
                    input: {
                      className: 'bg-[#111726] text-white font-mono font-bold',
                    },
                    formHelperText: {
                      className: 'text-slate-400 text-[11px]',
                    },
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Profile Card */}
        <Card className="bg-[#0F1626] border border-[#1E283D] rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <Typography variant="h6" className="text-sm font-bold text-white pb-3 border-b border-[#1E283D]">
              Thông tin Người Quản trị
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                fullWidth
                size="small"
                label="Họ và tên hiển thị"
                value={name}
                onChange={(e) => setName(e.target.value)}
                slotProps={{
                  input: {
                    className: 'bg-[#111726] text-white',
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                label="Email đăng nhập"
                disabled
                value={email}
                slotProps={{
                  input: {
                    className: 'bg-[#0B0F19] text-slate-400',
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Webhook Gateway Card */}
        <Card className="bg-[#0F1626] border border-[#1E283D] rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E283D]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <Typography variant="h6" className="text-sm font-bold text-white">
                  Cổng đối soát SePay / Casso Webhook
                </Typography>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                Tự động Ting!
              </span>
            </div>

            <Typography variant="body2" className="text-xs text-slate-400">
              Dán đường dẫn Webhook này vào trang quản trị SePay của bạn để nhận thông báo biến động số dư theo thời gian thực:
            </Typography>

            <div className="flex items-center gap-2 bg-[#111726] border border-[#1E283D] p-2.5 rounded-xl">
              <span className="text-xs font-mono text-emerald-400 flex-1 truncate">{webhookUrl}</span>
              <Button
                variant="outlined"
                size="small"
                color="primary"
                onClick={handleCopyWebhook}
                startIcon={copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedWebhook ? 'Đã sao chép' : 'Sao chép'}
              </Button>
            </div>

            <div className="p-3 bg-[#111726] rounded-xl border border-[#1E283D] text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cơ chế Lũy đẳng (Idempotency) ngăn chặn 100% tình trạng webhook gọi trùng lặp tiền.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save className="w-4 h-4" />}
            size="large"
          >
            {saving ? 'Đang lưu...' : 'Lưu cấu hình hệ thống'}
          </Button>
        </Box>

      </form>
    </div>
  );
}
