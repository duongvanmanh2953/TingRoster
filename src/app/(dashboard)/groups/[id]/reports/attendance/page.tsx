'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Search,
  Loader2,
  Calendar
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';

export default function SpaceAttendanceReportPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [spaceRes, attRes] = await Promise.all([
          fetch(`/api/groups/${spaceId}`),
          fetch(`/api/attendance?groupId=${spaceId}`),
        ]);
        const [spaceJson, attJson] = await Promise.all([spaceRes.json(), attRes.json()]);

        if (spaceJson.success) setSpace(spaceJson.data);
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

  const totalSessions = attendances.length;
  const presentCount = attendances.filter((a) => a.isPresent || a.status === 'PRESENT').length;
  const absentChargedCount = attendances.filter((a) => a.status === 'ABSENT_CHARGED').length;
  const absentExcusedCount = attendances.filter((a) => a.status === 'ABSENT_EXCUSED').length;
  const makeupCount = attendances.filter((a) => a.status === 'MAKEUP').length;
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href={`/groups/${spaceId}/reports`} className="hover:text-blue-600 transition">
              Báo cáo không gian
            </Link>
            <span>/</span>
            <span className="font-bold text-slate-900 dark:text-white">Báo cáo chuyên cần & Điểm danh</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <span>Phân tích Tỷ lệ Tham gia & Chuyên cần</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Đánh giá tỷ lệ có mặt, số buổi vắng có phép / không phép và học bù trong không gian này.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng lượt điểm danh</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {totalSessions} lượt
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Có mặt (Chuyên cần)</div>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono tabular-nums">
            {presentCount} ({attendanceRate}%)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-amber-700 dark:text-amber-400">Vắng có phép / Học bù</div>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono tabular-nums">
            {absentExcusedCount + makeupCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-rose-700 dark:text-rose-400">Vắng không phép</div>
          <div className="text-2xl font-black text-rose-600 mt-1 font-mono tabular-nums">
            {absentChargedCount}
          </div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
          Nhật ký điểm danh chi tiết
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Đang tải nhật ký điểm danh...</span>
          </div>
        ) : attendances.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            Chưa có dữ liệu điểm danh nào trong không gian này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-4">Ngày điểm danh</th>
                  <th className="py-3 px-4">Thành viên</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendances.slice(0, 50).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {new Date(a.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{a.member?.name}</div>
                      <div className="text-[11px] text-slate-400">{a.member?.phone || '—'}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : a.status === 'ABSENT_EXCUSED'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : a.status === 'MAKEUP'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}>
                        {a.status === 'PRESENT' ? 'Có mặt' : a.status === 'ABSENT_EXCUSED' ? 'Vắng có phép' : a.status === 'MAKEUP' ? 'Học bù' : 'Vắng trừ phí'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {a.note || '—'}
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
