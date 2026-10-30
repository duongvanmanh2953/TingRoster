'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MoreVertical,
  ExternalLink,
  Users2,
  Receipt,
  Share2,
  Edit3,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  CalendarCheck,
  GraduationCap,
  Tv,
  Building2,
  Briefcase,
  Layers,
} from 'lucide-react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { SpaceAvatar } from '@/components/common/SpaceAvatar';
import { parseEnabledModules } from '@/lib/spaces/constants';
import { EditSpaceModal } from '@/components/spaces/EditSpaceModal';
import { ShareSpaceModal } from '@/components/spaces/ShareSpaceModal';

export interface SpaceItem {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  themeColor?: string | null;
  enabledModules?: string | null;
  groupType?: string | null;
  isActive: boolean;
  _count: {
    members: number;
    invoices: number;
  };
}

interface SpaceCardProps {
  space: SpaceItem;
  viewMode?: 'grid' | 'table';
  onUpdate?: (updated: SpaceItem) => void;
  onDelete?: (id: string) => void;
}

const MODULE_LABEL_MAP: Record<string, string> = {
  members: 'Thành viên',
  attendance: 'Điểm danh',
  invoices: 'Hóa đơn',
  reports: 'Báo cáo',
  classes: 'Lớp học',
  bookings: 'Đặt sân',
  rentals: 'Phòng trọ',
  meters: 'Điện nước',
  shifts: 'Chấm công',
  contracts: 'Hợp đồng',
  chat: 'Chat',
  services: 'Bảng giá',
};

const getSpaceTypeMeta = (groupType?: string | null) => {
  switch (groupType) {
    case 'CLASS':
      return {
        label: 'Lớp học & Khóa',
        icon: GraduationCap,
        color: 'bg-blue-100/90 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200/80',
        cardBg: 'bg-gradient-to-b from-blue-50/70 via-white to-white dark:from-blue-950/25 dark:via-[#111726] dark:to-[#111726]',
        cardBorder: 'border-blue-200/80 dark:border-blue-900/40 hover:border-[#2538D9]/70',
        tableBg: 'bg-gradient-to-r from-blue-50/60 via-white to-white dark:from-blue-950/20 dark:via-[#111726] dark:to-[#111726]',
        tableBorder: 'border-blue-200/80 dark:border-blue-900/40 hover:border-[#2538D9]/70',
        statBg: 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-100/80 dark:border-blue-900/40',
      };
    case 'SPORTS_CLUB':
      return {
        label: 'CLB Thể thao',
        icon: Tv,
        color: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200/80',
        cardBg: 'bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-emerald-950/25 dark:via-[#111726] dark:to-[#111726]',
        cardBorder: 'border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-500/70',
        tableBg: 'bg-gradient-to-r from-emerald-50/60 via-white to-white dark:from-emerald-950/20 dark:via-[#111726] dark:to-[#111726]',
        tableBorder: 'border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-500/70',
        statBg: 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-100/80 dark:border-emerald-900/40',
      };
    case 'RENTAL':
      return {
        label: 'Nhà cho thuê',
        icon: Building2,
        color: 'bg-purple-100/90 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200/80',
        cardBg: 'bg-gradient-to-b from-purple-50/70 via-white to-white dark:from-purple-950/25 dark:via-[#111726] dark:to-[#111726]',
        cardBorder: 'border-purple-200/80 dark:border-purple-900/40 hover:border-purple-500/70',
        tableBg: 'bg-gradient-to-r from-purple-50/60 via-white to-white dark:from-purple-950/20 dark:via-[#111726] dark:to-[#111726]',
        tableBorder: 'border-purple-200/80 dark:border-purple-900/40 hover:border-purple-500/70',
        statBg: 'bg-purple-50/60 dark:bg-purple-950/40 border-purple-100/80 dark:border-purple-900/40',
      };
    case 'WORKFORCE':
      return {
        label: 'Nhân sự & Ca',
        icon: Briefcase,
        color: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200/80',
        cardBg: 'bg-gradient-to-b from-amber-50/70 via-white to-white dark:from-amber-950/25 dark:via-[#111726] dark:to-[#111726]',
        cardBorder: 'border-amber-200/80 dark:border-amber-900/40 hover:border-amber-500/70',
        tableBg: 'bg-gradient-to-r from-amber-50/60 via-white to-white dark:from-amber-950/20 dark:via-[#111726] dark:to-[#111726]',
        tableBorder: 'border-amber-200/80 dark:border-amber-900/40 hover:border-amber-500/70',
        statBg: 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-100/80 dark:border-amber-900/40',
      };
    default:
      return {
        label: 'Không gian chung',
        icon: Layers,
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/80',
        cardBg: 'bg-gradient-to-b from-slate-50/80 via-white to-white dark:from-slate-900/30 dark:via-[#111726] dark:to-[#111726]',
        cardBorder: 'border-slate-200/90 dark:border-white/10 hover:border-[#2538D9]/60',
        tableBg: 'bg-gradient-to-r from-slate-50/60 via-white to-white dark:from-slate-900/20 dark:via-[#111726] dark:to-[#111726]',
        tableBorder: 'border-slate-200/90 dark:border-white/10 hover:border-[#2538D9]/60',
        statBg: 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800',
      };
  }
};

export function SpaceCard({ space, viewMode = 'grid', onUpdate, onDelete }: SpaceCardProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const modules = parseEnabledModules(space.enabledModules);
  const spaceCode = space.code || `TR-${space.slug.toUpperCase().slice(0, 4)}`;
  const typeMeta = getSpaceTypeMeta(space.groupType);
  const TypeIcon = typeMeta.icon;

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(spaceCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleArchive = async () => {
    handleCloseMenu();
    if (!window.confirm(`Bạn có chắc chắn muốn lưu trữ không gian "${space.name}" không?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/groups/${space.id}`, { method: 'DELETE' });
      if (res.ok && onDelete) {
        onDelete(space.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {viewMode === 'table' ? (
        /* List / Table Mode Row */
        <div className={`group relative w-full ${typeMeta.tableBg} rounded-2xl border ${typeMeta.tableBorder} p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden`}>
          {/* Subtle colored brand accent strip on the left */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5 opacity-80 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: space.themeColor || '#2538D9' }}
          />

          <div className="flex items-center gap-4 min-w-0 flex-1 pl-2">
            <Link href={`/groups/${space.id}`} className="shrink-0 transition-transform group-hover:scale-105 duration-200">
              <SpaceAvatar
                name={space.name}
                logoUrl={space.logoUrl}
                themeColor={space.themeColor}
                enabledModules={space.enabledModules}
                groupType={space.groupType}
                size="lg"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Link
                  href={`/groups/${space.id}`}
                  className="font-bold text-base text-slate-900 dark:text-white hover:text-[#2538D9] dark:hover:text-indigo-400 truncate transition-colors"
                >
                  {space.name}
                </Link>

                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap ${typeMeta.color}`}>
                  <TypeIcon className="w-3 h-3" />
                  <span>{typeMeta.label}</span>
                </span>

                <Tooltip title="Sao chép mã không gian">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{spaceCode}</span>
                  </button>
                </Tooltip>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${space.isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${space.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {space.isActive ? 'Hoạt động' : 'Đã lưu trữ'}
                </span>
              </div>

              {space.description ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {space.description}
                </p>
              ) : (
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  tingroster.vn/p/{space.slug}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-5 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3 text-xs">
              <Link
                href={`/groups/${space.id}/members`}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                title="Tổng thành viên"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Thành viên</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                    {space._count?.members || 0}
                  </span>
                </div>
              </Link>

              <Link
                href={`/groups/${space.id}/invoices`}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                title="Khoản thu & Hóa đơn"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Hóa đơn</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                    {space._count?.invoices || 0}
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/groups/${space.id}`}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#2538D9] hover:text-white text-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-[#2538D9] dark:hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                <span>Vào không gian</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={handleOpenMenu}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Thao tác"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Grid Mode Card: High-End Productivity SaaS Design with Brand Hue Indicator */
        <div className={`group relative w-full ${typeMeta.cardBg} rounded-2xl border ${typeMeta.cardBorder} p-5 shadow-xs hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden`}>
          {/* Top Brand Color Strip */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5 opacity-90 transition-opacity group-hover:opacity-100"
            style={{ backgroundColor: space.themeColor || '#2538D9' }}
          />

          <div>
            {/* Top Row: Avatar + Title & Badges + Action Buttons */}
            <div className="flex items-start justify-between gap-3 pt-1 mb-3.5">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Link
                  href={`/groups/${space.id}`}
                  className="shrink-0 transition-transform group-hover:scale-105 duration-200 mt-0.5"
                >
                  <SpaceAvatar
                    name={space.name}
                    logoUrl={space.logoUrl}
                    themeColor={space.themeColor}
                    enabledModules={space.enabledModules}
                    groupType={space.groupType}
                    size="md"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  {/* Space Type Pill & Active Status */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap ${typeMeta.color}`}>
                      <TypeIcon className="w-3 h-3" />
                      <span>{typeMeta.label}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <span className={`w-1.5 h-1.5 rounded-full ${space.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                      {space.isActive ? 'Hoạt động' : 'Lưu trữ'}
                    </span>
                  </div>

                  {/* Space Name */}
                  <Link
                    href={`/groups/${space.id}`}
                    className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#2538D9] dark:group-hover:text-indigo-400 transition-colors line-clamp-1 leading-snug"
                    title={space.name}
                  >
                    {space.name}
                  </Link>

                  {/* Code & Slug */}
                  <div className="flex items-center gap-2 mt-1">
                    <Tooltip title="Sao chép mã không gian">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {copiedCode ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{spaceCode}</span>
                      </button>
                    </Tooltip>
                    <span className="text-[11px] text-slate-400 font-mono truncate">
                      /{space.slug}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Menu */}
              <div className="flex items-center gap-1 shrink-0 -mr-1">
                <Tooltip title="Chia sẻ lời mời">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#2538D9] hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Chia sẻ lời mời"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </Tooltip>

                <button
                  type="button"
                  onClick={handleOpenMenu}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Thao tác khác"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Space Description */}
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3 min-h-[32px]">
              {space.description || 'Không gian quản lý vận hành đa dịch vụ, tự động hóa điểm danh và đối soát VietQR.'}
            </p>

            {/* Feature Modules Pill Chips */}
            <div className="flex items-center gap-1.5 mb-3.5 flex-wrap">
              {modules.slice(0, 4).map((mod) => (
                <span
                  key={mod}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-white/5 whitespace-nowrap font-semibold"
                >
                  {MODULE_LABEL_MAP[mod] || mod}
                </span>
              ))}
              {modules.length > 4 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-slate-400 font-semibold">
                  +{modules.length - 4}
                </span>
              )}
            </div>

            {/* Micro Stats KPI Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Link
                href={`/groups/${space.id}/members`}
                className={`p-2.5 rounded-xl ${typeMeta.statBg} hover:bg-blue-50/70 dark:hover:bg-blue-950/60 border flex items-center justify-between transition-colors group/stat`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-[#2538D9] dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Users2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Thành viên
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums group-hover/stat:text-[#2538D9] transition-colors">
                  {space._count?.members || 0}
                </span>
              </Link>

              <Link
                href={`/groups/${space.id}/invoices`}
                className={`p-2.5 rounded-xl ${typeMeta.statBg} hover:bg-emerald-50/70 dark:hover:bg-emerald-950/60 border flex items-center justify-between transition-colors group/stat`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Hóa đơn
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums group-hover/stat:text-emerald-600 transition-colors">
                  {space._count?.invoices || 0}
                </span>
              </Link>
            </div>
          </div>

          {/* Card Footer: Full-Width Entry Button + Quick Attendance Shortcut */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
            <Link
              href={`/groups/${space.id}`}
              className="flex-1 py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-[#2538D9] hover:text-white text-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-[#2538D9] dark:hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:bg-[#2538D9] group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/20 whitespace-nowrap"
            >
              <span>Vào quản lý không gian</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={`/groups/${space.id}/attendance`}
              title="Lịch & Điểm danh nhanh"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
            >
              <CalendarCheck className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Popover Menu with Standardized Semantic Labels */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1rem',
              minWidth: 200,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            router.push(`/groups/${space.id}`);
          }}
          sx={{ fontSize: '0.8125rem', fontWeight: 600, py: 1 }}
        >
          <ListItemIcon>
            <ExternalLink className="w-4 h-4 text-slate-600" />
          </ListItemIcon>
          <ListItemText>Vào không gian</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setEditModalOpen(true);
          }}
          sx={{ fontSize: '0.8125rem', fontWeight: 600, py: 1 }}
        >
          <ListItemIcon>
            <Edit3 className="w-4 h-4 text-blue-600" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa thông tin</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setShareModalOpen(true);
          }}
          sx={{ fontSize: '0.8125rem', fontWeight: 600, py: 1 }}
        >
          <ListItemIcon>
            <Share2 className="w-4 h-4 text-emerald-600" />
          </ListItemIcon>
          <ListItemText>Lời mời tham gia</ListItemText>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={handleArchive}
          sx={{ fontSize: '0.8125rem', fontWeight: 600, py: 1, color: '#DC2626' }}
        >
          <ListItemIcon>
            <Trash2 className="w-4 h-4 text-rose-600" />
          </ListItemIcon>
          <ListItemText>Lưu trữ không gian</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Modal */}
      {editModalOpen && (
        <EditSpaceModal
          space={space}
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={(updated) => {
            if (onUpdate) onUpdate(updated);
          }}
        />
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <ShareSpaceModal
          space={space}
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </>
  );
}
