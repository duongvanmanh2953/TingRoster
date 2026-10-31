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
  Unlock,
  Building2,
  Calendar,
  Mail,
  Phone,
  Shield,
  Send,
  RefreshCw,
  AlertCircle,
  X,
  User as UserIcon,
  Clock
} from 'lucide-react';
import { formatDateVN } from '@/lib/utils';
import { Avatar } from '@/components/common/Avatar';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  planType: string;
  serviceBalance: number;
  groupsCount: number;
  membersCount: number;
  primaryType: string;
  bankInfo: string;
  isEmailVerified: boolean;
  isActive: boolean;
  isLocked: boolean;
  lockReason?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  groups?: Array<{
    id: string;
    name: string;
    groupType: string;
    isActive: boolean;
    _count: { members: number };
  }>;
}

interface UserDirectoryTabProps {
  users?: UserRecord[];
  loading?: boolean;
  onRefresh?: () => void;
  onUserAction?: (action: string, tenantId: string, payload?: any) => Promise<void>;
  onActionToast?: (msg: string) => void;
}

export function UserDirectoryTab({
  users = [],
  loading = false,
  onRefresh,
  onUserAction,
  onActionToast,
}: UserDirectoryTabProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED' | 'UNVERIFIED'>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [lockPromptOpen, setLockPromptOpen] = useState(false);
  const [lockReason, setLockReason] = useState('');

  // Real filtered users from props - NO MOCK FALLBACKS!
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'ALL' ||
      u.role === roleFilter ||
      (roleFilter === 'ADMIN' && (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'));

    let matchesStatus = true;
    if (statusFilter === 'LOCKED') matchesStatus = u.isLocked === true;
    else if (statusFilter === 'ACTIVE') matchesStatus = u.isActive && !u.isLocked && u.isEmailVerified;
    else if (statusFilter === 'UNVERIFIED') matchesStatus = !u.isEmailVerified;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleExecuteAction = async (action: string, user: UserRecord, payload?: any) => {
    if (!onUserAction) return;
    setActionLoading(true);
    try {
      await onUserAction(action, user.id, payload);
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
      }
    } finally {
      setActionLoading(false);
      setLockPromptOpen(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Controls: Search, Filters & Stats */}
      <div className="bg-white dark:bg-[#111726] p-4 sm:p-5 rounded-2xl border border-[#E4E7EC] dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên hoặc email tài khoản..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-[#D0D5DD] dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#101828] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2538D9]"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#D0D5DD] dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2538D9]"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Platform Admin</option>
            <option value="OWNER">Chủ không gian (Owner)</option>
            <option value="USER">Người dùng cá nhân</option>
            <option value="MEMBER">Hội viên / Học sinh</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#D0D5DD] dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2538D9]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động chuẩn</option>
            <option value="UNVERIFIED">Chờ xác thực email</option>
            <option value="LOCKED">Đang bị khóa</option>
          </select>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl border border-[#E4E7EC] dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-[#EAECF0] dark:border-slate-800 text-[11px] font-semibold text-[#475467] dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Tài khoản & Email</th>
                <th className="py-3.5 px-4">Vai trò & Gói</th>
                <th className="py-3.5 px-4">Trạng thái xác thực</th>
                <th className="py-3.5 px-4">Không gian & Hội viên</th>
                <th className="py-3.5 px-4">Ngày đăng ký</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0] dark:divide-slate-800/80 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <UserX className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="font-medium text-sm text-[#101828] dark:text-white">
                      Không tìm thấy tài khoản nào
                    </p>
                    <p className="text-xs text-[#475467] dark:text-slate-400 mt-1">
                      {users.length === 0
                        ? 'Chưa có người dùng nào trong cơ sở dữ liệu. Người dùng mới đăng ký sẽ xuất hiện tại đây.'
                        : 'Không có người dùng nào khớp với bộ lọc tìm kiếm hiện tại.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* User Profile */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <p className="font-semibold text-sm text-[#101828] dark:text-white flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.role === 'SUPER_ADMIN' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold">
                                Super Admin
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 font-normal">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role & Plan */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className="inline-block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {user.role}
                        </span>
                        <div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            user.planType === 'PRO'
                              ? 'bg-blue-100 text-[#2538D9] dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {user.planType}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Verification & Lock Status */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {user.isLocked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                            <Lock className="w-3 h-3" />
                            <span>Bị khóa</span>
                          </span>
                        ) : user.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã xác thực</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" />
                            <span>Chờ xác thực</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Space Count & Members */}
                    <td className="py-4 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {user.groupsCount} không gian
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {user.membersCount} thành viên
                      </p>
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-4 text-slate-500">
                      <p>{formatDateVN(user.createdAt)}</p>
                      {user.lastLoginAt && (
                        <p className="text-[10px] text-slate-400">
                          Đăng nhập: {formatDateVN(user.lastLoginAt)}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {!user.isEmailVerified && (
                          <button
                            type="button"
                            onClick={() => handleExecuteAction('RESEND_VERIFICATION', user)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-[#2538D9] dark:text-[#4F62FF] transition-colors"
                            title="Gửi lại email xác thực"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleExecuteAction('SEND_PASSWORD_RESET', user)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-600 dark:text-amber-400 transition-colors"
                          title="Gửi email đặt lại mật khẩu"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        {user.isLocked ? (
                          <button
                            type="button"
                            onClick={() => handleExecuteAction('UNLOCK_USER', user)}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 transition-colors"
                            title="Mở khóa tài khoản"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setLockPromptOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 transition-colors"
                            title="Khóa tài khoản"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Drawer / Modal */}
      {selectedUser && !lockPromptOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-[#101828] dark:text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#2538D9]" />
                <span>Chi tiết tài khoản</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                <div>
                  <span className="text-slate-400">Họ và tên:</span>
                  <p className="font-semibold text-sm text-[#101828] dark:text-white">{selectedUser.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Địa chỉ email:</span>
                  <p className="font-semibold text-sm text-[#101828] dark:text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="text-slate-400">Vai trò hệ thống:</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">{selectedUser.role}</p>
                </div>
                <div>
                  <span className="text-slate-400">Gói dịch vụ:</span>
                  <p className="font-medium text-[#2538D9]">{selectedUser.planType}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-xs text-slate-700 dark:text-slate-300 mb-1.5">
                  Không gian quản lý ({selectedUser.groups?.length || 0}):
                </p>
                {selectedUser.groups && selectedUser.groups.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedUser.groups.map((g) => (
                      <div key={g.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-xs text-[#101828] dark:text-white">{g.name}</p>
                          <p className="text-[10px] text-slate-400">{g.groupType}</p>
                        </div>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                          {g._count.members} thành viên
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Chưa tạo không gian quản lý nào.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lock User Prompt Modal */}
      {lockPromptOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 text-left">
            <h3 className="text-base font-semibold text-rose-600 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span>Khóa tài khoản người dùng</span>
            </h3>
            <p className="text-xs text-[#475467] dark:text-slate-400">
              Bạn đang chuẩn bị khóa tài khoản <strong>{selectedUser.email}</strong>. Người dùng sẽ không thể đăng nhập hoặc thực hiện bất kỳ thao tác nào cho đến khi được mở khóa.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Lý do khóa (tùy chọn)
              </label>
              <input
                type="text"
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Ví dụ: Vi phạm điều khoản thanh toán..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-[#101828] dark:text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLockPromptOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleExecuteAction('LOCK_USER', selectedUser, { reason: lockReason })}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Xác nhận khóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
