'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, BarChart3, Download, Printer } from 'lucide-react';
import { DateRangeFilter, type DatePeriodPreset } from '@/components/common/DateRangeFilter';

import { SmartBackButton } from '@/components/common/SmartBackButton';

interface ReportHeaderProps {
  title: string;
  description: string;
  currentBreadcrumb: string;
  selectedPeriod: DatePeriodPreset;
  startDate: string;
  endDate: string;
  onPeriodChange: (period: DatePeriodPreset, start?: string, end?: string) => void;
  onExportCsv?: () => void;
  onPrint?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  extraActions?: React.ReactNode;
}

export function ReportHeader({
  title,
  description,
  currentBreadcrumb,
  selectedPeriod,
  startDate,
  endDate,
  onPeriodChange,
  onExportCsv,
  onPrint,
  icon: Icon = BarChart3,
  extraActions,
}: ReportHeaderProps) {
  return (
    <div className="space-y-4 pb-4 border-b border-[#E4E7EC] dark:border-[#1E293B]">
      {/* 1. Smart Back & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <SmartBackButton fallbackUrl="/reports" label="Trung tâm Báo cáo" />

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          <Link href="/reports" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Trung tâm Báo cáo
          </Link>
          {currentBreadcrumb !== 'Tổng quan' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className="font-semibold text-[#2538D9] dark:text-indigo-400">
                {currentBreadcrumb}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* 2. Title & Description */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2538D9]/10 text-[#2538D9] dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#101828] dark:text-[#F8FAFC] tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400 mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {/* 3. Action Toolbar - Placed on its own line on mobile to prevent squishing */}
        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          <DateRangeFilter
            selectedPeriod={selectedPeriod}
            startDate={startDate}
            endDate={endDate}
            onPeriodChange={onPeriodChange}
          />

          {extraActions}

          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#101828] dark:text-[#F8FAFC] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất CSV</span>
            </button>
          )}

          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In báo cáo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
