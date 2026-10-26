'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatVND, formatDateTimeVN } from '@/lib/utils';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCheck,
  HelpCircle,
  ArrowRight,
  PlusCircle,
  CalendarCheck,
  Tv,
  RefreshCw,
} from 'lucide-react';

interface DashboardStats {
  totalDue: number;
  totalPaid: number;
  remaining: number;
  collectionRate: number;
  unpaidCount: number;
  partialCount: number;
  paidCount: number;
  todayAttendeesCount: number;
  unmatchedCount: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    content: string;
    processingStatus: string;
    transactionDate: string;
    matchedInvoice?: {
      paymentCode: string;
      member: { name: string };
    } | null;
  }>;
}

interface GroupOption {
  id: string;
  name: string;
  slug: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load groups
  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGroups(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Load summary stats
  const loadStats = (groupId?: string) => {
    setLoading(true);
    const url = groupId
      ? `/api/dashboard/summary?groupId=${groupId}`
      : '/api/dashboard/summary';
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats(selectedGroupId);
  }, [selectedGroupId]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bảng điều khiển thu phí
          </h1>
          <p className="text-sm text-slate-500">
            Theo dõi điểm danh, số tiền đã thu và đối soát tự động theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Group Filter */}
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="">Tất cả các lớp / nhóm</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => loadStats(selectedGroupId)}
            className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Tải lại số liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/attendance"
          className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-sm transition group"
        >
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Thao tác</span>
            <span className="text-sm font-bold text-slate-800">Điểm danh</span>
          </div>
        </Link>

        <Link
          href="/invoices"
          className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 hover:shadow-sm transition group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Thu phí</span>
            <span className="text-sm font-bold text-slate-800">Tạo đợt thu</span>
          </div>
        </Link>

        <Link
          href="/groups"
          className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition group"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Chế độ</span>
            <span className="text-sm font-bold text-slate-800">Màn hình Kiosk</span>
          </div>
        </Link>

        <Link
          href="/transactions"
          className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-amber-300 hover:shadow-sm transition group"
        >
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Chờ duyệt</span>
            <span className="text-sm font-bold text-slate-800">
              {stats?.unmatchedCount || 0} chưa khớp
            </span>
          </div>
        </Link>
      </div>

      {/* 6 Key Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Total Due */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng cần thu</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatVND(stats?.totalDue || 0)}
          </div>
          <p className="text-xs text-slate-500">
            Từ các hóa đơn đã phát hành
          </p>
        </div>

        {/* Card 2: Total Paid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Đã thu thực tế</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {formatVND(stats?.totalPaid || 0)}
          </div>
          <p className="text-xs text-emerald-700 font-medium">
            Đã gạch nợ tự động qua VietQR
          </p>
        </div>

        {/* Card 3: Remaining */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Còn phải thu</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {formatVND(stats?.remaining || 0)}
          </div>
          <p className="text-xs text-rose-600">
            {stats?.unpaidCount || 0} người chưa đóng • {stats?.partialCount || 0} đóng thiếu
          </p>
        </div>

        {/* Card 4: Collection Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tỷ lệ thu phí</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats?.collectionRate || 0}%</span>
            <span className="text-xs text-slate-500">đã hoàn thành</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats?.collectionRate || 0)}%` }}
            />
          </div>
        </div>

        {/* Card 5: Today Attendees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Điểm danh hôm nay</span>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.todayAttendeesCount || 0}{' '}
            <span className="text-sm font-normal text-slate-500">học viên có mặt</span>
          </div>
          <Link
            href="/attendance"
            className="text-xs text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            Mở sổ điểm danh <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 6: Unmatched Transactions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Cần xử lý thủ công</span>
            <HelpCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats?.unmatchedCount || 0}{' '}
            <span className="text-sm font-normal text-slate-500">giao dịch chưa khớp</span>
          </div>
          <Link
            href="/transactions"
            className="text-xs text-amber-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            Gán vào hóa đơn <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recent Bank Transactions Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Giao dịch ngân hàng gần đây</h2>
            <p className="text-xs text-slate-500">Nhận diện tự động qua SePay & Casso Webhook</p>
          </div>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
            stats.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">
                      {tx.matchedInvoice?.member?.name
                        ? `Thanh toán: ${tx.matchedInvoice.member.name}`
                        : 'Giao dịch chưa xác định'}
                    </span>
                    {tx.processingStatus === 'PROCESSED' || tx.processingStatus === 'MATCHED' ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Đã khớp
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Chưa khớp
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono line-clamp-1">{tx.content}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <span className="text-sm font-bold text-emerald-600 font-mono">
                    +{formatVND(tx.amount)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDateTimeVN(tx.transactionDate)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              Chưa có giao dịch ngân hàng nào phát sinh
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
