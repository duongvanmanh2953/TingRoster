'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatVND } from '@/lib/utils';
import {
  Search,
  Volume2,
  VolumeX,
  CheckCircle2,
  RefreshCw,
  QrCode,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
  Zap,
  Camera
} from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';

interface Member {
  id: string;
  name: string;
  phone?: string | null;
}

interface GroupInfo {
  id: string;
  name: string;
  defaultFee: number;
  bankId: string;
  bankAccountNo: string;
  bankAccountName: string;
}

interface CheckInRecord {
  id: string;
  memberName: string;
  time: string;
  status: 'SUCCESS' | 'EXPIRED' | 'UNPAID';
}

export default function KioskModePage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.groupId as string;

  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([
    { id: '1', memberName: 'Nguyễn Văn A', time: '16:20', status: 'SUCCESS' },
    { id: '2', memberName: 'Trần Thị B', time: '16:15', status: 'SUCCESS' },
    { id: '3', memberName: 'Lê Minh C', time: '16:08', status: 'SUCCESS' },
    { id: '4', memberName: 'Phạm Thị D', time: '15:52', status: 'SUCCESS' },
    { id: '5', memberName: 'Hoàng Văn E', time: '15:40', status: 'SUCCESS' },
  ]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDateStr(
        now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Ting! Chime
  const playTingSound = useCallback(() => {
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

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.15); // E6

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio not supported
    }
  }, [soundEnabled]);

  // Load group info & members
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/kiosk/${groupId}`);
        const data = await res.json();
        if (data.success) {
          setGroup(data.data.group);
          setMembers(data.data.members);
        }
      } catch (err) {
        console.error('Kiosk load error:', err);
      } finally {
        setLoading(false);
      }
    }
    if (groupId) {
      loadData();
    }
  }, [groupId]);

  // Handle instant check-in
  const handleCheckIn = async (member: Member) => {
    setSelectedMember(member);
    setIsSuccessFeedback(true);
    playTingSound();

    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Prepend to recent check-ins
    setRecentCheckIns((prev) => [
      {
        id: String(Date.now()),
        memberName: member.name,
        time: timeStr,
        status: 'SUCCESS',
      },
      ...prev.slice(0, 7),
    ]);

    try {
      // Save attendance to backend
      const today = new Date().toISOString().split('T')[0];
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          date: today,
          memberId: member.id,
          isPresent: true,
          status: 'PRESENT',
          note: 'Check-in qua Kiosk tại sân',
        }),
      });
    } catch (err) {
      console.error('Checkin record error:', err);
    }

    // Auto clear feedback after 3.5s
    setTimeout(() => {
      setIsSuccessFeedback(false);
      setSelectedMember(null);
    }, 3500);
  };

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-[#070A12] text-white flex flex-col justify-between select-none font-sans relative overflow-hidden">
      
      {/* Background neon ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#2538D9]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#06B6D4]/15 blur-[120px] pointer-events-none" />

      {/* Top Header matching Panel 10 */}
      <header className="px-6 py-4 border-b border-[#1A2338] flex items-center justify-between bg-[#0B0F19]/90 backdrop-blur-xl relative z-20">
        
        {/* Left: Club & Court Name */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors"
            title="Thoát Kiosk về Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span>{group?.name || 'CLB Pickleball - Sân 2'}</span>
            </h1>
            <p className="text-[11px] text-slate-400">Kiosk điểm danh tự động 1-chạm</p>
          </div>
        </div>

        {/* Center: Live Time per Panel 10 */}
        <div className="text-center hidden sm:block">
          <div className="text-2xl font-black font-mono text-white tracking-wider">
            {currentTime || '16:24'}
          </div>
          <div className="text-[11px] text-slate-400 capitalize">
            {currentDateStr || 'Hôm nay'}
          </div>
        </div>

        {/* Right: Connection Status & Sound */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Đang kết nối</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-medium transition ${
              soundEnabled
                ? 'bg-white/10 border-white/20 text-indigo-300'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
            title="Bật/Tắt chuông Ting"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Kiosk Content per Panel 10 */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch relative z-10">
        
        {/* Left Column (7 cols): Glowing QR Scan Zone matching Panel 10 */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          
          <div className="bg-[#0B0F19]/90 border border-[#1E2945] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-6 shadow-2xl">
            
            {/* Glowing Neon Box Border per Panel 10 */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl border-2 border-[#00D2FF] bg-[#0A1124] shadow-[0_0_35px_rgba(0,210,255,0.25)] flex flex-col items-center justify-center p-6 relative transition-all">
              
              {/* Corner scanner accents */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#00D2FF] rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#00D2FF] rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#00D2FF] rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#00D2FF] rounded-br-lg" />

              {/* Glowing QR Icon */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#070D1D] border border-[#00D2FF]/40 flex items-center justify-center text-[#00D2FF] shadow-inner mb-4">
                <QrCode className="w-20 h-20 sm:w-28 sm:h-28 stroke-[1.5]" />
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                Quét mã QR để check-in
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Đưa mã QR trên ứng dụng vào vùng quét
              </p>
            </div>

            {/* Success Flash Notification on Check-in */}
            {isSuccessFeedback && selectedMember && (
              <div className="w-full max-w-md p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-200 text-sm font-bold flex items-center justify-between shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-bounce">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-white font-extrabold">{selectedMember.name}</p>
                    <p className="text-xs text-emerald-300">Check-in thành công • Gói hợp lệ</p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-500 text-white px-2.5 py-1 rounded-lg">
                  TING!
                </span>
              </div>
            )}

            {/* Quick Member Search & Check-in simulation */}
            <div className="w-full max-w-md space-y-3">
              <span className="text-xs font-semibold text-slate-400 block">
                Hoặc chọn nhanh thành viên check-in:
              </span>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Gõ tìm tên người chơi..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131A2B] border border-[#1E283D] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00D2FF]"
                />
              </div>

              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pt-1">
                {filtered.slice(0, 6).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleCheckIn(m)}
                    className="px-3 py-1.5 rounded-xl bg-[#131A2B] hover:bg-[#2538D9] border border-[#1E283D] hover:border-[#2538D9] text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span>{m.name}</span>
                    <Check className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (5 cols): "Check-in gần đây" list matching Panel 10 */}
        <div className="lg:col-span-5 bg-[#0B0F19]/90 border border-[#1E2945] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl">
          
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1A2338]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00D2FF]" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Check-in gần đây
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {recentCheckIns.length} lượt
              </span>
            </div>

            {/* List of Recent Check-ins with Avatars and Thành công badge per Panel 10 */}
            <div className="divide-y divide-[#1A2338] mt-3">
              {recentCheckIns.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={item.memberName}
                      size="sm"
                      status="online"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                        {item.memberName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Giờ vào: {item.time}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Thành công
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#1A2338] text-[11px] text-slate-500 text-center">
            Màn hình tự động cập nhật thời gian thực khi có hội viên quét mã
          </div>

        </div>

      </main>

      {/* Footer Note matching Panel 10 */}
      <footer className="py-3 px-6 text-center text-xs text-slate-500 border-t border-[#1A2338] bg-[#070A12] relative z-20">
        Chỉ hiển thị thông tin cần thiết. Bảo mật dữ liệu thành viên.
      </footer>

    </div>
  );
}
