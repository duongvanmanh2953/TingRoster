'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Zap,
  Droplets,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatVND } from '@/lib/utils';

export default function SpaceRentalsReportPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [spaceRes, contractRes, meterRes] = await Promise.all([
          fetch(`/api/groups/${spaceId}`),
          fetch(`/api/groups/${spaceId}/rentals`),
          fetch(`/api/groups/${spaceId}/meters?month=${month}`),
        ]);
        const [spaceJson, contractJson, meterJson] = await Promise.all([
          spaceRes.json(),
          contractRes.json(),
          meterRes.json(),
        ]);

        if (spaceJson.success) setSpace(spaceJson.data);
        if (contractJson.success) setContracts(contractJson.data || []);
        if (meterJson.success) setReadings(meterJson.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (spaceId) {
      loadData();
    }
  }, [spaceId, month]);

  // Aggregate metrics
  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE');
  const totalRentRevenue = activeContracts.reduce((sum, c) => sum + (c.monthlyRent || 0), 0);
  const totalDeposit = activeContracts.reduce((sum, c) => sum + (c.depositAmount || 0), 0);

  const totalElectricUsage = readings.reduce((sum, r) => sum + (r.electricUsage || 0), 0);
  const totalElectricAmount = readings.reduce((sum, r) => sum + (r.electricTotal || 0), 0);
  const totalWaterUsage = readings.reduce((sum, r) => sum + (r.waterUsage || 0), 0);
  const totalWaterAmount = readings.reduce((sum, r) => sum + (r.waterTotal || 0), 0);

  const combinedRooms = useMemo(() => {
    const map: Record<string, any> = {};

    contracts.forEach((c) => {
      map[c.roomNumber] = {
        roomCode: c.roomNumber,
        contractCode: c.contractCode,
        tenantName: c.member?.name || 'Chưa gán',
        tenantPhone: c.member?.phone,
        monthlyRent: c.monthlyRent,
        depositAmount: c.depositAmount,
        status: c.status,
        electricUsage: 0,
        electricTotal: 0,
        waterUsage: 0,
        waterTotal: 0,
        meterStatus: 'CHƯA NHẬP',
      };
    });

    readings.forEach((r) => {
      if (!map[r.roomCode]) {
        map[r.roomCode] = {
          roomCode: r.roomCode,
          contractCode: '---',
          tenantName: r.member?.name || 'Trống',
          tenantPhone: r.member?.phone,
          monthlyRent: space?.defaultFee || 0,
          depositAmount: 0,
          status: 'TRỐNG',
          electricUsage: r.electricUsage,
          electricTotal: r.electricTotal,
          waterUsage: r.waterUsage,
          waterTotal: r.waterTotal,
          meterStatus: r.status,
        };
      } else {
        map[r.roomCode].electricUsage = r.electricUsage;
        map[r.roomCode].electricTotal = r.electricTotal;
        map[r.roomCode].waterUsage = r.waterUsage;
        map[r.roomCode].waterTotal = r.waterTotal;
        map[r.roomCode].meterStatus = r.status;
      }
    });

    return Object.values(map).filter((item: any) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.roomCode.toLowerCase().includes(q) ||
        item.tenantName.toLowerCase().includes(q) ||
        item.contractCode.toLowerCase().includes(q)
      );
    });
  }, [contracts, readings, search, space]);

  const handleExportCSV = () => {
    const headers = ['Số phòng', 'Người thuê', 'Mã hợp đồng', 'Tiền thuê (VND)', 'Tiền điện (kWh)', 'Thành tiền điện (VND)', 'Tiêu thụ nước (m3)', 'Thành tiền nước (VND)', 'Tổng thu (VND)', 'Trạng thái'];
    const rows = combinedRooms.map((r: any) => [
      r.roomCode,
      `"${r.tenantName}"`,
      r.contractCode,
      r.monthlyRent,
      r.electricUsage,
      r.electricTotal,
      r.waterUsage,
      r.waterTotal,
      r.monthlyRent + r.electricTotal + r.waterTotal,
      r.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bao_cao_phong_dien_nuoc_${month}_${space?.code || spaceId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            groupType: 'RENTAL',
          }}
          activeSection="reports"
        />
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/groups/${spaceId}/reports`}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Báo cáo Cho thuê, Điện & Nước theo Kỳ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-6">
            Thống kê công suất phòng, tiền thuê hàng tháng, số điện tiêu thụ (kWh) và khối nước (m³) đối chiếu theo kỳ thanh toán.
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
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Phòng đang thuê</span>
            <span className="p-2 rounded-xl bg-black-50 dark:bg-black-950/50 text-indigo-600">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
            {activeContracts.length} / {combinedRooms.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Tiền thuê: {formatVND(totalRentRevenue)}/tháng
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tiêu thụ điện (kWh)</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono tabular-nums">
            {totalElectricUsage.toLocaleString()} kWh
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Thành tiền: {formatVND(totalElectricAmount)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tiêu thụ nước (m³)</span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Droplets className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2 font-mono tabular-nums">
            {totalWaterUsage.toLocaleString()} m³
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Thành tiền: {formatVND(totalWaterAmount)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tổng doanh thu kỳ {month}</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono tabular-nums">
            {formatVND(totalRentRevenue + totalElectricAmount + totalWaterAmount)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Bao gồm phòng, điện & nước
          </p>
        </div>
      </div>

      {/* Filter and search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo phòng, tên người thuê hoặc mã hợp đồng..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <p className="text-xs font-bold text-slate-500">
          Tổng cộng: <span className="font-mono text-slate-900 dark:text-white">{combinedRooms.length} phòng</span>
        </p>
      </div>

      {/* Detail Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <p className="text-xs">Đang tải báo cáo phòng và chỉ số...</p>
          </div>
        ) : combinedRooms.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">Chưa có dữ liệu phòng cho kỳ {month}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Phòng</th>
                  <th className="py-3 px-4">Người thuê</th>
                  <th className="py-3 px-4">Mã HĐ</th>
                  <th className="py-3 px-4 text-right">Tiền thuê</th>
                  <th className="py-3 px-4 text-right">Điện (kWh)</th>
                  <th className="py-3 px-4 text-right">Tiền điện</th>
                  <th className="py-3 px-4 text-right">Nước (m³)</th>
                  <th className="py-3 px-4 text-right">Tiền nước</th>
                  <th className="py-3 px-4 text-right">Tổng phải thu</th>
                  <th className="py-3 px-4 text-center">Trạng thái HĐ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {combinedRooms.map((room: any) => {
                  const roomTotal = room.monthlyRent + room.electricTotal + room.waterTotal;
                  return (
                    <tr key={room.roomCode} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono font-black text-slate-900 dark:text-white">
                        {room.roomCode}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {room.tenantName}
                        {room.tenantPhone && (
                          <p className="text-[10px] font-mono text-slate-400 font-normal">{room.tenantPhone}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                        {room.contractCode}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                        {formatVND(room.monthlyRent)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-600">
                        {room.electricUsage}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-700 font-bold">
                        {formatVND(room.electricTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-600">
                        {room.waterUsage}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-700 font-bold">
                        {formatVND(room.waterTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatVND(roomTotal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            room.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                              : room.status === 'EXPIRING_SOON'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {room.status === 'ACTIVE' ? 'Đang thuê' : room.status === 'EXPIRING_SOON' ? 'Sắp hết hạn' : 'Trống'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
