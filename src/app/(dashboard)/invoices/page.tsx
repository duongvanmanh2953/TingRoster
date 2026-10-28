'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatVND, formatCompactVND, formatDateVN } from '@/lib/utils';
import { QuickCreateInvoiceModal } from '@/components/invoices/QuickCreateInvoiceModal';
import {
  CreditCard,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';

import { Avatar } from '@/components/common/Avatar';
import { TingSelect } from '@/components/common/Select';
import { TingStatusChip, TingTag } from '@/components/common/Badge';

interface InvoiceItem {
  id: string;
  publicToken: string;
  paymentCode: string;
  title: string;
  amountDue: number;
  amountPaid: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERPAID' | 'VOID';
  dueDate?: string | null;
  createdAt: string;
  member: {
    id: string;
    name: string;
    phone?: string | null;
  };
  group: {
    id: string;
    name: string;
    slug: string;
  };
}

interface GroupOption {
  id: string;
  name: string;
  defaultFee: number;
  slug: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Bulk creation form states
  const [batchGroupId, setBatchGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [pricingType, setPricingType] = useState<'FIXED' | 'PER_SESSION'>('FIXED');
  const [fixedAmount, setFixedAmount] = useState(500000);
  const [feePerSession, setFeePerSession] = useState(50000);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load groups
  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setGroups(data.data);
          if (!batchGroupId) {
            setBatchGroupId(data.data[0].id);
            setFixedAmount(data.data[0].defaultFee || 500000);
          }
        }
      })
      .catch(() => {});
  }, [batchGroupId]);

  const loadInvoices = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGroupId) params.append('groupId', selectedGroupId);
      if (selectedStatus) params.append('status', selectedStatus);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedGroupId, selectedStatus, search]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInvoices();
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!batchGroupId) {
      setFormError('Vui lòng chọn lớp học / CLB');
      return;
    }
    if (!title.trim()) {
      setFormError('Vui lòng nhập tiêu đề đợt thu');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: {
        groupId: string;
        title: string;
        pricingType: 'FIXED' | 'PER_SESSION';
        amount?: number;
        feePerSession?: number;
        startDate?: string;
        endDate?: string;
        dueDate?: string;
      } = {
        groupId: batchGroupId,
        title: title.trim(),
        pricingType,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      };

      if (pricingType === 'FIXED') {
        payload.amount = fixedAmount;
      } else {
        payload.feePerSession = feePerSession;
        payload.startDate = new Date(startDate).toISOString();
        payload.endDate = new Date(endDate).toISOString();
      }

      const res = await fetch('/api/invoices/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        loadInvoices();
      } else {
        setFormError(data.error || 'Lỗi khi tạo đợt thu học phí');
      }
    } catch {
      setFormError('Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (groupSlug: string, publicToken: string) => {
    const url = `${window.location.origin}/p/${groupSlug}?token=${publicToken}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(publicToken);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Quick summary counts
  const totalInvoices = invoices.length;
  const unpaidCount = invoices.filter((i) => i.status === 'UNPAID').length;
  const paidCount = invoices.filter((i) => i.status === 'PAID' || i.status === 'OVERPAID').length;
  const totalDueAmount = invoices.reduce((acc, i) => acc + i.amountDue, 0);
  const totalPaidAmount = invoices.reduce((acc, i) => acc + i.amountPaid, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828] dark:text-[#F8FAFC]">
              Học phí & Hóa đơn
            </h1>
            <TingTag variantStyle="info" label="VietQR Napas" />
          </div>
          <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400 mt-1">
            Quản lý đợt thu, tạo mã thanh toán riêng biệt cho từng thành viên và theo dõi công nợ
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="contained"
            onClick={() => setShowCreateModal(true)}
            startIcon={<Plus className="w-4 h-4" />}
            sx={{
              bgcolor: '#2538D9',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textTransform: 'none',
              px: 2,
              py: 1,
              borderRadius: '0.75rem',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1E2DB8', boxShadow: 'none' },
            }}
          >
            Tạo đợt thu mới
          </Button>
        </div>
      </div>

      {/* 2. Metric KPI Strip with MUI TingStatusChip */}
      <div className="ting-card p-4 sm:p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E4E7EC] dark:divide-[#1E293B]">
          <div className="px-2 pt-2 md:pt-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-[#101828] dark:text-[#F8FAFC] tracking-tight block">
                {formatVND(totalDueAmount)}
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-[#2538D9] dark:text-indigo-300">
                {formatCompactVND(totalDueAmount)}
              </span>
            </div>
            <span className="text-xs font-medium text-[#475467] dark:text-slate-400 mt-1 block">
              Tổng số tiền cần thu
            </span>
          </div>

          <div className="px-2 pt-2 md:pt-0 md:pl-6">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight block">
                {formatVND(totalPaidAmount)}
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                {formatCompactVND(totalPaidAmount)}
              </span>
            </div>
            <span className="text-xs font-medium text-[#475467] dark:text-slate-400 mt-1 block">
              Đã thanh toán thực tế
            </span>
          </div>

          <div className="px-2 pt-2 md:pt-0 md:pl-6">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight block">
                {formatVND(Math.max(0, totalDueAmount - totalPaidAmount))}
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-300">
                {formatCompactVND(Math.max(0, totalDueAmount - totalPaidAmount))}
              </span>
            </div>
            <span className="text-xs font-medium text-[#475467] dark:text-slate-400 mt-1 block">
              Công nợ còn lại
            </span>
          </div>

          <div className="px-2 pt-2 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2 mt-1">
              <TingStatusChip status="UNPAID" label={`${unpaidCount} chưa nộp`} />
              <TingStatusChip status="PAID" label={`${paidCount} đã nộp`} />
            </div>
            <span className="text-xs font-medium text-[#475467] dark:text-slate-400 mt-2 block">
              Tổng {totalInvoices} phiếu thu
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Bar with MUI OutlinedInput and Buttons */}
      <div className="ting-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <OutlinedInput
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã TR, tên học viên, SĐT..."
            startAdornment={
              <InputAdornment position="start">
                <Search className="w-4 h-4 text-slate-400" />
              </InputAdornment>
            }
            endAdornment={
              search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')} edge="end" sx={{ p: 0.5 }}>
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }
            sx={{
              borderRadius: '0.75rem',
              fontSize: '0.75rem',
            }}
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <TingSelect
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            sizeVariant="sm"
            className="w-48 font-medium"
            options={[
              { value: '', label: 'Tất cả các lớp & CLB' },
              ...groups.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />

          <TingSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            sizeVariant="sm"
            className="w-40 font-medium"
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'UNPAID', label: 'Chưa đóng' },
              { value: 'PARTIAL', label: 'Đóng thiếu' },
              { value: 'PAID', label: 'Đã đóng đủ' },
              { value: 'OVERPAID', label: 'Đóng thừa' },
            ]}
          />

          <Tooltip title="Tải lại danh sách" arrow>
            <IconButton
              onClick={loadInvoices}
              size="small"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '0.5rem',
                border: '1px solid #E4E7EC',
              }}
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${
                  loading ? 'animate-spin text-[#2538D9]' : ''
                }`}
              />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* 4. Invoices List Table with MUI Badges */}
      <div className="ting-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#475467] text-xs font-medium">
            <CircularProgress size={24} sx={{ color: '#2538D9' }} />
            <span>Đang tải danh sách hóa đơn học phí...</span>
          </div>
        ) : invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#111726] border-b border-[#E4E7EC] dark:border-[#1E293B] text-[#475467] dark:text-slate-400 uppercase font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mã thu</th>
                  <th className="py-3 px-4">Học viên</th>
                  <th className="py-3 px-4">Lớp / Nhóm</th>
                  <th className="py-3 px-4 text-right">Phải thu</th>
                  <th className="py-3 px-4 text-right">Đã thu</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Hạn nộp</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#1E293B]">
                {invoices.map((inv) => {
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#2538D9] tabular-nums">
                        {inv.paymentCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#101828] dark:text-[#F8FAFC]">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={inv.member.name} size="xs" />
                          <div>
                            <Link
                              href={`/members/${inv.member.id}`}
                              className="hover:text-[#2538D9] transition-colors block"
                            >
                              {inv.member.name}
                            </Link>
                            {inv.member.phone && (
                              <span className="block text-[10px] text-[#475467] dark:text-slate-400 font-normal tabular-nums">
                                {inv.member.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#475467] dark:text-slate-400">
                        {inv.group.name}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#101828] dark:text-[#F8FAFC] tabular-nums">
                        {formatVND(inv.amountDue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatVND(inv.amountPaid)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <TingStatusChip status={inv.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#475467] dark:text-slate-400 text-[11px]">
                        {formatDateVN(inv.dueDate)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Tooltip title="Sao chép link VietQR gửi phụ huynh" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleCopyLink(inv.group.slug, inv.publicToken)}
                              sx={{
                                border: '1px solid #E4E7EC',
                                borderRadius: '0.5rem',
                              }}
                            >
                              {copiedToken === inv.publicToken ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-[#475467]" />
                              )}
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Xem trang thanh toán VietQR" arrow>
                            <IconButton
                              component={Link}
                              href={`/p/${inv.group.slug}?token=${inv.publicToken}`}
                              target="_blank"
                              size="small"
                              sx={{
                                border: '1px solid #E4E7EC',
                                borderRadius: '0.5rem',
                                color: '#2538D9',
                              }}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-[#475467] text-xs space-y-2">
            <p>Không có hóa đơn học phí nào phù hợp với bộ lọc hiện tại.</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="text"
              size="small"
              sx={{ color: '#2538D9', fontWeight: 700, textTransform: 'none' }}
            >
              + Tạo đợt thu học phí mới
            </Button>
          </div>
        )}
      </div>

      {/* 5. Streamlined 1-Touch Quick Create Invoice Modal */}
      <QuickCreateInvoiceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadInvoices}
      />
    </div>
  );
}
