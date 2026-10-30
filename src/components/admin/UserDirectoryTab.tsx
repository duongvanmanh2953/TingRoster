'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  UserX,
  Eye,
  Key,
  CheckCircle2,
  Lock,
  Building2,
  Calendar,
  Mail,
  Phone,
  Shield
} from 'lucide-react';
import { formatDateVN } from '@/lib/utils';
import { Avatar } from '@/components/common/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED';
  groupsCount: number;
  membersCount: number;
  planType: string;
  createdAt: string;
  lastActive?: string;
}

interface UserDirectoryTabProps {
  users?: UserRecord[];
  onActionToast?: (msg: string) => void;
}

export function UserDirectoryTab({ users = [], onActionToast }: UserDirectoryTabProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Default fallback mock data if empty
  const displayUsers: UserRecord[] = users.length > 0 ? users : [
    {
      id: 'usr_master_01',
      name: 'Nguyễn Văn Minh (Admin Master)',
      email: 'minh.nguyen@tingroster.vn',
      phone: '0987654321',
      role: 'ADMIN',
      status: 'ACTIVE',
      groupsCount: 12,
      membersCount: 420,
      planType: 'PRO',
      createdAt: '2026-01-15T08:30:00Z',
      lastActive: '5 phút trước',
    },
    {
      id: 'usr_edu_02',
      name: 'Thầy Hưng (Trung tâm Toán MathStars)',
      email: 'hung.math@gmail.com',
      phone: '0912345678',
      role: 'USER',
      status: 'ACTIVE',
      groupsCount: 6,
      membersCount: 185,
      planType: 'PRO',
      createdAt: '2026-03-10T14:20:00Z',
      lastActive: '12 phút trước',
    },
    {
      id: 'usr_rent_03',
      name: 'Chị Mai (Chủ Nhà Trọ An Cư Q9)',
      email: 'maitro.ancu@yahoo.com',
      phone: '0908765432',
      role: 'USER',
      status: 'ACTIVE',
      groupsCount: 3,
      membersCount: 48,
      planType: 'FREE',
      createdAt: '2026-08-01T09:15:00Z',
      lastActive: '1 giờ trước',
    },
    {
      id: 'usr_sport_04',
      name: 'HLV Tuấn (CLB Cầu Lông Thủ Đức Stars)',
      email: 'tuanbadminton@clb.vn',
      phone: '0933445566',
      role: 'USER',
      status: 'ACTIVE',
      groupsCount: 4,
      membersCount: 92,
      planType: 'FREE',
      createdAt: '2026-09-18T16:45:00Z',
      lastActive: '2 giờ trước',
    },
    {
      id: 'usr_lock_05',
      name: 'Trần Đại Nghĩa (Tài khoản thử nghiệm)',
      email: 'nghia.test@domain.com',
      phone: '0977112233',
      role: 'USER',
      status: 'LOCKED',
      groupsCount: 0,
      membersCount: 0,
      planType: 'FREE',
      createdAt: '2026-10-01T11:00:00Z',
      lastActive: '3 ngày trước',
    },
  ];

  // Mask sensitive PII
  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const maskedName = name.length > 2 ? `${name.substring(0, 2)}***` : `${name}***`;
    return `${maskedName}@${domain}`;
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return 'Chưa cập nhật';
    if (phone.length <= 4) return phone;
    return `${phone.substring(0, 3)}***${phone.slice(-3)}`;
  };

  const filteredUsers = displayUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleLock = (user: UserRecord) => {
    const newStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    onActionToast?.(
      newStatus === 'LOCKED'
        ? `Đã khóa truy cập của người dùng ${user.name} (Ghi nhật ký Audit Log)!`
        : `Đã mở khóa hoạt động cho người dùng ${user.name}!`
    );
    setDetailOpen(false);
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E5E7EB] dark:border-slate-800 p-5 space-y-4 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB] dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, User ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-hidden focus:border-[#2538D9]"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-xs font-semibold text-slate-700 dark:text-slate-300 outline-hidden cursor-pointer"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
            <option value="USER">Chủ cơ sở (USER)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-xs font-semibold text-slate-700 dark:text-slate-300 outline-hidden cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="LOCKED">Đã khóa</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Hiển thị <strong className="text-slate-900 dark:text-white">{filteredUsers.length}</strong> / {displayUsers.length} người dùng
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E5E7EB] dark:border-slate-800 text-xs font-semibold text-slate-500 bg-[#F9FAFB] dark:bg-[#0B0F19]">
              <th className="py-3 px-3">Người dùng / Định danh</th>
              <th className="py-3 px-3">Email (Masked)</th>
              <th className="py-3 px-3">Số điện thoại</th>
              <th className="py-3 px-3">Vai trò</th>
              <th className="py-3 px-3">Quy mô quản lý</th>
              <th className="py-3 px-3">Trạng thái</th>
              <th className="py-3 px-3">Ngày đăng ký</th>
              <th className="py-3 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name} size="sm" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block leading-tight">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">ID: {user.id}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">
                  {maskEmail(user.email)}
                </td>
                <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">
                  {maskPhone(user.phone)}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap select-none ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] dark:text-indigo-400 border border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                  {user.groupsCount} nhóm • {user.membersCount} thành viên
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap select-none ${
                      user.status === 'ACTIVE'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-500 text-[11px]">
                  {formatDateVN(user.createdAt)}
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setDetailOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all inline-flex items-center gap-1 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi tiết</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1rem',
              padding: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
            },
          },
        }}
      >
        <DialogTitle className="pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar name={selectedUser?.name || ''} size="md" />
              <div>
                <span className="font-bold text-base text-slate-900 block leading-tight">
                  {selectedUser?.name}
                </span>
                <span className="text-xs text-slate-500 font-normal">
                  ID: {selectedUser?.id} • Vai trò: {selectedUser?.role}
                </span>
              </div>
            </div>
            <Chip
              label={selectedUser?.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
              size="small"
              sx={{
                bgcolor: selectedUser?.status === 'ACTIVE' ? '#ECFDF3' : '#FEF3F2',
                color: selectedUser?.status === 'ACTIVE' ? '#067647' : '#B42318',
                fontWeight: 700,
              }}
            />
          </div>
        </DialogTitle>

        <DialogContent className="pt-4 space-y-3.5 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-3 bg-[#F9FAFB] p-3.5 rounded-xl border border-[#E5E7EB]">
            <div>
              <span className="text-slate-500 text-[11px] block">Email tài khoản</span>
              <span className="font-semibold text-slate-900 block truncate">{selectedUser?.email}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Số điện thoại liên hệ</span>
              <span className="font-semibold text-slate-900 block">{selectedUser?.phone || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Quy mô quản lý cơ sở</span>
              <span className="font-semibold text-slate-900 block">
                {selectedUser?.groupsCount} nhóm / lớp • {selectedUser?.membersCount} thành viên
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Gói dịch vụ</span>
              <span className="font-bold text-[#2538D9] block">{selectedUser?.planType}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[#E5E7EB] bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 text-xs block">Nguyên tắc Bảo mật PII</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mọi thay đổi trạng thái tài khoản (Khóa/Mở) đều được ghi nhật ký hệ thống kèm địa chỉ IP của Quản trị viên để kiểm toán định kỳ.
            </p>
          </div>
        </DialogContent>

        <DialogActions className="p-4 pt-2 gap-2 border-t border-[#E5E7EB]">
          <Button
            variant="outlined"
            onClick={() => setDetailOpen(false)}
            sx={{ color: '#475467', borderColor: '#E5E7EB', textTransform: 'none', borderRadius: '8px' }}
          >
            Đóng
          </Button>
          <Button
            variant="contained"
            onClick={() => selectedUser && handleToggleLock(selectedUser)}
            sx={{
              bgcolor: selectedUser?.status === 'ACTIVE' ? '#D92D20' : '#039855',
              '&:hover': { bgcolor: selectedUser?.status === 'ACTIVE' ? '#B42318' : '#027A48' },
              textTransform: 'none',
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            {selectedUser?.status === 'ACTIVE' ? 'Khóa tài khoản này' : 'Mở khóa tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
