'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatVND } from '@/lib/utils';
import {
  Plus,
  Users2,
  ExternalLink,
  Tv,
  Copy,
  Check,
  GraduationCap,
  Sparkles,
  Building2,
  CalendarCheck,
  Search,
  CheckCircle2,
  Layers,
  LayoutGrid,
  List,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  QrCode
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import { TingSelect } from '@/components/common/Select';

interface GroupItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  defaultFee: number;
  billingCycle: string;
  groupType: string;
  publicPortalEnabled: boolean;
  _count: {
    members: number;
    invoices: number;
  };
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Filters & View mode
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusTab, setStatusTab] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [defaultFee, setDefaultFee] = useState<number>(600000);
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [groupType, setGroupType] = useState('CLASS');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadGroups = () => {
    setLoading(true);
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGroups(data.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setSlug(generatedSlug);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          defaultFee: Number(defaultFee),
          billingCycle,
          groupType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setName('');
        setSlug('');
        setDescription('');
        setDefaultFee(600000);
        loadGroups();
      } else {
        setFormError(data.error || 'Lỗi khi tạo lớp');
      }
    } catch {
      setFormError('Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPortalLink = (groupSlug: string) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/p/${groupSlug}`;
      navigator.clipboard.writeText(url);
      setCopiedSlug(groupSlug);
      setTimeout(() => setCopiedSlug(null), 2500);
    }
  };

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.slug.toLowerCase().includes(search.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || g.groupType === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate high-level KPIs
  const totalGroups = groups.length;
  const totalMembers = groups.reduce((acc, g) => acc + (g._count?.members || 0), 0);
  const totalInvoices = groups.reduce((acc, g) => acc + (g._count?.invoices || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <Users2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
              Lớp học / CLB
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#475467] mt-1">
            Quản lý danh sách lớp học, câu lạc bộ và phòng trọ, theo dõi học phí và điểm danh
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-semibold transition-all shadow-sm shadow-[#2538D9]/25"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo lớp mới</span>
        </button>
      </div>

      {/* 2. Top Metric Cards (Untitled UI / Pulse style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ting-card p-4">
          <span className="text-xs font-medium text-[#475467] block">Tổng số lớp / CLB</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#101828] font-mono">{totalGroups}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Đang hoạt động
            </span>
          </div>
        </div>

        <div className="ting-card p-4">
          <span className="text-xs font-medium text-[#475467] block">Tổng số học viên</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#101828] tabular-nums">{totalMembers}</span>
            <span className="text-[11px] font-medium text-[#475467]">Thành viên</span>
          </div>
        </div>

        <div className="ting-card p-4">
          <span className="text-xs font-medium text-[#475467] block">Số đợt thu học phí</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#101828] tabular-nums">{totalInvoices}</span>
            <span className="text-[11px] font-medium text-[#475467]">Hóa đơn</span>
          </div>
        </div>

        <div className="ting-card p-4">
          <span className="text-xs font-medium text-[#475467] block">Cổng VietQR công khai</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">100%</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Sẵn sàng
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="ting-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Tabs Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F5F7FB] rounded-xl border border-[#E4E7EC] text-xs font-semibold">
            <button
              onClick={() => setStatusTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusTab === 'ALL' ? 'bg-white text-[#2538D9] shadow-xs' : 'text-[#475467] hover:text-[#101828]'
              }`}
            >
              Tất cả ({groups.length})
            </button>
            <button
              onClick={() => setStatusTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusTab === 'ACTIVE' ? 'bg-white text-[#2538D9] shadow-xs' : 'text-[#475467] hover:text-[#101828]'
              }`}
            >
              Đang hoạt động ({groups.length})
            </button>
            <button
              onClick={() => setStatusTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusTab === 'PENDING' ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-indigo-400 shadow-xs' : 'text-[#475467] dark:text-slate-400 hover:text-[#101828] dark:hover:text-white'
              }`}
            >
              Đợi đối soát (1)
            </button>
          </div>

          {/* Right Controls: Search + MUI Type Filter + View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm lớp..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-[#1E293B] text-xs text-[#101828] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#2538D9] focus:ring-1 focus:ring-[#2538D9]"
              />
            </div>

            {/* Type Filter */}
            <TingSelect
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sizeVariant="sm"
              className="w-44 font-medium"
              options={[
                { value: 'ALL', label: 'Tất cả loại hình' },
                { value: 'CLASS', label: 'Lớp học / Gia sư' },
                { value: 'SPORTS_CLUB', label: 'CLB thể thao' },
                { value: 'RENTAL', label: 'Nhà trọ / Phòng' },
              ]}
            />

            {/* Grid / Table View Switcher */}
            <div className="flex items-center bg-[#F5F7FB] dark:bg-slate-900 p-0.5 rounded-lg border border-[#E4E7EC] dark:border-[#1E293B]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-indigo-400 shadow-xs' : 'text-slate-400'}`}
                title="Dạng thẻ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-indigo-400 shadow-xs' : 'text-slate-400'}`}
                title="Dạng bảng"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Groups Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <CircularProgress size={32} sx={{ color: '#2538D9' }} />
          <p className="text-xs text-[#475467]">Đang tải danh sách lớp học...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="ting-card p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center mx-auto">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#101828]">Chưa có lớp học nào phù hợp</h3>
            <p className="text-xs text-[#475467] mt-1">
              {search ? 'Không tìm thấy lớp học với từ khóa này.' : 'Hãy tạo lớp học hoặc câu lạc bộ đầu tiên để bắt đầu điểm danh và thu học phí.'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2538D9] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo lớp ngay</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View (per 00-overview.png Screen 4) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((g) => {
            const isSports = g.groupType === 'SPORTS_CLUB';
            const isRental = g.groupType === 'RENTAL';
            return (
              <div
                key={g.id}
                className="ting-card p-5 flex flex-col justify-between hover:border-[#CBD5E1] transition-all hover:shadow-md"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                        isSports
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : isRental
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-[#2538D9]/10 text-[#2538D9] border border-[#2538D9]/20'
                      }`}>
                        {isSports ? '🏸' : isRental ? '🏠' : <GraduationCap className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#101828] hover:text-[#2538D9] transition-colors">
                          <Link href={`/groups/${g.id}`}>{g.name}</Link>
                        </h3>
                        <span className="text-[11px] text-[#475467] font-mono">/{g.slug}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Đang hoạt động
                    </span>
                  </div>

                  {/* Description */}
                  {g.description && (
                    <p className="text-xs text-[#475467] mt-3 line-clamp-2">
                      {g.description}
                    </p>
                  )}

                  {/* Metric Badges */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#E4E7EC] text-xs">
                    <div>
                      <span className="text-[11px] text-[#475467] block">Sĩ số thành viên</span>
                      <span className="font-bold text-[#101828] tabular-nums">{g._count.members} thành viên</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#475467] block">Mức học phí</span>
                      <span className="font-bold text-[#2538D9] tabular-nums">{formatVND(g.defaultFee)}</span>
                    </div>
                  </div>

                  {/* Public Portal Pill */}
                  <div className="mt-4 p-2.5 rounded-xl bg-[#F5F7FB] border border-[#E4E7EC] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate text-[#475467]">
                      <QrCode className="w-3.5 h-3.5 text-[#2538D9] flex-shrink-0" />
                      <span className="text-[11px] truncate">Cổng phụ huynh: /p/{g.slug}</span>
                    </div>
                    <button
                      onClick={() => copyPortalLink(g.slug)}
                      className="p-1 text-slate-500 hover:text-[#2538D9] transition-colors flex-shrink-0"
                      title="Sao chép liên kết"
                    >
                      {copiedSlug === g.slug ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer Quick Actions */}
                <div className="flex items-center gap-2 mt-5 pt-3 border-t border-[#E4E7EC]">
                  <Link
                    href={`/attendance?groupId=${g.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-[#E4E7EC] hover:bg-slate-50 text-xs font-semibold text-[#101828] transition-colors"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-[#2538D9]" />
                    <span>Điểm danh</span>
                  </Link>

                  <Link
                    href={`/groups/${g.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-xs font-semibold text-white transition-all shadow-xs"
                  >
                    <span>Xem chi tiết</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="ting-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#475467] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tên lớp / CLB</th>
                  <th className="py-3 px-4">Loại hình</th>
                  <th className="py-3 px-4">Sĩ số</th>
                  <th className="py-3 px-4">Học phí chuẩn</th>
                  <th className="py-3 px-4">Chu kỳ</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {filteredGroups.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#101828] hover:text-[#2538D9]">
                        <Link href={`/groups/${g.id}`}>{g.name}</Link>
                      </div>
                      <span className="text-[11px] text-[#475467] font-mono">/{g.slug}</span>
                    </td>
                    <td className="py-3 px-4 text-[#475467]">
                      {g.groupType === 'SPORTS_CLUB' ? 'CLB Thể thao' : g.groupType === 'RENTAL' ? 'Nhà trọ' : 'Lớp học'}
                    </td>
                    <td className="py-3 px-4 font-bold tabular-nums text-[#101828]">
                      {g._count.members}
                    </td>
                    <td className="py-3 px-4 font-bold tabular-nums text-[#2538D9]">
                      {formatVND(g.defaultFee)}
                    </td>
                    <td className="py-3 px-4 text-[#475467]">
                      {g.billingCycle === 'MONTHLY' ? 'Theo tháng' : 'Theo buổi'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Đang hoạt động
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/attendance?groupId=${g.id}`}
                        className="text-[#2538D9] font-semibold hover:underline"
                      >
                        Điểm danh
                      </Link>
                      <span className="text-slate-300">•</span>
                      <Link
                        href={`/groups/${g.id}`}
                        className="text-[#101828] font-semibold hover:underline"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Create Group Dialog Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => !isSubmitting && setShowCreateModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1.25rem',
              padding: '8px',
            }
          }
        }}
      >
        <DialogTitle className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-[#101828] block">Tạo lớp học / CLB mới</span>
              <span className="text-[11px] text-[#475467] font-normal">Thiết lập thông tin và cấu hình học phí tự động</span>
            </div>
          </div>
        </DialogTitle>

        <form onSubmit={handleCreateGroup}>
          <DialogContent className="space-y-4 pt-2">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#101828] block mb-1">
                Tên lớp học / CLB <span className="text-rose-500">*</span>
              </label>
              <TextField
                fullWidth
                size="small"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="VD: Lớp Toán 6A Thầy Minh"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#101828] block mb-1">
                Đường dẫn công khai (Slug) <span className="text-rose-500">*</span>
              </label>
              <TextField
                fullWidth
                size="small"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="VD: lop-toan-6a"
                helperText="Dùng để chia sẻ cổng thanh toán VietQR cho phụ huynh: /p/lop-toan-6a"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#101828] block mb-1">
                  Mô hình quản lý
                </label>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={groupType}
                  onChange={(e) => setGroupType(e.target.value)}
                >
                  <MenuItem value="CLASS">Lớp học / Gia sư</MenuItem>
                  <MenuItem value="SPORTS_CLUB">CLB Thể thao</MenuItem>
                  <MenuItem value="RENTAL">Nhà trọ / Phòng</MenuItem>
                </TextField>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#101828] block mb-1">
                  Chu kỳ thu học phí
                </label>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                >
                  <MenuItem value="MONTHLY">Theo tháng</MenuItem>
                  <MenuItem value="PER_SESSION">Theo từng buổi</MenuItem>
                  <MenuItem value="DAILY">Theo ngày</MenuItem>
                </TextField>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#101828] block mb-1">
                Mức học phí mặc định (VND)
              </label>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={defaultFee}
                onChange={(e) => setDefaultFee(Number(e.target.value))}
                placeholder="VD: 600000"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#101828] block mb-1">
                Mô tả ngắn hoặc lịch học
              </label>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Lịch học Thứ 2 - 4 - 6 từ 17:30 đến 19:00 tại Trường THCS Lê Đình Chinh"
              />
            </div>
          </DialogContent>

          <DialogActions className="p-4 pt-0 gap-2">
            <Button
              variant="outlined"
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
              sx={{ color: '#475467', borderColor: '#E4E7EC' }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ backgroundColor: '#2538D9', '&:hover': { backgroundColor: '#1E2DB8' } }}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo lớp học'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </div>
  );
}
