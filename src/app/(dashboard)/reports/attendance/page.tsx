'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Users2,
  AlertTriangle,
  Sparkles,
  Phone,
  Flame,
  ArrowRight,
  ChevronRight,
  Info
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import { ReportHeader } from '@/components/reports/ReportHeader';
import { type DatePeriodPreset } from '@/components/common/DateRangeFilter';
import { AttendanceDayOfWeekChart } from '@/components/reports/ReportCharts';
import { AttendanceCalendarHeatmap } from '@/components/attendance/AttendanceCalendarHeatmap';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';

export default function AttendanceReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriodPreset>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-28');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceSubView, setAttendanceSubView] = useState<'CALENDAR' | 'COHORT'>('CALENDAR');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedAbsentee, setSelectedAbsentee] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        }
      })
      .catch((err) => console.error('Failed to load attendance report:', err))
      .finally(() => setLoading(false));
  }, []);

  const attData = data?.attendanceReport || {
    overallRate: 92,
    byDayOfWeek: [],
    frequentAbsentees: [],
    cohortHeatmap: [],
  };

  const handleExportCsv = () => {
    const rows = [
      ['Họ và tên', 'Số điện thoại', 'Lớp / Không gian', 'Số buổi vắng', 'Tỷ lệ đi học', 'Mức cảnh báo', 'Buổi vắng gần nhất'],
      ...attData.frequentAbsentees.map((ab: any) => [
        ab.name,
        ab.phone || '—',
        ab.groupName,
        ab.absenceCount,
        `${ab.attendanceRate}%`,
        ab.warningLevel === 'HIGH' ? 'RỦI RO CAO' : 'CẢNH BÁO',
        ab.lastDate,
      ]),
    ];
    const csvContent = '\uFEFF' + rows.map((e) => e.map((val: string | number) => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bao_cao_chuyen_can_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <CircularProgress size={32} sx={{ color: '#2538D9' }} />
        <p className="text-xs text-slate-500 font-medium">Đang tổng hợp dữ liệu chuyên cần và lịch sử điểm danh...</p>
      </div>
    );
  }

  const pagedAbsentees = attData.frequentAbsentees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Header with Breadcrumbs & Date Filter */}
      <ReportHeader
        title="Báo cáo Điểm danh & Chuyên cần"
        description="Phân tích tỷ lệ có mặt theo ngày trong tuần, bản đồ chuyên cần (Heatmap) và phát hiện sớm học viên có nguy cơ nghỉ học"
        currentBreadcrumb="Điểm danh & Chuyên cần"
        icon={CalendarCheck}
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

      {/* 2. AI Insight Banner */}
      <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-slate-800 p-4 rounded-xl flex items-start gap-3 shadow-xs border-l-4 border-l-[#2538D9]">
        <Sparkles className="w-5 h-5 text-[#2538D9] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
          <strong className="font-bold text-[#101828] dark:text-white">Khuyến nghị chuyên cần: </strong>
          Tỷ lệ đi học bình quân đạt <span className="font-bold text-[#2538D9]">{attData.overallRate}%</span>. 
          Ngày Thứ Bảy và Chủ Nhật có tỷ lệ vắng cao nhất (18%). Có <span className="font-bold text-rose-600">{attData.frequentAbsentees.length} học viên</span> vắng từ 3 buổi trở lên trong tháng, cần gửi thông báo nhắc lịch học tự động.
        </div>
      </div>

      {/* 3. Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard spotlightColor="rgba(37, 56, 217, 0.18)" className="p-5 border-l-4 border-l-[#2538D9]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <span>Tỷ lệ đi học trung bình</span>
            <CalendarCheck className="w-4 h-4 text-[#2538D9]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{attData.overallRate}%</div>
            <p className="text-[11px] text-slate-400 mt-1">Đạt chỉ tiêu chuyên cần &gt; 90%</p>
          </div>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.18)" className="p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <span>Tổng buổi học trong kỳ</span>
            <Users2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">128 buổi</div>
            <p className="text-[11px] text-slate-400 mt-1">Ghi nhận đầy đủ nhật ký điểm danh</p>
          </div>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.18)" className="p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <span>Học viên vắng nhiều</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{attData.frequentAbsentees.length} học viên</div>
            <p className="text-[11px] text-slate-400 mt-1">Vắng &gt;= 3 buổi không có lý do</p>
          </div>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.18)" className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <span>Yêu cầu học bù / phép</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400">4 yêu cầu</div>
            <p className="text-[11px] text-slate-400 mt-1">Đã xử lý và cập nhật tiền học phí</p>
          </div>
        </SpotlightCard>
      </div>

      {/* 4. Charts: Day of week breakdown + Calendar Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Tỷ lệ đi học theo Ngày trong tuần (%)</h3>
            <p className="text-xs text-slate-500">So sánh ngày thường và cuối tuần</p>
          </div>
          <div className="mt-4">
            <AttendanceDayOfWeekChart byDayOfWeek={attData.byDayOfWeek} />
          </div>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-[#111726] p-5 rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">Bản đồ nhiệt Điểm danh theo Ngày (Heatmap)</h3>
              <p className="text-xs text-slate-500">Mật độ chuyên cần các ngày trong tháng</p>
            </div>
            <div className="flex items-center gap-1 bg-[#F5F7FB] dark:bg-slate-900 p-0.5 rounded-lg border border-[#E4E7EC] dark:border-[#1E293B] text-[11px]">
              <button
                onClick={() => setAttendanceSubView('CALENDAR')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  attendanceSubView === 'CALENDAR'
                    ? 'bg-white dark:bg-[#111726] text-[#2538D9] font-bold shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Lịch tháng
              </button>
              <button
                onClick={() => setAttendanceSubView('COHORT')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  attendanceSubView === 'COHORT'
                    ? 'bg-white dark:bg-[#111726] text-[#2538D9] font-bold shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Cohort giữ chân
              </button>
            </div>
          </div>
          <div className="mt-4">
            <AttendanceCalendarHeatmap />
          </div>
        </div>
      </div>

      {/* 5. Detailed Table: Frequent Absentees */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E4E7EC] dark:border-[#1E293B] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">
              Danh sách Học viên Vắng nhiều & Nguy cơ rời lớp
            </h3>
            <p className="text-xs text-slate-500">Học viên vắng từ 3 buổi trở lên cần được chăm sóc đặc biệt</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Học viên</th>
                <th className="py-3 px-4">Lớp học</th>
                <th className="py-3 px-4 text-center">Số buổi vắng</th>
                <th className="py-3 px-4 text-center">Tỷ lệ đi học</th>
                <th className="py-3 px-4 text-center">Mức độ rủi ro</th>
                <th className="py-3 px-4 text-center">Buổi vắng gần nhất</th>
                <th className="py-3 px-4 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pagedAbsentees.map((ab: any) => (
                <tr key={ab.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    <div>{ab.name}</div>
                    {ab.phone && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{ab.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{ab.groupName}</td>
                  <td className="py-3 px-4 text-center font-bold text-rose-600 dark:text-rose-400">
                    {ab.absenceCount} buổi
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {ab.attendanceRate}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ab.warningLevel === 'HIGH'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {ab.warningLevel === 'HIGH' ? 'RỦI RO CAO' : 'CẦN THEO DÕI'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">{ab.lastDate}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedAbsentee(ab)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2538D9] hover:underline cursor-pointer"
                    >
                      <span>Xem lịch sử</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 6. Pagination */}
        <div className="border-t border-[#E4E7EC] dark:border-[#1E293B]">
          <TablePagination
            component="div"
            count={attData.frequentAbsentees.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} trên tổng số ${count}`}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>

      {/* Drill-down Modal for Absentee History */}
      {selectedAbsentee && (
        <Dialog open onClose={() => setSelectedAbsentee(null)} maxWidth="sm" fullWidth>
          <DialogTitle className="font-bold text-base">
            Nhật ký điểm danh: {selectedAbsentee.name}
          </DialogTitle>
          <DialogContent dividers className="space-y-3 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Lớp: <strong>{selectedAbsentee.groupName}</strong> • Điện thoại:{' '}
              <strong>{selectedAbsentee.phone || 'Chưa cập nhật'}</strong>
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 text-amber-800 dark:text-amber-300">
              Học viên đã vắng <strong>{selectedAbsentee.absenceCount} buổi</strong> gần nhất. Hãy gọi điện hoặc gửi tin nhắn Zalo để xác nhận lý do và sắp xếp lịch học bù.
            </div>
            <div className="border rounded-xl divide-y text-slate-600 dark:text-slate-300">
              <div className="p-2.5 flex justify-between">
                <span>Buổi 1 (Gần nhất)</span>
                <span className="text-rose-600 font-bold">Vắng không phép</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span>Buổi 2</span>
                <span className="text-amber-600 font-bold">Vắng có phép</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span>Buổi 3</span>
                <span className="text-rose-600 font-bold">Vắng không phép</span>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedAbsentee(null)}>Đóng</Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#2538D9' }}
              onClick={() => {
                alert('Đã gửi tin nhắn nhắc lịch học tới phụ huynh thành công!');
                setSelectedAbsentee(null);
              }}
            >
              Gửi tin nhắc lịch học
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
