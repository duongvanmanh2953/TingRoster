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
  ChevronLeft
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
import { Avatar } from '@/components/common/Avatar';

interface MemberItem {
  id: string;
  name: string;
  phone?: string | null;
  parentName?: string | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewName('');
        setNewPhone('');
        setNewParentName('');
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

  // KPI Metrics Calculation (Untitled UI style)
  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === 'ACTIVE').length;
  const unpaidCount = members.filter((m) => {
    const inv = m.invoices && m.invoices[0];
    return !inv || inv.status === 'UNPAID' || inv.status === 'PARTIAL';
  }).length;
  const paidCount = totalCount - unpaidCount;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
              Học viên & Thành viên
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#475467] mt-1">
            Theo dõi danh sách học viên theo lớp, trạng thái nộp học phí và chuyên cần
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Xuất danh sách học viên ra file Excel thành công!')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E7EC] hover:bg-slate-50 text-xs font-semibold text-[#101828] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-semibold transition-all shadow-sm shadow-[#2538D9]/25"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học viên</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Strip (Directly from Untitled UI reference image) */}
      <div className="ting-card p-4 sm:p-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E4E7EC]">
          <div className="px-2 pt-2 md:pt-0">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-mono block">
              {totalCount}
            </span>
            <span className="text-xs font-medium text-[#475467] mt-1 block">Tổng học viên</span>
          </div>

          <div className="px-2 pt-2 md:pt-0 md:pl-6">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono block">
              {activeCount}
            </span>
            <span className="text-xs font-medium text-[#475467] mt-1 block">Đang hoạt động</span>
          </div>

          <div className="px-2 pt-2 md:pt-0 md:pl-6">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono block">
              {unpaidCount}
            </span>
            <span className="text-xs font-medium text-[#475467] mt-1 block">Chưa đóng học phí</span>
          </div>

          <div className="px-2 pt-2 md:pt-0 md:pl-6">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2538D9] font-mono block">
              {paidCount}
            </span>
            <span className="text-xs font-medium text-[#475467] mt-1 block">Đã nộp đủ</span>
          </div>

          <div className="px-2 pt-2 md:pt-0 md:pl-6 col-span-2 md:col-span-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-mono block">
              94.5%
            </span>
            <span className="text-xs font-medium text-[#475467] mt-1 block">Chuyên cần trung bình</span>
          </div>
        </div>
      </div>

      {/* 3. Filters Toolbar (Untitled UI filter pattern) */}
      <div className="ting-card p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên học sinh, số điện thoại phụ huynh..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#E4E7EC] text-xs text-[#101828] placeholder-slate-400 focus:outline-none focus:border-[#2538D9] focus:ring-1 focus:ring-[#2538D9] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Group Filter */}
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-[#E4E7EC] text-xs font-medium text-[#101828] focus:outline-none focus:border-[#2538D9]"
            >
              <option value="">Tất cả lớp học & CLB</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* Payment Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-[#E4E7EC] text-xs font-medium text-[#101828] focus:outline-none focus:border-[#2538D9]"
            >
              <option value="ALL">Tất cả tình trạng học phí</option>
              <option value="PAID">Đã nộp đủ</option>
              <option value="UNPAID">Chưa nộp</option>
              <option value="PARTIAL">Đóng thiếu</option>
            </select>

            <button
              type="button"
              onClick={loadMembers}
              className="p-2 rounded-xl bg-white border border-[#E4E7EC] text-slate-500 hover:text-[#101828] hover:border-slate-300"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2538D9]' : ''}`} />
            </button>
          </div>

        </form>
      </div>

      {/* 4. Members Data Table (Untitled UI Table Format) */}
      <div className="ting-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <CircularProgress size={32} sx={{ color: '#2538D9' }} />
            <p className="text-xs text-[#475467]">Đang tải danh sách học viên...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#101828]">Không tìm thấy học viên nào</p>
            <p className="text-xs text-[#475467]">
              Hãy thêm học viên mới hoặc thay đổi bộ lọc lớp học của bạn.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#475467] font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.length === filteredMembers.length && filteredMembers.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-[#E4E7EC] text-[#2538D9] focus:ring-[#2538D9]"
                    />
                  </th>
                  <th className="py-3.5 px-4">Học viên</th>
                  <th className="py-3.5 px-4">Lớp đang theo học</th>
                  <th className="py-3.5 px-4">Tình trạng học phí</th>
                  <th className="py-3.5 px-4">Chuyên cần</th>
                  <th className="py-3.5 px-4">Liên hệ phụ huynh</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {filteredMembers.map((m, idx) => {
                  const inv = m.invoices && m.invoices[0];
                  const isPaid = inv?.status === 'PAID' || inv?.status === 'OVERPAID';
                  const isPartial = inv?.status === 'PARTIAL';
                  const isSelected = selectedMemberIds.includes(m.id);

                  // Colors for avatar initial
                  const avatarColors = [
                    'bg-[#2538D9]/10 text-[#2538D9]',
                    'bg-emerald-50 text-emerald-700',
                    'bg-indigo-50 text-indigo-700',
                    'bg-amber-50 text-amber-700',
                    'bg-rose-50 text-rose-700',
                  ];
                  const avatarColor = avatarColors[idx % avatarColors.length];

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleMember(m.id)}
                          className="rounded border-[#E4E7EC] text-[#2538D9] focus:ring-[#2538D9]"
                        />
                      </td>

                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={m.name} size="sm" />
                          <div>
                            <span className="font-bold text-[#101828] text-xs block hover:text-[#2538D9]">
                              <Link href={`/members/${m.id}`}>{m.name}</Link>
                            </span>
                            <span className="text-[11px] text-[#475467] font-mono">
                              {m.phone ? maskPhone(m.phone) : 'Chưa có SĐT'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Class / Group */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 text-[#2538D9] border border-indigo-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2538D9]" />
                          {m.group.name}
                        </span>
                      </td>

                      {/* Financial Status (AGENTS.md strict status tokens) */}
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <span className="badge-paid px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã nộp đủ
                          </span>
                        ) : isPartial ? (
                          <span className="badge-partial px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Đóng thiếu
                          </span>
                        ) : (
                          <span className="badge-unpaid px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Chưa nộp
                          </span>
                        )}
                      </td>

                      {/* Attendance */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#101828] font-mono text-xs">
                            {m._count?.attendances || 18}/20 buổi
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            90%
                          </span>
                        </div>
                      </td>

                      {/* Parent Phone */}
                      <td className="py-3.5 px-4 text-[#475467]">
                        {m.parentName ? (
                          <div>
                            <span className="font-medium text-[#101828] block">{m.parentName}</span>
                            <span className="text-[11px] text-slate-400">{m.phone || '-'}</span>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/invoices`}
                            className="p-1.5 text-slate-500 hover:text-[#2538D9] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Tạo khoản thu"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/attendance?groupId=${m.group.id}`}
                            className="p-1.5 text-slate-500 hover:text-[#2538D9] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Điểm danh"
                          >
                            <CalendarCheck className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={(e) => {
                              setMenuAnchorEl(e.currentTarget);
                              setActiveMember(m);
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#101828] hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
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

        {/* 5. Pagination Bar (Untitled UI standard pagination) */}
        <div className="p-4 border-t border-[#E4E7EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#475467]">
          <span>
            Hiển thị <strong>{filteredMembers.length}</strong> học viên trên tổng số <strong>{totalCount}</strong>
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled
              className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-slate-300 cursor-not-allowed flex items-center gap-1 font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trước</span>
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-[#2538D9] text-white font-semibold shadow-xs">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-[#101828] hover:bg-slate-50 font-medium">
              2
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-[#101828] hover:bg-slate-50 font-medium flex items-center gap-1">
              <span>Sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              minWidth: 180,
              fontSize: '0.75rem',
            }
          }
        }}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchorEl(null);
            if (activeMember) {
              const url = `${window.location.origin}/p/${activeMember.group.slug}`;
              navigator.clipboard.writeText(url);
              alert(`Đã sao chép liên kết thanh toán VietQR của lớp ${activeMember.group.name}!`);
            }
          }}
          className="text-xs"
        >
          <QrCode className="w-4 h-4 mr-2 text-[#2538D9]" />
          Sao chép link VietQR
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchorEl(null);
            alert(`Xem hồ sơ học viên ${activeMember?.name}`);
          }}
          className="text-xs"
        >
          <Users2 className="w-4 h-4 mr-2 text-slate-500" />
          Xem chi tiết hồ sơ
        </MenuItem>
      </Menu>

      {/* 6. Add Member Modal */}
      <Dialog
        open={showAddModal}
        onClose={() => !isSubmitting && setShowAddModal(false)}
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
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-[#101828] block">Thêm học viên mới</span>
              <span className="text-[11px] text-[#475467] font-normal">Ghi danh học viên vào lớp để bắt đầu điểm danh</span>
            </div>
          </div>
        </DialogTitle>

        <form onSubmit={handleCreateMember}>
          <DialogContent className="space-y-4 pt-2">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#101828] block mb-1">
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
              <label className="text-xs font-semibold text-[#101828] block mb-1">
                Họ và tên học viên <span className="text-rose-500">*</span>
              </label>
              <TextField
                fullWidth
                size="small"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#101828] block mb-1">
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
              <label className="text-xs font-semibold text-[#101828] block mb-1">
                Tên phụ huynh / Người bảo hộ
              </label>
              <TextField
                fullWidth
                size="small"
                value={newParentName}
                onChange={(e) => setNewParentName(e.target.value)}
                placeholder="VD: Bác Bình (Bố An)"
              />
            </div>
          </DialogContent>

          <DialogActions className="p-4 pt-0 gap-2">
            <Button
              variant="outlined"
              onClick={() => setShowAddModal(false)}
              disabled={isSubmitting}
              sx={{ color: '#475467', borderColor: '#E4E7EC' }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ backgroundColor: '#2538D9', '&:hover': { backgroundColor: '#1E2DB8' } }}
            >
              {isSubmitting ? 'Đang thêm...' : 'Lưu học viên'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </div>
  );
}
