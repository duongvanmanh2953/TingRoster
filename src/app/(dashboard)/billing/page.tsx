'use client';

import React, { useState, useEffect } from 'react';
import { formatVND, formatDateVN } from '@/lib/utils';
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Zap,
  Info,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Building2,
  Smartphone,
  Sparkles
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { BankLogo } from '@/components/common/BankLogo';

interface LedgerItem {
  id: string;
  amount: number;
  balanceAfter: number;
  type: 'TOPUP' | 'USAGE_WEBHOOK' | 'USAGE_NOTIFICATION' | 'USAGE_AI_OCR' | 'REFUND';
  description: string;
  referenceId?: string | null;
  createdAt: string;
}

export default function BillingWalletPage() {
  const [balance, setBalance] = useState<number>(93500);
  const [planType, setPlanType] = useState<string>('FREE');
  const [ledgers, setLedgers] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [selectedTopupAmount, setSelectedTopupAmount] = useState<number>(100000);
  const [isSubmittingTopup, setIsSubmittingTopup] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadWallet = () => {
    setLoading(true);
    fetch('/api/wallet')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBalance(data.data.balance);
          setPlanType(data.data.planType);
          setLedgers(data.data.ledgers);
        }
      })
      .catch((err) => console.error('Failed to load wallet:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleSimulateTopup = async () => {
    setIsSubmittingTopup(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedTopupAmount,
          method: 'VIETQR_NAPAS',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.data.newBalance);
        setTopupModalOpen(false);
        setSuccessToast(`Nạp thành công +${formatVND(selectedTopupAmount)} vào tài khoản TingRoster!`);
        setTimeout(() => setSuccessToast(null), 4000);
        loadWallet();
      }
    } catch (err) {
      console.error('Failed topup:', err);
    } finally {
      setIsSubmittingTopup(false);
    }
  };

  const getLedgerBadge = (type: LedgerItem['type']) => {
    switch (type) {
      case 'TOPUP':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Nạp tiền</span>;
      case 'USAGE_WEBHOOK':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#2538D9] border border-blue-200">Webhook VietQR</span>;
      case 'USAGE_NOTIFICATION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Zalo ZNS / SMS</span>;
      case 'USAGE_AI_OCR':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">AI OCR Import</span>;
      case 'REFUND':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">Hoàn tiền</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101828]">
              Số dư Dịch vụ & Sổ cái (Ledger)
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              Bút toán Kép
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#475467] mt-1">
            Quản lý số dư duy trì xử lý webhook VietQR, tin nhắn thông báo tự động và trích xuất AI OCR
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setTopupModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-semibold rounded-xl shadow-sm shadow-[#2538D9]/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nạp số dư dịch vụ</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 2. Wallet Balance & Rate Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Main Balance Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Số dư dịch vụ TingRoster
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2538D9] text-white border border-indigo-400">
                Gói {planType}
              </span>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-bold tabular-nums tracking-tight block">
                {formatVND(balance)}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Ước tính đủ duy trì cho <strong>~{Math.floor(balance / 50)}</strong> giao dịch VietQR tự động.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700/60 flex items-center justify-between relative z-10">
            <div className="text-[11px] text-slate-400">
              <span>Mã ví: </span>
              <strong className="text-slate-200 font-semibold">WALLET-TR-9981</strong>
            </div>
            <button
              onClick={() => setTopupModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nạp ngay</span>
            </button>
          </div>

          {/* Decorative backdrop glow */}
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-[#2538D9]/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Right: Transparent Rate Card (7 cols) */}
        <div className="lg:col-span-7 ting-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
            <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Bảng Biểu phí Dịch vụ Minh bạch (Rate Card)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Trừ trực tiếp trên số dư ví</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            <div className="p-3 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#101828]">Đối soát VietQR Webhook</span>
                <span className="font-bold text-emerald-700 tabular-nums">50 đ / tx</span>
              </div>
              <p className="text-[11px] text-[#475467]">
                Tự động nhận diện webhook SePay/Casso và gạch nợ trong 0.2 giây.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#101828]">Tin nhắn Zalo ZNS</span>
                <span className="font-bold text-purple-700 tabular-nums">200 đ / tin</span>
              </div>
              <p className="text-[11px] text-[#475467]">
                Gửi biên lai thu học phí có gắn tick vàng chính thức đến Zalo phụ huynh.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#101828]">Thông báo Telegram & Web</span>
                <span className="font-bold text-[#2538D9] tabular-nums">Miễn phí 100%</span>
              </div>
              <p className="text-[11px] text-[#475467]">
                Cảnh báo biến động tài khoản và báo cáo điểm danh qua bot riêng.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#101828]">AI OCR Import Danh sách</span>
                <span className="font-bold text-amber-700 tabular-nums">500 đ / file</span>
              </div>
              <p className="text-[11px] text-[#475467]">
                Nhận diện ảnh chụp danh sách viết tay hoặc Excel và tự điền học viên.
              </p>
            </div>

          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-950 flex items-center justify-between">
            <span>Số dư được bảo toàn vĩnh viễn, không có hạn sử dụng. Hỗ trợ hoàn tiền nếu không dùng hết.</span>
            <span className="font-bold text-[#2538D9] underline cursor-pointer">Chính sách ví</span>
          </div>
        </div>

      </div>

      {/* 3. Double-Entry Ledger History Table */}
      <div className="ting-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#101828] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2538D9]" />
              <span>Sổ cái Biến động Số dư (Double-Entry Ledger)</span>
            </h2>
            <p className="text-[11px] text-[#475467] mt-0.5">
              Ghi nhận minh bạch mọi bút toán cộng nạp và trừ cước dịch vụ theo thời gian thực
            </p>
          </div>

          <button
            onClick={loadWallet}
            className="p-2 border border-[#E4E7EC] rounded-xl hover:bg-slate-50 text-[#475467] transition-colors shadow-xs"
            title="Làm mới sổ cái"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2538D9]' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-[#475467] animate-pulse">
            Đang tải dữ liệu sổ cái biến động...
          </div>
        ) : ledgers.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#475467]">
            Chưa có biến động số dư nào phát sinh.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#475467] uppercase font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mã bút toán</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Loại nghiệp vụ</th>
                  <th className="py-3 px-4">Nội dung diễn giải</th>
                  <th className="py-3 px-4 text-right">Biến động</th>
                  <th className="py-3 px-4 text-right">Số dư sau GD</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {ledgers.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#2538D9] tabular-nums text-[11px]">
                      {l.referenceId || l.id}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-[#475467] text-[11px]">
                      {formatDateVN(l.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getLedgerBadge(l.type)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#101828] max-w-sm truncate">
                      {l.description}
                    </td>
                    <td className={`py-3.5 px-4 text-right tabular-nums font-bold ${
                      l.amount > 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {l.amount > 0 ? `+${formatVND(l.amount)}` : formatVND(l.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-bold text-[#101828]">
                      {formatVND(l.balanceAfter)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Đã ghi sổ
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Instant VietQR Top-up Modal */}
      <Dialog
        open={topupModalOpen}
        onClose={() => !isSubmittingTopup && setTopupModalOpen(false)}
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
        <DialogTitle className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-[#101828] block">Nạp số dư dịch vụ TingRoster</span>
              <span className="text-[11px] text-[#475467] font-normal">Quét mã VietQR Napas 24/7 tự động cộng tiền</span>
            </div>
          </div>
        </DialogTitle>

        <DialogContent className="space-y-4 pt-4 text-xs">
          
          {/* Quick Amount Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#101828] mb-2">
              Chọn mức tiền nạp:
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {[50000, 100000, 200000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSelectedTopupAmount(amt)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold tabular-nums border transition-all ${
                    selectedTopupAmount === amt
                      ? 'bg-[#2538D9] text-white border-[#2538D9] shadow-sm shadow-[#2538D9]/25'
                      : 'bg-white border-[#E4E7EC] text-[#101828] hover:bg-slate-50'
                  }`}
                >
                  {formatVND(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Simulated VietQR Card */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E7EC] flex flex-col sm:flex-row items-center gap-4">
            
            {/* QR Mockup */}
            <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center justify-center flex-shrink-0 shadow-xs relative">
              <QrCode className="w-28 h-28 text-slate-800" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-white shadow-xs flex items-center justify-center text-[8px] font-bold text-[#2538D9]">
                  Ting
                </span>
              </div>
              <span className="text-[9px] font-bold text-emerald-700 mt-1">Napas 24/7</span>
            </div>

            {/* Transfer details */}
            <div className="flex-1 space-y-2 text-xs w-full">
              <div className="flex items-center gap-2">
                <BankLogo bankId="MB" size="xs" />
                <span className="font-bold text-[#101828]">MBBank — Ngân hàng Quân Đội</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#475467]">Số tài khoản:</span>
                  <span className="font-bold text-[#101828] tabular-nums">0987654321</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475467]">Chủ tài khoản:</span>
                  <span className="font-bold text-[#101828]">TINGROSTER PLATFORM</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-[#475467]">Nội dung CK:</span>
                  <div className="flex items-center gap-1 font-bold text-[#2538D9]">
                    <span>TINGTOPUP 9981</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('TINGTOPUP 9981');
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="p-1 text-slate-400 hover:text-[#2538D9]"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500">
                * Quét mã bằng bất kỳ App ngân hàng nào, hệ thống tự động cộng số dư trong 5 giây.
              </p>
            </div>

          </div>

        </DialogContent>

        <DialogActions className="p-4 pt-2 gap-2">
          <Button
            variant="outlined"
            onClick={() => setTopupModalOpen(false)}
            disabled={isSubmittingTopup}
            sx={{ color: '#475467', borderColor: '#E4E7EC' }}
          >
            Đóng
          </Button>

          <Button
            variant="contained"
            onClick={handleSimulateTopup}
            disabled={isSubmittingTopup}
            sx={{ backgroundColor: '#2538D9', '&:hover': { backgroundColor: '#1E2DB8' } }}
          >
            {isSubmittingTopup ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              `Xác nhận nạp ${formatVND(selectedTopupAmount)}`
            )}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
