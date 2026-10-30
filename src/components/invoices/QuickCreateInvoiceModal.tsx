'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  X,
  Users,
  User,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  Zap,
  ListPlus,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Chip,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { formatVND, formatCompactVND, formatNumber } from '@/lib/utils';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';

interface QuickCreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialGroupId?: string;
}

interface GroupOption {
  id: string;
  name: string;
  defaultFee: number;
}

interface MemberOption {
  id: string;
  name: string;
  phone?: string | null;
  groupId: string;
}

export function QuickCreateInvoiceModal({
  open,
  onClose,
  onSuccess,
  initialGroupId,
}: QuickCreateInvoiceModalProps) {
  const [mode, setMode] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Form states
  const [groupId, setGroupId] = useState(initialGroupId || '');
  const [memberId, setMemberId] = useState('');
  const [title, setTitle] = useState('Học phí Tháng 10/2026');
  const [amount, setAmount] = useState<number>(500000);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  // Batch specific states
  const [pricingType, setPricingType] = useState<'FIXED' | 'PER_SESSION'>('FIXED');
  const [feePerSession, setFeePerSession] = useState(50000);

  // Multi-line breakdown state
  const [useLineItems, setUseLineItems] = useState(false);
  const [lineItems, setLineItems] = useState<Array<{
    id: string;
    name: string;
    qty: number;
    unit: string;
    unitPrice: number;
    discount: number;
    total: number;
  }>>([
    { id: '1', name: 'Khoản thu chính (Phòng / Học phí)', qty: 1, unit: 'tháng', unitPrice: 500000, discount: 0, total: 500000 },
  ]);

  const lineItemsSum = lineItems.reduce((acc, it) => acc + it.total, 0);

  const handleAddLineItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: 'Khoản phụ phí / Dịch vụ',
      qty: 1,
      unit: 'mục',
      unitPrice: 50000,
      discount: 0,
      total: 50000,
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const handleUpdateLineItem = (id: string, updates: Partial<(typeof lineItems)[0]>) => {
    setLineItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, ...updates };
        updated.total = Math.max(0, Math.round(updated.qty * updated.unitPrice - (updated.discount || 0)));
        return updated;
      })
    );
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick amount presets
  const AMOUNT_PRESETS = [
    { label: '200k', value: 200000 },
    { label: '500k', value: 500000 },
    { label: '1.2M', value: 1200000 },
    { label: '2.5M', value: 2500000 },
    { label: '3.5M', value: 3500000 },
  ];

  // Quick title templates
  const TITLE_TEMPLATES = [
    'Học phí Tháng 10',
    'Tiền phòng trọ + Điện nước',
    'Phí sinh hoạt CLB',
    'Tiền cọc giữ chỗ',
  ];

  // Load groups on open
  useEffect(() => {
    if (!open) {
      setCreatedInvoice(null);
      setErrorMsg(null);
      return;
    }

    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setGroups(data.data);
          if (!groupId) {
            setGroupId(data.data[0].id);
            setAmount(data.data[0].defaultFee || 500000);
          }
        }
      })
      .catch(() => {});
  }, [open, groupId]);

  // Load members when groupId changes
  useEffect(() => {
    if (!groupId) {
      setMembers([]);
      return;
    }

    setLoadingMembers(true);
    fetch(`/api/members?groupId=${groupId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMembers(data.data || []);
          if (data.data?.length > 0) {
            setMemberId(data.data[0].id);
          } else {
            setMemberId('');
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMembers(false));
  }, [groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'SINGLE') {
        if (!groupId) throw new Error('Vui lòng chọn cơ sở / lớp học');
        if (!memberId) throw new Error('Vui lòng chọn thành viên / người nộp');
        if (!title.trim()) throw new Error('Vui lòng nhập nội dung thu');
        const effectiveAmount = useLineItems ? lineItemsSum : amount;
        if (effectiveAmount <= 0) throw new Error('Số tiền thu phải lớn hơn 0');

        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId,
            memberId,
            title: title.trim(),
            amountDue: Math.round(effectiveAmount),
            dueDate,
            lineItems: useLineItems ? lineItems : undefined,
          }),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || 'Lỗi khi tạo hóa đơn');

        setCreatedInvoice(result.data);
        if (onSuccess) onSuccess();
      } else {
        // BATCH MODE
        if (!groupId) throw new Error('Vui lòng chọn lớp học / nhóm');
        if (!title.trim()) throw new Error('Vui lòng nhập tiêu đề đợt thu');

        const res = await fetch('/api/invoices/bulk-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId,
            title: title.trim(),
            pricingType,
            fixedAmount: Math.round(amount),
            feePerSession: Math.round(feePerSession),
            dueDate,
          }),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || 'Lỗi khi tạo đợt thu');

        setCreatedInvoice({
          isBatch: true,
          count: result.data?.createdCount || 0,
          totalAmount: result.data?.totalAmount || 0,
        });
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdInvoice?.publicToken) return;
    const url = `${window.location.origin}/p/${createdInvoice.publicToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 2.5, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2538D9]/10 text-[#2538D9] dark:text-indigo-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Tạo khoản thu một chạm
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Gắn mã VietQR tự động khớp tiền, gửi link phụ huynh ngay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        {!createdInvoice && (
          <div className="grid grid-cols-2 gap-2 p-1 mt-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setMode('SINGLE')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mode === 'SINGLE'
                  ? 'bg-white dark:bg-[#131C2E] text-[#2538D9] dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Cá nhân (1 học viên / khách)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('BATCH')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mode === 'BATCH'
                  ? 'bg-white dark:bg-[#131C2E] text-[#2538D9] dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Cả lớp / Hàng loạt</span>
            </button>
          </div>
        )}
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 2.5 }} className="space-y-4">
        {createdInvoice ? (
          /* SUCCESS VIEW */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {createdInvoice.isBatch
                  ? `Đã tạo thành công ${createdInvoice.count} hóa đơn!`
                  : 'Tạo hóa đơn VietQR thành công!'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                {createdInvoice.isBatch
                  ? `Tổng số tiền đợt thu: ${formatVND(createdInvoice.totalAmount)} (${formatCompactVND(createdInvoice.totalAmount)}). Học viên có thể chuyển khoản ngay.`
                  : `Mã giao dịch đối soát: ${createdInvoice.paymentCode} • Số tiền: ${formatVND(createdInvoice.amountDue)}`}
              </p>
            </div>

            {/* Spotlight Success Card */}
            {!createdInvoice.isBatch && (
              <SpotlightCard className="text-left space-y-3 p-4 bg-slate-50 dark:bg-slate-900/60 border border-indigo-500/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {createdInvoice.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Chờ thanh toán
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-slate-200 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Số tiền cần đóng:</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#2538D9] dark:text-indigo-300">
                      {formatVND(createdInvoice.amountDue)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5 font-medium">
                      ({formatCompactVND(createdInvoice.amountDue)})
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <MuiButton
                    fullWidth
                    variant="contained"
                    size="small"
                    onClick={handleCopyLink}
                    startIcon={copiedLink ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    sx={{
                      bgcolor: copiedLink ? '#059669' : '#2538D9',
                      '&:hover': { bgcolor: copiedLink ? '#047857' : '#1D2DB0' },
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '0.5rem',
                      py: 0.9,
                    }}
                  >
                    {copiedLink ? 'Đã chép link VietQR!' : 'Sao chép link gửi Zalo'}
                  </MuiButton>

                  <MuiButton
                    variant="outlined"
                    size="small"
                    component="a"
                    href={`/p/${createdInvoice.publicToken}`}
                    target="_blank"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '0.5rem',
                      py: 0.9,
                      borderColor: 'rgba(255,255,255,0.2)',
                    }}
                  >
                    <ExternalLink size={16} />
                  </MuiButton>
                </div>
              </SpotlightCard>
            )}
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errorMsg}
              </div>
            )}

            {/* Scope: Group selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Cơ sở / Lớp học / Dãy trọ *
              </label>
              <FormControl size="small" fullWidth>
                <Select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  sx={{
                    borderRadius: '0.625rem',
                    fontSize: '0.8125rem',
                    bgcolor: 'background.default',
                  }}
                >
                  {groups.map((g) => (
                    <MenuItem key={g.id} value={g.id} sx={{ fontSize: '0.8125rem' }}>
                      {g.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Member selection (if SINGLE mode) */}
            {mode === 'SINGLE' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Học viên / Khách thuê *
                </label>
                <FormControl size="small" fullWidth>
                  <Select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    disabled={loadingMembers || members.length === 0}
                    sx={{
                      borderRadius: '0.625rem',
                      fontSize: '0.8125rem',
                      bgcolor: 'background.default',
                    }}
                  >
                    {members.map((m) => (
                      <MenuItem key={m.id} value={m.id} sx={{ fontSize: '0.8125rem' }}>
                        {m.name} {m.phone ? `(${m.phone})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}

            {/* Title with quick template chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Nội dung thu phí *
                </label>
                <span className="text-[11px] text-slate-500">Mẫu nhanh:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {TITLE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => setTitle(`${tmpl} ${new Date().getMonth() + 1}/${new Date().getFullYear()}`)}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
              <TextField
                size="small"
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập nội dung thu..."
                slotProps={{
                  input: {
                    sx: { borderRadius: '0.625rem', fontSize: '0.8125rem' },
                  },
                }}
              />
            </div>

            {/* Billing Breakdown Mode Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Hình thức cấu hình:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setUseLineItems(false)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    !useLineItems
                      ? 'bg-white dark:bg-[#1E293B] text-[#2538D9] dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-white/10'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Khoản trọn gói
                </button>
                <button
                  type="button"
                  onClick={() => setUseLineItems(true)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    useLineItems
                      ? 'bg-white dark:bg-[#1E293B] text-[#2538D9] dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-white/10'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  Bảng kê chi tiết
                </button>
              </div>
            </div>

            {/* Line Items Builder or Single Amount */}
            {useLineItems ? (
              <div className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Bảng kê chi tiết từng dòng ({lineItems.length} mục)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2538D9] dark:text-indigo-400 hover:underline whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm khoản mục
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {lineItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleUpdateLineItem(item.id, { name: e.target.value })}
                          placeholder="Tên mục thu (VD: Tiền phòng, Điện, Nước...)"
                          className="flex-1 text-xs font-semibold px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:outline-hidden"
                        />
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Số lượng</label>
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.qty}
                            onChange={(e) => handleUpdateLineItem(item.id, { qty: Number(e.target.value) || 1 })}
                            className="w-full text-xs font-semibold px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Đơn vị</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleUpdateLineItem(item.id, { unit: e.target.value })}
                            placeholder="tháng/kWh"
                            className="w-full text-xs font-semibold px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Đơn giá (VND)</label>
                          <input
                            type="number"
                            step="1000"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateLineItem(item.id, { unitPrice: Number(e.target.value) || 0 })}
                            className="w-full text-xs font-semibold px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-white/5">
                        <span className="text-slate-500">Thành tiền dòng:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatVND(item.total)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Line Items Summary Banner */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Tổng cộng hóa đơn:
                  </span>
                  <span className="text-sm font-bold text-[#2538D9] dark:text-indigo-400">
                    {formatVND(lineItemsSum)}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Số tiền thu (VND) *
                  </label>
                  <div className="text-xs font-bold text-[#2538D9] dark:text-indigo-300">
                    {formatVND(amount)}
                    <span className="text-slate-500 dark:text-slate-400 font-medium ml-1">
                      ({formatCompactVND(amount)})
                    </span>
                  </div>
                </div>

                {/* Amount Presets */}
                <div className="flex items-center gap-1.5 mb-2">
                  {AMOUNT_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAmount(p.value)}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        amount === p.value
                          ? 'bg-[#2538D9] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  slotProps={{
                    htmlInput: { min: 1000, step: 10000 },
                    input: {
                      sx: {
                        borderRadius: '0.625rem',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                      },
                    },
                  }}
                />
              </div>
            )}

            {/* Due date */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Hạn chót thanh toán
              </label>
              <TextField
                size="small"
                fullWidth
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                slotProps={{
                  input: {
                    sx: { borderRadius: '0.625rem', fontSize: '0.8125rem' },
                  },
                }}
              />
            </div>
          </form>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 2.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {createdInvoice ? (
          <MuiButton
            fullWidth
            variant="contained"
            onClick={onClose}
            sx={{
              bgcolor: '#2538D9',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '0.625rem',
              py: 1,
            }}
          >
            Hoàn tất
          </MuiButton>
        ) : (
          <div className="flex items-center justify-end gap-2.5 w-full">
            <MuiButton
              onClick={onClose}
              disabled={submitting}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                fontSize: '0.8125rem',
              }}
            >
              Hủy
            </MuiButton>
            <MuiButton
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Zap size={16} />}
              sx={{
                bgcolor: '#2538D9',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.8125rem',
                textTransform: 'none',
                borderRadius: '0.625rem',
                px: 2.5,
                py: 0.9,
                boxShadow: '0 4px 12px rgba(37, 56, 217, 0.35)',
                '&:hover': { bgcolor: '#1D2DB0' },
              }}
            >
              {submitting ? 'Đang tạo...' : mode === 'SINGLE' ? 'Tạo hóa đơn ngay' : 'Tạo đợt thu cả lớp'}
            </MuiButton>
          </div>
        )}
      </DialogActions>
    </Dialog>
  );
}
