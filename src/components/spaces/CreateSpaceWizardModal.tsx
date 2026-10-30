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
  Layers,
  Building2,
  Trophy,
  GraduationCap,
  Briefcase,
  Sliders,
  ShieldCheck,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Switch from '@mui/material/Switch';
import {
  SPACE_MODULES,
  MODULE_CATEGORY_GROUPS,
  WORKSPACE_PRESETS,
  WORKSPACE_REPORTS,
  SPACE_PALETTES,
  generateSpaceCode,
  WorkspacePresetModel,
  SpaceModuleConfig
} from '@/lib/spaces/constants';
import { SpaceAvatar } from '@/components/common/SpaceAvatar';

interface CreateSpaceWizardModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (space: any) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export function CreateSpaceWizardModal({
  open,
  onClose,
  onSuccess,
}: CreateSpaceWizardModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);

  // Step 1: Info & Identity
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#2538D9');
  const [previewCode, setPreviewCode] = useState(generateSpaceCode());
  const [location, setLocation] = useState('');

  // Step 2: Presets & Business Models
  const [selectedPresetId, setSelectedPresetId] = useState<string>('CLASS');

  // Step 3: Modules selection
  const [enabledModules, setEnabledModules] = useState<string[]>([
    'members',
    'attendance',
    'invoices',
    'reports',
    'reconciliation',
  ]);

  // Step 4: Reports selection
  const [selectedReports, setSelectedReports] = useState<string[]>([
    'rep_financial',
    'rep_attendance',
    'rep_debt_aging',
  ]);

  // Step 5: Initial Configurations
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'PER_SESSION' | 'DAILY'>('MONTHLY');
  const [defaultFee, setDefaultFee] = useState<number>(0);
  const [kioskSelfCheckin, setKioskSelfCheckin] = useState<boolean>(true);

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

  const handlePresetSelect = (preset: WorkspacePresetModel) => {
    setSelectedPresetId(preset.id);
    setThemeColor(preset.recommendedThemeColor);
    setEnabledModules(preset.defaultModules);
    setSelectedReports(preset.suggestedReports);
    setBillingCycle(preset.initialBillingCycle);
  };

  const toggleModule = (moduleId: string) => {
    const isEnabling = !enabledModules.includes(moduleId);
    if (isEnabling) {
      // Find required dependencies
      const targetMod = SPACE_MODULES.find((m) => m.id === moduleId);
      const neededDeps = targetMod?.requiredDependencies || [];
      const newModules = Array.from(new Set([...enabledModules, moduleId, ...neededDeps]));
      setEnabledModules(newModules);

      // Also unlock default suggested reports for this module
      const unlockedReports = WORKSPACE_REPORTS
        .filter((r) => r.requiredModuleId === moduleId)
        .map((r) => r.id);
      setSelectedReports((prev) => Array.from(new Set([...prev, ...unlockedReports])));
    } else {
      // Cannot disable 'members' (core base)
      if (moduleId === 'members') return;

      // Filter out this module
      const remaining = enabledModules.filter((id) => id !== moduleId);
      setEnabledModules(remaining);

      // Remove reports tied to this disabled module
      setSelectedReports((prev) =>
        prev.filter((repId) => {
          const reportDef = WORKSPACE_REPORTS.find((r) => r.id === repId);
          return reportDef ? reportDef.requiredModuleId !== moduleId : true;
        })
      );
    }
  };

  const toggleReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
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
      case 'Briefcase': return Briefcase;
      case 'Building2': return Building2;
      case 'Trophy': return Trophy;
      case 'GraduationCap': return GraduationCap;
      default: return Layers;
    }
  };

  // Move to next step validation
  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!name.trim()) {
        setError('Vui lòng nhập tên không gian quản lý');
        return;
      }
      if (!slug.trim()) {
        setError('Vui lòng nhập mã slug cho đường dẫn portal');
        return;
      }
    }
    if (step === 3) {
      if (enabledModules.length === 0) {
        setError('Vui lòng chọn ít nhất một module vận hành');
        return;
      }
    }
    setStep((prev) => Math.min(6, prev + 1) as WizardStep);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1) as WizardStep);
  };

  const handleCreate = async () => {
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
          groupType: selectedPresetId === 'WORKFORCE' || selectedPresetId === 'SERVICE' ? 'GENERAL' : selectedPresetId,
          enabledModules,
          defaultFee: Number(defaultFee) || 0,
          billingCycle,
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

  // Filter available reports based on currently enabled modules
  const availableReports = WORKSPACE_REPORTS.filter((rep) =>
    enabledModules.includes(rep.requiredModuleId)
  );

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
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                Bước {step} / 6
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {step === 1 && '1. Thông tin cơ bản'}
                {step === 2 && '2. Chọn mô hình khởi tạo'}
                {step === 3 && '3. Module chức năng phân nhóm'}
                {step === 4 && '4. Chọn báo cáo vận hành'}
                {step === 5 && '5. Cấu hình ban đầu'}
                {step === 6 && '6. Xem trước & Xác nhận'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              Khởi tạo Không gian Quản lý Mới
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
            className="h-full bg-[#2538D9] transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <div className="sm:col-span-3 flex flex-col items-center justify-center text-center">
                  <SpaceAvatar
                    name={name || 'TingRoster'}
                    themeColor={themeColor}
                    groupType={selectedPresetId}
                    size="lg"
                  />
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-2 block">
                    Mã: {previewCode}
                  </span>
                </div>

                <div className="sm:col-span-9 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Tên không gian vận hành <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ví dụ: Lớp IELTS Thầy Nam, CLB Pickleball Thủ Đức, Căn hộ Nguyễn Trãi..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Đường dẫn cổng thông tin thành viên (slug) <span className="text-rose-500">*</span>
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

              {/* Color Identity */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Màu nhận diện thương hiệu
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {SPACE_PALETTES.map((palette) => (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => setThemeColor(palette.hex)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        themeColor === palette.hex
                          ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: palette.hex }}
                      title={palette.name}
                    >
                      {themeColor === palette.hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Địa điểm / Cơ sở (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ví dụ: Cơ sở 1 - Quận 1, TP. HCM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Mô tả ngắn gọn
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ví dụ: Dạy ngữ pháp và luyện thi tiếng Anh cấp tốc"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Presets & Business Models */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/60 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                  Mô hình mẫu giúp cấu hình sẵn các module và biểu phí phù hợp. Bạn hoàn toàn có thể tùy chỉnh thêm hoặc bớt từng chức năng ở các bước tiếp theo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {WORKSPACE_PRESETS.map((preset) => {
                  const Icon = getModuleIcon(preset.iconName);
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#2538D9] bg-black-50/40 dark:bg-black-950/30 shadow-xs ring-1 ring-[#2538D9]'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{preset.name}</span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{preset.defaultModules.length} module gợi ý</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {isSelected ? 'Đã chọn' : 'Nhấn để chọn'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Categorized Functional Modules (A - E) */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Chọn các module chức năng cần vận hành trong không gian:
                </span>
                <span className="text-xs font-bold text-[#2538D9] dark:text-indigo-400">
                  {enabledModules.length} module kích hoạt
                </span>
              </div>

              {MODULE_CATEGORY_GROUPS.map((group) => {
                const groupModules = SPACE_MODULES.filter((m) => m.category === group.id);
                if (groupModules.length === 0) return null;

                return (
                  <div key={group.id} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center justify-center">
                        {group.code}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{group.title}</h3>
                      <span className="text-[11px] text-slate-400 font-normal">({group.description})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groupModules.map((module) => {
                        const Icon = getModuleIcon(module.iconName);
                        const isChecked = enabledModules.includes(module.id);
                        const isCore = module.id === 'members';

                        return (
                          <div
                            key={module.id}
                            onClick={() => toggleModule(module.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isChecked
                                ? 'border-[#2538D9]/70 bg-black-50/30 dark:bg-black-950/20 shadow-2xs'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                    isChecked
                                      ? 'bg-[#2538D9] text-white shadow-xs'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                    {module.name}
                                  </span>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                                    {module.description}
                                  </p>
                                </div>
                              </div>

                              <Switch
                                checked={isChecked}
                                disabled={isCore}
                                onChange={() => toggleModule(module.id)}
                                size="small"
                                color="primary"
                              />
                            </div>

                            {/* Sub-features pills */}
                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
                              {module.subFeatures.map((sub, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 4: Choose Operational Reports */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                <BarChart3 className="w-4 h-4 text-[#2538D9] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Chỉ các báo cáo có nguồn dữ liệu từ các module bạn đã kích hoạt mới xuất hiện dưới đây. Bạn có thể bật/tắt để tùy biến sidebar báo cáo riêng cho không gian này.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableReports.map((report) => {
                  const isChecked = selectedReports.includes(report.id);
                  return (
                    <div
                      key={report.id}
                      onClick={() => toggleReport(report.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isChecked
                          ? 'border-emerald-500/80 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {report.name}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                            {report.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {report.description}
                        </p>
                      </div>

                      <Switch
                        checked={isChecked}
                        onChange={() => toggleReport(report.id)}
                        size="small"
                        color="success"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Initial Business Configuration */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Thiết lập chu kỳ tính phí & thanh toán
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'MONTHLY', label: 'Theo tháng', desc: 'Định kỳ ngày cố định' },
                    { id: 'PER_SESSION', label: 'Theo buổi / ca', desc: 'Linh hoạt theo điểm danh' },
                    { id: 'DAILY', label: 'Theo ngày', desc: 'Tính theo từng ngày sử dụng' },
                  ].map((cycle) => (
                    <div
                      key={cycle.id}
                      onClick={() => setBillingCycle(cycle.id as any)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        billingCycle === cycle.id
                          ? 'border-[#2538D9] bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xs block font-bold">{cycle.label}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{cycle.desc}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Mức phí sàn cơ bản mặc định (VND)
                  </label>
                  <input
                    type="number"
                    value={defaultFee || ''}
                    onChange={(e) => setDefaultFee(Number(e.target.value) || 0)}
                    placeholder="0 đ (có thể cấu hình biểu phí dịch vụ sau)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Bạn có thể tạo bảng giá chi tiết cho từng loại dịch vụ, giờ chơi hoặc khóa học sau khi tạo không gian.
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Kiosk quét QR tự phục vụ tại quầy
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tự động gán mã Action QR check-in gắn liền với địa điểm cơ sở này.
                    </span>
                  </div>
                  <Switch
                    checked={kioskSelfCheckin}
                    onChange={(e) => setKioskSelfCheckin(e.target.checked)}
                    size="small"
                    color="primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Final Confirmation */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-4">
                  <SpaceAvatar
                    name={name}
                    themeColor={themeColor}
                    groupType={selectedPresetId}
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

                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Các module chức năng đã bật ({enabledModules.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {enabledModules.map((mId) => {
                        const mod = SPACE_MODULES.find((m) => m.id === mId);
                        return (
                          <span
                            key={mId}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800"
                          >
                            <Check className="w-3 h-3" />
                            <span>{mod?.name || mId}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Các báo cáo được kích hoạt ({selectedReports.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedReports.map((rId) => {
                        const rep = WORKSPACE_REPORTS.find((r) => r.id === rId);
                        return (
                          <span
                            key={rId}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
                          >
                            <BarChart3 className="w-3 h-3" />
                            <span>{rep?.name || rId}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 block">Chu kỳ tính phí:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {billingCycle === 'MONTHLY' ? 'Theo tháng' : billingCycle === 'PER_SESSION' ? 'Theo buổi' : 'Theo ngày'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Kiosk check-in:</span>
                      <span className="font-bold text-emerald-600">
                        {kioskSelfCheckin ? 'Đã bật tự phục vụ' : 'Chưa kích hoạt'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>Quay lại</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#2538D9]/25 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Tiếp tục</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin shrink-0" />
                  <span>Đang khởi tạo không gian...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Xác nhận & Khởi tạo ngay</span>
                </>
              )}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
