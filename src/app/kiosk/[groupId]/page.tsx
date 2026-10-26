'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { formatVND } from '@/lib/utils';
import { generateVietQRUrl } from '@/lib/providers/vietqr';
import {
  Search,
  Volume2,
  VolumeX,
  CheckCircle2,
  RefreshCw,
  QrCode,
  ArrowLeft,
  Smartphone,
} from 'lucide-react';
import Image from 'next/image';

interface Member {
  id: string;
  name: string;
}

interface GroupInfo {
  id: string;
  name: string;
  defaultFee: number;
  bankId: string;
  bankAccountNo: string;
  bankAccountName: string;
}

interface KioskInvoice {
  id: string;
  publicToken: string;
  paymentCode: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  memberName: string;
}

export default function KioskModePage() {
  const params = useParams();
  const groupId = params?.groupId as string;

  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<KioskInvoice | null>(null);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play pleasant 'Ting' chime using Web Audio API (works without external mp3 asset)
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
      // Audio not supported or blocked
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

  // Handle selecting player and creating/fetching active session invoice
  const handleSelectMember = async (member: Member) => {
    setSelectedMember(member);
    setIsPaidSuccess(false);
    try {
      const res = await fetch(`/api/kiosk/${groupId}/create-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveInvoice(data.data);
      }
    } catch (err) {
      console.error('Failed to create kiosk ticket:', err);
    }
  };

  // Poll for payment status while invoice is active
  useEffect(() => {
    if (!activeInvoice || isPaidSuccess) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/public/invoices/${activeInvoice.publicToken}`);
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.status === 'PAID' || data.data.status === 'OVERPAID') {
            setIsPaidSuccess(true);
            playTingSound();

            // Auto reset back to member list after 5 seconds
            setTimeout(() => {
              setSelectedMember(null);
              setActiveInvoice(null);
              setIsPaidSuccess(false);
            }, 5000);
          }
        }
      } catch {
        // Poll error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeInvoice, isPaidSuccess, playTingSound]);

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col select-none">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg">
            T
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              {group?.name || 'TingRoster Kiosk'}
            </h1>
            <p className="text-xs text-slate-400">Điểm danh & Thu phí tự động tại sân</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 transition ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-indigo-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Bật/Tắt âm thanh thông báo"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="hidden sm:inline text-xs">
              {soundEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Kiosk Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Player Selection */}
        <section className="md:col-span-6 lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col h-[calc(100vh-140px)]">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <span>Chọn tên thành viên / người chơi</span>
          </h2>

          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Gõ tìm tên người chơi..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="text-center py-12 text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                Đang tải danh sách thành viên...
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className={`w-full p-4 rounded-2xl text-left font-semibold text-base transition flex items-center justify-between border ${
                    selectedMember?.id === member.id
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{member.name}</span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-black/30 font-mono">
                    {formatVND(group?.defaultFee || 50000)}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8 text-sm">
                Không tìm thấy thành viên phù hợp
              </p>
            )}
          </div>
        </section>

        {/* Right Column: QR Code & Status */}
        <section className="md:col-span-6 lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[500px]">
          {isPaidSuccess ? (
            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500">
                <CheckCircle2 className="w-16 h-16 animate-bounce" />
              </div>
              <h3 className="text-2xl font-black text-emerald-400">TING! ĐÃ NHẬN TIỀN THÀNH CÔNG</h3>
              <p className="text-lg text-slate-200">
                Thành viên: <span className="font-bold text-white">{selectedMember?.name}</span>
              </p>
              <p className="text-sm text-emerald-300 font-mono">
                Số tiền: {formatVND(activeInvoice?.amountDue || group?.defaultFee || 0)}
              </p>
              <p className="text-xs text-slate-500 pt-4">Tự động quay lại danh sách sau vài giây...</p>
            </div>
          ) : activeInvoice && group ? (
            <div className="w-full max-w-md text-center space-y-6">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
                  Quét VietQR để thanh toán
                </span>
                <h3 className="text-xl font-bold text-white">{selectedMember?.name}</h3>
                <p className="text-2xl font-extrabold text-amber-400 font-mono">
                  {formatVND(activeInvoice.amountDue)}
                </p>
              </div>

              {/* QR Image Box */}
              <div className="p-4 bg-white rounded-3xl shadow-2xl inline-block mx-auto border-4 border-slate-800">
                <Image
                  src={generateVietQRUrl({
                    bankId: group.bankId,
                    accountNo: group.bankAccountNo,
                    accountName: group.bankAccountName,
                    amount: activeInvoice.amountDue,
                    paymentCode: activeInvoice.paymentCode,
                  })}
                  alt="VietQR Kiosk"
                  width={280}
                  height={280}
                  priority
                  unoptimized
                  className="rounded-xl"
                />
              </div>

              {/* Transfer Code Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center text-left">
                <div>
                  <span className="text-xs text-slate-400 block">Nội dung chuyển khoản</span>
                  <span className="text-lg font-bold font-mono text-indigo-400">
                    {activeInvoice.paymentCode}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{group.bankId}</span>
                  <span className="text-xs font-mono text-slate-300">{group.bankAccountNo}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 animate-pulse">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Đang chờ nhận tiền... Hệ thống tự động xác nhận</span>
              </div>

              <button
                onClick={() => {
                  setSelectedMember(null);
                  setActiveInvoice(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Chọn lại thành viên khác
              </button>
            </div>
          ) : (
            <div className="text-center py-16 space-y-4 text-slate-500">
              <QrCode className="w-16 h-16 mx-auto opacity-30 text-indigo-400" />
              <p className="text-base text-slate-400">
                Chạm vào tên thành viên bên trái để hiển thị mã VietQR thanh toán
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
