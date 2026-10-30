'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Activity,
  Tv,
  QrCode,
  DollarSign,
  Loader2,
  Users,
  Timer
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatVND } from '@/lib/utils';

interface BookingItem {
  id: string;
  customerName: string;
  customerPhone?: string | null;
  courtName: string;
  courtType: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  actualCheckIn?: string | null;
  actualCheckOut?: string | null;
  status: 'RESERVED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
  courtPrice: number;
  overtimeFee: number;
  surchargeFee: number;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
  qrToken: string;
}

export default function SpaceBookingsPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Modal create booking
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    courtName: 'Sân 1',
    courtType: 'STANDARD',
    bookingDate: date,
    startTime: '18:00',
    endTime: '20:00',
    courtPrice: 200000,
    surchargeFee: 0,
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${spaceId}/bookings?date=${date}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data || []);
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
      fetchBookings();
    }
  }, [spaceId, date]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/groups/${spaceId}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bookingDate: date,
          courtPrice: Number(formData.courtPrice),
          surchargeFee: Number(formData.surchargeFee),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setModalOpen(false);
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo booking');
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (bookingId: string, action: 'CHECK_IN' | 'CHECK_OUT' | 'MARK_PAID' | 'CANCEL') => {
    setActionLoading(`${bookingId}_${action}`);
    try {
      let extraSurcharge = 0;
      if (action === 'CHECK_OUT') {
        const promptSurcharge = prompt('Phụ phí phát sinh bổ sung (nước uống, thuê vợt - VNĐ):', '0');
        if (promptSurcharge !== null) {
          extraSurcharge = Number(promptSurcharge) || 0;
        }
      }

      const res = await fetch(`/api/groups/${spaceId}/bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          action,
          surchargeFee: extraSurcharge,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      alert(data.message);
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Lỗi xử lý thao tác');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CHECKED_IN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 whitespace-nowrap select-none">
            Đang hoạt động
          </span>
        );
      case 'CHECKED_OUT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 whitespace-nowrap select-none">
            Đã hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap select-none">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 whitespace-nowrap select-none">
            Đã đặt chỗ
          </span>
        );
    }
  };

  const totalRevenue = bookings
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.totalAmount, 0);

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
          activeSection="bookings"
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>Quản lý Đặt sân & Check-in / Check-out</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi phiên sử dụng sân thực tế, tính phụ phí quá giờ tự động và đối soát thanh toán tại sân.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
          />

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Đặt sân mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng lượt đặt sân hôm nay</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {bookings.length} lượt
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-amber-700 dark:text-amber-400">Đang hoạt động trên sân</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {bookings.filter((b) => b.status === 'CHECKED_IN').length} sân
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Doanh thu dự kiến ({date})</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {formatVND(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Đang tải danh sách đặt sân...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            Chưa có lượt đặt sân nào vào ngày {date}. Nhấn &quot;Đặt sân mới&quot; để thêm ca chơi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-4">Sân & Khung giờ</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4 text-center">Trạng thái phiên</th>
                  <th className="py-3 px-4 text-center">Giờ thực tế (CI / CO)</th>
                  <th className="py-3 px-4 text-right">Tổng tiền</th>
                  <th className="py-3 px-4 text-center">Thanh toán</th>
                  <th className="py-3 px-4 text-right">Thao tác CI / CO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{b.courtName}</div>
                      <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {b.startTime} - {b.endTime}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{b.customerName}</div>
                      <div className="text-[11px] text-slate-400">{b.customerPhone || '—'}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(b.status)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[11px]">
                      <div>CI: {b.actualCheckIn ? new Date(b.actualCheckIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                      <div>CO: {b.actualCheckOut ? new Date(b.actualCheckOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <div className="font-bold text-slate-900 dark:text-white">{formatVND(b.totalAmount)}</div>
                      {b.overtimeFee > 0 && (
                        <div className="text-[10px] text-rose-500 font-bold">+Quá giờ: {formatVND(b.overtimeFee)}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {b.isPaid ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                          Chưa thu
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {b.status === 'RESERVED' && (
                        <button
                          type="button"
                          onClick={() => handleAction(b.id, 'CHECK_IN')}
                          disabled={!!actionLoading}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition shadow-2xs cursor-pointer"
                        >
                          Check-in
                        </button>
                      )}

                      {b.status === 'CHECKED_IN' && (
                        <button
                          type="button"
                          onClick={() => handleAction(b.id, 'CHECK_OUT')}
                          disabled={!!actionLoading}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-2xs cursor-pointer"
                        >
                          Check-out
                        </button>
                      )}

                      {!b.isPaid && b.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          onClick={() => handleAction(b.id, 'MARK_PAID')}
                          disabled={!!actionLoading}
                          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
                        >
                          Thu tiền
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Booking */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Tạo lượt đặt sân mới
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên khách / Người đại diện <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Anh Hoàng (CLB Pickleball)"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    placeholder="0912..."
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Chọn sân
                  </label>
                  <select
                    value={formData.courtName}
                    onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Sân Pickleball 1">Sân Pickleball 1</option>
                    <option value="Sân Pickleball 2">Sân Pickleball 2</option>
                    <option value="Sân Cầu lông VIP A">Sân Cầu lông VIP A</option>
                    <option value="Sân Bóng đá Mini">Sân Bóng đá Mini</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tiền sân (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    required
                    value={formData.courtPrice}
                    onChange={(e) => setFormData({ ...formData, courtPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phụ phí (thuê vợt/bóng)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={formData.surchargeFee}
                    onChange={(e) => setFormData({ ...formData, surchargeFee: Number(e.target.value) })}
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
                  <span>{saving ? 'Đang lưu...' : 'Xác nhận đặt sân'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
