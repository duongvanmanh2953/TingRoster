'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users2,
  Search,
  Layers,
  LayoutGrid,
  List,
  RefreshCw,
  Receipt,
  AlertCircle,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { SpaceCard, SpaceItem } from '@/components/spaces/SpaceCard';
import { CreateSpaceWizardModal } from '@/components/spaces/CreateSpaceWizardModal';
import { SmartBackButton } from '@/components/common/SmartBackButton';

export default function MySpacesPage() {
  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [meta, setMeta] = useState<{ totalActive: number; totalArchived: number; totalAll: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  // Filters & Controls
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'members'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const loadSpaces = (currentStatus: string = statusFilter) => {
    setLoading(true);
    fetch(`/api/groups?status=${currentStatus}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setSpaces(data.data);
          if (data.meta) {
            setMeta(data.meta);
          }
        }
      })
      .catch((err) => console.error('Lỗi tải danh sách không gian:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSpaces(statusFilter);
  }, [statusFilter]);

  // Filtered and sorted spaces
  const processedSpaces = useMemo(() => {
    let result = spaces.filter((s) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    });

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'vi');
      }
      if (sortBy === 'members') {
        return (b._count?.members || 0) - (a._count?.members || 0);
      }
      return 0; // default order from API is newest
    });

    return result;
  }, [spaces, search, sortBy]);

  // Aggregate stats across spaces with enabled modules
  const totalActiveSpaces = meta?.totalActive ?? spaces.filter((s) => s.isActive).length;
  const totalMemberships = spaces.reduce((acc, s) => acc + (s._count?.members || 0), 0);
  const totalInvoices = spaces.reduce((acc, s) => {
    const modules = (s.enabledModules || '').split(',');
    return modules.includes('invoices') ? acc + (s._count?.invoices || 0) : acc;
  }, 0);
  const spacesNeedingAttention = spaces.filter(
    (s) => s.isActive && (s._count?.members === 0 || !s.code)
  ).length;

  const handleSpaceUpdated = (updated: SpaceItem) => {
    setSpaces((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
  };

  const handleSpaceDeleted = (id: string) => {
    setSpaces((prev) => prev.filter((s) => s.id !== id));
    loadSpaces(statusFilter);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 2.1. Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SmartBackButton fallbackUrl="/dashboard" label="Tổng quan" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Không gian của tôi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quản lý các không gian và theo dõi hoạt động tổng quan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadSpaces(statusFilter)}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowCreateWizard(true)}
            className="px-4 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo không gian</span>
          </button>
        </div>
      </div>

      {/* 2.2. Thống kê tổng hợp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Không gian đang hoạt động
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {totalActiveSpaces} <span className="text-xs font-normal text-slate-400">khu vực</span>
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Tổng lượt thành viên
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {totalMemberships} <span className="text-xs font-normal text-slate-400">thành viên</span>
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Hóa đơn & khoản thu
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {totalInvoices} <span className="text-xs font-normal text-slate-400">bản ghi</span>
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            spacesNeedingAttention > 0
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
          }`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Cần chú ý / thiết lập
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {spacesNeedingAttention} <span className="text-xs font-normal text-slate-400">chưa có thành viên</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2.3. Controls: Tìm kiếm, Lọc trạng thái, Sắp xếp, Chế độ xem */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã không gian hoặc slug..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
          />
        </div>

        {/* Secondary controls row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold text-slate-600 dark:text-slate-400">
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hoạt động ({meta?.totalActive ?? totalActiveSpaces})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('archived')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'archived'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Đã lưu trữ ({meta?.totalArchived ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tất cả
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="name">Tên A-Z</option>
              <option value="members">Nhiều thành viên nhất</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-300'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Chế độ lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-300'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Chế độ danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && spaces.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      ) : processedSpaces.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <Layers className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {search ? 'Không tìm thấy không gian phù hợp' : 'Chưa có không gian nào'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {search
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc kiểm tra lại bộ lọc trạng thái.'
                : 'Bắt đầu bằng cách tạo không gian đầu tiên của bạn để quản lý học viên, hội viên hoặc khách thuê.'}
            </p>
          </div>
          {!search && (
            <button
              type="button"
              onClick={() => setShowCreateWizard(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo không gian ngay</span>
            </button>
          )}
        </div>
      ) : (
        /* 2.3. Danh sách không gian (Grid or List Mode) */
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5' : 'space-y-3.5'}>
          {processedSpaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              viewMode={viewMode}
              onUpdate={handleSpaceUpdated}
              onDelete={handleSpaceDeleted}
            />
          ))}
        </div>
      )}

      {/* Create Wizard Modal */}
      {showCreateWizard && (
        <CreateSpaceWizardModal
          open={showCreateWizard}
          onClose={() => setShowCreateWizard(false)}
          onSuccess={(newSpace) => {
            setSpaces((prev) => [newSpace, ...prev]);
            setShowCreateWizard(false);
          }}
        />
      )}
    </div>
  );
}
