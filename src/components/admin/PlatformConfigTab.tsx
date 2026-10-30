'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  CreditCard,
  Building2,
  Clock,
  Sparkles,
  Server,
  Zap,
  CheckCircle2,
  Save,
  RotateCcw,
  AlertTriangle,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  BellRing
} from 'lucide-react';
import { Button, Switch, TextField, MenuItem, Select, FormControl } from '@mui/material';
import { formatVND, formatCompactVND } from '@/lib/utils';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';

interface PlatformConfigTabProps {
  onSaveSuccess?: (msg: string) => void;
}

export function PlatformConfigTab({ onSaveSuccess }: PlatformConfigTabProps) {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [trialDays, setTrialDays] = useState(30);
  const [trialMaxMembers, setTrialMaxMembers] = useState(50);
  const [autoStartTrial, setAutoStartTrial] = useState(true);
  const [notifyBeforeDays, setNotifyBeforeDays] = useState(5);

  const [feePerReconciliation, setFeePerReconciliation] = useState(500);
  const [starterPrice, setStarterPrice] = useState(99000);
  const [proPrice, setProPrice] = useState(299000);
  const [enterprisePrice, setEnterprisePrice] = useState(699000);

  const [bankName, setBankName] = useState('MB');
  const [bankAccountNo, setBankAccountNo] = useState('0987654321');
  const [bankAccountName, setBankAccountName] = useState('CONG TY TNHH TINGROSTER VIET NAM');
  const [topupSyntax, setTopupSyntax] = useState('TRTOP [MãCơSở]');

  const [webhookTimeout, setWebhookTimeout] = useState(3000);
  const [maxRetries, setMaxRetries] = useState(3);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [rateLimit, setRateLimit] = useState(120);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      if (onSaveSuccess) {
        onSaveSuccess('Đã lưu và áp dụng cấu hình hệ thống & bảng giá mới thành công!');
      }
      setTimeout(() => setSavedSuccess(false), 3500);
    }, 600);
  };

  const handleReset = () => {
    setTrialDays(30);
    setTrialMaxMembers(50);
    setFeePerReconciliation(500);
    setProPrice(299000);
    setMaintenanceMode(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Alert */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>Đã lưu và áp dụng toàn bộ cấu hình hệ thống Platform TingRoster thành công!</span>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Cấu hình Tham số Hệ thống & Bảng giá
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              LIVE CONFIG
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
            Quản trị thời hạn dùng thử 30 ngày, biểu phí duy trì Miền A, STK thu cước và cổng thanh toán ngân hàng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={handleReset}
            disabled={saving}
            startIcon={<RotateCcw size={14} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: '0.5rem',
              color: 'text.secondary',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          >
            Mặc định
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            disabled={saving}
            startIcon={<Save size={14} />}
            sx={{
              bgcolor: '#2538D9',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'none',
              borderRadius: '0.5rem',
              px: 2,
              boxShadow: '0 2px 8px rgba(37, 56, 217, 0.35)',
              '&:hover': { bgcolor: '#1D2DB0' },
            }}
          >
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Section 1: Cấu hình Chính sách Dùng thử */}
        <SpotlightCard spotlightColor="rgba(99, 102, 241, 0.15)" className="p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/10">
            <div className="p-1.5 rounded-lg bg-black-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                1. Chính sách Dùng thử (Free Trial)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Quy định thời gian trải nghiệm cho giáo viên & chủ cơ sở mới
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Số ngày dùng thử miễn phí
                </label>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number(e.target.value))}
                  slotProps={{
                    input: { sx: { borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 700 } },
                  }}
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Tiêu chuẩn: 30 ngày trải nghiệm</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Giới hạn thành viên / phòng
                </label>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  value={trialMaxMembers}
                  onChange={(e) => setTrialMaxMembers(Number(e.target.value))}
                  slotProps={{
                    input: { sx: { borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 700 } },
                  }}
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Tối đa 50 người trong Trial</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Tự động kích hoạt Trial khi đăng ký
                </span>
                <span className="text-[11px] text-slate-500">
                  Cấp ngay 30 ngày đầy đủ tính năng VietQR không cần thẻ
                </span>
              </div>
              <Switch
                checked={autoStartTrial}
                onChange={(e) => setAutoStartTrial(e.target.checked)}
                color="primary"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Cảnh báo hết hạn Trial trước
                </span>
                <span className="text-[11px] text-slate-500">
                  Gửi thông báo Zalo ZNS hướng dẫn nạp ví duy trì
                </span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={notifyBeforeDays}
                  onChange={(e) => setNotifyBeforeDays(Number(e.target.value))}
                  className="w-14 px-2 py-1 text-center rounded border border-slate-300 dark:border-white/20 bg-transparent font-bold text-xs"
                />
                <span className="text-slate-500 text-xs">ngày</span>
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Section 2: Biểu phí Nền tảng (Platform Fees) */}
        <SpotlightCard spotlightColor="rgba(37, 56, 217, 0.15)" className="p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/10">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-[#2538D9] dark:text-indigo-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                2. Biểu phí Nền tảng TingRoster (Miền A)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Phí dịch vụ duy trì đối soát và các gói phần mềm định kỳ
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-200">
                  Phí khớp lệnh VietQR tự động (trừ ví nạp)
                </label>
                <span className="font-bold text-[#2538D9] dark:text-indigo-300">
                  {formatVND(feePerReconciliation)} / giao dịch
                </span>
              </div>
              <TextField
                size="small"
                fullWidth
                type="number"
                value={feePerReconciliation}
                onChange={(e) => setFeePerReconciliation(Number(e.target.value))}
                slotProps={{
                  input: { sx: { borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 700 } },
                }}
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Chỉ trừ phí khi webhook VietQR đối soát gạch nợ thành công
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200">Gói Pro (Tháng)</label>
                  <span className="text-[10px] text-emerald-600 font-bold">{formatCompactVND(proPrice)}</span>
                </div>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  value={proPrice}
                  onChange={(e) => setProPrice(Number(e.target.value))}
                  slotProps={{
                    input: { sx: { borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 700 } },
                  }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200">Gói Chuỗi (Tháng)</label>
                  <span className="text-[10px] text-emerald-600 font-bold">{formatCompactVND(enterprisePrice)}</span>
                </div>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  value={enterprisePrice}
                  onChange={(e) => setEnterprisePrice(Number(e.target.value))}
                  slotProps={{
                    input: { sx: { borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 700 } },
                  }}
                />
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Section 3: Ngân hàng Thu cước TingRoster (Miền A Float) */}
        <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.15)" className="p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/10">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                3. Tài khoản Thu Cước TingRoster (Miền A)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tài khoản nhận tiền nạp ví của chủ cơ sở (Tuyệt đối tách biệt học phí Miền B)
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Ngân hàng thụ hưởng</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0B0F19] text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="MB">MBBank (Ngân hàng Quân Đội)</option>
                  <option value="TCB">Techcombank</option>
                  <option value="VCB">Vietcombank</option>
                  <option value="BIDV">BIDV</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Số tài khoản nhận nạp</label>
                <input
                  type="text"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0B0F19] text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Tên chủ tài khoản</label>
              <input
                type="text"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0B0F19] text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Cú pháp nạp ví chuẩn</label>
              <input
                type="text"
                value={topupSyntax}
                onChange={(e) => setTopupSyntax(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0B0F19] text-xs font-bold text-indigo-600 dark:text-indigo-400"
              />
            </div>
          </div>
        </SpotlightCard>

        {/* Section 4: Cổng Webhook & Vận hành Hạ tầng */}
        <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.15)" className="p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/10">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                4. Cổng Kết nối & Vận hành Hạ tầng
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Cấu hình tham số độ trễ, giới hạn gọi API và bảo trì hệ thống
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Timeout Webhook (ms)</label>
                <input
                  type="number"
                  value={webhookTimeout}
                  onChange={(e) => setWebhookTimeout(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0B0F19] text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Số lần thử lại tối đa</label>
                <input
                  type="number"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0B0F19] text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-600 dark:text-rose-400 block">
                  Chế độ Bảo trì Hệ thống (Maintenance Mode)
                </span>
                <span className="text-[11px] text-slate-500">
                  Tạm ngưng truy cập người dùng để nâng cấp cơ sở dữ liệu
                </span>
              </div>
              <Switch
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                color="error"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Bắt buộc Xác thực 2 bước (2FA) cho Quản trị viên
                </span>
                <span className="text-[11px] text-slate-500">
                  Bảo vệ console SuperAdmin chống truy cập trái phép
                </span>
              </div>
              <Switch
                checked={enforce2FA}
                onChange={(e) => setEnforce2FA(e.target.checked)}
                color="primary"
              />
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
