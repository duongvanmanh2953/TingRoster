'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  Check,
  Clock,
  Camera,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  Lock,
  ChevronRight,
  PhoneCall,
  CreditCard,
  Building2,
  Layers,
  ArrowRight,
  Copy,
  RotateCw
} from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { SpaceAvatar } from '@/components/common/SpaceAvatar';
import { formatVND } from '@/lib/utils';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

interface GroupInfo {
  id: string;
  name: string;
  slug?: string;
  code?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  themeColor?: string | null;
  groupType?: string;
  defaultFee: number;
  bankId: string;
  bankAccountNo: string;
  bankAccountName: string;
  supportContact?: string | null;
}

interface Member {
  id: string;
  name: string;
  phone?: string | null;
}

interface FeeStatusData {
  hasDue: boolean;
  invoiceId?: string;
  invoiceTitle?: string;
  amountDue?: number;
  amountPaid?: number;
  remainingDue?: number;
  paymentCode?: string;
  vietQrUrl?: string | null;
  bankId?: string;
  bankAccountNo?: string;
  bankAccountName?: string;
  policy?: 'ALLOW_ALL_NOTIFY_DUE' | 'REQUIRE_PAYMENT_BLOCK' | 'CHECKIN_ONLY_NO_PAY';
  isBlocked?: boolean;
}

interface VerificationResult {
  member?: {
    id: string;
    name: string;
    phone?: string | null;
    status: string;
  };
  session?: {
    title: string;
    timeWindow: string;
    spaceName: string;
    spaceCode?: string | null;
  };
  attendance?: {
    id: string;
    time: string;
    date: string;
    status: string;
    isPresent: boolean;
  } | null;
  alreadyCheckedIn?: boolean;
  isBlocked?: boolean;
  feeStatus?: FeeStatusData;
  errorMessage?: string;
}

type KioskInputMode = 'QR' | 'MANUAL';
type KioskOperationalState =
  | 'READY'
  | 'VERIFYING'
  | 'SUCCESS'
  | 'SHOW_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'ERROR';

export default function KioskModePage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.groupId as string;

  // Space & Member Data
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Kiosk Operational State Machine
  const [inputMode, setInputMode] = useState<KioskInputMode>('QR');
  const [state, setState] = useState<KioskOperationalState>('READY');
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');

  // Manual code input
  const [manualCode, setManualCode] = useState('');
  const [manualSearchQuery, setManualSearchQuery] = useState('');

  // Results & Payment State
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isPollingPayment, setIsPollingPayment] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Time & Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [autoResetCountdown, setAutoResetCountdown] = useState<number>(4);

  // Staff PIN Security Modal (PIN: 1234)
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [exitPin, setExitPin] = useState('');
  const [exitPinError, setExitPinError] = useState(false);

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Timers & Audio
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const paymentPollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // USB/Bluetooth Barcode Scanner Keyboard Wedge Buffer
  const scannerBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // 1. Online / Offline Monitoring
  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Realtime Accurate Digital Clock
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

  // 3. Audio Chime (Native Web Audio API, Zero dependencies)
  const playSound = useCallback((type: 'success' | 'payment' | 'already' | 'error') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'payment' || type === 'success') {
        // Crisp "Ting!" high double-tone (C6 -> G6)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1567.98, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      } else if (type === 'already') {
        // Soft neutral double tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      } else {
        // Low error buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (type === 'payment' ? 0.7 : 0.45));
    } catch {
      // Audio not supported in environment
    }
  }, [soundEnabled]);

  // 4. Load Venue / Group Information
  const loadGroupData = useCallback(async () => {
    try {
      const res = await fetch(`/api/kiosk/${groupId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setGroup(data.data.group);
        setMembers(data.data.members || []);
      }
    } catch (err) {
      console.error('Kiosk group data load error:', err);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      loadGroupData();
    }
  }, [groupId, loadGroupData]);

  // 5. Camera Management
  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Thiết bị không hỗ trợ camera hoặc đang chạy trên kết nối không bảo mật (yêu cầu HTTPS).');
      }

      // Stop existing stream if running
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } },
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối camera';
      setCameraError(msg);
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (inputMode === 'QR') {
      startCamera(cameraFacing);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [inputMode, cameraFacing, startCamera, stopCamera]);

  // 6. Reset Timers & Clear Privacy
  const clearTimers = useCallback(() => {
    if (resetTimerRef.current) {
      clearInterval(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    if (paymentPollTimerRef.current) {
      clearInterval(paymentPollTimerRef.current);
      paymentPollTimerRef.current = null;
    }
    setIsPollingPayment(false);
  }, []);

  // Return to READY state and wipe all private data
  const resetToReady = useCallback(() => {
    clearTimers();
    setState('READY');
    setResult(null);
    setManualCode('');
    setAutoResetCountdown(4);
    setCopiedCode(false);
  }, [clearTimers]);

  // Auto Reset Countdown (Only for SUCCESS or ERROR, paused when user is inspecting payment)
  const startAutoReset = useCallback((seconds: number = 4) => {
    clearTimers();
    let timeLeft = seconds;
    setAutoResetCountdown(timeLeft);

    resetTimerRef.current = setInterval(() => {
      timeLeft -= 1;
      setAutoResetCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearTimers();
        resetToReady();
      }
    }, 1000);
  }, [clearTimers, resetToReady]);

  // 7. Core Backend Verification Flow
  const processCheckIn = useCallback(async (scannedCode: string) => {
    const trimmed = scannedCode.trim();
    if (!trimmed) return;

    if (!isOnline) {
      setState('ERROR');
      setResult({
        errorMessage: 'Mất kết nối Internet tại kiosk. Không thể xác nhận điểm danh.',
      });
      playSound('error');
      startAutoReset(6);
      return;
    }

    clearTimers();
    setState('VERIFYING');

    try {
      const res = await fetch(`/api/kiosk/${groupId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setState('ERROR');
        setResult({
          errorMessage: data.error || 'Mã không hợp lệ hoặc không thuộc địa điểm này.',
        });
        playSound('error');
        startAutoReset(6);
        return;
      }

      const verificationData: VerificationResult = {
        member: data.data.member,
        session: data.data.session,
        attendance: data.data.attendance,
        alreadyCheckedIn: Boolean(data.alreadyCheckedIn),
        isBlocked: Boolean(data.isBlocked),
        feeStatus: data.data.feeStatus,
      };

      setResult(verificationData);

      // Check debt policy
      if (data.isBlocked) {
        // Blocked: Must pay before check-in is complete
        setState('SHOW_PAYMENT');
        playSound('already');
        // Do not auto-reset while attendee needs to pay
      } else if (data.data.feeStatus?.hasDue && data.data.feeStatus.policy !== 'CHECKIN_ONLY_NO_PAY') {
        // Has due: Show attendance success with option to pay VietQR
        setState('SUCCESS');
        playSound(data.alreadyCheckedIn ? 'already' : 'success');
        // Start auto reset (8 seconds so they have time to see the due)
        startAutoReset(8);
      } else {
        // Clean: No dues!
        setState('SUCCESS');
        playSound(data.alreadyCheckedIn ? 'already' : 'success');
        startAutoReset(4);
      }
    } catch {
      setState('ERROR');
      setResult({
        errorMessage: 'Máy chủ phản hồi chậm hoặc lỗi mạng. Vui lòng thử lại.',
      });
      playSound('error');
      startAutoReset(6);
    }
  }, [groupId, isOnline, playSound, startAutoReset, clearTimers]);

  // 8. Hardware USB / Bluetooth Barcode & QR Scanner Keyboard Wedge Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is interacting with staff PIN modal
      if (exitModalOpen) return;

      const now = Date.now();
      const interval = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        const scanned = scannerBufferRef.current.trim();
        scannerBufferRef.current = '';
        if (scanned.length >= 3 && state === 'READY') {
          e.preventDefault();
          processCheckIn(scanned);
        }
      } else if (e.key.length === 1) {
        // Hardware scanners output characters with very short delay (< 50ms)
        if (interval > 80) {
          scannerBufferRef.current = '';
        }
        scannerBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [exitModalOpen, state, processCheckIn]);

  // 9. VietQR Payment Polling Verification
  const startPaymentPolling = useCallback((invoiceId: string) => {
    clearTimers();
    setIsPollingPayment(true);

    const poll = async () => {
      try {
        const res = await fetch(`/api/kiosk/${groupId}/check-payment-status?invoiceId=${invoiceId}`);
        const data = await res.json();
        if (data.success && data.data?.isPaid) {
          clearTimers();
          setState('PAYMENT_CONFIRMED');
          playSound('payment');
          startAutoReset(4);
        }
      } catch {
        // Silent retry
      }
    };

    // Immediate first check
    poll();
    paymentPollTimerRef.current = setInterval(poll, 2500);
  }, [clearTimers, groupId, playSound, startAutoReset]);

  // Open VietQR payment modal/screen
  const handleOpenPaymentScreen = () => {
    clearTimers();
    setState('SHOW_PAYMENT');
    if (result?.feeStatus?.invoiceId) {
      startPaymentPolling(result.feeStatus.invoiceId);
    }
  };

  // Staff PIN verification to exit kiosk mode
  const handleExitKiosk = () => {
    if (exitPin === '1234') {
      setExitModalOpen(false);
      router.push('/dashboard');
    } else {
      setExitPinError(true);
    }
  };

  // Filter members in manual mode
  const filteredMembers = members.filter((m) => {
    if (!manualSearchQuery.trim()) return true;
    const q = manualSearchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || (m.phone && m.phone.includes(q));
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0D14] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header Bar */}
      <header className="h-16 flex-shrink-0 bg-[#0F1420] border-b border-white/10 px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Left: Space Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <SpaceAvatar
            name={group?.name || 'Kiosk'}
            logoUrl={group?.logoUrl}
            themeColor={group?.themeColor || '#2538D9'}
            size="md"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white truncate leading-tight">
                {group?.name || 'Đang tải địa điểm...'}
              </h1>
              {group?.code && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {group.code}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {group?.description || 'Kiosk Điểm Danh & Tự Phục Vụ'}
            </p>
          </div>
        </div>

        {/* Center: Live Digital Clock */}
        <div className="hidden md:flex flex-col items-center">
          <div className="text-xl font-bold font-mono text-white tracking-widest leading-none">
            {currentTime || '--:--:--'}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 capitalize">
            {currentDateStr}
          </div>
        </div>

        {/* Right: Connectivity & Security */}
        <div className="flex items-center gap-2.5">
          {/* Connectivity Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border ${
            isOnline
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
              : 'bg-rose-950/40 text-rose-400 border-rose-800/60'
          }`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
            <span className="hidden sm:inline">{isOnline ? 'Trực tuyến' : 'Mất mạng'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title={soundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Staff Exit Lock Button */}
          <button
            type="button"
            onClick={() => {
              setExitPin('');
              setExitPinError(false);
              setExitModalOpen(true);
            }}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Thoát chế độ Kiosk (Yêu cầu PIN nhân viên)"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Kiosk Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* ====================================================================
            STATE 1: READY (Active Scanning & Immediate Readiness)
            ==================================================================== */}
        {state === 'READY' && (
          <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-5">
            {/* Instruction Title */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Quét mã để điểm danh
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Mở mã QR thành viên trên điện thoại và đưa vào vùng quét trước camera.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInputMode('QR')}
                className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  inputMode === 'QR'
                    ? 'bg-[#2538D9] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Camera QR</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('MANUAL')}
                className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  inputMode === 'MANUAL'
                    ? 'bg-[#2538D9] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Nhập mã / Số ĐT</span>
              </button>
            </div>

            {/* Camera Viewfinder View */}
            {inputMode === 'QR' ? (
              <div className="w-full max-w-md flex flex-col items-center space-y-3">
                <div className="relative w-full aspect-square max-h-[360px] rounded-2xl overflow-hidden bg-black border-2 border-white/20 shadow-2xl flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Static Viewfinder Target Frame (Zero decorative animation) */}
                  <div className="absolute inset-8 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 border-2 border-dashed border-blue-400/70 rounded-2xl relative flex items-center justify-center">
                      {/* 4 Corner Markers */}
                      <span className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-[#2538D9]" />
                      <span className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-[#2538D9]" />
                      <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-[#2538D9]" />
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-[#2538D9]" />
                    </div>
                  </div>

                  {/* Fallback Camera Error / Not active */}
                  {cameraError && (
                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <AlertTriangle className="w-10 h-10 text-amber-400" />
                      <p className="text-xs text-amber-200 leading-relaxed">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => setInputMode('MANUAL')}
                        className="px-4 py-2 rounded-xl bg-[#2538D9] text-white text-xs font-semibold"
                      >
                        Chuyển sang nhập mã thủ công
                      </button>
                    </div>
                  )}
                </div>

                {/* Camera Control Footer */}
                <div className="flex items-center justify-between w-full px-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Máy quét QR & Barcode USB sẵn sàng</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCameraFacing(cameraFacing === 'user' ? 'environment' : 'user')}
                    className="flex items-center gap-1 text-slate-300 hover:text-white transition"
                    title="Đổi camera trước/sau"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Lật camera</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Manual Input / Search Member View */
              <div className="w-full max-w-md bg-[#131A2B] border border-white/10 rounded-2xl p-5 space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualCode.trim()) {
                      processCheckIn(manualCode.trim());
                    }
                  }}
                  className="space-y-3"
                >
                  <label className="text-xs font-medium text-slate-300 block">
                    Nhập mã QR, mã thành viên hoặc số điện thoại:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="VD: TR-MEMBER-clx... hoặc 0912345678"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2538D9]"
                    />
                    <button
                      type="submit"
                      disabled={!manualCode.trim()}
                      className="px-5 py-3 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Check-in</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Quick select member list */}
                {members.length > 0 && (
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Hoặc chọn nhanh tên học viên ({members.length}):</span>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tìm tên thành viên..."
                        value={manualSearchQuery}
                        onChange={(e) => setManualSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {filteredMembers.slice(0, 10).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => processCheckIn(m.id)}
                          className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-blue-600/20 text-xs text-slate-200 hover:text-white flex items-center justify-between transition cursor-pointer"
                        >
                          <span className="font-medium">{m.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{m.phone || m.id.slice(-6)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            STATE 2: VERIFYING (Fast progress indicator, camera locked)
            ==================================================================== */}
        {state === 'VERIFYING' && (
          <div className="w-full max-w-md mx-auto bg-[#131A2B] border border-white/10 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 border-3 border-[#2538D9] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Đang xác thực thông tin...</h3>
              <p className="text-xs text-slate-400">
                Kiểm tra mã thành viên, lịch hoạt động và công nợ tại địa điểm.
              </p>
            </div>
          </div>
        )}

        {/* ====================================================================
            STATE 3: SUCCESS (Attendance Confirmed, Dues Status Checked)
            ==================================================================== */}
        {state === 'SUCCESS' && result && (
          <div className="w-full max-w-lg mx-auto bg-[#131A2B] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl">
            {/* Top Success Banner */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-emerald-400 block">
                  {result.alreadyCheckedIn ? 'ĐÃ ĐIỂM DANH TRƯỚC ĐÓ' : 'ĐIỂM DANH THÀNH CÔNG'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {result.member?.name}
                </h3>
              </div>
            </div>

            {/* Session & Activity Details */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Hoạt động / Ca:</span>
                <span className="font-semibold text-white">{result.session?.title}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Khung giờ:</span>
                <span className="font-mono text-slate-300">{result.session?.timeWindow}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Giờ ghi nhận:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {result.attendance?.time || currentTime}
                </span>
              </div>
            </div>

            {/* Financial Dues Evaluation */}
            {result.feeStatus?.hasDue ? (
              /* Case B: Has Outstanding Dues */
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Khoản thu chưa hoàn tất</span>
                  </span>
                  <span className="text-[11px] font-mono text-amber-200">
                    Mã: {result.feeStatus.paymentCode}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-slate-300">Còn thiếu:</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {formatVND(result.feeStatus.remainingDue || 0)}
                  </span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleOpenPaymentScreen}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Quét VietQR đóng ngay</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetToReady}
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Để sau / Hoàn tất
                  </button>
                </div>
              </div>
            ) : (
              /* Case A: Clean! No dues */
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Bạn không còn khoản nợ nào cho hoạt động này.</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400">Đã đóng đủ ✓</span>
              </div>
            )}

            {/* Auto reset footer */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Tự động trở về màn hình chờ sau:</span>
              <button
                type="button"
                onClick={resetToReady}
                className="font-mono text-blue-400 hover:underline font-bold"
              >
                {autoResetCountdown}s (Trở về ngay)
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            STATE 4: SHOW_PAYMENT (VietQR Dynamic Payment Modal/Screen)
            ==================================================================== */}
        {state === 'SHOW_PAYMENT' && result?.feeStatus && (
          <div className="w-full max-w-lg mx-auto bg-[#131A2B] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Thanh Toán VietQR Napas 24/7</h3>
                <p className="text-xs text-slate-400">
                  {result.member?.name} • {result.feeStatus.invoiceTitle || 'Khoản thu hoạt động'}
                </p>
              </div>
              <button
                type="button"
                onClick={resetToReady}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Image Display */}
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center space-y-2">
              {result.feeStatus.vietQrUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={result.feeStatus.vietQrUrl}
                  alt="VietQR Payment Code"
                  className="w-full max-w-[260px] aspect-square object-contain mx-auto"
                />
              ) : (
                <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                  <QrCode className="w-12 h-12 mb-2 text-slate-300" />
                  <span>Không thể tạo mã QR ngân hàng. Vui lòng chuyển khoản theo thông tin bên dưới.</span>
                </div>
              )}

              <div className="text-center pt-1">
                <span className="text-[11px] text-slate-600 block">Số tiền thanh toán:</span>
                <span className="text-2xl font-black text-[#2538D9] font-mono">
                  {formatVND(result.feeStatus.remainingDue || 0)}
                </span>
              </div>
            </div>

            {/* Bank Transfer Details with 1-Click Copy */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ngân hàng thụ hưởng:</span>
                <span className="font-semibold text-white">{result.feeStatus.bankId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Số tài khoản:</span>
                <span className="font-mono font-bold text-white">{result.feeStatus.bankAccountNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Chủ tài khoản:</span>
                <span className="font-semibold text-slate-200">{result.feeStatus.bankAccountName}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <span className="text-slate-400">Nội dung chuyển khoản:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
                  <span>{result.feeStatus.paymentCode}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (result.feeStatus?.paymentCode) {
                        navigator.clipboard.writeText(result.feeStatus.paymentCode);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }
                    }}
                    className="p-1 hover:text-white"
                    title="Sao chép mã"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Polling indicator & Actions */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Đang tự động chờ tín hiệu ngân hàng Napas 24/7...</span>
                </span>
                <span className="text-[10px] text-blue-300 font-mono">Live</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (result.feeStatus?.invoiceId) {
                      startPaymentPolling(result.feeStatus.invoiceId);
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition"
                >
                  Tôi đã chuyển • Kiểm tra ngay
                </button>

                <button
                  type="button"
                  onClick={resetToReady}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-medium transition"
                >
                  Để sau
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            STATE 5: PAYMENT_CONFIRMED (Ting! Paid Successfully)
            ==================================================================== */}
        {state === 'PAYMENT_CONFIRMED' && (
          <div className="w-full max-w-md mx-auto bg-[#131A2B] border border-emerald-500/40 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                ⚡ TING! ĐỐI SOÁT THÀNH CÔNG
              </span>
              <h3 className="text-2xl font-black text-white">Đã nhận học phí đủ!</h3>
              <p className="text-xs text-slate-300">
                Giao dịch của <strong>{result?.member?.name}</strong> đã được ngân hàng xác nhận hoàn tất.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-400 font-mono">
              Mã đối soát: {result?.feeStatus?.paymentCode} • Trạng thái: ĐÃ ĐÓNG ĐỦ ✓
            </div>

            <div className="pt-2 text-xs text-slate-400">
              Tự động trở về sau: <strong>{autoResetCountdown}s</strong>
            </div>
          </div>
        )}

        {/* ====================================================================
            STATE 6: ERROR (Space mismatch, ineligible, or network error)
            ==================================================================== */}
        {state === 'ERROR' && (
          <div className="w-full max-w-md mx-auto bg-[#131A2B] border border-rose-500/30 rounded-2xl p-7 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">Không thể điểm danh</h3>
              <p className="text-xs text-rose-300 leading-relaxed max-w-sm mx-auto">
                {result?.errorMessage || 'Mã không hợp lệ hoặc đã xảy ra sự cố.'}
              </p>
            </div>

            {/* Venue Help / Support Hotline */}
            {group?.supportContact && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 flex items-center justify-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                <span>Liên hệ hỗ trợ: <strong>{group.supportContact}</strong></span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={resetToReady}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold transition"
              >
                Thử lại ngay
              </button>
            </div>

            <div className="text-[11px] text-slate-500">
              Tự động trở về sau: {autoResetCountdown}s
            </div>
          </div>
        )}
      </main>

      {/* Staff PIN Security Modal to prevent unauthorized exit */}
      <Dialog
        open={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#131A2B',
              color: '#FFFFFF',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              maxWidth: '360px',
              width: '100%',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700, pb: 1 }}>
          Xác thực Quản trị viên
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <p className="text-xs text-slate-400 mb-3">
            Nhập mã PIN bảo mật của quản trị viên để thoát chế độ Kiosk:
          </p>
          <input
            type="password"
            autoFocus
            maxLength={6}
            placeholder="Mã PIN (Mặc định: 1234)"
            value={exitPin}
            onChange={(e) => {
              setExitPin(e.target.value);
              setExitPinError(false);
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/20 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-[#2538D9]"
          />
          {exitPinError && (
            <p className="text-xs text-rose-400 mt-2 font-medium text-center">
              Mã PIN không chính xác. Vui lòng thử lại.
            </p>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setExitModalOpen(false)}
            sx={{ color: '#94A3B8', fontSize: '0.75rem', textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleExitKiosk}
            variant="contained"
            sx={{
              bgcolor: '#2538D9',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '0.5rem',
            }}
          >
            Xác nhận thoát
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
