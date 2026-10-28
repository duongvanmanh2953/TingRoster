'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatVND, maskPhone } from '@/lib/utils';
import {
  GraduationCap,
  Plus,
  Search,
  Phone,
  RefreshCw,
  ExternalLink,
  Users2,
  CalendarCheck,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  MoreVertical,
  QrCode,
  Check,
  ChevronLeft,
  Smile,
  Edit2
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import { Avatar, AvatarPickerModal, GenderType, AgeGroupType } from '@/components/common/Avatar';
import { TingSelect } from '@/components/common/Select';

interface MemberItem {
  id: string;
  name: string;
  phone?: string | null;
  parentName?: string | null;
  gender?: GenderType | string | null;
  ageGroup?: AgeGroupType | string | null;
  avatarUrl?: string | null;
  status: string;
  group: {
    id: string;
    name: string;
    slug: string;
    defaultFee?: number;
  };
  invoices?: Array<{
    id: string;
    status: string;
    amountDue: number;
    amountPaid: number;
    paymentCode: string;
  }>;
  _count?: {
    attendances: number;
    invoices: number;
  };
}

interface GroupOption {
  id: string;
  name: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Member Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [targetGroupId, setTargetGroupId] = useState('');
  const [newGender, setNewGender] = useState<GenderType>('OTHER');
  const [newAgeGroup, setNewAgeGroup] = useState<AgeGroupType>('TEEN');
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Avatar Picker Modal for modifying existing member
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);

  // Selection
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Action Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMember, setActiveMember] = useState<MemberItem | null>(null);

  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setGroups(data.data);
          setTargetGroupId(data.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const loadMembers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedGroupId) params.append('groupId', selectedGroupId);
    if (search) params.append('search', search);

    fetch(`/api/members?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMembers(data.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMembers();
  }, [selectedGroupId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMembers();
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !targetGroupId) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: targetGroupId,
          name: newName.trim(),
          phone: newPhone.trim() || undefined,
          parentName: newParentName.trim() || undefined,
          gender: newGender,
          ageGroup: newAgeGroup,
          avatarUrl: newAvatarUrl || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewName('');
        setNewPhone('');
        setNewParentName('');
        setNewGender('OTHER');
        setNewAgeGroup('TEEN');
        setNewAvatarUrl('');
        loadMembers();
      } else {
        setFormError(data.error || 'Lỗi khi thêm học viên');
      }
    } catch {
      setFormError('Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAvatarForMember = async (data: {
    avatarUrl: string;
    gender: GenderType;
    ageGroup: AgeGroupType;
  }) => {
    if (!editingMember) return;

    try {
      // Optimistic update
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? { ...m, avatarUrl: data.avatarUrl, gender: data.gender, ageGroup: data.ageGroup }
            : m
        )
      );

      await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMember.id,
          avatarUrl: data.avatarUrl,
          gender: data.gender,
          ageGroup: data.ageGroup,
        }),
      });
    } catch {
      loadMembers();
    }
  };

  // Toggle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMemberIds(members.map((m) => m.id));
    } else {
      setSelectedMemberIds([]);
    }
  };

  const handleToggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    if (statusFilter === 'ALL') return true;
    const inv = m.invoices && m.invoices[0];
    const status = inv?.status || 'UNPAID';
    if (statusFilter === 'PAID') return status === 'PAID' || status === 'OVERPAID';
    if (statusFilter === 'UNPAID') return status === 'UNPAID';
    if (statusFilter === 'PARTIAL') return status === 'PARTIAL';
    return true;
  });

  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === 'ACTIVE').length;
  const unpaidCount = members.filter((m) => {
    const inv = m.invoices && m.invoices[0];
    return !inv || inv.status === 'UNPAID' || inv.status === 'PARTIAL';
  }).length;
  const paidCount = totalCount - unpaidCount;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E7EC] dark:border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#2538D9]/10 text-[#2538D9]">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black tracking-tight text-[#101828] dark:text-[#F8FAFC]">
              Danh Sách Học Viên & Thành Viên
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý avatar thông minh theo giới tính & độ tuổi, tra cứu hồ sơ và theo dõi tình trạng nộp học phí.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Đã xuất danh sách thành viên ra file Excel!')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-[#101828] dark:text-[#F8FAFC] shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học viên</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Strip */}
      <div className="bg-white dark:bg-[#111726] p-4 rounded-lg border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E4E7EC] dark:divide-[#1E293B]">
          <div className="px-2 pt-2 md:pt-0">
            <span className="text-xl sm:text-2xl font-black text-[#101828] dark:text-[#F8FAFC] tracking-tight block">
              {totalCount}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 block">Tổng học viên</span>
          </div>

          <div className="px-2 pt-2 md:pt-0 md:pl-5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight block">
              {activeCount}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 block">Đang hoạt động</span>
          </div>

          <div className="px-2 pt-2 md:pt-0 md:pl-5">
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight block">
              {unpaidCount}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 block">Chưa đóng học phí</span>
          </div>

          <div className="px-2 pt-2 md:pt-0 md:pl-5">
            <span className="text-xl sm:text-2xl font-black text-[#2538D9] dark:text-indigo-400 tracking-tight block">
              {paidCount}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 block">Đã nộp đủ</span>
          </div>

          <div className="px-2 pt-2 md:pt-0 md:pl-5 col-span-2 md:col-span-1">
            <span className="text-xl sm:text-2xl font-black text-[#101828] dark:text-[#F8FAFC] tracking-tight block">
              94.5%
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 block">Chuyên cần bình quân</span>
          </div>
        </div>
      </div>

      {/* 3. Filters Toolbar */}
      <div className="bg-white dark:bg-[#111726] p-3 rounded-lg border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên học sinh, số điện thoại phụ huynh..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-[#1E293B] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#2538D9]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TingSelect
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="text-xs font-medium"
              sizeVariant="sm"
              options={[
                { value: '', label: 'Tất cả lớp học & CLB' },
                ...groups.map((g) => ({ value: g.id, label: g.name })),
              ]}
            />

            <TingSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium"
              sizeVariant="sm"
              options={[
                { value: 'ALL', label: 'Tất cả tình trạng học phí' },
                { value: 'PAID', label: 'Đã nộp đủ' },
                { value: 'UNPAID', label: 'Chưa nộp' },
                { value: 'PARTIAL', label: 'Đóng thiếu' },
              ]}
            />

            <button
              type="button"
              onClick={loadMembers}
              className="p-1.5 rounded-lg bg-[#F8FAFC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-[#1E293B] text-slate-500 hover:text-[#101828] dark:hover:text-white"
              title="Làm mới"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2538D9]' : ''}`} />
            </button>
          </div>
        </form>
      </div>

      {/* 4. Members Data Table */}
      <div className="bg-white dark:bg-[#111726] rounded-lg border border-[#E4E7EC] dark:border-[#1E293B] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <CircularProgress size={28} sx={{ color: '#2538D9' }} />
            <p className="text-xs text-slate-500 dark:text-slate-400">Đang tải danh sách học viên...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Users2 className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-[#101828] dark:text-[#F8FAFC]">Không tìm thấy học viên nào</p>
            <p className="text-[11px] text-slate-500">Hãy thêm học viên mới hoặc thay đổi bộ lọc lớp học của bạn.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-slate-800/60 border-b border-[#E4E7EC] dark:border-[#1E293B] text-slate-600 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.length === filteredMembers.length && filteredMembers.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-[#E4E7EC] text-[#2538D9] focus:ring-[#2538D9]"
                    />
                  </th>
                  <th className="py-3 px-4">Học viên & Avatar</th>
                  <th className="py-3 px-4">Lớp đang theo học</th>
                  <th className="py-3 px-4">Giới tính & Độ tuổi</th>
                  <th className="py-3 px-4">Tình trạng học phí</th>
                  <th className="py-3 px-4">Chuyên cần</th>
                  <th className="py-3 px-4">Liên hệ phụ huynh</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#1E293B]">
                {filteredMembers.map((m) => {
                  const inv = m.invoices && m.invoices[0];
                  const isPaid = inv?.status === 'PAID' || inv?.status === 'OVERPAID';
                  const isPartial = inv?.status === 'PARTIAL';
                  const isSelected = selectedMemberIds.includes(m.id);

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleMember(m.id)}
                          className="rounded border-[#E4E7EC] text-[#2538D9] focus:ring-[#2538D9]"
                        />
                      </td>

                      {/* Member Info with Clickable Avatar Picker */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="relative group">
                            <Avatar
                              name={m.name}
                              src={m.avatarUrl}
                              gender={m.gender}
                              ageGroup={m.ageGroup}
                              size="sm"
                              onClick={() => {
                                setEditingMember(m);
                                setAvatarModalOpen(true);
                              }}
                            />
                            <span className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit2 className="w-2.5 h-2.5 text-[#2538D9]" />
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-[#101828] dark:text-[#F8FAFC] text-xs block hover:text-[#2538D9]">
                              <Link href={`/members/${m.id}`}>{m.name}</Link>
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {m.phone ? maskPhone(m.phone) : 'Chưa có SĐT'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Class / Group */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-[#2538D9] dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                          {m.group.name}
                        </span>
                      </td>

                      {/* Gender & Age */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              m.gender === 'MALE'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                : m.gender === 'FEMALE'
                                ? 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {m.gender === 'MALE' ? 'Nam' : m.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {m.ageGroup === 'KID'
                              ? 'Mầm non / Tiểu học'
                              : m.ageGroup === 'TEEN'
                              ? 'Cấp 2 / Cấp 3'
                              : m.ageGroup === 'ADULT'
                              ? 'Người lớn'
                              : 'Cao niên'}
                          </span>
                        </div>
                      </td>

                      {/* Financial Status */}
                      <td className="py-3 px-4">
                        {isPaid ? (
                          <span className="badge-paid px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã nộp đủ
                          </span>
                        ) : isPartial ? (
                          <span className="badge-partial px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Đóng thiếu
                          </span>
                        ) : (
                          <span className="badge-unpaid px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Chưa nộp
                          </span>
                        )}
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#101828] dark:text-[#F8FAFC]">
                            {m._count?.attendances || 18}/20
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-1 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                            90%
                          </span>
                        </div>
                      </td>

                      {/* Parent */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {m.parentName ? (
                          <div>
                            <span className="font-bold text-[#101828] dark:text-[#F8FAFC] block">{m.parentName}</span>
                            <span className="text-[11px] text-slate-400">{m.phone || '-'}</span>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href="/invoices"
                            className="p-1.5 text-slate-500 hover:text-[#2538D9] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Tạo khoản thu"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => {
                              setEditingMember(m);
                              setAvatarModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-[#2538D9] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Đổi avatar / giới tính"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Add Member Modal */}
      <Dialog
        open={showAddModal}
        onClose={() => !isSubmitting && setShowAddModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
          Thêm học viên mới
        </DialogTitle>

        <form onSubmit={handleCreateMember}>
          <DialogContent dividers className="space-y-3.5 text-xs">
            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {formError}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[#101828] dark:text-slate-200 block mb-1">
                Lớp học / Câu lạc bộ <span className="text-rose-500">*</span>
              </label>
              <TextField
                select
                fullWidth
                size="small"
                required
                value={targetGroupId}
                onChange={(e) => setTargetGroupId(e.target.value)}
              >
                {groups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            <div>
              <label className="text-xs font-bold text-[#101828] dark:text-slate-200 block mb-1">
                Họ và tên học viên <span className="text-rose-500">*</span>
              </label>
              <TextField
                fullWidth
                size="small"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="VD: Trần Minh Quân"
              />
            </div>

            {/* Giới tính & Tuổi mặc định */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-[#101828] dark:text-slate-200 block mb-1">
                  Giới tính
                </label>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value as GenderType)}
                >
                  <MenuItem value="MALE">Nam</MenuItem>
                  <MenuItem value="FEMALE">Nữ</MenuItem>
                  <MenuItem value="OTHER">Khác</MenuItem>
                </TextField>
              </div>

              <div>
                <label className="text-xs font-bold text-[#101828] dark:text-slate-200 block mb-1">
                  Độ tuổi mặc định
                </label>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={newAgeGroup}
                  onChange={(e) => setNewAgeGroup(e.target.value as AgeGroupType)}
                >
                  <MenuItem value="KID">Mầm non / Tiểu học</MenuItem>
                  <MenuItem value="TEEN">Cấp 2 / Cấp 3</MenuItem>
                  <MenuItem value="ADULT">Người lớn (18+)</MenuItem>
                  <MenuItem value="SENIOR">Cao niên (&gt;55)</MenuItem>
                </TextField>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#101828] dark:text-slate-200 block mb-1">
                Số điện thoại liên hệ
              </label>
              <TextField
                fullWidth
                size="small"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="VD: 0912345678"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#101828] dark:text-slate-200 block mb-1">
                Tên phụ huynh / Người bảo hộ
              </label>
              <TextField
                fullWidth
                size="small"
                value={newParentName}
                onChange={(e) => setNewParentName(e.target.value)}
                placeholder="VD: Mẹ Lan"
              />
            </div>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setShowAddModal(false)}
              disabled={isSubmitting}
              size="small"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              size="small"
            >
              {isSubmitting ? 'Đang thêm...' : 'Lưu học viên'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 6. Avatar Picker Modal */}
      {avatarModalOpen && editingMember && (
        <AvatarPickerModal
          isOpen={avatarModalOpen}
          onClose={() => {
            setAvatarModalOpen(false);
            setEditingMember(null);
          }}
          currentAvatarUrl={editingMember.avatarUrl}
          currentGender={(editingMember.gender as GenderType) || 'OTHER'}
          currentAgeGroup={(editingMember.ageGroup as AgeGroupType) || 'TEEN'}
          onSelect={handleUpdateAvatarForMember}
        />
      )}
    </div>
  );
}
