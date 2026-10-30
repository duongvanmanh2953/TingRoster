'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Users,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatVND } from '@/lib/utils';

export default function SpaceEducationReportPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [spaceRes, classRes, invRes, attRes] = await Promise.all([
          fetch(`/api/groups/${spaceId}`),
          fetch(`/api/groups/${spaceId}/classes`),
          fetch(`/api/invoices?groupId=${spaceId}`),
          fetch(`/api/attendance?groupId=${spaceId}`),
        ]);
        const [spaceJson, classJson, invJson, attJson] = await Promise.all([
          spaceRes.json(),
          classRes.json(),
          invRes.json(),
          attRes.json(),
        ]);

        if (spaceJson.success) setSpace(spaceJson.data);
        if (classJson.success) {
          setClasses(classJson.data || []);
          setTotalStudents(classJson.totalStudents || 0);
        }
        if (invJson.success) setInvoices(invJson.data || []);
        if (attJson.success) setAttendances(attJson.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (spaceId) {
      loadData();
    }
  }, [spaceId]);

  // Aggregate metrics
  const activeClasses = classes.filter((c) => c.status === 'ACTIVE');
  const totalTuitionProjected = activeClasses.reduce((sum, c) => sum + (c.feePerPeriod || 0) * (c.maxCapacity || 0), 0);
  const totalTuitionBilled = invoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);
  const totalTuitionCollected = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);

  const presentCount = attendances.filter((a) => a.isPresent || a.status === 'PRESENT').length;
  const attendanceRate = attendances.length > 0 ? Math.round((presentCount / attendances.length) * 100) : 0;

  const filteredClasses = useMemo(() => {
    if (!search.trim()) return classes;
    const q = search.toLowerCase();
    return classes.filter(
      (c) =>
        c.className.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        (c.teacherName && c.teacherName.toLowerCase().includes(q))
    );
  }, [classes, search]);

  const handleExportCSV = () => {
    const headers = ['Tên lớp học', 'Môn học', 'Giáo viên', 'Phòng học', 'Lịch học', 'Sĩ số tối đa', 'Học phí / kỳ (VND)', 'Trạng thái'];
    const rows = filteredClasses.map((c) => [
      `"${c.className}"`,
      `"${c.subject}"`,
      `"${c.teacherName || 'Chưa phân công'}"`,
      `"${c.room || '---'}"`,
      `"${c.schedule || '---'}"`,
      c.maxCapacity,
      c.feePerPeriod,
      c.status === 'ACTIVE' ? 'Đang giảng dạy' : 'Kết thúc',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bao_cao_giao_duc_${space?.code || spaceId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {space && (
        <SpaceNavHeader
          space={{
            id: space.id,
            name: space.name,
            slug: space.slug || space.id,
            code: space.code,
            groupType: 'CLASS',
          }}
          activeSection="reports"
        />
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/groups/${spaceId}/reports`}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Báo cáo Giáo dục, Sĩ số & Học phí</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-6">
            Thống kê sĩ số học viên, số lớp học đang mở, tỷ lệ chuyên cần và học phí thu được theo khóa học.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Xuất báo cáo Excel / CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Học viên hoạt động</span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
            {totalStudents} học viên
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Đang theo học tại {activeClasses.length} lớp</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tỷ lệ chuyên cần</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono tabular-nums">
            {attendanceRate}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Dựa trên {attendances.length} lượt điểm danh</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Học phí đã thu</span>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2 font-mono tabular-nums">
            {formatVND(totalTuitionCollected)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Phải thu: {formatVND(totalTuitionBilled)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Số lớp học</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
            {classes.length} lớp
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Đang mở tuyển sinh & đào tạo</p>
        </div>
      </div>

      {/* Filter and search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên lớp, môn học hoặc giáo viên..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <p className="text-xs font-bold text-slate-500">
          Tổng cộng: <span className="font-mono text-slate-900 dark:text-white">{filteredClasses.length} lớp</span>
        </p>
      </div>

      {/* Classes Detail Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <p className="text-xs">Đang tải báo cáo lớp học...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">Chưa có lớp học nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Lớp học</th>
                  <th className="py-3 px-4">Môn học</th>
                  <th className="py-3 px-4">Giáo viên</th>
                  <th className="py-3 px-4">Phòng</th>
                  <th className="py-3 px-4">Lịch học</th>
                  <th className="py-3 px-4 text-center">Sĩ số tối đa</th>
                  <th className="py-3 px-4 text-right">Học phí / kỳ</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {cls.className}
                    </td>
                    <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-bold">
                      {cls.subject}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {cls.teacherName || 'Chưa phân công'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {cls.room || '---'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {cls.schedule || '---'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                      {cls.maxCapacity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white tabular-nums">
                      {formatVND(cls.feePerPeriod)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cls.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {cls.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {cls.status === 'ACTIVE' ? 'Đang mở' : 'Kết thúc'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
