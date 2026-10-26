'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

interface GroupOption {
  id: string;
  name: string;
  defaultFee: number;
}

interface MemberItem {
  id: string;
  name: string;
  phone?: string | null;
}

interface AttendanceRecord {
  id: string;
  memberId: string;
  isPresent: boolean;
  status: 'PRESENT' | 'ABSENT_CHARGED' | 'ABSENT_EXCUSED' | 'MAKEUP';
  note?: string | null;
}

export default function AttendancePage() {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  // 1. Load groups
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

  // 2. Load members & existing attendance for selected group & date
  const loadRoster = useCallback(async (groupId: string, date: string) => {
    if (!groupId) return;
    setLoading(true);
    try {
      // Fetch members
      const mRes = await fetch(`/api/members?groupId=${groupId}`);
      const mData = await mRes.json();

      // Fetch attendance records
      const aRes = await fetch(`/api/attendance?groupId=${groupId}&date=${date}`);
      const aData = await aRes.json();

      if (mData.success) {
        setMembers(mData.data);
      }

      const map: Record<string, AttendanceRecord> = {};
      if (aData.success && Array.isArray(aData.data)) {
        aData.data.forEach((att: AttendanceRecord) => {
          map[att.memberId] = att;
        });
      }
      setAttendanceMap(map);
    } catch (err) {
      console.error('Failed to load roster:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedGroupId && selectedDate) {
      loadRoster(selectedGroupId, selectedDate);
    }
  }, [selectedGroupId, selectedDate, loadRoster]);

  // One-tap toggle attendance
  const handleToggleAttendance = async (memberId: string, currentPresent: boolean) => {
    setSavingMemberId(memberId);
    const newPresent = !currentPresent;
    const newStatus = newPresent ? 'PRESENT' : 'ABSENT_CHARGED';

    // Optimistic update
    setAttendanceMap((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] || { id: '', memberId }),
        isPresent: newPresent,
        status: newStatus,
      },
    }));

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          memberId,
          date: selectedDate,
          isPresent: newPresent,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback on error
        loadRoster(selectedGroupId, selectedDate);
      }
    } catch {
      loadRoster(selectedGroupId, selectedDate);
    } finally {
      setSavingMemberId(null);
    }
  };

  // Bulk mark all present
  const handleMarkAllPresent = async () => {
    if (!members.length) return;
    setBulkSaving(true);
    const records = members.map((m) => ({
      memberId: m.id,
      isPresent: true,
      status: 'PRESENT' as const,
    }));

    try {
      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          date: selectedDate,
          records,
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadRoster(selectedGroupId, selectedDate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBulkSaving(false);
    }
  };

  // Add new member to group
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          name: newMemberName.trim(),
          phone: newMemberPhone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddMemberModal(false);
        setNewMemberName('');
        setNewMemberPhone('');
        loadRoster(selectedGroupId, selectedDate);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const presentCount = members.filter((m) => attendanceMap[m.id]?.isPresent).length;
  const absentCount = members.length - presentCount;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sổ Điểm Danh Một Chạm
          </h1>
          <p className="text-sm text-slate-500">
            Điểm danh học sinh từng buổi, tự động tính học phí và đồng bộ hóa đơn
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Group Picker */}
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="text-sm font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={() => setShowAddMemberModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm học viên</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 block font-medium">Sĩ số lớp</span>
          <span className="text-xl font-bold text-slate-900">{members.length} học viên</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 block font-medium">Có mặt hôm nay</span>
          <span className="text-xl font-bold text-emerald-600">{presentCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 block font-medium">Vắng mặt</span>
          <span className="text-xl font-bold text-rose-600">{absentCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Tạo đợt thu</span>
            <Link
              href="/invoices"
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Tính tiền buổi <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <button
            onClick={handleMarkAllPresent}
            disabled={bulkSaving || members.length === 0}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
            title="Đánh dấu tất cả đều có mặt"
          >
            {bulkSaving ? 'Đang lưu...' : 'Điểm danh tất cả'}
          </button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm học viên theo họ tên..."
          className="w-full bg-white pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Attendance Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            Đang tải sổ điểm danh...
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Họ và tên học viên</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4 text-center">Trạng thái điểm danh</th>
                  <th className="py-3 px-4 text-right">Thao tác một chạm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member, idx) => {
                  const record = attendanceMap[member.id];
                  const isPresent = record?.isPresent ?? false;
                  const isSaving = savingMemberId === member.id;

                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isPresent ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center text-xs font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {member.name}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                        {member.phone || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <Check className="w-3.5 h-3.5" /> Có mặt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                            <X className="w-3.5 h-3.5" /> Vắng mặt
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleToggleAttendance(member.id, isPresent)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                            isPresent
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                          }`}
                        >
                          {isSaving
                            ? 'Đang lưu...'
                            : isPresent
                            ? 'Báo vắng'
                            : 'Đánh dấu có mặt'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <p>Chưa có học viên nào trong lớp này</p>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
            >
              Thêm học viên ngay
            </button>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Thêm học viên vào lớp</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học viên *
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An, Trần Thu Hà..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại phụ huynh (tùy chọn)
                </label>
                <input
                  type="text"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  Thêm học viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
