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
} from 'lucide-react';
import Link from 'next/link';

export default function MemberDetailPage() {
  const params = useParams();
  const memberId = params?.id as string;

  const [member, setMember] = useState<any>(null);
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
    return <div className="text-center py-24 text-slate-400">Đang tải hồ sơ học viên...</div>;
  }

  if (!member) {
    return <div className="text-center py-24 text-slate-500">Không tìm thấy thông tin học viên.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <Link
          href={`/groups/${member.group.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Lớp {member.group.name}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {member.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{member.name}</h1>
              <p className="text-xs text-slate-500">
                Lớp: <strong className="text-slate-700">{member.group.name}</strong> • Phụ huynh:{' '}
                {member.parentName || 'Chưa cập nhật'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Tổng tiền phải đóng</span>
          <span className="text-xl font-black text-slate-900 font-mono">{formatVND(member.totalDue)}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Đã thanh toán thực tế</span>
          <span className="text-xl font-black text-emerald-600 font-mono">{formatVND(member.totalPaid)}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Còn nợ học phí</span>
          <span className="text-xl font-black text-rose-600 font-mono">{formatVND(member.remainingDebt)}</span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <span>Lịch sử hóa đơn học phí ({member.invoices.length})</span>
          </h2>
        </div>

        {member.invoices.length > 0 ? (
          <div className="space-y-3">
            {member.invoices.map((inv: any) => (
              <div
                key={inv.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{inv.title}</span>
                    <span className="font-mono text-xs font-bold text-indigo-600">[{inv.paymentCode}]</span>
                    {inv.status === 'PAID' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Đã đóng
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Chưa đóng ({formatVND(inv.amountDue - inv.amountPaid)})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Ngày tạo: {formatDateVN(inv.createdAt)}</p>
                </div>

                <div className="flex items-center gap-2">
                  {inv.status !== 'PAID' && (
                    <button
                      onClick={() => handleGenerateSmartReminder(inv.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-100 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Nhắc Zalo AI
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyLink(inv.publicToken)}
                    className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 text-slate-600 transition"
                    title="Sao chép link VietQR gửi phụ huynh"
                  >
                    {copiedToken === inv.publicToken ? (
                      <Check className="w-4 h-4 text-emerald-600" />
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-emerald-600" />
          <span>Lịch sử điểm danh 30 buổi gần nhất ({member.attendances.length})</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {member.attendances.map((att: any) => (
            <div
              key={att.id}
              className={`p-2.5 rounded-xl border text-center text-xs font-semibold ${
                att.isPresent
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span>{formatDateVN(att.date)}</span>
              <span className="block text-[10px] mt-0.5">
                {att.isPresent ? '✓ Có mặt' : '✕ Vắng'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Smart Reminder Modal */}
      {aiReminder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">AI Soạn Tin Nhắn Nhắc Học Phí</h3>
              </div>
              <button onClick={() => setAiReminder(null)} className="text-slate-400 text-lg">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Chọn phong cách phù hợp và bấm nút sao chép để gửi ngay qua Zalo cho phụ huynh:
            </p>

            <div className="space-y-3">
              {/* Tone 1: Gentle */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-indigo-700 block">1. Phong cách Nhẹ nhàng & Tình cảm:</span>
                <p className="text-xs text-slate-700 whitespace-pre-line">{aiReminder.templates.gentle}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiReminder.templates.gentle);
                    alert('Đã chép nội dung tin nhắn!');
                  }}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Sao chép tin nhắn này
                </button>
              </div>

              {/* Tone 2: Neutral */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-700 block">2. Phong cách Tiêu chuẩn & Rõ ràng:</span>
                <p className="text-xs text-slate-700 whitespace-pre-line">{aiReminder.templates.neutral}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiReminder.templates.neutral);
                    alert('Đã chép nội dung tin nhắn!');
                  }}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
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
