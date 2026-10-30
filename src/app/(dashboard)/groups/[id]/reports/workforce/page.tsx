'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  Search,
  Download,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatDateVN } from '@/lib/utils';
import CircularProgress from '@mui/material/CircularProgress';

interface ShiftAssignmentItem {
  id: string;
  shiftId: string;
  userId: string;
  userName: string;
  status: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  checkInSource?: string | null;
  checkOutSource?: string | null;
  notes?: string | null;
  shift: {
    id: string;
    name: string;
    shiftDate: string;
    startTime: string;
    endTime: string;
    location?: string | null;
  };
}

export default function SpaceWorkforceReportPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [spaceRes, shiftRes] = await Promise.all([
          fetch(`/api/groups/${spaceId}`),
          fetch(`/api/groups/${spaceId}/shifts`),
        ]);
        const [spaceJson, shiftJson] = await Promise.all([spaceRes.json(), shiftRes.json()]);

        if (spaceJson.success) setSpace(spaceJson.data);
        if (shiftJson.success && Array.isArray(shiftJson.data)) {
          setShifts(shiftJson.data);
        }
      } catch (err) {
        console.error('Fetch workforce report error:', err);
      } finally {
        setLoading(false);
      }
    }
    if (spaceId) {
      loadData();
    }
  }, [spaceId]);

  // Flatten shift assignments
  const allAssignments: ShiftAssignmentItem[] = useMemo(() => {
    const list: ShiftAssignmentItem[] = [];
    shifts.forEach((s) => {
      if (s.assignments && Array.isArray(s.assignments)) {
        s.assignments.forEach((a: any) => {
          list.push({
            ...a,
            shift: {
              id: s.id,
              name: s.name,
              shiftDate: s.shiftDate,
              startTime: s.startTime,
              endTime: s.endTime,
              location: s.location,
            },
          });
        });
      }
    });
    return list;
  }, [shifts]);

  const filteredAssignments = useMemo(() => {
    return allAssignments.filter((it) => {
      const matchSearch =
        it.userName.toLowerCase().includes(search.toLowerCase()) ||
        it.shift.name.toLowerCase().includes(search.toLowerCase()) ||
        (it.shift.location && it.shift.location.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'CHECKED_IN' && it.checkInTime) ||
        (statusFilter === 'CHECKED_OUT' && it.checkOutTime) ||
        (statusFilter === 'PENDING' && !it.checkInTime);

      return matchSearch && matchStatus;
    });
  }, [allAssignments, search, statusFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalShifts = shifts.length;
    const totalAssignments = allAssignments.length;
    const checkedInCount = allAssignments.filter((a) => a.checkInTime).length;
    const checkedOutCount = allAssignments.filter((a) => a.checkOutTime).length;

    let totalMinutesWorked = 0;
    allAssignments.forEach((a) => {
      if (a.checkInTime && a.checkOutTime) {
        const inTime = new Date(a.checkInTime).getTime();
        const outTime = new Date(a.checkOutTime).getTime();
        const diffMin = Math.max(0, Math.round((outTime - inTime) / 60000));
        totalMinutesWorked += diffMin;
      }
    });

    const totalHours = (totalMinutesWorked / 60).toFixed(1);
    const completionRate =
      totalAssignments > 0 ? Math.round((checkedInCount / totalAssignments) * 100) : 100;

    return {
      totalShifts,
      totalAssignments,
      checkedInCount,
      checkedOutCount,
      totalHours,
      completionRate,
    };
  }, [shifts, allAssignments]);

  const handleExportCSV = () => {
    const headers = ['Ca làm việc', 'Ngày', 'Khung giờ', 'Nhân viên', 'Giờ vào thực tế', 'Giờ ra thực tế', 'Nguồn'];
    const rows = filteredAssignments.map((a) => [
      a.shift.name,
      formatDateVN(a.shift.shiftDate),
      `${a.shift.startTime} - ${a.shift.endTime}`,
      a.userName,
      a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('vi-VN') : 'Chưa vào',
      a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString('vi-VN') : 'Chưa ra',
      a.checkInSource || 'Kiosk',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_cao_nhan_su_${space?.code || 'TR'}.csv`);
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
            groupType: space.groupType,
          }}
          activeSection="reports"
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href={`/groups/${spaceId}/reports`} className="hover:text-[#2538D9] transition">
              Báo cáo không gian
            </Link>
            <span>/</span>
            <span className="font-bold text-slate-900 dark:text-white">Báo cáo nhân sự & ca làm việc</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#2538D9]" />
            <span>Phân tích Giờ công & Chuyên cần Nhân sự</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi phân bổ ca làm, đối soát giờ check-in / check-out thực tế tại Kiosk và tổng số giờ công lao động.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={allAssignments.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Xuất báo cáo CSV
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Tổng số ca trực</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {stats.totalShifts} ca
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Lượt nhận ca làm</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {stats.totalAssignments} lượt
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Tỷ lệ vào ca</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {stats.completionRate}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Tổng giờ công ghi nhận</div>
          <div className="text-xl font-bold text-[#2538D9] dark:text-indigo-400 mt-1 tabular-nums">
            {stats.totalHours} giờ
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'CHECKED_IN', label: 'Đã vào ca' },
            { key: 'CHECKED_OUT', label: 'Đã hoàn tất ca' },
            { key: 'PENDING', label: 'Chưa vào ca' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-[#2538D9] text-white'
                  : 'bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo nhân viên, tên ca..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/10">
          <CircularProgress size={28} />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/10">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không có dữ liệu ca làm việc</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Các ca trực được tạo trong module Nhân sự & Chấm công sẽ xuất hiện tại đây sau khi nhân viên nhận ca.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Tên ca & Ngày trực</th>
                  <th className="py-3 px-4">Khung giờ quy định</th>
                  <th className="py-3 px-4">Nhân viên trực</th>
                  <th className="py-3 px-4">Giờ vào thực tế</th>
                  <th className="py-3 px-4">Giờ ra thực tế</th>
                  <th className="py-3 px-4">Nguồn xác nhận</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredAssignments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <div>{item.shift.name}</div>
                      <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                        {formatDateVN(item.shift.shiftDate)}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {item.shift.startTime} - {item.shift.endTime}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {item.userName}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {item.checkInTime ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {new Date(item.checkInTime).toLocaleTimeString('vi-VN')}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa check-in</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {item.checkOutTime ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          {new Date(item.checkOutTime).toLocaleTimeString('vi-VN')}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa check-out</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {item.checkInSource || 'Kiosk'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.checkOutTime ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3" />
                          Hoàn tất ca
                        </span>
                      ) : item.checkInTime ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          Đang trực
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          Chưa vào ca
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
