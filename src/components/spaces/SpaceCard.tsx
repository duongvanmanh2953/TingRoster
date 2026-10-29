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
  ArrowRight
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

export function SpaceCard({ space, viewMode = 'grid', onUpdate, onDelete }: SpaceCardProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const modules = parseEnabledModules(space.enabledModules);
  const spaceCode = space.code || `TR-${space.slug.toUpperCase().slice(0, 4)}`;

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
        <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs hover:shadow-sm transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <SpaceAvatar
              name={space.name}
              logoUrl={space.logoUrl}
              themeColor={space.themeColor}
              enabledModules={space.enabledModules}
              groupType={space.groupType}
              size="md"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/groups/${space.id}`}
                  className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate transition-colors"
                >
                  {space.name}
                </Link>

                <Tooltip title="Sao chép mã không gian">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                    <span>{spaceCode}</span>
                  </button>
                </Tooltip>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  space.isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {space.isActive ? 'Hoạt động' : 'Đã lưu trữ'}
                </span>
              </div>

              {space.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {space.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-5 flex-shrink-0">
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              {modules.includes('members') && (
                <div className="flex items-center gap-1.5" title="Thành viên">
                  <Users2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {space._count?.members || 0}
                  </span>
                  <span className="text-[11px] text-slate-400">thành viên</span>
                </div>
              )}

              {modules.includes('invoices') && (
                <div className="flex items-center gap-1.5" title="Hóa đơn">
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {space._count?.invoices || 0}
                  </span>
                  <span className="text-[11px] text-slate-400">hóa đơn</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/groups/${space.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
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
        /* Grid Mode Card */
        <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <SpaceAvatar
                  name={space.name}
                  logoUrl={space.logoUrl}
                  themeColor={space.themeColor}
                  enabledModules={space.enabledModules}
                  groupType={space.groupType}
                  size="md"
                />

                <div className="min-w-0">
                  <Link
                    href={`/groups/${space.id}`}
                    className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block truncate transition-colors leading-snug"
                  >
                    {space.name}
                  </Link>

                  <div className="flex items-center gap-2 mt-1">
                    <Tooltip title="Sao chép mã không gian">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{spaceCode}</span>
                      </button>
                    </Tooltip>

                    <span className="text-[11px] text-slate-400 font-mono truncate">
                      p/{space.slug}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions & More Menu */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Tooltip title="Lời mời tham gia">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareModalOpen(true);
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Lời mời tham gia"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </Tooltip>

                <button
                  type="button"
                  onClick={handleOpenMenu}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Thao tác khác"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {space.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {space.description}
              </p>
            )}
          </div>

          {/* Card Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              {modules.includes('members') && (
                <div className="flex items-center gap-1.5" title="Tổng thành viên">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                    <Users2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {space._count?.members || 0}
                  </span>
                  <span className="hidden sm:inline text-[11px] text-slate-400">thành viên</span>
                </div>
              )}

              {modules.includes('invoices') && (
                <div className="flex items-center gap-1.5" title="Hóa đơn">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {space._count?.invoices || 0}
                  </span>
                  <span className="hidden sm:inline text-[11px] text-slate-400">hóa đơn</span>
                </div>
              )}
            </div>

            <Link
              href={`/groups/${space.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-600 dark:hover:text-white text-xs font-bold inline-flex items-center gap-1 transition-all group-hover:translate-x-0.5 cursor-pointer shadow-2xs"
            >
              <span>Vào không gian</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
