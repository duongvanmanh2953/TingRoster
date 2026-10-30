'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
  Receipt,
  FileCheck2,
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatVND, formatDateVN } from '@/lib/utils';
import CircularProgress from '@mui/material/CircularProgress';

interface SurchargeItem {
  id: string;
  title: string;
  category: 'PRE_AGREED' | 'NEW_INCIDENTAL' | 'INDEMNITY_VIOLATION';
  amount: number;
  reason: string;
  evidenceUrl?: string | null;
  clauseReference?: string | null;
  status: 'DRAFT' | 'PROPOSED' | 'WAITING_FOR_PARTY_B' | 'ACCEPTED' | 'REJECTED' | 'DISPUTED' | 'CANCELLED';
  proposedByName: string;
  responseNote?: string | null;
  respondedAt?: string | null;
  invoicedAt?: string | null;
  invoiceId?: string | null;
  createdAt: string;
  member: {
    id: string;
    name: string;
    phone?: string | null;
  };
}

interface MemberOption {
  id: string;
  name: string;
  phone?: string | null;
}

export default function SpaceSurchargesPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const [space, setSpace] = useState<any>(null);
  const [surcharges, setSurcharges] = useState<SurchargeItem[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Create Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    memberId: '',
    title: '',
    category: 'NEW_INCIDENTAL' as 'PRE_AGREED' | 'NEW_INCIDENTAL' | 'INDEMNITY_VIOLATION',
    amount: 100000,
    reason: '',
    clauseReference: '',
    evidenceUrl: '',
  });

  const loadData = useCallback(async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const [spaceRes, surRes, memRes] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/groups/${groupId}/surcharges`),
        fetch(`/api/members?groupId=${groupId}`),
      ]);
      const [spaceJson, surJson, memJson] = await Promise.all([
        spaceRes.json(),
        surRes.json(),
        memRes.json(),
      ]);

      if (spaceJson.success) setSpace(spaceJson.data);
      if (surJson.success && Array.isArray(surJson.data)) {
        setSurcharges(surJson.data);
      }
      if (memJson.success && Array.isArray(memJson.data)) {
        setMembers(memJson.data);
        if (memJson.data.length > 0 && !formData.memberId) {
          setFormData((prev) => ({ ...prev, memberId: memJson.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId, formData.memberId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/groups/${groupId}/surcharges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Lỗi khi tạo đề xuất phụ thu');

      setCreateModalOpen(false);
      setFormData({
        memberId: members[0]?.id || '',
        title: '',
        category: 'NEW_INCIDENTAL',
        amount: 100000,
        reason: '',
        clauseReference: '',
        evidenceUrl: '',
      });
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertToInvoice = async (surchargeId: string) => {
    if (!confirm('Xác nhận xuất hóa đơn VietQR cho khoản phụ thu đã được đối tác chấp thuận?')) return;
    try {
      setActionLoadingId(surchargeId);
      const res = await fetch(`/api/groups/${groupId}/surcharges/${surchargeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CONVERT_TO_INVOICE' }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Lỗi xuất hóa đơn');

      alert('Đã xuất hóa đơn thành công! Khoản thu đã sẵn sàng nhận thanh toán VietQR.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Không thể xuất hóa đơn');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    return surcharges.filter((it) => {
      const matchSearch =
        it.title.toLowerCase().includes(search.toLowerCase()) ||
        it.member.name.toLowerCase().includes(search.toLowerCase()) ||
        (it.clauseReference && it.clauseReference.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || it.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [surcharges, search, statusFilter]);

  const getStatusBadge = (status: string, invoicedAt?: string | null) => {
    if (invoicedAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
          <Receipt className="w-3 h-3" />
          Đã xuất hóa đơn
        </span>
      );
    }

    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" />
            Đã đồng ý
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
            <AlertTriangle className="w-3 h-3" />
            Đang khiếu nại
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <XCircle className="w-3 h-3" />
            Bên kia từ chối
          </span>
        );
      case 'PROPOSED':
      case 'WAITING_FOR_PARTY_B':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <Clock className="w-3 h-3" />
            Chờ bên kia xác nhận
          </span>
        );
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'PRE_AGREED':
        return <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">Đã có trong thỏa thuận</span>;
      case 'INDEMNITY_VIOLATION':
        return <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 whitespace-nowrap">Vi phạm / Bồi hoàn</span>;
      case 'NEW_INCIDENTAL':
      default:
        return <span className="text-[11px] font-semibold text-indigo-700 bg-black-50 px-2 py-0.5 rounded border border-indigo-200 whitespace-nowrap">Phát sinh mới ngoài hợp đồng</span>;
    }
  };

  return (
    <div className="space-y-6">
      {space && (
        <SpaceNavHeader
          space={{
            id: space.id,
            name: space.name,
            slug: space.slug || space.id,
            code: space.code,
            groupType: space.groupType,
          }}
          activeSection="invoices"
        />
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#2538D9]" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Quản lý Phụ thu & Chấp thuận Hai bên
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quy trình đề xuất minh bạch: Có bằng chứng, liên kết điều khoản hợp đồng và bắt buộc hai bên xác nhận trước khi lập hóa đơn.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2538D9] text-white text-xs font-bold hover:bg-[#1D2DB0] transition-colors shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Đề xuất khoản phụ thu mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'PROPOSED', label: 'Chờ xác nhận' },
            { key: 'ACCEPTED', label: 'Đã đồng ý' },
            { key: 'DISPUTED', label: 'Đang khiếu nại' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-[#2538D9] text-white'
                  : 'bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề, thành viên..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/10">
          <CircularProgress size={28} />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/10">
          <FileCheck2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa có khoản phụ thu nào</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Mọi khoản phụ phí phát sinh mới hoặc bồi hoàn hư hao thiết bị đều được quản lý minh bạch tại đây.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Khoản phụ thu & Tính chất</th>
                  <th className="py-3 px-4">Thành viên / Đối tác</th>
                  <th className="py-3 px-4 text-right">Số tiền</th>
                  <th className="py-3 px-4">Căn cứ & Bằng chứng</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                      <div className="mt-1 flex items-center gap-1.5">{getCategoryLabel(item.category)}</div>
                      <div className="text-[11px] text-slate-500 mt-1">{item.reason}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{item.member.name}</div>
                      {item.member.phone && (
                        <div className="text-[11px] text-slate-400">{item.member.phone}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#2538D9] dark:text-indigo-400 tabular-nums">
                      {formatVND(item.amount)}
                    </td>
                    <td className="py-3 px-4">
                      {item.clauseReference ? (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                          Điều khoản: {item.clauseReference}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Thỏa thuận phát sinh</span>
                      )}
                      {item.evidenceUrl && (
                        <a
                          href={item.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#2538D9] hover:underline mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Xem bằng chứng / ảnh
                        </a>
                      )}
                      {item.responseNote && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded">
                          Ý kiến bên kia: {item.responseNote}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(item.status, item.invoicedAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.status === 'ACCEPTED' && !item.invoicedAt ? (
                        <button
                          type="button"
                          onClick={() => handleConvertToInvoice(item.id)}
                          disabled={actionLoadingId === item.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-colors whitespace-nowrap"
                        >
                          {actionLoadingId === item.id ? (
                            <CircularProgress size={12} color="inherit" />
                          ) : (
                            <Receipt className="w-3 h-3" />
                          )}
                          Xuất hóa đơn
                        </button>
                      ) : item.invoicedAt ? (
                        <span className="text-[11px] text-slate-400 font-medium">Đã xử lý</span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Chờ xác nhận</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Proposal Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Đề xuất Phụ thu / Khoản Bồi hoàn
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gửi đề xuất tới thành viên để xác nhận đồng thuận trước khi lập hóa đơn
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Member selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Thành viên / Đối tác liên quan *
                </label>
                <select
                  required
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.phone ? `(${m.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tính chất khoản phụ thu *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="NEW_INCIDENTAL">Khoản phí phát sinh mới (Bên kia xem xét chấp nhận/từ chối)</option>
                  <option value="INDEMNITY_VIOLATION">Khoản vi phạm / bồi hoàn hư hao thiết bị (Có bằng chứng)</option>
                  <option value="PRE_AGREED">Khoản phí đã thỏa thuận trước trong hợp đồng</option>
                </select>
              </div>

              {/* Title & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tiêu đề phụ thu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Phí vệ sinh đột xuất P.202"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số tiền đề xuất (VND) *
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="1000"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-[#2538D9] dark:text-indigo-400 focus:outline-hidden tabular-nums"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lý do & Giải trình chi tiết *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mô tả sự việc phát sinh, thời gian xảy ra và cách tính số tiền..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full text-xs font-medium p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Contract Clause Reference & Evidence URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Điều khoản hợp đồng liên quan
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Điều 3.2 HĐ-202"
                    value={formData.clauseReference}
                    onChange={(e) => setFormData({ ...formData, clauseReference: e.target.value })}
                    className="w-full text-xs font-medium p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link ảnh / bằng chứng
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.evidenceUrl}
                    onChange={(e) => setFormData({ ...formData, evidenceUrl: e.target.value })}
                    className="w-full text-xs font-medium p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#2538D9] text-white text-xs font-bold hover:bg-[#1D2DB0] transition-colors whitespace-nowrap"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi đề xuất tới đối tác'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
