'use client';

import React, { useState } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Send,
  ShieldCheck,
  Server,
  Inbox
} from 'lucide-react';
import { formatDateVN } from '@/lib/utils';

export interface EmailLogItem {
  id: string;
  recipient: string;
  subject: string;
  emailType: string;
  status: string;
  provider: string;
  errorMessage?: string | null;
  metadata?: string | null;
  createdAt: string;
}

interface EmailDeliveryLogsTabProps {
  logs?: EmailLogItem[];
  stats?: {
    total: number;
    sent: number;
    failed: number;
    successRate: number;
  };
  loading?: boolean;
  onRefresh?: () => void;
}

export function EmailDeliveryLogsTab({
  logs = [],
  stats = { total: 0, sent: 0, failed: 0, successRate: 100 },
  loading = false,
  onRefresh,
}: EmailDeliveryLogsTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SENT' | 'FAILED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.recipient.toLowerCase().includes(search.toLowerCase()) ||
      log.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || log.emailType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Delivery Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#111C33] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Tổng Email Đã Xử Lý</span>
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2 tabular-nums">
            {stats.total.toLocaleString('vi-VN')}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Xác thực & đặt lại mật khẩu</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#111C33] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Gửi Thành Công</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-2 tabular-nums">
            {stats.sent.toLocaleString('vi-VN')}
          </p>
          <span className="text-[11px] text-emerald-600/80 font-medium mt-1 block">
            Tỷ lệ thành công: {stats.successRate}%
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-[#111C33] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Gửi Thất Bại / Lỗi</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-600 mt-2 tabular-nums">
            {stats.failed.toLocaleString('vi-VN')}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Được ghi log nguyên nhân chi tiết</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#111C33] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Cổng Phát Thư (Transport)</span>
            <Server className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-2 truncate">
            {process.env.NEXT_PUBLIC_SMTP_HOST || 'SMTP Relay (Production)'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">DKIM / SPF Verified Ready</span>
        </div>
      </div>

      {/* 2. Main Logs Table Container */}
      <div className="bg-white dark:bg-[#111C33] rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4 shadow-xs">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm email người nhận, tiêu đề..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2538D9]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                aria-label="Lọc theo trạng thái email"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2538D9]"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="SENT">Đã gửi (SENT)</option>
                <option value="FAILED">Thất bại (FAILED)</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Lọc theo loại email"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2538D9]"
              >
                <option value="ALL">Tất cả phân loại</option>
                <option value="VERIFICATION">Xác thực tài khoản (VERIFICATION)</option>
                <option value="RESET_PASSWORD">Đặt lại mật khẩu (RESET_PASSWORD)</option>
                <option value="SECURITY_ALERT">Cảnh báo bảo mật (SECURITY_ALERT)</option>
                <option value="WELCOME">Chào mừng (WELCOME)</option>
              </select>
            </div>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          )}
        </div>

        {/* Table / Empty State */}
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Chưa có bản ghi nhật ký gửi email nào
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Khi người dùng đăng ký tài khoản thật hoặc yêu cầu đổi mật khẩu, hệ thống sẽ tự động gửi email và lưu vết kiểm toán tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Thời Gian</th>
                  <th className="py-3 px-3">Người Nhận</th>
                  <th className="py-3 px-3">Loại Thư</th>
                  <th className="py-3 px-3">Tiêu Đề</th>
                  <th className="py-3 px-3 text-center">Trạng Thái</th>
                  <th className="py-3 px-3">Cổng Gửi</th>
                  <th className="py-3 px-3">Chi Tiết Lỗi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {formatDateVN(log.createdAt)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {log.recipient}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.emailType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {log.subject}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {log.status === 'SENT' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ĐÃ GỬI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          THẤT BẠI
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] font-mono">
                      {log.provider}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400 max-w-xs truncate">
                      {log.errorMessage || '—'}
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
