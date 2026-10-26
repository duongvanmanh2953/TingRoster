'use client';

import React, { useEffect, useState } from 'react';
import { formatVND, formatDateVN } from '@/lib/utils';
import {
  CreditCard,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  QrCode
} from 'lucide-react';
import Link from 'next/link';

interface InvoiceItem {
  id: string;
  publicToken: string;
  paymentCode: string;
  title: string;
  amountDue: number;
  amountPaid: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERPAID' | 'VOID';
  dueDate?: string | null;
  createdAt: string;
  member: {
    id: string;
    name: string;
    phone?: string | null;
  };
  group: {
    id: string;
    name: string;
    slug: string;
  };
}

interface GroupOption {
  id: string;
  name: string;
  defaultFee: number;
  slug: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Bulk creation form states
  const [batchGroupId, setBatchGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [pricingType, setPricingType] = useState<'FIXED' | 'PER_SESSION'>('FIXED');
  const [fixedAmount, setFixedAmount] = useState(500000);
  const [feePerSession, setFeePerSession] = useState(50000);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load groups
  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setGroups(data.data);
          setBatchGroupId(data.data[0].id);
          setTitle(`Học phí tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`);
        }
      })
      .catch(() => {});
  }, []);

  const loadInvoices = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedGroupId) params.append('groupId', selectedGroupId);
    if (selectedStatus) params.append('status', selectedStatus);
    if (search) params.append('search', search);

    fetch(`/api/invoices?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInvoices(data.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, [selectedGroupId, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInvoices();
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/invoices/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: batchGroupId,
          title,
          pricingType,
          fixedAmount: Number(fixedAmount),
          feePerSession: Number(feePerSession),
          startDate,
          endDate,
          dueDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        loadInvoices();
      } else {
        setFormError(data.error || 'Lỗi tạo đợt thu');
      }
    } catch {
      setFormError('Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (groupSlug: string, publicToken: string) => {
    const url = `${window.location.origin}/p/${groupSlug}?token=${publicToken}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(publicToken);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Học phí & Hóa đơn
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase">
              VietQR Napas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Quản lý đợt thu, tạo mã thanh toán riêng biệt cho từng thành viên và theo dõi công nợ
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tạo đợt thu mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="ting-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã TR, tên học viên..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#111726] border border-[#1E283D] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="text-xs font-semibold border border-[#1E283D] rounded-xl px-3 py-2 bg-[#111726] text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Tất cả các lớp</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold border border-[#1E283D] rounded-xl px-3 py-2 bg-[#111726] text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="UNPAID">Chưa đóng</option>
            <option value="PARTIAL">Đóng thiếu</option>
            <option value="PAID">Đã đóng đủ</option>
            <option value="OVERPAID">Đóng thừa</option>
          </select>

          <button
            onClick={loadInvoices}
            className="p-2 border border-[#1E283D] rounded-xl hover:bg-[#182136] text-slate-400 hover:text-white transition"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="ting-card overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 animate-pulse text-xs">Đang tải danh sách hóa đơn...</div>
        ) : invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111726] border-b border-[#1E283D] text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã thu</th>
                  <th className="py-3 px-4">Học viên</th>
                  <th className="py-3 px-4">Lớp / Nhóm</th>
                  <th className="py-3 px-4 text-right">Phải thu</th>
                  <th className="py-3 px-4 text-right">Đã thu</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Hạn nộp</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2338]">
                {invoices.map((inv) => {
                  return (
                    <tr key={inv.id} className="hover:bg-[#131C2E] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {inv.paymentCode}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {inv.member.name}
                        {inv.member.phone && (
                          <span className="block text-[10px] text-slate-400 font-normal">{inv.member.phone}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {inv.group.name}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatVND(inv.amountDue)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {formatVND(inv.amountPaid)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {inv.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            <CheckCircle2 className="w-3 h-3" /> Đã đóng
                          </span>
                        ) : inv.status === 'PARTIAL' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                            <Clock className="w-3 h-3" /> Đóng thiếu
                          </span>
                        ) : inv.status === 'OVERPAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/25">
                            Đóng thừa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                            <AlertCircle className="w-3 h-3" /> Chưa đóng
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                        {formatDateVN(inv.dueDate)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(inv.group.slug, inv.publicToken)}
                            className="p-1.5 border border-[#1E283D] rounded-lg hover:bg-[#182136] text-slate-400 hover:text-white transition"
                            title="Sao chép link VietQR gửi phụ huynh"
                          >
                            {copiedToken === inv.publicToken ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <Link
                            href={`/p/${inv.group.slug}?token=${inv.publicToken}`}
                            target="_blank"
                            className="p-1.5 border border-[#1E283D] rounded-lg hover:bg-[#182136] text-emerald-400 transition"
                            title="Xem trang thanh toán VietQR"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <p className="text-xs">Chưa có hóa đơn nào phù hợp với bộ lọc</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl transition"
            >
              Tạo đợt thu mới
            </button>
          </div>
        )}
      </div>

      {/* Batch Create Invoices Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1626] border border-[#1E283D] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#1E283D] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Tạo đợt thu học phí mới</h3>
                <p className="text-[11px] text-slate-400">Tự động sinh mã VietQR riêng cho từng học viên trong lớp</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chọn Lớp / Nhóm *
                </label>
                <select
                  value={batchGroupId}
                  onChange={(e) => setBatchGroupId(e.target.value)}
                  className="w-full border border-[#1E283D] rounded-xl px-3.5 py-2.5 bg-[#111726] text-white focus:outline-none focus:border-emerald-500"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tiêu đề đợt thu *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Học phí Tháng 11/2026..."
                  className="w-full border border-[#1E283D] rounded-xl px-3.5 py-2.5 bg-[#111726] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phương thức tính phí
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPricingType('FIXED')}
                    className={`p-3 rounded-xl border text-left font-medium transition ${
                      pricingType === 'FIXED'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'border-[#1E283D] bg-[#111726] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-bold text-xs text-white">Cố định tháng</span>
                    <span className="text-[11px] text-slate-400">Mức phí đồng đều cho cả lớp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPricingType('PER_SESSION')}
                    className={`p-3 rounded-xl border text-left font-medium transition ${
                      pricingType === 'PER_SESSION'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'border-[#1E283D] bg-[#111726] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-bold text-xs text-white">Theo số buổi điểm danh</span>
                    <span className="text-[11px] text-slate-400">Nhân với số buổi có mặt thực tế</span>
                  </button>
                </div>
              </div>

              {pricingType === 'FIXED' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số tiền cố định mỗi học viên (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(Number(e.target.value))}
                    className="w-full border border-[#1E283D] rounded-xl px-3.5 py-2.5 bg-[#111726] text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-[#111726] rounded-xl border border-[#1E283D]">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Đơn giá mỗi buổi học (VND)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={feePerSession}
                      onChange={(e) => setFeePerSession(Number(e.target.value))}
                      className="w-full border border-[#1E283D] rounded-xl px-3.5 py-2 bg-[#0F1626] text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Từ ngày</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-[#1E283D] rounded-xl px-3 py-1.5 bg-[#0F1626] text-white focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Đến ngày</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-[#1E283D] rounded-xl px-3 py-1.5 bg-[#0F1626] text-white focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hạn nộp học phí
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-[#1E283D] rounded-xl px-3.5 py-2.5 bg-[#111726] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E283D]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo đợt thu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
