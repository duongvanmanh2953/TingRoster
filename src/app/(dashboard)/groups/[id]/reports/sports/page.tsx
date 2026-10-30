'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  Tv,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertCircle,
  Timer,
  Loader2,
  Search,
  ArrowLeft,
  Users
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatVND } from '@/lib/utils';
import { TingDatePicker } from '@/components/common/DatePicker';
import { TingSelect } from '@/components/common/Select';

export default function SpaceSportsReportPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [courtFilter, setCourtFilter] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [spaceRes, bookRes] = await Promise.all([
          fetch(`/api/groups/${spaceId}`),
          fetch(`/api/groups/${spaceId}/bookings?date=${date}`),
        ]);
        const [spaceJson, bookJson] = await Promise.all([spaceRes.json(), bookRes.json()]);

        if (spaceJson.success) setSpace(spaceJson.data);
        if (bookJson.success) setBookings(bookJson.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (spaceId) {
      loadData();
    }
  }, [spaceId, date]);

  // Unique court names
  const courts = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => set.add(b.courtName));
    return Array.from(set);
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (courtFilter === 'ALL') return bookings;
    return bookings.filter((b) => b.courtName === courtFilter);
  }, [bookings, courtFilter]);

  // Aggregate metrics
  const totalBookings = filteredBookings.length;
  const checkedInCount = filteredBookings.filter((b) => b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT').length;
  const noShowCount = filteredBookings.filter((b) => b.status === 'NO_SHOW').length;
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPaid = filteredBookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalOvertimeFee = filteredBookings.reduce((sum, b) => sum + (b.overtimeFee || 0), 0);
  const totalSurcharge = filteredBookings.reduce((sum, b) => sum + (b.surchargeFee || 0), 0);

  const handleExportCSV = () => {
    const headers = ['Khách hàng', 'Số điện thoại', 'Tên sân', 'Khung giờ đặt', 'Check-in thực tế', 'Check-out thực tế', 'Tiền sân (VND)', 'Phụ phí (VND)', 'Phí quá giờ (VND)', 'Tổng cộng (VND)', 'Đã thanh toán', 'Trạng thái'];
    const rows = filteredBookings.map((b) => [
      `"${b.customerName}"`,
      b.customerPhone || '',
      `"${b.courtName}"`,
      `${b.startTime} - ${b.endTime}`,
      b.actualCheckIn ? new Date(b.actualCheckIn).toLocaleTimeString('vi-VN') : '',
      b.actualCheckOut ? new Date(b.actualCheckOut).toLocaleTimeString('vi-VN') : '',
      b.courtPrice,
      b.surchargeFee,
      b.overtimeFee,
      b.totalAmount,
      b.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
      b.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bao_cao_san_the_thao_${date}_${space?.code || spaceId}.csv`);
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
            groupType: 'SPORTS_CLUB',
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
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>Báo cáo Sử dụng Sân & Doanh thu CI/CO</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-6">
            Thống kê lượt check-in thực tế, thời lượng chơi, phụ phí phát sinh, phí vượt giờ và doanh thu đặt sân.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <TingDatePicker
            value={date}
            onChange={(val) => setDate(val)}
            sizeVariant="sm"
            placeholder="Chọn ngày báo cáo"
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
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tổng lượt đặt sân</span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
            {totalBookings} lượt
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Đã CI/CO: <span className="font-bold text-emerald-600">{checkedInCount}</span> • No-show: <span className="font-bold text-rose-600">{noShowCount}</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Doanh thu sân phát sinh</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono tabular-nums">
            {formatVND(totalRevenue)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Đã thanh toán: {formatVND(totalPaid)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Phụ phí & Tiện ích</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono tabular-nums">
            {formatVND(totalSurcharge)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Nước uống, thuê vợt, bóng đèn</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Phí vượt giờ (Overtime)</span>
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <Timer className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2 font-mono tabular-nums">
            {formatVND(totalOvertimeFee)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Tự động tính khi Check-out trễ</p>
        </div>
      </div>

      {/* Filter by court */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Lọc theo sân:</span>
          <div className="w-56">
            <TingSelect
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              options={[
                { value: 'ALL', label: `Tất cả các sân (${bookings.length})` },
                ...courts.map((court) => ({ value: court, label: court })),
              ]}
              size="small"
              className="w-full text-xs font-bold"
            />
          </div>
        </div>

        <p className="text-xs font-bold text-slate-500">
          Ngày báo cáo: <span className="font-mono text-slate-900 dark:text-white">{date}</span>
        </p>
      </div>

      {/* Booking Detail Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <p className="text-xs">Đang tải chi tiết đặt sân...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Tv className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">Không có lượt đặt sân nào trong ngày {date}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Sân</th>
                  <th className="py-3 px-4">Khung giờ đặt</th>
                  <th className="py-3 px-4">Check-in thực tế</th>
                  <th className="py-3 px-4">Check-out thực tế</th>
                  <th className="py-3 px-4 text-right">Giá sân</th>
                  <th className="py-3 px-4 text-right">Phụ phí</th>
                  <th className="py-3 px-4 text-right">Vượt giờ</th>
                  <th className="py-3 px-4 text-right">Tổng thanh toán</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {b.customerName}
                      {b.customerPhone && (
                        <p className="text-[10px] font-mono text-slate-400 font-normal">{b.customerPhone}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {b.courtName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {b.startTime} - {b.endTime}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {b.actualCheckIn ? new Date(b.actualCheckIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '---'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {b.actualCheckOut ? new Date(b.actualCheckOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '---'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                      {formatVND(b.courtPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-600">
                      {formatVND(b.surchargeFee)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-600 font-bold">
                      {formatVND(b.overtimeFee)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white tabular-nums">
                      {formatVND(b.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'CHECKED_OUT'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                            : b.status === 'CHECKED_IN'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : b.status === 'NO_SHOW'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                        }`}
                      >
                        {b.status === 'CHECKED_OUT'
                          ? 'Đã Check-out'
                          : b.status === 'CHECKED_IN'
                          ? 'Đang chơi'
                          : b.status === 'NO_SHOW'
                          ? 'Vắng mặt'
                          : 'Đã đặt trước'}
                      </span>
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
