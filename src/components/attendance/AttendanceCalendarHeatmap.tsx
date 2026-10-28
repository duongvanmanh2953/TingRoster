'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Calendar as CalendarIcon,
  Filter,
  Sparkles
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { Avatar } from '@/components/common/Avatar';
import { useLanguage } from '@/components/i18n/LanguageContext';

interface AttendanceDayData {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  hasSession: boolean;
  totalMembers: number;
  presentCount: number;
  absentCount: number;
  rate: number;
  sessions: Array<{
    id: string;
    groupName: string;
    time: string;
    present: number;
    total: number;
    absentees: Array<{ name: string; reason?: string }>;
  }>;
}

interface AttendanceCalendarHeatmapProps {
  className?: string;
  groupOptions?: Array<{ id: string; name: string }>;
  selectedGroupId?: string;
  onSelectGroup?: (groupId: string) => void;
}

export function AttendanceCalendarHeatmap({
  className = '',
  groupOptions = [
    { id: 'all', name: 'Tất cả các lớp & câu lạc bộ' },
    { id: 'g1', name: 'Lớp Toán 12A Thầy Tuấn' },
    { id: 'g2', name: 'CLB Cầu Lông TingRoster' },
  ],
  selectedGroupId = 'all',
  onSelectGroup,
}: AttendanceCalendarHeatmapProps) {
  const { locale } = useLanguage();
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [activeGroup, setActiveGroup] = useState<string>(selectedGroupId);
  const [selectedDayDetail, setSelectedDayDetail] = useState<AttendanceDayData | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
    // Convert to Monday start: 0 = Mon, 6 = Sun
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: (AttendanceDayData | null)[] = [];

    // Leading empty days
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(currentYear, currentMonth, day);
      const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday

      // Generate realistic dynamic attendance data based on weekday schedule
      const isClassDay = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5 || dayOfWeek === 6; // Mon, Wed, Fri, Sat
      const isPastOrToday = day <= 28; // Assuming 28th is today

      if (isClassDay && isPastOrToday) {
        // High attendance with small natural variance
        const total = activeGroup === 'g2' ? 12 : activeGroup === 'g1' ? 18 : 30;
        const absent = day % 7 === 0 ? 3 : day % 5 === 0 ? 2 : day % 3 === 0 ? 1 : 0;
        const present = total - absent;
        const rate = Math.round((present / total) * 100);

        const sampleAbsentees = absent > 0 ? [
          { name: 'Nguyễn Văn Hải', reason: 'Nghỉ ốm có phép' },
          ...(absent > 1 ? [{ name: 'Trần Thị Thu Trang', reason: 'Trùng lịch thi học kỳ' }] : []),
          ...(absent > 2 ? [{ name: 'Lê Hoàng Nam', reason: 'Vắng không báo trước' }] : []),
        ] : [];

        days.push({
          date: dateStr,
          dayNumber: day,
          hasSession: true,
          totalMembers: total,
          presentCount: present,
          absentCount: absent,
          rate,
          sessions: [
            {
              id: `sess-${day}-1`,
              groupName: activeGroup === 'g2' ? 'CLB Cầu Lông TingRoster' : 'Lớp Toán 12A Thầy Tuấn',
              time: '18:00 - 19:30',
              present,
              total,
              absentees: sampleAbsentees,
            },
          ],
        });
      } else {
        days.push({
          date: dateStr,
          dayNumber: day,
          hasSession: false,
          totalMembers: 0,
          presentCount: 0,
          absentCount: 0,
          rate: 0,
          sessions: [],
        });
      }
    }

    return days;
  }, [currentYear, currentMonth, activeGroup]);

  // Overall Month Stats
  const monthStats = useMemo(() => {
    let totalSessions = 0;
    let totalPresent = 0;
    let totalScheduled = 0;
    let totalAbsent = 0;

    calendarDays.forEach((d) => {
      if (d && d.hasSession) {
        totalSessions++;
        totalPresent += d.presentCount;
        totalScheduled += d.totalMembers;
        totalAbsent += d.absentCount;
      }
    });

    const averageRate = totalScheduled > 0 ? Math.round((totalPresent / totalScheduled) * 100) : 0;

    return {
      totalSessions,
      totalPresent,
      totalAbsent,
      averageRate,
    };
  }, [calendarDays]);

  const monthNamesVi = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthLabel = locale === 'en'
    ? `${monthNamesEn[currentMonth]} ${currentYear}`
    : `${monthNamesVi[currentMonth]} năm ${currentYear}`;

  const weekHeaders = locale === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  return (
    <div className={`ting-card overflow-hidden ${className}`}>
      {/* 1. Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-[#E4E7EC] dark:border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#101828] dark:text-[#F8FAFC]">
              {locale === 'en' ? 'Attendance & Sessions Calendar' : 'Lịch Điểm Danh & Chuyên Cần Trực Quan'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {locale === 'en'
              ? 'Interactive heat-map calendar reflecting daily attendance rates, session rosters, and absentees.'
              : 'Giao diện lịch tháng thông minh trực quan hóa tỷ lệ đi học, số ca học và danh sách vắng từng ngày.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={activeGroup}
              onChange={(e) => {
                setActiveGroup(e.target.value);
                if (onSelectGroup) onSelectGroup(e.target.value);
              }}
              className="h-9 px-3 rounded-lg border border-[#E4E7EC] dark:border-[#1E293B] bg-white dark:bg-[#111726] text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2538D9]/20"
            >
              {groupOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Nav Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs font-bold text-slate-900 dark:text-white min-w-[110px] text-center select-none">
              {currentMonthLabel}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCurrentMonth}
            className="h-9 px-3 rounded-lg border border-[#E4E7EC] dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#2538D9] dark:text-indigo-400 transition-colors"
          >
            {locale === 'en' ? 'Today' : 'Hôm nay'}
          </button>
        </div>
      </div>

      {/* 2. Monthly Quick KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E4E7EC] dark:bg-[#1E293B] border-b border-[#E4E7EC] dark:border-[#1E293B]">
        <div className="bg-white dark:bg-[#111726] p-3 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {locale === 'en' ? 'Average Attendance' : 'Tỷ lệ Chuyên cần'}
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {monthStats.averageRate}%
          </span>
        </div>

        <div className="bg-white dark:bg-[#111726] p-3 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {locale === 'en' ? 'Conducted Sessions' : 'Số buổi đã dạy'}
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {monthStats.totalSessions} {locale === 'en' ? 'sessions' : 'buổi'}
          </span>
        </div>

        <div className="bg-white dark:bg-[#111726] p-3 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {locale === 'en' ? 'Total Check-ins' : 'Lượt có mặt'}
          </span>
          <span className="text-xl font-bold text-[#2538D9] dark:text-indigo-400 tabular-nums">
            {monthStats.totalPresent}
          </span>
        </div>

        <div className="bg-white dark:bg-[#111726] p-3 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {locale === 'en' ? 'Total Absences' : 'Tổng lượt vắng'}
          </span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
            {monthStats.totalAbsent}
          </span>
        </div>
      </div>

      {/* 3. Calendar Grid */}
      <div className="p-3 sm:p-5">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
          {weekHeaders.map((w, idx) => (
            <div
              key={idx}
              className={`py-1.5 text-xs font-bold uppercase tracking-wider ${
                idx >= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((dayData, idx) => {
            if (!dayData) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[76px] sm:min-h-[92px] rounded-xl bg-slate-50/40 dark:bg-slate-900/20 border border-dashed border-slate-200/60 dark:border-slate-800/40"
                />
              );
            }

            const isToday = dayData.dayNumber === 28 && currentMonth === 9 && currentYear === 2026;

            let badgeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
            let cellBg = 'bg-white dark:bg-[#111726] hover:border-[#2538D9] dark:hover:border-indigo-400';

            if (dayData.hasSession) {
              if (dayData.rate >= 90) {
                badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
                cellBg = 'bg-white dark:bg-[#111726] border-emerald-200/80 dark:border-emerald-900/50 hover:shadow-md';
              } else if (dayData.rate >= 80) {
                badgeColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
                cellBg = 'bg-white dark:bg-[#111726] border-blue-200/80 dark:border-blue-900/50 hover:shadow-md';
              } else {
                badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
                cellBg = 'bg-white dark:bg-[#111726] border-rose-200/80 dark:border-rose-900/50 hover:shadow-md';
              }
            } else {
              cellBg = 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60';
            }

            return (
              <div
                key={dayData.date}
                onClick={() => {
                  if (dayData.hasSession) setSelectedDayDetail(dayData);
                }}
                className={`relative min-h-[76px] sm:min-h-[92px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${cellBg} ${
                  isToday ? 'ring-2 ring-[#2538D9] dark:ring-indigo-500 shadow-sm' : ''
                }`}
              >
                {/* Top Row: Date & Rate Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      isToday
                        ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#2538D9] text-white flex items-center justify-center leading-none'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {dayData.dayNumber}
                  </span>

                  {dayData.hasSession && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none ${badgeColor}`}>
                      {dayData.rate}%
                    </span>
                  )}
                </div>

                {/* Bottom Row: Session presence stats */}
                {dayData.hasSession ? (
                  <div className="mt-1">
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                      {dayData.presentCount}/{dayData.totalMembers} {locale === 'en' ? 'present' : 'có mặt'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {dayData.absentCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      )}
                      <span className="text-[9px] text-slate-400">
                        {dayData.sessions[0]?.time}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto">
                    <span className="text-[10px] text-slate-400 dark:text-slate-600 italic">
                      {locale === 'en' ? 'No class' : 'Không có ca'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">{locale === 'en' ? 'High Attendance (≥ 90%)' : 'Chuyên cần cao (≥ 90%)'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-600 dark:text-slate-400">{locale === 'en' ? 'Good (80 - 89%)' : 'Khá (80 - 89%)'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-400">{locale === 'en' ? 'Attention (< 80%)' : 'Cần nhắc nhở (< 80%)'}</span>
            </div>
          </div>

          <div className="text-slate-500 text-[11px] italic">
            {locale === 'en' ? 'Click on any day to inspect session roster' : 'Bấm vào ngày có ca học để xem chi tiết danh sách điểm danh'}
          </div>
        </div>
      </div>

      {/* 4. Session Detail Drilldown Dialog */}
      <Dialog
        open={Boolean(selectedDayDetail)}
        onClose={() => setSelectedDayDetail(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1rem',
              p: 1,
            },
          },
        }}
      >
        {selectedDayDetail && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {locale === 'en' ? `Attendance Log — Day ${selectedDayDetail.date}` : `Nhật Ký Điểm Danh — Ngày ${selectedDayDetail.date}`}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedDayDetail.presentCount}/{selectedDayDetail.totalMembers} học viên có mặt ({selectedDayDetail.rate}%)
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    selectedDayDetail.rate >= 90
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {selectedDayDetail.rate}% chuyên cần
                </span>
              </div>
            </DialogTitle>

            <DialogContent dividers sx={{ py: 2 }}>
              <div className="space-y-4">
                {selectedDayDetail.sessions.map((sess) => (
                  <div key={sess.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[#2538D9] dark:text-indigo-400">{sess.groupName}</span>
                      <span className="text-xs text-slate-500 font-medium">{sess.time}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Có mặt: {sess.present} học viên</span>
                      </div>
                      <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        <span>Vắng: {sess.total - sess.present} học viên</span>
                      </div>
                    </div>

                    {sess.absentees.length > 0 ? (
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                          Danh sách học viên vắng:
                        </span>
                        <div className="space-y-1.5">
                          {sess.absentees.map((a, aIdx) => (
                            <div key={aIdx} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-700 text-xs">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{a.name}</span>
                              <span className="text-[11px] text-rose-600 font-medium">{a.reason || 'Không rõ lý do'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>100% học viên đã điểm danh đầy đủ!</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 1.5 }}>
              <Button onClick={() => setSelectedDayDetail(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                {locale === 'en' ? 'Close' : 'Đóng'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
