'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Users2,
  CalendarCheck,
  Receipt,
  ArrowRightLeft,
  BarChart3,
  Bell,
  FileText,
  Workflow,
  Palette,
  ShieldCheck,
  Layers,
  Building2,
  Trophy,
  GraduationCap
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Switch from '@mui/material/Switch';
import { SPACE_MODULES, SPACE_PALETTES, generateSpaceCode } from '@/lib/spaces/constants';
import { SpaceAvatar } from '@/components/common/SpaceAvatar';

interface CreateSpaceWizardModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (space: any) => void;
}

export function CreateSpaceWizardModal({
  open,
  onClose,
  onSuccess,
}: CreateSpaceWizardModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Info & Identity
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#2538D9');
  const [suggestedType, setSuggestedType] = useState<'CLASS' | 'SPORTS_CLUB' | 'RENTAL' | 'GENERAL'>('GENERAL');
  const [previewCode, setPreviewCode] = useState('TR-' + Math.floor(1000 + Math.random() * 9000));

  // Step 2: Feature Toggles
  const [enabledModules, setEnabledModules] = useState<string[]>([
    'members',
    'attendance',
    'invoices',
    'reconciliation',
    'reports',
  ]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    const generated = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setSlug(generated);
  };

  const handlePresetSelect = (preset: 'CLASS' | 'SPORTS_CLUB' | 'RENTAL' | 'GENERAL') => {
    setSuggestedType(preset);
    if (preset === 'CLASS') {
      setThemeColor('#2538D9');
      setEnabledModules(['members', 'attendance', 'invoices', 'reports', 'reconciliation']);
    } else if (preset === 'SPORTS_CLUB') {
      setThemeColor('#6D5CE8');
      setEnabledModules(['members', 'attendance', 'invoices', 'reconciliation', 'notifications']);
    } else if (preset === 'RENTAL') {
      setThemeColor('#059669');
      setEnabledModules(['members', 'invoices', 'reconciliation', 'reports', 'documents']);
    } else {
      setThemeColor('#2538D9');
      setEnabledModules(['members', 'attendance', 'invoices', 'reports']);
    }
  };

  const toggleModule = (moduleId: string) => {
    setEnabledModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users2': return Users2;
      case 'CalendarCheck': return CalendarCheck;
      case 'Receipt': return Receipt;
      case 'ArrowRightLeft': return ArrowRightLeft;
      case 'BarChart3': return BarChart3;
      case 'Bell': return Bell;
      case 'FileText': return FileText;
      case 'Workflow': return Workflow;
      default: return Layers;
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên không gian');
      setStep(1);
      return;
    }
    if (!slug.trim()) {
      setError('Vui lòng nhập mã slug cho đường dẫn');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          themeColor,
          groupType: suggestedType,
          enabledModules,
          defaultFee: 0,
          billingCycle: 'MONTHLY',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể tạo không gian');
      }

      onClose();
      if (onSuccess) {
        onSuccess(data.data);
      }
      router.push(`/groups/${data.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối tới máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '1.25rem',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            backgroundImage: 'none',
          },
          className: 'dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                Bước {step} / 3
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {step === 1 ? 'Thông tin & Nhận diện' : step === 2 ? 'Lựa chọn tính năng' : 'Xác nhận & Khởi tạo'}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              Tạo Không gian Quản lý Mới
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="p-6">
          {/* STEP 1: Info & Identity */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Template suggestion (optional, doesn't lock anything) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Gợi ý mô hình mẫu (tùy chọn)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'GENERAL', label: 'Linh hoạt / Khác', icon: Layers, desc: 'Tự chọn tính năng' },
                    { id: 'CLASS', label: 'Lớp học & Đào tạo', icon: GraduationCap, desc: 'Điểm danh + Học phí' },
                    { id: 'SPORTS_CLUB', label: 'CLB & Thể thao', icon: Trophy, desc: 'Check-in sân bãi' },
                    { id: 'RENTAL', label: 'Nhà trọ & Căn hộ', icon: Building2, desc: 'Điện nước + Hóa đơn' },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = suggestedType === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePresetSelect(p.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                          <span className="text-xs font-bold leading-tight truncate">{p.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Space Name & Avatar Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <div className="sm:col-span-3 flex flex-col items-center justify-center text-center">
                  <SpaceAvatar
                    name={name || 'TingRoster'}
                    themeColor={themeColor}
                    groupType={suggestedType}
                    size="lg"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-2 block">
                    Mã: {previewCode}
                  </span>
                </div>

                <div className="sm:col-span-9 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Tên không gian <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ví dụ: Lớp IELTS Thầy Nam, CLB Pickleball, Căn hộ Nguyễn Trãi..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Mã định danh đường dẫn (slug) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 rounded-l-xl bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono select-none border border-r-0 border-slate-300 dark:border-slate-600">
                        tingroster.vn/p/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="ma-khong-gian"
                        className="w-full px-3 py-2.5 rounded-r-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Identity Selector */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Màu nhận diện không gian
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {SPACE_PALETTES.map((palette) => (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => setThemeColor(palette.hex)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        themeColor === palette.hex
                          ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: palette.hex }}
                      title={palette.name}
                    >
                      {themeColor === palette.hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Mô tả không gian (tùy chọn)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú mục đích hoạt động, địa chỉ cơ sở hoặc ghi chú vận hành..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Feature Toggles */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Chọn các module bạn muốn kích hoạt trong không gian này:
                </span>
                <span className="text-xs font-black text-blue-600">
                  {enabledModules.length} module đã chọn
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {SPACE_MODULES.map((module) => {
                  const Icon = getModuleIcon(module.iconName);
                  const isChecked = enabledModules.includes(module.id);
                  return (
                    <div
                      key={module.id}
                      onClick={() => toggleModule(module.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isChecked
                          ? 'border-blue-500/80 bg-blue-50/40 dark:bg-blue-950/20 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isChecked
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block leading-snug">
                            {module.name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {module.description}
                          </span>
                        </div>
                      </div>

                      <Switch
                        checked={isChecked}
                        onChange={() => toggleModule(module.id)}
                        size="small"
                        color="primary"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Review & Create */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-4">
                  <SpaceAvatar
                    name={name}
                    themeColor={themeColor}
                    groupType={suggestedType}
                    size="lg"
                  />
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {previewCode}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        tingroster.vn/p/{slug}
                      </span>
                    </div>
                  </div>
                </div>

                {description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                    &ldquo;{description}&rdquo;
                  </p>
                )}

                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Các module sẽ được kích hoạt ({enabledModules.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {enabledModules.map((mId) => {
                      const mod = SPACE_MODULES.find((m) => m.id === mId);
                      return (
                        <span
                          key={mId}
                          className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1.5"
                        >
                          <Check className="w-3 h-3 text-blue-600" />
                          <span>{mod?.name || mId}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Bạn luôn có thể thêm logo riêng, bật/tắt module và đổi màu nhận diện bất cứ lúc nào trong menu Quản lý Không gian.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Hủy
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => {
                if (!name.trim()) return;
                setStep((s) => (s + 1) as any);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <span>Tiếp tục</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCreate}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang khởi tạo không gian...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Hoàn tất & Khởi tạo</span>
                </>
              )}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
