'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { formatVND, formatCompactVND } from '@/lib/utils';
import { useTheme } from '@/components/theme/ThemeContext';

// -------------------------------------------------------------
// 1. Collections Trend Chart (Line & Bar Dual Analysis)
// -------------------------------------------------------------
export interface TrendDataPoint {
  label: string;
  accrued: number;
  cash: number;
  target?: number;
}

export function CollectionsTrendChart({
  monthlyData,
  weeklyData,
}: {
  monthlyData: Array<{ month: string; accrued: number; cash: number; target?: number }>;
  weeklyData: Array<{ week: string; accrued: number; cash: number }>;
}) {
  const [mode, setMode] = useState<'MONTHLY' | 'WEEKLY'>('MONTHLY');
  const { isDark } = useTheme();

  const data: TrendDataPoint[] =
    mode === 'MONTHLY'
      ? monthlyData.map((d) => ({
          label: d.month,
          accrued: d.accrued,
          cash: d.cash,
          target: d.target,
        }))
      : weeklyData.map((d) => ({
          label: d.week,
          accrued: d.accrued,
          cash: d.cash,
        }));

  return (
    <div className="ting-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#101828] dark:text-[#F8FAFC]">
            Xu hướng Thu tiền: Phải thu (Accrual) vs Thực thu (Cash-in)
          </h3>
          <p className="text-xs text-[#475467] dark:text-slate-400 mt-0.5">
            Đối chiếu số phát sinh danh nghĩa và dòng tiền chuyển khoản qua VietQR
          </p>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs self-start sm:self-auto border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setMode('MONTHLY')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              mode === 'MONTHLY'
                ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            6 Tháng gần nhất
          </button>
          <button
            type="button"
            onClick={() => setMode('WEEKLY')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              mode === 'WEEKLY'
                ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            4 Tuần trong kỳ
          </button>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? '#1E293B' : '#F1F5F9'}
            />
            <XAxis
              dataKey="label"
              stroke={isDark ? '#94A3B8' : '#64748B'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#94A3B8' : '#64748B'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCompactVND(v)}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[200px]">
                      <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                        {label}
                      </p>
                      {payload.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span>{entry.name}:</span>
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                            {formatVND(Number(entry.value))}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
            />
            <Bar
              dataKey="accrued"
              name="Phải thu (Accrual)"
              fill="#2538D9"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="cash"
              name="Thực thu (Cash-in)"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. Payment Status Donut Chart
// -------------------------------------------------------------
export function PaymentStatusDonutChart({
  totalPaid,
  remainingDebt,
  overdue,
}: {
  totalPaid: number;
  remainingDebt: number;
  overdue: number;
}) {
  const { isDark } = useTheme();
  const inTermDebt = Math.max(0, remainingDebt - overdue);
  const total = totalPaid + remainingDebt;

  const data = [
    { name: 'Đã thu (Cash-in)', value: totalPaid, color: '#10B981' },
    { name: 'Còn nợ trong hạn', value: inTermDebt, color: '#2538D9' },
    { name: 'Công nợ quá hạn', value: overdue, color: '#F43F5E' },
  ].filter((d) => d.value > 0);

  const collectionRate = total > 0 ? Math.round((totalPaid / total) * 100) : 0;

  return (
    <div className="ting-card p-5 space-y-3">
      <div>
        <h3 className="text-sm sm:text-base font-bold text-[#101828] dark:text-[#F8FAFC]">
          Cơ cấu Trạng thái Khoản thu
        </h3>
        <p className="text-xs text-[#475467] dark:text-slate-400 mt-0.5">
          Tỷ lệ đã hoàn tất thanh toán so với công nợ tồn đọng
        </p>
      </div>

      <div className="relative h-60 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length > 0 ? data : [{ name: 'Chưa có dữ liệu', value: 1, color: '#94A3B8' }]}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(value: any) => [formatVND(Number(value)), '']}
              contentStyle={{
                backgroundColor: isDark ? '#111726' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E4E7EC',
                borderRadius: '0.75rem',
                fontSize: '12px',
                fontWeight: 600,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums leading-none">
            {collectionRate}%
          </span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Đã thu đủ
          </span>
        </div>
      </div>

      <div className="space-y-1.5 pt-1 text-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-medium">{item.name}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {formatVND(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. Debt Aging Schedule Distribution Chart (Clickable Filter)
// -------------------------------------------------------------
export function DebtAgingDistributionChart({
  schedule,
  selectedBucket,
  onSelectBucket,
}: {
  schedule: {
    current: { amount: number; count: number; label: string };
    overdue1to7: { amount: number; count: number; label: string };
    overdue8to30: { amount: number; count: number; label: string };
    overdueOver30: { amount: number; count: number; label: string };
  };
  selectedBucket?: string | null;
  onSelectBucket?: (bucketKey: string | null) => void;
}) {
  const { isDark } = useTheme();

  const data = [
    {
      key: 'CURRENT',
      label: 'Chưa đến hạn',
      amount: schedule.current.amount,
      count: schedule.current.count,
      color: '#2538D9',
    },
    {
      key: 'OVERDUE_1_7',
      label: '1–7 ngày',
      amount: schedule.overdue1to7.amount,
      count: schedule.overdue1to7.count,
      color: '#D97706',
    },
    {
      key: 'OVERDUE_8_30',
      label: '8–30 ngày',
      amount: schedule.overdue8to30.amount,
      count: schedule.overdue8to30.count,
      color: '#EA580C',
    },
    {
      key: 'OVERDUE_OVER_30',
      label: '>30 ngày',
      amount: schedule.overdueOver30.amount,
      count: schedule.overdueOver30.count,
      color: '#E11D48',
    },
  ];

  return (
    <div className="ting-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#101828] dark:text-[#F8FAFC]">
            Phân bổ Tuổi nợ (Receivable Aging Schedule)
          </h3>
          <p className="text-xs text-[#475467] dark:text-slate-400 mt-0.5">
            Nhấp vào từng cột để lọc danh sách hóa đơn theo mức độ rủi ro thu hồi
          </p>
        </div>

        {selectedBucket && onSelectBucket && (
          <button
            type="button"
            onClick={() => onSelectBucket(null)}
            className="text-xs font-semibold text-[#2538D9] dark:text-indigo-400 hover:underline self-start sm:self-auto"
          >
            ✕ Bỏ lọc cột
          </button>
        )}
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length && onSelectBucket) {
                const clickedKey = state.activePayload[0].payload.key;
                onSelectBucket(selectedBucket === clickedKey ? null : clickedKey);
              }
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? '#1E293B' : '#F1F5F9'}
            />
            <XAxis
              dataKey="label"
              stroke={isDark ? '#94A3B8' : '#64748B'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#94A3B8' : '#64748B'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCompactVND(v)}
            />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white">{p.label}</p>
                      <p className="text-slate-600 dark:text-slate-300">
                        Số tiền: <strong className="text-slate-900 dark:text-white">{formatVND(p.amount)}</strong>
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">
                        Số phiếu nợ: <strong className="text-slate-900 dark:text-white">{p.count} hóa đơn</strong>
                      </p>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block pt-1 font-semibold">
                        Bấm để lọc bảng chi tiết bên dưới ⬇
                      </span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} cursor="pointer">
              {data.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={entry.color}
                  opacity={selectedBucket && selectedBucket !== entry.key ? 0.35 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. Attendance By Day Of Week Chart
// -------------------------------------------------------------
export function AttendanceDayOfWeekChart({
  byDayOfWeek,
}: {
  byDayOfWeek: Array<{ day: string; rate: number; total: number; present: number }>;
}) {
  const { isDark } = useTheme();

  return (
    <div className="ting-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#101828] dark:text-[#F8FAFC]">
            Tỷ lệ Chuyên cần theo Thứ trong Tuần (%)
          </h3>
          <p className="text-xs text-[#475467] dark:text-slate-400 mt-0.5">
            Xác định ngày tập trung đông và ngày học viên hay vắng phép/nghỉ
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          Mục tiêu: ≥ 85%
        </span>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byDayOfWeek} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? '#1E293B' : '#F1F5F9'}
            />
            <XAxis
              dataKey="day"
              stroke={isDark ? '#94A3B8' : '#64748B'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke={isDark ? '#94A3B8' : '#64748B'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white">{label}</p>
                      <p className="text-slate-600 dark:text-slate-300">
                        Tỷ lệ có mặt: <strong className="text-emerald-600 dark:text-emerald-400">{p.rate}%</strong>
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        {p.present} / {p.total} lượt điểm danh
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="rate" fill="#2538D9" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {byDayOfWeek.map((entry, idx) => (
                <Cell
                  key={`day-${idx}`}
                  fill={entry.rate >= 85 ? '#10B981' : entry.rate >= 70 ? '#2538D9' : '#F59E0B'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
