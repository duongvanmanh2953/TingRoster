'use client';

import React, { useState } from 'react';
import {
  Upload,
  Trash2,
  Palette,
  Users2,
  CalendarCheck,
  Receipt,
  ArrowRightLeft,
  BarChart3,
  Bell,
  FileText,
  Workflow,
  Layers,
  Sparkles,
  Check,
  ShieldCheck,
  Globe,
  ExternalLink,
  Copy,
  AlertTriangle,
  Save
} from 'lucide-react';
import Switch from '@mui/material/Switch';
import { SPACE_MODULES, SPACE_PALETTES, parseEnabledModules } from '@/lib/spaces/constants';
import { SpaceAvatar } from '@/components/common/SpaceAvatar';
import { formatVND } from '@/lib/utils';

export interface SpaceSettingsFormProps {
  space: {
    id: string;
    name: string;
    slug: string;
    code?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    themeColor?: string | null;
    enabledModules?: string | null;
    groupType?: string | null;
    defaultFee?: number;
    billingCycle?: string;
    publicPortalEnabled?: boolean;
    isActive?: boolean;
  };
  onSuccess?: (updated: any) => void;
  onCancel?: () => void;
  isPageLayout?: boolean;
}

export function SpaceSettingsForm({
  space,
  onSuccess,
  onCancel,
  isPageLayout = false,
}: SpaceSettingsFormProps) {
  const [activeTab, setActiveTab] = useState<'INFO' | 'COLOR' | 'MODULES' | 'PERMISSIONS'>('INFO');

  const [name, setName] = useState(space.name || '');
  const [description, setDescription] = useState(space.description || '');
  const [logoUrl, setLogoUrl] = useState<string | null>(space.logoUrl || null);
  const [themeColor, setThemeColor] = useState(space.themeColor || '#2538D9');
  const [groupType, setGroupType] = useState(space.groupType || 'GENERAL');
  const [defaultFee, setDefaultFee] = useState<number>(space.defaultFee || 0);
  const [billingCycle, setBillingCycle] = useState<string>(space.billingCycle || 'MONTHLY');
  const [publicPortalEnabled, setPublicPortalEnabled] = useState<boolean>(
    space.publicPortalEnabled ?? true
  );
  const [enabledModules, setEnabledModules] = useState<string[]>(
    parseEnabledModules(space.enabledModules)
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const spaceCode = space.code || `TR-${space.slug.toUpperCase().slice(0, 4)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(spaceCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('Kích thước ảnh tối đa 3MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'group_logo');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi tải ảnh lên');
      }

      setLogoUrl(data.data.url);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải ảnh logo');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setEnabledModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên không gian');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/groups/${space.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          logoUrl,
          themeColor,
          groupType,
          defaultFee: Number(defaultFee) || 0,
          billingCycle,
          publicPortalEnabled,
          enabledModules,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi cập nhật');
      }

      setSuccessMsg('Đã lưu thông tin không gian thành công!');
      if (onSuccess) {
        onSuccess(data.data);
      }
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderModuleIcon = (id: string) => {
    switch (id) {
      case 'members':
        return <Users2 className="w-5 h-5" />;
      case 'attendance':
        return <CalendarCheck className="w-5 h-5" />;
      case 'invoices':
        return <Receipt className="w-5 h-5" />;
      case 'reconciliation':
        return <ArrowRightLeft className="w-5 h-5" />;
      case 'reports':
        return <BarChart3 className="w-5 h-5" />;
      case 'notifications':
        return <Bell className="w-5 h-5" />;
      case 'documents':
        return <FileText className="w-5 h-5" />;
      case 'automations':
        return <Workflow className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab Switcher if in modal or compact layout */}
      {!isPageLayout && (
        <div className="flex items-center px-6 border-b border-slate-100 dark:border-slate-800 gap-4 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('INFO')}
            className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'INFO'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Thông tin không gian
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COLOR')}
            className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'COLOR'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Màu nhận diện
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MODULES')}
            className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'MODULES'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Tính năng sử dụng ({enabledModules.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PERMISSIONS')}
            className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'PERMISSIONS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Quyền truy cập & Cổng Portal
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SECTION 1: THÔNG TIN KHÔNG GIAN */}
      {(isPageLayout || activeTab === 'INFO') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Thông tin không gian
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tên gọi, mô tả đại diện và ảnh biểu trưng cho không gian hoạt động này.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <SpaceAvatar
              name={name || 'Không gian'}
              logoUrl={logoUrl}
              themeColor={themeColor}
              enabledModules={enabledModules.join(',')}
              groupType={groupType}
              size="lg"
            />

            <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Ảnh đại diện & Logo
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 transition-colors"
                  title="Mã định danh không gian"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{spaceCode}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Khuyến nghị ảnh hình vuông (1:1), định dạng PNG, JPG hoặc SVG, tối đa 3MB.
              </p>

              <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
                <label className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isUploading ? 'Đang tải...' : 'Tải ảnh mới'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl(null)}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Gỡ logo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tên không gian *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Lớp Toán Nâng Cao 9A, CLB Cầu Lông..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Loại hình không gian
              </label>
              <select
                value={groupType}
                onChange={(e) => setGroupType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
              >
                <option value="GENERAL">Đa năng / Chung</option>
                <option value="CLASS">Lớp học / Trung tâm</option>
                <option value="SPORTS_CLUB">CLB Thể thao (Pickleball, Cầu lông...)</option>
                <option value="RENTAL">Phòng trọ / Căn hộ dịch vụ</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Mô tả ngắn
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu mục tiêu, thời gian hoạt động hoặc lưu ý cho thành viên..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
            />
          </div>
        </div>
      )}

      {/* SECTION 2: MÀU NHẬN DIỆN */}
      {(isPageLayout || activeTab === 'COLOR') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Màu nhận diện
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Màu chủ đạo được áp dụng cho logo, thanh điều hướng và giao diện tra cứu của không gian.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md transition-all flex-shrink-0"
              style={{ backgroundColor: themeColor }}
            >
              <Palette className="w-8 h-8" />
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Xem trước màu đang chọn
              </span>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  {themeColor}
                </span>
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900 shadow-xs"
                  style={{ backgroundColor: themeColor }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Bảng màu tuyển chọn (Chuyên nghiệp & Dịu mắt)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {SPACE_PALETTES.map((p) => {
                const isSelected = themeColor.toLowerCase() === p.hex.toLowerCase();
                return (
                  <button
                    key={p.hex}
                    type="button"
                    onClick={() => setThemeColor(p.hex)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs ring-2 ring-blue-600/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: p.hex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: TÍNH NĂNG SỬ DỤNG */}
      {(isPageLayout || activeTab === 'MODULES') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Tính năng sử dụng
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bật hoặc tắt các module độc lập. Menu và báo cáo sẽ tự động tinh gọn theo tính năng đang bật.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {SPACE_MODULES.map((mod) => {
              const isEnabled = enabledModules.includes(mod.id);
              return (
                <div
                  key={mod.id}
                  onClick={() => toggleModule(mod.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isEnabled
                      ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isEnabled
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {renderModuleIcon(mod.id)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {mod.name}
                        </span>
                        {mod.isDefault && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            Cốt lõi
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <Switch
                    checked={isEnabled}
                    onChange={() => toggleModule(mod.id)}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2538D9',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2538D9',
                      },
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: THÀNH VIÊN QUẢN TRỊ & QUYỀN TRUY CẬP */}
      {(isPageLayout || activeTab === 'PERMISSIONS') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Thành viên quản trị và quyền truy cập
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kiểm soát quyền truy cập tra cứu công khai và vai trò người vận hành không gian.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Cổng tra cứu công cộng (Portal học viên / hội viên)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Cho phép thành viên tra cứu lịch, hóa đơn và quét VietQR qua đường dẫn bảo mật p/{space.slug}.
                </span>
              </div>
            </div>

            <Switch
              checked={publicPortalEnabled}
              onChange={(e) => setPublicPortalEnabled(e.target.checked)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#2538D9',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#2538D9',
                },
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mức phí mặc định (VND)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={defaultFee}
                onChange={(e) => setDefaultFee(Number(e.target.value))}
                placeholder="500000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 font-mono"
              />
              <span className="text-[10px] text-slate-400">
                Định dạng: {formatVND(defaultFee)}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Chu kỳ thu phí
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
              >
                <option value="MONTHLY">Thu theo Tháng</option>
                <option value="PER_SESSION">Thu theo Buổi</option>
                <option value="DAILY">Thu theo Ngày</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
        </button>
      </div>
    </form>
  );
}
