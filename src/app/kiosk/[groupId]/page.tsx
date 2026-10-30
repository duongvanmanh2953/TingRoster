'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  CreditCard,
  Users2,
  Clock,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Lock,
  Volume2,
  VolumeX,
  Building2,
  Tv,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Camera
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { ActionType, ContextType } from '@/lib/qr/actionEngine';

interface GroupInfo {
  id: string;
  name: string;
  slug?: string;
  code?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  themeColor?: string | null;
  groupType?: string;
  enabledModules?: string | null;
  defaultFee: number;
  bankId: string;
  bankAccountNo: string;
  bankAccountName: string;
  supportContact?: string | null;
}

interface ActionCardConfig {
  id: ActionType;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgGradient: string;
}

interface ActiveActionQr {
  token: string;
  shortCode: string;
  actionType: ActionType;
  title: string;
  description?: string;
  qrImageUrl: string;
  qrDisplayUrl: string;
  expiresAt: string;
}

export default function KioskActionDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.groupId as string;

  // Space Data
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Kiosk Navigation State
  // 'HOME': Action Grid selection
  // 'ACTION_DISPLAY': Showing Large Crisp Action QR
  // 'FALLBACK_SCANNER': Physical camera scanner for legacy personal cards
  const [kioskView, setKioskView] = useState<'HOME' | 'ACTION_DISPLAY' | 'FALLBACK_SCANNER'>('HOME');
  const [selectedActionConfig, setSelectedActionConfig] = useState<ActionCardConfig | null>(null);
  const [activeQr, setActiveQr] = useState<ActiveActionQr | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [qrCountdown, setQrCountdown] = useState<number>(300); // 5 minutes
  const [idleCountdown, setIdleCountdown] = useState<number>(60); // 60s idle return to home

  // Staff PIN Security Modal (PIN: 1234)
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [exitPin, setExitPin] = useState('');
  const [exitPinError, setExitPinError] = useState(false);

  // Realtime Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDateStr(
        now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Group Info
  useEffect(() => {
    if (!groupId) return;
    setLoadingGroup(true);
    fetch(`/api/kiosk/${groupId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.group) {
          setGroup(data.data.group);
        }
      })
      .catch((err) => console.error('Fetch kiosk group error:', err))
      .finally(() => setLoadingGroup(false));
  }, [groupId]);

  // Generate / Load Action QR for selected action
  const loadActionQr = useCallback(
    async (actionConfig: ActionCardConfig) => {
      setSelectedActionConfig(actionConfig);
      setLoadingQr(true);
      setKioskView('ACTION_DISPLAY');
      setIdleCountdown(60);

      try {
        const res = await fetch('/api/qr/actions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionType: actionConfig.id,
            groupId,
            title: actionConfig.title,
            description: actionConfig.description,
            ttlSeconds: 300, // 5 minutes dynamic refresh
          }),
        });

        const data = await res.json();
        if (data.success && data.data) {
          setActiveQr(data.data);
          setQrCountdown(300);
        }
      } catch (err) {
        console.error('Create action QR error:', err);
      } finally {
        setLoadingQr(false);
      }
    },
    [groupId]
  );

  // Countdown timers for QR expiry & Idle auto-return
  useEffect(() => {
    if (kioskView !== 'ACTION_DISPLAY') return;

    const interval = setInterval(() => {
      // 1. QR Expiry countdown
      setQrCountdown((prev) => {
        if (prev <= 1) {
          // Auto-refresh QR when expired
          if (selectedActionConfig) {
            loadActionQr(selectedActionConfig);
          }
          return 300;
        }
        return prev - 1;
      });

      // 2. Idle auto-return countdown
      setIdleCountdown((prev) => {
        if (prev <= 1) {
          // Return to home menu
          setKioskView('HOME');
          setActiveQr(null);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [kioskView, selectedActionConfig, loadActionQr]);

  // Reset idle timer on any screen tap
  const handleUserActivity = () => {
    setIdleCountdown(60);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Staff PIN check
  const handleVerifyExitPin = () => {
    if (exitPin === '1234') {
      setExitModalOpen(false);
      router.push('/dashboard');
    } else {
      setExitPinError(true);
      setExitPin('');
    }
  };

  // Contextual Action Cards Configuration filtered strictly by workspace type & enabled modules
  const contextualActions: ActionCardConfig[] = useMemo(() => {
    const actions: ActionCardConfig[] = [];
    const groupType = group?.groupType || 'GENERAL';
    const modules = group?.enabledModules ? group.enabledModules.split(',').map((m) => m.trim()) : [];

    // 1. Education / Class context
    if (groupType === 'CLASS' || modules.includes('education')) {
      actions.push({
        id: 'ATTENDANCE',
        title: 'Điểm Danh Buổi Học / Lớp',
        subtitle: 'Quét để xác nhận chuyên cần',
        description: 'Học viên dùng điện thoại quét mã QR để ghi nhận tham gia buổi học và bảo lưu quyền học bù.',
        icon: CalendarCheck,
        accentColor: '#10B981',
        bgGradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400',
      });
      actions.push({
        id: 'JOIN_SPACE',
        title: 'Đăng Ký Tham Gia Lớp Học',
        subtitle: 'Gia nhập lớp & kết nối giáo viên',
        description: 'Học viên mới quét mã này để hoàn tất đăng ký thông tin lớp học và thời khóa biểu.',
        icon: Users2,
        accentColor: '#2538D9',
        bgGradient: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 hover:border-blue-400',
      });
      if (modules.includes('invoices') || modules.includes('billing')) {
        actions.push({
          id: 'PAYMENT',
          title: 'Thanh Toán Học Phí (VietQR)',
          subtitle: 'Gạch nợ học phí tự động 1 chạm',
          description: 'Quét để mở bảng kê học phí cá nhân và chuyển khoản VietQR tự động khớp tiền.',
          icon: CreditCard,
          accentColor: '#6366F1',
          bgGradient: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 hover:border-indigo-400',
        });
      }
      return actions;
    }

    // 2. Sports Club context
    if (groupType === 'SPORTS_CLUB' || modules.includes('sports')) {
      actions.push({
        id: 'BOOKING',
        title: 'Nhận Sân & Check-in / Check-out',
        subtitle: 'Xác nhận giờ chơi thực tế',
        description: 'Khách đặt sân quét mã để ghi nhận giờ bắt đầu và kết thúc ca chơi, tính phụ phí quá giờ tự động.',
        icon: CalendarCheck,
        accentColor: '#10B981',
        bgGradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400',
      });
      actions.push({
        id: 'PAYMENT',
        title: 'Thanh Toán Tiền Sân & Dịch Vụ',
        subtitle: 'Mở VietQR thanh toán tiền sân',
        description: 'Chuyển khoản VietQR tiền thuê sân, nước uống và thuê vợt thể thao.',
        icon: CreditCard,
        accentColor: '#6366F1',
        bgGradient: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 hover:border-indigo-400',
      });
      actions.push({
        id: 'JOIN_SPACE',
        title: 'Đăng Ký Hội Viên CLB',
        subtitle: 'Gia nhập câu lạc bộ thể thao',
        description: 'Đăng ký thông tin hội viên để hưởng bảng giá ưu đãi theo khung giờ vàng.',
        icon: Users2,
        accentColor: '#2538D9',
        bgGradient: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 hover:border-blue-400',
      });
      return actions;
    }

    // 3. Workforce / HR context
    if (groupType === 'WORKFORCE' || modules.includes('workforce') || modules.includes('hr')) {
      actions.push({
        id: 'SHIFT_CHECK_IN',
        title: 'Chấm Công Vào Ca Làm',
        subtitle: 'Ghi nhận giờ bắt đầu làm việc',
        description: 'Nhân viên quét mã để check-in ca làm việc thực tế và đối soát giờ công chính xác.',
        icon: Clock,
        accentColor: '#10B981',
        bgGradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400',
      });
      actions.push({
        id: 'SHIFT_CHECK_OUT',
        title: 'Chấm Công Kết Thúc Ca',
        subtitle: 'Xác nhận giờ tan ca & tăng ca',
        description: 'Xác nhận giờ ra ca và thời gian làm thêm ngoài giờ (OT) hợp lệ.',
        icon: Clock,
        accentColor: '#F59E0B',
        bgGradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 hover:border-amber-400',
      });
      actions.push({
        id: 'SHIFT_REGISTER',
        title: 'Đăng Ký Ca Làm Mới',
        subtitle: 'Xem bảng phân ca trực tuần',
        description: 'Đăng ký nhận ca trống và xem thời gian biểu phân ca của cơ sở.',
        icon: Users2,
        accentColor: '#2538D9',
        bgGradient: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 hover:border-blue-400',
      });
      return actions;
    }

    // 4. Rental context
    if (groupType === 'RENTAL' || modules.includes('rental')) {
      actions.push({
        id: 'PAYMENT',
        title: 'Thanh Toán Tiền Phòng & Điện Nước',
        subtitle: 'VietQR định danh phòng trọ',
        description: 'Người thuê quét để xem bảng kê điện, nước, internet và thanh toán tự động gạch nợ.',
        icon: CreditCard,
        accentColor: '#6366F1',
        bgGradient: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 hover:border-indigo-400',
      });
      actions.push({
        id: 'JOIN_SPACE',
        title: 'Khai Báo Thành Viên Phòng',
        subtitle: 'Đăng ký người thuê / tạm trú',
        description: 'Đăng ký thông tin cư dân, CCCD để chủ nhà hoàn tất thủ tục đăng ký tạm trú.',
        icon: Users2,
        accentColor: '#2538D9',
        bgGradient: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 hover:border-blue-400',
      });
      return actions;
    }

    // Default / General
    return [
      {
        id: 'ATTENDANCE',
        title: 'Điểm Danh Hoạt Động',
        subtitle: 'Quét để xác nhận có mặt',
        description: 'Quét mã để ghi nhận chuyên cần và điểm danh hoạt động.',
        icon: CalendarCheck,
        accentColor: '#10B981',
        bgGradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400',
      },
      {
        id: 'PAYMENT',
        title: 'Thanh Toán VietQR',
        subtitle: 'Mở trang thanh toán tự động',
        description: 'Quét để chuyển khoản VietQR tự động đối soát.',
        icon: CreditCard,
        accentColor: '#6366F1',
        bgGradient: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 hover:border-indigo-400',
      },
      {
        id: 'JOIN_SPACE',
        title: 'Tham Gia Không Gian',
        subtitle: 'Gửi yêu cầu tham gia',
        description: 'Quét để gửi yêu cầu tham gia không gian này.',
        icon: Users2,
        accentColor: '#2538D9',
        bgGradient: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 hover:border-blue-400',
      },
    ];
  }, [group]);

  return (
    <div
      onClick={handleUserActivity}
      className="min-h-screen bg-[#0B0F19] text-white flex flex-col font-sans select-none overflow-x-hidden selection:bg-[#2538D9] selection:text-white"
    >
      {/* Top Kiosk Bar */}
      <header className="h-20 px-6 sm:px-10 border-b border-slate-800/80 bg-[#0F1422]/90 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2538D9] to-[#6D5CE8] flex items-center justify-center text-white shadow-lg shadow-[#2538D9]/25 font-black text-xl">
            TR
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
              {group?.name || 'Kiosk TingRoster'}
            </h1>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Chế độ Kiosk Tự Phục Vụ • {group?.code || 'TR-SPACE'}</span>
            </p>
          </div>
        </div>

        {/* Realtime Clock & Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-xl font-mono font-extrabold text-white tracking-wider">
              {currentTime}
            </div>
            <div className="text-xs text-slate-400 capitalize">
              {currentDateStr}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              title="Toàn màn hình"
              className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setExitPin('');
                setExitPinError(false);
                setExitModalOpen(true);
              }}
              title="Thoát Kiosk (Dành cho Quản trị)"
              className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 flex items-center justify-center transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Kiosk Content Area */}
      <main className="flex-1 flex flex-col justify-center p-6 sm:p-12 max-w-6xl mx-auto w-full">
        {loadingGroup ? (
          <div className="text-center py-20 space-y-3">
            <CircularProgress size={36} sx={{ color: '#2538D9' }} />
            <p className="text-xs text-slate-400">Đang khởi tạo không gian Kiosk...</p>
          </div>
        ) : kioskView === 'HOME' ? (
          /* SCREEN 1: KIOSK ACTION SELECTION GRID */
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chọn hành động để hiển thị mã QR</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Chào mừng đến với {group?.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Chạm vào chức năng bạn muốn thực hiện để hiển thị mã QR. Sau đó dùng điện thoại quét mã để xác nhận.
              </p>
            </div>

            {/* Contextual Tactile Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 pt-2">
              {contextualActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => loadActionQr(action)}
                    className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-tr ${action.bgGradient} border-2 text-left transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex flex-col justify-between min-h-[160px] sm:min-h-[190px] cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md"
                        style={{ backgroundColor: action.accentColor }}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-white transition flex items-center gap-1">
                        <span>Chạm để mở</span>
                        <span>→</span>
                      </span>
                    </div>

                    <div className="space-y-1 mt-4">
                      <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-blue-300 transition">
                        {action.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* SCREEN 2: ACTIVE CRISP ACTION QR DISPLAY */
          <div className="space-y-6 animate-fade-in text-center max-w-2xl mx-auto w-full">
            {/* Action Header */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                <QrCode className="w-3.5 h-3.5" />
                <span>Mã QR Hành Động Có Hiệu Lực</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {selectedActionConfig?.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                {selectedActionConfig?.description}
              </p>
            </div>

            {/* Crisp High-Contrast Large QR Container */}
            <div className="bg-[#121828] border-2 border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative inline-block mx-auto">
              {loadingQr ? (
                <div className="w-64 h-64 sm:w-72 sm:h-72 flex flex-col items-center justify-center gap-3">
                  <CircularProgress size={36} sx={{ color: '#2538D9' }} />
                  <p className="text-xs text-slate-400">Đang tạo mã QR động...</p>
                </div>
              ) : activeQr ? (
                <div className="space-y-4">
                  {/* Ultra Sharp QR Code */}
                  <div className="p-4 rounded-3xl bg-white border-2 border-white shadow-inner mx-auto inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeQr.qrImageUrl}
                      alt={activeQr.title}
                      className="w-64 h-64 sm:w-72 sm:h-72 object-contain mx-auto"
                    />
                  </div>

                  {/* Clear User Instructions */}
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-blue-300">
                      👉 Mở TingRoster trên điện thoại ➡️ Chọn &quot;Quét QR&quot;
                    </p>
                    <p className="text-xs text-slate-400">
                      Hoặc dùng camera điện thoại quét trực tiếp mã bên trên.
                    </p>
                  </div>

                  {/* Manual Backup Code */}
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <span className="text-xs text-slate-400">Mã dự phòng:</span>
                    <span className="px-3 py-1 rounded-xl bg-slate-800 text-amber-400 font-mono text-sm font-black border border-slate-700">
                      {activeQr.shortCode}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Bottom Controls Bar: Expiry, Idle Timer, Refresh, Back */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-md mx-auto pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    Làm mới sau:{' '}
                    <strong className="text-white font-mono">
                      {Math.floor(qrCountdown / 60)}:
                      {(qrCountdown % 60).toString().padStart(2, '0')}
                    </strong>
                  </span>
                </span>
                <span>•</span>
                <span>
                  Tự về Menu:{' '}
                  <strong className="text-slate-300 font-mono">{idleCountdown}s</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectedActionConfig && loadActionQr(selectedActionConfig)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Làm mới</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setKioskView('HOME');
                    setActiveQr(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-[#2538D9]/30"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Kiosk Footer: Privacy assurance */}
      <footer className="h-14 px-6 border-t border-slate-800/60 bg-[#0A0D17] flex items-center justify-between text-[11px] text-slate-500 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Bảo mật quyền riêng tư: Kiosk không hiển thị thông tin cá nhân hoặc công nợ công khai.</span>
        </div>
        <div>
          <span>TingRoster Action Kiosk v2.0</span>
        </div>
      </footer>

      {/* Staff PIN Modal to Exit Kiosk */}
      {exitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#111726] border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-white space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">Xác Nhận Thoát Chế Độ Kiosk</h3>
              <p className="text-xs text-slate-400">
                Nhập mã PIN quản lý để thoát khỏi giao diện máy tính bảng:
              </p>
            </div>

            <input
              type="password"
              maxLength={4}
              value={exitPin}
              onChange={(e) => {
                setExitPin(e.target.value);
                setExitPinError(false);
              }}
              placeholder="PIN: 1234"
              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:border-[#2538D9]"
              autoFocus
            />

            {exitPinError && (
              <p className="text-xs text-rose-400 font-semibold text-center">
                Mã PIN không đúng. Vui lòng thử lại.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExitModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleVerifyExitPin}
                className="px-5 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold shadow-md transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
