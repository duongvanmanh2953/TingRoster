'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Camera,
  UserCheck,
  Building2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  AlertCircle,
  CalendarCheck,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { ActionQrScanner } from '@/components/qr/ActionQrScanner';

interface JoinedSpace {
  memberId: string;
  groupId: string;
  name: string;
  slug: string;
  groupType: string;
  defaultFee: number;
  billingCycle: string;
}

interface PortalData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  joinedGroups: JoinedSpace[];
}

export default function StudentQrPage() {
  const [activeTab, setActiveTab] = useState<'SCAN' | 'PERSONAL'>('SCAN');
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [selectedSpaceIndex, setSelectedSpaceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(60);

  // Load student dashboard data for personal QR tab
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portal/dashboard');
      const json = await res.json();
      if (json.success && json.data) {
        setPortalData(json.data);
      }
    } catch (err) {
      console.warn('Fetch student QR data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Countdown timer for personal code refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const activeSpace =
    portalData?.joinedGroups && portalData.joinedGroups.length > 0
      ? portalData.joinedGroups[selectedSpaceIndex] || portalData.joinedGroups[0]
      : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Segmented Controls: Quét QR vs Mã Cá Nhân */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('SCAN')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SCAN'
                ? 'bg-[#2538D9] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Quét QR Hành Động</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PERSONAL')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PERSONAL'
                ? 'bg-[#2538D9] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Mã QR Cá Nhân</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SCAN ACTION QR (PRIMARY FLOW) */}
      {activeTab === 'SCAN' && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Quét Mã QR Tại Kiosk & Lớp Học
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Dùng điện thoại quét mã QR hiển thị tại Kiosk hoặc do giáo viên cung cấp để tự động điểm danh, gửi yêu cầu tham gia hoặc mở thanh toán.
            </p>
          </div>

          {/* Interactive Camera Scanner Component */}
          <ActionQrScanner />
        </div>
      )}

      {/* TAB 2: PERSONAL MEMBER QR (SECONDARY / IDENTITY FLOW) */}
      {activeTab === 'PERSONAL' && (
        <div className="space-y-5 animate-fade-in">
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Mã Định Danh Thành Viên
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Dùng mã cá nhân này nếu Kiosk hoặc nhân viên yêu cầu nhận diện thành viên.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
              <div className="w-8 h-8 border-3 border-[#2538D9] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Đang tải hồ sơ thành viên...</p>
            </div>
          ) : !activeSpace ? (
            /* Friendly Onboarding State instead of blocking error */
            <div className="p-8 text-center bg-white dark:bg-[#111726] rounded-3xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Bạn Chưa Tham Gia Không Gian Nào
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Đừng lo lắng! Bạn có thể quét mã QR lời mời hoặc nhập mã tham gia do giáo viên, chủ phòng trọ hoặc chủ sân cung cấp để bắt đầu.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('SCAN')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>Quét QR tham gia ngay</span>
                </button>
                <Link
                  href="/portal/join"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center"
                >
                  Nhập mã mời thủ công
                </Link>
              </div>
            </div>
          ) : (
            /* Member Card */
            <div className="space-y-4">
              {/* Space Selector if member belongs to multiple spaces */}
              {portalData && portalData.joinedGroups.length > 1 && (
                <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-4 h-4 text-[#2538D9] flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      Chọn Không gian:
                    </span>
                  </div>

                  <select
                    value={selectedSpaceIndex}
                    onChange={(e) => setSelectedSpaceIndex(Number(e.target.value))}
                    className="text-xs font-bold bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-[#2538D9]"
                  >
                    {portalData.joinedGroups.map((group, idx) => (
                      <option key={group.groupId} value={idx}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Main Personal QR Card */}
              <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
                <div className="flex items-center justify-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <Avatar name={portalData?.user.name || 'Học viên'} size="md" />
                  <div className="text-left">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {portalData?.user.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeSpace.name}
                    </p>
                  </div>
                </div>

                {/* QR Image */}
                <div className="inline-block p-4 rounded-3xl bg-white border border-slate-200 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                      `TR-MEMBER-${activeSpace.memberId}`
                    )}&margin=10&format=svg`}
                    alt="Mã QR cá nhân"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
                  />
                </div>

                {/* Code & Copy */}
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    TR-MEMBER-{activeSpace.memberId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(`TR-MEMBER-${activeSpace.memberId}`)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] text-xs font-bold hover:bg-blue-100 transition flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Mã làm mới sau <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{refreshCountdown}s</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
