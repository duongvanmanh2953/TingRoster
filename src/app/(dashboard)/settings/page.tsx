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
  Settings as SettingsIcon,
  User,
  AlertCircle
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { BankLogo, POPULAR_BANKS } from '@/components/common/BankLogo';
import { LogoCustomizer } from '@/components/common/LogoCustomizer';

const VIETNAMESE_BANKS = Object.values(POPULAR_BANKS);

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bankId, setBankId] = useState('MB');
  const [bankAccountNo, setBankAccountNo] = useState('0987654321');
  const [bankAccountName, setBankAccountName] = useState('NGUYEN VAN MINH');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
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
          setLogoUrl(data.data.logoUrl || null);
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
          logoUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Đã lưu cấu hình tài khoản ngân hàng thành công!');
        setTimeout(() => setMessage(null), 3500);
      } else {
        alert(data.error || 'Lỗi cập nhật cấu hình');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpdated = async (newUrl: string | null) => {
    setLogoUrl(newUrl);
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: newUrl }),
      });
    } catch {
      // quiet update
    }
  };

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/sepay`
    : 'https://tingroster.vn/api/webhooks/sepay';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-24 space-y-3">
        <CircularProgress size={32} sx={{ color: '#2538D9' }} />
        <p className="text-xs text-[#475467] font-medium">Đang tải cấu hình hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
            Cài đặt & Ngân hàng VietQR
          </h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2538D9]/10 text-[#2538D9] border border-[#2538D9]/20 uppercase">
            Hệ thống
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#475467] mt-1">
          Thiết lập tài khoản ngân hàng thụ hưởng nhận học phí và cổng tự động đối soát SePay / Casso
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Bank Configuration Card */}
        <div className="ting-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
            <div className="flex items-center gap-3">
              <BankLogo bankId={bankId} size="lg" />
              <div>
                <h3 className="text-sm font-bold text-[#101828]">
                  Tài khoản Ngân hàng nhận tiền VietQR
                </h3>
                <p className="text-[11px] text-[#475467]">
                  Sinh mã VietQR Napas 24/7 trực tiếp trỏ về tài khoản ngân hàng này
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Chính thức
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            {/* Bank Select */}
            <div>
              <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                Ngân hàng thụ hưởng *
              </label>
              <FormControl size="small" fullWidth>
                <Select
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value)}
                  sx={{
                    borderRadius: '0.75rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    bgcolor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E4E7EC',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2538D9',
                    },
                  }}
                >
                  {VIETNAMESE_BANKS.map((b) => (
                    <MenuItem key={b.code} value={b.code} sx={{ fontSize: '0.8125rem' }}>
                      <div className="flex items-center gap-2">
                        <BankLogo bankId={b.code} size="xs" />
                        <span className="font-semibold text-[#101828]">{b.shortName}</span>
                        <span className="text-slate-400 text-xs">— {b.name}</span>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                Số tài khoản ngân hàng *
              </label>
              <input
                type="text"
                required
                value={bankAccountNo}
                onChange={(e) => setBankAccountNo(e.target.value.trim())}
                placeholder="VD: 0987654321"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E7EC] text-xs tabular-nums font-semibold text-[#101828] focus:outline-none focus:border-[#2538D9] focus:ring-1 focus:ring-[#2538D9]"
              />
            </div>

            {/* Account Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                Tên chủ tài khoản (In hoa không dấu) *
              </label>
              <input
                type="text"
                required
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                placeholder="VD: NGUYEN VAN MINH"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E7EC] text-xs font-semibold text-[#101828] focus:outline-none focus:border-[#2538D9] focus:ring-1 focus:ring-[#2538D9]"
              />
              <p className="text-[11px] text-[#475467] mt-1.5">
                Tên chủ tài khoản phải khớp chính xác với CMND/CCCD mở tài khoản để mã VietQR hiển thị tên chuẩn.
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Brand Logo Customizer */}
        <LogoCustomizer
          currentLogoUrl={logoUrl}
          title="Logo Workspace / Cơ sở đào tạo"
          description="Tùy chỉnh logo thương hiệu hiển thị trên toàn bộ Sidebar, Header, Phiếu thu và Cổng thanh toán phụ huynh. Tự động tương thích với logo nền trong suốt, logo vuông hoặc chữ nhật ngang."
          onLogoUpdated={handleLogoUpdated}
        />

        {/* User Profile Card */}
        <div className="ting-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E4E7EC]">
            <User className="w-4 h-4 text-[#2538D9]" />
            <h3 className="text-sm font-bold text-[#101828]">
              Thông tin Người Quản trị
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#101828] mb-1.5">
                Họ và tên hiển thị
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E7EC] text-xs font-medium text-[#101828] focus:outline-none focus:border-[#2538D9]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101828] mb-1.5">
                Email đăng nhập
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] text-xs font-mono text-[#475467] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Webhook Gateway Card */}
        <div className="ting-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#2538D9]" />
              <h3 className="text-sm font-bold text-[#101828]">
                Cổng đối soát SePay / Casso Webhook
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Tự động Ting!
            </span>
          </div>

          <p className="text-xs text-[#475467]">
            Dán đường dẫn Webhook này vào trang quản trị SePay của bạn để nhận thông báo biến động số dư theo thời gian thực:
          </p>

          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E4E7EC] p-2.5 rounded-xl">
            <span className="text-xs font-mono text-[#2538D9] font-bold flex-1 truncate px-1">
              {webhookUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E4E7EC] hover:bg-slate-50 text-xs font-semibold text-[#101828] transition-colors shadow-xs"
            >
              {copiedWebhook ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              Cơ chế Lũy đẳng (Idempotency) ngăn chặn 100% tình trạng webhook gọi trùng lặp tiền.
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold shadow-md shadow-[#2538D9]/25 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {saving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Đang lưu...' : 'Lưu cấu hình hệ thống'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
