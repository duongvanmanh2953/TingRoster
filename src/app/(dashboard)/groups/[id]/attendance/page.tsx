'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  Check,
  X,
  UserPlus,
  RefreshCw,
  Search,
  CheckCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Table as TableIcon
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { Avatar } from '@/components/common/Avatar';
import { TingSelect } from '@/components/common/Select';
import { AttendanceCalendarHeatmap } from '@/components/attendance/AttendanceCalendarHeatmap';
import { formatVND } from '@/lib/utils';

interface SpaceDetail {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  themeColor?: string | null;
  enabledModules?: string | null;
  defaultFee: number;
  members: Array<{ id: string; name: string; phone?: string | null }>;
}

interface MemberItem {
  id: string;
  name: string;
  phone?: string | null;
  parentName?: string | null;
  code?: string;
}

interface AttendanceRecord {
  id?: string;
  memberId: string;
  date: string;
  isPresent: boolean;
  status: 'PRESENT' | 'ABSENT_CHARGED' | 'ABSENT_EXCUSED' | 'MAKEUP' | 'HOLIDAY';
  note?: string | null;
}

export default function SpaceAttendancePage() {
  const params = useParams();
  const groupId = params?.id as string;

  const [space, setSpace] = useState<SpaceDetail | null>(null);
  const [rangeMode, setRangeMode] = useState<'2_WEEKS' | '1_WEEK'>('2_WEEKS');
  const [viewType, setViewType] = useState<'MATRIX' | 'CALENDAR'>('MATRIX');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);

  const [anchorDate, setAnchorDate] = useState<string>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  });

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [matrixData, setMatrixData] = useState<Record<string, AttendanceRecord>>({});
  const [quickDate, setQuickDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quickStatus, setQuickStatus] = useState<'PRESENT' | 'ABSENT_CHARGED' | 'ABSENT_EXCUSED'>('PRESENT');

  const daysCount = rangeMode === '2_WEEKS' ? 14 : 7;
  const dayColumns = useMemo(() => {
    const cols = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const start = new Date(anchorDate);
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < daysCount; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      const dateStr = cur.toISOString().split('T')[0];
      const dayOfWeek = cur.getDay();

      cols.push({
        dateStr,
        dayLabel: dayNames[dayOfWeek],
        dayNumber: cur.getDate().toString().padStart(2, '0'),
        month: cur.getMonth() + 1,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
    return cols;
  }, [anchorDate, daysCount]);

  const loadData = useCallback(async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const startStr = dayColumns[0]?.dateStr || anchorDate;
      const endStr = dayColumns[dayColumns.length - 1]?.dateStr || anchorDate;

      const [groupRes, memberRes, attRes] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/members?groupId=${groupId}`),
        fetch(`/api/attendance?groupId=${groupId}&startDate=${startStr}&endDate=${endStr}`),
      ]);

      const [groupJson, memberJson, attJson] = await Promise.all([
        groupRes.json(),
        memberRes.json(),
        attRes.json(),
      ]);

      if (groupJson.success) setSpace(groupJson.data);
      if (memberJson.success && Array.isArray(memberJson.data)) {
        setMembers(
          memberJson.data.map((m: MemberItem, idx: number) => ({
            ...m,
            code: m.code || `TR/${new Date().getFullYear()}/${(idx + 1).toString().padStart(4, '0')}`,
          }))
        );
      }

      const map: Record<string, AttendanceRecord> = {};
      if (attJson.success && Array.isArray(attJson.data)) {
        attJson.data.forEach((att: AttendanceRecord & { date: string }) => {
          const dStr = att.date.split('T')[0];
          map[`${att.memberId}_${dStr}`] = {
            id: att.id,
            memberId: att.memberId,
            date: dStr,
            isPresent: att.isPresent,
            status: att.status || (att.isPresent ? 'PRESENT' : 'ABSENT_CHARGED'),
            note: att.note,
          };
        });
      }
      setMatrixData(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId, dayColumns, anchorDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleCell = async (memberId: string, dateStr: string) => {
    const key = `${memberId}_${dateStr}`;
    const current = matrixData[key];
    const nextStatus: 'PRESENT' | 'ABSENT_CHARGED' | 'ABSENT_EXCUSED' =
      !current || current.status === 'ABSENT_EXCUSED'
        ? 'PRESENT'
        : current.status === 'PRESENT'
        ? 'ABSENT_CHARGED'
        : 'ABSENT_EXCUSED';

    const optimisticRecord: AttendanceRecord = {
      memberId,
      date: dateStr,
      isPresent: nextStatus === 'PRESENT',
      status: nextStatus,
    };

    setMatrixData((prev) => ({ ...prev, [key]: optimisticRecord }));
    setSavingKey(key);

    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          date: dateStr,
          isPresent: nextStatus === 'PRESENT',
          status: nextStatus,
        }),
      });
    } catch {
      // rollback if failed
      if (current) {
        setMatrixData((prev) => ({ ...prev, [key]: current }));
      }
    } finally {
      setSavingKey(null);
    }
  };

  const handleQuickMarkDate = async () => {
    if (!groupId || members.length === 0) return;
    setBulkSaving(true);
    try {
      const attendances = members.map((m) => ({
        memberId: m.id,
        date: quickDate,
        isPresent: quickStatus === 'PRESENT',
        status: quickStatus,
      }));

      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, date: quickDate, attendances }),
      });

      if (res.ok) {
        setMatrixData((prev) => {
          const updated = { ...prev };
          attendances.forEach((a) => {
            updated[`${a.memberId}_${quickDate}`] = {
              memberId: a.memberId,
              date: quickDate,
              isPresent: a.isPresent,
              status: a.status,
            };
          });
          return updated;
        });
      }
    } finally {
      setBulkSaving(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(q) || m.phone?.includes(q) || m.code?.toLowerCase().includes(q));
  }, [members, search]);

  const shiftWeeks = (weeks: number) => {
    const d = new Date(anchorDate);
    d.setDate(d.getDate() + weeks * 7);
    setAnchorDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {space && (
        <SpaceNavHeader
          space={{
            ...space,
            memberCount: members.length,
          }}
          activeSection="attendance"
        />
      )}

      {/* View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewType('MATRIX')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewType === 'MATRIX'
                ? 'bg-white dark:bg-slate-900 text-[#2538D9] dark:text-indigo-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Ma trận đa ngày ({rangeMode === '2_WEEKS' ? '14 ngày' : '7 ngày'})</span>
          </button>

          <button
            onClick={() => setViewType('CALENDAR')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewType === 'CALENDAR'
                ? 'bg-white dark:bg-slate-900 text-[#2538D9] dark:text-indigo-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Lịch tháng</span>
          </button>
        </div>

        {/* Quick actions & Search */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm học sinh theo tên / SĐT..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#2538D9]"
            />
          </div>
        </div>
      </div>

      {viewType === 'CALENDAR' ? (
        <AttendanceCalendarHeatmap
          groupOptions={space ? [{ id: space.id, name: space.name }] : []}
          selectedGroupId={groupId}
          onSelectGroup={() => {}}
        />
      ) : (
        <div className="space-y-4">
          {/* Quick Mark Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-orange-500" />
                Ghi nhận nhanh cả lớp:
              </span>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  sx={{ borderRadius: '0.6rem', fontSize: '0.75rem', height: 34 }}
                >
                  {dayColumns.map((col) => (
                    <MenuItem key={col.dateStr} value={col.dateStr} sx={{ fontSize: '0.75rem' }}>
                      {col.dayLabel} {col.dayNumber}/{col.month} {col.isToday ? '(Hôm nay)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <span className="text-slate-500">là:</span>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={quickStatus}
                  onChange={(e) => setQuickStatus(e.target.value as any)}
                  sx={{ borderRadius: '0.6rem', fontSize: '0.75rem', height: 34 }}
                >
                  <MenuItem value="PRESENT" sx={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>✓ Có mặt (P)</MenuItem>
                  <MenuItem value="ABSENT_CHARGED" sx={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}>✕ Vắng mặt (A)</MenuItem>
                  <MenuItem value="ABSENT_EXCUSED" sx={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>◷ Nghỉ phép (L)</MenuItem>
                </Select>
              </FormControl>

              <button
                onClick={handleQuickMarkDate}
                disabled={bulkSaving || members.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {bulkSaving ? <CircularProgress size={12} color="inherit" /> : <CheckCheck className="w-3.5 h-3.5" />}
                <span>Điểm danh toàn bộ</span>
              </button>
            </div>

            {/* Date range navigators */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => shiftWeeks(-1)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {dayColumns[0]?.dayNumber}/{dayColumns[0]?.month} — {dayColumns[dayColumns.length - 1]?.dayNumber}/{dayColumns[dayColumns.length - 1]?.month}
              </span>

              <button
                onClick={() => shiftWeeks(1)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Matrix Table with Sticky Columns */}
          <div className="p-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-20 text-center space-y-2">
                <CircularProgress size={28} sx={{ color: '#2538D9' }} />
                <p className="text-xs text-slate-400">Đang tải bảng điểm danh không gian...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Không tìm thấy thành viên</p>
                <Link
                  href={`/groups/${groupId}/members`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2538D9] text-white text-xs font-bold"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Thêm thành viên vào không gian</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E4E7EC] dark:border-slate-800 text-slate-500 font-semibold text-[11px] sticky top-0 z-30">
                    <tr>
                      <th className="sticky left-0 z-40 bg-[#F8FAFC] dark:bg-slate-900 py-3 px-3.5 w-28 whitespace-nowrap border-r border-[#E4E7EC] dark:border-slate-800 shadow-xs">Mã HV</th>
                      <th className="sticky left-28 z-40 bg-[#F8FAFC] dark:bg-slate-900 py-3 px-3.5 min-w-[160px] whitespace-nowrap border-r-2 border-[#E4E7EC] dark:border-slate-800 shadow-sm">Học viên</th>

                      {dayColumns.map((col) => (
                        <th
                          key={col.dateStr}
                          className={`py-2 px-1 text-center min-w-[38px] transition-colors ${
                            col.isToday
                              ? 'bg-[#2538D9]/10 text-[#2538D9] font-bold border-x border-[#2538D9]/20'
                              : col.isWeekend
                              ? 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span className="block text-[10px] uppercase font-bold">{col.dayLabel}</span>
                          <span className="block text-xs font-bold tabular-nums mt-0.5">{col.dayNumber}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E4E7EC] dark:divide-slate-800">
                    {filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 py-3 px-3.5 font-bold tabular-nums text-slate-500 whitespace-nowrap text-[11px] border-r border-[#E4E7EC] dark:border-slate-800 shadow-xs">
                          {m.code}
                        </td>
                        <td className="sticky left-28 z-10 bg-white dark:bg-slate-900 py-3 px-3.5 whitespace-nowrap border-r-2 border-[#E4E7EC] dark:border-slate-800 shadow-sm">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={m.name} size="xs" />
                            <div>
                              <Link
                                href={`/members/${m.id}`}
                                className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#2538D9] block leading-tight text-xs"
                              >
                                {m.name}
                              </Link>
                              {m.phone && (
                                <span className="text-[10px] text-slate-400 tabular-nums block font-normal">
                                  {m.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {dayColumns.map((col) => {
                          const cellKey = `${m.id}_${col.dateStr}`;
                          const record = matrixData[cellKey];
                          const isSaving = savingKey === cellKey;
                          const status = record?.status;

                          return (
                            <td
                              key={cellKey}
                              onClick={() => handleToggleCell(m.id, col.dateStr)}
                              className={`py-2 px-1 text-center cursor-pointer select-none transition-all ${
                                col.isToday ? 'bg-[#2538D9]/5' : ''
                              } hover:bg-slate-100 dark:hover:bg-slate-800`}
                            >
                              {isSaving ? (
                                <CircularProgress size={12} color="inherit" />
                              ) : status === 'PRESENT' ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">
                                  P
                                </span>
                              ) : status === 'ABSENT_CHARGED' ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-300">
                                  A
                                </span>
                              ) : status === 'ABSENT_EXCUSED' ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300">
                                  L
                                </span>
                              ) : col.isWeekend ? (
                                <span className="text-slate-300 dark:text-slate-600">—</span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600">·</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Status Legend */}
            <div className="p-3.5 bg-[#F8FAFC] dark:bg-slate-900 border-t border-[#E4E7EC] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-slate-800 dark:text-slate-200">Ký hiệu:</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">P</span> Có mặt</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-5 h-5 rounded bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[10px]">A</span> Vắng tính phí</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-5 h-5 rounded bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">L</span> Nghỉ phép</span>
              </div>
              <div className="text-[11px] text-slate-400 italic">
                * Nhấp trực tiếp vào ô để chuyển trạng thái [P → A → L]
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
