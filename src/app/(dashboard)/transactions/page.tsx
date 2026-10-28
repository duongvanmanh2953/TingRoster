'use client';

import React, { useEffect, useState } from 'react';
import { formatVND, formatDateTimeVN } from '@/lib/utils';
import {
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Search,
  Check,
  UserCheck,
  QrCode,
  ShieldCheck,
  Zap,
  Building2,
  X,
  Sparkles,
} from 'lucide-react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

import { BankLogo } from '@/components/common/BankLogo';
import { Avatar } from '@/components/common/Avatar';
import { TingSelect } from '@/components/common/Select';
import { TingBadge, TingStatusChip, TingTag } from '@/components/common/Badge';

interface TransactionItem {
  id: string;
  provider: string;
  providerTransactionId: string;
  amount: number;
  content: string;
  direction: string;
  transactionDate: string;
  processingStatus: 'UNMATCHED' | 'MATCHED' | 'PROCESSED' | 'DUPLICATE' | 'IGNORED' | 'FAILED';
  failureReason?: string | null;
  matchedInvoice?: {
    id: string;
    paymentCode: string;
    title: string;
    member: { name: string };
  } | null;
}

interface InvoiceOption {
  id: string;
  paymentCode: string;
  title: string;
  amountDue: number;
  amountPaid: number;
  member: { name: string };
}

interface AISuggestion {
  invoiceId: string;
  memberName: string;
  groupName: string;
  remaining: number;
  confidence: number;
  reasons: string[];
}

export default function TransactionsPage() {
  const [tab, setTab] = useState<'ALL' | 'UNMATCHED'>('ALL');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState<InvoiceOption[]>([]);
  const [assignInvoiceId, setAssignInvoiceId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  const loadTransactions = (currentTab = tab) => {
    setLoading(true);
    const url =
      currentTab === 'UNMATCHED'
        ? '/api/transactions/unmatched'
        : '/api/transactions';

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTransactions(data.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTransactions(tab);
  }, [tab]);

  const handleOpenAssignModal = async (tx: TransactionItem) => {
    setSelectedTx(tx);
    setAssignNote('');
    setAiSuggestions([]);

    try {
      const res = await fetch('/api/invoices?status=UNPAID');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setUnpaidInvoices(data.data);
        setAssignInvoiceId(data.data[0].id);
      }

      // Fetch AI suggestion
      const aiRes = await fetch('/api/ai/match-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: tx.content,
          amount: tx.amount,
        }),
      });
      const aiData = await aiRes.json();
      if (aiData.success && aiData.data?.suggestions) {
        setAiSuggestions(aiData.data.suggestions);
        if (aiData.data.suggestions.length > 0) {
          setAssignInvoiceId(aiData.data.suggestions[0].invoiceId);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx || !assignInvoiceId) return;
    setIsAssigning(true);

    try {
      const res = await fetch('/api/transactions/manual-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: selectedTx.id,
          invoiceId: assignInvoiceId,
          note: assignNote || 'Khớp thủ công qua giao diện TingRoster',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTx(null);
        loadTransactions(tab);
      } else {
        alert(data.error || 'Lỗi khi gán giao dịch');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ');
    } finally {
      setIsAssigning(false);
    }
  };

  const unmatchedCount = transactions.filter((t) => t.processingStatus === 'UNMATCHED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828] dark:text-[#F8FAFC]">
              Giao dịch & Đối soát VietQR
            </h1>
            <TingTag variantStyle="success" label="Webhook Live" />
          </div>
          <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400 mt-1">
            Lịch sử biến động số dư ngân hàng theo thời gian thực và tự động gạch nợ hóa đơn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Tải lại giao dịch mới nhất" arrow>
            <Button
              variant="outlined"
              size="small"
              onClick={() => loadTransactions(tab)}
              startIcon={
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin text-[#2538D9]' : ''}`}
                />
              }
              sx={{
                borderRadius: '0.75rem',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem',
                borderColor: '#E4E7EC',
                color: '#475467',
                '&:hover': { borderColor: '#2538D9', color: '#2538D9' },
              }}
            >
              Làm mới
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="ting-card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#475467] dark:text-slate-400 font-medium block">
              Tổng số tiền đã nhận
            </span>
            <span className="text-xl font-bold text-[#101828] dark:text-[#F8FAFC] tabular-nums mt-0.5 block">
              {formatVND(transactions.reduce((acc, t) => acc + t.amount, 0))}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="ting-card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block">
              Đã khớp
            </span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5 block">
              {transactions.length - unmatchedCount || 0}
            </span>
          </div>
          <TingBadge variant="dot" color="success" />
        </div>

        <div className="ting-card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium block">
              Chưa khớp
            </span>
            <span className="text-xl font-bold text-amber-700 dark:text-amber-400 tabular-nums mt-0.5 block">
              {unmatchedCount}
            </span>
          </div>
          {unmatchedCount > 0 ? (
            <TingBadge pulse variant="dot" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          )}
        </div>

        <div className="ting-card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Lỗi / Đảo chiều</span>
            <span className="text-xl font-bold text-slate-600 dark:text-slate-300 tabular-nums mt-0.5 block">
              0
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
      </div>

      {/* Tabs with MUI Badges and Buttons */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] dark:border-[#1E293B] pb-2">
        <Button
          size="small"
          onClick={() => setTab('ALL')}
          sx={{
            borderRadius: '0.75rem',
            px: 2,
            py: 0.75,
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: tab === 'ALL' ? '#2538D9' : 'transparent',
            color: tab === 'ALL' ? '#FFFFFF' : '#475467',
            '&:hover': {
              bgcolor: tab === 'ALL' ? '#1E2DB8' : 'rgba(0,0,0,0.04)',
            },
          }}
        >
          Tất cả giao dịch
        </Button>

        <TingBadge badgeContent={unmatchedCount} color="warning">
          <Button
            size="small"
            onClick={() => setTab('UNMATCHED')}
            sx={{
              borderRadius: '0.75rem',
              px: 2,
              py: 0.75,
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: tab === 'UNMATCHED' ? '#F59E0B' : 'transparent',
              color: tab === 'UNMATCHED' ? '#FFFFFF' : '#475467',
              '&:hover': {
                bgcolor: tab === 'UNMATCHED' ? '#D97706' : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            Giao dịch chưa khớp
          </Button>
        </TingBadge>
      </div>

      {/* Transactions Table with MUI Status Chips */}
      <div className="ting-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#475467] text-xs font-medium">
            <CircularProgress size={24} sx={{ color: '#2538D9' }} />
            <span>Đang tải lịch sử giao dịch ngân hàng...</span>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#111726] border-b border-[#E4E7EC] dark:border-[#1E293B] text-[#475467] dark:text-slate-400 uppercase font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Cổng</th>
                  <th className="py-3 px-4">Nội dung chuyển khoản</th>
                  <th className="py-3 px-4 text-right">Số tiền</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4">Khớp với hóa đơn</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#1E293B]">
                {transactions.map((tx) => {
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 tabular-nums text-[#475467] dark:text-slate-400 whitespace-nowrap">
                        {formatDateTimeVN(tx.transactionDate)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#101828] dark:text-[#F8FAFC]">
                        <div className="flex items-center gap-2">
                          <BankLogo
                            bankId={tx.provider.includes('MB') ? 'MB' : 'VCB'}
                            size="xs"
                          />
                          <span>{tx.provider}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#101828] dark:text-[#F8FAFC] max-w-xs truncate font-medium">
                        {tx.content}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                        +{formatVND(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {tx.processingStatus === 'PROCESSED' ||
                        tx.processingStatus === 'MATCHED' ? (
                          <TingStatusChip status="SUCCESS" label="Đã khớp" />
                        ) : tx.processingStatus === 'UNMATCHED' ? (
                          <TingStatusChip status="PENDING" label="Chưa gán" />
                        ) : (
                          <TingStatusChip status="VOID" label={tx.processingStatus} />
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {tx.matchedInvoice ? (
                          <div>
                            <span className="font-bold text-[#2538D9] font-mono">
                              [{tx.matchedInvoice.paymentCode}]
                            </span>
                            <span className="ml-1.5 text-[#101828] dark:text-[#F8FAFC] font-semibold">
                              {tx.matchedInvoice.member.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#475467] italic">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {tx.processingStatus === 'UNMATCHED' && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenAssignModal(tx)}
                            startIcon={<UserCheck className="w-3.5 h-3.5" />}
                            sx={{
                              bgcolor: '#2538D9',
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              textTransform: 'none',
                              borderRadius: '0.5rem',
                              boxShadow: 'none',
                              '&:hover': { bgcolor: '#1E2DB8' },
                            }}
                          >
                            Gán hóa đơn
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-[#475467] text-xs">
            Không có giao dịch nào được ghi nhận.
          </div>
        )}
      </div>

      {/* Manual Assignment Modal (Using MUI Dialog and Controls) */}
      <Dialog
        open={Boolean(selectedTx)}
        onClose={() => !isAssigning && setSelectedTx(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1rem',
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.5, borderBottom: '1px solid #E4E7EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-base font-extrabold text-[#101828] dark:text-[#F8FAFC] block">
                Gán giao dịch thủ công
              </span>
              <span className="text-[11px] text-[#475467] dark:text-slate-400 block font-normal">
                Khớp giao dịch ngân hàng vào hóa đơn học viên tương ứng
              </span>
            </div>
            <IconButton
              size="small"
              onClick={() => setSelectedTx(null)}
              disabled={isAssigning}
            >
              <X className="w-4 h-4" />
            </IconButton>
          </div>
        </DialogTitle>

        {selectedTx && (
          <form onSubmit={handleAssignSubmit}>
            <DialogContent sx={{ py: 2.5 }} className="space-y-4">
              <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-xl border border-[#E4E7EC] dark:border-[#1E293B] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#475467]">Số tiền nhận:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">
                    +{formatVND(selectedTx.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475467]">Nội dung CK:</span>
                  <span className="font-semibold text-[#101828] dark:text-[#F8FAFC] break-all">
                    {selectedTx.content}
                  </span>
                </div>
              </div>

              {/* AI Advisor Card */}
              {aiSuggestions.length > 0 && (
                <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      AI Đề Xuất Trùng Khớp ({aiSuggestions[0].confidence}% tin cậy)
                    </span>
                  </div>
                  {aiSuggestions.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => setAssignInvoiceId(s.invoiceId)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        assignInvoiceId === s.invoiceId
                          ? 'bg-white dark:bg-[#111726] border-emerald-600 shadow-sm text-[#101828] dark:text-[#F8FAFC]'
                          : 'bg-white/80 dark:bg-[#111726]/60 border-emerald-200 dark:border-emerald-800 text-[#475467] hover:bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span>
                          {s.memberName} ({s.groupName})
                        </span>
                        <span className="text-emerald-600 tabular-nums">
                          Còn nợ: {formatVND(s.remaining)}
                        </span>
                      </div>
                      <ul className="text-[11px] text-[#475467] dark:text-slate-400 mt-1 list-disc list-inside">
                        {s.reasons.map((r, rIdx) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <TingSelect
                  label="Chọn học viên / Phiếu thu để gạch nợ"
                  required
                  value={assignInvoiceId}
                  onChange={(e) => setAssignInvoiceId(e.target.value)}
                  sizeVariant="md"
                  containerClassName="w-full"
                  options={unpaidInvoices.map((inv) => ({
                    value: inv.id,
                    label: `${inv.member.name} — ${inv.title} (Còn nợ: ${formatVND(
                      inv.amountDue - inv.amountPaid
                    )})`,
                  }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                  Ghi chú đối soát (tùy chọn)
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="Ví dụ: Phụ huynh ghi sai tên, đã đối chiếu số điện thoại..."
                  slotProps={{
                    input: {
                      sx: { borderRadius: '0.5rem', fontSize: '0.75rem' },
                    },
                  }}
                />
              </div>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E4E7EC' }}>
              <Button
                onClick={() => setSelectedTx(null)}
                disabled={isAssigning}
                sx={{
                  color: '#475467',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isAssigning}
                startIcon={
                  isAssigning ? (
                    <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
                  ) : null
                }
                sx={{
                  bgcolor: '#2538D9',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  borderRadius: '0.5rem',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1E2DB8', boxShadow: 'none' },
                }}
              >
                {isAssigning ? 'Đang gán...' : 'Xác nhận gạch nợ'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </div>
  );
}
