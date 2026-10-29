'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Users2,
  Check,
  Plus,
  X,
  UserCheck,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { Avatar } from '@/components/common/Avatar';

export interface CommunityMemberItem {
  id: string;
  userId: string | null;
  name: string;
  email?: string;
  phone?: string | null;
  parentName?: string | null;
  avatarUrl?: string | null;
  role?: string;
  type: 'USER' | 'MEMBER';
  sourceGroupName?: string;
  isEnrolled: boolean;
}

interface CommunityMemberSearchModalProps {
  open: boolean;
  groupId: string;
  groupName: string;
  onClose: () => void;
  onMembersAdded: () => void;
}

export function CommunityMemberSearchModal({
  open,
  groupId,
  groupName,
  onClose,
  onMembersAdded,
}: CommunityMemberSearchModalProps) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<CommunityMemberItem[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map<string, CommunityMemberItem>>(new Map());
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    addedCount: number;
    skippedCount: number;
  } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Community Members
  const fetchMembers = useCallback(async (searchQuery: string, nextCursor: string | null = null) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!nextCursor) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        groupId,
        limit: '15',
      });
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }
      if (nextCursor) {
        params.append('cursor', nextCursor);
      }

      const res = await fetch(`/api/community/members?${params.toString()}`, {
        signal: controller.signal,
      });
      const data = await res.json();

      if (data.success && data.data) {
        const newItems: CommunityMemberItem[] = data.data.items || [];
        setItems((prev) => {
          if (!nextCursor) return newItems;
          // Deduplicate by item id
          const existingIds = new Set(prev.map((i) => i.id));
          const filtered = newItems.filter((i) => !existingIds.has(i.id));
          return [...prev, ...filtered];
        });
        setCursor(data.data.nextCursor || null);
        setHasMore(Boolean(data.data.hasMore));
      } else {
        setError(data.error || 'Lỗi tải danh sách cộng đồng');
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // normal cancellation
      }
      setError('Lỗi kết nối khi tìm kiếm thành viên');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [groupId]);

  // Debounced Search on Query Change
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setCursor(null);
      fetchMembers(query, null);
    }, 280);

    return () => clearTimeout(timer);
  }, [query, open, fetchMembers]);

  // Infinite Scroll Observer on Scroll Container
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 80 && hasMore && !loading && !loadingMore && cursor) {
      fetchMembers(query, cursor);
    }
  };

  // Toggle selection
  const handleToggleSelect = (item: CommunityMemberItem) => {
    if (item.isEnrolled) return;
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.set(item.id, item);
      }
      return next;
    });
  };

  const handleRemoveSelected = (id: string) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  // Submit Batch Enrollment
  const handleSubmit = async () => {
    if (selectedMap.size === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        members: Array.from(selectedMap.values()).map((item) => ({
          userId: item.userId || undefined,
          name: item.name,
          phone: item.phone || undefined,
          parentName: item.parentName || undefined,
          avatarUrl: item.avatarUrl || undefined,
        })),
      };

      const res = await fetch(`/api/groups/${groupId}/members/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessResult({
          addedCount: data.data.addedCount,
          skippedCount: data.data.skippedCount,
        });
        setSelectedMap(new Map());
        onMembersAdded();
        setTimeout(() => {
          setSuccessResult(null);
          onClose();
        }, 1800);
      } else {
        setError(data.error || 'Lỗi thêm thành viên hàng loạt');
      }
    } catch {
      setError('Lỗi kết nối máy chủ khi thêm thành viên');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '1.25rem',
            bgcolor: 'background.paper',
            p: 1,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 1.5, px: 2 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <Users2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                Thêm thành viên từ cộng đồng
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Lớp / Nhóm: <strong className="text-slate-800 dark:text-slate-200">{groupName}</strong>
              </p>
            </div>
          </div>
          <IconButton size="small" onClick={onClose} disabled={submitting}>
            <X className="w-4 h-4 text-slate-400" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 1, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Search Bar with Debounce Indicator */}
        <div className="relative mb-3 flex-shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên học viên, email, số điện thoại..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#2538D9]"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Selected Members Chips Drawer */}
        {selectedMap.size > 0 && (
          <div className="mb-3 p-2.5 rounded-xl bg-[#2538D9]/5 border border-[#2538D9]/20 flex-shrink-0 space-y-1.5 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#2538D9]">
              <span>Đã chọn ({selectedMap.size} thành viên):</span>
              <button
                type="button"
                onClick={() => setSelectedMap(new Map())}
                className="text-[10px] text-slate-500 hover:text-rose-600 underline font-normal"
              >
                Bỏ chọn tất cả
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {Array.from(selectedMap.values()).map((sel) => (
                <Chip
                  key={sel.id}
                  size="small"
                  label={sel.name}
                  onDelete={() => handleRemoveSelected(sel.id)}
                  sx={{
                    bgcolor: '#2538D9',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '& .MuiChip-deleteIcon': { color: '#ffffff', opacity: 0.8 },
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successResult && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Thành công! Đã thêm {successResult.addedCount} thành viên vào nhóm.
              {successResult.skippedCount > 0 && ` (${successResult.skippedCount} người đã có sẵn)`}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Results List */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 pr-1 -mr-1"
        >
          {loading && items.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CircularProgress size={24} sx={{ color: '#2538D9' }} />
              <p className="text-xs text-slate-400">Đang tìm kiếm trong cộng đồng...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Users2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {query ? 'Không tìm thấy thành viên phù hợp' : 'Nhập từ khóa để tìm kiếm thành viên'}
              </p>
              <p className="text-[11px] text-slate-400">
                Tìm theo họ tên, email hoặc số điện thoại của tài khoản TingRoster
              </p>
            </div>
          ) : (
            items.map((item) => {
              const isSelected = selectedMap.has(item.id);
              const isEnrolled = item.isEnrolled;

              return (
                <div
                  key={item.id}
                  onClick={() => !isEnrolled && handleToggleSelect(item)}
                  className={`py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors ${
                    isEnrolled
                      ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#2538D9]/10 dark:bg-[#2538D9]/20 border border-[#2538D9]/30 cursor-pointer'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={item.name} size="sm" src={item.avatarUrl || undefined} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.name}
                        </span>
                        {item.role === 'ADMIN' && (
                          <span className="text-[9px] px-1 rounded bg-rose-100 text-rose-700 font-bold uppercase">
                            Admin
                          </span>
                        )}
                        {item.sourceGroupName && (
                          <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                            (Từ {item.sourceGroupName})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {item.phone || item.email || 'Thành viên cộng đồng'}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isEnrolled ? (
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Đã trong nhóm</span>
                      </span>
                    ) : isSelected ? (
                      <span className="w-6 h-6 rounded-lg bg-[#2538D9] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Infinite Scroll Spinner */}
          {loadingMore && (
            <div className="py-3 text-center">
              <CircularProgress size={18} sx={{ color: '#2538D9' }} />
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 1.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Hủy bỏ
        </button>

        <button
          type="button"
          disabled={submitting || selectedMap.size === 0}
          onClick={handleSubmit}
          className="px-5 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-40 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          {submitting ? (
            <>
              <CircularProgress size={14} color="inherit" />
              <span>Đang thêm...</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              <span>Xác nhận thêm {selectedMap.size > 0 ? `(${selectedMap.size})` : ''}</span>
            </>
          )}
        </button>
      </DialogActions>
    </Dialog>
  );
}
