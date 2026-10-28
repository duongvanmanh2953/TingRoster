'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Home,
  Search,
  Filter,
  Users,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { formatVND } from '@/lib/utils';
import Chip from '@mui/material/Chip';

interface ClassItem {
  id: string;
  name: string;
  tenantName: string;
  classType: string;
  studentsCount: number;
  sessionsCount: number;
  feePerSession: number;
  attendanceRate: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

interface RentalItem {
  id: string;
  name: string;
  tenantName: string;
  totalRooms: number;
  occupiedRooms: number;
  monthlyRevenue: number;
  occupancyRate: number;
  overdueCount: number;
  status: 'ACTIVE' | 'MAINTENANCE';
}

interface ClassesAndRentalsTabProps {
  initialType?: 'CLASSES' | 'RENTALS';
}

export function ClassesAndRentalsTab({ initialType = 'CLASSES' }: ClassesAndRentalsTabProps) {
  const [viewType, setViewType] = useState<'CLASSES' | 'RENTALS'>(initialType);
  const [search, setSearch] = useState('');

  const mockClasses: ClassItem[] = [
    {
      id: 'CLS-101',
      name: 'Toán Nâng Cao 12 — Ôn Thi ĐH',
      tenantName: 'Thầy Hưng Toán Luyện Thi ĐH',
      classType: 'Toán học',
      studentsCount: 38,
      sessionsCount: 24,
      feePerSession: 80000,
      attendanceRate: 96.5,
      status: 'ACTIVE',
    },
    {
      id: 'CLS-102',
      name: 'IELTS Intensive 6.5–7.5 (Tối 2-4-6)',
      tenantName: 'Trung tâm Ngoại ngữ Alpha',
      classType: 'Tiếng Anh',
      studentsCount: 25,
      sessionsCount: 36,
      feePerSession: 150000,
      attendanceRate: 92.0,
      status: 'ACTIVE',
    },
    {
      id: 'CLS-103',
      name: 'Lớp Luyện Cầu Lông Cơ Bản & Nâng Cao',
      tenantName: 'CLB Cầu Lông Thủ Đức Stars',
      classType: 'Thể thao',
      studentsCount: 42,
      sessionsCount: 16,
      feePerSession: 90000,
      attendanceRate: 88.4,
      status: 'ACTIVE',
    },
    {
      id: 'CLS-104',
      name: 'Hóa Học 10 Chuyên Đề Phản Ứng',
      tenantName: 'Cô Thảo Hóa Sư Phạm',
      classType: 'Hóa học',
      studentsCount: 20,
      sessionsCount: 18,
      feePerSession: 75000,
      attendanceRate: 98.0,
      status: 'ACTIVE',
    },
  ];

  const mockRentals: RentalItem[] = [
    {
      id: 'RNT-201',
      name: 'Nhà Trọ An Cư 12 Phòng (Khu A)',
      tenantName: 'Nhà Trọ An Cư Q9',
      totalRooms: 12,
      occupiedRooms: 11,
      monthlyRevenue: 33000000,
      occupancyRate: 91.6,
      overdueCount: 1,
      status: 'ACTIVE',
    },
    {
      id: 'RNT-202',
      name: 'Dãy Trọ Sinh Viên Xanh Q.Bình Thạnh',
      tenantName: 'Nhà Trọ Xanh Sài Gòn',
      totalRooms: 20,
      occupiedRooms: 20,
      monthlyRevenue: 56000000,
      occupancyRate: 100,
      overdueCount: 0,
      status: 'ACTIVE',
    },
    {
      id: 'RNT-203',
      name: 'Căn Hộ Dịch Vụ Mini Phước Long B',
      tenantName: 'Aparthotel Phước Long',
      totalRooms: 16,
      occupiedRooms: 14,
      monthlyRevenue: 64000000,
      occupancyRate: 87.5,
      overdueCount: 2,
      status: 'ACTIVE',
    },
  ];

  const filteredClasses = mockClasses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tenantName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRentals = mockRentals.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.tenantName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E5E7EB] dark:border-slate-800 p-5 space-y-4 shadow-xs">
      {/* Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewType('CLASSES')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewType === 'CLASSES'
                ? 'bg-[#2538D9] text-white shadow-md shadow-blue-900/30'
                : 'bg-[#F9FAFB] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Lớp học & Trung tâm ({mockClasses.length})</span>
          </button>

          <button
            onClick={() => setViewType('RENTALS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewType === 'RENTALS'
                ? 'bg-[#2538D9] text-white shadow-md shadow-blue-900/30'
                : 'bg-[#F9FAFB] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Nhà trọ & Phòng trọ ({mockRentals.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc cơ sở quản lý..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-hidden focus:border-[#2538D9]"
          />
        </div>
      </div>

      {/* View: CLASSES */}
      {viewType === 'CLASSES' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-[#F9FAFB] dark:bg-[#0B0F19]">
                <th className="py-3 px-3">Tên lớp học / Môn học</th>
                <th className="py-3 px-3">Cơ sở / Giáo viên</th>
                <th className="py-3 px-3">Sĩ số học viên</th>
                <th className="py-3 px-3">Số buổi đã học</th>
                <th className="py-3 px-3">Học phí / Buổi</th>
                <th className="py-3 px-3">Tỷ lệ chuyên cần</th>
                <th className="py-3 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
              {filteredClasses.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{cls.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Mã: {cls.id}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                    {cls.tenantName}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {cls.studentsCount} học viên
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-400">
                    {cls.sessionsCount} buổi
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatVND(cls.feePerSession)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">
                      {cls.attendanceRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Chip label="ĐANG DẠY" size="small" sx={{ bgcolor: '#ECFDF3', color: '#067647', fontWeight: 700 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View: RENTALS */}
      {viewType === 'RENTALS' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-[#F9FAFB] dark:bg-[#0B0F19]">
                <th className="py-3 px-3">Khu trọ / Bất động sản</th>
                <th className="py-3 px-3">Chủ cơ sở quản lý</th>
                <th className="py-3 px-3">Tỷ lệ lấp đầy phòng</th>
                <th className="py-3 px-3">Doanh thu phòng / Tháng</th>
                <th className="py-3 px-3">Cảnh báo nợ quá hạn</th>
                <th className="py-3 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
              {filteredRentals.map((rnt) => (
                <tr key={rnt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{rnt.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Mã: {rnt.id}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                    {rnt.tenantName}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {rnt.occupiedRooms}/{rnt.totalRooms} phòng ({rnt.occupancyRate}%)
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatVND(rnt.monthlyRevenue)}
                  </td>
                  <td className="py-3 px-3">
                    {rnt.overdueCount > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {rnt.overdueCount} phòng trễ hẹn
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold text-xs">Đầy đủ 100%</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <Chip label="HOẠT ĐỘNG" size="small" sx={{ bgcolor: '#EFF8FF', color: '#175CD3', fontWeight: 700 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
