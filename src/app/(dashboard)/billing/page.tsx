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
  Sparkles,
  CreditCard as CreditCardIcon,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Download
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
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
  const [balance, setBalance] = useState<number>(145000);
  const [planType, setPlanType] = useState<string>('TRIAL');
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(24);
  const [ledgers, setLedgers] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // VietQR Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutType, setCheckoutType] = useState<'TOPUP' | 'PLAN_PRO' | 'PLAN_ENTERPRISE'>('TOPUP');
  const [checkoutAmount, setCheckoutAmount] = useState<number>(100000);
  const [checkoutTitle, setCheckoutTitle] = useState<string>('Nạp số dư ví dịch vụ TingRoster');
  const [orderCode, setOrderCode] = useState<string>('TRTOP9981');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [countdown, setCountdown] = useState<number>(900); // 15 phút
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const bankAccount = {
    bankId: 'MB',
    bankName: 'MBBank — Ngân hàng Quân Đội',
    accountNo: '0987654321',
    accountName: 'TINGROSTER PLATFORM',
  };

  const loadWallet = () => {
    setLoading(true);
    fetch('/api/wallet')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBalance(data.data.balance || 145000);
          setPlanType(data.data.planType || 'TRIAL');
          setLedgers(data.data.ledgers || []);
        }
      })
      .catch((err) => console.error('Failed to load wallet:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWallet();
  }, []);

  // Countdown timer for VietQR session
  useEffect(() => {
    if (!checkoutModalOpen) return;
    setCountdown(900);
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [checkoutModalOpen]);

  const handleOpenTopup = (amount: number) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `TRTOP${amount / 1000}K${randomSuffix}`;
    setCheckoutType('TOPUP');
    setCheckoutAmount(amount);
    setCheckoutTitle(`Nạp +${formatVND(amount)} vào Ví Dịch vụ TingRoster`);
    setOrderCode(code);
    setCheckoutModalOpen(true);
  };

  const handleOpenBuyPlan = (plan: 'PRO' | 'ENTERPRISE', price: number) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = plan === 'PRO' ? `TRPRO1M${randomSuffix}` : `TRENT1M${randomSuffix}`;
    setCheckoutType(plan === 'PRO' ? 'PLAN_PRO' : 'PLAN_ENTERPRISE');
    setCheckoutAmount(price);
    setCheckoutTitle(`Thanh toán Gói ${plan} (1 Tháng)`);
    setOrderCode(code);
    setCheckoutModalOpen(true);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerifyPayment = async () => {
    setVerifyingPayment(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: checkoutAmount,
          method: 'VIETQR_NAPAS',
          reference: orderCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.data.newBalance);
        if (checkoutType === 'PLAN_PRO') setPlanType('PRO');
        setCheckoutModalOpen(false);
        setSuccessToast(`Xác nhận thanh toán thành công ${formatVND(checkoutAmount)} qua VietQR!`);
        setTimeout(() => setSuccessToast(null), 4500);
        loadWallet();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingPayment(false);
    }
  };

  // Dynamic VietQR Image URL
  const vietQrUrl = `https://api.vietqr.io/image/970422-${bankAccount.accountNo}-compact2.png?amount=${checkoutAmount}&addInfo=${encodeURIComponent(
    orderCode
  )}&accountName=${encodeURIComponent(bankAccount.accountName)}`;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Gói dịch vụ & Số dư Ví TingRoster
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3344D6] text-white uppercase tracking-wider">
              Fintech Billing
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Quản lý số dư lưu ký thanh toán phí đối soát VietQR (500đ/tx), tin nhắn Zalo ZNS và duy trì gói cước phần mềm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenTopup(100000)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3344D6] hover:bg-[#2538D9] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus size={16} />
            <span>Nạp tiền ví dịch vụ</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Policy Banner: Calm, Elegant */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-l-4 border-l-[#2538D9]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3344D6] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-neutral-900">
                Chính sách Dùng thử 30 ngày (Free Trial)
              </h4>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Còn {trialDaysLeft} ngày trải nghiệm
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-3xl">
              <strong>Chỉ có Người quản lý</strong> (Chủ nhà trọ, Thầy cô giáo, Chủ CLB) mới cần nạp tiền duy trì sau khi hết hạn dùng thử. <strong>Học viên, phụ huynh và khách thuê hoàn toàn miễn phí 100%</strong> khi quét VietQR.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenTopup(200000)}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-[#3344D6] hover:bg-neutral-50 shadow-xs transition-colors"
        >
          Nạp trước duy trì
        </button>
      </div>

      {/* 2. Visual Fintech Debit Card & Quick Top-up Packs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Premium Smart Debit Card Design (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="w-full h-full min-h-[240px] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E3A8A] border border-slate-700/60">
            
            {/* Top row: Chip & Logo */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                {/* Metallic Gold EMV Chip */}
                <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-inner border border-amber-300 flex flex-col justify-between">
                  <div className="h-full border-y border-amber-800/20 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-amber-700/30"></div>
                  </div>
                </div>
                {/* Contactless symbol */}
                <svg className="w-5 h-5 text-slate-300 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 9a4 4 0 0 1 0 6" />
                  <path d="M12 6a8 8 0 0 1 0 12" />
                  <path d="M16 3a12 12 0 0 1 0 18" />
                </svg>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-base tracking-wider block bg-gradient-to-r from-blue-200 to-indigo-100 bg-clip-text text-transparent">
                  TINGROSTER
                </span>
                <span className="text-[9px] font-bold tracking-widest text-slate-300 block uppercase">
                  Service Debit Card
                </span>
              </div>
            </div>

            {/* Middle: Embossed Balance */}
            <div className="my-3 relative z-10 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">
                Số dư dịch vụ khả dụng
              </span>
              <div className="text-3xl font-extrabold tabular-nums tracking-tight font-mono text-white drop-shadow-sm">
                {formatVND(balance)}
              </div>
              <p className="text-[11px] text-blue-200/90 font-mono">
                Thẻ số: •••• •••• •••• 9981
              </p>
            </div>

            {/* Bottom: Cardholder & Expiry */}
            <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between relative z-10 text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Chủ thẻ / Cơ sở</span>
                <span className="font-bold tracking-wider text-slate-100 uppercase">
                  CHỦ CƠ SỞ WORKSPACE
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block uppercase">Hạn dùng thử</span>
                <span className="font-bold text-amber-300">
                  24/11/2026
                </span>
              </div>
            </div>

            {/* Decorative background light refraction */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#3344D6]/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>

        {/* Right: Quick Recharge Packages (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Nạp Tiền Nhanh Qua Mã VietQR Napas 24/7</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Chọn gói nạp, ứng dụng hiển thị mã QR động có sẵn số tiền để quét chuyển khoản ngay lập tức.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Gạch nợ 5s
            </span>
          </div>

          {/* Quick package buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { amount: 50000, label: 'Gói Cơ bản', desc: '~100 tx đối soát' },
              { amount: 100000, label: 'Gói Phổ biến', desc: '~200 tx đối soát', popular: true },
              { amount: 200000, label: 'Gói Tiết kiệm', desc: '~400 tx đối soát' },
              { amount: 500000, label: 'Gói Doanh nghiệp', desc: '~1.000 tx đối soát' },
            ].map((pkg) => (
              <div
                key={pkg.amount}
                onClick={() => handleOpenTopup(pkg.amount)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between space-y-2 group ${
                  pkg.popular
                    ? 'border-[#3344D6] bg-blue-50/40 ring-1 ring-[#3344D6]/20'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50/50'
                }`}
              >
                <div>
                  <span className="text-[11px] font-semibold text-neutral-500 block">
                    {pkg.label}
                  </span>
                  <div className="text-base font-bold font-mono text-neutral-900 group-hover:text-[#3344D6] transition-colors">
                    {formatVND(pkg.amount)}
                  </div>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    {pkg.desc}
                  </span>
                </div>

                <button
                  type="button"
                  className="w-full py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-[#3344D6] group-hover:bg-[#3344D6] group-hover:text-white transition-all shadow-xs"
                >
                  Nạp ngay
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tiền nạp ghi nhận vào Sổ cái kép <strong>CreditLedgerEntry</strong>, bảo toàn vĩnh viễn không hết hạn.</span>
            </span>
          </div>
        </div>

      </div>

      {/* 3. Subscription Pricing Cards (PRO & ENTERPRISE) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Gói Cước Duy Trì Nền Tảng (Software Subscription)
            </h3>
            <p className="text-xs text-neutral-500">
              Nâng cấp gói để mở khóa toàn bộ tính năng màn hình Kiosk quét QR, không giới hạn lớp học và bot Zalo thương hiệu riêng.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* FREE PLAN */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-base text-neutral-900">Gói FREE</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600">
                  Mặc định
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-neutral-900">
                0 đ <span className="text-xs font-normal text-neutral-400">/ tháng</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Dành cho giáo viên mới bắt đầu, quy mô 1 lớp dưới 30 học viên.
              </p>
              <div className="space-y-2 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
                <div className="flex items-center gap-2 text-neutral-700">✓ Tối đa 1 lớp học</div>
                <div className="flex items-center gap-2 text-neutral-700">✓ 30 học viên</div>
                <div className="flex items-center gap-2 text-neutral-700">✓ VietQR tự động</div>
                <div className="flex items-center gap-2 text-neutral-400 line-through">✕ Kiosk quét QR thể thao</div>
                <div className="flex items-center gap-2 text-neutral-400 line-through">✕ Báo cáo đối soát chuyên sâu</div>
              </div>
            </div>

            <button
              disabled
              className="w-full py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-400 text-xs font-semibold cursor-not-allowed"
            >
              Gói hiện tại
            </button>
          </div>

          {/* PRO PLAN */}
          <div className="bg-white rounded-2xl border-2 border-[#3344D6] p-6 shadow-sm relative flex flex-col justify-between space-y-4">
            <span className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-[#3344D6] text-white text-[10px] font-bold uppercase tracking-wider">
              Khuyên dùng
            </span>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-base text-neutral-900">Gói PRO</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#3344D6]">
                  Chuyên nghiệp
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-[#3344D6]">
                299.000 đ <span className="text-xs font-normal text-neutral-400">/ tháng</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Dành cho trung tâm giáo dục, giáo viên dạy nhiều lớp và dãy trọ 10-30 phòng.
              </p>
              <div className="space-y-2 pt-3 border-t border-neutral-100 text-xs text-neutral-700">
                <div className="flex items-center gap-2 font-semibold">✓ Không giới hạn số lớp/phòng</div>
                <div className="flex items-center gap-2 font-semibold">✓ Tối đa 300 thành viên</div>
                <div className="flex items-center gap-2 font-semibold">✓ Màn hình Kiosk quét QR</div>
                <div className="flex items-center gap-2 font-semibold">✓ Báo cáo đối soát & aging công nợ</div>
                <div className="flex items-center gap-2 font-semibold">✓ Xuất file bàn giao kế toán</div>
              </div>
            </div>

            <button
              onClick={() => handleOpenBuyPlan('PRO', 299000)}
              className="w-full py-2.5 rounded-xl bg-[#3344D6] hover:bg-[#2538D9] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <QrCode size={16} />
              <span>Quét VietQR mua gói PRO</span>
            </button>
          </div>

          {/* ENTERPRISE PLAN */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-base text-neutral-900">Gói ENTERPRISE</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">
                  Đa cơ sở
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-neutral-900">
                799.000 đ <span className="text-xs font-normal text-neutral-400">/ tháng</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Dành cho CLB thể thao lớn, chuỗi chung cư mini và trung tâm nhiều chi nhánh.
              </p>
              <div className="space-y-2 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
                <div className="flex items-center gap-2 text-neutral-700">✓ Không giới hạn thành viên</div>
                <div className="flex items-center gap-2 text-neutral-700">✓ Tên miền phụ & thương hiệu riêng</div>
                <div className="flex items-center gap-2 text-neutral-700">✓ Tích hợp Zalo ZNS Official</div>
                <div className="flex items-center gap-2 text-neutral-700">✓ Hỗ trợ kỹ thuật 24/7 riêng biệt</div>
              </div>
            </div>

            <button
              onClick={() => handleOpenBuyPlan('ENTERPRISE', 799000)}
              className="w-full py-2.5 rounded-xl border border-neutral-300 hover:border-[#3344D6] hover:bg-neutral-50 text-neutral-900 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <QrCode size={16} />
              <span>Quét VietQR mua gói VIP</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Double-Entry Ledger History Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#3344D6]" />
              <span>Sổ cái Biến động Số dư Ví Dịch vụ (Credit Ledger)</span>
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Ghi nhận minh bạch mọi bút toán nạp tiền và khấu trừ cước đối soát theo thời gian thực
            </p>
          </div>

          <button
            onClick={loadWallet}
            className="p-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-600 transition-colors shadow-xs"
            title="Làm mới sổ cái"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#3344D6]' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-neutral-500 animate-pulse">
            Đang tải dữ liệu sổ cái biến động...
          </div>
        ) : ledgers.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            Chưa có biến động số dư nào phát sinh.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-neutral-200 text-neutral-600 font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mã bút toán</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Nghiệp vụ</th>
                  <th className="py-3 px-4">Nội dung diễn giải</th>
                  <th className="py-3 px-4 text-right">Biến động</th>
                  <th className="py-3 px-4 text-right">Số dư sau GD</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {ledgers.map((l) => (
                  <tr key={l.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#3344D6] text-[11px]">
                      {l.referenceId || l.id}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-neutral-500 text-[11px]">
                      {formatDateVN(l.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      {l.type === 'TOPUP' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Nạp tiền
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#3344D6] border border-blue-200">
                          Khấu trừ cước
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-700 font-medium max-w-sm truncate">
                      {l.description}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                      l.amount > 0 ? 'text-emerald-700' : 'text-neutral-700'
                    }`}>
                      {l.amount > 0 ? `+${formatVND(l.amount)}` : formatVND(l.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900">
                      {formatVND(l.balanceAfter)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        <Check size={12} /> Khớp 100%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. VIETQR CHECKOUT MODAL — HIỂN THỊ MÃ QR THANH TOÁN THỰC TẾ */}
      {/* ========================================================================= */}
      <Dialog
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1.25rem',
              padding: '16px',
            },
          },
        }}
      >
        <DialogTitle className="pb-3 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#3344D6] flex items-center justify-center font-bold">
                <QrCode size={18} />
              </div>
              <div>
                <span className="font-bold text-base text-neutral-900 block leading-tight">
                  {checkoutTitle}
                </span>
                <span className="text-xs text-neutral-500 font-normal">
                  Quét mã VietQR Napas 24/7 bằng bất kỳ ứng dụng ngân hàng nào
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block uppercase">Thời gian giữ mã</span>
              <span className="font-mono font-bold text-amber-600 text-xs">
                {formatTimer(countdown)}
              </span>
            </div>
          </div>
        </DialogTitle>

        <DialogContent className="pt-4 space-y-4 text-xs">
          
          {/* Main VietQR Display Container */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-neutral-200 flex flex-col sm:flex-row items-center gap-5">
            
            {/* Dynamic VietQR Image */}
            <div className="bg-white p-2.5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vietQrUrl}
                alt="VietQR Thanh toan TingRoster"
                className="w-44 h-44 object-contain rounded-lg"
              />
              <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-emerald-700">
                <ShieldCheck size={13} />
                <span>Napas 24/7 Tự Động Gạch Nợ</span>
              </div>
            </div>

            {/* Transfer details with 1-click copy */}
            <div className="flex-1 space-y-2.5 w-full">
              <div className="flex items-center gap-2 pb-1 border-b border-neutral-200">
                <BankLogo bankId="MB" size="xs" />
                <span className="font-bold text-xs text-neutral-900">{bankAccount.bankName}</span>
              </div>

              <div className="space-y-1.5 bg-white p-3 rounded-xl border border-neutral-200">
                
                {/* STK */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 text-[11px]">Số tài khoản:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-neutral-900 text-xs">
                      {bankAccount.accountNo}
                    </span>
                    <button
                      onClick={() => handleCopy(bankAccount.accountNo, 'acc')}
                      className="p-1 text-neutral-400 hover:text-[#3344D6]"
                      title="Sao chép số tài khoản"
                    >
                      {copiedField === 'acc' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Tên CTK */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 text-[11px]">Chủ tài khoản:</span>
                  <span className="font-bold text-neutral-900 text-xs">
                    {bankAccount.accountName}
                  </span>
                </div>

                {/* Số tiền */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                  <span className="text-neutral-500 text-[11px]">Số tiền thanh toán:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {formatVND(checkoutAmount)}
                  </span>
                </div>

                {/* Nội dung chuyển khoản */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                  <span className="text-neutral-500 text-[11px]">Nội dung chuyển:</span>
                  <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <span className="font-mono font-bold text-[#3344D6] text-xs">
                      {orderCode}
                    </span>
                    <button
                      onClick={() => handleCopy(orderCode, 'code')}
                      className="p-1 text-neutral-400 hover:text-[#3344D6]"
                      title="Sao chép nội dung"
                    >
                      {copiedField === 'code' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

              </div>

              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900 leading-snug">
                ⚠️ <strong>Quan trọng:</strong> Vui lòng giữ nguyên nội dung chuyển khoản <strong>{orderCode}</strong> để hệ thống tự động gạch nợ trong vòng 5 giây.
              </div>
            </div>

          </div>

        </DialogContent>

        <DialogActions className="p-4 pt-2 gap-2 border-t border-neutral-200">
          <Button
            variant="outlined"
            onClick={() => setCheckoutModalOpen(false)}
            sx={{
              color: '#475467',
              borderColor: '#E4E7EC',
              textTransform: 'none',
              borderRadius: '8px',
            }}
          >
            Đóng
          </Button>

          <Button
            variant="contained"
            onClick={handleVerifyPayment}
            disabled={verifyingPayment}
            startIcon={verifyingPayment ? <CircularProgress size={16} color="inherit" /> : <CheckCircle size={16} />}
            sx={{
              backgroundColor: '#3344D6',
              '&:hover': { backgroundColor: '#2538D9' },
              textTransform: 'none',
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            {verifyingPayment ? 'Đang kiểm tra giao dịch...' : 'Tôi đã chuyển khoản xong'}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
