'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatVND, formatDateVN } from '@/lib/utils';
import {
  User,
  Phone,
  GraduationCap,
  CalendarCheck,
  Receipt,
  Copy,
  Check,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode
} from 'lucide-react';
import Link from 'next/link';

interface MemberDetails {
  id: string;
  name: string;
  phone?: string | null;
  parentName?: string | null;
  totalDue: number;
  totalPaid: number;
  remainingDebt: number;
  group: {
    id: string;
    name: string;
    slug: string;
  };
  invoices: Array<{
    id: string;
    title: string;
    paymentCode: string;
    publicToken: string;
    amountDue: number;
    amountPaid: number;
    status: string;
    createdAt: string;
  }>;
  attendances: Array<{
    id: string;
    date: string;
    isPresent: boolean;
    status: string;
  }>;
}

export default function MemberDetailPage() {
  const params = useParams();
  const memberId = params?.id as string;

  const [member, setMember] = useState<MemberDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [aiReminder, setAiReminder] = useState<any>(null);
  const [loadingReminder, setLoadingReminder] = useState(false);

  useEffect(() => {
    fetch(`/api/members/${memberId}/details`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMember(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  const handleCopyLink = (token: string) => {
    if (!member) return;
    const url = `${window.location.origin}/p/${member.group.slug}?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleGenerateSmartReminder = async (invoiceId: string) => {
    setLoadingReminder(true);
    try {
      const res = await fetch('/api/ai/smart-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (data.success) {
        setAiReminder(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReminder(false);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-400 text-xs animate-pulse">Đang tải hồ sơ học viên...</div>;
  }

  if (!member) {
    return <div className="text-center py-24 text-slate-400 text-xs">Không tìm thấy thông tin học viên.</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div>
        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Trở về Danh sách học viên
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xl shadow-md">
              {member.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{member.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Lớp: <strong className="text-emerald-400">{member.group.name}</strong> • Phụ huynh:{' '}
                {member.parentName || 'Chưa cập nhật'} • SĐT: {member.phone || 'Chưa có'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="ting-card p-4 space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Tổng học phí phát sinh</span>
          <span className="text-xl font-extrabold text-white font-mono">{formatVND(member.totalDue)}</span>
        </div>
        <div className="ting-card p-4 space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Đã thanh toán qua VietQR</span>
          <span className="text-xl font-extrabold text-emerald-400 font-mono">{formatVND(member.totalPaid)}</span>
        </div>
        <div className="ting-card p-4 space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Còn nợ học phí</span>
          <span className="text-xl font-extrabold text-rose-400 font-mono">{formatVND(member.remainingDebt)}</span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="ting-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E283D] pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Lịch sử hóa đơn học phí ({member.invoices.length})</span>
          </h2>
        </div>

        {member.invoices.length > 0 ? (
          <div className="space-y-3">
            {member.invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 bg-[#111726] rounded-xl border border-[#1E283D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white">{inv.title}</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">[{inv.paymentCode}]</span>
                    {inv.status === 'PAID' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        Đã đóng
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/25">
                        Chưa đóng ({formatVND(inv.amountDue - inv.amountPaid)})
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Ngày tạo: {formatDateVN(inv.createdAt)}</p>
                </div>

                <div className="flex items-center gap-2">
                  {inv.status !== 'PAID' && (
                    <button
                      onClick={() => handleGenerateSmartReminder(inv.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Nhắc Zalo AI
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyLink(inv.publicToken)}
                    className="p-2 border border-[#1E283D] bg-[#111726] rounded-lg hover:bg-[#182136] text-slate-400 hover:text-white transition"
                    title="Sao chép link VietQR gửi phụ huynh"
                  >
                    {copiedToken === inv.publicToken ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">Chưa có hóa đơn nào cho học viên này.</p>
        )}
      </div>

      {/* Attendance History */}
      <div className="ting-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-emerald-400" />
          <span>Lịch sử điểm danh 30 buổi gần nhất ({member.attendances.length})</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {member.attendances.map((att) => (
            <div
              key={att.id}
              className={`p-2.5 rounded-xl border text-center text-xs font-semibold ${
                att.isPresent
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
              }`}
            >
              <span>{formatDateVN(att.date)}</span>
              <span className="block text-[10px] mt-0.5 font-bold">
                {att.isPresent ? '✓ Có mặt' : '✕ Vắng'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Smart Reminder Modal */}
      {aiReminder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1626] border border-[#1E283D] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#1E283D] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">AI Soạn Tin Nhắn Nhắc Học Phí</h3>
              </div>
              <button onClick={() => setAiReminder(null)} className="text-slate-400 text-sm">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Chọn phong cách phù hợp và bấm nút sao chép để gửi ngay qua Zalo cho phụ huynh:
            </p>

            <div className="space-y-3">
              {/* Tone 1: Gentle */}
              <div className="p-3 bg-[#111726] border border-[#1E283D] rounded-xl space-y-2">
                <span className="text-xs font-bold text-emerald-400 block">1. Phong cách Nhẹ nhàng & Tình cảm:</span>
                <p className="text-xs text-slate-300 whitespace-pre-line">{aiReminder.templates.gentle}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiReminder.templates.gentle);
                    alert('Đã sao chép tin nhắn!');
                  }}
                  className="px-3 py-1 bg-emerald-500 text-[#080C14] rounded-lg text-xs font-bold hover:bg-emerald-600 transition"
                >
                  Sao chép tin nhắn này
                </button>
              </div>

              {/* Tone 2: Neutral */}
              <div className="p-3 bg-[#111726] border border-[#1E283D] rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-300 block">2. Phong cách Tiêu chuẩn & Rõ ràng:</span>
                <p className="text-xs text-slate-300 whitespace-pre-line">{aiReminder.templates.neutral}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiReminder.templates.neutral);
                    alert('Đã sao chép tin nhắn!');
                  }}
                  className="px-3 py-1 bg-[#162033] border border-[#1E283D] rounded-lg text-xs font-bold text-slate-200 hover:bg-[#1E2B45] transition"
                >
                  Sao chép tin nhắn này
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
