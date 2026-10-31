'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Building,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Users,
  CreditCard,
  Building2,
  Inbox
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

export interface SpaceItem {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  groupType: string;
  membersCount: number;
  isActive: boolean;
  createdAt: string;
}

interface ClassesAndRentalsTabProps {
  initialType?: 'CLASSES' | 'RENTALS';
  spaces?: SpaceItem[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function ClassesAndRentalsTab({
  initialType = 'CLASSES',
  spaces = [],
  loading = false,
  onRefresh,
}: ClassesAndRentalsTabProps) {
  const [viewType, setViewType] = useState<'CLASSES' | 'RENTALS'>(initialType);
  const [search, setSearch] = useState('');

  const classes = spaces.filter((s) => s.groupType === 'CLASS' || s.groupType === 'SPORTS_CLUB');
  const rentals = spaces.filter((s) => s.groupType === 'RENTAL');

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRentals = rentals.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Filter & Type Switcher */}
      <div className="bg-white dark:bg-[#111726] p-4 sm:p-5 rounded-2xl border border-[#E4E7EC] dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewType('CLASSES')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              viewType === 'CLASSES'
                ? 'bg-[#2538D9] dark:bg-[#4F62FF] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Lớp học & CLB Thể thao ({classes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewType('RENTALS')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              viewType === 'RENTALS'
                ? 'bg-[#2538D9] dark:bg-[#4F62FF] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Căn hộ & Phòng trọ ({rentals.length})</span>
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên không gian hoặc chủ sở hữu..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-[#101828] dark:text-white"
          />
        </div>
      </div>

      {/* Classes Table */}
      {viewType === 'CLASSES' && (
        <div className="bg-white dark:bg-[#111726] rounded-2xl border border-[#E4E7EC] dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-[#EAECF0] dark:border-slate-800 text-[11px] font-semibold text-[#475467] dark:text-slate-400 uppercase">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Tên Lớp / Không Gian</th>
                  <th className="py-3.5 px-4">Chủ sở hữu (Owner)</th>
                  <th className="py-3.5 px-4">Loại hình</th>
                  <th className="py-3.5 px-4">Quy mô học viên</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Inbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-medium text-sm text-[#101828] dark:text-white">Chưa có lớp học nào</p>
                      <p className="text-xs text-slate-500 mt-1">Khi người dùng tạo không gian lớp học mới, danh sách sẽ hiển thị tại đây.</p>
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-4 sm:px-6 font-semibold text-[#101828] dark:text-white">
                        {c.name}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-700 dark:text-slate-200">{c.ownerName}</p>
                        <p className="text-[11px] text-slate-400">{c.ownerEmail}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {c.groupType === 'CLASS' ? 'Lớp học' : 'CLB Thể thao'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {c.membersCount} học viên
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                          {c.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
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

      {/* Rentals Table */}
      {viewType === 'RENTALS' && (
        <div className="bg-white dark:bg-[#111726] rounded-2xl border border-[#E4E7EC] dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-[#EAECF0] dark:border-slate-800 text-[11px] font-semibold text-[#475467] dark:text-slate-400 uppercase">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Tên Cơ sở Cho Thuê</th>
                  <th className="py-3.5 px-4">Chủ sở hữu (Owner)</th>
                  <th className="py-3.5 px-4">Số lượng phòng/khách</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRentals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-medium text-sm text-[#101828] dark:text-white">Chưa có cơ sở cho thuê nào</p>
                      <p className="text-xs text-slate-500 mt-1">Khi người dùng tạo không gian nhà trọ hoặc căn hộ mini, danh sách sẽ hiển thị tại đây.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRentals.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-4 sm:px-6 font-semibold text-[#101828] dark:text-white">
                        {r.name}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-700 dark:text-slate-200">{r.ownerName}</p>
                        <p className="text-[11px] text-slate-400">{r.ownerEmail}</p>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {r.membersCount} phòng / người thuê
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                          {r.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
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
    </div>
  );
}
