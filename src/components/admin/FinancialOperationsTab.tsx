'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Layers,
  Inbox
} from 'lucide-react';
import { formatVND, formatDateVN } from '@/lib/utils';

export interface TopUpOrder {
  id: string;
  tenantName: string;
  amount: number;
  provider: string;
  status: 'PENDING' | 'SUCCESS' | 'CANCELLED';
  createdAt: string;
  reference: string;
}

export interface CreditLedgerItem {
  id: string;
  tenantName: string;
  type: string;
  amount: number;
  balanceBefore?: number;
  balanceAfter: number;
  reason: string;
  adminEmail?: string;
  createdAt: string;
}

export interface CollectionItem {
  id: string;
  tenantName: string;
  payer: string;
  amount: number;
  bank: string;
  code: string;
  status: string;
  createdAt: string;
}

interface FinancialOperationsTabProps {
  initialSubTab?: 'REVENUE' | 'TOPUP_ORDERS' | 'LEDGER' | 'COLLECTIONS';
  topupOrders?: TopUpOrder[];
  ledgers?: CreditLedgerItem[];
  collections?: CollectionItem[];
  onActionToast?: (msg: string) => void;
}

export function FinancialOperationsTab({
  initialSubTab = 'REVENUE',
  topupOrders = [],
  ledgers = [],
  collections = [],
  onActionToast,
}: FinancialOperationsTabProps) {
  const [subTab, setSubTab] = useState<'REVENUE' | 'TOPUP_ORDERS' | 'LEDGER' | 'COLLECTIONS'>(
    initialSubTab
  );
  const [search, setSearch] = useState('');

  const filteredTopups = topupOrders.filter(
    (o) =>
      o.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      o.reference.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLedgers = ledgers.filter(
    (l) =>
      l.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCollections = collections.filter(
    (c) =>
      c.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      c.payer.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Switcher Navigation */}
      <div className="bg-white dark:bg-[#111726] p-4 sm:p-5 rounded-2xl border border-[#E4E7EC] dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('REVENUE')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              subTab === 'REVENUE'
                ? 'bg-[#2538D9] dark:bg-[#4F62FF] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Tổng quan tài chính
          </button>
          <button
            type="button"
            onClick={() => setSubTab('TOPUP_ORDERS')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              subTab === 'TOPUP_ORDERS'
                ? 'bg-[#2538D9] dark:bg-[#4F62FF] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Đơn nạp ví ({topupOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('LEDGER')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              subTab === 'LEDGER'
                ? 'bg-[#2538D9] dark:bg-[#4F62FF] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Sổ cái ví dịch vụ ({ledgers.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('COLLECTIONS')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              subTab === 'COLLECTIONS'
                ? 'bg-[#2538D9] dark:bg-[#4F62FF] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Thu hộ & Đối soát VietQR ({collections.length})
          </button>
        </div>

        {subTab !== 'REVENUE' && (
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm giao dịch..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-[#101828] dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Subtab 1: Revenue Overview */}
      {subTab === 'REVENUE' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs text-slate-400">Doanh thu phí dịch vụ nền tảng (MRR)</span>
            <p className="text-2xl font-semibold text-[#101828] dark:text-white tabular-nums">0 đ</p>
            <p className="text-[11px] text-slate-400">Từ các gói PRO và ENTERPRISE</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs text-slate-400">Tổng số dư ví khách hàng (Float)</span>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">10.000.000 đ</p>
            <p className="text-[11px] text-slate-400">Số dư duy trì dịch vụ webhook</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs text-slate-400">Tổng GMV đối soát qua hệ thống</span>
            <p className="text-2xl font-semibold text-[#2538D9] dark:text-[#4F62FF] tabular-nums">0 đ</p>
            <p className="text-[11px] text-slate-400">Cơ chế Zero-Custody Napas 24/7</p>
          </div>
        </div>
      )}

      {/* Subtab 2: Topup Orders Table */}
      {subTab === 'TOPUP_ORDERS' && (
        <div className="bg-white dark:bg-[#111726] rounded-2xl border border-[#E4E7EC] dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-[#EAECF0] dark:border-slate-800 text-[11px] font-semibold text-[#475467] dark:text-slate-400 uppercase">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Mã đơn & Người nạp</th>
                  <th className="py-3.5 px-4">Số tiền nạp</th>
                  <th className="py-3.5 px-4">Cổng nạp</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTopups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Inbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-medium text-sm text-[#101828] dark:text-white">Chưa có đơn nạp ví nào</p>
                      <p className="text-xs text-slate-500 mt-1">Khi người dùng nạp tiền ví dịch vụ, thông tin sẽ hiển thị tại đây.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTopups.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-4 sm:px-6">
                        <p className="font-semibold text-slate-900 dark:text-white">{t.tenantName}</p>
                        <p className="text-[11px] text-slate-400">{t.reference}</p>
                      </td>
                      <td className="py-4 px-4 font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +{formatVND(t.amount)}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300">{t.provider}</td>
                      <td className="py-4 px-4 text-slate-400">{t.createdAt}</td>
                      <td className="py-4 px-4">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Ledger Table */}
      {subTab === 'LEDGER' && (
        <div className="bg-white dark:bg-[#111726] rounded-2xl border border-[#E4E7EC] dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-[#EAECF0] dark:border-slate-800 text-[11px] font-semibold text-[#475467] dark:text-slate-400 uppercase">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Tài khoản & Lý do</th>
                  <th className="py-3.5 px-4">Biến động</th>
                  <th className="py-3.5 px-4">Số dư sau</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLedgers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <Inbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-medium text-sm text-[#101828] dark:text-white">Sổ cái ví đang trống</p>
                      <p className="text-xs text-slate-500 mt-1">Các giao dịch biến động ví dịch vụ thực tế sẽ được ghi lại tại đây.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLedgers.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-4 sm:px-6">
                        <p className="font-semibold text-slate-900 dark:text-white">{l.tenantName}</p>
                        <p className="text-[11px] text-slate-500">{l.reason}</p>
                      </td>
                      <td className={`py-4 px-4 font-semibold tabular-nums ${
                        l.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {l.amount >= 0 ? `+${formatVND(l.amount)}` : formatVND(l.amount)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                        {formatVND(l.balanceAfter)}
                      </td>
                      <td className="py-4 px-4 text-slate-400">{l.createdAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 4: Collections Table */}
      {subTab === 'COLLECTIONS' && (
        <div className="bg-white dark:bg-[#111726] rounded-2xl border border-[#E4E7EC] dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-[#EAECF0] dark:border-slate-800 text-[11px] font-semibold text-[#475467] dark:text-slate-400 uppercase">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Không gian & Người nộp</th>
                  <th className="py-3.5 px-4">Số tiền đối soát</th>
                  <th className="py-3.5 px-4">Mã tham chiếu</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCollections.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <Inbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-medium text-sm text-[#101828] dark:text-white">Chưa có giao dịch đối soát nào</p>
                      <p className="text-xs text-slate-500 mt-1">Khi có giao dịch chuyển khoản VietQR Napas thật, nhật ký sẽ tự động cập nhật.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCollections.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-4 sm:px-6">
                        <p className="font-semibold text-slate-900 dark:text-white">{c.tenantName}</p>
                        <p className="text-[11px] text-slate-500">{c.payer}</p>
                      </td>
                      <td className="py-4 px-4 font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatVND(c.amount)}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-600 dark:text-slate-300">{c.code}</td>
                      <td className="py-4 px-4 text-slate-400">{c.createdAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
