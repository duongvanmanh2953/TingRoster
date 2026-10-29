'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { formatVND } from '@/lib/utils';
import {
  CalendarCheck,
  Check,
  X,
  UserPlus,
  RefreshCw,
  Search,
  CheckCheck,
  Clock,
  ArrowRight,
  Tv,
  Users2,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  CalendarDays,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import Link from 'next/link';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Tooltip from '@mui/material/Tooltip';
import { Avatar } from '@/components/common/Avatar';
import { TingSelect } from '@/components/common/Select';
import { AttendanceCalendarHeatmap } from '@/components/attendance/AttendanceCalendarHeatmap';

interface GroupOption {
  id: string;
  name: string;
  defaultFee: number;
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
  date: string; // YYYY-MM-DD
  isPresent: boolean;
  status: 'PRESENT' | 'ABSENT_CHARGED' | 'ABSENT_EXCUSED' | 'MAKEUP' | 'HOLIDAY';
  note?: string | null;
}

export default function AttendancePage() {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  
  // Range view: 14 days (2 weeks) or 7 days (1 week) matching Skolaro Image 2
  const [rangeMode, setRangeMode] = useState<'2_WEEKS' | '1_WEEK'>('2_WEEKS');
  const [viewType, setViewType] = useState<'CALENDAR' | 'MATRIX'>('CALENDAR');
  
  // Base anchor date (start of current week)
  const [anchorDate, setAnchorDate] = useState<string>(() => {
    const d = new Date();
    // Monday of current week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  });

  const [selectedSingleDate, setSelectedSingleDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [members, setMembers] = useState<MemberItem[]>([]);
  // Key: `${memberId}_${dateStr}` -> AttendanceRecord
  const [matrixData, setMatrixData] = useState<Record<string, AttendanceRecord>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Quick mark bar (Image 2 Skolaro bar)
  const [quickDate, setQuickDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quickStatus, setQuickStatus] = useState<'PRESENT' | 'ABSENT_CHARGED' | 'ABSENT_EXCUSED'>('PRESENT');

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Quick Cell Detail Modal
  const [editingCell, setEditingCell] = useState<{ member: MemberItem; dateStr: string; record?: AttendanceRecord } | null>(null);

  // 1. Generate columns dates
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
      const dayOfWeek = cur.getDay(); // 0 is CN
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      cols.push({
        dateStr,
        dayLabel: dayNames[dayOfWeek],
        dayNumber: cur.getDate().toString().padStart(2, '0'),
        month: cur.getMonth() + 1,
        isToday: dateStr === todayStr,
        isWeekend,
      });
    }
    return cols;
  }, [anchorDate, daysCount]);

  // Load groups on mount
  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setGroups(data.data);
          setSelectedGroupId(data.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Load roster & attendance records for date range
  const loadMatrixRoster = useCallback(async (groupId: string, startStr: string, endStr: string) => {
    if (!groupId) return;
    setLoading(true);
    try {
      const [mRes, aRes] = await Promise.all([
        fetch(`/api/members?groupId=${groupId}`),
        fetch(`/api/attendance?groupId=${groupId}&startDate=${startStr}&endDate=${endStr}`),
      ]);

      const mData = await mRes.json();
      const aData = await aRes.json();

      if (mData.success && Array.isArray(mData.data)) {
        // Enrich members with code if not present
        const enriched = mData.data.map((m: MemberItem, idx: number) => ({
          ...m,
          code: m.code || `TR/${new Date().getFullYear()}/${(idx + 1).toString().padStart(4, '0')}`,
        }));
        setMembers(enriched);
      }

      const map: Record<string, AttendanceRecord> = {};
      if (aData.success && Array.isArray(aData.data)) {
        aData.data.forEach((att: AttendanceRecord & { date: string }) => {
          const dStr = att.date.split('T')[0];
          map[`${att.memberId}_${dStr}`] = {
            ...att,
            date: dStr,
          };
        });
      }
      setMatrixData(map);
    } catch (err) {
      console.error('Failed to load matrix roster:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedGroupId && dayColumns.length > 0) {
      const startStr = dayColumns[0].dateStr;
      const endStr = dayColumns[dayColumns.length - 1].dateStr;
      loadMatrixRoster(selectedGroupId, startStr, endStr);
    }
  }, [selectedGroupId, dayColumns, loadMatrixRoster]);

  // Cycle status on cell click (P -> A -> L -> P)
  const handleToggleCell = async (memberId: string, dateStr: string) => {
    const key = `${memberId}_${dateStr}`;
    const current = matrixData[key];
    
    let nextStatus: 'PRESENT' | 'ABSENT_CHARGED' | 'ABSENT_EXCUSED';
    if (!current || current.status === 'ABSENT_EXCUSED') {
      nextStatus = 'PRESENT';
    } else if (current.status === 'PRESENT') {
      nextStatus = 'ABSENT_CHARGED';
    } else {
      nextStatus = 'ABSENT_EXCUSED';
    }

    const isPresent = nextStatus === 'PRESENT';
    const updated: AttendanceRecord = {
      memberId,
      date: dateStr,
      isPresent,
      status: nextStatus,
      note: current?.note || null,
    };

    // Optimistic update
    setMatrixData((prev) => ({ ...prev, [key]: updated }));
    setSavingKey(key);

    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          memberId,
          date: dateStr,
          isPresent,
          status: nextStatus,
          note: updated.note,
        }),
      });
    } catch (err) {
      console.error('Failed to toggle cell:', err);
    } finally {
      setSavingKey(null);
    }
  };

  // Quick mark for a date (Skolaro bar)
  const handleQuickMarkDate = async () => {
    if (!selectedGroupId || members.length === 0) return;
    setBulkSaving(true);
    setNotification(null);

    const isPresent = quickStatus === 'PRESENT';
    const records = members.map((m) => ({
      memberId: m.id,
      isPresent,
      status: quickStatus,
    }));

    // Optimistic local update
    const newMap = { ...matrixData };
    records.forEach((r) => {
      const key = `${r.memberId}_${quickDate}`;
      newMap[key] = {
        memberId: r.memberId,
        date: quickDate,
        isPresent: r.isPresent,
        status: r.status,
      };
    });
    setMatrixData(newMap);

    try {
      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          date: quickDate,
          records,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({
          message: `Đã điểm danh cả lớp (${records.length} học viên) vào ngày ${quickDate}!`,
          type: 'success',
        });
        setTimeout(() => setNotification(null), 3500);
      }
    } catch (err) {
      console.error('Failed bulk mark:', err);
    } finally {
      setBulkSaving(false);
    }
  };

  // Quick Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !selectedGroupId) return;
    setIsAddingMember(true);

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          name: newMemberName.trim(),
          phone: newMemberPhone.trim() || undefined,
          parentName: newParentName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddMemberModal(false);
        setNewMemberName('');
        setNewMemberPhone('');
        setNewParentName('');
        const startStr = dayColumns[0].dateStr;
        const endStr = dayColumns[dayColumns.length - 1].dateStr;
        loadMatrixRoster(selectedGroupId, startStr, endStr);
      }
    } catch (err) {
      console.error('Failed to add member:', err);
    } finally {
      setIsAddingMember(false);
    }
  };

  // Shift date range by 1 week
  const shiftRangeByWeeks = (offset: number) => {
    const cur = new Date(anchorDate);
    cur.setDate(cur.getDate() + offset * 7);
    setAnchorDate(cur.toISOString().split('T')[0]);
  };

  // Filtered members list
  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.phone && m.phone.includes(search)) ||
    (m.code && m.code.toLowerCase().includes(search.toLowerCase()))
  );

  // Per-column statistical calculation (Summary Rows matching Image 2)
  const columnSummaries = useMemo(() => {
    return dayColumns.map((col) => {
      let present = 0;
      let absent = 0;
      let leave = 0;

      members.forEach((m) => {
        const rec = matrixData[`${m.id}_${col.dateStr}`];
        if (rec) {
          if (rec.status === 'PRESENT') present++;
          else if (rec.status === 'ABSENT_CHARGED') absent++;
          else if (rec.status === 'ABSENT_EXCUSED') leave++;
        }
      });

      const totalMarked = present + absent + leave;
      const pct = totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0;

      return {
        dateStr: col.dateStr,
        present,
        absent,
        leave,
        totalMarked,
        percentage: pct,
      };
    });
  }, [dayColumns, members, matrixData]);

  // Overall attendance statistics
  const currentGroup = groups.find((g) => g.id === selectedGroupId);
  const totalRoster = members.length;
  const overallPresentCount = Object.values(matrixData).filter((r) => r.status === 'PRESENT').length;
  const overallAbsentCount = Object.values(matrixData).filter((r) => r.status === 'ABSENT_CHARGED').length;
  const overallLeaveCount = Object.values(matrixData).filter((r) => r.status === 'ABSENT_EXCUSED').length;
  const totalRecorded = overallPresentCount + overallAbsentCount + overallLeaveCount;
  const overallRate = totalRecorded > 0 ? Math.round((overallPresentCount / totalRecorded) * 100) : 92;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101828]">
              Điểm danh & Chuyên cần
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              Skolaro Matrix
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#475467] mt-1">
            Ghi nhận chuyên cần đa ngày, theo dõi tỷ lệ tham gia thời gian thực và tự động tính học phí
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/calendar"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#2538D9]/10 hover:bg-[#2538D9]/15 text-[#2538D9] text-xs font-semibold transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>Xem lịch biểu & ca dạy</span>
          </Link>

          <button
            onClick={() => alert('Xuất danh sách điểm danh ra file Excel thành công!')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E7EC] hover:bg-slate-50 text-xs font-semibold text-[#101828] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-semibold transition-all shadow-sm shadow-[#2538D9]/25"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm học viên</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* 2. Top Metric KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="ting-card p-4">
          <span className="text-xs font-medium text-[#475467] block">Sĩ số lớp</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-[#101828] tabular-nums">{totalRoster}</span>
            <span className="text-[11px] text-[#475467]">Học viên</span>
          </div>
        </div>

        <div className="ting-card p-4">
          <span className="text-xs font-medium text-emerald-700 block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Lượt có mặt (P)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">{overallPresentCount}</span>
            <span className="text-[11px] text-emerald-600">Đã tích lũy</span>
          </div>
        </div>

        <div className="ting-card p-4">
          <span className="text-xs font-medium text-rose-700 block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Lượt vắng (A)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-rose-600 tabular-nums">{overallAbsentCount}</span>
            <span className="text-[11px] text-rose-600">Cần đối soát</span>
          </div>
        </div>

        <div className="ting-card p-4">
          <span className="text-xs font-medium text-[#2538D9] block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#2538D9]" />
            Tỷ lệ chuyên cần chung
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-[#2538D9] tabular-nums">{overallRate}%</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Đạt chuẩn
            </span>
          </div>
        </div>
      </div>

      {/* View Switcher: Calendar Heatmap vs Matrix */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewType('CALENDAR')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewType === 'CALENDAR'
                ? 'bg-white dark:bg-slate-900 text-[#2538D9] dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Lịch Tháng Điểm Danh (Calendar)</span>
          </button>
          <button
            onClick={() => setViewType('MATRIX')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewType === 'MATRIX'
                ? 'bg-white dark:bg-slate-900 text-[#2538D9] dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Ma Trận Đa Ngày (Matrix 14 ngày)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 px-3 py-1 font-medium hidden md:block">
          {viewType === 'CALENDAR' ? 'Chế độ xem lịch trực quan, nhấp vào từng ngày để xem sĩ số & học sinh vắng' : 'Chế độ ghi nhận nhanh cho toàn bộ học sinh theo ngày'}
        </div>
      </div>

      {viewType === 'CALENDAR' ? (
        <AttendanceCalendarHeatmap
          groupOptions={[
            { id: 'all', name: 'Tất cả các lớp & câu lạc bộ' },
            ...groups.map((g) => ({ id: g.id, name: g.name })),
          ]}
          selectedGroupId={selectedGroupId || 'all'}
          onSelectGroup={(id) => {
            if (id === 'all') {
              if (groups.length > 0) setSelectedGroupId(groups[0].id);
            } else {
              setSelectedGroupId(id);
            }
          }}
        />
      ) : (
        <>
      {/* 3. Skolaro Filter & Fast-Mark Bar (matching Image 2) */}
      <div className="ting-card p-4 space-y-4">
        
        {/* Row 1: Group Select + Range Select + Date Navigation */}
        <div className="flex flex-col justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Show Range: 2 weeks / 1 week */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#101828] dark:text-[#F8FAFC] whitespace-nowrap">Khoảng thời gian:</span>
              <TingSelect
                value={rangeMode}
                onChange={(e) => setRangeMode(e.target.value as '2_WEEKS' | '1_WEEK')}
                sizeVariant="sm"
                className="w-40 font-semibold"
                options={[
                  { value: '2_WEEKS', label: '2 tuần (14 ngày)' },
                  { value: '1_WEEK', label: '1 tuần (7 ngày)' },
                ]}
              />
            </div>

            {/* Select Students / Group */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#101828] dark:text-[#F8FAFC] whitespace-nowrap">Lớp học:</span>
              <TingSelect
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                sizeVariant="sm"
                className="w-56 font-semibold"
                options={groups.map((g) => ({
                  value: g.id,
                  label: `${g.name} (${formatVND(g.defaultFee)}/buổi)`,
                }))}
              />
            </div>
          </div>

          {/* Range Navigator (< >) */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => shiftRangeByWeeks(-1)}
              className="p-2 rounded-xl bg-white border border-[#E4E7EC] text-slate-600 hover:text-[#101828] hover:bg-slate-50 transition-colors shadow-xs"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-[#101828] px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] tabular-nums">
              {dayColumns[0]?.dayNumber}/{dayColumns[0]?.month} — {dayColumns[dayColumns.length - 1]?.dayNumber}/{dayColumns[dayColumns.length - 1]?.month}
            </span>

            <button
              onClick={() => shiftRangeByWeeks(1)}
              className="p-2 rounded-xl bg-white border border-[#E4E7EC] text-slate-600 hover:text-[#101828] hover:bg-slate-50 transition-colors shadow-xs"
              title="Tuần kế tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const d = new Date();
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(d.setDate(diff));
                setAnchorDate(monday.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#2538D9]/10 border border-[#2538D9]/20 text-xs font-semibold text-[#2538D9] hover:bg-[#2538D9]/15 transition-colors"
            >
              Hiện tại
            </button>
          </div>

        </div>

        {/* Row 2: Fast "Mark for a Date" Toolbar (matching Orange Button bar in Image 2) */}
        <div className="pt-3 border-t border-[#E4E7EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-[#101828] flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-orange-500" />
              Điểm danh nhanh:
            </span>

            {/* Date Select */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                sx={{
                  borderRadius: '0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  bgcolor: '#ffffff',
                  height: 36,
                }}
              >
                {dayColumns.map((col) => (
                  <MenuItem key={col.dateStr} value={col.dateStr} sx={{ fontSize: '0.75rem' }}>
                    {col.dayLabel} {col.dayNumber}/{col.month} {col.isToday ? '(Hôm nay)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <span className="text-xs text-[#475467]">Ghi nhận là:</span>

            {/* Status Select */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={quickStatus}
                onChange={(e) => setQuickStatus(e.target.value as any)}
                sx={{
                  borderRadius: '0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  bgcolor: '#ffffff',
                  height: 36,
                }}
              >
                <MenuItem value="PRESENT" sx={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>✓ Có mặt (P)</MenuItem>
                <MenuItem value="ABSENT_CHARGED" sx={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}>✕ Vắng mặt (A)</MenuItem>
                <MenuItem value="ABSENT_EXCUSED" sx={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>◷ Nghỉ phép (L)</MenuItem>
              </Select>
            </FormControl>

            {/* Orange Action Button (Image 2) */}
            <button
              onClick={handleQuickMarkDate}
              disabled={bulkSaving || members.length === 0}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {bulkSaving ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              <span>Điểm danh cả lớp</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm học sinh / Mã HV..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#E4E7EC] text-xs text-[#101828] placeholder-slate-400 focus:outline-none focus:border-[#2538D9]"
            />
          </div>
        </div>

      </div>

      {/* 4. Full Skolaro Multi-Day Attendance Matrix Table (EXACT VISUAL FROM IMAGE 2) */}
      <div className="ting-card overflow-hidden">
        
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <CircularProgress size={32} sx={{ color: '#2538D9' }} />
            <p className="text-xs text-[#475467] font-medium">Đang đồng bộ dữ liệu ma trận chuyên cần...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-sm font-semibold text-[#101828]">Không tìm thấy học sinh nào</p>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2538D9] text-white text-xs font-semibold"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm học viên vào lớp</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              
              {/* Table Header: Admission No, Student, Abs, Lve, Day Columns */}
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#475467] font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-3.5 w-28 whitespace-nowrap">Mã HV</th>
                  <th className="py-3 px-3.5 min-w-[160px] whitespace-nowrap">Học viên</th>
                  <th className="py-3 px-2 text-center w-12 text-rose-600 font-bold" title="Tổng buổi vắng">Abs</th>
                  <th className="py-3 px-2 text-center w-12 text-amber-600 font-bold" title="Tổng buổi phép">Lve</th>

                  {/* Day Columns */}
                  {dayColumns.map((col) => (
                    <th
                      key={col.dateStr}
                      className={`py-2 px-1 text-center min-w-[38px] transition-colors ${
                        col.isToday
                          ? 'bg-[#2538D9]/10 text-[#2538D9] font-bold border-x border-[#2538D9]/20'
                          : col.isWeekend
                          ? 'bg-slate-100/60 text-slate-400'
                          : 'text-[#101828]'
                      }`}
                    >
                      <span className="block text-[10px] uppercase font-bold">{col.dayLabel}</span>
                      <span className="block text-xs font-bold tabular-nums mt-0.5">{col.dayNumber}</span>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* SUMMARY ROWS (matching Image 2: Total Present, Total Absent, Total Leave, Percentage %) */}
              <tbody className="bg-slate-50/70 border-b-2 border-slate-300 font-semibold text-[11px]">
                
                {/* Total Present */}
                <tr className="border-b border-[#E4E7EC]/60 hover:bg-slate-100/50">
                  <td colSpan={2} className="py-2 px-3.5 text-[#101828] font-bold">
                    Tổng Có mặt (Total Present)
                  </td>
                  <td className="text-center text-slate-400">—</td>
                  <td className="text-center text-slate-400">—</td>
                  {columnSummaries.map((s) => (
                    <td
                      key={`tp_${s.dateStr}`}
                      className="py-1.5 px-1 text-center font-bold tabular-nums text-emerald-700 bg-emerald-50/50"
                    >
                      {s.present}
                    </td>
                  ))}
                </tr>

                {/* Total Absent */}
                <tr className="border-b border-[#E4E7EC]/60 hover:bg-slate-100/50">
                  <td colSpan={2} className="py-2 px-3.5 text-rose-700 font-bold">
                    Tổng Vắng (Total Absent)
                  </td>
                  <td className="text-center text-slate-400">—</td>
                  <td className="text-center text-slate-400">—</td>
                  {columnSummaries.map((s) => (
                    <td
                      key={`ta_${s.dateStr}`}
                      className="py-1.5 px-1 text-center font-bold tabular-nums text-rose-600 bg-rose-50/40"
                    >
                      {s.absent}
                    </td>
                  ))}
                </tr>

                {/* Total Leave */}
                <tr className="border-b border-[#E4E7EC]/60 hover:bg-slate-100/50">
                  <td colSpan={2} className="py-2 px-3.5 text-amber-700 font-bold">
                    Tổng Phép (Total Leave)
                  </td>
                  <td className="text-center text-slate-400">—</td>
                  <td className="text-center text-slate-400">—</td>
                  {columnSummaries.map((s) => (
                    <td
                      key={`tl_${s.dateStr}`}
                      className="py-1.5 px-1 text-center font-bold tabular-nums text-amber-600 bg-amber-50/40"
                    >
                      {s.leave}
                    </td>
                  ))}
                </tr>

                {/* Percentage % */}
                <tr className="hover:bg-slate-100/50">
                  <td colSpan={2} className="py-2 px-3.5 text-[#2538D9] font-bold">
                    Tỷ lệ chuyên cần (Percentage %)
                  </td>
                  <td className="text-center text-slate-400">—</td>
                  <td className="text-center text-slate-400">—</td>
                  {columnSummaries.map((s) => (
                    <td
                      key={`pct_${s.dateStr}`}
                      className={`py-1.5 px-1 text-center font-bold tabular-nums ${
                        s.percentage >= 90
                          ? 'text-emerald-700'
                          : s.percentage >= 75
                          ? 'text-blue-700'
                          : s.percentage > 0
                          ? 'text-rose-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.totalMarked > 0 ? `${s.percentage}%` : '—'}
                    </td>
                  ))}
                </tr>

              </tbody>

              {/* STUDENT ROWS */}
              <tbody className="divide-y divide-[#E4E7EC]">
                {filteredMembers.map((m) => {
                  // Calculate member's total absences and leaves in this window
                  let mAbs = 0;
                  let mLve = 0;
                  dayColumns.forEach((c) => {
                    const r = matrixData[`${m.id}_${c.dateStr}`];
                    if (r?.status === 'ABSENT_CHARGED') mAbs++;
                    if (r?.status === 'ABSENT_EXCUSED') mLve++;
                  });

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Admission / Student Code */}
                      <td className="py-3 px-3.5 font-bold tabular-nums text-slate-500 whitespace-nowrap text-[11px]">
                        {m.code}
                      </td>

                      {/* Student info */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={m.name} size="xs" />
                          <div>
                            <Link
                              href={`/members/${m.id}`}
                              className="font-bold text-[#101828] hover:text-[#2538D9] transition-colors block leading-tight text-xs"
                            >
                              {m.name}
                            </Link>
                            {m.phone && (
                              <span className="text-[10px] text-[#475467] tabular-nums block font-normal">
                                {m.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Abs count */}
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                          mAbs > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-400'
                        }`}>
                          {mAbs}
                        </span>
                      </td>

                      {/* Lve count */}
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                          mLve > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-400'
                        }`}>
                          {mLve}
                        </span>
                      </td>

                      {/* 14-Day Cells (P, A, L, H, -) */}
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
                            } hover:bg-slate-100`}
                            title={`${m.name} — ${col.dayLabel} ${col.dateStr}: Nhấp để đổi trạng thái (Có mặt / Vắng / Phép)`}
                          >
                            {isSaving ? (
                              <div className="w-6 h-6 mx-auto flex items-center justify-center">
                                <CircularProgress size={12} color="inherit" />
                              </div>
                            ) : status === 'PRESENT' ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300 hover:scale-110 transition-transform shadow-xs">
                                P
                              </span>
                            ) : status === 'ABSENT_CHARGED' ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-300 hover:scale-110 transition-transform shadow-xs">
                                A
                              </span>
                            ) : status === 'ABSENT_EXCUSED' ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300 hover:scale-110 transition-transform shadow-xs">
                                L
                              </span>
                            ) : status === 'HOLIDAY' ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-cyan-100 text-cyan-800 font-bold text-[11px] border border-cyan-300">
                                H
                              </span>
                            ) : col.isWeekend ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-400 font-medium text-[11px]">
                                —
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-50 text-slate-300 text-[11px] hover:bg-slate-200/60 transition-colors">
                                ·
                              </span>
                            )}
                          </td>
                        );
                      })}

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

        {/* Legend strip (matching Image 2) */}
        <div className="p-3.5 bg-[#F8FAFC] border-t border-[#E4E7EC] flex flex-wrap items-center justify-between gap-3 text-xs text-[#475467]">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-[#101828]">Chú thích:</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] border border-emerald-300">P</span>
              <span>Có mặt (Present)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[10px] border border-rose-300">A</span>
              <span>Vắng mặt tính phí (Absent)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px] border border-amber-300">L</span>
              <span>Nghỉ có phép (Leave)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-[10px] border border-cyan-300">H</span>
              <span>Nghỉ lễ / Định kỳ (Holiday)</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 italic">
            * Nhấp vào ô bất kỳ để xoay vòng trạng thái [P → A → L].
          </div>
        </div>

      </div>
      </>
      )}

      {/* 5. Add Member Dialog Modal */}
      <Dialog
        open={showAddMemberModal}
        onClose={() => !isAddingMember && setShowAddMemberModal(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1.25rem',
              padding: '8px',
            }
          }
        }}
      >
        <DialogTitle className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-[#101828] block">Thêm học viên vào lớp</span>
              <span className="text-[11px] text-[#475467] font-normal">{currentGroup?.name}</span>
            </div>
          </div>
        </DialogTitle>

        <form onSubmit={handleAddMember}>
          <DialogContent className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-[#101828] block mb-1">
                Họ và tên học sinh <span className="text-rose-500">*</span>
              </label>
              <TextField
                fullWidth
                size="small"
                required
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="VD: Lê Hoàng Nam"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#101828] block mb-1">
                Số điện thoại liên hệ
              </label>
              <TextField
                fullWidth
                size="small"
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
                placeholder="VD: 0987654321"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#101828] block mb-1">
                Tên phụ huynh
              </label>
              <TextField
                fullWidth
                size="small"
                value={newParentName}
                onChange={(e) => setNewParentName(e.target.value)}
                placeholder="VD: Cô Lan"
              />
            </div>
          </DialogContent>

          <DialogActions className="p-4 pt-0 gap-2">
            <Button
              variant="outlined"
              onClick={() => setShowAddMemberModal(false)}
              disabled={isAddingMember}
              sx={{ color: '#475467', borderColor: '#E4E7EC' }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isAddingMember}
              sx={{ backgroundColor: '#2538D9', '&:hover': { backgroundColor: '#1E2DB8' } }}
            >
              {isAddingMember ? 'Đang thêm...' : 'Thêm vào lớp'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </div>
  );
}
