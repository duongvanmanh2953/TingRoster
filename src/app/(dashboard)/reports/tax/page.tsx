'use client';

import React, { useState, useEffect } from 'react';
import { formatVND } from '@/lib/utils';
import {
  Scale,
  Sparkles,
  ShieldAlert,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Building2,
  GraduationCap
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { ReportHeader } from '@/components/reports/ReportHeader';
import { type DatePeriodPreset } from '@/components/common/DateRangeFilter';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';

export default function TaxEstimateReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriodPreset>('custom');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-01-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-12-31');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaxCategory, setSelectedTaxCategory] = useState<'EDUCATION' | 'RENTAL'>('EDUCATION');

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        }
      })
      .catch((err) => console.error('Failed to load tax report:', err))
      .finally(() => setLoading(false));
  }, []);

  const tax = data?.taxEstimateReport || {
    taxYear: 2026,
    annualAccumulatedRevenue: 85000000,
    taxThreshold: 100000000,
    isTaxExempt: true,
    thresholdUsagePercent: 85,
    propertyRental: {
      categoryName: 'Cho thuê nhà trọ / căn hộ mini',
      totalRate: 10,
      vatRate: 5,
      pitRate: 5,
      estimatedTotalTax: 0,
      estimatedVat: 0,
      estimatedPit: 0,
    },
    educationAndSports: {
      categoryName: 'Dạy thêm / CLB Thể thao',
      totalRate: 7,
      vatRate: 5,
      pitRate: 2,
      estimatedTotalTax: 0,
      estimatedVat: 0,
      estimatedPit: 0,
    },
    legalCitation: 'Thông tư 40/2021/TT-BTC',
  };

  const activeCategoryData = selectedTaxCategory === 'EDUCATION'
    ? tax.educationAndSports
    : tax.propertyRental;

  const handleExportCsv = () => {
    const rows = [
      ['Năm tính thuế', 'Doanh thu tích lũy (VND)', 'Ngưỡng miễn thuế (VND)', 'Trạng thái', 'Loại hình kinh doanh', 'Thuế GTGT ước tính (5%)', 'Thuế TNCN ước tính', 'Tổng thuế ước tính'],
      [
        tax.taxYear,
        tax.annualAccumulatedRevenue,
        tax.taxThreshold,
        tax.isTaxExempt ? 'Miễn thuế (Dưới 100tr)' : 'Phải kê khai nộp thuế',
        activeCategoryData.categoryName,
        activeCategoryData.estimatedVat,
        activeCategoryData.estimatedPit,
        activeCategoryData.estimatedTotalTax,
      ],
    ];
    const csvContent = '\uFEFF' + rows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bang_ke_uoc_tinh_thue_TT40_${tax.taxYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <CircularProgress size={32} sx={{ color: '#2538D9' }} />
        <p className="text-xs text-slate-500 font-medium">Đang tính toán nghĩa vụ thuế theo Thông tư 40/2021/TT-BTC...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Breadcrumbs & Date Filter */}
      <ReportHeader
        title="Báo cáo Ước tính Thuế Thông tư 40/2021/TT-BTC"
        description="Ước tính nghĩa vụ thuế Thu nhập cá nhân (TNCN) & Giá trị gia tăng (GTGT) cho cá nhân kinh doanh, giáo viên dạy thêm, chủ phòng trọ và CLB thể thao"
        currentBreadcrumb="Báo cáo Thuế TT 40"
        icon={Scale}
        selectedPeriod={selectedPeriod}
        startDate={customStartDate}
        endDate={customEndDate}
        onPeriodChange={(p, s, e) => {
          setSelectedPeriod(p);
          if (s) setCustomStartDate(s);
          if (e) setCustomEndDate(e);
        }}
        onExportCsv={handleExportCsv}
      />

      {/* 2. Legal Disclaimer Banner */}
      <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-4 rounded-xl flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-[#2538D9] dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
          <strong>Căn cứ pháp lý: </strong> Theo quy định tại <strong>Điều 4 Thông tư 40/2021/TT-BTC</strong> của Bộ Tài chính:
          Cá nhân kinh doanh có doanh thu trong năm dương lịch từ <strong>100 triệu đồng trở xuống</strong> thì thuộc trường hợp <strong>không phải nộp thuế GTGT và không phải nộp thuế TNCN</strong>.
          Báo cáo này mang tính chất ước tính đối chiếu số sách nội bộ của TingRoster.
        </div>
      </div>

      {/* 3. Category Toggle (Dạy thêm / CLB Thể thao 7% VS Cho thuê phòng trọ 10%) */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setSelectedTaxCategory('EDUCATION')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            selectedTaxCategory === 'EDUCATION'
              ? 'bg-[#2538D9] text-white border-[#2538D9] shadow-xs'
              : 'bg-white dark:bg-[#111726] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Dạy thêm / CLB Thể thao (Thuế suất 7%: 5% GTGT + 2% TNCN)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTaxCategory('RENTAL')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            selectedTaxCategory === 'RENTAL'
              ? 'bg-[#2538D9] text-white border-[#2538D9] shadow-xs'
              : 'bg-white dark:bg-[#111726] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Cho thuê nhà trọ / Phòng trọ (Thuế suất 10%: 5% GTGT + 5% TNCN)</span>
        </button>
      </div>

      {/* 4. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard spotlightColor="rgba(37, 56, 217, 0.18)" className="p-5 border-l-4 border-l-[#2538D9]">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            Doanh thu tích lũy năm {tax.taxYear}
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {formatVND(tax.annualAccumulatedRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Tổng tiền thực nhận từ đầu năm dương lịch</p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.18)" className="p-5 border-l-4 border-l-emerald-600">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            Ngưỡng miễn thuế hàng năm
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {formatVND(tax.taxThreshold)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Dưới mức này được miễn 100% thuế</p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.18)" className="p-5 border-l-4 border-l-amber-500">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            Tình trạng miễn thuế
          </div>
          <div className="mt-3">
            {tax.isTaxExempt ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Miễn thuế (Dưới 100tr)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldAlert className="w-3.5 h-3.5" />
                Phải kê khai nộp thuế
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Đã dùng {tax.thresholdUsagePercent}% hạn mức miễn thuế</p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.18)" className="p-5 border-l-4 border-l-rose-500">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            Tổng thuế ước tính phải nộp
          </div>
          <div className="mt-3 text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatVND(activeCategoryData.estimatedTotalTax)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Thuế suất tổng cộng: {activeCategoryData.totalRate}%</p>
        </SpotlightCard>
      </div>

      {/* 5. Progress Bar: Threshold Usage */}
      <div className="bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700 dark:text-slate-300">
            Tiến độ tiệm cận ngưỡng 100.000.000 đ miễn thuế:
          </span>
          <span className="font-bold text-[#2538D9]">
            {formatVND(tax.annualAccumulatedRevenue)} / 100.000.000 đ ({tax.thresholdUsagePercent}%)
          </span>
        </div>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, tax.thresholdUsagePercent)}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#F1F5F9',
            '& .MuiLinearProgress-bar': {
              backgroundColor: tax.thresholdUsagePercent > 90 ? '#E11D48' : '#2538D9',
            },
          }}
        />
      </div>

      {/* 6. Detailed Tax Schedule Table */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E4E7EC] dark:border-[#1E293B]">
          <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">
            Bảng kê Ước tính Thuế chi tiết theo {activeCategoryData.categoryName}
          </h3>
          <p className="text-xs text-slate-500">Chi tiết tỷ lệ GTGT và TNCN theo Phụ lục I Thông tư 40</p>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Khoản mục</th>
              <th className="py-3 px-4 text-center">Tỷ lệ thuế suất</th>
              <th className="py-3 px-4 text-right">Doanh thu chịu thuế</th>
              <th className="py-3 px-4 text-right">Tiền thuế ước tính</th>
              <th className="py-3 px-4">Ghi chú nghiệp vụ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Thuế Giá trị gia tăng (GTGT)</td>
              <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">{activeCategoryData.vatRate}%</td>
              <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                {tax.isTaxExempt ? '0 đ (Miễn)' : formatVND(tax.annualAccumulatedRevenue)}
              </td>
              <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                {formatVND(activeCategoryData.estimatedVat)}
              </td>
              <td className="py-3 px-4 text-slate-500">Phụ lục I Thông tư 40/2021/TT-BTC</td>
            </tr>

            <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Thuế Thu nhập cá nhân (TNCN)</td>
              <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">{activeCategoryData.pitRate}%</td>
              <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                {tax.isTaxExempt ? '0 đ (Miễn)' : formatVND(tax.annualAccumulatedRevenue)}
              </td>
              <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                {formatVND(activeCategoryData.estimatedPit)}
              </td>
              <td className="py-3 px-4 text-slate-500">
                {selectedTaxCategory === 'EDUCATION' ? 'Dịch vụ giáo dục, thể thao (2%)' : 'Cho thuê tài sản (5%)'}
              </td>
            </tr>

            <tr className="bg-slate-50 dark:bg-slate-900/60 font-bold">
              <td className="py-3.5 px-4 text-[#2538D9] dark:text-indigo-400">TỔNG NGHĨA VỤ THUẾ ƯỚC TÍNH</td>
              <td className="py-3.5 px-4 text-center text-[#2538D9]">{activeCategoryData.totalRate}%</td>
              <td className="py-3.5 px-4 text-right">
                {tax.isTaxExempt ? '0 đ (Miễn)' : formatVND(tax.annualAccumulatedRevenue)}
              </td>
              <td className="py-3.5 px-4 text-right text-rose-600 dark:text-rose-400">
                {formatVND(activeCategoryData.estimatedTotalTax)}
              </td>
              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                {tax.isTaxExempt ? 'Chưa phát sinh nghĩa vụ nộp thuế' : 'Cần kê khai theo quý hoặc theo năm'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
