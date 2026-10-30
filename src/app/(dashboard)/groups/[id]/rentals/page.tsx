'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Building2,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Users,
  Loader2,
  Calendar
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatVND } from '@/lib/utils';
import { TingDatePicker } from '@/components/common/DatePicker';
import { TingSelect } from '@/components/common/Select';

interface ContractItem {
  id: string;
  roomNumber: string;
  contractCode: string;
  monthlyRent: number;
  depositAmount: number;
  startDate: string;
  endDate?: string | null;
  billingDayOfMonth: number;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'TERMINATED';
  notes?: string | null;
  member: { id: string; name: string; phone?: string | null };
}

export default function SpaceRentalsPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; name: string; phone?: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  // Modal create
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    memberId: '',
    contractCode: '',
    monthlyRent: 3500000,
    depositAmount: 3500000,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    billingDayOfMonth: 5,
    notes: '',
  });

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${spaceId}/rentals`);
      const data = await res.json();
      if (data.success) {
        setContracts(data.data || []);
        setMembers(data.members || []);
        setSpace(data.group || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (spaceId) {
      fetchRentals();
    }
  }, [spaceId]);

  const handleOpenCreate = () => {
    const nextRoom = `P.${101 + contracts.length}`;
    setFormData({
      roomNumber: nextRoom,
      memberId: members[0]?.id || '',
      contractCode: `HD-${nextRoom.replace('.', '')}-${Math.floor(100 + Math.random() * 900)}`,
      monthlyRent: space?.defaultFee || 3500000,
      depositAmount: space?.defaultFee || 3500000,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      billingDayOfMonth: 5,
      notes: '',
    });
    setModalOpen(true);
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/groups/${spaceId}/rentals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monthlyRent: Number(formData.monthlyRent),
          depositAmount: Number(formData.depositAmount),
          billingDayOfMonth: Number(formData.billingDayOfMonth),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setModalOpen(false);
      await fetchRentals();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo hợp đồng thuê');
    } finally {
      setSaving(false);
    }
  };

  const totalMonthlyRent = contracts.reduce((sum, c) => sum + c.monthlyRent, 0);

  return (
    <div className="space-y-6">
      {space && (
        <SpaceNavHeader
          space={{
            id: space.id,
            name: space.name,
            slug: space.slug || space.id,
            code: space.code,
            groupType: 'RENTAL',
          }}
          activeSection="rentals"
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>Quản lý Phòng & Hợp đồng Thuê</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi tình trạng phòng trống, người thuê, tiền cọc, hạn hợp đồng và chu kỳ thu tiền.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo hợp đồng mới</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng phòng đang thuê</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {contracts.length} phòng
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-indigo-700 dark:text-indigo-400">Tổng tiền thuê / tháng</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {formatVND(totalMonthlyRent)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Tổng tiền cọc đang giữ</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {formatVND(contracts.reduce((sum, c) => sum + c.depositAmount, 0))}
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Đang tải danh sách hợp đồng...</span>
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            Chưa có hợp đồng nào. Nhấn &quot;Tạo hợp đồng mới&quot; để gán người thuê vào phòng.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-4">Số phòng & Mã HĐ</th>
                  <th className="py-3 px-4">Người thuê</th>
                  <th className="py-3 px-4 text-right">Tiền thuê / tháng</th>
                  <th className="py-3 px-4 text-right">Tiền cọc</th>
                  <th className="py-3 px-4 text-center">Ngày bắt đầu</th>
                  <th className="py-3 px-4 text-center">Thu ngày</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">Phòng {c.roomNumber}</div>
                      <div className="text-[11px] font-mono text-slate-400">{c.contractCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{c.member?.name}</div>
                      <div className="text-[11px] text-slate-400">{c.member?.phone || '—'}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {formatVND(c.monthlyRent)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {formatVND(c.depositAmount)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[11px]">
                      {new Date(c.startDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      Ngày {c.billingDayOfMonth}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Hiệu lực
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Contract */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Tạo hợp đồng thuê phòng mới
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số phòng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="P.101"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mã hợp đồng
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contractCode}
                    onChange={(e) => setFormData({ ...formData, contractCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Người thuê đại diện <span className="text-rose-500">*</span>
                </label>
                <TingSelect
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  options={[
                    { value: '', label: '-- Chọn thành viên / khách thuê --' },
                    ...members.map((m) => ({
                      value: m.id,
                      label: `${m.name} ${m.phone ? `(${m.phone})` : ''}`,
                    })),
                  ]}
                  size="small"
                  className="w-full font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tiền thuê / tháng (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    required
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tiền cọc (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày bắt đầu thuê
                  </label>
                  <TingDatePicker
                    value={formData.startDate}
                    onChange={(val) => setFormData({ ...formData, startDate: val })}
                    sizeVariant="sm"
                    className="w-full"
                    containerClassName="w-full"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày chốt thu tiền hàng tháng
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.billingDayOfMonth}
                    onChange={(e) => setFormData({ ...formData, billingDayOfMonth: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Đang lưu...' : 'Lưu hợp đồng'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
