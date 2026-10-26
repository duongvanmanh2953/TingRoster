'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatVND, formatDateTimeVN } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CalendarCheck,
  QrCode,
  ArrowRight,
  Plus,
  RefreshCw,
  CheckCircle2,
  Users2,
  Tv,
  ExternalLink,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { BankLogo } from '@/components/common/BankLogo';

interface DashboardStats {
  totalDue: number;
  totalPaid: number;
  remaining: number;
  collectionRate: number;
  unpaidCount: number;
  partialCount: number;
  paidCount: number;
  todayAttendeesCount: number;
  unmatchedCount: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    content: string;
    createdAt: string;
    processingStatus: string;
    matchedInvoice?: {
      paymentCode: string;
      member: { name: string };
    } | null;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // VietQR Simulation State
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simAmount, setSimAmount] = useState('600000');
  const [simCode, setSimCode] = useState('TR84920');
  const [simSender, setSimSender] = useState('Nguyen Hoang Nam');
  const [simLoading, setSimLoading] = useState(false);
  const [simSuccess, setSimSuccess] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/dashboard/summary');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Không thể tải dữ liệu tổng quan');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    setSimSuccess(null);
    try {
      const res = await fetch('/api/webhooks/sepay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Apikey sepay_test_api_key_123',
        },
        body: JSON.stringify({
          id: Math.floor(Date.now() / 1000),
          gateway: 'MBBank',
          transactionDate: new Date().toISOString(),
          accountNumber: '0987654321',
          code: null,
          content: `${simSender.toUpperCase()} CK HOC PHI ${simCode}`,
          transferType: 'in',
          transferAmount: parseInt(simAmount, 10),
          accumulated: 10000000,
          subAccount: null,
          referenceCode: `MB${Math.floor(Math.random() * 900000 + 100000)}`,
          description: 'Simulated payment',
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        // Trigger simulated audio chime
        if (typeof window !== 'undefined' && 'AudioContext' in window) {
          try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
          } catch {
            // Audio context failed, ignore
          }
        }

        setSimModalOpen(false);
        setSimSuccess(`⚡ TING! Đã nhận ${formatVND(parseInt(simAmount, 10))} từ ${simSender}. Hệ thống đã tự động khớp mã ${simCode}!`);
        await fetchStats();
      } else {
        alert(resData.error || 'Lỗi khi kích hoạt giả lập');
      }
    } catch {
      alert('Không thể gửi yêu cầu webhook');
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-12 text-center">
        <CircularProgress color="success" size={36} />
        <p className="text-xs text-slate-400">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Tổng quan điều hành
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 ting-badge-pulse" />
              VietQR Tự động
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi tiến độ thu học phí, điểm danh và dòng tiền chuyển khoản trực tiếp
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-[#111726] border border-[#1E283D] text-slate-300 hover:text-white hover:bg-[#182136] transition-colors"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => {
              setSimSuccess(null);
              setSimModalOpen(true);
            }}
            startIcon={<Zap className="w-4 h-4 text-emerald-400" />}
            className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
          >
            Thử giao dịch &quot;Ting!&quot;
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => router.push('/invoices')}
            startIcon={<Plus className="w-4 h-4" />}
          >
            Tạo hóa đơn mới
          </Button>
        </div>
      </div>

      {/* Simulated Transaction Flash Alert */}
      {simSuccess && (
        <Alert
          severity="success"
          onClose={() => setSimSuccess(null)}
          className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
        >
          {simSuccess}
        </Alert>
      )}

      {error && (
        <Alert severity="error" className="bg-rose-500/10 border border-rose-500/30 text-rose-300">
          {error}
        </Alert>
      )}

      {/* 4 Core Financial & Attendance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Doanh thu đã thu */}
        <div className="ting-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Đã thu tháng này</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              {formatVND(stats?.totalPaid || 0)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                Tỷ lệ hoàn thành: <strong className="text-emerald-400 font-mono">{stats?.collectionRate || 0}%</strong>
              </span>
              <span className="text-[11px] text-slate-400">{stats?.paidCount || 0} hóa đơn xong</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-[#1A2338] rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, stats?.collectionRate || 0)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Công nợ còn lại */}
        <div className="ting-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Công nợ chưa thu</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight font-mono">
              {formatVND(stats?.remaining || 0)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {stats?.unpaidCount || 0} chưa nộp • {stats?.partialCount || 0} nộp thiếu
              </span>
              <Link href="/invoices?status=UNPAID" className="text-emerald-400 hover:text-emerald-300 font-medium text-[11px] flex items-center">
                <span>Thu phí</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Điểm danh hôm nay */}
        <div className="ting-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Điểm danh hôm nay</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stats?.todayAttendeesCount || 0} <span className="text-sm font-normal text-slate-400">học viên</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">Đã check-in hệ thống</span>
              <Link href="/attendance" className="text-emerald-400 hover:text-emerald-300 font-medium text-[11px] flex items-center">
                <span>Điểm danh ngay</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 4: Giao dịch VietQR */}
        <div className="ting-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Đối soát VietQR</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                (stats?.unmatchedCount || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {stats?.unmatchedCount || 0}
              </span>
              <span className="text-xs text-slate-400">chờ đối soát</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <BankLogo bankId="MB" size="xs" />
                MB Bank Live
              </span>
              <Link href="/transactions" className="text-emerald-400 hover:text-emerald-300 font-medium text-[11px] flex items-center">
                <span>Chi tiết</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Access Action Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Link
          href="/attendance"
          className="ting-card-interactive p-4 flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Điểm danh 1 chạm</h3>
            <p className="text-[11px] text-slate-400">Chọn lớp & ghi nhận chuyên cần</p>
          </div>
        </Link>

        <Link
          href="/invoices"
          className="ting-card-interactive p-4 flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Xuất hóa đơn tháng</h3>
            <p className="text-[11px] text-slate-400">Tạo mã VietQR động theo học viên</p>
          </div>
        </Link>

        <Link
          href="/transactions"
          className="ting-card-interactive p-4 flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Đối soát ngân hàng</h3>
            <p className="text-[11px] text-slate-400">Khớp lệnh tự động & thủ công</p>
          </div>
        </Link>

        <Link
          href="/kiosk"
          className="ting-card-interactive p-4 flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center flex-shrink-0">
            <Tv className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white">Mở Kiosk Check-in</h3>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-400">Màn hình tự điểm danh tại cửa</p>
          </div>
        </Link>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Biến động số dư VietQR Live (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="ting-card p-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E283D]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ting-badge-pulse" />
                <h2 className="text-sm font-bold text-white">Giao dịch ngân hàng VietQR gần nhất</h2>
              </div>
              <Link 
                href="/transactions" 
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Transaction List */}
            <div className="mt-4 divide-y divide-[#1A2338]">
              {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx) => {
                  const isMatched = tx.processingStatus === 'MATCHED' || tx.processingStatus === 'PROCESSED';
                  return (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <BankLogo bankId="MB" size="sm" className="mt-0.5" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-white font-mono">
                              +{formatVND(tx.amount)}
                            </span>
                            {tx.matchedInvoice ? (
                              <Chip
                                label={`${tx.matchedInvoice.paymentCode} • ${tx.matchedInvoice.member.name}`}
                                size="small"
                                color="success"
                                className="h-5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                              />
                            ) : (
                              <Chip
                                label="Chưa khớp"
                                size="small"
                                color="warning"
                                className="h-5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25"
                              />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                            {tx.content}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatDateTimeVN(tx.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        {isMatched ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã đối soát
                          </span>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => router.push(`/transactions?tab=UNMATCHED&txId=${tx.id}`)}
                            className="text-[11px] py-0.5 px-2"
                          >
                            Gán hóa đơn
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#111726] border border-[#1E283D] text-slate-400 flex items-center justify-center mx-auto">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-300">Chưa có giao dịch biến động gần đây</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      Khi phụ huynh hoặc học viên quét mã VietQR chuyển khoản vào tài khoản MB Bank, hệ thống sẽ tự động &quot;Ting!&quot; và đối soát tại đây.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Tip */}
            <div className="mt-4 pt-3 border-t border-[#1E283D] flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Ngăn chặn trùng lặp giao dịch (Idempotency bảo vệ 100%)
              </span>
              <Link href="/settings" className="text-slate-400 hover:text-slate-200 text-[11px]">
                Cấu hình API SePay →
              </Link>
            </div>

          </div>
        </div>

        {/* Right Column: Hướng dẫn nhanh & Logo Ngân Hàng (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Quick Guide Card */}
          <div className="ting-card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1E283D]">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Quy trình tự động hóa 3 bước</h2>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Điểm danh học viên</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    1 chạm vào nút Có mặt, Vắng có phép hoặc Học bù. Tự động tính số buổi học trong tháng.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Gửi mã VietQR có cú pháp</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hóa đơn sinh ra mã thanh toán duy nhất (VD: <span className="font-mono text-emerald-400">TR84920</span>). Phụ huynh chỉ cần quét mã QR qua ngân hàng bất kỳ.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Khớp lệnh & Ting! tức thời</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Webhook ngân hàng đẩy về trong 1 giây. Hóa đơn tự động chuyển sang Đã đóng đủ, không cần dò sao kê thủ công.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => router.push('/groups')}
                startIcon={<Users2 className="w-4 h-4" />}
                size="small"
              >
                Quản lý danh sách lớp học
              </Button>
            </div>
          </div>

          {/* Connected Gateway Card with Official Bank Logo */}
          <div className="ting-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BankLogo bankId="MB" size="md" />
                <div>
                  <p className="text-xs font-bold text-white">MB Bank • Cổng SePay</p>
                  <p className="text-[11px] text-slate-400 font-mono">STK: 0987654321</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                Hoạt động
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Material UI Simulated Payment Modal */}
      <Dialog
        open={simModalOpen}
        onClose={() => setSimModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <BankLogo bankId="MB" size="sm" />
            <div>
              <span className="text-sm font-bold text-white block">Giả lập Giao dịch VietQR</span>
              <span className="text-[11px] text-slate-400 font-normal">Kiểm thử cơ chế đối soát tức thì</span>
            </div>
          </div>
          <button
            onClick={() => setSimModalOpen(false)}
            className="text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </DialogTitle>

        <form onSubmit={handleSimulatePayment}>
          <DialogContent className="space-y-4 pt-3">
            <TextField
              fullWidth
              size="small"
              label="Tên người chuyển khoản *"
              required
              value={simSender}
              onChange={(e) => setSimSender(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <TextField
                fullWidth
                size="small"
                label="Số tiền (VND) *"
                type="number"
                required
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
                slotProps={{
                  input: {
                    className: 'font-mono',
                  },
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Mã hóa đơn *"
                required
                value={simCode}
                onChange={(e) => setSimCode(e.target.value.toUpperCase())}
                placeholder="VD: TR84920"
                slotProps={{
                  input: {
                    className: 'font-mono font-bold text-emerald-400',
                  },
                }}
              />
            </div>

            <div className="p-3 rounded-xl bg-[#111726] border border-[#1E283D] text-[11px] space-y-1">
              <p className="font-semibold text-slate-300">Cú pháp chuyển khoản sẽ gửi:</p>
              <p className="font-mono text-emerald-400 break-all">
                {simSender.toUpperCase()} CK HOC PHI {simCode}
              </p>
            </div>
          </DialogContent>

          <DialogActions className="p-4 pt-0">
            <Button
              onClick={() => setSimModalOpen(false)}
              color="inherit"
              size="small"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={simLoading}
              size="small"
              startIcon={simLoading ? <CircularProgress size={16} color="inherit" /> : <Zap className="w-4 h-4" />}
            >
              {simLoading ? 'Đang gửi...' : 'Kích hoạt Ting!'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </div>
  );
}
