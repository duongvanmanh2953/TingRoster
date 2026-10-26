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
  Tv,
  Users2
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
      const mRes = await fetch(`/api/members?groupId=${groupId}`);
      const mData = await mRes.json();

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

  const handleToggleAttendance = async (memberId: string, currentIsPresent: boolean) => {
    setSavingMemberId(memberId);
    const newStatus = !currentIsPresent;

    // Optimistic update
    setAttendanceMap((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        id: prev[memberId]?.id || 'temp',
        memberId,
        isPresent: newStatus,
        status: newStatus ? 'PRESENT' : 'ABSENT_CHARGED',
      },
    }));

    try {
      const res = await fetch('/api/attendance/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          memberId,
          date: selectedDate,
          isPresent: newStatus,
          status: newStatus ? 'PRESENT' : 'ABSENT_CHARGED',
        }),
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback on failure
        setAttendanceMap((prev) => ({
          ...prev,
          [memberId]: {
            ...prev[memberId],
            isPresent: currentIsPresent,
          },
        }));
      }
    } catch {
      // Rollback
      setAttendanceMap((prev) => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          isPresent: currentIsPresent,
        },
      }));
    } finally {
      setSavingMemberId(null);
    }
  };

  const handleMarkAllPresent = async () => {
    if (!selectedGroupId || members.length === 0) return;
    setBulkSaving(true);

    try {
      const records = members.map((m) => ({
        memberId: m.id,
        isPresent: true,
        status: 'PRESENT',
      }));

      const res = await fetch('/api/attendance', {
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
        const nextMap = { ...attendanceMap };
        members.forEach((m) => {
          nextMap[m.id] = {
            id: nextMap[m.id]?.id || 'bulk',
            memberId: m.id,
            isPresent: true,
            status: 'PRESENT',
          };
        });
        setAttendanceMap(nextMap);
      }
    } catch {
      alert('Lỗi lưu điểm danh hàng loạt');
    } finally {
      setBulkSaving(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !selectedGroupId) return;

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
    } catch {
      alert('Lỗi thêm học viên');
    }
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const presentCount = members.filter((m) => attendanceMap[m.id]?.isPresent).length;
  const absentCount = members.length - presentCount;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Sổ Điểm Danh Một Chạm
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase">
              Tức thời
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ghi nhận chuyên cần từng buổi, tự động tính học phí và đồng bộ hóa đơn tháng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Group Picker */}
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="text-xs font-semibold border border-[#1E283D] rounded-xl px-3.5 py-2.5 bg-[#111726] text-white focus:outline-none focus:border-emerald-500"
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
            className="text-xs font-semibold border border-[#1E283D] rounded-xl px-3 py-2 bg-[#111726] text-white focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={() => setShowAddMemberModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" />
            <span>Thêm học viên</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="ting-card p-4">
          <span className="text-xs text-slate-400 block font-medium">Sĩ số lớp</span>
          <span className="text-xl font-bold text-white tracking-tight">{members.length} học viên</span>
        </div>
        <div className="ting-card p-4">
          <span className="text-xs text-slate-400 block font-medium">Có mặt hôm nay</span>
          <span className="text-xl font-bold text-emerald-400 font-mono tracking-tight">{presentCount}</span>
        </div>
        <div className="ting-card p-4">
          <span className="text-xs text-slate-400 block font-medium">Vắng mặt</span>
          <span className="text-xl font-bold text-rose-400 font-mono tracking-tight">{absentCount}</span>
        </div>
        <div className="ting-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Thao tác nhanh</span>
            <Link
              href="/invoices"
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              Tính tiền buổi <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <button
            onClick={handleMarkAllPresent}
            disabled={bulkSaving || members.length === 0}
            className="px-3 py-1.5 bg-[#162033] hover:bg-[#1E2B45] text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition disabled:opacity-50"
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
          placeholder="Tìm kiếm học viên theo họ tên..."
          className="w-full bg-[#111726] pl-10 pr-4 py-2.5 text-xs text-white border border-[#1E283D] rounded-xl focus:outline-none focus:border-emerald-500 placeholder-slate-500 transition-colors"
        />
      </div>

      {/* Attendance Matrix Table */}
      <div className="ting-card overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 animate-pulse text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            Đang tải danh sách học viên...
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111726] border-b border-[#1E283D] text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Họ và tên học viên</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4 text-center">Trạng thái điểm danh</th>
                  <th className="py-3 px-4 text-right">Thao tác một chạm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2338]">
                {filteredMembers.map((member, idx) => {
                  const record = attendanceMap[member.id];
                  const isPresent = record?.isPresent ?? false;
                  const isSaving = savingMemberId === member.id;

                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-[#131C2E] transition-colors ${
                        isPresent ? 'bg-emerald-500/[0.04]' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {member.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {member.phone || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            <Check className="w-3.5 h-3.5" /> Có mặt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                            <X className="w-3.5 h-3.5" /> Vắng mặt
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleToggleAttendance(member.id, isPresent)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                            isPresent
                              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/25'
                              : 'bg-emerald-500 text-[#080C14] hover:bg-emerald-600 shadow-sm'
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
            <p className="text-xs">Chưa có học viên nào trong lớp này</p>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl transition"
            >
              Thêm học viên ngay
            </button>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1626] border border-[#1E283D] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#1E283D] pb-3">
              <h3 className="text-base font-bold text-white">Thêm học viên vào lớp</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ và tên học viên *
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An, Trần Thu Hà..."
                  className="w-full bg-[#111726] border border-[#1E283D] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Số điện thoại phụ huynh (tùy chọn)
                </label>
                <input
                  type="text"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full bg-[#111726] border border-[#1E283D] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E283D]">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl shadow-sm transition"
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
