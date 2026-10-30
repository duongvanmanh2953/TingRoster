'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Zap,
  Droplets,
  Calendar,
  Save,
  Send,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Receipt,
  Building,
  RefreshCw
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatVND } from '@/lib/utils';

interface MeterItem {
  id?: string;
  roomCode: string;
  memberId?: string | null;
  billingMonth: string;
  prevElectric: number;
  currElectric: number;
  electricUsage: number;
  electricRate: number;
  electricTotal: number;
  prevWater: number;
  currWater: number;
  waterUsage: number;
  waterRate: number;
  waterTotal: number;
  status: string;
  member?: { id: string; name: string; phone?: string | null };
}

export default function SpaceMetersPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [readings, setReadings] = useState<MeterItem[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; name: string; phone?: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  // Edit / Add modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [batchInvoicing, setBatchInvoicing] = useState(false);
  const [batchResult, setBatchResult] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    roomCode: '',
    memberId: '',
    billingMonth: month,
    prevElectric: 0,
    currElectric: 0,
    electricRate: 3500,
    prevWater: 0,
    currWater: 0,
    waterRate: 25000,
    note: '',
  });

  const fetchMeters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${spaceId}/meters?month=${month}`);
      const data = await res.json();
      if (data.success) {
        setReadings(data.data || []);
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
      fetchMeters();
    }
  }, [spaceId, month]);

  const handleOpenEdit = (item?: MeterItem) => {
    if (item) {
      setFormData({
        roomCode: item.roomCode,
        memberId: item.memberId || '',
        billingMonth: item.billingMonth,
        prevElectric: item.prevElectric,
        currElectric: item.currElectric,
        electricRate: item.electricRate || 3500,
        prevWater: item.prevWater,
        currWater: item.currWater,
        waterRate: item.waterRate || 25000,
        note: '',
      });
    } else {
      setFormData({
        roomCode: `P.${101 + readings.length}`,
        memberId: members[0]?.id || '',
        billingMonth: month,
        prevElectric: 0,
        currElectric: 0,
        electricRate: 3500,
        prevWater: 0,
        currWater: 0,
        waterRate: 25000,
        note: '',
      });
    }
    setModalOpen(true);
  };

  const handleSaveMeter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/groups/${spaceId}/meters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          prevElectric: Number(formData.prevElectric),
          currElectric: Number(formData.currElectric),
          electricRate: Number(formData.electricRate),
          prevWater: Number(formData.prevWater),
          currWater: Number(formData.currWater),
          waterRate: Number(formData.waterRate),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setModalOpen(false);
      await fetchMeters();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu chỉ số');
    } finally {
      setSaving(false);
    }
  };

  const handleBatchGenerateInvoices = async () => {
    if (!confirm(`Xác nhận phát hành hóa đơn cho tất cả các phòng đã chốt chỉ số trong kỳ ${month}?`)) {
      return;
    }

    setBatchInvoicing(true);
    setBatchResult(null);
    try {
      const res = await fetch(`/api/groups/${spaceId}/meters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GENERATE_INVOICES',
          month,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setBatchResult(data.message);
      await fetchMeters();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi phát hành hóa đơn chu kỳ');
    } finally {
      setBatchInvoicing(false);
    }
  };

  const totalElectricCost = readings.reduce((sum, r) => sum + r.electricTotal, 0);
  const totalWaterCost = readings.reduce((sum, r) => sum + r.waterTotal, 0);

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
          activeSection="meters"
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Chỉ số Điện & Nước theo Chu kỳ</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ghi nhận số điện, số nước hàng tháng, tự động tính tiền và phát hành hóa đơn tổng hợp cho phòng trọ / căn hộ.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
          />

          <button
            type="button"
            onClick={() => handleOpenEdit()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ghi chỉ số</span>
          </button>

          <button
            type="button"
            onClick={handleBatchGenerateInvoices}
            disabled={batchInvoicing || readings.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
          >
            {batchInvoicing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5" />}
            <span>{batchInvoicing ? 'Đang tạo...' : 'Phát hành hóa đơn kỳ'}</span>
          </button>
        </div>
      </div>

      {batchResult && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{batchResult}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng phòng đã chốt</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {readings.length} phòng
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Tổng tiền điện ({month})</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {formatVND(totalElectricCost)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5" />
            <span>Tổng tiền nước ({month})</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {formatVND(totalWaterCost)}
          </div>
        </div>
      </div>

      {/* Meters Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Đang tải chỉ số điện nước...</span>
          </div>
        ) : readings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            Chưa có chỉ số nào trong kỳ {month}. Nhấn &quot;Ghi chỉ số&quot; để nhập số điện nước các phòng.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-4">Phòng / Người thuê</th>
                  <th className="py-3 px-4 text-center">Số điện (Cũ - Mới)</th>
                  <th className="py-3 px-4 text-right">Tiêu thụ điện</th>
                  <th className="py-3 px-4 text-center">Số nước (Cũ - Mới)</th>
                  <th className="py-3 px-4 text-right">Tiêu thụ nước</th>
                  <th className="py-3 px-4 text-right">Tổng điện + nước</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {readings.map((r) => (
                  <tr key={r.id || r.roomCode} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>Phòng {r.roomCode}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {r.member?.name || 'Chưa gán người thuê'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {r.prevElectric} → {r.currElectric}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <div className="font-bold text-amber-600 dark:text-amber-400">{r.electricUsage} kWh</div>
                      <div className="text-[10px] text-slate-400">{formatVND(r.electricTotal)}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {r.prevWater} → {r.currWater}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <div className="font-bold text-blue-600 dark:text-blue-400">{r.waterUsage} m³</div>
                      <div className="text-[10px] text-slate-400">{formatVND(r.waterTotal)}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {formatVND(r.electricTotal + r.waterTotal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.status === 'INVOICED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Đã lập hóa đơn
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          Chờ phát hành
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(r)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edit / Add Meter */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Ghi nhận chỉ số điện nước
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeter} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số phòng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="P.101, P.202"
                    value={formData.roomCode}
                    onChange={(e) => setFormData({ ...formData, roomCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Người thuê
                  </label>
                  <select
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Chưa gán người thuê --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.phone ? `(${m.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Điện */}
              <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Chỉ số Điện (kWh)
                  </span>
                  <span className="text-[11px] font-mono">Đơn giá: {formatVND(formData.electricRate)}/kWh</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Số cũ</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.prevElectric}
                      onChange={(e) => setFormData({ ...formData, prevElectric: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Số mới</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.currElectric}
                      onChange={(e) => setFormData({ ...formData, currElectric: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Nước */}
              <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
                <div className="font-bold text-blue-800 dark:text-blue-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" />
                    Chỉ số Nước (m³)
                  </span>
                  <span className="text-[11px] font-mono">Đơn giá: {formatVND(formData.waterRate)}/m³</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Số cũ</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.prevWater}
                      onChange={(e) => setFormData({ ...formData, prevWater: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Số mới</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.currWater}
                      onChange={(e) => setFormData({ ...formData, currWater: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>
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
                  <span>{saving ? 'Đang lưu...' : 'Lưu chỉ số'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
