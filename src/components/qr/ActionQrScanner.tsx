'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import {
  Camera,
  RotateCw,
  Flashlight,
  FlashlightOff,
  Keyboard,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  CalendarCheck,
  Receipt,
  Users2,
  Clock,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { ResolvedAction } from '@/lib/qr/actionEngine';

interface ActionQrScannerProps {
  onResolved?: (action: ResolvedAction) => void;
  autoRedirect?: boolean;
}

export function ActionQrScanner({
  onResolved,
  autoRedirect = true,
}: ActionQrScannerProps) {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanner status
  const [status, setStatus] = useState<
    'IDLE' | 'SCANNING' | 'VERIFYING' | 'RESOLVED' | 'INVALID'
  >('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('Đang mở camera quét mã...');
  const [resolvedResult, setResolvedResult] = useState<ResolvedAction | null>(null);

  // Manual fallback input
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isVerifyingManual, setIsVerifyingManual] = useState(false);

  // 1. Play subtle audio chime on detection
  const playChime = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // 2. Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setStatus('SCANNING');
    setStatusMessage('Đưa mã QR hành động trên Kiosk / lớp học vào giữa khung');

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Thiết bị hoặc trình duyệt không hỗ trợ truy cập Camera.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);

        // Check torch capabilities
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = track.getCapabilities?.() as unknown as { torch?: boolean };
          if (capabilities && 'torch' in capabilities) {
            setHasTorch(Boolean(capabilities.torch));
          }
        }
      }
    } catch (err: unknown) {
      console.warn('Camera start error:', err);
      const msg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Bạn đã từ chối quyền truy cập Camera. Vui lòng cho phép quyền Camera hoặc sử dụng mã dự phòng.'
          : 'Không thể khởi động Camera. Vui lòng nhập mã hành động thủ công bên dưới.';
      setCameraError(msg);
      setCameraActive(false);
      setShowManualInput(true);
      setStatus('IDLE');
    }
  }, [cameraFacing]);

  // 3. Stop Camera
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // 4. Toggle Torch (Flashlight)
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextTorch = !torchOn;
        await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setTorchOn(nextTorch);
      } catch {
        // Torch failed or unsupported
      }
    }
  };

  // 5. Toggle Camera facing mode (front / back)
  const toggleFacingMode = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // 6. Resolve code with Backend Resolver API
  const handleVerifyCode = useCallback(
    async (code: string) => {
      if (status === 'VERIFYING') return;

      setStatus('VERIFYING');
      setStatusMessage('Đang xác minh mã hành động với máy chủ...');

      try {
        const res = await fetch('/api/qr/actions/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code.trim() }),
        });

        const data = await res.json();

        if (data.success && data.data) {
          const actionData: ResolvedAction = data.data;
          playChime();
          setResolvedResult(actionData);
          setStatus('RESOLVED');
          setStatusMessage(`Nhận diện: ${actionData.title}`);

          if (onResolved) {
            onResolved(actionData);
          }

          if (autoRedirect && actionData.destinationUrl) {
            setTimeout(() => {
              stopCamera();
              router.push(actionData.destinationUrl);
            }, 1200);
          }
        } else {
          setStatus('INVALID');
          setStatusMessage(data.error || 'Mã QR không hợp lệ hoặc đã hết hạn');
        }
      } catch (err: unknown) {
        setStatus('INVALID');
        setStatusMessage('Lỗi kết nối máy chủ. Vui lòng thử lại.');
      }
    },
    [status, playChime, onResolved, autoRedirect, stopCamera, router]
  );

  // 7. Continuous Scan Loop using requestAnimationFrame + jsQR
  useEffect(() => {
    let active = true;

    const scanFrame = () => {
      if (!active) return;

      if (
        status === 'SCANNING' &&
        videoRef.current &&
        canvasRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (qrCode && qrCode.data) {
            handleVerifyCode(qrCode.data);
            return;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    if (cameraActive && status === 'SCANNING') {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, status, handleVerifyCode]);

  // Start on mount and cleanup on unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Handle Manual Code Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setIsVerifyingManual(true);
    handleVerifyCode(manualCode.trim()).finally(() => {
      setIsVerifyingManual(false);
    });
  };

  // Reset scanner to scan another code
  const handleReset = () => {
    setResolvedResult(null);
    setStatus('SCANNING');
    setStatusMessage('Đưa mã QR hành động trên Kiosk / lớp học vào giữa khung');
  };

  // Icon mapping for action types
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'ATTENDANCE':
        return <CalendarCheck className="w-6 h-6 text-emerald-600" />;
      case 'PAYMENT':
        return <Receipt className="w-6 h-6 text-[#2538D9]" />;
      case 'JOIN_SPACE':
      case 'JOIN_GROUP':
        return <Users2 className="w-6 h-6 text-indigo-600" />;
      case 'SHIFT_REGISTER':
      case 'SHIFT_CHECK_IN':
      case 'SHIFT_CHECK_OUT':
        return <Clock className="w-6 h-6 text-amber-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#2538D9]" />;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto font-sans space-y-4">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Scanner Viewport Card */}
      <div className="relative rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
        {/* Live Camera Video */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full aspect-[4/3] sm:aspect-square object-cover transition-opacity duration-300 ${
            cameraActive ? 'opacity-100' : 'opacity-20'
          }`}
        />

        {/* Viewfinder Reticle Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-between p-5 pointer-events-none">
          {/* Top Camera Controls Bar */}
          <div className="w-full flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Camera sau</span>
            </div>

            <div className="flex items-center gap-2">
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  title="Bật/Tắt đèn Flash"
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    torchOn
                      ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/30'
                      : 'bg-black/60 text-white border border-white/10 hover:bg-black/80'
                  }`}
                >
                  {torchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
                </button>
              )}

              <button
                type="button"
                onClick={toggleFacingMode}
                title="Đổi camera trước/sau"
                className="w-9 h-9 rounded-full bg-black/60 text-white border border-white/10 flex items-center justify-center hover:bg-black/80 transition-all"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Target Square with Laser Line */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-white/40 rounded-3xl flex items-center justify-center overflow-hidden">
            {/* Viewfinder Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#2538D9] rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#2538D9] rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#2538D9] rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#2538D9] rounded-br-2xl" />

            {/* Scanning Laser Beam */}
            {status === 'SCANNING' && (
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_#3b82f6] animate-pulse" />
            )}

            {/* Verifying Spinner */}
            {status === 'VERIFYING' && (
              <div className="p-4 rounded-2xl bg-black/80 backdrop-blur-md flex flex-col items-center gap-2 pointer-events-auto">
                <CircularProgress size={32} sx={{ color: '#2538D9' }} />
                <span className="text-[11px] font-bold text-white">Đang giải mã...</span>
              </div>
            )}
          </div>

          {/* Status Capsule Indicator */}
          <div className="w-full flex justify-center pointer-events-auto">
            <div
              className={`px-4 py-2 rounded-2xl backdrop-blur-md text-xs font-semibold text-center transition-all max-w-sm ${
                status === 'RESOLVED'
                  ? 'bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/30'
                  : status === 'INVALID'
                  ? 'bg-rose-500/90 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-black/70 text-slate-200 border border-white/10'
              }`}
            >
              {statusMessage}
            </div>
          </div>
        </div>

        {/* Action Recognition Modal / Overlay (When resolved) */}
        {status === 'RESOLVED' && resolvedResult && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md p-6 flex flex-col justify-between text-white z-20 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã Nhận Diện Hành Động</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {resolvedResult.shortCode}
                </span>
              </div>

              {/* Action Title & Space */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    {getActionIcon(resolvedResult.actionType)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-white leading-snug">
                      {resolvedResult.title}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{resolvedResult.groupName}</span>
                    </p>
                  </div>
                </div>

                {resolvedResult.description && (
                  <p className="text-xs text-slate-400 pt-2 border-t border-white/10 leading-relaxed">
                    {resolvedResult.description}
                  </p>
                )}
              </div>

              {/* Redirecting Progress */}
              <div className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-blue-300">
                <CircularProgress size={16} sx={{ color: '#60a5fa' }} />
                <span>Đang chuyển hướng tới màn hình xử lý...</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  router.push(resolvedResult.destinationUrl);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-sm shadow-lg shadow-[#2538D9]/40 flex items-center justify-center gap-2 transition"
              >
                <span>Mở ngay bây giờ</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition text-center"
              >
                Quét mã khác
              </button>
            </div>
          </div>
        )}

        {/* Invalid Code Overlay */}
        {status === 'INVALID' && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md p-6 flex flex-col justify-center items-center text-center space-y-4 text-white z-20">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mã QR Không Thể Xác Nhận</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs">{statusMessage}</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition"
              >
                Thử quét lại
              </button>
              <button
                type="button"
                onClick={() => setShowManualInput(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition"
              >
                Nhập mã thủ công
              </button>
            </div>
          </div>
        )}

        {/* Camera Error Message Overlay */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-900/95 p-6 flex flex-col justify-center items-center text-center space-y-4 text-white z-20">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Không thể bật Camera</h4>
              <p className="text-xs text-slate-400 max-w-xs">{cameraError}</p>
            </div>
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2538D9] text-white text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử lại quyền Camera</span>
            </button>
          </div>
        )}
      </div>

      {/* Manual Code Input Option */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-4 shadow-xs">
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#2538D9] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#2538D9]" />
            <span>Không quét được camera? Nhập mã thủ công</span>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-slate-400 transition-transform ${
              showManualInput ? 'rotate-90' : ''
            }`}
          />
        </button>

        {showManualInput && (
          <form onSubmit={handleManualSubmit} className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Nhập mã hiển thị trên Kiosk (ví dụ: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">ACT-8492</span>) hoặc dán đường link:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ví dụ: ACT-8492 hoặc tr_act_..."
                className="flex-1 px-3.5 py-2 text-xs font-mono uppercase bg-[#F8FAFC] dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#2538D9]"
              />
              <button
                type="submit"
                disabled={!manualCode.trim() || isVerifyingManual}
                className="px-4 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                {isVerifyingManual ? (
                  <CircularProgress size={14} sx={{ color: '#fff' }} />
                ) : (
                  <>
                    <span>Xác nhận</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
