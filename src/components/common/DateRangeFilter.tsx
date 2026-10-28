'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown, Check, X, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';

export type DatePeriodPreset = 'today' | 'week' | 'month' | 'quarter' | 'custom';

export interface DateRangeFilterProps {
  selectedPeriod: DatePeriodPreset;
  startDate?: string;
  endDate?: string;
  onPeriodChange: (period: DatePeriodPreset, startDate?: string, endDate?: string) => void;
  className?: string;
}

export function DateRangeFilter({
  selectedPeriod,
  startDate,
  endDate,
  onPeriodChange,
  className = '',
}: DateRangeFilterProps) {
  const { locale } = useLanguage();
  const [showCustomRange, setShowCustomRange] = useState<boolean>(selectedPeriod === 'custom');
  const [customStart, setCustomStart] = useState<string>(startDate || '2026-10-01');
  const [customEnd, setCustomEnd] = useState<string>(endDate || '2026-10-28');
  const [dateError, setDateError] = useState<string | null>(null);

  const presets: { id: DatePeriodPreset; labelVi: string; labelEn: string }[] = [
    { id: 'today', labelVi: 'Hôm nay', labelEn: 'Today' },
    { id: 'week', labelVi: '7 ngày', labelEn: '7 Days' },
    { id: 'month', labelVi: 'Tháng này', labelEn: 'This Month' },
    { id: 'quarter', labelVi: 'Quý này', labelEn: 'This Quarter' },
  ];

  const handleSelectPreset = (preset: DatePeriodPreset) => {
    setShowCustomRange(false);
    setDateError(null);
    onPeriodChange(preset);
  };

  const handleApplyCustom = () => {
    if (new Date(customEnd) < new Date(customStart)) {
      setDateError(locale === 'en' ? 'End date must be after start date' : 'Ngày kết thúc phải lớn hơn ngày bắt đầu');
      return;
    }
    setDateError(null);
    setShowCustomRange(true);
    onPeriodChange('custom', customStart, customEnd);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Preset Pill Selector */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
        {presets.map((p) => {
          const isActive = selectedPeriod === p.id && !showCustomRange;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {locale === 'en' ? p.labelEn : p.labelVi}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setShowCustomRange(!showCustomRange)}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
            showCustomRange || selectedPeriod === 'custom'
              ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{locale === 'en' ? 'Custom' : 'Tùy chọn'}</span>
        </button>
      </div>

      {/* Custom Date Range Picker Strip */}
      {showCustomRange && (
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-[11px] font-semibold text-slate-400">{locale === 'en' ? 'From:' : 'Từ:'}</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2538D9]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-[11px] font-semibold text-slate-400">{locale === 'en' ? 'To:' : 'Đến:'}</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2538D9]"
            />
          </div>

          <button
            type="button"
            onClick={handleApplyCustom}
            className="h-8 px-3 rounded-lg bg-[#2538D9] text-white hover:bg-[#1E2DB8] text-xs font-bold transition-colors"
          >
            {locale === 'en' ? 'Apply' : 'Áp dụng'}
          </button>
        </div>
      )}

      {dateError && (
        <span className="w-full text-xs text-rose-600 font-semibold mt-1">
          {dateError}
        </span>
      )}
    </div>
  );
}
