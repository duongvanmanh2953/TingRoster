'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  QrCode,
  CreditCard,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  FileText
} from 'lucide-react';
import { formatVND, formatCompactVND, formatDateVN } from '@/lib/utils';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import Chip from '@mui/material/Chip';

export interface TopUpOrder {
  id: string;
  tenantName: string;
  amount: number;
  provider: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
  reference: string;
}

export interface CreditLedgerItem {
  id: string;
  tenantName: string;
  type: 'TOP_UP' | 'SERVICE_CHARGE' | 'ADJUSTMENT' | 'COMPENSATION';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  adminEmail: string;
  createdAt: string;
}

interface FinancialOperationsTabProps {
  initialSubTab?: 'REVENUE' | 'TOPUP_ORDERS' | 'LEDGER' | 'COLLECTIONS';
  onActionToast?: (msg: string) => void;
}

export function FinancialOperationsTab({
  initialSubTab = 'REVENUE',
  onActionToast,
}: FinancialOperationsTabProps) {
  const [subTab, setSubTab] = useState<'REVENUE' | 'TOPUP_ORDERS' | 'LEDGER' | 'COLLECTIONS'>(
    initialSubTab
  );
  const [search, setSearch] = useState('');

  const mockTopupOrders: TopUpOrder[] = [
    {
      id: 'TOP-20261028-01',
      tenantName: 'Thầy Hưng Toán Luyện Thi ĐH',
      amount: 500000,
      provider: 'VietQR SeABank',
      status: 'SUCCESS',
      createdAt: '2026-10-28 10:15',
      reference: 'TRTOP500K12',
    },
    {
      id: 'TOP-20261028-02',
      tenantName: 'Nhà Trọ An Cư 12 Phòng',
      amount: 200000,
      provider: 'VietQR MBBank',
      status: 'SUCCESS',
      createdAt: '2026-10-28 09:40',
      reference: 'TRTOP200K88',
    },
    {
      id: 'TOP-20261028-03',
      tenantName: 'CLB Cầu Lông Thủ Đức Stars',
      amount: 1000000,
      provider: 'VietQR Techcombank',
      status: 'PENDING',
      createdAt: '2026-10-28 08:30',
      reference: 'TRTOP1M04',
    },
    {
      id: 'TOP-20261027-04',
      tenantName: 'Trung tâm Ngoại ngữ Alpha',
      amount: 2000000,
      provider: 'VietQR Vietcombank',
      status: 'SUCCESS',
      createdAt: '2026-10-27 15:20',
      reference: 'TRTOP2M91',
    },
  ];

  const mockLedgers: CreditLedgerItem[] = [
    {
      id: 'LED-9001',
      tenantName: 'Thầy Hưng Toán Luyện Thi ĐH',
      type: 'TOP_UP',
      amount: 500000,
      balanceBefore: 42500,
      balanceAfter: 542500,
      reason: 'Nạp ví duy trì qua VietQR Napas (Mã ref TRTOP500K12)',
      adminEmail: 'system_webhook@tingroster.vn',
      createdAt: '2026-10-28 10:15',
    },
    {
      id: 'LED-9002',
      tenantName: 'Nhà Trọ An Cư 12 Phòng',
      type: 'SERVICE_CHARGE',
      amount: -1500,
      balanceBefore: 120500,
      balanceAfter: 119000,
      reason: 'Trừ cước 3 giao dịch VietQR đối soát thành công (500đ/tx)',
      adminEmail: 'system_reconciliation@tingroster.vn',
      createdAt: '2026-10-28 09:55',
    },
    {
      id: 'LED-9003',
      tenantName: 'CLB Cầu Lông Thủ Đức Stars',
      type: 'ADJUSTMENT',
      amount: 100000,
      balanceBefore: 15000,
      balanceAfter: 115000,
      reason: 'Tặng số dư khuyến khích trải nghiệm sau buổi demo trực tiếp',
      adminEmail: 'superadmin@tingroster.vn',
      createdAt: '2026-10-28 08:00',
    },
  ];

  const mockCollections = [
    {
      id: 'COL-8801',
      tenantName: 'Thầy Hưng Toán Luyện Thi ĐH',
      payer: 'Phụ huynh em Nguyễn Hoàng Nam',
      amount: 1200000,
      bank: 'MBBank • STK 0987654321',
      code: 'TR98201',
      status: 'MATCHED_DIRECT',
      createdAt: '10 phút trước',
    },
    {
      id: 'COL-8802',
      tenantName: 'Nhà Trọ An Cư 12 Phòng',
      payer: 'Khách thuê Phòng 204 (Lê Văn An)',
      amount: 3200000,
      bank: 'VietinBank • STK 1029384756',
      code: 'TR77104',
      status: 'MATCHED_DIRECT',
      createdAt: '25 phút trước',
    },
    {
      id: 'COL-8803',
      tenantName: 'CLB Cầu Lông Thủ Đức Stars',
      payer: 'Hội viên Trần Minh Đức',
      amount: 450000,
      bank: 'Techcombank • STK 1903829102',
      code: 'TR55392',
      status: 'MATCHED_DIRECT',
      createdAt: '1 giờ trước',
    },
  ];

  const handleManualReconcile = (orderId: string) => {
    onActionToast?.(
      `Đã gửi yêu cầu kiểm tra webhook lại cho đơn ${orderId} — Đang đồng bộ với ngân hàng!`
    );
  };

  return (
    <div className="space-y-6">
      {/* Financial Domain Boundary Banner */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-l-4 border-l-[#2538D9]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#2538D9] shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Quy Chuẩn Phân Định Ranh Giới Tài Chính Bất Biến
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              <strong>Miền A (Platform Credits / Float):</strong> Số dư nạp ví dịch vụ trả phí duy trì TingRoster (500đ/tx đối soát, ZNS).
              <span className="mx-2 text-slate-300">|</span>
              <strong>Miền B (Customer Collections):</strong> Tiền học phí/tiền trọ luân chuyển qua VietQR trực tiếp về STK ngân hàng của chủ cơ sở. <em>TingRoster zero-custody, tuyệt đối không gộp 2 dòng tiền này!</em>
            </p>
          </div>
        </div>
        <a
          href="/docs/financial-domain-boundaries.md"
          target="_blank"
          className="text-xs font-semibold text-[#2538D9] dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 rounded-lg"
        >
          Đặc tả tài chính
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button
          onClick={() => setSubTab('REVENUE')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            subTab === 'REVENUE'
              ? 'bg-[#2538D9] text-white shadow-md shadow-blue-900/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-[#E5E7EB] dark:border-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tổng quan Doanh thu & MRR</span>
        </button>

        <button
          onClick={() => setSubTab('TOPUP_ORDERS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            subTab === 'TOPUP_ORDERS'
              ? 'bg-[#2538D9] text-white shadow-md shadow-blue-900/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-[#E5E7EB] dark:border-slate-700'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Đơn Nạp Tiền Ví Dịch Vụ ({mockTopupOrders.length})</span>
        </button>

        <button
          onClick={() => setSubTab('LEDGER')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            subTab === 'LEDGER'
              ? 'bg-[#2538D9] text-white shadow-md shadow-blue-900/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-[#E5E7EB] dark:border-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Sổ Cái CreditLedger (Append-only)</span>
        </button>

        <button
          onClick={() => setSubTab('COLLECTIONS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            subTab === 'COLLECTIONS'
              ? 'bg-[#2538D9] text-white shadow-md shadow-blue-900/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-[#E5E7EB] dark:border-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Giám Sát Tiền Thu Cơ Sở (Miền B)</span>
        </button>
      </div>

      {/* SubTab 1: REVENUE OVERVIEW */}
      {subTab === 'REVENUE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SpotlightCard className="p-5 bg-white dark:bg-[#111C33] border border-[#E5E7EB] dark:border-slate-800 rounded-2xl shadow-xs">
              <span className="text-xs font-medium text-slate-500">Doanh thu định kỳ (MRR TingRoster)</span>
              <div className="mt-2 text-2xl font-bold text-emerald-600 tracking-tight">
                68.500.000 ₫
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                <span>Gói Pro (299k) + Enterprise (699k)</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">68.5M ₫</span>
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-5 bg-white dark:bg-[#111C33] border border-[#E5E7EB] dark:border-slate-800 rounded-2xl shadow-xs">
              <span className="text-xs font-medium text-slate-500">Phí đối soát VietQR (500đ/tx)</span>
              <div className="mt-2 text-2xl font-bold text-[#2538D9] tracking-tight">
                14.250.000 ₫
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                <span>Tổng 28.500 giao dịch tháng này</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">14.3M ₫</span>
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-5 bg-white dark:bg-[#111C33] border border-[#E5E7EB] dark:border-slate-800 rounded-2xl shadow-xs">
              <span className="text-xs font-medium text-slate-500">Số dư Quỹ Ví Nạp (Platform Float)</span>
              <div className="mt-2 text-2xl font-bold text-purple-700 tracking-tight">
                38.600.000 ₫
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                <span>Tài khoản MBBank TingRoster</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">An toàn 100%</span>
              </p>
            </SpotlightCard>
          </div>
        </div>
      )}

      {/* SubTab 2: TOPUP ORDERS */}
      {subTab === 'TOPUP_ORDERS' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E5E7EB] dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Danh Sách Đơn Nạp Tiền Ví Dịch Vụ</h3>
              <p className="text-xs text-slate-500">Chủ cơ sở nạp tiền duy trì bằng VietQR Napas 24/7</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">Tổng {mockTopupOrders.length} đơn gần nhất</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-slate-500 uppercase bg-[#F9FAFB] dark:bg-[#0B0F19]">
                  <th className="py-3 px-3">Mã đơn / Reference</th>
                  <th className="py-3 px-3">Cơ sở nạp tiền</th>
                  <th className="py-3 px-3">Số tiền nạp</th>
                  <th className="py-3 px-3">Cổng ngân hàng</th>
                  <th className="py-3 px-3">Thời điểm tạo</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {mockTopupOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{order.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">Ref: {order.reference}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{order.tenantName}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">{formatVND(order.amount)}</td>
                    <td className="py-3 px-3 font-medium text-slate-600">{order.provider}</td>
                    <td className="py-3 px-3 text-slate-500">{order.createdAt}</td>
                    <td className="py-3 px-3">
                      <Chip
                        label={order.status === 'SUCCESS' ? 'THÀNH CÔNG' : 'PENDING (>30P)'}
                        size="small"
                        sx={{
                          bgcolor: order.status === 'SUCCESS' ? '#ECFDF3' : '#FEF3F2',
                          color: order.status === 'SUCCESS' ? '#067647' : '#B42318',
                          fontWeight: 700,
                        }}
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      {order.status === 'PENDING' ? (
                        <button
                          onClick={() => handleManualReconcile(order.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#2538D9] text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                        >
                          Đối soát lại
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Đã ghi sổ cái</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: CREDIT LEDGER */}
      {subTab === 'LEDGER' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E5E7EB] dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sổ Cái Biến Động Số Dư (Credit Ledger Entry)</h3>
              <p className="text-xs text-slate-500">Nguyên tắc kế toán: Bút toán append-only, không xóa sửa dữ liệu lịch sử</p>
            </div>
            <Chip label="BẢO MẬT & BẤT BIẾN" size="small" sx={{ bgcolor: '#EFF8FF', color: '#175CD3', fontWeight: 700 }} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-slate-500 uppercase bg-[#F9FAFB] dark:bg-[#0B0F19]">
                  <th className="py-3 px-3">Mã bút toán</th>
                  <th className="py-3 px-3">Cơ sở áp dụng</th>
                  <th className="py-3 px-3">Loại bút toán</th>
                  <th className="py-3 px-3">Số tiền biến động</th>
                  <th className="py-3 px-3">Số dư Trước &rarr; Sau</th>
                  <th className="py-3 px-3">Lý do ghi nhận</th>
                  <th className="py-3 px-3">Người ghi sổ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {mockLedgers.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{l.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{l.tenantName}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {l.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold">
                      <span className={l.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {l.amount >= 0 ? `+${formatVND(l.amount)}` : formatVND(l.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {formatVND(l.balanceBefore)} &rarr; <strong className="text-slate-900">{formatVND(l.balanceAfter)}</strong>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-400 font-mono">{l.adminEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 4: CUSTOMER COLLECTIONS MONITORING */}
      {subTab === 'COLLECTIONS' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E5E7EB] dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Giám Sát Luồng Tiền Học Phí & Tiền Trọ (Miền B)</h3>
              <p className="text-xs text-slate-500">Tiền quét qua VietQR chuyển trực tiếp vào STK ngân hàng của chủ cơ sở</p>
            </div>
            <Chip label="ZERO-CUSTODY" size="small" sx={{ bgcolor: '#ECFDF3', color: '#067647', fontWeight: 700 }} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-slate-500 uppercase bg-[#F9FAFB] dark:bg-[#0B0F19]">
                  <th className="py-3 px-3">Mã giao dịch</th>
                  <th className="py-3 px-3">Cơ sở thụ hưởng</th>
                  <th className="py-3 px-3">Người chuyển tiền</th>
                  <th className="py-3 px-3">Số tiền</th>
                  <th className="py-3 px-3">STK ngân hàng cơ sở</th>
                  <th className="py-3 px-3">Mã đối soát</th>
                  <th className="py-3 px-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {mockCollections.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{c.tenantName}</td>
                    <td className="py-3 px-3 text-slate-600">{c.payer}</td>
                    <td className="py-3 px-3 font-bold text-[#2538D9]">{formatVND(c.amount)}</td>
                    <td className="py-3 px-3 font-medium text-slate-600">{c.bank}</td>
                    <td className="py-3 px-3 font-mono text-[11px] font-bold text-slate-700">{c.code}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        VỀ THẲNG STK CƠ SỞ
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
