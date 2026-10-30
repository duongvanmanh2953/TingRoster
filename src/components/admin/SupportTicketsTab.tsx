'use client';

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  CreditCard,
  Building2,
  RefreshCw,
  Send,
  MessageSquare,
  ChevronRight,
  User,
  ExternalLink
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import TablePagination from '@mui/material/TablePagination';
import { formatDateVN } from '@/lib/utils';

interface Ticket {
  id: string;
  ticketCode: string;
  category: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    bankId?: string;
    bankAccountNo?: string;
  };
}

export function SupportTicketsTab() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<Ticket['status']>('OPEN');
  const [editPriority, setEditPriority] = useState<Ticket['priority']>('NORMAL');
  const [editAdminNote, setEditAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
      if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
      if (searchQuery.trim()) params.set('query', searchQuery.trim());

      const res = await fetch(`/api/support/tickets?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setTickets(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleOpenDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority);
    setEditAdminNote(ticket.adminNote || '');
    setDetailModalOpen(true);
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: editStatus,
          priority: editPriority,
          adminNote: editAdminNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDetailModalOpen(false);
        setToastMsg(`Đã cập nhật phiếu #${selectedTicket.ticketCode} thành công!`);
        fetchTickets();
        setTimeout(() => setToastMsg(null), 4000);
      } else {
        alert(data.error || 'Lỗi khi cập nhật phiếu');
      }
    } catch {
      alert('Không thể kết nối máy chủ');
    } finally {
      setIsUpdating(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'PAYMENT_DISPUTE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Khiếu nại thanh toán</span>;
      case 'UNMATCHED_TX':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Giao dịch chưa khớp</span>;
      case 'REFUND_REQUEST':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Yêu cầu hoàn tiền</span>;
      case 'BUG':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">Báo lỗi kỹ thuật</span>;
      case 'BILLING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Gói cước & Phí</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Hỗ trợ chung</span>;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">Khẩn cấp</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Cao</span>;
      case 'NORMAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">Bình thường</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">Thấp</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'OPEN':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#2538D9] border border-blue-200 whitespace-nowrap select-none">Mới mở</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap select-none">Đang xử lý</span>;
      case 'WAITING_CUSTOMER':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap select-none">Chờ phản hồi</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap select-none">Đã giải quyết</span>;
      case 'CLOSED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 whitespace-nowrap select-none">Đã đóng</span>;
      default:
        return null;
    }
  };

  const pagedTickets = tickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const openTicketsCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const paymentDisputesCount = tickets.filter((t) => t.category === 'PAYMENT_DISPUTE' || t.category === 'UNMATCHED_TX').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Tổng số phiếu hỗ trợ</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{tickets.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Toàn bộ ticket gửi từ các cơ sở</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#111827] rounded-2xl border border-amber-200/80 dark:border-amber-900/40 shadow-xs border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">Đang chờ xử lý</div>
          <div className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-1">{openTicketsCount}</div>
          <span className="text-[11px] text-amber-600 mt-1 block">Cần nhân viên phản hồi trong 24h</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#111827] rounded-2xl border border-rose-200/80 dark:border-rose-900/40 shadow-xs border-l-4 border-l-rose-500">
          <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase">Khiếu nại thanh toán / Đối soát</div>
          <div className="text-2xl font-bold text-rose-800 dark:text-rose-300 mt-1">{paymentDisputesCount}</div>
          <span className="text-[11px] text-rose-600 mt-1 block">Ưu tiên xác minh biến động Napas</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã (#TK-...), tiêu đề hoặc người gửi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2538D9]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OPEN">Mới mở (Open)</option>
              <option value="IN_PROGRESS">Đang xử lý (In Progress)</option>
              <option value="WAITING_CUSTOMER">Chờ khách (Waiting)</option>
              <option value="RESOLVED">Đã giải quyết (Resolved)</option>
              <option value="CLOSED">Đã đóng (Closed)</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">Tất cả loại yêu cầu</option>
              <option value="PAYMENT_DISPUTE">Khiếu nại thanh toán</option>
              <option value="UNMATCHED_TX">Giao dịch chưa khớp</option>
              <option value="REFUND_REQUEST">Yêu cầu hoàn tiền</option>
              <option value="BUG">Báo lỗi sản phẩm</option>
              <option value="BILLING">Gói cước & Ví</option>
              <option value="GENERAL">Hỗ trợ chung</option>
            </select>

            <button
              type="button"
              onClick={fetchTickets}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2538D9]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Mã phiếu</th>
                <th className="py-3.5 px-4">Người gửi & Cơ sở</th>
                <th className="py-3.5 px-4">Loại yêu cầu</th>
                <th className="py-3.5 px-4">Tiêu đề & Nội dung</th>
                <th className="py-3.5 px-4 text-center">Độ ưu tiên</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Thời gian</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CircularProgress size={24} sx={{ color: '#2538D9' }} />
                    <p className="mt-2 text-xs">Đang tải danh sách khiếu nại & hỗ trợ...</p>
                  </td>
                </tr>
              ) : pagedTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không có phiếu hỗ trợ nào trong tiêu chí lọc này.
                  </td>
                </tr>
              ) : (
                pagedTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2538D9] dark:text-indigo-400">
                      #{t.ticketCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{t.user.name}</div>
                      <div className="text-[11px] text-slate-400">{t.user.email}</div>
                    </td>
                    <td className="py-3.5 px-4">{getCategoryBadge(t.category)}</td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">{t.subject}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{t.description}</div>
                      {t.adminNote && (
                        <div className="text-[10px] text-indigo-600 bg-black-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                          Ghi chú nội bộ: {t.adminNote}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">{getPriorityBadge(t.priority)}</td>
                    <td className="py-3.5 px-4 text-center">{getStatusBadge(t.status)}</td>
                    <td className="py-3.5 px-4 text-center text-slate-400 text-[11px]">
                      {formatDateVN(t.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(t)}
                        className="px-3 py-1.5 rounded-lg bg-[#2538D9]/10 hover:bg-[#2538D9]/20 text-[#2538D9] text-xs font-semibold transition-colors"
                      >
                        Xử lý
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800">
          <TablePagination
            component="div"
            count={tickets.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} trên ${count}`}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>

      {/* Ticket Details & Staff Resolution Modal */}
      {selectedTicket && (
        <Dialog
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: { sx: { borderRadius: '1rem', padding: '8px' } },
          }}
        >
          <DialogTitle className="pb-2 flex items-center justify-between">
            <div>
              <span className="font-bold text-base text-slate-900 block">
                Xử lý Phiếu hỗ trợ #{selectedTicket.ticketCode}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                Người gửi: {selectedTicket.user.name} ({selectedTicket.user.email})
              </span>
            </div>
            {getCategoryBadge(selectedTicket.category)}
          </DialogTitle>

          <DialogContent className="space-y-4 pt-2 text-xs">
            {/* Subject & Description */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Nội dung khách hàng gửi</span>
              <div className="font-bold text-slate-900 text-sm">{selectedTicket.subject}</div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>

            {/* If Payment Dispute, show bank info */}
            {selectedTicket.user.bankAccountNo && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#2538D9]" />
                <span>
                  Tài khoản đăng ký cơ sở: <strong>{selectedTicket.user.bankId} • {selectedTicket.user.bankAccountNo}</strong>
                </span>
              </div>
            )}

            {/* Status & Priority Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">Trạng thái phiếu</label>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Ticket['status'])}
                >
                  <MenuItem value="OPEN">Mới mở (Open)</MenuItem>
                  <MenuItem value="IN_PROGRESS">Đang xử lý (In Progress)</MenuItem>
                  <MenuItem value="WAITING_CUSTOMER">Chờ khách phản hồi</MenuItem>
                  <MenuItem value="RESOLVED">Đã giải quyết (Resolved)</MenuItem>
                  <MenuItem value="CLOSED">Đã đóng (Closed)</MenuItem>
                </TextField>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">Độ ưu tiên</label>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Ticket['priority'])}
                >
                  <MenuItem value="LOW">Thấp</MenuItem>
                  <MenuItem value="NORMAL">Bình thường</MenuItem>
                  <MenuItem value="HIGH">Cao</MenuItem>
                  <MenuItem value="URGENT">Khẩn cấp (SLA 2h)</MenuItem>
                </TextField>
              </div>
            </div>

            {/* Internal Staff Notes (Separated from customer content) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-900">
                  Ghi chú nội bộ Admin (Internal Staff Only)
                </label>
                <span className="text-[10px] text-amber-600 font-semibold">* Khách hàng KHÔNG nhìn thấy ghi chú này</span>
              </div>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                placeholder="Nhập ghi chú kết quả đối soát ngân hàng, lý do điều chỉnh hoặc hướng xử lý kỹ thuật..."
                value={editAdminNote}
                onChange={(e) => setEditAdminNote(e.target.value)}
              />
            </div>
          </DialogContent>

          <DialogActions className="pt-2 border-t">
            <Button onClick={() => setDetailModalOpen(false)}>Hủy</Button>
            <Button
              variant="contained"
              disabled={isUpdating}
              onClick={handleUpdateTicket}
              sx={{ backgroundColor: '#2538D9' }}
            >
              {isUpdating ? 'Đang lưu...' : 'Lưu cập nhật'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
